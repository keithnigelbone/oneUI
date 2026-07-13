/**
 * Applitools Eyes — QA Playground at **http://localhost:5180/c/<slug>**.
 *
 * One checkpoint per `QaStoryBand` (`data-section`) per component.
 * Requires `APPLITOOLS_API_KEY` in monorepo `.env.local` (and `APPLITOOLS_SERVER_URL` for Jio Eyes).
 *
 * Filter: `APPLITOOLS_COMPONENT_SLUG=badge,switch`
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from 'playwright/test';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appRoot, '..', '..');
const applitoolsTestDir = path.join(appRoot, 'e2e', 'applitools');

function applyDotEnvFile(filePath: string, overrideExisting: boolean): void {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.replace(/\r$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const stripped = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eq = stripped.indexOf('=');
    if (eq === -1) continue;
    const key = stripped.slice(0, eq).trim();
    if (!key) continue;
    let value = stripped.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (overrideExisting || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

applyDotEnvFile(path.join(monorepoRoot, '.env.local'), true);
applyDotEnvFile(path.join(monorepoRoot, '.env'), false);

export default defineConfig({
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  testDir: applitoolsTestDir,
  testMatch: ['qa-playground-visual.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: {
    baseURL: 'http://localhost:5180',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  snapshotDir: path.join(applitoolsTestDir, '__snapshots__'),
  webServer: {
    command: 'node ../../node_modules/vite/bin/vite.js --host --port 5180',
    cwd: appRoot,
    url: 'http://localhost:5180',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
