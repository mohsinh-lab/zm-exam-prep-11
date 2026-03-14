# Parent Portal Manual Testing Guide

**Status:** MVP Complete - Ready for Manual Testing  
**Test Date:** March 14, 2026  
**Tester:** [Your Name]  
**Environment:** https://mohsinh-lab.github.io/zm-exam-prep-11/

---

## Pre-Testing Setup

### 1. Clear Browser Data
```
Chrome/Edge:
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "All time"
3. Check "Cookies and other site data"
4. Check "Cached images and files"
5. Click "Clear data"
```

### 2. Open Developer Tools
```
Press F12 or Ctrl+Shift+I (Windows)
Press Cmd+Option+I (Mac)
```

### 3. Set Up Test Account
- Use Google account for testing
- Have a parent account ready
- Have a student account linked

---

## Test Scenarios

### Scenario 1: Parent Login & Dashboard Access

**Steps:**
1. Navigate to https://mohsinh-lab.github.io/zm-exam-prep-11/
2. Click "Login" button
3. Select "Google" authentication
4. Sign in with parent Google account
5. Select "Parent" role on onboarding
6. Navigate to Parent Portal

**Expected Results:**
- ✅ Login completes without errors
- ✅ Parent Portal loads successfully
- ✅ Dashboard displays student information
- ✅ No console errors (F12 → Console tab)

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 2: Student Progress Overview

**Steps:**
1. On Parent Portal dashboard
2. Look for student name, XP, gems, rank
3. Verify all values are displayed
4. Check if progress bar is visible

**Expected Results:**
- ✅ Student name displayed correctly
- ✅ XP value shown (e.g., "1500 XP")
- ✅ Gems value shown (e.g., "250 💎")
- ✅ Rank displayed (e.g., "Gym Leader")
- ✅ Progress bar shows completion percentage

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 3: Radar Chart Visualization

**Steps:**
1. Scroll down on Parent Portal dashboard
2. Look for radar/spider chart
3. Verify all 4 subjects are labeled
4. Hover over chart points to see values
5. Check if chart is responsive

**Expected Results:**
- ✅ Radar chart is visible
- ✅ All 4 subjects labeled: Maths, English, VR, NVR
- ✅ Chart shows skill levels (0-100%)
- ✅ Hover tooltips show exact percentages
- ✅ Chart is responsive on different screen sizes

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 4: Create New Goal

**Steps:**
1. Look for "Create Goal" or "New Goal" button
2. Click the button
3. Select goal type (Sessions, XP, or Score)
4. Enter goal value (e.g., 500 XP)
5. Set reward gems (e.g., 50 gems)
6. Click "Create" or "Save"

**Expected Results:**
- ✅ Goal creation form appears
- ✅ All fields are editable
- ✅ Goal is created successfully
- ✅ Goal appears in goals list
- ✅ Goal appears on student dashboard as "Special Mission"

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 5: View and Manage Goals

**Steps:**
1. On Parent Portal, find goals/missions section
2. View list of active goals
3. Click on a goal to see details
4. Look for "Cancel Goal" or "Remove" button
5. Try canceling a goal (optional)

**Expected Results:**
- ✅ All active goals are listed
- ✅ Goal details show: type, target, reward
- ✅ Cancel button is visible
- ✅ Canceling goal removes it from list
- ✅ Goal is removed from student dashboard

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 6: PDF Export

**Steps:**
1. Look for "Export as PDF" or "Download Report" button
2. Click the button
3. Wait for PDF to generate (should be <5 seconds)
4. PDF should download automatically
5. Open the downloaded PDF file
6. Verify PDF contains:
   - Student name
   - Date
   - Radar chart
   - Progress summary
   - Goals/missions

**Expected Results:**
- ✅ PDF generation completes quickly (<5 seconds)
- ✅ PDF downloads with correct filename
- ✅ PDF opens without errors
- ✅ PDF is readable and well-formatted
- ✅ All expected content is included
- ✅ PDF is printable

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 7: Real-Time Synchronization

**Steps:**
1. Open Parent Portal on one device/tab
2. Have student complete a quiz on another device/tab
3. Watch Parent Portal for updates
4. Check if XP, gems, and rank update automatically
5. Refresh page and verify data persists

**Expected Results:**
- ✅ Parent Portal updates within 1 second
- ✅ XP increases after student completes quiz
- ✅ Gems update if earned
- ✅ Rank changes if applicable
- ✅ Data persists after page refresh
- ✅ No manual refresh needed

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 8: Leaderboard View

**Steps:**
1. Look for "Leaderboard" or "Rankings" section
2. Verify student's rank is displayed
3. Check if top 10 students are shown
4. Verify student's position in leaderboard
5. Check if XP values are accurate

**Expected Results:**
- ✅ Leaderboard is visible
- ✅ Student's rank is displayed correctly
- ✅ Top 10 students are listed
- ✅ Student's position matches their XP
- ✅ XP values are accurate

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 9: Language Toggle

**Steps:**
1. Look for language toggle button (usually "EN" or "UR")
2. Click to toggle language
3. Verify all text changes to selected language
4. Check if layout changes to RTL for Urdu
5. Toggle back to English
6. Verify language preference persists after refresh

**Expected Results:**
- ✅ Language toggle button is visible
- ✅ All text translates correctly
- ✅ RTL layout applies for Urdu
- ✅ LTR layout applies for English
- ✅ Language preference persists
- ✅ No layout issues in either language

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 10: Mobile Responsiveness

**Steps:**
1. Open Parent Portal on mobile device (or use browser DevTools)
2. Set viewport to mobile size (390x844 for iPhone)
3. Verify all content is visible
4. Check if buttons are touch-friendly (large enough)
5. Verify no horizontal scrolling
6. Test on tablet size (1024x768)
7. Test on desktop size (1920x1080)

**Expected Results:**
- ✅ Content is readable on mobile
- ✅ Buttons are at least 44x44px (touch-friendly)
- ✅ No horizontal scrolling on mobile
- ✅ Layout adapts to tablet size
- ✅ Layout adapts to desktop size
- ✅ All features work on all screen sizes

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 11: Keyboard Navigation

**Steps:**
1. Open Parent Portal
2. Press Tab key repeatedly
3. Verify focus moves through interactive elements
4. Check if focus indicator is visible
5. Press Enter on buttons to activate them
6. Use arrow keys if applicable

**Expected Results:**
- ✅ Tab key moves focus through elements
- ✅ Focus indicator is clearly visible
- ✅ All buttons are keyboard accessible
- ✅ Enter key activates buttons
- ✅ No keyboard traps (can always move focus)

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 12: Screen Reader Compatibility

**Steps:**
1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Navigate Parent Portal with screen reader
3. Verify all content is announced
4. Check if buttons have descriptive labels
5. Verify form labels are associated with inputs

**Expected Results:**
- ✅ Screen reader announces all content
- ✅ Buttons have descriptive labels
- ✅ Form labels are properly associated
- ✅ Navigation is logical
- ✅ No missing alt text for images

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 13: Performance - Load Time

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Measure time until page is fully loaded
5. Check if all resources load successfully

**Expected Results:**
- ✅ Page loads in <2 seconds
- ✅ All resources load successfully
- ✅ No 404 errors
- ✅ No failed requests

**Pass/Fail:** ☐ Pass ☐ Fail

**Load Time:** _____ seconds

**Notes:**
```
[Add any observations here]
```

---

### Scenario 14: Performance - Radar Chart Render

**Steps:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Scroll to radar chart
5. Stop recording
6. Check render time

**Expected Results:**
- ✅ Chart renders smoothly
- ✅ Render time <500ms
- ✅ No jank or stuttering
- ✅ 60fps animation (if animated)

**Pass/Fail:** ☐ Pass ☐ Fail

**Render Time:** _____ ms

**Notes:**
```
[Add any observations here]
```

---

### Scenario 15: Error Handling - Offline Mode

**Steps:**
1. Open Parent Portal
2. Open DevTools (F12)
3. Go to Network tab
4. Click "Offline" checkbox
5. Try to interact with page
6. Go back online
7. Verify page recovers

**Expected Results:**
- ✅ Page shows offline indicator
- ✅ Cached data is still visible
- ✅ No critical errors
- ✅ Page recovers when online
- ✅ Data syncs when connection restored

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 16: Navigation - Switch to Student View

**Steps:**
1. On Parent Portal
2. Look for "← Student View" or similar button
3. Click to switch to student view
4. Verify student dashboard loads
5. Click back to parent portal

**Expected Results:**
- ✅ Button is visible and clickable
- ✅ Navigation to student view works
- ✅ Student dashboard loads correctly
- ✅ Can navigate back to parent portal

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 17: Data Persistence - Page Refresh

**Steps:**
1. On Parent Portal, note current values (XP, gems, rank)
2. Refresh page (F5 or Cmd+R)
3. Verify all values are the same
4. Check if goals are still visible
5. Verify language preference persists

**Expected Results:**
- ✅ All values persist after refresh
- ✅ Goals are still visible
- ✅ Language preference is maintained
- ✅ No data loss

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

### Scenario 18: Browser Compatibility

**Test on each browser:**

#### Chrome/Chromium
- ✅ All features work
- ✅ No console errors
- ✅ Performance is good

#### Firefox
- ✅ All features work
- ✅ No console errors
- ✅ Performance is good

#### Safari
- ✅ All features work
- ✅ No console errors
- ✅ Performance is good

#### Edge
- ✅ All features work
- ✅ No console errors
- ✅ Performance is good

**Pass/Fail:** ☐ Pass ☐ Fail

**Notes:**
```
[Add any observations here]
```

---

## Summary

### Overall Status
- ✅ All tests passed
- ⚠️ Some tests failed (see below)
- ❌ Critical issues found

### Tests Passed: _____ / 18

### Tests Failed: _____ / 18

### Critical Issues:
```
[List any critical issues that block functionality]
```

### Minor Issues:
```
[List any minor issues or improvements]
```

### Recommendations:
```
[Add any recommendations for improvements]
```

---

## Sign-Off

**Tester Name:** ___________________  
**Date:** ___________________  
**Time Spent:** _____ hours  
**Overall Status:** ☐ Pass ☐ Fail ☐ Partial

**Signature:** ___________________

---

## Next Steps

1. ☐ Document all issues found
2. ☐ Create GitHub issues for bugs
3. ☐ Schedule bug fix sprint
4. ☐ Plan Phase 2 features
5. ☐ Begin AI Voice Tutor implementation

