/* ==========================================================================
   world-standing-d3.js — D3.js v7 Interactive 2D Ecosystem Observatory
   & 3-Mode Co-Intelligence vs. Extraction Lab (Value Flow, Bandwidth, Pair Moat)
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
      r: 10.5,
      x2026: 16, y2026: 64,
      x2032_sq: 12, y2032_sq: 52,
      x2032_cin: 70, y2032_cin: 88,
      posture: 'Closed frontier API billing $15–$60/M tokens; trains on uncompensated public web craft while burning $5B–$15B/yr on hyperscale clusters.',
      risk: 'Open-weight distillation erodes closed API pricing power within 60–90 days; enterprise tenants face lock-in and workflow leakage.',
      cin: 'Shifts from raw token rent to verifying Proof-Carrying Code (Necula, 1997) with 85% direct + 10% lineage Data Shapley royalties (Ghorbani & Zou, 2019).',
      targetSec: '#lens-1-sota-labs'
    },
    {
      id: 'anthropic-rsp',
      name: 'Anthropic / RSP Frontier Lab',
      shortLabel: 'Anthropic RSP',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#e07b42',
      r: 10,
      x2026: 36, y2026: 52,
      x2032_sq: 32, y2032_sq: 42,
      x2032_cin: 78, y2032_cin: 92,
      posture: 'Pioneered Responsible Scaling Policies (RSPs) and constitutional alignment, but remains bound to centralized cloud API equity economics.',
      risk: 'Voluntary lab pledges face competitive race pressure whenever rival clusters cross capability thresholds without protocol enforcement.',
      cin: 'Pairs constitutional alignment with hardware-enforced Capability-Bounded Execution Leases (Hinton, 2022) and local OCap sandboxes.',
      targetSec: '#lens-1-sota-labs'
    },
    {
      id: 'deepmind-hyperscale',
      name: 'Google DeepMind / Hyperscale',
      shortLabel: 'DeepMind Cloud',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#ef6a52',
      r: 10.5,
      x2026: 26, y2026: 34,
      x2032_sq: 22, y2032_sq: 24,
      x2032_cin: 70, y2032_cin: 72,
      posture: 'Vertically integrated TPU silicon, search distribution, and frontier science models (AlphaFold), monetized via cloud and ad ecosystems.',
      risk: 'Centralized cloud custody concentrates cognitive infrastructure into three corporate balance sheets, displacing independent software vendors.',
      cin: 'Routes specialized scientific weights over IETF QUIC (RFC 9000) with perpetual Data Shapley royalties to originating laboratories.',
      targetSec: '#lens-1-sota-labs'
    },
    {
      id: 'meta-open-weights',
      name: 'Meta / Open-Weight Distillation',
      shortLabel: 'Open Weights',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#e5a93c',
      r: 10,
      x2026: 31, y2026: 76,
      x2032_sq: 28, y2032_sq: 68,
      x2032_cin: 78, y2032_cin: 76,
      posture: 'Releases open-weight foundation models that commoditize rival closed APIs within 75 days, enabling local inference on consumer silicon.',
      risk: 'Provides $0 creator royalty attribution and zero runtime containment against autonomous swarm proliferation.',
      cin: 'Combines open base weights with local Low-Rank Adapters (Hu et al., 2022), 1-to-1 human hardware binding, and 95% Shapley royalties.',
      targetSec: '#lens-1-sota-labs'
    },
    {
      id: 'eacc-swarms',
      name: 'Unbounded Acceleration (e/acc)',
      shortLabel: 'Raw e/acc Swarms',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#ef6a52',
      r: 9.5,
      x2026: 6, y2026: 12,
      x2032_sq: 4, y2032_sq: 6,
      x2032_cin: 69, y2032_cin: 14,
      posture: 'Advocates zero containment barriers and unrestricted autonomous machine swarms operating at 10^12 bits/s across public networks.',
      risk: 'Human biology (~40 bits/s conscious bandwidth, 25-year generation) is mathematically outcompeted and economically displaced.',
      cin: 'Contains machine-speed coordination inside the Agent-Only Internet behind a cryptographic Two-Internet airlock (Dennis & Van Horn, 1966).',
      targetSec: '#lens-2-safety-pause'
    },
    {
      id: 'eval-institutes',
      name: 'METR / Redwood / Apollo / UK AISI',
      shortLabel: 'METR & AISI Evals',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#e5a93c',
      r: 10,
      x2026: 60, y2026: 68,
      x2032_sq: 58, y2032_sq: 56,
      x2032_cin: 70, y2032_cin: 56,
      posture: 'Measures 4.5-month task-horizon doubling (METR, 2026) and deceptive alignment via pre-deployment red-teaming and control benchmarks.',
      risk: 'Diagnostic scorecards lack a runtime physical or cryptographic enforcement layer once weights leave the lab.',
      cin: 'Translates evaluation tripwires directly into <10 ms silicon quorum gates and Capability-Bounded Execution Leases.',
      targetSec: '#lens-2-safety-pause'
    },
    {
      id: 'cin-airlock',
      name: 'CIN Co-Intelligence Airlock (Zone 4)',
      shortLabel: 'CIN Airlock (Zone 4)',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#4fb3a8',
      r: 12,
      x2026: 83, y2026: 95,
      x2032_sq: 84, y2032_sq: 96,
      x2032_cin: 86, y2032_cin: 96,
      posture: 'Structural last resort before a global moratorium: Two-Internet airlock, 1-to-1 human hardware bond, and 24-hour mortal execution leases.',
      risk: 'Requires rapid voluntary adoption across clinics, universities, and co-ops before autonomous swarm externalities force a treaty freeze.',
      cin: 'Preserves frontier scientific progress while guaranteeing human biological sovereignty and 95% Data Shapley contributor royalties.',
      targetSec: '#lens-2-safety-pause'
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
      x2032_cin: 95, y2032_cin: 48,
      posture: 'International treaty moratorium freezing frontier GPU clusters, enforcing FLOP caps, and halting training runs above statutory thresholds.',
      risk: 'Requires intrusive global surveillance of consumer hardware and forfeits AI breakthroughs in oncology, energy, and ecological repair.',
      cin: 'Rendered unnecessary as a blunt shutdown if Zone 4 (CIN Co-Intelligence Airlock) contains autonomous swarms at the protocol layer.',
      targetSec: '#lens-2-safety-pause'
    },
    {
      id: 'legislatures',
      name: 'National Legislatures & Regulators',
      shortLabel: 'Statutory Regulators',
      lens: 'governments',
      lensLabel: '3. Governments',
      color: '#ef6a52',
      r: 10,
      x2026: 56, y2026: 42,
      x2032_sq: 54, y2032_sq: 30,
      x2032_cin: 78, y2032_cin: 60,
      posture: 'Drafts statutory AI compliance frameworks on 18–36 month legislative cycles while frontier capabilities double every 4.5 months.',
      risk: 'By the time a statute takes effect, model task horizons have multiplied 16×–64×, leaving paper rules unenforceable at runtime.',
      cin: 'Replaces multi-year paper lag with <10 ms cryptographic quorum gates and power-proportionate zero-knowledge auditability.',
      targetSec: '#lens-3-governments'
    },
    {
      id: 'state-treasuries',
      name: 'Municipal & Sovereign Tax Bases',
      shortLabel: 'Public Treasuries',
      lens: 'governments',
      lensLabel: '3. Governments',
      color: '#e07b42',
      r: 9.5,
      x2026: 50, y2026: 22,
      x2032_sq: 48, y2032_sq: 12,
      x2032_cin: 70, y2032_cin: 40,
      posture: 'Relies on human payroll and income taxes for ~72% of civic revenue while automation compresses taxable wage shares.',
      risk: 'Severe fiscal deficit as cloud conglomerates concentrate capital outside local municipal tax jurisdictions.',
      cin: 'Stabilizes post-labor public finance via a $25,000 sovereign exemption floor and 2%/month demurrage recirculation on idle hoards.',
      targetSec: '#lens-3-governments'
    },
    {
      id: 'public-universities',
      name: 'Public Universities & arXiv Labs',
      shortLabel: 'Public Universities',
      lens: 'universities',
      lensLabel: '4. Universities',
      color: '#5da2d5',
      r: 10,
      x2026: 44, y2026: 66,
      x2032_sq: 41, y2032_sq: 54,
      x2032_cin: 86, y2032_cin: 80,
      posture: 'Originates 88% of foundational architectures (Transformers, Diffusion, LoRA) on public grants while holding <1% of frontier GPUs.',
      risk: 'Commercial labs scrape arXiv preprints for $0 royalty while academic researchers face severe compute poverty and brain drain.',
      cin: 'Routes a perpetual Data Shapley lineage endowment to originating university labs on every downstream task settlement.',
      targetSec: '#lens-4-universities'
    },
    {
      id: 'academic-lora-mesh',
      name: 'Federated University TIES-LoRA Mesh',
      shortLabel: 'Academic LoRA Mesh',
      lens: 'universities',
      lensLabel: '4. Universities',
      color: '#4fb3a8',
      r: 9.5,
      x2026: 70, y2026: 52,
      x2032_sq: 71, y2032_sq: 56,
      x2032_cin: 86, y2032_cin: 64,
      posture: '500+ university groups co-training 18 MB rank-16 Low-Rank Adapters via TIES-Merging (Yadav et al., 2023) over IETF QUIC.',
      risk: 'Without structured schema compression, raw literature context windows waste 95% of academic GPU budgets.',
      cin: 'Uses SPRA Structured Paper Representation (Leng et al., 2026) to cut literature tokens by 95.3% (5,500 -> 260 tokens).',
      targetSec: '#lens-4-universities'
    },
    {
      id: 'cloud-wrapper-corps',
      name: 'Cloud API Tenant Enterprises',
      shortLabel: 'Cloud API Tenants',
      lens: 'enterprise',
      lensLabel: '5. Enterprise',
      color: '#ef6a52',
      r: 10,
      x2026: 22, y2026: 16,
      x2032_sq: 18, y2032_sq: 10,
      x2032_cin: 78, y2032_cin: 44,
      posture: 'Streams proprietary ERP, clinical, and pricing workflows into third-party cloud APIs while paying 32% SaaS, PBM, and GPO middleman tolls.',
      risk: 'Fine-tuning prompts leak core trade secrets to cloud conglomerates, compressing enterprise operating margins over 5 years.',
      cin: 'Executes inside a local WebAssembly OCap sandbox (0 bytes leaked) and joins 500-firm Private Set Intersection buyer co-ops.',
      targetSec: '#lens-5-enterprise'
    },
    {
      id: 'psi-buyer-coops',
      name: 'Sovereign Wasm + PSI Buyer Co-Ops',
      shortLabel: 'PSI Buyer Co-Ops',
      lens: 'enterprise',
      lensLabel: '5. Enterprise',
      color: '#4fb3a8',
      r: 10,
      x2026: 74, y2026: 68,
      x2032_sq: 75, y2032_sq: 72,
      x2032_cin: 86, y2032_cin: 48,
      posture: 'Independent clinics, credit unions, and SMBs matching overlapping supplier SKUs via Private Set Intersection (Freedman et al., 2004).',
      risk: 'Legacy Group Purchasing Organizations (GPOs) attempt contractual lock-in and opaque rebate bundling to block direct wholesale pricing.',
      cin: 'Unlocks 22%–34% direct wholesale discounts at 0% middleman fee while auditing CMS NCCI CPT billing errors locally.',
      targetSec: '#lens-5-enterprise'
    },
    {
      id: 'commodity-cartels',
      name: 'Algorithmic Commodity & Buyer Cartels',
      shortLabel: 'AI Buyer Cartels',
      lens: 'human-adoption',
      lensLabel: '6. Global Workforce',
      color: '#ef6a52',
      r: 10,
      x2026: 10, y2026: 30,
      x2032_sq: 7, y2032_sq: 20,
      x2032_cin: 70, y2032_cin: 26,
      posture: 'Uses satellite and swarm forecasting to predict regional harvest gluts and force fire-sale pricing on uncoordinated physical producers.',
      risk: 'Collapses unshielded physical producer trade share from 78% to 24% across the 4.8B non-digital global workforce.',
      cin: 'Counter-balanced by 10,000-producer Private Set Intersection supply cooperatives that enforce transparent reserve price floors.',
      targetSec: '#lens-6-workforce'
    },
    {
      id: 'physical-workforce',
      name: '4.8B+ Physical & Rural Workforce',
      shortLabel: '4.8B Workforce',
      lens: 'human-adoption',
      lensLabel: '6. Global Workforce',
      color: '#e5a93c',
      r: 11.5,
      x2026: 38, y2026: 12,
      x2032_sq: 34, y2032_sq: 6,
      x2032_cin: 78, y2032_cin: 28,
      posture: '4.8B+ workers in physical trades, farming, caregiving, and craft without cloud subscriptions or high-bandwidth fiber.',
      risk: 'Faces severe terms-of-trade collapse (78% -> 24% share) if frontier AI only serves digital knowledge conglomerates.',
      cin: 'Equips workers with $8 Pre-ADC hardware (Datta et al., 2022), offline voice twins on $45 phones, and 5D care/ecology value parity.',
      targetSec: '#lens-6-workforce'
    },
    {
      id: 'cloud-token-renters',
      name: 'Unprofitable Cloud Token Renters',
      shortLabel: 'Cloud Token Burn',
      lens: 'pair-intelligence',
      lensLabel: '7. Pair vs. Cloud Economics',
      color: '#ef6a52',
      r: 9.5,
      x2026: 14, y2026: 46,
      x2032_sq: 10, y2032_sq: 36,
      x2032_cin: 86, y2032_cin: 32,
      posture: 'Competes on raw commodity token inference where $100B frontier training runs are distilled into open weights within 60–90 days.',
      risk: 'Retains only 4% commodity backbone share as marginal token prices collapse toward bare electricity cost (-$5B to -$15B/yr burn).',
      cin: 'Pivots from commodity cloud inference to local on-device LoRA specialization and verifiable cooperative settlement.',
      targetSec: '#lens-7-pair-economy'
    },
    {
      id: 'human-lora-pair',
      name: '1-to-1 Human + Local LoRA Pair',
      shortLabel: '1-to-1 Pair Moat',
      lens: 'pair-intelligence',
      lensLabel: '7. Pair vs. Cloud Economics',
      color: '#4fb3a8',
      r: 11.5,
      x2026: 76, y2026: 82,
      x2032_sq: 79, y2032_sq: 84,
      x2032_cin: 86, y2032_cin: 16,
      posture: 'One biological human paired 1-to-1 with a local Low-Rank Adapter (Hu et al., 2022) accumulating 10 years of episodic craft memory.',
      risk: 'Zero cloud distillation vulnerability because private tacit judgment and local hardware keys never enter public training corpora.',
      cin: '96% uncopyable economic moat by Year 10 (34% tacit craft + 32% episodic memory + 30% on-device rank-16 LoRA weights).',
      targetSec: '#lens-7-pair-economy'
    }
  ];

  var ZONES = [
    { x0: 0, x1: 24, label: '1. Raw Acceleration', sub: 'Unbounded Swarms', fill: 'rgba(239, 106, 82, 0.08)', stroke: '#ef6a52' },
    { x0: 24, x1: 48, label: '2. Cloud API Rent', sub: 'Self-Policed Labs', fill: 'rgba(224, 123, 66, 0.07)', stroke: '#e07b42' },
    { x0: 48, x1: 68, label: '3. Eval & Statute Lag', sub: 'Diagnostics Only', fill: 'rgba(229, 169, 60, 0.07)', stroke: '#e5a93c' },
    { x0: 68, x1: 88, label: '4. CIN Co-Intelligence', sub: 'Last Resort Airlock', fill: 'rgba(79, 179, 168, 0.16)', stroke: '#4fb3a8', highlight: true },
    { x0: 88, x1: 100, label: '5. Hard Pause', sub: 'Global GPU Freeze', fill: 'rgba(93, 162, 213, 0.09)', stroke: '#5da2d5' }
  ];

  /* Deterministic non-overlapping label placement solver for #ws-ecosystem-svg */
  function computeLabelOffsets(positions, plotLeft, plotRight, plotTop, plotBottom) {
    var candidates = [
      { dx: 0, dy: -15, anchor: 'middle' },
      { dx: 0, dy: 21, anchor: 'middle' },
      { dx: 14, dy: 4, anchor: 'start' },
      { dx: -14, dy: 4, anchor: 'end' },
      { dx: 0, dy: -26, anchor: 'middle' },
      { dx: 0, dy: 31, anchor: 'middle' },
      { dx: 16, dy: -10, anchor: 'start' },
      { dx: -16, dy: -10, anchor: 'end' },
      { dx: 16, dy: 14, anchor: 'start' },
      { dx: -16, dy: 14, anchor: 'end' }
    ];

    var placedBoxes = [];
    var results = {};

    // Sort actors by y ascending so top labels lock first
    var sorted = positions.slice().sort(function (a, b) { return a.cy - b.cy; });

    sorted.forEach(function (item) {
      var w = item.d.shortLabel.length * 5.5 + 6;
      var h = 11.5;
      var best = null;
      var bestPenalty = 1e9;

      candidates.forEach(function (cand) {
        var lx = item.cx + cand.dx;
        var ly = item.cy + cand.dy;
        var x1 = cand.anchor === 'middle' ? lx - w / 2 : (cand.anchor === 'start' ? lx : lx - w);
        var x2 = x1 + w;
        var y1 = ly - h + 2;
        var y2 = ly + 2;

        var penalty = 0;
        if (x1 < plotLeft + 2) penalty += (plotLeft + 2 - x1) * 20;
        if (x2 > plotRight - 2) penalty += (x2 - (plotRight - 2)) * 20;
        if (y1 < plotTop + 2) penalty += (plotTop + 2 - y1) * 20;
        if (y2 > plotBottom - 2) penalty += (y2 - (plotBottom - 2)) * 20;

        // Avoid overlapping any actor bubble
        positions.forEach(function (other) {
          var br = other.d.r + 2;
          var bx1 = other.cx - br;
          var bx2 = other.cx + br;
          var by1 = other.cy - br;
          var by2 = other.cy + br;
          if (!(x2 < bx1 || bx2 < x1 || y2 < by1 || by2 < y1)) {
            penalty += 500;
          }
        });

        // Avoid overlapping already placed labels
        placedBoxes.forEach(function (pb) {
          if (!(x2 + 3 < pb.x1 || pb.x2 + 3 < x1 || y2 + 2 < pb.y1 || pb.y2 + 2 < y1)) {
            penalty += 2000;
          }
        });

        if (penalty < bestPenalty) {
          bestPenalty = penalty;
          best = { dx: cand.dx, dy: cand.dy, anchor: cand.anchor, x1: x1, x2: x2, y1: y1, y2: y2 };
        }
      });

      placedBoxes.push(best);
      results[item.d.id] = best;
    });

    return results;
  }

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

    svg.append('rect')
      .attr('x', 4)
      .attr('y', 4)
      .attr('width', width - 8)
      .attr('height', height - 8)
      .attr('rx', 14)
      .attr('fill', '#12151c')
      .attr('stroke', '#2a2f3a')
      .attr('stroke-width', 1.5);

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
        d: d,
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
        linkEl.textContent = 'Jump to ' + actor.lensLabel + ' ↓';
      }
      if (posEl) posEl.textContent = actor.posture;
      if (riskEl) riskEl.textContent = actor.risk;
      if (cinEl) cinEl.textContent = actor.cin;
    }

    var vectorPaths = linksLayer.selectAll('path.ws-vec')
      .data(ACTORS, function (d) { return d.id; })
      .enter()
      .append('path')
      .attr('class', 'ws-vec')
      .attr('fill', 'none');

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

    nodeGroups.append('circle')
      .attr('class', 'ws-halo')
      .attr('r', function (d) { return d.r + 5; })
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    nodeGroups.append('circle')
      .attr('class', 'ws-bubble')
      .attr('r', function (d) { return d.r; })
      .attr('stroke', '#12151c')
      .attr('stroke-width', 1.6);

    nodeGroups.append('text')
      .attr('class', 'ws-label')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('font-size', 9.2)
      .attr('font-weight', 700)
      .attr('fill', '#e9e6de')
      .text(function (d) { return d.shortLabel; });

    function render(animate) {
      var dur = animate ? 380 : 0;
      var positions = ACTORS.map(getActorPos);
      var posById = {};
      positions.forEach(function (p) { posById[p.d.id] = p; });
      var labelOffsets = computeLabelOffsets(positions, margin.left, width - margin.right, margin.top, height - margin.bottom);

      vectorPaths.transition().duration(dur)
        .attr('d', function (d) {
          var p = posById[d.id];
          var dx = p.cx - p.x0;
          var dy = p.cy - p.y0;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 4) return 'M' + p.x0 + ',' + p.y0 + 'L' + p.cx + ',' + p.cy;
          var mx = (p.x0 + p.cx) / 2;
          var my = (p.y0 + p.cy) / 2 - 12;
          return 'M' + p.x0 + ',' + p.y0 + 'Q' + mx + ',' + my + ' ' + p.cx + ',' + p.cy;
        })
        .attr('stroke', function (d) {
          return (state.cinActive || d.color === '#4fb3a8') ? '#4fb3a8' : '#ef6a52';
        })
        .attr('stroke-width', function (d) {
          return d.id === state.selectedId ? 2.5 : 1.4;
        })
        .attr('stroke-dasharray', function (d) {
          return state.cinActive ? null : '4 3';
        })
        .attr('marker-end', function (d) {
          return (state.cinActive || d.color === '#4fb3a8') ? 'url(#ws-arrow-cin)' : 'url(#ws-arrow-sq)';
        })
        .attr('opacity', function (d) {
          if (!isMatch(d)) return 0.08;
          return d.id === state.selectedId ? 0.96 : 0.52;
        });

      ghostDots.transition().duration(dur)
        .attr('opacity', function (d) { return isMatch(d) ? 0.55 : 0.1; });

      nodeGroups.transition().duration(dur)
        .attr('transform', function (d) {
          var p = posById[d.id];
          return 'translate(' + p.cx.toFixed(1) + ',' + p.cy.toFixed(1) + ')';
        })
        .attr('opacity', function (d) {
          return isMatch(d) ? 1 : 0.15;
        });

      nodeGroups.select('.ws-halo')
        .attr('opacity', function (d) { return d.id === state.selectedId ? 1 : 0; })
        .attr('stroke', function (d) { return state.cinActive ? '#4fb3a8' : '#f1c76b'; });

      nodeGroups.select('.ws-bubble')
        .attr('fill', function (d) {
          return state.cinActive && d.id !== 'hard-pause' ? '#4fb3a8' : d.color;
        });

      nodeGroups.select('.ws-label')
        .attr('dx', function (d) { return labelOffsets[d.id].dx; })
        .attr('dy', function (d) { return labelOffsets[d.id].dy; })
        .attr('text-anchor', function (d) { return labelOffsets[d.id].anchor; })
        .attr('fill', function (d) {
          return d.id === state.selectedId ? '#ffffff' : '#d5d9e2';
        });
    }

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

    var yearSlider = document.getElementById('ws-year-slider');
    var yearVal = document.getElementById('ws-year-val');
    if (yearSlider) {
      yearSlider.addEventListener('input', function () {
        state.year = Number(yearSlider.value);
        if (yearVal) yearVal.textContent = String(state.year);
        render(false);
      });
    }

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

  /* ==========================================================================
     STUDIO 2: Interactive D3.js v7 Co-Intelligence vs. Extraction Lab
     (#ws-deep-sim-card / #ws-deep-sim-svg)
     Mode 1: flow      — Lenses 1, 3, 4, 5 ($100 Value Flow Across 4 Regimes)
     Mode 2: bandwidth — Lenses 2 & 6 (Biological vs. Silicon Bandwidth + 5 Zones)
     Mode 3: moat      — Lens 7 (10-Yr Pair Moat vs. Cloud Distillation Cliff)
     ========================================================================== */
  function initDeepSimD3() {
    var d3 = window.d3;
    var svgEl = document.getElementById('ws-deep-sim-svg');
    if (!d3 || !svgEl) return;

    var simState = {
      mode: 'flow',
      autoShare: 55,       // Slider 1 in flow mode (10% -> 90%)
      shapleyRate: 95,     // Slider 2 in flow mode (60% -> 95%)
      airlockCover: 85,    // Slider 1 in bandwidth mode (10% -> 100%)
      psiWorkforce: 85,    // Slider 2 in bandwidth mode (10% -> 95%)
      distillDays: 75,     // Slider 1 in moat mode (15 -> 180 Days)
      pairYears: 10        // Slider 2 in moat mode (1 -> 10 Years)
    };

    var s1 = document.getElementById('ws-sim-slider-1');
    var s2 = document.getElementById('ws-sim-slider-2');
    var s1Lbl = document.getElementById('ws-sim-s1-label');
    var s2Lbl = document.getElementById('ws-sim-s2-label');
    var s1Val = document.getElementById('ws-sim-s1-val');
    var s2Val = document.getElementById('ws-sim-s2-val');
    var topBadge = document.getElementById('ws-deep-sim-badge');

    function syncSlidersToMode() {
      if (!s1 || !s2) return;
      if (simState.mode === 'flow') {
        s1.min = '10'; s1.max = '90'; s1.step = '5'; s1.value = String(simState.autoShare);
        s2.min = '60'; s2.max = '95'; s2.step = '5'; s2.value = String(simState.shapleyRate);
        if (s1Lbl) s1Lbl.textContent = 'AI Automation Share of Economy (10% → 90%)';
        if (s2Lbl) s2Lbl.textContent = 'Demurrage & Shapley Royalty Rate';
        if (s1Val) s1Val.textContent = simState.autoShare + '% Automated';
        if (s2Val) s2Val.textContent = simState.shapleyRate + '% Shapley · 2%/mo';
      } else if (simState.mode === 'bandwidth') {
        s1.min = '10'; s1.max = '100'; s1.step = '5'; s1.value = String(simState.airlockCover);
        s2.min = '10'; s2.max = '95'; s2.step = '5'; s2.value = String(simState.psiWorkforce);
        if (s1Lbl) s1Lbl.textContent = 'CIN Zone 4 Airlock & 24h Mortal Lease Coverage';
        if (s2Lbl) s2Lbl.textContent = '4.8B Workforce PSI & $8 Pre-ADC Shield';
        if (s1Val) s1Val.textContent = simState.airlockCover + '% Airlock';
        if (s2Val) s2Val.textContent = simState.psiWorkforce + '% Shielded';
      } else {
        s1.min = '15'; s1.max = '180'; s1.step = '15'; s1.value = String(simState.distillDays);
        s2.min = '1'; s2.max = '10'; s2.step = '1'; s2.value = String(simState.pairYears);
        if (s1Lbl) s1Lbl.textContent = 'Open-Weight Distillation Speed (15 → 180 Days)';
        if (s2Lbl) s2Lbl.textContent = '1-to-1 Pair Co-Adaptation Horizon (1 → 10 Years)';
        if (s1Val) s1Val.textContent = simState.distillDays + ' Days';
        if (s2Val) s2Val.textContent = 'Year ' + simState.pairYears;
      }
    }

    function renderFlowMode(svg) {
      var x = d3.scaleLinear().domain([0, 100]).range([258, 832]);
      var autoDelta = Math.round((simState.autoShare - 55) * 0.12);
      var cloudRent = Math.max(60, Math.min(82, 72 + autoDelta));
      var apiMarkup = 100 - cloudRent;

      var entToll = Math.max(22, Math.min(46, 32 + Math.round((simState.autoShare - 55) * 0.15)));
      var entKeep = 100 - entToll;

      var totalCreator = simState.shapleyRate;
      var lineageShare = 10;
      var directSolver = totalCreator - lineageShare;
      var floorShare = 100 - totalCreator;

      if (topBadge) {
        topBadge.textContent = '$' + totalCreator + ' CREATOR RETURN · $' + floorShare + ' DEMURRAGE FLOOR ($25K/YR)';
      }

      svg.append('text')
        .attr('x', 24).attr('y', 28)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 10.5).attr('font-weight', 700).attr('fill', '#e9e6de')
        .text('MODE 1 · WHERE EVERY $100 OF AI-ERA VALUE FLOWS ACROSS 4 INSTITUTIONAL REGIMES');

      svg.append('text')
        .attr('x', 836).attr('y', 28).attr('text-anchor', 'end')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('Automation: ' + simState.autoShare + '% · CIN Creator Split: $' + directSolver + ' + $' + lineageShare + ' + $' + floorShare);

      // Legend row
      var legends = [
        { x: 24, color: '#ef6a52', text: 'Cloud / Middleman Rent' },
        { x: 224, color: '#b84a39', text: 'API Markup / Toll' },
        { x: 404, color: '#4fb3a8', text: 'Direct Human Solver ($' + directSolver + ')' },
        { x: 624, color: '#e5a93c', text: 'Lineage ($' + lineageShare + ') + $25k Floor ($' + floorShare + ')' }
      ];
      legends.forEach(function (lg) {
        svg.append('rect').attr('x', lg.x).attr('y', 42).attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', lg.color);
        svg.append('text').attr('x', lg.x + 15).attr('y', 51)
          .attr('font-family', 'system-ui, sans-serif').attr('font-size', 9.2).attr('fill', '#c5cad6')
          .text(lg.text);
      });

      var rows = [
        {
          y: 72,
          title: '1. SOTA Cloud Oligopoly',
          sub: '$' + cloudRent + ' Cloud/GPU Equity + $' + apiMarkup + ' API Markup + $0 Creator',
          titleColor: '#ef6a52',
          segs: [
            { w: cloudRent, fill: '#ef6a52', textColor: '#111317', label: '$' + cloudRent + ' Cloud Equity / GPU Rent' },
            { w: apiMarkup, fill: '#b84a39', textColor: '#ffffff', label: '$' + apiMarkup + ' API · $0 Creator' }
          ]
        },
        {
          y: 132,
          title: '2. University Research Squeeze',
          sub: '88% Foundational Math Originated → <1% GPUs & $0 Royalty',
          titleColor: '#5da2d5',
          segs: [
            { w: 88, fill: '#263a50', stroke: '#5da2d5', textColor: '#e9e6de', label: '88% Foundational Math Originated ($0 API Royalty)' },
            { w: 12, fill: '#ef6a52', textColor: '#111317', label: '<1% GPU' }
          ]
        },
        {
          y: 192,
          title: '3. Legacy Enterprise & Clinic',
          sub: entToll + '% Lost to SaaS, PBM & GPO Extraction + IP Egress',
          titleColor: '#e07b42',
          segs: [
            { w: entToll, fill: '#e07b42', textColor: '#111317', label: '$' + entToll + ' SaaS / PBM / GPO Loss' },
            { w: entKeep, fill: '#2c3442', textColor: '#d5d9e2', label: '$' + entKeep + ' Net Margin Retained (Trade Secrets Exposed)' }
          ]
        },
        {
          y: 252,
          title: '4. CIN Co-Intelligence Ledger',
          sub: '$' + directSolver + ' Solver + $' + lineageShare + ' Lineage (' + totalCreator + '% Creator) + $' + floorShare + ' Floor',
          titleColor: '#4fb3a8',
          highlight: true,
          segs: [
            { w: directSolver, fill: '#4fb3a8', textColor: '#111317', label: '$' + directSolver + ' Direct Human Solver + $' + lineageShare + ' Lineage (' + totalCreator + '% Return)' },
            { w: lineageShare, fill: '#5da2d5', textColor: '#111317', label: '' },
            { w: floorShare, fill: '#e5a93c', textColor: '#111317', label: '$' + floorShare }
          ]
        }
      ];

      rows.forEach(function (r) {
        svg.append('text')
          .attr('x', 24).attr('y', r.y + 15)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 10.5).attr('font-weight', 700).attr('fill', r.titleColor)
          .text(r.title);

        svg.append('text')
          .attr('x', 24).attr('y', r.y + 31)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 8.8).attr('fill', '#9aa3b2')
          .text(r.sub);

        var cur = 0;
        r.segs.forEach(function (seg) {
          var sx0 = x(cur);
          var sx1 = x(cur + seg.w);
          var sw = Math.max(2, sx1 - sx0 - 2);
          svg.append('rect')
            .attr('x', sx0)
            .attr('y', r.y + 2)
            .attr('width', sw)
            .attr('height', 32)
            .attr('rx', 5)
            .attr('fill', seg.fill)
            .attr('stroke', seg.stroke || (r.highlight ? '#4fb3a8' : 'none'))
            .attr('stroke-width', seg.stroke || r.highlight ? 1.2 : 0);

          if (seg.label && sw > 36) {
            svg.append('text')
              .attr('x', sx0 + sw / 2)
              .attr('y', r.y + 22)
              .attr('text-anchor', 'middle')
              .attr('font-family', 'ui-monospace, monospace')
              .attr('font-size', 9.3)
              .attr('font-weight', 700)
              .attr('fill', seg.textColor)
              .text(seg.label);
          }
          cur += seg.w;
        });
      });

      var xAxis = d3.axisBottom(x).tickValues([0, 20, 40, 60, 80, 100]).tickFormat(function (d) { return '$' + d; });
      svg.append('g')
        .attr('transform', 'translate(0,304)')
        .call(xAxis)
        .attr('color', '#8c95a6')
        .selectAll('text')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.2);

      svg.append('text')
        .attr('x', 430).attr('y', 344).attr('text-anchor', 'middle')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', '#e5a93c')
        .text('CIN $25k/yr Exempt Citizen Floor Is Funded via 2%/mo Demurrage on Idle Hoards + 95% Data Shapley Attribution');
    }

    function renderBandwidthMode(svg) {
      var tradeShare = Math.round(24 + (simState.psiWorkforce / 95) * 68);
      if (topBadge) {
        topBadge.textContent = '~40 BITS/S VS. 10¹² BITS/S · 4.8B WORKFORCE TRADE SHARE: ' + tradeShare + '%';
      }

      svg.append('text')
        .attr('x', 24).attr('y', 28)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 10.2).attr('font-weight', 700).attr('fill', '#e9e6de')
        .text('MODE 2 · BIOLOGICAL (~40 BITS/S) VS. SILICON SWARM (10¹² BITS/S) & 5 CONTAINMENT ZONES');

      svg.append('text')
        .attr('x', 836).attr('y', 28).attr('text-anchor', 'end')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('10¹⁰× Bandwidth Gap Bridged · Airlock: ' + simState.airlockCover + '%');

      var logScale = d3.scaleLog().domain([1, 1e13]).range([264, 824]);

      var channels = [
        {
          y: 48,
          title: 'Human Biological Channel',
          sub: '~40 bits/s · 25-yr generation · 4.8B physical workers',
          val: 40,
          color: '#8c95a6',
          rightNote: '~40 bits/s Conscious Channel (Unshielded 4.8B trade share: 78% → 24%)'
        },
        {
          y: 94,
          title: 'Unbounded Competitive AI Swarms',
          sub: '10¹² bits/s · 4.5-mo METR T50 doubling · ms self-play',
          val: 1e12,
          color: '#ef6a52',
          insideNote: '10¹² bits/s Machine Coordination · 4.5-Month Doubling Outpaces Biology 10¹⁰×'
        },
        {
          y: 140,
          title: 'CIN Airlock + 24h Mortal Lease',
          sub: 'Two Internets · 1:1 Hardware Bond · $8 Pre-ADC Witness',
          val: Math.pow(10, 4 + (simState.airlockCover / 100) * 7.5),
          color: '#4fb3a8',
          insideNote: 'CIN Zone 4 Airlock Bridges 10¹⁰× Gap · 4.8B Trade Share Restored to ' + tradeShare + '%'
        }
      ];

      channels.forEach(function (ch) {
        svg.append('text')
          .attr('x', 24).attr('y', ch.y + 14)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 10).attr('font-weight', 700).attr('fill', ch.color === '#8c95a6' ? '#e9e6de' : ch.color)
          .text(ch.title);

        svg.append('text')
          .attr('x', 24).attr('y', ch.y + 28)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 8.7).attr('fill', '#9aa3b2')
          .text(ch.sub);

        var bw = Math.max(24, logScale(ch.val) - 264);
        svg.append('rect')
          .attr('x', 264).attr('y', ch.y + 2)
          .attr('width', bw).attr('height', 28).attr('rx', 5)
          .attr('fill', ch.color)
          .attr('opacity', ch.color === '#8c95a6' ? 0.85 : 0.92);

        if (ch.rightNote) {
          svg.append('text')
            .attr('x', 264 + bw + 10).attr('y', ch.y + 20)
            .attr('font-family', 'ui-monospace, monospace')
            .attr('font-size', 9.2).attr('font-weight', 700).attr('fill', '#e9e6de')
            .text(ch.rightNote);
        } else if (ch.insideNote) {
          svg.append('text')
            .attr('x', 274).attr('y', ch.y + 20)
            .attr('font-family', 'ui-monospace, monospace')
            .attr('font-size', 9.2).attr('font-weight', 700).attr('fill', '#111317')
            .text(ch.insideNote);
        }
      });

      // Bottom Panel: 5 Safety & Containment Zones
      var zoneCards = [
        { x: 20, w: 152, color: '#ef6a52', title: 'Zone 1: Raw Accel', l1: 'Unbounded Swarms', l2: '0 runtime barriers', l3: '78% → 24% trade drop' },
        { x: 180, w: 152, color: '#e07b42', title: 'Zone 2: Lab RSPs', l1: 'Self-Policed Labs', l2: 'Voluntary pledges', l3: 'Eroded by race' },
        { x: 340, w: 156, color: '#e5a93c', title: 'Zone 3: Eval & Lag', l1: '36-Mo Statute Lag', l2: 'METR/AISI scorecards', l3: 'No runtime airlock' },
        { x: 504, w: 174, color: '#4fb3a8', title: 'Zone 4: CIN Airlock', l1: 'Two Internets + 24h Lease', l2: '1:1 Bond + $8 Pre-ADC', l3: 'Bridges 10¹⁰× Gap', highlight: true },
        { x: 686, w: 154, color: '#5da2d5', title: 'Zone 5: Hard Pause', l1: 'Global GPU Freeze', l2: 'Treaty FLOP cap', l3: 'If Zone 4 fails' }
      ];

      zoneCards.forEach(function (zc) {
        svg.append('rect')
          .attr('x', zc.x).attr('y', 196)
          .attr('width', zc.w).attr('height', 142).attr('rx', 9)
          .attr('fill', zc.highlight ? 'rgba(79,179,168,0.18)' : '#171b24')
          .attr('stroke', zc.color)
          .attr('stroke-width', zc.highlight ? 2.2 : 1.3);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 218)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', zc.color)
          .text(zc.title);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 246)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 9.2).attr('font-weight', 700).attr('fill', '#e9e6de')
          .text(zc.l1);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 272)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 9).attr('fill', '#b8c0ce')
          .text(zc.l2);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 316)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 9).attr('font-weight', 700).attr('fill', zc.highlight ? '#e5a93c' : zc.color)
          .text(zc.l3);
      });
    }

    function renderMoatMode(svg) {
      var dDays = simState.distillDays;
      var yrN = simState.pairYears;
      var annualBurn = (15 - ((dDays - 15) / 165) * 10).toFixed(1);
      var yrNMoat = Math.min(96, Math.round(66 + ((yrN - 1) / 9) * 30));

      if (topBadge) {
        topBadge.textContent = dDays + 'D DISTILLATION CLIFF (-$' + annualBurn + 'B/YR BURN) · YR-' + yrN + ' PAIR MOAT: ' + yrNMoat + '%';
      }

      svg.append('text')
        .attr('x', 24).attr('y', 28)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 10.2).attr('font-weight', 700).attr('fill', '#e9e6de')
        .text('MODE 3 · 10-YEAR PAIR MOAT (66% → 96%) VS. CLOUD AI DISTILLATION CLIFF (-$' + annualBurn + 'B/YR)');

      svg.append('text')
        .attr('x', 836).attr('y', 28).attr('text-anchor', 'end')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('Distillation: ' + dDays + 'd · Year-' + yrN + ' Pair Moat: ' + yrNMoat + '%');

      // Left Panel: 10-Year Trajectory
      svg.append('rect')
        .attr('x', 18).attr('y', 44).attr('width', 432).attr('height', 298).attr('rx', 10)
        .attr('fill', '#151922').attr('stroke', '#2a2f3a').attr('stroke-width', 1.3);

      svg.append('text')
        .attr('x', 32).attr('y', 66)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.8).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('1. 10-YR MOAT: PAIR INTELLIGENCE VS. CLOUD BURN');

      var x = d3.scaleLinear().domain([1, 10]).range([64, 428]);
      var y = d3.scaleLinear().domain([0, 100]).range([292, 86]);

      var xAxis = d3.axisBottom(x).ticks(5).tickFormat(function (d) { return 'Yr ' + d; });
      var yAxis = d3.axisLeft(y).tickValues([0, 25, 50, 75, 100]).tickFormat(function (d) { return d + '%'; });

      svg.append('g')
        .attr('transform', 'translate(0,292)')
        .call(xAxis)
        .attr('color', '#8c95a6')
        .selectAll('text').attr('font-family', 'ui-monospace, monospace').attr('font-size', 8.8);

      svg.append('g')
        .attr('transform', 'translate(64,0)')
        .call(yAxis)
        .attr('color', '#8c95a6')
        .selectAll('text').attr('font-family', 'ui-monospace, monospace').attr('font-size', 8.8);

      var years = d3.range(1, 11);
      var pairPts = years.map(function (yr) {
        return { yr: yr, val: Math.min(96, 66 + ((yr - 1) / 9) * 30) };
      });
      var cloudPts = years.map(function (yr) {
        var decay = Math.exp(-yr * (90 / Math.max(15, dDays)) * 0.45);
        var margin = Math.max(4, Math.round(4 + 58 * decay));
        return { yr: yr, val: margin };
      });

      var lineGen = d3.line()
        .x(function (d) { return x(d.yr); })
        .y(function (d) { return y(d.val); });

      svg.append('path')
        .datum(pairPts)
        .attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 3)
        .attr('d', lineGen);

      svg.append('path')
        .datum(cloudPts)
        .attr('fill', 'none').attr('stroke', '#ef6a52').attr('stroke-width', 2.8)
        .attr('d', lineGen);

      // Selected Year cursor
      svg.append('line')
        .attr('x1', x(yrN)).attr('x2', x(yrN))
        .attr('y1', 86).attr('y2', 292)
        .attr('stroke', '#e5a93c').attr('stroke-width', 1.4).attr('stroke-dasharray', '4 3');

      svg.append('circle')
        .attr('cx', x(yrN)).attr('cy', y(yrNMoat)).attr('r', 5).attr('fill', '#4fb3a8');

      svg.append('text')
        .attr('x', 82).attr('y', 102)
        .attr('font-family', 'system-ui, sans-serif')
        .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('1-to-1 Pair Moat: 66% → 96% Uncopyable');

      svg.append('text')
        .attr('x', 132).attr('y', 252)
        .attr('font-family', 'system-ui, sans-serif')
        .attr('font-size', 9.3).attr('font-weight', 700).attr('fill', '#ef6a52')
        .text('Cloud AI Margin (' + dDays + 'd Cliff · -$' + annualBurn + 'B/yr Burn)');

      // Right Panel: Stacked Breakdown of Year-N Pair Moat
      svg.append('rect')
        .attr('x', 464).attr('y', 44).attr('width', 376).attr('height', 298).attr('rx', 10)
        .attr('fill', '#151922').attr('stroke', '#2a2f3a').attr('stroke-width', 1.3);

      svg.append('text')
        .attr('x', 480).attr('y', 66)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 9.8).attr('font-weight', 700).attr('fill', '#e5a93c')
        .text('2. YEAR-' + yrN + ' PAIR MOAT STACKED BREAKDOWN');

      var scaleFactor = yrNMoat / 96;
      var craftPct = Math.round(34 * scaleFactor);
      var memPct = Math.round(32 * scaleFactor);
      var loraPct = yrNMoat - craftPct - memPct;
      var openPct = 100 - yrNMoat;

      var layers = [
        { y: 88, label: '1. Tacit Human Craft & Judgment', pct: craftPct, ref: '34% at Yr 10', color: '#4fb3a8', desc: 'Embodied domain intuition never on public web' },
        { y: 146, label: '2. 10-Yr Private Episodic Memory', pct: memPct, ref: '32% at Yr 10', color: '#5da2d5', desc: 'Encrypted local OCap longitudinal context' },
        { y: 204, label: '3. On-Device Rank-16 LoRA Weights', pct: loraPct, ref: '30% at Yr 10', color: '#e5a93c', desc: 'Personal preference weights (Hu et al., 2022)' },
        { y: 262, label: '4. Commodity Open Backbone', pct: openPct, ref: '4% at Yr 10', color: '#ef6a52', desc: 'Distilled in ' + dDays + ' days toward bare electricity cost' }
      ];

      var barScale = d3.scaleLinear().domain([0, 45]).range([0, 340]);

      layers.forEach(function (ly) {
        svg.append('text')
          .attr('x', 480).attr('y', ly.y + 12)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', ly.color)
          .text(ly.label + ' (' + ly.pct + '% · ' + ly.ref + ')');

        var bw = Math.max(18, Math.min(340, barScale(ly.pct)));
        svg.append('rect')
          .attr('x', 480).attr('y', ly.y + 18)
          .attr('width', bw).attr('height', 16).attr('rx', 4)
          .attr('fill', ly.color);

        svg.append('text')
          .attr('x', 480).attr('y', ly.y + 46)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 8.6).attr('fill', '#9aa3b2')
          .text(ly.desc);
      });
    }

    function renderDeepSim() {
      var svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      svg.append('rect')
        .attr('x', 4).attr('y', 4)
        .attr('width', 852).attr('height', 352).attr('rx', 14)
        .attr('fill', '#12151c')
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.5);

      if (simState.mode === 'flow') {
        renderFlowMode(svg);
      } else if (simState.mode === 'bandwidth') {
        renderBandwidthMode(svg);
      } else {
        renderMoatMode(svg);
      }
    }

    var modeBtns = document.querySelectorAll('[data-ws-sim-mode]');
    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        simState.mode = btn.getAttribute('data-ws-sim-mode') || 'flow';
        modeBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        syncSlidersToMode();
        renderDeepSim();
      });
    });

    if (s1) {
      s1.addEventListener('input', function () {
        var v = Number(s1.value);
        if (simState.mode === 'flow') simState.autoShare = v;
        else if (simState.mode === 'bandwidth') simState.airlockCover = v;
        else simState.distillDays = v;
        syncSlidersToMode();
        renderDeepSim();
      });
    }

    if (s2) {
      s2.addEventListener('input', function () {
        var v = Number(s2.value);
        if (simState.mode === 'flow') simState.shapleyRate = v;
        else if (simState.mode === 'bandwidth') simState.psiWorkforce = v;
        else simState.pairYears = v;
        syncSlidersToMode();
        renderDeepSim();
      });
    }

    syncSlidersToMode();
    renderDeepSim();
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

      var pairMoat = Math.min(96, Math.round(66 + ((y - 1) / 9) * 30));
      var cloudMoat = Math.max(4, Math.min(34, Math.round(d / 18)));

      if (cMoat) cMoat.textContent = cloudMoat + '% Commodity Base';
      if (pMoat) pMoat.textContent = pairMoat + '% Uncopyable Moat';
      if (svgLabel) {
        svgLabel.textContent = 'Yr-' + y + ' Pair Moat: ' + pairMoat + '% (34% Craft + 32% Memory + 30% LoRA) · ' + d + 'd Cliff';
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
      initDeepSimD3();
      initPairMoatSimulator();
    });
  } else {
    initEcosystemD3();
    initDeepSimD3();
    initPairMoatSimulator();
  }
})();
