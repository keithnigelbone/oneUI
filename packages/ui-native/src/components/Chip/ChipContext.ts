/**
 * ChipContext.ts — group defaults for child Chips (peer of web ChipContext.ts).
 */

import { createContext, useContext } from 'react';
import type { ChipAppearance, ChipSize, ChipVariant } from './interface';

export interface ChipGroupContextValue {
  size?: ChipSize;
  variant?: ChipVariant;
  appearance?: ChipAppearance;
  /** When set by ChipGroup, disables every child Chip. */
  disabled?: boolean;
}

export const ChipGroupContext = createContext<ChipGroupContextValue>({});

export function useChipGroupContext(): ChipGroupContextValue {
  return useContext(ChipGroupContext);
}
