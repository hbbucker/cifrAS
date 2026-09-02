import { test, expect } from '@playwright/test';

test.describe('Feedback feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('feature_discovery_03_seen', 'true');
      localStorage.setItem('tour_seen_import-cifraclub', 'true');
    });
    // Basic auth bypass/mock or navigate and login
    // Depending on project, we might need a custom login command or mock route
    await page.route('/api/auth/me', async route => {
      await route.fulfill({ json: { id: '1', name: 'Test User', email: 'test@example.com' } });
    });
    
    await page.route('/api/feedbacks', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201 });
      }
    });

    const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
    await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should open feedback modal, submit and show success', async ({ page }) => {
    // Open user menu
    await page.getByTestId('user-menu-btn').first().click();
    
    // Click feedback button
    await page.getByTestId('feedback-btn').first().click();
    
    // Check modal is visible
    const modalHeading = page.getByRole('heading', { name: 'Envie seu Feedback' });
    await expect(modalHeading).toBeVisible();
    
    // Fill textarea
    await page.getByPlaceholder('Digite sua mensagem aqui...').fill('O app está ótimo!');
    
    // Submit
    await page.getByRole('button', { name: 'Enviar' }).click();
    
    // Check for success toast text
    await expect(page.getByText('Recebemos seu feedback!')).toBeVisible();
  });
});
