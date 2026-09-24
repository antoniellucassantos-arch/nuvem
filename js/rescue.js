'use strict';

// Resgate anti-travamento: se o PC não funciona e você não tem dinheiro para consertar,
// a mãe (ou um amigo, depois que você se mudou) empresta o que falta para a peça mais barata.

function cheapestFix() {
  const b = checkBuild();
  if (b.ok) return 0;
  let cost = 0;
  const mobo = b.parts.mobo;
  for (const slot of SLOTS) {
    if (b.parts[slot]) continue;
    const options = PARTS.filter(p => p.cat === slot && isReleased(p) && p.unlock <= S.followers
      && (slot !== 'cpu' || !mobo || p.socket === mobo.socket)
      && (slot !== 'ram' || !mobo || p.type === mobo.ram))
      .map(priceOf).sort((a, b2) => a - b2);
    cost += options[0] || 0;
  }
  return cost;
}

Hooks.on('daily', () => {
  const need = cheapestFix();
  if (!need || S.money >= need || S.inventory.some(i => !installedSlotOf(i.uid))) return;
  const gift = Math.ceil(need - S.money + 50);
  S.money += gift;
  const who = houseTier(S.house) === 0 ? '👩 Sua mãe ficou com pena' : '🤝 Um amigo ficou com pena';
  toast(`${who} e te deu ${money(gift)} para consertar o PC. Compre as peças que faltam na Loja!`, 'goal');
});
