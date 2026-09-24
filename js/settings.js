'use strict';

// Tela de configurações: volume, velocidade das sessões e animações.

function renderSettings() {
  const st = settings();
  document.documentElement.classList.toggle('no-anim', !st.anim);
  $('#settings-card').innerHTML = `<h2>⚙️ Configurações</h2>
    <label class="oc"><span>🔊 Volume: <b>${st.volume}%</b></span>
      <input type="range" id="set-volume" min="0" max="100" step="10" value="${st.volume}"></label>
    <h3>⏩ Velocidade das lives, programação e treino</h3>
    <div class="chips">${[1, 2, 4].map(v => `<button class="chip-btn ${st.speed === v ? 'active' : ''}" data-action="set-speed" data-v="${v}">${v}x</button>`).join('')}</div>
    <p class="muted">Muda só quanto tempo você espera. O resultado das sessões é o mesmo. Vale a partir da próxima sessão.</p>
    <label class="toggle"><input type="checkbox" id="set-anim" ${st.anim ? 'checked' : ''}>
      <span>✨ Animações (ventoinhas girando, RGB, luzes piscando)</span></label>`;
}

Hooks.on('render', renderSettings);
Hooks.on('action', d => {
  if (d.action === 'set-speed') { settings().speed = Number(d.v); saveGame(); renderSettings(); }
  if (d.action === 'open-settings') { showTab('goals'); $('#settings-card').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'set-volume') return;
  settings().volume = Number(e.target.value);
  saveGame();
  e.target.previousElementSibling.querySelector('b').textContent = settings().volume + '%';
  sfx('click');
});
document.addEventListener('change', e => {
  if (e.target.id !== 'set-anim') return;
  settings().anim = e.target.checked;
  saveGame();
  renderSettings();
});

renderSettings();

// Sub-abas da aba Carreira (Vida, Negócios, Conteúdo, Competições).
function showSubtab(name) {
  document.querySelectorAll('#tab-career .subtab').forEach(el => { el.hidden = el.dataset.sub !== name; });
  document.querySelectorAll('#tab-career [data-action=subtab]').forEach(b => b.classList.toggle('active', b.dataset.sub === name));
  try { localStorage.setItem('inforeal-subtab', name); } catch { /* ok */ }
}
Hooks.on('action', d => { if (d.action === 'subtab') showSubtab(d.sub); });
try { showSubtab(localStorage.getItem('inforeal-subtab') || 'vida'); } catch { showSubtab('vida'); }
