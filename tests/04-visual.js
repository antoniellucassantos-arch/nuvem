// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  const setBuild = async (ids, caseId, extra = {}) => {
    await p.evaluate(([ids, caseId, extra]) => {
      const s = JSON.parse(localStorage.getItem('inforeal-save-v2') || '{}');
      Object.assign(s, { pcOn: true, inventory: ids.map((id, i) => ({ uid: 100 + i, id })),
        build: Object.fromEntries(['cpu','mobo','ram','gpu','storage','psu'].map((k, i) => [k, 100 + i])),
        cases: ['k1','k2','k3','k4','k5'], caseId }, extra);
      localStorage.setItem('inforeal-save-v2', JSON.stringify(s));
    }, [ids, caseId, extra]);
    await p.goto(url);
  };
  await setBuild(['c1','m1','r1','g1','s1','p1'], 'k1');
  await p.locator('#case').screenshot({ path: process.env.SP + '/v-starter.png' });
  await setBuild(['c4','m4','r4','g4','s2','p3'], 'k4');
  await p.waitForTimeout(700);
  await p.locator('#case').screenshot({ path: process.env.SP + '/v-mid.png' });
  await setBuild(['c6','m6','r6','g6','s3','p4'], 'k5', { followers: 6000, money: 50000, gear: ['e1','e2','e3'], phase2: true,
    myGames: [{ id: 1, name: 'Zumbis na Escola', engine: 'godot', genre: 'terror', theme: 'escola', size: 'medio', score: 8.6, price: 'p10', day: 1, sold: 1200, revenue: 8000, lastSales: 90, hype: 1 }], nextGameId: 2 });
  await p.waitForTimeout(700);
  await p.locator('#case').screenshot({ path: process.env.SP + '/v-high.png' });
  await p.screenshot({ path: process.env.SP + '/v-build.png', fullPage: true });
  await p.click('.tab[data-tab=shop]');
  await p.click('.chip-btn[data-cat=gpu]');
  await p.screenshot({ path: process.env.SP + '/v-shop-gpu.png', fullPage: true });
  await p.click('.chip-btn[data-cat=case]');
  await p.click('[data-action=use-case][data-id=k2]');
  console.log('case now', await p.evaluate(() => S.caseId));
  await p.screenshot({ path: process.env.SP + '/v-shop-case.png', fullPage: true });
  await p.click('.chip-btn[data-cat=mobo]');
  await p.screenshot({ path: process.env.SP + '/v-shop-mobo.png' });
  await p.click('.tab[data-tab=live]'); if (await p.isHidden('#win-stream')) await p.click('[data-action=open-app]');
  await p.screenshot({ path: process.env.SP + '/v-live-list.png', fullPage: true });
  await p.click('[data-action=pick-game][data-id="my-1"]');
  await p.click('[data-action=start-live]');
  await p.waitForTimeout(2500);
  await p.locator('.stream-screen').screenshot({ path: process.env.SP + '/v-stream.png' });
  await p.waitForSelector('#screen-live[hidden]', { state: 'attached', timeout: 20000 }); await p.waitForSelector('#win-stream:not([hidden])', { timeout: 20000 });
  await p.click('.tab[data-tab=dev]');
  await p.locator('#my-games').screenshot({ path: process.env.SP + '/v-mygames.png' });
  await p.setViewportSize({ width: 375, height: 800 });
  await p.click('.tab[data-tab=shop]');
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('errors', errs);
  await b.close();
})();
