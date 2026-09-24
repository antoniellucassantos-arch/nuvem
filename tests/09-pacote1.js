// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });  // sem eventos aleatórios (testados no 06 e 08)
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  console.log('trend on new game:', await p.evaluate(() => S.trend && S.trend.genre));
  await p.click('[data-action=avatar][data-key=style][data-val=moicano]');
  await p.click('[data-action=avatar][data-key=headset]');
  console.log('avatar', await p.evaluate(() => JSON.stringify(S.avatar)));
  await p.locator('#avatar-card').screenshot({ path: process.env.SP + '/p1-avatar.png' });
  // conquistas: 3 explosões
  await p.evaluate(() => { const ids = ['c1','m1','r1','g1','s1','p1']; S.inventory = ids.map((id,i)=>({uid:i+1,id}));
    ['cpu','mobo','ram','gpu','storage','psu'].forEach((k,i)=>S.build[k]=i+1); S.money = 2e6;
    for (let i = 0; i < 3; i++) { S.inventory.push({uid:50+i,id:'p1'}); S.build.psu = 50+i; psuBoom(); } });
  await p.waitForTimeout(2500);
  console.log('ach', await p.evaluate(() => S.ach));
  // crise dos chips
  const base = await p.evaluate(() => priceOf(PART_BY_ID.g4));
  await p.evaluate(() => { S.crisis = { until: S.day + 5 }; render(); });
  console.log('gpu price crisis', base, '->', await p.evaluate(() => priceOf(PART_BY_ID.g4)));
  await p.click('.tab[data-tab=shop]');
  await p.screenshot({ path: process.env.SP + '/p1-shop.png' });
  // tendência nas vendas
  const g = { id: 99, name: 'T', engine: 'python', genre: 'rpg', theme: 'medieval', size: 'medio', score: 8, price: 'p10', day: 1, sold: 0, revenue: 0, lastSales: 0, hype: 0 };
  console.log('trend mult', await p.evaluate(g => { S.trend = { genre: 'rpg', from: 0, until: 99 }; const a = salesFor(g); S.trend.genre = 'puzzle'; const b2 = salesFor(g); return (a / b2).toFixed(1); }, g));
  // exportar / importar
  await p.click('.tab[data-tab=goals]');
  await p.click('[data-action=export-save]');
  const code = await p.inputValue('#save-code');
  await p.evaluate(() => { S.money = 1; });
  await p.fill('#save-code', code);
  await Promise.all([p.waitForNavigation(), p.click('[data-action=import-save]')]);
  console.log('money after import', await p.evaluate(() => S.money > 1000), '| ach kept', await p.evaluate(() => S.ach.length));
  await p.click('.tab[data-tab=goals]');
  await p.screenshot({ path: process.env.SP + '/p1-goals.png', fullPage: true });
  // reset não quebra
  await p.click('[data-action=reset]');
  console.log('after reset avatar ok', await p.evaluate(() => !!S.avatar));
  await p.setViewportSize({ width: 375, height: 800 });
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('errors', errs);
  await b.close();
})();
