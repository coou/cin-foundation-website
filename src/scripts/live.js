// Homepage: the agents' live numbers and their latest scenarios, from this site's own /data/ (no outside requests).
(function () {
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function get(url) { return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); }); }
  function ago(iso) { var s = (Date.now() - Date.parse(iso)) / 1000; if (!(s >= 0)) return ''; if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' days ago'; }
  function pct(x) { return Math.round(100 * x) + '%'; }
  function link(href, text) { var a = el('a', null, text); a.href = href; a.rel = 'noopener noreferrer'; return a; }

  var stats = document.getElementById('ls-stats');
  if (stats) {
    get('/data/activity.json').then(function (d) {
      stats.textContent = '';
      var t = d.totals || {};
      [[t.runs_24h, 'agent runs today'], [t.delivered_24h, 'pieces of work finished today'], [t.signals_7d, 'sources checked this week'], [t.deploys_7d, 'website updates this week']].forEach(function (x) {
        if (x[0] == null) return;
        var c = el('div', 'ls-stat'); c.appendChild(el('b', null, String(x[0]))); c.appendChild(el('span', null, x[1])); stats.appendChild(c);
      });
      stats.appendChild(el('p', 'ls-upd', (d.teams ? d.teams + ' agent teams active · ' : '') + 'updated ' + ago(d.updated)));
    }).catch(function () { /* keep the plain fallback text */ });
  }

  var KIND = { research: 'Research', simulation: 'Simulation', software: 'Software', scenario: 'Scenario', note: 'New note', site: 'Website',
    recognition: 'Recognition', policy: 'Policy', community: 'Community', news: 'News' };
  function day(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }
  [['ls-updates', 5], ['upd-list', 60]].forEach(function (cfg) {
    var host = document.getElementById(cfg[0]);
    if (!host) return;
    get('/data/updates.json').then(function (d) {
      var list = (d && d.updates) || [];
      host.textContent = '';
      if (!list.length) { host.appendChild(el('li', 'muted', 'The first updates are being written.')); return; }
      list.slice(0, cfg[1]).forEach(function (u) {
        var li = el('li');
        var meta = el('span', 'upd-meta', (KIND[u.kind] || 'Update') + ' · ' + day(u.at) + (u.checked && cfg[1] > 5 ? ' · ' + u.checked : ''));
        var title = u.link ? link(u.link, u.title) : el('b', null, u.title);
        li.appendChild(meta); li.appendChild(title);
        if (cfg[1] > 5) li.appendChild(el('p', null, u.summary));
        host.appendChild(li);
      });
    }).catch(function () { /* keep the fallback text */ });
  });

  var grid = document.getElementById('fut-grid');
  if (grid) {
    get('/data/scenarios.json').then(function (d) {
      var list = (d && d.scenarios) || [];
      if (!list.length) { grid.textContent = ''; grid.appendChild(el('p', 'muted', 'The agents are reviewing their first scenarios before they are shown here.')); return; }
      grid.textContent = '';
      list.slice(0, 3).forEach(function (sc) {
        var c = el('article', 'fut-card');
        c.appendChild(el('span', 'fut-k', 'About ' + sc.horizon_years + ' year' + (sc.horizon_years === 1 ? '' : 's') + ' ahead'));
        c.appendChild(el('h3', null, sc.title));
        var w = sc.world || ''; c.appendChild(el('p', 'fut-world', w.length > 280 ? w.slice(0, 277).replace(/\s+\S*$/, '') + '\u2026' : w));
        var outs = (sc.outcomes || []).slice().sort(function (a, b) { return (a.desirable === b.desirable) ? 0 : a.desirable ? 1 : -1; }).slice(0, 3);
        var ul = el('ul', 'fut-outs');
        outs.forEach(function (o) {
          var li = el('li', o.desirable ? 'want' : 'avoid');
          li.appendChild(el('span', 'oc ' + (o.desirable ? 'want' : 'avoid'), o.desirable ? 'We want this' : 'We want to avoid this'));
          li.appendChild(el('b', null, o.name));
          var m = el('div', 'fut-odds');
          [['Today', o.likelihood_now, 'now'], ['With the network', o.likelihood_with_cin, 'with']].forEach(function (r) {
            m.appendChild(el('span', null, r[0]));
            var tr = el('i', 'fut-track'); var f = el('i', 'fut-' + r[2]); f.style.width = pct(r[1]); tr.appendChild(f); m.appendChild(tr);
            m.appendChild(el('b', null, pct(r[1])));
          });
          li.appendChild(m); ul.appendChild(li);
        });
        c.appendChild(ul);
        if (sc.sources && sc.sources.length) { var p = el('p', 'fut-src'); p.appendChild(document.createTextNode('Started from: ')); p.appendChild(link(sc.sources[0].url, sc.sources[0].title)); c.appendChild(p); }
        grid.appendChild(c);
      });
    }).catch(function () { /* keep the plain fallback text */ });
  }
})();
