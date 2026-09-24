// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });  // sem eventos aleatórios (testados no 06 e 08)
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => { S.tutorial = -1; saveGame(); });  // o tutorial tem teste próprio (12)
  await p.click('.tab[data-tab=shop]');
  for (const [cat, id] of [['cpu','c1'],['mobo','m1'],['ram','r1'],['gpu','g1'],['storage','s1'],['psu','p1']]) {
    await p.click(`.chip-btn[data-cat=${cat}]`); await p.click(`[data-action=buy][data-id=${id}]`);
  }
  await p.click('.tab[data-tab=build]');
  while (await p.$('[data-action=install]')) { await p.click('[data-action=install]'); if (await p.isVisible('#paste-modal')) await p.click('#paste-modal [data-v=ok]'); }  // responde a pasta térmica
  await p.click('#btn-power'); await p.waitForTimeout(3000);
  console.log('POST:\n' + await p.textContent('#post'));
  console.log('status', await p.textContent('#pc-status'), 'money', await p.textContent('#stat-money'));
  await p.screenshot({ path: process.env.SP + '/build.png' , fullPage: true});
  await p.click('.tab[data-tab=live]'); if (await p.isHidden('#win-stream')) await p.click('[data-action=open-app]');
  await p.screenshot({ path: process.env.SP + '/live-setup.png', fullPage: true });
  await p.click('[data-action=start-live]'); await p.waitForTimeout(3000);
  await p.screenshot({ path: process.env.SP + '/live.png' });
  await p.waitForTimeout(2000);
  console.log('after live:', await p.textContent('#last-live'));
  console.log('money', await p.textContent('#stat-money'), 'followers', await p.textContent('#stat-followers'), 'energy', await p.textContent('#stat-energy'));
  await p.reload(); console.log('after reload followers', await p.textContent('#stat-followers'));
  await p.setViewportSize({ width: 375, height: 800 });
  await p.click('.tab[data-tab=live]'); if (await p.isHidden('#win-stream')) await p.click('[data-action=open-app]');
  await p.screenshot({ path: process.env.SP + '/mobile.png', fullPage: true });
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('errors', errs);
  await b.close();
})();
