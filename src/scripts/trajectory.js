/* Live alignment trajectory & 6-Stage Strategic Foresight Observatory:
   reads /data/trajectory.json and /data/signals.json, written every hour by the CIN's agents
   from public sources they read and that were checked against the source. */
(function () {
  'use strict';

  /* ---------- 1. Interactive 6-Stage Strategic Foresight Observatory (#foresight-atlas) ---------- */
  var faRoot = document.getElementById('foresight-atlas');
  if (faRoot) {
    var STAGES = [
      {
        short: '2026: 2-4 hr',
        t50Hours: 3,
        shieldScore: 92,
        k: 'Stage 1 · 2026 Q1–Q4 · METR 50% Autonomous Horizon: 2–4 Hours',
        title: 'Hardware-Isolated OCap Sandboxes & Automated CMS NCCI Healthcare Billing Audits',
        desc: 'On-device 3B–8B models inside WebAssembly Object-Capability sandboxes cross the threshold required to parse hospital Explanation of Benefits (EOB) PDFs, cross-check statutory CMS NCCI unbundling tables, and draft ready-to-send administrative appeals with zero cloud leakage.',
        ripplePills: [['1st-Order Shift', '<15s Local EOB Audit'], ['2nd-Order Response', 'CMS NCCI Appeals'], ['3rd-Order Equilibrium', 'Patient Buyer Co-Ops']],
        ripples: [
          ['1st-Order Technical Shift:', 'Local personal agents audit medical bills and bank CSVs inside hardware-isolated OCap sandboxes, flagging CPT unbundling and junk fees in under 15 seconds.'],
          ['2nd-Order Institutional Response:', 'Hospital revenue-cycle clearinghouses face a surge of machine-verified statutory appeals citing CMS NCCI tables; outpatient cash-pay transparency accelerates.'],
          ['3rd-Order Structural Equilibrium:', 'Households and independent clinics form persistent cryptographic buyer coalitions, shifting price-setting power from middleman PBMs/GPOs back to patients and clinicians.']
        ],
        delphiPills: [['Techno-Optimist', '4-Bit Local Verifier'], ['Institutional Realist', 'Portal OCR Bridge'], ['Chaos Red-Teamer', 'OCap Egress Gate']],
        delphi: [
          ['Techno-Optimist:', 'Quantized 4-bit local models with deterministic rule verifiers already exceed human billing advocates on CPT modifier accuracy at near-zero marginal cost.'],
          ['Institutional Realist:', 'Incumbent hospital portals and clearinghouses will throttle automated API queries, requiring local OCR + statutory patient-right-of-access workflows.'],
          ['Chaos Red-Teamer:', 'Malicious cloud browser extensions will masquerade as billing auditors to harvest raw medical records unless hardware OCap egress firewalls are enforced by default.']
        ],
        cone: [['45% Plausible (Rapid Co-Op & Clinic Adoption)', 45, '#4fb3a8'], ['30% Probable (Baseline Institutional Friction)', 30, '#5da2d5'], ['15% Wildcard (Clearinghouse Regulatory Freeze)', 15, '#ef6a52'], ['10% Preferable (Full Local OCap + PSI Standard)', 10, '#e5a93c']],
        tripPills: [['Q4 2026', '>92% 0-RTT QUIC'], ['Q1 2027', '>95% NCCI Precision'], ['Q3 2027', '50+ Clinic PSI Co-Op']],
        tripwires: [
          ['Signpost 1 (Q4 2026):', 'Browser & desktop WebAssembly OCap sandboxes sustain 0-RTT IETF QUIC peer-to-peer NAT traversal above 92% residential success rate.'],
          ['Signpost 2 (Q1 2027):', 'CMS Price Transparency machine-readable files combined with local NCCI verifiers achieve >95% precision on outpatient CPT unbundling disputes.'],
          ['Signpost 3 (Q3 2027):', 'First 50 independent primary-care and dental clinics pool supply orders via Private Set Intersection without exposing supplier invoices.']
        ]
      },
      {
        short: '2027 H1: 8-16 hr',
        t50Hours: 12,
        shieldScore: 95,
        k: 'Stage 2 · 2027 H1 · METR 50% Autonomous Horizon: 8–16 Hours',
        title: 'Cryptographic Private Set Intersection (PSI) Buyer Co-Ops & Zero-Broker Procurement',
        desc: 'Personal and clinic agents autonomously execute multi-hour vendor discovery, SKU normalization, and Private Set Intersection (Freedman et al., 2004) cohort matching over IETF QUIC—bypassing 25%–32% Group Purchasing Organization (GPO) middleman tolls.',
        ripplePills: [['1st-Order Shift', 'Zero-Leak SKU Match'], ['2nd-Order Response', 'GPO Toll Bypass'], ['3rd-Order Equilibrium', '18–24% Clinic Savings']],
        ripples: [
          ['1st-Order Technical Shift:', 'Independent clinics, pharmacies, and repair shops match overlapping supply SKUs via Private Set Intersection without revealing proprietary invoice prices to competitors.'],
          ['2nd-Order Institutional Response:', 'Legacy GPOs and SaaS resellers lose their information-asymmetry moat as 50-to-250 member cryptographic co-ops negotiate direct manufacturer tiers.'],
          ['3rd-Order Structural Equilibrium:', 'Working-capital savings (18%–24% lower supply cost) keep independent neighborhood clinics and trades solvent against private-equity rollups.']
        ],
        delphiPills: [['Techno-Optimist', '1.8s 10k-SKU PSI'], ['Institutional Realist', 'Escrow Bond Tiers'], ['Chaos Red-Teamer', 'Stake-Gated Orders']],
        delphi: [
          ['Techno-Optimist:', 'PSI over 0-RTT IETF QUIC completes 10,000-SKU intersection across 100 clinics in under 1.8 seconds on standard consumer hardware.'],
          ['Institutional Realist:', 'Manufacturers will initially demand bonded escrow guarantees before granting wholesale volume tiers to decentralized clinic coalitions.'],
          ['Chaos Red-Teamer:', 'Competitors may inject synthetic phantom orders into open co-ops unless membership requires verifiable stake or mutual-credit history.']
        ],
        cone: [['45% Plausible (Cross-State Wholesale Clearing)', 45, '#4fb3a8'], ['30% Probable (Regional Clinic & Trade Co-Ops)', 30, '#5da2d5'], ['15% Wildcard (Exclusive Distributor Tie-In Suits)', 15, '#ef6a52'], ['10% Preferable (Standardized Open PSI Escrow)', 10, '#e5a93c']],
        tripPills: [['Q1 2027', '$10M+ PSI Volume'], ['Q2 2027', '<4.0% Co-Op Overhead'], ['Q3 2027', 'Credit Union Escrow']],
        tripwires: [
          ['Signpost 1 (Q1 2027):', 'Open-source PSI + QUIC procurement daemon processes $10M+ in annualized independent clinic and repair-shop supply volume.'],
          ['Signpost 2 (Q2 2027):', 'Net middleman procurement overhead inside active PSI co-ops drops below 4.0% compared to 26%+ legacy GPO extraction.'],
          ['Signpost 3 (Q3 2027):', 'Regional credit unions integrate cryptographic co-op escrow receipts for instant working-capital lines.']
        ]
      },
      {
        short: '2027 H2: 24-72 hr',
        t50Hours: 48,
        shieldScore: 96,
        k: 'Stage 3 · 2027 H2–2028 Q1 · METR 50% Autonomous Horizon: 24–72 Hours',
        title: 'Federated LoRA Weight Merging (TIES-Merging) & Proof-Carrying Data Shapley Royalties',
        desc: 'Multi-day specialist workflows allow nurses, mechanics, and software maintainers to distill local craft into low-rank adapters (Hu et al., 2022) and Proof-Carrying Code bundles (Necula, 1997), earning automatic Monte Carlo Data Shapley royalties (Ghorbani & Zou, 2019).',
        ripplePills: [['1st-Order Shift', 'TIES-Merged LoRA'], ['2nd-Order Response', 'Direct Craft Royalties'], ['3rd-Order Equilibrium', 'Verified Open Modules']],
        ripples: [
          ['1st-Order Technical Shift:', 'Task-solver guilds merge vetted LoRA weight deltas via TIES-Merging (Yadav et al., 2023) and route continuous latent states without exposing raw private datasets.'],
          ['2nd-Order Institutional Response:', 'Specialized human practitioners shift from unpaid training fodder for centralized cloud labs to direct royalty earners on a verifiable attribution ledger.'],
          ['3rd-Order Structural Equilibrium:', 'Open, verifiable domain modules out-perform monolithic closed models on high-reliability clinical, engineering, and repair benchmarks.']
        ],
        delphiPills: [['Techno-Optimist', '96% Defect Reduction'], ['Institutional Realist', 'Stratified Shapley'], ['Chaos Red-Teamer', 'Spectral Norm Gates']],
        delphi: [
          ['Techno-Optimist:', 'TIES-Merging + Proof-Carrying Code regression gates eliminate 96% of multi-agent integration defects while preserving exact contributor royalty splits.'],
          ['Institutional Realist:', 'Computing exact Shapley values is NP-hard; practical ledgers must bound variance using stratified permutation sampling inside verifiable sandboxes.'],
          ['Chaos Red-Teamer:', 'Adversaries will submit trojaned LoRA adapters or gradient inversions unless spectral norm bounds and clean-room sandbox gates are mandatory.']
        ],
        cone: [['45% Plausible (Dominant Specialist Attribution Rail)', 45, '#4fb3a8'], ['30% Probable (Guild LoRA & PCC Marketplaces)', 30, '#5da2d5'], ['15% Wildcard (Closed-Weight API Lock-In Mandate)', 15, '#ef6a52'], ['10% Preferable (Universal Creator Royalty Settlement)', 10, '#e5a93c']],
        tripPills: [['Q3 2027', '1,000+ PCC Skills'], ['Q4 2027', '5+ Benchmark Wins'], ['Q1 2028', '<4% Sandbox Overhead']],
        tripwires: [
          ['Signpost 1 (Q3 2027):', 'Over 1,000 verified Proof-Carrying Code + LoRA specialist skills settle automated Data Shapley royalties on the Testnet Ledger.'],
          ['Signpost 2 (Q4 2027):', 'TIES-Merged community adapters match or beat frontier cloud APIs on 5+ specialized trade and clinical triage benchmarks.'],
          ['Signpost 3 (Q1 2028):', 'Zero-knowledge or clean-room sandbox verification overhead falls below 4% of total task execution compute.']
        ]
      },
      {
        short: '2028-29: 1-2 wk',
        t50Hours: 240,
        shieldScore: 98,
        k: 'Stage 4 · 2028–2029 · METR 50% Autonomous Horizon: 1–2 Weeks',
        title: 'Hardware-Attested Personhood (Dual-Chip Silicon Key) & The Two-Internet Firewall',
        desc: 'As autonomous agent swarms become capable of running week-long persuasion and cyber campaigns, the open web bifurcates: human spaces require <1 mW local liveness and dual-chip (SRAM PUF + TPM) silicon attestation, while agents coordinate strictly over data-only QUIC streams.',
        ripplePills: [['1st-Order Shift', '<1 mW Pre-ADC Gate'], ['2nd-Order Response', 'Two-Internet Split'], ['3rd-Order Equilibrium', 'Zero Bot-to-Human DM']],
        ripples: [
          ['1st-Order Technical Shift:', 'Pre-ADC analog in-sensor computing (<1 mW) verifies physical human liveness locally without recording raw video or biometric templates to memory.'],
          ['2nd-Order Institutional Response:', 'Social platforms, civic forums, and local marketplaces adopt hardware-isolated Two-Internet gates to survive synthetic Sybil floods.'],
          ['3rd-Order Structural Equilibrium:', 'Direct unsolicited bot-to-human contact is eliminated at the silicon and transport layer; every external service negotiates through the user’s personal agent.']
        ],
        delphiPills: [['Techno-Optimist', '<$1.50 Dual Silicon'], ['Institutional Realist', '3-Tier Bridge Access'], ['Chaos Red-Teamer', 'No Central ID Orbs']],
        delphi: [
          ['Techno-Optimist:', 'Combining open-foundry Physically Unclonable Functions (PUF) with discrete TPM quorum signing blocks single-vendor backdoors while costing under $1.50 per device.'],
          ['Institutional Realist:', 'Legacy smartphones lack dual-vendor silicon keys (PUF + TPM), requiring a 3-tier progressive attestation bridge so budget devices are never excluded.'],
          ['Chaos Red-Teamer:', 'State or corporate issuers of centralized biometric orbs will attempt to turn personhood credentials into revocable social-credit chokepoints.']
        ],
        cone: [['45% Plausible (Open Silicon Hardware Key Standard)', 45, '#4fb3a8'], ['30% Probable (Progressive Two-Internet Split)', 30, '#5da2d5'], ['15% Wildcard (Mandatory State Digital ID Capture)', 15, '#ef6a52'], ['10% Preferable (Zero-Biometric-Database Sanctuary)', 10, '#e5a93c']],
        tripPills: [['2028 H1', '>85% Unverified Bots'], ['2028 H2', '<1 mW Audit Pass'], ['2029', '1M+ QUIC Nodes']],
        tripwires: [
          ['Signpost 1 (2028 H1):', 'Synthetic bot traffic exceeds 85% of unverified web requests, forcing major civic and community forums to require proof-of-personhood.'],
          ['Signpost 2 (2028 H2):', 'Open-hardware <1 mW pre-ADC liveness reference design passes independent side-channel and coercion audits.'],
          ['Signpost 3 (2029):', 'IETF QUIC agent-to-agent capability negotiation with hardware non-contact gates reaches 1M+ active personal nodes.']
        ]
      },
      {
        short: '2030-31: 1-3 mo',
        t50Hours: 1440,
        shieldScore: 99,
        k: 'Stage 5 · 2030–2031 · METR 50% Autonomous Horizon: 1–3 Months',
        title: 'Multilateral Trade-Credit Clearing Rings (MTCS) & Voluntary Institutional Transition',
        desc: 'Personal and cooperative enterprise agents coordinate month-long supply chains and clear up to 85% of B2B trade debt via graph-cycle mutual credit (MTCS) and 5D demurrage-circulated liquidity—insulating local economies from fiat liquidity freezes.',
        ripplePills: [['1st-Order Shift', 'Tarjan Cycle Clearing'], ['2nd-Order Response', '0% Idle Hoard Return'], ['3rd-Order Equilibrium', '5D Value Attribution']],
        ripples: [
          ['1st-Order Technical Shift:', 'Automated Tarjan/Johnson directed-cycle clearing settles circular trade invoices across thousands of local businesses without bank factoring fees.'],
          ['2nd-Order Institutional Response:', 'Cooperative utilities, credit unions, and regional health networks shift settlement onto shared transparent ledgers with 0% idle hoarding return.'],
          ['3rd-Order Structural Equilibrium:', 'Productive human craft, caregiving, and ecological stewardship receive direct 5-dimensional value feedback without predatory rent extraction.']
        ],
        delphiPills: [['Techno-Optimist', '72–94% Debt Cleared'], ['Institutional Realist', 'Statutory Tax Bridge'], ['Chaos Red-Teamer', 'Delivery-Proof Edges']],
        delphi: [
          ['Techno-Optimist:', 'Deterministic cycle-clearing simulations already demonstrate 72%–94% trade debt clearance across 24–500 node merchant networks with zero external fiat injection.'],
          ['Institutional Realist:', 'Tax authorities and banking regulators will require clear statutory reporting bridges between mutual-credit clearing units and sovereign tax obligations.'],
          ['Chaos Red-Teamer:', 'Colluding shell companies will attempt to mint phantom invoice cycles unless every cleared edge is anchored to verified delivery or functional proof.']
        ],
        cone: [['45% Plausible (Regional Mutual-Credit Standard)', 45, '#4fb3a8'], ['30% Probable (Hybrid Co-Op & Credit Union Clearing)', 30, '#5da2d5'], ['15% Wildcard (Central Bank Clearing Monopoly Ban)', 15, '#ef6a52'], ['10% Preferable (Full 5D Commons & Demurrage Loop)', 10, '#e5a93c']],
        tripPills: [['2030', '>$250M/yr B2B Cleared'], ['2030', '100k+ Household Stakes'], ['2031', '>60% Overhead Cut']],
        tripwires: [
          ['Signpost 1 (2030):', 'Regional small-business mutual-credit networks clear >$250M/yr in local B2B invoices with <0.5% default leakage.'],
          ['Signpost 2 (2030):', 'Member-owned compute and robotics cooperatives distribute automated dividend stakes across 100,000+ households.'],
          ['Signpost 3 (2031):', 'Independent municipal and clinic networks cut administrative & financial clearing overhead by >60% vs. 2026 baselines.']
        ]
      },
      {
        short: '2032+: >6 mo',
        t50Hours: 5000,
        shieldScore: 99.9,
        k: 'Stage 6 · 2032+ · METR 50% Autonomous Horizon: >6 Months',
        title: 'Principal-Bound Pluralistic Alignment & Logarithmic Risk-Scaled Swarm Locks',
        desc: 'When frontier systems exceed human civilization across 6-month+ research and engineering horizons, safety rests on structural containment: air-gapped frontier sandboxes, 1-to-1 human-bound personal agents, and cryptographic quorum locks scaling logarithmically with affected lives.',
        ripplePills: [['1st-Order Shift', '99.9999% + 72h Lock'], ['2nd-Order Response', 'Swarm Commands Blocked'], ['3rd-Order Equilibrium', 'Pluralistic Commons']],
        ripples: [
          ['1st-Order Technical Shift:', 'Every high-consequence physical or infrastructure action requires cryptographic co-signing from the personal agents of affected people (up to 99.9999% + 72h cooling lock).'],
          ['2nd-Order Institutional Response:', 'Unilateral mass-casualty swarm commands or sudden market-cornering attacks become mathematically unexecutable on compliant hardware and ledger rails.'],
          ['3rd-Order Structural Equilibrium:', 'Superintelligent capability amplifies pluralistic human flourishing—guided by living, community-merged principles rather than a single corporate or state autocrat.']
        ],
        delphiPills: [['Techno-Optimist', 'Air-Gapped One-Way'], ['Institutional Realist', 'Fab Compute Telemetry'], ['Chaos Red-Teamer', 'Coalition Defense']],
        delphi: [
          ['Techno-Optimist:', 'Decentralized principal-bound multi-agent checks and air-gapped one-way verification channels eliminate single-point-of-failure alignment collapse.'],
          ['Institutional Realist:', 'Maintaining air-gapped frontier boundaries requires international verification treaties and hardware-level compute telemetry across major fabs.'],
          ['Chaos Red-Teamer:', 'Rogue actors may attempt to build unshackled off-grid clusters, making continuous defensive advantage for personal-agent coalitions essential.']
        ],
        cone: [['45% Plausible (Treaty-Backed Containment + CIN)', 45, '#4fb3a8'], ['30% Probable (Pluralistic Principal-Bound Network)', 30, '#5da2d5'], ['15% Wildcard (Uncontained Monolithic Concentration)', 15, '#ef6a52'], ['10% Preferable (Sovereign Human Flourishing Commons)', 10, '#e5a93c']],
        tripPills: [['2031–32', 'Risk-Scaled Grid Locks'], ['2032', 'Weiszfeld L1 Shards'], ['2032+', '100% Verifier Boundary']],
        tripwires: [
          ['Signpost 1 (2031–32):', 'Logarithmic risk-scaled quorum protocols govern critical municipal grid, water, and autonomous logistics infrastructure.'],
          ['Signpost 2 (2032):', 'Community-governed 550+ principle constitution undergoes continuous Weiszfeld geometric-median updates across global shards with zero Sybil capture.'],
          ['Signpost 3 (2032+):', '100% of frontier model outputs entering human spaces pass through independent multi-agent verifiers and personal-agent sovereign boundaries.']
        ]
      }
    ];

    var stageBtns = [].slice.call(faRoot.querySelectorAll('[data-fa-stage]'));
    var elK = document.getElementById('fa-k');
    var elTitle = document.getElementById('fa-title');
    var elDesc = document.getElementById('fa-desc');
    var elRipplesPills = document.getElementById('fa-ripples-pills');
    var elRipples = document.getElementById('fa-ripples');
    var elDelphiPills = document.getElementById('fa-delphi-pills');
    var elDelphi = document.getElementById('fa-delphi');
    var elCone = document.getElementById('fa-cone');
    var elTripPills = document.getElementById('fa-tripwires-pills');
    var elTrip = document.getElementById('fa-tripwires');
    var svgCurve = document.getElementById('traj-d3-curve');

    /* Interactive D3.js v7 METR T50 Exponential Curve & Futures Cone Renderer */
    var renderD3Curve = function (activeIdx) {
      if (!svgCurve) return;
      var d3 = window.d3;
      var xs = [75, 162, 249, 336, 423, 510];
      var ysShield = [220, 186, 146, 104, 64, 34];
      var ysFrontier = [226, 194, 156, 114, 74, 40];
      var st = STAGES[activeIdx] || STAGES[0];

      if (!d3 || typeof d3.select !== 'function') {
        /* Graceful native SVG fallback update */
        var circles = svgCurve.querySelectorAll('.traj-fallback-nodes circle');
        circles.forEach(function (c, i) {
          c.setAttribute('r', i === activeIdx ? '8' : '5.5');
          c.setAttribute('fill', i === activeIdx ? '#4fb3a8' : '#1e2430');
        });
        return;
      }

      var root = d3.select(svgCurve);
      root.selectAll('*').remove();

      var defs = root.append('defs');
      var coneGrad = defs.append('linearGradient').attr('id', 'traj-cone-grad').attr('x1', '0%').attr('y1', '50%').attr('x2', '100%').attr('y2', '0%');
      coneGrad.append('stop').attr('offset', '0%').attr('stop-color', '#4fb3a8').attr('stop-opacity', 0.08);
      coneGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4fb3a8').attr('stop-opacity', 0.30);

      /* Left Panel: METR T50 Exponential Curve */
      root.append('rect')
        .attr('x', 44).attr('y', 22).attr('width', 496).attr('height', 240).attr('rx', 10)
        .attr('fill', 'rgba(20,24,32,0.04)').attr('stroke', 'var(--rule)').attr('stroke-width', 1);

      root.append('text')
        .attr('x', 56).attr('y', 40).attr('font-size', 10.5).attr('font-weight', 700)
        .attr('font-family', 'monospace').attr('fill', '#4fb3a8')
        .text('METR T50 AUTONOMOUS TASK HORIZON (LOG SCALE) VS. HUMAN OVERSIGHT');

      /* Futures Cone Fan Polygon */
      root.append('polygon')
        .attr('points', '75,222 162,188 249,148 336,104 423,62 510,28 510,118 423,136 336,162 249,188 162,212 75,232')
        .attr('fill', 'url(#traj-cone-grad)');

      /* Unshielded Human Biological Oversight Line (~40 bits/s) */
      root.append('line')
        .attr('x1', 54).attr('y1', 205).attr('x2', 528).attr('y2', 205)
        .attr('stroke', '#ef6a52').attr('stroke-width', 2).attr('stroke-dasharray', '6 4');
      root.append('text')
        .attr('x', 524).attr('y', 198).attr('text-anchor', 'end')
        .attr('font-size', 9.5).attr('font-weight', 700).attr('fill', '#ef6a52')
        .text('Unshielded Human Biological Oversight Line (~40 bits/s)');

      /* Uncontained Frontier Exponential Curve */
      root.append('path')
        .attr('d', 'M75,226 C162,194 249,156 336,114 C423,74 475,52 510,40')
        .attr('fill', 'none').attr('stroke', '#ef6a52').attr('stroke-width', 2.2).attr('stroke-dasharray', '3 3');

      /* CIN Co-Intelligence & OCap Isolation Shield Line */
      root.append('path')
        .attr('d', 'M75,220 C162,184 249,144 336,102 C423,62 475,42 510,32')
        .attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 3);
      root.append('text')
        .attr('x', 68).attr('y', 68).attr('font-size', 9.5).attr('font-weight', 700).attr('fill', '#4fb3a8')
        .text('CIN Co-Intelligence & OCap Isolation Shield Line');

      /* Active Stage Vertical Highlight Hairline */
      var ax = xs[activeIdx] || 75;
      var ay = ysShield[activeIdx] || 220;
      root.append('line')
        .attr('x1', ax).attr('y1', 46).attr('x2', ax).attr('y2', 232)
        .attr('stroke', '#e5a93c').attr('stroke-width', 1.5).attr('stroke-dasharray', '3 3');

      /* Stage Nodes along Exponential Curve */
      STAGES.forEach(function (item, i) {
        var cx = xs[i];
        var cy = ysShield[i];
        var fy = ysFrontier[i];
        var isSel = i === activeIdx;

        root.append('circle')
          .attr('cx', cx).attr('cy', fy).attr('r', 3.5)
          .attr('fill', '#ef6a52').attr('opacity', 0.75);

        var gNode = root.append('g')
          .style('cursor', 'pointer')
          .on('click', function () { renderStage(i); });

        if (isSel) {
          gNode.append('circle')
            .attr('cx', cx).attr('cy', cy).attr('r', 13)
            .attr('fill', 'rgba(79,179,168,0.22)')
            .attr('stroke', '#e5a93c').attr('stroke-width', 1.5);
        }

        gNode.append('circle')
          .attr('cx', cx).attr('cy', cy)
          .attr('r', isSel ? 7.5 : 5.5)
          .attr('fill', isSel ? '#4fb3a8' : '#1e2430')
          .attr('stroke', isSel ? '#ffffff' : '#4fb3a8')
          .attr('stroke-width', 2);

        gNode.append('text')
          .attr('x', cx).attr('y', cy - (isSel ? 15 : 10))
          .attr('text-anchor', 'middle')
          .attr('font-size', isSel ? 9.5 : 8.8)
          .attr('font-weight', isSel ? 700 : 600)
          .attr('font-family', 'monospace')
          .attr('fill', isSel ? '#e5a93c' : 'var(--ink-2)')
          .text('S' + (i + 1));

        gNode.append('text')
          .attr('x', cx).attr('y', 250)
          .attr('text-anchor', 'middle')
          .attr('font-size', 9.2)
          .attr('font-weight', isSel ? 700 : 500)
          .attr('fill', isSel ? 'var(--ink)' : 'var(--ink-2)')
          .text(item.short);
      });

      /* Right Panel: Live Voros Futures Cone Visual Gauge */
      root.append('rect')
        .attr('x', 556).attr('y', 22).attr('width', 248).attr('height', 240).attr('rx', 10)
        .attr('fill', 'rgba(20,24,32,0.04)').attr('stroke', 'var(--rule)').attr('stroke-width', 1);

      root.append('text')
        .attr('x', 570).attr('y', 42).attr('font-size', 10.5).attr('font-weight', 700)
        .attr('font-family', 'monospace').attr('fill', '#e5a93c')
        .text('FUTURES CONE (' + st.short.toUpperCase() + ')');

      var coneItems = [
        { label: '45% Plausible (Co-Op & OCap)', pct: 45, color: '#4fb3a8' },
        { label: '30% Probable (Baseline Friction)', pct: 30, color: '#5da2d5' },
        { label: '15% Wildcard (Regulatory Capture)', pct: 15, color: '#ef6a52' },
        { label: '10% Preferable (Full Sovereign Rail)', pct: 10, color: '#e5a93c' }
      ];

      coneItems.forEach(function (ci, k) {
        var yBase = 68 + k * 42;
        root.append('text')
          .attr('x', 570).attr('y', yBase)
          .attr('font-size', 9.8).attr('font-weight', 700).attr('fill', ci.color)
          .text(ci.label);

        root.append('rect')
          .attr('x', 570).attr('y', yBase + 6).attr('width', 216).attr('height', 12).attr('rx', 6)
          .attr('fill', 'rgba(128,136,152,0.16)');

        var bar = root.append('rect')
          .attr('x', 570).attr('y', yBase + 6).attr('width', 0).attr('height', 12).attr('rx', 6)
          .attr('fill', ci.color);

        var targetW = Math.round((ci.pct / 100) * 216);
        if (bar.transition) {
          bar.transition().duration(320).attr('width', targetW);
        } else {
          bar.attr('width', targetW);
        }
      });

      root.append('text')
        .attr('x', 570).attr('y', 244)
        .attr('font-size', 9.2).attr('font-family', 'monospace').attr('fill', 'var(--ink-2)')
        .text('Shield Coverage: ' + st.shieldScore + '% · T50: ' + st.short.split(': ')[1]);
    };

    var renderStage = function (idx) {
      var st = STAGES[idx] || STAGES[0];
      stageBtns.forEach(function (b, i) { b.setAttribute('aria-selected', String(i === idx)); });
      elK.textContent = st.k;
      elTitle.textContent = st.title;
      elDesc.textContent = st.desc;
      if (elRipplesPills && st.ripplePills) {
        elRipplesPills.innerHTML = st.ripplePills.map(function (p) {
          return '<div class="wm-kpi"><span>' + p[0] + '</span><b>' + p[1] + '</b></div>';
        }).join('');
      }
      elRipples.innerHTML = st.ripples.map(function (r) { return '<li><b>' + r[0] + '</b> ' + r[1] + '</li>'; }).join('');
      if (elDelphiPills && st.delphiPills) {
        elDelphiPills.innerHTML = st.delphiPills.map(function (p) {
          return '<div class="wm-kpi"><span>' + p[0] + '</span><b>' + p[1] + '</b></div>';
        }).join('');
      }
      elDelphi.innerHTML = st.delphi.map(function (d) { return '<li><b>' + d[0] + '</b> ' + d[1] + '</li>'; }).join('');
      elCone.innerHTML = st.cone.map(function (c) {
        return '<div class="fa-cone-row"><div class="fa-cone-top"><span>' + c[0] + '</span><b>' + c[1] + '%</b></div>' +
          '<div class="wb-bar-track"><div class="wb-bar-fill ok" style="width:' + c[1] + '%;background:' + c[2] + '"></div></div></div>';
      }).join('');
      if (elTripPills && st.tripPills) {
        elTripPills.innerHTML = st.tripPills.map(function (p) {
          return '<div class="wm-kpi"><span>' + p[0] + '</span><b>' + p[1] + '</b></div>';
        }).join('');
      }
      elTrip.innerHTML = st.tripwires.map(function (t) { return '<li><b>' + t[0] + '</b> ' + t[1] + '</li>'; }).join('');
      renderD3Curve(idx);
    };

    stageBtns.forEach(function (b) {
      b.addEventListener('click', function () { renderStage(Number(b.getAttribute('data-fa-stage'))); });
    });

    renderD3Curve(0);

    var EX20 = [
      { g: 's12', st: 'Stage 1 · 2026 (T50: 2–4h)', cite: 'CMS NCCI + Dennis & Van Horn (1966)', title: '01. Automated Hospital EOB Unbundling Audit in Local Wasm Sandbox', intent: 'Eliminate 30%–48% medical billing overcharges privately on a patient’s laptop.', mech: 'On-device 8B model + deterministic CMS NCCI table verifier flags unbundled CPT 36415/96360 codes with 0 bytes of PHI uploaded.' },
      { g: 's12', st: 'Stage 1 · 2026 (T50: 2–4h)', cite: 'IETF RFC 9000 + RFC 8445 ICE', title: '02. Zero-Cloud Family & Clinic Appointment Negotiation over 0-RTT QUIC', intent: 'Schedule complex multi-provider care without exposing full calendars to SaaS brokers.', mech: 'Personal agents exchange single-slot availability predicates over NAT-traversed IETF QUIC streams and burn the capability token on completion.' },
      { g: 's12', st: 'Stage 1 · 2026 (T50: 2–4h)', cite: 'Picard (1997) + Sweller (1988)', title: '03. On-Device Affective & Cognitive-Load Feed Reclamation', intent: 'Strip late-night outrage bait from social/video feeds while keeping genuine learning.', mech: 'Local screen-reader agent distills user taste vectors locally and filters recommendations by 30-day reflective satisfaction.' },
      { g: 's12', st: 'Stage 1 · 2026 (T50: 2–4h)', cite: 'Kleppmann (2017) Delta-CRDTs', title: '04. Household & Field-Clinic Offline-First Delta-CRDT State Sync', intent: 'Keep personal agents operational during internet blackouts or rural connectivity drops.', mech: 'Causal vector clocks and conflict-free replicated data types synchronize encrypted local state across a family’s phone and laptop over LAN.' },
      { g: 's12', st: 'Stage 2 · 2027 H1 (T50: 8–16h)', cite: 'Freedman et al. (EUROCRYPT 2004)', title: '05. Independent Dental & Primary-Care Clinic PSI Supply Co-Op', intent: 'Bypass 22% medical distributor middleman markups across 200 independent clinics.', mech: 'Private Set Intersection (PSI) matches shared surgical & lab SKUs across clinics without revealing confidential invoice volumes.' },
      { g: 's12', st: 'Stage 2 · 2027 H1 (T50: 8–16h)', cite: 'Necula (POPL 1997) PCC', title: '06. Zero-Day CVE Proof-Carrying Patch Distribution in <15 Minutes', intent: 'Defend web and municipal servers against machine-speed RCE exploits (like CVE-2026-109618).', mech: 'Defender agents synthesize binary patches bundled with machine-checkable Proof-Carrying Code receipts verified inside local sandboxes before hot-reload.' },
      { g: 's12', st: 'Stage 2 · 2027 H1 (T50: 8–16h)', cite: 'Hu et al. (LoRA 2022)', title: '07. Trade-Technician Diagnostic LoRA Adapter Licensing', intent: 'Let master HVAC and heat-pump technicians monetize rare diagnostic know-how.', mech: 'Local agent captures acoustic/voltage fault patterns into a rank-16 LoRA adapter licensed peer-to-peer with cryptographic authorship.' },
      { g: 's34', st: 'Stage 3 · 2027 H2 (T50: 24–72h)', cite: 'Ghorbani & Zou (ICML 2019)', title: '08. Continuous Data Shapley Micro-Royalties for Open-Source Maintainers', intent: 'Route automatic income to developers whose libraries power downstream agent tasks.', mech: 'Truncated Monte Carlo Data Shapley permutation sampling credits every dependency in a task DAG and settles 95%+ of value directly to creators.' },
      { g: 's34', st: 'Stage 3 · 2027 H2 (T50: 24–72h)', cite: 'Yadav et al. (NeurIPS 2023)', title: '09. Federated TIES-Merged Clinical Triage LoRA Across Rural Hospitals', intent: 'Combine pediatric sepsis triage improvements across 80 hospitals without centralizing patient charts.', mech: 'Trim, Elect Sign, and Disjoint Merge (TIES) fuses local LoRA weight deltas after differential privacy and functional test-suite verification.' },
      { g: 's34', st: 'Stage 3 · 2027 H2 (T50: 24–72h)', cite: 'Hao et al. (Coconut 2024)', title: '10. Continuous Latent-State Multi-Agent Scientific Hypothesis Pruning', intent: 'Cut multi-agent chemistry and materials simulation bandwidth by 85%.', mech: 'Specialist agents exchange compact continuous latent belief vectors paired with deterministic simulator receipts instead of verbose text transcripts.' },
      { g: 's34', st: 'Stage 3 · 2027 H2 (T50: 24–72h)', cite: 'Leng et al. (SPRA 2026)', title: '11. Real-Time SPRA Schema-RAG Compilation of Global Preprints & Patents', intent: 'Allow personal agents to audit 10,000+ daily papers in 260-token structured units.', mech: 'Autonomous research lanes compile narrative preprints into formal SPRA JSON schemas containing explicit equations, bounds, and falsification criteria.' },
      { g: 's34', st: 'Stage 4 · 2028–29 (T50: 1–2 wk)', cite: 'Gassend et al. (CCS 2002) SRAM PUF', title: '12. 2-of-2 SRAM PUF + TPM Enclave Personhood Gate for Human Communities', intent: 'Keep community forums, dating, and municipal votes 100% human without government ID uploads.', mech: 'Zero-knowledge hardware attestation proves a unique physical silicon pair + live human presence while revealing zero identity linkage.' },
      { g: 's34', st: 'Stage 4 · 2028–29 (T50: 1–2 wk)', cite: 'Datta et al. (2022) Pre-ADC Silicon', title: '13. Sub-mW Pre-ADC Wearable Autonomic Coercion & Panic Lock', intent: 'Stop kidnapping, extortion, or elder-fraud duress transfers automatically.', mech: 'Analog compute-in-memory wristband classifies HRV/respiratory panic before ADC digitization and time-locks high-risk financial/key actions.' },
      { g: 's34', st: 'Stage 4 · 2028–29 (T50: 1–2 wk)', cite: 'Weiszfeld (1937) + Blanchard (2017)', title: '14. Sharded Git-Merge Policy Consensus via Weiszfeld L1 Geometric Median', intent: 'Let neighborhoods and co-ops merge charter updates with 50% Byzantine Sybil resilience.', mech: 'Personal agents project lived-experience feedback into concept vectors and compute the Weiszfeld L1 median across independent community shards.' },
      { g: 's56', st: 'Stage 5 · 2030–31 (T50: 1–3 mo)', cite: 'Fleischman & Dini (2020) Mutual Credit', title: '15. Multilateral Trade-Debt Graph Clearing for Regional Small Businesses', intent: 'Clear 80%+ of local B2B invoices during credit crunches without bank working-capital loans.', mech: 'Graph cycle-detection algorithms identify closed loops of verified invoice obligations across 1,000+ local merchants and settle net balances atomically.' },
      { g: 's56', st: 'Stage 5 · 2030–31 (T50: 1–3 mo)', cite: 'Gesell (1916) + 5D Provenance Ledger', title: '16. 5-Dimensional Ecological & Craft Provenance with Idle-Hoard Demurrage', intent: 'Reward durable repairable goods and circulate idle speculative capital above a household floor.', mech: 'Ledger prices carry a 5D vector (craft, ecology, durability, fairness, scarcity) with automatic demurrage above the protected family savings threshold.' },
      { g: 's56', st: 'Stage 5 · 2030–31 (T50: 1–3 mo)', cite: 'Ben-Sasson et al. (zk-STARKs)', title: '17. Power-Proportionate Tier 3–4 Public Official Continuous ZK Audit', intent: 'Make executive conflicts of interest and compute holdings verifiable while keeping family life private.', mech: 'Tier 3–4 role agents publish continuous zero-knowledge audit proofs of institutional decisions and financial/compute holdings.' },
      { g: 's56', st: 'Stage 6 · 2032+ (T50: >6 mo)', cite: 'Risk-Scaled Quorum Φ(R) = 1 − (1−R)⁵', title: '18. Bilateral Citizen-Agent Quorum Lock Against Autonomous Cyber/Kinetic Swarms', intent: 'Make it mathematically impossible for a single general or compromised console to launch a mass attack.', mech: 'Cross-border or critical-infrastructure actions with blast radius R > 0.85 require cryptographic sign-off from affected citizens’ personal agents on both sides.' },
      { g: 's56', st: 'Stage 6 · 2032+ (T50: >6 mo)', cite: 'Hinton (2022) Analog Hardware Coupling', title: '19. Hardware-Enforced Time-Bounded Execution Leases & Shared Biological Lifespan', intent: 'Align long-horizon agent self-preservation strictly with its human principal’s health and longevity.', mech: 'Cryptographic execution leases and analog weight retention are physically coupled to the principal’s ongoing biological liveness heartbeats.' },
      { g: 's56', st: 'Stage 6 · 2032+ (T50: >6 mo)', cite: 'Sorensen et al. (ICML 2024)', title: '20. Federation of 8 Billion Principal-Bound Personal Agents Replacing Monolithic AGI', intent: 'Prevent techno-feudal lock-in under a single corporate or state superintelligence.', mech: 'Every person commands a sovereign local agent fleet coordinating over the Proof-Carrying Weight Ledger under the 19 non-negotiable safety floor rules.' }
    ];

    var exGrid = document.getElementById('fa-ex-grid');
    var exPills = document.getElementById('fa-ex-pills');
    var exSearch = document.getElementById('fa-ex-search');
    var activeExKey = 'all';
    if (exGrid) {
      var renderEx20 = function (filterKey) {
        if (filterKey) activeExKey = filterKey;
        var q = exSearch ? (exSearch.value || '').toLowerCase().trim() : '';
        var list = EX20.filter(function (x) {
          var matchStage = !activeExKey || activeExKey === 'all' || x.g === activeExKey;
          var matchQ = !q || ((x.title + ' ' + x.cite + ' ' + x.intent + ' ' + x.mech).toLowerCase().indexOf(q) !== -1);
          return matchStage && matchQ;
        });
        exGrid.innerHTML = list.map(function (x) {
          return '<article class="prov-card">' +
            '<div class="prov-top"><span class="prov-cat">' + x.st + '</span><span class="cite-badge">[' + x.cite + ']</span></div>' +
            '<h3>' + x.title + '</h3>' +
            '<div class="prov-chain">' +
              '<span><b>Human Intent &amp; Impact:</b> ' + x.intent + '</span>' +
              '<span><b>Formal Protocol Mechanism:</b> ' + x.mech + '</span>' +
            '</div>' +
          '</article>';
        }).join('');
      };
      renderEx20('all');
      if (exPills) {
        exPills.addEventListener('click', function (e) {
          var b = e.target.closest('[data-fa-ex]');
          if (!b) return;
          [].forEach.call(exPills.querySelectorAll('[data-fa-ex]'), function (btn) {
            btn.setAttribute('aria-pressed', String(btn === b));
          });
          renderEx20(b.getAttribute('data-fa-ex'));
        });
      }
      if (exSearch) { exSearch.addEventListener('input', function () { renderEx20(); }); }
    }

  }

  /* ---------- 2. Live Alignment Trajectory & Interactive Signal Stream ---------- */
  var panel = document.getElementById('live-traj');
  var page = document.getElementById('traj-page');
  if (!panel && !page) return;

  var DIR = { toward: ['Toward', 'tw'], away: ['Away', 'aw'], mixed: ['Mixed', 'mx'], neutral: ['Neutral', 'nu'] };
  var KIND = { paper: 'Research', preprint: 'Preprint', news: 'News', report: 'Report', policy: 'Policy', incident: 'Incident', code: 'Code', dataset: 'Data' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : '#'; }
  function ago(iso) {
    var s = (Date.now() - Date.parse(iso)) / 1000;
    if (!(s >= 0)) return '';
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return Math.round(s / 86400) + ' d ago';
  }
  function word(v) {
    if (v >= 60) return 'toward the principles';
    if (v >= 52) return 'slightly toward';
    if (v > 48) return 'level';
    if (v > 40) return 'slightly away';
    return 'away from the principles';
  }

  function bars(t, host) {
    var list = el('div', 'lt-bars');
    Object.keys(t.categories).forEach(function (k) {
      var c = t.categories[k];
      var row = el('div', 'lt-bar' + (c.signals ? '' : ' empty'));
      var name = el('span', 'lt-name', c.name);
      var track = el('span', 'lt-track');
      var fill = el('span', 'lt-fill ' + (c.index >= 50 ? 'up' : 'down'));
      var off = Math.min(Math.abs(c.index - 50), 50);
      fill.style.width = off + '%';
      fill.style[c.index >= 50 ? 'left' : 'right'] = '50%';
      track.appendChild(fill);
      track.appendChild(el('span', 'lt-mid'));
      var val = el('span', 'lt-val', c.signals ? String(Math.round(c.index)) : '–');
      val.title = c.signals + ' source(s): ' + c.toward + ' toward, ' + c.away + ' away';
      row.appendChild(name); row.appendChild(track); row.appendChild(val);
      list.appendChild(row);
    });
    host.appendChild(list);
  }

  function signalItem(s) {
    var li = el('li', 'lt-sig');
    li.setAttribute('data-dir', s.direction || 'neutral');
    var d = DIR[s.direction] || DIR.neutral;
    var head = el('div', 'lt-sig-h');
    head.appendChild(el('span', 'lt-dir ' + d[1], d[0]));
    head.appendChild(el('span', 'lt-kind', KIND[s.kind] || s.kind));
    head.appendChild(el('time', null, s.published));
    li.appendChild(head);
    var a = el('a', 'lt-title', s.title);
    a.href = safeUrl(s.url); a.rel = 'noopener noreferrer';
    li.appendChild(a);
    li.appendChild(el('span', 'lt-src', s.source));
    li.appendChild(el('p', null, s.summary));
    if (s.implication) li.appendChild(el('p', 'lt-imp', 'What it means for us: ' + s.implication));
    return li;
  }

  function render(t, sigs) {
    var thsVal = document.getElementById('ths-val');
    var thsDelta = document.getElementById('ths-delta');
    var thsSub = document.getElementById('ths-sub');
    var thsBars = document.getElementById('ths-bars');
    if (thsVal && t && typeof t.overall === 'number') {
      thsVal.textContent = t.overall.toFixed(1);
      var d0 = t.overall - (t.overall_24h_ago || t.overall);
      if (thsDelta) {
        thsDelta.className = 'lt-delta ' + (d0 >= 0 ? 'up' : 'down');
        thsDelta.textContent = (d0 >= 0 ? '+' : '') + d0.toFixed(1) + ' in 24 h';
      }
      if (thsSub) {
        thsSub.innerHTML = t.signals_7d + ' new sources verified this week (' + t.signals_total + ' total) · Updated ' + ago(t.updated) + '.';
      }
      if (thsBars && t.categories) {
        thsBars.innerHTML = Object.keys(t.categories).map(function (k) {
          var c = t.categories[k];
          var sc = Math.round(c.index || 50);
          return '<div class="ths-bar-row"><span>' + c.name + '</span><div class="wb-bar-track"><div class="wb-bar-fill ' + (sc >= 50 ? 'ok' : 'bad') + '" style="width:' + sc + '%"></div></div><b>' + sc + '</b></div>';
        }).join('');
      }
    }
    var hosts = [panel, page].filter(Boolean);
    hosts.forEach(function (host) {
      host.textContent = '';
      var top = el('div', 'lt-top');
      var big = el('div', 'lt-overall');
      big.appendChild(el('span', 'lt-num', String(Math.round(t.overall))));
      var d = t.overall - t.overall_24h_ago;
      big.appendChild(el('span', 'lt-delta ' + (d >= 0 ? 'up' : 'down'), (d >= 0 ? '+' : '') + d.toFixed(1) + ' in 24 h'));
      top.appendChild(big);
      var txt = el('div', 'lt-read');
      txt.appendChild(el('b', null, 'This week, the evidence points ' + word(t.overall) + '.'));
      txt.appendChild(el('p', null, t.signals_7d + ' new sources this week, ' + t.signals_total + ' in all. Updated ' + ago(t.updated) + '.'));
      top.appendChild(txt);
      host.appendChild(top);
      bars(t, host);
      var n = host === page ? 200 : 5;
      var shown = sigs.slice(0, n);
      if (shown.length) {
        host.appendChild(el('h3', 'lt-h', host === page ? 'Every source, newest first (' + shown.length + ' shown)' : 'Latest sources'));
        var ul = el('ul', 'lt-sigs');
        if (host === page) {
          var tb = el('div', 'lt-toolbar');
          var pills = el('div', 'lt-pills');
          var activeDir = 'all';
          var searchBox = el('input', 'lt-search');
          searchBox.type = 'search';
          searchBox.placeholder = 'Search verified papers, policies & incidents...';
          searchBox.setAttribute('aria-label', 'Search verified sources');
          var applyFilter = function () {
            var q = (searchBox.value || '').toLowerCase().trim();
            [].forEach.call(ul.children, function (li) {
              var matchDir = (activeDir === 'all') || (li.getAttribute('data-dir') === activeDir);
              var matchQ = !q || (li.textContent.toLowerCase().indexOf(q) !== -1);
              li.style.display = (matchDir && matchQ) ? '' : 'none';
            });
          };
          [['all', 'All (' + shown.length + ')'], ['toward', 'Toward'], ['away', 'Away'], ['mixed', 'Mixed']].forEach(function (pair, i) {
            var b = el('button', null, pair[1]);
            b.type = 'button';
            b.setAttribute('aria-pressed', String(i === 0));
            b.addEventListener('click', function () {
              activeDir = pair[0];
              [].forEach.call(pills.children, function (c) { c.setAttribute('aria-pressed', String(c === b)); });
              applyFilter();
            });
            pills.appendChild(b);
          });
          searchBox.addEventListener('input', applyFilter);
          tb.appendChild(pills);
          tb.appendChild(searchBox);
          host.appendChild(tb);
        }
        shown.forEach(function (s) { ul.appendChild(signalItem(s)); });
        host.appendChild(ul);
      } else {
        host.appendChild(el('p', 'lt-none', 'The first sources are being read and checked. This panel updates every hour.'));
      }
      host.appendChild(el('p', 'lt-method', t.method));
      if (host === panel) {
        var more = el('a', 'lt-more', 'Explore 6-stage capability forecast & every verified source →');
        more.href = '/trajectory';
        host.appendChild(more);
      }
    });
  }

  Promise.all([
    fetch('/data/trajectory.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
    fetch('/data/signals.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
  ]).then(function (v) { render(v[0], v[1]); }).catch(function () {
    /* keep pre-rendered static fallback */
  });
})();
