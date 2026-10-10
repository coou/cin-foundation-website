import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TWIN_STATE,
  validateTwinState,
  deserializeTwinState,
  serializeTwinState,
  evaluateAccessRequest,
  createConsentReceipt,
  isGrantExpired,
  extractWords,
  scoreSignalRelevance,
  calculatePersonalTrajectory
} from '../assets/twin-core.js';

test('DEFAULT_TWIN_STATE is deeply frozen and valid', () => {
  const res = validateTwinState(DEFAULT_TWIN_STATE);
  assert.equal(res.ok, true);
  assert.throws(() => { DEFAULT_TWIN_STATE.topics.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.grants.push('x'); });
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
  const json = JSON.stringify({ topics: ['health'], grants: [] });
  const parsed = deserializeTwinState(json);
  assert.equal(parsed.ok, true);
  assert.deepEqual(JSON.parse(serializeTwinState(parsed.value)), { topics: ['health'], grants: [] });
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
