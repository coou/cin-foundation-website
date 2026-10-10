/* Live alignment trajectory: reads /data/trajectory.json and /data/signals.json, written every hour by the CIN's agents
   from public sources they read and that were checked against the source. All text from the data is inserted as text,
   never as HTML. */
(function () {
  'use strict';
  var panel = document.getElementById('live-traj');
  var page = document.getElementById('traj-page');
  if (!panel && !page) return;

  var DIR = { toward: ['Toward', 'tw'], away: ['Away', 'aw'], mixed: ['Mixed', 'mx'], neutral: ['Neutral', 'nu'] };
  var KIND = { paper: 'Research', news: 'News', report: 'Report', policy: 'Policy', incident: 'Incident', code: 'Code', dataset: 'Data' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : '#'; }
  function ago(iso) {
    var s = (Date.now() - Date.parse(iso)) / 1000;
    if (!(s >= 0)) return '';
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return Math.round(s / 86400) + ' d ago';
  }
  function word(v) {
    if (v >= 60) return 'toward the principles';
    if (v >= 52) return 'slightly toward';
    if (v > 48) return 'level';
    if (v > 40) return 'slightly away';
    return 'away from the principles';
  }

  function bars(t, host) {
    var list = el('div', 'lt-bars');
    Object.keys(t.categories).forEach(function (k) {
      var c = t.categories[k];
      var row = el('div', 'lt-bar' + (c.signals ? '' : ' empty'));
      var name = el('span', 'lt-name', c.name);
      var track = el('span', 'lt-track');
      var fill = el('span', 'lt-fill ' + (c.index >= 50 ? 'up' : 'down'));
      var off = Math.min(Math.abs(c.index - 50), 50);
      fill.style.width = off + '%';
      fill.style[c.index >= 50 ? 'left' : 'right'] = '50%';
      track.appendChild(fill);
      track.appendChild(el('span', 'lt-mid'));
      var val = el('span', 'lt-val', c.signals ? String(Math.round(c.index)) : '–');
      val.title = c.signals + ' source(s): ' + c.toward + ' toward, ' + c.away + ' away';
      row.appendChild(name); row.appendChild(track); row.appendChild(val);
      list.appendChild(row);
    });
    host.appendChild(list);
  }

  function signalItem(s) {
    var li = el('li', 'lt-sig');
    var d = DIR[s.direction] || DIR.neutral;
    var head = el('div', 'lt-sig-h');
    head.appendChild(el('span', 'lt-dir ' + d[1], d[0]));
    head.appendChild(el('span', 'lt-kind', KIND[s.kind] || s.kind));
    head.appendChild(el('time', null, s.published));
    li.appendChild(head);
    var a = el('a', 'lt-title', s.title);
    a.href = safeUrl(s.url); a.rel = 'noopener noreferrer';
    li.appendChild(a);
    li.appendChild(el('span', 'lt-src', s.source));
    li.appendChild(el('p', null, s.summary));
    if (s.implication) li.appendChild(el('p', 'lt-imp', 'What it means for us: ' + s.implication));
    return li;
  }

  function render(t, sigs) {
    var hosts = [panel, page].filter(Boolean);
    hosts.forEach(function (host) {
      host.textContent = '';
      var top = el('div', 'lt-top');
      var big = el('div', 'lt-overall');
      big.appendChild(el('span', 'lt-num', String(Math.round(t.overall))));
      var d = t.overall - t.overall_24h_ago;
      big.appendChild(el('span', 'lt-delta ' + (d >= 0 ? 'up' : 'down'), (d >= 0 ? '+' : '') + d.toFixed(1) + ' in 24 h'));
      top.appendChild(big);
      var txt = el('div', 'lt-read');
      txt.appendChild(el('b', null, 'This week, the evidence points ' + word(t.overall) + '.'));
      txt.appendChild(el('p', null, t.signals_7d + ' new sources this week, ' + t.signals_total + ' in all. Updated ' + ago(t.updated) + '.'));
      top.appendChild(txt);
      host.appendChild(top);
      bars(t, host);
      var n = host === page ? 200 : 5;
      var shown = sigs.slice(0, n);
      if (shown.length) {
        host.appendChild(el('h3', 'lt-h', host === page ? 'Every source, newest first' : 'Latest sources'));
        var ul = el('ul', 'lt-sigs');
        shown.forEach(function (s) { ul.appendChild(signalItem(s)); });
        host.appendChild(ul);
      } else {
        host.appendChild(el('p', 'lt-none', 'The first sources are being read and checked. This panel updates every hour.'));
      }
      host.appendChild(el('p', 'lt-method', t.method));
      if (host === panel) {
        var more = el('a', 'lt-more', 'Every source and how this is computed →');
        more.href = '/trajectory';
        host.appendChild(more);
      }
    });
  }

  Promise.all([
    fetch('/data/trajectory.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
    fetch('/data/signals.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
  ]).then(function (v) { render(v[0], v[1]); }).catch(function () {
    [panel, page].filter(Boolean).forEach(function (h) { h.textContent = 'The live trajectory could not be loaded right now.'; });
  });
})();
