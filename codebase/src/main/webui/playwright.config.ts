import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

// For E2E tests, ignore static user env variables to run hermetically with unique registered users
delete process.env.E2E_USER;
delete process.env.E2E_PASSWORD;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'en-US'
      },
    },
  ],
  webServer: {
    command: 'cd ../../.. && ./mvnw compile quarkus:dev -Dquarkus.http.port=8080 -Dquarkus.profile=e2e',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
