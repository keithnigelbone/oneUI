/**
 * Token vocabulary, platform-neutral. Each kb-<sdk> declares which of these
 * its component consumes; consumer AJV validators reject raw literals where a
 * token-bound prop expects one of these enums.
 *
 * Mirrors the f-step scale, shape system, and typography roles documented in
 * the project root CLAUDE.md and in `packages/tokens/src/index.ts`.
 */

import type { ColorRole } from './roles';

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export type TypographyRole = 'display' | 'headline' | 'title' | 'body' | 'label' | 'code';

export type DisplaySize = 'L' | 'M' | 'S';
export type HeadlineSize = 'L' | 'M' | 'S';
export type TitleSize = 'L' | 'M' | 'S';
export type BodySize = '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS';
export type LabelSize = '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS';
export type CodeSize = 'M' | 'S' | 'XS';

export type TypographyVariant =
  | `display.${DisplaySize}`
  | `headline.${HeadlineSize}`
  | `title.${TitleSize}`
  | `body.${BodySize}`
  | `label.${LabelSize}`
  | `code.${CodeSize}`;

export type Emphasis = 'high' | 'medium' | 'low';

// ---------------------------------------------------------------------------
// Spacing — 25-step f-scale plus margin/gutter aliases.
// ---------------------------------------------------------------------------

export const SPACING_SCALE = [
  'none',
  '6XS', '5XS', '4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL',
  '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL',
  '10XL', '11XL', '12XL', '13XL', '14XL', '15XL',
  'margin', 'gutter',
] as const;
export type SpacingScale = (typeof SPACING_SCALE)[number];

// ---------------------------------------------------------------------------
// Shape — t-shirt scale derived from f-steps + standalone Pill.
// ---------------------------------------------------------------------------

export const SHAPE_SCALE = [
  '6XS', '5XS', '4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL',
  '2XL', '3XL', '4XL', '5XL', '6XL',
  'pill',
] as const;
export type ShapeScale = (typeof SHAPE_SCALE)[number];

// ---------------------------------------------------------------------------
// Motion — discreet vs expressive families, short/medium/long.
// ---------------------------------------------------------------------------

export type MotionDuration = `motion.duration.${'discreet' | 'expressive'}.${'short' | 'medium' | 'long'}`;
export type MotionEasing = `motion.easing.${'entrance' | 'exit' | 'transition'}`;
export type MotionToken = MotionDuration | MotionEasing;

// ---------------------------------------------------------------------------
// Elevation — 0..5
// ---------------------------------------------------------------------------

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

// ---------------------------------------------------------------------------
// Token bundle a component declares it consumes. Drives consumer "swap raw
// hex for token" rewrites + the build-time token-claim integrity check (B6).
// ---------------------------------------------------------------------------

export interface ComponentTokenConsumption {
  readonly color?: readonly ColorRole[];
  readonly surface?: ReadonlyArray<'default' | 'ghost' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated'>;
  readonly typography?: readonly TypographyVariant[];
  readonly spacing?: readonly SpacingScale[];
  readonly shape?: readonly ShapeScale[];
  readonly motion?: readonly MotionToken[];
  readonly elevation?: readonly ElevationLevel[];
}
