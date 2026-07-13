'use client';

/**
 * TabsContext.ts
 * React context for TabGroup to propagate shared props to child TabItems.
 * Pattern mirrors ChipContext.ts.
 */

'use client';

import { createContext, useContext } from 'react';
import type { TabsSize, TabsOrientation } from './Tabs.shared';
import type { ComponentAppearance } from '@oneui/shared';

export interface TabsContextValue {
  size?: TabsSize;
  orientation?: TabsOrientation;
  appearance?: ComponentAppearance;
}

export const TabsContext = createContext<TabsContextValue>({});

/** Read the nearest TabGroup's propagated defaults. Returns {} when not inside a TabGroup. */
export function useTabsContext(): TabsContextValue {
  return useContext(TabsContext);
}