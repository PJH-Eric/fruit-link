/* ===== app.js — 畫面流程、單機闖關、線上房間的串接 =====
 *
 * 分工：
 *   rules.js   規則與計分（單機在瀏覽器跑、線上在伺服器跑，同一份程式碼）
 *   render.js  畫面繪製
 *   online.js  Socket.IO 連線
 *   app.js     這一份：把它們接起來，管畫面切換、輸入與設定
 *
 * 線上模式的所有判定都以伺服器為準：這裡只送「我點了哪兩格」，
 * 能不能連、加幾分、那兩格還在不在，一律等伺服器的事件回來才改畫面。
 */
(function (w) {
  'use strict';

  var Rules = w.Rules, RNG = w.RNG, Store = w.Store, Sound = w.Sound;
  var UI = w.SvgUI, R = w.Render, Config = w.GameConfig, Online = w.Online, Themes = w.Themes;

  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------ 全域狀態 */

  var G = {
    mode: 'solo',            // solo | online
    screen: 's-home',
    run: null,               // 單機闖關：{startLevel, level, total, stages:[]}
    state: null,             // Rules 的對局狀態（只有單機會有）
    rng: null,
    view: null,              // 線上：伺服器送來的房間投影
    myId: null,
    joining: false,
    timeOffset: 0,           // 伺服器時間 - 本機時間
    snap: null,              // 目前畫面上的對局快照
    sel: null,               // 已選起來的格子
    mountKey: '',
    unread: 0,
    pane: 'sum',
    ticker: null,
    lastTick: 0,
    pendingLevel: 'easy',
    pendingTheme: 'fruits',
    inviteRole: 'player'
  };

  function nowSrv() { return Date.now() + G.timeOffset; }
  function isOnline() { return G.mode === 'online'; }

  /* ------------------------------------------------------------ 小工具 */

  var toastTimer = null;
  function toast(msg, ms) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, ms || 2600);
  }

  function show(id) {
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    G.screen = id;
    Sound.setTrack(id === 's-game' ? 'game' : 'menu');
    if (Sound.isMusicOn()) Sound.startBgm();
  }

  /* --- 彈窗：遮罩、焦點鎖定、Esc 關閉、關閉後把焦點還回去 --- */
  var modalStack = [];
  function openModal(id, returnTo) {
    var m = $(id);
    m.hidden = false;
    modalStack.push({ id: id, returnTo: returnTo || document.activeElement });
    var focusable = m.querySelector('input,button,select,textarea,[tabindex]');
    if (focusable) focusable.focus();
    UI.repaintAll(m);
  }
  function closeModal(id) {
    var m = $(id);
    if (!m || m.hidden) return;
    m.hidden = true;
    for (var i = modalStack.length - 1; i >= 0; i--) {
      if (modalStack[i].id === id) {
        var back = modalStack[i].returnTo;
        modalStack.splice(i, 1);
        if (back && back.focus) { try { back.focus(); } catch (e) {} }
        break;
      }
    }
  }
  function topModal() { return modalStack.length ? modalStack[modalStack.length - 1].id : null; }

  /* 焦點鎖定：Tab 不會跑到彈窗外面；Esc 關閉最上層彈窗 */
  document.addEventListener('keydown', function (ev) {
    var top = topModal();
    if (!top) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeModal(top); return; }
    if (ev.key !== 'Tab') return;
    var m = $(top);
    var items = $$('input,button,select,textarea,[href],[tabindex]:not([tabindex="-1"])', m)
      .filter(function (e) { return !e.disabled && e.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });

  $$('[data-close-modal]').forEach(function (mask) {
    mask.addEventListener('click', function () {
      var m = mask.closest('.modal');
      if (m) closeModal(m.id);
    });
  });

  var confirmCb = null;
  function askConfirm(message, onYes, yesLabel) {
    $('confirm-message').textContent = message;
    UI.setLabel($('b-confirm-yes'), yesLabel || '確定');
    confirmCb = onYes;
    openModal('confirm-modal');
  }
  $('b-confirm-yes').addEventListener('click', function () {
    closeModal('confirm-modal');
    var cb = confirmCb; confirmCb = null;
    if (cb) cb();
  });
  $('b-confirm-no').addEventListener('click', function () { confirmCb = null; closeModal('confirm-modal'); });

  function mkBtn(color, label, onClick) {
    var b = document.createElement('button');
    b.className = 'btn3d';
    b.type = 'button';
    b.setAttribute('data-color', color);
    b.innerHTML = label;
    b.addEventListener('click', function () { Sound.play('click'); onClick(); });
    return b;
  }

  /* ------------------------------------------------------------ 設定 */

  /** 次數 >= Rules.UNLIMITED 就顯示成 ∞，不要印一個奇怪的 99 */
  function timesText(n) { return (n >= Rules.UNLIMITED) ? '∞' : String(n); }

  function applyBodyFlags() {
    var L = G.snap ? Rules.levelOf(G.snap.level) : null;
    document.body.classList.toggle('reduce-motion', Store.reduceMotion());
    /* 幼幼班本來就要看得到水果名稱，所以不管設定怎麼調都會顯示 */
    document.body.classList.toggle('show-label', Store.labelOn() || !!(L && L.showNames));
    document.body.classList.toggle('kids-board', !!(L && L.showNames));
  }

  function syncSettingsUI() {
    $('set-music').checked = Sound.isMusicOn();
    $('set-music-status').textContent = Sound.isMusicOn() ? '開啟' : '關閉';
    $('set-music-vol').value = Math.round(Sound.musicVolume() * 100);
    $('set-music-vol-out').textContent = Math.round(Sound.musicVolume() * 100) + '%';
    $('set-sfx').checked = Sound.isSfxOn();
    $('set-sfx-status').textContent = Sound.isSfxOn() ? '開啟' : '關閉';
    $('set-sfx-vol').value = Math.round(Sound.sfxVolume() * 100);
    $('set-sfx-vol-out').textContent = Math.round(Sound.sfxVolume() * 100) + '%';
    $('set-haptic').checked = Sound.isHapticOn();
    $('set-motion').checked = Store.reduceMotion();
    $('set-label').checked = Store.labelOn();
    $('set-server').textContent = '線上伺服器：' + Config.describe();
    applyBodyFlags();
  }

  $('b-settings').addEventListener('click', function () { Sound.unlock(); syncSettingsUI(); openModal('settings-modal'); });
  $('b-settings-close').addEventListener('click', function () { closeModal('settings-modal'); });
  $('b-settings-done').addEventListener('click', function () { closeModal('settings-modal'); });
  $('b-settings-reset').addEventListener('click', function () {
    Store.resetDefaults();
    Sound.setMusic(true); Sound.setMusicVolume(0.7);
    Sound.setSfx(true); Sound.setSfxVolume(1);
    Sound.setHaptic(true);
    syncSettingsUI();
    toast('已恢復預設設定');
  });
  $('set-music').addEventListener('change', function () {
    Sound.unlock(); Sound.setMusic(this.checked);
    if (!this.checked) Sound.stopBgm();
    syncSettingsUI();
  });
  $('set-sfx').addEventListener('change', function () { Sound.unlock(); Sound.setSfx(this.checked); syncSettingsUI(); });
  $('set-music-vol').addEventListener('input', function () { Sound.setMusicVolume(this.value / 100); $('set-music-vol-out').textContent = this.value + '%'; });
  $('set-sfx-vol').addEventListener('input', function () { Sound.setSfxVolume(this.value / 100); $('set-sfx-vol-out').textContent = this.value + '%'; });
  $('set-haptic').addEventListener('change', function () { Sound.setHaptic(this.checked); if (this.checked) Sound.vibrate(15); });
  $('set-motion').addEventListener('change', function () { Store.reduceMotion(this.checked); applyBodyFlags(); });
  $('set-label').addEventListener('change', function () { Store.labelOn(this.checked); applyBodyFlags(); });

  /* ------------------------------------------------------------ 主選單與靜態畫面 */

  $$('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-back')); });
  });

  $('b-solo').addEventListener('click', function () { Sound.unlock(); buildThemePicker(); buildLevelPicker(); show('s-solo'); });
  $('b-online').addEventListener('click', function () { Sound.unlock(); enterLobby(); });
  $('b-help').addEventListener('click', function () { buildHelp(); show('s-help'); });
  $('b-stats').addEventListener('click', function () { buildStats(); show('s-stats'); });

  /** 主題卡上放四個造型縮圖，一眼就看得出換了會變成什麼 */
  function themeCard(t, checked) {
    var pics = '';
    for (var i = 0; i < 4; i++) pics += UI.artSvg(t.key, Math.floor(i * t.count / 4));
    return '<button class="themecard" role="radio" type="button" data-v="' + t.key + '" aria-checked="' + checked + '"' +
      ' aria-label="' + t.label + '，' + t.count + ' 種圖案">' +
      '<span class="tname">' + t.emoji + ' ' + t.label + '</span>' +
      '<span class="tcount">' + t.count + ' 種</span>' +
      '<span class="tpics">' + pics + '</span></button>';
  }

  function buildThemePicker() {
    var host = $('opt-theme');
    var cur = Store.theme();
    if (!Themes.has(cur)) { cur = Themes.DEFAULT; Store.theme(cur); }
    G.pendingTheme = cur;
    host.innerHTML = Themes.menu().map(function (t) { return themeCard(t, t.key === cur); }).join('');
    var note = function () { $('theme-hint').textContent = Themes.of(G.pendingTheme).note + '；每一局會從裡面隨機抽圖案，所以每次玩到的都不一樣。'; };
    note();
    $$('.themecard', host).forEach(function (b) {
      b.addEventListener('click', function () {
        G.pendingTheme = b.getAttribute('data-v');
        Store.theme(G.pendingTheme);
        $$('.themecard', host).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        note();
        Sound.play('click');
      });
    });
  }

  function buildLevelPicker() {
    var host = $('opt-level');
    var cur = Store.level();
    host.innerHTML = Rules.LEVELS.map(function (l) {
      return '<button class="pickcard" role="radio" type="button" data-v="' + l.key + '" aria-checked="' + (l.key === cur) + '">' +
        '<b>' + l.emoji + ' ' + l.label + '</b>' +
        '<span>' + l.cols + ' × ' + l.rows + '　' + l.kinds + ' 種水果　' + l.sec + ' 秒</span>' +
        '<span>提示 ' + timesText(l.hints) + ' 次　洗牌 ' + timesText(l.shuffles) + ' 次</span>' +
        (l.key === 'kids' ? '<span>👶 給 3～5 歲的小朋友，會自動顯示水果名稱</span>' : '') + '</button>';
    }).join('');
    G.pendingLevel = cur;
    $$('.pickcard', host).forEach(function (b) {
      b.addEventListener('click', function () {
        G.pendingLevel = b.getAttribute('data-v');
        Store.level(G.pendingLevel);
        $$('.pickcard', host).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        Sound.play('click');
      });
    });
  }

  function buildHelp() {
    R.pathDemos($('path-demo'));
    buildThemeGallery();
    $('level-table').innerHTML =
      '<tr><th>關卡</th><th>盤面</th><th>水果種類</th><th>時間</th><th>提示</th><th>洗牌</th></tr>' +
      Rules.LEVELS.map(function (l) {
        return '<tr><td>' + l.emoji + ' ' + l.short + '</td><td>' + l.cols + ' × ' + l.rows + '</td>' +
          '<td>' + l.kinds + ' 種</td><td>' + l.sec + ' 秒</td><td>' + timesText(l.hints) + ' 次</td><td>' + timesText(l.shuffles) + ' 次</td></tr>';
      }).join('');
  }

  function buildThemeGallery() {
    $('theme-gallery').innerHTML = Themes.menu().map(function (t) {
      var pics = '';
      var n = Math.min(12, t.count);
      for (var i = 0; i < n; i++) pics += UI.artSvg(t.key, Math.floor(i * t.count / n));
      return '<div class="themerow"><div class="th">' + t.emoji + ' ' + t.label +
        '<small>' + t.count + ' 種 · ' + t.note + '</small></div>' +
        '<div class="tp">' + pics + '</div></div>';
    }).join('');
  }

  function buildStats() {
    var best = Store.allBest();
    $('best-list').innerHTML = Rules.LEVELS.map(function (l) {
      var b = best[l.key];
      return '<div class="bestrow"><span class="bn">' + l.emoji + ' ' + l.label + '</span>' +
        (b ? '<span class="bv">最高分 <b>' + b.score + '</b>　最快 <b>' + b.sec + '</b> 秒　最高 <b>' + b.bestCombo + '</b> 連擊</span>'
           : '<span class="bv">還沒有紀錄</span>') + '</div>';
    }).join('');
    var s = Store.stats();
    $('stat-grid').innerHTML =
      '<div class="statcard"><b>' + s.solo.clear + '</b><span>單機過關</span></div>' +
      '<div class="statcard"><b>' + s.solo.fail + '</b><span>單機失敗</span></div>' +
      '<div class="statcard"><b>' + s.online.win + '</b><span>線上第一名</span></div>' +
      '<div class="statcard"><b>' + s.online.lose + '</b><span>線上未奪冠</span></div>';
  }

  $('b-stats-reset').addEventListener('click', function () {
    askConfirm('要清除這台裝置上的所有紀錄嗎？清掉就找不回來了。', function () {
      Store.clearBest(); Store.clearStats(); buildStats(); toast('已清除本機紀錄');
    }, '清除');
  });

  /* ------------------------------------------------------------ 單機闖關 */

  $('b-solo-start').addEventListener('click', function () { Sound.unlock(); startSoloRun(G.pendingLevel); });

  function startSoloRun(level) {
    G.run = { startLevel: level, level: level, total: 0, stages: [] };
    startSoloStage(level);
  }

  /** 開一關。三關的分數會累加在 G.run.total，中途重玩不會重複累加。 */
  function startSoloStage(level) {
    G.mode = 'solo';
    G.view = null;
    G.run.level = level;
    var seed = RNG.randomSeed();
    G.rng = RNG.createRng('solo:' + seed);
    var theme = Themes.has(Store.theme()) ? Store.theme() : Themes.DEFAULT;
    G.state = Rules.createMatch({
      seed: seed,
      players: [{ id: 'me', name: Store.nick() || '你' }],
      level: level,
      theme: theme,
      maxKinds: Themes.count(theme),
      now: Date.now(),
      countdownMs: Rules.COUNTDOWN_MS,
      rng: G.rng
    });
    G.timeOffset = 0;
    G.sel = null;
    G.lastTick = 0;
    G.snap = Rules.snapshot(G.state, Date.now());
    $('ov-wait').hidden = true;
    $('ov-result').hidden = true;
    $('chat-hint').hidden = false;
    applyBodyFlags();
    show('s-game');
    paintAll();
    startTicker();
  }

  /* ------------------------------------------------------------ 盤面掛載與繪製 */

  function mountIfNeeded() {
    if (!G.snap) return;
    var key = G.snap.level + '|' + G.snap.W + 'x' + G.snap.H + '|' + G.snap.startAt + '|' + G.snap.seed;
    if (key === G.mountKey) return;
    G.mountKey = key;
    G.sel = null;
    R.mount({ board: $('board'), line: $('linkline'), fx: $('fx') }, G.snap, onPick);
  }

  function myPlayer() {
    if (!G.snap) return null;
    var id = isOnline() ? G.myId : 'me';
    var list = G.snap.players || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /**
   * 目前真正的階段。
   *
   * 不能直接看 G.snap.phase：那是「產生快照的那一刻」算出來的，
   * 線上每 3 秒才補一次完整狀態、單機也只在有事件時重算，
   * 倒數結束之後它會一直卡在 'countdown'，玩家就點不動了。
   * 這裡改用時間戳當場算，畫面就不會有死角。
   */
  function livePhase() {
    if (!G.snap) return 'none';
    if (G.snap.over) return 'over';
    var t = nowSrv();
    if (t < G.snap.startAt) return 'countdown';
    if (t >= G.snap.endAt) return 'over';
    return 'playing';
  }

  function canPlay() {
    if (!G.snap || G.snap.over) return false;
    if (livePhase() !== 'playing') return false;
    if (!isOnline()) return true;
    return !!(G.view && G.view.you && G.view.you.can && G.view.you.can.play);
  }

  function fmtClock(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function paintHud() {
    if (!G.snap) return;
    var L = Rules.levelOf(G.snap.level);
    var remain = G.snap.over ? 0 : Math.max(0, G.snap.endAt - nowSrv());
    var ratio = G.snap.roundMs ? remain / G.snap.roundMs : 0;
    $('hud-clock').textContent = fmtClock(remain);
    $('hud-time').classList.toggle('low', remain <= 15000 && !G.snap.over);
    var fill = $('timebar-fill');
    fill.style.width = (ratio * 100).toFixed(2) + '%';
    fill.className = ratio < 0.15 ? 'low' : (ratio < 0.35 ? 'warn' : '');

    var lv = $('hud-level');
    lv.textContent = L.emoji + ' ' + L.short;
    lv.className = 'hud-stage lv' + L.no;

    var me = myPlayer();
    $('hud-score').textContent = me ? me.score : 0;
    $('hud-remain').textContent = G.snap.left;
    var combo = $('hud-combo');
    if (me && me.combo > 1) { combo.hidden = false; $('hud-combo-n').textContent = me.combo; }
    else combo.hidden = true;

    $('hint-left').textContent = me ? timesText(me.hints) : '0';
    $('shuffle-left').textContent = me ? timesText(me.shuffles) : '0';
    var playable = canPlay();
    $('b-hint').disabled = !playable || !me || me.hints <= 0;
    $('b-shuffle').disabled = !playable || !me || me.shuffles <= 0;
  }

  function paintSide() {
    if (!G.snap) return;
    var myId = isOnline() ? G.myId : 'me';
    var players = G.snap.players || [];
    R.rank($('rank-list'), $('live-bar'), players, myId, players.map(function (p) { return p.id; }));

    var L = Rules.levelOf(G.snap.level);
    var TH = Themes.of(G.snap.theme);
    if (isOnline() && G.view) {
      var specs = (G.view.members || []).filter(function (m) { return m.role === 'spectator'; }).length;
      $('sum-room').innerHTML = '房號 <b>' + R.esc(G.view.code) + '</b><br>' + R.esc(G.view.name) +
        '<br>' + L.short + '　' + L.cols + ' × ' + L.rows + '　' + TH.emoji + TH.label +
        '<br>觀戰 ' + specs + ' 人';
    } else {
      $('sum-room').innerHTML = '單機闖關<br><b>' + L.short + '</b>　' + L.cols + ' × ' + L.rows +
        '<br>' + TH.emoji + ' ' + TH.label + '<br>累計 <b>' + (G.run ? G.run.total : 0) + '</b> 分';
    }

    var me = myPlayer();
    var role = (isOnline() && G.view && G.view.you) ? G.view.you.role : 'player';
    $('my-stat').innerHTML = me
      ? ('已連 ' + me.pairs + ' 對 · 連錯 ' + me.misses + ' 次 · 最高 ' + me.bestCombo + ' 連擊<br>剩餘水果 ' + G.snap.left + ' 個' +
         (G.snap.autoShuffles ? '<br>系統自動洗牌 ' + G.snap.autoShuffles + ' 次' : ''))
      : (role === 'spectator' ? '你正在觀戰：看得到盤面與聊天室，但不能出手。' : '');
  }

  function paintAll() {
    mountIfNeeded();
    if (G.snap) R.sync(G.snap.grid);
    paintHud();
    paintSide();
  }

  /* ---- 主計時器：畫面每 200ms 更新一次；單機還要負責判定時間到 ---- */
  function startTicker() {
    stopTicker();
    G.ticker = setInterval(function () {
      if (!G.snap) return;
      if (!isOnline() && G.state && !G.state.over) {
        var evs = Rules.tick(G.state, Date.now());
        if (evs.length) {
          G.snap = Rules.snapshot(G.state, Date.now());
          evs.forEach(handleEvent);
        }
      }
      if (G.snap && !G.snap.over) {
        G.snap.phase = livePhase();          /* 讓快照裡的階段跟著時間走 */
        var sec = Math.ceil(Math.max(0, G.snap.endAt - nowSrv()) / 1000);
        if (G.snap.phase === 'playing' && sec <= 5 && sec > 0 && sec !== G.lastTick) {
          G.lastTick = sec;
          Sound.play(sec <= 3 ? 'tickHot' : 'tick');
        }
        paintCountdown();
      }
      paintHud();
    }, 200);
  }
  function stopTicker() { if (G.ticker) { clearInterval(G.ticker); G.ticker = null; } }

  var lastCount = null;
  function paintCountdown() {
    var c = $('countdown');
    if (!G.snap || G.snap.over) { c.hidden = true; return; }
    var left = G.snap.startAt - nowSrv();
    if (left > 0) {
      var n = Math.ceil(left / 1000);
      c.hidden = false;
      c.textContent = n;
      if (n !== lastCount) { lastCount = n; Sound.play('count'); }
    } else if (!c.hidden) {
      c.hidden = true;
      lastCount = null;
      if (!isOnline()) { R.shout('開始！'); Sound.play('go'); }
    }
  }

  /* ------------------------------------------------------------ 出手 */

  function curGrid() { return G.snap ? G.snap.grid : []; }

  function onPick(i) {
    Sound.unlock();
    if (!canPlay()) {
      if (livePhase() === 'countdown') toast('還在倒數，先別急');
      else if (isOnline() && G.view && G.view.you && G.view.you.role === 'spectator') toast('你正在觀戰，不能出手');
      return;
    }
    var grid = curGrid();
    if (!grid[i]) return;

    if (G.sel === i) { G.sel = null; R.setSelected(i, false); Sound.play('unpick'); return; }
    if (G.sel === null || !grid[G.sel]) { G.sel = i; R.setSelected(i, true); Sound.play('pick'); return; }

    /* 點到不同種水果就把選取換過去 —— 這比直接判失敗好操作得多，
       真正的「連錯」只會發生在同一種水果但路徑走不通的時候。 */
    if (grid[G.sel] !== grid[i]) {
      R.setSelected(G.sel, false);
      G.sel = i;
      R.setSelected(i, true);
      Sound.play('pick');
      return;
    }

    var a = G.sel;
    R.setSelected(a, false);
    G.sel = null;
    submit(a, i);
  }

  function submit(a, b) {
    if (isOnline()) { Online.send('room:link', { a: a, b: b }); return; }
    var res = Rules.attempt(G.state, 'me', a, b, Date.now(), G.rng);
    if (!res.ok) { toast(res.error); return; }
    G.snap = Rules.snapshot(G.state, Date.now());
    handleEvent(res.event);
    (res.extra || []).forEach(handleEvent);
  }

  $('b-hint').addEventListener('click', function () {
    Sound.unlock();
    if (isOnline()) { Online.send('room:hint', {}); return; }
    var res = Rules.useHint(G.state, 'me', Date.now());
    if (!res.ok) { toast(res.error); return; }
    G.snap = Rules.snapshot(G.state, Date.now());
    handleEvent(res.event);
  });

  $('b-shuffle').addEventListener('click', function () {
    Sound.unlock();
    if (isOnline()) { Online.send('room:shuffle', {}); return; }
    var res = Rules.useShuffle(G.state, 'me', Date.now(), G.rng);
    if (!res.ok) { toast(res.error); return; }
    G.snap = Rules.snapshot(G.state, Date.now());
    handleEvent(res.event);
  });

  /* ------------------------------------------------------------ 事件處理 */

  function nameOf(id) {
    var list = (G.snap && G.snap.players) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name;
    return '有人';
  }

  function handleEvent(ev) {
    if (!ev) return;
    var myId = isOnline() ? G.myId : 'me';

    if (ev.k === 'match') {
      var mine = ev.by === myId;
      /* 線上：伺服器說消掉了才動盤面，所以這裡直接套用事件的結果 */
      if (isOnline() && G.snap) {
        G.snap.grid[ev.a] = 0;
        G.snap.grid[ev.b] = 0;
        G.snap.left = ev.left;
        (G.snap.players || []).forEach(function (p) {
          if (p.id === ev.by) { p.score = ev.score; p.combo = ev.combo; p.pairs = ev.pairs; }
        });
      }
      R.drawLink(ev.path);
      R.popPair(ev.a, ev.b);
      R.flyScore(ev.b, '+' + ev.gain + (ev.combo > 1 ? ' ×' + ev.mult : ''), mine);
      if (!mine) R.flyScore(ev.a, nameOf(ev.by), false);
      Sound.play('match', ev.combo);
      if (mine) Sound.vibrate(12);
      if (mine && ev.combo === 5) R.shout('5 連擊！');
      if (mine && ev.combo === 10) R.shout('10 連擊！！');
      setTimeout(function () { if (G.snap) R.sync(G.snap.grid); paintSide(); }, 260);
      paintHud();
      return;
    }

    if (ev.k === 'miss') {
      if (ev.by === myId) {
        R.shake(ev.a); R.shake(ev.b);
        Sound.play('miss');
        Sound.vibrate([8, 40, 8]);
        toast('這兩顆連不起來（路徑要轉彎 2 次以內、而且只能經過空格）');
        if (isOnline() && G.snap) {
          (G.snap.players || []).forEach(function (p) { if (p.id === ev.by) { p.combo = 0; p.misses = ev.misses; } });
        }
      }
      paintHud(); paintSide();
      return;
    }

    if (ev.k === 'hint') {
      R.markHint(ev.a, ev.b);
      Sound.play('hint');
      if (isOnline() && G.snap) {
        (G.snap.players || []).forEach(function (p) { if (p.id === ev.by) p.hints = ev.hints; });
      }
      paintHud();
      return;
    }

    if (ev.k === 'shuffle') {
      if (isOnline() && G.snap && ev.grid) { G.snap.grid = ev.grid.slice(); G.snap.left = ev.left; }
      G.sel = null;
      R.clearSelected();
      if (G.snap) R.sync(G.snap.grid);
      Sound.play('shuffle');
      toast(ev.auto ? '沒有水果連得到了，系統自動幫大家洗牌（不算次數）' : '已經洗牌');
      paintHud(); paintSide();
      return;
    }

    if (ev.k === 'go') {
      $('countdown').hidden = true;
      R.shout('開始！');
      Sound.play('go');
      return;
    }

    if (ev.k === 'end') { showResult(); return; }
  }

  /* ------------------------------------------------------------ 結算 */

  function showResult() {
    stopTicker();
    G.sel = null;
    R.clearSelected();
    $('countdown').hidden = true;
    if (isOnline()) { showOnlineResult(); return; }

    var st = G.state;
    G.snap = Rules.snapshot(st, Date.now());
    var me = st.players.me;
    var L = Rules.levelOf(st.level);
    var cleared = st.cleared;

    if (cleared) {
      G.run.total += me.score;
      G.run.stages.push({ level: st.level, score: me.score, pairs: me.pairs, bestCombo: me.bestCombo });
      Store.best(st.level, {
        score: me.score,
        sec: Math.max(1, Math.round((st.overAt - st.startAt) / 1000)),
        bestCombo: me.bestCombo,
        pairs: me.pairs
      });
      Store.recordResult('solo', 'clear');
    } else {
      Store.recordResult('solo', 'fail');
    }

    var nxt = cleared ? Rules.nextLevel(st.level) : null;
    var best = Store.best(st.level);

    $('ov-trophy').innerHTML = cleared ? UI.trophy() : '';
    $('ov-result-title').textContent = cleared
      ? (nxt ? L.emoji + ' ' + L.short + ' 過關！' : '🎉 ' + Rules.LEVELS.length + ' 關全部通過！')
      : '⏰ 時間到';
    $('result-table').innerHTML =
      '<div class="resrow win"><span class="no">🍀</span>' +
      '<span class="nm">這一關<small>' + me.pairs + ' 對 · 最高 ' + me.bestCombo + ' 連擊 · 連錯 ' + me.misses + ' 次' +
      (me.timeBonus ? ' · 時間 +' + me.timeBonus : '') + '</small></span>' +
      '<span class="sc">' + me.score + '</span></div>' +
      '<div class="resrow"><span class="no">Σ</span><span class="nm">本次闖關累計</span>' +
      '<span class="sc">' + G.run.total + '</span></div>';
    $('ov-result-note').innerHTML = cleared
      ? ('這一關的個人最佳：' + best.score + ' 分 · ' + best.sec + ' 秒 · ' + best.bestCombo + ' 連擊')
      : ('盤面上還剩 ' + st.left + ' 個水果。<br>提示和洗牌用完就沒有了，記得留一點在後面。');

    var btns = $('ov-result-btns');
    btns.innerHTML = '';
    if (nxt) btns.appendChild(mkBtn('mint', '下一關 ▶', function () { startSoloStage(nxt); }));
    btns.appendChild(mkBtn(nxt ? 'cream' : 'mint', cleared ? '再玩這一關 🔁' : '再挑戰一次 🔁', function () {
      startSoloStage(st.level);
    }));
    btns.appendChild(mkBtn('cream', '回主選單 🏠', backHome));
    UI.decorateAll(btns);

    Sound.play(cleared ? 'clear' : 'fail');
    $('ov-result').hidden = false;
    paintSide();
  }

  function backHome() {
    stopTicker();
    if (isOnline()) leaveRoom(true);
    G.state = null; G.snap = null; G.mountKey = ''; G.view = null; G.mode = 'solo';
    $('ov-result').hidden = true;
    $('ov-wait').hidden = true;
    show('s-home');
  }

  $('b-quit').addEventListener('click', function () {
    if (G.snap && !G.snap.over) {
      askConfirm(isOnline() ? '要離開這個房間嗎？離開之後座位會讓給別人。' : '要離開這一關嗎？目前的進度不會保留。', backHome, '離開');
    } else backHome();
  });

  /* ------------------------------------------------------------ 側欄分頁與聊天 */

  function setPane(name) {
    G.pane = name;
    $$('.stab').forEach(function (t) {
      var on = t.getAttribute('data-pane') === name;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('pane-sum').classList.toggle('on', name === 'sum');
    $('pane-chat').classList.toggle('on', name === 'chat');
    if (name === 'chat') {
      G.unread = 0;
      $('chat-unread').hidden = true;
      $('chat-unread2').hidden = true;
      var log = $('chat-log');
      log.scrollTop = log.scrollHeight;
    }
  }
  $$('.stab').forEach(function (t) {
    t.addEventListener('click', function () { setPane(t.getAttribute('data-pane')); Sound.play('click'); });
  });
  function openSide(pane) { $('side').classList.add('open'); setPane(pane); }
  $('b-open-sum').addEventListener('click', function () { openSide('sum'); });
  $('b-open-chat').addEventListener('click', function () { openSide('chat'); });
  $('b-side-close').addEventListener('click', function () { $('side').classList.remove('open'); });

  $('chat-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var input = $('chat-input');
    var text = input.value.trim();
    if (!text) return;
    if (!isOnline()) { toast('單機闖關沒有聊天室'); return; }
    Online.send('room:chat', { text: text });
    input.value = '';
  });

  /* ------------------------------------------------------------ 鍵盤操作 */

  document.addEventListener('keydown', function (ev) {
    if (topModal()) return;
    if (G.screen !== 's-game') return;
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (ev.key === 'Escape') {
      if (G.sel !== null) { R.setSelected(G.sel, false); G.sel = null; Sound.play('unpick'); ev.preventDefault(); }
      return;
    }
    var dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
    if (!dir || !G.snap) return;
    ev.preventDefault();
    var d = R.dims();
    var act = document.activeElement;
    var cur = (act && act.dataset && act.dataset.i !== undefined) ? Number(act.dataset.i) : null;
    if (cur === null) { focusFirstTile(); return; }
    var x = cur % d.W, y = Math.floor(cur / d.W);
    for (var step = 0; step < Math.max(d.W, d.H); step++) {
      x += dir[0]; y += dir[1];
      if (x < 1 || y < 1 || x > d.cols || y > d.rows) break;
      var i = y * d.W + x;
      if (G.snap.grid[i]) { R.focusTile(i); return; }
    }
  });

  function focusFirstTile() {
    if (!G.snap) return;
    for (var i = 0; i < G.snap.grid.length; i++) if (G.snap.grid[i]) { R.focusTile(i); return; }
  }

  /* ------------------------------------------------------------ 線上：連線與大廳 */

  function setConn(state, message) {
    var map = {
      idle: ['', '尚未連線'],
      loading: ['warn', '正在載入連線程式…'],
      connecting: ['warn', '連線中…（免費方案冷啟動可能要十幾秒）'],
      connected: ['ok', '已連線：' + Config.describe()],
      error: ['bad', message || '連線失敗'],
      offline: ['bad', message || '沒有可用的伺服器，只能玩單機']
    };
    var m = map[state] || map.idle;
    $('conn-dot').className = 'dot ' + m[0];
    $('conn-text').textContent = m[1];
    $('b-reconnect').hidden = !(state === 'error' || state === 'offline');
  }

  function identity() { return { clientId: Store.clientId(), name: Store.nick() || '玩家' }; }

  function connect() {
    return Online.connect(identity()).then(function (s) {
      Online.send('lobby:subscribe', {});
      return s;
    });
  }

  function enterLobby() {
    show('s-lobby');
    $('lobby-nick').value = Store.nick();
    $('lobby-note').textContent = Config.isOnlineEnabled()
      ? '在電腦上執行「啟動遊戲.bat」之後，同一個 Wi-Fi 的平板或手機打開視窗裡印出的「同網段」網址，就會進到同一個大廳。'
      : '目前沒有設定遊戲伺服器，只能玩單機闖關。';
    if (!Config.isOnlineEnabled()) { setConn('offline', Config.error || '沒有可用的伺服器，只能玩單機'); return; }
    connect().catch(function (err) { setConn('error', err.message); });
  }

  $('b-reconnect').addEventListener('click', function () { connect().catch(function (e) { setConn('error', e.message); }); });
  $('b-refresh').addEventListener('click', function () { Online.send('lobby:subscribe', {}); });
  $('lobby-nick').addEventListener('change', function () {
    Store.nick(this.value.trim().slice(0, 12));
    if (Online.isConnected()) Online.send('hello', identity());
  });

  $('b-create').addEventListener('click', function () {
    Sound.unlock();
    Store.nick($('lobby-nick').value.trim().slice(0, 12));
    if (!Online.isConnected()) { toast('還沒連上伺服器'); return; }
    Online.send('room:create', {
      name: Store.nick(),
      roomName: $('room-name').value,
      private: $('room-private').checked,
      level: Store.level(),
      theme: Store.theme()
    }, function (res) { if (res && res.ok) enterRoom(); });
  });

  $('b-join').addEventListener('click', function () {
    Sound.unlock();
    var code = $('join-code').value.trim().toUpperCase();
    if (!code) { toast('請先輸入房號'); return; }
    joinRoom(code, null);
  });

  function joinRoom(code, token) {
    Store.nick($('lobby-nick').value.trim().slice(0, 12) || Store.nick());
    if (G.joining) return;
    G.joining = true;
    var go = function () {
      Online.send('room:join', { code: code, name: Store.nick(), token: token }, function (res) {
        G.joining = false;
        if (!res || !res.ok) return;
        if (res.downgraded) toast('玩家席位滿了，你先以觀戰身分進來');
        else if (res.waiting) toast('這一局已經開始了，先觀戰，下一局再下場');
        else if (res.note) toast(res.note);
        enterRoom();
      });
    };
    if (Online.isConnected()) go();
    else connect().then(go).catch(function (e) { G.joining = false; setConn('error', e.message); });
  }

  function enterRoom() {
    G.mode = 'online';
    G.state = null;
    G.rng = null;
    G.run = null;
    $('chat-hint').hidden = true;
    Online.send('lobby:unsubscribe', {});
    show('s-game');
    startTicker();
  }

  function leaveRoom(silent) {
    if (G.mode !== 'online') return;
    if (Online.isConnected()) Online.send('room:leave', {});
    G.mode = 'solo';
    G.view = null;
    G.snap = null;
    G.mountKey = '';
    if (!silent) { show('s-lobby'); Online.send('lobby:subscribe', {}); }
  }

  Online.on('lobby:rooms', function (p) {
    var rooms = (p && p.rooms) || [];
    $('rooms-count').textContent = rooms.length;
    if (!rooms.length) {
      $('room-list').innerHTML = '<div class="empty">現在沒有公開房間，按「建立房間」開一間吧。</div>';
      return;
    }
    $('room-list').innerHTML = rooms.map(function (r) {
      var tag = (r.phase === 'playing' || r.phase === 'countdown') ? 'playing' : (r.phase === 'over' ? 'over' : '');
      var label = r.phase === 'playing' ? '對戰中' : (r.phase === 'countdown' ? '倒數中' : (r.phase === 'over' ? '剛結束' : '等待中'));
      var canSit = r.seatsFree > 0 && r.phase === 'lobby';
      return '<div class="roomrow"><span class="rname">' + R.esc(r.name) +
        '<small>房號 ' + r.code + '　' + r.levelLabel + '（' + r.board + '）　' +
        (r.themeEmoji || '') + (r.themeLabel || '') + '</small></span>' +
        '<span class="tag ' + tag + '">' + label + '</span>' +
        '<span class="tag">玩家 ' + r.players + '/' + r.seats + '</span>' +
        '<span class="tag">觀戰 ' + r.spectators + '</span>' +
        '<button class="btn3d small" data-color="mint" data-join="' + r.code + '" type="button">' +
        (canSit ? '加入' : '觀戰') + '</button></div>';
    }).join('');
    UI.decorateAll($('room-list'));
    $$('[data-join]', $('room-list')).forEach(function (b) {
      b.addEventListener('click', function () { joinRoom(b.getAttribute('data-join'), null); });
    });
  });

  Online.on('status', function (s) { setConn(s.status, s.message); });
  Online.on('hello', function (res) {
    G.myId = res.clientId || Store.clientId();
    if (res.serverTime) G.timeOffset = res.serverTime - Date.now();
  });
  Online.on('room:error', function (p) { toast(p.message || '操作失敗'); });
  Online.on('room:left', function () {
    G.mode = 'solo'; G.view = null; G.snap = null; G.mountKey = '';
    show('s-lobby'); Online.send('lobby:subscribe', {});
  });
  Online.on('room:closed', function (p) {
    G.mode = 'solo'; G.view = null; G.snap = null; G.mountKey = '';
    toast((p && p.reason) || '房間已經關閉');
    show('s-lobby'); Online.send('lobby:subscribe', {});
  });
  Online.on('reconnected', function () { toast('重新連上線了'); });

  Online.on('room:chat', function (p) {
    if (!G.view) return;
    G.view.chat = (G.view.chat || []).concat([p.message]).slice(-40);
    R.chat($('chat-log'), G.view.chat, G.myId);
    if (G.pane !== 'chat' && !p.message.system) {
      G.unread += 1;
      $('chat-unread').hidden = false; $('chat-unread').textContent = G.unread;
      $('chat-unread2').hidden = false; $('chat-unread2').textContent = G.unread;
      Sound.play('chat');
    }
  });

  Online.on('room:events', function (p) { (p.events || []).forEach(handleEvent); });

  Online.on('room:sync', function (view) {
    G.mode = 'online';
    G.view = view;
    G.myId = (view.you && view.you.id) || G.myId;
    if (G.screen !== 's-game') show('s-game');
    $('chat-hint').hidden = true;

    if (view.match) {
      var prevKey = G.mountKey;
      G.snap = view.match;
      mountIfNeeded();
      if (G.mountKey !== prevKey) { G.lastTick = 0; applyBodyFlags(); }
      R.sync(G.snap.grid);
    }
    R.chat($('chat-log'), view.chat || [], G.myId);
    paintRoomOverlays();
    paintHud();
    paintSide();
    if (!G.ticker) startTicker();
  });

  /* ---- 房間等待／結算浮層 ---- */

  function paintRoomOverlays() {
    var v = G.view;
    if (!v) return;
    var waiting = (v.phase === 'lobby');
    var over = (v.phase === 'over');

    $('ov-wait').hidden = !waiting;
    if (!over) $('ov-result').hidden = true;
    if (v.phase !== 'countdown') $('countdown').hidden = true;

    if (waiting) {
      $('ov-wait-title').textContent = v.name + '（房號 ' + v.code + '）';
      R.seats($('seat-list'), v.members || [], v.hostId, G.myId);

      var canLevel = !!(v.you.can && v.you.can.setLevel);
      $('level-manage').hidden = !canLevel;
      if (canLevel) {
        $('level-pick').innerHTML = (v.levels || []).map(function (l) {
          return '<button class="pickcard mini" role="radio" type="button" data-v="' + l.key + '" aria-checked="' + (l.key === v.level) + '">' +
            '<b>' + l.emoji + ' ' + l.short + '</b><span>' + l.cols + '×' + l.rows + '　' + l.sec + ' 秒</span></button>';
        }).join('');
        $$('.pickcard', $('level-pick')).forEach(function (b) {
          b.addEventListener('click', function () { Online.send('room:setLevel', { level: b.getAttribute('data-v') }); });
        });
      }

      var canTheme = !!(v.you.can && v.you.can.setTheme);
      $('theme-manage').hidden = !canTheme;
      if (canTheme) {
        $('theme-pick').innerHTML = (v.themes || []).map(function (t) {
          return '<button class="pickcard mini" role="radio" type="button" data-v="' + t.key + '" aria-checked="' + (t.key === v.theme) + '">' +
            '<b>' + t.emoji + ' ' + t.label + '</b><span>' + t.count + ' 種</span></button>';
        }).join('');
        $$('.pickcard', $('theme-pick')).forEach(function (b) {
          b.addEventListener('click', function () { Online.send('room:setTheme', { theme: b.getAttribute('data-v') }); });
        });
      }

      var TH = Themes.of(v.theme);
      var L = Rules.levelOf(v.level);
      $('ov-wait-note').innerHTML = '圖案：<b>' + TH.emoji + ' ' + TH.label + '</b>（' + TH.list.length + ' 種，每局隨機抽）<br>' +
        '關卡：<b>' + L.label + '</b>　' + L.cols + ' × ' + L.rows + '　' + L.sec + ' 秒<br>' +
        '最多 ' + v.seats + ' 人共用同一張盤面，同一對水果誰先連到就是誰的分。' +
        (v.you.startBlockedBy ? '<br>還不能開始：' + R.esc(v.you.startBlockedBy) : '');

      var btns = $('ov-wait-btns');
      btns.innerHTML = '';
      if (v.you.can.ready) {
        btns.appendChild(mkBtn(v.you.ready ? 'cream' : 'mint', v.you.ready ? '取消準備' : '我準備好了 ✔', function () {
          Online.send('room:ready', { ready: !v.you.ready });
        }));
      }
      if (v.you.can.sit) btns.appendChild(mkBtn('mint', '我要下場 🎮', function () { Online.send('room:sit', {}); }));
      if (v.you.can.stand) btns.appendChild(mkBtn('cream', '改成觀戰 👀', function () { Online.send('room:stand', {}); }));
      if (v.you.can.start) btns.appendChild(mkBtn('grape', '開始遊戲 ▶', function () { Online.send('room:start', {}); }));
      if (v.you.can.invite) btns.appendChild(mkBtn('sky', '邀請朋友 🔗', openInvite));
      btns.appendChild(mkBtn('cream', '離開房間', function () { leaveRoom(); }));
      UI.decorateAll(btns);
    }

    if (over && v.match && v.match.standings) showOnlineResult();
    if (!$('invite-modal').hidden) paintInviteList();
  }

  var lastResultKey = '';
  function showOnlineResult() {
    var v = G.view;
    if (!v || !v.match || !v.match.standings) return;
    var st = v.match.standings;
    var key = v.code + '|' + v.match.seed + '|' + st.map(function (r) { return r.id + ':' + r.score; }).join(',');
    var fresh = key !== lastResultKey;
    lastResultKey = key;

    var mine = null;
    st.forEach(function (r) { if (r.id === G.myId) mine = r; });
    var champion = st[0];

    $('ov-trophy').innerHTML = (mine && mine.rank === 1) ? UI.trophy() : '';
    $('ov-result-title').textContent = v.match.cleared ? '🎉 盤面清空！' : '⏰ 時間到';
    R.results($('result-table'), st, G.myId, (v.match.players || []).map(function (p) { return p.id; }));
    $('ov-result-note').innerHTML = v.match.draw
      ? '同分平手！'
      : ('冠軍是 <b>' + R.esc(champion ? champion.name : '—') + '</b>，' + (champion ? champion.score : 0) + ' 分。' +
         (mine ? '<br>你是第 ' + mine.rank + ' 名。' : '<br>你這一局是觀戰。'));

    var btns = $('ov-result-btns');
    btns.innerHTML = '';
    if (v.you.can.rematch) {
      btns.appendChild(mkBtn('mint', '再來一局 🔁（' + v.rematch.votes + '/' + v.rematch.need + '）', function () {
        Online.send('room:rematch', {});
      }));
    }
    if (v.you.can.reset) btns.appendChild(mkBtn('cream', '回房間準備', function () { Online.send('room:reset', {}); }));
    btns.appendChild(mkBtn('cream', '離開房間', function () { leaveRoom(); }));
    UI.decorateAll(btns);
    $('ov-result').hidden = false;

    if (fresh && mine) {
      Store.recordResult('online', (v.match.draw && mine.rank === 1) ? 'draw' : (mine.rank === 1 ? 'win' : 'lose'));
      Sound.play(mine.rank === 1 ? 'clear' : (v.match.draw ? 'draw' : 'fail'));
    }
  }

  /* ---- 邀請連結 ---- */

  function openInvite() {
    G.inviteRole = 'player';
    $$('.pickcard', $('invite-role')).forEach(function (b) {
      b.setAttribute('aria-checked', String(b.getAttribute('data-v') === 'player'));
    });
    $('invite-out').hidden = true;
    $('invite-note').textContent = '邀請連結預設 30 分鐘內有效、最多 5 個人用，隨時可以撤銷。';
    paintInviteList();
    openModal('invite-modal');
  }
  $$('.pickcard', $('invite-role')).forEach(function (b) {
    b.addEventListener('click', function () {
      G.inviteRole = b.getAttribute('data-v');
      $$('.pickcard', $('invite-role')).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
    });
  });
  $('b-invite-close').addEventListener('click', function () { closeModal('invite-modal'); });
  $('b-invite-done').addEventListener('click', function () { closeModal('invite-modal'); });
  $('b-invite-make').addEventListener('click', function () {
    if (!G.view) return;
    Online.send('room:invite', { role: G.inviteRole, ttlMinutes: 30, maxUses: 5 }, function (res) {
      if (!res || !res.ok) return;
      $('invite-url').value = Config.inviteUrl(G.view.code, res.token);
      $('invite-out').hidden = false;
      $('invite-note').textContent = '這張邀請是「' + (res.role === 'spectator' ? '觀戰' : '下場玩') +
        '」身分，最多 ' + res.maxUses + ' 個人用，' +
        new Date(res.expiresAt).toLocaleTimeString('zh-TW') + ' 之前有效。';
    });
  });
  $('b-invite-copy').addEventListener('click', function () {
    var input = $('invite-url');
    input.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value)
        .then(function () { toast('邀請連結已複製'); })
        .catch(function () { toast('請手動選取複製'); });
      return;
    }
    try { document.execCommand('copy'); toast('邀請連結已複製'); }
    catch (e) { toast('請手動選取複製'); }
  });

  function paintInviteList() {
    var v = G.view;
    var host = $('invite-list');
    if (!v || !v.invites || !v.invites.length) {
      host.innerHTML = '<div class="empty">還沒有產生過邀請連結</div>';
      return;
    }
    host.innerHTML = v.invites.map(function (iv) {
      var dead = iv.revoked || iv.expiresAt < Date.now() || iv.uses >= iv.maxUses;
      var why = iv.revoked ? '已撤銷' : (iv.expiresAt < Date.now() ? '已過期' : (iv.uses >= iv.maxUses ? '已用完' : '有效'));
      return '<div class="invrow' + (dead ? ' dead' : '') + '">' +
        '<span class="txt">' + (iv.role === 'spectator' ? '觀戰' : '下場玩') + '　' + why +
        '　用了 ' + iv.uses + '/' + iv.maxUses + '</span>' +
        (dead ? '' : '<button class="btn3d small" data-color="cream" data-revoke="' + iv.token + '" type="button">撤銷</button>') +
        '</div>';
    }).join('');
    UI.decorateAll(host);
    $$('[data-revoke]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        Online.send('room:revokeInvite', { token: b.getAttribute('data-revoke') });
        toast('已撤銷這張邀請');
      });
    });
  }

  /* ------------------------------------------------------------ 啟動 */

  function boot() {
    $('logo').innerHTML = UI.logo();
    UI.bgDeco($('bgdeco'));
    UI.decorateAll(document);
    applyBodyFlags();
    syncSettingsUI();
    setPane('sum');
    setConn('idle');
    $('lobby-nick').value = Store.nick();

    /* 第一次真的碰到畫面才解鎖音訊（瀏覽器規定要有使用者手勢） */
    var once = function () {
      Sound.unlock();
      if (Sound.isMusicOn()) Sound.startBgm('menu');
      document.removeEventListener('pointerdown', once);
      document.removeEventListener('keydown', once);
    };
    document.addEventListener('pointerdown', once);
    document.addEventListener('keydown', once);

    /* 邀請連結：?room=XXXXX&invite=... 直接進房 */
    var entry = Config.entry();
    if (entry.room) {
      enterLobby();
      connect().then(function () {
        Online.send('invite:check', { code: entry.room, token: entry.invite }, function (res) {
          if (!res || !res.ok) { toast((res && res.error) || '這個邀請連結沒有用了'); return; }
          if (res.note) toast(res.note);
          joinRoom(entry.room, entry.invite);
        });
      }).catch(function (e) { setConn('error', e.message); });
    }

    /* 視窗大小或方向改變時重畫立體按鈕（它們依實際像素畫出來） */
    var repaint = null;
    w.addEventListener('resize', function () {
      clearTimeout(repaint);
      repaint = setTimeout(function () { UI.repaintAll(document); }, 120);
    });
    w.addEventListener('orientationchange', function () {
      setTimeout(function () { UI.repaintAll(document); }, 260);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* 自動化測試用的觀察窗；正常遊玩不會用到 */
  w.__fruitLink = G;
}(window));
