/* ===== render.js — 盤面、連線動畫、特效與側欄清單的繪製 =====
 *
 * 這一層只負責「把狀態畫出來」，不判斷任何規則：
 * 該不該消、加幾分一律是 rules.js（單機）或伺服器（線上）算好之後才送進來。
 *
 * 座標系
 * ------
 * 畫面上的 .board 是「含外圈」的 W×H 網格（W = cols+2、H = rows+2），
 * 外圈永遠空著，連線路徑才畫得到盤面外面。連線用的 SVG 用同一個座標系
 * （viewBox = "0 0 W H"，1 單位 = 1 格），所以路徑和格子一定對得準，
 * 不管裝置把盤面等比縮到多大都一樣。
 */
(function (w) {
  'use strict';

  var boardEl = null, lineEl = null, fxEl = null;
  var W = 0, H = 0, cols = 0, rows = 0;
  var theme = 'fruits', palette = [];
  var tiles = {};          // cellIndex -> button 元素
  var lastGrid = null;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function cx(i) { return (i % W) + 0.5; }
  function cy(i) { return Math.floor(i / W) + 0.5; }

  /* ---------------------------------------------------------- 盤面 */

  /**
   * 依快照建立整張盤面。換關卡或重開一局才會呼叫。
   * @param {{board:HTMLElement, line:SVGElement, fx:HTMLElement}} hosts
   */
  function mount(hosts, snap, onPick) {
    boardEl = hosts.board; lineEl = hosts.line; fxEl = hosts.fx;
    W = snap.W; H = snap.H; cols = snap.cols; rows = snap.rows;
    theme = snap.theme || 'fruits';
    palette = (snap.palette || []).slice();
    boardEl.style.setProperty('--bw', W);
    boardEl.style.setProperty('--bh', H);
    lineEl.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    lineEl.setAttribute('preserveAspectRatio', 'none');
    lineEl.innerHTML = '';
    fxEl.innerHTML = '';
    boardEl.innerHTML = '';
    tiles = {};

    var frag = document.createDocumentFragment();
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var i = y * W + x;
        var pad = (x === 0 || y === 0 || x === W - 1 || y === H - 1);
        var cell = el('div', 'cell' + (pad ? ' pad' : ''));
        cell.dataset.i = i;
        if (!pad) {
          var btn = el('button', 'tile');
          btn.type = 'button';
          btn.dataset.i = i;
          btn.setAttribute('role', 'gridcell');
          btn.addEventListener('click', (function (idx) {
            return function (ev) { ev.preventDefault(); if (onPick) onPick(idx); };
          }(i)));
          cell.appendChild(btn);
          tiles[i] = btn;
        }
        frag.appendChild(cell);
      }
    }
    boardEl.appendChild(frag);
    lastGrid = null;
    sync(snap.grid);
  }

  function tileLabel(i, kind) {
    var x = (i % W), y = Math.floor(i / W);
    return '第 ' + y + ' 列第 ' + x + ' 行，' + (kind ? w.SvgUI.tileName(kind, theme, palette) : '空格');
  }

  /** 把畫面上的磚塊對齊到 grid；只動有變的格子 */
  function sync(grid) {
    for (var i in tiles) {
      if (!Object.prototype.hasOwnProperty.call(tiles, i)) continue;
      var idx = Number(i);
      var kind = grid[idx] || 0;
      var prev = lastGrid ? (lastGrid[idx] || 0) : -1;
      if (kind === prev) continue;
      var btn = tiles[idx];
      btn.classList.remove('sel', 'hint', 'gone', 'shake');
      if (!kind) {
        btn.innerHTML = '';
        btn.hidden = true;
        btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = -1;
      } else {
        btn.hidden = false;
        btn.removeAttribute('aria-hidden');
        btn.tabIndex = 0;
        btn.dataset.kind = kind;
        btn.innerHTML = w.SvgUI.tileSvg(kind, theme, palette) +
          '<span class="tile-name">' + w.SvgUI.tileName(kind, theme, palette) + '</span>';
        btn.setAttribute('aria-label', tileLabel(idx, kind));
        btn.setAttribute('aria-pressed', 'false');
      }
    }
    lastGrid = grid.slice();
  }

  function setSelected(i, on) {
    var b = tiles[i];
    if (!b) return;
    b.classList.toggle('sel', !!on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function clearSelected() {
    for (var i in tiles) {
      if (!Object.prototype.hasOwnProperty.call(tiles, i)) continue;
      tiles[i].classList.remove('sel');
      tiles[i].setAttribute('aria-pressed', 'false');
    }
  }
  function clearHints() {
    for (var i in tiles) {
      if (Object.prototype.hasOwnProperty.call(tiles, i)) tiles[i].classList.remove('hint');
    }
  }
  function markHint(a, b, ms) {
    clearHints();
    [a, b].forEach(function (i) { if (tiles[i]) tiles[i].classList.add('hint'); });
    setTimeout(clearHints, ms || 3500);
  }
  function shake(i) {
    var b = tiles[i];
    if (!b) return;
    b.classList.remove('shake');
    void b.offsetWidth;                       // 強制重排，動畫才會重播
    b.classList.add('shake');
    setTimeout(function () { b.classList.remove('shake'); }, 300);
  }
  function focusTile(i) { if (tiles[i] && !tiles[i].hidden) tiles[i].focus(); }
  function tileAt(i) { return tiles[i] || null; }
  function dims() { return { W: W, H: H, cols: cols, rows: rows, theme: theme, palette: palette.slice() }; }

  /* ---------------------------------------------------------- 連線動畫 */

  /** 把路徑（格子編號陣列）畫成一條會淡出的折線 */
  function drawLink(path) {
    if (!lineEl || !path || path.length < 2) return;
    var pts = path.map(function (i) { return cx(i).toFixed(3) + ',' + cy(i).toFixed(3); }).join(' ');
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML =
      '<polyline class="lk-bg" points="' + pts + '"/>' +
      '<polyline class="lk" points="' + pts + '"/>';
    lineEl.appendChild(g);
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 700);
  }

  /** 消除動畫：先彈一下再消失，動畫結束才真的把磚塊拿掉 */
  function popPair(a, b) {
    [a, b].forEach(function (i) {
      var t = tiles[i];
      if (!t || t.hidden) return;
      t.classList.remove('sel', 'hint');
      t.classList.add('gone');
    });
  }

  /* ---------------------------------------------------------- 特效 */

  function flyScore(i, text, mine) {
    if (!fxEl) return;
    var s = el('div', 'flyscore' + (mine ? '' : ' other'), text);
    s.style.left = (cx(i) / W * 100).toFixed(2) + '%';
    s.style.top = (cy(i) / H * 100).toFixed(2) + '%';
    fxEl.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 950);
  }

  function shout(text) {
    if (!fxEl) return;
    var s = el('div', 'shout', text);
    fxEl.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 1050);
  }

  /* ---------------------------------------------------------- 側欄清單 */

  var SEAT_COLORS = ['#A48FDB', '#79C6AC', '#E89C8B', '#7FB4DA', '#E7C263', '#E88CAA'];
  function seatColor(seat) { return SEAT_COLORS[seat % SEAT_COLORS.length]; }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** 即時排行（側欄）＋窄版浮條共用同一份資料 */
  function rank(host, liveHost, players, myId, order) {
    var rows = players.slice().sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return b.pairs - a.pairs;
    });
    var seatOf = {};
    (order || players.map(function (p) { return p.id; })).forEach(function (id, i) { seatOf[id] = i; });

    host.innerHTML = rows.map(function (p, i) {
      var me = p.id === myId;
      return '<li class="rankrow' + (me ? ' me' : '') + '" style="--who:' + seatColor(seatOf[p.id] || 0) + '">' +
        '<span class="no">' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(p.name) + '</span>' +
        '<span class="sc">' + p.score +
          (p.combo > 1 ? '<small>' + p.combo + ' 連擊</small>' : '<small>' + p.pairs + ' 對</small>') +
        '</span></li>';
    }).join('');

    if (liveHost) {
      liveHost.innerHTML = rows.map(function (p) {
        var me = p.id === myId;
        return '<span class="lchip' + (me ? ' me' : '') + '" style="--who:' + seatColor(seatOf[p.id] || 0) + '">' +
          '<span class="ln">' + esc(p.name) + '</span><i>' + p.score + '</i></span>';
      }).join('');
    }
  }

  function seats(host, members, hostId, myId) {
    host.innerHTML = members.map(function (m, i) {
      var tags = '';
      if (m.host) tags += '<span class="tag host">房主</span>';
      if (m.role === 'spectator') tags += '<span class="tag spec">觀戰</span>';
      else tags += '<span class="tag' + (m.ready ? ' ready' : '') + '">' + (m.ready ? '準備好了' : '等待中') + '</span>';
      if (!m.connected) tags += '<span class="tag off">斷線</span>';
      return '<div class="seatrow" style="--who:' + seatColor(i) + '">' +
        '<span class="nm">' + esc(m.name) + (m.id === myId ? '（你）' : '') + '</span>' + tags + '</div>';
    }).join('') || '<div class="empty">還沒有人在房間裡</div>';
  }

  function results(host, standings, myId, order) {
    var seatOf = {};
    (order || []).forEach(function (id, i) { seatOf[id] = i; });
    host.innerHTML = standings.map(function (r) {
      var me = r.id === myId;
      return '<div class="resrow' + (r.rank === 1 ? ' win' : '') + '" style="--who:' + seatColor(seatOf[r.id] || r.seat || 0) + '">' +
        '<span class="no">' + r.rank + '</span>' +
        '<span class="nm">' + esc(r.name) + (me ? '（你）' : '') +
          '<small>' + r.pairs + ' 對 · 最高 ' + r.bestCombo + ' 連擊 · 連錯 ' + r.misses + ' 次' +
          (r.timeBonus ? ' · 時間 +' + r.timeBonus : '') + '</small></span>' +
        '<span class="sc">' + r.score + '</span></div>';
    }).join('');
  }

  function chat(host, messages, myId) {
    host.innerHTML = messages.map(function (m) {
      if (m.system) return '<div class="msg sys">' + esc(m.text) + '</div>';
      var cls = 'msg' + (m.from === myId ? ' me' : '') + (m.role === 'spectator' ? ' spec' : '');
      return '<div class="' + cls + '"><span class="who">' + esc(m.name) + '</span>' + esc(m.text) + '</div>';
    }).join('');
    host.scrollTop = host.scrollHeight;
  }

  /* ---------------------------------------------------------- 玩法頁示範圖 */

  /** 玩法說明用的三張小圖：0 折、1 折、2 折 */
  function pathDemos(host) {
    var demos = [
      { title: '0 折 · 直線', w: 5, h: 3, a: [1, 1], b: [3, 1], path: [[1, 1], [3, 1]], k: [1, 2] },
      { title: '1 折 · 轉一次', w: 5, h: 4, a: [1, 1], b: [3, 2], path: [[1, 1], [1, 2], [3, 2]], k: [3, 4] },
      { title: '2 折 · 繞出去', w: 5, h: 4, a: [1, 1], b: [3, 1], path: [[1, 1], [1, 0], [3, 0], [3, 1]], k: [5, 6] }
    ];
    host.innerHTML = demos.map(function (d) {
      var cells = '';
      for (var y = 0; y < d.h; y++) {
        for (var x = 0; x < d.w; x++) {
          cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1" rx="0.12" ' +
            'fill="' + ((x + y) % 2 ? '#FFF6E9' : '#FBEEDC') + '" stroke="#EADFC8" stroke-width="0.03"/>';
        }
      }
      /* 兩顆要連的水果 */
      var fruit = function (p, kind) {
        return '<g transform="translate(' + p[0] + ' ' + p[1] + ') scale(0.01)">' +
          '<rect x="8" y="8" width="84" height="84" rx="18" fill="#FFF3F5" stroke="#4A3B55" stroke-width="5"/>' +
          '<g transform="translate(50 52) scale(0.66) translate(-50 -50)">' +
          (w.Themes ? w.Themes.art('fruits', kind).svg : '') + '</g></g>';
      };
      var pts = d.path.map(function (p) { return (p[0] + 0.5) + ',' + (p[1] + 0.5); }).join(' ');
      return '<figure><svg viewBox="0 0 ' + d.w + ' ' + d.h + '" aria-hidden="true">' + cells +
        '<polyline points="' + pts + '" fill="none" stroke="#FFFFFF" stroke-width="0.22" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<polyline points="' + pts + '" fill="none" stroke="#3FAF8B" stroke-width="0.13" stroke-linecap="round" stroke-linejoin="round"/>' +
        fruit(d.a, d.k[0] % 17) + fruit(d.b, d.k[0] % 17) +
        '</svg><figcaption>' + d.title + '</figcaption></figure>';
    }).join('');
  }

  w.Render = {
    mount: mount, sync: sync, dims: dims, tileAt: tileAt, focusTile: focusTile,
    setSelected: setSelected, clearSelected: clearSelected,
    markHint: markHint, clearHints: clearHints, shake: shake,
    drawLink: drawLink, popPair: popPair,
    flyScore: flyScore, shout: shout,
    rank: rank, seats: seats, results: results, chat: chat,
    pathDemos: pathDemos, seatColor: seatColor, esc: esc
  };
}(window));
