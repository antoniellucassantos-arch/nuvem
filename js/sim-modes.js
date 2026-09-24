'use strict';

// Modos extras da simulação da live: futebol, kart, quebra-cabeça e batalha de RPG.
// Cada modo tem: hint (dica de controle), init, update(dt), draw(ctx, w, h), key(tecla), tap(x, y, largura).

const SIM_EXTRA = {
  /* ⚽ Pênaltis: chute quando o goleiro estiver longe. */
  soccer: {
    hint: '← → mira, Espaço chuta (ou toque no gol)',
    init() { sim.player = { aim: 0.5, ball: null, cool: 0.8 }; },
    update(dt) {
      const p = sim.player;
      sim.keeper = 0.5 + Math.sin(sim.t * 2.2) * 0.32;
      p.cool -= dt;
      if (!p.ball && !sim.manual && p.cool <= 0) {
        p.aim = sim.keeper < 0.5 ? rand(0.65, 0.85) : rand(0.15, 0.35);
        p.shoot = true;
      }
      if (p.shoot && !p.ball && p.cool <= 0) p.ball = { t: 0, x: p.aim };
      p.shoot = false;
      if (p.ball) {
        p.ball.t += dt / 0.6;
        if (p.ball.t >= 1) {
          const saved = Math.abs(sim.keeper - p.ball.x) < 0.14;
          sim.fx.push({ x: sim.w * p.ball.x, y: sim.h * 0.3, life: 0.6, emoji: saved ? '❌' : '🎉' });
          if (saved) die(); else { sim.score += 10; simEvent('point'); }
          p.ball = null;
          p.cool = 0.9;
        }
      }
    },
    draw(ctx, w, h) {
      ctx.fillStyle = '#2f8f3a'; ctx.fillRect(0, h * 0.45, w, h * 0.55);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
      ctx.strokeRect(w * 0.12, h * 0.15, w * 0.76, h * 0.32);
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1;
      for (let x = 0.12; x < 0.88; x += 0.04) { ctx.beginPath(); ctx.moveTo(w * x, h * 0.15); ctx.lineTo(w * x, h * 0.47); ctx.stroke(); }
      emoji(ctx, '🧤', w * sim.keeper, h * 0.36, h * 0.16);
      const p = sim.player;
      if (p.ball) {
        const t = p.ball.t;
        emoji(ctx, '⚽', w * (0.5 + (p.ball.x - 0.5) * t), h * (0.85 - 0.55 * t), h * (0.1 - 0.04 * t));
      } else {
        emoji(ctx, '⚽', w * 0.5, h * 0.85, h * 0.1);
        if (sim.manual) { ctx.strokeStyle = '#ffb547'; ctx.beginPath(); ctx.arc(w * p.aim, h * 0.3, h * 0.05, 0, 7); ctx.stroke(); }
      }
      for (const f of sim.fx) emoji(ctx, f.emoji, f.x, f.y, h * 0.14);
    },
    key(k) {
      const p = sim.player;
      if (k === 'ArrowLeft' || k === 'a') p.aim = Math.max(0.15, p.aim - 0.1);
      if (k === 'ArrowRight' || k === 'd') p.aim = Math.min(0.85, p.aim + 0.1);
      if (k === ' ' || k === 'ArrowUp' || k === 'w') p.shoot = true;
    },
    tap(x, y, width) { sim.player.aim = Math.max(0.15, Math.min(0.85, x / width)); sim.player.shoot = true; },
  },

  /* 🏎️ Kart: desvie das bananas e pegue as caixas ❓. */
  kart: {
    hint: '← → ou toque nos lados. Pegue as caixas ❓!',
    init() { sim.player = { lane: 1, x: laneX(1) }; },
    update(dt) {
      const { h, player: p } = sim;
      const size = h * 0.12, py = h * 0.8;
      sim.spawn -= dt;
      if (sim.spawn <= 0) {
        sim.objs.push({ lane: Math.floor(Math.random() * 3), y: -size, box: Math.random() < 0.35 });
        sim.spawn = rand(0.5, 1);
      }
      for (const o of sim.objs) o.y += h * 0.8 * dt;
      if (!sim.manual) {
        const next = sim.objs.filter(o => o.y < py && py - o.y < h * 0.5).sort((a, b) => b.y - a.y)[0];
        if (next) {
          if (next.box) p.lane = next.lane;
          else if (next.lane === p.lane) p.lane = [0, 1, 2].filter(l => l !== next.lane)[Math.random() < 0.5 ? 0 : 1];
        }
      }
      p.x += (laneX(p.lane) - p.x) * Math.min(1, dt * 12);
      for (const o of sim.objs) {
        if (!o.hit && Math.abs(laneX(o.lane) - p.x) < size * 0.6 && Math.abs(o.y - py) < size * 0.7) {
          o.hit = true;
          if (o.box) { sim.score += 10; simEvent('point'); sim.fx.push({ x: p.x, y: py - size, life: 0.4, emoji: '✨' }); } else die();
        }
      }
      sim.objs = sim.objs.filter(o => !o.hit && o.y < h + size);
    },
    draw(ctx, w, h) {
      ctx.fillStyle = '#3a3d46'; ctx.fillRect(w * 0.2, 0, w * 0.6, h);
      const off = (sim.t * h * 0.8) % 40;
      for (let y = -40 + off; y < h; y += 40) {
        ctx.fillStyle = (Math.floor((y - off) / 40) % 2) ? '#e11d48' : '#fff';
        ctx.fillRect(w * 0.18, y, w * 0.02, 20); ctx.fillRect(w * 0.8, y, w * 0.02, 20);
        ctx.fillRect(w * 0.18, y + 20, w * 0.02, 20); ctx.fillRect(w * 0.8, y + 20, w * 0.02, 20);
      }
      for (const o of sim.objs) emoji(ctx, o.box ? '❓' : '🍌', laneX(o.lane), o.y, h * 0.1);
      emoji(ctx, '🏎️', sim.player.x, h * 0.8, h * 0.13);
      for (const f of sim.fx) emoji(ctx, f.emoji, f.x, f.y, h * 0.1);
    },
    key(k) {
      if (k === 'ArrowLeft' || k === 'a') sim.player.lane = Math.max(0, sim.player.lane - 1);
      if (k === 'ArrowRight' || k === 'd') sim.player.lane = Math.min(2, sim.player.lane + 1);
    },
    tap(x, y, width) { sim.player.lane = Math.max(0, Math.min(2, sim.player.lane + (x < width / 2 ? -1 : 1))); },
  },

  /* 🧩 Quebra-cabeça: leve cada bloco colorido para o cesto da mesma cor. */
  puzzle: {
    hint: '← ↓ → ou toque na coluna: bloco na cor certa!',
    colors: ['🟥', '🟩', '🟦'],
    init() { sim.player = { block: null, col: 1 }; },
    update(dt) {
      const p = sim.player;
      if (!p.block) p.block = { color: Math.floor(Math.random() * 3), y: 0, x: 1 };
      const b = p.block;
      b.y += dt * 0.45;
      if (!sim.manual && b.y > 0.2) p.col = sim.fps < 20 && Math.random() < 0.02 ? Math.floor(Math.random() * 3) : b.color;
      b.x += (p.col - b.x) * Math.min(1, dt * 10);
      if (b.y >= 0.78) {
        if (p.col === b.color) { sim.score += 10; simEvent('point'); sim.fx.push({ x: sim.w * (0.25 + 0.25 * p.col), y: sim.h * 0.7, life: 0.4, emoji: '✨' }); }
        else die();
        p.block = null;
        p.col = 1;
      }
    },
    draw(ctx, w, h) {
      const self = SIM_EXTRA.puzzle;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(w * (0.13 + 0.25 * i), h * 0.08, w * 0.24, h * 0.72);
        emoji(ctx, '🧺', w * (0.25 + 0.25 * i), h * 0.88, h * 0.13);
        emoji(ctx, self.colors[i], w * (0.25 + 0.25 * i), h * 0.9, h * 0.06);
      }
      const b = sim.player.block;
      if (b) emoji(ctx, self.colors[b.color], w * (0.25 + 0.25 * b.x), h * (0.1 + b.y * 0.8), h * 0.12);
      for (const f of sim.fx) emoji(ctx, f.emoji, f.x, f.y, h * 0.1);
    },
    key(k) {
      if (k === 'ArrowLeft' || k === 'a') sim.player.col = 0;
      if (k === 'ArrowDown' || k === 's' || k === ' ') sim.player.col = 1;
      if (k === 'ArrowRight' || k === 'd') sim.player.col = 2;
    },
    tap(x, y, width) { sim.player.col = Math.max(0, Math.min(2, Math.floor((x / width - 0.13) / 0.25))); },
  },

  /* ⚔️ Batalha de RPG por turnos: atacar ou curar. */
  rpg: {
    hint: '← ou toque à esquerda: atacar · → ou à direita: curar',
    init() { sim.player = { hp: 100, turn: 0.9, choice: null }; this.spawn(1); },
    spawn(level) { sim.foeHp = sim.foeMax = 40 + level * 15; sim.foeLvl = level; },
    update(dt) {
      const p = sim.player;
      p.turn -= dt;
      if (p.turn > 0) return;
      p.turn = 0.9;
      const choice = sim.manual ? p.choice : (p.hp < 35 ? 'heal' : 'attack');
      p.choice = null;
      if (!choice) return;
      if (choice === 'attack') {
        const dmg = Math.round(rand(12, 22));
        sim.foeHp -= dmg;
        sim.fx.push({ x: sim.w * 0.72, y: sim.h * 0.42, life: 0.5, emoji: '💥', text: `-${dmg}` });
      } else {
        p.hp = Math.min(100, p.hp + 30);
        sim.fx.push({ x: sim.w * 0.28, y: sim.h * 0.42, life: 0.5, emoji: '💚', text: '+30' });
      }
      if (sim.foeHp <= 0) { sim.score += 10; simEvent('point'); SIM_EXTRA.rpg.spawn(sim.foeLvl + 1); return; }
      p.hp -= Math.round(rand(6, 10) + sim.foeLvl * 2);
      if (p.hp <= 0) { die(); p.hp = 100; SIM_EXTRA.rpg.spawn(1); }
    },
    draw(ctx, w, h) {
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, h * 0.7, w, h * 0.3);
      const bar = (x, hp, max, color) => {
        ctx.fillStyle = '#111'; ctx.fillRect(x - w * 0.12, h * 0.2, w * 0.24, 10);
        ctx.fillStyle = color; ctx.fillRect(x - w * 0.12, h * 0.2, w * 0.24 * Math.max(0, hp / max), 10);
      };
      bar(w * 0.28, sim.player.hp, 100, '#3ecf8e');
      bar(w * 0.72, sim.foeHp, sim.foeMax, '#ff5c6c');
      emoji(ctx, sim.hero, w * 0.28, h * 0.5, h * 0.22);
      emoji(ctx, sim.foe, w * 0.72, h * 0.5, h * 0.22 + sim.foeLvl * 2);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`Nível ${sim.foeLvl}`, w * 0.72, h * 0.17);
      for (const f of sim.fx) { emoji(ctx, f.emoji, f.x, f.y, h * 0.1); if (f.text) { ctx.fillStyle = '#fff'; ctx.fillText(f.text, f.x, f.y - h * 0.08); } }
      if (sim.manual) {
        ctx.font = 'bold 14px system-ui';
        ctx.fillText('⚔️ ATACAR', w * 0.25, h * 0.85); ctx.fillText('💚 CURAR', w * 0.75, h * 0.85);
      }
    },
    key(k) {
      if (k === 'ArrowLeft' || k === 'a') sim.player.choice = 'attack';
      if (k === 'ArrowRight' || k === 'd') sim.player.choice = 'heal';
    },
    tap(x, y, width) { sim.player.choice = x < width / 2 ? 'attack' : 'heal'; },
  },
};
