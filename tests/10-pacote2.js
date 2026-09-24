// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  await p.evaluate(() => {
    const ids = ['c4','m4','r4','g4','s2','p3'];
    localStorage.setItem('inforeal-save-v2', JSON.stringify({ money: 100000, followers: 3000, pcOn: true, nextUid: 20, phase2: true, gear: ['d1','d3','d6'],
      myGames: [{ id: 1, name: 'Capi Run', engine: 'python', genre: 'plataforma', theme: 'capivaras', size: 'medio', score: 8, price: 'p10', day: 1, sold: 5000, revenue: 0, lastSales: 0, hype: 0 }],
      project: { name: 'X', engine: 'python', genre: 'rpg', theme: 'medieval', size: 'medio', focus: { code: .5, art: .3, sound: .2 }, progress: 10, target: 100, bugs: 0, bonus: 0 },
      inventory: ids.map((id, i) => ({ uid: i + 1, id })), build: { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6 } }));
  });
  await p.goto(url);
  await p.click('.tab[data-tab=career]');
  for (const id of ['editor', 'mod', 'dev', 'manager']) await p.click(`[data-action=hire][data-id=${id}]`);
  await p.click('[data-action=skins][data-id="1"]');
  await p.click('[data-action=join-tourney]');
  await p.evaluate(() => { Math._r = Math.random; Math.random = () => 0.9; });
  await p.click('[data-action=invite-collab]');
  await p.evaluate(() => { Math.random = Math._r; });
  console.log('staff', await p.evaluate(() => S.staff), 'collab', await p.evaluate(() => !!S.collab), 'tourney', await p.evaluate(() => JSON.stringify(S.tourney)));
  await p.screenshot({ path: process.env.SP + '/p2-career.png', fullPage: true });
  // live: collab + campeonato vencido
  await p.click('.tab[data-tab=live]');
  await p.click('.taskbar [data-app=stream]');
  await p.click('[data-action=start-live]');
  await p.waitForTimeout(800);
  console.log('raid from collab', await p.evaluate(() => Math.round(live.raid)));
  await p.evaluate(() => { sim.manual = true; sim.score = 999; addChat('hater_anônimo', 'live chata', 'hater'); });
  await p.screenshot({ path: process.env.SP + '/p2-live.png' });
  const m0 = await p.evaluate(() => S.money);
  await p.click('[data-action=stop-live]');
  console.log('tourney won', await p.evaluate(() => S.tourneyWins), 'prize', Math.round(await p.evaluate(() => S.money) - m0));
  console.log('mod chat', await p.evaluate(() => [...document.querySelectorAll('.chat-line')].some(l => l.textContent.includes('baniu'))));
  const pr0 = await p.evaluate(() => S.project.progress);
  await p.evaluate(() => { S.energy = 0; render(); });
  await p.click('#btn-sleep');
  console.log('dev progress', pr0, '->', await p.evaluate(() => S.project.progress), '| rank', await p.evaluate(() => rankOf()));
  await p.setViewportSize({ width: 375, height: 800 });
  await p.click('.tab[data-tab=career]');
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('errors', errs);
  await b.close();
})();
