// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
// Saúde, amigos e namoro, cidades, montagem manual e vazamento do water cooler.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => { S.tutorial = -1; S.money = 100000; S.followers = 10000; S.stats.lives = 10; render(); });
  // montagem: arrastar CPU para o gabinete e escolher pasta
  await p.evaluate(() => { ['c6','m6','r4','g4','s2','p4'].forEach(id => buyPart(id)); });
  await p.click('.tab[data-tab=build]');
  await p.dragAndDrop('#inventory .item:first-child', '#case');
  console.log('arrastou e instalou:', await p.evaluate(() => !!S.build.cpu), '| pergunta da pasta:', await p.isVisible('#paste-modal'));
  await p.screenshot({ path: `${process.env.SP}/pasta.png` });
  await p.click('#paste-modal [data-v=lots]');
  while (await p.$('[data-action=install]')) await p.click('[data-action=install]');
  if (await p.isVisible('#paste-modal')) await p.click('#paste-modal [data-v=ok]');
  await p.click('[data-action=care-cables]');
  console.log('cabos:', await p.evaluate(() => life().cables), '| pasta:', await p.evaluate(() => life().paste));
  // vida
  await p.click('.tab[data-tab=career]');
  const g0 = await p.evaluate(() => gearMult());
  await p.click('[data-action=life-move][data-id=sp]');
  console.log('mudou para SP, bônus:', await p.evaluate(() => life().city), (await p.evaluate(() => gearMult()) / g0).toFixed(2));
  await p.evaluate(() => { life().friends = 3; render(); });
  await p.evaluate(() => { Math._r = Math.random; Math.random = () => 0.1; });
  await p.click('[data-action=life-flirt]');
  await p.evaluate(() => { Math.random = Math._r; });
  await p.click('[data-action=life-gym]');
  console.log('namoro:', await p.evaluate(() => life().partner), '| energia máx:', await p.evaluate(() => maxEnergy()), '| gearMult ok:', await p.evaluate(() => isFinite(gearMult())));
  await p.locator('#life-card').screenshot({ path: `${process.env.SP}/vida.png` });
  // vazamento do water cooler (Core i9 usa AIO)
  await p.evaluate(() => { life().lastCare = -100; Math._r = Math.random; Math.random = () => 0.01; S.energy = 0; sleep(); Math.random = Math._r; });
  console.log('vazou e levou a GPU:', await p.evaluate(() => S.build.gpu === null));
  console.log('errors', errs);
  await b.close();
})();
