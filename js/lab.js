'use strict';

// Fase 3: IA criadora de jogos. Fase 4: sua linguagem de programação e sua própria IA.
// Usa o estado e as funções de game.js e dev.js.

const LAB_TICK_MS = 450;

let lab = null;   // sessão em andamento: treino, geração de jogo ou linguagem (não é salva)
const labDraft = { aiName: '', genGenre: 'surpresa', genTheme: 'surpresa', langName: '', langStyle: 'pt', langTyping: 'dinamica', brainName: '', question: '' };
const brainChat = [];

// Nomes digitados viram texto simples, sem caracteres que quebrem o HTML.
const cleanName = (str, fallback) => (String(str).replace(/[<>&"'`]/g, '').trim() || fallback).slice(0, 24);

function levelFrom(xp, table) {
  let lvl = 0;
  while (lvl < 10 && xp >= table[lvl + 1]) lvl++;
  return lvl;
}

const aiLevel = () => (S.ai ? levelFrom(S.ai.xp, AI_LEVELS) : 0);
const brainLevel = () => (S.brain ? levelFrom(S.brain.xp, BRAIN_LEVELS) : 0);

function checkLabUnlocks() {
  if (!S.phase3 && S.phase2 && S.myGames.length >= PHASE3_GAMES && skillLevel('code') >= PHASE3_CODE) {
    S.phase3 = true;
    toast('🤖 Fase 3 desbloqueada! Abra a aba IA e crie sua IA criadora de jogos.', 'goal');
  }
  if (!S.phase4 && S.phase3 && aiLevel() >= PHASE4_AI) {
    S.phase4 = true;
    toast('🧬 Fase 4 desbloqueada! Abra a aba Lab: sua própria linguagem e sua própria IA.', 'goal');
  }
  if (!S.finished && brainLevel() >= 10 && S.lang && S.lang.devs >= FINISH_DEVS) {
    S.finished = true;
    toast('🏆 VOCÊ ZEROU O INFOREAL! 🏆', 'goal');
  }
}

/* ---------- Fase 3: IA criadora de jogos ---------- */

function createAi() {
  if (busy() || S.ai || !S.phase3) return;
  if (S.money < AI_LAB_COST) return toast('Dinheiro insuficiente para montar o laboratório.', 'bad');
  S.money -= AI_LAB_COST;
  S.ai = { name: cleanName(labDraft.aiName, pick(AI_NAME_IDEAS)), xp: 0, epoch: 0, cloud: false, auto: false, autoPrice: 'p10', made: 0 };
  toast(`🤖 ${S.ai.name} nasceu! Agora ela precisa treinar.`, 'goal');
  changed();
}

function aiGenCost() {
  return 500 + 500 * aiLevel();
}

function bestEngineId(need3d) {
  const known = allEngines().filter(e => S.engines.includes(e.id) && (!need3d || e.is3d));
  if (!known.length) return 'scratch';
  return known.reduce((a, b) => (b.mult > a.mult ? b : a)).id;
}

// A IA escolhe gênero e tema. Quanto mais esperta, mais acerta as combinações que o público ama.
function aiPickIdea(genre = 'surpresa', theme = 'surpresa') {
  const lvl = aiLevel();
  if (genre === 'surpresa' && theme === 'surpresa' && Math.random() < lvl / 10) {
    const good = Object.entries(COMBOS).filter(([, v]) => v > 1).map(([k]) => k.split('+'));
    return pick(good);
  }
  return [
    genre === 'surpresa' ? pick(GENRES).id : genre,
    theme === 'surpresa' ? pick(THEMES).id : theme,
  ];
}

function aiGameName(themeId) {
  const t = THEME_BY_ID[themeId].name;
  const list = Math.random() < 0.4 - aiLevel() * 0.04 ? AI_BAD_TITLES : AI_TITLES;
  return pick(list).replaceAll('{t}', t);
}

function makeAiProject(genre, theme) {
  const lvl = aiLevel();
  const size = lvl >= 7 ? 'grande' : lvl >= 4 ? 'medio' : 'pequeno';
  const target = SIZE_BY_ID[size].target;
  return {
    name: aiGameName(theme),
    engine: bestEngineId(GENRE_BY_ID[genre].is3d),
    genre, theme, size,
    focus: { ...GENRE_BY_ID[genre].w },
    progress: target, target,
    bugs: target * rand(0.05, 0.35) * (1 - lvl / 12),   // "alucinações" da IA
    bonus: lvl * 0.01,
    ai: true, aiLevel: lvl, aiName: S.ai.name,
  };
}

function generateGame() {
  if (busy() || !S.ai || S.project) return;
  const cost = aiGenCost();
  if (S.money < cost) return toast('Dinheiro insuficiente para rodar a IA.', 'bad');
  if (S.energy < 10) return toast('Você está cansado demais. Vá dormir! 😴', 'bad');
  S.money -= cost;
  S.energy -= 10;
  const [genre, theme] = aiPickIdea(labDraft.genGenre, labDraft.genTheme);
  startLab('gen', GEN_LINES.length, { genre, theme });
}

/* ---------- Fase 4: linguagem de programação ---------- */

function langExt(name) {
  return name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '').slice(0, 4) || 'lang';
}

function langSample(name, style, typing) {
  const st = LANG_STYLES[style];
  const w = st.w;
  const t = type => (typing === 'estatica' ? `: ${type}` : '');
  return [
    `${st.comment} Olá mundo em ${name}`,
    `${w.var} nome${t('texto')} = "Mundo"`,
    `${w.fn} saudar(quem${t('texto')}) {`,
    `  ${w.print}("Olá, " + quem + "!")`,
    '}',
    `${w.loop} (vidas > 0) {`,
    `  ${w.if} (inimigo.perto) { pular() } ${w.else} { correr() }`,
    '}',
    'saudar(nome)',
  ].join('\n');
}

function myLangEngine() {
  return {
    id: 'mylang', name: S.lang ? S.lang.name : 'Minha linguagem', lang: 'mylang', code: 0, price: 0, mult: 1.45, is3d: true,
    pc: { cpu: 0, gpu: 0, ram: 4 }, play: { cpu: 10, gpu: 10, ram: 8 },
  };
}

// Ensina o editor da aba Dev a mostrar código na sua linguagem.
function registerLang() {
  if (!S.lang) return;
  CODE_LINES.mylang = langSample(S.lang.name, S.lang.style, S.lang.typing).split('\n');
  EDITOR_FILES.mylang = 'main.' + langExt(S.lang.name);
  COMMENT.mylang = LANG_STYLES[S.lang.style].comment;
}

function createLang() {
  if (busy() || S.lang || !S.phase4) return;
  S.lang = {
    name: cleanName(labDraft.langName, 'Capivara++'), style: labDraft.langStyle, typing: labDraft.langTyping,
    stages: LANG_STAGES.map(() => 0), released: false, devs: 0, day: null,
  };
  registerLang();
  toast(`🧬 A linguagem ${S.lang.name} começou a nascer!`, 'goal');
  changed();
}

function langStage() {
  return S.lang.stages.findIndex((v, i) => v < LANG_STAGES[i].target);
}

function releaseLang() {
  if (busy() || !S.lang || S.lang.released || langStage() !== -1) return;
  S.lang.released = true;
  S.lang.day = S.day;
  S.lang.devs = 500;
  if (!S.engines.includes('mylang')) S.engines.push('mylang');
  registerLang();
  toast(`🚀 ${S.lang.name} foi lançada! Ela já aparece como ferramenta na aba Dev.`, 'goal');
  changed();
}

function hackathon() {
  if (busy() || !S.lang || !S.lang.released) return;
  if (S.money < HACKATHON_COST) return toast('Dinheiro insuficiente para o hackathon.', 'bad');
  if (S.energy < 20) return toast('Você está cansado demais. Vá dormir! 😴', 'bad');
  S.money -= HACKATHON_COST;
  S.energy -= 20;
  const gained = Math.round(3000 + S.lang.devs * 0.08);
  S.lang.devs += gained;
  toast(`🏆 Hackathon de ${S.lang.name}: +${num(gained)} devs!`, 'goal');
  changed();
}

/* ---------- Fase 4: sua própria IA ---------- */

function createBrain() {
  if (busy() || S.brain || !S.lang || !S.lang.released) return;
  if (S.money < BRAIN_COST) return toast('Dinheiro insuficiente para o supercomputador.', 'bad');
  S.money -= BRAIN_COST;
  S.brain = { name: cleanName(labDraft.brainName, pick(BRAIN_NAME_IDEAS)), xp: 0, epoch: 0, cloud: false, released: false, users: 0 };
  toast(`🧠 ${S.brain.name} foi criada! Hora de treinar.`, 'goal');
  changed();
}

function releaseBrain() {
  if (busy() || !S.brain || S.brain.released || brainLevel() < 3) return;
  S.brain.released = true;
  S.brain.users = 1000;
  toast(`🌍 ${S.brain.name} foi lançada para o público!`, 'goal');
  changed();
}

function askBrain() {
  if (!S.brain) return;
  const q = labDraft.question.trim().slice(0, 140);
  if (!q) return;
  const lvl = brainLevel();
  let answer;
  if (/capivara/i.test(q)) answer = '🦫 Capivaras são a melhor espécie do planeta. Isso não é opinião, é fato.';
  else answer = pick(BRAIN_ANSWERS[lvl <= 2 ? 0 : lvl <= 5 ? 1 : lvl <= 8 ? 2 : 3]);
  brainChat.push({ q, a: answer });
  if (brainChat.length > 6) brainChat.shift();
  labDraft.question = '';
  renderLab();
}

/* ---------- Sessões (treino, geração, linguagem) ---------- */

function startTraining(kind, hours) {
  const obj = kind === 'ai' ? S.ai : S.brain;
  if (busy() || !obj) return;
  const b = checkBuild();
  if (!S.pcOn || !b.ok) return toast('Ligue o PC na aba Montagem para treinar!', 'bad');
  const table = kind === 'ai' ? AI_LEVELS : BRAIN_LEVELS;
  if (levelFrom(obj.xp, table) >= 10) return toast('Já está no nível máximo!');
  const energy = hours * ENERGY_PER_HOUR;
  const cloud = obj.cloud ? CLOUD_PRICE[kind] * hours : 0;
  if (S.energy < energy) return toast('Você está cansado demais. Vá dormir! 😴', 'bad');
  if (S.money < cloud) return toast('Dinheiro insuficiente para alugar GPUs.', 'bad');
  S.energy -= energy;
  S.money -= cloud;
  startLab(kind, hours * TICKS_PER_HOUR);
}

function startLangWork(hours) {
  if (busy() || !S.lang || langStage() === -1) return;
  const b = checkBuild();
  if (!S.pcOn || !b.ok) return toast('Ligue o PC na aba Montagem para programar!', 'bad');
  const energy = hours * ENERGY_PER_HOUR;
  if (S.energy < energy) return toast('Você está cansado demais. Vá dormir! 😴', 'bad');
  S.energy -= energy;
  startLab('lang', hours * TICKS_PER_HOUR);
}

function startLab(kind, total, extra = {}) {
  lab = { kind, tick: 0, total, lines: [], losses: [], ...extra };
  const panel = labPanel();
  $(`#${panel}-chart`).hidden = !(kind === 'ai' || kind === 'brain');
  if (kind === 'gen') lab.lines.push(`> ${S.ai.name}, crie um jogo!`);
  if (kind === 'lang') lab.lines.push(`$ build ${S.lang.name}`);
  if (kind === 'ai' || kind === 'brain') lab.lines.push(`$ treinar ${(kind === 'ai' ? S.ai : S.brain).name}${(kind === 'ai' ? S.ai : S.brain).cloud ? ' --gpus-na-nuvem' : ''}`);
  render();
  updateLabView();
  lab.timer = setInterval(labTick, LAB_TICK_MS);
}

function labPanel() {
  return lab && (lab.kind === 'ai' || lab.kind === 'gen') ? 'ai' : 'lab';
}

function labTick() {
  lab.tick++;
  const b = checkBuild();

  if (lab.kind === 'ai' || lab.kind === 'brain') {
    const isAi = lab.kind === 'ai';
    const obj = isAi ? S.ai : S.brain;
    const table = isAi ? AI_LEVELS : BRAIN_LEVELS;
    const before = levelFrom(obj.xp, table);
    let pts = (b.gpu / 20) * (1 + b.ram / 64) * 2 * (obj.cloud ? 3 : 1) * rand(0.8, 1.2);
    if (!isAi) pts *= (1 + aiLevel() * 0.1) * (S.lang && S.lang.released ? 1.2 : 1);
    obj.xp += pts;
    obj.epoch++;
    const loss = 2.4 * Math.exp(-obj.xp / (isAi ? 3000 : 12000)) + 0.05 + rand(0, 0.12);
    lab.losses.push(loss);
    lab.lines.push(`época ${obj.epoch} · loss ${loss.toFixed(3)} · +${Math.round(pts)} tokens`);
    const after = levelFrom(obj.xp, table);
    if (after > before) {
      lab.lines.push(`★ ${obj.name} subiu para o nível ${after}!`);
      toast(`⬆️ ${obj.name} subiu para o nível ${after}!`, 'goal');
      checkLabUnlocks();
    }
    if (after >= 10) return endLab();
  } else if (lab.kind === 'lang') {
    const i = langStage();
    const pts = (1 + skillLevel('code') * 0.3) * (1 + b.cpu / 60) * rand(0.8, 1.2);
    const st = LANG_STAGES[i];
    const w = pick(Object.values(LANG_STYLES[S.lang.style].w));
    const ext = langExt(S.lang.name);
    lab.lines.push([
      `token reconhecido: "${w}"`, `árvore: ${w} → Expressão ✔`, `compilando main.${ext} → x86_64 ✔`,
      `biblioteca: jogos.${ext} ✔`, `docs: aprenda "${w}" em 5 minutos ✔`][i]);
    S.lang.stages[i] = Math.min(st.target, S.lang.stages[i] + pts);
    S.skills.code += 0.3;
    if (S.lang.stages[i] >= st.target) {
      lab.lines.push(`✅ ${st.name} concluído!`);
      toast(`✅ ${st.name} de ${S.lang.name} concluído!`, 'goal');
      if (langStage() === -1) {
        lab.lines.push('🎉 A linguagem está pronta para ser lançada!');
        return endLab();
      }
    }
  } else if (lab.kind === 'gen') {
    lab.lines.push(GEN_LINES[lab.tick - 1]);
    if (lab.tick >= lab.total) {
      S.project = makeAiProject(lab.genre, lab.theme);
      S.ai.made++;
      toast(`✨ ${S.ai.name} criou "${S.project.name}"! Corrija os bugs e lance na aba Dev.`, 'goal');
      endLab(false);
      showTab('dev');
      return;
    }
  }

  if (lab.tick >= lab.total) endLab();
  else updateLabView();
}

function endLab(refund = true) {
  if (!lab) return;
  clearInterval(lab.timer);
  if (refund && lab.kind !== 'gen') {
    S.energy = Math.min(100, S.energy + Math.floor((lab.total - lab.tick) / TICKS_PER_HOUR * ENERGY_PER_HOUR));
  }
  lab = null;
  changed();
}

function updateLabView() {
  const p = labPanel();
  $(`#${p}-term`).textContent = lab.lines.slice(-12).join('\n');
  $(`#${p}-bar`).style.width = (lab.tick / lab.total * 100) + '%';
  if (lab.losses.length > 1) {
    const max = Math.max(...lab.losses);
    const min = Math.min(...lab.losses) * 0.9;
    const pts = lab.losses.map((l, i) => `${(i / (lab.losses.length - 1)) * 300},${95 - ((max - l) / (max - min || 1)) * 85}`).join(' ');
    $(`#${p}-chart`).innerHTML = `<polyline class="loss-line" points="${pts}"/>`;
  } else {
    $(`#${p}-chart`).innerHTML = '';
  }
  let status = '';
  if (lab.kind === 'ai') status = `${S.ai.name} · nível ${aiLevel()} · ${num(S.ai.xp)} tokens`;
  if (lab.kind === 'brain') status = `${S.brain.name} · ${BRAIN_PARAMS[brainLevel()]} parâmetros · ${num(S.brain.xp)} tokens`;
  if (lab.kind === 'lang') status = `${S.lang.name} · ${LANG_STAGES[Math.max(0, langStage())].name}`;
  if (lab.kind === 'gen') status = `${S.ai.name} está criando um jogo...`;
  $(`#${p}-status`).textContent = status;
  renderHeader();
}

/* ---------- Todo dia, ao dormir ---------- */

function labDaily() {
  if (S.ai && S.ai.auto && aiLevel() >= AI_AUTO_LEVEL) {
    const cost = aiGenCost();
    if (S.money >= cost) {
      S.money -= cost;
      const [genre, theme] = aiPickIdea();
      const { game } = releaseProject(makeAiProject(genre, theme), S.ai.autoPrice);
      S.ai.made++;
      toast(`🤖 Enquanto você dormia, ${S.ai.name} lançou "${game.name}" (nota ${game.score.toFixed(1)})`);
    }
  }
  if (S.lang && S.lang.released) {
    const quality = 1 + skillLevel('code') * 0.05 + (S.brain && S.brain.released ? 0.3 : 0);
    const gained = Math.round((300 + S.lang.devs * 0.2) * quality * rand(0.8, 1.2) / (1 + S.lang.devs / 2e6));
    S.lang.devs += gained;
    const income = S.lang.devs * 0.03;
    S.money += income;
    toast(`🧬 ${S.lang.name}: +${num(gained)} devs (+${money(income)} em cursos e patrocínios)`);
  }
  if (S.brain && S.brain.released) {
    const lvl = brainLevel();
    const gained = Math.round((1000 * lvl * lvl + S.brain.users * 0.1) * rand(0.8, 1.2) / (1 + S.brain.users / 5e7));
    S.brain.users += gained;
    const income = S.brain.users * 0.08;
    S.money += income;
    toast(`🧠 ${S.brain.name}: +${num(gained)} usuários (+${money(income)} em assinaturas)`);
  }
}

/* ---------- Interface ---------- */

function trainButtons(kind, obj, table) {
  const maxed = levelFrom(obj.xp, table) >= 10;
  const lock = busy() || maxed || !(S.pcOn && checkBuild().ok);
  return [1, 2, 4].map(h => `<button class="chip-btn" data-action="train" data-kind="${kind}" data-h="${h}"
    ${lock || S.energy < h * ENERGY_PER_HOUR || (obj.cloud && S.money < CLOUD_PRICE[kind] * h) ? 'disabled' : ''}>
    Treinar ${h}h (⚡${h * ENERGY_PER_HOUR}${obj.cloud ? ` · ${money(CLOUD_PRICE[kind] * h)}` : ''})</button>`).join('');
}

function cloudToggle(kind, obj) {
  return `<label class="toggle"><input type="checkbox" data-toggle="${kind}-cloud" ${obj.cloud ? 'checked' : ''} ${busy() ? 'disabled' : ''}>
    <span>☁️ Alugar GPUs na nuvem (3x mais rápido, ${money(CLOUD_PRICE[kind])}/hora)</span></label>`;
}

function levelBar(xp, table) {
  const lvl = levelFrom(xp, table);
  const pct = lvl >= 10 ? 100 : (xp - table[lvl]) / (table[lvl + 1] - table[lvl]) * 100;
  return `<div class="progress small"><div style="width:${pct}%"></div></div>`;
}

function renderLab() {
  registerLang();
  $('.tab[data-tab=ai]').textContent = S.phase3 ? '🤖 IA' : '🔒 IA';
  $('.tab[data-tab=lab]').textContent = S.phase4 ? '🧬 Lab' : '🔒 Lab';
  const focused = document.activeElement && document.activeElement.id;

  // Aviso da Fase 3 na aba Dev
  $('#phase3-teaser').innerHTML = S.phase3
    ? '<h2>🤖 Fase 3 liberada!</h2><p class="muted">Abra a aba <a href="#" data-action="goto" data-tab="ai">IA</a> e crie sua IA criadora de jogos.</p>'
    : `<h2>🤖 IA criadora de jogos (Fase 3)</h2>
      <p class="muted">Libera com ${PHASE3_GAMES} jogos lançados (${Math.min(S.myGames.length, PHASE3_GAMES)}/${PHASE3_GAMES})
      e Programação nível ${PHASE3_CODE} (${Math.min(skillLevel('code'), PHASE3_CODE)}/${PHASE3_CODE}).</p>`;

  renderAiTab();
  renderLabTab();

  if (focused) {
    const el = document.getElementById(focused);
    if (el && el.tagName === 'INPUT' && el.type === 'text') {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }
}

function renderAiTab() {
  $('#ai-locked').hidden = S.phase3;
  $('#ai-content').hidden = !S.phase3;
  if (!S.phase3) {
    $('#ai-locked-progress').textContent =
      `Jogos lançados: ${Math.min(S.myGames.length, PHASE3_GAMES)}/${PHASE3_GAMES} · Programação: ${Math.min(skillLevel('code'), PHASE3_CODE)}/${PHASE3_CODE}`;
    return;
  }
  const running = lab && (lab.kind === 'ai' || lab.kind === 'gen');
  $('#ai-session').hidden = !running;

  if (!S.ai) {
    $('#ai-main').innerHTML = `<h2>🤖 Criar sua IA criadora de jogos</h2>
      <p>Monte um laboratório e treine uma IA que cria jogos sozinha. Quanto mais você treinar, melhores os jogos.
      O treino usa a sua <b>placa de vídeo</b> e a <b>memória RAM</b>.</p>
      <label class="field"><span>Nome da IA</span>
        <input type="text" id="ai-name" maxlength="24" placeholder="Ex.: ${AI_NAME_IDEAS[0]}" value="${esc(labDraft.aiName)}"></label>
      <button class="btn big" data-action="create-ai" ${busy() || S.money < AI_LAB_COST ? 'disabled' : ''}>🧪 Montar laboratório (${money(AI_LAB_COST)})</button>`;
    $('#ai-gen').hidden = true;
    $('#ai-auto').hidden = true;
    return;
  }

  const lvl = aiLevel();
  const b = checkBuild();
  const speed = (b.gpu / 20) * (1 + b.ram / 64) * 2 * (S.ai.cloud ? 3 : 1);
  $('#ai-main').innerHTML = `<div class="card-head"><h2>🤖 ${S.ai.name}</h2><span class="badge q-ok">Nível ${lvl}/10</span></div>
    ${levelBar(S.ai.xp, AI_LEVELS)}
    <div class="specs">
      <div><span class="muted">Treino</span><b>${num(S.ai.xp)} tokens</b></div>
      <div><span class="muted">Velocidade</span><b>~${Math.round(speed)} / 10 min</b></div>
      <div><span class="muted">Jogos criados</span><b>${S.ai.made}</b></div>
    </div>
    ${!(S.pcOn && b.ok) ? '<p class="warning-text">⚠️ Ligue o PC na aba Montagem para treinar.</p>' : ''}
    <h3>Treinar</h3>
    ${cloudToggle('ai', S.ai)}
    <div class="chips">${trainButtons('ai', S.ai, AI_LEVELS)}</div>
    <p class="muted">Dica: placa de vídeo mais forte e mais RAM = treino mais rápido. Nível ${PHASE4_AI} libera a Fase 4.</p>`;

  const chip = (key, val, label) =>
    `<button class="chip-btn ${labDraft[key] === val ? 'active' : ''}" data-action="lab-draft" data-key="${key}" data-val="${val}">${label}</button>`;
  $('#ai-gen').hidden = false;
  $('#ai-gen').innerHTML = `<h2>✨ Pedir um jogo para a IA</h2>
    <h3>Gênero</h3><div class="chips">${chip('genGenre', 'surpresa', '🎲 Surpresa')}${GENRES.map(g => chip('genGenre', g.id, `${g.emoji} ${g.name}`)).join('')}</div>
    <h3>Tema</h3><div class="chips">${chip('genTheme', 'surpresa', '🎲 Surpresa')}${THEMES.map(t => chip('genTheme', t.id, `${t.emoji} ${t.name}`)).join('')}</div>
    <p class="muted">No nível ${lvl}, a IA faz jogos ${lvl >= 7 ? 'grandes' : lvl >= 4 ? 'médios' : 'pequenos'} e ainda comete umas "alucinações" (bugs).
    ${lvl >= 3 ? 'Com Surpresa, ela tenta acertar combinações que o público ama.' : ''}</p>
    ${S.project ? '<p class="warning-text">⚠️ Termine ou abandone o projeto atual na aba Dev primeiro.</p>' : ''}
    <button class="btn big" data-action="generate-game" ${busy() || S.project || S.money < aiGenCost() || S.energy < 10 ? 'disabled' : ''}>
      ✨ Gerar jogo (${money(aiGenCost())} · ⚡10)</button>`;

  $('#ai-auto').hidden = false;
  $('#ai-auto').innerHTML = lvl < AI_AUTO_LEVEL
    ? `<h2>🌙 Modo automático</h2><p class="muted">🔒 No nível ${AI_AUTO_LEVEL}, a IA passa a criar e lançar um jogo por noite sozinha.</p>`
    : `<h2>🌙 Modo automático</h2>
      <label class="toggle"><input type="checkbox" data-toggle="ai-auto" ${S.ai.auto ? 'checked' : ''}>
        <span>Todo dia, enquanto você dorme, ${S.ai.name} cria e lança um jogo (${money(aiGenCost())} por jogo)</span></label>
      <h3>Preço dos jogos automáticos</h3>
      <div class="chips">${PRICES.map(p => `<button class="chip-btn ${S.ai.autoPrice === p.id ? 'active' : ''}" data-action="ai-price" data-id="${p.id}">${p.name}</button>`).join('')}</div>`;
}

function renderLabTab() {
  $('#lab-locked').hidden = S.phase4;
  $('#lab-content').hidden = !S.phase4;
  if (!S.phase4) {
    $('#lab-locked-progress').textContent = S.phase3
      ? `Nível da IA: ${Math.min(aiLevel(), PHASE4_AI)}/${PHASE4_AI}`
      : 'Primeiro, desbloqueie a Fase 3.';
    return;
  }
  const running = lab && (lab.kind === 'lang' || lab.kind === 'brain');
  $('#lab-session').hidden = !running;
  const lock = busy() ? 'disabled' : '';
  const pcReady = S.pcOn && checkBuild().ok;

  // Final do jogo
  $('#lab-end').hidden = !S.finished;
  if (S.finished) {
    $('#lab-end').innerHTML = `<div class="end-trophy">🏆</div><h2>Você zerou o Inforeal!</h2>
      <p>De um PC com fonte genérica até ter sua própria linguagem e sua própria IA. Que jornada!</p>
      <div class="specs">
        <div><span class="muted">Dias</span><b>${S.day}</b></div>
        <div><span class="muted">Seguidores</span><b>${num(S.followers)}</b></div>
        <div><span class="muted">Jogos lançados</span><b>${S.myGames.length}</b></div>
        <div><span class="muted">Devs na ${S.lang.name}</span><b>${num(S.lang.devs)}</b></div>
        <div><span class="muted">Usuários da ${S.brain.name}</span><b>${num(S.brain.users)}</b></div>
      </div>
      <p class="muted">Você pode continuar jogando, ou apagar o progresso na aba Objetivos e começar de novo.</p>`;
  }

  // Linguagem de programação
  const L = S.lang;
  if (!L) {
    const chip = (key, val, label) =>
      `<button class="chip-btn ${labDraft[key] === val ? 'active' : ''}" data-action="lab-draft" data-key="${key}" data-val="${val}">${label}</button>`;
    $('#lang-card').innerHTML = `<h2>🧬 Criar sua linguagem de programação</h2>
      <label class="field"><span>Nome da linguagem</span>
        <input type="text" id="lang-name" maxlength="24" placeholder="Ex.: Capivara++" value="${esc(labDraft.langName)}"></label>
      <h3>Estilo das palavras</h3><div class="chips">${Object.entries(LANG_STYLES).map(([id, st]) => chip('langStyle', id, st.name)).join('')}</div>
      <h3>Tipos</h3><div class="chips">${Object.entries(LANG_TYPING).map(([id, n]) => chip('langTyping', id, n)).join('')}</div>
      <h3>Prévia</h3>
      <pre class="code-preview" id="lang-preview">${esc(langSample(cleanName(labDraft.langName, 'Capivara++'), labDraft.langStyle, labDraft.langTyping))}</pre>
      <button class="btn big" data-action="create-lang" ${lock}>🧬 Começar a criar</button>`;
  } else {
    const stage = langStage();
    $('#lang-card').innerHTML = `<div class="card-head"><h2>🧬 ${L.name}</h2>
        <span class="badge ${L.released ? 'q-good' : 'q-ok'}">${L.released ? 'Lançada' : 'Em desenvolvimento'}</span></div>
      <p class="muted">${LANG_STYLES[L.style].name} · ${LANG_TYPING[L.typing]} · arquivos .${langExt(L.name)}</p>
      <pre class="code-preview">${esc(langSample(L.name, L.style, L.typing))}</pre>
      <div class="stages">${LANG_STAGES.map((st, i) => `<div class="stage ${L.stages[i] >= st.target ? 'done' : i === stage ? 'current' : ''}">
        <div class="stage-head"><b>${L.stages[i] >= st.target ? '✅' : i === stage ? '⚙️' : '⬜'} ${st.name}</b>
          <span class="muted">${Math.floor(L.stages[i])}/${st.target}</span></div>
        <div class="muted">${st.desc}</div>
        <div class="progress small"><div style="width:${L.stages[i] / st.target * 100}%"></div></div></div>`).join('')}</div>
      ${stage !== -1 ? `
        ${!pcReady ? '<p class="warning-text">⚠️ Ligue o PC na aba Montagem para programar.</p>' : ''}
        <h3>Programar a linguagem</h3>
        <div class="chips">${[1, 2, 4].map(h => `<button class="chip-btn" data-action="lang-work" data-h="${h}"
          ${lock || !pcReady || S.energy < h * ENERGY_PER_HOUR ? 'disabled' : ''}>${h}h (⚡${h * ENERGY_PER_HOUR})</button>`).join('')}</div>
        <p class="muted">Programação alta e processador forte = mais rápido.</p>` : ''}
      ${stage === -1 && !L.released ? `<button class="btn big launch" data-action="release-lang" ${lock}>🚀 Lançar ${L.name} para o mundo</button>` : ''}
      ${L.released ? `<div class="specs">
          <div><span class="muted">Devs usando</span><b>${num(L.devs)}</b></div>
          <div><span class="muted">Renda por dia</span><b class="txt-good">${money(L.devs * 0.03)}</b></div>
          <div><span class="muted">Meta para zerar</span><b>${num(FINISH_DEVS)} devs</b></div>
        </div>
        <p class="muted">Sua linguagem virou uma ferramenta na aba Dev (a melhor de todas!). Os devs crescem todo dia.</p>
        <button class="btn" data-action="hackathon" ${lock || S.money < HACKATHON_COST || S.energy < 20 ? 'disabled' : ''}>
          🏆 Fazer um hackathon (${money(HACKATHON_COST)} · ⚡20)</button>` : ''}`;
  }

  // Sua própria IA
  const B = S.brain;
  if (!L || !L.released) {
    $('#brain-card').innerHTML = '<h2>🧠 Sua própria IA</h2><p class="muted">🔒 Lance sua linguagem primeiro. Sua IA vai ser escrita nela!</p>';
  } else if (!B) {
    $('#brain-card').innerHTML = `<h2>🧠 Criar sua própria IA</h2>
      <p>Uma IA de conversa, igual às famosas, só que sua. Ela precisa de um supercomputador e de muito treino.</p>
      <label class="field"><span>Nome da IA</span>
        <input type="text" id="brain-name" maxlength="24" placeholder="Ex.: ${BRAIN_NAME_IDEAS[0]}" value="${esc(labDraft.brainName)}"></label>
      <button class="btn big" data-action="create-brain" ${lock || S.money < BRAIN_COST ? 'disabled' : ''}>🖥️ Comprar supercomputador (${money(BRAIN_COST)})</button>`;
  } else {
    const lvl = brainLevel();
    $('#brain-card').innerHTML = `<div class="card-head"><h2>🧠 ${B.name}</h2><span class="badge q-ok">${BRAIN_PARAMS[lvl]} parâmetros · nível ${lvl}/10</span></div>
      ${levelBar(B.xp, BRAIN_LEVELS)}
      <div class="specs">
        <div><span class="muted">Treino</span><b>${num(B.xp)} tokens</b></div>
        ${B.released ? `<div><span class="muted">Usuários</span><b>${num(B.users)}</b></div>
        <div><span class="muted">Renda por dia</span><b class="txt-good">${money(B.users * 0.08)}</b></div>` : ''}
      </div>
      ${!pcReady ? '<p class="warning-text">⚠️ Ligue o PC na aba Montagem para treinar.</p>' : ''}
      <h3>Treinar</h3>
      ${cloudToggle('brain', B)}
      <div class="chips">${trainButtons('brain', B, BRAIN_LEVELS)}</div>
      <p class="muted">Sua IA de jogos (nível ${aiLevel()}) ajuda no treino${L.released ? ', e escrever na sua linguagem também' : ''}.</p>
      ${!B.released ? `<button class="btn launch" data-action="release-brain" ${lock || lvl < 3 ? 'disabled' : ''}>
        🌍 Lançar para o público ${lvl < 3 ? '(precisa do nível 3)' : ''}</button>` : ''}
      <h3>Converse com ${B.name}</h3>
      <div class="brain-chat">${brainChat.length ? brainChat.map(m => `<div class="msg me">${esc(m.q)}</div><div class="msg bot">${esc(m.a)}</div>`).join('')
        : '<p class="muted">Pergunte qualquer coisa. Quanto mais treinada, mais esperta ela fica.</p>'}</div>
      <div class="row"><input type="text" id="brain-q" maxlength="140" placeholder="Pergunte algo..." value="${esc(labDraft.question)}">
        <button class="btn small" data-action="ask-brain">Enviar</button></div>`;
  }
}

function handleLabAction(d) {
  switch (d.action) {
    case 'create-ai': return createAi();
    case 'train': return startTraining(d.kind, Number(d.h));
    case 'generate-game': return generateGame();
    case 'lab-draft':
      labDraft[d.key] = d.val;
      return renderLab();
    case 'ai-price':
      S.ai.autoPrice = d.id;
      return changed();
    case 'stop-lab': return lab && lab.kind !== 'gen' && endLab();
    case 'create-lang': return createLang();
    case 'lang-work': return startLangWork(Number(d.h));
    case 'release-lang': return releaseLang();
    case 'hackathon': return hackathon();
    case 'create-brain': return createBrain();
    case 'release-brain': return releaseBrain();
    case 'ask-brain': return askBrain();
  }
}

document.addEventListener('input', e => {
  const id = e.target.id;
  if (id === 'ai-name') labDraft.aiName = e.target.value;
  if (id === 'brain-name') labDraft.brainName = e.target.value;
  if (id === 'brain-q') labDraft.question = e.target.value;
  if (id === 'lang-name') {
    labDraft.langName = e.target.value;
    $('#lang-preview').textContent = langSample(cleanName(labDraft.langName, 'Capivara++'), labDraft.langStyle, labDraft.langTyping);
  }
});

document.addEventListener('change', e => {
  const t = e.target.dataset.toggle;
  if (!t || busy()) return;
  if (t === 'ai-cloud') S.ai.cloud = e.target.checked;
  if (t === 'brain-cloud') S.brain.cloud = e.target.checked;
  if (t === 'ai-auto') S.ai.auto = e.target.checked;
  changed();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'brain-q') askBrain();
});
