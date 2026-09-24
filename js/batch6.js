'use strict';

// Lote 6: live mais viva, quarto visto de cima, código de desafio, cartão de perfil e empresa de hardware.

/* ---------- 31. Live mais viva ---------- */

function floatEmoji(e) {
  const scr = $('#screen-live');
  if (!scr || scr.hidden || settings().anim === false) return;
  const el = document.createElement('span');
  el.className = 'float-emoji';
  el.textContent = e;
  el.style.left = (60 + Math.random() * 35) + '%';
  scr.append(el);
  setTimeout(() => el.remove(), 2300);
}

function avatarReact(kind) {
  const cam = $('#live-cam');
  if (!cam) return;
  cam.classList.remove('react-bad', 'react-good');
  void cam.offsetWidth;
  cam.classList.add(kind === 'bad' ? 'react-bad' : 'react-good');
}

Hooks.on('chatAdded', msg => {
  const t = String(msg.text);
  if (msg.cls === 'donation') { avatarReact('good'); floatEmoji(pick(['💸', '🤑', '💰'])); }
  else if (/morreu|^F$|doeu|skill issue/.test(t)) { avatarReact('bad'); floatEmoji(pick(['💀', '😭', '🤡'])); }
  else if (Math.random() < 0.3) floatEmoji(pick(['❤️', '😂', '🔥', '👏', '🦫', '😮']));
});

/* ---------- 32. Quarto visto de cima ---------- */

function roomSvg() {
  const tier = houseTier(S.house);
  const floor = ['#8d6e63', '#a1887f', '#b0bec5', '#cfd8dc', '#e0e0e0'][tier] || '#8d6e63';
  const rgb = S.build.gpu ? '#22d3ee' : '#555';
  const petOk = S.pet.food >= 15;
  const extras = [];
  if (S.gear.includes('e2')) extras.push('<text x="150" y="40" font-size="14">📷</text>');
  if (S.gear.includes('e14')) extras.push('<text x="30" y="200" font-size="28">🏋️</text>');
  if (tier >= 2) extras.push('<text x="240" y="200" font-size="26">🛋️</text>');
  if (tier >= 3) extras.push('<text x="245" y="60" font-size="24">🪴</text>');
  if (tier >= 4) extras.push('<text x="130" y="210" font-size="24">🏊</text>');
  if (S.trophies && S.trophies.length) extras.push('<text x="30" y="60" font-size="22">🏆</text>');
  return `<svg class="room-svg" viewBox="0 0 300 230" role="img" aria-label="Seu quarto visto de cima">
    <rect width="300" height="230" fill="${floor}"/>
    <rect x="4" y="4" width="292" height="222" fill="none" stroke="#3e2723" stroke-width="8"/>
    <rect x="90" y="12" width="120" height="40" rx="4" fill="#5d4037"/>
    <rect x="125" y="16" width="50" height="10" rx="2" fill="#111" stroke="${rgb}" stroke-width="2"/>
    <rect x="185" y="18" width="18" height="30" rx="2" fill="#222" stroke="${S.pcOn ? rgb : '#444'}" stroke-width="2"/>
    <circle cx="150" cy="72" r="14" fill="#263238"/>
    <rect x="200" y="140" width="80" height="60" rx="6" fill="#90caf9"/><rect x="200" y="140" width="80" height="18" rx="6" fill="#fff"/>
    <text x="${petOk ? 60 : 40}" y="${petOk ? 130 : 215}" font-size="26">🦫</text>
    ${petOk ? '' : '<text x="75" y="200" font-size="12">😢</text>'}
    ${S.virus ? '<text x="210" y="45" font-size="14">🦠</text>' : ''}
    ${extras.join('')}
  </svg>`;
}

/* ---------- 33. Código de desafio ---------- */

function challengeCode() {
  const d = { f: Math.round(S.followers), m: Math.round(S.money), v: S.stats.bestViewers, l: S.stats.lives, d: S.day, e: GAME_MODE[0] };
  return 'INF-' + btoa(JSON.stringify(d)).replace(/=+$/, '');
}

function readCode(code) {
  try {
    const d = JSON.parse(atob(String(code).trim().replace(/^INF-/, '')));
    return typeof d.f === 'number' ? d : null;
  } catch { return null; }
}

function compareCode(code) {
  const o = readCode(code);
  const out = $('#challenge-result');
  if (!o) { out.textContent = '❌ Código inválido.'; return; }
  const rows = [['Seguidores', S.followers, o.f], ['Dinheiro', S.money, o.m], ['Recorde de público', S.stats.bestViewers, o.v], ['Lives', S.stats.lives, o.l]];
  let wins = 0;
  out.innerHTML = rows.map(([n, a, b]) => {
    if (a > b) wins++;
    return `<div>${a > b ? '✅' : a < b ? '❌' : '🤝'} ${n}: você ${num(Math.round(a))} × amigo ${num(Math.round(b))}</div>`;
  }).join('') + `<p><b>${wins >= 3 ? '🏆 Você ganhou o desafio!' : wins === 2 ? '🤝 Empate!' : '😅 Seu amigo está na frente.'}</b> (amigo no dia ${o.d})</p>`;
}

/* ---------- 34. Cartão de perfil ---------- */

function drawProfile() {
  const c = $('#profile-canvas');
  if (!c) return;
  const x = c.getContext('2d');
  if (!x) return;
  const g = x.createLinearGradient(0, 0, 400, 220);
  g.addColorStop(0, '#312e81'); g.addColorStop(1, '#0e7490');
  x.fillStyle = g; x.fillRect(0, 0, 400, 220);
  x.fillStyle = '#fff';
  x.font = 'bold 22px sans-serif'; x.fillText('🎮 InfoReal', 20, 36);
  x.font = '15px sans-serif';
  const lines = [
    `👥 ${num(Math.round(S.followers))} seguidores`,
    `💰 ${money(Math.round(S.money))}`,
    `👁 Recorde: ${num(S.stats.bestViewers)} espectadores`,
    `📺 ${S.stats.lives} lives • dia ${S.day}`,
    `🕹️ ${(S.myGames || []).length} jogos criados${S.hw ? ` • 🏭 ${S.hw.name}` : ''}`,
  ];
  lines.forEach((l, i) => x.fillText(l, 20, 72 + i * 28));
  x.font = '60px sans-serif'; x.fillText('🦫', 310, 190);
}

function downloadProfile() {
  const c = $('#profile-canvas');
  const a = document.createElement('a');
  a.download = 'meu-perfil-inforeal.png';
  a.href = c.toDataURL('image/png');
  a.click();
}

/* ---------- 21. Empresa de hardware ---------- */

const HW_COST = 500000;
const HW_UNLOCK = 50000;
const HW_NAMES = ['CapiChip', 'NuvemTech', 'Placa Brasil', 'GeForça'];

function hwFound() {
  if (S.hw || S.money < HW_COST || S.followers < HW_UNLOCK) return;
  S.money -= HW_COST;
  S.hw = { name: pick(HW_NAMES), tech: 1, share: 0.5, cards: [] };
  toast(`🏭 Você fundou a ${S.hw.name}! Hora de enfrentar a NVIDIA.`, 'goal');
  changed();
}

const hwResearchCost = () => Math.round(100000 * Math.pow(1.6, S.hw.tech - 1));

function hwResearch() {
  const c = hwResearchCost();
  if (!S.hw || S.money < c) return;
  S.money -= c;
  S.hw.tech++;
  toast(`🔬 Pesquisa concluída: tecnologia nível ${S.hw.tech}.`);
  changed();
}

function hwLaunch() {
  if (!S.hw || S.money < 200000) return;
  S.money -= 200000;
  const n = 1000 + S.hw.cards.length * 1000 + S.hw.tech * 10;
  const score = S.hw.tech * 12 + Math.round(rand(-5, 5));
  const best = Math.max(...PARTS.filter(p => p.cat === 'gpu' && (!p.day || p.day <= S.day)).map(p => p.score));
  const hit = score / best;
  S.hw.share = Math.min(60, S.hw.share + Math.max(0, hit - 0.6) * 15);
  S.hw.cards.push({ name: `${S.hw.name} X${n}`, score });
  toast(hit >= 1 ? `🚀 A ${S.hw.name} X${n} é mais forte que a melhor NVIDIA! Mercado enlouqueceu.`
    : hit >= 0.7 ? `📦 A ${S.hw.name} X${n} foi bem recebida.` : `😬 A ${S.hw.name} X${n} é fraca. Os reviews não perdoaram.`, hit >= 0.7 ? 'goal' : 'bad');
  changed();
}

Hooks.on('daily', () => {
  if (!S.hw) return;
  const income = Math.round(S.hw.share * 8000);
  S.money += income;
  S.hw.share = Math.max(0.5, S.hw.share * 0.97);
  if (income > 0) toast(`🏭 ${S.hw.name} vendeu placas: +${money(income)} (${S.hw.share.toFixed(1)}% do mercado).`);
});

/* ---------- Interface ---------- */

function renderBatch6() {
  const room = $('#room-card');
  if (room) room.innerHTML = `<h2>🏠 Seu quarto (visto de cima)</h2>${roomSvg()}`;

  const prof = $('#profile-card');
  if (prof && !$('#profile-canvas')) {
    prof.innerHTML = `<h2>🪪 Cartão de perfil</h2><canvas id="profile-canvas" width="400" height="220"></canvas>
      <button class="btn small" data-action="profile-dl">⬇️ Baixar imagem</button>`;
  }
  drawProfile();

  const ch = $('#friend-card');
  if (ch) {
    if (!$('#my-code')) {
      ch.innerHTML = `<h2>🆚 Desafie um amigo</h2>
        <p class="muted">Mande seu código para um amigo. Cole o código dele aqui para comparar.</p>
        <div class="code-box" id="my-code"></div>
        <button class="btn small ghost" data-action="copy-code">📋 Copiar meu código</button>
        <div class="chips"><input id="friend-code" placeholder="Código do amigo (INF-...)">
        <button class="btn small" data-action="compare-code">Comparar</button></div>
        <div id="challenge-result"></div>`;
    }
    $('#my-code').textContent = challengeCode();
  }

  const hw = $('#hw-card');
  if (hw) {
    if (!S.hw) {
      hw.innerHTML = `<h2>🏭 Sua empresa de hardware</h2>
        <p class="muted">Lance sua própria placa de vídeo e roube mercado da NVIDIA. Precisa de ${num(HW_UNLOCK)} seguidores.</p>
        <button class="btn" data-action="hw-found" ${S.money < HW_COST || S.followers < HW_UNLOCK ? 'disabled' : ''}>Fundar empresa (${money(HW_COST)})</button>`;
    } else {
      hw.innerHTML = `<h2>🏭 ${S.hw.name}</h2>
        <p>Tecnologia nível <b>${S.hw.tech}</b> • ${S.hw.share.toFixed(1)}% do mercado (NVIDIA: ${(80 - S.hw.share * 0.8).toFixed(1)}%)</p>
        <div class="chips"><button class="btn small" data-action="hw-research" ${S.money < hwResearchCost() ? 'disabled' : ''}>🔬 Pesquisar (${money(hwResearchCost())})</button>
        <button class="btn small" data-action="hw-launch" ${S.money < 200000 ? 'disabled' : ''}>🚀 Lançar placa (${money(200000)})</button></div>
        ${S.hw.cards.length ? `<p class="muted">Lançadas: ${S.hw.cards.map(c => c.name).join(', ')}</p>` : ''}`;
    }
  }
}

Hooks.on('render', renderBatch6);
Hooks.on('action', d => {
  switch (d.action) {
    case 'profile-dl': downloadProfile(); break;
    case 'copy-code': try { navigator.clipboard.writeText(challengeCode()); toast('📋 Código copiado!'); } catch { /* sem área de transferência */ } break;
    case 'compare-code': compareCode($('#friend-code').value); break;
    case 'hw-found': hwFound(); break;
    case 'hw-research': hwResearch(); break;
    case 'hw-launch': hwLaunch(); break;
  }
});
renderBatch6();
