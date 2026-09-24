'use strict';

// Documentário da sua vida: uma linha do tempo com os grandes momentos da sua carreira.

const MOMENTS = [
  { id: 'pc', icon: '🖥️', text: () => 'Ligou o primeiro PC', check: () => S.pcOn || S.stats.lives > 0 },
  { id: 'live1', icon: '🔴', text: () => 'Fez a primeira live', check: () => S.stats.lives >= 1 },
  { id: 'boom', icon: '💥', text: () => 'A primeira fonte genérica explodiu', check: () => S.counts && S.counts.boom >= 1 },
  { id: 'f100', icon: '👥', text: () => 'Chegou a 100 seguidores', check: () => S.followers >= 100 },
  { id: 'f1k', icon: '👥', text: () => 'Chegou a 1 mil seguidores', check: () => S.followers >= 1000 },
  { id: 'phase2', icon: '💻', text: () => 'Começou a programar', check: () => S.phase2 },
  { id: 'game1', icon: '🕹️', text: () => `Lançou o primeiro jogo: ${S.myGames[0].name}`, check: () => S.myGames.length > 0 },
  { id: 'hit', icon: '⭐', text: () => `Primeiro sucesso de crítica: ${S.myGames.find(g => g.score >= 8).name}`, check: () => S.myGames.some(g => g.score >= 8) },
  { id: 'f10k', icon: '👥', text: () => 'Chegou a 10 mil seguidores', check: () => S.followers >= 1e4 },
  { id: 'move', icon: '🏠', text: () => 'Saiu da casa da mãe', check: () => S.house && S.house !== 'h0' },
  { id: 'tourney', icon: '🏆', text: () => 'Venceu o primeiro campeonato', check: () => S.tourneyWins >= 1 },
  { id: 'sequel', icon: '🎬', text: () => 'Lançou a primeira continuação', check: () => S.myGames.some(g => g.sequel) },
  { id: 'ai', icon: '🤖', text: () => `Criou a IA ${S.ai.name}`, check: () => !!S.ai },
  { id: 'f100k', icon: '🥈', text: () => 'Ganhou a placa de 100 mil seguidores', check: () => S.followers >= 1e5 },
  { id: 'million', icon: '💰', text: () => 'Virou milionário', check: () => S.money >= 1e6 },
  { id: 'lang', icon: '🧬', text: () => `Lançou a linguagem ${S.lang.name}`, check: () => S.lang && S.lang.released },
  { id: 'brain', icon: '🧠', text: () => `Lançou a IA ${S.brain.name} para o mundo`, check: () => S.brain && S.brain.released },
  { id: 'f1m', icon: '🥇', text: () => 'Ganhou a placa de 1 milhão de seguidores', check: () => S.followers >= 1e6 },
  { id: 'end', icon: '🏆', text: () => 'ZEROU O INFOREAL', check: () => S.finished },
];

function recordMoments() {
  S.timeline = S.timeline || [];
  for (const m of MOMENTS) {
    if (!S.timeline.some(t => t.id === m.id) && m.check()) S.timeline.push({ id: m.id, day: S.day, icon: m.icon, text: m.text() });
  }
}

function renderDocumentary() {
  recordMoments();
  $('#doc-card').innerHTML = `<h2>🎬 Documentário da sua vida</h2>
    ${S.timeline.length ? `<ol class="timeline">${S.timeline.map(t => `<li><span class="tl-icon">${t.icon}</span><div><b>Dia ${t.day}</b><div>${esc(t.text)}</div></div></li>`).join('')}</ol>
      <button class="btn small" data-action="doc-play">▶️ Assistir o documentário</button>`
      : '<p class="muted">Sua história ainda vai começar. Monte o PC!</p>'}`;
}

function playDocumentary() {
  const box = $('#doc-player');
  const list = S.timeline;
  let i = 0;
  box.hidden = false;
  const show = () => {
    if (i >= list.length) {
      box.innerHTML = `<div class="doc-slide"><div class="doc-big">🎬</div><h2>FIM... por enquanto</h2>
        <p>Uma história de ${S.day} dias, ${num(S.followers)} seguidores e ${S.myGames.length} jogos.</p>
        <button class="btn" data-action="doc-close">Fechar</button></div>`;
      return;
    }
    const t = list[i++];
    box.innerHTML = `<div class="doc-slide"><div class="muted">Dia ${t.day}</div><div class="doc-big">${t.icon}</div><h2>${esc(t.text)}</h2>
      <button class="btn ghost small" data-action="doc-close">Pular</button></div>`;
    sfx('alert');
    box.timer = setTimeout(show, 2200);
  };
  clearTimeout(box.timer);
  show();
}

Hooks.on('render', renderDocumentary);
Hooks.on('action', d => {
  if (d.action === 'doc-play') playDocumentary();
  if (d.action === 'doc-close') { clearTimeout($('#doc-player').timer); $('#doc-player').hidden = true; }
});
renderDocumentary();
