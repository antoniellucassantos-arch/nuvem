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
    localStorage.setItem('inforeal-save-v2', JSON.stringify({ money: 300000, followers: 5000, pcOn: true, nextUid: 20, day: 5,
      inventory: ids.map((id, i) => ({ uid: i + 1, id })), build: { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6 } }));
  });
  await p.goto(url);
  // overclock
  const fps0 = await p.evaluate(() => checkBuild().gpu);
  await p.evaluate(() => { const r = document.getElementById('oc'); r.value = 30; r.dispatchEvent(new Event('input', { bubbles: true })); });
  console.log('oc gpu', fps0, '->', await p.evaluate(() => checkBuild().gpu), await p.textContent('#oc-value'));
  await p.screenshot({ path: process.env.SP + '/x-build.png', fullPage: true });
  // usados
  await p.click('.tab[data-tab=shop]');
  await p.click('.chip-btn[data-cat=used]');
  const inv0 = await p.evaluate(() => S.inventory.length);
  await p.click('[data-action=buy-used][data-i="0"]');
  console.log('used bought, inventory', inv0, '->', await p.evaluate(() => S.inventory.length));
  await p.screenshot({ path: process.env.SP + '/x-used.png', fullPage: true });
  // pirataria forçando vírus
  await p.click('.tab[data-tab=live]');
  await p.click('.taskbar [data-app=stream]');
  await p.evaluate(() => { Math._r = Math.random; Math.random = () => 0.1; });
  await p.click('[data-action=pirate][data-id=blocks]');
  await p.evaluate(() => { Math.random = Math._r; });
  console.log('virus', await p.evaluate(() => S.virus), '| popup', await p.isVisible('#virus-popup'));
  await p.click('.win-close >> nth=0');
  await p.screenshot({ path: process.env.SP + '/x-virus.png' });
  // pet
  await p.evaluate(() => { S.pet.food = 5; render(); });
  await p.click('#pet');
  console.log('pet food', await p.evaluate(() => S.pet.food));
  // mãe
  await p.evaluate(() => { S.energy = 40; render(); });
  await p.click('.taskbar [data-app=stream]');
  await p.click('[data-action=pick-game][data-id=fogo]');
  await p.evaluate(() => { LIVE_EVENTS[0].chance = 1; });
  await p.click('[data-action=start-live]');
  await p.waitForTimeout(1500);
  console.log('mae ended live:', await p.evaluate(() => S.lastLive && S.lastLive.reason));
  await p.evaluate(() => { LIVE_EVENTS[0].chance = 0.06; });
  // casa + antivírus
  await p.click('.tab[data-tab=shop]');
  await p.click('.chip-btn[data-cat=house]');
  await p.click('[data-action=buy][data-id=h2]');
  await p.click('.chip-btn[data-cat=gear]');
  await p.click('[data-action=buy][data-id=e13]');
  console.log('house', await p.evaluate(() => [S.house, maxEnergy()]), 'virus after antivirus', await p.evaluate(() => S.virus));
  await p.evaluate(() => { S.energy = 0; render(); });
  await p.click('#btn-sleep');
  console.log('energy after sleep', await p.evaluate(() => S.energy), '| used refreshed', await p.evaluate(() => S.used.length));
  // IA consciente
  await p.evaluate(() => { S.brain = { name: 'Mentão', xp: 40000, epoch: 0, cloud: false, released: true, users: 1000 };
    console.log(CONSCIOUS_EVENTS.map(f => f()).join(' | ')); });
  await p.click('.tab[data-tab=live]');
  await p.screenshot({ path: process.env.SP + '/x-desk.png' });
  await p.setViewportSize({ width: 375, height: 800 });
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('errors', errs);
  await b.close();
})();
