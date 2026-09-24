// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  p.on('dialog', d => d.accept());
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  await p.goto(url);
  await p.evaluate(() => {
    const ids = ['c5','m5','r5','g5','s3','p4'];
    const games = [1,2,3].map(i => ({ id: i, name: 'Jogo ' + i, engine: 'unity', genre: 'rpg', theme: 'medieval', size: 'medio', score: 7, price: 'p10', day: 1, sold: 100, revenue: 700, lastSales: 10, hype: 0 }));
    const s = { money: 2000000, followers: 20000, pcOn: true, phase2: true, skills: { code: 210, art: 100, sound: 60 },
      engines: ['scratch','python','js','godot','unity'], myGames: games, nextGameId: 4, nextUid: 50,
      inventory: ids.map((id, i) => ({ uid: i + 1, id })), build: { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6 } };
    localStorage.setItem('inforeal-save-v2', JSON.stringify(s));
  });
  await p.goto(url);
  console.log('phase3 on load:', await p.evaluate(() => S.phase3), '| tab:', await p.textContent('.tab[data-tab=ai]'));
  await p.click('.tab[data-tab=ai]');
  await p.fill('#ai-name', '<img src=x>Robo"zinho');
  await p.click('[data-action=create-ai]');
  console.log('ai name sanitized:', await p.evaluate(() => S.ai.name));
  await p.check('[data-toggle=ai-cloud]');
  await p.click('[data-action=train][data-kind=ai][data-h="2"]');
  await p.waitForTimeout(2500);
  await p.screenshot({ path: process.env.SP + '/p3-training.png', fullPage: true });
  await p.waitForSelector('#ai-session[hidden]', { state: 'attached', timeout: 20000 });
  console.log('ai xp/level:', await p.evaluate(() => [Math.round(S.ai.xp), aiLevel()]));
  await p.click('[data-action=generate-game]');
  await p.waitForSelector('#tab-dev:not([hidden])', { timeout: 15000 });
  console.log('ai project:', await p.evaluate(() => JSON.stringify({ n: S.project.name, ai: S.project.ai, size: S.project.size, bugs: Math.round(S.project.bugs) })));
  await p.click('[data-action=launch]');
  console.log('review notes:', await p.evaluate(() => S.lastReview.notes));
  // IA nível 5 -> Fase 4
  await p.evaluate(() => { S.ai.xp = 2300; changed(); });
  console.log('phase4:', await p.evaluate(() => S.phase4));
  await p.click('.tab[data-tab=ai]');
  await p.check('[data-toggle=ai-auto]');
  await p.screenshot({ path: process.env.SP + '/p3-tab.png', fullPage: true });
  await p.click('.tab[data-tab=lab]');
  await p.fill('#lang-name', 'Capivara++');
  await p.click('[data-action=lab-draft][data-key=langStyle][data-val=capi]');
  await p.click('[data-action=create-lang]');
  await p.evaluate(() => { S.lang.stages = [150, 250, 400, 400, 190]; changed(); });
  await p.click('[data-action=lang-work][data-h="1"]');
  await p.waitForSelector('#lab-session[hidden]', { state: 'attached', timeout: 15000 });
  await p.click('[data-action=release-lang]');
  console.log('lang released:', await p.evaluate(() => [S.lang.released, S.engines.includes('mylang')]));
  await p.evaluate(() => { S.server = { rack: true, cpu: true, gpus: ['sv4', 'sv4'] }; changed(); });
  await p.click('[data-action=create-brain]');
  await p.click('[data-action=train][data-kind=brain][data-h="1"]');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: process.env.SP + '/p4-training.png', fullPage: true });
  await p.waitForSelector('#lab-session[hidden]', { state: 'attached', timeout: 15000 });
  await p.evaluate(() => { S.brain.xp = 3300; changed(); });
  await p.click('[data-action=release-brain]');
  await p.fill('#brain-q', 'o que você acha de capivaras?');
  await p.press('#brain-q', 'Enter');
  await p.fill('#brain-q', 'qual o sentido da vida?');
  await p.click('[data-action=ask-brain]');
  console.log('chat:', await p.evaluate(() => brainChat.map(m => m.a)));
  // dormir: vendas, devs, usuários, jogo automático
  const before = await p.evaluate(() => S.myGames.length);
  await p.evaluate(() => { S.energy = 0; render(); });
  await p.click('#btn-sleep');
  console.log('auto game made:', await p.evaluate(() => S.myGames.length) > before, '| devs', await p.evaluate(() => S.lang.devs), '| users', await p.evaluate(() => S.brain.users));
  // Dev tab mostra a linguagem própria
  await p.click('.tab[data-tab=dev]');
  console.log('dev chips has lang:', (await p.textContent('#project')).includes('Capivara++'));
  await p.click('[data-action=draft][data-key=engine][data-val=mylang]');
  await p.click('[data-action=start-project]');
  await p.click('[data-action=dev-session][data-mode=dev][data-h="1"]');
  await p.waitForTimeout(1200);
  console.log('editor file:', await p.textContent('#editor-file'), '|', (await p.textContent('#editor-code')).split('\n')[0]);
  await p.click('[data-action=stop-dev]');
  // zerar
  await p.evaluate(() => { S.brain.xp = 50000; S.lang.devs = 150000; changed(); });
  await p.click('.tab[data-tab=lab]');
  console.log('finished:', await p.evaluate(() => S.finished), await p.isVisible('#lab-end'));
  await p.screenshot({ path: process.env.SP + '/p4-tab.png', fullPage: true });
  await p.setViewportSize({ width: 375, height: 800 });
  console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('goals', await p.evaluate(() => S.goals.join(',')));
  console.log('errors', errs);
  await b.close();
})();
