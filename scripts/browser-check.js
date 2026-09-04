/*
 * scripts/browser-check.js — 用真的瀏覽器跑一遍畫面：RWD、單機一局、設定彈窗、鍵盤操作
 *
 *   node scripts/browser-check.js
 *
 * 會在 screenshots/ 留下各尺寸的截圖，方便肉眼複查版面。
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

process.env.PORT = process.env.PORT || '3942';
process.env.COUNTDOWN_MS = '0';
const { server } = require(path.join(__dirname, '..', 'server.js'));
const PORT = Number(process.env.PORT);
const URL = 'http://127.0.0.1:' + PORT + '/';
const SHOTS = path.join(__dirname, '..', 'screenshots');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (detail ? '\n     ' + detail : '')); }
}
function group(n) { console.log('\n▍' + n); }

/* 檢查點：平板優先，再桌機，最後手機（依偏好的測試順序） */
const VIEWS = [
  { key: 'tablet-portrait',   w: 834,  h: 1112, label: '平板直向' },
  { key: 'tablet-landscape',  w: 1112, h: 834,  label: '平板橫向' },
  { key: 'tablet-lg-portrait', w: 1024, h: 1366, label: '大平板直向' },
  { key: 'desktop',           w: 1440, h: 900,  label: '桌機' },
  { key: 'desktop-wide',      w: 1920, h: 1080, label: '寬桌機' },
  { key: 'phone-portrait',    w: 390,  h: 844,  label: '手機直向' },
  { key: 'phone-landscape',   w: 844,  h: 390,  label: '手機橫向' },
  { key: 'phone-small',       w: 320,  h: 568,  label: '小手機' }
];

/** 沒有任何東西被切到畫面外，也沒有橫向捲軸 */
async function noOverflow(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    return {
      hScroll: de.scrollWidth - de.clientWidth,
      bodyOverflow: document.body.scrollWidth - document.body.clientWidth
    };
  });
}

/** 盤面實際畫出來的尺寸與長寬比 */
async function boardBox(page) {
  return page.evaluate(() => {
    const b = document.getElementById('board');
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    return {
      w: Math.round(r.width), h: Math.round(r.height),
      left: Math.round(r.left), top: Math.round(r.top),
      bw: Number(cs.getPropertyValue('--cols')) + 1, bh: Number(cs.getPropertyValue('--rows')) + 1,
      vw: window.innerWidth, vh: window.innerHeight
    };
  });
}

/** 等到真的可以出手（倒數遮罩收掉不代表倒數結束） */
async function waitPlaying(page) {
  await page.waitForFunction(
    () => !!(window.__fruitLink && window.__fruitLink.snap && window.__fruitLink.snap.phase === 'playing'),
    null, { timeout: 12000 });
  await page.waitForTimeout(120);
}

/** 對局進行中按離開會跳確認彈窗，測試也要照著點 */
async function quitGame(page) {
  await page.click('#b-quit');
  await page.waitForTimeout(200);
  if (await page.locator('#confirm-modal').isVisible()) {
    await page.click('#b-confirm-yes');
    await page.waitForTimeout(300);
  }
}

async function main() {
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  fs.mkdirSync(SHOTS, { recursive: true });
  /* PW_CHROMIUM 是給「不能下載瀏覽器的環境」用的逃生口：
     指到系統既有的 Chromium/Chrome 執行檔就能跑，不用 npx playwright install。 */
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || undefined,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    group('首頁與靜態畫面');
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(URL, { waitUntil: 'networkidle' });

      check('首頁載入沒有 JS 錯誤', errors.length === 0, errors.join('\n'));
      check('標題 LOGO 有畫出來', await page.locator('#logo svg').count() === 1);
      check('立體按鈕真的畫了 SVG 底座', await page.locator('#b-solo .b3-svg').count() === 1);

      await page.click('#b-help');
      await page.waitForTimeout(200);
      check('玩法頁的路徑示範有三張圖', await page.locator('#path-demo figure').count() === 3);
      const rows = await page.locator('#level-table tr').count();
      check('玩法頁的關卡表有四關（加上表頭共 5 列）', rows === 5, '實際 ' + rows + ' 列');
      const gallery = await page.locator('#theme-gallery .themerow').count();
      check('玩法頁列出六個圖案主題', gallery === 6, '實際 ' + gallery);
      check('主題展示真的畫出造型縮圖', await page.locator('#theme-gallery .tp svg').count() >= 48);
      await page.screenshot({ path: path.join(SHOTS, 'help.png'), fullPage: true });

      await page.click('#s-help [data-back="s-home"]');
      await page.waitForTimeout(150);
      await page.click('#b-stats');
      await page.waitForTimeout(150);
      check('我的紀錄頁列出四個關卡', await page.locator('#best-list .bestrow').count() === 4);
      await page.click('#s-stats [data-back="s-home"]');
      await page.waitForTimeout(150);

      group('右上角設定彈窗');
      await page.click('#b-settings');
      await page.waitForTimeout(200);
      check('設定彈窗打得開', await page.locator('#settings-modal').isVisible());
      check('音樂與音效是分開的兩組開關',
        await page.locator('#set-music').count() === 1 && await page.locator('#set-sfx').count() === 1 &&
        await page.locator('#set-music-vol').count() === 1 && await page.locator('#set-sfx-vol').count() === 1);
      await page.screenshot({ path: path.join(SHOTS, 'settings.png') });

      await page.uncheck('#set-music');
      await page.check('#set-label');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      check('按 Escape 可以關掉設定彈窗', !(await page.locator('#settings-modal').isVisible()));
      check('顯示水果名稱會套用到 body', await page.evaluate(() => document.body.classList.contains('show-label')));

      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(200);
      await page.click('#b-settings');
      await page.waitForTimeout(200);
      const musicKept = await page.locator('#set-music').isChecked();
      const labelKept = await page.locator('#set-label').isChecked();
      check('設定重新整理之後還在（背景音樂維持關閉）', musicKept === false);
      check('設定重新整理之後還在（顯示名稱維持開啟）', labelKept === true);
      await page.click('#b-settings-reset');
      await page.waitForTimeout(150);
      check('恢復預設會把設定調回來', await page.locator('#set-music').isChecked() === true);
      await page.click('#b-settings-done');

      group('圖案主題');
      await page.click('#b-solo');
      await page.waitForTimeout(250);
      const themeCards = await page.locator('#opt-theme .themecard').count();
      check('單機設定有六個主題可以選', themeCards === 6, '實際 ' + themeCards);
      check('每張主題卡都有造型縮圖', await page.locator('#opt-theme .themecard .tpics svg').count() === 24);
      const themeNames = await page.locator('#opt-theme .themecard .tname').allInnerTexts();
      check('主題名稱是蔬果／動物／食物／國旗／麻將／大混搭',
        themeNames.join('').indexOf('動物') >= 0 && themeNames.join('').indexOf('國旗') >= 0 &&
        themeNames.join('').indexOf('食物') >= 0 && themeNames.join('').indexOf('麻將') >= 0 &&
        themeNames.join('').indexOf('大混搭') >= 0, themeNames.join(' '));
      const themeBackgrounds = await page.locator('#opt-theme .themecard').evaluateAll((cards) =>
        new Set(cards.map((card) => getComputedStyle(card).backgroundColor)).size);
      check('不同主題卡有不同底色', themeBackgrounds >= 5, '實際 ' + themeBackgrounds + ' 種');

      /* 換成動物、開最小的一關，確認盤面真的變成動物 */
      await page.locator('#opt-theme .themecard[data-v="animals"]').click();
      await page.locator('#opt-level .pickcard').first().click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      const animalNames = await page.evaluate(() => {
        const G = window.__fruitLink;
        return Array.from(new Set(G.snap.palette.map((i) => window.Themes.art(G.snap.theme, i).label)));
      });
      check('選動物之後盤面用的是動物造型',
        await page.evaluate(() => window.__fruitLink.snap.theme) === 'animals', animalNames.join('、'));
      const shownNames = await page.locator('#board .tile:not([hidden]) .tile-name').allInnerTexts();
      check('磚塊上的名稱換成了動物', shownNames.every((n) => animalNames.indexOf(n) >= 0), shownNames.join('、'));
      await page.screenshot({ path: path.join(SHOTS, 'theme-animals.png') });

      /* 每一局會重新抽造型，所以同一關連玩兩次組合應該不一樣 */
      const firstPalette = await page.evaluate(() => window.__fruitLink.snap.palette.join(','));
      await page.evaluate(() => { window.__fruitLink.run.level = 'normal'; });
      await quitGame(page);
      await page.click('#b-solo');
      await page.waitForTimeout(200);
      await page.locator('#opt-theme .themecard[data-v="animals"]').click();
      await page.locator('#opt-level .pickcard').nth(2).click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      const secondPalette = await page.evaluate(() => window.__fruitLink.snap.palette.join(','));
      check('每一局會重新隨機抽造型', firstPalette !== secondPalette, firstPalette + ' vs ' + secondPalette);

      /* 大混搭也要能正常開局 */
      await quitGame(page);
      await page.click('#b-solo');
      await page.waitForTimeout(200);
      await page.locator('#opt-theme .themecard[data-v="mixed"]').click();
      await page.locator('#opt-level .pickcard').last().click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      const mixedKinds = await page.evaluate(() => window.__fruitLink.snap.kinds);
      const wantKinds = await page.evaluate(() => window.Rules.levelOf('hard').kinds);
      check('大混搭開得了最難的一關（' + wantKinds + ' 種）', mixedKinds === wantKinds, '實際 ' + mixedKinds);
      await page.screenshot({ path: path.join(SHOTS, 'theme-mixed.png') });
      await quitGame(page);

      group('方塊尺寸與名稱標籤');
      /* 開一局普通關，量方塊實際佔了格子多少、名稱有沒有壓到圖案 */
      await page.click('#b-solo');
      await page.waitForTimeout(250);
      await page.locator('#opt-theme .themecard[data-v="fruits"]').click();
      await page.locator('#opt-level .pickcard').nth(2).click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });

      const fill = await page.evaluate(() => {
        const cell = document.querySelector('#board .cell:not(.pad)');
        const tile = cell.querySelector('.tile');
        const c = cell.getBoundingClientRect(), t = tile.getBoundingClientRect();
        return { ratio: (t.width * t.height) / (c.width * c.height), tileW: t.width, cellW: c.width };
      });
      check('方塊幾乎填滿格子（面積 ≥ 92%）', fill.ratio >= 0.92,
        '實際 ' + (fill.ratio * 100).toFixed(1) + '%（方塊 ' + fill.tileW.toFixed(1) + 'px／格子 ' + fill.cellW.toFixed(1) + 'px）');

      /* 立體感：磚塊 SVG 要畫出側面厚度與落地陰影 */
      const solid = await page.evaluate(() => {
        const svg = document.querySelector('#board .tile .tile-svg');
        return { rects: svg.querySelectorAll('rect').length, shadow: !!svg.querySelector('ellipse'), art: !!svg.querySelector('.tile-art') };
      });
      check('磚塊畫出立體結構（側面＋正面＋光澤）', solid.rects >= 3, '實際 ' + solid.rects + ' 個面');
      check('磚塊有落地陰影', solid.shadow);
      check('圖案獨立成一層，名稱才能讓位', solid.art);

      /* 關掉名稱時圖案最大；打開名稱時圖案縮小讓出下緣 */
      const artBig = await page.evaluate(() => document.querySelector('#board .tile .tile-art').getBoundingClientRect().height);
      await page.click('#b-settings');
      await page.waitForTimeout(150);
      await page.click('#set-label');
      await page.waitForTimeout(150);
      await page.click('#b-settings-done');
      await page.waitForTimeout(400);
      const withLabel = await page.evaluate(() => {
        const tile = document.querySelector('#board .tile:not([hidden])');
        const art = tile.querySelector('.tile-art').getBoundingClientRect();
        const name = tile.querySelector('.tile-name').getBoundingClientRect();
        const cs = getComputedStyle(tile.querySelector('.tile-name'));
        return { artH: art.height, artBottom: art.bottom, nameTop: name.top, nameH: name.height,
                 font: parseFloat(cs.fontSize), visible: cs.display !== 'none' };
      });
      check('打開「顯示名稱」後名稱真的出現', withLabel.visible && withLabel.nameH > 0);
      check('圖案會自動讓位（縮小）', withLabel.artH < artBig - 1,
        '原本 ' + artBig.toFixed(1) + 'px → ' + withLabel.artH.toFixed(1) + 'px');
      check('名稱不會壓到圖案（標籤在圖案下方）', withLabel.nameTop >= withLabel.artBottom - 1,
        '圖案底 ' + withLabel.artBottom.toFixed(1) + ' / 標籤頂 ' + withLabel.nameTop.toFixed(1));
      check('名稱字級跟著格子縮放，不會爆版', withLabel.font >= 6 && withLabel.font <= 13,
        withLabel.font.toFixed(1) + 'px');
      await page.screenshot({ path: path.join(SHOTS, 'tile-label.png') });

      /* 最難的一關格子最小，名稱也不能蓋圖 */
      await quitGame(page);
      await page.click('#b-solo');
      await page.waitForTimeout(250);
      await page.locator('#opt-level .pickcard').last().click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      const hard = await page.evaluate(() => {
        const tile = document.querySelector('#board .tile:not([hidden])');
        const art = tile.querySelector('.tile-art').getBoundingClientRect();
        const name = tile.querySelector('.tile-name').getBoundingClientRect();
        return { artBottom: art.bottom, nameTop: name.top, tileW: tile.getBoundingClientRect().width };
      });
      check('最難的一關（格子最小）名稱一樣不蓋圖', hard.nameTop >= hard.artBottom - 1,
        '格子寬 ' + hard.tileW.toFixed(1) + 'px，圖案底 ' + hard.artBottom.toFixed(1) + ' / 標籤頂 ' + hard.nameTop.toFixed(1));
      await page.screenshot({ path: path.join(SHOTS, 'tile-label-hard.png') });
      /* 把設定調回去，不影響後面的檢查 */
      await page.click('#b-settings');
      await page.waitForTimeout(150);
      await page.click('#set-label');
      await page.waitForTimeout(150);
      await page.click('#b-settings-done');
      await quitGame(page);

      group('幼幼班（3～5 歲）');
      await page.click('#b-solo');
      await page.waitForTimeout(250);
      await page.locator('#opt-theme .themecard[data-v="fruits"]').click();
      const cards = await page.locator('#opt-level .pickcard').count();
      check('關卡選單有四關', cards === 4, '實際 ' + cards);
      const kidsText = await page.locator('#opt-level .pickcard').first().innerText();
      check('第一張是幼幼班，而且寫明適合 3～5 歲',
        kidsText.indexOf('幼幼') >= 0 && kidsText.indexOf('3～5 歲') >= 0, kidsText);
      check('幼幼班的提示與洗牌顯示成 ∞', kidsText.indexOf('∞') >= 0, kidsText);

      await page.locator('#opt-level .pickcard').first().click();
      await page.click('#b-solo-start');
      await page.waitForTimeout(400);
      check('幼幼班進得了遊戲畫面', await page.locator('#s-game').isVisible());
      check('開局前會先倒數', await page.locator('#countdown').isVisible());
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 8000 });
      check('倒數結束之後就能出手了',
        await page.evaluate(() => !document.getElementById('b-hint').disabled));
      const kidsTiles = await page.locator('#board .tile:not([hidden])').count();
      check('幼幼班盤面是 4 × 3 十二格', kidsTiles === 12, '實際 ' + kidsTiles);
      check('幼幼班會自動顯示水果名稱',
        await page.evaluate(() => document.body.classList.contains('kids-board')));
      const kidsBox = await boardBox(page);
      check('幼幼班的格子夠大（一格 > 100px）',
        kidsBox.w / kidsBox.bw > 100, '一格約 ' + Math.round(kidsBox.w / kidsBox.bw) + 'px');
      await page.screenshot({ path: path.join(SHOTS, 'kids-desktop.png') });

      group('單機一局：選取、連線、消除、提示、洗牌');
      const before = await page.locator('#board .tile:not([hidden])').count();
      const pair = await page.evaluate(() => {
        const G = window.__fruitLink;
        const m = G.snap;
        const hit = window.Rules.findPair(m.grid, m.W, m.H);
        return hit ? { a: hit.a, b: hit.b } : null;
      });
      check('盤面上找得到一組可以連的水果', !!pair);
      await page.click('#board .tile[data-i="' + pair.a + '"]');
      await page.waitForTimeout(120);
      check('點第一顆會被選起來',
        await page.locator('#board .tile[data-i="' + pair.a + '"]').evaluate((e) => e.classList.contains('sel')));
      await page.click('#board .tile[data-i="' + pair.b + '"]');
      await page.waitForTimeout(150);
      check('連成功會畫出連線動畫', await page.locator('#linkline polyline').count() >= 2);
      await page.waitForTimeout(500);
      const after = await page.locator('#board .tile:not([hidden])').count();
      check('連成功之後盤面少兩顆', after === before - 2, before + ' → ' + after);
      check('分數有加上去', Number(await page.locator('#hud-score').innerText()) >= 100);

      await page.click('#b-hint');
      await page.waitForTimeout(200);
      check('提示會點亮兩顆水果', await page.locator('#board .tile.hint').count() === 2);
      const gridBefore = await page.evaluate(() => window.__fruitLink.snap.grid.join(','));
      await page.click('#b-shuffle');
      await page.waitForTimeout(300);
      const gridAfter = await page.evaluate(() => window.__fruitLink.snap.grid.join(','));
      check('洗牌之後盤面真的變了', gridBefore !== gridAfter);

      group('鍵盤操作');
      await page.evaluate(() => {
        const G = window.__fruitLink;
        for (let i = 0; i < G.snap.grid.length; i++) {
          if (G.snap.grid[i]) { document.querySelector('#board .tile[data-i="' + i + '"]').focus(); break; }
        }
      });
      const focusBefore = await page.evaluate(() => document.activeElement.dataset.i);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      const focusAfter = await page.evaluate(() => document.activeElement.dataset.i);
      check('方向鍵可以在水果之間移動', focusBefore !== focusAfter, focusBefore + ' → ' + focusAfter);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(120);
      check('Enter 可以選取', await page.locator('#board .tile.sel').count() === 1);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);
      check('Escape 可以取消選取', await page.locator('#board .tile.sel').count() === 0);

      group('過關結算');
      await page.evaluate(async () => {
        const G = window.__fruitLink;
        /* 直接把剩下的水果連光，驗證結算畫面 */
        for (let n = 0; n < 200; n++) {
          const hit = window.Rules.findPair(G.snap.grid, G.snap.W, G.snap.H);
          if (!hit) break;
          document.querySelector('#board .tile[data-i="' + hit.a + '"]').click();
          document.querySelector('#board .tile[data-i="' + hit.b + '"]').click();
          await new Promise((r) => setTimeout(r, 20));
        }
      });
      await page.waitForTimeout(800);
      check('清空盤面會跳出結算畫面', await page.locator('#ov-result').isVisible());
      const title = await page.locator('#ov-result-title').innerText();
      check('結算標題說過關了', title.indexOf('過關') >= 0 || title.indexOf('通過') >= 0, title);
      check('結算有「下一關」按鈕', (await page.locator('#ov-result-btns').innerText()).indexOf('下一關') >= 0);
      await page.screenshot({ path: path.join(SHOTS, 'kids-result.png') });
      await ctx.close();
    }

    /* 麻將是唯一「疊起來玩」的主題：牌一層層疊上去，被壓住的要先解鎖。
       這一組驗的是畫面與規則有沒有對上 —— 該壓暗的壓暗、該解鎖的解鎖。 */
    group('麻將疊疊樂');
    {
      const ctx = await browser.newContext({ viewport: { width: 1112, height: 834 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(URL, { waitUntil: 'networkidle' });

      await page.click('#b-solo');
      await page.waitForTimeout(200);
      check('單機設定裡有麻將主題', await page.locator('#opt-theme .themecard[data-v="mahjong"]').count() === 1);
      await page.locator('#opt-theme .themecard[data-v="mahjong"]').click();
      await page.locator('#opt-level .pickcard').nth(2).click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      /* 倒數的遮罩會早一步收掉，真正能不能出手要看快照的 phase */
      await waitPlaying(page);

      const info = await page.evaluate(() => {
        const G = window.__fruitLink;
        const layers = {};
        G.snap.stack.forEach((p) => { layers[p.z] = (layers[p.z] || 0) + 1; });
        return {
          mode: G.snap.mode, theme: G.snap.theme, total: G.snap.total, kinds: G.snap.kinds,
          layers: layers,
          stacked: document.getElementById('board').classList.contains('stacked'),
          tiles: document.querySelectorAll('#board .tile').length,
          locked: document.querySelectorAll('#board .tile.locked').length
        };
      });
      check('麻將開出來的是疊疊樂盤面', info.mode === 'stack' && info.stacked && info.theme === 'mahjong', JSON.stringify(info));
      check('牌真的疊了好幾層', Object.keys(info.layers).length >= 2, JSON.stringify(info.layers));
      check('畫面上的牌數和盤面對得起來', info.tiles === info.total, info.tiles + ' vs ' + info.total);
      check('一開局就有牌被壓在下面', info.locked > 0, '被壓住 ' + info.locked + ' 張');
      check('麻將盤沒有 JS 錯誤', errors.length === 0, errors.join('\n'));
      check('麻將牌下方不顯示文字', await page.locator('#board .tile .tile-name').count() === 0);
      const mahjongGap = await page.evaluate(() => {
        const G = window.__fruitLink;
        const row = G.snap.stack.filter((p) => p.z === 0 && p.y === 0).sort((a, b) => a.x - b.x);
        const rects = row.map((p) => {
          const svg = document.querySelector('#board .tile[data-i="' + G.snap.stack.indexOf(p) + '"] .tile-svg-mahjong');
          return svg.querySelectorAll('rect')[1].getBoundingClientRect();
        });
        return rects.length > 1 ? Math.max(...rects.slice(1).map((r, i) => r.left - rects[i].right)) : 0;
      });
      check('麻將牌面彼此緊貼', mahjongGap <= 1.5, '最大間距 ' + mahjongGap.toFixed(1) + 'px');
      await page.screenshot({ path: path.join(SHOTS, 'mahjong-stack.png') });

      const lock = await page.evaluate(() => {
        const el = document.querySelector('#board .tile.locked');
        const cs = getComputedStyle(el);
        return { pe: cs.pointerEvents, tab: el.tabIndex, aria: el.getAttribute('aria-disabled') };
      });
      check('被壓住的牌點不動，也不進 Tab 順序',
        lock.pe === 'none' && lock.tab === -1 && lock.aria === 'true', JSON.stringify(lock));

      const top = await page.evaluate(() => {
        const G = window.__fruitLink;
        const maxZ = G.snap.stack.reduce((m, p) => Math.max(m, p.z), 0);
        let n = 0, bad = 0;
        G.snap.stack.forEach((p, i) => {
          if (p.z !== maxZ) return;
          n++;
          if (document.querySelector('#board .tile[data-i="' + i + '"]').classList.contains('locked')) bad++;
        });
        return { n: n, bad: bad };
      });
      check('最上層的牌一定點得到', top.n > 0 && top.bad === 0, JSON.stringify(top));

      /* 連消幾組，本來被壓住的牌要跟著亮起來 */
      const play = await page.evaluate(async () => {
        const G = window.__fruitLink, R = window.Rules;
        const wasLocked = [];
        G.snap.stack.forEach((p, i) => {
          if (G.snap.grid[i] && R.stackCovered(G.snap.stack, G.snap.grid, i)) wasLocked.push(i);
        });
        for (let n = 0; n < 24; n++) {
          const hit = R.stackFindPair(G.snap.stack, G.snap.grid);
          if (!hit) break;
          document.querySelector('#board .tile[data-i="' + hit.a + '"]').click();
          document.querySelector('#board .tile[data-i="' + hit.b + '"]').click();
          await new Promise((r) => setTimeout(r, 80));
        }
        await new Promise((r) => setTimeout(r, 450));
        const freed = wasLocked.filter((i) => G.snap.grid[i] &&
          !document.querySelector('#board .tile[data-i="' + i + '"]').classList.contains('locked'));
        return { wasLocked: wasLocked.length, freed: freed.length, left: G.snap.left, total: G.snap.total };
      });
      check('消掉上面那幾張，被壓住的牌就解鎖了', play.freed > 0, JSON.stringify(play));
      check('消掉的牌有從盤面上扣掉', play.left < play.total && (play.total - play.left) % 2 === 0, JSON.stringify(play));

      const consistent = await page.evaluate(() => {
        const G = window.__fruitLink, R = window.Rules;
        let bad = 0;
        G.snap.stack.forEach((p, i) => {
          if (!G.snap.grid[i]) return;
          const el = document.querySelector('#board .tile[data-i="' + i + '"]');
          if (el.classList.contains('locked') !== R.stackCovered(G.snap.stack, G.snap.grid, i)) bad++;
        });
        return bad;
      });
      check('畫面上壓暗的牌和規則算出來的完全一致', consistent === 0, '不一致 ' + consistent + ' 張');

      const hinted = await page.evaluate(async () => {
        const G = window.__fruitLink, R = window.Rules;
        document.getElementById('b-hint').click();
        await new Promise((r) => setTimeout(r, 250));
        const ids = [...document.querySelectorAll('#board .tile.hint')].map((e) => Number(e.dataset.i));
        return {
          n: ids.length,
          allFree: ids.every((i) => R.stackFree(G.snap.stack, G.snap.grid, i)),
          same: ids.length === 2 && G.snap.grid[ids[0]] === G.snap.grid[ids[1]]
        };
      });
      check('提示指的兩張都是點得到、而且同一種的', hinted.n === 2 && hinted.allFree && hinted.same, JSON.stringify(hinted));

      const shuffled = await page.evaluate(async () => {
        const G = window.__fruitLink, R = window.Rules;
        const posBefore = JSON.stringify(G.snap.stack);
        const liveBefore = G.snap.grid.filter((k) => k).length;
        document.getElementById('b-shuffle').click();
        await new Promise((r) => setTimeout(r, 350));
        return {
          posKept: JSON.stringify(G.snap.stack) === posBefore,
          liveKept: G.snap.grid.filter((k) => k).length === liveBefore,
          hasPair: !!R.stackFindPair(G.snap.stack, G.snap.grid)
        };
      });
      check('洗牌只換牌面、不搬位置，而且洗完還有得消',
        shuffled.posKept && shuffled.liveKept && shuffled.hasPair, JSON.stringify(shuffled));

      /* 換回蔬果就要變回平面連連看 */
      await quitGame(page);
      await page.click('#b-solo');
      await page.waitForTimeout(200);
      await page.locator('#opt-theme .themecard[data-v="fruits"]').click();
      await page.locator('#opt-level .pickcard').nth(1).click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      await waitPlaying(page);
      const backToFlat = await page.evaluate(() => ({
        mode: window.__fruitLink.snap.mode,
        stacked: document.getElementById('board').classList.contains('stacked'),
        locked: document.querySelectorAll('#board .tile.locked').length
      }));
      check('換回蔬果就是平面連連看，沒有任何牌被壓住',
        backToFlat.mode === 'flat' && !backToFlat.stacked && backToFlat.locked === 0, JSON.stringify(backToFlat));
      await ctx.close();
    }

    /* Playwright 沒有真的軟體鍵盤，所以直接寫 --app-h／--kb 模擬「可見高度被鍵盤吃掉」。
       驗的是 CSS 有沒有接好：#app 縮了，抽屜與聊天輸入框要跟著浮到鍵盤上面。 */
    group('手機軟體鍵盤讓位');
    {
      const KB = 340;
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);

      check('keyboard.js 載入沒有 JS 錯誤，而且掛上了 KeyboardFix',
        errors.length === 0 && await page.evaluate(() => !!(window.KeyboardFix && window.KeyboardFix.refresh)),
        errors.join('\n'));

      const meta = await page.getAttribute('meta[name="viewport"]', 'content');
      check('viewport 不再鎖縮放，並要求鍵盤縮版面',
        meta.indexOf('user-scalable=no') < 0 && meta.indexOf('maximum-scale') < 0 &&
        meta.indexOf('interactive-widget=resizes-content') >= 0, meta);

      const idle = await page.evaluate(() => ({
        appH: Math.round(document.getElementById('app').getBoundingClientRect().height),
        vh: window.innerHeight,
        kb: getComputedStyle(document.documentElement).getPropertyValue('--kb').trim(),
        appVar: document.documentElement.style.getPropertyValue('--app-h')
      }));
      check('沒有鍵盤時 --app-h 不設定，版面維持滿版',
        idle.appVar === '' && Math.abs(idle.appH - idle.vh) <= 1, JSON.stringify(idle));
      check('沒有鍵盤時 --kb 是 0px', idle.kb === '0px', idle.kb);

      /* 開一局單機，把左側抽屜切到聊天分頁 */
      await page.click('#b-solo');
      await page.waitForTimeout(200);
      await page.locator('#opt-level .pickcard').first().click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      await page.click('#b-open-chat');
      await page.waitForTimeout(320);
      check('抽屜切到聊天分頁，輸入框看得到', await page.locator('#chat-input').isVisible());

      const fs = await page.evaluate(() => ({
        coarse: matchMedia('(pointer:coarse)').matches,
        size: parseFloat(getComputedStyle(document.getElementById('chat-input')).fontSize)
      }));
      check('觸控裝置上聊天輸入框至少 16px（iOS 聚焦才不會自動放大整頁）',
        fs.coarse && fs.size >= 16, JSON.stringify(fs));

      const before = await page.evaluate(() => Math.round(document.getElementById('chat-input').getBoundingClientRect().bottom));
      check('輸入框本來就貼在畫面底部（所以才會被鍵盤蓋住）', before > 844 - KB, before + 'px');

      const on = await page.evaluate((kb) => {
        const r = document.documentElement;
        r.style.setProperty('--app-h', (window.innerHeight - kb) + 'px');
        r.style.setProperty('--kb', kb + 'px');
        const box = (id) => {
          const b = document.getElementById(id).getBoundingClientRect();
          return { bottom: Math.round(b.bottom), h: Math.round(b.height) };
        };
        const t = document.getElementById('toast');
        t.hidden = false; t.textContent = '測試';
        const toast = box('toast');
        t.hidden = true;
        return { line: window.innerHeight - kb, app: box('app'), side: box('side'), input: box('chat-input'), toast };
      }, KB);
      check('鍵盤佔位時 #app 縮成真正看得到的高度', on.app.h === on.line, JSON.stringify(on.app));
      check('鍵盤佔位時抽屜跟著縮', on.side.bottom <= on.line + 1, JSON.stringify(on.side));
      check('鍵盤佔位時聊天輸入框浮到鍵盤上面',
        on.input.h > 0 && on.input.bottom <= on.line + 1, JSON.stringify(on.input));
      check('鍵盤佔位時提示條也讓開', on.toast.bottom <= on.line, JSON.stringify(on.toast));
      await page.screenshot({ path: path.join(SHOTS, 'keyboard-open.png') });

      const off = await page.evaluate(() => {
        const r = document.documentElement;
        r.style.removeProperty('--app-h');
        r.style.setProperty('--kb', '0px');
        return {
          app: Math.round(document.getElementById('app').getBoundingClientRect().height),
          input: Math.round(document.getElementById('chat-input').getBoundingClientRect().bottom),
          vh: window.innerHeight
        };
      });
      check('鍵盤收起來版面就還原', Math.abs(off.app - off.vh) <= 1 && off.input === before, JSON.stringify(off));
      await ctx.close();
    }

    group('RWD：各尺寸的版面');
    for (const v of VIEWS) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);

      let ov = await noOverflow(page);
      check(v.label + '（' + v.w + '×' + v.h + '）首頁沒有橫向溢出', ov.hScroll <= 1 && ov.bodyOverflow <= 1, JSON.stringify(ov));
      await page.screenshot({ path: path.join(SHOTS, v.key + '-home.png') });

      /* 進最大的第三關，最容易擠爆版面 */
      await page.evaluate(() => { try { localStorage.setItem('fl_level', 'hard'); } catch (e) {} });
      await page.click('#b-solo');
      await page.waitForTimeout(150);
      await page.locator('#opt-level .pickcard').last().click();
      await page.click('#b-solo-start');
      await page.waitForSelector('#countdown', { state: 'hidden', timeout: 9000 });
      await page.waitForTimeout(200);

      ov = await noOverflow(page);
      check(v.label + ' 遊戲畫面沒有橫向溢出', ov.hScroll <= 1 && ov.bodyOverflow <= 1, JSON.stringify(ov));

      const box = await boardBox(page);
      const ar = box.w / box.h;
      const want = box.bw / box.bh;
      check(v.label + ' 盤面維持正確長寬比（沒被壓扁）',
        Math.abs(ar - want) < 0.06, '實際 ' + ar.toFixed(3) + ' 期望 ' + want.toFixed(3));
      check(v.label + ' 盤面完整在畫面內',
        box.left >= -1 && box.top >= -1 && box.left + box.w <= box.vw + 1 && box.top + box.h <= box.vh + 1,
        JSON.stringify(box));
      const cell = box.w / box.bw;
      check(v.label + ' 格子不會小到看不見（> 16px）', cell > 16, '一格約 ' + cell.toFixed(1) + 'px');

      /* 側欄：寬版固定在左邊，窄版變抽屜 */
      const side = await page.evaluate(() => {
        const s = document.getElementById('side');
        const r = s.getBoundingClientRect();
        const fab = getComputedStyle(document.getElementById('side-fab')).display;
        return { left: Math.round(r.left), width: Math.round(r.width), fab };
      });
      if (side.fab === 'none') {
        check(v.label + ' 寬版：側欄固定在畫面左邊', side.left <= 1 && side.width > 100, JSON.stringify(side));
      } else {
        check(v.label + ' 窄版：側欄收成抽屜，左下角有開關', side.left < 0, JSON.stringify(side));
        await page.click('#b-open-chat');
        await page.waitForTimeout(300);
        const opened = await page.evaluate(() => Math.round(document.getElementById('side').getBoundingClientRect().left));
        check(v.label + ' 窄版：抽屜打得開', opened >= -1, '左緣 ' + opened);

        /* 抽屜是收著的時候，提示與洗牌一定要在主畫面按得到 */
        const acts = await page.evaluate(() => {
          const bar = document.getElementById('stage-actions');
          if (!bar || getComputedStyle(bar).display === 'none') return { shown: false };
          const b = [...bar.querySelectorAll('.btn3d')];
          const r = b.map((x) => x.getBoundingClientRect());
          return {
            shown: true, n: b.length,
            minH: Math.min(...r.map((x) => x.height)),
            inView: r.every((x) => x.top >= 0 && x.bottom <= innerHeight + 1 && x.left >= 0 && x.right <= innerWidth + 1),
            hint: document.getElementById('hint-left2').textContent,
            sideHint: document.getElementById('hint-left').textContent
          };
        });
        if (acts.shown) {
          check(v.label + ' 抽屜收著也能按到提示／洗牌', acts.n === 2 && acts.inView);
          check(v.label + ' 提示／洗牌按鈕夠大（≥ 44px）', acts.minH >= 44, Math.round(acts.minH) + 'px');
          check(v.label + ' 這兩顆顯示的剩餘次數是對的', acts.hint === acts.sideHint && acts.hint !== '',
            '盤面下 ' + acts.hint + '／側欄 ' + acts.sideHint);
        }
        await page.click('#b-side-close');
        await page.waitForTimeout(250);
      }

      /* 右上角設定鈕在安全區內、而且不擋盤面控制 */
      const fab = await page.evaluate(() => {
        const r = document.getElementById('b-settings').getBoundingClientRect();
        return { top: Math.round(r.top), right: Math.round(window.innerWidth - r.right), w: Math.round(r.width), h: Math.round(r.height) };
      });
      check(v.label + ' 右上角設定鈕在畫面內且夠大（≥ 40px）',
        fab.top >= 0 && fab.right >= 0 && fab.w >= 40 && fab.h >= 40, JSON.stringify(fab));

      await page.screenshot({ path: path.join(SHOTS, v.key + '-game.png') });
      await ctx.close();
    }
  } catch (e) {
    fail++;
    console.log('\n  ❌ 流程中斷\n     ' + (e && (e.stack || e.message)));
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n────────────────────────────');
  console.log('通過 ' + pass + ' 項，失敗 ' + fail + ' 項');
  console.log('截圖存在 ' + SHOTS);
  if (fail) { console.log('❌ 瀏覽器驗證失敗'); process.exit(1); }
  console.log('✅ 瀏覽器驗證全部通過');
  process.exit(0);
}

main();
