'use client';

/**
 * SlotParentAppearanceContext
 *
 * Slot-owning parents (Badge, Button, …) provide their **resolved** multi-accent
 * role so descendants can inherit `appearance` when their own prop is unset or
 * `'auto'`, without a separate global appearance system.
 */

'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

/** Resolved role from the parent — never `'auto'`. */
export type SlotParentAppearance = Exclude<ComponentAppearance, 'auto'>;

const SlotParentAppearanceContext = createContext<SlotParentAppearance | null>(null);

export function SlotParentAppearanceProvider({
  value,
  children,
}: {
  value: SlotParentAppearance;
  children: ReactNode;
}): React.ReactElement {
  return (
    <SlotParentAppearanceContext.Provider value={value}>{children}</SlotParentAppearanceContext.Provider>
  );
}

/** Nearest slot parent’s resolved appearance, or `null` outside any provider. */
export function useSlotParentAppearance(): SlotParentAppearance | null {
  return useContext(SlotParentAppearanceContext);
}