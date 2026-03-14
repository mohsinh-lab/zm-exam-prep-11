// Tests for Adaptive Engine Phases 11-16
// Covers: offline caching, conflict resolution, multi-language, error handling, performance

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../src/engine/progressStore.js', () => ({
  getProgress: vi.fn(() => ({ ratings: {}, topicMastery: {}, spacedRepSchedule: {} })),
  updateProgress: vi.fn(),
}));
vi.mock('../src/engine/cloudSync.js', () => ({
  syncToCloud: vi.fn(),
  loadFromCloud: vi.fn(),
}));

import {
  cacheLearningPath, getCachedLearningPath,
  cacheRecommendations, getCachedRecommendations,
  cacheSpacedRepSchedule, getCachedSpacedRepSchedule,
  enqueueOfflineUpdate, getOfflineQueue, clearOfflineQueue,
  mergeAdaptiveData, validateCache, isCacheStale,
  evictStaleCache,
  getStudentAdaptiveProfile, saveStudentAdaptiveProfile,
  getLocalizedRecommendation, generateLocalizedReadinessRecommendation, getCurrentLanguage,
  safeGenerateLearningPath, safeSelectNextQuestion, safeProcessQuestionResponse,
  repairAdaptiveData,
  memoizedExamReadiness, memoizedLearningPath, clearMemoCache,
  benchmark, getPublicAPI,
  LEARNING_PATH_CACHE_KEY, RECOMMENDATIONS_CACHE_KEY, SPACED_REP_CACHE_KEY,
} from '../src/engine/adaptiveEngine.js';

// ── localStorage mock ─────────────────────────────────────────────────────────
const store = {};
const localStorageMock = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
  clearMemoCache();
});

// ── Phase 11: Caching ─────────────────────────────────────────────────────────

describe('Learning Path Cache', () => {
  it('stores and retrieves a learning path', () => {
    const path = [{ topic: 'Fractions', mastery: 40, priority: 1, isWeak: true }];
    cacheLearningPath('s1', 'maths', path);
    const result = getCachedLearningPath('s1', 'maths');
    expect(result).toEqual(path);
  });

  it('returns null for missing entry', () => {
    expect(getCachedLearningPath('nobody', 'maths')).toBeNull();
  });

  it('returns null for stale entry', () => {
    const path = [{ topic: 'Algebra', mastery: 60 }];
    cacheLearningPath('s2', 'english', path);
    expect(getCachedLearningPath('s2', 'english', -1)).toBeNull();
  });

  it('overwrites existing entry', () => {
    cacheLearningPath('s3', 'maths', [{ topic: 'A' }]);
    cacheLearningPath('s3', 'maths', [{ topic: 'B' }]);
    expect(getCachedLearningPath('s3', 'maths')[0].topic).toBe('B');
  });
});

describe('Recommendations Cache', () => {
  it('stores and retrieves recommendations', () => {
    const rec = { type: 'focused', text: 'Focus on weak areas' };
    cacheRecommendations('s1', rec);
    expect(getCachedRecommendations('s1')).toEqual(rec);
  });

  it('returns null for stale recommendations', () => {
    cacheRecommendations('s1', { type: 'intensive' });
    expect(getCachedRecommendations('s1', -1)).toBeNull();
  });
});

describe('Spaced Rep Schedule Cache', () => {
  it('stores and retrieves schedule', () => {
    const schedule = { q1: { intervalIndex: 2, nextReview: '2026-04-01' } };
    cacheSpacedRepSchedule('s1', schedule);
    expect(getCachedSpacedRepSchedule('s1')).toEqual(schedule);
  });

  it('returns null for missing student', () => {
    expect(getCachedSpacedRepSchedule('nobody')).toBeNull();
  });
});

// ── Phase 11.4: Offline Queue ─────────────────────────────────────────────────

describe('Offline Queue', () => {
  it('enqueues and retrieves updates', () => {
    enqueueOfflineUpdate({ type: 'rating', studentId: 's1', subject: 'maths', payload: { rating: 1300 } });
    enqueueOfflineUpdate({ type: 'mastery', studentId: 's1', subject: 'english', payload: {} });
    const queue = getOfflineQueue();
    expect(queue).toHaveLength(2);
    expect(queue[0].type).toBe('rating');
    expect(queue[1].type).toBe('mastery');
  });

  it('clears the queue', () => {
    enqueueOfflineUpdate({ type: 'rating', studentId: 's1', subject: 'maths', payload: {} });
    clearOfflineQueue();
    expect(getOfflineQueue()).toHaveLength(0);
  });

  it('returns empty array when queue is empty', () => {
    expect(getOfflineQueue()).toEqual([]);
  });

  it('each queued item has a queuedAt timestamp', () => {
    enqueueOfflineUpdate({ type: 'mastery', studentId: 's1', subject: 'vr', payload: {} });
    const [item] = getOfflineQueue();
    expect(typeof item.queuedAt).toBe('number');
  });
});

// ── Phase 11.5: Conflict Resolution ──────────────────────────────────────────

describe('mergeAdaptiveData', () => {
  it('returns local when remote is null', () => {
    const local = { ratings: { maths: 1200 }, updatedAt: 100 };
    expect(mergeAdaptiveData(local, null)).toEqual(local);
  });

  it('returns remote when local is null', () => {
    const remote = { ratings: { maths: 1300 }, updatedAt: 200 };
    expect(mergeAdaptiveData(null, remote)).toEqual(remote);
  });

  it('remote subject rating wins when newer', () => {
    const local = { ratings: { maths: { value: 1200, updatedAt: 100 } }, updatedAt: 100 };
    const remote = { ratings: { maths: { value: 1350, updatedAt: 200 } }, updatedAt: 200 };
    const merged = mergeAdaptiveData(local, remote);
    expect(merged.ratings.maths.value).toBe(1350);
  });

  it('local subject rating wins when newer', () => {
    const local = { ratings: { maths: { value: 1400, updatedAt: 300 } }, updatedAt: 300 };
    const remote = { ratings: { maths: { value: 1200, updatedAt: 100 } }, updatedAt: 100 };
    const merged = mergeAdaptiveData(local, remote);
    expect(merged.ratings.maths.value).toBe(1400);
  });

  it('merges topic mastery per-topic with newer wins', () => {
    const local = {
      topicMastery: { maths: { Fractions: { mastery: 60, lastUpdated: 100 } } },
      updatedAt: 100,
    };
    const remote = {
      topicMastery: { maths: { Fractions: { mastery: 80, lastUpdated: 200 } } },
      updatedAt: 200,
    };
    const merged = mergeAdaptiveData(local, remote);
    expect(merged.topicMastery.maths.Fractions.mastery).toBe(80);
  });

  it('updatedAt is max of both', () => {
    const merged = mergeAdaptiveData({ updatedAt: 500 }, { updatedAt: 300 });
    expect(merged.updatedAt).toBe(500);
  });
});

// ── Phase 11.6: Cache Validation ─────────────────────────────────────────────

describe('validateCache', () => {
  it('returns false for missing key', () => {
    expect(validateCache('nonexistent_key')).toBe(false);
  });

  it('returns true for valid cache after writing', () => {
    // Write a valid cache structure directly
    store[LEARNING_PATH_CACHE_KEY] = JSON.stringify({
      version: 1,
      entries: { 's1:maths': { data: [], cachedAt: Date.now() } },
      accessOrder: ['s1:maths'],
    });
    expect(validateCache(LEARNING_PATH_CACHE_KEY)).toBe(true);
  });

  it('returns false for corrupted JSON', () => {
    store['bad_key'] = 'not-json{{{';
    expect(validateCache('bad_key')).toBe(false);
  });
});

describe('isCacheStale', () => {
  it('returns true for missing entry', () => {
    expect(isCacheStale(LEARNING_PATH_CACHE_KEY, 'nobody:maths')).toBe(true);
  });

  it('returns false for fresh entry', () => {
    // Write a fresh cache entry directly
    store[LEARNING_PATH_CACHE_KEY] = JSON.stringify({
      version: 1,
      entries: { 's1:maths': { data: [], cachedAt: Date.now() } },
      accessOrder: ['s1:maths'],
    });
    expect(isCacheStale(LEARNING_PATH_CACHE_KEY, 's1:maths', 3600000)).toBe(false);
  });

  it('returns true for expired entry', () => {
    store[LEARNING_PATH_CACHE_KEY] = JSON.stringify({
      version: 1,
      entries: { 's1:english': { data: [], cachedAt: Date.now() - 7200000 } },
      accessOrder: ['s1:english'],
    });
    expect(isCacheStale(LEARNING_PATH_CACHE_KEY, 's1:english', 3600000)).toBe(true);
  });
});

// ── Phase 13: Multi-Language ──────────────────────────────────────────────────

describe('getLocalizedRecommendation', () => {
  it('returns English recommendation by default', () => {
    const rec = getLocalizedRecommendation('intensive');
    expect(typeof rec).toBe('string');
    expect(rec.length).toBeGreaterThan(0);
  });

  it('returns Urdu recommendation for ur locale', () => {
    const en = getLocalizedRecommendation('intensive', 'en');
    const ur = getLocalizedRecommendation('intensive', 'ur');
    expect(ur).not.toBe(en);
    expect(ur.length).toBeGreaterThan(0);
  });

  it('falls back to English for unknown locale', () => {
    const en = getLocalizedRecommendation('focused', 'en');
    const xx = getLocalizedRecommendation('focused', 'xx');
    expect(xx).toBe(en);
  });

  it('returns all recommendation types in English', () => {
    ['intensive', 'focused', 'mockExam', 'developing', 'proficient', 'mastered'].forEach(type => {
      expect(getLocalizedRecommendation(type, 'en').length).toBeGreaterThan(0);
    });
  });
});

describe('generateLocalizedReadinessRecommendation', () => {
  it('returns intensive for score < 50', () => {
    const rec = generateLocalizedReadinessRecommendation(30, 'en');
    expect(rec).toContain('Intensive');
  });

  it('returns focused for score 50-74', () => {
    const rec = generateLocalizedReadinessRecommendation(65, 'en');
    expect(rec).toContain('Focused');
  });

  it('returns mock exam for score >= 75', () => {
    const rec = generateLocalizedReadinessRecommendation(80, 'en');
    expect(rec).toContain('mock');
  });

  it('works in Urdu', () => {
    const rec = generateLocalizedReadinessRecommendation(30, 'ur');
    expect(rec.length).toBeGreaterThan(0);
  });
});

describe('getCurrentLanguage', () => {
  it('returns en by default', () => {
    expect(getCurrentLanguage()).toBe('en');
  });

  it('returns stored language', () => {
    localStorageMock.setItem('ace_lang', 'ur');
    expect(getCurrentLanguage()).toBe('ur');
  });
});

// ── Phase 14: Error Handling ──────────────────────────────────────────────────

describe('safeGenerateLearningPath', () => {
  it('returns empty array for empty progress', () => {
    const result = safeGenerateLearningPath({}, 'maths');
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns learning path for valid progress', () => {
    const progress = {
      topicMastery: { maths: { Fractions: { correct: 3, total: 5 } } },
    };
    const result = safeGenerateLearningPath(progress, 'maths');
    expect(Array.isArray(result)).toBe(true);
  });

  it('does not throw on null progress', () => {
    expect(() => safeGenerateLearningPath(null, 'maths')).not.toThrow();
  });
});

describe('safeSelectNextQuestion', () => {
  const questions = [
    { id: 'q1', subject: 'maths', difficulty: 'medium' },
    { id: 'q2', subject: 'maths', difficulty: 'hard' },
    { id: 'q3', subject: 'english', difficulty: 'easy' },
  ];

  it('returns a question for valid input', () => {
    const result = safeSelectNextQuestion(questions, {}, 'maths');
    expect(result).not.toBeNull();
    expect(result.subject).toBe('maths');
  });

  it('returns null when no questions for subject', () => {
    const result = safeSelectNextQuestion(questions, {}, 'nonverbal');
    expect(result).toBeNull();
  });

  it('does not throw on null progress', () => {
    expect(() => safeSelectNextQuestion(questions, null, 'maths')).not.toThrow();
  });
});

describe('safeProcessQuestionResponse', () => {
  it('returns progress on success', () => {
    const progress = { ratings: {}, topicMastery: {}, spacedRepSchedule: {} };
    const result = safeProcessQuestionResponse(progress, 'maths', 'q1', true, 15);
    expect(result).toBeDefined();
  });

  it('returns original progress on error', () => {
    const progress = { ratings: {}, topicMastery: {}, spacedRepSchedule: {} };
    const result = safeProcessQuestionResponse(null, 'maths', 'q1', true, 15);
    expect(result).toBeNull();
  });
});

describe('repairAdaptiveData', () => {
  it('returns empty object for null input', () => {
    expect(repairAdaptiveData(null)).toEqual({});
  });

  it('initialises missing fields', () => {
    const repaired = repairAdaptiveData({});
    expect(repaired.ratings).toEqual({});
    expect(repaired.topicMastery).toEqual({});
    expect(repaired.spacedRepSchedule).toEqual({});
  });

  it('clamps ratings to valid range', () => {
    const repaired = repairAdaptiveData({ ratings: { maths: 500, english: 2000 } });
    expect(repaired.ratings.maths).toBe(800);
    expect(repaired.ratings.english).toBe(1800);
  });

  it('preserves valid data', () => {
    const data = { ratings: { maths: 1200 }, topicMastery: { maths: {} } };
    const repaired = repairAdaptiveData(data);
    expect(repaired.ratings.maths).toBe(1200);
  });
});

// ── Phase 15: Performance ─────────────────────────────────────────────────────

describe('memoizedExamReadiness', () => {
  it('returns a number', () => {
    const progress = { ratings: {}, topicMastery: {}, sessions: [] };
    expect(typeof memoizedExamReadiness(progress)).toBe('number');
  });

  it('returns same value on repeated calls (memoised)', () => {
    const progress = { ratings: { maths: 1200 }, topicMastery: {}, sessions: [] };
    const first = memoizedExamReadiness(progress);
    const second = memoizedExamReadiness(progress);
    expect(first).toBe(second);
  });
});

describe('memoizedLearningPath', () => {
  it('returns an array', () => {
    const progress = { topicMastery: { maths: { Fractions: { correct: 2, total: 5 } } } };
    expect(Array.isArray(memoizedLearningPath(progress, 'maths'))).toBe(true);
  });

  it('returns same reference on repeated calls', () => {
    const progress = { topicMastery: { maths: { Algebra: { correct: 3, total: 4 } } } };
    const first = memoizedLearningPath(progress, 'maths');
    const second = memoizedLearningPath(progress, 'maths');
    expect(first).toBe(second);
  });
});

describe('benchmark', () => {
  it('returns the function result', () => {
    const result = benchmark(() => 42, 'test');
    expect(result).toBe(42);
  });

  it('works with async-like sync functions', () => {
    const result = benchmark(() => [1, 2, 3], 'array');
    expect(result).toEqual([1, 2, 3]);
  });
});

// ── Phase 16: Public API ──────────────────────────────────────────────────────

describe('getPublicAPI', () => {
  it('returns an array of strings', () => {
    const api = getPublicAPI();
    expect(Array.isArray(api)).toBe(true);
    expect(api.length).toBeGreaterThan(20);
    api.forEach(name => expect(typeof name).toBe('string'));
  });

  it('includes key functions', () => {
    const api = getPublicAPI();
    ['calculateExamReadiness', 'scheduleReview', 'selectNextQuestion', 'processQuestionResponse'].forEach(fn => {
      expect(api).toContain(fn);
    });
  });
});
