/**
 * Shared token-resolved layout style builder for native layout primitives
 * (`Container`, `Surface`). Spacing props accept a spacing TOKEN and are resolved
 * to px via the runtime `NativeSpacing` record, so consuming/generated screens
 * stay token-only (no literal px).
 *
 * A spacing token may be given as:
 *   - a canonical `NativeSpacingKey`  — e.g. `'6'`, `'2-5'`, `'Margin'`
 *   - a Figma dimension-scale path    — e.g. `'dimensions/spacings/6'`,
 *                                         `'dimensions/grid/margin'`, `'dimensions/grid/gutter'`
 *   - the CSS-style alias             — e.g. `'Spacing-6'`
 * All forms normalise to a `NativeSpacingKey` before lookup (see `resolveSpacingPx`).
 *
 * Mirrors the established scalar token-resolution pattern
 * (`resolveShapeBorderRadius` → `theme.shape[key]`).
 */

import type { FlexAlignType, ViewStyle } from 'react-native';
import type { NativeSpacing } from '@oneui/shared/engine';
import type { NativeSpacingKey } from './spacingKeys';

/**
 * A spacing token value. Accepts the canonical key, a Figma `dimensions/...`
 * path, or a `Spacing-*` alias. The `(string & {})` keeps key autocomplete while
 * still allowing arbitrary token strings.
 */
export type SpacingValue = NativeSpacingKey | (string & {});

/** Flex main-axis direction. */
export type LayoutDirection = 'row' | 'column';
/** Cross-axis alignment (maps to `alignItems`). */
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
/** Main-axis distribution (maps to `justifyContent`). */
export type LayoutJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/** Token-resolved layout props shared by Container and Surface. */
export interface LayoutSpacingProps {
  direction?: LayoutDirection;
  gap?: SpacingValue;
  padding?: SpacingValue;
  paddingX?: SpacingValue;
  paddingY?: SpacingValue;
  paddingTop?: SpacingValue;
  paddingRight?: SpacingValue;
  paddingBottom?: SpacingValue;
  paddingLeft?: SpacingValue;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  wrap?: boolean;
  flex?: number;
}

/**
 * Normalise a spacing token to a `NativeSpacingKey` and resolve it to px against
 * the runtime spacing record. Handles canonical keys, Figma `dimensions/...`
 * paths, and `Spacing-*` aliases. Returns `undefined` when unresolvable.
 */
export function resolveSpacingPx(
  value: SpacingValue | undefined,
  spacing: NativeSpacing | null | undefined,
): number | undefined {
  if (value == null || !spacing) return undefined;
  const rec = spacing as unknown as Record<string, number>;
  // Direct canonical key (fast path).
  if (value in rec) return rec[value];
  let key = String(value).trim();
  const lower = key.toLowerCase();
  if (key.includes('/')) {
    // Figma dimension-scale path: dimensions/spacings/6, dimensions/grid/margin…
    if (lower.includes('margin')) key = 'Margin';
    else if (lower.includes('gutter')) key = 'Gutter';
    else key = key.split('/').pop()!.trim();
  } else if (key.startsWith('Spacing-')) {
    key = key.slice('Spacing-'.length);
  } else if (lower === 'margin') key = 'Margin';
  else if (lower === 'gutter') key = 'Gutter';
  return key in rec ? rec[key] : undefined;
}

const ALIGN_MAP: Record<LayoutAlign, FlexAlignType> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<LayoutJustify, NonNullable<ViewStyle['justifyContent']>> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/**
 * Build a `ViewStyle` from token-resolved layout props. `spacing` is the runtime
 * `NativeSpacing` record (from `useOneUITheme().spacing`); pass `null` to skip
 * spacing resolution (e.g. outside a theme provider) — flex props still apply.
 */
export function resolveLayoutStyle(
  props: LayoutSpacingProps,
  spacing: NativeSpacing | null | undefined,
): ViewStyle {
  const sp = (value: SpacingValue | undefined): number | undefined => resolveSpacingPx(value, spacing);

  const out: ViewStyle = {};
  if (props.direction) out.flexDirection = props.direction;
  if (props.flex != null) out.flex = props.flex;
  if (props.wrap) out.flexWrap = 'wrap';
  if (props.align) out.alignItems = ALIGN_MAP[props.align];
  if (props.justify) out.justifyContent = JUSTIFY_MAP[props.justify];

  const gapPx = sp(props.gap);
  if (gapPx != null) out.gap = gapPx;

  // Edge props win over axis props, which win over uniform `padding`.
  const padAll = sp(props.padding);
  const padX = sp(props.paddingX);
  const padY = sp(props.paddingY);
  const padTop = sp(props.paddingTop) ?? padY ?? padAll;
  const padBottom = sp(props.paddingBottom) ?? padY ?? padAll;
  const padLeft = sp(props.paddingLeft) ?? padX ?? padAll;
  const padRight = sp(props.paddingRight) ?? padX ?? padAll;
  if (padTop != null) out.paddingTop = padTop;
  if (padBottom != null) out.paddingBottom = padBottom;
  if (padLeft != null) out.paddingLeft = padLeft;
  if (padRight != null) out.paddingRight = padRight;

  return out;
}
