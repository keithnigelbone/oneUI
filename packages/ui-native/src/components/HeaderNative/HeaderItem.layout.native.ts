/**
 * HeaderItem layout — Figma `.Header.Item` (1:34176) state-layer insets.
 *
 * State layer: py=0, gap=Spacing-1 between slot/label/slot.
 * Horizontal padding on the slot side:
 *   M (icon) → Spacing-1.5
 *   S (badge) → Spacing-2
 * Label-only outer sides → Spacing-2.5 (or paddingStart=0 when visuallyAlignToStart).
 */

import type { ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { HeaderItemSlotSizeInput } from './interface';

const S = tokens.spacing;

export const SLOT_OUTER_PADDING = S['2-5'];
/** Icon (M) outer inset on the slot side */
export const SLOT_ICON_INSET = S['1-5'];
/** Badge (S) outer inset on the slot side — IndicatorBadge `s` dot = Spacing-1.5 */
export const SLOT_BADGE_INSET = S['2'];

function slotSideInset(size: HeaderItemSlotSizeInput | undefined): number {
  if (size === 'S') return SLOT_BADGE_INSET;
  return SLOT_ICON_INSET;
}

/** Figma state-layer horizontal padding + py=0. Same rules for all attention levels. */
export function resolveStateLayerInsets(options: {
  hasStartSlot: boolean;
  hasEndSlot: boolean;
  startSize?: HeaderItemSlotSizeInput;
  endSize?: HeaderItemSlotSizeInput;
  visuallyAlignToStart?: boolean;
}): ViewStyle {
  const { hasStartSlot, hasEndSlot, startSize, endSize, visuallyAlignToStart } = options;

  let paddingStart: number = SLOT_OUTER_PADDING;
  let paddingEnd: number = SLOT_OUTER_PADDING;

  if (hasStartSlot) paddingStart = slotSideInset(startSize);
  if (hasEndSlot) paddingEnd = slotSideInset(endSize);
  if (visuallyAlignToStart) paddingStart = 0;

  return {
    paddingTop: 0,
    paddingBottom: 0,
    paddingStart,
    paddingEnd,
  };
}
