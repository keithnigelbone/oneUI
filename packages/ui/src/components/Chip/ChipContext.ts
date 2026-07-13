'use client';

/**
 * ChipContext.ts
 * React context for ChipGroup to propagate shared props to child Chips.
 * Lives in the Chip folder so Chip can read it without depending on ChipGroup.
 */

'use client';

import { createContext, useContext } from 'react';
import type { ChipSize, ChipAttention, ChipAppearance } from './Chip.shared';

export interface ChipGroupContextValue {
  size?: ChipSize;
  attention?: ChipAttention;
  appearance?: ChipAppearance;
}

export const ChipGroupContext = createContext<ChipGroupContextValue>({});

/** Read the nearest ChipGroup's propagated defaults. Returns {} when not inside a ChipGroup. */
export function useChipGroupContext(): ChipGroupContextValue {
  return useContext(ChipGroupContext);
}