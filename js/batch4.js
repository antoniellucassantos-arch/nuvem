'use strict';

// Lote 4: mineração de Capicoin, canal de vídeos, podcast, clipes virais e Mundial de e-sports.

function media() {
  S.media = { mining: false, coins: 0, coinPrice: 10, videos: [], clips: [], podcastDay: 0, worlds: null, worldTitles: 0, ...(S.media || {}) };
  return S.media;
}

/* ---------- 16. Mineração de Capicoin ---------- */

function mineDaily() {
  const M = media();
  M.coinPrice = Math.max(0.5, +(M.coinPrice * rand(0.8, 1.25)).toFixed(2));
  if (!M.mining || !S.build.gpu) return;
  const b = checkBuild();
  const mined = +(b.gpu * 0.02).toFixed(3);
  const bill = Math.round(b.watts * 8 / 1000 * KWH_PRICE * 3);
  M.coins = +(M.coins + mined).toFixed(3);
  S.money -= bill;
  toast(`⛏️ Seu PC minerou ${mined} Capicoin a noite toda (luz: -${money(bill)}). Cotação: ${money(M.coinPrice)}`);
}

/* ---------- 17. Canal de vídeos ---------- */

const VIDEO_TYPES = {
  review: { name: 'Review de peça', icon: '🔍', energy: 30, mult: 1 },
  tutorial: { name: 'Tutorial de montagem', icon: '🛠️', energy: 40, mult: 1.3 },
  react: { name: 'React de jogo novo', icon: '😱', energy: 20, mult: 0.8 },
};

function recordVideo(type) {
  const t = VIDEO_TYPES[type];
  if (busy() || S.energy < t.energy) return toast('Você está cansado demais para gravar. 😴', 'bad');
  S.energy -= t.energy;
  const quality = rand(0.6, 1.2) * (1 + (S.perks ? S.perks.charisma * 0.05 : 0));
  const title = { review: `Review: ${pick(PARTS.filter(p => ['gpu', 'cpu'].includes(p.cat) && isReleased(p))).name}`,
    tutorial: 'Como montar um PC gamer do zero', react: `Reagindo a ${pick(GAMES.filter(isReleased)).name}` }[type];
  media().videos.push({ type, title, day: S.day, quality, views: 0 });
  toast(`${t.icon} Vídeo publicado: "${title}"`, 'goal');
  changed();
}

function videosDaily() {
  let views = 0;
  for (const v of media().videos) {
    const age = S.day - v.day;
    const today = Math.round((30 + Math.pow(S.followers, 0.6) * 4) * VIDEO_TYPES[v.type].mult * v.quality * Math.pow(0.9, age));
    v.views += today;
    views += today;
  }
  if (!views) return;
  const income = views * 0.004;
  const newF = views * 0.003 / (1 + S.followers / 5e5);
  S.money += income;
  S.followers += newF;
  toast(`▶️ Seus vídeos tiveram ${num(views)} views ontem: +${money(income)} e +${num(newF)} seguidores`);
}

/* ---------- 18. Podcast ---------- */

function recordPodcast() {
  const M = media();
  if (busy() || M.podcastDay === S.day || S.energy < 20) return;
  S.energy -= 20;
  M.podcastDay = S.day;
  const guest = pick(COLLAB_STREAMERS);
  const f = Math.round((20 + Math.pow(S.followers, 0.6) * 1.5) / (1 + S.followers / 5e5));
  S.followers += f;
  toast(`🎧 Podcast com ${guest} no ar! Os dois públicos se misturaram: +${num(f)} seguidores`, 'goal');
  changed();
}

/* ---------- 19. Clipes virais ---------- */

Hooks.on('liveEnd', () => {
  if (!sim || !sim.manual || sim.score < 30 || !live) return;
  media().clips.push({ game: live.game.name, score: sim.score, day: S.day });
  toast(`🎞️ Você fez ${sim.score} pontos jogando! Um clipe foi salvo. Poste na aba Carreira.`, 'goal');
});

function postClip(i) {
  const c = media().clips[i];
  if (!c) return;
  media().clips.splice(i, 1);
  const viral = Math.random() < Math.min(0.8, c.score / 200);
  if (viral) {
    const f = Math.round((80 + S.followers * 0.04) / (1 + S.followers / 5e5));
    S.followers += f;
    toast(`🚀 O clipe de ${c.game} VIRALIZOU! +${num(f)} seguidores`, 'goal');
  } else {
    toast(`😐 O clipe de ${c.game} flopou. Faça mais pontos no próximo!`, 'bad');
  }
  changed();
}

/* ---------- 20. Mundial de e-sports ---------- */

const WORLD_ROUNDS = ['Quartas de final', 'Semifinal', 'Final'];
const worldsOpen = () => S.day % 30 >= 25 && S.followers >= 5000;

function joinWorlds() {
  const M = media();
  if (M.worlds || !worldsOpen() || busy()) return;
  M.worlds = { round: 0, target: 80 };
  toast('🌍 Você está no MUNDIAL! Na próxima live, jogue você mesmo e faça 80 pontos para passar das quartas.', 'goal');
  changed();
}

Hooks.on('liveEnd', () => {
  const M = media();
  if (!M.worlds || !sim) return;
  const W = M.worlds;
  if (sim.manual && sim.score >= W.target) {
    W.round++;
    if (W.round >= WORLD_ROUNDS.length) {
      const prize = Math.round(50000 + Math.pow(S.followers, 0.6) * 100);
      S.money += prize;
      S.followers += Math.round(S.followers * 0.2 / (1 + S.followers / 5e6));
      M.worldTitles++;
      M.worlds = null;
      toast(`🏆🌍 CAMPEÃO MUNDIAL! +${money(prize)} e +20% de seguidores!`, 'goal');
    } else {
      W.target += 30;
      toast(`✅ Passou! Próxima fase: ${WORLD_ROUNDS[W.round]} (faça ${W.target} pontos na próxima live).`, 'goal');
    }
  } else {
    toast(`❌ Eliminado no Mundial (${WORLD_ROUNDS[W.round]}). Ano que vem tem mais!`, 'bad');
    M.worlds = null;
  }
});

/* ---------- Interface ---------- */

function renderBatch4() {
  const M = media();
  const lock = busy() ? 'disabled' : '';
  $('#media-card').innerHTML = `<h2>📺 Conteúdo</h2>
    <h3>▶️ Canal de vídeos</h3>
    <p class="muted">Vídeos continuam dando views (e dinheiro) por dias.</p>
    <div class="chips">${Object.entries(VIDEO_TYPES).map(([id, t]) =>
      `<button class="btn small" data-action="video" data-id="${id}" ${lock || S.energy < t.energy ? 'disabled' : ''}>${t.icon} ${t.name} (⚡${t.energy})</button>`).join('')}</div>
    ${M.videos.slice(-4).reverse().map(v => `<div class="muted">${VIDEO_TYPES[v.type].icon} ${esc(v.title)} · ${num(v.views)} views</div>`).join('')}
    <h3>🎧 Podcast</h3>
    <button class="btn small" data-action="podcast" ${lock || M.podcastDay === S.day || S.energy < 20 ? 'disabled' : ''}>Gravar episódio com um convidado (⚡20)${M.podcastDay === S.day ? ' · já gravou hoje' : ''}</button>
    <h3>🎞️ Clipes</h3>
    ${M.clips.length ? M.clips.map((c, i) => `<div class="item"><div class="slot-info"><div class="slot-name">${esc(c.game)}</div><div class="muted">${c.score} pontos · dia ${c.day}</div></div>
      <button class="btn small" data-action="clip" data-i="${i}">Postar</button></div>`).join('')
      : '<p class="muted">Faça 30+ pontos jogando você mesmo numa live para salvar um clipe.</p>'}
    <h3>⛏️ Mineração de Capicoin</h3>
    <label class="toggle"><input type="checkbox" data-toggle="mining" ${M.mining ? 'checked' : ''}><span>Minerar à noite com a placa de vídeo (gasta luz)</span></label>
    <p class="muted">Você tem <b>${M.coins}</b> Capicoin · cotação ${money(M.coinPrice)} = ${money(M.coins * M.coinPrice)}</p>
    <button class="btn small ghost" data-action="sell-coins" ${M.coins ? '' : 'disabled'}>Vender todas as Capicoin</button>`;

  $('#worlds-card').innerHTML = `<h2>🌍 Mundial de e-sports</h2>
    ${M.worlds ? `<p>Você está nas <b>${WORLD_ROUNDS[M.worlds.round]}</b>! Na próxima live, jogue você mesmo e faça <b>${M.worlds.target} pontos</b>.</p>`
      : worldsOpen() ? `<p>As inscrições estão abertas! 3 fases: quartas, semifinal e final.</p>
        <button class="btn" data-action="worlds" ${lock}>Inscrever-se no Mundial</button>`
        : `<p class="muted">O Mundial acontece todo mês do jogo (inscrições nos dias ${S.day - (S.day % 30) + 25} a ${S.day - (S.day % 30) + 29}) e pede 5 mil seguidores.</p>`}
    <p class="muted">Títulos mundiais: ${M.worldTitles}</p>`;
}

Hooks.on('render', renderBatch4);
Hooks.on('daily', () => { mineDaily(); videosDaily(); });
Hooks.on('action', d => {
  const M = media();
  switch (d.action) {
    case 'video': return recordVideo(d.id);
    case 'podcast': return recordPodcast();
    case 'clip': return postClip(Number(d.i));
    case 'worlds': return joinWorlds();
    case 'sell-coins': {
      const v = M.coins * M.coinPrice;
      S.money += v; M.coins = 0;
      toast(`💰 Vendeu suas Capicoin por ${money(v)}`, 'goal');
      return changed();
    }
  }
});
document.addEventListener('change', e => {
  if (e.target.dataset.toggle !== 'mining') return;
  media().mining = e.target.checked;
  changed();
});

renderBatch4();
