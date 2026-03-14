/**
 * Alert Engine — Performance monitoring and alert generation
 */
import { SUBJECT_KEYS, SUBJECT_NAMES } from './dashboardService.js';

const DISMISSED_KEY = 'aad_dismissed_alerts';

/**
 * Detect performance drop (>10% decrease) for a subject.
 * @param {Array} sessions
 * @param {string} subject
 * @returns {{ dropped: boolean, amount: number }}
 */
export function detectPerformanceDrop(sessions, subject) {
  const subSessions = sessions.filter(s => s.subject === subject);
  if (subSessions.length < 6) return { dropped: false, amount: 0 };
  const recent = subSessions.slice(-3).reduce((s, x) => s + x.score, 0) / 3;
  const prev = subSessions.slice(-6, -3).reduce((s, x) => s + x.score, 0) / 3;
  const drop = prev - recent;
  return { dropped: drop > 10, amount: Math.round(drop) };
}

/**
 * Detect milestone achievement (90%+ accuracy over last 3 sessions).
 * @param {Array} sessions
 * @param {string} subject
 * @returns {boolean}
 */
export function detectMilestone(sessions, subject) {
  const subSessions = sessions.filter(s => s.subject === subject);
  if (subSessions.length < 3) return false;
  const recent = subSessions.slice(-3).reduce((s, x) => s + x.score, 0) / 3;
  return recent >= 90;
}

/**
 * Detect inactivity (7+ days since last session).
 * @param {Array} sessions
 * @returns {{ inactive: boolean, days: number }}
 */
export function detectInactivity(sessions) {
  if (sessions.length === 0) return { inactive: false, days: 0 };
  const lastDate = new Date(sessions[sessions.length - 1].date);
  const days = Math.floor((Date.now() - lastDate) / 86400000);
  return { inactive: days >= 7, days };
}

/**
 * Generate all alerts for a student's progress.
 * @param {object} progress
 * @returns {Array<Alert>}
 */
export function generateAlerts(progress) {
  const sessions = progress.sessions || [];
  const alerts = [];

  // Inactivity
  const { inactive, days } = detectInactivity(sessions);
  if (inactive) {
    alerts.push({
      id: 'inactivity',
      type: 'inactivity',
      severity: 'warning',
      message: `No activity for ${days} days. Time to get back on track!`,
      timestamp: new Date().toISOString(),
    });
  }

  // Per-subject: drops and milestones
  for (const sub of SUBJECT_KEYS) {
    const { dropped, amount } = detectPerformanceDrop(sessions, sub);
    if (dropped) {
      alerts.push({
        id: `drop_${sub}`,
        type: 'performance_drop',
        severity: 'warning',
        message: `${SUBJECT_NAMES[sub]} accuracy dropped by ${amount}% recently.`,
        timestamp: new Date().toISOString(),
      });
    }

    if (detectMilestone(sessions, sub)) {
      alerts.push({
        id: `milestone_${sub}`,
        type: 'milestone',
        severity: 'success',
        message: `${SUBJECT_NAMES[sub]} is at 90%+ accuracy — excellent work!`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

/**
 * Dismiss an alert by ID (persists to localStorage).
 * @param {string} alertId
 */
export function dismissAlert(alertId) {
  const dismissed = getDismissedAlerts();
  if (!dismissed.includes(alertId)) {
    dismissed.push(alertId);
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed)); } catch { /* ignore */ }
  }
}

/**
 * Get list of dismissed alert IDs.
 * @returns {string[]}
 */
export function getDismissedAlerts() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { return []; }
}

/**
 * Clear all dismissed alerts.
 */
export function clearDismissedAlerts() {
  try { localStorage.removeItem(DISMISSED_KEY); } catch { /* ignore */ }
}

/**
 * Get only visible (non-dismissed) alerts.
 * @param {object} progress
 * @returns {Array<Alert>}
 */
export function getVisibleAlerts(progress) {
  const all = generateAlerts(progress);
  const dismissed = getDismissedAlerts();
  return all.filter(a => !dismissed.includes(a.id));
}
