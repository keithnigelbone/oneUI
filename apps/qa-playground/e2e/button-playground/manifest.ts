/**
 * Anchors from `ButtonQaShowcase.tsx` — `data-testid` on root `<button>` only.
 */
export const BUTTON_PLAYGROUND_ROUTE = '/c/button';

export const BUTTON_COMPONENT_TYPE = 'interactive' as const;

/** CSS scope for axe — story bands with `data-section` (excludes QA catalog chrome). */
export const BUTTON_SHOWCASE_AXE_SCOPE = '[data-section^="button-qa"]';

/** `QaStoryBand` `id` values — rendered as `data-section` on `<section>`. */
export const BUTTON_DATA_SECTIONS = [
  'button-qa-default',
  'button-qa-button-sizes-contained',
  'button-qa-button-attention',
  'button-qa-api-appearance-strip',
  'button-qa-appearance-matrix',
  'button-qa-api-condensed-contained',
  'button-qa-button-full-width',
  'button-qa-button-with-icons',
  'button-qa-api-disabled',
  'button-qa-button-loading',
  'button-qa-api-accent',
  'button-qa-api-combos',
] as const;

/** Legacy `#id` anchors on inner rows (uncontained Button / interactive — no `data-testid`). */
export const BUTTON_LEGACY_SECTION_IDS = [
  'button-qa-single-text-sizes',
  'button-qa-single-text-attention',
  'button-qa-single-text-full-width',
  'button-qa-single-text-states',
  'button-qa-interactive',
] as const;

export const BUTTON_FIGMA_SIZES = ['XS', 'S', 'M', 'L'] as const;

export const BUTTON_ATTENTIONS = ['high', 'medium', 'low'] as const;

/** Figma attention → `data-variant` on contained Button. */
export const BUTTON_ATTENTION_TO_VARIANT = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
} as const;

export const BUTTON_APPEARANCE_KEYS = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

/** Roles rendered by `ButtonAppearances` in §3b (matches `Button.showcase.tsx`). */
export const BUTTON_MATRIX_APPEARANCE_ROLES = [
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

export const BUTTON_COMBO_COUNT = 8;

export const BUTTON_ALL_TESTIDS = [
  'btn-size-XS',
  'btn-size-S',
  'btn-size-M',
  'btn-size-L',
  'btn-attention-high',
  'btn-attention-medium',
  'btn-attention-low',
  'btn-appearance-auto',
  'btn-appearance-neutral',
  'btn-appearance-primary',
  'btn-appearance-secondary',
  'btn-appearance-sparkle',
  'btn-appearance-brand-bg',
  'btn-appearance-positive',
  'btn-appearance-negative',
  'btn-appearance-warning',
  'btn-appearance-informative',
  'btn-contained-false-condensed-false',
  'btn-contained-false-condensed-true',
  'btn-contained-true-condensed-false',
  'btn-contained-true-condensed-true',
  'btn-fullwidth-contained-false',
  'btn-fullwidth-contained-true-width-false',
  'btn-fullwidth-contained-true-width-true',
  'btn-start-none-end-none',
  'btn-start-icon-end-none',
  'btn-start-none-end-icon',
  'btn-start-icon-end-icon',
  'btn-start-cpi-end-none',
  'btn-disabled-false',
  'btn-disabled-true',
  'btn-loading-false',
  'btn-loading-true',
  'btn-loading-slots-hidden',
  'btn-accent-primary-standin',
  'btn-accent-secondary-standin',
  'btn-accent-sparkle-standin',
  'btn-combo-0',
  'btn-combo-1',
  'btn-combo-2',
  'btn-combo-3',
  'btn-combo-4',
  'btn-combo-5',
  'btn-combo-6',
  'btn-combo-7',
] as const;

export const BUTTON_ROOT_SECTION = 'button-qa-default';

export function btnSizeTestId(figma: (typeof BUTTON_FIGMA_SIZES)[number]): string {
  return `btn-size-${figma}`;
}

export function btnAttentionTestId(attention: (typeof BUTTON_ATTENTIONS)[number]): string {
  return `btn-attention-${attention}`;
}

export function btnAppearanceTestId(appearance: (typeof BUTTON_APPEARANCE_KEYS)[number]): string {
  return `btn-appearance-${appearance}`;
}

export function btnComboTestId(index: number): string {
  return `btn-combo-${index}`;
}

export const BUTTON_APPEARANCE_A11Y_TESTIDS = BUTTON_APPEARANCE_KEYS.map(
  (a) => `btn-appearance-${a}`,
) as readonly string[];

export const APPEARANCE_COLOUR_SAMPLE = [
  'primary',
  'secondary',
  'positive',
  'warning',
  'neutral',
] as const satisfies readonly (typeof BUTTON_APPEARANCE_KEYS)[number][];

/** §3b matrix — medium attention rows may fail strict colour contrast in fixture brand. */
export const BUTTON_AXE_MATRIX_SECTION = '#button-qa-appearance-matrix';
