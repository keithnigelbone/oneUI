/**
 * appearance.ts
 *
 * Canonical appearance type for multi-accent components.
 *
 * The full set of 9 appearance roles + `'auto'`. Components that consume
 * an `appearance` prop should import this type instead of redefining it,
 * so the contract stays consistent across the design system.
 *
 * Roles are wired in brand CSS via [data-appearance="<role>"] selectors
 * and in component CSS via .appearance{Role} classes. CSS support for the
 * full set is mandatory before adding a new role here.
 */

/**
 * All appearance roles a multi-accent component can render as.
 *
 * - `'auto'` resolves to the component's contextually appropriate role.
 *   Components may inherit a parent appearance context first, then fall back
 *   to their own documented default (for example, Button uses primary while
 *   Chip uses secondary).
 * - The 9 named roles map 1:1 to brand CSS appearance scales.
 */
export type ComponentAppearance =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'sparkle'
  | 'brand-bg'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';

/** Tuple of all appearance roles excluding `'auto'`, useful for iteration. */
export const COMPONENT_APPEARANCE_ROLES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

/** Concrete (non-auto) appearance role. */
export type ComponentAppearanceRole = (typeof COMPONENT_APPEARANCE_ROLES)[number];

/**
 * Roles a sub-brand owns and edits directly: primary, secondary, sparkle, brand-bg.
 * Semantic + neutral roles flow through from the parent brand.
 */
export const SUBBRAND_EDITABLE_ROLES = ['primary', 'secondary', 'sparkle', 'brand-bg'] as const;
export type SubBrandEditableRole = (typeof SUBBRAND_EDITABLE_ROLES)[number];

/**
 * Roles a sub-brand inherits unchanged from its parent brand: neutral + the four
 * semantic roles. Sparkle is *not* inherited — sub-brand sparkle overrides parent.
 */
export const INHERITED_SEMANTIC_ROLES = ['neutral', 'positive', 'negative', 'warning', 'informative'] as const;
export type InheritedSemanticRole = (typeof INHERITED_SEMANTIC_ROLES)[number];
