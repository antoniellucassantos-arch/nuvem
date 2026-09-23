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
const PARTS = [
  // Processadores (socket precisa bater com a placa-mãe)
  { id: 'c1', cat: 'cpu', name: 'Pentak G5400', price: 350, unlock: 0, socket: 'S1', score: 10, watts: 45 },
  { id: 'c2', cat: 'cpu', name: 'Pentak i3 X', price: 700, unlock: 0, socket: 'S1', score: 20, watts: 65 },
  { id: 'c3', cat: 'cpu', name: 'Ryzor 5 Neo', price: 1200, unlock: 50, socket: 'S2', score: 35, watts: 65 },
  { id: 'c4', cat: 'cpu', name: 'Pentak i7 Turbo', price: 2200, unlock: 300, socket: 'S1', score: 55, watts: 125 },
  { id: 'c5', cat: 'cpu', name: 'Ryzor 9 Titan', price: 4000, unlock: 1500, socket: 'S2', score: 85, watts: 170 },
  { id: 'c6', cat: 'cpu', name: 'Quantix X1', price: 8000, unlock: 5000, socket: 'S2', score: 120, watts: 200 },

  // Placas-mãe
  { id: 'm1', cat: 'mobo', name: 'Placa Básica H1', price: 250, unlock: 0, socket: 'S1', ram: 'DDR4' },
  { id: 'm2', cat: 'mobo', name: 'Placa Gamer B2', price: 500, unlock: 50, socket: 'S2', ram: 'DDR4' },
  { id: 'm3', cat: 'mobo', name: 'Placa Pro Z5', price: 1100, unlock: 300, socket: 'S1', ram: 'DDR5' },
  { id: 'm4', cat: 'mobo', name: 'Placa Extreme X7', price: 1500, unlock: 1500, socket: 'S2', ram: 'DDR5' },

  // Memória RAM
  { id: 'r1', cat: 'ram', name: 'Pente 4GB DDR4', price: 120, unlock: 0, gb: 4, type: 'DDR4' },
  { id: 'r2', cat: 'ram', name: 'Pente 8GB DDR4', price: 250, unlock: 0, gb: 8, type: 'DDR4' },
  { id: 'r3', cat: 'ram', name: 'Kit 16GB DDR4', price: 450, unlock: 50, gb: 16, type: 'DDR4' },
  { id: 'r4', cat: 'ram', name: 'Kit 16GB DDR5', price: 700, unlock: 300, gb: 16, type: 'DDR5' },
  { id: 'r5', cat: 'ram', name: 'Kit 32GB DDR5 RGB', price: 1300, unlock: 1500, gb: 32, type: 'DDR5' },

  // Placas de vídeo
  { id: 'g1', cat: 'gpu', name: 'GeForça GT 710', price: 300, unlock: 0, score: 8, watts: 20 },
  { id: 'g2', cat: 'gpu', name: 'Radeonix RX 550', price: 600, unlock: 0, score: 18, watts: 50 },
  { id: 'g3', cat: 'gpu', name: 'GeForça GTX 1650', price: 1100, unlock: 50, score: 30, watts: 75 },
  { id: 'g4', cat: 'gpu', name: 'Radeonix RX 6600', price: 1900, unlock: 300, score: 55, watts: 130 },
  { id: 'g5', cat: 'gpu', name: 'GeForça RTX 3070', price: 3500, unlock: 1500, score: 85, watts: 220 },
  { id: 'g6', cat: 'gpu', name: 'GeForça RTX 4090', price: 10000, unlock: 5000, score: 150, watts: 450 },

  // Armazenamento (velocidade melhora a retenção do público)
  { id: 's1', cat: 'storage', name: 'HD 500GB', price: 150, unlock: 0, speed: 1 },
  { id: 's2', cat: 'storage', name: 'SSD 240GB', price: 200, unlock: 0, speed: 2 },
  { id: 's3', cat: 'storage', name: 'SSD NVMe 1TB', price: 500, unlock: 300, speed: 3 },

  // Fontes (a genérica pode explodir se ficar sobrecarregada)
  { id: 'p1', cat: 'psu', name: 'Fonte Genérica 300W', price: 120, unlock: 0, watts: 300, generic: true },
  { id: 'p2', cat: 'psu', name: 'Fonte 500W 80 Plus', price: 300, unlock: 0, watts: 500 },
  { id: 'p3', cat: 'psu', name: 'Fonte 750W Gold', price: 600, unlock: 300, watts: 750 },
  { id: 'p4', cat: 'psu', name: 'Fonte 1000W Platinum', price: 1100, unlock: 1500, watts: 1000 },

  // Equipamento de live (compra única, multiplica espectadores)
  { id: 'e1', cat: 'gear', name: 'Webcam HD', price: 250, unlock: 0, mult: 1.1 },
  { id: 'e2', cat: 'gear', name: 'Microfone condensador', price: 300, unlock: 0, mult: 1.15 },
  { id: 'e3', cat: 'gear', name: 'Ring light', price: 200, unlock: 100, mult: 1.1 },
  { id: 'e4', cat: 'gear', name: 'Cadeira gamer', price: 800, unlock: 300, mult: 1.08 },
  { id: 'e5', cat: 'gear', name: 'Tela verde (chroma key)', price: 400, unlock: 1000, mult: 1.12 },
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
