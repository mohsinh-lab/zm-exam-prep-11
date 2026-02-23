// Progress Store — localStorage-backed persistence
import { syncProgressToCloud, loadProgressFromCloud } from './cloudSync.js';

const STORAGE_KEY = '11plus_progress';

const defaultProgress = () => ({
    // Per-subject ELO ratings
    ratings: {},
    // Per-question attempt count
    attempts: {},
    // Per-question last result
    lastResult: {},
    // Per-subject topic mastery
    topicMastery: {},
    // Session history
    sessions: [],
    // Streak tracking
    streak: 0,
    lastActivityDate: null,
    // XP and badges
    xp: 0,
    badges: [],
    // Parent report snapshots
    weeklySnapshots: [],
    monthlySnapshots: [],
    // Student name
    studentName: 'Zayyan Mohsin',
    parentEmail: 'emailmohsinh@gmail.com, ashbaig19@gmail.com',
    // Gems (hint currency)
    gems: 5,
    setupDone: true, // Auto-complete setup for this custom build
    // Auth state
    auth: {
        currentUser: null, // 'student', 'parent', or null
        studentPass: '2016',
        parentPass: '0786'
    }
});

export function login(passcode) {
    const progress = getProgress();
    if (passcode === progress.auth.studentPass) {
        sessionStorage.setItem('ace_current_user', 'student');
        return 'student';
    }
    if (passcode === progress.auth.parentPass) {
        sessionStorage.setItem('ace_current_user', 'parent');
        return 'parent';
    }
    return null;
}

export function logout() {
    sessionStorage.removeItem('ace_current_user');
}

export function getAuth() {
    const progress = getProgress();
    return {
        ...progress.auth,
        currentUser: sessionStorage.getItem('ace_current_user') || null
    };
}

export function getProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultProgress();
        return { ...defaultProgress(), ...JSON.parse(raw) };
    } catch {
        return defaultProgress();
    }
}

export function updateProgress(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // Auto-sync to the cloud in the background using Zayyan's email identifier
        syncProgressToCloud(data);
    } catch (e) {
        console.warn('Could not save progress:', e);
    }
}

export function recordSession(subject, questions, answers, timeTaken) {
    const progress = getProgress();

    const correct = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correct / questions.length) * 100);

    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        subject,
        total: questions.length,
        correct,
        score,
        timeTaken, // seconds
        xpGained: calculateXP(correct, questions.length, timeTaken),
    };

    progress.sessions.push(session);

    // XP
    progress.xp = (progress.xp || 0) + session.xpGained;

    // Gems: gain 1 gem per session, max 10
    progress.gems = Math.min(10, (progress.gems || 0) + 1);

    // Streak
    const today = new Date().toDateString();
    const lastDate = progress.lastActivityDate
        ? new Date(progress.lastActivityDate).toDateString()
        : null;
    if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        progress.streak = lastDate === yesterday ? (progress.streak || 0) + 1 : 1;
        progress.lastActivityDate = new Date().toISOString();
    }

    // Badge checking
    progress.badges = checkBadges(progress);

    // Keep only last 100 sessions
    if (progress.sessions.length > 100) {
        progress.sessions = progress.sessions.slice(-100);
    }

    updateProgress(progress);
    return session;
}

export function useHint(questionId) {
    const progress = getProgress();
    if (progress.gems <= 0) return false;
    progress.gems--;
    updateProgress(progress);
    return true;
}

export function setStudentName(name) {
    const progress = getProgress();
    progress.studentName = name;
    updateProgress(progress);
}

export function setParentEmail(email) {
    const progress = getProgress();
    progress.parentEmail = email;
    updateProgress(progress);
}

export function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
}

// ── XP Calculation ────────────────────────────────────────────────────────
function calculateXP(correct, total, timeTaken) {
    const base = correct * 10;
    const speedBonus = timeTaken < total * 45 ? 20 : 0; // bonus if <45s/question
    return base + speedBonus;
}

// ── Badge Checking ────────────────────────────────────────────────────────
const BADGE_DEFINITIONS = [
    { id: 'first_session', label: 'First Steps', icon: '🌟', desc: 'Complete your first practice session', check: p => p.sessions.length >= 1 },
    { id: 'streak_3', label: '3-Day Warrior', icon: '🔥', desc: '3-day learning streak', check: p => p.streak >= 3 },
    { id: 'streak_7', label: 'Week Champion', icon: '🏆', desc: '7-day learning streak', check: p => p.streak >= 7 },
    { id: 'streak_30', label: 'Monthly Master', icon: '👑', desc: '30-day learning streak', check: p => p.streak >= 30 },
    { id: 'perfect_score', label: 'Perfect 10!', icon: '💯', desc: 'Get 100% on a session', check: p => p.sessions.some(s => s.score === 100) },
    { id: 'maths_master', label: 'Maths Wizard', icon: '🔢', desc: 'Complete 10 Maths sessions', check: p => p.sessions.filter(s => s.subject === 'maths').length >= 10 },
    { id: 'vr_expert', label: 'Word Wizard', icon: '🔤', desc: 'Complete 10 VR sessions', check: p => p.sessions.filter(s => s.subject === 'vr').length >= 10 },
    { id: 'xp_500', label: 'XP Hunter', icon: '⚡', desc: 'Earn 500 XP', check: p => p.xp >= 500 },
    { id: 'xp_2000', label: 'Knowledge Knight', icon: '⚔️', desc: 'Earn 2000 XP', check: p => p.xp >= 2000 },
    {
        id: 'all_subjects', label: 'Renaissance Mind', icon: '🎓', desc: 'Practice all 4 subjects', check: p => {
            const subjects = new Set(p.sessions.map(s => s.subject));
            return subjects.size >= 4;
        }
    },
];

function checkBadges(progress) {
    const current = new Set(progress.badges || []);
    for (const badge of BADGE_DEFINITIONS) {
        if (!current.has(badge.id) && badge.check(progress)) {
            current.add(badge.id);
            console.log(`🏅 Badge earned: ${badge.label}`);
        }
    }
    return Array.from(current);
}

export { BADGE_DEFINITIONS };

// ── Report generation for parent emails ───────────────────────────────────
export function generateDailyReport(studentName) {
    const progress = getProgress();
    const today = new Date().toDateString();
    const todaySessions = progress.sessions.filter(s =>
        new Date(s.date).toDateString() === today
    );

    if (todaySessions.length === 0) {
        return `Hi,\n\n${studentName} hasn't had a practice session today yet. Encourage them to do at least one session (10 questions) to keep their streak going!\n\nBest wishes,\nAcePrep 11+ Team`;
    }

    const totalQ = todaySessions.reduce((s, x) => s + x.total, 0);
    const totalCorrect = todaySessions.reduce((s, x) => s + x.correct, 0);
    const avgScore = Math.round((totalCorrect / totalQ) * 100);
    const subjects = [...new Set(todaySessions.map(s => s.subject))].join(', ');

    return `Daily Progress Report — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}

Dear Parent,

Here is ${studentName}'s learning update for today:

📊 TODAY'S SUMMARY
• Sessions completed: ${todaySessions.length}
• Questions answered: ${totalQ}
• Overall accuracy: ${avgScore}%
• Subjects practised: ${subjects.toUpperCase()}
• Current streak: ${progress.streak} day${progress.streak !== 1 ? 's' : ''} 🔥

${avgScore >= 80 ? '✅ Excellent performance! ' + studentName + ' is making great progress.' :
            avgScore >= 60 ? '📈 Good effort! There is room to improve — a few more sessions will help.' :
                '⚠️ Today was challenging. Encourage ' + studentName + ' to revisit weak topics tomorrow.'}

TOTAL XP THIS WEEK: ${progress.xp} XP

Keep encouraging daily practice — consistency is the key to 11+ success!

Warm regards,
AcePrep 11+ | Dream School Prep`;
}

export function generateWeeklyReport(studentName) {
    const progress = getProgress();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekSessions = progress.sessions.filter(s => new Date(s.date).getTime() >= oneWeekAgo);

    const subjects = ['vr', 'nvr', 'en', 'maths'];
    const subjectLabels = { vr: 'Verbal Reasoning', nvr: 'Non-Verbal Reasoning', en: 'English', maths: 'Mathematics' };

    let subjectBreakdown = '';
    for (const sub of subjects) {
        const sSessions = weekSessions.filter(s => s.subject === sub);
        if (sSessions.length > 0) {
            const correct = sSessions.reduce((s, x) => s + x.correct, 0);
            const total = sSessions.reduce((s, x) => s + x.total, 0);
            const pct = Math.round((correct / total) * 100);
            const trend = pct >= 75 ? '📈 Great' : pct >= 55 ? '📊 Progressing' : '⚠️ Needs Focus';
            subjectBreakdown += `• ${subjectLabels[sub]}: ${pct}% accuracy (${sSessions.length} sessions) — ${trend}\n`;
        }
    }

    return `Weekly Progress Report — Week ending ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

Dear Parent,

Here is ${studentName}'s 11+ preparation summary for this week:

📅 WEEKLY OVERVIEW
• Active days: ${new Set(weekSessions.map(s => new Date(s.date).toDateString())).size} / 7
• Total sessions: ${weekSessions.length}
• Total questions: ${weekSessions.reduce((s, x) => s + x.total, 0)}
• Current streak: ${progress.streak} days 🔥
• Total XP earned: ${progress.xp} XP

📚 SUBJECT PERFORMANCE
${subjectBreakdown || '• No sessions recorded this week yet.'}

🎯 Dream SCHOOL READINESS
Exam format: 2 papers × 55 minutes — Paper 1: English + VR | Paper 2: Maths + NVR
Target: Consistently scoring 75%+ before mock exam season.

💡 NEXT WEEK RECOMMENDATION
${weekSessions.length < 5 ? 'Increase daily practice to at least 5 sessions per week.' :
            '5+ sessions completed — excellent! Try to push for 80%+ accuracy next week.'}

Thank you for supporting ${studentName}'s learning journey.

Warm regards,
AcePrep 11+ | Targeting Dream School (GL Assessment)`;
}

export function generateMonthlyReport(studentName) {
    const progress = getProgress();
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const monthSessions = progress.sessions.filter(s => new Date(s.date).getTime() >= oneMonthAgo);

    const totalQ = monthSessions.reduce((s, x) => s + x.total, 0);
    const totalCorrect = monthSessions.reduce((s, x) => s + x.correct, 0);
    const avgScore = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

    return `Monthly Progress Report — ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}

Dear Parent,

Here is ${studentName}'s comprehensive 11+ preparation report for this month:

🏆 MONTHLY ACHIEVEMENTS
• Total practice sessions: ${monthSessions.length}
• Total questions answered: ${totalQ}
• Average accuracy: ${avgScore}%
• Badges earned: ${progress.badges.length} 🏅
• Total XP: ${progress.xp} XP

📊 PROGRESS TOWARDS Dream SCHOOL
The exam is scheduled for September 2026. Based on current progress:
${avgScore >= 80 ? '✅ EXCELLENT — On track for a competitive score!' :
            avgScore >= 65 ? '📈 GOOD — Progressing well, but keep up consistent daily practice.' :
                avgScore >= 50 ? '📊 DEVELOPING — More focused daily practice recommended.' :
                    '⚠️ EARLY STAGE — Encourage more regular sessions.'}

📅 EXAM COUNTDOWN
• Exam date target: September 2026
• Months remaining: ~7 months
• Recommended weekly sessions: 5+

🗓️ ACTION PLAN MILESTONES THIS MONTH
• Phase 1 (Foundation): Complete core VR & English topics
• Phase 2 (Core Practice): 3+ timed practice sessions per subject
• Phase 3 (Mock Exams): Full 55-minute paper simulations in Spring 2026

📌 NEXT STEPS
1. Continue daily practice — consistency beats intensity
2. Focus on weak topics identified in the app
3. Begin mock exam simulations from April 2026

We are confident that with continued effort, ${studentName} will be well-prepared for the Dream School 11+ assessment.

Warm regards,
AcePrep 11+ Team
Customised for Dream School — GL Assessment Format`;
}
