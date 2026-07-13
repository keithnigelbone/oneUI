/**
 * Switch.styles.native.ts — structural StyleSheet + geometry constants.
 *
 * Mirrors the sizing system from `Switch.module.css` §SIZES:
 *
 *   Figma Spacings → Token    → px at S/default:
 *     Spacings/0.5 → Spacing-0-5 → 2px  (track padding)
 *     Spacings/3   → Spacing-3   → 12px (knob S)
 *     Spacings/4   → Spacing-4   → 16px (knob M)
 *     Spacings/5   → Spacing-5   → 20px (knob L)
 *     Spacings/7   → Spacing-7   → 28px (track width S)
 *     Spacings/9   → Spacing-9   → 36px (track width M)
 *     Spacings/10  → Spacing-10  → 40px (track width L)
 *
 *   Track height = auto (2 × padding + knob)
 *
 * No brand colors in this file — paint lives inline in `Switch.native.tsx`
 * via `useSurfaceTokens` (`pnpm check:literals`).
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { SwitchSize } from './interface';

export type SwitchSizeKey = 's' | 'm' | 'l';

/** Track padding — mirrors `--Switch-padding: var(--Spacing-0-5)` */
export const TRACK_PADDING = tokens.spacing['0-5'];

/** Per-size track width: S=Spacing-7, M=Spacing-9, L=Spacing-10 */
export const TRACK_WIDTH: Record<SwitchSizeKey, number> = {
  s: tokens.spacing['7'],
  m: tokens.spacing['9'],
  l: tokens.spacing['10'],
};

/** Per-size knob (thumb) side: S=Spacing-3, M=Spacing-4, L=Spacing-5 */
export const KNOB_SIZE: Record<SwitchSizeKey, number> = {
  s: tokens.spacing['3'],
  m: tokens.spacing['4'],
  l: tokens.spacing['5'],
};

/**
 * Per-size thumb travel distance when checked.
 * Web: S=Spacing-3 (12), M=Spacing-4 (16), L=Spacing-4 (16)
 * Formula: trackWidth - knobSize - 2*padding
 *   S: 28 - 12 - 4 = 12 = Spacing-3
 *   M: 36 - 16 - 4 = 16 = Spacing-4
 *   L: 40 - 20 - 4 = 16 = Spacing-4
 */
export const KNOB_TRAVEL: Record<SwitchSizeKey, number> = {
  s: tokens.spacing['3'],
  m: tokens.spacing['4'],
  l: tokens.spacing['4'],
};

/** Gap between the track and the label text — mirrors `--Spacing-3` */
export const LABEL_GAP = tokens.spacing['3'];

/** Disabled opacity — mirrors `--Disabled-Opacity` default. */
// INTENTIONAL-LITERAL: matches Switch.module.css defaults.
export const DISABLED_OPACITY = 0.5;

/** Shape-Pill for track and thumb */
export const TRACK_BORDER_RADIUS = tokens.shape.Pill;
export const THUMB_BORDER_RADIUS = tokens.shape.Pill;

/** Hit slop for easier touch targeting */
// INTENTIONAL-LITERAL: standard hit slop to hit WCAG 44px touch target minimum.
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export const styles = StyleSheet.create({
  /** Outer row wrapper: track + optional label */
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LABEL_GAP,
  },
  /** The pill-shaped track container */
  track: {
    padding: TRACK_PADDING,
    borderRadius: TRACK_BORDER_RADIUS,
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  /** Thumb (knob) circle */
  thumb: {
    borderRadius: THUMB_BORDER_RADIUS,
    flexShrink: 0,
  },
});
