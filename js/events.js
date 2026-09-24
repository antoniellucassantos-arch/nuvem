'use strict';

// Eventos aleatórios: fonte genérica explodindo, raids, quedas de energia, presentes...

const STREAMERS = ['GauleZinho', 'CasimiroFake', 'Alanzoka Cover', 'LoudCoringa Jr', 'NobruDoBairro', 'TiaGamer'];

/* ---------- Fonte genérica ---------- */

// Chance de a fonte genérica explodir a cada 10 minutos de uso. Sobrecarregada é bem pior.
function psuExplodes(b) {
  if (window.TEST_CALM) return false;   // testes automáticos desligam a sorte
  const psu = b.parts.psu;
  if (!psu || !psu.generic) return false;
  const load = b.watts / psu.watts;
  return Math.random() < 0.004 + (load > 0.75 ? 0.03 : 0);
}

// Remove a fonte (e às vezes leva outra peça junto). Devolve a mensagem para mostrar.
function psuBoom() {
  Hooks.run('psuBoom');
  const uid = S.build.psu;
  S.inventory = S.inventory.filter(i => i.uid !== uid);
  S.build.psu = null;
  S.pcOn = false;
  let msg = '💥 BOOM! A fonte genérica explodiu!';
  if (Math.random() < 0.3) {
    const victim = pick(['gpu', 'mobo', 'storage'].filter(slot => S.build[slot]));
    if (victim) {
      const part = itemPart(S.build[victim]);
      S.inventory = S.inventory.filter(i => i.uid !== S.build[victim]);
      S.build[victim] = null;
      msg += ` E levou junto: ${part.name} 😭`;
    }
  }
  toast(msg + ' Compre uma fonte de qualidade.', 'bad');
  return msg;
}

/* ---------- Eventos durante a live ---------- */

const LIVE_EVENTS = [
  {
    chance: 0.025, run(L) {
      const n = Math.round(20 + L.viewers * rand(0.5, 2));
      L.raid = (L.raid || 0) + n;
      liveBanner(`🚀 RAID! ${pick(STREAMERS)} mandou ${num(n)} pessoas para a sua live!`);
    },
  },
  {
    chance: 0.012, run(L) {
      const f = Math.round((50 + S.followers * 0.02) / (1 + S.followers / 2e6));
      S.followers += f;
      L.followers += f;
      liveBanner(`🔥 Um clipe da sua live viralizou! +${num(f)} seguidores`);
    },
  },
  {
    chance: 0.015, run(L) {
      const f = Math.round(5 + L.viewers * 0.05);
      S.followers += f;
      L.followers += f;
      liveBanner('🐱 Seu gato deitou no teclado! O chat amou.');
      addChat(pick(NAMES), 'GATOOOOO 😻');
    },
  },
  {
    chance: 0.01, run(L) {
      const v = Math.round(200 + L.viewers * 3);
      S.money += v;
      L.earned += v;
      liveBanner(`💼 Uma marca fechou patrocínio ao vivo: +${money(v)}`);
    },
  },
  {
    chance: 0.02, run() {
      addChat('hater_anônimo', pick(['seu PC é uma batata', 'live chata', 'vou dar unfollow', 'joga nada']), 'hater');
      addChat(pick(NAMES), pick(['ignora o hater!', 'ban nele', 'vai jogar Paciência, hater']));
    },
  },
  {
    chance: 0.006, run() {
      if (S.gear.includes('e8')) {
        liveBanner('⚡ A luz piscou, mas o nobreak segurou a live!');
        return;
      }
      liveBanner('⚡ Queda de energia! A live caiu. (Um nobreak evitaria isso.)');
      return 'blackout';
    },
  },
  {
    chance: 0.01, run(L) {
      if (S.gear.includes('e9')) return;
      L.lag = 3;
      liveBanner('📶 A internet oscilou e a live travou um pouco... (um roteador melhor resolve)');
    },
  },
  {
    // PC esquenta se o gabinete tem pouca ventilação e as peças gastam muito.
    chance: 0.05,
    when: L => !L.hot && (PART_BY_ID[S.caseId] || PART_BY_ID.k1).look.fans < 2 && L.watts > 260,
    run(L) {
      L.hot = true;
      L.fps = Math.max(1, Math.round(L.fps * 0.7));
      L.q = quality(L.fps);
      setSimFps(L.fps);
      $('#live-fps').textContent = `${L.fps} FPS · ${L.q.label}`;
      $('#live-fps').className = 'live-fps ' + L.q.cls;
      liveBanner('🌡️ O PC esquentou e o FPS caiu! Um gabinete com mais ventoinhas ajuda.');
    },
  },
];

// Roda no máximo um evento por tick. Devolve 'blackout' se a live precisa acabar.
function liveEvent(L) {
  if (window.TEST_CALM) return null;
  for (const ev of LIVE_EVENTS) {
    if ((!ev.when || ev.when(L)) && Math.random() < ev.chance) return ev.run(L) || null;
  }
  return null;
}

function liveBanner(text) {
  const el = $('#event-banner');
  el.textContent = text;
  el.hidden = false;
  addChat('Sistema', text, 'sys');
  clearTimeout(liveBanner.timer);
  liveBanner.timer = setTimeout(() => { el.hidden = true; }, 4000);
}

/* ---------- Eventos ao acordar ---------- */

const DAILY_EVENTS = [
  () => {
    const options = PARTS.filter(p => ['cpu', 'gpu', 'ram', 'storage'].includes(p.cat) && isReleased(p) && p.unlock <= S.followers && p.price <= 1500);
    const p = pick(options);
    S.inventory.push({ uid: S.nextUid++, id: p.id });
    return `🎁 Uma marca te mandou de presente: ${p.name}! (está nas peças guardadas)`;
  },
  () => {
    const f = Math.round((30 + S.followers * 0.03) / (1 + S.followers / 2e6));
    S.followers += f;
    return `🦫 Uma capivara apareceu no fundo da sua live de ontem e viralizou! +${num(f)} seguidores`;
  },
  () => {
    const v = Math.round(20 + S.money * 0.01);
    S.money -= Math.min(v, 5000);
    return `🌡️ Onda de calor! O ar-condicionado ficou ligado a noite toda: -${money(Math.min(v, 5000))} na conta de luz`;
  },
  () => {
    if (S.followers < 1000) return null;
    const f = Math.round((200 + S.followers * 0.05) / (1 + S.followers / 2e6));
    S.followers += f;
    return `🎪 Você foi convidado para um evento gamer! +${num(f)} seguidores`;
  },
  () => {
    S.energy = Math.min(120, S.energy + 20);
    return '☕ Você acordou super disposto! +20 de energia hoje';
  },
];

function dailyEvent() {
  if (Math.random() > 0.3) return;
  const msg = pick(DAILY_EVENTS)();
  if (msg) toast(msg, 'goal');
}
