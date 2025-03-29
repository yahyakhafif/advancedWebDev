import { test, expect } from '@playwright/test';

const appAddress = 'http://localhost:5173';

test('The app should display the title', async ({ page }) => {
    await page.goto(appAddress);

    await expect(page.getByRole('heading', { name: 'Architectures' })).toBeVisible();
    await page.pause();
});
