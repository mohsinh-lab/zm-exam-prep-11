/**
 * Dashboard Service — Calculates analytics metrics from progress store data
 */
import { getProgress } from '../../../engine/progressStore.js';
import { getSubjectMastery } from '../../../engine/adaptiveEngine.js';
import { calculateReadiness } from '../../../engine/readinessEngine.js';

export const SUBJECT_KEYS = ['maths', 'en', 'vr', 'nvr'];
export const SUBJECT_NAMES = { maths: 'Maths', en: 'English', vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning' };
export const SUBJECT_COLORS = { maths: '#6366f1', en: '#10b981', vr: '#f59e0b', nvr: '#ec4899' };

/**
 * Calculate all dashboard metrics from progress data
 * @param {object} progress - progress store data
 * @returns {object} DashboardMetrics
 */
export function calculateDashboardMetrics(progress) {
  const sessions = progress.sessions || [];
  const totalQ = sessions.reduce((s, x) => s + (x.total || 0), 0);
  const avgAcc = sessions.length
    ? Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length)
    : 0;

  const subjectScores = {};
  for (const sub of SUBJECT_KEYS) {
    subjectScores[sub] = Math.min(100, Math.round((getSubjectMastery(progress, sub) % 100) || 0));
  }

  const readinessScore = calculateReadiness(progress);

  const examDate = new Date('2026-09-15');
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((examDate - now) / 86400000));
  const totalDays = Math.ceil((examDate - new Date('2026-01-01')) / 86400000);
  const progressPct = Math.min(100, Math.round(((totalDays - daysLeft) / totalDays) * 100));

  const lastSession = sessions.length ? sessions[sessions.length - 1] : null;
  const lastActivity = lastSession ? new Date(lastSession.date) : null;
  const daysSinceActivity = lastActivity
    ? Math.floor((now - lastActivity) / 86400000)
    : null;

  return {
    examReadinessScore: readinessScore,
    progressPercentage: progressPct,
    totalXP: progress.xp || 0,
    totalQuestionsCompleted: totalQ,
    averageAccuracy: avgAcc,
    daysUntilExam: daysLeft,
    lastActivityDate: lastActivity ? lastActivity.toISOString() : null,
    daysSinceActivity,
    subjectScores,
    sessionCount: sessions.length,
  };
}

/**
 * Get performance trend data grouped by day for the last N days
 * @param {object} progress
 * @param {number} days
 * @returns {Array<{date, maths, en, vr, nvr, overall}>}
 */
export function getPerformanceTrends(progress, days = 30) {
  const sessions = progress.sessions || [];
  const result = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const daySessions = sessions.filter(s => new Date(s.date).toDateString() === dateStr);

    const bySubject = {};
    for (const sub of SUBJECT_KEYS) {
      const subSessions = daySessions.filter(s => s.subject === sub);
      bySubject[sub] = subSessions.length
        ? Math.round(subSessions.reduce((s, x) => s + x.score, 0) / subSessions.length)
        : null;
    }

    const allScores = daySessions.map(s => s.score);
    const overall = allScores.length
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null;

    result.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      ...bySubject,
      overall,
      sessionCount: daySessions.length,
    });
  }

  return result;
}

/**
 * Calculate trend direction for a subject over recent sessions
 * @returns {'up'|'down'|'stable'}
 */
export function getTrendDirection(progress, subject) {
  const sessions = (progress.sessions || []).filter(s => s.subject === subject);
  if (sessions.length < 4) return 'stable';
  const recent = sessions.slice(-3).reduce((s, x) => s + x.score, 0) / 3;
  const prev = sessions.slice(-6, -3).reduce((s, x) => s + x.score, 0) / Math.max(1, sessions.slice(-6, -3).length);
  if (recent > prev + 3) return 'up';
  if (recent < prev - 3) return 'down';
  return 'stable';
}

/**
 * Generate performance alerts based on progress data
 * @returns {Array<Alert>}
 */
export function generateAlerts(progress) {
  const alerts = [];
  const sessions = progress.sessions || [];
  const now = Date.now();

  // Inactivity alert
  if (sessions.length > 0) {
    const lastDate = new Date(sessions[sessions.length - 1].date);
    const daysSince = Math.floor((now - lastDate) / 86400000);
    if (daysSince >= 7) {
      alerts.push({
        id: 'inactivity',
        type: 'inactivity',
        severity: 'warning',
        message: `No activity for ${daysSince} days. Time to get back on track!`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Performance drop alert (per subject)
  for (const sub of SUBJECT_KEYS) {
    const subSessions = sessions.filter(s => s.subject === sub);
    if (subSessions.length >= 6) {
      const recent = subSessions.slice(-3).reduce((s, x) => s + x.score, 0) / 3;
      const prev = subSessions.slice(-6, -3).reduce((s, x) => s + x.score, 0) / 3;
      if (prev - recent > 10) {
        alerts.push({
          id: `drop_${sub}`,
          type: 'performance_drop',
          severity: 'warning',
          message: `${SUBJECT_NAMES[sub]} accuracy dropped by ${Math.round(prev - recent)}% recently.`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // Milestone alerts
  for (const sub of SUBJECT_KEYS) {
    const subSessions = sessions.filter(s => s.subject === sub);
    if (subSessions.length >= 3) {
      const recent = subSessions.slice(-3).reduce((s, x) => s + x.score, 0) / 3;
      if (recent >= 90) {
        alerts.push({
          id: `milestone_${sub}`,
          type: 'milestone',
          severity: 'success',
          message: `${SUBJECT_NAMES[sub]} is at ${Math.round(recent)}% accuracy — excellent work!`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return alerts;
}

/**
 * Calculate predicted score range based on current trajectory
 * @returns {{ lower: number, upper: number, confidence: number }}
 */
export function getPrediction(progress) {
  const sessions = progress.sessions || [];
  if (sessions.length < 3) {
    return { lower: 50, upper: 70, confidence: 70 };
  }

  const recent = sessions.slice(-10);
  const avg = recent.reduce((s, x) => s + x.score, 0) / recent.length;

  // Consistency = inverse of std dev
  const variance = recent.reduce((s, x) => s + Math.pow(x.score - avg, 2), 0) / recent.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 1 - stdDev / 50);
  const confidence = Math.round(70 + consistency * 30);

  const margin = Math.round(5 + (1 - consistency) * 10);
  return {
    lower: Math.max(0, Math.round(avg) - margin),
    upper: Math.min(100, Math.round(avg) + margin),
    confidence,
  };
}

/**
 * Get recommended focus areas (subjects with lowest scores)
 * @returns {Array<{subject, score, name}>}
 */
export function getRecommendedFocus(progress) {
  const metrics = calculateDashboardMetrics(progress);
  return SUBJECT_KEYS
    .map(sub => ({ subject: sub, score: metrics.subjectScores[sub], name: SUBJECT_NAMES[sub] }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
}
