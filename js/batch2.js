'use strict';

// Lote 2: sua loja de peças, eventos com escolhas, capivara que evolui,
// peça do futuro enviada ao passado e modo desafio.

/* ---------- 6. Sua loja de peças ---------- */

const STORE_COST = 30000;
const STORE_CATS = { gpu: 'Placas de vídeo', cpu: 'Processadores', ram: 'Memórias' };

function store() {
  S.store = S.store || { open: false, margin: 20, stock: { gpu: 0, cpu: 0, ram: 0 }, sold: 0 };
  return S.store;
}
// Preço médio de uma peça da categoria hoje (base para compra e venda).
const avgPrice = cat => {
  const list = PARTS.filter(p => p.cat === cat && isReleased(p));
  return list.reduce((t, p) => t + priceOf(p), 0) / list.length;
};

function storeDaily() {
  const st = store();
  if (!st.open) return;
  let revenue = 0, units = 0;
  for (const cat in st.stock) {
    const demand = Math.round((2 + Math.pow(S.followers, 0.35)) * (1.5 - st.margin / 60) * rand(0.6, 1.3));
    const sold = Math.min(st.stock[cat], Math.max(0, demand));
    st.stock[cat] -= sold;
    units += sold;
    revenue += sold * avgPrice(cat) * (1 + st.margin / 100);
  }
  if (units) {
    S.money += revenue;
    st.sold += units;
    toast(`🏪 Sua loja vendeu ${num(units)} peças: +${money(revenue)}`);
  }
}

/* ---------- 7. Eventos com escolhas ---------- */

const CHOICES = [
  { id: 'energy', text: '🥤 Uma marca de energético quer te patrocinar por R$ {v}. Mas o chat odeia propaganda...',
    a: ['Aceitar o dinheiro', () => { S.money += val(); S.followers *= 0.97; return 'Dinheiro na conta. Alguns seguidores reclamaram.'; }],
    b: ['Recusar', () => { S.followers *= 1.02; return 'O chat respeitou sua decisão: +2% de seguidores.'; }] },
  { id: 'drama', text: '😬 Um vídeo antigo seu viralizou e virou polêmica!',
    a: ['Gravar pedido de desculpas (−30 de energia)', () => { S.energy = Math.max(0, S.energy - 30); return 'Pedido aceito. Tudo resolvido.'; }],
    b: ['Ignorar', () => { S.followers *= 0.9; return 'A polêmica cresceu: −10% de seguidores.'; }] },
  { id: 'reality', text: '📺 Te chamaram para um reality show de influenciadores!',
    a: ['Participar', () => { S.followers *= 1.15; S.energy = 0; return 'Você bombou na TV (+15% de seguidores), mas ficou exausto.'; }],
    b: ['Ficar em casa jogando', () => 'Você continuou a vida normal.'] },
  { id: 'fan', text: '🧒 Um fã mirim pede seu PC antigo de presente.',
    a: ['Dar uma peça guardada', () => {
      const loose = S.inventory.find(i => !installedSlotOf(i.uid));
      if (!loose) return 'Você não tinha peças guardadas, mas deu um autógrafo. 😊';
      S.inventory = S.inventory.filter(i => i !== loose);
      S.followers *= 1.05;
      return `Você deu ${PART_BY_ID[loose.id].name}. O vídeo viralizou: +5% de seguidores!`;
    }],
    b: ['Dar só um autógrafo', () => 'O fã ficou feliz mesmo assim.'] },
  { id: 'bet', text: '🎰 Um site de apostas quer te pagar R$ {v} para divulgar.',
    a: ['Aceitar', () => { S.money += val(); S.followers *= 0.85; return 'Deu ruim: a comunidade não gostou (−15% de seguidores).'; }],
    b: ['Recusar', () => { S.followers *= 1.03; return 'Atitude certa! +3% de seguidores.'; }] },
];
const val = () => Math.round(1000 + Math.pow(S.followers, 0.6) * 20);

function showChoice() {
  const c = CHOICES.find(x => x.id === S.pendingChoice);
  const el = $('#choice-modal');
  el.hidden = !c;
  if (!c) return;
  el.innerHTML = `<div class="choice-box"><h2>🤔 Decisão</h2><p>${c.text.replace('{v}', num(val()))}</p>
    <div class="choice-buttons">
      <button class="btn" data-action="choice" data-opt="a">${c.a[0]}</button>
      <button class="btn ghost" data-action="choice" data-opt="b">${c.b[0]}</button>
    </div></div>`;
}

/* ---------- 8. Capivara que evolui ---------- */

const PET_STAGES = [
  { feeds: 0, name: 'Capivara bebê', extra: '', bonus: 1 },
  { feeds: 5, name: 'Capivara gamer', extra: '🎮', bonus: 1.02 },
  { feeds: 15, name: 'Capivara streamer', extra: '🎙️', bonus: 1.04 },
  { feeds: 30, name: 'Capivara CEO', extra: '💼', bonus: 1.07 },
];
const petStage = () => PET_STAGES.filter(s => ((S.counts && S.counts.pet) || 0) >= s.feeds).pop();

/* ---------- 9. Peça do futuro enviada ao passado ---------- */

const CAPSULE_KEY = 'inforeal-capsula-do-tempo';
const FUTURE_GPU = { id: 'tx1', cat: 'gpu', name: 'QuantumForce Q9090 (veio de 2077!)', short: 'Q9090', brand: 'nvidia', price: 99999, unlock: 999999999, score: 400, watts: 60, fans: 3, len: 250 };

function sendToPast() {
  if (!FUTURE || busy() || !S.build.gpu) return;
  const part = itemPart(S.build.gpu);
  try { localStorage.setItem(CAPSULE_KEY, part.name); } catch { return; }
  S.inventory = S.inventory.filter(i => i.uid !== S.build.gpu);
  S.build.gpu = null;
  S.pcOn = false;
  toast(`⏳ ${part.name} entrou na cápsula do tempo! Ela vai aparecer nos anos 2000.`, 'goal');
  changed();
}

function receiveFromFuture() {
  if (!RETRO) return;
  let sent = null;
  try { sent = localStorage.getItem(CAPSULE_KEY); } catch { return; }
  if (!sent) return;
  if (!PART_BY_ID.tx1) { PARTS.push(FUTURE_GPU); PART_BY_ID.tx1 = FUTURE_GPU; }
  S.inventory.push({ uid: S.nextUid++, id: 'tx1' });
  try { localStorage.removeItem(CAPSULE_KEY); } catch { /* ok */ }
  toast('📦 Uma caixa brilhante caiu do céu... é uma placa de vídeo de 2077! Vai quebrar o jogo. 😂', 'goal');
  saveGame();
}

/* ---------- 10. Modo desafio ---------- */

const CHALLENGES = {
  generic: { name: 'Só fonte genérica', icon: '💥', desc: 'Fontes de qualidade são proibidas.' },
  tired: { name: 'Sem dormir direito', icon: '🥱', desc: 'Você acorda com só 60 de energia.' },
  poor: { name: 'Começar liso', icon: '🪙', desc: 'Começa com só R$ 600.' },
};

function startChallenge(id) {
  if (busy() || !confirm(`Começar o desafio "${CHALLENGES[id].name}"? O progresso atual desta era será apagado.`)) return;
  S = newState();
  S.challenge = id;
  if (id === 'poor') S.money = 600;
  $('#title-screen').hidden = true;
  toast(`${CHALLENGES[id].icon} Desafio começou: ${CHALLENGES[id].desc}`, 'goal');
  changed();
}

Hooks.on('price', (v, p) => (S.challenge === 'generic' && p.cat === 'psu' && !p.generic ? 1e9 : v));
Hooks.on('maxEnergy', v => (S.challenge === 'tired' ? Math.min(v, 60) : v));

/* ---------- Interface e ganchos ---------- */

function renderBatch2() {
  const st = store();
  $('#store-card').innerHTML = !st.open
    ? `<h2>🏪 Sua loja de peças</h2><p class="muted">Abra uma loja e revenda peças para outros streamers. Você compra lotes e escolhe o lucro.</p>
      <button class="btn" data-action="store-open" ${busy() || S.money < STORE_COST ? 'disabled' : ''}>Abrir loja (${money(STORE_COST)})</button>`
    : `<h2>🏪 Sua loja de peças</h2>
      <p class="muted">Lucro: <b>${st.margin}%</b> (mais lucro = menos vendas) · ${num(st.sold)} peças vendidas no total</p>
      <div class="chips">${[10, 20, 35, 50].map(m => `<button class="chip-btn ${st.margin === m ? 'active' : ''}" data-action="store-margin" data-v="${m}">${m}%</button>`).join('')}</div>
      ${Object.entries(STORE_CATS).map(([cat, name]) => {
        const cost = Math.round(avgPrice(cat) * 0.7 * 10);
        return `<div class="item"><div class="slot-icon">${CAT_ICONS[cat]}</div>
          <div class="slot-info"><div class="slot-name">${name}</div><div class="muted">Estoque: ${num(st.stock[cat])} peças</div></div>
          <button class="btn small" data-action="store-buy" data-cat="${cat}" ${busy() || S.money < cost ? 'disabled' : ''}>Comprar lote de 10 (${money(cost)})</button></div>`;
      }).join('')}`;

  $('#challenge-card').innerHTML = `<h2>🎯 Modo desafio</h2>
    ${S.challenge ? `<p>Desafio atual: <b>${CHALLENGES[S.challenge].icon} ${CHALLENGES[S.challenge].name}</b>. ${CHALLENGES[S.challenge].desc}</p>` : ''}
    <p class="muted">Começa um jogo novo com uma regra maluca.</p>
    <div class="chips">${Object.entries(CHALLENGES).map(([id, c]) => `<button class="chip-btn" data-action="challenge" data-id="${id}" title="${c.desc}">${c.icon} ${c.name}</button>`).join('')}</div>`;

  const stage = petStage();
  $('#pet').title = `${stage.name} (alimente para evoluir) · R$ 10`;
  $('#pet span').textContent = '🦫' + stage.extra;

  $('#capsule-card').hidden = !FUTURE;
  if (FUTURE) {
    $('#capsule-card').innerHTML = `<h2>⏳ Cápsula do tempo</h2>
      <p class="muted">Mande a placa de vídeo instalada para os anos 2000. Lá ela vai deixar o seu PC absurdamente forte. 😈</p>
      <button class="btn" data-action="capsule" ${busy() || !S.build.gpu ? 'disabled' : ''}>Enviar placa de vídeo para 2004</button>`;
  }
  showChoice();
}

Hooks.on('render', renderBatch2);
Hooks.on('gearMult', v => v * petStage().bonus);
Hooks.on('daily', () => {
  storeDaily();
  if (!S.pendingChoice && S.stats.lives > 3 && Math.random() < 0.2) S.pendingChoice = pick(CHOICES.filter(c => !c.at)).id;
});
Hooks.on('petFed', () => {
  const before = PET_STAGES.filter(s => (S.counts.pet - 1) >= s.feeds).pop();
  const after = petStage();
  if (after !== before) toast(`🦫 Sua capivara evoluiu para ${after.name} ${after.extra}!`, 'goal');
});

Hooks.on('action', d => {
  const st = store();
  switch (d.action) {
    case 'store-open':
      if (S.money < STORE_COST) return;
      S.money -= STORE_COST; st.open = true;
      toast('🏪 Sua loja abriu! Compre lotes para ter o que vender.', 'goal');
      return changed();
    case 'store-margin': st.margin = Number(d.v); return changed();
    case 'store-buy': {
      const cost = Math.round(avgPrice(d.cat) * 0.7 * 10);
      if (S.money < cost) return;
      S.money -= cost; st.stock[d.cat] += 10;
      return changed();
    }
    case 'choice': {
      const c = CHOICES.find(x => x.id === S.pendingChoice);
      if (!c) return;
      const msg = c[d.opt][1]();
      S.pendingChoice = null;
      toast(msg, 'goal');
      return changed();
    }
    case 'capsule': return sendToPast();
    case 'challenge': return startChallenge(d.id);
  }
});

receiveFromFuture();
renderBatch2();
