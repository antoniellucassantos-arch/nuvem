'use strict';

// Lote 5: doações com pedidos, enquetes do chat, rival com história, dificuldade e tema claro.

/* ---------- 26. Doações com pedidos ---------- */

const DARES = [
  { text: 'jogar de olhos fechados por 1 minuto', fail: 'Você morreu 12 vezes. O chat chorou de rir.' },
  { text: 'comer uma pimenta muito ardida', fail: 'Você chorou ao vivo. −10 de saúde, mas o clipe bombou.' },
  { text: 'cantar o hino do seu time', fail: 'Desafinou tanto que o gato fugiu.' },
  { text: 'jogar com o mouse invertido', fail: 'Você jogou o mouse na parede. Sem estragos... dessa vez.' },
  { text: 'imitar uma capivara por 30 segundos', fail: 'A sua capivara pet ficou com ciúmes.' },
];

LIVE_EVENTS.push({
  chance: 0.03,
  when: L => !L.dare,
  run(L) {
    const d = pick(DARES);
    const value = Math.round(50 + L.viewers * 1.5);
    L.dare = { ...d, value, until: Date.now() + 6000 / gameSpeed() };
    const box = $('#dare-box');
    box.innerHTML = `<b>💸 ${pick(NAMES)} doou ${money(value)} e pediu:</b> ${d.text}!
      <div class="chips"><button class="btn small" data-action="dare" data-ok="1">Aceitar</button>
      <button class="btn small ghost" data-action="dare" data-ok="0">Recusar</button></div>`;
    box.hidden = false;
    setTimeout(() => { if (live && live.dare && !live.dare.done) answerDare(false); }, 6000 / gameSpeed());
  },
});

function answerDare(ok) {
  const L = live;
  $('#dare-box').hidden = true;
  if (!L || !L.dare || L.dare.done) return;
  L.dare.done = true;
  if (!ok) return addChat('Sistema', 'Você recusou o pedido. O doador pediu reembolso. 😒', 'sys');
  S.money += L.dare.value;
  L.earned += L.dare.value;
  if (Math.random() < 0.35) {
    if (S.life) S.life.health = Math.max(0, S.life.health - 10);
    const f = Math.round(5 + L.viewers * 0.1);
    S.followers += f; L.followers += f;
    liveBanner(`😂 Deu errado: ${L.dare.fail} (+${num(f)} seguidores)`);
  } else {
    liveBanner(`✅ Você cumpriu o pedido e ganhou ${money(L.dare.value)}!`);
  }
}

/* ---------- 27. Enquetes do chat ---------- */

Hooks.on('liveEnd', () => {
  const owned = allGames().filter(g => ownsGame(g.id));
  if (owned.length < 2 || Math.random() > 0.5) return;
  const opts = owned.sort(() => Math.random() - 0.5).slice(0, 3);
  const winner = pick(opts);
  S.poll = { winner: winner.id, name: winner.name };
  toast(`🗳️ Enquete do chat: ${opts.map(o => o.name).join(' × ')}. Venceu ${winner.name}! Jogue ele na próxima live para bônus.`, 'goal');
});

Hooks.on('liveStart', () => {
  if (!S.poll) return;
  if (live.game.id === S.poll.winner) {
    live.mult *= 1.15;
    liveBanner(`🗳️ Você seguiu a enquete do chat! +15% de público.`);
  }
  S.poll = null;
});

/* ---------- 28. Rival com história ---------- */

const RIVAL = 'CapivaraPro';
const RIVAL_STORY = [
  { at: 100, id: 'rival1', text: `😏 ${RIVAL} comentou na sua live: "Esse PC aí roda até Paciência?"`,
    a: ['Responder com humor', () => { S.followers *= 1.03; return 'O chat amou sua resposta: +3% de seguidores.'; }],
    b: ['Ignorar', () => 'Você ignorou. Ele vai voltar...'] },
  { at: 1000, id: 'rival2', text: `⚔️ ${RIVAL} te desafiou publicamente para um x1 valendo R$ {v}!`,
    a: ['Aceitar o x1', () => { if (Math.random() < 0.55) { S.money += val(); S.followers *= 1.05; return `Você venceu ${RIVAL}! +${money(val())} e +5% de seguidores.`; } S.followers *= 0.98; return 'Você perdeu por pouco. Revanche um dia!'; }],
    b: ['Fugir da briga', () => { S.followers *= 0.97; return 'O chat te chamou de medroso: −3% de seguidores.'; }] },
  { at: 10000, id: 'rival3', text: `🎤 ${RIVAL} lançou uma "diss track" zoando você!`,
    a: ['Gravar uma resposta', () => { S.energy = Math.max(0, S.energy - 30); S.followers *= 1.1; return 'Sua resposta viralizou: +10% de seguidores! (−30 de energia)'; }],
    b: ['Deixar pra lá', () => 'Você manteve a classe.'] },
  { at: 100000, id: 'rival4', text: `🤝 ${RIVAL} te chamou para acabar com a treta numa live juntos.`,
    a: ['Fazer as pazes', () => { S.followers *= 1.12; return 'Collab histórica! Os dois públicos se juntaram: +12% de seguidores.'; }],
    b: ['Continuar a treta', () => { S.followers *= 1.04; return 'A treta continua rendendo views: +4%.'; }] },
];
CHOICES.push(...RIVAL_STORY);

Hooks.on('daily', () => {
  S.rivalSeen = S.rivalSeen || [];
  const next = RIVAL_STORY.find(c => S.followers >= c.at && !S.rivalSeen.includes(c.id));
  if (next && !S.pendingChoice) { S.rivalSeen.push(next.id); S.pendingChoice = next.id; }
});

/* ---------- 29. Dificuldade ---------- */

const DIFFICULTY = {
  easy: { name: 'Fácil', icon: '🙂', price: 0.8, psu: 0.5, critic: 0.85 },
  normal: { name: 'Normal', icon: '😐', price: 1, psu: 1, critic: 1 },
  hard: { name: 'Difícil', icon: '😈', price: 1.25, psu: 2, critic: 1.2 },
};
const diff = () => DIFFICULTY[settings().difficulty || 'normal'];
Hooks.on('price', v => Math.round(v * diff().price));
Hooks.on('psuChance', v => v * diff().psu);
Hooks.on('criticExpectation', v => v * diff().critic);

/* ---------- 30. Tema claro ---------- */

function applyTheme() {
  const t = settings().theme || 'dark';
  const light = t === 'light' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.classList.toggle('light', light);
}

/* ---------- Interface ---------- */

function renderBatch5() {
  applyTheme();
  const st = settings();
  const extra = $('#settings-extra');
  if (extra) {
    extra.innerHTML = `<h3>🎨 Tema</h3>
      <div class="chips">${[['dark', '🌙 Escuro'], ['light', '☀️ Claro'], ['auto', '🖥️ Automático']].map(([id, l]) =>
        `<button class="chip-btn ${(st.theme || 'dark') === id ? 'active' : ''}" data-action="set-theme" data-v="${id}">${l}</button>`).join('')}</div>
      <h3>🎚️ Dificuldade</h3>
      <div class="chips">${Object.entries(DIFFICULTY).map(([id, d]) =>
        `<button class="chip-btn ${(st.difficulty || 'normal') === id ? 'active' : ''}" data-action="set-diff" data-v="${id}">${d.icon} ${d.name}</button>`).join('')}</div>
      <p class="muted">Difícil: peças 25% mais caras, fonte genérica explode 2x mais e a crítica é mais exigente.</p>`;
  }
  const poll = $('#poll-note');
  if (poll) { poll.hidden = !S.poll; poll.textContent = S.poll ? `🗳️ O chat quer ${S.poll.name} na próxima live (bônus de público)` : ''; }
}

Hooks.on('render', renderBatch5);
Hooks.on('action', d => {
  if (d.action === 'dare') answerDare(d.ok === '1');
  if (d.action === 'set-theme') { settings().theme = d.v; saveGame(); renderBatch5(); }
  if (d.action === 'set-diff') { settings().difficulty = d.v; changed(); }
});
renderBatch5();
