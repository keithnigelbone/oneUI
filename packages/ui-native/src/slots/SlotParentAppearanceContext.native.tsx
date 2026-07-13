/**
 * SlotParentAppearanceContext (native)
 *
 * RN peer of `packages/ui/src/contexts/SlotParentAppearanceContext.tsx`.
 *
 * Slot-owning parents (Badge, Button, …) provide their **resolved** multi-accent
 * role so descendants can inherit `appearance` when their own prop is unset or
 * `'auto'`. Leaf components (`Avatar`, `IndicatorBadge`, `CounterBadge`, …)
 * read the context via `useSlotParentAppearance()` and use it as the fallback
 * before landing on the terminal default.
 *
 * Mirrors the web fallback chain `props.appearance ?? slotParent ?? <default>`.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

/** Resolved role from the parent — never `'auto'`. */
export type SlotParentAppearance = Exclude<ComponentAppearance, 'auto'>;

const SlotParentAppearanceContext = createContext<SlotParentAppearance | null>(null);

export interface SlotParentAppearanceProviderProps {
  value: SlotParentAppearance;
  children: ReactNode;
}

export function SlotParentAppearanceProvider({
  value,
  children,
}: SlotParentAppearanceProviderProps): React.ReactElement {
  return (
    <SlotParentAppearanceContext.Provider value={value}>
      {children}
    </SlotParentAppearanceContext.Provider>
  );
}

/** Nearest slot parent's resolved appearance, or `null` outside any provider. */
export function useSlotParentAppearance(): SlotParentAppearance | null {
  return useContext(SlotParentAppearanceContext);
}
