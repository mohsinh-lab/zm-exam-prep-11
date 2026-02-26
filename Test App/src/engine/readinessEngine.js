/**
 * Readiness Engine — Predicts 11+ success based on mastery trends and school benchmarks
 */
import { getProgress } from './progressStore.js';
import { getSubjectMastery } from './adaptiveEngine.js';
import { SUBJECTS } from './questionBank.js';

// ── School Benchmarks by Postcode prefix ──────────────────────────────────────
const CATCHMENT_DATA = {
    'B': [ // Birmingham
        { name: 'King Edward VI Five Ways', benchmark: 88, weight: 1.1 },
        { name: 'King Edward VI Camp Hill', benchmark: 92, weight: 1.2 },
        { name: 'Sutton Coldfield Grammar', benchmark: 85, weight: 1.0 }
    ],
    'HP': [ // Buckinghamshire (High Wycombe)
        { name: 'The Royal Grammar School', benchmark: 86, weight: 1.1 },
        { name: 'Wycombe High School', benchmark: 86, weight: 1.1 },
        { name: 'Sir Henry Floyd', benchmark: 82, weight: 1.0 }
    ],
    'MK': [ // Milton Keynes / Bucks border
        { name: 'Aylesbury Grammar', benchmark: 84, weight: 1.0 },
        { name: 'Sir Henry Floyd', benchmark: 82, weight: 1.0 }
    ],
    'ME': [ // Kent (Maidstone/Medway)
        { name: 'Maidstone Grammar', benchmark: 84, weight: 1.0 },
        { name: 'Rochester Grammar', benchmark: 88, weight: 1.1 }
    ],
    'TN': [ // Kent (Tunbridge Wells)
        { name: 'Tunbridge Wells Grammar', benchmark: 85, weight: 1.0 },
        { name: 'Tonbridge Grammar', benchmark: 94, weight: 1.3 } // Highly competitive
    ]
};

/**
 * Returns top schools for a given postcode
 */
export function getCatchmentSchools(postcode = '') {
    const prefix = postcode.trim().split(/\d/)[0].toUpperCase();
    return CATCHMENT_DATA[prefix] || [
        { name: 'Standard Grammar School', benchmark: 85, weight: 1.0 },
        { name: 'Highly Competitive School', benchmark: 90, weight: 1.2 }
    ];
}

/**
 * Calculates current readiness score (0-100)
 */
export function calculateReadiness(progress) {
    const goals = progress.goals || {};
    const schools = getCatchmentSchools(goals.postcode);
    const targetBenchmark = Math.max(...schools.map(s => s.benchmark)) || 85;

    // 1. Calculate weighted mastery across all subjects
    const subjectScores = Object.values(SUBJECTS).map(s => getSubjectMastery(s));
    const currentAvg = subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length;

    // 2. Readiness is the ratio of current avg vs target benchmark
    // If they meet the benchmark, readiness is 100
    let readiness = (currentAvg / targetBenchmark) * 100;

    // 3. Momentum Adjustment (Bonus for upward trend)
    const sessions = progress.sessions || [];
    if (sessions.length >= 6) {
        const last3 = sessions.slice(-3).reduce((s, x) => s + x.score, 0) / 3;
        const prev3 = sessions.slice(-6, -3).reduce((s, x) => s + x.score, 0) / 3;
        if (last3 > prev3) readiness += 5; // Momentum bonus
        else if (last3 < prev3 - 5) readiness -= 5; // Decay penalty
    }

    return Math.min(Math.max(Math.round(readiness), 0), 100);
}

/**
 * Generates an assuring action plan for parents
 */
export function generateActionPlan(progress) {
    const readiness = calculateReadiness(progress);
    const goals = progress.goals || {};
    const schools = getCatchmentSchools(goals.postcode);
    const topSchool = schools.sort((a, b) => b.benchmark - a.benchmark)[0];

    const sessions = progress.sessions || [];
    const recentAccuracy = sessions.length ? sessions.slice(-3).reduce((s, x) => s + x.score, 0) / sessions.length : 0;

    let plan = {
        title: readiness >= 85 ? "🔥 ELITE PERFORMANCE" : readiness >= 65 ? "📈 ON TRACK FOR SUCCESS" : "🛡️ FOCUS & BOOST PHASE",
        status: readiness >= 85 ? "Ready" : readiness >= 65 ? "Approaching" : "Building Foundation",
        narrative: "",
        steps: []
    };

    if (readiness >= 85) {
        plan.narrative = `${progress.studentName} is performing at an elite level, exceeding benchmarks for ${topSchool.name}.`;
        plan.steps = [
            "Maintain streak with daily 10-minute sessions.",
            "Focus on 'Time Pressure' drills to build exam-day stamina.",
            "Review 'Topic Master' badges to ensure 100% curriculum coverage."
        ];
    } else if (readiness >= 65) {
        plan.narrative = `${progress.studentName} is showing steady progress towards ${topSchool.name}. We are refining accuracy in key areas.`;
        plan.steps = [
            "Complete 2 Booster Missions this week in weak topics.",
            "Review the 'Log Book' for any recurring errors in English.",
            "Log in during the weekend for Islamic Wisdom & Focus quotes."
        ];
    } else {
        plan.narrative = `We are currently building the foundation needed for ${topSchool.name}. A focused sprint will accelerate growth.`;
        plan.steps = [
            "Daily attendance is critical to trigger the Adaptive Engine's support.",
            "Focus exclusively on 'Easy' and 'Medium' topics to build confidence.",
            "Use Hints frequently—they are a learning tool, not a cheat!"
        ];
    }

    return plan;
}
