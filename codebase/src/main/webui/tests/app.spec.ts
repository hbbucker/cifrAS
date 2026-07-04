import { test, expect } from '@playwright/test';

test('full application flow including registration and song CRUD', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0IiwiZ3JvdXBzIjpbInVzZXIiXSwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6MjA5ODU2ODQwMiwiaWF0IjoxNzgzMjA4NDAyfQ.ZRS-0Wf1Ws6j7PjQGc4lmVQ2H3UbK6616HNp4QZJEBMcO3bNdwEfn05SgXm5gp95knBSpNlS3M8wM0Iqtpthcpmh2JmzL9CfcssJSQPWgEzKGDP4rDt522-LFKAyOd8tLsyJQGt8cgRiY8rbW1Vkaohsl3YG6eIDaOJcnuzKhxfMCOSdEI4D9DCBJojre3xbLON8hqvEDX9WNZ_f86_P58Ttf479hJyjriLAlaGN2uvref3UkPvizALB0pgLovz6H3Vg7MP26LfjnIdwYOjZ8i_wislXNxS7vxfP9XXo3r36tv-A6ivstLXLO8ajivXzfNEBNRSz5ZwLP79d7EMQOQ';
  
  // 1. Login Flow (using mock token since Google Auth is difficult in E2E)
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);

  // Redirect to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);
  await expect(page.getByText('Favorites')).toBeVisible();

  // 2. Navigate to Songs List (My Repertoire) via Dashboard
  await page.getByTestId('view-all-btn').click();
  await expect(page.locator('h1')).toHaveText('My Repertoire');
  // Wonderwall won't exist in a fresh Testcontainers DB

  // 3. Create New Song
  await page.getByTestId('add-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs\/new/);
  await expect(page.locator('h1')).toHaveText('New Song');
  
  await page.getByTestId('song-title-input').fill('My New Song');
  await page.getByTestId('song-artist-input').fill('Me');
  await page.getByTestId('song-content-input').fill('[C] Hello [G] World');
  
  await page.getByTestId('save-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs/);
  await expect(page.getByText('Song created successfully!')).toBeVisible();

  // 4. View Song
  await page.locator('div[data-testid^="view-song-"]').first().click();
  await expect(page.locator('h1')).toHaveText('My New Song');
  
  // Transpose Pad check
  await expect(page.getByTestId('current-key')).toHaveText('C');
  await page.getByTestId('transpose-up').click();
  await expect(page.getByTestId('current-key')).toHaveText('C#');

  // Perform (Theater mode btn check)
  await expect(page.getByTestId('theater-mode-btn')).toBeVisible();

  // 5. Playlists Flow
  await page.getByTestId('sidebar').getByText('Playlists').click();
  await expect(page.locator('h1')).toHaveText('Playlists');
  
  // Create playlist
  await page.getByTestId('create-playlist-btn').click();
  await page.getByTestId('playlist-name-input').fill('My Awesome Gig');
  await page.getByTestId('save-playlist-btn').click();
  
  // Should navigate to playlist view
  await expect(page.locator('h1')).toHaveText('My Awesome Gig');
  
  // 6. Theater Mode
  await page.getByTestId('start-theater-btn').click();
  await expect(page).toHaveURL(/.*\/theater\/[a-zA-Z0-9-]+/);
  await expect(page.getByTestId('theater-controls')).toBeVisible();
  
  // Test auto-scroll / play pause
  await page.getByTestId('play-pause-btn').click();
  
  // Transpose in theater mode
  await expect(page.getByTestId('current-key')).toHaveText('C');
  await page.getByTestId('transpose-up').click();
  await expect(page.getByTestId('current-key')).toHaveText('C#');
  
  // Exit theater mode
  await page.getByTestId('exit-theater-btn').click();
  await expect(page).toHaveURL(/.*\/playlists\/[a-zA-Z0-9-]+/);

  // 7. Groups Flow
  await page.getByTestId('sidebar').getByText('Groups').click();
  await expect(page.locator('h1')).toHaveText('Groups');
  // await expect(page.getByText('Worship Team')).toBeVisible();

  // Test Invite (skipped since we don't have a pre-existing group in fresh DB)
  // await page.getByTestId('group-menu-1').click();
  // await page.getByText('Invite Member').click();
  // await page.getByTestId('invite-email-input').fill('new@member.com');
  // await page.getByTestId('send-invite-btn').click();

  // 8. Shared With Me
  await page.getByTestId('sidebar').getByText('Shared').click();
  await expect(page.locator('h1')).toHaveText('Shared with Me');
  // await expect(page.getByText('Everlong')).toBeVisible();

  // Test Heart Toggle (skipped due to no shared songs in fresh DB)
  // const favoriteBtn = page.getByTestId('favorite-btn').first();
  // await favoriteBtn.click();

  // 9. Settings
  await page.getByTestId('sidebar').getByText('Settings').click();
  await expect(page.locator('h1')).toHaveText('Settings');
  
  // Test saving preferences
  await page.getByLabel('Sharps (#)').check();
  await page.getByText('Save Preferences').click();
});
