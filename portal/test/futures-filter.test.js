import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FUTURES_GOALS,
  GOAL_ID_TO_KEY,
  GOAL_KEY_TO_ID,
  clampLikelihood,
  formatLikelihoodPct,
  filterFutures,
  searchFutures,
  calculateGoalCounts,
} from '../assets/futures-logic.js';

test('FUTURES_GOALS and goal mapping constants integrity and immutability', () => {
  assert.ok(Object.isFrozen(FUTURES_GOALS), 'FUTURES_GOALS must be frozen');
  assert.ok(Object.isFrozen(GOAL_ID_TO_KEY), 'GOAL_ID_TO_KEY must be frozen');
  assert.ok(Object.isFrozen(GOAL_KEY_TO_ID), 'GOAL_KEY_TO_ID must be frozen');

  const expectedGoals = ['all', 'safety', 'governance', 'value', 'simulation', 'forecasting', 'personal-agent'];
  for (const key of expectedGoals) {
    assert.ok(key in FUTURES_GOALS, `Missing goal key: ${key}`);
    assert.strictEqual(typeof FUTURES_GOALS[key], 'string');
  }

  for (let id = 1; id <= 6; id++) {
    const key = GOAL_ID_TO_KEY[id];
    assert.ok(key in FUTURES_GOALS, `Goal id ${id} mapped to unknown key ${key}`);
    assert.strictEqual(GOAL_KEY_TO_ID[key], id, `Bidirectional mapping mismatch for id ${id}`);
  }
});

test('clampLikelihood and formatLikelihoodPct bounds and edge cases', () => {
  assert.strictEqual(clampLikelihood(0.45), 0.45);
  assert.strictEqual(formatLikelihoodPct(0.45), '45%');

  // Edge boundaries
  assert.strictEqual(clampLikelihood(0), 0);
  assert.strictEqual(formatLikelihoodPct(0), '0%');
  assert.strictEqual(clampLikelihood(1), 1);
  assert.strictEqual(formatLikelihoodPct(1), '100%');

  // Clamping over/under
  assert.strictEqual(clampLikelihood(-0.5), 0);
  assert.strictEqual(formatLikelihoodPct(-0.5), '0%');
  assert.strictEqual(clampLikelihood(1.8), 1);
  assert.strictEqual(formatLikelihoodPct(1.8), '100%');

  // Non-numeric or non-finite inputs fail-closed to 0
  assert.strictEqual(clampLikelihood(NaN), 0);
  assert.strictEqual(formatLikelihoodPct(NaN), '0%');
  assert.strictEqual(clampLikelihood(Infinity), 0);
  assert.strictEqual(formatLikelihoodPct(Infinity), '0%');
  assert.strictEqual(clampLikelihood(-Infinity), 0);
  assert.strictEqual(formatLikelihoodPct(-Infinity), '0%');
  assert.strictEqual(clampLikelihood('0.75'), 0);
  assert.strictEqual(formatLikelihoodPct('0.75'), '0%');
  assert.strictEqual(clampLikelihood(null), 0);
  assert.strictEqual(formatLikelihoodPct(null), '0%');
  assert.strictEqual(clampLikelihood(undefined), 0);
  assert.strictEqual(formatLikelihoodPct(undefined), '0%');
});

test('filterFutures: basic goal filtering and multi-goal scenarios', () => {
  const sample = [
    { id: 'SC-1', title: 'Agent Containment Breach', goals: [1] },
    { id: 'SC-2', title: 'Decentralized Civic Deliberation', goals: [2] },
    { id: 'SC-3', title: 'Non-Fiat Value Network', goals: [3] },
    { id: 'SC-4', title: 'Dual Goal Scenario', goals: [1, 6] },
    { id: 'SC-5', title: 'Twin Private Memory', goals: [6] },
  ];

  const all = filterFutures(sample, 'all');
  assert.strictEqual(all.length, 5);

  const safety = filterFutures(sample, 'safety');
  assert.strictEqual(safety.length, 2);
  assert.deepStrictEqual(safety.map((s) => s.id), ['SC-1', 'SC-4']);

  const governance = filterFutures(sample, 'governance');
  assert.strictEqual(governance.length, 1);
  assert.strictEqual(governance[0].id, 'SC-2');

  const value = filterFutures(sample, 'value');
  assert.strictEqual(value.length, 1);
  assert.strictEqual(value[0].id, 'SC-3');

  const personal = filterFutures(sample, 'personal-agent');
  assert.strictEqual(personal.length, 2);
  assert.deepStrictEqual(personal.map((s) => s.id), ['SC-4', 'SC-5']);

  const simulation = filterFutures(sample, 'simulation');
  assert.strictEqual(simulation.length, 0);

  // Unknown or invalid goal key returns empty list
  const unknown = filterFutures(sample, 'unknown-goal');
  assert.strictEqual(unknown.length, 0);
});

test('filterFutures: fail-closed input bounds and malformed records', () => {
  assert.throws(() => filterFutures(null, 'all'), TypeError);
  assert.throws(() => filterFutures('not an array', 'all'), TypeError);
  assert.throws(() => filterFutures(12345, 'all'), TypeError);

  const dirtyList = [
    null,
    undefined,
    'string item',
    123,
    { id: 'valid-1', title: 'Valid 1', goals: [1] },
    { id: 'malformed-goals', title: 'Bad Goals', goals: 'not an array' },
    { id: 'missing-goals', title: 'No Goals' },
    { id: 'valid-2', title: 'Valid 2', goals: [2] },
  ];

  const filteredAll = filterFutures(dirtyList, 'all');
  assert.strictEqual(filteredAll.length, 4);

  const filteredSafety = filterFutures(dirtyList, 'safety');
  assert.strictEqual(filteredSafety.length, 1);
  assert.strictEqual(filteredSafety[0].id, 'valid-1');
});

test('searchFutures: keyword matching across fields', () => {
  const sample = [
    {
      id: 'SC-1',
      title: 'Persistent Multi-Agent Contagion',
      premise: 'Prompt-level guardrails collapse under persistent multi-agent dialogue.',
      world: 'Millions of commercial assistants reveal sensitive tokens in open channels.',
      how: 'Deterministic runtime execution filters partition memory from tool outputs.',
      pipelines: ['policy', 'simulation', 'software'],
    },
    {
      id: 'SC-2',
      title: 'Monoculture Risk on Device',
      premise: 'Identical edge parameters enable fleet-wide adversarial transferability.',
      world: 'Consumer laptops run identical model weights without local diversity.',
      how: 'Kernel brokers enforce local parameter diversification.',
      pipelines: ['software', 'site'],
    },
  ];

  // Match title
  const matchTitle = searchFutures(sample, 'Contagion');
  assert.strictEqual(matchTitle.length, 1);
  assert.strictEqual(matchTitle[0].id, 'SC-1');

  // Match premise
  const matchPremise = searchFutures(sample, 'fleet-wide');
  assert.strictEqual(matchPremise.length, 1);
  assert.strictEqual(matchPremise[0].id, 'SC-2');

  // Match world
  const matchWorld = searchFutures(sample, 'Consumer laptops');
  assert.strictEqual(matchWorld.length, 1);
  assert.strictEqual(matchWorld[0].id, 'SC-2');

  // Match how
  const matchHow = searchFutures(sample, 'Deterministic runtime');
  assert.strictEqual(matchHow.length, 1);
  assert.strictEqual(matchHow[0].id, 'SC-1');

  // Match pipeline
  const matchPipeline = searchFutures(sample, 'policy');
  assert.strictEqual(matchPipeline.length, 1);
  assert.strictEqual(matchPipeline[0].id, 'SC-1');

  const matchSharedPipeline = searchFutures(sample, 'software');
  assert.strictEqual(matchSharedPipeline.length, 2);

  // Empty or non-string query returns all valid items
  assert.strictEqual(searchFutures(sample, '').length, 2);
  assert.strictEqual(searchFutures(sample, '   ').length, 2);
  assert.strictEqual(searchFutures(sample, null).length, 2);
});

test('calculateGoalCounts: accurate aggregation and live count badges', () => {
  const sample = [
    { id: 'SC-1', goals: [1] },
    { id: 'SC-2', goals: [1, 6] },
    { id: 'SC-3', goals: [2] },
    { id: 'SC-4', goals: [3, 4, 5] },
    { id: 'SC-5', goals: [6] },
  ];

  const counts = calculateGoalCounts(sample);
  assert.strictEqual(counts.all, 5);
  assert.strictEqual(counts.safety, 2);
  assert.strictEqual(counts.governance, 1);
  assert.strictEqual(counts.value, 1);
  assert.strictEqual(counts.simulation, 1);
  assert.strictEqual(counts.forecasting, 1);
  assert.strictEqual(counts['personal-agent'], 2);
});

test('combined goal filtering and keyword search', () => {
  const sample = [
    { id: 'SC-1', title: 'Safety Protocol Alpha', premise: 'Hardware isolation', goals: [1], pipelines: ['software'] },
    { id: 'SC-2', title: 'Safety Protocol Beta', premise: 'Cooperative simulation', goals: [1, 4], pipelines: ['simulation'] },
    { id: 'SC-3', title: 'Governance Protocol Alpha', premise: 'Hardware isolation in voting', goals: [2], pipelines: ['software'] },
  ];

  // Filter by safety, then search "Hardware"
  const safetyItems = filterFutures(sample, 'safety');
  const matched = searchFutures(safetyItems, 'Hardware');
  assert.strictEqual(matched.length, 1);
  assert.strictEqual(matched[0].id, 'SC-1');

  // Filter by governance, then search "Beta"
  const govItems = filterFutures(sample, 'governance');
  const emptyMatch = searchFutures(govItems, 'Beta');
  assert.strictEqual(emptyMatch.length, 0);
});
