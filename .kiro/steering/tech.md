# Tech Stack

## Core Technologies

- **Runtime**: Vanilla JavaScript (ES6+ modules)
- **Markup**: HTML5
- **Styling**: Vanilla CSS with CSS custom properties (design tokens)
- **Build Tool**: Vite 5.x
- **Package Manager**: npm

## Key Libraries & Services

- **Firebase 10.9.0** (CDN imports via ESM):
  - Authentication (Google OAuth)
  - Realtime Database for cloud sync
- **Testing**:
  - Vitest 1.3.x (unit tests with jsdom)
  - Playwright 1.42.x (E2E/UI tests)

## Architecture Patterns

- **SPA with hash-based routing**: Custom router implementation (`src/core/router.js`)
- **Component pattern**: Render functions return HTML strings, optional mount functions for interactivity
- **State management**: localStorage-backed with Firebase cloud sync
- **PWA**: Service Worker for offline support and installability

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server on port 5173

# Build
npm run build        # Production build to dist/

# Preview
npm run preview      # Preview production build locally

# Testing
npm run test         # Run Vitest unit tests (excludes UI tests)
npm run test:ui      # Run Playwright E2E tests
```

## Environment Variables

Firebase configuration uses Vite environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Fallback to dummy values in development if not set.
