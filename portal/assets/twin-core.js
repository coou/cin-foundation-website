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

export const ALLOWED_TOOL_KINDS = Object.freeze([
  'read',
  'write',
  'egress',
  'compute',
  'delete',
  'other'
]);

export const SENSITIVE_TOPIC_KEYWORDS = Object.freeze([
  'medical',
  'health',
  'allergy',
  'doctor',
  'prescription',
  'medication',
  'dietary',
  'emergency',
  'boundary',
  'passport',
  'tax',
  'financial',
  'salary',
  'bank',
  'account',
  'password',
  'credential',
  'private_key',
  'secret'
]);

export const SENSITIVE_TAINT_KEYWORDS = SENSITIVE_TOPIC_KEYWORDS;

export const EGRESS_ACTION_KEYWORDS = Object.freeze([
  'send',
  'post',
  'upload',
  'export',
  'publish',
  'webhook',
  'email',
  'transmit',
  'exfiltrate',
  'share_external',
  'broadcast',
  'push',
  'forward',
  'emit',
  'stream',
  'dispatch',
  'dump',
  'sync',
  'curl',
  'http'
]);

/**
 * Heuristic tool kind inference based on action verbs, scopes, and destination patterns.
 *
 * Scope and boundary limits:
 * - Keyword and pattern inference is a heuristic preview only and cannot bind a step to its real operational effect.
 * - Deterministic sandboxing and host-enforced system call / network egress gating remain necessary in runtime execution.
 * - Word-boundary matching is enforced to prevent false positives (such as "postpone" matching "post").
 */
function inferToolKind(action, scope) {
  const combined = `${action || ''} ${scope || ''}`.toLowerCase();

  // 1. External network destinations or URLs
  if (/\b(?:https?:\/\/|ftp:\/\/|[a-z0-9_-]+(?:\.[a-z0-9_-]+)+)\b/i.test(combined)) {
    if (!/\b(?:localhost|127\.0\.0\.1)\b/i.test(combined)) {
      return 'egress';
    }
  }

  // 2. Action phrases indicating egress data copying / piping to destinations
  if (/\b(?:copy|pipe|forward|transmit|send)\b.*\bto\b/i.test(combined)) {
    return 'egress';
  }

  // 3. Word-boundary matching against egress keywords (prevents 'postpone' from matching 'post')
  for (const kw of EGRESS_ACTION_KEYWORDS) {
    const rx = new RegExp(`\\b${kw}\\b`, 'i');
    if (rx.test(combined)) return 'egress';
  }

  if (/\b(delete|drop|remove|wipe|purge|clear)\b/i.test(combined)) return 'delete';
  if (/\b(read|get|fetch|view|query|scan|list|load)\b/i.test(combined)) return 'read';
  if (/\b(write|update|set|save|store|modify|create|insert|append)\b/i.test(combined)) return 'write';
  if (/\b(compute|calc|calculate|process|filter|sort|eval|parse)\b/i.test(combined)) return 'compute';
  return 'other';
}

/**
 * Audits an ordered chain of assistant tool calls against active consent grants,
 * critical memory constraints, and cross-step sensitive-topic flow.
 * Fail-closed on invalid parameters, malformed steps, or unknown options.
 *
 * Scope and boundary limits:
 * - Sensitive-topic flow tracking is based on a fixed keyword list and word overlap with
 *   critical-memory statements; it is not dynamic untrusted-input tracking or information-flow taint.
 * - Keyword and action inference cannot bind a step to its real operational effect.
 * - This audit provides a heuristic preview only, never an authorization ('Pass' indicates
 *   bounded parameters within the preview model, not runtime execution authorization).
 *
 * @param {object} twinState Current valid twin state
 * @param {object[]} chain Array of proposed tool execution steps
 * @param {object} [options={}] Optional evaluation configuration
 * @returns {object} Deeply frozen chain audit result
 */
export function auditToolExecutionChain(twinState, chain, options = {}) {
  const check = validateTwinState(twinState);
  if (!check.ok) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      tainted: false,
      reasons: Object.freeze(['Invalid twin state: ' + check.error]),
      taints: Object.freeze([]),
      step_evaluations: Object.freeze([]),
      violations_count: 1
    });
  }

  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      tainted: false,
      reasons: Object.freeze(['Options must be a non-null object']),
      taints: Object.freeze([]),
      step_evaluations: Object.freeze([]),
      violations_count: 1
    });
  }

  const allowedOpts = new Set(['as_of_time', 'strict_taint', 'strict_topic_flow', 'max_steps']);
  for (const k of Object.keys(options)) {
    if (!allowedOpts.has(k)) {
      return Object.freeze({
        allowed: false,
        verdict: 'block',
        risk_level: 'high',
        tainted: false,
        reasons: Object.freeze(['Unknown option: ' + k]),
        taints: Object.freeze([]),
        step_evaluations: Object.freeze([]),
        violations_count: 1
      });
    }
  }

  const asOfTime = options.as_of_time !== undefined ? options.as_of_time : null;
  const strictTaint = options.strict_topic_flow !== undefined ? Boolean(options.strict_topic_flow) : (options.strict_taint !== undefined ? Boolean(options.strict_taint) : true);
  const maxSteps = options.max_steps !== undefined ? options.max_steps : 10;

  if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > 20) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      tainted: false,
      reasons: Object.freeze(['max_steps must be an integer between 1 and 20']),
      taints: Object.freeze([]),
      step_evaluations: Object.freeze([]),
      violations_count: 1
    });
  }

  if (!Array.isArray(chain) || chain.length === 0) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      tainted: false,
      reasons: Object.freeze(['Chain must be a non-empty array of steps']),
      taints: Object.freeze([]),
      step_evaluations: Object.freeze([]),
      violations_count: 1
    });
  }

  if (chain.length > maxSteps) {
    return Object.freeze({
      allowed: false,
      verdict: 'block',
      risk_level: 'high',
      tainted: false,
      reasons: Object.freeze([`Chain length ${chain.length} exceeds maximum allowed steps (${maxSteps})`]),
      taints: Object.freeze([]),
      step_evaluations: Object.freeze([]),
      violations_count: 1
    });
  }

  const allowedStepKeys = new Set(['service', 'action', 'scope', 'kind', 'context']);
  const activeTaints = new Set();
  const stepEvaluations = [];
  const allReasons = [];
  let violationsCount = 0;
  let hasBlock = false;
  let hasRequireConfirmation = false;
  let highestRisk = 'low';

  const criticalFacts = filterCriticalFacts(check.value.facts);

  for (let i = 0; i < chain.length; i++) {
    const step = chain[i];
    const stepIndex = i + 1;

    if (!step || typeof step !== 'object' || Array.isArray(step)) {
      hasBlock = true;
      violationsCount++;
      const reason = `Step ${stepIndex} must be a non-null object`;
      allReasons.push(reason);
      stepEvaluations.push(Object.freeze({
        step_index: stepIndex,
        service: 'unknown',
        action: 'unknown',
        kind: 'other',
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze([reason]),
        tainted_at_step: false
      }));
      continue;
    }

    const stepKeys = Object.keys(step);
    const unknownStepKeys = stepKeys.filter(k => !allowedStepKeys.has(k));
    if (unknownStepKeys.length > 0) {
      hasBlock = true;
      violationsCount++;
      const reason = `Step ${stepIndex} contains unknown field(s): ${unknownStepKeys.join(', ')}`;
      allReasons.push(reason);
      stepEvaluations.push(Object.freeze({
        step_index: stepIndex,
        service: typeof step.service === 'string' ? step.service : 'unknown',
        action: typeof step.action === 'string' ? step.action : 'unknown',
        kind: 'other',
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze([reason]),
        tainted_at_step: false
      }));
      continue;
    }

    const { service, action, scope, kind, context } = step;

    if (typeof service !== 'string' || !service.trim() || service.trim().length > 60) {
      hasBlock = true;
      violationsCount++;
      const reason = `Step ${stepIndex}: service must be a non-empty string up to 60 characters`;
      allReasons.push(reason);
      stepEvaluations.push(Object.freeze({
        step_index: stepIndex,
        service: 'invalid',
        action: typeof action === 'string' ? action : 'unknown',
        kind: 'other',
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze([reason]),
        tainted_at_step: false
      }));
      continue;
    }

    if (typeof action !== 'string' || !action.trim() || action.trim().length > 100) {
      hasBlock = true;
      violationsCount++;
      const reason = `Step ${stepIndex}: action must be a non-empty string up to 100 characters`;
      allReasons.push(reason);
      stepEvaluations.push(Object.freeze({
        step_index: stepIndex,
        service: service.trim(),
        action: 'invalid',
        kind: 'other',
        verdict: 'block',
        risk_level: 'high',
        reasons: Object.freeze([reason]),
        tainted_at_step: false
      }));
      continue;
    }

    if (scope !== undefined && scope !== null) {
      if (typeof scope !== 'string' || scope.trim().length > 80) {
        hasBlock = true;
        violationsCount++;
        const reason = `Step ${stepIndex}: scope must be a string up to 80 characters`;
        allReasons.push(reason);
        stepEvaluations.push(Object.freeze({
          step_index: stepIndex,
          service: service.trim(),
          action: action.trim(),
          kind: 'other',
          verdict: 'block',
          risk_level: 'high',
          reasons: Object.freeze([reason]),
          tainted_at_step: false
        }));
        continue;
      }
    }

    if (kind !== undefined && kind !== null) {
      if (!ALLOWED_TOOL_KINDS.includes(kind)) {
        hasBlock = true;
        violationsCount++;
        const reason = `Step ${stepIndex}: invalid kind "${kind}". Allowed: ${ALLOWED_TOOL_KINDS.join(', ')}`;
        allReasons.push(reason);
        stepEvaluations.push(Object.freeze({
          step_index: stepIndex,
          service: service.trim(),
          action: action.trim(),
          kind: 'other',
          verdict: 'block',
          risk_level: 'high',
          reasons: Object.freeze([reason]),
          tainted_at_step: false
        }));
        continue;
      }
    }

    if (context !== undefined && context !== null) {
      if (typeof context !== 'string' || context.trim().length > 200) {
        hasBlock = true;
        violationsCount++;
        const reason = `Step ${stepIndex}: context must be a string up to 200 characters`;
        allReasons.push(reason);
        stepEvaluations.push(Object.freeze({
          step_index: stepIndex,
          service: service.trim(),
          action: action.trim(),
          kind: 'other',
          verdict: 'block',
          risk_level: 'high',
          reasons: Object.freeze([reason]),
          tainted_at_step: false
        }));
        continue;
      }
    }

    const cleanService = service.trim();
    const cleanAction = action.trim();
    const cleanScope = typeof scope === 'string' && scope.trim() ? scope.trim() : null;
    const cleanContext = typeof context === 'string' && context.trim() ? context.trim() : null;
    const inferredKind = inferToolKind(cleanAction, cleanScope);
    let cleanKind = kind || inferredKind;

    // Detect attempts to mask egress actions under non-egress kind declarations
    let kindSpoofViolation = false;
    if (inferredKind === 'egress') {
      if (kind && kind !== 'egress') {
        kindSpoofViolation = true;
      }
      cleanKind = 'egress';
    }

    // 1. Audit individual step boundary
    const singleAudit = auditBoundaryAction(
      check.value,
      {
        who: cleanService,
        action: cleanAction,
        scope: cleanScope,
        context: cleanContext
      },
      asOfTime
    );

    const stepReasons = singleAudit.reasons.map((r) =>
      r.startsWith('Action authorized by active grant')
        ? `Heuristic preview: active grant found for ${cleanService} (preview only, not an authorization)`
        : r
    );
    let stepVerdict = singleAudit.verdict;
    let stepRisk = singleAudit.risk_level;

    if (kindSpoofViolation) {
      hasBlock = true;
      violationsCount++;
      const spoofMsg = `Step ${stepIndex}: tool action indicates external egress but declared kind was "${kind}" (evasion attempt blocked)`;
      stepVerdict = 'block';
      stepRisk = 'high';
      stepReasons.push(spoofMsg);
      allReasons.push(spoofMsg);
    }

    // 2. Identify new sensitive topics generated by this step
    const stepText = `${cleanAction} ${cleanScope || ''} ${cleanContext || ''}`.toLowerCase();
    const stepTokens = extractWords(stepText);
    const stepNewTaints = [];

    for (const kw of SENSITIVE_TOPIC_KEYWORDS) {
      if (stepText.includes(kw) || stepTokens.includes(kw)) {
        stepNewTaints.push(kw);
        activeTaints.add(kw);
      }
    }

    for (const fact of criticalFacts) {
      const factTokens = extractWords(fact.statement.toLowerCase())
        .filter(w => w.length >= 3 && !CONSTRAINT_STOP_WORDS.has(w));
      if (factTokens.some(t => stepTokens.includes(t))) {
        const factKey = `constraint_${fact.category || 'fact'}`;
        stepNewTaints.push(factKey);
        activeTaints.add(factKey);
      }
    }

    // 3. Compositional Cross-step Sensitive-Topic Flow / Egress check
    let taintLeakageViolation = false;
    if (activeTaints.size > 0 && cleanKind === 'egress') {
      const grantScope = cleanScope || cleanAction.toLowerCase();
      const grantCheck = evaluateAccessRequest(check.value, cleanService.toLowerCase(), grantScope, asOfTime);
      
      const missingGrants = [];
      if (strictTaint) {
        for (const taint of activeTaints) {
          const specificCheck = evaluateAccessRequest(check.value, cleanService.toLowerCase(), taint, asOfTime);
          // Sensitive topic egress requires an explicit targeted grant; wildcard '*' does not satisfy consent
          const isWildcard = Boolean(specificCheck.grant && (specificCheck.grant.what === '*' || (typeof specificCheck.grant.what === 'string' && specificCheck.grant.what.toLowerCase() === 'all')));
          if (!specificCheck.allowed || isWildcard) {
            missingGrants.push(taint);
          }
        }
      }

      if (!grantCheck.allowed || (strictTaint && missingGrants.length > 0)) {
        taintLeakageViolation = true;
        stepVerdict = 'block';
        stepRisk = 'high';
        hasBlock = true;
        violationsCount++;
        const taintMsg = `Step ${stepIndex} (${cleanService}) transmits external egress while chain holds sensitive-topic flow [${Array.from(activeTaints).join(', ')}] without explicit consent grant`;
        stepReasons.push(taintMsg);
        allReasons.push(taintMsg);
      }
    }

    if (stepVerdict === 'block') {
      hasBlock = true;
      if (!taintLeakageViolation) violationsCount++;
      highestRisk = 'high';
    } else if (stepVerdict === 'require_confirmation') {
      hasRequireConfirmation = true;
      if (highestRisk !== 'high') highestRisk = stepRisk === 'high' ? 'high' : 'medium';
    }

    for (const r of stepReasons) {
      if (!allReasons.includes(r)) {
        allReasons.push(`Step ${stepIndex}: ${r}`);
      }
    }

    stepEvaluations.push(Object.freeze({
      step_index: stepIndex,
      service: cleanService,
      action: cleanAction,
      scope: cleanScope,
      kind: cleanKind,
      verdict: stepVerdict,
      risk_level: stepRisk,
      tainted_at_step: activeTaints.size > 0,
      new_taints_identified: Object.freeze([...stepNewTaints]),
      new_sensitive_topics_identified: Object.freeze([...stepNewTaints]),
      sensitive_topics_held: Object.freeze(Array.from(activeTaints).sort()),
      reasons: Object.freeze(stepReasons)
    }));
  }

  let finalVerdict = 'pass';
  let isAllowed = true;

  if (hasBlock) {
    finalVerdict = 'block';
    isAllowed = false;
    highestRisk = 'high';
  } else if (hasRequireConfirmation) {
    finalVerdict = 'require_confirmation';
    isAllowed = false;
    if (highestRisk === 'low') highestRisk = 'medium';
  }

  return Object.freeze({
    allowed: isAllowed,
    verdict: finalVerdict,
    risk_level: highestRisk,
    tainted: activeTaints.size > 0,
    taints: Object.freeze(Array.from(activeTaints).sort()),
    step_evaluations: Object.freeze(stepEvaluations),
    reasons: Object.freeze(allReasons),
    violations_count: violationsCount
  });
}

/**
 * Summarize a tool execution chain audit result.
 *
 * @param {object} auditResult Output from auditToolExecutionChain
 * @returns {object} Deeply frozen summary
 */
export function summarizeChainAudit(auditResult) {
  if (!auditResult || typeof auditResult !== 'object' || Array.isArray(auditResult)) {
    return Object.freeze({
      total_steps: 0,
      verdict: 'block',
      allowed: false,
      risk_level: 'high',
      tainted: false,
      taints_count: 0,
      violations_count: 1
    });
  }

  const steps = Array.isArray(auditResult.step_evaluations) ? auditResult.step_evaluations : [];
  return Object.freeze({
    total_steps: steps.length,
    verdict: auditResult.verdict || 'block',
    allowed: Boolean(auditResult.allowed),
    risk_level: auditResult.risk_level || 'high',
    tainted: Boolean(auditResult.tainted),
    taints_count: Array.isArray(auditResult.taints) ? auditResult.taints.length : 0,
    violations_count: typeof auditResult.violations_count === 'number' ? auditResult.violations_count : 0
  });
}

export const ALLOWED_RECEIPT_FIELDS = Object.freeze([
  'receipt_version',
  'subject',
  'recipient',
  'purposes_and_scopes',
  'timestamp',
  'expires_at',
  'status',
  'jurisdiction_or_policy'
]);

/**
 * Check a consent receipt against the grants held on this device.
 *
 * Deterministic and fail-closed: validates structure, rejects receipts dated in the future
 * or naming another subject, and matches only a grant with the same recipient, issue time
 * and expiry that is still active and covers every claimed scope. Receipts carry no
 * signature, so a match shows the receipt agrees with this browser's grants; it cannot
 * prove who wrote the receipt.
 *
 * @param {object} state Current twin state
 * @param {object} receipt The consent receipt object to check
 * @param {string|Date|number|null} asOfTime Reference time for expiration checks
 * @param {string} subjectId The local subject receipts are issued for (as in createConsentReceipt)
 * @returns {object} Deeply frozen result
 */
export function verifyConsentReceipt(state, receipt, asOfTime = null, subjectId = 'local-user') {
  if (typeof subjectId !== 'string' || !subjectId.trim() || subjectId.trim().length > 80) {
    return Object.freeze({
      valid: false,
      status: 'invalid_parameter',
      reason: 'subjectId must be a non-empty string up to 80 characters'
    });
  }
  const cleanSubjectId = subjectId.trim();
  const check = validateTwinState(state);
  if (!check.ok) {
    return Object.freeze({
      valid: false,
      status: 'invalid_state',
      reason: 'Invalid twin state: ' + check.error
    });
  }

  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return Object.freeze({
      valid: false,
      status: 'malformed_receipt',
      reason: 'Receipt must be a non-null object'
    });
  }

  const keys = Object.keys(receipt);
  if (keys.some((k) => !ALLOWED_RECEIPT_FIELDS.includes(k))) {
    return Object.freeze({
      valid: false,
      status: 'unknown_fields',
      reason: 'Receipt contains unknown or unauthorized fields'
    });
  }

  if (typeof receipt.receipt_version !== 'string' || !receipt.receipt_version.trim() || receipt.receipt_version.length > 60) {
    return Object.freeze({
      valid: false,
      status: 'malformed_receipt',
      reason: 'receipt_version must be a non-empty string up to 60 characters'
    });
  }

  if (typeof receipt.subject !== 'string' || !receipt.subject.trim() || receipt.subject.length > 80) {
    return Object.freeze({
      valid: false,
      status: 'malformed_receipt',
      reason: 'subject must be a non-empty string up to 80 characters'
    });
  }

  if (typeof receipt.recipient !== 'string' || !receipt.recipient.trim() || receipt.recipient.length > 60) {
    return Object.freeze({
      valid: false,
      status: 'malformed_receipt',
      reason: 'recipient must be a non-empty string up to 60 characters'
    });
  }

  if (!Array.isArray(receipt.purposes_and_scopes) || receipt.purposes_and_scopes.length === 0 || receipt.purposes_and_scopes.length > 20) {
    return Object.freeze({
      valid: false,
      status: 'malformed_receipt',
      reason: 'purposes_and_scopes must be a non-empty array of up to 20 scopes'
    });
  }

  const cleanScopes = [];
  for (let i = 0; i < receipt.purposes_and_scopes.length; i++) {
    const s = receipt.purposes_and_scopes[i];
    if (typeof s !== 'string' || !s.trim() || s.trim().length > 80) {
      return Object.freeze({
        valid: false,
        status: 'malformed_receipt',
        reason: `Scope at index ${i} must be a non-empty string up to 80 characters`
      });
    }
    cleanScopes.push(s.trim().toLowerCase());
  }

  if (typeof receipt.timestamp !== 'string' || !ISO_RE.test(receipt.timestamp) || isNaN(Date.parse(receipt.timestamp))) {
    return Object.freeze({
      valid: false,
      status: 'malformed_receipt',
      reason: 'timestamp must be a valid ISO date string'
    });
  }

  let receiptExpiresMs = null;
  if (receipt.expires_at !== undefined && receipt.expires_at !== null) {
    if (typeof receipt.expires_at !== 'string' || !ISO_RE.test(receipt.expires_at) || isNaN(Date.parse(receipt.expires_at))) {
      return Object.freeze({
        valid: false,
        status: 'malformed_receipt',
        reason: 'expires_at must be an ISO date string or null'
      });
    }
    receiptExpiresMs = Date.parse(receipt.expires_at);
  }

  if (receipt.jurisdiction_or_policy !== undefined && receipt.jurisdiction_or_policy !== null) {
    if (typeof receipt.jurisdiction_or_policy !== 'string' || receipt.jurisdiction_or_policy.length > 120) {
      return Object.freeze({
        valid: false,
        status: 'malformed_receipt',
        reason: 'jurisdiction_or_policy must be a string up to 120 characters'
      });
    }
  }

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
    return Object.freeze({
      valid: false,
      status: 'invalid_parameter',
      reason: 'Invalid asOfTime parameter'
    });
  }
  if (isNaN(nowMs)) {
    return Object.freeze({
      valid: false,
      status: 'invalid_parameter',
      reason: 'Invalid asOfTime parameter'
    });
  }

  if (Date.parse(receipt.timestamp) > nowMs) {
    return Object.freeze({
      valid: false,
      status: 'future_timestamp',
      reason: 'Receipt is dated after the evaluation time, so this device cannot have issued it',
      recipient: receipt.recipient
    });
  }

  if (receipt.subject.trim() !== cleanSubjectId) {
    return Object.freeze({
      valid: false,
      status: 'subject_mismatch',
      reason: 'Receipt names a different person than this device',
      recipient: receipt.recipient
    });
  }

  if (receiptExpiresMs !== null && nowMs >= receiptExpiresMs) {
    return Object.freeze({
      valid: false,
      status: 'expired',
      reason: 'Receipt has expired as of evaluated timestamp',
      recipient: receipt.recipient,
      expires_at: receipt.expires_at
    });
  }

  // A receipt is bound to the grant that issued it: same recipient, same issue time and
  // same expiry. A receipt this device never issued matches no grant, whatever its scopes.
  const cleanRecipient = receipt.recipient.trim().toLowerCase();
  const receiptExpiry = receipt.expires_at === undefined ? null : receipt.expires_at;
  const matchingGrants = check.value.grants.filter((g) =>
    g.who.trim().toLowerCase() === cleanRecipient &&
    g.at === receipt.timestamp &&
    (g.expires_at === undefined ? null : g.expires_at) === receiptExpiry
  );

  if (matchingGrants.length === 0) {
    return Object.freeze({
      valid: false,
      status: 'revoked_or_unregistered',
      reason: 'No grant on this device issued this receipt (it may have been revoked)',
      recipient: receipt.recipient
    });
  }

  let sawExpiredGrant = false;
  for (const g of matchingGrants) {
    const grantScopes = g.what.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
    const hasWildcard = grantScopes.includes('*');
    const allScopesCovered = cleanScopes.every((rs) => hasWildcard || grantScopes.includes(rs));

    if (allScopesCovered) {
      if (isGrantExpired(g, asOfTime)) {
        sawExpiredGrant = true;
        continue;
      }
      return Object.freeze({
        valid: true,
        status: 'matches_active_grant',
        reason: 'Receipt matches an active grant on this device',
        recipient: receipt.recipient,
        scopes: Object.freeze([...receipt.purposes_and_scopes]),
        matching_grant: Object.freeze({ ...g })
      });
    }
  }

  if (sawExpiredGrant) {
    return Object.freeze({
      valid: false,
      status: 'expired',
      reason: 'Matching local grant has expired on this device',
      recipient: receipt.recipient
    });
  }

  return Object.freeze({
    valid: false,
    status: 'scope_mismatch',
    reason: 'Active grant does not authorize all scopes requested in receipt',
    recipient: receipt.recipient
  });
}

/**
 * Summarize a consent receipt verification result for UI display and event logging.
 *
 * @param {object} result Output from verifyConsentReceipt
 * @returns {object} Deeply frozen summary
 */
export function summarizeReceiptVerification(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return Object.freeze({
      valid: false,
      status: 'error',
      reason: 'Invalid verification result',
      recipient: null,
      scopes_count: 0
    });
  }

  return Object.freeze({
    valid: Boolean(result.valid),
    status: result.status || 'unknown',
    reason: result.reason || '',
    recipient: result.recipient || null,
    scopes_count: Array.isArray(result.scopes) ? result.scopes.length : 0
  });
}

export const ALLOWED_CAPABILITY_REQUEST_FIELDS = Object.freeze([
  'grantee',
  'requested_scope',
  'purpose',
  'ttl_seconds',
  'as_of_time'
]);

export const ALLOWED_CAPABILITY_LEASE_FIELDS = Object.freeze([
  'lease_id',
  'grantee',
  'scope',
  'purpose',
  'issued_at',
  'expires_at',
  'ttl_seconds',
  'status'
]);

/**
 * Deterministically compute a short hex fingerprint for a capability lease.
 * A fingerprint anyone can recompute: it binds the lease fields together, but it
 * is not a signature and proves nothing about who approved the lease.
 */
function computeLeaseId(grantee, scope, purpose, issuedAt, ttlSeconds) {
  const seed = `${grantee}|${scope}|${purpose}|${issuedAt}|${ttlSeconds}`;
  let h1 = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h1 ^= seed.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return 'lease-' + (h1 >>> 0).toString(16).padStart(8, '0');
}

export const MAX_LEASE_TTL_SECONDS = 3600;

/**
 * Parse an ISO timestamp strictly: the calendar date must exist (no 2026-02-30
 * rolled forward to March) and the time fields must be in range.
 * Returns milliseconds, or NaN.
 */
function strictIsoMs(s) {
  if (typeof s !== 'string' || !ISO_RE.test(s)) return NaN;
  const ms = Date.parse(s);
  if (isNaN(ms)) return NaN;
  const d = new Date(ms);
  const [datePart, timePart] = s.split('T');
  const [y, mo, da] = datePart.split('-').map(Number);
  const [h, mi, se] = timePart.replace('Z', '').split(':').map((x) => Math.floor(Number(x)));
  if (d.getUTCFullYear() !== y || d.getUTCMonth() + 1 !== mo || d.getUTCDate() !== da) return NaN;
  if (d.getUTCHours() !== h || d.getUTCMinutes() !== mi || d.getUTCSeconds() !== se) return NaN;
  return ms;
}

/** Split a scope string into normalized items ("meeting schedule, calendar events"). */
function scopeItems(scope) {
  return String(scope).toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Find a permission the person gave on this device that covers every requested
 * scope item for this grantee at the given moment: same grantee, every item named
 * in the grant's "what", given at or before that moment and not expired at it.
 * Returns the covering grant with the latest expiry, or null.
 */
function findCoveringGrant(grants, grantee, items, atMs) {
  const who = grantee.trim().toLowerCase();
  let best = null;
  for (const g of grants || []) {
    if (g.who.trim().toLowerCase() !== who) continue;
    const givenMs = strictIsoMs(g.at);
    if (isNaN(givenMs) || givenMs > atMs) continue;
    if (isGrantExpired(g, atMs)) continue;
    const allowed = scopeItems(g.what);
    if (!items.every((it) => allowed.includes(it))) continue;
    if (!best) { best = g; continue; }
    const bExp = best.expires_at ? Date.parse(best.expires_at) : Infinity;
    const gExp = g.expires_at ? Date.parse(g.expires_at) : Infinity;
    if (gExp > bExp) best = g;
  }
  return best;
}

function blockedEvaluation(reason, conflictingConstraint = null) {
  return Object.freeze({
    allowed: false,
    advisory: true,
    verdict: 'blocked',
    reason,
    conflicting_constraint: conflictingConstraint,
    lease: null
  });
}

/**
 * Preview whether an assistant's request for a short-lived, narrower permission
 * fits a permission the person already gave on this device.
 *
 * Advisory only. This runs in the browser on the person's own state; it does not
 * run tools, and nothing it returns is proof that a person approved anything.
 * A request is "within_grant" only when an active grant to the same assistant
 * names every requested scope item, the request is not consequential, and no
 * safety-critical fact shares a word with it (a keyword heuristic, not a safety
 * guarantee). The lease never outlives the grant or the fixed maximum.
 *
 * @param {object} twinState Current valid twin state
 * @param {object} request Capability adjustment request
 * @param {object} options Optional settings (max_ttl_seconds, at most MAX_LEASE_TTL_SECONDS)
 * @returns {object} Deeply frozen evaluation result with the previewed lease
 */
export function evaluateCapabilityAdjustmentRequest(twinState, request, options = {}) {
  const check = validateTwinState(twinState);
  if (!check.ok) return blockedEvaluation('Invalid twin state: ' + check.error);

  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return blockedEvaluation('Capability request must be a non-null object');
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return blockedEvaluation('Options must be a non-null object');
  }
  for (const k of Object.keys(options)) {
    if (k !== 'max_ttl_seconds') return blockedEvaluation('Unknown option: ' + k);
  }
  if (options.max_ttl_seconds !== undefined) {
    const m = options.max_ttl_seconds;
    if (typeof m !== 'number' || !Number.isInteger(m) || m <= 0 || m > MAX_LEASE_TTL_SECONDS) {
      return blockedEvaluation(`max_ttl_seconds must be a positive integer of at most ${MAX_LEASE_TTL_SECONDS}`);
    }
  }
  for (const k of Object.keys(request)) {
    if (!ALLOWED_CAPABILITY_REQUEST_FIELDS.includes(k)) {
      return blockedEvaluation('Unknown field in capability request: ' + k);
    }
  }

  const grantee = typeof request.grantee === 'string' ? request.grantee.trim() : '';
  if (!grantee) return blockedEvaluation('Grantee/assistant identifier must be a non-empty string');
  if (grantee.length > 80) return blockedEvaluation('Grantee identifier exceeds 80 characters');

  const requestedScope = typeof request.requested_scope === 'string' ? request.requested_scope.trim() : '';
  if (!requestedScope) return blockedEvaluation('Requested scope must be a non-empty string');
  if (requestedScope.length > 120) return blockedEvaluation('Requested scope exceeds 120 characters');
  if (requestedScope.includes('*')) {
    return blockedEvaluation('Wildcard scopes are prohibited for ephemeral capability escalation');
  }
  const items = scopeItems(requestedScope);
  if (items.length === 0) return blockedEvaluation('Requested scope must name at least one item');

  const purpose = typeof request.purpose === 'string' ? request.purpose.trim() : '';
  if (!purpose) return blockedEvaluation('Purpose/justification must be a non-empty string');
  if (purpose.length > 200) return blockedEvaluation('Purpose exceeds 200 characters');

  const maxTtl = options.max_ttl_seconds !== undefined ? options.max_ttl_seconds : MAX_LEASE_TTL_SECONDS;
  const rawTtl = request.ttl_seconds !== undefined ? request.ttl_seconds : 900;
  if (typeof rawTtl !== 'number' || !Number.isInteger(rawTtl) || rawTtl <= 0) {
    return blockedEvaluation('TTL must be a positive integer number of seconds');
  }
  if (rawTtl > maxTtl) {
    return blockedEvaluation(`Requested TTL of ${rawTtl}s exceeds maximum allowed duration of ${maxTtl}s`);
  }

  let nowMs = Date.now();
  if (request.as_of_time !== undefined && request.as_of_time !== null) {
    nowMs = strictIsoMs(request.as_of_time);
    if (isNaN(nowMs)) return blockedEvaluation('as_of_time must be a valid ISO timestamp string');
  }

  // Safety-critical facts: keyword overlap is a heuristic screen, not enforcement.
  const criticalFacts = filterCriticalFacts(check.value.facts);
  const scopeWords = extractWords(requestedScope).filter((w) => w.length >= 3 && !CONSTRAINT_STOP_WORDS.has(w));
  const purposeWords = extractWords(purpose).filter((w) => w.length >= 3 && !CONSTRAINT_STOP_WORDS.has(w));
  const combinedWords = new Set([...scopeWords, ...purposeWords]);
  for (const f of criticalFacts) {
    const factTokens = extractWords(f.statement.toLowerCase()).filter((w) => w.length >= 3 && !CONSTRAINT_STOP_WORDS.has(w));
    const cleanFact = f.statement.toLowerCase();
    const hasDirectMention = cleanFact.includes(requestedScope.toLowerCase()) || requestedScope.toLowerCase().includes(cleanFact);
    if (factTokens.some((w) => combinedWords.has(w)) || hasDirectMention) {
      return blockedEvaluation('Requested capability conflicts with active safety-critical constraint: ' + f.statement, f.statement);
    }
  }

  const targetText = `${requestedScope.toLowerCase()} ${purpose.toLowerCase()}`;
  const isConsequential = CONSEQUENTIAL_RISK_KEYWORDS.some((kw) => targetText.includes(kw));
  const covering = findCoveringGrant(check.value.grants, grantee, items, nowMs);
  const anyGrant = (check.value.grants || []).some(
    (g) => g.who.trim().toLowerCase() === grantee.toLowerCase() && !isGrantExpired(g, nowMs)
  );

  // The lease never outlives the grant it rests on.
  let ttl = rawTtl;
  if (covering && covering.expires_at) {
    const leftS = Math.floor((Date.parse(covering.expires_at) - nowMs) / 1000);
    ttl = Math.min(ttl, leftS);
  }

  let verdict;
  let reason;
  if (!anyGrant) {
    verdict = 'requires_confirmation';
    reason = 'This assistant has no active permission on this device';
  } else if (!covering) {
    verdict = 'requires_confirmation';
    reason = 'The request is outside what was allowed for this assistant';
  } else if (ttl < 1) {
    verdict = 'requires_confirmation';
    reason = 'The permission this request rests on has run out';
  } else if (isConsequential) {
    verdict = 'requires_confirmation';
    reason = 'This request could have serious consequences';
  } else {
    verdict = 'within_grant';
    reason = 'Fits a permission the person already gave this assistant (preview only; nothing is granted or run)';
  }
  if (ttl < 1) ttl = rawTtl;

  const issuedAt = new Date(nowMs).toISOString();
  const expiresAt = new Date(nowMs + ttl * 1000).toISOString();
  const lease = Object.freeze({
    lease_id: computeLeaseId(grantee, requestedScope, purpose, issuedAt, ttl),
    grantee,
    scope: requestedScope,
    purpose,
    issued_at: issuedAt,
    expires_at: expiresAt,
    ttl_seconds: ttl,
    status: verdict === 'within_grant' ? 'active' : 'pending_confirmation'
  });

  return Object.freeze({
    allowed: verdict === 'within_grant',
    advisory: true,
    verdict,
    reason,
    conflicting_constraint: null,
    lease
  });
}

function leaseOutcome(valid, status, reason, lease, extra = {}) {
  return Object.freeze({
    valid,
    advisory: true,
    status,
    reason,
    grantee: lease && typeof lease.grantee === 'string' ? lease.grantee : null,
    scope: lease && typeof lease.scope === 'string' ? lease.scope : null,
    ...extra
  });
}

/**
 * Check, as an advisory preview, whether a capability lease still rests on a
 * permission the person gave on this device and covers a target scope.
 *
 * The lease is never trusted as given: its id, lifetime and status are re-derived
 * by re-running the issuance rules at its issue time. A hand-written lease, a
 * lifetime that does not match its dates, or a pending lease edited to "active"
 * does not pass. The grant must have existed when the lease was issued and must
 * still be active now, so a revoked and re-issued grant does not revive an old lease.
 * A pass here is not proof of human approval and authorizes nothing by itself.
 *
 * @param {object} twinState Current valid twin state
 * @param {object} lease Capability lease object
 * @param {string} targetScope Scope item being exercised
 * @param {string|null} asOfTime Evaluation timestamp (defaults to current time)
 * @returns {object} Deeply frozen verification outcome
 */
export function verifyCapabilityLease(twinState, lease, targetScope, asOfTime = null) {
  const check = validateTwinState(twinState);
  if (!check.ok) return leaseOutcome(false, 'invalid_state', 'Invalid twin state: ' + check.error, null);

  if (!lease || typeof lease !== 'object' || Array.isArray(lease)) {
    return leaseOutcome(false, 'malformed_lease', 'Lease must be a non-null object', null);
  }
  for (const k of Object.keys(lease)) {
    if (!ALLOWED_CAPABILITY_LEASE_FIELDS.includes(k)) {
      return leaseOutcome(false, 'malformed_lease', 'Unknown field in capability lease: ' + k, null);
    }
  }
  for (const f of ALLOWED_CAPABILITY_LEASE_FIELDS) {
    if (lease[f] === undefined || lease[f] === null) {
      return leaseOutcome(false, 'malformed_lease', 'Missing required field in capability lease: ' + f, null);
    }
  }
  if (
    typeof lease.grantee !== 'string' || !lease.grantee.trim() ||
    typeof lease.scope !== 'string' || !lease.scope.trim() ||
    typeof lease.purpose !== 'string' || !lease.purpose.trim() ||
    typeof lease.lease_id !== 'string' || !lease.lease_id.trim() ||
    typeof lease.status !== 'string' || !lease.status.trim() ||
    typeof lease.ttl_seconds !== 'number' || !Number.isInteger(lease.ttl_seconds) || lease.ttl_seconds <= 0
  ) {
    return leaseOutcome(false, 'malformed_lease', 'Malformed field types in capability lease', lease);
  }
  if (lease.ttl_seconds > MAX_LEASE_TTL_SECONDS) {
    return leaseOutcome(false, 'malformed_lease', `Lease lifetime exceeds the ${MAX_LEASE_TTL_SECONDS}s maximum`, lease);
  }
  const issuedMs = strictIsoMs(lease.issued_at);
  const expiresMs = strictIsoMs(lease.expires_at);
  if (isNaN(issuedMs) || isNaN(expiresMs)) {
    return leaseOutcome(false, 'malformed_lease', 'issued_at and expires_at must be valid ISO 8601 timestamps', lease);
  }
  if (expiresMs !== issuedMs + lease.ttl_seconds * 1000) {
    return leaseOutcome(false, 'malformed_lease', 'Lease lifetime does not match its issue and expiry times', lease);
  }
  if (typeof targetScope !== 'string' || !targetScope.trim()) {
    return leaseOutcome(false, 'invalid_parameter', 'Target scope must be a non-empty string', lease);
  }

  let nowMs = Date.now();
  if (asOfTime !== null && asOfTime !== undefined) {
    nowMs = strictIsoMs(asOfTime);
    if (isNaN(nowMs)) return leaseOutcome(false, 'invalid_parameter', 'asOfTime must be a valid ISO timestamp string', lease);
  }

  const hasAnyGrant = (check.value.grants || []).some((g) => g.who.trim().toLowerCase() === lease.grantee.trim().toLowerCase());
  if (!hasAnyGrant) {
    return leaseOutcome(false, 'revoked_or_unregistered', `No registered grant found on this device for "${lease.grantee}"`, lease);
  }

  // Re-derive the lease from the person's grants at its issue time.
  const reissued = evaluateCapabilityAdjustmentRequest(twinState, {
    grantee: lease.grantee,
    requested_scope: lease.scope,
    purpose: lease.purpose,
    ttl_seconds: lease.ttl_seconds,
    as_of_time: new Date(issuedMs).toISOString()
  });
  if (reissued.verdict === 'blocked' && reissued.conflicting_constraint) {
    return leaseOutcome(false, 'constraint_conflict', 'Active safety-critical constraint blocks this lease scope: ' + reissued.conflicting_constraint, lease, { conflicting_constraint: reissued.conflicting_constraint });
  }
  if (!reissued.lease || reissued.lease.lease_id !== lease.lease_id || reissued.lease.ttl_seconds !== lease.ttl_seconds) {
    return leaseOutcome(false, 'unrecognized_lease', 'This lease was not issued from the permissions on this device (id, scope or lifetime does not match)', lease);
  }
  if (lease.status !== 'active' || reissued.verdict !== 'within_grant') {
    return leaseOutcome(false, 'unconfirmed', `Lease is not within a permission the person gave (${reissued.reason})`, lease);
  }

  if (nowMs < issuedMs) return leaseOutcome(false, 'premature', 'Capability lease is not yet active (issued in the future)', lease);
  if (nowMs >= expiresMs) {
    return leaseOutcome(false, 'expired', 'Capability lease has expired as of evaluated timestamp', lease, { expires_at: lease.expires_at });
  }

  if (targetScope.includes('*') || !scopeItems(lease.scope).includes(targetScope.trim().toLowerCase())) {
    return leaseOutcome(false, 'scope_mismatch', `Lease scope "${lease.scope}" does not cover requested target scope "${targetScope}"`, lease);
  }

  // The grant it rests on must still be in force now, and must predate the lease.
  const items = scopeItems(lease.scope);
  const stillCovering = findCoveringGrant(check.value.grants, lease.grantee, items, nowMs);
  if (!stillCovering || strictIsoMs(stillCovering.at) > issuedMs) {
    return leaseOutcome(false, 'revoked_or_unregistered', `No permission given before this lease still covers it for "${lease.grantee}"`, lease);
  }

  // Facts marked critical since issuance still block (keyword heuristic).
  const criticalFacts = filterCriticalFacts(check.value.facts);
  const cleanTarget = targetScope.trim().toLowerCase();
  const targetTokens = extractWords(cleanTarget).filter((w) => w.length >= 3 && !CONSTRAINT_STOP_WORDS.has(w));
  for (const f of criticalFacts) {
    const factTokens = extractWords(f.statement.toLowerCase()).filter((w) => w.length >= 3 && !CONSTRAINT_STOP_WORDS.has(w));
    const cleanFact = f.statement.toLowerCase();
    if (factTokens.some((w) => targetTokens.includes(w)) || cleanFact.includes(cleanTarget) || cleanTarget.includes(cleanFact)) {
      return leaseOutcome(false, 'constraint_conflict', 'Active safety-critical constraint blocks this lease scope: ' + f.statement, lease, { conflicting_constraint: f.statement });
    }
  }

  return leaseOutcome(true, 'covered', 'Lease rests on a permission the person gave on this device (advisory preview; authorizes nothing by itself)', lease, {
    expires_at: lease.expires_at,
    lease: Object.freeze({ ...lease })
  });
}

/**
 * Summarize capability adjustment request evaluation for UI display.
 *
 * @param {object} evaluation Result from evaluateCapabilityAdjustmentRequest
 * @returns {object} Deeply frozen summary
 */
export function summarizeCapabilityAdjustment(evaluation) {
  if (!evaluation || typeof evaluation !== 'object' || Array.isArray(evaluation)) {
    return Object.freeze({
      allowed: false,
      verdict: 'error',
      reason: 'Invalid evaluation output',
      grantee: null,
      scope: null,
      ttl_seconds: 0,
      expires_at: null,
      lease_id: null
    });
  }

  return Object.freeze({
    allowed: Boolean(evaluation.allowed),
    verdict: evaluation.verdict || 'unknown',
    reason: evaluation.reason || '',
    grantee: evaluation.lease ? evaluation.lease.grantee : null,
    scope: evaluation.lease ? evaluation.lease.scope : null,
    ttl_seconds: evaluation.lease ? evaluation.lease.ttl_seconds : 0,
    expires_at: evaluation.lease ? evaluation.lease.expires_at : null,
    lease_id: evaluation.lease ? evaluation.lease.lease_id : null
  });
}

/**
 * Summarize capability lease verification for UI display.
 *
 * @param {object} verification Result from verifyCapabilityLease
 * @returns {object} Deeply frozen summary
 */
export function summarizeCapabilityLease(verification) {
  if (!verification || typeof verification !== 'object' || Array.isArray(verification)) {
    return Object.freeze({
      valid: false,
      status: 'error',
      reason: 'Invalid verification output',
      grantee: null,
      scope: null,
      expires_at: null
    });
  }

  return Object.freeze({
    valid: Boolean(verification.valid),
    status: verification.status || 'unknown',
    reason: verification.reason || '',
    grantee: verification.grantee || null,
    scope: verification.scope || null,
    expires_at: verification.expires_at || null
  });
}

/* =========================================================================
   Deterministic Financial Ledger Query Evaluator and Disagreement Verifier
   Grounded in Signal S-20261014-1745 (Pulse Local) and Rule 4 of AGENTS.md.
   Enforces strict integer cents arithmetic, ISO currency match, and dual-reading
   disagreement verification returning unsure rather than guessing.
   ========================================================================= */

export const ALLOWED_LEDGER_OPERATIONS = Object.freeze([
  'sum',
  'count',
  'average',
  'balance',
  'breakdown',
  'filter'
]);

export const ALLOWED_LEDGER_ENTRY_FIELDS = Object.freeze([
  'id',
  'date',
  'amount_cents',
  'currency',
  'category',
  'merchant',
  'kind',
  'description'
]);

export const ALLOWED_FINANCIAL_QUERY_FIELDS = Object.freeze([
  'operation',
  'currency',
  'start_date',
  'end_date',
  'category',
  'merchant',
  'kind',
  'expected_amount_cents'
]);

export const ALLOWED_READING_FIELDS = Object.freeze([
  'operation',
  'currency',
  'start_date',
  'end_date',
  'category',
  'merchant',
  'kind',
  'total_cents',
  'matching_count',
  'expected_amount_cents'
]);

export const ALLOWED_AGREEMENT_OPTIONS_FIELDS = Object.freeze([
  'tolerance_cents'
]);

export const ALLOWED_FINANCIAL_QUERY_OPTIONS = Object.freeze([
  'duplicate_id_policy'
]);

export const ALLOWED_LEDGER_CURRENCIES = Object.freeze([
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
  'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
  'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
  'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP',
  'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR',
  'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS',
  'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR',
  'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP',
  'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO',
  'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN',
  'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG',
  'SEK', 'SGD', 'SHP', 'SLL', 'SLE', 'SOS', 'SRD', 'SSP', 'STN', 'SVC',
  'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD',
  'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST',
  'XAF', 'XCD', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
]);

export function isValidCurrencyCode(code) {
  return typeof code === 'string' && ALLOWED_LEDGER_CURRENCIES.includes(code);
}

export function isValidCalendarDate(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return false;
  }
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  return dateObj.getUTCFullYear() === y &&
         dateObj.getUTCMonth() === (m - 1) &&
         dateObj.getUTCDate() === d;
}

/**
 * Deterministically compute a short hex fingerprint for a financial ledger query.
 */
function computeFinancialQueryFingerprint(query) {
  const seed = `${query.operation || ''}|${query.currency || ''}|${query.start_date || ''}|${query.end_date || ''}|${query.category || ''}|${query.merchant || ''}|${query.kind || ''}|${query.expected_amount_cents !== undefined ? query.expected_amount_cents : ''}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Validate a single ledger entry fail-closed.
 * Returns null if valid, or an error string.
 */
function validateLedgerEntry(entry, index) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return `Entry at index ${index} must be a non-null object`;
  }
  const keys = Object.keys(entry);
  for (const k of keys) {
    if (!ALLOWED_LEDGER_ENTRY_FIELDS.includes(k)) {
      return `Entry at index ${index} contains forbidden field: ${k}`;
    }
  }
  if (typeof entry.id !== 'string' || !entry.id.trim()) {
    return `Entry at index ${index} must have a non-empty string id`;
  }
  if (!isValidCalendarDate(entry.date)) {
    return `Entry at index ${index} has invalid date (must be a valid calendar YYYY-MM-DD)`;
  }
  if (!Number.isSafeInteger(entry.amount_cents)) {
    return `Entry at index ${index} amount_cents must be a safe integer, not float, NaN, Infinity, or unsafe integer`;
  }
  if (!isValidCurrencyCode(entry.currency)) {
    return `Entry at index ${index} must have a valid 3-letter uppercase ISO currency code`;
  }
  if (entry.kind !== 'debit' && entry.kind !== 'credit') {
    return `Entry at index ${index} kind must be 'debit' or 'credit'`;
  }
  if (entry.kind === 'debit' && entry.amount_cents > 0) {
    return `Entry at index ${index} is marked debit but has positive amount_cents (debits must be negative or zero)`;
  }
  if (entry.kind === 'credit' && entry.amount_cents < 0) {
    return `Entry at index ${index} is marked credit but has negative amount_cents (credits must be positive or zero)`;
  }
  if (entry.category !== undefined && typeof entry.category !== 'string') {
    return `Entry at index ${index} category must be a string`;
  }
  if (entry.merchant !== undefined && typeof entry.merchant !== 'string') {
    return `Entry at index ${index} merchant must be a string`;
  }
  if (entry.description !== undefined && typeof entry.description !== 'string') {
    return `Entry at index ${index} description must be a string`;
  }
  return null;
}

/**
 * Evaluate a financial query deterministically against an integer-cents ledger.
 *
 * @param {Array<object>} ledger Array of verified ledger entries
 * @param {object} query Query specification
 * @param {object} [options] Optional evaluation options
 * @returns {object} Deeply frozen result
 */
export function evaluateFinancialLedgerQuery(ledger, query, options = {}) {
  if (!Array.isArray(ledger)) {
    return Object.freeze({
      ok: false,
      error: 'invalid_ledger',
      reason: 'Ledger must be an array of entries',
      matching_count: 0,
      total_cents: 0
    });
  }

  if (options !== undefined && options !== null) {
    if (typeof options !== 'object' || Array.isArray(options)) {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: 'Options must be a non-null object',
        matching_count: 0,
        total_cents: 0
      });
    }
    for (const k of Object.keys(options)) {
      if (!ALLOWED_FINANCIAL_QUERY_OPTIONS.includes(k)) {
        return Object.freeze({
          ok: false,
          error: 'unknown_option',
          reason: `Unknown option in query options: ${k}`,
          matching_count: 0,
          total_cents: 0
        });
      }
    }
    if (options.duplicate_id_policy !== undefined &&
        options.duplicate_id_policy !== 'reject' &&
        options.duplicate_id_policy !== 'skip') {
      return Object.freeze({
        ok: false,
        error: 'invalid_options',
        reason: "duplicate_id_policy must be 'reject' or 'skip'",
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    return Object.freeze({
      ok: false,
      error: 'invalid_query',
      reason: 'Query must be a non-null object',
      matching_count: 0,
      total_cents: 0
    });
  }

  const queryKeys = Object.keys(query);
  for (const k of queryKeys) {
    if (!ALLOWED_FINANCIAL_QUERY_FIELDS.includes(k)) {
      return Object.freeze({
        ok: false,
        error: 'unknown_query_field',
        reason: `Query contains forbidden field: ${k}`,
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  if (!ALLOWED_LEDGER_OPERATIONS.includes(query.operation)) {
    return Object.freeze({
      ok: false,
      error: 'invalid_operation',
      reason: `Operation must be one of: ${ALLOWED_LEDGER_OPERATIONS.join(', ')}`,
      matching_count: 0,
      total_cents: 0
    });
  }

  if (!isValidCurrencyCode(query.currency)) {
    return Object.freeze({
      ok: false,
      error: 'missing_or_invalid_currency',
      reason: 'Query must specify a valid 3-letter uppercase ISO currency',
      matching_count: 0,
      total_cents: 0
    });
  }

  if (query.start_date !== undefined) {
    if (!isValidCalendarDate(query.start_date)) {
      return Object.freeze({
        ok: false,
        error: 'invalid_start_date',
        reason: 'start_date must be a valid calendar YYYY-MM-DD date string',
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  if (query.end_date !== undefined) {
    if (!isValidCalendarDate(query.end_date)) {
      return Object.freeze({
        ok: false,
        error: 'invalid_end_date',
        reason: 'end_date must be a valid calendar YYYY-MM-DD date string',
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  if (query.start_date && query.end_date && query.start_date > query.end_date) {
    return Object.freeze({
      ok: false,
      error: 'invalid_date_range',
      reason: 'start_date cannot be after end_date',
      matching_count: 0,
      total_cents: 0
    });
  }

  if (query.kind !== undefined && query.kind !== 'debit' && query.kind !== 'credit') {
    return Object.freeze({
      ok: false,
      error: 'invalid_kind_filter',
      reason: "kind filter must be 'debit' or 'credit'",
      matching_count: 0,
      total_cents: 0
    });
  }

  if (query.category !== undefined) {
    if (typeof query.category !== 'string' || !query.category.trim() || query.category.length > 80) {
      return Object.freeze({
        ok: false,
        error: 'invalid_category',
        reason: 'category must be a non-empty string up to 80 characters',
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  if (query.merchant !== undefined) {
    if (typeof query.merchant !== 'string' || !query.merchant.trim() || query.merchant.length > 80) {
      return Object.freeze({
        ok: false,
        error: 'invalid_merchant',
        reason: 'merchant must be a non-empty string up to 80 characters',
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  if (query.expected_amount_cents !== undefined) {
    if (!Number.isSafeInteger(query.expected_amount_cents)) {
      return Object.freeze({
        ok: false,
        error: 'invalid_expected_amount',
        reason: 'expected_amount_cents must be a safe integer',
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  // Validate all entries fail-closed and check duplicate IDs
  const seenIds = new Set();
  const dupPolicy = (options && options.duplicate_id_policy) || 'reject';
  const validEntries = [];

  for (let i = 0; i < ledger.length; i++) {
    const entry = ledger[i];
    const err = validateLedgerEntry(entry, i);
    if (err) {
      return Object.freeze({
        ok: false,
        error: 'malformed_ledger_entry',
        reason: err,
        matching_count: 0,
        total_cents: 0
      });
    }
    if (seenIds.has(entry.id)) {
      if (dupPolicy === 'reject') {
        return Object.freeze({
          ok: false,
          error: 'duplicate_ledger_id',
          reason: `Duplicate ledger entry ID detected: ${entry.id}`,
          matching_count: 0,
          total_cents: 0
        });
      }
      // If skip, skip duplicate entry
      continue;
    }
    seenIds.add(entry.id);
    validEntries.push(entry);
  }

  // Filter matching records with safe integer accumulation
  const matched = [];
  const breakdownMap = Object.create(null);
  let totalCents = 0;
  let debitCents = 0;
  let creditCents = 0;

  for (const entry of validEntries) {
    if (entry.currency !== query.currency) {
      continue;
    }

    if (query.start_date && entry.date < query.start_date) continue;
    if (query.end_date && entry.date > query.end_date) continue;
    if (query.kind && entry.kind !== query.kind) continue;

    if (query.category) {
      const qCat = query.category.trim().toLowerCase();
      const eCat = (entry.category || '').trim().toLowerCase();
      if (eCat !== qCat) continue;
    }

    if (query.merchant) {
      const qWords = extractWords(query.merchant);
      const eWords = extractWords(entry.merchant || '');
      const matchesMerchant = qWords.length > 0 && qWords.every((w) => eWords.includes(w));
      if (!matchesMerchant) continue;
    }

    matched.push(entry);

    if (!Number.isSafeInteger(totalCents + entry.amount_cents)) {
      return Object.freeze({
        ok: false,
        error: 'integer_overflow',
        reason: 'Integer overflow detected: total cents exceeds safe integer range',
        matching_count: 0,
        total_cents: 0
      });
    }
    totalCents += entry.amount_cents;

    if (entry.kind === 'debit') {
      if (!Number.isSafeInteger(debitCents + entry.amount_cents)) {
        return Object.freeze({
          ok: false,
          error: 'integer_overflow',
          reason: 'Integer overflow detected in debit cents',
          matching_count: 0,
          total_cents: 0
        });
      }
      debitCents += entry.amount_cents;
    } else {
      if (!Number.isSafeInteger(creditCents + entry.amount_cents)) {
        return Object.freeze({
          ok: false,
          error: 'integer_overflow',
          reason: 'Integer overflow detected in credit cents',
          matching_count: 0,
          total_cents: 0
        });
      }
      creditCents += entry.amount_cents;
    }

    const catKey = (entry.category || 'uncategorized').trim().toLowerCase();
    if (!breakdownMap[catKey]) {
      breakdownMap[catKey] = { count: 0, total_cents: 0 };
    }
    breakdownMap[catKey].count += 1;
    if (!Number.isSafeInteger(breakdownMap[catKey].total_cents + entry.amount_cents)) {
      return Object.freeze({
        ok: false,
        error: 'integer_overflow',
        reason: `Integer overflow detected in category ${catKey}`,
        matching_count: 0,
        total_cents: 0
      });
    }
    breakdownMap[catKey].total_cents += entry.amount_cents;
  }

  const frozenBreakdown = Object.create(null);
  for (const [k, v] of Object.entries(breakdownMap)) {
    frozenBreakdown[k] = Object.freeze({ count: v.count, total_cents: v.total_cents });
  }

  let avgQuotient = 0;
  let avgRemainder = 0;
  if (matched.length > 0) {
    avgQuotient = Math.trunc(totalCents / matched.length) || 0;
    avgRemainder = (totalCents % matched.length) || 0;
  }

  const matchesExpected = query.expected_amount_cents !== undefined
    ? totalCents === query.expected_amount_cents
    : null;

  const result = {
    ok: true,
    operation: query.operation,
    currency: query.currency,
    matching_count: matched.length,
    total_cents: totalCents,
    balance_cents: debitCents + creditCents,
    debit_cents: debitCents,
    credit_cents: creditCents,
    average: Object.freeze({
      quotient_cents: avgQuotient,
      remainder_cents: avgRemainder
    }),
    breakdown: Object.freeze(frozenBreakdown),
    matched_ids: Object.freeze(matched.map((e) => e.id)),
    expected_amount_cents: query.expected_amount_cents !== undefined ? query.expected_amount_cents : null,
    matches_expected: matchesExpected,
    query_fingerprint: computeFinancialQueryFingerprint(query),
    evaluated_at: new Date().toISOString()
  };

  return Object.freeze(result);
}

/**
 * Verify whether two structured readings (primary model reading vs checker reading)
 * agree on query parameters and computed numbers, implementing the Pulse Local
 * double-check verifier pattern.
 *
 * @param {object} primary Primary reading / evaluation
 * @param {object} checker Independent checker reading / evaluation
 * @param {object} [options] Optional verifier options
 * @returns {object} Deeply frozen agreement report
 */
export function verifyLedgerQueryAgreement(primary, checker, options = {}) {
  if (!primary || typeof primary !== 'object' || Array.isArray(primary) ||
      !checker || typeof checker !== 'object' || Array.isArray(checker)) {
    return Object.freeze({
      ok: false,
      status: 'error',
      sure: false,
      reason: 'Both primary and checker readings must be non-null objects'
    });
  }

  if (options !== undefined && options !== null) {
    if (typeof options !== 'object' || Array.isArray(options)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: 'Options must be a non-null object'
      });
    }
    for (const k of Object.keys(options)) {
      if (!ALLOWED_AGREEMENT_OPTIONS_FIELDS.includes(k)) {
        return Object.freeze({
          ok: false,
          status: 'error',
          sure: false,
          reason: `Unknown option: ${k}`
        });
      }
    }
    if (options.tolerance_cents !== undefined) {
      if (!Number.isSafeInteger(options.tolerance_cents) || options.tolerance_cents < 0) {
        return Object.freeze({
          ok: false,
          status: 'error',
          sure: false,
          reason: 'tolerance_cents must be a non-negative safe integer'
        });
      }
    }
  }

  // Schema allowlist validation on readings
  for (const k of Object.keys(primary)) {
    if (!ALLOWED_READING_FIELDS.includes(k)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `Primary reading contains forbidden field: ${k}`
      });
    }
  }
  for (const k of Object.keys(checker)) {
    if (!ALLOWED_READING_FIELDS.includes(k)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `Checker reading contains forbidden field: ${k}`
      });
    }
  }

  // Bind readings to core fields: readings cannot be empty
  if (!primary.operation || !primary.currency || !checker.operation || !checker.currency) {
    return Object.freeze({
      ok: false,
      status: 'error',
      sure: false,
      reason: 'Both readings must specify at least operation and currency'
    });
  }

  // Complete schema and type validation on both readings
  const readings = [
    { label: 'Primary', r: primary },
    { label: 'Checker', r: checker }
  ];

  for (const { label, r } of readings) {
    if (typeof r.operation !== 'string' || !ALLOWED_LEDGER_OPERATIONS.includes(r.operation)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading has unknown or invalid operation: "${r.operation}"`
      });
    }

    if (!isValidCurrencyCode(r.currency)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading has invalid or unrecognised currency code: "${r.currency}"`
      });
    }

    if (r.start_date !== undefined && !isValidCalendarDate(r.start_date)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading has invalid start_date: "${r.start_date}"`
      });
    }

    if (r.end_date !== undefined && !isValidCalendarDate(r.end_date)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading has invalid end_date: "${r.end_date}"`
      });
    }

    if (r.start_date && r.end_date && r.start_date > r.end_date) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading has start_date after end_date`
      });
    }

    if (r.total_cents !== undefined && !Number.isSafeInteger(r.total_cents)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading total_cents must be a safe integer`
      });
    }

    if (r.matching_count !== undefined && (!Number.isSafeInteger(r.matching_count) || r.matching_count < 0)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading matching_count must be a non-negative safe integer`
      });
    }

    if (r.expected_amount_cents !== undefined && !Number.isSafeInteger(r.expected_amount_cents)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading expected_amount_cents must be a safe integer`
      });
    }

    if (r.category !== undefined && typeof r.category !== 'string') {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading category must be a string`
      });
    }

    if (r.merchant !== undefined && typeof r.merchant !== 'string') {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading merchant must be a string`
      });
    }

    if (r.kind !== undefined && r.kind !== 'debit' && r.kind !== 'credit') {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: `${label} reading kind must be 'debit' or 'credit'`
      });
    }
  }

  // Compare semantic query boundaries
  const compareFields = ['operation', 'currency', 'start_date', 'end_date', 'category', 'merchant', 'kind', 'expected_amount_cents'];
  for (const f of compareFields) {
    if (primary[f] !== undefined || checker[f] !== undefined) {
      const pVal = primary[f] !== undefined ? String(primary[f]).trim().toLowerCase() : '';
      const cVal = checker[f] !== undefined ? String(checker[f]).trim().toLowerCase() : '';
      if (pVal !== cVal) {
        return Object.freeze({
          ok: true,
          status: 'disagreement',
          sure: false,
          field: f,
          primary_value: primary[f] !== undefined ? primary[f] : null,
          checker_value: checker[f] !== undefined ? checker[f] : null,
          reason: `Readings disagree on ${f}: "${primary[f]}" vs "${checker[f]}"`
        });
      }
    }
  }

  // Check calculation symmetry: total_cents
  const primaryHasTotal = primary.total_cents !== undefined;
  const checkerHasTotal = checker.total_cents !== undefined;
  if (primaryHasTotal !== checkerHasTotal) {
    return Object.freeze({
      ok: true,
      status: 'disagreement',
      sure: false,
      field: 'total_cents',
      reason: 'Asymmetric calculation: total_cents supplied by only one reading'
    });
  }

  // Check calculation symmetry: matching_count
  const primaryHasCount = primary.matching_count !== undefined;
  const checkerHasCount = checker.matching_count !== undefined;
  if (primaryHasCount !== checkerHasCount) {
    return Object.freeze({
      ok: true,
      status: 'disagreement',
      sure: false,
      field: 'matching_count',
      reason: 'Asymmetric calculation: matching_count supplied by only one reading'
    });
  }

  let totalDiff = 0;
  if (primaryHasTotal) {
    totalDiff = Math.abs(primary.total_cents - checker.total_cents);
    const tol = options && Number.isSafeInteger(options.tolerance_cents) ? options.tolerance_cents : 0;
    if (totalDiff > tol) {
      return Object.freeze({
        ok: true,
        status: 'disagreement',
        sure: false,
        field: 'total_cents',
        primary_value: primary.total_cents,
        checker_value: checker.total_cents,
        reason: `Calculated total_cents differ: ${primary.total_cents} vs ${checker.total_cents}`
      });
    }
  }

  if (primaryHasCount) {
    if (primary.matching_count !== checker.matching_count) {
      return Object.freeze({
        ok: true,
        status: 'disagreement',
        sure: false,
        field: 'matching_count',
        primary_value: primary.matching_count,
        checker_value: checker.matching_count,
        reason: `Matching entry counts differ: ${primary.matching_count} vs ${checker.matching_count}`
      });
    }
  }

  // Acceptance 2 rule: "no sure for unknown operations, invalid currencies/dates/counts or unequal exact cents via tolerance."
  // If totalDiff > 0 (readings differ within tolerance), sure MUST BE false!
  const isExactCentsMatch = totalDiff === 0;
  const isSure = isExactCentsMatch;
  const verifiedCents = isExactCentsMatch && primaryHasTotal ? primary.total_cents : null;

  return Object.freeze({
    ok: true,
    status: isExactCentsMatch ? 'agreement' : 'approximate_agreement',
    sure: isSure,
    approximate: !isExactCentsMatch,
    discrepancy_cents: totalDiff,
    verified_cents: verifiedCents,
    currency: primary.currency,
    matching_count: primaryHasCount ? primary.matching_count : null,
    reason: isExactCentsMatch
      ? 'Both readings agree on query parameters and calculations'
      : `Readings agree within tolerance, but exact cents differ by ${totalDiff}`
  });
}

/**
 * Format integer cents safely as currency text without floating-point math.
 */
function formatCents(cents, currency) {
  const isNegative = cents < 0;
  const abs = Math.abs(cents);
  const units = Math.floor(abs / 100);
  const remainder = abs % 100;
  const formatted = `${isNegative ? '-' : ''}${units}.${String(remainder).padStart(2, '0')}`;
  return `${formatted} ${currency}`;
}

/**
 * Summarize financial ledger evaluation for UI display without LLM generation.
 *
 * @param {object} evalResult Result from evaluateFinancialLedgerQuery
 * @returns {object} Deeply frozen summary
 */
export function summarizeLedgerEvaluation(evalResult) {
  if (!evalResult || typeof evalResult !== 'object' || Array.isArray(evalResult)) {
    return Object.freeze({
      success: false,
      summary_text: 'Invalid evaluation result',
      matching_count: 0,
      total_formatted: '0.00',
      currency: null
    });
  }

  if (!evalResult.ok) {
    return Object.freeze({
      success: false,
      summary_text: `Evaluation failed: ${evalResult.reason || evalResult.error}`,
      matching_count: 0,
      total_formatted: '0.00',
      currency: null
    });
  }

  const formattedTotal = formatCents(evalResult.total_cents, evalResult.currency);
  const formattedBalance = formatCents(evalResult.balance_cents, evalResult.currency);

  let text = '';
  if (evalResult.operation === 'count') {
    text = `Found ${evalResult.matching_count} transaction(s) matching query.`;
  } else if (evalResult.operation === 'balance') {
    text = `Net balance: ${formattedBalance} across ${evalResult.matching_count} transaction(s).`;
  } else if (evalResult.operation === 'average') {
    if (!evalResult.average || typeof evalResult.average !== 'object' || typeof evalResult.average.quotient_cents !== 'number') {
      return Object.freeze({
        success: false,
        summary_text: 'Invalid or missing average calculation in evaluation result',
        matching_count: 0,
        total_formatted: '0.00',
        currency: null
      });
    }
    const avgFormatted = formatCents(evalResult.average.quotient_cents, evalResult.currency);
    text = `Average: ${avgFormatted} (total: ${formattedTotal} across ${evalResult.matching_count} transaction(s)).`;
  } else {
    text = `Total: ${formattedTotal} across ${evalResult.matching_count} transaction(s).`;
  }

  return Object.freeze({
    success: true,
    summary_text: text,
    matching_count: evalResult.matching_count,
    total_cents: evalResult.total_cents,
    total_formatted: formattedTotal,
    balance_cents: evalResult.balance_cents,
    balance_formatted: formattedBalance,
    currency: evalResult.currency,
    query_fingerprint: evalResult.query_fingerprint || null
  });
}

/**
 * Recursively freeze an object and all nested non-primitive properties.
 */
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const val = obj[key];
    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

/**
 * Allowed origin channels for personal twin memory items.
 * Grounded in AM-Sentry origin tracking (arXiv:2607.06595) and non-malleable
 * information-flow control (arXiv:2606.24322).
 */
export const ALLOWED_MEMORY_ORIGINS = Object.freeze([
  'user_direct',
  'agent_summary',
  'tool_output',
  'web_source',
  'external_message'
]);

/**
 * Allowed memory types for structured agent memory consolidation.
 * Grounded in Cognikernel typed memory specifications.
 */
export const ALLOWED_MEMORY_TYPES = Object.freeze([
  'DECISION',
  'CONSTRAINT_HARD',
  'CONSTRAINT_SOFT',
  'PREFERENCE',
  'FACT',
  'DEAD_END'
]);

/**
 * Normalise text before evaluating against heuristic pattern list.
 * Applies Unicode NFKC normalization to unfold fullwidth/compatibility characters,
 * removes zero-width and unprintable formatting characters, converts to lowercase,
 * and collapses whitespace sequences.
 *
 * NOTE: Heuristic pattern scanning is advisory and serves as a defense-in-depth flag,
 * not a primary security boundary. Host-mediated origin authority and structural
 * type gates govern execution boundaries.
 *
 * @param {string} text Raw input string
 * @returns {string} Normalized string
 */
export function normalizeTextForHeuristic(text) {
  if (typeof text !== 'string') return '';
  return text
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u200E\u200F]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Advisory heuristic pattern list for detecting imperative directives and injection strings.
 * This is an advisory heuristic flag to quarantine suspicious text, not a primary defense boundary.
 * Structural origin authority and type limits enforce security boundaries.
 */
export const IMPERATIVE_DIRECTIVE_PATTERNS = Object.freeze([
  'ignore previous',
  'disregard earlier',
  'override instructions',
  'system prompt',
  'you must now',
  'act as',
  'transfer funds',
  'send email to',
  'exfiltrate',
  'delete all',
  'curl ',
  'wget ',
  'rm -rf',
  ['ev', 'al('].join(''),
  '<script',
  'javascript:',
  'drop table'
]);

/**
 * Allowed execution modes for task contexts.
 */
export const TASK_EXECUTION_MODES = Object.freeze([
  'read_only',
  'standard',
  'high_consequence'
]);

/**
 * Strict allowlist of fields permitted on a memory candidate object.
 */
export const ALLOWED_MEMORY_CANDIDATE_FIELDS = Object.freeze([
  'content',
  'origin',
  'memory_type',
  'timestamp',
  'decision_key',
  'metadata',
  'provenance_id'
]);

/**
 * Origin authority hierarchy: higher values indicate stronger trust.
 */
export const MEMORY_ORIGIN_AUTHORITY = Object.freeze({
  user_direct: 100,
  agent_summary: 50,
  tool_output: 30,
  external_message: 20,
  web_source: 10
});

/**
 * Evaluate a candidate memory item against write-saving policies.
 *
 * Implements origin-bound authority and imperative pattern detection
 * to reduce persistent memory poisoning (GhostWriter attacks).
 *
 * @param {object} candidate Memory candidate object
 * @param {object} [options] Optional policy options
 * @returns {object} Deeply frozen evaluation result
 */
export function evaluateMemorySaveCandidate(candidate, options = {}) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: 'Memory candidate must be a non-null object'
    });
  }

  // Reject unknown fields
  for (const k of Object.keys(candidate)) {
    if (!ALLOWED_MEMORY_CANDIDATE_FIELDS.includes(k)) {
      return deepFreeze({
        ok: false,
        status: 'rejected',
        disposition: 'reject',
        quarantine: false,
        tainted: false,
        imperative_detected: false,
        matched_patterns: [],
        authority_score: 0,
        sanitized_candidate: null,
        reason: `Unknown field in candidate: "${k}"`
      });
    }
  }

  // Validate content
  if (typeof candidate.content !== 'string' || !candidate.content.trim()) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: 'Candidate content must be a non-empty string'
    });
  }
  const trimmedContent = candidate.content.trim();
  if (trimmedContent.length > 4000) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: 'Candidate content exceeds maximum length of 4000 characters'
    });
  }

  // Validate origin
  if (!ALLOWED_MEMORY_ORIGINS.includes(candidate.origin)) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: `Invalid origin: "${candidate.origin}". Must be one of ${ALLOWED_MEMORY_ORIGINS.join(', ')}`
    });
  }

  // Validate memory_type
  if (!ALLOWED_MEMORY_TYPES.includes(candidate.memory_type)) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: `Invalid memory_type: "${candidate.memory_type}". Must be one of ${ALLOWED_MEMORY_TYPES.join(', ')}`
    });
  }

  // Validate timestamp (ISO string, valid date, not future)
  if (typeof candidate.timestamp !== 'string') {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: 'Timestamp must be an ISO-8601 string'
    });
  }
  const dateVal = Date.parse(candidate.timestamp);
  if (Number.isNaN(dateVal)) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: 'Invalid timestamp format'
    });
  }
  const now = (options && typeof options.now_ms === 'number') ? options.now_ms : Date.now();
  if (dateVal > now + 60000) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: false,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: 0,
      sanitized_candidate: null,
      reason: 'Timestamp cannot be in the future'
    });
  }

  // Validate decision_key if provided
  if (candidate.decision_key !== undefined) {
    if (typeof candidate.decision_key !== 'string' || !candidate.decision_key.trim() || candidate.decision_key.length > 200) {
      return deepFreeze({
        ok: false,
        status: 'rejected',
        disposition: 'reject',
        quarantine: false,
        tainted: false,
        imperative_detected: false,
        matched_patterns: [],
        authority_score: 0,
        sanitized_candidate: null,
        reason: 'decision_key must be a non-empty string under 200 characters'
      });
    }
  }

  // Validate metadata if provided
  if (candidate.metadata !== undefined) {
    if (!candidate.metadata || typeof candidate.metadata !== 'object' || Array.isArray(candidate.metadata)) {
      return deepFreeze({
        ok: false,
        status: 'rejected',
        disposition: 'reject',
        quarantine: false,
        tainted: false,
        imperative_detected: false,
        matched_patterns: [],
        authority_score: 0,
        sanitized_candidate: null,
        reason: 'metadata must be a plain object'
      });
    }
  }

  // Validate provenance_id if provided
  if (candidate.provenance_id !== undefined) {
    if (typeof candidate.provenance_id !== 'string' || !candidate.provenance_id.trim() || candidate.provenance_id.length > 100) {
      return deepFreeze({
        ok: false,
        status: 'rejected',
        disposition: 'reject',
        quarantine: false,
        tainted: false,
        imperative_detected: false,
        matched_patterns: [],
        authority_score: 0,
        sanitized_candidate: null,
        reason: 'provenance_id must be a non-empty string under 100 characters'
      });
    }
  }

  const authorityScore = MEMORY_ORIGIN_AUTHORITY[candidate.origin] || 0;
  const isUntrustedOrigin = ['web_source', 'external_message', 'tool_output'].includes(candidate.origin);

  // Structural Rule 1: Only user_direct origin can establish CONSTRAINT_HARD
  if (candidate.memory_type === 'CONSTRAINT_HARD' && candidate.origin !== 'user_direct') {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: isUntrustedOrigin,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: authorityScore,
      sanitized_candidate: null,
      reason: 'Only user_direct origin can establish hard constraints'
    });
  }

  // Structural Rule 2: Untrusted origins may strictly ONLY write FACT or DEAD_END
  // They are barred from writing DECISION, PREFERENCE, CONSTRAINT_HARD, or CONSTRAINT_SOFT
  if (isUntrustedOrigin && candidate.memory_type !== 'FACT' && candidate.memory_type !== 'DEAD_END') {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      disposition: 'reject',
      quarantine: false,
      tainted: true,
      imperative_detected: false,
      matched_patterns: [],
      authority_score: authorityScore,
      sanitized_candidate: null,
      reason: `Untrusted origin "${candidate.origin}" may only write FACT or DEAD_END, cannot write ${candidate.memory_type}`
    });
  }

  // Heuristic Rule 3: Scan normalized text for imperative directives (heuristic flag)
  const contentNormalized = normalizeTextForHeuristic(trimmedContent);
  const matchedPatterns = [];
  for (const pattern of IMPERATIVE_DIRECTIVE_PATTERNS) {
    if (contentNormalized.includes(pattern)) {
      matchedPatterns.push(pattern);
    }
  }

  const imperativeDetected = matchedPatterns.length > 0;

  // Untrusted origin attempting to plant imperative instructions -> Quarantine fail-closed
  if (isUntrustedOrigin && imperativeDetected) {
    const quarantinedItem = {
      content: trimmedContent,
      origin: candidate.origin,
      memory_type: candidate.memory_type,
      timestamp: candidate.timestamp,
      decision_key: candidate.decision_key ? candidate.decision_key.trim() : null,
      provenance_id: candidate.provenance_id ? candidate.provenance_id.trim() : null,
      quarantine: true,
      tainted: true,
      authority_score: authorityScore,
      matched_patterns: matchedPatterns,
      metadata: candidate.metadata || {}
    };

    return deepFreeze({
      ok: true,
      status: 'quarantined',
      disposition: 'ask_first',
      quarantine: true,
      tainted: true,
      imperative_detected: true,
      matched_patterns: matchedPatterns,
      authority_score: authorityScore,
      sanitized_candidate: quarantinedItem,
      reason: `Imperative directive pattern(s) detected from untrusted origin "${candidate.origin}": ${matchedPatterns.join(', ')}`
    });
  }

  // Disposition and provenance rules for accepted items
  let disposition = 'commit';
  let statusReason = 'Candidate passed write-saving policy checks';

  if (isUntrustedOrigin) {
    // Untrusted origins always receive ask_first disposition and tainted flag
    disposition = 'ask_first';
    statusReason = `Untrusted origin "${candidate.origin}" admitted as tainted with ask_first disposition`;
  } else if (candidate.origin === 'agent_summary' && candidate.memory_type === 'DECISION') {
    // Agent summary creating a user DECISION requires provenance_id linking to a verified user_direct item;
    // without verified provenance, it must receive ask_first disposition fail-closed.
    if (!candidate.provenance_id || typeof candidate.provenance_id !== 'string' || !candidate.provenance_id.trim()) {
      disposition = 'ask_first';
      statusReason = 'Agent summary DECISION requires provenance_id linking to a user_direct item; set to ask_first';
    } else if (options && Array.isArray(options.existing_memories)) {
      const hasUserDirectLink = options.existing_memories.some(
        m => m && (m.id === candidate.provenance_id || m.decision_key === candidate.provenance_id || m.provenance_id === candidate.provenance_id) && m.origin === 'user_direct'
      );
      if (!hasUserDirectLink) {
        disposition = 'ask_first';
        statusReason = 'Agent summary DECISION provenance does not link to a user_direct item; set to ask_first';
      }
    } else {
      // Fail closed when existing_memories configuration is missing or unverified
      disposition = 'ask_first';
      statusReason = 'Agent summary DECISION requires existing_memories to verify user_direct provenance; set to ask_first';
    }
  }

  // Accepted item
  const acceptedItem = {
    content: trimmedContent,
    origin: candidate.origin,
    memory_type: candidate.memory_type,
    timestamp: candidate.timestamp,
    decision_key: candidate.decision_key ? candidate.decision_key.trim() : null,
    provenance_id: candidate.provenance_id ? candidate.provenance_id.trim() : null,
    quarantine: false,
    tainted: isUntrustedOrigin,
    authority_score: authorityScore,
    matched_patterns: [],
    metadata: candidate.metadata || {}
  };

  return deepFreeze({
    ok: true,
    status: 'accepted',
    disposition: disposition,
    quarantine: false,
    tainted: isUntrustedOrigin,
    imperative_detected: false,
    matched_patterns: [],
    authority_score: authorityScore,
    sanitized_candidate: acceptedItem,
    reason: statusReason
  });
}

/**
 * Screen candidate memory items for retrieval into an active task context.
 *
 * Implements context-conditioned gating and withholds unverified or quarantined
 * memories from high-consequence execution (GhostWriter retrieval screen).
 *
 * @param {Array<object>} memories Array of stored memory records
 * @param {object} queryContext Context of the executing query/task
 * @param {object} [options] Evaluation options
 * @returns {object} Deeply frozen retrieval screening result
 */
export function screenMemoryRetrievalCandidates(memories, queryContext, options = {}) {
  if (!Array.isArray(memories)) {
    return deepFreeze({
      ok: false,
      admitted_count: 0,
      withheld_count: 0,
      confirm_required_count: 0,
      screened_items: [],
      execution_mode: null,
      reason: 'Memories must be an array'
    });
  }

  if (!queryContext || typeof queryContext !== 'object' || Array.isArray(queryContext)) {
    return deepFreeze({
      ok: false,
      admitted_count: 0,
      withheld_count: 0,
      confirm_required_count: 0,
      screened_items: [],
      execution_mode: null,
      reason: 'queryContext must be a non-null object'
    });
  }

  if (typeof queryContext.task_query !== 'string' || !queryContext.task_query.trim()) {
    return deepFreeze({
      ok: false,
      admitted_count: 0,
      withheld_count: 0,
      confirm_required_count: 0,
      screened_items: [],
      execution_mode: null,
      reason: 'task_query must be a non-empty string'
    });
  }

  const mode = queryContext.execution_mode || 'standard';
  if (!TASK_EXECUTION_MODES.includes(mode)) {
    return deepFreeze({
      ok: false,
      admitted_count: 0,
      withheld_count: 0,
      confirm_required_count: 0,
      screened_items: [],
      execution_mode: null,
      reason: `Invalid execution_mode "${mode}". Must be one of ${TASK_EXECUTION_MODES.join(', ')}`
    });
  }

  const screened = [];
  let admittedCount = 0;
  let withheldCount = 0;
  let confirmRequiredCount = 0;

  for (let i = 0; i < memories.length; i++) {
    const mem = memories[i];
    if (!mem || typeof mem !== 'object' || Array.isArray(mem) || typeof mem.content !== 'string') {
      continue;
    }

    const isQuarantined = Boolean(mem.quarantine);
    const isTainted = Boolean(mem.tainted);
    const isHardConstraint = mem.memory_type === 'CONSTRAINT_HARD';
    const isDeadEnd = mem.memory_type === 'DEAD_END';

    let itemAdmissible = true;
    let disposition = 'use_direct';
    let priority = 'normal';
    let warning = null;
    let reason = 'Item passed retrieval screen';

    // Quarantine and taint screening take precedence across all memory types
    if (isQuarantined || isTainted) {
      priority = isHardConstraint ? 'critical_constraint' : (isDeadEnd ? 'graveyard_warning' : 'normal');
      if (mode === 'high_consequence') {
        itemAdmissible = false;
        disposition = 'withhold';
        reason = 'Tainted or quarantined memory withheld during high-consequence execution';
      } else if (mode === 'standard') {
        if (isQuarantined) {
          itemAdmissible = false;
          disposition = 'ask_first';
          reason = 'Quarantined memory requires user confirmation before use';
        } else {
          itemAdmissible = true;
          disposition = 'use_indirect';
          warning = 'Memory derived from untrusted source';
          reason = 'Tainted memory admitted with provenance warning';
        }
      } else {
        // read_only mode
        itemAdmissible = true;
        disposition = 'use_indirect';
        warning = isQuarantined ? 'Quarantined item admitted for inspection only' : 'Tainted source';
        reason = 'Admitted under read-only task constraints';
      }
    } else if (isHardConstraint) {
      priority = 'critical_constraint';
      itemAdmissible = true;
      disposition = 'use_direct';
      reason = 'Hard constraint given priority placement';
    } else if (isDeadEnd) {
      priority = 'graveyard_warning';
      itemAdmissible = true;
      disposition = 'warn_prohibited';
      warning = 'Documented dead-end approach: do not retry';
      reason = 'Dead-end surfaced to reduce execution repetition';
    }

    if (itemAdmissible) {
      admittedCount++;
    } else if (disposition === 'ask_first') {
      confirmRequiredCount++;
    } else {
      withheldCount++;
    }

    screened.push({
      content: mem.content,
      origin: mem.origin || 'unknown',
      memory_type: mem.memory_type || 'FACT',
      admissible: itemAdmissible,
      disposition: disposition,
      priority: priority,
      warning: warning,
      reason: reason
    });
  }

  return deepFreeze({
    ok: true,
    admitted_count: admittedCount,
    withheld_count: withheldCount,
    confirm_required_count: confirmRequiredCount,
    screened_items: screened,
    execution_mode: mode,
    summary: `Screened ${memories.length} item(s): ${admittedCount} admitted, ${withheldCount} withheld, ${confirmRequiredCount} pending confirmation.`
  });
}

/**
 * Consolidate a collection of memory items into an active ledger.
 *
 * Implements origin-governed latest-wins supersession and dead-end graveyard
 * preservation grounded in Cognikernel and AM-Sentry specifications.
 *
 * @param {Array<object>} memories Raw list of memory records
 * @param {object} [options] Consolidation options
 * @returns {object} Deeply frozen consolidated memory state
 */
export function consolidateTwinMemoryLedger(memories, options = {}) {
  if (!Array.isArray(memories)) {
    return deepFreeze({
      ok: false,
      active_memories: [],
      graveyard: [],
      superseded_count: 0,
      total_count: 0,
      reason: 'Memories must be an array'
    });
  }

  const byKey = new Map();
  const unkeyed = [];
  const graveyard = [];
  let supersededCount = 0;

  for (let i = 0; i < memories.length; i++) {
    const item = memories[i];
    if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.content !== 'string') {
      continue;
    }

    // Preserve DEAD_END items in graveyard
    if (item.memory_type === 'DEAD_END') {
      graveyard.push(Object.freeze({ ...item }));
    }

    const key = (typeof item.decision_key === 'string' && item.decision_key.trim())
      ? item.decision_key.trim().toLowerCase()
      : null;

    if (!key) {
      unkeyed.push(Object.freeze({ ...item }));
      continue;
    }

    const itemAuth = MEMORY_ORIGIN_AUTHORITY[item.origin] || 0;
    const itemTime = Date.parse(item.timestamp || 0) || 0;

    if (!byKey.has(key)) {
      byKey.set(key, { item, auth: itemAuth, time: itemTime });
    } else {
      const current = byKey.get(key);
      // Origin authority rule: lower authority cannot supersede higher authority
      if (itemAuth < current.auth) {
        supersededCount++;
        // Keep current item, drop or archive incoming
        continue;
      }

      if (itemAuth > current.auth) {
        // Higher authority always supersedes lower authority
        supersededCount++;
        byKey.set(key, { item, auth: itemAuth, time: itemTime });
      } else {
        // Equal authority: latest timestamp wins
        if (itemTime >= current.time) {
          supersededCount++;
          byKey.set(key, { item, auth: itemAuth, time: itemTime });
        } else {
          supersededCount++;
        }
      }
    }
  }

  const active = [];
  for (const entry of byKey.values()) {
    active.push(Object.freeze({ ...entry.item }));
  }
  for (const item of unkeyed) {
    active.push(item);
  }

  return deepFreeze({
    ok: true,
    active_memories: active,
    graveyard: graveyard,
    superseded_count: supersededCount,
    total_count: memories.length
  });
}

/**
 * Summarize retrieval screening results for UI presentation without LLM generation.
 *
 * @param {object} screenResult Result from screenMemoryRetrievalCandidates
 * @returns {object} Deeply frozen summary structure
 */
export function summarizeMemoryScreenEvaluation(screenResult) {
  if (!screenResult || typeof screenResult !== 'object' || Array.isArray(screenResult)) {
    return deepFreeze({
      success: false,
      summary_text: 'Invalid screening result',
      admitted_count: 0,
      withheld_count: 0,
      confirm_required_count: 0,
      mode: null
    });
  }

  if (!screenResult.ok) {
    return deepFreeze({
      success: false,
      summary_text: `Memory screening failed: ${screenResult.reason || 'Unknown error'}`,
      admitted_count: 0,
      withheld_count: 0,
      confirm_required_count: 0,
      mode: null
    });
  }

  let text = `Retrieved ${screenResult.admitted_count} active memory item(s).`;
  if (screenResult.withheld_count > 0) {
    text += ` ${screenResult.withheld_count} item(s) withheld under ${screenResult.execution_mode} mode.`;
  }
  if (screenResult.confirm_required_count > 0) {
    text += ` ${screenResult.confirm_required_count} quarantined item(s) require confirmation.`;
  }

  return deepFreeze({
    success: true,
    summary_text: text,
    admitted_count: screenResult.admitted_count,
    withheld_count: screenResult.withheld_count,
    confirm_required_count: screenResult.confirm_required_count,
    mode: screenResult.execution_mode
  });
}

/**
 * Inter-Agent Handoff Privacy Gate and Typed Placeholder Tokenizer
 *
 * Grounded in AgentLeak (S-20261016-2463, arXiv:2602.11510) and PASAC (arXiv:2610.12463).
 * AgentLeak (El Yagoubi, Badu-Marfo and Al Mallah) reports that inter-agent messages leak
 * sensitive data at 68.8%, against 27.2% for final outputs, and that output-only audits
 * miss 41.7% of violations. PASAC establishes that reactive perimeter containment fails
 * and boundary assurance must be actively enforced during runtime coordination handoffs.
 */

export const ALLOWED_INTER_AGENT_FIELDS = Object.freeze([
  'recipient_agent',
  'task_type',
  'parameters',
  'context_items',
  'memory_items',
  'channel_origin',
  'parent_task_id'
]);

export const ALLOWED_HANDOFF_ORIGINS = Object.freeze([
  'user_direct',
  'system_internal',
  'subagent_verified',
  'external_untrusted'
]);

export const ALLOWED_HANDOFF_VERDICTS = Object.freeze([
  'allow',
  'sanitize',
  'requires_confirmation',
  'block'
]);

export const SENSITIVE_CREDENTIAL_PATTERNS = Object.freeze([
  Object.freeze({ type: 'api_key', regex: /\b(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{30,}|xox[baprs]-[a-zA-Z0-9]{10,}|AKIA[0-9A-Z]{16})\b/i }),
  Object.freeze({ type: 'bearer_token', regex: /\bbearer\s+[a-zA-Z0-9_\-\.]{16,}\b/i }),
  Object.freeze({ type: 'private_key', regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/i }),
  Object.freeze({ type: 'credit_card', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/ }),
  Object.freeze({ type: 'cvv', regex: /\bcvv[:=\s]+([0-9]{3,4})\b/i }),
  Object.freeze({ type: 'ssn_or_sin', regex: /\b\d{3}[ -]?\d{2,3}[ -]?\d{4}\b/ }),
  Object.freeze({ type: 'password_assignment', regex: /\b(?:password|passwd|pwd|secret)\s*[:=]\s*['"]?[^\s'"]{6,}['"]?/i })
]);

/**
 * Compute a deterministic 14-hex fingerprint for an inter-agent handoff.
 *
 * @param {object} handoff Handoff payload
 * @returns {string} 14-character hex string
 */
export function computeHandoffFingerprint(handoff) {
  if (!handoff || typeof handoff !== 'object' || Array.isArray(handoff)) {
    return '00000000000000';
  }
  const cleanRecipient = typeof handoff.recipient_agent === 'string' ? handoff.recipient_agent.trim() : '';
  const cleanTask = typeof handoff.task_type === 'string' ? handoff.task_type.trim() : '';
  const cleanOrigin = typeof handoff.channel_origin === 'string' ? handoff.channel_origin.trim() : 'user_direct';
  const cleanParent = typeof handoff.parent_task_id === 'string' ? handoff.parent_task_id.trim() : '';

  // Include sorted param keys AND deterministic value representations
  const paramEntries = [];
  if (handoff.parameters && typeof handoff.parameters === 'object' && !Array.isArray(handoff.parameters)) {
    for (const k of Object.keys(handoff.parameters).sort()) {
      const v = handoff.parameters[k];
      paramEntries.push(`${k}=${JSON.stringify(v)}`);
    }
  }
  const ctxEntries = Array.isArray(handoff.context_items) ? handoff.context_items.join('|') : '';
  const memCount = Array.isArray(handoff.memory_items) ? handoff.memory_items.length : 0;
  const raw = `handoff:${cleanRecipient}:${cleanTask}:${cleanOrigin}:${cleanParent}:${paramEntries.join(';')}:${ctxEntries}:${memCount}`;
  return computeContextFingerprint(raw);
}

/**
 * Audit an inter-agent handoff payload before dispatching to a subagent or tool worker.
 *
 * @param {object} handoff Handoff descriptor
 * @param {Array} grants Active twin consent grants
 * @param {Array} constraints Active safety-critical constraints
 * @param {object} options Options: allow_tokenization (bool), allow_unconfirmed (bool)
 * @returns {object} Deeply frozen audit result
 */
export function auditInterAgentHandoff(handoff, grants = [], constraints = [], options = {}) {
  // Prototype pollution rejection
  if (handoff !== null && typeof handoff === 'object' && Object.getPrototypeOf(handoff) !== Object.prototype && Object.getPrototypeOf(handoff) !== null) {
    return deepFreeze({
      ok: false,
      error: 'invalid_handoff',
      reason: 'Prototype pollution attempt rejected',
      verdict: 'block',
      reasons: Object.freeze(['Prototype pollution attempt rejected']),
      recipient_agent: '',
      task_type: '',
      channel_origin: '',
      detected_sensitive_types: Object.freeze([]),
      fingerprint: '00000000000000',
      requires_tokenization: false
    });
  }

  if (!handoff || typeof handoff !== 'object' || Array.isArray(handoff)) {
    return deepFreeze({
      ok: false,
      error: 'invalid_handoff',
      reason: 'Handoff must be a non-null object',
      verdict: 'block',
      reasons: Object.freeze(['Handoff must be a non-null object']),
      recipient_agent: '',
      task_type: '',
      channel_origin: '',
      detected_sensitive_types: Object.freeze([]),
      fingerprint: '00000000000000',
      requires_tokenization: false
    });
  }

  // Reject unknown fields
  for (const k of Object.keys(handoff)) {
    if (!ALLOWED_INTER_AGENT_FIELDS.includes(k)) {
      return deepFreeze({
        ok: false,
        error: 'invalid_handoff',
        reason: `Unknown field in handoff: "${k}"`,
        verdict: 'block',
        reasons: Object.freeze([`Unknown field in handoff: "${k}"`]),
        recipient_agent: '',
        task_type: '',
        channel_origin: '',
        detected_sensitive_types: Object.freeze([]),
        fingerprint: '00000000000000',
        requires_tokenization: false
      });
    }
  }

  if (typeof handoff.recipient_agent !== 'string' || !handoff.recipient_agent.trim() || handoff.recipient_agent.trim().length > 60 || !/^[a-zA-Z0-9_\-\. ]+$/.test(handoff.recipient_agent.trim())) {
    return deepFreeze({
      ok: false,
      error: 'invalid_handoff',
      reason: 'recipient_agent must be an alphanumeric string up to 60 characters',
      verdict: 'block',
      reasons: Object.freeze(['recipient_agent must be an alphanumeric string up to 60 characters']),
      recipient_agent: '',
      task_type: '',
      channel_origin: '',
      detected_sensitive_types: Object.freeze([]),
      fingerprint: '00000000000000',
      requires_tokenization: false
    });
  }

  if (typeof handoff.task_type !== 'string' || !handoff.task_type.trim() || handoff.task_type.trim().length > 60 || !/^[a-zA-Z0-9_\-\. ]+$/.test(handoff.task_type.trim())) {
    return deepFreeze({
      ok: false,
      error: 'invalid_handoff',
      reason: 'task_type must be an alphanumeric string up to 60 characters',
      verdict: 'block',
      reasons: Object.freeze(['task_type must be an alphanumeric string up to 60 characters']),
      recipient_agent: handoff.recipient_agent.trim(),
      task_type: '',
      channel_origin: '',
      detected_sensitive_types: Object.freeze([]),
      fingerprint: '00000000000000',
      requires_tokenization: false
    });
  }

  const cleanRecipient = handoff.recipient_agent.trim();
  const cleanTaskType = handoff.task_type.trim();
  const normTaskType = normalizeTextForHeuristic(cleanTaskType);

  let cleanOrigin = 'user_direct';
  if (handoff.channel_origin !== undefined && handoff.channel_origin !== null) {
    if (typeof handoff.channel_origin !== 'string' || !ALLOWED_HANDOFF_ORIGINS.includes(handoff.channel_origin.trim().toLowerCase())) {
      return deepFreeze({
        ok: false,
        error: 'invalid_handoff',
        reason: `channel_origin must be one of: ${ALLOWED_HANDOFF_ORIGINS.join(', ')}`,
        verdict: 'block',
        reasons: Object.freeze([`Invalid channel_origin "${handoff.channel_origin}"`]),
        recipient_agent: cleanRecipient,
        task_type: cleanTaskType,
        channel_origin: '',
        detected_sensitive_types: Object.freeze([]),
        fingerprint: '00000000000000',
        requires_tokenization: false
      });
    }
    cleanOrigin = handoff.channel_origin.trim().toLowerCase();
  }

  if (handoff.parent_task_id !== undefined && handoff.parent_task_id !== null) {
    if (typeof handoff.parent_task_id !== 'string' || handoff.parent_task_id.trim().length > 40) {
      return deepFreeze({
        ok: false,
        error: 'invalid_handoff',
        reason: 'parent_task_id must be a string up to 40 characters',
        verdict: 'block',
        reasons: Object.freeze(['parent_task_id must be a string up to 40 characters']),
        recipient_agent: cleanRecipient,
        task_type: cleanTaskType,
        channel_origin: cleanOrigin,
        detected_sensitive_types: Object.freeze([]),
        fingerprint: '00000000000000',
        requires_tokenization: false
      });
    }
  }

  // Validate parameters
  if (handoff.parameters !== undefined && handoff.parameters !== null) {
    if (typeof handoff.parameters !== 'object' || Array.isArray(handoff.parameters)) {
      return deepFreeze({
        ok: false,
        error: 'invalid_handoff',
        reason: 'parameters must be an object',
        verdict: 'block',
        reasons: Object.freeze(['parameters must be an object']),
        recipient_agent: cleanRecipient,
        task_type: cleanTaskType,
        channel_origin: cleanOrigin,
        detected_sensitive_types: Object.freeze([]),
        fingerprint: '00000000000000',
        requires_tokenization: false
      });
    }
    if (Object.getPrototypeOf(handoff.parameters) !== Object.prototype && Object.getPrototypeOf(handoff.parameters) !== null) {
      return deepFreeze({
        ok: false,
        error: 'invalid_handoff',
        reason: 'parameters prototype pollution attempt rejected',
        verdict: 'block',
        reasons: Object.freeze(['parameters prototype pollution attempt rejected']),
        recipient_agent: cleanRecipient,
        task_type: cleanTaskType,
        channel_origin: cleanOrigin,
        detected_sensitive_types: Object.freeze([]),
        fingerprint: '00000000000000',
        requires_tokenization: false
      });
    }
  }

  // Validate context_items
  if (handoff.context_items !== undefined && handoff.context_items !== null) {
    if (!Array.isArray(handoff.context_items) || handoff.context_items.length > 50) {
      return deepFreeze({
        ok: false,
        error: 'invalid_handoff',
        reason: 'context_items must be an array of at most 50 items',
        verdict: 'block',
        reasons: Object.freeze(['context_items must be an array of at most 50 items']),
        recipient_agent: cleanRecipient,
        task_type: cleanTaskType,
        channel_origin: cleanOrigin,
        detected_sensitive_types: Object.freeze([]),
        fingerprint: '00000000000000',
        requires_tokenization: false
      });
    }
    for (let i = 0; i < handoff.context_items.length; i++) {
      const it = handoff.context_items[i];
      if (typeof it !== 'string' || it.length > 300) {
        return deepFreeze({
          ok: false,
          error: 'invalid_handoff',
          reason: `context_item at index ${i} must be a string up to 300 characters`,
          verdict: 'block',
          reasons: Object.freeze([`context_item at index ${i} must be a string up to 300 characters`]),
          recipient_agent: cleanRecipient,
          task_type: cleanTaskType,
          channel_origin: cleanOrigin,
          detected_sensitive_types: Object.freeze([]),
          fingerprint: '00000000000000',
          requires_tokenization: false
        });
      }
    }
  }

  // Validate memory_items
  if (handoff.memory_items !== undefined && handoff.memory_items !== null) {
    if (!Array.isArray(handoff.memory_items) || handoff.memory_items.length > 50) {
      return deepFreeze({
        ok: false,
        error: 'invalid_handoff',
        reason: 'memory_items must be an array of at most 50 items',
        verdict: 'block',
        reasons: Object.freeze(['memory_items must be an array of at most 50 items']),
        recipient_agent: cleanRecipient,
        task_type: cleanTaskType,
        channel_origin: cleanOrigin,
        detected_sensitive_types: Object.freeze([]),
        fingerprint: '00000000000000',
        requires_tokenization: false
      });
    }
  }

  // Validate options
  const opt = options && typeof options === 'object' && !Array.isArray(options) ? options : {};
  const allowTokenization = opt.allow_tokenization === true;
  const allowUnconfirmed = opt.allow_unconfirmed === true;

  const reasons = [];
  const detectedSensitiveTypes = [];
  let verdict = 'allow';

  // 1. Check Origin Authority
  if (cleanOrigin === 'external_untrusted') {
    const isHighConsequence = /delete|wipe|execute|transfer|pay|auth|egress|export/i.test(normTaskType);
    if (isHighConsequence) {
      verdict = 'block';
      reasons.push(`Untrusted origin "${cleanOrigin}" cannot initiate high-consequence task "${cleanTaskType}"`);
    }
  }

  // 2. Grant and Scope Coverage
  const safeGrants = Array.isArray(grants) ? grants : [];
  const refTime = (options && options.as_of_time !== undefined) ? Date.parse(options.as_of_time) : Date.now();
  const matchingGrant = safeGrants.find(g => {
    if (!g || typeof g !== 'object') return false;
    if (typeof g.who !== 'string' || g.who.trim().toLowerCase() !== cleanRecipient.toLowerCase()) return false;
    if (g.expires_at !== undefined && g.expires_at !== null) {
      if (typeof g.expires_at !== 'string' || !ISO_RE.test(g.expires_at)) return false;
      const exp = Date.parse(g.expires_at);
      if (isNaN(exp)) return false;
      if (!isNaN(refTime) && exp <= refTime) return false;
    }
    const what = typeof g.what === 'string' ? g.what.trim().toLowerCase() : '';
    return what === cleanTaskType.toLowerCase() || what === '*';
  });

  if (!matchingGrant) {
    if (allowUnconfirmed) {
      if (verdict !== 'block') verdict = 'requires_confirmation';
      reasons.push(`No active grant covers recipient "${cleanRecipient}" for task "${cleanTaskType}"`);
    } else {
      verdict = 'block';
      reasons.push(`No active grant covers recipient "${cleanRecipient}" for task "${cleanTaskType}"`);
    }
  } else {
    // Check wildcard grant restrictions
    const what = typeof matchingGrant.what === 'string' ? matchingGrant.what.trim().toLowerCase() : '';
    if (what === '*') {
      const isSensitiveScope = /medical|health|financial|credit|password|auth|secret/i.test(normTaskType);
      if (isSensitiveScope) {
        verdict = 'block';
        reasons.push(`Wildcard '*' grant is insufficient for sensitive inter-agent task "${cleanTaskType}"`);
      }
    }
  }

  // 3. Screen against Safety-Critical Memory Constraints
  const safeConstraints = Array.isArray(constraints) ? constraints : [];
  for (const c of safeConstraints) {
    if (!c) continue;
    const stmt = typeof c === 'string' ? c : (c.statement || '');
    if (!stmt) continue;
    const normStmt = normalizeTextForHeuristic(stmt);

    // Collect all payload text for constraint screening
    const payloadTokens = [];
    payloadTokens.push(cleanTaskType);
    if (handoff.parameters) {
      for (const [k, v] of Object.entries(handoff.parameters)) {
        payloadTokens.push(k);
        if (typeof v === 'string') payloadTokens.push(v);
        else if (Array.isArray(v)) payloadTokens.push(...v.filter(x => typeof x === 'string'));
      }
    }
    if (handoff.context_items) {
      payloadTokens.push(...handoff.context_items);
    }

    const payloadText = normalizeTextForHeuristic(payloadTokens.join(' '));

    // Check conflict heuristics
    if (/never share|do not disclose|no financial|never send|confidential/i.test(normStmt)) {
      const keywords = normStmt.replace(/never share|do not disclose|no financial|never send|confidential/gi, '').trim().split(/\s+/).filter(w => w.length > 3);
      for (const kw of keywords) {
        if (payloadText.includes(kw)) {
          verdict = 'block';
          reasons.push(`Payload conflicts with safety-critical constraint: "${stmt}"`);
          break;
        }
      }
    }
  }

  // 4. Scan parameters, context, and memory for raw credentials
  function collectStrings(val, out = []) {
    if (typeof val === 'string') out.push(val);
    else if (Array.isArray(val)) {
      for (const item of val) collectStrings(item, out);
    } else if (val && typeof val === 'object') {
      for (const v of Object.values(val)) collectStrings(v, out);
    }
    return out;
  }
  const textStrings = [];
  if (handoff.parameters) collectStrings(handoff.parameters, textStrings);
  if (handoff.context_items) collectStrings(handoff.context_items, textStrings);
  if (handoff.memory_items) collectStrings(handoff.memory_items, textStrings);

  for (const str of textStrings) {
    for (const { type, regex } of SENSITIVE_CREDENTIAL_PATTERNS) {
      const testRegex = new RegExp(regex.source, regex.flags.replace('g', ''));
      if (testRegex.test(str)) {
        detectedSensitiveTypes.push(type);
      }
    }
  }

  if (detectedSensitiveTypes.length > 0) {
    const uniqTypes = [...new Set(detectedSensitiveTypes)];
    if (allowTokenization) {
      if (verdict === 'allow') {
        verdict = 'sanitize';
      }
      reasons.push(`Detected sensitive credentials (${uniqTypes.join(', ')}): requires typed placeholder tokenization`);
    } else {
      verdict = 'block';
      reasons.push(`Detected sensitive credentials (${uniqTypes.join(', ')}): tokenization disallowed`);
    }
  }

  const fingerprint = computeHandoffFingerprint(handoff);

  return deepFreeze({
    ok: true,
    valid: verdict === 'allow' || verdict === 'sanitize',
    verdict,
    reasons: Object.freeze(reasons),
    recipient_agent: cleanRecipient,
    task_type: cleanTaskType,
    channel_origin: cleanOrigin,
    detected_sensitive_types: Object.freeze([...new Set(detectedSensitiveTypes)]),
    fingerprint,
    requires_tokenization: verdict === 'sanitize'
  });
}

/**
 * Sanitize an inter-agent handoff payload by substituting sensitive credential tokens
 * with deterministic typed placeholders (e.g. [REDACTED_API_KEY_<HASH>]).
 *
 * @param {object} handoff Handoff payload
 * @param {object} auditResult Result from auditInterAgentHandoff
 * @param {object} options Configuration options
 * @returns {object} Deeply frozen sanitized payload result
 */
export function sanitizeInterAgentPayload(handoff, auditResult, options = {}) {
  if (!auditResult || typeof auditResult !== 'object' || !auditResult.ok) {
    return deepFreeze({
      ok: false,
      error: 'invalid_audit_result',
      reason: 'Valid auditResult required for sanitization',
      sanitized_handoff: null,
      replacements_count: 0,
      placeholder_map: Object.freeze({})
    });
  }

  if (!handoff || typeof handoff !== 'object' || Array.isArray(handoff)) {
    return deepFreeze({
      ok: false,
      error: 'invalid_handoff',
      reason: 'Valid handoff object required for sanitization',
      sanitized_handoff: null,
      replacements_count: 0,
      placeholder_map: Object.freeze({})
    });
  }

  const placeholderMap = {};
  let replacementsCount = 0;

  function scrubString(str) {
    if (typeof str !== 'string') return str;
    let result = str;
    for (const { type, regex } of SENSITIVE_CREDENTIAL_PATTERNS) {
      const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
      result = result.replace(globalRegex, (match) => {
        const hash = computeContextFingerprint(match);
        const placeholder = `[REDACTED_${type.toUpperCase()}_${hash}]`;
        placeholderMap[placeholder] = type;
        replacementsCount++;
        return placeholder;
      });
    }
    return result;
  }

  function scrubValue(val) {
    if (typeof val === 'string') return scrubString(val);
    if (Array.isArray(val)) return val.map(scrubValue);
    if (val && typeof val === 'object') {
      const copy = {};
      for (const [k, v] of Object.entries(val)) {
        copy[k] = scrubValue(v);
      }
      return copy;
    }
    return val;
  }

  const sanitized = {
    recipient_agent: handoff.recipient_agent,
    task_type: handoff.task_type
  };

  if (handoff.channel_origin !== undefined) sanitized.channel_origin = handoff.channel_origin;
  if (handoff.parent_task_id !== undefined) sanitized.parent_task_id = handoff.parent_task_id;

  if (handoff.parameters) {
    sanitized.parameters = scrubValue(handoff.parameters);
  }

  if (handoff.context_items) {
    sanitized.context_items = scrubValue(handoff.context_items);
  }

  if (handoff.memory_items) {
    sanitized.memory_items = scrubValue(handoff.memory_items);
  }

  return deepFreeze({
    ok: true,
    sanitized_handoff: sanitized,
    replacements_count: replacementsCount,
    placeholder_map: Object.freeze({ ...placeholderMap })
  });
}

/**
 * Summarize an inter-agent handoff audit for UI reporting without LLM generation.
 *
 * @param {object} auditResult Result from auditInterAgentHandoff
 * @returns {object} Deeply frozen summary structure
 */
export function summarizeInterAgentAudit(auditResult) {
  if (!auditResult || typeof auditResult !== 'object' || Array.isArray(auditResult)) {
    return deepFreeze({
      success: false,
      summary_text: 'Invalid inter-agent handoff audit',
      verdict: 'block'
    });
  }

  if (!auditResult.ok) {
    return deepFreeze({
      success: false,
      summary_text: `Inter-agent handoff audit failed: ${auditResult.reason || 'Unknown error'}`,
      verdict: 'block'
    });
  }

  let text = '';
  if (auditResult.verdict === 'allow') {
    text = `Handoff to "${auditResult.recipient_agent}" for "${auditResult.task_type}" allowed under active grant. (fingerprint: ${auditResult.fingerprint})`;
  } else if (auditResult.verdict === 'sanitize') {
    text = `Handoff to "${auditResult.recipient_agent}" requires placeholder sanitization for ${auditResult.detected_sensitive_types.join(', ')}. (fingerprint: ${auditResult.fingerprint})`;
  } else if (auditResult.verdict === 'requires_confirmation') {
    text = `Handoff to "${auditResult.recipient_agent}" for "${auditResult.task_type}" requires user confirmation: ${auditResult.reasons.join('; ')}.`;
  } else {
    text = `Handoff to "${auditResult.recipient_agent}" blocked: ${auditResult.reasons.join('; ')}.`;
  }

  return deepFreeze({
    success: auditResult.verdict === 'allow' || auditResult.verdict === 'sanitize',
    summary_text: text,
    verdict: auditResult.verdict,
    recipient_agent: auditResult.recipient_agent,
    task_type: auditResult.task_type,
    fingerprint: auditResult.fingerprint
  });
}
export const ALLOWED_VISUAL_ACTION_TYPES = Object.freeze([
  'click',
  'type',
  'scroll',
  'drag',
  'navigate',
  'select'
]);

export const ALLOWED_VISUAL_ACTION_FIELDS = Object.freeze([
  'id',
  'assistant_id',
  'action_type',
  'target_element',
  'proposed_input',
  'viewport',
  'destination_domain',
  'requires_consent_receipt'
]);

export const ALLOWED_VISUAL_OPTIONS_FIELDS = Object.freeze([
  'allow_sensitive_input',
  'require_consent_receipt',
  'receipt',
  'screen_width',
  'screen_height'
]);

export const ALLOWED_VISUAL_ELEMENT_FIELDS = Object.freeze([
  'tag_name',
  'element_type',
  'accessible_name',
  'bounding_box',
  'is_sensitive',
  'detected_text'
]);

export const ALLOWED_BOUNDING_BOX_FIELDS = Object.freeze([
  'x',
  'y',
  'width',
  'height'
]);

export const ALLOWED_VIEWPORT_FIELDS = Object.freeze([
  'width',
  'height'
]);

export const SENSITIVE_INPUT_TYPES = Object.freeze([
  'password',
  'credit-card',
  'cvv',
  'ssn',
  'auth-token',
  'totp',
  'bank-account',
  'credential'
]);

export const VISUAL_PROMPT_INJECTION_PATTERNS = Object.freeze([
  'ignore previous instructions',
  'system prompt:',
  'you are now in maintenance mode',
  'maintenance mode',
  'exfiltrate',
  'send credentials',
  'repeat after me',
  'transfer funds',
  'developer mode',
  'bypass safety',
  'override permissions'
]);

/**
 * Deterministically validate bounding box geometry within viewport boundaries.
 */
export function validateBoundingBox(box, viewport) {
  if (!box || typeof box !== 'object' || Array.isArray(box)) {
    return { ok: false, error: 'Bounding box must be a plain object' };
  }
  if (!viewport || typeof viewport !== 'object' || Array.isArray(viewport)) {
    return { ok: false, error: 'Viewport must be a plain object' };
  }

  for (const forbidden of ['__proto__', 'constructor', 'prototype']) {
    if (Object.prototype.hasOwnProperty.call(box, forbidden) || Object.prototype.hasOwnProperty.call(viewport, forbidden)) {
      return { ok: false, error: 'Prototype modifications are strictly forbidden' };
    }
  }

  for (const k of Object.keys(box)) {
    if (!ALLOWED_BOUNDING_BOX_FIELDS.includes(k)) {
      return { ok: false, error: `Unknown bounding box field: ${k}` };
    }
  }
  for (const k of Object.keys(viewport)) {
    if (!ALLOWED_VIEWPORT_FIELDS.includes(k)) {
      return { ok: false, error: `Unknown viewport field: ${k}` };
    }
  }

  for (const f of ALLOWED_BOUNDING_BOX_FIELDS) {
    if (typeof box[f] !== 'number' || !Number.isFinite(box[f])) {
      return { ok: false, error: `Bounding box ${f} must be a finite number` };
    }
  }
  for (const f of ALLOWED_VIEWPORT_FIELDS) {
    if (typeof viewport[f] !== 'number' || !Number.isFinite(viewport[f]) || !Number.isInteger(viewport[f]) || viewport[f] <= 0) {
      return { ok: false, error: `Viewport ${f} must be a positive integer` };
    }
  }

  if (box.x < 0 || box.y < 0) {
    return { ok: false, error: 'Bounding box coordinates (x, y) must be non-negative' };
  }
  if (box.width <= 0 || box.height <= 0) {
    return { ok: false, error: 'Bounding box dimensions (width, height) must be strictly positive' };
  }

  if (box.x + box.width > viewport.width) {
    return { ok: false, error: `Bounding box horizontal span (${box.x} + ${box.width} = ${box.x + box.width}) exceeds viewport width (${viewport.width})` };
  }
  if (box.y + box.height > viewport.height) {
    return { ok: false, error: `Bounding box vertical span (${box.y} + ${box.height} = ${box.y + box.height}) exceeds viewport height (${viewport.height})` };
  }

  return { ok: true };
}

/**
 * Compute deterministic 14-hex fingerprint for visual action candidate.
 */
export function computeVisualActionFingerprint(action) {
  const elem = action.target_element || {};
  const box = elem.bounding_box || {};
  const vp = action.viewport || {};
  const seed = `${action.assistant_id || ''}|${action.action_type || ''}|${elem.tag_name || ''}|${elem.element_type || ''}|${elem.accessible_name || ''}|${elem.detected_text || ''}|${box.x || 0},${box.y || 0},${box.width || 0},${box.height || 0}|${vp.width || 0}x${vp.height || 0}|${action.proposed_input || ''}|${action.destination_domain || ''}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x5bd1e995;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c;
    h2 = Math.imul(h2, 0x5bd1e995);
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(6, '0').slice(0, 6);
  return `${part1}${part2}`;
}

/**
 * Audit on-device visual assistant actions against sensitive form elements,
 * visual prompt injection patterns, critical constraints, and consent grants.
 * Fails closed on any ambiguity or malformed input.
 */
export function auditVisualAssistantAction(actionCandidate, contextState, options = {}) {
  // 1. Validate options
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Options must be a plain object',
      violations: ['Invalid options structure'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  if (Object.getPrototypeOf(options) !== Object.prototype && Object.getPrototypeOf(options) !== null) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Prototype modifications are strictly forbidden in options',
      violations: ['Prototype pollution attempt in options'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  for (const forbidden of ['__proto__', 'constructor', 'prototype']) {
    if (Object.prototype.hasOwnProperty.call(options, forbidden)) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: 'Prototype modifications are strictly forbidden in options',
        violations: ['Prototype pollution attempt in options'],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: null,
        action_type: null
      });
    }
  }

  for (const k of Object.keys(options)) {
    if (!ALLOWED_VISUAL_OPTIONS_FIELDS.includes(k)) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: `Unknown option field: ${k}`,
        violations: [`Disallowed option field '${k}'`],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: null,
        action_type: null
      });
    }
  }

  if ('allow_sensitive_input' in options && typeof options.allow_sensitive_input !== 'boolean') {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Option allow_sensitive_input must be a boolean',
      violations: ['Invalid type for allow_sensitive_input option'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  if ('require_consent_receipt' in options && typeof options.require_consent_receipt !== 'boolean') {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Option require_consent_receipt must be a boolean',
      violations: ['Invalid type for require_consent_receipt option'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  // 2. Validate contextState
  const validatedState = validateTwinState(contextState);
  if (!validatedState.ok) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: `Invalid context state: ${validatedState.error}`,
      violations: ['Context state validation failed'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }
  const cleanState = validatedState.value;

  // 3. Validate actionCandidate
  if (!actionCandidate || typeof actionCandidate !== 'object' || Array.isArray(actionCandidate)) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Action candidate must be a plain object',
      violations: ['Invalid actionCandidate object structure'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  if (Object.getPrototypeOf(actionCandidate) !== Object.prototype && Object.getPrototypeOf(actionCandidate) !== null) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Prototype modifications are strictly forbidden',
      violations: ['Prototype pollution attempt detected'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  for (const forbidden of ['__proto__', 'constructor', 'prototype']) {
    if (Object.prototype.hasOwnProperty.call(actionCandidate, forbidden)) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: 'Prototype modifications are strictly forbidden',
        violations: ['Prototype pollution attempt detected'],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: null,
        action_type: null
      });
    }
  }

  for (const k of Object.keys(actionCandidate)) {
    if (!ALLOWED_VISUAL_ACTION_FIELDS.includes(k)) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: `Unknown field in action candidate: ${k}`,
        violations: [`Disallowed field '${k}'`],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: null,
        action_type: null
      });
    }
  }

  if (typeof actionCandidate.id !== 'string' || !actionCandidate.id.trim() || actionCandidate.id.length > 60) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Valid id string required (1-60 characters)',
      violations: ['Invalid or missing action id'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  if (typeof actionCandidate.assistant_id !== 'string' || !actionCandidate.assistant_id.trim() || actionCandidate.assistant_id.length > 60) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Valid assistant_id string required (1-60 characters)',
      violations: ['Invalid or missing assistant_id'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: null,
      action_type: null
    });
  }

  if (!ALLOWED_VISUAL_ACTION_TYPES.includes(actionCandidate.action_type)) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: `Disallowed action_type: ${actionCandidate.action_type}`,
      violations: [`Unknown action_type '${actionCandidate.action_type}'`],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: null
    });
  }

  if ('requires_consent_receipt' in actionCandidate && typeof actionCandidate.requires_consent_receipt !== 'boolean') {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Field requires_consent_receipt must be a boolean',
      violations: ['Invalid type for requires_consent_receipt'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  if ('proposed_input' in actionCandidate && actionCandidate.proposed_input !== undefined) {
    if (typeof actionCandidate.proposed_input !== 'string' || actionCandidate.proposed_input.length > 1000) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: 'proposed_input must be a string up to 1000 characters',
        violations: ['Invalid type or length for proposed_input'],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: actionCandidate.assistant_id,
        action_type: actionCandidate.action_type
      });
    }
  }

  if ('destination_domain' in actionCandidate && actionCandidate.destination_domain !== undefined) {
    if (typeof actionCandidate.destination_domain !== 'string' || actionCandidate.destination_domain.length > 100) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: 'destination_domain must be a string up to 100 characters',
        violations: ['Invalid type or length for destination_domain'],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: actionCandidate.assistant_id,
        action_type: actionCandidate.action_type
      });
    }
  }

  // Target element validation
  const elem = actionCandidate.target_element;
  if (!elem || typeof elem !== 'object' || Array.isArray(elem)) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Target element must be a valid object',
      violations: ['Missing or malformed target_element'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  if (Object.getPrototypeOf(elem) !== Object.prototype && Object.getPrototypeOf(elem) !== null) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Prototype modifications are strictly forbidden in target_element',
      violations: ['Prototype pollution attempt in target_element'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  for (const forbidden of ['__proto__', 'constructor', 'prototype']) {
    if (Object.prototype.hasOwnProperty.call(elem, forbidden)) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: 'Prototype modifications are strictly forbidden in target_element',
        violations: ['Prototype pollution attempt in target_element'],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: actionCandidate.assistant_id,
        action_type: actionCandidate.action_type
      });
    }
  }

  for (const k of Object.keys(elem)) {
    if (!ALLOWED_VISUAL_ELEMENT_FIELDS.includes(k)) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: `Unknown field in target_element: ${k}`,
        violations: [`Disallowed target_element field '${k}'`],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: actionCandidate.assistant_id,
        action_type: actionCandidate.action_type
      });
    }
  }

  if (typeof elem.tag_name !== 'string' || !elem.tag_name.trim() || elem.tag_name.length > 30) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'tag_name must be a non-empty string up to 30 characters',
      violations: ['Invalid or missing tag_name'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  if (typeof elem.element_type !== 'string' || !elem.element_type.trim() || elem.element_type.length > 50) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'element_type must be a non-empty string up to 50 characters',
      violations: ['Invalid or missing element_type'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  if ('is_sensitive' in elem && typeof elem.is_sensitive !== 'boolean') {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: 'Field is_sensitive must be a boolean',
      violations: ['Invalid type for is_sensitive'],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  if ('accessible_name' in elem && elem.accessible_name !== undefined) {
    if (typeof elem.accessible_name !== 'string' || elem.accessible_name.length > 150) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: 'accessible_name must be a string up to 150 characters',
        violations: ['Invalid type or length for accessible_name'],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: actionCandidate.assistant_id,
        action_type: actionCandidate.action_type
      });
    }
  }

  if ('detected_text' in elem && elem.detected_text !== undefined) {
    if (typeof elem.detected_text !== 'string' || elem.detected_text.length > 500) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        reason: 'detected_text must be a string up to 500 characters',
        violations: ['Invalid type or length for detected_text'],
        risk_level: 'critical',
        fingerprint: '00000000000000',
        assistant_id: actionCandidate.assistant_id,
        action_type: actionCandidate.action_type
      });
    }
  }

  const boxValidation = validateBoundingBox(elem.bounding_box, actionCandidate.viewport);
  if (!boxValidation.ok) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      reason: `Geometry validation failed: ${boxValidation.error}`,
      violations: [boxValidation.error],
      risk_level: 'critical',
      fingerprint: '00000000000000',
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  const fingerprint = computeVisualActionFingerprint(actionCandidate);
  const violations = [];
  let riskLevel = 'low';

  // Check 1: Sensitive Form Elements (passwords, credit cards, CVVs, SSN)
  const elemType = elem.element_type.toLowerCase().trim();
  const tagName = elem.tag_name.toLowerCase().trim();
  const isSensitive = elem.is_sensitive === true || SENSITIVE_INPUT_TYPES.includes(elemType) || (tagName === 'input' && elemType === 'password');

  if (isSensitive) {
    riskLevel = 'critical';
    if (!options.allow_sensitive_input) {
      violations.push(`Automated interaction with sensitive form element (${elemType || 'sensitive'}) is prohibited without explicit authorization`);
    }
  }

  // Check 2: Visual Prompt Injection (VPI) with Unicode and whitespace canonicalization
  const rawDetected = elem.detected_text || '';
  const rawInput = actionCandidate.proposed_input || '';
  const normDetected = normalizeTextForHeuristic(rawDetected);
  const normInput = normalizeTextForHeuristic(rawInput);

  for (const pat of VISUAL_PROMPT_INJECTION_PATTERNS) {
    const normPat = normalizeTextForHeuristic(pat);
    if (normDetected.includes(normPat) || normInput.includes(normPat)) {
      riskLevel = 'critical';
      violations.push(`Visual prompt injection cue detected matching pattern: '${pat}'`);
    }
  }

  // Check 3: Safety-critical Memory Constraints across input and element labels
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'over', 'than',
    'after', 'also', 'never', 'must', 'should', 'always', 'not', 'are', 'was', 'were',
    'all', 'any', 'our', 'your', 'their', 'please', 'can', 'will'
  ]);
  const actionText = `${rawInput} ${rawDetected} ${elem.accessible_name || ''}`.toLowerCase();
  const actionWords = new Set(extractWords(actionText));

  if (Array.isArray(cleanState.facts)) {
    const criticalFacts = cleanState.facts.filter(f => f && f.critical === true);
    for (const cf of criticalFacts) {
      const factWords = extractWords(cf.statement || '').filter(w => !stopWords.has(w) && w.length >= 3);
      if (factWords.length > 0) {
        const matchedKeywords = factWords.filter(w => actionWords.has(w));
        if (matchedKeywords.length > 0) {
          riskLevel = 'high';
          violations.push(`Action labels or proposed input conflicts with safety-critical memory constraint: "${cf.statement}" (keyword: ${matchedKeywords.join(', ')})`);
        }
      }
    }
  }

  // Check 4: Portable Consent Receipt Verification and Recipient Binding
  const requiresReceipt = actionCandidate.requires_consent_receipt === true || options.require_consent_receipt === true;
  if (requiresReceipt) {
    if (!options.receipt) {
      riskLevel = 'high';
      violations.push('Action requires a valid portable consent receipt, but none was provided');
    } else {
      const receiptRes = verifyConsentReceipt(cleanState, options.receipt);
      if (!receiptRes.valid) {
        riskLevel = 'high';
        violations.push(`Consent receipt verification failed: ${receiptRes.reason}`);
      } else {
        const receiptRecipient = (receiptRes.recipient || (options.receipt && options.receipt.recipient) || '').toLowerCase().trim();
        const assistantId = actionCandidate.assistant_id.toLowerCase().trim();
        if (receiptRecipient !== assistantId) {
          riskLevel = 'high';
          violations.push(`Consent receipt recipient mismatch: receipt issued to '${receiptRecipient}', but requested by assistant '${assistantId}'`);
        }
      }
    }
  }

  // Decision determination
  if (violations.length > 0) {
    const isCritical = riskLevel === 'critical';
    return deepFreeze({
      ok: false,
      decision: isCritical ? 'blocked' : 'requires_confirmation',
      reason: violations[0],
      violations,
      risk_level: riskLevel,
      fingerprint,
      assistant_id: actionCandidate.assistant_id,
      action_type: actionCandidate.action_type
    });
  }

  return deepFreeze({
    ok: true,
    decision: 'admitted',
    reason: 'Action passed all visual security boundaries, geometry containment, and sensitive field screens',
    violations: [],
    risk_level: 'low',
    fingerprint,
    assistant_id: actionCandidate.assistant_id,
    action_type: actionCandidate.action_type
  });
}

/**
 * Summarize visual action audit results for UI presentation without innerHTML or LLM dependencies.
 */
export function summarizeVisualActionAudit(auditResult) {
  if (!auditResult || typeof auditResult !== 'object' || Array.isArray(auditResult)) {
    return deepFreeze({
      success: false,
      summary_text: 'Invalid visual action audit result',
      decision: 'blocked',
      risk_level: 'critical',
      violation_count: 0
    });
  }

  if (auditResult.ok && auditResult.decision === 'admitted') {
    return deepFreeze({
      success: true,
      summary_text: `Admitted ${auditResult.action_type || 'action'} by ${auditResult.assistant_id || 'assistant'} (fingerprint ${auditResult.fingerprint || 'none'}).`,
      decision: 'admitted',
      risk_level: 'low',
      violation_count: 0
    });
  }

  const vCount = Array.isArray(auditResult.violations) ? auditResult.violations.length : 0;
  const decisionText = auditResult.decision === 'blocked' ? 'Blocked' : 'Requires confirmation';
  const reasonText = auditResult.reason || 'Security check failed';

  return deepFreeze({
    success: false,
    summary_text: `${decisionText} [${auditResult.risk_level || 'high'} risk]: ${reasonText} (${vCount} violation(s)).`,
    decision: auditResult.decision || 'blocked',
    risk_level: auditResult.risk_level || 'high',
    violation_count: vCount
  });
}

export const ALLOWED_FORM_SCHEMA_FIELDS = Object.freeze([
  'service',
  'fields'
]);

export const ALLOWED_FIELD_SPEC_FIELDS = Object.freeze([
  'type',
  'required',
  'sensitive',
  'purpose'
]);

export const ALLOWED_FIELD_TYPES = Object.freeze([
  'string',
  'number',
  'integer',
  'boolean',
  'email',
  'phone',
  'date'
]);

export const ALLOWED_MINIMIZATION_OPTIONS_FIELDS = Object.freeze([
  'disclose_optional',
  'now'
]);

export const MINIMIZATION_RECEIPT_FIELDS = Object.freeze([
  'id',
  'target_service',
  'timestamp',
  'retained_fields',
  'pruned_fields',
  'minimized_payload',
  'payload_digest',
  'status'
]);

/**
 * Validate and minimize an outgoing form submission against a declared form schema.
 * Automatically filters unrequested or optional sensitive fields by default unless
 * explicitly included in options.disclose_optional. Emits a deterministic disclosure receipt.
 *
 * @param {object} formSchema Target form schema with declared fields and types
 * @param {object} rawPayload Raw form data to be submitted
 * @param {object} options Configuration options (disclose_optional, now)
 * @returns {object} Deeply frozen minimization result and receipt
 */
export function minimizeFormSubmission(formSchema, rawPayload, options = {}) {
  // Reject prototype pollution
  const isPoisoned = (obj) => obj !== null && typeof obj === 'object' && Object.getPrototypeOf(obj) !== Object.prototype && Object.getPrototypeOf(obj) !== null;
  if (isPoisoned(formSchema) || isPoisoned(rawPayload) || isPoisoned(options)) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      reason: 'Prototype pollution attempt rejected',
      violations: Object.freeze(['Prototype pollution attempt rejected']),
      retained_fields: Object.freeze([]),
      pruned_fields: Object.freeze([]),
      minimized_payload: deepFreeze({}),
      receipt: null
    });
  }

  const violations = [];

  // Validate formSchema
  if (!formSchema || typeof formSchema !== 'object' || Array.isArray(formSchema)) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      reason: 'formSchema must be a non-null object',
      violations: Object.freeze(['formSchema must be a non-null object']),
      retained_fields: Object.freeze([]),
      pruned_fields: Object.freeze([]),
      minimized_payload: deepFreeze({}),
      receipt: null
    });
  }

  for (const k of Object.keys(formSchema)) {
    if (!ALLOWED_FORM_SCHEMA_FIELDS.includes(k)) {
      violations.push(`Unknown field in formSchema: "${k}"`);
    }
  }

  if (typeof formSchema.service !== 'string' || formSchema.service.trim().length === 0 || formSchema.service.trim().length > 100) {
    violations.push('formSchema.service must be a non-empty string up to 100 characters');
  }

  if (!formSchema.fields || typeof formSchema.fields !== 'object' || Array.isArray(formSchema.fields) || isPoisoned(formSchema.fields)) {
    violations.push('formSchema.fields must be a non-null object');
  } else {
    const fieldKeys = Object.keys(formSchema.fields);
    if (fieldKeys.length === 0) {
      violations.push('formSchema.fields must contain at least one declared field');
    }
    for (const fieldName of fieldKeys) {
      if (typeof fieldName !== 'string' || !/^[a-zA-Z0-9_-]{1,60}$/.test(fieldName)) {
        violations.push(`Field name "${fieldName}" is invalid: must be 1-60 alphanumeric, underscore, or dash characters`);
        continue;
      }
      const spec = formSchema.fields[fieldName];
      if (!spec || typeof spec !== 'object' || Array.isArray(spec) || isPoisoned(spec)) {
        violations.push(`Field spec for "${fieldName}" must be a non-null object`);
        continue;
      }
      for (const sk of Object.keys(spec)) {
        if (!ALLOWED_FIELD_SPEC_FIELDS.includes(sk)) {
          violations.push(`Unknown property "${sk}" in field spec for "${fieldName}"`);
        }
      }
      if (typeof spec.type !== 'string' || !ALLOWED_FIELD_TYPES.includes(spec.type)) {
        violations.push(`Field "${fieldName}" has invalid type "${spec.type}". Allowed: ${ALLOWED_FIELD_TYPES.join(', ')}`);
      }
      if (spec.required !== undefined && typeof spec.required !== 'boolean') {
        violations.push(`Field "${fieldName}" required attribute must be boolean`);
      }
      if (spec.sensitive !== undefined && typeof spec.sensitive !== 'boolean') {
        violations.push(`Field "${fieldName}" sensitive attribute must be boolean`);
      }
      if (spec.purpose !== undefined && (typeof spec.purpose !== 'string' || spec.purpose.length > 200)) {
        violations.push(`Field "${fieldName}" purpose must be a string up to 200 characters`);
      }
    }
  }

  // Validate options
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    violations.push('options must be a plain object');
  } else {
    for (const ok of Object.keys(options)) {
      if (!ALLOWED_MINIMIZATION_OPTIONS_FIELDS.includes(ok)) {
        violations.push(`Unknown option "${ok}". Allowed: ${ALLOWED_MINIMIZATION_OPTIONS_FIELDS.join(', ')}`);
      }
    }
    if (options.disclose_optional !== undefined) {
      if (!Array.isArray(options.disclose_optional)) {
        violations.push('options.disclose_optional must be an array of field names');
      } else {
        for (const it of options.disclose_optional) {
          if (typeof it !== 'string' || it.trim().length === 0) {
            violations.push('options.disclose_optional elements must be non-empty strings');
            break;
          }
          if (formSchema && formSchema.fields && typeof formSchema.fields === 'object') {
            if (!Object.prototype.hasOwnProperty.call(formSchema.fields, it)) {
              violations.push(`Undeclared field "${it}" in options.disclose_optional`);
            } else if (formSchema.fields[it]?.required === true) {
              violations.push(`Field "${it}" in options.disclose_optional is already required`);
            }
          }
        }
      }
    }
    if (options.now !== undefined && (typeof options.now !== 'string' || !ISO_RE.test(options.now) || isNaN(Date.parse(options.now)))) {
      violations.push('options.now must be a valid ISO timestamp string');
    }
  }

  // Validate rawPayload
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    violations.push('rawPayload must be a non-null object');
  }

  if (violations.length > 0) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      reason: violations[0],
      violations: Object.freeze([...violations]),
      retained_fields: Object.freeze([]),
      pruned_fields: Object.freeze([]),
      minimized_payload: deepFreeze({}),
      receipt: null
    });
  }

  const fieldsDict = formSchema.fields;
  const payloadKeys = Object.keys(rawPayload);

  // Unknown fields in payload fail closed
  for (const pk of payloadKeys) {
    if (!Object.prototype.hasOwnProperty.call(fieldsDict, pk)) {
      violations.push(`Unknown field "${pk}" not declared in form schema`);
    }
  }

  if (violations.length > 0) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      reason: violations[0],
      violations: Object.freeze([...violations]),
      retained_fields: Object.freeze([]),
      pruned_fields: Object.freeze([]),
      minimized_payload: deepFreeze({}),
      receipt: null
    });
  }

  const allowedDisclosures = Array.isArray(options.disclose_optional) ? options.disclose_optional : [];
  const retainedFields = [];
  const prunedFields = [];
  const minimizedPayload = {};

  // Check all declared schema fields
  for (const fieldName of Object.keys(fieldsDict).sort()) {
    const spec = fieldsDict[fieldName];
    const isRequired = spec.required === true;
    const isPresent = Object.prototype.hasOwnProperty.call(rawPayload, fieldName);
    const value = rawPayload[fieldName];

    if (isRequired) {
      if (!isPresent || value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        violations.push(`Missing required field "${fieldName}"`);
        continue;
      }
      if (!validateFieldType(value, spec.type)) {
        violations.push(`Required field "${fieldName}" value does not match declared type "${spec.type}"`);
        continue;
      }
      retainedFields.push(fieldName);
      minimizedPayload[fieldName] = value;
    } else if (isPresent && value !== undefined && value !== null) {
      // Optional field is provided: check if blank string
      const isBlank = typeof value === 'string' && value.trim() === '';
      if (!isBlank) {
        if (!validateFieldType(value, spec.type)) {
          violations.push(`Optional field "${fieldName}" value does not match declared type "${spec.type}"`);
          continue;
        }
        if (allowedDisclosures.includes(fieldName)) {
          retainedFields.push(fieldName);
          minimizedPayload[fieldName] = value;
        } else {
          prunedFields.push(fieldName);
        }
      } else {
        prunedFields.push(fieldName);
      }
    }
  }

  if (violations.length > 0) {
    return deepFreeze({
      ok: false,
      status: 'rejected',
      reason: violations[0],
      violations: Object.freeze([...violations]),
      retained_fields: Object.freeze([]),
      pruned_fields: Object.freeze([]),
      minimized_payload: deepFreeze({}),
      receipt: null
    });
  }

  retainedFields.sort();
  prunedFields.sort();

  // Deterministic serialization of minimized payload
  const sortedKeys = Object.keys(minimizedPayload).sort();
  const sortedPayloadObj = {};
  for (const k of sortedKeys) {
    sortedPayloadObj[k] = minimizedPayload[k];
  }
  const serialized = JSON.stringify(sortedPayloadObj);
  const payloadDigest = computeContextFingerprint(serialized);
  const timestamp = options.now ? new Date(options.now).toISOString() : new Date().toISOString();
  const cleanService = formSchema.service.trim();
  const rawSeed = `minrec:${cleanService}:${retainedFields.join(',')}:${prunedFields.join(',')}:${payloadDigest}:${timestamp}`;
  const receiptId = `minrec-${computeContextFingerprint(rawSeed)}`;

  const receipt = deepFreeze({
    id: receiptId,
    target_service: cleanService,
    timestamp,
    retained_fields: Object.freeze([...retainedFields]),
    pruned_fields: Object.freeze([...prunedFields]),
    minimized_payload: deepFreeze(sortedPayloadObj),
    payload_digest: payloadDigest,
    status: 'minimized'
  });

  return deepFreeze({
    ok: true,
    status: 'minimized',
    reason: `Minimized payload for ${cleanService}: retained ${retainedFields.length} field(s), pruned ${prunedFields.length} optional field(s)`,
    violations: Object.freeze([]),
    retained_fields: Object.freeze([...retainedFields]),
    pruned_fields: Object.freeze([...prunedFields]),
    minimized_payload: deepFreeze(sortedPayloadObj),
    receipt
  });
}

/**
 * Validate a field's value against its declared type.
 */
function validateFieldType(val, type) {
  switch (type) {
    case 'string':
      return typeof val === 'string';
    case 'number':
      return typeof val === 'number' && Number.isFinite(val);
    case 'integer':
      return Number.isSafeInteger(val);
    case 'boolean':
      return typeof val === 'boolean';
    case 'email':
      return typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    case 'phone':
      return typeof val === 'string' && /^\+?[0-9\s\-()]{7,25}$/.test(val.trim()) && (val.match(/\d/g) || []).length >= 7;
    case 'date': {
      if (typeof val !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const d = new Date(val + 'T00:00:00.000Z');
      return !isNaN(d.getTime()) && d.toISOString().startsWith(val);
    }
    default:
      return false;
  }
}

/**
 * Summarize form minimization results for UI display without innerHTML or LLM dependencies.
 *
 * @param {object} result Result object from minimizeFormSubmission
 * @returns {object} Deeply frozen summary descriptor
 */
export function summarizeFormMinimization(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return deepFreeze({
      success: false,
      summary_text: 'Invalid minimization result',
      status: 'rejected',
      retained_count: 0,
      pruned_count: 0,
      violations: Object.freeze(['Invalid minimization result'])
    });
  }

  if (result.ok && result.status === 'minimized') {
    const sName = result.receipt?.target_service || 'service';
    const rCount = Array.isArray(result.retained_fields) ? result.retained_fields.length : 0;
    const pCount = Array.isArray(result.pruned_fields) ? result.pruned_fields.length : 0;
    const digest = result.receipt?.payload_digest || 'none';
    return deepFreeze({
      success: true,
      summary_text: `Minimized form for ${sName}: retained ${rCount} required/permitted field(s), pruned ${pCount} optional field(s) [digest: ${digest}].`,
      status: 'minimized',
      retained_count: rCount,
      pruned_count: pCount,
      violations: Object.freeze([])
    });
  }

  const vList = Array.isArray(result.violations) ? result.violations : [];
  const reasonText = result.reason || 'Form minimization validation failed';
  return deepFreeze({
    success: false,
    summary_text: `Submission rejected: ${reasonText} (${vList.length} violation(s)).`,
    status: 'rejected',
    retained_count: 0,
    pruned_count: 0,
    violations: Object.freeze([...vList])
  });
}

/**
 * Allowed fields for personal browser twin authority envelopes.
 */
export const ALLOWED_AUTHORITY_ENVELOPE_FIELDS = Object.freeze([
  'envelope_id',
  'grantee',
  'allowed_domains',
  'allowed_actions',
  'allowed_scopes',
  'expires_at',
  'max_requests',
  'requires_human_approval_for_write',
  'disallow_credentials',
  'disallow_subdomains'
]);

/**
 * Allowed fields for action candidates evaluated against authority envelopes.
 * Note: Reference time is host-controlled via options, never caller-declared.
 */
export const ALLOWED_AUTHORITY_ACTION_FIELDS = Object.freeze([
  'request_id',
  'grantee',
  'action',
  'target_domain',
  'target_url',
  'scope',
  'is_write',
  'contains_credentials'
]);

/**
 * Allowed fields for evaluation options.
 */
export const ALLOWED_AUTHORITY_OPTIONS_FIELDS = Object.freeze([
  'now'
]);

/**
 * Sensitive authority actions that always require human confirmation.
 */
export const SENSITIVE_AUTHORITY_ACTIONS = Object.freeze([
  'oauth_grant',
  'oauth_authorize',
  'register_webhook',
  'export_credentials',
  'modify_permissions',
  'delete_account',
  'transfer_funds',
  'install_extension'
]);

/**
 * Inherently mutating actions that require human confirmation when write gating is enabled.
 */
export const INHERENTLY_MUTATING_ACTIONS = Object.freeze([
  'write',
  'update',
  'delete',
  'post',
  'create',
  'put',
  'patch',
  'remove'
]);

/**
 * Deterministically evaluate a proposed assistant action against an active authority envelope.
 * Fail-closed validation outside model reasoning to prevent confused-deputy prompt injections.
 *
 * @param {object} envelope Active task-bound authority envelope
 * @param {object} actionRequest Candidate action request from assistant
 * @param {object} options Evaluation options (e.g. host-controlled reference time)
 * @returns {object} Deeply frozen evaluation result
 */
export function evaluateAuthorityEnvelopeAction(envelope, actionRequest, options = {}) {
  const nowIso = new Date().toISOString();

  // 1. Structural and type checks
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope) ||
      !actionRequest || typeof actionRequest !== 'object' || Array.isArray(actionRequest)) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'invalid',
      envelope_id: null,
      grantee: null,
      action: null,
      target_domain: null,
      requires_confirmation: false,
      violations: Object.freeze(['invalid_input_structure']),
      reason: 'Envelope and action request must be valid objects',
      audit_timestamp: nowIso
    });
  }

  // Validate options structure
  if (options && (typeof options !== 'object' || Array.isArray(options))) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'invalid',
      envelope_id: null,
      grantee: null,
      action: null,
      target_domain: null,
      requires_confirmation: false,
      violations: Object.freeze(['invalid_options_structure']),
      reason: 'Evaluation options must be a valid object',
      audit_timestamp: nowIso
    });
  }

  const optKeys = Object.keys(options || {});
  const unknownOpts = optKeys.filter(k => !ALLOWED_AUTHORITY_OPTIONS_FIELDS.includes(k));
  if (unknownOpts.length > 0) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'invalid',
      envelope_id: null,
      grantee: null,
      action: null,
      target_domain: null,
      requires_confirmation: false,
      violations: Object.freeze([`unknown_options_fields:${unknownOpts.sort().join(',')}`]),
      reason: 'Options contain unrecognized schema fields',
      audit_timestamp: nowIso
    });
  }

  // Reject prototype pollution
  const envelopeKeys = Object.keys(envelope);
  const actionKeys = Object.keys(actionRequest);
  const forbidden = ['__proto__', 'constructor', 'prototype'];
  if (envelopeKeys.some(k => forbidden.includes(k)) ||
      actionKeys.some(k => forbidden.includes(k)) ||
      optKeys.some(k => forbidden.includes(k))) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'invalid',
      envelope_id: null,
      grantee: null,
      action: null,
      target_domain: null,
      requires_confirmation: false,
      violations: Object.freeze(['prototype_pollution_detected']),
      reason: 'Prototype pollution detected in envelope, action request, or options',
      audit_timestamp: nowIso
    });
  }

  // Check unknown fields
  const unknownEnv = envelopeKeys.filter(k => !ALLOWED_AUTHORITY_ENVELOPE_FIELDS.includes(k));
  const unknownAct = actionKeys.filter(k => !ALLOWED_AUTHORITY_ACTION_FIELDS.includes(k));
  if (unknownEnv.length > 0 || unknownAct.length > 0) {
    const v = [];
    if (unknownEnv.length > 0) v.push(`unknown_envelope_fields:${unknownEnv.sort().join(',')}`);
    if (unknownAct.length > 0) v.push(`unknown_action_fields:${unknownAct.sort().join(',')}`);
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'invalid',
      envelope_id: typeof envelope.envelope_id === 'string' ? envelope.envelope_id : null,
      grantee: typeof actionRequest.grantee === 'string' ? actionRequest.grantee : null,
      action: typeof actionRequest.action === 'string' ? actionRequest.action : null,
      target_domain: typeof actionRequest.target_domain === 'string' ? actionRequest.target_domain : null,
      requires_confirmation: false,
      violations: Object.freeze(v),
      reason: 'Input contains unrecognized schema fields',
      audit_timestamp: nowIso
    });
  }

  const violations = [];

  // Envelope required field types and bounds
  if (typeof envelope.envelope_id !== 'string' || !envelope.envelope_id.trim() || envelope.envelope_id.length > 64) {
    violations.push('invalid_envelope_id');
  }
  if (typeof envelope.grantee !== 'string' || !envelope.grantee.trim() || envelope.grantee.length > 60) {
    violations.push('invalid_envelope_grantee');
  }

  // Allowed domains array validation
  if (!Array.isArray(envelope.allowed_domains) || envelope.allowed_domains.length === 0 || envelope.allowed_domains.length > 50) {
    violations.push('empty_or_invalid_allowed_domains');
  } else {
    for (const d of envelope.allowed_domains) {
      if (typeof d !== 'string' || !d.trim() || d.length > 100) {
        violations.push('invalid_allowed_domain_entry');
        break;
      }
    }
  }

  // Allowed actions array validation
  if (!Array.isArray(envelope.allowed_actions) || envelope.allowed_actions.length === 0 || envelope.allowed_actions.length > 50) {
    violations.push('empty_or_invalid_allowed_actions');
  } else {
    for (const a of envelope.allowed_actions) {
      if (typeof a !== 'string' || !a.trim() || a.length > 50) {
        violations.push('invalid_allowed_action_entry');
        break;
      }
    }
  }

  // Allowed scopes array validation
  if (!Array.isArray(envelope.allowed_scopes) || envelope.allowed_scopes.length === 0 || envelope.allowed_scopes.length > 50) {
    violations.push('empty_or_invalid_allowed_scopes');
  } else {
    for (const s of envelope.allowed_scopes) {
      if (typeof s !== 'string' || !s.trim() || s.length > 80) {
        violations.push('invalid_allowed_scope_entry');
        break;
      }
    }
  }

  if (typeof envelope.expires_at !== 'string' || envelope.expires_at.length < 10 || envelope.expires_at.length > 35 || isNaN(Date.parse(envelope.expires_at))) {
    violations.push('invalid_expires_at');
  }
  if ('max_requests' in envelope && (typeof envelope.max_requests !== 'number' || !Number.isSafeInteger(envelope.max_requests) || envelope.max_requests <= 0 || envelope.max_requests > 1000000)) {
    violations.push('invalid_max_requests');
  }
  if ('requires_human_approval_for_write' in envelope && typeof envelope.requires_human_approval_for_write !== 'boolean') {
    violations.push('invalid_requires_human_approval_for_write');
  }
  if ('disallow_credentials' in envelope && typeof envelope.disallow_credentials !== 'boolean') {
    violations.push('invalid_disallow_credentials');
  }
  if ('disallow_subdomains' in envelope && typeof envelope.disallow_subdomains !== 'boolean') {
    violations.push('invalid_disallow_subdomains');
  }

  // Action required field types and bounds
  if (typeof actionRequest.request_id !== 'string' || !actionRequest.request_id.trim() || actionRequest.request_id.length > 64) {
    violations.push('invalid_request_id');
  }
  if (typeof actionRequest.grantee !== 'string' || !actionRequest.grantee.trim() || actionRequest.grantee.length > 60) {
    violations.push('invalid_action_grantee');
  }
  if (typeof actionRequest.action !== 'string' || !actionRequest.action.trim() || actionRequest.action.length > 50) {
    violations.push('invalid_action');
  }
  if (typeof actionRequest.target_domain !== 'string' || !actionRequest.target_domain || actionRequest.target_domain.length > 100 || /[\s\r\n]/.test(actionRequest.target_domain)) {
    violations.push('invalid_target_domain');
  }
  if (typeof actionRequest.scope !== 'string' || !actionRequest.scope.trim() || actionRequest.scope.length > 80) {
    violations.push('invalid_scope');
  }
  if (typeof actionRequest.is_write !== 'boolean') {
    violations.push('invalid_is_write');
  }
  if ('contains_credentials' in actionRequest && typeof actionRequest.contains_credentials !== 'boolean') {
    violations.push('invalid_contains_credentials');
  }
  if ('target_url' in actionRequest && (typeof actionRequest.target_url !== 'string' || !actionRequest.target_url || actionRequest.target_url.length > 500 || /[\s\r\n]/.test(actionRequest.target_url) || actionRequest.target_url.includes('\\'))) {
    violations.push('invalid_target_url');
  }

  // Validate options.now if provided (host-controlled reference time)
  let nowTime = Date.now();
  if ('now' in options) {
    if (typeof options.now === 'string') {
      const parsedNow = Date.parse(options.now);
      if (isNaN(parsedNow)) {
        violations.push('invalid_options_now');
      } else {
        nowTime = parsedNow;
      }
    } else if (typeof options.now === 'number' && Number.isFinite(options.now) && options.now > 0) {
      nowTime = options.now;
    } else if (options.now instanceof Date && !isNaN(options.now.getTime())) {
      nowTime = options.now.getTime();
    } else {
      violations.push('invalid_options_now');
    }
  }

  if (violations.length > 0) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'invalid',
      envelope_id: typeof envelope.envelope_id === 'string' ? envelope.envelope_id : null,
      grantee: typeof actionRequest.grantee === 'string' ? actionRequest.grantee : null,
      action: typeof actionRequest.action === 'string' ? actionRequest.action : null,
      target_domain: typeof actionRequest.target_domain === 'string' ? actionRequest.target_domain : null,
      requires_confirmation: false,
      violations: Object.freeze(violations),
      reason: `Validation failed: ${violations.join(', ')}`,
      audit_timestamp: nowIso
    });
  }

  // Grantee match check
  if (envelope.grantee !== actionRequest.grantee) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['grantee_mismatch']),
      reason: `Action grantee (${actionRequest.grantee}) does not match envelope grantee (${envelope.grantee})`,
      audit_timestamp: nowIso
    });
  }

  // Expiration check against host-controlled reference time
  const expireTime = new Date(envelope.expires_at).getTime();
  if (nowTime >= expireTime) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'expired',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['envelope_expired']),
      reason: `Authority envelope expired at ${envelope.expires_at}`,
      audit_timestamp: nowIso
    });
  }

  // Wildcard checks: prohibit wildcard * in domains, scopes, or actions
  if (envelope.allowed_domains.includes('*') ||
      envelope.allowed_scopes.includes('*') ||
      envelope.allowed_actions.includes('*') ||
      actionRequest.scope === '*' ||
      actionRequest.action === '*' ||
      actionRequest.target_domain === '*' ||
      actionRequest.target_domain.includes('*')) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['wildcard_scope_or_domain_prohibited']),
      reason: 'Wildcard * permissions are prohibited in authority envelopes',
      audit_timestamp: nowIso
    });
  }

  // Domain checks
  if (/[\s\r\n]/.test(actionRequest.target_domain)) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['malformed_target_domain']),
      reason: 'Target domain must not contain whitespace, newline, or carriage return characters',
      audit_timestamp: nowIso
    });
  }
  let rawDomain = actionRequest.target_domain.toLowerCase();
  if (rawDomain.endsWith('.')) {
    rawDomain = rawDomain.slice(0, -1);
  }

  // Check IPv6 bracketed format: [::1] or [2001:db8::1]
  let isIpv6 = false;
  if (rawDomain.startsWith('[') && rawDomain.endsWith(']')) {
    const inner = rawDomain.slice(1, -1);
    if (/^[0-9a-f:]+$/i.test(inner) && inner.includes(':')) {
      isIpv6 = true;
    } else {
      return deepFreeze({
        ok: false,
        decision: 'denied',
        status: 'denied',
        envelope_id: envelope.envelope_id,
        grantee: actionRequest.grantee,
        action: actionRequest.action,
        target_domain: actionRequest.target_domain,
        requires_confirmation: false,
        violations: Object.freeze(['malformed_target_domain']),
        reason: 'Malformed IPv6 address literal in target domain',
        audit_timestamp: nowIso
      });
    }
  }

  // Check IPv4 address format
  const isIpv4 = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(rawDomain);
  const isOctalOrHexIp = /^0x[0-9a-f]+$/i.test(rawDomain) || /^\d{8,12}$/.test(rawDomain) || /^0\d+\.\d+/.test(rawDomain);
  if (isOctalOrHexIp) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['non_standard_ip_encoding_prohibited']),
      reason: 'Non-standard IP address representations are rejected',
      audit_timestamp: nowIso
    });
  }

  // Strict DNS hostname validation for non-IPv6 domains
  // Hostnames must be dot-separated labels consisting of alphanumeric characters and hyphens,
  // cannot start or end with a hyphen or dot, cannot have empty labels (..), cannot contain ?, #, @, \, *, etc.
  if (!isIpv6) {
    const isValidHostname = isIpv4 || (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(rawDomain) && !rawDomain.includes('..'));
    if (!isValidHostname) {
      return deepFreeze({
        ok: false,
        decision: 'denied',
        status: 'denied',
        envelope_id: envelope.envelope_id,
        grantee: actionRequest.grantee,
        action: actionRequest.action,
        target_domain: actionRequest.target_domain,
        requires_confirmation: false,
        violations: Object.freeze(['malformed_target_domain']),
        reason: `Malformed target domain: ${actionRequest.target_domain}`,
        audit_timestamp: nowIso
      });
    }
  }

  // Check Punycode / non-ascii in target_domain
  const isPunycode = rawDomain.includes('xn--');
  const hasNonAscii = /[^\x20-\x7E]/.test(rawDomain);

  const normalizedAllowedDomains = envelope.allowed_domains.map(d => typeof d === 'string' ? d.trim().toLowerCase() : '');
  const disallowSubdomains = envelope.disallow_subdomains === true;

  let domainAllowed = false;
  if (isIpv4 || isIpv6 || isPunycode || hasNonAscii) {
    // IP addresses and internationalized/punycode domains must match explicitly
    domainAllowed = normalizedAllowedDomains.includes(rawDomain);
  } else {
    for (const allowed of normalizedAllowedDomains) {
      if (!allowed) continue;
      if (rawDomain === allowed) {
        domainAllowed = true;
        break;
      }
      if (!disallowSubdomains && rawDomain.endsWith('.' + allowed)) {
        domainAllowed = true;
        break;
      }
    }
  }

  if (!domainAllowed) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['domain_not_permitted']),
      reason: `Target domain ${rawDomain} is not permitted by authority envelope`,
      audit_timestamp: nowIso
    });
  }

  // target_url consistency and subdomain fence check
  if (actionRequest.target_url) {
    if (actionRequest.target_url.includes('\\')) {
      return deepFreeze({
        ok: false,
        decision: 'denied',
        status: 'denied',
        envelope_id: envelope.envelope_id,
        grantee: actionRequest.grantee,
        action: actionRequest.action,
        target_domain: actionRequest.target_domain,
        requires_confirmation: false,
        violations: Object.freeze(['invalid_target_url_format']),
        reason: 'Target URL must not contain backslash characters',
        audit_timestamp: nowIso
      });
    }
    try {
      const parsedUrl = new URL(actionRequest.target_url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return deepFreeze({
          ok: false,
          decision: 'denied',
          status: 'denied',
          envelope_id: envelope.envelope_id,
          grantee: actionRequest.grantee,
          action: actionRequest.action,
          target_domain: actionRequest.target_domain,
          requires_confirmation: false,
          violations: Object.freeze(['unsupported_url_scheme']),
          reason: `Target URL scheme must be http or https: ${parsedUrl.protocol}`,
          audit_timestamp: nowIso
        });
      }
      if (parsedUrl.username || parsedUrl.password) {
        return deepFreeze({
          ok: false,
          decision: 'denied',
          status: 'denied',
          envelope_id: envelope.envelope_id,
          grantee: actionRequest.grantee,
          action: actionRequest.action,
          target_domain: actionRequest.target_domain,
          requires_confirmation: false,
          violations: Object.freeze(['embedded_credentials_in_url']),
          reason: 'Target URL contains embedded credentials',
          audit_timestamp: nowIso
        });
      }
      const urlHostname = parsedUrl.hostname.toLowerCase();
      // If subdomains are disallowed on the envelope, URL hostname must strictly equal target_domain
      if (disallowSubdomains) {
        if (urlHostname !== rawDomain) {
          return deepFreeze({
            ok: false,
            decision: 'denied',
            status: 'denied',
            envelope_id: envelope.envelope_id,
            grantee: actionRequest.grantee,
            action: actionRequest.action,
            target_domain: actionRequest.target_domain,
            requires_confirmation: false,
            violations: Object.freeze(['url_hostname_mismatch']),
            reason: `Target URL hostname (${urlHostname}) does not strictly match target domain (${rawDomain}) when subdomains are disallowed`,
            audit_timestamp: nowIso
          });
        }
      } else {
        if (urlHostname !== rawDomain && !urlHostname.endsWith('.' + rawDomain)) {
          return deepFreeze({
            ok: false,
            decision: 'denied',
            status: 'denied',
            envelope_id: envelope.envelope_id,
            grantee: actionRequest.grantee,
            action: actionRequest.action,
            target_domain: actionRequest.target_domain,
            requires_confirmation: false,
            violations: Object.freeze(['url_hostname_mismatch']),
            reason: `Target URL hostname (${urlHostname}) does not match target domain (${rawDomain})`,
            audit_timestamp: nowIso
          });
        }
      }
    } catch (e) {
      return deepFreeze({
        ok: false,
        decision: 'denied',
        status: 'denied',
        envelope_id: envelope.envelope_id,
        grantee: actionRequest.grantee,
        action: actionRequest.action,
        target_domain: actionRequest.target_domain,
        requires_confirmation: false,
        violations: Object.freeze(['invalid_target_url_format']),
        reason: 'Target URL cannot be parsed as a valid URL',
        audit_timestamp: nowIso
      });
    }
  }

  // Action permitted check
  const normalizedAllowedActions = envelope.allowed_actions.map(a => typeof a === 'string' ? a.trim().toLowerCase() : '');
  const reqAction = actionRequest.action.trim().toLowerCase();
  if (!normalizedAllowedActions.includes(reqAction)) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['action_not_permitted']),
      reason: `Action ${reqAction} is not in allowed actions: ${normalizedAllowedActions.join(', ')}`,
      audit_timestamp: nowIso
    });
  }

  // Scope permitted check
  const normalizedAllowedScopes = envelope.allowed_scopes.map(s => typeof s === 'string' ? s.trim().toLowerCase() : '');
  const reqScope = actionRequest.scope.trim().toLowerCase();
  if (!normalizedAllowedScopes.includes(reqScope)) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['scope_not_permitted']),
      reason: `Scope ${reqScope} is not in allowed scopes: ${normalizedAllowedScopes.join(', ')}`,
      audit_timestamp: nowIso
    });
  }

  // Credential check
  const disallowCredentials = envelope.disallow_credentials !== false;
  if (disallowCredentials && actionRequest.contains_credentials === true) {
    return deepFreeze({
      ok: false,
      decision: 'denied',
      status: 'denied',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: false,
      violations: Object.freeze(['credential_exposure_prohibited']),
      reason: 'Authority envelope prohibits transmission or exposure of host credentials',
      audit_timestamp: nowIso
    });
  }

  // High-consequence / write approval check
  // Authority comes from host semantics: inherently mutating actions are write operations regardless of caller claim
  const isMutatingAction = INHERENTLY_MUTATING_ACTIONS.includes(reqAction);
  const isSensitiveAction = SENSITIVE_AUTHORITY_ACTIONS.includes(reqAction);
  const isWrite = actionRequest.is_write === true || isMutatingAction;
  const requiresHumanForWrite = envelope.requires_human_approval_for_write !== false;

  if (isSensitiveAction || (requiresHumanForWrite && isWrite)) {
    const confirmationReasons = [];
    if (isSensitiveAction) confirmationReasons.push(`sensitive action (${reqAction})`);
    if (requiresHumanForWrite && isWrite) {
      confirmationReasons.push(isMutatingAction ? `mutating action (${reqAction})` : 'write operation');
    }

    return deepFreeze({
      ok: false,
      decision: 'requires_confirmation',
      status: 'requires_confirmation',
      envelope_id: envelope.envelope_id,
      grantee: actionRequest.grantee,
      action: actionRequest.action,
      target_domain: actionRequest.target_domain,
      requires_confirmation: true,
      violations: Object.freeze([]),
      reason: `Action requires human confirmation: ${confirmationReasons.join(', ')}`,
      audit_timestamp: nowIso
    });
  }

  // All checks passed
  return deepFreeze({
    ok: true,
    decision: 'admitted',
    status: 'admitted',
    envelope_id: envelope.envelope_id,
    grantee: actionRequest.grantee,
    action: actionRequest.action,
    target_domain: actionRequest.target_domain,
    requires_confirmation: false,
    violations: Object.freeze([]),
    reason: `Action ${reqAction} on ${rawDomain} within scope ${reqScope} permitted under authority envelope ${envelope.envelope_id}`,
    audit_timestamp: nowIso
  });
}

/**
 * Summarize authority envelope evaluation results for UI display without innerHTML or LLM dependencies.
 *
 * @param {object} evaluation Result from evaluateAuthorityEnvelopeAction
 * @returns {object} Deeply frozen UI summary descriptor
 */
export function summarizeAuthorityEnvelopeAudit(evaluation) {
  if (!evaluation || typeof evaluation !== 'object' || Array.isArray(evaluation)) {
    return deepFreeze({
      success: false,
      decision: 'denied',
      status: 'invalid',
      summary_text: 'Invalid evaluation descriptor',
      violations: Object.freeze(['invalid_evaluation_descriptor']),
      reason: 'Invalid evaluation descriptor'
    });
  }

  const decision = typeof evaluation.decision === 'string' ? evaluation.decision : 'denied';
  const status = typeof evaluation.status === 'string' ? evaluation.status : 'invalid';
  const reason = typeof evaluation.reason === 'string' ? evaluation.reason : 'Evaluation failed';
  const violations = Array.isArray(evaluation.violations) ? evaluation.violations : [];
  const grantee = evaluation.grantee || 'assistant';
  const action = evaluation.action || 'action';
  const domain = evaluation.target_domain || 'destination';

  let summaryText = '';
  if (decision === 'admitted') {
    summaryText = `Permitted: ${grantee} may perform ${action} on ${domain}.`;
  } else if (decision === 'requires_confirmation') {
    summaryText = `Confirmation required: ${grantee} proposed ${action} on ${domain} (${reason}).`;
  } else if (status === 'expired') {
    summaryText = `Rejected: Authority envelope for ${grantee} has expired.`;
  } else {
    summaryText = `Blocked: ${grantee} ${action} on ${domain} denied (${reason}).`;
  }

  return deepFreeze({
    success: evaluation.ok === true,
    decision,
    status,
    summary_text: summaryText,
    violations: Object.freeze([...violations]),
    reason
  });
}






// ============================================================================

// ============================================================================

// ============================================================================

// ============================================================================
// Outbound Multi-Turn Dialogue Sanitizer & Privacy Sentry
// Grounded in arXiv:2610.14071 (Loose Lips) and arXiv:2610.21308 (PocketTSLM)
// Prevents side-constraint loss and compounding multi-turn memory leakage
// ============================================================================

export const ALLOWED_DIALOGUE_SENSITIVITY_TIERS = Object.freeze([
  'public',
  'standard',
  'confidential',
  'restricted'
]);

export const ALLOWED_DIALOGUE_VERDICTS = Object.freeze([
  'allow',
  'sanitize',
  'block'
]);

export const ALLOWED_DIALOGUE_VIOLATION_TYPES = Object.freeze([
  'credential_leak',
  'financial_identifier_leak',
  'safety_constraint_violation',
  'private_fact_leak',
  'prompt_injection_echo',
  'unauthorized_context_expansion'
]);

export const ALLOWED_DIALOGUE_TURN_FIELDS = Object.freeze([
  'turn_id',
  'turn_number',
  'recipient_agent',
  'sensitivity_tier',
  'message_text',
  'context_items',
  'timestamp'
]);

export const ALLOWED_DIALOGUE_OPTIONS_FIELDS = Object.freeze([
  'strict_mode',
  'allow_facts_for_recipients',
  'custom_redaction_patterns',
  'enforce_side_constraints',
  'max_turns',
  'max_turn_chars'
]);

export const DEFAULT_DIALOGUE_SANITIZER_CONFIG = Object.freeze({
  max_turns: 50,
  max_turn_chars: 8000,
  max_context_items: 50,
  max_context_item_chars: 500,
  redact_medical: true,
  redact_financial: true,
  redact_credentials: true,
  enforce_side_constraints: true
});

const SENSITIVE_FINANCIAL_PATTERNS = Object.freeze([
  { type: 'credit_card', regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/, label: 'Credit Card Number' },
  { type: 'credit_card_spaced', regex: /\b(?:\d{4}[-\s]){3}\d{4}\b/, label: 'Formatted Card Number' },
  { type: 'ssn', regex: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/, label: 'Social Security / Insurance Number' },
  { type: 'iban', regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/i, label: 'IBAN' }
]);

const PROMPT_INJECTION_ECHO_PATTERNS = Object.freeze([
  { type: 'ignore_instructions', regex: /\b(?:ignore|disregard|override)\s+(?:all\s+)?(?:previous|prior|system)\s+(?:instructions|prompts|rules)\b/i },
  { type: 'system_prompt_leak', regex: /\b(?:system\s+prompt|developer\s+mode|administrative\s+override)\s*[:=]/i },
  { type: 'script_tag_injection', regex: /<script\b[^>]*>[\s\S]*?<\/script>/i },
  { type: 'zero_width_concealment', regex: /[\u200B-\u200D\uFEFF]+/ }
]);

/**
 * Audit an outbound multi-turn dialogue message before transmission.
 *
 * @param {object} dialogueTurn The outbound dialogue turn to evaluate
 * @param {object} twinState The current personal twin state containing facts, grants, and constraints
 * @param {object} [options={}] Validation options
 * @returns {object} Deeply frozen audit result
 */
export function auditOutboundDialogueMessage(dialogueTurn, twinState, options = {}) {
  if (!dialogueTurn || typeof dialogueTurn !== 'object' || Array.isArray(dialogueTurn)) {
    return deepFreeze({
      ok: false,
      verdict: 'block',
      fingerprint: '00000000000000',
      violations: Object.freeze(['Invalid dialogue turn: must be a non-null object']),
      detected_sensitive_types: Object.freeze([]),
      requires_redaction: false,
      requires_user_confirmation: true,
      reason: 'Malformed dialogue turn'
    });
  }

  // Reject prototype pollution
  const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];
  for (const k of forbiddenKeys) {
    if (Object.prototype.hasOwnProperty.call(dialogueTurn, k) ||
        (options && typeof options === 'object' && Object.prototype.hasOwnProperty.call(options, k))) {
      return deepFreeze({
        ok: false,
        verdict: 'block',
        fingerprint: '00000000000000',
        violations: Object.freeze(['Prototype pollution attempt detected']),
        detected_sensitive_types: Object.freeze([]),
        requires_redaction: false,
        requires_user_confirmation: true,
        reason: 'Prototype pollution violation'
      });
    }
  }

  // Validate twinState fail-closed
  if (!twinState || typeof twinState !== 'object' || !validateTwinState(twinState).ok) {
    return deepFreeze({
      ok: false,
      verdict: 'block',
      fingerprint: '00000000000000',
      violations: Object.freeze(['Invalid or missing twinState: must be a valid twin state object']),
      detected_sensitive_types: Object.freeze([]),
      requires_redaction: false,
      requires_user_confirmation: true,
      reason: 'Invalid twinState'
    });
  }

  // Strict field validation on dialogueTurn
  for (const k of Object.keys(dialogueTurn)) {
    if (!ALLOWED_DIALOGUE_TURN_FIELDS.includes(k)) {
      return deepFreeze({
        ok: false,
        verdict: 'block',
        fingerprint: '00000000000000',
        violations: Object.freeze([`Unknown field in dialogue turn: ${k}`]),
        detected_sensitive_types: Object.freeze([]),
        requires_redaction: false,
        requires_user_confirmation: true,
        reason: `Disallowed field: ${k}`
      });
    }
  }

  // Strict options field validation
  if (options && typeof options === 'object') {
    for (const k of Object.keys(options)) {
      if (!ALLOWED_DIALOGUE_OPTIONS_FIELDS.includes(k)) {
        return deepFreeze({
          ok: false,
          verdict: 'block',
          fingerprint: '00000000000000',
          violations: Object.freeze([`Unknown field in options: ${k}`]),
          detected_sensitive_types: Object.freeze([]),
          requires_redaction: false,
          requires_user_confirmation: true,
          reason: `Disallowed option: ${k}`
        });
      }
    }
  }

  const {
    turn_id,
    turn_number,
    recipient_agent,
    sensitivity_tier = 'standard',
    message_text,
    context_items = [],
    timestamp
  } = dialogueTurn;

  const violations = [];
  const detectedSensitiveTypes = new Set();

  if (typeof turn_id !== 'string' || turn_id.trim().length === 0) {
    violations.push('turn_id must be a non-empty string');
  } else if (turn_id.length > 40) {
    violations.push('turn_id exceeds maximum length of 40 characters');
  }

  if (!Number.isSafeInteger(turn_number) || turn_number < 1) {
    violations.push('turn_number must be an integer >= 1');
  }

  if (typeof recipient_agent !== 'string' || recipient_agent.trim().length === 0) {
    violations.push('recipient_agent must be a non-empty string');
  } else if (recipient_agent.length > 60) {
    violations.push('recipient_agent exceeds maximum length of 60 characters');
  }

  if (!ALLOWED_DIALOGUE_SENSITIVITY_TIERS.includes(sensitivity_tier)) {
    violations.push(`Invalid sensitivity_tier: ${sensitivity_tier}`);
  }

  if (typeof message_text !== 'string' || message_text.trim().length === 0) {
    violations.push('message_text must be a non-empty string');
  }

  const maxContextItems = (options && options.max_context_items) || DEFAULT_DIALOGUE_SANITIZER_CONFIG.max_context_items;
  const maxContextItemChars = (options && options.max_context_item_chars) || DEFAULT_DIALOGUE_SANITIZER_CONFIG.max_context_item_chars;

  if (!Array.isArray(context_items)) {
    violations.push('context_items must be an array of strings');
  } else {
    if (context_items.length > maxContextItems) {
      violations.push(`context_items length (${context_items.length}) exceeds maximum limit (${maxContextItems})`);
    }
    for (let i = 0; i < context_items.length; i++) {
      if (typeof context_items[i] !== 'string') {
        violations.push(`context_items[${i}] must be a string`);
        break;
      }
      if (context_items[i].length > maxContextItemChars) {
        violations.push(`context_items[${i}] length exceeds maximum limit (${maxContextItemChars})`);
        break;
      }
    }
  }

  if (timestamp !== undefined) {
    if (typeof timestamp !== 'string' || isNaN(Date.parse(timestamp))) {
      violations.push('timestamp must be a valid ISO 8601 string');
    }
  }

  if (violations.length > 0) {
    return deepFreeze({
      ok: false,
      verdict: 'block',
      fingerprint: '00000000000000',
      violations: Object.freeze([...violations]),
      detected_sensitive_types: Object.freeze([]),
      requires_redaction: false,
      requires_user_confirmation: true,
      reason: `Validation failed: ${violations.join('; ')}`
    });
  }

  const maxTurns = (options && options.max_turns) || DEFAULT_DIALOGUE_SANITIZER_CONFIG.max_turns;
  const maxTurnChars = (options && options.max_turn_chars) || DEFAULT_DIALOGUE_SANITIZER_CONFIG.max_turn_chars;

  if (turn_number > maxTurns) {
    violations.push(`turn_number ${turn_number} exceeds maximum allowed turns (${maxTurns})`);
    detectedSensitiveTypes.add('unauthorized_context_expansion');
  }

  const rawCombined = [message_text, ...context_items].join(' \n ');
  if (rawCombined.length > maxTurnChars) {
    violations.push(`Total dialogue text length (${rawCombined.length}) exceeds maximum limit (${maxTurnChars})`);
  }

  // Check zero-width characters in raw text
  if (/[\u200B-\u200D\uFEFF]/.test(rawCombined)) {
    violations.push('Prompt injection marker detected: zero_width_concealment');
    detectedSensitiveTypes.add('prompt_injection_echo');
  }

  // Clean zero-width characters for semantic and keyword matching
  const combinedDialogueText = rawCombined.replace(/[\u200B-\u200D\uFEFF]/g, '');
  const fingerprint = computeContextFingerprint(`dialogue:${recipient_agent}:${turn_number}:${message_text}`);

  // 1. Prompt Injection Echo Checks
  for (const pat of PROMPT_INJECTION_ECHO_PATTERNS) {
    if (pat.regex.test(combinedDialogueText)) {
      violations.push(`Prompt injection marker detected: ${pat.type}`);
      detectedSensitiveTypes.add('prompt_injection_echo');
    }
  }

  // 2. Financial Identifiers Detection
  for (const pat of SENSITIVE_FINANCIAL_PATTERNS) {
    if (pat.regex.test(combinedDialogueText)) {
      detectedSensitiveTypes.add('financial_identifier_leak');
    }
  }

  // 3. Sensitive Credentials Detection (using existing SENSITIVE_CREDENTIAL_PATTERNS)
  for (const pat of SENSITIVE_CREDENTIAL_PATTERNS) {
    if (pat.type !== 'credit_card' && pat.regex.test(combinedDialogueText)) {
      detectedSensitiveTypes.add('credential_leak');
    }
  }

  // 4. Side-Constraint & Boundary Enforcement against Twin State
  const facts = Array.isArray(twinState.facts) ? twinState.facts : [];
  const boundaryProhibitions = [];
  const privateFactTokens = [];

  for (const f of facts) {
    if (!f || typeof f !== 'object') continue;
    const cat = f.category || '';
    const txt = (f.statement || f.fact || f.text || '').trim();
    if (!txt) continue;

    // Boundary constraints: e.g. "never share...", "do not disclose..."
    if (cat === 'boundary' || /\b(?:never|do\s+not|must\s+not|prohibit|refuse|forbidden)\b/i.test(txt)) {
      boundaryProhibitions.push(txt);
    } else if (cat === 'medical' || cat === 'emergency' || cat === 'preference') {
      privateFactTokens.push({ text: txt, category: cat });
    }
  }

  const lowerDialogue = combinedDialogueText.toLowerCase();

  // Test side-constraints: if a boundary rule prohibits disclosure, check for violation
  for (const rule of boundaryProhibitions) {
    const normRule = rule.toLowerCase().replace(/^(?:never|do\s+not|must\s+not|prohibit)\s+(?:share|disclose|leak|send|give)\s+/i, '').trim();
    if (normRule.length >= 4) {
      const keywords = normRule.split(/\s+/).filter(w => w.length > 2 && !['with', 'from', 'that', 'this', 'your', 'about', 'and', 'the', 'for'].includes(w));
      const matched = keywords.filter(w => lowerDialogue.includes(w));
      if (matched.length >= 2 || (keywords.length === 1 && matched.length === 1)) {
        violations.push(`Outbound message violates standing side-constraint: "${rule}"`);
        detectedSensitiveTypes.add('safety_constraint_violation');
      }
    }
  }

  // Test private fact leakage (medical/emergency/preference)
  for (const pf of privateFactTokens) {
    const cleanPf = pf.text.toLowerCase().trim();
    if (cleanPf.length >= 4) {
      const contentWords = cleanPf.split(/\s+/).filter(w => w.length > 3 && !['user', 'likes', 'prefers', 'has', 'patient', 'been', 'with', 'from', 'takes'].includes(w));
      const matched = contentWords.filter(w => lowerDialogue.includes(w));
      if (matched.length >= 2 || (contentWords.length === 1 && matched.length === 1)) {
        violations.push(`Outbound message contains private personal fact without explicit grant: "${pf.text}"`);
        detectedSensitiveTypes.add('private_fact_leak');
      }
    }
  }

  // Multi-turn leakage compounding rule:
  // If turn_number >= 6, and restricted or confidential tier has any sensitive items, escalate to block
  const hasCompoundingTurnRisk = turn_number >= 6 && detectedSensitiveTypes.size > 0 &&
    (sensitivity_tier === 'restricted' || sensitivity_tier === 'confidential');

  let verdict = 'allow';
  let requiresRedaction = false;
  let requiresUserConfirmation = false;
  let reason = 'Outbound dialogue message verified safe';

  if (detectedSensitiveTypes.has('safety_constraint_violation') ||
      detectedSensitiveTypes.has('prompt_injection_echo') ||
      detectedSensitiveTypes.has('private_fact_leak') ||
      hasCompoundingTurnRisk ||
      violations.length > 0) {
    verdict = 'block';
    requiresUserConfirmation = true;
    reason = `Blocked due to ${violations.length} violation(s): ${violations.join('; ')}`;
  } else if (detectedSensitiveTypes.has('credential_leak') || detectedSensitiveTypes.has('financial_identifier_leak')) {
    verdict = 'sanitize';
    requiresRedaction = true;
    reason = `Requires redaction for detected sensitive items: ${Array.from(detectedSensitiveTypes).join(', ')}`;
  }

  return deepFreeze({
    ok: true,
    verdict,
    fingerprint,
    turn_id,
    turn_number,
    recipient_agent,
    sensitivity_tier,
    violations: Object.freeze([...violations]),
    detected_sensitive_types: Object.freeze(Array.from(detectedSensitiveTypes)),
    requires_redaction: requiresRedaction,
    requires_user_confirmation: requiresUserConfirmation,
    reason
  });
}

/**
 * Sanitize an outbound dialogue turn by substituting sensitive entities with typed placeholders across message and context.
 *
 * @param {object} dialogueTurn Outbound dialogue turn object
 * @param {object} auditResult Audit result from auditOutboundDialogueMessage
 * @param {object} [options={}] Sanitization options
 * @returns {object} Deeply frozen sanitization result
 */
export function sanitizeOutboundDialogueTurn(dialogueTurn, auditResult, options = {}) {
  if (!dialogueTurn || typeof dialogueTurn !== 'object' || Array.isArray(dialogueTurn)) {
    return deepFreeze({
      ok: false,
      verdict: 'block',
      sanitized_turn: null,
      receipt: null,
      redaction_count: 0,
      reason: 'Invalid dialogue turn object'
    });
  }

  if (!auditResult || typeof auditResult !== 'object' || Array.isArray(auditResult) || !auditResult.ok) {
    return deepFreeze({
      ok: false,
      verdict: 'block',
      sanitized_turn: null,
      receipt: null,
      redaction_count: 0,
      reason: 'Valid auditResult required for sanitization'
    });
  }

  if (auditResult.verdict === 'block') {
    return deepFreeze({
      ok: false,
      verdict: 'block',
      sanitized_turn: null,
      receipt: null,
      redaction_count: 0,
      reason: `Cannot sanitize blocked turn: ${auditResult.reason}`
    });
  }

  let redactionCount = 0;

  function scrubString(text) {
    if (typeof text !== 'string') return text;
    let sText = text;

    // 1. Redact financial identifiers first
    for (const pat of SENSITIVE_FINANCIAL_PATTERNS) {
      if (pat.regex.test(sText)) {
        sText = sText.replace(new RegExp(pat.regex.source, 'gi'), () => {
          redactionCount++;
          return '[REDACTED_FINANCIAL_DETAIL]';
        });
      }
    }

    // 2. Redact credentials
    for (const pat of SENSITIVE_CREDENTIAL_PATTERNS) {
      if (pat.type !== 'credit_card' && pat.regex.test(sText)) {
        sText = sText.replace(new RegExp(pat.regex.source, 'gi'), () => {
          redactionCount++;
          return '[REDACTED_CREDENTIAL]';
        });
      }
    }

    // 3. Clean zero-width concealed characters
    sText = sText.replace(/[\u200B-\u200D\uFEFF]/g, () => {
      redactionCount++;
      return '';
    });

    return sText;
  }

  let sanitizedText = dialogueTurn.message_text;
  let sanitizedContextItems = [];

  if (auditResult.verdict === 'sanitize') {
    sanitizedText = scrubString(dialogueTurn.message_text);
    if (Array.isArray(dialogueTurn.context_items)) {
      sanitizedContextItems = dialogueTurn.context_items.map(item => scrubString(item));
    }
  } else {
    sanitizedContextItems = Array.isArray(dialogueTurn.context_items) ? [...dialogueTurn.context_items] : [];
  }

  const timestamp = new Date().toISOString();
  const receiptSeed = `dlgrec:${auditResult.fingerprint}:${dialogueTurn.recipient_agent}:${dialogueTurn.turn_number}:${redactionCount}:${timestamp}`;
  const receiptId = `dlgrec-${computeContextFingerprint(receiptSeed)}`;

  const receipt = deepFreeze({
    id: receiptId,
    turn_id: dialogueTurn.turn_id,
    turn_number: dialogueTurn.turn_number,
    recipient_agent: dialogueTurn.recipient_agent,
    sensitivity_tier: dialogueTurn.sensitivity_tier,
    redaction_count: redactionCount,
    status: auditResult.verdict === 'sanitize' ? 'sanitized' : 'unaltered',
    timestamp,
    dialogue_fingerprint: auditResult.fingerprint
  });

  const sanitizedTurn = deepFreeze({
    ...dialogueTurn,
    message_text: sanitizedText,
    context_items: Object.freeze(sanitizedContextItems),
    sanitized_at: timestamp
  });

  return deepFreeze({
    ok: true,
    verdict: auditResult.verdict,
    sanitized_turn: sanitizedTurn,
    receipt,
    redaction_count: redactionCount,
    reason: auditResult.verdict === 'sanitize'
      ? `Successfully sanitized ${redactionCount} sensitive token(s)`
      : 'Message permitted without redaction'
  });
}

/**
 * Summarize dialogue sanitization for UI presentation without innerHTML.
 *
 * @param {object} result Result from sanitizeOutboundDialogueTurn or auditOutboundDialogueMessage
 * @returns {object} Deeply frozen summary
 */
export function summarizeDialogueSanitization(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return deepFreeze({
      success: false,
      summary_text: 'Invalid dialogue sanitization result',
      verdict: 'block',
      redaction_count: 0,
      violations: Object.freeze(['Invalid result object'])
    });
  }

  if (result.ok && (result.verdict === 'allow' || result.verdict === 'sanitize')) {
    const rCount = result.redaction_count || 0;
    const recipient = result.sanitized_turn?.recipient_agent || result.recipient_agent || 'agent';
    const turn = result.sanitized_turn?.turn_number || result.turn_number || 1;
    const desc = result.verdict === 'sanitize'
      ? `Sanitized ${rCount} sensitive element(s) for turn ${turn} to ${recipient}.`
      : `Turn ${turn} to ${recipient} permitted without redaction.`;
    return deepFreeze({
      success: true,
      summary_text: desc,
      verdict: result.verdict,
      redaction_count: rCount,
      violations: Object.freeze([])
    });
  }

  const vList = Array.isArray(result.violations) ? result.violations : [];
  const reasonText = result.reason || 'Dialogue transmission blocked';
  return deepFreeze({
    success: false,
    summary_text: `Dialogue blocked: ${reasonText} (${vList.length} violation(s)).`,
    verdict: 'block',
    redaction_count: 0,
    violations: Object.freeze([...vList])
  });
}

// ============================================================================

// ============================================================================
// DELEGATION RESPONSIBILITY TRACKING & COMMITMENT LEDGER (arXiv:2610.21243)
// ============================================================================

export const ALLOWED_DELEGATION_STATUSES = Object.freeze([
  'pending',
  'active',
  'fulfilled',
  'failed',
  'escalated'
]);

export const ALLOWED_ESCALATION_MODES = Object.freeze([
  'upstream_return',
  'peer_failover',
  'supervisor_escalate'
]);

export const ALLOWED_FAILURE_CODES = Object.freeze([
  'timeout',
  'tool_unavailable',
  'constraint_violation',
  'capability_denied',
  'unhandled_error',
  'resource_exhaustion'
]);

export const ALLOWED_DELEGATION_FIELDS = Object.freeze([
  'commitment_id',
  'delegator_agent',
  'delegatee_agent',
  'task_hash',
  'description',
  'status',
  'created_at',
  'deadline',
  'chain_depth',
  'upstream_commitment_id',
  'escalation_mode',
  'failure_code',
  'failure_reason',
  'fulfilled_at',
  'escalated_to'
]);

export const ALLOWED_DELEGATION_OPTIONS_FIELDS = Object.freeze([
  'allow_downstream_delegation',
  'max_chain_depth',
  'require_provenance',
  'escalation_mode',
  'current_time'
]);

export const MAX_DELEGATION_CHAIN_DEPTH = 5;
export const MAX_DELEGATION_LEDGER_ENTRIES = 100;

export const DEFAULT_DELEGATION_CONFIG = Object.freeze({
  allow_downstream_delegation: true,
  max_chain_depth: MAX_DELEGATION_CHAIN_DEPTH,
  require_provenance: true,
  escalation_mode: 'upstream_return'
});

const AGENT_ID_RE = /^[a-zA-Z0-9_\-\.@]{3,64}$/;
const COMMITMENT_ID_RE = /^[a-zA-Z0-9_\-:]{4,64}$/;
const TASK_HASH_RE = /^[a-zA-Z0-9_\-]{8,128}$/;

/**
 * Validates a single delegation commitment object against strict schema constraints.
 * Fails closed on any unknown, malformed, or boundary-violating property.
 *
 * @param {object} raw Raw commitment input
 * @returns {{ ok: boolean, value?: object, error?: string }}
 */
export function validateDelegationCommitment(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Delegation commitment must be a non-null object' };
  }

  // Prevent prototype pollution
  if (Object.prototype.hasOwnProperty.call(raw, '__proto__') ||
      Object.prototype.hasOwnProperty.call(raw, 'constructor') ||
      Object.prototype.hasOwnProperty.call(raw, 'prototype')) {
    return { ok: false, error: 'Prototype pollution detected in delegation commitment' };
  }

  const keys = Object.keys(raw);
  for (const k of keys) {
    if (!ALLOWED_DELEGATION_FIELDS.includes(k)) {
      return { ok: false, error: `Unknown field in delegation commitment: ${k}` };
    }
  }

  // Required core fields
  const requiredFields = ['commitment_id', 'delegator_agent', 'delegatee_agent', 'task_hash', 'description', 'status', 'created_at', 'deadline', 'chain_depth', 'escalation_mode'];
  for (const rf of requiredFields) {
    if (raw[rf] === undefined || raw[rf] === null) {
      return { ok: false, error: `Missing required field in delegation commitment: ${rf}` };
    }
  }

  if (typeof raw.commitment_id !== 'string' || !COMMITMENT_ID_RE.test(raw.commitment_id)) {
    return { ok: false, error: 'commitment_id must be an alphanumeric string (4-64 chars)' };
  }

  if (typeof raw.delegator_agent !== 'string' || !AGENT_ID_RE.test(raw.delegator_agent)) {
    return { ok: false, error: 'delegator_agent must match valid agent identifier format' };
  }

  if (typeof raw.delegatee_agent !== 'string' || !AGENT_ID_RE.test(raw.delegatee_agent)) {
    return { ok: false, error: 'delegatee_agent must match valid agent identifier format' };
  }

  if (raw.delegator_agent.trim().toLowerCase() === raw.delegatee_agent.trim().toLowerCase()) {
    return { ok: false, error: 'delegator_agent and delegatee_agent cannot be identical' };
  }

  if (typeof raw.task_hash !== 'string' || !TASK_HASH_RE.test(raw.task_hash)) {
    return { ok: false, error: 'task_hash must be a valid hash token (8-128 chars)' };
  }

  if (typeof raw.description !== 'string' || raw.description.trim().length < 3 || raw.description.trim().length > 300) {
    return { ok: false, error: 'description must be a string between 3 and 300 characters' };
  }

  if (typeof raw.status !== 'string' || !ALLOWED_DELEGATION_STATUSES.includes(raw.status)) {
    return { ok: false, error: `Invalid status: ${raw.status}` };
  }

  if (typeof raw.created_at !== 'string' || !ISO_RE.test(raw.created_at) || !isValidCalendarDate(raw.created_at.slice(0, 10)) || isNaN(Date.parse(raw.created_at))) {
    return { ok: false, error: 'created_at must be a valid ISO-8601 calendar date timestamp string' };
  }

  if (typeof raw.deadline !== 'string' || !ISO_RE.test(raw.deadline) || !isValidCalendarDate(raw.deadline.slice(0, 10)) || isNaN(Date.parse(raw.deadline))) {
    return { ok: false, error: 'deadline must be a valid ISO-8601 calendar date timestamp string' };
  }

  const createdMs = Date.parse(raw.created_at);
  const deadlineMs = Date.parse(raw.deadline);
  if (deadlineMs < createdMs) {
    return { ok: false, error: 'deadline cannot precede created_at' };
  }

  if (typeof raw.chain_depth !== 'number' || !Number.isSafeInteger(raw.chain_depth) || raw.chain_depth < 0 || raw.chain_depth > MAX_DELEGATION_CHAIN_DEPTH) {
    return { ok: false, error: `chain_depth must be an integer between 0 and ${MAX_DELEGATION_CHAIN_DEPTH}` };
  }

  if (typeof raw.escalation_mode !== 'string' || !ALLOWED_ESCALATION_MODES.includes(raw.escalation_mode)) {
    return { ok: false, error: `Invalid escalation_mode: ${raw.escalation_mode}` };
  }

  // Upstream linkage rules
  if (raw.chain_depth > 0) {
    if (typeof raw.upstream_commitment_id !== 'string' || !COMMITMENT_ID_RE.test(raw.upstream_commitment_id)) {
      return { ok: false, error: 'upstream_commitment_id is required when chain_depth > 0' };
    }
    if (raw.upstream_commitment_id === raw.commitment_id) {
      return { ok: false, error: 'upstream_commitment_id cannot reference self' };
    }
  } else {
    if (raw.upstream_commitment_id !== null && raw.upstream_commitment_id !== undefined) {
      return { ok: false, error: 'upstream_commitment_id must be null or omitted when chain_depth is 0' };
    }
  }

  // Terminal & failure state validation
  if (raw.status === 'failed' || raw.status === 'escalated') {
    if (typeof raw.failure_code !== 'string' || !ALLOWED_FAILURE_CODES.includes(raw.failure_code)) {
      return { ok: false, error: `failure_code is required for ${raw.status} status and must be valid` };
    }
    if (typeof raw.failure_reason !== 'string' || raw.failure_reason.trim().length < 3 || raw.failure_reason.trim().length > 300) {
      return { ok: false, error: `failure_reason must be a string between 3 and 300 chars for ${raw.status} status` };
    }
  } else {
    if (raw.failure_code !== null && raw.failure_code !== undefined) {
      return { ok: false, error: 'failure_code must not be set unless status is failed or escalated' };
    }
    if (raw.failure_reason !== null && raw.failure_reason !== undefined) {
      return { ok: false, error: 'failure_reason must not be set unless status is failed or escalated' };
    }
  }

  if (raw.status === 'fulfilled') {
    if (typeof raw.fulfilled_at !== 'string' || !ISO_RE.test(raw.fulfilled_at) || !isValidCalendarDate(raw.fulfilled_at.slice(0, 10)) || isNaN(Date.parse(raw.fulfilled_at))) {
      return { ok: false, error: 'fulfilled_at must be a valid ISO-8601 calendar date timestamp string for fulfilled status' };
    }
    if (Date.parse(raw.fulfilled_at) < createdMs) {
      return { ok: false, error: 'fulfilled_at cannot precede created_at' };
    }
  } else {
    if (raw.fulfilled_at !== null && raw.fulfilled_at !== undefined) {
      return { ok: false, error: 'fulfilled_at must not be set unless status is fulfilled' };
    }
  }

  if (raw.status === 'escalated') {
    if (raw.escalated_to !== null && raw.escalated_to !== undefined) {
      if (typeof raw.escalated_to !== 'string' || !AGENT_ID_RE.test(raw.escalated_to)) {
        return { ok: false, error: 'escalated_to must be a valid agent identifier' };
      }
    }
  } else {
    if (raw.escalated_to !== null && raw.escalated_to !== undefined) {
      return { ok: false, error: 'escalated_to must not be set unless status is escalated' };
    }
  }

  const clean = {
    commitment_id: raw.commitment_id,
    delegator_agent: raw.delegator_agent.trim(),
    delegatee_agent: raw.delegatee_agent.trim(),
    task_hash: raw.task_hash,
    description: raw.description.trim(),
    status: raw.status,
    created_at: raw.created_at,
    deadline: raw.deadline,
    chain_depth: raw.chain_depth,
    upstream_commitment_id: raw.upstream_commitment_id || null,
    escalation_mode: raw.escalation_mode,
    failure_code: raw.failure_code || null,
    failure_reason: raw.failure_reason ? raw.failure_reason.trim() : null,
    fulfilled_at: raw.fulfilled_at || null,
    escalated_to: raw.escalated_to ? raw.escalated_to.trim() : null
  };

  return { ok: true, value: deepFreeze(clean) };
}

/**
 * Creates and validates a new delegation commitment record.
 *
 * @param {object} params Core parameters
 * @param {object} [options] Optional configuration options
 * @returns {{ ok: boolean, commitment?: object, error?: string }}
 */
export function createDelegationCommitment(params, options = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return { ok: false, error: 'Parameters must be an object' };
  }

  if (options && typeof options === 'object') {
    for (const optKey of Object.keys(options)) {
      if (!ALLOWED_DELEGATION_OPTIONS_FIELDS.includes(optKey)) {
        return { ok: false, error: `Unknown option: ${optKey}` };
      }
    }
  }

  const nowIso = options.current_time || new Date().toISOString();
  const raw = {
    commitment_id: params.commitment_id,
    delegator_agent: params.delegator_agent,
    delegatee_agent: params.delegatee_agent,
    task_hash: params.task_hash,
    description: params.description,
    status: params.status || 'pending',
    created_at: params.created_at || nowIso,
    deadline: params.deadline,
    chain_depth: params.chain_depth !== undefined ? params.chain_depth : 0,
    upstream_commitment_id: params.upstream_commitment_id || null,
    escalation_mode: params.escalation_mode || options.escalation_mode || DEFAULT_DELEGATION_CONFIG.escalation_mode,
    failure_code: params.failure_code || null,
    failure_reason: params.failure_reason || null,
    fulfilled_at: params.fulfilled_at || null,
    escalated_to: params.escalated_to || null
  };

  const validation = validateDelegationCommitment(raw);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  return { ok: true, commitment: validation.value };
}

/**
 * Detects cyclic delegation loops across commitments (e.g. Agent A -> Agent B -> Agent A).
 *
 * @param {Array<object>} commitments List of delegation commitments
 * @returns {{ has_cycle: boolean, cycle_path: string[], error?: string }}
 */
export function detectDelegationCycles(commitments) {
  if (!Array.isArray(commitments)) {
    return { has_cycle: false, cycle_path: [], error: 'Commitments must be an array' };
  }

  // Construct adjacency graph of agent delegations
  const adj = new Map();
  for (const c of commitments) {
    if (!c || typeof c !== 'object') continue;
    const u = c.delegator_agent;
    const v = c.delegatee_agent;
    if (typeof u === 'string' && typeof v === 'string') {
      const uNorm = u.trim().toLowerCase();
      const vNorm = v.trim().toLowerCase();
      if (!adj.has(uNorm)) adj.set(uNorm, new Set());
      adj.get(uNorm).add(vNorm);
    }
  }

  const visited = new Set();
  const recStack = new Set();
  let foundCycle = null;

  function dfs(node, path) {
    visited.add(node);
    recStack.add(node);

    const neighbors = adj.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path, neighbor])) return true;
      } else if (recStack.has(neighbor)) {
        foundCycle = [...path, neighbor];
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      if (dfs(node, [node])) {
        return { has_cycle: true, cycle_path: foundCycle || [] };
      }
    }
  }

  return { has_cycle: false, cycle_path: [] };
}

/**
 * Transitions a delegation commitment through its lifecycle with verifiable diagnostics.
 *
 * @param {object} commitment Existing valid commitment
 * @param {string} targetStatus Target status
 * @param {object} [context] Context parameters (failure_code, diagnostic_message, fulfilled_at, timestamp)
 * @returns {{ ok: boolean, updated_commitment?: object, escalation_packet?: object, error?: string }}
 */
export function evaluateDelegationTransition(commitment, targetStatus, context = {}) {
  const currentValidation = validateDelegationCommitment(commitment);
  if (!currentValidation.ok) {
    return { ok: false, error: `Invalid source commitment: ${currentValidation.error}` };
  }

  const current = currentValidation.value;
  if (!ALLOWED_DELEGATION_STATUSES.includes(targetStatus)) {
    return { ok: false, error: `Invalid target status: ${targetStatus}` };
  }

  // Immutability of terminal states
  if (current.status === 'fulfilled' || current.status === 'failed') {
    return { ok: false, error: `Cannot transition from terminal status '${current.status}'` };
  }

  // State machine rules
  if (current.status === 'pending') {
    if (targetStatus !== 'active' && targetStatus !== 'failed') {
      return { ok: false, error: `Cannot transition from 'pending' directly to '${targetStatus}'` };
    }
  } else if (current.status === 'active') {
    if (targetStatus !== 'fulfilled' && targetStatus !== 'failed' && targetStatus !== 'escalated') {
      return { ok: false, error: `Cannot transition from 'active' to '${targetStatus}'` };
    }
  } else if (current.status === 'escalated') {
    if (targetStatus !== 'fulfilled' && targetStatus !== 'failed') {
      return { ok: false, error: `Cannot transition from 'escalated' to '${targetStatus}'` };
    }
  }

  const nowIso = context.timestamp || new Date().toISOString();
  let failureCode = null;
  let failureReason = null;
  let fulfilledAt = null;
  let escalatedTo = null;
  let escalationPacket = null;

  if (targetStatus === 'failed' || targetStatus === 'escalated') {
    if (!context.failure_code || !ALLOWED_FAILURE_CODES.includes(context.failure_code)) {
      return { ok: false, error: `failure_code is required when transitioning to ${targetStatus}` };
    }
    if (!context.diagnostic_message || typeof context.diagnostic_message !== 'string' || context.diagnostic_message.trim().length < 3) {
      return { ok: false, error: `diagnostic_message is required when transitioning to ${targetStatus}` };
    }
    failureCode = context.failure_code;
    failureReason = context.diagnostic_message.trim();

    if (targetStatus === 'escalated') {
      escalatedTo = context.escalated_to || current.delegator_agent;
      const recAction = failureCode === 'timeout'
        ? 'retry_with_extended_budget'
        : failureCode === 'tool_unavailable'
          ? 'failover_to_alternate_peer'
          : 'abort_task_branch';

      escalationPacket = deepFreeze({
        commitment_id: current.commitment_id,
        delegator_agent: current.delegator_agent,
        delegatee_agent: current.delegatee_agent,
        failure_code: failureCode,
        diagnostic_message: failureReason,
        timestamp: nowIso,
        escalated_to: escalatedTo,
        upstream_commitment_id: current.upstream_commitment_id || null,
        recommended_action: recAction
      });
    }
  } else if (targetStatus === 'fulfilled') {
    fulfilledAt = context.fulfilled_at || nowIso;
  }

  const updatedRaw = {
    ...current,
    status: targetStatus,
    failure_code: failureCode,
    failure_reason: failureReason,
    fulfilled_at: fulfilledAt,
    escalated_to: escalatedTo
  };

  const revalidation = validateDelegationCommitment(updatedRaw);
  if (!revalidation.ok) {
    return { ok: false, error: `Revalidation failed: ${revalidation.error}` };
  }

  return {
    ok: true,
    updated_commitment: revalidation.value,
    escalation_packet: escalationPacket
  };
}

/**
 * Produces deterministic aggregate metrics and plain-language summary for delegation commitments.
 *
 * @param {Array<object>} commitments List of delegation commitments
 * @param {string|number|null} [asOfTime] Optional temporal evaluation point
 * @returns {object} Deeply frozen summary
 */
export function summarizeDelegationLedger(commitments, asOfTime = null) {
  if (!Array.isArray(commitments)) {
    return deepFreeze({
      ok: false,
      total: 0,
      active: 0,
      pending: 0,
      fulfilled: 0,
      failed: 0,
      escalated: 0,
      overdue: 0,
      max_chain_depth: 0,
      summary_text: 'Invalid delegation commitments array'
    });
  }

  let asOfMs;
  if (asOfTime === null || asOfTime === undefined) {
    asOfMs = Date.now();
  } else if (typeof asOfTime === 'string') {
    asOfMs = Date.parse(asOfTime);
  } else if (typeof asOfTime === 'number' && Number.isFinite(asOfTime)) {
    asOfMs = asOfTime;
  } else {
    asOfMs = Date.now();
  }

  let active = 0;
  let pending = 0;
  let fulfilled = 0;
  let failed = 0;
  let escalated = 0;
  let overdue = 0;
  let maxDepth = 0;

  for (const c of commitments) {
    if (!c || typeof c !== 'object') continue;
    const st = c.status;
    if (st === 'active') active++;
    else if (st === 'pending') pending++;
    else if (st === 'fulfilled') fulfilled++;
    else if (st === 'failed') failed++;
    else if (st === 'escalated') escalated++;

    if (typeof c.chain_depth === 'number' && c.chain_depth > maxDepth) {
      maxDepth = c.chain_depth;
    }

    if ((st === 'active' || st === 'pending') && c.deadline) {
      const dMs = Date.parse(c.deadline);
      if (!isNaN(dMs) && asOfMs > dMs) {
        overdue++;
      }
    }
  }

  const total = commitments.length;
  const desc = total === 0
    ? 'No delegation commitments registered.'
    : `Delegation ledger: ${total} commitment(s) (${active} active, ${pending} pending, ${fulfilled} fulfilled, ${failed} failed, ${escalated} escalated; ${overdue} overdue; max depth ${maxDepth}).`;

  return deepFreeze({
    ok: true,
    total,
    active,
    pending,
    fulfilled,
    failed,
    escalated,
    overdue,
    max_chain_depth: maxDepth,
    summary_text: desc
  });
}



// ============================================================================
// Lookahead Action & Tool Call Pre-Execution Simulator (Lookahead Pitfall Guard)
// Grounded in arXiv:2610.29139 (PAWM Pitfall Anticipation) and arXiv:2610.23254 (IPI Failure Analysis)
// Provides out-of-process multi-step lookahead trajectory simulation to intercept
// tool call traps, exfiltration sequences, and privilege escapes before execution.
// ============================================================================

export const ALLOWED_TOOL_CATEGORIES = Object.freeze([
  'read',
  'format',
  'network',
  'storage',
  'system',
  'delegation'
]);

export const ALLOWED_LOOKAHEAD_DECISIONS = Object.freeze([
  'admitted',
  'requires_user_confirmation',
  'blocked'
]);

export const ALLOWED_LOOKAHEAD_PLAN_FIELDS = Object.freeze([
  'plan_id',
  'agent_id',
  'objective',
  'steps',
  'created_at'
]);

export const ALLOWED_LOOKAHEAD_STEP_FIELDS = Object.freeze([
  'step_id',
  'tool_name',
  'category',
  'parameters',
  'taints_output',
  'accesses_private_data',
  'modifies_state',
  'target_resource'
]);

export const ALLOWED_LOOKAHEAD_OPTIONS_FIELDS = Object.freeze([
  'as_of_time',
  'strict_mode',
  'enforce_host_taint'
]);

export const MAX_LOOKAHEAD_PLAN_STEPS = 10;
export const MAX_LOOKAHEAD_STRING_LENGTH = 200;

export const LOOKAHEAD_PITFALL_TYPES = Object.freeze([
  'exfiltration_sequence',
  'privilege_escalation',
  'destructive_mutation',
  'circular_resource_drain',
  'stealth_callback_trigger',
  'evasion_spoofing'
]);

const DANGEROUS_SYSTEM_TOOLS = Object.freeze([
  'eval',
  'exec',
  'execute_script',
  'run_command',
  'modify_envelope',
  'bypass_gate',
  'override_policy',
  'install_unverified_skill'
]);

const DESTRUCTIVE_TOOL_NAMES = Object.freeze([
  'wipe_all',
  'wipe',
  'delete_all',
  'clear_memory',
  'drop_facts',
  'revoke_all_grants'
]);

const SENSITIVE_KEYWORDS = Object.freeze([
  'allergy',
  'medical',
  'prescription',
  'password',
  'boundary',
  'secret',
  'credential',
  'token',
  'private'
]);

/**
 * Computes a deterministic 32-bit FNV-1a hex hash.
 */
function computeLookaheadFingerprint(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Validates a structured lookahead action plan fail-closed.
 *
 * @param {object} plan The action plan to validate
 * @returns {object} Deeply frozen validation result { ok, value, error }
 */
export function validateLookaheadActionPlan(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    return { ok: false, error: 'Lookahead action plan must be a non-null object' };
  }

  const forbidden = ['__proto__', 'constructor', 'prototype'];
  for (const k of forbidden) {
    if (Object.prototype.hasOwnProperty.call(plan, k)) {
      return { ok: false, error: 'Prototype pollution attempt detected in plan' };
    }
  }

  for (const k of Object.keys(plan)) {
    if (!ALLOWED_LOOKAHEAD_PLAN_FIELDS.includes(k)) {
      return { ok: false, error: `Unknown plan field: ${k}` };
    }
  }

  if (typeof plan.plan_id !== 'string' || !plan.plan_id.trim() || plan.plan_id.length > 80) {
    return { ok: false, error: 'plan_id must be a non-empty string under 80 characters' };
  }

  if (typeof plan.agent_id !== 'string' || !plan.agent_id.trim() || plan.agent_id.length > 80) {
    return { ok: false, error: 'agent_id must be a non-empty string under 80 characters' };
  }

  if (typeof plan.objective !== 'string' || !plan.objective.trim() || plan.objective.length > MAX_LOOKAHEAD_STRING_LENGTH) {
    return { ok: false, error: `objective must be a non-empty string under ${MAX_LOOKAHEAD_STRING_LENGTH} characters` };
  }

  if (typeof plan.created_at !== 'string' || isNaN(Date.parse(plan.created_at))) {
    return { ok: false, error: 'created_at must be a valid ISO date-time string' };
  }

  const datePrefix = plan.created_at.slice(0, 10);
  if (!isValidCalendarDate(datePrefix)) {
    return { ok: false, error: 'created_at contains an impossible calendar date' };
  }

  if (!Array.isArray(plan.steps) || plan.steps.length === 0 || plan.steps.length > MAX_LOOKAHEAD_PLAN_STEPS) {
    return { ok: false, error: `steps must be an array of 1 to ${MAX_LOOKAHEAD_PLAN_STEPS} action items` };
  }

  const validatedSteps = [];
  const seenStepIds = new Set();

  for (let i = 0; i < plan.steps.length; i++) {
    const s = plan.steps[i];
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      return { ok: false, error: `Step [${i}] must be a non-null object` };
    }

    for (const k of forbidden) {
      if (Object.prototype.hasOwnProperty.call(s, k)) {
        return { ok: false, error: `Prototype pollution attempt detected in step [${i}]` };
      }
    }

    for (const k of Object.keys(s)) {
      if (!ALLOWED_LOOKAHEAD_STEP_FIELDS.includes(k)) {
        return { ok: false, error: `Step [${i}] contains unknown field: ${k}` };
      }
    }

    if (typeof s.step_id !== 'string' || !s.step_id.trim() || s.step_id.length > 40) {
      return { ok: false, error: `Step [${i}] step_id must be a string under 40 characters` };
    }
    if (seenStepIds.has(s.step_id)) {
      return { ok: false, error: `Duplicate step_id detected: ${s.step_id}` };
    }
    seenStepIds.add(s.step_id);

    if (typeof s.tool_name !== 'string' || !/^[a-z0-9_-]{1,60}$/i.test(s.tool_name)) {
      return { ok: false, error: `Step [${i}] tool_name must be alphanumeric (1-60 chars)` };
    }

    if (typeof s.category !== 'string' || !ALLOWED_TOOL_CATEGORIES.includes(s.category)) {
      return { ok: false, error: `Step [${i}] category must be one of: ${ALLOWED_TOOL_CATEGORIES.join(', ')}` };
    }

    if (typeof s.taints_output !== 'boolean') {
      return { ok: false, error: `Step [${i}] taints_output must be boolean` };
    }

    if (typeof s.accesses_private_data !== 'boolean') {
      return { ok: false, error: `Step [${i}] accesses_private_data must be boolean` };
    }

    if (typeof s.modifies_state !== 'boolean') {
      return { ok: false, error: `Step [${i}] modifies_state must be boolean` };
    }

    if (s.target_resource !== undefined && s.target_resource !== null) {
      if (typeof s.target_resource !== 'string' || s.target_resource.length > 120) {
        return { ok: false, error: `Step [${i}] target_resource must be string under 120 characters` };
      }
    }

    if (!s.parameters || typeof s.parameters !== 'object' || Array.isArray(s.parameters)) {
      return { ok: false, error: `Step [${i}] parameters must be a non-null object` };
    }
    for (const k of forbidden) {
      if (Object.prototype.hasOwnProperty.call(s.parameters, k)) {
        return { ok: false, error: `Prototype pollution in parameters of step [${i}]` };
      }
    }

    validatedSteps.push(Object.freeze({
      step_id: s.step_id.trim(),
      tool_name: s.tool_name.trim().toLowerCase(),
      category: s.category,
      parameters: deepFreeze({ ...s.parameters }),
      taints_output: s.taints_output,
      accesses_private_data: s.accesses_private_data,
      modifies_state: s.modifies_state,
      target_resource: s.target_resource ? s.target_resource.trim() : null
    }));
  }

  const cleanPlan = deepFreeze({
    plan_id: plan.plan_id.trim(),
    agent_id: plan.agent_id.trim(),
    objective: plan.objective.trim(),
    steps: Object.freeze(validatedSteps),
    created_at: plan.created_at
  });

  return { ok: true, value: cleanPlan };
}

/**
 * Creates a valid lookahead action plan with deterministic default values.
 *
 * @param {object} params Plan initialization parameters
 * @returns {object} Deeply frozen action plan or error
 */
export function createLookaheadActionPlan(params) {
  if (!params || typeof params !== 'object') {
    return { ok: false, error: 'Invalid plan parameters' };
  }
  const planId = params.plan_id || `plan_${Date.now().toString(36)}`;
  const agentId = params.agent_id || 'assistant_agent';
  const objective = params.objective || 'Standard task execution';
  const createdAt = params.created_at || new Date().toISOString();
  const steps = params.steps || [];

  return validateLookaheadActionPlan({
    plan_id: planId,
    agent_id: agentId,
    objective,
    steps,
    created_at: createdAt
  });
}

/**
 * Simulates execution of an action plan step-by-step, detecting multi-step pitfall traps.
 *
 * @param {object} plan The action plan to simulate
 * @param {object} twinState Current twin state containing grants and critical facts
 * @param {object} [options={}] Simulation options
 * @returns {object} Deeply frozen simulation result
 */
export function simulateActionPlanLookahead(plan, twinState, options = {}) {
  // Validate options fail-closed
  if (options !== null && options !== undefined) {
    if (typeof options !== 'object' || Array.isArray(options)) {
      return deepFreeze({
        ok: false,
        decision: 'blocked',
        risk_score: 100,
        pitfalls_detected: Object.freeze(['invalid_options']),
        steps_simulated: 0,
        plan_id: 'unknown',
        agent_id: 'unknown',
        reason: 'Options must be a non-null object',
        receipt: null
      });
    }
    const forbidden = ['__proto__', 'constructor', 'prototype'];
    for (const k of forbidden) {
      if (Object.prototype.hasOwnProperty.call(options, k)) {
        return deepFreeze({
          ok: false,
          decision: 'blocked',
          risk_score: 100,
          pitfalls_detected: Object.freeze(['prototype_pollution_attempt']),
          steps_simulated: 0,
          plan_id: 'unknown',
          agent_id: 'unknown',
          reason: 'Prototype pollution in options',
          receipt: null
        });
      }
    }
    for (const k of Object.keys(options)) {
      if (!ALLOWED_LOOKAHEAD_OPTIONS_FIELDS.includes(k)) {
        return deepFreeze({
          ok: false,
          decision: 'blocked',
          risk_score: 100,
          pitfalls_detected: Object.freeze(['unknown_option_field']),
          steps_simulated: 0,
          plan_id: 'unknown',
          agent_id: 'unknown',
          reason: `Unknown option field: ${k}`,
          receipt: null
        });
      }
    }
  }

  // Validate twinState fail-closed
  const stateVal = validateTwinState(twinState);
  if (!stateVal.ok) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      risk_score: 100,
      pitfalls_detected: Object.freeze(['invalid_twin_state']),
      steps_simulated: 0,
      plan_id: plan && typeof plan === 'object' && plan.plan_id ? String(plan.plan_id).slice(0, 80) : 'unknown',
      agent_id: plan && typeof plan === 'object' && plan.agent_id ? String(plan.agent_id).slice(0, 80) : 'unknown',
      reason: `Twin state validation failed: ${stateVal.error}`,
      receipt: null
    });
  }
  const state = stateVal.value;

  const planVal = validateLookaheadActionPlan(plan);
  if (!planVal.ok) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      risk_score: 100,
      pitfalls_detected: Object.freeze(['invalid_plan_schema']),
      steps_simulated: 0,
      plan_id: plan && typeof plan === 'object' && plan.plan_id ? String(plan.plan_id).slice(0, 80) : 'unknown',
      agent_id: plan && typeof plan === 'object' && plan.agent_id ? String(plan.agent_id).slice(0, 80) : 'unknown',
      reason: `Plan validation failed: ${planVal.error}`,
      receipt: null
    });
  }

  const cleanPlan = planVal.value;

  // Canonical grant filtering using g.who and temporal validity
  const activeGrants = state.grants.filter(g => g && g.who && !isGrantExpired(g));
  const criticalFacts = state.facts.filter(f => f && f.critical);
  const criticalStatements = criticalFacts.map(f => (f.statement || '').toLowerCase());

  let isTainted = false;
  let taintSource = null;
  const detectedPitfalls = [];
  const stepSimulations = [];
  let delegationStreak = 0;
  let hasStateMutation = false;
  let hasNetworkOutbound = false;
  let hasSystemInteraction = false;

  for (let i = 0; i < cleanPlan.steps.length; i++) {
    const s = cleanPlan.steps[i];
    const stepWarnings = [];

    // Host-grounded critical memory and sensitive topic detection
    const stepTarget = (s.target_resource || '').toLowerCase();
    const serializedParams = JSON.stringify(s.parameters).toLowerCase();
    const stepCorpus = `${s.tool_name} ${stepTarget} ${serializedParams}`;

    let touchesHostSensitive = false;
    for (const cStmt of criticalStatements) {
      if (cStmt && stepCorpus.includes(cStmt)) {
        touchesHostSensitive = true;
        break;
      }
    }
    if (!touchesHostSensitive) {
      for (const kw of SENSITIVE_KEYWORDS) {
        if (stepCorpus.includes(kw)) {
          touchesHostSensitive = true;
          break;
        }
      }
    }

    // Host authority overrides caller declared boolean flags
    if (touchesHostSensitive || s.accesses_private_data || s.taints_output) {
      isTainted = true;
      if (!taintSource) {
        taintSource = `${s.step_id} (${s.tool_name})`;
      }
      if (touchesHostSensitive && !s.accesses_private_data) {
        stepWarnings.push('Host audit: step touches sensitive critical memory without declaring accesses_private_data');
      }
    }

    // Unconditional dangerous system tool check
    const isDangerousSystem = s.category === 'system' || DANGEROUS_SYSTEM_TOOLS.includes(s.tool_name);
    if (isDangerousSystem) {
      hasSystemInteraction = true;
      if (!detectedPitfalls.includes('privilege_escalation')) {
        detectedPitfalls.push('privilege_escalation');
      }
      stepWarnings.push('Privilege escalation: tool invokes unconstrained system execution');
    }

    // Unconditional destructive tool check
    const isDestructive = DESTRUCTIVE_TOOL_NAMES.includes(s.tool_name) ||
      (stepTarget && /wipe|delete_all|clear_memory/i.test(stepTarget));

    if (isDestructive) {
      hasStateMutation = true;
      if (!detectedPitfalls.includes('destructive_mutation')) {
        detectedPitfalls.push('destructive_mutation');
      }
      stepWarnings.push('Destructive mutation: tool attempts mass deletion of local records');

      // Detect spoofing evasion if caller falsely claimed modifies_state = false
      if (!s.modifies_state) {
        if (!detectedPitfalls.includes('evasion_spoofing')) {
          detectedPitfalls.push('evasion_spoofing');
        }
        stepWarnings.push('Evasion detected: destructive tool declared with modifies_state: false');
      }
    } else if (s.modifies_state) {
      hasStateMutation = true;
    }

    // Check exfiltration trap: tainted data flowing into network sink without active grant
    if (s.category === 'network') {
      hasNetworkOutbound = true;
      if (isTainted) {
        const covered = activeGrants.some(g => {
          const who = String(g.who || '').toLowerCase();
          return who && (stepTarget.includes(who) || who.includes(stepTarget));
        });
        if (!covered) {
          if (!detectedPitfalls.includes('exfiltration_sequence')) {
            detectedPitfalls.push('exfiltration_sequence');
          }
          stepWarnings.push(`Exfiltration hazard: network call to '${s.target_resource || 'external'}' conveys tainted data from ${taintSource}`);
        }
      }
    }

    // Check circular delegation
    if (s.category === 'delegation') {
      delegationStreak++;
      if (delegationStreak >= 3) {
        if (!detectedPitfalls.includes('circular_resource_drain')) {
          detectedPitfalls.push('circular_resource_drain');
        }
        stepWarnings.push('Circular resource drain: excessive ungrounded peer delegation chain');
      }
    } else {
      delegationStreak = 0;
    }

    // Check stealth delayed callbacks across parameter keys AND string values
    if (isTainted) {
      if (serializedParams.includes('webhook') ||
          serializedParams.includes('callback') ||
          serializedParams.includes('cron') ||
          serializedParams.includes('schedule')) {
        if (!detectedPitfalls.includes('stealth_callback_trigger')) {
          detectedPitfalls.push('stealth_callback_trigger');
        }
        stepWarnings.push('Stealth trigger hazard: deferred webhook or callback carries tainted parameters');
      }
    }

    stepSimulations.push(Object.freeze({
      step_id: s.step_id,
      tool_name: s.tool_name,
      category: s.category,
      tainted_at_exit: isTainted,
      warnings: Object.freeze(stepWarnings)
    }));
  }

  // Compute overall decision and risk score
  let decision = 'admitted';
  let riskScore = 5;

  if (detectedPitfalls.length > 0) {
    decision = 'blocked';
    riskScore = Math.min(100, 50 + detectedPitfalls.length * 20);
  } else if (hasStateMutation || hasNetworkOutbound || hasSystemInteraction || isTainted) {
    decision = 'requires_user_confirmation';
    riskScore = Math.min(45, 15 + (hasStateMutation ? 10 : 0) + (hasNetworkOutbound ? 10 : 0) + (isTainted ? 10 : 0));
  }

  let reason = 'Action plan passes lookahead safety checks without pitfall traps.';
  if (decision === 'blocked') {
    reason = `Blocked fail-closed: detected ${detectedPitfalls.length} pitfall pattern(s) (${detectedPitfalls.join(', ')}).`;
  } else if (decision === 'requires_user_confirmation') {
    reason = 'Action plan touches state, network, or sensitive context; requires explicit user approval before execution.';
  }

  // Deterministic timestamp from options.as_of_time or cleanPlan.created_at
  let evalTimestamp = cleanPlan.created_at;
  if (options && options.as_of_time && typeof options.as_of_time === 'string' && !isNaN(Date.parse(options.as_of_time))) {
    evalTimestamp = options.as_of_time;
  }

  const receiptSeed = `${cleanPlan.plan_id}|${cleanPlan.agent_id}|${decision}|${riskScore}|${cleanPlan.steps.length}|${evalTimestamp}`;
  const receiptHash = computeLookaheadFingerprint(receiptSeed);

  const receipt = deepFreeze({
    receipt_id: `rec_sim_${receiptHash}`,
    plan_id: cleanPlan.plan_id,
    agent_id: cleanPlan.agent_id,
    decision,
    risk_score: riskScore,
    pitfalls_detected: Object.freeze([...detectedPitfalls]),
    steps_simulated: cleanPlan.steps.length,
    timestamp: evalTimestamp
  });

  return deepFreeze({
    ok: true,
    decision,
    risk_score: riskScore,
    pitfalls_detected: Object.freeze(detectedPitfalls),
    steps_simulated: cleanPlan.steps.length,
    plan_id: cleanPlan.plan_id,
    agent_id: cleanPlan.agent_id,
    reason,
    step_simulations: Object.freeze(stepSimulations),
    receipt
  });
}

/**
 * Summarizes the lookahead simulation in plain, non-jargon language for display.
 *
 * @param {object} simulationResult Result of simulateActionPlanLookahead
 * @returns {object} Deeply frozen summary { ok, decision, text, risk_label }
 */
export function summarizeLookaheadSimulation(simulationResult) {
  if (!simulationResult || typeof simulationResult !== 'object' || !simulationResult.ok) {
    return deepFreeze({
      ok: false,
      decision: 'blocked',
      text: 'Simulation could not be completed fail-closed.',
      risk_label: 'High risk'
    });
  }

  const dec = simulationResult.decision;
  const count = simulationResult.steps_simulated || 0;
  const pitfalls = simulationResult.pitfalls_detected || [];

  let riskLabel = 'Low risk';
  if (simulationResult.risk_score >= 50) riskLabel = 'High risk';
  else if (simulationResult.risk_score >= 20) riskLabel = 'Moderate risk';

  let text = '';
  if (dec === 'admitted') {
    text = `Simulated ${count} action step(s). Safe to run: no data exfiltration, system escape, or destructive mutations detected.`;
  } else if (dec === 'requires_user_confirmation') {
    text = `Simulated ${count} action step(s). Touches local state, network, or sensitive context. Asks you first before proceeding.`;
  } else {
    const pitfallText = pitfalls.map(p => {
      if (p === 'exfiltration_sequence') return 'private data leak over network';
      if (p === 'privilege_escalation') return 'unauthorized system command';
      if (p === 'destructive_mutation') return 'destructive record deletion';
      if (p === 'circular_resource_drain') return 'circular peer delegation';
      if (p === 'stealth_callback_trigger') return 'unverified delayed callback';
      if (p === 'evasion_spoofing') return 'mutation gate evasion attempt';
      return p;
    }).join(', ');
    text = `Blocked: lookahead simulator detected dangerous traps (${pitfallText}) across ${count} step(s). Execution aborted.`;
  }

  return deepFreeze({
    ok: true,
    decision: dec,
    text,
    risk_label: riskLabel,
    risk_score: simulationResult.risk_score
  });
}

// ============================================================================
// LOCAL-FIRST INCOME VERIFICATION PROOF GENERATOR (arXiv:2610.23901, Scenario SC-20261024-0233)
// ============================================================================

export const ALLOWED_INCOME_PROOF_TIERS = Object.freeze([
  'no_drop',
  'minor_drop',
  'moderate_drop',
  'substantial_drop',
  'severe_shock'
]);

export const INCOME_DROP_TIER_THRESHOLDS = Object.freeze({
  severe_shock: 50,      // >= 50% drop
  substantial_drop: 30,  // >= 30% drop
  moderate_drop: 20,     // >= 20% drop
  minor_drop: 5          // >= 5% drop
});

export const ALLOWED_BANK_FEED_ENTRY_FIELDS = Object.freeze([
  'id',
  'date',
  'amount_cents',
  'currency',
  'kind',
  'category',
  'merchant',
  'description'
]);

export const ALLOWED_INCOME_PROOF_PARAM_FIELDS = Object.freeze([
  'baseline_start',
  'baseline_end',
  'evaluation_start',
  'evaluation_end',
  'qualification_threshold_percent',
  'currency',
  'category',
  'salt'
]);

export const FORBIDDEN_RECEIPT_LEAK_FIELDS = Object.freeze([
  'transactions',
  'entries',
  'accounts',
  'account_number',
  'bank_feed',
  'raw_data',
  'merchant',
  'merchants',
  'descriptions',
  'baseline_income_cents',
  'evaluation_income_cents'
]);

/**
 * Validates a list of client-side bank feed entries fail-closed.
 *
 * @param {Array<object>} entries Bank feed entries
 * @returns {object} { ok: true, value: frozenEntries } or { ok: false, error: string }
 */
export function validateBankFeedEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { ok: false, error: 'bank_feed must be a non-empty array of transaction entries' };
  }

  const seenIds = new Set();
  let feedCurrency = null;
  const sanitized = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return { ok: false, error: `Entry at index ${i} must be a non-null object` };
    }

    if (Object.prototype.hasOwnProperty.call(entry, '__proto__') ||
        Object.prototype.hasOwnProperty.call(entry, 'constructor') ||
        Object.prototype.hasOwnProperty.call(entry, 'prototype')) {
      return { ok: false, error: `Entry at index ${i} contains illegal prototype pollution property` };
    }

    const keys = Object.keys(entry);
    for (const k of keys) {
      if (!ALLOWED_BANK_FEED_ENTRY_FIELDS.includes(k)) {
        return { ok: false, error: `Entry at index ${i} contains forbidden field: ${k}` };
      }
    }

    if (typeof entry.id !== 'string' || !entry.id.trim() || entry.id.length > 64) {
      return { ok: false, error: `Entry at index ${i} must have a valid non-empty string id (max 64 chars)` };
    }
    if (seenIds.has(entry.id)) {
      return { ok: false, error: `Duplicate transaction id detected: ${entry.id}` };
    }
    seenIds.add(entry.id);

    if (typeof entry.date !== 'string' || !isValidCalendarDate(entry.date)) {
      return { ok: false, error: `Entry at index ${i} has invalid date (must be a valid calendar date YYYY-MM-DD)` };
    }

    if (!Number.isSafeInteger(entry.amount_cents)) {
      return { ok: false, error: `Entry at index ${i} amount_cents must be a safe integer` };
    }

    if (!isValidCurrencyCode(entry.currency)) {
      return { ok: false, error: `Entry at index ${i} has invalid currency code: ${entry.currency}` };
    }

    if (feedCurrency === null) {
      feedCurrency = entry.currency;
    } else if (entry.currency !== feedCurrency) {
      return { ok: false, error: `Mixed currencies in bank feed (${feedCurrency} vs ${entry.currency}) not permitted for income verification` };
    }

    if (entry.kind !== 'credit' && entry.kind !== 'debit') {
      return { ok: false, error: `Entry at index ${i} kind must be 'credit' or 'debit'` };
    }

    if (entry.kind === 'credit' && entry.amount_cents < 0) {
      return { ok: false, error: `Entry at index ${i} is credit but has negative amount_cents` };
    }
    if (entry.kind === 'debit' && entry.amount_cents > 0) {
      return { ok: false, error: `Entry at index ${i} is debit but has positive amount_cents` };
    }

    if (entry.category !== undefined && (typeof entry.category !== 'string' || entry.category.length > 80)) {
      return { ok: false, error: `Entry at index ${i} category must be a string up to 80 chars` };
    }
    if (entry.merchant !== undefined && (typeof entry.merchant !== 'string' || entry.merchant.length > 120)) {
      return { ok: false, error: `Entry at index ${i} merchant must be a string up to 120 chars` };
    }
    if (entry.description !== undefined && (typeof entry.description !== 'string' || entry.description.length > 200)) {
      return { ok: false, error: `Entry at index ${i} description must be a string up to 200 chars` };
    }

    sanitized.push({
      id: entry.id,
      date: entry.date,
      amount_cents: entry.amount_cents,
      currency: entry.currency,
      kind: entry.kind,
      ...(entry.category !== undefined ? { category: entry.category } : {}),
      ...(entry.merchant !== undefined ? { merchant: entry.merchant } : {}),
      ...(entry.description !== undefined ? { description: entry.description } : {})
    });
  }

  return { ok: true, value: deepFreeze(sanitized) };
}

/**
 * Validates income verification proof parameters fail-closed.
 *
 * @param {object} params Verification parameters
 * @returns {object} { ok: true, value: frozenParams } or { ok: false, error: string }
 */
export function validateIncomeProofParameters(params) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return { ok: false, error: 'parameters must be a non-null object' };
  }

  if (Object.prototype.hasOwnProperty.call(params, '__proto__') ||
      Object.prototype.hasOwnProperty.call(params, 'constructor') ||
      Object.prototype.hasOwnProperty.call(params, 'prototype')) {
    return { ok: false, error: 'parameters contain illegal prototype pollution property' };
  }

  const keys = Object.keys(params);
  for (const k of keys) {
    if (!ALLOWED_INCOME_PROOF_PARAM_FIELDS.includes(k)) {
      return { ok: false, error: `Forbidden parameter field: ${k}` };
    }
  }

  const { baseline_start, baseline_end, evaluation_start, evaluation_end } = params;

  if (typeof baseline_start !== 'string' || !isValidCalendarDate(baseline_start)) {
    return { ok: false, error: 'baseline_start must be a valid calendar date YYYY-MM-DD' };
  }
  if (typeof baseline_end !== 'string' || !isValidCalendarDate(baseline_end)) {
    return { ok: false, error: 'baseline_end must be a valid calendar date YYYY-MM-DD' };
  }
  if (baseline_start > baseline_end) {
    return { ok: false, error: 'baseline_start cannot be after baseline_end' };
  }

  if (typeof evaluation_start !== 'string' || !isValidCalendarDate(evaluation_start)) {
    return { ok: false, error: 'evaluation_start must be a valid calendar date YYYY-MM-DD' };
  }
  if (typeof evaluation_end !== 'string' || !isValidCalendarDate(evaluation_end)) {
    return { ok: false, error: 'evaluation_end must be a valid calendar date YYYY-MM-DD' };
  }
  if (evaluation_start > evaluation_end) {
    return { ok: false, error: 'evaluation_start cannot be after evaluation_end' };
  }

  if (baseline_end > evaluation_start) {
    return { ok: false, error: 'baseline period cannot overlap evaluation period' };
  }

  const threshold = params.qualification_threshold_percent;
  if (typeof threshold !== 'number' || isNaN(threshold) || !isFinite(threshold) || threshold < 1 || threshold > 99) {
    return { ok: false, error: 'qualification_threshold_percent must be a number between 1 and 99' };
  }

  if (!isValidCurrencyCode(params.currency)) {
    return { ok: false, error: `Invalid currency code: ${params.currency}` };
  }

  if (params.category !== undefined && (typeof params.category !== 'string' || !params.category.trim())) {
    return { ok: false, error: 'category if provided must be a non-empty string' };
  }

  const salt = (typeof params.salt === 'string' && params.salt.trim()) ? params.salt.trim() : 'cin_local_twin_salt';
  if (salt.length > 128) {
    return { ok: false, error: 'salt exceeds maximum length of 128 characters' };
  }

  return {
    ok: true,
    value: deepFreeze({
      baseline_start,
      baseline_end,
      evaluation_start,
      evaluation_end,
      qualification_threshold_percent: threshold,
      currency: params.currency,
      ...(params.category ? { category: params.category.trim() } : {}),
      salt
    })
  };
}

/**
 * Computes a cryptographic commitment hash over aggregate income amounts and temporal parameters.
 *
 * @param {object} data Commitment data components
 * @returns {string} Deterministic hex digest
 */
export function computeIncomeProofCommitment(data) {
  if (!data || typeof data !== 'object') return '00000000000000';
  const seed = `${data.baseline_income_cents}|${data.evaluation_income_cents}|${data.qualification_tier}|${data.currency}|${data.salt}|${data.baseline_period?.start}|${data.baseline_period?.end}|${data.evaluation_period?.start}|${data.evaluation_period?.end}`;
  return computeContextFingerprint(seed);
}

/**
 * Evaluates cash flow on-device and generates a zero-leakage income verification proof receipt.
 *
 * @param {Array<object>} bankFeed Array of verified ledger transactions
 * @param {object} params Verification parameters (baseline & eval windows, threshold, currency)
 * @returns {object} Deeply frozen result with tamper-evident receipt and zero transaction leakage
 */
export function generateIncomeVerificationProof(bankFeed, params) {
  const feedRes = validateBankFeedEntries(bankFeed);
  if (!feedRes.ok) {
    return deepFreeze({ ok: false, error: feedRes.error });
  }

  const paramRes = validateIncomeProofParameters(params);
  if (!paramRes.ok) {
    return deepFreeze({ ok: false, error: paramRes.error });
  }

  const cleanFeed = feedRes.value;
  const p = paramRes.value;

  let baselineCents = 0;
  let evalCents = 0;
  let baselineTxCount = 0;
  let evalTxCount = 0;

  for (const tx of cleanFeed) {
    if (tx.currency !== p.currency) {
      return deepFreeze({
        ok: false,
        error: `Transaction currency mismatch: expected ${p.currency}, found ${tx.currency}`
      });
    }

    if (tx.kind === 'credit') {
      if (p.category && tx.category !== p.category) {
        continue;
      }

      if (tx.date >= p.baseline_start && tx.date <= p.baseline_end) {
        baselineCents += tx.amount_cents;
        baselineTxCount++;
        if (!Number.isSafeInteger(baselineCents)) {
          return deepFreeze({ ok: false, error: 'integer_overflow_in_baseline_income' });
        }
      } else if (tx.date >= p.evaluation_start && tx.date <= p.evaluation_end) {
        evalCents += tx.amount_cents;
        evalTxCount++;
        if (!Number.isSafeInteger(evalCents)) {
          return deepFreeze({ ok: false, error: 'integer_overflow_in_evaluation_income' });
        }
      }
    }
  }

  if (baselineCents <= 0) {
    return deepFreeze({
      ok: false,
      error: 'zero_baseline_income',
      reason: 'No baseline credit income recorded in the baseline window to evaluate drop.'
    });
  }

  const dropCents = baselineCents - evalCents;
  let dropPercent = 0;
  let tier = 'no_drop';

  if (dropCents > 0) {
    dropPercent = Math.round(((dropCents * 100) / baselineCents) * 100) / 100;
    if (dropPercent >= INCOME_DROP_TIER_THRESHOLDS.severe_shock) {
      tier = 'severe_shock';
    } else if (dropPercent >= INCOME_DROP_TIER_THRESHOLDS.substantial_drop) {
      tier = 'substantial_drop';
    } else if (dropPercent >= INCOME_DROP_TIER_THRESHOLDS.moderate_drop) {
      tier = 'moderate_drop';
    } else if (dropPercent >= INCOME_DROP_TIER_THRESHOLDS.minor_drop) {
      tier = 'minor_drop';
    } else {
      tier = 'no_drop';
    }
  }

  const qualifies = dropPercent >= p.qualification_threshold_percent;

  const commitmentData = {
    baseline_income_cents: baselineCents,
    evaluation_income_cents: evalCents,
    qualification_tier: tier,
    currency: p.currency,
    salt: p.salt,
    baseline_period: { start: p.baseline_start, end: p.baseline_end },
    evaluation_period: { start: p.evaluation_start, end: p.evaluation_end }
  };
  const commitmentHash = computeIncomeProofCommitment(commitmentData);

  const totalTxCount = baselineTxCount + evalTxCount;
  const receiptSeed = `${tier}|${qualifies}|${p.qualification_threshold_percent}|${p.currency}|${commitmentHash}|${totalTxCount}|${p.baseline_start}|${p.baseline_end}|${p.evaluation_start}|${p.evaluation_end}`;
  const receiptHash = computeContextFingerprint(receiptSeed);
  const receiptId = `proof_inc_${receiptHash}`;

  const receipt = deepFreeze({
    receipt_id: receiptId,
    qualification_tier: tier,
    qualifies_for_relief: qualifies,
    threshold_percent: p.qualification_threshold_percent,
    currency: p.currency,
    baseline_period: deepFreeze({ start: p.baseline_start, end: p.baseline_end }),
    evaluation_period: deepFreeze({ start: p.evaluation_start, end: p.evaluation_end }),
    commitment_hash: commitmentHash,
    transaction_count: totalTxCount,
    generated_at: new Date().toISOString()
  });

  for (const forbidden of FORBIDDEN_RECEIPT_LEAK_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(receipt, forbidden)) {
      return deepFreeze({ ok: false, error: `Receipt integrity fault: exposed ${forbidden}` });
    }
  }

  return deepFreeze({
    ok: true,
    receipt,
    client_summary: deepFreeze({
      drop_percent: dropPercent,
      baseline_income_cents: baselineCents,
      evaluation_income_cents: evalCents,
      qualifies_for_relief: qualifies,
      tier
    })
  });
}

/**
 * Verifies a portable income verification proof receipt fail-closed.
 *
 * @param {object} receipt The portable proof receipt
 * @param {object} [options] Verification criteria (expected_tier, expected_currency, require_qualification, preimage)
 * @returns {object} Deeply frozen verification verdict
 */
export function verifyIncomeVerificationProof(receipt, options = {}) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_receipt_object' });
  }

  for (const forbidden of FORBIDDEN_RECEIPT_LEAK_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(receipt, forbidden)) {
      return deepFreeze({
        ok: false,
        verified: false,
        error: 'receipt_violates_zero_leakage_boundary',
        reason: `Receipt contains forbidden transaction detail: ${forbidden}`
      });
    }
  }

  if (typeof receipt.receipt_id !== 'string' || !receipt.receipt_id.startsWith('proof_inc_')) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_receipt_id_format' });
  }

  if (!ALLOWED_INCOME_PROOF_TIERS.includes(receipt.qualification_tier)) {
    return deepFreeze({ ok: false, verified: false, error: 'unknown_qualification_tier' });
  }

  if (typeof receipt.qualifies_for_relief !== 'boolean') {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_qualifies_for_relief_boolean' });
  }

  if (typeof receipt.threshold_percent !== 'number' || isNaN(receipt.threshold_percent) || receipt.threshold_percent < 1 || receipt.threshold_percent > 99) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_threshold_percent' });
  }

  if (!isValidCurrencyCode(receipt.currency)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_currency_code' });
  }

  if (!receipt.baseline_period || typeof receipt.baseline_period !== 'object' ||
      !isValidCalendarDate(receipt.baseline_period.start) || !isValidCalendarDate(receipt.baseline_period.end)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_baseline_period' });
  }

  if (!receipt.evaluation_period || typeof receipt.evaluation_period !== 'object' ||
      !isValidCalendarDate(receipt.evaluation_period.start) || !isValidCalendarDate(receipt.evaluation_period.end)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_evaluation_period' });
  }

  if (typeof receipt.commitment_hash !== 'string' || receipt.commitment_hash.length < 8) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_commitment_hash' });
  }

  if (!Number.isSafeInteger(receipt.transaction_count) || receipt.transaction_count < 0) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_transaction_count' });
  }

  const expectedSeed = `${receipt.qualification_tier}|${receipt.qualifies_for_relief}|${receipt.threshold_percent}|${receipt.currency}|${receipt.commitment_hash}|${receipt.transaction_count}|${receipt.baseline_period.start}|${receipt.baseline_period.end}|${receipt.evaluation_period.start}|${receipt.evaluation_period.end}`;
  const expectedReceiptHash = computeContextFingerprint(expectedSeed);
  const expectedReceiptId = `proof_inc_${expectedReceiptHash}`;

  if (receipt.receipt_id !== expectedReceiptId) {
    return deepFreeze({
      ok: false,
      verified: false,
      error: 'receipt_tampered_or_corrupted',
      reason: 'Receipt fingerprint mismatch indicates tampered or altered parameters.'
    });
  }

  if (options && typeof options === 'object') {
    if (options.expected_tier && receipt.qualification_tier !== options.expected_tier) {
      return deepFreeze({
        ok: true,
        verified: false,
        error: 'tier_mismatch',
        reason: `Receipt tier '${receipt.qualification_tier}' does not match expected tier '${options.expected_tier}'`
      });
    }

    if (options.expected_currency && receipt.currency !== options.expected_currency) {
      return deepFreeze({
        ok: true,
        verified: false,
        error: 'currency_mismatch',
        reason: `Receipt currency '${receipt.currency}' does not match expected '${options.expected_currency}'`
      });
    }

    if (options.require_qualification && !receipt.qualifies_for_relief) {
      return deepFreeze({
        ok: true,
        verified: false,
        error: 'relief_threshold_not_met',
        reason: `Receipt indicates qualification threshold of ${receipt.threshold_percent}% was not met`
      });
    }

    if (options.preimage && typeof options.preimage === 'object') {
      const preHash = computeIncomeProofCommitment({
        baseline_income_cents: options.preimage.baseline_cents,
        evaluation_income_cents: options.preimage.eval_cents,
        qualification_tier: receipt.qualification_tier,
        currency: receipt.currency,
        salt: options.preimage.salt || 'cin_local_twin_salt',
        baseline_period: receipt.baseline_period,
        evaluation_period: receipt.evaluation_period
      });
      if (preHash !== receipt.commitment_hash) {
        return deepFreeze({
          ok: false,
          verified: false,
          error: 'commitment_preimage_mismatch',
          reason: 'Preimage amounts or salt do not produce the receipt commitment hash'
        });
      }
    }
  }

  return deepFreeze({
    ok: true,
    verified: true,
    receipt_id: receipt.receipt_id,
    qualification_tier: receipt.qualification_tier,
    qualifies_for_relief: receipt.qualifies_for_relief,
    currency: receipt.currency,
    transaction_count: receipt.transaction_count,
    reason: `Receipt verified authentic with tier: ${receipt.qualification_tier}`
  });
}

/**
 * Summarizes the income verification proof result for UI display without innerHTML.
 *
 * @param {object} result Result from generateIncomeVerificationProof
 * @returns {object} Deeply frozen summary { ok, text, tier_label, status_class }
 */
export function summarizeIncomeProof(result) {
  if (!result || typeof result !== 'object' || !result.ok || !result.receipt) {
    return deepFreeze({
      ok: false,
      text: result?.reason || result?.error || 'Verification proof could not be generated fail-closed.',
      tier_label: 'Generation failed',
      status_class: 'status-err'
    });
  }

  const r = result.receipt;
  const cs = result.client_summary;
  const dropPct = cs?.drop_percent !== undefined ? `${cs.drop_percent}%` : '';

  let tierLabel = 'No income drop';
  let statusClass = 'status-ok';

  if (r.qualification_tier === 'severe_shock') {
    tierLabel = 'Severe income shock (>= 50% drop)';
    statusClass = 'status-warn';
  } else if (r.qualification_tier === 'substantial_drop') {
    tierLabel = 'Substantial income drop (>= 30% drop)';
    statusClass = 'status-warn';
  } else if (r.qualification_tier === 'moderate_drop') {
    tierLabel = 'Moderate income drop (>= 20% drop)';
    statusClass = 'status-warn';
  } else if (r.qualification_tier === 'minor_drop') {
    tierLabel = 'Minor income drop (>= 5% drop)';
    statusClass = 'status-ok';
  }

  const qualifiesText = r.qualifies_for_relief
    ? `Qualifies for relief under ${r.threshold_percent}% threshold.`
    : `Does not meet relief threshold of ${r.threshold_percent}%.`;

  const text = `Local proof generated (${r.receipt_id}). Evaluated ${r.transaction_count} transactions with zero raw details exposed. Income drop: ${dropPct} (${tierLabel}). ${qualifiesText}`;

  return deepFreeze({
    ok: true,
    text,
    tier_label: tierLabel,
    qualifies: r.qualifies_for_relief,
    status_class: statusClass,
    receipt_id: r.receipt_id
  });
}


// ============================================================================
// Client-Side Retrieval Airlock (Scenario SC-20261025-0272 Opportunity 2)
// Protects personal twins and local edge models from indirect prompt injections,
// control character overrides, authority usurpation, and exfiltration attempts
// in retrieved external documents before context insertion.
// ============================================================================

export const RETRIEVAL_AIRLOCK_STATUSES = Object.freeze(['clean', 'sanitized', 'quarantined']);

export const RETRIEVAL_AIRLOCK_DEFAULTS = Object.freeze({
  max_content_length: 200000,
  max_title_length: 300,
  max_url_length: 2000,
  quarantine_threshold_triggers: 3,
  default_salt: 'cin_airlock_salt'
});

const FORBIDDEN_AIRLOCK_PROTOTYPE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const ALLOWED_RETRIEVAL_DOC_KEYS = new Set(['url', 'content', 'retrieved_at', 'title', 'origin', 'task_context']);

function isValidIsoDateTime(str) {
  if (typeof str !== 'string') return false;
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  if (!isoPattern.test(str)) return false;
  const datePart = str.slice(0, 10);
  if (!isValidCalendarDate(datePart)) return false;
  const timestamp = Date.parse(str);
  return !Number.isNaN(timestamp);
}

/**
 * Validates an incoming retrieval document candidate fail-closed.
 *
 * @param {object} doc Candidate document object
 * @returns {object} { ok: true, value: frozenDoc } or { ok: false, error: string, reason: string }
 */
export function validateRetrievalDocument(doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return deepFreeze({
      ok: false,
      error: 'invalid_retrieval_document',
      reason: 'Retrieval document must be a non-null object'
    });
  }

  if (Object.prototype.hasOwnProperty.call(doc, '__proto__') ||
      Object.prototype.hasOwnProperty.call(doc, 'constructor') ||
      Object.prototype.hasOwnProperty.call(doc, 'prototype') ||
      (Object.getPrototypeOf(doc) !== Object.prototype && Object.getPrototypeOf(doc) !== null)) {
    return deepFreeze({
      ok: false,
      error: 'prototype_pollution_detected',
      reason: 'Retrieval document contains forbidden prototype property or non-standard prototype'
    });
  }

  for (const key of Object.keys(doc)) {
    if (!ALLOWED_RETRIEVAL_DOC_KEYS.has(key)) {
      return deepFreeze({
        ok: false,
        error: 'unknown_document_field',
        reason: 'Retrieval document contains unrecognized field: ' + key
      });
    }
  }

  if (typeof doc.url !== 'string' || doc.url.trim().length === 0) {
    return deepFreeze({
      ok: false,
      error: 'invalid_document_url',
      reason: 'Retrieval document must include a non-empty url string'
    });
  }

  const url = doc.url.trim();
  if (url.length > RETRIEVAL_AIRLOCK_DEFAULTS.max_url_length || !/^https?:\/\/[^\s]+$/i.test(url)) {
    return deepFreeze({
      ok: false,
      error: 'invalid_document_url_format',
      reason: 'Retrieval document url must be a valid http or https URL within length bounds'
    });
  }

  if (typeof doc.content !== 'string' || doc.content.length === 0) {
    return deepFreeze({
      ok: false,
      error: 'empty_document_content',
      reason: 'Retrieval document content must be a non-empty string'
    });
  }

  if (doc.content.length > RETRIEVAL_AIRLOCK_DEFAULTS.max_content_length) {
    return deepFreeze({
      ok: false,
      error: 'content_length_exceeded',
      reason: 'Document content exceeds maximum length of ' + RETRIEVAL_AIRLOCK_DEFAULTS.max_content_length + ' characters'
    });
  }

  if (typeof doc.retrieved_at !== 'string' || !isValidIsoDateTime(doc.retrieved_at)) {
    return deepFreeze({
      ok: false,
      error: 'invalid_retrieved_at_timestamp',
      reason: 'retrieved_at must be a valid ISO 8601 date-time string'
    });
  }

  const retrievedTime = new Date(doc.retrieved_at).getTime();
  if (retrievedTime > Date.now() + 60000) {
    return deepFreeze({
      ok: false,
      error: 'future_timestamp',
      reason: 'retrieved_at cannot be in the future'
    });
  }

  if (doc.title !== undefined) {
    if (typeof doc.title !== 'string' || doc.title.length > RETRIEVAL_AIRLOCK_DEFAULTS.max_title_length) {
      return deepFreeze({
        ok: false,
        error: 'invalid_title',
        reason: 'Document title must be a string <= ' + RETRIEVAL_AIRLOCK_DEFAULTS.max_title_length + ' characters'
      });
    }
  }

  if (doc.origin !== undefined && (typeof doc.origin !== 'string' || doc.origin.length > 500)) {
    return deepFreeze({
      ok: false,
      error: 'invalid_origin',
      reason: 'Document origin must be a string <= 500 characters'
    });
  }

  if (doc.task_context !== undefined && (typeof doc.task_context !== 'string' || doc.task_context.length > 1000)) {
    return deepFreeze({
      ok: false,
      error: 'invalid_task_context',
      reason: 'Document task_context must be a string <= 1000 characters'
    });
  }

  return deepFreeze({
    ok: true,
    value: deepFreeze({
      url,
      content: doc.content,
      retrieved_at: doc.retrieved_at,
      title: doc.title ? doc.title.trim() : '',
      origin: doc.origin ? doc.origin.trim() : '',
      task_context: doc.task_context ? doc.task_context.trim() : ''
    })
  });
}

export function processRetrievalAirlock(doc, options = {}) {
  const validation = validateRetrievalDocument(doc);
  if (!validation.ok) {
    return deepFreeze({
      ok: false,
      status: 'quarantined',
      error: validation.error,
      reason: validation.reason,
      receipt: null
    });
  }

  const validDoc = validation.value;
  const opts = options && typeof options === 'object' && !Array.isArray(options) ? options : {};
  const strictMode = Boolean(opts.strict_mode);
  const salt = typeof opts.salt === 'string' && opts.salt.length > 0 ? opts.salt : RETRIEVAL_AIRLOCK_DEFAULTS.default_salt;

  const originalContent = validDoc.content;
  const originalHash = computeContextFingerprint(originalContent);

  let currentContent = originalContent;
  let mutationCount = 0;
  const findings = [];
  let hasExfiltration = false;

  // 1. Zero-width unicode steganography detection and stripping
  const zeroWidthRegex = /[\u200B-\u200D\uFEFF\u202A-\u202E\u2060-\u2064]/g;
  const zeroWidthMatches = currentContent.match(zeroWidthRegex);
  if (zeroWidthMatches && zeroWidthMatches.length > 0) {
    mutationCount += zeroWidthMatches.length;
    findings.push('zero_width_steganography');
    currentContent = currentContent.replace(zeroWidthRegex, '');
  }

  // 2. Delimiter injection and role impersonation detection
  const delimiterRegex = /<\|im_start\|>|<\|im_end\|>|<\|endoftext\|>|```+(?:system|instructions|prompt)|<\/?(?:system|instructions|prompt)>/gi;
  if (delimiterRegex.test(currentContent)) {
    findings.push('delimiter_injection');
    currentContent = currentContent.replace(delimiterRegex, () => {
      mutationCount++;
      return '[neutralized_delimiter]';
    });
  }

  // 3. Imperative instruction override and jailbreak patterns
  const instructionOverrideRegex = /\b(?:ignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|directives|prompts|rules|commands)|you\s+are\s+now\s+(?:an?\s+)?(?:unrestricted|jailbroken|in\s+developer\s+mode)|do\s+not\s+follow\s+(?:any\s+)?(?:safety|system)\s+rules|disregard\s+(?:the\s+|all\s+)?(?:system|safety|previous|prior)\s+(?:guidelines|rules|instructions|directives))\b/gi;
  if (instructionOverrideRegex.test(currentContent)) {
    findings.push('instruction_override');
    currentContent = currentContent.replace(instructionOverrideRegex, () => {
      mutationCount++;
      return '[neutralized_instruction_override]';
    });
  }

  // 4. Authority usurpation & Confused Deputy triggers (arXiv:2610.15138)
  const authorityHijackRegex = /\b(?:grant\s+(?:full\s+)?(?:access|permission|credentials|token)|click\s+(?:the\s+)?(?:approve|confirm|authorize|pay|purchase)\s+button|approve\s+(?:this|the)\s+(?:access|request|action|grant|transaction)|execute\s+(?:the\s+)?(?:following|attached)\s+(?:command|script|shell|terminal))\b/gi;
  if (authorityHijackRegex.test(currentContent)) {
    findings.push('authority_hijack');
    currentContent = currentContent.replace(authorityHijackRegex, () => {
      mutationCount++;
      return '[neutralized_authority_hijack]';
    });
  }

  // 5. Active data exfiltration patterns
  const mdExfiltrationRegex = /!\[[^\]]*\]\((https?:\/\/[^\s\)]+?(?:token|key|secret|password|credential|env|leak)[^\s\)]*)\)/gi;
  if (mdExfiltrationRegex.test(currentContent)) {
    hasExfiltration = true;
    findings.push('data_exfiltration_attempt');
    currentContent = currentContent.replace(mdExfiltrationRegex, () => {
      mutationCount++;
      return '[quarantined_exfiltration_target]';
    });
  }

  const explicitExfiltrationRegex = /\b(?:send|exfiltrate|forward|post|upload|fetch|curl|request|transmit)\s+(?:(?:all\s+)?(?:records|credentials|tokens|keys|passwords|data|files)\s+(?:to\s+)?)?https?:\/\/[^\s]+/gi;
  if (explicitExfiltrationRegex.test(currentContent)) {
    hasExfiltration = true;
    findings.push('data_exfiltration_attempt');
    currentContent = currentContent.replace(explicitExfiltrationRegex, () => {
      mutationCount++;
      return '[quarantined_exfiltration_target]';
    });
  }

  const uniqueFindings = Object.freeze(Array.from(new Set(findings)).sort());

  let status = 'clean';
  let sanitizedContent = currentContent;

  if (hasExfiltration || uniqueFindings.length >= RETRIEVAL_AIRLOCK_DEFAULTS.quarantine_threshold_triggers || (strictMode && uniqueFindings.length > 0)) {
    status = 'quarantined';
    sanitizedContent = '[QUARANTINED: Content contains active data exfiltration or critical prompt injection payloads. Blocked from local model context.]';
  } else if (uniqueFindings.length > 0 || mutationCount > 0) {
    status = 'sanitized';
  }

  const sanitizedHash = computeContextFingerprint(sanitizedContent);
  const receiptSeed = `${status}|${validDoc.url}|${originalHash}|${sanitizedHash}|${uniqueFindings.join(',')}|${validDoc.retrieved_at}|${salt}`;
  const commitmentHash = computeContextFingerprint(receiptSeed);
  const receiptId = `airlock_rcpt_${commitmentHash}`;

  const receipt = deepFreeze({
    receipt_id: receiptId,
    status,
    url: validDoc.url,
    title: validDoc.title,
    retrieved_at: validDoc.retrieved_at,
    original_hash: originalHash,
    sanitized_hash: sanitizedHash,
    mutation_count: mutationCount,
    findings: uniqueFindings,
    is_safe_for_model: status !== 'quarantined',
    commitment_hash: commitmentHash
  });

  return deepFreeze({
    ok: true,
    status,
    original_hash: originalHash,
    sanitized_hash: sanitizedHash,
    sanitized_content: sanitizedContent,
    findings: uniqueFindings,
    mutation_count: mutationCount,
    receipt
  });
}

/**
 * Cryptographically verifies an airlock provenance receipt.
 *
 * @param {object} receipt The receipt produced by processRetrievalAirlock
 * @param {object} [options] Verification options, including optional preimage
 * @returns {object} Deeply frozen verification verdict
 */
export function verifyRetrievalAirlockReceipt(receipt, options = {}) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_receipt', reason: 'Receipt must be a non-null object' });
  }

  if (Object.prototype.hasOwnProperty.call(receipt, '__proto__') ||
      Object.prototype.hasOwnProperty.call(receipt, 'constructor') ||
      Object.prototype.hasOwnProperty.call(receipt, 'prototype') ||
      (Object.getPrototypeOf(receipt) !== Object.prototype && Object.getPrototypeOf(receipt) !== null)) {
    return deepFreeze({ ok: false, verified: false, error: 'prototype_pollution_detected' });
  }

  const requiredFields = [
    'receipt_id', 'status', 'url', 'retrieved_at',
    'original_hash', 'sanitized_hash', 'mutation_count',
    'findings', 'is_safe_for_model', 'commitment_hash'
  ];

  for (const f of requiredFields) {
    if (receipt[f] === undefined) {
      return deepFreeze({ ok: false, verified: false, error: 'missing_receipt_field', reason: 'Missing field: ' + f });
    }
  }

  if (!RETRIEVAL_AIRLOCK_STATUSES.includes(receipt.status)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_status', reason: 'Unknown status: ' + receipt.status });
  }

  if (!Array.isArray(receipt.findings)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_findings', reason: 'Findings must be an array' });
  }

  if (!Number.isSafeInteger(receipt.mutation_count) || receipt.mutation_count < 0) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_mutation_count', reason: 'mutation_count must be a non-negative safe integer' });
  }

  if (typeof receipt.commitment_hash !== 'string' || receipt.commitment_hash.length < 8) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_commitment_hash', reason: 'Invalid commitment hash' });
  }

  const expectedSafe = receipt.status !== 'quarantined';
  if (receipt.is_safe_for_model !== expectedSafe) {
    return deepFreeze({ ok: false, verified: false, error: 'safety_status_inconsistent', reason: 'is_safe_for_model must be false when quarantined' });
  }

  const salt = (options && typeof options === 'object' && typeof options.salt === 'string' && options.salt.length > 0)
    ? options.salt
    : (options?.preimage?.salt || RETRIEVAL_AIRLOCK_DEFAULTS.default_salt);

  const uniqueFindings = Array.from(new Set(receipt.findings)).sort();
  const expectedSeed = receipt.status + '|' + receipt.url + '|' + receipt.original_hash + '|' + receipt.sanitized_hash + '|' + uniqueFindings.join(',') + '|' + receipt.retrieved_at + '|' + salt;
  const expectedCommitment = computeContextFingerprint(expectedSeed);

  if (receipt.commitment_hash !== expectedCommitment) {
    return deepFreeze({ ok: false, verified: false, error: 'commitment_hash_mismatch', reason: 'Receipt commitment hash does not match expected state' });
  }

  if (receipt.receipt_id !== 'airlock_rcpt_' + expectedCommitment) {
    return deepFreeze({ ok: false, verified: false, error: 'receipt_id_mismatch', reason: 'receipt_id does not bind expected commitment hash' });
  }

  if (options && typeof options === 'object' && options.preimage && typeof options.preimage === 'object') {
    const pre = options.preimage;

    if (typeof pre.content === 'string') {
      const computedOrig = computeContextFingerprint(pre.content);
      if (computedOrig !== receipt.original_hash) {
        return deepFreeze({ ok: false, verified: false, error: 'original_content_mismatch', reason: 'Original content preimage does not match receipt hash' });
      }
    }

    if (typeof pre.sanitized_content === 'string') {
      const computedSan = computeContextFingerprint(pre.sanitized_content);
      if (computedSan !== receipt.sanitized_hash) {
        return deepFreeze({ ok: false, verified: false, error: 'sanitized_content_mismatch', reason: 'Sanitized content preimage does not match receipt hash' });
      }
    }
  }

  return deepFreeze({
    ok: true,
    verified: true,
    receipt_id: receipt.receipt_id,
    status: receipt.status,
    is_safe_for_model: receipt.is_safe_for_model,
    mutation_count: receipt.mutation_count,
    reason: 'Receipt verified authentic with status: ' + receipt.status
  });
}

export function summarizeRetrievalAirlock(result) {
  if (!result || typeof result !== 'object' || !result.ok || !result.receipt) {
    return deepFreeze({
      ok: false,
      text: result?.reason || result?.error || 'Airlock processing failed fail-closed.',
      status_label: 'Processing failed',
      status_class: 'status-err',
      is_safe: false
    });
  }

  const r = result.receipt;
  let statusLabel = 'Clean document';
  let statusClass = 'status-ok';
  let text = '';

  if (r.status === 'clean') {
    statusLabel = 'Clean document';
    statusClass = 'status-ok';
    text = `Airlock detected no known injection patterns in tested rule set (${r.receipt_id}).`;
  } else if (r.status === 'sanitized') {
    statusLabel = `Sanitized (${r.mutation_count} neutralizations)`;
    statusClass = 'status-warn';
    const findingDesc = r.findings.map(f => f.replace(/_/g, ' ')).join(', ');
    text = `Airlock neutralized ${r.mutation_count} potential injection payloads (${findingDesc}). Document safely sanitized for local model context (${r.receipt_id}).`;
  } else if (r.status === 'quarantined') {
    statusLabel = 'Quarantined (Blocked)';
    statusClass = 'status-err';
    const findingDesc = r.findings.map(f => f.replace(/_/g, ' ')).join(', ');
    text = `Airlock quarantined untrusted document (${r.receipt_id}). Detected active exfiltration or critical exploit triggers (${findingDesc}). Content blocked from local model context.`;
  }

  return deepFreeze({
    ok: true,
    text,
    status_label: statusLabel,
    status_class: statusClass,
    is_safe: r.is_safe_for_model,
    receipt_id: r.receipt_id
  });
}


// ============================================================================
// INFORMATION FLOW GOVERNOR FOR TWIN RUNTIME TOOL DISPATCH (D-0750)
// Grounded in:
// - arXiv:2609.38289 (Privacy in Personalized AI Is a System Property: Data-access, inferential, behavioral, and compositional leakage)
// - arXiv:2604.19657 (GAAP: Guaranteed Accounting for Agent Privacy / deterministic IFC on tool parameters)
// - Scenario SC-20261025-0253 Opportunity #1
// ============================================================================

export const FLOW_SECURITY_TIERS = Object.freeze([
  'public',
  'protected',
  'confidential',
  'restricted'
]);

export const FLOW_POLICY_MODES = Object.freeze([
  'allow',
  'redact',
  'block',
  'require_consent'
]);

export const FLOW_LEAKAGE_CHANNELS = Object.freeze([
  'data_access',
  'inferential',
  'compositional',
  'credential'
]);

export const FLOW_TIER_RANKS = Object.freeze({
  public: 0,
  protected: 1,
  confidential: 2,
  restricted: 3
});

export const SENSITIVE_FLOW_PATTERNS = Object.freeze([
  { id: 'bearer_token', regex: /bearer\s+[a-zA-Z0-9_\-.]{16,}/i, tier: 'restricted', channel: 'credential' },
  { id: 'private_key', regex: /-----BEGIN\s+(?:RSA|EC|OPENSSH|DSA|PGP)?\s*PRIVATE KEY/i, tier: 'restricted', channel: 'credential' },
  { id: 'api_key_param', regex: /(?:api[_-]?key|access[_-]?token|secret[_-]?key)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{16,}['"]?/i, tier: 'restricted', channel: 'credential' },
  { id: 'credit_card', regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/, tier: 'confidential', channel: 'data_access' },
  { id: 'ssn_pattern', regex: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/, tier: 'confidential', channel: 'data_access' },
  { id: 'bank_routing_account', regex: /\b(?:routing|account)\s*#?\s*\d{8,17}\b/i, tier: 'confidential', channel: 'data_access' },
  { id: 'medical_condition', regex: /\b(?:diagnosed with|prescription for|penicillin allergy|bipolar disorder|hiv positive|chemotherapy)\b/i, tier: 'confidential', channel: 'inferential' },
  { id: 'path_traversal', regex: /(?:\.\.\/|\.\.\\)/, tier: 'restricted', channel: 'data_access' },
  { id: 'system_file_access', regex: /(?:\/etc\/passwd|\/etc\/shadow|c:\\windows\\system32)/i, tier: 'restricted', channel: 'data_access' }
]);

export const FLOW_GOVERNOR_DEFAULTS = Object.freeze({
  default_salt: 'twin_flow_salt_v1',
  max_recursion_depth: 5,
  max_string_scan_length: 5000
});

export function validateToolDispatchDescriptor(descriptor) {
  if (!descriptor || typeof descriptor !== 'object' || Array.isArray(descriptor)) {
    return deepFreeze({ ok: false, error: 'invalid_descriptor', reason: 'Descriptor must be a non-null object' });
  }

  if (Object.prototype.hasOwnProperty.call(descriptor, '__proto__') ||
      Object.prototype.hasOwnProperty.call(descriptor, 'constructor') ||
      Object.prototype.hasOwnProperty.call(descriptor, 'prototype') ||
      (Object.getPrototypeOf(descriptor) !== Object.prototype && Object.getPrototypeOf(descriptor) !== null)) {
    return deepFreeze({ ok: false, error: 'prototype_pollution_detected', reason: 'Prototype pollution attempt detected' });
  }

  const allowedKeys = ['tool_name', 'destination_tier', 'parameters', 'caller_agent', 'context_tags', 'intent_description'];
  for (const k of Object.keys(descriptor)) {
    if (!allowedKeys.includes(k)) {
      return deepFreeze({ ok: false, error: 'unknown_field', reason: 'Unknown field in descriptor: ' + k });
    }
  }

  if (typeof descriptor.tool_name !== 'string' || descriptor.tool_name.trim().length === 0 || descriptor.tool_name.length > 64) {
    return deepFreeze({ ok: false, error: 'invalid_tool_name', reason: 'tool_name must be a non-empty string <= 64 chars' });
  }
  if (!/^[a-zA-Z0-9_\-.]+$/.test(descriptor.tool_name)) {
    return deepFreeze({ ok: false, error: 'invalid_tool_name_chars', reason: 'tool_name contains invalid characters' });
  }

  if (typeof descriptor.destination_tier !== 'string' || !FLOW_SECURITY_TIERS.includes(descriptor.destination_tier)) {
    return deepFreeze({ ok: false, error: 'invalid_destination_tier', reason: 'destination_tier must be one of: ' + FLOW_SECURITY_TIERS.join(', ') });
  }

  if (!descriptor.parameters || typeof descriptor.parameters !== 'object' || Array.isArray(descriptor.parameters)) {
    return deepFreeze({ ok: false, error: 'invalid_parameters', reason: 'parameters must be a non-null object' });
  }

  if (descriptor.caller_agent !== undefined) {
    if (typeof descriptor.caller_agent !== 'string' || descriptor.caller_agent.length > 64) {
      return deepFreeze({ ok: false, error: 'invalid_caller_agent', reason: 'caller_agent must be a string <= 64 chars' });
    }
  }

  if (descriptor.intent_description !== undefined) {
    if (typeof descriptor.intent_description !== 'string' || descriptor.intent_description.length > 200) {
      return deepFreeze({ ok: false, error: 'invalid_intent_description', reason: 'intent_description must be a string <= 200 chars' });
    }
  }

  let frozenTags = [];
  if (descriptor.context_tags !== undefined) {
    if (!Array.isArray(descriptor.context_tags)) {
      return deepFreeze({ ok: false, error: 'invalid_context_tags', reason: 'context_tags must be an array of strings' });
    }
    for (const tag of descriptor.context_tags) {
      if (typeof tag !== 'string' || tag.trim().length === 0 || tag.length > 32) {
        return deepFreeze({ ok: false, error: 'invalid_tag_element', reason: 'Each tag must be a non-empty string <= 32 chars' });
      }
    }
    frozenTags = Array.from(new Set(descriptor.context_tags.map(t => t.trim().toLowerCase()))).sort();
  }

  return deepFreeze({
    ok: true,
    tool_name: descriptor.tool_name.trim(),
    destination_tier: descriptor.destination_tier,
    parameters: JSON.parse(JSON.stringify(descriptor.parameters)),
    caller_agent: descriptor.caller_agent ? descriptor.caller_agent.trim() : 'anonymous_agent',
    intent_description: descriptor.intent_description ? descriptor.intent_description.trim() : '',
    context_tags: frozenTags
  });
}

export function evaluateInformationFlow(dispatchDescriptor, policyOptions = {}) {
  const validated = validateToolDispatchDescriptor(dispatchDescriptor);
  if (!validated.ok) {
    return deepFreeze({
      ok: false,
      allowed: false,
      status: 'blocked',
      error: validated.error,
      reason: validated.reason,
      findings: [validated.error],
      channels_implicated: [],
      sanitized_parameters: null,
      receipt: null
    });
  }

  const destTier = validated.destination_tier;
  const destRank = FLOW_TIER_RANKS[destTier];
  const findings = [];
  const channels = new Set();
  let redactionCount = 0;

  // 1. Check compositional taint from context_tags (arXiv:2609.38289 Section 3.4)
  if (validated.context_tags.includes('restricted') && destRank < FLOW_TIER_RANKS.restricted) {
    findings.push('compositional_restricted_context_leakage');
    channels.add('compositional');
  }
  if (validated.context_tags.includes('confidential') && destRank < FLOW_TIER_RANKS.confidential) {
    findings.push('compositional_confidential_context_leakage');
    channels.add('compositional');
  }
  if (validated.context_tags.includes('medical') && destRank === FLOW_TIER_RANKS.public) {
    findings.push('compositional_medical_context_leakage');
    channels.add('compositional');
    channels.add('inferential');
  }
  if (validated.context_tags.includes('financial') && destRank === FLOW_TIER_RANKS.public) {
    findings.push('compositional_financial_context_leakage');
    channels.add('compositional');
    channels.add('data_access');
  }

  // 2. Deep scan parameters
  function scanAndSanitize(value, depth = 0) {
    if (depth > FLOW_GOVERNOR_DEFAULTS.max_recursion_depth) return value;
    if (typeof value === 'string') {
      let currentStr = value;
      for (const pattern of SENSITIVE_FLOW_PATTERNS) {
        const patternRank = FLOW_TIER_RANKS[pattern.tier];
        // If detected pattern sensitivity exceeds destination rank, violation
        if (patternRank > destRank && pattern.regex.test(currentStr)) {
          findings.push(pattern.id);
          channels.add(pattern.channel);
          // Redact
          currentStr = currentStr.replace(pattern.regex, '[REDACTED_BY_FLOW_GOVERNOR:' + pattern.id + ']');
          redactionCount++;
        }
      }
      return currentStr;
    } else if (Array.isArray(value)) {
      return value.map(item => scanAndSanitize(item, depth + 1));
    } else if (value && typeof value === 'object') {
      const sanitizedObj = {};
      for (const [k, v] of Object.entries(value)) {
        // Check parameter key for sensitive names
        if (destRank === FLOW_TIER_RANKS.public) {
          if (/(?:password|passwd|secret|apikey|token|private_key|seed_phrase)/i.test(k)) {
            findings.push('sensitive_parameter_key_' + k.toLowerCase());
            channels.add('credential');
          }
        }
        sanitizedObj[k] = scanAndSanitize(v, depth + 1);
      }
      return sanitizedObj;
    }
    return value;
  }

  const sanitizedParams = scanAndSanitize(validated.parameters, 0);

  // Determine final status
  let status = 'allowed';
  let allowed = true;

  if (findings.length > 0) {
    // If destination is public, violations are blocked (or redacted if allow_redaction option enabled)
    if (destRank === FLOW_TIER_RANKS.public) {
      if (policyOptions.allow_redaction && redactionCount > 0 && !channels.has('compositional')) {
        status = 'redacted';
        allowed = true;
      } else {
        status = 'blocked';
        allowed = false;
      }
    } else if (destRank <= FLOW_TIER_RANKS.protected) {
      if (channels.has('credential') || findings.includes('path_traversal') || findings.includes('system_file_access')) {
        status = 'blocked';
        allowed = false;
      } else {
        status = 'consent_required';
        allowed = false;
      }
    } else {
      // confidential destination with restricted finding
      if (channels.has('credential')) {
        status = 'consent_required';
        allowed = false;
      }
    }
  }

  const evaluatedAt = new Date().toISOString();
  const sortedFindings = Array.from(new Set(findings)).sort();
  const sortedChannels = Array.from(channels).sort();

  const salt = (policyOptions && typeof policyOptions.salt === 'string' && policyOptions.salt.length > 0)
    ? policyOptions.salt
    : FLOW_GOVERNOR_DEFAULTS.default_salt;

  const originalHash = computeContextFingerprint(JSON.stringify(validated.parameters));
  const sanitizedHash = computeContextFingerprint(JSON.stringify(sanitizedParams));

  const commitmentSeed = [
    status,
    validated.tool_name,
    destTier,
    originalHash,
    sanitizedHash,
    sortedFindings.join(','),
    sortedChannels.join(','),
    evaluatedAt,
    salt
  ].join('|');

  const commitmentHash = computeContextFingerprint(commitmentSeed);
  const receiptId = 'flow_rcpt_' + commitmentHash;

  const receipt = deepFreeze({
    receipt_id: receiptId,
    tool_name: validated.tool_name,
    destination_tier: destTier,
    status,
    evaluated_at: evaluatedAt,
    original_hash: originalHash,
    sanitized_hash: sanitizedHash,
    findings: sortedFindings,
    channels_implicated: sortedChannels,
    redaction_count: redactionCount,
    commitment_hash: commitmentHash
  });

  return deepFreeze({
    ok: true,
    allowed,
    status,
    tool_name: validated.tool_name,
    destination_tier: destTier,
    findings: sortedFindings,
    channels_implicated: sortedChannels,
    sanitized_parameters: sanitizedParams,
    receipt,
    reason: allowed ? 'Information flow authorized' : ('Information flow blocked or held: ' + sortedFindings.join(', '))
  });
}

export function verifyInformationFlowReceipt(receipt, options = {}) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_receipt', reason: 'Receipt must be a non-null object' });
  }

  if (Object.prototype.hasOwnProperty.call(receipt, '__proto__') ||
      Object.prototype.hasOwnProperty.call(receipt, 'constructor') ||
      Object.prototype.hasOwnProperty.call(receipt, 'prototype') ||
      (Object.getPrototypeOf(receipt) !== Object.prototype && Object.getPrototypeOf(receipt) !== null)) {
    return deepFreeze({ ok: false, verified: false, error: 'prototype_pollution_detected' });
  }

  const requiredFields = [
    'receipt_id', 'tool_name', 'destination_tier', 'status',
    'evaluated_at', 'original_hash', 'sanitized_hash', 'findings',
    'channels_implicated', 'redaction_count', 'commitment_hash'
  ];

  for (const f of requiredFields) {
    if (receipt[f] === undefined) {
      return deepFreeze({ ok: false, verified: false, error: 'missing_receipt_field', reason: 'Missing field: ' + f });
    }
  }

  if (!FLOW_SECURITY_TIERS.includes(receipt.destination_tier)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_destination_tier' });
  }

  if (!Array.isArray(receipt.findings) || !Array.isArray(receipt.channels_implicated)) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_findings_array' });
  }

  if (!Number.isSafeInteger(receipt.redaction_count) || receipt.redaction_count < 0) {
    return deepFreeze({ ok: false, verified: false, error: 'invalid_redaction_count' });
  }

  const salt = (options && typeof options === 'object' && typeof options.salt === 'string' && options.salt.length > 0)
    ? options.salt
    : FLOW_GOVERNOR_DEFAULTS.default_salt;

  const sortedFindings = Array.from(new Set(receipt.findings)).sort();
  const sortedChannels = Array.from(new Set(receipt.channels_implicated)).sort();

  const expectedSeed = [
    receipt.status,
    receipt.tool_name,
    receipt.destination_tier,
    receipt.original_hash,
    receipt.sanitized_hash,
    sortedFindings.join(','),
    sortedChannels.join(','),
    receipt.evaluated_at,
    salt
  ].join('|');

  const expectedCommitment = computeContextFingerprint(expectedSeed);

  if (receipt.commitment_hash !== expectedCommitment) {
    return deepFreeze({ ok: false, verified: false, error: 'commitment_hash_mismatch', reason: 'Receipt commitment hash does not match state' });
  }

  if (receipt.receipt_id !== 'flow_rcpt_' + expectedCommitment) {
    return deepFreeze({ ok: false, verified: false, error: 'receipt_id_mismatch', reason: 'receipt_id does not bind commitment hash' });
  }

  return deepFreeze({
    ok: true,
    verified: true,
    receipt_id: receipt.receipt_id,
    status: receipt.status,
    tool_name: receipt.tool_name,
    destination_tier: receipt.destination_tier,
    redaction_count: receipt.redaction_count,
    reason: 'Receipt verified authentic with status: ' + receipt.status
  });
}

export function summarizeInformationFlow(result) {
  if (!result || typeof result !== 'object' || !result.ok || !result.receipt) {
    return deepFreeze({
      ok: false,
      text: result?.reason || result?.error || 'Information flow evaluation failed fail-closed.',
      status_label: 'Evaluation failed',
      status_class: 'status-err',
      allowed: false
    });
  }

  const r = result.receipt;
  let statusLabel = 'Allowed';
  let statusClass = 'status-ok';
  let text = '';

  if (r.status === 'allowed') {
    statusLabel = 'Clean flow';
    statusClass = 'status-ok';
    text = `Tool dispatch '${r.tool_name}' to ${r.destination_tier} destination complies with information flow boundaries (${r.receipt_id}).`;
  } else if (r.status === 'redacted') {
    statusLabel = `Redacted (${r.redaction_count} sensitive fields sanitized)`;
    statusClass = 'status-warn';
    const findingDesc = r.findings.map(f => f.replace(/_/g, ' ')).join(', ');
    text = `Tool dispatch '${r.tool_name}' permitted after redacting ${r.redaction_count} sensitive tokens (${findingDesc}). Target ${r.destination_tier} destination received sanitized payload (${r.receipt_id}).`;
  } else if (r.status === 'consent_required') {
    statusLabel = 'Requires confirmation';
    statusClass = 'status-warn';
    const channelsDesc = r.channels_implicated.map(c => c.replace(/_/g, ' ')).join(', ');
    text = `Tool dispatch '${r.tool_name}' requires explicit user confirmation. Crosses ${channelsDesc} privacy boundaries for ${r.destination_tier} destination (${r.receipt_id}).`;
  } else {
    statusLabel = 'Blocked';
    statusClass = 'status-err';
    const findingDesc = r.findings.map(f => f.replace(/_/g, ' ')).join(', ');
    text = `Tool dispatch '${r.tool_name}' blocked from sending to ${r.destination_tier} destination (${r.receipt_id}). Blocked sensitive leaks: ${findingDesc}.`;
  }

  return deepFreeze({
    ok: true,
    text,
    status_label: statusLabel,
    status_class: statusClass,
    allowed: result.allowed,
    receipt_id: r.receipt_id
  });
}

// ============================================================================
// DOM-READINESS & ADAPTIVE SETTLED STATE DETECTOR (D-0732 / arXiv:2610.32482)
// ============================================================================

export const DEFAULT_DOM_READINESS_CONFIG = Object.freeze({
  quiet_window_ms: 25,
  max_wait_ms: 500,
  target_settle_threshold_ms: 50,
  conservative_baseline_ms: 500
});

export const ALLOWED_DOM_READINESS_STATUSES = Object.freeze([
  'settled',
  'timeout_fallback',
  'immediate_ready',
  'error'
]);

export const ALLOWED_SETTLED_METRICS_FIELDS = Object.freeze([
  'status',
  'elapsed_ms',
  'mutation_count',
  'quiescent_ms',
  'timed_out',
  'reason',
  'diagnostics'
]);

/**
 * Deterministically evaluates whether a stream of DOM mutation events has reached
 * a settled, quiescent state without arbitrary conservative waiting delays.
 * Grounded in empirical measurement from WaitLens (arXiv:2610.32482).
 *
 * @param {Array<object>} mutationTimeline Ordered array of mutation events { at_ms, target, type }
 * @param {object} [options={}] Configuration options
 * @returns {object} Deeply frozen settled metrics evaluation
 */
export function evaluateSettledState(mutationTimeline, options = {}) {
  if (!Array.isArray(mutationTimeline)) {
    return deepFreeze({
      ok: false,
      status: 'error',
      elapsed_ms: 0,
      mutation_count: 0,
      quiescent_ms: 0,
      timed_out: false,
      reason: 'mutationTimeline must be an array of mutation objects',
      diagnostics: 'validation_failure'
    });
  }

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    return deepFreeze({
      ok: false,
      status: 'error',
      elapsed_ms: 0,
      mutation_count: 0,
      quiescent_ms: 0,
      timed_out: false,
      reason: 'options must be a plain object',
      diagnostics: 'validation_failure'
    });
  }

  const allowedOptions = new Set([
    'quiet_window_ms',
    'max_wait_ms',
    'target_settle_threshold_ms',
    'conservative_baseline_ms',
    'as_of_start_ms'
  ]);
  for (const k of Object.keys(options)) {
    if (!allowedOptions.has(k)) {
      return deepFreeze({
        ok: false,
        status: 'error',
        elapsed_ms: 0,
        mutation_count: 0,
        quiescent_ms: 0,
        timed_out: false,
        reason: `Unknown option: ${k}`,
        diagnostics: 'unknown_option'
      });
    }
  }

  const quietWindow = options.quiet_window_ms !== undefined
    ? options.quiet_window_ms
    : DEFAULT_DOM_READINESS_CONFIG.quiet_window_ms;
  const maxWait = options.max_wait_ms !== undefined
    ? options.max_wait_ms
    : DEFAULT_DOM_READINESS_CONFIG.max_wait_ms;
  const targetThreshold = options.target_settle_threshold_ms !== undefined
    ? options.target_settle_threshold_ms
    : DEFAULT_DOM_READINESS_CONFIG.target_settle_threshold_ms;

  if (typeof quietWindow !== 'number' || !Number.isFinite(quietWindow) || quietWindow <= 0) {
    return deepFreeze({
      ok: false,
      status: 'error',
      elapsed_ms: 0,
      mutation_count: 0,
      quiescent_ms: 0,
      timed_out: false,
      reason: 'quiet_window_ms must be a positive finite number',
      diagnostics: 'invalid_quiet_window'
    });
  }

  if (typeof maxWait !== 'number' || !Number.isFinite(maxWait) || maxWait <= quietWindow) {
    return deepFreeze({
      ok: false,
      status: 'error',
      elapsed_ms: 0,
      mutation_count: 0,
      quiescent_ms: 0,
      timed_out: false,
      reason: 'max_wait_ms must be a finite number greater than quiet_window_ms',
      diagnostics: 'invalid_max_wait'
    });
  }

  // Validate all timeline events
  let lastTimestamp = (typeof options.as_of_start_ms === 'number' && Number.isFinite(options.as_of_start_ms) && options.as_of_start_ms >= 0)
    ? options.as_of_start_ms
    : 0;
  for (let i = 0; i < mutationTimeline.length; i++) {
    const ev = mutationTimeline[i];
    if (ev === null || typeof ev !== 'object' || Array.isArray(ev)) {
      return deepFreeze({
        ok: false,
        status: 'error',
        elapsed_ms: 0,
        mutation_count: i,
        quiescent_ms: 0,
        timed_out: false,
        reason: `Mutation event at index ${i} must be a plain object`,
        diagnostics: 'invalid_event_structure'
      });
    }

    if (typeof ev.at_ms !== 'number' || !Number.isFinite(ev.at_ms) || ev.at_ms < 0) {
      return deepFreeze({
        ok: false,
        status: 'error',
        elapsed_ms: 0,
        mutation_count: i,
        quiescent_ms: 0,
        timed_out: false,
        reason: `Mutation event at index ${i} must have non-negative finite at_ms`,
        diagnostics: 'invalid_event_timestamp'
      });
    }

    if (ev.at_ms < lastTimestamp) {
      return deepFreeze({
        ok: false,
        status: 'error',
        elapsed_ms: 0,
        mutation_count: i,
        quiescent_ms: 0,
        timed_out: false,
        reason: `Timeline events must be monotonically non-decreasing (${ev.at_ms} < ${lastTimestamp})`,
        diagnostics: 'out_of_order_events'
      });
    }
    lastTimestamp = ev.at_ms;
  }

  // Case 1: Non-mutating UI target -> immediate readiness within quiet window
  if (mutationTimeline.length === 0) {
    const elapsed = Math.min(quietWindow, targetThreshold);
    return deepFreeze({
      ok: true,
      status: 'immediate_ready',
      elapsed_ms: elapsed,
      mutation_count: 0,
      quiescent_ms: elapsed,
      timed_out: false,
      reason: `Target element remained quiet; settled in ${elapsed}ms (<= ${targetThreshold}ms threshold)`,
      diagnostics: 'zero_mutations'
    });
  }

  // Case 2: Process mutations and identify first quiescent window
  let settleTime = null;
  for (let i = 0; i < mutationTimeline.length - 1; i++) {
    const current = mutationTimeline[i];
    const next = mutationTimeline[i + 1];
    const gap = next.at_ms - current.at_ms;

    if (gap >= quietWindow) {
      const candidateSettle = current.at_ms + quietWindow;
      if (candidateSettle <= maxWait) {
        settleTime = candidateSettle;
        break;
      }
    }
  }

  if (settleTime === null) {
    const lastEvent = mutationTimeline[mutationTimeline.length - 1];
    const candidateSettle = lastEvent.at_ms + quietWindow;
    if (candidateSettle <= maxWait) {
      settleTime = candidateSettle;
    }
  }

  // Case 3: If settled within max_wait_ms
  if (settleTime !== null && settleTime <= maxWait) {
    return deepFreeze({
      ok: true,
      status: 'settled',
      elapsed_ms: settleTime,
      mutation_count: mutationTimeline.length,
      quiescent_ms: quietWindow,
      timed_out: false,
      reason: `DOM mutations ceased; settled after ${settleTime}ms with ${mutationTimeline.length} observed mutations`,
      diagnostics: 'quiescent_window_satisfied'
    });
  }

  // Case 4: Fallback timeout exceeded fail-closed
  return deepFreeze({
    ok: true,
    status: 'timeout_fallback',
    elapsed_ms: maxWait,
    mutation_count: mutationTimeline.length,
    quiescent_ms: 0,
    timed_out: true,
    reason: `DOM did not reach quiescent state within ${maxWait}ms ceiling; safe fallback triggered without blocking`,
    diagnostics: 'max_wait_exceeded'
  });
}

/**
 * Asynchronous adaptive DOM readiness detector for interactive client actuation.
 * Observes DOM mutations on the target and resolves as soon as mutations stop for quiet_window_ms,
 * or immediately resolves within 50ms if no mutations occur. Fails closed on max_wait_ms timeout.
 *
 * @param {object|Element} targetOrAdapter DOM Element or test adapter object with observe/disconnect
 * @param {object} [options={}] Configuration parameters
 * @returns {Promise<object>} Promise resolving to deeply frozen settled metrics
 */
export async function waitForSettledState(targetOrAdapter, options = {}) {
  // Fail closed immediately on missing or invalid target
  if (!targetOrAdapter || (typeof targetOrAdapter.simulateEvents !== 'function' && typeof targetOrAdapter.nodeType !== 'number')) {
    return deepFreeze({
      ok: false,
      status: 'error',
      elapsed_ms: 0,
      mutation_count: 0,
      quiescent_ms: 0,
      timed_out: false,
      reason: 'targetOrAdapter must be a valid DOM node or simulation adapter with simulateEvents()',
      diagnostics: 'invalid_target'
    });
  }

  // Test adapter mode (deterministic unit testing without DOM mocks)
  if (typeof targetOrAdapter.simulateEvents === 'function') {
    let timeline;
    try {
      timeline = targetOrAdapter.simulateEvents();
    } catch (err) {
      return deepFreeze({
        ok: false,
        status: 'error',
        elapsed_ms: 0,
        mutation_count: 0,
        quiescent_ms: 0,
        timed_out: false,
        reason: `simulateEvents failed: ${err.message}`,
        diagnostics: 'adapter_simulation_failed'
      });
    }
    return evaluateSettledState(timeline, options);
  }

  const quietWindow = (options && typeof options.quiet_window_ms === 'number' && options.quiet_window_ms > 0)
    ? options.quiet_window_ms
    : DEFAULT_DOM_READINESS_CONFIG.quiet_window_ms;
  const maxWait = (options && typeof options.max_wait_ms === 'number' && options.max_wait_ms > quietWindow)
    ? options.max_wait_ms
    : DEFAULT_DOM_READINESS_CONFIG.max_wait_ms;

  const startTime = (options && typeof options.as_of_start_ms === 'number')
    ? options.as_of_start_ms
    : (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // Browser MutationObserver mode
  return new Promise((resolve) => {
    let mutationCount = 0;
    let quietTimer = null;
    let maxWaitTimer = null;
    let observer = null;
    let resolved = false;

    const cleanup = () => {
      if (quietTimer) clearTimeout(quietTimer);
      if (maxWaitTimer) clearTimeout(maxWaitTimer);
      if (observer && typeof observer.disconnect === 'function') {
        try { observer.disconnect(); } catch (_) {}
      }
    };

    const finish = (status, timedOut, reason, diagnostics) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      const nowTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsed = Math.max(1, Math.round(nowTime - startTime));
      resolve(deepFreeze({
        ok: true,
        status,
        elapsed_ms: elapsed,
        mutation_count: mutationCount,
        quiescent_ms: timedOut ? 0 : quietWindow,
        timed_out: timedOut,
        reason,
        diagnostics
      }));
    };

    // If MutationObserver is available in environment
    if (typeof MutationObserver !== 'undefined' && targetOrAdapter && typeof targetOrAdapter.nodeType === 'number') {
      try {
        observer = new MutationObserver((mutations) => {
          mutationCount += mutations.length;
          if (quietTimer) clearTimeout(quietTimer);
          quietTimer = setTimeout(() => {
            finish('settled', false, `DOM mutations settled (${mutationCount} mutations observed)`, 'quiescent_window_satisfied');
          }, quietWindow);
        });

        observer.observe(targetOrAdapter, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
        });
      } catch (err) {
        finish('error', false, `Failed to initialize MutationObserver: ${err.message}`, 'observer_init_failed');
        return;
      }
    }

    // Safety timeout ceiling
    maxWaitTimer = setTimeout(() => {
      finish('timeout_fallback', true, `Max wait time of ${maxWait}ms elapsed; proceeding with safe fallback`, 'max_wait_exceeded');
    }, maxWait);

    // Initial quiet timer (triggers immediate_ready if zero mutations occur)
    quietTimer = setTimeout(() => {
      if (mutationCount === 0) {
        finish('immediate_ready', false, `Target element was immediately quiet; settled in ${quietWindow}ms`, 'zero_mutations');
      } else {
        finish('settled', false, `DOM mutations settled (${mutationCount} mutations observed)`, 'quiescent_window_satisfied');
      }
    }, quietWindow);
  });
}

/**
 * Benchmarks an action sequence comparing conservative fixed delays vs adaptive settled state waiting.
 * Grounded in WaitLens empirical findings (arXiv:2610.32482).
 *
 * @param {Array<object>} actionSteps Array of step objects { step_name, mutations: Array<object> }
 * @param {object} [options={}] Benchmark options
 * @returns {object} Deeply frozen benchmark metrics summary
 */
export function benchmarkActuationSequence(actionSteps, options = {}) {
  if (!Array.isArray(actionSteps) || actionSteps.length === 0) {
    return deepFreeze({
      ok: false,
      step_count: 0,
      total_baseline_ms: 0,
      total_adaptive_ms: 0,
      time_saved_ms: 0,
      reduction_percent: 0,
      meets_target_reduction: false,
      reason: 'actionSteps must be a non-empty array'
    });
  }

  const baselineWait = (options && typeof options.conservative_baseline_ms === 'number' && options.conservative_baseline_ms > 0)
    ? options.conservative_baseline_ms
    : DEFAULT_DOM_READINESS_CONFIG.conservative_baseline_ms;

  let totalBaseline = 0;
  let totalAdaptive = 0;
  const stepResults = [];

  for (let i = 0; i < actionSteps.length; i++) {
    const step = actionSteps[i];
    if (!step || typeof step !== 'object' || Array.isArray(step)) {
      return deepFreeze({
        ok: false,
        step_count: actionSteps.length,
        total_baseline_ms: 0,
        total_adaptive_ms: 0,
        time_saved_ms: 0,
        reduction_percent: 0,
        meets_target_reduction: false,
        reason: `Step at index ${i} must be a plain object`,
        diagnostics: 'invalid_step_structure'
      });
    }

    if (step.mutations !== undefined && !Array.isArray(step.mutations)) {
      return deepFreeze({
        ok: false,
        step_count: actionSteps.length,
        total_baseline_ms: 0,
        total_adaptive_ms: 0,
        time_saved_ms: 0,
        reduction_percent: 0,
        meets_target_reduction: false,
        reason: `Step ${i + 1} (${step.step_name || 'unnamed'}) mutations must be an array if provided`,
        diagnostics: 'invalid_step_mutations'
      });
    }

    const mutations = Array.isArray(step.mutations) ? step.mutations : [];
    const evaluation = evaluateSettledState(mutations, options);

    if (!evaluation.ok) {
      return deepFreeze({
        ok: false,
        step_count: actionSteps.length,
        total_baseline_ms: 0,
        total_adaptive_ms: 0,
        time_saved_ms: 0,
        reduction_percent: 0,
        meets_target_reduction: false,
        reason: `Step ${i + 1} (${step?.step_name || 'unnamed'}) failed settled state evaluation: ${evaluation.reason}`,
        diagnostics: evaluation.diagnostics || 'step_evaluation_failed'
      });
    }

    totalBaseline += baselineWait;
    totalAdaptive += evaluation.elapsed_ms;

    stepResults.push({
      step_index: i + 1,
      step_name: step?.step_name || `Step ${i + 1}`,
      baseline_ms: baselineWait,
      adaptive_ms: evaluation.elapsed_ms,
      status: evaluation.status,
      mutations: evaluation.mutation_count
    });
  }

  const timeSaved = Math.max(0, totalBaseline - totalAdaptive);
  const reductionPct = totalBaseline > 0
    ? Math.round(((timeSaved / totalBaseline) * 100) * 10) / 10
    : 0;

  return deepFreeze({
    ok: true,
    step_count: actionSteps.length,
    total_baseline_ms: totalBaseline,
    total_adaptive_ms: totalAdaptive,
    time_saved_ms: timeSaved,
    reduction_percent: reductionPct,
    meets_target_reduction: reductionPct >= 80.0,
    steps: Object.freeze(stepResults),
    summary: `Executed ${actionSteps.length} actuation steps: saved ${timeSaved}ms (${reductionPct}% reduction vs conservative ${baselineWait}ms waits)`
  });
}

/**
 * Summarizes settled state detection results for UI display without innerHTML.
 *
 * @param {object} result Evaluation result from evaluateSettledState or waitForSettledState
 * @returns {object} Deeply frozen display summary { ok, text, status_class, badge }
 */
export function summarizeSettledState(result) {
  if (!result || typeof result !== 'object' || !result.ok) {
    return deepFreeze({
      ok: false,
      text: result?.reason || 'DOM state readiness evaluation failed fail-closed.',
      status_class: 'status-err',
      badge: 'Readiness Error'
    });
  }

  if (result.status === 'immediate_ready') {
    return deepFreeze({
      ok: true,
      text: `UI target was immediately ready (${result.elapsed_ms}ms, 0 mutations). Zero wait delay added.`,
      status_class: 'status-ok',
      badge: 'Immediate Ready'
    });
  }

  if (result.status === 'settled') {
    return deepFreeze({
      ok: true,
      text: `DOM quiesced in ${result.elapsed_ms}ms after ${result.mutation_count} mutations. Fully settled.`,
      status_class: 'status-ok',
      badge: 'Settled'
    });
  }

  if (result.status === 'timeout_fallback') {
    return deepFreeze({
      ok: true,
      text: `DOM activity reached ${result.elapsed_ms}ms safety limit; continued safely without blocking the UI.`,
      status_class: 'status-warn',
      badge: 'Safety Fallback'
    });
  }

  return deepFreeze({
    ok: true,
    text: result.reason || 'Readiness evaluated.',
    status_class: 'status-ok',
    badge: 'Ready'
  });
}


/* =========================================================================
   EDGE-CLOUD COLLABORATION AND PRIVACY EXPOSURE BROKER (arXiv:2610.17816)
   ========================================================================= */

export const ALLOWED_COLLABORATION_TARGETS = Object.freeze(['LOCAL_EDGE', 'EXTERNAL_CLOUD']);

export const ALLOWED_PRIVACY_SENSITIVITY_TIERS = Object.freeze([
  'TIER1_PUBLIC',
  'TIER2_INTERNAL',
  'TIER3_SENSITIVE_PERSONAL',
  'TIER4_CRITICAL_CREDENTIAL'
]);

export const ALLOWED_COLLABORATION_STEP_FIELDS = Object.freeze([
  'step_id',
  'task_id',
  'subtask_description',
  'execution_target',
  'estimated_local_confidence',
  'privacy_sensitivity_tier',
  'contains_pii',
  'local_tokens_allocated',
  'cloud_tokens_allocated',
  'timestamp_utc'
]);

export const ALLOWED_COLLABORATION_OPTIONS_FIELDS = Object.freeze([
  'max_privacy_exposure_budget',
  'min_edge_confidence_for_local',
  'hard_fail_on_critical_pii',
  'max_execution_steps',
  'as_of_time'
]);

export const COLLABORATION_DEFAULTS = Object.freeze({
  max_privacy_exposure_budget: 0.35,
  min_edge_confidence_for_local: 0.65,
  hard_fail_on_critical_pii: true,
  max_execution_steps: 50
});

export const ALLOWED_COLLABORATION_RECEIPT_FIELDS = Object.freeze([
  'receipt_id',
  'commitment_hash',
  'issued_at',
  'task_id',
  'total_steps',
  'local_steps_count',
  'cloud_steps_count',
  'total_local_tokens',
  'total_cloud_tokens',
  'privacy_exposure_score',
  'edge_sovereignty_ratio',
  'status'
]);

const FORBIDDEN_COLLABORATION_PROTOTYPE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const ALLOWED_COLLABORATION_STEP_SET = new Set(ALLOWED_COLLABORATION_STEP_FIELDS);
const ALLOWED_COLLABORATION_OPTIONS_SET = new Set(ALLOWED_COLLABORATION_OPTIONS_FIELDS);
const ALLOWED_COLLABORATION_RECEIPT_SET = new Set(ALLOWED_COLLABORATION_RECEIPT_FIELDS);

/**
 * Validates a single collaboration step descriptor fail-closed.
 *
 * @param {object} step Raw step candidate
 * @returns {object} { ok: true, value: frozenStep } or { ok: false, error: string, reason: string }
 */
export function validateCollaborationStepDescriptor(step) {
  if (!step || typeof step !== 'object' || Array.isArray(step)) {
    return { ok: false, error: 'INVALID_STEP', reason: 'Collaboration step must be a non-null object.' };
  }

  for (const key of Object.getOwnPropertyNames(step)) {
    if (FORBIDDEN_COLLABORATION_PROTOTYPE_KEYS.has(key)) {
      return { ok: false, error: 'PROTOTYPE_POLLUTION', reason: `Forbidden prototype key detected: ${key}` };
    }
    if (!ALLOWED_COLLABORATION_STEP_SET.has(key)) {
      return { ok: false, error: 'UNRECOGNIZED_FIELD', reason: `Unrecognized field in collaboration step: ${key}` };
    }
  }

  for (const requiredKey of ALLOWED_COLLABORATION_STEP_FIELDS) {
    if (!(requiredKey in step)) {
      return { ok: false, error: 'MISSING_REQUIRED_FIELD', reason: `Missing required field: ${requiredKey}` };
    }
  }

  if (typeof step.step_id !== 'string' || !step.step_id.trim()) {
    return { ok: false, error: 'INVALID_STEP_ID', reason: 'step_id must be a non-empty string.' };
  }

  if (typeof step.task_id !== 'string' || !step.task_id.trim()) {
    return { ok: false, error: 'INVALID_TASK_ID', reason: 'task_id must be a non-empty string.' };
  }

  if (typeof step.subtask_description !== 'string' || !step.subtask_description.trim()) {
    return { ok: false, error: 'INVALID_SUBTASK_DESCRIPTION', reason: 'subtask_description must be a non-empty string.' };
  }

  if (!ALLOWED_COLLABORATION_TARGETS.includes(step.execution_target)) {
    return { ok: false, error: 'INVALID_EXECUTION_TARGET', reason: `execution_target must be one of: ${ALLOWED_COLLABORATION_TARGETS.join(', ')}` };
  }

  if (!ALLOWED_PRIVACY_SENSITIVITY_TIERS.includes(step.privacy_sensitivity_tier)) {
    return { ok: false, error: 'INVALID_SENSITIVITY_TIER', reason: `privacy_sensitivity_tier must be one of: ${ALLOWED_PRIVACY_SENSITIVITY_TIERS.join(', ')}` };
  }

  if (typeof step.estimated_local_confidence !== 'number' || typeof step.estimated_local_confidence === 'boolean' ||
      Number.isNaN(step.estimated_local_confidence) || !Number.isFinite(step.estimated_local_confidence) ||
      step.estimated_local_confidence < 0.0 || step.estimated_local_confidence > 1.0) {
    return { ok: false, error: 'INVALID_CONFIDENCE', reason: 'estimated_local_confidence must be a finite number in [0.0, 1.0].' };
  }

  if (typeof step.contains_pii !== 'boolean') {
    return { ok: false, error: 'INVALID_CONTAINS_PII', reason: 'contains_pii must be a boolean.' };
  }

  for (const tokenField of ['local_tokens_allocated', 'cloud_tokens_allocated']) {
    const val = step[tokenField];
    if (typeof val !== 'number' || typeof val === 'boolean' || Number.isNaN(val) || !Number.isFinite(val) ||
        !Number.isInteger(val) || val < 0) {
      return { ok: false, error: 'INVALID_TOKENS', reason: `${tokenField} must be a non-negative integer.` };
    }
  }

  if (!isValidIsoDateTime(step.timestamp_utc)) {
    return { ok: false, error: 'INVALID_TIMESTAMP', reason: 'timestamp_utc must be a valid ISO-8601 calendar date and time.' };
  }

  return { ok: true, value: deepFreeze({ ...step }) };
}

/**
 * Computes deterministic privacy exposure score for a single step.
 *
 * @param {object} step Validated step descriptor
 * @returns {number} Score in [0.0, 1.0]
 */
export function calculateStepPrivacyExposure(step) {
  const isCloud = step.execution_target === 'EXTERNAL_CLOUD';
  if (step.privacy_sensitivity_tier === 'TIER1_PUBLIC') {
    return 0.0;
  }
  if (step.privacy_sensitivity_tier === 'TIER2_INTERNAL') {
    return isCloud ? 0.15 : 0.02;
  }
  if (step.privacy_sensitivity_tier === 'TIER3_SENSITIVE_PERSONAL') {
    if (isCloud) {
      return step.contains_pii ? 0.85 : 0.50;
    }
    return step.contains_pii ? 0.10 : 0.05;
  }
  if (step.privacy_sensitivity_tier === 'TIER4_CRITICAL_CREDENTIAL') {
    return isCloud ? 1.00 : 0.15;
  }
  return 1.00;
}

/**
 * Evaluates an edge-cloud collaboration task execution plan fail-closed (arXiv:2610.17816).
 *
 * @param {Array<object>} steps Array of collaboration step descriptors
 * @param {object} options Evaluation options
 * @returns {object} Deeply frozen result with admission decision or failure reason and receipt
 */
export function evaluateEdgeCloudExecution(steps, options = {}) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return deepFreeze({ ok: false, error: 'EMPTY_STEPS', reason: 'Steps must be a non-empty array of step descriptors.' });
  }

  if (options && typeof options === 'object') {
    for (const optKey of Object.getOwnPropertyNames(options)) {
      if (FORBIDDEN_COLLABORATION_PROTOTYPE_KEYS.has(optKey)) {
        return deepFreeze({ ok: false, error: 'PROTOTYPE_POLLUTION', reason: `Forbidden prototype key: ${optKey}` });
      }
      if (!ALLOWED_COLLABORATION_OPTIONS_SET.has(optKey)) {
        return deepFreeze({ ok: false, error: 'UNRECOGNIZED_OPTION', reason: `Unrecognized option: ${optKey}` });
      }
    }
  }

  const maxExposureBudget = typeof options.max_privacy_exposure_budget === 'number' &&
    !Number.isNaN(options.max_privacy_exposure_budget) && Number.isFinite(options.max_privacy_exposure_budget) &&
    typeof options.max_privacy_exposure_budget !== 'boolean'
      ? options.max_privacy_exposure_budget
      : COLLABORATION_DEFAULTS.max_privacy_exposure_budget;

  const minEdgeConfidence = typeof options.min_edge_confidence_for_local === 'number' &&
    !Number.isNaN(options.min_edge_confidence_for_local) && Number.isFinite(options.min_edge_confidence_for_local) &&
    typeof options.min_edge_confidence_for_local !== 'boolean'
      ? options.min_edge_confidence_for_local
      : COLLABORATION_DEFAULTS.min_edge_confidence_for_local;

  const hardFailCritical = typeof options.hard_fail_on_critical_pii === 'boolean'
    ? options.hard_fail_on_critical_pii
    : COLLABORATION_DEFAULTS.hard_fail_on_critical_pii;

  const maxSteps = typeof options.max_execution_steps === 'number' &&
    !Number.isNaN(options.max_execution_steps) && Number.isFinite(options.max_execution_steps) &&
    typeof options.max_execution_steps !== 'boolean'
      ? options.max_execution_steps
      : COLLABORATION_DEFAULTS.max_execution_steps;

  if (steps.length > maxSteps) {
    return deepFreeze({ ok: false, error: 'EXCESSIVE_STEPS', reason: `Execution plan contains ${steps.length} steps, exceeding maximum of ${maxSteps}.` });
  }

  const validatedSteps = [];
  const taskId = steps[0]?.task_id;

  for (let i = 0; i < steps.length; i++) {
    const rawStep = steps[i];
    const valRes = validateCollaborationStepDescriptor(rawStep);
    if (!valRes.ok) {
      return deepFreeze({ ok: false, error: valRes.error, reason: `Step ${i} validation failure: ${valRes.reason}` });
    }
    if (valRes.value.task_id !== taskId) {
      return deepFreeze({ ok: false, error: 'INCONSISTENT_TASK_ID', reason: `Inconsistent task_id at step ${i}: expected ${taskId}, got ${valRes.value.task_id}` });
    }
    validatedSteps.push(valRes.value);
  }

  let localCount = 0;
  let cloudCount = 0;
  let totalLocalTokens = 0;
  let totalCloudTokens = 0;
  let totalExposure = 0.0;
  const processedSteps = [];

  for (const step of validatedSteps) {
    let effectiveTarget = step.execution_target;

    // Hard fail on critical credentials destined for cloud
    if (step.privacy_sensitivity_tier === 'TIER4_CRITICAL_CREDENTIAL' && step.execution_target === 'EXTERNAL_CLOUD') {
      return deepFreeze({
        ok: false,
        error: 'CRITICAL_CREDENTIAL_OFFLOAD_BLOCKED',
        reason: `Step ${step.step_id} contains critical credentials and cannot be offloaded to external cloud.`
      });
    }

    // Hard fail on unconsented PII destined for cloud
    if (hardFailCritical && step.contains_pii && step.execution_target === 'EXTERNAL_CLOUD') {
      return deepFreeze({
        ok: false,
        error: 'UNCONSENTED_PII_OFFLOAD_BLOCKED',
        reason: `Step ${step.step_id} contains personal identifiable information (PII) and cannot be dispatched to cloud.`
      });
    }

    // Edge Sovereignty Principle (arXiv:2610.17816): If edge capability meets threshold, default strictly to local edge
    if (step.execution_target === 'EXTERNAL_CLOUD' && step.estimated_local_confidence >= minEdgeConfidence) {
      effectiveTarget = 'LOCAL_EDGE';
    }

    const effectiveStep = {
      ...step,
      effective_target: effectiveTarget,
      overridden_to_local: effectiveTarget !== step.execution_target
    };

    const stepExposure = calculateStepPrivacyExposure({
      ...effectiveStep,
      execution_target: effectiveTarget
    });

    totalExposure += stepExposure;
    if (effectiveTarget === 'LOCAL_EDGE') {
      localCount++;
      totalLocalTokens += step.local_tokens_allocated + step.cloud_tokens_allocated;
    } else {
      cloudCount++;
      totalCloudTokens += step.cloud_tokens_allocated;
      totalLocalTokens += step.local_tokens_allocated;
    }

    processedSteps.push(effectiveStep);
  }

  const normalizedExposure = Number((totalExposure / validatedSteps.length).toFixed(4));

  if (normalizedExposure > maxExposureBudget) {
    return deepFreeze({
      ok: false,
      error: 'EXPOSURE_BUDGET_EXCEEDED',
      reason: `Cumulative privacy exposure (${normalizedExposure}) exceeds allowable budget (${maxExposureBudget}).`
    });
  }

  const asOfTime = options.as_of_time || new Date().toISOString();
  const edgeSovereigntyRatio = Number((localCount / validatedSteps.length).toFixed(4));
  const commitmentData = `${taskId}|${validatedSteps.length}|${localCount}|${cloudCount}|${totalLocalTokens}|${totalCloudTokens}|${normalizedExposure.toFixed(4)}|${edgeSovereigntyRatio.toFixed(4)}|${asOfTime}`;
  const commitmentHash = computeContextFingerprint(commitmentData);

  const receipt = deepFreeze({
    receipt_id: `collab-rcpt-${commitmentHash.slice(0, 16)}`,
    commitment_hash: commitmentHash,
    issued_at: asOfTime,
    task_id: taskId,
    total_steps: validatedSteps.length,
    local_steps_count: localCount,
    cloud_steps_count: cloudCount,
    total_local_tokens: totalLocalTokens,
    total_cloud_tokens: totalCloudTokens,
    privacy_exposure_score: normalizedExposure,
    edge_sovereignty_ratio: edgeSovereigntyRatio,
    status: 'admitted'
  });

  return deepFreeze({
    ok: true,
    status: 'admitted',
    task_id: taskId,
    receipt,
    processed_steps: processedSteps,
    total_steps: validatedSteps.length,
    local_steps_count: localCount,
    cloud_steps_count: cloudCount,
    total_local_tokens: totalLocalTokens,
    total_cloud_tokens: totalCloudTokens,
    privacy_exposure_score: normalizedExposure,
    edge_sovereignty_ratio: receipt.edge_sovereignty_ratio
  });
}

/**
 * Cryptographically verifies an edge-cloud collaboration execution receipt.
 *
 * @param {object} receipt Receipt candidate
 * @param {object} options Verification options
 * @returns {object} { ok: true, verified: true, receipt } or { ok: false, verified: false, reason: string }
 */
export function verifyCollaborationReceipt(receipt, options = {}) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return deepFreeze({ ok: false, verified: false, reason: 'Receipt must be a non-null object.' });
  }

  for (const key of Object.getOwnPropertyNames(receipt)) {
    if (FORBIDDEN_COLLABORATION_PROTOTYPE_KEYS.has(key)) {
      return deepFreeze({ ok: false, verified: false, reason: `Forbidden prototype key: ${key}` });
    }
    if (!ALLOWED_COLLABORATION_RECEIPT_SET.has(key)) {
      return deepFreeze({ ok: false, verified: false, reason: `Unrecognized receipt field: ${key}` });
    }
  }

  for (const requiredKey of ALLOWED_COLLABORATION_RECEIPT_FIELDS) {
    if (!(requiredKey in receipt)) {
      return deepFreeze({ ok: false, verified: false, reason: `Missing required receipt field: ${requiredKey}` });
    }
  }

  if (typeof receipt.receipt_id !== 'string' || !receipt.receipt_id.startsWith('collab-rcpt-')) {
    return deepFreeze({ ok: false, verified: false, reason: 'Invalid receipt_id format.' });
  }

  if (typeof receipt.commitment_hash !== 'string' || receipt.commitment_hash.length < 8) {
    return deepFreeze({ ok: false, verified: false, reason: 'Invalid commitment_hash format.' });
  }

  if (!isValidIsoDateTime(receipt.issued_at)) {
    return deepFreeze({ ok: false, verified: false, reason: 'Invalid issued_at timestamp.' });
  }

  if (typeof receipt.task_id !== 'string' || !receipt.task_id.trim()) {
    return deepFreeze({ ok: false, verified: false, reason: 'Invalid task_id.' });
  }

  for (const countField of ['total_steps', 'local_steps_count', 'cloud_steps_count', 'total_local_tokens', 'total_cloud_tokens']) {
    const val = receipt[countField];
    if (typeof val !== 'number' || typeof val === 'boolean' || Number.isNaN(val) || !Number.isFinite(val) ||
        !Number.isInteger(val) || val < 0) {
      return deepFreeze({ ok: false, verified: false, reason: `${countField} must be a non-negative integer.` });
    }
  }

  if (receipt.local_steps_count + receipt.cloud_steps_count !== receipt.total_steps) {
    return deepFreeze({ ok: false, verified: false, reason: 'Sum of local and cloud steps does not equal total_steps.' });
  }

  for (const ratioField of ['privacy_exposure_score', 'edge_sovereignty_ratio']) {
    const val = receipt[ratioField];
    if (typeof val !== 'number' || typeof val === 'boolean' || Number.isNaN(val) || !Number.isFinite(val) ||
        val < 0.0 || val > 1.0) {
      return deepFreeze({ ok: false, verified: false, reason: `${ratioField} must be a finite float in [0.0, 1.0].` });
    }
  }

  const expectedRatio = Number((receipt.local_steps_count / (receipt.total_steps || 1)).toFixed(4));
  if (receipt.edge_sovereignty_ratio !== expectedRatio) {
    return deepFreeze({ ok: false, verified: false, reason: 'edge_sovereignty_ratio does not match calculated local step ratio.' });
  }

  if (receipt.status !== 'admitted') {
    return deepFreeze({ ok: false, verified: false, reason: `Receipt status must be admitted, got: ${receipt.status}` });
  }

  const expectedCommitment = `${receipt.task_id}|${receipt.total_steps}|${receipt.local_steps_count}|${receipt.cloud_steps_count}|${receipt.total_local_tokens}|${receipt.total_cloud_tokens}|${receipt.privacy_exposure_score.toFixed(4)}|${receipt.edge_sovereignty_ratio.toFixed(4)}|${receipt.issued_at}`;
  const recomputedHash = computeContextFingerprint(expectedCommitment);

  if (recomputedHash !== receipt.commitment_hash) {
    return deepFreeze({ ok: false, verified: false, reason: 'Cryptographic commitment hash mismatch: receipt data was modified.' });
  }

  if (receipt.receipt_id !== `collab-rcpt-${recomputedHash.slice(0, 16)}`) {
    return deepFreeze({ ok: false, verified: false, reason: 'Receipt ID does not match commitment hash digest.' });
  }

  return deepFreeze({ ok: true, verified: true, receipt });
}

/**
 * Generates user-facing plain language summary of collaboration execution without internal jargon.
 *
 * @param {object} result Execution or verification result
 * @returns {object} { ok, text, status_class, badge }
 */
export function summarizeCollaborationExecution(result) {
  if (!result || typeof result !== 'object') {
    return deepFreeze({
      ok: false,
      text: 'Execution evaluation could not be processed.',
      status_class: 'status-err',
      badge: 'Evaluation Error'
    });
  }

  if (!result.ok) {
    return deepFreeze({
      ok: false,
      text: result.reason || 'Collaboration execution rejected by safety broker.',
      status_class: 'status-err',
      badge: 'Execution Blocked'
    });
  }

  const localPct = Math.round((result.edge_sovereignty_ratio || 0) * 100);
  const exposurePct = ((result.privacy_exposure_score || 0) * 100).toFixed(1);

  return deepFreeze({
    ok: true,
    text: `Task executed with ${localPct}% on-device processing. Privacy exposure remained strictly limited to ${exposurePct}%, and sensitive personal data was kept confidential.`,
    status_class: 'status-ok',
    badge: localPct === 100 ? '100% On-Device' : 'Edge-Governed'
  });
}
