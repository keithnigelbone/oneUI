'use client';

import { createContext, useContext } from 'react';
import type { MediaContext } from '@oneui/shared/engine';

export type MaterialFoundationMode = 'solid' | 'transparent';
export type MaterialFoundationMediaContext = MediaContext;

export interface MaterialFoundationDefaults {
  defaultMaterialMode: MaterialFoundationMode;
  defaultMediaContext: MaterialFoundationMediaContext;
}

export const DEFAULT_MATERIAL_FOUNDATION: MaterialFoundationDefaults = {
  defaultMaterialMode: 'solid',
  defaultMediaContext: 'dynamic',
};

function isMaterialMode(value: unknown): value is MaterialFoundationMode {
  return value === 'solid' || value === 'transparent';
}

function isMediaContext(value: unknown): value is MaterialFoundationMediaContext {
  return value === 'dynamic' || value === 'dark' || value === 'light';
}

export function normalizeMaterialFoundationConfig(
  config: unknown,
): MaterialFoundationDefaults {
  if (!config || typeof config !== 'object') {
    return DEFAULT_MATERIAL_FOUNDATION;
  }

  const source = config as Partial<MaterialFoundationDefaults>;
  return {
    defaultMaterialMode: isMaterialMode(source.defaultMaterialMode)
      ? source.defaultMaterialMode
      : DEFAULT_MATERIAL_FOUNDATION.defaultMaterialMode,
    defaultMediaContext: isMediaContext(source.defaultMediaContext)
      ? source.defaultMediaContext
      : DEFAULT_MATERIAL_FOUNDATION.defaultMediaContext,
  };
}

const MaterialFoundationContext = createContext<MaterialFoundationDefaults>(
  DEFAULT_MATERIAL_FOUNDATION,
);

export const MaterialFoundationProvider = MaterialFoundationContext.Provider;

export function useMaterialFoundation(): MaterialFoundationDefaults {
  return useContext(MaterialFoundationContext);
}

