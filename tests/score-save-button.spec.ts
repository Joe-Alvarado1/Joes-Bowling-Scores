import { expect, test } from '@playwright/test';

test('enables saving only after all frames are complete', async ({ page }) => {
  await page.goto('/');

  const saveButton = page.getByRole('button', { name: 'Save to Google Sheet' });
  const rollInputs = page.locator('input[maxlength="1"]');

  await expect(saveButton).toBeDisabled();

  for (let frameIndex = 0; frameIndex < 9; frameIndex += 1) {
    await rollInputs.nth(frameIndex * 2 + 1).fill('X');
  }

  await rollInputs.nth(18).fill('X');
  await rollInputs.nth(19).fill('X');
  await expect(saveButton).toBeDisabled();

  await rollInputs.nth(20).fill('X');
  await expect(saveButton).toBeEnabled();
});
