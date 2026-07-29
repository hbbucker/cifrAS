import { test, expect } from '@playwright/test';

const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.UtbyLMnxY8d0t7MsyIoizRwjKoQyZUC0TdHE-wAJSYkAzFnH1AIXDcbWTAEz4l_wTc6QiXEbC3JfkYQ80GSlbwWpmEuPnLNTseqej712FywzFPHz-SptzffIyVN7YIHlvEtm-EXrFJT5OPo8Nuqpj_qn_fxUgD_S_FaxH44ASGVu_qUbopMcYBA87waWD-sZlvIf94RSCJbMTlNyO-nboLhi23tAwhBQqs-AXJxcbUp1R_XRDtBsEno4e-YgNkpy0LpT10nBqzTuiE1pu-UxjFOOmhYRHIgJ5LlPbF-NIHWiBh4L_c3M_HTw7RLDTzcQHdfesdCLXkOUIsJOnawGDQ';

test('theater mode lock functionality', async ({ page }) => {
  // Mock backend endpoints
  await page.route('**/api/performance/sessions/active', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, json: { playlistId: 'test-playlist-123', currentSongIndex: 0, scrollPosition: 100 } });
    } else {
      await route.fulfill({ status: 200 });
    }
  });

  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await page.waitForURL(/.*\/dashboard/);

  await page.goto('/songs');
  await page.getByTestId('add-song-btn').click();
  await page.getByTestId('song-title-input').fill('Theater Lock Test');
  await page.getByTestId('song-artist-input').fill('Artist');
  await page.getByTestId('song-content-input').fill('[C] Hello [G] World');
  await page.getByTestId('save-song-btn').click();
  await page.waitForURL(/.*\/songs/);

  await page.locator('div[data-testid^="view-song-"]').first().click();
  await page.getByTestId('theater-mode-btn').click();
  await page.waitForURL(/.*\/theater\/song\/[a-zA-Z0-9-]+/);
  await expect(page.getByTestId('theater-controls')).toBeVisible();



  // Test Lock Mode
  // Long press the lock button
  const lockBtn = page.getByTestId('lock-mode-btn');
  await lockBtn.dispatchEvent('mousedown');
  await page.waitForTimeout(1200);
  await lockBtn.dispatchEvent('mouseup');

  // Verify other buttons are hidden/disabled
  await expect(page.getByTestId('transpose-up')).not.toBeVisible();
  await expect(page.getByTestId('fullscreen-btn')).not.toBeVisible();
  await expect(page.getByTestId('play-pause-btn')).toBeDisabled();

  // Unlock
  await lockBtn.dispatchEvent('mousedown');
  await page.waitForTimeout(1200);
  await lockBtn.dispatchEvent('mouseup');

  await expect(page.getByTestId('transpose-up')).toBeVisible();
  await expect(page.getByTestId('play-pause-btn')).toBeEnabled();
});
