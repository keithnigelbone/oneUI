/**
 * Shared icon-slot context for native components (Button start/end, Avatar icon, …).
 * RN peer of web `currentColor` + fixed icon box sizing inside a parent slot.
 */

import { createContext, useContext } from 'react';

export interface ComponentSlotIconContextValue {
  /** Omitted when the parent only publishes tint (e.g. Chip slot colour). */
  sizePx?: number;
  color?: string;
}

export const ComponentSlotIconContext = createContext<ComponentSlotIconContextValue | undefined>(
  undefined,
);

export function useComponentSlotIconContext(): ComponentSlotIconContextValue | undefined {
  return useContext(ComponentSlotIconContext);
}
