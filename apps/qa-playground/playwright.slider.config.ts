import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * Slider QA — functional + accessibility only.
 * Writes JSON to `test-results/slider-playwright.json` and axe artefacts from
 * `e2e/slider-accessibility.spec.ts` for `scripts/ingest-slider-playwright-json.mts`.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/slider-qa.spec.ts', '**/slider-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join('test-results', 'slider-playwright.json') }],
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
