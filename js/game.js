'use strict';

const SAVE_KEY = RETRO ? 'inforeal-save-retro' : 'inforeal-save-v2';
const START_MONEY = 1500;
const TICK_MS = 700;          // duração real de cada "pedaço" da live
const TICKS_PER_HOUR = 6;     // cada tick = 10 minutos no jogo
const ENERGY_PER_HOUR = 20;
const KWH_PRICE = 1;          // R$ por kWh na conta de luz

const PART_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p]));

const $ = sel => document.querySelector(sel);
const money = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = v => Math.floor(v).toLocaleString('pt-BR');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const esc = str => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let S = loadGame();
let live = null;          // estado da live em andamento (não é salvo)
let booting = false;
let shopFilter = 'cpu';
let selectedGame = 'fogo';
let selectedHours = 1;
let openApp = null;   // app aberto no monitor: 'stream' (StreamZinho) ou 'news' (GameNews)

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
    cases: ['k1'],
    caseId: 'k1',
    games: ['paciencia', 'fogo', 'moba', 'cs'],
    gamePlays: {},
    goals: [],
    pcOn: false,
    lastLive: null,
    newsSeen: 0,
    oc: 0, virus: false, pet: { food: 80 }, house: 'h0', used: [],
    stats: { lives: 0, earned: 0, bestViewers: 0, cyber60: false },
    // Fase 2
    phase2: false,
    skills: { code: 0, art: 0, sound: 0 },   // XP de cada área
    engines: ['scratch'],
    project: null,
    myGames: [],
    nextGameId: 1,
    lastReview: null,
    // Fases 3 e 4
    phase3: false,
    phase4: false,
    ai: null,       // IA criadora de jogos
    lang: null,     // sua linguagem de programação
    brain: null,    // sua própria IA
    server: { rack: false, cpu: false, gpus: [] },   // servidor de IA (super peças)
    finished: false,
  };
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return newState();
    const data = JSON.parse(raw);
    const base = newState();
    return {
      ...base, ...data,
      build: { ...base.build, ...data.build },
      stats: { ...base.stats, ...data.stats },
      skills: { ...base.skills, ...data.skills },
    };
  } catch {
    return newState();
  }
}

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { /* sem armazenamento */ }
}

// Live e sessão de programação ocupam o jogador; nada de comprar peças no meio.
function busy() {
  return !!(live || dev || lab);
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
    cpu: p.cpu ? Math.round(p.cpu.score * ocMult()) : 0,
    gpu: p.gpu ? Math.round(p.gpu.score * ocMult()) : 0,
    ram: p.ram ? p.ram.gb : 0,
    storage: p.storage ? p.storage.speed : 0,
  };
}

function buyPart(id) {
  const p = PART_BY_ID[id];
  if (!p || busy() || !isReleased(p) || S.money < priceOf(p) || S.followers < p.unlock) return;
  if (p.cat === 'gear') {
    if (S.gear.includes(id)) return;
    S.gear.push(id);
    if (id === 'e13' && S.virus) {
      S.virus = false;
      toast('🛡️ Antivírus instalado: o vírus foi removido!', 'goal');
    }
  } else if (p.cat === 'house') {
    if (houseTier(id) <= houseTier(S.house)) return;
    S.house = id;
    S.energy = Math.min(maxEnergy(), S.energy + 10);
  } else if (p.cat === 'server') {
    if (!serverCanBuy(p)) return;
    serverInstall(p);
  } else if (p.cat === 'case') {
    if (S.cases.includes(id)) return;
    S.cases.push(id);
    S.caseId = id;
  } else {
    S.inventory.push({ uid: S.nextUid++, id });
  }
  S.money -= priceOf(p);
  Hooks.run('bought', p);
  toast(['gear', 'case', 'server'].includes(p.cat) ? `🛒 ${p.name} comprado!` : `🛒 ${p.name} comprado! Instale na aba Montagem.`);
  changed();
}

function installPart(uid) {
  const p = itemPart(uid);
  if (!p || busy()) return;
  S.build[p.cat] = uid;
  S.pcOn = false;
  changed();
}

function useCase(id) {
  if (busy() || !S.cases.includes(id)) return;
  S.caseId = id;
  changed();
}

function removePart(slot) {
  if (busy() || !S.build[slot]) return;
  S.build[slot] = null;
  S.pcOn = false;
  changed();
}

function sellPart(uid) {
  const p = itemPart(uid);
  if (!p || busy()) return;
  const slot = installedSlotOf(uid);
  if (slot) { S.build[slot] = null; S.pcOn = false; }
  S.inventory = S.inventory.filter(i => i.uid !== uid);
  const value = Math.round(priceOf(p) * 0.5);
  S.money += value;
  toast(`💸 Vendeu ${p.name} por ${money(value)}`);
  changed();
}

function powerOn() {
  if (booting || busy()) return;
  booting = true;
  const b = checkBuild();
  const lines = ['> Apertando o botão de ligar...'];
  if (!b.parts.psu) {
    lines.push('...nada acontece. Sem fonte não tem energia!');
  } else {
    lines.push('Ventoinhas girando... 🌀');
    if (b.ok && b.parts.psu.generic && Math.random() < 0.03) {
      lines.push('💥 PUF! Cheiro de queimado...');
      b.ok = false;
      b.boom = true;
    } else if (b.ok) {
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
      if (b.boom) psuBoom();
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
  if (S.virus) r *= 0.7;
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
  const caseMult = (PART_BY_ID[S.caseId] || PART_BY_ID.k1).mult;
  return Hooks.filter('gearMult', S.gear.reduce((m, id) => m * PART_BY_ID[id].mult, caseMult) * petMult());
}

/* ---------- Live ---------- */

function allGames() {
  return GAMES.filter(isReleased).sort((a, b) => (b.day || 0) - (a.day || 0)).concat(S.myGames.map(ownGameForLive));
}

function gameById(id) {
  return allGames().find(g => g.id === id);
}

function ownsGame(id) {
  return S.games.includes(id) || id.startsWith('my-');
}

function buyGame(id) {
  const g = gameById(id);
  if (!g || busy() || ownsGame(id) || S.money < g.price) return;
  S.money -= g.price;
  S.games.push(id);
  selectedGame = id;
  toast(`🎮 Você comprou ${g.name}!`);
  changed();
}

function startLive() {
  if (busy()) return;
  const b = checkBuild();
  if (!S.pcOn || !b.ok) return toast('Ligue o PC na aba Montagem antes de fazer live!', 'bad');
  if (!ownsGame(selectedGame) || !gameById(selectedGame)) return toast('Escolha um jogo que você tem.', 'bad');
  const cost = selectedHours * ENERGY_PER_HOUR;
  if (S.energy < cost) return toast('Você está cansado demais para essa live. Vá dormir! 😴', 'bad');

  const game = gameById(selectedGame);
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
    mult: game.pop * freshness(game) * gearMult() * novelty(game.id) * [0, 0.9, 1, 1.1][b.storage],
    playBonus: 0, raid: 0, lag: 0,
  };
  openApp = 'stream';

  $('#chat').innerHTML = '';
  $('#live-game').textContent = `${game.emoji} ${game.name}`;
  setLiveScene(game);
  $('#live-fps').textContent = `${fps} FPS · ${live.q.label}`;
  $('#live-fps').className = 'live-fps ' + live.q.cls;
  addChat('Sistema', `A live de ${game.name} começou!`, 'sys');
  render();
  startSim(game, fps);
  updateLiveView();
  live.timer = setInterval(liveTick, TICK_MS);
  Hooks.run('liveStart');
}

// Câmera do streamer por cima do jogo (se você comprou webcam).
function setLiveScene() {
  $('#event-banner').hidden = true;
  const cam = $('#live-cam');
  cam.hidden = !S.gear.includes('e2');
  cam.classList.toggle('lit', S.gear.includes('e3'));
  $('#live-mic').hidden = !(S.gear.includes('e1') || S.gear.includes('e4'));
}

function liveTick() {
  const L = live;
  L.tick++;

  const ramp = Math.min(1, L.tick / 4);
  // Público cresce mais devagar que os seguidores (expoente 0.6), para não virar bola de neve.
  const base = 5 + 3 * Math.pow(S.followers, 0.6);
  let viewers = base * L.mult * L.q.mult * ramp * rand(0.8, 1.2) * (1 + L.playBonus) + L.raid;
  if (L.lag > 0) { viewers *= 0.5; L.lag--; }
  L.raid *= 0.8;
  L.viewers = Math.max(0, Math.round(viewers));
  L.peak = Math.max(L.peak, L.viewers);

  // Quanto maior o público, menos cada espectador rende (anúncios e inscrições diluem).
  const income = L.viewers * 0.5 / Math.sqrt(1 + L.viewers / 500);
  L.earned += income;
  S.money += income;

  // Fica cada vez mais difícil ganhar seguidores quando você já é famoso.
  const newFollowers = L.viewers * 0.035 * L.q.mult * rand(0.5, 1.5) / (1 + S.followers / 5e5);
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

  // Fonte genérica pode explodir a qualquer momento (sobrecarregada é bem pior).
  if (psuExplodes(checkBuild())) {
    addChat('Sistema', psuBoom(), 'sys');
    endLive('psu');
    return;
  }
  const burned = ocBurn(checkBuild());
  if (burned) {
    addChat('Sistema', burned, 'sys');
    endLive('oc');
    return;
  }
  const ending = liveEvent(L);
  if (ending) {
    endLive(ending);
    return;
  }

  if (L.tick >= L.total) endLive('done');
  else updateLiveView();
}

function endLive(reason) {
  Hooks.run('liveEnd', reason);
  const L = live;
  clearInterval(L.timer);
  live = null;
  stopSim();

  const hours = L.tick / TICKS_PER_HOUR;
  const bill = Math.round(L.watts * hours / 1000 * KWH_PRICE * 100) / 100;
  S.money -= bill;

  S.stats.lives++;
  S.stats.earned += L.earned;
  S.stats.bestViewers = Math.max(S.stats.bestViewers, L.peak);
  S.gamePlays[L.game.id] = (S.gamePlays[L.game.id] || 0) + 1;
  if (L.game.id === 'cyber' && L.fps >= 60) S.stats.cyber60 = true;
  if (L.game.own) streamedOwnGame(L.game.gameId, L.peak);

  if (reason === 'blackout' || reason === 'mae') S.pcOn = false;

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
  const msg = Hooks.filter('chat', { name, text, cls });
  if (!msg) return;
  ({ name, text, cls } = msg);
  const chat = $('#chat');
  const line = document.createElement('div');
  line.className = 'chat-line ' + cls;
  const who = document.createElement('b');
  who.textContent = name + ': ';
  line.append(who, text);
  chat.append(line);
  while (chat.children.length > 60) chat.firstChild.remove();
  chat.scrollTop = chat.scrollHeight;
  Hooks.run('chatAdded', msg);
}

function updateLiveView() {
  const L = live;
  const mins = L.tick * 10;
  $('#live-viewers').textContent = num(L.viewers);
  $('#live-viewers-top').textContent = num(L.viewers);
  $('#live-earned').textContent = money(L.earned);
  $('#live-followers').textContent = '+' + num(L.followers);
  $('#live-time').textContent = `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
  $('#live-progress').style.width = (L.tick / L.total * 100) + '%';
  renderHeader();
}

function sleep() {
  if (busy()) return;
  const yesterday = S.day;
  S.day++;
  S.energy = maxEnergy();
  for (const id in S.gamePlays) S.gamePlays[id] = Math.floor(S.gamePlays[id] / 2);
  toast(`😴 Você dormiu. Bom dia, dia ${S.day}!`);
  dailySales();
  labDaily();
  dailyEvent();
  extrasDaily();
  announceReleases(yesterday, S.day);
  Hooks.run('daily');
  changed();
}

/* ---------- Objetivos ---------- */

function checkGoals() {
  checkLabUnlocks();
  if (!S.phase2 && S.followers >= PHASE2_FOLLOWERS) {
    S.phase2 = true;
    toast('💻 Fase 2 desbloqueada! Abra a aba Dev e aprenda a programar.', 'goal');
  }
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
  while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
  setTimeout(() => el.remove(), 3500);
  Hooks.run('toast', text, cls);
}

function partSpec(p) {
  switch (p.cat) {
    case 'cpu': return `Soquete ${p.socket} · Força ${p.score} · ${p.watts}W`;
    case 'mobo': return `Soquete ${p.socket} · Memória ${p.ram}`;
    case 'ram': return `${p.gb}GB ${p.type}`;
    case 'gpu': return `Força ${p.score} · ${p.watts}W`;
    case 'storage': return `${{ hdd: 'HD', ssd: 'SSD SATA', nvme: 'SSD NVMe' }[p.kind]} · Velocidade ${'★'.repeat(p.speed)}${'☆'.repeat(3 - p.speed)}`;
    case 'psu': return `${p.watts}W${p.generic ? ' · ⚠️ genérica, pode explodir' : ''}`;
    case 'house': return p.desc;
    case 'gear': return p.desc || `+${Math.round((p.mult - 1) * 100)}% espectadores`;
    case 'server': return p.kind === 'gpu' ? `Poder de IA ${p.compute} · ${p.watts}W` : p.kind === 'rack' ? 'Obrigatório: onde tudo é instalado' : 'Obrigatório: o cérebro do servidor';
    case 'case': return `${p.look.fans} ventoinha${p.look.fans > 1 ? 's' : ''}${p.look.rgb ? ' RGB' : ''}`
      + (p.mult > 1 ? ` · +${Math.round((p.mult - 1) * 100)}% espectadores` : ' · veio de brinde');
  }
  return '';
}

function render() {
  renderHeader();
  renderBuild();
  renderShop();
  renderLive();
  renderGoals();
  renderDev();
  renderLab();
  Hooks.run('render');
}

function renderHeader() {
  $('#stat-money').textContent = money(S.money);
  $('#stat-followers').textContent = num(S.followers);
  $('#stat-day').textContent = S.day;
  $('#stat-energy').textContent = S.energy;
  $('#energy-fill').style.width = Math.min(100, S.energy / maxEnergy() * 100) + '%';
  $('#btn-sleep').disabled = busy();
}

function renderBuild() {
  const b = checkBuild();
  const lock = busy() || booting ? 'disabled' : '';

  $('#welcome').hidden = S.stats.lives > 0 || S.pcOn;
  renderCase(b);
  $('#oc').value = S.oc;
  $('#oc').disabled = busy();
  $('#oc-value').textContent = S.oc ? `+${S.oc}%` : 'desligado';

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
  $('#btn-power').disabled = busy() || booting;

  const loose = S.inventory.filter(i => !installedSlotOf(i.uid));
  $('#inventory').innerHTML = loose.length
    ? loose.map(i => {
      const p = PART_BY_ID[i.id];
      return `<div class="item">
        <div class="item-thumb">${partThumb(p)}</div>
        <div class="slot-info">
          <div class="slot-name">${p.name}</div>
          <div class="muted">${partSpec(p)}</div>
        </div>
        <div class="item-actions">
          <button class="btn small" data-action="install" data-uid="${i.uid}" ${lock}>Instalar</button>
          <button class="btn small ghost" data-action="sell" data-uid="${i.uid}" ${lock}>Vender ${money(Math.round(priceOf(p) * 0.5))}</button>
        </div>
      </div>`;
    }).join('')
    : '<p class="muted">Nenhuma peça guardada. Compre peças na Loja!</p>';

  $('#gear-list').innerHTML = S.gear.length
    ? S.gear.map(id => `<span class="chip">${PART_BY_ID[id].name}</span>`).join('')
    : '<span class="muted">Nenhum ainda.</span>';
}

function renderShop() {
  if (shopFilter === 'server' && !S.phase3) shopFilter = 'cpu';
  $('#shop-filters').innerHTML = Object.keys(CATS).filter(cat => cat !== 'server' || S.phase3).map(cat =>
    `<button class="chip-btn ${cat === shopFilter ? 'active' : ''}" data-action="filter" data-cat="${cat}">${CAT_ICONS[cat]} ${CATS[cat]}</button>`,
  ).join('');

  if (shopFilter === 'used') {
    if (!S.used.length) refreshUsed();
    $('#shop-list').innerHTML = S.used.map((u, i) => {
      const p = PART_BY_ID[u.id];
      return `<div class="card shop-item">
        ${partThumb(p)}
        <div class="slot-name">${p.name} <span class="chip mini">Usado</span></div>
        <div class="muted">${partSpec(p)}</div>
        <div class="muted">Vendedor: ${u.seller}</div>
        <div class="price">${money(u.price)} <s class="muted">${money(priceOf(p))}</s></div>
        <button class="btn small" data-action="buy-used" data-i="${i}" ${busy() || S.money < u.price ? 'disabled' : ''}>Arriscar</button>
      </div>`;
    }).join('') + '<p class="muted">⚠️ Usados são baratos, mas às vezes o vendedor manda um tijolo na caixa. Novas ofertas todo dia.</p>';
    return;
  }
  $('#shop-list').innerHTML = PARTS.filter(p => p.cat === shopFilter && isReleased(p))
    .sort((a, b) => (b.day || 0) - (a.day || 0) || 0).map(p => {
    const locked = S.followers < p.unlock;
    const owned = (p.cat === 'gear' && S.gear.includes(p.id)) || (p.cat === 'case' && S.cases.includes(p.id));
    const count = S.inventory.filter(i => i.id === p.id).length;
    let btn;
    if (locked) btn = `<button class="btn small" disabled>🔒 ${num(p.unlock)} seguidores</button>`;
    else if (p.cat === 'house' && houseTier(p.id) <= houseTier(S.house)) {
      btn = `<button class="btn small" disabled>${p.id === S.house ? '✔ Você mora aqui' : 'Você já mora melhor'}</button>`;
    } else if (p.cat === 'server') {
      const why = serverBlock(p);
      btn = why ? `<button class="btn small" disabled>${why}</button>`
        : `<button class="btn small" data-action="buy" data-id="${p.id}" ${busy() || S.money < priceOf(p) ? 'disabled' : ''}>Comprar</button>`;
    } else if (p.cat === 'case' && owned) {
      btn = S.caseId === p.id
        ? '<button class="btn small" disabled>✔ Em uso</button>'
        : `<button class="btn small ghost" data-action="use-case" data-id="${p.id}" ${busy() ? 'disabled' : ''}>Usar este</button>`;
    } else if (owned) btn = '<button class="btn small" disabled>✔ Comprado</button>';
    else btn = `<button class="btn small" data-action="buy" data-id="${p.id}" ${busy() || S.money < priceOf(p) ? 'disabled' : ''}>Comprar</button>`;
    return `<div class="card shop-item ${locked ? 'locked' : ''}">
      ${partThumb(p)}
      <div class="slot-name">${p.name} ${isNew(p) ? '<span class="chip mini new">🆕 Novo</span>' : ''}</div>
      <div class="muted">${partSpec(p)}</div>
      ${count ? `<div class="muted">Você tem: ${count}</div>` : ''}
      <div class="price">${money(priceOf(p))}${priceOf(p) < p.price ? ` <s class="muted">${money(p.price)}</s>` : ''}</div>
      ${btn}
    </div>`;
  }).join('');
}

function renderLive() {
  const b = checkBuild();
  const ready = S.pcOn && b.ok;

  // O que aparece no monitor: sem sinal, área de trabalho (InfoOS) ou a live.
  $('#screen-off').hidden = ready || !!live;
  $('#screen-os').hidden = !ready || !!live;
  $('#screen-live').hidden = !live;
  $('#live-running').hidden = !live;
  $('#win-stream').hidden = openApp !== 'stream';
  $('#win-news').hidden = openApp !== 'news';
  $('#os-hint').hidden = !!openApp;
  const unread = unreadNews();
  $('#news-badge').textContent = unread;
  $('#news-badge').hidden = !unread;
  if (openApp === 'news') renderNews();
  $('#os-clock').textContent = `Dia ${S.day} · ⚡${S.energy}`;
  renderDesk(b);
  if (live) return;

  $('#games').innerHTML = allGames().map(g => {
    const owned = ownsGame(g.id);
    const fps = estimateFps(g, b);
    const q = quality(fps);
    const nov = Math.round(novelty(g.id) * 100);
    return `<div class="card game ${owned && g.id === selectedGame ? 'selected' : ''} ${owned ? '' : 'not-owned'}"
      ${owned ? `data-action="pick-game" data-id="${g.id}"` : ''}>
      ${gameCover(g, 'banner')}
      <div class="slot-name">${esc(g.name)}${g.own ? ' <span class="chip mini">Seu jogo</span>' : ''}</div>
      <div class="muted">Pede: CPU ${g.cpu} · Vídeo ${g.gpu} · ${g.ram}GB</div>
      ${ready ? `<div class="badge ${q.cls}">${fps} FPS · ${q.label}</div>` : ''}
      <div class="muted">Popularidade ${'★'.repeat(Math.round(g.pop))} · Interesse ${nov}%</div>
      ${freshnessLabel(g) ? `<div class="muted">${freshnessLabel(g)}${g.studio ? ` · ${g.studio}` : ''}</div>` : ''}
      ${owned ? '' : `<button class="btn small" data-action="buy-game" data-id="${g.id}" ${S.money < g.price ? 'disabled' : ''}>Comprar ${money(g.price)}</button>
        ${g.price ? `<button class="btn small ghost" data-action="pirate" data-id="${g.id}" title="Pode vir com vírus!">🏴‍☠️ Baixar pirata</button>` : ''}`}
    </div>`;
  }).join('');

  document.querySelectorAll('[data-action="hours"]').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.h) === selectedHours);
    btn.disabled = S.energy < Number(btn.dataset.h) * ENERGY_PER_HOUR;
  });
  $('#btn-live').disabled = !ready || busy() || S.energy < selectedHours * ENERGY_PER_HOUR;

  const last = S.lastLive;
  $('#last-live').hidden = !last;
  if (last) {
    const why = { psu: ' (a fonte explodiu 💥)', stopped: ' (encerrada antes)', blackout: ' (a luz caiu ⚡)', mae: ' (a mãe desligou 👩)', oc: ' (queimou no overclock 🔥)' }[last.reason] || '';
    $('#last-live').innerHTML = `<h3>Resumo da última live${why}</h3>
      <div class="summary">
        <div><span class="muted">Jogo</span><b>${esc(last.game)}</b></div>
        <div><span class="muted">Duração</span><b>${Math.floor(last.minutes / 60)}h${String(last.minutes % 60).padStart(2, '0')}</b></div>
        <div><span class="muted">Pico</span><b>${num(last.peak)} 👁</b></div>
        <div><span class="muted">Ganhou</span><b class="txt-good">${money(last.earned)}</b></div>
        <div><span class="muted">Seguidores</span><b>+${num(last.followers)}</b></div>
        <div><span class="muted">Conta de luz</span><b class="txt-bad">-${money(last.bill)}</b></div>
      </div>`;
  }
}

// App GameNews: lançamentos do mercado, rumores e os seus jogos.
function renderNews() {
  const items = RELEASES.filter(r => r.day <= S.day).map(r => ({ day: r.day, r }))
    .concat(S.myGames.map(g => ({ day: g.day, mine: g })))
    .sort((a, b) => b.day - a.day).slice(0, 20);
  const rumors = upcomingReleases(2).map(r => {
    const who = r.part ? { nvidia: 'a NVIDIA', amd: 'a AMD', intel: 'a Intel' }[r.part.brand] || 'uma marca famosa' : 'um estúdio gigante';
    const what = r.part ? `um(a) novo(a) ${CATS[r.part.cat].toLowerCase()}` : 'um jogo que promete ser o mais pesado já feito';
    return `<div class="news rumor">🔮 <b>Rumor:</b> ${who} prepara ${what}. Chega em ${r.day - S.day} dia${r.day - S.day > 1 ? 's' : ''}.</div>`;
  }).join('');
  $('#news-list').innerHTML = rumors + (items.length ? items.map(({ day, r, mine }) => {
    const age = S.day - day;
    const when = age === 0 ? 'hoje' : age === 1 ? 'ontem' : `há ${age} dias`;
    if (mine) {
      return `<div class="news mine"><span class="news-icon">🕹️</span><div><b>Você lançou ${esc(mine.name)}</b>
        <div class="muted">Nota ${mine.score.toFixed(1)} · ${num(mine.sold)} cópias · ${when}</div></div></div>`;
    }
    if (r.part) {
      const p = PART_BY_ID[r.part.id];
      return `<div class="news"><span class="news-icon">${CAT_ICONS[p.cat]}</span><div><b>Chegou: ${p.name}</b>
        <div class="muted">${partSpec(p)} · ${money(priceOf(p))} · ${when}</div></div>
        <button class="btn small ghost" data-action="shop-cat" data-cat="${p.cat}">Ver na loja</button></div>`;
    }
    const g = r.game;
    return `<div class="news"><span class="news-icon">${g.emoji}</span><div><b>Novo jogo: ${g.name}</b>
      <div class="muted">${g.studio} · pede CPU ${g.cpu}, vídeo ${g.gpu} e ${g.ram}GB · ${g.price ? money(g.price) : 'grátis'} · ${when}</div></div>
      <button class="btn small ghost" data-action="open-app" data-app="stream">Jogar</button></div>`;
  }).join('') : '<p class="muted">Nenhuma notícia ainda. Volte amanhã!</p>');
}

// Mesa do streamer: parede, monitor, webcam, ring light, microfone, stream deck e o PC.
function renderDesk(b) {
  const has = id => S.gear.includes(id);
  const monitor = has('e11') ? 'ultra' : has('e10') ? 'big' : 'basic';
  $('#desk').className = `desk monitor-${monitor} house-${S.house}${has('e6') ? ' greenscreen' : ''}`;
  $('#virus-popup').hidden = !S.virus;
  $('#pet-food').style.width = S.pet.food + '%';
  $('#pet').classList.toggle('hungry', S.pet.food < 15);
  $('#pet').title = S.pet.food < 15 ? 'Estou com fome! (R$ 10)' : 'Alimentar (R$ 10)';
  $('#desk-ring').hidden = !has('e3');
  $('#desk-cam').hidden = !has('e2');
  $('#desk-chair').hidden = !has('e5');

  const plaques = [[1e7, 'diamond', '💎 10M'], [1e6, 'gold', '🥇 1M'], [1e5, 'silver', '🥈 100K']]
    .filter(([n]) => S.followers >= n).map(([, cls, label]) => `<div class="plaque ${cls}">▶ ${label}</div>`).join('');
  $('#desk-plaques').innerHTML = plaques;

  const c = PART_BY_ID[S.caseId] || PART_BY_ID.k1;
  $('#desk-items').innerHTML = `
    ${has('e4') ? '<div class="mic-arm" title="HyperX QuadCast S">🎙️</div>' : has('e1') ? '<div class="desk-mic" title="Fifine K669">🎙️</div>' : ''}
    <div class="keyboard"></div>
    <div class="mouse"></div>
    ${has('e7') ? '<div class="streamdeck" title="Stream Deck"></div>' : ''}
    <svg class="case mini-case ${S.pcOn ? 'on' : ''} case-${c.look.theme}" viewBox="0 0 420 460"
      role="img" aria-label="Seu PC">${caseMarkup(b, true)}</svg>`;
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
    case 'use-case': return useCase(d.id);
    case 'pirate': return pirateGame(d.id);
    case 'buy-used': return buyUsed(Number(d.i));
    case 'feed-pet': return feedPet();
    case 'open-app':
      openApp = d.app || 'stream';
      if (openApp === 'news') { S.newsSeen = S.day; saveGame(); }
      return renderLive();
    case 'close-app': openApp = null; return renderLive();
    case 'toggle-play': return toggleManual();
    case 'shop-cat': shopFilter = d.cat; renderShop(); return showTab('shop');
    case 'power': return powerOn();
    case 'pick-game': selectedGame = d.id; return renderLive();
    case 'buy-game': return buyGame(d.id);
    case 'hours': selectedHours = Number(d.h); return renderLive();
    case 'start-live': return startLive();
    case 'stop-live': return live && endLive('stopped');
    case 'sleep': return sleep();
    case 'goto': return showTab(d.tab);
    case 'reset':
      if (!busy() && confirm('Apagar todo o progresso e começar do zero?')) {
        S = newState();
        resetDevDraft();
        $('#post').hidden = true;
        changed();
      }
      return;
    default:
      handleDevAction(d);
      handleLabAction(d);
      Hooks.run('action', d);
  }
});

checkGoals();
render();
