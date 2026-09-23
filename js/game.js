'use strict';

const SAVE_KEY = 'inforeal-save-v1';
const START_MONEY = 1500;
const TICK_MS = 700;          // duração real de cada "pedaço" da live
const TICKS_PER_HOUR = 6;     // cada tick = 10 minutos no jogo
const ENERGY_PER_HOUR = 20;
const KWH_PRICE = 1;          // R$ por kWh na conta de luz

const PART_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p]));
const GAME_BY_ID = Object.fromEntries(GAMES.map(g => [g.id, g]));

const $ = sel => document.querySelector(sel);
const money = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = v => Math.floor(v).toLocaleString('pt-BR');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

let S = loadGame();
let live = null;          // estado da live em andamento (não é salvo)
let booting = false;
let shopFilter = 'cpu';
let selectedGame = 'fogo';
let selectedHours = 1;

/* ---------- Salvamento ---------- */

function newState() {
  return {
    money: START_MONEY,
    followers: 0,
    day: 1,
    energy: 100,
    nextUid: 1,
    inventory: [],                     // peças compradas: { uid, id }
    build: { cpu: null, mobo: null, ram: null, gpu: null, storage: null, psu: null },
    gear: [],
    games: ['paciencia', 'fogo', 'moba', 'cs'],
    gamePlays: {},
    goals: [],
    pcOn: false,
    lastLive: null,
    stats: { lives: 0, earned: 0, bestViewers: 0, cyber60: false },
  };
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return newState();
    const data = JSON.parse(raw);
    const base = newState();
    return { ...base, ...data, build: { ...base.build, ...data.build }, stats: { ...base.stats, ...data.stats } };
  } catch {
    return newState();
  }
}

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { /* sem armazenamento */ }
}

function changed() {
  checkGoals();
  saveGame();
  render();
}

/* ---------- Peças e montagem ---------- */

function itemPart(uid) {
  const it = S.inventory.find(i => i.uid === uid);
  return it ? PART_BY_ID[it.id] : null;
}

function installedSlotOf(uid) {
  return SLOTS.find(s => S.build[s] === uid) || null;
}

function checkBuild() {
  const p = {};
  for (const slot of SLOTS) p[slot] = S.build[slot] ? itemPart(S.build[slot]) : null;

  const errors = [];
  for (const slot of SLOTS) if (!p[slot]) errors.push(`Falta: ${CATS[slot]}`);
  if (p.cpu && p.mobo && p.cpu.socket !== p.mobo.socket) {
    errors.push(`O processador (soquete ${p.cpu.socket}) não encaixa na placa-mãe (soquete ${p.mobo.socket})`);
  }
  if (p.ram && p.mobo && p.ram.type !== p.mobo.ram) {
    errors.push(`Memória ${p.ram.type} não é compatível com a placa-mãe (${p.mobo.ram})`);
  }
  const watts = 40 + (p.cpu ? p.cpu.watts : 0) + (p.gpu ? p.gpu.watts : 0);
  if (p.psu && watts > p.psu.watts) {
    errors.push(`A fonte de ${p.psu.watts}W não aguenta o consumo de ${watts}W`);
  }

  return {
    ok: errors.length === 0,
    errors,
    parts: p,
    watts,
    cpu: p.cpu ? p.cpu.score : 0,
    gpu: p.gpu ? p.gpu.score : 0,
    ram: p.ram ? p.ram.gb : 0,
    storage: p.storage ? p.storage.speed : 0,
  };
}

function buyPart(id) {
  const p = PART_BY_ID[id];
  if (!p || live || S.money < p.price || S.followers < p.unlock) return;
  if (p.cat === 'gear') {
    if (S.gear.includes(id)) return;
    S.gear.push(id);
  } else {
    S.inventory.push({ uid: S.nextUid++, id });
  }
  S.money -= p.price;
  toast(p.cat === 'gear' ? `🛒 ${p.name} comprado!` : `🛒 ${p.name} comprado! Instale na aba Montagem.`);
  changed();
}

function installPart(uid) {
  const p = itemPart(uid);
  if (!p || live) return;
  S.build[p.cat] = uid;
  S.pcOn = false;
  changed();
}

function removePart(slot) {
  if (live || !S.build[slot]) return;
  S.build[slot] = null;
  S.pcOn = false;
  changed();
}

function sellPart(uid) {
  const p = itemPart(uid);
  if (!p || live) return;
  const slot = installedSlotOf(uid);
  if (slot) { S.build[slot] = null; S.pcOn = false; }
  S.inventory = S.inventory.filter(i => i.uid !== uid);
  const value = Math.round(p.price * 0.5);
  S.money += value;
  toast(`💸 Vendeu ${p.name} por ${money(value)}`);
  changed();
}

function powerOn() {
  if (booting || live) return;
  booting = true;
  const b = checkBuild();
  const lines = ['> Apertando o botão de ligar...'];
  if (!b.parts.psu) {
    lines.push('...nada acontece. Sem fonte não tem energia!');
  } else {
    lines.push('Ventoinhas girando... 🌀');
    if (b.ok) {
      lines.push(
        `CPU: ${b.parts.cpu.name} ........ OK`,
        `Memória: ${b.ram}GB ${b.parts.ram.type} ........ OK`,
        `Vídeo: ${b.parts.gpu.name} ........ OK`,
        `Disco: ${b.parts.storage.name} ........ OK`,
        `Consumo: ${b.watts}W de ${b.parts.psu.watts}W`,
        '✅ Sistema iniciado! Bem-vindo ao InfoOS.',
      );
    } else {
      b.errors.forEach(e => lines.push('❌ ' + e));
      lines.push('💥 O PC não ligou. Arrume as peças e tente de novo.');
    }
  }

  const out = $('#post');
  out.textContent = '';
  out.hidden = false;
  render();
  lines.forEach((line, i) => setTimeout(() => {
    out.textContent += line + '\n';
    if (i === lines.length - 1) {
      booting = false;
      S.pcOn = b.ok;
      if (b.ok) toast('🟢 PC ligado! Agora vá para a aba Live.');
      changed();
    }
  }, 300 * (i + 1)));
}

/* ---------- Desempenho ---------- */

function estimateFps(game, b) {
  let r = Math.min(b.cpu / game.cpu, b.gpu / game.gpu);
  if (b.ram < game.ram) r *= 0.5;
  return Math.max(1, Math.min(240, Math.round(60 * r)));
}

function quality(fps) {
  if (fps < 15) return { mult: 0.2, label: 'Injogável', cls: 'q-bad' };
  if (fps < 30) return { mult: 0.55, label: 'Travando', cls: 'q-low' };
  if (fps < 60) return { mult: 1, label: 'Jogável', cls: 'q-ok' };
  if (fps < 120) return { mult: 1.3, label: 'Liso', cls: 'q-good' };
  return { mult: 1.6, label: 'Ultra liso', cls: 'q-great' };
}

function novelty(gameId) {
  return Math.max(0.5, 1 - (S.gamePlays[gameId] || 0) * 0.1);
}

function gearMult() {
  return S.gear.reduce((m, id) => m * PART_BY_ID[id].mult, 1);
}

/* ---------- Live ---------- */

function buyGame(id) {
  const g = GAME_BY_ID[id];
  if (!g || live || S.games.includes(id) || S.money < g.price) return;
  S.money -= g.price;
  S.games.push(id);
  selectedGame = id;
  toast(`🎮 Você comprou ${g.name}!`);
  changed();
}

function startLive() {
  if (live) return;
  const b = checkBuild();
  if (!S.pcOn || !b.ok) return toast('Ligue o PC na aba Montagem antes de fazer live!', 'bad');
  if (!S.games.includes(selectedGame)) return toast('Você não tem esse jogo.', 'bad');
  const cost = selectedHours * ENERGY_PER_HOUR;
  if (S.energy < cost) return toast('Você está cansado demais para essa live. Vá dormir! 😴', 'bad');

  const game = GAME_BY_ID[selectedGame];
  const fps = estimateFps(game, b);
  S.energy -= cost;
  live = {
    game, fps,
    q: quality(fps),
    tick: 0,
    total: selectedHours * TICKS_PER_HOUR,
    viewers: 0, peak: 0, earned: 0, followers: 0,
    watts: b.watts,
    psu: b.parts.psu,
    psuUid: S.build.psu,
    mult: game.pop * gearMult() * novelty(game.id) * [0, 0.9, 1, 1.1][b.storage],
  };

  $('#chat').innerHTML = '';
  $('#live-game').textContent = `${game.emoji} ${game.name}`;
  $('#live-fps').textContent = `${fps} FPS · ${live.q.label}`;
  $('#live-fps').className = 'live-fps ' + live.q.cls;
  addChat('Sistema', `A live de ${game.name} começou!`, 'sys');
  render();
  updateLiveView();
  live.timer = setInterval(liveTick, TICK_MS);
}

function liveTick() {
  const L = live;
  L.tick++;

  const ramp = Math.min(1, L.tick / 4);
  const base = 5 + S.followers * 0.1 + Math.sqrt(S.followers) * 3;
  L.viewers = Math.max(0, Math.round(base * L.mult * L.q.mult * ramp * rand(0.8, 1.2)));
  L.peak = Math.max(L.peak, L.viewers);

  const income = L.viewers * 0.8;
  L.earned += income;
  S.money += income;

  const newFollowers = L.viewers * 0.15 * L.q.mult * rand(0.5, 1.5);
  L.followers += newFollowers;
  S.followers += newFollowers;

  if (L.viewers > 0 && Math.random() < Math.min(0.6, 0.05 + L.viewers / 300)) {
    const amount = Math.round(Math.min(500, rand(2, 5 + L.viewers * 0.3)));
    L.earned += amount;
    S.money += amount;
    addChat(pick(NAMES), `doou ${money(amount)}: "${pick(DONATION_MSGS)}"`, 'donation');
  }

  const pool = L.q.mult < 0.6 ? CHAT.bad : L.q.mult > 1.2 ? CHAT.ok.concat(CHAT.good) : CHAT.ok;
  const lines = Math.min(3, 1 + Math.floor(L.viewers / 40));
  for (let i = 0; i < lines; i++) {
    if (L.viewers > 0 && Math.random() < 0.7) addChat(pick(NAMES), pick(pool));
  }

  // Fonte genérica sobrecarregada pode explodir no meio da live.
  if (L.psu.generic && L.watts / L.psu.watts > 0.75 && Math.random() < 0.03) {
    addChat('Sistema', '💥 BOOM! A fonte genérica explodiu!', 'sys');
    endLive('psu');
    return;
  }

  if (L.tick >= L.total) endLive('done');
  else updateLiveView();
}

function endLive(reason) {
  const L = live;
  clearInterval(L.timer);
  live = null;

  const hours = L.tick / TICKS_PER_HOUR;
  const bill = Math.round(L.watts * hours / 1000 * KWH_PRICE * 100) / 100;
  S.money -= bill;

  S.stats.lives++;
  S.stats.earned += L.earned;
  S.stats.bestViewers = Math.max(S.stats.bestViewers, L.peak);
  S.gamePlays[L.game.id] = (S.gamePlays[L.game.id] || 0) + 1;
  if (L.game.id === 'cyber' && L.fps >= 60) S.stats.cyber60 = true;

  if (reason === 'psu') {
    S.inventory = S.inventory.filter(i => i.uid !== L.psuUid);
    S.build.psu = null;
    S.pcOn = false;
    toast('💥 Sua fonte explodiu! Compre uma fonte de qualidade.', 'bad');
  }

  S.lastLive = {
    game: `${L.game.emoji} ${L.game.name}`,
    reason,
    minutes: L.tick * 10,
    peak: L.peak,
    earned: L.earned,
    followers: L.followers,
    bill,
  };
  changed();
}

function addChat(name, text, cls = '') {
  const chat = $('#chat');
  const line = document.createElement('div');
  line.className = 'chat-line ' + cls;
  const who = document.createElement('b');
  who.textContent = name + ': ';
  line.append(who, text);
  chat.append(line);
  while (chat.children.length > 60) chat.firstChild.remove();
  chat.scrollTop = chat.scrollHeight;
}

function updateLiveView() {
  const L = live;
  const mins = L.tick * 10;
  $('#live-viewers').textContent = num(L.viewers);
  $('#live-earned').textContent = money(L.earned);
  $('#live-followers').textContent = '+' + num(L.followers);
  $('#live-time').textContent = `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
  $('#live-progress').style.width = (L.tick / L.total * 100) + '%';
  renderHeader();
}

function sleep() {
  if (live) return;
  S.day++;
  S.energy = 100;
  for (const id in S.gamePlays) S.gamePlays[id] = Math.floor(S.gamePlays[id] / 2);
  toast(`😴 Você dormiu. Bom dia, dia ${S.day}!`);
  changed();
}

/* ---------- Objetivos ---------- */

function checkGoals() {
  for (const g of GOALS) {
    if (!S.goals.includes(g.id) && g.check(S)) {
      S.goals.push(g.id);
      S.money += g.reward;
      toast(`🏆 Objetivo concluído: ${g.text} (+${money(g.reward)})`, 'goal');
    }
  }
}

/* ---------- Interface ---------- */

function toast(text, cls = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + cls;
  el.textContent = text;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 3500);
}

function partSpec(p) {
  switch (p.cat) {
    case 'cpu': return `Soquete ${p.socket} · Força ${p.score} · ${p.watts}W`;
    case 'mobo': return `Soquete ${p.socket} · Memória ${p.ram}`;
    case 'ram': return `${p.gb}GB ${p.type}`;
    case 'gpu': return `Força ${p.score} · ${p.watts}W`;
    case 'storage': return `Velocidade ${'★'.repeat(p.speed)}${'☆'.repeat(3 - p.speed)}`;
    case 'psu': return `${p.watts}W${p.generic ? ' · ⚠️ genérica, pode explodir' : ''}`;
    case 'gear': return `+${Math.round((p.mult - 1) * 100)}% espectadores`;
  }
  return '';
}

function render() {
  renderHeader();
  renderBuild();
  renderShop();
  renderLive();
  renderGoals();
}

function renderHeader() {
  $('#stat-money').textContent = money(S.money);
  $('#stat-followers').textContent = num(S.followers);
  $('#stat-day').textContent = S.day;
  $('#stat-energy').textContent = S.energy;
  $('#energy-fill').style.width = S.energy + '%';
  $('#btn-sleep').disabled = !!live;
}

function renderBuild() {
  const b = checkBuild();
  const lock = live || booting ? 'disabled' : '';

  $('#welcome').hidden = S.stats.lives > 0 || S.pcOn;

  $('#slots').innerHTML = SLOTS.map(slot => {
    const p = b.parts[slot];
    return `<div class="slot ${p ? '' : 'empty'}">
      <div class="slot-icon">${CAT_ICONS[slot]}</div>
      <div class="slot-info">
        <div class="slot-cat">${CATS[slot]}</div>
        <div class="slot-name">${p ? p.name : 'Vazio'}</div>
        ${p ? `<div class="muted">${partSpec(p)}</div>` : ''}
      </div>
      ${p ? `<button class="btn small ghost" data-action="remove" data-slot="${slot}" ${lock}>Tirar</button>` : ''}
    </div>`;
  }).join('');

  const psuW = b.parts.psu ? b.parts.psu.watts : 0;
  $('#specs').innerHTML = `
    <div><span class="muted">Força CPU</span><b>${b.cpu}</b></div>
    <div><span class="muted">Força vídeo</span><b>${b.gpu}</b></div>
    <div><span class="muted">RAM</span><b>${b.ram}GB</b></div>
    <div><span class="muted">Consumo</span><b class="${psuW && b.watts > psuW ? 'txt-bad' : ''}">${b.watts}W / ${psuW}W</b></div>`;

  $('#pc-status').innerHTML = S.pcOn
    ? '<span class="dot on"></span> Ligado'
    : '<span class="dot"></span> Desligado';
  $('#btn-power').disabled = !!(live || booting);

  const loose = S.inventory.filter(i => !installedSlotOf(i.uid));
  $('#inventory').innerHTML = loose.length
    ? loose.map(i => {
      const p = PART_BY_ID[i.id];
      return `<div class="item">
        <div class="slot-icon">${CAT_ICONS[p.cat]}</div>
        <div class="slot-info">
          <div class="slot-name">${p.name}</div>
          <div class="muted">${partSpec(p)}</div>
        </div>
        <div class="item-actions">
          <button class="btn small" data-action="install" data-uid="${i.uid}" ${lock}>Instalar</button>
          <button class="btn small ghost" data-action="sell" data-uid="${i.uid}" ${lock}>Vender ${money(Math.round(p.price * 0.5))}</button>
        </div>
      </div>`;
    }).join('')
    : '<p class="muted">Nenhuma peça guardada. Compre peças na Loja!</p>';

  $('#gear-list').innerHTML = S.gear.length
    ? S.gear.map(id => `<span class="chip">${PART_BY_ID[id].name}</span>`).join('')
    : '<span class="muted">Nenhum ainda.</span>';
}

function renderShop() {
  $('#shop-filters').innerHTML = Object.keys(CATS).map(cat =>
    `<button class="chip-btn ${cat === shopFilter ? 'active' : ''}" data-action="filter" data-cat="${cat}">${CAT_ICONS[cat]} ${CATS[cat]}</button>`,
  ).join('');

  $('#shop-list').innerHTML = PARTS.filter(p => p.cat === shopFilter).map(p => {
    const locked = S.followers < p.unlock;
    const owned = p.cat === 'gear' && S.gear.includes(p.id);
    const count = S.inventory.filter(i => i.id === p.id).length;
    let btn;
    if (locked) btn = `<button class="btn small" disabled>🔒 ${num(p.unlock)} seguidores</button>`;
    else if (owned) btn = '<button class="btn small" disabled>✔ Comprado</button>';
    else btn = `<button class="btn small" data-action="buy" data-id="${p.id}" ${live || S.money < p.price ? 'disabled' : ''}>Comprar</button>`;
    return `<div class="card shop-item ${locked ? 'locked' : ''}">
      <div class="shop-icon">${CAT_ICONS[p.cat]}</div>
      <div class="slot-name">${p.name}</div>
      <div class="muted">${partSpec(p)}</div>
      ${count ? `<div class="muted">Você tem: ${count}</div>` : ''}
      <div class="price">${money(p.price)}</div>
      ${btn}
    </div>`;
  }).join('');
}

function renderLive() {
  $('#live-running').hidden = !live;
  $('#live-setup').hidden = !!live;
  if (live) return;

  const b = checkBuild();
  const ready = S.pcOn && b.ok;
  $('#live-warning').hidden = ready;

  $('#games').innerHTML = GAMES.map(g => {
    const owned = S.games.includes(g.id);
    const fps = estimateFps(g, b);
    const q = quality(fps);
    const nov = Math.round(novelty(g.id) * 100);
    return `<div class="card game ${owned && g.id === selectedGame ? 'selected' : ''} ${owned ? '' : 'not-owned'}"
      ${owned ? `data-action="pick-game" data-id="${g.id}"` : ''}>
      <div class="game-emoji">${g.emoji}</div>
      <div class="slot-name">${g.name}</div>
      <div class="muted">Pede: CPU ${g.cpu} · Vídeo ${g.gpu} · ${g.ram}GB</div>
      ${ready ? `<div class="badge ${q.cls}">${fps} FPS · ${q.label}</div>` : ''}
      <div class="muted">Popularidade ${'★'.repeat(Math.round(g.pop))} · Interesse ${nov}%</div>
      ${owned ? '' : `<button class="btn small" data-action="buy-game" data-id="${g.id}" ${S.money < g.price ? 'disabled' : ''}>Comprar ${money(g.price)}</button>`}
    </div>`;
  }).join('');

  document.querySelectorAll('[data-action="hours"]').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.h) === selectedHours);
    btn.disabled = S.energy < Number(btn.dataset.h) * ENERGY_PER_HOUR;
  });
  $('#btn-live').disabled = !ready || S.energy < selectedHours * ENERGY_PER_HOUR;

  const last = S.lastLive;
  $('#last-live').hidden = !last;
  if (last) {
    const why = last.reason === 'psu' ? ' (a fonte explodiu 💥)' : last.reason === 'stopped' ? ' (encerrada antes)' : '';
    $('#last-live').innerHTML = `<h3>Resumo da última live${why}</h3>
      <div class="summary">
        <div><span class="muted">Jogo</span><b>${last.game}</b></div>
        <div><span class="muted">Duração</span><b>${Math.floor(last.minutes / 60)}h${String(last.minutes % 60).padStart(2, '0')}</b></div>
        <div><span class="muted">Pico</span><b>${num(last.peak)} 👁</b></div>
        <div><span class="muted">Ganhou</span><b class="txt-good">${money(last.earned)}</b></div>
        <div><span class="muted">Seguidores</span><b>+${num(last.followers)}</b></div>
        <div><span class="muted">Conta de luz</span><b class="txt-bad">-${money(last.bill)}</b></div>
      </div>`;
  }
}

function renderGoals() {
  $('#goal-list').innerHTML = GOALS.map(g => {
    const done = S.goals.includes(g.id);
    return `<li class="${done ? 'done' : ''}"><span>${done ? '✅' : '⬜'}</span>
      <span class="goal-text">${g.text}</span><b>${money(g.reward)}</b></li>`;
  }).join('');
  $('#stats').innerHTML = `
    <div><span class="muted">Lives feitas</span><b>${S.stats.lives}</b></div>
    <div><span class="muted">Total ganho</span><b>${money(S.stats.earned)}</b></div>
    <div><span class="muted">Recorde de público</span><b>${num(S.stats.bestViewers)}</b></div>`;
}

function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('main > section').forEach(s => { s.hidden = s.id !== 'tab-' + name; });
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action], .tab');
  if (!el) return;
  if (el.tagName === 'A') e.preventDefault();
  if (el.classList.contains('tab')) return showTab(el.dataset.tab);
  const d = el.dataset;
  switch (d.action) {
    case 'buy': return buyPart(d.id);
    case 'install': return installPart(Number(d.uid));
    case 'sell': return sellPart(Number(d.uid));
    case 'remove': return removePart(d.slot);
    case 'filter': shopFilter = d.cat; return renderShop();
    case 'power': return powerOn();
    case 'pick-game': selectedGame = d.id; return renderLive();
    case 'buy-game': return buyGame(d.id);
    case 'hours': selectedHours = Number(d.h); return renderLive();
    case 'start-live': return startLive();
    case 'stop-live': return live && endLive('stopped');
    case 'sleep': return sleep();
    case 'goto': return showTab(d.tab);
    case 'reset':
      if (!live && confirm('Apagar todo o progresso e começar do zero?')) {
        S = newState();
        $('#post').hidden = true;
        changed();
      }
  }
});

render();
