import { test, expect } from '@playwright/test';

test('Evidencia - Aviso de Transposicao', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.UtbyLMnxY8d0t7MsyIoizRwjKoQyZUC0TdHE-wAJSYkAzFnH1AIXDcbWTAEz4l_wTc6QiXEbC3JfkYQ80GSlbwWpmEuPnLNTseqej712FywzFPHz-SptzffIyVN7YIHlvEtm-EXrFJT5OPo8Nuqpj_qn_fxUgD_S_FaxH44ASGVu_qUbopMcYBA87waWD-sZlvIf94RSCJbMTlNyO-nboLhi23tAwhBQqs-AXJxcbUp1R_XRDtBsEno4e-YgNkpy0LpT10nBqzTuiE1pu-UxjFOOmhYRHIgJ5LlPbF-NIHWiBh4L_c3M_HTw7RLDTzcQHdfesdCLXkOUIsJOnawGDQ';
  
  // 1. Login Flow (using mock token)
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await expect(page).toHaveURL(/.*\/dashboard/);

  // 2. Navigate to Songs List
  await page.getByTestId('view-all-btn').click();
  
  // 3. Create New Song
  await page.getByTestId('add-song-btn').click();
  await page.getByTestId('song-title-input').fill('Evidencia Song');
  await page.getByTestId('song-artist-input').fill('Artist');
  await page.getByTestId('song-content-input').fill('[C] Hello [G] World');
  await page.getByTestId('save-song-btn').click();
  await expect(page).toHaveURL(/.*\/songs/);
  
  // 4. View Song
  await page.locator('div[data-testid^="view-song-"]').first().click();
  
  // 5. Transpose the song up once
  await page.getByTestId('transpose-up').click();
  await expect(page.getByTestId('current-key')).toHaveText('C#');
  
  // 6. Click Edit button while transposed
  await page.getByTitle(/Edit|Editar/i).click();
  
  // 7. Verify we are on edit page and the warning is visible
  await expect(page).toHaveURL(/.*\/songs\/edit\/.*/);
  
  // Capture screenshot directly into the artifact directory!
  await page.screenshot({ path: '/home/bucker/.gemini/antigravity-cli/brain/1488ad00-a5ea-4760-b4cc-6e04ba21bbea/evidence-warning.png' });
});
