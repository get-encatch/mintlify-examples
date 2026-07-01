import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3333',
    trace: 'off',
  },
  webServer: {
    command: 'bash scripts/mint-dev.sh',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
  expect: { timeout: 15_000 },
});
