// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
// Franquia, hackers, documentário e modo 2077.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  await p.evaluate(() => {
    S.tutorial = -1; S.phase2 = true; S.money = 1e6; S.followers = 20000; S.stats.lives = 5; S.pcOn = true;
    S.engines = ['scratch', 'python', 'js'];
    S.myGames = [{ id: 1, name: 'Capi Run', engine: 'python', genre: 'plataforma', theme: 'capivaras', size: 'pequeno', score: 8.7, price: 'p10', day: 1, sold: 3000, revenue: 0, lastSales: 0, hype: 0 }];
    S.nextGameId = 2; S.server = { rack: true, cpu: true, gpus: ['sv4'] };
    render();
  });
  // franquia
  await p.click('.tab[data-tab=dev]');
  await p.click('[data-action=sequel][data-id="1"]');
  console.log('projeto:', await p.evaluate(() => [S.project.name, S.project.sequelOf]));
  await p.evaluate(() => { S.project.progress = S.project.target; S.project.bugs = 0; draft.price = 'p10'; render(); });
  await p.click('[data-action=launch]');
  console.log('continuação:', await p.evaluate(() => { const g = S.myGames[1]; return [g.name, g.sequel, g.hype.toFixed(2)]; }));
  // hackers
  await p.evaluate(() => { S.hackPending = true; render(); });
  console.log('alerta visível:', await p.isVisible('#hack-card'));
  await p.click('[data-action=hack-start]');
  for (let n = 0; n < 60; n++) {
    const v = await p.$('.hack-cell.virus');
    if (!v) { if (!(await p.evaluate(() => !!hack))) break; await p.waitForTimeout(150); continue; }
    await v.click({ timeout: 500 }).catch(() => {});
  }
  console.log('defendeu:', await p.evaluate(() => [S.hackPending, (S.counts || {}).hacks]));
  // documentário
  await p.click('.tab[data-tab=goals]');
  console.log('momentos:', await p.evaluate(() => S.timeline.map(t => t.id).join(',')));
  await p.click('[data-action=doc-play]');
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${process.env.SP}/documentario.png` });
  await p.click('#doc-player [data-action=doc-close]');
  // modo 2077
  await Promise.all([p.waitForNavigation(), p.click('[data-action=set-mode][data-mode=future]')]);
  console.log('2077:', await p.evaluate(() => [FUTURE, PART_BY_ID.g6.name, GAMES.find(g => g.id === 'cyber').name, SAVE_KEY]), await p.textContent('.logo'));
  await p.evaluate(() => { S.tutorial = -1; ['c4','m4','r4','g4','s2','p3'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; }); S.pcOn = true; render(); });
  await p.click('.tab[data-tab=live]');
  await p.screenshot({ path: `${process.env.SP}/modo-2077.png` });
  await p.click('.tab[data-tab=goals]');
  await Promise.all([p.waitForNavigation(), p.click('[data-action=set-mode][data-mode=modern]')]);
  console.log('voltou:', await p.evaluate(() => [GAME_MODE, S.myGames.length]));
  console.log('errors', errs);
  await b.close();
})();
