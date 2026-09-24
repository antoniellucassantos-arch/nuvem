// Teste automático no navegador (Playwright). Rode com: tests/run-all.sh
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html'));
  const res = await p.evaluate(async (DAYS) => {
    Math.seedless = true;
    toast = () => {}; S.tutorial = -1; S.sound = false;
    const log = {}; const mark = k => { if (!(k in log)) log[k] = S.day; };
    const runLive = () => { if (!live) return; clearInterval(live.timer); while (live) liveTick(); };
    const runDev = () => { if (!dev) return; clearInterval(dev.timer); while (dev) devTick(); };
    const buy = id => { const n = S.inventory.length; buyPart(id); return S.inventory.length > n ? S.inventory[S.inventory.length - 1].uid : null; };
    const inst = uid => uid && installPart(uid);
    // PC inicial
    ['c1','m1','r1','g1','s1','p1'].forEach(id => inst(buy(id)));
    S.pcOn = checkBuild().ok;
    const avail = cat => PARTS.filter(p => p.cat === cat && isReleased(p) && p.unlock <= S.followers);
    const cur = slot => S.build[slot] ? itemPart(S.build[slot]) : null;
    function upgrade() {
      const budget = () => S.money * 0.6;
      // GPU
      const g = avail('gpu').filter(p => p.score > (cur('gpu')?.score || 0) && priceOf(p) < budget()).sort((a,b)=>b.score-a.score)[0];
      if (g) inst(buy(g.id));
      // CPU + placa-mãe + RAM
      const c = avail('cpu').filter(p => p.score > (cur('cpu')?.score || 0)).sort((a,b)=>b.score-a.score);
      for (const cpu of c) {
        const mobo = cur('mobo').socket === cpu.socket ? cur('mobo') : avail('mobo').filter(m => m.socket === cpu.socket).sort((a,b)=>priceOf(a)-priceOf(b))[0];
        if (!mobo) continue;
        const ram = avail('ram').filter(r => r.type === mobo.ram).sort((a,b)=>b.gb-a.gb).find(r => true);
        const needRam = cur('ram').type !== mobo.ram;
        const cost = priceOf(cpu) + (mobo === cur('mobo') ? 0 : priceOf(mobo)) + (needRam ? priceOf(ram) : 0);
        if (cost < budget()) { if (mobo !== cur('mobo')) inst(buy(mobo.id)); if (needRam) inst(buy(ram.id)); inst(buy(cpu.id)); break; }
      }
      const r = avail('ram').filter(x => x.type === cur('mobo').ram && x.gb > cur('ram').gb && priceOf(x) < budget()).sort((a,b)=>b.gb-a.gb)[0];
      if (r) inst(buy(r.id));
      const need = checkBuild().watts;
      if (!cur('psu') || cur('psu').watts < need || cur('psu').generic) {
        const ps = avail('psu').filter(x => !x.generic && x.watts >= need * 1.2).sort((a,b)=>priceOf(a)-priceOf(b))[0];
        if (ps && priceOf(ps) < S.money) inst(buy(ps.id));
      }
      if (!cur('storage')) inst(buy('s1'));
      for (const e of avail('gear').filter(x => !S.gear.includes(x.id) && x.mult > 1 && priceOf(x) < S.money * 0.1)) buyPart(e.id);
      S.pcOn = checkBuild().ok;
    }
    function bestGame() {
      const b = checkBuild();
      let best = null, bv = -1;
      for (const g of allGames()) {
        if (!ownsGame(g.id)) { if (g.price && g.price < S.money * 0.2) buyGame(g.id); else if (g.price) continue; }
        if (!ownsGame(g.id)) continue;
        const v = g.pop * freshness(g) * quality(estimateFps(g, b)).mult * novelty(g.id);
        if (v > bv) { bv = v; best = g.id; }
      }
      return best;
    }
    for (let d = 0; d < DAYS; d++) {
      upgrade();
      if (!S.pcOn) { upgrade(); S.pcOn = checkBuild().ok; }
      // Fase 2: estudar e desenvolver com metade da energia
      if (S.phase2) {
        if (S.money > 2000) study('code', 'online');
        for (const e of ENGINES) if (!S.engines.includes(e.id) && skillLevel('code') >= e.code && S.money > e.price * 3) learnEngine(e.id);
        if (!S.project) { draft.engine = S.engines[S.engines.length - 1]; draft.genre = 'rpg'; draft.theme = 'medieval';
          draft.focus = { code: 50, art: 30, sound: 20 }; draft.size = skillLevel('code') >= 6 ? 'grande' : skillLevel('code') >= 3 ? 'medio' : 'pequeno'; startProject(); }
        if (S.project && S.project.progress < S.project.target && S.energy >= 40) { startDevSession('dev', 2); runDev(); }
        else if (S.project && S.project.progress >= S.project.target) {
          if (S.project.bugs >= 1 && S.energy >= 20) { startDevSession('fix', 1); runDev(); }
          if (S.project && (S.project.bugs < 1 || S.energy < 20)) { draft.price = 'p10'; launchGame(); }
        }
      }
      while (S.energy >= 20 && S.pcOn) {
        selectedGame = bestGame(); selectedHours = S.energy >= 80 ? 4 : S.energy >= 40 ? 2 : 1;
        startLive(); if (!live) break; runLive();
        if (!S.pcOn) upgrade();
      }
      S.energy = 0; sleep();
      if (S.followers >= 100) mark('f100'); if (S.phase2) mark('fase2'); if (S.followers >= 1000) mark('f1k');
      if (S.followers >= 1e4) mark('f10k'); if (S.followers >= 1e5) mark('f100k'); if (S.followers >= 1e6) mark('f1M');
      if (S.myGames.length >= 1) mark('jogo1'); if (S.myGames.length >= 3) mark('jogo3'); if (S.phase3) mark('fase3');
      if (S.money >= 1e5) mark('R$100k'); if (S.money >= 1e6) mark('R$1M');
    }
    return { log, day: S.day, followers: Math.round(S.followers), money: Math.round(S.money), code: skillLevel('code'), games: S.myGames.length,
      scores: S.myGames.map(g => g.score), build: SLOTS.map(s => cur(s)?.name).join(' | ') };
  }, 120);
  console.log(JSON.stringify(res, null, 1));
  console.log('errors', errs.slice(0, 3));
  await b.close();
})();
