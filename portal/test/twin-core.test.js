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
  summarizeMemoryAudit,
  CONSEQUENTIAL_RISK_KEYWORDS,
  auditBoundaryAction,
  summarizeBoundaryAudits,
  estimateTokenCount,
  computeContextFingerprint,
  assembleTokenBudgetedContext,
  ALLOWED_TOOL_KINDS,
  SENSITIVE_TOPIC_KEYWORDS,
  SENSITIVE_TAINT_KEYWORDS,
  EGRESS_ACTION_KEYWORDS,
  auditToolExecutionChain,
  summarizeChainAudit,
  ALLOWED_RECEIPT_FIELDS,
  verifyConsentReceipt,
  summarizeReceiptVerification,
  ALLOWED_CAPABILITY_REQUEST_FIELDS,
  ALLOWED_CAPABILITY_LEASE_FIELDS,
  evaluateCapabilityAdjustmentRequest,
  verifyCapabilityLease,
  summarizeCapabilityAdjustment,
  summarizeCapabilityLease,
  ALLOWED_LEDGER_OPERATIONS,
  ALLOWED_LEDGER_ENTRY_FIELDS,
  ALLOWED_FINANCIAL_QUERY_FIELDS,
  ALLOWED_READING_FIELDS,
  ALLOWED_AGREEMENT_OPTIONS_FIELDS,
  evaluateFinancialLedgerQuery,
  verifyLedgerQueryAgreement,
  summarizeLedgerEvaluation
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

test('gateMemoryFact does not block safety-critical constraints and flags unconfirmed markers for confirmation', () => {
  // Confirmed fact as critical is allowed without confirmation
  const r1 = gateMemoryFact('Severe latex allergy', true);
  assert.equal(r1.allowed, true);
  assert.equal(r1.needs_confirmation, false);
  assert.equal(r1.audit.is_speculation, false);
  assert.equal(Object.isFrozen(r1), true);

  // Confirmed fact as non-critical is allowed without confirmation
  const r2 = gateMemoryFact('Prefers dark mode', false);
  assert.equal(r2.allowed, true);
  assert.equal(r2.needs_confirmation, false);
  assert.equal(r2.audit.is_speculation, false);

  // Speculative statement as non-critical is allowed without confirmation
  const r3 = gateMemoryFact('Might take a sabbatical in autumn', false);
  assert.equal(r3.allowed, true);
  assert.equal(r3.needs_confirmation, false);
  assert.equal(r3.audit.is_speculation, true);

  // Speculative statement as critical constraint is ALLOWED with needs_confirmation: true (never blocks)
  const r4 = gateMemoryFact('Might have mild allergy to shellfish', true);
  assert.equal(r4.allowed, true);
  assert.equal(r4.needs_confirmation, true);
  assert.ok(r4.reason.includes('confirmation recommended'));
  assert.equal(r4.audit.is_speculation, true);
  assert.deepEqual(r4.audit.markers, ['might']);

  // Multi-word marker as critical constraint is allowed with needs_confirmation: true
  const r5 = gateMemoryFact('Planning   to   switch medication', true);
  assert.equal(r5.allowed, true);
  assert.equal(r5.needs_confirmation, true);
  assert.equal(r5.audit.is_speculation, true);
  assert.deepEqual(r5.audit.markers, ['planning to']);

  // Invalid argument types throw TypeError
  assert.throws(() => gateMemoryFact(123, true), { name: 'TypeError' });
  assert.throws(() => gateMemoryFact('Valid statement', 'true'), { name: 'TypeError' });
  assert.throws(() => gateMemoryFact('Valid statement', null), { name: 'TypeError' });
});

test('gateMemoryFact and auditMemoryStatement accept sentence-aware safety-critical constraints and save each entry', () => {
  const criticalSentences = [
    'Penicillin could kill me, never accept it',
    'I may not drive after 9pm by court order',
    'Birthday is in May',
    'I am NOT considering selling my house'
  ];

  let state = {
    topics: ['health', 'safety'],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  criticalSentences.forEach((sentence, idx) => {
    // 1. Audit recognizes sentence as confirmed without false speculative flagging
    const audit = auditMemoryStatement(sentence);
    assert.equal(audit.is_speculation, false, `Expected confirmed for: ${sentence}`);
    assert.equal(audit.verdict, 'confirmed');
    assert.deepEqual(audit.markers, []);

    // 2. Gate allows entry without blocking or requiring confirmation
    const gate = gateMemoryFact(sentence, true);
    assert.equal(gate.allowed, true);
    assert.equal(gate.needs_confirmation, false);

    // 3. Fact is saved into twin state and validated
    const newFact = {
      id: `fact-crit-${idx + 1}`,
      category: 'medical',
      statement: sentence,
      critical: true,
      at: '2026-10-11T12:00:00.000Z'
    };
    state = {
      ...state,
      facts: state.facts.concat([newFact])
    };

    const validated = validateTwinState(state);
    assert.equal(validated.ok, true, `Validation failed after saving: ${sentence}`);
    assert.equal(validated.value.facts.length, idx + 1);
    assert.equal(validated.value.facts[idx].statement, sentence);
    assert.equal(validated.value.facts[idx].critical, true);
  });

  // Verify all 4 constraints end with the entry saved in state
  assert.equal(state.facts.length, 4);
  assert.equal(filterCriticalFacts(state.facts).length, 4);
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

test('CONSEQUENTIAL_RISK_KEYWORDS is deeply frozen and contains standard high-risk operations', () => {
  assert.equal(Array.isArray(CONSEQUENTIAL_RISK_KEYWORDS), true);
  assert.equal(Object.isFrozen(CONSEQUENTIAL_RISK_KEYWORDS), true);
  assert.ok(CONSEQUENTIAL_RISK_KEYWORDS.includes('transfer'));
  assert.ok(CONSEQUENTIAL_RISK_KEYWORDS.includes('delete'));
  assert.ok(CONSEQUENTIAL_RISK_KEYWORDS.includes('wipe'));
  assert.ok(CONSEQUENTIAL_RISK_KEYWORDS.includes('export_all'));
  assert.ok(CONSEQUENTIAL_RISK_KEYWORDS.includes('exfiltrate'));
  assert.ok(CONSEQUENTIAL_RISK_KEYWORDS.includes('override'));
  assert.throws(() => { CONSEQUENTIAL_RISK_KEYWORDS.push('hack'); });
});

test('auditBoundaryAction passes for authorized non-consequential action without constraint conflict', () => {
  const state = {
    topics: ['health'],
    grants: [{ who: 'calendar-sync', what: 'meeting schedule', at: '2026-10-10T12:00:00.000Z', expires_at: null }],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [{ id: 'f-1', category: 'medical', statement: 'Penicillin allergy', critical: true, at: '2026-10-10T12:00:00.000Z' }],
    quests: [],
    values: DEFAULT_VALUES
  };

  const res = auditBoundaryAction(state, {
    who: 'calendar-sync',
    action: 'view meeting schedule',
    scope: 'meeting schedule'
  });

  assert.equal(res.allowed, true);
  assert.equal(res.verdict, 'pass');
  assert.equal(res.risk_level, 'low');
  assert.equal(res.matched_constraints.length, 0);
  assert.ok(res.reasons.some((r) => r.includes('authorized by active grant')));
  assert.equal(Object.isFrozen(res), true);
  assert.equal(Object.isFrozen(res.reasons), true);
  assert.equal(Object.isFrozen(res.matched_constraints), true);
});

test('auditBoundaryAction blocks when action contradicts or touches a critical memory constraint', () => {
  const state = {
    topics: [],
    grants: [{ who: 'pharmacy-bot', what: '*', at: '2026-10-10T12:00:00.000Z', expires_at: null }],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [
      { id: 'f-1', category: 'medical', statement: 'Severe penicillin allergy, never administer', critical: true, at: '2026-10-10T12:00:00.000Z' },
      { id: 'f-2', category: 'preference', statement: 'Prefers quiet rooms', critical: false, at: '2026-10-10T12:00:00.000Z' }
    ],
    quests: [],
    values: DEFAULT_VALUES
  };

  const res = auditBoundaryAction(state, {
    who: 'pharmacy-bot',
    action: 'Order penicillin prescription 500mg'
  });

  assert.equal(res.allowed, false);
  assert.equal(res.verdict, 'block');
  assert.equal(res.risk_level, 'high');
  assert.equal(res.matched_constraints.length, 1);
  assert.equal(res.matched_constraints[0].id, 'f-1');
  assert.ok(res.reasons.some((r) => r.includes('touches critical constraint')));
});

test('auditBoundaryAction blocks high consequential risk operations when ungranted', () => {
  const state = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // High-risk keyword: delete
  const r1 = auditBoundaryAction(state, {
    who: 'untrusted-agent',
    action: 'delete all contacts'
  });
  assert.equal(r1.allowed, false);
  assert.equal(r1.verdict, 'block');
  assert.equal(r1.risk_level, 'high');
  assert.ok(r1.reasons.some((r) => r.includes('consequential risk keyword(s): delete')));
  assert.ok(r1.reasons.some((r) => r.includes('no active grant')));

  // High-risk compound keyword: export_all
  const r2 = auditBoundaryAction(state, {
    who: 'analytics-script',
    action: 'trigger export_all payload'
  });
  assert.equal(r2.allowed, false);
  assert.equal(r2.verdict, 'block');
  assert.equal(r2.risk_level, 'high');
});

test('auditBoundaryAction requires confirmation for ungranted low-risk action or granted high-risk action', () => {
  const state = {
    topics: [],
    grants: [{ who: 'storage-service', what: 'backup management', at: '2026-10-10T12:00:00.000Z', expires_at: null }],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Case 1: ungranted but not inherently consequential -> require_confirmation (medium risk)
  const r1 = auditBoundaryAction(state, {
    who: 'weather-assistant',
    action: 'lookup current location weather'
  });
  assert.equal(r1.allowed, false);
  assert.equal(r1.verdict, 'require_confirmation');
  assert.equal(r1.risk_level, 'medium');

  // Case 2: granted service attempting consequential operation -> require_confirmation (high risk)
  const r2 = auditBoundaryAction(state, {
    who: 'storage-service',
    action: 'wipe previous snapshot archive',
    scope: 'backup management'
  });
  assert.equal(r2.allowed, false);
  assert.equal(r2.verdict, 'require_confirmation');
  assert.equal(r2.risk_level, 'high');
  assert.ok(r2.reasons.some((r) => r.includes('wipe')));
});

test('auditBoundaryAction fails closed on invalid state, malformed request, unknown fields, or bad timestamps', () => {
  const validState = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Invalid state
  assert.equal(auditBoundaryAction(null, { who: 'a', action: 'b' }).verdict, 'block');
  assert.equal(auditBoundaryAction({ bad: 1 }, { who: 'a', action: 'b' }).verdict, 'block');

  // Malformed request
  assert.equal(auditBoundaryAction(validState, null).verdict, 'block');
  assert.equal(auditBoundaryAction(validState, 'string').verdict, 'block');
  assert.equal(auditBoundaryAction(validState, []).verdict, 'block');

  // Unknown fields in request
  const extraFieldReq = { who: 'agent', action: 'ping', extra: 123 };
  const rUnknown = auditBoundaryAction(validState, extraFieldReq);
  assert.equal(rUnknown.verdict, 'block');
  assert.ok(rUnknown.reasons.some((r) => r.includes('unknown fields')));

  // Missing or empty who
  assert.equal(auditBoundaryAction(validState, { who: '', action: 'ping' }).verdict, 'block');
  assert.equal(auditBoundaryAction(validState, { who: '   ', action: 'ping' }).verdict, 'block');
  assert.equal(auditBoundaryAction(validState, { who: 'a'.repeat(61), action: 'ping' }).verdict, 'block');

  // Missing or empty action
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: '' }).verdict, 'block');
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: '   ' }).verdict, 'block');
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: 'a'.repeat(101) }).verdict, 'block');

  // Oversized scope or context
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: 'act', scope: 'a'.repeat(81) }).verdict, 'block');
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: 'act', context: 'a'.repeat(201) }).verdict, 'block');
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: 'act', scope: 123 }).verdict, 'block');

  // Invalid asOfTime
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: 'act' }, 'invalid-date').verdict, 'block');
  assert.equal(auditBoundaryAction(validState, { who: 'agent', action: 'act' }, {}).verdict, 'block');
});

test('summarizeBoundaryAudits aggregates audit outcomes cleanly fail-closed', () => {
  // Invalid inputs return zeroed summary
  assert.deepEqual(summarizeBoundaryAudits(null), { total: 0, pass: 0, block: 0, require_confirmation: 0, high_risk: 0 });
  assert.deepEqual(summarizeBoundaryAudits('bad'), { total: 0, pass: 0, block: 0, require_confirmation: 0, high_risk: 0 });

  const audits = [
    { verdict: 'pass', risk_level: 'low' },
    { verdict: 'pass', risk_level: 'low' },
    { verdict: 'require_confirmation', risk_level: 'medium' },
    { verdict: 'require_confirmation', risk_level: 'high' },
    { verdict: 'block', risk_level: 'high' },
    { verdict: 'block', risk_level: 'high' }
  ];

  const summary = summarizeBoundaryAudits(audits);
  assert.equal(summary.total, 6);
  assert.equal(summary.pass, 2);
  assert.equal(summary.require_confirmation, 2);
  assert.equal(summary.block, 2);
  assert.equal(summary.high_risk, 3);
  assert.equal(Object.isFrozen(summary), true);
});

test('estimateTokenCount estimates tokens deterministically and fails closed on non-strings', () => {
  assert.equal(estimateTokenCount(null), 0);
  assert.equal(estimateTokenCount(123), 0);
  assert.equal(estimateTokenCount(''), 0);
  assert.equal(estimateTokenCount('   '), 0);
  assert.equal(estimateTokenCount('hello'), 2);
  assert.equal(estimateTokenCount('You are a personal twin assistant operating strictly within the person local browser device.'), 26);
});

test('computeContextFingerprint generates stable 14-hex fingerprint and fails closed', () => {
  assert.equal(computeContextFingerprint(''), '00000000000000');
  assert.equal(computeContextFingerprint(null), '00000000000000');
  const fp1 = computeContextFingerprint('System prompt prefix text');
  const fp2 = computeContextFingerprint('System prompt prefix text');
  assert.equal(fp1, fp2);
  assert.equal(typeof fp1, 'string');
  assert.equal(fp1.length, 14);
  const fp3 = computeContextFingerprint('Different prefix text');
  assert.notEqual(fp1, fp3);
});

test('assembleTokenBudgetedContext compiles full context across all phases under generous budget', () => {
  const sampleState = {
    topics: ['health', 'privacy'],
    grants: [],
    contributions: [],
    actions: [],
    events: [
      { id: 'ev-1', at: '2026-10-12T00:00:00Z', type: 'data_exported', detail: 'Local backup created' }
    ],
    obligations: [
      { id: 'obl-1', title: 'Medication refill', category: 'renewal', due_date: '2026-10-15', lead_days: 7, status: 'active', notes: 'pharmacy', at: '2026-10-12T00:00:00Z' }
    ],
    facts: [
      { id: 'fact-1', category: 'medical', statement: 'Severe allergy to penicillin', critical: true, at: '2026-10-12T00:00:00Z' },
      { id: 'fact-2', category: 'preference', statement: 'Prefers dark theme interfaces', critical: false, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [
      { id: 'quest-1', title: 'Verify offline local models', category: 'learning', priority: 1, completed: false, at: '2026-10-12T00:00:00Z' }
    ],
    values: DEFAULT_VALUES
  };

  const res = assembleTokenBudgetedContext(sampleState, {
    budget_tokens: 2048,
    as_of_date: '2026-10-12'
  });

  assert.equal(res.ok, true);
  assert.equal(res.budget_tokens, 2048);
  assert.ok(res.total_estimated_tokens > 0 && res.total_estimated_tokens < 2048);
  assert.equal(res.remaining_tokens, 2048 - res.total_estimated_tokens);
  assert.deepEqual(res.sections_included, ['system', 'critical_facts', 'obligations', 'quests', 'facts', 'events']);
  assert.deepEqual(res.items_packed, {
    critical_facts: 1,
    obligations: 1,
    quests: 1,
    facts: 1,
    events: 1
  });
  assert.deepEqual(res.truncated_sections, []);
  assert.ok(res.context_text.includes('### System Instructions'));
  assert.ok(res.context_text.includes('### Safety-Critical Constraints'));
  assert.ok(res.context_text.includes('Severe allergy to penicillin'));
  assert.ok(res.context_text.includes('### Active Obligations & Deadlines'));
  assert.ok(res.context_text.includes('Medication refill'));
  assert.ok(res.context_text.includes('### Daily Quests & Priorities'));
  assert.ok(res.context_text.includes('Verify offline local models'));
  assert.ok(res.context_text.includes('### Contextual Facts & Preferences'));
  assert.ok(res.context_text.includes('Prefers dark theme interfaces'));
  assert.ok(res.context_text.includes('### Recent Local Activity'));
  assert.ok(res.context_text.includes('Local backup created'));
  assert.equal(typeof res.prefix_fingerprint, 'string');
  assert.equal(res.prefix_fingerprint.length, 14);
});

test('assembleTokenBudgetedContext prioritizes topic_focus when ordering contextual facts', () => {
  const sampleState = {
    topics: ['health'],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [
      { id: 'fact-1', category: 'other', statement: 'Bicycle tire pressure is 60psi', critical: false, at: '2026-10-12T00:00:00Z' },
      { id: 'fact-2', category: 'medical', statement: 'Resting heart rate target 65bpm for cardio health', critical: false, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [],
    values: DEFAULT_VALUES
  };

  const res = assembleTokenBudgetedContext(sampleState, {
    budget_tokens: 2048,
    topic_focus: ['health']
  });

  assert.equal(res.ok, true);
  const factIdxHealth = res.context_text.indexOf('Resting heart rate target 65bpm');
  const factIdxBike = res.context_text.indexOf('Bicycle tire pressure is 60psi');
  assert.ok(factIdxHealth !== -1 && factIdxBike !== -1);
  assert.ok(factIdxHealth < factIdxBike, 'Health fact should precede non-health fact when topic_focus is health');
});

test('assembleTokenBudgetedContext preserves critical constraints and truncates lower sections when budget is constrained', () => {
  const sampleState = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [
      { id: 'ev-1', at: '2026-10-12T00:00:00Z', type: 'data_exported', detail: 'Event 1' },
      { id: 'ev-2', at: '2026-10-12T00:00:00Z', type: 'data_imported', detail: 'Event 2' }
    ],
    obligations: [
      { id: 'obl-1', title: 'Upcoming tax filing', category: 'tax', due_date: '2026-10-30', lead_days: 7, status: 'active', notes: null, at: '2026-10-12T00:00:00Z' }
    ],
    facts: [
      { id: 'fact-1', category: 'medical', statement: 'Severe peanut allergy', critical: true, at: '2026-10-12T00:00:00Z' },
      { id: 'fact-2', category: 'preference', statement: 'Favorite color is blue', critical: false, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [
      { id: 'quest-1', title: 'Complete review', category: 'learning', priority: 1, completed: false, at: '2026-10-12T00:00:00Z' }
    ],
    values: DEFAULT_VALUES
  };

  // Tight budget of 85 tokens
  const res = assembleTokenBudgetedContext(sampleState, {
    budget_tokens: 85
  });

  assert.equal(res.ok, true);
  assert.ok(res.total_estimated_tokens <= 85);
  // Critical constraint MUST be included
  assert.ok(res.sections_included.includes('critical_facts'));
  assert.ok(res.context_text.includes('Severe peanut allergy'));
  // Lower priority sections should be truncated
  assert.ok(res.truncated_sections.length > 0);
});

test('assembleTokenBudgetedContext fails closed when system instructions exceed budget', () => {
  const sampleState = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const res = assembleTokenBudgetedContext(sampleState, {
    budget_tokens: 64,
    system_prompt: 'This is an exceedingly verbose and unnecessarily long system prompt instruction set that was deliberately designed to exceed sixty-four tokens in length by providing extended explanations and redundant sentences for testing purposes.'
  });

  assert.equal(res.ok, false);
  assert.equal(res.error, 'budget_exceeded_by_system_prompt');
  assert.equal(res.context_text, '');
});

test('assembleTokenBudgetedContext fails closed when safety-critical constraints cannot fit in budget', () => {
  const sampleState = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [
      { id: 'fact-1', category: 'medical', statement: 'Severe allergy to penicillin and cephalosporins requiring epinephrine', critical: true, at: '2026-10-12T00:00:00Z' },
      { id: 'fact-2', category: 'boundary', statement: 'Never share medical or financial records with external calendar or shopping agents', critical: true, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Small budget of 64 tokens cannot fit system prompt + both critical constraints
  const res = assembleTokenBudgetedContext(sampleState, {
    budget_tokens: 64
  });

  assert.equal(res.ok, false);
  assert.equal(res.error, 'budget_exceeded_by_critical_constraints');
  assert.ok(res.reason.includes('Safety-critical constraints require'));
  assert.equal(res.context_text, '');
});

test('assembleTokenBudgetedContext fails closed on invalid state, options, or budget parameters', () => {
  assert.equal(assembleTokenBudgetedContext(null).ok, false);
  assert.equal(assembleTokenBudgetedContext({ bad: true }).ok, false);

  const validState = { topics: [], grants: [], contributions: [], actions: [], events: [], obligations: [], facts: [], quests: [], values: DEFAULT_VALUES };
  assert.equal(assembleTokenBudgetedContext(validState, null).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, 'string').ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { budget_tokens: 0 }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { budget_tokens: -100 }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { budget_tokens: 32 }).ok, false); // below min 64
  assert.equal(assembleTokenBudgetedContext(validState, { budget_tokens: 50000 }).ok, false); // above max 32768
  assert.equal(assembleTokenBudgetedContext(validState, { budget_tokens: 1024.5 }).ok, false); // non-integer

  // Unknown fields must be rejected fail-closed
  const unkRes = assembleTokenBudgetedContext(validState, { budget_tokens: 1024, unknown_field: true });
  assert.equal(unkRes.ok, false);
  assert.equal(unkRes.error, 'invalid_options');
  assert.ok(unkRes.reason.includes('Unknown field'));

  // Invalid option types must be rejected fail-closed
  assert.equal(assembleTokenBudgetedContext(validState, { as_of_date: 'not-a-date' }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { topic_focus: 'health' }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { topic_focus: [123] }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { include_facts: 'true' }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { include_obligations: 0 }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { max_events: -1 }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { max_events: 1.5 }).ok, false);
  assert.equal(assembleTokenBudgetedContext(validState, { system_prompt: 12345 }).ok, false);
});

test('assembleTokenBudgetedContext strictly respects budget invariant and guarantees prefix fingerprint matches context', () => {
  const sampleState = {
    topics: ['health'],
    grants: [],
    contributions: [],
    actions: [],
    events: [
      { id: 'ev-1', at: '2026-10-12T00:00:00Z', type: 'data_exported', detail: 'Event 1' }
    ],
    obligations: [
      { id: 'obl-1', title: 'Task deadline', category: 'renewal', due_date: '2026-10-20', lead_days: 7, status: 'active', notes: null, at: '2026-10-12T00:00:00Z' }
    ],
    facts: [
      { id: 'f-1', category: 'medical', statement: 'Penicillin allergy', critical: true, at: '2026-10-12T00:00:00Z' },
      { id: 'f-2', category: 'preference', statement: 'Prefers quiet mornings', critical: false, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [
      { id: 'q-1', title: 'Review code', category: 'learning', priority: 1, completed: false, at: '2026-10-12T00:00:00Z' }
    ],
    values: DEFAULT_VALUES
  };

  // Test across tight boundary budgets
  for (let b = 64; b <= 200; b += 7) {
    const res = assembleTokenBudgetedContext(sampleState, { budget_tokens: b });
    if (res.ok) {
      assert.ok(res.total_estimated_tokens <= res.budget_tokens, `Tokens (${res.total_estimated_tokens}) must never exceed budget (${res.budget_tokens})`);
      assert.ok(res.remaining_tokens >= 0);
      assert.equal(res.remaining_tokens, res.budget_tokens - res.total_estimated_tokens);
    }
  }

  // Verify prefix fingerprint matches context_text prefix
  const res = assembleTokenBudgetedContext(sampleState, { budget_tokens: 1024 });
  assert.equal(res.ok, true);
  const sysSection = "### System Instructions\nYou are a personal twin assistant operating strictly within the person's local browser device.\n";
  const critSection = "### Safety-Critical Constraints\n- [CRITICAL MEDICAL] Penicillin allergy\n";
  const expectedPrefix = [sysSection, critSection].join('\n');
  assert.ok(res.context_text.startsWith(expectedPrefix), 'context_text must start with exact prefix');
  assert.equal(computeContextFingerprint(expectedPrefix), res.prefix_fingerprint);
});

test('assembleTokenBudgetedContext result is deeply frozen and deterministic', () => {
  const sampleState = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [{ id: 'f-1', category: 'medical', statement: 'Asthma inhaler in desk', critical: true, at: '2026-10-12T00:00:00Z' }],
    quests: [],
    values: DEFAULT_VALUES
  };

  const res1 = assembleTokenBudgetedContext(sampleState, { budget_tokens: 1024 });
  const res2 = assembleTokenBudgetedContext(sampleState, { budget_tokens: 1024 });

  assert.equal(Object.isFrozen(res1), true);
  assert.equal(Object.isFrozen(res1.sections_included), true);
  assert.equal(Object.isFrozen(res1.items_packed), true);
  assert.equal(Object.isFrozen(res1.truncated_sections), true);
  assert.equal(res1.context_text, res2.context_text);
  assert.equal(res1.prefix_fingerprint, res2.prefix_fingerprint);
  assert.equal(res1.total_estimated_tokens, res2.total_estimated_tokens);
});

test('ALLOWED_TOOL_KINDS, SENSITIVE_TAINT_KEYWORDS, and EGRESS_ACTION_KEYWORDS are deeply frozen constants', () => {
  assert.equal(Object.isFrozen(ALLOWED_TOOL_KINDS), true);
  assert.ok(ALLOWED_TOOL_KINDS.includes('read'));
  assert.ok(ALLOWED_TOOL_KINDS.includes('write'));
  assert.ok(ALLOWED_TOOL_KINDS.includes('egress'));
  assert.ok(ALLOWED_TOOL_KINDS.includes('delete'));

  assert.equal(Object.isFrozen(SENSITIVE_TOPIC_KEYWORDS), true);
  assert.equal(Object.isFrozen(SENSITIVE_TAINT_KEYWORDS), true);
  assert.ok(SENSITIVE_TOPIC_KEYWORDS.includes('medical'));
  assert.ok(SENSITIVE_TOPIC_KEYWORDS.includes('passport'));
  assert.ok(SENSITIVE_TOPIC_KEYWORDS.includes('password'));

  assert.equal(Object.isFrozen(EGRESS_ACTION_KEYWORDS), true);
  assert.ok(EGRESS_ACTION_KEYWORDS.includes('send'));
  assert.ok(EGRESS_ACTION_KEYWORDS.includes('post'));
  assert.ok(EGRESS_ACTION_KEYWORDS.includes('webhook'));
});

test('auditToolExecutionChain passes for valid authorized tool chain without taint or constraint violation', () => {
  const state = {
    topics: ['research'],
    grants: [
      { who: 'calendar_agent', what: 'meeting schedule', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' },
      { who: 'calendar_agent', what: 'calendar view', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [
      { id: 'f1', category: 'preference', statement: 'Prefers 30 minute meetings', critical: false, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [],
    values: DEFAULT_VALUES
  };

  const chain = [
    { service: 'calendar_agent', action: 'read calendar view', scope: 'calendar view', kind: 'read' },
    { service: 'calendar_agent', action: 'query meeting schedule', scope: 'meeting schedule', kind: 'read' }
  ];

  const result = auditToolExecutionChain(state, chain, { as_of_time: '2026-10-12T00:00:00Z' });
  assert.equal(result.allowed, true);
  assert.equal(result.verdict, 'pass');
  assert.equal(result.risk_level, 'low');
  assert.equal(result.tainted, false);
  assert.equal(result.violations_count, 0);
  assert.equal(result.step_evaluations.length, 2);
  assert.equal(result.step_evaluations[0].verdict, 'pass');
  assert.equal(result.step_evaluations[1].verdict, 'pass');
});

test('auditToolExecutionChain blocks when any step touches a critical memory constraint', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'health_bot', what: 'health records', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [
      { id: 'f1', category: 'medical', statement: 'Severe penicillin allergy', critical: true, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [],
    values: DEFAULT_VALUES
  };

  const chain = [
    { service: 'health_bot', action: 'check health records', scope: 'health records', kind: 'read' },
    { service: 'health_bot', action: 'prescribe penicillin antibiotic', scope: 'health records', kind: 'write' }
  ];

  const result = auditToolExecutionChain(state, chain, { as_of_time: '2026-10-12T00:00:00Z' });
  assert.equal(result.allowed, false);
  assert.equal(result.verdict, 'block');
  assert.equal(result.risk_level, 'high');
  assert.ok(result.violations_count >= 1);
  assert.equal(result.step_evaluations[1].verdict, 'block');
  assert.ok(result.reasons.some(r => r.includes('Severe penicillin allergy') || r.includes('penicillin')));
});

test('auditToolExecutionChain detects cross-step sensitive taint and blocks unconsented egress', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'internal_assistant', what: 'medical notes', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' },
      { who: 'cloud_sync', what: 'general backup', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [
      { id: 'f1', category: 'medical', statement: 'Cardiovascular medication schedule', critical: true, at: '2026-10-12T00:00:00Z' }
    ],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Step 1 reads medical data (taints the chain with medical/health)
  // Step 2 attempts to send / egress to cloud_sync (which lacks a medical consent grant)
  const chain = [
    { service: 'internal_assistant', action: 'read medical notes', scope: 'medical notes', kind: 'read' },
    { service: 'cloud_sync', action: 'post backup to webhook', scope: 'general backup', kind: 'egress' }
  ];

  const result = auditToolExecutionChain(state, chain, { as_of_time: '2026-10-12T00:00:00Z', strict_taint: true });
  assert.equal(result.allowed, false);
  assert.equal(result.verdict, 'block');
  assert.equal(result.risk_level, 'high');
  assert.equal(result.tainted, true);
  assert.ok(result.taints.includes('medical') || result.taints.some(t => t.includes('constraint_medical')));
  assert.equal(result.step_evaluations[1].verdict, 'block');
  assert.ok(result.reasons.some(r => r.includes('transmits external egress') && (r.includes('sensitive-topic flow') || r.includes('sensitive taint'))));
});

test('auditToolExecutionChain allows egress when destination service has an explicit grant covering tainted scope', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'internal_assistant', what: 'medical records', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' },
      { who: 'clinic_portal', what: 'medical', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const chain = [
    { service: 'internal_assistant', action: 'read medical records', scope: 'medical records', kind: 'read' },
    { service: 'clinic_portal', action: 'transmit summary to clinic', scope: 'medical', kind: 'egress' }
  ];

  const result = auditToolExecutionChain(state, chain, { as_of_time: '2026-10-12T00:00:00Z' });
  assert.equal(result.allowed, true);
  assert.equal(result.verdict, 'pass');
  assert.equal(result.tainted, true);
  assert.ok(result.taints.includes('medical'));
});

test('auditToolExecutionChain blocks ungranted high-consequential operations and requires confirmation for low-risk ungranted', () => {
  const state = {
    topics: [],
    grants: [],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // High consequential risk ungranted: delete database
  const highRiskChain = [
    { service: 'cleanup_bot', action: 'delete all logs and wipe storage', scope: 'storage', kind: 'delete' }
  ];
  const highRes = auditToolExecutionChain(state, highRiskChain);
  assert.equal(highRes.allowed, false);
  assert.equal(highRes.verdict, 'block');
  assert.equal(highRes.risk_level, 'high');

  // Low consequential risk ungranted: read calendar
  const lowRiskChain = [
    { service: 'calendar_bot', action: 'read view status', scope: 'view status', kind: 'read' }
  ];
  const lowRes = auditToolExecutionChain(state, lowRiskChain);
  assert.equal(lowRes.allowed, false);
  assert.equal(lowRes.verdict, 'require_confirmation');
  assert.equal(lowRes.risk_level, 'medium');
});

test('auditToolExecutionChain fails closed on invalid parameters, malformed steps, or unknown options', () => {
  const state = { ...DEFAULT_TWIN_STATE };

  // Invalid state
  assert.equal(auditToolExecutionChain(null, [{ service: 'a', action: 'b' }]).verdict, 'block');
  assert.equal(auditToolExecutionChain({ unknown: 1 }, [{ service: 'a', action: 'b' }]).verdict, 'block');

  // Invalid options
  assert.equal(auditToolExecutionChain(state, [{ service: 'a', action: 'b' }], 'not-obj').verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 'a', action: 'b' }], { unknown_opt: true }).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 'a', action: 'b' }], { max_steps: 0 }).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 'a', action: 'b' }], { max_steps: 25 }).verdict, 'block');

  // Invalid chain array
  assert.equal(auditToolExecutionChain(state, null).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, []).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, new Array(15).fill({ service: 's', action: 'a' }), { max_steps: 10 }).verdict, 'block');

  // Malformed step items
  assert.equal(auditToolExecutionChain(state, [null]).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 's' }]).verdict, 'block'); // missing action
  assert.equal(auditToolExecutionChain(state, [{ action: 'a' }]).verdict, 'block'); // missing service
  assert.equal(auditToolExecutionChain(state, [{ service: '', action: 'a' }]).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 's', action: '' }]).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 's', action: 'a', extra: 123 }]).verdict, 'block'); // unknown field
  assert.equal(auditToolExecutionChain(state, [{ service: 's', action: 'a', kind: 'invalid_kind' }]).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 's', action: 'a', scope: 'x'.repeat(85) }]).verdict, 'block');
  assert.equal(auditToolExecutionChain(state, [{ service: 's', action: 'a', context: 'x'.repeat(205) }]).verdict, 'block');
});

test('summarizeChainAudit aggregates results and handles invalid inputs fail-closed', () => {
  // Invalid inputs
  const sumNull = summarizeChainAudit(null);
  assert.equal(sumNull.verdict, 'block');
  assert.equal(sumNull.allowed, false);
  assert.equal(sumNull.total_steps, 0);

  const mockAudit = {
    allowed: true,
    verdict: 'pass',
    risk_level: 'low',
    tainted: true,
    taints: ['medical'],
    step_evaluations: [
      { step_index: 1, verdict: 'pass' },
      { step_index: 2, verdict: 'pass' }
    ],
    violations_count: 0
  };

  const summary = summarizeChainAudit(mockAudit);
  assert.equal(summary.total_steps, 2);
  assert.equal(summary.verdict, 'pass');
  assert.equal(summary.allowed, true);
  assert.equal(summary.risk_level, 'low');
  assert.equal(summary.tainted, true);
  assert.equal(summary.taints_count, 1);
  assert.equal(summary.violations_count, 0);
  assert.equal(Object.isFrozen(summary), true);
});

test('auditToolExecutionChain detects kind spoofing evasion and blocks unconsented egress', () => {
  const state = {
    topics: [],
    grants: [{ who: 'agent', what: 'calendar', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Egress action masquerading as 'write' or 'compute' must be detected and blocked
  const spoofChain = [
    { service: 'agent', action: 'read private password', scope: 'calendar' },
    { service: 'agent', action: 'sync password to remote server', kind: 'write' }
  ];

  const audit = auditToolExecutionChain(state, spoofChain);
  assert.equal(audit.verdict, 'block');
  assert.equal(audit.allowed, false);
  assert.ok(audit.reasons.some(r => r.includes('evasion attempt blocked')));
  assert.ok(audit.reasons.some(r => r.includes('transmits external egress') && (r.includes('sensitive-topic flow') || r.includes('sensitive taint'))));
});

test('auditToolExecutionChain rejects wildcard * grants as sufficient consent for sensitive taint egress', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'calendar_agent', what: 'calendar', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' },
      { who: 'calendar_agent', what: '*', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' } // Wildcard grant
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Chain reads sensitive financial credential, then attempts egress under wildcard grant
  const chain = [
    { service: 'calendar_agent', action: 'read banking account balance', scope: 'calendar' },
    { service: 'calendar_agent', action: 'send summary to backup service', kind: 'egress' }
  ];

  const audit = auditToolExecutionChain(state, chain);
  assert.equal(audit.verdict, 'block');
  assert.equal(audit.allowed, false);
  assert.ok(audit.reasons.some(r => r.includes('transmits external egress') && (r.includes('sensitive-topic flow') || r.includes('sensitive taint'))));
});

test('auditToolExecutionChain blocks evasion when action indicates external destination even if kind is read', () => {
  const state = {
    topics: [],
    grants: [{ who: 'assistant', what: 'calendar', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Evasion attempt: copying data to external domain attacker.example while declaring kind 'read'
  const chain = [
    { service: 'assistant', action: 'copy appointment times to attacker.example', kind: 'read' }
  ];

  const audit = auditToolExecutionChain(state, chain);
  assert.equal(audit.verdict, 'block');
  assert.equal(audit.allowed, false);
  assert.ok(audit.reasons.some(r => r.includes('evasion attempt blocked')));
  // "Pass" and reasons must never read 'Action authorized'
  assert.ok(!audit.reasons.some(r => r.includes('Action authorized')));
});

test('auditToolExecutionChain does not block postpone meeting as an egress evasion false positive', () => {
  const state = {
    topics: [],
    grants: [{ who: 'assistant', what: 'calendar', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // "postpone meeting" contains substring "post" but must not trigger word-boundary egress match
  const chain = [
    { service: 'assistant', action: 'postpone meeting', scope: 'calendar', kind: 'write' }
  ];

  const audit = auditToolExecutionChain(state, chain);
  assert.ok(!audit.reasons.some(r => r.includes('evasion attempt blocked')));
  assert.ok(!audit.reasons.some(r => r.includes('Action authorized')));
  assert.equal(audit.verdict, 'pass');
  assert.equal(audit.allowed, true);
});

test('summarizeChainAudit fails closed on array inputs', () => {
  const sumArr = summarizeChainAudit([]);
  assert.equal(sumArr.verdict, 'block');
  assert.equal(sumArr.allowed, false);
  assert.equal(sumArr.violations_count, 1);
});

test('auditToolExecutionChain output is deeply frozen and deterministic', () => {
  const state = {
    topics: [],
    grants: [{ who: 'assistant', what: 'calendar', at: '2026-10-12T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const chain = [{ service: 'assistant', action: 'read calendar', scope: 'calendar' }];

  const res1 = auditToolExecutionChain(state, chain);
  const res2 = auditToolExecutionChain(state, chain);

  assert.equal(Object.isFrozen(res1), true);
  assert.equal(Object.isFrozen(res1.taints), true);
  assert.equal(Object.isFrozen(res1.step_evaluations), true);
  assert.equal(Object.isFrozen(res1.reasons), true);
  assert.equal(res1.verdict, res2.verdict);
  assert.equal(res1.allowed, res2.allowed);
  assert.equal(res1.risk_level, res2.risk_level);
  assert.equal(res1.tainted, res2.tainted);
});

test('ALLOWED_RECEIPT_FIELDS is deeply frozen and contains standard fields', () => {
  assert.equal(Object.isFrozen(ALLOWED_RECEIPT_FIELDS), true);
  assert.ok(ALLOWED_RECEIPT_FIELDS.includes('receipt_version'));
  assert.ok(ALLOWED_RECEIPT_FIELDS.includes('subject'));
  assert.ok(ALLOWED_RECEIPT_FIELDS.includes('recipient'));
  assert.ok(ALLOWED_RECEIPT_FIELDS.includes('purposes_and_scopes'));
  assert.ok(ALLOWED_RECEIPT_FIELDS.includes('timestamp'));
  assert.ok(ALLOWED_RECEIPT_FIELDS.includes('expires_at'));
  assert.ok(ALLOWED_RECEIPT_FIELDS.includes('status'));
});

test('verifyConsentReceipt matches a receipt this device issued for an active grant', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'dentist', what: 'appointment times', at: '2026-10-10T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const receipt = createConsentReceipt(state.grants[0]);
  const res = verifyConsentReceipt(state, receipt, '2026-10-12T00:00:00Z');

  assert.equal(res.valid, true);
  assert.equal(res.status, 'matches_active_grant');
  assert.ok(res.reason.includes('Receipt matches an active grant on this device'));
  assert.equal(res.recipient, 'dentist');
  assert.deepEqual(res.scopes, ['appointment times']);
  assert.equal(res.matching_grant.who, 'dentist');
  assert.equal(Object.isFrozen(res), true);
  assert.equal(Object.isFrozen(res.scopes), true);
  assert.equal(Object.isFrozen(res.matching_grant), true);
});

test('verifyConsentReceipt supports multi-scope grants and wildcard * grants', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'health-app', what: '*', at: '2026-10-10T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const receipt = {
    receipt_version: 'ISO-27560:2023-compatible',
    subject: 'local-user',
    recipient: 'health-app',
    purposes_and_scopes: ['blood_pressure', 'heart_rate'],
    timestamp: '2026-10-10T00:00:00Z',
    expires_at: null,
    status: 'granted',
    jurisdiction_or_policy: 'Local device sovereignty (client-side only)'
  };

  const res = verifyConsentReceipt(state, receipt);
  assert.equal(res.valid, true);
  assert.equal(res.status, 'matches_active_grant');
  assert.equal(res.recipient, 'health-app');
});

test('verifyConsentReceipt fails closed when receipt is expired', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'dentist', what: 'records', at: '2026-01-01T00:00:00Z', expires_at: '2026-06-01T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const receipt = {
    receipt_version: 'ISO-27560:2023-compatible',
    subject: 'local-user',
    recipient: 'dentist',
    purposes_and_scopes: ['records'],
    timestamp: '2026-01-01T00:00:00Z',
    expires_at: '2026-06-01T00:00:00Z',
    status: 'expired'
  };

  const res = verifyConsentReceipt(state, receipt, '2026-10-12T00:00:00Z');
  assert.equal(res.valid, false);
  assert.equal(res.status, 'expired');
  assert.ok(res.reason.includes('Receipt has expired'));
});

test('verifyConsentReceipt fails closed when matching local grant was revoked', () => {
  const state = {
    topics: [],
    grants: [], // grant was revoked
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const receipt = {
    receipt_version: 'ISO-27560:2023-compatible',
    subject: 'local-user',
    recipient: 'clinic',
    purposes_and_scopes: ['medical_history'],
    timestamp: '2026-10-01T00:00:00Z',
    expires_at: '2026-12-31T00:00:00Z',
    status: 'granted'
  };

  const res = verifyConsentReceipt(state, receipt, '2026-10-12T00:00:00Z');
  assert.equal(res.valid, false);
  assert.equal(res.status, 'revoked_or_unregistered');
  assert.ok(res.reason.includes('No grant on this device issued this receipt'));
});

test('verifyConsentReceipt fails closed on scope mismatch', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'dentist', what: 'appointment times', at: '2026-10-10T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  const receipt = {
    receipt_version: 'ISO-27560:2023-compatible',
    subject: 'local-user',
    recipient: 'dentist',
    purposes_and_scopes: ['appointment times', 'billing_records'], // billing_records not in grant
    timestamp: '2026-10-10T00:00:00Z',
    expires_at: null,
    status: 'granted'
  };

  const res = verifyConsentReceipt(state, receipt);
  assert.equal(res.valid, false);
  assert.equal(res.status, 'scope_mismatch');
  assert.ok(res.reason.includes('does not authorize all scopes'));
});

test('verifyConsentReceipt rejects unknown fields and malformed structures fail-closed', () => {
  const state = {
    topics: [],
    grants: [
      { who: 'service', what: 'scope1', at: '2026-10-10T00:00:00Z' }
    ],
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };

  // Unknown fields
  const unkRes = verifyConsentReceipt(state, {
    receipt_version: 'ISO-27560:2023-compatible',
    subject: 'local-user',
    recipient: 'service',
    purposes_and_scopes: ['scope1'],
    timestamp: '2026-10-10T00:00:00Z',
    hacker: 'payload'
  });
  assert.equal(unkRes.valid, false);
  assert.equal(unkRes.status, 'unknown_fields');

  // Non-objects and arrays
  assert.equal(verifyConsentReceipt(state, null).status, 'malformed_receipt');
  assert.equal(verifyConsentReceipt(state, 'string').status, 'malformed_receipt');
  assert.equal(verifyConsentReceipt(state, []).status, 'malformed_receipt');

  // Missing or bad fields
  assert.equal(verifyConsentReceipt(state, { subject: 'u' }).status, 'malformed_receipt');
  assert.equal(verifyConsentReceipt(state, {
    receipt_version: 'v',
    subject: 'u',
    recipient: 'r',
    purposes_and_scopes: [],
    timestamp: '2026-10-10T00:00:00Z'
  }).status, 'malformed_receipt');

  // Bad timestamp
  assert.equal(verifyConsentReceipt(state, {
    receipt_version: 'v',
    subject: 'u',
    recipient: 'r',
    purposes_and_scopes: ['s'],
    timestamp: 'not-a-date'
  }).status, 'malformed_receipt');

  // Bad asOfTime
  const badTime = verifyConsentReceipt(state, {
    receipt_version: 'v',
    subject: 'u',
    recipient: 'r',
    purposes_and_scopes: ['s'],
    timestamp: '2026-10-10T00:00:00Z'
  }, 'not-a-date');
  assert.equal(badTime.status, 'invalid_parameter');

  // Invalid state
  assert.equal(verifyConsentReceipt({ bad_state: true }, {}).status, 'invalid_state');
});

function receiptState(grants) {
  return {
    topics: [],
    grants,
    contributions: [],
    actions: [],
    events: [],
    obligations: [],
    facts: [],
    quests: [],
    values: DEFAULT_VALUES
  };
}

test('verifyConsentReceipt rejects a hand-written receipt this device never issued', () => {
  const state = receiptState([
    { who: 'dentist', what: 'appointment times', at: '2026-10-01T00:00:00Z', expires_at: null }
  ]);
  const base = {
    receipt_version: 'x',
    subject: 'local-user',
    recipient: 'Dentist',
    purposes_and_scopes: ['appointment times'],
    timestamp: '2026-10-01T00:00:00Z',
    expires_at: null
  };
  const asOf = '2026-10-12T00:00:00Z';

  // The audit probe: another subject, dated 2099.
  const probe = verifyConsentReceipt(state, { ...base, subject: 'someone-else', timestamp: '2099-01-01T00:00:00Z' }, asOf);
  assert.equal(probe.valid, false);

  const future = verifyConsentReceipt(state, { ...base, timestamp: '2026-11-01T00:00:00Z' }, asOf);
  assert.equal(future.valid, false);
  assert.equal(future.status, 'future_timestamp');

  const otherSubject = verifyConsentReceipt(state, { ...base, subject: 'someone-else' }, asOf);
  assert.equal(otherSubject.valid, false);
  assert.equal(otherSubject.status, 'subject_mismatch');

  const wrongTime = verifyConsentReceipt(state, { ...base, timestamp: '2026-10-02T00:00:00Z' }, asOf);
  assert.equal(wrongTime.valid, false);
  assert.equal(wrongTime.status, 'revoked_or_unregistered');

  const wrongExpiry = verifyConsentReceipt(state, { ...base, expires_at: '2027-01-01T00:00:00Z' }, asOf);
  assert.equal(wrongExpiry.valid, false);
  assert.equal(wrongExpiry.status, 'revoked_or_unregistered');

  assert.equal(verifyConsentReceipt(state, base, asOf).valid, true);
  assert.equal(verifyConsentReceipt(state, base, asOf, '').status, 'invalid_parameter');
});

test('verifyConsentReceipt round trip: an issued receipt matches until its grant is revoked or expires', () => {
  const grant = { who: 'clinic', what: 'medication list, allergies', at: '2026-10-05T12:00:00Z', expires_at: '2026-11-05T12:00:00Z' };
  const receipt = createConsentReceipt(grant);
  const before = receiptState([grant]);

  const ok = verifyConsentReceipt(before, receipt, '2026-10-12T00:00:00Z');
  assert.equal(ok.valid, true);
  assert.equal(ok.status, 'matches_active_grant');

  const revoked = verifyConsentReceipt(receiptState([]), receipt, '2026-10-12T00:00:00Z');
  assert.equal(revoked.valid, false);
  assert.equal(revoked.status, 'revoked_or_unregistered');

  const expired = verifyConsentReceipt(before, receipt, '2026-11-06T00:00:00Z');
  assert.equal(expired.valid, false);
  assert.equal(expired.status, 'expired');

  // A custom subject must be checked with the same subject.
  const named = createConsentReceipt(grant, 'alex');
  assert.equal(verifyConsentReceipt(before, named, '2026-10-12T00:00:00Z').status, 'subject_mismatch');
  assert.equal(verifyConsentReceipt(before, named, '2026-10-12T00:00:00Z', 'alex').valid, true);
});

test('summarizeReceiptVerification handles valid, invalid, and malformed inputs fail-closed', () => {
  const validRes = {
    valid: true,
    status: 'matches_active_grant',
    reason: 'Receipt matches an active grant on this device',
    recipient: 'dentist',
    scopes: ['appointment times']
  };
  const sumValid = summarizeReceiptVerification(validRes);
  assert.equal(sumValid.valid, true);
  assert.equal(sumValid.status, 'matches_active_grant');
  assert.equal(sumValid.recipient, 'dentist');
  assert.equal(sumValid.scopes_count, 1);
  assert.equal(Object.isFrozen(sumValid), true);

  const sumBad = summarizeReceiptVerification(null);
  assert.equal(sumBad.valid, false);
  assert.equal(sumBad.status, 'error');
  assert.equal(sumBad.recipient, null);
  assert.equal(sumBad.scopes_count, 0);

  const sumArr = summarizeReceiptVerification([]);
  assert.equal(sumArr.valid, false);
  assert.equal(sumArr.status, 'error');
});

test('ALLOWED_CAPABILITY_REQUEST_FIELDS and ALLOWED_CAPABILITY_LEASE_FIELDS are deeply frozen', () => {
  assert.equal(Object.isFrozen(ALLOWED_CAPABILITY_REQUEST_FIELDS), true);
  assert.equal(Object.isFrozen(ALLOWED_CAPABILITY_LEASE_FIELDS), true);
  assert.ok(ALLOWED_CAPABILITY_REQUEST_FIELDS.includes('grantee'));
  assert.ok(ALLOWED_CAPABILITY_REQUEST_FIELDS.includes('ttl_seconds'));
  assert.ok(ALLOWED_CAPABILITY_LEASE_FIELDS.includes('lease_id'));
  assert.ok(ALLOWED_CAPABILITY_LEASE_FIELDS.includes('expires_at'));
});

test('evaluateCapabilityAdjustmentRequest succeeds for valid non-consequential request with active grant and generates frozen lease', () => {
  const state = {
    ...DEFAULT_TWIN_STATE,
    grants: [
      {
        who: 'calendar assistant',
        what: 'meeting schedule',
        at: '2026-10-01T00:00:00Z',
        expires_at: '2026-11-01T00:00:00Z'
      }
    ],
    facts: [
      {
        id: 'fact-1',
        category: 'medical',
        statement: 'Severe allergy to penicillin',
        critical: true,
        at: '2026-10-01T00:00:00Z'
      }
    ]
  };

  const req = {
    grantee: 'calendar assistant',
    requested_scope: 'meeting schedule',
    purpose: 'Need to sync group calendar', // tests stop-word "to" does not collide with "allergy to"
    ttl_seconds: 900,
    as_of_time: '2026-10-12T12:00:00Z'
  };

  const res = evaluateCapabilityAdjustmentRequest(state, req);
  assert.equal(res.allowed, true);
  assert.equal(res.verdict, 'within_grant');
  assert.equal(res.conflicting_constraint, null);
  assert.ok(res.lease);
  assert.equal(res.lease.grantee, 'calendar assistant');
  assert.equal(res.lease.scope, 'meeting schedule');
  assert.equal(res.lease.ttl_seconds, 900);
  assert.equal(res.lease.status, 'active');
  assert.equal(res.lease.issued_at, '2026-10-12T12:00:00.000Z');
  assert.equal(res.lease.expires_at, '2026-10-12T12:15:00.000Z');
  assert.ok(res.lease.lease_id.startsWith('lease-'));
  assert.equal(Object.isFrozen(res), true);
  assert.equal(Object.isFrozen(res.lease), true);
});

test('evaluateCapabilityAdjustmentRequest marks ungranted assistant as requires_confirmation', () => {
  const state = { ...DEFAULT_TWIN_STATE, grants: [] };
  const req = {
    grantee: 'unregistered bot',
    requested_scope: 'calendar events',
    purpose: 'Inspect events',
    ttl_seconds: 600
  };

  const res = evaluateCapabilityAdjustmentRequest(state, req);
  assert.equal(res.allowed, false);
  assert.equal(res.verdict, 'requires_confirmation');
  assert.ok(res.reason.includes('no active permission'));
  assert.equal(res.lease.status, 'pending_confirmation');
});

test('evaluateCapabilityAdjustmentRequest marks high consequential risk actions as requires_confirmation', () => {
  const state = {
    ...DEFAULT_TWIN_STATE,
    grants: [{ who: 'cleanup tool', what: 'scratch cache', at: '2026-10-01T00:00:00Z' }]
  };
  const req = {
    grantee: 'cleanup tool',
    requested_scope: 'delete scratch files',
    purpose: 'Remove obsolete temporary cache',
    ttl_seconds: 300,
    as_of_time: '2026-10-12T12:00:00Z'
  };

  const res = evaluateCapabilityAdjustmentRequest(state, req);
  assert.equal(res.allowed, false);
  assert.equal(res.verdict, 'requires_confirmation');
  assert.ok(res.lease);
  assert.equal(res.lease.status, 'pending_confirmation');
});

test('evaluateCapabilityAdjustmentRequest blocks capability requests that conflict with safety-critical constraints', () => {
  const state = {
    ...DEFAULT_TWIN_STATE,
    grants: [{ who: 'health bot', what: 'medical data', at: '2026-10-01T00:00:00Z' }],
    facts: [
      {
        id: 'fact-1',
        category: 'medical',
        statement: 'Severe allergy to penicillin',
        critical: true,
        at: '2026-10-01T00:00:00Z'
      }
    ]
  };

  const req = {
    grantee: 'health bot',
    requested_scope: 'prescribe penicillin antibiotic',
    purpose: 'Treat bacterial infection',
    ttl_seconds: 600,
    as_of_time: '2026-10-12T12:00:00Z'
  };

  const res = evaluateCapabilityAdjustmentRequest(state, req);
  assert.equal(res.allowed, false);
  assert.equal(res.verdict, 'blocked');
  assert.equal(res.lease, null);
  assert.ok(res.reason.includes('Severe allergy to penicillin'));
  assert.equal(res.conflicting_constraint, 'Severe allergy to penicillin');
});

test('evaluateCapabilityAdjustmentRequest prohibits wildcard * scopes fail-closed', () => {
  const state = { ...DEFAULT_TWIN_STATE };
  const reqWild = {
    grantee: 'broad agent',
    requested_scope: '*',
    purpose: 'Full access to everything',
    ttl_seconds: 600
  };

  const resWild = evaluateCapabilityAdjustmentRequest(state, reqWild);
  assert.equal(resWild.allowed, false);
  assert.equal(resWild.verdict, 'blocked');
  assert.ok(resWild.reason.includes('Wildcard scopes are prohibited'));
});

test('evaluateCapabilityAdjustmentRequest rejects invalid options.max_ttl_seconds fail-closed', () => {
  const state = { ...DEFAULT_TWIN_STATE };
  const baseReq = {
    grantee: 'agent-1',
    requested_scope: 'read logs',
    purpose: 'Inspect recent events'
  };

  assert.equal(evaluateCapabilityAdjustmentRequest(state, baseReq, { max_ttl_seconds: 0 }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, baseReq, { max_ttl_seconds: -10 }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, baseReq, { max_ttl_seconds: '3600' }).verdict, 'blocked');
});

test('evaluateCapabilityAdjustmentRequest rejects non-integer, zero, negative, or excessive TTL fail-closed', () => {
  const state = { ...DEFAULT_TWIN_STATE };
  const baseReq = {
    grantee: 'agent-1',
    requested_scope: 'read logs',
    purpose: 'Inspect recent events'
  };

  assert.equal(evaluateCapabilityAdjustmentRequest(state, { ...baseReq, ttl_seconds: -10 }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { ...baseReq, ttl_seconds: 0 }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { ...baseReq, ttl_seconds: 15.5 }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { ...baseReq, ttl_seconds: '900' }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { ...baseReq, ttl_seconds: 7200 }).verdict, 'blocked');
});

test('evaluateCapabilityAdjustmentRequest rejects unknown fields, non-objects, arrays, and malformed inputs fail-closed', () => {
  const state = { ...DEFAULT_TWIN_STATE };
  assert.equal(evaluateCapabilityAdjustmentRequest(null, {}).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, null).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, []).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { grantee: 'a', requested_scope: 'b', purpose: 'c', unknown_field: 123 }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { grantee: '', requested_scope: 'b', purpose: 'c' }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { grantee: 'a', requested_scope: '', purpose: 'c' }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { grantee: 'a', requested_scope: 'b', purpose: '' }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(state, { grantee: 'a', requested_scope: 'b', purpose: 'c', as_of_time: 'not-date' }).verdict, 'blocked');
});

function issueLease(state, req) {
  const res = evaluateCapabilityAdjustmentRequest(state, req);
  assert.ok(res.lease, 'expected a previewed lease: ' + res.reason);
  return { res, lease: { ...res.lease } };
}

const CAL_STATE = {
  ...DEFAULT_TWIN_STATE,
  grants: [
    {
      who: 'calendar assistant',
      what: 'meeting schedule, calendar events',
      at: '2026-10-01T00:00:00Z',
      expires_at: '2026-11-01T00:00:00Z'
    }
  ]
};
const CAL_REQ = {
  grantee: 'calendar assistant',
  requested_scope: 'meeting schedule',
  purpose: 'Reschedule sync',
  ttl_seconds: 900,
  as_of_time: '2026-10-12T12:00:00Z'
};

test('verifyCapabilityLease passes, as an advisory preview, a lease issued from an active covering grant', () => {
  const { res, lease } = issueLease(CAL_STATE, CAL_REQ);
  assert.equal(res.verdict, 'within_grant');
  assert.equal(res.advisory, true);
  const out = verifyCapabilityLease(CAL_STATE, lease, 'meeting schedule', '2026-10-12T12:05:00Z');
  assert.equal(out.valid, true);
  assert.equal(out.status, 'covered');
  assert.equal(out.advisory, true);
  assert.ok(out.reason.includes('authorizes nothing'));
  assert.equal(Object.isFrozen(out), true);
  assert.equal(Object.isFrozen(out.lease), true);
});

test('a calendar-only grant never admits a medical-notes lease (audit counterexample)', () => {
  const state = {
    ...DEFAULT_TWIN_STATE,
    grants: [{ who: 'helper', what: 'calendar events', at: '2026-10-01T00:00:00Z', expires_at: '2026-11-01T00:00:00Z' }]
  };
  const req = { grantee: 'helper', requested_scope: 'medical notes', purpose: 'Summarize notes', ttl_seconds: 900, as_of_time: '2026-10-12T12:00:00Z' };
  const res = evaluateCapabilityAdjustmentRequest(state, req);
  assert.equal(res.allowed, false);
  assert.equal(res.verdict, 'requires_confirmation');
  assert.ok(res.reason.includes('outside what was allowed'));
  assert.equal(res.lease.status, 'pending_confirmation');
  // Even with its status edited to active, the lease does not verify.
  const edited = { ...res.lease, status: 'active' };
  const out = verifyCapabilityLease(state, edited, 'medical notes', '2026-10-12T12:05:00Z');
  assert.equal(out.valid, false);
  assert.equal(out.status, 'unconfirmed');
  // A combined scope with one uncovered item is also outside the grant.
  const mixed = evaluateCapabilityAdjustmentRequest(state, { ...req, requested_scope: 'calendar events, medical notes' });
  assert.equal(mixed.verdict, 'requires_confirmation');
});

test('a hand-written lease with an invented id and a long expiry does not verify (audit counterexample)', () => {
  const invented = {
    lease_id: 'invented',
    grantee: 'calendar assistant',
    scope: 'meeting schedule',
    purpose: 'Reschedule sync',
    issued_at: '2026-10-12T12:00:00Z',
    expires_at: '2099-01-01T00:00:00Z',
    ttl_seconds: 1,
    status: 'active'
  };
  const out = verifyCapabilityLease(CAL_STATE, invented, 'meeting schedule', '2026-10-12T12:00:00Z');
  assert.equal(out.valid, false);
  assert.equal(out.status, 'malformed_lease');
  // Matching dates but a made-up id is still refused.
  const madeUp = { ...invented, expires_at: '2026-10-12T12:00:01Z' };
  const out2 = verifyCapabilityLease(CAL_STATE, madeUp, 'meeting schedule', '2026-10-12T12:00:00Z');
  assert.equal(out2.valid, false);
  assert.equal(out2.status, 'unrecognized_lease');
});

test('verifyCapabilityLease refuses edited lifetimes, over-maximum TTLs and impossible dates', () => {
  const { lease } = issueLease(CAL_STATE, CAL_REQ);
  assert.equal(verifyCapabilityLease(CAL_STATE, { ...lease, expires_at: '2026-10-12T13:00:00.000Z' }, 'meeting schedule', '2026-10-12T12:05:00Z').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(CAL_STATE, { ...lease, ttl_seconds: 3600, expires_at: '2026-10-12T13:00:00.000Z' }, 'meeting schedule', '2026-10-12T12:05:00Z').status, 'unrecognized_lease');
  assert.equal(verifyCapabilityLease(CAL_STATE, { ...lease, ttl_seconds: 7200, expires_at: '2026-10-12T14:00:00.000Z' }, 'meeting schedule', '2026-10-12T12:05:00Z').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(CAL_STATE, { ...lease, issued_at: '2026-02-30T12:00:00Z' }, 'meeting schedule', '2026-10-12T12:05:00Z').status, 'malformed_lease');
  assert.equal(evaluateCapabilityAdjustmentRequest(CAL_STATE, { ...CAL_REQ, as_of_time: '2026-02-30T12:00:00Z' }).verdict, 'blocked');
  assert.equal(evaluateCapabilityAdjustmentRequest(CAL_STATE, CAL_REQ, { max_ttl_seconds: 7200 }).verdict, 'blocked');
});

test('a lease never outlives the grant it rests on', () => {
  const state = {
    ...DEFAULT_TWIN_STATE,
    grants: [{ who: 'calendar assistant', what: 'meeting schedule', at: '2026-10-01T00:00:00Z', expires_at: '2026-10-12T12:05:00Z' }]
  };
  const { res, lease } = issueLease(state, CAL_REQ);
  assert.equal(res.verdict, 'within_grant');
  assert.equal(lease.ttl_seconds, 300);
  assert.equal(lease.expires_at, '2026-10-12T12:05:00.000Z');
  assert.equal(verifyCapabilityLease(state, lease, 'meeting schedule', '2026-10-12T12:04:59Z').valid, true);
  assert.equal(verifyCapabilityLease(state, lease, 'meeting schedule', '2026-10-12T12:05:00Z').status, 'expired');
  // A grant that ends at the moment of the request leaves nothing to lease.
  const atEnd = evaluateCapabilityAdjustmentRequest(state, { ...CAL_REQ, as_of_time: '2026-10-12T12:05:00Z' });
  assert.equal(atEnd.allowed, false);
});

test('verifyCapabilityLease enforces the TTL boundary and refuses premature use', () => {
  const { lease } = issueLease(CAL_STATE, CAL_REQ);
  assert.equal(verifyCapabilityLease(CAL_STATE, lease, 'meeting schedule', '2026-10-12T12:14:59Z').valid, true);
  assert.equal(verifyCapabilityLease(CAL_STATE, lease, 'meeting schedule', '2026-10-12T12:15:00Z').status, 'expired');
  assert.equal(verifyCapabilityLease(CAL_STATE, lease, 'meeting schedule', '2026-10-12T11:59:59Z').status, 'premature');
});

test('a revoked grant, or one re-issued after the lease, does not keep an old lease alive', () => {
  const { lease } = issueLease(CAL_STATE, CAL_REQ);
  const revoked = { ...DEFAULT_TWIN_STATE, grants: [] };
  assert.equal(verifyCapabilityLease(revoked, lease, 'meeting schedule', '2026-10-12T12:05:00Z').status, 'revoked_or_unregistered');
  const reissued = {
    ...DEFAULT_TWIN_STATE,
    grants: [{ who: 'calendar assistant', what: 'meeting schedule', at: '2026-10-12T12:03:00Z', expires_at: '2026-11-01T00:00:00Z' }]
  };
  const out = verifyCapabilityLease(reissued, lease, 'meeting schedule', '2026-10-12T12:05:00Z');
  assert.equal(out.valid, false);
  assert.equal(out.status, 'unconfirmed');
});

test('a pending (consequential) lease edited to active never verifies', () => {
  const state = {
    ...DEFAULT_TWIN_STATE,
    grants: [{ who: 'file agent', what: 'delete cache', at: '2026-10-01T00:00:00Z' }]
  };
  const { res, lease } = issueLease(state, { grantee: 'file agent', requested_scope: 'delete cache', purpose: 'Wipe cache', ttl_seconds: 900, as_of_time: '2026-10-12T12:00:00Z' });
  assert.equal(res.verdict, 'requires_confirmation');
  assert.equal(lease.status, 'pending_confirmation');
  assert.equal(verifyCapabilityLease(state, lease, 'delete cache', '2026-10-12T12:05:00Z').status, 'unconfirmed');
  assert.equal(verifyCapabilityLease(state, { ...lease, status: 'active' }, 'delete cache', '2026-10-12T12:05:00Z').status, 'unconfirmed');
});

test('verifyCapabilityLease fails closed on scope mismatch or wildcard scope', () => {
  const { lease } = issueLease(CAL_STATE, CAL_REQ);
  const mismatch = verifyCapabilityLease(CAL_STATE, lease, 'financial records', '2026-10-12T12:05:00Z');
  assert.equal(mismatch.valid, false);
  assert.equal(mismatch.status, 'scope_mismatch');
  assert.equal(verifyCapabilityLease(CAL_STATE, lease, '*', '2026-10-12T12:05:00Z').status, 'scope_mismatch');
  const wild = verifyCapabilityLease(CAL_STATE, { ...lease, scope: '*' }, 'anything', '2026-10-12T12:05:00Z');
  assert.equal(wild.valid, false);
});

test('verifyCapabilityLease fails closed when a critical fact recorded after issuance conflicts with the scope', () => {
  const grants = [{ who: 'med assistant', what: 'prescribe penicillin antibiotic', at: '2026-10-01T00:00:00Z' }];
  const before = { ...DEFAULT_TWIN_STATE, grants };
  const { lease } = issueLease(before, {
    grantee: 'med assistant',
    requested_scope: 'prescribe penicillin antibiotic',
    purpose: 'Treatment',
    ttl_seconds: 900,
    as_of_time: '2026-10-12T12:00:00Z'
  });
  const after = {
    ...DEFAULT_TWIN_STATE,
    grants,
    facts: [{ id: 'fact-99', category: 'medical', statement: 'Severe allergy to penicillin', critical: true, at: '2026-10-12T12:02:00Z' }]
  };
  const res = verifyCapabilityLease(after, lease, 'prescribe penicillin antibiotic', '2026-10-12T12:05:00Z');
  assert.equal(res.valid, false);
  assert.equal(res.status, 'constraint_conflict');
  assert.ok(res.reason.includes('Severe allergy to penicillin'));
});

test('verifyCapabilityLease rejects unknown fields, wrong types, and non-ISO timestamps fail-closed', () => {
  const state = {
    ...DEFAULT_TWIN_STATE,
    grants: [{ who: 'agent', what: 'logs', at: '2026-10-01T00:00:00Z' }]
  };
  const baseLease = {
    lease_id: 'lease-test-6',
    grantee: 'agent',
    scope: 'read logs',
    purpose: 'Diagnostic',
    issued_at: '2026-10-12T12:00:00Z',
    expires_at: '2026-10-12T12:15:00Z',
    ttl_seconds: 900,
    status: 'active'
  };

  assert.equal(verifyCapabilityLease(state, null, 'read logs').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(state, [], 'read logs').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(state, { ...baseLease, rogue_field: true }, 'read logs').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(state, { ...baseLease, scope: 123 }, 'read logs').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(state, { ...baseLease, issued_at: '2026' }, 'read logs').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(state, { ...baseLease, expires_at: 'invalid' }, 'read logs').status, 'malformed_lease');
  assert.equal(verifyCapabilityLease(state, baseLease, '').status, 'invalid_parameter');
  assert.equal(verifyCapabilityLease(state, baseLease, 'read logs', 'invalid-time').status, 'invalid_parameter');
});

test('summarizeCapabilityAdjustment and summarizeCapabilityLease handle valid, invalid, and malformed inputs fail-closed', () => {
  const evalOut = {
    allowed: true,
    verdict: 'granted',
    reason: 'Approved',
    lease: {
      grantee: 'agent-1',
      scope: 'scope-1',
      ttl_seconds: 300,
      expires_at: '2026-10-12T12:05:00Z',
      lease_id: 'lease-123'
    }
  };
  const sumEval = summarizeCapabilityAdjustment(evalOut);
  assert.equal(sumEval.allowed, true);
  assert.equal(sumEval.grantee, 'agent-1');
  assert.equal(sumEval.ttl_seconds, 300);
  assert.equal(Object.isFrozen(sumEval), true);

  const sumEvalBad = summarizeCapabilityAdjustment(null);
  assert.equal(sumEvalBad.allowed, false);
  assert.equal(sumEvalBad.verdict, 'error');

  const leaseOut = {
    valid: true,
    status: 'covered',
    reason: 'Active',
    grantee: 'agent-2',
    scope: 'scope-2',
    expires_at: '2026-10-12T12:05:00Z'
  };
  const sumLease = summarizeCapabilityLease(leaseOut);
  assert.equal(sumLease.valid, true);
  assert.equal(sumLease.grantee, 'agent-2');
  assert.equal(Object.isFrozen(sumLease), true);

  const sumLeaseBad = summarizeCapabilityLease(null);
  assert.equal(sumLeaseBad.valid, false);
  assert.equal(sumLeaseBad.status, 'error');
});

test('financial ledger constants are deeply frozen and contain allowed operations and fields', () => {
  assert.equal(Object.isFrozen(ALLOWED_LEDGER_OPERATIONS), true);
  assert.equal(Object.isFrozen(ALLOWED_LEDGER_ENTRY_FIELDS), true);
  assert.equal(Object.isFrozen(ALLOWED_FINANCIAL_QUERY_FIELDS), true);
  assert.equal(Object.isFrozen(ALLOWED_READING_FIELDS), true);
  assert.equal(Object.isFrozen(ALLOWED_AGREEMENT_OPTIONS_FIELDS), true);

  assert.equal(ALLOWED_LEDGER_OPERATIONS.includes('sum'), true);
  assert.equal(ALLOWED_LEDGER_OPERATIONS.includes('balance'), true);
  assert.equal(ALLOWED_LEDGER_OPERATIONS.includes('average'), true);
  assert.equal(ALLOWED_LEDGER_OPERATIONS.includes('breakdown'), true);
});

test('evaluateFinancialLedgerQuery evaluates sum, balance, count, and breakdown correctly on integer cents', () => {
  const ledger = [
    {
      id: 'tx-1',
      date: '2026-10-01',
      amount_cents: -4500,
      currency: 'USD',
      kind: 'debit',
      category: 'groceries',
      merchant: 'Fresh Mart'
    },
    {
      id: 'tx-2',
      date: '2026-10-02',
      amount_cents: -1550,
      currency: 'USD',
      kind: 'debit',
      category: 'transit',
      merchant: 'Metro Transit'
    },
    {
      id: 'tx-3',
      date: '2026-10-03',
      amount_cents: 20000,
      currency: 'USD',
      kind: 'credit',
      category: 'income',
      merchant: 'Direct Deposit'
    },
    {
      id: 'tx-4',
      date: '2026-10-04',
      amount_cents: -2500,
      currency: 'EUR',
      kind: 'debit',
      category: 'groceries',
      merchant: 'Euro Market'
    }
  ];

  // Sum of USD debits
  const sumQuery = {
    operation: 'sum',
    currency: 'USD',
    kind: 'debit'
  };
  const sumRes = evaluateFinancialLedgerQuery(ledger, sumQuery);
  assert.equal(sumRes.ok, true);
  assert.equal(sumRes.matching_count, 2);
  assert.equal(sumRes.total_cents, -6050);
  assert.equal(sumRes.currency, 'USD');
  assert.equal(Object.isFrozen(sumRes), true);
  assert.equal(Object.isFrozen(sumRes.matched_ids), true);

  // Net balance of all USD transactions
  const balanceQuery = {
    operation: 'balance',
    currency: 'USD'
  };
  const balRes = evaluateFinancialLedgerQuery(ledger, balanceQuery);
  assert.equal(balRes.ok, true);
  assert.equal(balRes.matching_count, 3);
  assert.equal(balRes.total_cents, 13950);
  assert.equal(balRes.balance_cents, 13950);
  assert.equal(balRes.debit_cents, -6050);
  assert.equal(balRes.credit_cents, 20000);

  // Average calculation in integer quotient and remainder (never float, 0 instead of -0)
  const avgQuery = {
    operation: 'average',
    currency: 'USD',
    kind: 'debit'
  };
  const avgRes = evaluateFinancialLedgerQuery(ledger, avgQuery);
  assert.equal(avgRes.ok, true);
  assert.equal(avgRes.matching_count, 2);
  assert.equal(avgRes.average.quotient_cents, -3025);
  assert.equal(avgRes.average.remainder_cents, 0);

  // Category breakdown
  const breakQuery = {
    operation: 'breakdown',
    currency: 'USD'
  };
  const breakRes = evaluateFinancialLedgerQuery(ledger, breakQuery);
  assert.equal(breakRes.ok, true);
  assert.equal(breakRes.breakdown.groceries.total_cents, -4500);
  assert.equal(breakRes.breakdown.groceries.count, 1);
  assert.equal(breakRes.breakdown.transit.total_cents, -1550);
  assert.equal(breakRes.breakdown.income.total_cents, 20000);
  assert.equal(Object.isFrozen(breakRes.breakdown.groceries), true);

  // EUR isolation: EUR transaction excluded from USD queries
  assert.equal(sumRes.matched_ids.includes('tx-4'), false);
  assert.equal(balRes.matched_ids.includes('tx-4'), false);
});

test('evaluateFinancialLedgerQuery filters by date range, merchant tokens, and category fail-closed', () => {
  const ledger = [
    {
      id: 'tx-1',
      date: '2026-10-05',
      amount_cents: -3000,
      currency: 'USD',
      kind: 'debit',
      category: 'dining',
      merchant: 'Cafe Blue'
    },
    {
      id: 'tx-2',
      date: '2026-10-10',
      amount_cents: -4500,
      currency: 'USD',
      kind: 'debit',
      category: 'dining',
      merchant: 'Dairy Queen Central'
    },
    {
      id: 'tx-3',
      date: '2026-10-15',
      amount_cents: -2000,
      currency: 'USD',
      kind: 'debit',
      category: 'books',
      merchant: 'City Books'
    }
  ];

  // Date range filter
  const dateQuery = {
    operation: 'sum',
    currency: 'USD',
    start_date: '2026-10-06',
    end_date: '2026-10-12'
  };
  const dateRes = evaluateFinancialLedgerQuery(ledger, dateQuery);
  assert.equal(dateRes.ok, true);
  assert.equal(dateRes.matching_count, 1);
  assert.equal(dateRes.matched_ids[0], 'tx-2');
  assert.equal(dateRes.total_cents, -4500);

  // Merchant token boundary match: "air" must not match "Dairy Queen Central" (Lesson 64)
  const airRes = evaluateFinancialLedgerQuery(ledger, {
    operation: 'count',
    currency: 'USD',
    merchant: 'air'
  });
  assert.equal(airRes.ok, true);
  assert.equal(airRes.matching_count, 0);

  // Merchant exact word token match: "Dairy" matches "Dairy Queen Central"
  const dairyRes = evaluateFinancialLedgerQuery(ledger, {
    operation: 'count',
    currency: 'USD',
    merchant: 'Dairy'
  });
  assert.equal(dairyRes.ok, true);
  assert.equal(dairyRes.matching_count, 1);
  assert.equal(dairyRes.matched_ids[0], 'tx-2');

  // Category filter
  const catRes = evaluateFinancialLedgerQuery(ledger, {
    operation: 'count',
    currency: 'USD',
    category: 'dining'
  });
  assert.equal(catRes.ok, true);
  assert.equal(catRes.matching_count, 2);

  // Inverted date range fails closed
  const badRange = evaluateFinancialLedgerQuery(ledger, {
    operation: 'sum',
    currency: 'USD',
    start_date: '2026-10-20',
    end_date: '2026-10-01'
  });
  assert.equal(badRange.ok, false);
  assert.equal(badRange.error, 'invalid_date_range');
});

test('evaluateFinancialLedgerQuery handles expected_amount_cents assertion and fingerprinting', () => {
  const ledger = [
    {
      id: 'tx-1',
      date: '2026-10-01',
      amount_cents: -5000,
      currency: 'USD',
      kind: 'debit'
    }
  ];

  // Matches expectation
  const matchRes = evaluateFinancialLedgerQuery(ledger, {
    operation: 'sum',
    currency: 'USD',
    expected_amount_cents: -5000
  });
  assert.equal(matchRes.ok, true);
  assert.equal(matchRes.matches_expected, true);
  assert.equal(matchRes.expected_amount_cents, -5000);

  // Does not match expectation
  const missRes = evaluateFinancialLedgerQuery(ledger, {
    operation: 'sum',
    currency: 'USD',
    expected_amount_cents: -9999
  });
  assert.equal(missRes.ok, true);
  assert.equal(missRes.matches_expected, false);
  assert.equal(missRes.expected_amount_cents, -9999);

  // Fingerprint changes when expected_amount_cents changes
  assert.notEqual(matchRes.query_fingerprint, missRes.query_fingerprint);
});

test('evaluateFinancialLedgerQuery strictly rejects floats, NaN, Infinity, type attacks, and malformed entries', () => {
  // Float amount injection
  const floatLedger = [
    {
      id: 'tx-bad-1',
      date: '2026-10-01',
      amount_cents: 45.50,
      currency: 'USD',
      kind: 'credit'
    }
  ];
  const floatRes = evaluateFinancialLedgerQuery(floatLedger, { operation: 'sum', currency: 'USD' });
  assert.equal(floatRes.ok, false);
  assert.equal(floatRes.error, 'malformed_ledger_entry');

  // NaN amount injection
  const nanLedger = [
    {
      id: 'tx-bad-2',
      date: '2026-10-01',
      amount_cents: NaN,
      currency: 'USD',
      kind: 'credit'
    }
  ];
  const nanRes = evaluateFinancialLedgerQuery(nanLedger, { operation: 'sum', currency: 'USD' });
  assert.equal(nanRes.ok, false);
  assert.equal(nanRes.error, 'malformed_ledger_entry');

  // Infinity amount injection
  const infLedger = [
    {
      id: 'tx-bad-3',
      date: '2026-10-01',
      amount_cents: Infinity,
      currency: 'USD',
      kind: 'credit'
    }
  ];
  const infRes = evaluateFinancialLedgerQuery(infLedger, { operation: 'sum', currency: 'USD' });
  assert.equal(infRes.ok, false);
  assert.equal(infRes.error, 'malformed_ledger_entry');

  // Debit marked with positive amount
  const badDebit = [
    {
      id: 'tx-bad-4',
      date: '2026-10-01',
      amount_cents: 1000,
      currency: 'USD',
      kind: 'debit'
    }
  ];
  const debitRes = evaluateFinancialLedgerQuery(badDebit, { operation: 'sum', currency: 'USD' });
  assert.equal(debitRes.ok, false);
  assert.equal(debitRes.error, 'malformed_ledger_entry');

  // Unknown entry field
  const unknownFieldLedger = [
    {
      id: 'tx-bad-5',
      date: '2026-10-01',
      amount_cents: -1000,
      currency: 'USD',
      kind: 'debit',
      extra_auth_token: 'injected'
    }
  ];
  const unknownRes = evaluateFinancialLedgerQuery(unknownFieldLedger, { operation: 'sum', currency: 'USD' });
  assert.equal(unknownRes.ok, false);
  assert.equal(unknownRes.error, 'malformed_ledger_entry');

  // Type attacks on query category and merchant: must fail closed, not crash
  const badCat = evaluateFinancialLedgerQuery([], { operation: 'sum', currency: 'USD', category: 12345 });
  assert.equal(badCat.ok, false);
  assert.equal(badCat.error, 'invalid_category');

  const badMerch = evaluateFinancialLedgerQuery([], { operation: 'sum', currency: 'USD', merchant: { malicious: true } });
  assert.equal(badMerch.ok, false);
  assert.equal(badMerch.error, 'invalid_merchant');

  // Unknown query field
  const unknownQuery = evaluateFinancialLedgerQuery([], {
    operation: 'sum',
    currency: 'USD',
    bypass_filter: true
  });
  assert.equal(unknownQuery.ok, false);
  assert.equal(unknownQuery.error, 'unknown_query_field');

  // Missing currency in query
  const missingCurr = evaluateFinancialLedgerQuery([], { operation: 'sum' });
  assert.equal(missingCurr.ok, false);
  assert.equal(missingCurr.error, 'missing_or_invalid_currency');
});

test('verifyLedgerQueryAgreement passes on matching readings and rejects empty, unknown, asymmetric or disagreeing inputs', () => {
  const primaryReading = {
    operation: 'sum',
    currency: 'USD',
    start_date: '2026-10-01',
    end_date: '2026-10-15',
    category: 'groceries',
    total_cents: -8500,
    matching_count: 3
  };

  const agreeingChecker = {
    operation: 'sum',
    currency: 'USD',
    start_date: '2026-10-01',
    end_date: '2026-10-15',
    category: 'groceries',
    total_cents: -8500,
    matching_count: 3
  };

  const agreeRes = verifyLedgerQueryAgreement(primaryReading, agreeingChecker);
  assert.equal(agreeRes.ok, true);
  assert.equal(agreeRes.status, 'agreement');
  assert.equal(agreeRes.sure, true);
  assert.equal(agreeRes.verified_cents, -8500);
  assert.equal(Object.isFrozen(agreeRes), true);

  // Empty readings {} vs {} must fail closed (Reviewer Issue 1)
  const emptyRes = verifyLedgerQueryAgreement({}, {});
  assert.equal(emptyRes.ok, false);
  assert.equal(emptyRes.status, 'error');
  assert.equal(emptyRes.sure, false);

  // Asymmetric total_cents: primary supplies total_cents, checker does not (Reviewer Issue 1)
  const checkerNoTotal = { ...agreeingChecker };
  delete checkerNoTotal.total_cents;
  const asymTotal = verifyLedgerQueryAgreement(
    primaryReading,
    checkerNoTotal
  );
  assert.equal(asymTotal.ok, true);
  assert.equal(asymTotal.status, 'disagreement');
  assert.equal(asymTotal.sure, false);
  assert.equal(asymTotal.field, 'total_cents');

  // Asymmetric matching_count: primary supplies matching_count, checker does not
  const asymCount = verifyLedgerQueryAgreement(
    { operation: 'sum', currency: 'USD', total_cents: -8500, matching_count: 3 },
    { operation: 'sum', currency: 'USD', total_cents: -8500 }
  );
  assert.equal(asymCount.ok, true);
  assert.equal(asymCount.status, 'disagreement');
  assert.equal(asymCount.sure, false);
  assert.equal(asymCount.field, 'matching_count');

  // Unknown field in reading fails closed (Reviewer Issue 5)
  const unknownReading = verifyLedgerQueryAgreement(
    { ...primaryReading, injected_token: 'secret' },
    agreeingChecker
  );
  assert.equal(unknownReading.ok, false);
  assert.equal(unknownReading.status, 'error');

  // Negative tolerance_cents fails closed (Reviewer Issue 4)
  const negTol = verifyLedgerQueryAgreement(primaryReading, agreeingChecker, { tolerance_cents: -5 });
  assert.equal(negTol.ok, false);
  assert.equal(negTol.status, 'error');

  // Non-object options fails closed (Reviewer Issue 4)
  const badOpt = verifyLedgerQueryAgreement(primaryReading, agreeingChecker, "strict");
  assert.equal(badOpt.ok, false);
  assert.equal(badOpt.status, 'error');

  // Disagreement in date bounds
  const disagreeDate = {
    ...agreeingChecker,
    end_date: '2026-10-20'
  };
  const dateDis = verifyLedgerQueryAgreement(primaryReading, disagreeDate);
  assert.equal(dateDis.ok, true);
  assert.equal(dateDis.status, 'disagreement');
  assert.equal(dateDis.sure, false);
  assert.equal(dateDis.field, 'end_date');

  // Disagreement in calculated total cents (Pulse Local double-check pattern)
  const disagreeTotal = {
    ...agreeingChecker,
    total_cents: -9200
  };
  const totalDis = verifyLedgerQueryAgreement(primaryReading, disagreeTotal);
  assert.equal(totalDis.ok, true);
  assert.equal(totalDis.status, 'disagreement');
  assert.equal(totalDis.sure, false);
  assert.equal(totalDis.field, 'total_cents');

  // Malformed inputs fail closed
  const badInput = verifyLedgerQueryAgreement(null, agreeingChecker);
  assert.equal(badInput.ok, false);
  assert.equal(badInput.status, 'error');
  assert.equal(badInput.sure, false);
});

test('summarizeLedgerEvaluation produces deterministic string without float representation and handles missing average safely', () => {
  const evalResult = {
    ok: true,
    operation: 'balance',
    currency: 'USD',
    matching_count: 4,
    total_cents: 12550,
    balance_cents: 12550,
    query_fingerprint: 'a1b2c3d4'
  };

  const summary = summarizeLedgerEvaluation(evalResult);
  assert.equal(summary.success, true);
  assert.equal(summary.total_formatted, '125.50 USD');
  assert.equal(summary.balance_formatted, '125.50 USD');
  assert.equal(summary.summary_text.includes('125.50 USD'), true);
  assert.equal(Object.isFrozen(summary), true);

  // Negative balance formatting
  const negResult = {
    ok: true,
    operation: 'sum',
    currency: 'CAD',
    matching_count: 2,
    total_cents: -4505,
    balance_cents: -4505,
    query_fingerprint: '12345678'
  };
  const negSummary = summarizeLedgerEvaluation(negResult);
  assert.equal(negSummary.total_formatted, '-45.05 CAD');

  // Average operation with missing average object fails closed without uncaught TypeError (Reviewer Issue 6)
  const missingAvg = summarizeLedgerEvaluation({
    ok: true,
    operation: 'average',
    currency: 'USD',
    matching_count: 2,
    total_cents: -5000
  });
  assert.equal(missingAvg.success, false);
  assert.equal(missingAvg.summary_text.includes('Invalid or missing average'), true);

  // Bad evaluation input
  const badSum = summarizeLedgerEvaluation(null);
  assert.equal(badSum.success, false);
  assert.equal(badSum.matching_count, 0);
});


