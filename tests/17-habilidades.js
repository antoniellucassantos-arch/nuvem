// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  const before = await p.evaluate(() => { S.tutorial = -1; S.stats.lives = 7; render(); return { free: pointsFree(), gear: gearMult(), energy: maxEnergy(), scam: Hooks.filter('scamChance', 0.12) }; });
  console.log('antes', JSON.stringify(before));
  await p.click('.tab[data-tab=career]');
  await p.click('[data-action=perk-up][data-id=charisma]');
  await p.click('[data-action=perk-up][data-id=luck]');
  console.log('botão sem pontos desabilitado:', await p.isDisabled('[data-action=perk-up][data-id=stamina]'));
  const after = await p.evaluate(() => ({ free: pointsFree(), gear: gearMult().toFixed(3), energy: maxEnergy(), scam: Hooks.filter('scamChance', 0.12).toFixed(3), perks: S.perks }));
  console.log('depois', JSON.stringify(after));
  await p.evaluate(() => { S.stats.lives = 10; render(); });
  await p.click('[data-action=perk-up][data-id=stamina]');
  console.log('energia com resistência:', await p.evaluate(() => maxEnergy()));
  await p.locator('#skills-card').screenshot({ path: `${process.env.SP}/habilidades.png` });
  console.log('errors', errs);
  await b.close();
})();
