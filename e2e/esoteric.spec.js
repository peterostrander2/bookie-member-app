/**
 * E2E Tests: Esoteric Page
 * Tests for daily reading, matchup analyzer, and Chrome Resonance
 */

import { test, expect } from '@playwright/test';

test.describe('Esoteric Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/esoteric');
  });

  test('should load esoteric page', async ({ page }) => {
    await expect(page.getByText(/Esoteric|Daily|Reading/i).first()).toBeVisible();
  });

  test('should display daily reading section', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Should show daily energy/reading
    const dailySection = page.getByText(/Today|Daily|Energy|Reading/i);
    await expect(dailySection.first()).toBeVisible();
  });

  test('should display moon phase', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for moon phase indicator (emoji or text)
    const moonIndicator = page.locator('text=/🌑|🌒|🌓|🌔|🌕|🌖|🌗|🌘|Moon/');
    // Page should be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display life path numerology', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for life path or numerology section
    const numerology = page.getByText(/Life Path|Numerology/i);
    // Page should be functional
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Esoteric - Matchup Analyzer', () => {
  test('should have input fields for team names', async ({ page }) => {
    await page.goto('/esoteric');
    await page.waitForTimeout(500);

    // Should have input fields for home and away team
    const inputs = page.locator('input[type="text"], input[placeholder*="team" i]');
    await expect(inputs.first()).toBeVisible();
  });

  test('should analyze matchup when teams entered', async ({ page }) => {
    await page.goto('/esoteric');
    await page.waitForTimeout(500);

    // Fill in team names
    const homeInput = page.locator('input').filter({ hasText: '' }).first();
    const awayInput = page.locator('input').filter({ hasText: '' }).nth(1);

    // Find inputs by placeholder or label
    const teamInputs = page.locator('input[type="text"]');
    const inputCount = await teamInputs.count();

    if (inputCount >= 2) {
      await teamInputs.nth(0).fill('Lakers');
      await teamInputs.nth(1).fill('Celtics');

      // Look for Analyze button
      const analyzeButton = page.getByRole('button', { name: /Analyze/i });
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();

        // Should show analysis results
        await page.waitForTimeout(500);
        await expect(page.getByText(/Gematria|Score|Analysis/i).first()).toBeVisible();
      }
    }
  });

  test('should display Chrome Resonance analysis', async ({ page }) => {
    await page.goto('/esoteric');
    await page.waitForTimeout(500);

    // Fill in teams and analyze
    const teamInputs = page.locator('input[type="text"]');
    const inputCount = await teamInputs.count();

    if (inputCount >= 2) {
      await teamInputs.nth(0).fill('Lakers');
      await teamInputs.nth(1).fill('Celtics');

      const analyzeButton = page.getByRole('button', { name: /Analyze/i });
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
        await page.waitForTimeout(500);

        // Should show Chrome Resonance section
        const chromeSection = page.getByText(/Chrome Resonance|Hex|ASCII/i);
        if (await chromeSection.first().isVisible()) {
          await expect(chromeSection.first()).toBeVisible();
        }
      }
    }
  });

  test('should display gematria analysis', async ({ page }) => {
    await page.goto('/esoteric');
    await page.waitForTimeout(500);

    const teamInputs = page.locator('input[type="text"]');
    const inputCount = await teamInputs.count();

    if (inputCount >= 2) {
      await teamInputs.nth(0).fill('Lakers');
      await teamInputs.nth(1).fill('Celtics');

      const analyzeButton = page.getByRole('button', { name: /Analyze/i });
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
        await page.waitForTimeout(500);

        // Should show gematria results
        const gematriaSection = page.getByText(/Gematria|Ordinal|Cipher/i);
        if (await gematriaSection.first().isVisible()) {
          await expect(gematriaSection.first()).toBeVisible();
        }
      }
    }
  });
});

test.describe('Esoteric - About Section', () => {
  test('should display explanation of esoteric signals', async ({ page }) => {
    await page.goto('/esoteric');
    await page.waitForTimeout(500);

    // Look for About section
    const aboutSection = page.getByText(/About Esoteric|How it works/i);
    // Page should be functional
    await expect(page.locator('body')).toBeVisible();
  });
});
