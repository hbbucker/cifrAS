import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_02_seen', 'true');
  });
});

test('full application flow including registration and song CRUD', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.UtbyLMnxY8d0t7MsyIoizRwjKoQyZUC0TdHE-wAJSYkAzFnH1AIXDcbWTAEz4l_wTc6QiXEbC3JfkYQ80GSlbwWpmEuPnLNTseqej712FywzFPHz-SptzffIyVN7YIHlvEtm-EXrFJT5OPo8Nuqpj_qn_fxUgD_S_FaxH44ASGVu_qUbopMcYBA87waWD-sZlvIf94RSCJbMTlNyO-nboLhi23tAwhBQqs-AXJxcbUp1R_XRDtBsEno4e-YgNkpy0LpT10nBqzTuiE1pu-UxjFOOmhYRHIgJ5LlPbF-NIHWiBh4L_c3M_HTw7RLDTzcQHdfesdCLXkOUIsJOnawGDQ';
  
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
  await expect(page.getByTestId('theater-controls').first()).toBeVisible();
  
  // Conditionally tap center to ensure controls are visible if they auto-hid
  const controls = page.getByTestId('theater-controls').first();
  const isHidden = await controls.evaluate((el) => el.classList.contains('opacity-0'));
  if (isHidden) {
    const { width, height } = page.viewportSize() || { width: 1024, height: 768 };
    await page.mouse.click(width / 2, height / 2);
  }
  await expect(controls).toHaveClass(/opacity-100/);

  // Test auto-scroll / play pause
  await page.getByTestId('play-pause-btn').first().click();
  
  // Wait a bit to ensure scrolling has started
  await page.waitForTimeout(500);

  // Re-open controls (since scrolling hides them)
  const isHidden2 = await controls.evaluate((el) => el.classList.contains('opacity-0'));
  if (isHidden2) {
    const { width, height } = page.viewportSize() || { width: 1024, height: 768 };
    await page.mouse.click(width / 2, height / 2);
  }
  await expect(controls).toHaveClass(/opacity-100/);

  // Transpose in theater mode
  await expect(page.getByTestId('current-key').first()).toHaveText('C');
  await page.getByTestId('transpose-up').first().click();
  await expect(page.getByTestId('current-key').first()).toHaveText('C#');
  
  // Exit theater mode
  await page.getByTestId('exit-theater-btn').first().click();
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
