// Dados do jogo: peças, jogos, objetivos e mensagens do chat.

const CATS = {
  cpu: 'Processador',
  mobo: 'Placa-mãe',
  ram: 'Memória RAM',
  gpu: 'Placa de vídeo',
  storage: 'Armazenamento',
  psu: 'Fonte',
  case: 'Gabinete',
  gear: 'Equipamento de live',
  house: 'Casa',
  used: 'Usados',
  server: 'Servidor de IA',
};

const CAT_ICONS = {
  cpu: '🧠', mobo: '🟩', ram: '📏', gpu: '🎮', storage: '💾', psu: '🔌', case: '🗄️', gear: '🎙️', server: '🏢', house: '🏠', used: '📦',
};

// Encaixes do gabinete, na ordem em que aparecem na montagem.
const SLOTS = ['cpu', 'mobo', 'ram', 'gpu', 'storage', 'psu'];

// unlock = seguidores necessários para a peça aparecer na loja.
// short, brand, fans, len, sticks, rgb, color e kind só servem para o desenho do gabinete.
const PARTS = [
  // Processadores (o soquete precisa ser o mesmo da placa-mãe)
  { id: 'c1', cat: 'cpu', cooler: 'stock', name: 'Intel Pentium Gold G6400', short: 'Pentium', brand: 'intel', price: 350, unlock: 0, socket: 'LGA1200', score: 10, watts: 58 },
  { id: 'c2', cat: 'cpu', cooler: 'stock', name: 'Intel Core i3-10100F', short: 'Core i3', brand: 'intel', price: 600, unlock: 0, socket: 'LGA1200', score: 20, watts: 65 },
  { id: 'c3', cat: 'cpu', cooler: 'stock', name: 'AMD Ryzen 5 5600', short: 'Ryzen 5', brand: 'amd', price: 800, unlock: 50, socket: 'AM4', score: 35, watts: 65 },
  { id: 'c4', cat: 'cpu', cooler: 'tower', name: 'Intel Core i5-13400F', short: 'Core i5', brand: 'intel', price: 1300, unlock: 300, socket: 'LGA1700', score: 50, watts: 110 },
  { id: 'c5', cat: 'cpu', cooler: 'tower', name: 'AMD Ryzen 7 7800X3D', short: 'Ryzen 7', brand: 'amd', price: 2600, unlock: 1500, socket: 'AM5', score: 85, watts: 120 },
  { id: 'c6', cat: 'cpu', cooler: 'aio', name: 'Intel Core i9-14900K', short: 'Core i9', brand: 'intel', price: 3800, unlock: 3000, socket: 'LGA1700', score: 105, watts: 250 },
  { id: 'c7', cat: 'cpu', cooler: 'aio', name: 'AMD Ryzen 9 9950X3D', short: 'Ryzen 9', brand: 'amd', price: 5000, unlock: 5000, socket: 'AM5', score: 130, watts: 170 },

  // Placas-mãe
  { id: 'm1', cat: 'mobo', name: 'ASUS Prime H410M-E', short: 'H410M', color: '#1d3350', price: 350, unlock: 0, socket: 'LGA1200', ram: 'DDR4' },
  { id: 'm2', cat: 'mobo', name: 'Gigabyte A520M K V2', short: 'A520M', color: '#2a2c33', price: 400, unlock: 50, socket: 'AM4', ram: 'DDR4' },
  { id: 'm3', cat: 'mobo', name: 'ASRock B550M Steel Legend', short: 'B550M', color: '#4a5058', price: 800, unlock: 300, socket: 'AM4', ram: 'DDR4' },
  { id: 'm4', cat: 'mobo', name: 'MSI PRO B760M-A DDR4', short: 'B760M', color: '#23262d', price: 900, unlock: 300, socket: 'LGA1700', ram: 'DDR4' },
  { id: 'm5', cat: 'mobo', name: 'Gigabyte B650 AORUS Elite AX', short: 'B650', color: '#1c1e24', price: 1400, unlock: 1500, socket: 'AM5', ram: 'DDR5' },
  { id: 'm6', cat: 'mobo', name: 'ASUS ROG Strix Z790-E Gaming', short: 'Z790', color: '#1a1a1f', price: 2800, unlock: 3000, socket: 'LGA1700', ram: 'DDR5' },
  { id: 'm7', cat: 'mobo', name: 'ASUS ROG Crosshair X870E Hero', short: 'X870E', color: '#141418', price: 3800, unlock: 5000, socket: 'AM5', ram: 'DDR5' },

  // Memória RAM
  { id: 'r1', cat: 'ram', name: 'Kingston Fury Beast 4GB DDR4', price: 120, unlock: 0, gb: 4, type: 'DDR4', sticks: 1 },
  { id: 'r2', cat: 'ram', name: 'Kingston Fury Beast 8GB DDR4', price: 200, unlock: 0, gb: 8, type: 'DDR4', sticks: 1 },
  { id: 'r3', cat: 'ram', name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4', price: 400, unlock: 50, gb: 16, type: 'DDR4', sticks: 2 },
  { id: 'r4', cat: 'ram', name: 'Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4', price: 800, unlock: 300, gb: 32, type: 'DDR4', sticks: 2, rgb: true },
  { id: 'r5', cat: 'ram', name: 'Kingston Fury Beast 32GB (2x16GB) DDR5', price: 1100, unlock: 1500, gb: 32, type: 'DDR5', sticks: 2 },
  { id: 'r6', cat: 'ram', name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5', price: 2500, unlock: 5000, gb: 64, type: 'DDR5', sticks: 2, rgb: true },

  // Placas de vídeo
  { id: 'g1', cat: 'gpu', name: 'NVIDIA GeForce GT 710', short: 'GT 710', brand: 'nvidia', price: 300, unlock: 0, score: 8, watts: 20, fans: 0, len: 110 },
  { id: 'g2', cat: 'gpu', name: 'AMD Radeon RX 550', short: 'RX 550', brand: 'amd', price: 550, unlock: 0, score: 18, watts: 50, fans: 1, len: 150 },
  { id: 'g3', cat: 'gpu', name: 'NVIDIA GeForce GTX 1650', short: 'GTX 1650', brand: 'nvidia', price: 900, unlock: 50, score: 30, watts: 75, fans: 2, len: 180 },
  { id: 'g4', cat: 'gpu', name: 'AMD Radeon RX 6600', short: 'RX 6600', brand: 'amd', price: 1400, unlock: 300, score: 55, watts: 132, fans: 2, len: 200 },
  { id: 'g5', cat: 'gpu', name: 'NVIDIA GeForce RTX 4070', short: 'RTX 4070', brand: 'nvidia', price: 3800, unlock: 1500, score: 90, watts: 200, fans: 3, len: 240 },
  { id: 'g6', cat: 'gpu', name: 'NVIDIA GeForce RTX 5090', short: 'RTX 5090', brand: 'nvidia', price: 15000, unlock: 5000, score: 160, watts: 575, fans: 3, len: 265 },

  // Armazenamento (a velocidade melhora a retenção do público)
  { id: 's1', cat: 'storage', name: 'Seagate BarraCuda 500GB (HD)', kind: 'hdd', price: 150, unlock: 0, speed: 1 },
  { id: 's2', cat: 'storage', name: 'Kingston A400 240GB (SSD SATA)', kind: 'ssd', price: 180, unlock: 0, speed: 2 },
  { id: 's3', cat: 'storage', name: 'Samsung 990 PRO 1TB (SSD NVMe)', kind: 'nvme', price: 600, unlock: 300, speed: 3 },

  // Fontes (a genérica pode explodir se ficar sobrecarregada)
  { id: 'p1', cat: 'psu', name: 'Fonte Genérica 300W', short: 'GENÉRICA', price: 120, unlock: 0, watts: 300, generic: true },
  { id: 'p2', cat: 'psu', name: 'Corsair CV550 80 Plus Bronze', short: 'CV550', price: 350, unlock: 0, watts: 550 },
  { id: 'p3', cat: 'psu', name: 'Corsair RM750e 80 Plus Gold', short: 'RM750e', price: 700, unlock: 300, watts: 750 },
  { id: 'p4', cat: 'psu', name: 'Corsair RM1000x 80 Plus Gold', short: 'RM1000x', price: 1300, unlock: 1500, watts: 1000 },

  // Gabinetes (compra única, só visual + um pouco de charme na live)
  { id: 'k1', cat: 'case', name: 'Gabinete Básico', price: 0, unlock: 0, mult: 1, look: { theme: 'dark', fans: 1, rgb: false } },
  { id: 'k2', cat: 'case', name: 'Rise Mode Galaxy Glass', price: 250, unlock: 0, mult: 1.03, look: { theme: 'dark', fans: 3, rgb: true } },
  { id: 'k3', cat: 'case', name: 'Corsair 4000D Airflow Branco', price: 550, unlock: 100, mult: 1.04, look: { theme: 'light', fans: 2, rgb: false } },
  { id: 'k4', cat: 'case', name: 'NZXT H5 Flow RGB', price: 700, unlock: 300, mult: 1.05, look: { theme: 'dark', fans: 2, rgb: true } },
  { id: 'k5', cat: 'case', name: 'Lian Li O11 Dynamic EVO Branco', price: 1500, unlock: 1000, mult: 1.08, look: { theme: 'light', fans: 3, rgb: true } },

  // Equipamento de live (compra única, multiplica os espectadores)
  { id: 'e1', cat: 'gear', name: 'Microfone Fifine K669', price: 250, unlock: 0, mult: 1.1 },
  { id: 'e2', cat: 'gear', name: 'Webcam Logitech C920', price: 350, unlock: 0, mult: 1.1 },
  { id: 'e3', cat: 'gear', name: 'Ring light 10"', price: 150, unlock: 50, mult: 1.08 },
  { id: 'e4', cat: 'gear', name: 'Microfone HyperX QuadCast S', price: 800, unlock: 300, mult: 1.12 },
  { id: 'e5', cat: 'gear', name: 'Cadeira DT3 Sports', price: 1300, unlock: 300, mult: 1.06 },
  { id: 'e6', cat: 'gear', name: 'Elgato Green Screen', price: 900, unlock: 1000, mult: 1.12 },
  { id: 'e7', cat: 'gear', name: 'Elgato Stream Deck MK.2', price: 1200, unlock: 1500, mult: 1.1 },
  { id: 'e8', cat: 'gear', name: 'Nobreak APC 1500VA', price: 900, unlock: 50, mult: 1, desc: 'Segura a live quando a luz cai' },
  { id: 'e9', cat: 'gear', name: 'Roteador TP-Link Wi-Fi 6', price: 450, unlock: 50, mult: 1.02, desc: 'A internet não oscila mais' },
  { id: 'e10', cat: 'gear', name: 'Monitor LG UltraGear 27" 144Hz', price: 1600, unlock: 300, mult: 1.04, monitor: 'big' },
  { id: 'e12', cat: 'gear', name: 'Pasta térmica Arctic MX-6', price: 60, unlock: 0, mult: 1, desc: 'Metade do risco de queimar no overclock' },
  { id: 'e13', cat: 'gear', name: 'Antivírus', price: 200, unlock: 0, mult: 1, desc: 'Remove e bloqueia vírus de jogo pirata' },
  { id: 'd1', cat: 'gear', name: 'Pôster do seu jogo favorito', price: 80, unlock: 0, mult: 1.01, decor: '🖼️' },
  { id: 'd2', cat: 'gear', name: 'Planta na mesa', price: 60, unlock: 0, mult: 1.01, decor: '🪴' },
  { id: 'd3', cat: 'gear', name: 'Letreiro neon "LIVE"', price: 600, unlock: 100, mult: 1.04, decor: '🔴' },
  { id: 'd4', cat: 'gear', name: 'Prateleira de bonecos', price: 900, unlock: 300, mult: 1.03, decor: '🦸' },
  { id: 'd5', cat: 'gear', name: 'Fita de LED na parede', price: 250, unlock: 50, mult: 1.02, decor: '🌈' },
  { id: 'd6', cat: 'gear', name: 'Capivara de pelúcia gigante', price: 350, unlock: 0, mult: 1.03, decor: '🦫' },
  { id: 'e11', cat: 'gear', name: 'Monitor Samsung Odyssey G9 49" Ultrawide', price: 7000, unlock: 3000, mult: 1.08, monitor: 'ultra' },

  // Casas (compra única; cada uma dá +10 de energia máxima)
  { id: 'h0', cat: 'house', name: 'Quarto na casa da mãe', price: 0, unlock: 0, desc: 'A mãe manda desligar o PC de noite' },
  { id: 'h1', cat: 'house', name: 'Kitnet', price: 20000, unlock: 0, desc: '+10 de energia · sem mãe mandando desligar' },
  { id: 'h2', cat: 'house', name: 'Apartamento com vista', price: 150000, unlock: 0, desc: '+20 de energia' },
  { id: 'h3', cat: 'house', name: 'Mansão gamer', price: 2000000, unlock: 0, desc: '+30 de energia' },
  { id: 'h4', cat: 'house', name: 'Prédio da sua empresa', price: 20000000, unlock: 0, desc: '+40 de energia' },

  // Servidor de IA (Fase 3 em diante): as super peças para criar sua própria IA
  { id: 'sv0', cat: 'server', kind: 'rack', name: 'Rack 42U com refrigeração líquida', price: 80000, unlock: 0 },
  { id: 'sv1', cat: 'server', kind: 'cpu', name: 'AMD EPYC 9654 (96 núcleos)', price: 60000, unlock: 0 },
  { id: 'sv2', cat: 'server', kind: 'gpu', name: 'NVIDIA A100 80GB', price: 60000, unlock: 0, compute: 40, watts: 400 },
  { id: 'sv3', cat: 'server', kind: 'gpu', name: 'AMD Instinct MI300X', price: 120000, unlock: 0, compute: 75, watts: 750 },
  { id: 'sv4', cat: 'server', kind: 'gpu', name: 'NVIDIA H100 80GB', price: 150000, unlock: 0, compute: 90, watts: 700 },
  { id: 'sv5', cat: 'server', kind: 'gpu', name: 'NVIDIA H200 141GB', price: 250000, unlock: 0, compute: 130, watts: 700 },
  { id: 'sv6', cat: 'server', kind: 'gpu', name: 'NVIDIA B200', price: 400000, unlock: 0, compute: 200, watts: 1000 },
];

// cpu/gpu/ram = requisitos para rodar a 60 FPS. pop = popularidade do jogo.
const GAMES = [
  { id: 'paciencia', sim: 'runner', hero: '🃏', foe: '♠️', colors: ['#0f5132', '#1b8a5a'], emoji: '🃏', name: 'Paciência Ultra', price: 0, cpu: 5, gpu: 3, ram: 4, pop: 0.5 },
  { id: 'fogo', sim: 'shooter', hero: '🔥', foe: '🪖', colors: ['#7a1f00', '#ff7a1a'], emoji: '🔥', name: 'Fogo Livre', price: 0, cpu: 12, gpu: 10, ram: 4, pop: 1.1 },
  { id: 'blocks', sim: 'runner', hero: '⛏️', foe: '🟩', colors: ['#2d5a27', '#7cb342'], emoji: '⛏️', name: 'Mine Blocks', price: 60, cpu: 10, gpu: 8, ram: 4, pop: 1.0 },
  { id: 'moba', sim: 'shooter', hero: '🧙', foe: '👹', colors: ['#1a237e', '#7c4dff'], emoji: '🧙', name: 'Liga das Lendas', price: 0, cpu: 15, gpu: 12, ram: 8, pop: 1.3 },
  { id: 'cs', sim: 'shooter', hero: '🔫', foe: '🥷', colors: ['#3e2723', '#c49a45'], emoji: '🔫', name: 'Contra-Ataque 2', price: 0, cpu: 25, gpu: 25, ram: 8, pop: 1.5 },
  { id: 'gta', sim: 'racer', hero: '🚗', foe: '🚓', colors: ['#0d3b66', '#f95738'], emoji: '🚗', name: 'GTZ: Cidade Grande', price: 120, cpu: 35, gpu: 45, ram: 16, pop: 2.0 },
  { id: 'cyber', sim: 'racer', hero: '🏍️', foe: '🚙', colors: ['#2b0a3d', '#f3e600'], emoji: '🤖', name: 'Cyberfuturo 2099', price: 250, cpu: 60, gpu: 80, ram: 16, pop: 2.6 },
  { id: 'simsim', sim: 'runner', hero: '🌀', foe: '🧊', colors: ['#0b3954', '#bfd7ea'], emoji: '🌀', name: 'Simulador de Simulador', price: 400, cpu: 100, gpu: 130, ram: 32, pop: 3.5 },
];

const GOALS = [
  { id: 'boot', text: 'Monte e ligue seu primeiro PC', reward: 200, check: s => s.pcOn || s.stats.lives > 0 },
  { id: 'live1', text: 'Faça sua primeira live', reward: 100, check: s => s.stats.lives >= 1 },
  { id: 'f100', text: 'Chegue a 100 seguidores', reward: 500, check: s => s.followers >= 100 },
  { id: 'phase2', text: 'Desbloqueie a Fase 2 com 300 seguidores', reward: 300, check: s => s.phase2 },
  { id: 'dev1', text: 'Lance seu primeiro jogo', reward: 500, check: s => s.myGames.length >= 1 },
  { id: 'v100', text: 'Tenha 100 espectadores ao mesmo tempo', reward: 800, check: s => s.stats.bestViewers >= 100 },
  { id: 'm5k', text: 'Junte R$ 5.000', reward: 500, check: s => s.money >= 5000 },
  { id: 'f1000', text: 'Chegue a 1.000 seguidores', reward: 2000, check: s => s.followers >= 1000 },
  { id: 'score8', text: 'Lance um jogo com nota 8 ou mais', reward: 2500, check: s => s.myGames.some(g => g.score >= 8) },
  { id: 'unreal', text: 'Aprenda a usar a Unreal Engine 5', reward: 1500, check: s => s.engines.includes('unreal') },
  { id: 'sold10k', text: 'Venda 10.000 cópias somando todos os seus jogos', reward: 5000, check: s => s.myGames.reduce((t, g) => t + g.sold, 0) >= 10000 },
  { id: 'phase3', text: 'Desbloqueie a Fase 3 (3 jogos lançados e Programação 5)', reward: 5000, check: s => s.phase3 },
  { id: 'ai-born', text: 'Crie sua IA criadora de jogos', reward: 5000, check: s => !!s.ai },
  { id: 'ai-game', text: 'Lance um jogo feito pela IA', reward: 5000, check: s => s.myGames.some(g => g.ai) },
  { id: 'phase4', text: 'Desbloqueie a Fase 4 (IA nível 5)', reward: 20000, check: s => s.phase4 },
  { id: 'lang', text: 'Lance sua própria linguagem de programação', reward: 50000, check: s => !!(s.lang && s.lang.released) },
  { id: 'brain', text: 'Lance sua própria IA para o público', reward: 100000, check: s => !!(s.brain && s.brain.released) },
  { id: 'end', text: 'Zere o Inforeal: sua IA no nível 10 e 100 mil devs usando sua linguagem', reward: 1000000, check: s => s.finished },
  { id: 'cyber60', text: 'Faça live de Cyberfuturo 2099 a 60 FPS ou mais', reward: 3000, check: s => s.stats.cyber60 },
  { id: 'f10k', text: 'Chegue a 10.000 seguidores', reward: 10000, check: s => s.followers >= 10000 },
];

const NAMES = [
  'gamer_123', 'xX_Pro_Xx', 'dudinha', 'joao.exe', 'noobmaster', 'capivara_gamer',
  'tia_do_zap', 'lucas_bala', 'mi_plays', 'zé_lag', 'bia_speedrun', 'pedrinho2012',
  'rei_do_ping', 'ana.dev', 'mago_do_rgb', 'vovó_gamer',
];

const CHAT = {
  bad: [
    'tá travando demais kkkk', 'isso é live ou slide?', 'compra um PC novo mano',
    'FPS de PowerPoint', 'o jogo congelou?', 'meu celular roda melhor', 'lag lag lag',
  ],
  ok: [
    'bora!', 'salve salve', 'que jogada!', 'primeira vez aqui', 'manda um salve!',
    'kkkkkkk', 'esse jogo é top', 'boa noite chat', 'vai que vai', 'GG',
  ],
  good: [
    'que PC liso', 'quais as specs?', 'roda liso demais', 'setup brabo 🔥',
    'imagem perfeita', 'esse FPS tá absurdo',
  ],
};

const DONATION_MSGS = [
  'compra uma placa de vídeo!', 'pro cafezinho ☕', 'melhor streamer!', 'manda um salve pra minha mãe',
  'pra fonte não explodir kkk', 'continua assim!', 'upgrade na RAM urgente',
];
