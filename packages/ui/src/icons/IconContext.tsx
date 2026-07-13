'use client';

/**
 * Icon Context Provider
 *
 * Provides icon configuration to all components in the tree.
 * Handles icon resolution based on the selected icon set for the current brand.
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
  IconVariantPreference,
  MaterialStylePreference,
} from '@oneui/shared';
import {
  IconSetRegistry,
  SemanticMappings,
  IconCategories,
  getIconSetMetadata,
} from './IconRegistry';
import {
  getJioIconLoader as getSharedJioIconLoader,
  setJioIconLoader as setSharedJioIconLoader,
  getJioIconCatalog as getSharedJioIconCatalog,
} from '@oneui/shared';
import {
  getIconSetLoader as getRegisteredIconSetLoader,
  setIconSetLoader as registerIconSetLoader,
  setIconRuntimePrefs,
  type IconLoader,
} from './iconLoaders';

/**
 * Default context value
 */
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

/**
 * Icon context
 */
const IconContext = createContext<IconContextValue>(defaultContextValue);

/**
 * Icon provider props
 */
interface IconProviderProps {
  /** Selected icon set */
  iconSet: IconSetId;
  /** Default icon size */
  defaultSize?: IconSize;
  /** Stroke width for stroke-based icons */
  strokeWidth?: number;
  /** Outline vs filled preference for mixed sets */
  variant?: IconVariantPreference;
  /** Material Symbols style family */
  materialStyle?: MaterialStylePreference;
  /** Children */
  children: ReactNode;
}

/**
 * Cache for loaded icon modules
 */
const iconModuleCache: Partial<Record<IconSetId, Record<string, IconComponent>>> = {};

/**
 * Cache for pending icon module loads (deduplicates concurrent requests)
 */
const pendingModuleLoads: Partial<Record<IconSetId, Promise<Record<string, IconComponent>>>> = {};

const iconSetCatalogs: Partial<Record<IconSetId, string[]>> = {};

/** Listeners notified when the Jio icon catalog is set */
const catalogListeners: Set<() => void> = new Set();

/**
 * Register an icon loader for a set. Third-party icon sets are opt-in: the
 * core package never imports icon packs by default.
 */
export function setIconSetLoader(iconSet: IconSetId, loader: IconLoader): void {
  registerIconSetLoader(iconSet, loader);
  delete iconModuleCache[iconSet];
  delete pendingModuleLoads[iconSet];
}

/**
 * Get the registered loader for an icon set, if any.
 */
export function getIconSetLoader(iconSet: IconSetId): IconLoader | null {
  if (iconSet === 'jio') {
    return getRegisteredIconSetLoader('jio') ?? getSharedJioIconLoader();
  }
  return getRegisteredIconSetLoader(iconSet);
}

/**
 * Set an icon catalog for browsing. The catalog is optional and only used by
 * tooling surfaces that list every icon in a set.
 */
export function setIconSetCatalog(iconSet: IconSetId, catalog: string[]): void {
  iconSetCatalogs[iconSet] = catalog;
  delete iconModuleCache[iconSet];
  delete pendingModuleLoads[iconSet];
  if (iconSet !== 'jio') return;
  for (const listener of catalogListeners) {
    listener();
  }
}

export function getIconSetCatalog(iconSet: IconSetId): string[] | null {
  if (iconSet === 'jio') {
    return iconSetCatalogs[iconSet] ?? getSharedJioIconCatalog();
  }
  return iconSetCatalogs[iconSet] ?? null;
}

/**
 * Set the Jio icon loader function.
 * Call this from your app to enable Jio icon loading.
 */
export function setJioIconLoader(loader: (name: string) => Promise<IconComponent | null>): void {
  setSharedJioIconLoader(loader);
  setIconSetLoader('jio', loader);
}

/**
 * Set the Jio icon catalog.
 * Call this from your app to enable Jio icon browsing.
 */
export function setJioIconCatalog(catalog: string[]): void {
  setIconSetCatalog('jio', catalog);
}

/**
 * Subscribe to catalog availability changes.
 * Returns an unsubscribe function.
 */
export function onJioIconCatalogReady(listener: () => void): () => void {
  catalogListeners.add(listener);
  return () => { catalogListeners.delete(listener); };
}

/**
 * Get the registered Jio icon loader
 */
export function getJioIconLoader(): ((name: string) => Promise<IconComponent | null>) | null {
  return getSharedJioIconLoader() ?? getIconSetLoader('jio');
}

/**
 * Get the registered Jio icon catalog
 */
export function getJioIconCatalog(): string[] | null {
  return getIconSetCatalog('jio') ?? getSharedJioIconCatalog();
}

/**
 * Load icon module for a specific set (with request deduplication)
 */
async function loadIconModule(setId: IconSetId): Promise<Record<string, IconComponent>> {
  // Return from cache if already loaded
  if (iconModuleCache[setId]) {
    return iconModuleCache[setId]!;
  }

  // Deduplicate concurrent requests - return pending promise if already loading
  if (pendingModuleLoads[setId]) {
    return pendingModuleLoads[setId]!;
  }

  pendingModuleLoads[setId] = (async () => {
    const loader = getIconSetLoader(setId);
    const catalog = getIconSetCatalog(setId);
    const module: Record<string, IconComponent> = {};

    if (loader && catalog) {
      const entries = await Promise.all(
        catalog.map(async (name) => [name, await loader(name)] as const),
      );
      for (const [name, component] of entries) {
        if (component) module[name] = component;
      }
    }

    iconModuleCache[setId] = module;
    delete pendingModuleLoads[setId];
    return module;
  })();

  return pendingModuleLoads[setId]!;
}

/**
 * Icon Provider component
 */
export function IconProvider({
  iconSet,
  defaultSize = 'md',
  strokeWidth,
  variant = 'outline',
  materialStyle = 'outlined',
  children,
}: IconProviderProps) {
  // Publish the active variant/style to the module-level prefs synchronously
  // during render — deliberately NOT in an effect. The material loader reads
  // these prefs at load time from inside a descendant Icon's effect, and React
  // fires effects child-before-parent; an effect here would update the global
  // *after* the icon has already loaded with stale prefs on a variant/style
  // switch, caching the wrong glyph under the new cache key. The write is a
  // pure, idempotent function of props, so running it every render is safe.
  setIconRuntimePrefs({ variant, materialStyle });

  /**
   * Resolve a semantic icon name to its component
   */
  const resolveIcon = useCallback(
    (name: SemanticIconName): IconComponent | null => {
      const iconName = SemanticMappings[iconSet]?.[name];
      if (!iconName) return null;

      // For synchronous resolution, we need pre-loaded icons
      const cachedModule = iconModuleCache[iconSet];
      if (cachedModule && cachedModule[iconName]) {
        return cachedModule[iconName];
      }

      return null;
    },
    [iconSet]
  );

  /**
   * Get an icon component by its actual name
   * Note: icon sets require a custom loader to be registered via setIconSetLoader.
   */
  const getIconByName = useCallback(
    async (name: string): Promise<IconComponent | null> => {
      const cachedModule = iconModuleCache[iconSet];
      if (cachedModule?.[name]) {
        return cachedModule[name];
      }

      const loader = getIconSetLoader(iconSet);
      if (!loader) return null;
      const icon = await loader(name);
      if (icon) {
        iconModuleCache[iconSet] = {
          ...(iconModuleCache[iconSet] ?? {}),
          [name]: icon,
        };
      }
      return icon;
    },
    [iconSet]
  );

  /**
   * Get all icons for browsing
   * Note: icon browsing requires a custom catalog to be registered via setIconSetCatalog.
   */
  const getAllIcons = useCallback(async (): Promise<IconEntry[]> => {
    const catalog = getIconSetCatalog(iconSet);
    if (catalog) {
      return catalog.map((name: string) => ({ name }));
    }

    const module = await loadIconModule(iconSet);
    const iconNames = Object.keys(module).filter(
      (key) => typeof module[key] === 'function' && /^[A-Z]/.test(key)
    );
    return iconNames.map((name) => ({ name }));
  }, [iconSet]);

  /**
   * Get icon categories
   */
  const getCategories = useCallback((): IconCategory[] => {
    return IconCategories;
  }, []);

  /**
   * Get icon set metadata
   */
  const getMetadata = useCallback((): IconSetMetadata => {
    return getIconSetMetadata(iconSet);
  }, [iconSet]);

  const value = useMemo<IconContextValue>(
    () => ({
      iconSet,
      defaultSize,
      strokeWidth: strokeWidth ?? IconSetRegistry[iconSet]?.defaultStrokeWidth,
      variant,
      materialStyle,
      resolveIcon,
      getIconByName,
      getAllIcons,
      getCategories,
      getMetadata,
    }),
    [iconSet, defaultSize, strokeWidth, variant, materialStyle, resolveIcon, getIconByName, getAllIcons, getCategories, getMetadata]
  );

  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
}

/**
 * Hook to access icon context
 */
export function useIconSet(): IconContextValue {
  const context = useContext(IconContext);
  if (!context) {
    throw new Error('useIconSet must be used within an IconProvider');
  }
  return context;
}

/**
 * Hook to preload icon module for the current set
 */
export function usePreloadIcons(): () => Promise<void> {
  const { iconSet } = useIconSet();

  return useCallback(async () => {
    await loadIconModule(iconSet);
  }, [iconSet]);
}

export { IconContext };
