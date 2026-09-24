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
  await p.evaluate(() => { S.money = 777; saveGame(); });
  await p.click('.tab[data-tab=goals]');
  await Promise.all([p.waitForNavigation(), p.click('[data-action=set-mode][data-mode=retro]')]);
  console.log('retro', await p.evaluate(() => RETRO), 'money new save', await p.evaluate(() => S.money), 'logo', await p.textContent('.logo'));
  // montar PC retrô
  await p.click('.tab[data-tab=shop]');
  for (const [cat, id] of [['cpu','c1'],['mobo','m1'],['ram','r1'],['gpu','g2'],['storage','s1'],['psu','p1']]) {
    await p.click(`.chip-btn[data-cat=${cat}]`); await p.click(`[data-action=buy][data-id=${id}]`);
  }
  await p.click('.tab[data-tab=build]');
  while (await p.$('[data-action=install]')) await p.click('[data-action=install]');
  await p.click('#btn-power'); await p.waitForTimeout(3000);
  console.log('pc on', await p.evaluate(() => S.pcOn));
  await p.locator('#case').screenshot({ path: process.env.SP + '/rt-case.png' });
  await p.click('.tab[data-tab=live]');
  await p.screenshot({ path: process.env.SP + '/rt-desktop.png' });
  await p.click('.taskbar [data-app=stream]');
  await p.click('[data-action=pick-game][data-id=cs]');
  await p.click('[data-action=start-live]');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: process.env.SP + '/rt-live.png' });
  console.log('game name', await p.textContent('#live-game'));
  await p.click('[data-action=stop-live]');
  // voltar
  await p.click('.tab[data-tab=goals]');
  await Promise.all([p.waitForNavigation(), p.click('[data-action=set-mode][data-mode=modern]')]);
  console.log('back modern', await p.evaluate(() => [RETRO, S.money]), 'rtx exists', await p.evaluate(() => !!PART_BY_ID.g6));
  console.log('errors', errs);
  await b.close();
})();
