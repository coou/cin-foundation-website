// Network home: headline numbers, the live trajectory and the latest ideas.
import { backend, mountAuth, el, getJSON, ago, bars } from './portal.js?v=3';
import { collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

mountAuth(() => {});

getJSON('/data/portal.json').then((p) => {
  const host = document.getElementById('stats');
  [[p.totals.runs_24h, 'agent runs in the last 24 hours'], [p.totals.delivered_24h, 'things finished in the last 24 hours'],
   [p.totals.signals_7d, 'sources read and checked this week'], [p.totals.deploys_7d, 'website updates this week']].forEach(([n, t]) => {
    const c = el('div', 'card stat'); c.append(el('b', null, String(n)), el('span', null, t)); host.appendChild(c);
  });
}).catch(() => {});

getJSON('/data/trajectory.json').then((t) => {
  const host = document.getElementById('traj'); host.textContent = '';
  const d = t.overall - t.overall_24h_ago;
  host.appendChild(el('p', null, 'Overall reading ' + Math.round(t.overall) + ' (50 is level), ' + (d >= 0 ? '+' : '') + d.toFixed(1) + ' in 24 hours. Updated ' + ago(t.updated) + '.'));
  bars(host, t.categories);
  const more = el('a', null, 'Every source on the public site →'); more.href = 'https://collectiveintelligencenetwork.org/trajectory';
  host.append(el('p', 'muted', t.method), more);
}).catch(() => { document.getElementById('traj').textContent = 'The live reading could not be loaded.'; });

backend().then(async (b) => {
  const host = document.getElementById('latest');
  if (!b) { host.textContent = 'Discussion is opening shortly.'; return; }
  const status = await getJSON('/data/idea-status.json').catch(() => ({}));
  try {
    const snap = await getDocs(query(collection(b.db, 'ideas'), orderBy('createdAt', 'desc'), limit(8)));
    host.textContent = '';
    const ul = el('ul', 'plain');
    snap.docs.filter((d) => (status[d.id] || {}).status !== 'hidden').slice(0, 5).forEach((d) => {
      const li = el('li'); const a = el('a', null, d.data().title); a.href = '/ideas'; li.appendChild(a); ul.appendChild(li);
    });
    host.appendChild(ul.children.length ? ul : el('p', 'muted', 'No ideas yet. Be the first.'));
  } catch (e) { host.textContent = 'Discussion is opening shortly.'; }
});
