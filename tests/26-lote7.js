const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { window.TEST_CALM = true; });
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  const r = await p.evaluate(() => {
    const out = {};
    S.money = 1e7; S.followers = 2e6; S.day = 30;
    const f = { engine: 'scratch', genre: GENRES[0].id, theme: THEMES[0].id, score: 5 }; S.myGames.push({ ...f, id: 90 }, { ...f, id: 91 }, { ...f, id: 92 });
    const ch = window.changed; window.changed = () => {}; gstoreOpen(); window.changed = ch; out.store = !!S.gstore && Hooks.filter('sales', 100, f) >= 130;
    S.myGames.length = 0;
    const m0 = S.money; Hooks.run('daily'); out.storeIncome = S.money !== m0;
    for (let i = 0; i < 20 && !S.president; i++) { S.money = 1e7; presidentRun(); }
    out.president = !!S.president;
    S.insideGame = true; S.invasion = true; render();
    out.toggle = document.querySelector('#inside-toggle').textContent.includes('ligado');
    return out;
  });
  console.log(r);
  console.log('errors', errors);
  await b.close();
})();
