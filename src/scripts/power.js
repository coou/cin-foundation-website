/* Power brings visibility: pick a role, see how far its decisions reach and what the network may ask to see.
   Built from the role buttons and tier list in the page. Runs in the browser and sends nothing anywhere. */
(function () {
  'use strict';
  var roles = document.getElementById('pv-roles'), svg = document.getElementById('pv-svg');
  if (!roles || !svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var btns = [].slice.call(roles.querySelectorAll('button'));
  var tiers = [].slice.call(document.querySelectorAll('#pv-tiers li'));
  var reachEl = document.getElementById('pv-reach'), roleEl = document.getElementById('pv-role'), askEl = document.getElementById('pv-ask');

  // Reach on a log scale: 10 to 10 billion people. Each tier starts at a reach threshold.
  var X0 = 40, X1 = 600, LO = 1, HI = 10, BASE = 230, TOP = 40;
  var TIER_AT = [1, 3, 4.5, 7, 9];            // log10 of reach where each tier's obligations begin
  var TIER_H = [0.12, 0.3, 0.52, 0.78, 1];     // share of the height: how much may be asked
  function x(log) { return X0 + (X1 - X0) * (log - LO) / (HI - LO); }
  function y(h) { return BASE - (BASE - TOP) * h; }
  function el(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  svg.setAttribute('viewBox', '0 0 640 300');
  // the staircase: what may be asked, by reach
  var d = 'M' + x(LO) + ' ' + BASE;
  TIER_AT.forEach(function (at, i) { d += ' L' + x(at) + ' ' + (i ? y(TIER_H[i - 1]) : BASE) + ' L' + x(at) + ' ' + y(TIER_H[i]); });
  d += ' L' + x(HI) + ' ' + y(1) + ' L' + x(HI) + ' ' + BASE + ' Z';
  el('path', { d: d, class: 'pv-stair' }, svg);
  var clip = el('clipPath', { id: 'pv-clip' }, el('defs', {}, svg));
  var clipRect = el('rect', { x: X0, y: 0, width: 0, height: 300 }, clip);
  el('path', { d: d, class: 'pv-stair-on', 'clip-path': 'url(#pv-clip)' }, svg);
  ['Everyone', 'Livelihoods', 'Institutions', 'Mass influence', 'Could harm everyone'].forEach(function (t, i) {
    var nx = i < 4 ? x(TIER_AT[i + 1]) : x(HI);
    var tx = el('text', { x: (x(TIER_AT[i]) + nx) / 2, y: y(TIER_H[i]) + 15, class: 'pv-tlab', 'text-anchor': 'middle' }, svg);
    tx.textContent = t;
  });
  // axis
  el('line', { x1: X0, y1: BASE, x2: X1, y2: BASE, class: 'pv-axis' }, svg);
  [[1, '10'], [3, '1,000'], [5, '100,000'], [7, '10 million'], [9, '1 billion']].forEach(function (tk) {
    el('line', { x1: x(tk[0]), y1: BASE, x2: x(tk[0]), y2: BASE + 5, class: 'pv-axis' }, svg);
    var t = el('text', { x: x(tk[0]), y: BASE + 19, class: 'pv-tick', 'text-anchor': 'middle' }, svg); t.textContent = tk[1];
  });
  var axl = el('text', { x: X1, y: BASE + 40, class: 'pv-tick', 'text-anchor': 'end' }, svg); axl.textContent = 'people their decisions reach →';
  var yl = el('text', { x: X0, y: TOP - 18, class: 'pv-tick' }, svg); yl.textContent = 'what the network may ask to see ↑';
  // a dot for every role on the axis
  var marks = btns.map(function (b, i) {
    var lx = x(+b.dataset.reach);
    var c = el('circle', { cx: lx, cy: BASE, r: 5.5, class: 'pv-dot' }, svg);
    c.addEventListener('click', function () { pick(i); });
    return c;
  });
  var cursor = el('line', { x1: 0, y1: TOP - 6, x2: 0, y2: BASE, class: 'pv-cursor' }, svg);
  var you = el('g', { class: 'pv-you' }, svg);
  el('circle', { cx: 0, cy: -16, r: 6 }, you); el('path', { d: 'M-10 2 a10 10 0 0 1 20 0 z' }, you);
  var rings = [0, 1, 2, 3].map(function (i) { return el('circle', { cx: 0, cy: -10, r: 16 + i * 9, class: 'pv-ring' }, you); });

  function words(log) {
    var n = Math.pow(10, log);
    if (n < 1e3) return 'about ' + (n < 300 ? 'a hundred' : 'several hundred') + ' people';
    if (n < 1e6) return 'about ' + Math.round(n / 1e3).toLocaleString('en') + ' thousand people';
    if (n < 1e9) return 'about ' + Math.round(n / 1e6).toLocaleString('en') + ' million people';
    return 'billions of people';
  }
  var ASK = [
    '', '', '',
    'For example, your agent can ask where they stand on pausing frontier AI, and get their votes, statements and scored forecasts, each dated and attested.',
    'For example, anyone’s agent can ask what this leader has committed to before the next training run, and check that the commitment was kept.'
  ];
  function pick(i) {
    var b = btns[i], lg = +b.dataset.reach, tier = +b.dataset.tier, px = x(lg);
    btns.forEach(function (o, j) { o.setAttribute('aria-pressed', String(j === i)); marks[j].classList.toggle('on', j === i); });
    tiers.forEach(function (li) { var t = +li.dataset.tier; li.classList.toggle('on', t <= tier); li.classList.toggle('now', t === tier); });
    roleEl.textContent = b.textContent;
    reachEl.textContent = 'Decisions reach ' + words(lg);
    askEl.textContent = ASK[tier]; askEl.hidden = !ASK[tier];
    clipRect.setAttribute('width', Math.max(0, px - X0));
    cursor.setAttribute('x1', px); cursor.setAttribute('x2', px);
    you.setAttribute('transform', 'translate(' + px + ' ' + (y(TIER_H[tier]) - 22) + ')');
    rings.forEach(function (r, k) { r.classList.toggle('on', k < tier); });
  }
  btns.forEach(function (b, i) { b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', function () { pick(i); }); });
  pick(0);
})();
