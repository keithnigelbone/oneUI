/**
 * Spinner.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Spinner/Spinner.module.css`.
 *
 * Per-size diameter follows web's `--Spacing-*` chain (Spinner size names ≠ spacing keys):
 *   2XS→Spacing-2 … 5XL→Spacing-16
 *
 * Web draws three role-coloured arcs (Tertiary / Secondary / Primary) via SVG.
 * Native currently renders a single arc from `primary.content.tintedA11y` —
 * three-arc rendering would need an SVG port; tracked as a follow-up.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { SpinnerSize } from './interface';

export const SIZE_PX: Record<SpinnerSize, number> = {
  '2XS': tokens.spacing['2'],
  XS:    tokens.spacing['3'],
  S:     tokens.spacing['4'],
  M:     tokens.spacing['5'],
  L:     tokens.spacing['6'],
  XL:    tokens.spacing['8'],
  '2XL': tokens.spacing['10'],
  '3XL': tokens.spacing['12'],
  '4XL': tokens.spacing['14'],
  '5XL': tokens.spacing['16'],
};

export const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  outer2XS: { width: SIZE_PX['2XS'], height: SIZE_PX['2XS'] },
  outerXS:  { width: SIZE_PX.XS,     height: SIZE_PX.XS },
  outerS:   { width: SIZE_PX.S,      height: SIZE_PX.S },
  outerM:   { width: SIZE_PX.M,      height: SIZE_PX.M },
  outerL:   { width: SIZE_PX.L,      height: SIZE_PX.L },
  outerXL:  { width: SIZE_PX.XL,     height: SIZE_PX.XL },
  outer2XL: { width: SIZE_PX['2XL'], height: SIZE_PX['2XL'] },
  outer3XL: { width: SIZE_PX['3XL'], height: SIZE_PX['3XL'] },
  outer4XL: { width: SIZE_PX['4XL'], height: SIZE_PX['4XL'] },
  outer5XL: { width: SIZE_PX['5XL'], height: SIZE_PX['5XL'] },
});

export const OUTER_STYLE = {
  '2XS': styles.outer2XS,
  XS:    styles.outerXS,
  S:     styles.outerS,
  M:     styles.outerM,
  L:     styles.outerL,
  XL:    styles.outerXL,
  '2XL': styles.outer2XL,
  '3XL': styles.outer3XL,
  '4XL': styles.outer4XL,
  '5XL': styles.outer5XL,
} as const;

// Rotation duration now lives in `theme/MotionContext.tsx#DEFAULT_MOTION.spinner.rotationMs`
// and is consumed at render via `useMotion()`. Override per-brand via
// `<OneUINativeThemeProvider motionOverrides={{ spinner: { rotationMs: 2000 } }}>`.
