import { test, expect } from '@playwright/test';

test('create group and verify admin buttons', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0IiwiZ3JvdXBzIjpbInVzZXIiXSwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6MjA5ODU2ODQwMiwiaWF0IjoxNzgzMjA4NDAyfQ.ZRS-0Wf1Ws6j7PjQGc4lmVQ2H3UbK6616HNp4QZJEBMcO3bNdwEfn05SgXm5gp95knBSpNlS3M8wM0Iqtpthcpmh2JmzL9CfcssJSQPWgEzKGDP4rDt522-LFKAyOd8tLsyJQGt8cgRiY8rbW1Vkaohsl3YG6eIDaOJcnuzKhxfMCOSdEI4D9DCBJojre3xbLON8hqvEDX9WNZ_f86_P58Ttf479hJyjriLAlaGN2uvref3UkPvizALB0pgLovz6H3Vg7MP26LfjnIdwYOjZ8i_wislXNxS7vxfP9XXo3r36tv-A6ivstLXLO8ajivXzfNEBNRSz5ZwLP79d7EMQOQ';
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
