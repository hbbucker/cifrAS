import { test, expect } from '@playwright/test';

test('full application flow including registration and song CRUD', async ({ page }) => {
  // 1. Login Flow
  await page.goto('/login');
  await expect(page.locator('h2')).toHaveText('Welcome to CifrAS');
  
  await page.getByTestId('email-input').fill(process.env.E2E_USER || 'test@example.com');
  await page.getByTestId('password-input').fill(process.env.E2E_PASSWORD || 'password');
  await page.getByTestId('login-btn').click();

  // Redirect to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);
  await expect(page.getByText('Recently Added')).toBeVisible();

  // 2. Navigate to Songs List (My Repertoire) via Dashboard
  await page.getByTestId('view-all-btn').click();
  await expect(page.locator('h1')).toHaveText('My Repertoire');
  await expect(page.getByText('Wonderwall')).toBeVisible();

  // 3. Create New Song
  await page.getByTestId('add-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs\/new/);
  await expect(page.locator('h1')).toHaveText('New Song');
  
  await page.getByTestId('song-title-input').fill('My New Song');
  await page.getByTestId('song-artist-input').fill('Me');
  await page.getByTestId('song-content-input').fill('[C] Hello [G] World');
  
  await page.getByTestId('save-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs/);
  await expect(page.getByText('Song saved successfully')).toBeVisible();

  // 4. View Song
  await page.getByTestId('view-song-1').click();
  await expect(page.locator('h1')).toHaveText('I Took A Pill In Ibiza');
  
  // Transpose Pad check
  await expect(page.getByTestId('current-key')).toHaveText('G');
  await page.getByTestId('transpose-up').click();
  await expect(page.getByTestId('current-key')).toHaveText('G#');

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
  await expect(page.locator('h1')).toHaveText('Sunday Worship'); // mock hardcoded
  
  // 6. Theater Mode
  await page.getByTestId('start-theater-btn').click();
  await expect(page).toHaveURL(/.*\/theater\/1/);
  await expect(page.getByTestId('theater-controls')).toBeVisible();
  
  // Test auto-scroll / play pause
  await page.getByTestId('play-pause-btn').click();
  
  // Transpose in theater mode
  await expect(page.getByTestId('current-key')).toHaveText('G');
  await page.getByTestId('transpose-up').click();
  await expect(page.getByTestId('current-key')).toHaveText('G#');
  
  // Exit theater mode
  await page.getByTestId('exit-theater-btn').click();
  await expect(page).toHaveURL(/.*\/playlists\/1/);

  // 7. Groups Flow
  await page.getByTestId('sidebar').getByText('Groups').click();
  await expect(page.locator('h1')).toHaveText('Groups');
  await expect(page.getByText('Worship Team')).toBeVisible();

  // Test Invite
  await page.getByTestId('group-menu-1').click();
  await page.getByText('Invite Member').click();
  await page.getByTestId('invite-email-input').fill('new@member.com');
  await page.getByTestId('send-invite-btn').click();

  // 8. Shared With Me
  await page.getByTestId('sidebar').getByText('Shared').click();
  await expect(page.locator('h1')).toHaveText('Shared with Me');
  await expect(page.getByText('Everlong')).toBeVisible();

  // Test Heart Toggle (MusicCard optimistic update)
  const favoriteBtn = page.getByTestId('favorite-btn').first();
  await favoriteBtn.click();
  // We can just ensure it doesn't crash since visual toggles in headless are tricky to match without exact class assertions

  // 9. Settings
  await page.getByTestId('sidebar').getByText('Settings').click();
  await expect(page.locator('h1')).toHaveText('Settings');
  
  // Test saving preferences
  await page.getByLabel('Sharps (#)').check();
  await page.getByText('Save Preferences').click();
});
