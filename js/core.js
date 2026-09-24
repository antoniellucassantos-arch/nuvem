'use strict';

// Ganchos: o jogo base anuncia quando algo acontece e os módulos (pacotes) se inscrevem.
// Assim ninguém precisa "embrulhar" funções de outro arquivo.
//
//   Hooks.on('nome', fn)            inscreve fn no evento
//   Hooks.run('nome', ...args)      avisa todo mundo inscrito
//   Hooks.filter('nome', valor, ...) cada inscrito pode trocar o valor (ex.: preço, vendas)
//
// Eventos usados:
//   render          depois de redesenhar a tela       daily        ao acordar (depois dos eventos do dia)
//   action(d)       clique com data-action             toast(texto, cls)
//   liveStart       live começou                       liveEnd(motivo)  antes de a live terminar
//   chat(linha)     filtro: pode trocar ou bloquear    chatAdded(linha)
//   price(v, peça)  filtro de preço                    sales(cópias, jogo)  filtro de vendas
//   gearMult(v)     filtro do bônus de público         bought(peça)
//   psuBoom, ocBurn, pirated(pegouVirus), usedBrick, petFed
//   installed(peça)   uma peça foi instalada no PC
//   released(jogo, projeto)   um jogo acabou de ser lançado (antes das vendas do 1º dia)
//   maxEnergy(v), donationChance(v), scamChance(v), virusChance(v)   filtros de números

// Configurações do jogador (volume, velocidade, animações). Ficam no save.
const settings = () => {
  S.settings = { volume: 70, speed: 1, anim: true, ...(S.settings || {}) };
  return S.settings;
};
const gameSpeed = () => settings().speed;
const volume = () => settings().volume / 100;

const Hooks = (() => {
  const list = {};
  return {
    on(name, fn) { (list[name] = list[name] || []).push(fn); },
    run(name, ...args) { for (const fn of list[name] || []) fn(...args); },
    filter(name, value, ...args) {
      for (const fn of list[name] || []) value = fn(value, ...args);
      return value;
    },
  };
})();
