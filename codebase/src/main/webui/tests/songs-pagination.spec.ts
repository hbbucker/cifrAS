import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_02_seen', 'true');
  });
});

test('Songs Pagination and Sticky Header', async ({ page }) => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QuY2lmcmFzLmNvbSIsInN1YiI6ImUyZS11c2VyLTEyMzQiLCJ1cG4iOiJlMmUtdXNlci0xMjM0Iiwicm9sZSI6WyJ1c2VyIiwiYXV0aGVudGljYXRlZCJdLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTAyMTU2NTQxLCJpYXQiOjE3ODY3OTY1NDF9.ays3isbuaqCirzrSTZpZC6J9pq1GLElKRYrcnovrRxXKTb3vR8UOxkUKJJlhOsi8iAk-7yGexVq1NglMxPFqyf3pvVHgaELvFYi0w99LZWM7qO6zKTkABjqHM2iXU9LD5Q05uHyR1M0EeATuBbfzEGCj8Nd3hPSo0j2OoaafCOVB2ugcOVJ5fz0UXgHM9Xuc8uTy3ZKFxjVlk91soU3Y6dMq49_vkPrKnZVBAAvl4HNT2Zvabg8iKPUhFDOTTBazWUthaN4UU6U2HuFEeBknEGSDpYO2Uv9VJ8Zx0ttzDJhy56lWgXM-T9EoGMe3qPCg29mzhhtwxmnTVDZMfWiTPQ';
  
  // Mock API to return paginated response
  await page.route('**/api/songs*', async (route) => {
    const url = new URL(route.request().url());
    const pageParam = parseInt(url.searchParams.get('page') || '1');
    const qParam = url.searchParams.get('search') || '';

    // Simulate 45 total songs
    const totalCount = qParam === 'song' ? 45 : qParam !== '' ? 2 : 45;
    
    const items = [];
    const limit = 20;
    const start = (pageParam - 1) * limit;
    const end = Math.min(start + limit, totalCount);

    for (let i = start; i < end; i++) {
      items.push({
        id: `song-${i}`,
        title: `Mock Song ${i + 1} ${qParam}`,
        artist: 'Artist',
        keySignature: 'C',
        isFavorite: false,
        categories: []
      });
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items, totalCount })
    });
  });

  // Login
  await page.goto(`/auth/callback#access_token=${mockJwt}&refresh_token=dummy`);
  await expect(page).toHaveURL(/.*\/dashboard/);
  
  // Go to songs list directly
  await page.goto('/songs');
  await expect(page.locator('h1')).toHaveText('My Repertoire');

  // Verify total count
  await expect(page.getByText('45 songs')).toBeVisible();

  // Verify Pagination is present (should be on page 1, next button visible)
  const pagination = page.locator('.flex.items-center.justify-center.gap-1');
  await expect(pagination).toBeVisible();
  
  // Page 1 is active
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveClass(/bg-\[#aa3bff\]/);
  
  // Click Page 3
  await page.getByRole('button', { name: 'Page 3' }).click();
  await expect(page.getByRole('button', { name: 'Page 3' })).toHaveClass(/bg-\[#aa3bff\]/);
  await expect(page.getByText('Mock Song 41')).toBeVisible();

  // Search input - reset page to 1
  const searchInput = page.getByPlaceholder('Search songs...');
  await searchInput.fill('song');
  
  // Wait for debounce and verify page 1 is active again
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveClass(/bg-\[#aa3bff\]/);
  await expect(page.getByText('Mock Song 1 song')).toBeVisible();

  // Clear search 
  await page.getByRole('button', { name: 'Clear search' }).click();
  // Should reload and stay on page 1
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveClass(/bg-\[#aa3bff\]/);
  await expect(page.getByText('Mock Song 1')).toBeVisible();

  // Test Scroll to Top
  // We can evaluate scrollY in the scroll container
  const scrollContainer = page.locator('.overflow-y-auto').last();
  await scrollContainer.evaluate(node => node.scrollTo(0, 500));
  
  // Go to page 2
  await page.getByRole('button', { name: 'Page 2' }).click();
  
  // Check if scroll container scrollY is 0 (due to smooth scroll, wait a bit)
  await page.waitForTimeout(500);
  const scrollY = await scrollContainer.evaluate(node => node.scrollTop);
  expect(scrollY).toBe(0);
});
