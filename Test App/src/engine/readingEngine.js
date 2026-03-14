// Reading Comprehension Engine
// Manages passages, questions, highlights, and reading sessions

// Custom Error Types
export class PassageNotFoundError extends Error {
  constructor(passageId) {
    super(`Passage not found: ${passageId}`);
    this.name = 'PassageNotFoundError';
    this.passageId = passageId;
  }
}

export class PassageValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'PassageValidationError';
    this.errors = errors;
  }
}

export class QuestionLoadError extends Error {
  constructor(passageId) {
    super(`Failed to load questions for passage: ${passageId}`);
    this.name = 'QuestionLoadError';
    this.passageId = passageId;
  }
}

// PassageManager
export class PassageManager {
  constructor(passages = [], adaptiveEngine = null) {
    this.passages = passages;
    this.adaptiveEngine = adaptiveEngine;
    this.currentIndex = 0;
  }

  async loadPassage(passageId) {
    const passage = this.passages.find(p => p.id === passageId);
    if (!passage) throw new PassageNotFoundError(passageId);
    const validation = this.validatePassage(passage);
    if (!validation.isValid) throw new PassageValidationError('Invalid passage', validation.errors);
    return { ...passage, estimatedReadingTime: this.getEstimatedReadingTime(passage) };
  }

  async getNextPassage() {
    const idx = this.currentIndex + 1;
    if (idx >= this.passages.length) return null;
    this.currentIndex = idx;
    return this.loadPassage(this.passages[idx].id);
  }

  async getPreviousPassage() {
    const idx = this.currentIndex - 1;
    if (idx < 0) return null;
    this.currentIndex = idx;
    return this.loadPassage(this.passages[idx].id);
  }

  setCurrentIndex(passageId) {
    const idx = this.passages.findIndex(p => p.id === passageId);
    if (idx !== -1) this.currentIndex = idx;
  }

  validatePassage(passage) {
    const errors = [];
    if (!passage.id) errors.push('Missing id');
    if (!passage.text || passage.text.trim().length === 0) errors.push('Missing text');
    if (!passage.title) errors.push('Missing title');
    if (!['easy', 'intermediate', 'hard'].includes(passage.difficulty)) errors.push('Invalid difficulty');
    if (!passage.subject) errors.push('Missing subject');
    const wordCount = passage.text ? passage.text.trim().split(/\s+/).length : 0;
    if (wordCount < 100) errors.push(`Text too short: ${wordCount} words (minimum 100)`);
    return { isValid: errors.length === 0, errors };
  }

  getEstimatedReadingTime(passage, wpm = 200) {
    const wordCount = passage.wordCount || (passage.text ? passage.text.trim().split(/\s+/).length : 0);
    return Math.ceil((wordCount / wpm) * 10) / 10;
  }
}

// QuestionHandler
export class QuestionHandler {
  constructor(questions = []) {
    this.questions = questions;
    this.attempts = [];
  }

  async loadQuestions(passageId) {
    const qs = this.questions.filter(q => q.passageId === passageId);
    if (qs.length === 0) throw new QuestionLoadError(passageId);
    return qs.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  validateAnswer(question, answer) {
    let isCorrect = false;
    const explanation = question.explanation || '';

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      isCorrect = answer === question.correctAnswer;
    } else if (question.type === 'short_answer') {
      const expected = question.expectedAnswers || [question.correctAnswer];
      isCorrect = expected.some(exp => this._fuzzyMatch(answer, exp) >= 0.7);
    }

    const feedback = isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${question.correctAnswer || (question.expectedAnswers || [])[0]}`;
    return { isCorrect, feedback, explanation };
  }

  _fuzzyMatch(a, b) {
    if (!a || !b) return 0;
    const s1 = a.toLowerCase().trim();
    const s2 = b.toLowerCase().trim();
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.85;
    const set1 = new Set(s1.split(''));
    const set2 = new Set(s2.split(''));
    const intersection = [...set1].filter(c => set2.has(c)).length;
    return intersection / Math.max(set1.size, set2.size);
  }

  calculateScore(answers) {
    const total = answers.length;
    if (total === 0) return { score: 0, correctCount: 0, totalCount: 0 };
    const correctCount = answers.filter(a => a.isCorrect).length;
    return { score: Math.round((correctCount / total) * 100), correctCount, totalCount: total };
  }

  recordAttempt(question, answer, responseTime) {
    const validation = this.validateAnswer(question, answer);
    const attempt = {
      questionId: question.id,
      passageId: question.passageId,
      answer,
      isCorrect: validation.isCorrect,
      responseTime,
      timestamp: Date.now(),
      attemptNumber: this.attempts.filter(a => a.questionId === question.id).length + 1
    };
    this.attempts.push(attempt);
    return attempt;
  }

  getHints(question) {
    if (question.hint) return question.hint;
    if (question.type === 'multiple_choice') return 'Re-read the relevant section of the passage carefully.';
    if (question.type === 'true_false') return 'Look for specific evidence in the passage.';
    return 'Use your own words and refer back to the passage.';
  }
}

// HighlightManager
export class HighlightManager {
  constructor(passageId) {
    this.passageId = passageId;
    this.storageKey = `rc_highlights_${passageId}`;
    this.userHighlights = this.loadHighlights();
    this.voiceHighlight = null;
  }

  saveHighlight(startPos, endPos, text, color = '#FFD700') {
    const highlight = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      passageId: this.passageId,
      startPos,
      endPos,
      text,
      color,
      timestamp: Date.now()
    };
    this.userHighlights.push(highlight);
    this._persist();
    return highlight;
  }

  loadHighlights() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  removeHighlight(highlightId) {
    this.userHighlights = this.userHighlights.filter(h => h.id !== highlightId);
    this._persist();
  }

  updateVoiceHighlight(wordIndex) {
    this.voiceHighlight = wordIndex;
  }

  clearVoiceHighlight() {
    this.voiceHighlight = null;
  }

  _persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userHighlights));
    } catch (e) {
      console.warn('Could not save highlights:', e);
    }
  }
}
