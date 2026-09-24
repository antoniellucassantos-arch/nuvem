// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
// Loja própria, escolhas, capivara que evolui, cápsula do tempo e modo desafio.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { window.TEST_CALM = true; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  await p.evaluate(() => { S.tutorial = -1; S.money = 200000; S.followers = 5000; render(); });
  // loja
  await p.click('.tab[data-tab=career]');
  await p.click('[data-action=store-open]');
  await p.click('[data-action=store-buy][data-cat=gpu]');
  const m0 = await p.evaluate(() => S.money);
  await p.evaluate(() => { S.energy = 0; sleep(); });
  console.log('loja vendeu:', await p.evaluate(() => store().sold), 'lucro:', Math.round(await p.evaluate(() => S.money) - m0) > 0);
  // escolha
  await p.evaluate(() => { S.pendingChoice = 'energy'; render(); });
  console.log('modal visível:', await p.isVisible('#choice-modal'));
  await p.screenshot({ path: `${process.env.SP}/escolha.png` });
  await p.click('#choice-modal [data-opt=b]');
  console.log('escolha resolvida:', await p.evaluate(() => S.pendingChoice === null), await p.isHidden('#choice-modal'));
  // capivara
  await p.evaluate(() => { S.counts.pet = 4; render(); feedPet(); });
  console.log('capivara:', await p.evaluate(() => petStage().name));
  // desafio
  await p.click('.tab[data-tab=goals]');
  await p.click('[data-action=challenge][data-id=generic]');
  console.log('desafio:', await p.evaluate(() => [S.challenge, priceOf(PART_BY_ID.p2) > 1e8, priceOf(PART_BY_ID.p1) < 1000]));
  // cápsula: 2077 -> anos 2000
  await p.evaluate(() => localStorage.setItem('inforeal-mode', 'future'));
  await p.goto(url);
  await p.evaluate(() => { S.tutorial = -1; ['c4','m4','r4','g4','s2','p3'].forEach((id, i) => { S.inventory.push({ uid: 90 + i, id }); S.build[SLOTS[i]] = 90 + i; }); render(); });
  await p.click('.tab[data-tab=goals]');
  await p.click('[data-action=capsule]');
  await p.evaluate(() => localStorage.setItem('inforeal-mode', 'retro'));
  await p.goto(url);
  console.log('chegou em 2004:', await p.evaluate(() => S.inventory.some(i => i.id === 'tx1')), await p.evaluate(() => PART_BY_ID.tx1.score));
  await p.evaluate(() => localStorage.setItem('inforeal-mode', 'modern'));
  console.log('errors', errs);
  await b.close();
})();
