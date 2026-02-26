/**
 * Notification Engine — Adapts student nudges based on Readiness Status
 */
import { calculateReadiness } from './readinessEngine.js';

const NOTIFICATIONS = {
    'Ready': [
        "Legendary work! You're currently beating the exam target. Keep the focus!",
        "Mastery is high. Ready for a 'Prime Commander' challenge today?",
        "Consistent accuracy! You're on track for your Dream School."
    ],
    'Approaching': [
        "So close! A few more 'Goal Accelerator' sessions will put you in the green zone.",
        "Good momentum! Let's crush those weak topics today.",
        "Your goal is within reach. 10 minutes of English will make the difference!"
    ],
    'Building Foundation': [
        "Time for a Boost! 🚀 Complete a session now to accelerate your readiness.",
        "Don't let the streak fade. Every question brings you closer to your goal.",
        "Heroic Effort needed! Let's tackle some Easy questions to build your power."
    ]
};

/**
 * Gets a dynamic notification based on current progress
 */
export function getReadinessNudge(progress) {
    const readiness = calculateReadiness(progress);
    let status = 'Building Foundation';
    if (readiness >= 85) status = 'Ready';
    else if (readiness >= 65) status = 'Approaching';

    const options = NOTIFICATIONS[status];
    return options[Math.floor(Math.random() * options.length)];
}

/**
 * Determines nudge frequency (how often to show modal/alert)
 * Higher readiness = lower frequency (less pressure)
 * Lower readiness = higher frequency (more encouragement)
 */
export function getNotificationFrequency(progress) {
    const readiness = calculateReadiness(progress);
    if (readiness >= 85) return 24 * 3600 * 1000; // Daily (once per 24h)
    if (readiness >= 65) return 12 * 3600 * 1000; // Twice daily
    return 4 * 3600 * 1000; // High urgency (every 4 hours)
}
