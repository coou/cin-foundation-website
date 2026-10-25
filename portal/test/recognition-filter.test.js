import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RECOGNITION_KINDS,
  filterRecognition,
  searchRecognition,
  calculateKindCounts,
} from '../assets/recognition-logic.js';

test('RECOGNITION_KINDS constants integrity and immutability', () => {
  assert.ok(Object.isFrozen(RECOGNITION_KINDS), 'RECOGNITION_KINDS must be frozen');

  const expectedKinds = [
    'all',
    'safety',
    'governance',
    'prediction',
    'research',
    'open-source',
    'product',
    'disclosure',
    'community',
  ];
  for (const k of expectedKinds) {
    assert.ok(k in RECOGNITION_KINDS, `Missing kind: ${k}`);
    assert.strictEqual(typeof RECOGNITION_KINDS[k], 'string');
  }
});

test('filterRecognition: basic filtering and category isolation', () => {
  const sample = [
    { id: 'RC-001', kind: 'safety', who: 'Alice', what: 'Safety tool' },
    { id: 'RC-002', kind: 'governance', who: 'Bob', what: 'Journal' },
    { id: 'RC-003', kind: 'prediction', who: 'Carol', what: 'Forecast' },
    { id: 'RC-004', kind: 'safety', who: 'Dave', what: 'STAR-Guard' },
  ];

  const all = filterRecognition(sample, 'all');
  assert.strictEqual(all.length, 4);

  const safety = filterRecognition(sample, 'safety');
  assert.strictEqual(safety.length, 2);
  assert.strictEqual(safety[0].id, 'RC-001');
  assert.strictEqual(safety[1].id, 'RC-004');

  const governance = filterRecognition(sample, 'governance');
  assert.strictEqual(governance.length, 1);
  assert.strictEqual(governance[0].id, 'RC-002');

  const empty = filterRecognition(sample, 'open-source');
  assert.strictEqual(empty.length, 0);
});

test('filterRecognition: fail-closed input bounds and malformed records', () => {
  assert.throws(() => filterRecognition(null), TypeError);
  assert.throws(() => filterRecognition('not-an-array'), TypeError);
  assert.throws(() => filterRecognition(12345), TypeError);

  const malformed = [
    null,
    undefined,
    'string-item',
    42,
    {},
    { id: 'valid', kind: 'safety', who: 'Valid Person' },
  ];

  const res = filterRecognition(malformed, 'safety');
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].id, 'valid');

  // Case insensitivity and whitespace trimming
  const trimmed = filterRecognition(malformed, '  SAFETY  ');
  assert.strictEqual(trimmed.length, 1);
  assert.strictEqual(trimmed[0].id, 'valid');

  // Non-string kind defaults to all
  const defaultAll = filterRecognition(malformed, null);
  assert.strictEqual(defaultAll.length, 2); // {} and valid
});

test('searchRecognition: keyword matching across fields', () => {
  const sample = [
    { id: '1', who: 'Shawn Li', what: 'Agent safety action alignment', why: 'Direct verification', title: 'Agent Safety' },
    { id: '2', who: 'The Alignment Journal', what: 'Paid peer review', why: 'Open review statements', title: 'The Alignment Journal' },
    { id: '3', who: 'Seyedarmin Azizi', what: 'Option-channel attacks', why: 'Typed rules prove security', title: 'Option Channel' },
  ];

  const matchWho = searchRecognition(sample, 'shawn');
  assert.strictEqual(matchWho.length, 1);
  assert.strictEqual(matchWho[0].id, '1');

  const matchWhat = searchRecognition(sample, 'peer review');
  assert.strictEqual(matchWhat.length, 1);
  assert.strictEqual(matchWhat[0].id, '2');

  const matchWhy = searchRecognition(sample, 'typed rules');
  assert.strictEqual(matchWhy.length, 1);
  assert.strictEqual(matchWhy[0].id, '3');

  const matchMulti = searchRecognition(sample, 'alignment');
  assert.strictEqual(matchMulti.length, 2);
  assert.strictEqual(matchMulti[0].id, '1');
  assert.strictEqual(matchMulti[1].id, '2');

  const matchNone = searchRecognition(sample, 'nonexistent phrase');
  assert.strictEqual(matchNone.length, 0);
});

test('searchRecognition: edge cases, trimming, and bounds', () => {
  assert.throws(() => searchRecognition(null), TypeError);
  assert.throws(() => searchRecognition(99), TypeError);

  const sample = [{ id: '1', who: 'Alpha', what: 'Beta', why: 'Gamma', title: 'Delta', kind: 'safety' }];

  // Empty string or whitespace returns all
  assert.strictEqual(searchRecognition(sample, '').length, 1);
  assert.strictEqual(searchRecognition(sample, '   ').length, 1);
  assert.strictEqual(searchRecognition(sample, null).length, 1);

  // Search by kind string
  assert.strictEqual(searchRecognition(sample, 'safety').length, 1);
});

test('calculateKindCounts: accurate aggregation and fail-closed bounds', () => {
  assert.throws(() => calculateKindCounts(null), TypeError);
  assert.throws(() => calculateKindCounts('bad'), TypeError);

  const sample = [
    { id: '1', kind: 'safety' },
    { id: '2', kind: 'safety' },
    { id: '3', kind: 'governance' },
    { id: '4', kind: 'prediction' },
    null,
    undefined,
    { id: '5', kind: 'unknown-kind' },
  ];

  const counts = calculateKindCounts(sample);
  assert.strictEqual(counts.all, 5);
  assert.strictEqual(counts.safety, 2);
  assert.strictEqual(counts.governance, 1);
  assert.strictEqual(counts.prediction, 1);
  assert.strictEqual(counts.research, 0);
  assert.strictEqual(counts['open-source'], 0);
});

test('combined category filtering and keyword search', () => {
  const sample = [
    { id: '1', kind: 'safety', who: 'Alice', what: 'Guardrails' },
    { id: '2', kind: 'safety', who: 'Bob', what: 'Sandboxing' },
    { id: '3', kind: 'governance', who: 'Alice', what: 'Auditing' },
  ];

  const safetyItems = filterRecognition(sample, 'safety');
  const filtered = searchRecognition(safetyItems, 'alice');
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].id, '1');
});
