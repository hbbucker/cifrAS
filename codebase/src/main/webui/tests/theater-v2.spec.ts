import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_02_seen', 'true');
  });
});

const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';

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
  // Click the lock button
  const lockBtn = page.getByTestId('lock-mode-btn');
  await lockBtn.click();

  // Verify other buttons are hidden/disabled
  await expect(page.getByTestId('transpose-up')).not.toBeVisible();
  await expect(page.getByTestId('fullscreen-btn')).not.toBeVisible();
  await expect(page.getByTestId('play-pause-btn')).toBeDisabled();

  // Unlock
  await lockBtn.click();

  await expect(page.getByTestId('transpose-up')).toBeVisible();
  await expect(page.getByTestId('play-pause-btn')).toBeEnabled();

  // Test Auto-hide / tap to hide
  // Wait for 4s auto-hide timeout? No, let's just tap to hide.
  const { width, height } = page.viewportSize() || { width: 1024, height: 768 };
  // Tap center
  await page.mouse.click(width / 2, height / 2);
  await expect(page.getByTestId('theater-controls')).toHaveClass(/opacity-0/);

  // Tap again to show
  await page.mouse.click(width / 2, height / 2);
  await expect(page.getByTestId('theater-controls')).toHaveClass(/opacity-100/);
});
