// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });  // sem eventos aleatórios (testados no 06 e 08)
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  await p.evaluate(() => {
    const ids = ['c5','m5','r5','g5','s3','p4'];
    localStorage.setItem('inforeal-save-v2', JSON.stringify({ money: 500000, followers: 20000, pcOn: true, nextUid: 20, day: 29,
      inventory: ids.map((id, i) => ({ uid: i + 1, id })), build: { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6 } }));
  });
  await p.goto(url);
  console.log('released parts count:', await p.evaluate(() => PARTS.filter(isReleased).length), '/ total', await p.evaluate(() => PARTS.length));
  console.log('RTX 5060 price day29:', await p.evaluate(() => [PART_BY_ID.x1.price, priceOf(PART_BY_ID.x1)]), 'GT710:', await p.evaluate(() => priceOf(PART_BY_ID.g1)));
  await p.click('.tab[data-tab=shop]');
  await p.click('.chip-btn[data-cat=gpu]');
  console.log('first gpu in shop:', await p.textContent('#shop-list .shop-item .slot-name'));
  await p.click('.tab[data-tab=live]');
  console.log('news badge:', await p.textContent('#news-badge'));
  await p.click('[data-action=open-app][data-app=news]');
  await p.screenshot({ path: process.env.SP + '/r-news.png' });
  console.log('badge after open hidden:', await p.isHidden('#news-badge'));
  // dormir até o dia 30 (GTZ VI) e 34 (soquete novo)
  await p.evaluate(() => { S.energy = 0; render(); });
  await p.click('#btn-sleep');
  const toasts = await p.$$eval('.toast', els => els.map(e => e.textContent));
  console.log('toasts day30:', toasts.filter(t => t.includes('lançado') || t.includes('Chegou')));
  await p.click('[data-action=open-app][data-app=stream]');
  console.log('first game in list:', await p.textContent('#games .game .slot-name'), '|', await p.textContent('#games .game'));
  await p.click('[data-action=buy-game][data-id=gta6]');
  await p.click('[data-action=pick-game][data-id=gta6]');
  await p.click('[data-action=start-live]');
  console.log('live mult includes hype:', await p.evaluate(() => [live.game.name, freshness(live.game).toFixed(2), live.fps]));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: process.env.SP + '/r-live-gta6.png' });
  await p.click('[data-action=stop-live]');
  await p.evaluate(() => { for (let i = 0; i < 5; i++) { S.energy = 0; sleep(); } });
  console.log('day', await p.evaluate(() => S.day), '| Z890 released:', await p.evaluate(() => isReleased(PART_BY_ID.x5)));
  // compatibilidade do soquete novo
  await p.evaluate(() => { S.inventory.push({ uid: 50, id: 'x6' }); S.build.cpu = 50; S.pcOn = false; render(); });
  await p.click('.tab[data-tab=build]');
  await p.click('#btn-power');
  await p.waitForTimeout(3000);
  console.log('POST with LGA1851 cpu on AM5 board:', (await p.textContent('#post')).split('\n').filter(l => l.includes('❌')));
  // geração infinita
  console.log('future sample:', await p.evaluate(() => RELEASES.filter(r => r.day >= 90 && r.day <= 130).map(r => `${r.day}: ${(r.part || r.game).name}`)));
  console.log('last release day:', await p.evaluate(() => RELEASES[RELEASES.length - 1].day), 'ids unique:', await p.evaluate(() => new Set(PARTS.map(p => p.id)).size === PARTS.length && new Set(GAMES.map(g => g.id)).size === GAMES.length));
  await p.evaluate(() => { S.build.cpu = 1; S.pcOn = true; render(); });
  await p.setViewportSize({ width: 375, height: 800 });
  await p.click('.tab[data-tab=live]');
  await p.click('.taskbar [data-app=news]');
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  await p.screenshot({ path: process.env.SP + '/r-news-mobile.png' });
  console.log('errors', errs);
  await b.close();
})();
