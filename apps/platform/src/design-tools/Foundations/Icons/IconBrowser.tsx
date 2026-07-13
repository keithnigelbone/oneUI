'use client';

/**
 * IconBrowser Component
 *
 * A searchable grid of icons from the selected icon set.
 * Supports search filtering and copying import snippets.
 */

import React, { memo, useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import styles from './IconBrowser.module.css';
import type { IconBrowserProps } from './IconBrowser.shared';
import type { IconComponent, IconEntry, IconSetId } from '@oneui/shared';
import { Input } from '@oneui/ui/components/Input';
import { Icon } from '@oneui/ui/icons/Icon';
import { getImportSnippet, IconSetRegistry } from '@oneui/ui-internal/icons/IconRegistry';
import { getJioIconLoader, getJioIconCatalog, onJioIconCatalogReady, getIconSetLoader, getIconSetCatalog } from '@oneui/ui-internal/icons/IconContext';

/**
 * @deprecated Use setJioIconCatalog from IconContext instead.
 * Kept for backward compatibility — now delegates to getJioIconCatalog().
 */
export function setIconBrowserJioCatalog(_catalog: string[]): void {
  // No-op: catalog is now read from IconContext via getJioIconCatalog()
}

/**
 * Empty state icon
 */
const EmptyIcon = () => (
  <svg
    className={styles.emptyIcon}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 18L30 30M30 18L18 30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Single icon grid item
 */
interface IconGridItemProps {
  name: string;
  iconSetId: string;
  onClick: (name: string) => void;
  IconComponent: IconComponent | null;
  strokeWidth?: number;
}

const IconGridItem = memo(function IconGridItem({
  name,
  onClick,
  IconComponent,
  strokeWidth,
}: IconGridItemProps) {
  const handleClick = useCallback(() => {
    onClick(name);
  }, [name, onClick]);

  // Get a short display name
  const displayName = useMemo(() => {
    // Remove common prefixes
    let short = name
      .replace(/^Ic/, '')
      .replace(/^Icon/, '')
      .replace(/^Ri/, '')
      .replace(/Icon$/, '');

    // Truncate if too long
    if (short.length > 10) {
      short = short.slice(0, 9) + '...';
    }
    return short || name;
  }, [name]);

  return (
    <div
      className={styles.iconItem}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      title={`Click to copy: ${name}`}
    >
      <div className={styles.iconPreview}>
        {IconComponent ? (
          <IconComponent size={24} width={24} height={24} strokeWidth={strokeWidth} />
        ) : (
          <span style={{ width: 24, height: 24 }} />
        )}
      </div>
      <span className={styles.iconName}>{displayName}</span>
    </div>
  );
});

export const IconBrowser = memo(function IconBrowser({
  iconSetId,
  onIconClick,
  maxHeight = 400,
}: IconBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allIcons, setAllIcons] = useState<IconEntry[]>([]);
  const [iconComponents, setIconComponents] = useState<Record<string, IconComponent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  // Tracks catalog version so useEffect re-runs when catalog becomes available
  const [catalogVersion, setCatalogVersion] = useState(0);

  const iconSetMetadata = IconSetRegistry[iconSetId];

  // Subscribe to catalog ready events (handles async catalog loading)
  useEffect(() => {
    if (iconSetId !== 'jio') return;
    return onJioIconCatalogReady(() => {
      setCatalogVersion((v) => v + 1);
    });
  }, [iconSetId]);

  const isCatalogBackedSet = iconSetId === 'jio' || iconSetId === 'tira';

  // Load all icons for the current set
  useEffect(() => {
    let mounted = true;

    async function loadIcons() {
      setIsLoading(true);
      setAllIcons([]);
      setIconComponents({});

      try {
        if (isCatalogBackedSet) {
          const loader = iconSetId === 'jio' ? getJioIconLoader() : getIconSetLoader(iconSetId);
          const catalog = iconSetId === 'jio' ? getJioIconCatalog() : getIconSetCatalog(iconSetId);

          if (catalog && loader) {
            // Set the icon list immediately
            if (mounted) {
              setAllIcons(catalog.map((name: string) => ({ name })));
            }

            // Load first batch of icons (up to 200 for performance)
            const iconsToLoad = catalog.slice(0, 200);
            const loadedComponents: Record<string, IconComponent> = {};

            // Load icons in parallel with a concurrency limit
            const BATCH_SIZE = 20;
            for (let i = 0; i < iconsToLoad.length && mounted; i += BATCH_SIZE) {
              const batch = iconsToLoad.slice(i, i + BATCH_SIZE);
              const results = await Promise.all(
                batch.map(async (name) => {
                  const component = await loader(name);
                  return { name, component };
                })
              );

              for (const { name, component } of results) {
                if (component) {
                  loadedComponents[name] = component;
                }
              }

              // Update state periodically to show progress (low priority)
              if (mounted && (i + BATCH_SIZE) % 60 === 0) {
                startTransition(() => {
                  setIconComponents({ ...loadedComponents });
                });
              }
            }

            if (mounted) {
              setIconComponents(loadedComponents);
            }
          } else if (catalog) {
            console.warn(`[IconBrowser] ${iconSetId} icon catalog available but no loader registered`);
            if (mounted) {
              setAllIcons(catalog.map((name: string) => ({ name })));
              setIconComponents({});
            }
          } else {
            console.warn(`[IconBrowser] No ${iconSetId} icon catalog available`);
            if (mounted) {
              setAllIcons([]);
              setIconComponents({});
            }
          }
        } else if (iconSetId === 'material') {
          const rawModule = await import(
            /* webpackChunkName: "material-symbols-outlined" */
            '@nine-thirty-five/material-symbols-react/outlined'
          );
          const module = rawModule as Record<string, unknown>;
          const iconNames = Object.keys(module)
            .filter((key) => /^[A-Z]/.test(key))
            .sort();
          const iconEntries: Record<string, IconComponent> = {};

          for (const name of iconNames.slice(0, 200)) {
            const value = module[name];
            if (typeof value === 'function' || (value && typeof value === 'object')) {
              iconEntries[name] = value as IconComponent;
            }
          }

          if (mounted) {
            // Only list icons we actually loaded a component for. The module
            // exports thousands of symbols but eager loading is capped above;
            // listing the un-loaded remainder renders them as broken
            // placeholders, so keep the list and the component map in sync.
            const loadedNames = Object.keys(iconEntries);
            setAllIcons(loadedNames.map((name) => ({ name })));
            setIconComponents(iconEntries);
          }
        } else {
          // Load external icon library
          let rawModule: unknown;

          switch (iconSetId) {
            case 'lucide':
              rawModule = await import(/* webpackChunkName: "lucide-icons" */ 'lucide-react');
              break;
            case 'tabler':
              rawModule = await import(/* webpackChunkName: "tabler-icons" */ '@tabler/icons-react');
              break;
            case 'hugeicons':
              rawModule = await import(/* webpackChunkName: "hugeicons" */ 'hugeicons-react');
              break;
            case 'phosphor':
              rawModule = await import(/* webpackChunkName: "phosphor-icons" */ '@phosphor-icons/react');
              break;
            case 'remix':
              rawModule = await import(/* webpackChunkName: "remix-icons" */ '@remixicon/react');
              break;
            default:
              rawModule = {};
          }

          if (mounted && rawModule) {
            const module = rawModule as Record<string, unknown>;
            const keys = Object.keys(module);

            // Try different strategies to find icons
            let iconEntries: Record<string, IconComponent> = {};
            let iconNames: string[] = [];

            // Strategy 1: Check for 'icons' object (lucide-react has this)
            if ('icons' in module && typeof module.icons === 'object' && module.icons !== null) {
              const iconsObj = module.icons as Record<string, unknown>;
              const iconKeys = Object.keys(iconsObj);

              for (const key of iconKeys) {
                if (/^[A-Z]/.test(key)) {
                  iconNames.push(key);
                  iconEntries[key] = iconsObj[key] as IconComponent;
                }
              }
            }

            // Strategy 2: If no icons object found, scan module exports directly
            if (iconNames.length === 0) {
              // Library-specific patterns for icon names
              const iconPatterns: Record<string, RegExp> = {
                lucide: /^[A-Z][a-z][a-zA-Z0-9]*$/,
                tabler: /^Icon[A-Z]/,
                hugeicons: /Icon$/,
                phosphor: /^[A-Z][a-z][a-zA-Z0-9]*$/,
                remix: /^Ri[A-Z]/,
              };

              const pattern = iconPatterns[iconSetId] || /^[A-Z]/;

              const skipList = new Set([
                'Icon', 'IconContext', 'Icons', 'IconBase', 'GenIcon',
                'DefaultContext', 'IconProvider', 'createLucideIcon',
                'default', 'icons', 'createElement', 'createReactComponent',
                'SSRProvider', 'IconProps', 'IconWeight', 'LucideIcon',
              ]);

              for (const key of keys) {
                if (!pattern.test(key)) continue;
                if (skipList.has(key)) continue;
                if (key.startsWith('__')) continue;
                if (key.endsWith('Context') || key.endsWith('Provider')) continue;

                const value = module[key];
                if (!value) continue;

                if (typeof value === 'function' || typeof value === 'object') {
                  iconNames.push(key);
                  iconEntries[key] = value as IconComponent;
                }
              }
            }

            if (iconNames.length === 0) {
              const registry = IconSetRegistry[iconSetId as keyof typeof IconSetRegistry];
              if (registry?.previewIcons) {
                for (const iconName of registry.previewIcons) {
                  if (module[iconName]) {
                    iconNames.push(iconName);
                    iconEntries[iconName] = module[iconName] as IconComponent;
                  }
                }
              }
            }

            iconNames.sort();

            setAllIcons(iconNames.map((name) => ({ name })));
            setIconComponents(iconEntries);
          }
        }
      } catch (err) {
        console.error(`[IconBrowser] Failed to load icons for ${iconSetId}:`, err);
        console.error(`[IconBrowser] Error details:`, String(err));
        if (mounted) {
          setAllIcons([]);
          setIconComponents({});
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadIcons();

    return () => {
      mounted = false;
    };
  }, [iconSetId, catalogVersion]);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return allIcons;
    }

    const query = searchQuery.toLowerCase();
    return allIcons.filter((icon) => icon.name.toLowerCase().includes(query));
  }, [allIcons, searchQuery]);
  const iconCount = allIcons.length || iconSetMetadata?.totalIcons || 0;

  // Load Jio icons on-demand when filtered results include unloaded icons
  useEffect(() => {
    if (iconSetId !== 'jio' || isLoading) return;

    const jioLoader = getJioIconLoader();
    if (!jioLoader) return;

    // Get icons that need loading (visible ones that aren't loaded yet)
    const visibleIcons = filteredIcons.slice(0, 200);
    const unloadedIcons = visibleIcons.filter(
      (icon) => !iconComponents[icon.name]
    );

    if (unloadedIcons.length === 0) return;

    let mounted = true;

    async function loadMissingIcons() {
      const newComponents: Record<string, IconComponent> = {};

      // Load in batches
      const BATCH_SIZE = 20;
      for (let i = 0; i < unloadedIcons.length && mounted; i += BATCH_SIZE) {
        const batch = unloadedIcons.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map(async (icon) => {
            const component = await jioLoader!(icon.name);
            return { name: icon.name, component };
          })
        );

        for (const { name, component } of results) {
          if (component) {
            newComponents[name] = component;
          }
        }
      }

      if (mounted && Object.keys(newComponents).length > 0) {
        startTransition(() => {
          setIconComponents((prev) => ({ ...prev, ...newComponents }));
        });
      }
    }

    loadMissingIcons();

    return () => {
      mounted = false;
    };
  }, [iconSetId, filteredIcons, iconComponents, isLoading]);

  // Handle icon click - copy import snippet
  const handleIconClick = useCallback(
    (iconName: string) => {
      const importSnippet = getImportSnippet(iconSetId, iconName);

      // Copy to clipboard
      navigator.clipboard.writeText(importSnippet).then(() => {
        setCopiedName(iconName);
        setTimeout(() => setCopiedName(null), 2000);
      });

      // Call external handler if provided
      onIconClick?.(iconName, importSnippet);
    },
    [iconSetId, onIconClick]
  );

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <Input
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={`Search ${iconCount.toLocaleString()} icons...`}
          size="m"
          appearance="primary"
          start={<Icon name="search" size="sm" />}
          className={styles.searchInput}
          aria-label="Search icons"
        />
        <span className={styles.resultCount}>
          {filteredIcons.length.toLocaleString()} results
        </span>
      </div>

      <div
        className={styles.gridContainer}
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        {isLoading ? (
          <div className={styles.loadingState}>Loading icons...</div>
        ) : filteredIcons.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyIcon />
            <p className={styles.emptyText}>
              {searchQuery ? `No icons found for "${searchQuery}"` : 'No icons available'}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredIcons.slice(0, 200).map((icon) => (
              <IconGridItem
                key={icon.name}
                name={icon.name}
                iconSetId={iconSetId}
                onClick={handleIconClick}
                IconComponent={iconComponents[icon.name] || null}
                strokeWidth={iconSetMetadata?.defaultStrokeWidth}
              />
            ))}
            {filteredIcons.length > 200 && (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  Showing 200 of {filteredIcons.length.toLocaleString()} icons. Use search to find more.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {copiedName && (
        <div className={styles.copiedToast}>Copied import for {copiedName}</div>
      )}
    </div>
  );
});

IconBrowser.displayName = 'IconBrowser';

export default IconBrowser;
