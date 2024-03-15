import {test, expect, Page} from '@playwright/test';
import {LoginResponse, UserProfile} from "../src/models/api";

test('can do login and redirect back to starting page', async ({ page }) => {
    const jim = {
        pid: "11111111",
        name: "Jim",
        is_verified: false,
        token: "aaa-bbb-ccc",
        email: "jim@example.com",
        password: "rubberduck",
    }
    await respondToLogin(jim, page);

    await page.goto('/');

    await page.getByText("Recipes").click();

    await page
        .getByLabel('Username')
        .fill(jim.email);

    await page
        .getByLabel('Password')
        .fill(jim.password);

    await page.getByRole('button', { name: /Sign In/ }).click();

    await expect(page).toHaveURL(/.+\/recipes/)
    await expect(page.locator('nav')).toContainText(new RegExp(jim.name, "i"));
});

async function respondToLogin(user: LoginResponse & UserProfile,  page: Page) {
    await page.route('*/**/api/auth/login', async route => {
        await route.fulfill({json: user});
    });

    await page.route('*/**/api/user/current', async route => {
        await route.fulfill({json: user});
    });
}

