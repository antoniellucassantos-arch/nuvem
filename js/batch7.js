'use strict';

// Lote 7: loja de jogos própria, invasão alienígena, você dentro do jogo e capivara presidente.

/* ---------- 22. Loja de jogos própria ---------- */

const GSTORE_COST = 300000;

function gstoreOpen() {
  if (S.gstore || S.money < GSTORE_COST || S.myGames.length < 3) return;
  S.money -= GSTORE_COST;
  S.gstore = { users: 1000, fee: 30 };
  toast('🛒 Sua loja CapiStore abriu! Seus jogos vendem sem pagar taxa para ninguém.', 'goal');
  changed();
}

// Sem taxa da loja dos outros: seus jogos vendem mais.
Hooks.on('sales', u => (S.gstore ? Math.round(u * 1.3) : u));

Hooks.on('daily', () => {
  if (!S.gstore) return;
  const G = S.gstore;
  // Taxa baixa atrai mais gente; taxa alta rende mais por venda.
  G.users = Math.round(G.users * (1 + (40 - G.fee) / 400) + S.followers * 0.001);
  const income = Math.round(G.users * G.fee * 0.05);
  S.money += income;
  toast(`🛒 CapiStore: ${num(G.users)} usuários, +${money(income)} em taxas de outros estúdios.`);
});

/* ---------- 23. Invasão alienígena ---------- */

Hooks.on('daily', () => {
  if (S.day < 20 || S.invasion || Math.random() > 0.03) return;
  S.invasion = true;
  toast('👽 ALERTA: discos voadores sobre a cidade! Faça uma live agora: o mundo inteiro quer assistir.', 'goal');
});

Hooks.on('liveStart', () => {
  if (!S.invasion) return;
  S.invasion = false;
  live.mult *= 2;
  if (sim) sim.foe = '👽';
  liveBanner('👽 Invasão alienígena ao vivo! Público em dobro. Os ETs estão no chat.');
  addChat('Zorblax', 'saudações terráqueos. seu FPS é primitivo.', 'donation');
});

/* ---------- 24. Você dentro do jogo ---------- */

Hooks.on('liveStart', () => {
  if (!S.insideGame) return;
  if (sim) sim.hero = '🧍';
  live.mult *= 1.1;
  S.energy = Math.max(0, S.energy - 10);
  addChat('Sistema', 'Você entrou no jogo com óculos de realidade virtual! (+10% de público, −10 de energia)', 'sys');
});

/* ---------- 25. Capivara presidente ---------- */

const PRES_UNLOCK = 1e6;
const PRES_COST = 1e6;
const DECREES = [
  () => { S.money += 50000; return 'decretou feriado do PC gamer: +R$ 50.000 de "incentivo".'; },
  () => { S.pet.food = 100; return 'decretou capim grátis para todos. Ela está cheia.'; },
  () => { S.followers = Math.round(S.followers * 1.02); return 'fez pronunciamento na TV citando seu canal: +2% de seguidores.'; },
  () => { S.energy = maxEnergy(); return 'decretou que ninguém acorda cedo. Energia cheia!'; },
  () => 'dormiu na reunião ministerial. Ninguém teve coragem de acordar.',
];

function presidentRun() {
  if (S.president || S.money < PRES_COST || S.followers < PRES_UNLOCK) return;
  S.money -= PRES_COST;
  const votes = 40 + Math.random() * 30;
  if (votes >= 50) {
    S.president = { day: S.day };
    toast(`🗳️ ${votes.toFixed(1)}% dos votos! Sua capivara é a nova PRESIDENTE! 🦫🇧🇷`, 'goal');
  } else {
    toast(`🗳️ Só ${votes.toFixed(1)}% dos votos. A capivara perdeu, mas ganhou fãs. Tente na próxima eleição.`, 'bad');
  }
  changed();
}

Hooks.on('daily', () => {
  if (S.president) toast(`🦫 A Presidente Capivara ${pick(DECREES)()}`, 'goal');
});

/* ---------- Interface ---------- */

function renderBatch7() {
  const gs = $('#gstore-card');
  if (gs) {
    gs.innerHTML = S.gstore
      ? `<h2>🛒 CapiStore</h2><p>${num(S.gstore.users)} usuários • taxa de <b>${S.gstore.fee}%</b> sobre jogos de outros estúdios</p>
        <div class="chips">${[10, 20, 30, 40].map(f => `<button class="chip-btn ${S.gstore.fee === f ? 'active' : ''}" data-action="gstore-fee" data-v="${f}">${f}%</button>`).join('')}</div>
        <p class="muted">Taxa baixa atrai usuários; taxa alta rende mais agora. Seus jogos vendem +30%.</p>`
      : `<h2>🛒 Sua loja de jogos</h2><p class="muted">Crie sua própria loja e pare de pagar taxa. Precisa de 3 jogos lançados.</p>
        <button class="btn" data-action="gstore-open" ${S.money < GSTORE_COST || S.myGames.length < 3 ? 'disabled' : ''}>Abrir CapiStore (${money(GSTORE_COST)})</button>`;
  }
  const pr = $('#president-card');
  if (pr) {
    pr.hidden = !S.president && S.followers < PRES_UNLOCK / 10;
    pr.innerHTML = S.president
      ? `<h2>🦫🇧🇷 Presidente Capivara</h2><p>No cargo desde o dia ${S.president.day}. Todo dia sai um decreto novo.</p>`
      : `<h2>🗳️ Capivara para presidente</h2><p class="muted">Com ${num(PRES_UNLOCK)} seguidores, sua capivara pode se candidatar.</p>
        <button class="btn" data-action="president-run" ${S.money < PRES_COST || S.followers < PRES_UNLOCK ? 'disabled' : ''}>Fazer campanha (${money(PRES_COST)})</button>`;
  }
  const it = $('#inside-toggle');
  if (it) it.innerHTML = `<button class="chip-btn ${S.insideGame ? 'active' : ''}" data-action="inside-game">🥽 Entrar dentro do jogo ${S.insideGame ? '(ligado)' : '(desligado)'}</button>`;
}

Hooks.on('render', renderBatch7);
Hooks.on('action', d => {
  switch (d.action) {
    case 'gstore-open': gstoreOpen(); break;
    case 'gstore-fee': S.gstore.fee = Number(d.v); changed(); break;
    case 'president-run': presidentRun(); break;
    case 'inside-game': S.insideGame = !S.insideGame; changed(); break;
  }
});
renderBatch7();
