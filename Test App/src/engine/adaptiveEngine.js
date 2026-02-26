// Adaptive Learning Engine
// Uses an ELO-inspired rating system (simplified Leitner boxes)
// to adjust question difficulty based on student performance

import { QUESTION_BANK, SUBJECTS, DIFFICULTY } from './questionBank.js';
import { getProgress, updateProgress } from './progressStore.js';
import { calculateReadiness, getWeakTopics as getEngineWeakTopics } from './readinessEngine.js';

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

export function getSubjectMastery(subject) {
    const p = getProgress();
    const ratings = p.ratings || {};
    const subRatings = Object.entries(ratings)
        .filter(([id]) => {
            const q = QUESTION_BANK.find(x => x.id === id);
            return q && q.subject === subject;
        })
        .map(([_, r]) => r);

    if (!subRatings.length) return 0;
    const avg = subRatings.reduce((s, r) => s + r, 0) / subRatings.length;
    // Convert 1200-2000 ELO to 0-100%
    return Math.min(Math.max(Math.round((avg - 1200) / 8), 0), 100);
}

// ── Weekend & Specific Time Detection ───────────────────────────────────────

export function isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

export function getRankInfo(xp) {
    return [...THEMED_RANKS].reverse().find(r => xp >= r.minXp) || THEMED_RANKS[0];
}

