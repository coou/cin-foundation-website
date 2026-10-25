// Pure business logic for the futures portal: goal filtering, keyword search, count calculation, and metric clamping.

export const FUTURES_GOALS = Object.freeze({
  all: 'All goals',
  safety: 'AI safety',
  governance: 'Governance',
  value: 'Transparent value',
  simulation: 'Simulation',
  forecasting: 'Forecasting',
  'personal-agent': 'Personal agents',
});

export const GOAL_ID_TO_KEY = Object.freeze({
  1: 'safety',
  2: 'governance',
  3: 'value',
  4: 'simulation',
  5: 'forecasting',
  6: 'personal-agent',
});

export const GOAL_KEY_TO_ID = Object.freeze({
  safety: 1,
  governance: 2,
  value: 3,
  simulation: 4,
  forecasting: 5,
  'personal-agent': 6,
});

/**
 * Clamp a likelihood probability value strictly between 0 and 1.
 * Non-numeric or non-finite inputs fail-closed to 0.
 * @param {any} val
 * @returns {number}
 */
export function clampLikelihood(val) {
  if (typeof val !== 'number' || !Number.isFinite(val)) {
    return 0;
  }
  return Math.min(1, Math.max(0, val));
}

/**
 * Format a likelihood decimal value as a percentage string (0% - 100%).
 * @param {any} val
 * @returns {string}
 */
export function formatLikelihoodPct(val) {
  return Math.round(100 * clampLikelihood(val)) + '%';
}

/**
 * Sanitize an array of scenario items, filtering out null, non-objects, or prototype pollution attempts.
 * @param {Array<any>} items
 * @returns {Array<Object>}
 */
function sanitizeItems(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an Array');
  }
  return items.filter((item) => {
    if (item === null || typeof item !== 'object') {
      return false;
    }
    // Prototype pollution defense
    if (Object.hasOwn(item, '__proto__') || Object.hasOwn(item, 'constructor')) {
      return false;
    }
    return true;
  });
}

/**
 * Filter scenarios by strategic goal key.
 * @param {Array<Object>} items
 * @param {string} goalKey
 * @returns {Array<Object>}
 */
export function filterFutures(items, goalKey = 'all') {
  const validItems = sanitizeItems(items);
  const normalized = typeof goalKey === 'string' ? goalKey.trim().toLowerCase() : 'all';

  if (normalized === 'all' || !normalized) {
    return validItems;
  }

  if (!Object.hasOwn(GOAL_KEY_TO_ID, normalized)) {
    return [];
  }

  const targetGoalId = GOAL_KEY_TO_ID[normalized];

  return validItems.filter((item) => {
    if (!Object.hasOwn(item, 'goals') || !Array.isArray(item.goals)) {
      return false;
    }
    return item.goals.includes(targetGoalId);
  });
}

/**
 * Search scenarios across title, premise, world description, how, and work pipelines.
 * @param {Array<Object>} items
 * @param {string} query
 * @returns {Array<Object>}
 */
export function searchFutures(items, query = '') {
  const validItems = sanitizeItems(items);
  if (typeof query !== 'string') {
    return validItems;
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return validItems;
  }

  return validItems.filter((item) => {
    const title = typeof item.title === 'string' ? item.title.toLowerCase() : '';
    const premise = typeof item.premise === 'string' ? item.premise.toLowerCase() : '';
    const world = typeof item.world === 'string' ? item.world.toLowerCase() : '';
    const how = typeof item.how === 'string' ? item.how.toLowerCase() : '';
    const pipelines = Array.isArray(item.pipelines)
      ? item.pipelines.filter((p) => typeof p === 'string').join(' ').toLowerCase()
      : '';

    return (
      title.includes(q) ||
      premise.includes(q) ||
      world.includes(q) ||
      how.includes(q) ||
      pipelines.includes(q)
    );
  });
}

/**
 * Calculate scenario counts for each goal and total.
 * @param {Array<Object>} items
 * @returns {Record<string, number>}
 */
export function calculateGoalCounts(items) {
  const validItems = sanitizeItems(items);
  const counts = {};
  for (const key of Object.keys(FUTURES_GOALS)) {
    counts[key] = 0;
  }

  for (const item of validItems) {
    counts.all += 1;
    if (Object.hasOwn(item, 'goals') && Array.isArray(item.goals)) {
      const seenGoalsInItem = new Set();
      for (const g of item.goals) {
        if (typeof g === 'number' && Object.hasOwn(GOAL_ID_TO_KEY, g)) {
          const key = GOAL_ID_TO_KEY[g];
          if (!seenGoalsInItem.has(key)) {
            seenGoalsInItem.add(key);
            counts[key] += 1;
          }
        }
      }
    }
  }

  return counts;
}
