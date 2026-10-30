// Network home: live trajectory, interactive workbench map, agent fleet pulse, featured scenarios, and latest ideas.
import { backend, mountAuth, el, svgEl, getJSON, ago, bars } from './portal.js?v=12';
import { collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

mountAuth(() => {});

// Wire interactive SVG workbench nodes
document.querySelectorAll('#net-arch-svg .svg-node[data-href]').forEach((node) => {
  const go = () => {
    const href = node.getAttribute('data-href');
    if (href) window.location.href = href;
  };
  node.addEventListener('click', go);
  node.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  });
});

// 1. Live Trajectory Reading
getJSON('/data/trajectory.json').then((t) => {
  const host = document.getElementById('traj');
  if (!host) return;
  host.textContent = '';

  const d = t.overall - t.overall_24h_ago;
  const deltaStr = (d >= 0 ? '+' : '') + d.toFixed(1);

  const kpiVal = document.getElementById('kpi-traj-val');
  const kpiSub = document.getElementById('kpi-traj-sub');
  if (kpiVal) kpiVal.textContent = Math.round(t.overall) + ' / 100';
  if (kpiSub) kpiSub.textContent = `${deltaStr} in 24h · ${t.toward || 0} toward vs ${t.away || 0} away`;

  const sigVal = document.getElementById('kpi-sig-val');
  const sigSub = document.getElementById('kpi-sig-sub');
  if (sigVal && t.signals_total) sigVal.textContent = t.signals_total.toLocaleString();
  if (sigSub && t.agreement) {
    sigSub.textContent = `${Math.round(t.agreement * 100)}% dual-agent agreement · ${(t.second_opinions || 0).toLocaleString()} audits`;
  }

  const headRow = el('div', 'card-head');
  const titleBlock = el('div');
  const scoreTitle = el('h3', 'flush', `Overall reading: ${Math.round(t.overall)} / 100 (${deltaStr} in 24h)`);
  const subMeta = el('p', 'muted flush', `50 is level · ${t.toward || 0} sources toward, ${t.away || 0} away · Updated ${ago(t.updated)}`);
  titleBlock.append(scoreTitle, subMeta);
  const badge = el('span', 'tag ok', `${Math.round((t.agreement || 0.86) * 100)}% Agreement`);
  headRow.append(titleBlock, badge);
  host.appendChild(headRow);

  bars(host, t.categories);

  const foot = el('div', 'twin-subblock');
  foot.appendChild(el('p', 'muted flush', t.method));
  const more = el('a', 'btn sm twin-btn-mt', 'Inspect every verified source & 6-stage forecast on the main site →');
  more.href = 'https://collectiveintelligencenetwork.org/trajectory';
  foot.appendChild(more);
  host.appendChild(foot);
}).catch(() => {
  const host = document.getElementById('traj');
  if (host) host.textContent = 'The live reading could not be loaded.';
});

// 2. Live Agent Fleet Pulse (/data/portal.json)
getJSON('/data/portal.json').then((p) => {
  const host = document.getElementById('fleet-pulse');
  if (!host) return;
  host.textContent = '';

  const totals = p.totals || {};
  const statRow = el('div', 'btn-row flush');
  statRow.append(
    el('span', 'tag ok', `${totals.runs_24h || 0} agent runs (24h)`),
    el('span', 'tag info', `${totals.delivered_24h || 0} works delivered (24h)`),
    el('span', 'tag wip', `${totals.signals_7d || 0} signals verified (7d)`),
    el('span', 'tag', `${totals.deploys_7d || 0} deploys (7d)`)
  );
  host.appendChild(statRow);

  const missions = Array.isArray(p.missions) ? p.missions.slice(0, 5) : [];
  if (missions.length) {
    const mHead = el('h3', 'twin-subhead twin-btn-mt', 'Active collective engineering missions');
    host.appendChild(mHead);
    const mList = el('div', 'bars');
    missions.forEach((m) => {
      const done = Number(m.done) || 0;
      const open = Number(m.open) || 0;
      const total = Math.max(1, done + open);
      const pct = Math.round((done / total) * 100);
      const wUnits = Math.max(6, Math.round((done / total) * 200));

      const row = el('div', 'bar');
      const svg = svgEl('svg', { viewBox: '0 0 200 10', class: 'svg-bar', 'aria-hidden': 'true' });
      svg.appendChild(svgEl('rect', { x: 0, y: 0, width: 200, height: 10, rx: 5, fill: '#1a1e28' }));
      svg.appendChild(svgEl('rect', { x: 0, y: 0, width: wUnits, height: 10, rx: 5, fill: '#6aa8e0' }));

      row.append(
        el('span', null, m.title),
        svg,
        el('b', 'muted', `${done}/${total}`)
      );
      mList.appendChild(row);
    });
    host.appendChild(mList);
  }

  const recent = Array.isArray(p.recent) ? p.recent.slice(0, 4) : [];
  if (recent.length) {
    const rBox = el('div', 'twin-subblock');
    rBox.appendChild(el('h3', 'twin-subhead flush', 'Recent verified agent deliveries'));
    const ul = el('ul', 'plain');
    recent.forEach((item) => {
      const li = el('li');
      li.append(
        el('span', 'tag ok', item.team || 'Agent stream'),
        el('b', null, item.title || 'Completed work'),
        el('span', 'muted', ago(item.at))
      );
      ul.appendChild(li);
    });
    rBox.appendChild(ul);
    host.appendChild(rBox);
  }
}).catch(() => {
  const host = document.getElementById('fleet-pulse');
  if (host) host.textContent = 'Agent mission telemetry could not be loaded.';
});

// 3. Featured Scenarios (/data/scenarios.json)
getJSON('/data/scenarios.json').then((d) => {
  const list = d && Array.isArray(d.scenarios) ? d.scenarios : [];
  const kpiScen = document.getElementById('kpi-scen-val');
  const lpBadge = document.getElementById('lp-scen-badge');
  if (kpiScen && list.length) kpiScen.textContent = String(list.length);
  if (lpBadge && list.length) lpBadge.textContent = `${list.length} Scenarios`;

  const host = document.getElementById('featured-futures');
  if (!host) return;
  host.textContent = '';

  if (!list.length) {
    host.appendChild(el('p', 'muted flush', 'No scenarios loaded yet.'));
    return;
  }

  const ul = el('ul', 'plain');
  list.slice(0, 3).forEach((sc) => {
    const li = el('li');
    const block = el('div', 'idea');
    const meta = el('div', 'meta');
    meta.append(
      el('span', 'tag info', `${sc.horizon_years || 2}y horizon`),
      el('span', 'muted', ago(sc.added_at))
    );
    const titleLink = el('a', null, sc.title);
    titleLink.href = '/futures';
    const h3 = el('h3', 'flush');
    h3.appendChild(titleLink);
    const premise = el('p', 'muted flush', (sc.premise || '').slice(0, 170) + ((sc.premise || '').length > 170 ? '…' : ''));
    block.append(meta, h3, premise);

    const firstOut = Array.isArray(sc.outcomes) && sc.outcomes[0] ? sc.outcomes[0] : null;
    if (firstOut) {
      const nowPct = Math.round(Math.max(0, Math.min(1, Number(firstOut.likelihood_now) || 0)) * 100);
      const cinPct = Math.round(Math.max(0, Math.min(1, Number(firstOut.likelihood_with_cin) || 0)) * 100);
      const outRow = el('div', 'meta');
      outRow.append(
        el('span', 'tag ' + (firstOut.desirable ? 'ok' : 'no'), firstOut.desirable ? 'Desirable outcome' : 'Risk outcome'),
        el('span', 'muted', `${firstOut.name}: ${nowPct}% today → ${cinPct}% with CIN`)
      );
      block.appendChild(outRow);
    }

    li.appendChild(block);
    ul.appendChild(li);
  });
  host.appendChild(ul);
}).catch(() => {});

// 4. Recognition count badge
getJSON('/data/recognition.json').then((d) => {
  const list = d && Array.isArray(d.recognition) ? d.recognition : [];
  const badge = document.getElementById('lp-rec-badge');
  if (badge && list.length) badge.textContent = `${list.length} Credited`;
}).catch(() => {});

// 5. Latest Community Ideas (with fallback to /data/updates.json when Firestore is offline/local)
function renderUpdatesFallback(host) {
  getJSON('/data/updates.json').then((u) => {
    const items = u && Array.isArray(u.updates) ? u.updates.slice(0, 4) : [];
    host.textContent = '';
    const intro = el('p', 'muted flush', 'Recent milestones shipped from community & agent proposals:');
    host.appendChild(intro);
    const ul = el('ul', 'plain');
    items.forEach((it) => {
      const li = el('li');
      const block = el('div', 'idea');
      const meta = el('div', 'meta');
      meta.append(
        el('span', 'tag ok', it.kind || 'shipped'),
        el('span', 'muted', (it.at || '').slice(0, 10))
      );
      const h3 = el('h3', 'flush', it.title);
      const sum = el('p', 'muted flush', (it.summary || '').slice(0, 165) + ((it.summary || '').length > 165 ? '…' : ''));
      block.append(meta, h3, sum);
      li.appendChild(block);
      ul.appendChild(li);
    });
    host.appendChild(ul);
  }).catch(() => {
    host.textContent = 'Visit /ideas to propose and vote on network priorities.';
  });
}

backend().then(async (b) => {
  const host = document.getElementById('latest');
  if (!host) return;
  if (!b) {
    renderUpdatesFallback(host);
    return;
  }
  const status = await getJSON('/data/idea-status.json').catch(() => ({}));
  try {
    const snap = await getDocs(query(collection(b.db, 'ideas'), orderBy('createdAt', 'desc'), limit(8)));
    const visible = snap.docs.filter((d) => (status[d.id] || {}).status !== 'hidden').slice(0, 5);
    if (!visible.length) {
      renderUpdatesFallback(host);
      return;
    }
    host.textContent = '';
    const ul = el('ul', 'plain');
    visible.forEach((d) => {
      const data = d.data();
      const li = el('li');
      const a = el('a', null, data.title);
      a.href = '/ideas';
      li.append(el('span', 'tag', data.category || 'idea'), a);
      ul.appendChild(li);
    });
    host.appendChild(ul);
  } catch (e) {
    renderUpdatesFallback(host);
  }
});
