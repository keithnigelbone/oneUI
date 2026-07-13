/**
 * Applitools Eyes — Button Figma validation app (port 3333).
 *
 * Run: `pnpm run test:applitools` from `@oneui/button-figma-validation`.
 *
 * Aligned with `@/Users/prathip.kattekola/Documents/OneUI/OneUiStudio_Base_v4`:
 * `playwright/test` + `playwright/cli.js` + list reporter (no Eyes HTML reporter shim).
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from 'playwright/test';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appRoot, '..', '..');
const viteConfigPath = path.join(appRoot, 'vite.config.ts');

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
  testDir: path.join(appRoot, 'e2e'),
  testMatch: 'applitools-visual.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  /** Avoid `@applitools/eyes-playwright/reporter` — nested `playwright` HTML reporter path breaks with hoisted deps. */
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
