/**
 * Container.shared.ts
 *
 * Shared props and layout resolution for **web** `Container.tsx` (React).
 * React Native continues to use the narrow `ContainerProps` in
 * `packages/ui-native/.../interface.ts` until native parity is implemented.
 *
 * Spacing and size presets map to design tokens only — no raw pixel literals
 * in consumers (except the documented legacy numeric `maxWidth` cap on web).
 *
 * Omit `layout` for normal block flow; use `flex` / `grid` only when needed.
 * Per-side padding (`paddingTop` …) and flex item props (`flex`, `grow`, `shrink`,
 * `basis`, `alignSelf`) support catalogs and nested flex layouts without raw lengths.
 */

import type { CSSProperties, ElementType, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';
import type { Breakpoint } from '../Grid/responsive';

/**
 * Grid column count: a single number applied to all breakpoints, or a responsive
 * object. Container itself does NOT implement the per-breakpoint cascade — that is
 * the `Grid` component's job, and IR→AST compilation routes every column-bearing
 * layout node to `Grid`. A responsive object reaching Container is therefore a
 * hand-authored edge case; Container degrades it gracefully (see
 * `resolveGridColumnCount`) rather than silently dropping the columns.
 */
export type ContainerColumns = number | Partial<Record<Breakpoint, number | string>>;

/** Horizontal / vertical alignment (flex and grid). */
export type ContainerAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/** Main-axis distribution (flex) / alignment helpers (grid). */
export type ContainerJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch';

/** Spacing scale keys → `var(--Spacing-*)` on web, `tokens.spacing[*]` on native. */
export type ContainerSpaceKey =
  | '0'
  | '0-5'
  | '1'
  | '1-5'
  | '2'
  | '2-5'
  | '3'
  | '3-5'
  | '4'
  | '4-5'
  | '5'
  | '5-5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '12'
  | '14'
  | '16'
  | '18'
  | '20'
  | '24'
  | '28'
  | '32'
  | '40'
  | 'margin'
  | 'gutter';

/** Intrinsic / token width and height presets. */
export type ContainerSizePreset =
  | 'auto'
  | 'full'
  | 'fit'
  | 'min'
  | 'max'
  | ContainerSpaceKey;

/**
 * Root display mode. Omit for normal **block flow** (default browser layout).
 * A2UI / JSON catalogs should omit `layout` instead of sending a `"flow"` sentinel.
 */
export type ContainerLayoutMode = 'flex' | 'grid';

export type ContainerPosition = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

export type ContainerOverflow = 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto';

/** Layout variant — fluid grows with viewport, fixed caps at maxWidth, full-bleed has no margin. */
export type ContainerVariant = 'fluid' | 'fixed' | 'full-bleed';

const SIZE_PRESET_NO_CAP = new Set<string>([
  'auto',
  'full',
  'fit',
  'min',
  'max',
  '0',
  '0-5',
  '1',
  '1-5',
  '2',
  '2-5',
  '3',
  '3-5',
  '4',
  '4-5',
  '5',
  '5-5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '28',
  '32',
  '40',
  'margin',
  'gutter',
]);

/**
 * Resolves the dual `maxWidth` prop: size presets → token CSS on the element;
 * `fixed` variant + cap-like values → `--_container-max-width`; other strings
 * → raw CSS `max-width` on the element.
 */
export function resolveContainerMaxWidth(
  variant: ContainerVariant | undefined,
  maxWidth: string | number | ContainerSizePreset | undefined,
):
  | { kind: 'cap'; value: string | number }
  | { kind: 'preset'; value: ContainerSizePreset }
  | { kind: 'css'; value: string }
  | { kind: 'none' } {
  if (maxWidth == null) return { kind: 'none' };
  if (typeof maxWidth === 'string' && SIZE_PRESET_NO_CAP.has(maxWidth)) {
    return { kind: 'preset', value: maxWidth as ContainerSizePreset };
  }
  if (variant === 'fixed' && (typeof maxWidth === 'number' || typeof maxWidth === 'string')) {
    return { kind: 'cap', value: maxWidth };
  }
  if (typeof maxWidth === 'string') {
    return { kind: 'css', value: maxWidth };
  }
  return { kind: 'none' };
}

/** Maps spacing keys to `var(--Spacing-*)` for web CSS. */
export function containerSpaceVar(key: ContainerSpaceKey): string {
  if (key === 'margin') return 'var(--Spacing-Margin)';
  if (key === 'gutter') return 'var(--Spacing-Gutter)';
  return `var(--Spacing-${key})`;
}

export function containerSizeToCss(value: ContainerSizePreset | undefined): string | undefined {
  if (value == null) return undefined;
  switch (value) {
    case 'auto':
      return 'auto';
    case 'full':
      return '100%';
    case 'fit':
      return 'fit-content';
    case 'min':
      return 'min-content';
    case 'max':
      return 'max-content';
    default:
      return containerSpaceVar(value);
  }
}

function mapJustifyCss(j: ContainerJustify | undefined): CSSProperties['justifyContent'] {
  switch (j) {
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'space-around':
      return 'space-around';
    case 'space-between':
      return 'space-between';
    case 'space-evenly':
      return 'space-evenly';
    case 'stretch':
      return 'stretch';
    case 'start':
    default:
      return 'flex-start';
  }
}

function mapAlignCss(a: ContainerAlign | undefined): CSSProperties['alignItems'] {
  switch (a) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'stretch':
      return 'stretch';
    case 'baseline':
      return 'baseline';
    default:
      return 'stretch';
  }
}

function mapAlignSelfCss(a: ContainerAlign | undefined): CSSProperties['alignSelf'] {
  switch (a) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'stretch':
      return 'stretch';
    case 'baseline':
      return 'baseline';
    default:
      return 'auto';
  }
}

/** Token padding → longhand or shorthand on `style` (per-side overrides win last). */
function applyPaddingFromInput(
  style: CSSProperties,
  input: Pick<
    ContainerLayoutStyleInput,
    | 'padding'
    | 'paddingX'
    | 'paddingY'
    | 'paddingTop'
    | 'paddingRight'
    | 'paddingBottom'
    | 'paddingLeft'
  >,
): void {
  const { padding, paddingX, paddingY, paddingTop, paddingRight, paddingBottom, paddingLeft } =
    input;
  const hasAxis = paddingX != null || paddingY != null;
  const hasPerSide =
    paddingTop != null ||
    paddingRight != null ||
    paddingBottom != null ||
    paddingLeft != null;

  if (!hasAxis && !hasPerSide && padding != null) {
    style.padding = containerSpaceVar(padding);
    return;
  }

  let top: string | undefined;
  let right: string | undefined;
  let bottom: string | undefined;
  let left: string | undefined;

  if (padding != null) {
    const v = containerSpaceVar(padding);
    top = v;
    right = v;
    bottom = v;
    left = v;
  }
  if (paddingX != null) {
    const v = containerSpaceVar(paddingX);
    left = v;
    right = v;
  }
  if (paddingY != null) {
    const v = containerSpaceVar(paddingY);
    top = v;
    bottom = v;
  }
  if (paddingTop != null) top = containerSpaceVar(paddingTop);
  if (paddingRight != null) right = containerSpaceVar(paddingRight);
  if (paddingBottom != null) bottom = containerSpaceVar(paddingBottom);
  if (paddingLeft != null) left = containerSpaceVar(paddingLeft);

  if (top != null) style.paddingTop = top;
  if (right != null) style.paddingRight = right;
  if (bottom != null) style.paddingBottom = bottom;
  if (left != null) style.paddingLeft = left;
}

export interface ContainerLayoutStyleInput {
  layout?: ContainerLayoutMode;
  direction?: 'row' | 'column';
  wrap?: boolean;
  justify?: ContainerJustify;
  /** Maps to `align-items` when `layout` is `flex` or `grid`. */
  align?: ContainerAlign;
  /** When this `Container` is a flex/grid item, maps to `align-self`. */
  alignSelf?: ContainerAlign;
  columns?: ContainerColumns;
  rows?: number;
  padding?: ContainerSpaceKey;
  paddingX?: ContainerSpaceKey;
  paddingY?: ContainerSpaceKey;
  paddingTop?: ContainerSpaceKey;
  paddingRight?: ContainerSpaceKey;
  paddingBottom?: ContainerSpaceKey;
  paddingLeft?: ContainerSpaceKey;
  gap?: ContainerSpaceKey;
  rowGap?: ContainerSpaceKey;
  columnGap?: ContainerSpaceKey;
  width?: ContainerSizePreset;
  height?: ContainerSizePreset;
  minWidth?: ContainerSizePreset;
  /** CSS `max-width` on the element when not consumed as the fixed-variant cap. */
  maxWidthBox?: ContainerSizePreset;
  minHeight?: ContainerSizePreset;
  maxHeight?: ContainerSizePreset;
  position?: ContainerPosition;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  overflow?: ContainerOverflow;
  /**
   * Flex shorthand on the root (`flex`). When set, overrides `grow` / `shrink` / `basis`
   * for that axis bundle — prefer either `flex` or the longhands, not both.
   */
  flex?: number | string;
  /** `flex-grow` when `flex` is omitted. */
  grow?: number;
  /** `flex-shrink` when `flex` is omitted. */
  shrink?: number;
  /** `flex-basis` when `flex` is omitted. */
  basis?: ContainerSizePreset;
}

/**
 * Resolve a single grid column count from `ContainerColumns`. A number is used
 * directly. A responsive object is degraded to its SMALLEST declared count so the
 * grid stays mobile-safe and never collapses to a single implicit column — true
 * per-breakpoint columns belong on `Grid`, and IR→AST routes column-bearing nodes
 * there. Returns `undefined` when no usable count is present.
 */
function resolveGridColumnCount(columns: ContainerColumns | undefined): number | undefined {
  if (typeof columns === 'number') return columns > 0 ? columns : undefined;
  if (columns && typeof columns === 'object') {
    const counts = Object.values(columns)
      .map((v) => (typeof v === 'number' ? v : Number(v)))
      .filter((n) => Number.isFinite(n) && n > 0);
    return counts.length > 0 ? Math.min(...counts) : undefined;
  }
  return undefined;
}

/** Merges layout / spacing / sizing / position into inline styles (token-only lengths). */
export function buildContainerWebLayoutStyle(input: ContainerLayoutStyleInput): CSSProperties {
  const style: CSSProperties = {};
  const {
    layout,
    direction = 'row',
    wrap,
    justify,
    align,
    alignSelf,
    columns,
    rows,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    gap,
    rowGap,
    columnGap,
    width,
    height,
    minWidth,
    maxWidthBox,
    minHeight,
    maxHeight,
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    overflow,
    flex: flexShorthand,
    grow,
    shrink,
    basis,
  } = input;

  applyPaddingFromInput(style, {
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
  });

  const g = gap != null ? containerSpaceVar(gap) : undefined;
  const rg = rowGap != null ? containerSpaceVar(rowGap) : undefined;
  const cg = columnGap != null ? containerSpaceVar(columnGap) : undefined;
  if (g != null) style.gap = g;
  if (rg != null) style.rowGap = rg;
  if (cg != null) style.columnGap = cg;

  const w = containerSizeToCss(width);
  const h = containerSizeToCss(height);
  const minW = containerSizeToCss(minWidth);
  const maxW = containerSizeToCss(maxWidthBox);
  const minH = containerSizeToCss(minHeight);
  const maxH = containerSizeToCss(maxHeight);
  if (w != null) style.width = w;
  if (h != null) style.height = h;
  if (minW != null) style.minWidth = minW;
  if (maxW != null) style.maxWidth = maxW;
  if (minH != null) style.minHeight = minH;
  if (maxH != null) style.maxHeight = maxH;

  if (position != null) style.position = position;
  if (top != null) style.top = top;
  if (right != null) style.right = right;
  if (bottom != null) style.bottom = bottom;
  if (left != null) style.left = left;
  if (zIndex != null) style.zIndex = zIndex;
  if (overflow != null) style.overflow = overflow;

  if (layout === 'flex') {
    style.display = 'flex';
    style.flexDirection = direction === 'column' ? 'column' : 'row';
    if (wrap === true) style.flexWrap = 'wrap';
    if (wrap === false) style.flexWrap = 'nowrap';
    style.justifyContent = mapJustifyCss(justify);
    style.alignItems = mapAlignCss(align);
  } else if (layout === 'grid') {
    style.display = 'grid';
    const colCount = resolveGridColumnCount(columns);
    if (colCount != null && colCount > 0) {
      style.gridTemplateColumns = `repeat(${colCount}, minmax(0, 1fr))`;
    }
    if (typeof rows === 'number' && rows > 0) {
      style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    }
    style.justifyContent = mapJustifyCss(justify);
    style.alignItems = mapAlignCss(align);
  }

  if (alignSelf != null) {
    style.alignSelf = mapAlignSelfCss(alignSelf);
  }

  if (flexShorthand != null) {
    style.flex = flexShorthand;
  } else {
    if (grow != null) style.flexGrow = grow;
    if (shrink != null) style.flexShrink = shrink;
    const basisCss = containerSizeToCss(basis);
    if (basisCss != null) style.flexBasis = basisCss;
  }

  return style;
}

export function containerUsesCustomPadding(input: ContainerLayoutStyleInput): boolean {
  return (
    input.padding != null ||
    input.paddingX != null ||
    input.paddingY != null ||
    input.paddingTop != null ||
    input.paddingRight != null ||
    input.paddingBottom != null ||
    input.paddingLeft != null
  );
}

export interface ContainerProps extends Omit<ContainerLayoutStyleInput, 'maxWidthBox'> {
  /**
   * Surface mode for the **root** element (always `<Surface>` on web).
   * Defaults to `'ghost'` when omitted. Container layout classes and styles
   * are applied on that same node (`data-surface` remapping for children).
   * Native ignores `surface` / `appearance` today.
   */
  surface?: SurfaceToken;
  /**
   * Multi-accent role for the root `<Surface>` — passed through as
   * `appearance` (Surface defaults to `'auto'` when omitted).
   */
  appearance?: ComponentAppearance;
  /**
   * Layout variant.
   * - `fluid` (default): grows with viewport, always applies `--Grid-Margin`.
   * - `fixed`: capped at `--Grid-MaxWidth` per breakpoint, centered.
   * - `full-bleed`: no margin, no cap — edge-to-edge.
   */
  variant?: ContainerVariant;
  /**
   * Viewport cap when `variant` is `fixed` (number or non-preset string), or
   * CSS `max-width` / token preset on the element. See {@link resolveContainerMaxWidth}.
   */
  maxWidth?: string | number | ContainerSizePreset;
  /**
   * Deprecated compatibility hint used by older/generated compositions.
   * Consumed so it does not leak to the DOM as an unknown React prop.
   */
  fullWidth?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: `data-${string}`]: string | undefined;
}
