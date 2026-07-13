'use client';

/**
 * Universal Icon Component
 *
 * A unified icon component that resolves icons based on the current brand's
 * selected icon set. Supports both semantic icon names (resolved via context)
 * and direct icon components.
 */

import React, { memo, Suspense, useMemo, useState, useEffect } from 'react';
import type { IconProps, IconSize, SemanticIconName, IconComponent, IconSetId } from '@oneui/shared';
import { IconSizeValues } from '@oneui/shared';
import { useIconSet, getJioIconLoader } from './IconContext';
import { SemanticMappings } from './IconRegistry';
import { loadSingleIcon } from './iconLoaders';
import { resolveIconNameWithVariant } from './resolveIconName';

/**
 * Module-level cache for loaded icons (key: `${iconSet}:${iconName}`)
 */
const loadedIconsCache: Record<string, IconComponent> = {};

/**
 * Pending icon load promises for deduplication
 */
const pendingIconLoads: Record<string, Promise<IconComponent | null>> = {};

/**
 * One-time warning when a Jio icon is requested but no loader is registered.
 * The consumer almost certainly forgot to import the icons package.
 */
let warnedNoJioLoader = false;
function warnIfNoJioLoader(): void {
  if (warnedNoJioLoader) return;
  warnedNoJioLoader = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[@jds4/oneui-react] No icon loader registered for the "jio" icon set. '
    + 'Components like Checkbox, Stepper, and FAB will render with missing-icon '
    + 'placeholders. Install `@jds4/oneui-icons-jio` or wrap the tree in '
    + '`<BrandProvider>` (default `iconSet="jio"` registers icons automatically).',
  );
}

/**
 * Get pixel size from IconSize or number
 */
function getPixelSize(size: IconSize | number | undefined, defaultSize: IconSize): number {
  if (typeof size === 'number') {
    return size;
  }
  return IconSizeValues[size ?? defaultSize];
}

/**
 * Lazy icon wrapper for async icon loading
 */
interface LazyIconProps {
  iconSet: string;
  iconName: string;
  cacheSuffix: string;
  size: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

function LazyIcon({
  iconSet,
  iconName,
  cacheSuffix,
  size,
  color,
  strokeWidth,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: LazyIconProps) {
  const cacheKey = `${iconSet}:${cacheSuffix}:${iconName}`;

  // Initialize from cache if available
  const [IconComponent, setIconComponent] = useState<IconComponent | null>(
    () => loadedIconsCache[cacheKey] || null
  );
  const [error, setError] = useState(false);
  // Track retry attempts for Jio icons when loader isn't ready
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Skip if already loaded from cache
    if (loadedIconsCache[cacheKey]) {
      setIconComponent(() => loadedIconsCache[cacheKey]);
      return;
    }

    let mounted = true;

    async function loadIcon() {
      try {
        // Deduplicate in-flight requests
        if (!pendingIconLoads[cacheKey]) {
          pendingIconLoads[cacheKey] = (async () => {
            if (iconSet === 'jio') {
              // Jio icons loaded via registered loader
              const loader = getJioIconLoader();
              if (loader) {
                const jioIcon = await loader(iconName);
                if (jioIcon) {
                  loadedIconsCache[cacheKey] = jioIcon;
                  return jioIcon;
                }
              } else {
                // Loader not yet registered - schedule retry
                if (mounted && retryCount < 3) {
                  setTimeout(() => {
                    if (mounted) {
                      setRetryCount((c) => c + 1);
                    }
                  }, 100);
                } else if (mounted) {
                  // After 3 retries with no loader the consumer almost
                  // certainly forgot to import @jds4/oneui-icons-jio. Warn
                  // once so the missing-icon placeholders aren't mysterious.
                  warnIfNoJioLoader();
                }
              }
              return null;
            }

            // Optional non-Jio icon sets only resolve when the host app has
            // explicitly registered a loader; @jds4/oneui-react ships no
            // default third-party icon-pack imports.
            const icon = await loadSingleIcon(iconSet, iconName);
            if (icon) {
              loadedIconsCache[cacheKey] = icon;
              return icon;
            }
            return null;
          })();
        }

        const icon = await pendingIconLoads[cacheKey];
        delete pendingIconLoads[cacheKey];

        if (mounted && icon) {
          setIconComponent(() => icon);
        } else if (mounted && iconSet !== 'jio') {
          // Only set error for non-Jio icons (Jio icons may retry)
          setError(true);
        }
      } catch (err) {
        delete pendingIconLoads[cacheKey];
        if (mounted) {
          setError(true);
        }
      }
    }

    loadIcon();

    return () => {
      mounted = false;
    };
  }, [iconSet, iconName, cacheKey, cacheSuffix, retryCount]);

  if (error || !IconComponent) {
    // Error: surface a visible placeholder so missing icons don't silently
    // collapse to empty space. LLM-generated screens that reference
    // non-existent semantic names (e.g. "bell" instead of "notification")
    // used to render as invisible gaps; now they render as a neutral dashed
    // square so the designer notices and can fix the name.
    // Loading: still render an empty span so the layout reserves space.
    if (error) {
      return (
        <span
          title={`Missing icon: ${iconName}`}
          aria-label={ariaLabel ?? `Missing icon: ${iconName}`}
          aria-hidden={ariaHidden ?? false}
          className={className}
          style={{
            width: size,
            height: size,
            display: 'inline-block',
            boxSizing: 'border-box',
            border: '1px dashed var(--Border-Subtle, currentColor)',
            borderRadius: 'var(--Shape-3)',
            opacity: 0.4,
          }}
        />
      );
    }
    return (
      <span
        style={{ width: size, height: size, display: 'inline-block' }}
        className={className}
        aria-hidden={ariaHidden ?? true}
      />
    );
  }

  // Jio and Tira icons use standard SVG props (width/height), not size
  if (iconSet === 'jio' || iconSet === 'tira') {
    return (
      <IconComponent
        width={size}
        height={size}
        color={color ?? 'currentColor'}
        className={className}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden ?? !ariaLabel}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      color={color ?? 'currentColor'}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? !ariaLabel}
    />
  );
}

/**
 * Resolve a string `icon` prop to a concrete pack icon name for LazyIcon.
 */
function resolveStringIconName(
  value: string,
  iconSet: string,
  context: {
    variant?: 'outline' | 'filled';
    materialStyle?: 'outlined' | 'sharp';
  },
): string | null {
  const semantic = SemanticMappings[iconSet as keyof typeof SemanticMappings]?.[
    value as SemanticIconName
  ];
  if (semantic) {
    return resolveIconNameWithVariant(semantic, value, {
      iconSet: iconSet as IconSetId,
      variant: context.variant,
      materialStyle: context.materialStyle,
    });
  }

  if (iconSet === 'jio' && value.startsWith('Ic')) {
    return value;
  }

  // An explicit Tira export name (e.g. "HomeOutlined" / "StarFilled") is an
  // intentional glyph choice — honour it literally rather than overriding it
  // with the brand's outline/filled preference (which only applies to the
  // semantic-name path above).
  if (iconSet === 'tira' && (value.endsWith('Outlined') || value.endsWith('Filled'))) {
    return value;
  }

  // OSS pack-native export name (e.g. lucide "Plus", tabler "IconHome").
  if (iconSet !== 'jio') {
    return value;
  }

  return null;
}

/**
 * Icon component
 *
 * @example
 * // Semantic UI icon (brand-aware via BrandProvider iconSet)
 * <Icon icon="add" />
 *
 * @example
 * // Jio catalog glyph by pack id
 * <Icon icon="IcCarSide" size="lg" />
 *
 * @example
 * // Direct component (optional — max tree-shaking)
 * <Icon icon={CustomPlusIcon} size={24} />
 */
export const Icon = memo(function Icon({
  name,
  icon,
  size,
  color,
  strokeWidth: propStrokeWidth,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: IconProps) {
  const { iconSet, defaultSize, strokeWidth: contextStrokeWidth, variant, materialStyle } = useIconSet();

  const pixelSize = getPixelSize(size, defaultSize);
  const effectiveStrokeWidth = propStrokeWidth ?? contextStrokeWidth;
  const iconInput = icon ?? name;

  if (typeof iconInput === 'function') {
    const DirectIcon = iconInput;
    return (
      <DirectIcon
        size={pixelSize}
        width={pixelSize}
        height={pixelSize}
        color={color ?? 'currentColor'}
        strokeWidth={effectiveStrokeWidth}
        className={className}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden ?? !ariaLabel}
      />
    );
  }

  if (typeof iconInput === 'string') {
    const iconName = resolveStringIconName(iconInput, iconSet, { variant, materialStyle });
    if (!iconName) {
      console.warn(
        `Icon "${iconInput}" could not be resolved for icon set "${iconSet}". `
        + 'Use a semantic name ("close"), a Jio pack id ("IcCarSide"), or a pack export name.',
      );
      return null;
    }

    const cacheSuffix =
      iconSet === 'material'
        ? `${materialStyle ?? 'outlined'}:${variant ?? 'outline'}`
        : iconSet === 'tira'
          ? variant ?? 'outline'
          : 'default';

    return (
      <LazyIcon
        iconSet={iconSet}
        iconName={iconName}
        cacheSuffix={cacheSuffix}
        size={pixelSize}
        color={color}
        strokeWidth={effectiveStrokeWidth}
        className={className}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
      />
    );
  }

  return null;
});

Icon.displayName = 'Icon';

export default Icon;
