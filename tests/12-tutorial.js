// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  const step = async () => { await p.waitForTimeout(600); return p.evaluate(() => S.tutorial); };
  console.log('start', await step(), await p.textContent('#tut-text'));
  await p.screenshot({ path: process.env.SP + '/tut-1.png' });
  await p.click('.tab[data-tab=shop]'); console.log('shop ->', await step());
  for (const [cat, id] of [['cpu','c1'],['mobo','m1'],['ram','r1'],['gpu','g1'],['storage','s1'],['psu','p1']]) {
    await p.click(`.chip-btn[data-cat=${cat}]`); await p.click(`[data-action=buy][data-id=${id}]`);
  }
  console.log('bought ->', await step());
  await p.click('.tab[data-tab=build]'); console.log('build ->', await step());
  await p.screenshot({ path: process.env.SP + '/tut-4.png' });
  while (await p.$('[data-action=install]')) await p.click('[data-action=install]');
  console.log('installed ->', await step());
  await p.click('#btn-power'); await p.waitForTimeout(3000); console.log('on ->', await step());
  await p.click('.tab[data-tab=live]'); console.log('live tab ->', await step());
  await p.click('.os-icon[data-app=stream]'); console.log('app ->', await step());
  await p.click('#btn-live'); console.log('live ->', await step());
  await p.click('[data-action=stop-live]');
  await p.evaluate(() => { S.energy = 0; render(); });
  await p.click('#btn-sleep'); console.log('sleep ->', await step());
  await p.click('.tab[data-tab=goals]'); console.log('end ->', await step(), 'box hidden', await p.isHidden('#tutorial'));
  // save antigo não mostra tutorial
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); delete s.tutorial; localStorage.setItem(SAVE_KEY, JSON.stringify(s)); });
  await p.reload(); console.log('old save tutorial', await step());
  await p.setViewportSize({ width: 375, height: 800 });
  await p.click('.tab[data-tab=goals]'); await p.click('[data-action=tut-restart]'); await p.waitForTimeout(600);
  await p.screenshot({ path: process.env.SP + '/tut-mobile.png' });
  console.log('errors', errs);
  await b.close();
})();
