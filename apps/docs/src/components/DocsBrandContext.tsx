'use client';

import { createContext, useContext } from 'react';

export type DocsTheme = 'light' | 'dark';
export type DocsDensity = 'compact' | 'default' | 'open';

export interface DocsBrandOption {
  id: string;
  name: string;
  slug?: string;
  status?: string;
}

export interface DocsBrandContextValue {
  brands: DocsBrandOption[];
  selectedBrandId: string | null;
  selectedBrandName: string;
  theme: DocsTheme;
  density: DocsDensity;
  hasConvex: boolean;
  isBrandReady: boolean;
  setSelectedBrandId: (brandId: string) => void;
  setTheme: (theme: DocsTheme) => void;
  setDensity: (density: DocsDensity) => void;
}

const noop = () => {};

export const DocsBrandContext = createContext<DocsBrandContextValue>({
  brands: [],
  selectedBrandId: null,
  selectedBrandName: 'Base tokens',
  theme: 'light',
  density: 'default',
  hasConvex: false,
  isBrandReady: false,
  setSelectedBrandId: noop,
  setTheme: noop,
  setDensity: noop,
});

export function useDocsBrand() {
  return useContext(DocsBrandContext);
}
