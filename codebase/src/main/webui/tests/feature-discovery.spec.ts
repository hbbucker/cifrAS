import { test, expect } from '@playwright/test';

test.describe('Feature Discovery Modal', () => {
  test.beforeEach(async ({ page }) => {
    // We do NOT set feature_discovery_02_seen to true here!
    await page.addInitScript(() => {
      localStorage.removeItem('feature_discovery_02_seen');
    });

    // Mock API responses
    await page.route('**/api/songs/*', async route => {
      if (route.request().method() === 'OPTIONS') {
         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }});
         return;
      }
      await route.fulfill({
        status: 200,
        json: {
          title: 'Test Song',
          artist: 'Test Artist',
          originalKey: 'C',
          lyrics: '[C]Hello [G]World'
        }
      });
    });

    await page.route('**/api/theater/song-preferences/*', async route => {
      await route.fulfill({ status: 200, json: {} });
    });
  });

  test('displays after 1 second and persists state on close', async ({ page }) => {
    const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.UtbyLMnxY8d0t7MsyIoizRwjKoQyZUC0TdHE-wAJSYkAzFnH1AIXDcbWTAEz4l_wTc6QiXEbC3JfkYQ80GSlbwWpmEuPnLNTseqej712FywzFPHz-SptzffIyVN7YIHlvEtm-EXrFJT5OPo8Nuqpj_qn_fxUgD_S_FaxH44ASGVu_qUbopMcYBA87waWD-sZlvIf94RSCJbMTlNyO-nboLhi23tAwhBQqs-AXJxcbUp1R_XRDtBsEno4e-YgNkpy0LpT10nBqzTuiE1pu-UxjFOOmhYRHIgJ5LlPbF-NIHWiBh4L_c3M_HTw7RLDTzcQHdfesdCLXkOUIsJOnawGDQ';
    
    // Login
    await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Now go to the song page
    await page.goto('/songs/view/1');
    
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
