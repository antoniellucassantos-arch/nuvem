// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.locator('#case').screenshot({ path: process.env.SP + '/case-empty.png' });
  // clicking empty GPU slot goes to shop with gpu filter
  await p.click('.empty-part[data-cat=gpu]');
  console.log('shop visible', await p.isVisible('#tab-shop'), 'active filter', await p.textContent('.chip-btn.active'));
  for (const [cat, id] of [['cpu','c1'],['mobo','m1'],['ram','r1'],['gpu','g1'],['storage','s1'],['psu','p1']]) {
    await p.click(`[data-cat=${cat}].chip-btn`); await p.click(`[data-action=buy][data-id=${id}]`);
  }
  console.log('money after starter', await p.textContent('#stat-money'));
  await p.click('.tab[data-tab=build]');
  while (await p.$('[data-action=install]')) await p.click('[data-action=install]');
  await p.click('#btn-power'); await p.waitForTimeout(3000);
  await p.locator('#case').screenshot({ path: process.env.SP + '/case-starter.png' });
  // high-end build via save injection
  await p.evaluate(() => {
    const ids = ['c7','m7','r6','g6','s3','p4'];
    const s = JSON.parse(localStorage.getItem('inforeal-save-v2'));
    s.inventory = ids.map((id, i) => ({ uid: 100 + i, id }));
    ['cpu','mobo','ram','gpu','storage','psu'].forEach((k, i) => s.build[k] = 100 + i);
    s.pcOn = true; localStorage.setItem('inforeal-save-v2', JSON.stringify(s));
  });
  await p.reload();
  await p.locator('#case').screenshot({ path: process.env.SP + '/case-high.png' });
  await p.screenshot({ path: process.env.SP + '/build-full.png', fullPage: true });
  await p.setViewportSize({ width: 375, height: 800 });
  await p.screenshot({ path: process.env.SP + '/mobile-build.png' });
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('errors', errs);
  await b.close();
})();
