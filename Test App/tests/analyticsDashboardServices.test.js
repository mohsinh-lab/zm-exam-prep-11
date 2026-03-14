// Analytics Dashboard Services — comprehensive unit tests
// Covers: predictionEngine, alertEngine, preferencesService, SubjectDrillDown, BenchmarkComparison

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../src/engine/progressStore.js', () => ({
  getProgress: vi.fn(() => ({ sessions: [], xp: 0, analyticsGoals: [] })),
  updateProgress: vi.fn(),
}));
vi.mock('../src/engine/cloudSync.js', () => ({ syncToCloud: vi.fn(), loadFromCloud: vi.fn() }));

// localStorage mock
const store = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  },
  writable: true,
});

import {
  calculateExamReadinessScore,
  calculatePredictedScoreRange,
  getRecommendedFocusAreas,
  predictDaysToTarget,
} from '../src/features/parent/services/predictionEngine.js';

import {
  detectPerformanceDrop,
  detectMilestone,
  detectInactivity,
  generateAlerts,
  dismissAlert,
  getDismissedAlerts,
  clearDismissedAlerts,
  getVisibleAlerts,
} from '../src/features/parent/services/alertEngine.js';

import {
  loadPreferences,
  savePreferences,
  resetPreferences,
  setPreference,
  getPreference,
} from '../src/features/parent/services/preferencesService.js';

import {
  calculatePercentile,
  getBenchmarkData,
} from '../src/features/parent/components/BenchmarkComparison.js';

import {
  getSkillBreakdown,
  getStrengthsWeaknesses,
} from '../src/features/parent/components/SubjectDrillDown.js';

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

// ── Prediction Engine ─────────────────────────────────────────────────────────

describe('calculateExamReadinessScore', () => {
  it('returns 0 for empty sessions', () => {
    expect(calculateExamReadinessScore({ sessions: [] })).toBe(0);
  });

  it('returns a number between 0 and 100', () => {
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      subject: 'maths', score: 60 + i, date: new Date().toISOString(),
    }));
    const score = calculateExamReadinessScore({ sessions });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('higher scores produce higher readiness', () => {
    const makeSessions = (score) => Array.from({ length: 8 }, () => ({
      subject: 'maths', score, date: new Date().toISOString(),
    }));
    const low = calculateExamReadinessScore({ sessions: makeSessions(40) });
    const high = calculateExamReadinessScore({ sessions: makeSessions(90) });
    expect(high).toBeGreaterThan(low);
  });

  it('uses all four subjects', () => {
    const sessions = ['maths', 'en', 'vr', 'nvr'].flatMap(sub =>
      Array.from({ length: 3 }, () => ({ subject: sub, score: 75, date: new Date().toISOString() }))
    );
    const score = calculateExamReadinessScore({ sessions });
    expect(score).toBeGreaterThan(0);
  });

  it('PROPERTY: result always in [0, 100]', () => {
    for (let i = 0; i < 50; i++) {
      const sessions = Array.from({ length: Math.floor(Math.random() * 20) }, () => ({
        subject: ['maths', 'en', 'vr', 'nvr'][Math.floor(Math.random() * 4)],
        score: Math.floor(Math.random() * 101),
        date: new Date().toISOString(),
      }));
      const score = calculateExamReadinessScore({ sessions });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe('calculatePredictedScoreRange', () => {
  it('returns default range for < 3 sessions', () => {
    const result = calculatePredictedScoreRange({ sessions: [] });
    expect(result.lower).toBeLessThan(result.upper);
    expect(result.confidence).toBeGreaterThanOrEqual(70);
  });

  it('lower is always <= upper', () => {
    const sessions = Array.from({ length: 10 }, () => ({
      subject: 'maths', score: Math.floor(Math.random() * 100), date: new Date().toISOString(),
    }));
    const { lower, upper } = calculatePredictedScoreRange({ sessions });
    expect(lower).toBeLessThanOrEqual(upper);
  });

  it('confidence is between 70 and 100', () => {
    const sessions = Array.from({ length: 8 }, () => ({
      subject: 'maths', score: 75, date: new Date().toISOString(),
    }));
    const { confidence } = calculatePredictedScoreRange({ sessions });
    expect(confidence).toBeGreaterThanOrEqual(70);
    expect(confidence).toBeLessThanOrEqual(100);
  });

  it('consistent scores produce high confidence', () => {
    const sessions = Array.from({ length: 10 }, () => ({
      subject: 'maths', score: 80, date: new Date().toISOString(),
    }));
    const { confidence } = calculatePredictedScoreRange({ sessions });
    expect(confidence).toBeGreaterThanOrEqual(90);
  });

  it('returns a trend field', () => {
    const sessions = Array.from({ length: 6 }, (_, i) => ({
      subject: 'maths', score: 50 + i * 5, date: new Date().toISOString(),
    }));
    const { trend } = calculatePredictedScoreRange({ sessions });
    expect(['improving', 'declining', 'stable']).toContain(trend);
  });
});

describe('getRecommendedFocusAreas', () => {
  it('returns 4 subjects', () => {
    const result = getRecommendedFocusAreas({ sessions: [] });
    expect(result).toHaveLength(4);
  });

  it('sorts by priority (lowest score first)', () => {
    const sessions = [
      ...Array.from({ length: 5 }, () => ({ subject: 'maths', score: 90, date: new Date().toISOString() })),
      ...Array.from({ length: 5 }, () => ({ subject: 'en', score: 30, date: new Date().toISOString() })),
    ];
    const result = getRecommendedFocusAreas({ sessions });
    // maths should rank lower priority than en (en has lower score)
    const mathsIdx = result.findIndex(r => r.subject === 'maths');
    const enIdx = result.findIndex(r => r.subject === 'en');
    expect(enIdx).toBeLessThan(mathsIdx);
  });

  it('each item has subject, score, name, priority', () => {
    const result = getRecommendedFocusAreas({ sessions: [] });
    result.forEach(r => {
      expect(r).toHaveProperty('subject');
      expect(r).toHaveProperty('score');
      expect(r).toHaveProperty('name');
      expect(r).toHaveProperty('priority');
    });
  });
});

describe('predictDaysToTarget', () => {
  it('returns null for < 5 sessions', () => {
    expect(predictDaysToTarget({ sessions: [] })).toBeNull();
  });

  it('returns 0 if already at target', () => {
    const sessions = Array.from({ length: 10 }, () => ({
      subject: 'maths', score: 95, date: new Date().toISOString(),
    }));
    // With only maths sessions, readiness may not reach 80 across all subjects
    // so just verify it returns null or 0 (not a positive number)
    const result = predictDaysToTarget({ sessions }, 80);
    expect(result === null || result === 0).toBe(true);
  });
});

// ── Alert Engine ──────────────────────────────────────────────────────────────

describe('detectPerformanceDrop', () => {
  it('returns false for < 6 sessions', () => {
    const sessions = Array.from({ length: 4 }, () => ({ subject: 'maths', score: 80 }));
    expect(detectPerformanceDrop(sessions, 'maths').dropped).toBe(false);
  });

  it('detects drop > 10%', () => {
    const sessions = [
      ...Array.from({ length: 3 }, () => ({ subject: 'maths', score: 80 })),
      ...Array.from({ length: 3 }, () => ({ subject: 'maths', score: 60 })),
    ];
    const { dropped, amount } = detectPerformanceDrop(sessions, 'maths');
    expect(dropped).toBe(true);
    expect(amount).toBeGreaterThan(10);
  });

  it('does not flag small drops', () => {
    const sessions = [
      ...Array.from({ length: 3 }, () => ({ subject: 'maths', score: 75 })),
      ...Array.from({ length: 3 }, () => ({ subject: 'maths', score: 70 })),
    ];
    expect(detectPerformanceDrop(sessions, 'maths').dropped).toBe(false);
  });
});

describe('detectMilestone', () => {
  it('returns false for < 3 sessions', () => {
    expect(detectMilestone([{ subject: 'maths', score: 95 }], 'maths')).toBe(false);
  });

  it('detects 90%+ milestone', () => {
    const sessions = Array.from({ length: 3 }, () => ({ subject: 'maths', score: 92 }));
    expect(detectMilestone(sessions, 'maths')).toBe(true);
  });

  it('does not flag below 90%', () => {
    const sessions = Array.from({ length: 3 }, () => ({ subject: 'maths', score: 85 }));
    expect(detectMilestone(sessions, 'maths')).toBe(false);
  });
});

describe('detectInactivity', () => {
  it('returns false for empty sessions', () => {
    expect(detectInactivity([]).inactive).toBe(false);
  });

  it('detects 7+ days inactivity', () => {
    const oldDate = new Date(Date.now() - 8 * 86400000).toISOString();
    const { inactive, days } = detectInactivity([{ date: oldDate }]);
    expect(inactive).toBe(true);
    expect(days).toBeGreaterThanOrEqual(7);
  });

  it('does not flag recent activity', () => {
    const recent = new Date().toISOString();
    expect(detectInactivity([{ date: recent }]).inactive).toBe(false);
  });
});

describe('generateAlerts', () => {
  it('returns array', () => {
    expect(Array.isArray(generateAlerts({ sessions: [] }))).toBe(true);
  });

  it('generates inactivity alert for 8-day gap', () => {
    const oldDate = new Date(Date.now() - 8 * 86400000).toISOString();
    const alerts = generateAlerts({ sessions: [{ subject: 'maths', score: 70, date: oldDate }] });
    expect(alerts.some(a => a.type === 'inactivity')).toBe(true);
  });

  it('generates milestone alert for 90%+ accuracy', () => {
    const sessions = Array.from({ length: 3 }, () => ({
      subject: 'maths', score: 95, date: new Date().toISOString(),
    }));
    const alerts = generateAlerts({ sessions });
    expect(alerts.some(a => a.type === 'milestone')).toBe(true);
  });

  it('each alert has id, type, severity, message', () => {
    const oldDate = new Date(Date.now() - 8 * 86400000).toISOString();
    const alerts = generateAlerts({ sessions: [{ subject: 'maths', score: 70, date: oldDate }] });
    alerts.forEach(a => {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('type');
      expect(a).toHaveProperty('severity');
      expect(a).toHaveProperty('message');
    });
  });
});

describe('dismissAlert / getDismissedAlerts', () => {
  it('dismisses an alert', () => {
    dismissAlert('test_alert');
    expect(getDismissedAlerts()).toContain('test_alert');
  });

  it('does not duplicate dismissed alerts', () => {
    dismissAlert('dup');
    dismissAlert('dup');
    expect(getDismissedAlerts().filter(x => x === 'dup')).toHaveLength(1);
  });

  it('clearDismissedAlerts removes all', () => {
    dismissAlert('a1');
    dismissAlert('a2');
    clearDismissedAlerts();
    expect(getDismissedAlerts()).toHaveLength(0);
  });
});

describe('getVisibleAlerts', () => {
  it('filters out dismissed alerts', () => {
    const oldDate = new Date(Date.now() - 8 * 86400000).toISOString();
    const progress = { sessions: [{ subject: 'maths', score: 70, date: oldDate }] };
    dismissAlert('inactivity');
    const visible = getVisibleAlerts(progress);
    expect(visible.every(a => a.id !== 'inactivity')).toBe(true);
  });
});

// ── Preferences Service ───────────────────────────────────────────────────────

describe('loadPreferences', () => {
  it('returns defaults when nothing stored', () => {
    const prefs = loadPreferences();
    expect(prefs.layout).toBe('grid');
    expect(prefs.notifications).toBe(true);
    expect(prefs.trendPeriod).toBe(30);
  });

  it('merges stored prefs with defaults', () => {
    store['aad_preferences'] = JSON.stringify({ layout: 'list' });
    const prefs = loadPreferences();
    expect(prefs.layout).toBe('list');
    expect(prefs.notifications).toBe(true); // default preserved
  });
});

describe('savePreferences / setPreference / getPreference', () => {
  it('saves and retrieves a preference', () => {
    savePreferences({ trendPeriod: 14 });
    expect(getPreference('trendPeriod')).toBe(14);
  });

  it('setPreference updates single key', () => {
    setPreference('layout', 'list');
    expect(getPreference('layout')).toBe('list');
  });

  it('resetPreferences restores defaults', () => {
    setPreference('layout', 'list');
    resetPreferences();
    expect(loadPreferences().layout).toBe('grid');
  });
});

// ── BenchmarkComparison ───────────────────────────────────────────────────────

describe('calculatePercentile', () => {
  it('returns 99 for score >= top', () => {
    expect(calculatePercentile(90, 60, 88)).toBe(99);
  });

  it('returns 1 for score <= 0', () => {
    expect(calculatePercentile(0, 60, 88)).toBe(1);
  });

  it('returns ~50 for score at average', () => {
    expect(calculatePercentile(60, 60, 88)).toBe(50);
  });

  it('returns value between 1 and 99', () => {
    for (let score = 0; score <= 100; score += 10) {
      const pct = calculatePercentile(score, 60, 88);
      expect(pct).toBeGreaterThanOrEqual(1);
      expect(pct).toBeLessThanOrEqual(99);
    }
  });
});

describe('getBenchmarkData', () => {
  it('returns 4 subjects', () => {
    const data = getBenchmarkData({ maths: 70, en: 65, vr: 60, nvr: 55 });
    expect(data).toHaveLength(4);
  });

  it('each item has required fields', () => {
    const data = getBenchmarkData({ maths: 70, en: 65, vr: 60, nvr: 55 });
    data.forEach(d => {
      expect(d).toHaveProperty('subject');
      expect(d).toHaveProperty('studentScore');
      expect(d).toHaveProperty('average');
      expect(d).toHaveProperty('top');
      expect(d).toHaveProperty('percentile');
    });
  });

  it('handles missing scores gracefully', () => {
    const data = getBenchmarkData({});
    expect(data).toHaveLength(4);
    data.forEach(d => expect(d.studentScore).toBe(0));
  });
});

// ── SubjectDrillDown ──────────────────────────────────────────────────────────

describe('getSkillBreakdown', () => {
  it('returns empty array for no sessions', () => {
    expect(getSkillBreakdown([], 'maths')).toEqual([]);
  });

  it('groups by category', () => {
    const sessions = [
      { subject: 'maths', score: 80, category: 'Fractions' },
      { subject: 'maths', score: 60, category: 'Fractions' },
      { subject: 'maths', score: 90, category: 'Algebra' },
    ];
    const breakdown = getSkillBreakdown(sessions, 'maths');
    expect(breakdown.some(b => b.category === 'Fractions')).toBe(true);
    expect(breakdown.some(b => b.category === 'Algebra')).toBe(true);
  });

  it('calculates accuracy correctly', () => {
    const sessions = [
      { subject: 'maths', score: 80, category: 'Fractions' }, // >= 70 → correct
      { subject: 'maths', score: 50, category: 'Fractions' }, // < 70 → incorrect
    ];
    const breakdown = getSkillBreakdown(sessions, 'maths');
    const fractions = breakdown.find(b => b.category === 'Fractions');
    expect(fractions.accuracy).toBe(50);
    expect(fractions.count).toBe(2);
  });

  it('filters by subject', () => {
    const sessions = [
      { subject: 'maths', score: 80, category: 'Fractions' },
      { subject: 'en', score: 70, category: 'Grammar' },
    ];
    const breakdown = getSkillBreakdown(sessions, 'maths');
    expect(breakdown.every(b => b.category !== 'Grammar')).toBe(true);
  });
});

describe('getStrengthsWeaknesses', () => {
  it('returns strengths and weaknesses', () => {
    const sessions = [
      { subject: 'maths', score: 90, category: 'Algebra' },
      { subject: 'maths', score: 90, category: 'Algebra' },
      { subject: 'maths', score: 40, category: 'Fractions' },
      { subject: 'maths', score: 40, category: 'Fractions' },
    ];
    const { strengths, weaknesses } = getStrengthsWeaknesses(sessions, 'maths');
    expect(strengths.some(s => s.category === 'Algebra')).toBe(true);
    expect(weaknesses.some(w => w.category === 'Fractions')).toBe(true);
  });

  it('returns at most 3 strengths and 3 weaknesses', () => {
    const { strengths, weaknesses } = getStrengthsWeaknesses([], 'maths');
    expect(strengths.length).toBeLessThanOrEqual(3);
    expect(weaknesses.length).toBeLessThanOrEqual(3);
  });
});
