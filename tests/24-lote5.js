// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
// Pedidos do chat, enquetes, rival com história, dificuldade e tema claro.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => {
    S.tutorial = -1; S.money = 5000; S.followers = 1500;
    ['c4','m4','r4','g4','s2','p3'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; });
    S.pcOn = true; render();
  });
  // pedido do chat
  await p.click('.tab[data-tab=live]');
  await p.evaluate(() => { selectedGame = 'fogo'; selectedHours = 4; openApp = 'stream'; render(); startLive(); });
  await p.waitForTimeout(600);
  await p.evaluate(() => LIVE_EVENTS.find(e => e.run.toString().includes('DARES')).run(live));
  await p.screenshot({ path: `${process.env.SP}/pedido.png` });
  const m0 = await p.evaluate(() => S.money);
  await p.click('[data-action=dare][data-ok="1"]');
  console.log('aceitou pedido:', Math.round(await p.evaluate(() => S.money) - m0) > 0);
  // enquete
  await p.evaluate(() => { Math._r = Math.random; Math.random = () => 0.1; endLive('stopped'); Math.random = Math._r; });
  const poll = await p.evaluate(() => S.poll);
  console.log('enquete:', !!poll);
  await p.evaluate(w => { S.energy = 100; selectedGame = w; openApp = 'stream'; startLive(); }, poll.winner);
  console.log('bônus da enquete aplicado:', await p.evaluate(() => S.poll === null));
  await p.evaluate(() => endLive('stopped'));
  // rival
  await p.evaluate(() => { S.energy = 0; sleep(); });
  console.log('capítulo do rival:', await p.evaluate(() => S.pendingChoice), await p.isVisible('#choice-modal'));
  await p.click('#choice-modal [data-opt=a]');
  // dificuldade e tema
  await p.click('[data-action=open-settings]');
  const price0 = await p.evaluate(() => priceOf(PART_BY_ID.g5));
  await p.click('[data-action=set-diff][data-v=hard]');
  console.log('difícil encarece:', (await p.evaluate(() => priceOf(PART_BY_ID.g5)) / price0).toFixed(2), '| fonte:', await p.evaluate(() => Hooks.filter('psuChance', 0.01)));
  await p.click('[data-action=set-theme][data-v=light]');
  console.log('tema claro:', await p.evaluate(() => document.documentElement.classList.contains('light')));
  await p.click('.tab[data-tab=build]');
  await p.screenshot({ path: `${process.env.SP}/tema-claro.png` });
  console.log('errors', errs);
  await b.close();
})();
