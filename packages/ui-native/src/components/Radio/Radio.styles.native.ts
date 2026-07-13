/**
 * Radio.styles.native.ts
 *
 * Static layout for the standalone `Radio` leaf. Mirrors `Radio.module.css`:
 *   - Per-size box / dot dimensions from `tokens.spacing` (50% box→dot ratio).
 *   - Disabled opacity from a single shared constant.
 *
 * Multi-option layout (orientation, spacing between Radios) lives in
 * `RadioField.styles.native.ts` — Radio itself ships geometry for one option.
 *
 * Geometry only — every colour comes from theme tokens at render time
 * (`useSurfaceTokens`). Token-only — verified by `pnpm check:literals`.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export type RadioSizeKey = 's' | 'm' | 'l';

export const RADIO_DISABLED_OPACITY = 0.5;
/** Box border width — mirrors `--Stroke-M`. */
export const RADIO_STROKE_M_WIDTH = tokens.borderWidth.hairline;

/** S: box=Spacing-4 (16), M: Spacing-5 (20), L: Spacing-6 (24). */
export const RADIO_BOX_SIZE: Record<RadioSizeKey, number> = {
  s: tokens.spacing['4'],
  m: tokens.spacing['5'],
  l: tokens.spacing['6'],
};

/** S: dot=Spacing-2 (8), M: Spacing-2-5 (10), L: Spacing-3 (12) — 50% of box. */
export const RADIO_DOT_SIZE: Record<RadioSizeKey, number> = {
  s: tokens.spacing['2'],
  m: tokens.spacing['2-5'],
  l: tokens.spacing['3'],
};

/** Body size token used for the inline option label. */
export const RADIO_LABEL_BODY_SIZE: Record<RadioSizeKey, 'S' | 'M' | 'L'> = {
  s: 'S',
  m: 'M',
  l: 'L',
};

/** Description always renders one tier smaller than the label, mirroring Input. */
export const RADIO_DESCRIPTION_BODY_SIZE = 'S' as const;

export const styles = StyleSheet.create({
  // ─── Per-Radio wrapper ───────────────────────────────────────────────────
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
  },
  besideColumn: {
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    gap: tokens.spacing['1'],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
    width: '100%',
  },
  labelTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['0-5'],
    flex: 1,
    minWidth: 0,
  },
  labelTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
  },

  // ─── Box + indicator ─────────────────────────────────────────────────────
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
