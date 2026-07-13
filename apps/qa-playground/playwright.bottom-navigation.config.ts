import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * Bottom Navigation QA — functional + accessibility only.
 * Writes JSON to `test-results/bottom-navigation-playwright.json` and axe artefacts from
 * `e2e/bottom-navigation-accessibility.spec.ts` for {@link scripts/ingest-bottom-navigation-playwright-json.mts}.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/bottom-navigation-qa.spec.ts', '**/bottom-navigation-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /** Single worker avoids fork exhaustion when many axe scans run in parallel. */
  workers: 1,
  reporter: [
    ['list'],
    ['line'],
    ['html', { outputFolder: 'playwright-report/bottom-navigation', open: 'never' }],
    ['json', { outputFile: path.join('test-results', 'bottom-navigation-playwright.json') }],
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
