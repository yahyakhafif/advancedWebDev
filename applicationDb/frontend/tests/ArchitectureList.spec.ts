import { test, expect } from '@playwright/test';

const appAddress = 'http://localhost:5173';

test('Adding a new architecture', async ({ page }) => {
    await page.goto(appAddress);

    const architectureName = `Architecture_${Math.random().toString(36).substring(7)}`;
    const description = "This is a test description";

    await page.fill('input[name="architecture_name"]', architectureName);
    await page.fill('textarea[name="description"]', description);

    const filePath = './test_image.jpeg';
    await page.setInputFiles('input[name="architecture_image"]', filePath);

    await page.click('button:has-text("Add Architecture")');

    await page.waitForTimeout(2000);

    await page.reload();

    const lastItem = page.locator('.list-group-item').last();
    await expect(lastItem).toContainText(architectureName);
    await expect(lastItem).toContainText(description);

    const image = lastItem.locator('img');
    await expect(image).toBeVisible();
});