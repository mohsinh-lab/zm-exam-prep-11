# Deployment Checklist for AcePrep 11+

## Pre-Deployment Verification

### 1. Test Coverage ✅

Run all tests to ensure functionality:

```bash
# Unit tests
npm test

# E2E tests
npm run test:ui
```

**Test Files:**
- ✅ `tests/auth.spec.js` - Authentication flows
- ✅ `tests/progressStore.test.js` - State management
- ✅ `tests/sync.spec.js` - Cloud sync
- ✅ `tests/timer.test.js` - Timer utility
- ✅ `tests/ui.spec.js` - E2E navigation
- ✅ `tests/adaptiveEngine.test.js` - Adaptive learning logic
- ✅ `tests/readinessEngine.test.js` - Readiness calculations
- ✅ `tests/router.test.js` - Routing functionality

### 2. Firebase Configuration ✅

**Required GitHub Secrets:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)

**Email Notification Secrets (for daily reports):**
- `MAIL_USERNAME` - Gmail address
- `MAIL_PASSWORD` - Gmail app password
- `PARENT_EMAIL` - Recipient email

**Verify Firebase Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Project Settings > General
4. Copy Web API Key and other credentials
5. Add to GitHub repository secrets

**Firebase Realtime Database Rules:**
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "progress": {
      "$email": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### 3. GitHub Pages Configuration ✅

**Repository Settings:**
1. Go to Settings > Pages
2. Source: GitHub Actions
3. Custom domain (optional): Configure if needed

**Vite Configuration:**
- Base path set to `/zm-exam-prep-11/` in `vite.config.js`
- Update if repository name changes

### 4. Build Verification

```bash
# Local build test
npm run build

# Preview production build
npm run preview
```

**Check build output:**
- `dist/` folder created
- Assets properly bundled
- Service worker included
- Manifest.json present

### 5. PWA Verification

**Manifest Check (`public/manifest.json`):**
- ✅ Name and short_name set
- ✅ Icons (192x192, 512x512, maskable)
- ✅ Start URL configured
- ✅ Display mode: standalone
- ✅ Theme colors set

**Service Worker Check (`public/sw.js`):**
- ✅ Cache strategy implemented
- ✅ Offline support
- ✅ Asset caching
- ✅ Notification support

**Test PWA Installation:**
1. Open deployed site in Chrome/Safari
2. Check for "Install App" prompt
3. Verify offline functionality
4. Test on mobile device (iPad/iPhone)

### 6. Cross-Browser Testing

Test on:
- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Firefox
- ✅ Edge

**Key Features to Test:**
- Authentication (Google OAuth)
- Quiz functionality
- Progress sync
- Service Worker
- Notifications
- Responsive design

### 7. Performance Checks

```bash
# Analyze bundle size
npm run build -- --mode production

# Check for large dependencies
npx vite-bundle-visualizer
```

**Targets:**
- Initial load < 3s on 3G
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s

### 8. Security Verification

**Firebase Security:**
- ✅ API keys in environment variables (not hardcoded)
- ✅ Database rules configured
- ✅ Authentication required for sensitive operations

**Content Security:**
- ✅ HTTPS only (GitHub Pages default)
- ✅ No sensitive data in localStorage
- ✅ XSS protection via proper escaping

## Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **GitHub Actions will:**
   - Install dependencies
   - Run build with Firebase env vars
   - Deploy to GitHub Pages
   - Available at: `https://mohsinh-lab.github.io/zm-exam-prep-11/`

3. **Monitor deployment:**
   - Go to Actions tab in GitHub
   - Check workflow status
   - View deployment logs

### Manual Deployment

```bash
# Build locally
npm run build

# Deploy dist folder to GitHub Pages
# (Use gh-pages package or manual upload)
```

## Post-Deployment Verification

### 1. Smoke Tests

Visit deployed URL and verify:
- ✅ App loads without errors
- ✅ Login/authentication works
- ✅ Quiz can be started and completed
- ✅ Progress saves correctly
- ✅ Parent dashboard accessible
- ✅ Cloud sync functional
- ✅ PWA installable

### 2. Firebase Connection Test

1. Open browser console
2. Check for Firebase connection logs
3. Verify no authentication errors
4. Test data sync by:
   - Completing a quiz
   - Checking Firebase console for data
   - Opening app on different device
   - Verifying progress synced

### 3. Error Monitoring

Check browser console for:
- No 404 errors for assets
- No CORS errors
- No Firebase permission errors
- No JavaScript errors

### 4. Mobile Testing

**iOS (Safari):**
1. Open site in Safari
2. Tap Share > Add to Home Screen
3. Open installed app
4. Verify full-screen mode
5. Test offline functionality

**Android (Chrome):**
1. Open site in Chrome
2. Tap "Install" prompt
3. Open installed app
4. Verify functionality

## Rollback Procedure

If deployment fails:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or redeploy specific commit:**
   ```bash
   git checkout <previous-commit-hash>
   git push origin main --force
   ```

3. **Check GitHub Actions:**
   - Re-run failed workflow
   - Check error logs
   - Fix issues and redeploy

## Monitoring & Maintenance

### Daily Checks
- ✅ Daily report emails sending
- ✅ No Firebase quota exceeded
- ✅ No deployment failures

### Weekly Checks
- ✅ Review error logs
- ✅ Check user feedback
- ✅ Monitor performance metrics

### Monthly Checks
- ✅ Update dependencies
- ✅ Review Firebase usage
- ✅ Backup database
- ✅ Review test coverage

## Troubleshooting

### Issue: Firebase not connecting
**Solution:**
- Verify secrets in GitHub repository
- Check Firebase console for project status
- Verify database rules allow read/write

### Issue: PWA not installing
**Solution:**
- Check manifest.json is accessible
- Verify HTTPS is enabled
- Check service worker registration
- Clear browser cache

### Issue: Assets not loading
**Solution:**
- Verify base path in vite.config.js
- Check asset paths in HTML
- Verify build output includes all assets

### Issue: Authentication failing
**Solution:**
- Check Firebase Auth is enabled
- Verify authorized domains in Firebase console
- Add deployed domain to authorized list

## Success Criteria

Deployment is successful when:
- ✅ All tests pass
- ✅ Build completes without errors
- ✅ App loads on deployed URL
- ✅ Firebase connection established
- ✅ Authentication works
- ✅ Quiz functionality operational
- ✅ Progress syncs across devices
- ✅ PWA installable on mobile
- ✅ No console errors
- ✅ Performance targets met

## Contact & Support

**Repository:** https://github.com/mohsinh-lab/zm-exam-prep-11
**Deployed URL:** https://mohsinh-lab.github.io/zm-exam-prep-11/
**Firebase Project:** aceprep-db

For issues, create a GitHub issue or contact the development team.
