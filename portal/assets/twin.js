// Twin prototype: everything stays in this browser (localStorage). Nothing is sent anywhere.
import { mountAuth, el, getJSON } from './portal.js?v=3';
import { validateTwinState, deserializeTwinState, serializeTwinState, createConsentReceipt, verifyConsentReceipt, summarizeReceiptVerification, isGrantExpired, evaluateAccessRequest, queueAccessAsPendingAction, calculatePersonalTrajectory, summarizeContributions, evaluateActionDecision, summarizeActions, recordTwinEvent, summarizeEvents, calculateObligationUrgency, summarizeObligations, summarizeFacts, filterCriticalFacts, ALLOWED_FACT_CATEGORIES, toggleQuestCompletion, summarizeQuests, filterActiveQuests, ALLOWED_QUEST_CATEGORIES, ALLOWED_VALUE_DIMENSIONS, DEFAULT_VALUES, updateValuePreference, calculateValueAlignment, summarizeValues, auditMemoryStatement, gateMemoryFact, summarizeMemoryAudit, auditBoundaryAction, summarizeBoundaryAudits, CONSEQUENTIAL_RISK_KEYWORDS, assembleTokenBudgetedContext, evaluateCapabilityAdjustmentRequest, summarizeCapabilityAdjustment } from './twin-core.js';

mountAuth(() => {});
const KEY = 'cin-twin-v1';
const load = () => { try { const r = JSON.parse(localStorage.getItem(KEY)); const c = validateTwinState(r); return c.ok ? c.value : { topics: [], grants: [], contributions: [], actions: [], events: [], obligations: [], facts: [], quests: [], values: DEFAULT_VALUES }; } catch (e) { return { topics: [], grants: [], contributions: [], actions: [], events: [], obligations: [], facts: [], quests: [], values: DEFAULT_VALUES }; } };
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
    const rec = el('button', 'btn twin-btn-gap-right', 'Receipt');
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
    const delBtn = el('button', 'btn twin-btn-gap-left', 'Remove');
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
      renderGrants(); renderQuest(); renderContributions(); renderObligations(); renderActions(); renderEvents(); renderFacts(); renderQuests(); renderValues();
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
      const appBtn = el('button', 'btn twin-btn-approve', 'Approve');
      appBtn.onclick = () => decide('approved');
      const rejBtn = el('button', 'btn', 'Deny');
      rejBtn.onclick = () => decide('rejected');
      li.append(appBtn, rejBtn);
    } else {
      const clearBtn = el('button', 'btn twin-btn-gap-left', 'Clear');
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

const auditActionForm = document.getElementById('audit-action');
if (auditActionForm) {
  auditActionForm.onsubmit = (e) => {
    e.preventDefault();
    const resultBox = document.getElementById('boundary-audit-result');
    if (!resultBox) return;
    resultBox.textContent = '';

    const who = auditActionForm.elements.who ? auditActionForm.elements.who.value.trim().slice(0, 60) : '';
    const action = auditActionForm.elements.action ? auditActionForm.elements.action.value.trim().slice(0, 100) : '';
    const scope = auditActionForm.elements.scope ? auditActionForm.elements.scope.value.trim().slice(0, 80) : '';

    if (!who || !action) return;

    const audit = auditBoundaryAction(state, { who, action, scope: scope || undefined });
    const verdictP = el('p', null);
    const badgeText = audit.verdict === 'pass'
      ? 'Pass: Authorized'
      : audit.verdict === 'require_confirmation'
        ? 'Require Confirmation: Elevated Risk'
        : 'Block: Boundary Violation';

    const badgeClass = audit.verdict === 'pass' ? 'status-pass' : audit.verdict === 'require_confirmation' ? 'status-warn' : 'status-err';
    const badge = el('strong', badgeClass, `[${badgeText}] `);
    verdictP.appendChild(badge);
    verdictP.appendChild(document.createTextNode(`Risk level: ${audit.risk_level}`));
    resultBox.appendChild(verdictP);

    if (audit.reasons.length > 0) {
      const ul = el('ul', 'plain');
      audit.reasons.forEach((r) => {
        const li = el('li', 'muted', '• ' + r);
        ul.appendChild(li);
      });
      resultBox.appendChild(ul);
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
  if (!window.confirm('Delete everything this twin stores in this browser? This cannot be undone. Download a backup first if you want one.')) return;
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing */ }
  state = { topics: [], grants: [], contributions: [], actions: [], events: [], obligations: [], facts: [], quests: [], values: DEFAULT_VALUES };
  f.reset(); renderGrants(); renderContributions(); renderObligations(); renderActions(); renderEvents(); renderFacts(); renderQuests(); renderValues();
  const q = document.getElementById('quest'); q.textContent = ''; q.appendChild(el('li', 'muted', 'Add topics to see what matters today.'));
  const sumBox = document.getElementById('trajectory-summary'); if (sumBox) sumBox.textContent = '';
  const evalBox = document.getElementById('access-eval-result'); if (evalBox) evalBox.textContent = '';
  const auditBox = document.getElementById('boundary-audit-result'); if (auditBox) auditBox.textContent = '';
  const ctxBox = document.getElementById('context-assembly-result'); if (ctxBox) ctxBox.textContent = '';
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
      const compBtn = el('button', 'btn twin-btn-approve', 'Complete');
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
    const delBtn = el('button', 'btn twin-btn-gap-left', 'Remove');
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
      const queueBtn = el('button', 'btn twin-btn-mt', 'Queue as pending action');
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

function renderReceiptInspector() {
  const form = document.getElementById('verify-receipt');
  const resultBox = document.getElementById('receipt-verify-result');
  if (!form || !resultBox) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    resultBox.textContent = '';
    const rawJson = form.elements.receipt_json ? form.elements.receipt_json.value.trim() : '';
    if (!rawJson) {
      resultBox.appendChild(el('p', 'muted', 'Paste a consent receipt JSON to verify.'));
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (err) {
      const errP = el('p', 'muted');
      const errBadge = el('strong', 'status-err', '[Invalid JSON] ');
      errP.appendChild(errBadge);
      errP.appendChild(document.createTextNode('Could not parse receipt: invalid JSON format.'));
      resultBox.appendChild(errP);
      return;
    }

    const res = verifyConsentReceipt(state, parsed);
    const summary = summarizeReceiptVerification(res);

    const p = el('p');
    if (summary.valid) {
      p.className = 'status-ok';
      const badge = el('strong', 'status-pass', 'Matches an active grant on this device. ');
      p.appendChild(badge);
      p.appendChild(document.createTextNode(`"${summary.recipient}" has a grant here, issued at the receipt's time, covering ${summary.scopes_count} scope(s).`));
      resultBox.appendChild(p);
    } else {
      p.className = 'muted';
      const badge = el('strong', 'status-err', 'No match. ');
      p.appendChild(badge);
      p.appendChild(document.createTextNode(summary.reason || 'Receipt is not valid or grant was revoked.'));
      resultBox.appendChild(p);
    }
  };
}


function renderFacts() {
  const ul = document.getElementById('facts');
  const summaryBox = document.getElementById('fact-summary');
  if (!ul) return;
  ul.textContent = '';
  const facts = state.facts || [];
  const summary = summarizeFacts(facts);
  const auditSummary = summarizeMemoryAudit(facts);
  if (!facts.length) {
    ul.appendChild(el('li', 'muted', 'No critical memories or constraints recorded yet. Your twin retains these on this device.'));
  }
  facts.forEach((f, i) => {
    const li = el('li');
    const catBadge = el('small', 'muted', `[${f.category}] `);
    let auditBadge = null;
    try {
      const audit = auditMemoryStatement(f.statement);
      if (audit.is_speculation) {
        auditBadge = el('small', 'muted', ` [speculation: ${audit.markers.join(', ')}] `);
      }
    } catch (e) {
      /* ignore */
    }
    const criticalBadge = f.critical ? el('small', 'muted', ' [critical constraint] ') : document.createTextNode(' ');
    li.append(catBadge, el('b', null, f.statement), auditBadge || document.createTextNode(' '), criticalBadge);
    const delBtn = el('button', 'btn twin-btn-gap-left', 'Remove');
    delBtn.onclick = () => {
      const next = { ...state, facts: facts.filter((_, idx) => idx !== i) };
      if (saveAndRender(next, 'fact_removed', `Removed fact: ${f.statement.slice(0, 40)}`)) {
        renderFacts();
        renderEvents();
      }
    };
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
  if (summaryBox) {
    summaryBox.textContent = '';
    if (facts.length) {
      summaryBox.appendChild(el('p', 'muted', `Memory store: ${summary.total} total (${summary.critical_count} safety-critical, ${auditSummary.confirmed} confirmed facts). ${auditSummary.speculation} marked as possibly unconfirmed (wording check only).`));
    }
  }
}

const factForm = document.getElementById('fact');
if (factForm) {
  factForm.onsubmit = (e) => {
    e.preventDefault();
    const status = document.getElementById('data-status');
    const currentFacts = state.facts || [];
    if (currentFacts.length >= 50) {
      if (status) status.textContent = 'Maximum of 50 facts reached. Remove an older entry first.';
      return;
    }
    const statement = factForm.elements.statement ? factForm.elements.statement.value.trim().slice(0, 140) : '';
    const category = factForm.elements.category ? factForm.elements.category.value.trim().toLowerCase() : 'other';
    const isCritical = factForm.elements.critical ? factForm.elements.critical.checked : false;
    if (!statement) return;

    const gate = gateMemoryFact(statement, isCritical);
    if (!gate.allowed) {
      if (status) status.textContent = gate.reason;
      return;
    }

    const saveFact = () => {
      const now = new Date();
      const id = 'fact-' + now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
      const newFact = {
        id,
        category,
        statement,
        critical: isCritical,
        at: now.toISOString()
      };
      const next = { ...state, facts: currentFacts.concat([newFact]) };
      const eventDetail = gate.audit.is_speculation
        ? `Added [${category}] (unconfirmed) ${statement.slice(0, 30)}`
        : `Added [${category}] ${statement.slice(0, 40)}`;
      if (saveAndRender(next, 'fact_added', eventDetail)) {
        factForm.reset();
        if (status) status.textContent = '';
        renderFacts();
        renderEvents();
      }
    };

    if (isCritical && gate.needs_confirmation) {
      if (status) {
        status.textContent = '';
        const warnP = el('p', 'muted', (gate.reason || 'This statement contains speculative wording.') + ' ');
        const confirmBtn = el('button', 'btn twin-btn-gap-left', 'Save anyway');
        confirmBtn.type = 'button';
        confirmBtn.onclick = () => {
          saveFact();
        };
        warnP.appendChild(confirmBtn);
        status.appendChild(warnP);
      }
      return;
    }

    saveFact();
  };
}

function renderQuests() {
  const ul = document.getElementById('quests');
  const summaryBox = document.getElementById('quest-summary');
  if (!ul) return;
  ul.textContent = '';
  const quests = state.quests || [];
  const summary = summarizeQuests(quests);
  if (!quests.length) {
    ul.appendChild(el('li', 'muted', 'No daily quests recorded yet. Add focus items to track your priorities.'));
  }
  quests.forEach((q, i) => {
    const li = el('li');
    const catBadge = el('small', 'muted', `[${q.category}] `);
    const priorityText = q.priority === 1 ? ' [Focus] ' : ` [P${q.priority}] `;
    const priorityBadge = el('small', 'muted', priorityText);
    const statusText = q.completed ? ' (completed) ' : ' ';
    const titleEl = el('b', null, q.title);
    if (q.completed) {
      titleEl.className = 'twin-strike';
    }
    li.append(catBadge, titleEl, priorityBadge, el('small', 'muted', statusText));

    const toggleBtn = el('button', 'btn twin-btn-gap-left', q.completed ? 'Reopen' : 'Complete');
    toggleBtn.onclick = () => {
      const toggled = toggleQuestCompletion(state, q.id);
      if (toggled.ok) {
        const evType = toggled.completed ? 'quest_completed' : 'quest_reopened';
        const evDetail = `${toggled.completed ? 'Completed' : 'Reopened'} quest: ${q.title.slice(0, 40)}`;
        if (saveAndRender(toggled.state, evType, evDetail)) {
          renderQuests();
          renderEvents();
        }
      }
    };
    li.appendChild(toggleBtn);

    const delBtn = el('button', 'btn twin-btn-gap-left', 'Remove');
    delBtn.onclick = () => {
      const next = { ...state, quests: quests.filter((_, idx) => idx !== i) };
      if (saveAndRender(next, 'quest_removed', `Removed quest: ${q.title.slice(0, 40)}`)) {
        renderQuests();
        renderEvents();
      }
    };
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
  if (summaryBox) {
    summaryBox.textContent = '';
    if (quests.length) {
      summaryBox.appendChild(el('p', 'muted', `Quests: ${summary.pending} pending (${summary.focus_pending} focus), ${summary.completed} completed of ${summary.total} total.`));
    }
  }
}

const questForm = document.getElementById('quest-form');
if (questForm) {
  questForm.onsubmit = (e) => {
    e.preventDefault();
    const status = document.getElementById('data-status');
    const currentQuests = state.quests || [];
    if (currentQuests.length >= 50) {
      if (status) status.textContent = 'Maximum of 50 quests reached. Remove an older entry first.';
      return;
    }
    const title = questForm.elements.title ? questForm.elements.title.value.trim().slice(0, 100) : '';
    const category = questForm.elements.category ? questForm.elements.category.value.trim().toLowerCase() : 'other';
    const rawPriority = questForm.elements.priority ? parseInt(questForm.elements.priority.value, 10) : 2;
    const priority = Number.isInteger(rawPriority) && rawPriority >= 1 && rawPriority <= 3 ? rawPriority : 2;
    if (title.length < 3) return;
    const now = new Date();
    const id = 'quest-' + now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    const newQuest = {
      id,
      title,
      category,
      priority,
      completed: false,
      at: now.toISOString(),
      completed_at: null
    };
    const next = { ...state, quests: currentQuests.concat([newQuest]) };
    if (saveAndRender(next, 'quest_added', `Added [${category}] ${title.slice(0, 40)}`)) {
      questForm.reset();
      renderQuests();
      renderEvents();
    }
  };
}

function renderValues() {
  const ul = document.getElementById('values-list');
  const summaryBox = document.getElementById('value-summary');
  if (!ul) return;
  ul.textContent = '';
  const values = state.values || DEFAULT_VALUES;
  const summary = summarizeValues(values);
  for (const dim of ALLOWED_VALUE_DIMENSIONS) {
    const li = el('li');
    const score = values[dim] !== undefined ? values[dim] : 3;
    const nameEl = el('b', null, dim.charAt(0).toUpperCase() + dim.slice(1));
    const scoreBadge = el('small', 'muted', ` [Priority ${score}/5] `);
    li.append(nameEl, scoreBadge);

    const resetBtn = el('button', 'btn twin-btn-gap-left', 'Reset (3)');
    resetBtn.onclick = () => {
      const updated = updateValuePreference(state, dim, 3);
      if (updated.ok) {
        if (saveAndRender(updated.state, 'value_preference_updated', `Reset ${dim} priority to 3`)) {
          renderValues();
          renderEvents();
        }
      }
    };
    li.appendChild(resetBtn);
    ul.appendChild(li);
  }
  if (summaryBox) {
    summaryBox.textContent = '';
    const topText = summary.top_dimensions.length ? summary.top_dimensions.join(', ') : 'none';
    summaryBox.appendChild(el('p', 'muted', `Average priority: ${summary.average_priority}/5. Top focus: ${topText}. Stored locally.`));
  }
}

const valueForm = document.getElementById('value-form');
if (valueForm) {
  valueForm.onsubmit = (e) => {
    e.preventDefault();
    const dim = valueForm.elements.dimension ? valueForm.elements.dimension.value.trim().toLowerCase() : '';
    const rawScore = valueForm.elements.score ? parseInt(valueForm.elements.score.value, 10) : 3;
    const score = Number.isInteger(rawScore) && rawScore >= 1 && rawScore <= 5 ? rawScore : 3;
    const updated = updateValuePreference(state, dim, score);
    if (updated.ok) {
      if (saveAndRender(updated.state, 'value_preference_updated', `Set ${dim} priority to ${score}`)) {
        renderValues();
        renderEvents();
      }
    }
  };
}

function renderContextAssembler() {
  const form = document.getElementById('assemble-context');
  const resultBox = document.getElementById('context-assembly-result');
  if (!form || !resultBox) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    resultBox.textContent = '';
    const budgetRaw = parseInt(form.elements.budget ? form.elements.budget.value : '1024', 10);
    const budget = Number.isInteger(budgetRaw) ? budgetRaw : 1024;
    const systemPrompt = form.elements.system_prompt ? form.elements.system_prompt.value.trim().slice(0, 200) : '';

    const res = assembleTokenBudgetedContext(state, {
      budget_tokens: budget,
      system_prompt: systemPrompt || undefined
    });

    if (!res.ok) {
      const errP = el('p', null);
      const errBadge = el('strong', 'status-err', '[Compilation Failed] ');
      errP.appendChild(errBadge);
      errP.appendChild(document.createTextNode(res.reason || res.error));
      resultBox.appendChild(errP);
      return;
    }

    const summaryP = el('p', 'muted');
    summaryP.textContent = `Tokens used: ${res.total_estimated_tokens} / ${res.budget_tokens} (${res.remaining_tokens} remaining). Prefix cache fingerprint: ${res.prefix_fingerprint}`;
    resultBox.appendChild(summaryP);

    const itemsP = el('p', 'muted');
    itemsP.textContent = `Packed: ${res.items_packed.critical_facts} critical constraint(s), ${res.items_packed.obligations} obligation(s), ${res.items_packed.quests} quest(s), ${res.items_packed.facts} fact(s), ${res.items_packed.events} event(s).`;
    resultBox.appendChild(itemsP);

    if (res.truncated_sections.length > 0) {
      const truncP = el('p', 'muted');
      truncP.textContent = `Truncated sections due to budget: ${res.truncated_sections.join(', ')}.`;
      resultBox.appendChild(truncP);
    }

    const pre = el('pre', 'twin-context-pre');
    pre.textContent = res.context_text;
    resultBox.appendChild(pre);
  };
}

function renderCapabilityInspector() {
  const form = document.getElementById('capability-request');
  const resultBox = document.getElementById('capability-eval-result');
  if (!form || !resultBox) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    resultBox.textContent = '';
    const grantee = form.elements.grantee ? form.elements.grantee.value.trim().slice(0, 60) : '';
    const scope = form.elements.scope ? form.elements.scope.value.trim().slice(0, 80) : '';
    const purpose = form.elements.purpose ? form.elements.purpose.value.trim().slice(0, 120) : '';
    const ttlRaw = parseInt(form.elements.ttl ? form.elements.ttl.value : '900', 10);
    const ttl = Number.isInteger(ttlRaw) && ttlRaw > 0 ? ttlRaw : 900;

    if (!grantee || !scope || !purpose) {
      resultBox.appendChild(el('p', 'muted', 'Please fill in assistant, requested scope, and purpose.'));
      return;
    }

    const evalRes = evaluateCapabilityAdjustmentRequest(state, {
      grantee,
      requested_scope: scope,
      purpose,
      ttl_seconds: ttl
    });
    const summary = summarizeCapabilityAdjustment(evalRes);

    const p = el('p');
    if (summary.allowed) {
      p.className = 'status-ok';
      const badge = el('strong', null, 'Fits a permission you gave. ');
      p.appendChild(badge);
      p.appendChild(document.createTextNode(`"${summary.grantee}" could have "${summary.scope}" for ${Math.round(summary.ttl_seconds / 60)} minutes, inside what you already allowed it. This is a preview on your device: nothing is granted and nothing runs.`));
      resultBox.appendChild(p);
    } else if (summary.verdict === 'requires_confirmation') {
      p.className = 'muted';
      const badge = el('strong', null, 'You would have to confirm. ');
      p.appendChild(badge);
      p.appendChild(document.createTextNode(`${summary.reason}.`));
      resultBox.appendChild(p);
    } else {
      p.className = 'muted';
      const badge = el('strong', null, 'Blocked. ');
      p.appendChild(badge);
      p.appendChild(document.createTextNode(summary.reason || 'Capability adjustment blocked by policy.'));
      resultBox.appendChild(p);
    }
  };
}

renderGrants(); renderQuest(); renderContributions(); renderObligations(); renderActions(); renderEvents(); renderAccessInspector(); renderReceiptInspector(); renderFacts(); renderQuests(); renderValues(); renderContextAssembler(); renderCapabilityInspector();


