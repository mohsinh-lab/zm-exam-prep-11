# AcePrep 11+ Automation Guide

This guide covers all automation features and tools available in the project.

---

## Quick Start Scripts

### Windows Users
Run `quick-tasks.bat` for an interactive menu:
```bash
quick-tasks.bat
```

### Mac/Linux Users
Run `quick-tasks.sh` for an interactive menu:
```bash
./quick-tasks.sh
```

### Using Makefile
If you have `make` installed:
```bash
make help          # Show all available commands
make dev           # Start development server
make test          # Run tests
make deploy        # Deploy to GitHub Pages
```

---

## GitHub Actions Workflows

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)
**Triggers:** Push to main, Pull requests, Manual dispatch  
**Purpose:** Build and deploy to GitHub Pages

**What it does:**
- Installs dependencies
- Builds production bundle with Firebase env vars
- Uploads build artifacts
- Deploys to GitHub Pages (only on push to main)

**Monitoring:**
- View at: https://github.com/mohsinh-lab/zm-exam-prep-11/actions
- Deployed site: https://mohsinh-lab.github.io/zm-exam-prep-11/

---

### 2. Test Workflow (`.github/workflows/test.yml`)
**Triggers:** Push to main/develop, Pull requests, Manual dispatch  
**Purpose:** Run automated tests

**What it does:**
- Runs unit tests with Vitest
- Generates coverage report
- Runs Playwright UI tests
- Comments PR with coverage metrics
- Uploads test artifacts

**Artifacts:**
- Coverage report (30 days retention)
- Playwright test results (30 days retention)

---

### 3. Code Quality Workflow (`.github/workflows/code-quality.yml`)
**Triggers:** Push to main/develop, Pull requests, Manual dispatch  
**Purpose:** Enforce code quality standards

**What it does:**
- Checks for console.log statements
- Lists TODO/FIXME comments
- Identifies large files (>50KB)
- Runs npm audit for security vulnerabilities
- Scans for secrets with TruffleHog

**Note:** Most checks are non-blocking (continue-on-error: true)

---

### 4. Daily Report Workflow (`.github/workflows/daily-report.yml`)
**Triggers:** Daily at 8 PM UTC, Manual dispatch  
**Purpose:** Send daily progress report to parents

**What it does:**
- Sends automated email with student progress summary
- Links to parent portal for detailed view

**Configuration:**
Requires GitHub secrets:
- `MAIL_USERNAME` - Gmail address
- `MAIL_PASSWORD` - Gmail app password
- `PARENT_EMAIL` - Recipient email

---

## Dependabot Configuration

**File:** `.github/dependabot.yml`

**What it does:**
- Checks for npm dependency updates weekly (Mondays at 9 AM)
- Checks for GitHub Actions updates weekly
- Creates PRs automatically
- Limits to 5 npm PRs and 3 Actions PRs at a time

**Labels:**
- `dependencies` - All dependency updates
- `automated` - npm updates
- `github-actions` - Actions updates

---

## Local Development Automation

### VS Code Tasks (`.vscode/tasks.json`)

Available tasks (Ctrl+Shift+P → "Tasks: Run Task"):
1. **Dev Server** - Start Vite dev server
2. **Build** - Production build
3. **Preview** - Preview production build
4. **Test** - Run unit tests once
5. **Test Watch** - Run tests in watch mode
6. **Test UI** - Run Playwright tests
7. **Deploy** - Commit and push changes
8. **Install** - Install dependencies

### VS Code Debug Configurations (`.vscode/launch.json`)

Available debug configs (F5 or Debug panel):
1. **Debug Dev Server** - Debug local dev server
2. **Debug Production Preview** - Debug production build
3. **Debug Deployed Site** - Debug live site
4. **Debug Tests** - Debug Vitest tests
5. **Debug Current Test File** - Debug active test file

---

## NPM Scripts

All scripts run from `Test App/` directory:

```bash
# Development
npm run dev              # Start dev server (port 5173)

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run unit tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:ui          # Run Playwright UI tests
npm run test:all         # Run all tests (unit + UI)

# Verification
npm run verify           # Run tests + build (pre-deploy check)
```

---

## Git Automation

### Deployment Scripts

**Windows:** `deploy-changes.bat`
```bash
deploy-changes.bat
```

**Mac/Linux:** `deploy-changes.sh`
```bash
./deploy-changes.sh
```

**What they do:**
- Show git status
- Stage all changes
- Prompt for commit message
- Commit changes
- Push to origin/main
- Trigger GitHub Actions deployment

---

## Recommended Automation Additions

### 1. Pre-commit Hooks (Husky)

Install husky for git hooks:
```bash
cd "Test App"
npm install --save-dev husky lint-staged
npx husky install
```

Add pre-commit hook:
```bash
npx husky add .husky/pre-commit "cd 'Test App' && npm test"
```

This will run tests before every commit.

---

### 2. Lighthouse CI

Add `.github/workflows/lighthouse.yml`:
```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: 'https://mohsinh-lab.github.io/zm-exam-prep-11/'
          uploadArtifacts: true
```

---

### 3. Visual Regression Testing

Add Playwright screenshot tests:
```javascript
// Test App/tests/visual.spec.js
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});
```

---

### 4. Automated Releases

Add `.github/workflows/release.yml` to:
- Generate changelog from commits
- Create GitHub releases
- Tag versions automatically

---

### 5. Performance Monitoring

Add performance tests:
```javascript
// Test App/tests/performance.test.js
test('page load time', async () => {
  const start = performance.now();
  // Load page
  const end = performance.now();
  expect(end - start).toBeLessThan(2000); // <2s
});
```

---

## Monitoring and Alerts

### GitHub Actions Status

**View all workflows:**
https://github.com/mohsinh-lab/zm-exam-prep-11/actions

**Enable notifications:**
1. Go to repository settings
2. Navigate to "Notifications"
3. Enable email notifications for failed workflows

### Firebase Monitoring

**Set up alerts:**
1. Go to Firebase Console
2. Navigate to "Performance" or "Crashlytics"
3. Set up alerts for errors/crashes

---

## Automation Best Practices

### 1. Keep Workflows Fast
- Use caching for dependencies
- Run tests in parallel when possible
- Only run necessary checks

### 2. Make Failures Visible
- Use GitHub status checks
- Send notifications for failures
- Add badges to README

### 3. Automate Repetitive Tasks
- Use scripts for common operations
- Create aliases for frequent commands
- Document all automation

### 4. Test Automation Locally
- Run workflows locally with `act`
- Test scripts before committing
- Verify all paths and commands

### 5. Keep Secrets Safe
- Never commit secrets to git
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

---

## Troubleshooting

### Workflow Fails
1. Check workflow logs in GitHub Actions
2. Verify all secrets are set correctly
3. Test commands locally first
4. Check for dependency issues

### Tests Fail Locally But Pass in CI
1. Check Node version matches (20.x)
2. Clear node_modules and reinstall
3. Check for environment-specific issues
4. Verify file paths (Windows vs Unix)

### Deployment Doesn't Update
1. Hard refresh browser (Ctrl+Shift+R)
2. Check GitHub Actions completed successfully
3. Verify build artifacts were created
4. Check GitHub Pages settings

### Scripts Don't Run
1. Check file permissions (chmod +x for .sh files)
2. Verify working directory
3. Check for syntax errors
4. Run with verbose output for debugging

---

## Quick Reference

### Common Commands
```bash
# Start development
make dev                    # or npm run dev

# Run tests
make test                   # or npm test

# Deploy
make deploy                 # or ./deploy-changes.bat

# Check status
make status                 # Opens GitHub Actions + deployed site

# Clean build
make clean                  # Removes dist, coverage, etc.
```

### Important URLs
- **Repository:** https://github.com/mohsinh-lab/zm-exam-prep-11
- **Actions:** https://github.com/mohsinh-lab/zm-exam-prep-11/actions
- **Deployed Site:** https://mohsinh-lab.github.io/zm-exam-prep-11/
- **Firebase Console:** https://console.firebase.google.com/

### File Locations
- **Workflows:** `.github/workflows/`
- **Scripts:** `quick-tasks.bat`, `quick-tasks.sh`, `Makefile`
- **VS Code:** `.vscode/tasks.json`, `.vscode/launch.json`
- **Tests:** `Test App/tests/`
- **Docs:** `PROJECT_ROADMAP.md`, `AUTOMATION_GUIDE.md`

---

**Last Updated:** March 1, 2026  
**Maintained By:** mohsinh-lab
