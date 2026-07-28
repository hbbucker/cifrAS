import { test, expect } from '@playwright/test';

test('theater mode session state is preserved', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.UtbyLMnxY8d0t7MsyIoizRwjKoQyZUC0TdHE-wAJSYkAzFnH1AIXDcbWTAEz4l_wTc6QiXEbC3JfkYQ80GSlbwWpmEuPnLNTseqej712FywzFPHz-SptzffIyVN7YIHlvEtm-EXrFJT5OPo8Nuqpj_qn_fxUgD_S_FaxH44ASGVu_qUbopMcYBA87waWD-sZlvIf94RSCJbMTlNyO-nboLhi23tAwhBQqs-AXJxcbUp1R_XRDtBsEno4e-YgNkpy0LpT10nBqzTuiE1pu-UxjFOOmhYRHIgJ5LlPbF-NIHWiBh4L_c3M_HTw7RLDTzcQHdfesdCLXkOUIsJOnawGDQ';
  
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

  // Wait for debounce to save state to backend (1000ms + network)
  await page.waitForTimeout(2000);

  // 6. Exit Theater Mode
  const responsePromise = page.waitForResponse(response => response.url().includes('/api/songs/') && response.request().method() === 'GET');
  await page.getByTestId('exit-theater-btn').click();
  await expect(page).toHaveURL(/.*\/song\/[a-zA-Z0-9-]+/);
  await responsePromise;
  
  await page.waitForTimeout(1000);

  // 7. Disaster Recovery: Re-enter theater mode (or reload tab)
  await page.getByTestId('theater-mode-btn').click();
  await expect(page).toHaveURL(/.*\/theater\/song\/[a-zA-Z0-9-]+/);
  await expect(page.getByTestId('theater-controls')).toBeVisible();

  // 8. Assert that state was preserved! Key should be D (transpose = 2)
  await expect(page.getByTestId('current-key')).toHaveText('D');
});
