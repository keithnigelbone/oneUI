import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from 'playwright/test';

/** Figma parity (computed CSS + screenshots). Applitools: `playwright.applitools.config.ts`. */
const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appRoot, '..', '..');
const viteConfigPath = path.join(appRoot, 'vite.config.ts');

export default defineConfig({
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  testDir: path.join(appRoot, 'e2e'),
  testMatch: 'figma-parity.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `pnpm --dir "${monorepoRoot}" exec vite --config "${path.relative(monorepoRoot, viteConfigPath)}"`,
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
  },
});
