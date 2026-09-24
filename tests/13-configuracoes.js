// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });  // sem eventos aleatórios (testados no 06 e 08)
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => { S.tutorial = -1; });
  await p.click('[data-action=open-settings]');
  console.log('goals visible', await p.isVisible('#settings-card'));
  await p.click('[data-action=set-speed][data-v="4"]');
  await p.evaluate(() => { const r = document.getElementById('set-volume'); r.value = 30; r.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.uncheck('#set-anim');
  console.log('settings', await p.evaluate(() => JSON.stringify(S.settings)), 'no-anim', await p.evaluate(() => document.documentElement.classList.contains('no-anim')));
  // live em 4x termina bem mais rápido
  await p.evaluate(() => { ['c1','m1','r1','g1','s1','p2'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[['cpu','mobo','ram','gpu','storage','psu'][i]] = 90 + i; }); S.pcOn = true; render(); });
  await p.click('.tab[data-tab=live]');
  await p.click('.taskbar [data-app=stream]');
  const t0 = Date.now();
  await p.click('[data-action=start-live]');
  await p.waitForSelector('#screen-live[hidden]', { state: 'attached', timeout: 20000 });
  console.log('1h live em 4x levou', ((Date.now() - t0) / 1000).toFixed(1), 's (em 1x seriam ~4,2 s)');
  await p.reload();
  console.log('persistiu', await p.evaluate(() => S.settings.speed === 4 && S.settings.volume === 30 && !S.settings.anim));
  console.log('errors', errs);
  await b.close();
})();
