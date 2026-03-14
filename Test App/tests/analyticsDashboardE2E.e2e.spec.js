import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ANALYTICS_URL = `${BASE_URL}/#/parent/analytics`;

const MOCK_PROGRESS = {
  setupDone: true,
  name: 'Test Student',
  xp: 2400,
  gems: 300,
  rank: 'Champion',
  ratings: { en: 1350, maths: 1280, vr: 1400, nvr: 1200 },
  topicMastery: {
    en: { Comprehension: { correct: 9, total: 10 }, Vocabulary: { correct: 7, total: 9 } },
    maths: { Algebra: { correct: 6, total: 8 }, Geometry: { correct: 8, total: 10 } },
    vr: { Analogies: { correct: 7, total: 8 } },
    nvr: { Patterns: { correct: 5, total: 9 } }
  },
  sessions: [
    { date: new Date(Date.now() - 86400000).toISOString(), subject: 'maths', score: 75, total: 10 },
    { date: new Date(Date.now() - 172800000).toISOString(), subject: 'en', score: 80, total: 10 },
    { date: new Date(Date.now() - 259200000).toISOString(), subject: 'vr', score: 70, total: 10 },
    { date: new Date(Date.now() - 345600000).toISOString(), subject: 'nvr', score: 65, total: 10 },
  ],
  analyticsGoals: []
};

test.describe('Analytics Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((progress) => {
      localStorage.clear();
      localStorage.setItem('aceprep_user', JSON.stringify({
        uid: 'parent-uid', displayName: 'Test Parent', role: 'parent'
      }));
      localStorage.setItem('11plus_progress', JSON.stringify(progress));
    }, MOCK_PROGRESS);
  });

  test('1. Analytics dashboard renders', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    // Main heading
    const heading = page.locator('h1:has-text("Analytics Dashboard")');
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('2. Key metrics cards are displayed', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    // Should show readiness score, avg accuracy, total XP, questions done
    await expect(page.locator('text=Readiness Score')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Avg Accuracy')).toBeVisible();
    await expect(page.locator('text=Total XP')).toBeVisible();
    await expect(page.locator('text=Questions Done')).toBeVisible();
  });

  test('3. Radar chart SVG renders', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 8000 });

    // Polygon (data shape) should exist
    const polygon = page.locator('polygon');
    await expect(polygon).toBeVisible();
  });

  test('4. Trend chart renders with period filter buttons', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    // Period filter buttons
    for (const period of ['7d', '14d', '30d', '90d']) {
      await expect(page.locator(`button:has-text("${period}")`)).toBeVisible({ timeout: 8000 });
    }
  });

  test('5. Trend period filter changes active state', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    const btn7d = page.locator('button:has-text("7d")');
    await btn7d.click();

    // Page re-renders with 7d period stored
    await page.waitForLoadState('networkidle');
    const stored = await page.evaluate(() => localStorage.getItem('aad_trend_period'));
    expect(stored).toBe('7');
  });

  test('6. Exam readiness gauge renders', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Exam Readiness')).toBeVisible({ timeout: 8000 });

    // Gauge SVG circle
    const circles = page.locator('circle');
    const count = await circles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('7. Goals section is visible', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3:has-text("Goals")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('summary:has-text("Add Goal")')).toBeVisible();
  });

  test('8. Add a goal via the form', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    // Open the Add Goal details
    const addGoalSummary = page.locator('summary:has-text("Add Goal")');
    await expect(addGoalSummary).toBeVisible({ timeout: 8000 });
    await addGoalSummary.click();

    // Fill in target
    const targetInput = page.locator('#aad-goal-target');
    await expect(targetInput).toBeVisible({ timeout: 3000 });
    await targetInput.fill('80');

    // Save
    const saveBtn = page.locator('button:has-text("Save Goal")');
    await saveBtn.click();

    // Page re-renders — goal should appear
    await page.waitForLoadState('networkidle');
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('11plus_progress')));
    expect(progress.analyticsGoals.length).toBeGreaterThan(0);
  });

  test('9. Alerts section renders', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3:has-text("Alerts")')).toBeVisible({ timeout: 8000 });
  });

  test('10. CSV export button is present', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    const exportBtn = page.locator('button:has-text("Export CSV")');
    await expect(exportBtn).toBeVisible({ timeout: 8000 });
  });

  test('11. CSV export triggers download', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export CSV")').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/aceprep-analytics.*\.csv/);
  });

  test('12. Back to Parent Portal button navigates correctly', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Parent Portal")').click();
    await page.waitForURL('**/#/parent/home', { timeout: 5000 });
  });

  test('13. No critical console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    const critical = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
    expect(critical.length).toBe(0);
  });

  test('14. Mobile layout renders without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1:has-text("Analytics Dashboard")');
    await expect(heading).toBeVisible({ timeout: 8000 });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(395);
  });
});
