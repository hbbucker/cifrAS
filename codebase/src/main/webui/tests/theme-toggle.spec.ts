import { test, expect } from '@playwright/test';

test('Theme toggle should change to dark mode and persist', async ({ page }) => {
  page.on('console', msg => console.log('Browser:', msg.text()));
  page.on('pageerror', err => console.log('Browser Error:', err.message));

  const testEmail = process.env.E2E_USER || `test_${Date.now()}@example.com`;
  const testPassword = process.env.E2E_PASSWORD || 'password123';

  // 0. Register Flow (if no env var is provided)
  if (!process.env.E2E_USER) {
    await page.goto('/register');
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('reg-email-input').fill(testEmail);
    await page.getByTestId('reg-password-input').fill(testPassword);
    await page.getByTestId('reg-confirm-password-input').fill(testPassword);
    await page.getByTestId('register-btn').click();
    
    // Wait for login page
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  }

  // 1. Login Flow
  await page.goto('/login');
  await page.getByTestId('email-input').fill(testEmail);
  await page.getByTestId('password-input').fill(testPassword);
  await page.getByTestId('login-btn').click();

  // Redirect to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);

  // Wait for the UI to be fully ready
  await page.waitForLoadState('networkidle');

  // If we start in dark mode (from a previous test run), reset to light mode
  const isDarkMode = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (isDarkMode) {
    await page.getByTestId('user-menu-btn').first().click();
    const themeToggle = page.getByTestId('theme-toggle-btn').first();
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.waitForTimeout(1000);
    // Reload to ensure we start from a clean state
    await page.reload();
    await page.waitForLoadState('networkidle');
  }

  // Now assert light mode is starting point
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  // Intercept and log failed requests
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      console.log(`API Error: ${response.status()} ${response.url()}`);
    }
  });
  
  page.on('console', msg => {
    if (msg.text().includes('ThemeContext')) {
      console.log(`Browser: ${msg.text()}`);
    }
  });

  // Open UserMenu
  await page.getByTestId('user-menu-btn').first().click();

  // Click Theme Toggle
  const themeToggle = page.getByTestId('theme-toggle-btn').first();
  await expect(themeToggle).toBeVisible();
  
  const responsePromise = page.waitForResponse(response => response.url().includes('/api/users/preferences') && response.request().method() === 'PUT');
  await themeToggle.click();
  const putResponse = await responsePromise;
  console.log(`PUT status: ${putResponse.status()}`);

  // Should have 'dark' class on HTML immediately
  await expect(page.locator('html')).toHaveClass(/dark/);

  // Wait for the request to be fired and persisted
  await page.waitForTimeout(1000);

  // Reload page to check persistence
  await page.reload();
  
  // HTML should still have 'dark' class
  await expect(page.locator('html')).toHaveClass(/dark/);
  
  // Open UserMenu again
  await page.getByTestId('user-menu-btn').first().click();
  
  // Click Theme Toggle to change back to light
  await page.getByTestId('theme-toggle-btn').first().click();
  
  // Should not have 'dark' class anymore
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});
