'use strict';

// Franquias: jogos com nota 8+ podem ganhar continuação, que já nasce com fãs (hype).

const franchiseName = (name, n) => `${name.replace(/ \d+$/, '')} ${n}`;
const sequelNumber = g => (g.sequel || 1) + 1;

function startSequel(id) {
  const g = S.myGames.find(x => x.id === id);
  if (!g || S.project || busy() || g.score < 8 || g.hasSequel) return;
  const size = SIZE_BY_ID[g.size];
  S.project = {
    name: franchiseName(g.name, sequelNumber(g)), engine: S.engines.includes(g.engine) ? g.engine : bestEngineId(GENRE_BY_ID[g.genre].is3d),
    genre: g.genre, theme: g.theme, size: g.size, focus: { ...GENRE_BY_ID[g.genre].w },
    progress: 0, target: size.target, bugs: 0, bonus: 0.05, sequelOf: g.id, sequel: sequelNumber(g), fans: g.score,
  };
  g.hasSequel = true;
  toast(`🎬 Continuação anunciada: ${S.project.name}! Os fãs já estão esperando. Programe na aba Dev.`, 'goal');
  showTab('dev');
  changed();
}

Hooks.on('released', (game, P) => {
  if (!P.sequelOf) return;
  game.sequel = P.sequel;
  game.hype += 1 + (P.fans - 8);           // fãs do jogo anterior
  toast(`🍿 Os fãs lotaram o lançamento de ${game.name}!`, 'goal');
});

function renderFranchise() {
  const el = $('#franchise-card');
  if (!el) return;
  const eligible = S.myGames.filter(g => g.score >= 8 && !g.hasSequel);
  el.hidden = !S.phase2;
  el.innerHTML = `<h2>🎬 Franquias</h2>
    <p class="muted">Jogos com nota 8 ou mais podem ganhar continuação. A continuação já nasce com fãs e vende mais no lançamento.</p>
    ${eligible.length ? eligible.slice(-6).reverse().map(g => `<div class="item">
      <div class="slot-info"><div class="slot-name">${esc(g.name)} <span class="badge q-good">${g.score.toFixed(1)}</span></div>
        <div class="muted">${num(g.sold)} cópias vendidas</div></div>
      <button class="btn small" data-action="sequel" data-id="${g.id}" ${S.project || busy() ? 'disabled' : ''}>Fazer ${esc(franchiseName(g.name, sequelNumber(g)))}</button>
    </div>`).join('') + (S.project ? '<p class="warning-text">Termine o projeto atual antes de começar uma continuação.</p>' : '')
      : '<p class="muted">Nenhum jogo com nota 8+ ainda. Capriche no próximo!</p>'}`;
}

Hooks.on('render', renderFranchise);
Hooks.on('action', d => { if (d.action === 'sequel') startSequel(Number(d.id)); });
renderFranchise();
