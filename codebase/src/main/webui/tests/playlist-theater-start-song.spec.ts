import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_03_seen', 'true');
  });
});

const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';

test('playlist theater start song: select intermediate song and verify queue navigation', async ({ page }) => {
  // Mock playlist with 3 songs
  await page.route('**/api/playlists/pl-theater-test', async route => {
    await route.fulfill({
      status: 200,
      json: {
        id: 'pl-theater-test',
        name: 'Show Setlist',
        userId: 'e2e-user-1234',
        songs: [
          { id: 'song-1', title: 'Primeira Canção', artist: 'Banda A', originalKey: 'C' },
          { id: 'song-2', title: 'Segunda Canção Intermediária', artist: 'Banda B', originalKey: 'G' },
          { id: 'song-3', title: 'Terceira Canção Final', artist: 'Banda C', originalKey: 'D' }
        ]
      }
    });
  });

  await page.route('**/api/songs/song-1', async route => {
    await route.fulfill({
      status: 200,
      json: {
        id: 'song-1',
        title: 'Primeira Canção',
        artist: 'Banda A',
        originalKey: 'C',
        lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Letra da primeira canção' }] }] }
      }
    });
  });

  await page.route('**/api/songs/song-2', async route => {
    await route.fulfill({
      status: 200,
      json: {
        id: 'song-2',
        title: 'Segunda Canção Intermediária',
        artist: 'Banda B',
        originalKey: 'G',
        lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Letra da segunda canção' }] }] }
      }
    });
  });

  await page.route('**/api/songs/song-3', async route => {
    await route.fulfill({
      status: 200,
      json: {
        id: 'song-3',
        title: 'Terceira Canção Final',
        artist: 'Banda C',
        originalKey: 'D',
        lyrics: { sections: [{ label: 'Verso', lines: [{ chords: [], text: 'Letra da terceira canção' }] }] }
      }
    });
  });

  await page.route('**/api/theater/song-preferences/**', async route => {
    await route.fulfill({
      status: 200,
      json: { autoScrollSpeed: 1, transposeSteps: 0, fontSize: 32 }
    });
  });

  await page.route('**/api/theater/session', async route => {
    await route.fulfill({ status: 200 });
  });

  await page.route('**/api/performance/sessions/active', async route => {
    await route.fulfill({ status: 200, json: null });
  });

  // Login
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await page.waitForURL(/.*\/dashboard/);

  // Navigate to playlist page
  await page.goto('/playlists/pl-theater-test');
  await expect(page.getByText('Show Setlist')).toBeVisible();
  await expect(page.getByText('Segunda Canção Intermediária')).toBeVisible();

  // Click on play in theater button on intermediate song (song-2)
  const playSong2Btn = page.getByTestId('play-theater-song-song-2');
  await expect(playSong2Btn).toBeVisible();
  await playSong2Btn.click();

  // Validate URL contains songId=song-2
  await page.waitForURL(/.*\/theater\/pl-theater-test\?songId=song-2/);

  // Verify Song 2 is immediately rendered as the active song
  await expect(page.getByRole('heading', { name: 'Segunda Canção Intermediária' })).toBeVisible();
  await expect(page.getByText('Banda B')).toBeVisible();

  // Verify controls are visible
  await expect(page.getByTestId('theater-controls')).toBeVisible();

  // Verify queue navigation: Previous button is enabled (navigates to Song 1), Next button is enabled (navigates to Song 3)
  const prevBtn = page.getByTestId('prev-song-btn');
  const nextBtn = page.getByTestId('next-song-btn');
  await expect(prevBtn).toBeEnabled();
  await expect(nextBtn).toBeEnabled();

  // Navigate forward to Song 3
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Terceira Canção Final' })).toBeVisible();
  await expect(page.getByText('Banda C')).toBeVisible();
  // Song 3 is the last song (N - 1), next button should now be disabled
  await expect(nextBtn).toBeDisabled();
  await expect(prevBtn).toBeEnabled();

  // Navigate back to Song 2
  await prevBtn.click();
  await expect(page.getByRole('heading', { name: 'Segunda Canção Intermediária' })).toBeVisible();

  // Navigate back to Song 1
  await prevBtn.click();
  await expect(page.getByRole('heading', { name: 'Primeira Canção' })).toBeVisible();
  // Song 1 is the first song (K = 0), previous button should now be disabled
  await expect(prevBtn).toBeDisabled();
  await expect(nextBtn).toBeEnabled();
});
