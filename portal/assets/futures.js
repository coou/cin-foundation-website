// Possible futures: scenarios the agents wrote from what they read, with outcomes and what the network can do.
import { mountAuth, el, getJSON, ago } from './portal.js?v=3';

const AIMS = {
  1: 'AI kept safe and in check', 2: 'people deciding together', 3: 'fair, visible value', 4: 'agents trained safely first',
  5: 'seeing what comes next', 6: 'your own agent, working for you',
};
const WORK = {
  site: 'the websites', simulation: 'a simulation', software: 'software', hardware: 'hardware', community: 'how communities organise',
  engagement: 'working with people', media: 'telling the story', research: 'research', policy: 'policy and standards',
  canon: 'our own principles', 'new-agent': 'a new kind of agent',
};
const pct = (x) => Math.round(100 * x) + '%';

function link(href, text) {
  const a = el('a', null, text); a.href = href; a.rel = 'noopener noreferrer'; a.target = '_blank'; return a;
}

function meter(label, v, cls) {
  const row = el('div', 'lk');
  const track = el('span', 'lk-track'); const fill = el('span', 'lk-fill ' + cls); fill.style.width = pct(v); track.appendChild(fill);
  row.append(el('span', 'lk-label', label), track, el('b', null, pct(v)));
  return row;
}

function outcome(o) {
  const box = el('div', 'outcome ' + (o.desirable ? 'want' : 'avoid'));
  const head = el('p', 'flush');
  head.append(el('span', 'tag ' + (o.desirable ? 'ok' : 'no'), o.desirable ? 'we want this' : 'we want to avoid this'), document.createTextNode(' '), el('b', null, o.name));
  box.append(head, el('p', null, o.description));
  const ex = el('p', 'example'); ex.append(el('b', null, 'For example: '), document.createTextNode(o.example)); box.appendChild(ex);
  box.append(meter('Today', o.likelihood_now, 'now'), meter('With the network', o.likelihood_with_cin, o.desirable ? 'up' : 'down'));
  return box;
}

function scenario(sc) {
  const c = el('article', 'card scenario');
  const meta = el('p', 'muted flush');
  meta.textContent = 'About ' + sc.horizon_years + ' year' + (sc.horizon_years === 1 ? '' : 's') + ' ahead · ' + sc.goals.map((g) => AIMS[g] || '').filter(Boolean).join(' · ') + ' · written ' + ago(sc.added_at);
  c.append(meta, el('h2', 'flush', sc.title));
  const from = el('p', 'muted'); from.appendChild(document.createTextNode('Started from: '));
  sc.sources.forEach((s, i) => { if (i) from.appendChild(document.createTextNode(' · ')); from.appendChild(link(s.url, s.title)); });
  c.appendChild(from);
  c.append(el('p', null, sc.premise));
  const w = el('blockquote', 'world', sc.world); c.appendChild(w);
  c.appendChild(el('h3', null, 'What could happen'));
  sc.outcomes.forEach((o) => c.appendChild(outcome(o)));
  c.appendChild(el('h3', null, 'What the network does about it'));
  c.appendChild(el('p', null, sc.how));
  const work = el('p', 'muted'); work.textContent = 'Work this opens: ' + sc.pipelines.map((p) => WORK[p] || p).join(', ') + (sc.work ? ' · ' + sc.work + ' piece' + (sc.work === 1 ? '' : 's') + ' of work started' : '');
  c.appendChild(work);
  return c;
}

mountAuth(() => {});
getJSON('/data/scenarios.json').then((d) => {
  const host = document.getElementById('futures'); const st = document.getElementById('fstate');
  const list = (d && d.scenarios) || [];
  if (!list.length) { st.textContent = 'No scenarios yet. The agents add new ones as they read.'; return; }
  st.textContent = list.length + ' scenario' + (list.length === 1 ? '' : 's') + ', newest first. Likelihoods are the agents\' honest estimates, not promises.';
  list.forEach((sc) => host.appendChild(scenario(sc)));
}).catch(() => { document.getElementById('fstate').textContent = 'The scenarios could not be loaded.'; });
