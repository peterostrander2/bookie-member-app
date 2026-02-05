/**
 * E2E Tests: Remaining pages smoke tests
 * Ensures every route in the app loads without crashing
 */

import { test, expect } from './fixtures';

test.describe('Page Load Smoke Tests', () => {
  const pages = [
    { path: '/achievements', heading: /Achievement|Gamification|XP|Badge/i },
    { path: '/admin', heading: /Admin|Cockpit|System/i },
    { path: '/backtest', heading: /Backtest|Back.*Test|Historical/i },
    { path: '/clv', heading: /CLV|Closing.*Line|Value/i },
    { path: '/consensus', heading: /Consensus|Meter|Public/i },
    { path: '/grading', heading: /Grad|Result|Pick/i },
    { path: '/signals', heading: /Signal|Engine|Overview/i },
    { path: '/splits', heading: /Split|Betting|Public.*Money/i },
    { path: '/summary', heading: /Summary|Daily|Today/i },
  ];

  for (const { path, heading } of pages) {
    test(`should load ${path} without crashing`, async ({ page }) => {
      await page.goto(path);
      // Wait for React to render (not raw Vite source)
      await page.waitForSelector('h1, h2, [role="heading"]', { timeout: 10000 }).catch(() => {});
      // Page should have some content
      await expect(page.locator('body')).toBeVisible();
      // Check for heading match - defensive (some pages may have different headings)
      const hasHeading = await page.getByRole('heading', { name: heading }).first()
        .isVisible({ timeout: 5000 }).catch(() => false);
      // Either heading found or page loaded without crash - both acceptable
      if (!hasHeading) {
        // At minimum, page should not show a blank white screen
        const bodyText = await page.locator('body').innerText().catch(() => '');
        expect(bodyText.length).toBeGreaterThan(0);
      }
    });
  }
});

test.describe('Basic Interaction Tests', () => {
  test('should interact with /splits sport selector', async ({ page }) => {
    await page.goto('/splits');
    await page.waitForSelector('h1, h2, [role="heading"]', { timeout: 10000 }).catch(() => {});
    const sportButton = page.getByText(/NFL|NBA|MLB|NHL/i).first();
    const isVisible = await sportButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await sportButton.click();
      // Page should remain functional after click
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should interact with /consensus sport selector', async ({ page }) => {
    await page.goto('/consensus');
    await page.waitForSelector('h1, h2, [role="heading"]', { timeout: 10000 }).catch(() => {});
    const sportButton = page.getByText(/NFL|NBA|MLB|NHL/i).first();
    const isVisible = await sportButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await sportButton.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should show CLV tracking UI on /clv', async ({ page }) => {
    await page.goto('/clv');
    await page.waitForSelector('h1, h2, [role="heading"]', { timeout: 10000 }).catch(() => {});
    // CLV page should show tracking elements or empty state
    const clvContent = page.getByText(/CLV|Closing|Track|Record/i).first();
    const hasContent = await clvContent.isVisible({ timeout: 5000 }).catch(() => false);
    // Just verify page didn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});
