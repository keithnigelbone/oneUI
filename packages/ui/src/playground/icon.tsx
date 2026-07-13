/**
 * playground/icon.tsx
 *
 * Synchronous Icon + IconProvider for the playground iframe. The
 * platform's OneUI Icon uses async lazy-loading via dynamic imports,
 * which Sandpack's bundler rewrites in a way the iframe runtime can't
 * resolve — icons stay stuck as empty placeholders.
 *
 * Two icon sets are supported in the iframe:
 *   - `lucide`: eager-imported as a JS namespace, rendered via the
 *     library's React components.
 *   - `jio`: parent-app delivers the catalog as a Sandpack file
 *     (`/jio-icons-data.json`); iframe boot stashes it on
 *     `window.__jioIconCatalog`, and we render inline `<svg>` from the
 *     `{ v: viewBox, d: innerSVG }` entries.
 *
 * Other sets (phosphor, tabler, hugeicons, remix) fall back to lucide
 * with a one-time console warning until they're bundled or bridged.
 */

import React, { createContext, useContext, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { IconSetId, IconSize } from '@oneui/shared';
import { IconSizeValues } from '@oneui/shared';
import { lucide as lucideMapping } from '../icons/semanticMappings/lucide';
import { jio as jioMapping } from '../icons/semanticMappings/jio';
import { JIO_CATALOG_WINDOW_KEY } from './messageTypes';

export type PlaygroundIconSet = IconSetId;
export type PlaygroundIconSize = IconSize;

const BUNDLED_ICON_SETS = new Set<PlaygroundIconSet>(['lucide', 'jio']);

interface JioIconEntry {
  /** SVG viewBox attribute (e.g. "0 0 24 24"). */
  v: string;
  /** SVG inner markup (paths, defs, etc.) — rendered via dangerouslySetInnerHTML. */
  d: string;
}

type JioIconCatalog = Record<string, JioIconEntry>;


interface IconContextValue {
  iconSet: PlaygroundIconSet;
  defaultSize: PlaygroundIconSize;
  strokeWidth?: number;
}

const IconCtx = createContext<IconContextValue>({
  iconSet: 'lucide',
  defaultSize: 'md',
  strokeWidth: 2,
});

export interface IconProviderProps {
  iconSet?: PlaygroundIconSet;
  defaultSize?: PlaygroundIconSize;
  strokeWidth?: number;
  children: React.ReactNode;
}

export function IconProvider({
  iconSet = 'lucide',
  defaultSize = 'md',
  strokeWidth = 2,
  children,
}: IconProviderProps) {
  // Fall back to Lucide when the requested set isn't in the bundle.
  // Logged once per session so the host app can see which brand sets
  // are missing without spamming the console.
  const resolvedSet: PlaygroundIconSet = BUNDLED_ICON_SETS.has(iconSet) ? iconSet : 'lucide';
  if (resolvedSet !== iconSet && typeof window !== 'undefined') {
    if (!iconFallbackWarned.has(iconSet)) {
      iconFallbackWarned.add(iconSet);
      // eslint-disable-next-line no-console
      console.warn(
        `[oneui playground] icon set "${iconSet}" is not bundled in the playground. Falling back to "lucide".`,
      );
    }
  }
  const value = useMemo(
    () => ({ iconSet: resolvedSet, defaultSize, strokeWidth }),
    [resolvedSet, defaultSize, strokeWidth],
  );
  return <IconCtx.Provider value={value}>{children}</IconCtx.Provider>;
}

const iconFallbackWarned = new Set<PlaygroundIconSet>();

export interface IconProps {
  /** Semantic name (e.g. "search", "home", "shopping-cart"). Maps via
   *  the icon set's semantic table. Unknown names render nothing. */
  name: string;
  /** T-shirt size from the OneUI scale. Defaults to the provider's
   *  `defaultSize` (typically `md`/20px). */
  size?: PlaygroundIconSize;
  /** Override stroke width for stroke-based libraries (Lucide, Phosphor). */
  strokeWidth?: number;
  /** Inline CSS — useful for color via `var(--Token-Name)`. */
  style?: React.CSSProperties;
  /** Forwarded to the rendered SVG for ARIA / data attributes. */
  className?: string;
  'aria-label'?: string;
  'data-oneui-loc'?: string;
}

/**
 * Resolves the semantic icon name to a Lucide component.
 * Looks up `SemanticMappings.lucide[name]` to get the PascalCase Lucide
 * name (e.g. "search" → "Search"), then reads it from the eager
 * `LucideIcons` namespace.
 */
function resolveLucide(name: string): LucideIcon | null {
  const mapped = lucideMapping[name as keyof typeof lucideMapping];
  if (!mapped) return null;
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[mapped] ?? null;
}

/**
 * Resolves the semantic icon name to a Jio SVG entry from the catalog
 * the parent app injected at iframe boot. Returns null if the catalog
 * isn't loaded yet (caller will fall back to Lucide).
 */
function resolveJio(name: string): JioIconEntry | null {
  if (typeof window === 'undefined') return null;
  const catalog = (window as unknown as Record<string, JioIconCatalog | undefined>)[JIO_CATALOG_WINDOW_KEY];
  if (!catalog) return null;
  const mapped = jioMapping[name as keyof typeof jioMapping];
  if (!mapped) return null;
  return catalog[mapped] ?? null;
}

export function Icon({
  name,
  size,
  strokeWidth,
  style,
  className,
  'aria-label': ariaLabel,
  'data-oneui-loc': dataLoc,
}: IconProps) {
  const ctx = useContext(IconCtx);
  const px = IconSizeValues[size ?? ctx.defaultSize];
  const stroke = strokeWidth ?? ctx.strokeWidth ?? 2;

  // Jio path: render an inline <svg> from the catalog entry. We keep
  // `currentColor` in the path data so the SVG inherits the colour set
  // by the parent (CSS color or Token). Falls back to Lucide if the
  // catalog isn't loaded or the name isn't mapped.
  if (ctx.iconSet === 'jio') {
    const entry = resolveJio(name);
    if (entry) {
      return (
        <svg
          width={px}
          height={px}
          viewBox={entry.v}
          fill="currentColor"
          aria-label={ariaLabel}
          className={className}
          style={style}
          data-oneui-loc={dataLoc}
          dangerouslySetInnerHTML={{ __html: entry.d }}
        />
      );
    }
    // Jio catalog miss — fall through to Lucide for resilience.
  }

  const Component = resolveLucide(name);
  if (!Component) {
    return (
      <span
        role="img"
        aria-label={ariaLabel ?? `Missing icon: ${name}`}
        title={`Missing icon: ${name}`}
        data-oneui-loc={dataLoc}
        style={{
          display: 'inline-block',
          width: px,
          height: px,
          borderRadius: 'var(--Shape-2)',
          background: 'var(--Negative-Subtle, rgba(220,80,80,0.15))',
          border: '1px dashed var(--Negative-TintedA11y, #b00)',
          ...style,
        }}
      />
    );
  }

  return (
    <Component
      size={px}
      strokeWidth={stroke}
      aria-label={ariaLabel}
      className={className}
      style={style}
      data-oneui-loc={dataLoc}
    />
  );
}
