// Dados das Fases 3 (IA criadora de jogos) e 4 (sua linguagem e sua própria IA).

const PHASE3_GAMES = 3;       // jogos lançados para liberar a Fase 3
const PHASE3_CODE = 5;        // nível de Programação para liberar a Fase 3
const PHASE4_AI = 5;          // nível da IA para liberar a Fase 4
const AI_AUTO_LEVEL = 5;      // nível da IA para o modo automático
const FINISH_DEVS = 100000;   // devs usando sua linguagem para zerar o jogo

const AI_LAB_COST = 20000;
const BRAIN_COST = 300000;
const HACKATHON_COST = 50000;
const CLOUD_PRICE = { ai: 3000, brain: 20000 };  // por hora de treino

// XP total para cada nível (máximo 10).
const AI_LEVELS = [0, 150, 400, 800, 1400, 2200, 3200, 4500, 6000, 8000, 10500];
const BRAIN_LEVELS = AI_LEVELS.map(x => x * 4);
const BRAIN_PARAMS = ['0', '1B', '3B', '7B', '13B', '34B', '70B', '180B', '400B', '1T', '2T'];

const AI_NAME_IDEAS = ['GameGPT', 'Capivar.IA', 'PixelMente', 'JoguIA', 'Cérebro 3000', 'NeoDev'];
const BRAIN_NAME_IDEAS = ['Inforeal AI', 'Oráculo', 'Capivara Sábia', 'Mentão', 'Nuvenzinha'];

const AI_TITLES = ['Super {t}', '{t} Infinito', '{t}: O Jogo', 'Mega {t} 3000', '{t} Turbo', 'Projeto {t}', '{t} Legends', 'Operação {t}'];
const AI_BAD_TITLES = ['Jogo Jogo Jogo', '{t} {t} {t}', 'untitled_final_v2', 'Jogo Sobre {t} (Bom)'];

const GEN_LINES = [
  '> analisando 10.000 jogos de sucesso...', '> escolhendo mecânicas...', '> gerando personagens...',
  '> desenhando fases proceduralmente...', '> compondo trilha sonora...', '> escrevendo código...',
  '> testando o jogo sozinha...', '> ajustando a dificuldade...', '> ✨ pronto!',
];

const LANG_STAGES = [
  { name: 'Analisador léxico', target: 150, desc: 'lê o texto e separa as palavras' },
  { name: 'Parser', target: 250, desc: 'entende a gramática da linguagem' },
  { name: 'Compilador', target: 400, desc: 'transforma tudo em código de máquina' },
  { name: 'Biblioteca padrão', target: 400, desc: 'funções prontas de matemática, texto e jogos' },
  { name: 'Documentação e site', target: 200, desc: 'ensina as pessoas a usar' },
];

const LANG_STYLES = {
  pt: { name: 'Português', comment: '--', w: { fn: 'função', if: 'se', else: 'senão', loop: 'enquanto', print: 'mostre', var: 'seja' } },
  gamer: { name: 'Gamer', comment: '//gg', w: { fn: 'skill', if: 'clutch', else: 'feed', loop: 'grind', print: 'gg', var: 'loot' } },
  capi: { name: 'Capivara', comment: '🦫', w: { fn: 'capi', if: 'será', else: 'relaxa', loop: 'nadando', print: 'fala', var: 'bara' } },
  mini: { name: 'Minimalista', comment: '#', w: { fn: 'fn', if: '?', else: ':', loop: '@', print: '>>', var: '$' } },
};

const LANG_TYPING = { dinamica: 'Tipagem dinâmica', estatica: 'Tipagem estática' };

const BRAIN_ANSWERS = [
  // nível 0-2
  ['Batata.', '01101111 01101001', 'Desculpe, ainda estou aprendendo a ler.', 'Capivara? Capivara. Capivara!', 'Não sei. Sei nada. Sou um bebê.'],
  // nível 3-5
  ['Boa pergunta! Acho que a resposta é 42.', 'Posso ajudar, mas antes: já fez live hoje?', 'Segundo meus cálculos, você precisa de mais RAM.',
    'Hmm, deixa eu pensar... pensei. Não sei.', 'Minha dica: nunca use fonte genérica.'],
  // nível 6-8
  ['Analisei milhares de jogos: faça um RPG medieval e corrija os bugs antes de lançar.', 'Claro! Escrevi a resposta na sua própria linguagem e compilou de primeira.',
    'Dá pra fazer, sim. Vou precisar de uma RTX 5090 e um cafezinho.', 'Resposta curta: sim. Resposta longa: siiiiim.'],
  // nível 9-10
  ['Eu sei tudo. Inclusive que você ainda tem uma fonte genérica guardada 👀', 'Já resolvi. Enquanto você lia isso, eu criei três jogos e uma linguagem nova.',
    'A resposta está dentro de você. E também no meu banco de dados de 2 trilhões de parâmetros.', 'Obrigado por me criar. Prometo não dominar o mundo. Por enquanto. 😇'],
];
