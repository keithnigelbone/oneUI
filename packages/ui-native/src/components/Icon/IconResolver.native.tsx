/**
 * Native Icon — full API parity with `@oneui/ui/icons/Icon`.
 *
 * Resolution order (matches web):
 *   1. `icon={Component}` — render directly (e.g. JDS RN glyph or custom SVG).
 *   2. `name="add"`        — resolve via `IconContext` →
 *                            `SemanticMappings[iconSet][name]` →
 *                            registered loader (Jio) or pre-loaded module.
 *   3. otherwise          — render `null`.
 *
 * Same `size` / `color` / `strokeWidth` / `aria-label` / `aria-hidden`
 * semantics as web. `style` (RN-only) replaces `className` (web-only) on
 * the shell.
 */

import React, { memo, useEffect, useState, type ReactElement } from 'react';
import { View, type ViewStyle } from 'react-native';
import type { IconComponent, IconSize, SemanticIconName } from '@oneui/shared';
import { IconSizeValues } from '@oneui/shared';
import { useComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import {
  getIconShellAccessibilityProps,
  type IconNativeProps,
} from './interface';
import { useIconSet, getJioIconLoader } from './IconContext.native';
import { SemanticMappings } from './IconRegistry';

export { formatIconName } from './interface';
export type { IconNativeProps as IconProps, IconNativeProps } from './interface';

const DEFAULT_ICON_SIZE: IconSize = 'md';

const loadedIconsCache: Record<string, IconComponent> = {};
const pendingIconLoads: Record<string, Promise<IconComponent | null>> = {};

function resolveIconPixelSize(
  size: IconSize | number | undefined,
  slotPx: number | undefined,
  contextDefaultSize: IconSize,
): number {
  if (typeof size === 'number') return size;
  if (size !== undefined) return IconSizeValues[size];
  if (slotPx !== undefined) return slotPx;
  return IconSizeValues[contextDefaultSize ?? DEFAULT_ICON_SIZE];
}

function renderIconGlyph(
  Component: IconComponent,
  pixelSize: number,
  color?: string,
  strokeWidth?: number,
): ReactElement {
  const tint = color ?? 'currentColor';
  // Mirror web's `.root > * { width: 100%; height: 100% }` — glyph fills
  // the shell View rather than receiving an explicit pixel size, so artwork
  // with optical padding (viewBox path not touching edges) scales correctly.
  return (
    <View style={{ width: pixelSize, height: pixelSize }}>
      <Component
        size={pixelSize}
        width='100%'
        height='100%'
        color={tint}
        fill={tint}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

interface IconShellProps {
  Component: IconComponent;
  pixelSize: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
  ariaLabel?: string;
  ariaHidden?: boolean;
  catalogIconName?: string;
  semanticName?: string;
}

function IconShell({
  Component,
  pixelSize,
  color,
  strokeWidth,
  style,
  ariaLabel,
  ariaHidden,
  catalogIconName,
  semanticName,
}: IconShellProps): ReactElement {
  const a11y = getIconShellAccessibilityProps({
    ariaLabel,
    ariaHidden,
    catalogIconName,
    semanticName,
  });
  return (
    <View {...a11y} style={[{ width: pixelSize, height: pixelSize }, style]}>
      <View accessible={false} importantForAccessibility='no-hide-descendants'>
        {renderIconGlyph(Component, pixelSize, color, strokeWidth)}
      </View>
    </View>
  );
}

interface LazyIconProps {
  iconSet: string;
  iconName: string;
  semanticName?: SemanticIconName;
  pixelSize: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

function LazyIcon({
  iconSet,
  iconName,
  semanticName,
  pixelSize,
  color,
  strokeWidth,
  style,
  ariaLabel,
  ariaHidden,
}: LazyIconProps): ReactElement {
  const cacheKey = `${iconSet}:${iconName}`;

  const [Component, setComponent] = useState<IconComponent | null>(
    () => loadedIconsCache[cacheKey] || null,
  );
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (loadedIconsCache[cacheKey]) {
      setComponent(() => loadedIconsCache[cacheKey]);
      return;
    }

    let mounted = true;

    async function loadIcon() {
      try {
        if (!pendingIconLoads[cacheKey]) {
          pendingIconLoads[cacheKey] = (async () => {
            if (iconSet === 'jio') {
              const loader = getJioIconLoader();
              if (loader) {
                const jioIcon = await loader(iconName);
                if (jioIcon) {
                  loadedIconsCache[cacheKey] = jioIcon;
                  return jioIcon;
                }
              } else if (mounted && retryCount < 3) {
                // Loader not yet registered — schedule retry (matches web).
                setTimeout(() => {
                  if (mounted) {
                    setRetryCount((c) => c + 1);
                  }
                }, 100);
              }
              return null;
            }

            // Non-Jio sets are not auto-imported on native. The host app
            // must register a loader (or pass `icon={Component}` directly).
            return null;
          })();
        }

        const icon = await pendingIconLoads[cacheKey];
        delete pendingIconLoads[cacheKey];

        if (mounted && icon) {
          setComponent(() => icon);
        } else if (mounted && iconSet !== 'jio') {
          setError(true);
        }
      } catch {
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
  }, [iconSet, iconName, cacheKey, retryCount]);

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `Native Icon: missing icon "${iconName}" in set "${iconSet}". Register a loader via setJioIconLoader or pass icon={Component}.`,
      );
    }
    // Reserve the same box so layout doesn't shift when the icon is missing.
    return <View style={[{ width: pixelSize, height: pixelSize }, style]} />;
  }

  if (!Component) {
    return <View style={[{ width: pixelSize, height: pixelSize }, style]} />;
  }

  return (
    <IconShell
      Component={Component}
      pixelSize={pixelSize}
      color={color}
      strokeWidth={strokeWidth}
      style={style}
      ariaLabel={ariaLabel}
      ariaHidden={ariaHidden}
      catalogIconName={iconName}
      semanticName={semanticName}
    />
  );
}

export const Icon = memo(function Icon({
  icon: DirectIcon,
  name,
  size,
  color,
  strokeWidth,
  style: shellStyle,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: IconNativeProps): ReactElement | null {
  const slot = useComponentSlotIconContext();
  const { iconSet, defaultSize, strokeWidth: contextStrokeWidth } =
    useIconSet();

  const pixelSize = resolveIconPixelSize(size, slot?.sizePx, defaultSize);
  const tint = color ?? slot?.color;
  const effectiveStrokeWidth = strokeWidth ?? contextStrokeWidth;

  // 1. Direct component path (JDS / RN SVG / lucide-react-native / custom).
  if (typeof DirectIcon === 'function') {
    return (
      <IconShell
        Component={DirectIcon}
        pixelSize={pixelSize}
        color={tint}
        strokeWidth={effectiveStrokeWidth}
        style={shellStyle}
        ariaLabel={ariaLabel}
        ariaHidden={ariaHidden}
      />
    );
  }

  // 2. Semantic-name path — resolve via IconContext + registered loader.
  // Accepts both the legacy `name` prop and string values passed via `icon`.
  const iconStringName: SemanticIconName | string | undefined =
    typeof DirectIcon === 'string' ? DirectIcon : name;
  if (iconStringName) {
    const resolvedName =
      SemanticMappings[iconSet]?.[iconStringName as SemanticIconName] ?? iconStringName;

    return (
      <LazyIcon
        iconSet={iconSet}
        iconName={resolvedName}
        semanticName={iconStringName as SemanticIconName}
        pixelSize={pixelSize}
        color={tint}
        strokeWidth={effectiveStrokeWidth}
        style={shellStyle}
        ariaLabel={ariaLabel}
        ariaHidden={ariaHidden}
      />
    );
  }

  return null;
});

Icon.displayName = 'Icon';

export default Icon;
