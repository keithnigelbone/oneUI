/**
 * Native Icon Context Provider — mirrors `@oneui/ui/icons/IconContext` API.
 *
 * Differences from web:
 *   - No DOM, no `'use client'` directive, no `currentColor` cascade.
 *   - Non-Jio icon sets are NOT auto-imported (web uses `await import('lucide-react')`
 *     etc.). On native, icon sets must be wired through the `setJioIconLoader` /
 *     `setJioIconCatalog` bridge — same shape as web — and any other set
 *     consumed via `<Icon icon={Component} />` directly.
 *
 * The public API surface (named exports + their signatures) is identical
 * to the web `IconContext`, so callers can swap imports without code edits.
 */

import React, { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import type {
  IconSetId,
  IconSize,
  IconContextValue,
  SemanticIconName,
  IconComponent,
  IconEntry,
  IconCategory,
  IconSetMetadata,
} from '@oneui/shared';
import {
  IconSetRegistry,
  SemanticMappings,
  IconCategories,
  getIconSetMetadata,
} from './IconRegistry';

const defaultContextValue: IconContextValue = {
  iconSet: 'jio',
  defaultSize: 'md',
  strokeWidth: undefined,
  resolveIcon: () => null,
  getIconByName: async () => null,
  getAllIcons: async () => [],
  getCategories: () => IconCategories,
  getMetadata: () => IconSetRegistry.jio,
};

const IconContext = createContext<IconContextValue>(defaultContextValue);

interface IconProviderProps {
  iconSet: IconSetId;
  defaultSize?: IconSize;
  strokeWidth?: number;
  children: ReactNode;
}

import {
  setJioIconLoader,
  setJioIconCatalog,
  getJioIconLoader,
  getJioIconCatalog,
  onJioIconCatalogReady,
} from '@oneui/shared';
export { setJioIconLoader, setJioIconCatalog, getJioIconLoader, getJioIconCatalog, onJioIconCatalogReady };

const iconModuleCache: Partial<Record<IconSetId, Record<string, IconComponent>>> = {};
const pendingModuleLoads: Partial<Record<IconSetId, Promise<Record<string, IconComponent>>>> = {};

/**
 * Native equivalent of web's `loadIconModule`. Web auto-imports `lucide-react`,
 * `@tabler/icons-react`, etc. — those packages are not RN-compatible, so on
 * native every set must be registered via the loader bridge or consumed via
 * `<Icon icon={Component} />`. Returning an empty record for non-Jio sets
 * keeps the API shape identical without dragging DOM-only deps into Metro.
 */
async function loadIconModule(setId: IconSetId): Promise<Record<string, IconComponent>> {
  if (iconModuleCache[setId]) {
    return iconModuleCache[setId]!;
  }

  if (pendingModuleLoads[setId]) {
    return pendingModuleLoads[setId]!;
  }

  pendingModuleLoads[setId] = (async () => {
    const module: Record<string, IconComponent> = {};
    iconModuleCache[setId] = module;
    delete pendingModuleLoads[setId];
    return module;
  })();

  return pendingModuleLoads[setId]!;
}

export function IconProvider({
  iconSet,
  defaultSize = 'md',
  strokeWidth,
  children,
}: IconProviderProps): React.ReactElement {
  const resolveIcon = useCallback(
    (name: SemanticIconName): IconComponent | null => {
      const iconName = SemanticMappings[iconSet]?.[name];
      if (!iconName) return null;

      const cachedModule = iconModuleCache[iconSet];
      if (cachedModule && cachedModule[iconName]) {
        return cachedModule[iconName];
      }

      return null;
    },
    [iconSet],
  );

  const getIconByName = useCallback(
    async (name: string): Promise<IconComponent | null> => {
      if (iconSet === 'jio') {
        const loader = getJioIconLoader();
        if (loader) {
          return loader(name);
        }
        return null;
      }

      const module = await loadIconModule(iconSet);
      return module[name] || null;
    },
    [iconSet],
  );

  const getAllIcons = useCallback(async (): Promise<IconEntry[]> => {
    if (iconSet === 'jio') {
      const catalog = getJioIconCatalog();
      if (catalog) {
        return catalog.map((name: string) => ({ name }));
      }
      return [];
    }

    const module = await loadIconModule(iconSet);
    const iconNames = Object.keys(module).filter(
      (key) => typeof module[key] === 'function' && /^[A-Z]/.test(key),
    );
    return iconNames.map((name) => ({ name }));
  }, [iconSet]);

  const getCategories = useCallback((): IconCategory[] => {
    return IconCategories;
  }, []);

  const getMetadata = useCallback((): IconSetMetadata => {
    return getIconSetMetadata(iconSet);
  }, [iconSet]);

  const value = useMemo<IconContextValue>(
    () => ({
      iconSet,
      defaultSize,
      strokeWidth: strokeWidth ?? IconSetRegistry[iconSet]?.defaultStrokeWidth,
      resolveIcon,
      getIconByName,
      getAllIcons,
      getCategories,
      getMetadata,
    }),
    [iconSet, defaultSize, strokeWidth, resolveIcon, getIconByName, getAllIcons, getCategories, getMetadata],
  );

  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
}

/**
 * Read the active icon-set context. Falls back to the default value when no
 * `<IconProvider>` is mounted (matches the web semantics — `createContext`
 * default applies, no throw).
 */
export function useIconSet(): IconContextValue {
  return useContext(IconContext);
}

/**
 * Preload the active icon set's module so subsequent `<Icon name=…>` calls
 * resolve synchronously. On native this is a no-op for non-Jio sets; for Jio
 * the actual catalog/loader registration is what matters and happens at
 * startup via `setJioIconLoader` / `setJioIconCatalog`.
 */
export function usePreloadIcons(): () => Promise<void> {
  const { iconSet } = useIconSet();

  return useCallback(async () => {
    await loadIconModule(iconSet);
  }, [iconSet]);
}

export { IconContext };
