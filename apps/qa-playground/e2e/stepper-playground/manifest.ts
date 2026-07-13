/**
 * Anchors from `StepperQaShowcase.tsx` — keep in sync when the showcase changes.
 * Component type: input (NumberField stepper — increment/decrement + text input).
 */

export const STEPPER_COMPONENT_TYPE = 'input' as const;

export const STEPPER_SHOWCASE_AXE_SCOPE = '[data-section^="stepper-qa-"]';

export const STEPPER_PLAYGROUND_ROUTE = '/c/stepper';

export const STEPPER_FIGMA_SIZES = ['S', 'M', 'L'] as const;

export const STEPPER_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const STEPPER_ACCENTS = ['primary', 'secondary', 'sparkle'] as const;

export const STEPPER_FIGMA_APPEARANCES = [
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

export const STEPPER_COMBO_COUNT = 8;

/** `data-section` values from `QaStoryBand` `id` props (exact). */
export const STEPPER_DATA_SECTIONS = [
  'stepper-qa-default',
  'stepper-qa-size',
  'stepper-qa-attention',
  'stepper-qa-appearance',
  'stepper-qa-accent',
  'stepper-qa-condensed',
  'stepper-qa-disabled',
  'stepper-qa-input-text',
  'stepper-qa-figma-code-slots',
  'stepper-qa-extra-states',
  'stepper-qa-combos',
] as const;

export const STEPPER_SECTION_COUNT = STEPPER_DATA_SECTIONS.length;

export function stepperSizeTestId(figma: (typeof STEPPER_FIGMA_SIZES)[number]): string {
  return `stepper-size-${figma}`;
}

export function stepperAttentionTestId(attention: (typeof STEPPER_ATTENTIONS)[number]): string {
  return `stepper-attention-${attention}`;
}

export function stepperAppearanceTestId(appearance: string): string {
  return `stepper-appearance-${appearance}`;
}

export function stepperAccentTestId(accent: (typeof STEPPER_ACCENTS)[number], attention: 'h' | 'm' | 'l'): string {
  return `stepper-accent-${accent}-${attention}`;
}

export function stepperComboTestId(index: number): string {
  return `stepper-combo-${index}`;
}

export function buildStepperAllTestIds(): string[] {
  const out: string[] = [
    'stepper-default',
    'stepper-condensed-false',
    'stepper-condensed-true',
    'stepper-disabled-false',
    'stepper-disabled-true',
    'stepper-input-aria-label',
    'stepper-readonly',
    'stepper-error',
    'stepper-required',
  ];

  for (const figma of STEPPER_FIGMA_SIZES) {
    out.push(stepperSizeTestId(figma));
  }
  for (const attention of STEPPER_ATTENTIONS) {
    out.push(stepperAttentionTestId(attention));
  }
  for (const appearance of STEPPER_FIGMA_APPEARANCES) {
    out.push(stepperAppearanceTestId(appearance));
  }
  out.push('stepper-appearance-brand-bg');

  for (const accent of STEPPER_ACCENTS) {
    for (const att of ['h', 'm', 'l'] as const) {
      out.push(stepperAccentTestId(accent, att));
    }
  }

  for (let i = 0; i < STEPPER_COMBO_COUNT; i += 1) {
    out.push(stepperComboTestId(i));
  }

  return out;
}

export const STEPPER_ALL_TESTIDS = buildStepperAllTestIds();

/** Default band — no `defaultValue` in showcase (field starts empty). Other bands often use `defaultValue={5}`. */
export const STEPPER_SMOKE_TESTID = 'stepper-default';

export const STEPPER_AXE_TARGET_TESTIDS = [
  'stepper-default',
  stepperSizeTestId('M'),
  stepperAttentionTestId('high'),
  stepperAppearanceTestId('primary'),
  stepperAccentTestId('primary', 'h'),
  'stepper-condensed-true',
  'stepper-disabled-true',
  'stepper-readonly',
  'stepper-error',
  stepperComboTestId(0),
] as const;

export const STEPPER_APPEARANCE_CONTRAST_TESTIDS = [
  'stepper-appearance-auto',
  'stepper-appearance-neutral',
  'stepper-appearance-primary',
  'stepper-appearance-secondary',
  'stepper-appearance-sparkle',
  'stepper-appearance-negative',
  'stepper-appearance-positive',
  'stepper-appearance-warning',
  'stepper-appearance-informative',
  'stepper-appearance-brand-bg',
] as const;
