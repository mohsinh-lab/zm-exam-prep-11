// Parent Portal — Reading Comprehension Statistics Service
// Aggregates reading progress data for parent dashboard display and PDF export

const RC_KEY = 'rc_progress';

/**
 * Get reading comprehension stats for the parent portal.
 * @returns {object} stats
 */
export function getReadingStats() {
  const data = _load();
  const sessions = data.sessions || [];

  if (sessions.length === 0) {
    return {
      passagesCompleted: 0,
      averageScore: 0,
      averageReadingSpeed: 0,
      currentDifficulty: data.difficulty || 'intermediate',
      difficultyProgression: [],
      completedPassages: [],
      performanceTrend: []
    };
  }

  const avgScore = Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length);
  const speedSessions = sessions.filter(s => s.readingSpeed > 0);
  const avgSpeed = speedSessions.length
    ? Math.round(speedSessions.reduce((s, x) => s + x.readingSpeed, 0) / speedSessions.length)
    : 0;

  // Difficulty progression — unique difficulties in order of first appearance
  const seen = new Set();
  const difficultyProgression = sessions
    .map(s => s.difficulty)
    .filter(d => { if (seen.has(d)) return false; seen.add(d); return true; });

  // Completed passages list (last 20)
  const completedPassages = sessions.slice(-20).map(s => ({
    passageId: s.passageId,
    score: s.score,
    difficulty: s.difficulty,
    timestamp: s.timestamp
  }));

  // Performance trend — last 10 scores
  const performanceTrend = sessions.slice(-10).map(s => ({
    score: s.score,
    timestamp: s.timestamp
  }));

  return {
    passagesCompleted: sessions.length,
    averageScore: avgScore,
    averageReadingSpeed: avgSpeed,
    currentDifficulty: data.difficulty || 'intermediate',
    difficultyProgression,
    completedPassages,
    performanceTrend
  };
}

/**
 * Get reading stats formatted for PDF export.
 */
export function getReadingStatsForPDF() {
  const stats = getReadingStats();
  return {
    section: 'Reading Comprehension',
    passagesCompleted: stats.passagesCompleted,
    averageScore: `${stats.averageScore}%`,
    averageReadingSpeed: `${stats.averageReadingSpeed} wpm`,
    currentLevel: _capitalise(stats.currentDifficulty),
    recentPassages: stats.completedPassages.slice(-5).map(p => ({
      id: p.passageId,
      score: `${p.score}%`,
      level: _capitalise(p.difficulty),
      date: new Date(p.timestamp).toLocaleDateString()
    })),
    trend: stats.performanceTrend
  };
}

function _load() {
  try {
    const raw = localStorage.getItem(RC_KEY);
    return raw ? JSON.parse(raw) : { sessions: [], difficulty: 'intermediate' };
  } catch { return { sessions: [], difficulty: 'intermediate' }; }
}

function _capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
