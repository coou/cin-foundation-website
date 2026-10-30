// Recognition: forecasts that came true, and work that serves the goals.
import { mountAuth, el, getJSON, ago } from './portal.js?v=14';
import {
  RECOGNITION_KINDS,
  filterRecognition,
  searchRecognition,
  calculateKindCounts,
} from './recognition-logic.js?v=1';

let allItems = [];
let activeKind = 'all';
let searchQuery = '';
let renderGeneration = 0;

function link(href, text) {
  const a = el('a', null, text);
  a.href = href;
  a.rel = 'noopener noreferrer';
  a.target = '_blank';
  return a;
}

function entry(r) {
  const c = el('article', 'card');
  const kindLabel = Object.hasOwn(RECOGNITION_KINDS, r.kind) ? RECOGNITION_KINDS[r.kind] : (r.kind || 'recognition');
  const meta = el('div', 'btn-row flush');
  meta.append(
    el('span', 'tag ok', kindLabel),
    el('span', 'tag info', 'Verified Primary Source'),
    el('span', 'muted', ago(r.added_at))
  );
  const h = el('h2', 'flush');
  h.append(document.createTextNode((r.who || 'Contributor') + ': '), link(r.url, r.what || r.title || 'Contribution'));
  c.append(meta, h);

  const whyText = (r.why || '').trim();
  const dotIdx = whyText.indexOf('. ');
  if (dotIdx !== -1 && dotIdx < 210 && whyText.length > dotIdx + 20) {
    const firstSent = whyText.slice(0, dotIdx + 1);
    const restSent = whyText.slice(dotIdx + 2).trim();
    c.appendChild(el('p', 'flush', firstSent));
    const dr = el('details', 'scen-drawer');
    dr.append(
      el('summary', null, 'Inspect architectural integration & provenance note →'),
      el('p', 'muted flush', restSent)
    );
    c.appendChild(dr);
  } else {
    c.appendChild(el('p', 'flush', whyText));
  }

  if (r.prediction) {
    const p = el('p', 'example');
    p.append(
      el('b', null, 'Forecast made ' + (r.prediction.made_on || 'recently') + ': '),
      document.createTextNode((r.prediction.claim || '') + ' '),
      el('span', 'tag ok', r.prediction.result === 'correct' ? 'came true' : 'partly came true')
    );
    if (r.prediction.evidence) {
      p.appendChild(document.createTextNode(' '));
      p.appendChild(link(r.prediction.evidence, 'evidence'));
    }
    c.appendChild(p);
  }
  return c;
}

function renderList() {
  const currentGen = ++renderGeneration;
  const host = document.getElementById('recognition');
  const countState = document.getElementById('rcount');
  if (!host) return;

  const filtered = filterRecognition(allItems, activeKind);
  const matched = searchRecognition(filtered, searchQuery);

  if (currentGen !== renderGeneration) return;

  if (countState) {
    if (searchQuery.trim() || activeKind !== 'all') {
      const activeLabel = RECOGNITION_KINDS[activeKind] || activeKind;
      const filterDesc = activeKind === 'all' ? '' : ` in ${activeLabel}`;
      countState.textContent = `Showing ${matched.length} of ${allItems.length} contributions${filterDesc}.`;
    } else {
      countState.textContent = '';
    }
  }

  if (matched.length === 0) {
    const emptyNotice = el('div', 'card');
    emptyNotice.append(el('p', 'muted flush', 'No recognition entries match your search or filter.'));
    host.replaceChildren(emptyNotice);
    return;
  }

  const nodes = matched.map((r) => entry(r));
  host.replaceChildren(...nodes);
}

function renderFilters(counts) {
  const container = document.getElementById('kind-filters');
  if (!container) return;

  const pills = [];
  for (const [key, label] of Object.entries(RECOGNITION_KINDS)) {
    const count = Object.hasOwn(counts, key) ? counts[key] : 0;
    if (count === 0 && key !== 'all') {
      continue;
    }
    const btn = el('button', 'filter-pill');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', key === activeKind ? 'true' : 'false');
    btn.append(
      document.createTextNode(label + ' '),
      el('span', 'pill-count', String(count))
    );
    btn.addEventListener('click', () => {
      if (activeKind === key) return;
      activeKind = key;
      renderFilters(counts);
      renderList();
    });
    pills.push(btn);
  }

  container.replaceChildren(...pills);
}

mountAuth(() => {});

const searchInput = document.getElementById('recognition-search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = (e.target && typeof e.target.value === 'string') ? e.target.value : '';
    renderList();
  });
}

const loadTimeout = setTimeout(() => {
  const st = document.getElementById('rstate');
  if (st && st.textContent.trim().startsWith('Loading')) {
    st.textContent = 'Recognition is taking a while to load. Check your connection, or check back shortly.';
  }
}, 3500);

getJSON('/data/recognition.json').then((d) => {
  const st = document.getElementById('rstate');
  allItems = (d && Array.isArray(d.recognition)) ? d.recognition : [];
  const cal = (d && d.calibration) || { resolved: 0, correct: 0, partial: 0 };
  const kpiTotal = document.getElementById('rec-kpi-total');
  const kpiCal = document.getElementById('rec-kpi-cal');
  if (kpiTotal && allItems.length) kpiTotal.textContent = String(allItems.length);
  if (kpiCal && cal.resolved) kpiCal.textContent = `${cal.correct}/${cal.resolved} true`;

  if (st) {
    st.textContent = (allItems.length ? allItems.length + ' recognised so far. ' : 'Nothing recognised yet; the agents are starting their record. ') +
      (cal.resolved ? cal.resolved + ' forecasts checked: ' + cal.correct + ' came true, ' + cal.partial + ' partly.' : 'Forecasts are checked as their target dates fall due.');
  }
  const counts = calculateKindCounts(allItems);
  renderFilters(counts);
  renderList();
}).catch(() => {
  const st = document.getElementById('rstate');
  if (st) {
    st.textContent = 'Recognition could not be loaded.';
  }
}).finally(() => {
  clearTimeout(loadTimeout);
});
