import { test, expect } from '@playwright/test';

test.describe('Feature Discovery Modal', () => {
  test.beforeEach(async ({ page }) => {
    // We do NOT set feature_discovery_02_seen to true here!
    await page.addInitScript(() => {
      localStorage.removeItem('feature_discovery_02_seen');
    });

    // Mock API responses for Dashboard
    await page.route('**/api/songs', async route => {
      if (route.request().method() === 'OPTIONS') {
         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }});
         return;
      }
      await route.fulfill({
        status: 200,
        json: [{
          id: '1',
          title: 'Test Song',
          artist: 'Test Artist',
          originalKey: 'C',
          keySignature: 'C',
          isFavorite: false,
          categories: []
        }]
      });
    });

    // Mock API responses for Song View
    await page.route('**/api/songs/1', async route => {
      if (route.request().method() === 'OPTIONS') {
         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }});
         return;
      }
      await route.fulfill({
        status: 200,
        json: {
          id: '1',
          title: 'Test Song',
          artist: 'Test Artist',
          originalKey: 'C',
          content: '[C]Hello [G]World'
        }
      });
    });

    await page.route('**/api/theater/song-preferences/*', async route => {
      await route.fulfill({ status: 200, json: {} });
    });
    
    // Catch-all for preferences PUT
    await page.route('**/api/songs/1/preferences', async route => {
      await route.fulfill({ status: 200, json: {} });
    });
  });

  test('displays after 1 second and persists state on close', async ({ page }) => {
    const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.dummy';
    
    // Login
    await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Wait for dashboard to load the song
    await expect(page.getByText('Test Song')).toBeVisible();

    // Navigate to the song page via client-side routing
    await page.getByText('Test Song').first().click();
    await expect(page).toHaveURL(/.*\/songs\/view\/1/);
    
    // Wait for the modal timeout
    await page.waitForTimeout(1500);

    // We check for the text
    const overlay = page.locator('text=Novidades no CifrAS!').or(page.locator('text=What is new in CifrAS!').or(page.locator('text=¡Novedades en CifrAS!')));
    await expect(overlay).toBeVisible({ timeout: 5000 });
    
    // Check localStorage before click
    let seenState = await page.evaluate(() => localStorage.getItem('feature_discovery_02_seen'));
    expect(seenState).toBeNull();
    
    // Click the button to dismiss
    const dismissButton = page.locator('button', { hasText: /Entendi!|Got it!|¡Entendido!/ });
    await dismissButton.click();
    
    // Modal should be gone
    await expect(overlay).toBeHidden({ timeout: 2000 });
    
    // Check localStorage after click
    seenState = await page.evaluate(() => localStorage.getItem('feature_discovery_02_seen'));
    expect(seenState).toBe('true');
  });
});
