import { test, expect } from '@playwright/test';

test('awaits Bowling Score Sheet title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Bowling Score Sheet');
});
