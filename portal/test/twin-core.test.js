import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_CONTRIBUTION_KINDS,
  ALLOWED_ACTION_STATUSES,
  ALLOWED_EVENT_TYPES,
  ALLOWED_OBLIGATION_CATEGORIES,
  ALLOWED_OBLIGATION_STATUSES,
  ALLOWED_FACT_CATEGORIES,
  ALLOWED_QUEST_CATEGORIES,
  ALLOWED_VALUE_DIMENSIONS,
  DEFAULT_VALUES,
  DEFAULT_TWIN_STATE,
  validateTwinState,
  deserializeTwinState,
  serializeTwinState,
  evaluateAccessRequest,
  createConsentReceipt,
  isGrantExpired,
  extractWords,
  scoreSignalRelevance,
  calculatePersonalTrajectory,
  summarizeContributions,
  evaluateActionDecision,
  summarizeActions,
  recordTwinEvent,
  summarizeEvents,
  queueAccessAsPendingAction,
  calculateObligationUrgency,
  summarizeObligations,
  summarizeFacts,
  filterCriticalFacts,
  toggleQuestCompletion,
  summarizeQuests,
  filterActiveQuests,
  updateValuePreference,
  calculateValueAlignment,
  summarizeValues,
  SPECULATIVE_MARKERS,
  auditMemoryStatement,
  gateMemoryFact,
  summarizeMemoryAudit
} from '../assets/twin-core.js';

test('DEFAULT_TWIN_STATE is deeply frozen and valid', () => {
  const res = validateTwinState(DEFAULT_TWIN_STATE);
  assert.equal(res.ok, true);
  assert.throws(() => { DEFAULT_TWIN_STATE.topics.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.grants.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.contributions.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.actions.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.events.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.obligations.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.facts.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.quests.push('x'); });
});

test('validateTwinState accepts well-formed data and is deterministic', () => {
  const input = {
    topics: ['privacy', 'local AI'],
    grants: [{ who: 'calendar', what: 'times', at: '2026-10-10T09:00:00.000Z', expires_at: '2026-11-10T09:00:00.000Z' }]
  };
  const r1 = validateTwinState(input);
  const r2 = validateTwinState(input);
  assert.equal(r1.ok, true);
  assert.deepEqual(r1, r2);
  assert.equal(r1.value.topics.length, 2);
  assert.equal(r1.value.grants[0].who, 'calendar');
  assert.equal(r1.value.grants[0].expires_at, '2026-11-10T09:00:00.000Z');
});

test('validateTwinState accepts null or omitted expires_at', () => {
  const r1 = validateTwinState({
    topics: [],
    grants: [{ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z' }]
  });
  assert.equal(r1.ok, true);
  assert.equal(r1.value.grants[0].expires_at, null);

  const r2 = validateTwinState({
    topics: [],
    grants: [{ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z', expires_at: null }]
  });
  assert.equal(r2.ok, true);
  assert.equal(r2.value.grants[0].expires_at, null);
});

test('validateTwinState rejects invalid expires_at', () => {
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z', expires_at: 123 }] }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z', expires_at: 'not-a-date' }] }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z', expires_at: '2026-99-99T99:99:99Z' }] }).ok, false);
});

test('validateTwinState rejects non-objects and unknown top-level keys', () => {
  assert.equal(validateTwinState(null).ok, false);
  assert.equal(validateTwinState([]).ok, false);
  assert.equal(validateTwinState('bad').ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [], extra: 1 }).ok, false);
});

test('validateTwinState enforces topic bounds and types', () => {
  assert.equal(validateTwinState({ topics: 'bad', grants: [] }).ok, false);
  assert.equal(validateTwinState({ topics: [123], grants: [] }).ok, false);
  assert.equal(validateTwinState({ topics: [' '], grants: [] }).ok, false);
  assert.equal(validateTwinState({ topics: ['a'.repeat(61)], grants: [] }).ok, false);
  const tooMany = Array.from({ length: 21 }, (_, i) => `t${i}`);
  assert.equal(validateTwinState({ topics: tooMany, grants: [] }).ok, false);
});

test('validateTwinState enforces grant structure and ISO date format', () => {
  assert.equal(validateTwinState({ topics: [], grants: 'bad' }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: 'b' }] }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: 'b', at: '2026' }] }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: 'b', at: '10/10/2026' }] }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: '', what: 'b', at: '2026-10-10T12:00:00Z' }] }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: '', at: '2026-10-10T12:00:00Z' }] }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [{ who: 'a', what: 'b', at: '2026-10-10T12:00:00Z', x: 1 }] }).ok, false);
});

test('deserialize and serialize handle valid data and errors', () => {
  const json = JSON.stringify({ topics: ['health'], grants: [], contributions: [{ what: 'code test', kind: 'code', at: '2026-10-10T12:00:00.000Z', impact: null }] });
  const parsed = deserializeTwinState(json);
  assert.equal(parsed.ok, true);
  assert.deepEqual(JSON.parse(serializeTwinState(parsed.value)), {
    topics: ['health'],
    grants: [],
    contributions: [{ what: 'code test', kind: 'code', at: '2026-10-10T12:00:00.000Z', impact: null }],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: {
      commons: 3,
      containment: 3,
      ecology: 3,
      learning: 3,
      resilience: 3,
      wellbeing: 3
    }
  });
  // Backward compatibility when contributions, actions, events, obligations, facts, quests, and values omitted
  const legacy = deserializeTwinState(JSON.stringify({ topics: ['health'], grants: [] }));
  assert.equal(legacy.ok, true);
  assert.deepEqual(legacy.value.contributions, []);
  assert.deepEqual(legacy.value.actions, []);
  assert.deepEqual(legacy.value.events, []);
  assert.deepEqual(legacy.value.obligations, []);
  assert.deepEqual(legacy.value.facts, []);
  assert.deepEqual(legacy.value.quests, []);
  assert.deepEqual(legacy.value.values, DEFAULT_VALUES);

  assert.equal(deserializeTwinState('{bad').ok, false);
  assert.throws(() => serializeTwinState({ bad: 1 }));
});

test('isGrantExpired correctly evaluates temporal status and boundary conditions', () => {
  const gIndefinite = { who: 'a', what: 'b', at: '2026-10-10T10:00:00.000Z', expires_at: null };
  assert.equal(isGrantExpired(gIndefinite), false);
  assert.equal(isGrantExpired(null), false);

  const gExpiring = { who: 'a', what: 'b', at: '2026-10-10T10:00:00.000Z', expires_at: '2026-10-10T12:00:00.000Z' };
  assert.equal(isGrantExpired(gExpiring, '2026-10-10T11:59:59.999Z'), false);
  // Boundary: exact second of expiration counts as expired
  assert.equal(isGrantExpired(gExpiring, '2026-10-10T12:00:00.000Z'), true);
  assert.equal(isGrantExpired(gExpiring, '2026-10-10T12:00:01.000Z'), true);

  // Throws on malformed asOfTime
  assert.throws(() => isGrantExpired(gExpiring, 'invalid-date'));
  assert.throws(() => isGrantExpired(gExpiring, {}));
});

test('evaluateAccessRequest enforces temporal validity and fail-closed expiration', () => {
  const state = {
    topics: ['research'],
    grants: [
      { who: 'dentist', what: 'appointment times', at: '2026-10-10T10:00:00.000Z', expires_at: '2026-10-10T12:00:00.000Z' },
      { who: 'library', what: 'reading history, holds', at: '2026-10-10T10:05:00.000Z', expires_at: null },
      { who: 'backup-agent', what: '*', at: '2026-10-10T10:10:00.000Z', expires_at: '2026-10-10T11:00:00.000Z' }
    ]
  };

  // Before expiration -> allowed
  const r1 = evaluateAccessRequest(state, 'dentist', 'appointment times', '2026-10-10T11:30:00.000Z');
  assert.equal(r1.allowed, true);
  assert.equal(r1.grant.who, 'dentist');

  // After expiration -> refused
  const r2 = evaluateAccessRequest(state, 'dentist', 'appointment times', '2026-10-10T12:01:00.000Z');
  assert.equal(r2.allowed, false);
  assert.equal(r2.reason, 'Grant has expired');

  // Indefinite grant stays valid
  const r3 = evaluateAccessRequest(state, 'library', 'holds', '2026-12-31T23:59:59.000Z');
  assert.equal(r3.allowed, true);

  // Wildcard expired -> refused
  const r4 = evaluateAccessRequest(state, 'backup-agent', 'anything', '2026-10-10T11:05:00.000Z');
  assert.equal(r4.allowed, false);
  assert.equal(r4.reason, 'Grant has expired');
});

test('evaluateAccessRequest allows fallback to active grant when duplicate exists', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'service-a', what: 'data', at: '2026-01-01T00:00:00.000Z', expires_at: '2026-02-01T00:00:00.000Z' },
      { who: 'service-a', what: 'data', at: '2026-03-01T00:00:00.000Z', expires_at: '2026-12-01T00:00:00.000Z' }
    ]
  };
  const res = evaluateAccessRequest(state, 'service-a', 'data', '2026-06-01T00:00:00.000Z');
  assert.equal(res.allowed, true);
  assert.equal(res.grant.at, '2026-03-01T00:00:00.000Z');
});

test('evaluateAccessRequest fails closed on unauthorized, empty, or malformed queries', () => {
  const state = {
    topics: [],
    grants: [{ who: 'dentist', what: 'appointment times', at: '2026-10-10T10:00:00.000Z', expires_at: null }]
  };
  assert.equal(evaluateAccessRequest(state, 'unknown', 'appointment times').allowed, false);
  assert.equal(evaluateAccessRequest(state, 'dentist', 'billing details').allowed, false);
  assert.equal(evaluateAccessRequest({ topics: [], grants: [] }, 'dentist', 'appointment times').allowed, false);
  assert.equal(evaluateAccessRequest(null, 'dentist', 'times').allowed, false);
  assert.equal(evaluateAccessRequest(state, '', 'times').allowed, false);
  assert.equal(evaluateAccessRequest(state, '   ', 'times').allowed, false);
  assert.equal(evaluateAccessRequest(state, 123, 'times').allowed, false);
  assert.equal(evaluateAccessRequest(state, 'dentist', '').allowed, false);
  assert.equal(evaluateAccessRequest(state, 'dentist', '   ').allowed, false);
  assert.equal(evaluateAccessRequest(state, 'dentist', null).allowed, false);
  assert.equal(evaluateAccessRequest(state, 'a'.repeat(61), 'times').allowed, false);
  assert.equal(evaluateAccessRequest(state, 'dentist', 'a'.repeat(81)).allowed, false);
  assert.equal(evaluateAccessRequest({ topics: [], grants: [], extra: 1 }, 'dentist', 'times').allowed, false);
  assert.equal(evaluateAccessRequest(state, 'dentist', 'times', 'invalid-date').allowed, false);
  assert.equal(evaluateAccessRequest(state, 'dentist', 'times', {}).allowed, false);
});

test('createConsentReceipt produces valid ISO-27560 compatible structured receipts with expires_at', () => {
  const grant = {
    who: 'calendar-sync',
    what: 'busy status, time slots',
    at: '2026-10-10T12:00:00.000Z',
    expires_at: '2026-11-10T12:00:00.000Z'
  };
  const receipt = createConsentReceipt(grant, 'local-user');

  assert.equal(receipt.receipt_version, 'ISO-27560:2023-compatible');
  assert.equal(receipt.subject, 'local-user');
  assert.equal(receipt.recipient, 'calendar-sync');
  assert.deepEqual(receipt.purposes_and_scopes, ['busy status', 'time slots']);
  assert.equal(receipt.timestamp, '2026-10-10T12:00:00.000Z');
  assert.equal(receipt.expires_at, '2026-11-10T12:00:00.000Z');
  assert.equal(receipt.status, 'granted');

  // Input validation
  assert.throws(() => createConsentReceipt(null));
  assert.throws(() => createConsentReceipt({ who: '', what: 'all', at: '2026-10-10T12:00:00.000Z' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: '', at: '2026-10-10T12:00:00.000Z' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: 'b', at: 'invalid-date' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z', extra: 1 }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z', expires_at: 'bad' }));
  assert.throws(() => createConsentReceipt({ who: 'a'.repeat(61), what: 'b', at: '2026-10-10T12:00:00.000Z' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: 'b'.repeat(81), at: '2026-10-10T12:00:00.000Z' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: '  ,  ,  ', at: '2026-10-10T12:00:00.000Z' }));
  assert.throws(() => createConsentReceipt(grant, 123));
  assert.throws(() => createConsentReceipt(grant, ''));
  assert.throws(() => createConsentReceipt(grant, '   '));
  assert.throws(() => createConsentReceipt(grant, 's'.repeat(81)));
  const custom = createConsentReceipt(grant, 'custom-id');
  assert.equal(custom.subject, 'custom-id');
});

test('extractWords tokenizes, normalizes, and retains tokens of length >= 2', () => {
  assert.deepEqual(extractWords('Local AI and ML Privacy!'), ['local', 'ai', 'and', 'ml', 'privacy']);
  assert.deepEqual(extractWords(''), []);
  assert.deepEqual(extractWords(null), []);
  assert.deepEqual(extractWords(123), []);
  assert.deepEqual(extractWords('a b c'), []); // single characters dropped
});

test('scoreSignalRelevance evaluates individual signal fail-closed', () => {
  assert.equal(scoreSignalRelevance(null, ['ai']).relevance, 0);
  assert.equal(scoreSignalRelevance({ title: 'AI' }, null).relevance, 0);
  assert.equal(scoreSignalRelevance({ title: 'AI' }, []).relevance, 0);

  const sig = { title: 'Local AI Assistant', summary: 'Runs entirely on device with privacy.' };
  const r1 = scoreSignalRelevance(sig, ['ai', 'privacy']);
  assert.equal(r1.relevance, 2);
  assert.deepEqual(r1.matched_tokens, ['ai', 'privacy']);

  const r2 = scoreSignalRelevance(sig, new Set(['assistant', 'device']));
  assert.equal(r2.relevance, 2);
  assert.deepEqual(r2.matched_tokens, ['assistant', 'device']);
});

test('calculatePersonalTrajectory returns neutral baseline on empty or invalid inputs', () => {
  const emptyRes = calculatePersonalTrajectory([], []);
  assert.equal(emptyRes.total_matching, 0);
  assert.equal(emptyRes.score, 50.0);
  assert.equal(emptyRes.net_balance, 0);
  assert.deepEqual(emptyRes.matching_signals, []);

  const nullRes = calculatePersonalTrajectory(null, null);
  assert.equal(nullRes.total_matching, 0);
  assert.equal(nullRes.score, 50.0);

  const nonArrayRes = calculatePersonalTrajectory(['privacy'], 'not-an-array');
  assert.equal(nonArrayRes.total_matching, 0);
  assert.equal(nonArrayRes.score, 50.0);
});

test('calculatePersonalTrajectory matches topics, counts direction, and weights score correctly', () => {
  const topics = ['privacy', 'local AI'];
  const signals = [
    {
      id: 'S-1',
      title: 'Local AI model runs on device with full privacy',
      summary: 'No cloud communication required.',
      direction: 'toward',
      weight: 2,
      categories: ['person', 'agents', 'person'] // duplicate category to test deduplication
    },
    {
      id: 'S-2',
      title: 'Cloud assistant leaks user privacy data',
      summary: 'Centralized telemetry breach observed.',
      direction: 'away',
      weight: 1,
      categories: ['person']
    },
    {
      id: 'S-3',
      title: 'Autonomous vehicle navigation in urban logistics',
      summary: 'Route optimization under congestion.',
      direction: 'toward',
      weight: 3,
      categories: ['economy']
    }
  ];

  const res = calculatePersonalTrajectory(topics, signals);
  assert.equal(res.total_matching, 2);
  assert.equal(res.toward_count, 1);
  assert.equal(res.away_count, 1);
  assert.equal(res.neutral_count, 0);
  assert.equal(res.weighted_toward, 2);
  assert.equal(res.weighted_away, 1);
  assert.equal(res.net_balance, 1); // 2 - 1 = +1
  assert.equal(res.score, 66.7);
  // Deduplicated person category count: 1 from S-1 + 1 from S-2 = 2
  assert.deepEqual(res.category_counts, { person: 2, agents: 1 });
  assert.deepEqual(res.topics_matched, ['ai', 'local', 'privacy']);

  // Most relevant signal first (S-1 has more matched word hits)
  assert.equal(res.matching_signals[0].id, 'S-1');
  assert.equal(res.matching_signals[0].summary, 'No cloud communication required.');
  assert.equal(res.matching_signals[1].id, 'S-2');
  assert.equal(res.matching_signals[1].summary, 'Centralized telemetry breach observed.');

  // Verify deep freeze
  assert.throws(() => { res.matching_signals[0].categories.push('hacked'); });
  assert.throws(() => { res.matching_signals.push({}); });
});

test('calculatePersonalTrajectory stably sorts identical relevance and weight', () => {
  const topics = ['privacy'];
  const signals = [
    { id: 'S-B', title: 'Beta privacy note', direction: 'toward', weight: 1 },
    { id: 'S-A', title: 'Alpha privacy note', direction: 'toward', weight: 1 }
  ];
  const res = calculatePersonalTrajectory(topics, signals);
  assert.equal(res.matching_signals[0].id, 'S-A');
  assert.equal(res.matching_signals[1].id, 'S-B');
});

test('calculatePersonalTrajectory safely ignores malformed signal items', () => {
  const topics = ['privacy'];
  const signals = [
    null,
    123,
    'invalid',
    [],
    { title: 'Privacy safe', summary: 'Good', direction: 'toward', weight: 2 }
  ];
  const res = calculatePersonalTrajectory(topics, signals);
  assert.equal(res.total_matching, 1);
  assert.equal(res.score, 100.0); // 100% toward
});

test('calculatePersonalTrajectory evaluates pure away balance at 0.0', () => {
  const topics = ['security'];
  const signals = [
    { title: 'Security vulnerability found', summary: 'Critical exploit', direction: 'away', weight: 3 }
  ];
  const res = calculatePersonalTrajectory(topics, signals);
  assert.equal(res.total_matching, 1);
  assert.equal(res.away_count, 1);
  assert.equal(res.score, 0.0);
  assert.equal(res.net_balance, -3);
});

test('validateTwinState accepts well-formed contributions and enforces backward compatibility', () => {
  const legacyState = { topics: ['privacy'], grants: [] };
  const resLegacy = validateTwinState(legacyState);
  assert.equal(resLegacy.ok, true);
  assert.deepEqual(resLegacy.value.contributions, []);

  const stateWithContribs = {
    topics: ['code'],
    grants: [],
    contributions: [
      { what: 'Built local test fixture', kind: 'code', at: '2026-10-10T12:00:00.000Z', impact: 'deterministic test suite' },
      { what: 'Reviewed peer draft', kind: 'review', at: '2026-10-10T13:00:00.000Z', impact: null }
    ]
  };
  const res = validateTwinState(stateWithContribs);
  assert.equal(res.ok, true);
  assert.equal(res.value.contributions.length, 2);
  assert.equal(res.value.contributions[0].kind, 'code');
  assert.equal(res.value.contributions[1].impact, null);
});

test('validateTwinState rejects malformed contributions fail-closed', () => {
  const base = { topics: [], grants: [] };

  // Unknown top-level key
  assert.equal(validateTwinState({ ...base, extra: 'bad' }).ok, false);

  // Non-array contributions
  assert.equal(validateTwinState({ ...base, contributions: 'invalid' }).ok, false);

  // Exceeds max count of 50
  const excess = Array.from({ length: 51 }, (_, i) => ({
    what: `Contrib ${i}`, kind: 'code', at: '2026-10-10T12:00:00.000Z'
  }));
  assert.equal(validateTwinState({ ...base, contributions: excess }).ok, false);

  // Unknown contribution field
  assert.equal(validateTwinState({
    ...base,
    contributions: [{ what: 'code change', kind: 'code', at: '2026-10-10T12:00:00.000Z', points: 100 }]
  }).ok, false);

  // Empty or invalid 'what'
  assert.equal(validateTwinState({
    ...base,
    contributions: [{ what: '', kind: 'code', at: '2026-10-10T12:00:00.000Z' }]
  }).ok, false);
  assert.equal(validateTwinState({
    ...base,
    contributions: [{ what: 'x'.repeat(101), kind: 'code', at: '2026-10-10T12:00:00.000Z' }]
  }).ok, false);

  // Invalid kind
  assert.equal(validateTwinState({
    ...base,
    contributions: [{ what: 'work', kind: 'unapproved_category', at: '2026-10-10T12:00:00.000Z' }]
  }).ok, false);

  // Invalid date
  assert.equal(validateTwinState({
    ...base,
    contributions: [{ what: 'work', kind: 'code', at: 'not-an-iso-date' }]
  }).ok, false);

  // Impact too long
  assert.equal(validateTwinState({
    ...base,
    contributions: [{ what: 'work', kind: 'code', at: '2026-10-10T12:00:00.000Z', impact: 'x'.repeat(101) }]
  }).ok, false);
});

test('summarizeContributions aggregates metrics and handles empty or invalid inputs fail-closed', () => {
  // Invalid inputs
  assert.deepEqual(summarizeContributions(null), { total: 0, by_kind: {}, recent: [] });
  assert.deepEqual(summarizeContributions('bad'), { total: 0, by_kind: {}, recent: [] });
  assert.deepEqual(summarizeContributions([]), { total: 0, by_kind: {}, recent: [] });

  const items = [
    { what: 'First code patch', kind: 'code', at: '2026-10-08T10:00:00.000Z', impact: 'v1' },
    { what: 'Second code patch', kind: 'code', at: '2026-10-09T10:00:00.000Z', impact: 'v2' },
    { what: 'Review draft', kind: 'review', at: '2026-10-10T09:00:00.000Z' },
    { what: 'Compute node run', kind: 'compute', at: '2026-10-10T11:00:00.000Z' },
    { what: 'Verification check', kind: 'verification', at: '2026-10-10T12:00:00.000Z' },
    { what: 'Community guide', kind: 'community', at: '2026-10-10T13:00:00.000Z' }
  ];

  const summary = summarizeContributions(items);
  assert.equal(summary.total, 6);
  assert.equal(summary.by_kind.code, 2);
  assert.equal(summary.by_kind.review, 1);
  assert.equal(summary.by_kind.compute, 1);
  assert.equal(summary.by_kind.verification, 1);
  assert.equal(summary.by_kind.community, 1);
  assert.equal(summary.recent.length, 5); // Capped at top 5 recent
  assert.equal(summary.recent[0].what, 'Community guide'); // Sorted descending by timestamp
  assert.equal(summary.recent[1].what, 'Verification check');
});

test('validateTwinState accepts well-formed actions and preserves backward compatibility', () => {
  const legacy = { topics: ['code'], grants: [], contributions: [] };
  const resLegacy = validateTwinState(legacy);
  assert.equal(resLegacy.ok, true);
  assert.deepEqual(resLegacy.value.actions, []);

  const withActions = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [
      { id: 'act-1', who: 'calendar-agent', description: 'Schedule meeting', at: '2026-10-10T14:00:00.000Z', status: 'pending', decided_at: null },
      { id: 'act-2', who: 'notes-sync', description: 'Export summary', at: '2026-10-10T14:05:00.000Z', status: 'approved', decided_at: '2026-10-10T14:06:00.000Z' }
    ]
  };
  const res = validateTwinState(withActions);
  assert.equal(res.ok, true);
  assert.equal(res.value.actions.length, 2);
  assert.equal(res.value.actions[0].status, 'pending');
  assert.equal(res.value.actions[1].status, 'approved');
});

test('validateTwinState rejects malformed actions fail-closed', () => {
  const base = { topics: [], grants: [], contributions: [] };

  // Unknown top-level key
  assert.equal(validateTwinState({ ...base, actions: [], bad: 1 }).ok, false);

  // Non-array
  assert.equal(validateTwinState({ ...base, actions: 'bad' }).ok, false);

  // Missing id or non-alphanumeric id
  assert.equal(validateTwinState({ ...base, actions: [{ id: '', who: 'agent', description: 'do work', at: '2026-10-10T12:00:00Z', status: 'pending' }] }).ok, false);
  assert.equal(validateTwinState({ ...base, actions: [{ id: 'bad id spaces', who: 'agent', description: 'do work', at: '2026-10-10T12:00:00Z', status: 'pending' }] }).ok, false);

  // Missing or empty who
  assert.equal(validateTwinState({ ...base, actions: [{ id: 'a1', who: '', description: 'do work', at: '2026-10-10T12:00:00Z', status: 'pending' }] }).ok, false);

  // Invalid status
  assert.equal(validateTwinState({ ...base, actions: [{ id: 'a1', who: 'agent', description: 'do work', at: '2026-10-10T12:00:00Z', status: 'unknown_status' }] }).ok, false);

  // Missing decided_at when status is approved
  assert.equal(validateTwinState({ ...base, actions: [{ id: 'a1', who: 'agent', description: 'do work', at: '2026-10-10T12:00:00Z', status: 'approved', decided_at: null }] }).ok, false);

  // Rejects pending action with non-null decided_at
  assert.equal(validateTwinState({ ...base, actions: [{ id: 'a1', who: 'agent', description: 'do work', at: '2026-10-10T12:00:00Z', status: 'pending', decided_at: '2026-10-10T12:01:00Z' }] }).ok, false);

  // Unknown field in action object
  assert.equal(validateTwinState({ ...base, actions: [{ id: 'a1', who: 'agent', description: 'do work', at: '2026-10-10T12:00:00Z', status: 'pending', extra: 123 }] }).ok, false);
});

test('evaluateActionDecision transitions status and timestamps decision fail-closed', () => {
  const pendingAction = { id: 'act-1', who: 'agent', description: 'Update profile', at: '2026-10-10T12:00:00.000Z', status: 'pending', decided_at: null };

  const app = evaluateActionDecision(pendingAction, 'approved', '2026-10-10T12:01:00.000Z');
  assert.equal(app.ok, true);
  assert.equal(app.action.status, 'approved');
  assert.equal(app.action.decided_at, '2026-10-10T12:01:00.000Z');

  const rej = evaluateActionDecision(pendingAction, 'rejected', '2026-10-10T12:02:00.000Z');
  assert.equal(rej.ok, true);
  assert.equal(rej.action.status, 'rejected');
  assert.equal(rej.action.decided_at, '2026-10-10T12:02:00.000Z');

  // Rejects already finalized (non-pending) actions
  assert.equal(evaluateActionDecision(app.action, 'approved').ok, false);
  assert.equal(evaluateActionDecision(rej.action, 'approved').ok, false);

  // Rejects malformed action or action with unknown fields
  assert.equal(evaluateActionDecision({ ...pendingAction, extra: 'bad' }, 'approved').ok, false);
  assert.equal(evaluateActionDecision({ id: 'act-1' }, 'approved').ok, false);

  // Rejects invalid decisions
  assert.equal(evaluateActionDecision(pendingAction, 'maybe').ok, false);
  assert.equal(evaluateActionDecision(null, 'approved').ok, false);
});

test('summarizeActions aggregates counts and handles invalid inputs fail-closed', () => {
  assert.deepEqual(summarizeActions(null), { total: 0, pending: 0, approved: 0, rejected: 0, recent: [] });
  assert.deepEqual(summarizeActions([]), { total: 0, pending: 0, approved: 0, rejected: 0, recent: [] });

  const list = [
    { id: '1', who: 'a', description: 'd1', at: '2026-10-10T10:00:00.000Z', status: 'pending', decided_at: null },
    { id: '2', who: 'b', description: 'd2', at: '2026-10-10T11:00:00.000Z', status: 'approved', decided_at: '2026-10-10T11:01:00.000Z' },
    { id: '3', who: 'c', description: 'd3', at: '2026-10-10T12:00:00.000Z', status: 'rejected', decided_at: '2026-10-10T12:01:00.000Z' }
  ];
  const summary = summarizeActions(list);
  assert.equal(summary.total, 3);
  assert.equal(summary.pending, 1);
  assert.equal(summary.approved, 1);
  assert.equal(summary.rejected, 1);
  assert.equal(summary.recent[0].id, '3');
});

test('validateTwinState accepts well-formed events and enforces backward compatibility', () => {
  const wellFormed = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [
      { id: 'evt-1', type: 'topics_updated', detail: 'Updated topics', at: '2026-10-10T10:00:00.000Z' },
      { id: 'evt-2', type: 'grant_created', detail: 'Granted dentist access', at: '2026-10-10T11:00:00.000Z' }
    ]
  };
  const res = validateTwinState(wellFormed);
  assert.equal(res.ok, true);
  assert.equal(res.value.events.length, 2);
  assert.equal(res.value.events[0].id, 'evt-1');
  assert.equal(res.value.events[0].type, 'topics_updated');

  // Backward compatibility: events omitted
  const omitted = { topics: [], grants: [] };
  const resOmitted = validateTwinState(omitted);
  assert.equal(resOmitted.ok, true);
  assert.deepEqual(resOmitted.value.events, []);
});

test('validateTwinState rejects malformed events fail-closed', () => {
  // Not an array
  assert.equal(validateTwinState({ topics: [], grants: [], events: 'bad' }).ok, false);
  // Non-object item
  assert.equal(validateTwinState({ topics: [], grants: [], events: ['not-an-object'] }).ok, false);
  // Unknown field in event
  assert.equal(validateTwinState({
    topics: [], grants: [],
    events: [{ id: 'e1', type: 'topics_updated', detail: 'ok', at: '2026-10-10T10:00:00.000Z', extra: 123 }]
  }).ok, false);
  // Invalid event type
  assert.equal(validateTwinState({
    topics: [], grants: [],
    events: [{ id: 'e1', type: 'unrecognized_type', detail: 'ok', at: '2026-10-10T10:00:00.000Z' }]
  }).ok, false);
  // Invalid id format
  assert.equal(validateTwinState({
    topics: [], grants: [],
    events: [{ id: 'bad id with spaces!', type: 'topics_updated', detail: 'ok', at: '2026-10-10T10:00:00.000Z' }]
  }).ok, false);
  // Detail too long (>120 chars)
  assert.equal(validateTwinState({
    topics: [], grants: [],
    events: [{ id: 'e1', type: 'topics_updated', detail: 'a'.repeat(121), at: '2026-10-10T10:00:00.000Z' }]
  }).ok, false);
  // Malformed date
  assert.equal(validateTwinState({
    topics: [], grants: [],
    events: [{ id: 'e1', type: 'topics_updated', detail: 'ok', at: 'not-a-date' }]
  }).ok, false);
  // Over maximum 50 events
  const tooMany = Array.from({ length: 51 }, (_, i) => ({
    id: `e-${i}`,
    type: 'topics_updated',
    detail: 'ok',
    at: '2026-10-10T10:00:00.000Z'
  }));
  assert.equal(validateTwinState({ topics: [], grants: [], events: tooMany }).ok, false);
});

test('recordTwinEvent appends typed events and enforces FIFO cap of 50', () => {
  const base = { topics: [], grants: [], contributions: [], actions: [], events: [] };
  const r1 = recordTwinEvent(base, 'topics_updated', 'Added privacy topic', '2026-10-10T10:00:00.000Z', 'evt-custom-1');
  assert.equal(r1.ok, true);
  assert.equal(r1.state.events.length, 1);
  assert.equal(r1.event.id, 'evt-custom-1');
  assert.equal(r1.event.type, 'topics_updated');
  assert.equal(r1.event.detail, 'Added privacy topic');

  // Append up to 50
  let current = base;
  for (let i = 0; i < 50; i++) {
    const res = recordTwinEvent(current, 'action_queued', `Action ${i}`, '2026-10-10T10:00:00.000Z', `evt-${i}`);
    assert.equal(res.ok, true);
    current = res.state;
  }
  assert.equal(current.events.length, 50);
  assert.equal(current.events[0].id, 'evt-0');

  // Adding 51st event evicts oldest via FIFO
  const r51 = recordTwinEvent(current, 'grant_created', 'New grant added', '2026-10-10T11:00:00.000Z', 'evt-51');
  assert.equal(r51.ok, true);
  assert.equal(r51.state.events.length, 50);
  assert.equal(r51.state.events[0].id, 'evt-1'); // evt-0 was dropped
  assert.equal(r51.state.events[49].id, 'evt-51'); // newest event at the end
});

test('recordTwinEvent fails closed on invalid inputs', () => {
  const base = { topics: [], grants: [], contributions: [], actions: [], events: [] };
  assert.equal(recordTwinEvent(null, 'topics_updated', 'ok').ok, false);
  assert.equal(recordTwinEvent(base, 'unsupported_type', 'ok').ok, false);
  assert.equal(recordTwinEvent(base, 'topics_updated', '').ok, false);
  assert.equal(recordTwinEvent(base, 'topics_updated', 'a'.repeat(121)).ok, false);
  assert.equal(recordTwinEvent(base, 'topics_updated', 'ok', 'not-a-timestamp').ok, false);
  assert.equal(recordTwinEvent(base, 'topics_updated', 'ok', new Date('invalid')).ok, false);
  assert.equal(recordTwinEvent(base, 'topics_updated', 'ok', null, 'bad id!').ok, false);
});

test('summarizeEvents aggregates counts and handles invalid inputs fail-closed', () => {
  assert.deepEqual(summarizeEvents(null), { total: 0, by_type: {}, latest: null });
  assert.deepEqual(summarizeEvents('bad'), { total: 0, by_type: {}, latest: null });

  const events = [
    { id: '1', type: 'topics_updated', detail: 'd1', at: '2026-10-10T10:00:00.000Z' },
    { id: '2', type: 'grant_created', detail: 'd2', at: '2026-10-10T11:00:00.000Z' },
    { id: '3', type: 'grant_created', detail: 'd3', at: '2026-10-10T12:00:00.000Z' }
  ];
  const summary = summarizeEvents(events);
  assert.equal(summary.total, 3);
  assert.equal(summary.by_type.topics_updated, 1);
  assert.equal(summary.by_type.grant_created, 2);
  assert.equal(summary.by_type.grant_revoked, 0);
  assert.equal(summary.latest.id, '3');

  // Does not let invalid timestamp in first item poison latest for subsequent valid events
  const poisoned = [
    { id: 'bad-1', type: 'topics_updated', detail: 'd1', at: 'invalid-date' },
    { id: 'good-2', type: 'grant_created', detail: 'd2', at: '2026-10-10T15:00:00.000Z' }
  ];
  const summary2 = summarizeEvents(poisoned);
  assert.equal(summary2.latest.id, 'good-2');
});

test('queueAccessAsPendingAction creates well-formed pending action and appends to state', () => {
  const base = { topics: [], grants: [], contributions: [], actions: [], events: [] };
  const res = queueAccessAsPendingAction(base, 'calendar-agent', 'read schedules', '2026-10-10T12:00:00.000Z', 'act-test-01');
  assert.equal(res.ok, true);
  assert.equal(res.action.id, 'act-test-01');
  assert.equal(res.action.who, 'calendar-agent');
  assert.equal(res.action.description, 'Access requested: read schedules');
  assert.equal(res.action.at, '2026-10-10T12:00:00.000Z');
  assert.equal(res.action.status, 'pending');
  assert.equal(res.action.decided_at, null);

  assert.equal(res.state.actions.length, 1);
  assert.deepEqual(res.state.actions[0], res.action);

  const val = validateTwinState(res.state);
  assert.equal(val.ok, true);
});

test('queueAccessAsPendingAction fails closed on invalid state or parameters', () => {
  const base = { topics: [], grants: [], contributions: [], actions: [], events: [] };

  // Invalid state
  assert.equal(queueAccessAsPendingAction(null, 'svc', 'scope').ok, false);
  assert.equal(queueAccessAsPendingAction({ extra: 1 }, 'svc', 'scope').ok, false);

  // Invalid service
  assert.equal(queueAccessAsPendingAction(base, '', 'scope').ok, false);
  assert.equal(queueAccessAsPendingAction(base, '   ', 'scope').ok, false);
  assert.equal(queueAccessAsPendingAction(base, 123, 'scope').ok, false);
  assert.equal(queueAccessAsPendingAction(base, 'a'.repeat(61), 'scope').ok, false);

  // Invalid scope
  assert.equal(queueAccessAsPendingAction(base, 'svc', '').ok, false);
  assert.equal(queueAccessAsPendingAction(base, 'svc', '   ').ok, false);
  assert.equal(queueAccessAsPendingAction(base, 'svc', null).ok, false);
  assert.equal(queueAccessAsPendingAction(base, 'svc', 'a'.repeat(81)).ok, false);

  // Invalid timestamp
  assert.equal(queueAccessAsPendingAction(base, 'svc', 'scope', 'not-a-date').ok, false);
  assert.equal(queueAccessAsPendingAction(base, 'svc', 'scope', new Date('invalid')).ok, false);

  // Invalid id
  assert.equal(queueAccessAsPendingAction(base, 'svc', 'scope', null, 'bad id!').ok, false);
  assert.equal(queueAccessAsPendingAction(base, 'svc', 'scope', null, 'a'.repeat(41)).ok, false);
});

test('queueAccessAsPendingAction enforces queue capacity cap of 50', () => {
  const fullActions = Array.from({ length: 50 }, (_, i) => ({
    id: `act-${i}`,
    who: 'test-agent',
    description: `request ${i}`,
    at: '2026-10-10T12:00:00.000Z',
    status: 'pending',
    decided_at: null
  }));
  const state = { topics: [], grants: [], contributions: [], actions: fullActions, events: [] };
  const res = queueAccessAsPendingAction(state, 'new-agent', 'read data');
  assert.equal(res.ok, false);
  assert.match(res.error, /maximum capacity/i);
});

test('validateTwinState accepts well-formed obligations and handles optional notes', () => {
  const state = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [
      {
        id: 'obl-1',
        title: 'Passport renewal',
        category: 'document',
        due_date: '2026-12-01',
        lead_days: 60,
        status: 'active',
        notes: 'Expiring in winter',
        at: '2026-10-10T12:00:00.000Z',
        resolved_at: null
      },
      {
        id: 'obl-2',
        title: 'Car insurance',
        category: 'contract',
        due_date: '2026-10-15',
        lead_days: 14,
        status: 'completed',
        notes: null,
        at: '2026-10-01T10:00:00.000Z',
        resolved_at: '2026-10-10T15:00:00.000Z'
      }
    ]
  };
  const res = validateTwinState(state);
  assert.equal(res.ok, true);
  assert.equal(res.value.obligations.length, 2);
  assert.equal(res.value.obligations[0].title, 'Passport renewal');
  assert.equal(res.value.obligations[1].status, 'completed');
});

test('validateTwinState rejects malformed obligations fail-closed', () => {
  const base = { topics: [], grants: [], contributions: [], actions: [], events: [] };
  const bad = [
    { ...base, obligations: 'bad' },
    { ...base, obligations: [{ id: '1', title: 't', category: 'tax', due_date: '2026-10-10', lead_days: 30, status: 'active', at: '2026-10-10T00:00:00Z', resolved_at: null, unknown: 1 }] },
    { ...base, obligations: [{ id: '1', title: 't', category: 'invalid', due_date: '2026-10-10', lead_days: 30, status: 'active', at: '2026-10-10T00:00:00Z', resolved_at: null }] },
    { ...base, obligations: [{ id: '1', title: 't', category: 'tax', due_date: '2026-10-10', lead_days: 30, status: 'pending', at: '2026-10-10T00:00:00Z', resolved_at: null }] },
    { ...base, obligations: [{ id: '1', title: 't', category: 'tax', due_date: '10/10/2026', lead_days: 30, status: 'active', at: '2026-10-10T00:00:00Z', resolved_at: null }] },
    { ...base, obligations: [{ id: '1', title: 't', category: 'tax', due_date: '2026-10-10', lead_days: -5, status: 'active', at: '2026-10-10T00:00:00Z', resolved_at: null }] },
    { ...base, obligations: [{ id: '1', title: 't', category: 'tax', due_date: '2026-10-10', lead_days: 30, status: 'active', at: '2026-10-10T00:00:00Z', resolved_at: '2026-10-10T00:00:00Z' }] },
    { ...base, obligations: [{ id: '1', title: 't', category: 'tax', due_date: '2026-10-10', lead_days: 30, status: 'completed', at: '2026-10-10T00:00:00Z', resolved_at: null }] }
  ];
  for (const b of bad) assert.equal(validateTwinState(b).ok, false);
});

test('calculateObligationUrgency evaluates overdue, due today, and urgent states deterministically', () => {
  const ref = '2026-10-10';
  const u1 = calculateObligationUrgency({ due_date: '2026-10-08', lead_days: 30 }, ref);
  assert.deepEqual({ d: u1.days_remaining, ov: u1.is_overdue, due: u1.is_due, urg: u1.is_urgent }, { d: -2, ov: true, due: false, urg: false });
  const u2 = calculateObligationUrgency({ due_date: '2026-10-10', lead_days: 14 }, ref);
  assert.deepEqual({ d: u2.days_remaining, ov: u2.is_overdue, due: u2.is_due, urg: u2.is_urgent }, { d: 0, ov: false, due: true, urg: true });
  const u3 = calculateObligationUrgency({ due_date: '2026-10-20', lead_days: 14 }, ref);
  assert.deepEqual({ d: u3.days_remaining, ov: u3.is_overdue, urg: u3.is_urgent }, { d: 10, ov: false, urg: true });
  const u4 = calculateObligationUrgency({ due_date: '2026-11-30', lead_days: 14 }, ref);
  assert.deepEqual({ d: u4.days_remaining, ov: u4.is_overdue, urg: u4.is_urgent }, { d: 51, ov: false, urg: false });
});

test('calculateObligationUrgency fails closed on invalid inputs', () => {
  assert.throws(() => calculateObligationUrgency(null));
  assert.throws(() => calculateObligationUrgency({ due_date: 'invalid' }));
  assert.throws(() => calculateObligationUrgency({ due_date: '2026-10-10' }, 'bad-date'));
});

test('summarizeObligations aggregates counts and breakdowns correctly', () => {
  const obs = [
    { id: '1', category: 'renewal', due_date: '2026-10-05', lead_days: 30, status: 'active' }, // overdue
    { id: '2', category: 'contract', due_date: '2026-10-15', lead_days: 14, status: 'active' }, // urgent
    { id: '3', category: 'warranty', due_date: '2026-12-31', lead_days: 30, status: 'active' }, // normal active
    { id: '4', category: 'tax', due_date: '2026-09-30', lead_days: 30, status: 'completed' }, // completed
    { id: '5', category: 'other', due_date: '2026-10-01', lead_days: 30, status: 'dismissed' }  // dismissed
  ];
  const summary = summarizeObligations(obs, '2026-10-10');
  assert.equal(summary.total, 5);
  assert.equal(summary.active, 3);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.urgent, 1);
  assert.equal(summary.completed, 1);
  assert.equal(summary.dismissed, 1);
  assert.equal(summary.by_category.renewal, 1);
  assert.equal(summary.by_category.contract, 1);
  assert.equal(summary.by_category.warranty, 1);
  assert.equal(summary.by_category.tax, 1);
  assert.equal(summary.by_category.other, 1);
  assert.equal(summary.by_category.document, 0);

  // Invalid input handling
  const empty = summarizeObligations(null);
  assert.equal(empty.total, 0);
  assert.equal(empty.active, 0);
});

test('validateTwinState accepts well-formed facts and maintains backward compatibility', () => {
  const base = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: []
  };
  // Backward compatibility: omitted facts
  const resOmitted = validateTwinState(base);
  assert.equal(resOmitted.ok, true);
  assert.deepEqual(resOmitted.value.facts, []);

  // Well-formed facts list
  const stateWithFacts = {
    ...base,
    facts: [
      {
        id: 'fact-med-1',
        category: 'medical',
        statement: 'Severe penicillin allergy, anaphylaxis risk',
        critical: true,
        at: '2026-10-10T12:00:00.000Z'
      },
      {
        id: 'fact-diet-2',
        category: 'dietary',
        statement: 'Vegetarian, strictly avoid gelatin',
        critical: false,
        at: '2026-10-10T12:05:00.000Z'
      }
    ]
  };
  const resValid = validateTwinState(stateWithFacts);
  assert.equal(resValid.ok, true);
  assert.equal(resValid.value.facts.length, 2);
  assert.equal(resValid.value.facts[0].id, 'fact-med-1');
  assert.equal(resValid.value.facts[0].category, 'medical');
  assert.equal(resValid.value.facts[0].critical, true);
  assert.equal(resValid.value.facts[1].category, 'dietary');
  assert.equal(resValid.value.facts[1].critical, false);
});

test('validateTwinState rejects malformed facts fail-closed', () => {
  const base = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: []
  };

  const badCases = [
    { facts: 'not-an-array' },
    { facts: [null] },
    { facts: ['not-an-object'] },
    { facts: [{ id: 'f1', category: 'medical', statement: 'ok', critical: true, at: '2026-10-10T00:00:00.000Z', extra: 1 }] },
    { facts: [{ id: '', category: 'medical', statement: 'ok', critical: true, at: '2026-10-10T00:00:00.000Z' }] },
    { facts: [{ id: 'bad id with spaces!', category: 'medical', statement: 'ok', critical: true, at: '2026-10-10T00:00:00.000Z' }] },
    { facts: [{ id: 'f1', category: 'unknown-category', statement: 'ok', critical: true, at: '2026-10-10T00:00:00.000Z' }] },
    { facts: [{ id: 'f1', category: 'medical', statement: '', critical: true, at: '2026-10-10T00:00:00.000Z' }] },
    { facts: [{ id: 'f1', category: 'medical', statement: 'a'.repeat(141), critical: true, at: '2026-10-10T00:00:00.000Z' }] },
    { facts: [{ id: 'f1', category: 'medical', statement: 'ok', critical: 'yes', at: '2026-10-10T00:00:00.000Z' }] },
    { facts: [{ id: 'f1', category: 'medical', statement: 'ok', critical: true, at: 'not-a-date' }] }
  ];

  for (const bc of badCases) {
    const res = validateTwinState({ ...base, ...bc });
    assert.equal(res.ok, false, `Expected failure for: ${JSON.stringify(bc)}`);
  }
});

test('summarizeFacts aggregates metrics and handles empty or invalid inputs fail-closed', () => {
  const facts = [
    { id: 'f1', category: 'medical', statement: 'Allergy', critical: true, at: '2026-10-10T00:00:00.000Z' },
    { id: 'f2', category: 'emergency', statement: 'Contact ICE', critical: true, at: '2026-10-10T00:00:00.000Z' },
    { id: 'f3', category: 'boundary', statement: 'No telemetry', critical: true, at: '2026-10-10T00:00:00.000Z' },
    { id: 'f4', category: 'preference', statement: 'Dark mode', critical: false, at: '2026-10-10T00:00:00.000Z' },
    { id: 'f5', category: 'other', statement: 'Note', critical: false, at: '2026-10-10T00:00:00.000Z' }
  ];

  const summary = summarizeFacts(facts);
  assert.equal(summary.total, 5);
  assert.equal(summary.critical_count, 3);
  assert.equal(summary.by_category.medical, 1);
  assert.equal(summary.by_category.emergency, 1);
  assert.equal(summary.by_category.boundary, 1);
  assert.equal(summary.by_category.preference, 1);
  assert.equal(summary.by_category.other, 1);
  assert.equal(summary.by_category.dietary, 0);

  // Mixed items and case normalization
  const mixed = summarizeFacts([
    null,
    'not-an-object',
    { id: 'f1', category: 'Medical', statement: 'Allergy', critical: true },
    { id: 'f2', category: 'DIETARY', statement: 'Peanuts', critical: false },
    { id: 'f3', category: 'invalid-cat', statement: 'Bad', critical: true }
  ]);
  assert.equal(mixed.total, 2);
  assert.equal(mixed.critical_count, 1);
  assert.equal(mixed.by_category.medical, 1);
  assert.equal(mixed.by_category.dietary, 1);

  // Invalid / empty handling
  const empty = summarizeFacts(null);
  assert.equal(empty.total, 0);
  assert.equal(empty.critical_count, 0);
});

test('filterCriticalFacts extracts critical facts safely', () => {
  const facts = [
    { id: 'f1', category: 'medical', statement: 'Allergy', critical: true, at: '2026-10-10T00:00:00.000Z' },
    { id: 'f2', category: 'preference', statement: 'Quiet', critical: false, at: '2026-10-10T00:00:00.000Z' }
  ];
  const crit = filterCriticalFacts(facts);
  assert.equal(crit.length, 1);
  assert.equal(crit[0].id, 'f1');
  assert.deepEqual(filterCriticalFacts(null), []);
});

test('validateTwinState accepts well-formed quests and maintains backward compatibility', () => {
  const state = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [
      {
        id: 'q1',
        title: 'Complete privacy review of twin',
        category: 'learning',
        priority: 1,
        completed: false,
        at: '2026-10-11T10:00:00.000Z',
        completed_at: null
      },
      {
        id: 'q2',
        title: 'Submit synthetic statement fixture',
        category: 'creation',
        priority: 2,
        completed: true,
        at: '2026-10-11T09:00:00.000Z',
        completed_at: '2026-10-11T11:00:00.000Z'
      }
    ]
  };
  const res = validateTwinState(state);
  assert.equal(res.ok, true);
  assert.equal(res.value.quests.length, 2);
  assert.equal(res.value.quests[0].id, 'q1');
  assert.equal(res.value.quests[0].priority, 1);
  assert.equal(res.value.quests[0].completed, false);
  assert.equal(res.value.quests[1].completed, true);
  assert.equal(res.value.quests[1].completed_at, '2026-10-11T11:00:00.000Z');
});

test('validateTwinState rejects malformed quests fail-closed', () => {
  const base = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: []
  };

  // Extra top-level keys
  assert.equal(validateTwinState({ ...base, quests: [], invalid_key: 1 }).ok, false);

  // Non-array quests
  assert.equal(validateTwinState({ ...base, quests: 'not-array' }).ok, false);

  // Too many quests (> 50)
  const tooMany = Array.from({ length: 51 }, (_, i) => ({
    id: `q${i}`,
    title: 'Valid quest title here',
    category: 'learning',
    priority: 1,
    completed: false,
    at: '2026-10-11T10:00:00.000Z',
    completed_at: null
  }));
  assert.equal(validateTwinState({ ...base, quests: tooMany }).ok, false);

  // Invalid item structure
  assert.equal(validateTwinState({ ...base, quests: [null] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: ['string'] }).ok, false);

  // Unknown fields
  const validQ = {
    id: 'q1',
    title: 'Valid quest title here',
    category: 'learning',
    priority: 1,
    completed: false,
    at: '2026-10-11T10:00:00.000Z',
    completed_at: null
  };
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, extra: 1 }] }).ok, false);

  // Invalid id
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, id: '' }] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, id: 'bad id with spaces' }] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, id: 'a'.repeat(45) }] }).ok, false);

  // Invalid title bounds (< 3 or > 100)
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, title: 'ab' }] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, title: 'a'.repeat(105) }] }).ok, false);

  // Invalid category
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, category: 'unknown' }] }).ok, false);

  // Non-integer or out-of-range priority
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, priority: 0 }] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, priority: 4 }] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, priority: 1.5 }] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, priority: true }] }).ok, false);
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, priority: '1' }] }).ok, false);

  // Invalid completed boolean
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, completed: 'yes' }] }).ok, false);

  // Invalid at timestamp
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, at: 'not-a-date' }] }).ok, false);

  // Uncompleted with completed_at set
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, completed: false, completed_at: '2026-10-11T10:00:00.000Z' }] }).ok, false);

  // Completed with invalid completed_at
  assert.equal(validateTwinState({ ...base, quests: [{ ...validQ, completed: true, completed_at: 'invalid-date' }] }).ok, false);
});

test('toggleQuestCompletion toggles completion and updates completed_at fail-closed', () => {
  const initial = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [
      {
        id: 'q1',
        title: 'Review proposal',
        category: 'community',
        priority: 1,
        completed: false,
        at: '2026-10-11T10:00:00.000Z',
        completed_at: null
      }
    ]
  };

  // Toggle to completed
  const t1 = toggleQuestCompletion(initial, 'q1', '2026-10-11T12:00:00.000Z');
  assert.equal(t1.ok, true);
  assert.equal(t1.completed, true);
  assert.equal(t1.state.quests[0].completed, true);
  assert.equal(t1.state.quests[0].completed_at, '2026-10-11T12:00:00.000Z');

  // Toggle back to uncompleted
  const t2 = toggleQuestCompletion(t1.state, 'q1', '2026-10-11T13:00:00.000Z');
  assert.equal(t2.ok, true);
  assert.equal(t2.completed, false);
  assert.equal(t2.state.quests[0].completed, false);
  assert.equal(t2.state.quests[0].completed_at, null);

  // Fail closed on nonexistent id
  const badId = toggleQuestCompletion(initial, 'nonexistent');
  assert.equal(badId.ok, false);

  // Fail closed on invalid state or time
  assert.equal(toggleQuestCompletion(null, 'q1').ok, false);
  assert.equal(toggleQuestCompletion(initial, 'q1', 'invalid-time').ok, false);
  assert.equal(toggleQuestCompletion(initial, 'q1', new Date('invalid')).ok, false);
});

test('summarizeQuests aggregates metrics, pending, focus, and categories fail-closed', () => {
  const quests = [
    { id: 'q1', category: 'learning', priority: 1, completed: false },
    { id: 'q2', category: 'creation', priority: 2, completed: false },
    { id: 'q3', category: 'community', priority: 1, completed: true },
    { id: 'q4', category: 'other', priority: 3, completed: false },
    { id: 'bad', category: 'unknown-cat', priority: 1, completed: false }
  ];

  const sum = summarizeQuests(quests);
  assert.equal(sum.total, 4);
  assert.equal(sum.completed, 1);
  assert.equal(sum.pending, 3);
  assert.equal(sum.focus_pending, 1); // only q1 is pending with priority 1
  assert.equal(sum.by_category.learning, 1);
  assert.equal(sum.by_category.creation, 1);
  assert.equal(sum.by_category.community, 1);
  assert.equal(sum.by_category.other, 1);

  // Null or invalid input
  const empty = summarizeQuests(null);
  assert.equal(empty.total, 0);
  assert.equal(empty.completed, 0);
  assert.equal(empty.pending, 0);
  assert.equal(empty.focus_pending, 0);
});

test('filterActiveQuests filters completed and sorts by priority and at limit', () => {
  const quests = [
    { id: 'q1', title: 'Task Low', priority: 3, completed: false, at: '2026-10-11T08:00:00.000Z' },
    { id: 'q2', title: 'Task Done', priority: 1, completed: true, at: '2026-10-11T09:00:00.000Z' },
    { id: 'q3', title: 'Task High A', priority: 1, completed: false, at: '2026-10-11T10:00:00.000Z' },
    { id: 'q4', title: 'Task High B', priority: 1, completed: false, at: '2026-10-11T07:00:00.000Z' },
    { id: 'q5', title: 'Task Normal', priority: 2, completed: false, at: '2026-10-11T06:00:00.000Z' },
    { id: 'q6', title: 'Task Tie B', priority: 1, completed: false, at: '2026-10-11T07:00:00.000Z' }
  ];

  const active = filterActiveQuests(quests, 3);
  assert.equal(active.length, 3);
  // Priority 1 tasks first, sorted by at ascending, then id ascending: q4, q6, q3
  assert.equal(active[0].id, 'q4');
  assert.equal(active[1].id, 'q6');
  assert.equal(active[2].id, 'q3');

  // Limit 0 returns empty array
  assert.deepEqual(filterActiveQuests(quests, 0), []);

  // Edge cases with malformed or missing fields
  assert.deepEqual(filterActiveQuests([{}, {}]), []);
  assert.deepEqual(filterActiveQuests([{ priority: 1, at: null }, { priority: 1, at: '2026-10-11T00:00:00.000Z' }]), []);
  assert.deepEqual(filterActiveQuests(null), []);
});

test('validateTwinState accepts well-formed values and enforces bounds', () => {
  const valid = {
    topics: [],
    grants: [],
    values: {
      commons: 5,
      resilience: 4,
      wellbeing: 2,
      learning: 5,
      containment: 4,
      ecology: 1
    }
  };
  const res = validateTwinState(valid);
  assert.equal(res.ok, true);
  assert.equal(res.value.values.commons, 5);
  assert.equal(res.value.values.ecology, 1);
});

test('validateTwinState rejects malformed values fail-closed', () => {
  // Unknown dimension
  assert.equal(validateTwinState({ topics: [], grants: [], values: { commons: 3, unknownDim: 4 } }).ok, false);
  // Score < 1
  assert.equal(validateTwinState({ topics: [], grants: [], values: { commons: 0 } }).ok, false);
  // Score > 5
  assert.equal(validateTwinState({ topics: [], grants: [], values: { commons: 6 } }).ok, false);
  // NaN, Inf, Boolean
  assert.equal(validateTwinState({ topics: [], grants: [], values: { commons: NaN } }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [], values: { commons: Infinity } }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [], values: { commons: true } }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [], values: 'bad' }).ok, false);
  assert.equal(validateTwinState({ topics: [], grants: [], values: null }).ok, false);
});

test('updateValuePreference updates dimension score and validates inputs fail-closed', () => {
  const base = DEFAULT_TWIN_STATE;
  const res = updateValuePreference(base, 'commons', 5);
  assert.equal(res.ok, true);
  assert.equal(res.state.values.commons, 5);
  assert.equal(res.score, 5);
  assert.equal(res.dimension, 'commons');

  // Case normalization
  const resNorm = updateValuePreference(base, '  RESILIENCE  ', 4);
  assert.equal(resNorm.ok, true);
  assert.equal(resNorm.state.values.resilience, 4);

  // Reject invalid dimension
  assert.equal(updateValuePreference(base, 'invalid', 4).ok, false);
  assert.equal(updateValuePreference(base, 123, 4).ok, false);

  // Reject out-of-range or non-numeric score
  assert.equal(updateValuePreference(base, 'commons', 6).ok, false);
  assert.equal(updateValuePreference(base, 'commons', 0).ok, false);
  assert.equal(updateValuePreference(base, 'commons', NaN).ok, false);
  assert.equal(updateValuePreference(base, 'commons', true).ok, false);

  // Reject invalid state
  assert.equal(updateValuePreference(null, 'commons', 4).ok, false);
});

test('calculateValueAlignment computes alignment score correctly fail-closed', () => {
  const vals = {
    commons: 5,
    resilience: 5,
    wellbeing: 1,
    learning: 5,
    containment: 1,
    ecology: 1
  };
  // Action tagged with commons and learning (both 5) -> alignment is (5+5)/(2*5) = 1.0
  const high = calculateValueAlignment(vals, ['commons', 'learning']);
  assert.equal(high.alignment, 1.0);
  assert.deepEqual(high.matched_dimensions, ['commons', 'learning']);

  // Action tagged with wellbeing and containment (both 1) -> alignment is (1+1)/(2*5) = 0.2
  const low = calculateValueAlignment(vals, ['wellbeing', 'containment']);
  assert.equal(low.alignment, 0.2);

  // Mixed matching
  const mixed = calculateValueAlignment(vals, ['commons', 'ecology']);
  assert.equal(mixed.alignment, 0.6);

  // Filters out unknown dimensions safely
  const filtered = calculateValueAlignment(vals, ['commons', 'unknown_tag']);
  assert.equal(filtered.alignment, 1.0);
  assert.deepEqual(filtered.matched_dimensions, ['commons']);

  // Empty or invalid inputs return 0.0
  assert.equal(calculateValueAlignment(vals, []).alignment, 0.0);
  assert.equal(calculateValueAlignment(vals, ['unknown_tag']).alignment, 0.0);
  assert.equal(calculateValueAlignment(null, ['commons']).alignment, 0.0);
  assert.equal(calculateValueAlignment(vals, null).alignment, 0.0);
});

test('summarizeValues calculates averages, breakdown, and top priorities fail-closed', () => {
  const vals = {
    commons: 5,
    resilience: 4,
    wellbeing: 2,
    learning: 5,
    containment: 3,
    ecology: 5
  };
  const summary = summarizeValues(vals);
  // Average of 5+4+2+5+3+5 = 24 / 6 = 4.0
  assert.equal(summary.average_priority, 4.0);
  // Top dimensions should be commons, learning, ecology (all tied at 5)
  assert.deepEqual(summary.top_dimensions.slice().sort(), ['commons', 'ecology', 'learning']);
  assert.equal(summary.by_dimension.commons, 5);
  assert.equal(summary.by_dimension.wellbeing, 2);

  // Null or invalid input returns defaults
  const empty = summarizeValues(null);
  assert.equal(empty.average_priority, 3.0);
  assert.deepEqual(empty.top_dimensions, []);
});

test('auditMemoryStatement detects speculative and prospective markers and distinguishes confirmed declarative facts', () => {
  assert.equal(Array.isArray(SPECULATIVE_MARKERS), true);
  assert.equal(Object.isFrozen(SPECULATIVE_MARKERS), true);

  // Confirmed declarative facts
  const f1 = auditMemoryStatement('Severe penicillin allergy');
  assert.equal(f1.is_speculation, false);
  assert.equal(f1.verdict, 'confirmed');
  assert.deepEqual(f1.markers, []);
  assert.equal(Object.isFrozen(f1), true);

  const f2 = auditMemoryStatement('Emergency contact is Jane Doe at 555-0199');
  assert.equal(f2.is_speculation, false);
  assert.equal(f2.verdict, 'confirmed');

  // Speculative statements with single or multiple markers
  const s1 = auditMemoryStatement('I might relocate to Berlin in the spring');
  assert.equal(s1.is_speculation, true);
  assert.equal(s1.verdict, 'speculation');
  assert.deepEqual(s1.markers, ['might']);

  const s2 = auditMemoryStatement('Planning to switch to a plant-based diet, maybe next month');
  assert.equal(s2.is_speculation, true);
  assert.equal(s2.verdict, 'speculation');
  assert.ok(s2.markers.includes('planning to'));
  assert.ok(s2.markers.includes('maybe'));

  const s3 = auditMemoryStatement('Considering adopting a dog');
  assert.equal(s3.is_speculation, true);
  assert.deepEqual(s3.markers, ['considering']);

  const s4 = auditMemoryStatement('Thinking about taking evening classes');
  assert.equal(s4.is_speculation, true);
  assert.deepEqual(s4.markers, ['thinking about']);

  // Case insensitivity and punctuation resilience
  const s5 = auditMemoryStatement('COULD possibly attend conference?');
  assert.equal(s5.is_speculation, true);
  assert.ok(s5.markers.includes('could'));
  assert.ok(s5.markers.includes('possibly'));

  // Multi-word marker with irregular spacing
  const s6 = auditMemoryStatement('Planning   to   relocate to Toronto');
  assert.equal(s6.is_speculation, true);
  assert.deepEqual(s6.markers, ['planning to']);
});

test('auditMemoryStatement fails closed on invalid or boundary inputs', () => {
  // Non-strings throw TypeError
  assert.throws(() => auditMemoryStatement(null), { name: 'TypeError' });
  assert.throws(() => auditMemoryStatement(undefined), { name: 'TypeError' });
  assert.throws(() => auditMemoryStatement(123), { name: 'TypeError' });
  assert.throws(() => auditMemoryStatement({}), { name: 'TypeError' });

  // Empty or whitespace-only throws Error
  assert.throws(() => auditMemoryStatement(''), { message: 'statement cannot be empty' });
  assert.throws(() => auditMemoryStatement('   '), { message: 'statement cannot be empty' });

  // Over max length (140 chars) throws Error
  const tooLong = 'a'.repeat(141);
  assert.throws(() => auditMemoryStatement(tooLong), { message: 'statement cannot exceed 140 characters' });

  // Exactly 140 chars is allowed
  const exact140 = 'a'.repeat(140);
  const res = auditMemoryStatement(exact140);
  assert.equal(res.is_speculation, false);
  assert.equal(res.verdict, 'confirmed');
});

test('gateMemoryFact enforces write-time boundary against speculative safety-critical constraints', () => {
  // Confirmed fact as critical is allowed
  const r1 = gateMemoryFact('Severe latex allergy', true);
  assert.equal(r1.allowed, true);
  assert.equal(r1.audit.is_speculation, false);
  assert.equal(Object.isFrozen(r1), true);

  // Confirmed fact as non-critical is allowed
  const r2 = gateMemoryFact('Prefers dark mode', false);
  assert.equal(r2.allowed, true);
  assert.equal(r2.audit.is_speculation, false);

  // Speculative statement as non-critical is allowed
  const r3 = gateMemoryFact('Might take a sabbatical in autumn', false);
  assert.equal(r3.allowed, true);
  assert.equal(r3.audit.is_speculation, true);

  // Speculative statement as critical constraint is REJECTED
  const r4 = gateMemoryFact('Might have mild allergy to shellfish', true);
  assert.equal(r4.allowed, false);
  assert.ok(r4.reason.includes('Speculative statement cannot be registered as a safety-critical constraint'));
  assert.equal(r4.audit.is_speculation, true);
  assert.deepEqual(r4.audit.markers, ['might']);

  // Multi-word marker with multiple spaces as critical constraint is also REJECTED
  const r5 = gateMemoryFact('Planning   to   switch medication', true);
  assert.equal(r5.allowed, false);
  assert.equal(r5.audit.is_speculation, true);
  assert.deepEqual(r5.audit.markers, ['planning to']);

  // Invalid argument types throw TypeError
  assert.throws(() => gateMemoryFact(123, true), { name: 'TypeError' });
  assert.throws(() => gateMemoryFact('Valid statement', 'true'), { name: 'TypeError' });
  assert.throws(() => gateMemoryFact('Valid statement', null), { name: 'TypeError' });
});

test('summarizeMemoryAudit aggregates confirmed vs speculative memory entries and handles malformed inputs fail-closed', () => {
  const facts = [
    { id: 'f-1', category: 'medical', statement: 'Severe peanut allergy', critical: true },
    { id: 'f-2', category: 'preference', statement: 'Prefers tea over coffee', critical: false },
    { id: 'f-3', category: 'preference', statement: 'Might switch to decaf next month', critical: false },
    { id: 'f-4', category: 'medical', statement: 'Could possibly have penicillin reaction', critical: true },
    { id: 'f-5', category: 'other', statement: 'Invalid statement object' }
  ];

  const summary = summarizeMemoryAudit(facts);
  assert.equal(summary.total, 5);
  assert.equal(summary.confirmed, 3); // f-1, f-2, f-5
  assert.equal(summary.speculation, 2); // f-3, f-4
  assert.equal(summary.critical_speculation, 1); // f-4 is both critical and speculation
  assert.equal(summary.breakdown.confirmed, 3);
  assert.equal(summary.breakdown.speculation, 2);
  assert.equal(Object.isFrozen(summary), true);
  assert.equal(Object.isFrozen(summary.breakdown), true);

  // Non-array input returns zeroed fail-closed summary
  const empty = summarizeMemoryAudit(null);
  assert.equal(empty.total, 0);
  assert.equal(empty.confirmed, 0);
  assert.equal(empty.speculation, 0);
  assert.equal(empty.critical_speculation, 0);
});




