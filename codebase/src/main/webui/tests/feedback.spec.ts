import { test, expect } from '@playwright/test';

test.describe('Feedback feature', () => {
  test.beforeEach(async ({ page }) => {
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

    // Go to dashboard to trigger main layout
    await page.goto('/dashboard');
  });

  test('should open feedback modal, submit and show success', async ({ page }) => {
    // Open user menu
    await page.getByTestId('user-menu-btn').click();
    
    // Click feedback button
    await page.getByTestId('feedback-btn').click();
    
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
