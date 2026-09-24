'use strict';

// Lançamentos do mercado: com o passar dos dias, as marcas lançam peças novas e
// outras empresas lançam jogos novos (cada vez mais pesados). Depois da lista
// escrita à mão, os lançamentos continuam sendo gerados para sempre.

const RELEASES = [
  { day: 4, game: { id: 'fogomax', sim: 'shooter', hero: '🔥', foe: '🪖', colors: ['#5c1300', '#ffb01a'], emoji: '🔥', name: 'Fogo Livre MAX', price: 0, cpu: 20, gpu: 20, ram: 8, pop: 1.5, studio: 'Garena Fake' } },
  { day: 7, part: { id: 'x1', cat: 'gpu', name: 'NVIDIA GeForce RTX 5060', short: 'RTX 5060', brand: 'nvidia', price: 2200, unlock: 0, score: 62, watts: 145, fans: 2, len: 200 } },
  { day: 10, game: { id: 'blocks2', sim: 'runner', hero: '⛏️', foe: '🟩', colors: ['#1f4d1a', '#a3e635'], emoji: '🧱', name: 'Mine Blocks 2', price: 90, cpu: 18, gpu: 22, ram: 8, pop: 1.6, studio: 'Bloco Studios' } },
  { day: 14, part: { id: 'x2', cat: 'cpu', cooler: 'tower', name: 'AMD Ryzen 5 9600X', short: 'Ryzen 5', brand: 'amd', price: 1600, unlock: 0, socket: 'AM5', score: 62, watts: 105 } },
  { day: 18, game: { id: 'br', sim: 'shooter', hero: '🪂', foe: '🎯', colors: ['#0c4a6e', '#fbbf24'], emoji: '🪂', name: 'Batalha Real Brasil', price: 0, cpu: 40, gpu: 50, ram: 16, pop: 2.3, studio: 'Tupi Games' } },
  { day: 22, part: { id: 'x3', cat: 'gpu', name: 'AMD Radeon RX 9070 XT', short: 'RX 9070 XT', brand: 'amd', price: 4800, unlock: 0, score: 110, watts: 304, fans: 3, len: 250 } },
  { day: 26, part: { id: 'x4', cat: 'ram', name: 'Kingston Fury Renegade 48GB (2x24GB) DDR5', price: 1600, unlock: 0, gb: 48, type: 'DDR5', sticks: 2, rgb: true } },
  { day: 30, game: { id: 'gta6', sim: 'racer', hero: '🏎️', foe: '🚓', colors: ['#3b0764', '#f472b6'], emoji: '🌴', name: 'GTZ VI', price: 350, cpu: 70, gpu: 100, ram: 16, pop: 3.3, studio: 'Rockstar Fake' } },
  // Soquete novo da Intel: precisa trocar a placa-mãe junto!
  { day: 34, part: { id: 'x5', cat: 'mobo', name: 'ASUS ROG Maximus Z890 Hero', short: 'Z890', color: '#121217', price: 4200, unlock: 0, socket: 'LGA1851', ram: 'DDR5' } },
  { day: 34, part: { id: 'x6', cat: 'cpu', cooler: 'aio', name: 'Intel Core Ultra 9 285K', short: 'Ultra 9', brand: 'intel', price: 4500, unlock: 0, socket: 'LGA1851', score: 140, watts: 250 } },
  { day: 40, game: { id: 'cyber2', sim: 'racer', hero: '🏍️', foe: '🤖', colors: ['#1a0536', '#22d3ee'], emoji: '🦾', name: 'Cyberfuturo 2', price: 300, cpu: 90, gpu: 140, ram: 32, pop: 3.5, studio: 'CD Projekt Fake' } },
  { day: 46, part: { id: 'x7', cat: 'psu', name: 'Corsair AX1600i 80 Plus Titanium', short: 'AX1600i', price: 3200, unlock: 0, watts: 1600 } },
  { day: 50, part: { id: 'x8', cat: 'gpu', name: 'NVIDIA GeForce RTX 6090', short: 'RTX 6090', brand: 'nvidia', price: 22000, unlock: 0, score: 230, watts: 650, fans: 3, len: 270 } },
  { day: 56, game: { id: 'simsim2', sim: 'runner', hero: '🌀', foe: '🧊', colors: ['#082f49', '#e0f2fe'], emoji: '🌀', name: 'Simulador de Simulador 2', price: 400, cpu: 150, gpu: 200, ram: 48, pop: 4, studio: 'Meta Meta Games' } },
  { day: 64, part: { id: 'x9', cat: 'cpu', cooler: 'aio', name: 'AMD Ryzen 9 11950X3D', short: 'Ryzen 9', brand: 'amd', price: 6500, unlock: 0, socket: 'AM5', score: 175, watts: 200 } },
  { day: 72, part: { id: 'x10', cat: 'ram', name: 'G.Skill Trident Z5 RGB 96GB (2x48GB) DDR5', price: 3500, unlock: 0, gb: 96, type: 'DDR5', sticks: 2, rgb: true } },
  { day: 80, game: { id: 'realtotal', sim: 'shooter', hero: '🥽', foe: '👽', colors: ['#020617', '#a3e635'], emoji: '🥽', name: 'Realidade Total', price: 500, cpu: 180, gpu: 260, ram: 64, pop: 4.6, studio: 'Futuro Interativo' } },
];

// Depois do dia 80: um lançamento a cada 10 dias, para sempre (até o dia ~1000).
(function generateFuture() {
  const GAME_NAMES = ['Realidade Total', 'Mega Mundo', 'Infinito Online', 'Capivara Galáctica', 'Neon Brasil', 'Guerra dos Robôs'];
  const GAME_LOOKS = [['🥽', '👽', 'shooter'], ['🌍', '🌋', 'runner'], ['♾️', '🧿', 'runner'], ['🦫', '🛸', 'runner'], ['🌃', '🚓', 'racer'], ['🤖', '🦾', 'shooter']];
  const GAME_COLORS = [['#020617', '#a3e635'], ['#0f172a', '#f97316'], ['#1e1b4b', '#818cf8'], ['#052e16', '#4ade80'], ['#2e1065', '#f0abfc'], ['#111827', '#ef4444']];
  for (let n = 1; n <= 92; n++) {
    const day = 80 + n * 10;
    const gen = Math.ceil(n / 4);        // cada "geração" tem 4 lançamentos
    const up = Math.pow(1.3, gen);
    switch (n % 4) {
      case 1:
        RELEASES.push({ day, part: { id: `fx${n}`, cat: 'gpu', name: `NVIDIA GeForce RTX ${6 + gen}090`, short: `RTX ${6 + gen}090`, brand: 'nvidia',
          price: Math.round(22000 * Math.pow(1.2, gen) / 100) * 100, unlock: 0, score: Math.round(230 * up), watts: 650 + 40 * gen, fans: 3, len: 270 } });
        break;
      case 2:
        RELEASES.push({ day, part: { id: `fx${n}`, cat: 'cpu', cooler: 'aio', name: `AMD Ryzen 9 ${11 + gen}950X3D`, short: 'Ryzen 9', brand: 'amd',
          price: Math.round(6500 * Math.pow(1.15, gen) / 100) * 100, unlock: 0, socket: 'AM5', score: Math.round(175 * up), watts: 200 + 10 * gen } });
        break;
      case 3: {
        const i = gen % GAME_NAMES.length;
        const [emoji, foe, sim] = GAME_LOOKS[i];
        RELEASES.push({ day, game: { id: `fg${n}`, sim, hero: emoji, foe, colors: GAME_COLORS[i], emoji, name: `${GAME_NAMES[i]} ${gen + 1}`,
          price: 500, cpu: Math.round(180 * Math.pow(1.25, gen)), gpu: Math.round(260 * up), ram: Math.min(128, 64 * Math.ceil(gen / 3)),
          pop: Math.round((4.6 + 0.3 * gen) * 10) / 10, studio: 'Futuro Interativo' } });
        break;
      }
      default:
        RELEASES.push({ day, part: { id: `fx${n}`, cat: gen % 2 ? 'psu' : 'ram', ...(gen % 2
          ? { name: `Corsair AX${1600 + 400 * gen}i 80 Plus Titanium`, short: `AX${1600 + 400 * gen}i`, price: 3200 + 800 * gen, unlock: 0, watts: 1600 + 400 * gen }
          : { name: `G.Skill Trident Z5 RGB ${Math.min(256, 96 * gen)}GB DDR5`, price: 3500 * gen, unlock: 0, gb: Math.min(256, 96 * gen), type: 'DDR5', sticks: 2, rgb: true }) } });
    }
  }
})();

// Os lançamentos entram nas listas da loja e dos jogos (ficam escondidos até o dia chegar).
for (const r of RELEASES) {
  if (r.part) PARTS.push({ ...r.part, day: r.day });
  if (r.game) GAMES.push({ ...r.game, day: r.day });
}

const isReleased = x => (!x.day || S.day >= x.day) && (!x.season || (typeof currentSeason === 'function' && currentSeason() && currentSeason().id === x.season));
const isNew = x => x.day && S.day >= x.day && S.day - x.day < 7;

// Jogo recém-lançado chega com hype; com o tempo, todo jogo vai ficando velho.
function freshness(g) {
  if (g.own) return 1;
  const age = S.day - (g.day || 1);
  if (age < 20) return g.day ? 1 + 0.6 * (1 - age / 20) : 1;
  return Math.max(0.6, 1 - (age - 20) / 150);
}

function freshnessLabel(g) {
  if (g.own) return '';
  const f = freshness(g);
  return f > 1.2 ? '🆕 Lançamento' : f >= 0.95 ? '🔥 Em alta' : f > 0.75 ? 'Esfriando' : '🧓 Antigo';
}

// Peças ficam mais baratas com o tempo (até 45% de desconto).
function priceOf(p) {
  if (['gear', 'case', 'server'].includes(p.cat)) return Hooks.filter('price', p.price, p);
  const age = S.day - (p.day || 1);
  return Hooks.filter('price', Math.round(p.price * Math.max(0.55, 1 - age * 0.004)), p);
}

// Avisa os lançamentos entre dois dias (ao dormir).
function announceReleases(fromDay, toDay) {
  for (const r of RELEASES) {
    if (r.day > fromDay && r.day <= toDay) {
      toast(r.part ? `🆕 Chegou às lojas: ${r.part.name}!` : `🎮 Novo jogo lançado: ${r.game.name}!`, 'goal');
    }
  }
}

function upcomingReleases(n = 2) {
  return RELEASES.filter(r => r.day > S.day).slice(0, n);
}

function unreadNews() {
  return RELEASES.filter(r => r.day <= S.day && r.day > (S.newsSeen || 0)).length;
}
