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
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });  // click outside closes
  });

  /* ---------- the boundary: a fleet of agents; answers, not data ---------- */
  var cv = document.getElementById('boundary');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1, fs = 10;
  var TAU = Math.PI * 2, MONO = 'ui-monospace, Consolas, monospace';

  // One person, many narrow agents. Each knows one part of a life and learns from quiet sensors.
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
  FLEET.forEach(function (f, i) { f.feeds.forEach(function (name, j) { SENSORS.push({ k: i, a: f.a + (j ? 0.2 : -0.2), r: 0.86, name: name }); }); });

  // Routine questions: [question, answer, agent, who asks]. Grabs ask for everything and get nothing.
  var ASK = [['Over 18?', 'yes', 0, 'a shop'], ['Insured this month?', 'yes', 1, 'a clinic'], ['Income under the limit?', 'yes', 2, 'a benefits office'],
    ['Lease in your name?', 'yes', 3, 'a utility'], ['Lives in this city?', 'yes', 4, 'a library'], ['Allowed to work here?', 'yes', 5, 'an employer']];
  var GRAB = [['Full ID scan', 0, 'an ad network'], ['Medical records', 1, 'a data broker'], ['All transactions', 2, 'a lending app'],
    ['Contact list', 3, 'a game'], ['Full location history', 4, 'a shopping app'], ['Full work history', 5, 'a recruiting bot']];

  // Situations: a new contact, its proof, what it may learn, and what comes back.
  var SCENES = [
    { id: 'dentist', chip: 'Dentist', who: 'your dentist’s agent', tag: 'dentist’s agent', k: 1, sensor: 'mouth bacteria', out: 'one bacteria reading', back: 'suggested treatment', when: 'the visit', q: 'Share one mouth-bacteria reading with your dentist?' },
    { id: 'pharmacy', chip: 'Pharmacy', who: 'the pharmacy’s agent', tag: 'pharmacy’s agent', k: 1, out: 'allergy: penicillin', back: 'a safe alternative', when: 'the prescription', q: 'Tell the pharmacy you are allergic to penicillin, and nothing else from your records?' },
    { id: 'rent', chip: 'Renting', who: 'a landlord’s agent', tag: 'landlord’s agent', k: 2, out: 'income ≥ 3× rent: yes', back: 'a lease offer', when: 'the application', q: 'Prove your income is at least three times the rent, without sending payslips or bank statements?' },
    { id: 'insure', chip: 'Car insurance', who: 'your insurer’s agent', tag: 'insurer’s agent', k: 4, sensor: 'braking and speed', out: 'safe driving: yes', back: 'a lower premium', when: 'the renewal', q: 'Confirm a year of safe driving, without sending a single trip?' },
    { id: 'job', chip: 'New job', who: 'an employer’s agent', tag: 'employer’s agent', k: 5, out: 'licensed electrician: yes', back: 'an interview', when: 'hiring', q: 'Prove you hold an electrician’s licence, without your name or address?' },
    { id: 'vote', chip: 'Voting', who: 'the election office’s agent', tag: 'election office', k: 0, out: 'eligible here: yes', back: 'a ballot', when: 'the election', q: 'Prove you may vote here, without showing your ID?' },
    { id: 'er', chip: 'Emergency', who: 'a paramedic’s agent', tag: 'paramedic’s agent', k: 1, emergency: true, out: 'blood type, allergies', back: 'safe treatment', when: 'the emergency' },
    { id: 'botdm', chip: 'Direct bot DM', who: 'a persuasive AI bot', tag: 'persuasive AI bot', k: 0, fake: true, directHuman: true },
    { id: 'fake', chip: 'Fake bank', who: '“your bank”', tag: '“your bank”', k: 2, fake: true }
  ];
  var END = 13.4, END_FAKE = 8.6, ASK_AT = 6.2;

  var colors = {};
  function readColors() {
    colors.ink = cssVar('--ink') || '#17181c';
    colors.ink3 = cssVar('--ink-3') || '#6d6f76';
    colors.ok = cssVar('--ok') || '#1f6f68';
    colors.bad = cssVar('--accent') || '#c8402a';
    colors.card = cssVar('--card') || '#fbf9f4';
    colors.rule = cssVar('--rule') || '#d8d2c4';
  }

  function size() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2; R = Math.min(W, H) * 0.29;
    fs = Math.max(9, Math.round(W / 46));
  }

  /* geometry and drawing helpers */
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); }
  function P(a, r) { return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }; }
  function lerp(p, q, k) { return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k }; }
  function along(pts, k) {                          // point at fraction k of a polyline
    var L = [], tot = 0, i;
    for (i = 1; i < pts.length; i++) { L.push(Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); tot += L[i - 1]; }
    var d = clamp01(k) * tot;
    for (i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return lerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 1); d -= L[i]; }
  }
  function nodeR() { return Math.max(5, R * 0.07); }
  function agentPos(i) { return i < 0 ? { x: cx, y: cy } : P(FLEET[i].a, R * 0.56); }
  function sensorPos(s) { return P(s.a, R * s.r); }
  function sizeS() { return Math.max(2.6, R * 0.028); }

  function line(p, q, col, alpha, dash, w) {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.lineWidth = w || 1; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.restore();
  }
  function disc(p, r, col, alpha) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  function ring(p, r, col, alpha, w) { ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 1; }
  function diamond(p, s, col, alpha) {
    ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y); ctx.lineTo(p.x, p.y + s); ctx.lineTo(p.x - s, p.y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  function square(p) { ctx.fillStyle = colors.ink; ctx.fillRect(p.x - 4, p.y - 4, 8, 8); }
  // An approval: a small tick (agrees) or cross (refuses).
  function badge(p, ok, alpha) {
    if (alpha <= 0) return;
    var r = fs * 0.62;
    disc(p, r, ok ? colors.ok : colors.bad, alpha);
    ctx.globalAlpha = alpha; ctx.strokeStyle = colors.card; ctx.lineWidth = 1.6; ctx.beginPath();
    if (ok) { ctx.moveTo(p.x - r * 0.45, p.y); ctx.lineTo(p.x - r * 0.1, p.y + r * 0.38); ctx.lineTo(p.x + r * 0.48, p.y - r * 0.35); }
    else { var s = r * 0.38; ctx.moveTo(p.x - s, p.y - s); ctx.lineTo(p.x + s, p.y + s); ctx.moveTo(p.x + s, p.y - s); ctx.lineTo(p.x - s, p.y + s); }
    ctx.stroke(); ctx.lineWidth = 1; ctx.globalAlpha = 1;
  }
  function badgeAt(i, ok, alpha) {               // i = -1 is the person
    var p = agentPos(i), off = (i < 0 ? R * 0.15 : nodeR()) * 0.85;
    badge({ x: p.x + off, y: p.y - off }, ok, alpha);
  }
  function fadeIn(d, at) { return d > at ? Math.min(1, (d - at) / 0.2) : 0; }
  function label(text, x, y, color, bg, align) {
    ctx.font = '600 ' + fs + 'px ' + MONO;
    var w = ctx.measureText(text).width + 14, h = Math.max(20, fs * 1.9);
    var lx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    lx = Math.max(6, Math.min(W - w - 6, lx));
    var ly = Math.max(6, Math.min(H - h - 6, y - h / 2));
    ctx.fillStyle = bg; ctx.strokeStyle = color; ctx.lineWidth = 1;
    roundRect(lx, ly, w, h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(text, lx + 7, ly + h / 2 + 1);
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
    if (k != null && kind === 'ok') shared[k]++;
    var empty = logEl.querySelector('.bd-empty'); if (empty) empty.remove();
    var li = document.createElement('li'); li.className = 'bd-' + kind; li.innerHTML = html;
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 4) logEl.removeChild(logEl.lastChild);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* events: routine questions, and the occasional new relationship */
  var reqs = [], scene = null, t0 = performance.now(), last = 0, lastSpawn = -9999, planI = 0, auto = !reduce;
  var PLAN = ['ask', 'botdm', 'dentist', 'ask', 'grab', 'insure', 'ask', 'fake', 'ask', 'rent', 'grab', 'ask', 'er', 'ask', 'job', 'grab', 'pharmacy', 'ask', 'vote'];
  var glow = [0, 0, 0, 0, 0, 0], kept = [];

  function spawnAsk(now, grab) {
    var busy = reqs.map(function (q) { return q.k; });
    var pool = (grab ? GRAB : ASK).filter(function (it) { return busy.indexOf(grab ? it[1] : it[2]) < 0; });
    if (!pool.length) return false;
    var it = pool[Math.floor(Math.random() * pool.length)], k = grab ? it[1] : it[2];
    reqs.push({ k: k, a: FLEET[k].a + (Math.random() - 0.5) * 0.5, good: !grab, q: it[0], ans: grab ? 'declined' : it[1], who: grab ? it[2] : it[3], born: now });
    return true;
  }
  function startScene(id, manual) {
    var def = SCENES.filter(function (s) { return s.id === id; })[0];
    scene = { def: def, d: 0, manual: !!manual, decision: def.emergency ? 'yes' : null, waiting: false };
    if (def.sensor) scene.sensor = { k: def.k, a: FLEET[def.k].a + 0.46, r: 0.8, name: def.sensor, isNew: true };
    hideConsent();
  }
  function endScene(now) {
    var s = scene, def = s.def;
    if (def.directHuman) log('no', 'Blocked ' + esc(def.who) + ': agents may never contact humans directly—only your agents over the agent-only internet.');
    else if (def.fake) log('no', 'Blocked ' + esc(def.who) + ': it could not prove its hardware. Nothing shared.');
    else if (s.decision === 'no') log('no', esc(cap(def.who)) + ': you declined. Nothing shared.');
    else log('ok', esc(cap(def.who)) + ' got <b>' + esc(def.out) + '</b>' + (def.emergency ? ' under your emergency rule.' : '. Access expired.'), def.k);
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

  // A routine question: the agent that holds the fact checks it, two neighbours confirm, one fact leaves.
  function drawAsk(q, age, layer) {
    var ux = Math.cos(q.a), uy = Math.sin(q.a), bp = P(q.a, R), far = Math.hypot(W, H) * 0.55;
    var align = ux > 0.3 ? 'left' : ux < -0.3 ? 'right' : 'center', off = 16;
    var team = [q.k].concat(neighbours(q.k)), col = q.good ? colors.ok : colors.bad, j;
    if (age < 2) {                                         // approach
      var d = far - (far - R - 6) * ease(age / 2), p = { x: cx + ux * d, y: cy + uy * d };
      if (layer === 0) line({ x: cx + ux * far, y: cy + uy * far }, p, colors.ink3, 0.35, [2, 5]);
      else { square(p); if (age > 0.8) label(q.q, p.x + ux * off, p.y + uy * off, colors.ink, colors.card, align); }
    } else if (age < 3.6) {                                // checked inside, by three agents
      var c = age - 2;
      if (layer === 0) {
        line(bp, agentPos(q.k), colors.ink3, 0.55, [3, 4]);
        if (c < 1.2) ring(bp, 6 + c / 1.2 * 22, col, 1 - c / 1.2, 2);
        glow[q.k] = Math.max(glow[q.k], 1 - c / 1.6);
        for (j = 1; j < 3; j++) if (age > 2.3 + j * 0.4) line(agentPos(team[j]), agentPos(q.k), col, 0.5, [2, 3]);
      } else {
        square({ x: bp.x + ux * 6, y: bp.y + uy * 6 });
        label(q.q, bp.x + ux * (off + 6), bp.y + uy * (off + 6), colors.ink, colors.card, align);
      }
    } else if (layer === 1) {                              // one fact out, or nothing
      if (!q.logged) {
        q.logged = true;
        if (q.good) log('ok', cap(esc(q.who)) + ' asked “' + esc(q.q) + '” and got <b>' + esc(q.ans) + '</b>.', q.k);
        else log('no', cap(esc(q.who)) + ' asked for ' + esc(q.q.toLowerCase()) + ' and got <b>nothing</b>.');
      }
      var k = (age - 3.6) / 2.8, dd = R + 6 + (far * 0.75 - R) * ease(k), x2 = cx + ux * dd, y2 = cy + uy * dd;
      var fa = 1 - Math.max(0, (k - 0.6) / 0.4);
      if (q.good) disc({ x: x2, y: y2 }, 4.5, col, fa);
      ctx.globalAlpha = fa;
      if (!q.good) {
        ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath();
        ctx.moveTo(x2 - 5, y2 - 5); ctx.lineTo(x2 + 5, y2 + 5); ctx.moveTo(x2 + 5, y2 - 5); ctx.lineTo(x2 - 5, y2 + 5); ctx.stroke(); ctx.lineWidth = 1;
      }
      label(q.ans, x2 + ux * off, y2 + uy * off, col, colors.card, align);
      ctx.globalAlpha = 1;
    }
    if (layer === 1 && age >= 2) for (j = 0; j < 3; j++) {
      var at = 2.3 + j * 0.4;
      if (age > at) badgeAt(team[j], q.good, Math.min(1, (age - at) / 0.2) * (1 - clamp01((age - 4.6) / 0.8)));
    }
    return age < 6.4;
  }

  // A new relationship: the contact proves its hardware, a chain of custody links up, you decide,
  // one fact crosses, something useful comes back, and the access expires. A fake fails the proof.
  function drawScene(s, d, layer) {
    var def = s.def, k = def.k, ha = FLEET[k].a, M = Math.min(W, H) / 2 - R, restR = R + M * 0.7, far = Math.hypot(W, H) * 0.55;
    var end = def.fake ? END_FAKE : END, leaveAt = def.fake ? 6.4 : 12.2;
    var leave = clamp01((d - leaveAt) / 1.2), fade = 1 - leave;
    var pos = d < 2.2 ? P(ha, far - (far - restR) * ease(d / 2.2)) : P(ha, restR + (far - restR) * 0.5 * ease(leave));
    var rest = P(ha, restR), bp = P(ha, R), hp = agentPos(k), z = fs * 0.7, i;
    var c0 = P(ha, R + 4), c1 = P(ha, restR - z - 2), clen = Math.hypot(c1.x - c0.x, c1.y - c0.y);
    var team = neighbours(k), no = s.decision === 'no', proofCol = def.fake ? colors.bad : colors.ok;
    var sensorIn = s.sensor ? clamp01((d - 4.4) / 0.35) : 0;

    if (layer === 0) {
      if (d < 2.2) line(P(ha, far), pos, colors.ink3, 0.35, [2, 5]);
      for (i = 0; i < 3; i++) {                            // chain of custody, link by link; a fake's chain breaks
        var show = clamp01((d - (2.5 + 0.45 * i)) / 0.25) * (def.fake ? 1 - clamp01((d - 4.1 - 0.15 * i) / 0.4) : 1 - clamp01((d - (11.3 + 0.3 * (2 - i))) / 0.3));
        if (show <= 0) continue;
        var lp = lerp(c0, c1, (i + 0.5) / 3), rx = clen / 3 * 0.62, drop = def.fake ? Math.max(0, d - 4.1) * 18 * (i - 1) : 0;
        ctx.globalAlpha = show; ctx.strokeStyle = proofCol; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(lp.x + drop * Math.sin(ha), lp.y - drop * Math.cos(ha), rx, i % 2 ? rx * 0.16 : rx * 0.55, ha, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 1; ctx.lineWidth = 1;
      }
      if (d > 2.2 && d < 3.9) ring(pos, z + ((d - 2.2) % 0.6) / 0.6 * fs * 2, proofCol, 1 - ((d - 2.2) % 0.6) / 0.6, 1.5);
      if (def.directHuman && d > 2.2 && d < 6.6) {
        var reachK = clamp01((d - 2.2) / 1.1);
        var targetPt = lerp(pos, bp, ease(reachK));
        line(pos, targetPt, colors.bad, 0.85, [4, 4], 2.2);
        if (d > 3.1) {
          ctx.save();
          ctx.strokeStyle = colors.bad;
          ctx.lineWidth = 3.2;
          ctx.globalAlpha = 0.75 * (1 - clamp01((d - 5.8) / 0.8));
          ctx.beginPath();
          ctx.arc(cx, cy, R + 2, ha - 0.38, ha + 0.38);
          ctx.stroke();
          ctx.restore();
        }
      }
      if (def.fake) {
        if (d > 4.2 && d < 6.4) ring(hp, nodeR() * (1.6 + 0.4 * Math.sin(d * 8)), colors.bad, 0.8, 2);
        return d < end;
      }
      if (sensorIn > 0 && d < 12.4) line(sensorPos(s.sensor), hp, colors.ok, 0.35 * sensorIn, [2, 3]);
      if (d > 4.4 && d < ASK_AT) glow[k] = Math.max(glow[k], 0.55);
      if (d >= ASK_AT && d < 9.8) {                        // the decision: you, then two more agents
        glow[k] = Math.max(glow[k], 0.8);
        if (!def.emergency && (s.waiting || d > 6.5)) line(hp, agentPos(-1), no ? colors.bad : colors.ok, s.waiting ? 0.35 + 0.35 * Math.sin(d * 6 + performance.now() / 160) : 0.6, [3, 3], 1.4);
        if (!no && d > 7.0) line(agentPos(team[0]), hp, colors.ok, 0.5, [2, 3]);
        if (!no && d > 7.3) line(agentPos(team[1]), hp, colors.ok, 0.5, [2, 3]);
      }
      if (!no && d > 10.9 && d < 11.5) glow[k] = Math.max(glow[k], 1 - (d - 10.9) / 0.6);
      return d < end;
    }

    // the new sensor: arrives, announces itself once, then streams quietly
    if (sensorIn > 0) {
      var ns = sensorPos(s.sensor);
      diamond(ns, sizeS() * (0.4 + 0.6 * ease(sensorIn)), colors.ok);
      if (d < ASK_AT) {
        ring(ns, 4 + ((d - 4.4) % 0.9) / 0.9 * 14, colors.ok, 1 - ((d - 4.4) % 0.9) / 0.9, 1.4);
        label('new: ' + def.sensor, ns.x, ns.y + fs * 2, colors.ok, colors.card, 'center');
      }
      if (d < 12.4) { var ph = ((d - 4.4) % 0.9) / 0.9; if (ph < 0.6) disc(lerp(ns, hp, ease(ph / 0.6)), 2, colors.ok, 0.9); }
    }

    // the outside agent: a different shape, because it is not yours
    ctx.globalAlpha = fade; ctx.fillStyle = def.fake ? colors.bad : colors.ink;
    roundRect(pos.x - z, pos.y - z, z * 2, z * 2, 3); ctx.fill(); ctx.globalAlpha = 1;
    if (fade > 0.05) { ctx.globalAlpha = fade; label(def.tag, pos.x, pos.y - z - fs * 1.4, def.fake ? colors.bad : colors.ink, colors.card, 'center'); ctx.globalAlpha = 1; }
    if (def.fake) {
      badge({ x: pos.x + z, y: pos.y - z }, false, d > 3.9 ? Math.min(1, (d - 3.9) / 0.2) * fade : 0);
      if (d > 4.2 && d < 6.6) { badgeAt(k, false, fadeIn(d, 4.2)); badgeAt(team[0], false, fadeIn(d, 4.5)); badgeAt(team[1], false, fadeIn(d, 4.7)); }
      if (d > 4.0 && d < 6.8) {
        var blockMsg = def.directHuman ? 'non-contact rule: no bot → human DM' : 'not verified: blocked';
        label(blockMsg, pos.x, pos.y + z + fs * 1.6, colors.bad, colors.card, 'center');
      }
      return d < end;
    }
    badge({ x: pos.x + z, y: pos.y - z }, true, d > 3.9 && d < 11.2 ? Math.min(1, (d - 3.9) / 0.2) : 0);

    // approvals
    if (d >= ASK_AT) {
      var gone = 1 - clamp01((d - 9.2) / 0.6);
      if (s.waiting) { var pulse = 0.55 + 0.45 * Math.sin(performance.now() / 180); ring(agentPos(-1), R * 0.2, colors.ok, pulse, 2); }
      else if (no) { badgeAt(-1, false, fadeIn(d, 6.3) * gone); badgeAt(k, false, fadeIn(d, 6.5) * gone); }
      else {
        badgeAt(k, true, fadeIn(d, 6.3) * gone);
        if (!def.emergency) badgeAt(-1, true, fadeIn(d, 6.5) * gone);
        badgeAt(team[0], true, fadeIn(d, 7.0) * gone);
        badgeAt(team[1], true, fadeIn(d, 7.3) * gone);
      }
    }

    // one fact out, one useful thing back
    if (!no && d > 8.0 && d < 9.6) { var pk = along([hp, bp, rest], ease((d - 8.0) / 1.3)); disc(pk, 4.5, colors.ok); label(def.out, pk.x, pk.y + fs * 2.4, colors.ok, colors.card, 'center'); }
    if (!no && d > 9.6 && d < 11.2) { var rk = along([rest, bp, hp], ease((d - 9.6) / 1.3)); disc(rk, 4.5, colors.ink); label(def.back, rk.x, rk.y - fs * 2.2, colors.ink, colors.card, 'center'); }
    if (d > 11.2 && d < 12.6) label('access expired', pos.x, pos.y + z + fs * 1.4, colors.bad, colors.card, 'center');
    return d < end;
  }

  function captionFor(s) {
    var def = s.def, d = s.d, steps = [[0, '1  ' + def.who + ' asks to connect']];
    if (def.directHuman) {
      steps.push([2.2, '2  it tries to message you (a human) directly'], [4.0, '3  blocked at firewall: agents never contact humans directly'], [6.0, '4  only agent-to-agent by trust threshold (τ) is allowed']);
    } else if (def.fake) {
      steps.push([2.2, '2  it cannot prove what hardware it runs on'], [4.2, '3  refused: it only claimed to be your bank'], [6.2, '4  you are warned; nothing was shared']);
    } else {
      steps.push([2.2, '2  its hardware is verified; each link is logged']);
      steps.push([4.4, def.sensor ? '3  a new sensor starts reading ' + def.sensor : '3  your ' + FLEET[def.k].id + ' agent already knows the answer']);
      if (def.emergency) steps.push([ASK_AT, '4  pre-approved for emergencies: no waiting']);
      else if (s.waiting) steps.push([ASK_AT, '4  your call: share it, or not?']);
      else if (s.decision === 'no') steps.push([ASK_AT, '4  you declined; nothing is shared']);
      else steps.push([ASK_AT, '4  you and two of your agents approve']);
      if (s.decision === 'no') steps.push([8.0, '5  ' + def.who + ' carries on without it']);
      else steps.push([8.0, '5  only this goes out: ' + def.out], [9.6, '6  back comes ' + def.back]);
      steps.push([11.2, def.emergency ? '7  access ends; you see exactly what was shared' : '7  access expires after ' + def.when]);
    }
    var cap = '', a = 1;
    steps.forEach(function (st) { if (d >= st[0]) { cap = st[1]; a = s.waiting ? 1 : Math.min(1, (d - st[0]) / 0.3); } });
    var end = def.fake ? END_FAKE : END;
    if (d > end - 0.5) a = Math.max(0, (end - d) / 0.5);
    return [cap, a];
  }

  /* ---------- pointing: what each agent and sensor knows ---------- */
  var hover = null;
  function hitTest(x, y) {
    if (Math.hypot(x - cx, y - cy) < R * 0.17) return { you: true };
    for (var i = 0; i < N; i++) { var p = agentPos(i); if (Math.hypot(x - p.x, y - p.y) < nodeR() * 2.2) return { k: i }; }
    var all = SENSORS.concat(kept, scene && scene.sensor ? [scene.sensor] : []);
    for (var j = 0; j < all.length; j++) { var q = sensorPos(all[j]); if (Math.hypot(x - q.x, y - q.y) < 11) return { s: all[j] }; }
    return null;
  }
  function describe(h) {
    if (!detail || (consent && !consent.hidden)) return;       // your decision keeps the panel
    if (!h) { detail.hidden = true; logWrap.hidden = false; return; }
    var html;
    if (h.you) html = '<b>You (Human Plane · Biometric &amp; PUF Root)</b><span>Your personal agents talk inward only to you, verified by your &lt;1 mW pulse-breath liveness ring and 2-of-2 hardware key. No external agent can ever message you directly.</span>';
    else if (h.s) html = '<b>' + esc(cap(h.s.name)) + ' sensor</b><span>Feeds only your ' + FLEET[h.s.k].id + ' agent over your local hardware bus. Raw readings are overwritten on-chip and never leave your devices.</span>';
    else {
      var f = FLEET[h.k], feeds = f.feeds.concat(kept.filter(function (x) { return x.k === h.k; }).map(function (x) { return x.name; }));
      html = '<b>Your ' + f.id + ' agent (3-of-6 Quorum)</b><span>Knows ' + f.about + ', learning from ' + feeds.join(', ') + '. It negotiates outward on the agent-only internet by trust threshold (τ) and never contacts other humans directly.</span><span class="bd-count">Facts shared so far: ' + shared[h.k] + '</span>';
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

    // faint field grid
    ctx.fillStyle = colors.rule;
    var step = Math.max(18, W / 22);
    for (var gx = step / 2; gx < W; gx += step) for (var gy = step / 2; gy < H; gy += step) { ctx.globalAlpha = 0.55; ctx.fillRect(gx, gy, 1.2, 1.2); }
    ctx.globalAlpha = 1;

    // outer agent-only internet orbital zone
    ctx.save();
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = colors.ink3; ctx.globalAlpha = 0.28; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.24, 0, TAU); ctx.stroke();
    ctx.restore();
    text('AGENT-ONLY INTERNET · AGENT ↔ AGENT BY TRUST (τ)', cx, Math.max(fs * 3.1, cy - R * 1.24 - fs * 0.55), colors.ink3, 600, Math.max(8, Math.round(fs * 0.82)), 'center', 0.72);

    // non-contact protocol firewall & hardware enclave boundary ring
    ctx.save();
    ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.18; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.setLineDash([5, 6]); ctx.lineDashOffset = -t * 6;
    ctx.strokeStyle = colors.ink; ctx.globalAlpha = 0.68; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.restore();

    // 6 narrow-agent protocol gates on the firewall ring
    FLEET.forEach(function (f) {
      var g0 = P(f.a, R - 4), g1 = P(f.a, R + 4);
      line(g0, g1, colors.ok, 0.55, [], 2);
    });

    // inner 6-agent quorum mesh ring (3-of-6 consensus bus)
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.25; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.56, 0, TAU); ctx.stroke();
    ctx.restore();

    // sensors feed their agent; readings flow inward and never out
    var sensors = SENSORS.concat(kept);
    sensors.forEach(function (s, j) {
      var sp = sensorPos(s), ap = agentPos(s.k);
      line(sp, ap, colors.ink3, 0.22);
      var per = 1.8 + (j * 0.37) % 1.6, ph = ((t + j * 0.71) % per) / per;
      if (ph < 0.5) disc(lerp(sp, ap, ease(ph / 0.5)), 1.7, colors.ok, 0.88);
    });
    // every agent answers to the person over the local device bus
    for (i = 0; i < N; i++) line(agentPos(-1), agentPos(i), colors.ink3, 0.32);

    // advance the story; it waits for you at the decision
    schedule(now);
    if (scene) {
      var def = scene.def;
      if (!def.fake && !scene.decision && scene.d + dt >= ASK_AT) {
        scene.d = ASK_AT;
        if (scene.manual) { if (!scene.waiting) { scene.waiting = true; showConsent(); } }
        else scene.decision = 'yes';
      } else if (!scene.waiting) scene.d += dt;
    }

    // events, under the nodes
    reqs = reqs.filter(function (q) { return drawAsk(q, (now - q.born) / 1000, 0); });
    if (scene && !drawScene(scene, scene.d, 0)) endScene(now);

    // sensors (drawn over their lines)
    sensors.forEach(function (s) { diamond(sensorPos(s), sizeS(), colors.ink3, 0.9); });

    // the person + <1 mW somatic liveness & 2-of-2 PUF+TPM ring
    var bioR = R * 0.19 + Math.sin(t * 2.8) * 1.8;
    ring({ x: cx, y: cy }, bioR, colors.ok, 0.45, 1.5);
    disc({ x: cx, y: cy }, R * 0.15, colors.ink);
    text('you', cx, cy - 1, colors.card, 700, Math.max(9, Math.round(R * 0.1)), 'center');
    text('HRV+PUF', cx, cy + R * 0.23, colors.ok, 600, Math.max(7, Math.round(fs * 0.72)), 'center', 0.85);

    // the fleet (your 6 narrow agents)
    var nr = nodeR();
    FLEET.forEach(function (f, k) {
      var p = agentPos(k), ux = Math.cos(f.a);
      if (glow[k] > 0) disc(p, nr * 2.3, colors.ok, glow[k] * 0.28);
      disc(p, nr, colors.card); ring(p, nr, colors.ok, 1, 1.8);
      var lp = P(f.a, R * 0.56 + nr + fs * 0.95);
      text(f.id, lp.x, lp.y, colors.ink, 600, Math.round(fs * 0.92), ux > 0.3 ? 'left' : ux < -0.3 ? 'right' : 'center', 0.88);
    });
    text('NON-CONTACT FIREWALL · YOUR 2-OF-2 PUF + TPM DEVICES', cx, cy + R + fs * 1.45, colors.ink3, 600, Math.max(8, Math.round(W / 54)), 'center');

    // what you are pointing at
    if (hover) {
      var hp = hover.you ? { x: cx, y: cy } : hover.s ? sensorPos(hover.s) : agentPos(hover.k);
      ring(hp, hover.you ? R * 0.2 : hover.s ? 8 : nr * 1.8, colors.ink, 0.8, 1.5);
      if (hover.k != null) sensors.forEach(function (s) { if (s.k === hover.k) { line(sensorPos(s), agentPos(s.k), colors.ok, 0.8, [], 1.5); ring(sensorPos(s), 7, colors.ok, 0.8, 1.2); } });
    }

    // events, over the nodes
    reqs.forEach(function (q) { drawAsk(q, (now - q.born) / 1000, 1); });
    if (scene) drawScene(scene, scene.d, 1);

    // caption strip
    var cap = '', capA = 1;
    if (scene) { var c = captionFor(scene); cap = c[0]; capA = c[1]; }
    else if (reqs.length) cap = 'services ask · three of your agents must agree';
    if (cap) text(cap, fs * 1.4, fs * 2, scene ? colors.ink : colors.ink3, 600, fs, 'left', capA);

    // legend
    var ly = H - fs * 1.5, lx = fs * 1.4, ls = Math.round(fs * 0.9);
    ctx.font = '600 ' + ls + 'px ' + MONO;
    diamond({ x: lx + 3, y: ly }, 3.2, colors.ink3); text('sensor', lx + 11, ly, colors.ink3, 600, ls); lx += 11 + ctx.measureText('sensor').width + fs * 1.4;
    disc({ x: lx + 4, y: ly }, 4, colors.card); ring({ x: lx + 4, y: ly }, 4, colors.ok, 1, 1.4); text('agent', lx + 13, ly, colors.ink3, 600, ls); lx += 13 + ctx.measureText('agent').width + fs * 1.4;
    var sf = fs; fs = ls * 0.85; badge({ x: lx + 5, y: ly }, true, 1); fs = sf; text('approval', lx + 15, ly, colors.ink3, 600, ls);
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
      if (reduce) { scene.decision = scene.def.emergency ? 'yes' : 'yes'; scene.d = scene.def.fake ? 5 : 8.8; frame(still); }
    });
  }

  var running = false, raf = 0;
  function loop(now) { frame(now); if (running) raf = requestAnimationFrame(loop); }
  function start() { if (!running && !reduce) { running = true; last = 0; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  readColors(); size();
  var still = performance.now();
  if (reduce) {
    // A still frame: one approved reading on its way to the dentist.
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
  if (mq.addEventListener) mq.addEventListener('change', function () { readColors(); if (reduce) frame(still); });
})();
