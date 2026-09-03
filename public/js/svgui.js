/* ===== svgui.js — 立體 SVG 按鈕、水果磚、標題 LOGO、獎盃、背景裝飾 =====
 *
 * 按鈕外觀依元素「實際像素尺寸」即時畫出來，所以不管被拉多寬都不會變形，
 * 而且一定有「上層面 + 較深底座 + 高光」的區塊立體感。
 * 文字仍然留在 HTML，不會烘焙進圖裡，本地化與螢幕閱讀器才讀得到。
 */
(function (w) {
  'use strict';
  var INK = '#4A3B55';
  var FRUIT_INK = '#5B4636';     // 水果造型本身的描邊色（沿用同一套素材）

  var PALETTE = {
    grape: ['#C9B6F5', '#A48FDB'],
    peach: ['#FFC2B4', '#E89C8B'],
    mint:  ['#A9E7D2', '#79C6AC'],
    sky:   ['#AED9F5', '#7FB4DA'],
    lemon: ['#FFE3A0', '#E7C263'],
    cream: ['#FFF0DE', '#E6D2B4'],
    rose:  ['#FFB8CF', '#E88CAA'],
    gray:  ['#E9E3EE', '#C8BFD1']
  };

  /* 磚塊底色：依水果種類輪流，讓相同水果一眼就看得出是同一組，
     不是只靠水果造型分辨（色彩辨識不便時還有「顯示名稱」可以開） */
  var TILE_BG = [
    ['#FFF3F5', '#FFD9E2'], ['#F2FBEF', '#D3EFC9'], ['#FFF9E8', '#FFE9B0'],
    ['#EFF7FE', '#CFE6F8'], ['#F7F1FE', '#E1D2F7'], ['#FFF4EC', '#FFDCC2'],
    ['#EEFBF7', '#C8EDE0'], ['#FDF0FA', '#F4D4EC'], ['#F4F6FF', '#D8DEF8'],
    ['#FBF7EC', '#EBDEC0'], ['#F0FAFF', '#CDEBF7'], ['#FFF1F1', '#FFD2D2'],
    ['#F5FFF0', '#DBF3C6'], ['#FBF3FF', '#E7D6F9']
  ];

  /* ---------------------------------------------------------- 立體按鈕 */

  function paint(el) {
    var wpx = el.offsetWidth, hpx = el.offsetHeight;
    if (!wpx || !hpx) return;
    var cs = getComputedStyle(el);
    var d = parseFloat(cs.getPropertyValue('--d')) || 8;
    var key = el.getAttribute('data-color') || 'cream';
    var c = PALETTE[key] || PALETTE.cream;
    var faceH = hpx - d - 4;
    if (faceH < 10) return;
    var r = Math.min(20, faceH / 2.2);
    var svg = el.querySelector('.b3-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'b3-svg');
      svg.setAttribute('aria-hidden', 'true');
      el.insertBefore(svg, el.firstChild);
    }
    svg.setAttribute('viewBox', '0 0 ' + wpx + ' ' + hpx);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML =
      '<rect x="2" y="' + (2 + d) + '" width="' + (wpx - 4) + '" height="' + faceH + '" rx="' + r + '" fill="' + c[1] + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<g class="b3-face">' +
      '<rect x="2" y="2" width="' + (wpx - 4) + '" height="' + faceH + '" rx="' + r + '" fill="' + c[0] + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="' + (r * 0.55 + 4) + '" y="7" width="' + Math.max(4, wpx - 8 - r * 1.1) + '" height="' + Math.max(4, faceH * 0.36) + '" rx="' + (r * 0.5) + '" fill="#FFFFFF" opacity="0.45"/>' +
      '</g>';
  }

  var ro = w.ResizeObserver ? new ResizeObserver(function (list) {
    for (var i = 0; i < list.length; i++) paint(list[i].target);
  }) : null;

  function decorate(el) {
    if (el.dataset.b3) return;
    el.dataset.b3 = '1';
    var lbl = document.createElement('span');
    lbl.className = 'b3-lbl';
    lbl.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(lbl);
    paint(el);
    if (ro) ro.observe(el); else w.addEventListener('resize', function () { paint(el); });

    var press = function () { if (!el.disabled) el.classList.add('press'); };
    var release = function () { el.classList.remove('press'); };
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);
  }

  function decorateAll(root) {
    var list = (root || document).querySelectorAll('.btn3d');
    for (var i = 0; i < list.length; i++) decorate(list[i]);
  }
  function repaintAll(root) {
    var list = (root || document).querySelectorAll('.btn3d');
    for (var i = 0; i < list.length; i++) paint(list[i]);
  }
  function setLabel(el, html) {
    var lbl = el.querySelector('.b3-lbl');
    if (lbl) lbl.innerHTML = html; else el.innerHTML = html;
  }
  function setColor(el, key) { el.setAttribute('data-color', key); paint(el); }

  /* ---------------------------------------------------------- 水果磚 */

  function tileColors(kind) { return TILE_BG[(kind - 1) % TILE_BG.length]; }

  /**
   * 一塊水果磚：圓角木牌 + 水果造型。
   * viewBox 固定 100×100，實際大小交給 CSS，所以每種裝置只是等比縮放。
   * @param {number} kind 1 起算的水果種類
   */
  function tileSvg(kind) {
    var art = w.FRUITS ? w.FRUITS.at(kind - 1) : null;
    var c = tileColors(kind);
    return '<svg class="tile-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="4" y="7" width="92" height="89" rx="19" fill="' + c[1] + '"/>' +
      '<rect x="4" y="4" width="92" height="89" rx="19" fill="' + c[0] + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="14" y="11" width="72" height="26" rx="13" fill="#FFFFFF" opacity="0.5"/>' +
      '<g transform="translate(50 50) scale(0.76) translate(-50 -50)">' + (art ? art.svg : '') + '</g>' +
      '</svg>';
  }

  /** 只有水果本體（圖鑑、結算、提示氣泡用得到） */
  function fruitSvg(kind, cls) {
    var art = w.FRUITS ? w.FRUITS.at(kind - 1) : null;
    return '<svg class="' + (cls || 'fruit-svg') + '" viewBox="0 0 100 100" aria-hidden="true">' +
      (art ? art.svg : '') + '</svg>';
  }

  function fruitName(kind) {
    var art = w.FRUITS ? w.FRUITS.at(kind - 1) : null;
    return art ? art.label : '水果';
  }

  /* ---------------------------------------------------------- 標題與獎盃 */

  function logo() {
    var f = 'Yuanti TC, PingFang TC, Microsoft JhengHei, Noto Sans TC, sans-serif';
    return '<svg class="logo-svg" viewBox="0 0 560 210" role="img" aria-label="水果連連看">' +
      /* 左邊一塊草莓磚 */
      '<g transform="translate(16 46) rotate(-12)">' +
        '<rect x="0" y="6" width="86" height="84" rx="18" fill="#FFD9E2"/>' +
        '<rect x="0" y="0" width="86" height="84" rx="18" fill="#FFF3F5" stroke="' + INK + '" stroke-width="5"/>' +
        '<g transform="translate(43 42) scale(0.66) translate(-50 -50)">' + (w.FRUITS ? w.FRUITS.at(5).svg : '') + '</g>' +
      '</g>' +
      /* 右邊一塊鳳梨磚 */
      '<g transform="translate(458 44) rotate(11)">' +
        '<rect x="0" y="6" width="86" height="84" rx="18" fill="#FFE9B0"/>' +
        '<rect x="0" y="0" width="86" height="84" rx="18" fill="#FFF9E8" stroke="' + INK + '" stroke-width="5"/>' +
        '<g transform="translate(43 42) scale(0.66) translate(-50 -50)">' + (w.FRUITS ? w.FRUITS.at(9).svg : '') + '</g>' +
      '</g>' +
      /* 中間的連線示意：兩折的虛線 */
      '<path d="M118 62 H196 V104 H364 V62 H442" fill="none" stroke="#79C6AC" stroke-width="7" ' +
        'stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 15" opacity="0.85"/>' +
      '<text x="280" y="112" text-anchor="middle" font-size="58" font-weight="900" letter-spacing="5" ' +
        'style="paint-order:stroke;stroke:' + INK + ';stroke-width:15px;stroke-linejoin:round" fill="#FFB8CF" font-family="' + f + '">水果連連看</text>' +
      '<text x="280" y="112" text-anchor="middle" font-size="58" font-weight="900" letter-spacing="5" fill="#FFF6E4" font-family="' + f + '">水果連連看</text>' +
      '<text x="280" y="152" text-anchor="middle" font-size="21" font-weight="800" letter-spacing="7" fill="#7A6A88" font-family="' + f + '">三折以內就能連</text>' +
      '<path d="M170 176 h220" stroke="#FFB8CF" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.7"/>' +
      '</svg>';
  }

  function trophy() {
    return '<svg class="trophy-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M26 16 h48 v22 c0 15 -11 25 -24 25 s-24 -10 -24 -25 z" fill="#FFE3A0" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M26 22 h-12 v8 c0 9 6 14 13 14" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M74 22 h12 v8 c0 9 -6 14 -13 14" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="44" y="62" width="12" height="14" fill="#E7C263" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="28" y="76" width="44" height="12" rx="5" fill="#FFC2B4" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="42" cy="34" r="3" fill="' + FRUIT_INK + '"/><circle cx="58" cy="34" r="3" fill="' + FRUIT_INK + '"/>' +
      '<path d="M42 43 Q50 50 58 43" fill="none" stroke="' + FRUIT_INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* ---------------------------------------------------------- 背景裝飾 */

  function bgDeco(host) {
    var cols = ['#FFC9D8', '#BFE9DA', '#BFDDF2', '#FFE9AE', '#E0D2F5', '#FFD9C2'];
    var html = '';
    for (var i = 0; i < 16; i++) {
      var s = 26 + Math.random() * 76;
      html += '<span style="width:' + s.toFixed(0) + 'px;height:' + s.toFixed(0) + 'px;left:' +
        (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;background:' +
        cols[i % cols.length] + ';animation-duration:' + (6 + Math.random() * 7).toFixed(1) +
        's;animation-delay:-' + (Math.random() * 6).toFixed(1) + 's;opacity:' + (0.16 + Math.random() * 0.2).toFixed(2) + '"></span>';
    }
    host.innerHTML = html;
  }

  w.SvgUI = {
    PALETTE: PALETTE, INK: INK, TILE_BG: TILE_BG,
    decorate: decorate, decorateAll: decorateAll, repaintAll: repaintAll, paint: paint,
    setLabel: setLabel, setColor: setColor,
    tileSvg: tileSvg, tileColors: tileColors, fruitSvg: fruitSvg, fruitName: fruitName,
    logo: logo, trophy: trophy, bgDeco: bgDeco
  };
}(window));
