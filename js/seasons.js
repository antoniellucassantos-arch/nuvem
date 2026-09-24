'use strict';

// Eventos de temporada: seguem o calendário do jogo e se repetem a cada 60 dias.

const SEASONS = [
  { id: 'carnaval', name: 'Carnaval', icon: '🎭', from: 15, to: 21, decor: '🎭🎉🥁',
    desc: '+30% de público nas lives e o jogo Bloco da Capivara de graça' },
  { id: 'blackfriday', name: 'Black Friday', icon: '🛍️', from: 35, to: 38, decor: '🛍️💸',
    desc: 'Peças com 40% de desconto... mas cuidado com a "Black Fraude"' },
  { id: 'natal', name: 'Natal', icon: '🎄', from: 50, to: 59, decor: '🎄⛄🎁',
    desc: 'Seus jogos vendem 1,5x, presente do Papai Noel todo dia e o jogo Capivara Noel' },
];

function currentSeason() {
  if (typeof S === 'undefined') return null;
  const d = S.day % 60;
  return SEASONS.find(s => d >= s.from && d <= s.to) || null;
}
const inSeason = id => { const s = currentSeason(); return !!s && s.id === id; };

// Jogos que só existem durante a temporada.
GAMES.push(
  { id: 'bloco', season: 'carnaval', sim: 'runner', hero: '💃', foe: '🥁', colors: ['#7e22ce', '#facc15'], emoji: '🎭', name: 'Bloco da Capivara', price: 0, cpu: 8, gpu: 6, ram: 4, pop: 2.4, studio: 'Temporada' },
  { id: 'noel', season: 'natal', sim: 'runner', hero: '🎅', foe: '⛄', colors: ['#14532d', '#dc2626'], emoji: '🎄', name: 'Capivara Noel', price: 0, cpu: 8, gpu: 6, ram: 4, pop: 2.4, studio: 'Temporada' },
);

// Black Fraude: 1 em cada 3 peças "em promoção" na verdade ficou mais cara.
const isFraud = p => [...p.id].reduce((t, c) => t + c.charCodeAt(0), 0) % 3 === 0;

Hooks.on('price', (v, p) => {
  if (!inSeason('blackfriday') || ['house', 'server', 'case'].includes(p.cat)) return v;
  return Math.round(v * (isFraud(p) ? 1.1 : 0.6));
});
Hooks.on('gearMult', v => (inSeason('carnaval') ? v * 1.3 : v));
Hooks.on('sales', u => (inSeason('natal') ? Math.round(u * 1.5) : u));

Hooks.on('daily', () => {
  const s = currentSeason();
  if (s && S.day % 60 === s.from) toast(`${s.icon} Começou a temporada de ${s.name}! ${s.desc}.`, 'goal');
  if (inSeason('natal')) {
    const gift = Math.round(300 + Math.pow(S.followers, 0.6) * 4);
    S.money += gift;
    toast(`🎅 O Papai Noel deixou ${money(gift)} embaixo da árvore!`, 'goal');
  }
});

Hooks.on('bought', p => {
  if (inSeason('blackfriday') && isFraud(p) && !['house', 'server', 'case'].includes(p.cat)) {
    toast('🙃 BLACK FRAUDE! Essa "promoção" era mais cara que o preço normal...', 'bad');
  }
});

Hooks.on('liveStart', () => {
  const s = currentSeason();
  if (s) liveBanner(`${s.icon} Live especial de ${s.name}!`);
});

Hooks.on('render', () => {
  const s = currentSeason();
  document.documentElement.dataset.season = s ? s.id : '';
  const decor = $('#desk-decor');
  if (decor && s) decor.insertAdjacentHTML('beforeend', s.decor.match(/\p{Extended_Pictographic}/gu).map(e => `<span>${e}</span>`).join(''));
  const banner = $('#market-banner');
  if (banner && s) {
    banner.hidden = false;
    banner.innerHTML = `${s.icon} <b>${s.name}!</b> ${s.desc} (até o dia ${S.day - (S.day % 60) + s.to})` + (banner.innerHTML ? '<br>' + banner.innerHTML : '');
  }
});
