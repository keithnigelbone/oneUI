/**
 * QA Playground — Applitools visual checks for every component scenario band.
 *
 * One Eyes checkpoint per `QaStoryBand` (`data-section`) on each `/c/<slug>` page.
 * Scope is driven by `e2e/applitools/registry.ts` (manifest `*_DATA_SECTIONS`).
 *
 * Filter a subset: `APPLITOOLS_COMPONENT_SLUG=badge,switch pnpm test:applitools`
 */

import { randomUUID } from 'node:crypto';

import { BatchInfo, ClassicRunner, Eyes, Target } from '@applitools/eyes-playwright';
import { expect, test } from 'playwright/test';

import { gotoQaPlayground } from './gotoQaPlayground';
import {
  APPLITOOLS_APP_NAME,
  APPLITOOLS_VIEWPORT,
  applitoolsApiKey,
  applitoolsBatchName,
  buildApplitoolsConfiguration,
  readStoryBandTitle,
  screenshotClippedLocator,
  waitForBrandTokens,
} from './helpers';
import { resolveApplitoolsComponents } from './registry';

const apiKey = applitoolsApiKey();

/** When `APPLITOOLS_API_KEY` is unset, omit this suite so CI does not count skipped visual tests. */
if (apiKey) {
  test.describe.configure({ mode: 'serial' });

  const components = resolveApplitoolsComponents();

  for (const component of components) {
    test.describe(`${component.label} — Applitools Visual`, () => {
      const runner = new ClassicRunner();
      const batch = new BatchInfo({
        name: applitoolsBatchName(component.label),
        id:
          process.env.APPLITOOLS_BATCH_ID?.trim() ||
          `qa-playground-${component.slug}-${randomUUID()}`,
      });
      const sharedConfiguration = buildApplitoolsConfiguration(apiKey, batch);

      test.beforeEach(async ({ page }) => {
        const firstSection = component.sections[0];
        if (!firstSection) {
          throw new Error(`${component.slug} has no Applitools sections in registry`);
        }
        await gotoQaPlayground(page, component.route, firstSection);
        await waitForBrandTokens(page);
      });

      for (const sectionId of component.sections) {
        test(sectionId, async ({ page }) => {
          const region = page.locator(`[data-section="${sectionId}"]`);
          await expect(region).toBeVisible({ timeout: 60_000 });

          const stepName = await readStoryBandTitle(region, sectionId);
          const png = await screenshotClippedLocator(page, region);

          const eyes = new Eyes(runner);
          eyes.setConfiguration(sharedConfiguration);
          await eyes.open(page as never, APPLITOOLS_APP_NAME, stepName, APPLITOOLS_VIEWPORT);

          await eyes.check(stepName, Target.buffer(png).layout());

          await eyes.closeAsync();
        });
      }

      test.afterAll(async ({}, testInfo) => {
        testInfo.setTimeout(120_000);
        const summary = await runner.getAllTestResults(false);
        // eslint-disable-next-line no-console
        console.log(`Applitools summary (${component.slug}):`, summary);
      });
    });
  }
}
