/**
 * Advanced Analytics Dashboard Service
 * 
 * Core service for managing dashboard metrics, calculations, and data retrieval.
 * Provides DashboardService class for comprehensive analytics functionality.
 * 
 * @module dashboardService
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Custom error for dashboard service operations
 */
class DashboardServiceError extends Error {
  constructor(message, code = 'DASHBOARD_SERVICE_ERROR') {
    super(message);
    this.name = 'DashboardServiceError';
    this.code = code;
  }
}

class DataNotFoundError extends DashboardServiceError {
  constructor(dataType) {
    super(`${dataType} data not found`, 'DATA_NOT_FOUND');
  }
}

class CalculationError extends DashboardServiceError {
  constructor(message) {
    super(message, 'CALCULATION_ERROR');
  }
}

// ============================================================================
// DATA MODEL INTERFACES (JSDoc)
// ============================================================================

/**
 * @typedef {Object} DashboardMetrics
 * @property {number} examReadinessScore - Exam readiness score (0-100)
 * @property {number} progressPercentage - Progress toward exam date (0-100)
 * @property {number} totalXP - Total XP earned
 * @property {string} currentRank - Current rank/level
 * @property {number} totalQuestionsCompleted - Total questions answered
 * @property {number} averageAccuracy - Average accuracy across all subjects (0-100)
 * @property {string} estimatedTimeToReadiness - Time until readiness achieved
 * @property {number} lastActivityDate - Last activity timestamp
 * @property {Object} subjectScores - Performance by subject
 * @property {number} subjectScores.maths - Maths accuracy (0-100)
 * @property {number} subjectScores.english - English accuracy (0-100)
 * @property {number} subjectScores.vr - Verbal Reasoning accuracy (0-100)
 * @property {number} subjectScores.nvr - Non-Verbal Reasoning accuracy (0-100)
 */

/**
 * @typedef {Object} PerformanceTrend
 * @property {number} date - Date timestamp
 * @property {string} subject - Subject name
 * @property {number} accuracy - Accuracy percentage (0-100)
 * @property {number} questionsCompleted - Questions completed on this date
 * @property {number} timeSpent - Time spent in milliseconds
 */

/**
 * @typedef {Object} Goal
 * @property {string} id - Unique goal identifier
 * @property {'accuracy'|'sessions'|'xp'} type - Goal type
 * @property {string} subject - Subject name or 'all'
 * @property {number} targetValue - Target value
 * @property {number} targetDate - Target date timestamp
 * @property {number} createdAt - Creation timestamp
 * @property {number} progress - Current progress value
 * @property {'active'|'achieved'|'abandoned'} status - Goal status
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - Unique alert identifier
 * @property {'performance_drop'|'milestone'|'inactivity'} type - Alert type
 * @property {'info'|'warning'|'success'} severity - Alert severity
 * @property {string} message - Alert message
 * @property {number} timestamp - Alert timestamp
 * @property {boolean} dismissed - Whether alert is dismissed
 * @property {string} [actionUrl] - Optional action URL
 */

/**
 * @typedef {Object} BenchmarkData
 * @property {number} studentPercentile - Student percentile (0-100)
 * @property {number} studentScore - Student's score (0-100)
 * @property {number} averageScore - Average score (0-100)
 * @property {number} topPerformerScore - Top performer score (0-100)
 * @property {number} comparisonGroupSize - Size of comparison group
 * @property {string} ageGroup - Age group
 * @property {string} schoolLevel - School level
 */

// ============================================================================
// DASHBOARD SERVICE CLASS
// ============================================================================

/**
 * Service for managing dashboard metrics and calculations
 */
class DashboardService {
  /**
   * @param {Object} progressStore - Progress store instance
   * @param {Object} adaptiveEngine - Adaptive engine instance
   */
  constructor(progressStore, adaptiveEngine) {
    this.progressStore = progressStore;
    this.adaptiveEngine = adaptiveEngine;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all dashboard metrics
   * @returns {Promise<DashboardMetrics>} Dashboard metrics
   * @throws {DashboardServiceError} If metrics cannot be calculated
   */
  async getDashboardMetrics() {
    try {
      const cacheKey = 'dashboard_metrics';
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const progress = this.progressStore.getProgress();
      if (!progress) {
        throw new DataNotFoundError('Progress');
      }

      const metrics = {
        examReadinessScore: this.calculateExamReadiness(progress),
        progressPercentage: this.calculateProgressPercentage(),
        totalXP: progress.xp || 0,
        currentRank: progress.rank || 'Beginner',
        totalQuestionsCompleted: this._countTotalQuestions(progress),
        averageAccuracy: this.calculateAverageAccuracy(progress),
        estimatedTimeToReadiness: this.estimateTimeToReadiness(progress),
        lastActivityDate: progress.lastActivityDate || Date.now(),
        subjectScores: this.calculateSubjectScores(progress)
      };

      this._setInCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      if (error instanceof DashboardServiceError) throw error;
      throw new DashboardServiceError(`Failed to get dashboard metrics: ${error.message}`);
    }
  }

  /**
   * Calculate exam readiness score (0-100)
   * @param {Object} progress - Progress data
   * @returns {number} Readiness score
   */
  calculateExamReadiness(progress) {
    try {
      const subjectScores = this.calculateSubjectScores(progress);
      
      // Equal weighting for all subjects (25% each)
      const weights = {
        maths: 0.25,
        english: 0.25,
        vr: 0.25,
        nvr: 0.25
      };

      let weightedSum = 0;
      for (const [subject, weight] of Object.entries(weights)) {
        weightedSum += (subjectScores[subject] || 0) * weight;
      }

      // Apply recency bias (70% recent, 30% historical)
      const recentPerformance = this._calculateRecentPerformance(progress);
      const historicalPerformance = weightedSum;
      const readiness = (recentPerformance * 0.7) + (historicalPerformance * 0.3);

      // Constrain to 0-100
      return Math.max(0, Math.min(100, Math.round(readiness)));
    } catch (error) {
      throw new CalculationError(`Failed to calculate exam readiness: ${error.message}`);
    }
  }

  /**
   * Calculate progress percentage toward exam date
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgressPercentage() {
    const examDate = new Date('2026-09-15').getTime();
    const startDate = new Date('2024-01-01').getTime();
    const now = Date.now();

    if (now >= examDate) return 100;
    if (now <= startDate) return 0;

    const totalTime = examDate - startDate;
    const elapsedTime = now - startDate;
    return Math.round((elapsedTime / totalTime) * 100);
  }

  /**
   * Calculate average accuracy across all subjects
   * @param {Object} progress - Progress data
   * @returns {number} Average accuracy (0-100)
   */
  calculateAverageAccuracy(progress) {
    const subjectScores = this.calculateSubjectScores(progress);
    const scores = Object.values(subjectScores);
    
    if (scores.length === 0) return 0;
    
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  }

  /**
   * Calculate subject scores
   * @param {Object} progress - Progress data
   * @returns {Object} Subject scores
   */
  calculateSubjectScores(progress) {
    const subjects = ['maths', 'english', 'vr', 'nvr'];
    const scores = {};

    for (const subject of subjects) {
      const subjectData = progress.subjects?.[subject];
      if (subjectData && subjectData.totalQuestions > 0) {
        scores[subject] = Math.round(
          (subjectData.correctQuestions / subjectData.totalQuestions) * 100
        );
      } else {
        scores[subject] = 0;
      }
    }

    return scores;
  }

  /**
   * Estimate time to readiness
   * @param {Object} progress - Progress data
   * @returns {string} Estimated time (e.g., "3 weeks")
   */
  estimateTimeToReadiness(progress) {
    const currentReadiness = this.calculateExamReadiness(progress);
    const targetReadiness = 80;

    if (currentReadiness >= targetReadiness) {
      return 'Ready!';
    }

    // Simple linear projection
    const improvementNeeded = targetReadiness - currentReadiness;
    const recentTrend = this._calculateRecentTrend(progress);
    
    if (recentTrend <= 0) {
      return 'Unknown';
    }

    const weeksNeeded = Math.ceil(improvementNeeded / recentTrend);
    
    if (weeksNeeded <= 0) return 'Ready!';
    if (weeksNeeded === 1) return '1 week';
    if (weeksNeeded <= 4) return `${weeksNeeded} weeks`;
    
    const months = Math.ceil(weeksNeeded / 4);
    return months === 1 ? '1 month' : `${months} months`;
  }

  /**
   * Get performance trends
   * @param {number} [days=30] - Number of days to retrieve
   * @returns {Promise<PerformanceTrend[]>} Performance trends
   */
  async getPerformanceTrends(days = 30) {
    try {
      const progress = this.progressStore.getProgress();
      if (!progress || !progress.sessions) {
        return [];
      }

      const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
      const trends = [];

      for (const session of progress.sessions) {
        if (session.date >= cutoffDate) {
          trends.push({
            date: session.date,
            subject: session.subject,
            accuracy: session.score || 0,
            questionsCompleted: session.questionsCompleted || 1,
            timeSpent: session.timeSpent || 0
          });
        }
      }

      return trends.sort((a, b) => a.date - b.date);
    } catch (error) {
      throw new DashboardServiceError(`Failed to get performance trends: ${error.message}`);
    }
  }

  /**
   * Get benchmark comparison data
   * @returns {Promise<BenchmarkData>} Benchmark data
   */
  async getBenchmarkComparison() {
    try {
      const progress = this.progressStore.getProgress();
      const accuracy = this.calculateAverageAccuracy(progress);

      // Simulated benchmark data (would come from Firebase in production)
      return {
        studentPercentile: Math.min(100, Math.round(accuracy * 1.2)),
        studentScore: accuracy,
        averageScore: Math.max(0, accuracy - 10),
        topPerformerScore: 95,
        comparisonGroupSize: 1000,
        ageGroup: '9-12',
        schoolLevel: 'Primary'
      };
    } catch (error) {
      throw new DashboardServiceError(`Failed to get benchmark data: ${error.message}`);
    }
  }

  /**
   * Create a goal
   * @param {Object} goalData - Goal data
   * @returns {Goal} Created goal
   */
  createGoal(goalData) {
    try {
      const goal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: goalData.type || 'accuracy',
        subject: goalData.subject || 'all',
        targetValue: goalData.targetValue || 80,
        targetDate: goalData.targetDate || Date.now() + (30 * 24 * 60 * 60 * 1000),
        createdAt: Date.now(),
        progress: 0,
        status: 'active'
      };

      const progress = this.progressStore.getProgress();
      if (!progress.goals) {
        progress.goals = [];
      }
      progress.goals.push(goal);
      this.progressStore.updateProgress(progress);

      return goal;
    } catch (error) {
      throw new DashboardServiceError(`Failed to create goal: ${error.message}`);
    }
  }

  /**
   * Update goal progress
   * @param {string} goalId - Goal ID
   * @param {number} progress - Progress value
   */
  updateGoalProgress(goalId, progress) {
    try {
      const progressData = this.progressStore.getProgress();
      const goal = progressData.goals?.find(g => g.id === goalId);

      if (!goal) {
        throw new DataNotFoundError('Goal');
      }

      goal.progress = Math.min(goal.targetValue, progress);
      
      if (goal.progress >= goal.targetValue) {
        goal.status = 'achieved';
      }

      this.progressStore.updateProgress(progressData);
    } catch (error) {
      throw new DashboardServiceError(`Failed to update goal progress: ${error.message}`);
    }
  }

  /**
   * Get alerts
   * @returns {Alert[]} Array of alerts
   */
  getAlerts() {
    try {
      const progress = this.progressStore.getProgress();
      return progress.alerts || [];
    } catch (error) {
      throw new DashboardServiceError(`Failed to get alerts: ${error.message}`);
    }
  }

  /**
   * Dismiss an alert
   * @param {string} alertId - Alert ID
   */
  dismissAlert(alertId) {
    try {
      const progress = this.progressStore.getProgress();
      const alert = progress.alerts?.find(a => a.id === alertId);

      if (alert) {
        alert.dismissed = true;
        this.progressStore.updateProgress(progress);
      }
    } catch (error) {
      throw new DashboardServiceError(`Failed to dismiss alert: ${error.message}`);
    }
  }

  /**
   * Calculate recent performance (last 7 days)
   * @private
   * @param {Object} progress - Progress data
   * @returns {number} Recent performance score
   */
  _calculateRecentPerformance(progress) {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSessions = progress.sessions?.filter(s => s.date >= sevenDaysAgo) || [];

    if (recentSessions.length === 0) {
      return this.calculateAverageAccuracy(progress);
    }

    const sum = recentSessions.reduce((acc, s) => acc + (s.score || 0), 0);
    return Math.round(sum / recentSessions.length);
  }

  /**
   * Calculate recent trend (improvement per week)
   * @private
   * @param {Object} progress - Progress data
   * @returns {number} Trend value
   */
  _calculateRecentTrend(progress) {
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const recentSessions = progress.sessions?.filter(s => s.date >= fourteenDaysAgo) || [];

    if (recentSessions.length < 2) {
      return 0;
    }

    const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
    const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));

    const firstAvg = firstHalf.reduce((a, s) => a + (s.score || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, s) => a + (s.score || 0), 0) / secondHalf.length;

    return secondAvg - firstAvg;
  }

  /**
   * Count total questions completed
   * @private
   * @param {Object} progress - Progress data
   * @returns {number} Total questions
   */
  _countTotalQuestions(progress) {
    return progress.subjects?.maths?.totalQuestions || 0 +
           progress.subjects?.english?.totalQuestions || 0 +
           progress.subjects?.vr?.totalQuestions || 0 +
           progress.subjects?.nvr?.totalQuestions || 0;
  }

  /**
   * Get from cache
   * @private
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set in cache
   * @private
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  _setInCache(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.cacheExpiry
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DashboardService,
  DashboardServiceError,
  DataNotFoundError,
  CalculationError
};
