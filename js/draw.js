'use strict';

// Desenhos em SVG: gabinete, peças, miniaturas da loja e capas dos jogos.
// As peças usam as mesmas coordenadas do gabinete (viewBox 0 0 420 460);
// as miniaturas só "recortam" a região de cada peça com outro viewBox.

const BRAND_COLORS = { intel: '#0071c5', amd: '#ed1c24', nvidia: '#76b900' };

function svgFan(cx, cy, r, cls = '') {
  const blades = [0, 90, 180, 270].map(a =>
    `<ellipse cx="${cx}" cy="${cy - r * 0.45}" rx="${r * 0.24}" ry="${r * 0.42}" transform="rotate(${a + 20} ${cx} ${cy})"/>`,
  ).join('');
  return `<g class="fan ${cls}">
    <circle class="fan-ring" cx="${cx}" cy="${cy}" r="${r}"/>
    <g class="blades"><circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="none"/>${blades}</g>
    <circle class="fan-hub" cx="${cx}" cy="${cy}" r="${r * 0.22}"/>
  </g>`;
}

function svgEmpty(x, y, w, h, cat, label = CATS[cat], ty = y + h / 2) {
  return `<g class="empty-part" data-action="shop-cat" data-cat="${cat}">
    <title>Comprar ${CATS[cat]}</title>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>
    <text x="${x + w / 2}" y="${ty}">+ ${label}</text>
  </g>`;
}

/* ---------- Peças ---------- */

function drawShell(c, thumb = false) {
  const L = c.look;
  const fanY = { 1: [170], 2: [120, 220], 3: [90, 170, 250] }[L.fans];
  return `
    ${thumb ? '' : `<defs><radialGradient id="case-glow" cx="50%" cy="40%" r="65%">
      <stop class="glow-stop" offset="0%" stop-color="#7c5cff" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#7c5cff" stop-opacity="0"/></radialGradient></defs>`}
    <rect class="case-foot" x="40" y="448" width="60" height="10" rx="3"/>
    <rect class="case-foot" x="320" y="448" width="60" height="10" rx="3"/>
    <rect class="case-shell" x="8" y="8" width="404" height="444" rx="16"/>
    <rect class="case-inside" x="22" y="22" width="376" height="416" rx="10"/>
    ${L.rgb && !thumb ? '<rect class="case-glow" x="22" y="22" width="376" height="416" rx="10" fill="url(#case-glow)"/>' : ''}
    <circle class="led" cx="380" cy="15" r="4"/>
    <rect class="power-btn" x="346" y="12" width="20" height="6" rx="3"/>
    ${fanY.map(cy => svgFan(372, cy, 22, 'front-fan' + (L.rgb ? ' rgb-ring' : ''))).join('')}
    ${thumb ? `<rect class="shroud" x="22" y="330" width="376" height="108" rx="6"/>` : ''}`;
}

function drawMobo(m) {
  const premium = m.price >= 1400;
  return `<g><title>${m.name}</title>
    <rect x="40" y="40" width="250" height="270" rx="4" fill="${m.color}" stroke="#454b5c"/>
    <path class="traces" d="M70 180 H180 M70 188 H150 M246 180 V250 M256 190 V250 M60 60 V160 M180 240 H236"/>
    ${premium
      ? '<rect x="40" y="44" width="34" height="104" rx="4" fill="#2b2e37"/><rect class="rgb" x="70" y="50" width="3" height="92"/>'
      : '<rect x="40" y="48" width="22" height="86" fill="#3b3f4b"/>'}
    <rect x="84" y="52" width="96" height="14" rx="2" fill="#30343f"/>
    <rect x="76" y="70" width="14" height="82" rx="2" fill="#30343f"/>
    <rect x="100" y="84" width="60" height="60" rx="3" fill="#0d0f14" stroke="#3b3f4b"/>
    ${[60, 70, 80].map(y => `<circle cx="190" cy="${y}" r="3" fill="#6b7280"/>`).join('')}
    ${[208, 220, 232, 244].map(x => `<rect x="${x}" y="68" width="7" height="104" rx="1" fill="#0d0f14"/>`).join('')}
    <rect x="280" y="150" width="8" height="42" rx="1" fill="#d6d8dc"/>
    ${[228, 238, 248].map(y => `<rect x="282" y="${y}" width="6" height="6" fill="#1b1d24"/>`).join('')}
    <rect x="62" y="211" width="170" height="7" rx="2" fill="#0d0f14"/>
    <rect x="62" y="294" width="170" height="6" rx="2" fill="#0d0f14"/>
    <rect x="70" y="264" width="96" height="14" rx="2" fill="#0d0f14"/>
    <rect x="236" y="256" width="40" height="32" rx="3" fill="${premium ? '#2b2e37' : '#30343f'}"/>
    ${premium ? '<rect class="rgb" x="236" y="286" width="40" height="2"/>' : ''}
    <text class="board-label" x="282" y="304">${m.short}</text>
  </g>`;
}

function drawCooler(cpu) {
  const brand = BRAND_COLORS[cpu.brand];
  if (cpu.cooler === 'tower') {
    const fins = Array.from({ length: 19 }, (_, i) => `M100 ${70 + i * 5} H160`).join(' ');
    return `<g><title>${cpu.name} + cooler torre</title>
      <path d="M112 166 V58 M130 166 V58 M148 166 V58" stroke="#c87533" stroke-width="4"/>
      <rect x="98" y="64" width="64" height="102" rx="3" fill="#9aa0aa"/>
      <path d="${fins}" stroke="#737a86" stroke-width="1.5"/>
      <rect x="84" y="66" width="14" height="98" rx="3" fill="#1b1d24" stroke="#3a3f4d"/>
      <rect x="96" y="58" width="68" height="8" rx="2" fill="#1b1d24"/>
      <rect x="96" y="58" width="68" height="3" rx="1" fill="${brand}"/>
      <text class="part-label" x="130" y="182">${cpu.short}</text>
    </g>`;
  }
  if (cpu.cooler === 'aio') {
    const radFins = Array.from({ length: 36 }, (_, i) => `M${74 + i * 6} 26 V36`).join(' ');
    return `<g><title>${cpu.name} + water cooler</title>
      <rect x="70" y="24" width="220" height="14" rx="3" fill="#1b1d24"/>
      <path d="${radFins}" stroke="#3a3f4d" stroke-width="2"/>
      ${[78, 148, 218].map(x => `<rect x="${x}" y="38" width="64" height="5" rx="2" fill="#25282f"/><rect class="rgb" x="${x}" y="42" width="64" height="1.5"/>`).join('')}
      <path d="M146 94 C 160 70, 190 70, 220 40" stroke="#15161b" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M154 102 C 176 76, 214 74, 250 40" stroke="#15161b" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="100" y="84" width="60" height="60" rx="14" fill="#15161b" stroke="#4b5163"/>
      <circle class="aio-ring" cx="130" cy="114" r="20" fill="none" stroke-width="4"/>
      <circle cx="130" cy="114" r="6" fill="${brand}"/>
      <text class="part-label" x="130" y="164">${cpu.short}</text>
    </g>`;
  }
  return `<g><title>${cpu.name} + cooler box</title>
    <circle cx="130" cy="114" r="36" fill="#2a2d36" stroke="#4b5163"/>
    ${svgFan(130, 114, 30)}
    <rect x="112" y="152" width="36" height="3" rx="1" fill="${brand}"/>
    <text class="part-label" x="130" y="166">${cpu.short}</text>
  </g>`;
}

function drawRam(ram) {
  const slots = ram.sticks === 1 ? [220] : [208, 232];
  return `<g><title>${ram.name}</title>${slots.map(x => `
    <rect x="${x - 1}" y="66" width="9" height="108" rx="1" fill="#2b2f3b" stroke="#50566a"/>
    <path d="M${x + 1} 84 V170 M${x + 5} 84 V170" stroke="rgba(255,255,255,.08)"/>
    <rect x="${x}" y="120" width="7" height="22" fill="#c9ccd3"/>
    <rect class="${ram.rgb ? 'rgb' : 'ram-top'}" x="${x - 1}" y="66" width="9" height="12" rx="1"/>`).join('')}
  </g>`;
}

function drawGpu(gpu) {
  const x = 44, y = 208, w = gpu.len, h = 50;
  const fans = Array.from({ length: gpu.fans }, (_, i) => svgFan(x + w * (i + 0.5) / gpu.fans, y + 26, 17)).join('');
  const fins = gpu.fans ? '' : Array.from({ length: 9 }, (_, i) =>
    `<rect x="${62 + i * 8}" y="${y + 12}" width="3" height="28" fill="#6b7280"/>`).join('');
  return `<g><title>${gpu.name}</title>
    <rect x="${x - 6}" y="${y - 2}" width="6" height="${h + 4}" fill="#9aa0a8"/>
    <rect x="${x}" y="${y - 4}" width="${w}" height="8" rx="2" fill="#2c303b"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#1d2029" stroke="#4b5163"/>
    <rect class="${gpu.score >= 55 ? 'rgb' : ''}" x="${x}" y="${y}" width="${w}" height="4" rx="2" fill="${BRAND_COLORS[gpu.brand]}"/>
    ${fans}${fins}
    ${gpu.watts > 75 ? `<rect x="${x + w * 0.6 - 9}" y="${y + h - 3}" width="18" height="6" fill="#111"/>` : ''}
    <text class="part-label end" x="${x + w - 6}" y="274">${gpu.short}</text>
  </g>`;
}

function drawPsu(psu) {
  const g = psu.generic;
  return `<g><title>${psu.name}</title>
    <rect x="36" y="354" width="150" height="72" rx="4" fill="${g ? '#7a7f88' : '#15161b'}" stroke="#555b6b"/>
    <circle cx="96" cy="390" r="28" fill="none" stroke="${g ? '#4b4f57' : '#3a3f4d'}" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="96" cy="390" r="18" fill="none" stroke="${g ? '#4b4f57' : '#3a3f4d'}" stroke-width="2" stroke-dasharray="3 3"/>
    <rect x="132" y="366" width="46" height="18" rx="2" fill="${g ? '#e9e3c8' : '#2a2d37'}"/>
    <text class="psu-label ${g ? 'generic' : ''}" x="155" y="378">${psu.watts}W</text>
    <text class="psu-label ${g ? 'generic' : ''}" x="155" y="408">${psu.short}</text>
    ${g ? '' : '<rect x="140" y="414" width="30" height="6" rx="1" fill="#2a2d37"/>'}
  </g>`;
}

function drawStorage(st, mobo) {
  if (st.kind === 'nvme') {
    const covered = mobo && mobo.price >= 1400;
    return `<g><title>${st.name}</title>
      <rect x="72" y="265" width="92" height="12" rx="2" fill="${covered ? '#2b2e37' : '#1f5f3f'}" stroke="${covered ? '#4b5163' : '#2f8f5f'}"/>
      ${covered ? '' : '<rect x="96" y="267" width="30" height="8" fill="#15161b"/>'}
      <text class="tiny-label" x="${covered ? 118 : 148}" y="274">${covered ? 'M.2 · NVMe' : 'NVMe'}</text>
    </g>`;
  }
  const hdd = st.kind === 'hdd';
  return `<g><title>${st.name}</title>
    <rect x="${hdd ? 258 : 268}" y="${hdd ? 358 : 368}" width="${hdd ? 110 : 90}" height="${hdd ? 64 : 44}" rx="4"
      fill="${hdd ? '#a3a9b3' : '#20232c'}" stroke="#666d7c"/>
    ${hdd ? '<rect x="272" y="368" width="54" height="44" rx="3" fill="#e5e7eb"/><circle cx="348" cy="390" r="12" fill="#8b919c"/>' : ''}
    <text class="part-label ${hdd ? 'dark' : ''}" x="${hdd ? 299 : 313}" y="394">${hdd ? 'HD' : 'SSD'}</text>
  </g>`;
}

/* ---------- Gabinete completo ---------- */

function renderCase(b) {
  const { cpu, mobo, ram, gpu, storage, psu } = b.parts;
  const c = PART_BY_ID[S.caseId] || PART_BY_ID.k1;
  const out = [drawShell(c)];

  out.push(mobo ? drawMobo(mobo) : svgEmpty(40, 40, 250, 270, 'mobo', CATS.mobo, 290));

  // Cabos saindo da fonte (ficam atrás das peças e da cobertura)
  if (psu && mobo) {
    out.push('<path class="cable" d="M306 336 C 306 260, 304 200, 288 172"/>');
    if (cpu) out.push('<path class="cable thin" d="M31 336 C 31 200, 31 70, 84 50"/>');
  }

  out.push(cpu ? drawCooler(cpu) : svgEmpty(100, 84, 60, 60, 'cpu', 'CPU'));
  out.push(ram ? drawRam(ram) : svgEmpty(200, 66, 56, 108, 'ram', 'RAM'));
  if (gpu) {
    out.push(drawGpu(gpu));
    if (psu && gpu.watts > 75) {
      const cx = 44 + gpu.len * 0.6;
      out.push(`<path class="cable thin" d="M${cx} 336 C ${cx} 300, ${cx} 290, ${cx} 262"/>`);
    }
  } else {
    out.push(svgEmpty(60, 208, 180, 50, 'gpu', 'Placa de vídeo'));
  }

  out.push(`<rect class="shroud" x="22" y="330" width="376" height="108" rx="6"/>
    <text class="shroud-logo" x="210" y="344">INFOREAL</text>`);
  out.push(psu ? drawPsu(psu) : svgEmpty(36, 354, 150, 72, 'psu'));
  if (storage) out.push(drawStorage(storage, mobo));
  if (!storage || storage.kind === 'nvme') {
    out.push(storage ? '' : svgEmpty(258, 358, 110, 64, 'storage', 'Disco'));
  }

  // Reflexo do vidro lateral
  out.push('<path class="glass" d="M22 22 H180 L60 438 H22 Z"/>');

  const svg = $('#case');
  svg.innerHTML = out.join('');
  svg.classList.toggle('on', S.pcOn);
  svg.classList.toggle('case-light', c.look.theme === 'light');
  svg.classList.toggle('case-rgb', c.look.rgb);
}

/* ---------- Miniaturas da loja ---------- */

function partThumb(p) {
  const svg = (vb, body, cls = '') => `<svg class="thumb ${cls}" viewBox="${vb}" aria-hidden="true">${body}</svg>`;
  switch (p.cat) {
    case 'cpu':
      return svg('0 0 100 100', `
        <rect x="16" y="16" width="68" height="68" rx="6" fill="#1f3d2b"/>
        <rect x="26" y="26" width="48" height="48" rx="4" fill="#b8bec8"/>
        <rect x="26" y="26" width="48" height="7" rx="2" fill="${BRAND_COLORS[p.brand]}"/>
        <text class="thumb-label" x="50" y="60">${p.short}</text>`);
    case 'mobo': return svg('36 36 258 278', drawMobo(p));
    case 'ram': return svg('196 60 64 120', drawRam(p));
    case 'gpu': return svg('30 198 290 82', drawGpu(p));
    case 'storage':
      return p.kind === 'nvme' ? svg('64 250 108 40', drawStorage(p)) : svg('250 350 126 80', drawStorage(p));
    case 'psu': return svg('30 348 162 84', drawPsu(p));
    case 'case': return svg('0 0 420 460', drawShell(p, true), p.look.theme === 'light' ? 'case-light' : '');
    default: return `<div class="thumb emoji">${CAT_ICONS[p.cat]}</div>`;
  }
}

/* ---------- Capas dos jogos ---------- */

function gameCover(g, cls = '') {
  const [c1, c2] = g.colors || ['#2a2f3e', '#7c5cff'];
  return `<div class="cover ${cls}" style="--c1:${c1};--c2:${c2}" aria-hidden="true">
    <span class="cover-emoji">${g.emoji}</span>${g.emoji2 ? `<span class="cover-emoji small">${g.emoji2}</span>` : ''}
  </div>`;
}
