import { test, expect } from '@playwright/test';

test('create group and verify admin buttons', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0IiwiZ3JvdXBzIjpbInVzZXIiLCJhdXRoZW50aWNhdGVkIl0sImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjIxMDA1NTIwOTYsImlhdCI6MTc4NTE5MjA5Nn0.hu3rVK_Z6nO8zRa4Xny7EIfb61N1_Hh4sC6ljnuLynygj561wirVmKXeuzaxxmeL28TDBojyvRYV91SNQqUEO17juWTWQQE2sE-_WF24LT0kxCR_AJgrZyl97hrL3caGZqUh9FY1FRC3_9Kt_rLlqMWYnIkEQFKJoHzPwZWOaHu5RK0wW5Ez0v4cScQoB4LYNIq-g3Td-DcyHoCplh57U1o1zlC1natMlJgcw4658-MHOBJ6hZfIoWTqbPzIP4sjryq752XY3nInpe7YsgSgWMNqVCbBOQEudNpaMyfClXMmdCOQu7oxKcqWN3iTtOm101bOq6SDe3CM303ziaoxVA';
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
