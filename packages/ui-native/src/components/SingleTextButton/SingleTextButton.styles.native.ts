/**
 * SingleTextButton.styles.native.ts — structural StyleSheet + per-size geometry.
 *
 * Native peer of `SingleTextButton.module.css`. Colour/paint is resolved at
 * runtime in `SingleTextButton.native.tsx` via `useSurfaceTokens`; this file
 * carries only geometry (min size, padding) keyed by the size union.
 *
 * Verified by: pnpm check:literals
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { SingleTextButtonSize } from './interface';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Circular by default — square box (min w === min h) + pill radius. */
  circular: {
    aspectRatio: 1,
    borderRadius: tokens.shape.Pill,
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  label: {
    textAlign: 'center',
  },
  spinnerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** Per-size geometry — mirrors `[data-size]` rules in the web module. */
export const CONTAINER: Record<SingleTextButtonSize, ViewStyle> = {
  s: {
    minHeight: tokens.spacing['8'],
    minWidth: tokens.spacing['8'],
    paddingVertical: tokens.spacing['0-5'],
  },
  m: {
    minHeight: tokens.spacing['10'],
    minWidth: tokens.spacing['10'],
    paddingVertical: tokens.spacing['1'],
  },
  l: {
    minHeight: tokens.spacing['12'],
    minWidth: tokens.spacing['12'],
    paddingVertical: tokens.spacing['2'],
  },
};

/** Condensed geometry — reduced height/padding, same typography. */
export const CONTAINER_CONDENSED: Record<SingleTextButtonSize, ViewStyle> = {
  s: {
    minHeight: tokens.spacing['4-5'],
    minWidth: tokens.spacing['4-5'],
    paddingVertical: tokens.spacing['0-5'],
  },
  m: {
    minHeight: tokens.spacing['6'],
    minWidth: tokens.spacing['6'],
    paddingVertical: tokens.spacing['0-5'],
  },
  l: {
    minHeight: tokens.spacing['8'],
    minWidth: tokens.spacing['8'],
    paddingVertical: tokens.spacing['0-5'],
  },
};

/** Map button size → Label typography size (web `var(--Label-{Size}-FontSize)`). */
export const SIZE_TO_LABEL = {
  s: 'S',
  m: 'M',
  l: 'L',
} as const;

// INTENTIONAL-LITERAL: matches SingleTextButton.module.css default
// (--Disabled-Opacity). Loading is a busy state and renders at full opacity —
// no loading-specific dimming (native divergence from the web --Loading-Opacity).
export const DISABLED_OPACITY = 0.5;

// INTENTIONAL-LITERAL: spinner SVG spec — same viewBox geometry as the web
// CircularProgressIndicator arc reproduced in `SingleTextButton.native.tsx`.
export const SPINNER_VIEWBOX = 16;
export const SPINNER_RADIUS = 6.5;
export const SPINNER_STROKE_WIDTH = 1.5;
export const SPINNER_DASH_VISIBLE = 30.63;
export const SPINNER_DASH_GAP = 10.21;
