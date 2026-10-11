/* Outward: what you need. A need goes out from your own agents, through rings of trust (people you trust, friends of
   friends, the wider network), with less about you shown at each step. Offers come back, a match asks for your call,
   and the shared record credits everyone's effort. An illustration, not a working product. */
(function () {
  'use strict';
  var tabs = document.getElementById('bd-tabs');
  var cv = document.getElementById('network');
  if (!tabs || !cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var TAU = Math.PI * 2, MONO = 'ui-monospace, Consolas, monospace';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  var C = {};
  function colors() {
    C.ink = cssVar('--ink') || '#17181c'; C.ink3 = cssVar('--ink-3') || '#6d6f76'; C.ok = cssVar('--ok') || '#1f6f68';
    C.blue = cssVar('--blue') || '#1f6fb3'; C.gold = cssVar('--gold') || '#d99a1b'; C.bad = cssVar('--accent') || '#c8402a';
    C.card = cssVar('--card') || '#fbf9f4'; C.rule = cssVar('--rule') || '#d8d2c4';
  }

  // The network: you, your own agents, then three rings of other people's agents.
  var RINGS = [{ r: 0.38, n: 6, label: 'people you trust', key: 'trusted' }, { r: 0.6, n: 10, label: 'friends of friends', key: 'fof' },
               { r: 0.84, n: 18, label: 'the wider network', key: 'swarm' }];
  var NODES = [];
  RINGS.forEach(function (ring, ri) {
    for (var i = 0; i < ring.n; i++) NODES.push({ ring: ri, a: -Math.PI / 2 + (i + 0.5 + (ri % 2) * 0.25) * TAU / ring.n, r: ring.r, glow: 0, many: false });   // no dot under the ring's label
  });
  var MINE = [0, 1, 2, 3, 4, 5].map(function (i) { return { a: -Math.PI / 2 + i * TAU / 6, glow: 0 }; });
  var LEVEL = { local: -1, trusted: 0, fof: 1, swarm: 2 };

  var SCENES = [
    { id: 'meds', chip: 'Cheaper medicine', need: 'Your prescription costs too much.', level: 'local',
      local: 'Your health agent remembers, from your own history, that a generic version worked for you before. It finds the cheapest pharmacy nearby.',
      ledger: ['Nothing left your devices: your own agents solved it.'] },
    { id: 'roof', chip: 'Leaking roof', need: 'Water is coming through the roof.', level: 'trusted', seen: '“roof repair, this week, this street”',
      offers: ['A neighbour’s agent recommends the roofer who fixed their roof in spring.', 'A drone inspection service offers a free scan.'],
      q: 'Share your address with the roofer your neighbour recommends, to book an inspection?',
      ledger: ['Your neighbour’s agent earns recognition for a referral that worked.', 'The roofer’s record gains one more finished job, rated by you.'] },
    { id: 'run', chip: 'Running partner', need: 'You want someone to run with, at your pace.', level: 'fof', seen: 'your pace, your usual times, your rough area: not your name',
      offers: ['Two people, a friend of a friend away, run at your pace on weekday mornings.'],
      q: 'Meet a runner your friends trust? Their agent sees only your first name and your morning schedule.',
      ledger: ['Both agents note a new connection. Trust between you starts small and grows with every run.'] },
    { id: 'lang', chip: 'Learn Japanese', need: 'You want to learn Japanese before a trip next year.', level: 'swarm', seen: 'an anonymous request: the language, your level, your budget',
      offers: ['An open course your agent can run for you, free.', 'A tutor’s agent offers two trial lessons.', 'Three learners at your level want a study group.'],
      q: 'Join a study group of three learners at your level? They see only your first name and your level.',
      ledger: ['The course’s authors earn recognition every time it helps someone.', 'Your practice is kept privately, and can later show the effort you put in.'] },
    { id: 'garden', chip: 'Community garden', need: 'Your street wants to turn an empty lot into a garden.', level: 'swarm', seen: 'a public project: the lot, the goal, the skills it needs', many: true,
      offers: ['14 households nearby want the same thing.', 'A planner’s agent tries three layouts in a simulation first.', 'Two retired builders and a soil scientist volunteer.'],
      q: 'Join 14 neighbours who want the same garden, and split the work between you?',
      ledger: ['Every hour of work is recorded, in many kinds: digging, planning, teaching, lending tools.', 'Recognition that sits unused slowly flows back to the shared pool, so value keeps moving.',
               'When the garden is done, its project agent retires and passes what it learned to the agents that asked.'] },
    { id: 'harm', chip: 'A harmful wish', need: 'You ask how to get back at a neighbour.', level: 'local', harm: true,
      local: 'Your agents simulate it first: it would hurt someone. They decline, and offer to help settle the dispute through a mediator you both trust.',
      ledger: ['Kept privately: a harmful request, declined, with a better way offered.'] }
  ];

  var sceneBar = document.getElementById('nw-scenes'), consent = document.getElementById('nw-consent'), qEl = document.getElementById('nw-q');
  var logEl = document.getElementById('nw-log'), logWrap = document.getElementById('nw-logwrap');
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1, fs = 10;
  var scene = null, t0 = 0, phase = '', waiting = false, decision = null, packets = [], matchNode = -1, autoplay = true, autoIdx = 0, running = false;

  function size() {
    var b = cv.getBoundingClientRect(); if (!b.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = b.width; H = b.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) / 2 * 0.92; cx = W / 2; cy = H / 2; fs = Math.max(9, Math.round(R / 24));
  }
  function pos(n) { return [cx + Math.cos(n.a) * n.r * R, cy + Math.sin(n.a) * n.r * R]; }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function log(text, kind) {
    var empty = logEl.querySelector('.bd-empty'); if (empty) empty.remove();
    var li = el('li', kind ? 'bd-' + kind : null, text); logEl.appendChild(li);
    while (logEl.children.length > 3) logEl.removeChild(logEl.firstChild);
    logWrap.scrollTop = logWrap.scrollHeight;
  }

  SCENES.forEach(function (s) {
    var b = el('button', null, s.chip); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    b.onclick = function () { autoplay = false; start(s); };
    s.btn = b; sceneBar.appendChild(b);
  });
  consent.querySelector('.bd-yes').onclick = function () { answer('yes'); };
  consent.querySelector('.bd-no').onclick = function () { answer('no'); };

  function start(s) {
    SCENES.forEach(function (x) { x.btn.setAttribute('aria-pressed', String(x === s)); });
    scene = s; t0 = performance.now(); phase = ''; waiting = false; decision = null; packets = []; matchNode = -1; order = steps(s); idx = 0;
    consent.hidden = true; logWrap.hidden = false; logEl.textContent = '';
    NODES.forEach(function (n) { n.glow = 0; n.many = false; }); MINE.forEach(function (m) { m.glow = 0; });
    if (!running) { running = true; requestAnimationFrame(frame); }
  }
  function answer(d) {
    if (!waiting) return;
    decision = d; waiting = false; consent.hidden = true; logWrap.hidden = false;
    if (d === 'yes') log('You said yes. Only what you approved was shared.', 'ok');
    else log('You declined. Nothing more was shared, and your agents keep looking.', 'warn');
    idx = order.indexOf('ledger'); t0 = performance.now() - idx * STEP;
  }

  // The steps a scene goes through: it only widens as far as it needs to.
  var STEP = reduced ? 300 : 1700, order = [], idx = 0;
  function steps(s) {
    var o = ['sense', 'need', 'local'], lv = LEVEL[s.level];
    for (var i = 0; i <= lv; i++) o.push(RINGS[i].key);
    if (lv >= 0) o.push('offers', 'match');
    return o.concat(['ledger', 'end']);
  }
  function phaseAt(p) { var k = order.indexOf(p); return k < 0 ? Infinity : k * STEP; }
  function enter(p) {
    phase = p; var s = scene, lv = LEVEL[s.level];
    if (p === 'sense') log('Your devices confirm it is really you.');
    if (p === 'need') log('A need: ' + s.need);
    if (p === 'local') {
      MINE.forEach(function (m) { m.glow = 1; });
      if (lv < 0) log(s.local, s.harm ? 'warn' : 'ok'); else log('Your own agents and your private memory try first. Not enough this time.');
    }
    RINGS.forEach(function (ring, ri) {
      if (p !== ring.key) return;
      NODES.forEach(function (n) { if (n.ring === ri) n.glow = 1; });
      log(ri === 0 ? 'Asked the agents of people you trust. They see: ' + s.seen + '.'
          : ri === 1 ? 'Widened to friends of friends. Your name and address stay with you.'
          : 'Posted to the wider network as an anonymous task. Any agent that can help may answer.');
    });
    if (p === 'offers') {
      var pool = NODES.filter(function (n) { return n.ring === lv; });
      (s.offers || []).forEach(function (o, i) {
        var n = pool[(i * 3 + 1) % pool.length]; packets.push({ from: n, born: performance.now() + i * 250 });
        setTimeout(function () { if (scene === s) log('Offer: ' + o); }, i * 250);
      });
      matchNode = NODES.indexOf(pool[1 % pool.length]);
      if (s.many) NODES.forEach(function (n, i) { if (n.ring >= 1 && (i * 7) % 5 < 2) { n.glow = 1; n.many = true; } });   // the neighbours who share the goal
    }
    if (p === 'match') {
      waiting = true; qEl.textContent = s.q; consent.hidden = false; logWrap.hidden = true;
      if (autoplay) setTimeout(function () { if (waiting && scene === s) answer('yes'); }, reduced ? 1500 : 6000);
    }
    if (p === 'ledger') (s.ledger || []).forEach(function (l, i) { setTimeout(function () { if (scene === s) log('Recorded: ' + l, 'ledger'); }, i * 400); });
    if (p === 'end' && autoplay) setTimeout(function () { if (autoplay && scene === s) { autoIdx = (autoIdx + 1) % SCENES.length; start(SCENES[autoIdx]); } }, reduced ? 1500 : 3500);
  }

  function frame(now) {
    if (!running) return;
    if (!W) size();
    while (scene && !waiting && idx < order.length && now - t0 >= idx * STEP) { enter(order[idx]); idx++; }
    draw(now);
    if (!document.hidden && !cv.closest('[hidden]')) requestAnimationFrame(frame); else running = false;
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    // the rings of trust
    RINGS.forEach(function (ring, ri) {
      ctx.beginPath(); ctx.arc(cx, cy, ring.r * R, 0, TAU);
      ctx.strokeStyle = C.rule; ctx.setLineDash([3, 6]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = (fs - 1) + 'px ' + MONO; ctx.textAlign = 'center';
      ctx.fillText(ring.label, cx, cy - ring.r * R - 5);
    });
    var lv = scene ? LEVEL[scene.level] : -1, reach = -2;
    if (scene) { if (phase === 'local' || phase === 'need' || phase === 'sense') reach = -1; RINGS.forEach(function (rg, ri) { if (phaseAt(phase) >= phaseAt(rg.key)) reach = Math.max(reach, ri); }); }
    // the paths a request travels
    NODES.forEach(function (n, i) {
      if (n.ring > reach) return;
      var p = pos(n), parent = n.ring === 0 ? [cx, cy] : pos(NODES.filter(function (m) { return m.ring === n.ring - 1; })[Math.floor(i % RINGS[n.ring - 1].n)]);
      ctx.beginPath(); ctx.moveTo(parent[0], parent[1]); ctx.lineTo(p[0], p[1]);
      ctx.strokeStyle = n.ring === 0 ? C.ok : n.ring === 1 ? C.blue : C.ink3; ctx.globalAlpha = 0.25; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
    });
    // other people's agents (each dot is a person with their own agents)
    NODES.forEach(function (n, i) {
      var p = pos(n), col = n.ring === 0 ? C.ok : n.ring === 1 ? C.blue : C.ink3;
      n.glow *= 0.985;
      var rr = (n.ring === 0 ? 7 : n.ring === 1 ? 5.5 : 4.2) * (R / 260);
      if ((i === matchNode || n.many) && (phase === 'match' || phase === 'ledger' || phase === 'end') && decision !== 'no') {
        ctx.beginPath(); ctx.arc(p[0], p[1], rr * 2.6 + Math.sin(now / 300) * 2, 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p[0], p[1]); ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.beginPath(); ctx.arc(p[0], p[1], rr * (1 + n.glow * 0.5), 0, TAU);
      ctx.fillStyle = col; ctx.globalAlpha = 0.35 + 0.65 * Math.max(n.glow, n.ring > reach ? 0.25 : 0.6); ctx.fill(); ctx.globalAlpha = 1;
    });
    // offers travelling back to you
    packets.forEach(function (k) {
      var age = (now - k.born) / (reduced ? 300 : 1400); if (age < 0 || age > 1) return;
      var p = pos(k.from), x = p[0] + (cx - p[0]) * age, y = p[1] + (cy - p[1]) * age;
      ctx.beginPath(); ctx.arc(x, y, 3.5 * (R / 260), 0, TAU); ctx.fillStyle = C.gold; ctx.fill();
    });
    // your own agents, around you
    MINE.forEach(function (m) {
      m.glow *= 0.98;
      var x = cx + Math.cos(m.a + now / 9000) * 0.15 * R, y = cy + Math.sin(m.a + now / 9000) * 0.15 * R;
      ctx.beginPath(); ctx.arc(x, y, 3.2 * (R / 260) * (1 + m.glow), 0, TAU); ctx.fillStyle = C.ok; ctx.globalAlpha = 0.5 + 0.5 * m.glow; ctx.fill(); ctx.globalAlpha = 1;
    });
    // you
    var pulse = phase === 'sense' ? 1 + Math.sin(now / 120) * 0.15 : 1;
    ctx.beginPath(); ctx.arc(cx, cy, 13 * (R / 260) * pulse, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 0.2 * R, 0, TAU); ctx.strokeStyle = C.ok; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.card; ctx.font = '600 ' + fs + 'px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('you', cx, cy + 0.5);
    ctx.textBaseline = 'alphabetic';
    if (scene && phase && phase !== 'sense') {
      ctx.fillStyle = scene.harm ? C.bad : C.ink; ctx.font = '600 ' + fs + 'px ' + MONO;
      ctx.fillText(scene.chip.toLowerCase(), cx, cy + 0.27 * R);
    }
  }

  // Tabs: who asks for your data (the boundary) / what you need (the network).
  var inward = ['boundary-frame', 'bd-scenes', 'bd-side', 'bd-cap'].map(function (c) { return document.querySelector('.' + c) || document.getElementById(c); });
  var outward = ['nw-frame', 'nw-scenes', 'nw-side', 'nw-cap'].map(function (id) { return document.getElementById(id); });
  function show(which) {
    tabs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === which)); });
    inward.forEach(function (e) { if (e) e.hidden = which !== 'in'; });
    outward.forEach(function (e) { if (e) e.hidden = which !== 'out'; });
    if (which === 'out') {
      colors(); size();
      if (!scene) start(SCENES[0]); else if (!running) { running = true; requestAnimationFrame(frame); }
    }
  }
  tabs.querySelectorAll('button').forEach(function (b) { b.onclick = function () { show(b.dataset.tab); }; });
  window.addEventListener('resize', function () { if (!cv.closest('[hidden]')) size(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !cv.closest('[hidden]') && !running) { running = true; requestAnimationFrame(frame); } });
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', colors);
  colors();
})();
