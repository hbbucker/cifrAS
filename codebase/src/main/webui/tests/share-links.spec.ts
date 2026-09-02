import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_03_seen', 'true');
    localStorage.setItem('tour_seen_import-cifraclub', 'true');
    localStorage.setItem('tooltip_seen_add_song_btn', 'true');
  });
});

test('generate share link for a song and process invite', async ({ page }) => {
  page.on("console", msg => console.log("BROWSER: " + msg.text()));
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
  
  // Mock API to return a song
  await page.route('**/api/songs/*', async (route, request) => {
    if (request.method() === 'GET' && !request.url().includes('preferences')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'song-123',
          title: 'Mock Share Song',
          artist: 'Artist',
          lyrics: { sections: [] }
        })
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/share-links', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'token123',
        type: 'SONG',
        resourceId: 'song-123'
      })
    });
  });

  await page.route('**/api/share-links/token123/accept', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  await page.route('**/api/share-links/token123', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'token123',
        type: 'SONG',
        resourceId: 'song-123'
      })
    });
  });

  // Login
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await expect(page).toHaveURL(/.*\/dashboard/);
  
  // Go to song page
  await page.goto('/song/song-123');
  
  // Wait for title
  await expect(page.getByText('Mock Share Song')).toBeVisible();

  // Click share
  await page.getByTestId('share-song-btn').click();
  
  // Click Generate Link
  await page.getByRole('button', { name: /Gerar Link|Generate Link/i }).click();
  
  // Wait for the input to contain the invite link
  const linkInput = page.locator('input[readonly]');
  await expect(linkInput).toHaveValue(/\/invite\/token123/);
  
  const inviteUrl = await linkInput.inputValue();
  
  // Now logout and visit the invite url to test unauthenticated flow
  await page.evaluate(() => localStorage.clear());
  
  await page.goto(inviteUrl);
  
  // Unauthenticated should redirect to login
  await expect(page).toHaveURL(/.*\/login/);
  
  // The pending token should be saved
  const pendingToken = await page.evaluate(() => localStorage.getItem('pendingShareToken'));
  expect(pendingToken).toBe('token123');
  
  // Login again
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  
  // Visit the invite link while authenticated
  await page.goto(inviteUrl);
  
  // Should redirect to song page
  await expect(page).toHaveURL(/\/song\/song-123/);
  await expect(page.getByText('Mock Share Song')).toBeVisible();
});
