/**
 * buttonLayout.ts
 *
 * Resolves Button geometry from `OneUINativeTheme.spacing` so sizes track
 * platform + density the same way web `Button.module.css` does inside
 * `[data-Breakpoint]` (Spacing-* fallbacks per `data-size`).
 */

import type { NativeSpacing } from '@oneui/shared/engine';

export type ButtonNumericSize = 6 | 8 | 10 | 12;

export interface ButtonSizeMetrics {
  minHeight: number;
  paddingVertical: number;
  paddingHorizontal: number;
}

export interface ButtonIconMetrics {
  /** `--Button-iconSize` */
  default: number;
  /** `--Button-iconSizeStart` (defaults to iconSize on web) */
  start: number;
  /** `--Button-iconSizeEnd` */
  end: number;
}

export interface ButtonSlotMetrics {
  gapStart: number;
  gapEnd: number;
  padWithStart: number;
  padWithEnd: number;
}

/** Default (non-condensed) size block — mirrors `[data-size="N"]` in Button.module.css. */
export function getButtonSizeMetrics(
  spacing: NativeSpacing,
  size: ButtonNumericSize
): ButtonSizeMetrics {
  const map: Record<
    ButtonNumericSize,
    { minHeight: keyof NativeSpacing; padH: keyof NativeSpacing; padV: keyof NativeSpacing }
  > = {
    6: { minHeight: '6', padH: '3', padV: '0-5' },
    8: { minHeight: '8', padH: '4', padV: '0-5' },
    10: { minHeight: '10', padH: '5', padV: '1' },
    12: { minHeight: '12', padH: '6', padV: '2' },
  };
  const row = map[size];
  return {
    minHeight: spacing[row.minHeight],
    paddingVertical: spacing[row.padV],
    paddingHorizontal: spacing[row.padH],
  };
}

/** Condensed block — mirrors `[data-condensed][data-size="N"]`. */
export function getButtonCondensedMetrics(
  spacing: NativeSpacing,
  size: ButtonNumericSize
): ButtonSizeMetrics {
  const map: Record<
    ButtonNumericSize,
    { minHeight: keyof NativeSpacing; padH: keyof NativeSpacing; padV: keyof NativeSpacing }
  > = {
    6: { minHeight: '4-5', padH: '2', padV: '0-5' },
    8: { minHeight: '5', padH: '2-5', padV: '0-5' },
    10: { minHeight: '6', padH: '3', padV: '1' },
    12: { minHeight: '8', padH: '4', padV: '2' },
  };
  const row = map[size];
  return {
    minHeight: spacing[row.minHeight],
    paddingVertical: spacing[row.padV],
    paddingHorizontal: spacing[row.padH],
  };
}

/** Per-size icon box — mirrors `--Button-iconSize-{N}` (Spacing-3/4/5/6). */
export function getButtonIconMetrics(
  spacing: NativeSpacing,
  size: ButtonNumericSize
): ButtonIconMetrics {
  const iconKey: Record<ButtonNumericSize, keyof NativeSpacing> = {
    6: '3',
    8: '4',
    10: '5',
    12: '6',
  };
  const px = spacing[iconKey[size]];
  return { default: px, start: px, end: px };
}

/** Slot gaps — mirrors `.start` / `.end` / `.spinner` margin rules per size. */
export function getButtonSlotMetrics(
  spacing: NativeSpacing,
  size: ButtonNumericSize,
  condensed?: boolean
): ButtonSlotMetrics {
  const gap: number = size === 6 || size === 8 ? spacing['1'] : spacing['1-5'];

  const defaultPadKey: Record<ButtonNumericSize, keyof NativeSpacing> = {
    6: '2',
    8: '3',
    10: '4',
    12: '5',
  };

  const condensedPadKey: Record<ButtonNumericSize, keyof NativeSpacing> = {
    6: '1',
    8: '1',
    10: '1-5',
    12: '2',
  };

  const padKey = condensed ? condensedPadKey : defaultPadKey;

  const pad = spacing[padKey[size]];
  return {
    gapStart: gap,
    gapEnd: gap,
    padWithStart: pad,
    padWithEnd: pad,
  };
}
