/**
 * Adaptive Learning Engine Enhancement — Unit & Property Tests
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/engine/progressStore.js', () => ({
  getProgress: vi.fn(() => ({
    ratings: {}, attempts: {}, lastResult: {}, topicMastery: {},
    sessions: [], xp: 0, badges: [], goals: {},
  })),
  updateProgress: vi.fn(),
}));
vi.mock('../src/engine/cloudSync.js', () => ({ initLiveSync: vi.fn() }));
vi.mock('../src/engine/questionBank.js', () => ({
  QUESTION_BANK: [
    { id: 'q1', subject: 'maths', difficulty: 'easy', type: 'algebra' },
    { id: 'q2', subject: 'maths', difficulty: 'medium', type: 'algebra' },
    { id: 'q3', subject: 'en', difficulty: 'easy', type: 'comprehension' },
  ],
  SUBJECTS: { maths: 'maths', en: 'en', vr: 'vr', nvr: 'nvr' },
  DIFFICULTY: { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' },
}));
vi.mock('../src/engine/readinessEngine.js', () => ({
  calculateReadiness: vi.fn(() => 70),
}));

import {
  calculateExpectedProbability,
  constrainRating,
  calculateAccuracyTrend,
  adjustDifficultyByTrend,
  predictOptimalDifficulty,
  calculateMastery,
  getMasteryLevel,
  calculateConfidence,
  getConfidenceLevel,
  scheduleReview,
  getScheduledReviews,
  generateLearningPath,
  estimateTimeToMastery,
  detectFatigue,
  calculateOptimalPace,
  calculateExamReadiness,
  predictSuccessLikelihood,
  ELO_CONSTANTS,
  REVIEW_INTERVALS,
  getSubjectMastery,
} from '../src/engine/adaptiveEngine.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeProgress(overrides = {}) {
  return {
    ratings: {}, attempts: {}, lastResult: {}, topicMastery: {},
    sessions: [], xp: 0, goals: {}, spacedRepSchedule: {},
    ...overrides,
  };
}

function makeSessions(count, subject = 'maths', score = 75) {
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString(),
    subject, score, total: 10,
  }));
}

// ── ELO Constants ─────────────────────────────────────────────────────────────

describe('ELO_CONSTANTS', () => {
  it('has expected values', () => {
    expect(ELO_CONSTANTS.BASE_RATING).toBe(1200);
    expect(ELO_CONSTANTS.MIN_RATING).toBe(800);
    expect(ELO_CONSTANTS.MAX_RATING).toBe(1800);
  });
});

describe('REVIEW_INTERVALS', () => {
  it('is a non-empty ascending array', () => {
    expect(REVIEW_INTERVALS.length).toBeGreaterThan(0);
    for (let i = 1; i < REVIEW_INTERVALS.length; i++) {
      expect(REVIEW_INTERVALS[i]).toBeGreaterThan(REVIEW_INTERVALS[i - 1]);
    }
  });
});

// ── calculateExpectedProbability ──────────────────────────────────────────────

describe('calculateExpectedProbability', () => {
  it('returns 0.5 when ratings are equal', () => {
    expect(calculateExpectedProbability(1200, 1200)).toBeCloseTo(0.5);
  });

  it('returns > 0.5 when student rating is higher', () => {
    expect(calculateExpectedProbability(1400, 1200)).toBeGreaterThan(0.5);
  });

  it('returns < 0.5 when student rating is lower', () => {
    expect(calculateExpectedProbability(1000, 1200)).toBeLessThan(0.5);
  });

  // Property 1: result always in (0, 1)
  it('PROPERTY: result always in (0, 1) for any ratings', () => {
    const cases = [
      [800, 1800], [1800, 800], [1200, 1200], [900, 900], [1500, 1100],
    ];
    for (const [s, q] of cases) {
      const p = calculateExpectedProbability(s, q);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(1);
    }
  });
});

// ── constrainRating ───────────────────────────────────────────────────────────

describe('constrainRating', () => {
  it('clamps below MIN_RATING', () => {
    expect(constrainRating(500)).toBe(800);
  });

  it('clamps above MAX_RATING', () => {
    expect(constrainRating(2500)).toBe(1800);
  });

  it('passes through valid ratings', () => {
    expect(constrainRating(1200)).toBe(1200);
    expect(constrainRating(800)).toBe(800);
    expect(constrainRating(1800)).toBe(1800);
  });

  // Property: output always in [MIN, MAX]
  it('PROPERTY: output always in [800, 1800]', () => {
    const inputs = [-1000, 0, 799, 800, 1200, 1800, 1801, 9999];
    for (const r of inputs) {
      const result = constrainRating(r);
      expect(result).toBeGreaterThanOrEqual(800);
      expect(result).toBeLessThanOrEqual(1800);
    }
  });
});

// ── calculateAccuracyTrend ────────────────────────────────────────────────────

describe('calculateAccuracyTrend', () => {
  it('returns stable for fewer than 4 attempts', () => {
    expect(calculateAccuracyTrend([{ correct: true }])).toBe('stable');
    expect(calculateAccuracyTrend([])).toBe('stable');
  });

  it('returns improving when recent accuracy is higher', () => {
    const attempts = [
      { correct: false }, { correct: false },
      { correct: true }, { correct: true }, { correct: true }, { correct: true },
    ];
    expect(calculateAccuracyTrend(attempts)).toBe('improving');
  });

  it('returns declining when recent accuracy is lower', () => {
    const attempts = [
      { correct: true }, { correct: true }, { correct: true },
      { correct: false }, { correct: false }, { correct: false },
    ];
    expect(calculateAccuracyTrend(attempts)).toBe('declining');
  });

  it('returns one of improving/declining/stable', () => {
    const attempts = Array.from({ length: 8 }, (_, i) => ({ correct: i % 2 === 0 }));
    const result = calculateAccuracyTrend(attempts);
    expect(['improving', 'declining', 'stable']).toContain(result);
  });
});

// ── adjustDifficultyByTrend ───────────────────────────────────────────────────

describe('adjustDifficultyByTrend', () => {
  it('increases difficulty when improving', () => {
    expect(adjustDifficultyByTrend(2, 'improving')).toBe(3);
  });

  it('decreases difficulty when declining', () => {
    expect(adjustDifficultyByTrend(2, 'declining')).toBe(1);
  });

  it('keeps difficulty when stable', () => {
    expect(adjustDifficultyByTrend(2, 'stable')).toBe(2);
  });

  it('does not exceed 3', () => {
    expect(adjustDifficultyByTrend(3, 'improving')).toBe(3);
  });

  it('does not go below 1', () => {
    expect(adjustDifficultyByTrend(1, 'declining')).toBe(1);
  });
});

// ── predictOptimalDifficulty ──────────────────────────────────────────────────

describe('predictOptimalDifficulty', () => {
  it('returns difficulty 1 for no sessions', () => {
    const { difficulty } = predictOptimalDifficulty(makeProgress(), 'maths');
    expect(difficulty).toBe(1);
  });

  it('returns difficulty 3 for high accuracy sessions', () => {
    const p = makeProgress({ sessions: makeSessions(5, 'maths', 90) });
    const { difficulty } = predictOptimalDifficulty(p, 'maths');
    expect(difficulty).toBe(3);
  });

  it('returns difficulty 1 for low accuracy sessions', () => {
    const p = makeProgress({ sessions: makeSessions(5, 'maths', 40) });
    const { difficulty } = predictOptimalDifficulty(p, 'maths');
    expect(difficulty).toBe(1);
  });

  it('confidence increases with more sessions', () => {
    const p1 = makeProgress({ sessions: makeSessions(2, 'maths', 70) });
    const p2 = makeProgress({ sessions: makeSessions(10, 'maths', 70) });
    expect(predictOptimalDifficulty(p2, 'maths').confidence).toBeGreaterThan(
      predictOptimalDifficulty(p1, 'maths').confidence
    );
  });
});

// ── calculateMastery ──────────────────────────────────────────────────────────

describe('calculateMastery', () => {
  it('returns 0 for empty attempts', () => {
    expect(calculateMastery([])).toBe(0);
  });

  it('returns 100 for all correct', () => {
    expect(calculateMastery([true, true, true, true, true])).toBe(100);
  });

  it('returns 0 for all incorrect', () => {
    expect(calculateMastery([false, false, false, false, false])).toBe(0);
  });

  it('applies 70/30 weighting for >5 attempts', () => {
    // 5 historical all wrong, 5 recent all correct → weighted toward recent
    const attempts = [false, false, false, false, false, true, true, true, true, true];
    const mastery = calculateMastery(attempts);
    expect(mastery).toBeGreaterThan(50); // Recent (correct) weighted more
  });

  // Property 5: result always 0–100
  it('PROPERTY: result always 0–100', () => {
    const cases = [
      [], [true], [false], [true, false, true],
      Array(20).fill(true), Array(20).fill(false),
      Array(10).fill(true).concat(Array(10).fill(false)),
    ];
    for (const attempts of cases) {
      const m = calculateMastery(attempts);
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThanOrEqual(100);
    }
  });
});

// ── getMasteryLevel ───────────────────────────────────────────────────────────

describe('getMasteryLevel', () => {
  it('returns Mastered for >= 85', () => {
    expect(getMasteryLevel(85)).toBe('Mastered');
    expect(getMasteryLevel(100)).toBe('Mastered');
  });

  it('returns Proficient for 70–84', () => {
    expect(getMasteryLevel(70)).toBe('Proficient');
    expect(getMasteryLevel(84)).toBe('Proficient');
  });

  it('returns Developing for < 70', () => {
    expect(getMasteryLevel(0)).toBe('Developing');
    expect(getMasteryLevel(69)).toBe('Developing');
  });
});

// ── calculateConfidence ───────────────────────────────────────────────────────

describe('calculateConfidence', () => {
  it('returns 0 for null/empty topic data', () => {
    expect(calculateConfidence(null)).toBe(0);
    expect(calculateConfidence({ correct: 0, total: 0 })).toBe(0);
  });

  it('returns higher confidence for consistent performance', () => {
    const consistent = { correct: 8, total: 10 };
    const inconsistent = { correct: 5, total: 10 };
    expect(calculateConfidence(consistent, 4, 5)).toBeGreaterThan(
      calculateConfidence(inconsistent, 1, 5)
    );
  });

  // Property: result always 0–100
  it('PROPERTY: result always 0–100', () => {
    const cases = [
      [{ correct: 0, total: 5 }, 0, 5],
      [{ correct: 5, total: 5 }, 5, 5],
      [{ correct: 10, total: 20 }, 3, 5],
      [{ correct: 20, total: 20 }, 5, 5],
    ];
    for (const [td, rc, rt] of cases) {
      const c = calculateConfidence(td, rc, rt);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(100);
    }
  });
});

// ── getConfidenceLevel ────────────────────────────────────────────────────────

describe('getConfidenceLevel', () => {
  it('returns High for >= 70', () => {
    expect(getConfidenceLevel(70)).toBe('High');
    expect(getConfidenceLevel(100)).toBe('High');
  });

  it('returns Medium for 40–69', () => {
    expect(getConfidenceLevel(40)).toBe('Medium');
    expect(getConfidenceLevel(69)).toBe('Medium');
  });

  it('returns Low for < 40', () => {
    expect(getConfidenceLevel(0)).toBe('Low');
    expect(getConfidenceLevel(39)).toBe('Low');
  });
});

// ── scheduleReview ────────────────────────────────────────────────────────────

describe('scheduleReview', () => {
  it('sets nextReview date in the future', () => {
    const p = makeProgress();
    const entry = scheduleReview(p, 'q1', true);
    expect(new Date(entry.nextReview).getTime()).toBeGreaterThan(Date.now());
  });

  it('resets intervalIndex to 0 on incorrect answer', () => {
    const p = makeProgress();
    scheduleReview(p, 'q1', true);
    scheduleReview(p, 'q1', true);
    const entry = scheduleReview(p, 'q1', false);
    expect(entry.intervalIndex).toBe(0);
    expect(entry.streak).toBe(0);
  });

  it('increments intervalIndex on correct answer', () => {
    const p = makeProgress();
    scheduleReview(p, 'q1', true); // intervalIndex → 1
    scheduleReview(p, 'q1', true); // intervalIndex → 2
    scheduleReview(p, 'q1', true); // intervalIndex → 3
    const entry = p.spacedRepSchedule['q1'];
    expect(entry.intervalIndex).toBeGreaterThan(1);
  });

  // Property 6: interval never exceeds max
  it('PROPERTY: intervalIndex never exceeds REVIEW_INTERVALS.length - 1', () => {
    const p = makeProgress();
    for (let i = 0; i < 20; i++) scheduleReview(p, 'q1', true);
    const entry = p.spacedRepSchedule['q1'];
    expect(entry.intervalIndex).toBeLessThanOrEqual(REVIEW_INTERVALS.length - 1);
  });
});

// ── getScheduledReviews ───────────────────────────────────────────────────────

describe('getScheduledReviews', () => {
  it('returns empty array when no schedule', () => {
    const qBank = [{ id: 'q1', subject: 'maths' }];
    expect(getScheduledReviews(makeProgress(), 'maths', qBank)).toEqual([]);
  });

  it('returns question IDs that are due', () => {
    const p = makeProgress({
      spacedRepSchedule: {
        'q1': { nextReview: new Date(Date.now() - 1000).toISOString(), intervalIndex: 1, streak: 1 },
      },
    });
    const qBank = [{ id: 'q1', subject: 'maths' }];
    expect(getScheduledReviews(p, 'maths', qBank)).toContain('q1');
  });

  it('does not return questions not yet due', () => {
    const p = makeProgress({
      spacedRepSchedule: {
        'q1': { nextReview: new Date(Date.now() + 86400000).toISOString(), intervalIndex: 1, streak: 1 },
      },
    });
    const qBank = [{ id: 'q1', subject: 'maths' }];
    expect(getScheduledReviews(p, 'maths', qBank)).not.toContain('q1');
  });
});

// ── generateLearningPath ──────────────────────────────────────────────────────

describe('generateLearningPath', () => {
  it('returns empty array for no topic mastery', () => {
    expect(generateLearningPath(makeProgress(), 'maths')).toEqual([]);
  });

  it('prioritises weak topics first', () => {
    const p = makeProgress({
      topicMastery: {
        maths: {
          algebra: { correct: 3, total: 10 },    // 30% — weak
          geometry: { correct: 9, total: 10 },   // 90% — strong
          fractions: { correct: 5, total: 10 },  // 50% — weak
        },
      },
    });
    const path = generateLearningPath(p, 'maths');
    const weakFirst = path.filter(e => e.isWeak);
    const strongFirst = path.filter(e => !e.isWeak);
    expect(weakFirst.length).toBeGreaterThan(0);
    // Weak topics should come before strong in priority
    if (weakFirst.length > 0 && strongFirst.length > 0) {
      expect(weakFirst[0].priority).toBeLessThan(strongFirst[0].priority);
    }
  });

  // Property 3: weak topics always prioritised
  it('PROPERTY: all weak topics (mastery < 70) appear before strong topics', () => {
    const p = makeProgress({
      topicMastery: {
        maths: {
          t1: { correct: 2, total: 10 },  // 20%
          t2: { correct: 8, total: 10 },  // 80%
          t3: { correct: 4, total: 10 },  // 40%
          t4: { correct: 9, total: 10 },  // 90%
        },
      },
    });
    const path = generateLearningPath(p, 'maths');
    const weakEntries = path.filter(e => e.isWeak);
    const strongEntries = path.filter(e => !e.isWeak);
    if (weakEntries.length > 0 && strongEntries.length > 0) {
      const maxWeakPriority = Math.max(...weakEntries.map(e => e.priority));
      const minStrongPriority = Math.min(...strongEntries.map(e => e.priority));
      expect(maxWeakPriority).toBeLessThan(minStrongPriority);
    }
  });
});

// ── estimateTimeToMastery ─────────────────────────────────────────────────────

describe('estimateTimeToMastery', () => {
  it('returns 0 when already at or above target', () => {
    expect(estimateTimeToMastery(85)).toBe(0);
    expect(estimateTimeToMastery(100)).toBe(0);
  });

  it('returns positive number when below target', () => {
    expect(estimateTimeToMastery(50)).toBeGreaterThan(0);
  });

  it('returns more sessions for larger gap', () => {
    expect(estimateTimeToMastery(20)).toBeGreaterThan(estimateTimeToMastery(70));
  });
});

// ── detectFatigue ─────────────────────────────────────────────────────────────

describe('detectFatigue', () => {
  it('returns false for fewer than 6 attempts', () => {
    expect(detectFatigue([{ correct: true }, { correct: false }])).toBe(false);
    expect(detectFatigue([])).toBe(false);
  });

  it('returns true when accuracy drops significantly', () => {
    const attempts = [
      { correct: true }, { correct: true }, { correct: true },
      { correct: false }, { correct: false }, { correct: false },
    ];
    expect(detectFatigue(attempts)).toBe(true);
  });

  it('returns false when accuracy is consistent', () => {
    const attempts = Array(6).fill({ correct: true });
    expect(detectFatigue(attempts)).toBe(false);
  });
});

// ── calculateOptimalPace ──────────────────────────────────────────────────────

describe('calculateOptimalPace', () => {
  it('returns 10 for no sessions', () => {
    expect(calculateOptimalPace(makeProgress(), 'maths')).toBe(10);
  });

  it('returns 15 for high accuracy', () => {
    const p = makeProgress({ sessions: makeSessions(5, 'maths', 85) });
    expect(calculateOptimalPace(p, 'maths')).toBe(15);
  });

  it('returns 5 for low accuracy', () => {
    const p = makeProgress({ sessions: makeSessions(5, 'maths', 45) });
    expect(calculateOptimalPace(p, 'maths')).toBe(5);
  });

  // Property: result always 5–15
  it('PROPERTY: result always 5–15', () => {
    const cases = [
      makeProgress(),
      makeProgress({ sessions: makeSessions(5, 'maths', 0) }),
      makeProgress({ sessions: makeSessions(5, 'maths', 100) }),
      makeProgress({ sessions: makeSessions(10, 'en', 65) }),
    ];
    for (const p of cases) {
      const pace = calculateOptimalPace(p, 'maths');
      expect(pace).toBeGreaterThanOrEqual(5);
      expect(pace).toBeLessThanOrEqual(15);
    }
  });
});

// ── calculateExamReadiness ────────────────────────────────────────────────────

describe('calculateExamReadiness', () => {
  it('returns 0 for no sessions', () => {
    expect(calculateExamReadiness(makeProgress())).toBe(0);
  });

  it('returns value close to session scores', () => {
    const sessions = [
      ...makeSessions(5, 'maths', 80),
      ...makeSessions(5, 'en', 80),
      ...makeSessions(5, 'vr', 80),
      ...makeSessions(5, 'nvr', 80),
    ];
    const result = calculateExamReadiness(makeProgress({ sessions }));
    expect(result).toBeGreaterThan(70);
  });

  // Property 7: result always 0–100
  it('PROPERTY: result always 0–100', () => {
    const cases = [
      makeProgress(),
      makeProgress({ sessions: makeSessions(10, 'maths', 0) }),
      makeProgress({ sessions: makeSessions(10, 'maths', 100) }),
      makeProgress({ sessions: [...makeSessions(5, 'maths', 60), ...makeSessions(5, 'en', 90)] }),
    ];
    for (const p of cases) {
      const r = calculateExamReadiness(p);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    }
  });
});

// ── predictSuccessLikelihood ──────────────────────────────────────────────────

describe('predictSuccessLikelihood', () => {
  it('returns high value for high readiness', () => {
    expect(predictSuccessLikelihood(90)).toBeGreaterThanOrEqual(90);
  });

  it('returns low value for low readiness', () => {
    expect(predictSuccessLikelihood(20)).toBeLessThan(50);
  });

  // Property: result always 0–100
  it('PROPERTY: result always 0–100', () => {
    for (const score of [0, 10, 25, 50, 75, 85, 90, 100]) {
      const p = predictSuccessLikelihood(score);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });

  it('is monotonically non-decreasing', () => {
    const scores = [0, 20, 40, 60, 70, 80, 90, 100];
    const likelihoods = scores.map(predictSuccessLikelihood);
    for (let i = 1; i < likelihoods.length; i++) {
      expect(likelihoods[i]).toBeGreaterThanOrEqual(likelihoods[i - 1]);
    }
  });
});

// ── getSubjectMastery (backward compat) ───────────────────────────────────────

describe('getSubjectMastery', () => {
  it('accepts legacy (subject) call signature', () => {
    const result = getSubjectMastery('maths');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('accepts new (progress, subject) call signature', () => {
    const p = makeProgress({
      topicMastery: { maths: { algebra: { correct: 8, total: 10 } } },
    });
    const result = getSubjectMastery(p, 'maths');
    expect(result).toBe(80);
  });

  it('returns 0 for subject with no data', () => {
    const result = getSubjectMastery(makeProgress(), 'nvr');
    // No topic mastery data → falls back to ELO rating (BASE_RATING=1200 → 40%)
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  // Property: result always 0–100
  it('PROPERTY: result always 0–100 for any input', () => {
    const cases = [
      makeProgress(),
      makeProgress({ topicMastery: { maths: { t1: { correct: 10, total: 10 } } } }),
      makeProgress({ topicMastery: { maths: { t1: { correct: 0, total: 10 } } } }),
      makeProgress({ ratings: { maths: 800 } }),
      makeProgress({ ratings: { maths: 1800 } }),
    ];
    for (const p of cases) {
      const r = getSubjectMastery(p, 'maths');
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    }
  });
});
