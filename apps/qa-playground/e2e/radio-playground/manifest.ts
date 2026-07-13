/**
 * Anchors from `RadioQaShowcase.tsx` — `data-testid` on `Radio` controls only.
 * `data-section` === band `id` from `QaStoryBand`.
 */

export const RADIO_PLAYGROUND_ROUTE = '/c/radio';

export const RADIO_COMPONENT_TYPE = 'interactive' as const;

export const RADIO_SHOWCASE_AXE_SCOPE = '[data-section^="radio-qa-"]';

/**
 * Known `@oneui/ui` Radio defect: readOnly emits `aria-readonly="true"` on `role="radio"`,
 * which WAI-ARIA does not allow (unlike `checkbox`). Exclude from axe until the component is fixed.
 */
export const RADIO_AXE_ARIA_READONLY_EXCLUDE = '[role="radio"][aria-readonly="true"]';

export const RADIO_DATA_SECTIONS = [
  'radio-qa-default',
  'radio-qa-size',
  'radio-qa-appearance',
  'radio-qa-accent',
  'radio-qa-selected',
  'radio-qa-readonly',
  'radio-qa-disabled',
  'radio-qa-combos',
] as const;

export const RADIO_SECTION_COUNT = RADIO_DATA_SECTIONS.length;

export const RADIO_FIGMA_SIZES = ['S', 'M', 'L'] as const;

export const RADIO_SIZE_ALIASES = ['small', 'medium', 'large'] as const;

export const RADIO_FIGMA_APPEARANCES = [
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

export const RADIO_ACCENTS = ['primary', 'secondary', 'sparkle'] as const;

export const RADIO_COMBO_COUNT = 7;

export const RADIO_ROOT_TESTIDS = {
  default: 'radio-default',
  selectedFalse: 'radio-selected-false',
  selectedTrue: 'radio-selected-true',
  readonlyFalseOff: 'radio-readonly-false-off',
  readonlyTrueOff: 'radio-readonly-true-off',
  readonlyTrueOn: 'radio-readonly-true-on',
  disabledFalseOff: 'radio-disabled-false-off',
  disabledTrueOff: 'radio-disabled-true-off',
  disabledTrueOn: 'radio-disabled-true-on',
} as const;

export function radioSizeTestId(figma: (typeof RADIO_FIGMA_SIZES)[number]): string {
  return `radio-size-${figma}`;
}

export function radioSizeAliasTestId(alias: (typeof RADIO_SIZE_ALIASES)[number]): string {
  return `radio-size-alias-${alias}`;
}

export function radioAppearanceTestId(
  appearance: (typeof RADIO_FIGMA_APPEARANCES)[number] | 'brand-bg',
  state: 'off' | 'on',
): string {
  return `radio-appearance-${appearance}-${state}`;
}

export function radioAccentPairTestId(accent: (typeof RADIO_ACCENTS)[number], state: 'off' | 'on'): string {
  return `radio-accent-${accent}-${state}`;
}

export function radioAccentNeutralTestId(accent: (typeof RADIO_ACCENTS)[number]): string {
  return `radio-accent-neutral-${accent}`;
}

export function radioComboTestId(index: number): string {
  return `radio-combo-${index}`;
}

/** Every `data-testid` declared in `RadioQaShowcase.tsx`. */
export function allRadioPlaygroundTestIds(): readonly string[] {
  const ids: string[] = [RADIO_ROOT_TESTIDS.default];

  for (const figma of RADIO_FIGMA_SIZES) {
    ids.push(radioSizeTestId(figma));
  }
  for (const alias of RADIO_SIZE_ALIASES) {
    ids.push(radioSizeAliasTestId(alias));
  }
  for (const appearance of RADIO_FIGMA_APPEARANCES) {
    ids.push(radioAppearanceTestId(appearance, 'off'));
    ids.push(radioAppearanceTestId(appearance, 'on'));
  }
  ids.push(radioAppearanceTestId('brand-bg', 'off'));
  ids.push(radioAppearanceTestId('brand-bg', 'on'));

  for (const accent of RADIO_ACCENTS) {
    ids.push(radioAccentPairTestId(accent, 'off'));
    ids.push(radioAccentPairTestId(accent, 'on'));
    ids.push(radioAccentNeutralTestId(accent));
  }

  ids.push(
    RADIO_ROOT_TESTIDS.selectedFalse,
    RADIO_ROOT_TESTIDS.selectedTrue,
    RADIO_ROOT_TESTIDS.readonlyFalseOff,
    RADIO_ROOT_TESTIDS.readonlyTrueOff,
    RADIO_ROOT_TESTIDS.readonlyTrueOn,
    RADIO_ROOT_TESTIDS.disabledFalseOff,
    RADIO_ROOT_TESTIDS.disabledTrueOff,
    RADIO_ROOT_TESTIDS.disabledTrueOn,
  );

  for (let i = 0; i < RADIO_COMBO_COUNT; i++) {
    ids.push(radioComboTestId(i));
  }

  return ids;
}

export const RADIO_ALL_TESTIDS = allRadioPlaygroundTestIds();
