/**
 * Anchors from `SliderQaShowcase.tsx` — keep in sync when the showcase changes.
 * Component type: input (range slider — role="slider", aria-valuenow/min/max).
 */

export const SLIDER_COMPONENT_TYPE = 'input' as const;

export const SLIDER_SHOWCASE_AXE_SCOPE = '[data-section^="slider-qa-"]';

export const SLIDER_PLAYGROUND_ROUTE = '/c/slider';

export const SLIDER_FIGMA_APPEARANCES = [
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

export const SLIDER_KNOB_STYLES = ['outside', 'inside'] as const;

export const SLIDER_COMBO_COUNT = 6;

/** `data-section` values from `QaStoryBand` `id` props (exact). */
export const SLIDER_DATA_SECTIONS = [
  'slider-qa-default',
  'slider-qa-type',
  'slider-qa-knob-style',
  'slider-qa-appearance',
  'slider-qa-steps',
  'slider-qa-start-end',
  'slider-qa-value',
  'slider-qa-extra-states',
  'slider-qa-surface-context',
  'slider-qa-combos',
] as const;

export const SLIDER_SECTION_COUNT = SLIDER_DATA_SECTIONS.length;

export function sliderAppearanceTestId(appearance: string): string {
  return `slider-appearance-${appearance}`;
}

export function sliderKnobTestId(knobStyle: (typeof SLIDER_KNOB_STYLES)[number]): string {
  return `slider-knob-${knobStyle}`;
}

export function sliderComboTestId(index: number): string {
  return `slider-combo-${index}`;
}

/** Every `data-testid` mounted by the Test Scenarios showcase. */
export function buildSliderAllTestIds(): string[] {
  const out: string[] = [
    'slider-default',
    'slider-code-default-outside',
    'slider-type-continuous',
    'slider-type-range',
    'slider-knob-range-outside',
    'slider-knob-range-inside',
    'slider-steps-false',
    'slider-steps-true-stepcount-5',
    'slider-steps-true-stepcount-11',
    'slider-snap-false',
    'slider-start-end-none',
    'slider-start-end-icon',
    'slider-start-end-iconbutton-continuous',
    'slider-start-end-iconbutton-range',
    'slider-start-end-iconbutton-inside',
    'slider-value-controlled-single',
    'slider-value-controlled-range',
    'slider-disabled',
    'slider-readonly',
    'slider-orientation-vertical',
    'slider-tooltip-always',
    'slider-surface-default',
    'slider-surface-subtle',
    'slider-surface-bold',
  ];

  for (const knobStyle of SLIDER_KNOB_STYLES) {
    out.push(sliderKnobTestId(knobStyle));
  }

  for (const appearance of SLIDER_FIGMA_APPEARANCES) {
    out.push(sliderAppearanceTestId(appearance));
  }
  out.push('slider-appearance-brand-bg');

  for (let i = 0; i < SLIDER_COMBO_COUNT; i += 1) {
    out.push(sliderComboTestId(i));
  }

  return out;
}

export const SLIDER_ALL_TESTIDS = buildSliderAllTestIds();

export const SLIDER_SMOKE_TESTID = 'slider-default';

/** Representative cells for scoped axe runs. */
export const SLIDER_AXE_TARGET_TESTIDS = [
  'slider-default',
  'slider-type-continuous',
  'slider-type-range',
  sliderKnobTestId('inside'),
  sliderAppearanceTestId('primary'),
  'slider-steps-true-stepcount-5',
  'slider-start-end-iconbutton-continuous',
  'slider-disabled',
  'slider-readonly',
  sliderComboTestId(0),
] as const;
