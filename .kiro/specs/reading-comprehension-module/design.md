oad passages within 300ms and provide feedback within 200ms
5. **Accessibility**: Full WCAG 2.1 Level AA compliance with keyboard navigation and screen reader support
6. **Offline Capability**: Cache passages and questions for uninterrupted learning without internet
7. **Cross-Device Sync**: Persist progress to Firebase for seamless learning across devices

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                  Reading Comprehension Module                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Passage Display Component                        │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Passage Text with User & Voice Highlighting      │  │   │
│  │  │  • User highlights (persistent)                   │  │   │
│  │  │  • Voice Tutor highlights (real-time sync)        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Voice Tutor Control Panel (integrated)           │  │   │
│  │  │  [Play] [Pause] [Stop] [Speed: 1x] [Settings]    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Question Display Component                       │   │
│  │  • Multiple Choice (4-5 options)                         │   │
│  │  • True/False (2 options)                               │   │
│  │  • Short Answer (text input with fuzzy matching)        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Navigation Component                            │   │
│  │  [Previous Passage] [Progress] [Next Passage]          │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
                            ▲
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Adaptive Engine  │ │ Progress Store   │ │ Voice Engine     │
│                  │ │                  │ │                  │
│ • Difficulty     │ │ • Passage data   │ │ • Web Speech API │
│   adjustment     │ │ • Scores         │ │ • Highlighting  │
│ • ELO-based      │ │ • Reading time   │ │ • Speed control  │
│   scoring        │ │ • Attempts       │ │ • Offline audio  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Question Bank    │ │ Cloud Sync       │ │ Passage Cache    │
│                  │ │ (Firebase)       │ │ (localStorage)   │
│ • Passages       │ │                  │ │                  │
│ • Questions      │ │ • Progress sync  │ │ • Offline access │
│ • Metadata       │ │ • Cross-device   │ │ • LRU eviction   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Component Architecture

```
src/features/student/ReadingComprehension.js
├── renderReadingComprehension(params)
├── mountReadingComprehension()
└── [Internal state management]

src/engine/readingEngine.js
├── PassageManager class
│   ├── loadPassage(passageId)
│   ├── getNextPassage()
│   ├── getPreviousPassage()
│   └── validatePassage(passage)
│
├── QuestionHandler class
│   ├── loadQuestions(passageId)
│   ├── validateAnswer(question, answer)
│   ├── calculateScore(answers)
│   └── recordAttempt(question, answer, responseTime)
│
└── HighlightManager class
    ├── saveHighlight(passageId, startPos, endPos)
    ├── loadHighlights(passageId)
    ├── removeHighlight(highlightId)
    └── distinguishVoiceHighlight(wordIndex)

src/engine/passageCache.js
├── PassageCache class
│   ├── get(passageId)
│   ├── set(passageId, passage)
│   ├── clear()
│   ├── getSize()
│   └── evictLRU()

src/engine/readingProgress.js
├── recordPassageCompletion(passageId, score, readingTime, attempts)
├── calculateReadingSpeed(passageLength, readingTime)
├── updateAdaptiveDifficulty(performance)
└── getProgressStats()
```

---

## Components and Interfaces

### 1. Reading Comprehension Component (`src/features/student/ReadingComprehension.js`)

**Responsibility**: Orchestrate the reading comprehension UI and coordinate all sub-systems.

```javascript
// State structure
const readingState = {
  currentPassage: null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  highlights: [],
  readingStartTime: null,
  readingEndTime: null,
  difficulty: 'medium',
  isVoiceTutorActive: false,
  userPreferences: {
    fontSize: 16,
    lineSpacing: 1.5,
    backgroundColor: 'light',
    voiceTutorEnabled: true,
    voiceTutorSpeed: 1
  },
  error: null
};

export function renderReadingComprehension(params) {
  // Returns HTML string with:
  // - Passage display area
  // - Voice Tutor controls (integrated)
  // - Question display area
  // - Navigation controls
  // - Accessibility features (ARIA labels, live regions)
}

export function mountReadingComprehension() {
  // Initializes reading engine
  // Loads passage and questions
  // Attaches event listeners
  // Restores user preferences
  // Sets up offline detection
}
```

### 2. Passage Manager (`src/engine/readingEngine.js`)

**Responsibility**: Manage passage loading, validation, and navigation.

```javascript
class PassageManager {
  constructor(questionBank, adaptiveEngine) {
    this.questionBank = questionBank;
    this.adaptiveEngine = adaptiveEngine;
    this.currentPassageIndex = 0;
    this.passages = [];
  }

  async loadPassage(passageId) {
    // Loads passage from question bank or cache
    // Returns: { id, text, title, difficulty, subject, estimatedReadingTime }
    // Performance: <300ms
  }

  async getNextPassage() {
    // Gets next passage based on adaptive difficulty
    // Returns: Passage object
  }

  async getPreviousPassage() {
    // Gets previous passage
    // Returns: Passage object or null if first passage
  }

  validatePassage(passage) {
    // Validates passage structure and content
    // Returns: { isValid: boolean, errors: string[] }
    // Checks: text length >= 100 words, title present, difficulty valid
  }

  getEstimatedReadingTime(passage, readingSpeed = 200) {
    // Calculates estimated reading time in minutes
    // Default: 200 words per minute
    // Returns: number (minutes)
  }
}
```

### 3. Question Handler (`src/engine/readingEngine.js`)

**Responsibility**: Manage question loading, validation, and scoring.

```javascript
class QuestionHandler {
  constructor(questionBank) {
    this.questionBank = questionBank;
    this.questions = [];
    this.attempts = [];
  }

  async loadQuestions(passageId) {
    // Loads questions for passage
    // Returns: Array of question objects
    // Validates all questions are present and properly formatted
  }

  validateAnswer(question, answer) {
    // Validates answer based on question type
    // Returns: { isCorrect: boolean, feedback: string, explanation: string }
    // For short answer: uses fuzzy matching with similarity threshold
  }

  calculateScore(answers) {
    // Calculates comprehension score
    // Returns: { score: number (0-100), correctCount: number, totalCount: number }
  }

  recordAttempt(question, answer, responseTime) {
    // Records attempt with metadata
    // Stores: { questionId, answer, responseTime, timestamp, isCorrect }
  }

  getHints(question) {
    // Provides hints for incorrect answers
    // Returns: string (hint text without giving away answer)
  }
}
```

### 4. Highlight Manager (`src/engine/readingEngine.js`)

**Responsibility**: Manage user highlights and distinguish from Voice Tutor highlighting.

```javascript
class HighlightManager {
  constructor(passageId) {
    this.passageId = passageId;
    this.userHighlights = [];
    this.voiceHighlight = null;
  }

  saveHighlight(startPos, endPos, text) {
    // Saves user highlight to localStorage
    // Returns: { id, startPos, endPos, text, timestamp }
  }

  loadHighlights() {
    // Loads all highlights for passage from localStorage
    // Returns: Array of highlight objects
  }

  removeHighlight(highlightId) {
    // Removes highlight from localStorage
  }

  updateVoiceHighlight(wordIndex) {
    // Updates Voice Tutor highlighting
    // Uses different CSS class: 'voice-highlight' vs 'user-highlight'
  }

  clearVoiceHighlight() {
    // Clears Voice Tutor highlighting
  }
}
```

### 5. Passage Cache (`src/engine/passageCache.js`)

**Responsibility**: Cache passages and questions for offline access.

```javascript
class PassageCache {
  constructor() {
    this.STORAGE_KEY = 'rc_passage_cache';
    this.MAX_SIZE = 52428800; // 50MB
  }

  async get(passageId) {
    // Retrieves cached passage
    // Returns: Passage object | null
  }

  async set(passageId, passage, questions) {
    // Stores passage and questions with metadata
    // Metadata: { timestamp, size, language }
  }

  async clear() {
    // Clears all cached passages
  }

  async getSize() {
    // Returns total cache size in bytes
  }

  async evictLRU() {
    // Removes least recently used passage when cache exceeds limit
  }

  async isAvailable(passageId) {
    // Checks if passage is cached
    // Returns: boolean
  }
}
```

### 6. Reading Progress Tracker (`src/engine/readingProgress.js`)

**Responsibility**: Track and record reading comprehension progress.

```javascript
class ReadingProgressTracker {
  recordPassageCompletion(passageId, score, readingTime, attempts) {
    // Records passage completion
    // Stores: { passageId, score, readingTime, attempts, timestamp, difficulty }
    // Updates progress store and syncs to Firebase
  }

  calculateReadingSpeed(passageLength, readingTime) {
    // Calculates words per minute
    // Returns: number (wpm)
  }

  updateAdaptiveDifficulty(performance) {
    // Updates difficulty based on performance
    // High accuracy (>80%): increase difficulty
    // Low accuracy (<50%): decrease difficulty
    // Stable (50-80%): maintain difficulty
  }

  getProgressStats() {
    // Returns: { totalPassages, averageScore, averageReadingSpeed, difficultyProgression }
  }

  awardXP(score, difficulty) {
    // Calculates and awards XP
    // Formula: baseXP * difficultyMultiplier * accuracyMultiplier
    // Returns: number (XP awarded)
  }
}
```

---

## Data Models

### Passage Structure

```javascript
{
  id: "passage_001",
  text: "The quick brown fox jumps over the lazy dog...",
  title: "The Fox and the Dog",
  subject: "English",
  difficulty: "intermediate",  // easy, intermediate, hard
  language: "en",
  wordCount: 250,
  estimatedReadingTime: 1.25,  // minutes
  version: 1,
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

### Question Structure

```javascript
{
  id: "q_001",
  passageId: "passage_001",
  type: "multiple_choice",  // multiple_choice, true_false, short_answer
  text: "What color is the fox?",
  options: ["Brown", "Red", "White", "Black"],  // For multiple choice
  correctAnswer: "Brown",  // For multiple choice/true_false
  expectedAnswers: ["brown", "brown fox"],  // For short answer (fuzzy match)
  explanation: "The passage states the fox is brown.",
  difficulty: "easy",
  order: 1
}
```

### Attempt Structure

```javascript
{
  questionId: "q_001",
  passageId: "passage_001",
  answer: "Brown",
  isCorrect: true,
  responseTime: 5000,  // milliseconds
  timestamp: 1234567890,
  attemptNumber: 1
}
```

### Highlight Structure

```javascript
{
  id: "h_001",
  passageId: "passage_001",
  startPos: 4,
  endPos: 25,
  text: "quick brown fox",
  timestamp: 1234567890,
  color: "#FFD700"  // User-selected highlight color
}
```

### Reading Session Structure

```javascript
{
  sessionId: "session_001",
  passageId: "passage_001",
  startTime: 1234567890,
  endTime: 1234567950,
  readingTime: 60000,  // milliseconds
  score: 85,  // percentage
  attempts: [/* attempt objects */],
  difficulty: "intermediate",
  xpEarned: 150,
  voiceTutorUsed: true,
  highlightsCreated: 3
}
```

### User Preferences Structure

```javascript
{
  fontSize: 16,  // pixels
  lineSpacing: 1.5,
  backgroundColor: "light",  // light, dark
  voiceTutorEnabled: true,
  voiceTutorSpeed: 1,  // 0.75, 1, 1.25, 1.5
  highlightColor: "#FFD700",
  language: "en"  // en, ur
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Passage Loading and Display

*For any* passage ID in the question bank, loading that passage should return a passage object with all required fields (id, text, title, difficulty, subject) within 300 milliseconds, and the passage should be rendered in the DOM with appropriate formatting preserved.

**Validates: Requirements 1.1, 1.2, 1.6, 1.7**

### Property 2: Passage Metadata Display

*For any* loaded passage, the rendered output should display the passage title, difficulty level indicator, and estimated reading time calculated based on word count and standard reading speed (200 wpm).

**Validates: Requirements 1.3, 1.4**

### Property 3: Multiple Choice Question Structure

*For any* multiple choice question, the rendered output should display the question text and exactly 4-5 answer options, with the ability to select and change selections before submission.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 4: Question Answer Validation and Feedback

*For any* submitted answer to any question type (multiple choice, true/false, short answer), the system should validate it against the correct answer and provide immediate feedback (correct/incorrect) with explanation within 200 milliseconds.

**Validates: Requirements 2.5, 2.6, 3.3, 3.4, 4.3, 4.4**

### Property 5: Attempt Recording

*For any* submitted answer to any question type, the system should record the attempt with timestamp, response time, and response text (for short answer) to the attempts array.

**Validates: Requirements 2.7, 3.5, 4.6**

### Property 6: True/False Question Display

*For any* true/false question, the rendered output should display exactly two options: "True" and "False", with visual highlighting of the selected option.

**Validates: Requirements 3.1, 3.2**

### Property 7: Short Answer Input Validation

*For any* short answer input, the system should allow text entry up to 500 characters and reject entries exceeding this limit using fuzzy matching against expected answers with a configurable similarity threshold.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 8: Highlight Persistence and Restoration

*For any* user-created highlight, saving it should store the highlight to localStorage with metadata (position, text, color, timestamp), and reloading the passage should restore all previously saved highlights with correct positioning and styling.

**Validates: Requirements 5.2, 5.3, 5.4**

### Property 9: Highlight Visual Distinction

*For any* active Voice Tutor playback, the Voice Tutor highlighting should use a different CSS class and visual style than user-created highlights, and both should coexist without interference.

**Validates: Requirements 5.6, 5.7, 6.3**

### Property 10: Voice Tutor Integration and Controls

*For any* passage display, Voice Tutor controls (play, pause, stop, speed adjustment) should be available and functional, with real-time synchronization of highlighting with audio narration, and automatic pause when questions are answered.

**Validates: Requirements 6.1, 6.2, 6.4, 6.5, 6.6**

### Property 11: Voice Tutor Cleanup

*For any* passage navigation or module exit, Voice Tutor playback should stop and all resources should be cleaned up properly.

**Validates: Requirements 6.7**

### Property 12: Passage Navigation

*For any* completed passage, clicking "Next Passage" should load the next passage from the question bank, and clicking "Previous Passage" should load the previous passage (if not on first passage), with Voice Tutor state cleared and highlighting reset on navigation.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 13: Previous Session Data Retrieval

*For any* previously completed passage, navigating to it should display the student's previous score, reading time, and answers from the prior session.

**Validates: Requirements 7.6, 7.7, 9.8**

### Property 14: Adaptive Difficulty Adjustment

*For any* passage completed with accuracy >80%, the next passage should have increased difficulty with more complex vocabulary and harder questions; for accuracy <50%, the next passage should have decreased difficulty with simpler vocabulary and easier questions; for accuracy 50-80%, difficulty should remain stable.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8**

### Property 15: Comprehension Score and Progress Recording

*For any* completed passage, the system should calculate comprehension score as (correct answers / total questions) * 100, record reading time from passage load to final question submission, record attempt counts, award XP based on score and difficulty using a consistent formula, and update the progress store with all session data.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 16: Progress Statistics Display

*For any* student viewing their progress, the system should display total passages completed, average comprehension score, average reading speed, and difficulty level progression.

**Validates: Requirements 9.6**

### Property 17: Firebase Progress Synchronization

*For any* completed passage, progress data should be automatically synced to Firebase for cloud persistence, and when a student logs in on a different device, their progress should be retrieved from Firebase.

**Validates: Requirements 9.7, 17.2, 17.5, 17.6**

### Property 18: Offline Passage Caching

*For any* passage loaded online, the passage text and associated questions should be cached to localStorage with metadata (timestamp, size, language), and when offline, cached passages should load within 100 milliseconds.

**Validates: Requirements 10.1, 10.2, 13.7**

### Property 19: Offline Progress Recording and Sync

*For any* passage completed offline, progress data should be saved to localStorage, and when the student returns online, all queued progress updates should be synced to Firebase with conflict resolution keeping the most recent update.

**Validates: Requirements 10.3, 10.4, 17.3, 17.4, 17.7**

### Property 20: Cache Size Management

*For any* cached passages, the total cache size should not exceed 50MB, and when capacity is reached, least recently used passages should be evicted to make space for new ones.

**Validates: Requirements 10.6, 10.7**

### Property 21: Language Support

*For any* student with English language preference, all passages and questions should be displayed in English; for Urdu preference, all content should be displayed in Urdu with RTL layout applied, appropriate Urdu fonts, and Urdu voice for Voice Tutor, with language switching updating content immediately and preserving progress across languages.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7**

### Property 22: Accessibility - Screen Reader Support

*For any* screen reader active, all passages, questions, and answer options should be announced clearly with appropriate ARIA labels, and highlighting changes during Voice Tutor playback should be announced via live regions.

**Validates: Requirements 12.1, 12.2, 12.6**

### Property 23: Accessibility - Keyboard Navigation

*For any* keyboard-only user, all features (passage navigation, question answering, highlighting) should be fully accessible using Tab, Enter, and Arrow keys, with visible focus indicators on all interactive elements following a logical tab order.

**Validates: Requirements 12.3, 12.4, 12.8**

### Property 24: Accessibility - Color Contrast

*For any* text and control element, color contrast should maintain WCAG 2.1 Level AA ratios (4.5:1 for text, 3:1 for graphics), and all visual elements should have alternative text descriptions.

**Validates: Requirements 12.5, 12.7**

### Property 25: Performance - Load Times

*For any* passage load operation, the passage should be displayed within 300 milliseconds; for answer submission, feedback should be provided within 200 milliseconds; for passage navigation, the new passage should load within 500 milliseconds.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 26: Performance - Real-Time Updates

*For any* Voice Tutor highlighting update, the visual update should occur with no perceptible delay (<50ms), and scrolling through a passage should maintain smooth performance at 60 FPS.

**Validates: Requirements 13.4, 13.5**

### Property 27: Performance - Resource Usage

*For any* active reading session, memory usage should not exceed 50MB.

**Validates: Requirements 13.6**

### Property 28: Error Handling and Resilience

*For any* error occurrence (passage load failure, question load failure, answer validation failure, Voice Tutor failure), the system should display an appropriate error message with recovery options (retry, skip, continue), log the error for debugging, and ensure the passage text remains accessible and the student is not blocked from continuing.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**

### Property 29: Firebase Sync Resilience

*For any* Firebase sync failure, progress data should be queued locally and retry when connectivity is restored.

**Validates: Requirements 14.7**

### Property 30: Parent Portal Integration

*For any* parent viewing the student dashboard, reading comprehension statistics (passages completed, average score, reading speed, difficulty progression, completed passages with scores) should be displayed, and when exporting progress data, reading comprehension metrics should be included in the PDF report.

**Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**

### Property 31: Question Bank Integration

*For any* passage load, the system should validate that all associated questions are present and properly formatted, verify that passage text is not empty and meets minimum length requirements (100 words minimum), and support loading passages organized by subject and difficulty level with multiple question types.

**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.6**

### Property 32: User Preferences Persistence

*For any* user preference adjustment (font size, line spacing, background color, Voice Tutor enabled/disabled, Voice Tutor speed), the preference should be saved to localStorage and restored on subsequent visits.

**Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.6, 18.7**

### Property 33: Adaptive Engine Integration

*For any* passage completion, performance data should be provided to the Adaptive Engine for difficulty adjustment, and the system should receive updated difficulty recommendations that inform passage selection, with XP awarded contributing to overall rank and progression, and high performance unlocking bonus passages.

**Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5**

### Property 34: Progress Store Integration

*For any* passage completion, the progress store should be updated with all reading comprehension data (completion status, score, reading time, XP earned), and when progress data is retrieved from the progress store, it should inform adaptive difficulty decisions and be included in cloud sync to Firebase.

**Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5**



---

## Error Handling

### Error Scenarios and Recovery

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Detection                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
        ▼            ▼            ▼              ▼
   ┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │Passage │  │Question  │  │Voice     │  │Network   │
   │Load    │  │Load      │  │Tutor     │  │Error     │
   │Failed  │  │Failed    │  │Failed    │  │          │
   └────┬───┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
        │           │             │             │
        ▼           ▼             ▼             ▼
   ┌────────────────────────────────────────────────────┐
   │  Display Error Message                             │
   │  - Clear explanation                               │
   │  - Suggested next steps                            │
   │  - Retry option (if applicable)                    │
   └────────────────────────────────────────────────────┘
        │
        ▼
   ┌────────────────────────────────────────────────────┐
   │  Log Error                                         │
   │  - Error type                                      │
   │  - Browser/device info                             │
   │  - Timestamp                                       │
   │  - User context                                    │
   └────────────────────────────────────────────────────┘
```

### Error Messages

| Error | Message | Recovery |
|-------|---------|----------|
| Passage load failed | "Unable to load passage. Please check your connection and try again." | Retry button |
| Question load failed | "Unable to load questions. You can skip to the next passage." | Skip button |
| Voice Tutor unavailable | "Voice Tutor is not available. You can continue reading without audio." | Continue button |
| Answer validation failed | "Unable to validate your answer. Please try again." | Retry button |
| Offline without cache | "This passage is not available offline. Please connect to the internet." | Offline message |
| Firebase sync failed | "Unable to save your progress. It will sync when you're back online." | Offline queue |

### Error Recovery Strategies

1. **Passage Load Failure**: Retry with exponential backoff, fall back to cached version if available
2. **Question Load Failure**: Allow skipping to next passage, log error for debugging
3. **Voice Tutor Failure**: Continue without audio, display fallback message
4. **Answer Validation Failure**: Allow resubmission, log validation error
5. **Network Failure**: Queue data locally, retry on reconnection
6. **Firebase Sync Failure**: Implement retry queue with exponential backoff

---

## Testing Strategy

### Unit Testing (Vitest)

**Passage Manager Tests**:
- Test passage loading from question bank
- Test passage validation (length, format)
- Test reading time calculation
- Test passage navigation (next/previous)
- Test passage caching and retrieval

**Question Handler Tests**:
- Test question loading
- Test answer validation for each question type
- Test score calculation
- Test attempt recording
- Test hint generation

**Highlight Manager Tests**:
- Test highlight creation and persistence
- Test highlight restoration from localStorage
- Test highlight removal
- Test visual distinction between user and Voice Tutor highlights

**Passage Cache Tests**:
- Test cache storage and retrieval
- Test LRU eviction
- Test cache size limits
- Test offline availability checks

**Reading Progress Tests**:
- Test progress recording
- Test reading speed calculation
- Test adaptive difficulty updates
- Test XP calculation
- Test progress stats aggregation

**Component Tests**:
- Test preference persistence
- Test UI rendering
- Test event handling
- Test accessibility attributes

### Property-Based Testing (Vitest with fast-check)

Each correctness property should be tested with property-based testing:

```javascript
// Example: Property 20 - Comprehension Score Calculation
describe('Reading Comprehension - Score Calculation', () => {
  it('Property 20: Score calculated as (correct/total)*100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (correct, total) => {
          fc.pre(correct <= total);
          const score = calculateScore(correct, total);
          expect(score).toBe((correct / total) * 100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Tag Format**: `Feature: reading-comprehension-module, Property {number}: {property_text}`

### E2E Testing (Playwright)

**Core Workflows**:
- Load passage → Answer questions → Complete session
- Navigate between passages
- Use Voice Tutor with passage
- Create and restore highlights
- Test offline functionality

**Accessibility Tests**:
- Keyboard navigation through all features
- Screen reader announcements
- Focus indicator visibility
- Color contrast verification

**Performance Tests**:
- Measure passage load time (<300ms)
- Measure answer feedback time (<200ms)
- Measure navigation time (<500ms)
- Monitor memory usage

**Cross-Browser Tests**:
- iOS Safari
- Android Chrome
- Desktop Chrome/Firefox/Safari

### Performance Testing

- Measure initialization time (<300ms target)
- Measure answer feedback time (<200ms target)
- Measure navigation time (<500ms target)
- Monitor memory usage during reading sessions
- Test with large passages (>1000 words)
- Test with many highlights (>50)

---

## Performance Optimizations

### Initialization Optimization

1. **Lazy Load Components**: Initialize only when needed
2. **Preload Question Bank**: Cache question metadata on app startup
3. **Async Initialization**: Use requestAnimationFrame for non-blocking setup
4. **Efficient DOM Parsing**: Use efficient string splitting for word boundaries

### Rendering Optimization

1. **Virtual Scrolling**: For very long passages, render only visible portion
2. **CSS Classes**: Use CSS classes instead of inline styles for highlighting
3. **Debounce Updates**: Batch multiple highlight updates if needed
4. **Efficient DOM Updates**: Minimize reflows and repaints

### Memory Optimization

1. **Resource Cleanup**: Properly remove event listeners and clear timers
2. **Cache Limits**: Implement LRU eviction at 50MB
3. **Passage Parsing**: Use efficient string operations
4. **Garbage Collection**: Nullify large objects when no longer needed

### Network Optimization

1. **Passage Caching**: Cache passages for offline use
2. **Lazy Loading**: Load questions only when needed
3. **Compression**: Store cached data in compressed format
4. **Batch Sync**: Batch multiple progress updates before syncing

---

## Accessibility Implementation

### WCAG 2.1 Level AA Compliance

**Keyboard Navigation**:
- All controls accessible via Tab key
- Enter/Space to activate buttons
- Arrow keys for option selection
- Escape to cancel operations

**Screen Reader Support**:
- ARIA labels on all controls
- Live region for question feedback
- Semantic HTML structure
- Alternative text for visual indicators

**Visual Design**:
- Minimum 4.5:1 contrast ratio for text
- Minimum 3:1 contrast ratio for graphics
- Focus indicators on all interactive elements
- No color-only information

**Motor Control**:
- Large touch targets (minimum 44x44px)
- Adequate spacing between controls
- No time-dependent interactions

### Implementation Details

```html
<!-- Passage with ARIA labels -->
<article aria-label="Reading passage" role="region">
  <h2>{{ passage.title }}</h2>
  <p>{{ passage.text }}</p>
</article>

<!-- Question with semantic structure -->
<fieldset>
  <legend>{{ question.text }}</legend>
  <label>
    <input type="radio" name="answer" value="option1" />
    Option 1
  </label>
  <!-- ... -->
</fieldset>

<!-- Live region for feedback -->
<div 
  aria-live="polite" 
  aria-atomic="true"
  class="sr-only"
  id="feedback-region"
>
  Feedback message
</div>

<!-- Focus indicator -->
<button class="btn" tabindex="0">
  Next Passage
</button>

<style>
  button:focus {
    outline: 3px solid #4A90E2;
    outline-offset: 2px;
  }
</style>
```

---

## Integration Points

### With Voice Tutor

1. **Passage Injection**: Voice Tutor receives passage text from Reading Comprehension component
2. **Highlight Synchronization**: Voice Tutor updates highlighting as it reads
3. **Auto-Pause**: Voice Tutor pauses when question is answered
4. **Resource Cleanup**: Voice Tutor stops and cleans up on navigation
5. **Preference Sync**: Voice Tutor respects app language preference

### With Adaptive Engine

1. **Performance Data**: Reading Comprehension provides score and difficulty data
2. **Difficulty Adjustment**: Adaptive Engine recommends next passage difficulty
3. **Passage Selection**: Reading Comprehension selects passages based on recommendations
4. **XP Calculation**: Adaptive Engine calculates XP based on difficulty and score

### With Progress Store

1. **Progress Recording**: Reading Comprehension updates progress store with session data
2. **Preference Persistence**: User preferences stored in progress store
3. **Offline State**: Check online status from progress store
4. **Cloud Sync**: Progress data synced to Firebase via progress store

### With Question Bank

1. **Passage Loading**: Reading Comprehension loads passages from question bank
2. **Question Loading**: Questions loaded with passage metadata
3. **Validation**: Question bank validates passage and question structure
4. **Versioning**: Question bank tracks passage versions

### With i18n Module

1. **Language Sync**: Reading Comprehension updates content when language preference changes
2. **UI Translations**: Reading Comprehension UI labels translated via i18n
3. **RTL Support**: Reading Comprehension UI adapts to RTL layout for Urdu
4. **Voice Selection**: Voice Tutor uses language-specific voice

---

## State Management

### Component State Flow

```
User Action
    │
    ▼
Event Handler
    │
    ├─→ Update Local State
    │
    ├─→ Update Progress Store
    │
    ├─→ Trigger Cloud Sync
    │
    └─→ Re-render Component
```

### Data Persistence Strategy

```
Local State (Component)
    │
    ├─→ localStorage (User Preferences)
    │
    ├─→ localStorage (Highlights)
    │
    ├─→ Progress Store (Session Data)
    │
    └─→ Firebase (Cloud Sync)
```

### Offline State Management

```
Online
    │
    ├─→ Load from Question Bank
    │
    ├─→ Cache to localStorage
    │
    └─→ Sync to Firebase

Offline
    │
    ├─→ Load from localStorage Cache
    │
    ├─→ Queue Progress Updates
    │
    └─→ Sync when Online
```

---

## Configuration

### Reading Engine Options

```javascript
const readingEngineConfig = {
  minPassageLength: 100,        // words
  maxPassageLength: 500,        // words
  questionsPerPassage: 5,       // questions
  readingSpeedWPM: 200,         // words per minute
  fuzzyMatchThreshold: 0.7,     // 0-1 similarity
  cacheMaxSize: 52428800,       // 50MB in bytes
  performanceTargets: {
    passageLoad: 300,           // ms
    answerFeedback: 200,        // ms
    navigationLoad: 500,        // ms
    highlightUpdate: 50         // ms
  }
};
```

### Adaptive Difficulty Thresholds

```javascript
const difficultyConfig = {
  increaseThreshold: 0.8,       // 80% accuracy
  decreaseThreshold: 0.5,       // 50% accuracy
  stabilityRange: [0.5, 0.8],   // 50-80% accuracy
  initialDifficulty: 'medium',
  difficulties: ['easy', 'medium', 'hard']
};
```

### XP Calculation Formula

```javascript
const xpFormula = {
  baseXP: 100,
  difficultyMultiplier: {
    easy: 1,
    medium: 1.5,
    hard: 2
  },
  accuracyMultiplier: (score) => score / 100,
  // Total XP = baseXP * difficultyMultiplier * accuracyMultiplier
};
```

---

## Monitoring & Logging

### Key Metrics

- Passage load time
- Answer feedback time
- Navigation load time
- Highlight update latency
- Error rate
- Cache hit rate
- Offline usage percentage
- Average reading speed
- Average comprehension score

### Logging Events

```javascript
// Log passage load
logEvent('passage_loaded', {
  passage_id: 'passage_001',
  load_time: 250,
  from_cache: false,
  timestamp: Date.now()
});

// Log answer submission
logEvent('answer_submitted', {
  question_id: 'q_001',
  question_type: 'multiple_choice',
  is_correct: true,
  response_time: 5000,
  timestamp: Date.now()
});

// Log session completion
logEvent('session_completed', {
  passage_id: 'passage_001',
  score: 85,
  reading_time: 60000,
  xp_earned: 150,
  difficulty: 'medium',
  timestamp: Date.now()
});

// Log error
logEvent('error_occurred', {
  error_type: 'passage_load_failed',
  error_message: 'Network error',
  browser: 'Safari',
  timestamp: Date.now()
});
```

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ Full support | All features supported |
| Safari | 14.1+ | ✅ Full support | iOS Safari 14.1+ supported |
| Edge | 90+ | ✅ Full support | Chromium-based, full support |
| Firefox | 88+ | ✅ Full support | All features supported |
| Opera | 76+ | ✅ Full support | Chromium-based, full support |

### Fallback Strategy

```
Browser Capability Check
├── localStorage Available?
│   ├── Yes → Use for caching
│   └── No → Use in-memory cache
├── Web Speech API Available?
│   ├── Yes → Use Voice Tutor
│   └── No → Show Voice Tutor unavailable
└── IndexedDB Available?
    ├── Yes → Use for audio cache
    └── No → Use localStorage
```

---

## Offline Support

### Offline Detection

```javascript
// Monitor online/offline status
window.addEventListener('online', () => {
  readingEngine.setOfflineMode(false);
  // Sync queued progress data
  syncQueuedProgress();
});

window.addEventListener('offline', () => {
  readingEngine.setOfflineMode(true);
  // Queue progress updates locally
});
```

### Offline Caching Strategy

1. **Initial Load**: Download passages when loaded online
2. **On-Demand**: Cache passages as they're accessed
3. **Expiration**: Invalidate cache after 30 days
4. **Size Limits**: Cap cache at 50MB with LRU eviction
5. **Sync Queue**: Queue progress updates when offline

---

## Future Enhancements

1. **Reading Analytics**: Track reading patterns and comprehension trends
2. **Vocabulary Builder**: Extract and track new vocabulary from passages
3. **Bookmarking**: Save favorite passages for later review
4. **Annotation**: Allow students to add notes to passages
5. **Comprehension Checks**: Pause at intervals for quick comprehension questions
6. **Reading Challenges**: Timed reading challenges with leaderboards
7. **Passage Recommendations**: AI-powered passage recommendations based on interests
8. **Reading Goals**: Set and track reading goals (passages per week, etc.)

---

## Implementation Roadmap

### Phase 1: Core Functionality
- [ ] Passage loading and display
- [ ] Multiple choice questions
- [ ] True/false questions
- [ ] Short answer questions
- [ ] Basic progress tracking

### Phase 2: Advanced Features
- [ ] Passage highlighting
- [ ] Voice Tutor integration
- [ ] Passage navigation
- [ ] Adaptive difficulty
- [ ] Offline caching

### Phase 3: Accessibility & Polish
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Error handling refinement
- [ ] Performance optimization

### Phase 4: Testing & Deployment
- [ ] Unit test coverage
- [ ] Property-based tests
- [ ] E2E tests (iOS/Android)
- [ ] Performance testing
- [ ] Production deployment

---

## Conclusion

The Reading Comprehension Module design provides a comprehensive, accessible, and performant solution for enhancing reading comprehension learning through interactive passages, multiple question types, adaptive difficulty, and seamless Voice Tutor integration. By leveraging the existing AcePrep architecture (progress store, adaptive engine, question bank) with intelligent caching, offline support, and WCAG 2.1 Level AA accessibility compliance, the feature delivers a seamless learning experience across iOS Safari and Android Chrome while maintaining high performance standards and supporting both English and Urdu languages.

