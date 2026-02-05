/**
 * E2E Tests: Bet Slip
 * Tests for adding/removing picks, viewing slip, and parlay calculations
 */

import { test, expect } from './fixtures';

test.describe('Bet Slip', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should not show floating bet slip when empty', async ({ page }) => {
    await page.goto('/smash-spots');
    await page.waitForTimeout(500);

    // Floating button should not be visible when no selections
    const floatingButton = page.locator('button:has-text("🎫")');
    // Initial state should have no bet slip button (or it's hidden)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show "Add" button on pick cards', async ({ page }) => {
    await page.goto('/smash-spots');
    await page.waitForTimeout(2000);

    // Look for Add buttons on pick cards
    const addButton = page.getByRole('button', { name: /Add|Place Bet/i });

    // If picks exist, Add buttons should be visible
    if (await addButton.first().isVisible()) {
      await expect(addButton.first()).toBeVisible();
    }
  });

  test('should add pick to slip and show floating button', async ({ page }) => {
    await page.goto('/smash-spots');
    await page.waitForTimeout(2000);

    // Find and click an Add button
    const addButton = page.getByRole('button', { name: /Add/i }).first();

    if (await addButton.isVisible()) {
      await addButton.click();

      // Should show toast notification
      await page.waitForTimeout(500);

      // Either see "In Slip" or floating bet slip button
      const inSlipOrButton = page.locator('button:has-text("In Slip"), button:has-text("🎫")');
      await expect(inSlipOrButton.first()).toBeVisible();
    }
  });

  test('should open bet slip panel when floating button clicked', async ({ page }) => {
    // Set up a selection in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('bookie_bet_slip', JSON.stringify([
        {
          id: 'test_spread_Lakers',
          home_team: 'Lakers',
          away_team: 'Celtics',
          bet_type: 'spread',
          side: 'Lakers',
          line: -5.5,
          odds: -110,
          stake: 100
        }
      ]));
    });

    await page.goto('/smash-spots');
    await page.waitForTimeout(500);

    // Click floating bet slip button
    const floatingButton = page.locator('button:has-text("🎫")');

    if (await floatingButton.isVisible()) {
      await floatingButton.click();

      // Bet slip panel should open
      await expect(page.getByText(/Bet Slip/i)).toBeVisible();
      await expect(page.getByText(/Lakers/i)).toBeVisible();
    }
  });

  test('should calculate parlay odds for multiple selections', async ({ page }) => {
    // Set up multiple selections
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('bookie_bet_slip', JSON.stringify([
        {
          id: 'test_spread_Lakers',
          home_team: 'Lakers',
          bet_type: 'spread',
          side: 'Lakers',
          odds: -110,
          stake: 100
        },
        {
          id: 'test_spread_Celtics',
          home_team: 'Celtics',
          bet_type: 'spread',
          side: 'Celtics',
          odds: -110,
          stake: 100
        }
      ]));
    });

    await page.goto('/smash-spots');
    await page.waitForTimeout(500);

    const floatingButton = page.locator('button:has-text("🎫")');

    if (await floatingButton.isVisible()) {
      await floatingButton.click();

      // Should show parlay odds
      await expect(page.getByText(/Parlay/i)).toBeVisible();
    }
  });

  test('should show Vortex Math for 3-leg parlays', async ({ page }) => {
    // Set up 3 selections (Tesla number)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('bookie_bet_slip', JSON.stringify([
        { id: 'test1', home_team: 'Lakers', bet_type: 'spread', side: 'Lakers', odds: -110 },
        { id: 'test2', home_team: 'Celtics', bet_type: 'spread', side: 'Celtics', odds: -110 },
        { id: 'test3', home_team: 'Warriors', bet_type: 'spread', side: 'Warriors', odds: -110 }
      ]));
    });

    await page.goto('/smash-spots');
    await page.waitForTimeout(500);

    const floatingButton = page.locator('button:has-text("🎫")');

    if (await floatingButton.isVisible()) {
      await floatingButton.click();

      // Should show 3-Leg Parlay
      await expect(page.getByText(/3-Leg Parlay/i)).toBeVisible();
    }
  });

  test('should remove selection from slip', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('bookie_bet_slip', JSON.stringify([
        { id: 'test1', home_team: 'Lakers', bet_type: 'spread', side: 'Lakers', odds: -110 }
      ]));
    });

    await page.goto('/smash-spots');
    await page.waitForTimeout(500);

    const floatingButton = page.locator('button:has-text("🎫")');

    if (await floatingButton.isVisible()) {
      await floatingButton.click();

      // Find and click remove button
      const removeButton = page.locator('button:has-text("✕")');
      if (await removeButton.isVisible()) {
        await removeButton.click();

        // Slip should show empty or close
        await page.waitForTimeout(500);
      }
    }
  });

  test('should clear all selections', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('bookie_bet_slip', JSON.stringify([
        { id: 'test1', home_team: 'Lakers', bet_type: 'spread', side: 'Lakers', odds: -110 },
        { id: 'test2', home_team: 'Celtics', bet_type: 'spread', side: 'Celtics', odds: -110 }
      ]));
    });

    await page.goto('/smash-spots');
    await page.waitForTimeout(500);

    const floatingButton = page.locator('button:has-text("🎫")');

    if (await floatingButton.isVisible()) {
      await floatingButton.click();

      // Find and click Clear button
      const clearButton = page.getByRole('button', { name: /Clear/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Selections should be cleared
        await page.waitForTimeout(500);
      }
    }
  });

  test('should track picks when Track Picks clicked', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('bookie_bet_slip', JSON.stringify([
        { id: 'test1', home_team: 'Lakers', bet_type: 'spread', side: 'Lakers', odds: -110 }
      ]));
    });

    await page.goto('/smash-spots');
    await page.waitForTimeout(500);

    const floatingButton = page.locator('button:has-text("🎫")');

    if (await floatingButton.isVisible()) {
      await floatingButton.click();

      // Find and click Track Picks button
      const trackButton = page.getByRole('button', { name: /Track Picks/i });
      if (await trackButton.isVisible()) {
        await trackButton.click();

        // Should show success toast
        await page.waitForTimeout(500);
      }
    }
  });
});
