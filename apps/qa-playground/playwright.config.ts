import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  /** Badge playground suite uses port 5180 — see `playwright.badge.config.ts`. */
  testIgnore: [
    '**/e2e/badge-playground/**',
    '**/e2e/checkbox-qa.spec.ts',
    '**/e2e/avatar-qa.spec.ts',
    '**/e2e/switch-qa.spec.ts',
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/button-playwright.json' }],
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
    // Prefer an existing Vite dev server on 5180 (local dev + agents API runs with CI=1).
    reuseExistingServer: true,
    cwd: '.',
  },
});
