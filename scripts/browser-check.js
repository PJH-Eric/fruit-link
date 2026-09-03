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
      bw: Number(cs.getPropertyValue('--bw')), bh: Number(cs.getPropertyValue('--bh')),
      vw: window.innerWidth, vh: window.innerHeight
    };
  });
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

      group('幼幼班（3～5 歲）');
      await page.click('#b-solo');
      await page.waitForTimeout(200);
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
