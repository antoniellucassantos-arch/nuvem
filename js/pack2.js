'use strict';

// Pacote 2: funcionários, campeonatos, collab, skins dos seus jogos, rivais e decoração do quarto.
// Carregado depois de pack1.js: estende funções existentes.

const STAFF = [
  { id: 'editor', icon: '🎬', name: 'Editor de vídeo', salary: 300, desc: 'Faz cortes das lives: +8% de público' },
  { id: 'mod', icon: '🛡️', name: 'Moderador', salary: 150, desc: 'Bane os haters do chat: +3% de público' },
  { id: 'dev', icon: '👨‍💻', name: 'Programador júnior', salary: 400, desc: 'Programa 15 pontos por dia no seu projeto' },
  { id: 'manager', icon: '💼', name: 'Empresário', salary: 1000, desc: 'Fecha patrocínios todo dia' },
];

const RIVALS = [
  { id: 'r1', name: 'CapivaraPro', emoji: '🦫' },
  { id: 'r2', name: 'NoobMaster69', emoji: '🎮' },
  { id: 'r3', name: 'TiaGamer', emoji: '👵' },
];

const COLLAB_STREAMERS = ['GauleZinho', 'CasimiroFake', 'NobruDoBairro', 'TiaGamer', 'CapivaraPro'];

function pack2Defaults() {
  S.staff = S.staff || [];
  S.rivals = S.rivals || RIVALS.map((r, i) => ({ id: r.id, followers: [80, 250, 600][i] * (1 + S.followers / 500) }));
  S.tourney = S.tourney || null;   // campeonato inscrito
  S.collab = S.collab || null;     // collab marcada para a próxima live
  S.tourneyWins = S.tourneyWins || 0;
}
pack2Defaults();

const hired = id => S.staff.includes(id);

/* ---------- Funcionários ---------- */

function hire(id) {
  if (busy() || hired(id)) return;
  const st = STAFF.find(s => s.id === id);
  if (S.money < st.salary * 3) return toast('Você precisa ter pelo menos 3 dias de salário guardados.', 'bad');
  S.staff.push(id);
  toast(`${st.icon} ${st.name} contratado!`, 'goal');
  changed();
}

function fire(id) {
  S.staff = S.staff.filter(s => s !== id);
  toast('Funcionário demitido.');
  changed();
}

/* ---------- Campeonato ---------- */

function tourneyTier() {
  return Math.min(5, Math.floor(Math.log10(Math.max(10, S.followers))));
}

function joinTourney() {
  if (busy() || S.tourney) return;
  const tier = tourneyTier();
  const fee = 300 * tier;
  if (S.money < fee) return toast('Dinheiro insuficiente para a inscrição.', 'bad');
  S.money -= fee;
  S.tourney = { target: 60 + tier * 20, prize: 3000 * tier * tier, followers: 200 * tier * tier };
  toast(`🏆 Inscrito! Na próxima live, jogue você mesmo e faça ${S.tourney.target} pontos.`, 'goal');
  changed();
}

/* ---------- Collab ---------- */

function inviteCollab() {
  if (busy() || S.collab) return;
  if (S.energy < 10) return toast('Você está cansado demais. Vá dormir! 😴', 'bad');
  S.energy -= 10;
  const name = pick(COLLAB_STREAMERS);
  if (Math.random() < 0.3) {
    toast(`😢 ${name} recusou o convite. Tente outro dia.`, 'bad');
  } else {
    S.collab = { name, viewers: Math.round(50 + 3 * Math.pow(S.followers, 0.6) * rand(0.3, 0.8)) };
    toast(`🤝 ${name} topou a collab! Ela acontece na sua próxima live.`, 'goal');
  }
  changed();
}

/* ---------- Skins dos seus jogos ---------- */

function launchSkins(id) {
  const g = S.myGames.find(x => x.id === id);
  if (!g || g.skins || busy()) return;
  const cost = 2000;
  if (S.money < cost) return toast('Dinheiro insuficiente para criar as skins.', 'bad');
  S.money -= cost;
  g.skins = true;
  toast(`🎨 Loja de skins aberta em ${g.name}! Rende todo dia.`, 'goal');
  changed();
}

const skinIncome = g => (g.skins ? Math.round(g.sold * 0.02 * (g.score / 10)) : 0);

/* ---------- Todo dia ---------- */

function pack2Daily() {
  // Salários
  let paid = 0;
  for (const id of [...S.staff]) {
    const st = STAFF.find(s => s.id === id);
    if (S.money >= st.salary) {
      S.money -= st.salary;
      paid += st.salary;
    } else {
      S.staff = S.staff.filter(s => s !== id);
      toast(`😠 ${st.name} pediu demissão: salário atrasado!`, 'bad');
    }
  }
  if (paid) toast(`💸 Salários da equipe: -${money(paid)}`);
  if (hired('dev') && S.project && S.project.progress < S.project.target) {
    S.project.progress = Math.min(S.project.target, S.project.progress + 15);
    S.project.bugs += 2;
  }
  if (hired('manager')) {
    const v = Math.round(500 + Math.pow(S.followers, 0.6) * 2);
    S.money += v;
    toast(`💼 O empresário fechou um patrocínio: +${money(v)}`);
  }
  // Skins
  const skins = S.myGames.reduce((t, g) => t + skinIncome(g), 0);
  if (skins) {
    S.money += skins;
    toast(`🎨 Venda de skins nos seus jogos: +${money(skins)}`);
  }
  // Rivais crescem
  const before = rankOf();
  for (const r of S.rivals) r.followers *= rand(1.02, 1.09) / (1 + r.followers / 5e6);
  const after = rankOf();
  if (after < before) toast(`📊 Você subiu para ${after}º no ranking de streamers!`, 'goal');
  if (after > before) toast(`📊 Um rival te passou no ranking. Você está em ${after}º.`, 'bad');
}

function rankOf() {
  return 1 + S.rivals.filter(r => r.followers > S.followers).length;
}

/* ---------- Interface ---------- */

function renderCareer() {
  pack2Defaults();
  const lock = busy() ? 'disabled' : '';
  const list = S.rivals.map(r => ({ ...RIVALS.find(x => x.id === r.id), followers: r.followers }))
    .concat([{ name: 'Você', emoji: '⭐', followers: S.followers, me: true }])
    .sort((a, b) => b.followers - a.followers);
  $('#rank-list').innerHTML = list.map((r, i) =>
    `<li class="${r.me ? 'me' : ''}"><b>${i + 1}º</b><span>${r.emoji} ${r.name}</span><span class="muted">${num(r.followers)} seguidores</span></li>`).join('');

  $('#staff-list').innerHTML = STAFF.map(st => `<div class="item">
    <div class="slot-icon">${st.icon}</div>
    <div class="slot-info"><div class="slot-name">${st.name}</div><div class="muted">${st.desc} · ${money(st.salary)}/dia</div></div>
    ${hired(st.id)
      ? `<button class="btn small ghost" data-action="fire" data-id="${st.id}" ${lock}>Demitir</button>`
      : `<button class="btn small" data-action="hire" data-id="${st.id}" ${lock}>Contratar</button>`}
  </div>`).join('');

  const tier = tourneyTier();
  $('#tourney-card').innerHTML = `<h2>🏆 Campeonato</h2>
    ${S.tourney
      ? `<p>Inscrito! Na próxima live, clique em <b>🎮 Jogar eu mesmo</b> e faça <b>${S.tourney.target} pontos</b>.</p>
        <p class="muted">Prêmio: ${money(S.tourney.prize)} e +${num(S.tourney.followers)} seguidores.</p>`
      : `<p>Jogue a simulação de verdade na live e faça a pontuação mínima para ganhar.</p>
        <p class="muted">Divisão ${tier}: meta de ${60 + tier * 20} pontos · prêmio ${money(3000 * tier * tier)} · inscrição ${money(300 * tier)}</p>
        <button class="btn" data-action="join-tourney" ${lock || S.money < 300 * tier ? 'disabled' : ''}>Inscrever-se</button>`}
    <p class="muted">Campeonatos vencidos: ${S.tourneyWins}</p>`;

  $('#collab-card').innerHTML = `<h2>🤝 Collab</h2>
    ${S.collab
      ? `<p><b>${S.collab.name}</b> vai entrar na sua próxima live e trazer uns ${num(S.collab.viewers)} espectadores!</p>`
      : `<p>Convide outro streamer para uma live juntos. O público dele vem junto.</p>
        <button class="btn" data-action="invite-collab" ${lock || S.energy < 10 ? 'disabled' : ''}>Mandar convite (⚡10)</button>`}`;

  $('#skins-list').innerHTML = S.myGames.length
    ? S.myGames.slice().reverse().slice(0, 10).map(g => `<div class="item">
      <div class="slot-info"><div class="slot-name">${esc(g.name)}</div>
        <div class="muted">${num(g.sold)} cópias${g.skins ? ` · skins rendem ${money(skinIncome(g))}/dia` : ''}</div></div>
      ${g.skins ? '<span class="chip ok">🎨 Skins à venda</span>'
        : `<button class="btn small" data-action="skins" data-id="${g.id}" ${lock || S.money < 2000 ? 'disabled' : ''}>Criar skins (${money(2000)})</button>`}
    </div>`).join('')
    : '<p class="muted">Lance jogos na aba Dev para vender skins neles.</p>';
}

/* ---------- Ligando nas funções existentes ---------- */

const _render2 = render;
render = function () { _render2(); renderCareer(); renderDecor(); };

const _gearMult = gearMult;
gearMult = function () { return _gearMult() * (hired('editor') ? 1.08 : 1) * (hired('mod') ? 1.03 : 1); };

const _addChat2 = addChat;
addChat = function (name, text, cls = '') {
  if (cls === 'hater' && hired('mod')) return _addChat2('🛡️ Moderador', 'baniu um hater do chat', 'sys');
  _addChat2(name, text, cls);
};

const _startLive = startLive;
startLive = function () {
  _startLive();
  if (live && S.collab) {
    live.raid += S.collab.viewers;
    liveBanner(`🤝 Collab com ${S.collab.name}! O público dele chegou na sua live.`);
    S.collab = null;
  }
  if (live && S.tourney) liveBanner(`🏆 CAMPEONATO! Clique em "Jogar eu mesmo" e faça ${S.tourney.target} pontos.`);
};

const _endLive2 = endLive;
endLive = function (reason) {
  if (S.tourney && sim) {
    const T = S.tourney;
    S.tourney = null;
    if (sim.manual && sim.score >= T.target) {
      S.money += T.prize;
      S.followers += T.followers;
      S.tourneyWins++;
      toast(`🏆 VOCÊ VENCEU O CAMPEONATO! +${money(T.prize)} e +${num(T.followers)} seguidores`, 'goal');
    } else {
      toast(`😢 Você perdeu o campeonato (${sim.score}/${T.target} pontos${sim.manual ? '' : ', e nem jogou você mesmo'}).`, 'bad');
    }
  }
  _endLive2(reason);
};

const _extrasDaily2 = extrasDaily;
extrasDaily = function () { _extrasDaily2(); pack2Daily(); };

const _handleLabAction2 = handleLabAction;
handleLabAction = function (d) {
  switch (d.action) {
    case 'hire': return hire(d.id);
    case 'fire': return fire(d.id);
    case 'join-tourney': return joinTourney();
    case 'invite-collab': return inviteCollab();
    case 'skins': return launchSkins(Number(d.id));
    default: return _handleLabAction2(d);
  }
};

// Decoração: itens de "Equipamento de live" com enfeite aparecem na parede da live.
function renderDecor() {
  const el = $('#desk-decor');
  if (el) el.innerHTML = S.gear.map(id => PART_BY_ID[id].decor).filter(Boolean).map(d => `<span>${d}</span>`).join('');
}

render();
