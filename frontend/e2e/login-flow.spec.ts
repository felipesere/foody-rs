import { test, expect } from '@playwright/test';

test('can do login and redirect back to starting page', async ({ page }) => {
    // No clue how to correctly parametrise this...
    await page.goto('/');

    await page.getByText("Recipes").click();

    await page
        .getByLabel('Username')
        .fill('jim@example.com');

    await page
        .getByLabel('Password')
        .fill('rubberduck');

    await page.getByRole('button', { name: /Sign In/ }).click();

    await expect(page).toHaveURL(/.+\/recipes/)
    await expect(page.locator('nav')).toContainText(/Jim/i);
});
