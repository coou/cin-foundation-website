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
      shortLabel: 'OpenAI API',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#ef6a52',
      r: 10.5,
      x2026: 16, y2026: 64,
      x2032_sq: 12, y2032_sq: 52,
      x2032_cin: 70, y2032_cin: 88,
      metrics: [4, 12, 14, 8],
      posture: 'Closed frontier API billing $15–$60/M tokens; trains on uncompensated public web craft while burning $5B–$15B/yr on hyperscale clusters.',
      risk: 'Open-weight distillation erodes closed API pricing power within 60–90 days; enterprise tenants face lock-in and workflow leakage.',
      cin: 'Shifts from raw token rent to verifying Proof-Carrying Code (Necula, 1997) with 85% direct + 10% lineage Data Shapley royalties (Ghorbani & Zou, 2019).',
      targetSec: '#lens-1-sota-labs'
    },
    {
      id: 'anthropic-rsp',
      name: 'Anthropic / RSP Frontier Lab',
      shortLabel: 'Anthropic',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#e07b42',
      r: 10,
      x2026: 36, y2026: 52,
      x2032_sq: 32, y2032_sq: 42,
      x2032_cin: 78, y2032_cin: 92,
      metrics: [6, 16, 38, 15],
      posture: 'Pioneered Responsible Scaling Policies (RSPs) and constitutional alignment, but remains bound to centralized cloud API equity economics.',
      risk: 'Voluntary lab pledges face competitive race pressure whenever rival clusters cross capability thresholds without protocol enforcement.',
      cin: 'Pairs constitutional alignment with hardware-enforced Capability-Bounded Execution Leases (Hinton, 2022) and local OCap sandboxes.',
      targetSec: '#lens-1-sota-labs'
    },
    {
      id: 'deepmind-hyperscale',
      name: 'Google DeepMind / Hyperscale',
      shortLabel: 'DeepMind',
      lens: 'sota-labs',
      lensLabel: '1. SOTA AI Labs',
      color: '#ef6a52',
      r: 10.5,
      x2026: 26, y2026: 34,
      x2032_sq: 22, y2032_sq: 24,
      x2032_cin: 70, y2032_cin: 72,
      metrics: [5, 22, 20, 10],
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
      metrics: [12, 18, 16, 72],
      posture: 'Releases open-weight foundation models that commoditize rival closed APIs within 75 days, enabling local inference on consumer silicon.',
      risk: 'Provides $0 creator royalty attribution and zero runtime containment against autonomous swarm proliferation.',
      cin: 'Combines open base weights with local Low-Rank Adapters (Hu et al., 2022), 1-to-1 human hardware binding, and 95% Shapley royalties.',
      targetSec: '#lens-1-sota-labs'
    },
    {
      id: 'eacc-swarms',
      name: 'Unbounded Acceleration (e/acc)',
      shortLabel: 'e/acc Swarms',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#ef6a52',
      r: 9.5,
      x2026: 6, y2026: 12,
      x2032_sq: 4, y2032_sq: 6,
      x2032_cin: 69, y2032_cin: 14,
      metrics: [8, 10, 2, 18],
      posture: 'Advocates zero containment barriers and unrestricted autonomous machine swarms operating at 10^12 bits/s across public networks.',
      risk: 'Human biology (~40 bits/s conscious bandwidth, 25-year generation) is mathematically outcompeted and economically displaced.',
      cin: 'Contains machine-speed coordination inside the Agent-Only Internet behind a cryptographic Two-Internet airlock (Dennis & Van Horn, 1966).',
      targetSec: '#lens-2-safety-pause'
    },
    {
      id: 'eval-institutes',
      name: 'METR / Redwood / Apollo / UK AISI',
      shortLabel: 'METR / AISI',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#e5a93c',
      r: 10,
      x2026: 60, y2026: 68,
      x2032_sq: 58, y2032_sq: 56,
      x2032_cin: 70, y2032_cin: 56,
      metrics: [25, 30, 54, 45],
      posture: 'Measures 4.5-month task-horizon doubling (METR, 2026) and deceptive alignment via pre-deployment red-teaming and control benchmarks.',
      risk: 'Diagnostic scorecards lack a runtime physical or cryptographic enforcement layer once weights leave the lab.',
      cin: 'Translates evaluation tripwires directly into <10 ms silicon quorum gates and Capability-Bounded Execution Leases.',
      targetSec: '#lens-2-safety-pause'
    },
    {
      id: 'cin-airlock',
      name: 'CIN Co-Intelligence Airlock (Zone 4)',
      shortLabel: 'CIN Airlock',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#4fb3a8',
      r: 12,
      x2026: 83, y2026: 95,
      x2032_sq: 84, y2032_sq: 96,
      x2032_cin: 86, y2032_cin: 96,
      metrics: [95, 96, 98, 100],
      posture: 'Structural last resort before a global moratorium: Two-Internet airlock, 1-to-1 human hardware bond, and 24-hour mortal execution leases.',
      risk: 'Requires rapid voluntary adoption across clinics, universities, and co-ops before autonomous swarm externalities force a treaty freeze.',
      cin: 'Preserves frontier scientific progress while guaranteeing human biological sovereignty and 95% Data Shapley contributor royalties.',
      targetSec: '#lens-2-safety-pause'
    },
    {
      id: 'hard-pause',
      name: 'Global Hard Compute Pause (Zone 5)',
      shortLabel: 'Hard Pause',
      lens: 'safety-labs',
      lensLabel: '2. AI Safety & Pause Gradient',
      color: '#5da2d5',
      r: 10,
      x2026: 94, y2026: 48,
      x2032_sq: 95, y2032_sq: 42,
      x2032_cin: 95, y2032_cin: 48,
      metrics: [30, 40, 88, 22],
      posture: 'International treaty moratorium freezing frontier GPU clusters, enforcing FLOP caps, and halting training runs above statutory thresholds.',
      risk: 'Requires intrusive global surveillance of consumer hardware and forfeits AI breakthroughs in oncology, energy, and ecological repair.',
      cin: 'Rendered unnecessary as a blunt shutdown if Zone 4 (CIN Co-Intelligence Airlock) contains autonomous swarms at the protocol layer.',
      targetSec: '#lens-2-safety-pause'
    },
    {
      id: 'legislatures',
      name: 'National Legislatures & Regulators',
      shortLabel: 'Legislatures',
      lens: 'governments',
      lensLabel: '3. Governments',
      color: '#ef6a52',
      r: 10,
      x2026: 56, y2026: 42,
      x2032_sq: 54, y2032_sq: 30,
      x2032_cin: 78, y2032_cin: 60,
      metrics: [22, 18, 28, 32],
      posture: 'Drafts statutory AI compliance frameworks on 18–36 month legislative cycles while frontier capabilities double every 4.5 months.',
      risk: 'By the time a statute takes effect, model task horizons have multiplied 16×–64×, leaving paper rules unenforceable at runtime.',
      cin: 'Replaces multi-year paper lag with <10 ms cryptographic quorum gates and power-proportionate zero-knowledge auditability.',
      targetSec: '#lens-3-governments'
    },
    {
      id: 'state-treasuries',
      name: 'Municipal & Sovereign Tax Bases',
      shortLabel: 'Treasuries',
      lens: 'governments',
      lensLabel: '3. Governments',
      color: '#e07b42',
      r: 9.5,
      x2026: 50, y2026: 22,
      x2032_sq: 48, y2032_sq: 12,
      x2032_cin: 70, y2032_cin: 40,
      metrics: [28, 15, 22, 30],
      posture: 'Relies on human payroll and income taxes for ~72% of civic revenue while automation compresses taxable wage shares.',
      risk: 'Severe fiscal deficit as cloud conglomerates concentrate capital outside local municipal tax jurisdictions.',
      cin: 'Stabilizes post-labor public finance via a $25,000 sovereign exemption floor and 2%/month demurrage recirculation on idle hoards.',
      targetSec: '#lens-3-governments'
    },
    {
      id: 'public-universities',
      name: 'Public Universities & arXiv Labs',
      shortLabel: 'Universities',
      lens: 'universities',
      lensLabel: '4. Universities',
      color: '#5da2d5',
      r: 10,
      x2026: 44, y2026: 66,
      x2032_sq: 41, y2032_sq: 54,
      x2032_cin: 86, y2032_cin: 80,
      metrics: [2, 24, 48, 40],
      posture: 'Originates 88% of foundational architectures (Transformers, Diffusion, LoRA) on public grants while holding <1% of frontier GPUs.',
      risk: 'Commercial labs scrape arXiv preprints for $0 royalty while academic researchers face severe compute poverty and brain drain.',
      cin: 'Routes a perpetual Data Shapley lineage endowment to originating university labs on every downstream task settlement.',
      targetSec: '#lens-4-universities'
    },
    {
      id: 'academic-lora-mesh',
      name: 'Federated University TIES-LoRA Mesh',
      shortLabel: 'LoRA Mesh',
      lens: 'universities',
      lensLabel: '4. Universities',
      color: '#4fb3a8',
      r: 9.5,
      x2026: 70, y2026: 52,
      x2032_sq: 71, y2032_sq: 56,
      x2032_cin: 86, y2032_cin: 64,
      metrics: [88, 82, 86, 94],
      posture: '500+ university groups co-training 18 MB rank-16 Low-Rank Adapters via TIES-Merging (Yadav et al., 2023) over IETF QUIC.',
      risk: 'Without structured schema compression, raw literature context windows waste 95% of academic GPU budgets.',
      cin: 'Uses SPRA Structured Paper Representation (Leng et al., 2026) to cut literature tokens by 95.3% (5,500 -> 260 tokens).',
      targetSec: '#lens-4-universities'
    },
    {
      id: 'cloud-wrapper-corps',
      name: 'Cloud API Tenant Enterprises',
      shortLabel: 'Cloud Tenants',
      lens: 'enterprise',
      lensLabel: '5. Enterprise',
      color: '#ef6a52',
      r: 10,
      x2026: 22, y2026: 16,
      x2032_sq: 18, y2032_sq: 10,
      x2032_cin: 78, y2032_cin: 44,
      metrics: [68, 14, 24, 6],
      posture: 'Streams proprietary ERP, clinical, and pricing workflows into third-party cloud APIs while paying 32% SaaS, PBM, and GPO middleman tolls.',
      risk: 'Fine-tuning prompts leak core trade secrets to cloud conglomerates, compressing enterprise operating margins over 5 years.',
      cin: 'Executes inside a local WebAssembly OCap sandbox (0 bytes leaked) and joins 500-firm Private Set Intersection buyer co-ops.',
      targetSec: '#lens-5-enterprise'
    },
    {
      id: 'psi-buyer-coops',
      name: 'Sovereign Wasm + PSI Buyer Co-Ops',
      shortLabel: 'PSI Co-Ops',
      lens: 'enterprise',
      lensLabel: '5. Enterprise',
      color: '#4fb3a8',
      r: 10,
      x2026: 74, y2026: 68,
      x2032_sq: 75, y2032_sq: 72,
      x2032_cin: 86, y2032_cin: 48,
      metrics: [94, 90, 92, 100],
      posture: 'Independent clinics, credit unions, and SMBs matching overlapping supplier SKUs via Private Set Intersection (Freedman et al., 2004).',
      risk: 'Legacy Group Purchasing Organizations (GPOs) attempt contractual lock-in and opaque rebate bundling to block direct wholesale pricing.',
      cin: 'Unlocks 22%–34% direct wholesale discounts at 0% middleman fee while auditing CMS NCCI CPT billing errors locally.',
      targetSec: '#lens-5-enterprise'
    },
    {
      id: 'commodity-cartels',
      name: 'Algorithmic Commodity & Buyer Cartels',
      shortLabel: 'AI Cartels',
      lens: 'human-adoption',
      lensLabel: '6. Global Workforce',
      color: '#ef6a52',
      r: 10,
      x2026: 10, y2026: 30,
      x2032_sq: 7, y2032_sq: 20,
      x2032_cin: 70, y2032_cin: 26,
      metrics: [12, 20, 8, 10],
      posture: 'Uses satellite and swarm forecasting to predict regional harvest gluts and force fire-sale pricing on uncoordinated physical producers.',
      risk: 'Collapses unshielded physical producer trade share from 78% to 24% across the 4.8B non-digital global workforce.',
      cin: 'Counter-balanced by 10,000-producer Private Set Intersection supply cooperatives that enforce transparent reserve price floors.',
      targetSec: '#lens-6-workforce'
    },
    {
      id: 'physical-workforce',
      name: '4.8B+ Physical & Rural Workforce',
      shortLabel: '4.8B Workers',
      lens: 'human-adoption',
      lensLabel: '6. Global Workforce',
      color: '#e5a93c',
      r: 11.5,
      x2026: 38, y2026: 12,
      x2032_sq: 34, y2032_sq: 6,
      x2032_cin: 78, y2032_cin: 28,
      metrics: [24, 32, 35, 28],
      posture: '4.8B+ workers in physical trades, farming, caregiving, and craft without cloud subscriptions or high-bandwidth fiber.',
      risk: 'Faces severe terms-of-trade collapse (78% -> 24% share) if frontier AI only serves digital knowledge conglomerates.',
      cin: 'Equips workers with $8 Pre-ADC hardware (Datta et al., 2022), offline voice twins on $45 phones, and 5D care/ecology value parity.',
      targetSec: '#lens-6-workforce'
    },
    {
      id: 'cloud-token-renters',
      name: 'Unprofitable Cloud Token Renters',
      shortLabel: 'Token Burn',
      lens: 'pair-intelligence',
      lensLabel: '7. Pair vs. Cloud Economics',
      color: '#ef6a52',
      r: 9.5,
      x2026: 14, y2026: 46,
      x2032_sq: 10, y2032_sq: 36,
      x2032_cin: 86, y2032_cin: 32,
      metrics: [4, 4, 12, 8],
      posture: 'Competes on raw commodity token inference where $100B frontier training runs are distilled into open weights within 60–90 days.',
      risk: 'Retains only 4% commodity backbone share as marginal token prices collapse toward bare electricity cost (-$5B to -$15B/yr burn).',
      cin: 'Pivots from commodity cloud inference to local on-device LoRA specialization and verifiable cooperative settlement.',
      targetSec: '#lens-7-pair-economy'
    },
    {
      id: 'human-lora-pair',
      name: '1-to-1 Human + Local LoRA Pair',
      shortLabel: '1:1 Pair Moat',
      lens: 'pair-intelligence',
      lensLabel: '7. Pair vs. Cloud Economics',
      color: '#4fb3a8',
      r: 11.5,
      x2026: 76, y2026: 82,
      x2032_sq: 79, y2032_sq: 84,
      x2032_cin: 86, y2032_cin: 16,
      metrics: [95, 96, 98, 100],
      posture: 'One biological human paired 1-to-1 with a local Low-Rank Adapter (Hu et al., 2022) accumulating 10 years of episodic craft memory.',
      risk: 'Zero cloud distillation vulnerability because private tacit judgment and local hardware keys never enter public training corpora.',
      cin: '96% uncopyable economic moat by Year 10 (34% tacit craft + 32% episodic memory + 30% on-device rank-16 LoRA weights).',
      targetSec: '#lens-7-pair-economy'
    }
  ];

  var ZONES = [
    { x0: 0, x1: 24, label: '1. Raw Accel', sub: 'Swarms', fill: 'rgba(239, 106, 82, 0.08)', stroke: '#ef6a52' },
    { x0: 24, x1: 48, label: '2. Cloud Rent', sub: 'API Labs', fill: 'rgba(224, 123, 66, 0.07)', stroke: '#e07b42' },
    { x0: 48, x1: 68, label: '3. Eval Lag', sub: 'Scorecards', fill: 'rgba(229, 169, 60, 0.07)', stroke: '#e5a93c' },
    { x0: 68, x1: 88, label: '4. CIN Airlock', sub: 'Last Resort', fill: 'rgba(79, 179, 168, 0.16)', stroke: '#4fb3a8', highlight: true },
    { x0: 88, x1: 100, label: '5. Pause', sub: 'Freeze', fill: 'rgba(93, 162, 213, 0.09)', stroke: '#5da2d5' }
  ];

  /* Deterministic non-overlapping label placement solver for #ws-ecosystem-svg */
  function computeLabelOffsets(positions, plotLeft, plotRight, plotTop, plotBottom) {
    var candidates = [
      { dx: 0, dy: -16, anchor: 'middle' },
      { dx: 0, dy: 23, anchor: 'middle' },
      { dx: 15, dy: 4, anchor: 'start' },
      { dx: -15, dy: 4, anchor: 'end' },
      { dx: 0, dy: -28, anchor: 'middle' },
      { dx: 0, dy: 34, anchor: 'middle' },
      { dx: 17, dy: -11, anchor: 'start' },
      { dx: -17, dy: -11, anchor: 'end' },
      { dx: 17, dy: 16, anchor: 'start' },
      { dx: -17, dy: 16, anchor: 'end' }
    ];

    var placedBoxes = [];
    var results = {};

    // Sort actors by y ascending so top labels lock first
    var sorted = positions.slice().sort(function (a, b) { return a.cy - b.cy; });

    sorted.forEach(function (item) {
      var w = item.d.shortLabel.length * 7.1 + 8;
      var h = 14;
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
    var svgEl = document.getElementById('ws-ecosystem-svg') || document.getElementById('ws-quadrant-svg');
    if (!d3 || !svgEl) return;

    var state = {
      lens: 'all',
      year: 2028,
      cinActive: false,
      selectedId: 'cin-airlock'
    };

    var width = 860;
    var height = 420;
    var padL = 68;
    var margin = { top: 58, right: 24, bottom: 48, left: padL };

    var x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    var y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    var rawSvg = d3.select(svgEl);
    rawSvg.selectAll('*').remove();
    var svg = rawSvg.append('g').attr('id', 'ws-quadrant-svg');

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
      var zw = zx1 - zx0;
      zoneGroup.append('rect')
        .attr('x', zx0)
        .attr('y', margin.top)
        .attr('width', zw)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', z.fill)
        .attr('stroke', z.highlight ? '#4fb3a8' : '#252a34')
        .attr('stroke-width', z.highlight ? 1.8 : 1)
        .attr('stroke-dasharray', z.highlight ? '5 3' : null);

      zoneGroup.append('rect')
        .attr('x', zx0 + 3)
        .attr('y', 9)
        .attr('width', Math.max(20, zw - 6))
        .attr('height', 42)
        .attr('rx', 5)
        .attr('fill', z.highlight ? 'rgba(79, 179, 168, 0.22)' : 'rgba(24, 29, 39, 0.9)')
        .attr('stroke', z.stroke)
        .attr('stroke-width', z.highlight ? 1.5 : 0.9)
        .attr('stroke-opacity', z.highlight ? 0.95 : 0.6);

      zoneGroup.append('text')
        .attr('x', (zx0 + zx1) / 2)
        .attr('y', 26)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', z.stroke)
        .text(z.label);

      zoneGroup.append('text')
        .attr('x', (zx0 + zx1) / 2)
        .attr('y', 44)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'system-ui, sans-serif')
        .attr('font-size', 12)
        .attr('fill', z.highlight ? '#e9e6de' : '#9aa3b2')
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
      .attr('font-size', 12);

    svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .call(yAxis)
      .attr('color', '#8c95a6')
      .selectAll('text')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-size', 12);

    svg.append('text')
      .attr('x', (margin.left + width - margin.right) / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-size', 12.5)
      .attr('font-weight', 700)
      .attr('fill', '#d5d9e2')
      .text('CONTAINMENT POSTURE (0% Swarms → 82% CIN Airlock → 95% Global Pause)');

    var midY = Math.round((margin.top + height - margin.bottom) / 2);
    svg.append('text')
      .attr('x', 18)
      .attr('y', midY)
      .attr('dy', '0.35em')
      .attr('transform', 'rotate(-90, 18, ' + midY + ')')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-size', 12.5)
      .attr('font-weight', 700)
      .attr('fill', '#4fb3a8')
      .text('↑ HUMAN SOVEREIGNTY (%)');

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

    function renderActorComparatorD3(actor) {
      var cmpEl = document.getElementById('ws-actor-d3-svg');
      if (!d3 || !cmpEl || !actor) return;
      cmpEl.setAttribute('viewBox', '0 0 680 134');
      var cSvg = d3.select(cmpEl);
      cSvg.selectAll('*').remove();

      cSvg.append('rect')
        .attr('x', 2).attr('y', 2)
        .attr('width', 676).attr('height', 130).attr('rx', 8)
        .attr('fill', '#11151d')
        .attr('stroke', '#28303e')
        .attr('stroke-width', 1.2);

      var mScores = actor.metrics || [20, 20, 20, 20];
      var cinScores = [95, 96, 98, 100];
      var labels = [
        '1. Creator Value Retained',
        '2. 90d Moat Durability',
        '3. Bio Airlock (~40 b/s)',
        '4. Local Data (0-Egress)'
      ];
      var barScale = d3.scaleLinear().domain([0, 100]).range([0, 280]);

      labels.forEach(function (lbl, idx) {
        var ry = 12 + idx * 29;
        var aScore = mScores[idx];
        var cScore = cinScores[idx];

        cSvg.append('text')
          .attr('x', 14).attr('y', ry + 14)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#d5d9e2')
          .text(lbl);

        // Background track
        cSvg.append('rect')
          .attr('x', 214).attr('y', ry + 2)
          .attr('width', 280).attr('height', 16).attr('rx', 3)
          .attr('fill', '#1b202c');

        // CIN target bar (teal outline/fill)
        cSvg.append('rect')
          .attr('x', 214).attr('y', ry + 2)
          .attr('width', barScale(cScore)).attr('height', 16).attr('rx', 3)
          .attr('fill', 'rgba(79,179,168,0.22)')
          .attr('stroke', '#4fb3a8').attr('stroke-width', 1);

        // Selected Actor bar
        cSvg.append('rect')
          .attr('x', 214).attr('y', ry + 4)
          .attr('width', Math.max(4, barScale(aScore))).attr('height', 12).attr('rx', 2)
          .attr('fill', actor.color);

        cSvg.append('text')
          .attr('x', 504).attr('y', ry + 14)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#e9e6de')
          .text(aScore + '% vs CIN ' + cScore + '%');
      });
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
        linkEl.textContent = 'Jump ↓';
      }
      if (posEl) posEl.textContent = actor.posture;
      if (riskEl) riskEl.textContent = actor.risk;
      if (cinEl) cinEl.textContent = actor.cin;

      var aiCat = document.getElementById('ws-ai-cat');
      var aiName = document.getElementById('ws-ai-name');
      var aiMeta = document.getElementById('ws-ai-meta');
      var aiDesc = document.getElementById('ws-ai-desc');
      var aiCin = document.getElementById('ws-ai-cin');
      if (aiCat) aiCat.textContent = actor.lensLabel;
      if (aiName) aiName.textContent = actor.name;
      if (aiMeta) aiMeta.textContent = '2026 Posture (' + actor.x2026 + '%, ' + actor.y2026 + '%) → 2032 CIN (' + actor.x2032_cin + '%, ' + actor.y2032_cin + '%)';
      if (aiDesc) aiDesc.textContent = actor.posture;
      if (aiCin) aiCin.textContent = actor.cin;

      renderActorComparatorD3(actor);
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
      .attr('font-size', 12)
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
          ? 'CIN Co-Intelligence: ACTIVE'
          : 'CIN Co-Intelligence: OFF';
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
        if (s1Lbl) s1Lbl.textContent = 'Automation (10%–90%)';
        if (s2Lbl) s2Lbl.textContent = 'Shapley & Demurrage';
        if (s1Val) s1Val.textContent = simState.autoShare + '%';
        if (s2Val) s2Val.textContent = simState.shapleyRate + '% · 2%/mo';
      } else if (simState.mode === 'bandwidth') {
        s1.min = '10'; s1.max = '100'; s1.step = '5'; s1.value = String(simState.airlockCover);
        s2.min = '10'; s2.max = '95'; s2.step = '5'; s2.value = String(simState.psiWorkforce);
        if (s1Lbl) s1Lbl.textContent = 'Zone 4 Airlock';
        if (s2Lbl) s2Lbl.textContent = 'Workforce PSI Shield';
        if (s1Val) s1Val.textContent = simState.airlockCover + '%';
        if (s2Val) s2Val.textContent = simState.psiWorkforce + '%';
      } else {
        s1.min = '15'; s1.max = '180'; s1.step = '15'; s1.value = String(simState.distillDays);
        s2.min = '1'; s2.max = '10'; s2.step = '1'; s2.value = String(simState.pairYears);
        if (s1Lbl) s1Lbl.textContent = 'Distillation (15–180d)';
        if (s2Lbl) s2Lbl.textContent = 'Pair Horizon (1–10y)';
        if (s1Val) s1Val.textContent = simState.distillDays + 'd';
        if (s2Val) s2Val.textContent = 'Yr ' + simState.pairYears;
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
        topBadge.textContent = totalCreator + '% CREATOR · $' + floorShare + ' FLOOR';
      }

      svg.append('text')
        .attr('x', 24).attr('y', 28)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 13).attr('font-weight', 700).attr('fill', '#e9e6de')
        .text('MODE 1 · $100 VALUE FLOW ACROSS 4 REGIMES');

      svg.append('text')
        .attr('x', 836).attr('y', 28).attr('text-anchor', 'end')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('Auto: ' + simState.autoShare + '% · CIN Split: $' + directSolver + '+$' + lineageShare + '+$' + floorShare);

      // Legend row
      var legends = [
        { x: 24, color: '#ef6a52', text: 'Cloud Rent' },
        { x: 164, color: '#b84a39', text: 'API Toll' },
        { x: 294, color: '#4fb3a8', text: 'Direct Solver ($' + directSolver + ')' },
        { x: 504, color: '#e5a93c', text: 'Lineage ($' + lineageShare + ') + Floor ($' + floorShare + ')' }
      ];
      legends.forEach(function (lg) {
        svg.append('rect').attr('x', lg.x).attr('y', 41).attr('width', 11).attr('height', 11).attr('rx', 2).attr('fill', lg.color);
        svg.append('text').attr('x', lg.x + 16).attr('y', 51)
          .attr('font-family', 'system-ui, sans-serif').attr('font-size', 12).attr('fill', '#c5cad6')
          .text(lg.text);
      });

      var rows = [
        {
          y: 72,
          title: '1. SOTA Cloud Oligopoly',
          sub: '$' + cloudRent + ' Cloud + $' + apiMarkup + ' API ($0 Creator)',
          titleColor: '#ef6a52',
          segs: [
            { w: cloudRent, fill: '#ef6a52', textColor: '#111317', label: '$' + cloudRent + ' Cloud / GPU Rent' },
            { w: apiMarkup, fill: '#b84a39', textColor: '#ffffff', label: '$' + apiMarkup + ' API' }
          ]
        },
        {
          y: 132,
          title: '2. University Research',
          sub: '88% Math → <1% GPU & $0 Royalty',
          titleColor: '#5da2d5',
          segs: [
            { w: 88, fill: '#263a50', stroke: '#5da2d5', textColor: '#e9e6de', label: '88% Foundational Math ($0 Royalty)' },
            { w: 12, fill: '#ef6a52', textColor: '#111317', label: '' }
          ]
        },
        {
          y: 192,
          title: '3. Legacy Enterprise',
          sub: entToll + '% Lost to SaaS, PBM & GPO',
          titleColor: '#e07b42',
          segs: [
            { w: entToll, fill: '#e07b42', textColor: '#111317', label: '$' + entToll + ' Toll' },
            { w: entKeep, fill: '#2c3442', textColor: '#d5d9e2', label: '$' + entKeep + ' Retained (IP Exposed)' }
          ]
        },
        {
          y: 252,
          title: '4. CIN Shapley Ledger',
          sub: totalCreator + '% Creator + $' + floorShare + ' Citizen Floor',
          titleColor: '#4fb3a8',
          highlight: true,
          segs: [
            { w: directSolver, fill: '#4fb3a8', textColor: '#111317', label: '$' + directSolver + ' Direct Solver (' + totalCreator + '% Creator)' },
            { w: lineageShare, fill: '#5da2d5', textColor: '#111317', label: '' },
            { w: floorShare, fill: '#e5a93c', textColor: '#111317', label: '' }
          ]
        }
      ];

      rows.forEach(function (r) {
        svg.append('text')
          .attr('x', 24).attr('y', r.y + 15)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 13).attr('font-weight', 700).attr('fill', r.titleColor)
          .text(r.title);

        svg.append('text')
          .attr('x', 24).attr('y', r.y + 32)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 12).attr('fill', '#9aa3b2')
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

          if (seg.label && sw > 64) {
            svg.append('text')
              .attr('x', sx0 + sw / 2)
              .attr('y', r.y + 22)
              .attr('text-anchor', 'middle')
              .attr('font-family', 'ui-monospace, monospace')
              .attr('font-size', 12)
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
        .attr('font-size', 12);

      svg.append('text')
        .attr('x', 430).attr('y', 344).attr('text-anchor', 'middle')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#e5a93c')
        .text('$25k Exempt Citizen Floor Funded via 2%/mo Demurrage + 95% Data Shapley');
    }

    function renderBandwidthMode(svg) {
      var tradeShare = Math.round(24 + (simState.psiWorkforce / 95) * 68);
      if (topBadge) {
        topBadge.textContent = '~40 B/S VS. 10¹² B/S · WORKFORCE SHARE: ' + tradeShare + '%';
      }

      svg.append('text')
        .attr('x', 24).attr('y', 28)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 13).attr('font-weight', 700).attr('fill', '#e9e6de')
        .text('MODE 2 · BIO (~40 B/S) VS. SWARM (10¹² B/S) & 5 ZONES');

      svg.append('text')
        .attr('x', 836).attr('y', 28).attr('text-anchor', 'end')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('10¹⁰× Gap Bridged · Airlock: ' + simState.airlockCover + '%');

      var logScale = d3.scaleLog().domain([1, 1e13]).range([264, 824]);

      var channels = [
        {
          y: 48,
          title: 'Human Biology',
          sub: '~40 bits/s · 4.8B workers',
          val: 40,
          color: '#8c95a6',
          rightNote: '~40 b/s Channel (Trade: 78% → 24%)'
        },
        {
          y: 94,
          title: 'Unbounded AI Swarms',
          sub: '10¹² bits/s · 4.5-mo×2',
          val: 1e12,
          color: '#ef6a52',
          insideNote: '10¹² b/s Swarms Outpace Biology 10¹⁰×'
        },
        {
          y: 140,
          title: 'CIN Zone 4 Airlock',
          sub: 'Two Internets · $8 Pre-ADC',
          val: Math.pow(10, 4 + (simState.airlockCover / 100) * 7.5),
          color: '#4fb3a8',
          insideNote: 'Zone 4 Restores Trade Share to ' + tradeShare + '%'
        }
      ];

      channels.forEach(function (ch) {
        svg.append('text')
          .attr('x', 24).attr('y', ch.y + 14)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 13).attr('font-weight', 700).attr('fill', ch.color === '#8c95a6' ? '#e9e6de' : ch.color)
          .text(ch.title);

        svg.append('text')
          .attr('x', 24).attr('y', ch.y + 30)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 12).attr('fill', '#9aa3b2')
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
            .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#e9e6de')
            .text(ch.rightNote);
        } else if (ch.insideNote) {
          svg.append('text')
            .attr('x', 274).attr('y', ch.y + 20)
            .attr('font-family', 'ui-monospace, monospace')
            .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#111317')
            .text(ch.insideNote);
        }
      });

      // Bottom Panel: 5 Safety & Containment Zones
      var zoneCards = [
        { x: 20, w: 152, color: '#ef6a52', title: '1. Raw Accel', l1: 'Open Swarms', l2: '0 barriers', l3: '78%→24% drop' },
        { x: 180, w: 152, color: '#e07b42', title: '2. Lab RSPs', l1: 'Self-Policed', l2: 'Pledges only', l3: 'Race eroded' },
        { x: 340, w: 156, color: '#e5a93c', title: '3. Eval Lag', l1: '36-Mo Lag', l2: 'Scorecards', l3: 'No airlock' },
        { x: 504, w: 174, color: '#4fb3a8', title: '4. CIN Airlock', l1: 'Two Internets', l2: '1:1 + Pre-ADC', l3: '10¹⁰× Bridge', highlight: true },
        { x: 686, w: 154, color: '#5da2d5', title: '5. Hard Pause', l1: 'GPU Freeze', l2: 'FLOP treaty', l3: 'Last resort' }
      ];

      zoneCards.forEach(function (zc) {
        svg.append('rect')
          .attr('x', zc.x).attr('y', 196)
          .attr('width', zc.w).attr('height', 142).attr('rx', 9)
          .attr('fill', zc.highlight ? 'rgba(79,179,168,0.18)' : '#171b24')
          .attr('stroke', zc.color)
          .attr('stroke-width', zc.highlight ? 2.2 : 1.3);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 220)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 12.5).attr('font-weight', 700).attr('fill', zc.color)
          .text(zc.title);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 250)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#e9e6de')
          .text(zc.l1);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 280)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 12).attr('fill', '#b8c0ce')
          .text(zc.l2);

        svg.append('text')
          .attr('x', zc.x + 10).attr('y', 316)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 12).attr('font-weight', 700).attr('fill', zc.highlight ? '#e5a93c' : zc.color)
          .text(zc.l3);
      });
    }

    function renderMoatMode(svg) {
      var dDays = simState.distillDays;
      var yrN = simState.pairYears;
      var annualBurn = (15 - ((dDays - 15) / 165) * 10).toFixed(1);
      var yrNMoat = Math.min(96, Math.round(66 + ((yrN - 1) / 9) * 30));

      if (topBadge) {
        topBadge.textContent = dDays + 'D CLIFF (-$' + annualBurn + 'B/YR) · YR-' + yrN + ' MOAT: ' + yrNMoat + '%';
      }

      svg.append('text')
        .attr('x', 24).attr('y', 28)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 13).attr('font-weight', 700).attr('fill', '#e9e6de')
        .text('MODE 3 · 10-YR PAIR MOAT (66%→96%) VS. CLOUD CLIFF');

      svg.append('text')
        .attr('x', 836).attr('y', 28).attr('text-anchor', 'end')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('Cliff: ' + dDays + 'd · Yr-' + yrN + ' Moat: ' + yrNMoat + '%');

      // Left Panel: 10-Year Trajectory
      svg.append('rect')
        .attr('x', 18).attr('y', 44).attr('width', 432).attr('height', 298).attr('rx', 10)
        .attr('fill', '#151922').attr('stroke', '#2a2f3a').attr('stroke-width', 1.3);

      svg.append('text')
        .attr('x', 32).attr('y', 68)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12.5).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('1. 10-YR MOAT VS. CLOUD BURN');

      var x = d3.scaleLinear().domain([1, 10]).range([68, 426]);
      var y = d3.scaleLinear().domain([0, 100]).range([292, 86]);

      var xAxis = d3.axisBottom(x).ticks(5).tickFormat(function (d) { return 'Yr ' + d; });
      var yAxis = d3.axisLeft(y).tickValues([0, 25, 50, 75, 100]).tickFormat(function (d) { return d + '%'; });

      svg.append('g')
        .attr('transform', 'translate(0,292)')
        .call(xAxis)
        .attr('color', '#8c95a6')
        .selectAll('text').attr('font-family', 'ui-monospace, monospace').attr('font-size', 12);

      svg.append('g')
        .attr('transform', 'translate(68,0)')
        .call(yAxis)
        .attr('color', '#8c95a6')
        .selectAll('text').attr('font-family', 'ui-monospace, monospace').attr('font-size', 12);

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
        .attr('x', 82).attr('y', 104)
        .attr('font-family', 'system-ui, sans-serif')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('1:1 Pair Moat: 66% → 96%');

      svg.append('text')
        .attr('x', 112).attr('y', 252)
        .attr('font-family', 'system-ui, sans-serif')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#ef6a52')
        .text('Cloud Margin (' + dDays + 'd · -$' + annualBurn + 'B/yr)');

      // Right Panel: Stacked Breakdown of Year-N Pair Moat
      svg.append('rect')
        .attr('x', 464).attr('y', 44).attr('width', 376).attr('height', 298).attr('rx', 10)
        .attr('fill', '#151922').attr('stroke', '#2a2f3a').attr('stroke-width', 1.3);

      svg.append('text')
        .attr('x', 480).attr('y', 68)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12.5).attr('font-weight', 700).attr('fill', '#e5a93c')
        .text('2. YR-' + yrN + ' PAIR MOAT BREAKDOWN');

      var scaleFactor = yrNMoat / 96;
      var craftPct = Math.round(34 * scaleFactor);
      var memPct = Math.round(32 * scaleFactor);
      var loraPct = yrNMoat - craftPct - memPct;
      var openPct = 100 - yrNMoat;

      var layers = [
        { y: 88, label: '1. Tacit Craft (' + craftPct + '%)', pct: craftPct, color: '#4fb3a8', desc: 'Embodied human domain judgment' },
        { y: 146, label: '2. Episodic Memory (' + memPct + '%)', pct: memPct, color: '#5da2d5', desc: 'Encrypted local OCap history' },
        { y: 204, label: '3. Local LoRA (' + loraPct + '%)', pct: loraPct, color: '#e5a93c', desc: 'On-device rank-16 weights' },
        { y: 262, label: '4. Open Base (' + openPct + '%)', pct: openPct, color: '#ef6a52', desc: 'Distilled in ' + dDays + 'd to power cost' }
      ];

      var barScale = d3.scaleLinear().domain([0, 45]).range([0, 340]);

      layers.forEach(function (ly) {
        svg.append('text')
          .attr('x', 480).attr('y', ly.y + 14)
          .attr('font-family', 'system-ui, sans-serif')
          .attr('font-size', 12).attr('font-weight', 700).attr('fill', ly.color)
          .text(ly.label);

        var bw = Math.max(18, Math.min(340, barScale(ly.pct)));
        svg.append('rect')
          .attr('x', 480).attr('y', ly.y + 20)
          .attr('width', bw).attr('height', 15).attr('rx', 4)
          .attr('fill', ly.color);

        svg.append('text')
          .attr('x', 480).attr('y', ly.y + 50)
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-size', 12).attr('fill', '#9aa3b2')
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
        svgLabel.textContent = 'Yr-' + y + ' Pair Moat: ' + pairMoat + '% · ' + d + 'd Cliff';
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

  /* ==========================================================================
     PER-LENS INTERACTIVE D3 MINI STRESS-TESTERS (.ws-lens-sim / .ws-lens-d3-gauge)
     ========================================================================== */
  function initLensMiniGaugesD3() {
    var d3 = window.d3;
    if (!d3) return;

    function drawDualMiniGauge(svgEl, badPct, okPct, badLabel, okLabel) {
      svgEl.setAttribute('viewBox', '0 0 680 64');
      var svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      svg.append('rect')
        .attr('x', 1).attr('y', 1)
        .attr('width', 678).attr('height', 62).attr('rx', 7)
        .attr('fill', '#12151d')
        .attr('stroke', '#28303e')
        .attr('stroke-width', 1.1);

      var scale = d3.scaleLinear().domain([0, 100]).range([0, 190]);

      // Row 1: Legacy / Status Quo
      svg.append('text')
        .attr('x', 12).attr('y', 23)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#ef6a52')
        .text('STATUS QUO');

      svg.append('rect')
        .attr('x', 112).attr('y', 10)
        .attr('width', 190).attr('height', 15).attr('rx', 3)
        .attr('fill', '#1c212d');

      svg.append('rect')
        .attr('x', 112).attr('y', 10)
        .attr('width', Math.max(4, scale(badPct))).attr('height', 15).attr('rx', 3)
        .attr('fill', '#ef6a52');

      svg.append('text')
        .attr('x', 312).attr('y', 23)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#e9e6de')
        .text(badLabel);

      // Row 2: CIN Co-Intelligence
      svg.append('text')
        .attr('x', 12).attr('y', 49)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('CIN PROTOCOL');

      svg.append('rect')
        .attr('x', 112).attr('y', 36)
        .attr('width', 190).attr('height', 15).attr('rx', 3)
        .attr('fill', '#1c212d');

      svg.append('rect')
        .attr('x', 112).attr('y', 36)
        .attr('width', Math.max(6, scale(okPct))).attr('height', 15).attr('rx', 3)
        .attr('fill', '#4fb3a8');

      svg.append('text')
        .attr('x', 312).attr('y', 49)
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text(okLabel);
    }

    var sliders = document.querySelectorAll('.ws-lens-slider[data-lens-slider]');
    sliders.forEach(function (slider) {
      var key = slider.getAttribute('data-lens-slider');
      var gaugeEl = document.querySelector('.ws-lens-d3-gauge[data-lens-gauge="' + key + '"]');
      if (!gaugeEl) return;

      function updateLensGauge() {
        var v = Number(slider.value);
        if (key === 'labs') {
          var vEl = document.getElementById('ws-ls-labs-val');
          if (vEl) vEl.textContent = '$' + v + 'k/yr';
          var shapleyK = Math.round(v * 0.95);
          var commonsK = v - shapleyK;
          drawDualMiniGauge(
            gaugeEl,
            4,
            95,
            '$0 Royalty · 72% Cloud Rent',
            '$' + shapleyK + 'k Shapley (95%) + $' + commonsK + 'k Floor'
          );
        } else if (key === 'safety') {
          var sEl = document.getElementById('ws-ls-safety-val');
          if (sEl) sEl.textContent = '10^' + v + ' b/s';
          var gapExp = Math.max(1, v - 2);
          var bioPct = Math.max(3, 40 - (v - 3) * 4);
          drawDualMiniGauge(
            gaugeEl,
            bioPct,
            98,
            '~40 b/s vs 10^' + gapExp + '× Swarm Gap',
            'Zone 4 Airlock + 24h Mortal Lease'
          );
        } else if (key === 'gov') {
          var gEl = document.getElementById('ws-ls-gov-val');
          var mult = Math.pow(2, v);
          if (gEl) gEl.textContent = v + ' (' + mult + '×)';
          var statPct = Math.max(4, Math.round(64 / v));
          drawDualMiniGauge(
            gaugeEl,
            statPct,
            96,
            '36-Mo Lag (' + mult + '× Behind AI)',
            '<10ms Quorum + $25k Floor (2%/mo)'
          );
        } else if (key === 'research') {
          var rEl = document.getElementById('ws-ls-research-val');
          if (rEl) rEl.textContent = v + '/yr';
          var endowK = Math.round(v * 4.2);
          drawDualMiniGauge(
            gaugeEl,
            2,
            95,
            '$0 arXiv Scrape · <1% GPUs',
            '+$' + endowK + 'k/yr Shapley + 95.3% SPRA Cut'
          );
        } else if (key === 'enterprise') {
          var eEl = document.getElementById('ws-ls-enterprise-val');
          if (eEl) eEl.textContent = v + ' Firms';
          var savings = Math.min(34, Math.round(18 + (v / 500) * 16));
          drawDualMiniGauge(
            gaugeEl,
            28,
            94,
            '-32% GPO/SaaS Toll · IP Leaked',
            '+' + savings + '% PSI Co-Op · 0B Wasm Egress'
          );
        } else if (key === 'humanity') {
          var hEl = document.getElementById('ws-ls-humanity-val');
          if (hEl) hEl.textContent = v + '%';
          var share = Math.round(24 + (v / 95) * 64);
          var payBoost = Math.round(12 + (v / 95) * 26);
          drawDualMiniGauge(
            gaugeEl,
            24,
            share,
            '-38% Cartel Dump (24% Share)',
            '+' + payBoost + '% Pay (' + share + '% Parity) + $8 Pre-ADC'
          );
        } else if (key === 'pair') {
          var pEl = document.getElementById('ws-ls-pair-val');
          if (pEl) pEl.textContent = v + (v === 1 ? ' Yr' : ' Yrs');
          var pMoat = Math.min(96, Math.round(66 + ((v - 1) / 9) * 30));
          var cMoat = Math.max(4, 14 - v);
          drawDualMiniGauge(
            gaugeEl,
            cMoat,
            pMoat,
            cMoat + '% Cloud Moat (60-90d Cliff)',
            pMoat + '% Pair Moat (Craft + 10y LoRA)'
          );
        }
      }

      slider.addEventListener('input', updateLensGauge);
      updateLensGauge();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initEcosystemD3();
      initDeepSimD3();
      initPairMoatSimulator();
      initLensMiniGaugesD3();
    });
  } else {
    initEcosystemD3();
    initDeepSimD3();
    initPairMoatSimulator();
    initLensMiniGaugesD3();
  }
})();
