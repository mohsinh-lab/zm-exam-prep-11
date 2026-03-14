/**
 * Prediction Engine — Exam readiness scoring and trajectory prediction
 */
import { SUBJECT_KEYS } from './dashboardService.js';

/**
 * Calculate weighted exam readiness score (0-100).
 * Each subject contributes 25%. Applies momentum adjustment.
 * @param {object} progress
 * @returns {number}
 */
export function calculateExamReadinessScore(progress) {
  const sessions = progress.sessions || [];
  if (sessions.length === 0) return 0;

  const subjectScores = {};
  for (const sub of SUBJECT_KEYS) {
    const subSessions = sessions.filter(s => s.subject === sub);
    if (subSessions.length === 0) { subjectScores[sub] = 0; continue; }
    // Recency bias: 70% recent (last 5), 30% historical
    const recent = subSessions.slice(-5);
    const historical = subSessions.slice(0, -5);
    const recentAvg = recent.reduce((s, x) => s + x.score, 0) / recent.length;
    const histAvg = historical.length
      ? historical.reduce((s, x) => s + x.score, 0) / historical.length
      : recentAvg;
    subjectScores[sub] = recentAvg * 0.7 + histAvg * 0.3;
  }

  const base = SUBJECT_KEYS.reduce((s, sub) => s + subjectScores[sub], 0) / SUBJECT_KEYS.length;

  // Momentum: compare last 5 vs previous 5
  const last5 = sessions.slice(-5).reduce((s, x) => s + x.score, 0) / Math.min(5, sessions.length);
  const prev5 = sessions.slice(-10, -5);
  const momentum = prev5.length
    ? (last5 - prev5.reduce((s, x) => s + x.score, 0) / prev5.length) * 0.1
    : 0;

  return Math.min(100, Math.max(0, Math.round(base + momentum)));
}

/**
 * Calculate predicted score range with confidence interval.
 * @param {object} progress
 * @returns {{ lower: number, upper: number, confidence: number, trend: string }}
 */
export function calculatePredictedScoreRange(progress) {
  const sessions = progress.sessions || [];
  if (sessions.length < 3) {
    return { lower: 40, upper: 70, confidence: 70, trend: 'stable' };
  }

  const recent = sessions.slice(-10);
  const avg = recent.reduce((s, x) => s + x.score, 0) / recent.length;
  const variance = recent.reduce((s, x) => s + Math.pow(x.score - avg, 2), 0) / recent.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 1 - stdDev / 50);
  const confidence = Math.min(100, Math.round(70 + consistency * 30));
  const margin = Math.round(5 + (1 - consistency) * 10);

  // Trend projection
  const first5 = sessions.slice(0, 5).reduce((s, x) => s + x.score, 0) / Math.min(5, sessions.length);
  const trend = avg > first5 + 3 ? 'improving' : avg < first5 - 3 ? 'declining' : 'stable';

  return {
    lower: Math.max(0, Math.round(avg) - margin),
    upper: Math.min(100, Math.round(avg) + margin),
    confidence,
    trend,
  };
}

/**
 * Get recommended focus areas sorted by priority.
 * @param {object} progress
 * @returns {Array<{ subject, score, name, priority }>}
 */
export function getRecommendedFocusAreas(progress) {
  const sessions = progress.sessions || [];
  const NAMES = { maths: 'Maths', en: 'English', vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning' };

  return SUBJECT_KEYS.map(sub => {
    const subSessions = sessions.filter(s => s.subject === sub);
    const score = subSessions.length
      ? Math.round(subSessions.slice(-5).reduce((s, x) => s + x.score, 0) / Math.min(5, subSessions.length))
      : 0;
    return { subject: sub, score, name: NAMES[sub], priority: 100 - score };
  }).sort((a, b) => b.priority - a.priority);
}

/**
 * Predict days until exam readiness reaches a target score.
 * @param {object} progress
 * @param {number} targetScore
 * @returns {number|null} estimated days, or null if already reached / no trend
 */
export function predictDaysToTarget(progress, targetScore = 80) {
  const sessions = progress.sessions || [];
  if (sessions.length < 5) return null;

  const current = calculateExamReadinessScore(progress);
  if (current >= targetScore) return 0;

  // Calculate daily improvement rate from last 14 days of sessions
  const twoWeeksAgo = Date.now() - 14 * 86400000;
  const recent = sessions.filter(s => new Date(s.date).getTime() > twoWeeksAgo);
  if (recent.length < 2) return null;

  const firstScore = recent[0].score;
  const lastScore = recent[recent.length - 1].score;
  const dailyRate = (lastScore - firstScore) / 14;
  if (dailyRate <= 0) return null;

  return Math.ceil((targetScore - current) / dailyRate);
}
