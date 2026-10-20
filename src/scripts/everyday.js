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
    var quickBtns = [].slice.call(document.querySelectorAll('[data-q]'));

    // Map which personas reference which principle ID
    var prPersonas = {};
    if (window.CIN_THIRTY_PERSONAS) {
      window.CIN_THIRTY_PERSONAS.forEach(function (pe) {
        pe.principles.forEach(function (id) {
          if (!prPersonas[id]) prPersonas[id] = [];
          prPersonas[id].push(pe);
        });
      });
    }

    // Populate unique categories
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

    var renderLibrary = function () {
      var q = (qInput ? qInput.value : '').trim().toLowerCase();
      var cat = catSelect ? catSelect.value : '';
      var rng = rangeSelect ? rangeSelect.value : 'all';

      var filtered = allPr.filter(function (p) {
        if (cat && p.cat !== cat) return false;
        if (rng === 'raw' && p.id > 434) return false;
        if (rng === 'new' && p.id < 435) return false;
        if (rng === 'top' && p.score < 95) return false;
        if (!q) return true;
        var hay = ('#' + p.id + ' ' + p.title + ' ' + p.cat + ' ' + p.claim + ' ' + p.critique + ' ' + p.steelman + ' ' + p.grounding).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      if (countEl) {
        countEl.textContent = 'Showing ' + filtered.length + ' of 550 principles' + (cat ? ' in “' + cat + '”' : '') + (q ? ' matching “' + q + '”' : '');
      }

      libGrid.innerHTML = filtered.map(function (p) {
        var badge = p.id <= 434 ? 'Brainstorm #' + p.id : 'Safeguard #' + p.id;
        var who = prPersonas[p.id] ? prPersonas[p.id].map(function (pe) {
          return '<a href="/notes/thirty-lives" class="pe-ptag">' + pe.pid + ' (' + pe.role + ')</a>';
        }).join(' ') : '';
        return '<details class="lib-card" id="p' + p.id + '">' +
          '<summary>' +
            '<span class="lib-num">#' + p.id + '</span>' +
            '<div class="lib-sum-main"><b>' + p.title + '</b><span class="lib-cat">' + p.cat + ' · ' + badge + '</span></div>' +
            '<span class="lib-score" title="Composite co-evolution &amp; network value score">' + p.score.toFixed(1) + '</span>' +
          '</summary>' +
          '<div class="lib-body">' +
            '<p><b>What it says:</b> ' + p.claim + '</p>' +
            '<p class="prc-crit"><b>The critic’s challenge:</b> ' + p.critique + '</p>' +
            '<p class="prc-steel"><b>Strongest defense (steelman):</b> ' + p.steelman + '</p>' +
            '<p><b>How humans &amp; personal agents ground it:</b> ' + p.grounding + '</p>' +
            (who ? '<p><b>Lives in our 30-persona simulation that rely on this:</b> ' + who + '</p>' : '') +
          '</div>' +
        '</details>';
      }).join('');
    };

    if (qInput) qInput.addEventListener('input', renderLibrary);
    if (catSelect) catSelect.addEventListener('change', renderLibrary);
    if (rangeSelect) rangeSelect.addEventListener('change', renderLibrary);
    quickBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (qInput) qInput.value = b.getAttribute('data-q') || '';
        renderLibrary();
      });
    });

    renderLibrary();

    // If URL has #p123, open and scroll to that principle
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
    var elW = document.getElementById('dm-wealth'), elWV = document.getElementById('dm-wealth-v');
    var elSt = document.getElementById('dm-stake'), elStV = document.getElementById('dm-stake-v');
    var elC = document.getElementById('dm-contrib'), elCV = document.getElementById('dm-contrib-v');
    var elFloor = document.getElementById('dm-floor-out');
    var elDecay = document.getElementById('dm-decay-out');
    var elEarn = document.getElementById('dm-earn-out');
    var elDmBar = document.getElementById('dm-bar');
    var elSum = document.getElementById('dm-summary');

    var updateDm = function () {
      var w = parseFloat(elW.value);
      var st = parseFloat(elSt.value) / 100;
      var c = parseFloat(elC.value);
      var floor = 25000;
      var protectedAmt = Math.min(w, floor);
      var surplus = Math.max(0, w - floor);
      var idleSurplus = surplus * (1 - st);
      var annualDecay = Math.round(idleSurplus * 0.08);
      var baseDividend = 8400; // Universal compute + demurrage commons dividend
      var work5d = Math.round(c * 365 * 0.95);
      var totalIn = baseDividend + work5d;

      elWV.textContent = '$' + Math.round(w).toLocaleString('en-US');
      elStV.textContent = Math.round(st * 100) + '%';
      elCV.textContent = Math.round(c) + ' / 100';
      elFloor.textContent = '$' + Math.round(protectedAmt).toLocaleString('en-US') + ' (0% decay)';
      elDecay.textContent = annualDecay === 0 ? '$0 / yr' : '-$' + annualDecay.toLocaleString('en-US') + ' / yr recycled to commons';
      elEarn.textContent = '+$' + totalIn.toLocaleString('en-US') + ' / yr';
      elDmBar.style.width = Math.min(100, Math.max(8, Math.round(c))) + '%';

      if (w <= floor) {
        elSum.innerHTML = '<b>Net 1-year outcome:</b> Because your balance ($' + Math.round(w).toLocaleString('en-US') + ') is within the $25,000 personal security floor, you pay <b>$0 in demurrage</b>—and receive <b>+$' + totalIn.toLocaleString('en-US') + '/yr</b> from your 5-dimensional work credits and the universal commons dividend.';
      } else {
        var savedByStaking = Math.round(surplus * st * 0.08);
        elSum.innerHTML = '<b>Net 1-year outcome:</b> Your first $25,000 is 100% exempt. By investing ' + Math.round(st * 100) + '% of your surplus into zero-interest community projects, you exempt $' + Math.round(surplus * st).toLocaleString('en-US') + ' (saving $' + savedByStaking.toLocaleString('en-US') + '/yr), while $' + annualDecay.toLocaleString('en-US') + '/yr of idle surplus recycles into the universal commons pool.';
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
            pkt: 'SENSOR_ENCLAVE -> H_human: 0.9704 | Activity: CLINICAL_CARE_8.5H | SleepDebt: +2.4h | RawBiometricsShared: 0 bytes'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (On Your Device)',
            title: '2-of-2 hardware signature records the shift in her private log',
            desc: 'Her ring’s un-copyable silicon key and her phone’s security chip co-sign the event into her encrypted Personal Ledger (Level 0 air-gapped memory). No hospital administrator, insurer or cloud server can read her private log.',
            pkt: 'PERSONAL_DAG_APPEND -> Sig_RingPUF + Sig_PhoneTPM | Event #4812: 8.5h ER Care | FatigueFlag: HIGH_RECOVERY_NEEDED'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Her outward agent proves the care happened—without exposing anyone',
            desc: 'Maria’s Level-1 Personal Negotiator generates a zero-knowledge proof co-signed by the hospital co-op and treated patients’ agents. It proves 8.5 hours of verified critical care occurred without revealing a single patient chart or Maria’s private health data.',
            pkt: 'SHARED_LEDGER_ZK_COMMIT -> Proof: pi_effort_9f3a | CounterpartyAttested: TRUE | IdentityLeakage: 0.0%'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & 4-Gate Training',
            title: 'Agents protect her recovery and learn from 30-day thriving',
            desc: 'The hospital’s Level-2/3 scheduling agent automatically blocks a dangerous back-to-back overtime assignment so Maria can sleep. Thirty days later, after her recovery is confirmed, the record passes the 4 quality gates to train better care-scheduling agents.',
            pkt: 'AGENT_ACTION -> OvertimeBlocked: TRUE | TrainingGate1_4: PASSED (30d Thriving Score: 94.6 / 100)'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (5D Value & Demurrage Floor)',
            title: 'Full 5-dimensional care pay + $0 demurrage on her savings',
            desc: 'Instead of an extractive wage squeezed by middlemen, the Shared Ledger credits Maria across five dimensions (Vital: 9.5, Effort: 9.2, Knowledge: 4.0, Ecology: 2.5, Lineage: 3.5). Her $4,200 savings sit safely inside the $25,000 personal security floor (0% demurrage), while 8%/yr demurrage on idle billionaire/robotic hoards funds her daily universal commons dividend.',
            pkt: 'ECONOMY_SETTLEMENT -> 5D_Credit: +$185 shift + $23/day Commons Dividend | SavingsFloor ($4,200 <= $25,000): 0% Demurrage'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (1 Voice & Power Scrutiny)',
            title: 'Equal voice on hospital rules; full transparency from management',
            desc: 'Because the staffing director holds Level-1 authority over livelihoods, every scheduling rule must be logged and explained to the nurses. On questions of values and safe staffing ratios, Maria’s personal agent casts one equal vote alongside every other affected worker—no wealth or hardware can buy extra weight.',
            pkt: 'GOVERNANCE_GATE -> ManagerVisibility: LEVEL_1_AUDITED | ValueVoteWeight: 1.000 (Equal Human Voice)'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Collective fatigue signals automatically evolve the network’s principles',
            desc: 'When 14,000 nurses’ agents report a 18% rise in night-shift exhaustion via anonymized zero-knowledge totals, the ledger and principle library morph in response: the network boosts Vital-care compensation weights by +12% and opens an evidence-backed proposal to tighten Principle #491 (Safe Care Staffing Bounds), steering the collective trajectory.',
            pkt: 'MORPHING_TRAJECTORY_UPDATE -> Signal: 14,000_Nurses_Fatigue_+18% | Principle #491 Updated | Trajectory Score: +1.4 toward thriving'
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
            pkt: 'SENSOR_ENCLAVE -> H_human: 0.9640 | Activity: REGENERATIVE_AG_7.5H | SoilCarbonDelta: +1.8% | RawBiometricsShared: 0 bytes'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (On Your Device)',
            title: 'Offline village mesh logs his labour and soil restoration locally',
            desc: 'Even while 2G cellular service is down, Jomo’s work clip and solar hub co-sign his daily work and soil readings into his encrypted Personal Ledger on his device.',
            pkt: 'PERSONAL_DAG_APPEND -> OfflineMeshSync: READY | Event #1904: 7.5h Field & Solar Care | DroughtShockIndex: 0.74'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Three independent satellite & drone watchers co-sign the ecological gain',
            desc: 'When connectivity returns, Jomo’s agent posts a zero-knowledge proof of crop yield and soil regeneration, cross-checked by three independent environmental watcher agents.',
            pkt: 'SHARED_LEDGER_ZK_COMMIT -> Proof: pi_eco_441b | IndependentWatchers: 3/3_AGREE | MiddlemanCut: 0%'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & 4-Gate Training',
            title: 'His agent bypasses extractive middlemen and matches local food co-ops',
            desc: 'Jomo’s Level-1 agent clears his harvest directly with three regional school-meal and household co-ops, and feeds verified drought-resilience patterns into the 4-gate agricultural training corpus.',
            pkt: 'AGENT_ACTION -> DirectCoopClearing: 100% | MiddlemanMarkupSaved: +58% to Farmer'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (5D Value & Debt Risk-Sharing)',
            title: 'Ecological & vital credits + automatic drought debt pause',
            desc: 'Because independent sensors confirmed a regional rainfall deficit, Jomo’s seed and solar-pump obligation automatically scales down with his ability to pay (Principle #255). He earns high Vital (8.4) and Ecological (9.1) value credits with 0% demurrage on his $1,800 savings.',
            pkt: 'ECONOMY_SETTLEMENT -> 5D_Credit: +$142/day | SeedDebtShockPause: ACTIVE (-65% payment) | Demurrage: $0'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (Watershed Commons Consent)',
            title: '800 family farmers hold a risk-scaled veto over industrial water grabs',
            desc: 'When an export estate requests extra river diversion during the drought (25% regional risk), the Shared Ledger requires 76.3% agreement from affected family farmers’ agents—blocking unilateral water depletion.',
            pkt: 'GOVERNANCE_GATE -> RiverDiversionRisk: 25% | RequiredQuorum: 76.3% | FamilyFarmersVeto: UPHELD'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Regional drought signals morph water-sharing and debt rules across the network',
            desc: 'As thousands of smallholder agents report shifting monsoon patterns, the ever-morphing ledger increases ecological watershed credits by +19% and updates Principle #456 (Climate-Indexed Debt Scaling) with new empirical thresholds.',
            pkt: 'MORPHING_TRAJECTORY_UPDATE -> Signal: EastAfrica_Monsoon_Shift | Principle #456 Threshold Refined'
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
            pkt: 'SENSOR_ENCLAVE -> H_human: 0.9666 | Activity: DEEP_CREATIVE_FLOW_4.0H | SyntheticSpamCheck: HUMAN_ORIGIN_VERIFIED'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (On Your Device)',
            title: 'Every brushstroke and code commit is hardware-signed into their personal DAG',
            desc: 'Before their work ever touches the web, their local agents bind a cryptographic provenance fingerprint to the creation timestamp in their Personal Ledgers.',
            pkt: 'PERSONAL_DAG_APPEND -> ProvenanceHash: sha256_88c1 | HumanAuthored: TRUE | License: OPEN_RECIPROCAL_LINEAGE'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Downstream AI models and companies use their building blocks',
            desc: 'When a commercial design studio or AI lab trains an adapter or ships software incorporating Camila’s visual style or Chidi’s code, the dependency graph on the Shared Ledger records the exact lineage link.',
            pkt: 'SHARED_LEDGER_ZK_COMMIT -> LineageEdge: [Chidi_Lib_v4, Camila_Art_Set] -> DownstreamModel_X | Depth: d=1..3'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & 4-Gate Training',
            title: 'Personal agents audit downstream usage and block uncredited scraping',
            desc: 'Independent Level-2 watcher agents verify the lineage graph across participating co-ops and open-weight labs, ensuring training runs respect compute bounds and creator attribution.',
            pkt: 'AGENT_ACTION -> LineageAudit: VERIFIED_BY_3_WATCHERS | UnconsentedScrapeBlocked: TRUE'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (Automatic Lineage Royalties)',
            title: 'Royalties flow upstream automatically—with zero lawsuits or exclusivity',
            desc: 'Every time the downstream tool generates value, up to 15% of the value flows back up the provenance tree (halving at each step up to 5 steps) straight into Camila’s and Chidi’s wallets, without requiring them to join a corporation.',
            pkt: 'ECONOMY_SETTLEMENT -> LineageRoyalty (alpha=0.5, d<=5): +$118/day Passive Reciprocity | StringsAttached: NONE'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (Open Standards & Fork Right)',
            title: 'Creators govern the attribution standard and can fork at any time',
            desc: 'No single platform monopoly owns the provenance directory. Creators vote equally on attribution decay rates and retain the full right to exit or fork with their entire history.',
            pkt: 'GOVERNANCE_GATE -> Standard: OPEN_PROVENANCE_DAG | VendorLockIn: 0% (Full Fork Right)'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Decompilation attempts trigger an automatic upgrade to lineage rules',
            desc: 'When collective signals show AI code-remixers trying to disguise copied functions by renaming variables, the ever-morphing principle library updates Principle #422 & #469 to measure semantic building-block equivalence rather than surface text.',
            pkt: 'MORPHING_TRAJECTORY_UPDATE -> Signal: AST_Semantic_Remix_Detected | Principle #469 Upgraded to Semantic-Graph Matching'
          }
        ]
      },
      oligarch: {
        label: '50,000-robot factory billionaire (Austin / Shenzhen)',
        stages: [
          {
            k: 'Stage 1 of 7 · Human & Lightweight Sensor (< 1 mW)',
            title: 'Victor attempts to launch a 50,000-bot energy market cornering script',
            desc: 'Victor’s own neural-earpiece proves he is 1 real human (H_human = 0.95), but the 50,000 cloud accounts he spun up have 0% biological cardio-kinetic entropy (H_human = 0.0011) and fail the silicon PUF gate immediately.',
            pkt: 'SENSOR_ENCLAVE -> Commander: 1 Real Human | 50,000 Cloud Bots: H_human=0.0011 -> REJECTED_AT_SILICON_GATE'
          },
          {
            k: 'Stage 2 of 7 · Personal Ledger Capture (Role Visibility)',
            title: 'Tier-3 mass-influence rules require continuous role attestation',
            desc: 'While Victor’s private family life and health stay 100% private, his role as owner of 50,000 industrial robots and massive compute clusters carries mandatory Level-3 public role attestation.',
            pkt: 'ROLE_LEDGER_APPEND -> Tier: LEVEL_3_MASS_INFLUENCE | RobotFleet: 50,000_UNITS | PrivateFamilyData: SHIELDED'
          },
          {
            k: 'Stage 3 of 7 · Zero-Knowledge Proof to Shared Ledger',
            title: 'Multi-vendor risk checkers flag 78% regional harm on the market order',
            desc: 'When Victor’s agent submits the regional grid-cornering order to the Shared Ledger, three independent risk-evaluating agents from different vendors flag a 78% risk of livelihood harm to 10,000 local households.',
            pkt: 'SHARED_LEDGER_ZK_COMMIT -> AssessedRisk: R=0.78 | BlastRadius: 10,000_Households | FakeBotsStripped: 50,000'
          },
          {
            k: 'Stage 4 of 7 · Bounded Agents & Risk-Scaled Lock',
            title: 'The 78%-risk gate requires 99.95% local resident consent—order blocked',
            desc: 'Under the Risk-Proportional Coherence Law, a 78%-risk action requires 99.95% agreement from the real people in the blast radius plus a 44-hour cooling-off window. Only 4% approve, so the swarm order locks shut.',
            pkt: 'AGENT_ACTION -> RequiredQuorum: 99.95% | ActualRealSupport: 4.0% -> BLOCKED_AT_THRESHOLD_GATE'
          },
          {
            k: 'Stage 5 of 7 · Economic Implications (Demurrage & Robot Commons Dividend)',
            title: 'Idle capital & robot output circulate back into the universal pool—or zero-interest loans',
            desc: 'Victor’s first $25,000 is exempt, but his idle multimillion-dollar hoard decays at 8%/yr unless he deploys it into zero-interest community infrastructure loans. Meanwhile, his 50,000-robot fleet contributes a direct automation share into the universal commons pool.',
            pkt: 'ECONOMY_SETTLEMENT -> IdleSurplusDemurrage: Recycled to Commons | ZeroInterestCoopStaking: 35% Exempt | Gini: 0.87 -> 0.58'
          },
          {
            k: 'Stage 6 of 7 · Governance Implications (No Purchased Authority)',
            title: 'Owning 50,000 robots still equals exactly 1 human vote on values',
            desc: 'In governance over safety floors and community values, Victor’s $5M balance and 50,000 robots grant him the exact same single voice as Maria the nurse or Jomo the farmer.',
            pkt: 'GOVERNANCE_GATE -> CapitalMultiplierOnValues: 0.0x | VoiceCount: 1.000'
          },
          {
            k: 'Stage 7 of 7 · Ever-Morphing Principle Library & Trajectory Shift',
            title: 'Attempted botnet bypasses harden the network’s anti-collusion principles',
            desc: 'Every blocked sybil or market-cornering attempt is logged as an adversarial signal, automatically updating the detector weights in Principle #205 & #524 so the entire network grows more resilient.',
            pkt: 'MORPHING_TRAJECTORY_UPDATE -> Signal: 50k_Sybil_Attempt_Blocked | Principle #524 Detector Weights Hardened'
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
})();

