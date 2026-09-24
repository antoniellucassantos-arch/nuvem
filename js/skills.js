'use strict';

// Árvore de habilidades do streamer: 1 ponto a cada 3 lives, até 5 níveis por habilidade.

const STREAMER_SKILLS = [
  { id: 'charisma', icon: '✨', name: 'Carisma', per: '+6% de público nas lives' },
  { id: 'stamina', icon: '💪', name: 'Resistência', per: '+10 de energia máxima' },
  { id: 'luck', icon: '🍀', name: 'Sorte', per: '+15% de doações e menos golpes e vírus' },
];
const SKILL_MAX = 5;

const streamerSkills = () => { S.perks = { charisma: 0, stamina: 0, luck: 0, ...(S.perks || {}) }; return S.perks; };
const perk = id => streamerSkills()[id];
const pointsEarned = () => Math.floor(S.stats.lives / 3);
const pointsFree = () => pointsEarned() - Object.values(streamerSkills()).reduce((t, v) => t + v, 0);

Hooks.on('gearMult', v => v * (1 + 0.06 * perk('charisma')));
Hooks.on('maxEnergy', v => v + 10 * perk('stamina'));
Hooks.on('donationChance', v => Math.min(0.8, v * (1 + 0.15 * perk('luck'))));
Hooks.on('scamChance', v => v * (1 - 0.15 * perk('luck')));
Hooks.on('virusChance', v => v * (1 - 0.15 * perk('luck')));

function renderSkillTree() {
  const free = pointsFree();
  $('#skills-card').innerHTML = `<h2>🌳 Habilidades do streamer</h2>
    <p class="muted">Você ganha 1 ponto a cada 3 lives. Pontos livres: <b class="${free ? 'txt-good' : ''}">${free}</b>
    ${free ? '' : ` · próximo ponto em ${3 - (S.stats.lives % 3)} live(s)`}</p>
    ${STREAMER_SKILLS.map(sk => {
      const lvl = perk(sk.id);
      return `<div class="item">
        <div class="slot-icon">${sk.icon}</div>
        <div class="slot-info"><div class="slot-name">${sk.name} <span class="perk-dots">${'●'.repeat(lvl)}${'○'.repeat(SKILL_MAX - lvl)}</span></div>
          <div class="muted">Cada nível: ${sk.per}</div></div>
        <button class="btn small" data-action="perk-up" data-id="${sk.id}" ${!free || lvl >= SKILL_MAX ? 'disabled' : ''}>${lvl >= SKILL_MAX ? 'Máximo' : '+1'}</button>
      </div>`;
    }).join('')}`;
}

Hooks.on('render', renderSkillTree);
Hooks.on('action', d => {
  if (d.action !== 'perk-up' || pointsFree() < 1 || perk(d.id) >= SKILL_MAX) return;
  streamerSkills()[d.id]++;
  const sk = STREAMER_SKILLS.find(s => s.id === d.id);
  toast(`${sk.icon} ${sk.name} subiu para o nível ${perk(d.id)}!`, 'goal');
  changed();
});
renderSkillTree();
