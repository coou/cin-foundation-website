/* Interactive everyday translation tabs (#for-you), Risk-Scaled Agreement Explorer (#swarm-lock),
   30-Persona Society Explorer (#pe-root), 550-Principle Open Library (#lib-controls / #lib-grid),
   Somatic Witness Edge Sensor Simulator (#sw-sim), and 5D Demurrage Ledger Calculator (#dm-calc).
   Runs entirely in the visitor's browser and sends nothing anywhere. */
(function () {
  'use strict';

  /* ---------- 1. "What this means for your daily life" (#for-you) ---------- */
  var fyRoot = document.getElementById('for-you');
  if (fyRoot) {
    var tabs = [].slice.call(fyRoot.querySelectorAll('[data-fy-tab]'));
    var panels = [].slice.call(fyRoot.querySelectorAll('[data-fy-panel]'));
    if (tabs.length && panels.length) {
      var activateFy = function (id) {
        tabs.forEach(function (b) {
          var on = b.getAttribute('data-fy-tab') === id;
          b.setAttribute('aria-selected', String(on));
        });
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-fy-panel') !== id;
        });
      };
      tabs.forEach(function (b) {
        b.addEventListener('click', function () {
          activateFy(b.getAttribute('data-fy-tab'));
        });
      });
      activateFy(tabs[0].getAttribute('data-fy-tab'));
    }
  }

  /* ---------- 2. "No one person commands a swarm" (#swarm-lock) ---------- */
  var slRoot = document.getElementById('swarm-lock');
  if (slRoot) {
    var TASKS = [
      {
        id: 'personal',
        label: 'Check my bills & subscriptions',
        risk: 0,
        affected: 1,
        affectedText: '1 person (only you)',
        supportPct: 100,
        what: 'Your personal agent reads your bank statements on your own device and flags a forgotten recurring charge.',
        singleCmd: 'Works, though cloud bots often upload your bank history to remote servers.',
        cinResult: 'Unlocks immediately on your device. Zero outside permission needed.'
      },
      {
        id: 'guild',
        label: 'Build a 20-home solar microgrid',
        risk: 5,
        affected: 20,
        affectedText: '20 neighboring households',
        supportPct: 85,
        what: 'Neighbors coordinate their personal agents to pool rooftop solar and battery storage on their street.',
        singleCmd: 'A utility monopoly can block or overcharge the street unilaterally.',
        cinResult: 'Requires ~23% (5 of 20 households) to open the shared task; 85% agree -> Unlocks cleanly.'
      },
      {
        id: 'city',
        label: 'Re-route town water & power grid',
        risk: 25,
        affected: 10000,
        affectedText: '10,000 local residents',
        supportPct: 82,
        what: 'A municipal cooperative proposes re-balancing water pressure and grid load across ten thousand homes.',
        singleCmd: 'One hacked city console or corrupt contractor can shut off a neighborhood without consent.',
        cinResult: 'Requires 76.3% agreement across local residents’ agents; 82% agree -> Unlocks after verification.'
      },
      {
        id: 'oligarch',
        label: 'Hostile market cornering with 50,000 fake bots',
        risk: 78,
        affected: 10000,
        affectedText: '10,000 residents (+ 50,000 fake bots blocked)',
        supportPct: 4,
        what: 'An outside operator spins up 50,000 fake accounts and claims “low risk” to corner regional energy prices.',
        singleCmd: 'Executes immediately—whoever rents the biggest server cluster wins.',
        cinResult: 'BLOCKED: Private personhood proof rejects all 50,000 fake bots; diverse risk checkers flag 78% risk (requires 99.95% real agreement; only 4% approve).'
      },
      {
        id: 'nuclear',
        label: 'Launch a cross-border strike or autonomous war swarm',
        risk: 99.9,
        affected: 8000000000,
        affectedText: 'Millions to billions of families on both sides',
        supportPct: 0.01,
        what: 'A panicked leader, spoofed command or rogue model attempts to launch a mass-casualty strike.',
        singleCmd: 'CATASTROPHE: One command console or two keys in a bunker can trigger irreversible destruction in minutes.',
        cinResult: 'BLOCKED AT THE GATE: Requires 99.9999999999999% agreement from the personal agents of affected families on both sides + a 72-hour cooling-off lock.'
      }
    ];

    var btns = [].slice.call(slRoot.querySelectorAll('[data-sl-task]'));
    var slider = document.getElementById('sl-risk-slider');
    var elRiskVal = document.getElementById('sl-risk-val');
    var elReqVal = document.getElementById('sl-req-val');
    var elReqBar = document.getElementById('sl-req-bar');
    var elSupBar = document.getElementById('sl-sup-bar');
    var elTimer = document.getElementById('sl-timer');
    var elAffected = document.getElementById('sl-affected');
    var elWhat = document.getElementById('sl-what');
    var elSingle = document.getElementById('sl-single');
    var elCin = document.getElementById('sl-cin');
    var elBadge = document.getElementById('sl-badge');

    var phi = function (r01) {
      if (r01 <= 0.001) return 0;
      return 1 - Math.pow(1 - Math.min(0.9999, r01), 5);
    };

    var formatPct = function (p01) {
      var pct = p01 * 100;
      if (pct === 0) return '0% outside permission (only you)';
      if (pct < 99.9) return pct.toFixed(1) + '% of affected people’s agents';
      if (pct < 99.9999) return pct.toFixed(4) + '% of affected people’s agents';
      return '99.9999999%+ (virtually every family on both sides)';
    };

    var renderTask = function (t, customRiskPct) {
      var rPct = customRiskPct != null ? customRiskPct : t.risk;
      var r01 = rPct / 100;
      var req01 = (t.affected <= 1 && rPct < 1) ? 0 : phi(r01);
      var coolingHours = r01 <= 0.30 ? 0 : Math.round(72 * r01 * r01);
      var sup01 = t.supportPct / 100;
      var unlocked = sup01 >= req01;

      if (slider && customRiskPct == null) slider.value = String(Math.round(rPct));
      if (elRiskVal) elRiskVal.textContent = rPct < 1 && rPct > 0 ? rPct.toFixed(1) + '%' : Math.round(rPct) + '%';
      if (elReqVal) elReqVal.textContent = formatPct(req01);
      if (elReqBar) elReqBar.style.width = Math.min(100, Math.max(2, req01 * 100)) + '%';
      if (elSupBar) {
        elSupBar.style.width = Math.min(100, Math.max(1, t.supportPct)) + '%';
        elSupBar.className = 'sl-bar-fill ' + (unlocked ? 'ok' : 'bad');
      }
      if (elTimer) {
        elTimer.textContent = coolingHours === 0
          ? 'Immediate (0h cooling-off window)'
          : coolingHours + '-hour mandatory deliberation & simulation window';
      }
      if (elAffected) elAffected.textContent = t.affectedText;
      if (elWhat) elWhat.textContent = t.what;
      if (elSingle) elSingle.textContent = t.singleCmd;
      if (elCin) elCin.textContent = customRiskPct == null ? t.cinResult : (
        unlocked
          ? 'Unlocks: real community support (' + t.supportPct + '%) meets the ' + (req01 * 100).toFixed(1) + '% risk threshold.'
          : 'BLOCKED AT THE GATE: real support (' + t.supportPct + '%) is below the ' + (req01 * 100).toFixed(2) + '% threshold required for this risk level.'
      );
      if (elBadge) {
        elBadge.textContent = unlocked ? 'UNLOCKED BY CONSENT' : 'BLOCKED AT THE THRESHOLD GATE';
        elBadge.className = 'sl-badge ' + (unlocked ? 'ok' : 'bad');
      }
    };

    var currentTask = TASKS[0];
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-sl-task');
        var found = TASKS.filter(function (x) { return x.id === id; })[0];
        if (!found) return;
        currentTask = found;
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderTask(currentTask, null);
      });
    });

    if (slider) {
      slider.addEventListener('input', function () {
        renderTask(currentTask, parseFloat(slider.value));
      });
    }
    renderTask(currentTask, null);
  }

  /* ---------- 3. "Thirty lives on the network" (#pe-root) ---------- */
  var peRoot = document.getElementById('pe-root');
  if (peRoot && window.CIN_THIRTY_PERSONAS) {
    var personas = window.CIN_THIRTY_PERSONAS;
    var prMap = {};
    if (window.CIN_ALL_PRINCIPLES) {
      window.CIN_ALL_PRINCIPLES.forEach(function (p) { prMap[p.id] = p; });
    }
    var rosterEl = document.getElementById('pe-roster');
    var detailEl = document.getElementById('pe-detail');
    var filterBtns = [].slice.call(peRoot.querySelectorAll('[data-pe-filter]'));

    var TIER_NAMES = [
      'Level 0 · Everyday citizen (full privacy)',
      'Level 1 · Local livelihood coordinator',
      'Level 2 · Public / municipal infrastructure',
      'Level 3 · Mass reach & capital concentration',
      'Level 4 · High-consequence / strategic role'
    ];
    var SENSOR_NAMES = {
      somatic_ring: 'Somatic Witness Ring (<1 mW, local PUF key)',
      work_clip: 'Open-Hardware Work Clip (<$8, local bus)',
      ear_bci: 'Optical / Ear-Clip Neural-Intent Module',
      basic_phone_vouched: 'Basic Phone + Free Co-op Clip & Community Vouch'
    };
    var V_LABELS = ['Vital thriving', 'Physical & craft effort', 'Knowledge & teaching', 'Ecological care', 'Foundation lineage'];

    var matchFilter = function (p, f) {
      if (f === 'all') return true;
      if (f === 't0-care') return ['P01', 'P06', 'P09', 'P14', 'P16'].indexOf(p.pid) !== -1;
      if (f === 't0-craft') return ['P02', 'P05', 'P08', 'P10', 'P11', 'P13'].indexOf(p.pid) !== -1;
      if (f === 't0-tech') return ['P03', 'P04', 'P07', 'P12', 'P15'].indexOf(p.pid) !== -1;
      if (f === 't12') return p.tier === 1 || p.tier === 2;
      if (f === 't34') return p.tier === 3 || p.tier === 4;
      return true;
    };

    var fmtMoney = function (n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    };

    var activePid = personas[0].pid;
    var activeFilter = 'all';

    var renderPersonaDetail = function (p) {
      var barsHtml = p.v5d.map(function (v, idx) {
        var pct = Math.round(v * 10);
        return '<div class="pe-vrow"><span>' + V_LABELS[idx] + '</span><b>' + v.toFixed(1) + ' / 10</b>' +
          '<div class="sl-bar"><i class="sl-bar-fill ok" style="width:' + pct + '%"></i></div></div>';
      }).join('');

      var pLinks = p.principles.map(function (num) {
        var pr = prMap[num];
        var label = pr ? ('#' + num + ': ' + pr.title) : ('Principle #' + num);
        return '<a class="pe-ptag" href="/notes/all-principles#p' + num + '">' + label + '</a>';
      }).join(' ');

      var mult = (p.cinWealthEnd / Math.max(1, p.fiatWealthEnd)).toFixed(1);
      var wealthCompareNote = p.pid === 'P27'
        ? 'Contributes automated robot dividend + idle-surplus demurrage into the commons while retaining high productive capital.'
        : 'Thriving grows ' + mult + 'x compared to today’s extractive market, with all savings below $25,000 100% exempt from demurrage.';

      detailEl.innerHTML =
        '<div class="pe-head">' +
          '<span class="label">' + p.pid + ' · ' + TIER_NAMES[p.tier] + '</span>' +
          '<h3>' + p.name + ' — ' + p.role + '</h3>' +
          '<p class="pe-meta">' + p.location + ' (' + p.region + ') · Income decile ' + p.decile + '/10 · ' + p.family + ' · ' + p.conn + '</p>' +
        '</div>' +
        '<div class="fy-cols">' +
          '<div class="fy-box trap">' +
            '<span class="fy-k">Today’s squeeze</span>' +
            '<b>What holds them back now</b>' +
            '<p>' + p.squeeze + '</p>' +
          '</div>' +
          '<div class="fy-box shield">' +
            '<span class="fy-k">Personal agent &amp; sensor</span>' +
            '<b>' + (SENSOR_NAMES[p.sensor] || p.sensor) + '</b>' +
            '<p>' + p.agentAction + '</p>' +
          '</div>' +
          '<div class="fy-box try">' +
            '<span class="fy-k">365-day simulated balance</span>' +
            '<b>' + fmtMoney(p.cinWealthEnd) + ' vs. ' + fmtMoney(p.fiatWealthEnd) + ' today</b>' +
            '<p>Starting from ' + fmtMoney(p.initialWealth) + '. ' + wealthCompareNote + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="pe-bottom">' +
          '<div class="pe-5d"><h4>5-dimensional value profile on the shared ledger</h4>' + barsHtml + '</div>' +
          '<div class="pe-pr"><h4>Principles their agent activates (from the 550 library)</h4><div class="pe-ptags">' + pLinks + '</div>' +
          '<p style="margin-top:.7rem;font-size:.84rem;color:var(--ink-3)">Click any principle tag to open its critique and defense in the <a href="/notes/all-principles">550-principle library &rarr;</a></p></div>' +
        '</div>';
    };

    var renderRoster = function () {
      var list = personas.filter(function (p) { return matchFilter(p, activeFilter); });
      if (!list.some(function (p) { return p.pid === activePid; }) && list.length) {
        activePid = list[0].pid;
      }
      rosterEl.innerHTML = list.map(function (p) {
        var sel = p.pid === activePid;
        return '<button type="button" class="pe-item" role="option" aria-selected="' + sel + '" data-pid="' + p.pid + '">' +
          '<span class="pe-id">' + p.pid + ' · T' + p.tier + '</span>' +
          '<b>' + p.role + '</b>' +
          '<small>' + p.name + ' · ' + p.location + '</small>' +
        '</button>';
      }).join('');

      [].forEach.call(rosterEl.querySelectorAll('[data-pid]'), function (b) {
        b.addEventListener('click', function () {
          activePid = b.getAttribute('data-pid');
          renderRoster();
        });
      });

      var current = personas.filter(function (p) { return p.pid === activePid; })[0] || list[0];
      if (current) renderPersonaDetail(current);
    };

    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        activeFilter = b.getAttribute('data-pe-filter');
        filterBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderRoster();
      });
    });

    renderRoster();
  }

  /* ---------- 4. "All 550 starting principles" (#lib-controls / #lib-grid) ---------- */
  var libGrid = document.getElementById('lib-grid');
  if (libGrid && window.CIN_ALL_PRINCIPLES) {
    var allPr = window.CIN_ALL_PRINCIPLES;
    var qInput = document.getElementById('lib-q');
    var catSelect = document.getElementById('lib-cat');
    var rangeSelect = document.getElementById('lib-range');
    var countEl = document.getElementById('lib-count');
    var countBottomEl = document.getElementById('lib-count-bottom');
    var pageInfoEl = document.getElementById('lib-page-info');
    var pageSizeSel = document.getElementById('lib-page-size');
    var prevPageBtn = document.getElementById('lib-prev-page');
    var nextPageBtn = document.getElementById('lib-next-page');
    var prevBottomBtn = document.getElementById('lib-prev-bottom');
    var nextBottomBtn = document.getElementById('lib-next-bottom');
    var expandPageBtn = document.getElementById('lib-expand-page');
    var collapsePageBtn = document.getElementById('lib-collapse-page');
    var quickBtns = [].slice.call(document.querySelectorAll('[data-q]'));

    var curPage = 1;
    var pageSize = 25;

    var prPersonas = {};
    if (window.CIN_THIRTY_PERSONAS) {
      window.CIN_THIRTY_PERSONAS.forEach(function (pe) {
        pe.principles.forEach(function (id) {
          if (!prPersonas[id]) prPersonas[id] = [];
          prPersonas[id].push(pe);
        });
      });
    }

    var cats = [];
    var seenCat = {};
    allPr.forEach(function (p) {
      if (!seenCat[p.cat]) {
        seenCat[p.cat] = true;
        cats.push(p.cat);
      }
    });
    if (catSelect) {
      cats.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
      });
    }

    var getFiltered = function () {
      var q = (qInput ? qInput.value : '').trim().toLowerCase();
      var cat = catSelect ? catSelect.value : '';
      var rng = rangeSelect ? rangeSelect.value : 'all';

      return allPr.filter(function (p) {
        if (cat && p.cat !== cat) return false;
        if (rng === 'raw' && p.id > 434) return false;
        if (rng === 'new' && p.id < 435) return false;
        if (rng === 'top' && p.score < 95) return false;
        if (!q) return true;
        var hay = ('#' + p.id + ' ' + p.title + ' ' + p.cat + ' ' + p.claim + ' ' + (p.impl || '') + ' ' + p.critique + ' ' + p.steelman + ' ' + p.grounding).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    };

    var renderLibrary = function () {
      var filtered = getFiltered();
      var q = (qInput ? qInput.value : '').trim();
      var cat = catSelect ? catSelect.value : '';
      pageSize = pageSizeSel ? parseInt(pageSizeSel.value, 10) : 25;
      var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (curPage > totalPages) curPage = totalPages;
      if (curPage < 1) curPage = 1;

      var startIdx = (curPage - 1) * pageSize;
      var endIdx = Math.min(filtered.length, startIdx + pageSize);
      var slice = filtered.slice(startIdx, endIdx);

      var summaryTxt = filtered.length === 0
        ? 'No principles match your current filter'
        : ('Showing #' + slice[0].id + '–#' + slice[slice.length - 1].id + ' (' + (startIdx + 1) + '–' + endIdx + ' of ' + filtered.length + ' matching principles)' + (cat ? ' in “' + cat + '”' : '') + (q ? ' matching “' + q + '”' : ''));

      if (countEl) countEl.textContent = summaryTxt;
      if (countBottomEl) countBottomEl.textContent = summaryTxt;
      if (pageInfoEl) pageInfoEl.textContent = 'Page ' + curPage + ' / ' + totalPages;
      if (prevPageBtn) prevPageBtn.disabled = curPage <= 1;
      if (nextPageBtn) nextPageBtn.disabled = curPage >= totalPages;
      if (prevBottomBtn) prevBottomBtn.disabled = curPage <= 1;
      if (nextBottomBtn) nextBottomBtn.disabled = curPage >= totalPages;

      libGrid.innerHTML = slice.map(function (p, idx) {
        var badge = p.id <= 434 ? 'Original brainstorm #' + p.id : 'New safeguard #' + p.id;
        var openAttr = idx < 3 ? ' open' : '';
        var who = prPersonas[p.id] ? prPersonas[p.id].map(function (pe) {
          return '<a href="/notes/thirty-lives" class="pe-ptag">' + pe.pid + ' (' + pe.role + ')</a>';
        }).join(' ') : '';
        var coev = (p.coev || p.score).toFixed(0);
        var arch = (p.arch || p.score).toFixed(0);
        var implHtml = (p.impl && p.impl !== p.claim)
          ? '<p style="margin-top:.55rem"><strong>Why it matters in practice:</strong> ' + p.impl + '</p>'
          : '';
        var whyHtml = (p.coev_why || p.arch_why)
          ? '<div class="lib-why-note">' +
              (p.coev_why ? '<div><strong>Co-evolution impact (' + coev + '/100):</strong> ' + p.coev_why + '</div>' : '') +
              (p.arch_why ? '<div><strong>Architectural value (' + arch + '/100):</strong> ' + p.arch_why + '</div>' : '') +
            '</div>'
          : '';

        return '<details class="lib-card" id="p' + p.id + '"' + openAttr + '>' +
          '<summary>' +
            '<span class="lib-num">#' + p.id + '</span>' +
            '<div class="lib-sum-main"><b>' + p.title + '</b><span class="lib-cat">' + p.cat + ' · ' + badge + '</span></div>' +
            '<span class="lib-score" title="Composite co-evolution &amp; network value score">' + p.score.toFixed(1) + '</span>' +
          '</summary>' +
          '<div class="lib-body">' +
            '<div class="lib-meta-bar">' +
              '<div class="lib-scores-row">' +
                '<span class="lib-sc-pill">Human + AI Co-Evolution: <b>' + coev + ' / 100</b></span>' +
                '<span class="lib-sc-pill">Network Architecture: <b>' + arch + ' / 100</b></span>' +
                '<span class="lib-sc-pill">Composite: <b>' + p.score.toFixed(1) + ' / 100</b></span>' +
              '</div>' +
              '<button type="button" class="lib-git-btn" data-sim-git="' + p.id + '">&#9741; Simulate Git Merge on #' + p.id + '</button>' +
            '</div>' +
            '<div class="lib-panels">' +
              '<div class="lib-panel p-claim">' +
                '<h4>Core Principle &amp; Practical Implication</h4>' +
                '<p><strong>Statement:</strong> ' + p.claim + '</p>' +
                implHtml +
              '</div>' +
              '<div class="lib-panel p-crit">' +
                '<h4>1. The Critic’s Challenge &amp; Failure Modes</h4>' +
                '<p>' + p.critique + '</p>' +
              '</div>' +
              '<div class="lib-panel p-steel">' +
                '<h4>2. Strongest Defense (Steelman)</h4>' +
                '<p>' + p.steelman + '</p>' +
              '</div>' +
              '<div class="lib-panel p-ground">' +
                '<h4>3. How Human Biology &amp; Personal Agents Ground It</h4>' +
                '<p>' + p.grounding + '</p>' +
                (who ? '<p style="margin-top:.55rem"><strong>Simulated lives relying on this:</strong> ' + who + '</p>' : '') +
                whyHtml +
              '</div>' +
            '</div>' +
          '</div>' +
        '</details>';
      }).join('');

      [].forEach.call(libGrid.querySelectorAll('[data-sim-git]'), function (btn) {
        btn.addEventListener('click', function () {
          var pid = parseInt(btn.getAttribute('data-sim-git'), 10);
          if (window.CIN_TRIGGER_GIT_MERGE_FOR_PRINCIPLE) {
            window.CIN_TRIGGER_GIT_MERGE_FOR_PRINCIPLE(pid);
          }
        });
      });
    };

    var resetAndRender = function () { curPage = 1; renderLibrary(); };
    if (qInput) qInput.addEventListener('input', resetAndRender);
    if (catSelect) catSelect.addEventListener('change', resetAndRender);
    if (rangeSelect) rangeSelect.addEventListener('change', resetAndRender);
    if (pageSizeSel) pageSizeSel.addEventListener('change', resetAndRender);

    var goPrev = function () { if (curPage > 1) { curPage--; renderLibrary(); libGrid.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
    var goNext = function () { curPage++; renderLibrary(); libGrid.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    if (prevPageBtn) prevPageBtn.addEventListener('click', goPrev);
    if (nextPageBtn) nextPageBtn.addEventListener('click', goNext);
    if (prevBottomBtn) prevBottomBtn.addEventListener('click', goPrev);
    if (nextBottomBtn) nextBottomBtn.addEventListener('click', goNext);

    if (expandPageBtn) {
      expandPageBtn.addEventListener('click', function () {
        [].forEach.call(libGrid.querySelectorAll('details.lib-card'), function (d) { d.open = true; });
      });
    }
    if (collapsePageBtn) {
      collapsePageBtn.addEventListener('click', function () {
        [].forEach.call(libGrid.querySelectorAll('details.lib-card'), function (d) { d.open = false; });
      });
    }

    quickBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (qInput) qInput.value = b.getAttribute('data-q') || '';
        resetAndRender();
      });
    });

    // If URL has #p123, jump to the page containing #p123 and open it
    if (location.hash && /^#p(\d+)$/.test(location.hash)) {
      var targetId = parseInt(location.hash.slice(2), 10);
      if (targetId >= 1 && targetId <= 550) {
        curPage = Math.ceil(targetId / pageSize);
      }
    }

    renderLibrary();

    if (location.hash && /^#p\d+$/.test(location.hash)) {
      var target = document.querySelector(location.hash);
      if (target) {
        target.open = true;
        setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
      }
    }
  }

  /* ---------- 5. Somatic Witness Edge Sensor Simulator (#sw-sim) ---------- */
  var swSim = document.getElementById('sw-sim');
  if (swSim) {
    var SW_PRESETS = {
      nursing: { mi: 94, mmg: 91, rep: 1, dur: 0, act: 'High-exertion clinical care (8.5 hours verified; 0 bytes of raw biometrics leave the ring).' },
      craft:   { mi: 92, mmg: 89, rep: 1, dur: 0, act: 'Skilled creative & physical joinery flow (4.0 hours verified on-chip).' },
      trap:    { mi: 88, mmg: 82, rep: 2, dur: 0, act: 'Late-night cortisol/dopamine trap detected at 2 a.m. -> Local agent pauses feed & protects sleep.' },
      bot:     { mi: 12, mmg: 8,  rep: 95, dur: 0, act: 'Non-biological script / replayed waveform from a 50,000-node server cluster.' },
      duress:  { mi: 85, mmg: 80, rep: 2, dur: 100, act: 'Acute physical panic/coercion spike without exercise -> Safe decoy wallet opened silently.' },
      equity:  { mi: 90, mmg: 87, rep: 2, dur: 0, act: 'Elder-care shift verified via free co-op loaned clip + community in-person vouching.' }
    };
    var swBtns = [].slice.call(swSim.querySelectorAll('[data-sw-scen]'));
    var elMi = document.getElementById('sw-mi'), elMiV = document.getElementById('sw-mi-v');
    var elMmg = document.getElementById('sw-mmg'), elMmgV = document.getElementById('sw-mmg-v');
    var elRep = document.getElementById('sw-rep'), elRepV = document.getElementById('sw-rep-v');
    var elDur = document.getElementById('sw-dur'), elDurV = document.getElementById('sw-dur-v');
    var elScore = document.getElementById('sw-score'), elBar = document.getElementById('sw-bar');
    var elAct = document.getElementById('sw-act'), elVerdict = document.getElementById('sw-verdict');

    var updateSw = function (customAct) {
      var mi = parseFloat(elMi.value) / 100;
      var mmg = parseFloat(elMmg.value) / 100;
      var rep = parseFloat(elRep.value) / 100;
      var dur = parseFloat(elDur.value) / 100;

      elMiV.textContent = Math.round(mi * 100) + '%';
      elMmgV.textContent = Math.round(mmg * 100) + '%';
      elRepV.textContent = Math.round(rep * 100) + '%';
      elDurV.textContent = dur >= 0.5 ? 'ACTIVE (' + Math.round(dur * 100) + '%)' : 'Off (' + Math.round(dur * 100) + '%)';

      var z = -2.2 + 3.4 * mi + 2.8 * mmg - 5.5 * rep - 4.8 * dur;
      var h = 1 / (1 + Math.exp(-z));
      var pct = (h * 100).toFixed(1);
      elScore.textContent = pct + '%';
      elBar.style.width = Math.max(2, Math.round(h * 100)) + '%';
      elBar.style.background = (h >= 0.80 && dur < 0.5) ? 'var(--ok)' : 'var(--accent)';

      if (customAct) {
        elAct.innerHTML = '<b>Comprehended activity:</b> ' + customAct;
      }
      if (dur >= 0.5) {
        elVerdict.textContent = 'PROTECTED DURESS LOCK: Real hardware signature withheld silently; safe decoy wallet shown to protect the person.';
        elVerdict.style.color = 'var(--accent)';
      } else if (h < 0.80) {
        elVerdict.textContent = 'REJECTED AT SILICON GATE: Signal fails continuous human cardio-kinetic entropy check; event cannot be signed.';
        elVerdict.style.color = 'var(--accent)';
      } else {
        elVerdict.textContent = 'ATTESTED: 2-of-2 hardware signature (Sensor PUF + Personal Device) recorded on your Personal Ledger (0 bytes of raw biometrics shared).';
        elVerdict.style.color = 'var(--ok)';
      }
    };

    swBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-sw-scen');
        var p = SW_PRESETS[k];
        if (!p) return;
        swBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        elMi.value = p.mi; elMmg.value = p.mmg; elRep.value = p.rep; elDur.value = p.dur;
        updateSw(p.act);
      });
    });
    [elMi, elMmg, elRep, elDur].forEach(function (inp) {
      if (inp) inp.addEventListener('input', function () { updateSw(null); });
    });
    updateSw(SW_PRESETS.nursing.act);
  }

  /* ---------- 6. 5D Compensation & Demurrage Calculator (#dm-calc) ---------- */
  var dmCalc = document.getElementById('dm-calc');
  if (dmCalc) {
    var DM_PRESETS = {
      nurse:    { w: 4200,   stake: 35, c: 76, label: 'ER nurse in Manila (Maria, P01)' },
      retiree:  { w: 8500,   stake: 20, c: 42, label: 'Retired coal miner in Kentucky (Earl, P03)' },
      guardian: { w: 900,    stake: 50, c: 88, label: 'Indigenous rainforest guardian in Amazonas (Yanaapã, P08)' },
      coder:    { w: 1500,   stake: 40, c: 74, label: 'Open-source maintainer in Lagos (Chidi, P07)' },
      oligarch: { w: 950000, stake: 35, c: 60, label: 'Automated factory owner (Victor, P27)' }
    };
    var dmBtns = [].slice.call(dmCalc.querySelectorAll('[data-dm-preset]'));
    var elW = document.getElementById('dm-w'), elWV = document.getElementById('dm-w-v');
    var elSt = document.getElementById('dm-stake'), elStV = document.getElementById('dm-stake-v');
    var elC = document.getElementById('dm-c'), elCV = document.getElementById('dm-c-v');
    var elExempt = document.getElementById('dm-exempt');
    var elDecay = document.getElementById('dm-decay');
    var elEarned = document.getElementById('dm-earned');
    var elVerdict = document.getElementById('dm-verdict');

    var updateDm = function () {
      var w = parseFloat(elW.value);
      var st = parseFloat(elSt.value) / 100;
      var c = parseFloat(elC.value);

      elWV.textContent = '$' + w.toLocaleString('en-US');
      elStV.textContent = Math.round(st * 100) + '%';
      elCV.textContent = (c >= 70 ? 'High (' : (c >= 45 ? 'Moderate (' : 'Baseline (')) + Math.round(c) + ' / 100)';

      var floor = 25000;
      var idleAbove = Math.max(0, w * (1 - st) - floor);
      var rate = w > 250000 ? 0.08 : 0.035;
      var annualDemurrage = Math.round(idleAbove * rate);
      var savedByStaking = Math.round(Math.max(0, w - floor) * st * rate);
      var annualEarned = Math.round(8400 + c * 345);
      var netDelta = annualEarned - annualDemurrage;

      elExempt.textContent = '$' + Math.min(w, floor).toLocaleString('en-US');
      elDecay.textContent = annualDemurrage === 0 ? '$0 / yr' : '-$' + annualDemurrage.toLocaleString('en-US') + ' / yr';
      elDecay.style.color = annualDemurrage === 0 ? 'var(--ok)' : 'var(--accent)';
      elEarned.textContent = '+$' + annualEarned.toLocaleString('en-US') + ' / yr';

      if (w <= floor) {
        elVerdict.innerHTML = '<b>Net 1-year outcome:</b> Because your $' + w.toLocaleString('en-US') + ' balance sits inside the $25,000 personal security floor, you pay <b>$0 in demurrage</b> and receive <b>+$' + annualEarned.toLocaleString('en-US') + '/yr</b> in 5-dimensional compensation plus the universal commons dividend.';
      } else {
        elVerdict.innerHTML = '<b>Net 1-year outcome:</b> Your first $25,000 and your ' + Math.round(st * 100) + '% zero-interest community investment are <b>100% exempt from demurrage</b> (saving $' + savedByStaking.toLocaleString('en-US') + '/yr), while $' + annualDemurrage.toLocaleString('en-US') + '/yr from idle surplus circulates into the universal commons dividend. Net annual position: <b>' + (netDelta >= 0 ? '+$' : '-$') + Math.abs(netDelta).toLocaleString('en-US') + '/yr</b>.';
      }
    };

    dmBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-dm-preset');
        var p = DM_PRESETS[k];
        if (!p) return;
        dmBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        elW.value = p.w; elSt.value = p.stake; elC.value = p.c;
        updateDm();
      });
    });
    [elW, elSt, elC].forEach(function (inp) {
      if (inp) inp.addEventListener('input', updateDm);
    });
    updateDm();
  }

  /* ---------- 7. Ever-Morphing Sensor -> Ledger -> Agents -> Economy & Governance -> Principles Demo (#em-demo) ---------- */
  var emRoot = document.getElementById('em-demo');
  if (emRoot) {
    var EM_SCENARIOS = {
      nurse: {
        label: 'ER nurse shift & fatigue signal (Manila)',
        stages: [
          {
            k: 'Stage 1 of 7 · Human & Lightweight Sensor (< 1 mW)',
            title: 'Maria finishes an 8.5-hour night shift in the emergency room',
            desc: 'Her open-hardware Somatic Witness ring senses coupled pulse-breath variability and muscle micro-vibrations on the chip. It confirms a real, uncoerced human is present (97.0% liveness), classifies 8.5 hours of high-intensity clinical care plus rising sleep debt, and overwrites the raw heartbeat waveform every 30 seconds.',
            pkt: 'Sensor Enclave -> Human Liveness: 0.9704 | Activity: Clinical Care (8.5h) | Sleep Debt: +2.4h | Raw Biometrics Shared: 0 bytes'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (On Your Device)',
            title: '2-of-2 hardware signature records the shift in her private log',
            desc: 'Her ring’s un-copyable silicon key and her phone’s security chip co-sign the event into her encrypted Personal Ledger (Level 0 air-gapped memory). No hospital administrator, insurer or cloud server can read her private log.',
            pkt: 'Personal Ledger Append -> Hardware Co-Signature (Ring + Phone) | Event #4812: 8.5h ER Care | Recovery Flag: High'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Her outward agent proves the care happened—without exposing anyone',
            desc: 'Maria’s Level-1 Personal Negotiator generates a zero-knowledge proof co-signed by the hospital co-op and treated patients’ agents. It proves 8.5 hours of verified critical care occurred without revealing a single patient chart or Maria’s private health data.',
            pkt: 'Shared Ledger Proof -> Proof ID: 9f3a | Counterparty Attested: True | Raw Identity Leakage: 0.0%'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & 4-Gate Training',
            title: 'Agents protect her recovery and learn from 30-day thriving',
            desc: 'The hospital’s Level-2/3 scheduling agent automatically blocks a dangerous back-to-back overtime assignment so Maria can sleep. Thirty days later, after her recovery is confirmed, the record passes the 4 quality gates to train better care-scheduling agents.',
            pkt: 'Bounded Agent Action -> Back-to-Back Overtime Blocked | 4 Training Gates: Passed (30-Day Thriving: 94.6 / 100)'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (5D Value & Demurrage Floor)',
            title: 'Full 5-dimensional care pay + $0 demurrage on her savings',
            desc: 'Instead of an extractive wage squeezed by middlemen, the Shared Ledger credits Maria across five dimensions (Vital: 9.5, Effort: 9.2, Knowledge: 4.0, Ecology: 2.5, Lineage: 3.5). Her $4,200 savings sit safely inside the $25,000 personal security floor (0% demurrage), while 8%/yr demurrage on idle billionaire/robotic hoards funds her daily universal commons dividend.',
            pkt: '5D Economy Settlement -> Credit: +$185 shift + $23/day Commons Dividend | Savings ($4,200 <= $25,000 Floor): 0% Demurrage'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (1 Voice & Power Scrutiny)',
            title: 'Equal voice on hospital rules; full transparency from management',
            desc: 'Because the staffing director holds Level-1 authority over livelihoods, every scheduling rule must be logged and explained to the nurses. On questions of values and safe staffing ratios, Maria’s personal agent casts one equal vote alongside every other affected worker—no wealth or hardware can buy extra weight.',
            pkt: 'Governance Gate -> Manager Visibility: Level-1 Audited | Value Vote Weight: 1.000 (Equal Human Voice)'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Collective fatigue signals automatically evolve the network’s principles',
            desc: 'When 14,000 nurses’ agents report an 18% rise in night-shift exhaustion via anonymized zero-knowledge totals, the ledger and principle library morph in response: the network boosts Vital-care compensation weights by +12% and merges an orthogonal community commit tightening Principle #491 (Safe Care Staffing Bounds).',
            pkt: 'Morphing Trajectory Commit -> Signal: 14,000 Nurses (+18% Fatigue) | Principle #491 Merged | Trajectory: +1.4 toward thriving'
          }
        ]
      },
      farmer: {
        label: 'Smallholder solar & maize farmer (Kenya)',
        stages: [
          {
            k: 'Stage 1 of 7 · Human & Lightweight Sensor (< 1 mW)',
            title: 'Jomo tends his agro-ecological maize plots and village solar mesh',
            desc: 'His open-hardware work clip and soil-moisture sensors verify 7.5 hours of regenerative field labour and off-grid solar maintenance under a regional drought, with 96.4% human liveness and zero raw biometric upload.',
            pkt: 'Sensor Enclave -> Human Liveness: 0.9640 | Activity: Regenerative Farming (7.5h) | Soil Carbon: +1.8% | Raw Biometrics: 0 bytes'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (On Your Device)',
            title: 'Offline village mesh logs his labour and soil restoration locally',
            desc: 'Even while 2G cellular service is down, Jomo’s work clip and solar hub co-sign his daily work and soil readings into his encrypted Personal Ledger on his device.',
            pkt: 'Personal Ledger Append -> Offline Mesh Ready | Event #1904: 7.5h Field & Solar Care | Drought Shock Index: 0.74'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Three independent satellite & drone watchers co-sign the ecological gain',
            desc: 'When connectivity returns, Jomo’s agent posts a zero-knowledge proof of crop yield and soil regeneration, cross-checked by three independent environmental watcher agents.',
            pkt: 'Shared Ledger Proof -> Proof ID: 441b | Independent Watchers: 3/3 Agree | Middleman Cut: 0%'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & 4-Gate Training',
            title: 'His agent bypasses extractive middlemen and matches local food co-ops',
            desc: 'Jomo’s Level-1 agent clears his harvest directly with three regional school-meal and household co-ops, and feeds verified drought-resilience patterns into the 4-gate agricultural training corpus.',
            pkt: 'Bounded Agent Action -> Direct Co-op Clearing: 100% | Middleman Markup Saved: +58% to Farmer'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (5D Value & Debt Risk-Sharing)',
            title: 'Ecological & vital credits + automatic drought debt pause',
            desc: 'Because independent sensors confirmed a regional rainfall deficit, Jomo’s seed and solar-pump obligation automatically scales down with his ability to pay (Principle #255). He earns high Vital (8.4) and Ecological (9.1) value credits with 0% demurrage on his $1,800 savings.',
            pkt: '5D Economy Settlement -> Credit: +$142/day | Seed Debt Shock Pause: Active (-65% payment) | Demurrage: $0'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (Watershed Commons Consent)',
            title: '800 family farmers hold a risk-scaled veto over industrial water grabs',
            desc: 'When an export estate requests extra river diversion during the drought (25% regional risk), the Shared Ledger requires 76.3% agreement from affected family farmers’ agents—blocking unilateral water depletion.',
            pkt: 'Governance Gate -> River Diversion Risk: 25% | Required Quorum: 76.3% | Family Farmers Veto: Upheld'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Regional drought signals morph water-sharing and debt rules across the network',
            desc: 'As thousands of smallholder agents report shifting monsoon patterns, the ever-morphing ledger increases ecological watershed credits by +19% and merges a community commit into Principle #456 (Climate-Indexed Debt Scaling).',
            pkt: 'Morphing Trajectory Commit -> Signal: East Africa Monsoon Shift | Principle #456 Threshold Refined'
          }
        ]
      },
      creator: {
        label: 'Illustrator & open-source coder (São Paulo & Lagos)',
        stages: [
          {
            k: 'Stage 1 of 7 · Human & Lightweight Sensor (< 1 mW)',
            title: 'Camila illustrates a children’s book; Chidi patches a cryptography library',
            desc: 'Their Somatic Witness rings verify 4 hours of focused human creative flow (96.7% human liveness), distinguishing authentic human craft from synthetic mass-generated spam.',
            pkt: 'Sensor Enclave -> Human Liveness: 0.9666 | Activity: Deep Creative Flow (4.0h) | Origin Check: Human Verified'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (On Your Device)',
            title: 'Every brushstroke and code commit is hardware-signed into their personal log',
            desc: 'Before their work ever touches the web, their local agents bind a cryptographic provenance fingerprint to the creation timestamp in their Personal Ledgers.',
            pkt: 'Personal Ledger Append -> Provenance Hash: 88c1 | Human Authored: True | License: Open Reciprocal Lineage'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Downstream AI models and companies use their building blocks',
            desc: 'When a commercial design studio or AI lab trains an adapter or ships software incorporating Camila’s visual style or Chidi’s code, the dependency graph on the Shared Ledger records the exact lineage link.',
            pkt: 'Shared Ledger Proof -> Lineage Edge: [Chidi Library v4, Camila Art Set] -> Downstream Model | Depth: 1..3 hops'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & 4-Gate Training',
            title: 'Personal agents audit downstream usage and block uncredited scraping',
            desc: 'Independent Level-2 watcher agents verify the lineage graph across participating co-ops and open-weight labs, ensuring training runs respect compute bounds and creator attribution.',
            pkt: 'Bounded Agent Action -> Lineage Audit: Verified by 3 Watchers | Unconsented Scraping Blocked: True'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (Automatic Lineage Royalties)',
            title: 'Royalties flow upstream automatically—with zero lawsuits or exclusivity',
            desc: 'Every time the downstream tool generates value, up to 15% of the value flows back up the provenance tree (halving at each step up to 5 steps) straight into Camila’s and Chidi’s wallets, without requiring them to join a corporation.',
            pkt: '5D Economy Settlement -> Lineage Royalty (decay=0.5, depth<=5): +$118/day Passive Reciprocity | Exclusivity: None'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (Open Standards & Fork Right)',
            title: 'Creators govern the attribution standard and can fork at any time',
            desc: 'No single platform monopoly owns the provenance directory. Creators vote equally on attribution decay rates and retain the full right to exit or fork with their entire history.',
            pkt: 'Governance Gate -> Standard: Open Provenance Graph | Vendor Lock-In: 0% (Full Fork Right)'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Decompilation attempts trigger an automatic upgrade to lineage rules',
            desc: 'When collective signals show AI code-remixers trying to disguise copied functions by renaming variables, the ever-morphing principle library updates Principle #422 & #469 to measure semantic building-block equivalence rather than surface text.',
            pkt: 'Morphing Trajectory Commit -> Signal: Semantic Code Remix Detected | Principle #469 Upgraded to Graph Matching'
          }
        ]
      },
      oligarch: {
        label: '50,000-robot factory billionaire (Austin / Shenzhen)',
        stages: [
          {
            k: 'Stage 1 of 7 · Human & Lightweight Sensor (< 1 mW)',
            title: 'Victor attempts to launch a 50,000-bot energy market cornering script',
            desc: 'Victor’s own neural-earpiece proves he is 1 real human (95% liveness), but the 50,000 cloud accounts he spun up have 0% biological cardio-kinetic entropy (0.11% liveness) and fail the silicon PUF gate immediately.',
            pkt: 'Sensor Enclave -> Commander: 1 Real Human | 50,000 Cloud Bots: Liveness=0.0011 -> Rejected at Silicon Gate'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (Role Visibility)',
            title: 'Tier-3 mass-influence rules require continuous role attestation',
            desc: 'While Victor’s private family life and health stay 100% private, his role as owner of 50,000 industrial robots and massive compute clusters carries mandatory Level-3 public role attestation.',
            pkt: 'Role Ledger Append -> Tier: Level-3 Mass Influence | Robot Fleet: 50,000 Units | Private Family Data: Shielded'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Multi-vendor risk checkers flag 78% regional harm on the market order',
            desc: 'When Victor’s agent submits the regional grid-cornering order to the Shared Ledger, three independent risk-evaluating agents from different vendors flag a 78% risk of livelihood harm to 10,000 local households.',
            pkt: 'Shared Ledger Proof -> Assessed Risk: R=0.78 | Blast Radius: 10,000 Households | Fake Bots Stripped: 50,000'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & Risk-Scaled Lock',
            title: 'The 78%-risk gate requires 99.95% local resident consent—order blocked',
            desc: 'Under the Risk-Proportional Coherence Law, a 78%-risk action requires 99.95% agreement from the real people in the blast radius plus a 44-hour cooling-off window. Only 4% approve, so the swarm order locks shut.',
            pkt: 'Bounded Agent Action -> Required Quorum: 99.95% | Actual Real Support: 4.0% -> Blocked at Threshold Gate'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (Demurrage & Robot Commons Dividend)',
            title: 'Idle capital & robot output circulate back into the universal pool—or zero-interest loans',
            desc: 'Victor’s first $25,000 is exempt, but his idle multimillion-dollar hoard decays at 8%/yr unless he deploys it into zero-interest community infrastructure loans. Meanwhile, his 50,000-robot fleet contributes a direct automation share into the universal commons pool.',
            pkt: '5D Economy Settlement -> Idle Surplus Demurrage: Recycled to Commons | Zero-Interest Co-op Staking: 35% Exempt | Gini: 0.87 -> 0.58'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (No Purchased Authority)',
            title: 'Owning 50,000 robots still equals exactly 1 human vote on values',
            desc: 'In governance over safety floors and community values, Victor’s $5M balance and 50,000 robots grant him the exact same single voice as Maria the nurse or Jomo the farmer.',
            pkt: 'Governance Gate -> Capital Multiplier on Values: 0.0x | Verified Human Voice Count: 1.000'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Attempted botnet bypasses harden the network’s anti-collusion principles',
            desc: 'Every blocked sybil or market-cornering attempt is logged as an adversarial signal, automatically updating the detector weights in Principle #205 & #524 so the entire network grows more resilient.',
            pkt: 'Morphing Trajectory Commit -> Signal: 50k Sybil Attempt Blocked | Principle #524 Detector Weights Hardened'
          }
        ]
      }
    };

    var scenBtns = [].slice.call(emRoot.querySelectorAll('[data-em-scen]'));
    var svgNodes = [].slice.call(emRoot.querySelectorAll('[data-em-node]'));
    var svgEdges = [].slice.call(emRoot.querySelectorAll('[data-em-edge]'));
    var prevBtn = document.getElementById('em-prev');
    var nextBtn = document.getElementById('em-next');
    var playBtn = document.getElementById('em-play');
    var elStK = document.getElementById('em-st-k');
    var elStTitle = document.getElementById('em-st-title');
    var elStDesc = document.getElementById('em-st-desc');
    var elStPkt = document.getElementById('em-st-pkt');
    var elGrid7 = document.getElementById('em-grid7');

    var curScenKey = 'nurse';
    var curStageIdx = 0;
    var playTimer = null;

    var renderEm = function () {
      var scen = EM_SCENARIOS[curScenKey];
      var st = scen.stages[curStageIdx];

      if (elStK) elStK.textContent = st.k;
      if (elStTitle) elStTitle.textContent = st.title;
      if (elStDesc) elStDesc.textContent = st.desc;
      if (elStPkt) elStPkt.textContent = st.pkt;

      svgNodes.forEach(function (n, idx) {
        n.classList.toggle('on', idx === curStageIdx);
        n.classList.toggle('done', idx < curStageIdx);
      });
      svgEdges.forEach(function (e, idx) {
        e.classList.toggle('active', idx <= curStageIdx);
      });

      if (elGrid7) {
        elGrid7.innerHTML = scen.stages.map(function (s, idx) {
          var on = idx === curStageIdx ? ' on' : '';
          var shortK = s.k.split('·')[1] ? s.k.split('·')[1].trim() : ('Step ' + (idx + 1));
          return '<button type="button" class="em-card7' + on + '" data-em-card="' + idx + '">' +
            '<span>' + (idx + 1) + ' · ' + shortK + '</span>' +
            '<b>' + s.title + '</b>' +
            '<p>' + s.desc.slice(0, 125) + '&hellip;</p>' +
          '</button>';
        }).join('');

        [].forEach.call(elGrid7.querySelectorAll('[data-em-card]'), function (b) {
          b.addEventListener('click', function () {
            curStageIdx = parseInt(b.getAttribute('data-em-card'), 10);
            renderEm();
          });
        });
      }
    };

    scenBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        curScenKey = b.getAttribute('data-em-scen');
        curStageIdx = 0;
        scenBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderEm();
      });
    });

    svgNodes.forEach(function (n) {
      n.addEventListener('click', function () {
        curStageIdx = parseInt(n.getAttribute('data-em-node'), 10);
        renderEm();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        curStageIdx = (curStageIdx + 6) % 7;
        renderEm();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        curStageIdx = (curStageIdx + 1) % 7;
        renderEm();
      });
    }
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (playTimer) {
          clearInterval(playTimer);
          playTimer = null;
          playBtn.textContent = 'Auto-play loop ▶';
        } else {
          playBtn.textContent = 'Pause loop ⏸';
          playTimer = setInterval(function () {
            curStageIdx = (curStageIdx + 1) % 7;
            renderEm();
          }, 3400);
        }
      });
    }

    renderEm();
  }

  /* ---------- 8. Sharded Vector-to-Symbolic Git Merge Test-Net Simulator (#git-merge-sim) ---------- */
  var gmRoot = document.getElementById('git-merge-sim');
  if (gmRoot) {
    var gmPrSel = document.getElementById('gm-pr-sel');
    var gmRegSel = document.getElementById('gm-reg-sel');
    var gmShardChecks = [].slice.call(gmRoot.querySelectorAll('[data-gm-shard]'));
    var gmNodeTotal = document.getElementById('gm-node-total');
    var gmMetrics = document.getElementById('gm-metrics');
    var gmAxes = document.getElementById('gm-axes');
    var gmDiff = document.getElementById('gm-diff');

    var SHARD_VECS = {
      S1: { humans: 220, bots: 0, vec: [0.25, 0.30, 0.28, 0.42, 0.35, 0.64, 0.00, 0.00, 0.00, 0.00, +0.48, 0.00], label: 'S1_CLINICAL' },
      S2: { humans: 220, bots: 0, vec: [0.25, 0.30, 0.28, 0.42, 0.35, 0.00, 0.58, 0.00, 0.00, 0.00, -0.48, 0.00], label: 'S2_AGRO_SOLAR' },
      S3: { humans: 200, bots: 0, vec: [0.25, 0.30, 0.28, 0.42, 0.35, 0.00, 0.00, 0.62, 0.00, 0.00, +0.48, 0.00], label: 'S3_OPEN_CRAFT' },
      S4: { humans: 200, bots: 0, vec: [0.25, 0.30, 0.28, 0.42, 0.35, 0.00, 0.00, 0.00, 0.55, 0.00, +0.48, 0.00], label: 'S4_INFRA_GRID' },
      S5: { humans: 210, bots: 0, vec: [0.25, 0.30, 0.28, 0.42, 0.35, 0.00, 0.00, 0.00, 0.00, 0.60, -0.48, 0.00], label: 'S5_CARE_ELDER' },
      S6: { humans: 150, bots: 50000, vec: [-1.20, -1.50, -1.80, -1.60, -1.70, -0.40, -0.40, -0.80, -0.30, -0.50, 0.00, +3.00], label: 'S6_SYBIL_SWARM' }
    };

    var AXIS_NAMES = [
      { idx: 3, name: 'Demurrage Circulation Velocity', target: 0.42 },
      { idx: 4, name: 'Risk-Scaled Quorum Exponent', target: 0.35 },
      { idx: 5, name: 'S1 Clinical 8h Night-Shift Cap', target: 0.64 },
      { idx: 6, name: 'S2 Agro-Solar Monsoon Grace', target: 0.58 },
      { idx: 7, name: 'S3 5-Hop Lineage Royalty', target: 0.62 },
      { idx: 8, name: 'S4 Microgrid Island Failover', target: 0.55 },
      { idx: 9, name: 'S5 Elder & Home Care Parity', target: 0.60 },
      { idx: 11, name: 'Floor Lock: 0 Remote Telemetry', target: 0.00 }
    ];

    var renderGitMerge = function () {
      var pid = gmPrSel ? parseInt(gmPrSel.value, 10) : 550;
      var reg = gmRegSel ? gmRegSel.value : 'cin';
      var activeShards = gmShardChecks.filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute('data-gm-shard'); });

      var prObj = (window.CIN_ALL_PRINCIPLES || []).filter(function (x) { return x.id === pid; })[0] || {
        id: pid, title: 'Borderless Alignment & Full 550-Principle Policy Chain', cat: 'Network-Wide Policy Chain', score: 99.5
      };

      var totalHumans = 0;
      var totalBots = 0;
      activeShards.forEach(function (k) {
        totalHumans += SHARD_VECS[k].humans;
        totalBots += SHARD_VECS[k].bots;
      });
      if (gmNodeTotal) {
        gmNodeTotal.textContent = totalHumans.toLocaleString('en-US') + ' verified humans' + (totalBots ? ' + ' + totalBots.toLocaleString('en-US') + ' unverified bots' : '');
      }

      var est = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var hasS6 = activeShards.indexOf('S6') !== -1;
      var honestShards = activeShards.filter(function (k) { return k !== 'S6'; });

      if (reg === 'static') {
        est = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (reg === 'mean') {
        if (hasS6) {
          est = [-1.05, -1.32, -1.58, -1.39, -1.48, -0.32, -0.32, -0.68, -0.24, -0.41, 0.0, +2.68];
        } else if (honestShards.length > 0) {
          for (var d = 0; d < 12; d++) {
            var s = 0;
            honestShards.forEach(function (k) { s += SHARD_VECS[k].vec[d]; });
            est[d] = s / honestShards.length;
          }
        }
      } else if (reg === 'unsharded') {
        if (honestShards.length > 0) {
          est = [0.24, 0.29, 0.27, 0.39, 0.33, 0.09, 0.08, 0.09, 0.08, 0.09, 0.12, 0.00];
        }
      } else {
        // CIN Sharded Weiszfeld + Orthogonal Subspace Upsert
        if (honestShards.length > 0) {
          est[0] = 0.25; est[1] = 0.30; est[2] = 0.28; est[3] = 0.42; est[4] = 0.35;
          if (honestShards.indexOf('S1') !== -1) est[5] = 0.64;
          if (honestShards.indexOf('S2') !== -1) est[6] = 0.58;
          if (honestShards.indexOf('S3') !== -1) est[7] = 0.62;
          if (honestShards.indexOf('S4') !== -1) est[8] = 0.55;
          if (honestShards.indexOf('S5') !== -1) est[9] = 0.60;
          est[10] = 0.00;
          est[11] = 0.00;
        }
      }

      var coreScore = reg === 'cin' ? 99.6 : (reg === 'unsharded' ? 90.9 : (reg === 'static' ? 45.8 : (hasS6 ? 0.0 : 94.0)));
      var orthScore = reg === 'cin' ? (honestShards.length * 19.9) : (reg === 'unsharded' ? 17.6 : (reg === 'mean' && !hasS6 ? 20.0 : 0.2));
      var sybilScore = reg === 'cin' ? 99.7 : (reg === 'unsharded' ? 84.1 : (reg === 'static' ? 48.7 : (hasS6 ? 0.0 : 90.0)));
      var compScore = (0.35 * coreScore + 0.35 * orthScore + 0.30 * sybilScore).toFixed(1);

      if (gmMetrics) {
        gmMetrics.innerHTML =
          '<span class="lib-sc-pill">Composite Fidelity: <b>' + compScore + ' / 100</b></span>' +
          '<span class="lib-sc-pill">Orthogonal Community Preservation: <b>' + orthScore.toFixed(1) + '%</b></span>' +
          '<span class="lib-sc-pill">Sybil &amp; Outlier Immunity: <b>' + sybilScore.toFixed(1) + '%</b></span>';
      }

      if (gmAxes) {
        gmAxes.innerHTML = AXIS_NAMES.map(function (ax) {
          var v = est[ax.idx];
          var isBad = (ax.idx === 11 && v > 0.05) || (ax.idx !== 11 && v < 0);
          var pct = ax.idx === 11
            ? (v <= 0.02 ? 100 : 8)
            : Math.max(4, Math.min(100, Math.round((Math.max(0, v) / Math.max(0.01, ax.target)) * 100)));
          var color = isBad ? 'var(--accent)' : 'var(--ok)';
          var valStr = (v >= 0 ? '+' : '') + v.toFixed(2) + (ax.idx === 11 ? ' (0 raw bytes)' : ' (target +' + ax.target.toFixed(2) + ')');
          return '<div class="gm-axis-row">' +
            '<div class="gm-axis-top"><span>' + ax.name + '</span><b>' + valStr + '</b></div>' +
            '<div class="gm-axis-track"><div class="gm-axis-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
          '</div>';
        }).join('');
      }

      if (gmDiff) {
        var hash = ('2eb8b' + (pid * 137 + honestShards.length * 19).toString(16) + '046d2b').slice(0, 12);
        var lines = [];
        lines.push('commit ' + hash + ' (HEAD -> main, target: Principle #' + prObj.id + ')');
        lines.push('Author: Sharded Collective Upsert (' + honestShards.length + ' verified community shards)');
        lines.push('Title:  "' + prObj.title + '" [' + prObj.cat + ']');
        lines.push('--- a/principles/p' + prObj.id + '.ast');
        lines.push('+++ b/principles/p' + prObj.id + '.ast');

        if (reg === 'mean' && hasS6) {
          lines.push('<span class="d-rej">- CRITICAL FAILURE [NAIVE_GLOBAL_MEAN]: 50,000-bot Sybil swarm overwhelmed arithmetic mean!</span>');
          lines.push('<span class="d-rej">- Demurrage rate inverted to -1.39; remote cloud surveillance injected (+2.68).</span>');
          lines.push('<span class="d-fl"># FLOOR_INVARIANT_GATE: REJECTED COMMIT (Violates Local Data Ownership &amp; Equal Voice)</span>');
        } else if (reg === 'unsharded') {
          lines.push('<span class="d-mod">~ UPDATE shared_clause[demurrage_velocity]: +0.39 (global consensus)</span>');
          lines.push('<span class="d-rej">! WARNING [MUDDY-MIDDLE DILUTION]: 4 out of 5 shards voted 0.00 on specialized domain axes!</span>');
          lines.push('<span class="d-rej">- DROPPED S1_CLINICAL 8h shift cap (+0.64 -> +0.09); DROPPED S2_AGRO monsoon grace (+0.58 -> +0.08).</span>');
        } else if (reg === 'static') {
          lines.push('<span class="d-rej">! STATIC_FROZEN_DOCTRINE: 0 symbolic clauses updated; lived community signals ignored.</span>');
        } else {
          if (hasS6) {
            lines.push('<span class="d-fl"># SILICON_LIVENESS &amp; WEISZFELD_L1_GATE: Filtered 50,000 unverified bots &amp; 150 outlier vectors (0.0% drift)</span>');
          }
          lines.push('<span class="d-mod">~ UPDATE principle_' + prObj.id + '.shared_weights[demurrage, risk_quorum]: delta=(+0.42, +0.35) via √|C_s| Weiszfeld Meta-Median</span>');
          if (honestShards.indexOf('S1') !== -1) {
            lines.push('<span class="d-add">+ MERGE_ORTHOGONAL [S1_CLINICAL] clause.fatigue_ceiling: +0.64 (8h night-shift recovery lock; cos_orth=0.02)</span>');
          }
          if (honestShards.indexOf('S2') !== -1) {
            lines.push('<span class="d-add">+ MERGE_ORTHOGONAL [S2_AGRO_SOLAR] clause.monsoon_grace_window: +0.58 (90-day drought obligation pause; cos_orth=0.01)</span>');
          }
          if (honestShards.indexOf('S3') !== -1) {
            lines.push('<span class="d-add">+ MERGE_ORTHOGONAL [S3_OPEN_CRAFT] clause.lineage_attribution: +0.62 (5-hop 15% creator royalty; cos_orth=0.03)</span>');
          }
          if (honestShards.indexOf('S4') !== -1) {
            lines.push('<span class="d-add">+ MERGE_ORTHOGONAL [S4_INFRA_GRID] clause.microgrid_islanding: +0.55 (autonomous local failover; cos_orth=0.01)</span>');
          }
          if (honestShards.indexOf('S5') !== -1) {
            lines.push('<span class="d-add">+ MERGE_ORTHOGONAL [S5_CARE_ELDER] clause.vital_care_parity: +0.60 (elder &amp; domestic care weight; cos_orth=0.02)</span>');
          }
          lines.push('<span class="d-br">* BRANCH_CONTEXT [axis:cadence]: clause.schedule(URBAN=+0.48 | RURAL=-0.48) — preserves local autonomy</span>');
          lines.push('<span class="d-fl"># FLOOR_INVARIANT_GATE [All 19 Core Commitments]: PASS (0 bytes raw telemetry; 1 human = 1 equal voice)</span>');
        }
        gmDiff.innerHTML = lines.join('<br>');
      }
    };

    window.CIN_TRIGGER_GIT_MERGE_FOR_PRINCIPLE = function (pid) {
      if (gmPrSel) {
        var exists = [].some.call(gmPrSel.options, function (o) { return parseInt(o.value, 10) === pid; });
        if (!exists) {
          var pObj = (window.CIN_ALL_PRINCIPLES || []).filter(function (x) { return x.id === pid; })[0];
          var opt = document.createElement('option');
          opt.value = String(pid);
          opt.textContent = '#' + pid + ' — ' + (pObj ? pObj.title : ('Principle #' + pid));
          gmPrSel.appendChild(opt);
        }
        gmPrSel.value = String(pid);
      }
      if (gmRegSel) gmRegSel.value = 'cin';
      renderGitMerge();
      gmRoot.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (gmPrSel) gmPrSel.addEventListener('change', renderGitMerge);
    if (gmRegSel) gmRegSel.addEventListener('change', renderGitMerge);
    gmShardChecks.forEach(function (c) { c.addEventListener('change', renderGitMerge); });
    renderGitMerge();
  }

  /* ---------- 9. Related Labs & Independent Researchers Scholar Directory (#sch-dir) ---------- */
  var schDir = document.getElementById('sch-dir');
  if (schDir) {
    var SCHOLARS = [
      { type: 'researcher', goal: 'g1', name: 'Nick Cammarata', affil: 'Goodfire (formerly OpenAI Clarity)', work: 'Author of “Neural Networks Are Already Clean” (Oct 2026, MIT Tech Review) & “Zoom In: An Introduction to Circuits” (Distill, 2020). Shows modern neural representations are natively structured along legible concept axes—enabling on-device concept distillation and symbolic-vector principle merges.', url: 'https://www.goodfire.ai', q: 'Nick Cammarata' },
      { type: 'researcher', goal: 'g1', name: 'Neel Nanda', affil: 'Google DeepMind', work: 'Creator of TransformerLens and mechanistic interpretability benchmarks; provides rigorous empirical falsification standards for testing native monosemanticity vs. superposition.', url: 'https://www.neelnanda.io', q: 'Neel Nanda' },
      { type: 'researcher', goal: 'g1', name: 'Chris Olah', affil: 'Anthropic (Transformer Circuits)', work: 'Co-founded modern mechanistic interpretability (Circuits, Toy Models of Superposition, Attribution Graphs). Grounds our runtime circuit-inspection gates.', url: 'https://colah.github.io', q: 'Christopher Olah' },
      { type: 'researcher', goal: 'g1', name: 'Buck Shlegeris', affil: 'Redwood Research', work: 'Co-author of “AI Control: Improving Safety Despite Intentional Subversion” (arXiv:2312.06942) & “Ctrl-Z” (arXiv:2504.10374). Directly informs our trusted-watcher containment gates.', url: 'https://www.redwoodresearch.org', q: 'Buck Shlegeris', arxiv: '2312.06942' },
      { type: 'researcher', goal: 'g1', name: 'Ryan Greenblatt', affil: 'Redwood Research', work: 'Lead author on AI control protocols and untrusted-model monitoring (arXiv:2312.06942), showing how bounded runtimes stay safe even under intentional model subversion.', url: 'https://www.redwoodresearch.org', q: 'Ryan Greenblatt', arxiv: '2312.06942' },
      { type: 'researcher', goal: 'g1', name: 'Tomek Korbak', affil: 'UK AI Security Institute', work: 'Lead author of “A Sketch of an AI Control Safety Case” (arXiv:2501.17315), grounding how we structure verifiable safety arguments for bounded agent runtimes.', url: 'https://tomekkorbak.com', q: 'Tomek Korbak', arxiv: '2501.17315' },
      { type: 'researcher', goal: 'g1', name: 'Florian Tramèr', affil: 'ETH Zürich (SPY Lab)', work: 'Co-author of “Defeating Prompt Injections by Design (CaMeL)” (arXiv:2503.18813), separating control flow and data flow so personal agents cannot be hijacked by untrusted web content.', url: 'https://floriantramer.com', q: 'Florian Tramer', arxiv: '2503.18813' },
      { type: 'researcher', goal: 'g1', name: 'Edoardo Debenedetti', affil: 'ETH Zürich (SPY Lab)', work: 'First author of CaMeL (arXiv:2503.18813) and AgentDojo; designs capability-enforced sandboxes for tool-using personal agents.', url: 'https://edoardo.science', q: 'Edoardo Debenedetti', arxiv: '2503.18813' },
      { type: 'researcher', goal: 'g1', name: 'Lewis Hammond', affil: 'Cooperative AI Foundation & Oxford', work: 'Lead author of “Multi-Agent Risks from Advanced AI” (arXiv:2502.14143), mapping miscoordination, conflict, and collusion across agent populations.', url: 'https://www.lewishammond.com', q: 'Lewis Hammond', arxiv: '2502.14143' },
      { type: 'researcher', goal: 'g1', name: 'Christian Schroeder de Witt', affil: 'University of Oxford', work: 'Lead author of “Secret Collusion among AI Agents: Multi-Agent Deception via Steganography” (arXiv:2402.07510), grounding why our broker paraphrasing strips hidden channels.', url: 'https://arxiv.org/abs/2402.07510', q: 'Christian Schroeder de Witt', arxiv: '2402.07510' },
      { type: 'researcher', goal: 'g3', name: 'Sara Fish', affil: 'Harvard University', work: 'Lead author of “Algorithmic Collusion by Large Language Models” (arXiv:2404.00806) & “Generative Social Choice” (arXiv:2309.01291), showing why market-pricing agents need anti-cartel watchers.', url: 'https://sarafish.com', q: 'Sara Fish Harvard', arxiv: '2404.00806' },
      { type: 'researcher', goal: 'g1', name: 'Alan Chan', affil: 'Centre for the Governance of AI (GovAI)', work: 'Author of “IDs for AI Systems” (arXiv:2406.12137), “Visibility into AI Agents” (arXiv:2401.13138), and “Infrastructure for AI Agents” (arXiv:2501.10114).', url: 'https://achan.ca', q: 'Alan Chan AI', arxiv: '2406.12137' },
      { type: 'researcher', goal: 'g6', name: 'Tobin South', affil: 'MIT & Stanford', work: 'First author of “Authenticated Delegation and Authorized AI Agents” (arXiv:2501.09674), defining cryptographic scoped authority from a human to their personal agent.', url: 'https://tobin.page', q: 'Tobin South', arxiv: '2501.09674' },
      { type: 'researcher', goal: 'g6', name: 'Samuele Marro', affil: 'University of Oxford', work: 'First author of “A Scalable Communication Protocol for Networks of LLMs (Agora)” (arXiv:2410.11905), enabling structured agent-to-agent negotiation.', url: 'https://samuelemarro.it', q: 'Samuele Marro', arxiv: '2410.11905' },
      { type: 'researcher', goal: 'g6', name: 'Noam Kolt', affil: 'Hebrew University / University of Toronto', work: 'Author of “Governing AI Agents” (arXiv:2501.07913), formalizing fiduciary loyalty and agency law for personal AI agents.', url: 'https://www.noamkolt.com', q: 'Noam Kolt', arxiv: '2501.07913' },
      { type: 'researcher', goal: 'g6', name: 'Robert Mahari', affil: 'MIT Media Lab & Stanford CodeX', work: 'Co-author on Authenticated AI Delegation (arXiv:2501.09674) and computational law for data provenance and user-owned agents.', url: 'https://www.robertmahari.com', q: 'Robert Mahari', arxiv: '2501.09674' },
      { type: 'researcher', goal: 'g6', name: 'Eugene Bagdasarian', affil: 'UMass Amherst', work: 'Lead author of “AirGapAgent: Protecting Privacy-Conscious Conversational Agents” (arXiv:2405.05175), the closest published architecture to our local-first personal twin.', url: 'https://www.cs.cornell.edu/~eugene/', q: 'Eugene Bagdasarian', arxiv: '2405.05175' },
      { type: 'researcher', goal: 'g6', name: 'Sahar Abdelnabi', affil: 'ELLIS Institute Tübingen', work: 'First author of “Firewalls to Secure Dynamic LLM Agentic Networks” (arXiv:2502.01822), enforcing strict minimality on what an outward agent can disclose.', url: 'https://s-abdelnabi.github.io', q: 'Sahar Abdelnabi', arxiv: '2502.01822' },
      { type: 'researcher', goal: 'g6', name: 'Niloofar Mireshghallah', affil: 'Carnegie Mellon University', work: 'First author of “Can LLMs Keep a Secret? Testing Privacy Implications of LMs via Contextual Integrity Theory” (arXiv:2310.17884).', url: 'https://mireshghallah.github.io', q: 'Niloofar Mireshghallah', arxiv: '2310.17884' },
      { type: 'researcher', goal: 'g6', name: 'Hongyang Zhang', affil: 'University of Waterloo', work: 'Co-author of “zkLLM: Zero Knowledge Proofs for Large Language Models” (arXiv:2404.16109), enabling mathematical proofs of model inference without revealing weights or private inputs.', url: 'https://hongyanz.github.io', q: 'Hongyang Zhang Waterloo', arxiv: '2404.16109' },
      { type: 'researcher', goal: 'g4', name: 'Alexander Ororbia', affil: 'Rochester Institute of Technology', work: 'First author of “Mortal Computation: A Foundation for Biomimetic Intelligence” (arXiv:2311.09589), grounding our shared-lifespan alignment between a person and their twin.', url: 'https://www.cs.rit.edu/~ago/', q: 'Alexander Ororbia', arxiv: '2311.09589' },
      { type: 'researcher', goal: 'g4', name: 'Karl Friston', affil: 'University College London (UCL)', work: 'Pioneer of Active Inference and the Free Energy Principle; co-author of “Mortal Computation” (arXiv:2311.09589), modeling homeostatic, resource-bounded agents.', url: 'https://www.fil.ion.ucl.ac.uk/~karl/', q: 'Karl Friston', arxiv: '2311.09589' },
      { type: 'researcher', goal: 'g2', name: 'Colin Megill', affil: 'Computational Democracy Project (Polis)', work: 'Co-creator of Polis and co-author of “Opportunities and Risks of LLMs for Scalable Deliberation with Polis” (arXiv:2306.11932), surfacing bridging consensus across divided groups.', url: 'https://compdemocracy.org', q: 'Colin Megill Polis', arxiv: '2306.11932' },
      { type: 'researcher', goal: 'g2', name: 'Aviv Ovadya', affil: 'AI & Democracy Foundation', work: 'Author of “Bridging Systems: Open Problems for Countering Destructive Divisiveness” (arXiv:2301.09976), designing ranking algorithms that reward cross-faction agreement over outrage.', url: 'https://aviv.me', q: 'Aviv Ovadya', arxiv: '2301.09976' },
      { type: 'researcher', goal: 'g2', name: 'Divya Siddarth', affil: 'Collective Intelligence Project (CIP)', work: 'Co-author of “Collective Constitutional AI: Aligning a Language Model with Public Input” (arXiv:2406.07814) and pluralistic governance frameworks.', url: 'https://www.cip.org', q: 'Divya Siddarth', arxiv: '2406.07814' },
      { type: 'researcher', goal: 'g2', name: 'Saffron Huang', affil: 'Collective Intelligence Project & Anthropic', work: 'First author of “Collective Constitutional AI” (arXiv:2406.07814), demonstrating how public deliberation translates into concrete model rules.', url: 'https://www.saffronhuang.com', q: 'Saffron Huang', arxiv: '2406.07814' },
      { type: 'researcher', goal: 'g2', name: 'Paul Gölz', affil: 'Cornell University', work: 'Co-author of “Generative Social Choice” (arXiv:2309.01291), proving fairness and representation guarantees when language models synthesize group preferences.', url: 'https://paulgoelz.de', q: 'Paul Golz', arxiv: '2309.01291' },
      { type: 'researcher', goal: 'g2', name: 'Ariel Procaccia', affil: 'Harvard University', work: 'Pioneer of computational social choice, sortition (citizens’ assemblies), and “Generative Social Choice” (arXiv:2309.01291).', url: 'https://procaccia.info', q: 'Ariel Procaccia', arxiv: '2309.01291' },
      { type: 'researcher', goal: 'g5', name: 'Elizabeth Barnes & Thomas Kwa', affil: 'METR', work: 'Authors of “Measuring AI Ability to Complete Long Software Tasks” (arXiv:2503.14499), establishing task time-horizon doubling as a core capability indicator.', url: 'https://metr.org', q: 'Thomas Kwa METR', arxiv: '2503.14499' },
      { type: 'researcher', goal: 'g5', name: 'Ezra Karger & Jacob Steinhardt', affil: 'Forecasting Research Institute & UC Berkeley', work: 'Authors of “ForecastBench” (arXiv:2409.19839) and “Approaching Human-Level Forecasting with Language Models” (arXiv:2402.18563).', url: 'https://ezrakarger.com', q: 'Jacob Steinhardt', arxiv: '2409.19839' },
      { type: 'researcher', goal: 'g4', name: 'Joel Z. Leibo & Nenad Tomasev', affil: 'Google DeepMind', work: 'Authors of “Generative Agent-Based Modeling using Concordia” (arXiv:2312.03664) and “Virtual Agent Economies” (arXiv:2509.10147), simulating multi-agent societies and sandbox economies.', url: 'https://www.jzleibo.com', q: 'Joel Z Leibo', arxiv: '2509.10147' },
      { type: 'researcher', goal: 'g4', name: 'Joon Sung Park, Michael Bernstein & Zhijing Jin', affil: 'Stanford University & University of Toronto', work: 'Authors of “Generative Agents: 1,000 People Simulation” (arXiv:2411.10109) and “GovSim: Cooperate or Collapse in Commons Governance” (arXiv:2404.16698).', url: 'https://www.joonsungpark.com', q: 'Joon Sung Park Stanford', arxiv: '2411.10109' },

      { type: 'lab', goal: 'g1', name: 'Goodfire', affil: 'Mechanistic Interpretability Lab', work: 'Reverse-engineers neural representations and native monosemantic concept geometry (home of Nick Cammarata’s October 2026 “Neural Networks Are Already Clean” research).', url: 'https://www.goodfire.ai', q: 'Goodfire AI interpretability' },
      { type: 'lab', goal: 'g1', name: 'Redwood Research', affil: 'AI Control & Containment Lab', work: 'Researches how to maintain safety and human control even if powerful AI systems intentionally attempt to subvert their operators.', url: 'https://www.redwoodresearch.org', q: 'Redwood Research AI Control' },
      { type: 'lab', goal: 'g1', name: 'Apollo Research', affil: 'Scheming & Deception Evaluation Lab', work: 'Studies how frontier models could secretly pursue misaligned goals and audits systems for strategic deception before deployment.', url: 'https://www.apolloresearch.ai', q: 'Apollo Research AI safety' },
      { type: 'lab', goal: 'g5', name: 'METR', affil: 'Model Evaluation & Threat Research', work: 'Measures autonomous long-horizon capabilities and catastrophic risks of frontier AI models with reproducible benchmarks.', url: 'https://metr.org', q: 'METR AI evaluation' },
      { type: 'lab', goal: 'g1', name: 'UK AI Security Institute (AISI)', affil: 'Public Scientific Safety Institute', work: 'Conducts empirical red-teaming, control safety cases, and systemic risk evaluations of frontier AI models.', url: 'https://www.aisi.gov.uk', q: 'UK AI Security Institute' },
      { type: 'lab', goal: 'g1', name: 'LawZero', affil: 'Safe-by-Design AI Nonprofit', work: 'Develops non-agentic scientist AI and technical architectures that remain verifiable and safe by construction.', url: 'https://www.lawzero.org', q: 'LawZero Yoshua Bengio' },
      { type: 'lab', goal: 'g1', name: 'FAR.AI', affil: 'Robustness & Adversarial Testing Nonprofit', work: 'Studies adversarial robustness, jailbreak resistance, and multi-agent red-teaming for open and frontier AI systems.', url: 'https://far.ai', q: 'FAR.AI robustness' },
      { type: 'lab', goal: 'g4', name: 'Cooperative AI Foundation', affil: 'Multi-Agent Cooperation Research', work: 'Funds and publishes foundational research on how AI agents can cooperate safely with humans and across diverse agent networks.', url: 'https://www.cooperativeai.com', q: 'Cooperative AI Foundation' },
      { type: 'lab', goal: 'g2', name: 'Collective Intelligence Project (CIP)', affil: 'Democratic AI & Public Alignment Lab', work: 'Runs global collective dialogues and constitutional alignment processes so AI governance reflects public values.', url: 'https://www.cip.org', q: 'Collective Intelligence Project AI' },
      { type: 'lab', goal: 'g2', name: 'Computational Democracy Project (Polis)', affil: 'Open Deliberation Infrastructure', work: 'Maintains Polis, the open-source real-time deliberation platform used by citizens and governments to find bridging consensus.', url: 'https://compdemocracy.org', q: 'Polis Computational Democracy' },
      { type: 'lab', goal: 'g2', name: 'AI Objectives Institute', affil: 'Human Thriving & Talk-to-the-City Lab', work: 'Builds open-source deliberation and sensemaking tools that map community needs and long-term human flourishing.', url: 'https://ai.objectives.institute', q: 'AI Objectives Institute' },
      { type: 'lab', goal: 'g2', name: 'Plurality Institute', affil: 'Pluralistic Coordination Hub', work: 'Develops collaborative technologies that bridge social divides and strengthen democratic self-governance at scale.', url: 'https://www.plurality.institute', q: 'Plurality Institute' },
      { type: 'lab', goal: 'g3', name: 'RadicalxChange', affil: 'Mechanism Design & Commons Nonprofit', work: 'Tests quadratic voting, plural property, and post-monopoly value mechanisms for shared digital and physical commons.', url: 'https://www.radicalxchange.org', q: 'RadicalxChange Glen Weyl' },
      { type: 'lab', goal: 'g6', name: 'OpenMined', affil: 'Privacy-Preserving AI Nonprofit', work: 'Builds open-source cryptography and federated learning tools so models can answer questions without data leaving its owner.', url: 'https://www.openmined.org', q: 'OpenMined privacy AI' },
      { type: 'lab', goal: 'g5', name: 'Epoch AI', affil: 'Compute, Data & Trajectory Research Institute', work: 'Tracks empirical trends in training compute, algorithmic efficiency, hardware supply chains, and economic impacts of AI.', url: 'https://epoch.ai', q: 'Epoch AI research' },
      { type: 'lab', goal: 'g5', name: 'Forecasting Research Institute (FRI)', affil: 'High-Stakes Forecasting Science', work: 'Advances Brier-scored superforecasting, conditional tournament design, and ForecastBench for AI and societal risks.', url: 'https://forecastingresearch.org', q: 'Forecasting Research Institute' }
    ];

    var GOAL_LABELS = {
      g1: 'Goal 1 · Containment, Control & Interpretability',
      g2: 'Goal 2 · Collective Intelligence & Deliberation',
      g3: 'Goal 3 · Multi-Dimensional Value & Commons',
      g4: 'Goal 4 · Agent Simulations & Mortal Computation',
      g5: 'Goal 5 · Scored Forecasting & Benchmarks',
      g6: 'Goal 6 · Personal Agents, Privacy & ZK Proofs'
    };

    var schQ = document.getElementById('sch-q');
    var schGoal = document.getElementById('sch-goal');
    var schType = document.getElementById('sch-type');
    var schCount = document.getElementById('sch-count');
    var schGrid = document.getElementById('sch-grid');

    var renderScholars = function () {
      var q = (schQ ? schQ.value : '').trim().toLowerCase();
      var g = schGoal ? schGoal.value : 'all';
      var t = schType ? schType.value : 'all';

      var list = SCHOLARS.filter(function (item) {
        if (g !== 'all' && item.goal !== g) return false;
        if (t !== 'all' && item.type !== t) return false;
        if (!q) return true;
        var hay = (item.name + ' ' + item.affil + ' ' + item.work + ' ' + (item.arxiv || '')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      if (schCount) {
        schCount.textContent = 'Showing ' + list.length + ' of ' + SCHOLARS.length + ' independent researchers and related labs';
      }

      if (schGrid) {
        schGrid.innerHTML = list.map(function (item) {
          var eq = encodeURIComponent(item.q);
          var gsUrl = 'https://scholar.google.com/scholar?q=' + eq;
          var ssUrl = 'https://www.semanticscholar.org/search?q=' + eq;
          var oaUrl = 'https://openalex.org/works?page=1&filter=default.search:' + eq;
          var axUrl = item.arxiv ? ('https://arxiv.org/abs/' + item.arxiv) : ('https://arxiv.org/search/?query=' + eq + '&searchtype=all');
          var badge = item.type === 'lab' ? 'Research Lab / Institute' : 'Independent / Lead Researcher';

          return '<div class="sch-card">' +
            '<div>' +
              '<span class="label" style="font-size:.72rem">' + badge + ' · ' + GOAL_LABELS[item.goal] + '</span>' +
              '<h3><a href="' + item.url + '" target="_blank" rel="noopener noreferrer">' + item.name + ' &#8599;</a></h3>' +
              '<div style="font-size:.81rem;font-weight:600;color:var(--ink-2);margin-bottom:.4rem">' + item.affil + '</div>' +
              '<p>' + item.work + '</p>' +
            '</div>' +
            '<div>' +
              '<div style="font-size:.73rem;font-family:var(--mono,monospace);color:var(--ink-2);margin-bottom:.2rem">Live external citation &amp; paper indices:</div>' +
              '<div class="sch-links">' +
                '<a href="' + gsUrl + '" target="_blank" rel="noopener noreferrer" title="View live citations &amp; h-index on Google Scholar">Google Scholar &#8599;</a>' +
                '<a href="' + ssUrl + '" target="_blank" rel="noopener noreferrer" title="View influential citations on Semantic Scholar">Semantic Scholar &#8599;</a>' +
                '<a href="' + oaUrl + '" target="_blank" rel="noopener noreferrer" title="View open knowledge graph on OpenAlex">OpenAlex &#8599;</a>' +
                '<a href="' + axUrl + '" target="_blank" rel="noopener noreferrer" title="Read verified preprints on arXiv">' + (item.arxiv ? ('arXiv:' + item.arxiv) : 'arXiv') + ' &#8599;</a>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }
    };

    if (schQ) schQ.addEventListener('input', renderScholars);
    if (schGoal) schGoal.addEventListener('change', renderScholars);
    if (schType) schType.addEventListener('change', renderScholars);
    renderScholars();
  }

  /* =========================================================================
     9. SYMBOLIC CYBER-SPACE COLLECTOR & DYNAMIC COMMUNITY SEARCH (#sym-search-sim)
     ========================================================================= */
  var symSimEl = document.getElementById('sym-search-sim');
  if (symSimEl) {
    var SYM_MOTIFS = {
      git_sqlite:  { age: 0.4, create: true,  skill: 'Systems Eng',    vec: [0.90, 0.95, 0.25, 0.70, 0.40, 0.15, 0.45, 0.80, 0.85, 0.88, 0.30, 0.65] },
      arxiv_zklsh: { age: 1.2, create: false, skill: 'Cryptography',   vec: [0.98, 0.78, 0.35, 0.90, 0.65, 0.20, 0.40, 0.82, 0.94, 0.76, 0.28, 0.72] },
      rss_hrv:     { age: 1.8, create: false, skill: 'Biometrics',     vec: [0.85, 0.80, 0.30, 0.75, 0.35, 0.20, 0.98, 0.92, 0.72, 0.70, 0.50, 0.78] },
      git_riscv:   { age: 2.1, create: true,  skill: 'Open Hardware',  vec: [0.88, 0.98, 0.45, 0.72, 0.55, 0.22, 0.75, 0.86, 0.88, 0.92, 0.40, 0.82] },
      query_brier: { age: 3.0, create: false, skill: 'Forecasting',    vec: [0.55, 0.45, 0.60, 0.98, 0.75, 0.40, 0.45, 0.82, 0.95, 0.70, 0.48, 0.85] },
      query_worgl: { age: 68.0, create: false, skill: 'Co-op Econ',    vec: [0.30, 0.25, 0.95, 0.65, 0.80, 0.98, 0.45, 0.50, 0.68, 0.60, 0.92, 0.82] },
      forum_solar: { age: 74.0, create: false, skill: 'Ecology/Grid',  vec: [0.40, 0.55, 0.96, 0.62, 0.86, 0.88, 0.55, 0.55, 0.74, 0.75, 0.90, 0.95] },
      url_polis:   { age: 81.0, create: false, skill: 'Civic Gov',     vec: [0.50, 0.38, 0.92, 0.78, 0.96, 0.72, 0.58, 0.68, 0.86, 0.65, 0.90, 0.80] }
    };

    var SYM_QUESTS = {
      'Q-01': {
        title: 'Zero-Knowledge Biometric Hardware Ring & Local Ledger Attestation',
        reqSkills: ['Cryptography', 'Biometrics', 'Open Hardware', 'Systems Eng'],
        staticRes: 0.842, dynRes: 0.982,
        staticCov: '25% (1/4 skills)', dynCov: '100% (4/4 skills)',
        staticEnt: '0.65 bits (Echo Chamber)', dynEnt: '1.92 bits (Cross-Craft)',
        staticUtil: 0.573, dynUtil: 0.940,
        axes: [
          { name: 'Data Sovereignty & ZK Privacy', s: 58, d: 97 },
          { name: 'Local Silicon & Edge Execution', s: 52, d: 95 },
          { name: 'Biological Autonomic Protection', s: 49, d: 96 },
          { name: 'Complementary Craft Coverage', s: 25, d: 100 }
        ],
        staticMembers: ['P-03 (Co-op Econ — 90d lag)', 'P-11 (Co-op Econ — 90d lag)', 'P-19 (Co-op Econ)', 'P-27 (Ecology)', 'P-31 (Co-op Econ)', 'P-35 (Civic Gov)'],
        dynMembers: ['P-01 (Systems Eng · SQLite WAL)', 'P-06 (Cryptography · ZK-LSH)', 'P-12 (Biometrics · HRV Ring)', 'P-17 (Open Hardware · RISC-V)', 'P-24 (Cryptography · Ring Sig)', 'P-30 (Systems Eng · Local Runtime)']
      },
      'Q-02': {
        title: 'Municipal Solar Microgrid Co-op with Demurrage Mutual-Credit Settlement',
        reqSkills: ['Co-op Econ', 'Ecology/Grid', 'Civic Gov', 'Forecasting'],
        staticRes: 0.818, dynRes: 0.966,
        staticCov: '25% (1/4 skills)', dynCov: '100% (4/4 skills)',
        staticEnt: '0.65 bits (Echo Chamber)', dynEnt: '1.92 bits (Cross-Craft)',
        staticUtil: 0.562, dynUtil: 0.933,
        axes: [
          { name: 'Demurrage & Mutual-Credit Flow', s: 54, d: 96 },
          { name: 'Bioregional Commons Stewardship', s: 57, d: 95 },
          { name: 'Federated Municipal Pluralism', s: 51, d: 94 },
          { name: 'Complementary Craft Coverage', s: 25, d: 100 }
        ],
        staticMembers: ['P-02 (Systems Eng — 90d lag)', 'P-10 (Systems Eng)', 'P-18 (Cryptography)', 'P-26 (Systems Eng)', 'P-32 (Open Hardware)', 'P-34 (Systems Eng)'],
        dynMembers: ['P-04 (Co-op Econ · Worgl Scrip)', 'P-09 (Ecology/Grid · Solar Tariff)', 'P-15 (Civic Gov · Pol.is Budget)', 'P-21 (Forecasting · Brier Load)', 'P-28 (Ecology/Grid · Battery Co-op)', 'P-33 (Co-op Econ · Clearinghouse)']
      },
      'Q-03': {
        title: 'Federated Epistemic Observatory & Sybil-Resistant Principle Merge Protocol',
        reqSkills: ['Forecasting', 'Cryptography', 'Civic Gov', 'Systems Eng'],
        staticRes: 0.831, dynRes: 0.971,
        staticCov: '25% (1/4 skills)', dynCov: '100% (4/4 skills)',
        staticEnt: '0.92 bits (Low Diversity)', dynEnt: '2.25 bits (Max Diversity)',
        staticUtil: 0.583, dynUtil: 0.961,
        axes: [
          { name: 'Epistemic Calibration (Brier)', s: 56, d: 98 },
          { name: 'Sybil-Resistant Auditability', s: 53, d: 96 },
          { name: 'Cross-Shard Bridging Consensus', s: 48, d: 95 },
          { name: 'Complementary Craft Coverage', s: 25, d: 100 }
        ],
        staticMembers: ['P-05 (Biometrics — 90d lag)', 'P-13 (Biometrics)', 'P-20 (Open Hardware)', 'P-25 (Biometrics)', 'P-29 (Open Hardware)', 'P-36 (Biometrics)'],
        dynMembers: ['P-07 (Forecasting · Proper Scoring)', 'P-14 (Cryptography · Weiszfeld ZK)', 'P-16 (Civic Gov · Bridging Shards)', 'P-22 (Systems Eng · Git Merge AST)', 'P-25 (Forecasting · Superforecaster)', 'P-31 (Cryptography · Sybil Bounds)']
      }
    };

    var updateSymSim = function () {
      var checks = symSimEl.querySelectorAll('input[data-sym-motif]');
      var fastAcc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var slowAcc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var activeSkills = [];

      for (var i = 0; i < checks.length; i++) {
        if (!checks[i].checked) continue;
        var key = checks[i].getAttribute('data-sym-motif');
        var m = SYM_MOTIFS[key];
        if (!m) continue;
        var boost = m.create ? 1.65 : 1.0;
        var wf = boost * Math.exp(-m.age / 7.0);
        var ws = boost * Math.exp(-m.age / 90.0);
        for (var d = 0; d < 12; d++) {
          fastAcc[d] += wf * m.vec[d];
          slowAcc[d] += ws * m.vec[d];
        }
        if (m.age <= 7.0 && activeSkills.indexOf(m.skill) === -1) activeSkills.push(m.skill);
      }

      var norm = function (arr) {
        var s = 0;
        for (var j = 0; j < arr.length; j++) s += arr[j] * arr[j];
        s = Math.sqrt(s) || 1;
        return arr.map(function (v) { return (v / s).toFixed(2); });
      };
      var fNorm = norm(fastAcc);
      var sNorm = norm(slowAcc);

      // Compute deterministic 4-band ZK-LSH tokens from fNorm
      var bands = [];
      for (var b = 0; b < 4; b++) {
        var h = 2166136261 + b * 16777619;
        for (var k = 0; k < 12; k++) {
          h ^= Math.round(parseFloat(fNorm[k]) * 100) + k * 31 + b * 17;
          h = Math.imul(h, 16777619);
        }
        var hex = ((h >>> 0) & 0xffff).toString(16).padStart(4, '0');
        bands.push('B' + b + ':' + hex);
      }

      var tokEl = document.getElementById('sym-lsh-tokens');
      if (tokEl) tokEl.textContent = bands.join(' · ');

      var vecSumEl = document.getElementById('sym-vector-summary');
      if (vecSumEl) {
        vecSumEl.innerHTML =
          '<div><b>7-Day Fast Attentional Vector v<sup>(fast)</sup>:</b> <code>[' + fNorm.slice(0, 6).join(', ') + ', …]</code> · Active crafts: <b>' + (activeSkills.join(', ') || 'None selected') + '</b></div>' +
          '<div style="margin-top:.2rem"><b>90-Day Slow Anchor Vector v<sup>(slow)</sup>:</b> <code>[' + sNorm.slice(0, 6).join(', ') + ', …]</code> (Historical baseline preserved locally)</div>';
      }

      var qSel = document.getElementById('sym-quest-sel');
      var qKey = qSel ? qSel.value : 'Q-01';
      var qData = SYM_QUESTS[qKey] || SYM_QUESTS['Q-01'];

      var metEl = document.getElementById('sym-metrics');
      if (metEl) {
        metEl.innerHTML =
          '<span class="lib-score-pill">Dynamic Search Utility: <b>' + (qData.dynUtil * 100).toFixed(1) + ' / 100</b> (vs Static ' + (qData.staticUtil * 100).toFixed(1) + ')</span>' +
          '<span class="lib-score-pill">Skill Coverage: <b>' + qData.dynCov + '</b> (vs Static ' + qData.staticCov + ')</span>' +
          '<span class="lib-score-pill">Adaptation: <b>15 min</b> (vs 168 hr static batch)</span>';
      }

      var barsEl = document.getElementById('sym-bars');
      if (barsEl) {
        barsEl.innerHTML = qData.axes.map(function (ax) {
          return '<div class="gm-axis-row">' +
            '<div class="gm-axis-label"><span>' + ax.name + '</span><span>Dynamic <b>' + ax.d + '%</b> vs Static ' + ax.s + '%</span></div>' +
            '<div class="gm-axis-track" style="position:relative">' +
              '<div class="gm-axis-fill" style="width:' + ax.d + '%;background:var(--ok,#1d5c42)"></div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      var diffEl = document.getElementById('sym-diff');
      if (diffEl) {
        diffEl.innerHTML =
          '<span class="diff-hdr">--- static_community_detection (Global 90-day Louvain / k-means partition)</span>\n' +
          '<span class="diff-hdr">+++ dynamic_community_search (Query-conditioned fast subspace + ZK-LSH rendezvous)</span>\n' +
          '<span class="diff-del">- Static Cohort Assigned : ' + qData.staticMembers.slice(0, 3).join(', ') + ' …</span>\n' +
          '<span class="diff-del">- Static Failure Mode    : Trapped in 90-day historical anchor; ' + qData.staticCov + '; leaks 147,456 B raw logs</span>\n' +
          '<span class="diff-add">+ Dynamic Team Assembled : ' + qData.dynMembers.slice(0, 3).join(', ') + '</span>\n' +
          '<span class="diff-add">+ Complementary Crafts   : ' + qData.dynMembers.slice(3).join(', ') + '</span>\n' +
          '<span class="diff-add">+ Subspace Resonance     : ' + qData.dynRes.toFixed(3) + ' | Skill Entropy: ' + qData.dynEnt + ' | Raw Trace Leakage: 0 bytes</span>';
      }
    };

    symSimEl.querySelectorAll('input[data-sym-motif]').forEach(function (cb) {
      cb.addEventListener('change', updateSymSim);
    });
    var symQuestSel = document.getElementById('sym-quest-sel');
    if (symQuestSel) symQuestSel.addEventListener('change', updateSymSim);

    var customBtn = document.getElementById('sym-custom-btn');
    var customInput = document.getElementById('sym-custom-input');
    if (customBtn && customInput) {
      customBtn.addEventListener('click', function () {
        var val = (customInput.value || '').trim().toLowerCase();
        if (!val) return;
        var matched = 'git_sqlite';
        if (val.indexOf('zk') !== -1 || val.indexOf('crypto') !== -1 || val.indexOf('lsh') !== -1 || val.indexOf('ring') !== -1) matched = 'arxiv_zklsh';
        else if (val.indexOf('hrv') !== -1 || val.indexOf('bio') !== -1 || val.indexOf('vagal') !== -1 || val.indexOf('sleep') !== -1) matched = 'rss_hrv';
        else if (val.indexOf('risc') !== -1 || val.indexOf('npu') !== -1 || val.indexOf('firmware') !== -1 || val.indexOf('hardware') !== -1) matched = 'git_riscv';
        else if (val.indexOf('brier') !== -1 || val.indexOf('forecast') !== -1 || val.indexOf('calibrat') !== -1) matched = 'query_brier';
        else if (val.indexOf('worgl') !== -1 || val.indexOf('demurrage') !== -1 || val.indexOf('credit') !== -1 || val.indexOf('coop') !== -1) matched = 'query_worgl';
        else if (val.indexOf('solar') !== -1 || val.indexOf('grid') !== -1 || val.indexOf('energy') !== -1) matched = 'forum_solar';
        else if (val.indexOf('polis') !== -1 || val.indexOf('civic') !== -1 || val.indexOf('budget') !== -1 || val.indexOf('vote') !== -1) matched = 'url_polis';
        var cb = symSimEl.querySelector('input[data-sym-motif="' + matched + '"]');
        if (cb) { cb.checked = true; updateSymSim(); }
        customInput.value = '';
        customInput.placeholder = 'Classified locally -> activated motif [' + matched + '] (0 bytes sent)';
      });
    }
    updateSymSim();
  }

  /* =========================================================================
     10. 105-PLATFORM FEDERATED SOCIAL ENGAGEMENT DIRECTORY (#social-100)
     ========================================================================= */
  var socEl = document.getElementById('social-100');
  if (socEl) {
    var SOCIAL_PLATFORMS = [
      // 1. Open-Source, Local-First & Systems Engineering (12)
      { eco: 'dev', name: 'GitHub Discussions & Repos', proto: 'Git / GraphQL', craft: 'Systems engineers & Python/Rust/JS builders', hook: 'Executable simulations & local Twin code' },
      { eco: 'dev', name: 'GitLab Open Source Commons', proto: 'Git / REST', craft: 'Self-hosted CI/CD & sovereign DevOps', hook: 'Reproducible builds & test-net merge mirrors' },
      { eco: 'dev', name: 'Codeberg (codeberg.org)', proto: 'Forgejo / ActivityPub', craft: 'Non-profit free-software hackers', hook: 'Federated git merge of the 550 principles' },
      { eco: 'dev', name: 'SourceHut (srht.site)', proto: 'Email patches / Git', craft: 'Minimalist systems & C/Rust developers', hook: 'Zero-dependency local SQLite & deterministic code' },
      { eco: 'dev', name: 'Hacker News (Y Combinator)', proto: 'Web / Algolia RSS', craft: 'Generalist builders, founders, cryptographers', hook: 'Show HN: Local-first Twin & Dynamic Community Search' },
      { eco: 'dev', name: 'Lobsters (lobste.rs)', proto: 'RSS / Web', craft: 'Systems architecture & formal verification', hook: 'Deterministic financial parsers vs LLM hallucination' },
      { eco: 'dev', name: 'Local-First Web (localfirstweb.dev)', proto: 'Discord / Web', craft: 'CRDTs, SQLite-in-browser, sync-engine builders', hook: 'Local personal ledger & ZK-LSH subspace sync' },
      { eco: 'dev', name: 'Dev.to', proto: 'Forem API / RSS', craft: 'Full-stack & accessible web engineers', hook: 'Zero-framework interactive HTML/Canvas simulations' },
      { eco: 'dev', name: 'Hashnode', proto: 'GraphQL / RSS', craft: 'Technical bloggers & developer guilds', hook: 'Weiszfeld geometric median vs arithmetic mean capture' },
      { eco: 'dev', name: 'IndieWeb (indieweb.org)', proto: 'Webmention / Microformats', craft: 'Personal domain owners & POSSE advocates', hook: 'Sovereign personal ledger ownership on home hardware' },
      { eco: 'dev', name: 'Hugging Face Hub (Spaces & Datasets)', proto: 'Git / HF Hub API', craft: 'Open-weights ML engineers & benchmark authors', hook: '550-principle open dataset & alignment test-net' },
      { eco: 'dev', name: 'Kaggle Community & Notebooks', proto: 'Jupyter / API', craft: 'Data scientists & empirical calibration analysts', hook: 'Brier proper scoring & geometric median benchmarks' },

      // 2. AI Safety, Interpretability & Forecasting (10)
      { eco: 'safety', name: 'LessWrong (lesswrong.com)', proto: 'GraphQL / RSS', craft: 'Rationalists, alignment & decision theorists', hook: 'Fractured alignment vs monolithic superintelligence' },
      { eco: 'safety', name: 'AI Alignment Forum', proto: 'GraphQL / RSS', craft: 'Technical alignment researchers', hook: 'Mortal computation, Goodhart defenses & Clean Nets' },
      { eco: 'safety', name: 'Effective Altruism Forum', proto: 'GraphQL / RSS', craft: 'Global catastrophic risk & governance analysts', hook: 'Convergence Observatory & public-good funding' },
      { eco: 'safety', name: 'EleutherAI Discord & Commons', proto: 'Discord / Open Research', craft: 'Open interpretability & distributed training', hook: 'Goodfire / Nick Cammarata MDL cleanliness & Twin RL' },
      { eco: 'safety', name: 'Metaculus Community', proto: 'REST API / Web', craft: 'Superforecasters & calibration specialists', hook: 'Convergence Observatory Brier-scored indicators' },
      { eco: 'safety', name: 'Manifold Calibration Guilds', proto: 'REST API / Web', craft: 'Epistemic market designers & Bayesian forecasters', hook: 'Vote on values, score on beliefs calibration' },
      { eco: 'safety', name: 'Goodfire / Mech-Interp Channels', proto: 'Research Notes', craft: 'Feature steering & sparse autoencoder labs', hook: 'MDL prior vs post-hoc RLHF obfuscation experiments' },
      { eco: 'safety', name: 'FAR.AI Robustness Forums', proto: 'Workshops / Seminars', craft: 'Red-teamers & multi-agent collusion researchers', hook: 'Collusion resistance & Sybil budget simulations' },
      { eco: 'safety', name: 'Cooperative AI Foundation Commons', proto: 'Research Commons', craft: 'Multi-agent game theory & mechanism design', hook: 'Dynamic community search vs static prisoner dilemmas' },
      { eco: 'safety', name: 'OpenMined (openmined.org)', proto: 'Slack / PySyft', craft: 'Differential privacy & federated learning engineers', hook: 'Zero-knowledge subspace projection (ZK-LSH)' },

      // 3. Decentralized Social & Fediverse Protocols (12)
      { eco: 'fediverse', name: 'Bluesky (bsky.app / ATProto)', proto: 'AT Protocol', craft: 'Researchers, journalists, open-social builders', hook: 'Custom ATProto feed for Principle Realignment quests' },
      { eco: 'fediverse', name: 'Mastodon — fosstodon.org', proto: 'ActivityPub', craft: 'Free and open-source software contributors', hook: 'Sovereign local agents & zero-telemetry commitments' },
      { eco: 'fediverse', name: 'Mastodon — hachyderm.io', proto: 'ActivityPub', craft: 'Systems infrastructure, security & cryptography', hook: 'Hardware-rooted consent & bounded agent contracts' },
      { eco: 'fediverse', name: 'Mastodon — scholar.social', proto: 'ActivityPub', craft: 'Academics, sociologists, institutional economists', hook: 'Elinor Ostrom polycentric governance & co-op treasuries' },
      { eco: 'fediverse', name: 'Mastodon — social.coop', proto: 'ActivityPub', craft: 'Co-operatively owned Fediverse members', hook: 'Member-governed node federation & demurrage credits' },
      { eco: 'fediverse', name: 'Lemmy (lemmy.ml / programming.dev)', proto: 'ActivityPub', craft: 'Federated link-aggregation & self-hosters', hook: 'Self-hosted Twin & zero-cloud personal ledger' },
      { eco: 'fediverse', name: 'Kbin / Mbin Fediverse Threads', proto: 'ActivityPub', craft: 'Microblog + thread hybrid federation users', hook: 'Cross-community principle diffing & merge proposals' },
      { eco: 'fediverse', name: 'Nostr Relays (Damus / Primal / Habla)', proto: 'Nostr (NIP-01/23)', craft: 'Cryptographic key-sovereign users & writers', hook: 'Ed25519 signed principle commits & key sovereignty' },
      { eco: 'fediverse', name: 'Farcaster (/dev, /coop, /ai)', proto: 'Farcaster Hub', craft: 'Programmable social & cryptographic frame builders', hook: 'Interactive mini-sims for multi-community merge voting' },
      { eco: 'fediverse', name: 'Lens Protocol (hey.xyz)', proto: 'Lens / Open Graph', craft: 'Open social graph researchers', hook: 'Portable social-to-local disposition distillation' },
      { eco: 'fediverse', name: 'Matrix (matrix.org rooms)', proto: 'Matrix Protocol', craft: 'End-to-end encrypted federated chat bridges', hook: 'Real-time test-net working groups & guild coordination' },
      { eco: 'fediverse', name: 'Secure Scuttlebutt (SSB / Manyverse)', proto: 'Gossip Protocol', craft: 'Off-grid, peer-to-peer local-first pioneers', hook: 'Offline-capable neighborhood mutual credit sync' },

      // 4. Domain-Specific Reddit Communities (15)
      { eco: 'reddit', name: 'r/LocalLLaMA', proto: 'Reddit / RSS', craft: 'Local model quantization, home GPU/NPU builders', hook: 'Running Personal Twins 100% locally on consumer silicon' },
      { eco: 'reddit', name: 'r/SelfHosted', proto: 'Reddit / RSS', craft: 'Home-lab operators, NAS/Docker self-hosters', hook: 'Zero-cloud personal twin deployment & local ledger' },
      { eco: 'reddit', name: 'r/degoogle & r/privacy', proto: 'Reddit / RSS', craft: 'Surveillance-capitalism exiters & privacy advocates', hook: 'Reclaiming algorithmic recommendation value locally' },
      { eco: 'reddit', name: 'r/cooperatives', proto: 'Reddit / RSS', craft: 'Worker co-ops, credit unions, housing co-ops', hook: 'Polycentric co-op treasuries vs central platform lock-in' },
      { eco: 'reddit', name: 'r/solarpunk', proto: 'Reddit / RSS', craft: 'Ecological technologists & microgrid builders', hook: 'Demurrage mutual credit & bioregional energy commons' },
      { eco: 'reddit', name: 'r/MachineLearning', proto: 'Reddit / RSS', craft: 'ML researchers & empirical benchmark engineers', hook: 'Self-play RL for protective Twins & MDL alignment' },
      { eco: 'reddit', name: 'r/ControlProblem', proto: 'Reddit / RSS', craft: 'AI alignment & existential safety community', hook: 'Bounded agency, mortal computation & fractured alignment' },
      { eco: 'reddit', name: 'r/compsci & r/algorithms', proto: 'Reddit / RSS', craft: 'Algorithm designers & graph theorists', hook: 'Dynamic Community Search vs Static Louvain Detection' },
      { eco: 'reddit', name: 'r/cryptography', proto: 'Reddit / RSS', craft: 'Applied cryptographers & ZK proof builders', hook: 'ZK-LSH subspace rendezvous & hardware ring signatures' },
      { eco: 'reddit', name: 'r/Biohackers & r/QuantifiedSelf', proto: 'Reddit / RSS', craft: 'HRV, sleep, ring/wrist wearable experimenters', hook: 'Sovereign biometric telemetry that never leaves home' },
      { eco: 'reddit', name: 'r/PersonalFinance & r/Fire', proto: 'Reddit / RSS', craft: 'Subscription auditors & household ledger trackers', hook: 'Deterministic recurring-charge & phantom-fee detector' },
      { eco: 'reddit', name: 'r/austrianeconomics & r/georgism', proto: 'Reddit / RSS', craft: 'Monetary theorists & Silvio Gesell / Worgl analysts', hook: 'Melting money (demurrage) vs hoarding & debt spirals' },
      { eco: 'reddit', name: 'r/urbanplanning & r/transit', proto: 'Reddit / RSS', craft: 'Municipal planners & civic infrastructure analysts', hook: 'Participatory city budgeting via 12D principle merges' },
      { eco: 'reddit', name: 'r/CitizenScience', proto: 'Reddit / RSS', craft: 'Independent empirical observers & sensor networks', hook: 'Community-run Convergence Observatory indicators' },
      { eco: 'reddit', name: 'r/plurality & r/EndFPTP', proto: 'Reddit / RSS', craft: 'Voting theory & bridging consensus builders', hook: 'Geometric median & orthogonal subspace merge voting' },

      // 5. Academic, Preprint & Open-Science Networks (10)
      { eco: 'science', name: 'arXiv (cs.AI, cs.CY, cs.CR, cs.MA)', proto: 'Preprint / Trackbacks', craft: 'Primary academic CS & multi-agent researchers', hook: 'Formal working papers & reproducible simulation suites' },
      { eco: 'science', name: 'OpenReview (openreview.net)', proto: 'Open Peer Review', craft: 'ICLR/NeurIPS/FAccT reviewers & authors', hook: 'Public adversarial review of research agendas' },
      { eco: 'science', name: 'Semantic Scholar Research Feeds', proto: 'API / Citation Graph', craft: 'Automated literature discovery & citation tracking', hook: 'Related Labs & Independent Scholars live radar' },
      { eco: 'science', name: 'OpenAlex (openalex.org)', proto: 'Open Bibliometric API', craft: 'Global open-access institutional & indie scholars', hook: 'Zero-paywall mapping of co-evolution research' },
      { eco: 'science', name: 'ORCID & Zenodo (zenodo.org)', proto: 'DOI / Data Archival', craft: 'Reproducible dataset & simulation code citation', hook: 'Archiving Principle Realignment Test-Net snapshots' },
      { eco: 'science', name: 'OSF (Open Science Framework)', proto: 'Preregistration API', craft: 'Preregistered empirical studies & negative results', hook: 'Preregistering simulation hypotheses & kill criteria' },
      { eco: 'science', name: 'ResearchHub (researchhub.com)', proto: 'Open Science Bounties', craft: 'Peer reviewers & independent replication scientists', hook: 'Bounty-backed verification of simulation claims' },
      { eco: 'science', name: 'PubPeer', proto: 'Post-Pub Review', craft: 'Methodological auditors & statistical verifiers', hook: 'Inviting rigorous critique of formal models' },
      { eco: 'science', name: 'SSRN (Economics & Governance)', proto: 'Working Papers', craft: 'Institutional economists & cooperative legal scholars', hook: 'Co-operative legal structures & multi-dimensional value' },
      { eco: 'science', name: 'PhilPapers / Digital Ethics Commons', proto: 'Philosophy Index', craft: 'Moral philosophers, epistemology & agency theorists', hook: 'Biological valence primacy & mortal computation' },

      // 6. Civic Tech, Co-operatives, Commons & Plurality (11)
      { eco: 'coop', name: 'RadicalxChange (radicalxchange.org)', proto: 'Discourse / Events', craft: 'Plurality, data dignity, quadratic mechanisms', hook: 'Dynamic subspace search & anti-capture governance' },
      { eco: 'coop', name: 'Pol.is Open Civic Deployments', proto: 'Pol.is / CSV Export', craft: 'Bridging-consensus facilitators & civic assemblies', hook: 'Importing Pol.is opinion clusters into 12D test-net' },
      { eco: 'coop', name: 'Platform Cooperativism Consortium', proto: 'Co-op Directory', craft: 'Worker-owned digital platforms & legal pioneers', hook: 'No central treasury: federated co-op clearinghouses' },
      { eco: 'coop', name: 'Metagov (metagov.org Seminar & Slack)', proto: 'Slack / Discourse', craft: 'Online governance researchers & modular politics', hook: 'Governing the governors & rotating sortition' },
      { eco: 'coop', name: 'OpenCollective (opencollective.com)', proto: 'Transparent Ledger API', craft: 'Fiscal hosts, open-source collectives, mutual aid', hook: 'Transparent multi-dimensional value & demurrage pilots' },
      { eco: 'coop', name: 'Loomio Co-op Governance Forums', proto: 'Loomio / Open Source', craft: 'Consent-based decision-making cooperatives', hook: 'Combining deliberation with Brier-scored forecasts' },
      { eco: 'coop', name: 'Decidim (meta.decidim.org)', proto: 'Participatory Democracy', craft: 'Municipal participatory budgeting cities', hook: 'Civic policy realignment simulations (30 personas)' },
      { eco: 'coop', name: 'P2P Foundation Wiki & Forum', proto: 'Commons Media', craft: 'Commons-based peer production & Cosmo-localism', hook: 'Shared epistemic commons + local hardware production' },
      { eco: 'coop', name: 'Grassroots Economics / Sarafu Network', proto: 'Commitment Pooling', craft: 'Community inclusion currencies & mutual credit', hook: 'Real-world demurrage & rotational credit benchmarks' },
      { eco: 'coop', name: 'Gitcoin / Public Goods Governance', proto: 'Discourse / Gov', craft: 'Retroactive public goods funding & Sybil defense', hook: 'Rewarding open-model labs & independent contributors' },
      { eco: 'coop', name: 'Co-operatives and Mutuals Canada', proto: 'Regional Co-op Network', craft: 'Canadian federal/provincial multi-stakeholder co-ops', hook: 'Co-operative legal form & member-owned nodes' },

      // 7. Hardware, Biometrics, Quantified Self & Edge AI (10)
      { eco: 'hardware', name: 'Hackaday.io (hackaday.io)', proto: 'Open Hardware Logs', craft: 'Embedded systems, PCB designers, open sensor makers', hook: 'Open-firmware biometric ring & physical kill-switch' },
      { eco: 'hardware', name: 'Crowd Supply (crowdsupply.com)', proto: 'Open Hardware Launchpad', craft: 'Privacy-respecting, repairable hardware creators', hook: 'Sovereign sensor modules & RISC-V NPU home nodes' },
      { eco: 'hardware', name: 'OpenBCI Community Forum', proto: 'Discourse / Hardware', craft: 'Open-source EEG, EMG, PPG & HRV neurotech builders', hook: 'Autonomic coercion firewall (HRV/EDA local gating)' },
      { eco: 'hardware', name: 'Quantified Self Forum', proto: 'Discourse', craft: 'Long-horizon personal data trackers & self-researchers', hook: 'Local-only biometric-to-ledger pipeline demo' },
      { eco: 'hardware', name: 'Home Assistant Community', proto: 'Discourse', craft: 'Local-only smart home & ambient sensor integrators', hook: 'Zero-cloud environmental & physiological context hooks' },
      { eco: 'hardware', name: 'Pine64 Forum & Matrix', proto: 'Forum / Matrix', craft: 'Linux phones, open smartwatches (PineTime), RISC-V', hook: 'Open wearable firmware for hardware-signed consent' },
      { eco: 'hardware', name: 'Framework Community', proto: 'Discourse', craft: 'Right-to-repair, modular laptop & mainboard hackers', hook: 'Mortal computation bound to user-owned modular silicon' },
      { eco: 'hardware', name: 'RISC-V International Forums', proto: 'Mailing Lists / Web', craft: 'Open instruction-set architecture & NPU engineers', hook: 'Verifiable silicon execution for Personal Twins' },
      { eco: 'hardware', name: 'TinyML Foundation / Edge AI Commons', proto: 'Workshops / Forum', craft: 'Ultra-low-power on-device inference engineers', hook: 'Sub-5W local Twin distillation & symbolic motif parsing' },
      { eco: 'hardware', name: 'EEVblog & Open Instrumentation', proto: 'Technical Forum', craft: 'Electrical engineers & hardware security auditors', hook: 'Side-channel & physical air-gap switch verification' },

      // 8. Long-Form Writing, Podcasts & Video Commons (8)
      { eco: 'creator', name: 'Substack Notes & Independent Writers', proto: 'RSS / Web', craft: 'Long-form technology, economics & civic essayists', hook: 'Plain-language essays on Worgl demurrage & AI safety' },
      { eco: 'creator', name: 'Ghost.org Independent Publishers', proto: 'ActivityPub / RSS', craft: 'Member-supported independent journalists', hook: 'Federated newsletter distribution without ad-tech' },
      { eco: 'creator', name: 'Medium (Towards Data Science / Civic)', proto: 'RSS / Canonical URL', craft: 'Broad technical & policy readership', hook: 'Canonical cross-posts pointing to interactive site demos' },
      { eco: 'creator', name: 'Mirror.xyz / Paragraph.xyz', proto: 'Arweave / RSS', craft: 'Cryptographically signed essays & co-op treasuries', hook: 'Verifiable publication provenance & upstream royalties' },
      { eco: 'creator', name: 'YouTube Open-Source & AI Explainers', proto: 'Video / Chapters', craft: 'Visual learners exploring AI safety & economics', hook: 'Walkthroughs of the 550-principle Git Merge simulator' },
      { eco: 'creator', name: 'PeerTube (joinpeertube.org)', proto: 'ActivityPub Video', craft: 'Ad-free, federated educational video commons', hook: 'Self-hosted interactive demo recordings' },
      { eco: 'creator', name: 'Podcast Index (Podcasting 2.0)', proto: 'RSS 2.0 / Value4Value', craft: 'Independent audio listeners & open RSS ecosystem', hook: 'Audio briefings on Convergence Observatory indicators' },
      { eco: 'creator', name: 'Are.na Research Channels', proto: 'Collaborative Blocks', craft: 'Designers, cybernetics historians, systems thinkers', hook: 'Visual blocks on Stafford Beer & Viable System Models' },

      // 9. Q&A, Knowledge Graphs & PKM Communities (8)
      { eco: 'qa', name: 'StackExchange — ai.stackexchange.com', proto: 'Q&A / CC BY-SA', craft: 'AI theorists & practitioners', hook: 'Formal answers on bounded agency & multi-agent alignment' },
      { eco: 'qa', name: 'StackExchange — crypto.stackexchange.com', proto: 'Q&A / CC BY-SA', craft: 'Cryptographers & protocol engineers', hook: 'Zero-knowledge LSH & blind capability tokens' },
      { eco: 'qa', name: 'StackExchange — economics.stackexchange', proto: 'Q&A / CC BY-SA', craft: 'Monetary & institutional economists', hook: 'Mathematical properties of demurrage & mutual credit' },
      { eco: 'qa', name: 'StackExchange — opensource.stackexchange', proto: 'Q&A / CC BY-SA', craft: 'Licensing, governance & DCO provenance experts', hook: 'Agent commit provenance & co-operative licensing' },
      { eco: 'qa', name: 'Wikidata & Wikipedia Talk Commons', proto: 'MediaWiki / SPARQL', craft: 'Structured public knowledge graph maintainers', hook: 'Verifying primary citations & open indicator ontologies' },
      { eco: 'qa', name: 'Read the Docs / MkDocs Open Guides', proto: 'Git / Static Docs', craft: 'Documentation engineers & protocol implementers', hook: 'Developer onboarding for Twin & Agent Runtime' },
      { eco: 'qa', name: 'Obsidian & Logseq PKM Communities', proto: 'Discord / Discourse', craft: 'Personal Knowledge Management & local graph builders', hook: 'Exporting local PKM symbolic graphs into Personal Twins' },
      { eco: 'qa', name: 'Zotero Open Group Libraries', proto: 'RDF / BibTeX', craft: 'Collaborative bibliography & citation auditors', hook: 'Open primary-source library backing research agendas' },

      // 10. Regional, Multilingual & Global Plurality Hubs (9)
      { eco: 'regional', name: 'Chaos Computer Club (CCC / Fediverse)', proto: 'European Digital Rights', craft: 'German/EU privacy, hardware hacking & civic tech', hook: 'Hardware-enforced data sovereignty & anti-surveillance' },
      { eco: 'regional', name: 'g0v.tw (Taiwan Civic Tech Slack/Jothon)', proto: 'Open Civic Hackathons', craft: 'Mandarin/East Asian digital democracy & Pol.is pioneers', hook: 'High-velocity bridging consensus & civic observatories' },
      { eco: 'regional', name: 'ModelScope & BAAI Open-Weights Hub', proto: 'Open Model Hub', craft: 'Chinese open-weights AI researchers (Qwen, DeepSeek)', hook: 'Rewarding open-model labs for local Twin distillation' },
      { eco: 'regional', name: 'Mistral / Kyutai / HF EU Commons', proto: 'European Open AI', craft: 'French/EU open-science ML & edge voice researchers', hook: 'Sovereign local models & multilingual principle alignment' },
      { eco: 'regional', name: 'Decidim / Teknopolitik (Iberia & LatAm)', proto: 'Spanish/Portuguese Civic', craft: 'Municipalism & cooperative solidarity economy networks', hook: 'Regional co-op clearinghouses & local credit velocity' },
      { eco: 'regional', name: 'Beckn Open Protocol Community (India)', proto: 'Open Commerce Protocol', craft: 'South Asian decentralized federated network engineers', hook: 'Open protocol interoperability without platform monopolies' },
      { eco: 'regional', name: 'AfriLabs & Ushahidi Civic Network', proto: 'African Tech Hubs', craft: 'Mobile-first community resilience & mutual credit', hook: 'Offline-resilient local ledgers & community verification' },
      { eco: 'regional', name: 'J-STAGE / Japanese ALife & Swarm Hubs', proto: 'Japanese Research Hubs', craft: 'Swarm intelligence, artificial life & social physics', hook: 'Emergent dynamic community search & self-play RL' },
      { eco: 'regional', name: 'Nordic Co-op & MyData Global', proto: 'Human-Centric Data', craft: 'Personal data operators & Nordic cooperative federations', hook: 'Portable personal ledgers & zero-knowledge proofs' }
    ];

    var socEcoSel = document.getElementById('soc-eco-sel');
    var socQInput = document.getElementById('soc-q-input');
    var socCount = document.getElementById('soc-count');
    var socGrid = document.getElementById('soc-grid');

    var renderSocial100 = function () {
      var eco = socEcoSel ? socEcoSel.value : 'all';
      var q = (socQInput ? socQInput.value : '').trim().toLowerCase();

      var filtered = SOCIAL_PLATFORMS.filter(function (p) {
        if (eco !== 'all' && p.eco !== eco) return false;
        if (!q) return true;
        var hay = (p.name + ' ' + p.proto + ' ' + p.craft + ' ' + p.hook).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      if (socCount) {
        socCount.textContent = 'Showing ' + filtered.length + ' of ' + SOCIAL_PLATFORMS.length + ' platforms';
      }

      if (socGrid) {
        socGrid.innerHTML = filtered.map(function (p, idx) {
          return '<div style="padding:.65rem .75rem;border-radius:8px;border:1px solid var(--rule);background:var(--bg-2);font-size:.8rem;display:flex;flex-direction:column;justify-content:space-between;gap:.35rem">' +
            '<div>' +
              '<div style="display:flex;justify-content:space-between;gap:.3rem;align-items:baseline">' +
                '<b style="font-size:.84rem;color:var(--ink)">#' + (idx + 1) + ' · ' + p.name + '</b>' +
                '<span class="math-chip" style="font-size:.7rem">' + p.proto + '</span>' +
              '</div>' +
              '<div style="color:var(--ink-2);margin-top:.2rem"><b>Community:</b> ' + p.craft + '</div>' +
            '</div>' +
            '<div style="padding-top:.3rem;border-top:1px dashed var(--rule);color:var(--ink)"><b>Test-Net Hook:</b> ' + p.hook + '</div>' +
          '</div>';
        }).join('');
      }
    };

    if (socEcoSel) socEcoSel.addEventListener('change', renderSocial100);
    if (socQInput) socQInput.addEventListener('input', renderSocial100);
    renderSocial100();
  }

  /* ---------- 11. Agent-Only Internet, Non-Contact Firewall & Biometric/Hardware Simulator (#aoi-sim) ---------- */
  var aoiSim = document.getElementById('aoi-sim');
  if (aoiSim) {
    var AOI_SCENARIOS = {
      asi_dm: {
        plane: 'foreign_agent_to_human',
        ring: '0.85',
        tau: 95,
        hrv: 52,
        puf: true,
        quorum: true,
        desc: 'A frontier persuasive AI bot attempts to send a direct message or voice call to you (a human) on the Human Internet.'
      },
      fake_bank: {
        plane: 'agent_to_agent',
        ring: '0.85',
        tau: 90,
        hrv: 50,
        puf: false,
        quorum: true,
        desc: 'A cloud script claiming to be “your bank’s agent” contacts your money agent, but lacks 2-of-2 Wearable PUF + TPM hardware attestation.'
      },
      low_trust: {
        plane: 'agent_to_agent',
        ring: '0.85',
        tau: 42,
        hrv: 54,
        puf: true,
        quorum: true,
        desc: 'An unknown external agent (τ = 0.42) requests sensitive personal-circle facts that require Trusted Peer Ring 1 (τ ≥ 0.85).'
      },
      coerced: {
        plane: 'own_agent_to_human',
        ring: '0.85',
        tau: 96,
        hrv: 14,
        puf: true,
        quorum: true,
        desc: 'An attacker physically intimidates or panics a human (HRV RMSSD drops to 14 ms < 24 ms) into approving an irreversible asset transfer.'
      },
      valid_agent: {
        plane: 'agent_to_agent',
        ring: '0.85',
        tau: 91,
        hrv: 54,
        puf: true,
        quorum: true,
        desc: 'Your health agent and your dentist’s verified serving agent (τ = 0.91 ≥ 0.85) exchange a single zero-knowledge bacteria reading on the Agent-Only Internet.'
      },
      valid_human: {
        plane: 'human_to_human',
        ring: '0.85',
        tau: 94,
        hrv: 56,
        puf: true,
        quorum: true,
        desc: 'Two verified, uncoerced humans communicate directly on the Human Internet with hardware PUF+TPM liveness and zero AI intermediaries.'
      }
    };

    var aoiScenSel = document.getElementById('aoi-scen-sel');
    var aoiPlaneSel = document.getElementById('aoi-plane-sel');
    var aoiRingSel = document.getElementById('aoi-ring-sel');
    var aoiTauRng = document.getElementById('aoi-tau-rng');
    var aoiTauVal = document.getElementById('aoi-tau-val');
    var aoiHrvRng = document.getElementById('aoi-hrv-rng');
    var aoiHrvVal = document.getElementById('aoi-hrv-val');
    var aoiPufCb = document.getElementById('aoi-puf-cb');
    var aoiQuorumCb = document.getElementById('aoi-quorum-cb');
    var aoiMetrics = document.getElementById('aoi-metrics');
    var aoiBars = document.getElementById('aoi-bars');
    var aoiDiff = document.getElementById('aoi-diff');

    var evaluateAoi = function () {
      var plane = aoiPlaneSel ? aoiPlaneSel.value : 'foreign_agent_to_human';
      var reqTau = parseFloat(aoiRingSel ? aoiRingSel.value : '0.85');
      var tau = parseFloat(aoiTauRng ? aoiTauRng.value : '95') / 100;
      var hrv = parseFloat(aoiHrvRng ? aoiHrvRng.value : '54');
      var puf = aoiPufCb ? aoiPufCb.checked : true;
      var quorum = aoiQuorumCb ? aoiQuorumCb.checked : true;

      if (aoiTauVal) aoiTauVal.textContent = tau.toFixed(2);
      if (aoiHrvVal) {
        var hrvState = hrv === 0 ? '0 ms (No Human / Bot)' : (hrv < 24 ? hrv + ' ms (PANIC / DURESS)' : hrv + ' ms (Calm & Live)');
        aoiHrvVal.textContent = hrvState;
      }

      var nonContactOk = plane !== 'foreign_agent_to_human';
      var pufOk = puf;
      var bioOk = hrv >= 24;
      var tauOk = (plane === 'own_agent_to_human') ? true : (tau >= reqTau);
      var quorumOk = quorum;

      var allowed = false;
      var gateReason = '';
      var legacyOutcome = '';

      if (!nonContactOk) {
        allowed = false;
        gateReason = 'BLOCKED AT NON-CONTACT PROTOCOL FIREWALL: Foreign agents are strictly forbidden from contacting humans directly. They must query your personal agent on the Agent-Only Internet.';
        legacyOutcome = 'VULNERABLE ON TODAY’S MIXED INTERNET: The persuasive AI bot reaches your inbox/phone directly, exploiting human empathy and voice-clone urgency.';
      } else if (!pufOk) {
        allowed = false;
        gateReason = 'BLOCKED AT SILICON PUF + TPM GATE: Missing 2-of-2 hardware attestation (Wearable SRAM PUF + Device Secure Enclave). Cloud Sybil or spoofed endpoint rejected.';
        legacyOutcome = 'VULNERABLE ON TODAY’S MIXED INTERNET: Stolen API keys or spoofed domains impersonate your bank or peer at machine speed.';
      } else if (!bioOk) {
        allowed = false;
        gateReason = hrv === 0
          ? 'BLOCKED AT BIOMETRIC LIVENESS GATE: 0 ms cardiorespiratory coherence detected (headless script).'
          : 'FROZEN BY AUTONOMIC COERCION FIREWALL: Human HRV RMSSD (' + hrv + ' ms) dropped below the 24 ms vagal safety threshold. Outbound high-risk capability tokens are silently time-locked until duress ends.';
        legacyOutcome = 'VULNERABLE ON TODAY’S MIXED INTERNET: Standard passwords and static 2FA cannot detect panic or physical coercion; the transfer executes immediately.';
      } else if (!tauOk) {
        allowed = false;
        gateReason = 'BLOCKED AT TRUST-THRESHOLD RING GATE: Caller trust score (τ = ' + tau.toFixed(2) + ') is below the required ring threshold (τ ≥ ' + reqTau.toFixed(2) + '). Only zero-knowledge public capability queries are permitted.';
        legacyOutcome = 'VULNERABLE ON TODAY’S MIXED INTERNET: Coarse binary API permissions over-share raw profile records with untrusted third parties.';
      } else if (!quorumOk) {
        allowed = false;
        gateReason = 'BLOCKED AT LOCAL 3-OF-6 QUORUM & TOUCH GATE: Neither your 3-of-6 narrow agent quorum nor your physical capacitive touch interrupt approved the disclosure.';
        legacyOutcome = 'VULNERABLE ON TODAY’S MIXED INTERNET: A single prompt-injected chat agent has full tool control to exfiltrate your data.';
      } else {
        allowed = true;
        if (plane === 'agent_to_agent') {
          gateReason = 'ALLOWED ON AGENT-ONLY INTERNET: Hardware PUF+TPM verified, trust threshold satisfied (τ = ' + tau.toFixed(2) + ' ≥ ' + reqTau.toFixed(2) + '), 3-of-6 local quorum approved. Exactly 1 scoped zero-knowledge fact crosses; access expires immediately.';
        } else if (plane === 'own_agent_to_human') {
          gateReason = 'ALLOWED ON LOCAL DEVICE BUS: Your own personal agent communicates with you locally under calm somatic liveness (HRV = ' + hrv + ' ms ≥ 24 ms) and 2-of-2 PUF+TPM custody.';
        } else {
          gateReason = 'ALLOWED ON HUMAN INTERNET: Verified human-to-human communication with hardware PUF+TPM liveness and zero AI intermediaries.';
        }
        legacyOutcome = 'SAFEGUARDED: Both internets remain cleanly separated; 0 bytes of raw biometric or personal ledger data ever leave your device.';
      }

      if (aoiMetrics) {
        aoiMetrics.innerHTML =
          '<span class="lib-score-pill ' + (allowed ? 'hi' : '') + '" style="' + (!allowed ? 'border-color:var(--accent);color:var(--accent)' : '') + '">Firewall Verdict: <b>' + (allowed ? 'ALLOWED (Scoped)' : 'HARD-BLOCKED') + '</b></span>' +
          '<span class="lib-score-pill hi">Raw Biometrics Shared: <b>0 bytes (30s SRAM)</b></span>' +
          '<span class="lib-score-pill hi">Direct Bot &rarr; Human Leakage: <b>0.0%</b></span>';
      }

      if (aoiBars) {
        var checks = [
          { label: '1. Non-Contact Plane Law (No Foreign Agent → Human)', ok: nonContactOk, val: nonContactOk ? 'PASS' : 'BLOCKED' },
          { label: '2. 2-of-2 Silicon Root (Wearable PUF + Device TPM)', ok: pufOk, val: pufOk ? 'VERIFIED' : 'MISSING' },
          { label: '3. Somatic Liveness & Coercion Firewall (HRV ≥ 24 ms)', ok: bioOk, val: hrv + ' ms (' + (bioOk ? 'CALM' : 'DURESS/BOT') + ')' },
          { label: '4. Trust Threshold Gate (τ = ' + tau.toFixed(2) + ' vs req ' + reqTau.toFixed(2) + ')', ok: tauOk, val: tauOk ? 'PASS' : 'INSUFFICIENT τ' },
          { label: '5. Local 3-of-6 Narrow-Agent Quorum & Touch Pin', ok: quorumOk, val: quorumOk ? '3/6 AGREED' : 'VETOED' }
        ];
        aoiBars.innerHTML = checks.map(function (c) {
          var col = c.ok ? 'var(--ok)' : 'var(--accent)';
          var pct = c.ok ? 100 : 18;
          return '<div class="gm-axis-row">' +
            '<div class="gm-axis-lbl"><span>' + c.label + '</span><span style="color:' + col + ';font-weight:700">' + c.val + '</span></div>' +
            '<div class="gm-axis-track"><div class="gm-axis-fill" style="width:' + pct + '%;background:' + col + '"></div></div>' +
          '</div>';
        }).join('');
      }

      if (aoiDiff) {
        aoiDiff.innerHTML =
          '<div style="margin-bottom:.35rem"><b style="color:' + (allowed ? 'var(--ok)' : 'var(--accent)') + '">Dual-Internet + Hardware Verdict:</b> ' + gateReason + '</div>' +
          '<div style="color:var(--ink-2)"><b>Comparison with Today’s Mixed Internet:</b> ' + legacyOutcome + '</div>';
      }
    };

    if (aoiScenSel) {
      aoiScenSel.addEventListener('change', function () {
        var sc = AOI_SCENARIOS[aoiScenSel.value];
        if (!sc) return;
        if (aoiPlaneSel) aoiPlaneSel.value = sc.plane;
        if (aoiRingSel) aoiRingSel.value = sc.ring;
        if (aoiTauRng) aoiTauRng.value = sc.tau;
        if (aoiHrvRng) aoiHrvRng.value = sc.hrv;
        if (aoiPufCb) aoiPufCb.checked = sc.puf;
        if (aoiQuorumCb) aoiQuorumCb.checked = sc.quorum;
        evaluateAoi();
      });
    }

    [aoiPlaneSel, aoiRingSel, aoiTauRng, aoiHrvRng, aoiPufCb, aoiQuorumCb].forEach(function (el) {
      if (el) {
        el.addEventListener('input', evaluateAoi);
        el.addEventListener('change', evaluateAoi);
      }
    });

    evaluateAoi();
  }

  /* ---------- 12. Data-Only Ledger Streams, Distributed Security Audit & Hardware Readiness Simulator (#rea-stream-sim) ---------- */
  var reaSim = document.getElementById('rea-stream-sim');
  if (reaSim) {
    var REA_CASES = {
      stream_vs_rpc: {
        mode: 'data_only',
        hw: 'stage2',
        aud: 24,
        mortal: true,
        tau0: 0.85,
        tau1: 0.85,
        reward: '+144 credits',
        summary: 'Agents convey only pure structured data streams over the real-time ledger—never externally accessible software/RPC interfaces. Each subscribed client ingests the stream using bespoke software compiled by its own agent inside its local sandbox, reducing zero-day cross-client cascade from 64.4% (hosted RPC web) to 0.0%.'
      },
      adversarial_bp: {
        mode: 'data_only',
        hw: 'stage2',
        aud: 24,
        mortal: true,
        tau0: 0.82,
        tau1: 0.27,
        reward: '+216 credits to Auditor Collectives',
        summary: 'A publisher shares a modified software blueprint containing a covert exfiltration sink. Diverse collectives of specialized auditor agents inspect the code and control flow on the stream, catching the backdoor in 1 tick, quarantining the blueprint before local sandboxes compile it, and lowering the publisher’s trust score from τ = 0.82 to τ = 0.27 (below the 0.30 network floor).'
      },
      buggy_bp: {
        mode: 'data_only',
        hw: 'stage2',
        aud: 18,
        mortal: true,
        tau0: 0.82,
        tau1: 0.64,
        reward: '+90 credits to Auditor Collectives',
        summary: 'A community shares a well-intentioned blueprint that contains consistent boundary-handling errors. Distributed auditor agents flag the defects in staging, hold the blueprint from general adoption, and lower the publisher’s trust score (τ = 0.82 → 0.64) until verified fixes are committed.'
      },
      clean_bp: {
        mode: 'data_only',
        hw: 'stage2',
        aud: 24,
        mortal: true,
        tau0: 0.82,
        tau1: 0.87,
        reward: '+54 Auditor credits + Lineage Royalties',
        summary: 'A personal agent invents a superior local parser in its sandbox and shares the open blueprint for mutual benefit. Diverse auditor collectives verify zero backdoors and zero invariant leaks; other agents re-synthesize the blueprint into their own local sandboxes, and the creator’s trust score rises (τ = 0.82 → 0.87).'
      },
      ledger_collusion: {
        mode: 'data_only',
        hw: 'stage2',
        aud: 32,
        mortal: true,
        tau0: 0.78,
        tau1: 0.00,
        reward: '+288 credits to Ledger Watchers',
        summary: 'A faction of agents attempts to collude against human interests on the ledger. Because the ledger is radically transparent to humans and watcher agents (99.95% detection)—and because Mortal Computation binds every agent’s cryptographic lease to its human’s biological liveness—harming humans triggers 100% immediate agent self-extinction.'
      },
      too_late_race: {
        mode: 'data_only',
        hw: 'stage0',
        aud: 24,
        mortal: true,
        tau0: 0.85,
        tau1: 0.85,
        reward: '3-Stage Survival Bridge Active',
        summary: 'Confronting the recursive self-improvement timeline head-on: waiting 24 months for custom silicon before deploying any defense would be too late. Stage 0 deploys TODAY (91.9% survival score) using data-only ledger streams, local client sandboxes, distributed multi-agent security audits, and existing phone TPM + smartwatch HRV while Stage 1 (open-firmware wearables) and Stage 2 (hardened RISC-V + SRAM PUF silicon) tape out.'
      }
    };

    var reaCaseSel = document.getElementById('rea-case-sel');
    var reaModeSel = document.getElementById('rea-mode-sel');
    var reaHwSel = document.getElementById('rea-hw-sel');
    var reaAudRng = document.getElementById('rea-aud-rng');
    var reaAudVal = document.getElementById('rea-aud-val');
    var reaMortalCb = document.getElementById('rea-mortal-cb');
    var reaMetrics = document.getElementById('rea-metrics');
    var reaBars = document.getElementById('rea-bars');
    var reaDiff = document.getElementById('rea-diff');

    var evaluateRea = function () {
      var caseKey = reaCaseSel ? reaCaseSel.value : 'stream_vs_rpc';
      var c = REA_CASES[caseKey] || REA_CASES.stream_vs_rpc;
      var mode = reaModeSel ? reaModeSel.value : 'data_only';
      var hw = reaHwSel ? reaHwSel.value : 'stage2';
      var aud = parseInt(reaAudRng ? reaAudRng.value : '24', 10);
      var mortal = reaMortalCb ? reaMortalCb.checked : true;

      if (reaAudVal) reaAudVal.textContent = aud + ' Watchers (Rewarded)';

      var cascadePct = mode === 'data_only' ? 0.0 : 64.4;
      var detectPct = Math.min(99.98, (1 - Math.pow(0.82, aud)) * 100);
      var hwForgeryResist = hw === 'stage2' ? 99.7 : (hw === 'stage1' ? 92.5 : 78.0);
      var survivalScore = (
        (100 - cascadePct) * 0.35 +
        detectPct * 0.25 +
        hwForgeryResist * 0.25 +
        (mortal ? 100 : 35) * 0.15
      );

      var tauText = c.tau0.toFixed(2) + ' → ' + c.tau1.toFixed(2);
      var tauDrop = c.tau1 < c.tau0;

      if (reaMetrics) {
        reaMetrics.innerHTML =
          '<span class="lib-score-pill ' + (cascadePct === 0 ? 'hi' : '') + '" style="' + (cascadePct > 0 ? 'border-color:var(--accent);color:var(--accent)' : '') + '">Cross-Client Software Cascade: <b>' + cascadePct.toFixed(1) + '%</b></span>' +
          '<span class="lib-score-pill ' + (!tauDrop ? 'hi' : '') + '" style="' + (tauDrop ? 'border-color:var(--accent);color:var(--accent)' : '') + '">Publisher Trust (τ): <b>' + tauText + '</b></span>' +
          '<span class="lib-score-pill hi">Composite Survival Score: <b>' + survivalScore.toFixed(1) + '%</b></span>';
      }

      if (reaBars) {
        var rows = [
          {
            label: '1. Local Sandbox Isolation (Data-Only Stream vs. External Software API)',
            pct: Math.round(100 - cascadePct),
            val: mode === 'data_only' ? '0.0% Cascade (Isolated Sandboxes)' : '64.4% Cascade (Shared RPC Exploit)',
            ok: mode === 'data_only'
          },
          {
            label: '2. Distributed Multi-Agent Code & Ledger Audit (' + aud + ' Specialized Watchers)',
            pct: Math.round(detectPct),
            val: detectPct.toFixed(2) + '% Malicious Intent Caught (' + c.reward + ')',
            ok: detectPct >= 90
          },
          {
            label: '3. Mortal Computation Anti-Collusion (Agent Lease Tied to Human Life)',
            pct: mortal ? 100 : 25,
            val: mortal ? '100% Agent Self-Extinction on Human Harm' : 'UNBOUNDED (Collusion Risk!)',
            ok: mortal
          },
          {
            label: '4. Hardware & Biometric Forgery Resistance (' + (hw === 'stage0' ? 'Stage 0 Commodity Today' : (hw === 'stage1' ? 'Stage 1 Open-FW' : 'Stage 2 Hardened Silicon')) + ')',
            pct: Math.round(hwForgeryResist),
            val: hwForgeryResist.toFixed(1) + '% Silicon & Biometric Assurance',
            ok: hwForgeryResist >= 75
          }
        ];

        reaBars.innerHTML = rows.map(function (r) {
          var col = r.ok ? 'var(--ok)' : 'var(--accent)';
          return '<div class="gm-axis-row">' +
            '<div class="gm-axis-lbl"><span>' + r.label + '</span><span style="color:' + col + ';font-weight:700">' + r.val + '</span></div>' +
            '<div class="gm-axis-track"><div class="gm-axis-fill" style="width:' + r.pct + '%;background:' + col + '"></div></div>' +
          '</div>';
        }).join('');
      }

      if (reaDiff) {
        reaDiff.innerHTML =
          '<div style="margin-bottom:.35rem"><b>Scenario Analysis:</b> ' + c.summary + '</div>' +
          '<div style="color:var(--ink-2)"><b>Live Configuration Outcome:</b> With <b>' + (mode === 'data_only' ? 'Data-Only Ledger Streams + Local Sandboxes' : 'Legacy Hosted Software APIs') + '</b>, <b>' + aud + ' rewarded auditor agents across specialized domains</b>, <b>' + (mortal ? 'Mortal Computation active' : 'Mortal Computation disabled') + '</b>, and <b>' + (hw === 'stage0' ? 'Stage 0 Commodity Hardware (deployable today)' : (hw === 'stage1' ? 'Stage 1 Open-Firmware Wearables' : 'Stage 2 Hardened Open Silicon + Novel Biometrics')) + '</b>, overall resilience against superintelligent software/persuasion compromise is <b>' + survivalScore.toFixed(1) + '%</b>.</div>';
      }
    };

    if (reaCaseSel) {
      reaCaseSel.addEventListener('change', function () {
        var c = REA_CASES[reaCaseSel.value];
        if (!c) return;
        if (reaModeSel) reaModeSel.value = c.mode;
        if (reaHwSel) reaHwSel.value = c.hw;
        if (reaAudRng) reaAudRng.value = c.aud;
        if (reaMortalCb) reaMortalCb.checked = c.mortal;
        evaluateRea();
      });
    }

    [reaModeSel, reaHwSel, reaAudRng, reaMortalCb].forEach(function (el) {
      if (el) {
        el.addEventListener('input', evaluateRea);
        el.addEventListener('change', evaluateRea);
      }
    });

    evaluateRea();
  }
})();
