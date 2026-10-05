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

  /* ---------- the boundary: answers, not data ---------- */
  var cv = document.getElementById('boundary');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;

  var ASK = [
    ['Over 18?', 'yes'], ['Lives in this city?', 'yes'], ['Insured this month?', 'yes'],
    ['Income under the limit?', 'yes'], ['Free on Tuesday?', 'no'], ['Licence valid?', 'yes']
  ];
  var GRAB = ['All transactions', 'Full location history', 'Contact list', 'Every message', 'Browsing history'];

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
    cx = W / 2; cy = H / 2; R = Math.min(W, H) * 0.27;
  }

  var home = [];
  for (var i = 0; i < 16; i++) home.push({ a: Math.random() * Math.PI * 2, r: 0.25 + Math.random() * 0.6, s: (0.15 + Math.random() * 0.35) * (Math.random() < .5 ? -1 : 1), z: 1.5 + Math.random() * 2.2 });

  var reqs = [], t0 = performance.now(), lastSpawn = -9999, flip = 0;
  function spawn(now) {
    var good = (flip++ % 5) !== 1 && (flip % 5) !== 3 ? true : false;
    var item = good ? ASK[Math.floor(Math.random() * ASK.length)] : [GRAB[Math.floor(Math.random() * GRAB.length)], 'declined'];
    // pick an angle away from existing requests
    var a, tries = 0;
    do { a = Math.random() * Math.PI * 2; tries++; } while (tries < 12 && reqs.some(function (q) { return Math.abs(Math.atan2(Math.sin(q.a - a), Math.cos(q.a - a))) < 0.9; }));
    reqs.push({ a: a, good: good, q: item[0], ans: item[1], born: now, phase: 0 });
  }

  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3); }

  function label(text, x, y, color, bg, align) {
    ctx.font = '600 ' + Math.max(10, Math.round(W / 46)) + 'px ui-monospace, Consolas, monospace';
    var w = ctx.measureText(text).width + 14, h = Math.max(20, W / 26);
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

  function frame(now) {
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // faint field grid
    ctx.fillStyle = colors.rule;
    var step = Math.max(18, W / 22);
    for (var gx = step / 2; gx < W; gx += step) for (var gy = step / 2; gy < H; gy += step) { ctx.globalAlpha = 0.55; ctx.fillRect(gx, gy, 1.2, 1.2); }
    ctx.globalAlpha = 1;

    // boundary ring
    ctx.save();
    ctx.setLineDash([4, 7]); ctx.lineDashOffset = -t * 6;
    ctx.strokeStyle = colors.ink; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // home data: orbiting, never leaving
    home.forEach(function (d) {
      var a = d.a + t * d.s, rr = R * d.r * 0.82;
      ctx.fillStyle = colors.ok; ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, d.z, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // the twin (center)
    ctx.fillStyle = colors.ink;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colors.card;
    ctx.font = '700 ' + Math.max(9, Math.round(R * 0.11)) + 'px ui-monospace, Consolas, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('twin', cx, cy + 1);
    ctx.fillStyle = colors.ink3; ctx.font = '600 ' + Math.max(9, Math.round(W / 50)) + 'px ui-monospace, Consolas, monospace';
    ctx.fillText('YOUR DEVICE', cx, cy + R + Math.max(14, W / 32));

    // requests
    if (now - lastSpawn > 2300 && reqs.length < 3) { spawn(now); lastSpawn = now; }
    var far = Math.hypot(W, H) * 0.55;
    reqs = reqs.filter(function (q) {
      var age = (now - q.born) / 1000;
      var ux = Math.cos(q.a), uy = Math.sin(q.a);
      var bx = cx + ux * R, by = cy + uy * R;
      var col = q.good ? colors.ok : colors.bad;
      var labelAlign = ux > 0.3 ? 'left' : ux < -0.3 ? 'right' : 'center';
      var off = 16;
      if (age < 2.2) {                              // approach
        var p = ease(age / 2.2);
        var d = far - (far - R - 6) * p;
        var x = cx + ux * d, y = cy + uy * d;
        ctx.strokeStyle = colors.ink3; ctx.globalAlpha = 0.35; ctx.setLineDash([2, 5]);
        ctx.beginPath(); ctx.moveTo(cx + ux * far, cy + uy * far); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 1; ctx.fillStyle = colors.ink;
        ctx.fillRect(x - 4, y - 4, 8, 8);
        if (age > 0.9) label(q.q, x + ux * off, y + uy * off, colors.ink, colors.card, labelAlign);
        return true;
      }
      if (age < 3.4) {                              // checked at the boundary
        ctx.fillStyle = colors.ink; ctx.fillRect(bx + ux * 6 - 4, by + uy * 6 - 4, 8, 8);
        var pulse = (age - 2.2) / 1.2;
        ctx.strokeStyle = col; ctx.globalAlpha = 1 - pulse; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(bx, by, 6 + pulse * 22, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 1;
        label(q.q, bx + ux * (off + 6), by + uy * (off + 6), colors.ink, colors.card, labelAlign);
        return true;
      }
      if (age < 6.2) {                              // answered or declined
        var k = (age - 3.4) / 2.8, e2 = ease(k);
        var dd = R + 6 + (far * 0.75 - R) * e2;
        var x2 = cx + ux * dd, y2 = cy + uy * dd;
        ctx.globalAlpha = 1 - Math.max(0, (k - 0.6) / 0.4);
        if (q.good) {
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x2, y2, 4.5, 0, Math.PI * 2); ctx.fill();
          label(q.ans, x2 + ux * off, y2 + uy * off, col, colors.card, labelAlign);
        } else {
          ctx.strokeStyle = col; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.moveTo(x2 - 5, y2 - 5); ctx.lineTo(x2 + 5, y2 + 5); ctx.moveTo(x2 + 5, y2 - 5); ctx.lineTo(x2 - 5, y2 + 5); ctx.stroke(); ctx.lineWidth = 1;
          label('declined', x2 + ux * off, y2 + uy * off, col, colors.card, labelAlign);
        }
        ctx.globalAlpha = 1;
        return true;
      }
      return false;
    });
  }

  var running = false, raf = 0;
  function loop(now) { frame(now); if (running) raf = requestAnimationFrame(loop); }
  function start() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  readColors(); size();
  if (reduce) {
    // A still frame: one answered and one declined request.
    var n = performance.now();
    reqs = [{ a: -0.6, good: true, q: 'Over 18?', ans: 'yes', born: n - 4400 }, { a: 2.5, good: false, q: 'All transactions', ans: 'declined', born: n - 4400 }];
    lastSpawn = Infinity; frame(n);
  } else {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(cv);
    } else start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }
  window.addEventListener('resize', function () { size(); if (reduce) frame(performance.now()); });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', function () { readColors(); });
})();
