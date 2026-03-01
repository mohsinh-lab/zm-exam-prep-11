# AcePrep 11+ Quick Start Guide

Get up and running with AcePrep 11+ in 5 minutes.

---

## Prerequisites

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

---

## Setup (First Time)

### 1. Clone Repository
```bash
git clone https://github.com/mohsinh-lab/zm-exam-prep-11.git
cd zm-exam-prep-11
```

### 2. Install Dependencies
```bash
cd "Test App"
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Daily Development Workflow

### Option 1: Interactive Menu (Easiest)

**Windows:**
```bash
quick-tasks.bat
```

**Mac/Linux:**
```bash
./quick-tasks.sh
```

### Option 2: Makefile Commands

```bash
make dev          # Start dev server
make test         # Run tests
make build        # Build for production
make help         # See all commands
```

### Option 3: NPM Scripts

```bash
cd "Test App"
npm run dev       # Start dev server
npm test          # Run tests
npm run build     # Build for production
```

---

## Project Structure

```
Test App/
├── src/
│   ├── app.js                    # Main app entry
│   ├── features/                 # Feature modules
│   │   ├── auth/                # Login, Onboarding
│   │   ├── student/             # Student views
│   │   └── parent/              # Parent portal
│   ├── engine/                   # Business logic
│   │   ├── adaptiveEngine.js    # ELO-based learning
│   │   ├── progressStore.js     # State management
│   │   └── questionBank.js      # Questions data
│   └── styles/                   # CSS files
├── tests/                        # Test files
├── public/                       # Static assets
└── index.html                    # Entry point
```

---

## Common Tasks

### Run Tests
```bash
cd "Test App"
npm test                    # Run once
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:ui             # Playwright tests
```

### Build for Production
```bash
cd "Test App"
npm run build               # Creates dist/ folder
npm run preview             # Preview build locally
```

### Deploy to GitHub Pages
```bash
# Option 1: Use script
./deploy-changes.bat        # Windows
./deploy-changes.sh         # Mac/Linux

# Option 2: Manual
git add .
git commit -m "Your message"
git push origin main        # Triggers auto-deployment
```

---

## VS Code Setup (Recommended)

### 1. Install Recommended Extensions
When you open the project, VS Code will prompt you to install recommended extensions. Click "Install All".

Or manually install:
- ESLint
- Prettier
- Vitest
- Playwright Test

### 2. Use Built-in Tasks
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type "Tasks: Run Task"

Available tasks:
- Dev Server
- Build
- Test
- Deploy

### 3. Debug Configuration
Press `F5` to start debugging with pre-configured setups:
- Debug Dev Server
- Debug Tests
- Debug Deployed Site

---

## Firebase Setup (Optional)

For cloud sync and authentication:

1. Create Firebase project at https://console.firebase.google.com/
2. Enable Google Authentication
3. Enable Realtime Database
4. Copy configuration values
5. Create `.env` file in `Test App/`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

See [FIREBASE_SETUP.md](Test App/FIREBASE_SETUP.md) for detailed instructions.

---

## Testing Your Changes

### Before Committing
```bash
cd "Test App"
npm run verify              # Runs tests + build
```

### After Deployment
1. Visit https://mohsinh-lab.github.io/zm-exam-prep-11/
2. Hard refresh (Ctrl+Shift+R) to bypass cache
3. Test authentication
4. Complete a quiz
5. Check parent portal

---

## Troubleshooting

### Port 5173 Already in Use
```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill
```

### Tests Failing
```bash
# Clear cache and reinstall
cd "Test App"
rm -rf node_modules package-lock.json
npm install
npm test
```

### Build Errors
```bash
# Check Node version (should be 20.x)
node --version

# Clear Vite cache
cd "Test App"
rm -rf .vite dist
npm run build
```

### Deployment Not Updating
1. Check GitHub Actions: https://github.com/mohsinh-lab/zm-exam-prep-11/actions
2. Verify workflow completed successfully
3. Hard refresh browser (Ctrl+Shift+R)
4. Clear browser cache completely

---

## Key Files to Know

### Configuration
- `Test App/package.json` - Dependencies and scripts
- `Test App/vite.config.js` - Build configuration
- `.github/workflows/` - CI/CD pipelines

### Documentation
- `PROJECT_ROADMAP.md` - Project status and tasks
- `AUTOMATION_GUIDE.md` - All automation features
- `Test App/DEPLOYMENT_CHECKLIST.md` - Deployment guide

### Steering (AI Context)
- `.kiro/steering/product.md` - Product overview
- `.kiro/steering/tech.md` - Tech stack
- `.kiro/steering/structure.md` - Project structure

---

## Getting Help

### Documentation
- [Project Roadmap](PROJECT_ROADMAP.md) - Tasks and priorities
- [Automation Guide](AUTOMATION_GUIDE.md) - All automation features
- [Deployment Checklist](Test App/DEPLOYMENT_CHECKLIST.md) - Deploy guide
- [Firebase Setup](Test App/FIREBASE_SETUP.md) - Firebase config
- [Verification Guide](Test App/VERIFICATION_GUIDE.md) - Testing guide

### External Resources
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Repository
- **GitHub:** https://github.com/mohsinh-lab/zm-exam-prep-11
- **Issues:** https://github.com/mohsinh-lab/zm-exam-prep-11/issues
- **Actions:** https://github.com/mohsinh-lab/zm-exam-prep-11/actions

---

## Next Steps

1. ✅ Complete setup above
2. 📖 Read [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) for current priorities
3. 🧪 Run tests to verify everything works
4. 🚀 Make your first change and deploy
5. 📊 Check [GitHub Actions](https://github.com/mohsinh-lab/zm-exam-prep-11/actions) to see deployment

---

## Quick Reference Card

```bash
# Development
npm run dev              # Start dev server (localhost:5173)

# Testing
npm test                 # Run unit tests
npm run test:ui          # Run UI tests
npm run test:coverage    # Coverage report

# Building
npm run build            # Production build
npm run preview          # Preview build

# Deployment
git add .
git commit -m "message"
git push origin main     # Auto-deploys

# Shortcuts
make dev                 # Start dev
make test                # Run tests
make deploy              # Deploy
quick-tasks.bat          # Interactive menu (Windows)
./quick-tasks.sh         # Interactive menu (Mac/Linux)
```

---

**Welcome to AcePrep 11+! Happy coding! 🚀**
