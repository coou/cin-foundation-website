// Recognition: forecasts that came true, and work that serves the goals.
import { mountAuth, el, getJSON, ago } from './portal.js?v=3';

const KIND = {
  prediction: 'a forecast that came true', research: 'research', product: 'a product', disclosure: 'honest disclosure',
  governance: 'good governance', safety: 'safety work', 'open-source': 'open source', community: 'community',
};

function link(href, text) {
  const a = el('a', null, text); a.href = href; a.rel = 'noopener noreferrer'; a.target = '_blank'; return a;
}

function entry(r) {
  const c = el('article', 'card');
  const meta = el('p', 'muted flush'); meta.append(el('span', 'tag ok', KIND[r.kind] || r.kind), document.createTextNode(' ' + ago(r.added_at)));
  const h = el('h2', 'flush'); h.append(document.createTextNode(r.who + ': '), link(r.url, r.what));
  c.append(meta, h, el('p', null, r.why));
  if (r.prediction) {
    const p = el('p', 'example');
    p.append(el('b', null, 'Forecast made ' + r.prediction.made_on + ': '), document.createTextNode(r.prediction.claim + ' '),
      el('span', 'tag ok', r.prediction.result === 'correct' ? 'came true' : 'partly came true'));
    if (r.prediction.evidence) { p.appendChild(document.createTextNode(' ')); p.appendChild(link(r.prediction.evidence, 'evidence')); }
    c.appendChild(p);
  }
  return c;
}

mountAuth(() => {});

const loadTimeout = setTimeout(() => {
  const st = document.getElementById('rstate');
  if (st && st.textContent.trim().startsWith('Loading')) {
    st.textContent = 'Recognition is taking a while to load. Check your connection, or check back shortly.';
  }
}, 3500);

getJSON('/data/recognition.json').then((d) => {
  const host = document.getElementById('recognition'); const st = document.getElementById('rstate');
  const list = (d && d.recognition) || []; const cal = (d && d.calibration) || { resolved: 0, correct: 0, partial: 0 };
  st.textContent = (list.length ? list.length + ' recognised so far. ' : 'Nothing recognised yet; the agents are starting their record. ') +
    (cal.resolved ? cal.resolved + ' forecasts checked: ' + cal.correct + ' came true, ' + cal.partial + ' partly.' : 'No forecasts have fallen due yet.');
  list.forEach((r) => host.appendChild(entry(r)));
}).catch(() => { document.getElementById('rstate').textContent = 'Recognition could not be loaded.'; })
  .finally(() => clearTimeout(loadTimeout));
