/**
 * Shared helpers for Tabs Playwright automation.
 */
export {
  formatAxeViolations,
  runTabsAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeTabsAxeArtefact,
  writeTabsAxeHtmlReport,
} from '../tabs-playground/axeTabsPlayground';
export {
  clickTab,
  expectFocusVisible,
  expectHorizontalTabLayout,
  expectTabNotSelected,
  expectTabSelected,
  expectVerticalTabLayout,
  scrollToTabsTestId,
  selectedTab,
  tabButtons,
  tabByIndex,
  tabsList,
  tabsWrap,
  tabbableTab,
} from '../tabs-playground/tabsHelpers';
export { gotoTabsPlayground } from '../tabs-playground/gotoTabsPlayground';

import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  TABS_PLAYGROUND_ROUTE,
  TABS_ROOT_TESTIDS,
  TABS_SHOWCASE_AXE_SCOPE,
  TABS_SMOKE_TESTID,
} from '../tabs-playground/manifest';
import { tabsList } from '../tabs-playground/tabsHelpers';

export { TABS_PLAYGROUND_ROUTE, TABS_SHOWCASE_AXE_SCOPE };

export const TabsTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const TABS_TAG_SET = {
  functional: [TabsTags.functional],
  accessibility: [TabsTags.accessibility],
  smoke: [TabsTags.functional, TabsTags.smoke],
} as const;

const LOG_PREFIX = '[Tabs QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openTabsTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Tabs playground', async () => {
    await page.goto(TABS_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Tabs', level: 1 })).toBeVisible();
    await tabsList(page, TABS_ROOT_TESTIDS.horizontal).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

