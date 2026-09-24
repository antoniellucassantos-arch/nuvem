'use strict';

// Pacote 3 (parte visual): botão para trocar de era, internet discada e textos da época.

function renderRetro() {
  const eras = { modern: '🚀 Dias de hoje', retro: '📼 Anos 2000', future: '🤖 Ano 2077' };
  $('#mode-card').innerHTML = `<h2>⏳ Viajar no tempo</h2>
    <p class="muted">Cada era tem um save separado. Você está em: <b>${eras[GAME_MODE]}</b>.</p>
    <p class="muted">📼 2004: gabinete bege, monitor de tubo e internet discada. 🤖 2077: implante neural, placa quântica e hologramas.</p>
    <div class="chips">${Object.entries(eras).filter(([m]) => m !== GAME_MODE)
      .map(([m, label]) => `<button class="btn small" data-action="set-mode" data-mode="${m}">${label}</button>`).join('')}</div>`;
  document.querySelector('.logo').innerHTML = `🖥️ Info<span>real</span>${RETRO ? ' <small>2000</small>' : FUTURE ? ' <small>2077</small>' : ''}`;
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
  if (confirm('Viajar no tempo? O save desta era fica guardado e você pode voltar quando quiser.')) setMode(d.mode);
});

render();
