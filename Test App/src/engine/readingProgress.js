// Reading Progress Tracker
// Records passage completions, calculates reading speed, manages adaptive difficulty

import { getProgress, updateProgress } from './progressStore.js';

const RC_KEY = 'rc_progress';

export class ReadingProgressTracker {
  _load() {
    try {
      const raw = localStorage.getItem(RC_KEY);
      return raw ? JSON.parse(raw) : { sessions: [], difficulty: 'intermediate' };
    } catch {
      return { sessions: [], difficulty: 'intermediate' };
    }
  }

  _save(data) {
    try {
      localStorage.setItem(RC_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('ReadingProgressTracker: could not save:', e);
    }
  }

  recordPassageCompletion(passageId, score, readingTime, attempts) {
    const rc = this._load();
    const session = {
      passageId,
      score,
      readingTime,
      attempts,
      timestamp: Date.now(),
      difficulty: rc.difficulty
    };
    rc.sessions.push(session);
    // Keep last 200 sessions
    if (rc.sessions.length > 200) rc.sessions = rc.sessions.slice(-200);
    this._save(rc);

    // Update main progress store with XP
    const xp = this.awardXP(score, rc.difficulty);
    const progress = getProgress();
    progress.xp = (progress.xp || 0) + xp;
    if (!progress.readingStats) progress.readingStats = { totalPassages: 0, totalXP: 0 };
    progress.readingStats.totalPassages = (progress.readingStats.totalPassages || 0) + 1;
    progress.readingStats.totalXP = (progress.readingStats.totalXP || 0) + xp;
    updateProgress(progress);

    return { session, xpAwarded: xp };
  }

  calculateReadingSpeed(wordCount, readingTimeMs) {
    if (!readingTimeMs || readingTimeMs <= 0) return 0;
    const minutes = readingTimeMs / 60000;
    return Math.round(wordCount / minutes);
  }

  updateAdaptiveDifficulty(score) {
    const rc = this._load();
    if (score > 80) {
      rc.difficulty = rc.difficulty === 'easy' ? 'intermediate' : 'hard';
    } else if (score < 50) {
      rc.difficulty = rc.difficulty === 'hard' ? 'intermediate' : 'easy';
    }
    this._save(rc);
    return rc.difficulty;
  }

  getCurrentDifficulty() {
    return this._load().difficulty;
  }

  getProgressStats() {
    const rc = this._load();
    const sessions = rc.sessions;
    if (sessions.length === 0) {
      return { totalPassages: 0, averageScore: 0, averageReadingSpeed: 0, difficultyProgression: rc.difficulty };
    }
    const avgScore = Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length);
    const avgSpeed = sessions.filter(s => s.readingSpeed).length > 0
      ? Math.round(sessions.filter(s => s.readingSpeed).reduce((s, x) => s + x.readingSpeed, 0) / sessions.filter(s => s.readingSpeed).length)
      : 0;
    return {
      totalPassages: sessions.length,
      averageScore: avgScore,
      averageReadingSpeed: avgSpeed,
      difficultyProgression: rc.difficulty,
      sessions
    };
  }

  awardXP(score, difficulty) {
    const baseXP = 50;
    const diffMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'intermediate' ? 1.2 : 1.0;
    const accMultiplier = score >= 90 ? 1.5 : score >= 70 ? 1.2 : score >= 50 ? 1.0 : 0.7;
    return Math.round(baseXP * diffMultiplier * accMultiplier);
  }
}

export default new ReadingProgressTracker();
