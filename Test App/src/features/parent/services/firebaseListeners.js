/**
 * Firebase Real-Time Listeners for Analytics Dashboard
 * Wraps Firebase onValue listeners with debouncing and cleanup.
 */

const DEBOUNCE_MS = 500;
const _timers = {};
const _listeners = {};

/**
 * Debounce a callback by key.
 * @param {string} key
 * @param {Function} fn
 */
function debounce(key, fn) {
  clearTimeout(_timers[key]);
  _timers[key] = setTimeout(fn, DEBOUNCE_MS);
}

/**
 * Set up a progress update listener.
 * Calls onUpdate(progress) debounced at 500ms.
 * @param {object} db - Firebase database instance
 * @param {string} userId
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} unsubscribe
 */
export function listenToProgress(db, userId, onUpdate, onError) {
  if (!db || !userId) return () => {};
  try {
    // Dynamic import to avoid Firebase ESM issues in tests
    const ref = db.ref ? db.ref(`users/${userId}/progress`) : null;
    if (!ref) return () => {};

    const handler = (snapshot) => {
      debounce(`progress_${userId}`, () => {
        try { onUpdate(snapshot.val() || {}); } catch (e) { onError?.(e); }
      });
    };

    ref.on('value', handler, (err) => onError?.(err));
    _listeners[`progress_${userId}`] = () => ref.off('value', handler);
    return _listeners[`progress_${userId}`];
  } catch (e) {
    onError?.(e);
    return () => {};
  }
}

/**
 * Set up a goals update listener.
 * @param {object} db
 * @param {string} userId
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} unsubscribe
 */
export function listenToGoals(db, userId, onUpdate, onError) {
  if (!db || !userId) return () => {};
  try {
    const ref = db.ref ? db.ref(`users/${userId}/goals`) : null;
    if (!ref) return () => {};

    const handler = (snapshot) => {
      debounce(`goals_${userId}`, () => {
        try { onUpdate(snapshot.val() || []); } catch (e) { onError?.(e); }
      });
    };

    ref.on('value', handler, (err) => onError?.(err));
    _listeners[`goals_${userId}`] = () => ref.off('value', handler);
    return _listeners[`goals_${userId}`];
  } catch (e) {
    onError?.(e);
    return () => {};
  }
}

/**
 * Remove all active listeners (call on component unmount).
 */
export function removeAllListeners() {
  Object.values(_listeners).forEach(unsub => { try { unsub(); } catch { /* ignore */ } });
  Object.keys(_listeners).forEach(k => delete _listeners[k]);
  Object.keys(_timers).forEach(k => { clearTimeout(_timers[k]); delete _timers[k]; });
}

/**
 * Check if online and set up auto-refresh on reconnect.
 * @param {Function} onReconnect
 * @returns {Function} cleanup
 */
export function setupOnlineListener(onReconnect) {
  const handler = () => { if (navigator.onLine) onReconnect?.(); };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
