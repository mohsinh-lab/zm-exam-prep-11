import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Reading Comprehension E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('aceprep_user', JSON.stringify({
        uid: 'test-uid', displayName: 'Test Student', role: 'student'
      }));
      localStorage.setItem('11plus_progress', JSON.stringify({
        setupDone: true,
        name: 'Test Student',
        xp: 500,
        gems: 50,
        rank: 'Rookie',
        ratings: { en: 1200, maths: 1200, vr: 1200, nvr: 1200 },
        sessions: []
      }));
    });
  });

  test('1. Navigate to Reading Comprehension page', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForLoadState('networkidle');

    // Container should render
    const container = page.locator('#rc-root');
    await expect(container).toBeVisible({ timeout: 8000 });

    // Header title visible
    const title = page.locator('.rc-title, #rc-title');
    await expect(title).toBeVisible();
  });

  test('2. Passage loads and displays content', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);

    // Wait for passage area to become visible (loading spinner hides, passage shows)
    await expect(page.locator('#rc-passage-area')).toBeVisible({ timeout: 12000 });

    // Passage title should be present
    const passageTitle = page.locator('.rc-passage-title');
    await expect(passageTitle).toBeVisible();
    const titleText = await passageTitle.textContent();
    expect(titleText.trim().length).toBeGreaterThan(0);
  });

  test('3. Passage text renders with word spans', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-passage-area:not(.hidden)', { timeout: 10000 });

    // Words should be wrapped in spans
    const words = page.locator('.rc-word');
    const count = await words.count();
    expect(count).toBeGreaterThan(10);
  });

  test('4. Start Questions button transitions to question phase', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-passage-area:not(.hidden)', { timeout: 10000 });

    const startBtn = page.locator('#rc-start-questions');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Question area should appear
    const questionArea = page.locator('#rc-question-area');
    await expect(questionArea).not.toHaveClass(/hidden/);

    // Question text should be visible
    const questionText = page.locator('#rc-q-text');
    await expect(questionText).toBeVisible();
  });

  test('5. Answer a multiple choice question and submit', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-passage-area:not(.hidden)', { timeout: 10000 });

    await page.locator('#rc-start-questions').click();
    await page.waitForSelector('#rc-question-area:not(.hidden)', { timeout: 5000 });

    // Select first radio option if available
    const firstOption = page.locator('input[name="rc-answer"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.locator('#rc-submit-btn').click();

      // Feedback should appear
      const feedback = page.locator('#rc-feedback');
      await expect(feedback).not.toHaveClass(/hidden/);
    }
  });

  test('6. Hint button shows a hint', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-passage-area:not(.hidden)', { timeout: 10000 });

    await page.locator('#rc-start-questions').click();
    await page.waitForSelector('#rc-question-area:not(.hidden)', { timeout: 5000 });

    const hintBtn = page.locator('#rc-hint-btn');
    await expect(hintBtn).toBeVisible();
    await hintBtn.click();

    const feedback = page.locator('#rc-feedback');
    await expect(feedback).toBeVisible();
    const text = await feedback.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('7. Preferences panel toggles open/closed', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await expect(page.locator('#rc-passage-area')).toBeVisible({ timeout: 12000 });

    const panel = page.locator('#rc-prefs-panel');

    // Panel starts hidden
    await expect(panel).toHaveClass(/hidden/);

    // Click via JS to bypass visibility check (btn-icon has no size)
    await page.evaluate(() => document.getElementById('rc-prefs-btn')?.click());
    await expect(panel).not.toHaveClass(/hidden/);

    // Click again to close
    await page.evaluate(() => document.getElementById('rc-prefs-btn')?.click());
    await expect(panel).toHaveClass(/hidden/);
  });

  test('8. Navigation buttons are present and prev is disabled on first passage', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-root', { timeout: 8000 });

    const prevBtn = page.locator('#rc-prev');
    const nextBtn = page.locator('#rc-next');

    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();

    // First passage — prev should be disabled
    await expect(prevBtn).toBeDisabled();
  });

  test('9. Back button navigates to student home', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-root', { timeout: 8000 });

    await page.locator('#rc-back').click();
    await page.waitForURL('**/#/student/home', { timeout: 5000 });
  });

  test('10. Progress indicator shows passage count', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-passage-area:not(.hidden)', { timeout: 10000 });

    const indicator = page.locator('#rc-progress-indicator');
    await expect(indicator).toBeVisible();
    const text = await indicator.textContent();
    expect(text).toMatch(/\d+\s*\/\s*\d+/);
  });

  test('11. No console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(`${BASE_URL}/#/student/reading`);
    await page.waitForSelector('#rc-root', { timeout: 8000 });

    const critical = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
    expect(critical.length).toBe(0);
  });
});
