// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => { S.tutorial = -1; });
  await p.click('.tab[data-tab=career]');
  const visible = async () => p.evaluate(() => [...document.querySelectorAll('#tab-career .subtab')].filter(e => !e.hidden).map(e => e.dataset.sub));
  console.log('começa em:', await visible(), '| saúde visível:', await p.isVisible('#life-card'));
  for (const sub of ['negocios', 'conteudo', 'competicoes']) {
    await p.click(`[data-action=subtab][data-sub=${sub}]`);
    console.log(sub, '->', await visible());
  }
  console.log('bolsa escondida:', await p.isHidden('#stocks-card'), '| ranking visível:', await p.isVisible('#rank-list'));
  await p.screenshot({ path: `${process.env.SP}/subabas.png` });
  await p.reload();
  await p.click('.tab[data-tab=career]');
  console.log('lembra a última sub-aba:', await visible());
  console.log('errors', errs);
  await b.close();
})();
