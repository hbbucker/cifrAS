import { test, expect } from '@playwright/test';

test.describe('Admin Feedbacks feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login and api
    await page.route('/api/auth/me', async route => {
      await route.fulfill({ json: { id: 'admin1', name: 'Admin', role: 'ADMIN' } });
    });
    
    await page.route('/api/feedbacks', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ 
          json: [
            {
              id: 'fb-1',
              userId: 'User123',
              message: 'Test message',
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ] 
        });
      }
    });

    await page.route('/api/feedbacks/*/reply', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200 });
      }
    });

    await page.goto('/feedbacks');
  });

  test('should list feedbacks, open details and reply', async ({ page }) => {
    // Wait for table to render the mock row
    await expect(page.getByText('Test message')).toBeVisible();
    await expect(page.getByText('Pendente')).toBeVisible();
    
    // Click on the row
    await page.getByText('Test message').click();
    
    // Modal should open
    await expect(page.getByRole('heading', { name: 'Detalhes do Feedback' })).toBeVisible();
    
    // Fill reply textarea
    await page.getByPlaceholder('Escreva a resposta aqui...').fill('Obrigado pelo feedback!');
    
    // Click submit
    await page.getByRole('button', { name: 'Enviar Resposta' }).click();
    
    // Modal should close (we mock the API so it should proceed)
    await expect(page.getByRole('heading', { name: 'Detalhes do Feedback' })).toBeHidden();
  });
});
