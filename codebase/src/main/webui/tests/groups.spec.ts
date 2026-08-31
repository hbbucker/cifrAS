import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_03_seen', 'true');
    localStorage.setItem('tour_seen_import-cifraclub', 'true');
  });
});

test('create group, verify tabs, member list and invite button', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await expect(page).toHaveURL(/.*\/dashboard/);

  await page.getByTestId('sidebar').getByText('Groups').click();
  await expect(page.locator('h1')).toHaveText('Groups');

  const groupName = `E2E Band ${Date.now()}`;
  await page.getByText('New Group').click();
  await page.getByPlaceholder('Group Name').fill(groupName);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('Group created successfully')).toBeVisible();

  await page.getByText(groupName).click();
  await expect(page.locator('h1')).toHaveText(groupName);

  // Verify tabs
  await expect(page.getByTestId('tab-playlists')).toBeVisible();
  await expect(page.getByTestId('tab-members')).toBeVisible();

  // Switch to Members tab
  await page.getByTestId('tab-members').click();
  await expect(page.getByTestId('invite-member-btn')).toBeVisible();
  await expect(page.getByText('Owner', { exact: false })).toBeVisible();

  // Open invite modal
  await page.getByTestId('invite-member-btn').click();
  
  // Now it's a share link modal
  await expect(page.getByRole('button', { name: /Gerar Link|Generate Link/i })).toBeVisible();
  
  // Click Cancel to dismiss
  await page.getByRole('button', { name: /Cancel/i }).click();
});
