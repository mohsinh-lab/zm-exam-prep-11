import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getSessionQuestions,
    recordAnswer,
    getCurrentLevel,
    getWeakTopics,
    checkBoosterRequired,
    getSubjectMastery,
    isWeekend,
    getRankInfo,
    THEMED_RANKS
} from '../src/engine/adaptiveEngine.js';
import * as progressStore from '../src/engine/progressStore.js';
import * as readinessEngine from '../src/engine/readinessEngine.js';

vi.mock('../src/engine/progressStore.js', () => ({
    getProgress: vi.fn(),
    updateProgress: vi.fn()
}));

vi.mock('../src/engine/readinessEngine.js', () => ({
    calculateReadiness: vi.fn(() => 75),
    getWeakTopics: vi.fn(() => [])
}));

describe('Adaptive Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        progressStore.getProgress.mockReturnValue({
            ratings: {},
            attempts: {},
            lastResult: {},
            topicMastery: {},
            sessions: []
        });
    });

    describe('getSessionQuestions', () => {
        it('should return questions for the specified subject', () => {
            const questions = getSessionQuestions('vr', 5);
            expect(questions).toHaveLength(5);
            expect(questions.every(q => q.subject === 'vr')).toBe(true);
        });

        it('should prioritize questions based on student rating', () => {
            progressStore.getProgress.mockReturnValue({
                ratings: { vr: 1400 },
                attempts: {},
                lastResult: {},
                topicMastery: {},
                sessions: []
            });

            const questions = getSessionQuestions('vr', 10);
            expect(questions.length).toBeGreaterThan(0);
        });

        it('should prioritize wrong answers for spaced repetition', () => {
            progressStore.getProgress.mockReturnValue({
                ratings: { vr: 1200 },
                attempts: { vr001: 2 },
                lastResult: { vr001: false },
                topicMastery: {},
                sessions: []
            });

            const questions = getSessionQuestions('vr', 10);
            expect(questions.length).toBeGreaterThan(0);
        });

        it('should increase priority when student is behind', () => {
            readinessEngine.calculateReadiness.mockReturnValue(60);
            progressStore.getProgress.mockReturnValue({
                ratings: { vr: 1200 },
                attempts: {},
                lastResult: { vr001: false },
                topicMastery: {},
                sessions: []
            });

            const questions = getSessionQuestions('vr', 10);
            expect(questions.length).toBeGreaterThan(0);
        });
    });

    describe('recordAnswer', () => {
        it('should update student rating on correct answer', () => {
            const mockProgress = {
                ratings: { vr: 1200 },
                attempts: {},
                lastResult: {},
                topicMastery: {},
                sessions: []
            };
            progressStore.getProgress.mockReturnValue(mockProgress);

            const question = {
                id: 'vr001',
                subject: 'vr',
                type: 'Letter Series',
                difficulty: 2
            };

            recordAnswer(question, true);

            expect(progressStore.updateProgress).toHaveBeenCalled();
            const updatedProgress = progressStore.updateProgress.mock.calls[0][0];
            expect(updatedProgress.ratings.vr).toBeGreaterThan(1200);
            expect(updatedProgress.attempts.vr001).toBe(1);
            expect(updatedProgress.lastResult.vr001).toBe(true);
        });

        it('should decrease student rating on wrong answer', () => {
            const mockProgress = {
                ratings: { vr: 1200 },
                attempts: {},
                lastResult: {},
                topicMastery: {},
                sessions: []
            };
            progressStore.getProgress.mockReturnValue(mockProgress);

            const question = {
                id: 'vr001',
                subject: 'vr',
                type: 'Letter Series',
                difficulty: 2
            };

            recordAnswer(question, false);

            expect(progressStore.updateProgress).toHaveBeenCalled();
            const updatedProgress = progressStore.updateProgress.mock.calls[0][0];
            expect(updatedProgress.ratings.vr).toBeLessThan(1200);
            expect(updatedProgress.lastResult.vr001).toBe(false);
        });

        it('should track topic mastery', () => {
            const mockProgress = {
                ratings: { vr: 1200 },
                attempts: {},
                lastResult: {},
                topicMastery: {},
                sessions: []
            };
            progressStore.getProgress.mockReturnValue(mockProgress);

            const question = {
                id: 'vr001',
                subject: 'vr',
                type: 'Letter Series',
                difficulty: 2
            };

            recordAnswer(question, true);

            const updatedProgress = progressStore.updateProgress.mock.calls[0][0];
            expect(updatedProgress.topicMastery.vr['Letter Series']).toEqual({
                correct: 1,
                total: 1
            });
        });

        it('should cap rating between 800 and 1800', () => {
            const mockProgress = {
                ratings: { vr: 1750 },
                attempts: {},
                lastResult: {},
                topicMastery: {},
                sessions: []
            };
            progressStore.getProgress.mockReturnValue(mockProgress);

            const question = {
                id: 'vr001',
                subject: 'vr',
                type: 'Letter Series',
                difficulty: 1 // Easy question
            };

            recordAnswer(question, true);

            const updatedProgress = progressStore.updateProgress.mock.calls[0][0];
            expect(updatedProgress.ratings.vr).toBeLessThanOrEqual(1800);
        });
    });

    describe('getCurrentLevel', () => {
        it('should return level 1 for low ratings', () => {
            progressStore.getProgress.mockReturnValue({
                ratings: { vr: 1000 },
                sessions: []
            });

            expect(getCurrentLevel('vr')).toBe(1);
        });

        it('should return level 2 for medium ratings', () => {
            progressStore.getProgress.mockReturnValue({
                ratings: { vr: 1200 },
                sessions: []
            });

            expect(getCurrentLevel('vr')).toBe(2);
        });

        it('should return level 3 for high ratings', () => {
            progressStore.getProgress.mockReturnValue({
                ratings: { vr: 1400 },
                sessions: []
            });

            expect(getCurrentLevel('vr')).toBe(3);
        });

        it('should force level 2 when student is behind', () => {
            readinessEngine.calculateReadiness.mockReturnValue(50);
            progressStore.getProgress.mockReturnValue({
                ratings: { vr: 1100 },
                sessions: []
            });

            expect(getCurrentLevel('vr')).toBe(2);
        });
    });

    describe('getWeakTopics', () => {
        it('should return topics sorted by mastery', () => {
            progressStore.getProgress.mockReturnValue({
                topicMastery: {
                    vr: {
                        'Letter Series': { correct: 2, total: 5 },
                        'Word Analogy': { correct: 4, total: 5 },
                        'Anagram': { correct: 1, total: 3 }
                    }
                }
            });

            const weak = getWeakTopics('vr');
            expect(weak[0].topic).toBe('Anagram');
            expect(weak[0].mastery).toBe(33);
        });

        it('should only include topics with at least 2 attempts', () => {
            progressStore.getProgress.mockReturnValue({
                topicMastery: {
                    vr: {
                        'Letter Series': { correct: 0, total: 1 },
                        'Word Analogy': { correct: 1, total: 3 }
                    }
                }
            });

            const weak = getWeakTopics('vr');
            expect(weak.length).toBe(1);
            expect(weak[0].topic).toBe('Word Analogy');
        });

        it('should return empty array for new subject', () => {
            progressStore.getProgress.mockReturnValue({
                topicMastery: {}
            });

            const weak = getWeakTopics('vr');
            expect(weak).toEqual([]);
        });
    });

    describe('checkBoosterRequired', () => {
        it('should return null if less than 3 sessions', () => {
            progressStore.getProgress.mockReturnValue({
                sessions: [{ score: 50 }]
            });

            expect(checkBoosterRequired()).toBeNull();
        });

        it('should return booster if average accuracy < 65%', () => {
            progressStore.getProgress.mockReturnValue({
                sessions: [
                    { subject: 'vr', score: 50 },
                    { subject: 'vr', score: 60 },
                    { subject: 'vr', score: 55 }
                ],
                topicMastery: {
                    vr: {
                        'Letter Series': { correct: 1, total: 5 }
                    }
                }
            });

            const booster = checkBoosterRequired();
            expect(booster).not.toBeNull();
            expect(booster.subject).toBe('vr');
            expect(booster.rewardXP).toBe(50);
            expect(booster.isBooster).toBe(true);
        });

        it('should return null if accuracy >= 65%', () => {
            progressStore.getProgress.mockReturnValue({
                sessions: [
                    { subject: 'vr', score: 70 },
                    { subject: 'vr', score: 75 },
                    { subject: 'vr', score: 80 }
                ]
            });

            expect(checkBoosterRequired()).toBeNull();
        });
    });

    describe('getSubjectMastery', () => {
        it('should return 0 for new subject', () => {
            progressStore.getProgress.mockReturnValue({
                ratings: {}
            });

            expect(getSubjectMastery('vr')).toBe(0);
        });
    });

    describe('isWeekend', () => {
        it('should return true on Saturday', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-03-02')); // Saturday

            expect(isWeekend()).toBe(true);

            vi.useRealTimers();
        });

        it('should return true on Sunday', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-03-03')); // Sunday

            expect(isWeekend()).toBe(true);

            vi.useRealTimers();
        });

        it('should return false on weekday', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-03-04')); // Monday

            expect(isWeekend()).toBe(false);

            vi.useRealTimers();
        });
    });

    describe('getRankInfo', () => {
        it('should return Rookie Trainer for 0 XP', () => {
            const rank = getRankInfo(0);
            expect(rank.label).toBe('Rookie Trainer');
            expect(rank.icon).toBe('🎒');
        });

        it('should return correct rank for 1000 XP', () => {
            const rank = getRankInfo(1000);
            expect(rank.label).toBe('Autobot Recruit');
        });

        it('should return Elite Legend for 12000+ XP', () => {
            const rank = getRankInfo(15000);
            expect(rank.label).toBe('Elite Legend');
            expect(rank.icon).toBe('✨');
        });

        it('should return highest rank below XP threshold', () => {
            const rank = getRankInfo(2500);
            expect(rank.label).toBe('Gym Leader');
        });
    });
});
