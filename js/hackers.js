'use strict';

// Hackers atacam o seu servidor de IA. Minigame: clique nos vírus antes que o tempo acabe.

const HACK_TIME = 12;       // segundos
const HACK_GOAL = 10;       // vírus para bloquear
let hack = null;            // ataque em andamento (não é salvo)

Hooks.on('daily', () => {
  if (S.hackPending || !(S.server && S.server.rack) || Math.random() > 0.15) return;
  S.hackPending = true;
  toast('🚨 HACKERS estão atacando o seu servidor de IA! Defenda agora (alerta no topo da tela).', 'bad');
});

function startHack() {
  if (hack || !S.hackPending) return;
  hack = { left: HACK_TIME, blocked: 0, cells: Array(12).fill(false) };
  hack.timer = setInterval(() => {
    hack.left -= 0.25;
    if (Math.random() < 0.55) hack.cells[Math.floor(Math.random() * 12)] = true;
    if (hack.left <= 0) return endHack(false);
    renderHack();
  }, 250);
  renderHack();
}

function blockVirus(i) {
  if (!hack || !hack.cells[i]) return;
  hack.cells[i] = false;
  hack.blocked++;
  sfx('click');
  if (hack.blocked >= HACK_GOAL) return endHack(true);
  renderHack();
}

function endHack(won) {
  clearInterval(hack.timer);
  hack = null;
  S.hackPending = false;
  if (won) {
    const prize = Math.round(5000 + Math.pow(S.followers, 0.6) * 5);
    S.money += prize;
    S.counts = S.counts || {};
    S.counts.hacks = (S.counts.hacks || 0) + 1;
    toast(`🛡️ Ataque bloqueado! A segurança digital te pagou ${money(prize)} de recompensa.`, 'goal');
  } else {
    const stolen = Math.round(S.money * 0.1);
    S.money -= stolen;
    if (S.brain) S.brain.xp *= 0.9;
    toast(`💀 Os hackers invadiram: roubaram ${money(stolen)}${S.brain ? ' e bagunçaram 10% do treino da sua IA' : ''}.`, 'bad');
  }
  changed();
}

function renderHack() {
  const el = $('#hack-card');
  if (!el) return;
  el.hidden = !S.hackPending;
  if (!S.hackPending) return;
  // Durante o ataque, só atualiza os quadradinhos (recriar a grade faria cliques se perderem).
  const grid = el.querySelector('.hack-grid');
  if (hack && grid) {
    el.querySelector('h2').textContent = `🚨 Defenda o servidor! ⏱️ ${hack.left.toFixed(1)}s · 🛡️ ${hack.blocked}/${HACK_GOAL}`;
    grid.querySelectorAll('.hack-cell').forEach((c, i) => {
      c.classList.toggle('virus', hack.cells[i]);
      c.textContent = hack.cells[i] ? '👾' : '';
    });
    return;
  }
  el.innerHTML = hack
    ? `<h2>🚨 Defenda o servidor! ⏱️ ${hack.left.toFixed(1)}s · 🛡️ ${hack.blocked}/${HACK_GOAL}</h2>
      <div class="hack-grid">${hack.cells.map((v, i) => `<button class="hack-cell ${v ? 'virus' : ''}" data-action="hack-hit" data-i="${i}" aria-label="${v ? 'vírus' : 'vazio'}">${v ? '👾' : ''}</button>`).join('')}</div>`
    : `<h2>🚨 Hackers atacando o seu servidor!</h2>
      <p>Clique nos vírus 👾 que aparecerem. Bloqueie ${HACK_GOAL} em ${HACK_TIME} segundos para salvar seu dinheiro e sua IA.</p>
      <button class="btn big launch" data-action="hack-start">🛡️ Defender agora</button>`;
}

Hooks.on('render', renderHack);
Hooks.on('action', d => {
  if (d.action === 'hack-start') startHack();
  if (d.action === 'hack-hit') blockVirus(Number(d.i));
});
renderHack();
