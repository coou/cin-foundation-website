// Pure business logic for the recognition portal: category filtering, keyword search, and item counts.

export const RECOGNITION_KINDS = Object.freeze({
  all: 'All',
  safety: 'Safety work',
  governance: 'Good governance',
  prediction: 'Forecasts',
  research: 'Research',
  'open-source': 'Open source',
  product: 'Products',
  disclosure: 'Disclosures',
  community: 'Community',
});

/**
 * Filter recognition entries by category/kind.
 * @param {Array<Object>} items
 * @param {string} kind
 * @returns {Array<Object>}
 */
export function filterRecognition(items, kind = 'all') {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an Array');
  }

  const normalized = typeof kind === 'string' ? kind.trim().toLowerCase() : 'all';
  const validItems = items.filter((item) => item !== null && typeof item === 'object');

  if (normalized === 'all' || !normalized) {
    return validItems;
  }

  return validItems.filter((item) => {
    if (!Object.hasOwn(item, 'kind') || typeof item.kind !== 'string') {
      return false;
    }
    return item.kind.trim().toLowerCase() === normalized;
  });
}

/**
 * Filter recognition entries by keyword search across who, what, why, title, and kind.
 * @param {Array<Object>} items
 * @param {string} query
 * @returns {Array<Object>}
 */
export function searchRecognition(items, query = '') {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an Array');
  }

  const validItems = items.filter((item) => item !== null && typeof item === 'object');
  if (typeof query !== 'string') {
    return validItems;
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return validItems;
  }

  return validItems.filter((item) => {
    const who = typeof item.who === 'string' ? item.who.toLowerCase() : '';
    const what = typeof item.what === 'string' ? item.what.toLowerCase() : '';
    const why = typeof item.why === 'string' ? item.why.toLowerCase() : '';
    const title = typeof item.title === 'string' ? item.title.toLowerCase() : '';
    const kind = typeof item.kind === 'string' ? item.kind.toLowerCase() : '';
    return who.includes(q) || what.includes(q) || why.includes(q) || title.includes(q) || kind.includes(q);
  });
}

/**
 * Calculate item counts for each recognized kind and total.
 * @param {Array<Object>} items
 * @returns {Record<string, number>}
 */
export function calculateKindCounts(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an Array');
  }

  const counts = {};
  for (const key of Object.keys(RECOGNITION_KINDS)) {
    counts[key] = 0;
  }

  for (const item of items) {
    if (item === null || typeof item !== 'object') {
      continue;
    }
    counts.all += 1;
    if (Object.hasOwn(item, 'kind') && typeof item.kind === 'string') {
      const k = item.kind.trim().toLowerCase();
      if (Object.hasOwn(RECOGNITION_KINDS, k)) {
        counts[k] += 1;
      }
    }
  }

  return counts;
}
