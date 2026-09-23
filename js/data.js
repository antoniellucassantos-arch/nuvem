// Dados do jogo: peças, jogos, objetivos e mensagens do chat.

const CATS = {
  cpu: 'Processador',
  mobo: 'Placa-mãe',
  ram: 'Memória RAM',
  gpu: 'Placa de vídeo',
  storage: 'Armazenamento',
  psu: 'Fonte',
  gear: 'Equipamento de live',
};

const CAT_ICONS = {
  cpu: '🧠', mobo: '🟩', ram: '📏', gpu: '🎮', storage: '💾', psu: '🔌', gear: '🎙️',
};

// Encaixes do gabinete, na ordem em que aparecem na montagem.
const SLOTS = ['cpu', 'mobo', 'ram', 'gpu', 'storage', 'psu'];

// unlock = seguidores necessários para a peça aparecer na loja.
// short, brand, fans, len, sticks, rgb, color e kind só servem para o desenho do gabinete.
const PARTS = [
  // Processadores (o soquete precisa ser o mesmo da placa-mãe)
  { id: 'c1', cat: 'cpu', name: 'Intel Pentium Gold G6400', short: 'Pentium', brand: 'intel', price: 350, unlock: 0, socket: 'LGA1200', score: 10, watts: 58 },
  { id: 'c2', cat: 'cpu', name: 'Intel Core i3-10100F', short: 'Core i3', brand: 'intel', price: 600, unlock: 0, socket: 'LGA1200', score: 20, watts: 65 },
  { id: 'c3', cat: 'cpu', name: 'AMD Ryzen 5 5600', short: 'Ryzen 5', brand: 'amd', price: 800, unlock: 50, socket: 'AM4', score: 35, watts: 65 },
  { id: 'c4', cat: 'cpu', name: 'Intel Core i5-13400F', short: 'Core i5', brand: 'intel', price: 1300, unlock: 300, socket: 'LGA1700', score: 50, watts: 110 },
  { id: 'c5', cat: 'cpu', name: 'AMD Ryzen 7 7800X3D', short: 'Ryzen 7', brand: 'amd', price: 2600, unlock: 1500, socket: 'AM5', score: 85, watts: 120 },
  { id: 'c6', cat: 'cpu', name: 'Intel Core i9-14900K', short: 'Core i9', brand: 'intel', price: 3800, unlock: 3000, socket: 'LGA1700', score: 105, watts: 250 },
  { id: 'c7', cat: 'cpu', name: 'AMD Ryzen 9 9950X3D', short: 'Ryzen 9', brand: 'amd', price: 5000, unlock: 5000, socket: 'AM5', score: 130, watts: 170 },

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

  // Equipamento de live (compra única, multiplica os espectadores)
  { id: 'e1', cat: 'gear', name: 'Microfone Fifine K669', price: 250, unlock: 0, mult: 1.1 },
  { id: 'e2', cat: 'gear', name: 'Webcam Logitech C920', price: 350, unlock: 0, mult: 1.1 },
  { id: 'e3', cat: 'gear', name: 'Ring light 10"', price: 150, unlock: 50, mult: 1.08 },
  { id: 'e4', cat: 'gear', name: 'Microfone HyperX QuadCast S', price: 800, unlock: 300, mult: 1.12 },
  { id: 'e5', cat: 'gear', name: 'Cadeira DT3 Sports', price: 1300, unlock: 300, mult: 1.06 },
  { id: 'e6', cat: 'gear', name: 'Elgato Green Screen', price: 900, unlock: 1000, mult: 1.12 },
  { id: 'e7', cat: 'gear', name: 'Elgato Stream Deck MK.2', price: 1200, unlock: 1500, mult: 1.1 },
];

// cpu/gpu/ram = requisitos para rodar a 60 FPS. pop = popularidade do jogo.
const GAMES = [
  { id: 'paciencia', emoji: '🃏', name: 'Paciência Ultra', price: 0, cpu: 5, gpu: 3, ram: 4, pop: 0.5 },
  { id: 'fogo', emoji: '🔥', name: 'Fogo Livre', price: 0, cpu: 12, gpu: 10, ram: 4, pop: 1.1 },
  { id: 'blocks', emoji: '⛏️', name: 'Mine Blocks', price: 60, cpu: 10, gpu: 8, ram: 4, pop: 1.0 },
  { id: 'moba', emoji: '🧙', name: 'Liga das Lendas', price: 0, cpu: 15, gpu: 12, ram: 8, pop: 1.3 },
  { id: 'cs', emoji: '🔫', name: 'Contra-Ataque 2', price: 0, cpu: 25, gpu: 25, ram: 8, pop: 1.5 },
  { id: 'gta', emoji: '🚗', name: 'GTZ: Cidade Grande', price: 120, cpu: 35, gpu: 45, ram: 16, pop: 2.0 },
  { id: 'cyber', emoji: '🤖', name: 'Cyberfuturo 2099', price: 250, cpu: 60, gpu: 80, ram: 16, pop: 2.6 },
  { id: 'simsim', emoji: '🌀', name: 'Simulador de Simulador', price: 400, cpu: 100, gpu: 130, ram: 32, pop: 3.5 },
];

const GOALS = [
  { id: 'boot', text: 'Monte e ligue seu primeiro PC', reward: 200, check: s => s.pcOn || s.stats.lives > 0 },
  { id: 'live1', text: 'Faça sua primeira live', reward: 100, check: s => s.stats.lives >= 1 },
  { id: 'f100', text: 'Chegue a 100 seguidores', reward: 500, check: s => s.followers >= 100 },
  { id: 'v100', text: 'Tenha 100 espectadores ao mesmo tempo', reward: 800, check: s => s.stats.bestViewers >= 100 },
  { id: 'm5k', text: 'Junte R$ 5.000', reward: 500, check: s => s.money >= 5000 },
  { id: 'f1000', text: 'Chegue a 1.000 seguidores', reward: 2000, check: s => s.followers >= 1000 },
  { id: 'cyber60', text: 'Faça live de Cyberfuturo 2099 a 60 FPS ou mais', reward: 3000, check: s => s.stats.cyber60 },
  { id: 'f10k', text: 'Chegue a 10.000 seguidores e desbloqueie a Fase 2 (em breve: virar desenvolvedor!)', reward: 10000, check: s => s.followers >= 10000 },
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
