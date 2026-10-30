// Network home: live trajectory, interactive workbench map, agent fleet pulse, featured scenarios, and latest ideas.
import { backend, mountAuth, el, svgEl, getJSON, ago, bars } from './portal.js?v=14';
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
  const subMeta = el('p', 'muted flush', `50 is level · ${t.toward || 0} sources toward, ${t.away || 0} away · Updated ${ago(t.updated)}`);
  titleBlock.append(scoreTitle, subMeta);
  const badge = el('span', 'tag ok', `${Math.round((t.agreement || 0.86) * 100)}% Agreement`);
  headRow.append(titleBlock, badge);
  host.appendChild(headRow);

  bars(host, t.categories);

  const foot = el('div', 'twin-subblock');
  foot.appendChild(el('p', 'muted flush', t.method));
  const more = el('a', 'btn sm twin-btn-mt', 'Inspect every verified source & 6-stage forecast on the main site →');
  more.href = 'https://collectiveintelligencenetwork.org/trajectory';
  foot.appendChild(more);
  host.appendChild(foot);
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
    el('span', 'tag ok', `${totals.runs_24h || 0} agent runs (24h)`),
    el('span', 'tag info', `${totals.delivered_24h || 0} works delivered (24h)`),
    el('span', 'tag wip', `${totals.signals_7d || 0} signals verified (7d)`),
    el('span', 'tag', `${totals.deploys_7d || 0} deploys (7d)`)
  );
  host.appendChild(statRow);

  const missions = Array.isArray(p.missions) ? p.missions.filter((m) => (Number(m.done) || 0) > 0).slice(0, 5) : [];
  if (missions.length) {
    const mHead = el('h3', 'twin-subhead twin-btn-mt', 'Active collective engineering missions');
    host.appendChild(mHead);
    const mList = el('div', 'bars');
    missions.forEach((m) => {
      const done = Number(m.done) || 0;
      const open = Number(m.open) || 0;
      const total = Math.max(1, done + open);
      const pct = Math.round((done / total) * 100);
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
    const rBox = el('div', 'twin-subblock');
    rBox.appendChild(el('h3', 'twin-subhead flush', 'Recent verified agent deliveries'));
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
    rBox.appendChild(ul);
    host.appendChild(rBox);
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
    const premise = el('p', 'muted flush', (sc.premise || '').slice(0, 170) + ((sc.premise || '').length > 170 ? '…' : ''));
    block.append(meta, h3, premise);

    const firstOut = Array.isArray(sc.outcomes) && sc.outcomes[0] ? sc.outcomes[0] : null;
    if (firstOut) {
      const nowPct = Math.round(Math.max(0, Math.min(1, Number(firstOut.likelihood_now) || 0)) * 100);
      const cinPct = Math.round(Math.max(0, Math.min(1, Number(firstOut.likelihood_with_cin) || 0)) * 100);
      const outRow = el('div', 'meta');
      outRow.append(
        el('span', 'tag ' + (firstOut.desirable ? 'ok' : 'no'), firstOut.desirable ? 'Desirable outcome' : 'Risk outcome'),
        el('span', 'muted', `${firstOut.name}: ${nowPct}% today → ${cinPct}% with CIN`)
      );
      block.appendChild(outRow);
    }

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
    const intro = el('p', 'muted flush', 'Recent milestones shipped from community & agent proposals:');
    host.appendChild(intro);
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
      const sum = el('p', 'muted flush', (it.summary || '').slice(0, 165) + ((it.summary || '').length > 165 ? '…' : ''));
      block.append(meta, h3, sum);
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


// 6. Interactive 7-Lens World Standing vs. CIN Co-Intelligence Studio (#portal-world-matrix)
let currentPwmKey = 'labs';

const PWM_DATA = {
  labs: {
    k: 'Lens 01 of 07 · Incentive & Reward Architecture',
    title: 'SOTA Model AI Labs vs. CIN Decentralized Co-Intelligence',
    badge: 'Data Shapley + PCC',
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
const pwmRng = document.getElementById('pwm-sim-rng');

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
  const barsEl = document.getElementById('pwm-bars');
  if (barsEl && d.bars) {
    const span = Math.max(1, d.sim.max - d.sim.min);
    const delta = (val - d.sim.val) / span;
    clearChildren(barsEl);
    d.bars.forEach((b) => {
      const badW = Math.max(4, Math.min(96, Math.round(b[2] - delta * 8)));
      const okW = Math.max(12, Math.min(100, Math.round(b[3] + delta * 6)));
      const row = el('div', 'pwm-bar-row');
      const top = el('div', 'pwm-bar-top');
      top.append(el('span', null, b[0]), el('b', null, `${badW}% vs. ${okW}%`));
      const track = el('div', 'pwm-bar-track');
      const iBad = el('i', 'bad');
      iBad.style.width = `${badW}%`;
      const iOk = el('i', 'ok');
      iOk.style.width = `${okW}%`;
      track.append(iBad, iOk);
      row.append(top, track);
      barsEl.appendChild(row);
    });
  }
}

if (pwmRng) {
  pwmRng.addEventListener('input', updatePwmSim);
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
    document.getElementById('pwm-stand').textContent = d.stand;
    document.getElementById('pwm-gap').textContent = d.gap;
    document.getElementById('pwm-cin').textContent = d.cin;
    const barsHost = document.getElementById('pwm-bars');
    if (barsHost) {
      barsHost.textContent = '';
      d.bars.forEach((b) => {
        const row = el('div', 'pwm-bar-row');
        const top = el('div', 'pwm-bar-top');
        top.append(el('span', null, b[0]), el('b', null, b[1]));
        const svg = svgEl('svg', { viewBox: '0 0 200 14', class: 'pwm-dual-svg', 'aria-hidden': 'true' });
        svg.append(
          svgEl('rect', { x: 0, y: 0, width: 200, height: 5, rx: 2.5, fill: '#1a1e28' }),
          svgEl('rect', { x: 0, y: 0, width: Math.round(b[2] * 2), height: 5, rx: 2.5, fill: '#ef6a52' }),
          svgEl('rect', { x: 0, y: 8, width: 200, height: 5, rx: 2.5, fill: '#1a1e28' }),
          svgEl('rect', { x: 0, y: 8, width: Math.round(b[3] * 2), height: 5, rx: 2.5, fill: '#4fb3a8' })
        );
        row.append(top, svg);
        barsHost.appendChild(row);
      });
    }
  });
}
