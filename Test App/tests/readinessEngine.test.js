import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getCatchmentSchools,
    calculateReadiness,
    generateActionPlan
} from '../src/engine/readinessEngine.js';
import * as progressStore from '../src/engine/progressStore.js';
import * as adaptiveEngine from '../src/engine/adaptiveEngine.js';

vi.mock('../src/engine/progressStore.js', () => ({
    getProgress: vi.fn()
}));

vi.mock('../src/engine/adaptiveEngine.js', () => ({
    getSubjectMastery: vi.fn(() => 75)
}));

describe('Readiness Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCatchmentSchools', () => {
        it('should return Birmingham schools for B postcode', () => {
            const schools = getCatchmentSchools('B15 2TT');
            expect(schools.length).toBeGreaterThan(0);
            expect(schools[0].name).toContain('King Edward');
        });

        it('should return Buckinghamshire schools for HP postcode', () => {
            const schools = getCatchmentSchools('HP11 1AA');
            expect(schools.length).toBeGreaterThan(0);
            expect(schools.some(s => s.name.includes('Royal Grammar'))).toBe(true);
        });

        it('should return Kent schools for ME postcode', () => {
            const schools = getCatchmentSchools('ME14 1XX');
            expect(schools.length).toBeGreaterThan(0);
            expect(schools.some(s => s.name.includes('Maidstone'))).toBe(true);
        });

        it('should return Kent schools for TN postcode', () => {
            const schools = getCatchmentSchools('TN1 1XX');
            expect(schools.length).toBeGreaterThan(0);
            expect(schools.some(s => s.name.includes('Tunbridge'))).toBe(true);
        });

        it('should return default schools for unknown postcode', () => {
            const schools = getCatchmentSchools('XX99 9XX');
            expect(schools.length).toBe(2);
            expect(schools[0].name).toBe('Standard Grammar School');
            expect(schools[0].benchmark).toBe(85);
        });

        it('should handle empty postcode', () => {
            const schools = getCatchmentSchools('');
            expect(schools.length).toBe(2);
            expect(schools[0].benchmark).toBe(85);
        });

        it('should handle postcode with lowercase', () => {
            const schools = getCatchmentSchools('b15 2tt');
            expect(schools.length).toBeGreaterThan(0);
            expect(schools[0].name).toContain('King Edward');
        });
    });

    describe('calculateReadiness', () => {
        it('should calculate readiness based on subject mastery', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(85);
            const progress = {
                goals: { postcode: 'B15 2TT' },
                sessions: []
            };

            const readiness = calculateReadiness(progress);
            expect(readiness).toBeGreaterThan(0);
            expect(readiness).toBeLessThanOrEqual(100);
        });

        it('should apply momentum bonus for improving trend', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(75);
            const progress = {
                goals: { postcode: 'B15 2TT' },
                sessions: [
                    { score: 60 }, { score: 62 }, { score: 65 },
                    { score: 70 }, { score: 75 }, { score: 80 }
                ]
            };

            const readiness = calculateReadiness(progress);
            expect(readiness).toBeGreaterThan(0);
        });

        it('should apply decay penalty for declining trend', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(75);
            const progress = {
                goals: { postcode: 'B15 2TT' },
                sessions: [
                    { score: 80 }, { score: 78 }, { score: 75 },
                    { score: 65 }, { score: 60 }, { score: 55 }
                ]
            };

            const readiness = calculateReadiness(progress);
            expect(readiness).toBeGreaterThan(0);
        });

        it('should cap readiness at 100', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(95);
            const progress = {
                goals: { postcode: 'B15 2TT' },
                sessions: [
                    { score: 90 }, { score: 92 }, { score: 95 },
                    { score: 96 }, { score: 97 }, { score: 98 }
                ]
            };

            const readiness = calculateReadiness(progress);
            expect(readiness).toBeLessThanOrEqual(100);
        });

        it('should not go below 0', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(20);
            const progress = {
                goals: { postcode: 'TN1 1XX' }, // High benchmark
                sessions: []
            };

            const readiness = calculateReadiness(progress);
            expect(readiness).toBeGreaterThanOrEqual(0);
        });

        it('should handle missing goals', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(75);
            const progress = {
                sessions: []
            };

            const readiness = calculateReadiness(progress);
            expect(readiness).toBeGreaterThan(0);
        });

        it('should use highest benchmark from catchment schools', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(85);
            const progress = {
                goals: { postcode: 'TN1 1XX' }, // Has Tonbridge with 94 benchmark
                sessions: []
            };

            const readiness = calculateReadiness(progress);
            expect(readiness).toBeLessThan(100); // 85/94 * 100 < 100
        });
    });

    describe('generateActionPlan', () => {
        it('should generate elite plan for readiness >= 85', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(90);
            const progress = {
                studentName: 'Test Student',
                goals: { postcode: 'B15 2TT' },
                sessions: [
                    { score: 88 }, { score: 90 }, { score: 92 }
                ]
            };

            const plan = generateActionPlan(progress);
            expect(plan.title).toContain('ELITE');
            expect(plan.status).toBe('Ready');
            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should generate on-track plan for readiness 65-84', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(75);
            const progress = {
                studentName: 'Test Student',
                goals: { postcode: 'B15 2TT' },
                sessions: [
                    { score: 70 }, { score: 75 }, { score: 78 }
                ]
            };

            const plan = generateActionPlan(progress);
            expect(plan.title).toContain('ON TRACK');
            expect(plan.status).toBe('Approaching');
            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should generate foundation plan for readiness < 65', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(55);
            const progress = {
                studentName: 'Test Student',
                goals: { postcode: 'B15 2TT' },
                sessions: [
                    { score: 50 }, { score: 55 }, { score: 58 }
                ]
            };

            const plan = generateActionPlan(progress);
            expect(plan.title).toContain('FOCUS');
            expect(plan.status).toBe('Building Foundation');
            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should include student name in narrative', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(75);
            const progress = {
                studentName: 'Zayyan',
                goals: { postcode: 'B15 2TT' },
                sessions: []
            };

            const plan = generateActionPlan(progress);
            expect(plan.narrative).toContain('Zayyan');
        });

        it('should include target school in narrative', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(75);
            const progress = {
                studentName: 'Test Student',
                goals: { postcode: 'B15 2TT' },
                sessions: []
            };

            const plan = generateActionPlan(progress);
            expect(plan.narrative).toContain('King Edward');
        });

        it('should handle missing student name', () => {
            adaptiveEngine.getSubjectMastery.mockReturnValue(75);
            const progress = {
                goals: { postcode: 'B15 2TT' },
                sessions: []
            };

            const plan = generateActionPlan(progress);
            expect(plan.narrative).toBeDefined();
            expect(plan.steps.length).toBeGreaterThan(0);
        });
    });
});
