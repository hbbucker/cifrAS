import { test, expect } from '@playwright/test';

test('theater mode session state is preserved', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0IiwiZ3JvdXBzIjpbInVzZXIiLCJhdXRoZW50aWNhdGVkIl0sImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjIxMDA1NTIwOTYsImlhdCI6MTc4NTE5MjA5Nn0.hu3rVK_Z6nO8zRa4Xny7EIfb61N1_Hh4sC6ljnuLynygj561wirVmKXeuzaxxmeL28TDBojyvRYV91SNQqUEO17juWTWQQE2sE-_WF24LT0kxCR_AJgrZyl97hrL3caGZqUh9FY1FRC3_9Kt_rLlqMWYnIkEQFKJoHzPwZWOaHu5RK0wW5Ez0v4cScQoB4LYNIq-g3Td-DcyHoCplh57U1o1zlC1natMlJgcw4658-MHOBJ6hZfIoWTqbPzIP4sjryq752XY3nInpe7YsgSgWMNqVCbBOQEudNpaMyfClXMmdCOQu7oxKcqWN3iTtOm101bOq6SDe3CM303ziaoxVA';
  
  // 1. Login Flow
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);

  // Redirect to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);

  // 2. Navigate to Songs List
  await page.goto('/songs');
  
  // 3. Create New Song
  await page.getByTestId('add-song-btn').click();
  await page.getByTestId('song-title-input').fill('Theater Test Song');
  await page.getByTestId('song-artist-input').fill('Artist');
  await page.getByTestId('song-content-input').fill('[C] Hello [G] World');
  await page.getByTestId('save-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs/);
  
  // 4. View Song
  await page.locator('div[data-testid^="view-song-"]').first().click();
  
  // 5. Enter Theater Mode
  await page.getByTestId('theater-mode-btn').click();
  await expect(page).toHaveURL(/.*\/theater\/song\/[a-zA-Z0-9-]+/);
  await expect(page.getByTestId('theater-controls')).toBeVisible();

  // The default key should be C
  await expect(page.getByTestId('current-key')).toHaveText('C');

  // Change transpose steps (+2 -> D)
  await page.getByTestId('transpose-up').click();
  await page.getByTestId('transpose-up').click();
  await expect(page.getByTestId('current-key')).toHaveText('D');

  // Change font size (simulate changing config)
  await page.getByTestId('increase-font-btn').click();

  // Wait for debounce to save state to backend
  await page.waitForResponse(response => response.url().includes('/theater/session') && response.request().method() === 'PUT');

  // 6. Exit Theater Mode
  await page.getByTestId('exit-theater-btn').click();
  await expect(page).toHaveURL(/.*\/song\/[a-zA-Z0-9-]+/);

  // 7. Disaster Recovery: Re-enter theater mode (or reload tab)
  await page.getByTestId('theater-mode-btn').click();
  await expect(page).toHaveURL(/.*\/theater\/song\/[a-zA-Z0-9-]+/);
  await expect(page.getByTestId('theater-controls')).toBeVisible();

  // 8. Assert that state was preserved! Key should be D (transpose = 2)
  await expect(page.getByTestId('current-key')).toHaveText('D');
});
