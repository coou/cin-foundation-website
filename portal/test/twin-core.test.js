import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TWIN_STATE,
  validateTwinState,
  deserializeTwinState,
  serializeTwinState,
  evaluateAccessRequest,
  createConsentReceipt,
  isGrantExpired
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
