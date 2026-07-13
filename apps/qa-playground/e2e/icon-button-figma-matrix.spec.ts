import { expect, test } from 'playwright/test';
import {
  assertIconButtonContract,
  FIGMA_ATTENTION,
  FIGMA_MATRIX_SIZES,
  FIGMA_SIZES,
  MASTER_COLUMNS,
  masterTestId,
  openFigmaValidationTab,
  sizeAttentionTestId,
} from './icon-button-figma-matrix.helpers';

test.describe('Figma matrix — image 2 (size × attention)', () => {
  test.beforeEach(async ({ page }) => {
    await openFigmaValidationTab(page);
  });

  test('All 18 Figma size×attention cells match size, attention, and appearance contract', async ({
    page,
  }) => {
    for (const size of FIGMA_SIZES) {
      for (const attention of FIGMA_ATTENTION) {
        await assertIconButtonContract(page, sizeAttentionTestId(size, attention), {
          size,
          attention,
          appearance: 'primary',
        });
      }
    }
  });
});

test.describe('Figma matrix — image 1 (condensed × size × shape × attention)', () => {
  test.beforeEach(async ({ page }) => {
    await openFigmaValidationTab(page);
  });

  test('Master matrix (condensed × size × shape) sections are mounted', async ({ page }) => {
    await expect(page.getByTestId('figma-icon-button-master-matrix')).toBeVisible();
    await expect(page.getByTestId('figma-icon-button-master-c0')).toBeVisible();
    await expect(page.getByTestId('figma-icon-button-master-c1')).toBeVisible();
  });

  for (const condensed of [false, true] as const) {
    test(`All master-matrix cells render with correct props when condensed=${condensed}`, async ({
      page,
    }) => {
      for (const size of FIGMA_MATRIX_SIZES) {
        for (const col of MASTER_COLUMNS) {
          for (const attention of FIGMA_ATTENTION) {
            const appearance = col.id === 'neutral-palette' ? 'neutral' : 'primary';
            await assertIconButtonContract(page, masterTestId(condensed, size, col.id, attention), {
              size,
              attention,
              condensed,
              layout: col.id === 'shape-3-2' ? '3:2' : undefined,
              appearance,
            });
          }
        }
      }
    });
  }

  test('Condensed master matrix still renders neutral palette (beyond Figma spec)', async ({
    page,
  }) => {
    for (const attention of FIGMA_ATTENTION) {
      await assertIconButtonContract(page, masterTestId(true, 'm', 'neutral-palette', attention), {
        size: 'm',
        attention,
        condensed: true,
        appearance: 'neutral',
      });
    }
  });

  test('Non-condensed neutral palette renders for every size at low attention', async ({
    page,
  }) => {
    for (const size of FIGMA_MATRIX_SIZES) {
      await assertIconButtonContract(page, masterTestId(false, size, 'neutral-palette', 'low'), {
        size,
        attention: 'low',
        appearance: 'neutral',
      });
    }
  });

  test('Spot check: size M, square shape, high attention — condensed on and off', async ({
    page,
  }) => {
    await assertIconButtonContract(page, masterTestId(false, 'm', 'shape-1-1', 'high'), {
      size: 'm',
      attention: 'high',
      condensed: false,
      appearance: 'primary',
    });
    await assertIconButtonContract(page, masterTestId(true, 'm', 'shape-1-1', 'high'), {
      size: 'm',
      attention: 'high',
      condensed: true,
      appearance: 'primary',
    });
  });

  test('Spot check: size L, full-width layout, high attention', async ({ page }) => {
    await assertIconButtonContract(page, masterTestId(false, 'l', 'full-width', 'high'), {
      size: 'l',
      attention: 'high',
      appearance: 'primary',
    });
  });
});
