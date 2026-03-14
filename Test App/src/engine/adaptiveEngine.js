// Adaptive Learning Engine
// Uses an ELO-inspired rating system (simplified Leitner boxes)
// to adjust question difficulty based on student performance

import { QUESTION_BANK, SUBJECTS, DIFFICULTY } from './questionBank.js';
import { getProgress, updateProgress } from './progressStore.js';
import { calculateReadiness } from './readinessEngine.js';

// ── Exported Constants ────────────────────────────────────────────────────
export const BASE_RATING = 1200;
export const MIN_RATING = 800;
export const MAX_RATING = 1800;
export const K_STUDENT = 32;
export const K_QUESTION = 16;

// ── localStorage Schema ───────────────────────────────────────────────────
export const ADAPTIVE_STORAGE_VERSION = 1;
export const ADAPTIVE_STORAGE_KEY = 'aceprep_adaptive_v1';

/**
 * Retrieve adaptive engine data from localStorage.
 * Returns empty object if nothing stored or version mismatch.
 * @returns {object}
 */
export function getAdaptiveData() {
    try {
        const raw = localStorage.getItem(ADAPTIVE_STORAGE_KEY);
        if (!raw) return {};
        const data = JSON.parse(raw);
        if (data.version !== ADAPTIVE_STORAGE_VERSION) return {};
        return data.payload || {};
    } catch { return {}; }
}

/**
 * Persist adaptive engine data to localStorage.
 * @param {object} data
 */
export function saveAdaptiveData(data) {
    try {
        localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify({
            version: ADAPTIVE_STORAGE_VERSION,
            payload: data,
            updatedAt: Date.now(),
        }));
    } catch { /* storage full */ }
}

/**
 * Firebase Schema for Adaptive Engine Data:
 * users/{userId}/adaptive/{subject}/
 *   rating: number (800-1800)
 *   masteryByTopic: { [topic]: { mastery, attempts, lastUpdated } }
 *   confidenceByTopic: { [topic]: number }
 *   spacedRepSchedule: { [questionId]: { nextReview, interval, correct } }
 *   learningPath: { topics: [], generatedAt: timestamp }
 *   updatedAt: timestamp
 */

// ── JSDoc Type Definitions ────────────────────────────────────────────────

/**
 * @typedef {object} StudentAdaptiveProfile
 * @property {string} studentId
 * @property {string} subject
 * @property {number} rating
 * @property {Object.<string, { mastery: number, attempts: number, lastUpdated: number }>} masteryByTopic
 * @property {Object.<string, number>} confidenceByTopic
 * @property {Object.<string, { nextReview: string, interval: number, correct: boolean }>} spacedRepSchedule
 * @property {{ topics: string[], generatedAt: number }} learningPath
 * @property {number} lastUpdated
 */

/**
 * @typedef {object} LearningGap
 * @property {string} topic
 * @property {number} mastery
 * @property {number} priority
 * @property {number} estimatedTimeToMastery
 */

/**
 * @typedef {object} QuestionPerformanceAggregate
 * @property {string} questionId
 * @property {number} totalAttempts
 * @property {number} correctAttempts
 * @property {number} avgResponseTime
 * @property {string} lastAttemptDate
 */

// ── Utility / Validation Functions ────────────────────────────────────────

/**
 * Validate that a studentId is a non-empty string.
 * @param {*} studentId
 * @returns {boolean}
 */
export function validateStudentId(studentId) {
    return typeof studentId === 'string' && studentId.length > 0;
}

/**
 * Validate that a subject key is one of the four supported subjects.
 * @param {*} subject
 * @returns {boolean}
 */
export function validateSubject(subject) {
    return ['maths', 'en', 'vr', 'nvr'].includes(subject);
}

/**
 * Safely retrieve a nested value from an object by dot-notation path.
 * @param {object} obj
 * @param {string} path - e.g. 'a.b.c'
 * @param {*} defaultVal
 * @returns {*}
 */
export function safeGet(obj, path, defaultVal) {
    try {
        return path.split('.').reduce((o, k) => o[k], obj) ?? defaultVal;
    } catch { return defaultVal; }
}



// ── Themed Ranks (Pokémon & Transformers) ──────────────────────────────────
export const THEMED_RANKS = [
    { minXp: 0, label: "Rookie Trainer", icon: "🎒" },
    { minXp: 500, label: "Autobot Recruit", icon: "🤖" },
    { minXp: 1500, label: "Gym Leader", icon: "🏆" },
    { minXp: 3000, label: "Cybertron Veteran", icon: "🛡️" },
    { minXp: 5000, label: "Pokémon Master", icon: "👑" },
    { minXp: 8000, label: "Prime Commander", icon: "🌌" },
    { minXp: 12000, label: "Elite Legend", icon: "✨" }
];
const MAX_SESSION_LENGTH = 10;

// ── Get next questions for a session ─────────────────────────────────────
export function getSessionQuestions(subject, count = MAX_SESSION_LENGTH) {
    const progress = getProgress();
    const studentRating = progress.ratings[subject] || BASE_RATING;

    // Filter questions for this subject
    const pool = QUESTION_BANK.filter(q => q.subject === subject);

    // Score each question by how well it matches student's current level
    const scored = pool.map(q => {
        const qRating = difficultyToRating(q.difficulty);
        const gap = Math.abs(qRating - studentRating);
        const attemptCount = progress.attempts[q.id] || 0;
        const lastResult = progress.lastResult[q.id]; // true=correct, false=wrong

        let score = 1000 - gap; // Prefer closer difficulty match

        const readiness = calculateReadiness(progress);
        const isBehind = readiness < 70;

        // Spaced repetition: prioritise questions answered wrong before
        if (lastResult === false) {
            score += isBehind ? 600 : 300; // Double priority if behind
        }

        // De-prioritise recently correct questions
        if (lastResult === true) score -= 200;

        // Prefer less-attempted questions for variety
        score -= attemptCount * 20;

        return { ...q, _score: score };
    });

    // Sort by score descending, take top N
    scored.sort((a, b) => b._score - a._score);
    const selected = scored.slice(0, count);

    // Shuffle selected questions
    return selected.sort(() => Math.random() - 0.5);
}

// ── Record answer and update ratings ─────────────────────────────────────
export function recordAnswer(question, isCorrect) {
    const progress = getProgress();
    const subject = question.subject;

    const studentRating = progress.ratings[subject] || BASE_RATING;
    const questionRating = difficultyToRating(question.difficulty);

    // Expected probability of student getting it right (ELO formula)
    const expectedStudent = 1 / (1 + Math.pow(10, (questionRating - studentRating) / 400));

    // Actual result
    const actual = isCorrect ? 1 : 0;

    // Update student rating
    const newStudentRating = Math.round(
        studentRating + K_STUDENT * (actual - expectedStudent)
    );

    // Record progress
    progress.ratings[subject] = Math.max(800, Math.min(1800, newStudentRating));
    progress.attempts[question.id] = (progress.attempts[question.id] || 0) + 1;
    progress.lastResult[question.id] = isCorrect;

    // Topic mastery tracking
    if (!progress.topicMastery[subject]) progress.topicMastery[subject] = {};
    const topic = question.type;
    if (!progress.topicMastery[subject][topic]) {
        progress.topicMastery[subject][topic] = { correct: 0, total: 0 };
    }
    progress.topicMastery[subject][topic].total++;
    if (isCorrect) progress.topicMastery[subject][topic].correct++;

    updateProgress(progress);
}

// ── Get overall mastery % for a subject ──────────────────────────────────

// ── Get difficulty level from rating ─────────────────────────────────────
export function getCurrentLevel(subject) {
    const progress = getProgress();
    const readiness = calculateReadiness(progress);
    const rating = progress.ratings[subject] || BASE_RATING;

    // If behind, force higher level exposure to accelerate learning
    if (readiness < 60 && rating > 1050) return 2;

    if (rating < 1100) return 1;
    if (rating < 1350) return 2;
    return 3;
}

// ── Get recommended focus topic ───────────────────────────────────────────
export function getWeakTopics(subject) {
    const progress = getProgress();
    const topics = progress.topicMastery[subject] || {};
    return Object.entries(topics)
        .filter(([, v]) => v.total >= 2)
        .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
        .slice(0, 3)
        .map(([topic, v]) => ({
            topic,
            mastery: Math.round((v.correct / v.total) * 100)
        }));
}

// ── Helper: convert difficulty enum to ELO rating ──────────────────────
function difficultyToRating(d) {
    if (d === DIFFICULTY.EASY) return 1000;
    if (d === DIFFICULTY.MEDIUM) return 1200;
    return 1400;
}

// ── Booster Missions (Dynamic Support) ───────────────────────────────────────

export function checkBoosterRequired() {
    const p = getProgress();
    const sessions = p.sessions || [];
    if (sessions.length < 3) return null;

    // Check last 3 sessions accuracy
    const recent = sessions.slice(-3);
    const avgAccuracy = recent.reduce((sum, s) => sum + s.score, 0) / 3;

    if (avgAccuracy < 65) {
        return generateBooster(recent);
    }
    return null;
}

function generateBooster(recentSessions) {
    const subScores = {};
    recentSessions.forEach(s => {
        subScores[s.subject] = (subScores[s.subject] || 0) + s.score;
    });
    const worstSub = Object.entries(subScores).sort((a, b) => a[1] - b[1])[0][0];

    const weakTopics = getWeakTopics(worstSub);
    const topic = weakTopics[0]?.topic || 'General Practice';

    return {
        id: 'booster_' + Date.now(),
        subject: worstSub,
        topic: topic,
        title: `🚀 Booster Mission: ${topic}`,
        desc: `Your accuracy dropped below 65%. Complete this focused session to unlock a 50 XP bonus and get back on track!`,
        rewardXP: 50,
        isBooster: true
    };
}

/**
 * Get overall mastery % for a subject.
 * Accepts an optional progress object so callers can pass their own snapshot
 * (avoids repeated localStorage reads). Falls back to getProgress() if omitted.
 * @param {object|string} progressOrSubject - progress object OR subject string (legacy)
 * @param {string} [subjectArg] - subject key when first arg is a progress object
 */
export function getSubjectMastery(progressOrSubject, subjectArg) {
    let p, subject;
    if (typeof progressOrSubject === 'string') {
        // Legacy call: getSubjectMastery('maths')
        subject = progressOrSubject;
        p = getProgress();
    } else {
        // New call: getSubjectMastery(progress, 'maths')
        p = progressOrSubject || getProgress();
        subject = subjectArg;
    }

    // Prefer topic-mastery weighted average when available (more accurate)
    const topics = p.topicMastery?.[subject];
    if (topics && Object.keys(topics).length > 0) {
        const entries = Object.values(topics).filter(v => v.total > 0);
        if (entries.length > 0) {
            const avg = entries.reduce((s, v) => s + (v.correct / v.total) * 100, 0) / entries.length;
            return Math.min(100, Math.max(0, Math.round(avg)));
        }
    }

    // Fallback: ELO rating conversion
    const rating = p.ratings?.[subject] || BASE_RATING;
    return Math.min(100, Math.max(0, Math.round((rating - 800) / 10)));
}

// ── Weekend & Specific Time Detection ───────────────────────────────────────

export function isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

export function getRankInfo(xp) {
    return [...THEMED_RANKS].reverse().find(r => xp >= r.minXp) || THEMED_RANKS[0];
}


// ── Enhanced Adaptive Engine ──────────────────────────────────────────────────
// Phase 2-10 enhancements: difficulty prediction, spaced repetition,
// confidence scoring, learning path generation, fatigue detection.

export const ELO_CONSTANTS = {
    BASE_RATING: 1200,
    MIN_RATING: 800,
    MAX_RATING: 1800,
    K_STUDENT: 32,
    K_QUESTION: 16,
};

/** Spaced repetition intervals in days */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90];

// ── ELO Helpers ───────────────────────────────────────────────────────────────

/**
 * Calculate expected probability of student answering correctly (ELO formula).
 * @param {number} studentRating
 * @param {number} questionRating
 * @returns {number} 0–1
 */
export function calculateExpectedProbability(studentRating, questionRating) {
    return 1 / (1 + Math.pow(10, (questionRating - studentRating) / 400));
}

/**
 * Constrain a rating to [MIN_RATING, MAX_RATING].
 * @param {number} rating
 * @returns {number}
 */
export function constrainRating(rating) {
    return Math.max(ELO_CONSTANTS.MIN_RATING, Math.min(ELO_CONSTANTS.MAX_RATING, Math.round(rating)));
}

// ── Difficulty Prediction ─────────────────────────────────────────────────────

/**
 * Analyse accuracy trend from last N attempts.
 * @param {Array<{correct: boolean}>} attempts
 * @returns {'improving'|'declining'|'stable'}
 */
export function calculateAccuracyTrend(attempts) {
    if (!attempts || attempts.length < 4) return 'stable';
    const half = Math.floor(attempts.length / 2);
    const recent = attempts.slice(-half);
    const older = attempts.slice(-attempts.length, -half);
    const recentAcc = recent.filter(a => a.correct).length / recent.length;
    const olderAcc = older.filter(a => a.correct).length / older.length;
    if (recentAcc - olderAcc > 0.1) return 'improving';
    if (olderAcc - recentAcc > 0.1) return 'declining';
    return 'stable';
}

/**
 * Adjust difficulty level based on accuracy trend.
 * @param {number} currentDifficulty - 1 (easy), 2 (medium), 3 (hard)
 * @param {'improving'|'declining'|'stable'} trend
 * @returns {number} adjusted difficulty 1–3
 */
export function adjustDifficultyByTrend(currentDifficulty, trend) {
    if (trend === 'improving') return Math.min(3, currentDifficulty + 1);
    if (trend === 'declining') return Math.max(1, currentDifficulty - 1);
    return currentDifficulty;
}

/**
 * Predict optimal difficulty for a student in a subject.
 * @param {object} progress
 * @param {string} subject
 * @returns {{ difficulty: number, confidence: number }}
 */
export function predictOptimalDifficulty(progress, subject) {
    const sessions = (progress.sessions || []).filter(s => s.subject === subject);
    if (sessions.length === 0) return { difficulty: 1, confidence: 50 };

    const recent = sessions.slice(-10);
    const avgAcc = recent.reduce((s, x) => s + x.score, 0) / recent.length;

    let difficulty;
    if (avgAcc > 80) difficulty = 3;
    else if (avgAcc >= 50) difficulty = 2;
    else difficulty = 1;

    // Confidence based on sample size
    const confidence = Math.min(95, 50 + recent.length * 4);
    return { difficulty, confidence };
}

// ── Mastery Calculation ───────────────────────────────────────────────────────

/**
 * Calculate mastery % from an array of attempt results.
 * Uses 70/30 weighted average: 70% recent (last 5), 30% historical.
 * @param {Array<boolean>} attempts - array of correct/incorrect booleans
 * @returns {number} 0–100
 */
export function calculateMastery(attempts) {
    if (!attempts || attempts.length === 0) return 0;
    if (attempts.length <= 5) {
        return Math.round((attempts.filter(Boolean).length / attempts.length) * 100);
    }
    const recent = attempts.slice(-5);
    const historical = attempts.slice(0, -5);
    const recentAcc = recent.filter(Boolean).length / recent.length;
    const histAcc = historical.filter(Boolean).length / historical.length;
    return Math.round((recentAcc * 0.7 + histAcc * 0.3) * 100);
}

/**
 * Classify mastery level.
 * @param {number} mastery 0–100
 * @returns {'Developing'|'Proficient'|'Mastered'}
 */
export function getMasteryLevel(mastery) {
    if (mastery >= 85) return 'Mastered';
    if (mastery >= 70) return 'Proficient';
    return 'Developing';
}

// ── Confidence Scoring ────────────────────────────────────────────────────────

/**
 * Calculate confidence score for a skill category.
 * Weights: 50% recency, 30% consistency, 20% attempt count.
 * @param {object} topicData - { correct: number, total: number }
 * @param {number} recentCorrect - correct answers in last 5 attempts
 * @param {number} recentTotal - total attempts in last 5
 * @returns {number} 0–100
 */
export function calculateConfidence(topicData, recentCorrect = 0, recentTotal = 0) {
    if (!topicData || topicData.total === 0) return 0;

    const overallAcc = topicData.correct / topicData.total;
    const recentAcc = recentTotal > 0 ? recentCorrect / recentTotal : overallAcc;

    // Consistency: how close recent is to overall
    const consistency = 1 - Math.abs(recentAcc - overallAcc);

    // Attempt weight: more attempts = more confidence (caps at 20)
    const attemptWeight = Math.min(1, topicData.total / 20);

    const raw = recentAcc * 0.5 + consistency * 0.3 + attemptWeight * 0.2;
    return Math.round(raw * 100);
}

/**
 * Classify confidence level.
 * @param {number} confidence 0–100
 * @returns {'Low'|'Medium'|'High'}
 */
export function getConfidenceLevel(confidence) {
    if (confidence >= 70) return 'High';
    if (confidence >= 40) return 'Medium';
    return 'Low';
}

// ── Spaced Repetition ─────────────────────────────────────────────────────────

/**
 * Schedule next review for a question.
 * @param {object} progress
 * @param {string} questionId
 * @param {boolean} correct
 * @returns {object} updated schedule entry
 */
export function scheduleReview(progress, questionId, correct) {
    if (!progress.spacedRepSchedule) progress.spacedRepSchedule = {};
    const entry = progress.spacedRepSchedule[questionId] || { intervalIndex: 0, nextReview: null, streak: 0 };

    if (!correct) {
        // Reset on incorrect
        entry.intervalIndex = 0;
        entry.streak = 0;
    } else {
        entry.streak = (entry.streak || 0) + 1;
        entry.intervalIndex = Math.min(REVIEW_INTERVALS.length - 1, entry.intervalIndex + 1);
    }

    const days = REVIEW_INTERVALS[entry.intervalIndex];
    entry.nextReview = new Date(Date.now() + days * 86400000).toISOString();
    progress.spacedRepSchedule[questionId] = entry;
    return entry;
}

/**
 * Get questions due for review today.
 * @param {object} progress
 * @param {string} subject
 * @param {Array} questionBank
 * @returns {Array<string>} question IDs due for review
 */
export function getScheduledReviews(progress, subject, questionBank) {
    const schedule = progress.spacedRepSchedule || {};
    const now = Date.now();
    return Object.entries(schedule)
        .filter(([qId, entry]) => {
            if (!entry.nextReview) return false;
            if (new Date(entry.nextReview).getTime() > now) return false;
            const q = questionBank.find(x => x.id === qId);
            return q && q.subject === subject;
        })
        .map(([qId]) => qId);
}

// ── Learning Path Generation ──────────────────────────────────────────────────

/**
 * Generate a prioritised learning path for a subject.
 * Returns topics sorted by priority: weak topics first (80%), then strong (20%).
 * @param {object} progress
 * @param {string} subject
 * @returns {Array<{ topic, mastery, priority, isWeak }>}
 */
export function generateLearningPath(progress, subject) {
    const topics = progress.topicMastery?.[subject] || {};
    const entries = Object.entries(topics)
        .filter(([, v]) => v.total >= 1)
        .map(([topic, v]) => ({
            topic,
            mastery: Math.round((v.correct / v.total) * 100),
            attempts: v.total,
        }));

    if (entries.length === 0) return [];

    const weak = entries.filter(e => e.mastery < 70).sort((a, b) => a.mastery - b.mastery);
    const strong = entries.filter(e => e.mastery >= 70).sort((a, b) => b.mastery - a.mastery);

    // 80/20 split: take 80% weak, 20% strong
    const weakCount = Math.ceil(entries.length * 0.8);
    const strongCount = Math.floor(entries.length * 0.2);

    return [
        ...weak.slice(0, weakCount).map((e, i) => ({ ...e, priority: i + 1, isWeak: true })),
        ...strong.slice(0, strongCount).map((e, i) => ({ ...e, priority: weakCount + i + 1, isWeak: false })),
    ];
}

/**
 * Estimate sessions needed to reach mastery for a topic.
 * @param {number} currentMastery 0–100
 * @param {number} targetMastery default 85
 * @returns {number} estimated sessions
 */
export function estimateTimeToMastery(currentMastery, targetMastery = 85) {
    if (currentMastery >= targetMastery) return 0;
    const gap = targetMastery - currentMastery;
    // Rough estimate: ~5% improvement per session
    return Math.ceil(gap / 5);
}

// ── Fatigue & Pacing ──────────────────────────────────────────────────────────

/**
 * Detect if student is showing fatigue signs (declining accuracy in session).
 * @param {Array<{correct: boolean, responseTime?: number}>} sessionAttempts
 * @returns {boolean}
 */
export function detectFatigue(sessionAttempts) {
    if (!sessionAttempts || sessionAttempts.length < 6) return false;
    const first = sessionAttempts.slice(0, 3);
    const last = sessionAttempts.slice(-3);
    const firstAcc = first.filter(a => a.correct).length / first.length;
    const lastAcc = last.filter(a => a.correct).length / last.length;
    return firstAcc - lastAcc > 0.3; // >30% drop = fatigue
}

/**
 * Calculate optimal session length based on recent performance.
 * @param {object} progress
 * @param {string} subject
 * @returns {number} recommended question count (5–15)
 */
export function calculateOptimalPace(progress, subject) {
    const sessions = (progress.sessions || []).filter(s => s.subject === subject);
    if (sessions.length === 0) return 10; // default

    const recent = sessions.slice(-5);
    const avgAcc = recent.reduce((s, x) => s + x.score, 0) / recent.length;

    if (avgAcc >= 80) return 15; // Doing well — longer session
    if (avgAcc >= 60) return 10; // Average — standard session
    return 5;                    // Struggling — shorter, focused session
}

/**
 * Calculate exam readiness score from all subjects.
 * Each subject contributes 25%. Applies recency bias (70% recent, 30% historical).
 * @param {object} progress
 * @returns {number} 0–100
 */
export function calculateExamReadiness(progress) {
    const subjects = ['maths', 'en', 'vr', 'nvr'];
    const scores = subjects.map(sub => {
        const sessions = (progress.sessions || []).filter(s => s.subject === sub);
        if (sessions.length === 0) return 0;
        const recent = sessions.slice(-5);
        const historical = sessions.slice(0, -5);
        const recentAcc = recent.reduce((s, x) => s + x.score, 0) / recent.length;
        const histAcc = historical.length
            ? historical.reduce((s, x) => s + x.score, 0) / historical.length
            : recentAcc;
        return recentAcc * 0.7 + histAcc * 0.3;
    });
    const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
    return Math.min(100, Math.max(0, Math.round(avg)));
}

/**
 * Predict success likelihood from readiness score.
 * @param {number} readinessScore 0–100
 * @returns {number} estimated success % (0–100)
 */
export function predictSuccessLikelihood(readinessScore) {
    // Sigmoid-like mapping: 85+ readiness → 90%+ success
    if (readinessScore >= 90) return 95;
    if (readinessScore >= 80) return 85;
    if (readinessScore >= 70) return 70;
    if (readinessScore >= 60) return 55;
    if (readinessScore >= 50) return 40;
    return Math.max(10, readinessScore * 0.5);
}


// ── Phase 2: ELO Rating System ────────────────────────────────────────────────

/**
 * Update a student's ELO rating for a subject after answering a question.
 * @param {string} studentId
 * @param {string} subject
 * @param {boolean} correct
 * @param {number} questionRating
 * @returns {number} new rating
 */
export function updateStudentRating(studentId, subject, correct, questionRating) {
    const data = getAdaptiveData();
    const key = `${studentId}_${subject}`;
    const currentRating = (data[key] && data[key].rating) || BASE_RATING;
    const expected = calculateExpectedProbability(currentRating, questionRating);
    const actual = correct ? 1 : 0;
    const newRating = constrainRating(currentRating + K_STUDENT * (actual - expected));
    if (!data[key]) data[key] = {};
    data[key].rating = newRating;
    saveAdaptiveData(data);
    return newRating;
}

/**
 * Initialize a student's rating for a subject at BASE_RATING if not already set.
 * @param {string} studentId
 * @param {string} subject
 * @returns {number} existing or newly set rating
 */
export function initializeStudentRating(studentId, subject) {
    const data = getAdaptiveData();
    const key = `${studentId}_${subject}`;
    if (data[key] && data[key].rating != null) return data[key].rating;
    if (!data[key]) data[key] = {};
    data[key].rating = BASE_RATING;
    saveAdaptiveData(data);
    return BASE_RATING;
}

/**
 * Track aggregate performance for a question.
 * @param {string} questionId
 * @param {boolean} correct
 * @param {number} studentRating
 * @returns {object} updated aggregate
 */
export function trackQuestionPerformance(questionId, correct, studentRating) {
    const data = getAdaptiveData();
    if (!data.questionPerformance) data.questionPerformance = {};
    const entry = data.questionPerformance[questionId] || {
        totalAttempts: 0, correctAttempts: 0, avgResponseTime: 0, lastAttemptDate: null,
    };
    entry.totalAttempts++;
    if (correct) entry.correctAttempts++;
    entry.lastAttemptDate = new Date().toISOString();
    data.questionPerformance[questionId] = entry;
    saveAdaptiveData(data);
    return entry;
}

/**
 * Flag a question for calibration if actual difficulty deviates >10% from assigned.
 * @param {string} questionId
 * @param {number} actualDifficulty
 * @param {number} assignedDifficulty
 * @returns {boolean} true if flagged
 */
export function flagQuestionForCalibration(questionId, actualDifficulty, assignedDifficulty) {
    const threshold = Math.abs(assignedDifficulty) * 0.1;
    const deviation = Math.abs(actualDifficulty - assignedDifficulty);
    const shouldFlag = deviation > threshold;
    if (shouldFlag) {
        const data = getAdaptiveData();
        if (!data.calibrationFlags) data.calibrationFlags = {};
        data.calibrationFlags[questionId] = { actualDifficulty, assignedDifficulty, flaggedAt: Date.now() };
        saveAdaptiveData(data);
    }
    return shouldFlag;
}

// ── Phase 3: Difficulty Prediction ───────────────────────────────────────────

/**
 * Analyse response time patterns from attempts.
 * @param {Array<{responseTime: number}>} attempts
 * @returns {{ avgTime: number, trend: 'fast'|'slow'|'normal', isSlowing: boolean }}
 */
export function analyzeResponseTimePatterns(attempts) {
    if (!attempts || attempts.length === 0) {
        return { avgTime: 0, trend: 'normal', isSlowing: false };
    }
    const times = attempts.map(a => a.responseTime || 0);
    const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
    let trend;
    if (avgTime < 15) trend = 'fast';
    else if (avgTime > 60) trend = 'slow';
    else trend = 'normal';

    let isSlowing = false;
    if (times.length >= 3) {
        const recentAvg = times.slice(-3).reduce((s, t) => s + t, 0) / 3;
        isSlowing = recentAvg > avgTime * 1.2;
    }
    return { avgTime, trend, isSlowing };
}

/**
 * Calculate confidence score for difficulty prediction based on session count.
 * @param {Array} sessions
 * @param {string} subject
 * @returns {number} 0–100
 */
export function calculateDifficultyConfidence(sessions, subject) {
    const subjectSessions = (sessions || []).filter(s => s.subject === subject);
    const count = subjectSessions.length;
    if (count === 0) return 0;
    return Math.min(95, count * 10);
}

/**
 * Apply difficulty adjustment rules based on accuracy.
 * @param {number} currentDifficulty 1–3
 * @param {number} accuracy 0–100
 * @returns {number} adjusted difficulty 1–3
 */
export function applyDifficultyAdjustmentRules(currentDifficulty, accuracy) {
    if (accuracy > 80) return Math.min(3, currentDifficulty + 1);
    if (accuracy < 50) return Math.max(1, currentDifficulty - 1);
    return currentDifficulty;
}

// ── Phase 4: Exam Readiness ───────────────────────────────────────────────────

/**
 * Calculate readiness score for a single subject (0–100).
 * Uses 70% recent (last 5 sessions) + 30% historical.
 * @param {object} progress
 * @param {string} subject
 * @returns {number}
 */
export function calculateSubjectReadiness(progress, subject) {
    const sessions = (progress.sessions || []).filter(s => s.subject === subject);
    if (sessions.length === 0) return 0;
    const recent = sessions.slice(-5);
    const historical = sessions.slice(0, -5);
    const recentAcc = recent.reduce((s, x) => s + x.score, 0) / recent.length;
    const histAcc = historical.length
        ? historical.reduce((s, x) => s + x.score, 0) / historical.length
        : recentAcc;
    return Math.min(100, Math.max(0, Math.round(recentAcc * 0.7 + histAcc * 0.3)));
}

/**
 * Calculate consistency penalty based on variance in ratings.
 * @param {number[]} ratings
 * @returns {number} penalty 0–20
 */
export function calculateConsistencyPenalty(ratings) {
    if (!ratings || ratings.length < 2) return 0;
    const mean = ratings.reduce((s, r) => s + r, 0) / ratings.length;
    const variance = ratings.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / ratings.length;
    const stdDev = Math.sqrt(variance);
    return Math.min(20, stdDev / 10);
}

/**
 * Get readiness-based recommendation.
 * @param {number} readinessScore 0–100
 * @returns {string}
 */
export function getReadinessRecommendation(readinessScore) {
    if (readinessScore >= 80) return 'mock_exam_practice';
    if (readinessScore >= 60) return 'focused_practice';
    return 'intensive_study';
}

// ── Phase 5: Learning Path Generation ────────────────────────────────────────

/**
 * Identify weak topics (mastery < 70%) from progress object.
 * @param {object} progress
 * @param {string} subject
 * @returns {Array<{topic, mastery}>}
 */
export function identifyWeakTopics(progress, subject) {
    const topics = progress.topicMastery?.[subject] || {};
    return Object.entries(topics)
        .map(([topic, v]) => ({ topic, mastery: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0 }))
        .filter(e => e.mastery < 70);
}

/**
 * Rank weak topics by priority (lowest mastery first).
 * If timeUntilExamDays < 30, boost priority of topics with mastery < 40%.
 * @param {Array<{topic, mastery}>} weakTopics
 * @param {number} timeUntilExamDays
 * @returns {Array<{topic, mastery, priority}>}
 */
export function rankTopicsByPriority(weakTopics, timeUntilExamDays) {
    const sorted = [...weakTopics].sort((a, b) => {
        // Boost critical topics when time is short
        if (timeUntilExamDays < 30) {
            const aCritical = a.mastery < 40 ? 1 : 0;
            const bCritical = b.mastery < 40 ? 1 : 0;
            if (aCritical !== bCritical) return bCritical - aCritical;
        }
        return a.mastery - b.mastery;
    });
    return sorted.map((t, i) => ({ ...t, priority: i + 1 }));
}

/**
 * Balance weak and strong topics: 80% weak + 20% strong.
 * @param {Array} weakTopics
 * @param {Array} strongTopics
 * @returns {Array}
 */
export function balanceWeakAndStrong(weakTopics, strongTopics) {
    const total = weakTopics.length + strongTopics.length;
    const weakCount = Math.ceil(total * 0.8);
    const strongCount = Math.floor(total * 0.2);
    return [
        ...weakTopics.slice(0, weakCount),
        ...strongTopics.slice(0, strongCount),
    ];
}

/**
 * Generate a booster mission for a critical weak topic (mastery < 40%).
 * @param {string} topic
 * @param {number} studentRating
 * @returns {object}
 */
export function generateBoosterMission(topic, studentRating) {
    return {
        id: `booster_${topic}_${Date.now()}`,
        topic,
        title: `🚀 Booster Mission: ${topic}`,
        desc: `Critical weak area detected. Complete this focused session to improve your mastery!`,
        rewardXP: 75,
        isBooster: true,
        isCritical: true,
    };
}

// ── Phase 6: Mastery Tracking ─────────────────────────────────────────────────

/**
 * Update mastery for a topic in progress object.
 * @param {object} progress
 * @param {string} subject
 * @param {string} skillCategory
 * @param {boolean} correct
 * @returns {number} updated mastery %
 */
export function updateMastery(progress, subject, skillCategory, correct) {
    if (!progress.topicMastery) progress.topicMastery = {};
    if (!progress.topicMastery[subject]) progress.topicMastery[subject] = {};
    if (!progress.topicMastery[subject][skillCategory]) {
        progress.topicMastery[subject][skillCategory] = { correct: 0, total: 0 };
    }
    const entry = progress.topicMastery[subject][skillCategory];
    entry.total++;
    if (correct) entry.correct++;
    const mastery = Math.round((entry.correct / entry.total) * 100);
    saveAdaptiveData({ masteryUpdate: { subject, skillCategory, mastery, updatedAt: Date.now() } });
    return mastery;
}

/**
 * Get weak topics (mastery < 70%) from progress object.
 * @param {object} progress
 * @param {string} subject
 * @returns {Array<{topic, mastery}>}
 */
export function getWeakTopicsFromProgress(progress, subject) {
    const topics = progress.topicMastery?.[subject] || {};
    return Object.entries(topics)
        .map(([topic, v]) => ({ topic, mastery: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0 }))
        .filter(e => e.mastery < 70);
}

/**
 * Get strong topics (mastery > 85%) from progress object.
 * @param {object} progress
 * @param {string} subject
 * @returns {Array<{topic, mastery}>}
 */
export function getStrongTopics(progress, subject) {
    const topics = progress.topicMastery?.[subject] || {};
    return Object.entries(topics)
        .map(([topic, v]) => ({ topic, mastery: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0 }))
        .filter(e => e.mastery > 85);
}

/**
 * Persist mastery data to both localStorage and adaptive store.
 * @param {object} progress
 */
export function persistMastery(progress) {
    updateProgress(progress);
    const data = getAdaptiveData();
    data.masterySnapshot = { topicMastery: progress.topicMastery, savedAt: Date.now() };
    saveAdaptiveData(data);
}

// ── Phase 7: Confidence Scoring ───────────────────────────────────────────────

/**
 * Get recommendation based on confidence score.
 * @param {number} confidence 0–100
 * @returns {{ action: string, message: string }}
 */
export function getRecommendationByConfidence(confidence) {
    if (confidence >= 70) return { action: 'advance', message: 'Ready to advance to harder topics' };
    if (confidence >= 40) return { action: 'practice', message: 'Continue practicing to build confidence' };
    return { action: 'review', message: 'Review fundamentals before advancing' };
}

/**
 * Update confidence for a topic after a response.
 * @param {object} progress
 * @param {string} subject
 * @param {string} topic
 * @param {boolean} correct
 * @returns {number} new confidence value
 */
export function updateConfidenceAfterResponse(progress, subject, topic, correct) {
    if (!progress.confidenceByTopic) progress.confidenceByTopic = {};
    if (!progress.confidenceByTopic[subject]) progress.confidenceByTopic[subject] = {};
    const current = progress.confidenceByTopic[subject][topic] || 50;
    const delta = correct ? 5 : -10;
    const newConfidence = Math.min(100, Math.max(0, current + delta));
    progress.confidenceByTopic[subject][topic] = newConfidence;
    return newConfidence;
}

// ── Phase 7.6: Integrate confidence into generateLearningPath ─────────────────
// (generateLearningPath already defined above; we extend it via a wrapper)

/**
 * Generate learning path with confidence data included.
 * @param {object} progress
 * @param {string} subject
 * @returns {Array}
 */
export function generateLearningPathWithConfidence(progress, subject) {
    const path = generateLearningPath(progress, subject);
    const confidenceMap = progress.confidenceByTopic?.[subject] || {};
    return path.map(entry => ({
        ...entry,
        confidence: confidenceMap[entry.topic] ?? null,
    }));
}

// ── Phase 8: Spaced Repetition ────────────────────────────────────────────────

/**
 * Update review interval based on retention score.
 * @param {object} progress
 * @param {string} questionId
 * @param {number} retention 0–100
 * @returns {object} updated entry
 */
export function updateReviewInterval(progress, questionId, retention) {
    if (!progress.spacedRepSchedule) progress.spacedRepSchedule = {};
    const entry = progress.spacedRepSchedule[questionId] || { intervalIndex: 0, nextReview: null, streak: 0 };
    if (retention > 85) {
        entry.intervalIndex = Math.min(REVIEW_INTERVALS.length - 1, entry.intervalIndex + 1);
    } else if (retention < 60) {
        entry.intervalIndex = Math.max(0, entry.intervalIndex - 1);
    }
    // else keep same
    const days = REVIEW_INTERVALS[entry.intervalIndex];
    entry.nextReview = new Date(Date.now() + days * 86400000).toISOString();
    progress.spacedRepSchedule[questionId] = entry;
    return entry;
}

// ── Phase 9: Dynamic Question Selection ──────────────────────────────────────

/**
 * Convert difficulty level (1/2/3) to ELO rating.
 * @param {number} difficulty
 * @returns {number}
 */
function difficultyLevelToRating(difficulty) {
    if (difficulty === 1) return 1000;
    if (difficulty === 2) return 1200;
    return 1400;
}

/**
 * Filter questions by difficulty within tolerance.
 * @param {Array} questions
 * @param {number} targetDifficulty 1|2|3
 * @param {number} tolerance default 100
 * @returns {Array}
 */
export function filterByDifficulty(questions, targetDifficulty, tolerance = 100) {
    const targetRating = difficultyLevelToRating(targetDifficulty);
    return questions.filter(q => {
        const qRating = difficultyLevelToRating(
            q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3
        );
        return Math.abs(qRating - targetRating) <= tolerance;
    });
}

/**
 * Prioritize questions matching weak topics.
 * @param {Array} questions
 * @param {Array<{topic, mastery}>} learningGaps
 * @returns {Array}
 */
export function prioritizeWeakTopics(questions, learningGaps) {
    const weakTopicSet = new Set((learningGaps || []).map(g => g.topic));
    return [...questions].sort((a, b) => {
        const aWeak = weakTopicSet.has(a.type) ? 1 : 0;
        const bWeak = weakTopicSet.has(b.type) ? 1 : 0;
        return bWeak - aWeak;
    });
}

/**
 * Boost questions due for spaced repetition review.
 * @param {Array} questions
 * @param {object} progress
 * @returns {Array}
 */
export function applySpacedRepetition(questions, progress) {
    const schedule = progress.spacedRepSchedule || {};
    const now = Date.now();
    return [...questions].sort((a, b) => {
        const aDue = schedule[a.id] && new Date(schedule[a.id].nextReview).getTime() <= now ? 1 : 0;
        const bDue = schedule[b.id] && new Date(schedule[b.id].nextReview).getTime() <= now ? 1 : 0;
        return bDue - aDue;
    });
}

/**
 * Filter out or de-prioritize recently answered questions.
 * @param {Array} questions
 * @param {object} progress
 * @param {number} lookbackCount default 5
 * @returns {Array}
 */
export function avoidRecentQuestions(questions, progress, lookbackCount = 5) {
    const recentIds = new Set(
        Object.entries(progress.lastResult || {})
            .slice(-lookbackCount)
            .map(([id]) => id)
    );
    const notRecent = questions.filter(q => !recentIds.has(q.id));
    return notRecent.length > 0 ? notRecent : questions;
}

/**
 * Score a question's relevance (0–100).
 * 40% weak topic match, 30% spaced rep due, 30% difficulty match.
 * @param {object} question
 * @param {Array<{topic, mastery}>} learningGaps
 * @param {object} spacedRepSchedule
 * @returns {number}
 */
export function scoreQuestionRelevance(question, learningGaps, spacedRepSchedule) {
    const weakTopicSet = new Set((learningGaps || []).map(g => g.topic));
    const topicScore = weakTopicSet.has(question.type) ? 40 : 0;

    const schedule = spacedRepSchedule || {};
    const entry = schedule[question.id];
    const isDue = entry && new Date(entry.nextReview).getTime() <= Date.now();
    const spacedScore = isDue ? 30 : 0;

    // Difficulty match: medium (2) is default target
    const diffScore = question.difficulty === 'medium' ? 30 : 15;

    return Math.min(100, topicScore + spacedScore + diffScore);
}

/**
 * Select the next best question using the full pipeline.
 * @param {Array} questions
 * @param {object} progress
 * @param {string} subject
 * @returns {object|null}
 */
export function selectNextQuestion(questions, progress, subject) {
    const subjectQuestions = questions.filter(q => q.subject === subject);
    if (subjectQuestions.length === 0) return null;

    const { difficulty } = predictOptimalDifficulty(progress, subject);
    let pool = filterByDifficulty(subjectQuestions, difficulty);
    if (pool.length === 0) pool = subjectQuestions;

    const gaps = getWeakTopicsFromProgress(progress, subject);
    pool = prioritizeWeakTopics(pool, gaps);
    pool = applySpacedRepetition(pool, progress);
    pool = avoidRecentQuestions(pool, progress);

    return pool[0] || null;
}

// ── Phase 10: Real-Time Adaptation ───────────────────────────────────────────

/**
 * Process a question response: update mastery, schedule review, track performance.
 * @param {object} progress
 * @param {string} subject
 * @param {string} questionId
 * @param {boolean} correct
 * @param {number} responseTime
 * @returns {object} updated progress
 */
export function processQuestionResponse(progress, subject, questionId, correct, responseTime) {
    // Find question type from lastResult keys or use questionId as fallback
    const skillCategory = questionId;
    updateMastery(progress, subject, skillCategory, correct);
    scheduleReview(progress, questionId, correct);
    trackQuestionPerformance(questionId, correct, progress.ratings?.[subject] || BASE_RATING);
    return progress;
}

/**
 * Update ELO ratings and mastery, then persist.
 * @param {object} progress
 * @param {string} subject
 * @param {boolean} correct
 * @param {number} questionRating
 * @returns {object} updated progress
 */
export function updateRatingsAndMastery(progress, subject, correct, questionRating) {
    const studentRating = progress.ratings?.[subject] || BASE_RATING;
    const expected = calculateExpectedProbability(studentRating, questionRating);
    const actual = correct ? 1 : 0;
    const newRating = constrainRating(studentRating + K_STUDENT * (actual - expected));
    if (!progress.ratings) progress.ratings = {};
    progress.ratings[subject] = newRating;
    updateProgress(progress);
    return progress;
}

/**
 * Recalculate difficulty prediction for a subject.
 * @param {object} progress
 * @param {string} subject
 * @returns {{ difficulty: number, confidence: number }}
 */
export function recalculateDifficultyPrediction(progress, subject) {
    const result = predictOptimalDifficulty(progress, subject);
    if (!progress.difficultyPredictions) progress.difficultyPredictions = {};
    progress.difficultyPredictions[subject] = { ...result, updatedAt: Date.now() };
    return result;
}

/**
 * Update learning path for a subject and store in progress.
 * @param {object} progress
 * @param {string} subject
 * @returns {Array}
 */
export function updateLearningPath(progress, subject) {
    const path = generateLearningPath(progress, subject);
    if (!progress.learningPath) progress.learningPath = {};
    progress.learningPath[subject] = path;
    return path;
}

/**
 * Adjust session length based on accuracy and response time.
 * @param {number} currentLength
 * @param {number} accuracy 0–100
 * @param {number} responseTime seconds
 * @returns {number} new session length (5–15)
 */
export function adjustSessionLength(currentLength, accuracy, responseTime) {
    if (accuracy > 80 && responseTime < 30) {
        return Math.min(15, currentLength + 2);
    }
    if (accuracy < 50 || responseTime > 60) {
        return Math.max(5, currentLength - 2);
    }
    return currentLength;
}

// ── Phase 11: Data Persistence and Offline Support ────────────────────────────

const CACHE_VERSION = 1;
const CACHE_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const LEARNING_PATH_CACHE_KEY = 'aceprep_lp_cache';
const RECOMMENDATIONS_CACHE_KEY = 'aceprep_rec_cache';
const SPACED_REP_CACHE_KEY = 'aceprep_sr_cache';
const OFFLINE_QUEUE_KEY = 'aceprep_offline_queue';

/**
 * Estimate byte size of a value when JSON-serialised.
 * @param {*} value
 * @returns {number}
 */
function estimateSize(value) {
    try { return new Blob([JSON.stringify(value)]).size; } catch { return 0; }
}

/**
 * Generic LRU cache read from localStorage.
 * @param {string} key
 * @returns {{ entries: object, accessOrder: string[] }}
 */
function readCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return { entries: {}, accessOrder: [] };
        const parsed = JSON.parse(raw);
        if (parsed.version !== CACHE_VERSION) return { entries: {}, accessOrder: [] };
        return { entries: parsed.entries || {}, accessOrder: parsed.accessOrder || [] };
    } catch { return { entries: {}, accessOrder: [] }; }
}

/**
 * Generic LRU cache write to localStorage with eviction.
 * @param {string} key
 * @param {{ entries: object, accessOrder: string[] }} cache
 */
function writeCache(key, cache) {
    // Evict LRU entries until under size limit
    while (estimateSize(cache) > CACHE_MAX_BYTES && cache.accessOrder.length > 0) {
        const lruKey = cache.accessOrder.shift();
        delete cache.entries[lruKey];
    }
    try {
        localStorage.setItem(key, JSON.stringify({ version: CACHE_VERSION, ...cache, updatedAt: Date.now() }));
    } catch { /* storage full */ }
}

/**
 * Cache a learning path for a student/subject with versioning.
 * @param {string} studentId
 * @param {string} subject
 * @param {Array} learningPath
 */
export function cacheLearningPath(studentId, subject, learningPath) {
    const cacheKey = `${studentId}:${subject}`;
    const cache = readCache(LEARNING_PATH_CACHE_KEY);
    cache.entries[cacheKey] = { data: learningPath, cachedAt: Date.now(), version: CACHE_VERSION };
    // Update LRU order
    cache.accessOrder = cache.accessOrder.filter(k => k !== cacheKey);
    cache.accessOrder.push(cacheKey);
    writeCache(LEARNING_PATH_CACHE_KEY, cache);
}

/**
 * Retrieve a cached learning path.
 * @param {string} studentId
 * @param {string} subject
 * @param {number} maxAgeMs - max age in ms (default 1 hour)
 * @returns {Array|null}
 */
export function getCachedLearningPath(studentId, subject, maxAgeMs = 3600000) {
    const cacheKey = `${studentId}:${subject}`;
    const cache = readCache(LEARNING_PATH_CACHE_KEY);
    const entry = cache.entries[cacheKey];
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > maxAgeMs) return null;
    // Update LRU order
    cache.accessOrder = cache.accessOrder.filter(k => k !== cacheKey);
    cache.accessOrder.push(cacheKey);
    writeCache(LEARNING_PATH_CACHE_KEY, cache);
    return entry.data;
}

// ── Phase 11.2: Cache recommendations and spaced rep schedule ─────────────────

/**
 * Cache recommendations for a student.
 * @param {string} studentId
 * @param {object} recommendations
 */
export function cacheRecommendations(studentId, recommendations) {
    const cache = readCache(RECOMMENDATIONS_CACHE_KEY);
    cache.entries[studentId] = { data: recommendations, cachedAt: Date.now() };
    cache.accessOrder = cache.accessOrder.filter(k => k !== studentId);
    cache.accessOrder.push(studentId);
    writeCache(RECOMMENDATIONS_CACHE_KEY, cache);
}

/**
 * Retrieve cached recommendations.
 * @param {string} studentId
 * @param {number} maxAgeMs
 * @returns {object|null}
 */
export function getCachedRecommendations(studentId, maxAgeMs = 3600000) {
    const cache = readCache(RECOMMENDATIONS_CACHE_KEY);
    const entry = cache.entries[studentId];
    if (!entry || Date.now() - entry.cachedAt > maxAgeMs) return null;
    return entry.data;
}

/**
 * Cache spaced repetition schedule for a student.
 * @param {string} studentId
 * @param {object} schedule
 */
export function cacheSpacedRepSchedule(studentId, schedule) {
    const cache = readCache(SPACED_REP_CACHE_KEY);
    cache.entries[studentId] = { data: schedule, cachedAt: Date.now() };
    cache.accessOrder = cache.accessOrder.filter(k => k !== studentId);
    cache.accessOrder.push(studentId);
    writeCache(SPACED_REP_CACHE_KEY, cache);
}

/**
 * Retrieve cached spaced rep schedule.
 * @param {string} studentId
 * @returns {object|null}
 */
export function getCachedSpacedRepSchedule(studentId) {
    const cache = readCache(SPACED_REP_CACHE_KEY);
    const entry = cache.entries[studentId];
    return entry ? entry.data : null;
}

// ── Phase 11.3: LRU eviction (already integrated in writeCache above) ─────────

/**
 * Evict all stale entries older than maxAgeMs from a cache.
 * @param {string} key
 * @param {number} maxAgeMs
 */
export function evictStaleCache(key, maxAgeMs = 86400000) {
    const cache = readCache(key);
    const now = Date.now();
    const staleKeys = Object.keys(cache.entries).filter(k => now - (cache.entries[k].cachedAt || 0) > maxAgeMs);
    staleKeys.forEach(k => {
        delete cache.entries[k];
        cache.accessOrder = cache.accessOrder.filter(o => o !== k);
    });
    writeCache(key, cache);
}

// ── Phase 11.4: Offline queue ─────────────────────────────────────────────────

/**
 * Enqueue a rating/mastery update for later Firebase sync.
 * @param {{ type: string, studentId: string, subject: string, payload: object }} update
 */
export function enqueueOfflineUpdate(update) {
    try {
        const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
        const queue = raw ? JSON.parse(raw) : [];
        queue.push({ ...update, queuedAt: Date.now() });
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch { /* storage full */ }
}

/**
 * Retrieve all queued offline updates.
 * @returns {Array}
 */
export function getOfflineQueue() {
    try {
        const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

/**
 * Clear the offline queue after successful sync.
 */
export function clearOfflineQueue() {
    try { localStorage.removeItem(OFFLINE_QUEUE_KEY); } catch { /* ignore */ }
}

// ── Phase 11.5: Firebase sync with conflict resolution ────────────────────────

/**
 * Merge local adaptive data with remote Firebase data using timestamp-based conflict resolution.
 * Remote wins if its updatedAt is newer; local wins otherwise.
 * @param {object} local
 * @param {object} remote
 * @returns {object} merged data
 */
export function mergeAdaptiveData(local, remote) {
    if (!remote) return local;
    if (!local) return remote;
    const localTs = local.updatedAt || 0;
    const remoteTs = remote.updatedAt || 0;
    // Per-subject merge: take the newer entry
    const merged = { ...local };
    if (remote.ratings) {
        merged.ratings = merged.ratings || {};
        Object.entries(remote.ratings).forEach(([subj, val]) => {
            const localSubjTs = (merged.ratings[subj] || {}).updatedAt || 0;
            const remoteSubjTs = (val || {}).updatedAt || 0;
            if (remoteSubjTs >= localSubjTs) merged.ratings[subj] = val;
        });
    }
    if (remote.topicMastery) {
        merged.topicMastery = merged.topicMastery || {};
        Object.entries(remote.topicMastery).forEach(([subj, topics]) => {
            if (!merged.topicMastery[subj]) { merged.topicMastery[subj] = topics; return; }
            Object.entries(topics).forEach(([topic, val]) => {
                const localTs2 = (merged.topicMastery[subj][topic] || {}).lastUpdated || 0;
                const remoteTs2 = (val || {}).lastUpdated || 0;
                if (remoteTs2 >= localTs2) merged.topicMastery[subj][topic] = val;
            });
        });
    }
    merged.updatedAt = Math.max(localTs, remoteTs);
    return merged;
}

// ── Phase 11.6: Cache validation and staleness detection ──────────────────────

/**
 * Validate cache integrity on app start. Returns true if cache is valid.
 * @param {string} key
 * @returns {boolean}
 */
export function validateCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return parsed.version === CACHE_VERSION && typeof parsed.entries === 'object';
    } catch { return false; }
}

/**
 * Check if a cached entry is stale.
 * @param {string} cacheKey - storage key
 * @param {string} entryKey - entry key within cache
 * @param {number} maxAgeMs
 * @returns {boolean}
 */
export function isCacheStale(cacheKey, entryKey, maxAgeMs = 3600000) {
    const cache = readCache(cacheKey);
    const entry = cache.entries[entryKey];
    if (!entry) return true;
    return Date.now() - (entry.cachedAt || 0) > maxAgeMs;
}

// ── Phase 12: Integration with Existing Systems ───────────────────────────────

/**
 * Read student adaptive profile from progressStore.
 * @param {string} studentId
 * @returns {object}
 */
export function getStudentAdaptiveProfile(studentId) {
    try {
        const progress = getProgress();
        return {
            studentId,
            ratings: progress.ratings || {},
            topicMastery: progress.topicMastery || {},
            spacedRepSchedule: progress.spacedRepSchedule || {},
            confidenceByTopic: progress.confidenceByTopic || {},
            updatedAt: progress.updatedAt || Date.now(),
        };
    } catch { return { studentId, ratings: {}, topicMastery: {}, spacedRepSchedule: {}, confidenceByTopic: {} }; }
}

/**
 * Write adaptive profile updates back to progressStore.
 * @param {object} updates - partial progress updates
 */
export function saveStudentAdaptiveProfile(updates) {
    try { updateProgress(updates); } catch { /* ignore */ }
}

/**
 * Get questions filtered by subject from the question bank.
 * @param {string} subject
 * @returns {Array}
 */
export function getQuestionsBySubject(subject) {
    return QUESTION_BANK.filter(q => q.subject === subject);
}

/**
 * Initialize adaptive engine on app start.
 * Validates caches, loads offline queue, and sets up sync.
 */
export function initAdaptiveEngine() {
    // Validate caches
    [LEARNING_PATH_CACHE_KEY, RECOMMENDATIONS_CACHE_KEY, SPACED_REP_CACHE_KEY].forEach(key => {
        if (!validateCache(key)) {
            try { localStorage.removeItem(key); } catch { /* ignore */ }
        }
    });
    // Evict stale entries (older than 24h)
    evictStaleCache(LEARNING_PATH_CACHE_KEY);
    evictStaleCache(RECOMMENDATIONS_CACHE_KEY);
}

// ── Phase 13: Multi-Language Support ─────────────────────────────────────────

const RECOMMENDATION_TRANSLATIONS = {
    en: {
        intensive: 'Intensive practice needed — focus on weak areas daily.',
        focused: 'Focused practice recommended — target specific weak topics.',
        mockExam: 'Ready for mock exams — maintain consistency.',
        developing: 'Keep practising — you\'re making progress.',
        proficient: 'Good work — push for mastery.',
        mastered: 'Excellent — topic mastered.',
    },
    ur: {
        intensive: 'گہری مشق ضروری ہے — روزانہ کمزور موضوعات پر توجہ دیں۔',
        focused: 'مرکوز مشق کی سفارش — مخصوص کمزور موضوعات کو ہدف بنائیں۔',
        mockExam: 'ماک امتحانات کے لیے تیار — مستقل مزاجی برقرار رکھیں۔',
        developing: 'مشق جاری رکھیں — آپ ترقی کر رہے ہیں۔',
        proficient: 'اچھا کام — مہارت کی طرف بڑھیں۔',
        mastered: 'شاندار — موضوع میں مہارت حاصل ہو گئی۔',
    },
};

/**
 * Get a recommendation string in the specified language.
 * @param {string} type - key from RECOMMENDATION_TRANSLATIONS
 * @param {string} lang - 'en' or 'ur'
 * @returns {string}
 */
export function getLocalizedRecommendation(type, lang = 'en') {
    const translations = RECOMMENDATION_TRANSLATIONS[lang] || RECOMMENDATION_TRANSLATIONS.en;
    return translations[type] || RECOMMENDATION_TRANSLATIONS.en[type] || type;
}

/**
 * Generate language-aware recommendations for a student.
 * @param {number} readinessScore
 * @param {string} lang - 'en' or 'ur'
 * @returns {string}
 */
export function generateLocalizedReadinessRecommendation(readinessScore, lang = 'en') {
    let type;
    if (readinessScore < 50) type = 'intensive';
    else if (readinessScore < 75) type = 'focused';
    else type = 'mockExam';
    return getLocalizedRecommendation(type, lang);
}

/**
 * Get current language from localStorage (mirrors i18n module).
 * @returns {string} 'en' or 'ur'
 */
export function getCurrentLanguage() {
    try { return localStorage.getItem('ace_lang') || 'en'; } catch { return 'en'; }
}

// ── Phase 14: Error Handling and Validation ───────────────────────────────────

/**
 * Safely generate a learning path with fallback on error.
 * @param {object} progress
 * @param {string} subject
 * @returns {Array}
 */
export function safeGenerateLearningPath(progress, subject) {
    try {
        return generateLearningPath(progress, subject);
    } catch {
        // Fallback: return all topics with equal priority
        try {
            const topics = Object.keys(progress.topicMastery?.[subject] || {});
            return topics.map(topic => ({ topic, mastery: 50, priority: 1, isWeak: false }));
        } catch { return []; }
    }
}

/**
 * Safely select next question with fallback to random selection.
 * @param {Array} questions
 * @param {object} progress
 * @param {string} subject
 * @returns {object|null}
 */
export function safeSelectNextQuestion(questions, progress, subject) {
    try {
        return selectNextQuestion(questions, progress, subject);
    } catch {
        // Fallback: random selection
        const subjectQs = questions.filter(q => q.subject === subject);
        if (!subjectQs.length) return null;
        return subjectQs[Math.floor(Math.random() * subjectQs.length)];
    }
}

/**
 * Safely process a question response, catching and logging errors.
 * @param {object} progress
 * @param {string} subject
 * @param {string} questionId
 * @param {boolean} correct
 * @param {number} responseTime
 * @returns {object} updated progress or original on error
 */
export function safeProcessQuestionResponse(progress, subject, questionId, correct, responseTime) {
    try {
        return processQuestionResponse(progress, subject, questionId, correct, responseTime);
    } catch (err) {
        console.error('[AdaptiveEngine] processQuestionResponse error:', err);
        return progress;
    }
}

/**
 * Detect and repair corrupted adaptive data.
 * @param {object} data
 * @returns {object} repaired data
 */
export function repairAdaptiveData(data) {
    if (!data || typeof data !== 'object') return {};
    const repaired = { ...data };
    if (typeof repaired.ratings !== 'object' || repaired.ratings === null) repaired.ratings = {};
    if (typeof repaired.topicMastery !== 'object' || repaired.topicMastery === null) repaired.topicMastery = {};
    if (typeof repaired.spacedRepSchedule !== 'object' || repaired.spacedRepSchedule === null) repaired.spacedRepSchedule = {};
    // Clamp ratings to valid range
    Object.keys(repaired.ratings).forEach(subj => {
        if (typeof repaired.ratings[subj] === 'number') {
            repaired.ratings[subj] = Math.max(MIN_RATING, Math.min(MAX_RATING, repaired.ratings[subj]));
        }
    });
    return repaired;
}

// ── Phase 15: Performance Optimization ───────────────────────────────────────

// Memoization cache for expensive calculations
const _memoCache = new Map();

/**
 * Memoized exam readiness calculation (invalidated after 60s).
 * @param {object} progress
 * @returns {number}
 */
export function memoizedExamReadiness(progress) {
    const key = JSON.stringify(progress.ratings || {}) + JSON.stringify(progress.topicMastery || {});
    const cached = _memoCache.get('readiness:' + key);
    if (cached && Date.now() - cached.ts < 60000) return cached.value;
    const value = calculateExamReadiness(progress);
    _memoCache.set('readiness:' + key, { value, ts: Date.now() });
    return value;
}

/**
 * Memoized learning path generation (invalidated after 5 min).
 * @param {object} progress
 * @param {string} subject
 * @returns {Array}
 */
export function memoizedLearningPath(progress, subject) {
    const key = subject + ':' + JSON.stringify(progress.topicMastery?.[subject] || {});
    const cached = _memoCache.get('lp:' + key);
    if (cached && Date.now() - cached.ts < 300000) return cached.value;
    const value = generateLearningPath(progress, subject);
    _memoCache.set('lp:' + key, { value, ts: Date.now() });
    return value;
}

/**
 * Clear the memoization cache (call on significant state changes).
 */
export function clearMemoCache() {
    _memoCache.clear();
}

/**
 * Performance benchmark helper — measures execution time of a function.
 * @param {Function} fn
 * @param {string} label
 * @returns {*} function result
 */
export function benchmark(fn, label = 'fn') {
    const start = performance.now();
    const result = fn();
    const elapsed = performance.now() - start;
    if (elapsed > 500) console.warn(`[AdaptiveEngine] ${label} took ${elapsed.toFixed(1)}ms`);
    return result;
}

// ── Phase 16: Documentation helpers (JSDoc already inline) ───────────────────

/**
 * Get a summary of all exported public API functions.
 * Useful for developer tooling and documentation generation.
 * @returns {string[]}
 */
export function getPublicAPI() {
    return [
        'getAdaptiveData', 'saveAdaptiveData',
        'validateStudentId', 'validateSubject',
        'calculateExpectedProbability', 'constrainRating',
        'updateStudentRating', 'initializeStudentRating',
        'trackQuestionPerformance', 'flagQuestionForCalibration',
        'calculateAccuracyTrend', 'analyzeResponseTimePatterns',
        'adjustDifficultyByTrend', 'predictOptimalDifficulty',
        'calculateMastery', 'getMasteryLevel', 'updateMastery',
        'calculateConfidence', 'getConfidenceLevel', 'getRecommendationByConfidence',
        'scheduleReview', 'getScheduledReviews', 'updateReviewInterval',
        'generateLearningPath', 'estimateTimeToMastery',
        'calculateExamReadiness', 'calculateSubjectReadiness',
        'predictSuccessLikelihood', 'getReadinessRecommendation',
        'identifyWeakTopics', 'rankTopicsByPriority', 'balanceWeakAndStrong',
        'generateBoosterMission', 'selectNextQuestion', 'scoreQuestionRelevance',
        'processQuestionResponse', 'adjustSessionLength', 'detectFatigue',
        'cacheLearningPath', 'getCachedLearningPath',
        'cacheRecommendations', 'getCachedRecommendations',
        'cacheSpacedRepSchedule', 'getCachedSpacedRepSchedule',
        'enqueueOfflineUpdate', 'getOfflineQueue', 'clearOfflineQueue',
        'mergeAdaptiveData', 'validateCache', 'isCacheStale',
        'getStudentAdaptiveProfile', 'saveStudentAdaptiveProfile',
        'initAdaptiveEngine', 'getLocalizedRecommendation',
        'generateLocalizedReadinessRecommendation', 'getCurrentLanguage',
        'safeGenerateLearningPath', 'safeSelectNextQuestion',
        'safeProcessQuestionResponse', 'repairAdaptiveData',
        'memoizedExamReadiness', 'memoizedLearningPath', 'clearMemoCache',
        'benchmark', 'getPublicAPI',
    ];
}
