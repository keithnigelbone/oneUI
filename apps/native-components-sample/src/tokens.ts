/**
 * tokens.ts
 *
 * Constants identical to `apps/v4-sample/src/tokens.ts` (the web verifier).
 * Drives the four top-bar selectors plus the surface enumeration the
 * Surface-tokens screen renders.
 */

export const THEMES = ['light', 'dark', 'dim'] as const;
export type ThemeMode = (typeof THEMES)[number];

export const DENSITIES = ['compact', 'default', 'open'] as const;
export type Density = (typeof DENSITIES)[number];

// Matches `COMPONENT_APPEARANCE_ROLES` in `packages/shared/src/types/appearance.ts`.
// All 11 roles must be listed so the appearance chip in TopBar can address
// every scale the brand-CSS engine emits. Roles missing from this list are
// silently re-mapped to `neutral` by `useSurfaceTokens`, which is what made
// tertiary / quaternary / brand-bg look identical to neutral on native.
export const APPEARANCES = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;
export type Appearance = (typeof APPEARANCES)[number];

export const SURFACE_TOKENS = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;
export type SurfaceTokenName = (typeof SURFACE_TOKENS)[number];

export const CONTENT_TOKENS = [
  'high',
  'medium',
  'low',
  'tinted',
  'tintedA11y',
  'strokeMedium',
  'strokeLow',
] as const;
export type ContentTokenName = (typeof CONTENT_TOKENS)[number];

export const STATE_TOKENS = ['hover', 'pressed'] as const;
export type StateTokenName = (typeof STATE_TOKENS)[number];

/**
 * Active UI library renderer. Only `native` ships now — the comparator
 * libraries (`rnr`, `tamagui`, `buildtime`, `unistyles`) were retired
 * after the build-time-StyleSheet pattern won the perf experiment.
 */
export const LIBRARIES = ['native'] as const;
export type LibraryName = (typeof LIBRARIES)[number];
