/**
 * Button — Applitools visual checks against the Button Figma validation Vite app.
 *
 * Brand matrix: `scripts/write-applitools-brand-cases.mts` (via `test:applitools`)
 * writes `applitools-brand-cases.generated.json` before Playwright starts.
 *
 * Matches `@/Users/prathip.kattekola/Documents/OneUI/OneUiStudio_Base_v4` (playwright/test +
 * `playwright` 1.59.x + two-arg `eyes.check`) so Eyes resolves the same `Page` as the spec.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BatchInfo,
  ClassicRunner,
  Configuration,
  Eyes,
  Target,
} from '@applitools/eyes-playwright';
import { test, type Page } from 'playwright/test';

import {
  figmaButtonGridRowTestId,
  type FigmaButtonGridRow,
} from '../src/figmaGridRowTestId';
import type { ApplitoolsBrandCase } from './resolveApplitoolsBrandCases';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIGMA_FIXTURE_PATH = join(__dirname, '../fixtures/figma-parity.fixture.json');
const BRAND_CASES_PATH = join(__dirname, 'applitools-brand-cases.generated.json');

const brandCases: ApplitoolsBrandCase[] = existsSync(BRAND_CASES_PATH)
  ? (JSON.parse(readFileSync(BRAND_CASES_PATH, 'utf8')) as ApplitoolsBrandCase[])
  : [{ mode: 'fixture' }];

const BATCH_NAME = `OneUI — Button Figma Validation (${brandCases.length} brand context${brandCases.length === 1 ? '' : 's'})`;
const APP_NAME = 'OneUI Components';

const VIEWPORT = { width: 1440, height: 900 } as const;

const fixture = JSON.parse(readFileSync(FIGMA_FIXTURE_PATH, 'utf8')) as {
  meta: { grid: { rows: { combinations: FigmaButtonGridRow[] } } };
};

const rows = fixture.meta.grid.rows.combinations;

const apiKey = process.env.APPLITOOLS_API_KEY?.trim();

function buildConfiguration(): Configuration {
  const configuration = new Configuration();
  if (apiKey) {
    configuration.setApiKey(apiKey);
  }
  configuration.setBatch(new BatchInfo({ name: BATCH_NAME }));
  const serverUrl = process.env.APPLITOOLS_SERVER_URL?.trim();
  if (serverUrl) {
    configuration.setServerUrl(serverUrl);
  }
  if (process.env.APPLITOOLS_BRANCH_NAME) {
    configuration.setBranchName(process.env.APPLITOOLS_BRANCH_NAME);
  }
  if (process.env.APPLITOOLS_BASELINE_BRANCH_NAME) {
    configuration.setBaselineBranchName(process.env.APPLITOOLS_BASELINE_BRANCH_NAME);
  }
  if (process.env.APPLITOOLS_BATCH_ACCEPT_NEW === 'true') {
    configuration.setSaveNewTests(true);
  }
  return configuration;
}

function rowTitle(row: FigmaButtonGridRow): string {
  return `Button | ${row.variant} / ${row.attention} / ${row.state} / c=${row.condensed ? '1' : '0'} in=${row.contained ? '1' : '0'} fw=${row.fullWidth ? '1' : '0'} s=${row.start ? '1' : '0'} e=${row.end ? '1' : '0'}`;
}

function eyesTestName(brand: ApplitoolsBrandCase, row: FigmaButtonGridRow): string {
  const prefix = brand.mode === 'fixture' ? '[fixture]' : `[${brand.slug}]`;
  return `${prefix} ${rowTitle(row)}`;
}

async function applyBrandContext(page: Page, brand: ApplitoolsBrandCase): Promise<void> {
  if (brand.mode === 'fixture') {
    await page.addInitScript(() => {
      window.localStorage.setItem('oneui-figma-parity-brand-source', 'fixture');
      window.localStorage.removeItem('oneui-figma-parity-convex-brand-id');
      window.localStorage.setItem('oneui-figma-parity-theme', 'light');
    });
    return;
  }

  await page.addInitScript(
    (id: string) => {
      window.localStorage.setItem('oneui-figma-parity-brand-source', 'convex');
      window.localStorage.setItem('oneui-figma-parity-convex-brand-id', id);
      window.localStorage.setItem('oneui-figma-parity-theme', 'light');
    },
    brand.id,
  );
}

test.describe('Button — Applitools Visual Validation', () => {
  const runner = new ClassicRunner();
  const sharedConfiguration = buildConfiguration();

  test.afterAll(async ({}, testInfo) => {
    testInfo.setTimeout(120_000);
    if (!apiKey) return;
    const summary = await runner.getAllTestResults(false);
    // eslint-disable-next-line no-console
    console.log('Applitools summary:', summary);
  });

  for (const brand of brandCases) {
    for (const row of rows) {
      const title = eyesTestName(brand, row);
      const rowId = figmaButtonGridRowTestId(row);
      const selector = `[data-testrow="${rowId}"]`;

      test(title, async ({ page }, testInfo) => {
        testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

        await applyBrandContext(page, brand);
        await page.goto('/');
        await page.getByTestId('figma-button-grid').waitFor({ state: 'visible', timeout: 30_000 });

        if (brand.mode === 'convex') {
          await page.waitForFunction(
            () => {
              const el = document.getElementById('oneui-foundation-tokens');
              const len = el?.textContent?.length ?? 0;
              return len > 200;
            },
            { timeout: 45_000 },
          );
        }

        const eyes = new Eyes(runner);
        eyes.setConfiguration(sharedConfiguration);

        await eyes.open(page, APP_NAME, title, VIEWPORT);

        const rowEl = page.locator(selector).first();
        await rowEl.waitFor({ state: 'visible', timeout: 15_000 });

        await eyes.check(
          title,
          Target.region(rowEl)
            .fully(true)
            .sendDom(true)
            .useDom(true)
            .enablePatterns(true)
            .layout(),
        );

        await eyes.closeAsync();
      });
    }
  }
});
