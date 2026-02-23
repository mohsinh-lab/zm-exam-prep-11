# AcePrep 11+ — Technical Steering Guide 🧭

This document serves as the "Steering Documentation" for the AcePrep 11+ project. It outlines the architecture, core engines, and how to maintain or scale the platform from this base.

---

## 🏗️ Architecture Overview

The application is built using **Vanilla HTML5, CSS3, and JavaScript (ES Modules)**. It avoids heavy frameworks to ensure maximum performance on iPad/mobile devices and simplified maintenance.

- **Routing:** Handled in `src/app.js` using a hash-based router (`#home`, `#quiz`, etc.).
- **Persistence:** All data (XP, Badges, Sessions, Progress) is stored in the browser's `localStorage` via `src/engine/progressStore.js`.
- **State Management:** Functional and modular. Each page (`src/pages/`) is responsible for its own rendering logic.

---

## 🛠️ Core Engines

### 1. `AdaptiveEngine` ([adaptiveEngine.js](file:///Users/mohsin/research/anti/src/engine/adaptiveEngine.js))
- **ELO-Inspired Rating:** Dynamically calculates student and question difficulty.
- **Booster Logic:** Automatically checks performance trends and generates "Booster Missions" for low accuracy.
- **Ranking System:** Manages the Pokémon/Transformers themed ranks (`THEMED_RANKS`).

### 2. `AudioEngine` ([audioEngine.js](file:///Users/mohsin/research/anti/src/engine/audioEngine.js))
- Uses the **Web Audio API** for spatial UI sound effects.
- Supports `init()`, `play(name)`, and browser interaction resumes.

### 3. `QuestionBank` ([questionBank.js](file:///Users/mohsin/research/anti/src/engine/questionBank.js))
- The central source of truth for 11+ content.
- Categories: Verbal Reasoning (VR), Non-Verbal Reasoning (NVR), English, Maths.

---

## 📝 How to Update Content

### Adding Questions
1. Open [questionBank.js](file:///Users/mohsin/research/anti/src/engine/questionBank.js).
2. Add a new object to the `QUESTION_BANK` array:
```javascript
{
  id: 'maths_new_01',
  subject: 'maths',
  type: 'Arithmetic',
  q: 'What is 15 * 6?',
  options: ['80', '90', '100', '110'],
  answer: '90',
  difficulty: 1200 // ELO base
}
```

### Adding Spiritual Quotes
1. Open [quoteBank.js](file:///Users/mohsin/research/anti/src/engine/quoteBank.js).
2. Add to `ISLAMIC_QUOTES` or `GENERAL_MOTIVATIONS`. The Home page will automatically pick these up for the **minute-by-minute** rotation.

### Modifying Characters
- Buddy names and catchphrases are managed in [quiz.js](file:///Users/mohsin/research/anti/src/pages/quiz.js) under `getBuddyName()` and `getInitialBuddySpeech()`.

---

## 🚀 Phase 6 Roadmap (Scaling Up)

To continue development from this baseline, follow these steps:

1.  **PWA Integration:** Add a `manifest.json` and a Service Worker to enable "Add to Home Screen" on iPad and offline support.
2.  **Parent Email Automation:** Integration with a service like EmailJS or SendGrid to send reports directly rather than using a `mailto:` link.
3.  **Advanced Visualization:** Use a library like `Chart.js` in the Parent Dashboard for subject mastery heatmaps.
4.  **Content Scaling:** Aim for 500+ questions to minimize repetition. Use a CSV-to-JSON script to import large batches.

---

## 🛑 Important Precautions
- **Avoid Global Variables:** Stick to the ES Module import/export pattern to avoid `ReferenceError` issues in a Vite/ESM environment.
- **LocalStorage Limits:** Chrome/Safari typically allow ~5MB. The current session-based tracking is lightweight, but prune old sessions if storage grows excessively over years of use.
