'use strict';

// Missões diárias: 3 por dia, sorteadas conforme a sua fase. Completam sozinhas.
// Cada missão compara um "contador" com o valor que ele tinha no começo do dia.

const soldTotal = () => S.myGames.reduce((t, g) => t + g.sold, 0);
const reward = mult => Math.round((200 + Math.pow(S.followers, 0.6) * 3) * mult);

const MISSIONS = [
  { id: 'lives', text: n => `Faça ${n} lives`, metric: () => S.stats.lives, target: () => 2, mult: 1 },
  { id: 'earn', text: n => `Ganhe ${money(n)} em lives`, metric: () => S.stats.earned, target: () => Math.round(100 + Math.pow(S.followers, 0.6) * 6), mult: 1.2 },
  { id: 'followers', text: n => `Ganhe ${num(n)} seguidores`, metric: () => S.followers, target: () => Math.max(5, Math.round(Math.pow(S.followers, 0.6) * 0.8)), mult: 1.2 },
  { id: 'play', text: () => 'Faça 50 pontos jogando você mesmo numa live', metric: () => S.missionPlays || 0, target: () => 1, mult: 1.5 },
  { id: 'pet', text: () => 'Alimente a capivara', metric: () => (S.counts ? S.counts.pet : 0), target: () => 1, mult: 0.5 },
  { id: 'study', text: () => 'Estude uma vez', metric: () => S.skills.code + S.skills.art + S.skills.sound, target: () => 1, mult: 0.8, when: () => S.phase2 },
  { id: 'sell', text: n => `Venda ${num(n)} cópias dos seus jogos`, metric: soldTotal, target: () => Math.max(20, Math.round(soldTotal() * 0.1)), mult: 1.3, when: () => S.myGames.length > 0 },
  { id: 'tourney', text: () => 'Vença um campeonato', metric: () => S.tourneyWins || 0, target: () => 1, mult: 3, when: () => S.followers >= 100 },
];

function newMissions() {
  const pool = MISSIONS.filter(m => !m.when || m.when());
  const picked = [];
  while (picked.length < 3 && pool.length) picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  S.missions = { day: S.day, bonus: false, list: picked.map(m => ({ id: m.id, base: m.metric(), target: m.target(), reward: reward(m.mult), done: false })) };
}

function checkMissions() {
  if (!S.missions || S.missions.day !== S.day) newMissions();
  let changedAny = false;
  for (const m of S.missions.list) {
    const def = MISSIONS.find(x => x.id === m.id);
    if (!m.done && def.metric() - m.base >= m.target) {
      m.done = true;
      changedAny = true;
      S.money += m.reward;
      toast(`📋 Missão cumprida: ${def.text(m.target)}! +${money(m.reward)}`, 'goal');
    }
  }
  if (!S.missions.bonus && S.missions.list.every(m => m.done)) {
    S.missions.bonus = true;
    changedAny = true;
    const bonus = reward(3);
    S.money += bonus;
    S.energy += 20;
    toast(`🎁 Baú das missões! Todas as 3 cumpridas: +${money(bonus)} e +20 de energia`, 'goal');
  }
  if (changedAny) { saveGame(); renderMissions(); }
}

function renderMissions() {
  if (!S.missions) return;
  const done = S.missions.list.filter(m => m.done).length;
  $('#missions-card').innerHTML = `<h2>📋 Missões do dia ${S.day} <span class="muted">${done}/3</span></h2>
    <ul class="goals">${S.missions.list.map(m => {
      const def = MISSIONS.find(x => x.id === m.id);
      const prog = Math.min(m.target, Math.max(0, def.metric() - m.base));
      return `<li class="${m.done ? 'done' : ''}"><span>${m.done ? '✅' : '⬜'}</span>
        <span class="goal-text">${def.text(m.target)}${m.done || m.target <= 1 ? '' : ` <span class="muted">(${num(prog)}/${num(m.target)})</span>`}</span><b>${money(m.reward)}</b></li>`;
    }).join('')}</ul>
    <p class="muted">${S.missions.bonus ? '🎁 Baú aberto! Novas missões amanhã.' : '🎁 Complete as 3 para abrir o baú bônus. Novas missões todo dia.'}</p>`;
  const tab = $('.tab[data-tab=goals]');
  tab.textContent = done < 3 ? `🏆 Objetivos (${done}/3)` : '🏆 Objetivos';
}

Hooks.on('render', () => { checkMissions(); renderMissions(); });
Hooks.on('daily', () => { newMissions(); });
Hooks.on('liveEnd', () => { if (sim && sim.manual && sim.score >= 50) S.missionPlays = (S.missionPlays || 0) + 1; });
setInterval(() => { if (S.missions) checkMissions(); }, 1500);

checkMissions();
renderMissions();
