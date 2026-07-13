/**
 * HeaderContext — Figma HeaderNative root properties shared with sub-components.
 */

import { createContext, useContext } from 'react';

export interface HeaderContextValue {
  expanded: boolean;
  secondaryNav: boolean;
  divider: boolean;
}

const defaultValue: HeaderContextValue = {
  expanded: false,
  secondaryNav: false,
  divider: false,
};

export const HeaderContext = createContext<HeaderContextValue>(defaultValue);

export function useHeaderContext(): HeaderContextValue {
  return useContext(HeaderContext);
}
