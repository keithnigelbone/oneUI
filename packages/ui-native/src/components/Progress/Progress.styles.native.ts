/**
 * Progress.styles.native.ts
 *
 * RN peer of layout tokens in `packages/ui/src/components/Progress/Progress.module.css`.
 * Track height per size, pill radius, overflow — static only; brand paint stays inline.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { ProgressSize } from './interface';

/** Per-size track height — mirrors Progress.module.css Spacing chain. */
export const TRACK_HEIGHT: Record<ProgressSize, number> = {
  small: tokens.spacing['1-5'],
  medium: tokens.spacing['2-5'],
  large: tokens.spacing['3-5'],
};

// INTENTIONAL-LITERAL: indeterminate bar covers ~40% of the track at any
// moment — matches web's `--Progress-Indeterminate-Width, 40%` default.
export const INDETERMINATE_WIDTH_RATIO = 0.4;

export const styles = StyleSheet.create({
  track: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: tokens.shape.Pill,
    width: '100%',
  },
  small: { height: TRACK_HEIGHT.small },
  medium: { height: TRACK_HEIGHT.medium },
  large: { height: TRACK_HEIGHT.large },
  indicator: {
    height: '100%',
    borderRadius: tokens.shape.Pill,
  },
});

export const SIZE_STYLE = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
} as const;
