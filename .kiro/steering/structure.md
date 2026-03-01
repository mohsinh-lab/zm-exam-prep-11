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
├── core/               # Core framework code (router.js)
├── engine/             # Business logic engines
│   ├── adaptiveEngine.js      # ELO-based difficulty adaptation
│   ├── audioEngine.js         # Sound effects
│   ├── cloudSync.js           # Firebase sync logic
│   ├── notificationEngine.js  # Push notification logic
│   ├── progressStore.js       # State management (localStorage + cloud)
│   ├── questionBank.js        # Question data and subject definitions
│   ├── quoteBank.js          # Motivational quotes
│   └── readinessEngine.js    # Exam readiness calculations
├── features/           # Feature modules organized by user role
│   ├── auth/          # Login, Onboarding
│   ├── parent/        # Parent Dashboard
│   └── student/       # Student Home, Quiz, Results
├── pages/             # Standalone pages (achievements, actionplan, setup)
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
