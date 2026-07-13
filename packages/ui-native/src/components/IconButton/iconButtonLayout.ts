/**
 * iconButtonLayout.ts
 *
 * Resolves IconButton geometry from theme spacing — mirrors
 * `IconButton.module.css` `[data-size]` / `[data-condensed]` rules.
 */

import type { NativeSpacing } from '@oneui/shared/engine';
import type { SpinnerSize } from '../Spinner/interface';

export type IconButtonNumericSize = 4 | 6 | 8 | 10 | 12 | 14;

export interface IconButtonSizeMetrics {
  container: number;
  icon: number;
}

const CONTAINER_KEY: Record<
  IconButtonNumericSize,
  { normal: keyof NativeSpacing; condensed: keyof NativeSpacing }
> = {
  4: { normal: '5', condensed: '4' },
  6: { normal: '6', condensed: '5' },
  8: { normal: '8', condensed: '6' },
  10: { normal: '10', condensed: '8' },
  12: { normal: '12', condensed: '10' },
  14: { normal: '14', condensed: '12' },
};

const ICON_KEY: Record<IconButtonNumericSize, keyof NativeSpacing> = {
  4: '3',
  6: '3',
  8: '4',
  10: '5',
  12: '6',
  14: '8',
};

/** Web `SPINNER_SIZE_MAP` → native `Spinner` size preset. */
export const ICON_BUTTON_SPINNER_SIZE: Record<IconButtonNumericSize, SpinnerSize> = {
  4: '2XS',
  6: 'XS',
  8: 'S',
  10: 'M',
  12: 'L',
  14: 'XL',
};

const paddingList = {
  normal: {
    4: '2',
    6: '3',
    8: '4',
    10: '5',
    12: '6',
    14: '7',
  },
  condensed: {
    4: '1-5',
    6: '2',
    8: '2-5',
    10: '3-5',
    12: '4-5',
    14: '5',
  },
} as const;

export function getIconButtonMetrics(
  spacing: NativeSpacing,
  numericSize: IconButtonNumericSize,
  condensed?: boolean
): IconButtonSizeMetrics {
  const row = CONTAINER_KEY[numericSize];
  return {
    container: spacing[condensed ? row.condensed : row.normal],
    icon: spacing[ICON_KEY[numericSize]],
  };
}

export function getPaddingHorizontal(
  spacing: NativeSpacing,
  numericSize: IconButtonNumericSize,
  condensed?: boolean,
  layout?: '1:1' | '3:2'
): number | undefined {
  if (layout !== '3:2') {
    return undefined;
  }

  return spacing[paddingList[condensed ? 'condensed' : 'normal'][numericSize]];
}
