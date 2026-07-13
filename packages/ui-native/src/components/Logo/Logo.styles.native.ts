/**
 * Logo.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Logo/Logo.module.css`.
 *
 * Transparent size container only — no fill, radius, or shape (SVG owns visuals).
 * Per-size dimensions: Spacing-3 / 4 / 5 / 6 / 8 (xs … xl).
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { LogoSize } from './interface';

// INTENTIONAL-LITERAL: matches Image pressed overlay (`--Image-pressedOpacity` fallback).
export const DISABLED_OPACITY = 0.5;
export const PRESSED_OPACITY = 0.85;

export const SIZE_PX: Record<Exclude<LogoSize, 'custom'>, number> = {
  xs: tokens.spacing['3'],
  s:  tokens.spacing['4'],
  m:  tokens.spacing['5'],
  l:  tokens.spacing['6'],
  xl: tokens.spacing['8'],
};

function isValidLogoCustomSize(customSize?: number): customSize is number {
  return typeof customSize === 'number' && Number.isFinite(customSize) && customSize > 0;
}

function warnInvalidLogoCustomConfig(customSize?: number): void {
  if (process.env.NODE_ENV === 'production') return;
  if (customSize == null) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Logo] size="custom" requires a positive `customSize` (pixels). Falling back to size "m".',
    );
    return;
  }
  // eslint-disable-next-line no-console
  console.warn(
    `[Logo] customSize must be a positive finite number. Received ${String(customSize)}. Falling back to size "m".`,
  );
}

/**
 * Resolves the logo box side length in density-aware px.
 * When `size` is `'custom'`, `customSize` must be a positive finite number;
 * invalid configs warn in development and fall back to `'m'`.
 */
export function resolveSize(size: LogoSize, customSize?: number): number {
  if (size === 'custom') {
    if (isValidLogoCustomSize(customSize)) return customSize;
    warnInvalidLogoCustomConfig(customSize);
    return SIZE_PX.m;
  }
  return SIZE_PX[size];
}

export const styles = StyleSheet.create({
  // .root — inline-flex peer; color set inline from --Logo-color / --Primary-Bold
  base: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  // .root[data-variant='full'] — height from size, width from content
  full: {
    alignSelf: 'flex-start',
  },
  // .mark — fills the size box; SVG/image scale to 100%
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  markFull: {
    width: undefined,
    height: '100%',
  },
  image: { width: '100%', height: '100%' },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  pressed: { opacity: PRESSED_OPACITY },
});
