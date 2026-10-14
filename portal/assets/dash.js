// Transparency dashboard: what the agents read, built, checked and published (data refreshed every hour).
import { mountAuth, el, getJSON, ago } from './portal.js?v=3';

function table(host, head, rows) {
  const t = el('table'); const tr = el('tr'); head.forEach((h) => tr.appendChild(el('th', null, h))); t.appendChild(tr);
  rows.forEach((r) => { const x = el('tr'); r.forEach((v) => x.appendChild(el('td', null, String(v)))); t.appendChild(x); });
  host.textContent = ''; host.appendChild(t);
}

function show(p) {
  const s = document.getElementById('dstats'); s.textContent = '';
  [[p.totals.runs_24h, 'agent runs, 24 h'], [p.totals.delivered_24h, 'finished, 24 h'], [p.totals.signals_7d, 'sources checked, 7 days'],
   [p.totals.deploys_7d, 'website updates, 7 days'], [p.totals.ideas_answered, 'public ideas answered']].forEach(([n, t]) => {
    const c = el('div', 'card stat'); c.append(el('b', null, String(n)), el('span', null, t)); s.appendChild(c);
  });
  table(document.getElementById('missions'), ['Mission', 'Open', 'Finished', 'Last finished'], p.missions.map((m) => [m.title, m.open, m.done, m.last_done || 'not yet']));
  table(document.getElementById('lanes'), ['Team', 'Runs', 'Finished', 'Sources checked'], p.teams.map((t) => [t.name, t.runs, t.delivered, t.signals]));
  const d = document.getElementById('done'); d.textContent = ''; const ul = el('ul', 'plain');
  p.recent.forEach((r) => { const li = el('li'); li.append(el('span', 'tag', r.team), document.createTextNode(' ' + r.title + ' '), el('span', 'muted', ago(r.at))); ul.appendChild(li); });
  d.appendChild(ul.children.length ? ul : el('p', 'muted', 'Nothing yet today.'));
  const dp = document.getElementById('deploys'); dp.textContent = ''; const ul2 = el('ul', 'plain');
  p.deploys.forEach((x) => ul2.appendChild(el('li', null, ago(x.at) + ' · version ' + x.commit.slice(0, 7))));
  dp.appendChild(ul2.children.length ? ul2 : el('p', 'muted', 'No updates yet.'));
  document.getElementById('gate').textContent = 'Updated ' + ago(p.updated) + '. Anything not shown here (drafts in progress, private documents) stays private.';
}

mountAuth(() => {});
document.getElementById('dash').hidden = false;
getJSON('/data/portal.json').then(show).catch(() => { document.getElementById('gate').textContent = 'The dashboard could not be loaded.'; });
