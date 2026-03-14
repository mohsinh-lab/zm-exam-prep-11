/**
 * HighlightSync - Synchronizes visual highlighting with audio playback at word level
 * 
 * Responsibility: Parse passage into words, map character positions to word indices,
 * and update visual highlighting in real-time with <50ms latency.
 */

export class HighlightSync {
  /**
   * Initialize HighlightSync with a passage element
   * @param {HTMLElement} passageElement - DOM element containing the passage text
   */
  constructor(passageElement) {
    this.passageElement = passageElement;
    this.words = [];
    this.wordElements = [];
    this.currentWordIndex = -1;
    this.wordBoundaries = [];
    this.highlightClass = 'voice-highlight';
  }

  /**
   * Parse passage into words and create word-level DOM structure
   * @param {string} passage - The passage text to parse
   * @returns {Array<HTMLElement>} Array of word elements
   */
  initialize(passage) {
    if (!passage || passage.trim().length === 0) {
      this.words = [];
      this.wordElements = [];
      this.wordBoundaries = [];
      return [];
    }

    // Clear existing content
    this.passageElement.innerHTML = '';
    this.words = [];
    this.wordElements = [];
    this.wordBoundaries = [];

    // Split passage into words while preserving punctuation
    const wordRegex = /\S+/g;
    let match;
    let charIndex = 0;

    while ((match = wordRegex.exec(passage)) !== null) {
      const word = match[0];
      const wordCharIndex = match.index;

      // Store word boundary information
      this.wordBoundaries.push(wordCharIndex);
      this.words.push(word);

      // Create span element for word
      const span = document.createElement('span');
      span.className = 'word';
      span.setAttribute('data-word-index', this.words.length - 1);
      span.textContent = word;

      this.wordElements.push(span);
      this.passageElement.appendChild(span);

      // Add space after word (except for last word)
      if (wordRegex.lastIndex < passage.length) {
        const spaceSpan = document.createElement('span');
        spaceSpan.textContent = ' ';
        this.passageElement.appendChild(spaceSpan);
      }
    }

    return this.wordElements;
  }

  /**
   * Get character position boundaries for each word
   * Used for mapping Web Speech API boundary events to word indices
   * @returns {Array<number>} Array of character positions for word boundaries
   */
  getWordBoundaries() {
    return [...this.wordBoundaries];
  }

  /**
   * Update highlight to the specified word index
   * Removes previous highlight and adds new highlight with <50ms latency
   * @param {number} wordIndex - Index of the word to highlight
   */
  updateHighlight(wordIndex) {
    // Validate word index
    if (wordIndex < 0 || wordIndex >= this.wordElements.length) {
      return;
    }

    // Remove previous highlight
    if (this.currentWordIndex >= 0 && this.currentWordIndex < this.wordElements.length) {
      this.wordElements[this.currentWordIndex].classList.remove(this.highlightClass);
    }

    // Add new highlight
    this.wordElements[wordIndex].classList.add(this.highlightClass);
    this.currentWordIndex = wordIndex;
  }

  /**
   * Remove all highlighting from the passage
   */
  clearHighlight() {
    if (this.currentWordIndex >= 0 && this.currentWordIndex < this.wordElements.length) {
      this.wordElements[this.currentWordIndex].classList.remove(this.highlightClass);
    }
    this.currentWordIndex = -1;
  }

  /**
   * Get the current highlighted word index
   * @returns {number} Current word index or -1 if no highlight
   */
  getCurrentWordIndex() {
    return this.currentWordIndex;
  }

  /**
   * Get total number of words in the passage
   * @returns {number} Total word count
   */
  getWordCount() {
    return this.words.length;
  }

  /**
   * Clean up DOM modifications and remove event listeners
   */
  destroy() {
    this.clearHighlight();
    this.passageElement.innerHTML = '';
    this.words = [];
    this.wordElements = [];
    this.wordBoundaries = [];
    this.currentWordIndex = -1;
  }
}
