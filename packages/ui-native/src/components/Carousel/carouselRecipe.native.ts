/**
 * Carousel recipe resolution — native peer of `Carousel.recipe.ts` resolutionMap.
 */

import type { NativeShape } from '@oneui/shared/engine';
import { tokens } from '@oneui/tokens';
import { resolveShapeBorderRadius } from '../../theme/recipeCornerRadius';

export interface CarouselContentSpacing {
  paddingTop: number;
  paddingBottom: number;
  paddingHorizontal: number;
  /** Title cluster inner gap (headline ↔ body). Figma `↳ content` = `Spacing-2`. */
  contentGap: number;
  /** Gap between title cluster and button group (Figma `ContentBlock` rhythm = `Spacing-3`). */
  contentOuterGap: number;
  /** Gap between top badges row and bottom content cluster (Figma `Spacing-3`). */
  badgesToContentGap: number;
  /** ButtonGroup internal `pt` above buttons (Figma `.ButtonGroup` = `Spacing-2`). */
  buttonGroupPaddingTop: number;
  cornerPadding: number;
  /** Below-media controls block padding — Figma mobile `py=0`. */
  controlsPaddingVertical: number;
}

const BALANCED_CONTENT_SPACING: CarouselContentSpacing = {
  paddingTop: tokens.spacing['4'],
  paddingBottom: tokens.spacing['4'],
  paddingHorizontal: tokens.spacing['4'],
  contentGap: tokens.spacing['2'],
  contentOuterGap: tokens.spacing['3'],
  badgesToContentGap: tokens.spacing['3'],
  buttonGroupPaddingTop: tokens.spacing['2'],
  cornerPadding: tokens.spacing['3-5'],
  controlsPaddingVertical: 0,
};

/** Default slide radius — web `--Carousel-Slide-borderRadius` fallback is Shape-3. */
export function resolveCarouselSlideRadius(
  recipe: Record<string, string>,
  shape: NativeShape,
): number {
  switch (recipe.slideShape) {
    case 'roomy':
      return resolveShapeBorderRadius('Shape-4-5', shape) ?? shape['4-5'];
    case 'sharp':
      return resolveShapeBorderRadius('Shape-0', shape) ?? 0;
    case 'soft':
    default:
      return resolveShapeBorderRadius('Shape-3', shape) ?? shape['3'];
  }
}

/** Content rhythm spacing — mirrors `contentRhythm` resolutionMap on web. */
export function resolveCarouselContentSpacing(
  recipe: Record<string, string>,
): CarouselContentSpacing {
  switch (recipe.contentRhythm) {
    case 'compact':
      return {
        paddingTop: tokens.spacing['4'],
        paddingBottom: tokens.spacing['4'],
        paddingHorizontal: tokens.spacing['4'],
        contentGap: tokens.spacing['2'],
        contentOuterGap: tokens.spacing['3'],
        badgesToContentGap: tokens.spacing['3'],
        buttonGroupPaddingTop: tokens.spacing['2'],
        cornerPadding: tokens.spacing['3-5'],
        controlsPaddingVertical: 0,
      };
    case 'spacious':
      return {
        paddingTop: tokens.spacing['6'],
        paddingBottom: tokens.spacing['8'],
        paddingHorizontal: tokens.spacing['6'],
        contentGap: tokens.spacing['3-5'],
        contentOuterGap: tokens.spacing['4-5'],
        badgesToContentGap: tokens.spacing['4-5'],
        buttonGroupPaddingTop: tokens.spacing['3-5'],
        cornerPadding: tokens.spacing['3-5'],
        controlsPaddingVertical: 0,
      };
    case 'balanced':
    default:
      return BALANCED_CONTENT_SPACING;
  }
}
