import { test, expect } from '@playwright/test';

test('theater mode session state is preserved', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0IiwiZ3JvdXBzIjpbInVzZXIiXSwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6MjA5ODU2ODQwMiwiaWF0IjoxNzgzMjA4NDAyfQ.ZRS-0Wf1Ws6j7PjQGc4lmVQ2H3UbK6616HNp4QZJEBMcO3bNdwEfn05SgXm5gp95knBSpNlS3M8wM0Iqtpthcpmh2JmzL9CfcssJSQPWgEzKGDP4rDt522-LFKAyOd8tLsyJQGt8cgRiY8rbW1Vkaohsl3YG6eIDaOJcnuzKhxfMCOSdEI4D9DCBJojre3xbLON8hqvEDX9WNZ_f86_P58Ttf479hJyjriLAlaGN2uvref3UkPvizALB0pgLovz6H3Vg7MP26LfjnIdwYOjZ8i_wislXNxS7vxfP9XXo3r36tv-A6ivstLXLO8ajivXzfNEBNRSz5ZwLP79d7EMQOQ';
  
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
  await page.waitForTimeout(1500);

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
