'use strict';

// Modo 2077: mesmas regras de hoje, mas com peças, jogos e visual do futuro. Save separado.

if (FUTURE) {
  const NAMES = {
    c1: ['Neural Core N1 (usado)', 'N1'], c2: ['Neural Core N3', 'N3'], c3: ['Ryzen Quantum Q5', 'Q5'], c4: ['Neural Core N5', 'N5'],
    c5: ['Ryzen Quantum Q7', 'Q7'], c6: ['Neural Core N9 Ultra', 'N9'], c7: ['Ryzen Quantum Q9 Infinity', 'Q9'],
    m1: ['Placa Neural Básica', 'NB-1'], m2: ['Placa Quântica Q-Link', 'Q-LINK'], m3: ['Placa Quântica Q-Link Pro', 'Q-PRO'],
    m4: ['Placa Neural Pro', 'NP-7'], m5: ['Placa Quântica Q-Link X', 'Q-X'], m6: ['Placa Neural Max', 'N-MAX'], m7: ['Placa Quântica Omega', 'OMEGA'],
    g1: ['Placa gráfica de sucata', 'SUCATA'], g2: ['AMD Holo HX 100', 'HX 100'], g3: ['NVIDIA QuantumForce Q2050', 'Q2050'],
    g4: ['AMD Holo HX 900', 'HX 900'], g5: ['NVIDIA QuantumForce Q7070', 'Q7070'], g6: ['NVIDIA QuantumForce Q9090 Ti', 'Q9090'],
    r1: ['Memória de DNA 4PB'], r2: ['Memória de DNA 8PB'], r3: ['Memória de DNA 16PB'], r4: ['Memória Fotônica 32PB'],
    r5: ['Memória Fotônica 32PB X'], r6: ['Memória Fotônica 64PB RGB'],
    s1: ['Cristal 5D 500TB (usado)'], s2: ['Cristal 5D 1EB'], s3: ['Cristal Quântico 10EB'],
    p1: ['Bateria de lítio genérica 2077', 'GENÉRICA'], p2: ['Mini reator de fusão 50kW', 'FUSÃO'], p3: ['Reator de fusão 75kW', 'FUSÃO+'], p4: ['Reator de antimatéria 100kW', 'ANTI'],
    k1: ['Gabinete holográfico básico'], e2: ['Implante ocular de câmera'], e1: ['Microfone subcutâneo'], e3: ['Aura de luz neural'],
  };
  for (const p of PARTS) {
    const n = NAMES[p.id];
    if (!n) continue;
    p.name = n[0];
    if (n[1]) p.short = n[1];
  }
  const GAME_NAMES = {
    paciencia: ['Paciência Neural', '🧠'], fogo: ['Fogo Livre 2077', '🔥'], blocks: ['Mine Blocks Infinito', '🧊'], moba: ['Liga das Lendas Holo', '🧙'],
    cs: ['Contra-Ataque 7', '🔫'], gta: ['GTZ XXI', '🛸'], cyber: ['Cyberfuturo 2177', '🤖'], simsim: ['Simulador de Simulador de Simulador', '🌀'],
  };
  for (const g of GAMES) {
    const n = GAME_NAMES[g.id];
    if (n) { g.name = n[0]; g.emoji = n[1]; }
  }
  RELEASES.splice(0, RELEASES.length);
  for (let i = PARTS.length - 1; i >= 0; i--) if (PARTS[i].day) PARTS.splice(i, 1);
  for (let i = GAMES.length - 1; i >= 0; i--) if (GAMES[i].day) GAMES.splice(i, 1);
  document.documentElement.classList.add('future');
}
