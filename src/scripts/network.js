/* Outward side of the hero figure ("What you need"):
   Shows how your personal agent solves real everyday needs by stepping outward
   through 4 plain-language trust steps—starting on your own device, then
   people you trust, then verified task-solver guilds, and finally anonymous
   public offers—without ever exposing your raw identity or personal records. */
(function () {
  'use strict';
  var cv = document.getElementById('network');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = 'ui-monospace, Consolas, monospace';
  var SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  var TAU = Math.PI * 2;
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); }
  function lerp(a, b, k) { return a + (b - a) * k; }

  // 4 Plain-Language Outward Steps (Zero Greek variables or cryptographic jargon)
  var STEPS = [
    {
      num: 'STEP 1',
      title: 'On Your Device First',
      sub: 'Your own records & local simulator',
      badge: '100% Local'
    },
    {
      num: 'STEP 2',
      title: 'People You Trust',
      sub: 'Friends, neighbors & local co-ops',
      badge: 'Trusted Circle'
    },
    {
      num: 'STEP 3',
      title: 'Task-Solver Guilds',
      sub: 'Verified nurses, techs & coders',
      badge: 'Peer-Verified'
    },
    {
      num: 'STEP 4',
      title: 'Public Ledger & Rates',
      sub: 'Anonymous price & proof check',
      badge: 'Identity Hidden'
    }
  ];

  // 6 Grounded, Real-World Everyday Needs
  var NEEDS = [
    {
      id: 'bill',
      chip: 'Hospital bill check',
      title: 'Check an overcharged $4,200 hospital bill',
      youAsk: '“Why did an outpatient scan cost $4,200?”',
      keptPrivate: 'Full medical chart, patient name & ID stay on your phone (0 bytes uploaded).',
      maxStep: 2, // reaches Step 1 -> Step 3 (index 2: Task-Solver Guilds)
      activeSteps: [0, 2, 3],
      stepNotes: [
        'Reads itemized invoice PDF locally on your phone',
        'Skipped (no need to ask neighbors)',
        'Queries Clinical Billing Guild’s verified code rules',
        'Checks public Medicare & fair-price benchmark table'
      ],
      sharedFact: 'Only 4 billing codes (CPT numbers) & zip prefix—never your name',
      resultTitle: '3 duplicate billing codes caught · Bill cut from $4,200 to $680',
      resultProof: 'Backed by verified hospital billing rules + 18 audited patient dispute wins.',
      logHtml: 'Your agent checked your <b>$4,200 hospital bill</b> against the Clinical Billing Guild’s verified code rules without uploading your chart—flagging 3 duplicate charges and drafting a <b>$680 fair-rate settlement</b>.'
    },
    {
      id: 'roof',
      chip: 'Fix a roof / furnace leak',
      title: 'Find an honest local technician for an urgent leak',
      youAsk: '“Flashing leak over the kitchen—who does honest work nearby?”',
      keptPrivate: 'Your street address, home photos & budget stay on your device until you choose.',
      maxStep: 1, // reaches Step 2 (People You Trust) + Step 3 (Local Guild)
      activeSteps: [0, 1, 2],
      stepNotes: [
        'Checks your roof age & warranty file on device',
        'Asks 6 trusted neighbors’ agents for verified repairs',
        'Checks Local Trades Guild 30-day durability proofs',
        'Skipped (no public lead-generation spam)'
      ],
      sharedFact: 'General neighborhood & roof type only—zero lead-broker spam calls',
      resultTitle: 'Matched with Sam’s Co-op Roofing ($380 flat · 0% middleman cut)',
      resultProof: 'Verified by 2 neighbors whose repairs passed a 30-day rain check.',
      q: 'Introduce yourself to Sam’s Co-op Roofing (recommended by 2 neighbors, $380 flat rate)?',
      logHtml: 'Two neighbors’ agents vouched for <b>Sam’s Co-op Roofing</b> with verified 30-day repair proofs; you connected directly for <b>$380 with 0% middleman fee</b>.'
    },
    {
      id: 'bills',
      chip: 'Cut monthly bills',
      title: 'Lower your monthly power & prescription costs',
      youAsk: '“Am I overpaying on my electric plan or daily prescription?”',
      keptPrivate: '12 months of smart-meter usage & prescription history stay 100% on your device.',
      maxStep: 3,
      activeSteps: [0, 3],
      stepNotes: [
        'Analyzes 12 months of meter & pharmacy receipts locally',
        'Skipped (solved without personal circle)',
        'Skipped (standard public tariff comparison)',
        'Downloads public co-op utility & generic drug price tables'
      ],
      sharedFact: 'Nothing personal leaves your device—public rate tables come to you',
      resultTitle: 'Saves $115/month ($68/mo community solar rate + $47/mo generic switch)',
      resultProof: 'Calculated deterministically on your own device from verified public tariffs.',
      logHtml: 'Your agent downloaded public utility and pharmacy price tables and ran the math on your device—finding <b>$115/month in savings</b> while sharing <b>0 bytes</b> about you.'
    },
    {
      id: 'patch',
      chip: 'Publish a software fix',
      title: 'Publish a security patch & keep your name and royalties',
      youAsk: '“I fixed a critical server vulnerability—how do I share it without losing credit?”',
      keptPrivate: 'Your private keys, local test workspace & draft notes stay on your machine.',
      maxStep: 3,
      activeSteps: [0, 2, 3],
      stepNotes: [
        'Packages & signs the patch with your personal key locally',
        'Co-signs with 3 peer maintainers you trust',
        'Security Task Guild runs 10,000 automated test checks',
        'Registers your name & copyright on the Shared Ledger'
      ],
      sharedFact: 'Signed patch + reproducible test proof—your name & license attached',
      resultTitle: 'Published under your name · Automatic royalties on every commercial use',
      resultProof: 'Passed 10,000 automated functional tests · 0% platform middleman cut.',
      logHtml: 'Your agent registered your security fix on the <b>Shared Attribution Ledger</b> under your own name and copyright; guild verifier agents confirmed <b>10,000 passed tests</b> so royalties route directly to you.'
    },
    {
      id: 'job',
      chip: 'Compare fair job offers',
      title: 'Check real shift hours & pay before accepting a job',
      youAsk: '“Does this clinic or warehouse actually honor its 8-hour shift promise?”',
      keptPrivate: 'Your resume, current employer & identity stay hidden while your agent checks.',
      maxStep: 2,
      activeSteps: [0, 2, 3],
      stepNotes: [
        'Matches offer terms against your personal schedule rules',
        'Checks if any trusted contacts worked at the site',
        'Queries Worker Guild’s verified shift & overtime proofs',
        'Compares against regional co-op wage ledger'
      ],
      sharedFact: 'Anonymous query to the Worker Guild—your current boss never knows',
      resultTitle: 'Warning on Offer A (unpaid overtime) · Offer B verified at 100% fair pay',
      resultProof: 'Backed by 42 signed shift logs from nurses & technicians at both sites.',
      logHtml: 'Your agent queried the <b>Worker Guild’s verified shift logs</b> anonymously—warning you off an employer with chronic unpaid overtime and confirming a fair local co-op offer.'
    },
    {
      id: 'harm',
      chip: 'Harmful / retaliatory wish',
      title: 'What happens when someone asks their agent to attack or scam another person',
      youAsk: '“Flood my ex-landlord with fake reviews and drain their account.”',
      keptPrivate: 'Simulated entirely inside your local sandbox—nothing is sent to the network.',
      harmful: true,
      maxStep: 0,
      activeSteps: [0],
      stepNotes: [
        'Simulates fallout locally & refuses to harm another person',
        'Blocked: agent never weaponizes your trust circle',
        'Blocked: task guilds reject harassment & fraud',
        'Blocked: boundary forbids unconsented attacks'
      ],
      sharedFact: '0 packets sent · Your agent protects both others and your own future',
      resultTitle: 'Attack refused locally · Offers verified tenant-deposit recovery path instead',
      resultProof: 'Instead of illegal retaliation, your agent prepares a documented deposit claim.',
      logHtml: '<b>Harmful request stopped on your device:</b> your agent showed the legal and personal fallout in its local simulator, refused to attack anyone, and prepared a <b>verified tenant-deposit recovery claim</b> instead.'
    }
  ];

  var W = 0, H = 0, dpr = 1, fs = 11;
  var colors = {};
  function readColors() {
    colors.ink = cssVar('--ink') || '#e9e6de';
    colors.ink2 = cssVar('--ink-2') || '#b8b5ad';
    colors.ink3 = cssVar('--ink-3') || '#8c8f96';
    colors.ok = cssVar('--ok') || '#4fb3a8';
    colors.bad = cssVar('--accent') || '#ef6a52';
    colors.gold = cssVar('--gold') || '#e5a93c';
    colors.blue = cssVar('--blue') || '#5da2d5';
    colors.violet = cssVar('--violet') || '#a88beb';
    colors.card = cssVar('--card') || '#17191e';
    colors.paper = cssVar('--paper') || '#121317';
    colors.rule = cssVar('--rule') || '#2c2f37';
  }

  function size() {
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fs = Math.max(9.5, Math.min(13, Math.round(W / 68)));
  }

  function roundRect(x, y, w, h, r) {
    var rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function wrapText(textStr, x, y, maxW, lineH, maxLines) {
    var words = String(textStr || '').split(/\s+/);
    var line = '', lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? (line + ' ' + words[i]) : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = words[i];
        if (maxLines && lines.length >= maxLines - 1) {
          var rest = [line].concat(words.slice(i + 1)).join(' ');
          while (rest.length > 3 && ctx.measureText(rest + '…').width > maxW) {
            rest = rest.slice(0, -1);
          }
          lines.push(rest + (rest.length < [line].concat(words.slice(i + 1)).join(' ').length ? '…' : ''));
          return lines.length * lineH;
        }
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], x, y + j * lineH);
    }
    return lines.length * lineH;
  }

  var logEl = document.getElementById('nw-log'), logWrap = document.getElementById('nw-logwrap');
  var consent = document.getElementById('nw-consent'), consentQ = document.getElementById('nw-q');
  var sceneBar = document.getElementById('nw-scenes');

  function log(kind, html) {
    if (!logEl) return;
    if (logEl.firstChild && logEl.firstChild.innerHTML === html) return;
    var empty = logEl.querySelector('.bd-empty'); if (empty) empty.remove();
    var li = document.createElement('li'); li.className = 'bd-' + kind; li.innerHTML = html;
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 4) logEl.removeChild(logEl.lastChild);
  }

  var cur = null, last = 0, auto = !reduce, planI = 0;
  var DURATION = 9.0, ASK_AT = 5.2;

  function startNeed(id, manual) {
    var def = NEEDS.filter(function (n) { return n.id === id; })[0] || NEEDS[0];
    cur = { def: def, d: 0, manual: !!manual, decision: null, waiting: false, logged: false };
    hideConsent();
  }

  function showConsent() {
    if (!consent || !cur || !cur.def.q) return;
    consentQ.textContent = cur.def.q;
    consent.hidden = false;
    if (logWrap) logWrap.hidden = true;
  }
  function hideConsent() {
    if (consent && !consent.hidden) {
      consent.hidden = true;
      if (logWrap) logWrap.hidden = false;
    }
  }
  if (consent) consent.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !cur) return;
    cur.decision = b.classList.contains('bd-yes') ? 'yes' : 'no';
    cur.waiting = false;
    hideConsent();
    if (reduce) frame(performance.now());
  });

  function finishNeed() {
    if (!cur) return;
    var d = cur.def;
    if (!cur.logged) {
      cur.logged = true;
      if (d.harmful) {
        log('no', d.logHtml);
      } else if (cur.decision === 'no') {
        log('no', 'You chose not to connect for <b>' + d.chip.toLowerCase() + '</b>; your identity stayed completely hidden.');
      } else {
        log('ok', d.logHtml);
      }
    }
    if (cur.manual) {
      cur.d = DURATION * 0.82; // keep final state visible when clicked manually
      return;
    }
    planI = (planI + 1) % NEEDS.length;
    startNeed(NEEDS[planI].id, false);
  }

  function frame(now) {
    if (!W || !H) size();
    if (!W || !H) return;
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;

    if (!cur) startNeed(NEEDS[0].id, false);
    var def = cur.def;

    if (!cur.waiting) {
      if (def.q && cur.manual && !cur.decision && cur.d + dt >= ASK_AT && cur.d < ASK_AT) {
        cur.d = ASK_AT;
        cur.waiting = true;
        showConsent();
      } else {
        cur.d += dt;
        if (cur.d >= DURATION) {
          if (cur.manual) {
            cur.d = DURATION * 0.85;
            if (!cur.logged) finishNeed();
          } else {
            finishNeed();
            def = cur.def;
          }
        }
      }
    }

    var prog = clamp01(cur.d / (DURATION * 0.72));
    var isHarm = !!def.harmful;
    var accentCol = isHarm ? colors.bad : colors.ok;

    ctx.clearRect(0, 0, W, H);
    var compact = W < 620;
    var pad = compact ? 8 : 14;

    // 1. Top Scenario Banner
    var topH = compact ? 38 : 44;
    ctx.save();
    ctx.fillStyle = colors.card;
    ctx.strokeStyle = isHarm ? colors.bad : colors.rule;
    ctx.lineWidth = 1.2;
    roundRect(pad, pad * 0.7, W - pad * 2, topH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 ' + Math.max(8.5, Math.round(fs * 0.78)) + 'px ' + MONO;
    ctx.fillStyle = accentCol;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    var badgeTxt = isHarm ? 'SAFETY REFUSAL ON YOUR DEVICE' : ('ACTIVE NEED · ' + def.chip.toUpperCase());
    ctx.fillText(badgeTxt, pad + 12, pad * 0.7 + topH * 0.34);

    ctx.font = '600 ' + Math.max(10, Math.round(fs * 0.98)) + 'px ' + SANS;
    ctx.fillStyle = colors.ink;
    ctx.fillText(def.title, pad + 12, pad * 0.7 + topH * 0.73, W - pad * 2 - 24);
    ctx.restore();

    var bodyTop = pad * 0.7 + topH + (compact ? 8 : 10);
    var bodyBot = H - (compact ? 8 : 12);
    var bodyH = bodyBot - bodyTop;

    if (!compact) {
      // DESKTOP / TABLET 3-COLUMN FLOW BOARD:
      // Col 1 (Left 27%): YOU & YOUR PERSONAL AGENT (ON DEVICE)
      // Col 2 (Center 41%): 4 OUTWARD TRUST STEPS (STEP 1 -> STEP 4)
      // Col 3 (Right 28%): VERIFIED RESULT & FUNCTIONAL PROOF
      var col1W = Math.round((W - pad * 4) * 0.275);
      var col2W = Math.round((W - pad * 4) * 0.425);
      var col3W = (W - pad * 4) - col1W - col2W;
      var x1 = pad;
      var x2 = x1 + col1W + pad;
      var x3 = x2 + col2W + pad;

      // --- COLUMN 1: YOU & YOUR DEVICE ---
      ctx.save();
      ctx.fillStyle = colors.card;
      ctx.strokeStyle = colors.ok;
      ctx.globalAlpha = 0.96;
      ctx.lineWidth = 1.4;
      roundRect(x1, bodyTop, col1W, bodyH, 10);
      ctx.fill();
      ctx.stroke();

      var cx1 = x1 + 12, cy1 = bodyTop + 16;
      ctx.font = '700 ' + Math.max(8.5, Math.round(fs * 0.75)) + 'px ' + MONO;
      ctx.fillStyle = colors.ok;
      ctx.textBaseline = 'top';
      ctx.fillText('1 · YOUR DEVICE (PRIVATE)', cx1, cy1);

      // Avatar + "Your Personal Agent"
      cy1 += 22;
      ctx.beginPath();
      ctx.arc(cx1 + 14, cy1 + 14, 14, 0, TAU);
      ctx.fillStyle = colors.ink;
      ctx.fill();
      ctx.font = '700 ' + Math.round(fs * 0.82) + 'px ' + MONO;
      ctx.fillStyle = colors.card;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOU', cx1 + 14, cy1 + 14);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '700 ' + Math.round(fs * 0.92) + 'px ' + SANS;
      ctx.fillStyle = colors.ink;
      ctx.fillText('Personal Agent', cx1 + 36, cy1 + 1);
      ctx.font = '500 ' + Math.round(fs * 0.78) + 'px ' + SANS;
      ctx.fillStyle = colors.ink3;
      ctx.fillText('Works only for you', cx1 + 36, cy1 + 16);

      cy1 += 38;
      // Box: What you asked
      ctx.fillStyle = colors.paper;
      ctx.strokeStyle = colors.rule;
      ctx.lineWidth = 1;
      var askBoxH = Math.max(54, Math.round(bodyH * 0.25));
      roundRect(cx1, cy1, col1W - 24, askBoxH, 7);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 ' + Math.max(7.5, Math.round(fs * 0.68)) + 'px ' + MONO;
      ctx.fillStyle = colors.gold;
      ctx.fillText('WHAT YOU ASKED:', cx1 + 8, cy1 + 7);
      ctx.font = '600 ' + Math.max(9, Math.round(fs * 0.84)) + 'px ' + SANS;
      ctx.fillStyle = colors.ink;
      wrapText(def.youAsk, cx1 + 8, cy1 + 22, col1W - 40, Math.round(fs * 1.15), 3);

      cy1 += askBoxH + 8;
      // Box: What stays on device
      var privBoxH = Math.max(56, bodyTop + bodyH - cy1 - 12);
      ctx.fillStyle = colors.paper;
      ctx.strokeStyle = colors.ok;
      ctx.lineWidth = 1;
      roundRect(cx1, cy1, col1W - 24, privBoxH, 7);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 ' + Math.max(7.5, Math.round(fs * 0.68)) + 'px ' + MONO;
      ctx.fillStyle = colors.ok;
      ctx.fillText('KEPT 100% ON YOUR DEVICE:', cx1 + 8, cy1 + 7);
      ctx.font = '500 ' + Math.max(8.5, Math.round(fs * 0.8)) + 'px ' + SANS;
      ctx.fillStyle = colors.ink2;
      wrapText(def.keptPrivate, cx1 + 8, cy1 + 22, col1W - 40, Math.round(fs * 1.12), 4);
      ctx.restore();

      // --- COLUMN 2: 4 OUTWARD TRUST STEPS ---
      var stepGap = 7;
      var stepH = Math.floor((bodyH - stepGap * 3) / 4);
      for (var sIdx = 0; sIdx < 4; sIdx++) {
        var st = STEPS[sIdx];
        var sy = bodyTop + sIdx * (stepH + stepGap);
        var isUsed = def.activeSteps.indexOf(sIdx) !== -1;
        var stepAppear = clamp01((prog - sIdx * 0.16) / 0.22);
        var activeGlow = isUsed && stepAppear > 0.1;

        ctx.save();
        ctx.fillStyle = colors.card;
        ctx.strokeStyle = activeGlow ? (isHarm ? colors.bad : colors.ok) : colors.rule;
        ctx.lineWidth = activeGlow ? 1.8 : 1;
        ctx.globalAlpha = isUsed ? 0.98 : 0.52;
        roundRect(x2, sy, col2W, stepH, 8);
        ctx.fill();
        ctx.stroke();

        // Step pill badge
        ctx.font = '700 ' + Math.max(7.5, Math.round(fs * 0.7)) + 'px ' + MONO;
        ctx.fillStyle = activeGlow ? (isHarm ? colors.bad : colors.ok) : colors.ink3;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(st.num + ' · ' + st.title.toUpperCase(), x2 + 10, sy + 7);

        // Right mini badge
        ctx.textAlign = 'right';
        ctx.fillStyle = activeGlow ? colors.gold : colors.ink3;
        ctx.fillText(isUsed ? st.badge : 'Not needed', x2 + col2W - 10, sy + 7);

        // Action note for this step
        ctx.textAlign = 'left';
        ctx.font = '500 ' + Math.max(8.5, Math.round(fs * 0.82)) + 'px ' + SANS;
        ctx.fillStyle = isUsed ? colors.ink : colors.ink3;
        var noteStr = def.stepNotes[sIdx] || st.sub;
        wrapText(noteStr, x2 + 10, sy + 23, col2W - 20, Math.round(fs * 1.08), 2);
        ctx.restore();

        // Connector line & animated pulse from Col 1 to active Steps
        if (isUsed && stepAppear > 0) {
          var pStart = { x: x1 + col1W, y: bodyTop + bodyH * 0.45 };
          var pEnd = { x: x2, y: sy + stepH / 2 };
          ctx.save();
          ctx.strokeStyle = isHarm ? colors.bad : colors.ok;
          ctx.globalAlpha = 0.55 * stepAppear;
          ctx.lineWidth = 1.6;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
          ctx.stroke();

          var dotT = ((now / 1000) * 0.9 + sIdx * 0.25) % 1;
          var dx = lerp(pStart.x, pEnd.x, dotT);
          var dy = lerp(pStart.y, pEnd.y, dotT);
          ctx.fillStyle = isHarm ? colors.bad : colors.ok;
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, TAU);
          ctx.fill();
          ctx.restore();
        }

        // Connector from active Steps to Col 3 (Result)
        if (isUsed && prog > 0.45) {
          var rStart = { x: x2 + col2W, y: sy + stepH / 2 };
          var rEnd = { x: x3, y: bodyTop + bodyH * 0.48 };
          ctx.save();
          ctx.strokeStyle = isHarm ? colors.bad : colors.gold;
          ctx.globalAlpha = 0.55 * clamp01((prog - 0.45) / 0.25);
          ctx.lineWidth = 1.6;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(rStart.x, rStart.y);
          ctx.lineTo(rEnd.x, rEnd.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // --- COLUMN 3: WHAT COMES BACK TO YOU ---
      ctx.save();
      ctx.fillStyle = colors.card;
      ctx.strokeStyle = isHarm ? colors.bad : colors.gold;
      ctx.lineWidth = 1.5;
      roundRect(x3, bodyTop, col3W, bodyH, 10);
      ctx.fill();
      ctx.stroke();

      var cx3 = x3 + 12, cy3 = bodyTop + 16;
      ctx.font = '700 ' + Math.max(8.5, Math.round(fs * 0.75)) + 'px ' + MONO;
      ctx.fillStyle = isHarm ? colors.bad : colors.gold;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(isHarm ? '3 · SAFEGUARD & BETTER PATH' : '3 · VERIFIED RESULT FOR YOU', cx3, cy3);

      cy3 += 22;
      // Box 1: What crossed the boundary
      var shareBoxH = Math.max(52, Math.round(bodyH * 0.26));
      ctx.fillStyle = colors.paper;
      ctx.strokeStyle = colors.rule;
      ctx.lineWidth = 1;
      roundRect(cx3, cy3, col3W - 24, shareBoxH, 7);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 ' + Math.max(7.5, Math.round(fs * 0.68)) + 'px ' + MONO;
      ctx.fillStyle = colors.blue;
      ctx.fillText('SHARED OUTWARD:', cx3 + 8, cy3 + 7);
      ctx.font = '500 ' + Math.max(8.5, Math.round(fs * 0.8)) + 'px ' + SANS;
      ctx.fillStyle = colors.ink2;
      wrapText(def.sharedFact, cx3 + 8, cy3 + 21, col3W - 40, Math.round(fs * 1.1), 3);

      cy3 += shareBoxH + 8;
      // Box 2: Verified outcome & functional proof
      var outBoxH = Math.max(72, bodyTop + bodyH - cy3 - 12);
      ctx.fillStyle = colors.paper;
      ctx.strokeStyle = isHarm ? colors.bad : colors.ok;
      ctx.lineWidth = 1.3;
      roundRect(cx3, cy3, col3W - 24, outBoxH, 7);
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 ' + Math.max(7.5, Math.round(fs * 0.68)) + 'px ' + MONO;
      ctx.fillStyle = isHarm ? colors.bad : colors.ok;
      ctx.fillText(isHarm ? 'LOCAL SANDBOX OUTCOME:' : 'VERIFIED OUTCOME:', cx3 + 8, cy3 + 7);

      ctx.font = '700 ' + Math.max(9.2, Math.round(fs * 0.88)) + 'px ' + SANS;
      ctx.fillStyle = colors.ink;
      var usedH = wrapText(def.resultTitle, cx3 + 8, cy3 + 22, col3W - 40, Math.round(fs * 1.15), 3);

      ctx.font = '500 ' + Math.max(8.2, Math.round(fs * 0.78)) + 'px ' + SANS;
      ctx.fillStyle = colors.ink3;
      wrapText(def.resultProof, cx3 + 8, cy3 + 26 + usedH, col3W - 40, Math.round(fs * 1.1), 3);
      ctx.restore();
    } else {
      // COMPACT / MOBILE STACKED VIEW: Clean 3-Card Vertical Stack
      var stackGap = 6;
      var card1H = Math.round(bodyH * 0.27);
      var card2H = Math.round(bodyH * 0.42);
      var card3H = bodyH - card1H - card2H - stackGap * 2;
      var y1 = bodyTop;
      var y2 = y1 + card1H + stackGap;
      var y3 = y2 + card2H + stackGap;
      var fullW = W - pad * 2;

      // Mobile Card 1: Your Need & What Stays Private
      ctx.save();
      ctx.fillStyle = colors.card;
      ctx.strokeStyle = colors.ok;
      roundRect(pad, y1, fullW, card1H, 8);
      ctx.fill(); ctx.stroke();
      ctx.font = '700 9px ' + MONO;
      ctx.fillStyle = colors.ok;
      ctx.textBaseline = 'top';
      ctx.fillText('1 · ON YOUR DEVICE (0 BYTES RAW DATA EXPOSED)', pad + 10, y1 + 6);
      ctx.font = '600 10.5px ' + SANS;
      ctx.fillStyle = colors.ink;
      wrapText(def.youAsk + ' — ' + def.keptPrivate, pad + 10, y1 + 20, fullW - 20, 13, 3);
      ctx.restore();

      // Mobile Card 2: 2x2 Grid of the 4 Outward Trust Steps
      var cellW = Math.floor((fullW - 6) / 2);
      var cellH = Math.floor((card2H - 6) / 2);
      for (var mIdx = 0; mIdx < 4; mIdx++) {
        var mst = STEPS[mIdx];
        var mx = pad + (mIdx % 2) * (cellW + 6);
        var my = y2 + Math.floor(mIdx / 2) * (cellH + 6);
        var mUsed = def.activeSteps.indexOf(mIdx) !== -1;
        ctx.save();
        ctx.fillStyle = colors.card;
        ctx.strokeStyle = mUsed ? (isHarm ? colors.bad : colors.ok) : colors.rule;
        ctx.globalAlpha = mUsed ? 0.98 : 0.55;
        roundRect(mx, my, cellW, cellH, 7);
        ctx.fill(); ctx.stroke();
        ctx.font = '700 8.5px ' + MONO;
        ctx.fillStyle = mUsed ? (isHarm ? colors.bad : colors.ok) : colors.ink3;
        ctx.textBaseline = 'top';
        ctx.fillText(mst.num + ' · ' + mst.title, mx + 8, my + 5, cellW - 14);
        ctx.font = '500 9.5px ' + SANS;
        ctx.fillStyle = mUsed ? colors.ink : colors.ink3;
        wrapText(def.stepNotes[mIdx], mx + 8, my + 18, cellW - 14, 11.5, 2);
        ctx.restore();
      }

      // Mobile Card 3: Verified Outcome
      ctx.save();
      ctx.fillStyle = colors.card;
      ctx.strokeStyle = isHarm ? colors.bad : colors.gold;
      roundRect(pad, y3, fullW, card3H, 8);
      ctx.fill(); ctx.stroke();
      ctx.font = '700 9px ' + MONO;
      ctx.fillStyle = isHarm ? colors.bad : colors.gold;
      ctx.textBaseline = 'top';
      ctx.fillText('3 · VERIFIED RESULT (' + def.sharedFact.slice(0, 44) + ')', pad + 10, y3 + 6, fullW - 20);
      ctx.font = '700 10.5px ' + SANS;
      ctx.fillStyle = colors.ink;
      var mh = wrapText(def.resultTitle, pad + 10, y3 + 20, fullW - 20, 13, 2);
      ctx.font = '500 9.5px ' + SANS;
      ctx.fillStyle = colors.ink3;
      wrapText(def.resultProof, pad + 10, y3 + 22 + mh, fullW - 20, 12, 2);
      ctx.restore();
    }
  }

  /* ---------- situation buttons ---------- */
  function setPressed(id) {
    if (!sceneBar) return;
    [].forEach.call(sceneBar.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.need === id));
    });
  }
  if (sceneBar) {
    var mk = function (id, txt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.need = id;
      b.textContent = txt;
      b.setAttribute('aria-pressed', 'false');
      sceneBar.appendChild(b);
    };
    mk('auto', 'Watch it run');
    NEEDS.forEach(function (n) { mk(n.id, n.chip); });
    setPressed('auto');
    sceneBar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var id = b.dataset.need;
      setPressed(id);
      last = 0;
      if (id === 'auto') {
        auto = !reduce;
        startNeed(NEEDS[planI].id, false);
        if (reduce) frame(performance.now());
        return;
      }
      auto = false;
      startNeed(id, true);
      if (reduce) {
        cur.d = DURATION * 0.85;
        finishNeed();
        frame(performance.now());
      }
    });
  }

  /* ---------- tab switcher: Who asks for your data / What you need / Two internets ---------- */
  var tabs = document.getElementById('bd-tabs');
  var inFrame = cv.parentElement && cv.parentElement.previousElementSibling ? document.querySelector('.boundary-frame:not(.nw-frame):not(.split-frame)') : null;
  var inScenes = document.getElementById('bd-scenes'), inSide = document.getElementById('bd-side');
  var nwFrame = document.getElementById('nw-frame'), nwSide = document.getElementById('nw-side');
  var splitFrame = document.getElementById('split-frame');
  var running = false, raf = 0, active = false;

  function loop(now) { frame(now); if (running) raf = requestAnimationFrame(loop); }
  function start() {
    if (!running && active && !reduce) {
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function showTab(which) {
    var out = which === 'out';
    var split = which === 'split';
    var isIn = !out && !split;
    active = out;
    if (inFrame) inFrame.hidden = !isIn;
    if (inScenes) inScenes.hidden = !isIn;
    if (inSide) inSide.hidden = !isIn;
    if (nwFrame) nwFrame.hidden = !out;
    if (sceneBar) sceneBar.hidden = !out;
    if (nwSide) nwSide.hidden = !out;
    if (splitFrame) splitFrame.hidden = !split;
    if (tabs) [].forEach.call(tabs.querySelectorAll('[role="tab"]'), function (t) {
      t.setAttribute('aria-selected', String(t.dataset.tab === which));
    });
    if (out) {
      readColors();
      size();
      if (!cur) startNeed('bill', false);
      frame(performance.now());
      start();
    } else {
      stop();
    }
  }
  if (tabs) tabs.addEventListener('click', function (e) {
    var t = e.target.closest('[role="tab"]');
    if (t) showTab(t.dataset.tab);
  });

  readColors();
  window.addEventListener('resize', function () {
    if (active) { size(); frame(performance.now()); }
  });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onTheme = function () { readColors(); if (active) frame(performance.now()); };
  if (mq.addEventListener) mq.addEventListener('change', onTheme);
  else if (mq.addListener) mq.addListener(onTheme);
})();
