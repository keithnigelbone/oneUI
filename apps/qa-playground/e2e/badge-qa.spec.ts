/**
 * Badge — functional Playwright automation.
 *
 * Playground source: `src/components/badge/BadgeQaShowcase.tsx`
 * Anchors: `e2e/badge-playground/manifest.ts`
 *
 * Legacy matrix tests remain in `e2e/badge-playground/functional.spec.ts`.
 */
import { expect, test } from 'playwright/test';

import {
  APPEARANCE_COLOUR_SAMPLE,
  attachConsoleErrorCollector,
  assertNoConsoleErrors,
  BadgeTags,
  BADGE_TAG_SET,
  clickPageThemeButton,
  expectBadgeVisible,
  expectSectionVisible,
  isFullyTransparentBackground,
  openBadgeTestScenarios,
  qaLog,
  qaStep,
  readComputedRgb,
  switchPlaygroundToDarkTheme,
} from './badge/badge-qa-support';
import {
  BADGE_ALL_TESTIDS,
  BADGE_APPEARANCE_KEYS,
  BADGE_ATTENTION_BOTH_SLOT_PREFIXES,
  BADGE_ATTENTIONS,
  BADGE_COMBO_COUNT,
  BADGE_DATA_SECTIONS,
  BADGE_ROOT_TESTIDS,
  BADGE_SIZE_ORDER_FIGMA,
  badgeAppearanceTestId,
  badgeAttentionBothSlotsTestId,
  badgeAttentionTestId,
  badgeComboTestId,
  badgeSizeTestId,
  FIGMA_TO_CODE_SIZE,
} from './badge-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openBadgeTestScenarios(page);
});

test.describe('Functional', { tag: BADGE_TAG_SET.functional }, () => {
  test.describe('Smoke', { tag: BADGE_TAG_SET.smoke }, () => {
    test('Visitor sees the Badge playground and default label badge', async ({ page }) => {
      await qaStep('Confirm page chrome and scenario tabs', async () => {
        await expect(page.getByRole('heading', { name: 'Badge', level: 1 })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
      });

      await qaStep('Default badge scenario is visible', async () => {
        await expectBadgeVisible(
          page,
          BADGE_ROOT_TESTIDS.default,
          'Default Badge should render in the first story band',
        );
      });
    });

    test('Visitor can switch light/dark theme from the page header', async ({ page }) => {
      const { before, after } = await clickPageThemeButton(page);
      expect(before, 'Theme button label should change after click').not.toEqual(after);
    });
  });

  test.describe('Playground scenario bands', { tag: [BadgeTags.functional] }, () => {
    test('Size band shows Figma scale XS through XL', async ({ page }) => {
      for (const figma of ['XS', 'M', 'XL'] as const) {
        await expectBadgeVisible(
          page,
          badgeSizeTestId(figma),
          `Size ${figma} badge should render`,
        );
      }
    });

    test('Attention band shows high, medium, and low emphasis', async ({ page }) => {
      for (const level of BADGE_ATTENTIONS) {
        await expectBadgeVisible(
          page,
          badgeAttentionTestId(level),
          `Badge with attention="${level}" should be visible`,
        );
      }
    });

    test('Start and end slot bands document Icon, Avatar, CounterBadge, and IndicatorBadge', async ({
      page,
    }) => {
      await expectBadgeVisible(page, 'badge-start-Icon', 'Start Icon slot badge');
      await expectBadgeVisible(page, 'badge-end-CounterBadge', 'End CounterBadge slot badge');
    });

    test('Combination matrix renders all documented prop mixes', async ({ page }) => {
      for (let i = 0; i < BADGE_COMBO_COUNT; i++) {
        await qaStep(`Combo row ${i + 1} of ${BADGE_COMBO_COUNT}`, async () => {
          await expectBadgeVisible(
            page,
            badgeComboTestId(i),
            `Combination matrix row ${i} should be visible`,
          );
        });
      }
    });
  });

  test.describe('Group 1 — Render', { tag: [BadgeTags.functional] }, () => {
    test('Page loads cleanly and default Badge matches showcase props', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openBadgeTestScenarios(page);

      await qaStep('No browser console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });

      await qaStep('Default badge is visible with expected API attributes', async () => {
        const el = await expectBadgeVisible(
          page,
          BADGE_ROOT_TESTIDS.default,
          'Default badge must be visible after navigation',
        );
        await expect(el, 'Badge root exposes role="status"').toHaveAttribute('role', 'status');
        await expect(el, 'Default size is M').toHaveAttribute('data-size', 'm');
        await expect(el, 'Default variant is bold (high attention default)').toHaveAttribute(
          'data-variant',
          'bold',
        );
        await expect(el, 'Accessible name from aria-label').toHaveAccessibleName(/Default badge/i);
        await expect(el, 'Label text renders').toContainText('Label');
      });
    });

    test('Every playground data-testid renders without error text', async ({ page }) => {
      test.setTimeout(120_000);
      qaLog('Validating all manifest testids', { count: BADGE_ALL_TESTIDS.length });

      for (const testId of BADGE_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const el = page.getByTestId(testId);
          await el.scrollIntoViewIfNeeded();
          await expect(el, `Playground anchor "${testId}" should be visible`).toBeVisible();
          await expect(el, `Anchor "${testId}" should not show runtime error copy`).not.toContainText(
            /error|failed/i,
          );
        });
      }
    });

    test('Every story band (data-section) is visible on the page', async ({ page }) => {
      for (const section of BADGE_DATA_SECTIONS) {
        await qaStep(`Story band: ${section}`, async () => {
          await expectSectionVisible(page, section);
        });
      }
    });
  });

  test.describe('Group 2 — Props validation', { tag: [BadgeTags.functional] }, () => {
    test('Size prop maps Figma labels to code data-size values', async ({ page }) => {
      for (const figma of BADGE_SIZE_ORDER_FIGMA) {
        await qaStep(`Figma size ${figma} → data-size="${FIGMA_TO_CODE_SIZE[figma]}"`, async () => {
          const el = page.getByTestId(badgeSizeTestId(figma));
          await el.scrollIntoViewIfNeeded();
          await expect(el).toHaveAttribute('data-size', FIGMA_TO_CODE_SIZE[figma]);
        });
      }
    });

    test('Attention maps to variant tokens on the DOM', async ({ page }) => {
      const expected: Record<(typeof BADGE_ATTENTIONS)[number], string> = {
        high: 'bold',
        medium: 'subtle',
        low: 'ghost',
      };
      for (const attention of BADGE_ATTENTIONS) {
        await qaStep(`attention="${attention}" → variant="${expected[attention]}"`, async () => {
          await expect(page.getByTestId(badgeAttentionTestId(attention))).toHaveAttribute(
            'data-variant',
            expected[attention],
          );
        });
      }
    });

    test('Appearance prop surfaces on each Figma role row', async ({ page }) => {
      for (const appearance of BADGE_APPEARANCE_KEYS) {
        await qaStep(`appearance="${appearance}"`, async () => {
          const el = page.getByTestId(badgeAppearanceTestId(appearance));
          await el.scrollIntoViewIfNeeded();
          if (appearance === 'auto') {
            expect(await el.getAttribute('data-appearance'), 'auto should resolve to a role').toBeTruthy();
          } else {
            await expect(el).toHaveAttribute('data-appearance', appearance);
          }
        });
      }
    });

    test('Badge sizes grow progressively from XS to XL', async ({ page }) => {
      const widths: number[] = [];
      for (const figma of BADGE_SIZE_ORDER_FIGMA) {
        await qaStep(`Measure bounding box: ${figma}`, async () => {
          const el = page.getByTestId(badgeSizeTestId(figma));
          await el.scrollIntoViewIfNeeded();
          const box = await el.boundingBox();
          expect(box, `${figma} should have a measurable box`).not.toBeNull();
          widths.push(box!.width);
        });
      }
      for (let i = 1; i < widths.length; i++) {
        expect(
          widths[i]!,
          `Size step ${i} should be >= previous (allow 2px tolerance)`,
        ).toBeGreaterThanOrEqual(widths[i - 1]! - 2);
      }
    });

  });

  test.describe('Group 3 — Click interaction (N/A)', { tag: [BadgeTags.functional] }, () => {
    test('Badge is display-only and not activated by click', async ({ page }) => {
      const el = page.getByTestId(BADGE_ROOT_TESTIDS.default);
      await expect(el).toHaveAttribute('role', 'status');
      const tabIndex = await el.getAttribute('tabindex');
      expect(tabIndex === null || tabIndex === '-1', 'Badge should not be in tab order').toBe(true);
    });
  });

  test.describe('Group 4 — Keyboard (N/A)', { tag: [BadgeTags.functional] }, () => {
    test('Tab focus stays on page chrome, not Badge instances', async ({ page }) => {
      await page.keyboard.press('Tab');
      const activeTestId = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid') ?? '',
      );
      expect(activeTestId.startsWith('badge-'), 'Focus should not land on a Badge test id').toBe(false);
    });
  });

  test.describe('Group 5 — Focus (N/A)', { tag: [BadgeTags.functional] }, () => {
    test('Clicking Badge does not move focus to the Badge root', async ({ page }) => {
      await page.getByTestId(BADGE_ROOT_TESTIDS.default).click({ force: true });
      const activeId = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid') ?? '',
      );
      expect(activeId, 'Focus should remain outside Badge').not.toBe(BADGE_ROOT_TESTIDS.default);
    });
  });

  test.describe('Group 6 — State', { tag: [BadgeTags.functional] }, () => {
    test('Default state renders label text with bold variant', async ({ page }) => {
      const el = page.getByTestId(BADGE_ROOT_TESTIDS.default);
      await expect(el).toHaveAttribute('data-variant', 'bold');
      await expect(el).toContainText('Label');
    });

    test('Low attention uses ghost variant styling vs high bold', async ({ page }) => {
      const low = page.getByTestId(badgeAttentionTestId('low'));
      const high = page.getByTestId(badgeAttentionTestId('high'));
      await expect(low).toHaveAttribute('data-variant', 'ghost');
      await expect(high).toHaveAttribute('data-variant', 'bold');
      const lowOpacity = parseFloat(await low.evaluate((n) => getComputedStyle(n).opacity));
      const highOpacity = parseFloat(await high.evaluate((n) => getComputedStyle(n).opacity));
      expect(lowOpacity, 'Low attention should be no more opaque than high').toBeLessThanOrEqual(highOpacity);
    });
  });

  test.describe('Group 7 — Slots', { tag: [BadgeTags.functional] }, () => {
    test('start=none renders only the label wrapper', async ({ page }) => {
      const el = page.getByTestId('badge-start-none');
      await expect(el.locator(':scope > span')).toHaveCount(1);
    });

    test('start=Icon renders svg in the first slot span', async ({ page }) => {
      const el = page.getByTestId('badge-start-Icon');
      await expect(el.locator(':scope > span').first().locator('svg')).toBeVisible();
    });

    test('start=Avatar renders avatar content in the first slot', async ({ page }) => {
      const first = page.getByTestId('badge-start-Avatar').locator(':scope > span').first();
      const hasImg = (await first.locator('img').count()) > 0;
      const hasSvg = (await first.locator('svg').count()) > 0;
      expect(hasImg || hasSvg, 'Avatar slot should render image or icon').toBe(true);
    });

    test('start=CounterBadge shows counter value in the start slot', async ({ page }) => {
      const first = page.getByTestId('badge-start-CounterBadge').locator(':scope > span').first();
      await expect(first.getByText('3', { exact: true })).toBeVisible();
    });

    test('end=Icon renders svg in the last slot span', async ({ page }) => {
      const el = page.getByTestId('badge-end-Icon');
      await expect(el.locator(':scope > span').last().locator('svg')).toBeVisible();
    });

    test('start and end Icon slots both render when combined', async ({ page }) => {
      const el = page.getByTestId('badge-start-icon-end-icon');
      await expect(el.locator(':scope > span').first().locator('svg')).toBeVisible();
      await expect(el.locator(':scope > span').last().locator('svg')).toBeVisible();
    });

    test('Attention + both-slots rows render start and end for each slot type', async ({ page }) => {
      for (const prefix of BADGE_ATTENTION_BOTH_SLOT_PREFIXES) {
        await qaStep(prefix, async () => {
          const el = page.getByTestId(badgeAttentionBothSlotsTestId(prefix, 'high'));
          await el.scrollIntoViewIfNeeded();
          await expect(el.locator(':scope > span').first()).toBeVisible();
          await expect(el.locator(':scope > span').last()).toBeVisible();
        });
      }
    });
  });

  test.describe('Group 8 — Toggle (N/A)', { tag: [BadgeTags.functional] }, () => {
    test('Badge does not support selection or toggle', async () => {
      qaLog('Skipped — not applicable to display Badge');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [BadgeTags.functional] }, () => {
    test('Badge does not accept typed input', async () => {
      qaLog('Skipped — not applicable to display Badge');
    });
  });

  test.describe('Group 10 — Dependencies', { tag: [BadgeTags.functional] }, () => {
    test('Attention alias resolves variant when variant prop is omitted', async ({ page }) => {
      await expect(page.getByTestId(badgeAttentionTestId('medium'))).toHaveAttribute(
        'data-variant',
        'subtle',
      );
    });
  });

  test.describe('Group 11 — Content and display', { tag: [BadgeTags.functional] }, () => {

    test('Slot Icon uses decorative svg (aria-hidden) inside start slot', async ({ page }) => {
      const root = page.getByTestId('badge-start-Icon');
      const svg = root.locator('svg').first();
      await expect(svg).toBeVisible();
      await expect(svg, 'Home icon in slot is decorative').toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('Group 12 — Layout and responsive', { tag: [BadgeTags.functional] }, () => {
    test('Playground fits narrow mobile width without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openBadgeTestScenarios(page);

      for (const section of BADGE_DATA_SECTIONS) {
        await qaStep(`No overflow in ${section}`, async () => {
          const band = page.locator(`[data-section="${section}"]`);
          await band.scrollIntoViewIfNeeded();
          const overflows = await band.evaluate(
            (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 2,
          );
          expect(overflows, `Band "${section}" should not scroll horizontally`).toBe(false);
        });
      }
    });

    test('Playground remains usable on large desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openBadgeTestScenarios(page);
      await expectBadgeVisible(page, BADGE_ROOT_TESTIDS.default, 'Default badge on desktop');
      await expectBadgeVisible(page, badgeSizeTestId('M'), 'Medium size badge on desktop');
    });
  });

  test.describe('Group 13 — Dark mode', { tag: [BadgeTags.functional] }, () => {
    test('All story bands and sample badges remain visible in dark theme', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);

      for (const section of BADGE_DATA_SECTIONS) {
        await expect(
          page.locator(`[data-section="${section}"]`),
          `Band "${section}" should be visible in dark mode`,
        ).toBeVisible();
      }

      const spotCheck = [
        BADGE_ROOT_TESTIDS.default,
        badgeSizeTestId('M'),
        badgeAppearanceTestId('primary'),
        badgeComboTestId(0),
      ] as const;
      for (const testId of spotCheck) {
        await expectBadgeVisible(page, testId, `${testId} visible in dark mode`);
      }
    });
  });
});
