// Reading Comprehension Error Handler
// Centralised error handling, logging, retry logic, and graceful degradation

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 500;

/**
 * Retry an async operation with exponential backoff.
 * @param {Function} fn - async function to retry
 * @param {number} retries - max attempts
 * @returns {Promise<any>}
 */
export async function withRetry(fn, retries = MAX_RETRIES) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await _sleep(RETRY_BASE_MS * Math.pow(2, i));
      }
    }
  }
  throw lastErr;
}

/**
 * Wrap an async operation with a fallback value on failure.
 * @param {Function} fn
 * @param {any} fallback
 */
export async function withFallback(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    logError('withFallback', err);
    return fallback;
  }
}

/**
 * Log an error with context for debugging.
 */
export function logError(context, err, extra = {}) {
  const entry = {
    context,
    message: err?.message || String(err),
    stack: err?.stack,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    ...extra
  };
  console.warn(`[RC Error] ${context}:`, entry);
  _persistLog(entry);
}

/**
 * Log a performance metric.
 */
export function logPerf(label, durationMs) {
  if (durationMs > 300) {
    console.warn(`[RC Perf] ${label} took ${durationMs}ms (target <300ms)`);
  }
}

/**
 * Log a user action event.
 */
export function logEvent(action, detail = {}) {
  // Lightweight event log — extend with analytics if needed
  console.debug(`[RC Event] ${action}`, detail);
}

/**
 * Get user-friendly error message for known error types.
 */
export function getFriendlyMessage(err) {
  if (!err) return 'An unexpected error occurred.';
  const name = err.name || '';
  if (name === 'PassageNotFoundError') return 'This passage could not be found.';
  if (name === 'PassageValidationError') return 'This passage has invalid content.';
  if (name === 'QuestionLoadError') return 'Questions could not be loaded for this passage.';
  if (err.message?.includes('network') || err.message?.includes('fetch'))
    return 'Network error. Please check your connection and try again.';
  if (err.message?.includes('quota') || err.message?.includes('storage'))
    return 'Storage is full. Please clear some space and try again.';
  return 'Something went wrong. Please try again.';
}

/**
 * Retrieve stored error log (last 50 entries).
 */
export function getErrorLog() {
  try {
    const raw = localStorage.getItem('rc_error_log');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function _persistLog(entry) {
  try {
    const log = getErrorLog();
    log.push(entry);
    const trimmed = log.slice(-50);
    localStorage.setItem('rc_error_log', JSON.stringify(trimmed));
  } catch { /* ignore storage errors in error handler */ }
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
