import type { Page } from 'playwright/test';
import { expect } from 'playwright/test';

import {
  ICON_BUTTON_FIGMA_VALIDATION_TAB,
  ICON_BUTTON_PLAYGROUND_ROUTE,
  ICON_BUTTON_ROOT_TESTIDS,
} from './icon-button-playground/manifest';

export type FigmaSize = '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl';
export type FigmaAttention = 'high' | 'medium' | 'low';

export const FIGMA_SIZES: readonly FigmaSize[] = ['2xs', 'xs', 's', 'm', 'l', 'xl'];
export const FIGMA_MATRIX_SIZES: readonly FigmaSize[] = ['m', '2xs', 'xs', 's', 'l', 'xl'];
export const FIGMA_ATTENTION: readonly FigmaAttention[] = ['high', 'medium', 'low'];

export const SIZE_TO_DATA: Record<FigmaSize, string> = {
  '2xs': '4',
  xs: '6',
  s: '8',
  m: '10',
  l: '12',
  xl: '14',
};

export const ATTENTION_TO_VARIANT = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
} as const;

export type MasterColumnId = 'shape-1-1' | 'shape-3-2' | 'full-width' | 'neutral-palette';

export const MASTER_COLUMNS: readonly {
  id: MasterColumnId;
  unavailableWhenCondensed: boolean;
}[] = [
  { id: 'shape-1-1', unavailableWhenCondensed: false },
  { id: 'shape-3-2', unavailableWhenCondensed: false },
  { id: 'full-width', unavailableWhenCondensed: false },
  { id: 'neutral-palette', unavailableWhenCondensed: true },
];

export function sizeAttentionTestId(size: FigmaSize, attention: FigmaAttention): string {
  return `icon-button-figma-val-${size}-${attention}`;
}

export function masterTestId(
  condensed: boolean,
  size: FigmaSize,
  column: MasterColumnId,
  attention: FigmaAttention,
): string {
  return `icon-button-figma-mx-c${condensed ? '1' : '0'}-${size}-${column}-${attention}`;
}

export async function openFigmaValidationTab(page: Page) {
  await page.goto(ICON_BUTTON_PLAYGROUND_ROUTE);
  await expect(page.getByRole('heading', { name: 'Icon Button', level: 1 })).toBeVisible();
  await page
    .locator(`[data-testid="${ICON_BUTTON_ROOT_TESTIDS.default}"][data-size]`)
    .first()
    .waitFor({ state: 'visible', timeout: 90_000 });
  const figmaTab = page.getByRole('tab', { name: ICON_BUTTON_FIGMA_VALIDATION_TAB });
  await expect(figmaTab).toBeVisible();
  await figmaTab.scrollIntoViewIfNeeded();
  await figmaTab.click({ timeout: 60_000 });
  await expect(page.getByTestId('figma-icon-button-grid')).toBeVisible({ timeout: 90_000 });
}

export async function assertIconButtonContract(
  page: Page,
  testId: string,
  opts: {
    size: FigmaSize;
    attention: FigmaAttention;
    condensed?: boolean;
    layout?: '3:2';
    appearance?: string;
  },
) {
  const btn = page.getByTestId(testId);
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute('data-size', SIZE_TO_DATA[opts.size]);
  await expect(btn).toHaveAttribute('data-variant', ATTENTION_TO_VARIANT[opts.attention]);
  if (opts.appearance) {
    await expect(btn).toHaveAttribute('data-appearance', opts.appearance);
  }
  if (opts.condensed) {
    await expect(btn).toHaveAttribute('data-condensed', '');
  } else {
    await expect(btn).not.toHaveAttribute('data-condensed');
  }
  if (opts.layout === '3:2') {
    await expect(btn).toHaveAttribute('data-layout', '3:2');
  }
}
