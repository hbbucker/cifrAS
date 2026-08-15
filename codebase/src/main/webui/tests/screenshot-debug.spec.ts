import { test, expect } from '@playwright/test';
test.use({ baseURL: 'http://localhost:5173' });
test('debug screenshot', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
  await page.route('**/api/songs/*', async route => {
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }}); return; }
    await route.fulfill({ status: 200, json: { title: 'Test Song', artist: 'Test Artist', originalKey: 'C', lyrics: '[C]Hello [G]World' }});
  });
  await page.route('**/api/theater/song-preferences/*', async route => {
    await route.fulfill({ status: 200, json: {} });
  });
  await page.addInitScript(() => localStorage.removeItem('feature_discovery_02_seen'));
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await expect(page).toHaveURL(/.*\/dashboard/);
  await page.goto('/songs/view/1');
  await page.waitForTimeout(2000);
  console.log('Taking screenshot');
  await page.screenshot({ path: 'debug.png', fullPage: true });
  console.log('Screenshot taken');
});
