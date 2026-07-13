import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * Badge QA — functional + accessibility automation (dashboard + legacy matrix).
 *
 * Reports:
 * - `test-results/badge-playwright.json` — dashboard ingest
 * - `test-results/badge-axe-violations.json` — axe summary
 * - `test-results/badge-accessibility-axe-report.html` — human-readable axe HTML
 * - `playwright-report/badge/` — trace + failure screenshots
 *
 * Tags: `--grep "@Smoke"` | `--grep "@Functional"` | `--grep "@Accessibility"`
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: [
    '**/badge-qa.spec.ts',
    '**/badge-accessibility.spec.ts',
    '**/badge-playground/functional.spec.ts',
    '**/badge-playground/accessibility.spec.ts',
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['line'],
    ['html', { outputFolder: 'playwright-report/badge', open: 'never' }],
    ['json', { outputFile: path.join('test-results', 'badge-playwright.json') }],
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
