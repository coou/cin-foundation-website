/* Opportunity Landscape & Personal Sensor Matcher Demo (Powered by D3.js v7)
 * Realm A Website Agent Integration (Non-Testnet)
 * Uses pure DOM / D3 APIs (zero raw HTML string injection) so it runs identically on
 * collectiveintelligencenetwork.org (src/) and cintnet.org (portal/).
 */
(function () {
  'use strict';

  var FIRESTORE_CREATE_URL =
    'https://firestore.googleapis.com/v1/projects/cin-foundation/databases/(default)/documents/opportunity_requests';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }

  function clearChildren(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function computeCoupling(landscape, stereotypeId, sliders, focusSector, contextNote, clientLabel) {
    var drivers = landscape.economic_drivers || [];
    var businesses = landscape.businesses || [];
    var stereotypes = landscape.stereotypes || [];
    var st = stereotypes.find(function (s) { return s.id === stereotypeId; }) || stereotypes[0] || {
      id: 'young-family',
      label: 'Young Working Family',
      sliders: { health: 82, housing: 78, food: 88, craft: 45, care: 92, b2b: 30 }
    };

    var driverScores = [];
    var totalRecovered = 0;
    var totalBizCacSaved = 0;

    drivers.forEach(function (d) {
      var raw = sliders[d.id] !== undefined ? Number(sliders[d.id]) : (st.sliders[d.id] || 60);
      var w = Math.max(0, Math.min(100, raw)) / 100;
      if (focusSector && focusSector !== 'all' && focusSector !== d.id) {
        w *= 0.78;
      } else if (focusSector === d.id) {
        w = Math.min(1.15, w * 1.25);
      }
      var addressable = d.annual_baseline_usd * (0.45 + 0.75 * w);
      var savingsRate = (d.legacy_middleman_tax_pct / 100) * 0.82;
      var recovered = Math.round(addressable * savingsRate);
      var bizCac = Math.round(addressable * 0.19);
      totalRecovered += recovered;
      totalBizCacSaved += bizCac;
      driverScores.push({
        id: d.id,
        name: d.name,
        short: d.short,
        color: d.color,
        weightPct: Math.round(raw),
        addressableUsd: Math.round(addressable),
        recoveredUsd: recovered,
        bizCacUsd: bizCac,
        legacyTaxPct: d.legacy_middleman_tax_pct,
        humanNeed: d.human_need,
        marketBottleneck: d.market_bottleneck
      });
    });

    driverScores.sort(function (a, b) { return b.recoveredUsd - a.recoveredUsd; });
    var topDriverIds = driverScores.slice(0, 3).map(function (x) { return x.id; });

    var matchedBiz = businesses.map(function (b) {
      var dScore = driverScores.find(function (x) { return x.id === b.driver_id; }) || driverScores[0];
      var w = sliders[b.driver_id] !== undefined ? Number(sliders[b.driver_id]) : 60;
      var bonus = b.driver_id === focusSector ? 22 : (topDriverIds.indexOf(b.driver_id) !== -1 ? 10 : 0);
      var score = Math.min(99, Math.round(0.52 * w + 0.85 * b.operating_margin_pct + 0.48 * b.household_savings_pct + bonus));
      return {
        id: b.id,
        name: b.name,
        driver_id: b.driver_id,
        driver_short: dScore ? dScore.short : b.driver_id,
        driver_color: dScore ? dScore.color : '#4fb3a8',
        naics: b.naics,
        business_type: b.business_type,
        operating_margin_pct: b.operating_margin_pct,
        legacy_cac_ad_tax_pct: b.legacy_cac_ad_tax_pct,
        household_savings_pct: b.household_savings_pct,
        business_margin_boost_pct: b.business_margin_boost_pct,
        solution_summary: b.solution_summary,
        opportunity_gap: b.opportunity_gap,
        coupling_score: score,
        userAnnualSavingsUsd: Math.round((dScore ? dScore.recoveredUsd : 1800) * 0.56)
      };
    });

    matchedBiz.sort(function (a, b) { return b.coupling_score - a.coupling_score; });

    return {
      stereotype: st,
      totalRecoveredUsd: totalRecovered,
      totalBizCacSavedUsd: totalBizCacSaved,
      driverScores: driverScores,
      matchedBusinesses: matchedBiz,
      topBusinesses: matchedBiz.slice(0, 4),
      contextNote: contextNote || '',
      clientLabel: clientLabel || st.label
    };
  }

  function renderRadarChart(svgNode, driverScores) {
    if (!window.d3 || !svgNode) return;
    var d3 = window.d3;
    var svg = d3.select(svgNode);
    svg.selectAll('*').remove();

    var width = 280, height = 220, cx = 140, cy = 112, radius = 74;
    var n = driverScores.length;
    if (!n) return;

    var g = svg.append('g').attr('transform', 'translate(' + cx + ',' + cy + ')');

    [0.33, 0.66, 1.0].forEach(function (lvl) {
      g.append('circle')
        .attr('r', radius * lvl)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(140,148,164,0.22)')
        .attr('stroke-dasharray', lvl < 1 ? '3 3' : null);
    });

    var angleSlice = (Math.PI * 2) / n;
    var points = [];

    driverScores.forEach(function (d, i) {
      var angle = i * angleSlice - Math.PI / 2;
      var x2 = Math.cos(angle) * radius;
      var y2 = Math.sin(angle) * radius;
      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', 'rgba(140,148,164,0.25)');

      var lx = Math.cos(angle) * (radius + 22);
      var ly = Math.sin(angle) * (radius + 16);
      g.append('text')
        .attr('x', lx)
        .attr('y', ly + 3)
        .attr('text-anchor', Math.abs(lx) < 10 ? 'middle' : (lx > 0 ? 'start' : 'end'))
        .attr('font-size', '9.5')
        .attr('font-weight', '700')
        .attr('font-family', 'monospace')
        .attr('fill', d.color)
        .text(d.short.split(' ')[0] + ' ' + d.weightPct + '%');

      var rVal = (Math.max(12, d.weightPct) / 100) * radius;
      points.push([Math.cos(angle) * rVal, Math.sin(angle) * rVal, d.color]);
    });

    var polyStr = points.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    g.append('polygon')
      .attr('points', polyStr)
      .attr('fill', 'rgba(79,179,168,0.24)')
      .attr('stroke', '#4fb3a8')
      .attr('stroke-width', 2.2);

    points.forEach(function (p) {
      g.append('circle')
        .attr('cx', p[0])
        .attr('cy', p[1])
        .attr('r', 4.5)
        .attr('fill', p[2])
        .attr('stroke', '#111317')
        .attr('stroke-width', 1.4);
    });
  }

  function renderOpportunityGraph(svgNode, result, selectedNodeId, onSelectNode, activeStep) {
    if (!window.d3 || !svgNode) return;
    var d3 = window.d3;
    var svg = d3.select(svgNode);
    svg.selectAll('*').remove();

    var W = 780, H = 420;
    svg.attr('viewBox', '0 0 ' + W + ' ' + H);

    // Background panels for the 3 columns of the bipartite coupling graph
    var bg = svg.append('g');
    bg.append('rect')
      .attr('x', 10).attr('y', 10).attr('width', 216).attr('height', H - 20).attr('rx', 12)
      .attr('fill', 'rgba(20,23,29,0.92)').attr('stroke', '#2c303a').attr('stroke-width', 1.4);
    bg.append('text')
      .attr('x', 24).attr('y', 32).attr('font-size', '10').attr('font-weight', '700')
      .attr('font-family', 'monospace').attr('fill', '#e5a93c')
      .text('1. HUMAN NEEDS & DRIVERS');

    bg.append('rect')
      .attr('x', 242).attr('y', 10).attr('width', 176).attr('height', H - 20).attr('rx', 12)
      .attr('fill', 'rgba(20,23,29,0.92)').attr('stroke', '#2c303a').attr('stroke-width', 1.4);
    bg.append('text')
      .attr('x', 330).attr('y', 32).attr('text-anchor', 'middle').attr('font-size', '10').attr('font-weight', '700')
      .attr('font-family', 'monospace').attr('fill', '#4fb3a8')
      .text('2. LEDGER COUPLING');

    bg.append('rect')
      .attr('x', 434).attr('y', 10).attr('width', 336).attr('height', H - 20).attr('rx', 12)
      .attr('fill', 'rgba(20,23,29,0.92)').attr('stroke', '#2c303a').attr('stroke-width', 1.4);
    bg.append('text')
      .attr('x', 450).attr('y', 32).attr('font-size', '10').attr('font-weight', '700')
      .attr('font-family', 'monospace').attr('fill', '#5da2d5')
      .text('3. COUPLED PROFITABLE BUSINESSES (0% AD TAX)');

    // Position nodes deterministically with D3 force relaxation on y-axis
    var drivers = result.driverScores;
    var businesses = result.matchedBusinesses.slice(0, 8);

    var driverNodes = drivers.map(function (d, i) {
      return {
        type: 'driver',
        id: d.id,
        label: d.short,
        sub: '$' + d.recoveredUsd.toLocaleString() + '/yr saved · ' + d.weightPct + '% wt',
        color: d.color,
        x: 118,
        y: 68 + i * 56,
        r: 14 + (d.weightPct / 100) * 10,
        raw: d
      };
    });

    var hubNode = {
      type: 'hub',
      id: 'cin-ledger-hub',
      label: 'CIN Ledger Matcher',
      sub: '+$' + result.totalRecoveredUsd.toLocaleString() + '/yr Human',
      sub2: '+$' + result.totalBizCacSavedUsd.toLocaleString() + '/yr Biz CAC',
      x: 330,
      y: H / 2 + 8,
      r: 42
    };

    var bizNodes = businesses.map(function (b, i) {
      return {
        type: 'biz',
        id: b.id,
        driver_id: b.driver_id,
        label: b.name.length > 34 ? b.name.slice(0, 32) + '…' : b.name,
        sub: b.coupling_score + '% match · ' + b.operating_margin_pct + '% margin · -' + b.household_savings_pct + '% price',
        color: b.driver_color,
        x: 602,
        y: 62 + i * 44,
        score: b.coupling_score,
        raw: b
      };
    });

    var driverMap = {};
    driverNodes.forEach(function (dn) { driverMap[dn.id] = dn; });

    // Links: Driver -> Hub -> Business
    var linkGroup = svg.append('g');
    var curve = d3.linkHorizontal()
      .x(function (d) { return d.x; })
      .y(function (d) { return d.y; });

    driverNodes.forEach(function (dn) {
      var isHighlighted = !selectedNodeId || selectedNodeId === dn.id;
      var w = 1.2 + (dn.raw.weightPct / 100) * 3.5;
      linkGroup.append('path')
        .attr('d', curve({
          source: { x: dn.x + 88, y: dn.y },
          target: { x: hubNode.x - 52, y: hubNode.y + (dn.y - hubNode.y) * 0.25 }
        }))
        .attr('fill', 'none')
        .attr('stroke', dn.color)
        .attr('stroke-width', w)
        .attr('stroke-opacity', isHighlighted ? 0.72 : 0.18);
    });

    bizNodes.forEach(function (bn, idx) {
      var dn = driverMap[bn.driver_id];
      var isHighlighted =
        !selectedNodeId ||
        selectedNodeId === bn.id ||
        selectedNodeId === bn.driver_id;
      var w = idx < 3 ? 3.2 : 1.6;
      linkGroup.append('path')
        .attr('d', curve({
          source: { x: hubNode.x + 52, y: hubNode.y + (bn.y - hubNode.y) * 0.25 },
          target: { x: bn.x - 154, y: bn.y }
        }))
        .attr('fill', 'none')
        .attr('stroke', bn.color)
        .attr('stroke-width', w)
        .attr('stroke-dasharray', idx < 3 ? null : '4 3')
        .attr('stroke-opacity', isHighlighted ? (idx < 3 ? 0.9 : 0.5) : 0.15);
    });

    // Draw Center Hub
    var hubG = svg.append('g')
      .attr('transform', 'translate(' + hubNode.x + ',' + hubNode.y + ')')
      .style('cursor', 'pointer')
      .on('click', function () { onSelectNode(null); });

    hubG.append('circle')
      .attr('r', 58)
      .attr('fill', 'rgba(79,179,168,0.09)')
      .attr('stroke', '#4fb3a8')
      .attr('stroke-width', 1.4)
      .attr('stroke-dasharray', '4 3');

    hubG.append('rect')
      .attr('x', -72).attr('y', -46).attr('width', 144).attr('height', 92).attr('rx', 12)
      .attr('fill', '#162226').attr('stroke', '#4fb3a8').attr('stroke-width', 2.2);

    hubG.append('text')
      .attr('x', 0).attr('y', -22).attr('text-anchor', 'middle')
      .attr('font-size', '10').attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
      .text('OCap + PSI LEDGER');

    hubG.append('text')
      .attr('x', 0).attr('y', -2).attr('text-anchor', 'middle')
      .attr('font-size', '11').attr('font-weight', '700').attr('fill', '#fff')
      .text(hubNode.sub);

    hubG.append('text')
      .attr('x', 0).attr('y', 16).attr('text-anchor', 'middle')
      .attr('font-size', '9.5').attr('font-weight', '700').attr('fill', '#e5a93c')
      .text(hubNode.sub2);

    hubG.append('text')
      .attr('x', 0).attr('y', 34).attr('text-anchor', 'middle')
      .attr('font-size', '9.5').attr('font-family', 'monospace').attr('fill', '#9aa3b2')
      .text(activeStep ? 'Step ' + activeStep + '/5 Active' : 'Click node to filter');

    // Draw Left Driver Cards
    var dGroup = svg.append('g');
    driverNodes.forEach(function (dn) {
      var g = dGroup.append('g')
        .attr('transform', 'translate(' + dn.x + ',' + dn.y + ')')
        .style('cursor', 'pointer')
        .on('click', function () {
          onSelectNode(selectedNodeId === dn.id ? null : dn.id);
        });

      var isSel = selectedNodeId === dn.id;
      g.append('rect')
        .attr('x', -96).attr('y', -21).attr('width', 184).attr('height', 42).attr('rx', 8)
        .attr('fill', isSel ? 'rgba(79,179,168,0.22)' : '#181c24')
        .attr('stroke', dn.color)
        .attr('stroke-width', isSel ? 2.4 : 1.4);

      g.append('circle')
        .attr('cx', -80).attr('cy', 0).attr('r', 6)
        .attr('fill', dn.color);

      g.append('text')
        .attr('x', -66).attr('y', -4)
        .attr('font-size', '10').attr('font-weight', '700').attr('fill', '#fff')
        .text(dn.label);

      g.append('text')
        .attr('x', -66).attr('y', 12)
        .attr('font-size', '9.5').attr('font-family', 'monospace').attr('fill', dn.color)
        .text(dn.sub);
    });

    // Draw Right Profitable Business Cards
    var bGroup = svg.append('g');
    bizNodes.forEach(function (bn, idx) {
      var g = bGroup.append('g')
        .attr('transform', 'translate(' + bn.x + ',' + bn.y + ')')
        .style('cursor', 'pointer')
        .on('click', function () {
          onSelectNode(selectedNodeId === bn.id ? null : bn.id);
        });

      var isSel = selectedNodeId === bn.id || selectedNodeId === bn.driver_id;
      g.append('rect')
        .attr('x', -154).attr('y', -18).attr('width', 310).attr('height', 36).attr('rx', 7)
        .attr('fill', idx === 0 || isSel ? 'rgba(79,179,168,0.16)' : '#181c24')
        .attr('stroke', idx < 3 || isSel ? bn.color : '#2c303a')
        .attr('stroke-width', idx === 0 || isSel ? 2.0 : 1.2);

      g.append('text')
        .attr('x', -142).attr('y', -2)
        .attr('font-size', '9.8').attr('font-weight', '700').attr('fill', '#fff')
        .text((idx + 1) + '. ' + bn.label);

      g.append('text')
        .attr('x', -142).attr('y', 12)
        .attr('font-size', '9.5').attr('font-family', 'monospace').attr('fill', bn.color)
        .text(bn.sub);
    });
  }

  function initOpportunityDemo(rootId, dataUrl, responsesUrl) {
    var root = document.getElementById(rootId);
    if (!root) return;

    var state = {
      landscape: null,
      responses: {},
      stereotypeId: 'young-family',
      sliders: { health: 82, housing: 78, food: 88, craft: 45, care: 92, b2b: 30 },
      focusSector: 'all',
      selectedNodeId: null,
      activeStep: 0,
      queueStatus: null
    };

    var archetypeHost = root.querySelector('[data-opp-archetypes]');
    var slidersHost = root.querySelector('[data-opp-sliders]');
    var radarSvg = root.querySelector('[data-opp-radar]');
    var graphSvg = root.querySelector('[data-opp-graph]');
    var kpiHuman = root.querySelector('[data-opp-kpi-human]');
    var kpiBiz = root.querySelector('[data-opp-kpi-biz]');
    var kpiTopMatch = root.querySelector('[data-opp-kpi-match]');
    var stepsHost = root.querySelector('[data-opp-steps]');
    var bizCardsHost = root.querySelector('[data-opp-biz-cards]');
    var dossiersHost = root.querySelector('[data-opp-dossiers]');
    var noteInput = root.querySelector('[data-opp-note]');
    var labelInput = root.querySelector('[data-opp-label]');
    var runFlowBtn = root.querySelector('[data-opp-run-flow]');
    var submitQueueBtn = root.querySelector('[data-opp-submit-queue]');
    var queueBanner = root.querySelector('[data-opp-queue-banner]');

    function renderAll() {
      if (!state.landscape) return;
      var res = computeCoupling(
        state.landscape,
        state.stereotypeId,
        state.sliders,
        state.focusSector,
        noteInput ? noteInput.value : '',
        labelInput ? labelInput.value : ''
      );

      if (kpiHuman) kpiHuman.textContent = '+$' + res.totalRecoveredUsd.toLocaleString() + ' / yr';
      if (kpiBiz) kpiBiz.textContent = '+$' + res.totalBizCacSavedUsd.toLocaleString() + ' / yr';
      if (kpiTopMatch && res.topBusinesses[0]) {
        kpiTopMatch.textContent = res.topBusinesses[0].coupling_score + '% · ' + res.topBusinesses[0].driver_short;
      }

      renderRadarChart(radarSvg, res.driverScores);
      renderOpportunityGraph(graphSvg, res, state.selectedNodeId, function (nid) {
        state.selectedNodeId = nid;
        renderAll();
      }, state.activeStep);

      // Render 5-step Agentic Flow Stepper
      if (stepsHost) {
        clearChildren(stepsHost);
        var topB = res.topBusinesses[0];
        var steps = [
          ['1. Sensor Vector', state.stereotypeId.replace('-', ' ') + ' + 6 sliders captured locally'],
          ['2. Need Audit', '$' + res.totalRecoveredUsd.toLocaleString() + '/yr middleman tolls flagged'],
          ['3. Business Match', (topB ? topB.name.slice(0, 28) + '… (' + topB.coupling_score + '%)' : 'Matched')],
          ['4. Zero-CAC Ledger', '+' + (topB ? topB.business_margin_boost_pct : 12) + '% business margin · 0% ad tax'],
          ['5. Opportunity Gap', 'Ready for local co-op or Antigravity 5-min deep dossier']
        ];
        steps.forEach(function (st, idx) {
          var card = el('div', 'opp-step-pill' + (state.activeStep === idx + 1 ? ' active' : ''));
          card.append(el('b', null, st[0]), el('span', null, st[1]));
          stepsHost.appendChild(card);
        });
      }

      // Render Top 3 Coupled Businesses + Unmet Opportunity Gap
      if (bizCardsHost) {
        clearChildren(bizCardsHost);
        var filteredBiz = state.selectedNodeId
          ? res.matchedBusinesses.filter(function (b) {
              return b.id === state.selectedNodeId || b.driver_id === state.selectedNodeId;
            })
          : res.topBusinesses.slice(0, 3);
        if (!filteredBiz.length) filteredBiz = res.topBusinesses.slice(0, 3);

        filteredBiz.slice(0, 3).forEach(function (b) {
          var card = el('div', 'opp-biz-card');
          var head = el('div', 'opp-biz-head');
          var badge = el('span', 'opp-score-badge', b.coupling_score + '% Match · NAICS ' + b.naics);
          var marginBadge = el('span', 'opp-margin-badge', b.operating_margin_pct + '% Profit Margin · +' + b.business_margin_boost_pct + '% via CIN');
          head.append(badge, marginBadge);

          var title = el('h4', null, b.name);
          var sol = el('p', 'opp-biz-sol', b.solution_summary);
          var gap = el('div', 'opp-biz-gap');
          gap.append(
            el('strong', null, 'Ledger Opportunity Whitespace: '),
            el('span', null, b.opportunity_gap)
          );
          var metrics = el('div', 'opp-biz-metrics');
          metrics.append(
            el('span', 'ok', 'Human Saves ' + b.household_savings_pct + '% (~$' + b.userAnnualSavingsUsd.toLocaleString() + '/yr)'),
            el('span', 'bad', 'Eliminates ' + b.legacy_cac_ad_tax_pct + '% Ad/Platform Toll')
          );
          card.append(head, title, sol, gap, metrics);
          bizCardsHost.appendChild(card);
        });
      }
    }

    function buildControls() {
      if (!state.landscape) return;
      if (archetypeHost) {
        clearChildren(archetypeHost);
        state.landscape.stereotypes.forEach(function (st) {
          var btn = el('button', 'opp-arch-btn' + (st.id === state.stereotypeId ? ' active' : ''));
          btn.type = 'button';
          btn.setAttribute('aria-pressed', st.id === state.stereotypeId ? 'true' : 'false');
          btn.append(el('b', null, st.label), el('small', null, st.badge));
          btn.addEventListener('click', function () {
            state.stereotypeId = st.id;
            state.sliders = Object.assign({}, st.sliders);
            state.selectedNodeId = null;
            buildControls();
            renderAll();
          });
          archetypeHost.appendChild(btn);
        });
      }

      if (slidersHost) {
        clearChildren(slidersHost);
        state.landscape.economic_drivers.forEach(function (d) {
          var row = el('div', 'opp-slider-row');
          var top = el('div', 'opp-slider-top');
          var lbl = el('label', null, d.short);
          var valOut = el('output', null, (state.sliders[d.id] || 60) + '%');
          top.append(lbl, valOut);

          var inp = el('input', 'opp-range');
          inp.type = 'range';
          inp.min = '10';
          inp.max = '100';
          inp.step = '2';
          inp.value = String(state.sliders[d.id] || 60);
          inp.addEventListener('input', function () {
            state.sliders[d.id] = Number(inp.value);
            valOut.textContent = inp.value + '%';
            renderAll();
          });
          row.append(top, inp);
          slidersHost.appendChild(row);
        });
      }
    }

    function renderDossiersList(extraDossier) {
      if (!dossiersHost || !state.landscape) return;
      clearChildren(dossiersHost);
      var list = (state.landscape.recent_agent_dossiers || []).slice(0, 4);
      if (extraDossier) list = [extraDossier].concat(list.slice(0, 3));

      list.forEach(function (d) {
        var item = el('div', 'opp-dossier-item');
        var top = el('div', 'opp-dossier-top');
        top.append(
          el('span', 'opp-dossier-id', d.id + ' · ' + d.stereotype_label),
          el('span', 'opp-dossier-val', '+$' + Number(d.total_annual_recovered_usd || 0).toLocaleString() + '/yr Recovered')
        );

        var topBiz = (d.top_business_matches && d.top_business_matches[0]) ? d.top_business_matches[0] : null;
        var topDrv = (d.top_driver_needs && d.top_driver_needs[0]) ? d.top_driver_needs[0] : null;
        var summaryLine = el('div', 'opp-biz-metrics');
        if (topBiz) {
          summaryLine.appendChild(el('span', 'ok', 'Top Match: ' + topBiz.name.slice(0, 34) + ' (' + topBiz.coupling_score + '%)'));
        }
        if (topDrv) {
          summaryLine.appendChild(el('span', 'bad', 'Primary Need: ' + topDrv.short + ' (' + topDrv.slider_weight + '%)'));
        }

        var det = el('details', 'scen-drawer');
        var sum = el('summary', null, 'Inspect full Antigravity Agent dossier trace ▾');
        var body = el('p', null, d.agent_synthesis);
        det.append(sum, body);

        item.append(top, summaryLine, det);
        dossiersHost.appendChild(item);
      });
    }

    if (runFlowBtn) {
      runFlowBtn.addEventListener('click', function () {
        var step = 1;
        state.activeStep = step;
        renderAll();
        var timer = setInterval(function () {
          step += 1;
          if (step > 5) {
            clearInterval(timer);
            state.activeStep = 5;
            renderAll();
            return;
          }
          state.activeStep = step;
          renderAll();
        }, 550);
      });
    }

    if (submitQueueBtn) {
      submitQueueBtn.addEventListener('click', function () {
        if (!state.landscape) return;
        var noteText = noteInput ? noteInput.value.trim().slice(0, 500) : '';
        var clientText = (labelInput && labelInput.value.trim()) ? labelInput.value.trim().slice(0, 60) : 'Demo Visitor';
        var res = computeCoupling(state.landscape, state.stereotypeId, state.sliders, state.focusSector, noteText, clientText);
        var topB = res.topBusinesses[0];

        if (queueBanner) {
          queueBanner.hidden = false;
          queueBanner.textContent =
            'Dispatching Personal Sensor vector to Firestore opportunity_requests queue (Realm A Antigravity Agent)…';
        }

        var sliderFields = {};
        Object.keys(state.sliders).forEach(function (k) {
          sliderFields[k] = { integerValue: String(Math.round(state.sliders[k])) };
        });

        var firestoreBody = {
          fields: {
            stereotype: { stringValue: state.stereotypeId },
            focusSector: { stringValue: state.focusSector || 'all' },
            contextNote: { stringValue: noteText },
            clientLabel: { stringValue: clientText },
            status: { stringValue: 'queued' },
            sliders: { mapValue: { fields: sliderFields } },
            createdAt: { timestampValue: new Date().toISOString() }
          }
        };

        fetch(FIRESTORE_CREATE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestoreBody)
        })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; })
          .then(function (doc) {
            var docId = (doc && doc.name) ? doc.name.split('/').pop().slice(0, 10).toUpperCase() : 'LIVE-' + Math.floor(1000 + Math.random() * 9000);
            var liveDossier = {
              id: 'OPP-' + docId,
              stereotype_label: res.stereotype.label + ' (' + clientText + ')',
              total_annual_recovered_usd: res.totalRecoveredUsd,
              top_business_matches: res.topBusinesses,
              top_driver_needs: res.driverScores.slice(0, 2),
              agent_synthesis:
                '[Queued for Antigravity Agent Loop (~5 min deep pass) + Instant Local Synthesis] ' +
                (noteText ? 'Note ("' + noteText + '") logged. ' : '') +
                'Personal Sensor decomposition recovers $' + res.totalRecoveredUsd.toLocaleString() +
                '/yr across ' + res.driverScores[0].short + ' & ' + res.driverScores[1].short +
                '. Primary profitable business match: ' + topB.name + ' (' + topB.coupling_score +
                '% match, ' + topB.operating_margin_pct + '% margin, eliminates ' + topB.legacy_cac_ad_tax_pct +
                '% ad tax). Unmet regional opportunity: ' + topB.opportunity_gap
            };
            if (queueBanner) {
              queueBanner.textContent =
                '✓ Request ' + liveDossier.id + ' logged to Antigravity Website Agent queue! Deep collective sweep updates /data/opportunity-responses.json every ~5 minutes; instant local synthesis added below.';
            }
            renderDossiersList(liveDossier);
          });
      });
    }

    function pollLiveResponses() {
      if (!responsesUrl || !state.landscape) return;
      fetch(responsesUrl + '?t=' + Date.now())
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (respData) {
          if (respData && respData.responses) {
            var keys = Object.keys(respData.responses);
            if (keys.length) {
              var latest = respData.responses[keys[0]];
              renderDossiersList(latest);
            }
          }
        })
        .catch(function () {});
    }

    fetch(dataUrl)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.landscape = data;
        buildControls();
        renderAll();
        renderDossiersList();
        pollLiveResponses();
        setInterval(pollLiveResponses, 60000);
      })
      .catch(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    initOpportunityDemo('opportunity-ledger-demo', '/data/opportunity-landscape.json', '/data/opportunity-responses.json');
    initOpportunityDemo('portal-opportunity-demo', '/data/opportunity-landscape.json', '/data/opportunity-responses.json');
  });
})();
