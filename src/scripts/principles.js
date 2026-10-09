/* The principles wheel: the floor at the centre, the working principles around it.
   Built from the plain list in the page, so the list stays the single source of truth.
   Runs entirely in the visitor's browser and sends nothing anywhere. */
(function () {
  'use strict';
  var list = document.getElementById('pr-list'), svg = document.getElementById('pr-svg');
  if (!list || !svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var SHORT = { person: 'You', economy: 'Money', gov: 'Deciding', measure: 'Checking', agents: 'Agents', plural: 'Pluralism', global: 'Everyone', adopt: 'Adoption' };
  var HUE = ['#3b82c4', '#2f9e6e', '#d99a1b', '#e0603f', '#8b6cc9', '#3aa6a0', '#c0569a', '#8a8f98'];

  var groups = [].map.call(list.querySelectorAll('section'), function (sec, i) {
    return {
      id: sec.getAttribute('data-cat'), name: sec.querySelector('h5').textContent, color: HUE[i % HUE.length],
      items: [].map.call(sec.querySelectorAll('li'), function (li) {
        var b = li.querySelector('b').textContent;
        return { title: b.replace(/\.$/, ''), text: li.textContent.slice(b.length).trim(), flag: li.getAttribute('data-flag') || '' };
      })
    };
  });
  var total = groups.reduce(function (n, g) { return n + g.items.length; }, 0);
  var floorCount = document.querySelectorAll('.floor-card li').length || 19;

  /* ---------- geometry ---------- */
  var C = 200, R0 = 98, R1 = 168, RD = 133, GAP = 3;
  function pt(a, r) { var t = (a - 90) * Math.PI / 180; return [C + r * Math.cos(t), C + r * Math.sin(t)]; }
  function sector(a0, a1, r0, r1) {
    var p0 = pt(a0, r1), p1 = pt(a1, r1), p2 = pt(a1, r0), p3 = pt(a0, r0), big = a1 - a0 > 180 ? 1 : 0;
    return 'M' + p0 + 'A' + r1 + ',' + r1 + ' 0 ' + big + ' 1 ' + p1 + 'L' + p2 + 'A' + r0 + ',' + r0 + ' 0 ' + big + ' 0 ' + p3 + 'Z';
  }
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  svg.setAttribute('viewBox', '-62 -16 524 432');
  // faint guide rings
  el('circle', { cx: C, cy: C, r: R1 + 8, class: 'pr-guide' }, svg);
  el('circle', { cx: C, cy: C, r: R0 - 10, class: 'pr-guide' }, svg);

  var span = 360 - GAP * groups.length, a = GAP / 2, n = 0;
  groups.forEach(function (g) {
    var w = span * g.items.length / total, a0 = a, a1 = a + w;
    g.layer = el('g', { class: 'pr-seg', 'data-cat': g.id, style: '--c:' + g.color }, svg);
    el('path', { d: sector(a0, a1, R0, R1), class: 'pr-band' }, g.layer);
    var mid = (a0 + a1) / 2, lp = pt(mid, R1 + 22), cosv = Math.cos((mid - 90) * Math.PI / 180);
    var t = el('text', { x: lp[0], y: lp[1], class: 'pr-lab', 'text-anchor': cosv > 0.25 ? 'start' : cosv < -0.25 ? 'end' : 'middle', 'dominant-baseline': 'middle' }, g.layer);
    t.textContent = SHORT[g.id] || g.name;
    g.items.forEach(function (it, k) {
      var ang = a0 + w * (k + 0.5) / g.items.length, p = pt(ang, RD + (g.items.length > 4 ? (k % 2 ? 14 : -14) : 0));
      it.dot = el('circle', { cx: p[0], cy: p[1], r: 7, class: 'pr-dot' + (it.flag ? ' flag' : ''), style: '--i:' + (n++) }, g.layer);
      it.dot.addEventListener('mouseenter', function () { show(g, it); });
      it.dot.addEventListener('click', function () { show(g, it); });
    });
    g.layer.querySelector('.pr-band').addEventListener('click', function () { pick(g); });
    a = a1 + GAP;
  });

  // the floor at the centre
  var core = el('g', { class: 'pr-core' }, svg);
  el('circle', { cx: C, cy: C, r: R0 - 22, class: 'pr-core-bg' }, core);
  el('circle', { cx: C, cy: C, r: R0 - 30, class: 'pr-core-ring' }, core);
  var t1 = el('text', { x: C, y: C - 10, class: 'pr-core-n', 'text-anchor': 'middle' }, core); t1.textContent = String(floorCount);
  var t2 = el('text', { x: C, y: C + 18, class: 'pr-core-t', 'text-anchor': 'middle' }, core); t2.textContent = 'commitments';
  var t3 = el('text', { x: C, y: C + 34, class: 'pr-core-t', 'text-anchor': 'middle' }, core); t3.textContent = 'for our own systems';
  core.addEventListener('click', function () { floor(); });
  core.addEventListener('mouseenter', function () { floor(); });

  /* ---------- the panel ---------- */
  var catEl = document.getElementById('pr-cat'), titleEl = document.getElementById('pr-title'), textEl = document.getElementById('pr-text');
  var legend = document.getElementById('pr-legend'), current = null;
  function focusGroup(g) {
    svg.classList.toggle('focus', !!g);
    groups.forEach(function (x) { x.layer.classList.toggle('on', x === g); });
    [].forEach.call(legend.children, function (b) { b.setAttribute('aria-pressed', String(!!g && b.dataset.cat === g.id)); });
  }
  function show(g, it) {
    focusGroup(g);
    if (current) current.dot.classList.remove('sel');
    current = it; it.dot.classList.add('sel');
    catEl.textContent = g.name; catEl.style.color = g.color;
    titleEl.textContent = it.title;
    textEl.textContent = it.text;
    if (it.flag) { var f = document.createElement('span'); f.className = 'pr-flag'; f.textContent = it.flag; textEl.appendChild(document.createTextNode(' ')); textEl.appendChild(f); }
  }
  function pick(g) {
    focusGroup(g);
    if (current) { current.dot.classList.remove('sel'); current = null; }
    catEl.textContent = g.items.length + ' principles'; catEl.style.color = g.color;
    titleEl.textContent = g.name;
    textEl.textContent = '';
    var ul = document.createElement('ul'); ul.className = 'pr-pick';
    g.items.forEach(function (it) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = it.title; b.addEventListener('click', function () { show(g, it); });
      li.appendChild(b); ul.appendChild(li);
    });
    textEl.appendChild(ul);
  }
  function floor() {
    focusGroup(null);
    if (current) { current.dot.classList.remove('sel'); current = null; }
    catEl.textContent = 'The floor'; catEl.style.color = '';
    titleEl.textContent = floorCount + ' commitments for our own systems';
    textEl.textContent = 'They bind what the CIN builds, and change only through a broad, public process. They are listed in full above. Every principle around them has to fit inside them.';
  }
  groups.forEach(function (g) {
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.cat = g.id; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<i style="background:' + g.color + '"></i>' + g.name + ' <small>' + g.items.length + '</small>';
    b.addEventListener('click', function () { pick(g); });
    legend.appendChild(b);
  });

  // Dots arrive when the wheel scrolls into view. They are only hidden while it is below
  // the fold, so if anything here fails the dots simply stay visible.
  var wheel = svg.parentNode;
  function seen() { return wheel.getBoundingClientRect().top < window.innerHeight * 0.9; }
  if (!seen()) {
    wheel.classList.add('pre');
    var go = function () {
      if (!seen()) return;
      wheel.classList.remove('pre'); wheel.classList.add('in');
      window.removeEventListener('scroll', go); if (obs) obs.disconnect();
    };
    var obs = 'IntersectionObserver' in window ? new IntersectionObserver(go) : null;
    if (obs) obs.observe(wheel);
    window.addEventListener('scroll', go, { passive: true });
  }
})();
