/**
 * Preferences Service — dashboard layout and display preferences
 */
const PREFS_KEY = 'aad_preferences';

const DEFAULTS = {
  layout: 'grid',           // 'grid' | 'list'
  showMetrics: ['readiness', 'accuracy', 'xp', 'questions', 'daysToExam', 'lastActive'],
  showCharts: ['radar', 'trend', 'gauge'],
  notifications: true,
  alertThresholds: { performanceDrop: 10, inactivityDays: 7, milestoneAccuracy: 90 },
  trendPeriod: 30,
  language: 'en',
};

/**
 * Load preferences from localStorage (merged with defaults).
 * @returns {object}
 */
export function loadPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULTS }; }
}

/**
 * Save preferences to localStorage and optionally sync to Firebase.
 * @param {object} prefs
 */
export function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPreferences(), ...prefs }));
  } catch { /* storage full */ }
}

/**
 * Reset preferences to defaults.
 */
export function resetPreferences() {
  try { localStorage.removeItem(PREFS_KEY); } catch { /* ignore */ }
}

/**
 * Update a single preference key.
 * @param {string} key
 * @param {*} value
 */
export function setPreference(key, value) {
  savePreferences({ [key]: value });
}

/**
 * Get a single preference value.
 * @param {string} key
 * @returns {*}
 */
export function getPreference(key) {
  return loadPreferences()[key];
}
