import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/engine/progressStore.js', () => ({
  getProgress: vi.fn(() => ({ xp: 0, readingStats: null })),
  updateProgress: vi.fn()
}));

vi.mock('../src/engine/cloudSync.js', () => ({
  syncProgressToCloud: vi.fn(),
  loadProgressFromCloud: vi.fn(),
  subscribeToProgress: vi.fn(),
  subscribeToLinkedStudents: vi.fn(),
  subscribeToParentLink: vi.fn(),
  setSyncEmail: vi.fn()
}));

import { PassageManager, QuestionHandler, HighlightManager, PassageNotFoundError, PassageValidationError, QuestionLoadError } from '../src/engine/readingEngine.js';
import { PassageCache } from '../src/engine/passageCache.js';
import { ReadingProgressTracker } from '../src/engine/readingProgress.js';

const LONG_TEXT = 'The quick brown fox jumps over the lazy dog. '.repeat(15);

const validPassage = {
  id: 'test_001', title: 'Test Passage', subject: 'en',
  difficulty: 'intermediate', language: 'en', text: LONG_TEXT
};

const shortPassage = {
  id: 'test_short', title: 'Short', subject: 'en',
  difficulty: 'easy', language: 'en', text: 'Too short.'
};

const questions = [
  { id: 'q1', passageId: 'test_001', type: 'multiple_choice', order: 1,
    text: 'What colour is the fox?', options: ['Brown', 'Red', 'White', 'Black'],
    correctAnswer: 'Brown', explanation: 'The fox is brown.', hint: 'Look at the first word.' },
  { id: 'q2', passageId: 'test_001', type: 'true_false', order: 2,
    text: 'The dog is lazy.', options: ['True', 'False'],
    correctAnswer: 'True', explanation: 'The passage says lazy dog.' },
  { id: 'q3', passageId: 'test_001', type: 'short_answer', order: 3,
    text: 'What does the fox do?', expectedAnswers: ['jumps', 'jumps over'],
    correctAnswer: 'jumps over the lazy dog', explanation: 'The fox jumps.' }
];

// PassageManager
describe('PassageManager', () => {
  let pm;
  beforeEach(() => { pm = new PassageManager([validPassage, shortPassage]); });

  it('loads a valid passage by id', async () => {
    const p = await pm.loadPassage('test_001');
    expect(p.id).toBe('test_001');
    expect(p.estimatedReadingTime).toBeGreaterThan(0);
  });

  it('throws PassageNotFoundError for unknown id', async () => {
    await expect(pm.loadPassage('nonexistent')).rejects.toThrow(PassageNotFoundError);
  });

  it('throws PassageValidationError for short passage', async () => {
    await expect(pm.loadPassage('test_short')).rejects.toThrow(PassageValidationError);
  });

  it('validates passage correctly', () => {
    const r = pm.validatePassage(validPassage);
    expect(r.isValid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('returns errors for invalid passage', () => {
    const r = pm.validatePassage({ id: 'x', text: 'short', title: '', difficulty: 'bad', subject: 'en' });
    expect(r.isValid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it('calculates reading time', () => {
    const t = pm.getEstimatedReadingTime({ text: 'word '.repeat(200) });
    expect(t).toBe(1);
  });

  it('returns null for previous at first passage', async () => {
    expect(await pm.getPreviousPassage()).toBeNull();
  });

  it('sets current index by id', () => {
    pm.setCurrentIndex('test_short');
    expect(pm.currentIndex).toBe(1);
  });
});

// QuestionHandler
describe('QuestionHandler', () => {
  let qh;
  beforeEach(() => { qh = new QuestionHandler(questions); });

  it('loads questions sorted by order', async () => {
    const qs = await qh.loadQuestions('test_001');
    expect(qs).toHaveLength(3);
    expect(qs[0].order).toBeLessThanOrEqual(qs[1].order);
  });

  it('throws QuestionLoadError for unknown passage', async () => {
    await expect(qh.loadQuestions('unknown')).rejects.toThrow(QuestionLoadError);
  });

  it('validates correct MC answer', () => {
    expect(qh.validateAnswer(questions[0], 'Brown').isCorrect).toBe(true);
  });

  it('validates incorrect MC answer', () => {
    expect(qh.validateAnswer(questions[0], 'Red').isCorrect).toBe(false);
  });

  it('validates true/false', () => {
    expect(qh.validateAnswer(questions[1], 'True').isCorrect).toBe(true);
    expect(qh.validateAnswer(questions[1], 'False').isCorrect).toBe(false);
  });

  it('validates short answer with fuzzy match', () => {
    expect(qh.validateAnswer(questions[2], 'jumps').isCorrect).toBe(true);
    expect(qh.validateAnswer(questions[2], 'completely wrong xyz').isCorrect).toBe(false);
  });

  it('calculates score', () => {
    const s = qh.calculateScore([{ isCorrect: true }, { isCorrect: true }, { isCorrect: false }]);
    expect(s.score).toBe(67);
    expect(s.correctCount).toBe(2);
  });

  it('returns 0 for empty answers', () => {
    expect(qh.calculateScore([]).score).toBe(0);
  });

  it('records attempt with metadata', () => {
    const a = qh.recordAttempt(questions[0], 'Brown', 3000);
    expect(a.questionId).toBe('q1');
    expect(a.isCorrect).toBe(true);
    expect(a.attemptNumber).toBe(1);
  });

  it('increments attempt number', () => {
    qh.recordAttempt(questions[0], 'Brown', 1000);
    expect(qh.recordAttempt(questions[0], 'Red', 2000).attemptNumber).toBe(2);
  });

  it('returns hint from question', () => {
    expect(qh.getHints(questions[0])).toBe('Look at the first word.');
  });

  it('returns default hint when none set', () => {
    expect(qh.getHints({ type: 'multiple_choice' })).toContain('passage');
  });
});

// HighlightManager
describe('HighlightManager', () => {
  let hm;
  beforeEach(() => { localStorage.clear(); hm = new HighlightManager('test_001'); });

  it('saves highlight with id', () => {
    const h = hm.saveHighlight(0, 5, 'quick brown');
    expect(h.id).toBeTruthy();
    expect(h.color).toBe('#FFD700');
  });

  it('persists to localStorage', () => {
    hm.saveHighlight(0, 3, 'fox');
    expect(new HighlightManager('test_001').userHighlights).toHaveLength(1);
  });

  it('removes highlight by id', () => {
    const h = hm.saveHighlight(0, 3, 'fox');
    hm.removeHighlight(h.id);
    expect(hm.userHighlights).toHaveLength(0);
    expect(new HighlightManager('test_001').userHighlights).toHaveLength(0);
  });

  it('updates and clears voice highlight', () => {
    hm.updateVoiceHighlight(5);
    expect(hm.voiceHighlight).toBe(5);
    hm.clearVoiceHighlight();
    expect(hm.voiceHighlight).toBeNull();
  });

  it('isolates highlights per passage', () => {
    hm.saveHighlight(0, 3, 'fox');
    expect(new HighlightManager('test_002').userHighlights).toHaveLength(0);
  });
});

// PassageCache
describe('PassageCache', () => {
  let cache;
  beforeEach(() => { localStorage.clear(); cache = new PassageCache(); });

  it('returns null for uncached passage', async () => {
    expect(await cache.get('missing')).toBeNull();
  });

  it('stores and retrieves passage', async () => {
    await cache.set('p1', validPassage, questions);
    const r = await cache.get('p1');
    expect(r.passage.id).toBe('test_001');
    expect(r.questions).toHaveLength(3);
  });

  it('reports availability', async () => {
    await cache.set('p1', validPassage, []);
    expect(await cache.isAvailable('p1')).toBe(true);
    expect(await cache.isAvailable('p2')).toBe(false);
  });

  it('clears all passages', async () => {
    await cache.set('p1', validPassage, []);
    await cache.clear();
    expect(await cache.get('p1')).toBeNull();
  });

  it('evicts LRU entry', async () => {
    await cache.set('p1', validPassage, []);
    await cache.set('p2', validPassage, []);
    await cache.evictLRU();
    expect(await cache.isAvailable('p1')).toBe(false);
    expect(await cache.isAvailable('p2')).toBe(true);
  });

  it('reports size > 0 after caching', async () => {
    await cache.set('p1', validPassage, questions);
    expect(await cache.getSize()).toBeGreaterThan(0);
  });
});

// ReadingProgressTracker
describe('ReadingProgressTracker', () => {
  let tracker;
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); tracker = new ReadingProgressTracker(); });

  it('calculates reading speed', () => {
    expect(tracker.calculateReadingSpeed(200, 60000)).toBe(200);
  });

  it('returns 0 for zero time', () => {
    expect(tracker.calculateReadingSpeed(200, 0)).toBe(0);
  });

  it('awards more XP for harder difficulty', () => {
    expect(tracker.awardXP(90, 'hard')).toBeGreaterThan(tracker.awardXP(90, 'easy'));
  });

  it('awards more XP for higher scores', () => {
    expect(tracker.awardXP(95, 'intermediate')).toBeGreaterThan(tracker.awardXP(40, 'intermediate'));
  });

  it('increases difficulty above 80', () => {
    tracker.updateAdaptiveDifficulty(85);
    expect(tracker.getCurrentDifficulty()).toBe('hard');
  });

  it('decreases difficulty below 50', () => {
    tracker.updateAdaptiveDifficulty(40);
    expect(tracker.getCurrentDifficulty()).toBe('easy');
  });

  it('maintains difficulty 50-80', () => {
    tracker.updateAdaptiveDifficulty(65);
    expect(tracker.getCurrentDifficulty()).toBe('intermediate');
  });

  it('returns empty stats with no sessions', () => {
    const s = tracker.getProgressStats();
    expect(s.totalPassages).toBe(0);
    expect(s.averageScore).toBe(0);
  });

  it('records completion and returns xp', () => {
    const r = tracker.recordPassageCompletion('test_001', 80, 120000, 5);
    expect(r.xpAwarded).toBeGreaterThan(0);
    expect(r.session.score).toBe(80);
  });

  it('aggregates stats across sessions', () => {
    tracker.recordPassageCompletion('p1', 80, 60000, 3);
    tracker.recordPassageCompletion('p2', 60, 90000, 4);
    const s = tracker.getProgressStats();
    expect(s.totalPassages).toBe(2);
    expect(s.averageScore).toBe(70);
  });
});
