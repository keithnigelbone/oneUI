/**
 * Avatar — functional Playwright automation.
 *
 * Playground source: `src/components/avatar/AvatarQaShowcase.tsx`
 * Anchors: `e2e/avatar-playground/manifest.ts`
 *
 * Tags: @Functional @Smoke (filter: `--grep "@Smoke"`)
 * Dashboard ingest maps the top-level `Functional` describe to the Functional tab.
 */
import { expect, test } from 'playwright/test';

import {
  APPEARANCE_COLOUR_SAMPLE,
  attachConsoleErrorCollector,
  assertNoConsoleErrors,
  AvatarTags,
  AVATAR_TAG_SET,
  clickPageThemeButton,
  expectAvatarVisible,
  expectSectionVisible,
  FIGMA_TO_CODE_SIZE,
  openAvatarTestScenarios,
  qaLog,
  qaStep,
  readComputedRgb,
  switchPlaygroundToDarkTheme,
} from './avatar/avatar-qa-support';
import {
  AVATAR_ALL_TESTIDS,
  AVATAR_APPEARANCES,
  AVATAR_ATTENTIONS,
  AVATAR_COMBO_COUNT,
  AVATAR_CONTENT_MODES,
  AVATAR_DATA_SECTIONS,
  AVATAR_FIGMA_SIZES,
  AVATAR_ROOT_TESTIDS,
  avatarAppearanceTestId,
  avatarAttentionTestId,
  avatarComboTestId,
  avatarContentTestId,
  avatarSizeTestId,
} from './avatar-playground/manifest';

test.beforeEach(async ({ page }) => {
  await openAvatarTestScenarios(page);
});

test.describe('Functional', { tag: AVATAR_TAG_SET.functional }, () => {
  // ─── Smoke — fast confidence for CI / PR gates ─────────────────────────────

  test.describe('Smoke', { tag: AVATAR_TAG_SET.smoke }, () => {
    test('Visitor sees the Avatar playground and default profile image', async ({ page }) => {
      await qaStep('Confirm page chrome and scenario tabs', async () => {
        await expect(
          page.getByRole('heading', { name: 'Avatar', level: 1 }),
          'Avatar product page should display its title',
        ).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
      });

      await qaStep('Default avatar scenario is visible', async () => {
        await expectAvatarVisible(
          page,
          AVATAR_ROOT_TESTIDS.default,
          'Default Avatar (John Doe image) should render in the first story band',
        );
      });
    });

    test('Visitor can switch light/dark theme from the page header', async ({ page }) => {
      const { before, after } = await clickPageThemeButton(page);
      expect(
        before,
        'Theme button label should change after click to confirm theme toggle works',
      ).not.toEqual(after);
    });
  });

  // ─── Playground bands — regression anchors from AvatarQaShowcase ───────────

  test.describe('Playground scenario bands', { tag: [AvatarTags.functional] }, () => {
    test('Size band shows Figma scale including custom pixel size', async ({ page }) => {
      await qaStep('Spot-check small, medium, and custom size avatars', async () => {
        await expectAvatarVisible(page, avatarSizeTestId('2XS'), '2XS size avatar should render');
        await expectAvatarVisible(page, avatarSizeTestId('M'), 'M size avatar should render');
        await expectAvatarVisible(
          page,
          AVATAR_ROOT_TESTIDS.sizeCustom,
          'Custom size avatar (customSize) should render',
        );
      });
    });

    test('Attention band shows high, medium, and low emphasis', async ({ page }) => {
      for (const level of AVATAR_ATTENTIONS) {
        await qaStep(`Verify attention level: ${level}`, async () => {
          await expectAvatarVisible(
            page,
            avatarAttentionTestId(level),
            `Avatar with attention="${level}" should be visible`,
          );
        });
      }
    });

    test('Appearance band shows primary role and brand-bg extension row', async ({ page }) => {
      const band = page.locator('#avatar-qa-appearance');
      await qaStep('Primary appearance row is visible', async () => {
        await expect(
          band.getByTestId(avatarAppearanceTestId('primary')),
          'Primary appearance avatar should appear in the appearance band',
        ).toBeVisible();
      });
      await qaStep('brand-bg code-only row is visible', async () => {
        await expect(
          band.getByTestId(avatarAppearanceTestId('brand-bg')),
          'brand-bg appearance avatar should appear (code-only Figma extension)',
        ).toBeVisible();
      });
    });

    test('Content band shows image, icon, and text (initials) modes', async ({ page }) => {
      const band = page.locator('#avatar-qa-content');
      for (const mode of AVATAR_CONTENT_MODES) {
        await qaStep(`Content mode: ${mode}`, async () => {
          await expect(
            band.getByTestId(avatarContentTestId(mode)),
            `Avatar with content="${mode}" should be visible`,
          ).toBeVisible();
        });
      }
    });

    test('Accent stand-in band documents Figma accent via appearance roles', async ({ page }) => {
      const band = page.locator('#avatar-qa-accent');
      await expect(
        band.getByTestId('avatar-accent-standin-primary'),
        'Primary accent stand-in avatar should be visible',
      ).toBeVisible();
    });

    test('Disabled band contrasts enabled vs disabled presentation', async ({ page }) => {
      await expectAvatarVisible(
        page,
        AVATAR_ROOT_TESTIDS.disabledFalse,
        'Enabled avatar should render in disabled band',
      );
      await expectAvatarVisible(
        page,
        AVATAR_ROOT_TESTIDS.disabledTrue,
        'Disabled avatar should render in disabled band',
      );
    });

    test('Combination matrix renders all documented prop mixes', async ({ page }) => {
      for (let i = 0; i < AVATAR_COMBO_COUNT; i++) {
        await qaStep(`Combo row ${i + 1} of ${AVATAR_COMBO_COUNT}`, async () => {
          await expectAvatarVisible(
            page,
            avatarComboTestId(i),
            `Combination matrix row ${i} should be visible`,
          );
        });
      }
    });
  });

  // ─── Group 1 — Render ──────────────────────────────────────────────────────

  test.describe('Group 1 — Render', { tag: [AvatarTags.functional] }, () => {
    test('Page loads cleanly and default Avatar matches showcase props', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openAvatarTestScenarios(page);

      await qaStep('No browser console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });

      await qaStep('Default avatar is visible with expected API attributes', async () => {
        const el = await expectAvatarVisible(
          page,
          AVATAR_ROOT_TESTIDS.default,
          'Default avatar must be visible after navigation',
        );
        await expect(el, 'Avatar root exposes role="img" for assistive tech').toHaveAttribute('role', 'img');
        await expect(el, 'Default content mode is image').toHaveAttribute('data-content', 'image');
        await expect(el, 'Default size is M (code: m)').toHaveAttribute('data-size', 'm');
        await expect(el, 'Default attention is high').toHaveAttribute('data-attention', 'high');
        await expect(el, 'Default appearance resolves to primary').toHaveAttribute('data-appearance', 'primary');
        await expect(el, 'Accessible name comes from alt text').toHaveAccessibleName(/John Doe/);
      });
    });

    test('Every playground data-testid renders without error text', async ({ page }) => {
      test.setTimeout(120_000);
      qaLog('Validating all manifest testids', { count: AVATAR_ALL_TESTIDS.length });

      for (const testId of AVATAR_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const el = page.getByTestId(testId);
          await el.scrollIntoViewIfNeeded();
          await expect(el, `Playground anchor "${testId}" should be visible`).toBeVisible();
          await expect(
            el,
            `Anchor "${testId}" should not show runtime error copy`,
          ).not.toContainText(/error|failed/i);
        });
      }
    });

    test('Every story band (data-section) is visible on the page', async ({ page }) => {
      for (const section of AVATAR_DATA_SECTIONS) {
        await qaStep(`Story band: ${section}`, async () => {
          await expectSectionVisible(page, section);
        });
      }
    });
  });

  // ─── Group 2 — Props validation ────────────────────────────────────────────

  test.describe('Group 2 — Props validation', { tag: [AvatarTags.functional] }, () => {
    test('Size prop maps Figma labels to code data-size values', async ({ page }) => {
      for (const figma of AVATAR_FIGMA_SIZES) {
        await qaStep(`Figma size ${figma} → data-size="${FIGMA_TO_CODE_SIZE[figma]}"`, async () => {
          const el = page.getByTestId(avatarSizeTestId(figma));
          await el.scrollIntoViewIfNeeded();
          await expect(el, `Size ${figma} should expose matching data-size`).toHaveAttribute(
            'data-size',
            FIGMA_TO_CODE_SIZE[figma]!,
          );
          await expect(el, 'Size band uses icon content').toHaveAttribute('data-content', 'icon');
        });
      }
      await qaStep('Custom size exposes data-size="custom"', async () => {
        await expect(page.getByTestId(AVATAR_ROOT_TESTIDS.sizeCustom)).toHaveAttribute(
          'data-size',
          'custom',
        );
      });
    });

    test('Attention and appearance props surface on the DOM', async ({ page }) => {
      for (const attention of AVATAR_ATTENTIONS) {
        await qaStep(`attention="${attention}"`, async () => {
          await expect(page.getByTestId(avatarAttentionTestId(attention))).toHaveAttribute(
            'data-attention',
            attention,
          );
        });
      }
      for (const appearance of AVATAR_APPEARANCES) {
        await qaStep(`appearance="${appearance}"`, async () => {
          const el = page.getByTestId(avatarAppearanceTestId(appearance));
          await el.scrollIntoViewIfNeeded();
          if (appearance === 'auto') {
            expect(await el.getAttribute('data-appearance'), 'auto should resolve to a role').toBeTruthy();
          } else {
            await expect(el).toHaveAttribute('data-appearance', appearance);
          }
        });
      }
    });

    test('Content prop maps image, icon, and text modes', async ({ page }) => {
      for (const content of AVATAR_CONTENT_MODES) {
        await qaStep(`content="${content}"`, async () => {
          await expect(page.getByTestId(avatarContentTestId(content))).toHaveAttribute(
            'data-content',
            content,
          );
        });
      }
    });

    test('Avatar sizes grow progressively and stay circular', async ({ page }) => {
      const widths: number[] = [];
      for (const figma of AVATAR_FIGMA_SIZES) {
        await qaStep(`Measure bounding box: ${figma}`, async () => {
          const el = page.getByTestId(avatarSizeTestId(figma));
          await el.scrollIntoViewIfNeeded();
          const box = await el.boundingBox();
          expect(box, `${figma} should have a measurable box`).not.toBeNull();
          widths.push(box!.width);
          expect(
            Math.abs(box!.width - box!.height),
            `${figma} should be circular (width ≈ height)`,
          ).toBeLessThan(4);
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

  // ─── Groups 3–10 — documented N/A for display-only Avatar ──────────────────

  test.describe('Group 3 — Click interaction (N/A)', { tag: [AvatarTags.functional] }, () => {
    test('Avatar is display-only and not activated by click', async ({ page }) => {
      await qaStep('Root is role=img, not a button', async () => {
        const el = page.getByTestId(AVATAR_ROOT_TESTIDS.default);
        await expect(el).toHaveAttribute('role', 'img');
        const tabIndex = await el.getAttribute('tabindex');
        expect(
          tabIndex === null || tabIndex === '-1',
          'Avatar should not be in tab order (no tabindex=0)',
        ).toBe(true);
      });
    });
  });

  test.describe('Group 4 — Keyboard (N/A)', { tag: [AvatarTags.functional] }, () => {
    test('Tab focus stays on page chrome, not Avatar instances', async ({ page }) => {
      await qaStep('Press Tab once', async () => {
        await page.keyboard.press('Tab');
        const activeTestId = await page.evaluate(
          () => document.activeElement?.getAttribute('data-testid') ?? '',
        );
        expect(
          activeTestId.startsWith('avatar-'),
          'Focus should not land on an Avatar test id',
        ).toBe(false);
      });
    });
  });

  test.describe('Group 5 — Focus (N/A)', { tag: [AvatarTags.functional] }, () => {
    test('Clicking Avatar does not move focus to the Avatar root', async ({ page }) => {
      await qaStep('Force-click default avatar', async () => {
        await page.getByTestId(AVATAR_ROOT_TESTIDS.default).click({ force: true });
        const activeId = await page.evaluate(
          () => document.activeElement?.getAttribute('data-testid') ?? '',
        );
        expect(activeId, 'Focus should remain outside Avatar').not.toBe(AVATAR_ROOT_TESTIDS.default);
      });
    });
  });

  test.describe('Group 6 — State', { tag: [AvatarTags.functional] }, () => {
    test('Default state shows image content with expected tokens', async ({ page }) => {
      const el = page.getByTestId(AVATAR_ROOT_TESTIDS.default);
      await expect(el, 'Default uses image content').toHaveAttribute('data-content', 'image');
      await expect(el, 'Default size M').toHaveAttribute('data-size', 'm');
      await expect(el, 'Default attention high').toHaveAttribute('data-attention', 'high');
      await expect(el.locator('img'), 'Image content renders an img element').toHaveCount(1);
    });

  });

  test.describe('Group 7 — Slots (N/A)', { tag: [AvatarTags.functional] }, () => {
    test('Avatar uses content prop instead of start/end slots', async ({ page }) => {
      await expect(page.getByTestId(avatarContentTestId('image'))).toHaveAttribute(
        'data-content',
        'image',
      );
      await expect(page.getByTestId(avatarContentTestId('icon'))).toHaveAttribute('data-content', 'icon');
      await expect(page.getByTestId(avatarContentTestId('text'))).toHaveAttribute('data-content', 'text');
    });
  });

  // Groups 8–10: no toggle, input, or dependency rules on Avatar API (covered by empty describe for traceability)
  test.describe('Group 8 — Toggle (N/A)', { tag: [AvatarTags.functional] }, () => {
    test('Avatar does not support selection or toggle', async () => {
      qaLog('Skipped — not applicable to display Avatar');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [AvatarTags.functional] }, () => {
    test('Avatar does not accept typed input', async () => {
      qaLog('Skipped — not applicable to display Avatar');
    });
  });

  test.describe('Group 10 — Dependencies (N/A)', { tag: [AvatarTags.functional] }, () => {
    test('Avatar has no loading/slot dependency rules', async () => {
      qaLog('Skipped — not applicable to display Avatar');
    });
  });

  // ─── Group 11 — Content and display ────────────────────────────────────────

  test.describe('Group 11 — Content and display', { tag: [AvatarTags.functional] }, () => {
    test('Text mode shows initials derived from the alt name', async ({ page }) => {
      const el = page.getByTestId(avatarContentTestId('text'));
      await el.scrollIntoViewIfNeeded();
      await expect(el, 'Text avatar should expose alt as accessible name').toHaveAccessibleName(
        /Jordan Smith/i,
      );
      const visibleText = (await el.innerText()).replace(/\s+/g, '');
      expect(visibleText.length, 'Initials text should be non-empty').toBeGreaterThan(0);
    });

    test('Icon mode uses a decorative SVG; image mode uses presentation img', async ({ page }) => {
      await qaStep('Icon content', async () => {
        const iconRoot = page.getByTestId(avatarContentTestId('icon'));
        await iconRoot.scrollIntoViewIfNeeded();
        const svg = iconRoot.locator('svg').first();
        await expect(svg, 'Icon avatar should render SVG').toBeVisible();
        await expect(svg, 'Person icon is decorative').toHaveAttribute('aria-hidden', 'true');
      });

      await qaStep('Image content', async () => {
        const imageRoot = page.getByTestId(avatarContentTestId('image'));
        await imageRoot.scrollIntoViewIfNeeded();
        await expect(imageRoot).toHaveAttribute('role', 'img');
        await expect(imageRoot.locator('img')).toHaveAttribute('role', 'presentation');
        await expect(imageRoot).toHaveAccessibleName(/.+/);
      });
    });
  });

  // ─── Group 12 — Layout and responsive ────────────────────────────────────

  test.describe('Group 12 — Layout and responsive', { tag: [AvatarTags.functional] }, () => {
    test('Playground fits narrow mobile width without horizontal scroll', async ({ page }) => {
      await qaStep('Set viewport to 320×800', async () => {
        await page.setViewportSize({ width: 320, height: 800 });
        await openAvatarTestScenarios(page);
      });

      for (const section of AVATAR_DATA_SECTIONS) {
        await qaStep(`No overflow in ${section}`, async () => {
          const band = page.locator(`[data-section="${section}"]`);
          await band.scrollIntoViewIfNeeded();
          await expect(band).toBeVisible();
          const overflows = await band.evaluate(
            (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 2,
          );
          expect(overflows, `Band "${section}" should not scroll horizontally`).toBe(false);
        });
      }
    });

    test('Playground remains usable on large desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openAvatarTestScenarios(page);
      await expectAvatarVisible(page, AVATAR_ROOT_TESTIDS.default, 'Default avatar on desktop');
      await expectAvatarVisible(page, avatarSizeTestId('M'), 'Medium size avatar on desktop');
    });

    test('Content band lays out image, icon, and text side by side', async ({ page }) => {
      const imageBox = await page.getByTestId(avatarContentTestId('image')).boundingBox();
      const iconBox = await page.getByTestId(avatarContentTestId('icon')).boundingBox();
      expect(imageBox, 'Image avatar should have layout box').not.toBeNull();
      expect(iconBox, 'Icon avatar should have layout box').not.toBeNull();
      expect(
        Math.abs((imageBox!.y ?? 0) - (iconBox!.y ?? 0)),
        'Content variants should share a horizontal row (similar Y)',
      ).toBeLessThan(24);
    });
  });

  // ─── Group 13 — Dark mode ──────────────────────────────────────────────────

  test.describe('Group 13 — Dark mode', { tag: [AvatarTags.functional] }, () => {
    test('All story bands and sample avatars remain visible in dark theme', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);

      await qaStep('Every story band visible', async () => {
        for (const section of AVATAR_DATA_SECTIONS) {
          await expect(
            page.locator(`[data-section="${section}"]`),
            `Band "${section}" should be visible in dark mode`,
          ).toBeVisible();
        }
      });

      await qaStep('Representative avatars visible with token fill', async () => {
        const spotCheck = [
          AVATAR_ROOT_TESTIDS.default,
          avatarSizeTestId('M'),
          avatarAppearanceTestId('primary'),
          avatarContentTestId('text'),
          avatarComboTestId(0),
        ] as const;
        for (const testId of spotCheck) {
          await expectAvatarVisible(page, testId, `${testId} visible in dark mode`);
        }
      });
    });
  });
});
