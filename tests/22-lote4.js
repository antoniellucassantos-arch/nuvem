// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
// Mineração, canal de vídeos, podcast, clipes e Mundial.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => {
    S.tutorial = -1; S.money = 50000; S.followers = 6000; S.day = 25;
    ['c4','m4','r4','g4','s2','p3'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; });
    S.pcOn = true; render();
  });
  await p.click('.tab[data-tab=career]'); await p.evaluate(() => document.querySelectorAll('#tab-career .subtab').forEach(e => { e.hidden = false; }));  // testes veem todas as sub-abas
  await p.click('[data-action=video][data-id=review]');
  await p.click('[data-action=podcast]');
  await p.check('[data-toggle=mining]');
  await p.click('[data-action=worlds]');
  console.log('mundial:', await p.evaluate(() => JSON.stringify(media().worlds)));
  // 3 lives do Mundial vencidas
  for (let r = 0; r < 3; r++) {
    await p.evaluate(() => { S.energy = 100; selectedGame = 'fogo'; selectedHours = 1; openApp = 'stream'; startLive(); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { sim.manual = true; sim.score = media().worlds.target + 5; endLive('stopped'); });
  }
  console.log('campeão:', await p.evaluate(() => media().worldTitles), '| clipes:', await p.evaluate(() => media().clips.length));
  await p.click('.tab[data-tab=career]'); await p.evaluate(() => document.querySelectorAll('#tab-career .subtab').forEach(e => { e.hidden = false; }));  // testes veem todas as sub-abas
  await p.click('[data-action=clip][data-i="0"]');
  const f0 = await p.evaluate(() => S.followers);
  await p.evaluate(() => { S.energy = 0; sleep(); });
  console.log('vídeo views:', await p.evaluate(() => media().videos[0].views), '| moedas:', await p.evaluate(() => media().coins), '| cresceu:', await p.evaluate(() => S.followers) > f0);
  await p.click('.tab[data-tab=career]'); await p.evaluate(() => document.querySelectorAll('#tab-career .subtab').forEach(e => { e.hidden = false; }));  // testes veem todas as sub-abas
  await p.click('[data-action=sell-coins]');
  await p.locator('#media-card').screenshot({ path: `${process.env.SP}/conteudo.png` });
  console.log('errors', errs);
  await b.close();
})();
