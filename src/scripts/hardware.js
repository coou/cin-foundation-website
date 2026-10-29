/* The hardware goals chart: technologies placed by how little power they need and how mature they are.
   Built from the plain list in the page. Runs in the browser and sends nothing anywhere. */
(function () {
  'use strict';
  var list = document.getElementById('hw-list'), svg = document.getElementById('hw-svg');
  if (!list || !svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var ROWS = ['Available now', 'Early silicon', 'Lab research'];
  var rowEl = document.getElementById('hw-row'), titleEl = document.getElementById('hw-title'), textEl = document.getElementById('hw-text'), srcEl = document.getElementById('hw-src');
  var items = [].map.call(list.querySelectorAll('li'), function (li) {
    var b = li.querySelector('b').textContent;
    return { row: +li.dataset.row, pos: +li.dataset.pos, title: b, text: li.textContent.slice(b.length).trim(), src: li.dataset.src, cite: li.dataset.cite };
  });
  function el(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  var X0 = 118, X1 = 620, Y0 = 40, RH = 70;
  function x(p) { return X0 + (X1 - X0) * p; }
  svg.setAttribute('viewBox', '0 0 640 310');
  // the goal zone
  el('rect', { x: x(0.76), y: Y0 - 14, width: x(1) - x(0.76) + 8, height: RH * 3 + 8, rx: 12, class: 'hw-goal' }, svg);
  var g1 = el('text', { x: x(0.88), y: Y0 - 20, class: 'hw-goal-t', 'text-anchor': 'middle' }, svg); g1.textContent = 'SUB-mW EDGE TARGET';
  // rows
  ROWS.forEach(function (r, i) {
    var cy = Y0 + RH * i + RH / 2;
    el('line', { x1: X0, y1: cy, x2: X1, y2: cy, class: 'hw-lane' + (i === 0 ? ' now' : '') }, svg);
    var t = el('text', { x: X0 - 14, y: cy + 4, class: 'hw-rlab' + (i === 0 ? ' now' : ''), 'text-anchor': 'end' }, svg); t.textContent = r;
  });
  // power axis
  var AY = Y0 + RH * 3 + 10;
  el('line', { x1: X0, y1: AY, x2: X1, y2: AY, class: 'hw-axis', 'marker-end': 'url(#hw-ar)' }, svg);
  var mk = el('marker', { id: 'hw-ar', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, el('defs', {}, svg));
  el('path', { d: 'M0 0L10 5L0 10z', class: 'hw-arrow' }, mk);
  [[0, '100 W Desktop'], [0.28, '15 W Laptop'], [0.54, '2 W Mobile'], [0.77, '1 mW Pre-ADC'], [1, '10 µW Optical']].forEach(function (tk) {
    el('line', { x1: x(tk[0]), y1: AY - 4, x2: x(tk[0]), y2: AY + 4, class: 'hw-axis' }, svg);
    var t = el('text', { x: x(tk[0]), y: AY + 20, class: 'hw-tick', 'text-anchor': tk[0] === 0 ? 'start' : tk[0] === 1 ? 'end' : 'middle' }, svg); t.textContent = tk[1];
  });
  var al = el('text', { x: X0, y: AY + 40, class: 'hw-tick' }, svg); al.textContent = 'Energy efficiency per local inference / attestation →';

  // the nodes, numbered; a key below the chart names them
  var key = document.createElement('ol'); key.className = 'hw-key';
  svg.parentNode.appendChild(key);
  var keyBtns = [];
  var nodes = items.map(function (it, i) {
    var cy = Y0 + RH * it.row + RH / 2, cx = x(it.pos);
    var g = el('g', { class: 'hw-node r' + it.row }, svg);
    el('circle', { cx: cx, cy: cy, r: 11 }, g);
    var t = el('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', class: 'hw-num' }, g); t.textContent = String(i + 1);
    g.addEventListener('mouseenter', function () { show(i); });
    g.addEventListener('click', function () { show(i); });
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.className = 'r' + it.row; b.innerHTML = '<i>' + (i + 1) + '</i>' + it.title;
    b.addEventListener('click', function () { show(i); }); b.addEventListener('mouseenter', function () { show(i); });
    li.appendChild(b); key.appendChild(li); keyBtns.push(b);
    return g;
  });
  function show(i) {
    var it = items[i];
    nodes.forEach(function (n, j) { n.classList.toggle('sel', j === i); keyBtns[j].setAttribute('aria-pressed', String(j === i)); });
    rowEl.textContent = ROWS[it.row]; rowEl.className = 'hw-row r' + it.row;
    titleEl.textContent = it.title; textEl.textContent = it.text;
    srcEl.innerHTML = it.src ? 'Source: <a href="' + it.src + '" rel="noopener noreferrer">' + it.cite + '</a>' : '';
  }
  list.classList.add('hw-built');   // the chart now carries the list; keep it for screen readers
  if (items.length) show(0);
})();
