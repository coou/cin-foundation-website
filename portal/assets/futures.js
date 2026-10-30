// Possible futures: scenarios the agents wrote from what they read, with outcomes and what the network can do.
import { mountAuth, el, svgEl, getJSON, ago } from './portal.js?v=14';
import {
  FUTURES_GOALS,
  clampLikelihood,
  formatLikelihoodPct,
  filterFutures,
  searchFutures,
  calculateGoalCounts,
} from './futures-logic.js';

const AIMS = {
  1: 'AI kept safe and in check',
  2: 'people deciding together',
  3: 'fair, visible value',
  4: 'agents trained safely first',
  5: 'seeing what comes next',
  6: 'your own agent, working for you',
};

const WORK = {
  site: 'the websites',
  simulation: 'a simulation',
  software: 'software',
  hardware: 'hardware',
  community: 'how communities organise',
  engagement: 'working with people',
  media: 'telling the story',
  research: 'research',
  policy: 'policy and standards',
  canon: 'our own principles',
  'new-agent': 'a new kind of agent',
};

let allScenarios = [];
let activeGoal = 'all';
let searchQuery = '';
let renderGeneration = 0;

function link(href, text) {
  const a = el('a', null, text);
  a.href = href;
  a.rel = 'noopener noreferrer';
  a.target = '_blank';
  return a;
}

function meter(label, v, cls) {
  const row = el('div', 'lk');
  const clamped = clampLikelihood(v);
  const pctStr = formatLikelihoodPct(v);
  const wUnits = Math.max(3, Math.round(clamped * 200));
  const fillCol = cls === 'now' ? '#e3b341' : '#4fb3a8';

  const svg = svgEl('svg', { viewBox: '0 0 200 10', class: 'svg-bar', 'aria-hidden': 'true' });
  svg.appendChild(svgEl('rect', { x: 0, y: 0, width: 200, height: 10, rx: 5, fill: '#1a1e28' }));
  svg.appendChild(svgEl('rect', { x: 0, y: 0, width: wUnits, height: 10, rx: 5, fill: fillCol }));

  row.append(el('span', 'lk-label', label), svg, el('b', null, pctStr));
  return row;
}

function outcomeCompact(o) {
  const card = el('div', 'scen-oc-card ' + (o.desirable ? 'want' : 'avoid'));
  const head = el('div', ' flush');
  head.append(
    el('span', 'tag ' + (o.desirable ? 'ok' : 'no'), o.desirable ? 'we want this' : 'we want to avoid this'),
    el('b', 'twin-subhead', o.name)
  );
  card.append(
    head,
    meter('Today', o.likelihood_now, 'now'),
    meter('With CIN', o.likelihood_with_cin, o.desirable ? 'up' : 'down')
  );
  return card;
}

function outcomeDetail(o) {
  const box = el('div', 'outcome ' + (o.desirable ? 'want' : 'avoid'));
  const head = el('p', 'flush');
  head.append(
    el('span', 'tag ' + (o.desirable ? 'ok' : 'no'), o.desirable ? 'we want this' : 'we want to avoid this'),
    document.createTextNode(' '),
    el('b', null, o.name)
  );
  box.append(head, el('p', null, o.description));
  const ex = el('p', 'example');
  ex.append(el('b', null, 'For example: '), document.createTextNode(o.example));
  box.appendChild(ex);
  return box;
}

function scenario(sc, idx) {
  const c = el('article', 'card scenario');
  const meta = el('p', 'muted flush');
  const goalsText = Array.isArray(sc.goals)
    ? sc.goals.map((g) => AIMS[g] || '').filter(Boolean).join(' · ')
    : '';
  meta.textContent =
    'About ' +
    sc.horizon_years +
    ' year' +
    (sc.horizon_years === 1 ? '' : 's') +
    ' ahead · ' +
    goalsText +
    ' · written ' +
    ago(sc.added_at);
  c.append(meta, el('h2', 'flush', sc.title));

  if (Array.isArray(sc.sources) && sc.sources.length) {
    const from = el('p', 'muted flush');
    from.appendChild(document.createTextNode('Primary signal: '));
    sc.sources.forEach((s, i) => {
      if (i) from.appendChild(document.createTextNode(' · '));
      from.appendChild(link(s.url, s.title));
    });
    c.appendChild(from);
  }

  c.append(el('p', 'flush', sc.premise));

  if (Array.isArray(sc.outcomes) && sc.outcomes.length) {
    const grid = el('div', 'scen-outcomes-compact');
    sc.outcomes.forEach((o) => grid.appendChild(outcomeCompact(o)));
    c.appendChild(grid);
  }

  const drawer = el('details', 'scen-drawer');
  if (idx === 0) drawer.open = true;
  const sum = el('summary', null, 'Inspect world vignette, concrete examples & CIN engineering intervention →');
  drawer.appendChild(sum);

  const w = el('blockquote', 'world', sc.world);
  drawer.appendChild(w);

  if (Array.isArray(sc.outcomes)) {
    sc.outcomes.forEach((o) => drawer.appendChild(outcomeDetail(o)));
  }

  drawer.appendChild(el('h3', null, 'What the network does about it'));
  drawer.appendChild(el('p', null, sc.how));

  if (Array.isArray(sc.pipelines)) {
    const work = el('p', 'muted flush');
    const pipelinesText = sc.pipelines.map((p) => WORK[p] || p).join(', ');
    work.textContent =
      'Work this opens: ' +
      pipelinesText +
      (sc.work ? ' · ' + sc.work + ' piece' + (sc.work === 1 ? '' : 's') + ' of work started' : '');
    drawer.appendChild(work);
  }

  c.appendChild(drawer);
  return c;
}

function renderList() {
  const currentGen = ++renderGeneration;
  const host = document.getElementById('futures');
  const countState = document.getElementById('fcount');
  if (!host) return;

  const filtered = filterFutures(allScenarios, activeGoal);
  const matched = searchFutures(filtered, searchQuery);

  if (currentGen !== renderGeneration) return;

  if (countState) {
    if (searchQuery.trim() || activeGoal !== 'all') {
      const activeLabel = FUTURES_GOALS[activeGoal] || activeGoal;
      const filterDesc = activeGoal === 'all' ? '' : ` under ${activeLabel}`;
      countState.textContent = `Showing ${matched.length} of ${allScenarios.length} scenarios${filterDesc}.`;
    } else {
      countState.textContent = '';
    }
  }

  if (matched.length === 0) {
    const emptyNotice = el('div', 'card');
    emptyNotice.append(el('p', 'muted flush', 'No scenarios match your search or filter.'));
    host.replaceChildren(emptyNotice);
    return;
  }

  const nodes = matched.map((sc, idx) => scenario(sc, idx));
  host.replaceChildren(...nodes);
}

function renderFilters(counts) {
  const container = document.getElementById('goal-filters');
  if (!container) return;

  const pills = [];
  for (const [key, label] of Object.entries(FUTURES_GOALS)) {
    const count = Object.hasOwn(counts, key) ? counts[key] : 0;
    if (count === 0 && key !== 'all') {
      continue;
    }
    const btn = el('button', 'filter-pill');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', key === activeGoal ? 'true' : 'false');
    btn.append(
      document.createTextNode(label + ' '),
      el('span', 'pill-count', String(count))
    );
    btn.addEventListener('click', () => {
      if (activeGoal === key) return;
      activeGoal = key;
      renderFilters(counts);
      renderList();
    });
    pills.push(btn);
  }

  container.replaceChildren(...pills);
}

mountAuth(() => {});

const searchInput = document.getElementById('futures-search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target && typeof e.target.value === 'string' ? e.target.value : '';
    renderList();
  });
}

const loadTimeout = setTimeout(() => {
  const st = document.getElementById('fstate');
  if (st && st.textContent.trim().startsWith('Loading')) {
    st.textContent = 'Scenarios are taking a while to load. Check your connection, or check back shortly.';
  }
}, 3500);

getJSON('/data/scenarios.json')
  .then((d) => {
    const st = document.getElementById('fstate');
    allScenarios = d && Array.isArray(d.scenarios) ? d.scenarios : [];
    const kpiTotal = document.getElementById('fut-kpi-total');
    if (kpiTotal && allScenarios.length) kpiTotal.textContent = String(allScenarios.length);

    if (!allScenarios.length) {
      if (st) st.textContent = 'No scenarios yet. The agents add new ones as they read.';
      return;
    }
    if (st) {
      st.textContent =
        allScenarios.length +
        ' scenario' +
        (allScenarios.length === 1 ? '' : 's') +
        ', newest first. Likelihoods are the agents\' honest estimates, not promises.';
    }
    const counts = calculateGoalCounts(allScenarios);
    renderFilters(counts);
    renderList();
  })
  .catch(() => {
    const st = document.getElementById('fstate');
    if (st) st.textContent = 'The scenarios could not be loaded.';
  })
  .finally(() => {
    clearTimeout(loadTimeout);
  });
