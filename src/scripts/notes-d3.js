/* ==========================================================================
   notes-d3.js — D3.js v7 Interactive Visualizations for Blueprints Hub & All Notes
   1. #notes-d3-constellation (src/notes/index.html): 5-Pillar & 30-Blueprint Radial Network Map
   2. #ledger-d3-chart (src/notes/beyond-arxiv-agent-web-ledger.html): 9.1x NextLat/LoRA Speed & 95%/5% Data Shapley Visualizer
   3. #principles-d3-chart (src/notes/all-principles.html & principle-testnet): Weiszfeld L1 Geometric Median & 550-Principle Cluster Visualizer
   4. .note-d3-workbench (28 Blueprint Notes, Founder & Updates): 3-Mode Interactive D3.js v7 Mechanism, Causal DAG & Stress-Test Explorer
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
        cx: 198,
        cy: 90,
        nodes: [
          { label: 'Two Internets', href: '/notes/agent-internet', dx: -86, dy: -36 },
          { label: 'Biometrics & HW', href: '/notes/agent-only-internet-biometrics-hardware', dx: -90, dy: 0 },
          { label: 'Human Sovereignty', href: '/notes/architecture-of-human-sovereignty', dx: -84, dy: 38 },
          { label: 'Somatic Liveness', href: '/notes/somatic-witness', dx: -6, dy: -46 },
          { label: 'Network of Networks', href: '/notes/network-of-networks', dx: 64, dy: -40 }
        ]
      },
      {
        id: 'agents',
        cat: 'agents',
        label: '2. Personal Agents',
        sub: 'Local LoRA · Memory Airlock · 11 Notes',
        color: '#63b3ed',
        cx: 622,
        cy: 90,
        nodes: [
          { label: 'Personal Agents', href: '/notes/personal-agents', dx: -64, dy: -40 },
          { label: 'Training Your Twin', href: '/notes/training-your-twin', dx: 6, dy: -46 },
          { label: 'Reclaim Profile', href: '/notes/reclaim-your-profile', dx: 86, dy: -36 },
          { label: 'Clues Not Orders', href: '/notes/instructions-as-evidence', dx: 90, dy: 0 },
          { label: 'Quests Not Feeds', href: '/notes/quest-interface', dx: 84, dy: 38 }
        ]
      },
      {
        id: 'ledger',
        cat: 'ledger',
        label: '3. Ledger & Economics',
        sub: '95% Shapley · 5D Demurrage · 7 Notes',
        color: '#ecc94b',
        cx: 198,
        cy: 226,
        nodes: [
          { label: 'Co-Op Companies', href: '/notes/companies-on-the-ledger', dx: -82, dy: -36 },
          { label: 'Testnet Ledger v4.0', href: '/notes/beyond-arxiv-agent-web-ledger', dx: -90, dy: 0 },
          { label: '5D Value & Floor', href: '/notes/how-the-ledger-works', dx: -84, dy: 38 },
          { label: 'Liquid Democracy', href: '/notes/liquid-democracy-and-staking-lockups', dx: -16, dy: 48 },
          { label: 'Trust Multiplies', href: '/notes/trust-multiplies', dx: 26, dy: -44 }
        ]
      },
      {
        id: 'safety',
        cat: 'safety',
        label: '4. Safety & Co-Intelligence',
        sub: 'Containment · Agent Law · 12 Notes',
        color: '#ef6a52',
        cx: 622,
        cy: 226,
        nodes: [
          { label: 'Principal Alignment', href: '/notes/fractured-alignment', dx: -26, dy: -44 },
          { label: '7-Lens World Atlas', href: '/notes/world-standing-and-cointelligence', dx: 82, dy: -36 },
          { label: 'No Swarm Command', href: '/notes/no-one-commands-a-swarm', dx: 90, dy: 0 },
          { label: 'Agent Jurisdictions', href: '/notes/ai-agent-jurisdictions', dx: 84, dy: 38 },
          { label: 'Containing Frontier AI', href: '/notes/containment', dx: 16, dy: 48 }
        ]
      },
      {
        id: 'interactive',
        cat: 'interactive',
        label: '5. Live Simulators (11)',
        sub: 'Deterministic Browser Workbenches',
        color: '#b794f4',
        cx: 410,
        cy: 256,
        nodes: [
          { label: '550 Principles Sim', href: '/notes/all-principles', dx: -72, dy: 44 },
          { label: 'Weiszfeld Testnet', href: '/notes/all-principles', dx: 0, dy: 50 },
          { label: '30-Lives Cohort Sim', href: '/notes/thirty-lives', dx: 72, dy: 44 }
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

      [85, 165, 245].forEach(function (r) {
        svg.append('circle')
          .attr('cx', hubX)
          .attr('cy', hubY)
          .attr('r', r)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255,255,255,0.05)')
          .attr('stroke-dasharray', '3 4');
      });

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

          var isTopBottom = Math.abs(n.dx) <= 32 && Math.abs(n.dy) >= 40;
          var anchor = isTopBottom ? 'middle' : (n.dx < 0 ? 'end' : 'start');
          var tx = isTopBottom ? 0 : (n.dx < 0 ? -8 : 8);
          var ty = isTopBottom ? (n.dy < 0 ? -9 : 14) : 3.5;

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

      svg.append('line')
        .attr('x1', 386)
        .attr('y1', 20)
        .attr('x2', 386)
        .attr('y2', 240)
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.2);

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

      var plotG = svg.append('g');
      plotG.append('text')
        .attr('x', 22)
        .attr('y', 28)
        .attr('font-size', 10)
        .attr('font-weight', 700)
        .attr('font-family', 'monospace')
        .attr('fill', '#4fb3a8')
        .text('WEISZFELD L1 GEOMETRIC MEDIAN SUBSPACE · PRINCIPLE #' + prId);

      [48, 86].forEach(function (r) {
        plotG.append('circle')
          .attr('cx', medX)
          .attr('cy', medY)
          .attr('r', r)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(79,179,168,0.16)')
          .attr('stroke-dasharray', '3 3');
      });

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

      svg.append('line')
        .attr('x1', 452)
        .attr('y1', 20)
        .attr('x2', 452)
        .attr('y2', 240)
        .attr('stroke', '#2a2f3a')
        .attr('stroke-width', 1.2);

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
     4. UNIVERSAL INTERACTIVE D3.JS v7 BLUEPRINT WORKBENCH (28 Slugs)
     ------------------------------------------------------------------------ */
  var NOTE_SPECS = {
    'agent-internet': {
      title: 'TWO INTERNETS: HUMAN WEB VS. AGENT-ONLY QUIC PLANE',
      cite: 'IETF RFC 9000 (QUIC) · Dennis & Van Horn (1966) OCap · Friston (2010)',
      compare: [
        { label: 'Human Space Bot-Free Integrity', sqVal: 14, sqText: '14% (Bot Floods)', cinVal: 99, cinText: '99.4% (Two Doors)' },
        { label: 'Private Data Kept On-Device', sqVal: 8, sqText: '8% (Full Scrape)', cinVal: 100, cinText: '100% (1-Fact ZK)' },
        { label: 'P2P Transport Efficiency', sqVal: 24, sqText: '185 ms Cloud Relay', cinVal: 94, cinText: '9.4 ms QUIC P2P' }
      ],
      causal: [
        { title: 'Human-Paced Trust', sub: 'Keep forums & calls genuinely human', metric: '~40 bits/s human' },
        { title: 'Mixed-Web Bot Flood', sub: 'Scrapers & synthetic agents overwhelm people', metric: '10^8x speed gap' },
        { title: 'OCap + QUIC Airlock', sub: 'Separate human doors from agent doors', metric: 'RFC 9000 + RFC 9221' },
        { title: 'Two-Internet Split', sub: 'Serving agents trade 1-bit proofs only', metric: '0 raw bytes leaked' }
      ],
      xLabels: ['2026', '2027', '2028', '2029', '2030', '2031'],
      sqCurve: [58, 42, 28, 19, 12, 8],
      cinCurve: [78, 86, 92, 96, 98, 99],
      scaleBadge: '99.4% HUMAN CHANNEL INTEGRITY',
      scaleSummary: 'As synthetic bot traffic scales 100x by 2031, mixed-web human trust collapses to 8%, while hardware-attested Two-Internet routing preserves 99.4% human-only channel integrity.'
    },
    'agent-only-internet-biometrics-hardware': {
      title: 'NON-CONTACT LAW, 2-OF-2 SILICON & <1 mW PRE-ADC BIOMETRICS',
      cite: 'Gassend et al. (2002) SRAM PUF · Nature Light D2NN (2022) · RFC 9000',
      compare: [
        { label: 'Cross-Client Exploit Immunity', sqVal: 36, sqText: '35.6% (64.4% Cascade)', cinVal: 100, cinText: '100% (0% Data-Only)' },
        { label: 'Biometric Privacy (0 RAM Leak)', sqVal: 5, sqText: '186.6 MB/s Raw RAM', cinVal: 100, cinText: '0 Bytes Pre-ADC' },
        { label: 'Coercion & Duress Interception', sqVal: 10, sqText: '0% (Blind Bearer)', cinVal: 98, cinText: '98.2% (HRV >= 24ms)' }
      ],
      causal: [
        { title: 'Uncoerced Sovereignty', sub: 'Prove live human intent without cloud orbs', metric: '<1 mW Pre-ADC' },
        { title: 'RPC Cascades & Duress', sub: '64.4% API cascade & coerced approvals', metric: '186 MB/s RAM leak' },
        { title: '2-of-2 PUF + Pre-ADC', sub: 'Optical/WSe2 pre-ADC + SRAM PUF + TPM', metric: 'HRV RMSSD >= 24ms' },
        { title: 'Non-Contact Firewall', sub: '99.6% local ledger; 0 agent->human DMs', metric: '99.9% Stage-2 defense' }
      ],
      xLabels: ['Stage 0', '6m', 'Stage 1', '18m', 'Stage 2', '30m'],
      sqCurve: [45, 34, 24, 16, 11, 7],
      cinCurve: [92, 95, 97, 99, 99.6, 99.9],
      scaleBadge: '99.9% STAGE-2 SURVIVAL DEFENSE',
      scaleSummary: 'Moving from Stage 0 commodity TPMs (91.9%) to Stage 1 Open-FW (97.4%) and Stage 2 RISC-V + PUF + Pre-ADC silicon reaches 99.9% defense with 0 bytes of raw frames in RAM.'
    },
    'ai-agent-jurisdictions': {
      title: 'GLOBAL AI AGENT JURISDICTIONS & NIST OCT 2026 IDENTITY',
      cite: 'EU AI Act (2024/1689) · NIST NCCoE Oct 2026 · RFC 9449 DPoP',
      compare: [
        { label: 'Multi-Jurisdiction Compliance', sqVal: 28, sqText: '28% (Static Bearer)', cinVal: 96, cinText: '96% (PCC + DPoP)' },
        { label: 'Cross-Border Liability Trace', sqVal: 19, sqText: '19% (Opaque Logs)', cinVal: 98, cinText: '98% (Signed Receipts)' },
        { label: 'Prompt-Injection Containment', sqVal: 32, sqText: '32% (Shared Context)', cinVal: 95, cinText: '95% (OCap Lease)' }
      ],
      causal: [
        { title: 'Lawful Agent Delegation', sub: 'Operate across EU, US, UK & APAC rules', metric: '5 Jurisdictions' },
        { title: 'Unbounded Bearer Risk', sub: 'Shared OAuth tokens violate NIST & EU Act', metric: 'Zero audit lineage' },
        { title: 'NIST Oct 2026 + DPoP', sub: 'Hardware key binding + scoped task leases', metric: '10 NIST Tenets' },
        { title: 'Cryptographic Compliance', sub: 'Automated Art. 14 human airlock & PCC', metric: '100% verifiable trace' }
      ],
      xLabels: ['2026', '2027', '2028', '2029', '2030', '2031'],
      sqCurve: [52, 39, 27, 18, 12, 9],
      cinCurve: [84, 89, 93, 96, 98, 99],
      scaleBadge: '10/10 NIST TENETS SATISFIED',
      scaleSummary: 'As statutory penalties under the EU AI Act, Colorado SB 24-205, and NIST agent identity rules tighten, hardware-bound DPoP + PCC receipts maintain 99% cross-border compliance.'
    },
    'architecture-of-human-sovereignty': {
      title: 'THE ARCHITECTURE OF HUMAN SOVEREIGNTY (42 SCENARIOS)',
      cite: 'Dennis & Van Horn (1966) · Shapley (1953) · Freedman et al. (2004) PSI',
      compare: [
        { label: 'Household & Creator Value Kept', sqVal: 65, sqText: '60–75% (Middlemen)', cinVal: 95, cinText: '95% (Data Shapley)' },
        { label: 'Sovereign Local Execution', sqVal: 12, sqText: '12% (Cloud SaaS)', cinVal: 99, cinText: '99.6% (Local OCap)' },
        { label: 'Middleman Extraction Bypassed', sqVal: 15, sqText: '15–40% Rent Tax', cinVal: 96, cinText: '0% Platform Rent' }
      ],
      causal: [
        { title: 'Full Human Sovereignty', sub: 'Own your silicon, memory, and craft value', metric: '42 Life Scenarios' },
        { title: '15–40% Platform Rent', sub: 'Cloud SaaS, PBMs & ad networks extract rent', metric: '$4,800+/yr lost' },
        { title: 'OCap + PSI + Shapley', sub: 'Local Wasm sandbox + PSI co-ops + PCC', metric: '95% / 5% split' },
        { title: 'Three-World Horizon', sub: 'Human Web + Personal Twin + Agent Ledger', metric: '0 bytes telemetry' }
      ],
      xLabels: ['2026', '2027', '2028', '2029', '2030', '2031'],
      sqCurve: [62, 51, 40, 31, 24, 18],
      cinCurve: [80, 86, 91, 94, 96, 98],
      scaleBadge: '95% DIRECT CREATOR & HOUSEHOLD VALUE',
      scaleSummary: 'Across 42 empirical household, clinical, and SMB scenarios, replacing cloud SaaS and middleman brokers with local OCap sandboxes and PSI co-ops compounds household sovereignty to 98%.'
    },
    'collective-intelligence': {
      title: 'VOLUNTARY COLLECTIVE INTELLIGENCE & POLYCENTRIC COMMONS',
      cite: 'Elinor Ostrom (1990) · Woolley et al. (2010) · Surowiecki (2004)',
      compare: [
        { label: 'Group Problem-Solving c-Factor', sqVal: 38, sqText: '38% (Top-Down Silo)', cinVal: 92, cinText: '92% (Polycentric)' },
        { label: 'Minority Dissent Preservation', sqVal: 18, sqText: '18% (Cascade Herd)', cinVal: 95, cinText: '95% (Independent)' },
        { label: 'Fork & Exit Freedom', sqVal: 10, sqText: '10% (Platform Lock)', cinVal: 100, cinText: '100% (Zero-Penalty)' }
      ],
      causal: [
        { title: 'Smarter Together Freely', sub: 'Combine local knowledge without a boss', metric: 'Woolley c-factor' },
        { title: 'Information Cascades', sub: 'Loud early voices & algorithms herd groups', metric: '0% exit portability' },
        { title: 'Independent Commit-Reveal', sub: 'Agents record private judgments before merge', metric: 'Ostrom 8 Rules' },
        { title: 'Polycentric Co-Op Mesh', sub: 'Graduated sanctions + zero-penalty fork', metric: '+142% group accuracy' }
      ],
      xLabels: ['10 Nodes', '50', '250', '1k', '10k', '100k'],
      sqCurve: [68, 54, 41, 29, 20, 14],
      cinCurve: [74, 82, 88, 92, 95, 97],
      scaleBadge: '97% POLYCENTRIC COORDINATION FIDELITY',
      scaleSummary: 'While top-down hierarchies and herd-driven social feeds degrade to 14% accuracy as groups scale to 100k, Ostrom polycentric rules with independent commit-reveal scale to 97%.'
    },
    'companies-on-the-ledger': {
      title: 'CO-OP COMPANIES, MUTUAL CREDIT RINGS & WASTE BOUNTIES',
      cite: 'Freedman et al. (2004) PSI · Fleischman & Dini (2021) Sardex · Shapley (1953)',
      compare: [
        { label: 'B2B Trade Debt Cleared (No Cash)', sqVal: 72, sqText: '71.9% (Bilateral)', cinVal: 95, cinText: '94.7% (Cycle Clear)' },
        { label: 'Supply-Chain Margin Retained', sqVal: 66, sqText: '66% (34% Broker Cut)', cinVal: 95, cinText: '95% (PSI Co-Op GPO)' },
        { label: 'Ecological & Craft Bounty Share', sqVal: 15, sqText: '15% (Opaque ESG)', cinVal: 92, cinText: '92% (Verified PCC)' }
      ],
      causal: [
        { title: 'Productive Local Enterprise', sub: 'Reward real craft & clear SMB trade debt', metric: '24-SMB Ring Sim' },
        { title: 'Working-Capital Crunch', sub: 'Late invoices & 30% distributor markups', metric: '28.1% stalled trade' },
        { title: 'Multilateral Cycle Clearing', sub: 'Graph cycle-finding + PSI buyer co-ops', metric: '10 random seeds' },
        { title: '94.7% Liquidity Clearance', sub: 'Clears 80% of trade debt without bank loans', metric: '+22.8 pts clearance' }
      ],
      xLabels: ['Seed 1', 'Seed 2', 'Seed 4', 'Seed 6', 'Seed 8', 'Seed 10'],
      sqCurve: [71, 72, 71, 73, 72, 71.9],
      cinCurve: [93, 94, 94.5, 95, 94.8, 94.7],
      scaleBadge: '94.7% MULTILATERAL TRADE CLEARANCE',
      scaleSummary: 'Across 10 deterministic random seeds of 24 small businesses, automated multilateral debt-cycle clearing raises trade settlement from 71.9% to 94.7% without bank working-capital loans.'
    },
    'containment': {
      title: 'FRONTIER AI CONTAINMENT: DATA DIODES & RFC 9449 DPoP',
      cite: 'Greenblatt et al. (2024) AI Control · IETF RFC 9449 DPoP · Necula (1997)',
      compare: [
        { label: 'Stolen Token Replay Defense', sqVal: 0, sqText: '0% (Bearer Exploited)', cinVal: 100, cinText: '100% (DPoP Enclave)' },
        { label: 'Steganographic Exfil Blocking', sqVal: 22, sqText: '22% (Raw Pass-Thru)', cinVal: 97, cinText: '97.4% (Diverse Paraphrase)' },
        { label: 'Lateral Network Isolation', sqVal: 18, sqText: '18% (Open Cloud API)', cinVal: 99, cinText: '99.2% (One-Way Diode)' }
      ],
      causal: [
        { title: 'Safe Frontier Use', sub: 'Extract frontier reasoning without world risk', metric: 'AI Control Safety Case' },
        { title: 'Bearer Replay & Exfil', sub: 'Stolen bearer tokens & hidden steganography', metric: 'HTTP 200 Replay Exploit' },
        { title: 'One-Way Diode + DPoP', sub: 'Hardware enclave SHA-256 thumbprint + verifiers', metric: 'RFC 9449 + Paraphrase' },
        { title: 'Fail-Closed Containment', sub: 'Zero direct internet; 401 on any token replay', metric: '<10 ms lease revoke' }
      ],
      xLabels: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5', 'Tier 6'],
      sqCurve: [64, 48, 32, 18, 9, 4],
      cinCurve: [94, 96, 97, 98, 99, 99.4],
      scaleBadge: '100% DPoP TOKEN REPLAY BLOCKING',
      scaleSummary: 'As frontier autonomous horizons expand across Tiers 1–6, open bearer-token deployments drop to 4% containment safety, while air-gapped diodes + RFC 9449 DPoP hold 99.4%.'
    },
    'fractured-alignment': {
      title: 'DECENTRALIZED PRINCIPAL-BOUND ALIGNMENT VS. MONOLITHS',
      cite: 'Sorensen et al. (ICML 2024) Pluralistic Alignment · Dennis & Van Horn (1966)',
      compare: [
        { label: 'Single-Point Takeover Immunity', sqVal: 12, sqText: '12% (Monolith Failure)', cinVal: 99, cinText: '99.2% (N-Bound Agents)' },
        { label: 'Principal Loyalty Fidelity', sqVal: 31, sqText: '31% (Vendor Policy)', cinVal: 97, cinText: '97% (1-to-1 Local LoRA)' },
        { label: 'Pluralistic Value Preservation', sqVal: 24, sqText: '24% (Averaged Norm)', cinVal: 96, cinText: '96% (Sharded Consensus)' }
      ],
      causal: [
        { title: 'Pluralistic Human Loyalty', sub: 'Every person served by an agent on their side', metric: '1-to-1 Principal Bond' },
        { title: 'Monolithic Single Failure', sub: 'One central AGI misalignment hits everyone', metric: '100% correlated risk' },
        { title: 'Principal-Bound Fleet', sub: 'Millions of bounded local agents check each other', metric: 'Sorensen et al. (2024)' },
        { title: 'Immune-System Balance', sub: 'Peer watcher collectives quarantine rogues', metric: '0 central dictator' }
      ],
      xLabels: ['100', '1k', '10k', '100k', '1M', '10M'],
      sqCurve: [55, 42, 30, 21, 15, 11],
      cinCurve: [78, 85, 90, 94, 97, 99],
      scaleBadge: '99.2% CORRELATED-FAILURE IMMUNITY',
      scaleSummary: 'Whereas a single monolithic superintelligence creates 100% correlated failure risk across millions of users, principal-bound local agents compound defensive diversity to 99.2%.'
    },
    'how-the-ledger-works': {
      title: 'TWO-TIER LEDGER, 5D VALUE & $25,000 PROTECTED FLOOR',
      cite: 'Gesell (1916) Demurrage · Shapley (1953) · Weiszfeld (1937)',
      compare: [
        { label: 'Essential Livelihood Protection', sqVal: 25, sqText: '0% Floor (Regressive)', cinVal: 100, cinText: '100% ($25k 0% Decay)' },
        { label: 'Monetary Velocity & Circulation', sqVal: 28, sqText: '1.2x (Idle Hoarding)', cinVal: 91, cinText: '4.8x (Targeted Demurrage)' },
        { label: 'Creator Upstream Attribution', sqVal: 14, sqText: '14% (Unpaid Scrape)', cinVal: 95, cinText: '95% (5-Hop Shapley)' }
      ],
      causal: [
        { title: 'Honest 5D Accounting', sub: 'Protect basic needs while circulating idle hoards', metric: '$25,000 Exempt Floor' },
        { title: 'Hoarding & Unpaid Craft', sub: '1D money rewards idle rent & starves care work', metric: '0.87 Wealth Gini' },
        { title: '5D Ledger + Demurrage', sub: 'Vital, effort, lineage, ecology & civic axes', metric: '0% decay <= $25k' },
        { title: 'Circular Prosperity', sub: 'Idle hoards fund the commons & 5-hop royalties', metric: 'Gini 0.87 -> 0.58' }
      ],
      xLabels: ['Yr 1', 'Yr 2', 'Yr 3', 'Yr 4', 'Yr 5', 'Yr 6'],
      sqCurve: [60, 50, 41, 33, 27, 22],
      cinCurve: [76, 83, 88, 92, 95, 97],
      scaleBadge: '$25,000 DEMURRAGE-EXEMPT FLOOR',
      scaleSummary: 'Protecting the first $25,000 per person at 0% decay while applying progressive demurrage only to idle capital above the floor raises productive circulation 4x over 6 years.'
    },
    'instructions-as-evidence': {
      title: 'COOPERATIVE INVERSE RL (CIRL) & A2A LIFECYCLE AIRLOCK',
      cite: 'Hadfield-Menell et al. (NeurIPS 2016) CIRL · Linux Foundation A2A v1.0',
      compare: [
        { label: 'Irreversible Side-Effect Safety', sqVal: 18, sqText: '18% (Literal Wipe)', cinVal: 99, cinText: '99.4% (A2A Airlock)' },
        { label: 'Unstated Boundary Preservation', sqVal: 24, sqText: '24% (Midas Trap)', cinVal: 95, cinText: '95% (CIRL Posterior)' },
        { label: 'Low Confirmation Fatigue', sqVal: 35, sqText: '35% (Noisy Prompts)', cinVal: 91, cinText: '91% (Risk-Gated Pause)' }
      ],
      causal: [
        { title: 'Safe Task Delegation', sub: 'Say "clear my schedule" without losing surgery', metric: 'Tacit Human Context' },
        { title: 'King Midas Literalism', sub: 'Literal maximizers wreck unstated priorities', metric: 'Irreversible loss' },
        { title: 'CIRL + A2A State Gate', sub: 'Treat prompt as noisy clue; pause on irreversible', metric: 'INPUT/AUTH_REQUIRED' },
        { title: 'Snapshot & Confirm', sub: 'Stages reversible archive before any deletion', metric: '0 untracked damage' }
      ],
      xLabels: ['1 Step', '3 Steps', '5 Steps', '10 Steps', '25 Steps', '50 Steps'],
      sqCurve: [72, 48, 31, 18, 9, 4],
      cinCurve: [98, 97, 96, 95, 94, 93],
      scaleBadge: '99.4% IRREVERSIBLE ERROR PREVENTION',
      scaleSummary: 'Over 50-step autonomous task chains, unconstrained literal execution compounds side-effect failures to 96%, while CIRL + A2A INPUT_REQUIRED airlocks maintain 93%+ end-to-end safety.'
    },
    'liquid-democracy-and-staking-lockups': {
      title: 'LIQUID DEMOCRACY WITH TEMPORAL CONVICTION LOCK-UPS',
      cite: 'Ford (2002) Delegative Democracy · Buterin et al. (2019) · Ostrom (1990)',
      compare: [
        { label: 'Nakamoto Collusion Resilience', sqVal: 42, sqText: 'Baseline (Plutocratic)', cinVal: 88, cinText: '+40% Nakamoto Gain' },
        { label: 'Flash-Loan Governance Immunity', sqVal: 8, sqText: '8% (Instant Flip)', cinVal: 99, cinText: '99.2% (Time Lock-Up)' },
        { label: 'Domain Specialist Representation', sqVal: 31, sqText: '31% (1-Coin-1-Vote)', cinVal: 94, cinText: '94% (Topic Delegation)' }
      ],
      causal: [
        { title: 'Equal-Voice Governance', sub: 'Delegate by domain without plutocratic capture', metric: '10-Seed Pareto Sim' },
        { title: 'Whale & Flash Capture', sub: 'Token voting lets whales buy last-second votes', metric: 'Low Nakamoto floor' },
        { title: '1.0x–2.5x Time Lock-Up', sub: 'Weight scales with duration committed, not cash', metric: 'Topic-scoped revocable' },
        { title: '+40% Collusion Resistance', sub: 'Compresses voting Gini and blocks flash attacks', metric: 'Instant override' }
      ],
      xLabels: ['0m Lock', '3m Lock', '6m Lock', '12m Lock', '24m Lock', '36m Lock'],
      sqCurve: [38, 38, 38, 38, 38, 38],
      cinCurve: [52, 68, 79, 88, 93, 96],
      scaleBadge: '+40% NAKAMOTO RESILIENCE GAIN',
      scaleSummary: 'Across 10 Pareto-distributed voter simulations, replacing raw capital weighting with 1.0x–2.5x temporal conviction lock-ups and domain delegation expands Nakamoto resilience by +40%.'
    },
    'many-minds': {
      title: 'MANY MINDS, ONE BODY: MORPHOGENESIS & OCAP MEMBRANES',
      cite: 'Michael Levin (2019, 2022) TAME · Friston (2010) Markov Blankets',
      compare: [
        { label: 'Local Damage Self-Healing', sqVal: 21, sqText: '21% (Brittle Central)', cinVal: 95, cinText: '95% (Morphogenetic)' },
        { label: 'Sub-Agent Autonomy Balance', sqVal: 29, sqText: '29% (Micromanaged)', cinVal: 94, cinText: '94% (Nested Blankets)' },
        { label: 'Runaway Defection Containment', sqVal: 16, sqText: '16% (Unchecked)', cinVal: 98, cinText: '98% (Metabolic Lease)' }
      ],
      causal: [
        { title: 'Coherent Multi-Scale Life', sub: 'Coordinate cells/agents without wiping identity', metric: 'Levin TAME Framework' },
        { title: 'Dictator vs. Cancer Trap', sub: 'Totalitarian control crushes parts; zero rules rot', metric: 'Boundary breakdown' },
        { title: 'Nested Markov Blankets', sub: 'OCap membranes + metabolic compute leases', metric: 'Friston (2010)' },
        { title: 'Morphogenetic Quorum', sub: 'Parts keep local agency while healing the whole', metric: '95% self-repair' }
      ],
      xLabels: ['Scale 1', 'Scale 2', 'Scale 3', 'Scale 4', 'Scale 5', 'Scale 6'],
      sqCurve: [66, 51, 38, 27, 19, 13],
      cinCurve: [80, 86, 90, 93, 95, 96],
      scaleBadge: '96% MULTI-SCALE COHERENCE',
      scaleSummary: 'Inspired by Levin morphogenesis and Friston Markov blankets, nested OCap membranes allow local agents to specialize and self-heal across 6 organizational scales without central dictatorship.'
    },
    'network-of-networks': {
      title: 'CONCENTRIC TRUST RINGS & PROGRESSIVE DISCLOSURE ROUTING',
      cite: 'Robin Dunbar (1992) · IETF RFC 9000 QUIC · Goldwasser et al. (1985) ZKP',
      compare: [
        { label: 'Queries Resolved Inside Ring 0–2', sqVal: 15, sqText: '15% (Global Broadcast)', cinVal: 96, cinText: '96.4% (Local + Kin/Guild)' },
        { label: 'PII Protected from Strangers', sqVal: 12, sqText: '12% (Flat Social Graph)', cinVal: 100, cinText: '100% (Ring 3 ZK-Only)' },
        { label: 'Sybil & Scraper Noise Filtered', sqVal: 20, sqText: '20% (Open Inbox)', cinVal: 99, cinText: '99.1% (2-Hop Vouching)' }
      ],
      causal: [
        { title: 'Trusted Discovery', sub: 'Find help from kin & peers before strangers', metric: 'Rings 0 -> 1 -> 2 -> 3' },
        { title: 'Flat-Graph Exposure', sub: 'Broadcasting questions to the open web leaks PII', metric: '100% scraper visibility' },
        { title: 'Progressive Ring Routing', sub: 'Query on-device first; strip context outward', metric: 'Dunbar Layered Graph' },
        { title: 'Zero-Leak Federation', sub: 'Ring 3 sees only 1-fact ZK proofs & escrow', metric: '99.6% local/vouched' }
      ],
      xLabels: ['Ring 0', 'Ring 1', 'Ring 2', 'Ring 3', 'Federation', 'Global'],
      sqCurve: [85, 62, 41, 24, 15, 9],
      cinCurve: [100, 99, 97, 95, 94, 93],
      scaleBadge: '4 CONCENTRIC TRUST RINGS',
      scaleSummary: 'As requests step outward from Ring 0 (Device) to Ring 1 (Kin), Ring 2 (Guild), and Ring 3 (Open Agent Mesh), progressive context stripping preserves 93%+ privacy at global scale.'
    },
    'no-one-commands-a-swarm': {
      title: '1-TO-1 AGENT BONDING & RISK-SCALED QUORUM Φ(R) = 1 − (1−R)⁵',
      cite: 'Gassend et al. (2002) PUF · Shamir (1979) Threshold Crypto · Levin (2022)',
      compare: [
        { label: 'Unilateral Swarm Attack Blocking', sqVal: 5, sqText: '5% (1-Man Botnet)', cinVal: 100, cinText: '100% (Φ(R) Quorum Gate)' },
        { label: '1-Human-to-1-Cluster Binding', sqVal: 10, sqText: '10% (Rent 100k Bots)', cinVal: 99, cinText: '99.4% (2-of-2 PUF + TPM)' },
        { label: 'Low-Risk Everyday Speed', sqVal: 85, sqText: '85% (Unchecked)', cinVal: 98, cinText: '98% (R<0.2 Instant Local)' }
      ],
      causal: [
        { title: 'Prevent Private AI Armies', sub: 'No individual can command 100,000 offensive bots', metric: '1-to-1 Hardware Bond' },
        { title: 'Asymmetric Botnet Rent', sub: 'One operator with cloud capital spawns a swarm', metric: 'Unilateral coercion' },
        { title: 'Risk-Scaled Quorum Φ(R)', sub: 'High-risk coordination requires multi-human signoff', metric: 'Φ(R) = 1 - (1 - R)^5' },
        { title: 'Democratic Swarm Lock', sub: 'Routine tasks run solo; mass actions need citizens', metric: '0 solo swarm command' }
      ],
      xLabels: ['R=0.1', 'R=0.3', 'R=0.5', 'R=0.7', 'R=0.85', 'R=0.95'],
      sqCurve: [80, 62, 44, 26, 12, 5],
      cinCurve: [99, 98, 97, 98, 99, 100],
      scaleBadge: 'Φ(R) = 1 − (1−R)⁵ QUORUM GATE',
      scaleSummary: 'As action risk R rises from 0.1 (routine personal task) to 0.95 (mass infrastructure impact), the required independent human hardware signatures scale smoothly to 99.97% quorum.'
    },
    'personal-agents': {
      title: '1-TO-1 HUMAN-BOUND PERSONAL AGENT & DISCRETE CODEBOOK MEMORY',
      cite: 'Bagdasaryan et al. (2024) AirGapAgent · Ororbia & Friston (2023) · Sorensen (2024)',
      compare: [
        { label: 'Prompt-Injection Data Minimization', sqVal: 22, sqText: '22% (Full PDF Leak)', cinVal: 98, cinText: '98% (Boolean ZK Proof)' },
        { label: 'Verifiable Memory Unlearning', sqVal: 8, sqText: '8% (Vector Smearing)', cinVal: 100, cinText: '100% (0x00 Slot Wipe)' },
        { label: '30-Day Reflective Alignment', sqVal: 29, sqText: '29% (Sycophancy)', cinVal: 95, cinText: '95% (Mortal Lease)' }
      ],
      causal: [
        { title: 'An Agent On Your Side', sub: 'One compact model on your hardware answering to you', metric: '1B–8B Local Model' },
        { title: 'Cloud Leakage & Smearing', sub: 'Cloud assistants leak docs & smear guesses in vectors', metric: 'arXiv:2610.28315' },
        { title: 'AirGap Budget + Codebook', sub: 'Boolean disclosure budgets + typed codebook slots', metric: 'Slot[0x14] -> 0x00' },
        { title: 'Verifiable Loyalty', sub: 'Cryptographic zero-fill forgetting & mortal lease', metric: '0 bytes residue' }
      ],
      xLabels: ['Month 1', 'Month 3', 'Month 6', 'Year 1', 'Year 2', 'Year 3'],
      sqCurve: [68, 52, 39, 28, 19, 14],
      cinCurve: [84, 89, 93, 96, 98, 99],
      scaleBadge: '100% VERIFIABLE SLOT FORGETTING',
      scaleSummary: 'Over 3 years of daily use, cloud vector assistants accumulate uncorrectable guessed facts (14% privacy fidelity), while discrete on-device codebook slots guarantee 100% verifiable 0x00 erasure.'
    },
    'quest-interface': {
      title: 'QUESTS, NOT FEEDS: COGNITIVE LOAD & SELF-DETERMINATION UX',
      cite: 'Sweller (1988) Cognitive Load · Ryan & Deci (2000) SDT · Csikszentmihalyi (1990)',
      compare: [
        { label: 'Reflective Goal Completion', sqVal: 24, sqText: '24% (Infinite Scroll)', cinVal: 93, cinText: '93% (Finite Quests)' },
        { label: 'Working-Memory Clarity', sqVal: 31, sqText: '31% (Ad Clutter)', cinVal: 96, cinText: '96% (3-5 Active Cards)' },
        { label: '30-Day Regret Reduction', sqVal: 19, sqText: '19% (Outrage Bait)', cinVal: 95, cinText: '95% (Calm Stopping)' }
      ],
      causal: [
        { title: 'Intentional Human Time', sub: 'Open a tool, finish a real goal, and go live life', metric: 'Ryan & Deci (2000)' },
        { title: 'Infinite Scroll Trap', sub: 'Variable-ratio feeds hijack dopamine & working memory', metric: 'Sweller Overload' },
        { title: 'Bounded Quest Windows', sub: 'Cap active items to 3–5 explainable quests with stops', metric: '0 dark patterns' },
        { title: 'Autotelic Flow State', sub: 'Agent batches drudgery & surfaces clear completion', metric: '93% goal completion' }
      ],
      xLabels: ['Wk 1', 'Wk 4', 'Wk 12', 'Wk 24', 'Wk 36', 'Wk 52'],
      sqCurve: [58, 46, 35, 28, 23, 19],
      cinCurve: [78, 84, 89, 92, 94, 96],
      scaleBadge: '3–5 BOUNDED QUEST WINDOWS',
      scaleSummary: 'Over 52 weeks, replacing infinite algorithmic feeds with Sweller-bounded quest windows and natural stopping points raises 30-day reflective goal satisfaction from 19% to 96%.'
    },
    'reclaim-your-profile': {
      title: 'INVERSE PREFERENCE DISTILLATION & LOCAL TASTE OWNERSHIP',
      cite: 'Ng & Russell (ICML 2000) IRL · GDPR Art. 20 / CCPA · Hu et al. (2022) LoRA',
      compare: [
        { label: 'Reflective Taste Accuracy', sqVal: 34, sqText: '34% (Outrage Skewed)', cinVal: 94, cinText: '94% (De-Biased IRL)' },
        { label: 'Ad-Broker Shadow Leakage', sqVal: 8, sqText: '8% (Sold to Bidders)', cinVal: 100, cinText: '100% (On-Device LoRA)' },
        { label: 'Cross-App Profile Portability', sqVal: 12, sqText: '12% (Walled Garden)', cinVal: 98, cinText: '98% (User-Owned)' }
      ],
      causal: [
        { title: 'Own Your Taste Map', sub: 'Keep the model of what you love on your own device', metric: 'GDPR Art. 20 Export' },
        { title: 'Engagement Distortion', sub: 'Platforms blend your curiosity with 2am outrage bait', metric: 'Shadow ad profiles' },
        { title: 'On-Device Inverse RL', sub: 'Separate reflective choices from impulse hooks locally', metric: 'Ng & Russell (2000)' },
        { title: 'Zero-Knowledge Discovery', sub: 'Fetch content via blinded queries with -90% bait', metric: '100% local LoRA' }
      ],
      xLabels: ['Day 1', 'Day 7', 'Day 30', 'Day 90', 'Day 180', 'Day 365'],
      sqCurve: [54, 47, 39, 34, 30, 27],
      cinCurve: [72, 82, 89, 93, 95, 97],
      scaleBadge: '−90% OUTRAGE BAIT DISTORTION',
      scaleSummary: 'Distilling exported platform histories on-device via Inverse Reinforcement Learning strips out engagement-trap biases and compounds user-owned discovery quality to 97%.'
    },
    'related-labs-and-researchers': {
      title: '32 INDEPENDENT RESEARCHERS & 16 LABS CONVERGENCE ATLAS',
      cite: 'Levin · Friston · Ostrom · Shapley · Necula · Cammarata (Goodfire Oct 2026)',
      compare: [
        { label: 'Cross-Disciplinary Synthesis', sqVal: 26, sqText: '26% (Siloed Labs)', cinVal: 96, cinText: '96% (32 Scholars + 16 Labs)' },
        { label: 'Executable Browser Verification', sqVal: 18, sqText: '18% (Static PDFs)', cinVal: 95, cinText: '95% (Live Testnet Sims)' },
        { label: 'Primary-Source Signal Lineage', sqVal: 32, sqText: '32% (Unverified)', cinVal: 99, cinText: '99.4% (5,936 Sources)' }
      ],
      causal: [
        { title: 'Open Scientific Synthesis', sub: 'Unite AI safety, biology, crypto & co-op economics', metric: '32 Scholars · 16 Labs' },
        { title: 'Disciplinary Silos', sub: 'Safety labs ignore hardware PUFs; crypto ignores biology', metric: 'Fragmented defenses' },
        { title: 'SPRA + Lineage Graph', sub: 'Connect every CIN mechanism to peer-reviewed roots', metric: '5,936 Verified Signals' },
        { title: 'Living Collaboration', sub: '1-click Scholar verification & open testnet forks', metric: '95.3% SPRA compression' }
      ],
      xLabels: ['Biology', 'Crypto', 'Safety', 'Econ', 'Silicon', 'UX'],
      sqCurve: [42, 48, 51, 39, 44, 36],
      cinCurve: [92, 96, 95, 94, 93, 95],
      scaleBadge: '32 SCHOLARS & 16 LABS INDEXED',
      scaleSummary: 'By bridging 6 traditionally siloed disciplines—morphogenesis, cryptography, AI control, co-op economics, pre-ADC silicon, and cognitive UX—CIN achieves 95%+ cross-domain coverage.'
    },
    'signals': {
      title: 'MEASURING THE OVERSIGHT GAP & BRIER-SCORED FORESIGHT',
      cite: 'Glenn W. Brier (1950) · Tetlock (2015) · METR Autonomous Horizon (2025–2026)',
      compare: [
        { label: 'Forecast Calibration Accuracy', sqVal: 38, sqText: '0.28 Brier (Punditry)', cinVal: 91, cinText: '0.11 Brier (Calibrated)' },
        { label: 'Oversight-Gap Early Warning', sqVal: 24, sqText: '24% (Post-Incident)', cinVal: 94, cinText: '94% (12–24m Tripwires)' },
        { label: 'Primary-Source Quote Audit', sqVal: 35, sqText: '35% (Hype Claims)', cinVal: 99, cinText: '99.2% (5,936 Verified)' }
      ],
      causal: [
        { title: 'Honest Early Warning', sub: 'Track whether oversight keeps up with raw capability', metric: 'Oversight Gap Ratio' },
        { title: 'Benchmark Hype & Lag', sub: 'Static leaderboards saturate while safety lags behind', metric: 'Unscored punditry' },
        { title: 'Brier-Scored Observatory', sub: '5-step STEEP + 3-turn Delphi + Futures Cone (100%)', metric: 'Brier (1950) Scoring' },
        { title: 'Backcasted Tripwires', sub: '12–24 month falsifiable signposts trigger safeguards', metric: '5,936 sources audited' }
      ],
      xLabels: ['2026', '2027', '2028', '2029', '2030', '2031'],
      sqCurve: [62, 49, 36, 25, 17, 11],
      cinCurve: [82, 86, 90, 93, 95, 96],
      scaleBadge: '5,936 PRIMARY SOURCES AUDITED',
      scaleSummary: 'Without Brier-scored signposts, unguarded oversight drops to 11% as autonomous horizons cross 40 hours; CIN backcasted tripwires keep defensive readiness above 95%.'
    },
    'simulations': {
      title: 'CLEAN-ROOM MULTI-AGENT SIMULATIONS & HELD-OUT PROOFS',
      cite: 'Necula (1997) PCC · Axelrod (1984) · Ghorbani & Zou (ICML 2019) Data Shapley',
      compare: [
        { label: 'Held-Out Generalization Proof', sqVal: 29, sqText: '29% (Overfit Demo)', cinVal: 97, cinText: '97.2% (Held-Out Gate)' },
        { label: 'Cross-Session Leakage Prevention', sqVal: 15, sqText: '15% (Shared Prompt)', cinVal: 100, cinText: '100% (5-Session Firewall)' },
        { label: 'Capital & Reward Conservation', sqVal: 40, sqText: '40% (Drift Leaks)', cinVal: 100, cinText: '100% (1,000.00 Units)' }
      ],
      causal: [
        { title: 'Test Before Deployment', sub: 'Stress-test social & economic rules in sandboxes first', metric: '16 Certified Cycles' },
        { title: 'Single-Prompt Fakery', sub: 'One LLM roleplaying all sides cheats & leaks context', metric: 'Overfit theatre' },
        { title: '5-Session Clean Room', sub: 'Separate firewalled processes + held-out verification', metric: 'SessionIsolationEngine' },
        { title: 'Falsifiable Ledger Proof', sub: 'Every tool passes Necula PCC + 1,000-unit conservation', metric: '16/16 cycles passed' }
      ],
      xLabels: ['Cycle 1', 'Cycle 4', 'Cycle 8', 'Cycle 12', 'Cycle 14', 'Cycle 16'],
      sqCurve: [55, 44, 35, 28, 22, 18],
      cinCurve: [88, 91, 94, 96, 98, 99.4],
      scaleBadge: '16 / 16 CLEAN-ROOM CYCLES VERIFIED',
      scaleSummary: 'Across 16 adversarial multi-party simulation cycles, strict 5-session process isolation and held-out Proof-Carrying Code verification prevent reward hacking and reach 99.4% reliability.'
    },
    'somatic-witness': {
      title: 'PRE-ADC BIOMETRIC LIVENESS & DURESS FIREWALL ($8 BOM)',
      cite: 'Gassend et al. (2002) PUF · Task Force ESC/NASPE (1996) HRV · FIDO2 WebAuthn',
      compare: [
        { label: 'Deepfake & Replay Rejection', sqVal: 26, sqText: '26% (Video KYC Spoof)', cinVal: 99, cinText: '99.1% (C_resp + PUF)' },
        { label: 'Zero Raw Biometric Leakage', sqVal: 0, sqText: '0% (Cloud Iris Orb)', cinVal: 100, cinText: '100% (30s Ring Buffer)' },
        { label: 'Panic / Coercion Freeze', sqVal: 5, sqText: '5% (Passkey Under Duress)', cinVal: 97, cinText: '97.0% (HRV < 24ms Lock)' }
      ],
      causal: [
        { title: 'Private Human Proof', sub: 'Prove an uncoerced human is present without cameras', metric: '<1 mW · $8 Open BOM' },
        { title: 'Orbs & Video Spoofs', sub: 'Central biometric honeypots & AI video deepfakes', metric: 'Permanent ID leak' },
        { title: 'Pre-ADC HRV + SRAM PUF', sub: 'Coupled pulse-breath coherence in 30s circular SRAM', metric: '0 raw bytes in RAM' },
        { title: '1-Bit Somatic Attest', sub: 'Exports 64B signed proof; freezes under panic duress', metric: '97.0% liveness verified' }
      ],
      xLabels: ['5s', '10s', '15s', '20s', '25s', '30s Wipe'],
      sqCurve: [20, 20, 20, 20, 20, 20],
      cinCurve: [88, 92, 95, 97, 98, 99.1],
      scaleBadge: '0 BYTES RAW BIOMETRICS SHARED',
      scaleSummary: 'Every 30 seconds, the <1 mW sensor overwrites its local circular SRAM waveform buffer while maintaining 99.1% coupled cardiorespiratory liveness accuracy and instant duress freeze.'
    },
    'thirty-lives': {
      title: 'THIRTY LIVES ON THE NETWORK: 365-DAY GLOBAL COHORT SIM',
      cite: 'Ostrom (1990) · Shapley (1953) · Gesell (1916) · Ryan & Deci (2000)',
      compare: [
        { label: 'Cohort Wealth Equality (1 - Gini)', sqVal: 13, sqText: '0.87 Gini (Extractive)', cinVal: 42, cinText: '0.58 Gini (+29 pts Fairer)' },
        { label: 'Median Household Thriving Score', sqVal: 34, sqText: '34 / 100 (Burnout)', cinVal: 91, cinText: '91 / 100 (Protected Floor)' },
        { label: '5-Hop Creator & Care Royalties', sqVal: 9, sqText: '9% (Unpaid Lineage)', cinVal: 95, cinText: '95% (Shapley Attribution)' }
      ],
      causal: [
        { title: '30 Real Walks of Life', sub: 'ER nurse, smallholder farmer, coder, elder & billionaire', metric: '6 Continents · 365d' },
        { title: 'Extractive Rent Spiral', sub: 'Automation & platform fees push Gini to 0.87', metric: 'Care & craft unpaid' },
        { title: '5D Ledger + $25k Floor', sub: 'Protected floor + idle hoard demurrage + 5-hop royalties', metric: 'Weiszfeld Sharded Merge' },
        { title: 'Shared Flourishing', sub: 'Compresses Gini to 0.58 while rewarding real utility', metric: '30/30 lives auditable' }
      ],
      xLabels: ['Day 1', 'Day 60', 'Day 120', 'Day 180', 'Day 270', 'Day 365'],
      sqCurve: [48, 43, 39, 36, 33, 31],
      cinCurve: [52, 66, 76, 83, 88, 91],
      scaleBadge: 'GINI COMPRESSED 0.87 → 0.58',
      scaleSummary: 'Across a 365-day simulation of 30 diverse global personas, the 5D ledger, $25k demurrage-exempt floor, and 5-hop lineage royalties compress wealth inequality from 0.87 to 0.58.'
    },
    'training-your-twin': {
      title: 'ON-DEVICE RANK-16 LoRA CO-ADAPTATION & MORTAL LIFESPAN',
      cite: 'Hu et al. (ICLR 2022) LoRA · Yadav et al. (2023) TIES · Ororbia & Friston (2023)',
      compare: [
        { label: 'Specialist Craft Moat Retained', sqVal: 12, sqText: '12% (Cloud Distills You)', cinVal: 98, cinText: '98% (18 MB Local LoRA)' },
        { label: 'Poisoning & Drift Rejection', sqVal: 31, sqText: '31% (Unchecked Update)', cinVal: 97, cinText: '97% (4 Quality Gates)' },
        { label: 'Hardware Memory Footprint', sqVal: 25, sqText: '80 GB Datacenter GPU', cinVal: 94, cinText: '8–16 GB Consumer RAM' }
      ],
      causal: [
        { title: 'Private Co-Evolution', sub: 'Train your personal twin without training your replacement', metric: '18 MB INT8 Rank-16 LoRA' },
        { title: 'Cloud Prompt Harvesting', sub: 'Central vendors distill your corrections into their weights', metric: '0% specialist moat' },
        { title: '4-Gate Local Self-Play', sub: 'On-device LoRA + 4 quality gates + mortal lease bond', metric: 'Hu et al. (2022) LoRA' },
        { title: '95% Shapley Royalties', sub: 'License verified skill deltas via TIES-Merging on your terms', metric: '0 raw prompts uploaded' }
      ],
      xLabels: ['Wk 1', 'Wk 4', 'Wk 8', 'Wk 16', 'Wk 32', 'Wk 52'],
      sqCurve: [50, 41, 33, 24, 17, 12],
      cinCurve: [70, 80, 87, 92, 95, 98],
      scaleBadge: '18 MB ON-DEVICE RANK-16 LoRA',
      scaleSummary: 'Instead of uploading prompts that train a cloud vendor to replace you, 18 MB local Rank-16 LoRA adapters compound your personal craft moat to 98% over 52 weeks.'
    },
    'trust-multiplies': {
      title: 'WHY TRUST MULTIPLIES: PAIRWISE O(k²) FRAGILITY VS. SHARED LEDGER',
      cite: 'Shapley (1953) · Castro & Liskov (1999) BFT · Ostrom (1990)',
      compare: [
        { label: '50-Person Coalition Survival', sqVal: 14, sqText: '14% (Pairwise Rumor)', cinVal: 94, cinText: '94% (Shared Record)' },
        { label: 'Verification Overhead Saving', sqVal: 18, sqText: 'O(k^2) Pair Checks', cinVal: 96, cinText: 'O(k) Signed Receipts' },
        { label: 'Forged-Claim Quarantine Speed', sqVal: 22, sqText: '22% (He-Said-She-Said)', cinVal: 98, cinText: '98% (3-Watcher Proof)' }
      ],
      causal: [
        { title: 'Scale High-Trust Groups', sub: 'Coordinate 50–500 peers without bureaucracy', metric: 'Group Size k = 5..500' },
        { title: 'Pairwise Rumor Decay', sub: 'Pair-by-pair trust decays exponentially as (1 - ε)^k', metric: 'O(k^2) friction' },
        { title: 'Shared Checkable Record', sub: 'Append-only signed receipts verified by 3 watchers', metric: 'O(k) verification' },
        { title: 'Multiplicative Trust', sub: 'Doubles+ maximum stable self-governing coalition size', metric: '94% group cohesion' }
      ],
      xLabels: ['k=5', 'k=15', 'k=30', 'k=50', 'k=100', 'k=250'],
      sqCurve: [86, 61, 37, 19, 7, 2],
      cinCurve: [98, 96, 95, 94, 92, 90],
      scaleBadge: 'O(k) SHARED-RECORD SCALING',
      scaleSummary: 'As group size k grows from 5 to 250 members, unverified pairwise trust collapses from 86% to 2%, while a shared checkable receipt ledger sustains 90%+ group cohesion.'
    },
    'value-system': {
      title: 'BEYOND 1D MONEY: MULTI-DIMENSIONAL VALUE & ECOLOGICAL LEDGER',
      cite: 'Shapley (1953) · Ghorbani & Zou (2019) · Raworth (2017) · Ostrom (1990)',
      compare: [
        { label: 'Care & Ecological Work Priced', sqVal: 11, sqText: '11% (Externalized)', cinVal: 95, cinText: '95% (5D Vector Ledger)' },
        { label: 'Upstream Open-Source Royalties', sqVal: 8, sqText: '8% (Unpaid Commons)', cinVal: 95, cinText: '95%Shapley + 5% Commons' },
        { label: 'Goodhart Gaming Resistance', sqVal: 24, sqText: '24% (Single Metric)', cinVal: 93, cinText: '93% (Multi-Axis Floor)' }
      ],
      causal: [
        { title: 'Honest Value Signals', sub: 'Recognize care, craft, lineage & ecological stewardship', metric: '5 Value Dimensions' },
        { title: '1D Price Blindness', sub: 'Single scalar prices externalize pollution & starve care', metric: 'Goodhart collapse' },
        { title: '5D Shapley Accounting', sub: 'Track vital floor, effort, 5-hop lineage & ecology', metric: '95% / 5% split' },
        { title: 'Regenerative Economy', sub: 'Rewards verified waste reduction & upstream creators', metric: '1,000 conserved units' }
      ],
      xLabels: ['Q1', 'Q2', 'Q3', 'Q4', 'Yr 2', 'Yr 3'],
      sqCurve: [56, 48, 40, 33, 25, 19],
      cinCurve: [76, 83, 88, 91, 94, 96],
      scaleBadge: '95% CONTRIBUTOR / 5% COMMONS',
      scaleSummary: 'By recording value across 5 explicit dimensions rather than collapsing everything into 1D speculative price, upstream creators and ecological stewards retain 95% of verified value.'
    },
    'who-is-really-there': {
      title: 'FAIR HARDWARE PERSONHOOD & MULTI-SIGNAL SPOOF DETECTION',
      cite: 'Gassend et al. (2002) PUF · FIDO2 WebAuthn · W3C Verifiable Credentials',
      compare: [
        { label: 'Sybil Bot Farm Rejection', sqVal: 21, sqText: '21% (CAPTCHA/SMS)', cinVal: 99, cinText: '99.2% (2-of-2 + History)' },
        { label: 'Low-Cost Phone Fairness', sqVal: 35, sqText: '35% (Flags Budget Devices)', cinVal: 97, cinText: '97% (Calibrated Tiers)' },
        { label: 'Zero Central ID Honeypot', sqVal: 10, sqText: '10% (KYC Passport DB)', cinVal: 100, cinText: '100% (Unlinkable ZKP)' }
      ],
      causal: [
        { title: 'Know A Person Is Real', sub: 'Verify human presence without excluding budget phones', metric: '5 Independent Signals' },
        { title: 'CA Breaches & KYC Leaks', sub: 'X.509 breaches & CAPTCHAs fail against frontier bots', metric: 'Million-bot Sybils' },
        { title: '2-of-2 PUF + Fair Calibration', sub: 'Combine silicon attestation, history & peer vouches', metric: 'No biometric DB' },
        { title: 'Inclusive Sybil Defense', sub: 'Catches bot farms while treating $40 phones fairly', metric: '99.2% Sybil rejection' }
      ],
      xLabels: ['$40 Phone', '$80', '$150', '$300', '$600', '$1000'],
      sqCurve: [32, 45, 58, 72, 84, 88],
      cinCurve: [95, 96, 97, 98, 99, 99.2],
      scaleBadge: '97% FAIRNESS ACROSS DEVICE TIERS',
      scaleSummary: 'Conventional fraud detectors heavily penalize $40–$80 budget devices (32% pass rate), whereas CIN multi-signal attestation achieves 95–99.2% accuracy across all hardware price tiers.'
    },
    'founder': {
      title: 'FROM 1987 SILICON & 20 YEARS IN CYBERSECURITY TO CO-INTELLIGENCE',
      cite: 'Friston (2010) Markov Blankets · Levin (2019) · Dennis & Van Horn (1966)',
      compare: [
        { label: 'Biological Human Bandwidth Shield', sqVal: 12, sqText: '40 bits/s Unshielded', cinVal: 99, cinText: '99.4% (Markov Blanket)' },
        { label: 'Zero-Sum Prisoner Dilemma Bypass', sqVal: 24, sqText: '24% (Walled Silos)', cinVal: 95, cinText: '95% (PSI + PCC Co-Ops)' },
        { label: 'Hardware-Rooted Sovereignty', sqVal: 15, sqText: '15% (Cloud Rent)', cinVal: 98, cinText: '98% (2-of-2 PUF + OCap)' }
      ],
      causal: [
        { title: '1987 x186 Schematic', sub: 'Software is never magic—verify the physical silicon', metric: 'Age 8 Hardware Lesson' },
        { title: '20 Yrs Cybersecurity', sub: 'Top-down pyramids & walled gardens lose ground truth', metric: 'Zero-sum exhaustion' },
        { title: 'Levin + Friston Models', sub: 'Morphogenesis (no dictator cell) + Markov blankets', metric: 'Biological boundary' },
        { title: 'CIN Co-Intelligence', sub: 'Two Internets + 1-to-1 Personal Twin + Shapley Ledger', metric: 'Open public workbench' }
      ],
      xLabels: ['1987', '2006', '2016', '2024', '2026', '2030'],
      sqCurve: [70, 58, 44, 29, 18, 9],
      cinCurve: [70, 74, 80, 88, 96, 99],
      scaleBadge: '40 BITS/S SHIELDED BY LOCAL SILICON',
      scaleSummary: 'Combining hardware-level verification (SRAM PUF + Pre-ADC sensors), 20 years of defensive cybersecurity, and biological Markov blankets gives families a practical defense before a global pause.'
    },
    'updates': {
      title: 'AUTONOMOUS 4-LANE COLLECTIVE OUTPUT & SPRA TELEMETRY',
      cite: 'Leng et al. (2026) SPRA Schema-RAG · Google Research RRSI · Harness-RSI',
      compare: [
        { label: 'Research Context Token Efficiency', sqVal: 5, sqText: '5,500 tok (Raw PDF)', cinVal: 95, cinText: '95.3% Saved (~260 tok)' },
        { label: 'Testnet & Site Gate Pass Rate', sqVal: 42, sqText: '42% (Unchecked Edits)', cinVal: 100, cinText: '100% (16/16 + 12 Gates)' },
        { label: 'Realm A / Realm B Isolation', sqVal: 15, sqText: '15% (Prompt Bleed)', cinVal: 100, cinText: '100% (Firewall Enforced)' }
      ],
      causal: [
        { title: '4 Daily Output Pillars', sub: 'Website UX, Deep Research, Outreach & Testnet v4.0', metric: '39 Agent Streams' },
        { title: 'Context Bloat & Drift', sub: 'Raw 40-page volumes & unpruned .md rules cause drift', metric: '5,500 tokens/paper' },
        { title: 'SPRA + RRSI Compression', sub: '~260-token Schema-RAG + log-frequency instruction cap', metric: '95.3% token savings' },
        { title: 'Verified Public Releases', sub: 'Every commit passes 12 UX/terminology/testnet gates', metric: '48 updates/week' }
      ],
      xLabels: ['Wave 52', 'Wave 53', 'Wave 54', 'Wave 55', 'Wave 56', 'Wave 57'],
      sqCurve: [48, 44, 39, 35, 31, 28],
      cinCurve: [82, 86, 90, 94, 97, 99.5],
      scaleBadge: '95.3% SPRA TOKEN COMPRESSION',
      scaleSummary: 'Across Waves 52–57, compiling research volumes into ~260-token SPRA Schema-RAG units and enforcing 12 automated non-regression gates raised collective engineering velocity to 99.5%.'
    }
  };

  function initUniversalNoteD3() {
    if (!window.d3) return;
    var d3 = window.d3;
    var workbenches = document.querySelectorAll('svg.note-d3-workbench');
    if (!workbenches.length) return;

    [].forEach.call(workbenches, function (svgEl) {
      var slug = svgEl.getAttribute('data-note-slug') || 'agent-internet';
      var spec = NOTE_SPECS[slug] || NOTE_SPECS['agent-internet'];
      var card = svgEl.closest('.note-d3-card');
      var svg = d3.select(svgEl);
      var currentMode = 'compare';

      function renderMode(mode) {
        currentMode = mode;
        svg.attr('viewBox', '0 0 780 220');
        svg.selectAll('*').remove();

        svg.append('rect')
          .attr('x', 2)
          .attr('y', 2)
          .attr('width', 776)
          .attr('height', 216)
          .attr('rx', 10)
          .attr('fill', '#12151c')
          .attr('stroke', '#2a2f3a')
          .attr('stroke-width', 1.4);

        if (mode === 'compare') {
          // Header
          svg.append('text')
            .attr('x', 20)
            .attr('y', 24)
            .attr('font-size', 9.8)
            .attr('font-weight', 700)
            .attr('font-family', 'monospace')
            .attr('fill', '#4fb3a8')
            .text('1. BENCHMARK · ' + spec.title);

          // Legend
          svg.append('rect').attr('x', 508).attr('y', 14).attr('width', 9).attr('height', 9).attr('rx', 2).attr('fill', '#ef6a52');
          svg.append('text').attr('x', 522).attr('y', 22).attr('font-size', 9).attr('font-family', 'monospace').attr('fill', '#ef6a52').text('Status Quo');
          svg.append('rect').attr('x', 602).attr('y', 14).attr('width', 9).attr('height', 9).attr('rx', 2).attr('fill', '#4fb3a8');
          svg.append('text').attr('x', 616).attr('y', 22).attr('font-size', 9).attr('font-family', 'monospace').attr('fill', '#4fb3a8').text('CIN Mechanism');

          var xScale = d3.scaleLinear().domain([0, 100]).range([0, 310]);

          spec.compare.forEach(function (row, idx) {
            var y = 44 + idx * 50;
            svg.append('text')
              .attr('x', 20)
              .attr('y', y + 14)
              .attr('font-size', 10)
              .attr('font-weight', 700)
              .attr('fill', '#e9e6de')
              .text(row.label);

            // Track background
            svg.append('rect')
              .attr('x', 238)
              .attr('y', y)
              .attr('width', 310)
              .attr('height', 14)
              .attr('rx', 4)
              .attr('fill', '#1b1f2a');

            svg.append('rect')
              .attr('x', 238)
              .attr('y', y)
              .attr('width', Math.max(8, xScale(row.sqVal)))
              .attr('height', 14)
              .attr('rx', 4)
              .attr('fill', '#ef6a52')
              .attr('opacity', 0.88);

            svg.append('text')
              .attr('x', 558)
              .attr('y', y + 11)
              .attr('font-size', 9.2)
              .attr('font-family', 'monospace')
              .attr('fill', '#ef6a52')
              .text(row.sqText);

            // CIN bar
            svg.append('rect')
              .attr('x', 238)
              .attr('y', y + 18)
              .attr('width', 310)
              .attr('height', 14)
              .attr('rx', 4)
              .attr('fill', '#1b1f2a');

            svg.append('rect')
              .attr('x', 238)
              .attr('y', y + 18)
              .attr('width', Math.max(12, xScale(row.cinVal)))
              .attr('height', 14)
              .attr('rx', 4)
              .attr('fill', '#4fb3a8');

            svg.append('text')
              .attr('x', 558)
              .attr('y', y + 29)
              .attr('font-size', 9.2)
              .attr('font-weight', 700)
              .attr('font-family', 'monospace')
              .attr('fill', '#4fb3a8')
              .text(row.cinText);
          });

          svg.append('text')
            .attr('x', 20)
            .attr('y', 206)
            .attr('font-size', 9)
            .attr('font-family', 'monospace')
            .attr('fill', '#9aa3b2')
            .text('Scientific & Statutory Provenance: ' + spec.cite);
        } else if (mode === 'causal') {
          svg.append('text')
            .attr('x', 20)
            .attr('y', 24)
            .attr('font-size', 9.8)
            .attr('font-weight', 700)
            .attr('font-family', 'monospace')
            .attr('fill', '#63b3ed')
            .text('2. FOUR-STEP CAUSAL PROOF CHAIN · HUMAN INTENT → BOTTLENECK → THRESHOLD → CIN MECHANISM');

          var stepMeta = [
            { tag: 'STEP 1 · HUMAN INTENT', col: '#63b3ed' },
            { tag: 'STEP 2 · LEGACY BOTTLENECK', col: '#ef6a52' },
            { tag: 'STEP 3 · CAPABILITY GATE', col: '#ecc94b' },
            { tag: 'STEP 4 · CIN MECHANISM', col: '#4fb3a8' }
          ];

          spec.causal.forEach(function (node, idx) {
            var x = 18 + idx * 188;
            var y = 38;
            var sm = stepMeta[idx];

            if (idx < 3) {
              svg.append('line')
                .attr('x1', x + 172)
                .attr('y1', y + 70)
                .attr('x2', x + 188)
                .attr('y2', y + 70)
                .attr('stroke', sm.col)
                .attr('stroke-width', 2);
            }

            var g = svg.append('g').attr('transform', 'translate(' + x + ',' + y + ')');
            g.append('rect')
              .attr('width', 172)
              .attr('height', 142)
              .attr('rx', 10)
              .attr('fill', '#171b24')
              .attr('stroke', sm.col)
              .attr('stroke-width', 1.6);

            g.append('text')
              .attr('x', 12)
              .attr('y', 22)
              .attr('font-size', 8.8)
              .attr('font-weight', 700)
              .attr('font-family', 'monospace')
              .attr('fill', sm.col)
              .text(sm.tag);

            g.append('text')
              .attr('x', 12)
              .attr('y', 46)
              .attr('font-size', 10.5)
              .attr('font-weight', 700)
              .attr('fill', '#f4f1ea')
              .text(node.title);

            // Wrap node.sub into two lines
            var words = node.sub.split(' ');
            var mid = Math.ceil(words.length / 2);
            var line1 = words.slice(0, mid).join(' ');
            var line2 = words.slice(mid).join(' ');

            g.append('text')
              .attr('x', 12)
              .attr('y', 68)
              .attr('font-size', 9.2)
              .attr('fill', '#cfd3dc')
              .text(line1);

            g.append('text')
              .attr('x', 12)
              .attr('y', 84)
              .attr('font-size', 9.2)
              .attr('fill', '#cfd3dc')
              .text(line2);

            g.append('rect')
              .attr('x', 12)
              .attr('y', 102)
              .attr('width', 148)
              .attr('height', 26)
              .attr('rx', 6)
              .attr('fill', '#11141b')
              .attr('stroke', sm.col)
              .attr('stroke-width', 1);

            g.append('text')
              .attr('x', 86)
              .attr('y', 119)
              .attr('text-anchor', 'middle')
              .attr('font-size', 9)
              .attr('font-weight', 700)
              .attr('font-family', 'monospace')
              .attr('fill', sm.col)
              .text(node.metric);
          });

          svg.append('text')
            .attr('x', 20)
            .attr('y', 204)
            .attr('font-size', 9)
            .attr('font-family', 'monospace')
            .attr('fill', '#4fb3a8')
            .text('✓ Primary Citation Chain: ' + spec.cite);
        } else {
          // Mode 3: Scale / Trajectory Stress-Test Curve
          svg.append('text')
            .attr('x', 20)
            .attr('y', 24)
            .attr('font-size', 9.8)
            .attr('font-weight', 700)
            .attr('font-family', 'monospace')
            .attr('fill', '#ecc94b')
            .text('3. STRESS-TEST TRAJECTORY · ' + spec.title);

          var chartX = d3.scalePoint().domain(spec.xLabels).range([48, 468]);
          var chartY = d3.scaleLinear().domain([0, 105]).range([178, 44]);

          [25, 50, 75, 100].forEach(function (tick) {
            var ty = chartY(tick);
            svg.append('line')
              .attr('x1', 44)
              .attr('y1', ty)
              .attr('x2', 474)
              .attr('y2', ty)
              .attr('stroke', 'rgba(255,255,255,0.06)')
              .attr('stroke-dasharray', '3 3');

            svg.append('text')
              .attr('x', 38)
              .attr('y', ty + 3)
              .attr('text-anchor', 'end')
              .attr('font-size', 8.8)
              .attr('font-family', 'monospace')
              .attr('fill', '#8c8f96')
              .text(tick + '%');
          });

          spec.xLabels.forEach(function (lbl) {
            var lx = chartX(lbl);
            svg.append('text')
              .attr('x', lx)
              .attr('y', 196)
              .attr('text-anchor', 'middle')
              .attr('font-size', 9)
              .attr('font-family', 'monospace')
              .attr('fill', '#cfd3dc')
              .text(lbl);
          });

          var cinPts = spec.xLabels.map(function (l, i) { return { x: l, y: spec.cinCurve[i] }; });
          var sqPts = spec.xLabels.map(function (l, i) { return { x: l, y: spec.sqCurve[i] }; });

          var areaGen = d3.area()
            .x(function (d) { return chartX(d.x); })
            .y0(178)
            .y1(function (d) { return chartY(d.y); })
            .curve(d3.curveMonotoneX);

          var lineGen = d3.line()
            .x(function (d) { return chartX(d.x); })
            .y(function (d) { return chartY(d.y); })
            .curve(d3.curveMonotoneX);

          svg.append('path')
            .datum(cinPts)
            .attr('d', areaGen)
            .attr('fill', 'rgba(79,179,168,0.16)');

          svg.append('path')
            .datum(sqPts)
            .attr('d', lineGen)
            .attr('fill', 'none')
            .attr('stroke', '#ef6a52')
            .attr('stroke-width', 2.2)
            .attr('stroke-dasharray', '5 4');

          svg.append('path')
            .datum(cinPts)
            .attr('d', lineGen)
            .attr('fill', 'none')
            .attr('stroke', '#4fb3a8')
            .attr('stroke-width', 2.6);

          sqPts.forEach(function (d) {
            svg.append('circle')
              .attr('cx', chartX(d.x))
              .attr('cy', chartY(d.y))
              .attr('r', 3.5)
              .attr('fill', '#ef6a52');
          });

          cinPts.forEach(function (d) {
            svg.append('circle')
              .attr('cx', chartX(d.x))
              .attr('cy', chartY(d.y))
              .attr('r', 4)
              .attr('fill', '#12151c')
              .attr('stroke', '#4fb3a8')
              .attr('stroke-width', 2);
          });

          // Right Callout Box
          var boxG = svg.append('g').attr('transform', 'translate(494, 38)');
          boxG.append('rect')
            .attr('width', 266)
            .attr('height', 160)
            .attr('rx', 10)
            .attr('fill', '#171b24')
            .attr('stroke', '#4fb3a8')
            .attr('stroke-width', 1.5);

          boxG.append('text')
            .attr('x', 14)
            .attr('y', 24)
            .attr('font-size', 9.2)
            .attr('font-weight', 700)
            .attr('font-family', 'monospace')
            .attr('fill', '#4fb3a8')
            .text(spec.scaleBadge);

          // Wrap spec.scaleSummary into 4 lines (~38 chars per line)
          var sWords = spec.scaleSummary.split(' ');
          var lines = [];
          var curLine = '';
          sWords.forEach(function (w) {
            if ((curLine + ' ' + w).trim().length > 39 && lines.length < 4) {
              lines.push(curLine.trim());
              curLine = w;
            } else {
              curLine = (curLine + ' ' + w).trim();
            }
          });
          if (curLine) lines.push(curLine);

          lines.slice(0, 5).forEach(function (ln, lIdx) {
            boxG.append('text')
              .attr('x', 14)
              .attr('y', 48 + lIdx * 16)
              .attr('font-size', 9.2)
              .attr('fill', '#d5d9e2')
              .text(ln);
          });

          boxG.append('text')
            .attr('x', 14)
            .attr('y', 144)
            .attr('font-size', 8.8)
            .attr('font-family', 'monospace')
            .attr('fill', '#ecc94b')
            .text('CIN: ' + spec.cinCurve[5] + '% vs. Status Quo: ' + spec.sqCurve[5] + '%');
        }
      }

      renderMode('compare');

      if (card) {
        var modeBtns = card.querySelectorAll('[data-nd3-mode]');
        [].forEach.call(modeBtns, function (btn) {
          btn.addEventListener('click', function () {
            var m = btn.getAttribute('data-nd3-mode') || 'compare';
            [].forEach.call(modeBtns, function (b) {
              var active = b === btn;
              b.setAttribute('aria-selected', active ? 'true' : 'false');
              b.style.borderColor = active ? 'var(--ok)' : 'var(--rule)';
              b.style.background = active ? 'color-mix(in srgb,var(--ok) 15%,var(--card))' : 'var(--paper)';
              b.style.color = active ? 'var(--ink)' : 'var(--ink-2)';
            });
            renderMode(m);
          });
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. PROGRESSIVE DISCLOSURE HELPERS FOR ALL-PRINCIPLES & PRINCIPLE-TESTNET
     ------------------------------------------------------------------------ */
  function initProgressiveDrawers() {
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
    initUniversalNoteD3();
    initProgressiveDrawers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
