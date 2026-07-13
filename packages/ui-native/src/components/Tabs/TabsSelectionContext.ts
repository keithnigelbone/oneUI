/**
 * TabsSelectionContext — shared selection state + tab layout registry for the indicator.
 */

import { createContext, useContext, type RefObject } from 'react';
import type { TabsValue } from './interface';

export interface TabContentLayout {
  /** Content-wrapper left edge relative to the tab list. */
  x: number;
  /** Content-wrapper top edge relative to the tab list. */
  y: number;
  /** Content-wrapper width (indicator tracks this on horizontal tabs). */
  width: number;
  /** Tab outer height (for vertical indicator centering). */
  height: number;
}

export interface TabsSelectionContextValue {
  value: TabsValue;
  selectValue: (next: string | number) => void;
  listRef: RefObject<unknown> | null;
  registerTabLayout: (tabValue: string | number, layout: TabContentLayout) => void;
  unregisterTabLayout: (tabValue: string | number) => void;
  getTabLayout: (tabValue: string | number) => TabContentLayout | undefined;
}

export const TabsSelectionContext = createContext<TabsSelectionContextValue | null>(null);

export function useTabsSelectionContext(): TabsSelectionContextValue | null {
  return useContext(TabsSelectionContext);
}
