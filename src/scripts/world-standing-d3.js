/* ==========================================================================
   world-standing-d3.js — D3.js v7 Interactive 2D Ecosystem Observatory
   & 7-Lens Pair Intelligence Unit-Economics Workbench
   ========================================================================== */
(function () {
  'use strict';

  var ACTORS = [
    {
      id: 'openai-cloud',
      name: 'OpenAI / Frontier Cloud API',
      shortLabel: 'OpenAI Cloud',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#ef6a52',
      r: 11,
      x2026: 19, y2026: 60,
      x2032_sq: 14, y2032_sq: 46,
      x2032_cin: 75, y2032_cin: 88,
      posture: 'Closed frontier API billing $15–$60/M tokens; trains on uncompensated public web craft while burning $5B–$15B/yr on hyperscale clusters.',
      risk: 'Open-weight distillation erodes closed API pricing power within 60–90 days; enterprise tenants face lock-in and workflow leakage.',
      cin: 'Shifts from raw token rent to verifying Proof-Carrying Code (Necula, 1997) with 85% direct + 10% lineage Data Shapley royalties (Ghorbani & Zou, 2019).',
      targetSec: '#sota-labs'
    },
    {
      id: 'anthropic-rsp',
      name: 'Anthropic / RSP Frontier Lab',
      shortLabel: 'Anthropic RSP',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#e07b42',
      r: 10,
      x2026: 35, y2026: 50,
      x2032_sq: 31, y2032_sq: 38,
      x2032_cin: 83, y2032_cin: 92,
      posture: 'Pioneered Responsible Scaling Policies (RSPs) and constitutional alignment, but remains bound to centralized cloud API equity economics.',
      risk: 'Voluntary lab pledges face competitive race pressure whenever rival clusters cross capability thresholds without protocol enforcement.',
      cin: 'Pairs constitutional alignment with hardware-enforced Capability-Bounded Execution Leases (Hinton, 2022) and local OCap sandboxes.',
      targetSec: '#sota-labs'
    },
    {
      id: 'deepmind-hyperscale',
      name: 'Google DeepMind / Hyperscale',
      shortLabel: 'DeepMind / Cloud',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#ef6a52',
      r: 11,
      x2026: 27, y2026: 36,
      x2032_sq: 22, y2032_sq: 24,
      x2032_cin: 79, y2032_cin: 76,
      posture: 'Vertically integrated TPU silicon, search distribution, and frontier science models (AlphaFold), monetized via cloud and ad ecosystems.',
      risk: 'Centralized cloud custody concentrates cognitive infrastructure into three corporate balance sheets, displacing independent software vendors.',
      cin: 'Routes specialized scientific weights over IETF QUIC (RFC 9000) with perpetual Data Shapley royalties to originating laboratories.',
      targetSec: '#sota-labs'
    },
    {
      id: 'meta-open-weights',
      name: 'Meta / Open-Weight Distillation',
      shortLabel: 'Open Weights (Llama)',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#e5a93c',
      r: 10,
      x2026: 30, y2026: 68,
      x2032_sq: 26, y2032_sq: 56,
      x2032_cin: 81, y2032_cin: 84,
      posture: 'Releases open-weight foundation models that commoditize rival closed APIs within 75 days, enabling local inference on consumer silicon.',
      risk: 'Provides $0 creator royalty attribution and zero runtime containment against autonomous swarm proliferation.',
      cin: 'Combines open base weights with local Low-Rank Adapters (Hu et al., 2022), 1-to-1 human hardware binding, and 95% Shapley royalties.',
      targetSec: '#sota-labs'
    },
    {
      id: 'eacc-swarms',
      name: 'Unbounded Acceleration (e/acc)',
      shortLabel: 'Raw e/acc Swarms',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#ef6a52',
      r: 9.5,
      x2026: 7, y2026: 12,
      x2032_sq: 4, y2032_sq: 6,
      x2032_cin: 69, y2032_cin: 64,
      posture: 'Advocates zero containment barriers and unrestricted autonomous machine swarms operating at 10^12 bits/s across public networks.',
      risk: 'Human biology (~40 bits/s conscious bandwidth, millennial evolution) is mathematically outcompeted and economically displaced.',
      cin: 'Contains machine-speed coordination inside the Agent-Only Internet behind a cryptographic Two-Internet airlock (Dennis & Van Horn, 1966).',
      targetSec: '#safety-labs'
    },
    {
      id: 'eval-institutes',
      name: 'METR / Redwood / Apollo / UK AISI',
      shortLabel: 'METR · Redwood · AISI',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#e5a93c',
      r: 10,
      x2026: 59, y2026: 64,
      x2032_sq: 57, y2032_sq: 50,
      x2032_cin: 80, y2032_cin: 94,
      posture: 'Measures 4.5-month task-horizon doubling (METR, 2026) and deceptive alignment via pre-deployment red-teaming and control benchmarks.',
      risk: 'Diagnostic scorecards lack a runtime physical or cryptographic enforcement layer once weights leave the lab.',
      cin: 'Translates evaluation tripwires directly into <10 ms silicon quorum gates and Capability-Bounded Execution Leases.',
      targetSec: '#safety-labs'
    },
    {
      id: 'cin-airlock',
      name: 'CIN Co-Intelligence Airlock (Zone 4)',
      shortLabel: 'CIN Last-Resort Airlock',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#4fb3a8',
      r: 12.5,
      x2026: 82, y2026: 95,
      x2032_sq: 84, y2032_sq: 96,
      x2032_cin: 87, y2032_cin: 97,
      posture: 'Structural last resort before a global moratorium: Two-Internet airlock, 1-to-1 human hardware bond, and mortal execution leases.',
      risk: 'Requires rapid voluntary adoption across clinics, universities, and co-ops before autonomous swarm externalities force a treaty freeze.',
      cin: 'Preserves frontier scientific progress while guaranteeing human biological sovereignty and 95% Data Shapley contributor royalties.',
      targetSec: '#safety-labs'
    },
    {
      id: 'hard-pause',
      name: 'Global Hard Compute Pause (Zone 5)',
      shortLabel: 'Global Hard Pause',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#5da2d5',
      r: 10,
      x2026: 94, y2026: 48,
      x2032_sq: 95, y2032_sq: 42,
      x2032_cin: 93, y2032_cin: 56,
      posture: 'International treaty moratorium freezing frontier GPU clusters, enforcing FLOP caps, and halting training runs above statutory thresholds.',
      risk: 'Requires intrusive global surveillance of consumer hardware and forfeits AI breakthroughs in oncology, energy, and ecological repair.',
      cin: 'Rendered unnecessary as a blunt shutdown if Zone 4 (CIN Co-Intelligence Airlock) contains autonomous swarms at the protocol layer.',
      targetSec: '#safety-labs'
    },
    {
      id: 'legislatures',
      name: 'National Legislatures & Regulators',
      shortLabel: 'Statutory Regulators',
      lens: 'governments',
      lensLabel: '3. Governments',
      color: '#ef6a52',
      r: 10.5,
      x2026: 54, y2026: 42,
      x2032_sq: 51, y2032_sq: 28,
      x2032_cin: 78, y2032_cin: 70,
      posture: 'Drafts statutory AI compliance frameworks on 18–36 month legislative cycles while frontier capabilities double every 4.5 months.',
      risk: 'By the time a statute takes effect, model task horizons have multiplied 16×–64×, leaving paper rules unenforceable at runtime.',
      cin: 'Replaces multi-year paper lag with <10 ms cryptographic quorum gates and power-proportionate zero-knowledge auditability.',
      targetSec: '#governments'
    },
    {
      id: 'state-treasuries',
      name: 'Municipal & Sovereign Tax Bases',
      shortLabel: 'Public Tax Treasuries',
      lens: 'governments',
      lensLabel: '3. Governments',
      color: '#e07b42',
      r: 9.5,
      x2026: 47, y2026: 28,
      x2032_sq: 44, y2032_sq: 16,
      x2032_cin: 76, y2032_cin: 62,
      posture: 'Relies on human payroll and income taxes for ~72% of civic revenue while automation compresses taxable wage shares.',
      risk: 'Severe fiscal deficit as cloud conglomerates concentrate capital outside local municipal tax jurisdictions.',
      cin: 'Stabilizes post-labor public finance via a $25,000 sovereign exemption floor and 2%/month demurrage recirculation on idle hoards.',
      targetSec: '#governments'
    },
    {
      id: 'public-universities',
      name: 'Public Universities & arXiv Labs',
      shortLabel: 'Public Universities',
      lens: 'universities',
      lensLabel: '4. Universities',
      color: '#5da2d5',
      r: 10.5,
      x2026: 43, y2026: 62,
      x2032_sq: 39, y2032_sq: 48,
      x2032_cin: 86, y2032_cin: 86,
      posture: 'Originates 88% of foundational architectures (Transformers, Diffusion, LoRA) on public grants while holding <1% of frontier GPUs.',
      risk: 'Commercial labs scrape arXiv preprints for $0 royalty while academic researchers face severe compute poverty and brain drain.',
      cin: 'Routes a 15% perpetual Data Shapley lineage endowment to originating university labs on every downstream task settlement.',
      targetSec: '#universities'
    },
    {
      id: 'academic-lora-mesh',
      name: 'Federated University TIES-LoRA Mesh',
      shortLabel: 'Academic LoRA Mesh',
      lens: 'universities',
      lensLabel: '4. Universities',
      color: '#4fb3a8',
      r: 9.5,
      x2026: 69, y2026: 54,
      x2032_sq: 71, y2032_sq: 58,
      x2032_cin: 82, y2032_cin: 66,
      posture: '500+ university groups co-training 18 MB rank-16 Low-Rank Adapters via TIES-Merging (Yadav et al., 2023) over IETF QUIC.',
      risk: 'Without structured schema compression, raw literature context windows waste 95% of academic GPU budgets.',
      cin: 'Uses SPRA Structured Paper Representation (Leng et al., 2026) to cut literature tokens by 95.3% (5,500 -> 260 tokens).',
      targetSec: '#universities'
    },
    {
      id: 'cloud-wrapper-corps',
      name: 'Cloud API Tenant Enterprises',
      shortLabel: 'Cloud API Tenants',
      lens: 'enterprise',
      lensLabel: '5. Enterprise',
      color: '#ef6a52',
      r: 10.5,
      x2026: 22, y2026: 18,
      x2032_sq: 17, y2032_sq: 10,
      x2032_cin: 77, y2032_cin: 68,
      posture: 'Streams proprietary ERP, clinical, and pricing workflows into third-party cloud APIs while paying 15%–40% GPO and SaaS middleman tolls.',
      risk: 'Fine-tuning prompts leak core trade secrets to cloud conglomerates, compressing enterprise operating margins by 18% over 5 years.',
      cin: 'Executes inside a local WebAssembly OCap sandbox (0 bytes leaked) and joins 500-firm Private Set Intersection buyer co-ops.',
      targetSec: '#enterprise'
    },
    {
      id: 'psi-buyer-coops',
      name: 'Sovereign Wasm + PSI Buyer Co-Ops',
      shortLabel: 'PSI Buyer Co-Ops',
      lens: 'enterprise',
      lensLabel: '5. Enterprise',
      color: '#4fb3a8',
      r: 10,
      x2026: 73, y2026: 70,
      x2032_sq: 75, y2032_sq: 74,
      x2032_cin: 84, y2032_cin: 78,
      posture: 'Independent clinics, credit unions, and SMBs matching overlapping supplier SKUs via Private Set Intersection (Freedman et al., 2004).',
      risk: 'Legacy Group Purchasing Organizations (GPOs) attempt contractual lock-in and opaque rebate bundling to block direct wholesale pricing.',
      cin: 'Unlocks 22%–34% direct wholesale discounts at 0% middleman fee while auditing CMS NCCI CPT billing errors locally.',
      targetSec: '#enterprise'
    },
    {
      id: 'commodity-cartels',
      name: 'Algorithmic Commodity & Buyer Cartels',
      shortLabel: 'AI Buyer Cartels',
      lens: 'human-adoption',
      lensLabel: '6. Global Workforce',
      color: '#ef6a52',
      r: 10,
      x2026: 11, y2026: 28,
      x2032_sq: 7, y2032_sq: 18,
      x2032_cin: 71, y2032_cin: 72,
      posture: 'Uses satellite and swarm forecasting to predict regional harvest gluts and force fire-sale pricing on uncoordinated physical producers.',
      risk: 'Extracts 30%–50% of trade surplus from the 4.8B+ non-digital global workforce across agriculture, mining, and construction.',
      cin: 'Counter-balanced by 10,000-producer Private Set Intersection supply cooperatives that enforce transparent reserve price floors.',
      targetSec: '#human-adoption'
    },
    {
      id: 'physical-workforce',
      name: '4.8B+ Physical & Rural Workforce',
      shortLabel: '4.8B Physical Workforce',
      lens: 'human-adoption',
      lensLabel: '6. Global Workforce',
      color: '#e5a93c',
      r: 12,
      x2026: 38, y2026: 16,
      x2032_sq: 33, y2032_sq: 8,
      x2032_cin: 85, y2032_cin: 74,
      posture: '60%+ of humanity working in physical trades, farming, caregiving, and craft without cloud subscriptions or high-bandwidth fiber.',
      risk: 'Faces severe terms-of-trade collapse ("The Intelligence Gambit") if frontier AI only serves digital knowledge conglomerates.',
      cin: 'Equips workers with $8 Pre-ADC hardware (Datta et al., 2022), offline voice twins on $45 phones, and 5D care/ecology value parity.',
      targetSec: '#human-adoption'
    },
    {
      id: 'cloud-token-renters',
      name: 'Unprofitable Cloud Token Renters',
      shortLabel: 'Cloud Token Burn',
      lens: 'pair-intelligence',
      lensLabel: '7. Pair vs. Cloud Economics',
      color: '#ef6a52',
      r: 9.5,
      x2026: 15, y2026: 44,
      x2032_sq: 11, y2032_sq: 32,
      x2032_cin: 73, y2032_cin: 80,
      posture: 'Competes on raw commodity token inference where $100B frontier training runs are distilled into open weights within 60–90 days.',
      risk: 'Retains only ~8% pricing power as marginal token prices collapse toward bare electricity cost (-$5B to -$15B/yr burn).',
      cin: 'Pivots from commodity cloud inference to local on-device LoRA specialization and verifiable cooperative settlement.',
      targetSec: '#pair-intelligence'
    },
    {
      id: 'human-lora-pair',
      name: '1-to-1 Human + Local LoRA Pair',
      shortLabel: '1-to-1 Pair Intelligence',
      lens: 'pair-intelligence',
      lensLabel: '7. Pair vs. Cloud Economics',
      color: '#4fb3a8',
      r: 12,
      x2026: 77, y2026: 84,
      x2032_sq: 80, y2032_sq: 86,
      x2032_cin: 86, y2032_cin: 90,
      posture: 'One biological human paired 1-to-1 with a local Low-Rank Adapter (Hu et al., 2022) accumulating 5–10 years of episodic craft memory.',
      risk: 'Zero cloud distillation vulnerability because private tacit judgment and local hardware keys never enter public training corpora.',
      cin: '96% uncopyable economic moat: combines human causal intent with machine execution speed inside a hardware-isolated OCap airlock.',
      targetSec: '#pair-intelligence'
    }
  ];

  var ZONES = [
    { x0: 0, x1: 24, label: '1. Raw Acceleration', sub: 'Unbounded Swarms', fill: 'rgba(239, 106, 82, 0.08)', stroke: '#ef6a52' },
    { x0: 24, x1: 48, label: '2. Cloud API Rent', sub: 'Self-Policed Labs', fill: 'rgba(224, 123, 66, 0.07)', stroke: '#e07b42' },
    { x0: 48, x1: 68, label: '3. Eval & Statute Lag', sub: 'Diagnostics Only', fill: 'rgba(229, 169, 60, 0.07)', stroke: '#e5a93c' },
    { x0: 68, x1: 88, label: '4. CIN Co-Intelligence', sub: 'Last Resort Airlock', fill: 'rgba(79, 179, 168, 0.16)', stroke: '#4fb3a8', highlight: true },
    { x0: 88, x1: 100, label: '5. Hard Pause', sub: 'Global GPU Freeze', fill: 'rgba(93, 162, 213, 0.09)', stroke: '#5da2d5' }
  ];

  function initEcosystemD3() {
    var d3 = window.d3;
    var svgEl = document.getElementById('ws-ecosystem-svg');
    if (!d3 || !svgEl) return;

    var state = {
      lens: 'all',
      year: 2028,
      cinActive: false,
      selectedId: 'cin-airlock'
    };

    var width = 860;
    var height = 420;
    var margin = { top: 52, right: 26, bottom: 48, left: 58 };

    var x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    var y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    var svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Background frame
    svg.append('rect')
      .attr('x', 4)
      .attr('y', 4)
      .attr('width', width - 8)
      .attr('height', height - 8)
      .attr('rx', 14)
      .attr('fill', '#12151c')
      .attr('stroke', '#2a2f3a')
      .attr('stroke-width', 1.5);

    // Arrowhead markers
    var defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'ws-arrow-sq')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#ef6a52');

    defs.append('marker')
      .attr('id', 'ws-arrow-cin')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#4fb3a8');

    // Regime bands
    var zoneGroup = svg.append('g').attr('class', 'ws-zones');
    ZONES.forEach(function (z) {
      var zx0 = x(z.x0);
      var zx1 = x(z.x1);
      zoneGroup.append('rect')
        .attr('x', zx0)
        .attr('y', margin.top)
        .attr('width', zx1 - zx0)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', z.fill)
        .attr('stroke', z.highlight ? '#4fb3a8' : '#252a34')
        .attr('stroke-width', z.highlight ? 1.8 : 1)
        .attr('stroke-dasharray', z.highlight ? '5 3' : null);

      zoneGroup.append('text')
        .attr('x', (zx0 + zx1) / 2)
        .attr('y', 24)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.5)
        .attr('font-weight', 700)
        .attr('fill', z.stroke)
        .text(z.label);

      zoneGroup.append('text')
        .attr('x', (zx0 + zx1) / 2)
        .attr('y', 38)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'system-ui, sans-serif')
        .attr('font-size', 9)
        .attr('fill', '#9aa3b2')
        .text(z.sub);
    });

    // Horizontal sovereignty grid lines
    var yTicks = [20, 40, 60, 80, 100];
    var gridGroup = svg.append('g').attr('class', 'ws-grid');
    yTicks.forEach(function (tv) {
      gridGroup.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(tv))
        .attr('y2', y(tv))
        .attr('stroke', tv === 50 ? '#3a4150' : '#222733')
        .attr('stroke-dasharray', '3 3');
    });

    // Axes
    var xAxis = d3.axisBottom(x).ticks(5).tickFormat(function (d) { return d + '%'; });
    var yAxis = d3.axisLeft(y).tickValues([0, 25, 50, 75, 100]).tickFormat(function (d) { return d + '%'; });

    svg.append('g')
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis)
      .attr('color', '#8c95a6')
      .selectAll('text')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-size', 9.5);

    svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .call(yAxis)
      .attr('color', '#8c95a6')
      .selectAll('text')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-size', 9.5);

    // Axis titles
    svg.append('text')
      .attr('x', (margin.left + width - margin.right) / 2)
      .attr('y', height - 12)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('fill', '#d5d9e2')
      .text('DEPLOYMENT & CONTAINMENT POSTURE (0% = Unbounded Swarms → 82% = CIN Airlock → 95% = Global Pause)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + height - margin.bottom) / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('fill', '#4fb3a8')
      .text('↑ HUMAN BIOLOGICAL & ECONOMIC SOVEREIGNTY (%)');

    var linksLayer = svg.append('g').attr('class', 'ws-vectors');
    var ghostsLayer = svg.append('g').attr('class', 'ws-ghosts');
    var nodesLayer = svg.append('g').attr('class', 'ws-nodes');

    function getActorPos(d) {
      var t = (state.year - 2026) / 6;
      var tx = state.cinActive ? d.x2032_cin : d.x2032_sq;
      var ty = state.cinActive ? d.y2032_cin : d.y2032_sq;
      return {
        x0: x(d.x2026),
        y0: y(d.y2026),
        cx: x(d.x2026 + (tx - d.x2026) * t),
        cy: y(d.y2026 + (ty - d.y2026) * t)
      };
    }

    function isMatch(d) {
      return state.lens === 'all' || d.lens === state.lens;
    }

    function updateInspector(actor) {
      if (!actor) return;
      var titleEl = document.getElementById('ws-insp-title');
      var lensEl = document.getElementById('ws-insp-lens');
      var linkEl = document.getElementById('ws-insp-link');
      var posEl = document.getElementById('ws-insp-posture');
      var riskEl = document.getElementById('ws-insp-risk');
      var cinEl = document.getElementById('ws-insp-cin');
      if (titleEl) titleEl.textContent = actor.name;
      if (lensEl) lensEl.textContent = actor.lensLabel;
      if (linkEl) {
        linkEl.setAttribute('href', actor.targetSec);
        linkEl.textContent = 'Jump to ' + actor.lensLabel + ' section ↓';
      }
      if (posEl) posEl.textContent = actor.posture;
      if (riskEl) riskEl.textContent = actor.risk;
      if (cinEl) cinEl.textContent = actor.cin;
    }

    // Create vector paths
    var vectorPaths = linksLayer.selectAll('path.ws-vec')
      .data(ACTORS, function (d) { return d.id; })
      .enter()
      .append('path')
      .attr('class', 'ws-vec')
      .attr('fill', 'none');

    // Create 2026 baseline ghost rings
    var ghostDots = ghostsLayer.selectAll('circle.ws-ghost')
      .data(ACTORS, function (d) { return d.id; })
      .enter()
      .append('circle')
      .attr('class', 'ws-ghost')
      .attr('r', 3.2)
      .attr('cx', function (d) { return x(d.x2026); })
      .attr('cy', function (d) { return y(d.y2026); })
      .attr('fill', '#6d7585')
      .attr('opacity', 0.55);

    // Create interactive actor groups
    var nodeGroups = nodesLayer.selectAll('g.ws-node')
      .data(ACTORS, function (d) { return d.id; })
      .enter()
      .append('g')
      .attr('class', 'ws-node')
      .style('cursor', 'pointer')
      .on('click', function (event, d) {
        state.selectedId = d.id;
        updateInspector(d);
        render(true);
      });

    // Outer pulse ring for selected actor
    nodeGroups.append('circle')
      .attr('class', 'ws-halo')
      .attr('r', function (d) { return d.r + 5.5; })
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Main actor circle
    nodeGroups.append('circle')
      .attr('class', 'ws-bubble')
      .attr('r', function (d) { return d.r; })
      .attr('stroke', '#12151c')
      .attr('stroke-width', 1.6);

    // Actor label
    nodeGroups.append('text')
      .attr('class', 'ws-label')
      .attr('dy', function (d, i) { return (i % 2 === 0) ? -(d.r + 5) : (d.r + 12); })
      .attr('text-anchor', 'middle')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('font-size', 9.5)
      .attr('font-weight', 700)
      .attr('fill', '#e9e6de')
      .text(function (d) { return d.shortLabel; });

    function render(animate) {
      var dur = animate ? 420 : 0;

      vectorPaths.transition().duration(dur)
        .attr('d', function (d) {
          var p = getActorPos(d);
          var dx = p.cx - p.x0;
          var dy = p.cy - p.y0;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 4) return 'M' + p.x0 + ',' + p.y0 + 'L' + p.cx + ',' + p.cy;
          var mx = (p.x0 + p.cx) / 2;
          var my = (p.y0 + p.cy) / 2 - 14;
          return 'M' + p.x0 + ',' + p.y0 + 'Q' + mx + ',' + my + ' ' + p.cx + ',' + p.cy;
        })
        .attr('stroke', function (d) {
          return (state.cinActive || d.color === '#4fb3a8') ? '#4fb3a8' : '#ef6a52';
        })
        .attr('stroke-width', function (d) {
          return d.id === state.selectedId ? 2.6 : 1.5;
        })
        .attr('stroke-dasharray', function (d) {
          return state.cinActive ? null : '4 3';
        })
        .attr('marker-end', function (d) {
          return (state.cinActive || d.color === '#4fb3a8') ? 'url(#ws-arrow-cin)' : 'url(#ws-arrow-sq)';
        })
        .attr('opacity', function (d) {
          if (!isMatch(d)) return 0.08;
          return d.id === state.selectedId ? 0.98 : 0.55;
        });

      ghostDots.transition().duration(dur)
        .attr('opacity', function (d) { return isMatch(d) ? 0.55 : 0.1; });

      nodeGroups.transition().duration(dur)
        .attr('transform', function (d) {
          var p = getActorPos(d);
          return 'translate(' + p.cx.toFixed(1) + ',' + p.cy.toFixed(1) + ')';
        })
        .attr('opacity', function (d) {
          return isMatch(d) ? 1 : 0.16;
        });

      nodeGroups.select('.ws-halo')
        .attr('opacity', function (d) { return d.id === state.selectedId ? 1 : 0; })
        .attr('stroke', function (d) { return state.cinActive ? '#4fb3a8' : '#f1c76b'; });

      nodeGroups.select('.ws-bubble')
        .attr('fill', function (d) {
          return state.cinActive && d.id !== 'hard-pause' ? '#4fb3a8' : d.color;
        });

      nodeGroups.select('.ws-label')
        .attr('fill', function (d) {
          return d.id === state.selectedId ? '#ffffff' : '#d5d9e2';
        });
    }

    // Bind Filter Pills
    var filterBtns = document.querySelectorAll('[data-ws-filter]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lens = btn.getAttribute('data-ws-filter') || 'all';
        state.lens = lens;
        filterBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        var firstMatch = ACTORS.find(function (a) { return lens === 'all' || a.lens === lens; });
        if (firstMatch) {
          state.selectedId = firstMatch.id;
          updateInspector(firstMatch);
        }
        render(true);
      });
    });

    // Bind Year Slider
    var yearSlider = document.getElementById('ws-year-slider');
    var yearVal = document.getElementById('ws-year-val');
    if (yearSlider) {
      yearSlider.addEventListener('input', function () {
        state.year = Number(yearSlider.value);
        if (yearVal) yearVal.textContent = String(state.year);
        render(false);
      });
    }

    // Bind CIN Architecture Toggle Button
    var cinToggle = document.getElementById('ws-cin-toggle');
    if (cinToggle) {
      cinToggle.addEventListener('click', function () {
        state.cinActive = !state.cinActive;
        cinToggle.setAttribute('aria-pressed', state.cinActive ? 'true' : 'false');
        cinToggle.textContent = state.cinActive
          ? 'CIN Co-Intelligence Architecture: ACTIVE (Zone 4 Shift)'
          : 'Toggle CIN Co-Intelligence Architecture: OFF (Status Quo)';
        render(true);
      });
    }

    var initialActor = ACTORS.find(function (a) { return a.id === state.selectedId; }) || ACTORS[0];
    updateInspector(initialActor);
    render(false);
  }

  function initPairMoatSimulator() {
    var dRng = document.getElementById('pm-distill');
    var yRng = document.getElementById('pm-years');
    if (!dRng || !yRng) return;

    function upd() {
      var d = Number(dRng.value);
      var y = Number(yRng.value);
      var dVal = document.getElementById('pm-distill-val');
      var yVal = document.getElementById('pm-years-val');
      var cMoat = document.getElementById('pm-cloud-moat');
      var pMoat = document.getElementById('pm-pair-moat');
      var svgLabel = document.getElementById('pm-svg-dynamic-label');
      var pairBar = document.getElementById('pm-svg-pair-bar');
      var cloudBar = document.getElementById('pm-svg-cloud-bar');

      if (dVal) dVal.textContent = d + ' Days';
      if (yVal) yVal.textContent = y + (y === 1 ? ' Year' : ' Years');

      var cloudMoat = Math.max(3, Math.min(45, Math.round(d / 9)));
      var pairMoat = Math.min(99, 76 + y * 4);

      if (cMoat) cMoat.textContent = cloudMoat + '% Pricing Power';
      if (pMoat) pMoat.textContent = pairMoat + '% Uncopyable Moat';
      if (svgLabel) {
        svgLabel.textContent = 'Live Readout: ' + pairMoat + '% Pair Moat (' + y + ' yr LoRA) vs. ' + cloudMoat + '% Cloud Pricing (' + d + 'd distillation)';
      }
      if (pairBar) {
        pairBar.setAttribute('width', String(Math.round(pairMoat * 3.1)));
      }
      if (cloudBar) {
        cloudBar.setAttribute('width', String(Math.max(18, Math.round(cloudMoat * 3.1))));
      }
    }

    dRng.addEventListener('input', upd);
    yRng.addEventListener('input', upd);
    upd();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initEcosystemD3();
      initPairMoatSimulator();
    });
  } else {
    initEcosystemD3();
    initPairMoatSimulator();
  }
})();
