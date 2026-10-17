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

const CURRENCY_RE = /^[A-Z]{3}$/;

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
  if (typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || isNaN(Date.parse(entry.date))) {
    return `Entry at index ${index} has invalid date (must be YYYY-MM-DD)`;
  }
  if (!Number.isInteger(entry.amount_cents) || !Number.isFinite(entry.amount_cents)) {
    return `Entry at index ${index} amount_cents must be an integer, not float, NaN, or Infinity`;
  }
  if (typeof entry.currency !== 'string' || !CURRENCY_RE.test(entry.currency)) {
    return `Entry at index ${index} must have a 3-letter uppercase ISO currency code`;
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

  if (typeof query.currency !== 'string' || !CURRENCY_RE.test(query.currency)) {
    return Object.freeze({
      ok: false,
      error: 'missing_or_invalid_currency',
      reason: 'Query must specify a 3-letter uppercase ISO currency',
      matching_count: 0,
      total_cents: 0
    });
  }

  if (query.start_date !== undefined) {
    if (typeof query.start_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(query.start_date) || isNaN(Date.parse(query.start_date))) {
      return Object.freeze({
        ok: false,
        error: 'invalid_start_date',
        reason: 'start_date must be a valid YYYY-MM-DD date string',
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  if (query.end_date !== undefined) {
    if (typeof query.end_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(query.end_date) || isNaN(Date.parse(query.end_date))) {
      return Object.freeze({
        ok: false,
        error: 'invalid_end_date',
        reason: 'end_date must be a valid YYYY-MM-DD date string',
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
    if (!Number.isInteger(query.expected_amount_cents) || !Number.isFinite(query.expected_amount_cents)) {
      return Object.freeze({
        ok: false,
        error: 'invalid_expected_amount',
        reason: 'expected_amount_cents must be an integer',
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  // Validate all entries fail-closed
  for (let i = 0; i < ledger.length; i++) {
    const err = validateLedgerEntry(ledger[i], i);
    if (err) {
      return Object.freeze({
        ok: false,
        error: 'malformed_ledger_entry',
        reason: err,
        matching_count: 0,
        total_cents: 0
      });
    }
  }

  // Filter matching records
  const matched = [];
  const breakdownMap = Object.create(null);
  let totalCents = 0;
  let debitCents = 0;
  let creditCents = 0;

  for (const entry of ledger) {
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
    totalCents += entry.amount_cents;
    if (entry.kind === 'debit') {
      debitCents += entry.amount_cents;
    } else {
      creditCents += entry.amount_cents;
    }

    const catKey = (entry.category || 'uncategorized').trim().toLowerCase();
    if (!breakdownMap[catKey]) {
      breakdownMap[catKey] = { count: 0, total_cents: 0 };
    }
    breakdownMap[catKey].count += 1;
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
      if (!Number.isInteger(options.tolerance_cents) || options.tolerance_cents < 0) {
        return Object.freeze({
          ok: false,
          status: 'error',
          sure: false,
          reason: 'tolerance_cents must be a non-negative integer'
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

  // Compare semantic query boundaries
  const compareFields = ['operation', 'currency', 'start_date', 'end_date', 'category', 'merchant', 'kind'];
  for (const f of compareFields) {
    if (primary[f] !== undefined || checker[f] !== undefined) {
      if (String(primary[f] || '').trim().toLowerCase() !== String(checker[f] || '').trim().toLowerCase()) {
        return Object.freeze({
          ok: true,
          status: 'disagreement',
          sure: false,
          field: f,
          primary_value: primary[f] || null,
          checker_value: checker[f] || null,
          reason: `Readings disagree on ${f}: "${primary[f]}" vs "${checker[f]}"`
        });
      }
    }
  }

  // Check calculation symmetry: if one supplies total_cents, both must supply it
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

  // If calculation was supplied, assert integer validity and bounds
  if (primaryHasTotal) {
    if (!Number.isInteger(primary.total_cents) || !Number.isInteger(checker.total_cents)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: 'total_cents must be an integer in both readings'
      });
    }

    const diff = Math.abs(primary.total_cents - checker.total_cents);
    const tol = options && Number.isInteger(options.tolerance_cents) ? options.tolerance_cents : 0;
    if (diff > tol) {
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
    if (!Number.isInteger(primary.matching_count) || !Number.isInteger(checker.matching_count)) {
      return Object.freeze({
        ok: false,
        status: 'error',
        sure: false,
        reason: 'matching_count must be an integer in both readings'
      });
    }
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

  const verifiedCents = primaryHasTotal ? primary.total_cents : null;

  return Object.freeze({
    ok: true,
    status: 'agreement',
    sure: true,
    verified_cents: verifiedCents,
    currency: primary.currency,
    matching_count: primaryHasCount ? primary.matching_count : null,
    reason: 'Both readings agree on query parameters and calculations'
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



