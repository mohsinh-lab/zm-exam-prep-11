// Unit tests for Reading Comprehension support modules
// Covers: readingI18n, offlineDetection, readingErrorHandler,
//         readingPerformance, readingAccessibility, readingStatsService

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Required mocks BEFORE any imports ────────────────────────────────────────
vi.mock('../src/engine/progressStore.js', () => ({
  getProgress: vi.fn(() => ({ xp: 0, readingStats: null })),
  updateProgress: vi.fn()
}));

vi.mock('../src/engine/cloudSync.js', () => ({
  syncProgressToCloud: vi.fn().mockResolvedValue(undefined),
  loadProgressFromCloud: vi.fn().mockResolvedValue(null),
  subscribeToProgress: vi.fn(),
  subscribeToLinkedStudents: vi.fn(),
  subscribeToParentLink: vi.fn(),
  setSyncEmail: vi.fn()
}));

vi.mock('../src/core/i18n.js', () => ({
  getCurrentLang: vi.fn(() => 'en'),
  setLanguage: vi.fn(),
  getTranslation: vi.fn(k => k)
}));

// ── Imports ───────────────────────────────────────────────────────────────────
import { rcT, isRTL, getDir, getVoiceLang } from '../src/engine/readingI18n.js';
import { getCurrentLang } from '../src/core/i18n.js';

import {
  isOnline, enqueueOfflineUpdate, flushOfflineQueue,
  loadQueue, clearQueue, getQueueLength
} from '../src/engine/offlineDetection.js';

import {
  withRetry, withFallback, logError, getFriendlyMessage, getErrorLog
} from '../src/engine/readingErrorHandler.js';

import {
  memoize, debounce, getVirtualSlice, parseWordBoundaries, CleanupManager
} from '../src/engine/readingPerformance.js';

import {
  meetsContrastAA, announce
} from '../src/engine/readingAccessibility.js';

import {
  getReadingStats, getReadingStatsForPDF
} from '../src/features/parent/services/readingStatsService.js';

// ─────────────────────────────────────────────────────────────────────────────
// readingI18n
// ─────────────────────────────────────────────────────────────────────────────
describe('readingI18n', () => {
  it('returns English translation for known key', () => {
    getCurrentLang.mockReturnValue('en');
    expect(rcT('submit')).toBe('Submit Answer');
  });

  it('returns Urdu translation when lang is ur', () => {
    getCurrentLang.mockReturnValue('ur');
    expect(rcT('submit')).toBe('جواب جمع کریں');
  });

  it('returns key itself for unknown key', () => {
    getCurrentLang.mockReturnValue('en');
    expect(rcT('nonexistent_key_xyz')).toBe('nonexistent_key_xyz');
  });

  it('resolves nested key with dot notation', () => {
    getCurrentLang.mockReturnValue('en');
    expect(rcT('difficulty.easy')).toBe('Easy');
  });

  it('isRTL returns false for English', () => {
    getCurrentLang.mockReturnValue('en');
    expect(isRTL()).toBe(false);
  });

  it('isRTL returns true for Urdu', () => {
    getCurrentLang.mockReturnValue('ur');
    expect(isRTL()).toBe(true);
  });

  it('getDir returns ltr for English', () => {
    getCurrentLang.mockReturnValue('en');
    expect(getDir()).toBe('ltr');
  });

  it('getDir returns rtl for Urdu', () => {
    getCurrentLang.mockReturnValue('ur');
    expect(getDir()).toBe('rtl');
  });

  it('getVoiceLang returns en-GB for English', () => {
    getCurrentLang.mockReturnValue('en');
    expect(getVoiceLang()).toBe('en-GB');
  });

  it('getVoiceLang returns ur-PK for Urdu', () => {
    getCurrentLang.mockReturnValue('ur');
    expect(getVoiceLang()).toBe('ur-PK');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// offlineDetection
// ─────────────────────────────────────────────────────────────────────────────
describe('offlineDetection', () => {
  beforeEach(() => { localStorage.clear(); clearQueue(); });

  it('isOnline returns true by default in jsdom', () => {
    expect(isOnline()).toBe(true);
  });

  it('enqueueOfflineUpdate adds item to queue', () => {
    enqueueOfflineUpdate({ score: 80 });
    expect(getQueueLength()).toBe(1);
  });

  it('enqueueOfflineUpdate stores multiple items', () => {
    enqueueOfflineUpdate({ score: 80 });
    enqueueOfflineUpdate({ score: 90 });
    expect(getQueueLength()).toBe(2);
  });

  it('clearQueue empties the queue', () => {
    enqueueOfflineUpdate({ score: 80 });
    clearQueue();
    expect(getQueueLength()).toBe(0);
  });

  it('loadQueue returns empty array when nothing queued', () => {
    expect(loadQueue()).toEqual([]);
  });

  it('flushOfflineQueue calls syncFn for each item', async () => {
    enqueueOfflineUpdate({ score: 80 });
    enqueueOfflineUpdate({ score: 90 });
    const syncFn = vi.fn().mockResolvedValue(undefined);
    await flushOfflineQueue(syncFn);
    expect(syncFn).toHaveBeenCalledTimes(2);
    expect(getQueueLength()).toBe(0);
  });

  it('flushOfflineQueue keeps items that fail and increments retries', async () => {
    enqueueOfflineUpdate({ score: 80 });
    const syncFn = vi.fn().mockRejectedValue(new Error('network'));
    await flushOfflineQueue(syncFn);
    const q = loadQueue();
    expect(q).toHaveLength(1);
    expect(q[0].retries).toBe(1);
  });

  it('flushOfflineQueue drops items after MAX_RETRIES', async () => {
    enqueueOfflineUpdate({ score: 80 });
    const syncFn = vi.fn().mockRejectedValue(new Error('fail'));
    // Exhaust retries
    await flushOfflineQueue(syncFn);
    await flushOfflineQueue(syncFn);
    await flushOfflineQueue(syncFn);
    // After 3 failures retries=3, next flush should drop it
    await flushOfflineQueue(syncFn);
    expect(getQueueLength()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// readingErrorHandler
// ─────────────────────────────────────────────────────────────────────────────
describe('readingErrorHandler', () => {
  beforeEach(() => { localStorage.clear(); });

  it('withRetry resolves on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    expect(await withRetry(fn, 3)).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('withRetry retries on failure then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    expect(await withRetry(fn, 3)).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('withRetry throws after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    await expect(withRetry(fn, 2)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('withFallback returns result on success', async () => {
    expect(await withFallback(() => Promise.resolve(42), 0)).toBe(42);
  });

  it('withFallback returns fallback on error', async () => {
    expect(await withFallback(() => Promise.reject(new Error('boom')), 'default')).toBe('default');
  });

  it('logError persists to localStorage', () => {
    logError('test', new Error('oops'));
    const log = getErrorLog();
    expect(log.length).toBeGreaterThan(0);
    expect(log[log.length - 1].context).toBe('test');
  });

  it('getErrorLog returns array', () => {
    expect(Array.isArray(getErrorLog())).toBe(true);
  });

  it('getFriendlyMessage handles PassageNotFoundError', () => {
    const err = { name: 'PassageNotFoundError', message: 'not found' };
    expect(getFriendlyMessage(err)).toContain('could not be found');
  });

  it('getFriendlyMessage handles QuestionLoadError', () => {
    const err = { name: 'QuestionLoadError', message: 'fail' };
    expect(getFriendlyMessage(err)).toContain('Questions');
  });

  it('getFriendlyMessage handles network error', () => {
    const err = { name: 'Error', message: 'network timeout' };
    expect(getFriendlyMessage(err)).toContain('Network');
  });

  it('getFriendlyMessage handles null', () => {
    expect(getFriendlyMessage(null)).toContain('unexpected');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// readingPerformance
// ─────────────────────────────────────────────────────────────────────────────
describe('readingPerformance', () => {
  it('memoize caches results', () => {
    const fn = vi.fn(x => x * 2);
    const memo = memoize(fn);
    expect(memo(5)).toBe(10);
    expect(memo(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('memoize returns different results for different args', () => {
    const fn = vi.fn(x => x * 2);
    const memo = memoize(fn);
    expect(memo(3)).toBe(6);
    expect(memo(4)).toBe(8);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('debounce delays execution', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('getVirtualSlice returns correct window', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const slice = getVirtualSlice(items, 0, 500, 50, 0);
    expect(slice.items).toHaveLength(10); // 500/50 = 10 visible
    expect(slice.startIdx).toBe(0);
    expect(slice.totalHeight).toBe(5000);
  });

  it('getVirtualSlice handles scroll offset', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const slice = getVirtualSlice(items, 500, 500, 50, 0);
    expect(slice.startIdx).toBe(10);
    expect(slice.offsetY).toBe(500);
  });

  it('getVirtualSlice does not exceed array bounds', () => {
    const items = Array.from({ length: 5 }, (_, i) => i);
    const slice = getVirtualSlice(items, 0, 1000, 50, 3);
    expect(slice.items.length).toBeLessThanOrEqual(5);
  });

  it('parseWordBoundaries returns correct word positions', () => {
    const words = parseWordBoundaries('hello world');
    expect(words).toHaveLength(2);
    expect(words[0]).toEqual({ word: 'hello', start: 0, end: 5 });
    expect(words[1]).toEqual({ word: 'world', start: 6, end: 11 });
  });

  it('parseWordBoundaries is memoized', () => {
    const text = 'test text';
    const r1 = parseWordBoundaries(text);
    const r2 = parseWordBoundaries(text);
    expect(r1).toBe(r2); // same reference = memoized
  });

  it('CleanupManager runs all cleanup functions', () => {
    const cm = new CleanupManager();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    cm.add(fn1);
    cm.add(fn2);
    cm.cleanup();
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('CleanupManager clears fns after cleanup', () => {
    const cm = new CleanupManager();
    const fn = vi.fn();
    cm.add(fn);
    cm.cleanup();
    cm.cleanup(); // second call should not re-run
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// readingAccessibility
// ─────────────────────────────────────────────────────────────────────────────
describe('readingAccessibility', () => {
  it('meetsContrastAA passes for black on white (21:1)', () => {
    expect(meetsContrastAA('#000000', '#ffffff')).toBe(true);
  });

  it('meetsContrastAA fails for low contrast (light grey on white)', () => {
    expect(meetsContrastAA('#cccccc', '#ffffff')).toBe(false);
  });

  it('meetsContrastAA passes for dark blue on white', () => {
    expect(meetsContrastAA('#003366', '#ffffff')).toBe(true);
  });

  it('meetsContrastAA is symmetric', () => {
    const r1 = meetsContrastAA('#000000', '#ffffff');
    const r2 = meetsContrastAA('#ffffff', '#000000');
    expect(r1).toBe(r2);
  });

  it('announce creates live region in DOM', () => {
    announce('Test message');
    const region = document.getElementById('rc-live-region');
    expect(region).toBeTruthy();
    expect(region.getAttribute('aria-live')).toBe('polite');
  });

  it('announce uses assertive priority', () => {
    announce('Urgent', 'assertive');
    const region = document.getElementById('rc-live-region');
    expect(region.getAttribute('aria-live')).toBe('assertive');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// readingStatsService
// ─────────────────────────────────────────────────────────────────────────────
describe('readingStatsService', () => {
  const RC_KEY = 'rc_progress';

  function seedSessions(sessions) {
    localStorage.setItem(RC_KEY, JSON.stringify({ sessions, difficulty: 'intermediate' }));
  }

  beforeEach(() => { localStorage.clear(); });

  it('returns zero stats when no sessions', () => {
    const stats = getReadingStats();
    expect(stats.passagesCompleted).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.averageReadingSpeed).toBe(0);
  });

  it('counts passages completed', () => {
    seedSessions([
      { passageId: 'p1', score: 80, difficulty: 'easy', timestamp: 1000 },
      { passageId: 'p2', score: 60, difficulty: 'intermediate', timestamp: 2000 }
    ]);
    expect(getReadingStats().passagesCompleted).toBe(2);
  });

  it('calculates average score correctly', () => {
    seedSessions([
      { passageId: 'p1', score: 80, difficulty: 'easy', timestamp: 1000 },
      { passageId: 'p2', score: 60, difficulty: 'easy', timestamp: 2000 }
    ]);
    expect(getReadingStats().averageScore).toBe(70);
  });

  it('calculates average reading speed from sessions with speed', () => {
    seedSessions([
      { passageId: 'p1', score: 80, readingSpeed: 200, difficulty: 'easy', timestamp: 1000 },
      { passageId: 'p2', score: 60, readingSpeed: 300, difficulty: 'easy', timestamp: 2000 }
    ]);
    expect(getReadingStats().averageReadingSpeed).toBe(250);
  });

  it('ignores sessions without readingSpeed in speed average', () => {
    seedSessions([
      { passageId: 'p1', score: 80, difficulty: 'easy', timestamp: 1000 },
      { passageId: 'p2', score: 60, readingSpeed: 200, difficulty: 'easy', timestamp: 2000 }
    ]);
    expect(getReadingStats().averageReadingSpeed).toBe(200);
  });

  it('returns difficulty progression without duplicates', () => {
    seedSessions([
      { passageId: 'p1', score: 80, difficulty: 'easy', timestamp: 1000 },
      { passageId: 'p2', score: 80, difficulty: 'easy', timestamp: 2000 },
      { passageId: 'p3', score: 80, difficulty: 'intermediate', timestamp: 3000 }
    ]);
    const stats = getReadingStats();
    expect(stats.difficultyProgression).toEqual(['easy', 'intermediate']);
  });

  it('completedPassages limited to last 20', () => {
    const sessions = Array.from({ length: 25 }, (_, i) => ({
      passageId: `p${i}`, score: 70, difficulty: 'easy', timestamp: i * 1000
    }));
    seedSessions(sessions);
    expect(getReadingStats().completedPassages).toHaveLength(20);
  });

  it('performanceTrend limited to last 10', () => {
    const sessions = Array.from({ length: 15 }, (_, i) => ({
      passageId: `p${i}`, score: 70, difficulty: 'easy', timestamp: i * 1000
    }));
    seedSessions(sessions);
    expect(getReadingStats().performanceTrend).toHaveLength(10);
  });

  it('getReadingStatsForPDF returns section label', () => {
    const pdf = getReadingStatsForPDF();
    expect(pdf.section).toBe('Reading Comprehension');
  });

  it('getReadingStatsForPDF formats score as percentage', () => {
    seedSessions([{ passageId: 'p1', score: 75, difficulty: 'easy', timestamp: 1000 }]);
    const pdf = getReadingStatsForPDF();
    expect(pdf.averageScore).toBe('75%');
  });

  it('getReadingStatsForPDF capitalises difficulty level', () => {
    seedSessions([{ passageId: 'p1', score: 75, difficulty: 'intermediate', timestamp: 1000 }]);
    const pdf = getReadingStatsForPDF();
    expect(pdf.currentLevel).toBe('Intermediate');
  });

  it('getReadingStatsForPDF recentPassages limited to 5', () => {
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      passageId: `p${i}`, score: 70, difficulty: 'easy', timestamp: i * 1000
    }));
    seedSessions(sessions);
    expect(getReadingStatsForPDF().recentPassages).toHaveLength(5);
  });
});
