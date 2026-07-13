import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * Radio QA — functional + accessibility only.
 * Writes JSON to `test-results/radio-playwright.json` and axe artefacts from
 * `e2e/radio-accessibility.spec.ts` for {@link scripts/ingest-radio-playwright-json.mts}.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/radio-qa.spec.ts', '**/radio-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join('test-results', 'radio-playwright.json') }],
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
