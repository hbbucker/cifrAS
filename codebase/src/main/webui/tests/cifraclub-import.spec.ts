import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_03_seen', 'true');
    localStorage.setItem('tour_seen_import-cifraclub', 'true');
  });
});

test.describe('CifraClub Import', () => {
  test.beforeEach(async ({ page, context }) => {
    // Event listeners to capture browser logs, errors, and failed requests in CI/CD
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser PageError] ${err.stack}`));
    page.on('requestfailed', req => console.error(`[Browser RequestFailed] ${req.url()} - ${req.failure()?.errorText}`));

    // Set English language for consistent E2E text matching if necessary, 
    // although our app might use Portuguese translations for these toast messages.
    // Assuming Portuguese based on the component's string 'Música importada com sucesso!'
    await context.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9' });

    // Mock Register
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({ status: 200, json: {} });
    });

    // Mock Login with a valid parsed JWT structure
    await page.route('**/api/auth/login', async (route) => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwidXNlcl9tZXRhZGF0YSI6eyJmdWxsX25hbWUiOiJUZXN0IFVzZXIifX0=.signature';
      await route.fulfill({
        status: 200,
        json: { accessToken: mockToken, refreshToken: 'mock-refresh-token' }
      });
    });

    // Mock Songs list (Dashboard)
    await page.route('**/api/songs', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    // Mock the actual import endpoint
    await page.route('**/api/songs/import', async (route) => {
      await route.fulfill({
        status: 200,
        json: { id: 'imported-song-id', title: 'Imported Song' }
      });
    });
    
    // Mock the imported song details page (which Edit page might try to fetch)
    await page.route('**/api/songs/imported-song-id', async (route) => {
      await route.fulfill({
        status: 200,
        json: { id: 'imported-song-id', title: 'Imported Song', artist: 'Artist', content: 'Lyrics', keySignature: 'C' }
      });
    });
  });

  test('Should import song from CifraClub successfully', async ({ page }) => {
    // 1. Perform UI Login bypass
    const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
    await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);

    await expect(page).toHaveURL(/.*\/dashboard/);

    // Click on the Import button on the Dashboard
    const importBtn = page.getByRole('button', { name: /importar/i }).first();
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    // Verify modal opens
    const modalHeading = page.getByRole('heading', { name: /importar do cifraclub/i });
    await expect(modalHeading).toBeVisible();

    // Fill the URL input
    const urlInput = page.getByPlaceholder('https://www.cifraclub.com.br/...');
    await urlInput.fill('https://www.cifraclub.com.br/band/song');

    // Click Import inside the modal
    const modalImportBtn = page.getByRole('dialog').getByRole('button', { name: /^importar$/i });
    await modalImportBtn.click();

    // Wait for the modal to close and redirection to happen
    await expect(page).toHaveURL(/.*\/songs\/edit\/imported-song-id/);

    // Wait for the success toast
    await expect(page.getByText('Música importada com sucesso!')).toBeVisible();
  });
});
