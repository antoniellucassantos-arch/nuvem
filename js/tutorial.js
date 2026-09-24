'use strict';

// Tutorial guiado: um balão explica cada passo e destaca onde clicar.
// Avança sozinho quando o jogador faz o que foi pedido.

const visibleTab = name => !$('#tab-' + name).hidden;
const hasAllParts = () => SLOTS.every(slot => S.build[slot] || S.inventory.some(i => PART_BY_ID[i.id].cat === slot));

const TUTORIAL = [
  { text: '👋 Bem-vindo ao Inforeal! Primeiro você precisa de um PC. Abra a <b>Loja</b>.', target: '.tab[data-tab=shop]', done: () => visibleTab('shop') },
  { text: '🛒 Compre <b>uma peça de cada tipo</b>: processador, placa-mãe, memória, placa de vídeo, armazenamento e fonte. As mais baratas servem! Atenção: o <b>soquete</b> do processador tem que ser igual ao da placa-mãe.', target: '#shop-filters', done: hasAllParts },
  { text: '🔧 Agora volte para a <b>Montagem</b>.', target: '.tab[data-tab=build]', done: () => visibleTab('build') },
  { text: '🪛 Clique em <b>Instalar</b> em cada peça guardada até o gabinete ficar completo.', target: '#inventory', done: () => SLOTS.every(slot => S.build[slot]) },
  { text: '⏻ Tudo montado! Aperte <b>Ligar PC</b>.', target: '#btn-power', done: () => S.pcOn },
  { text: '🔴 O PC ligou! Vá para a aba <b>Live</b>.', target: '.tab[data-tab=live]', done: () => visibleTab('live') },
  { text: '🖱️ Esse é o seu monitor. Clique no app <b>StreamZinho</b>.', target: '.os-icon[data-app=stream]', done: () => openApp === 'stream' || !!live },
  { text: '🎮 Escolha um jogo (veja o FPS de cada um) e clique em <b>Iniciar live</b>.', target: '#btn-live', done: () => !!live || S.stats.lives > 0 },
  { text: '🕹️ Você está ao vivo! Dica: clique em <b>Jogar eu mesmo</b> para jogar de verdade. Quando a live acabar e você cansar, clique em <b>Dormir</b>.', target: '#btn-sleep', done: () => S.day > 1 },
  { text: '🎉 Pronto! Agora é com você: ganhe seguidores, compre peças melhores e confira os <b>Objetivos</b>. Boa sorte!', target: '.tab[data-tab=goals]', done: () => visibleTab('goals'), last: true },
];

// Save novo começa o tutorial; quem já jogava não é incomodado.
if (S.tutorial === undefined) S.tutorial = (S.stats.lives === 0 && !S.pcOn && S.day === 1) ? 0 : -1;

let tutTarget = null;

function tutorialTick() {
  const box = $('#tutorial');
  if (S.tutorial < 0 || S.tutorial >= TUTORIAL.length) {
    box.hidden = true;
    if (tutTarget) tutTarget.classList.remove('tut-target');
    tutTarget = null;
    return;
  }
  const step = TUTORIAL[S.tutorial];
  if (step.done()) {
    S.tutorial = step.last ? -1 : S.tutorial + 1;
    saveGame();
    return tutorialTick();
  }
  box.hidden = false;
  $('#tut-text').innerHTML = step.text;
  $('#tut-step').textContent = `Passo ${S.tutorial + 1} de ${TUTORIAL.length}`;
  const el = document.querySelector(step.target);
  if (el !== tutTarget) {
    if (tutTarget) tutTarget.classList.remove('tut-target');
    tutTarget = el;
    if (el) {
      el.classList.add('tut-target');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
setInterval(tutorialTick, 400);

const _handleLabActionTut = handleLabAction;
handleLabAction = function (d) {
  if (d.action === 'tut-skip') { S.tutorial = -1; saveGame(); return tutorialTick(); }
  if (d.action === 'tut-restart') { S.tutorial = 0; saveGame(); showTab('build'); return tutorialTick(); }
  return _handleLabActionTut(d);
};

// Depois de apagar o progresso, o tutorial recomeça.
const _renderTut = render;
render = function () {
  if (S.tutorial === undefined) S.tutorial = 0;
  _renderTut();
};

tutorialTick();
