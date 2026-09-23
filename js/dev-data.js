// Dados da Fase 2: virar desenvolvedor de jogos.

const PHASE2_FOLLOWERS = 300;

const SKILLS = {
  code: { name: 'Programação', icon: '💻' },
  art: { name: 'Arte', icon: '🎨' },
  sound: { name: 'Som', icon: '🎵' },
};

// XP total necessário para cada nível (nível máximo = 10).
const SKILL_LEVELS = [0, 20, 50, 90, 140, 200, 270, 350, 440, 540, 650];

const COURSES = [
  { id: 'yt', name: 'Tutorial no YouTube', price: 0, energy: 20, xp: 8 },
  { id: 'online', name: 'Curso online', price: 80, energy: 20, xp: 25 },
  { id: 'bootcamp', name: 'Bootcamp intensivo', price: 600, energy: 60, xp: 110 },
];

// Ferramentas para criar jogos. code = nível de programação exigido.
// pc = computador mínimo para rodar a ferramenta. mult = teto de qualidade.
const ENGINES = [
  { id: 'scratch', name: 'Scratch', lang: 'Blocos', code: 0, price: 0, mult: 0.55, is3d: false,
    pc: { cpu: 0, gpu: 0, ram: 4 }, play: { cpu: 3, gpu: 2, ram: 4 } },
  { id: 'python', name: 'Python + Pygame', lang: 'Python', code: 2, price: 150, mult: 0.75, is3d: false,
    pc: { cpu: 0, gpu: 0, ram: 4 }, play: { cpu: 5, gpu: 3, ram: 4 } },
  { id: 'js', name: 'JavaScript + Phaser', lang: 'JavaScript', code: 3, price: 250, mult: 0.85, is3d: false,
    pc: { cpu: 10, gpu: 0, ram: 8 }, play: { cpu: 6, gpu: 4, ram: 4 } },
  { id: 'godot', name: 'Godot', lang: 'GDScript', code: 4, price: 400, mult: 0.95, is3d: true,
    pc: { cpu: 20, gpu: 18, ram: 8 }, play: { cpu: 12, gpu: 10, ram: 8 } },
  { id: 'unity', name: 'Unity', lang: 'C#', code: 6, price: 900, mult: 1.1, is3d: true,
    pc: { cpu: 35, gpu: 30, ram: 16 }, play: { cpu: 20, gpu: 20, ram: 8 } },
  { id: 'unreal', name: 'Unreal Engine 5', lang: 'C++', code: 8, price: 1500, mult: 1.3, is3d: true,
    pc: { cpu: 50, gpu: 55, ram: 16 }, play: { cpu: 35, gpu: 45, ram: 16 } },
];

// w = peso de gameplay / arte / som para o gênero (soma 1).
const GENRES = [
  { id: 'plataforma', name: 'Plataforma', emoji: '🍄', w: { code: 0.5, art: 0.35, sound: 0.15 }, hint: 'Controles precisos e fases bonitas.' },
  { id: 'puzzle', name: 'Puzzle', emoji: '🧩', w: { code: 0.6, art: 0.25, sound: 0.15 }, hint: 'É tudo sobre a lógica das fases.' },
  { id: 'corrida', name: 'Corrida', emoji: '🏎️', w: { code: 0.35, art: 0.45, sound: 0.2 }, hint: 'Visual e sensação de velocidade.' },
  { id: 'rpg', name: 'RPG', emoji: '🗡️', w: { code: 0.5, art: 0.3, sound: 0.2 }, hint: 'Sistemas profundos e uma boa trilha.' },
  { id: 'simulacao', name: 'Simulação', emoji: '🏗️', w: { code: 0.55, art: 0.3, sound: 0.15 }, hint: 'Muitas regras funcionando juntas.' },
  { id: 'tiro', name: 'Tiro', emoji: '🔫', w: { code: 0.4, art: 0.45, sound: 0.15 }, hint: 'Gráficos e tiroteio gostoso.', is3d: true },
  { id: 'terror', name: 'Terror', emoji: '👻', w: { code: 0.3, art: 0.35, sound: 0.35 }, hint: 'Sem um som assustador não dá medo!', is3d: true },
];

// Cores das capas dos seus jogos, por gênero.
const GENRE_COLORS = {
  plataforma: ['#1e3a8a', '#60a5fa'], puzzle: ['#4c1d95', '#c084fc'], corrida: ['#7f1d1d', '#f97316'],
  rpg: ['#3f2d0e', '#d4a24c'], simulacao: ['#14532d', '#86efac'], tiro: ['#1f2937', '#9ca3af'], terror: ['#0a0a0a', '#7f1d1d'],
};

// Como os seus jogos aparecem na simulação da live.
const GENRE_SIM = { plataforma: 'runner', puzzle: 'runner', corrida: 'racer', rpg: 'runner', simulacao: 'runner', tiro: 'shooter', terror: 'runner' };
const THEME_SPRITES = {
  espaco: ['🚀', '☄️'], zumbis: ['🧑', '🧟'], fazenda: ['👩‍🌾', '🐔'], medieval: ['🤺', '🐉'], escola: ['🧒', '📚'],
  capivaras: ['🦫', '🐊'], futebol: ['🏃', '⚽'], ninjas: ['🥷', '🗡️'], dinossauros: ['🦕', '🦖'], cyberpunk: ['🦾', '🤖'],
};

const THEMES = [
  { id: 'espaco', name: 'Espaço', emoji: '🚀' },
  { id: 'zumbis', name: 'Zumbis', emoji: '🧟' },
  { id: 'fazenda', name: 'Fazenda', emoji: '🐄' },
  { id: 'medieval', name: 'Medieval', emoji: '🏰' },
  { id: 'escola', name: 'Escola', emoji: '🏫' },
  { id: 'capivaras', name: 'Capivaras', emoji: '🦫' },
  { id: 'futebol', name: 'Futebol', emoji: '⚽' },
  { id: 'ninjas', name: 'Ninjas', emoji: '🥷' },
  { id: 'dinossauros', name: 'Dinossauros', emoji: '🦖' },
  { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌆' },
];

// Combinações de gênero + tema que o público ama ou odeia.
const COMBOS = {
  'plataforma+ninjas': 1.25, 'plataforma+capivaras': 1.25, 'plataforma+dinossauros': 1.15,
  'puzzle+espaco': 1.2, 'puzzle+escola': 1.15,
  'corrida+cyberpunk': 1.25, 'corrida+futebol': 0.85,
  'rpg+medieval': 1.3, 'rpg+cyberpunk': 1.2, 'rpg+futebol': 0.8,
  'simulacao+fazenda': 1.3, 'simulacao+futebol': 1.2, 'simulacao+ninjas': 0.8,
  'tiro+zumbis': 1.3, 'tiro+espaco': 1.2, 'tiro+capivaras': 0.8, 'tiro+fazenda': 0.85,
  'terror+escola': 1.3, 'terror+zumbis': 1.2, 'terror+capivaras': 0.75, 'terror+futebol': 0.8,
};

// target = pontos de desenvolvimento. sales = multiplicador de vendas.
const SIZES = [
  { id: 'pequeno', name: 'Pequeno', target: 40, sales: 0.6, code: 0 },
  { id: 'medio', name: 'Médio', target: 100, sales: 1, code: 3 },
  { id: 'grande', name: 'Grande', target: 220, sales: 1.7, code: 6 },
];

const FOCUS_PRESETS = [
  { id: 'eq', name: 'Equilibrado', f: { code: 34, art: 33, sound: 33 } },
  { id: 'gameplay', name: 'Foco em gameplay', f: { code: 60, art: 25, sound: 15 } },
  { id: 'visual', name: 'Foco em gráficos', f: { code: 35, art: 50, sound: 15 } },
  { id: 'som', name: 'Foco em som', f: { code: 30, art: 35, sound: 35 } },
];

// units = multiplicador de cópias; cut = quanto você recebe por cópia (a loja fica com 30%).
const PRICES = [
  { id: 'free', name: 'Grátis com anúncios', value: 0, units: 3, cut: 0.8 },
  { id: 'p10', name: 'R$ 9,90', value: 9.9, units: 1, cut: 9.9 * 0.7 },
  { id: 'p30', name: 'R$ 29,90', value: 29.9, units: 0.45, cut: 29.9 * 0.7 },
  { id: 'p60', name: 'R$ 59,90', value: 59.9, units: 0.22, cut: 59.9 * 0.7 },
];

const OUTLETS = ['Jogo Véio', 'GameCrítica BR', 'Nerd Total', 'Tio do Pixel'];

const REVIEW_QUOTES = {
  bad: ['Parece que foi feito num fim de semana.', 'Desinstalei em 5 minutos.', 'Precisa de muito mais trabalho.'],
  mid: ['Diverte, mas não impressiona.', 'Tem potencial, falta capricho.', 'Um jogo ok para passar o tempo.'],
  good: ['Muito divertido, recomendo!', 'Uma ótima surpresa brasileira.', 'Viciante do começo ao fim.'],
  great: ['Obra-prima! 🏆', 'Candidato a jogo do ano!', 'Tudo nele funciona perfeitamente.'],
};

const DEV_NAME_IDEAS = [
  'Capivara Adventures', 'Zumbis na Escola', 'Fazendinha Turbo', 'Ninja do Sertão',
  'Galáxia Perdida', 'Dino Kart', 'Neon Rush 2077', 'O Castelo Assombrado', 'Futebol de Botão Pro',
];

const BUG_MSGS = [
  'o personagem atravessa a parede', 'o jogo fecha quando aperta ESC', 'o chefão ficou invisível',
  'a música toca duas vezes', 'dá pra pular infinito', 'o placar mostra NaN', 'o inimigo anda de costas',
  'a câmera ficou de cabeça para baixo', 'o save apaga sozinho',
];

const IDEA_MSGS = [
  'Ideia genial: um modo cooperativo!', 'Ideia genial: um chefão secreto!', 'Ideia genial: um pet que te segue!',
  'Ideia genial: fases que mudam de noite!', 'Ideia genial: um easter egg da capivara!',
];

// Linhas de código de mentira que aparecem no editor durante o desenvolvimento.
const CODE_LINES = {
  Blocos: [
    'quando bandeira verde for clicada', 'sempre', '  se <tecla espaço pressionada?> então',
    '    mude y para (y + 10)', '  toque o som [pulo]', 'mude [pontos] por (1)', 'vá para x: (0) y: (0)',
    'espere (0.5) seg', 'diga [Você venceu!] por (2) segundos', 'se <tocando em [inimigo]?> então',
  ],
  Python: [
    'import pygame', 'jogador = Jogador(x=100, y=300)', 'def pular(self):', '    self.vel_y = -12',
    'for inimigo in inimigos:', '    if jogador.colide(inimigo): vidas -= 1', 'pontos += 10',
    'tela.blit(fundo, (0, 0))', 'pygame.display.flip()', 'relogio.tick(60)',
  ],
  JavaScript: [
    'const player = this.physics.add.sprite(100, 300, "heroi");', 'function update(time, dt) {',
    '  if (cursors.space.isDown) player.setVelocityY(-330);', 'enemies.forEach(e => e.update(dt));',
    'score += 10;', 'this.sound.play("moeda");', '}', 'this.cameras.main.startFollow(player);',
  ],
  GDScript: [
    'extends CharacterBody2D', 'func _physics_process(delta):', '    velocity.y += gravidade * delta',
    '    move_and_slide()', 'if Input.is_action_just_pressed("pular"):', '    velocity.y = FORCA_PULO',
    '$Animacao.play("correr")', 'emit_signal("morreu")',
  ],
  'C#': [
    'public class Player : MonoBehaviour {', '    void Update() {',
    '        if (Input.GetKeyDown(KeyCode.Space)) Jump();', '    rb.AddForce(Vector3.up * jumpForce);',
    '    }', 'Instantiate(enemyPrefab, spawnPoint.position, Quaternion.identity);',
    'audioSource.PlayOneShot(shootClip);', '}',
  ],
  'C++': [
    'void AHero::Tick(float DeltaTime) {', '    Super::Tick(DeltaTime);', '    if (Health <= 0.f) Die();',
    'UGameplayStatics::PlaySound2D(this, JumpSound);', 'GetWorld()->SpawnActor<AZombie>(ZombieClass, Location);',
    'UE_LOG(LogTemp, Warning, TEXT("Fase carregada"));', '}',
  ],
};
