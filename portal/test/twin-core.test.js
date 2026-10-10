import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TWIN_STATE, validateTwinState, deserializeTwinState, serializeTwinState, evaluateAccessRequest, createConsentReceipt } from '../assets/twin-core.js';

test('DEFAULT_TWIN_STATE is deeply frozen and valid', () => {
  const res = validateTwinState(DEFAULT_TWIN_STATE);
  assert.equal(res.ok, true);
  assert.throws(() => { DEFAULT_TWIN_STATE.topics.push('x'); });
  assert.throws(() => { DEFAULT_TWIN_STATE.grants.push('x'); });
});

test('validateTwinState accepts well-formed data and is deterministic', () => {
  const input = {
    topics: ['privacy', 'local AI'],
    grants: [{ who: 'calendar', what: 'times', at: '2026-10-10T09:00:00.000Z' }]
  };
  const r1 = validateTwinState(input);
  const r2 = validateTwinState(input);
  assert.equal(r1.ok, true);
  assert.deepEqual(r1, r2);
  assert.equal(r1.value.topics.length, 2);
  assert.equal(r1.value.grants[0].who, 'calendar');
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

test('evaluateAccessRequest allows authorized service and scope', () => {
  const state = {
    topics: ['research'],
    grants: [
      { who: 'dentist', what: 'appointment times', at: '2026-10-10T10:00:00.000Z' },
      { who: 'library', what: 'reading history, holds', at: '2026-10-10T10:05:00.000Z' },
      { who: 'backup-agent', what: '*', at: '2026-10-10T10:10:00.000Z' }
    ]
  };
  // Exact match
  const r1 = evaluateAccessRequest(state, 'dentist', 'appointment times');
  assert.equal(r1.allowed, true);
  assert.equal(r1.grant.who, 'dentist');

  // Case insensitive and trimmed match
  const r2 = evaluateAccessRequest(state, '  Dentist  ', ' Appointment Times ');
  assert.equal(r2.allowed, true);

  // Multi-scope comma separated match
  const r3 = evaluateAccessRequest(state, 'library', 'holds');
  assert.equal(r3.allowed, true);

  // Wildcard scope match
  const r4 = evaluateAccessRequest(state, 'backup-agent', 'anything');
  assert.equal(r4.allowed, true);
});

test('evaluateAccessRequest fails closed on unauthorized, empty, or malformed queries', () => {
  const state = {
    topics: [],
    grants: [{ who: 'dentist', what: 'appointment times', at: '2026-10-10T10:00:00.000Z' }]
  };
  // Unknown service
  assert.equal(evaluateAccessRequest(state, 'unknown', 'appointment times').allowed, false);

  // Service exists, but requested scope not granted
  assert.equal(evaluateAccessRequest(state, 'dentist', 'billing details').allowed, false);

  // Empty state grants list
  assert.equal(evaluateAccessRequest({ topics: [], grants: [] }, 'dentist', 'appointment times').allowed, false);

  // Malformed / invalid inputs
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
});

test('createConsentReceipt produces valid ISO-27560 compatible structured receipts', () => {
  const grant = { who: 'calendar-sync', what: 'busy status, time slots', at: '2026-10-10T12:00:00.000Z' };
  const receipt = createConsentReceipt(grant, 'local-user');

  assert.equal(receipt.receipt_version, 'ISO-27560:2023-compatible');
  assert.equal(receipt.subject, 'local-user');
  assert.equal(receipt.recipient, 'calendar-sync');
  assert.deepEqual(receipt.purposes_and_scopes, ['busy status', 'time slots']);
  assert.equal(receipt.timestamp, '2026-10-10T12:00:00.000Z');
  assert.equal(receipt.status, 'granted');

  // Input validation
  assert.throws(() => createConsentReceipt(null));
  assert.throws(() => createConsentReceipt({ who: '', what: 'all', at: '2026-10-10T12:00:00.000Z' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: '', at: '2026-10-10T12:00:00.000Z' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: 'b', at: 'invalid-date' }));
  assert.throws(() => createConsentReceipt({ who: 'a', what: 'b', at: '2026-10-10T12:00:00.000Z', extra: 1 }));
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


