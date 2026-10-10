// Twin prototype: everything stays in this browser (localStorage). Nothing is sent anywhere.
import { mountAuth, el, getJSON } from './portal.js?v=2';
import { validateTwinState, deserializeTwinState, serializeTwinState, createConsentReceipt, isGrantExpired, evaluateAccessRequest, queueAccessAsPendingAction, calculatePersonalTrajectory, summarizeContributions, evaluateActionDecision, summarizeActions, recordTwinEvent, summarizeEvents, calculateObligationUrgency, summarizeObligations } from './twin-core.js';

mountAuth(() => {});
const KEY = 'cin-twin-v1';
const load = () => { try { const r = JSON.parse(localStorage.getItem(KEY)); const c = validateTwinState(r); return c.ok ? c.value : { topics: [], grants: [], contributions: [], actions: [], events: [], obligations: [] }; } catch (e) { return { topics: [], grants: [], contributions: [], actions: [], events: [], obligations: [] }; } };
const save = (s) => { const c = validateTwinState(s); if (!c.ok) return false; try { localStorage.setItem(KEY, JSON.stringify(c.value)); return true; } catch (e) { return false; } };
let state = load();

function saveAndRender(next, eventType = null, eventDetail = null) {
  let toSave = next;
  if (eventType && eventDetail) {
    const rec = recordTwinEvent(next, eventType, eventDetail);
    if (rec.ok) toSave = rec.state;
  }
  if (save(toSave)) {
    state = toSave;
    return true;
  }
  return false;
}

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
    const x = el('button', 'btn', 'Revoke'); x.onclick = () => {
      const next = { ...state, grants: state.grants.filter((_, idx) => idx !== i) };
      if (saveAndRender(next, 'grant_revoked', `Revoked grant for ${g.who}`)) {
        renderGrants();
        renderEvents();
      }
    };
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
  const detail = topics.length ? `Updated ${topics.length} topic(s)` : 'Cleared topics';
  if (saveAndRender(next, 'topics_updated', detail)) {
    document.getElementById('saved').textContent = 'Saved on this device only.';
    renderQuest();
    renderEvents();
  } else {
    document.getElementById('saved').textContent = 'Could not save topics.';
  }
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
  const grantDetail = ('Granted ' + who.slice(0, 40) + ' access to ' + what.slice(0, 50)).slice(0, 120);
  if (saveAndRender(next, 'grant_created', grantDetail)) {
    g.reset();
    renderGrants();
    renderEvents();
  }
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
      const next = { ...state, contributions: contribs.filter((_, idx) => idx !== i) };
      if (saveAndRender(next, 'contribution_removed', `Removed [${c.kind}] contribution`)) {
        renderContributions();
        renderEvents();
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
    if (saveAndRender(next, 'contribution_added', `Recorded [${kind}] ${what.slice(0, 40)}`)) {
      contribForm.reset();
      renderContributions();
      renderEvents();
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
    saveAndRender(state, 'data_exported', 'Exported local twin backup');
    renderEvents();
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
    if (saveAndRender(res.value, 'data_imported', 'Restored backup on this device')) {
      f.elements.topics.value = state.topics.join(', ');
      renderGrants(); renderQuest(); renderContributions(); renderObligations(); renderActions(); renderEvents();
      if (status) status.textContent = 'Backup restored successfully on this device.';
    }
    importInput.value = '';
  };
  reader.readAsText(file);
};

function renderActions() {
  const ul = document.getElementById('actions');
  const summaryBox = document.getElementById('action-summary');
  if (!ul) return;
  ul.textContent = '';
  const acts = state.actions || [];
  if (!acts.length) {
    ul.appendChild(el('li', 'muted', 'No pending requests. Local assistants and services cannot run actions without your review.'));
    if (summaryBox) summaryBox.textContent = '';
    return;
  }
  const summary = summarizeActions(acts);
  acts.forEach((a, i) => {
    const li = el('li');
    const badge = el('small', 'muted', ` [${a.status}] `);
    li.append(badge, el('b', null, a.who), document.createTextNode(' requested: ' + a.description));
    if (a.status === 'pending') {
      const decide = (decision) => {
        const dec = evaluateActionDecision(a, decision);
        if (dec.ok) {
          const next = { ...state, actions: acts.map((item, idx) => (idx === i ? dec.action : item)) };
          const evtType = decision === 'approved' ? 'action_approved' : 'action_denied';
          if (saveAndRender(next, evtType, `${decision === 'approved' ? 'Approved' : 'Denied'} action for ${a.who}`)) {
            renderActions();
            renderEvents();
          }
        }
      };
      const appBtn = el('button', 'btn', 'Approve');
      appBtn.style.margin = '0 0.3rem 0 0.5rem';
      appBtn.onclick = () => decide('approved');
      const rejBtn = el('button', 'btn', 'Deny');
      rejBtn.onclick = () => decide('rejected');
      li.append(appBtn, rejBtn);
    } else {
      const clearBtn = el('button', 'btn', 'Clear');
      clearBtn.style.marginLeft = '0.5rem';
      clearBtn.onclick = () => {
        const next = { ...state, actions: acts.filter((_, idx) => idx !== i) };
        if (saveAndRender(next, 'action_cleared', `Cleared action for ${a.who}`)) {
          renderActions();
          renderEvents();
        }
      };
      li.appendChild(clearBtn);
    }
    ul.appendChild(li);
  });
  if (summaryBox) {
    summaryBox.textContent = '';
    summaryBox.appendChild(el('p', 'muted', `Actions: ${summary.pending} pending, ${summary.approved} approved, ${summary.rejected} denied. Guarded locally.`));
  }
}

const actionForm = document.getElementById('action-request');
if (actionForm) {
  actionForm.onsubmit = (e) => {
    e.preventDefault();
    const status = document.getElementById('data-status');
    const currentActions = state.actions || [];
    if (currentActions.length >= 50) {
      if (status) status.textContent = 'Maximum of 50 actions reached. Clear an older entry first.';
      return;
    }
    const who = actionForm.elements.who ? actionForm.elements.who.value.trim().slice(0, 60) : '';
    const desc = actionForm.elements.description ? actionForm.elements.description.value.trim().slice(0, 100) : '';
    if (!who || !desc) return;
    const now = new Date();
    const newAction = { id: 'act-' + now.getTime().toString(36), who, description: desc, at: now.toISOString(), status: 'pending', decided_at: null };
    const next = { ...state, actions: currentActions.concat([newAction]) };
    if (saveAndRender(next, 'action_queued', `Queued action for ${who}`)) {
      actionForm.reset();
      renderActions();
      renderEvents();
    }
  };
}

function renderEvents() {
  const ul = document.getElementById('events');
  const summaryBox = document.getElementById('event-summary');
  if (!ul) return;
  ul.textContent = '';
  const evts = state.events || [];
  if (!evts.length) {
    ul.appendChild(el('li', 'muted', 'No activity recorded yet. Changes you make in your twin will appear here.'));
    if (summaryBox) summaryBox.textContent = '';
    return;
  }
  const summary = summarizeEvents(evts);
  const sorted = evts.slice().reverse();
  sorted.slice(0, 8).forEach((e) => {
    const li = el('li');
    const badge = el('small', 'muted', ` [${e.type}] `);
    const dateStr = e.at ? e.at.slice(11, 19) : '';
    const timeNote = dateStr ? el('small', 'muted', ` at ${dateStr} `) : document.createTextNode(' ');
    li.append(badge, el('b', null, e.detail), timeNote);
    ul.appendChild(li);
  });
  if (summaryBox) {
    summaryBox.textContent = '';
    summaryBox.appendChild(el('p', 'muted', `Total activity: ${summary.total} local event(s) recorded on this device.`));
  }
}

const clearEventsBtn = document.getElementById('clear-events');
if (clearEventsBtn) {
  clearEventsBtn.onclick = () => {
    const next = { ...state, events: [] };
    if (save(next)) {
      state = next;
      renderEvents();
    }
  };
}

const wipeBtn = document.getElementById('wipe');
if (wipeBtn) wipeBtn.onclick = () => {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing */ }
  state = { topics: [], grants: [], contributions: [], actions: [], events: [], obligations: [] };
  f.reset(); renderGrants(); renderContributions(); renderObligations(); renderActions(); renderEvents();
  const q = document.getElementById('quest'); q.textContent = ''; q.appendChild(el('li', 'muted', 'Add topics to see what matters today.'));
  const sumBox = document.getElementById('trajectory-summary'); if (sumBox) sumBox.textContent = '';
  const evalBox = document.getElementById('access-eval-result'); if (evalBox) evalBox.textContent = '';
  const status = document.getElementById('data-status'); if (status) status.textContent = 'All twin data deleted from this browser.';
};

function renderObligations() {
  const ul = document.getElementById('obligations');
  const summaryBox = document.getElementById('obligation-summary');
  if (!ul) return;
  ul.textContent = '';
  const obs = state.obligations || [];
  if (!obs.length) {
    ul.appendChild(el('li', 'muted', 'No obligations tracked yet. Add renewals, warranties, or deadlines.'));
    if (summaryBox) summaryBox.textContent = '';
    return;
  }
  const summary = summarizeObligations(obs);
  obs.forEach((o, i) => {
    const li = el('li');
    let urgencyBadge = '';
    if (o.status === 'active') {
      const u = calculateObligationUrgency(o);
      if (u.is_overdue) {
        urgencyBadge = ` [overdue ${Math.abs(u.days_remaining)}d] `;
      } else if (u.is_due) {
        urgencyBadge = ' [due today] ';
      } else if (u.is_urgent) {
        urgencyBadge = ` [urgent: ${u.days_remaining}d left] `;
      } else {
        urgencyBadge = ` [${u.days_remaining}d left] `;
      }
    } else {
      urgencyBadge = ` [${o.status}] `;
    }
    const catBadge = el('small', 'muted', `[${o.category}] `);
    const badge = el('small', 'muted', urgencyBadge);
    li.append(catBadge, el('b', null, o.title), badge, document.createTextNode(` (due ${o.due_date})`));
    if (o.notes) {
      li.append(document.createTextNode(' — ' + o.notes));
    }
    if (o.status === 'active') {
      const compBtn = el('button', 'btn', 'Complete');
      compBtn.style.margin = '0 0.3rem 0 0.5rem';
      compBtn.onclick = () => {
        const now = new Date();
        const updated = { ...o, status: 'completed', resolved_at: now.toISOString() };
        const next = { ...state, obligations: obs.map((item, idx) => (idx === i ? updated : item)) };
        if (saveAndRender(next, 'obligation_resolved', `Completed obligation: ${o.title}`)) {
          renderObligations();
          renderEvents();
        }
      };
      li.appendChild(compBtn);
    }
    const delBtn = el('button', 'btn', 'Remove');
    delBtn.style.marginLeft = '0.3rem';
    delBtn.onclick = () => {
      const next = { ...state, obligations: obs.filter((_, idx) => idx !== i) };
      if (saveAndRender(next, 'obligation_removed', `Removed obligation: ${o.title}`)) {
        renderObligations();
        renderEvents();
      }
    };
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
  if (summaryBox) {
    summaryBox.textContent = '';
    summaryBox.appendChild(el('p', 'muted', `Obligations: ${summary.active} active (${summary.urgent} urgent, ${summary.overdue} overdue), ${summary.completed} completed. Guarded locally.`));
  }
}

const obForm = document.getElementById('obligation');
if (obForm) {
  obForm.onsubmit = (e) => {
    e.preventDefault();
    const status = document.getElementById('data-status');
    const currentObs = state.obligations || [];
    if (currentObs.length >= 50) {
      if (status) status.textContent = 'Maximum of 50 obligations reached. Remove an older entry first.';
      return;
    }
    const title = obForm.elements.title ? obForm.elements.title.value.trim().slice(0, 80) : '';
    const category = obForm.elements.category ? obForm.elements.category.value.trim().toLowerCase() : 'other';
    const dueDate = obForm.elements.due_date ? obForm.elements.due_date.value.trim() : '';
    const leadDays = parseInt(obForm.elements.lead_days ? obForm.elements.lead_days.value : '30', 10);
    const notesRaw = obForm.elements.notes ? obForm.elements.notes.value.trim().slice(0, 100) : '';
    const notes = notesRaw || null;
    if (!title || !dueDate) return;
    const now = new Date();
    const id = 'obl-' + now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    const newOb = {
      id,
      title,
      category,
      due_date: dueDate,
      lead_days: Number.isInteger(leadDays) ? leadDays : 30,
      status: 'active',
      notes,
      at: now.toISOString(),
      resolved_at: null
    };
    const next = { ...state, obligations: currentObs.concat([newOb]) };
    if (saveAndRender(next, 'obligation_added', `Added [${category}] ${title.slice(0, 40)}`)) {
      obForm.reset();
      renderObligations();
      renderEvents();
    }
  };
}

function renderAccessInspector() {
  const form = document.getElementById('verify-access');
  const resultBox = document.getElementById('access-eval-result');
  if (!form || !resultBox) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    const service = form.elements.service ? form.elements.service.value.trim().slice(0, 60) : '';
    const scope = form.elements.scope ? form.elements.scope.value.trim().slice(0, 80) : '';
    resultBox.textContent = '';
    if (!service || !scope) {
      resultBox.appendChild(el('p', 'muted', 'Enter both a service and requested scope to test permission.'));
      return;
    }
    const evalRes = evaluateAccessRequest(state, service, scope);
    const p = el('p');
    if (evalRes.allowed) {
      p.className = 'status-ok';
      let grantDetail = '';
      if (evalRes.grant && evalRes.grant.expires_at) {
        grantDetail = ` (valid until ${evalRes.grant.expires_at.slice(0, 10)})`;
      } else if (evalRes.grant) {
        grantDetail = ' (indefinite)';
      }
      p.append(el('b', null, 'Allowed: '), document.createTextNode(`Permitted by active grant for "${evalRes.grant ? evalRes.grant.who : service}"${grantDetail}.`));
      resultBox.appendChild(p);
    } else {
      p.className = 'muted';
      p.append(el('b', null, 'Denied: '), document.createTextNode(evalRes.reason || 'Not permitted.'));
      resultBox.appendChild(p);
      const queueBtn = el('button', 'btn', 'Queue as pending action');
      queueBtn.style.marginTop = '0.4rem';
      queueBtn.onclick = () => {
        const queued = queueAccessAsPendingAction(state, service, scope);
        if (queued.ok) {
          if (saveAndRender(queued.state, 'action_queued', `Access request queued for ${service}`)) {
            renderActions();
            renderEvents();
            resultBox.textContent = '';
            resultBox.appendChild(el('p', 'muted', `Queued pending review: "${service}" requesting "${scope}".`));
          }
        } else {
          resultBox.appendChild(el('p', 'muted', 'Could not queue action: ' + queued.error));
        }
      };
      resultBox.appendChild(queueBtn);
    }
  };
}

renderGrants(); renderQuest(); renderContributions(); renderObligations(); renderActions(); renderEvents(); renderAccessInspector();
