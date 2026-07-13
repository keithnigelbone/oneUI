/**
 * Tabs — Applitools visual regression checks against the qa-playground.
 *
 * Modelled after apps/button-figma-validation/e2e/applitools-visual.spec.ts.
 * Set APPLITOOLS_API_KEY to enable; all tests skip when the key is absent.
 */

import {
  BatchInfo,
  ClassicRunner,
  Configuration,
  Eyes,
  Target,
} from '@applitools/eyes-playwright';
import { test } from 'playwright/test';

import {
  TABS_PLAYGROUND_ROUTE,
  TABS_ROOT_TESTIDS,
} from './tabs-playground/manifest';

const BATCH_NAME = 'OneUI — Tabs Visual Regression';
const APP_NAME = 'OneUI Components';
const VIEWPORT = { width: 1440, height: 900 } as const;

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

test.describe('Tabs — Applitools Visual Regression', () => {
  const runner = new ClassicRunner();
  const sharedConfiguration = buildConfiguration();

  test.afterAll(async ({}, testInfo) => {
    testInfo.setTimeout(120_000);
    if (!apiKey) return;
    const summary = await runner.getAllTestResults(false);
    // eslint-disable-next-line no-console
    console.log('Applitools summary:', summary);
  });

  // ── 1. Default state — all size variants ────────────────────────────────────

  for (const size of ['s', 'm', 'l'] as const) {
    const testName = `Tabs | size=${size} / horizontal / primary / idle`;

    test(testName, async ({ page }, testInfo) => {
      testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

      await page.goto(TABS_PLAYGROUND_ROUTE);
      await page.getByTestId(TABS_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 30_000 });

      const eyes = new Eyes(runner);
      eyes.setConfiguration(sharedConfiguration);
      await eyes.open(page, APP_NAME, testName, VIEWPORT);

      const region = page.locator('[data-testid="tabs-qa-size"]').first();
      await region.waitFor({ state: 'visible', timeout: 15_000 });

      await eyes.check(
        testName,
        Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
      );

      await eyes.closeAsync();
    });
  }

  // ── 2. Orientation ───────────────────────────────────────────────────────────

  test('Tabs | horizontal / size-m / primary', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | horizontal / size-m / primary';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.horizontal).waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.getByTestId(TABS_ROOT_TESTIDS.horizontal);
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  test('Tabs | vertical / size-m / primary', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | vertical / size-m / primary';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.vertical).waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.getByTestId(TABS_ROOT_TESTIDS.vertical);
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  // ── 3. Interaction states ────────────────────────────────────────────────────

  test('Tabs | idle / horizontal', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | idle / horizontal';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.getByTestId(TABS_ROOT_TESTIDS.default);
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  test('Tabs | focus forced / horizontal', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | focus forced / horizontal';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.interactionFocus).waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.getByTestId(TABS_ROOT_TESTIDS.interactionFocus);
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  test('Tabs | selected / states-band', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | selected / states-band';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.states).waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.getByTestId(TABS_ROOT_TESTIDS.states);
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  test('Tabs | disabled / states-band', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | disabled / states-band';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.states).waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.getByTestId(TABS_ROOT_TESTIDS.states);
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  // ── 4. Slots ─────────────────────────────────────────────────────────────────

  test('Tabs | with-icons / start+end slots', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | with-icons / start+end slots';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.withIcons).waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.getByTestId(TABS_ROOT_TESTIDS.withIcons);
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  // ── 5. Appearance strip ───────────────────────────────────────────────────────

  test('Tabs | appearance strip / all roles', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | appearance strip / all roles';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.locator('[data-section="tabs-qa-appearance-strip"]').waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.locator('[data-section="tabs-qa-appearance-strip"]');
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  // ── 6. Surface context ────────────────────────────────────────────────────────

  test('Tabs | combo matrix / all combos', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | combo matrix / all combos';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.locator('[data-section="tabs-qa-combos"]').waitFor({ state: 'visible', timeout: 30_000 });

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    const region = page.locator('[data-section="tabs-qa-combos"]');
    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });

  // ── 7. Dark mode — key scenarios ─────────────────────────────────────────────

  const darkScenarios = [
    { testid: TABS_ROOT_TESTIDS.default, label: 'default' },
    { testid: TABS_ROOT_TESTIDS.states, label: 'states' },
  ] as const;

  for (const scenario of darkScenarios) {
    const testName = `Tabs | dark / ${scenario.label}`;

    test(testName, async ({ page }, testInfo) => {
      testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

      await page.goto(TABS_PLAYGROUND_ROUTE);
      await page.getByTestId(scenario.testid).waitFor({ state: 'visible', timeout: 30_000 });

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      const eyes = new Eyes(runner);
      eyes.setConfiguration(sharedConfiguration);
      await eyes.open(page, APP_NAME, testName, VIEWPORT);

      const region = page.getByTestId(scenario.testid);
      await eyes.check(
        testName,
        Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
      );

      await eyes.closeAsync();

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });
    });
  }

  // ── 8. Keyboard focus visible ─────────────────────────────────────────────────

  test('Tabs | focus-ring / horizontal', async ({ page }, testInfo) => {
    testInfo.skip(!apiKey, 'Set APPLITOOLS_API_KEY to run Applitools checks.');

    const testName = 'Tabs | focus-ring / horizontal';
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await page.getByTestId(TABS_ROOT_TESTIDS.interactionFocus).waitFor({ state: 'visible', timeout: 30_000 });

    const region = page.getByTestId(TABS_ROOT_TESTIDS.interactionFocus);
    await region.scrollIntoViewIfNeeded();

    const eyes = new Eyes(runner);
    eyes.setConfiguration(sharedConfiguration);
    await eyes.open(page, APP_NAME, testName, VIEWPORT);

    await eyes.check(
      testName,
      Target.region(region).fully(true).sendDom(true).useDom(true).enablePatterns(true).layout(),
    );

    await eyes.closeAsync();
  });
});
