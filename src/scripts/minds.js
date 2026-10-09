/* Many minds, one body: cells cooperating as a body, and people with their agents cooperating as a network.
   Runs in the browser and sends nothing anywhere. */
(function () {
  'use strict';
  var svg = document.getElementById('mn-svg'), modes = document.getElementById('mn-modes');
  if (!svg || !modes) return;
  var NS = 'http://www.w3.org/2000/svg';
  var bioEl = document.getElementById('mn-bio'), cinEl = document.getElementById('mn-cin');
  var TEXT = [
    ['Each cell has its own small goals and memory. Joined by electrical signals, cells share one picture of the world and build what no single cell could plan, like a hand of the right shape.',
     'Each of your agents is a small mind too: one job, a small view of the world, answering to you. Together they look after a whole life.'],
    ['Life is built from partnerships. Complex cells began when once-independent microbes merged, an idea called symbiogenesis. Levin and colleagues suggest such partnerships stack, level upon level.',
     'Each person, with their agents, is like one cell. Joined by verified channels that carry answers, not data, people form a network that can sense and act at a scale no one person could.'],
    ['When a cell disconnects from its neighbours, its world shrinks to its own surface and it chases single-cell goals again. Levin describes cancer this way.',
     'An agent that stops serving its person is the same failure. So every agent has a narrow job, checkers built differently watch it, and its compute ends if it harms the person it serves.'],
    ['Levin calls the coming mix of living and engineered parts, from cyborgs to new hybrid beings, synthbiosis.',
     'If people later merge with machines, the same rule should hold: every part answers to its person, and enhancement spreads by choice to everyone, not first to a wealthy few.']
  ];
  function el(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  // Points spread inside a circle (a sunflower pattern), so the layout is the same on every load.
  function spread(n, cx, cy, r) {
    var pts = [], g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) { var rr = r * Math.sqrt((i + 0.5) / n), a = i * g; pts.push({ x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) }); }
    return pts;
  }
  function links(pts, maxD) {
    var out = [];
    for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < maxD) out.push([i, j]);
    return out;
  }

  svg.setAttribute('viewBox', '0 0 660 320');
  var L = el('g', { class: 'mn-left' }, svg), Rg = el('g', { class: 'mn-right' }, svg);

  // Left: a body made of cells
  el('circle', { cx: 165, cy: 165, r: 128, class: 'mn-skin' }, L);
  var cells = spread(19, 165, 165, 100), cl = links(cells, 52);
  var cellLinks = cl.map(function (p) { return el('line', { x1: cells[p[0]].x, y1: cells[p[0]].y, x2: cells[p[1]].x, y2: cells[p[1]].y, class: 'mn-gap', 'data-a': p[0], 'data-b': p[1] }, L); });
  var cellEls = cells.map(function (c, i) { return el('circle', { cx: c.x, cy: c.y, r: 11, class: 'mn-cell', style: '--d:' + (i * 0.17) + 's' }, L); });
  var lt = el('text', { x: 165, y: 22, class: 'mn-cap', 'text-anchor': 'middle' }, L); lt.textContent = 'CELLS → A BODY';

  // Right: a network of people, each with a small ring of agents
  el('circle', { cx: 495, cy: 165, r: 128, class: 'mn-skin net' }, Rg);
  var ppl = spread(12, 495, 165, 96), pl = links(ppl, 62);
  var pplLinks = pl.map(function (p) { return el('line', { x1: ppl[p[0]].x, y1: ppl[p[0]].y, x2: ppl[p[1]].x, y2: ppl[p[1]].y, class: 'mn-chan', 'data-a': p[0], 'data-b': p[1] }, Rg); });
  var people = ppl.map(function (c, i) {
    var g = el('g', { class: 'mn-person', transform: 'translate(' + c.x + ' ' + c.y + ')' }, Rg);
    el('circle', { r: 20, class: 'mn-aug' }, g);
    el('circle', { r: 13, class: 'mn-orbit' }, g);
    var sats = [0, 1, 2].map(function (k) { var a = i * 0.7 + k * 2.094; return el('circle', { cx: 13 * Math.cos(a), cy: 13 * Math.sin(a), r: 2.6, class: 'mn-agent' }, g); });
    el('circle', { r: 5.5, class: 'mn-you' }, g);
    return { g: g, sats: sats };
  });
  var rt = el('text', { x: 495, y: 22, class: 'mn-cap', 'text-anchor': 'middle' }, Rg); rt.textContent = 'PEOPLE + AGENTS → A NETWORK';

  // between them: one level up
  var arrow = el('g', { class: 'mn-arrow' }, svg);
  el('path', { d: 'M300 170 C318 150, 342 150, 360 170', class: 'mn-arc' }, arrow);
  el('path', { d: 'M352 160 L361 171 L348 173 Z', class: 'mn-head-ar' }, arrow);
  var at = el('text', { x: 330, y: 196, class: 'mn-cap', 'text-anchor': 'middle' }, arrow); at.textContent = 'ONE LEVEL UP';

  // the defector and the engineered part
  var BAD_CELL = 14, BAD_PERSON = 9, ENG_CELL = 6;
  var shrink = el('circle', { cx: cells[BAD_CELL].x, cy: cells[BAD_CELL].y, r: 16, class: 'mn-shrink' }, L);
  var eng = el('rect', { x: cells[ENG_CELL].x - 9, y: cells[ENG_CELL].y - 9, width: 18, height: 18, rx: 3, class: 'mn-eng' }, L);

  function setMode(m) {
    svg.setAttribute('data-mode', m);
    [].forEach.call(modes.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(+b.dataset.mode === m)); });
    bioEl.textContent = TEXT[m][0]; cinEl.textContent = TEXT[m][1];
    var broken = m === 2;
    cellEls[BAD_CELL].classList.toggle('bad', broken);
    cellLinks.forEach(function (l) { l.classList.toggle('cut', broken && (+l.dataset.a === BAD_CELL || +l.dataset.b === BAD_CELL)); });
    shrink.classList.toggle('on', broken);
    people[BAD_PERSON].sats[0].classList.toggle('bad', broken);
    people[BAD_PERSON].g.classList.toggle('watched', broken);
    pplLinks.forEach(function (l) { l.classList.toggle('alert', broken && (+l.dataset.a === BAD_PERSON || +l.dataset.b === BAD_PERSON)); });
    eng.classList.toggle('on', m === 3);
    people.forEach(function (p, i) { p.g.style.setProperty('--i', i); p.g.classList.toggle('aug', m === 3); });
  }
  modes.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setMode(+b.dataset.mode); });
  setMode(0);
})();
