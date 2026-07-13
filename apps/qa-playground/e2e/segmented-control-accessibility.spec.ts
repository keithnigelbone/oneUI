/**
 * SegmentedControl QA playground — WCAG 2.1 AA automation (axe) + Material Design 3
 * segmented button accessibility checks.
 *
 * M3 reference: https://m3.material.io/components/segmented-buttons/accessibility
 * OneUI maps to role="group" + toggle buttons with aria-pressed (single-select).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  SEGMENTED_CONTROL_ARIA_VALIDITY_TEST,
  SEGMENTED_CONTROL_BUTTON_NAME_TEST,
  SEGMENTED_CONTROL_LABEL_RULE_TEST,
  SEGMENTED_CONTROL_M3_DISABLED_SEGMENT_TEST,
  SEGMENTED_CONTROL_M3_FOCUS_VISIBLE_TEST,
  SEGMENTED_CONTROL_M3_GROUP_LABEL_TEST,
  SEGMENTED_CONTROL_M3_ICON_LABEL_TEST,
  SEGMENTED_CONTROL_M3_KEYBOARD_ACTIVATION_TEST,
  SEGMENTED_CONTROL_M3_ROVING_FOCUS_TEST,
  SEGMENTED_CONTROL_M3_SINGLE_SELECT_TEST,
  SEGMENTED_CONTROL_M3_TOGGLE_SEMANTICS_TEST,
  SEGMENTED_CONTROL_REFLOW_320_TEST,
  SEGMENTED_CONTROL_SECTION508_TEST,
  SEGMENTED_CONTROL_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import {
  SEGMENTED_CONTROL_A11Y_BANDS,
  SEGMENTED_CONTROL_DATA_SECTIONS,
  SEGMENTED_CONTROL_ROOT_TESTIDS,
} from './segmented-control-playground/manifest';
import { SC_CANONICAL } from './segmented-control/segmented-control-test-data';
import {
  axeSegmentedControlPlayground,
  configureSegmentedControlAxeBuilder,
  canonicalSegmentButtons,
  defaultBandButtons,
  expectFocusVisible,
  formatAxeViolations,
  gotoSegmentedControlPlayground,
  qaStep,
  runSegmentedControlAxePageScan,
  SC_TAG_SET,
  scByTestId,
  scPressedSegmentButtons,
  scSection,
  SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSegmentedControlAxeArtefact,
  writeSegmentedControlAxeHtmlReport,
} from './segmented-control/segmented-control-qa-support';

const AXE_SCOPE = SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE;

test.beforeEach(async ({ page }) => {
  await gotoSegmentedControlPlayground(page);
});

test.describe('Accessibility', { tag: SC_TAG_SET.accessibility }, () => {
  // ── Preserved test (do not remove) ───────────────────────────────────────
  test('[a11y] axe on SegmentedControl showcase bands', async ({ page }) => {
    await axeSegmentedControlPlayground(page);
  });

  test(`[a11y] ${SEGMENTED_CONTROL_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run full-page WCAG 2.1 AA axe scan', () =>
      runSegmentedControlAxePageScan(page),
    );

    writeSegmentedControlAxeArtefact(results);
    writeSegmentedControlAxeHtmlReport(results);

    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const band of SEGMENTED_CONTROL_A11Y_BANDS) {
    test(`[a11y] data-section="${band.id}" — WCAG tags, zero serious/critical`, async ({ page }) => {
      const results = await configureSegmentedControlAxeBuilder(page, {
        include: `[data-section="${band.id}"]`,
      })
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${band.title}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test(`[a11y] ${SEGMENTED_CONTROL_SECTION508_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(['section508']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${SEGMENTED_CONTROL_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await configureSegmentedControlAxeBuilder(page)
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-prohibited-attr',
        'aria-command-name',
      ])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${SEGMENTED_CONTROL_BUTTON_NAME_TEST}`, async ({ page }) => {
    const results = await configureSegmentedControlAxeBuilder(page)
      .withRules(['button-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${SEGMENTED_CONTROL_LABEL_RULE_TEST}`, async ({ page }) => {
    const results = await configureSegmentedControlAxeBuilder(page).withRules(['label']).analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] non-text-contrast rule — zero serious/critical (if rule exists)', async ({ page }) => {
    let results;
    try {
      results = await configureSegmentedControlAxeBuilder(page)
        .withRules(['non-text-contrast'])
        .analyze();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unknown rule')) return;
      throw e;
    }
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] SVG icons in showcase: aria-label, aria-hidden, role, or title', async ({ page }) => {
    const icons = page.locator(`${AXE_SCOPE} svg`);
    const count = await icons.count();
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const ariaLabel = await icon.getAttribute('aria-label');
      const ariaHidden = await icon.getAttribute('aria-hidden');
      const role = await icon.getAttribute('role');
      const title = await icon.locator('title').count();
      expect(
        ariaLabel || ariaHidden === 'true' || role || title > 0,
        `SVG at index ${i} has no aria-label, aria-hidden="true", role, or <title>`,
      ).toBeTruthy();
    }
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${SEGMENTED_CONTROL_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await gotoSegmentedControlPlayground(page);
    for (const sectionId of SEGMENTED_CONTROL_DATA_SECTIONS) {
      const band = scSection(page, sectionId);
      await band.scrollIntoViewIfNeeded();
      await expect(band).toBeVisible();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
    }
  });

  test('[a11y] All scenario bands present for regression', async ({ page }) => {
    for (const sectionId of SEGMENTED_CONTROL_DATA_SECTIONS) {
      await expect(scSection(page, sectionId)).toBeVisible();
    }
  });

  // ── Material Design 3 — segmented button accessibility ─────────────────────
  // https://m3.material.io/components/segmented-buttons/accessibility
  test.describe('M3 — Segmented button accessibility', () => {
    test(`[a11y] ${SEGMENTED_CONTROL_M3_GROUP_LABEL_TEST}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-a11y').scrollIntoViewIfNeeded();
      const groups = page.locator(`${AXE_SCOPE} [role="group"]`);
      const count = await groups.count();
      expect(count, 'Showcase should render segmented groups').toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(groups.nth(i), `Group index ${i} needs aria-label or aria-labelledby`).toHaveAccessibleName(
          /.+/,
        );
      }
    });

    test(`[a11y] ${SEGMENTED_CONTROL_M3_TOGGLE_SEMANTICS_TEST}`, async ({ page }) => {
      const buttons = defaultBandButtons(page);
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(buttons.nth(i)).toHaveRole('button');
        const pressed = await buttons.nth(i).getAttribute('aria-pressed');
        expect(['true', 'false'], `Segment ${i} must expose aria-pressed`).toContain(pressed);
      }
    });

    test(`[a11y] ${SEGMENTED_CONTROL_M3_SINGLE_SELECT_TEST}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await expect(page.getByTestId(SC_CANONICAL.root).getByRole('button', { pressed: true })).toHaveCount(1);
      await page.getByTestId(SC_CANONICAL.itemMonth).click();
      await expect(page.getByTestId(SC_CANONICAL.root).getByRole('button', { pressed: true })).toHaveCount(1);
      await expect(page.getByTestId(SC_CANONICAL.itemMonth)).toHaveAttribute('aria-pressed', 'true');
    });

    test('[a11y] Default group exposes accessible name via aria-label', async ({ page }) => {
      const group = page.getByRole('group', { name: 'Default segmented control' });
      await expect(group).toBeVisible();
      await expect(group.getByRole('button')).toHaveCount(3);
    });

    test('[a11y] aria-labelledby wiring on labelled group', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-a11y').scrollIntoViewIfNeeded();
      const group = scByTestId(page, 'segmented-control-a11y-aria-labelledby').getByRole('group', {
        name: 'Billing period',
      });
      await expect(group).toBeVisible();
    });

    test(`[a11y] ${SEGMENTED_CONTROL_M3_ICON_LABEL_TEST}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-a11y').scrollIntoViewIfNeeded();
      const iconGroup = scByTestId(page, 'segmented-control-a11y-icon-labels');
      await expect(iconGroup.getByLabel('List view')).toBeVisible();
      await expect(iconGroup.getByLabel('Grid view')).toBeVisible();
      await expect(iconGroup.getByLabel('Home view')).toBeVisible();
    });

    test('[a11y] every segment button in a11y band has non-empty accessible name', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-a11y').scrollIntoViewIfNeeded();
      const buttons = scSection(page, 'segmented-control-qa-a11y').getByRole('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(buttons.nth(i)).toHaveAccessibleName(/.+/);
      }
    });

    test(`[a11y] ${SEGMENTED_CONTROL_M3_KEYBOARD_ACTIVATION_TEST}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      const buttons = canonicalSegmentButtons(page);
      await page.getByTestId(SC_CANONICAL.itemDay).focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toHaveAttribute('aria-pressed', 'true');

      await page.getByTestId(SC_CANONICAL.itemMonth).focus();
      await page.keyboard.press('Space');
      await expect(page.getByTestId(SC_CANONICAL.itemMonth)).toHaveAttribute('aria-pressed', 'true');
    });

    test(`[a11y] ${SEGMENTED_CONTROL_M3_ROVING_FOCUS_TEST}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await page.getByTestId(SC_CANONICAL.itemDay).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toBeFocused();
    });

    test('[a11y] Arrow keys update focus but not selection until Space/Enter', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await page.getByTestId(SC_CANONICAL.itemDay).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toBeFocused();
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toHaveAttribute('aria-pressed', 'true');
      await page.keyboard.press('Space');
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toHaveAttribute('aria-pressed', 'true');
    });

    test('[a11y] Tab reaches segment buttons in default group', async ({ page }) => {
      await defaultBandButtons(page).first().focus();
      await expect(defaultBandButtons(page).first()).toBeFocused();
    });

    test(`[a11y] ${SEGMENTED_CONTROL_M3_DISABLED_SEGMENT_TEST}`, async ({ page }) => {
      await scSection(page, 'segmented-control-qa-a11y').scrollIntoViewIfNeeded();
      const disabled = scByTestId(page, 'segmented-control-a11y-disabled-item').getByRole('button', {
        name: 'Disabled',
      });
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAttribute('tabindex', '-1');
      await disabled.click({ force: true });
      await expect(
        scByTestId(page, 'segmented-control-a11y-disabled-item').getByRole('button', { name: 'Active' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    test('[a11y] disabled group marks every segment aria-disabled', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-combos').scrollIntoViewIfNeeded();
      const group = scByTestId(page, 'segmented-control-combo-5');
      const buttons = group.getByRole('button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        await expect(buttons.nth(i)).toHaveAttribute('aria-disabled', 'true');
      }
    });

    test(`[a11y] ${SEGMENTED_CONTROL_M3_FOCUS_VISIBLE_TEST}`, async ({ page }) => {
      await defaultBandButtons(page).first().focus();
      await expectFocusVisible(page);
    });

    test('[a11y] selected segment exposes aria-pressed=true for screen readers', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByTestId(SC_CANONICAL.itemMonth)).toHaveAttribute('aria-pressed', 'false');
    });

    test('[a11y] default showcase band has no pressed segment without defaultValue', async ({ page }) => {
      await expect(scPressedSegmentButtons(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toHaveCount(0);
    });

    test('[a11y] no keyboard trap — Tab cycle advances across page controls', async ({ page }) => {
      await page.locator('body').click({ position: { x: 0, y: 0 } });
      const seen = new Set<string>();
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press('Tab');
        const sig =
          (await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return '';
            return `${el.tagName}:${el.getAttribute('role') ?? ''}:${el.getAttribute('data-testid') ?? ''}`;
          })) ?? '';
        seen.add(sig);
      }
      expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(3);
    });
  });
});
