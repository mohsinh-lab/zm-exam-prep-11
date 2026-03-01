# AcePrep 11+ Verification Guide

## Quick Verification Commands

```bash
# Install dependencies (if not already done)
npm install

# Run all unit tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run E2E tests
npm run test:ui

# Run all tests (unit + E2E)
npm run test:all

# Build and verify
npm run verify

# Build for production
npm run build

# Preview production build
npm run preview
```

## Test Coverage Summary

### Unit Tests (Vitest)

| Test File | Coverage Area | Status |
|-----------|---------------|--------|
| `auth.spec.js` | Authentication flows | ✅ |
| `progressStore.test.js` | State management | ✅ |
| `sync.spec.js` | Cloud synchronization | ✅ |
| `timer.test.js` | Timer utility | ✅ |
| `adaptiveEngine.test.js` | Adaptive learning | ✅ |
| `readinessEngine.test.js` | Readiness calculations | ✅ |
| `router.test.js` | Routing logic | ✅ |

### E2E Tests (Playwright)

| Test File | Coverage Area | Status |
|-----------|---------------|--------|
| `ui.spec.js` | Navigation & UI flows | ✅ |

### Coverage Targets

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Manual Verification Checklist

### 1. Local Development

```bash
cd "Test App"
npm run dev
```

Open http://localhost:5173/zm-exam-prep-11/

**Verify:**
- [ ] App loads without errors
- [ ] No console errors
- [ ] Firebase connection established (check console logs)
- [ ] Can navigate between pages

### 2. Authentication Flow

**Test Student Login:**
1. Click "Login" or navigate to `#/login`
2. Try Google OAuth (if Firebase configured)
3. Try PIN login with default: `2016`
4. Verify redirects to student home

**Test Parent Login:**
1. Navigate to `#/login`
2. Try PIN login with default: `0786`
3. Verify redirects to parent dashboard

**Verify:**
- [ ] Google OAuth works (if configured)
- [ ] PIN authentication works
- [ ] Proper role assignment (student/parent)
- [ ] Session persists on refresh

### 3. Student Features

**Home Dashboard:**
- [ ] Student name displays correctly
- [ ] XP and level shown
- [ ] Streak counter works
- [ ] Exam countdown displays
- [ ] Subject cards render
- [ ] Readiness score calculated

**Quiz Flow:**
1. Click on any subject card
2. Start quiz
3. Answer questions
4. Complete quiz

**Verify:**
- [ ] Questions load correctly
- [ ] Can select answers
- [ ] Timer works (if implemented)
- [ ] Can use hints (costs gems)
- [ ] Results page shows after completion
- [ ] XP awarded correctly
- [ ] Progress saved

**Results Page:**
- [ ] Score displayed
- [ ] Correct/incorrect breakdown
- [ ] XP gained shown
- [ ] Can review answers
- [ ] Can return to home

### 4. Parent Features

**Dashboard:**
- [ ] Student progress visible
- [ ] Session history displays
- [ ] Subject breakdown shown
- [ ] Can generate reports
- [ ] Can switch to student view

**Parent-Student Linking:**
1. Student requests parent approval
2. Parent receives email/link
3. Parent approves
4. Verify link established

**Verify:**
- [ ] Email sent (if configured)
- [ ] Approval flow works
- [ ] Parent can view student data
- [ ] Real-time sync works

### 5. Cloud Sync

**Test Sync:**
1. Complete quiz on device A
2. Open app on device B (same account)
3. Verify progress synced

**Verify:**
- [ ] Progress syncs across devices
- [ ] Sync indicator shows status
- [ ] Offline changes sync when online
- [ ] No data loss

### 6. PWA Functionality

**Desktop (Chrome):**
1. Open app in Chrome
2. Look for install prompt
3. Install app
4. Open installed app

**Mobile (iOS Safari):**
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Open installed app

**Verify:**
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Runs in standalone mode
- [ ] Icons display correctly
- [ ] Splash screen shows
- [ ] Offline mode works

### 7. Offline Functionality

**Test Offline:**
1. Open app while online
2. Disconnect internet
3. Navigate app
4. Try to complete quiz
5. Reconnect internet

**Verify:**
- [ ] App loads offline
- [ ] Cached pages accessible
- [ ] Service worker active
- [ ] Sync resumes when online
- [ ] No data loss

### 8. Responsive Design

**Test on:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

**Verify:**
- [ ] Layout adapts properly
- [ ] Navigation accessible
- [ ] Text readable
- [ ] Buttons clickable
- [ ] No horizontal scroll

### 9. Performance

**Lighthouse Audit:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit (Mobile)

**Targets:**
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90
- [ ] PWA: ✓ All checks

**Load Times:**
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Speed Index < 3.0s

### 10. Browser Compatibility

**Test on:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Verify:**
- [ ] All features work
- [ ] No console errors
- [ ] Styling consistent
- [ ] Animations smooth

## Deployment Verification

### Pre-Deployment

```bash
# Run all tests
npm run test:all

# Build production
npm run build

# Check build output
ls -lh dist/

# Preview build
npm run preview
```

**Verify:**
- [ ] All tests pass
- [ ] Build completes without errors
- [ ] dist/ folder created
- [ ] Assets properly bundled
- [ ] No warnings in build log

### Post-Deployment

**Visit deployed URL:**
https://mohsinh-lab.github.io/zm-exam-prep-11/

**Smoke Tests:**
- [ ] App loads
- [ ] No 404 errors
- [ ] Assets load correctly
- [ ] Firebase connects
- [ ] Authentication works
- [ ] Quiz functional
- [ ] Progress saves
- [ ] PWA installable

**Check GitHub Actions:**
1. Go to repository Actions tab
2. Verify latest workflow succeeded
3. Check deployment logs
4. Verify no errors

### Firebase Verification

**Firebase Console Checks:**
1. Go to Firebase Console
2. Check Authentication > Users
3. Check Realtime Database > Data
4. Check Usage & Billing

**Verify:**
- [ ] Users can authenticate
- [ ] Data being written
- [ ] Database rules working
- [ ] No quota exceeded
- [ ] No errors in logs

## Troubleshooting

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run tests/auth.spec.js
```

### Build Failing

```bash
# Check for syntax errors
npm run build 2>&1 | tee build.log

# Verify environment variables
echo $VITE_FIREBASE_API_KEY

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Firebase Not Connecting

1. Check browser console for errors
2. Verify Firebase config in GitHub secrets
3. Check authorized domains in Firebase Console
4. Verify database rules
5. Check network tab for failed requests

### PWA Not Installing

1. Check manifest.json is accessible
2. Verify service worker registered
3. Check HTTPS is enabled
4. Clear browser cache
5. Check console for SW errors

## Automated Verification Script

Create `verify.sh`:

```bash
#!/bin/bash

echo "🚀 AcePrep 11+ Verification Script"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check command success
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# Navigate to Test App directory
cd "Test App" || exit 1

echo ""
echo "📦 Installing dependencies..."
npm install
check "Dependencies installed"

echo ""
echo "🧪 Running unit tests..."
npm test
check "Unit tests passed"

echo ""
echo "🏗️  Building production..."
npm run build
check "Build successful"

echo ""
echo "📊 Checking build output..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ dist/ folder exists${NC}"
    echo "Build size:"
    du -sh dist/
else
    echo -e "${RED}✗ dist/ folder not found${NC}"
    exit 1
fi

echo ""
echo "✅ All verifications passed!"
echo "Ready for deployment 🚀"
```

Make executable:
```bash
chmod +x verify.sh
./verify.sh
```

## Success Criteria

Deployment is ready when:
- ✅ All unit tests pass (100%)
- ✅ E2E tests pass
- ✅ Build completes without errors
- ✅ Firebase configured and tested
- ✅ PWA installable
- ✅ Performance targets met
- ✅ Cross-browser tested
- ✅ Mobile tested
- ✅ Offline mode works
- ✅ No console errors
- ✅ GitHub Actions workflow succeeds

## Continuous Monitoring

**After Deployment:**
1. Monitor Firebase usage daily
2. Check error logs weekly
3. Review user feedback
4. Update dependencies monthly
5. Run full verification quarterly

**Set up alerts for:**
- Firebase quota exceeded
- Deployment failures
- Authentication errors
- Database permission errors

## Documentation

Keep updated:
- [ ] README.md
- [ ] DEPLOYMENT_CHECKLIST.md
- [ ] FIREBASE_SETUP.md
- [ ] This VERIFICATION_GUIDE.md

## Support

For issues:
1. Check this guide
2. Review error logs
3. Check Firebase Console
4. Review GitHub Actions logs
5. Create GitHub issue if needed

---

**Last Updated:** March 2024
**Version:** 0.0.2
**Status:** Production Ready ✅
