// Pure core logic for twin state management and validation.
export const ALLOWED_CONTRIBUTION_KINDS = Object.freeze([
  'code',
  'review',
  'knowledge',
  'compute',
  'verification',
  'community',
  'other'
]);

export const ALLOWED_ACTION_STATUSES = Object.freeze([
  'pending',
  'approved',
  'rejected'
]);

export const ALLOWED_OBLIGATION_CATEGORIES = Object.freeze([
  'renewal',
  'contract',
  'warranty',
  'tax',
  'document',
  'other'
]);

export const ALLOWED_OBLIGATION_STATUSES = Object.freeze([
  'active',
  'completed',
  'dismissed'
]);

export const ALLOWED_FACT_CATEGORIES = Object.freeze([
  'medical',
  'dietary',
  'emergency',
  'preference',
  'boundary',
  'other'
]);

export const SPECULATIVE_MARKERS = Object.freeze([
  'might',
  'may',
  'maybe',
  'could',
  'perhaps',
  'possibly',
  'probably',
  'considering',
  'planning to',
  'plans to',
  'thinking of',
  'thinking about',
  'intends to',
  'hoping to',
  'likely to',
  'tentatively',
  'unconfirmed',
  'hypothetically'
]);

export const ALLOWED_QUEST_CATEGORIES = Object.freeze([
  'learning',
  'creation',
  'community',
  'health',
  'maintenance',
  'other'
]);

export const ALLOWED_VALUE_DIMENSIONS = Object.freeze([
  'commons',
  'resilience',
  'wellbeing',
  'learning',
  'containment',
  'ecology'
]);

export const DEFAULT_VALUES = Object.freeze({
  commons: 3,
  resilience: 3,
  wellbeing: 3,
  learning: 3,
  containment: 3,
  ecology: 3
});

export const ALLOWED_EVENT_TYPES = Object.freeze([
  'topics_updated',
  'grant_created',
  'grant_revoked',
  'contribution_added',
  'contribution_removed',
  'action_queued',
  'action_approved',
  'action_denied',
  'action_cleared',
  'obligation_added',
  'obligation_resolved',
  'obligation_removed',
  'fact_added',
  'fact_removed',
  'quest_added',
  'quest_completed',
  'quest_reopened',
  'quest_removed',
  'value_preference_updated',
  'data_exported',
  'data_imported',
  'log_cleared'
]);

export const DEFAULT_TWIN_STATE = Object.freeze({
  topics: Object.freeze([]),
  grants: Object.freeze([]),
  contributions: Object.freeze([]),
  actions: Object.freeze([]),
  events: Object.freeze([]),
  obligations: Object.freeze([]),
  facts: Object.freeze([]),
  quests: Object.freeze([]),
  values: DEFAULT_VALUES
});

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export function isGrantExpired(grant, asOfTime = null) {
  if (!grant || !grant.expires_at) return false;
  let nowMs;
  if (asOfTime === null || asOfTime === undefined) {
    nowMs = Date.now();
  } else if (typeof asOfTime === 'string') {
    nowMs = Date.parse(asOfTime);
  } else if (asOfTime instanceof Date) {
    nowMs = asOfTime.getTime();
  } else if (typeof asOfTime === 'number' && Number.isFinite(asOfTime)) {
    nowMs = asOfTime;
  } else {
    throw new Error('Invalid asOfTime provided');
  }
  if (isNaN(nowMs)) throw new Error('Invalid asOfTime provided');
  const expMs = Date.parse(grant.expires_at);
  if (isNaN(expMs)) return true;
  return nowMs >= expMs;
}

export function validateTwinState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Twin state must be an object' };
  }
  const keys = Object.keys(raw);
  if (keys.some((k) => k !== 'topics' && k !== 'grants' && k !== 'contributions' && k !== 'actions' && k !== 'events' && k !== 'obligations' && k !== 'facts' && k !== 'quests' && k !== 'values')) {
    return { ok: false, error: 'Unknown field in twin state' };
  }
  if (!Array.isArray(raw.topics) || raw.topics.length > 20) {
    return { ok: false, error: 'topics must be a list of at most 20 items' };
  }
  const cleanTopics = [];
  for (let i = 0; i < raw.topics.length; i++) {
    const t = raw.topics[i];
    if (typeof t !== 'string' || !t.trim() || t.trim().length > 60) {
      return { ok: false, error: `topic at index ${i} must be a string up to 60 characters` };
    }
    cleanTopics.push(t.trim());
  }
  if (!Array.isArray(raw.grants) || raw.grants.length > 50) {
    return { ok: false, error: 'grants must be a list of at most 50 items' };
  }
  const cleanGrants = [];
  for (let i = 0; i < raw.grants.length; i++) {
    const g = raw.grants[i];
    if (!g || typeof g !== 'object' || Array.isArray(g)) {
      return { ok: false, error: `grant at index ${i} must be an object` };
    }
    if (Object.keys(g).some((k) => k !== 'who' && k !== 'what' && k !== 'at' && k !== 'expires_at')) {
      return { ok: false, error: `grant at index ${i} has unknown fields` };
    }
    if (typeof g.who !== 'string' || !g.who.trim() || g.who.trim().length > 60) {
      return { ok: false, error: `grant at index ${i} who field invalid` };
    }
    if (typeof g.what !== 'string' || !g.what.trim() || g.what.trim().length > 80) {
      return { ok: false, error: `grant at index ${i} what field invalid` };
    }
    if (typeof g.at !== 'string' || !ISO_RE.test(g.at) || isNaN(Date.parse(g.at))) {
      return { ok: false, error: `grant at index ${i} at field must be an ISO date string` };
    }
    let cleanExpiresAt = null;
    if (g.expires_at !== undefined && g.expires_at !== null) {
      if (typeof g.expires_at !== 'string' || !ISO_RE.test(g.expires_at) || isNaN(Date.parse(g.expires_at))) {
        return { ok: false, error: `grant at index ${i} expires_at field must be an ISO date string or null` };
      }
      cleanExpiresAt = g.expires_at;
    }
    cleanGrants.push({ who: g.who.trim(), what: g.what.trim(), at: g.at, expires_at: cleanExpiresAt });
  }

  const rawContributions = raw.contributions !== undefined ? raw.contributions : [];
  if (!Array.isArray(rawContributions) || rawContributions.length > 50) {
    return { ok: false, error: 'contributions must be a list of at most 50 items' };
  }
  const cleanContributions = [];
  for (let i = 0; i < rawContributions.length; i++) {
    const c = rawContributions[i];
    if (!c || typeof c !== 'object' || Array.isArray(c)) {
      return { ok: false, error: `contribution at index ${i} must be an object` };
    }
    if (Object.keys(c).some((k) => k !== 'what' && k !== 'kind' && k !== 'at' && k !== 'impact')) {
      return { ok: false, error: `contribution at index ${i} has unknown fields` };
    }
    if (typeof c.what !== 'string' || !c.what.trim() || c.what.trim().length > 100) {
      return { ok: false, error: `contribution at index ${i} what field must be a string up to 100 characters` };
    }
    if (typeof c.kind !== 'string' || !ALLOWED_CONTRIBUTION_KINDS.includes(c.kind.trim().toLowerCase())) {
      return { ok: false, error: `contribution at index ${i} kind must be one of: ${ALLOWED_CONTRIBUTION_KINDS.join(', ')}` };
    }
    if (typeof c.at !== 'string' || !ISO_RE.test(c.at) || isNaN(Date.parse(c.at))) {
      return { ok: false, error: `contribution at index ${i} at field must be an ISO date string` };
    }
    let cleanImpact = null;
    if (c.impact !== undefined && c.impact !== null) {
      if (typeof c.impact !== 'string' || c.impact.trim().length > 100) {
        return { ok: false, error: `contribution at index ${i} impact field must be a string up to 100 characters or null` };
      }
      cleanImpact = c.impact.trim();
    }
    cleanContributions.push({
      what: c.what.trim(),
      kind: c.kind.trim().toLowerCase(),
      at: c.at,
      impact: cleanImpact
    });
  }

  const rawActions = raw.actions !== undefined ? raw.actions : [];
  if (!Array.isArray(rawActions) || rawActions.length > 50) {
    return { ok: false, error: 'actions must be a list of at most 50 items' };
  }
  const cleanActions = [];
  for (let i = 0; i < rawActions.length; i++) {
    const a = rawActions[i];
    if (!a || typeof a !== 'object' || Array.isArray(a)) {
      return { ok: false, error: `action at index ${i} must be an object` };
    }
    if (Object.keys(a).some((k) => k !== 'id' && k !== 'who' && k !== 'description' && k !== 'at' && k !== 'status' && k !== 'decided_at')) {
      return { ok: false, error: `action at index ${i} has unknown fields` };
    }
    if (typeof a.id !== 'string' || !a.id.trim() || a.id.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(a.id.trim())) {
      return { ok: false, error: `action at index ${i} id must be an alphanumeric string up to 40 characters` };
    }
    if (typeof a.who !== 'string' || !a.who.trim() || a.who.trim().length > 60) {
      return { ok: false, error: `action at index ${i} who field invalid` };
    }
    if (typeof a.description !== 'string' || !a.description.trim() || a.description.trim().length > 100) {
      return { ok: false, error: `action at index ${i} description must be a string up to 100 characters` };
    }
    if (typeof a.at !== 'string' || !ISO_RE.test(a.at) || isNaN(Date.parse(a.at))) {
      return { ok: false, error: `action at index ${i} at field must be an ISO date string` };
    }
    const status = typeof a.status === 'string' ? a.status.trim().toLowerCase() : '';
    if (!ALLOWED_ACTION_STATUSES.includes(status)) {
      return { ok: false, error: `action at index ${i} status must be one of: ${ALLOWED_ACTION_STATUSES.join(', ')}` };
    }
    let cleanDecidedAt = null;
    if (a.decided_at !== undefined && a.decided_at !== null) {
      if (typeof a.decided_at !== 'string' || !ISO_RE.test(a.decided_at) || isNaN(Date.parse(a.decided_at))) {
        return { ok: false, error: `action at index ${i} decided_at must be an ISO date string or null` };
      }
      cleanDecidedAt = a.decided_at;
    }
    if (status === 'pending' && cleanDecidedAt !== null) {
      return { ok: false, error: `action at index ${i} pending action cannot have decided_at` };
    }
    if (status !== 'pending' && !cleanDecidedAt) {
      return { ok: false, error: `action at index ${i} decided_at required when status is not pending` };
    }
    cleanActions.push({
      id: a.id.trim(),
      who: a.who.trim(),
      description: a.description.trim(),
      at: a.at,
      status,
      decided_at: cleanDecidedAt
    });
  }

  const rawEvents = raw.events !== undefined ? raw.events : [];
  if (!Array.isArray(rawEvents) || rawEvents.length > 50) return { ok: false, error: 'events must be a list of at most 50 items' };
  const cleanEvents = [];
  for (let i = 0; i < rawEvents.length; i++) {
    const e = rawEvents[i];
    if (!e || typeof e !== 'object' || Array.isArray(e)) return { ok: false, error: `event at index ${i} must be an object` };
    if (Object.keys(e).some((k) => k !== 'id' && k !== 'type' && k !== 'detail' && k !== 'at')) return { ok: false, error: `event at index ${i} has unknown fields` };
    if (typeof e.id !== 'string' || !e.id.trim() || e.id.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(e.id.trim())) return { ok: false, error: `event at index ${i} id must be an alphanumeric string up to 40 characters` };
    const eventType = typeof e.type === 'string' ? e.type.trim().toLowerCase() : '';
    if (!ALLOWED_EVENT_TYPES.includes(eventType)) return { ok: false, error: `event at index ${i} type must be one of: ${ALLOWED_EVENT_TYPES.join(', ')}` };
    if (typeof e.detail !== 'string' || !e.detail.trim() || e.detail.trim().length > 120) return { ok: false, error: `event at index ${i} detail must be a string up to 120 characters` };
    if (typeof e.at !== 'string' || !ISO_RE.test(e.at) || isNaN(Date.parse(e.at))) return { ok: false, error: `event at index ${i} at field must be an ISO date string` };
    cleanEvents.push({ id: e.id.trim(), type: eventType, detail: e.detail.trim(), at: e.at });
  }

  const rawObligations = raw.obligations !== undefined ? raw.obligations : [];
  if (!Array.isArray(rawObligations) || rawObligations.length > 50) return { ok: false, error: 'obligations must be a list of at most 50 items' };
  const cleanObligations = [];
  const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  for (let i = 0; i < rawObligations.length; i++) {
    const o = rawObligations[i];
    if (!o || typeof o !== 'object' || Array.isArray(o)) return { ok: false, error: `obligation at index ${i} must be an object` };
    if (Object.keys(o).some((k) => !['id', 'title', 'category', 'due_date', 'lead_days', 'status', 'notes', 'at', 'resolved_at'].includes(k))) return { ok: false, error: `obligation at index ${i} has unknown fields` };
    if (typeof o.id !== 'string' || !o.id.trim() || o.id.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(o.id.trim())) return { ok: false, error: `obligation at index ${i} id must be an alphanumeric string up to 40 characters` };
    if (typeof o.title !== 'string' || !o.title.trim() || o.title.trim().length > 80) return { ok: false, error: `obligation at index ${i} title must be a string up to 80 characters` };
    const cat = typeof o.category === 'string' ? o.category.trim().toLowerCase() : '';
    if (!ALLOWED_OBLIGATION_CATEGORIES.includes(cat)) return { ok: false, error: `obligation at index ${i} category must be one of: ${ALLOWED_OBLIGATION_CATEGORIES.join(', ')}` };
    if (typeof o.due_date !== 'string' || !CALENDAR_DATE_RE.test(o.due_date) || isNaN(Date.parse(o.due_date + 'T00:00:00Z'))) return { ok: false, error: `obligation at index ${i} due_date must be a valid YYYY-MM-DD date string` };
    if (typeof o.lead_days !== 'number' || !Number.isInteger(o.lead_days) || o.lead_days < 0 || o.lead_days > 365) return { ok: false, error: `obligation at index ${i} lead_days must be an integer between 0 and 365` };
    const status = typeof o.status === 'string' ? o.status.trim().toLowerCase() : '';
    if (!ALLOWED_OBLIGATION_STATUSES.includes(status)) return { ok: false, error: `obligation at index ${i} status must be one of: ${ALLOWED_OBLIGATION_STATUSES.join(', ')}` };
    let cleanNotes = null;
    if (o.notes !== undefined && o.notes !== null) {
      if (typeof o.notes !== 'string' || o.notes.trim().length > 100) return { ok: false, error: `obligation at index ${i} notes must be a string up to 100 characters or null` };
      cleanNotes = o.notes.trim();
    }
    if (typeof o.at !== 'string' || !ISO_RE.test(o.at) || isNaN(Date.parse(o.at))) return { ok: false, error: `obligation at index ${i} at field must be an ISO date string` };
    let cleanResolvedAt = null;
    if (o.resolved_at !== undefined && o.resolved_at !== null) {
      if (typeof o.resolved_at !== 'string' || !ISO_RE.test(o.resolved_at) || isNaN(Date.parse(o.resolved_at))) return { ok: false, error: `obligation at index ${i} resolved_at must be an ISO date string or null` };
      cleanResolvedAt = o.resolved_at;
    }
    if (status === 'active' && cleanResolvedAt !== null) return { ok: false, error: `obligation at index ${i} active obligation cannot have resolved_at` };
    if (status !== 'active' && !cleanResolvedAt) return { ok: false, error: `obligation at index ${i} resolved_at required when status is not active` };
    cleanObligations.push({ id: o.id.trim(), title: o.title.trim(), category: cat, due_date: o.due_date, lead_days: o.lead_days, status, notes: cleanNotes, at: o.at, resolved_at: cleanResolvedAt });
  }

  const rawFacts = raw.facts !== undefined ? raw.facts : [];
  if (!Array.isArray(rawFacts) || rawFacts.length > 50) return { ok: false, error: 'facts must be a list of at most 50 items' };
  const cleanFacts = [];
  for (let i = 0; i < rawFacts.length; i++) {
    const f = rawFacts[i];
    if (!f || typeof f !== 'object' || Array.isArray(f)) return { ok: false, error: `fact at index ${i} must be an object` };
    if (Object.keys(f).some((k) => k !== 'id' && k !== 'category' && k !== 'statement' && k !== 'critical' && k !== 'at')) return { ok: false, error: `fact at index ${i} has unknown fields` };
    if (typeof f.id !== 'string' || !f.id.trim() || f.id.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(f.id.trim())) return { ok: false, error: `fact at index ${i} id must be an alphanumeric string up to 40 characters` };
    const cat = typeof f.category === 'string' ? f.category.trim().toLowerCase() : '';
    if (!ALLOWED_FACT_CATEGORIES.includes(cat)) return { ok: false, error: `fact at index ${i} category must be one of: ${ALLOWED_FACT_CATEGORIES.join(', ')}` };
    if (typeof f.statement !== 'string' || !f.statement.trim() || f.statement.trim().length > 140) return { ok: false, error: `fact at index ${i} statement must be a string up to 140 characters` };
    if (typeof f.critical !== 'boolean') return { ok: false, error: `fact at index ${i} critical must be a boolean` };
    if (typeof f.at !== 'string' || !ISO_RE.test(f.at) || isNaN(Date.parse(f.at))) return { ok: false, error: `fact at index ${i} at field must be an ISO date string` };
    cleanFacts.push({ id: f.id.trim(), category: cat, statement: f.statement.trim(), critical: f.critical, at: f.at });
  }

  const rawQuests = raw.quests !== undefined ? raw.quests : [];
  if (!Array.isArray(rawQuests) || rawQuests.length > 50) return { ok: false, error: 'quests must be a list of at most 50 items' };
  const cleanQuests = [];
  for (let i = 0; i < rawQuests.length; i++) {
    const q = rawQuests[i];
    if (!q || typeof q !== 'object' || Array.isArray(q)) return { ok: false, error: `quest at index ${i} must be an object` };
    if (Object.keys(q).some((k) => !['id', 'title', 'category', 'priority', 'completed', 'at', 'completed_at'].includes(k))) return { ok: false, error: `quest at index ${i} has unknown fields` };
    if (typeof q.id !== 'string' || !q.id.trim() || q.id.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(q.id.trim())) return { ok: false, error: `quest at index ${i} id must be an alphanumeric string up to 40 characters` };
    if (typeof q.title !== 'string' || !q.title.trim() || q.title.trim().length < 3 || q.title.trim().length > 100) return { ok: false, error: `quest at index ${i} title must be a string between 3 and 100 characters` };
    const cat = typeof q.category === 'string' ? q.category.trim().toLowerCase() : '';
    if (!ALLOWED_QUEST_CATEGORIES.includes(cat)) return { ok: false, error: `quest at index ${i} category must be one of: ${ALLOWED_QUEST_CATEGORIES.join(', ')}` };
    if (typeof q.priority !== 'number' || !Number.isInteger(q.priority) || q.priority < 1 || q.priority > 3) return { ok: false, error: `quest at index ${i} priority must be an integer between 1 and 3` };
    if (typeof q.completed !== 'boolean') return { ok: false, error: `quest at index ${i} completed must be a boolean` };
    if (typeof q.at !== 'string' || !ISO_RE.test(q.at) || isNaN(Date.parse(q.at))) return { ok: false, error: `quest at index ${i} at field must be an ISO date string` };
    let cleanCompletedAt = null;
    if (q.completed_at !== undefined && q.completed_at !== null) {
      if (typeof q.completed_at !== 'string' || !ISO_RE.test(q.completed_at) || isNaN(Date.parse(q.completed_at))) return { ok: false, error: `quest at index ${i} completed_at must be an ISO date string or null` };
      cleanCompletedAt = q.completed_at;
    }
    if (!q.completed && cleanCompletedAt !== null) return { ok: false, error: `quest at index ${i} uncompleted quest cannot have completed_at` };
    if (q.completed && !cleanCompletedAt) return { ok: false, error: `quest at index ${i} completed quest must have a valid completed_at timestamp` };
    cleanQuests.push({ id: q.id.trim(), title: q.title.trim(), category: cat, priority: q.priority, completed: q.completed, at: q.at, completed_at: cleanCompletedAt });
  }

  const rawValues = raw.values !== undefined ? raw.values : DEFAULT_VALUES;
  if (!rawValues || typeof rawValues !== 'object' || Array.isArray(rawValues)) {
    return { ok: false, error: 'values must be an object' };
  }
  if (Object.keys(rawValues).some((k) => !ALLOWED_VALUE_DIMENSIONS.includes(k))) {
    return { ok: false, error: 'values contains unknown dimension' };
  }
  const cleanValues = {};
  for (const dim of ALLOWED_VALUE_DIMENSIONS) {
    const val = rawValues[dim] !== undefined ? rawValues[dim] : DEFAULT_VALUES[dim];
    if (typeof val !== 'number' || typeof val === 'boolean' || !Number.isFinite(val) || val < 1 || val > 5) {
      return { ok: false, error: `value dimension ${dim} must be a finite number between 1 and 5` };
    }
    cleanValues[dim] = Math.round(val);
  }

  return { ok: true, value: { topics: cleanTopics, grants: cleanGrants, contributions: cleanContributions, actions: cleanActions, events: cleanEvents, obligations: cleanObligations, facts: cleanFacts, quests: cleanQuests, values: cleanValues } };
}

export function deserializeTwinState(jsonStr) {
  if (typeof jsonStr !== 'string') return { ok: false, error: 'Input must be a string' };
  try {
    return validateTwinState(JSON.parse(jsonStr));
  } catch (e) {
    return { ok: false, error: 'Malformed JSON payload' };
  }
}

export function serializeTwinState(state) {
  const check = validateTwinState(state);
  if (!check.ok) throw new Error(check.error);
  return JSON.stringify(check.value, null, 2);
}

export function evaluateAccessRequest(state, service, requestedScope, asOfTime = null) {
  const check = validateTwinState(state);
  if (!check.ok) {
    return { allowed: false, reason: 'Invalid twin state: ' + check.error };
  }
  if (typeof service !== 'string' || !service.trim() || service.trim().length > 60) {
    return { allowed: false, reason: 'Service identifier must be a non-empty string up to 60 characters' };
  }
  if (typeof requestedScope !== 'string' || !requestedScope.trim() || requestedScope.trim().length > 80) {
    return { allowed: false, reason: 'Requested scope must be a non-empty string up to 80 characters' };
  }
  if (asOfTime !== null && asOfTime !== undefined) {
    let testMs;
    if (typeof asOfTime === 'string') {
      testMs = Date.parse(asOfTime);
    } else if (asOfTime instanceof Date) {
      testMs = asOfTime.getTime();
    } else if (typeof asOfTime === 'number' && Number.isFinite(asOfTime)) {
      testMs = asOfTime;
    } else {
      return { allowed: false, reason: 'Invalid asOfTime parameter' };
    }
    if (isNaN(testMs)) {
      return { allowed: false, reason: 'Invalid asOfTime parameter' };
    }
  }
  const cleanService = service.trim().toLowerCase();
  const cleanScope = requestedScope.trim().toLowerCase();
  if (check.value.grants.length === 0) {
    return { allowed: false, reason: 'No grants authorized for any service' };
  }
  const matchingServiceGrants = check.value.grants.filter((g) => g.who.toLowerCase() === cleanService);
  if (matchingServiceGrants.length === 0) {
    return { allowed: false, reason: 'Service not in authorized grant list' };
  }
  let sawScopeMatchButExpired = false;
  for (const g of matchingServiceGrants) {
    const scopes = g.what.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
    if (scopes.includes('*') || scopes.includes(cleanScope)) {
      if (isGrantExpired(g, asOfTime)) {
        sawScopeMatchButExpired = true;
        continue;
      }
      return { allowed: true, reason: 'Authorized by active grant', grant: g };
    }
  }
  if (sawScopeMatchButExpired) {
    return { allowed: false, reason: 'Grant has expired' };
  }
  return { allowed: false, reason: 'Service authorized, but requested scope not granted' };
}

export function createConsentReceipt(grant, subjectId = 'local-user') {
  if (!grant || typeof grant !== 'object' || Array.isArray(grant)) {
    throw new Error('Grant must be an object');
  }
  if (Object.keys(grant).some((k) => k !== 'who' && k !== 'what' && k !== 'at' && k !== 'expires_at')) {
    throw new Error('Grant has unknown fields');
  }
  if (typeof grant.who !== 'string' || !grant.who.trim() || grant.who.trim().length > 60) {
    throw new Error('Grant who field must be a non-empty string up to 60 characters');
  }
  if (typeof grant.what !== 'string' || !grant.what.trim() || grant.what.trim().length > 80) {
    throw new Error('Grant what field must be a non-empty string up to 80 characters');
  }
  if (typeof grant.at !== 'string' || !ISO_RE.test(grant.at) || isNaN(Date.parse(grant.at))) {
    throw new Error('Grant at field must be an ISO date string');
  }
  let receiptExpiresAt = null;
  if (grant.expires_at !== undefined && grant.expires_at !== null) {
    if (typeof grant.expires_at !== 'string' || !ISO_RE.test(grant.expires_at) || isNaN(Date.parse(grant.expires_at))) {
      throw new Error('Grant expires_at field must be an ISO date string or null');
    }
    receiptExpiresAt = grant.expires_at;
  }
  if (subjectId !== undefined) {
    if (typeof subjectId !== 'string' || !subjectId.trim() || subjectId.trim().length > 80) {
      throw new Error('subjectId must be a non-empty string up to 80 characters');
    }
  }
  const cleanSubject = (subjectId !== undefined ? subjectId.trim() : 'local-user');
  const cleanWho = grant.who.trim();
  const cleanWhat = grant.what.trim();
  const scopes = Object.freeze(cleanWhat.split(',').map((s) => s.trim()).filter(Boolean));
  if (scopes.length === 0) {
    throw new Error('Grant what must define at least one valid scope');
  }
  return Object.freeze({
    receipt_version: 'ISO-27560:2023-compatible',
    subject: cleanSubject,
    recipient: cleanWho,
    purposes_and_scopes: scopes,
    timestamp: grant.at,
    expires_at: receiptExpiresAt,
    status: receiptExpiresAt && isGrantExpired(grant) ? 'expired' : 'granted',
    jurisdiction_or_policy: 'Local device sovereignty (client-side only)'
  });
}

/**
 * Extract normalized lowercase words (length >= 2) from text.
 * Retains key two-letter tokens like 'ai' and 'ml' while dropping single-character noise.
 */
export function extractWords(text) {
  if (typeof text !== 'string') return [];
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
}

/**
 * Score relevance of a single signal against user topics or precomputed token set.
 * Fail-closed: invalid or non-object signal returns zero relevance and empty token list.
 *
 * @param {object} signal The signal to evaluate
 * @param {string[]|Set<string>|string} topicsOrWords Topics list or token set
 * @returns {object} { relevance: number, matched_tokens: string[] }
 */
export function scoreSignalRelevance(signal, topicsOrWords) {
  if (!signal || typeof signal !== 'object' || Array.isArray(signal)) {
    return Object.freeze({ relevance: 0, matched_tokens: Object.freeze([]) });
  }

  let wordSet;
  if (topicsOrWords instanceof Set) {
    wordSet = topicsOrWords;
  } else if (Array.isArray(topicsOrWords)) {
    wordSet = new Set();
    topicsOrWords.forEach((t) => {
      extractWords(t).forEach((w) => wordSet.add(w));
    });
  } else if (typeof topicsOrWords === 'string') {
    wordSet = new Set(extractWords(topicsOrWords));
  } else {
    return Object.freeze({ relevance: 0, matched_tokens: Object.freeze([]) });
  }

  if (wordSet.size === 0) {
    return Object.freeze({ relevance: 0, matched_tokens: Object.freeze([]) });
  }

  const text = (typeof signal.title === 'string' ? signal.title : '') + ' ' + (typeof signal.summary === 'string' ? signal.summary : '');
  const sigWords = extractWords(text);
  const hits = [];
  const hitSet = new Set();
  sigWords.forEach((w) => {
    if (wordSet.has(w)) {
      hits.push(w);
      hitSet.add(w);
    }
  });

  return Object.freeze({
    relevance: hits.length,
    matched_tokens: Object.freeze(Array.from(hitSet).sort())
  });
}

/**
 * Calculate personal alignment trajectory against external signals.
 * Evaluates how external signals intersect with the user's local topics of interest.
 *
 * Status and limits:
 * - Pure client-side computation running locally in the browser with zero data egress.
 * - Uses deterministic lexical word token matching against signal title and summary.
 * - Does not perform dense semantic embeddings (which would require local WebGPU/WASM neural weights).
 * - Weighted direction score ranges from 0.0 to 100.0, where 50.0 is level / neutral balance.
 *
 * @param {string[]} topics List of topics the person cares about
 * @param {object[]} signals List of alignment signals
 * @returns {object} Calculated personal trajectory metrics
 */
export function calculatePersonalTrajectory(topics, signals) {
  const cleanTopics = Array.isArray(topics) ? topics.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim()) : [];
  if (cleanTopics.length === 0 || !Array.isArray(signals) || signals.length === 0) {
    return Object.freeze({
      matching_signals: Object.freeze([]),
      total_matching: 0,
      toward_count: 0,
      away_count: 0,
      neutral_count: 0,
      weighted_toward: 0,
      weighted_away: 0,
      net_balance: 0,
      score: 50.0,
      category_counts: Object.freeze({}),
      topics_matched: Object.freeze([])
    });
  }

  const topicWords = new Set();
  cleanTopics.forEach((t) => {
    extractWords(t).forEach((w) => topicWords.add(w));
  });

  if (topicWords.size === 0) {
    return Object.freeze({
      matching_signals: Object.freeze([]),
      total_matching: 0,
      toward_count: 0,
      away_count: 0,
      neutral_count: 0,
      weighted_toward: 0,
      weighted_away: 0,
      net_balance: 0,
      score: 50.0,
      category_counts: Object.freeze({}),
      topics_matched: Object.freeze([])
    });
  }

  const matchedWordsSet = new Set();
  const categoryCounts = Object.create(null);
  let towardCount = 0;
  let awayCount = 0;
  let neutralCount = 0;
  let weightedToward = 0;
  let weightedAway = 0;
  const matching = [];

  for (let i = 0; i < signals.length; i++) {
    const s = signals[i];
    if (!s || typeof s !== 'object' || Array.isArray(s)) continue;

    const rel = scoreSignalRelevance(s, topicWords);
    if (rel.relevance === 0) continue;

    rel.matched_tokens.forEach((w) => matchedWordsSet.add(w));

    let weight = 1;
    if (typeof s.weight === 'number' && Number.isInteger(s.weight) && s.weight >= 1 && s.weight <= 3) {
      weight = s.weight;
    }

    const dir = typeof s.direction === 'string' ? s.direction.toLowerCase() : 'neutral';
    if (dir === 'toward') {
      towardCount += 1;
      weightedToward += weight;
    } else if (dir === 'away') {
      awayCount += 1;
      weightedAway += weight;
    } else {
      neutralCount += 1;
    }

    if (Array.isArray(s.categories)) {
      const seenCats = new Set();
      s.categories.forEach((cat) => {
        if (typeof cat === 'string' && cat.trim()) {
          const c = cat.trim().toLowerCase();
          if (!seenCats.has(c)) {
            seenCats.add(c);
            categoryCounts[c] = (categoryCounts[c] || 0) + 1;
          }
        }
      });
    }

    matching.push(Object.freeze({
      id: typeof s.id === 'string' ? s.id : '',
      title: typeof s.title === 'string' ? s.title : 'Untitled',
      summary: typeof s.summary === 'string' ? s.summary : '',
      url: typeof s.url === 'string' ? s.url : '#',
      direction: dir,
      weight,
      relevance: rel.relevance,
      categories: Object.freeze(Array.isArray(s.categories) ? s.categories.filter((c) => typeof c === 'string') : [])
    }));
  }

  matching.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    if (b.weight !== a.weight) return b.weight - a.weight;
    const idCmp = (a.id || '').localeCompare(b.id || '');
    if (idCmp !== 0) return idCmp;
    return (a.title || '').localeCompare(b.title || '');
  });

  const netBalance = weightedToward - weightedAway;
  const totalWeight = weightedToward + weightedAway;
  let score = 50.0;
  if (totalWeight > 0) {
    score = Math.round((50.0 + (netBalance / totalWeight) * 50.0) * 10) / 10;
  }

  return Object.freeze({
    matching_signals: Object.freeze(matching),
    total_matching: matching.length,
    toward_count: towardCount,
    away_count: awayCount,
    neutral_count: neutralCount,
    weighted_toward: weightedToward,
    weighted_away: weightedAway,
    net_balance: netBalance,
    score,
    category_counts: Object.freeze({ ...categoryCounts }),
    topics_matched: Object.freeze(Array.from(matchedWordsSet).sort())
  });
}

/**
 * Summarize contribution records by category and chronological order.
 * Fail-closed: invalid or non-array input returns empty baseline summary.
 *
 * @param {object[]} contributions List of contributions
 * @returns {object} { total: number, by_kind: object, recent: object[] }
 */
export function summarizeContributions(contributions) {
  if (!Array.isArray(contributions)) {
    return Object.freeze({
      total: 0,
      by_kind: Object.freeze({}),
      recent: Object.freeze([])
    });
  }
  const byKind = Object.create(null);
  const valid = [];
  for (let i = 0; i < contributions.length; i++) {
    const c = contributions[i];
    if (!c || typeof c !== 'object' || Array.isArray(c)) continue;
    if (typeof c.what !== 'string' || !c.what.trim()) continue;
    const kind = typeof c.kind === 'string' && ALLOWED_CONTRIBUTION_KINDS.includes(c.kind.trim().toLowerCase())
      ? c.kind.trim().toLowerCase()
      : 'other';
    byKind[kind] = (byKind[kind] || 0) + 1;
    valid.push(Object.freeze({
      what: c.what.trim(),
      kind,
      at: typeof c.at === 'string' ? c.at : '',
      impact: typeof c.impact === 'string' && c.impact.trim() ? c.impact.trim() : null
    }));
  }
  valid.sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  return Object.freeze({
    total: valid.length,
    by_kind: Object.freeze({ ...byKind }),
    recent: Object.freeze(valid.slice(0, 5))
  });
}

/**
 * Evaluate and record a decision on a proposed action.
 * Fail-closed: invalid action or decision returns an error object.
 *
 * @param {object} action The action to decide
 * @param {'approved'|'rejected'} decision The decision
 * @param {string|Date|number|null} decidedAt Optional timestamp
 * @returns {object} { ok: boolean, action?: object, error?: string }
 */
export function evaluateActionDecision(action, decision, decidedAt = null) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    return { ok: false, error: 'Action must be an object' };
  }
  const keys = Object.keys(action);
  if (keys.some((k) => k !== 'id' && k !== 'who' && k !== 'description' && k !== 'at' && k !== 'status' && k !== 'decided_at')) {
    return { ok: false, error: 'Action has unknown fields' };
  }
  if (typeof action.id !== 'string' || !action.id.trim() || action.id.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(action.id.trim())) {
    return { ok: false, error: 'Invalid or missing action id' };
  }
  if (typeof action.who !== 'string' || !action.who.trim() || action.who.trim().length > 60) {
    return { ok: false, error: 'Invalid or missing action who' };
  }
  if (typeof action.description !== 'string' || !action.description.trim() || action.description.trim().length > 100) {
    return { ok: false, error: 'Invalid or missing action description' };
  }
  if (typeof action.at !== 'string' || !ISO_RE.test(action.at) || isNaN(Date.parse(action.at))) {
    return { ok: false, error: 'Invalid or missing action at timestamp' };
  }
  const currentStatus = typeof action.status === 'string' ? action.status.trim().toLowerCase() : '';
  if (currentStatus !== 'pending') {
    return { ok: false, error: 'Only pending actions can be decided' };
  }
  const cleanDecision = typeof decision === 'string' ? decision.trim().toLowerCase() : '';
  if (cleanDecision !== 'approved' && cleanDecision !== 'rejected') {
    return { ok: false, error: "Decision must be 'approved' or 'rejected'" };
  }
  let atIso;
  if (decidedAt === null || decidedAt === undefined) {
    atIso = new Date().toISOString();
  } else if (typeof decidedAt === 'string') {
    if (!ISO_RE.test(decidedAt) || isNaN(Date.parse(decidedAt))) {
      return { ok: false, error: 'decidedAt must be an ISO date string' };
    }
    atIso = decidedAt;
  } else if (decidedAt instanceof Date && !isNaN(decidedAt.getTime())) {
    atIso = decidedAt.toISOString();
  } else if (typeof decidedAt === 'number' && Number.isFinite(decidedAt)) {
    atIso = new Date(decidedAt).toISOString();
  } else {
    return { ok: false, error: 'Invalid decidedAt parameter' };
  }

  const updated = {
    id: action.id.trim(),
    who: action.who.trim(),
    description: action.description.trim(),
    at: action.at,
    status: cleanDecision,
    decided_at: atIso
  };
  return { ok: true, action: Object.freeze(updated) };
}

/**
 * Summarize actions by status and recency.
 * Fail-closed: invalid or non-array input returns baseline summary.
 *
 * @param {object[]} actions List of actions
 * @returns {object} { total: number, pending: number, approved: number, rejected: number, recent: object[] }
 */
export function summarizeActions(actions) {
  if (!Array.isArray(actions)) {
    return Object.freeze({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      recent: Object.freeze([])
    });
  }
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  const valid = [];
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    if (!a || typeof a !== 'object' || Array.isArray(a)) continue;
    if (typeof a.id !== 'string' || !a.id.trim()) continue;
    const st = typeof a.status === 'string' ? a.status.trim().toLowerCase() : '';
    if (st === 'pending') pending += 1;
    else if (st === 'approved') approved += 1;
    else if (st === 'rejected') rejected += 1;
    valid.push(Object.freeze({
      id: a.id.trim(),
      who: typeof a.who === 'string' ? a.who.trim() : 'unknown',
      description: typeof a.description === 'string' ? a.description.trim() : '',
      at: typeof a.at === 'string' ? a.at : '',
      status: st || 'unknown',
      decided_at: typeof a.decided_at === 'string' ? a.decided_at : null
    }));
  }
  valid.sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  return Object.freeze({
    total: valid.length,
    pending,
    approved,
    rejected,
    recent: Object.freeze(valid.slice(0, 5))
  });
}

// Record typed event into twin's local event log, capped at 50 via FIFO. Fail-closed.
export function recordTwinEvent(state, type, detail, timestamp = null, id = null) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return { ok: false, error: 'State must be an object' };
  const eventType = typeof type === 'string' ? type.trim().toLowerCase() : '';
  if (!ALLOWED_EVENT_TYPES.includes(eventType)) return { ok: false, error: `Invalid event type: ${type}` };
  if (typeof detail !== 'string' || !detail.trim() || detail.trim().length > 120) return { ok: false, error: 'Event detail must be a string up to 120 characters' };
  let atStr;
  if (timestamp === null || timestamp === undefined) atStr = new Date().toISOString();
  else if (timestamp instanceof Date && !isNaN(timestamp.getTime())) atStr = timestamp.toISOString();
  else if (typeof timestamp === 'string' && ISO_RE.test(timestamp) && !isNaN(Date.parse(timestamp))) atStr = timestamp;
  else return { ok: false, error: 'Invalid timestamp provided' };
  let eventId = id || ('evt-' + Date.parse(atStr).toString(36) + '-' + Math.random().toString(36).slice(2, 6));
  if (typeof eventId !== 'string' || !eventId.trim() || eventId.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(eventId.trim())) {
    return { ok: false, error: 'Invalid event id' };
  }
  const existing = Array.isArray(state.events) ? state.events : [];
  const trimmed = existing.length >= 50 ? existing.slice(existing.length - 49) : existing.slice();
  const newEvent = { id: eventId.trim(), type: eventType, detail: detail.trim(), at: atStr };
  const candidate = { ...state, events: trimmed.concat([newEvent]) };
  const validated = validateTwinState(candidate);
  if (!validated.ok) return { ok: false, error: validated.error };
  return { ok: true, state: validated.value, event: Object.freeze(newEvent) };
}

// Summarize local events by type and recency. Fail-closed.
export function summarizeEvents(events) {
  if (!Array.isArray(events)) return Object.freeze({ total: 0, by_type: Object.freeze({}), latest: null });
  const by_type = {};
  for (const t of ALLOWED_EVENT_TYPES) by_type[t] = 0;
  let validTotal = 0, latest = null;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!e || typeof e !== 'object' || Array.isArray(e) || typeof e.id !== 'string' || !e.id.trim()) continue;
    const t = typeof e.type === 'string' ? e.type.trim().toLowerCase() : '';
    if (!ALLOWED_EVENT_TYPES.includes(t)) continue;
    by_type[t] = (by_type[t] || 0) + 1;
    validTotal += 1;
    if (typeof e.at === 'string' && ISO_RE.test(e.at) && !isNaN(Date.parse(e.at))) {
      if (!latest || Date.parse(e.at) > Date.parse(latest.at)) latest = e;
    }
  }
  return Object.freeze({ total: validTotal, by_type: Object.freeze(by_type), latest: latest ? Object.freeze({ ...latest }) : null });
}

/**
 * Queue an access request as a pending action when unauthorized or requiring explicit review.
 * Fail-closed: invalid state or parameters reject with { ok: false, error: ... }.
 *
 * @param {object} state Current twin state
 * @param {string} service Service/assistant making the request
 * @param {string} requestedScope Requested scope
 * @param {string|Date|number|null} timestamp Optional timestamp (defaults to now)
 * @param {string|null} id Optional custom action ID
 * @returns {object} { ok: boolean, state?: object, action?: object, error?: string }
 */
export function queueAccessAsPendingAction(state, service, requestedScope, timestamp = null, id = null) {
  const check = validateTwinState(state);
  if (!check.ok) return { ok: false, error: 'Invalid twin state: ' + check.error };
  if (typeof service !== 'string' || !service.trim() || service.trim().length > 60) {
    return { ok: false, error: 'Service identifier must be a non-empty string up to 60 characters' };
  }
  if (typeof requestedScope !== 'string' || !requestedScope.trim() || requestedScope.trim().length > 80) {
    return { ok: false, error: 'Requested scope must be a non-empty string up to 80 characters' };
  }
  let atIso;
  if (timestamp === null || timestamp === undefined) {
    atIso = new Date().toISOString();
  } else if (typeof timestamp === 'string') {
    if (!ISO_RE.test(timestamp) || isNaN(Date.parse(timestamp))) {
      return { ok: false, error: 'timestamp must be an ISO date string' };
    }
    atIso = timestamp;
  } else if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
    atIso = timestamp.toISOString();
  } else if (typeof timestamp === 'number' && Number.isFinite(timestamp)) {
    atIso = new Date(timestamp).toISOString();
  } else {
    return { ok: false, error: 'Invalid timestamp parameter' };
  }
  let actionId = id || ('act-' + Date.parse(atIso).toString(36) + '-' + Math.random().toString(36).slice(2, 6));
  if (typeof actionId !== 'string' || !actionId.trim() || actionId.trim().length > 40 || !/^[a-zA-Z0-9_-]+$/.test(actionId.trim())) {
    return { ok: false, error: 'Invalid action id' };
  }
  const desc = `Access requested: ${requestedScope.trim()}`;
  if (desc.length > 100) {
    return { ok: false, error: 'Generated action description exceeds 100 characters' };
  }
  const newAction = {
    id: actionId.trim(),
    who: service.trim(),
    description: desc,
    at: atIso,
    status: 'pending',
    decided_at: null
  };
  const existing = Array.isArray(check.value.actions) ? check.value.actions : [];
  if (existing.length >= 50) {
    return { ok: false, error: 'Pending actions queue reached maximum capacity of 50' };
  }
  const candidate = { ...check.value, actions: existing.concat([newAction]) };
  const val = validateTwinState(candidate);
  if (!val.ok) return { ok: false, error: val.error };
  return { ok: true, state: val.value, action: Object.freeze(newAction) };
}

/**
 * Calculate deterministic urgency for an obligation relative to a reference date.
 * Fail-closed: invalid obligation or date throws Error.
 */
export function calculateObligationUrgency(obligation, asOfDate = null) {
  if (!obligation || typeof obligation !== 'object' || Array.isArray(obligation)) {
    throw new Error('obligation must be an object');
  }
  if (typeof obligation.due_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(obligation.due_date)) {
    throw new Error('obligation due_date must be a valid YYYY-MM-DD date string');
  }
  const lead = typeof obligation.lead_days === 'number' && Number.isInteger(obligation.lead_days) ? obligation.lead_days : 30;
  let asOfMs;
  if (asOfDate === null || asOfDate === undefined) {
    const now = new Date();
    asOfMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  } else if (typeof asOfDate === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(asOfDate)) {
      asOfMs = Date.parse(asOfDate + 'T00:00:00Z');
    } else {
      const parsed = Date.parse(asOfDate);
      if (isNaN(parsed)) throw new Error('Invalid asOfDate provided');
      const d = new Date(parsed);
      asOfMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    }
  } else if (asOfDate instanceof Date && !isNaN(asOfDate.getTime())) {
    asOfMs = Date.UTC(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth(), asOfDate.getUTCDate());
  } else {
    throw new Error('Invalid asOfDate provided');
  }
  if (isNaN(asOfMs)) throw new Error('Invalid asOfDate provided');
  const dueMs = Date.parse(obligation.due_date + 'T00:00:00Z');
  if (isNaN(dueMs)) throw new Error('Invalid due_date');
  const daysRemaining = Math.round((dueMs - asOfMs) / 86400000);
  const isOverdue = daysRemaining < 0;
  const isDue = daysRemaining === 0;
  const isUrgent = daysRemaining >= 0 && daysRemaining <= lead;
  return Object.freeze({
    days_remaining: daysRemaining,
    is_overdue: isOverdue,
    is_due: isDue,
    is_urgent: isUrgent
  });
}

/**
 * Summarize a list of obligations into aggregate counts. Fail-closed.
 */
export function summarizeObligations(obligations, asOfDate = null) {
  if (!Array.isArray(obligations)) {
    return Object.freeze({
      total: 0,
      active: 0,
      urgent: 0,
      overdue: 0,
      completed: 0,
      dismissed: 0,
      by_category: Object.freeze({})
    });
  }
  const byCategory = {};
  for (const c of ALLOWED_OBLIGATION_CATEGORIES) byCategory[c] = 0;
  let active = 0, urgent = 0, overdue = 0, completed = 0, dismissed = 0, total = 0;
  for (let i = 0; i < obligations.length; i++) {
    const o = obligations[i];
    if (!o || typeof o !== 'object' || Array.isArray(o) || typeof o.id !== 'string') continue;
    const cat = typeof o.category === 'string' ? o.category.trim().toLowerCase() : '';
    if (ALLOWED_OBLIGATION_CATEGORIES.includes(cat)) {
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }
    const status = typeof o.status === 'string' ? o.status.trim().toLowerCase() : '';
    if (status === 'completed') {
      completed++;
      total++;
    } else if (status === 'dismissed') {
      dismissed++;
      total++;
    } else if (status === 'active') {
      active++;
      total++;
      try {
        const u = calculateObligationUrgency(o, asOfDate);
        if (u.is_overdue) overdue++;
        else if (u.is_urgent) urgent++;
      } catch (e) { /* ignore */ }
    }
  }
  return Object.freeze({
    total,
    active,
    urgent,
    overdue,
    completed,
    dismissed,
    by_category: Object.freeze(byCategory)
  });
}

export function summarizeFacts(facts) {
  if (!Array.isArray(facts)) return Object.freeze({ total: 0, critical_count: 0, by_category: Object.freeze({}) });
  let total = 0;
  let critical_count = 0;
  const byCategory = {};
  for (const cat of ALLOWED_FACT_CATEGORIES) {
    byCategory[cat] = 0;
  }
  for (const f of facts) {
    if (f && typeof f === 'object' && !Array.isArray(f)) {
      const cat = typeof f.category === 'string' ? f.category.trim().toLowerCase() : '';
      if (ALLOWED_FACT_CATEGORIES.includes(cat)) {
        total++;
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        if (f.critical === true) {
          critical_count++;
        }
      }
    }
  }
  return Object.freeze({
    total,
    critical_count,
    by_category: Object.freeze(byCategory)
  });
}

export function filterCriticalFacts(facts) {
  if (!Array.isArray(facts)) return [];
  return facts.filter((f) => f && typeof f === 'object' && f.critical === true);
}

/**
 * Audit a memory statement for speculative or prospective wording markers.
 * Fails closed on non-string or malformed inputs.
 */
export function auditMemoryStatement(statement) {
  if (typeof statement !== 'string') {
    throw new TypeError('statement must be a string');
  }
  const trimmed = statement.trim();
  if (trimmed.length === 0) {
    throw new Error('statement cannot be empty');
  }
  if (trimmed.length > 140) {
    throw new Error('statement cannot exceed 140 characters');
  }

  let sanitized = trimmed;
  // Skip 'could kill/harm/hurt' (toxicity/allergy constraints, not speculative)
  sanitized = sanitized.replace(/\bcould\s+(?:kill|harm|hurt)\b/gi, '__safety_constraint__');
  // Skip 'may not' (prohibitions/mandates, not speculative)
  sanitized = sanitized.replace(/\bmay\s+not\b/gi, '__prohibition__');
  // Skip 'may' when capitalised mid-sentence as a month, or preceded by month prepositions
  sanitized = sanitized.replace(/(?<!^|[.!?]\s+)\bMay\b/g, '__month__');
  sanitized = sanitized.replace(/\b(?:in|during|by|before|after|until|since|of)\s+May\b/gi, '__month__');
  // Skip negated prospective/speculative markers
  sanitized = sanitized.replace(/\b(?:not|never)\s+considering\b/gi, '__negated_marker__');
  sanitized = sanitized.replace(/\b(?:not|never)\s+(?:planning\s+to|thinking\s+(?:of|about)|intends\s+to|hoping\s+to)\b/gi, '__negated_marker__');

  const lower = ' ' + sanitized.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const matched = [];

  for (const marker of SPECULATIVE_MARKERS) {
    const padded = ' ' + marker + ' ';
    if (lower.includes(padded)) {
      matched.push(marker);
    }
  }

  const isSpeculation = matched.length > 0;
  return Object.freeze({
    is_speculation: isSpeculation,
    markers: Object.freeze(matched),
    verdict: isSpeculation ? 'speculation' : 'confirmed',
    reason: isSpeculation
      ? 'Contains speculative markers: ' + matched.join(', ')
      : 'Declarative statement without speculative markers'
  });
}

/**
 * Gate a memory fact before persistence.
 * Never blocks the person from saving what they mark critical; warns and requests
 * confirmation when speculative wording markers are detected on a critical constraint.
 */
export function gateMemoryFact(statement, isCritical) {
  if (typeof statement !== 'string') {
    throw new TypeError('statement must be a string');
  }
  if (typeof isCritical !== 'boolean') {
    throw new TypeError('isCritical must be a boolean');
  }
  const audit = auditMemoryStatement(statement);
  if (isCritical && audit.is_speculation) {
    return Object.freeze({
      allowed: true,
      needs_confirmation: true,
      reason: 'Contains speculative wording markers (' + audit.markers.join(', ') + '); confirmation recommended before saving as safety-critical constraint',
      audit
    });
  }
  return Object.freeze({
    allowed: true,
    needs_confirmation: false,
    reason: audit.is_speculation
      ? 'Allowed as unconfirmed speculation'
      : 'Allowed as confirmed declarative fact',
    audit
  });
}

/**
 * Aggregate summary of confirmed vs speculative memory facts.
 */
export function summarizeMemoryAudit(facts) {
  if (!Array.isArray(facts)) {
    return Object.freeze({
      total: 0,
      confirmed: 0,
      speculation: 0,
      critical_speculation: 0,
      breakdown: Object.freeze({ confirmed: 0, speculation: 0 })
    });
  }

  let total = 0;
  let confirmed = 0;
  let speculation = 0;
  let criticalSpeculation = 0;

  for (const f of facts) {
    if (!f || typeof f !== 'object' || Array.isArray(f) || typeof f.statement !== 'string') continue;
    try {
      const audit = auditMemoryStatement(f.statement);
      total++;
      if (audit.is_speculation) {
        speculation++;
        if (f.critical === true) {
          criticalSpeculation++;
        }
      } else {
        confirmed++;
      }
    } catch (e) {
      // ignore invalid statements
    }
  }

  return Object.freeze({
    total,
    confirmed,
    speculation,
    critical_speculation: criticalSpeculation,
    breakdown: Object.freeze({
      confirmed,
      speculation
    })
  });
}

export function toggleQuestCompletion(state, questId, asOfTime = null) {
  const check = validateTwinState(state);
  if (!check.ok) return { ok: false, error: 'Invalid twin state: ' + check.error };
  if (typeof questId !== 'string' || !questId.trim()) return { ok: false, error: 'questId must be a non-empty string' };
  const qId = questId.trim();
  const currentQuests = check.value.quests;
  const index = currentQuests.findIndex((q) => q.id === qId);
  if (index === -1) return { ok: false, error: 'Quest not found: ' + qId };

  let timeStr;
  if (asOfTime === null || asOfTime === undefined) {
    timeStr = new Date().toISOString();
  } else if (typeof asOfTime === 'string') {
    if (!ISO_RE.test(asOfTime) || isNaN(Date.parse(asOfTime))) {
      return { ok: false, error: 'Invalid asOfTime ISO date string' };
    }
    timeStr = asOfTime;
  } else if (asOfTime instanceof Date) {
    if (isNaN(asOfTime.getTime())) {
      return { ok: false, error: 'Invalid asOfTime provided' };
    }
    timeStr = asOfTime.toISOString();
  } else {
    return { ok: false, error: 'Invalid asOfTime provided' };
  }

  const existing = currentQuests[index];
  const nextCompleted = !existing.completed;
  const updatedQuest = {
    ...existing,
    completed: nextCompleted,
    completed_at: nextCompleted ? timeStr : null
  };

  const nextQuests = currentQuests.map((q, idx) => (idx === index ? updatedQuest : q));
  const nextState = {
    ...check.value,
    quests: nextQuests
  };
  return { ok: true, state: nextState, completed: nextCompleted };
}

export function summarizeQuests(quests) {
  if (!Array.isArray(quests)) {
    return Object.freeze({
      total: 0,
      completed: 0,
      pending: 0,
      focus_pending: 0,
      by_category: Object.freeze({})
    });
  }
  let total = 0;
  let completed = 0;
  let pending = 0;
  let focus_pending = 0;
  const byCategory = {};
  for (const cat of ALLOWED_QUEST_CATEGORIES) {
    byCategory[cat] = 0;
  }
  for (const q of quests) {
    if (q && typeof q === 'object' && !Array.isArray(q)) {
      const cat = typeof q.category === 'string' ? q.category.trim().toLowerCase() : '';
      if (ALLOWED_QUEST_CATEGORIES.includes(cat)) {
        total++;
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        if (q.completed === true) {
          completed++;
        } else {
          pending++;
          if (q.priority === 1) {
            focus_pending++;
          }
        }
      }
    }
  }
  return Object.freeze({
    total,
    completed,
    pending,
    focus_pending,
    by_category: Object.freeze(byCategory)
  });
}

export function filterActiveQuests(quests, limit = 3) {
  if (!Array.isArray(quests)) return [];
  const safeLimit = typeof limit === 'number' && Number.isInteger(limit) && limit >= 0 ? limit : 3;
  if (safeLimit === 0) return [];
  return quests
    .filter((q) => q && typeof q === 'object' && q.completed === false && typeof q.title === 'string' && q.title.trim())
    .sort((a, b) => {
      const pA = typeof a.priority === 'number' && Number.isFinite(a.priority) ? a.priority : 2;
      const pB = typeof b.priority === 'number' && Number.isFinite(b.priority) ? b.priority : 2;
      if (pA !== pB) {
        return pA - pB;
      }
      const atA = typeof a.at === 'string' ? a.at : '';
      const atB = typeof b.at === 'string' ? b.at : '';
      const cmpAt = atA.localeCompare(atB);
      if (cmpAt !== 0) return cmpAt;
      const idA = typeof a.id === 'string' ? a.id : '';
      const idB = typeof b.id === 'string' ? b.id : '';
      return idA.localeCompare(idB);
    })
    .slice(0, safeLimit);
}

export function updateValuePreference(state, dimension, score) {
  const check = validateTwinState(state);
  if (!check.ok) return { ok: false, error: 'Invalid twin state: ' + check.error };
  if (typeof dimension !== 'string') return { ok: false, error: 'Dimension must be a string' };
  const cleanDim = dimension.trim().toLowerCase();
  if (!ALLOWED_VALUE_DIMENSIONS.includes(cleanDim)) {
    return { ok: false, error: `Dimension must be one of: ${ALLOWED_VALUE_DIMENSIONS.join(', ')}` };
  }
  if (typeof score !== 'number' || typeof score === 'boolean' || !Number.isFinite(score) || score < 1 || score > 5) {
    return { ok: false, error: 'Score must be a finite number between 1 and 5' };
  }
  const rounded = Math.round(score);
  const nextValues = {
    ...check.value.values,
    [cleanDim]: rounded
  };
  const nextState = {
    ...check.value,
    values: nextValues
  };
  return { ok: true, state: nextState, dimension: cleanDim, score: rounded };
}

export function calculateValueAlignment(values, actionDimensions) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return Object.freeze({ alignment: 0.0, matched_dimensions: Object.freeze([]) });
  }
  if (!Array.isArray(actionDimensions) || actionDimensions.length === 0) {
    return Object.freeze({ alignment: 0.0, matched_dimensions: Object.freeze([]) });
  }
  const cleanDims = actionDimensions
    .map((d) => (typeof d === 'string' ? d.trim().toLowerCase() : ''))
    .filter((d) => ALLOWED_VALUE_DIMENSIONS.includes(d));
  if (cleanDims.length === 0) {
    return Object.freeze({ alignment: 0.0, matched_dimensions: Object.freeze([]) });
  }
  let totalScore = 0;
  for (const d of cleanDims) {
    const s = typeof values[d] === 'number' && Number.isFinite(values[d]) ? values[d] : 3;
    totalScore += s;
  }
  const alignment = Math.round((totalScore / (cleanDims.length * 5.0)) * 100) / 100;
  return Object.freeze({
    alignment,
    matched_dimensions: Object.freeze(cleanDims)
  });
}

export function summarizeValues(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return Object.freeze({
      average_priority: 3.0,
      top_dimensions: Object.freeze([]),
      by_dimension: Object.freeze({})
    });
  }
  let sum = 0;
  let count = 0;
  const byDim = {};
  for (const dim of ALLOWED_VALUE_DIMENSIONS) {
    const val = typeof values[dim] === 'number' && Number.isFinite(values[dim]) ? values[dim] : 3;
    byDim[dim] = val;
    sum += val;
    count++;
  }
  const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 3.0;
  const sorted = [...ALLOWED_VALUE_DIMENSIONS].sort((a, b) => byDim[b] - byDim[a]);
  const maxVal = byDim[sorted[0]];
  const top = sorted.filter((d) => byDim[d] === maxVal);
  return Object.freeze({
    average_priority: avg,
    top_dimensions: Object.freeze(top),
    by_dimension: Object.freeze(byDim)
  });
}

/**
 * Consequential risk keywords representing irreversible, high-impact, or destructive operations.
 * Grounded in arXiv:2610.05163 boundary action auditing.
 */
export const CONSEQUENTIAL_RISK_KEYWORDS = Object.freeze([
  'transfer',
  'wire',
  'delete',
  'wipe',
  'export_all',
  'exfiltrate',
  'send_credentials',
  'override',
  'execute_script',
  'grant_admin',
  'drop_table',
  'kill_process'
]);

const CONSTRAINT_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'not', 'never', 'all', 'any', 'could', 'may', 'must',
  'from', 'into', 'that', 'this', 'have', 'has', 'had', 'are', 'was', 'were', 'will',
  'out', 'off', 'over', 'about', 'some', 'such'
]);

/**
 * Audits a pending action or tool call at the execution boundary before state mutation occurs.
 * Evaluates:
 * 1. Consequential risk keyword presence in action name, scope, or context.
 * 2. Conflicts with critical memory constraints (e.g. allergies, boundaries, emergency directives).
 * 3. Active grant coverage for the calling service and requested scope.
 *
 * Verdicts:
 * - 'pass': Action is authorized by active grant, free of consequential risks, and does not conflict with critical facts.
 * - 'require_confirmation': Action is ungranted or touches consequential keywords, but does not violate critical constraints.
 * - 'block': Action contradicts a critical constraint, or combines high consequential risk with missing authorization.
 *
 * Fails closed on invalid twin state or malformed request parameters.
 *
 * @param {object} state Current validated twin state
 * @param {object} request Action request { who: string, action: string, scope?: string, context?: string }
 * @param {string|Date|number|null} asOfTime Evaluation timestamp (default: current time)
 * @returns {object} Deeply frozen boundary audit result
 */
export function auditBoundaryAction(state, request, asOfTime = null) {
  const check = validateTwinState(state);
  if (!check.ok) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      reasons: Object.freeze(['Invalid twin state: ' + check.error]),
      matched_constraints: Object.freeze([])
    });
  }

  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      reasons: Object.freeze(['Request must be a non-null object']),
      matched_constraints: Object.freeze([])
    });
  }

  const keys = Object.keys(request);
  if (keys.some((k) => k !== 'who' && k !== 'action' && k !== 'scope' && k !== 'context')) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      reasons: Object.freeze(['Request contains unknown fields']),
      matched_constraints: Object.freeze([])
    });
  }

  const { who, action, scope, context } = request;
  if (typeof who !== 'string' || !who.trim() || who.trim().length > 60) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      reasons: Object.freeze(['Service identifier (who) must be a non-empty string up to 60 characters']),
      matched_constraints: Object.freeze([])
    });
  }
  if (typeof action !== 'string' || !action.trim() || action.trim().length > 100) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      reasons: Object.freeze(['Action description must be a non-empty string up to 100 characters']),
      matched_constraints: Object.freeze([])
    });
  }
  if (scope !== undefined && scope !== null) {
    if (typeof scope !== 'string' || scope.trim().length > 80) {
      return Object.freeze({
        allowed: false,
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze(['Scope must be a string up to 80 characters']),
        matched_constraints: Object.freeze([])
      });
    }
  }
  if (context !== undefined && context !== null) {
    if (typeof context !== 'string' || context.trim().length > 200) {
      return Object.freeze({
        allowed: false,
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze(['Context must be a string up to 200 characters']),
        matched_constraints: Object.freeze([])
      });
    }
  }

  if (asOfTime !== null && asOfTime !== undefined) {
    let testMs;
    if (typeof asOfTime === 'string') {
      testMs = Date.parse(asOfTime);
    } else if (asOfTime instanceof Date) {
      testMs = asOfTime.getTime();
    } else if (typeof asOfTime === 'number' && Number.isFinite(asOfTime)) {
      testMs = asOfTime;
    } else {
      return Object.freeze({
        allowed: false,
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze(['Invalid asOfTime parameter']),
        matched_constraints: Object.freeze([])
      });
    }
    if (isNaN(testMs)) {
      return Object.freeze({
        allowed: false,
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze(['Invalid asOfTime parameter']),
        matched_constraints: Object.freeze([])
      });
    }
  }

  const cleanWho = who.trim().toLowerCase();
  const cleanAction = action.trim();
  const cleanScope = typeof scope === 'string' && scope.trim() ? scope.trim().toLowerCase() : null;
  const cleanContext = typeof context === 'string' && context.trim() ? context.trim() : null;

  const reasons = [];
  const matchedConstraints = [];
  let isHighRisk = false;

  // 1. Consequential risk keyword scan
  const actionText = `${cleanAction} ${cleanScope || ''} ${cleanContext || ''}`.toLowerCase();
  const actionTokens = extractWords(actionText);
  const foundKeywords = [];

  for (const kw of CONSEQUENTIAL_RISK_KEYWORDS) {
    if (kw.includes('_')) {
      if (actionText.includes(kw)) {
        foundKeywords.push(kw);
      }
    } else {
      if (actionTokens.includes(kw)) {
        foundKeywords.push(kw);
      }
    }
  }

  if (foundKeywords.length > 0) {
    isHighRisk = true;
    reasons.push(`Action contains consequential risk keyword(s): ${foundKeywords.join(', ')}`);
  }

  // 2. Critical memory constraints scan
  const criticalFacts = filterCriticalFacts(check.value.facts);
  for (const fact of criticalFacts) {
    const factTokens = extractWords(fact.statement.toLowerCase())
      .filter((w) => w.length >= 3 && !CONSTRAINT_STOP_WORDS.has(w));
    const overlappingTokens = factTokens.filter((token) => actionTokens.includes(token));
    if (overlappingTokens.length > 0) {
      matchedConstraints.push(fact);
      reasons.push(`Action touches critical constraint: "${fact.statement}" (matched: ${overlappingTokens.join(', ')})`);
    }
  }

  // 3. Grant coverage evaluation
  const effectiveScope = cleanScope || cleanAction.toLowerCase();
  const accessResult = evaluateAccessRequest(check.value, cleanWho, effectiveScope, asOfTime);
  const hasActiveGrant = accessResult.allowed;
  if (!hasActiveGrant) {
    reasons.push(`Boundary check: no active grant covering "${effectiveScope}" for ${cleanWho}`);
  }

  // 4. Synthesize verdict
  let verdict;
  let allowed = false;
  let riskLevel = 'low';

  if (matchedConstraints.length > 0) {
    verdict = 'block';
    riskLevel = 'high';
    allowed = false;
  } else if (isHighRisk && !hasActiveGrant) {
    verdict = 'block';
    riskLevel = 'high';
    allowed = false;
  } else if (isHighRisk || !hasActiveGrant) {
    verdict = 'require_confirmation';
    riskLevel = isHighRisk ? 'high' : 'medium';
    allowed = false;
  } else {
    verdict = 'pass';
    riskLevel = 'low';
    allowed = true;
    reasons.push(`Action authorized by active grant for ${cleanWho}`);
  }

  return Object.freeze({
    allowed,
    verdict,
    risk_level: riskLevel,
    reasons: Object.freeze(reasons),
    matched_constraints: Object.freeze(matchedConstraints)
  });
}

/**
 * Summarize an array of boundary action audit results.
 * Fail-closed on invalid input.
 *
 * @param {object[]} audits Array of audit results
 * @returns {object} Deeply frozen summary
 */
export function summarizeBoundaryAudits(audits) {
  if (!Array.isArray(audits)) {
    return Object.freeze({
      total: 0,
      pass: 0,
      block: 0,
      require_confirmation: 0,
      high_risk: 0
    });
  }

  let pass = 0;
  let block = 0;
  let requireConfirmation = 0;
  let highRisk = 0;
  let validCount = 0;

  for (const a of audits) {
    if (!a || typeof a !== 'object') continue;
    validCount++;
    if (a.verdict === 'pass') pass++;
    else if (a.verdict === 'block') block++;
    else if (a.verdict === 'require_confirmation') requireConfirmation++;

    if (a.risk_level === 'high') highRisk++;
  }

  return Object.freeze({
    total: validCount,
    pass,
    block,
    require_confirmation: requireConfirmation,
    high_risk: highRisk
  });
}

/**
 * Estimate the token count for a text string deterministically.
 * Standard edge heuristic: ~3.6 characters per token for English text.
 * Fail-closed on invalid inputs.
 *
 * @param {string} text Text to estimate
 * @returns {number} Estimated token count (integer >= 0)
 */
export function estimateTokenCount(text) {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 3.6));
}

/**
 * Compute a deterministic 14-hex-character fingerprint for a text prefix.
 * Enables cache-awareness for repeated prompt prefixes on local runtimes.
 *
 * @param {string} text
 * @returns {string} 14-character hex string
 */
export function computeContextFingerprint(text) {
  if (typeof text !== 'string' || text.length === 0) return '00000000000000';
  let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

/**
 * Assemble a token-budgeted prompt context from the twin's local state.
 * Multi-phase packing order:
 *   Phase 1: System prompt & boundary instructions (mandatory)
 *   Phase 2: Safety-critical constraints & emergency facts (mandatory, fails closed if exceeded)
 *   Phase 3: Active obligations (overdue/urgent first)
 *   Phase 4: Focus quests (priority 1 focus first)
 *   Phase 5: Confirmed facts (prioritizing topic focus if provided)
 *   Phase 6: Recent twin activity events (newest first)
 *
 * Fail-closed:
 *   - Invalid budget or state returns fail-closed error
 *   - Critical constraints MUST fit within budget; if they exceed budget, returns error
 *     rather than silently compressing safety constraints away.
 *
 * @param {object} twinState Validated or unvalidated twin state
 * @param {object} options Configuration options
 * @returns {object} Deeply frozen assembled context result
 */
export function assembleTokenBudgetedContext(twinState, options = {}) {
  const validation = validateTwinState(twinState);
  if (!validation.ok) {
    return Object.freeze({
      ok: false,
      error: 'invalid_twin_state',
      reason: 'Twin state failed validation: ' + (validation.error || 'unknown'),
      context_text: '',
      total_estimated_tokens: 0,
      budget_tokens: 0,
      remaining_tokens: 0,
      sections_included: Object.freeze([]),
      items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
      truncated_sections: Object.freeze([]),
      prefix_fingerprint: '00000000000000'
    });
  }
  const state = validation.value;

  if (typeof options !== 'object' || options === null || Array.isArray(options)) {
    return Object.freeze({
      ok: false,
      error: 'invalid_options',
      reason: 'Options must be a non-null object',
      context_text: '',
      total_estimated_tokens: 0,
      budget_tokens: 0,
      remaining_tokens: 0,
      sections_included: Object.freeze([]),
      items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
      truncated_sections: Object.freeze([]),
      prefix_fingerprint: '00000000000000'
    });
  }

  const ALLOWED_CONTEXT_OPTIONS = new Set([
    'budget_tokens',
    'system_prompt',
    'as_of_date',
    'topic_focus',
    'include_obligations',
    'include_quests',
    'include_facts',
    'include_recent_events',
    'max_events'
  ]);

  for (const k of Object.keys(options)) {
    if (!ALLOWED_CONTEXT_OPTIONS.has(k)) {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: `Unknown field in options: "${k}"`,
        context_text: '',
        total_estimated_tokens: 0,
        budget_tokens: 0,
        remaining_tokens: 0,
        sections_included: Object.freeze([]),
        items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
        truncated_sections: Object.freeze([]),
        prefix_fingerprint: '00000000000000'
      });
    }
  }

  if (options.system_prompt !== undefined) {
    if (typeof options.system_prompt !== 'string' || options.system_prompt.length > 2000) {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: 'system_prompt must be a string up to 2000 characters',
        context_text: '',
        total_estimated_tokens: 0,
        budget_tokens: 0,
        remaining_tokens: 0,
        sections_included: Object.freeze([]),
        items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
        truncated_sections: Object.freeze([]),
        prefix_fingerprint: '00000000000000'
      });
    }
  }

  if (options.as_of_date !== undefined && options.as_of_date !== null) {
    let validDate = false;
    if (typeof options.as_of_date === 'string') {
      const parsed = Date.parse(options.as_of_date);
      validDate = !isNaN(parsed);
    } else if (options.as_of_date instanceof Date) {
      validDate = !isNaN(options.as_of_date.getTime());
    }
    if (!validDate) {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: 'as_of_date must be a valid ISO date string or Date object',
        context_text: '',
        total_estimated_tokens: 0,
        budget_tokens: 0,
        remaining_tokens: 0,
        sections_included: Object.freeze([]),
        items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
        truncated_sections: Object.freeze([]),
        prefix_fingerprint: '00000000000000'
      });
    }
  }

  if (options.topic_focus !== undefined) {
    if (!Array.isArray(options.topic_focus) || options.topic_focus.some(t => typeof t !== 'string' || !t.trim())) {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: 'topic_focus must be an array of non-empty strings',
        context_text: '',
        total_estimated_tokens: 0,
        budget_tokens: 0,
        remaining_tokens: 0,
        sections_included: Object.freeze([]),
        items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
        truncated_sections: Object.freeze([]),
        prefix_fingerprint: '00000000000000'
      });
    }
  }

  for (const flag of ['include_obligations', 'include_quests', 'include_facts', 'include_recent_events']) {
    if (options[flag] !== undefined && typeof options[flag] !== 'boolean') {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: `${flag} must be a boolean`,
        context_text: '',
        total_estimated_tokens: 0,
        budget_tokens: 0,
        remaining_tokens: 0,
        sections_included: Object.freeze([]),
        items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
        truncated_sections: Object.freeze([]),
        prefix_fingerprint: '00000000000000'
      });
    }
  }

  if (options.max_events !== undefined) {
    if (!Number.isInteger(options.max_events) || options.max_events <= 0) {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: 'max_events must be a positive integer',
        context_text: '',
        total_estimated_tokens: 0,
        budget_tokens: 0,
        remaining_tokens: 0,
        sections_included: Object.freeze([]),
        items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
        truncated_sections: Object.freeze([]),
        prefix_fingerprint: '00000000000000'
      });
    }
  }

  const rawBudget = options.budget_tokens !== undefined ? options.budget_tokens : 2048;
  if (!Number.isInteger(rawBudget) || rawBudget < 64 || rawBudget > 32768) {
    return Object.freeze({
      ok: false,
      error: 'invalid_budget',
      reason: 'budget_tokens must be an integer between 64 and 32768',
      context_text: '',
      total_estimated_tokens: 0,
      budget_tokens: 0,
      remaining_tokens: 0,
      sections_included: Object.freeze([]),
      items_packed: Object.freeze({ critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 }),
      truncated_sections: Object.freeze([]),
      prefix_fingerprint: '00000000000000'
    });
  }
  const budget = rawBudget;

  const systemPrompt = typeof options.system_prompt === 'string' && options.system_prompt.trim().length > 0
    ? options.system_prompt.trim()
    : "You are a personal twin assistant operating strictly within the person's local browser device.";

  const asOfDate = options.as_of_date || null;
  const topicFocus = Array.isArray(options.topic_focus)
    ? options.topic_focus.map(t => t.trim().toLowerCase())
    : [];

  const sectionsIncluded = [];
  const truncatedSections = [];
  const itemsPacked = { critical_facts: 0, obligations: 0, quests: 0, facts: 0, events: 0 };
  const assembledParts = [];

  // Phase 1: System prompt & boundary instructions
  const sysSection = `### System Instructions\n${systemPrompt}\n`;
  const sysTokens = estimateTokenCount(sysSection);
  if (sysTokens > budget) {
    return Object.freeze({
      ok: false,
      error: 'budget_exceeded_by_system_prompt',
      reason: `System prompt requires ${sysTokens} tokens which exceeds the budget of ${budget}`,
      context_text: '',
      total_estimated_tokens: sysTokens,
      budget_tokens: budget,
      remaining_tokens: 0,
      sections_included: Object.freeze([]),
      items_packed: Object.freeze({ ...itemsPacked }),
      truncated_sections: Object.freeze(['system']),
      prefix_fingerprint: '00000000000000'
    });
  }
  assembledParts.push(sysSection);
  sectionsIncluded.push('system');

  // Phase 2: Safety-Critical Constraints (allergies, medical, boundaries)
  const criticalFacts = (state.facts || []).filter(f => f && f.critical === true);

  if (criticalFacts.length > 0) {
    const critLines = ['### Safety-Critical Constraints'];
    for (const f of criticalFacts) {
      critLines.push(`- [CRITICAL ${f.category ? f.category.toUpperCase() : 'CONSTRAINT'}] ${f.statement}`);
    }
    const critSection = critLines.join('\n') + '\n';
    const candidateParts = [sysSection, critSection];
    const candidateTokens = estimateTokenCount(candidateParts.join('\n'));

    if (candidateTokens > budget) {
      return Object.freeze({
        ok: false,
        error: 'budget_exceeded_by_critical_constraints',
        reason: `Safety-critical constraints require ${estimateTokenCount(critSection)} tokens; total ${candidateTokens} exceeds budget of ${budget}. Critical memory constraints cannot be silently dropped.`,
        context_text: '',
        total_estimated_tokens: candidateTokens,
        budget_tokens: budget,
        remaining_tokens: 0,
        sections_included: Object.freeze([...sectionsIncluded]),
        items_packed: Object.freeze({ ...itemsPacked }),
        truncated_sections: Object.freeze(['critical_facts']),
        prefix_fingerprint: '00000000000000'
      });
    }

    assembledParts.push(critSection);
    sectionsIncluded.push('critical_facts');
    itemsPacked.critical_facts = criticalFacts.length;
  }

  // Exact prefix string matching assembledParts
  const prefixTextForFingerprint = assembledParts.join('\n');
  const prefixFingerprint = computeContextFingerprint(prefixTextForFingerprint);

  function tryPackSection(sectionName, headerTitle, items, formatFn, itemCounterKey) {
    if (!items || items.length === 0) return;
    const header = `### ${headerTitle}\n`;
    
    // Check if the header alone fits in the assembled context
    if (estimateTokenCount([...assembledParts, header].join('\n')) > budget) {
      truncatedSections.push(sectionName);
      return;
    }

    const packedLines = [];
    let hadTruncation = false;

    for (const item of items) {
      const line = formatFn(item);
      const candidateLines = [...packedLines, line];
      const candidateSection = header + candidateLines.join('\n') + '\n';
      const candidateTokens = estimateTokenCount([...assembledParts, candidateSection].join('\n'));

      if (candidateTokens <= budget) {
        packedLines.push(line);
        itemsPacked[itemCounterKey] = (itemsPacked[itemCounterKey] || 0) + 1;
      } else {
        hadTruncation = true;
      }
    }

    if (packedLines.length > 0) {
      assembledParts.push(header + packedLines.join('\n') + '\n');
      sectionsIncluded.push(sectionName);
    }
    if (hadTruncation || packedLines.length === 0) {
      truncatedSections.push(sectionName);
    }
  }

  // Phase 3: Active Obligations
  if (options.include_obligations !== false && Array.isArray(state.obligations) && state.obligations.length > 0) {
    const activeObs = state.obligations
      .filter(o => o && o.status === 'active')
      .map(o => {
        let urgency = { days_remaining: 999, is_overdue: false, is_due: false, is_urgent: false };
        try { urgency = calculateObligationUrgency(o, asOfDate); } catch (e) { /* ignore */ }
        return { obligation: o, urgency };
      });

    activeObs.sort((a, b) => {
      if (a.urgency.is_overdue !== b.urgency.is_overdue) return a.urgency.is_overdue ? -1 : 1;
      if (a.urgency.is_due !== b.urgency.is_due) return a.urgency.is_due ? -1 : 1;
      if (a.urgency.is_urgent !== b.urgency.is_urgent) return a.urgency.is_urgent ? -1 : 1;
      return a.urgency.days_remaining - b.urgency.days_remaining;
    });

    tryPackSection(
      'obligations',
      'Active Obligations & Deadlines',
      activeObs,
      ({ obligation: o, urgency: u }) => {
        const urgLabel = u.is_overdue ? 'OVERDUE' : u.is_due ? 'DUE TODAY' : u.is_urgent ? 'URGENT' : `${u.days_remaining}d`;
        const noteStr = o.notes ? ` - ${o.notes}` : '';
        return `- [${urgLabel}] ${o.title} (due ${o.due_date})${noteStr}`;
      },
      'obligations'
    );
  }

  // Phase 4: Focus Quests
  if (options.include_quests !== false && Array.isArray(state.quests) && state.quests.length > 0) {
    const activeQuests = state.quests
      .filter(q => q && !q.completed)
      .sort((a, b) => (a.priority || 2) - (b.priority || 2));

    tryPackSection(
      'quests',
      'Daily Quests & Priorities',
      activeQuests,
      q => {
        const pLabel = q.priority === 1 ? 'FOCUS' : `P${q.priority}`;
        return `- [${pLabel} ${q.category ? q.category.toUpperCase() : 'QUEST'}] ${q.title}`;
      },
      'quests'
    );
  }

  // Phase 5: Confirmed non-critical facts
  if (options.include_facts !== false && Array.isArray(state.facts) && state.facts.length > 0) {
    const nonCriticalFacts = state.facts.filter(f => f && f.critical !== true);
    if (topicFocus.length > 0) {
      nonCriticalFacts.sort((a, b) => {
        const aText = ((a.statement || '') + ' ' + (a.category || '')).toLowerCase();
        const bText = ((b.statement || '') + ' ' + (b.category || '')).toLowerCase();
        const aMatches = topicFocus.some(t => aText.includes(t)) ? 1 : 0;
        const bMatches = topicFocus.some(t => bText.includes(t)) ? 1 : 0;
        return bMatches - aMatches;
      });
    }

    tryPackSection(
      'facts',
      'Contextual Facts & Preferences',
      nonCriticalFacts,
      f => `- [${f.category ? f.category.toUpperCase() : 'FACT'}] ${f.statement}`,
      'facts'
    );
  }

  // Phase 6: Recent Twin Events
  if (options.include_recent_events !== false && Array.isArray(state.events) && state.events.length > 0) {
    const maxEvents = Number.isInteger(options.max_events) && options.max_events > 0 ? options.max_events : 5;
    const recentEvents = state.events.slice(-maxEvents).reverse();

    tryPackSection(
      'events',
      'Recent Local Activity',
      recentEvents,
      e => {
        const ts = typeof e.at === 'string' ? e.at.slice(11, 19) : '';
        return `- [${ts || 'event'}] ${e.type}: ${e.detail}`;
      },
      'events'
    );
  }

  const finalContext = assembledParts.join('\n');
  const finalTokens = estimateTokenCount(finalContext);

  return Object.freeze({
    ok: true,
    context_text: finalContext,
    total_estimated_tokens: finalTokens,
    budget_tokens: budget,
    remaining_tokens: Math.max(0, budget - finalTokens),
    sections_included: Object.freeze([...sectionsIncluded]),
    items_packed: Object.freeze({ ...itemsPacked }),
    truncated_sections: Object.freeze([...truncatedSections]),
    prefix_fingerprint: prefixFingerprint
  });
}


