import { test, expect } from '@playwright/test';

test.describe('Google Drive Import', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set English language for consistent E2E text matching
    await context.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    // Mock Auth
    await page.route('**/api/integrations/google/auth-url', async (route) => {
      await route.fulfill({ json: { url: 'https://mock-google-auth.com' } });
    });

    // Mock Files List
    await page.route('**/api/integrations/google/drive/files', async (route) => {
      await route.fulfill({
        json: [
          { id: '123', name: 'My Worship Song.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
          { id: '456', name: 'Another Song.doc', mimeType: 'application/msword' }
        ]
      });
    });

    // Mock Extract Text
    await page.route('**/api/integrations/google/drive/extract-text/123', async (route) => {
      await route.fulfill({
        json: { text: '[C]This is the [G]extracted text\n[Am]From Google [F]Drive!' }
      });
    });
  });

  test('Should import song from Google Drive successfully', async ({ page }) => {
    // 1. Perform UI Login
    const testEmail = process.env.E2E_USER || `test_${Date.now()}@example.com`;
    const testPassword = process.env.E2E_PASSWORD || 'password123';

    // Register first if needed
    if (!process.env.E2E_USER) {
      await page.goto('/register');
      await page.getByTestId('name-input').fill('Test User');
      await page.getByTestId('reg-email-input').fill(testEmail);
      await page.getByTestId('reg-password-input').fill(testPassword);
      await page.getByTestId('reg-confirm-password-input').fill(testPassword);
      await page.getByTestId('register-btn').click();
      
      try {
        await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
      } catch (e) {
        // ignore
      }
    }

    await page.goto('/login');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('login-btn').click();

    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Go to New Song
    await page.goto('/songs/new');
    
    // Expect the page to be loaded
    await expect(page.getByText('Chords & Lyrics')).toBeVisible();

    // Click on the Import from Google Drive button
    const importBtn = page.getByTestId('btn-open-drive-picker');
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    // Verify modal opens
    const modalHeading = page.getByText('Select Document from Google Drive');
    await expect(modalHeading).toBeVisible();

    // Verify mocked files are listed
    await expect(page.getByText('My Worship Song.docx')).toBeVisible();
    await expect(page.getByText('Another Song.doc')).toBeVisible();

    // Click on the first file
    await page.getByText('My Worship Song.docx').click();

    // Wait for the modal to close and text to be imported
    await expect(modalHeading).toBeHidden();
    
    // Verify the text was inserted into the textarea
    const textarea = page.getByTestId('song-content-input');
    await expect(textarea).toHaveValue('[C]This is the [G]extracted text\n[Am]From Google [F]Drive!');

    // Wait for the success toast
    await expect(page.getByText('Text imported successfully. Please review the chords and lyrics.')).toBeVisible();
  });
});
