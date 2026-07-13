/**
 * CircularProgressIndicator.shared.ts
 * Shared types and hooks for CircularProgressIndicator component
 * Used by both web and React Native implementations
 */

import type { CSSProperties, ReactNode } from 'react';
import type { IconSize } from '../Icon/Icon.shared';

/** T-shirt size presets mapping to spacing dimension tokens */
export type CircularProgressIndicatorSize =
  | '2XS'
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '2XL'
  | '3XL'
  | '4XL'
  | '5XL';

/**
 * CircularProgressIndicator appearance — covers the 9 roles supported by the
 * design system today: 4 brand-dynamic (primary, secondary, sparkle, brand-bg)
 * + 5 fixed (neutral, positive, negative, warning, informative). Tertiary and
 * quaternary are intentionally excluded.
 */
export type CircularProgressIndicatorAppearance =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'sparkle'
  | 'brand-bg'
  | 'neutral'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';

/**
 * Metallic material that paints the active progress arc. `'none'` (default)
 * keeps the role-derived solid colour. Any other value swaps the arc stroke
 * for the matching brand metallic gradient (the four foundation metals plus
 * the optional platinum / roseGold presets). Mirrors the engine's
 * `MetallicPresetName` union so editor + brand assignments line up.
 */
export type CircularProgressIndicatorMaterial =
  | 'none'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'custom'
  | 'platinum'
  | 'roseGold';

/**
 * Material preset → metallic token label (matches engine `getMetallicTokenLabel`).
 * Used to build `--Material-Metallic-{Label}-{Stop}` references for the arc gradient.
 */
export const CPI_MATERIAL_TOKEN_LABEL: Record<
  Exclude<CircularProgressIndicatorMaterial, 'none'>,
  string
> = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  custom: 'Custom',
  platinum: 'Platinum',
  roseGold: 'RoseGold',
};

/**
 * SVG `<linearGradient>` stop layout for the metallic arc. Mirrors the engine
 * `FILL_STOPS` so the arc sheen matches metallic button fills. Offsets are SVG
 * geometry (not design tokens); each `property` resolves to a metallic stop
 * token, e.g. `var(--Material-Metallic-Gold-Shadow)`.
 */
export const CPI_MATERIAL_GRADIENT_STOPS: ReadonlyArray<{ offset: string; property: string }> = [
  { offset: '0%', property: 'Shadow' },
  { offset: '15%', property: 'Base' },
  { offset: '30%', property: 'BaseLight' },
  { offset: '45%', property: 'Highlight' },
  { offset: '55%', property: 'BaseLight' },
  { offset: '70%', property: 'Base' },
  { offset: '85%', property: 'BaseLight' },
  { offset: '100%', property: 'Shadow' },
];

/** Determinate or indeterminate variant */
export type CircularProgressIndicatorVariant = 'determinate' | 'indeterminate';

/** Center content mode */
export type CircularProgressIndicatorContent = 'none' | 'icon' | 'text';

/** Label typography step paired to each CPI size (`content="text"`). */
export type CircularProgressIndicatorLabelSize =
  | '3XS'
  | '2XS'
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '2XL';

/**
 * Figma (node 2314:1097): CPI size → centre `Icon` spacing index.
 * XS/S/2XS use {@link CPI_ICON_SLOT_OVERRIDES} in the web CSS module because
 * `Icon` has no `1.5` preset (6px) — the map still sets the nearest `data-size`.
 */
export const CPI_SIZE_TO_ICON_SIZE: Record<CircularProgressIndicatorSize, IconSize> = {
  '2XS': '2',
  XS: '2',
  S: '2',
  M: '2',
  L: '2.5',
  XL: '3.5',
  '2XL': '4',
  '3XL': '4.5',
  '4XL': '5',
  '5XL': '6',
};

/** Figma only renders percentage labels at L and above (node 13056:2639). */
export const CPI_LABEL_VISIBLE_SIZES = [
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
] as const satisfies readonly CircularProgressIndicatorSize[];

export type CpiLabelVisibleSize = (typeof CPI_LABEL_VISIBLE_SIZES)[number];

export function isCpiLabelVisible(
  size: CircularProgressIndicatorSize,
): size is CpiLabelVisibleSize {
  return (CPI_LABEL_VISIBLE_SIZES as readonly string[]).includes(size);
}

/**
 * Figma pairing: CPI size → label typography step (`content="text"`).
 * Only sizes in {@link CPI_LABEL_VISIBLE_SIZES} render text; entries below L
 * exist for type completeness.
 */
export const CPI_SIZE_TO_LABEL_SIZE: Record<
  CircularProgressIndicatorSize,
  CircularProgressIndicatorLabelSize
> = {
  '2XS': '3XS',
  XS: '3XS',
  S: '3XS',
  M: '3XS',
  L: '3XS',
  XL: '2XS',
  '2XL': 'XS',
  '3XL': 'S',
  '4XL': 'S',
  '5XL': 'M',
};

export interface CircularProgressIndicatorProps {
  /** Determinate shows arc proportional to value; indeterminate shows spinning animation. Default: 'determinate'. */
  variant?: CircularProgressIndicatorVariant;
  /** Size preset — maps to spacing dimension tokens. Default: 'M'. */
  size?: CircularProgressIndicatorSize;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. Default: 'secondary'. */
  appearance?: CircularProgressIndicatorAppearance;
  /**
   * Metallic material for the active arc. `'none'` (default) uses the role
   * colour; any metal swaps the arc stroke for the brand metallic gradient.
   */
  material?: CircularProgressIndicatorMaterial;
  /** Center content: 'none'=empty, 'icon'=render children as icon, 'text'=auto percentage label. Default: 'none'. */
  content?: CircularProgressIndicatorContent;
  /** Current progress value (determinate only) */
  value?: number;
  /** Minimum value. Default: 0. */
  min?: number;
  /** Maximum value. Default: 100. */
  max?: number;
  /** Children rendered as icon when content='icon' */
  children?: ReactNode;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** ID of element that labels this progress indicator */
  'aria-labelledby'?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Enable entry + exit animations. Default: false (opt-in). Pair with `show` for controlled visibility. */
  animate?: boolean;
  /** Controlled visibility. When `animate` is true, toggling `show` triggers entry or exit. Default: true. */
  show?: boolean;
  /** Optional test hook — forwarded to the root visual container (the ring wrapper). */
  'data-testid'?: string;
}

/**
 * SVG stroke width (in viewBox units) per size.
 * ViewBox is 100x100. Stroke widths are computed from Figma pixel strokes
 * relative to each size's rendered pixel dimensions.
 *
 * Formula: svgStrokeUnits = (strokePx / componentPx) * 100
 */
const SVG_STROKE_MAP: Record<CircularProgressIndicatorSize, number> = {
  '2XS': 25,
  'XS': 16.67,
  'S': 18.75,
  'M': 15,
  'L': 16.67,
  'XL': 12.5,
  '2XL': 15,
  '3XL': 12.5,
  '4XL': 14.29,
  '5XL': 12.5,
};

/** SVG viewBox dimension (square) */
const VIEWBOX = 100;
const CENTER = VIEWBOX / 2;

export interface CircularProgressState {
  /** Normalized value between 0 and 1 */
  normalizedValue: number;
  /** Percentage value (0-100) for text display */
  percentage: number;
  /** Whether the indicator is in indeterminate mode */
  isIndeterminate: boolean;
  /** SVG circle center coordinate */
  center: number;
  /** SVG circle radius (accounts for stroke width) */
  radius: number;
  /** SVG stroke width in viewBox units */
  strokeWidth: number;
  /** Circle circumference for dash calculations */
  circumference: number;
  /** Stroke dash offset for determinate progress arc */
  dashOffset: number;
  /** Resolved appearance role */
  resolvedAppearance: Exclude<CircularProgressIndicatorAppearance, 'auto'>;
  /** Data attributes for CSS selectors */
  dataAttrs: Record<string, string | undefined>;
}

export function useCircularProgressState(
  props: CircularProgressIndicatorProps,
): CircularProgressState {
  const {
    variant = 'determinate',
    size = 'M',
    appearance = 'secondary',
    content = 'none',
    value,
    min = 0,
    max = 100,
  } = props;

  const isIndeterminate = variant === 'indeterminate' || value == null;

  // Clamp and normalize value
  const clampedValue = Math.min(max, Math.max(min, value ?? min));
  const range = max - min;
  const normalizedValue = range > 0 ? (clampedValue - min) / range : 0;
  const percentage = Math.round(normalizedValue * 100);

  // SVG geometry
  const strokeWidth = SVG_STROKE_MAP[size];
  const radius = (VIEWBOX - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = isIndeterminate ? 0 : circumference * (1 - normalizedValue);

  // Resolve appearance
  const resolvedAppearance =
    appearance === 'auto' || !appearance ? 'primary' : appearance;

  const dataAttrs: Record<string, string | undefined> = {
    // Lets the Advanced Editor scope per-component colour overrides to the
    // element (not the preview wrapper) so role tokens still remap inside
    // [data-surface] contexts — keeps surface-context adaptation working.
    'data-oneui-component': 'CircularProgressIndicator',
    'data-size': size,
    'data-variant': variant,
    'data-appearance': resolvedAppearance,
    'data-content': content,
  };

  return {
    normalizedValue,
    percentage,
    isIndeterminate,
    center: CENTER,
    radius,
    strokeWidth,
    circumference,
    dashOffset,
    resolvedAppearance,
    dataAttrs,
  };
}
