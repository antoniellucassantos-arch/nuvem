'use strict';

// Simulação do jogo na tela da live. Roda sozinha ("piloto automático") ou você joga:
// Espaço/↑ para pular, ←/→ para trocar de faixa, clique/toque na tela.
// A tela é desenhada no FPS que o seu PC consegue: PC fraco = imagem travando de verdade.

let sim = null;

function startSim(game, fps) {
  stopSim();
  const canvas = $('#sim-canvas');
  sim = {
    game, canvas, ctx: canvas.getContext('2d'),
    mode: game.sim || 'runner',
    hero: game.hero || game.emoji, foe: game.foe || '👾',
    colors: game.colors || ['#3a2a7a', '#0b0d14'],
    fps: Math.max(1, Math.min(60, fps)),
    manual: false, score: 0, deaths: 0, t: 0, lastDraw: 0,
    objs: [], fx: [], spawn: 0.5, w: 0, h: 0, flash: 0,
  };
  sim.raf = requestAnimationFrame(simLoop);
  updatePlayButton();
}

function stopSim() {
  if (!sim) return;
  cancelAnimationFrame(sim.raf);
  sim = null;
}

function setSimFps(fps) {
  if (sim) sim.fps = Math.max(1, Math.min(60, fps));
}

function toggleManual() {
  if (!sim) return;
  sim.manual = !sim.manual;
  updatePlayButton();
}

function updatePlayButton() {
  const btn = $('#btn-play');
  if (!btn || !sim) return;
  btn.textContent = sim.manual ? '🤖 Voltar pro automático' : '🎮 Jogar eu mesmo';
  $('#sim-hint').textContent = sim.manual
    ? (SIM_EXTRA[sim.mode] ? SIM_EXTRA[sim.mode].hint : { runner: 'Espaço, ↑ ou toque para pular', racer: '← → ou toque nos lados para desviar', shooter: 'Clique nos inimigos para atirar' }[sim.mode])
    : '';
}

function resizeSim() {
  const r = sim.canvas.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  if (r.width !== sim.w || r.height !== sim.h) {
    const dpr = window.devicePixelRatio || 1;
    sim.canvas.width = r.width * dpr;
    sim.canvas.height = r.height * dpr;
    sim.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const first = !sim.w;
    sim.w = r.width;
    sim.h = r.height;
    if (first) initMode();
  }
  return true;
}

function simLoop(ts) {
  if (!sim) return;
  sim.raf = requestAnimationFrame(simLoop);
  if (!sim.lastDraw) sim.lastDraw = ts;
  if (ts - sim.lastDraw < 1000 / sim.fps - 1) return;
  const dt = Math.min(0.25, (ts - sim.lastDraw) / 1000);
  sim.lastDraw = ts;
  if (!resizeSim()) return;
  sim.t += dt;
  sim.flash = Math.max(0, sim.flash - dt);
  if (SIM_EXTRA[sim.mode]) SIM_EXTRA[sim.mode].update(dt);
  else ({ runner: updateRunner, racer: updateRacer, shooter: updateShooter })[sim.mode](dt);
  sim.fx = sim.fx.filter(f => (f.life -= dt) > 0);
  drawSim();
}

function initMode() {
  const { w, h } = sim;
  if (sim.mode === 'runner') sim.player = { x: w * 0.18, y: h * 0.8, vy: 0 };
  if (sim.mode === 'racer') sim.player = { lane: 1, x: laneX(1) };
  if (sim.mode === 'shooter') sim.player = { x: w / 2, y: h / 2, cooldown: 0 };
  if (SIM_EXTRA[sim.mode]) SIM_EXTRA[sim.mode].init();
}

// Pontos e mortes quando você joga mudam o público da live.
function simEvent(type) {
  if (!sim || !sim.manual || !live) return;
  if (type === 'point') {
    live.playBonus = Math.min(0.3, (live.playBonus || 0) + 0.01);
    if (Math.random() < 0.25) addChat(pick(NAMES), pick(['BOAAA', 'que reflexo!', 'joga muito', 'GG', 'amassou']));
  } else if (type === 'death') {
    live.playBonus = Math.max(0, (live.playBonus || 0) - 0.03);
    addChat(pick(NAMES), pick(['KKKKKKKK morreu', 'F', 'essa doeu', 'lag ou skill issue?', 'de novo não KKKK']));
  }
}

function die() {
  sim.deaths++;
  sim.flash = 0.4;
  sim.objs = [];
  sim.spawn = 1;
  simEvent('death');
}

/* ---------- Corrida de obstáculos ---------- */

function updateRunner(dt) {
  const { w, h, player: p } = sim;
  const ground = h * 0.8;
  const speed = w * 0.45;
  const size = h * 0.12;

  sim.spawn -= dt;
  if (sim.spawn <= 0) {
    sim.objs.push({ x: w + size, size: size * rand(0.8, 1.1), passed: false });
    sim.spawn = rand(0.9, 1.8);
  }
  for (const o of sim.objs) {
    o.x -= speed * dt;
    if (!o.passed && o.x + o.size < p.x) {
      o.passed = true;
      sim.score += 10;
      simEvent('point');
    }
  }
  sim.objs = sim.objs.filter(o => o.x > -o.size);

  const onGround = p.y >= ground;
  if (onGround && !sim.manual) {
    const next = sim.objs.find(o => o.x > p.x);
    if (next && next.x - p.x < speed * 0.32) p.vy = -h * 1.45;
  }
  if (onGround && sim.manual && sim.jump) p.vy = -h * 1.45;
  sim.jump = false;
  p.vy += h * 3.2 * dt;
  p.y = Math.min(ground, p.y + p.vy * dt);
  if (p.y >= ground) p.vy = Math.min(0, p.vy);

  for (const o of sim.objs) {
    if (Math.abs(o.x - p.x) < size * 0.55 && p.y > ground - o.size * 0.7) return die();
  }
}

/* ---------- Carro desviando ---------- */

function laneX(i) {
  return sim.w * (0.3 + i * 0.2);
}

function updateRacer(dt) {
  const { h, player: p } = sim;
  const speed = h * 0.7;
  const size = h * 0.13;
  const py = h * 0.8;

  sim.spawn -= dt;
  if (sim.spawn <= 0) {
    sim.objs.push({ lane: Math.floor(Math.random() * 3), y: -size, passed: false });
    sim.spawn = rand(0.6, 1.2);
  }
  for (const o of sim.objs) {
    o.y += speed * dt;
    if (!o.passed && o.y > py + size) {
      o.passed = true;
      sim.score += 10;
      simEvent('point');
    }
  }
  sim.objs = sim.objs.filter(o => o.y < h + size);

  if (!sim.manual) {
    const danger = sim.objs.find(o => o.lane === p.lane && o.y < py && py - o.y < speed * 0.6);
    if (danger) {
      const free = [0, 1, 2].filter(l => !sim.objs.some(o => o.lane === l && Math.abs(py - o.y) < size * 2));
      if (free.length) p.lane = free.reduce((a, b) => (Math.abs(b - p.lane) < Math.abs(a - p.lane) ? b : a));
    }
  }
  p.x += (laneX(p.lane) - p.x) * Math.min(1, dt * 12);

  for (const o of sim.objs) {
    if (Math.abs(laneX(o.lane) - p.x) < size * 0.6 && Math.abs(o.y - py) < size * 0.8) return die();
  }
}

/* ---------- Tiro ao alvo ---------- */

function updateShooter(dt) {
  const { w, h, player: p } = sim;
  sim.spawn -= dt;
  if (sim.spawn <= 0 && sim.objs.length < 4) {
    sim.objs.push({ x: rand(w * 0.1, w * 0.75), y: rand(h * 0.25, h * 0.75), size: h * rand(0.1, 0.16), life: 3 });
    sim.spawn = rand(0.5, 1.2);
  }
  sim.objs = sim.objs.filter(o => (o.life -= dt) > 0);
  p.cooldown -= dt;

  if (!sim.manual && sim.objs.length) {
    const target = sim.objs.reduce((a, b) => (Math.hypot(b.x - p.x, b.y - p.y) < Math.hypot(a.x - p.x, a.y - p.y) ? b : a));
    const dx = target.x - p.x, dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    const step = h * 2.2 * dt;
    if (dist > step) { p.x += dx / dist * step; p.y += dy / dist * step; } else { p.x = target.x; p.y = target.y; }
    if (dist < target.size * 0.4 && p.cooldown <= 0) shootAt(p.x, p.y);
  }
}

function shootAt(x, y) {
  sim.player.cooldown = 0.25;
  sim.player.x = x;
  sim.player.y = y;
  const hit = sim.objs.find(o => Math.hypot(o.x - x, o.y - y) < o.size * 0.6);
  sim.fx.push({ x, y, life: 0.25, emoji: hit ? '💥' : '💨' });
  if (hit) {
    sim.objs = sim.objs.filter(o => o !== hit);
    sim.score += 10;
    simEvent('point');
  }
}

/* ---------- Desenho ---------- */

function emoji(ctx, e, x, y, size) {
  ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(e, x, y);
}

function drawSim() {
  const { ctx, w, h, colors: [c1, c2] } = sim;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, c2);
  bg.addColorStop(1, c1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  if (SIM_EXTRA[sim.mode]) SIM_EXTRA[sim.mode].draw(ctx, w, h);

  if (sim.mode === 'runner') {
    const ground = h * 0.8;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    for (let i = 0; i < 4; i++) {
      const x = ((i * w / 3) - sim.t * w * 0.08) % (w * 1.33);
      ctx.beginPath();
      ctx.arc(x < -w * 0.2 ? x + w * 1.33 : x, ground, h * 0.35, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.fillRect(0, ground + h * 0.06, w, h);
    const size = h * 0.12;
    for (const o of sim.objs) emoji(ctx, sim.foe, o.x, ground + h * 0.06 - o.size / 2, o.size);
    emoji(ctx, sim.hero, sim.player.x, sim.player.y + h * 0.06 - size / 2, size);
  }

  if (sim.mode === 'racer') {
    const size = h * 0.13;
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(0, 0, w * 0.2, h);
    ctx.fillRect(w * 0.8, 0, w * 0.2, h);
    ctx.fillStyle = '#23252c';
    ctx.fillRect(w * 0.2, 0, w * 0.6, h);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    const off = (sim.t * h * 0.7) % (h * 0.2);
    for (const lx of [0.4, 0.6]) {
      for (let y = -h * 0.2 + off; y < h; y += h * 0.2) ctx.fillRect(w * lx - 2, y, 4, h * 0.1);
    }
    for (const o of sim.objs) emoji(ctx, sim.foe, laneX(o.lane), o.y, size);
    emoji(ctx, sim.hero, sim.player.x, h * 0.8, size);
  }

  if (sim.mode === 'shooter') {
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2, h * 0.45);
      ctx.lineTo(i * w / 10, h);
      ctx.stroke();
    }
    for (const o of sim.objs) emoji(ctx, sim.foe, o.x, o.y, o.size);
    for (const f of sim.fx) emoji(ctx, f.emoji, f.x, f.y, h * 0.12);
    const p = sim.player;
    ctx.strokeStyle = '#ff3b4e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, h * 0.04, 0, Math.PI * 2);
    ctx.moveTo(p.x - h * 0.07, p.y); ctx.lineTo(p.x + h * 0.07, p.y);
    ctx.moveTo(p.x, p.y - h * 0.07); ctx.lineTo(p.x, p.y + h * 0.07);
    ctx.stroke();
    emoji(ctx, sim.hero, w * 0.88, h * 0.86, h * 0.14);
  }

  if (sim.flash > 0) {
    ctx.fillStyle = `rgba(255,59,78,${sim.flash})`;
    ctx.fillRect(0, 0, w, h);
  }

  // Placar no canto superior direito (a webcam fica no meio, em cima do monitor).
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(w - 142, 12, 130, 24);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${sim.manual ? '🎮' : '🤖'} ${sim.score} pts${sim.deaths ? ` · 💀 ${sim.deaths}` : ''}`, w - 77, 24);
}

/* ---------- Controles ---------- */

document.addEventListener('keydown', e => {
  if (!sim || !live || $('#tab-live').hidden) return;
  const k = e.key;
  if ([' ', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'w', 'a', 'd'].includes(k)) {
    if (e.target.tagName === 'INPUT') return;
    e.preventDefault();
    if (!sim.manual) toggleManual();
    if (SIM_EXTRA[sim.mode]) SIM_EXTRA[sim.mode].key(k);
    if ((k === ' ' || k === 'ArrowUp' || k === 'w') && sim.mode === 'runner') sim.jump = true;
    if ((k === 'ArrowLeft' || k === 'a') && sim.mode === 'racer') sim.player.lane = Math.max(0, sim.player.lane - 1);
    if ((k === 'ArrowRight' || k === 'd') && sim.mode === 'racer') sim.player.lane = Math.min(2, sim.player.lane + 1);
  }
});

document.addEventListener('pointerdown', e => {
  if (!sim || e.target.id !== 'sim-canvas') return;
  if (!sim.manual) toggleManual();
  const r = sim.canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  if (SIM_EXTRA[sim.mode]) SIM_EXTRA[sim.mode].tap(x, y, r.width);
  if (sim.mode === 'runner') sim.jump = true;
  if (sim.mode === 'racer') sim.player.lane = Math.max(0, Math.min(2, sim.player.lane + (x < r.width / 2 ? -1 : 1)));
  if (sim.mode === 'shooter' && sim.player.cooldown <= 0) shootAt(x, y);
});
