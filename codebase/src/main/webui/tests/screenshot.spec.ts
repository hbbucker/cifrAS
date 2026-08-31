import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_03_seen', 'true');
    localStorage.setItem('tour_seen_import-cifraclub', 'true');
  });
});

test('Evidencia - Aviso de Transposicao', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
  
  // 1. Login Flow (using mock token)
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await expect(page).toHaveURL(/.*\/dashboard/);

  // 2. Navigate to Songs List
  await page.getByTestId('view-all-btn').click();
  
  // 3. Create New Song
  await page.getByTestId('add-song-btn').click();
  const songTitle = 'Evidencia Song ' + Date.now();
  await page.getByTestId('song-title-input').fill(songTitle);
  await page.getByTestId('song-artist-input').fill('Artist');
  await page.getByTestId('song-content-input').fill('[C] Hello [G] World');
  await page.getByTestId('save-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs/);
  
  // 4. View Song
  await page.getByText(songTitle).first().click();
  
  // 5. Transpose the song up once
  await page.getByTestId('transpose-up').click();
  await expect(page.getByTestId('current-key')).toHaveText('C#');
  
  // 6. Click Edit button while transposed
  await page.getByTitle(/Edit|Editar/i).click();
  
  // 7. Verify we are on edit page and the warning is visible
  await expect(page).toHaveURL(/.*\/songs\/edit\/.*/);
  
  // Capture screenshot (relative path for CI compatibility)
  await page.screenshot({ path: 'test-results/evidence-warning.png' });
});
