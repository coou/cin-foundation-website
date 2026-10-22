// Pure logic and deterministic filtering helpers for public ideas.
// Exported for testing and browser runtime.

export const IDEA_CATEGORIES = Object.freeze({
  all: 'All ideas',
  safety: 'Safe AI and containment',
  collective: 'Deciding together',
  value: 'Value and contribution',
  simulation: 'Simulations',
  forecast: 'Forecasting',
  interface: 'Your agent and interface',
  other: 'Something else',
});

export const IDEA_STATUSES = Object.freeze({
  accepted: Object.freeze(['Taken up', 'ok']),
  'in-progress': Object.freeze(['Being worked on', 'wip']),
  done: Object.freeze(['Done', 'ok']),
  declined: Object.freeze(['Not now', 'no']),
  reviewing: Object.freeze(['Under review', 'wip']),
});

const VALID_CATEGORIES = new Set(Object.keys(IDEA_CATEGORIES).filter((k) => k !== 'all'));

/**
 * Filter an array of ideas by selected category.
 * Fails closed against null or malformed records.
 */
export function filterIdeas(ideas, activeCategory = 'all') {
  if (!Array.isArray(ideas)) {
    throw new TypeError('ideas must be an array');
  }
  const category = typeof activeCategory === 'string' ? activeCategory.toLowerCase().trim() : 'all';

  return ideas.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const s = item.status || {};
    if (s.status === 'hidden') return false;

    if (category === 'all') return true;

    const data = item.data || {};
    const raw = typeof data.category === 'string' ? data.category.toLowerCase().trim() : 'other';
    const itemCat = VALID_CATEGORIES.has(raw) ? raw : 'other';
    return itemCat === category;
  });
}

/**
 * Calculate distribution of visible ideas across all supported categories.
 */
export function calculateCategoryCounts(ideas) {
  if (!Array.isArray(ideas)) {
    throw new TypeError('ideas must be an array');
  }

  const counts = {
    all: 0,
    safety: 0,
    collective: 0,
    value: 0,
    simulation: 0,
    forecast: 0,
    interface: 0,
    other: 0,
  };

  for (const item of ideas) {
    if (!item || typeof item !== 'object') continue;
    const s = item.status || {};
    if (s.status === 'hidden') continue;

    counts.all += 1;
    const data = item.data || {};
    const cat = typeof data.category === 'string' ? data.category.toLowerCase().trim() : 'other';
    if (VALID_CATEGORIES.has(cat)) {
      counts[cat] += 1;
    } else {
      counts.other += 1;
    }
  }

  return counts;
}

/**
 * Validate new idea payload prior to submission.
 */
export function validateIdeaSubmission(title, body, category) {
  if (typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 120) {
    return { ok: false, error: 'Title must be between 5 and 120 characters.' };
  }
  if (typeof body !== 'string' || body.trim().length < 20 || body.trim().length > 4000) {
    return { ok: false, error: 'Description must be between 20 and 4,000 characters.' };
  }
  const cleanCat = typeof category === 'string' ? category.toLowerCase().trim() : '';
  if (!VALID_CATEGORIES.has(cleanCat)) {
    return { ok: false, error: 'Please choose a valid category.' };
  }
  return { ok: true, error: null };
}
