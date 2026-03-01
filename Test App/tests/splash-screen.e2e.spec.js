import { test, expect } from '@playwright/test';

test.describe('Splash Screen Bug Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('Property 1: Splash screen should fade out and be removed after initialization', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Verify splash screen exists initially
    const splash = page.locator('#splash');
    await expect(splash).toBeVisible();
    
    // Wait 1000ms and check if fade-out class is added
    await page.waitForTimeout(1100); // 1000ms + 100ms buffer
    const hasFadeOut = await splash.evaluate(el => el.classList.contains('fade-out'));
    expect(hasFadeOut).toBe(true);
    
    // Wait for transition to complete (600ms) and verify element is removed
    await page.waitForTimeout(700); // 600ms + 100ms buffer
    const splashExists = await page.locator('#splash').count();
    expect(splashExists).toBe(0);
    
    // Verify user can see the application interface
    const app = page.locator('#app');
    await expect(app).toBeVisible();
  });

  test('Property 2: Router initialization should work correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Wait for splash screen to disappear
    await page.waitForTimeout(2000);
    
    // Verify router initialized and redirected to setup (first time user)
    await expect(page).toHaveURL(/.*#\/setup/);
    await expect(page.locator('h1')).toContainText('Welcome to AcePrep 11+');
  });

  test('Property 2: Auth redirect should work correctly for unauthenticated users', async ({ page }) => {
    await page.goto('http://localhost:5173/#/student/home');
    
    // Wait for splash screen to disappear
    await page.waitForTimeout(2000);
    
    // Should redirect to login since user is not authenticated
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test('Property 2: Setup redirect should work correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Wait for splash screen to disappear
    await page.waitForTimeout(2000);
    
    // Should redirect to setup if setupDone is false
    await expect(page).toHaveURL(/.*#\/setup/);
  });

  test('Property 2: Navigation should render correctly after splash screen', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Wait for splash screen to disappear
    await page.waitForTimeout(2000);
    
    // Verify navigation elements are present
    const navbar = page.locator('#navbar-anchor');
    await expect(navbar).toBeVisible();
    
    const routerView = page.locator('#router-view');
    await expect(routerView).toBeVisible();
  });

  test('Splash screen works on first load', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Splash screen should be visible initially
    const splash = page.locator('#splash');
    await expect(splash).toBeVisible();
    
    // Wait for splash to disappear
    await page.waitForTimeout(2000);
    
    // Splash should be gone
    const splashCount = await page.locator('#splash').count();
    expect(splashCount).toBe(0);
    
    // Setup page should be visible
    await expect(page.locator('h1')).toContainText('Welcome to AcePrep 11+');
  });

  test('Splash screen works with direct route navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/#/setup');
    
    // Splash screen should be visible initially
    const splash = page.locator('#splash');
    await expect(splash).toBeVisible();
    
    // Wait for splash to disappear
    await page.waitForTimeout(2000);
    
    // Splash should be gone and setup page visible
    const splashCount = await page.locator('#splash').count();
    expect(splashCount).toBe(0);
    await expect(page.locator('h1')).toContainText('Welcome to AcePrep 11+');
  });

  test('User can interact with app after splash screen removal', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Wait for splash to disappear
    await page.waitForTimeout(2000);
    
    // Fill in setup form
    await page.fill('#setup-name', 'Test Student');
    await page.click('button:has-text("Start Preparing")');
    
    // Should navigate to student home
    await expect(page).toHaveURL(/.*#\/student\/home/);
  });
});
