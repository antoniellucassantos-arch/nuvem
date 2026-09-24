// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });  // sem eventos aleatórios (testados no 06 e 08)
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  await p.evaluate(() => { S.tutorial = -1; saveGame(); });  // o tutorial tem teste próprio (12)
  // locked state
  await p.click('.tab[data-tab=dev]');
  console.log('locked tab label:', await p.textContent('.tab[data-tab=dev]'), '| locked visible:', await p.isVisible('#dev-locked'));
  // inject a mid-game save: starter PC on, 290 followers
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('inforeal-save-v2') || 'null') || {};
    const ids = ['c1','m1','r1','g1','s1','p1'];
    Object.assign(s, { money: 3000, followers: 299.5, pcOn: true, nextUid: 10,
      inventory: ids.map((id, i) => ({ uid: i + 1, id })),
      build: { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6 } });
    localStorage.setItem('inforeal-save-v2', JSON.stringify(s));
  });
  await p.goto(url);
  // a live pushes past 300 -> unlock
  await p.click('.tab[data-tab=live]'); if (await p.isHidden('#win-stream')) await p.click('[data-action=open-app]');
  await p.click('[data-action=start-live]');
  await p.waitForSelector('#screen-live[hidden]', { state: 'attached', timeout: 20000 }); await p.waitForSelector('#win-stream:not([hidden])', { timeout: 20000 });
  console.log('phase2 unlocked:', await p.evaluate(() => S.phase2), 'tab:', await p.textContent('.tab[data-tab=dev]'));
  await p.click('.tab[data-tab=dev]');
  // study programming twice with online course
  await p.click('[data-action=study][data-skill=code][data-course=online]');
  await p.click('[data-action=study][data-skill=code][data-course=online]');
  await p.click('[data-action=study][data-skill=art][data-course=yt]');
  await p.evaluate(() => { S.energy = 100; render(); });
  console.log('skills', await p.evaluate(() => JSON.stringify(S.skills)), 'code lvl', await p.evaluate(() => skillLevel('code')));
  // learn python
  await p.click('[data-action=learn-engine][data-id=python]');
  console.log('engines', await p.evaluate(() => S.engines));
  // create project
  await p.fill('#draft-name', 'Capivara <b>Turbo</b>');
  await p.click('[data-action=draft][data-key=genre][data-val=plataforma]');
  await p.click('[data-action=draft][data-key=theme][data-val=capivaras]');
  console.log('name kept after rerender:', await p.inputValue('#draft-name'));
  await p.click('[data-action=start-project]');
  await p.screenshot({ path: process.env.SP + '/dev-project.png', fullPage: true });
  // program 4h (should finish before)
  await p.click('[data-action=dev-session][data-mode=dev][data-h="4"]');
  await p.waitForTimeout(3000);
  await p.screenshot({ path: process.env.SP + '/dev-running.png', fullPage: true });
  await p.waitForSelector('#dev-running[hidden]', { state: 'attached', timeout: 30000 });
  console.log('project', await p.evaluate(() => JSON.stringify(S.project)), 'energy', await p.evaluate(() => S.energy));
  // fix bugs
  if (await p.evaluate(() => S.project.bugs >= 1)) {
    await p.click('[data-action=dev-session][data-mode=fix][data-h="1"]');
    await p.waitForSelector('#dev-running[hidden]', { state: 'attached', timeout: 30000 });
  }
  console.log('bugs after fix', await p.evaluate(() => S.project.bugs));
  await p.click('[data-action=draft-price][data-id=free]');
  await p.click('[data-action=launch]');
  await p.waitForTimeout(500);
  await p.screenshot({ path: process.env.SP + '/dev-review.png', fullPage: true });
  console.log('game', await p.evaluate(() => JSON.stringify(S.myGames[0])));
  console.log('review title has escaped name:', await p.innerHTML('#review h2'));
  // sleep -> daily sales
  await p.evaluate(() => { S.energy = 0; });
  await p.click('#btn-sleep');
  console.log('after sleep sold', await p.evaluate(() => S.myGames[0].sold), 'lastSales', await p.evaluate(() => S.myGames[0].lastSales));
  // stream own game
  await p.click('.tab[data-tab=live]'); if (await p.isHidden('#win-stream')) await p.click('[data-action=open-app]');
  await p.click('[data-action=pick-game][data-id="my-1"]');
  await p.click('[data-action=hours][data-h="1"]');
  await p.click('[data-action=start-live]');
  console.log('live game:', await p.textContent('#live-game'));
  await p.waitForSelector('#screen-live[hidden]', { state: 'attached', timeout: 20000 }); await p.waitForSelector('#win-stream:not([hidden])', { timeout: 20000 });
  console.log('hype', await p.evaluate(() => S.myGames[0].hype));
  await p.click('.tab[data-tab=goals]');
  console.log('goals done', await p.evaluate(() => S.goals));
  await p.setViewportSize({ width: 375, height: 800 });
  await p.click('.tab[data-tab=dev]');
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  await p.screenshot({ path: process.env.SP + '/dev-mobile.png', fullPage: true });
  console.log('errors', errs);
  await b.close();
})();
