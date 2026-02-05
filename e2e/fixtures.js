/**
 * Shared Playwright fixtures for E2E tests
 * Extends the default page fixture to skip onboarding wizard
 */

import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Skip onboarding wizard and "getting started" in all tests
    await page.addInitScript(() => {
      localStorage.setItem('bookie_onboarding_complete', 'true');
      localStorage.setItem('dashboard_visited', 'true');
    });
    await use(page);
  },
});

export { expect };
