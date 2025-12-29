import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the feed page', async ({ page }) => {
    await page.goto('/');

    // Check if the page title is correct
    await expect(page).toHaveTitle(/Lost & Found/);

    // Check if navigation is present
    await expect(page.locator('nav')).toBeVisible();

    // Check if the feed heading is present
    await expect(page.getByRole('heading', { name: /Lost & Found Feed/i })).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');

    // Click on About link
    await page.click('text=About');

    // Verify we're on the about page
    await expect(page.getByRole('heading', { name: /About Lost & Found/i })).toBeVisible();
  });

  test('should show sign in page for unauthenticated users trying to post', async ({ page }) => {
    await page.goto('/post/new');

    // Should show sign in required message
    await expect(page.getByText(/Sign in required/i)).toBeVisible();
  });
});
