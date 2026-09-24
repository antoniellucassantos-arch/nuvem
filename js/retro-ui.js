'use strict';

// Pacote 3 (parte visual): botão para trocar de era, internet discada e textos da época.

function renderRetro() {
  $('#mode-card').innerHTML = RETRO
    ? `<h2>⏳ Você está nos anos 2000</h2>
      <p class="muted">Monitor de tubo, internet discada e Pentium 4. Este save é separado do jogo normal.</p>
      <button class="btn" data-action="set-mode" data-mode="modern">🚀 Voltar para os dias de hoje</button>`
    : `<h2>⏳ Modo anos 2000</h2>
      <p class="muted">Comece de novo em 2004: gabinete bege, monitor de tubo, internet discada e Contra-Ataque 1.6.
      O seu save atual fica guardado e você pode voltar quando quiser.</p>
      <button class="btn" data-action="set-mode" data-mode="retro">📼 Viajar para os anos 2000</button>`;
  document.querySelector('.logo').innerHTML = RETRO ? '🖥️ Info<span>real</span> <small>2000</small>' : '🖥️ Info<span>real</span>';
  document.querySelectorAll('.os-icon[data-app=stream], .task-btn[data-app=stream]').forEach(b => {
    b.title = RETRO ? 'JustinTV' : 'StreamZinho';
  });
}

Hooks.on('render', renderRetro);

// Internet discada: toda live começa conectando (a menos que você tenha banda larga).
Hooks.on('liveStart', () => {
  if (!RETRO || S.gear.includes('e9')) return;
  liveBanner('📞 Conectando na internet discada... iiiiiuuuuu kshhhhhh 🎵');
  [1200, 2100, 900, 1800, 2400].forEach((f, i) => setTimeout(() => beep(f, 0.25, 'sine', 0.04), i * 250));
  live.lag = 4;
});

Hooks.on('action', d => {
  if (d.action !== 'set-mode' || busy()) return;
  const retro = d.mode === 'retro';
  if (confirm(retro ? 'Viajar para os anos 2000? Seu save atual fica guardado.' : 'Voltar para os dias de hoje? O save dos anos 2000 fica guardado.')) setMode(retro);
});

render();
