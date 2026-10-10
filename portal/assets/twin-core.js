// Pure core logic for twin state management and validation.
export const DEFAULT_TWIN_STATE = Object.freeze({
  topics: Object.freeze([]),
  grants: Object.freeze([])
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
  if (keys.some((k) => k !== 'topics' && k !== 'grants')) {
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
  return { ok: true, value: { topics: cleanTopics, grants: cleanGrants } };
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
