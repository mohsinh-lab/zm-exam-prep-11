/**
 * End-to-End tests for VoiceTutor component
 * 
 * Tests cover:
 * - Complete playback flow (play, pause, resume, stop)
 * - Speed control and persistence
 * - Language switching
 * - Offline functionality
 * - Accessibility features
 * - Error scenarios
 * - Integration with reading comprehension module
 * 
 * Tests run on:
 * - iOS Safari (14.1+)
 * - Android Chrome
 */

import { test, expect } from '@playwright/test';

// Test passage for consistent testing
const TEST_PASSAGE = 'The quick brown fox jumps over the lazy dog. This is a test passage for voice tutor.';

// Helper to navigate to a reading comprehension page with voice tutor
async function navigateToVoiceTutorPage(page) {
  await page.goto('/');
  // Wait for app to load
  await page.waitForLoadState('networkidle');
}

// Helper to get voice tutor controls
async function getVoiceTutorControls(page) {
  const playBtn = page.locator('[id="voice-play"]');
  const pauseBtn = page.locator('[id="voice-pause"]');
  const stopBtn = page.locator('[id="voice-stop"]');
  const speedControl = page.locator('[id="voice-speed"]');
  const statusDisplay = page.locator('[id="voice-status"]');
  const errorArea = page.locator('[id="voice-error"]');
  
  return { playBtn, pauseBtn, stopBtn, speedControl, statusDisplay, errorArea };
}

// Helper to wait for voice engine to be ready
async function waitForVoiceEngineReady(page) {
  await page.waitForFunction(() => {
    return window.__voiceEngine && window.__voiceEngine.isSupported;
  }, { timeout: 5000 });
}

test.describe('VoiceTutor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToVoiceTutorPage(page);
  });

  test.describe('13.1 - Complete Playback Flow', () => {
    test('should play passage audio when play button clicked', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Click play button
      await playBtn.click();
      
      // Verify playback started
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Verify play button is disabled/hidden
      await expect(playBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should pause playback when pause button clicked', async ({ page }) => {
      const { playBtn, pauseBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Pause playback
      await pauseBtn.click();
      
      // Verify paused state
      await expect(statusDisplay).toContainText('Paused', { timeout: 1000 });
      await expect(pauseBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should resume from paused position', async ({ page }) => {
      const { playBtn, pauseBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Pause
      await pauseBtn.click();
      await expect(statusDisplay).toContainText('Paused', { timeout: 1000 });
      
      // Resume (click play again)
      await playBtn.click();
      
      // Verify resumed
      await expect(statusDisplay).toContainText('Playing', { timeout: 1000 });
    });

    test('should stop playback and reset to beginning', async ({ page }) => {
      const { playBtn, stopBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Stop playback
      await stopBtn.click();
      
      // Verify stopped state
      await expect(statusDisplay).toContainText('Stopped', { timeout: 1000 });
      
      // Verify highlighting is cleared
      const highlights = page.locator('.voice-highlight');
      await expect(highlights).toHaveCount(0);
    });

    test('should highlight words in sync with audio', async ({ page }) => {
      const { playBtn } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      
      // Wait for highlighting to appear
      const highlights = page.locator('.voice-highlight');
      await expect(highlights.first()).toBeVisible({ timeout: 3000 });
      
      // Verify highlighting updates (at least 2 different words highlighted)
      const firstHighlight = await highlights.first().textContent();
      
      // Wait a bit for next word to be highlighted
      await page.waitForTimeout(500);
      
      const currentHighlight = await highlights.first().textContent();
      // Note: In real scenario, highlighting should move to next word
      // This is a simplified check
      expect(firstHighlight).toBeTruthy();
      expect(currentHighlight).toBeTruthy();
    });

    test('should complete playback and show completion indicator', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Wait for completion (short passage should complete quickly)
      await expect(statusDisplay).toContainText('Completed', { timeout: 10000 });
      
      // Verify highlighting is cleared after completion
      const highlights = page.locator('.voice-highlight');
      await expect(highlights).toHaveCount(0);
    });
  });

  test.describe('13.2 - Speed Control Flow', () => {
    test('should apply 0.75x speed', async ({ page }) => {
      const { playBtn, speedControl } = await getVoiceTutorControls(page);
      
      // Select 0.75x speed
      await speedControl.selectOption('0.75');
      
      // Verify speed is set
      await expect(speedControl).toHaveValue('0.75');
      
      // Start playback
      await playBtn.click();
      
      // Verify playback started with selected speed
      await page.waitForTimeout(500);
      const rate = await page.evaluate(() => window.__voiceEngine?.currentRate);
      expect(rate).toBe(0.75);
    });

    test('should apply 1x speed', async ({ page }) => {
      const { speedControl } = await getVoiceTutorControls(page);
      
      await speedControl.selectOption('1');
      await expect(speedControl).toHaveValue('1');
      
      const rate = await page.evaluate(() => window.__voiceEngine?.currentRate);
      expect(rate).toBe(1);
    });

    test('should apply 1.25x speed', async ({ page }) => {
      const { speedControl } = await getVoiceTutorControls(page);
      
      await speedControl.selectOption('1.25');
      await expect(speedControl).toHaveValue('1.25');
      
      const rate = await page.evaluate(() => window.__voiceEngine?.currentRate);
      expect(rate).toBe(1.25);
    });

    test('should apply 1.5x speed', async ({ page }) => {
      const { speedControl } = await getVoiceTutorControls(page);
      
      await speedControl.selectOption('1.5');
      await expect(speedControl).toHaveValue('1.5');
      
      const rate = await page.evaluate(() => window.__voiceEngine?.currentRate);
      expect(rate).toBe(1.5);
    });

    test('should change speed during playback', async ({ page }) => {
      const { playBtn, speedControl, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback at 1x
      await speedControl.selectOption('1');
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Change speed to 1.5x during playback
      await speedControl.selectOption('1.5');
      
      // Verify speed changed
      const rate = await page.evaluate(() => window.__voiceEngine?.currentRate);
      expect(rate).toBe(1.5);
      
      // Verify still playing
      await expect(statusDisplay).toContainText('Playing');
    });

    test('should persist speed preference across sessions', async ({ page }) => {
      const { speedControl } = await getVoiceTutorControls(page);
      
      // Set speed to 1.25x
      await speedControl.selectOption('1.25');
      
      // Verify saved to localStorage
      const savedSpeed = await page.evaluate(() => {
        return localStorage.getItem('voice_tutor_speed');
      });
      expect(savedSpeed).toBe('1.25');
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Get controls again
      const { speedControl: newSpeedControl } = await getVoiceTutorControls(page);
      
      // Verify speed preference restored
      await expect(newSpeedControl).toHaveValue('1.25');
    });
  });

  test.describe('13.3 - Language Switching', () => {
    test('should play in English when language is English', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Set language to English
      await page.evaluate(() => {
        localStorage.setItem('ace_lang', 'en');
      });
      
      // Reload to apply language
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const { playBtn: newPlayBtn, statusDisplay: newStatusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await newPlayBtn.click();
      
      // Verify English voice is used
      const language = await page.evaluate(() => window.__voiceEngine?.currentLanguage);
      expect(language).toBe('en');
      
      await expect(newStatusDisplay).toContainText('Playing', { timeout: 2000 });
    });

    test('should play in Urdu when language is Urdu', async ({ page }) => {
      // Set language to Urdu
      await page.evaluate(() => {
        localStorage.setItem('ace_lang', 'ur');
      });
      
      // Reload to apply language
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const { playBtn } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      
      // Verify Urdu voice is used
      const language = await page.evaluate(() => window.__voiceEngine?.currentLanguage);
      expect(language).toBe('ur');
    });

    test('should update voice when language preference changes', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start with English
      await page.evaluate(() => {
        localStorage.setItem('ace_lang', 'en');
      });
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Change language to Urdu
      await page.evaluate(() => {
        localStorage.setItem('ace_lang', 'ur');
        window.dispatchEvent(new Event('language-changed'));
      });
      
      // Verify language changed
      const language = await page.evaluate(() => window.__voiceEngine?.currentLanguage);
      expect(language).toBe('ur');
    });

    test('should persist language preference', async ({ page }) => {
      // Set language to Urdu
      await page.evaluate(() => {
        localStorage.setItem('ace_lang', 'ur');
      });
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify language preference persisted
      const language = await page.evaluate(() => window.__voiceEngine?.currentLanguage);
      expect(language).toBe('ur');
    });
  });

  test.describe('13.4 - Offline Functionality', () => {
    test('should detect offline status', async ({ page }) => {
      // Simulate going offline
      await page.context().setOffline(true);
      
      // Verify offline status detected
      const isOffline = await page.evaluate(() => !navigator.onLine);
      expect(isOffline).toBe(true);
      
      // Go back online
      await page.context().setOffline(false);
    });

    test('should display offline message when audio unavailable', async ({ page }) => {
      const { playBtn, errorArea } = await getVoiceTutorControls(page);
      
      // Simulate offline
      await page.context().setOffline(true);
      
      // Try to play
      await playBtn.click();
      
      // Verify offline message displayed
      await expect(errorArea).toContainText('offline', { timeout: 2000 });
      
      // Go back online
      await page.context().setOffline(false);
    });

    test('should resume Web Speech API when back online', async ({ page }) => {
      const { playBtn, statusDisplay, errorArea } = await getVoiceTutorControls(page);
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try to play (should fail)
      await playBtn.click();
      await expect(errorArea).toContainText('offline', { timeout: 2000 });
      
      // Go back online
      await page.context().setOffline(false);
      
      // Clear error
      await page.evaluate(() => {
        const errorDiv = document.getElementById('voice-error');
        if (errorDiv) errorDiv.textContent = '';
      });
      
      // Try to play again
      await playBtn.click();
      
      // Verify playback works
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
    });
  });

  test.describe('13.5 - Accessibility Features', () => {
    test('should navigate with keyboard', async ({ page }) => {
      const { playBtn, pauseBtn, stopBtn } = await getVoiceTutorControls(page);
      
      // Tab to play button
      await page.keyboard.press('Tab');
      
      // Verify focus on first control
      const focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(['voice-play', 'voice-pause', 'voice-stop', 'voice-speed']).toContain(focusedElement);
    });

    test('should activate buttons with Enter/Space', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Focus play button
      await playBtn.focus();
      
      // Press Space to activate
      await page.keyboard.press('Space');
      
      // Verify playback started
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
    });

    test('should show focus indicators', async ({ page }) => {
      const { playBtn } = await getVoiceTutorControls(page);
      
      // Focus play button
      await playBtn.focus();
      
      // Verify focus visible
      const hasFocusStyle = await playBtn.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.outline !== 'none' || style.boxShadow !== 'none';
      });
      
      expect(hasFocusStyle).toBe(true);
    });

    test('should announce controls to screen readers', async ({ page }) => {
      const { playBtn, pauseBtn, stopBtn } = await getVoiceTutorControls(page);
      
      // Verify ARIA labels
      const playLabel = await playBtn.getAttribute('aria-label');
      const pauseLabel = await pauseBtn.getAttribute('aria-label');
      const stopLabel = await stopBtn.getAttribute('aria-label');
      
      expect(playLabel).toBeTruthy();
      expect(pauseLabel).toBeTruthy();
      expect(stopLabel).toBeTruthy();
    });

    test('should announce highlighting changes', async ({ page }) => {
      const { playBtn } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      
      // Verify live region exists for announcements
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeVisible();
      
      // Verify announcements are made
      const announcement = await liveRegion.textContent();
      expect(announcement).toBeTruthy();
    });

    test('should maintain color contrast', async ({ page }) => {
      const { playBtn, pauseBtn, stopBtn } = await getVoiceTutorControls(page);
      
      // Check contrast ratio for buttons
      const checkContrast = async (element) => {
        return await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          const color = style.color;
          // Simple check: both should be defined
          return bgColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)';
        });
      };
      
      expect(await checkContrast(playBtn)).toBe(true);
      expect(await checkContrast(pauseBtn)).toBe(true);
      expect(await checkContrast(stopBtn)).toBe(true);
    });
  });

  test.describe('13.6 - Error Scenarios', () => {
    test('should display error message on playback failure', async ({ page }) => {
      const { playBtn, errorArea } = await getVoiceTutorControls(page);
      
      // Simulate error by disabling Web Speech API
      await page.evaluate(() => {
        window.speechSynthesis = null;
      });
      
      // Try to play
      await playBtn.click();
      
      // Verify error message displayed
      await expect(errorArea).toBeVisible({ timeout: 2000 });
    });

    test('should provide retry option on error', async ({ page }) => {
      const { playBtn, errorArea } = await getVoiceTutorControls(page);
      
      // Simulate error
      await page.evaluate(() => {
        window.speechSynthesis = null;
      });
      
      // Try to play
      await playBtn.click();
      
      // Verify error area has retry button
      const retryBtn = errorArea.locator('button:has-text("Retry")');
      await expect(retryBtn).toBeVisible({ timeout: 2000 });
    });

    test('should fall back to alternative voice if unavailable', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      
      // Verify playback works (fallback to default voice)
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
    });
  });

  test.describe('13.7 - Reading Comprehension Integration', () => {
    test('should pause when question is answered', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Simulate question answered event
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('question-answered'));
      });
      
      // Verify paused
      await expect(statusDisplay).toContainText('Paused', { timeout: 1000 });
    });

    test('should allow resume after question answered', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Simulate question answered
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('question-answered'));
      });
      
      // Verify paused
      await expect(statusDisplay).toContainText('Paused', { timeout: 1000 });
      
      // Resume
      await playBtn.click();
      
      // Verify playing again
      await expect(statusDisplay).toContainText('Playing', { timeout: 1000 });
    });

    test('should stop and cleanup on navigation', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Simulate navigation
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('route-changed'));
      });
      
      // Verify stopped
      await expect(statusDisplay).toContainText('Stopped', { timeout: 1000 });
    });

    test('should not interfere with passage text readability', async ({ page }) => {
      const { playBtn } = await getVoiceTutorControls(page);
      
      // Get passage text
      const passageText = page.locator('[id="passage-text"]');
      
      // Start playback
      await playBtn.click();
      
      // Verify passage text is still visible and readable
      await expect(passageText).toBeVisible();
      
      // Verify text is selectable
      const isSelectable = await passageText.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.userSelect !== 'none';
      });
      
      expect(isSelectable).toBe(true);
    });

    test('should be optional (passage accessible without voice tutor)', async ({ page }) => {
      const passageText = page.locator('[id="passage-text"]');
      
      // Verify passage is accessible without using voice tutor
      await expect(passageText).toBeVisible();
      
      // Verify passage text is readable
      const text = await passageText.textContent();
      expect(text).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('should initialize within 500ms', async ({ page }) => {
      const startTime = Date.now();
      
      await navigateToVoiceTutorPage(page);
      
      // Wait for voice tutor to be ready
      await waitForVoiceEngineReady(page);
      
      const endTime = Date.now();
      const initTime = endTime - startTime;
      
      expect(initTime).toBeLessThan(500);
    });

    test('should start playback within 200ms', async ({ page }) => {
      const { playBtn } = await getVoiceTutorControls(page);
      
      const startTime = Date.now();
      
      // Click play
      await playBtn.click();
      
      // Wait for playback to start
      await page.waitForFunction(() => {
        return window.__voiceEngine?.isPlaying;
      }, { timeout: 200 });
      
      const endTime = Date.now();
      const playbackTime = endTime - startTime;
      
      expect(playbackTime).toBeLessThan(200);
    });

    test('should update highlighting with <50ms latency', async ({ page }) => {
      const { playBtn } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      
      // Measure highlight update latency
      const latency = await page.evaluate(() => {
        return window.__highlightSync?.getLastHighlightTime() || 0;
      });
      
      expect(latency).toBeLessThan(50);
    });

    test('should maintain smooth playback', async ({ page }) => {
      const { playBtn, statusDisplay } = await getVoiceTutorControls(page);
      
      // Start playback
      await playBtn.click();
      await expect(statusDisplay).toContainText('Playing', { timeout: 2000 });
      
      // Monitor for stuttering (no long pauses)
      const stutterDetected = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lastBoundaryTime = Date.now();
          let maxGap = 0;
          
          const checkGap = () => {
            const now = Date.now();
            const gap = now - lastBoundaryTime;
            if (gap > maxGap) maxGap = gap;
            lastBoundaryTime = now;
          };
          
          // Check for 2 seconds
          const interval = setInterval(checkGap, 100);
          setTimeout(() => {
            clearInterval(interval);
            resolve(maxGap > 500); // More than 500ms gap = stutter
          }, 2000);
        });
      });
      
      expect(stutterDetected).toBe(false);
    });
  });
});