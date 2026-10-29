import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DOM_READINESS_CONFIG,
  ALLOWED_DOM_READINESS_STATUSES,
  ALLOWED_SETTLED_METRICS_FIELDS,
  evaluateSettledState,
  waitForSettledState,
  benchmarkActuationSequence,
  summarizeSettledState
} from '../assets/twin-core.js';

test('DOM readiness constants are deeply frozen and valid', () => {
  assert.equal(DEFAULT_DOM_READINESS_CONFIG.quiet_window_ms, 25);
  assert.equal(DEFAULT_DOM_READINESS_CONFIG.max_wait_ms, 500);
  assert.equal(DEFAULT_DOM_READINESS_CONFIG.target_settle_threshold_ms, 50);
  assert.equal(DEFAULT_DOM_READINESS_CONFIG.conservative_baseline_ms, 500);

  assert.ok(Object.isFrozen(DEFAULT_DOM_READINESS_CONFIG));
  assert.ok(Object.isFrozen(ALLOWED_DOM_READINESS_STATUSES));
  assert.ok(Object.isFrozen(ALLOWED_SETTLED_METRICS_FIELDS));

  assert.throws(() => {
    DEFAULT_DOM_READINESS_CONFIG.quiet_window_ms = 999;
  });
});

test('evaluateSettledState resolves within 50ms on non-mutating UI targets (Acceptance 1)', () => {
  const result = evaluateSettledState([]);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'immediate_ready');
  assert.ok(result.elapsed_ms <= 50, `Expected elapsed_ms <= 50, got ${result.elapsed_ms}`);
  assert.equal(result.elapsed_ms, 25);
  assert.equal(result.mutation_count, 0);
  assert.equal(result.timed_out, false);
  assert.ok(result.reason.includes('50ms threshold'));
  assert.ok(Object.isFrozen(result));
});

test('evaluateSettledState resolves when mutations quiesce cleanly', () => {
  const timeline = [
    { at_ms: 10, target: 'input#search', type: 'attributes' },
    { at_ms: 20, target: 'div.suggestions', type: 'childList' },
    { at_ms: 35, target: 'div.suggestions', type: 'childList' }
  ];

  const result = evaluateSettledState(timeline, { quiet_window_ms: 25 });
  assert.equal(result.ok, true);
  assert.equal(result.status, 'settled');
  assert.equal(result.elapsed_ms, 35 + 25); // 60ms
  assert.equal(result.mutation_count, 3);
  assert.equal(result.timed_out, false);
  assert.ok(result.reason.includes('quiescent_window_satisfied') || result.reason.includes('settled'));
  assert.ok(Object.isFrozen(result));
});

test('evaluateSettledState triggers fail-closed fallback timeout on continuous mutations (Acceptance 3)', () => {
  // Continuous mutations every 10ms that never quiesce past 25ms quiet window
  const infiniteMutations = [];
  for (let t = 10; t <= 600; t += 10) {
    infiniteMutations.push({ at_ms: t, target: 'div.ticker', type: 'characterData' });
  }

  const result = evaluateSettledState(infiniteMutations, { quiet_window_ms: 25, max_wait_ms: 300 });
  assert.equal(result.ok, true);
  assert.equal(result.status, 'timeout_fallback');
  assert.equal(result.elapsed_ms, 300);
  assert.equal(result.timed_out, true);
  assert.ok(result.reason.includes('safe fallback'));
  assert.ok(Object.isFrozen(result));
});

test('evaluateSettledState fails closed on malformed or invalid inputs', () => {
  // Non-array timeline
  const r1 = evaluateSettledState('not-an-array');
  assert.equal(r1.ok, false);
  assert.equal(r1.status, 'error');

  // Non-object options
  const r2 = evaluateSettledState([], 'invalid-options');
  assert.equal(r2.ok, false);

  // Unknown option key
  const r3 = evaluateSettledState([], { unknown_param: 123 });
  assert.equal(r3.ok, false);
  assert.equal(r3.diagnostics, 'unknown_option');

  // Invalid quiet_window_ms
  const r4 = evaluateSettledState([], { quiet_window_ms: -5 });
  assert.equal(r4.ok, false);
  assert.equal(r4.diagnostics, 'invalid_quiet_window');

  // Invalid max_wait_ms <= quiet_window_ms
  const r5 = evaluateSettledState([], { quiet_window_ms: 50, max_wait_ms: 30 });
  assert.equal(r5.ok, false);
  assert.equal(r5.diagnostics, 'invalid_max_wait');

  // Out of order timeline events
  const r6 = evaluateSettledState([
    { at_ms: 50, target: 'div', type: 'childList' },
    { at_ms: 20, target: 'div', type: 'childList' }
  ]);
  assert.equal(r6.ok, false);
  assert.equal(r6.diagnostics, 'out_of_order_events');

  // Negative timestamp
  const r7 = evaluateSettledState([
    { at_ms: -10, target: 'div', type: 'childList' }
  ]);
  assert.equal(r7.ok, false);
  assert.equal(r7.diagnostics, 'invalid_event_timestamp');
});

test('benchmarkActuationSequence demonstrates >= 80% reduction in idle wait time (Acceptance 2)', () => {
  const fiveSteps = [
    { step_name: 'Open Menu', mutations: [] },
    { step_name: 'Select Tab', mutations: [] },
    { step_name: 'Focus Field', mutations: [] },
    { step_name: 'Type Query', mutations: [{ at_ms: 10, target: 'input', type: 'attributes' }] },
    { step_name: 'View Results', mutations: [] }
  ];

  const bench = benchmarkActuationSequence(fiveSteps, {
    conservative_baseline_ms: 500,
    quiet_window_ms: 25
  });

  assert.equal(bench.ok, true);
  assert.equal(bench.step_count, 5);
  assert.equal(bench.total_baseline_ms, 2500); // 5 * 500ms
  // Step 1: 25ms, Step 2: 25ms, Step 3: 25ms, Step 4: 10+25=35ms, Step 5: 25ms => 135ms total
  assert.equal(bench.total_adaptive_ms, 135);
  assert.equal(bench.time_saved_ms, 2365);
  assert.ok(bench.reduction_percent >= 80.0, `Expected reduction >= 80%, got ${bench.reduction_percent}%`);
  assert.equal(bench.meets_target_reduction, true);
  assert.ok(Object.isFrozen(bench));
});

test('benchmarkActuationSequence fails closed on invalid step arrays', () => {
  const b1 = benchmarkActuationSequence([]);
  assert.equal(b1.ok, false);
  assert.equal(b1.step_count, 0);

  const b2 = benchmarkActuationSequence(null);
  assert.equal(b2.ok, false);
});

test('waitForSettledState functions with test adapter and resolves promptly', async () => {
  const mockAdapter = {
    simulateEvents() {
      return [
        { at_ms: 5, target: 'span', type: 'characterData' },
        { at_ms: 15, target: 'span', type: 'characterData' }
      ];
    }
  };

  const res = await waitForSettledState(mockAdapter, { quiet_window_ms: 25 });
  assert.equal(res.ok, true);
  assert.equal(res.status, 'settled');
  assert.equal(res.elapsed_ms, 40); // 15 + 25
  assert.equal(res.mutation_count, 2);
  assert.ok(Object.isFrozen(res));
});

test('summarizeSettledState produces plain language UI summary without internal jargon', () => {
  const readySummary = summarizeSettledState({
    ok: true,
    status: 'immediate_ready',
    elapsed_ms: 25,
    mutation_count: 0
  });
  assert.equal(readySummary.ok, true);
  assert.equal(readySummary.badge, 'Immediate Ready');
  assert.equal(readySummary.status_class, 'status-ok');
  assert.ok(!readySummary.text.includes('F1'));
  assert.ok(!readySummary.text.includes('ticket'));

  const timeoutSummary = summarizeSettledState({
    ok: true,
    status: 'timeout_fallback',
    elapsed_ms: 500
  });
  assert.equal(timeoutSummary.ok, true);
  assert.equal(timeoutSummary.badge, 'Safety Fallback');
  assert.equal(timeoutSummary.status_class, 'status-warn');

  const errorSummary = summarizeSettledState(null);
  assert.equal(errorSummary.ok, false);
  assert.equal(errorSummary.status_class, 'status-err');
});


test('twin-core.js ensures out-of-order mutation arrays fail closed cleanly (Revision 2)', async () => {
  // 1. evaluateSettledState fails closed on out-of-order array
  const outOfOrder = [
    { at_ms: 100, target: 'div', type: 'childList' },
    { at_ms: 20, target: 'div', type: 'childList' }
  ];
  const r1 = evaluateSettledState(outOfOrder);
  assert.equal(r1.ok, false);
  assert.equal(r1.status, 'error');
  assert.equal(r1.diagnostics, 'out_of_order_events');
  assert.ok(r1.reason.includes('monotonically non-decreasing'));

  // 2. evaluateSettledState fails closed on event timestamp before as_of_start_ms
  const pastEvent = [
    { at_ms: 20, target: 'div', type: 'childList' }
  ];
  const r2 = evaluateSettledState(pastEvent, { as_of_start_ms: 50 });
  assert.equal(r2.ok, false);
  assert.equal(r2.status, 'error');
  assert.equal(r2.diagnostics, 'out_of_order_events');

  // 3. benchmarkActuationSequence fails closed if any step has out-of-order mutations
  const stepsWithOutOfOrder = [
    { step_name: 'Valid step', mutations: [{ at_ms: 10, target: 'input', type: 'attributes' }] },
    { step_name: 'Corrupted step', mutations: outOfOrder }
  ];
  const benchResult = benchmarkActuationSequence(stepsWithOutOfOrder);
  assert.equal(benchResult.ok, false);
  assert.equal(benchResult.meets_target_reduction, false);
  assert.equal(benchResult.diagnostics, 'out_of_order_events');
  assert.ok(benchResult.reason.includes('Corrupted step'));

  // 4. waitForSettledState fails closed when adapter yields out-of-order events
  const badAdapter = {
    simulateEvents() {
      return outOfOrder;
    }
  };
  const waitResult = await waitForSettledState(badAdapter);
  assert.equal(waitResult.ok, false);
  assert.equal(waitResult.status, 'error');
  assert.equal(waitResult.diagnostics, 'out_of_order_events');

  // 5. waitForSettledState fails closed on invalid target
  const nullTargetResult = await waitForSettledState(null);
  assert.equal(nullTargetResult.ok, false);
  assert.equal(nullTargetResult.status, 'error');
  assert.equal(nullTargetResult.diagnostics, 'invalid_target');
});
