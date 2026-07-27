import { test, expect } from '@playwright/test';

test('Theme toggle should change to dark mode and persist', async ({ page }) => {
  page.on('console', msg => console.log('Browser:', msg.text()));
  page.on('pageerror', err => console.log('Browser Error:', err.message));

  // 1. Login Flow (using mock token since Google Auth is difficult in E2E)
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0IiwiZ3JvdXBzIjpbInVzZXIiLCJhdXRoZW50aWNhdGVkIl0sImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjIxMDA1NTIwOTYsImlhdCI6MTc4NTE5MjA5Nn0.hu3rVK_Z6nO8zRa4Xny7EIfb61N1_Hh4sC6ljnuLynygj561wirVmKXeuzaxxmeL28TDBojyvRYV91SNQqUEO17juWTWQQE2sE-_WF24LT0kxCR_AJgrZyl97hrL3caGZqUh9FY1FRC3_9Kt_rLlqMWYnIkEQFKJoHzPwZWOaHu5RK0wW5Ez0v4cScQoB4LYNIq-g3Td-DcyHoCplh57U1o1zlC1natMlJgcw4658-MHOBJ6hZfIoWTqbPzIP4sjryq752XY3nInpe7YsgSgWMNqVCbBOQEudNpaMyfClXMmdCOQu7oxKcqWN3iTtOm101bOq6SDe3CM303ziaoxVA';
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);

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
