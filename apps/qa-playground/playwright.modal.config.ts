import { defineConfig, devices } from 'playwright/test';

/**
 * Modal QA — Playwright JSON for `public/qa-reports/modal-summary.json`
 * (see `scripts/ingest-modal-playwright-json.mts`).
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/modal-qa.spec.ts', '**/modal-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/modal-playwright.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 8_000,
  },
  expect: {
    timeout: 5_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node ../../node_modules/vite/bin/vite.js --host --port 5180',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    cwd: '.',
  },
});
