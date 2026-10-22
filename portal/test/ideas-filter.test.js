import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IDEA_CATEGORIES,
  IDEA_STATUSES,
  filterIdeas,
  calculateCategoryCounts,
  validateIdeaSubmission,
} from '../assets/ideas-logic.js';

test('IDEA_CATEGORIES and IDEA_STATUSES constants integrity', () => {
  assert.ok(Object.isFrozen(IDEA_CATEGORIES), 'IDEA_CATEGORIES must be frozen');
  assert.ok(Object.isFrozen(IDEA_STATUSES), 'IDEA_STATUSES must be frozen');

  const expectedCategories = ['all', 'safety', 'collective', 'value', 'simulation', 'forecast', 'interface', 'other'];
  for (const cat of expectedCategories) {
    assert.ok(cat in IDEA_CATEGORIES, `Missing category: ${cat}`);
    assert.strictEqual(typeof IDEA_CATEGORIES[cat], 'string');
  }

  const expectedStatuses = ['accepted', 'in-progress', 'done', 'declined', 'reviewing'];
  for (const st of expectedStatuses) {
    assert.ok(st in IDEA_STATUSES, `Missing status: ${st}`);
    assert.strictEqual(IDEA_STATUSES[st].length, 2);
  }
});

test('filterIdeas: basic filtering and category isolation', () => {
  const sample = [
    { id: '1', data: { title: 'Idea 1', category: 'safety' }, status: {} },
    { id: '2', data: { title: 'Idea 2', category: 'collective' }, status: {} },
    { id: '3', data: { title: 'Idea 3', category: 'interface' }, status: {} },
    { id: '4', data: { title: 'Idea 4', category: 'safety' }, status: {} },
  ];

  const all = filterIdeas(sample, 'all');
  assert.strictEqual(all.length, 4);

  const safety = filterIdeas(sample, 'safety');
  assert.strictEqual(safety.length, 2);
  assert.strictEqual(safety[0].id, '1');
  assert.strictEqual(safety[1].id, '4');

  const collective = filterIdeas(sample, 'collective');
  assert.strictEqual(collective.length, 1);
  assert.strictEqual(collective[0].id, '2');

  const empty = filterIdeas(sample, 'simulation');
  assert.strictEqual(empty.length, 0);
});

test('filterIdeas: hidden ideas exclusion', () => {
  const sample = [
    { id: '1', data: { title: 'Visible', category: 'safety' }, status: { status: 'in-progress' } },
    { id: '2', data: { title: 'Hidden', category: 'safety' }, status: { status: 'hidden' } },
    { id: '3', data: { title: 'Hidden 2', category: 'value' }, status: { status: 'hidden' } },
  ];

  const all = filterIdeas(sample, 'all');
  assert.strictEqual(all.length, 1);
  assert.strictEqual(all[0].id, '1');

  const safety = filterIdeas(sample, 'safety');
  assert.strictEqual(safety.length, 1);
  assert.strictEqual(safety[0].id, '1');

  const value = filterIdeas(sample, 'value');
  assert.strictEqual(value.length, 0);
});

test('filterIdeas: fail-closed input bounds and malformed records', () => {
  assert.throws(() => filterIdeas(null), TypeError);
  assert.throws(() => filterIdeas('not-an-array'), TypeError);
  assert.throws(() => filterIdeas(12345), TypeError);

  const malformed = [
    null,
    undefined,
    'string-item',
    42,
    {},
    { id: 'valid', data: { title: 'Safe', category: 'interface' } },
  ];

  const res = filterIdeas(malformed, 'interface');
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].id, 'valid');

  // Case insensitivity and whitespace trimming
  const trimmed = filterIdeas(malformed, '  INTERFACE  ');
  assert.strictEqual(trimmed.length, 1);
  assert.strictEqual(trimmed[0].id, 'valid');
});

test('calculateCategoryCounts: accurate aggregation', () => {
  const sample = [
    { id: '1', data: { category: 'safety' }, status: {} },
    { id: '2', data: { category: 'safety' }, status: {} },
    { id: '3', data: { category: 'collective' }, status: {} },
    { id: '4', data: { category: 'value' }, status: {} },
    { id: '5', data: { category: 'simulation' }, status: {} },
    { id: '6', data: { category: 'forecast' }, status: {} },
    { id: '7', data: { category: 'interface' }, status: {} },
    { id: '8', data: { category: 'other' }, status: {} },
    { id: '9', data: { category: 'unrecognized_key' }, status: {} },
    { id: '10', data: { category: 'safety' }, status: { status: 'hidden' } },
  ];

  const counts = calculateCategoryCounts(sample);
  assert.strictEqual(counts.all, 9); // item 10 hidden
  assert.strictEqual(counts.safety, 2);
  assert.strictEqual(counts.collective, 1);
  assert.strictEqual(counts.value, 1);
  assert.strictEqual(counts.simulation, 1);
  assert.strictEqual(counts.forecast, 1);
  assert.strictEqual(counts.interface, 1);
  assert.strictEqual(counts.other, 2); // 'other' + 'unrecognized_key'
});

test('calculateCategoryCounts: fail-closed bounds', () => {
  assert.throws(() => calculateCategoryCounts(null), TypeError);
  assert.throws(() => calculateCategoryCounts({}), TypeError);

  const emptyCounts = calculateCategoryCounts([]);
  assert.strictEqual(emptyCounts.all, 0);
  assert.strictEqual(emptyCounts.safety, 0);
  assert.strictEqual(emptyCounts.other, 0);
});

test('validateIdeaSubmission: validation rules and edge cases', () => {
  // Valid submission
  const valid = validateIdeaSubmission(
    'Deterministic audit logging for browser agents',
    'We should require tamper-evident local audit records for every agent invocation on device.',
    'safety'
  );
  assert.strictEqual(valid.ok, true);
  assert.strictEqual(valid.error, null);

  // Short title
  const shortTitle = validateIdeaSubmission(
    'Tiny',
    'A sufficiently long description explaining the proposed architectural adjustment in detail.',
    'collective'
  );
  assert.strictEqual(shortTitle.ok, false);
  assert.match(shortTitle.error, /Title must be between 5 and 120/);

  // Long title
  const longTitle = validateIdeaSubmission(
    'A'.repeat(121),
    'A sufficiently long description explaining the proposed architectural adjustment in detail.',
    'collective'
  );
  assert.strictEqual(longTitle.ok, false);
  assert.match(longTitle.error, /Title must be between 5 and 120/);

  // Short body
  const shortBody = validateIdeaSubmission(
    'Valid Title',
    'Too brief.',
    'value'
  );
  assert.strictEqual(shortBody.ok, false);
  assert.match(shortBody.error, /Description must be between 20 and 4,000/);

  // Invalid category
  const badCategory = validateIdeaSubmission(
    'Valid Title',
    'A sufficiently long description explaining the proposed architectural adjustment in detail.',
    'nonexistent_category'
  );
  assert.strictEqual(badCategory.ok, false);
  assert.match(badCategory.error, /Please choose a valid category/);

  // Null/undefined handling
  assert.strictEqual(validateIdeaSubmission(null, 'Some body', 'safety').ok, false);
  assert.strictEqual(validateIdeaSubmission('Title', null, 'safety').ok, false);
  assert.strictEqual(validateIdeaSubmission('Title', 'Some body', null).ok, false);
});

test('unknown categories are listed under Other, matching the Other count', () => {
  const ideas = [
    { id: 'a', data: { category: 'gardening' }, status: {} },
    { id: 'b', data: { category: 'other' }, status: {} },
    { id: 'c', data: {}, status: {} },
  ];
  const counts = calculateCategoryCounts(ideas);
  assert.equal(counts.other, 3);
  assert.equal(filterIdeas(ideas, 'other').length, counts.other);
});
