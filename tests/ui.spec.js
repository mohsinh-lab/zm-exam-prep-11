
import { test, expect } from '@playwright/test';

test.describe('AcePrep 11+ Navigation', () => {
    test('should redirect to setup if not configured', async ({ page }) => {
        await page.goto('/');
        // Check if we are on the setup page
        await expect(page.locator('h1')).toContainText('Welcome to AcePrep 11+');
    });

    test('should complete setup and navigate to student home', async ({ page }) => {
        await page.goto('/#/setup');
        await page.fill('#setup-name', 'Test Student');
        await page.click('button:has-text("Start Preparing")');

        // Should be on home page
        await expect(page.locator('.page-title')).toContainText('Test Student!');
        await expect(page.locator('.nav-logo')).toContainText('AcePrep');
    });

    test('should navigate to parent dashboard', async ({ page }) => {
        await page.goto('/#/student/home');
        await page.click('button:has-text("Parents")');

        await expect(page.locator('.nav-logo')).toContainText('Parent Portal');
        await expect(page.locator('.page-title')).toContainText('Parent Dashboard');
    });
});
