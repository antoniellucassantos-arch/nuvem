'use strict';

// Pacote 3: modo anos 2000. Save separado, peças e jogos da época, monitor de tubo,
// Windows "InfoOS XP" e internet discada. Carregado antes de game.js: troca as listas.

// Era do jogo: 'modern' (hoje), 'retro' (anos 2000) ou 'future' (2077). Cada era tem save próprio.
const GAME_MODE = (() => { try { return localStorage.getItem('inforeal-mode') || 'modern'; } catch { return 'modern'; } })();
const RETRO = GAME_MODE === 'retro';
const FUTURE = GAME_MODE === 'future';

function setMode(mode) {
  try { localStorage.setItem('inforeal-mode', mode); } catch { /* sem armazenamento */ }
  location.reload();
}

if (RETRO) {
  const keep = PARTS.filter(p => ['server', 'house'].includes(p.cat) || /^d\d/.test(p.id) || p.id === 'e12');
  const retroParts = [
    // Processadores
    { id: 'c1', cat: 'cpu', cooler: 'stock', name: 'Intel Pentium III 800MHz', short: 'P3', brand: 'intel', price: 250, unlock: 0, socket: 'Slot 1', score: 3, watts: 30 },
    { id: 'c2', cat: 'cpu', cooler: 'stock', name: 'Intel Pentium 4 2.4GHz', short: 'P4', brand: 'intel', price: 600, unlock: 0, socket: '478', score: 6, watts: 60 },
    { id: 'c3', cat: 'cpu', cooler: 'stock', name: 'AMD Athlon XP 2600+', short: 'Athlon', brand: 'amd', price: 700, unlock: 50, socket: 'Socket A', score: 7, watts: 68 },
    { id: 'c4', cat: 'cpu', cooler: 'tower', name: 'Intel Pentium 4 3.0GHz HT', short: 'P4 HT', brand: 'intel', price: 1400, unlock: 300, socket: '478', score: 10, watts: 82 },
    { id: 'c5', cat: 'cpu', cooler: 'tower', name: 'AMD Athlon 64 FX-55', short: 'FX-55', brand: 'amd', price: 3000, unlock: 1500, socket: '939', score: 15, watts: 104 },
    // Placas-mãe
    { id: 'm1', cat: 'mobo', name: 'PC Chips M810 (Slot 1)', short: 'M810', color: '#2e6b3a', price: 200, unlock: 0, socket: 'Slot 1', ram: 'SDRAM' },
    { id: 'm2', cat: 'mobo', name: 'ASUS P4P800', short: 'P4P800', color: '#6b4b2e', price: 450, unlock: 0, socket: '478', ram: 'DDR' },
    { id: 'm3', cat: 'mobo', name: 'Gigabyte GA-7N400 (Socket A)', short: 'GA-7N400', color: '#1d4a7a', price: 500, unlock: 50, socket: 'Socket A', ram: 'DDR' },
    { id: 'm4', cat: 'mobo', name: 'ASUS A8N-SLI (Socket 939)', short: 'A8N-SLI', color: '#2a2c33', price: 1200, unlock: 1500, socket: '939', ram: 'DDR' },
    // Memória
    { id: 'r1', cat: 'ram', name: 'Pente 128MB SDRAM', price: 100, unlock: 0, gb: 0.125, type: 'SDRAM', sticks: 1 },
    { id: 'r2', cat: 'ram', name: 'Kingston 256MB DDR 400', price: 180, unlock: 0, gb: 0.25, type: 'DDR', sticks: 1 },
    { id: 'r3', cat: 'ram', name: 'Kingston 512MB DDR 400', price: 350, unlock: 50, gb: 0.5, type: 'DDR', sticks: 1 },
    { id: 'r4', cat: 'ram', name: 'Corsair XMS 1GB (2x512MB) DDR', price: 700, unlock: 300, gb: 1, type: 'DDR', sticks: 2 },
    { id: 'r5', cat: 'ram', name: 'Corsair XMS 2GB (2x1GB) DDR', price: 1400, unlock: 1500, gb: 2, type: 'DDR', sticks: 2, rgb: true },
    // Placas de vídeo
    { id: 'g1', cat: 'gpu', name: 'Vídeo onboard (3D? Que 3D?)', short: 'Onboard', brand: 'intel', price: 100, unlock: 0, score: 1, watts: 5, fans: 0, len: 90 },
    { id: 'g2', cat: 'gpu', name: 'NVIDIA GeForce FX 5200', short: 'FX 5200', brand: 'nvidia', price: 400, unlock: 0, score: 4, watts: 25, fans: 1, len: 140 },
    { id: 'g3', cat: 'gpu', name: 'ATI Radeon 9600 Pro', short: 'Radeon 9600', brand: 'amd', price: 800, unlock: 50, score: 7, watts: 35, fans: 1, len: 160 },
    { id: 'g4', cat: 'gpu', name: 'NVIDIA GeForce 6800 GT', short: '6800 GT', brand: 'nvidia', price: 1800, unlock: 300, score: 11, watts: 70, fans: 1, len: 200 },
    { id: 'g5', cat: 'gpu', name: 'ATI Radeon X850 XT', short: 'X850 XT', brand: 'amd', price: 3200, unlock: 1500, score: 15, watts: 90, fans: 2, len: 220 },
    // Armazenamento
    { id: 's1', cat: 'storage', name: 'HD Seagate 20GB IDE', kind: 'hdd', price: 150, unlock: 0, speed: 1 },
    { id: 's2', cat: 'storage', name: 'HD Western Digital 80GB IDE', kind: 'hdd', price: 300, unlock: 0, speed: 2 },
    { id: 's3', cat: 'storage', name: 'HD Western Digital Raptor 74GB SATA', kind: 'hdd', price: 900, unlock: 300, speed: 3 },
    // Fontes
    { id: 'p1', cat: 'psu', name: 'Fonte Genérica 200W "real"', short: 'GENÉRICA', price: 60, unlock: 0, watts: 200, generic: true },
    { id: 'p2', cat: 'psu', name: 'Fonte Seventeam 350W', short: 'ST-350', price: 250, unlock: 0, watts: 350 },
    { id: 'p3', cat: 'psu', name: 'Fonte Antec TruePower 480W', short: 'TP-480', price: 600, unlock: 300, watts: 480 },
    // Gabinetes
    { id: 'k1', cat: 'case', name: 'Gabinete bege', price: 0, unlock: 0, mult: 1, look: { theme: 'beige', fans: 1, rgb: false } },
    { id: 'k2', cat: 'case', name: 'Gabinete com janela e neon azul', price: 300, unlock: 0, mult: 1.05, look: { theme: 'dark', fans: 2, rgb: true } },
    // Equipamentos da época
    { id: 'e1', cat: 'gear', name: 'Headset com microfone de R$ 20', price: 40, unlock: 0, mult: 1.05 },
    { id: 'e2', cat: 'gear', name: 'Webcam Creative 0,3 megapixel', price: 200, unlock: 0, mult: 1.1 },
    { id: 'e8', cat: 'gear', name: 'Estabilizador SMS', price: 150, unlock: 0, mult: 1, desc: 'Segura a live quando a luz pisca' },
    { id: 'e9', cat: 'gear', name: 'Banda larga Velox 1 Mega', price: 600, unlock: 50, mult: 1.2, desc: 'Adeus internet discada! +20% de público' },
    { id: 'e13', cat: 'gear', name: 'Antivírus AVG', price: 0, unlock: 0, mult: 1, desc: 'Grátis! Remove e bloqueia vírus' },
  ];
  PARTS.splice(0, PARTS.length, ...retroParts, ...keep);

  const retroGames = [
    { id: 'paciencia', sim: 'runner', hero: '🃏', foe: '♠️', colors: ['#0b5d1e', '#3aa655'], emoji: '🃏', name: 'Paciência do Windows XP', price: 0, cpu: 1, gpu: 1, ram: 0.125, pop: 0.6 },
    { id: 'fogo', sim: 'puzzle', hero: '💣', foe: '💣', colors: ['#6b7280', '#d1d5db'], emoji: '💣', name: 'Campo Minado Turbo', price: 0, cpu: 1, gpu: 1, ram: 0.125, pop: 0.8 },
    { id: 'moba', sim: 'rpg', hero: '🧙', foe: '👹', colors: ['#1a237e', '#7c4dff'], emoji: '🧙', name: 'DotZ (mapa de Guerracraft)', price: 0, cpu: 4, gpu: 3, ram: 0.25, pop: 1.3 },
    { id: 'cs', sim: 'shooter', hero: '🔫', foe: '🥷', colors: ['#3e2723', '#c49a45'], emoji: '🔫', name: 'Contra-Ataque 1.6', price: 0, cpu: 5, gpu: 4, ram: 0.25, pop: 1.6 },
    { id: 'blocks', sim: 'runner', hero: '🧝', foe: '🐉', colors: ['#1f3a1a', '#9ccc65'], emoji: '🗡️', name: 'Tíbio Online', price: 30, cpu: 3, gpu: 2, ram: 0.25, pop: 1.4 },
    { id: 'gta', sim: 'racer', hero: '🚗', foe: '🚓', colors: ['#3b2a12', '#f59e0b'], emoji: '🌴', name: 'GTZ: San Andreias', price: 90, cpu: 7, gpu: 7, ram: 0.5, pop: 2.2 },
    { id: 'cyber', sim: 'racer', hero: '🏎️', foe: '🚙', colors: ['#1e1b4b', '#22d3ee'], emoji: '🏁', name: 'Need for Velocidade Underground', price: 120, cpu: 9, gpu: 10, ram: 0.5, pop: 2.4 },
    { id: 'simsim', sim: 'soccer', hero: '🏠', foe: '🔥', colors: ['#14532d', '#86efac'], emoji: '💎', name: 'The Simz 2', price: 150, cpu: 12, gpu: 12, ram: 1, pop: 2.8 },
  ];
  GAMES.splice(0, GAMES.length, ...retroGames);

  RELEASES.splice(0, RELEASES.length,
    { day: 10, part: { id: 'rx1', cat: 'gpu', name: 'NVIDIA GeForce 7800 GTX', short: '7800 GTX', brand: 'nvidia', price: 3800, unlock: 0, score: 18, watts: 100, fans: 2, len: 230 } },
    { day: 15, game: { id: 'wow', sim: 'shooter', hero: '🧙', foe: '🐺', colors: ['#1e3a8a', '#fbbf24'], emoji: '⚔️', name: 'Mundo de Guerracraft', price: 100, cpu: 10, gpu: 10, ram: 1, pop: 3, studio: 'Blizzardo' } },
    { day: 25, part: { id: 'rx2', cat: 'cpu', cooler: 'tower', name: 'Intel Core 2 Duo E6600', short: 'Core 2', brand: 'intel', price: 2500, unlock: 0, socket: 'LGA775', score: 22, watts: 65 } },
    { day: 25, part: { id: 'rx3', cat: 'mobo', name: 'ASUS P5B (LGA775)', short: 'P5B', color: '#1d3350', price: 900, unlock: 0, socket: 'LGA775', ram: 'DDR' } },
    { day: 35, game: { id: 'crysis', sim: 'shooter', hero: '🔫', foe: '👽', colors: ['#052e16', '#4ade80'], emoji: '🌴', name: 'Crise (roda no seu PC?)', price: 150, cpu: 20, gpu: 22, ram: 2, pop: 3.5, studio: 'Cryteca' } },
  );
  for (const r of RELEASES) {
    if (r.part) PARTS.push({ ...r.part, day: r.day });
    if (r.game) GAMES.push({ ...r.game, day: r.day });
  }
  document.documentElement.classList.add('retro');
}
