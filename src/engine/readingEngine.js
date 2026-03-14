/**
 * Reading Comprehension Engine
 * 
 * Core module for managing reading comprehension passages, questions, and user interactions.
 * Provides PassageManager, QuestionHandler, and HighlightManager classes for comprehensive
 * reading comprehension functionality.
 * 
 * @module readingEngine
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Custom error for reading engine operations
 */
class ReadingEngineError extends Error {
  constructor(message, code = 'READING_ENGINE_ERROR') {
    super(message);
    this.name = 'ReadingEngineError';
    this.code = code;
  }
}

class PassageNotFoundError extends ReadingEngineError {
  constructor(passageId) {
    super(`Passage not found: ${passageId}`, 'PASSAGE_NOT_FOUND');
  }
}

class QuestionNotFoundError extends ReadingEngineError {
  constructor(questionId) {
    super(`Question not found: ${questionId}`, 'QUESTION_NOT_FOUND');
  }
}

class ValidationError extends ReadingEngineError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR');
  }
}

// ============================================================================
// DATA MODEL INTERFACES (JSDoc)
// ============================================================================

/**
 * @typedef {Object} Passage
 * @property {string} id - Unique passage identifier
 * @property {string} text - Full passage text (150-400 words)
 * @property {string} title - Passage title
 * @property {string} subject - Subject area (English, Maths, VR, NVR)
 * @property {'easy'|'medium'|'hard'} difficulty - Difficulty level
 * @property {string} language - Language code (en, ur)
 * @property {number} wordCount - Total words in passage
 * @property {number} estimatedReadingTime - Reading time in minutes
 * @property {number} version - Content version number
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Question
 * @property {string} id - Unique question identifier
 * @property {string} passageId - Associated passage ID
 * @property {'multiple_choice'|'true_false'|'short_answer'} type - Question type
 * @property {string} text - Question text
 * @property {string[]} [options] - Answer options (for multiple choice)
 * @property {string} correctAnswer - Correct answer
 * @property {string[]} [expectedAnswers] - Expected answers for short answer (fuzzy match)
 * @property {string} explanation - Explanation of correct answer
 * @property {'easy'|'medium'|'hard'} difficulty - Question difficulty
 * @property {number} order - Question order in passage
 */

/**
 * @typedef {Object} Attempt
 * @property {string} questionId - Question ID
 * @property {string} passageId - Passage ID
 * @property {string} answer - Student's answer
 * @property {boolean} isCorrect - Whether answer is correct
 * @property {number} responseTime - Response time in milliseconds
 * @property {number} timestamp - Attempt timestamp
 * @property {number} attemptNumber - Attempt count for this question
 */

/**
 * @typedef {Object} Highlight
 * @property {string} id - Unique highlight identifier
 * @property {string} passageId - Associated passage ID
 * @property {number} startPos - Start position in text
 * @property {number} endPos - End position in text
 * @property {string} text - Highlighted text
 * @property {number} timestamp - Creation timestamp
 * @property {string} color - Highlight color (hex)
 */

/**
 * @typedef {Object} ReadingSession
 * @property {string} sessionId - Unique session identifier
 * @property {string} passageId - Passage ID
 * @property {number} startTime - Session start timestamp
 * @property {number} endTime - Session end timestamp
 * @property {number} readingTime - Total reading time in milliseconds
 * @property {number} score - Comprehension score (0-100)
 * @property {Attempt[]} attempts - Array of attempts
 * @property {'easy'|'medium'|'hard'} difficulty - Passage difficulty
 * @property {number} xpEarned - XP awarded
 * @property {boolean} voiceTutorUsed - Whether Voice Tutor was used
 * @property {number} highlightsCreated - Number of highlights created
 */

// ============================================================================
// PASSAGE MANAGER CLASS
// ============================================================================

/**
 * Manages passage loading, validation, and navigation
 */
class PassageManager {
  /**
   * @param {Object} questionBank - Question bank instance
   * @param {Object} adaptiveEngine - Adaptive engine instance
   */
  constructor(questionBank, adaptiveEngine) {
    this.questionBank = questionBank;
    this.adaptiveEngine = adaptiveEngine;
    this.currentPassageIndex = 0;
    this.passages = [];
  }

  /**
   * Load a passage by ID
   * @param {string} passageId - Passage ID to load
   * @returns {Promise<Passage>} Loaded passage object
   * @throws {PassageNotFoundError} If passage not found
   */
  async loadPassage(passageId) {
    try {
      const passage = await this.questionBank.getPassage(passageId);
      if (!passage) {
        throw new PassageNotFoundError(passageId);
      }
      return passage;
    } catch (error) {
      if (error instanceof PassageNotFoundError) throw error;
      throw new ReadingEngineError(`Failed to load passage: ${error.message}`);
    }
  }

  /**
   * Get next passage based on adaptive difficulty
   * @returns {Promise<Passage|null>} Next passage or null if at end
   */
  async getNextPassage() {
    try {
      const nextPassage = await this.questionBank.getNextPassage(
        this.currentPassageIndex + 1
      );
      if (nextPassage) {
        this.currentPassageIndex += 1;
      }
      return nextPassage;
    } catch (error) {
      throw new ReadingEngineError(`Failed to get next passage: ${error.message}`);
    }
  }

  /**
   * Get previous passage
   * @returns {Promise<Passage|null>} Previous passage or null if at start
   */
  async getPreviousPassage() {
    try {
      if (this.currentPassageIndex === 0) {
        return null;
      }
      const prevPassage = await this.questionBank.getPassage(
        this.currentPassageIndex - 1
      );
      if (prevPassage) {
        this.currentPassageIndex -= 1;
      }
      return prevPassage;
    } catch (error) {
      throw new ReadingEngineError(`Failed to get previous passage: ${error.message}`);
    }
  }

  /**
   * Validate passage structure and content
   * @param {Passage} passage - Passage to validate
   * @returns {{isValid: boolean, errors: string[]}} Validation result
   */
  validatePassage(passage) {
    const errors = [];

    if (!passage.id) errors.push('Passage ID is required');
    if (!passage.text || passage.text.trim().length === 0) {
      errors.push('Passage text is required');
    }
    if (!passage.title || passage.title.trim().length === 0) {
      errors.push('Passage title is required');
    }
    if (!['easy', 'medium', 'hard'].includes(passage.difficulty)) {
      errors.push('Invalid difficulty level');
    }

    // Check minimum word count (100 words)
    const wordCount = passage.text.split(/\s+/).length;
    if (wordCount < 100) {
      errors.push(`Passage must have at least 100 words (current: ${wordCount})`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate estimated reading time
   * @param {Passage} passage - Passage to calculate for
   * @param {number} [readingSpeed=200] - Words per minute
   * @returns {number} Estimated reading time in minutes
   */
  getEstimatedReadingTime(passage, readingSpeed = 200) {
    if (!passage.wordCount || readingSpeed <= 0) {
      return 0;
    }
    return Math.ceil(passage.wordCount / readingSpeed * 10) / 10;
  }
}

// ============================================================================
// QUESTION HANDLER CLASS
// ============================================================================

/**
 * Manages question loading, validation, and scoring
 */
class QuestionHandler {
  /**
   * @param {Object} questionBank - Question bank instance
   */
  constructor(questionBank) {
    this.questionBank = questionBank;
    this.questions = [];
    this.attempts = [];
  }

  /**
   * Load questions for a passage
   * @param {string} passageId - Passage ID
   * @returns {Promise<Question[]>} Array of questions
   * @throws {ReadingEngineError} If questions cannot be loaded
   */
  async loadQuestions(passageId) {
    try {
      const questions = await this.questionBank.getQuestionsByPassage(passageId);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new ReadingEngineError(`No questions found for passage: ${passageId}`);
      }
      this.questions = questions;
      return questions;
    } catch (error) {
      throw new ReadingEngineError(`Failed to load questions: ${error.message}`);
    }
  }

  /**
   * Validate answer based on question type
   * @param {Question} question - Question object
   * @param {string} answer - Student's answer
   * @returns {{isCorrect: boolean, feedback: string, explanation: string}} Validation result
   */
  validateAnswer(question, answer) {
    if (!question || !answer) {
      return {
        isCorrect: false,
        feedback: 'Invalid input',
        explanation: ''
      };
    }

    let isCorrect = false;
    let feedback = '';

    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();
        feedback = isCorrect ? 'Correct!' : 'Incorrect';
        break;

      case 'short_answer':
        isCorrect = this._fuzzyMatchAnswer(answer, question.expectedAnswers);
        feedback = isCorrect ? 'Correct!' : 'Not quite right';
        break;

      default:
        throw new ValidationError(`Unknown question type: ${question.type}`);
    }

    return {
      isCorrect,
      feedback,
      explanation: question.explanation || ''
    };
  }

  /**
   * Fuzzy match short answer (similarity threshold: 0.7)
   * @private
   * @param {string} answer - Student's answer
   * @param {string[]} expectedAnswers - Expected answers
   * @returns {boolean} Whether answer matches
   */
  _fuzzyMatchAnswer(answer, expectedAnswers) {
    if (!Array.isArray(expectedAnswers) || expectedAnswers.length === 0) {
      return false;
    }

    const normalizedAnswer = answer.toLowerCase().trim();
    const threshold = 0.7;

    return expectedAnswers.some(expected => {
      const normalizedExpected = expected.toLowerCase().trim();
      const similarity = this._calculateSimilarity(normalizedAnswer, normalizedExpected);
      return similarity >= threshold;
    });
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   * @private
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  _calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this._levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   * @private
   * @param {string} s1 - First string
   * @param {string} s2 - Second string
   * @returns {number} Edit distance
   */
  _levenshteinDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Calculate comprehension score
   * @param {Attempt[]} answers - Array of attempts
   * @returns {{score: number, correctCount: number, totalCount: number}} Score result
   */
  calculateScore(answers) {
    if (!Array.isArray(answers) || answers.length === 0) {
      return { score: 0, correctCount: 0, totalCount: 0 };
    }

    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalCount = answers.length;
    const score = Math.round((correctCount / totalCount) * 100);

    return { score, correctCount, totalCount };
  }

  /**
   * Record an attempt
   * @param {Question} question - Question object
   * @param {string} answer - Student's answer
   * @param {number} responseTime - Response time in milliseconds
   * @returns {Attempt} Recorded attempt
   */
  recordAttempt(question, answer, responseTime) {
    const attempt = {
      questionId: question.id,
      passageId: question.passageId,
      answer,
      isCorrect: this.validateAnswer(question, answer).isCorrect,
      responseTime,
      timestamp: Date.now(),
      attemptNumber: this.attempts.filter(a => a.questionId === question.id).length + 1
    };

    this.attempts.push(attempt);
    return attempt;
  }

  /**
   * Get hints for a question
   * @param {Question} question - Question object
   * @returns {string} Hint text
   */
  getHints(question) {
    if (!question) return '';

    // Return first sentence of explanation as hint
    const sentences = question.explanation.split(/[.!?]+/);
    return sentences[0] ? sentences[0].trim() : 'Try reading the passage more carefully.';
  }
}

// ============================================================================
// HIGHLIGHT MANAGER CLASS
// ============================================================================

/**
 * Manages user highlights and Voice Tutor highlighting
 */
class HighlightManager {
  /**
   * @param {string} passageId - Passage ID
   */
  constructor(passageId) {
    this.passageId = passageId;
    this.userHighlights = [];
    this.voiceHighlight = null;
    this.storageKey = `rc_highlights_${passageId}`;
  }

  /**
   * Save a user highlight
   * @param {number} startPos - Start position in text
   * @param {number} endPos - End position in text
   * @param {string} text - Highlighted text
   * @param {string} [color='#FFD700'] - Highlight color
   * @returns {Highlight} Saved highlight
   */
  saveHighlight(startPos, endPos, text, color = '#FFD700') {
    const highlight = {
      id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      passageId: this.passageId,
      startPos,
      endPos,
      text,
      timestamp: Date.now(),
      color
    };

    this.userHighlights.push(highlight);
    this._persistHighlights();
    return highlight;
  }

  /**
   * Load highlights from localStorage
   * @returns {Highlight[]} Array of highlights
   */
  loadHighlights() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.userHighlights = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load highlights:', error);
      this.userHighlights = [];
    }
    return this.userHighlights;
  }

  /**
   * Remove a highlight
   * @param {string} highlightId - Highlight ID to remove
   */
  removeHighlight(highlightId) {
    this.userHighlights = this.userHighlights.filter(h => h.id !== highlightId);
    this._persistHighlights();
  }

  /**
   * Update Voice Tutor highlighting
   * @param {number} wordIndex - Word index being read
   */
  updateVoiceHighlight(wordIndex) {
    this.voiceHighlight = {
      wordIndex,
      timestamp: Date.now()
    };
  }

  /**
   * Clear Voice Tutor highlighting
   */
  clearVoiceHighlight() {
    this.voiceHighlight = null;
  }

  /**
   * Persist highlights to localStorage
   * @private
   */
  _persistHighlights() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userHighlights));
    } catch (error) {
      console.error('Failed to persist highlights:', error);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PassageManager,
  QuestionHandler,
  HighlightManager,
  ReadingEngineError,
  PassageNotFoundError,
  QuestionNotFoundError,
  ValidationError
};
