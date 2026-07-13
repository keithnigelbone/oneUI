/**
 * Trimmed BrandDef for the v4-sample foundations pages.
 *
 * Mirrors `OneUIFoundationsApp/packages/core/src/themes.ts` minus the
 * typography / grid / colours fields — those pages aren't ported into
 * v4-sample yet (deferred as follow-ups).
 *
 * Source of truth: copied verbatim from the OneUIFoundationsApp repo, then
 * stripped of the unused fields so we don't drag typography font-family
 * and colour palette types in.
 */

import type { DimensionScale } from './dimensionTypes';
import { DEFAULT_DIMENSION_SCALE } from './dimensions';
import type { SpacingScale } from './spacingTypes';
import { DEFAULT_SPACING_SCALE } from './spacings';
import type { ShapeScale } from './shapeTypes';
import { DEFAULT_SHAPE_SCALE } from './shapes';
import type { StrokeScale } from './strokeTypes';
import { DEFAULT_STROKE_SCALE } from './strokes';

export type BrandAppearance = 'neutral' | 'primary' | 'secondary' | 'sparkle';
export type SystemAppearance = 'positive' | 'negative' | 'warning' | 'informative';
export type Appearance = BrandAppearance | SystemAppearance;

export interface ThemeDef {
  name: string;
  brand: Record<BrandAppearance, string>;
}

export interface BrandDef {
  name: string;
  themes: ThemeDef[];
  dimensions: DimensionScale;
  spacings: SpacingScale;
  shapes: ShapeScale;
  strokes: StrokeScale;
}

/**
 * Single Jio brand for the foundations pages. Themes mirror what the JDS
 * `themesFromJio.ts` lists for the human-readable names the pages display.
 */
export const BRANDS: BrandDef[] = [
  {
    name: 'Jio',
    themes: [
      { name: 'MyJio',      brand: { neutral: 'grey', primary: 'indigo',   secondary: 'saffron', sparkle: 'green'  } },
      { name: 'JioHome',    brand: { neutral: 'grey', primary: 'sky',      secondary: 'purple',  sparkle: 'orange' } },
      { name: 'JioFinance', brand: { neutral: 'grey', primary: 'gold',     secondary: 'sky',     sparkle: 'purple' } },
      { name: 'JioMart',    brand: { neutral: 'grey', primary: 'sky',      secondary: 'green',   sparkle: 'red'    } },
    ],
    dimensions: DEFAULT_DIMENSION_SCALE,
    spacings:   DEFAULT_SPACING_SCALE,
    shapes:     DEFAULT_SHAPE_SCALE,
    strokes:    DEFAULT_STROKE_SCALE,
  },
];
