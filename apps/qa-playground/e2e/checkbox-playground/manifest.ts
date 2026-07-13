/**
 * Anchors from `CheckboxQaShowcase.tsx` — `data-testid` on `Checkbox` controls only.
 * `data-section` === band `id` from `QaStoryBand`.
 *
 * Component type: **interactive** (form toggle — checkbox).
 */

export const CHECKBOX_PLAYGROUND_ROUTE = '/c/checkbox';

/** Component type for QA dashboard grouping. */
export const CHECKBOX_COMPONENT_TYPE = 'interactive' as const;

/** CSS scope for axe — story bands with `data-section`. */
export const CHECKBOX_SHOWCASE_AXE_SCOPE = '[data-section^="checkbox-qa"]';

/** Same `id` / `data-section` as each `QaStoryBand` in the Checkbox showcase. */
export const CHECKBOX_DATA_SECTIONS = [
  'checkbox-qa-default',
  'checkbox-qa-size',
  'checkbox-qa-appearance',
  'checkbox-qa-accent',
  'checkbox-qa-selected',
  'checkbox-qa-indeterminate',
  'checkbox-qa-readonly',
  'checkbox-qa-disabled',
  'checkbox-qa-combos',
] as const;

export const CHECKBOX_SECTION_COUNT = CHECKBOX_DATA_SECTIONS.length;

export const CHECKBOX_FIGMA_SIZES = ['S', 'M', 'L'] as const;

export const CHECKBOX_SIZE_ALIASES = ['small', 'medium', 'large'] as const;

/** Same order as `FIGMA_APPEARANCE` in `CheckboxQaShowcase.tsx`. */
export const CHECKBOX_FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const CHECKBOX_ACCENTS = ['primary', 'secondary', 'sparkle'] as const;

export const CHECKBOX_COMBO_COUNT = 8;

export const CHECKBOX_ROOT_TESTIDS = {
  default: 'checkbox-default',
  selectedFalse: 'checkbox-selected-false',
  selectedTrue: 'checkbox-selected-true',
  indeterminateFalse: 'checkbox-indeterminate-false',
  indeterminateTrue: 'checkbox-indeterminate-true',
  readonlyFalseOff: 'checkbox-readonly-false-off',
  readonlyTrueOff: 'checkbox-readonly-true-off',
  readonlyTrueOn: 'checkbox-readonly-true-on',
  readonlyTrueInd: 'checkbox-readonly-true-ind',
  disabledFalseOff: 'checkbox-disabled-false-off',
  disabledTrueOff: 'checkbox-disabled-true-off',
  disabledTrueOn: 'checkbox-disabled-true-on',
  disabledTrueInd: 'checkbox-disabled-true-ind',
} as const;

export function checkboxSizeTestId(figma: (typeof CHECKBOX_FIGMA_SIZES)[number]): string {
  return `checkbox-size-${figma}`;
}

export function checkboxSizeAliasTestId(alias: (typeof CHECKBOX_SIZE_ALIASES)[number]): string {
  return `checkbox-size-alias-${alias}`;
}

export function checkboxAppearanceTestId(
  appearance: (typeof CHECKBOX_FIGMA_APPEARANCES)[number] | 'brand-bg',
  state: 'off' | 'on' | 'ind',
): string {
  return `checkbox-appearance-${appearance}-${state}`;
}

export function checkboxAccentTripletTestId(accent: (typeof CHECKBOX_ACCENTS)[number], state: 'off' | 'on' | 'ind'): string {
  return `checkbox-accent-${accent}-${state}`;
}

export function checkboxAccentNeutralTestId(accent: (typeof CHECKBOX_ACCENTS)[number]): string {
  return `checkbox-accent-neutral-${accent}`;
}

export function checkboxComboTestId(index: number): string {
  return `checkbox-combo-${index}`;
}

/** Every `data-testid` declared in `CheckboxQaShowcase.tsx`. */
export function allCheckboxPlaygroundTestIds(): readonly string[] {
  const ids: string[] = [CHECKBOX_ROOT_TESTIDS.default];

  for (const figma of CHECKBOX_FIGMA_SIZES) {
    ids.push(checkboxSizeTestId(figma));
  }
  for (const alias of CHECKBOX_SIZE_ALIASES) {
    ids.push(checkboxSizeAliasTestId(alias));
  }
  for (const appearance of CHECKBOX_FIGMA_APPEARANCES) {
    ids.push(checkboxAppearanceTestId(appearance, 'off'));
    ids.push(checkboxAppearanceTestId(appearance, 'on'));
    ids.push(checkboxAppearanceTestId(appearance, 'ind'));
  }
  ids.push(checkboxAppearanceTestId('brand-bg', 'off'));
  ids.push(checkboxAppearanceTestId('brand-bg', 'on'));
  ids.push(checkboxAppearanceTestId('brand-bg', 'ind'));

  for (const accent of CHECKBOX_ACCENTS) {
    ids.push(checkboxAccentTripletTestId(accent, 'off'));
    ids.push(checkboxAccentTripletTestId(accent, 'on'));
    ids.push(checkboxAccentTripletTestId(accent, 'ind'));
    ids.push(checkboxAccentNeutralTestId(accent));
  }

  ids.push(
    CHECKBOX_ROOT_TESTIDS.selectedFalse,
    CHECKBOX_ROOT_TESTIDS.selectedTrue,
    CHECKBOX_ROOT_TESTIDS.indeterminateFalse,
    CHECKBOX_ROOT_TESTIDS.indeterminateTrue,
    CHECKBOX_ROOT_TESTIDS.readonlyFalseOff,
    CHECKBOX_ROOT_TESTIDS.readonlyTrueOff,
    CHECKBOX_ROOT_TESTIDS.readonlyTrueOn,
    CHECKBOX_ROOT_TESTIDS.readonlyTrueInd,
    CHECKBOX_ROOT_TESTIDS.disabledFalseOff,
    CHECKBOX_ROOT_TESTIDS.disabledTrueOff,
    CHECKBOX_ROOT_TESTIDS.disabledTrueOn,
    CHECKBOX_ROOT_TESTIDS.disabledTrueInd,
  );

  for (let i = 0; i < CHECKBOX_COMBO_COUNT; i++) {
    ids.push(checkboxComboTestId(i));
  }

  return ids;
}

export const CHECKBOX_ALL_TESTIDS = allCheckboxPlaygroundTestIds();
