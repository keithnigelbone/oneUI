import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * ChipGroup QA — functional + accessibility only.
 * Writes JSON to `test-results/chip-group-playwright.json` and axe artefacts
 * from `e2e/chip-group-accessibility.spec.ts` for
 * `scripts/ingest-chip-group-playwright-json.mts`.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/chip-group-qa.spec.ts', '**/chip-group-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join('test-results', 'chip-group-playwright.json') }],
  ],
  use: {
    baseURL: process.env.QA_BASE_URL ?? 'http://localhost:5180',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node ../../node_modules/vite/bin/vite.js --host --port 5180',
    url: process.env.QA_BASE_URL ?? 'http://localhost:5180',
    reuseExistingServer: true,
    cwd: '.',
  },
});
