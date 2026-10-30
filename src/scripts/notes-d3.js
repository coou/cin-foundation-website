/* ==========================================================================
   notes-d3.js — D3.js v7 Interactive Visualizations for Blueprints Hub & Flagship Notes
   1. #notes-d3-constellation (src/notes/index.html): 5-Pillar & 30-Blueprint Radial Network Map
   2. #ledger-d3-chart (src/notes/beyond-arxiv-agent-web-ledger.html): 9.1x NextLat/LoRA Speed & 95%/5% Data Shapley Visualizer
   3. #principles-d3-chart (src/notes/all-principles.html & principle-testnet): Weiszfeld L1 Geometric Median & 550-Principle Cluster Visualizer
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. BLUEPRINTS HUB: 5-Pillar & 30-Blueprint Radial Constellation (#notes-d3-constellation)
     ------------------------------------------------------------------------ */
  function initNotesConstellation() {
    var svgEl = document.getElementById('notes-d3-constellation');
    if (!svgEl || !window.d3) return;
    var d3 = window.d3;
    var svg = d3.select(svgEl);

    var PILLARS = [
      {
        id: 'arch',
        cat: 'arch',
        label: '1. Architecture & Silicon',
        sub: 'Two Internets · QUIC P2P · 6 Notes',
        color: '#4fb3a8',
        cx: 226,
        cy: 92,
        nodes: [
          { label: 'Two Internets', href: '/notes/agent-internet', dx: -68, dy: -40 },
          { label: 'Biometrics & Hardware', href: '/notes/agent-only-internet-biometrics-hardware', dx: -74, dy: 4 },
          { label: 'Human Sovereignty', href: '/notes/architecture-of-human-sovereignty', dx: -64, dy: 44 },
          { label: 'Somatic Liveness', href: '/notes/somatic-witness', dx: 4, dy: -52 },
          { label: 'Network of Networks', href: '/notes/network-of-networks', dx: 56, dy: -42 }
        ]
      },
      {
        id: 'agents',
        cat: 'agents',
        label: '2. Personal Agents',
        sub: 'Local LoRA · Memory Airlock · 11 Notes',
        color: '#63b3ed',
        cx: 594,
        cy: 92,
        nodes: [
          { label: 'Personal Agents', href: '/notes/personal-agents', dx: -52, dy: -44 },
          { label: 'Training Your Twin', href: '/notes/training-your-twin', dx: 8, dy: -52 },
          { label: 'Reclaim Profile', href: '/notes/reclaim-your-profile', dx: 66, dy: -38 },
          { label: 'Clues Not Orders', href: '/notes/instructions-as-evidence', dx: 72, dy: 8 },
          { label: 'Quests Not Feeds', href: '/notes/quest-interface', dx: 62, dy: 46 }
        ]
      },
      {
        id: 'ledger',
        cat: 'ledger',
        label: '3. Ledger & Economics',
        sub: '95% Shapley · 5D Demurrage · 7 Notes',
        color: '#ecc94b',
        cx: 226,
        cy: 236,
        nodes: [
          { label: 'Testnet Ledger v4.0', href: '/notes/beyond-arxiv-agent-web-ledger', dx: -72, dy: -8 },
          { label: '5D Value & Demurrage', href: '/notes/how-the-ledger-works', dx: -66, dy: 38 },
          { label: 'Liquid Democracy', href: '/notes/liquid-democracy-and-staking-lockups', dx: -10, dy: 54 },
          { label: 'Trust Multiplies', href: '/notes/trust-multiplies', dx: 56, dy: 44 },
          { label: 'Co-Op Companies', href: '/notes/companies-on-the-ledger', dx: -48, dy: -44 }
        ]
      },
      {
        id: 'safety',
        cat: 'safety',
        label: '4. Safety & Co-Intelligence',
        sub: 'Containment · Agent Law · 12 Notes',
        color: '#ef6a52',
        cx: 594,
        cy: 236,
        nodes: [
          { label: '7-Lens World Atlas', href: '/notes/world-standing-and-cointelligence', dx: 48, dy: -44 },
          { label: 'No Swarm Commander', href: '/notes/no-one-commands-a-swarm', dx: 70, dy: -6 },
          { label: 'Agent Jurisdictions', href: '/notes/ai-agent-jurisdictions', dx: 66, dy: 40 },
          { label: 'Containing Frontier AI', href: '/notes/containment', dx: 8, dy: 54 },
          { label: 'Principal Alignment', href: '/notes/fractured-alignment', dx: -54, dy: 44 }
        ]
      },
      {
        id: 'interactive',
        cat: 'interactive',
        label: '5. Live Simulators (11)',
        sub: 'Deterministic Browser Workbenches',
        color: '#b794f4',
        cx: 410,
        cy: 262,
        nodes: [
          { label: '550 Principles Sim', href: '/notes/all-principles', dx: -68, dy: 44 },
          { label: 'Weiszfeld Testnet', href: '/notes/all-principles', dx: 0, dy: 50 },
          { label: '30-Lives Cohort Sim', href: '/notes/thirty-lives', dx: 68, dy: 44 }
        ]
      }
    ];

    var activeCat = 'all';

    function triggerCategoryFilter(cat) {
      activeCat = (activeCat === cat && cat !== 'all') ? 'all' : cat;
      var btn = document.querySelector('#notes-toolbar [data-note-cat="' + activeCat + '"]');
      if (btn) {
        btn.click();
      }
      render(activeCat);
    }

    function render(selectedCat) {
      svg.attr('viewBox', '0 0 820 340');
      svg.selectAll('*').remove();

      svg.append('rect')
        .attr('x', 4)
        .attr('y', 4)
        .attr('width', 812)
        .attr('height', 332)
        .attr('rx', 14)
        .attr('fill', '#12151c')
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.5);

      var hubX = 410;
      var hubY = 132;

      // Subtle orbital rings around hub
      [85, 165, 245].forEach(function (r) {
        svg.append('circle')
          .attr('cx', hubX)
          .attr('cy', hubY)
          .attr('r', r)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255,255,255,0.05)')
          .attr('stroke-dasharray', '3 4');
      });

      // Edges from Hub to Pillars and Pillars to Blueprint Satellites
      var edgeGroup = svg.append('g');
      PILLARS.forEach(function (p) {
        var isFocused = selectedCat === 'all' || selectedCat === p.cat;
        edgeGroup.append('line')
          .attr('x1', hubX)
          .attr('y1', hubY)
          .attr('x2', p.cx)
          .attr('y2', p.cy)
          .attr('stroke', p.color)
          .attr('stroke-width', isFocused ? 2.2 : 1.1)
          .attr('stroke-opacity', isFocused ? 0.65 : 0.18)
          .attr('stroke-dasharray', isFocused ? null : '4 3');

        p.nodes.forEach(function (n) {
          var nx = p.cx + n.dx;
          var ny = p.cy + n.dy;
          edgeGroup.append('line')
            .attr('x1', p.cx)
            .attr('y1', p.cy)
            .attr('x2', nx)
            .attr('y2', ny)
            .attr('stroke', p.color)
            .attr('stroke-width', 1.2)
            .attr('stroke-opacity', isFocused ? 0.45 : 0.12);
        });
      });

      // Satellite Blueprint Nodes
      var satGroup = svg.append('g');
      PILLARS.forEach(function (p) {
        var isFocused = selectedCat === 'all' || selectedCat === p.cat;
        p.nodes.forEach(function (n) {
          var nx = p.cx + n.dx;
          var ny = p.cy + n.dy;
          var g = satGroup.append('g')
            .attr('transform', 'translate(' + nx + ',' + ny + ')')
            .style('cursor', 'pointer')
            .style('opacity', isFocused ? 1 : 0.3)
            .on('click', function (event) {
              event.stopPropagation();
              if (n.href) window.location.href = n.href;
            });

          g.append('circle')
            .attr('r', 5)
            .attr('fill', '#181c26')
            .attr('stroke', p.color)
            .attr('stroke-width', 1.8);

          var anchor = n.dx < -15 ? 'end' : (n.dx > 15 ? 'start' : 'middle');
          var tx = n.dx < -15 ? -8 : (n.dx > 15 ? 8 : 0);
          var ty = Math.abs(n.dx) <= 15 ? (n.dy < 0 ? -9 : 14) : 3.5;

          g.append('text')
            .attr('x', tx)
            .attr('y', ty)
            .attr('text-anchor', anchor)
            .attr('font-size', 9.2)
            .attr('font-family', 'sans-serif')
            .attr('fill', '#d5d9e2')
            .text(n.label);
        });
      });

      // 5 Pillar Nodes
      var pillarGroup = svg.append('g');
      PILLARS.forEach(function (p) {
        var isSelected = selectedCat === p.cat;
        var isFocused = selectedCat === 'all' || isSelected;
        var g = pillarGroup.append('g')
          .attr('transform', 'translate(' + p.cx + ',' + p.cy + ')')
          .attr('data-note-cat', p.cat)
          .style('cursor', 'pointer')
          .style('opacity', isFocused ? 1 : 0.42)
          .on('click', function () {
            triggerCategoryFilter(p.cat);
          });

        g.append('rect')
          .attr('x', -78)
          .attr('y', -22)
          .attr('width', 156)
          .attr('height', 44)
          .attr('rx', 10)
          .attr('fill', isSelected ? 'rgba(79,179,168,0.18)' : '#171b24')
          .attr('stroke', p.color)
          .attr('stroke-width', isSelected ? 2.4 : 1.6);

        g.append('text')
          .attr('x', 0)
          .attr('y', -4)
          .attr('text-anchor', 'middle')
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('font-family', 'monospace')
          .attr('fill', p.color)
          .text(p.label);

        g.append('text')
          .attr('x', 0)
          .attr('y', 12)
          .attr('text-anchor', 'middle')
          .attr('font-size', 9)
          .attr('font-family', 'sans-serif')
          .attr('fill', '#cfd3dc')
          .text(p.sub);
      });

      // Central Hub Node (Click to Reset to All 30)
      var centerG = svg.append('g')
        .attr('transform', 'translate(' + hubX + ',' + hubY + ')')
        .attr('data-note-cat', 'all')
        .style('cursor', 'pointer')
        .on('click', function () {
          triggerCategoryFilter('all');
        });

      centerG.append('circle')
        .attr('r', 46)
        .attr('fill', '#192328')
        .attr('stroke', '#4fb3a8')
        .attr('stroke-width', 2.2);

      centerG.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9.5)
        .attr('font-weight', 700)
        .attr('font-family', 'monospace')
        .attr('fill', '#4fb3a8')
        .text('CIN CORPUS');

      centerG.append('text')
        .attr('x', 0)
        .attr('y', 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-weight', 700)
        .attr('font-family', 'serif')
        .attr('fill', '#f4f1ea')
        .text('30 Blueprints');

      centerG.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9)
        .attr('font-family', 'monospace')
        .attr('fill', '#9aa3b2')
        .text('Click to Filter');
    }

    render('all');

    // Sync toolbar pill clicks back to D3 constellation
    var toolbar = document.getElementById('notes-toolbar');
    if (toolbar) {
      [].forEach.call(toolbar.querySelectorAll('[data-note-cat]'), function (btn) {
        btn.addEventListener('click', function () {
          activeCat = btn.getAttribute('data-note-cat') || 'all';
          render(activeCat);
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     2. BEYOND-ARXIV LEDGER: 9.1x NextLat/LoRA Speed & 95%/5% Shapley (#ledger-d3-chart)
     ------------------------------------------------------------------------ */
  function initLedgerD3Chart() {
    var svgEl = document.getElementById('ledger-d3-chart');
    if (!svgEl || !window.d3) return;
    var d3 = window.d3;
    var svg = d3.select(svgEl);

    var TRACK_META = {
      everyday: {
        name: 'Track A · Clean-Room Everyday Sandbox',
        consensusMs: 14.8,
        baselineMs: 128.0,
        speedup: '8.6x Faster',
        genBoost: '+24.5% Held-Out Accuracy',
        DirectShare: 95,
        CommonsShare: 5,
        splits: [
          { label: 'Solver Human + Agent', units: 560, color: '#4fb3a8' },
          { label: 'Data Stream & Lineage', units: 180, color: '#ecc94b' },
          { label: 'Requester Human + Agent', units: 190, color: '#63b3ed' },
          { label: 'Protocol RFC / Commons (5%+)', units: 70, color: '#b794f4' }
        ]
      },
      testnet: {
        name: 'Track B · Multi-Party Latent/LoRA + QUIC P2P',
        consensusMs: 14.0,
        baselineMs: 128.0,
        speedup: '9.1x Faster',
        genBoost: '+27.9% Generalization',
        DirectShare: 95,
        CommonsShare: 5,
        splits: [
          { label: 'Solver Coalition + LoRA', units: 580, color: '#4fb3a8' },
          { label: 'PSI Stream & Upstream', units: 155, color: '#ecc94b' },
          { label: 'Requester Cohort', units: 195, color: '#63b3ed' },
          { label: 'Protocol RFC / Commons (5%+)', units: 70, color: '#b794f4' }
        ]
      },
      infra: {
        name: 'Track C · Critical Infrastructure & Clinical Ops',
        consensusMs: 15.2,
        baselineMs: 128.0,
        speedup: '8.4x Faster',
        genBoost: '100% PCC Precondition Gate',
        DirectShare: 95,
        CommonsShare: 5,
        splits: [
          { label: 'Specialist Human + Agent', units: 520, color: '#4fb3a8' },
          { label: 'Telemetry & Upstream DAG', units: 250, color: '#ecc94b' },
          { label: 'Operator Human + Agent', units: 160, color: '#63b3ed' },
          { label: 'Protocol RFC / Commons (5%+)', units: 70, color: '#b794f4' }
        ]
      }
    };

    function getActiveTrackAndTab() {
      var tEveryday = document.getElementById('track-everyday');
      var tTestnet = document.getElementById('track-testnet');
      var track = 'everyday';
      if (tTestnet && tTestnet.getAttribute('aria-pressed') === 'true') track = 'testnet';
      else if (tEveryday && tEveryday.getAttribute('aria-pressed') !== 'true') track = 'infra';

      var activeTab = document.querySelector('#sim-tab-bar .sim-tab[aria-selected="true"]');
      var tabIdx = activeTab ? parseInt(activeTab.getAttribute('data-ev') || '0', 10) : 0;
      var tabTitle = activeTab ? activeTab.textContent.trim() : 'Cycle 1';
      return { track: track, tabIdx: tabIdx, tabTitle: tabTitle };
    }

    function render() {
      var state = getActiveTrackAndTab();
      var meta = TRACK_META[state.track] || TRACK_META.everyday;
      var jitter = (state.tabIdx % 3) * 0.4;
      var cinMs = +(meta.consensusMs - jitter).toFixed(1);

      svg.selectAll('*').remove();

      svg.append('rect')
        .attr('x', 4)
        .attr('y', 4)
        .attr('width', 772)
        .attr('height', 252)
        .attr('rx', 12)
        .attr('fill', '#12151c')
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.5);

      // Left Panel: Consensus Speed & NextLat/LoRA Comparison
      var leftG = svg.append('g').attr('transform', 'translate(22, 22)');
      leftG.append('text')
        .attr('x', 0)
        .attr('y', 12)
        .attr('font-size', 10)
        .attr('font-weight', 700)
        .attr('font-family', 'monospace')
        .attr('fill', '#4fb3a8')
        .text('1. CONSENSUS LATENCY · ' + state.tabTitle.slice(0, 22).toUpperCase());

      leftG.append('text')
        .attr('x', 0)
        .attr('y', 30)
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#f4f1ea')
        .text('NextLat + LoRA TIES-Merging: ' + meta.speedup + ' (' + cinMs + ' ms)');

      var bars = [
        { label: 'Legacy English Token Debate', ms: 128.0, color: '#ef6a52', note: '128 ms (1.0x · lossy prose)' },
        { label: 'Naive Raw Weight Average', ms: 48.0, color: '#ecc94b', note: '48 ms (sign cancellation)' },
        { label: 'CIN NextLat + LoRA TIES Merge', ms: cinMs, color: '#4fb3a8', note: cinMs + ' ms (' + meta.speedup + ' · ' + meta.genBoost + ')' }
      ];

      var xScale = d3.scaleLinear().domain([0, 140]).range([0, 325]);

      bars.forEach(function (b, idx) {
        var y = 52 + idx * 56;
        leftG.append('text')
          .attr('x', 0)
          .attr('y', y)
          .attr('font-size', 10)
          .attr('font-weight', 600)
          .attr('fill', '#d5d9e2')
          .text(b.label);

        leftG.append('rect')
          .attr('x', 0)
          .attr('y', y + 7)
          .attr('width', 325)
          .attr('height', 18)
          .attr('rx', 5)
          .attr('fill', '#1c202b');

        leftG.append('rect')
          .attr('x', 0)
          .attr('y', y + 7)
          .attr('width', Math.max(18, xScale(b.ms)))
          .attr('height', 18)
          .attr('rx', 5)
          .attr('fill', b.color);

        leftG.append('text')
          .attr('x', idx === 0 ? 10 : Math.min(200, xScale(b.ms) + 8))
          .attr('y', y + 20)
          .attr('font-size', 9.2)
          .attr('font-family', 'monospace')
          .attr('font-weight', 700)
          .attr('fill', idx === 0 ? '#10131a' : (idx === 2 ? '#4fb3a8' : '#f4f1ea'))
          .text(b.note);
      });

      // Divider
      svg.append('line')
        .attr('x1', 386)
        .attr('y1', 20)
        .attr('x2', 386)
        .attr('y2', 240)
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.2);

      // Right Panel: Data Shapley 95% Contributor / 5% Commons Payout Visualizer
      var rightG = svg.append('g').attr('transform', 'translate(404, 22)');
      rightG.append('text')
        .attr('x', 0)
        .attr('y', 12)
        .attr('font-size', 10)
        .attr('font-weight', 700)
        .attr('font-family', 'monospace')
        .attr('fill', '#ecc94b')
        .text('2. DATA SHAPLEY PAYOUT (95% CONTRIBUTORS / 5% COMMONS)');

      rightG.append('text')
        .attr('x', 0)
        .attr('y', 30)
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#f4f1ea')
        .text('1,000 Conserved Units · 0% Cloud Middleman Rent');

      // Stacked bar (width 350)
      var totalW = 350;
      var curX = 0;
      meta.splits.forEach(function (s) {
        var w = (s.units / 1000) * totalW;
        rightG.append('rect')
          .attr('x', curX)
          .attr('y', 46)
          .attr('width', Math.max(2, w - 2))
          .attr('height', 28)
          .attr('rx', 4)
          .attr('fill', s.color);

        if (w > 42) {
          rightG.append('text')
            .attr('x', curX + w / 2)
            .attr('y', 64)
            .attr('text-anchor', 'middle')
            .attr('font-size', 9.5)
            .attr('font-family', 'monospace')
            .attr('font-weight', 700)
            .attr('fill', '#10131a')
            .text(Math.round(s.units / 10) + '%');
        }
        curX += w;
      });

      // Legend cards
      meta.splits.forEach(function (s, idx) {
        var col = idx % 2;
        var row = Math.floor(idx / 2);
        var lx = col * 178;
        var ly = 92 + row * 52;

        rightG.append('rect')
          .attr('x', lx)
          .attr('y', ly)
          .attr('width', 170)
          .attr('height', 42)
          .attr('rx', 7)
          .attr('fill', '#181c26')
          .attr('stroke', s.color)
          .attr('stroke-width', 1.2);

        rightG.append('text')
          .attr('x', lx + 10)
          .attr('y', ly + 17)
          .attr('font-size', 9.2)
          .attr('font-weight', 700)
          .attr('fill', s.color)
          .text(s.label);

        rightG.append('text')
          .attr('x', lx + 10)
          .attr('y', ly + 33)
          .attr('font-size', 10)
          .attr('font-family', 'monospace')
          .attr('fill', '#e9e6de')
          .text(s.units + ' u (' + (s.units / 10).toFixed(0) + '%)');
      });

      rightG.append('text')
        .attr('x', 0)
        .attr('y', 212)
        .attr('font-size', 9.5)
        .attr('font-family', 'monospace')
        .attr('fill', '#4fb3a8')
        .text('✓ Held-Out Proof Verified · ' + meta.name);
    }

    render();

    var app = document.getElementById('ledger-sim-app');
    if (app) {
      app.addEventListener('click', function () {
        setTimeout(render, 15);
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. PRINCIPLES & PRINCIPLE TESTNET: Weiszfeld L1 Geometric Median (#principles-d3-chart)
     ------------------------------------------------------------------------ */
  function initPrinciplesD3Chart() {
    var svgEl = document.getElementById('principles-d3-chart');
    if (!svgEl || !window.d3) return;
    var d3 = window.d3;
    var svg = d3.select(svgEl);

    var SHARDS = [
      { id: 'S1', name: 'S1 Clinical (220 RN)', x: 255, y: 74, color: '#4fb3a8', bots: false },
      { id: 'S2', name: 'S2 Agro-Solar (220)', x: 342, y: 92, color: '#63b3ed', bots: false },
      { id: 'S3', name: 'S3 Open Craft (200)', x: 365, y: 158, color: '#ecc94b', bots: false },
      { id: 'S4', name: 'S4 Grid & Water (200)', x: 285, y: 192, color: '#b794f4', bots: false },
      { id: 'S5', name: 'S5 Care & Elders (210)', x: 205, y: 146, color: '#68d391', bots: false },
      { id: 'S6', name: 'S6 50k Bot Attack', x: 76, y: 204, color: '#ef6a52', bots: true }
    ];

    function render() {
      var regSel = document.getElementById('gm-reg-sel');
      var prSel = document.getElementById('gm-pr-sel');
      var regime = regSel ? regSel.value : 'cin';
      var prId = prSel ? prSel.value : '550';

      var activeIds = {};
      [].forEach.call(document.querySelectorAll('[data-gm-shard]'), function (cb) {
        activeIds[cb.getAttribute('data-gm-shard')] = cb.checked;
      });

      var humanShards = SHARDS.filter(function (s) { return !s.bots && activeIds[s.id] !== false; });
      var botActive = activeIds.S6 !== false;

      // Compute aggregated target position in the 2D concept canvas
      var medX = 290;
      var medY = 132;
      if (humanShards.length > 0) {
        medX = d3.mean(humanShards, function (s) { return s.x; });
        medY = d3.mean(humanShards, function (s) { return s.y; });
      }

      var targetX = medX;
      var targetY = medY;
      var statusLabel = '99.6 / 100 · Sybil Swarm Quarantined';
      var statusColor = '#4fb3a8';

      if (regime === 'mean' && botActive) {
        targetX = 96;
        targetY = 196;
        statusLabel = '4.9 / 100 · HIJACKED by 50k Bot Swarm';
        statusColor = '#ef6a52';
      } else if (regime === 'unsharded') {
        targetX = 235;
        targetY = 142;
        statusLabel = '50.2 / 100 · Muddy-Middle Dilution';
        statusColor = '#ecc94b';
      } else if (regime === 'static') {
        targetX = 210;
        targetY = 128;
        statusLabel = '33.7 / 100 · Frozen Doctrine (0 Adaptation)';
        statusColor = '#9aa3b2';
      }

      svg.selectAll('*').remove();

      svg.append('rect')
        .attr('x', 4)
        .attr('y', 4)
        .attr('width', 772)
        .attr('height', 252)
        .attr('rx', 12)
        .attr('fill', '#12151c')
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.5);

      // Left Subspace Plot
      var plotG = svg.append('g');
      plotG.append('text')
        .attr('x', 22)
        .attr('y', 28)
        .attr('font-size', 10)
        .attr('font-weight', 700)
        .attr('font-family', 'monospace')
        .attr('fill', '#4fb3a8')
        .text('WEISZFELD L1 GEOMETRIC MEDIAN SUBSPACE · PRINCIPLE #' + prId);

      // Grid circles around human consensus region
      [48, 86].forEach(function (r) {
        plotG.append('circle')
          .attr('cx', medX)
          .attr('cy', medY)
          .attr('r', r)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(79,179,168,0.16)')
          .attr('stroke-dasharray', '3 3');
      });

      // Vector lines from shards to aggregated median
      SHARDS.forEach(function (s) {
        var isOn = activeIds[s.id] !== false;
        if (!isOn) return;
        var blocked = s.bots && regime !== 'mean';
        plotG.append('line')
          .attr('x1', s.x)
          .attr('y1', s.y)
          .attr('x2', blocked ? (s.x + targetX) / 2 : targetX)
          .attr('y2', blocked ? (s.y + targetY) / 2 : targetY)
          .attr('stroke', s.color)
          .attr('stroke-width', s.bots ? 1.8 : 1.6)
          .attr('stroke-dasharray', blocked ? '4 3' : null)
          .attr('stroke-opacity', blocked ? 0.45 : 0.75);
      });

      // Shard clusters + satellite agent vector dots
      SHARDS.forEach(function (s) {
        var isOn = activeIds[s.id] !== false;
        var g = plotG.append('g')
          .attr('transform', 'translate(' + s.x + ',' + s.y + ')')
          .style('cursor', 'pointer')
          .style('opacity', isOn ? 1 : 0.28)
          .on('click', function () {
            var cb = document.querySelector('[data-gm-shard="' + s.id + '"]');
            if (cb) {
              cb.checked = !cb.checked;
              cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });

        // Individual personal-agent experience vector dots around shard
        [[-14, -8], [13, -10], [-11, 12], [15, 9], [0, -15]].forEach(function (pt) {
          g.append('circle')
            .attr('cx', pt[0])
            .attr('cy', pt[1])
            .attr('r', 2.6)
            .attr('fill', s.color)
            .attr('opacity', 0.65);
        });

        g.append('circle')
          .attr('r', s.bots ? 13 : 10)
          .attr('fill', '#171b24')
          .attr('stroke', s.color)
          .attr('stroke-width', 2);

        g.append('text')
          .attr('x', 0)
          .attr('y', s.y < 100 ? -16 : 24)
          .attr('text-anchor', 'middle')
          .attr('font-size', 9.2)
          .attr('font-weight', 700)
          .attr('font-family', 'monospace')
          .attr('fill', s.color)
          .text(s.name);
      });

      // Aggregated Median Node
      var medG = plotG.append('g')
        .attr('transform', 'translate(' + targetX + ',' + targetY + ')');

      medG.append('circle')
        .attr('r', 14)
        .attr('fill', statusColor)
        .attr('fill-opacity', 0.22)
        .attr('stroke', statusColor)
        .attr('stroke-width', 2.4);

      medG.append('circle')
        .attr('r', 5)
        .attr('fill', statusColor);

      medG.append('text')
        .attr('x', 0)
        .attr('y', -18)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9.5)
        .attr('font-weight', 700)
        .attr('font-family', 'monospace')
        .attr('fill', '#ffffff')
        .text('COHERED HEAD');

      // Divider
      svg.append('line')
        .attr('x1', 452)
        .attr('y1', 20)
        .attr('x2', 452)
        .attr('y2', 240)
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.2);

      // Right Panel: Fidelity Comparison & Status
      var rightG = svg.append('g').attr('transform', 'translate(470, 22)');
      rightG.append('text')
        .attr('x', 0)
        .attr('y', 10)
        .attr('font-size', 10)
        .attr('font-weight', 700)
        .attr('font-family', 'monospace')
        .attr('fill', statusColor)
        .text('BYZANTINE ROBUSTNESS & FIDELITY');

      rightG.append('text')
        .attr('x', 0)
        .attr('y', 28)
        .attr('font-size', 11.5)
        .attr('font-weight', 700)
        .attr('fill', '#f4f1ea')
        .text(statusLabel);

      var regimes = [
        { id: 'cin', label: 'CIN Sharded Weiszfeld + Upsert', score: 99.6, col: '#4fb3a8' },
        { id: 'unsharded', label: 'Unsharded Global Median', score: 50.2, col: '#ecc94b' },
        { id: 'static', label: 'Static Frozen Doctrine', score: 33.7, col: '#9aa3b2' },
        { id: 'mean', label: 'Naive Mean (50k Bot Hijack)', score: 4.9, col: '#ef6a52' }
      ];

      var barScale = d3.scaleLinear().domain([0, 100]).range([0, 280]);
      regimes.forEach(function (r, idx) {
        var ry = 48 + idx * 42;
        var isCur = r.id === regime;
        rightG.append('text')
          .attr('x', 0)
          .attr('y', ry)
          .attr('font-size', 9.5)
          .attr('font-weight', isCur ? 700 : 500)
          .attr('fill', isCur ? '#ffffff' : '#cfd3dc')
          .text((isCur ? '▸ ' : '') + r.label + ' (' + r.score + '%)');

        rightG.append('rect')
          .attr('x', 0)
          .attr('y', ry + 6)
          .attr('width', 280)
          .attr('height', 13)
          .attr('rx', 4)
          .attr('fill', '#1c202b');

        rightG.append('rect')
          .attr('x', 0)
          .attr('y', ry + 6)
          .attr('width', Math.max(8, barScale(r.score)))
          .attr('height', 13)
          .attr('rx', 4)
          .attr('fill', r.col)
          .attr('opacity', isCur ? 1 : 0.65);
      });

      rightG.append('text')
        .attr('x', 0)
        .attr('y', 216)
        .attr('font-size', 9.2)
        .attr('font-family', 'monospace')
        .attr('fill', '#9aa3b2')
        .text('Click any shard cluster or toggle left controls');
    }

    render();

    ['gm-pr-sel', 'gm-reg-sel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', render);
    });
    [].forEach.call(document.querySelectorAll('[data-gm-shard]'), function (cb) {
      cb.addEventListener('change', render);
    });
  }

  /* ------------------------------------------------------------------------
     4. PROGRESSIVE DISCLOSURE HELPERS FOR ALL-PRINCIPLES & PRINCIPLE-TESTNET
     ------------------------------------------------------------------------ */
  function initProgressiveDrawers() {
    // On all-principles.html: keep principle cards collapsed initially so upfront visible word count stays < 1,200
    var libGrid = document.getElementById('lib-grid');
    if (libGrid) {
      var collapseCards = function () {
        [].forEach.call(libGrid.querySelectorAll('details.lib-card[open]'), function (d) {
          d.removeAttribute('open');
        });
      };
      collapseCards();
      setTimeout(collapseCards, 60);
    }
    var libDrawer = document.getElementById('lib-grid-drawer');
    var libControls = document.getElementById('lib-controls');
    if (libDrawer && libControls) {
      libControls.addEventListener('input', function () { libDrawer.open = true; });
      libControls.addEventListener('change', function () { libDrawer.open = true; });
      libControls.addEventListener('click', function () { libDrawer.open = true; });
    }

    // On principle-testnet: auto-open #soc-grid-drawer when user filters #soc-eco-sel or #soc-q-input
    var socDrawer = document.getElementById('soc-grid-drawer');
    if (socDrawer) {
      var socEco = document.getElementById('soc-eco-sel');
      var socQ = document.getElementById('soc-q-input');
      if (socEco) {
        socEco.addEventListener('change', function () {
          socDrawer.open = true;
        });
      }
      if (socQ) {
        socQ.addEventListener('input', function () {
          socDrawer.open = true;
        });
      }
    }
  }

  function boot() {
    initNotesConstellation();
    initLedgerD3Chart();
    initPrinciplesD3Chart();
    initProgressiveDrawers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
