/**
 * Shared Applitools + Playwright helpers for QA playground visual checks.
 *
 * Uses Playwright `clip` screenshots + `Target.buffer` because `Target.region(locator)`
 * is unreliable inside tabbed `ComponentDetailPage` layouts.
 */

import { BatchInfo, Configuration } from '@applitools/eyes-playwright';
import { expect, type Locator, type Page } from 'playwright/test';

export const APPLITOOLS_APP_NAME = 'OneUI Components';
export const APPLITOOLS_VIEWPORT = { width: 1440, height: 900 } as const;

export function applitoolsApiKey(): string | undefined {
  return process.env.APPLITOOLS_API_KEY?.trim() || undefined;
}

export function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function applitoolsBatchName(label: string): string {
  return `OneUI — ${label} QA Playground (Applitools)`;
}

export function buildApplitoolsConfiguration(
  apiKey: string,
  batch: BatchInfo,
): Configuration {
  const configuration = new Configuration();
  configuration.setApiKey(apiKey);
  configuration.setBatch(batch);
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

export async function waitForBrandTokens(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const el = document.getElementById('oneui-foundation-tokens');
      return (el?.textContent?.length ?? 0) > 200;
    },
    { timeout: 45_000 },
  );
}

/** `ComponentDetailPage` — same pattern as functional QA specs. */
export async function ensureTestScenariosTab(page: Page): Promise<void> {
  const tab = page.getByRole('tab', { name: 'Test Scenarios' });
  if ((await tab.count()) === 0) return;
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

type ClipRect = { x: number; y: number; width: number; height: number };

export async function clipLocatorInViewport(page: Page, locator: Locator): Promise<ClipRect> {
  const target = locator.first();
  await target.scrollIntoViewIfNeeded();
  await target.waitFor({ state: 'visible', timeout: 30_000 });

  const box = await target.boundingBox();
  if (!box) {
    throw new Error('Element has no bounding box after scroll');
  }
  const vs = page.viewportSize();
  if (!vs) {
    throw new Error('Page has no viewport size');
  }

  const vx2 = vs.width;
  const vy2 = vs.height;
  const bx2 = box.x + box.width;
  const by2 = box.y + box.height;

  const x0 = Math.max(0, box.x);
  const y0 = Math.max(0, box.y);
  const x1 = Math.min(bx2, vx2);
  const y1 = Math.min(by2, vy2);
  const w = x1 - x0;
  const h = y1 - y0;

  if (w <= 0 || h <= 0) {
    throw new Error(`Clip empty (box=${JSON.stringify(box)} viewport=${JSON.stringify(vs)}).`);
  }

  return {
    x: Math.round(x0),
    y: Math.round(y0),
    width: Math.max(1, Math.round(w)),
    height: Math.max(1, Math.round(h)),
  };
}

export async function screenshotClippedLocator(page: Page, locator: Locator): Promise<Buffer> {
  const clip = await clipLocatorInViewport(page, locator);
  const png = await page.screenshot({ type: 'png', clip });
  return Buffer.from(png);
}

/** Reads the `QaStoryBand` `<h3>` title for stable Applitools step names. */
export async function readStoryBandTitle(region: Locator, fallback: string): Promise<string> {
  const heading = region.locator('h3').first();
  const text = (await heading.textContent())?.trim();
  return text && text.length > 0 ? text : fallback;
}
