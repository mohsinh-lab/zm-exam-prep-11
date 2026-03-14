// Adaptive Learning Engine
// Uses an ELO-inspired rating system (simplified Leitner boxes)
// to adjust question difficulty based on student performance

import { QUESTION_BANK, SUBJECTS, DIFFICULTY } from './questionBank.js';
import { getProgress, updateProgress } from './progressStore.js';
import { calculateReadiness } from './readinessEngine.js';

// ── ELO Constants ─────────────────────────────────────────────────────────
const BASE_RATING = 1200;

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
const K_STUDENT = 32; // How fast student rating changes
const K_QUESTION = 16; // How fast question difficulty adjusts
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
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

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
