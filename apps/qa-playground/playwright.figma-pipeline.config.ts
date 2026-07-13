import { defineConfig, devices } from 'playwright/test';

const baseURL = 'http://localhost:3333';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/figma-pipeline-2459*.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/figma-pipeline-2459.json' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'PORT=3333 node ../../node_modules/vite/bin/vite.js --host --port 3333',
    url: baseURL,
    reuseExistingServer: true,
    cwd: '.',
  },
});
