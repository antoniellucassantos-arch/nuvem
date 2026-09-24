// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  console.log('missões no dia 1:', await p.evaluate(() => S.missions.list.map(m => m.id)));
  // força missões conhecidas e cumpre
  await p.evaluate(() => {
    S.tutorial = -1;
    S.missions = { day: S.day, bonus: false, list: ['lives', 'pet', 'followers'].map(id => { const d = MISSIONS.find(x => x.id === id); return { id, base: d.metric(), target: d.target(), reward: 100, done: false }; }) };
    ['c1','m1','r1','g1','s1','p2'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; });
    S.pcOn = true; S.money = 5000; render();
  });
  await p.click('.tab[data-tab=goals]');
  console.log('aba:', await p.textContent('.tab[data-tab=goals]'));
  await p.screenshot({ path: `${process.env.SP}/missoes-antes.png` });
  const m0 = await p.evaluate(() => S.money);
  await p.evaluate(() => { feedPet(); S.stats.lives += 2; S.followers += 1000; });
  await p.waitForTimeout(2000);
  console.log('cumpridas:', await p.evaluate(() => S.missions.list.map(m => m.done)), 'baú:', await p.evaluate(() => S.missions.bonus), 'dinheiro +', Math.round(await p.evaluate(() => S.money) - m0));
  await p.screenshot({ path: `${process.env.SP}/missoes-depois.png` });
  await p.evaluate(() => { S.energy = 0; sleep(); });
  console.log('novo dia:', await p.evaluate(() => [S.missions.day, S.missions.list.every(m => !m.done)]));
  console.log('errors', errs);
  await b.close();
})();
