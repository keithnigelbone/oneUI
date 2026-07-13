/**
 * Selection state for chips inside ChipGroup (peer of Base UI ToggleGroup wiring).
 */

import { createContext, useContext } from 'react';

export interface ChipGroupSelectionContextValue {
  selectedValues: string[];
  toggleValue: (chipValue: string) => void;
}

export const ChipGroupSelectionContext = createContext<ChipGroupSelectionContextValue | null>(
  null,
);

export function useChipGroupSelectionContext(): ChipGroupSelectionContextValue | null {
  return useContext(ChipGroupSelectionContext);
}
