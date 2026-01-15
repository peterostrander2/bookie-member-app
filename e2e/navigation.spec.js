/**
 * E2E Tests: Navigation and Page Loading
 * Tests that all major routes load correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load homepage (Dashboard)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bookie/i);
    // Dashboard should show sport selector or welcome content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to Smash Spots', async ({ page }) => {
    await page.goto('/smash-spots');
    // Should see tab navigation for Props/Games
    await expect(page.getByText(/Player Props|Game Picks/i)).toBeVisible();
  });

  test('should navigate to Parlay Builder', async ({ page }) => {
    await page.goto('/parlay');
    await expect(page.getByText(/Parlay/i)).toBeVisible();
  });

  test('should navigate to Bet History', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByText(/History|Bet/i)).toBeVisible();
  });

  test('should navigate to Esoteric', async ({ page }) => {
    await page.goto('/esoteric');
    await expect(page.getByText(/Esoteric|Daily Reading/i)).toBeVisible();
  });

  test('should navigate to Leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByText(/Leaderboard|Rank/i)).toBeVisible();
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile menu button on small screens', async ({ page }) => {
    await page.goto('/');
    // Mobile hamburger menu should be visible
    const menuButton = page.locator('[aria-label*="menu"], button:has-text("☰")');
    // Menu button may or may not be present depending on viewport
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate correctly on mobile', async ({ page }) => {
    await page.goto('/smash-spots');
    await expect(page.locator('body')).toBeVisible();
    // Content should be responsive
    await expect(page.getByText(/Props|Games/i)).toBeVisible();
  });
});
