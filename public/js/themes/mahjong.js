/* ===== themes/mahjong.js — 麻將造型庫（純資料，無 DOM 相依） =====
 *
 * 一副麻將的 34 種牌：筒子 1～9、條子 1～9、萬子 1～9，加上東南西北中發白。
 *
 * 【為什麼這一組可以用 <text>】
 * 其他主題一律不用文字（emoji 會被作業系統換成彩色圖，長相不受控）。
 * 但萬子與字牌本來就「是字」，硬用向量描邊反而畫得四不像；中文字型全站
 * 本來就在用（介面全是繁體中文），字型堆疊也和 body 同一套，所以這裡改用
 * <text>，只有這個主題例外。筒子與條子仍然是純圖形。
 *
 * 【怎麼分辨】
 * 34 張牌都是同一塊象牙色牌面，所以「數量」以外還靠顏色拉開距離：
 * 筒子是藍／綠／紅的同心圓、條子是綠色竹節（五條與七條有紅節）、
 * 萬子是黑色數字配紅色「萬」、字牌則各有自己的顏色。
 *
 * 不使用漸層（同一張盤面會貼上幾十份相同 SVG，重複 id 在消除動畫時會出問題）。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THEME_MAHJONG = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var INK = '#3B2C22';
  var GREEN = '#2E7A4A';
  var GREEN_D = '#1E5A34';
  var RED = '#C4302B';
  var BLUE = '#1F4E9C';
  var DARK = '#2B2B2B';
  /* 和 body 同一套字型堆疊；屬性值用雙引號包住，裡面的字型名稱用單引號 */
  var FONT = "'Yuanti TC','PingFang TC','Microsoft JhengHei','Noto Sans TC',serif";
  var MARK_SCALE = 0.72;       // 牌面符號縮小，留下接近實體麻將的象牙色留白
  var MARK_CENTER_Y = 48;      // 對齊前牌面（y=6～90）的幾何中心

  /** 牌身：右下先畫一塊綠色牌背當厚度，再蓋上象牙色牌面 */
  function tile(inner) {
    return '<rect x="26" y="11" width="58" height="84" rx="10" fill="#4E8A5E" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<rect x="21" y="6" width="58" height="84" rx="10" fill="#FBF6E4" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<rect x="26" y="11" width="48" height="74" rx="7" fill="#F3EAD2"/>' +
      '<path d="M26 16 A5 5 0 0 1 31 11 L69 11" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.75"/>' +
      '<g transform="translate(50 ' + MARK_CENTER_Y + ') scale(' + MARK_SCALE + ') translate(-50 -50)">' + inner + '</g>';
  }

  /** 一顆筒：外環 → 中心色 → 小點，三層同心圓 */
  function dot(cx, cy, r, outer, inner) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + outer + '" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.56).toFixed(2) + '" fill="' + inner + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.2).toFixed(2) + '" fill="' + outer + '"/>';
  }

  /** 一根條：竹節狀的直桿，兩端各一道箍 */
  function stick(cx, cy, h, fill) {
    var w = h * 0.38, x = cx - w / 2, y = cy - h / 2;
    return '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + h +
      '" rx="' + (w / 2).toFixed(2) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<path d="M' + x.toFixed(2) + ' ' + (y + h * 0.3).toFixed(2) + ' h' + w.toFixed(2) +
      ' M' + x.toFixed(2) + ' ' + (y + h * 0.7).toFixed(2) + ' h' + w.toFixed(2) +
      '" stroke="' + INK + '" stroke-width="1.4" opacity="0.7"/>';
  }

  /** 牌面上的字。size 是字級，y 是基線 */
  function glyph(ch, y, size, fill) {
    return '<text x="50" y="' + y + '" text-anchor="middle" font-family="' + FONT + '" font-size="' + size +
      '" font-weight="900" fill="' + fill + '">' + ch + '</text>';
  }

  /** 依座標表把一組同樣大小的圖形排好 */
  function lay(spots, draw) {
    var out = '', i;
    for (i = 0; i < spots.length; i++) out += draw(spots[i][0], spots[i][1], i);
    return out;
  }

  /* 每一個數字的排法（座標都落在牌面的 x 30~70、y 22~78 之間） */
  var SPOTS = {
    1: [[50, 50]],
    2: [[50, 35], [50, 65]],
    3: [[36, 31], [50, 50], [64, 69]],
    4: [[38, 34], [62, 34], [38, 66], [62, 66]],
    5: [[37, 32], [63, 32], [50, 50], [37, 68], [63, 68]],
    6: [[38, 28], [62, 28], [38, 50], [62, 50], [38, 72], [62, 72]],
    7: [[36, 25], [50, 31], [64, 37], [38, 56], [62, 56], [38, 74], [62, 74]],
    8: [[38, 25], [62, 25], [38, 41], [62, 41], [38, 58], [62, 58], [38, 74], [62, 74]],
    9: [[35, 28], [50, 28], [65, 28], [35, 50], [50, 50], [65, 50], [35, 72], [50, 72], [65, 72]]
  };
  var DOT_R = { 1: 14, 2: 11, 3: 10, 4: 10, 5: 9, 6: 8.6, 7: 7.6, 8: 7.4, 9: 7.6 };
  var STICK_H = { 1: 26, 2: 26, 3: 24, 4: 24, 5: 22, 6: 21, 7: 18, 8: 18, 9: 18 };
  /* 傳統牌面的配色：一筒是紅心大圈，五筒中間紅，九筒上下藍紅 */
  var DOT_COLORS = {
    1: [[BLUE, RED]],
    2: [[GREEN, BLUE], [BLUE, GREEN]],
    3: [[BLUE, GREEN], [GREEN, RED], [RED, GREEN]],
    4: [[BLUE, GREEN], [GREEN, BLUE], [GREEN, BLUE], [BLUE, GREEN]],
    5: [[BLUE, GREEN], [GREEN, BLUE], [RED, GREEN], [GREEN, BLUE], [BLUE, GREEN]],
    6: [[GREEN, BLUE], [GREEN, BLUE], [RED, GREEN], [RED, GREEN], [GREEN, BLUE], [GREEN, BLUE]],
    7: [[GREEN, RED], [GREEN, RED], [GREEN, RED], [BLUE, GREEN], [BLUE, GREEN], [BLUE, GREEN], [BLUE, GREEN]],
    8: [[BLUE, GREEN], [BLUE, GREEN], [BLUE, GREEN], [BLUE, GREEN], [GREEN, BLUE], [GREEN, BLUE], [GREEN, BLUE], [GREEN, BLUE]],
    9: [[RED, GREEN], [RED, GREEN], [RED, GREEN], [BLUE, GREEN], [BLUE, GREEN], [BLUE, GREEN], [GREEN, RED], [GREEN, RED], [GREEN, RED]]
  };
  /* 五條中間、七條最上面那一根是紅的，和真的牌一樣 */
  var STICK_RED = { 5: [2], 7: [1], 1: [] };

  var NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var LIST = [];
  var n;

  /* ---- 筒子 1～9 ---- */
  for (n = 1; n <= 9; n++) {
    LIST.push((function (k) {
      var colors = DOT_COLORS[k];
      return {
        id: 'dot-' + k, label: NUM[k - 1] + '筒',
        svg: tile(lay(SPOTS[k], function (x, y, i) {
          return dot(x, y, DOT_R[k], colors[i][0], colors[i][1]);
        }))
      };
    }(n)));
  }

  /* ---- 條子 1～9（一條照傳統畫成一隻鳥） ---- */
  LIST.push({
    id: 'bam-1', label: '一條',
    svg: tile('<path d="M50 30 C60 30 66 38 66 48 C66 60 58 70 50 74 C42 70 34 60 34 48 C34 38 40 30 50 30 Z" ' +
      'fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M58 34 C64 38 66 44 66 48 C66 60 58 70 50 74 C58 66 62 56 62 46 C62 40 60 36 58 34 Z" fill="' + GREEN_D + '" opacity="0.85"/>' +
      '<circle cx="50" cy="30" r="9" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<path d="M50 21 C48 15 52 12 56 14" fill="none" stroke="' + RED + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M41 30 L32 33 L41 35 Z" fill="#E8B23C" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<circle cx="53" cy="28" r="2" fill="' + INK + '"/>' +
      '<path d="M42 44 C46 50 46 58 42 64 M58 44 C54 50 54 58 58 64" fill="none" stroke="' + GREEN_D + '" stroke-width="1.8"/>' +
      '<path d="M46 74 L44 82 M54 74 L56 82" stroke="' + RED + '" stroke-width="2.4" stroke-linecap="round"/>')
  });
  for (n = 2; n <= 9; n++) {
    LIST.push((function (k) {
      var red = STICK_RED[k] || [];
      return {
        id: 'bam-' + k, label: NUM[k - 1] + '條',
        svg: tile(lay(SPOTS[k], function (x, y, i) {
          return stick(x, y, STICK_H[k], red.indexOf(i) >= 0 ? RED : GREEN);
        }))
      };
    }(n)));
  }

  /* ---- 萬子 1～9：上面是數字，下面是紅色的「萬」 ---- */
  for (n = 1; n <= 9; n++) {
    LIST.push((function (k) {
      return {
        id: 'man-' + k, label: NUM[k - 1] + '萬',
        svg: tile(glyph(NUM[k - 1], 45, 30, DARK) + glyph('萬', 80, 30, RED))
      };
    }(n)));
  }

  /* ---- 字牌：東南西北中發白 ---- */
  [['east', '東', BLUE], ['south', '南', BLUE], ['west', '西', BLUE], ['north', '北', BLUE],
    ['red', '中', RED], ['green', '發', GREEN]].forEach(function (w) {
    LIST.push({ id: 'honor-' + w[0], label: w[1], svg: tile(glyph(w[1], 66, 46, w[2])) });
  });
  /* 白板：沒有字，只有一個藍色的框 */
  LIST.push({
    id: 'honor-white', label: '白',
    svg: tile('<rect x="32" y="24" width="36" height="52" rx="4" fill="none" stroke="' + BLUE + '" stroke-width="3.4"/>' +
      '<rect x="37" y="29" width="26" height="42" rx="2" fill="none" stroke="' + BLUE + '" stroke-width="1.8" opacity="0.55"/>')
  });

  return {
    key: 'mahjong',
    label: '麻將',
    emoji: '🀄',
    note: '一副 34 張的麻將牌；這個主題會疊起來玩',
    list: LIST
  };
}));
