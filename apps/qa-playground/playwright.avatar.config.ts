import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * Avatar QA — functional + accessibility automation.
 *
 * Reports:
 * - `test-results/avatar-playwright.json` — dashboard ingest
 * - `test-results/avatar-axe-violations.json` — axe summary
 * - `test-results/avatar-accessibility-axe-report.html` — human-readable axe HTML
 * - `playwright-report/avatar/` — trace + failure screenshots
 *
 * Tags: `--grep "@Smoke"` | `--grep "@Functional"` | `--grep "@Accessibility"`
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/avatar-qa.spec.ts', '**/avatar-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['line'],
    ['html', { outputFolder: 'playwright-report/avatar', open: 'never' }],
    ['json', { outputFile: path.join('test-results', 'avatar-playwright.json') }],
  ],
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node ../../node_modules/vite/bin/vite.js --host --port 5180',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    cwd: '.',
  },
});
