import { test, expect } from '@playwright/test';

test('create group and verify admin buttons', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAwNTU1MzkwLCJpYXQiOjE3ODUxOTUzOTB9.UtbyLMnxY8d0t7MsyIoizRwjKoQyZUC0TdHE-wAJSYkAzFnH1AIXDcbWTAEz4l_wTc6QiXEbC3JfkYQ80GSlbwWpmEuPnLNTseqej712FywzFPHz-SptzffIyVN7YIHlvEtm-EXrFJT5OPo8Nuqpj_qn_fxUgD_S_FaxH44ASGVu_qUbopMcYBA87waWD-sZlvIf94RSCJbMTlNyO-nboLhi23tAwhBQqs-AXJxcbUp1R_XRDtBsEno4e-YgNkpy0LpT10nBqzTuiE1pu-UxjFOOmhYRHIgJ5LlPbF-NIHWiBh4L_c3M_HTw7RLDTzcQHdfesdCLXkOUIsJOnawGDQ';
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await expect(page).toHaveURL(/.*\/dashboard/);

  await page.getByTestId('sidebar').getByText('Groups').click();
  await expect(page.locator('h1')).toHaveText('Groups');

  await page.getByText('New Group').click();
  await page.getByPlaceholder('Group Name').fill('teste');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('Group created successfully')).toBeVisible();

  await page.getByText('teste').click();
  await expect(page.locator('h1')).toHaveText('teste');


  await expect(page.getByText('Invite Member')).toBeVisible();
  await expect(page.getByText('Share Playlist')).toBeVisible();
});
