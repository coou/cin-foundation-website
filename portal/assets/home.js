// Network home: live trajectory, interactive workbench map, 4-mode D3 world matrix, agent fleet pulse, scenarios, and ideas.
import { backend, mountAuth, el, svgEl, getJSON, ago, bars } from './portal.js?v=23';
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
//    with 4-Mode D3.js v7 Visual Switcher (#pwm-viz-modes):
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
const pwmRng = document.getElementById('pwm-sim-rng') || document.getElementById('pwm-sim-slider');

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

// Mode 1 overlay: no-op because #pwm-right-d3-svg displays the live stress-test verdict at large scale
function renderPwmD3Overlay(d, val, res) {
  if (!window.d3) return;
  const activeSvg = document.querySelector(`#pwm-svg-box [data-pwm-svg="${currentPwmKey}"]`);
  if (!activeSvg) return;
  const d3 = window.d3;
  d3.selectAll('#pwm-d3-live-overlay, g.pwm-d3-live-gauge').remove();
  d3.select(activeSvg).attr('viewBox', '0 0 760 340').attr('data-rich-viz', 'true');
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
    .attr('x', 26).attr('y', 36).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(`6-AXIS RADAR · ${currentPwmKey.toUpperCase()}`);

  root.append('text')
    .attr('x', 26).attr('y', 56).attr('fill', '#c5c2b9').attr('font-family', 'monospace').attr('font-size', '12')
    .text(`Input: ${d.sim.fmt(val)}`);

  const cx = 204, cy = 188, maxR = 88;
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
    '1. Sovereignty',
    '2. Royalties',
    '3. Airlock',
    '4. 0-Egress',
    '5. Compute',
    '6. 96% Moat'
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

    const lblR = maxR + 24;
    const lx = Math.round(cx + Math.cos(ang) * lblR);
    const ly = Math.round(cy + Math.sin(ang) * (maxR + 18));
    root.append('text')
      .attr('x', lx).attr('y', ly + 4)
      .attr('text-anchor', 'middle').attr('fill', '#e9e6de').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
      .text(shortAxisLabels[i]);

    const cR = (cloudScores[i] / 100) * maxR;
    const oR = (openScores[i] / 100) * maxR;
    const nR = (cinScores[i] / 100) * maxR;
    cloudPts.push(`${Math.round(cx + Math.cos(ang) * cR)},${Math.round(cy + Math.sin(ang) * cR)}`);
    openPts.push(`${Math.round(cx + Math.cos(ang) * oR)},${Math.round(cy + Math.sin(ang) * oR)}`);
    cinPts.push(`${Math.round(cx + Math.cos(ang) * nR)},${Math.round(cy + Math.sin(ang) * nR)}`);
  }

  root.append('polygon')
    .attr('points', cloudPts.join(' '))
    .attr('fill', 'rgba(239,106,82,0.22)').attr('stroke', '#ef6a52').attr('stroke-width', 2);

  root.append('polygon')
    .attr('points', openPts.join(' '))
    .attr('fill', 'rgba(227,179,65,0.16)').attr('stroke', '#e3b341').attr('stroke-width', 2).attr('stroke-dasharray', '4 2');

  root.append('polygon')
    .attr('points', cinPts.join(' '))
    .attr('fill', 'rgba(79,179,168,0.28)').attr('stroke', '#4fb3a8').attr('stroke-width', 2.8);

  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const nR = (cinScores[i] / 100) * maxR;
    root.append('circle')
      .attr('cx', Math.round(cx + Math.cos(ang) * nR))
      .attr('cy', Math.round(cy + Math.sin(ang) * nR))
      .attr('r', 4.5).attr('fill', '#4fb3a8').attr('stroke', '#0d0f13').attr('stroke-width', 1.4);
  }

  // Legend at bottom of Left Panel
  root.append('rect')
    .attr('x', 24).attr('y', 312).attr('width', 360).attr('height', 26).attr('rx', 6)
    .attr('fill', '#0e1218').attr('stroke', '#222836');
  root.append('text')
    .attr('x', 36).attr('y', 329).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('● Cloud');
  root.append('text')
    .attr('x', 150).attr('y', 329).attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('▲ Open Weights');
  root.append('text')
    .attr('x', 298).attr('y', 329).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('◆ CIN');

  // Right Panel: Live 6-Row Metric Table
  root.append('rect')
    .attr('x', 406).attr('y', 12).attr('width', 342).attr('height', 336).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);

  root.append('text')
    .attr('x', 420).attr('y', 36).attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text('6-AXIS SCORE COMPARISON');

  root.append('text')
    .attr('x', 420).attr('y', 56).attr('fill', '#8c8a82').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('DIMENSION');
  root.append('text')
    .attr('x', 612).attr('y', 56).attr('text-anchor', 'end').attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('CLOUD');
  root.append('text')
    .attr('x', 672).attr('y', 56).attr('text-anchor', 'end').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('OPEN');
  root.append('text')
    .attr('x', 732).attr('y', 56).attr('text-anchor', 'end').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('CIN');

  for (let r = 0; r < 6; r++) {
    const ry = 66 + r * 44;
    root.append('rect')
      .attr('x', 418).attr('y', ry).attr('width', 318).attr('height', 38).attr('rx', 6)
      .attr('fill', '#171c27').attr('stroke', '#252c3b');

    root.append('text')
      .attr('x', 426).attr('y', ry + 18).attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '12').attr('font-weight', '700')
      .text(shortAxisLabels[r]);

    root.append('text')
      .attr('x', 612).attr('y', ry + 18).attr('text-anchor', 'end').attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
      .text(`${cloudScores[r]}%`);
    root.append('text')
      .attr('x', 672).attr('y', ry + 18).attr('text-anchor', 'end').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
      .text(`${openScores[r]}%`);
    root.append('text')
      .attr('x', 730).attr('y', ry + 18).attr('text-anchor', 'end').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
      .text(`${cinScores[r]}%`);

    root.append('rect')
      .attr('x', 426).attr('y', ry + 26).attr('width', 302).attr('height', 6).attr('rx', 3)
      .attr('fill', '#0d1017');
    root.append('rect')
      .attr('x', 426).attr('y', ry + 26).attr('width', Math.round(3.02 * cinScores[r])).attr('height', 6).attr('rx', 3)
      .attr('fill', '#4fb3a8').attr('opacity', '0.55');
    root.append('rect')
      .attr('x', 426).attr('y', ry + 26).attr('width', Math.round(3.02 * cloudScores[r])).attr('height', 6).attr('rx', 3)
      .attr('fill', '#ef6a52');
  }
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
    .attr('x', 26).attr('y', 36).attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(`1. $100 VALUE FLOW (${currentPwmKey.toUpperCase()})`);

  // Top sub-card: Status Quo Extraction
  root.append('rect')
    .attr('x', 24).attr('y', 48).attr('width', 338).attr('height', 132).attr('rx', 8)
    .attr('fill', 'rgba(239,106,82,0.09)').attr('stroke', '#ef6a52').attr('stroke-width', 1.5);

  root.append('text')
    .attr('x', 36).attr('y', 72).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text('TODAY: CLOUD EXTRACTION');

  const rentShare = Math.min(82, Math.round(fData.cloudRent + ratio * 6));
  const tollShare = 100 - rentShare;
  const rentW = Math.round(3.14 * rentShare);
  const tollW = 314 - rentW;

  root.append('rect')
    .attr('x', 36).attr('y', 84).attr('width', rentW).attr('height', 30).attr('rx', 5)
    .attr('fill', '#ef6a52');
  root.append('text')
    .attr('x', 46).attr('y', 104).attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(`$${rentShare} Cloud Equity`);

  root.append('rect')
    .attr('x', 36 + rentW).attr('y', 84).attr('width', tollW).attr('height', 30).attr('rx', 5)
    .attr('fill', '#9e3929');
  root.append('text')
    .attr('x', 36 + rentW + Math.round(tollW / 2)).attr('y', 104).attr('text-anchor', 'middle').attr('fill', '#ffffff').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text(`$${tollShare}`);

  root.append('text')
    .attr('x', 36).attr('y', 142).attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '13').attr('font-weight', '700')
    .text('Creator Royalty: $0 (Scraped Free)');
  root.append('text')
    .attr('x', 36).attr('y', 166).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text(res.badV.slice(0, 36));

  // Bottom sub-card: CIN 85% Solver + 10% Lineage + 5% Floor
  root.append('rect')
    .attr('x', 24).attr('y', 192).attr('width', 338).attr('height', 142).attr('rx', 8)
    .attr('fill', 'rgba(79,179,168,0.12)').attr('stroke', '#4fb3a8').attr('stroke-width', 1.8);

  root.append('text')
    .attr('x', 36).attr('y', 216).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text('WITH CIN: 95% SHAPLEY + 5% FLOOR');

  const sW = Math.round(3.14 * fData.solverShare);
  const lW = Math.round(3.14 * fData.lineageShare);
  const cW = 314 - sW - lW;

  root.append('rect')
    .attr('x', 36).attr('y', 228).attr('width', sW).attr('height', 30).attr('rx', 5)
    .attr('fill', '#4fb3a8');
  root.append('text')
    .attr('x', 46).attr('y', 248).attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(`$${fData.solverShare} Solver (${fData.solverShare}%)`);

  root.append('rect')
    .attr('x', 36 + sW).attr('y', 228).attr('width', lW).attr('height', 30).attr('rx', 5)
    .attr('fill', '#6aa8e0');

  root.append('rect')
    .attr('x', 36 + sW + lW).attr('y', 228).attr('width', cW).attr('height', 30).attr('rx', 5)
    .attr('fill', '#e3b341');

  root.append('text')
    .attr('x', 36).attr('y', 286).attr('fill', '#e9e6de').attr('font-family', 'sans-serif').attr('font-size', '13').attr('font-weight', '700')
    .text(`$${fData.solverShare} Direct + $${fData.lineageShare} Lineage + $${fData.commonsShare} Floor`);
  root.append('text')
    .attr('x', 36).attr('y', 314).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text(res.okV.slice(0, 36));

  // Right Half: Biology (~40 bits/s) vs. Silicon Swarm Airlock & 96% Pair Moat Meter
  root.append('rect')
    .attr('x', 386).attr('y', 12).attr('width', 362).attr('height', 336).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);

  root.append('text')
    .attr('x', 400).attr('y', 36).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text('2. OCAP AIRLOCK & 96% PAIR MOAT');

  // Node A: Biological Human
  root.append('rect')
    .attr('x', 400).attr('y', 50).attr('width', 104).attr('height', 114).attr('rx', 8)
    .attr('fill', '#17222b').attr('stroke', '#6aa8e0').attr('stroke-width', 1.6);
  root.append('text')
    .attr('x', 452).attr('y', 76).attr('text-anchor', 'middle').attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('BIOLOGY');
  root.append('text')
    .attr('x', 452).attr('y', 106).attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '15').attr('font-weight', '700')
    .text('40 b/s');
  root.append('text')
    .attr('x', 452).attr('y', 136).attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'sans-serif').attr('font-size', '12').attr('font-weight', '700')
    .text('1:1 Key');

  // Center Airlock Shield
  root.append('rect')
    .attr('x', 516).attr('y', 46).attr('width', 112).attr('height', 122).attr('rx', 9)
    .attr('fill', '#142623').attr('stroke', '#4fb3a8').attr('stroke-width', 2.2);
  root.append('text')
    .attr('x', 572).attr('y', 74).attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('AIRLOCK');
  root.append('text')
    .attr('x', 572).attr('y', 104).attr('text-anchor', 'middle').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '14').attr('font-weight', '700')
    .text('24h Lease');
  root.append('text')
    .attr('x', 572).attr('y', 134).attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '12').attr('font-weight', '700')
    .text('0B Egress');

  // Node B: Silicon Swarm
  root.append('rect')
    .attr('x', 640).attr('y', 50).attr('width', 96).attr('height', 114).attr('rx', 8)
    .attr('fill', '#241619').attr('stroke', '#ef6a52').attr('stroke-width', 1.6);
  root.append('text')
    .attr('x', 688).attr('y', 76).attr('text-anchor', 'middle').attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('SWARM');
  root.append('text')
    .attr('x', 688).attr('y', 106).attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '15').attr('font-weight', '700')
    .text('10¹² b/s');
  root.append('text')
    .attr('x', 688).attr('y', 136).attr('text-anchor', 'middle').attr('fill', '#ef6a52').attr('font-family', 'sans-serif').attr('font-size', '12').attr('font-weight', '700')
    .text('Gated');

  root.append('line').attr('x1', 504).attr('y1', 106).attr('x2', 516).attr('y2', 106).attr('stroke', '#4fb3a8').attr('stroke-width', 2.5);
  root.append('line').attr('x1', 628).attr('y1', 106).attr('x2', 640).attr('y2', 106).attr('stroke', '#ef6a52').attr('stroke-width', 2.5).attr('stroke-dasharray', '3 2');

  // Bottom Meter: 96% Pair Moat Meter
  root.append('rect')
    .attr('x', 400).attr('y', 186).attr('width', 336).attr('height', 148).attr('rx', 8)
    .attr('fill', '#161b26').attr('stroke', '#2c3446');

  const dynamicMoat = Math.min(99, Math.max(84, Math.round(fData.moatPct + (ratio - 0.5) * 6)));
  root.append('text')
    .attr('x', 414).attr('y', 214).attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(`LOCAL PAIR MOAT: ${dynamicMoat}% UNCOPYABLE`);

  const segs = [
    { lbl: '4%', w: 22, c: '#6aa8e0' },
    { lbl: '30% LoRA', w: 94, c: '#4fb3a8' },
    { lbl: '32% Mem', w: 96, c: '#e3b341' },
    { lbl: '34% Craft', w: 98, c: '#9d7fe8' }
  ];
  let curX = 414;
  segs.forEach((sg) => {
    root.append('rect')
      .attr('x', curX).attr('y', 228).attr('width', sg.w - 3).attr('height', 28).attr('rx', 4)
      .attr('fill', sg.c);
    if (sg.w >= 80) {
      root.append('text')
        .attr('x', curX + Math.round(sg.w / 2)).attr('y', 247).attr('text-anchor', 'middle')
        .attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
        .text(sg.lbl);
    }
    curX += sg.w;
  });

  const transW = Math.round(308 * (0.55 + ratio * 0.41));
  root.append('rect')
    .attr('x', 414).attr('y', 274).attr('width', 308).attr('height', 26).attr('rx', 5)
    .attr('fill', '#291515').attr('stroke', '#ef6a52');
  root.append('rect')
    .attr('x', 414).attr('y', 274).attr('width', transW).attr('height', 26).attr('rx', 5)
    .attr('fill', '#173a36').attr('stroke', '#4fb3a8');
  root.append('text')
    .attr('x', 424).attr('y', 292).attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text(`Pair Advantage: ${d.sim.fmt(val)}`);

  root.append('text')
    .attr('x', 414).attr('y', 320).attr('fill', '#4fb3a8').attr('font-family', 'sans-serif').attr('font-size', '12').attr('font-weight', '700')
    .text('Compounds 100% locally on your device');
}

// Mode 4: Dedicated D3 18-Actor Global AI Ecosystem Quadrant + 5-Zone Safety Gradient (#pwm-d3-quadrant-svg)
const PWM_GLOBAL_ACTORS = [
  { id: 1,  name: 'Closed Cloud Labs',       lens: 'labs',       x: 6,  y: 44, color: '#ef6a52', role: '15-40% API Rent · $0 Creator Share' },
  { id: 2,  name: 'Hyperscaler Clusters',    lens: 'labs',       x: 6,  y: 35, color: '#ef6a52', role: '$100B Closed Compute Oligopoly' },
  { id: 3,  name: 'Ad-Attention Wrappers',   lens: 'labs',       x: 6,  y: 26, color: '#ef6a52', role: 'Surveillance Telemetry & Lock-In' },
  { id: 4,  name: 'Raw e/acc Swarms',        lens: 'safety',     x: 6,  y: 17, color: '#ef6a52', role: 'Zone 1: Zero Containment Barriers' },
  { id: 5,  name: 'Voluntary Lab RSPs',      lens: 'safety',     x: 6,  y: 9,  color: '#e07b42', role: 'Zone 2: Self-Policed Under Race' },
  { id: 12, name: 'Cloud API Firms',         lens: 'enterprise', x: 35, y: 18, color: '#ef6a52', role: '-18% Margin · Workflows Leaked' },
  { id: 14, name: 'AI Commodity Cartels',    lens: 'humanity',   x: 35, y: 9, color: '#ef6a52', role: '-38% Producer Surplus Extraction' },
  { id: 8,  name: 'Statutory Legislatures',  lens: 'gov',        x: 8,  y: 60, color: '#e3b341', role: '3-5 Yr Lag · Payroll Tax Erosion' },
  { id: 6,  name: 'Eval Labs (METR/AISI)',   lens: 'safety',     x: 10, y: 74, color: '#e3b341', role: 'Zone 3: T50 Horizon Diagnostics' },
  { id: 7,  name: 'Global Hard Pause',       lens: 'safety',     x: 12, y: 88, color: '#6aa8e0', role: 'Zone 5: Treaty Compute Freeze' },
  { id: 10, name: 'Public Univs (arXiv)',    lens: 'research',   x: 56, y: 36, color: '#e3b341', role: '88% Breakthroughs · $0 Royalties' },
  { id: 16, name: 'Raw Open Weights',        lens: 'pair',       x: 58, y: 18, color: '#e3b341', role: '60-90d Distillation · 0% Airlock' },
  { id: 15, name: 'Producer PSI Co-Ops',     lens: 'humanity',   x: 95, y: 55, color: '#4fb3a8', role: '$8 Liveness + Offline Voice Twin' },
  { id: 13, name: '500-Firm PSI Co-Ops',     lens: 'enterprise', x: 95, y: 63, color: '#4fb3a8', role: '+34% Wholesale Margin · 0B Leak' },
  { id: 11, name: 'Shapley Research Mesh',   lens: 'research',   x: 95, y: 71, color: '#4fb3a8', role: '15% Lineage Royalty + SPRA 95.3%' },
  { id: 9,  name: '5D Municipal Ledgers',    lens: 'gov',        x: 95, y: 79, color: '#4fb3a8', role: '<10ms Silicon Gate + $25k Floor' },
  { id: 17, name: '1-to-1 OCap Pair Twin',   lens: 'pair',       x: 95, y: 87, color: '#4fb3a8', role: '96% Uncopyable Local Pair Moat' },
  { id: 18, name: 'CIN Co-Intelligence',     lens: 'all',        x: 95, y: 95, color: '#4fb3a8', role: 'Zone 4: Two Internets + 24h Lease' }
];

function renderPwmD3Quadrant(d, val, res) {
  const quadEl = document.getElementById('pwm-d3-quadrant-svg');
  const root = selectD3Root(quadEl);
  if (!root) return;

  root.append('rect')
    .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 360).attr('rx', 12)
    .attr('fill', '#0d0f13');

  const qx0 = 12, qy0 = 12, qw = 468, qh = 264;
  const plotX0 = 36, plotX1 = 462, plotY0 = 244, plotY1 = 46;
  const plotW = plotX1 - plotX0;
  const plotH = plotY0 - plotY1;
  const midX = Math.round((plotX0 + plotX1) / 2);
  const midY = Math.round((plotY0 + plotY1) / 2);

  root.append('rect')
    .attr('x', qx0).attr('y', qy0).attr('width', qw).attr('height', qh).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#282f3d').attr('stroke-width', 1.4);

  root.append('text')
    .attr('x', 24).attr('y', 34).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(`18-ACTOR QUADRANT · ${currentPwmKey.toUpperCase()}`);

  root.append('rect')
    .attr('x', plotX0).attr('y', midY).attr('width', midX - plotX0).attr('height', plotY0 - midY)
    .attr('fill', 'rgba(239,106,82,0.08)');
  root.append('rect')
    .attr('x', midX).attr('y', plotY1).attr('width', plotX1 - midX).attr('height', midY - plotY1)
    .attr('fill', 'rgba(79,179,168,0.12)');

  root.append('line')
    .attr('x1', midX).attr('y1', plotY1).attr('x2', midX).attr('y2', plotY0)
    .attr('stroke', '#323a4c').attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3');
  root.append('line')
    .attr('x1', plotX0).attr('y1', midY).attr('x2', plotX1).attr('y2', midY)
    .attr('stroke', '#323a4c').attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3');

  root.append('text')
    .attr('x', plotX0 + 8).attr('y', plotY0 - 8).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('Q3: CLOUD RENT');
  root.append('text')
    .attr('x', plotX1 - 8).attr('y', plotY0 - 8).attr('text-anchor', 'end').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('Q4: OPEN WEIGHTS');
  root.append('text')
    .attr('x', plotX0 + 8).attr('y', plotY1 + 16).attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('Q2: HARD PAUSE');
  root.append('text')
    .attr('x', plotX1 - 8).attr('y', plotY1 + 16).attr('text-anchor', 'end').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('Q1: CIN 1:1 PAIR');

  root.append('text')
    .attr('x', midX).attr('y', 266).attr('text-anchor', 'middle').attr('fill', '#c5c2b9').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('X: Cloud Rent (0%) → Local Ownership (100%)');

  const mapX = (xv) => Math.round(plotX0 + (xv / 100) * plotW);
  const mapY = (yv) => Math.round(plotY0 - (yv / 100) * plotH);

  const lensActors = PWM_GLOBAL_ACTORS.filter((a) => a.lens === currentPwmKey || a.lens === 'all');
  const sqActor = lensActors.find((a) => a.x < 50) || PWM_GLOBAL_ACTORS[0];
  const cinActor = lensActors.find((a) => a.x >= 70 && a.lens === currentPwmKey) || PWM_GLOBAL_ACTORS[17];

  root.append('path')
    .attr('d', `M ${mapX(sqActor.x)} ${mapY(sqActor.y)} Q ${midX} ${midY - 18} ${mapX(cinActor.x)} ${mapY(cinActor.y)}`)
    .attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 2.6).attr('stroke-dasharray', '5 3');

  PWM_GLOBAL_ACTORS.forEach((actor) => {
    const isMatch = actor.lens === currentPwmKey || actor.lens === 'all';
    const ax = mapX(actor.x);
    const ay = mapY(actor.y);

    const gNode = root.append('g')
      .attr('class', 'svg-node')
      .on('click', () => {
        if (actor.lens !== 'all' && pwmTabs) {
          const targetBtn = pwmTabs.querySelector(`[data-pwm="${actor.lens}"]`);
          if (targetBtn) targetBtn.click();
        }
      });

    if (isMatch) {
      gNode.append('circle')
        .attr('cx', ax).attr('cy', ay).attr('r', 12)
        .attr('fill', 'none').attr('stroke', actor.color).attr('stroke-width', 1.8).attr('opacity', '0.7');
    }

    gNode.append('circle')
      .attr('cx', ax).attr('cy', ay).attr('r', isMatch ? 7 : 4.5)
      .attr('fill', actor.color)
      .attr('stroke', '#0d0f13').attr('stroke-width', 1.5)
      .attr('opacity', isMatch ? '1' : '0.45');

    if (isMatch) {
      const alignEnd = actor.x > 65;
      gNode.append('text')
        .attr('x', alignEnd ? ax - 12 : ax + 12)
        .attr('y', ay + 4)
        .attr('text-anchor', alignEnd ? 'end' : 'start')
        .attr('fill', '#f0ede6')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '12')
        .attr('font-weight', '700')
        .text(`#${actor.id} ${actor.name}`);
    }
  });

  // Top-Right Panel: Highlighted Lens Actors
  root.append('rect')
    .attr('x', 490).attr('y', 12).attr('width', 258).attr('height', 264).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);

  root.append('text')
    .attr('x', 502).attr('y', 36).attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(`ACTIVE LENS (${currentPwmKey.toUpperCase()})`);

  lensActors.slice(0, 3).forEach((act, idx) => {
    const ry = 50 + idx * 70;
    root.append('rect')
      .attr('x', 500).attr('y', ry).attr('width', 238).attr('height', 60).attr('rx', 6)
      .attr('fill', '#171c27').attr('stroke', act.color).attr('stroke-width', 1.5);

    root.append('text')
      .attr('x', 510).attr('y', ry + 24).attr('fill', act.color).attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
      .text(`#${act.id} ${act.name.slice(0, 20)}`);

    root.append('text')
      .attr('x', 510).attr('y', ry + 46).attr('fill', '#e9e6de').attr('font-family', 'sans-serif').attr('font-size', '12')
      .text(act.role.slice(0, 28));
  });

  // Bottom Strip: 5-Zone Safety Gradient
  root.append('rect')
    .attr('x', 12).attr('y', 284).attr('width', 736).attr('height', 64).attr('rx', 10)
    .attr('fill', '#131720').attr('stroke', '#2c3446').attr('stroke-width', 1.4);

  const zones = [
    { z: '1. Raw e/acc',  c: '#ef6a52', x: 24,  w: 136, hi: false },
    { z: '2. Lab RSPs',   c: '#e07b42', x: 166, w: 136, hi: false },
    { z: '3. Eval Labs',  c: '#e3b341', x: 308, w: 136, hi: false },
    { z: '4. ★ Airlock',  c: '#4fb3a8', x: 450, w: 152, hi: true  },
    { z: '5. Hard Pause', c: '#6aa8e0', x: 608, w: 128, hi: false }
  ];

  zones.forEach((zn) => {
    root.append('rect')
      .attr('x', zn.x).attr('y', 298).attr('width', zn.w).attr('height', 36).attr('rx', 6)
      .attr('fill', zn.hi ? 'rgba(79,179,168,0.22)' : '#171c27')
      .attr('stroke', zn.c).attr('stroke-width', zn.hi ? 2.2 : 1.4);
    root.append('text')
      .attr('x', zn.x + Math.round(zn.w / 2)).attr('y', 321).attr('text-anchor', 'middle').attr('fill', zn.c).attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
      .text(zn.z);
  });
}

// Right-Column Bespoke 2-Panel D3.js v7 Lens Infographic (#pwm-right-d3-svg)
function renderPwmRightInfographicD3(d, val, res) {
  const rightSvg = document.getElementById('pwm-right-d3-svg');
  const root = selectD3Root(rightSvg);
  if (!root) return;

  const span = Math.max(1, d.sim.max - d.sim.min);
  const ratio = Math.max(0.08, Math.min(0.95, (val - d.sim.min) / span));

  root.append('rect')
    .attr('x', 0).attr('y', 0).attr('width', 380).attr('height', 310).attr('rx', 10)
    .attr('fill', '#0d0f13');

  // Top Card (y=8..164): Big Visual TODAY vs. WITH CIN Comparison
  root.append('rect')
    .attr('x', 8).attr('y', 8).attr('width', 364).attr('height', 156).attr('rx', 9)
    .attr('fill', '#131720').attr('stroke', '#282f3d').attr('stroke-width', 1.5);

  const lensSummary = {
    labs:       { t: '01 · CREATOR ROYALTY SPLIT',       badPct: 12, okPct: 95, badLbl: '0% Royalty · 28% Toll', okLbl: '95% Shapley + 5% Floor' },
    safety:     { t: '02 · HUMAN AGENCY RETAINED',       badPct: 18, okPct: 97, badLbl: 'Swarm Outpaces 40 b/s',  okLbl: '24h Lease + Airlock' },
    gov:        { t: '03 · RUNTIME CIVIC LOCKS',         badPct: 14, okPct: 96, badLbl: '3–5 Yr Statute Lag',     okLbl: '<10ms Gate + $25k Floor' },
    research:   { t: '04 · ACADEMIC ROYALTY RETURN',     badPct: 6,  okPct: 95, badLbl: '$0 Paid to arXiv Labs',  okLbl: '15% Endowment + SPRA' },
    enterprise: { t: '05 · WHOLESALE MARGIN RETAINED',   badPct: 24, okPct: 96, badLbl: '-28% Middleman Toll',    okLbl: '+34% PSI Co-Op Margin' },
    humanity:   { t: '06 · PHYSICAL PRODUCER SHARE',     badPct: 22, okPct: 94, badLbl: '-38% Cartel Price Dump', okLbl: '$8 Liveness + PSI Co-Op' },
    pair:       { t: '07 · DEFENSIBLE LOCAL MOAT',       badPct: 8,  okPct: 96, badLbl: '90-Day Cloud Decay',     okLbl: '96% 1-to-1 Pair Moat' }
  }[currentPwmKey] || { t: 'LENS COMPARISON', badPct: 14, okPct: 95, badLbl: 'Status Quo Rent', okLbl: 'CIN Co-Intelligence' };

  root.append('text')
    .attr('x', 20).attr('y', 32).attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(lensSummary.t);

  // TODAY bar
  const badW = Math.max(44, Math.round(3.4 * lensSummary.badPct));
  root.append('rect')
    .attr('x', 20).attr('y', 44).attr('width', 340).attr('height', 48).attr('rx', 7)
    .attr('fill', '#191316').attr('stroke', '#ef6a52').attr('stroke-width', 1.4);
  root.append('rect')
    .attr('x', 20).attr('y', 44).attr('width', badW).attr('height', 48).attr('rx', 7)
    .attr('fill', 'rgba(239,106,82,0.28)');
  root.append('text')
    .attr('x', 32).attr('y', 64).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('TODAY (STATUS QUO)');
  root.append('text')
    .attr('x', 32).attr('y', 82).attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '14').attr('font-weight', '700')
    .text(lensSummary.badLbl);

  // WITH CIN bar
  const okW = Math.max(120, Math.round(3.4 * lensSummary.okPct));
  root.append('rect')
    .attr('x', 20).attr('y', 102).attr('width', 340).attr('height', 50).attr('rx', 7)
    .attr('fill', '#111d1c').attr('stroke', '#4fb3a8').attr('stroke-width', 1.8);
  root.append('rect')
    .attr('x', 20).attr('y', 102).attr('width', okW).attr('height', 50).attr('rx', 7)
    .attr('fill', 'rgba(79,179,168,0.28)');
  root.append('text')
    .attr('x', 32).attr('y', 122).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('WITH CIN CO-INTELLIGENCE');
  root.append('text')
    .attr('x', 32).attr('y', 142).attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '15').attr('font-weight', '700')
    .text(lensSummary.okLbl);

  // Bottom Card (y=172..302): Live Stress-Test Verdict
  root.append('rect')
    .attr('x', 8).attr('y', 172).attr('width', 364).attr('height', 130).attr('rx', 9)
    .attr('fill', '#131720').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);

  root.append('text')
    .attr('x', 20).attr('y', 196).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text('STRESS-TEST');
  root.append('text')
    .attr('x', 360).attr('y', 196).attr('text-anchor', 'end').attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '13').attr('font-weight', '700')
    .text(d.sim.fmt(val));

  const badBarW = Math.round(340 * Math.max(0.32, 0.88 - ratio * 0.42));
  root.append('rect')
    .attr('x', 20).attr('y', 206).attr('width', 340).attr('height', 38).attr('rx', 6)
    .attr('fill', '#191316').attr('stroke', '#ef6a52').attr('stroke-width', 1.3);
  root.append('rect')
    .attr('x', 20).attr('y', 206).attr('width', badBarW).attr('height', 38).attr('rx', 6)
    .attr('fill', 'rgba(239,106,82,0.24)');
  root.append('text')
    .attr('x', 30).attr('y', 230).attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text(res.badV.slice(0, 34));

  const okBarW = Math.round(340 * Math.min(1, 0.55 + ratio * 0.45));
  root.append('rect')
    .attr('x', 20).attr('y', 252).attr('width', 340).attr('height', 38).attr('rx', 6)
    .attr('fill', '#111d1c').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);
  root.append('rect')
    .attr('x', 20).attr('y', 252).attr('width', okBarW).attr('height', 38).attr('rx', 6)
    .attr('fill', 'rgba(79,179,168,0.28)');
  root.append('text')
    .attr('x', 30).attr('y', 276).attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
    .text(res.okV.slice(0, 34));
}

function setNodeHidden(node, isHidden) {
  if (!node) return;
  node.hidden = isHidden;
  if (isHidden) {
    node.setAttribute('hidden', '');
  } else {
    node.removeAttribute('hidden');
  }
}

function syncPwmModeVisibility() {
  const archBox = document.getElementById('pwm-svg-box');
  const radarSvg = document.getElementById('pwm-d3-radar-svg');
  const flowSvg = document.getElementById('pwm-d3-flow-svg');
  const quadSvg = document.getElementById('pwm-d3-quadrant-svg');
  setNodeHidden(archBox, currentPwmMode !== 'arch');
  setNodeHidden(radarSvg, currentPwmMode !== 'radar');
  setNodeHidden(flowSvg, currentPwmMode !== 'flow');
  setNodeHidden(quadSvg, currentPwmMode !== 'quadrant');

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
  renderPwmD3Quadrant(d, val, res);
  renderPwmRightInfographicD3(d, val, res);
}

function renderPwm() {
  updatePwmSim();
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
      setNodeHidden(svg, svg.getAttribute('data-pwm-svg') !== key);
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
