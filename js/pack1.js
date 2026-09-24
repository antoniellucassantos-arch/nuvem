'use strict';

// Pacote 1: exportar/importar save, conquistas secretas, sons, tendências da semana,
// crise dos chips e personagem. Carregado depois de game.js: estende funções existentes.

/* ---------- Estado novo (com valores padrão para saves antigos) ---------- */

function packDefaults() {
  S.counts = { boom: 0, brick: 0, virus: 0, burn: 0, mae: 0, pirate: 0, pet: 0, crisisBuy: 0, ...(S.counts || {}) };
  S.ach = S.ach || [];
  S.sound = S.sound !== false;
  S.avatar = { skin: '#f1c27d', hair: '#2b1d0e', style: 'curto', shirt: '#7c5cff', headset: true, ...(S.avatar || {}) };
  S.trend = S.trend || null;
  S.crisis = S.crisis || null;
}
packDefaults();

/* ---------- Sons (gerados pelo navegador, sem arquivos) ---------- */

let audioCtx = null;

function beep(freq, dur, type = 'square', vol = 0.05, slide = 0) {
  if (!S.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol * volume(), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch { /* sem áudio */ }
}

function noise(dur, vol = 0.2) {
  if (!S.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    gain.gain.value = vol * volume();
    src.buffer = buf;
    src.connect(gain).connect(audioCtx.destination);
    src.start();
  } catch { /* sem áudio */ }
}

const SFX = {
  click: () => beep(1200, 0.03, 'square', 0.02),
  coin: () => { beep(988, 0.08); setTimeout(() => beep(1319, 0.2), 80); },
  level: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.15, 'triangle', 0.06), i * 90)),
  bad: () => beep(220, 0.3, 'sawtooth', 0.05, -120),
  boom: () => { noise(0.8, 0.35); beep(120, 0.6, 'sawtooth', 0.08, -90); },
  mae: () => [880, 660, 880, 660].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'square', 0.07), i * 180)),
  alert: () => { beep(660, 0.1, 'triangle', 0.06); setTimeout(() => beep(880, 0.15, 'triangle', 0.06), 110); },
};

function sfx(name) {
  if (SFX[name]) SFX[name]();
}

document.addEventListener('click', e => {
  if (e.target.closest('.btn, .chip-btn, .tab, .os-icon, .task-btn')) sfx('click');
});

/* ---------- Conquistas secretas ---------- */

const ACHIEVEMENTS = [
  { id: 'boom3', icon: '💥', text: 'Explodiu 3 fontes genéricas', check: () => S.counts.boom >= 3 },
  { id: 'brick2', icon: '🧱', text: 'Levou o golpe do tijolo 2 vezes', check: () => S.counts.brick >= 2 },
  { id: 'virus', icon: '🦠', text: 'Pegou vírus baixando jogo pirata', check: () => S.counts.virus >= 1 },
  { id: 'pirate3', icon: '🏴‍☠️', text: 'Baixou 3 jogos piratas', check: () => S.counts.pirate >= 3 },
  { id: 'burn', icon: '🔥', text: 'Queimou uma peça no overclock', check: () => S.counts.burn >= 1 },
  { id: 'mae3', icon: '👩', text: 'A mãe desligou seu PC 3 vezes', check: () => S.counts.mae >= 3 },
  { id: 'basic', icon: '🗄️', text: '10 mil seguidores ainda com o Gabinete Básico', check: () => S.followers >= 10000 && S.caseId === 'k1' },
  { id: 'rich', icon: '💰', text: 'Juntou R$ 1 milhão', check: () => S.money >= 1e6 },
  { id: 'gamer', icon: '🎮', text: 'Fez 100 pontos jogando você mesmo na live', check: () => sim && sim.manual && sim.score >= 100 },
  { id: 'pet10', icon: '🦫', text: 'Alimentou a capivara 10 vezes', check: () => S.counts.pet >= 10 },
  { id: 'trend', icon: '📈', text: 'Lançou um jogo do gênero da moda', check: () => S.trend && S.myGames.some(g => g.genre === S.trend.genre && g.day >= S.trend.from) },
  { id: 'crisis', icon: '📉', text: 'Comprou placa de vídeo na crise dos chips', check: () => S.counts.crisisBuy >= 1 },
];

function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (!S.ach.includes(a.id) && a.check()) {
      S.ach.push(a.id);
      toast(`🏅 Conquista secreta: ${a.icon} ${a.text}!`, 'goal');
      saveGame();
    }
  }
}
setInterval(checkAchievements, 2000);

/* ---------- Tendências da semana e crise dos chips ---------- */

const TREND_BONUS = 2;
const CRISIS_GPU = 1.8;

function packDaily() {
  if (!S.trend || S.day >= S.trend.until) {
    const g = pick(GENRES);
    S.trend = { genre: g.id, from: S.day, until: S.day + 7 };
    toast(`📈 Tendência da semana: todo mundo quer jogo de ${g.name}! Jogos desse gênero vendem ${TREND_BONUS}x.`, 'goal');
  }
  if (S.crisis && S.day >= S.crisis.until) {
    S.crisis = null;
    toast('📉 A crise dos chips acabou! Placas de vídeo voltaram ao preço normal.', 'goal');
  } else if (!S.crisis && S.day > 10 && Math.random() < 0.06) {
    S.crisis = { until: S.day + 5 };
    toast(`🚨 CRISE DOS CHIPS! Placas de vídeo esgotando: preço ${CRISIS_GPU}x por 5 dias.`, 'bad');
  }
}

const trendGenre = () => (S.trend ? GENRE_BY_ID[S.trend.genre] : null);

/* ---------- Personagem ---------- */

const AVATAR_OPTIONS = {
  skin: ['#f6d7b0', '#f1c27d', '#c68642', '#8d5524', '#5c3a21'],
  hair: ['#2b1d0e', '#6b4423', '#e6be8a', '#b7410e', '#7c5cff', '#3ecf8e'],
  style: ['curto', 'longo', 'moicano', 'careca'],
  shirt: ['#7c5cff', '#ff3b4e', '#3ecf8e', '#ffb547', '#1f2937', '#f5f5f5'],
};

function drawAvatar(a) {
  const hair = {
    curto: `<path d="M26 40 Q26 16 50 16 Q74 16 74 40 Q66 28 50 28 Q34 28 26 40Z" fill="${a.hair}"/>`,
    longo: `<path d="M24 44 Q22 14 50 14 Q78 14 76 44 L78 74 Q70 64 70 44 Q60 28 50 28 Q40 28 30 44 Q30 64 22 74Z" fill="${a.hair}"/>`,
    moicano: `<path d="M44 10 L56 10 L58 32 L42 32Z" fill="${a.hair}"/>`,
    careca: '',
  }[a.style];
  return `<svg viewBox="0 0 100 100" class="avatar" aria-hidden="true">
    <path d="M18 100 Q18 70 50 70 Q82 70 82 100Z" fill="${a.shirt}"/>
    <rect x="44" y="58" width="12" height="14" fill="${a.skin}"/>
    <circle cx="50" cy="42" r="24" fill="${a.skin}"/>
    ${hair}
    <circle cx="41" cy="44" r="3" fill="#111"/><circle cx="59" cy="44" r="3" fill="#111"/>
    <path d="M42 54 Q50 60 58 54" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${a.headset ? `<path d="M24 44 Q24 12 50 12 Q76 12 76 44" stroke="#15161b" stroke-width="5" fill="none"/>
      <rect x="19" y="38" width="10" height="16" rx="4" fill="#15161b"/><rect x="71" y="38" width="10" height="16" rx="4" fill="#15161b"/>
      <path d="M24 54 Q28 64 40 62" stroke="#15161b" stroke-width="2.5" fill="none"/>` : ''}
  </svg>`;
}

function renderAvatarCard() {
  const a = S.avatar;
  const swatches = (key, list) => list.map(c => `<button class="swatch ${a[key] === c ? 'active' : ''}" style="background:${c}"
    data-action="avatar" data-key="${key}" data-val="${c}" aria-label="${key} ${c}"></button>`).join('');
  $('#avatar-card').innerHTML = `<h2>🧑 Seu personagem</h2>
    <div class="avatar-editor">
      <div class="avatar-preview">${drawAvatar(a)}</div>
      <div>
        <h3>Pele</h3><div class="chips">${swatches('skin', AVATAR_OPTIONS.skin)}</div>
        <h3>Cabelo</h3><div class="chips">${swatches('hair', AVATAR_OPTIONS.hair)}</div>
        <div class="chips">${AVATAR_OPTIONS.style.map(s => `<button class="chip-btn ${a.style === s ? 'active' : ''}" data-action="avatar" data-key="style" data-val="${s}">${s}</button>`).join('')}</div>
        <h3>Camiseta</h3><div class="chips">${swatches('shirt', AVATAR_OPTIONS.shirt)}</div>
        <div class="chips"><button class="chip-btn ${a.headset ? 'active' : ''}" data-action="avatar" data-key="headset" data-val="toggle">🎧 Headset</button></div>
      </div>
    </div>
    <p class="muted">Ele aparece na webcam durante as lives.</p>`;
}

/* ---------- Exportar / importar save ---------- */

function exportSave() {
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  $('#save-code').value = code;
  $('#save-code').select();
  const fallback = () => toast('Copie o código da caixa de texto e cole no outro aparelho.');
  try {
    navigator.clipboard.writeText(code)
      .then(() => toast('📋 Código copiado! Cole no outro aparelho em "Importar".'), fallback);
  } catch { fallback(); }
}

function importSave() {
  if (busy()) return;
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob($('#save-code').value.trim()))));
    if (typeof data.money !== 'number' || !data.build) throw new Error('inválido');
    if (!confirm('Substituir o progresso deste aparelho pelo save importado?')) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    location.reload();
  } catch {
    toast('❌ Código de save inválido. Confira se copiou tudo.', 'bad');
  }
}

/* ---------- Interface ---------- */

function renderPack1() {
  packDefaults();
  $('#btn-sound').textContent = S.sound ? '🔊' : '🔇';
  renderAvatarCard();
  $('#live-avatar').innerHTML = drawAvatar(S.avatar);

  $('#ach-list').innerHTML = ACHIEVEMENTS.map(a => S.ach.includes(a.id)
    ? `<li class="ach done"><span>${a.icon}</span>${a.text}</li>`
    : '<li class="ach"><span>❔</span>??? (conquista secreta)</li>').join('');
  $('#ach-count').textContent = `${S.ach.length}/${ACHIEVEMENTS.length}`;

  const t = trendGenre();
  const trendHtml = t ? `📈 <b>Tendência da semana:</b> ${t.emoji} ${t.name} vende ${TREND_BONUS}x (até o dia ${S.trend.until})` : '';
  const crisisHtml = S.crisis ? `🚨 <b>Crise dos chips:</b> placas de vídeo ${CRISIS_GPU}x mais caras até o dia ${S.crisis.until}` : '';
  $('#market-banner').innerHTML = [trendHtml, crisisHtml].filter(Boolean).join('<br>');
  $('#market-banner').hidden = !trendHtml && !crisisHtml;
  $('#dev-trend').innerHTML = trendHtml;
  $('#dev-trend').hidden = !trendHtml;
}

/* ---------- Ganchos ---------- */

Hooks.on('render', renderPack1);
Hooks.on('daily', packDaily);
Hooks.on('toast', (text, cls) => {
  if (cls === 'goal') sfx(text.startsWith('🏅') ? 'level' : 'alert');
  if (cls === 'bad') sfx('bad');
});
Hooks.on('psuBoom', () => { S.counts.boom++; sfx('boom'); });
Hooks.on('ocBurn', () => { S.counts.burn++; sfx('boom'); });
Hooks.on('pirated', infected => { S.counts.pirate++; if (infected) S.counts.virus++; });
Hooks.on('usedBrick', () => { S.counts.brick++; });
Hooks.on('petFed', () => { S.counts.pet++; });
Hooks.on('liveEnd', reason => { if (reason === 'mae') { S.counts.mae++; sfx('mae'); } });
Hooks.on('chatAdded', msg => { if (msg.cls === 'donation') sfx('coin'); });
Hooks.on('price', (v, p) => (S.crisis && p.cat === 'gpu' ? Math.round(v * CRISIS_GPU) : v));
Hooks.on('bought', p => { if (S.crisis && p.cat === 'gpu') S.counts.crisisBuy++; });
Hooks.on('sales', (u, game) => (S.trend && game.genre === S.trend.genre ? u * TREND_BONUS : u));
Hooks.on('action', d => {
  switch (d.action) {
    case 'toggle-sound': S.sound = !S.sound; saveGame(); return renderPack1();
    case 'avatar':
      if (d.key === 'headset') S.avatar.headset = !S.avatar.headset;
      else S.avatar[d.key] = d.val;
      saveGame();
      return renderPack1();
    case 'export-save': return exportSave();
    case 'import-save': return importSave();
  }
});

if (!S.trend) packDaily();
render();
