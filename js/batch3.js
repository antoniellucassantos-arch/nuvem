'use strict';

// Lote 3: saúde, amigos e namoro, cidades, montagem manual (arrastar, pasta térmica, cabos)
// e vazamento do water cooler.

function life() {
  S.life = { health: 80, friends: 0, partner: false, love: 60, city: 'interior', cables: false, paste: 'ok', lastCare: 0, ...(S.life || {}) };
  return S.life;
}

/* ---------- 11. Saúde ---------- */

const healthMult = () => (life().health < 30 ? 0.9 : life().health > 80 ? 1.05 : 1);
Hooks.on('liveEnd', () => { life().health = Math.max(0, life().health - 4); });
Hooks.on('maxEnergy', v => v - (life().health < 30 ? 30 : 0) + (life().partner && life().love >= 60 ? 10 : 0));

/* ---------- 13. Cidades ---------- */

const CITIES = {
  interior: { name: 'Interior', icon: '🏡', rent: 50, mult: 1, cost: 0, desc: 'Aluguel barato e tranquilidade' },
  sp: { name: 'São Paulo', icon: '🏙️', rent: 400, mult: 1.15, cost: 5000, desc: '+15% de público, mais eventos, aluguel caro' },
  exterior: { name: 'Morar fora', icon: '✈️', rent: 1200, mult: 1.4, cost: 30000, desc: '+40% de público gringo, mas o fuso cansa (−10 de energia)' },
};
Hooks.on('gearMult', v => v * healthMult() * CITIES[life().city].mult * (life().cables ? 1.03 : 1));
Hooks.on('maxEnergy', v => v - (life().city === 'exterior' ? 10 : 0));

/* ---------- 14. Montagem manual ---------- */

// Arrastar uma peça guardada para o gabinete instala a peça.
document.addEventListener('dragstart', e => {
  const btn = e.target.closest && e.target.closest('.item');
  const install = btn && btn.querySelector('[data-action=install]');
  if (install) e.dataTransfer.setData('text/plain', install.dataset.uid);
});
document.addEventListener('dragover', e => { if (e.target.closest && e.target.closest('#case')) e.preventDefault(); });
document.addEventListener('drop', e => {
  if (!e.target.closest || !e.target.closest('#case')) return;
  e.preventDefault();
  const uid = Number(e.dataTransfer.getData('text/plain'));
  if (uid) installPart(uid);
});

// Ao instalar um processador, você escolhe quanta pasta térmica passar.
Hooks.on('installed', p => {
  if (p.cat === 'cpu') { S.pasteAsk = true; life().cables = false; }
  if (p.cat !== 'cpu') life().cables = false;   // mexeu no PC, bagunçou os cabos
});
const PASTE = { none: 'Nada', ok: 'Um grãozinho de ervilha', lots: 'O tubo inteiro' };

/* ---------- 15. Vazamento do water cooler ---------- */

Hooks.on('daily', () => {
  const L = life();
  // Saúde e relacionamentos
  L.health = Math.min(100, L.health + 8 + (S.gear.includes('e14') ? 5 : 0));
  if (L.partner) {
    L.love = Math.max(0, L.love - (S.stats.lives > 0 ? 8 : 3));
    if (L.love < 20) toast('💔 Sua namorada(o) reclamou: "Você só joga!" Marque um encontro.', 'bad');
  }
  if (Math.random() < 0.15 && S.stats.lives > 2) {
    L.friends++;
    toast(`🤝 Você fez um amigo novo no chat! Agora são ${L.friends}.`);
  }
  // Aluguel
  const rent = CITIES[L.city].rent;
  S.money -= rent;
  // Water cooler
  const cpu = S.build.cpu && itemPart(S.build.cpu);
  if (cpu && cpu.cooler === 'aio' && S.day - L.lastCare > 7 && Math.random() < 0.04 && S.build.gpu) {
    const gpu = itemPart(S.build.gpu);
    S.inventory = S.inventory.filter(i => i.uid !== S.build.gpu);
    S.build.gpu = null;
    S.pcOn = false;
    toast(`💦 O water cooler VAZOU e molhou a ${gpu.name}! Faça manutenção a cada 7 dias.`, 'bad');
  }
});

// Pasta térmica ruim aumenta o risco de queimar no overclock.
const _ocRisk = () => ({ none: 2, ok: 1, lots: 1.3 })[life().paste];

/* ---------- Interface ---------- */

function renderBatch3() {
  const L = life();
  const lock = busy() ? 'disabled' : '';
  const c = CITIES[L.city];
  $('#life-card').innerHTML = `<h2>❤️ Sua vida</h2>
    <div class="specs">
      <div><span class="muted">Saúde</span><b class="${L.health < 30 ? 'txt-bad' : L.health > 80 ? 'txt-good' : ''}">${Math.round(L.health)}/100</b></div>
      <div><span class="muted">Amigos</span><b>${L.friends}</b></div>
      <div><span class="muted">Cidade</span><b>${c.icon} ${c.name}</b></div>
      <div><span class="muted">Aluguel/dia</span><b class="txt-bad">${money(c.rent)}</b></div>
    </div>
    <p class="muted">Lives cansam o corpo. Saúde baixa (&lt;30) tira energia e público; saúde alta (&gt;80) dá +5% de público.</p>
    <div class="chips">
      <button class="btn small" data-action="life-eat" ${lock || S.money < 30 ? 'disabled' : ''}>🥗 Comer bem (R$ 30)</button>
      <button class="btn small" data-action="life-out" ${lock || S.energy < 10 ? 'disabled' : ''}>🌳 Sair de casa (⚡10)</button>
      ${S.gear.includes('e14') ? '<span class="chip ok">🏋️ Academia em casa</span>' : `<button class="btn small ghost" data-action="life-gym" ${lock || S.money < 5000 ? 'disabled' : ''}>🏋️ Academia em casa (R$ 5.000)</button>`}
    </div>
    <h3>💬 Amigos e namoro</h3>
    <div class="chips">
      <button class="btn small" data-action="life-friend" ${lock || !L.friends || S.collab ? 'disabled' : ''}>🎮 Chamar amigo para a próxima live</button>
      ${L.partner
        ? `<span class="chip">💕 Namorando · amor ${Math.round(L.love)}%</span>
           <button class="btn small" data-action="life-date" ${lock || S.money < 200 || S.energy < 20 ? 'disabled' : ''}>🍝 Encontro (R$ 200, ⚡20)</button>`
        : `<button class="btn small ghost" data-action="life-flirt" ${lock || L.friends < 3 ? 'disabled' : ''}>💌 Chamar alguém para sair ${L.friends < 3 ? '(precisa de 3 amigos)' : ''}</button>`}
    </div>
    <p class="muted">Namoro feliz (amor 60%+) dá +10 de energia. Esquecer do encontro dá briga.</p>
    <h3>🗺️ Mudar de cidade</h3>
    <div class="chips">${Object.entries(CITIES).filter(([id]) => id !== L.city).map(([id, x]) =>
      `<button class="chip-btn" data-action="life-move" data-id="${id}" title="${x.desc}" ${lock || S.money < x.cost ? 'disabled' : ''}>${x.icon} ${x.name} (${money(x.cost)})</button>`).join('')}</div>
    <p class="muted">${Object.values(CITIES).map(x => `${x.icon} ${x.desc}`).join(' · ')}</p>`;

  const cpu = S.build.cpu && itemPart(S.build.cpu);
  $('#care-card').innerHTML = `<h2>🧰 Cuidados com o PC</h2>
    <p class="muted">Dica: você também pode <b>arrastar</b> uma peça guardada para dentro do gabinete para instalar.</p>
    <div class="chips">
      ${L.cables ? '<span class="chip ok">🧵 Cabos organizados (+3% público)</span>'
        : `<button class="btn small" data-action="care-cables" ${lock || S.energy < 10 ? 'disabled' : ''}>🧵 Organizar os cabos (⚡10)</button>`}
      ${cpu && cpu.cooler === 'aio' ? `<button class="btn small ghost" data-action="care-aio" ${lock || S.money < 300 ? 'disabled' : ''}>💧 Manutenção do water cooler (R$ 300) · última há ${S.day - L.lastCare} dias</button>` : ''}
    </div>
    <p class="muted">Pasta térmica: <b>${PASTE[L.paste]}</b>${L.paste === 'ok' ? ' ✅' : ' ⚠️ (mais risco no overclock)'}</p>`;

  const el = $('#paste-modal');
  el.hidden = !S.pasteAsk;
  if (S.pasteAsk) {
    el.innerHTML = `<div class="choice-box"><h2>🧴 Pasta térmica</h2><p>Quanta pasta térmica você passa no processador novo?</p>
      <div class="choice-buttons">${Object.entries(PASTE).map(([k, t]) => `<button class="btn ${k === 'ok' ? '' : 'ghost'}" data-action="paste" data-v="${k}">${t}</button>`).join('')}</div></div>`;
  }
  document.querySelectorAll('#inventory .item').forEach(it => { it.draggable = true; });
}

Hooks.on('render', renderBatch3);
Hooks.on('ocBurnChance', v => v * _ocRisk());

Hooks.on('action', d => {
  const L = life();
  const msg = (text, cls) => { toast(text, cls); changed(); };
  switch (d.action) {
    case 'life-eat': if (S.money < 30) return; S.money -= 30; L.health = Math.min(100, L.health + 15); return msg('🥗 Comida de verdade! +15 de saúde.');
    case 'life-out': if (S.energy < 10) return; S.energy -= 10; L.health = Math.min(100, L.health + 20); return msg('🌳 Tomar sol faz bem! +20 de saúde.');
    case 'life-gym':
      if (S.money < 5000) return;
      S.money -= 5000; S.gear.push('e14');
      return msg('🏋️ Academia montada! +5 de saúde por dia.', 'goal');
    case 'life-friend':
      S.collab = { name: `seu amigo #${1 + Math.floor(Math.random() * L.friends)}`, viewers: Math.round(10 + Math.pow(S.followers, 0.6) * 0.3) };
      return msg('🎮 Seu amigo topou! Ele entra na sua próxima live.', 'goal');
    case 'life-flirt':
      if (Math.random() < 0.5) { L.partner = true; L.love = 70; return msg('💕 Deu certo! Vocês estão namorando.', 'goal'); }
      return msg('🙃 Levou um fora. Tente de novo outro dia.', 'bad');
    case 'life-date':
      if (S.money < 200 || S.energy < 20) return;
      S.money -= 200; S.energy -= 20; L.love = Math.min(100, L.love + 35);
      return msg('🍝 Encontro perfeito! O amor subiu.', 'goal');
    case 'life-move': {
      const c = CITIES[d.id];
      if (!c || S.money < c.cost) return;
      S.money -= c.cost; L.city = d.id;
      return msg(`${c.icon} Você se mudou para ${c.name}!`, 'goal');
    }
    case 'care-cables': if (S.energy < 10) return; S.energy -= 10; L.cables = true; return msg('🧵 Cabos organizados com abraçadeira. Ficou lindo!');
    case 'care-aio': if (S.money < 300) return; S.money -= 300; L.lastCare = S.day; return msg('💧 Water cooler revisado, sem risco de vazar por 7 dias.');
    case 'paste':
      L.paste = d.v; S.pasteAsk = false;
      return msg({ none: '😬 Sem pasta térmica? O processador vai fritar...', ok: '👌 Quantidade perfeita!', lots: '🤢 Pasta escorrendo pela placa-mãe... funciona, mas que sujeira.' }[d.v]);
  }
});

renderBatch3();
