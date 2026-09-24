// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => {
    S.tutorial = -1; S.money = 1e5;
    ['c1','m1','r1','g1','s1','p2'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; });
    S.pcOn = true; render();
  });
  const check = async day => {
    await p.evaluate(d => { S.day = d; render(); }, day);
    return p.evaluate(() => ({
      season: currentSeason() && currentSeason().id,
      gpuPrice: priceOf(PART_BY_ID.g2), gearMult: gearMult().toFixed(2),
      seasonGames: allGames().filter(g => g.season).map(g => g.name),
    }));
  };
  console.log('dia 10:', JSON.stringify(await check(10)));
  console.log('carnaval dia 16:', JSON.stringify(await check(16)));
  await p.click('.tab[data-tab=live]');
  await p.screenshot({ path: `${process.env.SP}/temporada-carnaval.png` });
  console.log('black friday dia 36:', JSON.stringify(await check(36)), 'fraude g2?', await p.evaluate(() => isFraud(PART_BY_ID.g2)));
  console.log('natal dia 52:', JSON.stringify(await check(52)));
  const m0 = await p.evaluate(() => S.money);
  await p.evaluate(() => { S.energy = 0; sleep(); });
  console.log('presente do noel:', Math.round(await p.evaluate(() => S.money) - m0) > 0);
  await p.click('.tab[data-tab=live]');
  await p.screenshot({ path: `${process.env.SP}/temporada-natal.png` });
  console.log('errors', errs);
  await b.close();
})();
