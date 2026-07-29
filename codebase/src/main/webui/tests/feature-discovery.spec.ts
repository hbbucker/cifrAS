import { test, expect } from '@playwright/test';

test.describe('Feature Discovery Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we see the modal
    await page.addInitScript(() => {
      localStorage.removeItem('feature_discovery_02_seen');
    });
  });

  test('displays after 1 second and persists state on close', async ({ page }) => {
    const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.dummy';
    
    // Login
    await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    await page.getByTestId('view-all-btn').click();
    await expect(page.locator('h1')).toHaveText('My Repertoire');

    // Create a new song to view (since DB is fresh)
    await page.getByTestId('add-song-btn').click();
    await expect(page).toHaveURL(/.*\/songs\/new/);
    
    const uniqueTitle = 'Feature Discovery Song ' + Date.now();
    await page.getByTestId('song-title-input').fill(uniqueTitle);
    await page.getByTestId('song-artist-input').fill('Artist');
    await page.getByTestId('song-key-input').fill('C');
    await page.getByTestId('song-content-input').fill('[C]Hello World');
    
    await page.getByTestId('save-song-btn').click();
    
    // Wait for redirect to dashboard after saving
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Now click the song on the dashboard!
    await page.getByText(uniqueTitle).first().click();
    
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
