import { test, expect } from '@playwright/test';

test('create group and verify admin buttons', async ({ page }) => {
  const testEmail = `test_group_${Date.now()}@example.com`;
  const testPassword = 'password123';

  await page.goto('/register');
  await page.getByTestId('name-input').fill('Test User Groups');
  await page.getByTestId('reg-email-input').fill(testEmail);
  await page.getByTestId('reg-password-input').fill(testPassword);
  await page.getByTestId('reg-confirm-password-input').fill(testPassword);
  await page.getByTestId('register-btn').click();
  await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });

  await page.getByTestId('email-input').fill(testEmail);
  await page.getByTestId('password-input').fill(testPassword);
  await page.getByTestId('login-btn').click();
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
