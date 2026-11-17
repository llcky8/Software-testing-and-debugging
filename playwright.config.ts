import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Local runs read credentials from .env; in CI they come from GitHub secrets
if (existsSync('.env')) process.loadEnvFile('.env');

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  reporter: isCI
    ? [['list'], ['blob'], ['junit', { outputFile: 'reports/junit.xml' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});