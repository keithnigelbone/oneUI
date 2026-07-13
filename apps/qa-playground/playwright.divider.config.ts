import path from 'node:path';
import { defineConfig, devices } from 'playwright/test';

/**
 * Divider QA — functional + accessibility only.
 * Writes JSON to `test-results/divider-playwright.json` and axe artefacts from
 * `e2e/divider-accessibility.spec.ts` for {@link scripts/ingest-divider-playwright-json.mts}.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/divider-qa.spec.ts', '**/divider-accessibility.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /** Axe section runs are CPU-heavy; cap workers to reduce flaky context teardown. */
  workers: process.env.CI ? 1 : 2,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['json', { outputFile: path.join('test-results', 'divider-playwright.json') }],
  ],
  use: {
    /** Dedicated port so local `pnpm dev` on 5180 does not collide or get mistaken for the e2e server. */
    baseURL: 'http://localhost:5193',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node ../../node_modules/vite/bin/vite.js --host --port 5193',
    url: 'http://localhost:5193',
    reuseExistingServer: true,
    cwd: '.',
  },
});
