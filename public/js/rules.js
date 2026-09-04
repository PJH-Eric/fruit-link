/* ===== rules.js — 水果連連看的規則核心 =====
 *
 * 這一份是「唯一的規則來源」：瀏覽器（單機）、伺服器（線上）與 Node 測試都 require 同一份，
 * 所以單機和線上不可能長出兩套會漂移的判定。
 *
 * 沒有任何 DOM 相依，也不碰時間以外的外部狀態；
 * 所有隨機都要傳入 rng（見 rng.js），同一個種子一定長出同一張盤面。
 *
 * 盤面表示法
 * ----------
 * 內部是一張「四周多一圈空白」的網格：W = cols + 2、H = rows + 2。
 * 那一圈永遠是空的，連線路徑因此可以繞到盤面外面 —— 這是連連看的標準規則，
 * 少了它，最外圈的水果常常會變成無解。
 *   index = y * W + x       0 = 空格，>0 = 第幾種水果（1 起算）
 *
 * 連線判定
 * --------
 * 兩個相同的水果，路徑只能走上下左右、只能經過空格，
 * 而且「轉彎不超過 2 次」（也就是最多 3 條線段，一般稱三折以內）。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.Rules = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ------------------------------------------------------------ 常數 */

  var MAX_PLAYERS = 6;          // 線上同盤競速的玩家上限
  var COUNTDOWN_MS = 3000;      // 開賽倒數
  var COMBO_WINDOW_MS = 5000;   // 連擊要在幾毫秒內接上
  var COMBO_STEP = 0.1;         // 每一段連擊加成
  var COMBO_MAX_STEPS = 10;     // 加成上限 ×2.0
  var BASE_SCORE = 100;         // 一對的基礎分
  var TIME_BONUS_PER_SEC = 2;   // 單機過關時每剩 1 秒的加分
  var MAX_TURNS = 2;            // 最多轉彎次數（三折以內）
  var SHUFFLE_TRIES = 400;      // 洗牌後重試找解的次數上限
  var STACK_THEME = 'mahjong';   // 只有這個主題會疊起來玩（見下面的疊疊樂盤面）

  /* 四個關卡：格數、水果種類、時間、提示與洗牌次數一起往上調。
     平面盤面把種類數控制在每種水果 2～3 對（4～6 顆），讓重複圖案更容易辨認。
     第一個「幼幼班」是給 3～5 歲小朋友的：盤面很小、只有三種水果、
     時間長到幾乎沒有壓力、提示和洗牌不限次數，而且預設會把水果名稱顯示出來。 */
  var LEVELS = [
    {
      key: 'kids', no: 1, label: '幼幼班 · 一起認水果', short: '幼幼', emoji: '🍼',
      cols: 4, rows: 3, kinds: 3, sec: 600, hints: 99, shuffles: 99, showNames: true,
      stack: { cols: 4, rows: 3 },
      blurb: '4 × 3，只有 3 種水果。格子很大、時間很長、提示和洗牌不限次數，適合 3～5 歲的小朋友。'
    },
    {
      key: 'easy', no: 2, label: '第一關 · 果園入門', short: '簡單', emoji: '🍓',
      cols: 8, rows: 6, kinds: 8, sec: 240, hints: 5, shuffles: 5,
      stack: { cols: 8, rows: 4 },
      blurb: '8 × 6，8 種水果，每種會出現 3 對。時間很寬鬆，先熟悉三折以內怎麼連。'
    },
    {
      key: 'normal', no: 3, label: '第二關 · 果園日常', short: '普通', emoji: '🍍',
      cols: 10, rows: 8, kinds: 14, sec: 300, hints: 3, shuffles: 3,
      stack: { cols: 10, rows: 5 },
      blurb: '10 × 8，14 種水果，每種會出現 2～3 對。提示和洗牌都變少了，要開始看路徑。'
    },
    {
      key: 'hard', no: 4, label: '第三關 · 果園大亂', short: '困難', emoji: '🥑',
      cols: 12, rows: 10, kinds: 20, sec: 360, hints: 2, shuffles: 2,
      stack: { cols: 12, rows: 6 },
      blurb: '12 × 10，20 種水果，每種會出現 3 對（開始混進蔬菜）。眼睛要放亮一點。'
    }
  ];
  /* 次數 >= UNLIMITED 就當成「不限」，畫面上顯示 ∞ 而不是一個大數字 */
  var UNLIMITED = 99;

  var LEVEL_ORDER = LEVELS.map(function (l) { return l.key; });

  function levelOf(key) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].key === key) return LEVELS[i];
    return LEVELS[0];
  }
  function nextLevel(key) {
    var i = LEVEL_ORDER.indexOf(levelOf(key).key);
    return (i >= 0 && i < LEVEL_ORDER.length - 1) ? LEVEL_ORDER[i + 1] : null;
  }
  function roundMsOf(key) { return levelOf(key).sec * 1000; }

  /* ------------------------------------------------------------ 網格工具 */

  function makeGrid(cols, rows) {
    var W = cols + 2, H = rows + 2;
    var g = new Array(W * H);
    for (var i = 0; i < g.length; i++) g[i] = 0;
    return { grid: g, W: W, H: H, cols: cols, rows: rows };
  }

  function xOf(i, W) { return i % W; }
  function yOf(i, W) { return Math.floor(i / W); }
  function idx(x, y, W) { return y * W + x; }

  /** 盤面內部（不含外圈）的所有格子編號，由左上到右下 */
  function innerCells(W, H) {
    var out = [];
    for (var y = 1; y < H - 1; y++) for (var x = 1; x < W - 1; x++) out.push(y * W + x);
    return out;
  }

  /** p、q 之間（不含兩端）是不是一路都是空格；不同列也不同行就回 false */
  function freeBetween(g, W, p, q) {
    if (p === q) return false;
    var px = xOf(p, W), py = yOf(p, W), qx = xOf(q, W), qy = yOf(q, W);
    var i;
    if (py === qy) {
      var a = Math.min(px, qx), b = Math.max(px, qx);
      for (i = a + 1; i < b; i++) if (g[idx(i, py, W)] !== 0) return false;
      return true;
    }
    if (px === qx) {
      var c = Math.min(py, qy), d = Math.max(py, qy);
      for (i = c + 1; i < d; i++) if (g[idx(px, i, W)] !== 0) return false;
      return true;
    }
    return false;
  }

  /** 從 p 出發，四個方向一路走到底，收集沿途所有「空格」 */
  function straightReach(g, W, H, p) {
    var out = [];
    var px = xOf(p, W), py = yOf(p, W), x, y, i;
    for (x = px - 1; x >= 0; x--) { i = idx(x, py, W); if (g[i] !== 0) break; out.push(i); }
    for (x = px + 1; x < W; x++) { i = idx(x, py, W); if (g[i] !== 0) break; out.push(i); }
    for (y = py - 1; y >= 0; y--) { i = idx(px, y, W); if (g[i] !== 0) break; out.push(i); }
    for (y = py + 1; y < H; y++) { i = idx(px, y, W); if (g[i] !== 0) break; out.push(i); }
    return out;
  }

  /** p 到 q 最多一次轉彎：回傳路徑（含兩端）或 null。p 可以是空格，q 是要連到的水果 */
  function oneTurnPath(g, W, p, q) {
    if (freeBetween(g, W, p, q)) return [p, q];
    var px = xOf(p, W), py = yOf(p, W), qx = xOf(q, W), qy = yOf(q, W);
    if (px === qx || py === qy) return null;         // 同行同列走不出轉彎路徑
    var corners = [idx(px, qy, W), idx(qx, py, W)];
    for (var k = 0; k < 2; k++) {
      var c = corners[k];
      if (g[c] !== 0) continue;                       // 轉角自己必須是空的
      if (freeBetween(g, W, p, c) && freeBetween(g, W, c, q)) return [p, c, q];
    }
    return null;
  }

  /**
   * 兩個格子能不能連起來（轉彎 ≤ 2 次）。
   * @returns {number[]|null} 轉折點的格子編號陣列（含頭尾），連不到就回 null
   */
  function link(g, W, H, a, b) {
    if (a === b) return null;
    if (!g[a] || g[a] !== g[b]) return null;

    /* 判定期間先把兩端當成空格，路徑才能貼著它們自己走 */
    var va = g[a], vb = g[b];
    g[a] = 0; g[b] = 0;
    var path = null;

    if (freeBetween(g, W, a, b)) {
      path = [a, b];                                   // 0 折
    } else {
      path = oneTurnPath(g, W, a, b);                  // 1 折
      if (!path) {
        var mids = straightReach(g, W, H, a);          // 2 折
        for (var i = 0; i < mids.length; i++) {
          var sub = oneTurnPath(g, W, mids[i], b);
          if (sub && sub.length === 3) { path = [a].concat(sub); break; }
        }
      }
    }

    g[a] = va; g[b] = vb;
    return path;
  }

  /** 目前盤面上還有沒有解；有的話回傳其中一組 {a, b, path} */
  function findPair(g, W, H) {
    var byKind = {};
    var cells = innerCells(W, H);
    var i, v;
    for (i = 0; i < cells.length; i++) {
      v = g[cells[i]];
      if (!v) continue;
      (byKind[v] || (byKind[v] = [])).push(cells[i]);
    }
    for (var kind in byKind) {
      if (!Object.prototype.hasOwnProperty.call(byKind, kind)) continue;
      var list = byKind[kind];
      for (i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          var p = link(g, W, H, list[i], list[j]);
          if (p) return { a: list[i], b: list[j], path: p };
        }
      }
    }
    return null;
  }

  function countLeft(g, W, H) {
    var cells = innerCells(W, H), n = 0;
    for (var i = 0; i < cells.length; i++) if (g[cells[i]]) n++;
    return n;
  }

  /**
   * 造型主題只是「數字要畫成什麼」，規則完全不在乎，所以這裡只做字元清洗，
   * 真正有沒有這個主題由 themes.js 判斷（rules.js 刻意不認識任何造型）。
   */
  function sanitizeTheme(t) {
    var str = String(t === undefined || t === null ? '' : t).slice(0, 24);
    return /^[a-z0-9_-]+$/i.test(str) ? str : '';
  }

  /* Fisher–Yates，rng 必須是 [0,1) 的函式 */
  function shuffleArray(list, rng) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }

  /**
   * 把還在盤面上的水果重新排一次，並保證重排後「至少還有一組能連」。
   * 位置固定不動的玩法一旦死局就只能靠洗牌，所以這裡一定要驗有解。
   */
  function shuffleBoard(g, W, H, rng) {
    var cells = innerCells(W, H);
    var spots = [], vals = [], i;
    for (i = 0; i < cells.length; i++) {
      if (g[cells[i]]) { spots.push(cells[i]); vals.push(g[cells[i]]); }
    }
    if (spots.length < 2) return false;
    for (var t = 0; t < SHUFFLE_TRIES; t++) {
      shuffleArray(vals, rng);
      for (i = 0; i < spots.length; i++) g[spots[i]] = vals[i];
      if (findPair(g, W, H)) return true;
    }
    /* 極少數情況（例如只剩兩顆卡在角落）洗不出解：
       把同種水果兩兩排在一起，這樣一定連得到。 */
    vals.sort(function (a, b) { return a - b; });
    for (i = 0; i < spots.length; i++) g[spots[i]] = vals[i];
    return !!findPair(g, W, H);
  }

  /**
   * 從主題可用的 maxKinds 種造型裡，隨機抽 kinds 種來當這一局的水果。
   *
   * 這樣同一關每次玩到的組合都不一樣（動物 42 種抽 14 種、國旗 53 種抽 14 種…），
   * 而且因為用的是可注入的 rng，同一個種子一定抽到同一組，線上才能全場一致。
   */
  function pickPalette(maxKinds, kinds, rng) {
    var pool = [];
    for (var i = 0; i < Math.max(1, maxKinds); i++) pool.push(i);
    shuffleArray(pool, rng);
    return pool.slice(0, kinds);
  }

  /**
   * 產生一張新盤面。
   * 每一種水果都成雙成對放進去，洗到「開局就有解」為止。
   */
  function createBoard(cols, rows, kinds, rng) {
    var b = makeGrid(cols, rows);
    var total = cols * rows;
    if (total % 2 !== 0) throw new Error('盤面格數必須是偶數：' + cols + '×' + rows);
    var pairs = total / 2;
    var k = Math.max(1, Math.min(kinds, pairs));
    var vals = [];
    for (var i = 0; i < pairs; i++) {
      var kind = (i % k) + 1;
      vals.push(kind, kind);
    }
    var cells = innerCells(b.W, b.H);
    for (var t = 0; t < SHUFFLE_TRIES; t++) {
      shuffleArray(vals, rng);
      for (var j = 0; j < cells.length; j++) b.grid[cells[j]] = vals[j];
      if (findPair(b.grid, b.W, b.H)) return b;
    }
    for (var m = 0; m < cells.length; m++) b.grid[cells[m]] = vals[m];
    return b;
  }

  /* ------------------------------------------------------------ 疊疊樂盤面（麻將模式）
   *
   * 麻將主題不是平面連連看，而是像真的麻將牌一樣「疊起來」：
   *   - 一張牌佔 2×2 個半格；上面那一層整層往右下偏半格，
   *     所以一張上層牌會壓住下層的 4 張牌（角落與邊上會少於 4 張）。
   *   - 被壓住的牌點不動，畫面上也會壓暗；要先把壓在它上面的牌都消掉。
   *   - 消除規則跟著改成「兩張都露出來、而且是同一種」就好，不用連線 ——
   *     疊起來之後路徑沒有意義（下層根本走不進去）。
   *
   * 位置存在 state.stack（和 state.grid 同一組索引），grid[i] 仍然是「第幾種」，
   * 0 代表已經被消掉，所以 attempt / 分數 / 快照那一套完全不用改索引的形式。
   */

  /** 疊出一座金字塔的座標表；座標單位是半格 */
  function stackLayout(cols, rows) {
    var layers = [], z = 0, c = cols, r = rows;
    while (c >= 2 && r >= 1 && z < 6) {
      /* 偏移量：每往上一層就內縮一格，再往右下推半格，壓住的才會是 4 張 */
      var off = 2 * z + (z % 2);
      var one = [];
      for (var j = 0; j < r; j++) {
        for (var i = 0; i < c; i++) one.push({ x: off + 2 * i, y: off + 2 * j, z: z });
      }
      /* 每一層都要是偶數張：發牌是同一層兩兩配對，這樣才配得完 */
      if (one.length % 2) one.pop();
      if (one.length) layers.push(one);
      z += 1; c -= 2; r -= 2;
    }
    var out = [];
    layers.forEach(function (one) { out = out.concat(one); });
    return out;
  }

  /** 盤面在半格座標下的寬高（給畫面排版用） */
  function stackExtent(pos) {
    var w = 0, h = 0, i;
    for (i = 0; i < pos.length; i++) {
      if (pos[i].x + 2 > w) w = pos[i].x + 2;
      if (pos[i].y + 2 > h) h = pos[i].y + 2;
    }
    return { W: w, H: h };
  }

  /** i 有沒有被上面的牌壓住（只算還在盤面上的牌） */
  function stackCovered(pos, grid, i) {
    var a = pos[i], b, j;
    for (j = 0; j < pos.length; j++) {
      if (j === i || !grid[j]) continue;
      b = pos[j];
      if (b.z > a.z && Math.abs(b.x - a.x) < 2 && Math.abs(b.y - a.y) < 2) return true;
    }
    return false;
  }

  /** 露出來、可以點的牌 */
  function stackFree(pos, grid, i) {
    return !!grid[i] && !stackCovered(pos, grid, i);
  }

  function stackFreeList(pos, grid) {
    var out = [], i;
    for (i = 0; i < grid.length; i++) if (stackFree(pos, grid, i)) out.push(i);
    return out;
  }

  /** 找一組「兩張都露出來、而且同一種」的牌；找不到就回 null */
  function stackFindPair(pos, grid) {
    var free = stackFreeList(pos, grid), seen = {}, i, k;
    for (i = 0; i < free.length; i++) {
      k = grid[free[i]];
      if (seen[k] !== undefined) return { a: seen[k], b: free[i], path: [] };
      seen[k] = free[i];
    }
    return null;
  }

  /**
   * 發牌：由最上層往下，一層之內兩兩配成一對。
   * 每一層都是偶數張，所以「由上往下一層一層拆」一定拆得完 ——
   * 也就是說發出來的盤一定有解，不會一開局就死。
   */
  function createStack(pos, kinds, rng) {
    var grid = [], byLayer = {}, maxZ = 0, i, z, ids, j, kind = 0;
    for (i = 0; i < pos.length; i++) {
      grid[i] = 0;
      if (!byLayer[pos[i].z]) byLayer[pos[i].z] = [];
      byLayer[pos[i].z].push(i);
      if (pos[i].z > maxZ) maxZ = pos[i].z;
    }
    for (z = maxZ; z >= 0; z--) {
      ids = (byLayer[z] || []).slice();
      shuffleArray(ids, rng);
      for (j = 0; j + 1 < ids.length; j += 2) {
        kind = (kind % kinds) + 1;
        grid[ids[j]] = kind;
        grid[ids[j + 1]] = kind;
      }
    }
    var ext = stackExtent(pos);
    return { grid: grid, pos: pos, W: ext.W, H: ext.H };
  }

  /** 洗牌：位置不動，只把剩下的牌重新分配，洗到「有得消」為止 */
  function shuffleStack(pos, grid, rng) {
    var ids = [], vals = [], i, t;
    for (i = 0; i < grid.length; i++) if (grid[i]) { ids.push(i); vals.push(grid[i]); }
    for (t = 0; t < SHUFFLE_TRIES; t++) {
      shuffleArray(vals, rng);
      for (i = 0; i < ids.length; i++) grid[ids[i]] = vals[i];
      if (stackFindPair(pos, grid)) return true;
    }
    return false;
  }

  /** 這個主題要不要疊起來玩 */
  function isStackTheme(theme) { return sanitizeTheme(theme) === STACK_THEME; }

  /** 現在還有沒有能消的一組（平面看路徑，疊疊樂看兩張有沒有都露出來） */
  function hasPair(state) {
    return state.mode === 'stack'
      ? stackFindPair(state.stack, state.grid)
      : findPair(state.grid, state.W, state.H);
  }

  /** 洗牌：兩種盤面各走各的 */
  function reshuffle(state, rng) {
    if (state.mode === 'stack') return shuffleStack(state.stack, state.grid, rng);
    shuffleBoard(state.grid, state.W, state.H, rng);
    return true;
  }

  /* ------------------------------------------------------------ 對局 */

  function makePlayer(p, level) {
    return {
      id: String(p.id),
      name: String(p.name || '玩家'),
      score: 0,
      pairs: 0,
      misses: 0,
      combo: 0,
      bestCombo: 0,
      lastMatchAt: 0,
      hints: level.hints,
      shuffles: level.shuffles,
      finishedAt: 0
    };
  }

  /**
   * 開一場新的對局。單機和線上共用，差別只在 players 有幾個人。
   * @param {{seed:string, players:Array, level:string, now:number,
   *          theme?:string, maxKinds?:number,
   *          countdownMs?:number, roundMs?:number, rng:Function}} o
   */
  function createMatch(o) {
    var level = levelOf(o.level);
    var rng = o.rng;
    if (typeof rng !== 'function') throw new Error('createMatch 需要注入 rng');
    /* 主題能提供的造型數；沒給就當成剛好夠用 */
    var maxKinds = Math.max(1, Math.floor(o.maxKinds || level.kinds));
    /* 麻將主題改成疊疊樂盤面：牌數與「可不可以點」的規則都不一樣 */
    var stacked = isStackTheme(o.theme) && !!level.stack;
    var pos = stacked ? stackLayout(level.stack.cols, level.stack.rows) : null;
    var pairs = (stacked ? pos.length : level.cols * level.rows) / 2;
    var kinds = Math.max(1, Math.min(level.kinds, maxKinds, pairs));
    var palette = pickPalette(maxKinds, kinds, rng);
    var board = stacked ? createStack(pos, kinds, rng) : createBoard(level.cols, level.rows, kinds, rng);
    var total = stacked ? board.grid.length : level.cols * level.rows;
    var countdown = o.countdownMs === undefined ? COUNTDOWN_MS : Math.max(0, o.countdownMs);
    var roundMs = o.roundMs > 0 ? o.roundMs : roundMsOf(level.key);
    var startAt = o.now + countdown;

    var players = {};
    var order = [];
    (o.players || []).forEach(function (p) {
      var m = makePlayer(p, level);
      players[m.id] = m;
      order.push(m.id);
    });

    return {
      seed: String(o.seed || ''),
      level: level.key,
      theme: sanitizeTheme(o.theme),
      /* palette[kind - 1] = 這一局第 kind 種水果要用主題裡的第幾號造型 */
      palette: palette,
      kinds: kinds,
      mode: stacked ? 'stack' : 'flat',
      /* stack[i] = 第 i 張牌的半格座標與層數；平面模式沒有這一項 */
      stack: stacked ? board.pos : null,
      cols: stacked ? level.stack.cols : level.cols,
      rows: stacked ? level.stack.rows : level.rows,
      W: board.W,
      H: board.H,
      grid: board.grid,
      total: total,
      left: total,
      createdAt: o.now,
      startAt: startAt,
      endAt: startAt + roundMs,
      roundMs: roundMs,
      over: false,
      cleared: false,
      draw: false,
      autoShuffles: 0,
      moves: 0,
      players: players,
      order: order
    };
  }

  function phaseOf(state, now) {
    if (state.over) return 'over';
    if (now < state.startAt) return 'countdown';
    return 'playing';
  }

  function comboMultiplier(combo) {
    return 1 + Math.min(COMBO_MAX_STEPS, combo) * COMBO_STEP;
  }

  function finish(state, now, reason) {
    if (state.over) return state;
    state.over = true;
    state.overAt = now;
    state.reason = reason || (state.left === 0 ? 'cleared' : 'timeup');
    state.cleared = state.left === 0;
    /* 單機過關才有剩餘時間加分；時間到就沒有 */
    if (state.cleared) {
      var leftSec = Math.max(0, Math.round((state.endAt - now) / 1000));
      state.timeLeftSec = leftSec;
      state.order.forEach(function (id) {
        var p = state.players[id];
        if (p.pairs > 0) {
          p.timeBonus = leftSec * TIME_BONUS_PER_SEC;
          p.score += p.timeBonus;
        } else {
          p.timeBonus = 0;
        }
      });
    } else {
      state.timeLeftSec = 0;
      state.order.forEach(function (id) { state.players[id].timeBonus = 0; });
    }
    var rank = standings(state);
    state.draw = rank.length > 1 && rank[0].score === rank[1].score;
    return state;
  }

  /** 主迴圈推進：目前只負責「時間到就結算」，但保留事件陣列讓伺服器統一處理 */
  function tick(state, now) {
    var events = [];
    if (state.over) return events;
    if (now >= state.endAt) {
      finish(state, now, 'timeup');
      events.push({ k: 'end', reason: 'timeup' });
    }
    return events;
  }

  /**
   * 有人送出一組連線。這是唯一會改變盤面的入口，線上模式由伺服器獨佔呼叫。
   * @returns {{ok:boolean, event?:object, error?:string, code?:string}}
   */
  function attempt(state, playerId, a, b, now, rng) {
    var p = state.players[String(playerId)];
    if (!p) return { ok: false, error: '你不在這一局裡。', code: 'nomatch' };
    if (state.over) return { ok: false, error: '這一局已經結束了。', code: 'over' };
    if (now < state.startAt) return { ok: false, error: '還在倒數，先別急。', code: 'countdown' };

    a = Number(a); b = Number(b);
    if (!isFinite(a) || !isFinite(b) || a < 0 || b < 0 || a >= state.grid.length || b >= state.grid.length) {
      return { ok: false, error: '格子編號不合法。', code: 'badcell' };
    }
    state.moves += 1;

    /* 疊疊樂沒有路徑：兩張都露出來、而且同一種就算連上 */
    var path = state.mode === 'stack'
      ? ((a !== b && state.grid[a] && state.grid[a] === state.grid[b] &&
          stackFree(state.stack, state.grid, a) && stackFree(state.stack, state.grid, b)) ? [] : null)
      : link(state.grid, state.W, state.H, a, b);
    if (!path) {
      /* 連不到不扣分，只斷連擊 —— 對小朋友友善，也避免亂點被懲罰到不想玩 */
      p.combo = 0;
      p.misses += 1;
      return {
        ok: true,
        event: {
          k: 'miss', by: p.id, a: a, b: b,
          score: p.score, combo: 0, misses: p.misses, left: state.left
        }
      };
    }

    var kind = state.grid[a];
    var inCombo = p.lastMatchAt && (now - p.lastMatchAt) <= COMBO_WINDOW_MS;
    var mult = comboMultiplier(inCombo ? p.combo : 0);
    var gain = Math.round(BASE_SCORE * mult);

    state.grid[a] = 0;
    state.grid[b] = 0;
    state.left -= 2;
    p.score += gain;
    p.pairs += 1;
    p.combo = inCombo ? p.combo + 1 : 1;
    p.bestCombo = Math.max(p.bestCombo, p.combo);
    p.lastMatchAt = now;

    var event = {
      k: 'match', by: p.id, a: a, b: b, kind: kind, path: path.slice(),
      gain: gain, mult: Math.round(mult * 100) / 100,
      score: p.score, combo: p.combo, pairs: p.pairs, left: state.left
    };

    var extra = [];
    if (state.left === 0) {
      finish(state, now, 'cleared');
      extra.push({ k: 'end', reason: 'cleared' });
    } else if (!hasPair(state)) {
      /* 死局：位置固定的玩法一定要自動洗牌，否則玩家只能乾等時間到 */
      reshuffle(state, rng || Math.random);
      state.autoShuffles += 1;
      extra.push({ k: 'shuffle', auto: true, by: null, grid: state.grid.slice(), left: state.left });
    }
    return { ok: true, event: event, extra: extra };
  }

  /** 用一次提示：找出一組還能連的水果 */
  function useHint(state, playerId, now) {
    var p = state.players[String(playerId)];
    if (!p) return { ok: false, error: '你不在這一局裡。', code: 'nomatch' };
    if (state.over) return { ok: false, error: '這一局已經結束了。', code: 'over' };
    if (now < state.startAt) return { ok: false, error: '還在倒數，先別急。', code: 'countdown' };
    if (p.hints <= 0) return { ok: false, error: '提示已經用完了。', code: 'nohint' };
    var hit = hasPair(state);
    if (!hit) return { ok: false, error: '現在沒有可以連的水果，用洗牌吧。', code: 'nopair' };
    p.hints -= 1;
    return {
      ok: true,
      event: { k: 'hint', by: p.id, a: hit.a, b: hit.b, hints: p.hints }
    };
  }

  /** 用一次洗牌 */
  function useShuffle(state, playerId, now, rng) {
    var p = state.players[String(playerId)];
    if (!p) return { ok: false, error: '你不在這一局裡。', code: 'nomatch' };
    if (state.over) return { ok: false, error: '這一局已經結束了。', code: 'over' };
    if (now < state.startAt) return { ok: false, error: '還在倒數，先別急。', code: 'countdown' };
    if (p.shuffles <= 0) return { ok: false, error: '洗牌次數已經用完了。', code: 'noshuffle' };
    if (state.left < 2) return { ok: false, error: '剩下的水果太少了，不用洗。', code: 'nopair' };
    p.shuffles -= 1;
    reshuffle(state, rng || Math.random);
    return {
      ok: true,
      event: { k: 'shuffle', auto: false, by: p.id, grid: state.grid.slice(), left: state.left, shuffles: p.shuffles }
    };
  }

  /** 名次：分數 > 配對數 > 失誤少 > 加入順序 */
  function standings(state) {
    var rows = state.order.map(function (id, i) {
      var p = state.players[id];
      return {
        id: p.id, name: p.name, score: p.score, pairs: p.pairs,
        misses: p.misses, bestCombo: p.bestCombo, timeBonus: p.timeBonus || 0, seat: i
      };
    });
    rows.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.pairs !== a.pairs) return b.pairs - a.pairs;
      if (a.misses !== b.misses) return a.misses - b.misses;
      return a.seat - b.seat;
    });
    var rank = 0, prev = null;
    rows.forEach(function (r, i) {
      if (prev === null || r.score !== prev) { rank = i + 1; prev = r.score; }
      r.rank = rank;
    });
    return rows;
  }

  /** 給前端／網路用的快照。沒有隱藏資訊，觀戰者看到的和玩家一樣。 */
  function snapshot(state, now) {
    return {
      seed: state.seed,
      level: state.level,
      theme: state.theme,
      palette: state.palette.slice(),
      kinds: state.kinds,
      mode: state.mode || 'flat',
      /* 疊疊樂才有：每一張牌的半格座標與層數，觀戰者也要拿到才畫得出同一疊 */
      stack: state.stack ? state.stack.slice() : null,
      cols: state.cols,
      rows: state.rows,
      W: state.W,
      H: state.H,
      grid: state.grid.slice(),
      total: state.total,
      left: state.left,
      startAt: state.startAt,
      endAt: state.endAt,
      roundMs: state.roundMs,
      phase: phaseOf(state, now),
      over: state.over,
      cleared: state.cleared,
      draw: state.draw,
      autoShuffles: state.autoShuffles,
      remainMs: Math.max(0, state.endAt - now),
      players: state.order.map(function (id) {
        var p = state.players[id];
        return {
          id: p.id, name: p.name, score: p.score, pairs: p.pairs, misses: p.misses,
          combo: p.combo, bestCombo: p.bestCombo, hints: p.hints, shuffles: p.shuffles
        };
      }),
      standings: state.over ? standings(state) : null
    };
  }

  return {
    MAX_PLAYERS: MAX_PLAYERS,
    COUNTDOWN_MS: COUNTDOWN_MS,
    COMBO_WINDOW_MS: COMBO_WINDOW_MS,
    COMBO_MAX_STEPS: COMBO_MAX_STEPS,
    BASE_SCORE: BASE_SCORE,
    TIME_BONUS_PER_SEC: TIME_BONUS_PER_SEC,
    MAX_TURNS: MAX_TURNS,
    UNLIMITED: UNLIMITED,
    LEVELS: LEVELS,
    LEVEL_ORDER: LEVEL_ORDER,
    levelOf: levelOf,
    nextLevel: nextLevel,
    roundMsOf: roundMsOf,

    makeGrid: makeGrid,
    innerCells: innerCells,
    xOf: xOf,
    yOf: yOf,
    idx: idx,
    freeBetween: freeBetween,
    link: link,
    findPair: findPair,
    countLeft: countLeft,
    shuffleBoard: shuffleBoard,
    createBoard: createBoard,
    STACK_THEME: STACK_THEME,
    isStackTheme: isStackTheme,
    stackLayout: stackLayout,
    stackCovered: stackCovered,
    stackFree: stackFree,
    stackFreeList: stackFreeList,
    stackFindPair: stackFindPair,
    createStack: createStack,
    shuffleStack: shuffleStack,
    hasPair: hasPair,
    reshuffle: reshuffle,
    pickPalette: pickPalette,
    sanitizeTheme: sanitizeTheme,

    createMatch: createMatch,
    phaseOf: phaseOf,
    comboMultiplier: comboMultiplier,
    attempt: attempt,
    useHint: useHint,
    useShuffle: useShuffle,
    tick: tick,
    finish: finish,
    standings: standings,
    snapshot: snapshot
  };
}));
