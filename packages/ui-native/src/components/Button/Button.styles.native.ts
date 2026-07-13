/**
 * Button.styles.native.ts — structural StyleSheet + shared constants.
 * Per-size geometry: `buttonLayout.ts` + `OneUINativeTheme.spacing`.
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens, touchTarget } from '@oneui/tokens';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: touchTarget.min,
  },
  containerFullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  pill: { borderRadius: tokens.shape.Pill },
  labelAlign: { textAlign: 'center' },
});

/**
 * Map Button numeric size → Label typography size key (web
 * `var(--Label-{Size}-FontSize)`).
 */
export const SIZE_TO_LABEL = {
  6: 'XS',
  8: 'S',
  10: 'M',
  12: 'L',
} as const;

// INTENTIONAL-LITERAL: matches Button.module.css defaults. Only `disabled`
// dims — `loading` is a busy state and renders at full opacity.
export const DISABLED_OPACITY = 0.5;

// INTENTIONAL-LITERAL: spinner SVG spec (matches web inline circle).
export const SPINNER_VIEWBOX = 16;
export const SPINNER_RADIUS = 6.5;
export const SPINNER_STROKE_WIDTH = 1.5;
export const SPINNER_DASH_VISIBLE = 30.63;
export const SPINNER_DASH_GAP = 10.21;

/** Ghost ornament stroke width — web `--Stroke-M` default (1px). */
export const GHOST_ORNAMENT_STROKE_WIDTH = 1;

export const ornamentStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  } as ViewStyle,
});
