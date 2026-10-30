// Interactive D3.js v7 Visual Studios for cintnet.org subpages:
// 1. /twin        -> #twin-d3-moat (1-to-1 Pair Intelligence Moat & Live OCap Firewall Visualizer)
// 2. /futures     -> #futures-d3-cone (Futures Cone & 7-Lens Risk/Co-Intelligence Radar)
// 3. /ideas       -> #ideas-d3-constellation (5-Pillar Collective Idea Constellation)
// 4. /recognition -> #recog-d3-chart (5D Value Attribution & Brier Calibration Curve)
// Strict DOM construction using D3.js v7 and textContent only.

(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function clearChildren(node) {
    if (!node) return;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function getD3() {
    if (typeof window !== 'undefined' && window.d3 && typeof window.d3.select === 'function') {
      return window.d3;
    }
    return null;
  }

  // Minimal D3-compatible SVG builder fallback if vendor script is still deferring
  function makeFallbackSelection(rootEl) {
    function wrap(el) {
      return {
        node: function () { return el; },
        append: function (tag) {
          var child = document.createElementNS(SVG_NS, tag);
          el.appendChild(child);
          return wrap(child);
        },
        attr: function (k, v) {
          if (v === undefined) return el.getAttribute(k);
          el.setAttribute(k, String(v));
          return this;
        },
        text: function (t) {
          el.textContent = String(t);
          return this;
        },
        on: function (evt, fn) {
          el.addEventListener(evt, function (e) { fn(e); });
          return this;
        }
      };
    }
    return wrap(rootEl);
  }

  function selectSvg(svgEl) {
    var d3 = getD3();
    clearChildren(svgEl);
    return d3 ? d3.select(svgEl) : makeFallbackSelection(svgEl);
  }

  // ============================================================================
  // 1. TWIN STUDIO: 1-to-1 Pair Intelligence Moat & Live OCap Firewall (#twin-d3-moat)
  // ============================================================================
  var MOAT_PRESETS = {
    1:  { base: 34, lora: 22, memory: 20, craft: 24, uncopyable: 66, cloudRetained: 18 },
    2:  { base: 24, lora: 25, memory: 24, craft: 27, uncopyable: 76, cloudRetained: 14 },
    3:  { base: 18, lora: 26, memory: 27, craft: 29, uncopyable: 82, cloudRetained: 11 },
    4:  { base: 14, lora: 27, memory: 28, craft: 31, uncopyable: 86, cloudRetained: 9 },
    5:  { base: 11, lora: 28, memory: 29, craft: 32, uncopyable: 89, cloudRetained: 8 },
    6:  { base: 9,  lora: 29, memory: 30, craft: 32, uncopyable: 91, cloudRetained: 7 },
    7:  { base: 7,  lora: 29, memory: 31, craft: 33, uncopyable: 93, cloudRetained: 6 },
    8:  { base: 6,  lora: 30, memory: 31, craft: 33, uncopyable: 94, cloudRetained: 5 },
    9:  { base: 5,  lora: 30, memory: 31, craft: 34, uncopyable: 95, cloudRetained: 4 },
    10: { base: 4,  lora: 30, memory: 32, craft: 34, uncopyable: 96, cloudRetained: 4 }
  };

  function getMoatMetrics(years) {
    var y = Math.max(1, Math.min(10, Math.round(Number(years) || 10)));
    return { years: y, data: MOAT_PRESETS[y] || MOAT_PRESETS[10] };
  }

  function initTwinMoatD3() {
    var svgEl = document.getElementById('twin-d3-moat');
    if (!svgEl) return;

    var slider = document.getElementById('twin-moat-years-slider');
    var yearsOut = document.getElementById('twin-moat-years-out');
    var cloudOut = document.getElementById('twin-moat-cloud-out');
    var localOut = document.getElementById('twin-moat-local-out');
    var presetBtns = document.querySelectorAll('[data-moat-years]');

    function render(yearsVal) {
      var m = getMoatMetrics(yearsVal);
      var y = m.years;
      var d = m.data;

      if (slider && String(slider.value) !== String(y)) {
        slider.value = String(y);
      }
      if (yearsOut) {
        yearsOut.textContent = y + (y === 1 ? ' Year' : ' Years') + ' Co-Adapted (' + d.uncopyable + '% Uncopyable Moat)';
      }
      if (cloudOut) {
        cloudOut.textContent = '60-90 Day Cloud AI Distillation Cliff: frontier model edge decays to ' + d.cloudRetained + '% commodity parity; zero local memory moat';
      }
      if (localOut) {
        localOut.textContent = 'Commodity Open Base ' + d.base + '% + Local Rank-16 LoRA ' + d.lora + '% + 10-Yr Private Memory ' + d.memory + '% + Tacit Human Craft ' + d.craft + '% = ' + d.uncopyable + '% Uncopyable Moat';
      }
      for (var i = 0; i < presetBtns.length; i++) {
        var btnY = Number(presetBtns[i].getAttribute('data-moat-years'));
        presetBtns[i].classList.toggle('active', btnY === y);
      }

      var root = selectSvg(svgEl);

      // Background canvas
      root.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 250)
        .attr('rx', 10).attr('fill', '#0d0f13');

      // Left Panel: 1-to-10 Year Compounding Trajectory vs 60-90 Day Cloud Distillation Cliff
      root.append('rect')
        .attr('x', 14).attr('y', 14).attr('width', 436).attr('height', 222)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#262c3a');

      root.append('text')
        .attr('x', 28).attr('y', 34)
        .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '9.5').attr('font-weight', '700')
        .text('1-TO-1 PAIR INTELLIGENCE MOAT VS. 60-90 DAY CLOUD DISTILLATION CLIFF');

      var chartX0 = 52, chartX1 = 430, chartY0 = 198, chartY1 = 52;
      var chartW = chartX1 - chartX0;
      var chartH = chartY0 - chartY1;

      function xForYear(yr) {
        return Math.round(chartX0 + ((yr - 1) / 9) * chartW);
      }
      function yForPct(pct) {
        return Math.round(chartY0 - (pct / 100) * chartH);
      }

      // Horizontal grid lines
      var gridPcts = [0, 25, 50, 75, 100];
      for (var g = 0; g < gridPcts.length; g++) {
        var gp = gridPcts[g];
        var gy = yForPct(gp);
        root.append('line')
          .attr('x1', chartX0).attr('y1', gy).attr('x2', chartX1).attr('y2', gy)
          .attr('stroke', '#1f2533').attr('stroke-width', 1);
        root.append('text')
          .attr('x', chartX0 - 6).attr('y', gy + 3)
          .attr('text-anchor', 'end').attr('fill', '#8c8a82').attr('font-family', 'monospace').attr('font-size', '8')
          .text(gp + '%');
      }

      // Build polyline points for Uncopyable Pair Moat and Cloud Distillation Cliff
      var moatPts = [];
      var cliffPts = [];
      for (var yr = 1; yr <= 10; yr++) {
        var row = MOAT_PRESETS[yr];
        moatPts.push(xForYear(yr) + ',' + yForPct(row.uncopyable));
        cliffPts.push(xForYear(yr) + ',' + yForPct(row.cloudRetained));
        root.append('text')
          .attr('x', xForYear(yr)).attr('y', chartY0 + 14)
          .attr('text-anchor', 'middle')
          .attr('fill', yr === y ? '#4fb3a8' : '#8c8a82')
          .attr('font-family', 'monospace').attr('font-size', '8')
          .attr('font-weight', yr === y ? '700' : '400')
          .text('Y' + yr);
      }

      // Area under Pair Moat curve
      var areaPts = chartX0 + ',' + chartY0 + ' ' + moatPts.join(' ') + ' ' + chartX1 + ',' + chartY0;
      root.append('polygon')
        .attr('points', areaPts)
        .attr('fill', '#4fb3a8').attr('fill-opacity', '0.14');

      // Cloud AI 60-90 Day Distillation Cliff curve
      root.append('polyline')
        .attr('points', cliffPts.join(' '))
        .attr('fill', 'none').attr('stroke', '#ef6a52').attr('stroke-width', 2.2)
        .attr('stroke-dasharray', '5 3');

      root.append('text')
        .attr('x', chartX0 + 68).attr('y', yForPct(18) - 6)
        .attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
        .text('60-90 Day Cloud AI Distillation Cliff (Commoditized)');

      // Uncopyable Pair Moat curve
      root.append('polyline')
        .attr('points', moatPts.join(' '))
        .attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 2.8);

      // Selected Year vertical marker & interactive dots
      var selX = xForYear(y);
      var selY = yForPct(d.uncopyable);
      root.append('line')
        .attr('x1', selX).attr('y1', chartY1).attr('x2', selX).attr('y2', chartY0)
        .attr('stroke', '#e3b341').attr('stroke-width', 1.5).attr('stroke-dasharray', '3 2');

      for (var yrDot = 1; yrDot <= 10; yrDot++) {
        (function (targetYr) {
          var rData = MOAT_PRESETS[targetYr];
          var cx = xForYear(targetYr);
          var cy = yForPct(rData.uncopyable);
          root.append('circle')
            .attr('cx', cx).attr('cy', cy)
            .attr('r', targetYr === y ? 5.5 : 3.5)
            .attr('fill', targetYr === y ? '#e3b341' : '#4fb3a8')
            .attr('stroke', '#0d0f13').attr('stroke-width', 1.5)
            .attr('class', 'svg-node')
            .on('click', function () { render(targetYr); });
        })(yrDot);
      }

      root.append('text')
        .attr('x', Math.min(335, Math.max(68, selX - 42))).attr('y', selY + 26)
        .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
        .text('Yr ' + y + ': ' + d.uncopyable + '% Uncopyable');

      // Right Panel: 4 Stacked Pair Moat Layers + Local OCap Firewall
      root.append('rect')
        .attr('x', 462).attr('y', 14).attr('width', 284).attr('height', 222)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#4fb3a8').attr('stroke-width', 1.4);

      root.append('text')
        .attr('x', 476).attr('y', 34)
        .attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '9.5').attr('font-weight', '700')
        .text('YEAR ' + y + ' STACKED PAIR MOAT & OCAP FIREWALL');

      var layers = [
        { label: 'Tacit Human Craft', pct: d.craft, color: '#9d7fe8', desc: 'Embodied judgment & domain taste' },
        { label: '10-Yr Private Memory', pct: d.memory, color: '#e3b341', desc: 'Pinned constraints & episodic vault' },
        { label: 'Local Rank-16 LoRA', pct: d.lora, color: '#4fb3a8', desc: 'On-device preference weight deltas' },
        { label: 'Commodity Open Base', pct: d.base, color: '#6aa8e0', desc: 'Distilled 60-90d open backbone' }
      ];

      for (var l = 0; l < layers.length; l++) {
        var lay = layers[l];
        var ly = 48 + l * 36;
        var barW = Math.max(8, Math.round((lay.pct / 45) * 155));

        root.append('text')
          .attr('x', 476).attr('y', ly + 11)
          .attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '9.5').attr('font-weight', '700')
          .text(lay.label + ' (' + lay.pct + '%)');

        root.append('text')
          .attr('x', 476).attr('y', ly + 23)
          .attr('fill', '#8c8a82').attr('font-family', 'monospace').attr('font-size', '7.8')
          .text(lay.desc);

        root.append('rect')
          .attr('x', 610).attr('y', ly + 5).attr('width', 122).attr('height', 14)
          .attr('rx', 4).attr('fill', '#1a202c');

        root.append('rect')
          .attr('x', 610).attr('y', ly + 5).attr('width', Math.min(122, barW)).attr('height', 14)
          .attr('rx', 4).attr('fill', lay.color);
      }

      // OCap Firewall Badge at bottom of right panel
      root.append('rect')
        .attr('x', 474).attr('y', 196).attr('width', 260).attr('height', 30)
        .attr('rx', 6).attr('fill', '#142623').attr('stroke', '#4fb3a8');

      root.append('text')
        .attr('x', 604).attr('y', 214)
        .attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
        .text('OCAP SANDBOX: ' + d.uncopyable + '% UNCOPYABLE · 0 BYTES EGRESS');
    }

    if (slider) {
      slider.addEventListener('input', function () {
        render(slider.value);
      });
    }
    for (var i = 0; i < presetBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          render(btn.getAttribute('data-moat-years'));
        });
      })(presetBtns[i]);
    }

    render(slider ? slider.value : 10);
  }

  // ============================================================================
  // 2. FUTURES & SCENARIOS: Futures Cone & 7-Lens Radar (#futures-d3-cone)
  // ============================================================================
  var HORIZON_NODES = [
    {
      key: '2026',
      years: 1,
      x: 78,
      cinPct: 34,
      basePct: 46,
      riskPct: 20,
      headline: '2026 (1 Yr): Tool-Use Sandboxes & Prompt-Injection Airlocks',
      summary: 'On-device Retrieval Airlocks and OCap domain envelopes block indirect prompt injection and silent credential egress.',
      radarCin:  [78, 72, 70, 82, 76, 86, 74],
      radarBase: [42, 34, 30, 28, 44, 32, 30]
    },
    {
      key: '2027',
      years: 2,
      x: 168,
      cinPct: 48,
      basePct: 36,
      riskPct: 16,
      headline: '2027 (2 Yrs): Zero-Leakage Proofs & Co-Op Healthcare Audits',
      summary: 'Households and clinics run local CMS NCCI CPT billing audits and single-fact income proofs without exposing raw bank feeds.',
      radarCin:  [84, 80, 82, 88, 82, 90, 84],
      radarBase: [38, 30, 26, 25, 40, 28, 28]
    },
    {
      key: '2028',
      years: 3,
      x: 258,
      cinPct: 60,
      basePct: 27,
      riskPct: 13,
      headline: '2028 (3 Yrs): Private Set Intersection Buyer Co-Ops & LoRA Ledgers',
      summary: 'Regional credit unions and buyer groups coordinate wholesale orders via blinded PSI while specialists earn Data Shapley royalties.',
      radarCin:  [88, 86, 89, 91, 87, 93, 90],
      radarBase: [34, 28, 22, 22, 36, 24, 25]
    },
    {
      key: '2030',
      years: 4,
      x: 348,
      cinPct: 68,
      basePct: 21,
      riskPct: 11,
      headline: '2030 (4 Yrs): Hardware-Isolated Personal Twins & P2P Agent Transport',
      summary: 'Software synthesizes locally inside hardware-enforced OCap sandboxes, coordinating peer-to-peer with zero cloud surveillance.',
      radarCin:  [92, 90, 93, 95, 91, 96, 93],
      radarBase: [30, 24, 19, 18, 32, 20, 22]
    },
    {
      key: '2032+',
      years: 5,
      x: 434,
      cinPct: 76,
      basePct: 16,
      riskPct: 8,
      headline: '2032+ (5+ Yrs): 96% Uncopyable Human-Twin Craft & Civic Equilibrium',
      summary: 'Decade-long personal memory vaults and local LoRA adapters compound human craft, keeping machine speed bound to human flourishing.',
      radarCin:  [96, 94, 96, 98, 95, 98, 96],
      radarBase: [26, 20, 15, 14, 28, 16, 18]
    }
  ];

  var RADAR_AXES = ['Safety', 'Governance', 'Fair Value', 'Twin Moat', 'Foresight', 'Privacy', 'Co-Ops'];

  function initFuturesConeD3() {
    var svgEl = document.getElementById('futures-d3-cone');
    if (!svgEl) return;

    var statusEl = document.getElementById('futures-cone-status');
    var horizonBtns = document.querySelectorAll('[data-horizon-node]');

    function render(selectedKey) {
      var active = HORIZON_NODES[2]; // default 2028
      for (var i = 0; i < HORIZON_NODES.length; i++) {
        if (HORIZON_NODES[i].key === selectedKey) {
          active = HORIZON_NODES[i];
          break;
        }
      }

      if (statusEl) {
        statusEl.textContent = active.headline + ' — ' + active.summary + ' (Desirable Co-Intelligence odds: ' + active.cinPct + '% with CIN vs. ' + (100 - active.cinPct) + '% unmitigated drift/lock-in)';
      }

      for (var b = 0; b < horizonBtns.length; b++) {
        var bKey = horizonBtns[b].getAttribute('data-horizon-node');
        horizonBtns[b].classList.toggle('active', bKey === active.key);
      }

      var root = selectSvg(svgEl);

      root.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 240)
        .attr('rx', 10).attr('fill', '#0d0f13');

      // Left Panel: Interactive Futures Cone (2026 -> 2032+)
      root.append('rect')
        .attr('x', 14).attr('y', 14).attr('width', 454).attr('height', 212)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#262c3a');

      root.append('text')
        .attr('x', 28).attr('y', 34)
        .attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '9.5').attr('font-weight', '700')
        .text('INTERACTIVE FUTURES CONE (2026-2032+) · CLICK ANY HORIZON NODE');

      // Cone polygons expanding from 2026 (x=78, y=126) to 2032+ (x=434)
      // Upper desirable band (green #4fb3a8)
      root.append('polygon')
        .attr('points', '78,118 168,96 258,76 348,60 434,48 434,114 348,116 258,120 168,124 78,128')
        .attr('fill', '#4fb3a8').attr('fill-opacity', '0.18');

      // Middle baseline band (gold #e3b341)
      root.append('polygon')
        .attr('points', '78,128 168,124 258,120 348,116 434,114 434,154 348,150 258,146 168,142 78,136')
        .attr('fill', '#e3b341').attr('fill-opacity', '0.14');

      // Lower extractive risk band (red #ef6a52)
      root.append('polygon')
        .attr('points', '78,136 168,142 258,146 348,150 434,154 434,196 348,184 258,172 168,158 78,144')
        .attr('fill', '#ef6a52').attr('fill-opacity', '0.16');

      // Trajectory lines
      root.append('polyline')
        .attr('points', '78,122 168,104 258,88 348,74 434,62')
        .attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 2.6);

      root.append('polyline')
        .attr('points', '78,132 168,132 258,132 348,132 434,132')
        .attr('fill', 'none').attr('stroke', '#e3b341').attr('stroke-width', 1.8).attr('stroke-dasharray', '4 3');

      root.append('polyline')
        .attr('points', '78,140 168,152 258,162 348,172 434,182')
        .attr('fill', 'none').attr('stroke', '#ef6a52').attr('stroke-width', 2.2);

      // Trajectory labels
      root.append('text')
        .attr('x', 84).attr('y', 58)
        .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
        .text('▲ Co-Intelligent Local Sandbox Trajectory (With CIN)');

      root.append('text')
        .attr('x', 84).attr('y', 194)
        .attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
        .text('▼ Unmitigated Cloud Lock-In & Extraction Risk');

      // Horizon vertical slices & clickable nodes
      var cinYs = [122, 104, 88, 74, 62];
      var riskYs = [140, 152, 162, 172, 182];

      for (var idx = 0; idx < HORIZON_NODES.length; idx++) {
        (function (node, nIdx) {
          var isSel = node.key === active.key;
          var nx = node.x;
          var cy = cinYs[nIdx];
          var ry = riskYs[nIdx];

          root.append('line')
            .attr('x1', nx).attr('y1', 46).attr('x2', nx).attr('y2', 198)
            .attr('stroke', isSel ? '#e3b341' : '#252c3b')
            .attr('stroke-width', isSel ? 1.8 : 1)
            .attr('stroke-dasharray', isSel ? 'none' : '2 3');

          // Clickable group for horizon node
          var gNode = root.append('g')
            .attr('class', 'svg-node')
            .on('click', function () {
              render(node.key);
            });

          gNode.append('circle')
            .attr('cx', nx).attr('cy', cy)
            .attr('r', isSel ? 6.5 : 4.5)
            .attr('fill', isSel ? '#e3b341' : '#4fb3a8')
            .attr('stroke', '#0d0f13').attr('stroke-width', 1.5);

          gNode.append('circle')
            .attr('cx', nx).attr('cy', ry)
            .attr('r', isSel ? 5 : 3.5)
            .attr('fill', '#ef6a52')
            .attr('stroke', '#0d0f13').attr('stroke-width', 1.2);

          gNode.append('rect')
            .attr('x', nx - 24).attr('y', 201).attr('width', 48).attr('height', 18)
            .attr('rx', 5)
            .attr('fill', isSel ? '#4fb3a8' : '#181d28')
            .attr('stroke', isSel ? '#4fb3a8' : '#32394a');

          gNode.append('text')
            .attr('x', nx).attr('y', 213)
            .attr('text-anchor', 'middle')
            .attr('fill', isSel ? '#0d0f13' : '#f0ede6')
            .attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
            .text(node.key);
        })(HORIZON_NODES[idx], idx);
      }

      // Right Panel: 7-Lens Risk / Co-Intelligence Radar
      root.append('rect')
        .attr('x', 480).attr('y', 14).attr('width', 266).attr('height', 212)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#4fb3a8').attr('stroke-width', 1.3);

      root.append('text')
        .attr('x', 613).attr('y', 32)
        .attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
        .text('7-LENS RADAR (' + active.key + '): TODAY VS. CIN');

      var cxR = 613, cyR = 122, maxR = 64;
      var rings = [0.35, 0.7, 1.0];
      for (var rIdx = 0; rIdx < rings.length; rIdx++) {
        var rPts = [];
        for (var a = 0; a < RADAR_AXES.length; a++) {
          var ang = (Math.PI * 2 * a) / RADAR_AXES.length - Math.PI / 2;
          var rx = Math.round(cxR + Math.cos(ang) * maxR * rings[rIdx]);
          var ry = Math.round(cyR + Math.sin(ang) * maxR * rings[rIdx]);
          rPts.push(rx + ',' + ry);
        }
        root.append('polygon')
          .attr('points', rPts.join(' '))
          .attr('fill', 'none').attr('stroke', '#232a38').attr('stroke-width', 1);
      }

      var basePoly = [];
      var cinPoly = [];
      for (var ax = 0; ax < RADAR_AXES.length; ax++) {
        var angle = (Math.PI * 2 * ax) / RADAR_AXES.length - Math.PI / 2;
        var axisX = Math.round(cxR + Math.cos(angle) * maxR);
        var axisY = Math.round(cyR + Math.sin(angle) * maxR);
        root.append('line')
          .attr('x1', cxR).attr('y1', cyR).attr('x2', axisX).attr('y2', axisY)
          .attr('stroke', '#232a38').attr('stroke-width', 1);

        var lblX = Math.round(cxR + Math.cos(angle) * (maxR + 17));
        var lblY = Math.round(cyR + Math.sin(angle) * (maxR + 13));
        root.append('text')
          .attr('x', lblX).attr('y', lblY + 3)
          .attr('text-anchor', 'middle').attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '8')
          .text(RADAR_AXES[ax]);

        var bVal = (active.radarBase[ax] || 30) / 100;
        var cVal = (active.radarCin[ax] || 85) / 100;
        basePoly.push(Math.round(cxR + Math.cos(angle) * maxR * bVal) + ',' + Math.round(cyR + Math.sin(angle) * maxR * bVal));
        cinPoly.push(Math.round(cxR + Math.cos(angle) * maxR * cVal) + ',' + Math.round(cyR + Math.sin(angle) * maxR * cVal));
      }

      root.append('polygon')
        .attr('points', basePoly.join(' '))
        .attr('fill', '#ef6a52').attr('fill-opacity', '0.22')
        .attr('stroke', '#ef6a52').attr('stroke-width', 1.6);

      root.append('polygon')
        .attr('points', cinPoly.join(' '))
        .attr('fill', '#4fb3a8').attr('fill-opacity', '0.28')
        .attr('stroke', '#4fb3a8').attr('stroke-width', 2);

      root.append('text')
        .attr('x', 613).attr('y', 214)
        .attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
        .text('WITH CIN: ' + active.cinPct + '% DESIRABLE · BASELINE: ' + active.basePct + '%');
    }

    for (var i = 0; i < horizonBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          render(btn.getAttribute('data-horizon-node'));
        });
      })(horizonBtns[i]);
    }

    render('2028');
  }

  // ============================================================================
  // 3. PUBLIC IDEAS WORKBENCH: 5-Pillar Idea Constellation (#ideas-d3-constellation)
  // ============================================================================
  var IDEA_PILLARS = [
    {
      id: '1',
      label: '1. Two Internets & OCap',
      short: 'OCap Sandbox & P2P',
      category: 'safety',
      color: '#4fb3a8',
      x: 112,
      y: 62,
      mechanism: 'Hardware-isolated local Object-Capability sandboxes, Retrieval Airlocks, and NAT-traversed P2P transport.',
      sampleIdea: 'Add local clipboard & screen-overlay prompt-injection guard to Your Twin'
    },
    {
      id: '2',
      label: '2. Data & LoRA Ledger',
      short: 'Shapley & LoRA Ledger',
      category: 'simulation',
      color: '#6aa8e0',
      x: 368,
      y: 58,
      mechanism: 'Proof-carrying code, Data Shapley royalty attribution, and Rank-16 LoRA adapter consensus.',
      sampleIdea: 'Simulate Data Shapley royalty payouts for community-verified medical audit rules'
    },
    {
      id: '3',
      label: '3. Zero-Middleman Co-Ops',
      short: 'PSI Co-Ops & Audits',
      category: 'value',
      color: '#e3b341',
      x: 88,
      y: 174,
      mechanism: 'Bypassing 15%-40% middleman extraction via CMS NCCI healthcare billing audits and Private Set Intersection buyer co-ops.',
      sampleIdea: 'Add local outpatient EOB CPT unbundling & facility-fee auditor to Your Twin'
    },
    {
      id: '4',
      label: '4. 1-to-1 Personal Twins',
      short: '1-to-1 Personal Twins',
      category: 'interface',
      color: '#9d7fe8',
      x: 242,
      y: 186,
      mechanism: 'Local personal agents trained on your own constraints, 6-axis value radar, and 10-year episodic memory vault.',
      sampleIdea: 'Add configurable 30-day warranty & subscription renewal trap alert in Your Twin'
    },
    {
      id: '5',
      label: '5. Public Foresight',
      short: '5-Step Foresight',
      category: 'forecast',
      color: '#ef6a52',
      x: 384,
      y: 172,
      mechanism: 'Empirical horizon scanning, causal ripple modeling, Brier-calibrated public forecasts, and plain-language tools.',
      sampleIdea: 'Track regional utility & insurance rate-hike filings in the public foresight feed'
    }
  ];

  function initIdeasConstellationD3() {
    var svgEl = document.getElementById('ideas-d3-constellation');
    if (!svgEl) return;

    var statusEl = document.getElementById('ideas-pillar-status');
    var pillarBtns = document.querySelectorAll('[data-idea-pillar]');

    function selectPillar(pillarId, shouldScroll) {
      var active = IDEA_PILLARS[0];
      for (var i = 0; i < IDEA_PILLARS.length; i++) {
        if (IDEA_PILLARS[i].id === String(pillarId)) {
          active = IDEA_PILLARS[i];
          break;
        }
      }

      if (statusEl) {
        statusEl.textContent = active.label + ' — ' + active.mechanism + ' (Maps to workbench category: ' + active.category + ')';
      }

      for (var b = 0; b < pillarBtns.length; b++) {
        pillarBtns[b].classList.toggle('active', pillarBtns[b].getAttribute('data-idea-pillar') === active.id);
      }

      // Sync with #idea-form category select if present
      var formEl = document.getElementById('idea-form');
      if (formEl && formEl.elements && formEl.elements.category) {
        formEl.elements.category.value = active.category;
      }
      if (formEl && formEl.elements && formEl.elements.title && !formEl.elements.title.value) {
        formEl.elements.title.placeholder = 'for example: ' + active.sampleIdea;
      }

      var root = selectSvg(svgEl);

      root.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 230)
        .attr('rx', 10).attr('fill', '#0d0f13');

      // Left Panel: 5-Pillar Constellation Graph
      root.append('rect')
        .attr('x', 14).attr('y', 12).attr('width', 446).attr('height', 206)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#262c3a');

      root.append('text')
        .attr('x', 26).attr('y', 30)
        .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '9.2').attr('font-weight', '700')
        .text('5-PILLAR COLLECTIVE IDEA CONSTELLATION · CLICK A PILLAR NODE');

      var hubX = 236, hubY = 114;

      // Edges between hub and 5 pillars + cross-links
      for (var e = 0; e < IDEA_PILLARS.length; e++) {
        var pNode = IDEA_PILLARS[e];
        var nextNode = IDEA_PILLARS[(e + 1) % IDEA_PILLARS.length];
        var isCurrent = pNode.id === active.id;

        root.append('line')
          .attr('x1', pNode.x).attr('y1', pNode.y)
          .attr('x2', nextNode.x).attr('y2', nextNode.y)
          .attr('stroke', '#1e2533').attr('stroke-width', 1).attr('stroke-dasharray', '3 3');

        root.append('line')
          .attr('x1', hubX).attr('y1', hubY)
          .attr('x2', pNode.x).attr('y2', pNode.y)
          .attr('stroke', isCurrent ? pNode.color : '#2c3446')
          .attr('stroke-width', isCurrent ? 2.6 : 1.4);
      }

      // Central Hub Node
      root.append('circle')
        .attr('cx', hubX).attr('cy', hubY).attr('r', 26)
        .attr('fill', '#161c28').attr('stroke', '#f0ede6').attr('stroke-width', 1.6);

      root.append('text')
        .attr('x', hubX).attr('y', hubY - 3)
        .attr('text-anchor', 'middle').attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
        .text('HOURLY');

      root.append('text')
        .attr('x', hubX).attr('y', hubY + 8)
        .attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '7.5')
        .text('TRIAGE HUB');

      // 5 Pillar Nodes
      for (var idx = 0; idx < IDEA_PILLARS.length; idx++) {
        (function (pil) {
          var sel = pil.id === active.id;
          var gP = root.append('g')
            .attr('class', 'svg-node')
            .on('click', function () {
              selectPillar(pil.id, true);
            });

          gP.append('rect')
            .attr('x', pil.x - 62).attr('y', pil.y - 18).attr('width', 124).attr('height', 36)
            .attr('rx', 8)
            .attr('fill', sel ? '#1b2432' : '#141923')
            .attr('stroke', pil.color)
            .attr('stroke-width', sel ? 2.4 : 1.4);

          gP.append('text')
            .attr('x', pil.x).attr('y', pil.y - 3)
            .attr('text-anchor', 'middle').attr('fill', pil.color).attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
            .text(pil.label);

          gP.append('text')
            .attr('x', pil.x).attr('y', pil.y + 10)
            .attr('text-anchor', 'middle').attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '8')
            .text('Category: ' + pil.category);
        })(IDEA_PILLARS[idx]);
      }

      // Right Panel: Active Pillar Mechanism & Routing Inspector
      root.append('rect')
        .attr('x', 472).attr('y', 12).attr('width', 274).attr('height', 206)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', active.color).attr('stroke-width', 1.6);

      root.append('text')
        .attr('x', 486).attr('y', 32)
        .attr('fill', active.color).attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
        .text('SELECTED PILLAR MECHANISM');

      root.append('text')
        .attr('x', 486).attr('y', 52)
        .attr('fill', '#f0ede6').attr('font-family', 'serif').attr('font-size', '13').attr('font-weight', '700')
        .text(active.label);

      // Wrap mechanism text cleanly across 3 lines
      var words = active.mechanism.split(' ');
      var lines = ['', '', ''];
      var lineIdx = 0;
      for (var w = 0; w < words.length; w++) {
        if ((lines[lineIdx] + ' ' + words[w]).trim().length > 42 && lineIdx < 2) {
          lineIdx++;
        }
        lines[lineIdx] = (lines[lineIdx] + ' ' + words[w]).trim();
      }
      for (var ln = 0; ln < lines.length; ln++) {
        if (lines[ln]) {
          root.append('text')
            .attr('x', 486).attr('y', 74 + ln * 15)
            .attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '9.2')
            .text(lines[ln]);
        }
      }

      root.append('rect')
        .attr('x', 486).attr('y', 126).attr('width', 246).attr('height', 44)
        .attr('rx', 6).attr('fill', '#161b26').attr('stroke', '#2c3344');

      root.append('text')
        .attr('x', 496).attr('y', 142)
        .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
        .text('WORKBENCH ROUTING TARGET:');

      root.append('text')
        .attr('x', 496).attr('y', 158)
        .attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '8.5')
        .text('Form category -> "' + active.category + '"');

      var jumpBtn = root.append('g')
        .attr('class', 'svg-node')
        .on('click', function () {
          if (formEl && typeof formEl.scrollIntoView === 'function') {
            formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });

      jumpBtn.append('rect')
        .attr('x', 486).attr('y', 180).attr('width', 246).attr('height', 26)
        .attr('rx', 6).attr('fill', '#142623').attr('stroke', '#4fb3a8');

      jumpBtn.append('text')
        .attr('x', 609).attr('y', 197)
        .attr('text-anchor', 'middle').attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
        .text('PROPOSE IDEA IN THIS PILLAR ↓');

      if (shouldScroll && formEl && typeof formEl.scrollIntoView === 'function') {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    for (var i = 0; i < pillarBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          selectPillar(btn.getAttribute('data-idea-pillar'), false);
        });
      })(pillarBtns[i]);
    }

    selectPillar('1', false);
  }

  // ============================================================================
  // 4. RECOGNITION LEDGER: 5D Value Attribution & Brier Calibration (#recog-d3-chart)
  // ============================================================================
  var RECOG_DIMENSIONS = [
    {
      key: 'epistemic',
      label: 'Epistemic Precision',
      cinScore: 94,
      specScore: 12,
      color: '#4fb3a8',
      brier: '0.068',
      detail: 'Falsifiable dated forecasts audited against primary empirical evidence when horizons fall due.'
    },
    {
      key: 'shapley',
      label: 'Data Shapley Craft',
      cinScore: 91,
      specScore: 8,
      color: '#6aa8e0',
      brier: '0.079',
      detail: 'Marginal attribution credit for open protocols, verified code patches, and domain rule sets.'
    },
    {
      key: 'civic',
      label: 'Care & Civic Vitality',
      cinScore: 86,
      specScore: 5,
      color: '#e3b341',
      brier: '0.088',
      detail: 'Protecting household budgets, patient billing rights, and cooperative community governance.'
    },
    {
      key: 'ecology',
      label: 'Ecological Stewardship',
      cinScore: 84,
      specScore: 6,
      color: '#9d7fe8',
      brier: '0.091',
      detail: 'Compact local Rank-16 adapters and 8GB edge inference replacing wasteful cloud compute churn.'
    },
    {
      key: 'commons',
      label: 'Philanthropic Commons',
      cinScore: 89,
      specScore: 9,
      color: '#4fb3a8',
      brier: '0.084',
      detail: 'Open-access standards, CVE disclosures, and public-good safety benchmarks shared without paywalls.'
    }
  ];

  // Empirical calibration curve points: [predictedPct, cinObservedPct, hypeObservedPct]
  var BRIER_POINTS = [
    [10, 11, 32],
    [30, 29, 54],
    [50, 51, 76],
    [70, 69, 88],
    [90, 89, 58]
  ];

  function initRecognitionD3() {
    var svgEl = document.getElementById('recog-d3-chart');
    if (!svgEl) return;

    var statusEl = document.getElementById('recog-d3-status');
    var dimBtns = document.querySelectorAll('[data-recog-dim]');

    function render(selectedKey) {
      var active = RECOG_DIMENSIONS[0];
      for (var i = 0; i < RECOG_DIMENSIONS.length; i++) {
        if (RECOG_DIMENSIONS[i].key === selectedKey) {
          active = RECOG_DIMENSIONS[i];
          break;
        }
      }

      if (statusEl) {
        statusEl.textContent = active.label + ': ' + active.cinScore + '% CIN 5D Cooperative Attribution vs. ' + active.specScore + '% 1D Speculative Profit Extraction (Stratum Brier Score: ' + active.brier + ') — ' + active.detail;
      }

      for (var b = 0; b < dimBtns.length; b++) {
        dimBtns[b].classList.toggle('active', dimBtns[b].getAttribute('data-recog-dim') === active.key);
      }

      var root = selectSvg(svgEl);

      root.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 230)
        .attr('rx', 10).attr('fill', '#0d0f13');

      // Left Panel: 5D Cooperative Reward Vector vs 1D Speculative Extraction
      root.append('rect')
        .attr('x', 14).attr('y', 12).attr('width', 432).attr('height', 206)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#262c3a');

      root.append('text')
        .attr('x', 26).attr('y', 30)
        .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
        .text('5D COOPERATIVE REWARD VECTOR VS. 1D SPECULATIVE EXTRACTION');

      for (var dIdx = 0; dIdx < RECOG_DIMENSIONS.length; dIdx++) {
        (function (dim, idx) {
          var isSel = dim.key === active.key;
          var rowY = 44 + idx * 33;
          var cinW = Math.round((dim.cinScore / 100) * 190);
          var specW = Math.max(6, Math.round((dim.specScore / 100) * 190));

          var gRow = root.append('g')
            .attr('class', 'svg-node')
            .on('click', function () { render(dim.key); });

          gRow.append('rect')
            .attr('x', 22).attr('y', rowY - 3).attr('width', 416).attr('height', 28)
            .attr('rx', 5)
            .attr('fill', isSel ? '#182130' : 'transparent')
            .attr('stroke', isSel ? dim.color : 'none');

          gRow.append('text')
            .attr('x', 30).attr('y', rowY + 14)
            .attr('fill', isSel ? '#ffffff' : '#f0ede6')
            .attr('font-family', 'sans-serif').attr('font-size', '9.5')
            .attr('font-weight', isSel ? '700' : '600')
            .text(dim.label);

          // CIN 5D bar (top track)
          gRow.append('rect')
            .attr('x', 180).attr('y', rowY + 2).attr('width', 190).attr('height', 9)
            .attr('rx', 4).attr('fill', '#1a202c');

          gRow.append('rect')
            .attr('x', 180).attr('y', rowY + 2).attr('width', cinW).attr('height', 9)
            .attr('rx', 4).attr('fill', dim.color);

          // 1D Speculative Profit Extraction bar (bottom track)
          gRow.append('rect')
            .attr('x', 180).attr('y', rowY + 13).attr('width', 190).attr('height', 6)
            .attr('rx', 3).attr('fill', '#1a202c');

          gRow.append('rect')
            .attr('x', 180).attr('y', rowY + 13).attr('width', specW).attr('height', 6)
            .attr('rx', 3).attr('fill', '#ef6a52');

          gRow.append('text')
            .attr('x', 378).attr('y', rowY + 14)
            .attr('fill', dim.color).attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
            .text(dim.cinScore + '% vs ' + dim.specScore + '%');
        })(RECOG_DIMENSIONS[dIdx], dIdx);
      }

      // Right Panel: Brier Forecast Calibration Curve
      root.append('rect')
        .attr('x', 458).attr('y', 12).attr('width', 288).attr('height', 206)
        .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#6aa8e0').attr('stroke-width', 1.4);

      root.append('text')
        .attr('x', 472).attr('y', 30)
        .attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
        .text('BRIER FORECAST CALIBRATION CURVE');

      var bx0 = 496, bx1 = 724, by0 = 182, by1 = 48;
      var bw = bx1 - bx0, bh = by0 - by1;

      function calX(pct) { return Math.round(bx0 + (pct / 100) * bw); }
      function calY(pct) { return Math.round(by0 - (pct / 100) * bh); }

      // Grid & axes
      root.append('rect')
        .attr('x', bx0).attr('y', by1).attr('width', bw).attr('height', bh)
        .attr('fill', '#0e121a').attr('stroke', '#252c3b');

      // Perfect calibration diagonal (y = x)
      root.append('line')
        .attr('x1', bx0).attr('y1', by0).attr('x2', bx1).attr('y2', by1)
        .attr('stroke', '#8c8a82').attr('stroke-width', 1.2).attr('stroke-dasharray', '4 3');

      var cinCalPts = [];
      var hypeCalPts = [];
      for (var p = 0; p < BRIER_POINTS.length; p++) {
        var pt = BRIER_POINTS[p];
        cinCalPts.push(calX(pt[0]) + ',' + calY(pt[1]));
        hypeCalPts.push(calX(pt[0]) + ',' + calY(pt[2]));
      }

      // Uncalibrated 1D Hype curve
      root.append('polyline')
        .attr('points', hypeCalPts.join(' '))
        .attr('fill', 'none').attr('stroke', '#ef6a52').attr('stroke-width', 1.8).attr('stroke-dasharray', '3 2');

      // CIN Verified Calibration curve
      root.append('polyline')
        .attr('points', cinCalPts.join(' '))
        .attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 2.6);

      for (var cDot = 0; cDot < BRIER_POINTS.length; cDot++) {
        var cpt = BRIER_POINTS[cDot];
        root.append('circle')
          .attr('cx', calX(cpt[0])).attr('cy', calY(cpt[1]))
          .attr('r', 4).attr('fill', '#4fb3a8').attr('stroke', '#0d0f13').attr('stroke-width', 1.2);
      }

      root.append('text')
        .attr('x', bx1 - 8).attr('y', by0 - 20).attr('text-anchor', 'end')
        .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
        .text('● CIN Audited (Brier ' + active.brier + ')');

      root.append('text')
        .attr('x', bx1 - 8).attr('y', by0 - 8).attr('text-anchor', 'end')
        .attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8')
        .text('--- 1D Hype Drift (Brier 0.314)');

      root.append('text')
        .attr('x', Math.round((bx0 + bx1) / 2)).attr('y', 204)
        .attr('text-anchor', 'middle').attr('fill', '#c5c2b9').attr('font-family', 'monospace').attr('font-size', '8')
        .text('Predicted Probability (0%-100%) vs. Observed Truth');
    }

    for (var i = 0; i < dimBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          render(btn.getAttribute('data-recog-dim'));
        });
      })(dimBtns[i]);
    }

    render('epistemic');
  }

// ============================================================================
  // 1B. TWIN STUDIO TAB 2: Biological (~40 bits/s) vs. Swarm (10^12 bits/s) Airlock (#twin-d3-airlock)
  // ============================================================================
  var AIRLOCK_LEASES = {
    24: {
      hours: 24,
      label: '24h Max Mortal Lease · 99.9999% Swarm Noise Blocked · ~40 bits/s Human Pace',
      blockedPct: '99.9999%',
      quorumMs: '<10 ms Φ(R) Gate',
      egressBytes: '0 Bytes Raw PII',
      statusColor: '#4fb3a8',
      leaseFill: 1.0
    },
    8: {
      hours: 8,
      label: '8h Workday Focus Lease · Cognitive Load Shield Active · ~40 bits/s Human Pace',
      blockedPct: '99.9999%',
      quorumMs: '6.4 ms Φ(R) Gate',
      egressBytes: '0 Bytes Raw PII',
      statusColor: '#4fb3a8',
      leaseFill: 0.62
    },
    1: {
      hours: 1,
      label: '1h Ephemeral Task Lease · Single-Origin Capability Envelope · Auto-Wipe on Expiry',
      blockedPct: '99.9999%',
      quorumMs: '4.2 ms Φ(R) Gate',
      egressBytes: '0 Bytes Raw PII',
      statusColor: '#e3b341',
      leaseFill: 0.28
    },
    0: {
      hours: 0,
      label: '0ms Emergency Revoke · All External QUIC Tunnels Severed · 100% Air-Gapped Local Vault',
      blockedPct: '100% Severed',
      quorumMs: '0.0 ms Hard Cut',
      egressBytes: '0 Bytes Egress',
      statusColor: '#ef6a52',
      leaseFill: 0.06
    }
  };

  function initTwinAirlockD3() {
    var svgEl = document.getElementById('twin-d3-airlock');
    var tabsWrap = document.getElementById('twin-d3-tabs');
    var paneMoat = document.getElementById('twin-d3-pane-moat');
    var paneAirlock = document.getElementById('twin-d3-pane-airlock');

    if (tabsWrap && paneMoat && paneAirlock) {
      tabsWrap.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-twin-d3-tab]');
        if (!btn) return;
        var mode = btn.getAttribute('data-twin-d3-tab');
        var allBtns = tabsWrap.querySelectorAll('[data-twin-d3-tab]');
        for (var i = 0; i < allBtns.length; i++) {
          var isAct = allBtns[i] === btn;
          allBtns[i].classList.toggle('active', isAct);
          allBtns[i].setAttribute('aria-selected', String(isAct));
        }
        var showAir = mode === 'airlock';
        paneMoat.hidden = showAir;
        paneAirlock.hidden = !showAir;
        if (showAir) {
          paneMoat.setAttribute('hidden', '');
          paneAirlock.removeAttribute('hidden');
        } else {
          paneAirlock.setAttribute('hidden', '');
          paneMoat.removeAttribute('hidden');
        }
      });
    }

    if (!svgEl) return;

    var leaseOut = document.getElementById('twin-airlock-lease-out');
    var leaseBtns = document.querySelectorAll('[data-airlock-lease]');

    function renderAirlock(hoursKey) {
      var k = Number(hoursKey);
      if (!(k in AIRLOCK_LEASES)) k = 24;
      var cfg = AIRLOCK_LEASES[k];

      if (leaseOut) {
        leaseOut.textContent = cfg.label;
      }
      for (var i = 0; i < leaseBtns.length; i++) {
        var bVal = Number(leaseBtns[i].getAttribute('data-airlock-lease'));
        leaseBtns[i].classList.toggle('active', bVal === k);
      }

      var root = selectSvg(svgEl);

      root.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 260)
        .attr('rx', 10).attr('fill', '#0d0f13');

      root.append('rect')
        .attr('x', 14).attr('y', 14).attr('width', 216).attr('height', 232)
        .attr('rx', 8).attr('fill', '#221518').attr('stroke', '#ef6a52').attr('stroke-width', 1.4);

      root.append('text')
        .attr('x', 26).attr('y', 34)
        .attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
        .text('1. SILICON SWARM INTERNET');

      root.append('text')
        .attr('x', 26).attr('y', 54)
        .attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
        .text('10¹² bits/s Velocity');

      var swarmVectors = [
        'Persuasive Bot Swarms',
        'Indirect Prompt Injection',
        'Cloud Telemetry Scraping',
        '60-90d Weight Distillation'
      ];
      for (var s = 0; s < swarmVectors.length; s++) {
        var sy = 74 + s * 32;
        root.append('rect')
          .attr('x', 26).attr('y', sy).attr('width', 192).attr('height', 24)
          .attr('rx', 5).attr('fill', 'rgba(239,106,82,0.16)').attr('stroke', '#ef6a52');
        root.append('text')
          .attr('x', 36).attr('y', sy + 15)
          .attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '8.5').attr('font-weight', '700')
          .text('⚡ ' + swarmVectors[s]);
      }

      root.append('text')
        .attr('x', 122).attr('y', 228).attr('text-anchor', 'middle')
        .attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
        .text('4.5-Month Capability Doubling');

      root.append('rect')
        .attr('x', 252).attr('y', 14).attr('width', 256).attr('height', 232)
        .attr('rx', 8).attr('fill', '#122220').attr('stroke', cfg.statusColor).attr('stroke-width', 2);

      root.append('text')
        .attr('x', 380).attr('y', 34).attr('text-anchor', 'middle')
        .attr('fill', cfg.statusColor).attr('font-family', 'monospace').attr('font-size', '9.2').attr('font-weight', '700')
        .text('2. TWO-INTERNET OCAP AIRLOCK');

      root.append('text')
        .attr('x', 380).attr('y', 52).attr('text-anchor', 'middle')
        .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '8.5').attr('font-weight', '700')
        .text('Active Lease: ' + (k === 0 ? 'REVOKED (0ms Cut)' : k + 'h Mortal Lease'));

      root.append('rect')
        .attr('x', 272).attr('y', 62).attr('width', 216).attr('height', 14)
        .attr('rx', 7).attr('fill', '#0d1218').attr('stroke', '#283242');
      root.append('rect')
        .attr('x', 272).attr('y', 62).attr('width', Math.round(216 * cfg.leaseFill)).attr('height', 14)
        .attr('rx', 7).attr('fill', cfg.statusColor);

      var gates = [
        ['Swarm Traffic Filtered', cfg.blockedPct],
        ['Hardware Quorum Gate', cfg.quorumMs],
        ['Outbound Raw Data Egress', cfg.egressBytes],
        ['Transport Protocol', 'QUIC RFC 9000 + ICE']
      ];
      for (var g = 0; g < gates.length; g++) {
        var gy = 90 + g * 34;
        root.append('rect')
          .attr('x', 268).attr('y', gy).attr('width', 224).attr('height', 26)
          .attr('rx', 5).attr('fill', '#151b24').attr('stroke', '#2a3342');
        root.append('text')
          .attr('x', 278).attr('y', gy + 16)
          .attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '8.4')
          .text(gates[g][0]);
        root.append('text')
          .attr('x', 482).attr('y', gy + 16).attr('text-anchor', 'end')
          .attr('fill', cfg.statusColor).attr('font-family', 'monospace').attr('font-size', '8.4').attr('font-weight', '700')
          .text(gates[g][1]);
      }

      root.append('rect')
        .attr('x', 530).attr('y', 14).attr('width', 216).attr('height', 232)
        .attr('rx', 8).attr('fill', '#121822').attr('stroke', '#6aa8e0').attr('stroke-width', 1.5);

      root.append('text')
        .attr('x', 638).attr('y', 34).attr('text-anchor', 'middle')
        .attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
        .text('3. HUMAN BIOLOGY & TWIN');

      root.append('text')
        .attr('x', 638).attr('y', 54).attr('text-anchor', 'middle')
        .attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '12').attr('font-weight', '700')
        .text('~40 bits/s Conscious Pace');

      var humanLayers = [
        ['Cognitive Load Shield', 'Sweller (1988) Bounded'],
        ['Reflective Goals', 'Ryan & Deci (2000) Aligned'],
        ['Hardware Liveness Key', '1-to-1 Biometric Bound'],
        ['Uncopyable Pair Moat', '96% Local Craft + Vault']
      ];
      for (var h = 0; h < humanLayers.length; h++) {
        var hy = 74 + h * 36;
        root.append('rect')
          .attr('x', 544).attr('y', hy).attr('width', 188).attr('height', 28)
          .attr('rx', 5).attr('fill', '#162230').attr('stroke', '#4fb3a8');
        root.append('text')
          .attr('x', 554).attr('y', hy + 12)
          .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
          .text(humanLayers[h][0]);
        root.append('text')
          .attr('x', 554).attr('y', hy + 23)
          .attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '8')
          .text(humanLayers[h][1]);
      }

      root.append('line')
        .attr('x1', 230).attr('y1', 125).attr('x2', 252).attr('y2', 125)
        .attr('stroke', '#ef6a52').attr('stroke-width', 2.4).attr('stroke-dasharray', '4 3');
      root.append('line')
        .attr('x1', 508).attr('y1', 125).attr('x2', 530).attr('y2', 125)
        .attr('stroke', cfg.statusColor).attr('stroke-width', 2.6);
    }

    for (var i = 0; i < leaseBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          renderAirlock(btn.getAttribute('data-airlock-lease'));
        });
      })(leaseBtns[i]);
    }

    renderAirlock(24);
  }

  // ============================================================================
  // 5. DASHBOARD TELEMETRY: 39-Stream Agent Fleet & 4-Pillar Output (#dashboard-d3-svg)
  // ============================================================================
  var DASH_PILLARS = [
    {
      id: 'P1',
      name: '1. Website UX & Workbenches',
      lane: 'A1_SITE_AND_UX_ENGINEERS',
      share: 96,
      color: '#4fb3a8',
      metric: '7 Global Lenses · 4 D3 Modes · 0-Egress Twin',
      desc: 'Continuous interactive D3.js v7 visualizers, progressive disclosure drawers, and cognitive-load bounded UX.'
    },
    {
      id: 'P2',
      name: '2. Deep Research & SPRA',
      lane: 'A4_RESEARCH_PAPER_AND_VOLUME_AUTHORS',
      share: 95,
      color: '#6aa8e0',
      metric: '5 Volumes · 95.3% SPRA Token Savings',
      desc: 'Twice-daily multi-page formal research compiled into 260-token SPRA Schema-RAG units.'
    },
    {
      id: 'P3',
      name: '3. Social & Lab Collaboration',
      lane: 'A3_AUDIENCE_ARTICLE_AND_SOCIAL_AUTHORS',
      share: 91,
      color: '#e3b341',
      metric: '2,521 Primary Signals · 12 Credited Labs',
      desc: 'Daily researcher outreach packs, Brier-calibrated public forecasts, and plain-language articles.'
    },
    {
      id: 'P4',
      name: '4. Local Agents + Testnet Sim',
      lane: 'A2_SOFTWARE_AND_SIM_ENGINEERS',
      share: 98,
      color: '#9d7fe8',
      metric: '205 Twin Primitives · 317 Passing Tests',
      desc: 'Agent-Web Testnet Ledger v4.0, QUIC P2P transport, and firewalled Realm B clean-room actors.'
    }
  ];

  function initDashboardD3() {
    var svgEl = document.getElementById('dashboard-d3-svg');
    if (!svgEl) return;

    var tabsWrap = document.getElementById('dashboard-d3-tabs');
    var statusEl = document.getElementById('dashboard-d3-status');
    var currentTab = 'pillars';

    function render(tabMode) {
      currentTab = tabMode || 'pillars';
      if (tabsWrap) {
        var btns = tabsWrap.querySelectorAll('[data-dash-tab]');
        for (var i = 0; i < btns.length; i++) {
          var isAct = btns[i].getAttribute('data-dash-tab') === currentTab;
          btns[i].classList.toggle('active', isAct);
          btns[i].setAttribute('aria-selected', String(isAct));
        }
      }

      var root = selectSvg(svgEl);
      root.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', 760).attr('height', 250)
        .attr('rx', 10).attr('fill', '#0d0f13');

      if (currentTab === 'pillars') {
        if (statusEl) {
          statusEl.textContent = '4-Pillar Daily Output & SPRA Schema-RAG: 95.3% context token savings (~260 tokens/unit vs. 5,500 raw narrative tokens) across 39 autonomous agent streams.';
        }

        // Left Panel: 4 Constant Daily Output Pillars
        root.append('rect')
          .attr('x', 14).attr('y', 14).attr('width', 432).attr('height', 222)
          .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#262c3a');

        root.append('text')
          .attr('x', 26).attr('y', 34)
          .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '9.2').attr('font-weight', '700')
          .text('1. FOUR CONSTANT DAILY OUTPUT PILLARS (CLICK ANY PILLAR)');

        for (var p = 0; p < DASH_PILLARS.length; p++) {
          (function (pil, idx) {
            var py = 46 + idx * 45;
            var barW = Math.round((pil.share / 100) * 196);
            var gRow = root.append('g')
              .attr('class', 'svg-node')
              .on('click', function () {
                if (statusEl) {
                  statusEl.textContent = pil.name + ' (' + pil.lane + '): ' + pil.metric + ' — ' + pil.desc;
                }
              });

            gRow.append('rect')
              .attr('x', 24).attr('y', py).attr('width', 412).attr('height', 38)
              .attr('rx', 6).attr('fill', '#161b26').attr('stroke', pil.color).attr('stroke-width', 1.2);

            gRow.append('text')
              .attr('x', 34).attr('y', py + 15)
              .attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '9.2').attr('font-weight', '700')
              .text(pil.name);

            gRow.append('text')
              .attr('x', 34).attr('y', py + 29)
              .attr('fill', '#c5c2b9').attr('font-family', 'monospace').attr('font-size', '7.8')
              .text(pil.metric);

            gRow.append('rect')
              .attr('x', 228).attr('y', py + 10).attr('width', 196).attr('height', 16)
              .attr('rx', 4).attr('fill', '#0d1017');

            gRow.append('rect')
              .attr('x', 228).attr('y', py + 10).attr('width', barW).attr('height', 16)
              .attr('rx', 4).attr('fill', pil.color);

            gRow.append('text')
              .attr('x', 418).attr('y', py + 21).attr('text-anchor', 'end')
              .attr('fill', '#111317').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
              .text(pil.share + '% SLA');
          })(DASH_PILLARS[p], p);
        }

        // Right Panel: SPRA 95.3% Compression & RRSI Instruction Ceiling
        root.append('rect')
          .attr('x', 458).attr('y', 14).attr('width', 288).attr('height', 222)
          .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#4fb3a8').attr('stroke-width', 1.5);

        root.append('text')
          .attr('x', 472).attr('y', 34)
          .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
          .text('2. SPRA SCHEMA-RAG & RRSI TELEMETRY');

        root.append('text')
          .attr('x', 472).attr('y', 56)
          .attr('fill', '#ef6a52').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
          .text('Raw Narrative Volume: ~5,500 tokens (100%)');
        root.append('rect')
          .attr('x', 472).attr('y', 64).attr('width', 260).attr('height', 18)
          .attr('rx', 4).attr('fill', '#ef6a52');

        root.append('text')
          .attr('x', 472).attr('y', 102)
          .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
          .text('Compiled SPRA Unit: ~260 tokens (-95.3%)');
        root.append('rect')
          .attr('x', 472).attr('y', 110).attr('width', 260).attr('height', 18)
          .attr('rx', 4).attr('fill', '#1a202c');
        root.append('rect')
          .attr('x', 472).attr('y', 110).attr('width', 18).attr('height', 18)
          .attr('rx', 4).attr('fill', '#4fb3a8');

        var rrsiStats = [
          ['Instruction Ceiling', 'L_max(f_i) Frequency-Bounded'],
          ['Admission Gate', 'Continual PAC-Learning Critic'],
          ['Zero-Regime Ideation', 'Regime 0 / Ultra-Light Kernel']
        ];
        for (var r = 0; r < rrsiStats.length; r++) {
          var ry = 140 + r * 28;
          root.append('rect')
            .attr('x', 472).attr('y', ry).attr('width', 260).attr('height', 22)
            .attr('rx', 4).attr('fill', '#161c27').attr('stroke', '#283142');
          root.append('text')
            .attr('x', 480).attr('y', ry + 14)
            .attr('fill', '#c5c2b9').attr('font-family', 'sans-serif').attr('font-size', '8')
            .text(rrsiStats[r][0]);
          root.append('text')
            .attr('x', 724).attr('y', ry + 14).attr('text-anchor', 'end')
            .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8').attr('font-weight', '700')
            .text(rrsiStats[r][1]);
        }
      } else {
        if (statusEl) {
          statusEl.textContent = 'Dual-Realm Separation: Realm A Collective Builders (39 autonomous streams across A1-A4) are strictly firewalled from Realm B Clean-Room Testnet Actors via RealmIsolationFirewall.';
        }

        // Left: Realm A Collective Builders (39 Streams)
        root.append('rect')
          .attr('x', 14).attr('y', 14).attr('width', 268).attr('height', 222)
          .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#6aa8e0').attr('stroke-width', 1.5);

        root.append('text')
          .attr('x', 26).attr('y', 34)
          .attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
          .text('REALM A: 39 BUILDER STREAMS');

        var lanes = [
          ['A1 · Site & D3 UX Engineers', '10 Streams'],
          ['A2 · Sim & Software Engineers', '11 Streams'],
          ['A3 · Audience & Social Authors', '9 Streams'],
          ['A4 · Research & SPRA Authors', '9 Streams']
        ];
        for (var l = 0; l < lanes.length; l++) {
          var ly = 48 + l * 42;
          root.append('rect')
            .attr('x', 26).attr('y', ly).attr('width', 244).attr('height', 34)
            .attr('rx', 6).attr('fill', '#161d29').attr('stroke', '#2e384d');
          root.append('text')
            .attr('x', 36).attr('y', ly + 15)
            .attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '8.6').attr('font-weight', '700')
            .text(lanes[l][0]);
          root.append('text')
            .attr('x', 36).attr('y', ly + 27)
            .attr('fill', '#6aa8e0').attr('font-family', 'monospace').attr('font-size', '7.8')
            .text(lanes[l][1] + ' · Antigravity Harness');
        }

        // Center: RealmIsolationFirewall
        root.append('rect')
          .attr('x', 296).attr('y', 14).attr('width', 168).attr('height', 222)
          .attr('rx', 8).attr('fill', '#132421').attr('stroke', '#4fb3a8').attr('stroke-width', 2);

        root.append('text')
          .attr('x', 380).attr('y', 36).attr('text-anchor', 'middle')
          .attr('fill', '#4fb3a8').attr('font-family', 'monospace').attr('font-size', '8.8').attr('font-weight', '700')
          .text('REALM ISOLATION');
        root.append('text')
          .attr('x', 380).attr('y', 50).attr('text-anchor', 'middle')
          .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '8.2').attr('font-weight', '700')
          .text('FIREWALL (0 BLEED)');

        var fwChecks = [
          'session_isolation.py',
          '0 Builder Prompt Bleed',
          'Clean-Room Actor Factory',
          'SHA-256 Audit Manifest'
        ];
        for (var f = 0; f < fwChecks.length; f++) {
          var fy = 66 + f * 38;
          root.append('rect')
            .attr('x', 308).attr('y', fy).attr('width', 144).attr('height', 28)
            .attr('rx', 5).attr('fill', '#0f1918').attr('stroke', '#4fb3a8');
          root.append('text')
            .attr('x', 380).attr('y', fy + 17).attr('text-anchor', 'middle')
            .attr('fill', '#f0ede6').attr('font-family', 'monospace').attr('font-size', '7.8').attr('font-weight', '700')
            .text('✓ ' + fwChecks[f]);
        }

        // Right: Realm B Testnet Actors
        root.append('rect')
          .attr('x', 478).attr('y', 14).attr('width', 268).attr('height', 222)
          .attr('rx', 8).attr('fill', '#12161f').attr('stroke', '#e3b341').attr('stroke-width', 1.5);

        root.append('text')
          .attr('x', 490).attr('y', 34)
          .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '9').attr('font-weight', '700')
          .text('REALM B: TESTNET ACTORS');

        var actors = [
          ['Clean-Room Sandbox Actors', 'In-World Incentives Only'],
          ['QUIC (RFC 9000/9221) P2P', 'NAT-Traversed Settlement'],
          ['Data Shapley & LoRA Ledger', '95% Creator Attribution'],
          ['PSI Buyer Co-Ops & Audits', 'CMS NCCI + Wholesale GPO']
        ];
        for (var a = 0; a < actors.length; a++) {
          var ay = 48 + a * 42;
          root.append('rect')
            .attr('x', 490).attr('y', ay).attr('width', 244).attr('height', 34)
            .attr('rx', 6).attr('fill', '#1b1914').attr('stroke', '#473b22');
          root.append('text')
            .attr('x', 500).attr('y', ay + 15)
            .attr('fill', '#f0ede6').attr('font-family', 'sans-serif').attr('font-size', '8.6').attr('font-weight', '700')
            .text(actors[a][0]);
          root.append('text')
            .attr('x', 500).attr('y', ay + 27)
            .attr('fill', '#e3b341').attr('font-family', 'monospace').attr('font-size', '7.8')
            .text(actors[a][1]);
        }
      }
    }

    if (tabsWrap) {
      tabsWrap.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-dash-tab]');
        if (!btn) return;
        render(btn.getAttribute('data-dash-tab'));
      });
    }

    render('pillars');
  }

  function bootAllSubpageStudios() {
    initTwinMoatD3();
    initTwinAirlockD3();
    initFuturesConeD3();
    initIdeasConstellationD3();
    initRecognitionD3();
    initDashboardD3();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootAllSubpageStudios);
    } else {
      bootAllSubpageStudios();
    }
  }
})();
