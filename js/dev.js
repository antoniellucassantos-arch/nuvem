'use strict';

// Fase 2: estudar, programar jogos, lançar e vender.
// Usa o estado e as funções de game.js (S, $, money, changed...), que é carregado depois.

const DEV_TICK_MS = 450;
const EDITOR_FILES = { Blocos: 'projeto.sb3', Python: 'main.py', JavaScript: 'game.js', GDScript: 'player.gd', 'C#': 'Player.cs', 'C++': 'Hero.cpp' };
const COMMENT = { Blocos: '💬', Python: '#', GDScript: '#', JavaScript: '//', 'C#': '//', 'C++': '//' };

const ENGINE_BY_ID = Object.fromEntries(ENGINES.map(e => [e.id, e]));

// Ferramentas conhecidas + a sua própria linguagem (Fase 4), quando lançada.
function allEngines() {
  return S.lang && S.lang.released ? ENGINES.concat(myLangEngine()) : ENGINES;
}

function engineById(id) {
  return id === 'mylang' ? myLangEngine() : ENGINE_BY_ID[id];
}
const GENRE_BY_ID = Object.fromEntries(GENRES.map(g => [g.id, g]));
const THEME_BY_ID = Object.fromEntries(THEMES.map(t => [t.id, t]));
const SIZE_BY_ID = Object.fromEntries(SIZES.map(s => [s.id, s]));
const PRICE_BY_ID = Object.fromEntries(PRICES.map(p => [p.id, p]));

let dev = null;          // sessão de programação em andamento (não é salva)
let draft = newDraft();  // formulário de novo jogo

function newDraft() {
  return { name: '', engine: 'scratch', genre: 'plataforma', theme: 'capivaras', size: 'pequeno', focus: { ...FOCUS_PRESETS[1].f }, price: 'p10' };
}

function resetDevDraft() {
  draft = newDraft();
}

/* ---------- Conhecimento ---------- */

function skillLevel(key) {
  let lvl = 0;
  while (lvl < 10 && S.skills[key] >= SKILL_LEVELS[lvl + 1]) lvl++;
  return lvl;
}

function gainXp(key, xp) {
  const before = skillLevel(key);
  S.skills[key] += xp;
  const after = skillLevel(key);
  if (after > before) toast(`⬆️ ${SKILLS[key].name} subiu para o nível ${after}!`, 'goal');
}

function study(skill, courseId) {
  const c = COURSES.find(x => x.id === courseId);
  if (!c || !SKILLS[skill] || busy() || !S.phase2 || skillLevel(skill) >= 10) return;
  if (S.money < c.price) return toast('Dinheiro insuficiente para esse curso.', 'bad');
  if (S.energy < c.energy) return toast('Você está cansado demais para estudar. Vá dormir! 😴', 'bad');
  S.money -= c.price;
  S.energy -= c.energy;
  toast(`📚 ${c.name}: +${c.xp} XP em ${SKILLS[skill].name}`);
  gainXp(skill, c.xp);
  changed();
}

/* ---------- Ferramentas ---------- */

// Motivo pelo qual a ferramenta não pode ser usada agora (ou null se pode).
function engineProblem(e) {
  if (skillLevel('code') < e.code) return `Precisa de Programação nível ${e.code}`;
  const b = checkBuild();
  if (b.cpu < e.pc.cpu || b.gpu < e.pc.gpu || b.ram < e.pc.ram) {
    return `Seu PC não aguenta: pede CPU ${e.pc.cpu}, vídeo ${e.pc.gpu} e ${e.pc.ram}GB de RAM`;
  }
  return null;
}

function learnEngine(id) {
  const e = engineById(id);
  if (!e || busy() || S.engines.includes(id) || skillLevel('code') < e.code || S.money < e.price) return;
  S.money -= e.price;
  S.engines.push(id);
  draft.engine = id;
  toast(`🛠️ Você aprendeu a usar ${e.name}!`, 'goal');
  changed();
}

/* ---------- Projeto ---------- */

function normFocus(f) {
  const total = f.code + f.art + f.sound;
  if (!total) return { code: 1 / 3, art: 1 / 3, sound: 1 / 3 };
  return { code: f.code / total, art: f.art / total, sound: f.sound / total };
}

function startProject() {
  if (busy() || S.project || !S.phase2) return;
  const e = engineById(draft.engine);
  const g = GENRE_BY_ID[draft.genre];
  const size = SIZE_BY_ID[draft.size];
  const name = draft.name.trim() || pick(DEV_NAME_IDEAS);
  if (!S.engines.includes(e.id)) return;
  if (g.is3d && !e.is3d) return toast(`${g.name} precisa de uma ferramenta 3D.`, 'bad');
  if (skillLevel('code') < size.code) return toast(`Jogo ${size.name.toLowerCase()} precisa de Programação nível ${size.code}.`, 'bad');

  S.project = {
    name: name.slice(0, 30),
    engine: e.id,
    genre: g.id,
    theme: draft.theme,
    size: size.id,
    focus: normFocus(draft.focus),
    progress: 0,
    target: size.target,
    bugs: 0,
    bonus: 0,
  };
  draft.name = '';
  toast(`🧪 Projeto "${S.project.name}" começou! Agora é programar.`);
  changed();
}

function startDevSession(mode, hours) {
  const P = S.project;
  if (busy() || !P) return;
  const b = checkBuild();
  if (!S.pcOn || !b.ok) return toast('Ligue o PC na aba Montagem para programar!', 'bad');
  const problem = engineProblem(engineById(P.engine));
  if (problem) return toast(problem, 'bad');
  if (mode === 'fix' && P.bugs < 1) return toast('Não tem bug para corrigir! 🎉');
  if (mode === 'dev' && P.progress >= P.target) return;
  const cost = hours * ENERGY_PER_HOUR;
  if (S.energy < cost) return toast('Você está cansado demais. Vá dormir! 😴', 'bad');

  S.energy -= cost;
  const lang = engineById(P.engine).lang;
  dev = { mode, tick: 0, total: hours * TICKS_PER_HOUR, lang, lines: [`${COMMENT[lang]} ${P.name}`], log: [] };
  $('#dev-log').innerHTML = '';
  $('#editor-file').textContent = EDITOR_FILES[lang];
  devLog(mode === 'dev' ? '⌨️ Hora de programar!' : '🔍 Caçando bugs...', 'sys');
  render();
  updateDevView();
  dev.timer = setInterval(devTick, DEV_TICK_MS / gameSpeed());
}

function devTick() {
  const P = S.project;
  const b = checkBuild();
  const code = skillLevel('code');
  const speed = (1 + b.cpu / 40 + (b.ram >= 16 ? 0.2 : 0)) * rand(0.8, 1.2);
  dev.tick++;

  if (psuExplodes(b)) {
    devLog(psuBoom(), 'bug');
    return endDevSession();
  }
  const burned = ocBurn(b);
  if (burned) {
    devLog(burned, 'bug');
    return endDevSession();
  }

  if (dev.mode === 'dev') {
    const pts = speed * 1.5;
    P.progress = Math.min(P.target, P.progress + pts);
    P.bugs += pts * rand(0, 0.4) * (1 - code / 12);
    for (const k in SKILLS) S.skills[k] += 0.6 * P.focus[k];

    if (Math.random() < 0.1) {
      P.bugs += 2;
      devLog(`🐛 Bug encontrado: ${pick(BUG_MSGS)}`, 'bug');
    } else if (Math.random() < 0.06 && P.bonus < 0.3) {
      P.bonus += 0.03;
      devLog(`💡 ${pick(IDEA_MSGS)}`, 'idea');
    }
    for (let i = 0; i < 2; i++) dev.lines.push(pick(CODE_LINES[dev.lang]));

    if (P.progress >= P.target) {
      devLog('✅ Jogo completo! Corrija os bugs ou lance agora.', 'sys');
      return endDevSession();
    }
  } else {
    const fixed = speed * (1 + code * 0.2) * 0.8;
    P.bugs = Math.max(0, P.bugs - fixed);
    S.skills.code += 0.3;
    if (Math.random() < 0.5) devLog(`✔ Corrigido: ${pick(BUG_MSGS)}`, 'idea');
    dev.lines.push(`${COMMENT[dev.lang]} consertado 🔧`);
    if (P.bugs < 1) {
      P.bugs = 0;
      devLog('✨ Nenhum bug conhecido!', 'sys');
      return endDevSession();
    }
  }

  if (dev.tick >= dev.total) endDevSession();
  else updateDevView();
}

function endDevSession() {
  if (!dev) return;
  clearInterval(dev.timer);
  // Horas que sobraram voltam como energia.
  const refund = Math.floor((dev.total - dev.tick) / TICKS_PER_HOUR * ENERGY_PER_HOUR);
  S.energy = Math.min(100, S.energy + refund);
  dev = null;
  changed();
}

function devLog(text, cls = '') {
  const log = $('#dev-log');
  const line = document.createElement('div');
  line.className = 'chat-line ' + cls;
  line.textContent = text;
  log.append(line);
  while (log.children.length > 40) log.firstChild.remove();
  log.scrollTop = log.scrollHeight;
}

function updateDevView() {
  const P = S.project;
  $('#editor-code').textContent = dev.lines.slice(-14).map((l, i, arr) =>
    `${String(dev.lines.length - arr.length + i + 1).padStart(3)}  ${l}`).join('\n');
  $('#dev-progress').style.width = (P.progress / P.target * 100) + '%';
  $('#dev-progress-text').textContent = `${Math.floor(P.progress)} / ${P.target}`;
  $('#dev-bugs').textContent = Math.ceil(P.bugs);
  const mins = dev.tick * 10;
  $('#dev-time').textContent = `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
  renderHeader();
}

/* ---------- Lançamento, notas e vendas ---------- */

function projectQuality(P) {
  const g = GENRE_BY_ID[P.genre];
  const e = engineById(P.engine);
  let diff = 0, skillF = 0;
  for (const k in SKILLS) {
    diff += Math.abs(P.focus[k] - g.w[k]);
    skillF += g.w[k] * (1 + skillLevel(k) * 0.15);
  }
  let fit = 1 - diff / 2;
  // Jogos feitos pela IA usam o nível dela no lugar dos seus conhecimentos.
  if (P.ai) {
    skillF = 1 + P.aiLevel * 0.16;
    fit = Math.min(1, 0.8 + P.aiLevel * 0.02);
  }
  const combo = COMBOS[`${P.genre}+${P.theme}`] || 1;
  const penalty = Math.min(0.6, (P.bugs / P.target) * 1.2);
  const raw = skillF * e.mult * combo * (0.55 + 0.45 * fit) * (1 + P.bonus) * (1 - penalty);
  const expectation = 1.4 * (1 + 0.1 * Math.min(S.myGames.length, 40));
  const score = Math.round(Math.min(10, Math.max(1, 10 * raw / expectation)) * 10) / 10;
  return { score, fit, combo, penalty, engine: e, genre: g };
}

function reviewsFor(P, q) {
  const theme = THEME_BY_ID[P.theme];
  const reviews = OUTLETS.map(outlet => {
    const s = Math.round(Math.min(10, Math.max(1, q.score + rand(-0.7, 0.7))));
    const bucket = s < 4 ? 'bad' : s < 6.5 ? 'mid' : s < 8.5 ? 'good' : 'great';
    return { outlet, s, quote: pick(REVIEW_QUOTES[bucket]) };
  });
  const notes = [];
  if (q.combo > 1.1) notes.push(`${q.genre.name} de ${theme.name}? Combinação perfeita! 👌`);
  if (q.combo < 1) notes.push(`${q.genre.name} de ${theme.name} não combinou muito...`);
  if (q.penalty > 0.25) notes.push('Cheio de bugs 🐛. Da próxima vez, corrija antes de lançar.');
  else if (q.penalty === 0) notes.push('Nenhum bug encontrado. Que capricho!');
  if (q.fit < 0.85) notes.push(`O foco não combinou com um jogo de ${q.genre.name}. ${q.genre.hint}`);
  if (q.engine.mult < 0.8 && S.myGames.length >= 2) notes.push('Os gráficos estão simples demais. Que tal aprender uma ferramenta melhor?');
  if (P.bonus > 0) notes.push('Adoramos as ideias criativas! 💡');
  if (P.ai) notes.push(`Feito pela IA ${P.aiName}. ${P.aiLevel < 4 ? 'Dá pra perceber... 🤖' : 'Nem parece feito por uma máquina!'}`);
  if (P.engine === 'mylang') notes.push(`Programado em ${q.engine.name}, a linguagem da casa! 🧬`);
  return { reviews, notes };
}

function salesFor(game) {
  const size = SIZE_BY_ID[game.size];
  const price = PRICE_BY_ID[game.price];
  const age = S.day - game.day;
  const base = (20 + 1.5 * Math.pow(S.followers, 0.6)) * Math.pow(game.score / 10, 2.5) * size.sales * price.units
    * Math.pow(0.85, age) * (1 + game.hype);
  return Hooks.filter('sales', Math.round(base * rand(0.85, 1.15)), game);
}

function applySales(game, units) {
  const price = PRICE_BY_ID[game.price];
  const revenue = units * price.cut;
  game.sold += units;
  game.revenue += revenue;
  game.lastSales = units;
  S.money += revenue;
  if (price.value === 0) S.followers += units * 0.02;
  return revenue;
}

// Publica um projeto pronto. Usado pelo botão "Lançar" e pelo modo automático da IA.
function releaseProject(P, priceId) {
  const q = projectQuality(P);
  const { reviews, notes } = reviewsFor(P, q);
  const game = {
    id: S.nextGameId++,
    name: P.name, engine: P.engine, genre: P.genre, theme: P.theme, size: P.size,
    score: q.score, price: priceId, day: S.day, ai: !!P.ai,
    sold: 0, revenue: 0, lastSales: 0, hype: 0.5,
  };
  Hooks.run('released', game, P);
  // Primeiro dia: pico de lançamento.
  const units = salesFor(game) * 2;
  const revenue = applySales(game, units);
  S.myGames.push(game);
  return { game, review: { name: game.name, score: q.score, reviews, notes, units, revenue } };
}

function launchGame() {
  const P = S.project;
  if (busy() || !P || P.progress < P.target) return;
  const { game, review } = releaseProject(P, draft.price);
  S.project = null;
  S.lastReview = review;
  toast(`🎉 ${game.name} foi lançado!`, 'goal');
  changed();
  $('#review').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function dailySales() {
  let units = 0, revenue = 0;
  for (const g of S.myGames) {
    const u = salesFor(g);
    units += u;
    revenue += applySales(g, u);
    g.hype *= 0.5;
  }
  if (units > 0) toast(`💾 Seus jogos venderam ${num(units)} cópias ontem (+${money(revenue)})`);
}

function ownGameForLive(g) {
  const e = engineById(g.engine);
  return {
    id: 'my-' + g.id, gameId: g.id, own: true, name: g.name, price: 0,
    emoji: THEME_BY_ID[g.theme].emoji, emoji2: GENRE_BY_ID[g.genre].emoji, colors: GENRE_COLORS[g.genre],
    sim: g.theme === 'futebol' ? 'soccer' : GENRE_SIM[g.genre], hero: THEME_SPRITES[g.theme][0], foe: THEME_SPRITES[g.theme][1],
    ...e.play, pop: 0.3 + g.score * 0.2,
  };
}

function streamedOwnGame(gameId, peak) {
  const g = S.myGames.find(x => x.id === gameId);
  if (!g) return;
  g.hype = Math.min(3, g.hype + peak / 300);
  toast(`📈 A live deu hype para ${g.name}! As vendas vão subir amanhã.`);
}

/* ---------- Interface ---------- */

function renderDev() {
  $('.tab[data-tab=dev]').textContent = S.phase2 ? '💻 Dev' : '🔒 Dev';
  $('#dev-locked').hidden = S.phase2;
  $('#dev-content').hidden = !S.phase2;
  if (!S.phase2) {
    $('#dev-locked-count').textContent = `${num(S.followers)} / ${PHASE2_FOLLOWERS}`;
    return;
  }
  const lock = busy() ? 'disabled' : '';

  // Conhecimentos
  $('#skills').innerHTML = Object.entries(SKILLS).map(([k, sk]) => {
    const lvl = skillLevel(k);
    const cur = SKILL_LEVELS[lvl];
    const next = SKILL_LEVELS[Math.min(10, lvl + 1)];
    const pct = lvl >= 10 ? 100 : (S.skills[k] - cur) / (next - cur) * 100;
    return `<div class="skill">
      <div class="skill-head"><b>${sk.icon} ${sk.name}</b><span>Nível ${lvl}${lvl >= 10 ? ' (máx.)' : ''}</span></div>
      <div class="progress small"><div style="width:${pct}%"></div></div>
      <div class="chips">${COURSES.map(c => `<button class="chip-btn" data-action="study" data-skill="${k}" data-course="${c.id}"
        ${lock || lvl >= 10 || S.money < c.price || S.energy < c.energy ? 'disabled' : ''}>
        ${c.name} · ${c.price ? money(c.price) : 'grátis'} · ⚡${c.energy}</button>`).join('')}</div>
    </div>`;
  }).join('');

  // Ferramentas
  $('#engines').innerHTML = allEngines().map(e => {
    const owned = S.engines.includes(e.id);
    const problem = owned ? engineProblem(e) : null;
    let action;
    if (owned) action = '<span class="chip ok">✔ Você sabe usar</span>';
    else if (skillLevel('code') < e.code) action = `<span class="chip">🔒 Programação ${e.code}</span>`;
    else action = `<button class="btn small" data-action="learn-engine" data-id="${e.id}" ${lock || S.money < e.price ? 'disabled' : ''}>Aprender ${e.price ? money(e.price) : 'grátis'}</button>`;
    return `<div class="item">
      <div class="slot-info">
        <div class="slot-name">${e.name} ${e.is3d ? '<span class="chip mini">3D</span>' : '<span class="chip mini">2D</span>'}</div>
        <div class="muted">Linguagem: ${e.lang} · Qualidade máx. ${'★'.repeat(Math.round(e.mult * 4))}</div>
        ${problem ? `<div class="muted txt-bad">⚠️ ${problem}</div>` : ''}
      </div>
      ${action}
    </div>`;
  }).join('');

  renderReview();
  $('#project').hidden = !!dev;
  $('#dev-running').hidden = !dev;
  if (!dev) renderProject(lock);
  renderMyGames();
}

function renderProject(lock) {
  const P = S.project;
  const el = $('#project');

  if (!P) {
    const hadFocus = document.activeElement && document.activeElement.id === 'draft-name';
    const e = engineById(draft.engine);
    const g = GENRE_BY_ID[draft.genre];
    const f = normFocus(draft.focus);
    const chip = (key, val, label, disabled = false, title = '') =>
      `<button class="chip-btn ${draft[key] === val ? 'active' : ''}" data-action="draft" data-key="${key}" data-val="${val}"
        ${disabled ? 'disabled' : ''} ${title ? `title="${title}"` : ''}>${label}</button>`;

    el.innerHTML = `<h2>🧪 Criar um jogo novo</h2>
      <label class="field"><span>Nome do jogo</span>
        <span class="row"><input id="draft-name" maxlength="30" placeholder="Ex.: ${esc(DEV_NAME_IDEAS[0])}" value="${esc(draft.name)}">
        <button class="btn small ghost" data-action="draft-random-name" title="Sortear nome">🎲</button></span>
      </label>
      <h3>Ferramenta</h3>
      <div class="chips">${S.engines.map(id => chip('engine', id, engineById(id).name)).join('')}</div>
      <h3>Gênero</h3>
      <div class="chips">${GENRES.map(x => chip('genre', x.id, `${x.emoji} ${x.name}`, x.is3d && !e.is3d, x.is3d && !e.is3d ? 'Precisa de uma ferramenta 3D' : '')).join('')}</div>
      <h3>Tema</h3>
      <div class="chips">${THEMES.map(t => chip('theme', t.id, `${t.emoji} ${t.name}`)).join('')}</div>
      <h3>Tamanho</h3>
      <div class="chips">${SIZES.map(s => chip('size', s.id, `${s.name} (${s.target} pts)`, skillLevel('code') < s.code,
        skillLevel('code') < s.code ? `Precisa de Programação nível ${s.code}` : '')).join('')}</div>
      <h3>Foco do desenvolvimento</h3>
      <div class="chips">${FOCUS_PRESETS.map(p => `<button class="chip-btn" data-action="draft-preset" data-id="${p.id}">${p.name}</button>`).join('')}</div>
      <div class="sliders">${Object.entries(SKILLS).map(([k, sk]) => `<label class="slider">
        <span>${sk.icon} ${k === 'code' ? 'Gameplay' : k === 'art' ? 'Gráficos' : 'Som'}</span>
        <input type="range" min="0" max="100" value="${draft.focus[k]}" data-focus="${k}">
        <b id="focus-${k}">${Math.round(f[k] * 100)}%</b></label>`).join('')}</div>
      <p class="muted">💡 Dica para ${g.name}: ${g.hint}</p>
      <button class="btn big" data-action="start-project" ${lock}>🚀 Começar projeto</button>`;

    if (hadFocus) {
      const input = $('#draft-name');
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
    return;
  }

  const e = engineById(P.engine);
  const g = GENRE_BY_ID[P.genre];
  const t = THEME_BY_ID[P.theme];
  const done = P.progress >= P.target;
  const ready = S.pcOn && checkBuild().ok;
  const problem = engineProblem(e);
  const hours = (mode, list) => list.map(h =>
    `<button class="chip-btn" data-action="dev-session" data-mode="${mode}" data-h="${h}"
      ${lock || !ready || problem || S.energy < h * ENERGY_PER_HOUR || (mode === 'fix' && P.bugs < 1) ? 'disabled' : ''}>
      ${h}h (⚡${h * ENERGY_PER_HOUR})</button>`).join('');

  el.innerHTML = `<div class="card-head"><h2>🧪 ${esc(P.name)}</h2>
      <button class="btn small ghost" data-action="cancel-project" ${lock}>Abandonar</button></div>
    <p class="muted">${g.emoji} ${g.name} de ${t.emoji} ${t.name} · ${e.name} · ${SIZE_BY_ID[P.size].name}</p>
    <div class="progress"><div style="width:${P.progress / P.target * 100}%"></div></div>
    <div class="specs">
      <div><span class="muted">Progresso</span><b>${Math.floor(P.progress)} / ${P.target}</b></div>
      <div><span class="muted">Bugs</span><b class="${P.bugs >= 1 ? 'txt-bad' : 'txt-good'}">🐛 ${Math.ceil(P.bugs)}</b></div>
      <div><span class="muted">Ideias</span><b>💡 ${Math.round(P.bonus / 0.03)}</b></div>
    </div>
    ${!ready ? '<p class="warning-text">⚠️ Ligue o PC na aba Montagem para programar.</p>' : ''}
    ${problem ? `<p class="warning-text">⚠️ ${problem}</p>` : ''}
    ${done ? '' : `<h3>Programar</h3><div class="chips">${hours('dev', [1, 2, 4])}</div>`}
    <h3>Corrigir bugs</h3><div class="chips">${hours('fix', [1, 2])}</div>
    ${done ? `<h3>Preço</h3>
      <div class="chips">${PRICES.map(p => `<button class="chip-btn ${draft.price === p.id ? 'active' : ''}" data-action="draft-price" data-id="${p.id}">${p.name}</button>`).join('')}</div>
      <p class="muted">Jogo grátis vende muito mais cópias e traz seguidores, mas cada cópia rende pouco.</p>
      <button class="btn big launch" data-action="launch" ${lock}>🎉 Lançar jogo</button>` : ''}`;
}

function renderReview() {
  const R = S.lastReview;
  $('#review').hidden = !R;
  if (!R) return;
  const cls = R.score < 4 ? 'q-bad' : R.score < 6.5 ? 'q-low' : R.score < 8.5 ? 'q-ok' : 'q-good';
  $('#review').innerHTML = `<div class="card-head"><h2>📰 A crítica avaliou ${esc(R.name)}</h2>
      <button class="btn small ghost" data-action="close-review">Fechar</button></div>
    <div class="review-top"><div class="big-score ${cls}">${R.score.toFixed(1)}</div>
      <div>Primeiro dia: <b>${num(R.units)}</b> cópias · <b class="txt-good">${money(R.revenue)}</b></div></div>
    <div class="reviews">${R.reviews.map(r => `<div class="review"><b>${r.s}/10</b><span class="muted">${r.outlet}</span><em>"${r.quote}"</em></div>`).join('')}</div>
    ${R.notes.length ? `<ul class="notes">${R.notes.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}`;
}

function renderMyGames() {
  $('#my-games').innerHTML = S.myGames.length
    ? S.myGames.slice().reverse().map(g => {
      const q = g.score < 4 ? 'q-bad' : g.score < 6.5 ? 'q-low' : g.score < 8.5 ? 'q-ok' : 'q-good';
      return `<div class="item">
        ${gameCover(ownGameForLive(g), 'mini')}
        <div class="slot-info">
          <div class="slot-name">${esc(g.name)} ${g.ai ? '<span class="chip mini">🤖 IA</span>' : ''} ${g.hype > 0.6 ? '<span class="chip mini">🔥 hype</span>' : ''}</div>
          <div class="muted">${GENRE_BY_ID[g.genre].name} de ${THEME_BY_ID[g.theme].name} · ${engineById(g.engine).name} · ${PRICE_BY_ID[g.price].name} · lançado no dia ${g.day}</div>
          <div class="muted">${num(g.sold)} cópias · ${money(g.revenue)} no total · ontem: ${num(g.lastSales)}</div>
        </div>
        <div class="badge ${q}">${g.score.toFixed(1)}</div>
      </div>`;
    }).join('') + '<p class="muted">Dica: faça live dos seus próprios jogos para dar hype e vender mais!</p>'
    : '<p class="muted">Você ainda não lançou nenhum jogo.</p>';
}

function updateFocusLabels() {
  const f = normFocus(draft.focus);
  for (const k in SKILLS) {
    const el = document.getElementById('focus-' + k);
    if (el) el.textContent = Math.round(f[k] * 100) + '%';
  }
}

function handleDevAction(d) {
  switch (d.action) {
    case 'study': return study(d.skill, d.course);
    case 'learn-engine': return learnEngine(d.id);
    case 'draft':
      draft[d.key] = d.val;
      if (GENRE_BY_ID[draft.genre].is3d && !engineById(draft.engine).is3d) draft.genre = 'plataforma';
      if (skillLevel('code') < SIZE_BY_ID[draft.size].code) draft.size = 'pequeno';
      return renderDev();
    case 'draft-preset':
      draft.focus = { ...FOCUS_PRESETS.find(p => p.id === d.id).f };
      return renderDev();
    case 'draft-random-name':
      draft.name = pick(DEV_NAME_IDEAS);
      return renderDev();
    case 'draft-price':
      draft.price = d.id;
      return renderDev();
    case 'start-project': return startProject();
    case 'dev-session': return startDevSession(d.mode, Number(d.h));
    case 'stop-dev': return endDevSession();
    case 'launch': return launchGame();
    case 'cancel-project':
      if (!busy() && confirm('Abandonar este projeto? Todo o progresso dele será perdido.')) {
        S.project = null;
        changed();
      }
      return;
    case 'close-review':
      S.lastReview = null;
      return changed();
  }
}

document.addEventListener('input', e => {
  if (e.target.id === 'draft-name') draft.name = e.target.value;
  if (e.target.dataset.focus) {
    draft.focus[e.target.dataset.focus] = Number(e.target.value);
    updateFocusLabels();
  }
});
