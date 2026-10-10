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
