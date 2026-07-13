/**
 * TabsContext — propagates TabGroup defaults to TabItems.
 * Peer of packages/ui/src/components/Tabs/TabsContext.ts
 */

import { createContext, useContext } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import type { TabsOrientation, TabsSize } from './interface';

export interface TabsContextValue {
  size?: TabsSize;
  orientation?: TabsOrientation;
  appearance?: ComponentAppearance;
}

export const TabsContext = createContext<TabsContextValue>({});

/** Read the nearest TabGroup / Tabs.Root propagated defaults. */
export function useTabsContext(): TabsContextValue {
  return useContext(TabsContext);
}
