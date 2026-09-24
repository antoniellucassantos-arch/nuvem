// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  await p.click('.tab[data-tab=live]');
  console.log('PC off -> no signal visible:', await p.isVisible('#screen-off'));
  // save: PC médio ligado + todos os periféricos
  await p.evaluate(() => {
    const ids = ['c4','m4','r4','g4','s2','p3'];
    localStorage.setItem('inforeal-save-v2', JSON.stringify({ money: 900000, followers: 150000, pcOn: true, nextUid: 20, phase2: true,
      gear: ['e1','e2','e3','e5','e6','e7','e8','e10'], cases: ['k1','k4'], caseId: 'k4', games: ['paciencia','fogo','moba','cs','gta'],
      inventory: ids.map((id, i) => ({ uid: i + 1, id })), build: { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6 } }));
  });
  await p.goto(url);
  await p.click('.tab[data-tab=live]');
  console.log('desktop visible:', await p.isVisible('#screen-os'), '| window hidden:', await p.isHidden('#win-stream'));
  await p.screenshot({ path: process.env.SP + '/n-desktop.png' });
  await p.click('[data-action=open-app]');
  await p.screenshot({ path: process.env.SP + '/n-window.png' });
  // live de GTZ (racer) jogando manualmente
  await p.click('[data-action=pick-game][data-id=gta]');
  await p.click('[data-action=start-live]');
  await p.waitForTimeout(1200);
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(300);
  await p.keyboard.press('ArrowRight');
  console.log('sim mode/manual:', await p.evaluate(() => [sim.mode, sim.manual, sim.fps]));
  await p.evaluate(() => liveBanner('🚀 RAID! Teste mandou 500 pessoas para a sua live!'));
  await p.waitForTimeout(600);
  await p.screenshot({ path: process.env.SP + '/n-live-racer.png' });
  // queda de luz com nobreak não derruba
  await p.evaluate(() => { const ev = LIVE_EVENTS[5]; console.log('blackout->', ev.run(live)); });
  await p.click('[data-action=stop-live]');
  // shooter
  await p.click('[data-action=pick-game][data-id=cs]');
  await p.click('[data-action=start-live]');
  await p.waitForTimeout(1500);
  const box = await p.locator('#sim-canvas').boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await p.waitForTimeout(800);
  await p.screenshot({ path: process.env.SP + '/n-live-shooter.png' });
  console.log('shooter manual:', await p.evaluate(() => sim.manual));
  await p.click('[data-action=stop-live]');
  // runner com jogo próprio de baixa performance: força fonte genérica e explosão
  await p.evaluate(() => {
    S.inventory.push({ uid: 99, id: 'p1' }); S.build.psu = 99; S.pcOn = true;
    Math._r = Math.random; Math.random = () => 0.001;   // força a explosão
    render();
  });
  await p.click('[data-action=pick-game][data-id=paciencia]');
  await p.click('[data-action=start-live]');
  await p.waitForTimeout(1500);
  await p.evaluate(() => { Math.random = Math._r; });
  console.log('after boom: pcOn', await p.evaluate(() => S.pcOn), '| psu', await p.evaluate(() => S.build.psu), '| reason', await p.evaluate(() => S.lastLive.reason));
  console.log('screen-off visible:', await p.isVisible('#screen-off'));
  // servidor de IA na loja
  await p.evaluate(() => { S.phase3 = true; S.phase4 = true; S.ai = { name: 'GameGPT', xp: 2300, epoch: 0, cloud: false, auto: false, autoPrice: 'p10', made: 0 };
    S.lang = { name: 'Capivara++', style: 'capi', typing: 'dinamica', stages: [150,250,400,400,200], released: true, devs: 500, day: 1 };
    S.engines.push('mylang');
    const fresh = { cpu: 'c4', mobo: 'm4', ram: 'r4', gpu: 'g4', storage: 's2', psu: 'p4' };
    Object.entries(fresh).forEach(([slot, id], i) => { S.inventory.push({ uid: 200 + i, id }); S.build[slot] = 200 + i; });
    console.log('lost with psu:', JSON.stringify(S.build));
    S.pcOn = true; S.energy = 100; changed(); });
  await p.click('.tab[data-tab=shop]');
  await p.click('.chip-btn[data-cat=server]');
  console.log('gpu before rack:', await p.textContent('.shop-item:nth-child(3) button'));
  await p.click('[data-action=buy][data-id=sv0]');
  await p.click('[data-action=buy][data-id=sv1]');
  for (let i = 0; i < 3; i++) await p.click('[data-action=buy][data-id=sv4]');
  await p.screenshot({ path: process.env.SP + '/n-shop-server.png', fullPage: true });
  await p.click('.tab[data-tab=lab]');
  await p.click('[data-action=create-brain]');
  console.log('brain created:', await p.evaluate(() => !!S.brain), '| compute', await p.evaluate(() => serverCompute()));
  await p.click('[data-action=train][data-kind=brain][data-h="1"]');
  await p.waitForTimeout(1500);
  await p.locator('#server-card').screenshot({ path: process.env.SP + '/n-rack.png' });
  await p.click('#lab-session [data-action=stop-lab]');
  // dormir: evento diário e conta do servidor
  await p.evaluate(() => { S.energy = 0; render(); });
  await p.click('#btn-sleep');
  await p.click('.tab[data-tab=live]');
  await p.screenshot({ path: process.env.SP + '/n-desk-full.png', fullPage: true });
  await p.setViewportSize({ width: 375, height: 800 });
  await p.click('[data-action=open-app]').catch(() => {});
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  await p.screenshot({ path: process.env.SP + '/n-mobile.png', fullPage: true });
  console.log('errors', errs);
  await b.close();
})();
