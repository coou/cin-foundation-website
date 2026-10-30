// Network home: live trajectory, interactive workbench map, 3-mode D3 world matrix, agent fleet pulse, scenarios, and ideas.
import { backend, mountAuth, el, svgEl, getJSON, ago, bars } from './portal.js?v=17';
import { collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

mountAuth(() => {});

// Wire interactive SVG workbench nodes
document.querySelectorAll('#net-arch-svg .svg-node[data-href]').forEach((node) => {
  const go = () => {
    const href = node.getAttribute('data-href');
    if (href) window.location.href = href;
  };
  node.addEventListener('click', go);
  node.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  });
});

// 1. Live Trajectory Reading
getJSON('/data/trajectory.json').then((t) => {
  const host = document.getElementById('traj');
  if (!host) return;
  host.textContent = '';

  const d = t.overall - t.overall_24h_ago;
  const deltaStr = (d >= 0 ? '+' : '') + d.toFixed(1);

  const kpiVal = document.getElementById('kpi-traj-val');
  const kpiSub = document.getElementById('kpi-traj-sub');
  if (kpiVal) kpiVal.textContent = Math.round(t.overall) + ' / 100';
  if (kpiSub) kpiSub.textContent = `${deltaStr} in 24h · ${t.toward || 0} toward vs ${t.away || 0} away`;

  const sigVal = document.getElementById('kpi-sig-val');
  const sigSub = document.getElementById('kpi-sig-sub');
  if (sigVal && t.signals_total) sigVal.textContent = t.signals_total.toLocaleString();
  if (sigSub && t.agreement) {
    sigSub.textContent = `${Math.round(t.agreement * 100)}% dual-agent agreement · ${(t.second_opinions || 0).toLocaleString()} audits`;
  }

  const headRow = el('div', 'card-head');
  const titleBlock = el('div');
  const scoreTitle = el('h3', 'flush', `Overall reading: ${Math.round(t.overall)} / 100 (${deltaStr} in 24h)`);
  const subMeta = el('p', 'muted flush', `50 is level · ${t.toward || 0} toward, ${t.away || 0} away · Updated ${ago(t.updated)}`);
  titleBlock.append(scoreTitle, subMeta);
  const badge = el('span', 'tag ok', `${Math.round((t.agreement || 0.86) * 100)}% Agreement`);
  headRow.append(titleBlock, badge);
  host.appendChild(headRow);

  bars(host, t.categories);

  const drawer = el('details', 'portal-drawer');
  drawer.appendChild(el('summary', null, 'Inspect architectural details ▾'));
  const foot = el('div', 'twin-subblock');
  foot.appendChild(el('p', 'muted flush', t.method));
  const more = el('a', 'btn sm twin-btn-mt', 'Inspect every verified source & 6-stage forecast →');
  more.href = 'https://collectiveintelligencenetwork.org/trajectory';
  foot.appendChild(more);
  drawer.appendChild(foot);
  host.appendChild(drawer);
}).catch(() => {
  const host = document.getElementById('traj');
  if (host) host.textContent = 'The live reading could not be loaded.';
});

// 2. Live Agent Fleet Pulse (/data/portal.json)
getJSON('/data/portal.json').then((p) => {
  const host = document.getElementById('fleet-pulse');
  if (!host) return;
  host.textContent = '';

  const totals = p.totals || {};
  const statRow = el('div', 'btn-row flush');
  statRow.append(
    el('span', 'tag ok', `${totals.runs_24h || 0} runs (24h)`),
    el('span', 'tag info', `${totals.delivered_24h || 0} delivered (24h)`),
    el('span', 'tag wip', `${totals.signals_7d || 0} signals (7d)`),
    el('span', 'tag', `${totals.deploys_7d || 0} deploys (7d)`)
  );
  host.appendChild(statRow);

  const missions = Array.isArray(p.missions) ? p.missions.filter((m) => (Number(m.done) || 0) > 0).slice(0, 4) : [];
  if (missions.length) {
    const mList = el('div', 'bars');
    missions.forEach((m) => {
      const done = Number(m.done) || 0;
      const open = Number(m.open) || 0;
      const total = Math.max(1, done + open);
      const wUnits = Math.max(6, Math.round((done / total) * 200));

      const row = el('div', 'bar');
      const svg = svgEl('svg', { viewBox: '0 0 200 10', class: 'svg-bar', 'aria-hidden': 'true' });
      svg.appendChild(svgEl('rect', { x: 0, y: 0, width: 200, height: 10, rx: 5, fill: '#1a1e28' }));
      svg.appendChild(svgEl('rect', { x: 0, y: 0, width: wUnits, height: 10, rx: 5, fill: '#6aa8e0' }));

      row.append(
        el('span', null, m.title),
        svg,
        el('b', 'muted', `${done}/${total}`)
      );
      mList.appendChild(row);
    });
    host.appendChild(mList);
  }

  const recent = Array.isArray(p.recent) ? p.recent.slice(0, 4) : [];
  if (recent.length) {
    const drawer = el('details', 'portal-drawer');
    drawer.appendChild(el('summary', null, 'Inspect architectural details ▾'));
    const ul = el('ul', 'plain');
    recent.forEach((item) => {
      const li = el('li');
      li.append(
        el('span', 'tag ok', item.team || 'Agent stream'),
        el('b', null, item.title || 'Completed work'),
        el('span', 'muted', ago(item.at))
      );
      ul.appendChild(li);
    });
    drawer.appendChild(ul);
    host.appendChild(drawer);
  }
}).catch(() => {
  const host = document.getElementById('fleet-pulse');
  if (host) host.textContent = 'Agent mission telemetry could not be loaded.';
});

// 3. Featured Scenarios (/data/scenarios.json)
getJSON('/data/scenarios.json').then((d) => {
  const list = d && Array.isArray(d.scenarios) ? d.scenarios : [];
  const kpiScen = document.getElementById('kpi-scen-val');
  const lpBadge = document.getElementById('lp-scen-badge');
  if (kpiScen && list.length) kpiScen.textContent = String(list.length);
  if (lpBadge && list.length) lpBadge.textContent = `${list.length} Scenarios`;

  const host = document.getElementById('featured-futures');
  if (!host) return;
  host.textContent = '';

  if (!list.length) {
    host.appendChild(el('p', 'muted flush', 'No scenarios loaded yet.'));
    return;
  }

  const ul = el('ul', 'plain');
  list.slice(0, 3).forEach((sc) => {
    const li = el('li');
    const block = el('div', 'idea');
    const meta = el('div', 'meta');
    meta.append(
      el('span', 'tag info', `${sc.horizon_years || 2}y horizon`),
      el('span', 'muted', ago(sc.added_at))
    );
    const titleLink = el('a', null, sc.title);
    titleLink.href = '/futures';
    const h3 = el('h3', 'flush');
    h3.appendChild(titleLink);
    block.append(meta, h3);

    const drawer = el('details', 'portal-drawer');
    drawer.appendChild(el('summary', null, 'Inspect architectural details ▾'));
    const premise = el('p', 'muted flush', (sc.premise || '').slice(0, 170) + ((sc.premise || '').length > 170 ? '…' : ''));
    drawer.appendChild(premise);

    const firstOut = Array.isArray(sc.outcomes) && sc.outcomes[0] ? sc.outcomes[0] : null;
    if (firstOut) {
      const nowPct = Math.round(Math.max(0, Math.min(1, Number(firstOut.likelihood_now) || 0)) * 100);
      const cinPct = Math.round(Math.max(0, Math.min(1, Number(firstOut.likelihood_with_cin) || 0)) * 100);
      const outRow = el('div', 'meta');
      outRow.append(
        el('span', 'tag ' + (firstOut.desirable ? 'ok' : 'no'), firstOut.desirable ? 'Desirable outcome' : 'Risk outcome'),
        el('span', 'muted', `${firstOut.name}: ${nowPct}% today → ${cinPct}% with CIN`)
      );
      drawer.appendChild(outRow);
    }
    block.appendChild(drawer);

    li.appendChild(block);
    ul.appendChild(li);
  });
  host.appendChild(ul);
}).catch(() => {});

// 4. Recognition count badge
getJSON('/data/recognition.json').then((d) => {
  const list = d && Array.isArray(d.recognition) ? d.recognition : [];
  const badge = document.getElementById('lp-rec-badge');
  if (badge && list.length) badge.textContent = `${list.length} Credited`;
}).catch(() => {});

// 5. Latest Community Ideas (with fallback to /data/updates.json when Firestore is offline/local)
function renderUpdatesFallback(host) {
  getJSON('/data/updates.json').then((u) => {
    const items = u && Array.isArray(u.updates) ? u.updates.slice(0, 4) : [];
    host.textContent = '';
    const ul = el('ul', 'plain');
    items.forEach((it) => {
      const li = el('li');
      const block = el('div', 'idea');
      const meta = el('div', 'meta');
      meta.append(
        el('span', 'tag ok', it.kind || 'shipped'),
        el('span', 'muted', (it.at || '').slice(0, 10))
      );
      const h3 = el('h3', 'flush', it.title);
      const drawer = el('details', 'portal-drawer');
      drawer.appendChild(el('summary', null, 'Inspect architectural details ▾'));
      drawer.appendChild(el('p', 'muted flush', (it.summary || '').slice(0, 165) + ((it.summary || '').length > 165 ? '…' : '')));
      block.append(meta, h3, drawer);
      li.appendChild(block);
      ul.appendChild(li);
    });
    host.appendChild(ul);
  }).catch(() => {
    host.textContent = 'Visit /ideas to propose and vote on network priorities.';
  });
}

backend().then(async (b) => {
  const host = document.getElementById('latest');
  if (!host) return;
  if (!b) {
    renderUpdatesFallback(host);
    return;
  }
  const status = await getJSON('/data/idea-status.json').catch(() => ({}));
  try {
    const snap = await getDocs(query(collection(b.db, 'ideas'), orderBy('createdAt', 'desc'), limit(8)));
    const visible = snap.docs.filter((d) => (status[d.id] || {}).status !== 'hidden').slice(0, 5);
    if (!visible.length) {
      renderUpdatesFallback(host);
      return;
    }
    host.textContent = '';
    const ul = el('ul', 'plain');
    visible.forEach((d) => {
      const data = d.data();
      const li = el('li');
      const a = el('a', null, data.title);
      a.href = '/ideas';
      li.append(el('span', 'tag', data.category || 'idea'), a);
      ul.appendChild(li);
    });
    host.appendChild(ul);
  } catch (e) {
    renderUpdatesFallback(host);
  }
});


// =========================================================================
// 6. Interactive 7-Lens World Standing vs. CIN Co-Intelligence Studio (#portal-world-matrix)
//    with 3-Mode D3.js v7 Visual Switcher (#pwm-viz-modes):
//      Mode 1: Architecture & Value Split (data-pwm-mode="arch")
//      Mode 2: D3 6-Axis Structural Radar (data-pwm-mode="radar" -> #pwm-d3-radar-svg)
//      Mode 3: D3 Co-Intelligence Flow & Bandwidth Sim (data-pwm-mode="flow" -> #pwm-d3-flow-svg)
// =========================================================================
let currentPwmKey = 'labs';
let currentPwmMode = 'arch';

const PWM_RADAR_AXES = [
  '1. Human Sovereignty',
  '2. Creator Royalties (95% Shapley)',
  '3. Swarm Containment',
  '4. Local Privacy (0-Egress)',
  '5. Compute Access',
  '6. Uncopyable Moat (96%)'
];

const PWM_DATA = {
  labs: {
    k: 'Lens 01 of 07 · Incentive & Reward Architecture',
    title: 'SOTA Model AI Labs vs. CIN Decentralized Co-Intelligence',
    badge: 'Data Shapley + PCC',
    radar: {
      cloud: [14, 4, 18, 10, 28, 12],
      open:  [62, 6, 32, 74, 58, 22],
      cin:   [96, 95, 94, 99, 92, 96]
    },
    flow: {
      cloudRent: 72,
      cloudToll: 28,
      cloudCreator: 0,
      solverShare: 85,
      lineageShare: 10,
      commonsShare: 5,
      moatPct: 96,
      airlockNote: 'Proof-Carrying Code + 95% Shapley Royalties'
    },
    sim: {
      lbl: 'Interactive Stress-Test: Annual Creator / Solver Output Value',
      min: 20, max: 500, step: 10, val: 100,
      badK: 'Status Quo (SOTA Cloud Labs)',
      okK: 'With CIN Co-Intelligence Ledger',
      fmt: (v) => `$${v},000 / yr`,
      calc: (v) => ({
        badV: `$0 Royalties · -$${Math.round(v * 0.28)},000 Cloud API Rent`,
        okV: `+$${Math.round(v * 0.85)}k Direct · +$${Math.round(v * 0.10)}k Lineage · +$${Math.round(v * 0.05)}k Commons`
      })
    },
    bars: [
      ['Creator & Worker Value Share', '12% vs. 95%', 12, 95],
      ['Human / AI Boundary Isolation', '15% vs. 98%', 15, 98],
      ['Philanthropic Recirculation', '18% vs. 92%', 18, 92]
    ],
    stand: 'Frontier labs scrape public craft for $0 and rent cloud tokens back to maximize shareholder equity.',
    gap: 'Competitive cloud AI replaces human workers and floods human communities with persuasive bot swarms.',
    cin: 'Local LoRA training, Two-Internet isolation, and Data Shapley royalties reward human cooperation.'
  },
  safety: {
    k: 'Lens 02 of 07 · Co-Intelligence vs. Competitive Extinction',
    title: 'AI Safety Spectrum: Humanity’s Last Resort Before a Hard Pause',
    badge: 'Execution Lease',
    radar: {
      cloud: [12, 8, 16, 14, 24, 10],
      open:  [54, 10, 14, 72, 60, 20],
      cin:   [98, 94, 98, 99, 91, 96]
    },
    flow: {
      cloudRent: 68,
      cloudToll: 32,
      cloudCreator: 0,
      solverShare: 85,
      lineageShare: 10,
      commonsShare: 5,
      moatPct: 97,
      airlockNote: 'Two-Internet OCap Airlock + 24h Mortal Lease'
    },
    sim: {
      lbl: 'Interactive Stress-Test: Frontier AI Horizon Doublings (METR T50)',
      min: 1, max: 10, step: 1, val: 5,
      badK: 'Unshielded Biology (~40 bits/s on Shared Web)',
      okK: 'CIN Airlock + 1-to-1 Execution Lease',
      fmt: (v) => `${Math.pow(2, v)}x Capability (${(v * 4.5).toFixed(1)} mos)`,
      calc: (v) => ({
        badV: `${Math.max(2, 48 - v * 5)}% Human Agency Retained (Swarm Outpaced)`,
        okV: '97% Agency Retained (Airlock + Φ(R) Quorum Gate)'
      })
    },
    bars: [
      ['Co-Existence Without Global Treaty Lock', '22% vs. 94%', 22, 94],
      ['Biological Human Agency Protection', '14% vs. 97%', 14, 97],
      ['1-to-1 Human Control (0 Bot Swarms)', '10% vs. 100%', 10, 100]
    ],
    stand: 'Eval labs (METR, Redwood, AISI) provide vital diagnostics while pause advocates seek global treaties.',
    gap: 'Biological humans (~40 bits/s, millennial evolution) lose in direct competitive intelligence against ASI swarms.',
    cin: 'CIN builds the last viable barrier before a Hard Pause: Two Internets, execution leases, and 1:1 human control.'
  },
  gov: {
    k: 'Lens 03 of 07 · Public Governance & Post-Labor Stability',
    title: 'Government Institutions vs. Real-Time Cryptographic Civic Locks',
    badge: 'NIST AIMS Tenet 7',
    radar: {
      cloud: [18, 10, 20, 15, 22, 14],
      open:  [58, 12, 28, 68, 56, 24],
      cin:   [95, 92, 96, 98, 90, 95]
    },
    flow: {
      cloudRent: 70,
      cloudToll: 30,
      cloudCreator: 0,
      solverShare: 85,
      lineageShare: 10,
      commonsShare: 5,
      moatPct: 95,
      airlockNote: '<10 ms Silicon Quorum Gate + $25k Floor + 2%/mo Demurrage'
    },
    sim: {
      lbl: 'Interactive Stress-Test: Share of Routine White-Collar Tasks Automated',
      min: 15, max: 85, step: 5, val: 45,
      badK: 'Legacy Payroll-Tax Dependent Government',
      okK: 'CIN 5D Demurrage + <10 ms Silicon Gates',
      fmt: (v) => `${v}% Task Automation`,
      calc: (v) => ({
        badV: `-${Math.round(v * 0.72)}% Payroll Tax Base · 3–5 Yr Statutory Lag`,
        okV: '100% Municipal Floor Funded · <10 ms Runtime Lock'
      })
    },
    bars: [
      ['Response Speed vs. 4.5-Mo Doubling', '14% vs. 96%', 14, 96],
      ['Post-Labor Fiscal Stability', '19% vs. 91%', 19, 91],
      ['Resistance to Lobby Capture', '21% vs. 95%', 21, 95]
    ],
    stand: 'Legislatures take 24–60 months to pass statutes while automation erodes the human payroll tax base.',
    gap: 'Regulatory capture favors $1T cloud monopolies while agencies lack real-time runtime verification.',
    cin: '<10 ms hardware quorum gates (Φ(R)), Tiers 0–4 ZK auditability, and 5D demurrage stabilize public economies.'
  },
  research: {
    k: 'Lens 04 of 07 · Universities & Independent Research',
    title: 'Public Research: From Compute Starvation to Perpetual Shapley Endowments',
    badge: 'SPRA 95.3% + 15% Lineage',
    radar: {
      cloud: [16, 2, 22, 18, 12, 15],
      open:  [66, 8, 38, 76, 48, 28],
      cin:   [95, 96, 93, 98, 95, 96]
    },
    flow: {
      cloudRent: 74,
      cloudToll: 26,
      cloudCreator: 0,
      solverShare: 80,
      lineageShare: 15,
      commonsShare: 5,
      moatPct: 96,
      airlockNote: 'SPRA 95.3% Token Cut + 15% Perpetual Lab Lineage'
    },
    sim: {
      lbl: 'Interactive Stress-Test: Downstream Agent Tasks Citing a University Paper',
      min: 10, max: 500, step: 10, val: 120,
      badK: 'Legacy arXiv + Cloud Scraping Model',
      okK: 'CIN Beyond-arXiv 15% Lineage Endowment',
      fmt: (v) => `${v},000 Verified Tasks / yr`,
      calc: (v) => ({
        badV: '$0 Downstream Royalties · Begging for GPU Grants',
        okV: `+$${Math.round(v * 3.6)},000/yr Lab Endowment + 95.3% SPRA Savings`
      })
    },
    bars: [
      ['Downstream Royalty Return to Labs', '2% vs. 92%', 2, 92],
      ['Context Efficiency (SPRA 95.3%)', '18% vs. 95%', 18, 95],
      ['Independence from Big-Tech Grants', '15% vs. 94%', 15, 94]
    ],
    stand: 'Universities invent 88% of core AI architectures on public grants, but closed labs capture 100% of revenue.',
    gap: 'Public labs face 1,000:1 GPU starvation, faculty drain, and grant competition against frontier models.',
    cin: 'Beyond-arXiv Proof-Carrying Blueprints, SPRA compilation, and 15% upstream Data Shapley royalties fund public science.'
  },
  enterprise: {
    k: 'Lens 05 of 07 · Private Enterprise, Clinics & SMBs',
    title: 'Private Enterprise: Cloud API Tenant vs. Cryptographic PSI Coalition',
    badge: 'Freedman (2004) PSI',
    radar: {
      cloud: [16, 12, 24, 14, 30, 16],
      open:  [64, 18, 42, 78, 62, 34],
      cin:   [97, 94, 95, 100, 93, 96]
    },
    flow: {
      cloudRent: 66,
      cloudToll: 34,
      cloudCreator: 0,
      solverShare: 85,
      lineageShare: 10,
      commonsShare: 5,
      moatPct: 96,
      airlockNote: 'Local Wasm OCap + 500-Firm Blinded PSI Co-Op'
    },
    sim: {
      lbl: 'Interactive Stress-Test: Independent Clinics / SMBs in PSI Coalition',
      min: 20, max: 500, step: 20, val: 200,
      badK: 'Fragmented Cloud API & GPO Renter',
      okK: 'CIN Local OCap + PSI Buyer Coalition',
      fmt: (v) => `${v} Independent Firms`,
      calc: (v) => ({
        badV: '-28% Middleman/GPO Toll · Workflows Leaked to Cloud',
        okV: `+${Math.min(36, Math.round(16 + Math.log10(v) * 7.5))}% Wholesale Savings · 0 Bytes IP Leak`
      })
    },
    bars: [
      ['Trade-Secret & Data Sovereignty', '16% vs. 100%', 16, 100],
      ['Wholesale Margin Retained (0% Toll)', '60% vs. 98%', 60, 98],
      ['Protection vs. Vertical Oligopoly', '18% vs. 95%', 18, 95]
    ],
    stand: 'Businesses rent conglomerate AI wrappers while paying 15%–40% tolls to GPOs, clearinghouses, and SaaS brokers.',
    gap: 'Streaming proprietary workflows into cloud APIs trains the conglomerate to vertically disintermediate you.',
    cin: 'On-premise Wasm OCap sandboxes + Private Set Intersection (PSI) buyer coalitions beat oligopoly unit economics.'
  },
  humanity: {
    k: 'Lens 06 of 07 · Global Adoption & The Unprepared Non-Digital Majority',
    title: 'The Intelligence Gambit: Shielding 60%+ Non-Digital Labor & Resource Trade',
    badge: '$8 Liveness + 5D Value',
    radar: {
      cloud: [11, 6, 15, 12, 16, 12],
      open:  [48, 10, 26, 64, 42, 22],
      cin:   [95, 95, 93, 98, 94, 96]
    },
    flow: {
      cloudRent: 64,
      cloudToll: 36,
      cloudCreator: 0,
      solverShare: 85,
      lineageShare: 10,
      commonsShare: 5,
      moatPct: 95,
      airlockNote: '$8 Pre-ADC Liveness + Offline Voice Twin + PSI Co-Op'
    },
    sim: {
      lbl: 'Interactive Stress-Test: Regional Producer PSI Co-Op Adoption',
      min: 10, max: 95, step: 5, val: 65,
      badK: 'Unshielded Producers vs. AI Buyer Cartels',
      okK: 'CIN $8 Liveness + Voice Twin + PSI Co-Op',
      fmt: (v) => `${v}% Producer Coalition Coverage`,
      calc: (v) => ({
        badV: '-38% Commodity & Labor Price Dump by AI Cartels',
        okV: `+${Math.round(12 + v * 0.4)}% Producer Income Retained + 5D Care/Craft Credit`
      })
    },
    bars: [
      ['Zero-Prompt Voice & Sensor Access', '15% vs. 95%', 15, 95],
      ['Fair Valuation of Physical Craft (5D)', '11% vs. 93%', 11, 93],
      ['Protection of Producer Trade Terms', '14% vs. 91%', 14, 91]
    ],
    stand: '60%+ of global labor trades physical work, farming, and raw resources in an already unequal global market.',
    gap: 'Automated buyer cartels use frontier AI as an unleveraged gambit to depress physical commodity and labor prices.',
    cin: '$8 Pre-ADC liveness sensors, offline voice twins, PSI producer co-ops, and 5D value accounting restore trade parity.'
  },
  pair: {
    k: 'Lens 07 of 07 · Unit Economics & The Only Uncopyable AI Moat',
    title: 'Economy of “Pair Intelligence”: Why Centralized AI Labs Bleed Billions',
    badge: '1-to-1 Pair Moat',
    radar: {
      cloud: [10, 5, 16, 8, 26, 8],
      open:  [68, 12, 36, 82, 70, 26],
      cin:   [99, 95, 97, 100, 96, 96]
    },
    flow: {
      cloudRent: 72,
      cloudToll: 28,
      cloudCreator: 0,
      solverShare: 85,
      lineageShare: 10,
      commonsShare: 5,
      moatPct: 96,
      airlockNote: '4% Open Base + 30% Local LoRA + 32% Memory + 34% Craft'
    },
    sim: {
      lbl: 'Interactive Stress-Test: Years of 1-to-1 Human + Local Twin Co-Adaptation',
      min: 1, max: 10, step: 1, val: 5,
      badK: 'Centralized Cloud AI Moat (90-Day Distillation)',
      okK: 'Your 1-to-1 Pair Intelligence Moat',
      fmt: (v) => `${v} ${v === 1 ? 'Year' : 'Years'} Co-Adapted`,
      calc: (v) => ({
        badV: '8% Pricing Power · -$5B to -$15B/yr Cloud Burn',
        okV: `${Math.min(99, Math.round(74 + v * 4.4))}% Uncopyable Moat · $0 Cloud Burn`
      })
    },
    bars: [
      ['Defensible Moat vs. Open Weights', '15% vs. 97%', 15, 97],
      ['Unit Economics ($0 Local vs. -$10B)', '18% vs. 96%', 18, 96],
      ['User Ownership of 10-Yr Memory', '8% vs. 100%', 8, 100]
    ],
    stand: 'Centralized AI companies lose $5B–$15B/yr because $100B closed training runs are distilled into open weights in 90 days.',
    gap: 'Raw cloud token inference commoditizes toward $0 electricity cost—leaving closed API labs with zero durable moat.',
    cin: 'The only uncopyable moat is Pair Intelligence: your lived physical craft + 10-year private memory + local LoRA twin.'
  }
};

const pwmTabs = document.getElementById('pwm-tabs');
const pwmVizModes = document.getElementById('pwm-viz-modes');
const pwmRng = document.getElementById('pwm-sim-rng');

const PWM_SHORT = {
  labs: ['Scrapes public craft ($0); rents back via cloud APIs.', 'Equity valuation demands labor replacement & lock-in.', 'Local LoRA + 95% Shapley royalty + 5% commons floor.'],
  safety: ['Voluntary lab pledges fail under race pressure.', '40 bits/s human biology loses to 10¹² bits/s swarms.', 'Two-Internet Airlock + Mortal Lease = last resort before Pause.'],
  gov: ['Statutes lag 3–5 yrs behind 4.5-mo AI doublings.', 'Payroll tax erosion starves cities & public budgets.', '<10ms silicon quorum gates + $25k floor + 2%/mo demurrage.'],
  research: ['Universities originate 88% of breakthroughs for $0 royalty.', 'Cloud hyperscalers price academia out of $100M+ clusters.', '15% perpetual Data Shapley royalty + SPRA (95.3% token cut).'],
  enterprise: ['Firms pay 15%–40% tolls to GPOs & cloud API wrappers.', 'Cloud prompts train conglomerates to disintermediate you.', 'Local Wasm OCap + 500-firm PSI co-op (+34% margin).'],
  humanity: ['4.8B+ physical workers face AI commodity buyer cartels.', 'Algorithmic cartels depress producer prices by 30%–50%.', '$8 Pre-ADC sensor + offline voice twin + PSI co-op (+38% pay).'],
  pair: ['Closed cloud AI bleeds $5B–$15B/yr (distilled in 75 days).', 'Raw cloud token inference commoditizes toward $0 margin.', '1-to-1 Craft + 10-Yr Private Memory + Local LoRA = 96% moat.']
};

function selectD3Root(svgNode) {
  if (!svgNode) return null;
  while (svgNode.firstChild) {
    svgNode.removeChild(svgNode.firstChild);
  }
  if (window.d3 && typeof window.d3.select === 'function') {
    return window.d3.select(svgNode);
  }
  return null;
}

// Mode 1 overlay: live D3 stress-test split gauge (#pwm-d3-live-overlay)
function renderPwmD3Overlay(d, val, res) {
  if (!window.d3) return;
  const activeSvg = document.querySelector(`#pwm-svg-box [data-pwm-svg="${currentPwmKey}"]`);
  if (!activeSvg) return;
  const d3 = window.d3;
  d3.selectAll('#pwm-d3-live-overlay, g.pwm-d3-live-gauge').remove();

  const svg = d3.select(activeSvg);
  svg.attr('viewBox', '0 0 760 382').attr('data-rich-viz', 'true');

  const span = Math.max(1, d.sim.max - d.sim.min);
  const ratio = Math.max(0.08, Math.min(0.92, (val - d.sim.min) / span));
  const g = svg.append('g')
    .attr('id', 'pwm-d3-live-overlay')
    .attr('class', 'pwm-d3-live-gauge')
    .attr('transform', 'translate(12, 336)');

  g.append('rect')
    .attr('x', 0).attr('y', 0).attr('width', 736).attr('height', 38).attr('rx', 8)
    .attr('fill', '#11151c').attr('stroke', '#4fb3a8').attr('stroke-width', 1.4);

  const barX = 178, barW = 542;
  const okW = Math.round(barW * (0.35 + ratio * 0.55));
  const badW = barW - okW;

  g.append('text')
    .attr('x', 12).attr('y', 16).attr('font-size', '9').attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
    .text('D3 LIVE STRESS-TEST');
  g.append('text')
    .attr('x', 12).attr('y', 30).attr('font-size', '9.5').attr('font-weight', '700').attr('fill', '#e9e6de')
    .text(d.sim.fmt(val));

  g.append('rect')
    .attr('x', barX).attr('y', 8).attr('width', badW).attr('height', 22).attr('rx', 4)
    .attr('fill', 'rgba(239,106,82,0.28)').attr('stroke', '#ef6a52').attr('stroke-width', 1.1);

  g.append('rect')
    .attr('x', barX + badW).attr('y', 8).attr('width', okW).attr('height', 22).attr('rx', 4)
    .attr('fill', 'rgba(79,179,168,0.32)').attr('stroke', '#4fb3a8').attr('stroke-width', 1.3);

  g.append('circle')
    .attr('cx', barX + badW).attr('cy', 19).attr('r', 6)
    .attr('fill', '#e5a93c').attr('stroke', '#11151c').attr('stroke-width', 2);

  g.append('text')
    .attr('x', barX + 8).attr('y', 23).attr('font-size', '9').attr('font-weight', '700').attr('fill', '#ef6a52')
    .text(res.badV.slice(0, 34));

  g.append('text')
    .attr('x', barX + barW - 8).attr('y', 23).attr('text-anchor', 'end').attr('font-size', '9').attr('font-weight', '700').attr('fill', '#4fb3a8')
    .text(res.okV.slice(0, 42));
}

// Mode 2: Dedicated D3 6-Axis Structural Radar + 6-Row Metric Table (#pwm-d3-radar-svg)
function renderPwmD3Radar(d, val, res) {
  const radarEl = document.getElementById('pwm-d3-radar-svg');
  const root = selectD3Root(radarEl);
  if (!root) return;

  const span = Math.max(1, d.sim.max - d.sim.min);
  const delta = (val - d.sim.val) / span;
  const rData = d.radar || PWM_DATA.labs.radar;

  const cloudScores = rData.cloud.map((v) => Math.max(2, Math.min(45, Math.round(v - delta * 8))));
  const openScores  = rData.open.map((v) => Math.max(6, Math.min(85, Math.round(v + delta * 4))));
  const cinScores   = rData.cin.map((v) => Math.max(82, Math.min(100, Math.round(v + delta * 5))));

  root.append('rect')
    .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 360).attr('rx', 12)
    .attr('fill', '#0d0f13');

  // Left Panel: 6-Axis Radar Polygon Chart
  root.append('rect')
    .attr('x', 12).attr('y', 12).attr('width', 384).attr('height', 336).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#282f3d').attr('stroke-width', 1.4);

  root.append('text')
    .attr('x', 26).attr('y', 32).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '9.5').attr('font-weight', '700')
    .text(`D3 6-AXIS STRUCTURAL RADAR · ${currentPwmKey.toUpperCase()} LENS`);

  root.append('text')
    .attr('x', 26).attr('y', 47).attr('fill', '#c5c2b9').attr('font-family', 'monospace').attr('font-size', '8.2')
    .text(`Stress-Test Input: ${d.sim.fmt(val)}`);

  const cx = 204, cy = 190, maxR = 96;
  const rings = [0.25, 0.5, 0.75, 1.0];

  rings.forEach((rk) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const rx = Math.round(cx + Math.cos(ang) * maxR * rk);
      const ry = Math.round(cy + Math.sin(ang) * maxR * rk);
      pts.push(`${rx},${ry}`);
    }
    root.append('polygon')
      .attr('points', pts.join(' '))
      .attr('fill', 'none').attr('stroke', '#242b3a').attr('stroke-width', 1);
  });

  const shortAxisLabels = [
    '1. Human Sovereignty',
    '2. Royalties (95%)',
    '3. Swarm Containment',
    '4. Local Privacy (0B)',
    '5. Compute Access',
    '6. Pair Moat (96%)'
  ];

  const cloudPts = [];
  const openPts = [];
  const cinPts = [];

  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const axX = Math.round(cx + Math.cos(ang) * maxR);
    const axY = Math.round(cy + Math.sin(ang) * maxR);
    root.append('line')
      .attr('x1', cx).attr('y1', cy).attr('x2', axX).attr('y2', axY)
      .attr('stroke', '#283042').attr('stroke-width', 1);

    const lblR = maxR + 20;
    const lx = Math.round(cx + Math.cos(ang) * lblR);
    const ly = Math.round(cy + Math.sin(ang) * (maxR + 14));
    root.append('text')
      .attr('x', lx).attr('y', ly + 3)
      .attr('text-anchor', 'middle').attr('fill', '#e9e6de').attr('font-family', 'monospace').attr('font-size', '7.8').attr('font-weight', '700')
      .text(shortAxisLabels[i]);

    const cR = (cloudScores[i] / 100) * maxR;
    const oR = (openScores[i] / 100) * maxR;
    const nR = (cinScores[i] / 100) * maxR;
    cloudPts.push(`${Math.round(cx + Math.cos(ang) * cR)},${Math.round(cy + Math.sin(ang) * cR)}`);
    openPts.push(`${Math.round(cx + Math.cos(ang) * oR)},${Math.round(cy + Math.sin(ang) * oR)}`);
    cinPts.push(`${Math.round(cx + Math.cos(ang) * nR)},${Math.round(cy + Math.sin(ang) * nR)}`);
  }

  // Polygon 1: Status Quo Cloud/Institutions (Red)
  root.append('polygon')
    .attr('points', cloudPts.join(' '))
    .attr('fill', 'rgba(239,106,82,0.20)').attr('stroke', '#ef6a52').attr('stroke-width', 1.8);

  // Polygon 2: Raw Open Weights (Amber)
  root.append('polygon')
    .attr('points', openPts.join(' '))
    .attr('fill', 'rgba(227,179,65,0.15)').attr('stroke', '#e3b341').attr('stroke-width', 1.8).attr('stroke-dasharray', '4 2');

  // Polygon 3: CIN Co-Intelligence (Teal)
  root.append('polygon')
    .attr('points', cinPts.join(' '))
    .attr('fill', 'rgba(79,179,168,0.26)').attr('stroke', '#4fb3a8').attr('stroke-width', 2.6);

  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const nR = (cinScores[i] / 100) * maxR;
    root.append('circle')
      .attr('cx', Math.round(cx + Math.cos(ang) * nR))
      .attr('cy', Math.round(cy + Math.sin(ang) * nR))
      .attr('r', 3.8).attr('fill', '#4fb3a8').attr('stroke', '#0d0f13').attr('stroke-width', 1.2);
  }

  // Legend at bottom of Left Panel
  root.append('rect')
    .attr('x', 24).attr('y', 316).attr('width', 360).attr('height', 22).attr('rx', 5)
    .attr('fill', '#0e1218').attr('stroke', '#222836');
  root.append('text')
    .attr('x', 34).attr('y', 330).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '7.6').attr('font-weight', '700')
    .text('● Status Quo Cloud (Red)');
  root.append('text')
    .attr('x', 162).attr('y', 330).attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '7.6').attr('font-weight', '700')
    .text('▲ Raw Open Weights (Amber)');
  root.append('text')
    .attr('x', 292).attr('y', 330).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '7.6').attr('font-weight', '700')
    .text('◆ CIN (Teal)');

  // Right Panel: Live 6-Row Metric Table
  root.append('rect')
    .attr('x', 406).attr('y', 12).attr('width', 342).attr('height', 336).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);

  root.append('text')
    .attr('x', 420).attr('y', 32).attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '9.2').attr('font-weight', '700')
    .text('6-ROW STRUCTURAL METRIC TABLE');

  root.append('text')
    .attr('x', 420).attr('y', 48).attr('fill', '#8c8a82').attr('font-family', 'monospace').attr('font-size', '7.8').attr('font-weight', '700')
    .text('AXIS DIMENSION');
  root.append('text')
    .attr('x', 628).attr('y', 48).attr('text-anchor', 'end').attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '7.8').attr('font-weight', '700')
    .text('CLOUD');
  root.append('text')
    .attr('x', 678).attr('y', 48).attr('text-anchor', 'end').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '7.8').attr('font-weight', '700')
    .text('OPEN');
  root.append('text')
    .attr('x', 732).attr('y', 48).attr('text-anchor', 'end').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '7.8').attr('font-weight', '700')
    .text('CIN');

  for (let r = 0; r < 6; r++) {
    const ry = 56 + r * 41;
    root.append('rect')
      .attr('x', 418).attr('y', ry).attr('width', 318).attr('height', 36).attr('rx', 6)
      .attr('fill', '#171c27').attr('stroke', '#252c3b');

    root.append('text')
      .attr('x', 426).attr('y', ry + 15).attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '8.6').attr('font-weight', '700')
      .text(PWM_RADAR_AXES[r]);

    root.append('text')
      .attr('x', 628).attr('y', ry + 15).attr('text-anchor', 'end').attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
      .text(`${cloudScores[r]}%`);
    root.append('text')
      .attr('x', 678).attr('y', ry + 15).attr('text-anchor', 'end').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
      .text(`${openScores[r]}%`);
    root.append('text')
      .attr('x', 730).attr('y', ry + 15).attr('text-anchor', 'end').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
      .text(`${cinScores[r]}%`);

    // Mini 3-segment progress comparison bar
    root.append('rect')
      .attr('x', 426).attr('y', ry + 23).attr('width', 302).attr('height', 6).attr('rx', 3)
      .attr('fill', '#0d1017');
    root.append('rect')
      .attr('x', 426).attr('y', ry + 23).attr('width', Math.round(3.02 * cinScores[r])).attr('height', 6).attr('rx', 3)
      .attr('fill', '#4fb3a8').attr('opacity', '0.45');
    root.append('rect')
      .attr('x', 426).attr('y', ry + 23).attr('width', Math.round(3.02 * openScores[r])).attr('height', 6).attr('rx', 3)
      .attr('fill', '#e3b341').attr('opacity', '0.7');
    root.append('rect')
      .attr('x', 426).attr('y', ry + 23).attr('width', Math.round(3.02 * cloudScores[r])).attr('height', 6).attr('rx', 3)
      .attr('fill', '#ef6a52');
  }

  root.append('rect')
    .attr('x', 418).attr('y', 306).attr('width', 318).attr('height', 32).attr('rx', 6)
    .attr('fill', '#142623').attr('stroke', '#4fb3a8');
  root.append('text')
    .attr('x', 577).attr('y', 325).attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
    .text(res.okV.slice(0, 48));
}

// Mode 3: Dedicated D3 Co-Intelligence Flow & Bandwidth Sim (#pwm-d3-flow-svg)
function renderPwmD3Flow(d, val, res) {
  const flowEl = document.getElementById('pwm-d3-flow-svg');
  const root = selectD3Root(flowEl);
  if (!root) return;

  const span = Math.max(1, d.sim.max - d.sim.min);
  const ratio = Math.max(0.08, Math.min(0.95, (val - d.sim.min) / span));
  const fData = d.flow || PWM_DATA.labs.flow;

  root.append('rect')
    .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 360).attr('rx', 12)
    .attr('fill', '#0d0f13');

  // Left Half: $100 Value & Incentive Flow
  root.append('rect')
    .attr('x', 12).attr('y', 12).attr('width', 362).attr('height', 336).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#282f3d').attr('stroke-width', 1.4);

  root.append('text')
    .attr('x', 26).attr('y', 32).attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '9.2').attr('font-weight', '700')
    .text(`1. $100 VALUE & INCENTIVE FLOW (${currentPwmKey.toUpperCase()})`);

  // Top sub-card: Status Quo Extraction
  root.append('rect')
    .attr('x', 24).attr('y', 44).attr('width', 338).attr('height', 126).attr('rx', 8)
    .attr('fill', 'rgba(239,106,82,0.08)').attr('stroke', '#ef6a52').attr('stroke-width', 1.3);

  root.append('text')
    .attr('x', 36).attr('y', 62).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8.6').attr('font-weight', '700')
    .text('STATUS QUO EXTRACTION ($100 GROSS VALUE)');

  const rentShare = Math.min(82, Math.round(fData.cloudRent + ratio * 6));
  const tollShare = 100 - rentShare;
  const rentW = Math.round(3.14 * rentShare);
  const tollW = 314 - rentW;

  root.append('rect')
    .attr('x', 36).attr('y', 74).attr('width', rentW).attr('height', 22).attr('rx', 4)
    .attr('fill', '#ef6a52');
  root.append('text')
    .attr('x', 44).attr('y', 89).attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
    .text(`$${rentShare} Cloud / Institutional Capture`);

  root.append('rect')
    .attr('x', 36 + rentW).attr('y', 74).attr('width', tollW).attr('height', 22).attr('rx', 4)
    .attr('fill', '#9e3929');
  root.append('text')
    .attr('x', 36 + rentW + Math.round(tollW / 2)).attr('y', 89).attr('text-anchor', 'middle').attr('fill', '#ffffff').attr('font-family', 'monospace').attr('font-size', '7.8').attr('font-weight', '700')
    .text(`$${tollShare} Toll`);

  root.append('path')
    .attr('d', 'M 54 102 C 110 124, 210 124, 330 116')
    .attr('fill', 'none').attr('stroke', '#ef6a52').attr('stroke-width', 2).attr('stroke-dasharray', '4 3');

  root.append('text')
    .attr('x', 36).attr('y', 142).attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '8.5')
    .text('Creator / Solver Royalty Retained: $0 (Scraped Free)');
  root.append('text')
    .attr('x', 36).attr('y', 158).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
    .text(res.badV.slice(0, 46));

  // Bottom sub-card: CIN 85% Solver + 10% Lineage + 5% Floor
  root.append('rect')
    .attr('x', 24).attr('y', 182).attr('width', 338).attr('height', 152).attr('rx', 8)
    .attr('fill', 'rgba(79,179,168,0.11)').attr('stroke', '#4fb3a8').attr('stroke-width', 1.6);

  root.append('text')
    .attr('x', 36).attr('y', 200).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.6').attr('font-weight', '700')
    .text('CIN CO-INTELLIGENCE: 85% SOLVER + 10% LINEAGE + 5% FLOOR');

  const sW = Math.round(3.14 * fData.solverShare);
  const lW = Math.round(3.14 * fData.lineageShare);
  const cW = 314 - sW - lW;

  root.append('rect')
    .attr('x', 36).attr('y', 212).attr('width', sW).attr('height', 24).attr('rx', 4)
    .attr('fill', '#4fb3a8');
  root.append('text')
    .attr('x', 44).attr('y', 228).attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
    .text(`$${fData.solverShare} Direct Solver (${fData.solverShare}%)`);

  root.append('rect')
    .attr('x', 36 + sW).attr('y', 212).attr('width', lW).attr('height', 24).attr('rx', 4)
    .attr('fill', '#6aa8e0');
  root.append('text')
    .attr('x', 36 + sW + Math.round(lW / 2)).attr('y', 228).attr('text-anchor', 'middle').attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '7.5').attr('font-weight', '700')
    .text(`$${fData.lineageShare}`);

  root.append('rect')
    .attr('x', 36 + sW + lW).attr('y', 212).attr('width', cW).attr('height', 24).attr('rx', 4)
    .attr('fill', '#e3b341');

  // Sankey flow lines from $100 pool to 3 cooperative buckets
  root.append('path')
    .attr('d', 'M 60 242 C 60 268, 90 272, 90 286')
    .attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 3);
  root.append('path')
    .attr('d', 'M 210 242 C 210 268, 210 272, 210 286')
    .attr('fill', 'none').attr('stroke', '#6aa8e0').attr('stroke-width', 2.2);
  root.append('path')
    .attr('d', 'M 320 242 C 320 268, 305 272, 305 286')
    .attr('fill', 'none').attr('stroke', '#e3b341').attr('stroke-width', 2);

  root.append('text')
    .attr('x', 36).attr('y', 302).attr('fill', '#e9e6de').attr('font-family', 'monospace').attr('font-size', '8')
    .text('85% Solver · 10% Shapley Lineage · 5% Commons Floor');
  root.append('text')
    .attr('x', 36).attr('y', 322).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
    .text(res.okV.slice(0, 46));

  // Right Half: Biological (~40 bits/s) vs. Silicon Swarm (10^12 bits/s) Airlock & 96% Pair Moat Meter
  root.append('rect')
    .attr('x', 386).attr('y', 12).attr('width', 362).attr('height', 336).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);

  root.append('text')
    .attr('x', 400).attr('y', 32).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
    .text('2. BIOLOGY (~40 BITS/S) VS. SWARM (10¹² BITS/S) AIRLOCK');

  // Node A: Biological Human (~40 bits/s)
  root.append('rect')
    .attr('x', 400).attr('y', 48).attr('width', 104).attr('height', 112).attr('rx', 8)
    .attr('fill', '#17222b').attr('stroke', '#6aa8e0').attr('stroke-width', 1.4);
  root.append('text')
    .attr('x', 452).attr('y', 70).attr('text-anchor', 'middle').attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
    .text('HUMAN BIOLOGY');
  root.append('text')
    .attr('x', 452).attr('y', 90).attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '10').attr('font-weight', '700')
    .text('~40 bits/s');
  root.append('text')
    .attr('x', 452).attr('y', 110).attr('text-anchor', 'middle').attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '8')
    .text('Reflective Intent');
  root.append('text')
    .attr('x', 452).attr('y', 126).attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '7.8')
    .text('1-to-1 Somatic Key');

  // Center Airlock Shield: OCap + 24h Mortal Lease
  root.append('rect')
    .attr('x', 518).attr('y', 44).attr('width', 108).attr('height', 120).attr('rx', 9)
    .attr('fill', '#142623').attr('stroke', '#4fb3a8').attr('stroke-width', 2);
  root.append('text')
    .attr('x', 572).attr('y', 64).attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
    .text('OCAP AIRLOCK');
  root.append('text')
    .attr('x', 572).attr('y', 82).attr('text-anchor', 'middle').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
    .text('24h Mortal Lease');
  root.append('text')
    .attr('x', 572).attr('y', 100).attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '8')
    .text('0 Bytes Raw Egress');
  root.append('text')
    .attr('x', 572).attr('y', 118).attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '7.8')
    .text('Φ(R) <10ms Gate');
  root.append('text')
    .attr('x', 572).attr('y', 146).attr('text-anchor', 'middle').attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '7.5').attr('font-weight', '700')
    .text('Swarms Blocked');

  // Node B: Silicon Swarm (10^12 bits/s)
  root.append('rect')
    .attr('x', 640).attr('y', 48).attr('width', 96).attr('height', 112).attr('rx', 8)
    .attr('fill', '#241619').attr('stroke', '#ef6a52').attr('stroke-width', 1.4);
  root.append('text')
    .attr('x', 688).attr('y', 70).attr('text-anchor', 'middle').attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
    .text('SILICON SWARM');
  root.append('text')
    .attr('x', 688).attr('y', 90).attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '9.5').attr('font-weight', '700')
    .text('10¹² bits/s');
  root.append('text')
    .attr('x', 688).attr('y', 110).attr('text-anchor', 'middle').attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '7.8')
    .text('4.5-Mo Doubling');
  root.append('text')
    .attr('x', 688).attr('y', 126).attr('text-anchor', 'middle').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '7.5')
    .text('QUIC P2P Mesh');

  // Conduits between Biology, Airlock, and Swarm
  root.append('line')
    .attr('x1', 504).attr('y1', 96).attr('x2', 518).attr('y2', 96)
    .attr('stroke', '#4fb3a8').attr('stroke-width', 2.4);
  root.append('line')
    .attr('x1', 626).attr('y1', 84).attr('x2', 640).attr('y2', 84)
    .attr('stroke', '#ef6a52').attr('stroke-width', 2.2).attr('stroke-dasharray', '3 2');
  root.append('line')
    .attr('x1', 626).attr('y1', 114).attr('x2', 640).attr('y2', 114)
    .attr('stroke', '#4fb3a8').attr('stroke-width', 2.2);

  // Bottom Meter: 96% Pair Moat Meter & Co-Intelligence Transition
  root.append('rect')
    .attr('x', 400).attr('y', 182).attr('width', 336).attr('height', 152).attr('rx', 8)
    .attr('fill', '#161b26').attr('stroke', '#2c3446');

  const dynamicMoat = Math.min(99, Math.max(84, Math.round(fData.moatPct + (ratio - 0.5) * 6)));
  root.append('text')
    .attr('x', 412).attr('y', 202).attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '8.6').attr('font-weight', '700')
    .text(`96% PAIR MOAT METER (ACTIVE LENS: ${dynamicMoat}% UNCOPYABLE)`);

  // 4 Stacked Pair Moat segments
  const segs = [
    { lbl: '4% Base', w: 18, c: '#6aa8e0' },
    { lbl: '30% LoRA', w: 94, c: '#4fb3a8' },
    { lbl: '32% Memory', w: 98, c: '#e3b341' },
    { lbl: '34% Craft', w: 102, c: '#9d7fe8' }
  ];
  let curX = 412;
  segs.forEach((sg) => {
    root.append('rect')
      .attr('x', curX).attr('y', 212).attr('width', sg.w - 2).attr('height', 20).attr('rx', 3)
      .attr('fill', sg.c);
    if (sg.w >= 40) {
      root.append('text')
        .attr('x', curX + Math.round(sg.w / 2)).attr('y', 225).attr('text-anchor', 'middle')
        .attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '7.4').attr('font-weight', '700')
        .text(sg.lbl);
    }
    curX += sg.w;
  });

  root.append('text')
    .attr('x', 412).attr('y', 252).attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
    .text(fData.airlockNote);

  // Transition progress bar from Competitive Extinction/Rent -> Co-Intelligence
  const transW = Math.round(312 * (0.55 + ratio * 0.41));
  root.append('rect')
    .attr('x', 412).attr('y', 264).attr('width', 312).attr('height', 16).attr('rx', 4)
    .attr('fill', '#291515').attr('stroke', '#ef6a52');
  root.append('rect')
    .attr('x', 412).attr('y', 264).attr('width', transW).attr('height', 16).attr('rx', 4)
    .attr('fill', '#173a36').attr('stroke', '#4fb3a8');
  root.append('text')
    .attr('x', 420).attr('y', 275).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '7.6').attr('font-weight', '700')
    .text(`Co-Intelligence Transition (${d.sim.fmt(val)})`);

  root.append('text')
    .attr('x', 412).attr('y', 300).attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '8.2')
    .text('Unbound cloud swarms commoditize in 60–90 days;');
  root.append('text')
    .attr('x', 412).attr('y', 316).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
    .text('1-to-1 Pair Intelligence compounds permanently on device.');
}

function syncPwmModeVisibility() {
  const archBox = document.getElementById('pwm-svg-box');
  const radarSvg = document.getElementById('pwm-d3-radar-svg');
  const flowSvg = document.getElementById('pwm-d3-flow-svg');
  if (archBox) archBox.hidden = currentPwmMode !== 'arch';
  if (radarSvg) radarSvg.hidden = currentPwmMode !== 'radar';
  if (flowSvg) flowSvg.hidden = currentPwmMode !== 'flow';

  if (pwmVizModes) {
    pwmVizModes.querySelectorAll('[data-pwm-mode]').forEach((btn) => {
      const isAct = btn.getAttribute('data-pwm-mode') === currentPwmMode;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', String(isAct));
    });
  }
}

function updatePwmSim() {
  const d = PWM_DATA[currentPwmKey];
  if (!d || !d.sim || !pwmRng) return;
  const val = Number(pwmRng.value || d.sim.val);
  const valEl = document.getElementById('pwm-sim-val');
  if (valEl) valEl.textContent = d.sim.fmt(val);
  const res = d.sim.calc(val);
  const bK = document.getElementById('pwm-so-bad-k');
  const bV = document.getElementById('pwm-so-bad-v');
  const oK = document.getElementById('pwm-so-ok-k');
  const oV = document.getElementById('pwm-so-ok-v');
  if (bK) bK.textContent = d.sim.badK;
  if (bV) bV.textContent = res.badV;
  if (oK) oK.textContent = d.sim.okK;
  if (oV) oV.textContent = res.okV;
  const barsHost = document.getElementById('pwm-bars');
  if (barsHost && d.bars) {
    const span = Math.max(1, d.sim.max - d.sim.min);
    const delta = (val - d.sim.val) / span;
    barsHost.textContent = '';
    d.bars.forEach((b) => {
      const badW = Math.max(4, Math.min(96, Math.round(b[2] - delta * 8)));
      const okW = Math.max(12, Math.min(100, Math.round(b[3] + delta * 6)));
      const row = el('div', 'pwm-bar-row');
      const top = el('div', 'pwm-bar-top');
      top.append(el('span', null, b[0]), el('b', null, `${badW}% vs. ${okW}%`));
      const svg = svgEl('svg', { viewBox: '0 0 200 14', class: 'pwm-dual-svg', 'aria-hidden': 'true' });
      svg.append(
        svgEl('rect', { x: 0, y: 0, width: 200, height: 5, rx: 2.5, fill: '#1a1e28' }),
        svgEl('rect', { x: 0, y: 0, width: Math.round(badW * 2), height: 5, rx: 2.5, fill: '#ef6a52' }),
        svgEl('rect', { x: 0, y: 8, width: 200, height: 5, rx: 2.5, fill: '#1a1e28' }),
        svgEl('rect', { x: 0, y: 8, width: Math.round(okW * 2), height: 5, rx: 2.5, fill: '#4fb3a8' })
      );
      row.append(top, svg);
      barsHost.appendChild(row);
    });
  }
  renderPwmD3Overlay(d, val, res);
  renderPwmD3Radar(d, val, res);
  renderPwmD3Flow(d, val, res);
}

if (pwmRng) {
  pwmRng.addEventListener('input', updatePwmSim);
}

if (pwmVizModes) {
  pwmVizModes.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pwm-mode]');
    if (!btn) return;
    const mode = btn.getAttribute('data-pwm-mode');
    if (!mode) return;
    currentPwmMode = mode;
    syncPwmModeVisibility();
    updatePwmSim();
  });
}

if (pwmTabs) {
  pwmTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pwm]');
    if (!btn) return;
    const key = btn.getAttribute('data-pwm');
    const d = PWM_DATA[key];
    if (!d) return;
    currentPwmKey = key;
    pwmTabs.querySelectorAll('[data-pwm]').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    document.getElementById('pwm-k').textContent = d.k;
    document.getElementById('pwm-title').textContent = d.title;
    document.getElementById('pwm-badge').textContent = d.badge;
    document.querySelectorAll('#pwm-svg-box [data-pwm-svg]').forEach((svg) => {
      svg.hidden = svg.getAttribute('data-pwm-svg') !== key;
    });
    if (d.sim && pwmRng) {
      const lblEl = document.getElementById('pwm-sim-lbl');
      if (lblEl) lblEl.textContent = d.sim.lbl;
      pwmRng.min = String(d.sim.min);
      pwmRng.max = String(d.sim.max);
      pwmRng.step = String(d.sim.step);
      pwmRng.value = String(d.sim.val);
      updatePwmSim();
    }
    const sn = PWM_SHORT[key] || [d.stand, d.gap, d.cin];
    document.getElementById('pwm-stand').textContent = sn[0];
    document.getElementById('pwm-gap').textContent = sn[1];
    document.getElementById('pwm-cin').textContent = sn[2];
    const detEl = document.getElementById('pwm-detail');
    if (detEl) detEl.textContent = `${d.stand} ${d.gap} ${d.cin}`;
  });
}

syncPwmModeVisibility();
updatePwmSim();
window.addEventListener('DOMContentLoaded', () => { setTimeout(updatePwmSim, 60); });
