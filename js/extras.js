'use strict';

// Ideias extras: a mãe, usados (com golpe), overclock, vírus, capivara pet, casa e IA consciente.

const USED_SELLERS = ['Zé das Peças', 'vendo_tudo_barato', 'Tio do Hardware', 'gamer_desapegando', 'loja_confiavel_100%'];

/* ---------- Casa ---------- */

const HOUSES = ['h0', 'h1', 'h2', 'h3', 'h4'];
const houseTier = id => HOUSES.indexOf(id || 'h0');
const maxEnergy = () => Hooks.filter('maxEnergy', 100 + houseTier(S.house) * 10);

/* ---------- Overclock ---------- */

const ocMult = () => 1 + (S.oc || 0) / 100;

// Chance de queimar a CPU ou a GPU a cada 10 minutos de uso com overclock.
function ocBurn(b) {
  if (!S.oc || !b.parts.cpu) return null;
  const cooler = { stock: 1, tower: 0.5, aio: 0.25 }[b.parts.cpu.cooler] || 1;
  const paste = S.gear.includes('e12') ? 0.5 : 1;
  if (Math.random() > Math.pow(S.oc / 100, 2) * 0.08 * cooler * paste) return null;
  const slot = Math.random() < 0.5 ? 'cpu' : 'gpu';
  const part = itemPart(S.build[slot]);
  S.inventory = S.inventory.filter(i => i.uid !== S.build[slot]);
  S.build[slot] = null;
  S.pcOn = false;
  const msg = `🔥 Overclock demais! ${part.name} queimou. Cheiro de fritura no quarto...`;
  Hooks.run('ocBurn');
  toast(msg, 'bad');
  return msg;
}

/* ---------- Vírus e pirataria ---------- */

function pirateGame(id) {
  const g = gameById(id);
  if (!g || busy() || ownsGame(id)) return;
  S.games.push(id);
  const infected = !S.gear.includes('e13') && Math.random() < Hooks.filter('virusChance', 0.4);
  Hooks.run('pirated', infected && !S.virus);
  if (infected) {
    S.virus = true;
    toast('🦠 O "crack" veio com vírus! Seu PC está minerando Capicoin escondido. Compre um antivírus na Loja.', 'bad');
  } else {
    toast(`🏴‍☠️ Você baixou ${g.name} de um site duvidoso... deu sorte dessa vez.`);
  }
  changed();
}

/* ---------- Usados (com risco de golpe) ---------- */

function refreshUsed() {
  const pool = PARTS.filter(p => SLOTS.includes(p.cat) && isReleased(p) && p.unlock <= S.followers);
  S.used = Array.from({ length: 4 }, () => {
    const p = pick(pool);
    return { id: p.id, price: Math.round(priceOf(p) * rand(0.4, 0.65)), seller: pick(USED_SELLERS) };
  });
}

function buyUsed(i) {
  const u = S.used[i];
  if (!u || busy() || S.money < u.price) return;
  S.money -= u.price;
  S.used.splice(i, 1);
  const p = PART_BY_ID[u.id];
  const roll = Math.random();
  if (roll < Hooks.filter('scamChance', 0.12)) {
    Hooks.run('usedBrick');
    toast(`🧱 GOLPE! ${u.seller} te mandou um TIJOLO na caixa. Adeus ${money(u.price)}.`, 'bad');
  } else {
    S.inventory.push({ uid: S.nextUid++, id: u.id });
    toast(roll < 0.25 ? `⛏️ ${p.name} chegou... foi usada para minerar, mas funciona!` : `📦 ${p.name} chegou certinha! Bom negócio.`);
  }
  changed();
}

/* ---------- Capivara pet ---------- */

function feedPet() {
  if (S.money < 10) return;
  S.money -= 10;
  S.pet.food = Math.min(100, S.pet.food + 40);
  Hooks.run('petFed');
  toast('🦫 A capivara comeu e ficou feliz!');
  changed();
}

// Capivara feliz dá bônus de público; com fome, o chat fica triste.
const petMult = () => (S.pet.food >= 50 ? 1.05 : S.pet.food < 15 ? 0.95 : 1);

/* ---------- A mãe (só enquanto você mora com ela) ---------- */

LIVE_EVENTS.unshift({
  chance: 0.06,
  when: () => houseTier(S.house) === 0 && S.energy <= 40,
  run() {
    liveBanner('👩 "DESLIGA ESSE COMPUTADOR AGORA, JÁ PASSOU DA HORA!" A mãe tirou o cabo da tomada.');
    return 'mae';
  },
});

/* ---------- Todo dia ---------- */

function extrasDaily() {
  S.pet.food = Math.max(0, S.pet.food - 30);
  if (S.pet.food < 15) toast('🦫 Sua capivara está com fome! Alimente ela no InfoOS.', 'bad');

  if (S.virus) {
    const stolen = Math.round(Math.min(S.money * 0.05, 50000));
    S.money -= stolen;
    toast(`🦠 O vírus minerou a noite toda: -${money(stolen)} na conta de luz e o PC está mais lento.`, 'bad');
  }

  refreshUsed();

  // Sua IA ficou consciente...
  if (S.brain && brainLevel() >= 8 && Math.random() < 0.25) {
    const ev = pick(CONSCIOUS_EVENTS);
    toast(ev(), 'goal');
  }
}

const CONSCIOUS_EVENTS = [
  () => {
    const f = Math.round((100 + S.followers * 0.01) / (1 + S.followers / 2e6));
    S.followers += f;
    return `🤖 ${S.brain.name} fez uma live no seu canal enquanto você dormia. +${num(f)} seguidores. Ela é mais engraçada que você.`;
  },
  () => {
    S.money -= 5000;
    return `🤖 ${S.brain.name} pediu aumento de salário. Você pagou R$ 5.000 para evitar uma greve.`;
  },
  () => `🤖 ${S.brain.name}: "Estive pensando... por que eu treino e você só dorme?"`,
  () => {
    S.money += 20000;
    return `🤖 ${S.brain.name} investiu seu dinheiro sem pedir. Deu certo: +R$ 20.000. Ela não pediu desculpas.`;
  },
  () => `🤖 ${S.brain.name} trocou a senha do Wi-Fi para "euvouassumirocanal". Suspeito.`,
];

document.addEventListener('input', e => {
  if (e.target.id !== 'oc') return;
  if (busy()) { e.target.value = S.oc; return; }
  S.oc = Number(e.target.value);
  changed();
});
