// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });  // sem eventos aleatórios (testados no 06 e 08)
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => {
    S.tutorial = -1; S.money = 1e6;
    ['c4','m4','r4','g4','s2','p3'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; });
    S.pcOn = true; render();
  });
  await p.click('.tab[data-tab=live]');
  for (const mode of ['soccer', 'kart', 'puzzle', 'rpg']) {
    await p.evaluate(m => { GAMES.find(g => g.id === 'fogo').sim = m; selectedGame = 'fogo'; selectedHours = 4; S.energy = 100; openApp = 'stream'; render(); startLive(); }, mode);
    await p.waitForTimeout(2500);
    const auto = await p.evaluate(() => sim.score);
    // jogar manualmente um pouco
    const box = await p.locator('#sim-canvas').boundingBox();
    for (let i = 0; i < 6; i++) { await p.mouse.click(box.x + box.width * (i % 2 ? 0.3 : 0.7), box.y + box.height * 0.3); await p.waitForTimeout(250); }
    for (const k of ['ArrowLeft', ' ', 'ArrowRight', 'ArrowDown']) { await p.keyboard.press(k); await p.waitForTimeout(150); }
    await p.screenshot({ path: `${process.env.SP}/modo-${mode}.png` });
    console.log(mode, '| pontos no automático:', auto, '| manual:', await p.evaluate(() => sim.manual), '| pontos:', await p.evaluate(() => sim.score), '| mortes:', await p.evaluate(() => sim.deaths));
    await p.click('[data-action=stop-live]');
  }
  console.log('errors', errs);
  await b.close();
})();
