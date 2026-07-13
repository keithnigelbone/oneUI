/**
 * schema.ts
 *
 * First-class OneUI composition contract for the Experience Builder Lab.
 * This is deliberately above the IR: it describes page/section intent,
 * attention, container, grid, and spacing choices before the IR generator
 * commits to concrete component instances and layout nodes.
 */

import { z } from 'zod';

export const PageCompositionPageType = z.enum([
  'homepage',
  'commerce-homepage',
  'product-listing',
  'product-detail',
  'checkout',
  'campaign-landing',
  'dashboard',
  'settings',
  'onboarding',
]);
export type PageCompositionPageTypeT = z.infer<typeof PageCompositionPageType>;

export const PageCompositionDensity = z.enum(['compact', 'comfortable', 'editorial']);
export type PageCompositionDensityT = z.infer<typeof PageCompositionDensity>;

export const SectionAttentionLevel = z.enum(['primary', 'secondary', 'supporting']);
export type SectionAttentionLevelT = z.infer<typeof SectionAttentionLevel>;

export const SectionContainer = z.enum(['fullBleed', 'contained', 'narrow']);
export type SectionContainerT = z.infer<typeof SectionContainer>;

export const SectionGrid = z.enum(['oneColumn', 'twoColumn', 'threeColumn', 'productGrid', 'rail']);
export type SectionGridT = z.infer<typeof SectionGrid>;

export const SectionSpacing = z.enum(['none', 'sm', 'md', 'lg', 'xl']);
export type SectionSpacingT = z.infer<typeof SectionSpacing>;

export const SurfaceMode = z.enum([
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
]);
export type SurfaceModeT = z.infer<typeof SurfaceMode>;

export const SectionCompositionSchema = z
  .object({
    sectionId: z.string().min(1),
    patternId: z.string().min(1),
    attentionLevel: SectionAttentionLevel,
    container: SectionContainer,
    grid: SectionGrid,
    spacingTop: SectionSpacing,
    spacingBottom: SectionSpacing,
    surfaceMode: SurfaceMode,
    allowedComponents: z.array(z.string().min(1)),
  })
  .strict();
export type SectionCompositionT = z.infer<typeof SectionCompositionSchema>;

export const PageCompositionSchema = z
  .object({
    brandId: z.string().min(1),
    pageType: PageCompositionPageType,
    pagePatternId: z.string().min(1),
    density: PageCompositionDensity,
    sections: z.array(SectionCompositionSchema).min(1),
  })
  .strict();
export type PageCompositionT = z.infer<typeof PageCompositionSchema>;

export const DEFAULT_PAGE_TYPE: PageCompositionPageTypeT = 'homepage';
export const DEFAULT_DENSITY: PageCompositionDensityT = 'comfortable';
export const DEFAULT_SECTION_PATTERN_ID = 'content-stack';
export const DEFAULT_PAGE_PATTERN_ID = 'homepage-basic';
