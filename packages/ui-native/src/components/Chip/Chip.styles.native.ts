/**
 * Chip.styles.native.ts — geometry peer of Chip.module.css (sizes, slot padding).
 */

import { StyleSheet } from 'react-native';
import type { ChipSize } from './interface';

export type {
  ChipLayoutMetrics,
  ChipSlotAffordanceKind,
  ChipSlotBadgeKind,
  ChipSlotKind,
} from './chipLayoutMatrix';
export { resolveChipLayout } from './chipLayoutMatrix';
export { classifyChipSlot } from './chipSlotKind';

export const SIZE_TO_LABEL: Record<ChipSize, 'XS' | 'S' | 'M'> = {
  s: 'XS',
  m: 'S',
  l: 'M',
};

// INTENTIONAL-LITERAL: matches web `--Disabled-Opacity`
export const DISABLED_OPACITY = 0.5;

export const styles = StyleSheet.create({
  pressableBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
  },
  slotStart: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEnd: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
  },
});
