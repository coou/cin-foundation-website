// Twin prototype: everything stays in this browser (localStorage). Nothing is sent anywhere.
import { mountAuth, el, getJSON } from './portal.js?v=2';
import { validateTwinState, deserializeTwinState, serializeTwinState, createConsentReceipt, isGrantExpired, calculatePersonalTrajectory, summarizeContributions } from './twin-core.js';

mountAuth(() => {});
const KEY = 'cin-twin-v1';
const load = () => { try { const r = JSON.parse(localStorage.getItem(KEY)); const c = validateTwinState(r); return c.ok ? c.value : { topics: [], grants: [], contributions: [] }; } catch (e) { return { topics: [], grants: [], contributions: [] }; } };
const save = (s) => { const c = validateTwinState(s); if (!c.ok) return false; try { localStorage.setItem(KEY, JSON.stringify(c.value)); return true; } catch (e) { return false; } };
let state = load();

function words(text) { return (text || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2); }

function renderGrants() {
  const ul = document.getElementById('grants'); ul.textContent = '';
  if (!state.grants.length) ul.appendChild(el('li', 'muted', 'Nobody yet. Your twin refuses everyone you have not listed.'));
  state.grants.forEach((g, i) => {
    const li = el('li');
    let validityNote = ' ';
    if (g.expires_at) {
      const expDate = g.expires_at.slice(0, 10);
      validityNote = isGrantExpired(g) ? ` (expired ${expDate}) ` : ` (expires ${expDate}) `;
    } else {
      validityNote = ' (indefinite) ';
    }
    li.append(el('b', null, g.who), document.createTextNode(' may see ' + g.what + validityNote));
    const rec = el('button', 'btn', 'Receipt');
    rec.style.marginRight = '0.4rem';
    rec.onclick = () => {
      const status = document.getElementById('data-status');
      try {
        const receipt = createConsentReceipt(g);
        const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeWho = g.who.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
        a.href = url;
        a.download = `cin-consent-receipt-${safeWho}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (status) status.textContent = 'Downloaded consent receipt for ' + g.who + '.';
      } catch (err) {
        if (status) status.textContent = 'Could not generate consent receipt.';
      }
    };
    li.appendChild(rec);
    const x = el('button', 'btn', 'Revoke'); x.onclick = () => { const next = state.grants.filter((_, idx) => idx !== i); if (save({ ...state, grants: next })) { state.grants = next; renderGrants(); } };
    li.appendChild(x); ul.appendChild(li);
  });
}

function renderQuest() {
  const ul = document.getElementById('quest');
  const summaryBox = document.getElementById('trajectory-summary');
  if (!state.topics.length) {
    if (ul) {
      ul.textContent = '';
      ul.appendChild(el('li', 'muted', 'Add topics to see what matters today.'));
    }
    if (summaryBox) summaryBox.textContent = '';
    return;
  }
  getJSON('/data/signals.json').then((sigs) => {
    const trajectory = calculatePersonalTrajectory(state.topics, sigs);
    ul.textContent = '';
    if (!trajectory.matching_signals.length) {
      ul.appendChild(el('li', 'muted', 'Nothing today touches your topics.'));
      if (summaryBox) summaryBox.textContent = '';
      return;
    }
    trajectory.matching_signals.slice(0, 3).forEach((s) => {
      const li = el('li');
      const a = el('a', null, s.title);
      a.href = /^https?:/.test(s.url) ? s.url : '#';
      a.rel = 'noopener noreferrer';
      const badge = el('small', 'muted', ` (${s.direction}, weight ${s.weight})`);
      li.append(a, badge, el('div', 'muted', s.summary || ''));
      ul.appendChild(li);
    });
    if (summaryBox) {
      summaryBox.textContent = '';
      const p = el('p', 'muted', `Personal alignment balance: ${trajectory.score.toFixed(1)} / 100 (${trajectory.toward_count} toward, ${trajectory.away_count} away across ${trajectory.total_matching} matching source(s)). Computed locally.`);
      summaryBox.appendChild(p);
    }
  }).catch(() => {
    ul.textContent = '';
    ul.appendChild(el('li', 'muted', 'Today’s sources could not be loaded.'));
    if (summaryBox) summaryBox.textContent = '';
  });
}

const f = document.getElementById('interests');
f.elements.topics.value = state.topics.join(', ');
f.onsubmit = (e) => {
  e.preventDefault();
  const topics = f.elements.topics.value.split(',').map((t) => t.trim().slice(0, 60)).filter(Boolean).slice(0, 20);
  const next = { ...state, topics };
  if (save(next)) { state = next; document.getElementById('saved').textContent = 'Saved on this device only.'; renderQuest(); }
  else { document.getElementById('saved').textContent = 'Could not save topics.'; }
};

const g = document.getElementById('grant');
g.onsubmit = (e) => {
  e.preventDefault();
  const status = document.getElementById('data-status');
  if (state.grants.length >= 50) { if (status) status.textContent = 'Maximum of 50 grants reached. Revoke an existing grant first.'; return; }
  const who = g.elements.who.value.trim().slice(0, 60), what = g.elements.what.value.trim().slice(0, 80);
  if (!who || !what) return;
  const duration = parseInt(g.elements.duration ? g.elements.duration.value : '30', 10);
  const now = new Date();
  const expires_at = duration > 0 ? new Date(now.getTime() + duration * 86400000).toISOString() : null;
  const next = { ...state, grants: state.grants.concat([{ who, what, at: now.toISOString(), expires_at }]) };
  if (save(next)) { state = next; g.reset(); renderGrants(); }
};

function renderContributions() {
  const ul = document.getElementById('contributions');
  const summaryBox = document.getElementById('contribution-summary');
  if (!ul) return;
  ul.textContent = '';
  const contribs = state.contributions || [];
  if (!contribs.length) {
    ul.appendChild(el('li', 'muted', 'No contributions recorded yet. Record code, reviews, knowledge, or compute you gave.'));
    if (summaryBox) summaryBox.textContent = '';
    return;
  }
  const summary = summarizeContributions(contribs);
  contribs.forEach((c, i) => {
    const li = el('li');
    const badge = el('small', 'muted', ` [${c.kind}] `);
    li.append(badge, el('b', null, c.what));
    if (c.impact) {
      li.append(document.createTextNode(' — ' + c.impact));
    }
    const delBtn = el('button', 'btn', 'Remove');
    delBtn.style.marginLeft = '0.5rem';
    delBtn.onclick = () => {
      const next = contribs.filter((_, idx) => idx !== i);
      if (save({ ...state, contributions: next })) {
        state.contributions = next;
        renderContributions();
      }
    };
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
  if (summaryBox) {
    summaryBox.textContent = '';
    const breakdown = Object.entries(summary.by_kind).map(([k, count]) => `${count} ${k}`).join(', ');
    const note = el('p', 'muted', `Total contributions: ${summary.total} (${breakdown || 'none'}). Stored locally.`);
    summaryBox.appendChild(note);
  }
}

const contribForm = document.getElementById('contribution');
if (contribForm) {
  contribForm.onsubmit = (e) => {
    e.preventDefault();
    const status = document.getElementById('data-status');
    const currentContribs = state.contributions || [];
    if (currentContribs.length >= 50) {
      if (status) status.textContent = 'Maximum of 50 contributions reached. Remove an older entry first.';
      return;
    }
    const what = contribForm.elements.what ? contribForm.elements.what.value.trim().slice(0, 100) : '';
    const kind = contribForm.elements.kind ? contribForm.elements.kind.value.trim().toLowerCase() : 'other';
    const impactRaw = contribForm.elements.impact ? contribForm.elements.impact.value.trim().slice(0, 100) : '';
    const impact = impactRaw || null;
    if (!what) return;
    const now = new Date();
    const next = {
      ...state,
      contributions: currentContribs.concat([{
        what,
        kind,
        at: now.toISOString(),
        impact
      }])
    };
    if (save(next)) {
      state = next;
      contribForm.reset();
      renderContributions();
    }
  };
}

const exportBtn = document.getElementById('export');
if (exportBtn) exportBtn.onclick = () => {
  const status = document.getElementById('data-status');
  try {
    const blob = new Blob([serializeTwinState(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'cin-twin-backup.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    if (status) status.textContent = 'Backup downloaded as cin-twin-backup.json.';
  } catch (err) { if (status) status.textContent = 'Could not create backup file.'; }
};

const importInput = document.getElementById('import-file');
if (importInput) importInput.onchange = (e) => {
  const status = document.getElementById('data-status');
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.size > 200000) { if (status) status.textContent = 'File is too large (maximum 200 KB).'; importInput.value = ''; return; }
  const reader = new FileReader();
  reader.onload = (evt) => {
    const res = deserializeTwinState(evt.target && evt.target.result);
    if (!res.ok) { if (status) status.textContent = 'Could not restore backup: ' + res.error; importInput.value = ''; return; }
    if (save(res.value)) {
      state = res.value; f.elements.topics.value = state.topics.join(', '); renderGrants(); renderQuest(); renderContributions();
      if (status) status.textContent = 'Backup restored successfully on this device.';
    }
    importInput.value = '';
  };
  reader.readAsText(file);
};

const wipeBtn = document.getElementById('wipe');
if (wipeBtn) wipeBtn.onclick = () => {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing */ }
  state = { topics: [], grants: [], contributions: [] }; f.reset(); renderGrants(); renderContributions();
  const q = document.getElementById('quest'); q.textContent = ''; q.appendChild(el('li', 'muted', 'Add topics to see what matters today.'));
  const sumBox = document.getElementById('trajectory-summary'); if (sumBox) sumBox.textContent = '';
  const status = document.getElementById('data-status'); if (status) status.textContent = 'All twin data deleted from this browser.';
};

renderGrants(); renderQuest(); renderContributions();
