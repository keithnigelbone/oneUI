/**
 * InputFeedback.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Input/internals/InputFeedback.module.css`.
 *
 * Geometry only — fills (`--_fb-bold`, `--_fb-subtle`), text colour, and
 * icon paint flow inline through `useSurfaceTokens` in `InputFeedback.native.tsx`.
 * Padding / radius / gap / icon size scale with `data-size` on web; the same
 * tables are exposed here keyed by the public t-shirt size (`s` / `m` / `l`).
 *
 * Verified by: `pnpm check:literals`.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { DesignIconSize } from '../Icon/interface';
import type { InputFeedbackSize } from './interface';

/**
 * Padding map for medium / high attention (low attention has zero padding).
 * Web emits `padding: Spacing-1 Spacing-1-5 Spacing-1 Spacing-1` etc. — the
 * RN equivalent collapses to top/bottom + start/end pairs.
 */
const PADDING_FILLED: Record<
  InputFeedbackSize,
  { paddingVertical: number; paddingLeft: number; paddingRight: number }
> = {
  s: {
    paddingVertical: tokens.spacing['1'],
    paddingLeft: tokens.spacing['1'],
    paddingRight: tokens.spacing['1-5'],
  },
  m: {
    paddingVertical: tokens.spacing['1-5'],
    paddingLeft: tokens.spacing['1-5'],
    paddingRight: tokens.spacing['2'],
  },
  l: {
    paddingVertical: tokens.spacing['2'],
    paddingLeft: tokens.spacing['2'],
    paddingRight: tokens.spacing['3'],
  },
};

/** Border-radius per size — derived from Spacing f-steps (matches web Shape-1-5 / 2 / 2-5). */
const RADIUS: Record<InputFeedbackSize, number> = {
  s: tokens.spacing['1-5'],
  m: tokens.spacing['2'],
  l: tokens.spacing['2-5'],
};

/** Icon pixel size per feedback size — matches web `FEEDBACK_TO_ICON_SIZE`. */
export const FEEDBACK_TO_ICON_SIZE: Record<InputFeedbackSize, DesignIconSize> = {
  s: '3',
  m: '4',
  l: '5',
};

export const styles = StyleSheet.create({
  // Layout — flex row with vertical center and a 1-step gap (web `gap: Spacing-1`).
  rowBase: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: tokens.spacing['1'],
  },

  // Attention = low: no padding, no fill. Icon + text only.
  attentionLow: {
    paddingVertical: tokens.spacing['0'],
    paddingHorizontal: tokens.spacing['0'],
  },

  // Per-size padding (used for medium + high attention).
  paddingFilledS: PADDING_FILLED.s,
  paddingFilledM: PADDING_FILLED.m,
  paddingFilledL: PADDING_FILLED.l,

  // Per-size radius (applied for medium + high attention; low keeps the row flat).
  radiusS: { borderRadius: RADIUS.s },
  radiusM: { borderRadius: RADIUS.m },
  radiusL: { borderRadius: RADIUS.l },

  // Icon slot — shrink-fit aligned with text baseline.
  iconSlot: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Message column — grows to fill remaining horizontal space, wraps cleanly.
  messageColumn: {
    flexShrink: 1,
    flexGrow: 1,
  },
});

export const PADDING_FILLED_STYLE: Record<InputFeedbackSize, (typeof styles)['paddingFilledM']> = {
  s: styles.paddingFilledS,
  m: styles.paddingFilledM,
  l: styles.paddingFilledL,
};

export const RADIUS_STYLE: Record<InputFeedbackSize, (typeof styles)['radiusM']> = {
  s: styles.radiusS,
  m: styles.radiusM,
  l: styles.radiusL,
};
