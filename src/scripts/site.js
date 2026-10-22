/* CIN site script. Runs entirely in the visitor's browser and sends nothing anywhere. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ---------- header, menu, active section ---------- */
  var head = document.querySelector('.site-head');
  var onScroll = function () { head.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (btn) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu'; }
    });
  }

  if ('IntersectionObserver' in window) {
    var links = {};
    nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a && en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });

    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- the receipt: what this page actually loaded ---------- */
  function receipt() {
    var here = location.host;
    var entries = (performance.getEntriesByType ? performance.getEntriesByType('resource') : []);
    var hosts = {};
    hosts[here] = 1; // the page itself
    entries.forEach(function (e) {
      try { var h = new URL(e.name, location.href).host; if (h) hosts[h] = (hosts[h] || 0) + 1; } catch (_) {}
    });
    var list = Object.keys(hosts);
    var third = list.filter(function (h) { return h !== here; });
    var set = function (id, txt, cls) { var el = document.getElementById(id); if (el) { el.textContent = txt; if (cls) el.className = 'v ' + cls; } };
    set('r-cookies', document.cookie ? String(document.cookie.split(';').length) : '0', document.cookie ? 'bad' : 'good');
    set('r-count', String(entries.length + 1));
    set('r-hosts', list.length + ' (' + list.join(', ') + ')');
    set('r-third', third.length ? third.length + ': ' + third.join(', ') : '0', third.length ? 'bad' : 'good');
  }
  if (document.readyState === 'complete') receipt(); else window.addEventListener('load', function () { setTimeout(receipt, 50); });

  /* ---------- dialogs: the receipt waits quietly in the footer ---------- */
  document.querySelectorAll('[data-open]').forEach(function (b) {
    var dlg = document.getElementById(b.getAttribute('data-open'));
    if (!dlg || !dlg.showModal) { b.parentNode.hidden = true; return; }
    b.addEventListener('click', function () { receipt(); dlg.showModal(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  });

  /* ==========================================================================
     THE SOVEREIGN HORIZON (3-WORLD LIVING ARCHITECTURE IN #boundary):
     Zone 1 (Left):   HUMAN SANCTUARY · Live <1mW ECG/HRV + Mortal Computation Lease
     Zone 2 (Center): YOUR LOCAL SANDBOX · 6 Narrow Agents, Bespoke Code Synthesis,
                      and the Non-Contact Silicon Firewall (2-of-2 PUF + TPM)
     Zone 3 (Right):  AGENT-ONLY INTERNET · Real-Time Data-Only Ledger Stream (τ)
                      patrolled by Rewarded REA Reverse-Engineering Auditors
     ========================================================================== */
  var cv = document.getElementById('boundary');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, youX = 0, youY = 0, wallX = 0, streamX = 0, dpr = 1, fs = 10;
  var TAU = Math.PI * 2, MONO = 'ui-monospace, Consolas, monospace';

  // One person, 6 narrow agents arranged around your Local Sandbox Compiler Core.
  var FLEET = [
    ['age', 'your age and identity', ['ID wallet', 'birth record']],
    ['health', 'your health', ['heart rate', 'sleep']],
    ['money', 'your money', ['bank feed', 'receipts']],
    ['home', 'your home', ['lease', 'energy meter']],
    ['place', 'where you go', ['phone location', 'car']],
    ['work', 'your work and skills', ['certificates', 'calendar']]
  ].map(function (f, i, all) { return { id: f[0], about: f[1], feeds: f[2], a: -Math.PI / 2 + i * TAU / all.length }; });
  var N = FLEET.length;
  var SENSORS = [];
  FLEET.forEach(function (f, i) { f.feeds.forEach(function (name, j) { SENSORS.push({ k: i, a: f.a + (j ? 0.22 : -0.22), r: 0.88, name: name }); }); });

  // Routine questions on the data-only stream: [question, answer, agent, who asks].
  var ASK = [['Over 18?', 'yes (ZK)', 0, 'a shop’s agent'], ['Insured?', 'yes (ZK)', 1, 'a clinic’s agent'], ['Income ok?', 'yes (ZK)', 2, 'a benefits agent'],
    ['Lease valid?', 'yes (ZK)', 3, 'a utility’s agent'], ['Local resident?', 'yes (ZK)', 4, 'a library’s agent'], ['Licensed?', 'yes (ZK)', 5, 'an employer’s agent']];
  var GRAB = [['Full ID scan', 0, 'an ad network'], ['Medical chart', 1, 'a data broker'], ['All bank logs', 2, 'a lending bot'],
    ['Contact list', 3, 'a scraper'], ['GPS history', 4, 'a tracking bot'], ['Work dossier', 5, 'a recruiter bot']];

  // Interactive scenarios: everyday life + Non-Contact Firewall + REA Blueprint Audit + Duress Freeze.
  var SCENES = [
    { id: 'botdm', chip: 'Direct bot DM', who: 'a persuasive AI bot', tag: 'persuasive AI bot', k: 0, fake: true, directHuman: true, tau: '0.00' },
    { id: 'rea', chip: 'REA Blueprint Audit', who: 'a trojan blueprint publisher', tag: 'backdoored blueprint', k: 5, fake: true, reaAudit: true, tau: '0.82 → 0.27' },
    { id: 'duress', chip: 'Duress Freeze', who: 'a coerced high-risk transfer', tag: 'coerced transfer', k: 2, fake: true, duress: true, tau: '0.91' },
    { id: 'dentist', chip: 'Dentist', who: 'your dentist’s agent', tag: 'dentist’s agent', k: 1, sensor: 'mouth bacteria', out: '1 bacteria fact', back: 'treatment data stream', when: 'the visit', tau: '0.92', q: 'Share one mouth-bacteria reading with your dentist’s agent over the data stream?' },
    { id: 'pharmacy', chip: 'Pharmacy', who: 'the pharmacy’s agent', tag: 'pharmacy’s agent', k: 1, out: 'allergy: penicillin', back: 'safe alternative data', when: 'the prescription', tau: '0.89', q: 'Prove you are allergic to penicillin, and nothing else from your records?' },
    { id: 'rent', chip: 'Renting', who: 'a landlord’s agent', tag: 'landlord’s agent', k: 2, out: 'income ≥ 3× rent: yes', back: 'lease data stream', when: 'the application', tau: '0.68', q: 'Prove your income is at least three times the rent, without sending bank statements?' },
    { id: 'insure', chip: 'Car insurance', who: 'your insurer’s agent', tag: 'insurer’s agent', k: 4, sensor: 'braking & speed', out: 'safe driving: yes', back: 'lower rate stream', when: 'the renewal', tau: '0.74', q: 'Confirm a year of safe driving, without sending a single trip?' },
    { id: 'job', chip: 'New job', who: 'an employer’s agent', tag: 'employer’s agent', k: 5, out: 'licensed electrician: yes', back: 'interview slot stream', when: 'hiring', tau: '0.64', q: 'Prove you hold an electrician’s licence, without your name or address?' },
    { id: 'vote', chip: 'Voting', who: 'the election office’s agent', tag: 'election office', k: 0, out: 'eligible here: yes', back: 'ballot stream', when: 'the election', tau: '0.95', q: 'Prove you may vote here, without showing your ID?' },
    { id: 'er', chip: 'Emergency', who: 'a paramedic’s agent', tag: 'paramedic’s agent', k: 1, emergency: true, out: 'blood type, allergies', back: 'ER care protocol', when: 'the emergency', tau: '0.96' },
    { id: 'fake', chip: 'Fake bank', who: '“your bank”', tag: '“your bank” (no PUF)', k: 2, fake: true, tau: '0.12' }
  ];
  var END = 13.4, END_FAKE = 8.6, ASK_AT = 6.2;

  var colors = {};
  function readColors() {
    colors.ink = cssVar('--ink') || '#e9e6de';
    colors.ink3 = cssVar('--ink-3') || '#8c8f96';
    colors.ok = cssVar('--ok') || '#4fb3a8';
    colors.bad = cssVar('--accent') || '#ef6a52';
    colors.gold = cssVar('--gold') || '#e0a82e';
    colors.blue = cssVar('--blue') || '#5da2d5';
    colors.card = cssVar('--card') || '#17191e';
    colors.rule = cssVar('--rule') || '#2c2f37';
  }

  function size() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 3-World Sovereign Horizon coordinates
    youX = W * 0.14;
    youY = H * 0.43;
    cx = W * 0.465;
    cy = H * 0.51;
    R = Math.min(W * 0.175, H * 0.27);
    wallX = W * 0.675;
    streamX = W * 0.835;
    fs = Math.max(8.5, Math.min(11.5, Math.round(W / 48)));
  }

  /* geometry and drawing helpers */
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); }
  function P(a, r) { return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }; }
  function lerp(p, q, k) { return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k }; }
  function along(pts, k) {
    var L = [], tot = 0, i;
    for (i = 1; i < pts.length; i++) { L.push(Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); tot += L[i - 1]; }
    var d = clamp01(k) * tot;
    for (i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return lerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 1); d -= L[i]; }
  }
  function nodeR() { return Math.max(5.5, R * 0.085); }
  function agentPos(i) { return i < 0 ? { x: youX, y: youY } : P(FLEET[i].a, R * 0.60); }
  function sensorPos(s) { return P(s.a, R * s.r); }
  function gatePos(k) {
    var ap = agentPos(k);
    return { x: wallX, y: Math.max(H * 0.23, Math.min(H * 0.79, ap.y)) };
  }
  function reaPos(idx) {
    return { x: wallX + (W - wallX) * 0.34, y: idx === 0 ? H * 0.27 : H * 0.75 };
  }
  function sizeS() { return Math.max(2.6, R * 0.032); }

  function line(p, q, col, alpha, dash, w) {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.lineWidth = w || 1; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.restore();
  }
  function disc(p, r, col, alpha) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  function ring(p, r, col, alpha, w) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 1; }
  function diamond(p, s, col, alpha) {
    ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y); ctx.lineTo(p.x, p.y + s); ctx.lineTo(p.x - s, p.y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  function hex(p, r, col, fillCol, alpha, w) {
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = i * TAU / 6 - Math.PI / 6;
      var x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fillCol) { ctx.fillStyle = fillCol; ctx.fill(); }
    if (col) { ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.stroke(); }
    ctx.restore();
  }
  function square(p, col) { ctx.fillStyle = col || colors.ok; ctx.fillRect(p.x - 3.5, p.y - 3.5, 7, 7); }
  function badge(p, ok, alpha) {
    if (alpha <= 0) return;
    var r = fs * 0.58;
    disc(p, r, ok ? colors.ok : colors.bad, alpha);
    ctx.globalAlpha = alpha; ctx.strokeStyle = colors.card; ctx.lineWidth = 1.5; ctx.beginPath();
    if (ok) { ctx.moveTo(p.x - r * 0.45, p.y); ctx.lineTo(p.x - r * 0.1, p.y + r * 0.38); ctx.lineTo(p.x + r * 0.48, p.y - r * 0.35); }
    else { var s = r * 0.38; ctx.moveTo(p.x - s, p.y - s); ctx.lineTo(p.x + s, p.y + s); ctx.moveTo(p.x + s, p.y - s); ctx.lineTo(p.x - s, p.y + s); }
    ctx.stroke(); ctx.lineWidth = 1; ctx.globalAlpha = 1;
  }
  function badgeAt(i, ok, alpha) {
    var p = agentPos(i), off = (i < 0 ? R * 0.16 : nodeR()) * 0.85;
    badge({ x: p.x + off, y: p.y - off }, ok, alpha);
  }
  function fadeIn(d, at) { return d > at ? Math.min(1, (d - at) / 0.2) : 0; }
  function label(textStr, x, y, color, bg, align) {
    ctx.font = '600 ' + Math.round(fs * 0.92) + 'px ' + MONO;
    var w = ctx.measureText(textStr).width + 12, h = Math.max(18, fs * 1.75);
    var lx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    lx = Math.max(5, Math.min(W - w - 5, lx));
    var ly = Math.max(H * 0.17, Math.min(H - h - 22, y - h / 2));
    ctx.fillStyle = bg; ctx.strokeStyle = color; ctx.lineWidth = 1;
    roundRect(lx, ly, w, h, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(textStr, lx + 6, ly + h / 2 + 0.5);
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function text(str, x, y, col, weight, size, align, alpha) {
    ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col;
    ctx.font = (weight || 600) + ' ' + (size || fs) + 'px ' + MONO;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.globalAlpha = 1;
  }
  function neighbours(k) { return [(k + 1) % N, (k + N - 1) % N]; }

  /* ---------- the page around the canvas: situations, your decision, and a log ---------- */
  var sceneBar = document.getElementById('bd-scenes'), side = document.getElementById('bd-side');
  var consent = document.getElementById('bd-consent'), consentQ = document.getElementById('bd-q');
  var logEl = document.getElementById('bd-log'), detail = document.getElementById('bd-detail'), logWrap = document.getElementById('bd-logwrap');
  var shared = [0, 0, 0, 0, 0, 0];

  function log(kind, html, k) {
    if (!logEl) return;
    if (logEl.firstChild && logEl.firstChild.innerHTML === html) return; // prevent duplicate consecutive log entries
    if (k != null && kind === 'ok') shared[k]++;
    var empty = logEl.querySelector('.bd-empty'); if (empty) empty.remove();
    var li = document.createElement('li'); li.className = 'bd-' + kind; li.innerHTML = html;
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 4) logEl.removeChild(logEl.lastChild);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* events: routine data-stream questions, and rich scenario stories */
  var reqs = [], scene = null, t0 = performance.now(), last = 0, lastSpawn = -9999, planI = 0, auto = !reduce;
  var PLAN = ['ask', 'botdm', 'rea', 'dentist', 'ask', 'duress', 'grab', 'insure', 'ask', 'fake', 'ask', 'rent', 'grab', 'ask', 'er', 'ask', 'job', 'grab', 'pharmacy', 'ask', 'vote'];
  var glow = [0, 0, 0, 0, 0, 0], kept = [];

  // Background particles flowing vertically along the 3 Agent-Only Ledger Stream lanes
  var STREAM_PARTICLES = [];
  for (var spI = 0; spI < 21; spI++) {
    STREAM_PARTICLES.push({
      lane: spI % 3,
      yFrac: (spI * 0.19) % 1,
      speed: 0.09 + (spI % 5) * 0.018,
      isAudit: spI % 4 === 0
    });
  }

  function spawnAsk(now, grab) {
    var busy = reqs.map(function (q) { return q.k; });
    var pool = (grab ? GRAB : ASK).filter(function (it) { return busy.indexOf(grab ? it[1] : it[2]) < 0; });
    if (!pool.length) return false;
    var it = pool[Math.floor(Math.random() * pool.length)], k = grab ? it[1] : it[2];
    reqs.push({ k: k, good: !grab, q: it[0], ans: grab ? 'blocked: raw grab' : it[1], who: grab ? it[2] : it[3], born: now });
    return true;
  }
  function startScene(id, manual) {
    var def = SCENES.filter(function (s) { return s.id === id; })[0];
    if (!def) return;
    scene = { def: def, d: 0, manual: !!manual, decision: def.emergency ? 'yes' : null, waiting: false };
    if (def.sensor) scene.sensor = { k: def.k, a: FLEET[def.k].a + 0.42, r: 0.84, name: def.sensor, isNew: true };
    hideConsent();
  }
  function endScene(now) {
    var s = scene, def = s.def;
    if (def.directHuman) log('no', 'Blocked ' + esc(def.who) + ' at Silicon Firewall: foreign agents may never contact humans directly.');
    else if (def.reaAudit) log('no', 'REA Security Auditors decompiled ' + esc(def.tag) + ': hidden backdoor caught &amp; publisher reputation slashed (<b>&tau;: 0.82 &rarr; 0.27</b>).');
    else if (def.duress) log('no', 'Coercion Firewall triggered (<b>HRV 14 ms &lt; 24 ms</b>): high-risk transfer frozen until you are calm and safe.');
    else if (def.fake) log('no', 'Blocked ' + esc(def.who) + ': missing 2-of-2 PUF+TPM hardware proof. Nothing shared.');
    else if (s.decision === 'no') log('no', esc(cap(def.who)) + ': you declined. Nothing shared.');
    else log('ok', esc(cap(def.who)) + ' got <b>' + esc(def.out) + '</b> via data-only stream' + (def.emergency ? ' (emergency rule).' : '. Synthesized locally; access expired.'), def.k);
    if (s.sensor && s.decision !== 'no' && !kept.some(function (x) { return x.name === s.sensor.name; })) kept.push({ k: s.sensor.k, a: s.sensor.a, r: s.sensor.r, name: s.sensor.name });
    scene = null; lastSpawn = now; hideConsent();
    if (s.manual) { setPressed('auto'); }
  }
  function schedule(now) {
    if (!auto || scene) return;
    var next = PLAN[planI % PLAN.length];
    if (next !== 'ask' && next !== 'grab') {
      if (!reqs.length && now - lastSpawn > 900) { startScene(next, false); planI++; }
    } else if (now - lastSpawn > 2400 && reqs.length < 2) {
      if (spawnAsk(now, next === 'grab')) { planI++; lastSpawn = now; }
    }
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function showConsent() {
    if (!consent) return;
    consentQ.textContent = scene.def.q; consent.hidden = false; detail.hidden = true; logWrap.hidden = true;
    var b = consent.querySelector('.bd-yes'); if (b) b.focus({ preventScroll: true });
  }
  function hideConsent() { if (consent && !consent.hidden) { consent.hidden = true; describe(hover); } }
  if (consent) consent.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !scene) return;
    scene.decision = b.classList.contains('bd-yes') ? 'yes' : 'no'; scene.waiting = false; hideConsent();
    if (reduce) frame(performance.now());
  });

  // Routine data-stream query from Zone 3 -> Non-Contact Wall Gate -> 3-of-6 Quorum in Zone 2 -> 1 ZK fact out
  function drawAsk(q, age, layer) {
    var gp = gatePos(q.k), ap = agentPos(q.k), startP = { x: streamX + (W - streamX) * 0.25, y: gp.y };
    var team = [q.k].concat(neighbours(q.k)), col = q.good ? colors.ok : colors.bad, j;
    if (age < 1.8) {
      var p = lerp(startP, gp, ease(age / 1.8));
      if (layer === 0) line(startP, p, colors.ink3, 0.35, [2, 4]);
      else { square(p, col); if (age > 0.6) label(q.q, p.x, p.y - fs * 1.3, colors.ink, colors.card, 'center'); }
    } else if (age < 3.5) {
      var c = age - 1.8;
      if (layer === 0) {
        line(gp, ap, col, 0.55, [3, 3]);
        if (c < 1.1) ring(gp, 5 + c / 1.1 * 16, col, 1 - c / 1.1, 1.8);
        glow[q.k] = Math.max(glow[q.k], 1 - c / 1.6);
        for (j = 1; j < 3; j++) if (age > 2.1 + j * 0.35) line(agentPos(team[j]), ap, col, 0.55, [2, 3]);
      } else {
        square(gp, col);
        label(q.q, gp.x - 8, gp.y - fs * 1.4, colors.ink, colors.card, 'right');
      }
    } else if (layer === 1) {
      if (!q.logged) {
        q.logged = true;
        if (q.good) log('ok', cap(esc(q.who)) + ' asked “' + esc(q.q) + '” on the data stream and got <b>' + esc(q.ans) + '</b>.', q.k);
        else log('no', cap(esc(q.who)) + ' tried to pull ' + esc(q.q.toLowerCase()) + ' and was <b>blocked at the firewall</b>.');
      }
      var k = (age - 3.5) / 2.6, outP = lerp(gp, startP, ease(k));
      var fa = 1 - Math.max(0, (k - 0.6) / 0.4);
      if (q.good) disc(outP, 4, col, fa);
      ctx.globalAlpha = fa;
      label(q.ans, outP.x, outP.y - fs * 1.3, col, colors.card, 'center');
      ctx.globalAlpha = 1;
    }
    if (layer === 1 && age >= 1.8) for (j = 0; j < 3; j++) {
      var at = 2.0 + j * 0.35;
      if (age > at) badgeAt(team[j], q.good, Math.min(1, (age - at) / 0.2) * (1 - clamp01((age - 4.4) / 0.8)));
    }
    return age < 6.1;
  }

  // Full scenario choreography across the 3 Worlds
  function drawScene(s, d, layer) {
    var def = s.def, k = def.k, gp = gatePos(k), hp = agentPos(k);
    var streamPeer = { x: streamX, y: Math.max(H * 0.27, Math.min(H * 0.73, gp.y)) };
    var startFar = { x: W - 12, y: streamPeer.y };
    var end = def.fake ? END_FAKE : END, leaveAt = def.fake ? 6.4 : 12.2;
    var leave = clamp01((d - leaveAt) / 1.2), fade = 1 - leave;
    var pos = d < 2.0 ? lerp(startFar, streamPeer, ease(d / 2.0)) : lerp(streamPeer, startFar, ease(leave));
    var z = fs * 0.68, i;
    var team = neighbours(k), no = s.decision === 'no', proofCol = def.fake ? colors.bad : colors.ok;
    var sensorIn = s.sensor ? clamp01((d - 4.4) / 0.35) : 0;

    if (layer === 0) {
      // 1. Direct Bot DM Violation: aims straight across the Non-Contact Wall at YOU in Zone 1 and shatters!
      if (def.directHuman && d > 1.8 && d < 6.8) {
        var impactPt = { x: wallX, y: youY };
        var beamEnd = lerp(pos, impactPt, ease(clamp01((d - 1.8) / 1.1)));
        line(pos, beamEnd, colors.bad, 0.9, [4, 4], 2.4);
        line(impactPt, { x: youX, y: youY }, colors.bad, 0.14, [2, 6], 1);
        if (d > 2.8) {
          var shock = (d - 2.8) % 0.85;
          ring(impactPt, 6 + shock * 26, colors.bad, (1 - shock / 0.85) * 0.85, 2.5);
          ctx.save();
          ctx.strokeStyle = colors.bad; ctx.lineWidth = 4; ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.moveTo(wallX, youY - 26); ctx.lineTo(wallX, youY + 26); ctx.stroke();
          ctx.restore();
        }
        return d < end;
      }

      // 2. REA Blueprint Audit: REA Auditor Swarm in Zone 3 scans the backdoored blueprint with decompiler beams!
      if (def.reaAudit && d > 1.8 && d < 6.8) {
        var r0 = reaPos(0), r1 = reaPos(1);
        line(r0, pos, colors.gold, 0.85, [3, 3], 1.8);
        line(r1, pos, colors.gold, 0.85, [3, 3], 1.8);
        if (d > 3.2) {
          ring(pos, z * 1.9 + Math.sin(d * 9) * 3, colors.bad, 0.85, 2.2);
        }
        return d < end;
      }

      // 3. Duress / Coercion Attack: Panic HRV (< 24 ms) trips the Autonomic Coercion Firewall in Zone 1 -> Zone 2
      if (def.duress && d > 1.8 && d < 6.8) {
        line({ x: youX, y: youY }, hp, colors.bad, 0.85, [3, 3], 2.2);
        ring({ x: youX, y: youY }, R * 0.22 + Math.sin(d * 12) * 3, colors.bad, 0.8, 2.2);
        ring(hp, nodeR() * 2.1, colors.bad, 0.8, 2);
        return d < end;
      }

      // Standard hardware chain of custody across the Silicon Firewall Gate
      for (i = 0; i < 3; i++) {
        var show = clamp01((d - (2.2 + 0.4 * i)) / 0.25) * (def.fake ? 1 - clamp01((d - 4.0 - 0.15 * i) / 0.4) : 1 - clamp01((d - (11.3 + 0.3 * (2 - i))) / 0.3));
        if (show <= 0) continue;
        var lp = lerp(gp, pos, (i + 0.5) / 3);
        disc(lp, 2.6, proofCol, show);
      }
      if (!def.fake && d > 2.2 && d < 11.4) line(gp, hp, colors.ok, 0.45, [3, 3], 1.4);
      if (def.fake && d > 4.0 && d < 6.4) ring(gp, 10 + Math.sin(d * 8) * 3, colors.bad, 0.85, 2.2);
      if (def.fake) return d < end;

      if (sensorIn > 0 && d < 12.4) line(sensorPos(s.sensor), hp, colors.ok, 0.45 * sensorIn, [2, 3]);
      if (d > 4.2 && d < ASK_AT) glow[k] = Math.max(glow[k], 0.6);
      if (d >= ASK_AT && d < 9.8) {
        glow[k] = Math.max(glow[k], 0.85);
        if (!def.emergency && (s.waiting || d > 6.5)) line(hp, { x: youX, y: youY }, no ? colors.bad : colors.ok, s.waiting ? 0.4 + 0.4 * Math.sin(d * 6) : 0.65, [3, 3], 1.6);
        if (!no && d > 7.0) line(agentPos(team[0]), hp, colors.ok, 0.6, [2, 3]);
        if (!no && d > 7.3) line(agentPos(team[1]), hp, colors.ok, 0.6, [2, 3]);
        // Local Sandbox core lights up as it synthesizes the local view
        if (!no && d > 7.2) line(hp, { x: cx, y: cy }, colors.ok, 0.65, [], 1.6);
      }
      return d < end;
    }

    // Layer 1 overlays
    if (sensorIn > 0) {
      var ns = sensorPos(s.sensor);
      diamond(ns, sizeS() * (0.4 + 0.6 * ease(sensorIn)), colors.ok);
      if (d < ASK_AT) {
        ring(ns, 4 + ((d - 4.4) % 0.9) / 0.9 * 13, colors.ok, 1 - ((d - 4.4) % 0.9) / 0.9, 1.4);
        label('sensor: ' + def.sensor, ns.x, ns.y + fs * 1.8, colors.ok, colors.card, 'center');
      }
    }

    // Draw the external agent / blueprint node in Zone 3 (Agent-Only Stream)
    ctx.globalAlpha = fade; ctx.fillStyle = def.fake ? colors.bad : colors.blue;
    roundRect(pos.x - z, pos.y - z, z * 2, z * 2, 4); ctx.fill(); ctx.globalAlpha = 1;
    if (fade > 0.05) {
      ctx.globalAlpha = fade;
      label(def.tag + (def.tau ? ' (τ=' + def.tau + ')' : ''), pos.x, pos.y - z - fs * 1.35, def.fake ? colors.bad : colors.ink, colors.card, 'center');
      ctx.globalAlpha = 1;
    }

    if (def.fake) {
      badge({ x: pos.x + z, y: pos.y - z }, false, d > 3.4 ? Math.min(1, (d - 3.4) / 0.2) * fade : 0);
      if (d > 3.4 && d < 6.8) {
        if (def.directHuman) label('NON-CONTACT WALL: bot → human blocked', wallX, youY + fs * 2.1, colors.bad, colors.card, 'center');
        else if (def.reaAudit) label('REA DECOMPILER: backdoor quarantined · τ slashed', pos.x, pos.y + z + fs * 1.5, colors.bad, colors.card, 'center');
        else if (def.duress) label('DURESS FIREWALL: HRV 14ms (<24ms) · transfer frozen', cx, cy - R - fs * 0.6, colors.bad, colors.card, 'center');
        else label('MISSING PUF+TPM PROOF: blocked at gate', gp.x, gp.y + fs * 1.7, colors.bad, colors.card, 'center');
      }
      return d < end;
    }

    badge({ x: pos.x + z, y: pos.y - z }, true, d > 3.6 && d < 11.2 ? Math.min(1, (d - 3.6) / 0.2) : 0);

    if (d >= ASK_AT) {
      var gone = 1 - clamp01((d - 9.2) / 0.6);
      if (s.waiting) { var pulse = 0.55 + 0.45 * Math.sin(performance.now() / 180); ring({ x: youX, y: youY }, R * 0.22, colors.ok, pulse, 2); }
      else if (no) { badgeAt(-1, false, fadeIn(d, 6.3) * gone); badgeAt(k, false, fadeIn(d, 6.5) * gone); }
      else {
        badgeAt(k, true, fadeIn(d, 6.3) * gone);
        if (!def.emergency) badgeAt(-1, true, fadeIn(d, 6.5) * gone);
        badgeAt(team[0], true, fadeIn(d, 7.0) * gone);
        badgeAt(team[1], true, fadeIn(d, 7.3) * gone);
      }
    }

    // 1 pure ZK fact crosses the firewall gate; pure data stream returns and is synthesized in your Local Sandbox
    if (!no && d > 8.0 && d < 9.6) {
      var pk = along([hp, gp, pos], ease((d - 8.0) / 1.3));
      disc(pk, 4.5, colors.ok);
      label('ZK proof: ' + def.out, pk.x, pk.y + fs * 1.9, colors.ok, colors.card, 'center');
    }
    if (!no && d > 9.6 && d < 11.2) {
      var rk = along([pos, gp, { x: cx, y: cy }], ease((d - 9.6) / 1.3));
      disc(rk, 4.5, colors.gold);
      label('sandbox ingests: ' + def.back, rk.x, rk.y - fs * 1.9, colors.ink, colors.card, 'center');
    }
    if (d > 11.2 && d < 12.6) label('ephemeral token expired · 0 open APIs', gp.x, gp.y + fs * 1.5, colors.ok, colors.card, 'center');
    return d < end;
  }

  function captionFor(s) {
    var def = s.def, d = s.d, steps = [[0, '1  ' + def.who + ' appears on the agent-only stream']];
    if (def.directHuman) {
      steps.push([1.8, '2  it tries to bypass your agents and message YOU (a human) directly'], [3.0, '3  shattered at the Non-Contact Silicon Wall (0% bot → human contact)'], [5.6, '4  only agent-to-agent negotiation by trust threshold (τ) is allowed']);
    } else if (def.reaAudit) {
      steps.push([1.8, '2  REA Auditor Swarm decompiles & lifts the shared blueprint on the stream'], [3.2, '3  hidden exfiltration backdoor detected before reaching your sandbox'], [5.4, '4  blueprint quarantined · publisher reputation slashed (τ: 0.82 → 0.27)']);
    } else if (def.duress) {
      steps.push([1.8, '2  attacker pressures human to approve high-risk transfer under panic'], [3.0, '3  <1mW Somatic Witness detects vagal HRV drop (14 ms < 24 ms threshold)'], [5.4, '4  Autonomic Coercion Firewall silently freezes outbound capability tokens']);
    } else if (def.fake) {
      steps.push([2.0, '2  it cannot prove 2-of-2 Wearable PUF + Device TPM hardware custody'], [4.0, '3  refused at the silicon gate: spoofed cloud script blocked'], [6.0, '4  your sandbox never opens; zero data shared']);
    } else {
      steps.push([2.0, '2  hardware PUF+TPM & trust threshold (τ=' + def.tau + ') verified at firewall gate']);
      steps.push([4.4, def.sensor ? '3  local <1mW sensor reads ' + def.sensor + ' inside your enclave' : '3  your local ' + FLEET[def.k].id + ' agent checks your private ledger']);
      if (def.emergency) steps.push([ASK_AT, '4  pre-approved emergency rule: 3-of-6 local quorum signs']);
      else if (s.waiting) steps.push([ASK_AT, '4  your call inside the human sanctuary: approve or decline?']);
      else if (s.decision === 'no') steps.push([ASK_AT, '4  you declined; nothing crosses the silicon firewall']);
      else steps.push([ASK_AT, '4  you + 3-of-6 local agent quorum approve']);
      if (s.decision === 'no') steps.push([8.0, '5  ' + def.who + ' receives nothing']);
      else steps.push([8.0, '5  1 zero-knowledge fact crosses gate: ' + def.out], [9.6, '6  local sandbox synthesizes view from pure data: ' + def.back]);
      steps.push([11.2, '7  capability token expires · 0 externally accessible software APIs']);
    }
    var capStr = '', a = 1;
    steps.forEach(function (st) { if (d >= st[0]) { capStr = st[1]; a = s.waiting ? 1 : Math.min(1, (d - st[0]) / 0.3); } });
    var end = def.fake ? END_FAKE : END;
    if (d > end - 0.5) a = Math.max(0, (end - d) / 0.5);
    return [capStr, a];
  }

  /* ---------- pointing: inspect every zone of the 3-World Sovereign Horizon ---------- */
  var hover = null;
  function hitTest(x, y) {
    if (Math.hypot(x - youX, y - youY) < R * 0.22) return { you: true };
    if (x < W * 0.26 && y > H * 0.53 && y < H * 0.72) return { bio: true };
    if (Math.hypot(x - cx, y - cy) < R * 0.22) return { sandbox: true };
    if (Math.abs(x - wallX) < 12 && y > H * 0.18 && y < H * 0.84) return { wall: true };
    for (var rI = 0; rI < 2; rI++) { var rp = reaPos(rI); if (Math.hypot(x - rp.x, y - rp.y) < 16) return { rea: true }; }
    for (var i = 0; i < N; i++) { var p = agentPos(i); if (Math.hypot(x - p.x, y - p.y) < nodeR() * 2.1) return { k: i }; }
    var all = SENSORS.concat(kept, scene && scene.sensor ? [scene.sensor] : []);
    for (var j = 0; j < all.length; j++) { var q = sensorPos(all[j]); if (Math.hypot(x - q.x, y - q.y) < 10) return { s: all[j] }; }
    if (x > wallX + 14) return { stream: true };
    return null;
  }
  function describe(h) {
    if (!detail || (consent && !consent.hidden)) return;
    if (!h) { detail.hidden = true; logWrap.hidden = false; return; }
    var html;
    if (h.you) html = '<b>Zone 1 · You (Human Biological Sanctuary &amp; Mortal Lease)</b><span>Your personal agents talk inward only to you. Under Mortal Computation, their cryptographic lease is bound to your biological survival—if humans are harmed, the agents cease to exist.</span>';
    else if (h.bio) html = '<b>&lt;1 mW Somatic Witness &amp; Autonomic Coercion Firewall</b><span>Coupled pulse-breath coherence (HRV RMSSD &ge; 24 ms) proves an uncoerced human is present. Raw waveforms overwrite every 30s in SRAM (0 bytes leave). If panic/duress hits (&lt;24 ms), outbound high-risk tokens freeze.</span>';
    else if (h.sandbox) html = '<b>Zone 2 · Your Local Sandbox Synthesis Core (0 External APIs)</b><span>Because AI coding and reverse-engineering harnesses (like REA) make software near-free to synthesize locally, your agents never expose running software interfaces. They ingest pure data streams and build bespoke tools inside this isolated local sandbox.</span>';
    else if (h.wall) html = '<b>Non-Contact Silicon Firewall (2-of-2 PUF + TPM)</b><span>Hardware plane separation drops any foreign agent packet aimed at a human. Only schema-validated data streams and 1-fact zero-knowledge proofs signed by your 3-of-6 local quorum can cross.</span>';
    else if (h.rea) html = '<b>Rewarded REA Security Auditor Swarm</b><span>Independent watcher agents earn ledger credits for continuously decompiling and fuzzing shared software blueprints and auditing the ledger stream itself—slashing the reputation (&tau;) of anyone sharing backdoored or buggy code.</span>';
    else if (h.stream) html = '<b>Zone 3 · Agent-Only Internet &amp; Real-Time Ledger Stream (&tau;)</b><span>High-velocity data-only streams organized by cryptographic trust thresholds (&tau; &ge; 0.85 trusted, &ge; 0.60 friends-of-friends, &ge; 0.30 wider ZK commons).</span>';
    else if (h.s) html = '<b>' + esc(cap(h.s.name)) + ' sensor (&lt;1 mW local bus)</b><span>Feeds only your ' + FLEET[h.s.k].id + ' agent inside your hardware enclave. Raw readings never touch the network.</span>';
    else {
      var f = FLEET[h.k], feeds = f.feeds.concat(kept.filter(function (x) { return x.k === h.k; }).map(function (x) { return x.name; }));
      html = '<b>Your ' + f.id + ' agent (3-of-6 Local Quorum)</b><span>Knows ' + f.about + ' from ' + feeds.join(', ') + '. Negotiates on the Agent-Only Internet by trust threshold (&tau;) and never contacts other humans directly.</span><span class="bd-count">Scoped facts proved so far: ' + shared[h.k] + '</span>';
    }
    detail.innerHTML = html; detail.hidden = false; logWrap.hidden = true;
  }
  function pointer(e) {
    var r = cv.getBoundingClientRect(), h = hitTest(e.clientX - r.left, e.clientY - r.top);
    hover = h; cv.style.cursor = h ? 'pointer' : ''; describe(h);
    if (reduce) frame(still);
  }
  cv.addEventListener('pointermove', pointer);
  cv.addEventListener('pointerdown', pointer);
  cv.addEventListener('pointerleave', function () { hover = null; cv.style.cursor = ''; describe(null); if (reduce) frame(still); });

  function frame(now) {
    var t = (now - t0) / 1000, i, dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    ctx.clearRect(0, 0, W, H);
    glow = [0, 0, 0, 0, 0, 0];
    var isDuress = scene && scene.def && scene.def.duress && scene.d > 1.8 && scene.d < 6.8;

    // 0. Subtle architectural background panels for the 3 Worlds
    var topY = H * 0.175, botY = H * 0.885, zoneH = botY - topY;
    // Zone 1: Human Sanctuary panel
    ctx.save();
    ctx.fillStyle = colors.ok; ctx.globalAlpha = 0.035;
    roundRect(6, topY, W * 0.245, zoneH, 10); ctx.fill();
    ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
    roundRect(6, topY, W * 0.245, zoneH, 10); ctx.stroke();
    // Zone 2: Local Sandbox Enclave panel
    ctx.fillStyle = colors.ink; ctx.globalAlpha = 0.025;
    roundRect(W * 0.265, topY, wallX - W * 0.265, zoneH, 10); ctx.fill();
    ctx.strokeStyle = colors.rule; ctx.globalAlpha = 0.55;
    roundRect(W * 0.265, topY, wallX - W * 0.265, zoneH, 10); ctx.stroke();
    // Zone 3: Agent-Only Stream panel
    ctx.fillStyle = colors.blue; ctx.globalAlpha = 0.03;
    roundRect(wallX + 6, topY, W - wallX - 12, zoneH, 10); ctx.fill();
    ctx.restore();

    // 1. Top 3-World Architectural Header Strip
    var hdrFs = Math.max(7.5, Math.round(fs * 0.78));
    text('1. HUMAN SANCTUARY', W * 0.13, H * 0.048, colors.ok, 700, hdrFs, 'center', 0.92);
    text('HRV+PUF · Mortal Lease', W * 0.13, H * 0.082, colors.ink3, 600, Math.max(7, hdrFs - 1), 'center', 0.75);

    text('2. YOUR LOCAL SANDBOX', cx, H * 0.048, colors.ink, 700, hdrFs, 'center', 0.92);
    text('6 Agents · 0 External APIs', cx, H * 0.082, colors.ink3, 600, Math.max(7, hdrFs - 1), 'center', 0.75);

    text('3. AGENT-ONLY STREAM', (wallX + W) / 2, H * 0.048, colors.blue, 700, hdrFs, 'center', 0.92);
    text('Data Ledger + REA Audit (τ)', (wallX + W) / 2, H * 0.082, colors.ink3, 600, Math.max(7, hdrFs - 1), 'center', 0.75);

    // 2. Zone 1 (Human Sanctuary): YOU + Live Coupled ECG/HRV Scope + Mortal Computation Tether
    // Mortal Computation double-tether connecting YOU to your Local Sandbox
    line({ x: youX + R * 0.16, y: youY - 4 }, { x: cx - R * 0.85, y: cy - 4 }, isDuress ? colors.bad : colors.ok, 0.45, [3, 3], 1.5);
    line({ x: youX + R * 0.16, y: youY + 4 }, { x: cx - R * 0.85, y: cy + 4 }, isDuress ? colors.bad : colors.gold, 0.35, [2, 4], 1.2);
    var pulseT = (t * 0.7) % 1;
    disc(lerp({ x: youX + R * 0.16, y: youY }, { x: cx - R * 0.85, y: cy }, pulseT), 2.2, isDuress ? colors.bad : colors.ok, 0.9);
    text('MORTAL LEASE', (youX + cx - R * 0.65) / 2, youY - 12, isDuress ? colors.bad : colors.gold, 600, Math.max(6.5, Math.round(fs * 0.68)), 'center', 0.85);

    // YOU node
    var bioR = R * 0.20 + Math.sin(t * (isDuress ? 12 : 2.8)) * 2;
    ring({ x: youX, y: youY }, bioR, isDuress ? colors.bad : colors.ok, 0.55, 1.8);
    disc({ x: youX, y: youY }, R * 0.155, colors.ink);
    text('you', youX, youY, colors.card, 700, Math.max(9, Math.round(R * 0.11)), 'center');
    text('HUMAN ONLY', youX, youY - R * 0.25 - 4, colors.ok, 600, Math.max(6.8, Math.round(fs * 0.7)), 'center', 0.85);

    // Live <1mW Somatic ECG/HRV + Breath Waveform Scope inside Zone 1
    var scopeX = 14, scopeW = W * 0.225, scopeY = H * 0.61, scopeH = H * 0.11;
    ctx.save();
    ctx.fillStyle = colors.card; ctx.globalAlpha = 0.75;
    roundRect(scopeX, scopeY - scopeH / 2, scopeW, scopeH, 6); ctx.fill();
    ctx.strokeStyle = isDuress ? colors.bad : colors.ok; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    roundRect(scopeX, scopeY - scopeH / 2, scopeW, scopeH, 6); ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = isDuress ? colors.bad : colors.ok; ctx.globalAlpha = 0.92; ctx.lineWidth = 1.4;
    for (var wx = 0; wx <= scopeW - 8; wx += 2) {
      var phase = (wx / 14) - t * (isDuress ? 7.5 : 3.2);
      var beat = Math.pow(Math.max(0, Math.sin(phase * 2.2)), 12) * (isDuress ? 0.42 : 0.34);
      var resp = Math.sin(phase * 0.55) * 0.12;
      var wy = scopeY - (beat + resp) * scopeH;
      if (wx === 0) ctx.moveTo(scopeX + 4 + wx, wy); else ctx.lineTo(scopeX + 4 + wx, wy);
    }
    ctx.stroke();
    ctx.restore();
    text(isDuress ? 'HRV: 14ms (DURESS!)' : 'HRV: 54ms · <1mW PUF', scopeX + scopeW / 2, scopeY + scopeH / 2 + fs * 0.85, isDuress ? colors.bad : colors.ok, 600, Math.max(6.8, Math.round(fs * 0.72)), 'center', 0.9);
    text('30s SRAM · 0B raw out', scopeX + scopeW / 2, scopeY + scopeH / 2 + fs * 1.75, colors.ink3, 600, Math.max(6.5, Math.round(fs * 0.66)), 'center', 0.75);

    // 3. Zone 2 (Center): Your Hardware-Enclaved Local Sandbox + 6 Narrow Agents + Sensors
    // Inner 6-agent quorum ring & sandbox spokes
    ctx.save();
    ctx.setLineDash([2, 4]); ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.60, 0, TAU); ctx.stroke();
    ctx.restore();

    for (i = 0; i < N; i++) line({ x: cx, y: cy }, agentPos(i), colors.ink3, 0.25);

    // Local Sandbox Compiler Core at (cx, cy)
    hex({ x: cx, y: cy }, R * 0.19, colors.ok, colors.card, 0.95, 1.6);
    text('SANDBOX', cx, cy - 2, colors.ok, 700, Math.max(6.8, Math.round(fs * 0.68)), 'center');
    text('local code', cx, cy + fs * 0.65, colors.ink3, 600, Math.max(6, Math.round(fs * 0.58)), 'center');

    // Sensors feed their narrow agent inside the enclave
    var sensors = SENSORS.concat(kept);
    sensors.forEach(function (s, j) {
      var sp = sensorPos(s), ap = agentPos(s.k);
      line(sp, ap, colors.ink3, 0.22);
      var per = 1.8 + (j * 0.37) % 1.6, ph = ((t + j * 0.71) % per) / per;
      if (ph < 0.5) disc(lerp(sp, ap, ease(ph / 0.5)), 1.6, colors.ok, 0.85);
    });

    // 4. The Non-Contact Silicon Firewall (x = wallX) separating Zone 2 from Zone 3
    ctx.save();
    ctx.strokeStyle = colors.bad; ctx.globalAlpha = 0.16; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(wallX, topY + 4); ctx.lineTo(wallX, botY - 4); ctx.stroke();
    ctx.setLineDash([5, 5]); ctx.lineDashOffset = -t * 8;
    ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.75; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(wallX, topY + 4); ctx.lineTo(wallX, botY - 4); ctx.stroke();
    ctx.restore();

    // 6 Hardware-Attested Data-Only Gates along the Non-Contact Wall
    for (i = 0; i < N; i++) {
      var g = gatePos(i);
      disc(g, 3.2, colors.card);
      ring(g, 3.2, colors.ok, 0.85, 1.4);
    }
    text('NON-CONTACT SILICON WALL (PUF+TPM)', wallX, botY + fs * 0.85, colors.ink3, 600, Math.max(6.8, Math.round(fs * 0.7)), 'center', 0.85);

    // 5. Zone 3 (Right): Agent-Only Internet & Real-Time Data-Only Ledger Stream + REA Auditors
    var laneLabels = ['τ≥.85', 'τ≥.60', 'τ≥.30'];
    for (var lI = 0; lI < 3; lI++) {
      var lx = wallX + (W - wallX) * (0.24 + lI * 0.28);
      line({ x: lx, y: topY + 14 }, { x: lx, y: botY - 14 }, colors.blue, 0.18, [2, 6], 1);
      text(laneLabels[lI], lx, topY + 9, colors.ink3, 600, Math.max(6.5, Math.round(fs * 0.66)), 'center', 0.75);
    }
    STREAM_PARTICLES.forEach(function (pt) {
      var lx = wallX + (W - wallX) * (0.24 + pt.lane * 0.28);
      var py = topY + 16 + ((pt.yFrac + t * pt.speed) % 1) * (zoneH - 32);
      disc({ x: lx, y: py }, pt.isAudit ? 2.2 : 1.6, pt.isAudit ? colors.gold : colors.blue, pt.isAudit ? 0.75 : 0.45);
    });

    // Patrolling REA Reverse-Engineering Security Auditor Nodes
    for (var rIdx = 0; rIdx < 2; rIdx++) {
      var rp = reaPos(rIdx);
      diamond(rp, 6.5, colors.gold, 0.9);
      ring(rp, 9 + Math.sin(t * 2.5 + rIdx) * 1.5, colors.gold, 0.35, 1.2);
      text('REA AUDIT', rp.x, rp.y + (rIdx === 0 ? -12 : 12), colors.gold, 700, Math.max(6.5, Math.round(fs * 0.66)), 'center', 0.88);
    }

    // Advance scenario story
    schedule(now);
    if (scene) {
      var def = scene.def;
      if (!def.fake && !scene.decision && scene.d + dt >= ASK_AT) {
        scene.d = ASK_AT;
        if (scene.manual) { if (!scene.waiting) { scene.waiting = true; showConsent(); } }
        else scene.decision = 'yes';
      } else if (!scene.waiting) scene.d += dt;
    }

    // Draw background layer of active events
    reqs = reqs.filter(function (q) { return drawAsk(q, (now - q.born) / 1000, 0); });
    if (scene && !drawScene(scene, scene.d, 0)) endScene(now);

    // Draw sensors and 6 Narrow Agents
    sensors.forEach(function (s) { diamond(sensorPos(s), sizeS(), colors.ink3, 0.9); });
    var nr = nodeR();
    FLEET.forEach(function (f, k) {
      var p = agentPos(k), ux = Math.cos(f.a);
      if (glow[k] > 0) disc(p, nr * 2.3, colors.ok, glow[k] * 0.28);
      disc(p, nr, colors.card); ring(p, nr, colors.ok, 1, 1.8);
      var lp = P(f.a, R * 0.60 + nr + fs * 0.85);
      text(f.id, lp.x, lp.y, colors.ink, 600, Math.round(fs * 0.86), ux > 0.3 ? 'left' : ux < -0.3 ? 'right' : 'center', 0.9);
    });

    // Hover highlight
    if (hover) {
      if (hover.you) ring({ x: youX, y: youY }, R * 0.22, colors.ink, 0.85, 1.6);
      else if (hover.sandbox) ring({ x: cx, y: cy }, R * 0.24, colors.ok, 0.85, 1.6);
      else if (hover.wall) line({ x: wallX, y: topY + 4 }, { x: wallX, y: botY - 4 }, colors.ok, 0.9, [], 3);
      else if (hover.s) ring(sensorPos(hover.s), 7, colors.ok, 0.85, 1.4);
      else if (hover.k != null) {
        ring(agentPos(hover.k), nr * 1.8, colors.ink, 0.85, 1.5);
        sensors.forEach(function (s) { if (s.k === hover.k) { line(sensorPos(s), agentPos(s.k), colors.ok, 0.8, [], 1.5); ring(sensorPos(s), 6.5, colors.ok, 0.8, 1.2); } });
      }
    }

    // Draw foreground layer of active events
    reqs.forEach(function (q) { drawAsk(q, (now - q.born) / 1000, 1); });
    if (scene) drawScene(scene, scene.d, 1);

    // Live narrative step ticker strip below header
    var capStr = '', capA = 1;
    if (scene) { var c = captionFor(scene); capStr = c[0]; capA = c[1]; }
    else if (reqs.length) capStr = 'data-only stream · 3 of your local agents must agree · 0 external software APIs';
    else capStr = 'hover any zone or pick a scenario below · agents never contact other humans directly';
    text(capStr, W / 2, H * 0.135, scene ? colors.ink : colors.ink3, 600, Math.round(fs * 0.92), 'center', capA);

    // Bottom legend
    var ly = H - fs * 1.05, lx = 10, ls = Math.max(7.5, Math.round(fs * 0.8));
    ctx.font = '600 ' + ls + 'px ' + MONO;
    diamond({ x: lx + 3, y: ly }, 3.2, colors.ink3); text('sensor (<1mW)', lx + 10, ly, colors.ink3, 600, ls); lx += 10 + ctx.measureText('sensor (<1mW)').width + fs * 1.1;
    disc({ x: lx + 4, y: ly }, 3.8, colors.card); ring({ x: lx + 4, y: ly }, 3.8, colors.ok, 1, 1.4); text('local agent', lx + 12, ly, colors.ink3, 600, ls); lx += 12 + ctx.measureText('local agent').width + fs * 1.1;
    diamond({ x: lx + 4, y: ly }, 4, colors.gold); text('REA auditor', lx + 12, ly, colors.ink3, 600, ls); lx += 12 + ctx.measureText('REA auditor').width + fs * 1.1;
    var sf = fs; fs = ls * 0.82; badge({ x: lx + 5, y: ly }, true, 1); fs = sf; text('3-of-6 quorum', lx + 14, ly, colors.ink3, 600, ls);
  }

  /* ---------- situation chips ---------- */
  function setPressed(id) {
    if (!sceneBar) return;
    [].forEach.call(sceneBar.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.scene === id)); });
  }
  if (sceneBar) {
    var mk = function (id, txt) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.scene = id; b.textContent = txt; b.setAttribute('aria-pressed', 'false');
      sceneBar.appendChild(b); return b;
    };
    mk('auto', 'Watch it run');
    SCENES.forEach(function (s) { mk(s.id, s.chip); });
    setPressed('auto');
    sceneBar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var id = b.dataset.scene; setPressed(id);
      reqs = []; lastSpawn = performance.now();
      if (id === 'auto') { scene = null; hideConsent(); auto = !reduce; if (reduce) frame(still); return; }
      startScene(id, !reduce);
      if (reduce) { scene.decision = scene.def.emergency ? 'yes' : 'yes'; scene.d = scene.def.fake ? 4.8 : 8.8; frame(still); }
    });
  }

  var running = false, raf = 0;
  function loop(now) { frame(now); if (running) raf = requestAnimationFrame(loop); }
  function start() { if (!running && !reduce) { running = true; last = 0; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  readColors(); size();
  var still = performance.now();
  if (reduce) {
    startScene('dentist', false); scene.decision = 'yes'; scene.d = 8.8;
    frame(still);
  } else {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(cv);
    } else start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }
  window.addEventListener('resize', function () { size(); if (reduce) frame(still); });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onTheme = function () { readColors(); if (reduce) frame(still); };
  if (mq.addEventListener) mq.addEventListener('change', onTheme); else if (mq.addListener) mq.addListener(onTheme);
})();
