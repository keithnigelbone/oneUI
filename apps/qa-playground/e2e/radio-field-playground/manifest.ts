/**
 * Anchors from `RadioFieldQaShowcase.tsx` / `radioFieldQaScenarios.tsx`.
 * One integrated `RadioField` per scenario unless noted (accent, group-shell).
 */

export const RADIO_FIELD_PLAYGROUND_ROUTE = '/c/radio-field';

export const RADIO_FIELD_COMPONENT_TYPE = 'interactive' as const;

export const RADIO_FIELD_SHOWCASE_AXE_SCOPE = '[data-section^="radio-field-qa"]';

export const RADIO_FIELD_SMOKE_TESTID = 'radio-field-default';

export const RADIO_FIELD_DATA_SECTIONS = [
  'radio-field-qa-default',
  'radio-field-qa-all-props',
  'radio-field-qa-label',
  'radio-field-qa-description',
  'radio-field-qa-required',
  'radio-field-qa-info-icon',
  'radio-field-qa-feedback',
  'radio-field-qa-dynamic-text',
  'radio-field-qa-description-feedback',
  'radio-field-qa-checked',
  'radio-field-qa-disabled',
  'radio-field-qa-disabled-checked',
  'radio-field-qa-readonly',
  'radio-field-qa-appearance',
  'radio-field-qa-accent',
  'radio-field-qa-size',
  'radio-field-qa-a11y',
  'radio-field-qa-group-shell',
] as const;

export const RADIO_FIELD_SECTION_COUNT = RADIO_FIELD_DATA_SECTIONS.length;

/** Flex-row bands with multiple mounts — excluded from per-mount reflow overflow checks. */
export const RADIO_FIELD_REFLOW_SKIP_SECTIONS = [
  'radio-field-qa-appearance',
  'radio-field-qa-accent',
  'radio-field-qa-size',
  'radio-field-qa-a11y',
] as const;

export const RADIO_FIELD_APPEARANCE_ROLES = [
  'primary',
  'secondary',
  'positive',
  'negative',
  'warning',
  'informative',
  'neutral',
] as const;

export const RADIO_FIELD_ACCENTS = ['primary', 'secondary', 'sparkle'] as const;

export const RADIO_FIELD_SIZES = ['s', 'm', 'l'] as const;

export function radioFieldAppearanceTestId(appearance: string): string {
  return `radio-field-appearance-${appearance}`;
}

export function radioFieldAccentTestId(accent: string): string {
  return `radio-field-accent-${accent}`;
}

export function radioFieldSizeTestId(size: string): string {
  return `radio-field-size-${size}`;
}

/** Figma validation matrix (separate tab). */
export function radioFieldFigmaCellTestId(row: number, col: number): string {
  return `figma-radio-field-r${row}-c${col}`;
}

/** Every `data-testid` on Test Scenarios tab (`radioFieldQaScenarios.tsx`). */
export function buildRadioFieldAllTestIds(): string[] {
  const ids: string[] = [
    'radio-field-default',
    'radio-field-all-props',
    'radio-field-label',
    'radio-field-description',
    'radio-field-description-long',
    'radio-field-required',
    'radio-field-info-icon',
    'radio-field-feedback',
    'radio-field-dynamic-text',
    'radio-field-description-feedback',
    'radio-field-checked',
    'radio-field-disabled',
    'radio-field-disabled-checked',
    'radio-field-readonly',
    'radio-field-a11y-aria-label',
    'radio-field-a11y-required',
    'radio-field-a11y-disabled',
    'radio-field-a11y-keyboard',
    'radio-field-group-shell',
  ];

  for (const appearance of RADIO_FIELD_APPEARANCE_ROLES) {
    ids.push(radioFieldAppearanceTestId(appearance));
  }
  for (const accent of RADIO_FIELD_ACCENTS) {
    ids.push(radioFieldAccentTestId(accent));
  }
  for (const size of RADIO_FIELD_SIZES) {
    ids.push(radioFieldSizeTestId(size));
  }

  return ids;
}

export const RADIO_FIELD_ALL_TESTIDS = buildRadioFieldAllTestIds();

export const RADIO_FIELD_ALL_TESTID_COUNT = RADIO_FIELD_ALL_TESTIDS.length;

/** Preserved spot-check anchors — update only with intent. */
export const RADIO_FIELD_PRESERVED_TESTIDS = [
  RADIO_FIELD_SMOKE_TESTID,
  'radio-field-checked',
  'radio-field-required',
  'radio-field-disabled-checked',
  'radio-field-readonly',
  'radio-field-appearance-primary',
  'radio-field-a11y-keyboard',
  'radio-field-group-shell',
] as const;

/** Per-mount axe targets (representative states). */
export const RADIO_FIELD_AXE_TARGET_TESTIDS = [
  RADIO_FIELD_SMOKE_TESTID,
  'radio-field-checked',
  'radio-field-required',
  radioFieldAppearanceTestId('primary'),
  radioFieldAppearanceTestId('negative'),
  radioFieldAccentTestId('sparkle'),
  radioFieldSizeTestId('m'),
  'radio-field-disabled-checked',
  'radio-field-readonly',
  'radio-field-a11y-aria-label',
  'radio-field-group-shell',
] as const;
