import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_03_seen', 'true');
  });
});

test('theater mode session state is preserved', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
  
  // 1. Login Flow
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);

  // Redirect to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);

  // 2. Navigate to Songs List
  await page.goto('/songs');
  
  // 3. Create New Song
  await page.getByTestId('add-song-btn').click();
  const songTitle = 'Theater Test Song ' + Date.now();
  await page.getByTestId('song-title-input').fill(songTitle);
  await page.getByTestId('song-artist-input').fill('Artist');
  await page.getByTestId('song-content-input').fill('[C] Hello [G] World');
  await page.getByTestId('save-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs/);
  
  // 4. View Song
  await page.getByText(songTitle).first().click();
  
  // 5. Enter Theater Mode
  await page.getByTestId('theater-mode-btn').click();
  await expect(page).toHaveURL(/.*\/theater\/song\/[a-zA-Z0-9-]+/);
  await expect(page.getByTestId('theater-controls').first()).toBeVisible();

  // The default key should be C
  await expect(page.getByTestId('current-key').first()).toHaveText('C');

  // Conditionally tap center to ensure controls are visible if they auto-hid
  const controls = page.getByTestId('theater-controls').first();
  const isHidden = await controls.evaluate((el) => el.classList.contains('opacity-0'));
  if (isHidden) {
    const { width, height } = page.viewportSize() || { width: 1024, height: 768 };
    await page.mouse.click(width / 2, height / 2);
  }
  await expect(controls).toHaveClass(/opacity-100/);

  // Change transpose steps (+2 -> D)
  await page.getByTestId('transpose-up').first().click();
  await page.getByTestId('transpose-up').first().click();
  await expect(page.getByTestId('current-key').first()).toHaveText('D');

  // Change font size (simulate changing config)
  await page.getByTestId('increase-font-btn').first().click();

  // Wait for debounce to save state to backend (1000ms + network)
  await page.waitForTimeout(2000);

  // 6. Exit Theater Mode
  const responsePromise = page.waitForResponse(response => response.url().includes('/api/songs/') && response.request().method() === 'GET');
  await page.getByTestId('exit-theater-btn').first().click();
  await expect(page).toHaveURL(/.*\/song\/[a-zA-Z0-9-]+/);
  await responsePromise;
  
  await page.waitForTimeout(1000);

  // 7. Disaster Recovery: Re-enter theater mode (or reload tab)
  await page.getByTestId('theater-mode-btn').click();
  await expect(page).toHaveURL(/.*\/theater\/song\/[a-zA-Z0-9-]+/);
  await expect(page.getByTestId('theater-controls').first()).toBeVisible();

  // 8. Assert that state was preserved! Key should be D (transpose = 2)
  await expect(page.getByTestId('current-key').first()).toHaveText('D');
});
