import { test, expect } from '@playwright/test';

test('can do login and redirect back to starting page', async ({ page }) => {
    // No clue how to correctly parametrise this...
    await page.goto('/');

    await page.route('*/**/api/auth/login', async route => {
        const json = {
            token: "aaa-bbb-ccc",
            pid: "11111111",
            name: "Jim",
            is_verified: false,
        }
        await route.fulfill({ json });
    });

    await page.route('*/**/api/user/current', async route => {
        const json = {
            email: "jim@example.com",
            name: "Jim",
            pid: "11111111",
        }
        await route.fulfill({ json });
    });

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
