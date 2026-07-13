/**
 * CounterBadge.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/CounterBadge/CounterBadge.module.css`.
 *
 * Mapping ↔ CounterBadge.module.css:
 *   .badge                       →  styles.containerBase + CONTAINER[size]
 *   .badge[data-size='xs'…'l']   →  styles.containerXS / S / M / L
 *   font-size / line-height      →  useTypographyTokens('label', SIZE_TO_LABEL[size],
 *                                  { emphasis: 'medium', lineHeightMultiplier: 1 })
 *                                  — tight pill: `ceil(fontSize × 1)`; Badge labels use × 1.25 default.
 *
 * Per-size dimensions follow web's `--Spacing-*` / `--Label-*` chains:
 *   height:  Spacing-3 / 3-5 / 4 / 5
 *   padH:    Spacing-0-5
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { CounterBadgeSize } from './interface';

const HEIGHT = {
  xs: tokens.spacing['2'],
  s: tokens.spacing['3'],
  m: tokens.spacing['4'],
  l: tokens.spacing['5'],
} as const;

const PAD_H = tokens.spacing['0-5'];

/** Map CounterBadge size → Label typography size key. */
export const SIZE_TO_LABEL: Record<CounterBadgeSize, '3XS' | '2XS' | 'XS'> = {
  xs: '3XS',
  s: '3XS',
  m: '2XS',
  l: 'XS',
};

export const styles = StyleSheet.create({
  containerBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  containerXS: {
    height: HEIGHT.xs,
    minWidth: HEIGHT.xs,
    paddingHorizontal: PAD_H,
    borderRadius: tokens.shape.Pill,
  },
  containerS: {
    height: HEIGHT.s,
    minWidth: HEIGHT.s,
    paddingHorizontal: PAD_H,
    borderRadius: tokens.shape.Pill,
  },
  containerM: {
    height: HEIGHT.m,
    minWidth: HEIGHT.m,
    paddingHorizontal: PAD_H,
    borderRadius: tokens.shape.Pill,
  },
  containerL: {
    height: HEIGHT.l,
    minWidth: HEIGHT.l,
    paddingHorizontal: PAD_H,
    borderRadius: tokens.shape.Pill,
  },
  labelBase: { textAlign: 'center' },
});

export const CONTAINER = {
  xs: styles.containerXS,
  s: styles.containerS,
  m: styles.containerM,
  l: styles.containerL,
} as const;
