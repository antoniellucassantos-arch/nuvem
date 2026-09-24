'use strict';

// Lote 1: tela inicial, chefões da live e mercado de ações gamer.

/* ---------- Tela inicial ---------- */

function showTitle() {
  const el = $('#title-screen');
  const eras = { modern: '🚀 Hoje', retro: '📼 Anos 2000', future: '🤖 2077' };
  el.innerHTML = `<div class="title-box">
    <div class="title-logo">🖥️ Info<span>real</span></div>
    <p class="muted">Monte o PC, faça lives, crie jogos, sua linguagem e sua própria IA.</p>
    <p class="muted">Era atual: <b>${eras[GAME_MODE]}</b> · Dia ${S.day} · ${num(S.followers)} seguidores</p>
    <div class="title-buttons">
      <button class="btn big" data-action="title-continue">▶️ ${S.stats.lives || S.pcOn ? 'Continuar' : 'Começar'}</button>
      <button class="btn ghost" data-action="title-new">✨ Novo jogo</button>
      <div class="chips">${Object.entries(eras).filter(([m]) => m !== GAME_MODE)
        .map(([m, l]) => `<button class="chip-btn" data-action="set-mode" data-mode="${m}">Ir para ${l}</button>`).join('')}</div>
      <button class="btn ghost small" data-action="title-credits">📜 Créditos</button>
    </div>
    <div id="credits" hidden class="muted">Inforeal: ideia de Antoniel, programado com a ajuda do Claude.<br>
      Nenhuma capivara foi ferida durante o desenvolvimento. 🦫</div>
  </div>`;
  el.hidden = false;
}

/* ---------- Chefões da live ---------- */

const BOSSES = ['xX_ProPlayer_Xx', 'Campeão Mundial Fake', 'TryHard do Bairro', 'Robô Aimbot 3000'];

LIVE_EVENTS.push({
  chance: 0.015,
  when: L => !L.boss && !!sim,
  run(L) {
    L.boss = { name: pick(BOSSES), target: sim.score + 40 };
    liveBanner(`⚔️ DESAFIO! ${L.boss.name} te desafiou ao vivo: faça mais 40 pontos jogando você mesmo!`);
  },
});

Hooks.on('liveEnd', () => {
  const L = live;
  if (!L || !L.boss || !sim) return;
  if (sim.manual && sim.score >= L.boss.target) {
    const f = Math.round((100 + S.followers * 0.05) / (1 + S.followers / 5e5));
    S.followers += f;
    toast(`⚔️ Você venceu o desafio de ${L.boss.name}! +${num(f)} seguidores`, 'goal');
  } else {
    toast(`😅 ${L.boss.name} ganhou o desafio. O chat não perdoa.`, 'bad');
  }
});

/* ---------- Mercado de ações gamer ---------- */

const STOCKS = [
  { id: 'nvf', name: 'NVIDIA Fake', icon: '🟩', vol: 0.06 },
  { id: 'amf', name: 'AMD Fake', icon: '🟥', vol: 0.05 },
  { id: 'cap', name: 'Capivara Games', icon: '🦫', vol: 0.09 },
  { id: 'lan', name: 'Lan House S.A.', icon: '🖥️', vol: 0.03 },
];

function stocks() {
  S.stocks = S.stocks || { prices: { nvf: 100, amf: 80, cap: 20, lan: 50 }, owned: {}, history: {} };
  return S.stocks;
}

Hooks.on('daily', () => {
  const st = stocks();
  const news = RELEASES.find(r => r.day === S.day);
  for (const s of STOCKS) {
    let change = rand(-s.vol, s.vol * 1.1);
    if (news && news.part && ((news.part.brand === 'nvidia' && s.id === 'nvf') || (news.part.brand === 'amd' && s.id === 'amf'))) change += 0.12;
    if (S.crisis && (s.id === 'nvf' || s.id === 'amf')) change += 0.05;
    if (s.id === 'cap' && S.trend) change += 0.01;
    st.prices[s.id] = Math.max(1, +(st.prices[s.id] * (1 + change)).toFixed(2));
    (st.history[s.id] = st.history[s.id] || []).push(st.prices[s.id]);
    if (st.history[s.id].length > 14) st.history[s.id].shift();
  }
});

function trade(id, qty) {
  const st = stocks();
  const price = st.prices[id];
  if (qty > 0 && S.money < price * qty) return toast('Dinheiro insuficiente.', 'bad');
  if (qty < 0 && (st.owned[id] || 0) < -qty) return;
  S.money -= price * qty;
  st.owned[id] = (st.owned[id] || 0) + qty;
  changed();
}

function sparkline(values) {
  if (!values || values.length < 2) return '';
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => `${i * (60 / (values.length - 1))},${18 - ((v - min) / (max - min || 1)) * 16}`).join(' ');
  const up = values[values.length - 1] >= values[0];
  return `<svg class="spark" viewBox="0 0 60 20" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${up ? 'var(--good)' : 'var(--bad)'}" stroke-width="2"/></svg>`;
}

function renderStocks() {
  const st = stocks();
  const total = STOCKS.reduce((t, s) => t + (st.owned[s.id] || 0) * st.prices[s.id], 0);
  $('#stocks-card').innerHTML = `<h2>📈 Bolsa gamer</h2>
    <p class="muted">Os preços mudam todo dia. Lançamentos da marca fazem a ação subir; crise dos chips mexe com as fabricantes. Sua carteira: <b>${money(total)}</b></p>
    ${STOCKS.map(s => {
      const own = st.owned[s.id] || 0;
      const lot = Math.max(1, Math.floor(S.money * 0.1 / st.prices[s.id]));
      return `<div class="item"><div class="slot-icon">${s.icon}</div>
        <div class="slot-info"><div class="slot-name">${s.name} ${sparkline(st.history[s.id])}</div>
          <div class="muted">${money(st.prices[s.id])} por ação · você tem ${num(own)}</div></div>
        <div class="chips">
          <button class="btn small" data-action="stock" data-id="${s.id}" data-q="${lot}" ${S.money < st.prices[s.id] ? 'disabled' : ''}>Comprar ${num(lot)}</button>
          <button class="btn small ghost" data-action="stock" data-id="${s.id}" data-q="${-own}" ${own ? '' : 'disabled'}>Vender tudo</button>
        </div></div>`;
    }).join('')}`;
}

Hooks.on('render', renderStocks);
Hooks.on('action', d => {
  if (d.action === 'stock') trade(d.id, Number(d.q));
  if (d.action === 'title-continue') $('#title-screen').hidden = true;
  if (d.action === 'title-credits') $('#credits').hidden = !$('#credits').hidden;
  if (d.action === 'title-new' && confirm('Começar um jogo novo nesta era? O progresso atual será apagado.')) {
    S = newState();
    $('#title-screen').hidden = true;
    changed();
  }
});

renderStocks();
// A tela inicial aparece ao abrir o jogo (não em testes automáticos).
if (!navigator.webdriver) showTitle();
