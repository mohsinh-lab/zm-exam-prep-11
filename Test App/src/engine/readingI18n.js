// Reading Comprehension i18n support
// Integrates with the core i18n module for language switching and RTL support

import { getCurrentLang } from '../core/i18n.js';

const RC_TRANSLATIONS = {
  en: {
    readingTime: 'min read',
    difficulty: { easy: 'Easy', intermediate: 'Medium', hard: 'Hard' },
    question: 'Question',
    of: 'of',
    submit: 'Submit Answer',
    next: 'Next Passage',
    previous: 'Previous Passage',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    correctAnswer: 'Correct answer:',
    hint: 'Hint',
    score: 'Your Score',
    xpEarned: 'XP Earned',
    readingSpeed: 'Reading Speed',
    wpm: 'wpm',
    complete: 'Passage Complete!',
    continueReading: 'Continue Reading',
    backToHome: 'Back to Home',
    loading: 'Loading passage...',
    errorLoad: 'Could not load passage. Please try again.',
    retry: 'Retry',
    offline: 'You are offline. Showing cached content.',
    notCached: 'This passage is not available offline.',
    voicePlay: 'Play',
    voicePause: 'Pause',
    voiceStop: 'Stop',
    voiceSpeed: 'Speed',
    highlight: 'Highlight',
    fontSize: 'Font Size',
    lineSpacing: 'Line Spacing',
    darkMode: 'Dark Mode',
    preferences: 'Reading Preferences',
    passage: 'Passage',
    questions: 'Questions',
    results: 'Results',
    wordsRead: 'Words Read',
    timeSpent: 'Time Spent',
    accuracy: 'Accuracy'
  },
  ur: {
    readingTime: 'منٹ پڑھنا',
    difficulty: { easy: 'آسان', intermediate: 'درمیانہ', hard: 'مشکل' },
    question: 'سوال',
    of: 'میں سے',
    submit: 'جواب جمع کریں',
    next: 'اگلا حصہ',
    previous: 'پچھلا حصہ',
    correct: 'درست!',
    incorrect: 'غلط',
    correctAnswer: 'درست جواب:',
    hint: 'اشارہ',
    score: 'آپ کا اسکور',
    xpEarned: 'XP حاصل کیا',
    readingSpeed: 'پڑھنے کی رفتار',
    wpm: 'الفاظ فی منٹ',
    complete: 'حصہ مکمل!',
    continueReading: 'پڑھنا جاری رکھیں',
    backToHome: 'گھر واپس',
    loading: 'حصہ لوڈ ہو رہا ہے...',
    errorLoad: 'حصہ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔',
    retry: 'دوبارہ کوشش',
    offline: 'آپ آف لائن ہیں۔ محفوظ مواد دکھایا جا رہا ہے۔',
    notCached: 'یہ حصہ آف لائن دستیاب نہیں ہے۔',
    voicePlay: 'چلائیں',
    voicePause: 'روکیں',
    voiceStop: 'بند کریں',
    voiceSpeed: 'رفتار',
    highlight: 'نمایاں کریں',
    fontSize: 'فونٹ سائز',
    lineSpacing: 'لائن اسپیسنگ',
    darkMode: 'ڈارک موڈ',
    preferences: 'پڑھنے کی ترجیحات',
    passage: 'حصہ',
    questions: 'سوالات',
    results: 'نتائج',
    wordsRead: 'پڑھے گئے الفاظ',
    timeSpent: 'وقت گزارا',
    accuracy: 'درستگی'
  }
};

/** Get a reading-specific translation string */
export function rcT(key) {
  const lang = getCurrentLang();
  const dict = RC_TRANSLATIONS[lang] || RC_TRANSLATIONS.en;
  return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), dict)
    ?? RC_TRANSLATIONS.en[key]
    ?? key;
}

/** Whether current language is RTL */
export function isRTL() {
  return getCurrentLang() === 'ur';
}

/** Get dir attribute value for current language */
export function getDir() {
  return isRTL() ? 'rtl' : 'ltr';
}

/** Get Urdu-appropriate voice lang code */
export function getVoiceLang() {
  return getCurrentLang() === 'ur' ? 'ur-PK' : 'en-GB';
}
