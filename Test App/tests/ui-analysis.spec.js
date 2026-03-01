import { test, expect } from '@playwright/test';

test.describe('UI Analysis - AcePrep 11+', () => {
  test('should load and analyze splash screen', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5174/zm-exam-prep-11/');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of splash screen
    await page.screenshot({ path: 'Test App/tests/screenshots/01-splash-screen.png', fullPage: true });
    
    // Check if splash screen is visible
    const splashScreen = page.locator('#splash-screen');
    const isVisible = await splashScreen.isVisible().catch(() => false);
    
    console.log('=== SPLASH SCREEN ANALYSIS ===');
    console.log('Splash screen visible:', isVisible);
    
    if (isVisible) {
      const splashText = await splashScreen.textContent();
      console.log('Splash screen text:', splashText);
    }
    
    // Wait for app to load (max 10 seconds)
    await page.waitForSelector('#app', { timeout: 10000 }).catch(() => {
      console.log('App did not load within 10 seconds');
    });
    
    // Check current URL/route
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Take screenshot after load
    await page.screenshot({ path: 'Test App/tests/screenshots/02-after-load.png', fullPage: true });
  });

  test('should analyze login/onboarding screen', async ({ page }) => {
    await page.goto('http://localhost:5174/zm-exam-prep-11/');
    await page.waitForLoadState('networkidle');
    
    // Wait for splash to disappear and app to load
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for any animations
    
    // Take screenshot
    await page.screenshot({ path: 'Test App/tests/screenshots/03-login-screen.png', fullPage: true });
    
    // Analyze page structure
    const pageTitle = await page.title();
    console.log('\n=== LOGIN/ONBOARDING SCREEN ===');
    console.log('Page title:', pageTitle);
    
    // Check for login elements
    const hasGoogleButton = await page.locator('button:has-text("Google")').count() > 0;
    const hasLoginText = await page.locator('text=/login|sign in/i').count() > 0;
    const hasOnboardingText = await page.locator('text=/welcome|get started/i').count() > 0;
    
    console.log('Has Google login button:', hasGoogleButton);
    console.log('Has login text:', hasLoginText);
    console.log('Has onboarding text:', hasOnboardingText);
    
    // Get all visible text
    const bodyText = await page.locator('body').textContent();
    console.log('Visible text (first 500 chars):', bodyText.substring(0, 500));
    
    // Check for images
    const images = await page.locator('img').count();
    console.log('Number of images:', images);
    
    // Check navigation
    const navLinks = await page.locator('nav a, .nav a').count();
    console.log('Navigation links:', navLinks);
  });

  test('should analyze page structure and styling', async ({ page }) => {
    await page.goto('http://localhost:5174/zm-exam-prep-11/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('\n=== PAGE STRUCTURE ANALYSIS ===');
    
    // Check viewport
    const viewport = page.viewportSize();
    console.log('Viewport:', viewport);
    
    // Check for main sections
    const sections = {
      header: await page.locator('header').count(),
      nav: await page.locator('nav').count(),
      main: await page.locator('main').count(),
      footer: await page.locator('footer').count(),
      app: await page.locator('#app').count(),
    };
    console.log('Page sections:', sections);
    
    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log('Total buttons:', buttons);
    
    // Check for forms
    const forms = await page.locator('form').count();
    console.log('Total forms:', forms);
    
    // Check for links
    const links = await page.locator('a').count();
    console.log('Total links:', links);
    
    // Get computed styles of body
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
      };
    });
    console.log('Body styles:', bodyStyles);
  });

  test('should check for console errors', async ({ page }) => {
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('http://localhost:5174/zm-exam-prep-11/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n=== CONSOLE ANALYSIS ===');
    console.log('Total console messages:', consoleMessages.length);
    console.log('Console errors:', errors.length);
    
    if (errors.length > 0) {
      console.log('\nErrors found:');
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
    
    // Log first 10 console messages
    console.log('\nFirst 10 console messages:');
    consoleMessages.slice(0, 10).forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.type}] ${msg.text}`);
    });
  });

  test('should analyze network requests', async ({ page }) => {
    const requests = [];
    const failedRequests = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });
    
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure(),
      });
    });
    
    await page.goto('http://localhost:5174/zm-exam-prep-11/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== NETWORK ANALYSIS ===');
    console.log('Total requests:', requests.length);
    console.log('Failed requests:', failedRequests.length);
    
    // Group by resource type
    const byType = requests.reduce((acc, req) => {
      acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
      return acc;
    }, {});
    console.log('Requests by type:', byType);
    
    if (failedRequests.length > 0) {
      console.log('\nFailed requests:');
      failedRequests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`);
        console.log(`   Reason: ${req.failure?.errorText || 'Unknown'}`);
      });
    }
    
    // Check for Firebase requests
    const firebaseRequests = requests.filter(r => r.url.includes('firebase'));
    console.log('\nFirebase requests:', firebaseRequests.length);
  });

  test('should test navigation and routing', async ({ page }) => {
    await page.goto('http://localhost:5174/zm-exam-prep-11/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('\n=== NAVIGATION ANALYSIS ===');
    
    // Get current hash
    const initialHash = await page.evaluate(() => window.location.hash);
    console.log('Initial hash:', initialHash || '(none)');
    
    // Find all navigation links
    const navLinks = await page.locator('nav a, .nav a, a[href^="#"]').all();
    console.log('Navigation links found:', navLinks.length);
    
    // Get href of each link
    for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
      const href = await navLinks[i].getAttribute('href');
      const text = await navLinks[i].textContent();
      console.log(`${i + 1}. ${text?.trim()} -> ${href}`);
    }
    
    // Check if router is available
    const hasRouter = await page.evaluate(() => {
      return typeof window.router !== 'undefined';
    });
    console.log('Router available:', hasRouter);
    
    if (hasRouter) {
      const routerInfo = await page.evaluate(() => {
        return {
          currentRoute: window.router?.currentRoute,
          routes: Object.keys(window.router?.routes || {}),
        };
      });
      console.log('Current route:', routerInfo.currentRoute);
      console.log('Available routes:', routerInfo.routes);
    }
  });

  test('should analyze responsive design', async ({ page }) => {
    console.log('\n=== RESPONSIVE DESIGN ANALYSIS ===');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:5174/zm-exam-prep-11/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      console.log(`\n${viewport.name} (${viewport.width}x${viewport.height}):`);
      
      // Take screenshot
      await page.screenshot({ 
        path: `Test App/tests/screenshots/responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
      
      // Check if content is visible
      const appVisible = await page.locator('#app').isVisible();
      console.log('  App visible:', appVisible);
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log('  Horizontal scroll:', hasHorizontalScroll);
    }
  });
});
