# Deployment Test Checklist

## 🌐 Deployed URL
https://mohsinh-lab.github.io/zm-exam-prep-11/

## ✅ Quick Verification Steps

### 1. Basic Loading Test
- [ ] Open the URL in your browser
- [ ] Page loads without errors
- [ ] Splash screen appears ("Loading your learning journey...")
- [ ] App loads after splash screen

### 2. Console Check (F12)
Open browser DevTools (F12) and check Console tab:
- [ ] No red errors
- [ ] Firebase initialization logs appear
- [ ] Service Worker registration message: "SW registered"
- [ ] No 404 errors for assets

**Expected logs:**
```
SW registered! ServiceWorkerRegistration {...}
Firebase initialized
```

### 3. Network Tab Check
Open DevTools > Network tab:
- [ ] All assets load (200 status)
- [ ] No 404 errors
- [ ] Firebase CDN loads successfully
- [ ] Service worker file loads: `/zm-exam-prep-11/sw.js`

### 4. Application Tab Check
Open DevTools > Application tab:
- [ ] **Service Worker**: Active and running
- [ ] **Manifest**: Loaded correctly
- [ ] **Local Storage**: `11plus_progress` key exists
- [ ] **Cache Storage**: Assets cached

### 5. Authentication Test
- [ ] Navigate to login page (should auto-redirect if not logged in)
- [ ] Try PIN login: `2016` (student) or `0786` (parent)
- [ ] Login successful
- [ ] Redirects to appropriate dashboard

### 6. Student Features Test
After logging in as student:
- [ ] **Home Dashboard loads**
  - Student name displays
  - XP and level shown
  - Streak counter visible
  - Exam countdown displays (days to Sept 15, 2026)
  - Subject cards render (VR, NVR, English, Maths)
  - Readiness score calculated

- [ ] **Subject Cards**
  - Click on any subject (e.g., Verbal Reasoning)
  - Quiz page loads
  - Questions display
  - Can select answers
  - Timer works (if visible)

- [ ] **Quiz Functionality**
  - Answer some questions
  - Complete quiz
  - Results page shows
  - Score displayed correctly
  - XP awarded
  - Can return to home

- [ ] **Navigation**
  - Home button works
  - Plan page accessible
  - Badges page accessible
  - Parent portal link (if not student-only)

### 7. Parent Features Test
Login as parent (PIN: `0786`):
- [ ] Parent dashboard loads
- [ ] Student progress visible
- [ ] Session history displays
- [ ] Can switch to student view

### 8. PWA Installation Test

**Desktop (Chrome/Edge):**
- [ ] Install prompt appears (or in address bar)
- [ ] Click install
- [ ] App installs successfully
- [ ] Open installed app
- [ ] Runs in standalone mode

**Mobile (iOS Safari):**
- [ ] Open site in Safari
- [ ] Tap Share button
- [ ] Select "Add to Home Screen"
- [ ] App icon appears on home screen
- [ ] Open from home screen
- [ ] Runs in full-screen mode

### 9. Offline Test
- [ ] Open app while online
- [ ] Disconnect internet
- [ ] Navigate between pages
- [ ] App still works (cached pages)
- [ ] Reconnect internet
- [ ] Sync resumes

### 10. Firebase Sync Test
- [ ] Complete a quiz
- [ ] Check Firebase Console > Realtime Database
- [ ] Verify data appears under `progress/{email}/`
- [ ] Open app on different device (same account)
- [ ] Progress synced correctly

### 11. Responsive Design Test
Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Layout adapts properly
- [ ] No horizontal scroll
- [ ] All buttons clickable

### 12. Recent Updates Verification

**New Test Files (Backend - Not Visible to Users):**
These are for development only, not user-facing:
- ✅ adaptiveEngine.test.js
- ✅ readinessEngine.test.js
- ✅ router.test.js

**Updated Configuration:**
- [ ] Check package.json has new test scripts (dev only)
- [ ] Coverage configuration in vite.config.js (dev only)

**Documentation (Not User-Facing):**
- ✅ DEPLOYMENT_CHECKLIST.md
- ✅ FIREBASE_SETUP.md
- ✅ VERIFICATION_GUIDE.md

**Note:** The recent updates are primarily:
1. **Test coverage improvements** (backend/development)
2. **Documentation** (for developers)
3. **Configuration updates** (build process)

These don't change the user-facing functionality, so the app should work exactly as before, but now with better test coverage and documentation.

## 🔍 What to Look For

### Signs of Success ✅
- App loads quickly
- No console errors
- Firebase connects
- Authentication works
- Quiz functionality operational
- Progress saves
- PWA installable
- Offline mode works

### Signs of Issues ❌
- Red errors in console
- 404 errors for assets
- Firebase connection failed
- Authentication not working
- Quiz doesn't load
- Progress not saving
- Can't install as PWA

## 🐛 Common Issues & Fixes

### Issue: Firebase Not Connecting
**Check:**
- Console for Firebase errors
- GitHub secrets are configured
- Firebase Console shows project is active

**Fix:**
- Verify all `VITE_FIREBASE_*` secrets in GitHub
- Check Firebase Console > Project Settings
- Ensure authorized domains include `mohsinh-lab.github.io`

### Issue: 404 Errors
**Check:**
- Network tab for failed requests
- Base path in vite.config.js: `/zm-exam-prep-11/`

**Fix:**
- Verify repository name matches base path
- Check GitHub Pages settings

### Issue: Service Worker Not Registering
**Check:**
- HTTPS is enabled (GitHub Pages default)
- Service worker file accessible: `/zm-exam-prep-11/sw.js`

**Fix:**
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check service worker in DevTools > Application

### Issue: PWA Not Installing
**Check:**
- Manifest.json accessible
- All required icons present
- HTTPS enabled

**Fix:**
- Check manifest in DevTools > Application > Manifest
- Verify icons load (192x192, 512x512)
- Clear cache and retry

## 📊 Test Results Template

Copy this and fill in your results:

```
=== DEPLOYMENT TEST RESULTS ===
Date: [DATE]
Tester: [YOUR NAME]
Browser: [Chrome/Safari/Firefox/Edge]
Device: [Desktop/Mobile/Tablet]

✅ PASSED:
- [ ] Basic loading
- [ ] Console clean
- [ ] Authentication
- [ ] Quiz functionality
- [ ] Firebase sync
- [ ] PWA installation
- [ ] Offline mode
- [ ] Responsive design

❌ FAILED:
- [ ] [List any failures]

📝 NOTES:
[Any observations or issues]

🎯 OVERALL STATUS: [PASS/FAIL]
```

## 🚀 Next Steps After Testing

If all tests pass:
- ✅ Deployment successful!
- ✅ App is production-ready
- ✅ Share URL with users

If tests fail:
1. Document the failures
2. Check error logs
3. Review GitHub Actions logs
4. Fix issues and redeploy

---

**Deployment URL:** https://mohsinh-lab.github.io/zm-exam-prep-11/
**GitHub Actions:** https://github.com/mohsinh-lab/zm-exam-prep-11/actions
**Firebase Console:** https://console.firebase.google.com/

**Good luck with testing! 🎉**
