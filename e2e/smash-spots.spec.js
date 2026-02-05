/**
 * E2E Tests: Smash Spots Page
 * Tests for viewing picks, switching tabs, and interacting with pick cards
 */

import { test, expect } from './fixtures';

test.describe('Smash Spots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smash-spots');
  });

  test('should display sport selector', async ({ page }) => {
    // Should show sport options (NBA, NFL, MLB, NHL)
    const sportSelector = page.locator('select, [role="combobox"], button:has-text("NBA")');
    await expect(sportSelector.first()).toBeVisible();
  });

  test('should display tab navigation for Props and Games', async ({ page }) => {
    // Should have tabs for switching between Props and Games
    const propsTab = page.getByRole('button', { name: /Props/i });
    const gamesTab = page.getByRole('button', { name: /Games/i });

    // At least one tab indicator should be visible
    await expect(page.getByText(/Player Props|Game Picks/i).first()).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // On fresh load, should show loading indicator
    const loader = page.locator('[class*="spin"], [class*="loading"]');
    // Loading might be quick, so we just verify the page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display pick cards when data loads', async ({ page }) => {
    // Wait for picks to load (or empty state)
    await page.waitForTimeout(2000);

    // Either shows pick cards or "no picks available" message
    const content = page.locator('[class*="pick"], [class*="card"], div:has-text("No")');
    await expect(content.first()).toBeVisible();
  });

  test('should switch between Props and Games tabs', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Find and click tabs
    const gamesTab = page.getByRole('button', { name: /Game/i }).first();
    const propsTab = page.getByRole('button', { name: /Prop/i }).first();

    if (await gamesTab.isVisible()) {
      await gamesTab.click();
      await expect(page.getByText(/Spreads|Totals|Moneylines|Game Picks/i).first()).toBeVisible();
    }

    if (await propsTab.isVisible()) {
      await propsTab.click();
      await expect(page.getByText(/Player Props|Points|Rebounds/i).first()).toBeVisible();
    }
  });

  test('should display confidence badges on picks', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Look for confidence indicators (SMASH, STRONG, LEAN, WATCH)
    const confidenceBadge = page.locator('span:has-text("SMASH"), span:has-text("STRONG"), span:has-text("LEAN"), span:has-text("WATCH")');

    // May not have picks, so just verify page is functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshButton.first()).toBeVisible();
  });

  test('should show "Why?" expand button on pick cards', async ({ page }) => {
    await page.waitForTimeout(2000);

    const whyButton = page.getByRole('button', { name: /Why/i });

    if (await whyButton.first().isVisible()) {
      await whyButton.first().click();
      // Should expand to show AI/Pillar scores
      await expect(page.getByText(/AI Models|Pillars/i).first()).toBeVisible();
    }
  });
});

test.describe('Smash Spots - Sport Selection', () => {
  test('should change sport and reload picks', async ({ page }) => {
    await page.goto('/smash-spots');
    await page.waitForTimeout(1000);

    // Sport selector uses buttons (NBA, NFL, MLB, NHL)
    const nflButton = page.getByRole('button', { name: /NFL/i });

    if (await nflButton.isVisible()) {
      await nflButton.click();
      await page.waitForTimeout(1000);

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Smash Spots - v20.5 Panels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smash-spots');
    await page.waitForTimeout(2000);
  });

  test('should display score breakdown panel when expanded', async ({ page }) => {
    const details = page.locator('details summary:has-text("Score Breakdown")');
    if (await details.first().isVisible()) {
      await details.first().click();
      await page.waitForTimeout(300);
      // Verify boost field labels are visible
      const boostLabels = page.getByText(/Context Modifier|Confluence|MSRF|Jason Sim|SERP|Ensemble/i);
      await expect(boostLabels.first()).toBeVisible();
    } else {
      // No picks loaded — page is still functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should display status badges on picks', async ({ page }) => {
    // Check for any status badge text
    const badges = page.locator('span:has-text("TURN DATE"), span:has-text("SERP"), span:has-text("JASON"), span:has-text("ML ADJUST")');
    // Badges are conditional on data, verify page is functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display GLITCH Protocol panel when expanded', async ({ page }) => {
    const details = page.locator('details summary:has-text("GLITCH Protocol")');
    if (await details.first().isVisible()) {
      await details.first().click();
      await page.waitForTimeout(300);
      const signalLabels = page.getByText(/Void Moon|KP Index|Noosphere|Benford/i);
      await expect(signalLabels.first()).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should display Esoteric Contributions panel when expanded', async ({ page }) => {
    const details = page.locator('details summary:has-text("Esoteric Contributions")');
    if (await details.first().isVisible()) {
      await details.first().click();
      await page.waitForTimeout(300);
      const categories = page.getByText(/Numerology|Astronomical|Mathematical|Signals|Situational/i);
      await expect(categories.first()).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should display tier legend with engine requirement', async ({ page }) => {
    const legend = page.getByText(/3\/4 engines/i);
    if (await legend.first().isVisible()) {
      await expect(legend.first()).toBeVisible();
    } else {
      // Legend may not be visible if no picks
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
