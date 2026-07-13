/**
 * Anchors from `CircularProgressIndicatorQaShowcase.tsx`.
 * `data-testid` is forwarded on the root ring wrapper; `role="progressbar"` lives on Base UI root.
 *
 * Component type: **display** (progress indicator — not interactive / not tabbable).
 */

export const CPI_PLAYGROUND_ROUTE = '/c/circular-progress-indicator';

export const CPI_COMPONENT_TYPE = 'display' as const;

export const CPI_SHOWCASE_AXE_SCOPE = '[data-section^="circular-progress-indicator-qa"]';

export const CPI_DATA_SECTIONS = [
  'circular-progress-indicator-qa-default',
  'circular-progress-indicator-qa-variant',
  'circular-progress-indicator-qa-size',
  'circular-progress-indicator-qa-icon-text-sizes',
  'circular-progress-indicator-qa-appearance',
  'circular-progress-indicator-qa-content',
  'circular-progress-indicator-qa-value-min-max',
  'circular-progress-indicator-qa-code-extras',
  'circular-progress-indicator-qa-aria-labelledby',
  'circular-progress-indicator-qa-combos',
] as const;

export const CPI_SECTION_COUNT = CPI_DATA_SECTIONS.length;

/** Playground size keys (FIGMA_SIZES order in showcase). */
export const CPI_SIZE_KEYS = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

/** Figma: percentage centre label only at L and above (matches `@oneui/ui` CPI_LABEL_VISIBLE_SIZES). */
export const CPI_LABEL_VISIBLE_SIZES = [
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
] as const satisfies readonly (typeof CPI_SIZE_KEYS)[number][];

export const CPI_FIGMA_APPEARANCES = [
  'auto',
  'primary',
  'secondary',
  'sparkle',
  'neutral',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

export const CPI_VALUE_SAMPLES = [0, 25, 50, 75, 100] as const;

export const CPI_COMBO_COUNT = 8;

export const CPI_ROOT_TESTIDS = {
  default: 'cpi-default',
  variantDeterminate: 'cpi-variant-determinate',
  variantIndeterminate: 'cpi-variant-indeterminate',
  ariaLabelledby: 'cpi-aria-labelledby',
  styleTransitionZero: 'cpi-style-transition-zero',
} as const;

export function cpiSizeTestId(size: (typeof CPI_SIZE_KEYS)[number]): string {
  return `cpi-size-${size}`;
}

export function cpiSizesTextTestId(size: (typeof CPI_SIZE_KEYS)[number]): string {
  return `cpi-sizes-text-${size}`;
}

export function cpiSizesIconTestId(size: (typeof CPI_SIZE_KEYS)[number]): string {
  return `cpi-sizes-icon-${size}`;
}

export function cpiAppearanceTestId(appearance: (typeof CPI_FIGMA_APPEARANCES)[number] | 'brand-bg'): string {
  return `cpi-appearance-${appearance}`;
}

export function cpiValueTestId(value: (typeof CPI_VALUE_SAMPLES)[number]): string {
  return `cpi-value-${value}`;
}

export function cpiComboTestId(index: number): string {
  return `cpi-combo-${index}`;
}

/** Every `data-testid` in Test Scenarios (exact showcase values). */
export function allCircularProgressIndicatorPlaygroundTestIds(): string[] {
  const ids: string[] = [CPI_ROOT_TESTIDS.default];

  ids.push(CPI_ROOT_TESTIDS.variantDeterminate, CPI_ROOT_TESTIDS.variantIndeterminate);

  for (const size of CPI_SIZE_KEYS) {
    ids.push(cpiSizeTestId(size));
    ids.push(cpiSizesTextTestId(size));
    ids.push(cpiSizesIconTestId(size));
  }

  for (const appearance of CPI_FIGMA_APPEARANCES) {
    ids.push(cpiAppearanceTestId(appearance));
  }
  ids.push(cpiAppearanceTestId('brand-bg'));

  ids.push(
    'cpi-content-none-det',
    'cpi-content-text-det',
    'cpi-content-icon-det',
    'cpi-content-none-ind',
    'cpi-content-text-ind',
    'cpi-content-icon-ind',
  );

  for (const value of CPI_VALUE_SAMPLES) {
    ids.push(cpiValueTestId(value));
  }
  ids.push('cpi-range-0-200', 'cpi-range-10-60');

  ids.push(CPI_ROOT_TESTIDS.styleTransitionZero);
  ids.push(CPI_ROOT_TESTIDS.ariaLabelledby);

  for (let i = 0; i < CPI_COMBO_COUNT; i += 1) {
    ids.push(cpiComboTestId(i));
  }

  return ids;
}

export const CPI_ALL_TESTIDS = allCircularProgressIndicatorPlaygroundTestIds();

export const CPI_APPEARANCE_CONTRAST_TESTIDS = [
  ...CPI_FIGMA_APPEARANCES.map((a) => cpiAppearanceTestId(a)),
  cpiAppearanceTestId('brand-bg'),
] as const;
