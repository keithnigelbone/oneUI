/**
 * Chip layout padding matrix (token-only — safe for unit tests).
 * Slot classification lives in `chipSlotKind.ts`.
 */

import { tokens } from '@oneui/tokens';
import type { ChipSize } from './interface';

export type ChipSlotAffordanceKind = 'affordance';
export type ChipSlotBadgeKind = 'badge';
export type ChipSlotKind = ChipSlotAffordanceKind | ChipSlotBadgeKind;

export interface ChipLayoutMetrics {
  height: number;
  paddingLeft: number;
  paddingRight: number;
  gap: number;
}

const S = tokens.spacing;

type SlotPresence = 'none' | ChipSlotKind;

function slotPresence(kind: ChipSlotKind | null): SlotPresence {
  return kind ?? 'none';
}

function layoutKey(size: ChipSize, start: SlotPresence, end: SlotPresence): string {
  return `${size}:${start}:${end}`;
}

const CHIP_LAYOUT_MATRIX: Record<string, ChipLayoutMetrics> = {
  's:none:none': { height: S['5'], paddingLeft: S['2-5'], paddingRight: S['2-5'], gap: S['1'] },
  'm:none:none': { height: S['6'], paddingLeft: S['2-5'], paddingRight: S['2-5'], gap: S['1'] },
  'l:none:none': { height: S['8'], paddingLeft: S['3'], paddingRight: S['3'], gap: S['1-5'] },

  's:affordance:none': { height: S['5'], paddingLeft: S['1'], paddingRight: S['2'], gap: S['1'] },
  'm:affordance:none': { height: S['6'], paddingLeft: S['1'], paddingRight: S['2-5'], gap: S['1'] },
  'l:affordance:none': { height: S['8'], paddingLeft: S['1-5'], paddingRight: S['3'], gap: S['1-5'] },

  's:none:affordance': { height: S['5'], paddingLeft: S['2'], paddingRight: S['1'], gap: S['1'] },
  'm:none:affordance': { height: S['6'], paddingLeft: S['2-5'], paddingRight: S['1'], gap: S['1'] },
  'l:none:affordance': { height: S['8'], paddingLeft: S['3'], paddingRight: S['1-5'], gap: S['1-5'] },

  's:affordance:affordance': { height: S['5'], paddingLeft: S['1'], paddingRight: S['1'], gap: S['1'] },
  'm:affordance:affordance': { height: S['6'], paddingLeft: S['1'], paddingRight: S['1'], gap: S['1'] },
  'l:affordance:affordance': {
    height: S['8'],
    paddingLeft: S['1-5'],
    paddingRight: S['1-5'],
    gap: S['1-5'],
  },

  's:badge:none': { height: S['5'], paddingLeft: S['1-5'], paddingRight: S['2'], gap: S['1'] },
  'm:badge:none': { height: S['6'], paddingLeft: S['2'], paddingRight: S['2-5'], gap: S['1'] },
  'l:badge:none': { height: S['8'], paddingLeft: S['2-5'], paddingRight: S['3'], gap: S['1-5'] },

  's:none:badge': { height: S['5'], paddingLeft: S['2'], paddingRight: S['1-5'], gap: S['1'] },
  'm:none:badge': { height: S['6'], paddingLeft: S['2-5'], paddingRight: S['2'], gap: S['1'] },
  'l:none:badge': { height: S['8'], paddingLeft: S['3'], paddingRight: S['2-5'], gap: S['1-5'] },

  's:badge:badge': { height: S['5'], paddingLeft: S['1-5'], paddingRight: S['1-5'], gap: S['1'] },
  'm:badge:badge': { height: S['6'], paddingLeft: S['2'], paddingRight: S['2'], gap: S['1'] },
  'l:badge:badge': { height: S['8'], paddingLeft: S['2-5'], paddingRight: S['2-5'], gap: S['1-5'] },

  's:affordance:badge': { height: S['5'], paddingLeft: S['1'], paddingRight: S['1-5'], gap: S['1'] },
  'm:affordance:badge': { height: S['6'], paddingLeft: S['1'], paddingRight: S['2'], gap: S['1'] },
  'l:affordance:badge': { height: S['8'], paddingLeft: S['1-5'], paddingRight: S['2-5'], gap: S['1-5'] },

  's:badge:affordance': { height: S['5'], paddingLeft: S['1-5'], paddingRight: S['1'], gap: S['1'] },
  'm:badge:affordance': { height: S['6'], paddingLeft: S['2'], paddingRight: S['1'], gap: S['1'] },
  'l:badge:affordance': { height: S['8'], paddingLeft: S['2-5'], paddingRight: S['1-5'], gap: S['1-5'] },
};

export function resolveChipLayout(
  size: ChipSize,
  startKind: ChipSlotKind | null,
  endKind: ChipSlotKind | null,
): ChipLayoutMetrics {
  const key = layoutKey(size, slotPresence(startKind), slotPresence(endKind));
  return CHIP_LAYOUT_MATRIX[key] ?? CHIP_LAYOUT_MATRIX[layoutKey(size, 'none', 'none')];
}

