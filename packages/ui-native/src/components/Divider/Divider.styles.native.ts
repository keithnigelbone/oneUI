/**
 * Divider.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Divider/Divider.module.css`.
 *
 * Mapping ↔ Divider.module.css:
 *   .simple / .withContent      →  styles.containerHorizontal / containerVertical
 *   [data-size='s'|'m'|'l']     →  STROKE_FOR_SIZE table (matches --Stroke-S/M/L)
 *   .line                        →  styles.lineHorizontal{S,M,L} / lineVertical{...}
 *   .content                     →  styles.label (font / weight from useTypographyTokens)
 *   gap: var(--Spacing-3-5)        →  tokens.spacing['3-5'] (matches f-1 = 14)
 *
 * Stroke widths follow web's `--Stroke-S/M/L` exactly: 0.5 / 1 / 1.5. The
 * 0.5 and 1.5 values aren't in `tokens.borderWidth` (which only ships
 * hairline=1 and thin=2) so they're INTENTIONAL-LITERAL — they mirror web
 * `--Stroke-S` and `--Stroke-L` which themselves are primitive values.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { DividerSize } from './interface';

// INTENTIONAL-LITERAL: matches web's primitive `--Stroke-S` and `--Stroke-L`
// values (0.5px / 1.5px) which themselves have no semantic token chain.
const STROKE_S = 0.5;
const STROKE_M = tokens.borderWidth.hairline; // 1
const STROKE_L = 1.5;

export const STROKE_FOR_SIZE: Record<DividerSize, number> = {
  s: STROKE_S,
  m: STROKE_M,
  l: STROKE_L,
};

/** Divider icon slot — web's `--Divider-iconSize, var(--Spacing-4)`. */
export const CONTENT_ICON_SIZE = tokens.spacing['4'];

export const styles = StyleSheet.create({
  // .simple[data-orientation='horizontal'] / vertical line — full-width / full-height
  // band at the per-size stroke width.
  lineHorizontalS: { width: '100%', height: STROKE_S },
  lineHorizontalM: { width: '100%', height: STROKE_M },
  lineHorizontalL: { width: '100%', height: STROKE_L },
  lineVerticalS: { width: STROKE_S, alignSelf: 'stretch', height: '100%' },
  lineVerticalM: { width: STROKE_M, alignSelf: 'stretch', height: '100%' },
  lineVerticalL: { width: STROKE_L, alignSelf: 'stretch', height: '100%' },

  // Content variant — flex segments flanking the slot. Web uses
  // `.line { flex: 1 1 0 }`; flex weight is set at render to honour
  // `contentAlign` (center / start / end).
  segmentHorizontalS: { height: STROKE_S },
  segmentHorizontalM: { height: STROKE_M },
  segmentHorizontalL: { height: STROKE_L },
  segmentVerticalS: { width: STROKE_S },
  segmentVerticalM: { width: STROKE_M },
  segmentVerticalL: { width: STROKE_L },

  // .withContent[data-orientation='horizontal' | 'vertical']
  // — gap: var(--Spacing-3-5) maps to tokens.spacing['3-5'] = f-1 = 14, matching web.
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['2'],
    width: '100%',
  },
  containerVertical: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing['2'],
    alignSelf: 'stretch',
  },

  // .line { flex: 1 1 0 }
  lineFlex: { flex: 1 },

  // .content
  content: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: { textAlign: 'center' },
  // Icon slot — web: width/height var(--Spacing-4)
  contentSlot: {
    width: CONTENT_ICON_SIZE,
    height: CONTENT_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const LINE_STYLE = {
  horizontal: {
    s: styles.lineHorizontalS,
    m: styles.lineHorizontalM,
    l: styles.lineHorizontalL,
  },
  vertical: {
    s: styles.lineVerticalS,
    m: styles.lineVerticalM,
    l: styles.lineVerticalL,
  },
} as const;

export const SEGMENT_STYLE = {
  horizontal: {
    s: styles.segmentHorizontalS,
    m: styles.segmentHorizontalM,
    l: styles.segmentHorizontalL,
  },
  vertical: {
    s: styles.segmentVerticalS,
    m: styles.segmentVerticalM,
    l: styles.segmentVerticalL,
  },
} as const;
