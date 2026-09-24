// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
// Resgate anti-travamento, tela inicial, chefões da live e bolsa gamer.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  console.log('tela inicial escondida em teste:', await p.isHidden('#title-screen'));
  await p.evaluate(() => { S.tutorial = -1; showTitle(); });
  await p.screenshot({ path: `${process.env.SP}/tela-inicial.png` });
  await p.click('[data-action=title-continue]');
  console.log('continuar fecha:', await p.isHidden('#title-screen'));
  // resgate
  const r = await p.evaluate(() => { ['c1','m1','r1','g1','s1'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; }); S.money = 0; S.energy = 0; sleep(); return [cheapestFix(), S.money >= cheapestFix()]; });
  console.log('resgate:', r);
  // chefão
  await p.evaluate(() => { S.money = 5000; buyPart('p2'); installPart(S.inventory[S.inventory.length - 1].uid); S.pcOn = true; S.energy = 100; selectedGame = 'fogo'; openApp = 'stream'; render(); startLive(); });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const ev = LIVE_EVENTS[LIVE_EVENTS.length - 1]; ev.run(live); sim.manual = true; sim.score = live.boss.target + 1; });
  const f0 = await p.evaluate(() => S.followers);
  await p.evaluate(() => endLive('stopped'));
  console.log('venceu chefão:', await p.evaluate(() => S.followers) > f0);
  // bolsa
  await p.evaluate(() => { S.money = 10000; render(); });
  await p.click('.tab[data-tab=career]');
  await p.click('[data-action=stock][data-id=cap]');
  const owned = await p.evaluate(() => stocks().owned.cap);
  for (let i = 0; i < 5; i++) await p.evaluate(() => { S.energy = 0; sleep(); });
  await p.click('.tab[data-tab=career]');
  await p.locator('#stocks-card').screenshot({ path: `${process.env.SP}/bolsa.png` });
  await p.click('[data-action=stock][data-id=cap][data-q^="-"]');
  console.log('ações compradas:', owned, '| depois de vender:', await p.evaluate(() => stocks().owned.cap), '| histórico:', await p.evaluate(() => stocks().history.cap.length));
  console.log('manifest:', await p.evaluate(() => !!document.querySelector('link[rel=manifest]')));
  console.log('errors', errs);
  await b.close();
})();
