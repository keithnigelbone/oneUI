/**
 * Shared context between BottomNavigation and BottomNavigationItem (peer of web ChipContext pattern).
 */

import { createContext, useContext } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

export type BottomNavigationLabelType = 'none' | '1line' | '2line';

export type BottomNavigationAppearance = ComponentAppearance;

export interface BottomNavigationContextValue {
  labelType: BottomNavigationLabelType;
  value: string | undefined;
  onValueChange: (value: string) => void;
  appearance: Exclude<BottomNavigationAppearance, 'auto'>;
}

export const BottomNavigationContext = createContext<BottomNavigationContextValue | null>(null);

export function useBottomNavigationContext(): BottomNavigationContextValue | null {
  return useContext(BottomNavigationContext);
}

export function resolveBottomNavigationAppearance(
  appearance: BottomNavigationAppearance | undefined,
): Exclude<BottomNavigationAppearance, 'auto'> {
  if (!appearance || appearance === 'auto') return 'primary';
  return appearance;
}
