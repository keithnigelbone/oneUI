import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * Input Feedback QA — functional + accessibility only.
 * Writes JSON to `test-results/input-feedback-playwright.json` for
 * {@link scripts/ingest-input-feedback-playwright-json.mts}.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/input-feedback-qa.spec.ts', '**/input-feedback-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join('test-results', 'input-feedback-playwright.json') }],
  ],
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node ../../node_modules/vite/bin/vite.js --host --port 5180',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    cwd: '.',
  },
});
