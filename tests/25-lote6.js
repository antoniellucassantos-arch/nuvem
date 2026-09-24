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
    out.room = !!document.querySelector('#room-card svg');
    const code = challengeCode();
    out.codeOk = readCode(code).f === Math.round(S.followers);
    S.followers = 10; renderBatch6();
    document.querySelector('#friend-code').value = code; compareCode(code);
    out.compare = document.querySelector('#challenge-result').textContent.includes('Seguidores');
    out.canvas = document.querySelector('#profile-canvas').toDataURL().length > 1000;
    S.money = 5e6; S.followers = 60000; hwFound(); hwResearch(); hwLaunch();
    out.hw = S.hw.tech === 2 && S.hw.cards.length === 1;
    Hooks.run('daily');
    out.chat = true; addChat('x', 'KKKK morreu'); 
    return out;
  });
  console.log(r);
  console.log('errors', errors);
  await b.close();
})();
