# Splash Screen Stuck - Debugging Guide

## Issue
The deployed app shows the splash screen ("Loading your learning journey...") but doesn't proceed to the main app.

## Likely Causes

### 1. JavaScript Not Loading (Most Likely)
The built JavaScript bundle might not be loading correctly.

**Check:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - `Failed to load module script`
   - `404 Not Found` for JavaScript files
   - `CORS error`

**Expected in Console:**
```
SW registered! ServiceWorkerRegistration {...}
Firebase initialized
```

### 2. Build Path Issue
Vite builds to `dist/` but the paths might be incorrect.

**Check Network Tab:**
- Look for failed requests (red, 404 status)
- Check if `/zm-exam-prep-11/assets/*.js` files load
- Verify base path is correct

### 3. Service Worker Conflict
Old service worker might be caching old version.

**Fix:**
1. Open DevTools > Application > Service Workers
2. Click "Unregister" on any service workers
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Clear cache

### 4. Firebase Configuration Missing
If Firebase env vars aren't set, app might fail silently.

**Check:**
- GitHub Actions logs for build warnings
- Console for Firebase errors

## Quick Diagnostic Steps

### Step 1: Open Browser Console
```
1. Visit: https://mohsinh-lab.github.io/zm-exam-prep-11/
2. Press F12
3. Go to Console tab
4. Take screenshot of any errors
```

### Step 2: Check Network Tab
```
1. Open DevTools > Network tab
2. Refresh page (Ctrl+R)
3. Look for:
   - Red/failed requests
   - 404 errors
   - JavaScript files loading
```

### Step 3: Check Application Tab
```
1. DevTools > Application
2. Check Service Workers status
3. Check Local Storage
4. Check if manifest loads
```

## Common Fixes

### Fix 1: Clear Cache and Hard Refresh
```
1. Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or: DevTools > Network > Disable cache checkbox
3. Refresh page
```

### Fix 2: Unregister Service Worker
```
1. DevTools > Application > Service Workers
2. Click "Unregister"
3. Refresh page
```

### Fix 3: Check GitHub Actions Build
```
1. Go to: https://github.com/mohsinh-lab/zm-exam-prep-11/actions
2. Click latest workflow run
3. Check "Build" step for errors
4. Look for warnings about missing env vars
```

### Fix 4: Verify Base Path
The vite.config.js has:
```javascript
base: '/zm-exam-prep-11/'
```

This should match your repository name. If you renamed the repo, update this.

## Expected Behavior

**What should happen:**
1. Splash screen shows (✓ You see this)
2. JavaScript loads and executes
3. Firebase initializes
4. Router checks auth state
5. Redirects to login or home
6. Splash screen fades out
7. Main app appears

**Currently stuck at step 2** - JavaScript not executing.

## Debugging Commands

### Check if JavaScript is loading:
Open Console and type:
```javascript
window.router
```

**Expected:** Router object
**If undefined:** JavaScript didn't load

### Check if Firebase loaded:
```javascript
window.firebase
```

**Expected:** Firebase object or undefined (it's in module scope)

### Check localStorage:
```javascript
localStorage.getItem('11plus_progress')
```

**Expected:** JSON string or null

## Manual Test in Local Build

To verify the build works locally:

```bash
cd "Test App"
npm run build
npm run preview
```

Then open: http://localhost:4173/zm-exam-prep-11/

If it works locally but not on GitHub Pages, it's a deployment issue.

## Likely Solution

Based on the symptoms, the most likely issue is:

**The JavaScript bundle isn't loading due to incorrect paths after build.**

### To Fix:

1. **Check GitHub Actions logs** for build errors
2. **Verify the dist/ folder** has the correct structure
3. **Check if assets are in the right location**

### Verify Build Output:

After `npm run build`, the dist/ folder should have:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── manifest.json
├── sw.js
└── icons/
```

The index.html should reference:
```html
<script type="module" src="/zm-exam-prep-11/assets/index-[hash].js"></script>
```

## Next Steps

1. **Open browser console** and share any errors you see
2. **Check Network tab** for failed requests
3. **Try hard refresh** (Ctrl+Shift+R)
4. **Unregister service worker** if present
5. **Wait 2-3 minutes** for latest deployment to propagate

If still stuck, share:
- Console errors (screenshot)
- Network tab (failed requests)
- GitHub Actions logs (if build failed)

---

**Most likely fix:** Hard refresh (Ctrl+Shift+R) to clear cache and load new deployment.
