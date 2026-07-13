/**
 * IndicatorBadge.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/IndicatorBadge/IndicatorBadge.module.css`.
 *
 * Mapping ↔ IndicatorBadge.module.css:
 *   .badge                     →  styles base (size + borderRadius per size)
 *   .badge[data-size='xs'…'xl'] →  styles.xs / s / m / l / xl
 *   --_idb-bold = Primary.Bold →  inline at render via useSurfaceTokens(role).surfaces.bold
 *
 * Per-size dimensions follow web's `Spacing-1-5 / 2 / 2-5 / 3 / 3-5` chain.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { IndicatorBadgeSize } from './interface';

const SIZE_XS = tokens.spacing['1'];
const SIZE_S = tokens.spacing['1-5'];
const SIZE_M = tokens.spacing['2'];
const SIZE_L = tokens.spacing['3'];
const SIZE_XL = tokens.spacing['4'];

export const SIZE_PX: Record<IndicatorBadgeSize, number> = {
  xs: SIZE_XS,
  s: SIZE_S,
  m: SIZE_M,
  l: SIZE_L,
  xl: SIZE_XL,
};

export const styles = StyleSheet.create({
  xs: { width: SIZE_XS, height: SIZE_XS, borderRadius: SIZE_XS / 2 },
  s: { width: SIZE_S, height: SIZE_S, borderRadius: SIZE_S / 2 },
  m: { width: SIZE_M, height: SIZE_M, borderRadius: SIZE_M / 2 },
  l: { width: SIZE_L, height: SIZE_L, borderRadius: SIZE_L / 2 },
  xl: { width: SIZE_XL, height: SIZE_XL, borderRadius: SIZE_XL / 2 },
});
