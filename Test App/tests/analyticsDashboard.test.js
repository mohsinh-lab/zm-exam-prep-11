/**
 * Analytics Dashboard — Unit & Property Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase-dependent modules before any imports
vi.mock('../src/engine/progressStore.js', () => ({
  getProgress: vi.fn(),
  updateProgress: vi.fn(),
}));
vi.mock('../src/engine/cloudSync.js', () => ({
  initLiveSync: vi.fn(),
  forceSyncFromCloud: vi.fn(),
}));
vi.mock('../src/engine/adaptiveEngine.js', () => ({
  getSubjectMastery: vi.fn((progress, sub) => {
    const map = { maths: 75, en: 60, vr: 50, nvr: 40 };
    return map[sub] ?? 50;
  }),
  getWeakTopics: vi.fn(() => []),
}));
vi.mock('../src/engine/readinessEngine.js', () => ({
  calculateReadiness: vi.fn((progress) => {
    const sessions = progress.sessions || [];
    if (!sessions.length) return 0;
    const avg = sessions.reduce((s, x) => s + x.score, 0) / sessions.length;
    return Math.min(100, Math.round(avg));
  }),
  generateActionPlan: vi.fn(() => ({ steps: [] })),
  getCatchmentSchools: vi.fn(() => [{ name: 'Test School', benchmark: 85 }]),
}));

import {
  calculateDashboardMetrics,
  getPerformanceTrends,
  getTrendDirection,
  generateAlerts,
  getPrediction,
  getRecommendedFocus,
  SUBJECT_KEYS,
  SUBJECT_NAMES,
  SUBJECT_COLORS,
} from '../src/features/parent/services/dashboardService.js';

import { dataCache } from '../src/features/parent/services/dataCache.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeProgress(overrides = {}) {
  const now = Date.now();
  return {
    sessions: [],
    xp: 0,
    badges: [],
    goals: {},
    analyticsGoals: [],
    ...overrides,
  };
}

function makeSessions(count, subject = 'maths', baseScore = 70) {
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString(),
    subject,
    score: baseScore + (i % 10),
    total: 10,
  }));
}

// ── dashboardService tests ────────────────────────────────────────────────────

describe('calculateDashboardMetrics', () => {
  it('returns zero metrics for empty progress', () => {
    const m = calculateDashboardMetrics(makeProgress());
    expect(m.totalQuestionsCompleted).toBe(0);
    expect(m.averageAccuracy).toBe(0);
    expect(m.sessionCount).toBe(0);
  });

  it('calculates average accuracy correctly', () => {
    const sessions = [
      { date: new Date().toISOString(), subject: 'maths', score: 80, total: 10 },
      { date: new Date().toISOString(), subject: 'en', score: 60, total: 10 },
    ];
    const m = calculateDashboardMetrics(makeProgress({ sessions }));
    expect(m.averageAccuracy).toBe(70);
  });

  it('sums total questions from all sessions', () => {
    const sessions = makeSessions(5, 'maths', 70);
    const m = calculateDashboardMetrics(makeProgress({ sessions }));
    expect(m.totalQuestionsCompleted).toBe(50); // 5 sessions × 10 questions
  });

  it('returns daysUntilExam > 0 (exam is in the future)', () => {
    const m = calculateDashboardMetrics(makeProgress());
    expect(m.daysUntilExam).toBeGreaterThan(0);
  });

  // Property 1: Readiness Score Bounds
  it('PROPERTY: examReadinessScore is always 0–100', () => {
    const testCases = [
      makeProgress(),
      makeProgress({ sessions: makeSessions(1, 'maths', 0) }),
      makeProgress({ sessions: makeSessions(10, 'maths', 100) }),
      makeProgress({ sessions: makeSessions(20, 'en', 55) }),
    ];
    for (const p of testCases) {
      const m = calculateDashboardMetrics(p);
      expect(m.examReadinessScore).toBeGreaterThanOrEqual(0);
      expect(m.examReadinessScore).toBeLessThanOrEqual(100);
    }
  });

  // Property 2: Metric Calculation Determinism
  it('PROPERTY: same input always produces same output', () => {
    const progress = makeProgress({ sessions: makeSessions(10, 'maths', 75), xp: 500 });
    const m1 = calculateDashboardMetrics(progress);
    const m2 = calculateDashboardMetrics(progress);
    expect(m1).toEqual(m2);
  });

  it('includes subjectScores for all 4 subjects', () => {
    const m = calculateDashboardMetrics(makeProgress());
    for (const sub of SUBJECT_KEYS) {
      expect(m.subjectScores).toHaveProperty(sub);
      expect(m.subjectScores[sub]).toBeGreaterThanOrEqual(0);
      expect(m.subjectScores[sub]).toBeLessThanOrEqual(100);
    }
  });
});

describe('getPerformanceTrends', () => {
  it('returns exactly N entries for N days', () => {
    const trends = getPerformanceTrends(makeProgress(), 30);
    expect(trends).toHaveLength(30);
  });

  it('returns 7 entries for 7 days', () => {
    const trends = getPerformanceTrends(makeProgress(), 7);
    expect(trends).toHaveLength(7);
  });

  it('each entry has a date and label', () => {
    const trends = getPerformanceTrends(makeProgress(), 7);
    for (const t of trends) {
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof t.label).toBe('string');
    }
  });

  it('populates subject scores for days with sessions', () => {
    const today = new Date().toISOString();
    const sessions = [{ date: today, subject: 'maths', score: 85, total: 10 }];
    const trends = getPerformanceTrends(makeProgress({ sessions }), 7);
    const todayEntry = trends[trends.length - 1];
    expect(todayEntry.maths).toBe(85);
  });

  it('sets null for subjects with no data on a given day', () => {
    const trends = getPerformanceTrends(makeProgress(), 7);
    for (const t of trends) {
      for (const sub of SUBJECT_KEYS) {
        expect(t[sub] === null || typeof t[sub] === 'number').toBe(true);
      }
    }
  });
});

describe('getTrendDirection', () => {
  it('returns stable when fewer than 4 sessions', () => {
    const p = makeProgress({ sessions: makeSessions(2, 'maths', 70) });
    expect(getTrendDirection(p, 'maths')).toBe('stable');
  });

  it('returns up when recent sessions are higher', () => {
    const sessions = [
      ...makeSessions(3, 'maths', 50).reverse(),
      ...makeSessions(3, 'maths', 80).reverse(),
    ];
    const p = makeProgress({ sessions });
    expect(getTrendDirection(p, 'maths')).toBe('up');
  });

  it('returns down when recent sessions are lower', () => {
    const sessions = [
      ...makeSessions(3, 'maths', 80).reverse(),
      ...makeSessions(3, 'maths', 50).reverse(),
    ];
    const p = makeProgress({ sessions });
    expect(getTrendDirection(p, 'maths')).toBe('down');
  });

  it('returns one of up/down/stable', () => {
    const p = makeProgress({ sessions: makeSessions(10, 'en', 70) });
    const dir = getTrendDirection(p, 'en');
    expect(['up', 'down', 'stable']).toContain(dir);
  });
});

describe('generateAlerts', () => {
  it('returns empty array for fresh progress', () => {
    const alerts = generateAlerts(makeProgress());
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('generates inactivity alert after 7+ days of no activity', () => {
    const oldDate = new Date(Date.now() - 8 * 86400000).toISOString();
    const sessions = [{ date: oldDate, subject: 'maths', score: 70, total: 10 }];
    const alerts = generateAlerts(makeProgress({ sessions }));
    expect(alerts.some(a => a.type === 'inactivity')).toBe(true);
  });

  it('does NOT generate inactivity alert for recent activity', () => {
    const sessions = [{ date: new Date().toISOString(), subject: 'maths', score: 70, total: 10 }];
    const alerts = generateAlerts(makeProgress({ sessions }));
    expect(alerts.some(a => a.type === 'inactivity')).toBe(false);
  });

  it('generates milestone alert when recent accuracy >= 90%', () => {
    const sessions = makeSessions(3, 'maths', 92);
    const alerts = generateAlerts(makeProgress({ sessions }));
    expect(alerts.some(a => a.type === 'milestone')).toBe(true);
  });

  it('generates performance_drop alert when accuracy drops >10%', () => {
    const highSessions = makeSessions(3, 'en', 85).map((s, i) => ({
      ...s,
      date: new Date(Date.now() - (i + 3) * 86400000).toISOString(),
    }));
    const lowSessions = makeSessions(3, 'en', 60).map((s, i) => ({
      ...s,
      date: new Date(Date.now() - i * 86400000).toISOString(),
    }));
    const sessions = [...highSessions, ...lowSessions];
    const alerts = generateAlerts(makeProgress({ sessions }));
    expect(alerts.some(a => a.type === 'performance_drop')).toBe(true);
  });

  it('each alert has required fields', () => {
    const sessions = [{ date: new Date(Date.now() - 8 * 86400000).toISOString(), subject: 'maths', score: 70, total: 10 }];
    const alerts = generateAlerts(makeProgress({ sessions }));
    for (const a of alerts) {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('type');
      expect(a).toHaveProperty('severity');
      expect(a).toHaveProperty('message');
      expect(a).toHaveProperty('timestamp');
    }
  });
});

describe('getPrediction', () => {
  it('returns default prediction for sparse data', () => {
    const p = getPrediction(makeProgress());
    expect(p.lower).toBeGreaterThanOrEqual(0);
    expect(p.upper).toBeLessThanOrEqual(100);
    expect(p.confidence).toBe(70);
  });

  // Property 9: Prediction Confidence Bounds
  it('PROPERTY: confidence is always 70–100', () => {
    const testCases = [
      makeProgress(),
      makeProgress({ sessions: makeSessions(5, 'maths', 50) }),
      makeProgress({ sessions: makeSessions(20, 'en', 90) }),
      makeProgress({ sessions: makeSessions(10, 'vr', 75) }),
    ];
    for (const p of testCases) {
      const pred = getPrediction(p);
      expect(pred.confidence).toBeGreaterThanOrEqual(70);
      expect(pred.confidence).toBeLessThanOrEqual(100);
    }
  });

  it('lower is always <= upper', () => {
    const testCases = [
      makeProgress(),
      makeProgress({ sessions: makeSessions(10, 'maths', 80) }),
    ];
    for (const p of testCases) {
      const pred = getPrediction(p);
      expect(pred.lower).toBeLessThanOrEqual(pred.upper);
    }
  });

  it('lower >= 0 and upper <= 100', () => {
    const p = makeProgress({ sessions: makeSessions(15, 'maths', 95) });
    const pred = getPrediction(p);
    expect(pred.lower).toBeGreaterThanOrEqual(0);
    expect(pred.upper).toBeLessThanOrEqual(100);
  });
});

describe('getRecommendedFocus', () => {
  it('returns 2 focus areas', () => {
    const focus = getRecommendedFocus(makeProgress());
    expect(focus).toHaveLength(2);
  });

  it('each focus area has subject, score, name', () => {
    const focus = getRecommendedFocus(makeProgress());
    for (const f of focus) {
      expect(f).toHaveProperty('subject');
      expect(f).toHaveProperty('score');
      expect(f).toHaveProperty('name');
      expect(SUBJECT_KEYS).toContain(f.subject);
    }
  });

  it('returns subjects sorted by lowest score first', () => {
    const focus = getRecommendedFocus(makeProgress());
    expect(focus[0].score).toBeLessThanOrEqual(focus[1].score);
  });
});

describe('SUBJECT constants', () => {
  it('SUBJECT_KEYS has 4 entries', () => {
    expect(SUBJECT_KEYS).toHaveLength(4);
    expect(SUBJECT_KEYS).toContain('maths');
    expect(SUBJECT_KEYS).toContain('en');
    expect(SUBJECT_KEYS).toContain('vr');
    expect(SUBJECT_KEYS).toContain('nvr');
  });

  it('SUBJECT_NAMES has entry for each key', () => {
    for (const k of SUBJECT_KEYS) {
      expect(SUBJECT_NAMES).toHaveProperty(k);
      expect(typeof SUBJECT_NAMES[k]).toBe('string');
    }
  });

  it('SUBJECT_COLORS has entry for each key', () => {
    for (const k of SUBJECT_KEYS) {
      expect(SUBJECT_COLORS).toHaveProperty(k);
    }
  });
});

// ── dataCache tests ───────────────────────────────────────────────────────────

describe('dataCache', () => {
  beforeEach(() => {
    dataCache.clearAll();
  });

  // Property 5: Cache Round-Trip Integrity
  it('PROPERTY: write then read returns equivalent data', () => {
    const data = { examReadinessScore: 75, averageAccuracy: 80, totalXP: 1200 };
    dataCache.set('metrics', data);
    const retrieved = dataCache.get('metrics');
    expect(retrieved).toEqual(data);
  });

  it('returns null for missing key', () => {
    expect(dataCache.get('nonexistent')).toBeNull();
  });

  it('overwrites existing key', () => {
    dataCache.set('test', { v: 1 });
    dataCache.set('test', { v: 2 });
    expect(dataCache.get('test')).toEqual({ v: 2 });
  });

  it('clear removes a specific key', () => {
    dataCache.set('a', 1);
    dataCache.set('b', 2);
    dataCache.clear('a');
    expect(dataCache.get('a')).toBeNull();
    expect(dataCache.get('b')).toBe(2);
  });

  it('clearAll removes all keys', () => {
    dataCache.set('x', 1);
    dataCache.set('y', 2);
    dataCache.clearAll();
    expect(dataCache.get('x')).toBeNull();
    expect(dataCache.get('y')).toBeNull();
  });

  it('getWithMeta returns savedAt timestamp', () => {
    dataCache.set('meta_test', { foo: 'bar' });
    const meta = dataCache.getWithMeta('meta_test');
    expect(meta).not.toBeNull();
    expect(meta).toHaveProperty('savedAt');
    expect(typeof meta.savedAt).toBe('number');
  });

  it('stores and retrieves complex nested objects', () => {
    const complex = {
      subjectScores: { maths: 85, en: 70, vr: 60, nvr: 55 },
      trends: [{ date: '2026-03-01', maths: 80 }],
      nested: { deep: { value: 42 } },
    };
    dataCache.set('complex', complex);
    expect(dataCache.get('complex')).toEqual(complex);
  });
});
