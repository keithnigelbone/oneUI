import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * CheckboxField QA — functional + accessibility only.
 * Writes JSON to `test-results/checkbox-field-playwright.json` and axe artefacts from
 * `e2e/checkbox-field-accessibility.spec.ts` for {@link scripts/ingest-checkbox-field-playwright-json.mts}.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/checkbox-field-qa.spec.ts', '**/checkbox-field-accessibility.spec.ts'],
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join('test-results', 'checkbox-field-playwright.json') }],
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
