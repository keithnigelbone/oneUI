/**
 * avatarLayout.ts
 *
 * Resolves Avatar geometry from `OneUINativeTheme.spacing` so sizes track
 * platform + density the same way `Avatar.module.css` does via Spacing-* tokens.
 */

import type { NativeSpacing } from '@oneui/shared/engine';

export type AvatarCanonicalSize = '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl';

const CONTAINER_KEY: Record<AvatarCanonicalSize, keyof NativeSpacing> = {
  '2xs': '2',
  xs: '3',
  s: '4',
  m: '5',
  l: '6',
  xl: '8',
  '2xl': '10',
};

const ICON_KEY: Record<Exclude<AvatarCanonicalSize, '2xs'>, keyof NativeSpacing> = {
  xs: '2-5',
  s: '3',
  m: '4',
  l: '5',
  xl: '6',
  '2xl': '8',
};

/** Container side — mirrors `[data-size]` width/height in Avatar.module.css. */
export function getAvatarContainerSide(
  spacing: NativeSpacing,
  resolvedSize: string,
  customSize?: number,
): number {
  if (resolvedSize === 'custom') {
    return customSize ?? spacing['10'];
  }
  const key = CONTAINER_KEY[resolvedSize as AvatarCanonicalSize];
  return key ? spacing[key] : spacing['10'];
}

/** Inner icon SVG box — mirrors `.icon svg` rules per `data-size`. */
export function getAvatarIconSide(
  spacing: NativeSpacing,
  resolvedSize: string,
  containerSide: number,
  customSize?: number,
): number {
  if (resolvedSize === 'custom' && customSize != null) {
    return Math.round(customSize * (2 / 3));
  }
  if (resolvedSize === '2xs') {
    return containerSide;
  }
  const key = ICON_KEY[resolvedSize as Exclude<AvatarCanonicalSize, '2xs'>];
  return key ? spacing[key] : spacing['8'];
}

export function getAvatarIconSlotMetrics(
  resolvedSize: string,
  iconSide: number,
): { width: number | '100%'; height: number | '100%'; flex?: number } {
  if (resolvedSize === '2xs') {
    return { width: '100%', height: '100%', flex: 1 };
  }
  return { width: iconSide, height: iconSide };
}
