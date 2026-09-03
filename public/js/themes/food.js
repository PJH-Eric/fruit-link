/* ===== themes/food.js — 食物造型庫（純資料，無 DOM 相依） =====
 *
 * 每一個項目就是一段 100x100 viewBox 的 SVG 內容：粗描邊 #5B4636、腮紅、笑臉，
 * 和同系列其他小遊戲用的是同一套可愛風格。
 *
 * 全部都是向量手繪，沒有用 emoji 文字 —— emoji 會被作業系統的字型影響，
 * 換一台裝置就換一種長相，而且線條風格和動物、蔬果、國旗對不起來。
 *
 * 盤面只認「第幾種」這個數字，造型換掉不影響任何規則。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THEME_FOOD = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var INK = '#5B4636';

  /** 共用表情：眼睛 + 腮紅 + 笑臉。cy 是眼睛高度，s 是兩眼間距的一半 */
  function face(cy, s, blush) {
    s = s || 7;
    var b = (blush === undefined) ? s + 7 : blush;
    return '<circle cx="' + (50 - s) + '" cy="' + cy + '" r="2.6" fill="' + INK + '"/>' +
      '<circle cx="' + (50 + s) + '" cy="' + cy + '" r="2.6" fill="' + INK + '"/>' +
      '<ellipse cx="' + (50 - b) + '" cy="' + (cy + 7) + '" rx="4.4" ry="2.9" fill="#FFAFC5" opacity="0.7"/>' +
      '<ellipse cx="' + (50 + b) + '" cy="' + (cy + 7) + '" rx="4.4" ry="2.9" fill="#FFAFC5" opacity="0.7"/>' +
      '<path d="M44 ' + (cy + 7) + ' Q50 ' + (cy + 13) + ' 56 ' + (cy + 7) + '" fill="none" stroke="' + INK +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /** 只有眼睛和嘴巴，沒有腮紅：畫在深色或很滿的食物上比較清楚 */
  function eyes(cy, s) {
    s = s || 7;
    return '<circle cx="' + (50 - s) + '" cy="' + cy + '" r="2.6" fill="' + INK + '"/>' +
      '<circle cx="' + (50 + s) + '" cy="' + cy + '" r="2.6" fill="' + INK + '"/>' +
      '<path d="M44 ' + (cy + 7) + ' Q50 ' + (cy + 13) + ' 56 ' + (cy + 7) + '" fill="none" stroke="' + INK +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /** 碗：拉麵、熱湯、沙拉、刨冰共用同一個碗，看起來才像同一套餐具 */
  function bowl(color, y) {
    y = y || 52;
    return '<path d="M12 ' + y + ' L88 ' + y + ' C86 ' + (y + 30) + ' 72 ' + (y + 38) + ' 50 ' + (y + 38) +
      ' C28 ' + (y + 38) + ' 14 ' + (y + 30) + ' 12 ' + y + ' Z" fill="' + color +
      '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<ellipse cx="50" cy="' + y + '" rx="38" ry="9" fill="' + color + '" stroke="' + INK + '" stroke-width="3"/>';
  }

  /** 杯子：咖啡、牛奶、果汁共用 */
  function cup(fill) {
    return '<path d="M28 30 L72 30 L66 84 C66 89 34 89 34 84 Z" fill="#FFFDF8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M31 44 L69 44 L64 82 C64 86 36 86 36 82 Z" fill="' + fill + '"/>' +
      '<path d="M28 30 L72 30" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
  }

  var BASE = [
    {
      id: 'food1', label: '漢堡',
      svg: '<path d="M14 34 C14 20 30 12 50 12 C70 12 86 20 86 34 Z" fill="#E0A85A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="34" cy="24" r="2" fill="#FFF0DE"/><circle cx="50" cy="20" r="2" fill="#FFF0DE"/><circle cx="64" cy="25" r="2" fill="#FFF0DE"/>' +
        '<path d="M12 34 L88 34 C90 40 88 44 84 44 L16 44 C12 44 10 40 12 34 Z" fill="#8FCB5F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<rect x="14" y="44" width="72" height="14" rx="4" fill="#B0603C" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="16" y="58" width="68" height="10" rx="4" fill="#FFD24C" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M14 68 L86 68 C86 80 70 86 50 86 C30 86 14 80 14 68 Z" fill="#D9A25E" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' + face(52, 9, 19)
    },
    {
      id: 'food2', label: '披薩',
      svg: '<path d="M50 8 L92 84 C76 92 24 92 8 84 Z" fill="#FFD98A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M13 82 C28 89 72 89 87 82 C88 86 88 88 88 88 C72 94 28 94 12 88 Z" fill="#D9A25E" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="34" cy="56" r="6" fill="#E8434F" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="66" cy="60" r="6" fill="#E8434F" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="50" cy="30" r="5" fill="#E8434F" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="30" cy="74" r="4" fill="#8FCB5F"/><circle cx="70" cy="76" r="4" fill="#8FCB5F"/>' + eyes(50, 9)
    },
    {
      id: 'food3', label: '壽司',
      svg: '<path d="M18 52 C18 42 30 36 50 36 C70 36 82 42 82 52 L82 68 C82 78 70 84 50 84 C30 84 18 78 18 68 Z" ' +
        'fill="#FFF6E4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M16 30 C16 22 30 16 50 16 C70 16 84 22 84 30 C84 38 70 44 50 44 C30 44 16 38 16 30 Z" ' +
        'fill="#FF8FA8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M24 26 C36 22 64 22 76 26" fill="none" stroke="#FFC2C9" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="42" y="46" width="16" height="40" rx="3" fill="#3B4A3A" stroke="' + INK + '" stroke-width="3"/>' + face(62, 13, 24)
    },
    {
      id: 'food4', label: '飯糰',
      svg: '<path d="M50 12 L88 80 C76 86 24 86 12 80 Z" fill="#FFFDF8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M28 62 L72 62 L76 80 C66 85 34 85 24 80 Z" fill="#3B4A3A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="36" cy="38" r="2.4" fill="#E8E2D6"/><circle cx="60" cy="44" r="2.4" fill="#E8E2D6"/>' + face(46)
    },
    {
      id: 'food5', label: '拉麵',
      svg: bowl('#E8434F') +
        '<path d="M24 50 C30 40 40 38 50 40 C60 42 70 40 76 50" fill="none" stroke="#FFE08A" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M28 46 C34 36 44 34 52 36" fill="none" stroke="#F5C84C" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="34" cy="46" r="7" fill="#FFF6E4" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="34" cy="46" r="3" fill="#FFB74D"/>' +
        '<rect x="58" y="40" width="14" height="10" rx="3" fill="#C4703C" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M66 22 L88 34 M72 18 L94 30" stroke="#E8D2A8" stroke-width="4" stroke-linecap="round"/>' + face(66, 8, 17)
    },
    {
      id: 'food6', label: '墨西哥捲',
      svg: '<path d="M24 84 C16 66 22 34 44 20 C58 12 74 14 80 22 C86 32 78 44 70 52 C58 64 52 76 50 88 Z" ' +
        'fill="#F0D9A8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M44 20 C56 24 62 34 62 44 C62 52 56 58 48 58" fill="none" stroke="#D9BE86" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M70 18 C78 16 84 20 84 26 C80 30 72 28 68 24 Z" fill="#8FCB5F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M74 26 C82 26 86 30 84 34 C78 36 72 32 70 28 Z" fill="#E8434F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' + face(62, 7, 15)
    },
    {
      id: 'food7', label: '三明治',
      svg: '<path d="M12 76 L50 20 L88 76 Z" fill="#F5DFA8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M24 58 L76 58 L82 66 L18 66 Z" fill="#FFD24C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M20 66 L80 66 L86 74 L14 74 Z" fill="#8FCB5F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M14 74 L86 74 L88 80 L12 80 Z" fill="#F5DFA8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' + face(44, 7, 14)
    },
    {
      id: 'food8', label: '熱狗',
      svg: '<path d="M8 60 C8 44 26 38 50 38 C74 38 92 44 92 60 C92 74 74 80 50 80 C26 80 8 74 8 60 Z" ' +
        'fill="#E8B76B" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M14 52 C22 44 34 42 50 42 C66 42 78 44 86 52 C80 60 66 62 50 62 C34 62 20 60 14 52 Z" ' +
        'fill="#D9543C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M20 46 C30 56 40 44 50 54 C60 44 70 56 80 46" fill="none" stroke="#FFD24C" stroke-width="4" stroke-linecap="round"/>' + face(70, 8, 17)
    }
  ].concat([
    {
      id: 'food9', label: '薯條',
      svg: '<rect x="28" y="16" width="10" height="46" rx="3" fill="#FFD24C" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="45" y="10" width="10" height="52" rx="3" fill="#FFE08A" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="62" y="18" width="10" height="44" rx="3" fill="#FFD24C" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M22 52 L78 52 L72 90 C72 94 28 94 28 90 Z" fill="#E8434F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' + face(68, 8, 17)
    },
    {
      id: 'food10', label: '牛排',
      svg: '<path d="M14 56 C14 34 34 22 56 24 C80 26 92 42 88 60 C84 78 62 86 42 82 C24 78 14 70 14 56 Z" ' +
        'fill="#C4553C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M26 54 C26 40 40 32 56 34 C72 36 80 46 78 58 C76 70 60 76 46 73 C34 70 26 64 26 54 Z" fill="#E0705A"/>' +
        '<path d="M36 44 C44 42 52 44 58 50" fill="none" stroke="#A8402C" stroke-width="2.6" stroke-linecap="round"/>' + face(58, 8, 17)
    },
    {
      id: 'food11', label: '烤雞',
      svg: '<path d="M62 46 C78 46 88 60 84 74 C80 88 62 92 50 84 C40 78 40 62 48 52 Z" fill="#D9A25E" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M50 54 L26 30 C20 24 14 26 12 32 C10 38 16 42 22 40 L46 62 Z" fill="#F5EFE4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M66 58 C74 58 78 64 76 70" fill="none" stroke="#B0803C" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="58" cy="66" r="2.6" fill="' + INK + '"/><circle cx="72" cy="66" r="2.6" fill="' + INK + '"/>' +
        '<path d="M59 74 Q65 79 71 74" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: 'food12', label: '荷包蛋',
      svg: '<path d="M18 52 C10 40 20 26 34 26 C42 18 58 18 66 26 C82 26 92 42 82 54 C88 66 78 80 64 78 C56 86 40 84 34 76 C18 76 10 62 18 52 Z" ' +
        'fill="#FFFDF8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="50" r="18" fill="#FFC93C" stroke="' + INK + '" stroke-width="3"/>' + face(46)
    },
    {
      id: 'food13', label: '起司',
      svg: '<path d="M12 44 L88 30 L88 72 C88 78 12 84 12 78 Z" fill="#FFD24C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M12 44 L88 30 L70 20 L20 34 Z" fill="#FFE694" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="72" cy="52" r="6" fill="#E8B430"/><circle cx="78" cy="66" r="4" fill="#E8B430"/>' +
        '<circle cx="24" cy="62" r="5" fill="#E8B430"/>' + eyes(56, 8)
    },
    {
      id: 'food14', label: '吐司',
      svg: '<path d="M18 40 C18 26 30 18 50 18 C70 18 82 26 82 40 L82 82 C82 86 18 86 18 82 Z" ' +
        'fill="#F5DFA8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M26 46 C26 36 34 30 50 30 C66 30 74 36 74 46 L74 78 C74 80 26 80 26 78 Z" fill="#FFF0CE"/>' + face(54)
    },
    {
      id: 'food15', label: '可頌',
      svg: '<path d="M10 66 C10 44 30 30 50 30 C70 30 90 44 90 66 C82 72 72 70 66 62 C60 70 40 70 34 62 C28 70 18 72 10 66 Z" ' +
        'fill="#E8B76B" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M34 62 C34 48 42 38 50 38 C58 38 66 48 66 62" fill="none" stroke="#C99442" stroke-width="3" stroke-linecap="round"/>' + face(58, 8, 18)
    },
    {
      id: 'food16', label: '水餃',
      svg: '<path d="M16 50 C16 34 32 26 50 26 C68 26 84 34 84 50 C84 68 68 80 50 80 C32 80 16 68 16 50 Z" ' +
        'fill="#FFF6E4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M16 50 C22 40 28 40 32 48 C36 40 44 38 48 46 C52 38 60 40 64 48 C68 40 78 40 84 50" ' +
        'fill="#FFEFD0" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' + face(60)
    },
    {
      id: 'food17', label: '熱湯',
      svg: bowl('#A9C0D8') +
        '<ellipse cx="50" cy="52" rx="32" ry="7" fill="#E8B76B"/>' +
        '<circle cx="36" cy="51" r="4" fill="#8FCB5F"/><circle cx="62" cy="53" r="4" fill="#FF9A4D"/>' +
        '<path d="M36 34 C32 28 40 24 36 18 M64 34 C60 28 68 24 64 18" fill="none" stroke="#C4C0CC" stroke-width="3" stroke-linecap="round"/>' + face(66, 8, 17)
    },
    {
      id: 'food18', label: '沙拉',
      svg: bowl('#FFF6E4') +
        '<circle cx="32" cy="46" r="11" fill="#8FCB5F" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="62" cy="42" r="12" fill="#A8D96B" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="47" cy="36" r="8" fill="#E8434F" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="74" cy="50" r="7" fill="#FF9A4D" stroke="' + INK + '" stroke-width="2.6"/>' + face(66, 8, 17)
    },
    {
      id: 'food19', label: '咖哩飯',
      svg: '<ellipse cx="50" cy="70" rx="42" ry="15" fill="#FFFDF8" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M12 60 C18 42 32 34 50 34 C50 50 40 60 24 66 Z" fill="#FFFDF8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M50 34 C70 34 86 46 88 62 C74 70 58 68 50 58 Z" fill="#C4703C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="70" cy="52" r="4" fill="#FF9A4D"/><circle cx="79" cy="60" r="3.4" fill="#8FCB5F"/>' + eyes(52, 8)
    },
    {
      id: 'food20', label: '便當',
      svg: '<rect x="10" y="26" width="80" height="56" rx="9" fill="#C4553C" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="16" y="32" width="68" height="44" rx="6" fill="#FFF6E4" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<rect x="20" y="36" width="26" height="36" rx="4" fill="#FFFDF8" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="33" cy="54" r="6" fill="#E8434F"/>' +
        '<rect x="50" y="36" width="30" height="16" rx="4" fill="#D9A25E" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<rect x="50" y="56" width="30" height="16" rx="4" fill="#8FCB5F" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="60" cy="44" r="2.2" fill="' + INK + '"/><circle cx="70" cy="44" r="2.2" fill="' + INK + '"/>' +
        '<path d="M61 48 Q65 51 69 48" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>'
    },
    {
      id: 'food21', label: '爆米花',
      svg: '<circle cx="34" cy="34" r="10" fill="#FFF0CE" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="52" cy="26" r="11" fill="#FFF6E4" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="68" cy="34" r="10" fill="#FFF0CE" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M24 44 L76 44 L70 86 C70 90 30 90 30 86 Z" fill="#E8434F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M34 46 L35 88 M50 46 L50 88 M66 46 L65 88" stroke="#FFFDF8" stroke-width="6"/>' +
        '<path d="M24 44 L76 44" stroke="' + INK + '" stroke-width="3"/>' + eyes(62, 8)
    },
    {
      id: 'food22', label: '蛋糕',
      svg: '<path d="M16 46 L84 46 L84 82 C84 86 16 86 16 82 Z" fill="#FFE0EC" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M16 62 L84 62" stroke="#F5B7CE" stroke-width="6"/>' +
        '<path d="M16 46 C16 38 30 32 50 32 C70 32 84 38 84 46 C74 52 60 50 50 46 C40 50 26 52 16 46 Z" ' +
        'fill="#FFFDF8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="26" r="7" fill="#E8434F" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M52 20 C54 14 60 14 60 18" fill="none" stroke="#8FCB5F" stroke-width="3" stroke-linecap="round"/>' + face(70, 8, 17)
    },
    {
      id: 'food23', label: '杯子蛋糕',
      svg: '<path d="M22 54 C22 36 34 24 50 24 C66 24 78 36 78 54 C68 60 60 56 50 58 C40 56 32 60 22 54 Z" ' +
        'fill="#FFE0EC" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M26 54 L74 54 L66 86 C66 90 34 90 34 86 Z" fill="#E8B76B" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M38 56 L36 88 M50 56 L50 90 M62 56 L64 88" stroke="#C99442" stroke-width="3"/>' +
        '<circle cx="50" cy="18" r="6" fill="#E8434F" stroke="' + INK + '" stroke-width="2.6"/>' + face(42, 8, 17)
    },
    {
      id: 'food24', label: '甜甜圈',
      svg: '<circle cx="50" cy="54" r="34" fill="#E8B76B" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M16 54 C16 34 32 20 50 20 C68 20 84 34 84 54 C78 62 74 52 66 58 C58 64 52 54 44 60 C36 66 30 56 22 62 C18 60 16 58 16 54 Z" ' +
        'fill="#FF8FA8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="54" r="12" fill="#FFF8EC" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M30 34 L34 30 M50 28 L54 32 M68 38 L72 34" stroke="#FFD24C" stroke-width="3.4" stroke-linecap="round"/>' +
        '<circle cx="28" cy="52" r="2.8" fill="' + INK + '"/><circle cx="72" cy="52" r="2.8" fill="' + INK + '"/>' +
        '<ellipse cx="22" cy="62" rx="4.2" ry="2.7" fill="#FFAFC5" opacity="0.7"/>' +
        '<ellipse cx="78" cy="62" rx="4.2" ry="2.7" fill="#FFAFC5" opacity="0.7"/>'
    },
    {
      id: 'food25', label: '餅乾',
      svg: '<circle cx="50" cy="54" r="34" fill="#D9A25E" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="32" cy="36" r="4.4" fill="#6B4526"/><circle cx="70" cy="40" r="4.4" fill="#6B4526"/>' +
        '<circle cx="72" cy="68" r="4.4" fill="#6B4526"/><circle cx="28" cy="70" r="4.4" fill="#6B4526"/>' +
        '<circle cx="50" cy="80" r="3.6" fill="#6B4526"/>' + face(50)
    },
    {
      id: 'food26', label: '巧克力',
      svg: '<rect x="16" y="24" width="68" height="60" rx="7" fill="#6B4526" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M39 30 L39 84 M61 30 L61 84 M16 46 L84 46 M16 66 L84 66" stroke="#4A3018" stroke-width="3"/>' +
        '<path d="M16 24 L84 24 L84 30 L16 30 Z" fill="#8A5C33"/>' + eyes(56, 8)
    },
    {
      id: 'food27', label: '糖果',
      svg: '<path d="M28 50 L10 34 C6 30 8 24 14 26 L32 34 Z" fill="#FFD9E4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M28 62 L10 78 C6 82 8 88 14 86 L32 78 Z" fill="#FFD9E4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M72 50 L90 34 C94 30 92 24 86 26 L68 34 Z" fill="#FFD9E4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M72 62 L90 78 C94 82 92 88 86 86 L68 78 Z" fill="#FFD9E4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="56" rx="26" ry="24" fill="#FF8FA8" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M32 46 C38 54 38 60 32 66" fill="none" stroke="#FFD9E4" stroke-width="4" stroke-linecap="round"/>' + face(52)
    },
    {
      id: 'food28', label: '冰淇淋',
      svg: '<path d="M34 52 L66 52 L54 92 C53 95 47 95 46 92 Z" fill="#E8B76B" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M38 60 L60 74 M44 78 L56 60" stroke="#C99442" stroke-width="2.6"/>' +
        '<circle cx="34" cy="44" r="16" fill="#FFD9E4" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="66" cy="44" r="16" fill="#A9E7D2" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="50" cy="26" r="16" fill="#FFE08A" stroke="' + INK + '" stroke-width="3"/>' + eyes(24, 6)
    },
    {
      id: 'food29', label: '刨冰',
      svg: bowl('#FFFDF8', 50) +
        '<path d="M22 46 C22 24 34 12 50 12 C66 12 78 24 78 46 C66 40 58 44 50 40 C42 44 34 40 22 46 Z" ' +
        'fill="#EAF6FF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M26 38 C34 22 44 16 50 16 C56 16 66 22 74 38 C64 32 58 36 50 32 C42 36 36 32 26 38 Z" fill="#FF8FA8"/>' + face(62, 8, 17)
    },
    {
      id: 'food30', label: '咖啡',
      svg: cup('#6B4526') +
        '<path d="M72 44 C86 44 88 62 72 64" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M40 22 C36 16 44 12 40 6 M60 22 C56 16 64 12 60 6" fill="none" stroke="#C4C0CC" stroke-width="3" stroke-linecap="round"/>' + face(60, 8, 16)
    },
    {
      id: 'food31', label: '牛奶',
      svg: cup('#FFFDF8') +
        '<path d="M31 52 C40 46 60 46 69 52" fill="none" stroke="#E8E2D6" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="40" y="12" width="20" height="18" rx="4" fill="#A9C0D8" stroke="' + INK + '" stroke-width="3"/>' + face(62, 8, 16)
    },
    {
      id: 'food32', label: '果汁',
      svg: cup('#FF9A4D') +
        '<path d="M58 32 L78 10" stroke="#8FCB5F" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="36" cy="56" r="4" fill="#FFC48A" opacity="0.8"/><circle cx="64" cy="66" r="3.4" fill="#FFC48A" opacity="0.8"/>' + face(62, 8, 16)
    }
  ]);

  var MORE = [
    {
      id: 'pancake', label: '鬆餅',
      svg: '<ellipse cx="50" cy="76" rx="34" ry="10" fill="#E0A75E" stroke="' + INK + '" stroke-width="3"/>' +
        '<ellipse cx="50" cy="64" rx="34" ry="10" fill="#EFBB72" stroke="' + INK + '" stroke-width="3"/>' +
        '<ellipse cx="50" cy="52" rx="34" ry="10" fill="#F7CD8B" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M20 48 C26 40 34 46 42 40 C50 34 58 44 66 38 C74 32 78 42 80 48 C80 54 66 58 50 58 C34 58 20 54 20 48 Z" ' +
        'fill="#C9852F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<rect x="42" y="26" width="16" height="12" rx="3" fill="#FFF0B8" stroke="' + INK + '" stroke-width="3"/>' + face(50, 8, 17)
    },
    {
      id: 'bubble-tea', label: '珍珠奶茶',
      svg: '<path d="M28 26 L72 26 L66 88 C66 92 34 92 34 88 Z" fill="#D9AE85" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<rect x="24" y="18" width="52" height="10" rx="5" fill="#FFF0DE" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M58 20 L72 4" stroke="#FF8FA8" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="42" cy="78" r="5" fill="' + INK + '"/><circle cx="56" cy="80" r="5" fill="' + INK + '"/>' +
        '<circle cx="49" cy="68" r="5" fill="' + INK + '"/><circle cx="61" cy="68" r="4.4" fill="' + INK + '"/>' +
        '<circle cx="38" cy="66" r="4.4" fill="' + INK + '"/>' + face(46)
    },
    {
      id: 'taiyaki', label: '鯛魚燒',
      svg: '<path d="M12 54 C12 34 34 26 54 30 C74 34 84 44 88 54 C84 64 74 74 54 78 C34 82 12 74 12 54 Z" ' +
        'fill="#E0A85A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M14 40 C24 36 34 36 42 38" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M14 68 C24 72 34 72 42 70" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M88 54 C94 42 98 40 98 40 C96 50 96 58 98 68 C98 68 94 66 88 54 Z" fill="#D2903F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="34" cy="50" r="3" fill="' + INK + '"/><circle cx="52" cy="48" r="3" fill="' + INK + '"/>' +
        '<ellipse cx="26" cy="59" rx="4.2" ry="2.7" fill="#FFAFC5" opacity="0.7"/>' +
        '<ellipse cx="60" cy="57" rx="4.2" ry="2.7" fill="#FFAFC5" opacity="0.7"/>' +
        '<path d="M38 58 Q44 63 50 58" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: 'takoyaki', label: '章魚燒',
      svg: '<path d="M14 78 C14 66 30 62 50 62 C70 62 86 66 86 78 C86 86 70 90 50 90 C30 90 14 86 14 78 Z" ' +
        'fill="#F0E2C8" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="30" cy="56" r="17" fill="#C98B45" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="70" cy="56" r="17" fill="#C98B45" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="50" cy="42" r="19" fill="#D89C55" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M34 32 C40 28 44 34 50 30 C56 26 60 34 66 30" fill="none" stroke="#6B4526" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M36 24 C40 20 44 24 48 20" fill="none" stroke="#E8E2D6" stroke-width="2.6" stroke-linecap="round"/>' + face(42)
    },
    {
      id: 'pudding', label: '布丁',
      svg: '<path d="M26 40 L74 40 L66 82 C66 86 34 86 34 82 Z" fill="#FFE08A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M26 40 C26 30 74 30 74 40 C74 46 26 46 26 40 Z" fill="#C98B45" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M30 84 C36 90 64 90 70 84" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="50" cy="26" r="6" fill="#FF8FA8" stroke="' + INK + '" stroke-width="3"/>' + face(56)
    },
    {
      id: 'lollipop', label: '棒棒糖',
      svg: '<rect x="46" y="52" width="8" height="42" rx="4" fill="#FFF0DE" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="50" cy="40" r="30" fill="#FFD9E4" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M50 40 C50 24 62 14 74 20 C86 26 84 46 68 52 C56 56 50 50 50 40 Z" fill="#FF8FA8" opacity="0.85"/>' +
        '<path d="M50 40 C50 56 38 66 26 60 C14 54 16 34 32 28 C44 24 50 30 50 40 Z" fill="#A9E7D2" opacity="0.85"/>' +
        '<circle cx="50" cy="40" r="30" fill="none" stroke="' + INK + '" stroke-width="3"/>' + face(38)
    },
    {
      id: 'chips', label: '洋芋片',
      svg: '<path d="M26 30 L74 30 L70 90 L30 90 Z" fill="#FFD24C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M22 14 L78 14 L74 32 L26 32 Z" fill="#E8B430" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M26 14 L34 6 L44 14 L54 6 L64 14 L74 6" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<ellipse cx="36" cy="76" rx="9" ry="7" fill="#F5E0B0" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<ellipse cx="60" cy="80" rx="9" ry="7" fill="#F5E0B0" stroke="' + INK + '" stroke-width="2.4"/>' + face(52)
    },
    {
      id: 'bagel', label: '貝果',
      svg: '<circle cx="50" cy="54" r="34" fill="#D9A25E" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="50" cy="54" r="12" fill="#FFF6E4" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="34" cy="34" r="2.2" fill="#F5E6C8"/><circle cx="66" cy="36" r="2.2" fill="#F5E6C8"/>' +
        '<circle cx="72" cy="62" r="2.2" fill="#F5E6C8"/><circle cx="30" cy="66" r="2.2" fill="#F5E6C8"/>' +
        '<circle cx="50" cy="24" r="2.2" fill="#F5E6C8"/>' +
        '<circle cx="36" cy="48" r="2.8" fill="' + INK + '"/><circle cx="64" cy="48" r="2.8" fill="' + INK + '"/>' +
        '<ellipse cx="28" cy="58" rx="4.4" ry="2.9" fill="#FFAFC5" opacity="0.7"/>' +
        '<ellipse cx="72" cy="58" rx="4.4" ry="2.9" fill="#FFAFC5" opacity="0.7"/>'
    },
    {
      id: 'hotpot', label: '火鍋',
      svg: '<path d="M14 46 L86 46 L78 82 C78 86 22 86 22 82 Z" fill="#C4C0CC" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="46" rx="36" ry="9" fill="#E8434F" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="36" cy="44" r="5" fill="#FFD24C" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<circle cx="62" cy="45" r="5" fill="#A9E7D2" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M46 40 C50 42 54 40 56 42" fill="none" stroke="#FFF0DE" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M34 30 C30 24 38 20 34 14" fill="none" stroke="#C4C0CC" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M66 30 C62 24 70 20 66 14" fill="none" stroke="#C4C0CC" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M6 56 L14 52 M94 56 L86 52" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + face(62)
    },
    {
      id: 'skewer', label: '串燒',
      svg: '<rect x="46" y="6" width="8" height="88" rx="4" fill="#E8D2A8" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="20" y="20" width="60" height="20" rx="9" fill="#C4703C" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="20" y="44" width="60" height="20" rx="9" fill="#D98A4E" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="20" y="68" width="60" height="20" rx="9" fill="#C4703C" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M28 30 C34 26 40 34 46 30" fill="none" stroke="#8A4A22" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M56 78 C62 74 68 82 74 78" fill="none" stroke="#8A4A22" stroke-width="2.4" stroke-linecap="round"/>' + face(52)
    }
  ];

  return {
    key: "food",
    label: "食物",
    emoji: "🍔",
    note: "正餐、點心與飲料",
    list: BASE.concat(MORE)
  };
}));
