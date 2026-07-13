/**
 * Brand CSS Engine — UI Re-export Layer
 *
 * Re-exports framework-agnostic functions from @oneui/shared/engine
 * plus UI-specific surface computation bridge.
 */

// Re-export everything from shared engine (framework-agnostic)
export {
  buildAvailableScales,
  validateBrandCSS,
  validateSurfaceContextCSS,
  wrapCSSForInjection,
  filterBrandDeclarations,
  BRAND_ALLOWED_PREFIXES,
} from '@oneui/shared/engine';
export type {
  EngineAvailableScale,
  EngineColorPalette,
  BrandCSSValidation,
  SurfaceContextCSSValidation,
  InjectionMode,
} from '@oneui/shared/engine';

// Surface algorithm bridge (Convex data → new algorithm)
export {
  buildNewPaletteData,
  generateNewRootCSS,
  generateNewContextCSS,
  generateNewStepLookupCSS,
  generateNewAppearanceRedirectCSS,
  generateNewContextBoundaryCSS,
  generateNewTransparentCSS,
  resolveNewTokenSets,
} from './computeNewStacking';
export type { NewPaletteData } from './computeNewStacking';
