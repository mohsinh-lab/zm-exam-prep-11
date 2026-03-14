# Project Structure

## Root Layout

```
Test App/
├── index.html              # Entry point with app shell
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── public/                 # Static assets (icons, images, manifest, SW)
├── src/                    # Application source code
└── tests/                  # Test files
```

## Source Organization (`src/`)

### Core Application Files
- `app.js` - Application bootstrap, routing setup, navigation rendering
- `styles/main.css` - Global styles and design tokens

### Directory Structure

```
src/
├── components/          # Reusable UI components (e.g., confetti.js)
├── config/             # Configuration files (firebase.js)
├── core/               # Core framework code
│   ├── router.js       # Hash-based routing system
│   └── i18n.js         # Multi-language support (English, Urdu)
├── engine/             # Business logic engines
│   ├── adaptiveEngine.js      # ELO-based difficulty adaptation
│   ├── audioEngine.js         # Sound effects
│   ├── cloudSync.js           # Firebase sync logic
│   ├── leaderboard.js         # Global leaderboard management
│   ├── notificationEngine.js  # Push notification logic
│   ├── progressStore.js       # State management (localStorage + cloud)
│   ├── questionBank.js        # Question data and subject definitions (210+ questions)
│   ├── quoteBank.js          # Motivational quotes
│   └── readinessEngine.js    # Exam readiness calculations
├── features/           # Feature modules organized by user role
│   ├── auth/          # Login, Onboarding
│   ├── parent/        # Parent Dashboard with analytics and goal setting
│   └── student/       # Student Home, Quiz, Results, ExamMode, Leaderboard
├── pages/             # Standalone pages (achievements, actionplan, setup, skins)
└── shared/            # Shared utilities
    └── utils/         # Helper utilities (Timer.js)
```

## Component Pattern

Each feature/page module exports:
- `render{Name}()` - Returns HTML string for the view
- `mount{Name}()` - (Optional) Attaches event listeners and initializes interactivity

Example:
```javascript
export function renderStudentHome() { return `<div>...</div>`; }
export function mountStudentHome() { /* wire up events */ }
```

## Routing Convention

- Hash-based routing: `#/path/to/route`
- Routes defined in `app.js` with path patterns supporting parameters (`:param`)
- Navigation via `window.router.navigate('#/path')`

## State Management

- Primary store: `progressStore.js` (localStorage key: `11plus_progress`)
- Cloud sync: Firebase Realtime Database via `cloudSync.js`
- Auth state: Stored in localStorage (`aceprep_user`)

## Testing Structure

```
tests/
├── setup.js              # Vitest global setup
├── *.test.js            # Unit tests (Vitest)
└── *.spec.js            # E2E tests (Playwright)
```

## Naming Conventions

- Files: camelCase for JS files (e.g., `progressStore.js`)
- Components: PascalCase for feature modules (e.g., `Home.js`, `Quiz.js`)
- Functions: camelCase with descriptive prefixes (`render*`, `mount*`, `get*`, `calculate*`)
- Constants: UPPER_SNAKE_CASE (e.g., `SUBJECTS`, `STORAGE_KEY`)

## MVP Features (feat/mvp-completion-v1)

### Multi-Language Support (i18n)
- Implemented in `src/core/i18n.js`
- Supports English and Urdu with RTL layout switching
- Language preference stored in localStorage (`ace_lang`)
- Translations available for all UI labels and navigation

### Ace Skins Customization
- Implemented in `src/pages/skins.js`
- Unlockable avatar suits: Knight, Spaceman, Ninja, Legend
- Integrated with progress store for persistence

### Global Leaderboard
- Implemented in `src/engine/leaderboard.js`
- Real-time ranking with Firebase synchronization
- Secure Firebase rules to prevent data tampering
- Student leaderboard view in `src/features/student/Leaderboard.js`

### 11+ Mock Exam Mode
- Implemented in `src/features/student/ExamMode.js`
- Full Paper simulation (55 mins) for GL Assessment practice
- Silent feedback mode for maximum learning

### Enhanced Parent Portal
- Advanced analytics with radar charts for skill analysis
- Goal setting and special missions management
- PDF export capability for monthly tracking
- Integrated with `src/engine/leaderboard.js` for student rankings
