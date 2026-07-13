/**
 * Anchors from `TouchSliderQaShowcase.tsx` + `TouchSliderFigmaValidationGrid.tsx`.
 * Component type: input (range slider — role="slider", aria-valuenow/min/max).
 */

export const TOUCH_SLIDER_COMPONENT_TYPE = 'input' as const;

export const TOUCH_SLIDER_PLAYGROUND_ROUTE = '/c/touch-slider';

export const TOUCH_SLIDER_SHOWCASE_AXE_SCOPE = '[data-section^="touch-slider-qa-"]';

export const TOUCH_SLIDER_SMOKE_TESTID = 'touch-slider-default';

export const FIGMA_VALIDATION_TAB = 'Figma Validation';
export const FIGMA_GRID_TESTID = 'figma-touch-slider-grid';
export const FIGMA_PARITY_CALLOUT_TESTID = 'touch-slider-figma-parity-callout';

export const TOUCH_SLIDER_FIGMA_VALUES = [0, 50, 100] as const;
export const TOUCH_SLIDER_FIGMA_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export const TOUCH_SLIDER_FIGMA_PROGRESS_STYLES = ['rounded', 'sharp'] as const;

export const TOUCH_SLIDER_FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
  'brand-bg',
] as const;

export const TOUCH_SLIDER_COMBO_COUNT = 6;

/** `QaStoryBand` `id` → `data-section` (exact). */
export const TOUCH_SLIDER_DATA_SECTIONS = [
  'touch-slider-qa-figma-visual-gaps',
  'touch-slider-qa-default',
  'touch-slider-qa-orientation',
  'touch-slider-qa-progress-style',
  'touch-slider-qa-appearance',
  'touch-slider-qa-value',
  'touch-slider-qa-slots',
  'touch-slider-qa-states',
  'touch-slider-qa-edge',
  'touch-slider-qa-surface',
  'touch-slider-qa-interaction',
  'touch-slider-qa-combos',
] as const;

export const TOUCH_SLIDER_SECTION_COUNT = TOUCH_SLIDER_DATA_SECTIONS.length;

export function figmaCellTestId(
  value: number,
  orientation: string,
  progressStyle: string,
): string {
  return `ts-figma-val-${value}-ori-${orientation}-prog-${progressStyle}`;
}

export function touchSliderComboTestId(index: number): string {
  return `touch-slider-combo-${index}`;
}

export function touchSliderAppearanceTestId(appearance: string): string {
  return `touch-slider-appearance-${appearance}`;
}

/** Every `data-testid` on Test Scenarios tab (exact from showcase). */
export function buildTouchSliderAllTestIds(): string[] {
  const out: string[] = [
    'touch-slider-default',
    'touch-slider-controlled-volume',
    'touch-slider-orientation-horizontal',
    'touch-slider-orientation-vertical',
    'touch-slider-progress-rounded',
    'touch-slider-progress-sharp',
    'touch-slider-value-0',
    'touch-slider-value-50',
    'touch-slider-value-100',
    'touch-slider-value-37',
    'touch-slider-slots-none',
    'touch-slider-slots-start',
    'touch-slider-disabled',
    'touch-slider-readonly',
    'touch-slider-edge-min-max-0-10',
    'touch-slider-edge-step-0-5',
    'touch-slider-edge-focus-forced',
    'touch-slider-interaction-demo',
  ];

  for (const appearance of TOUCH_SLIDER_FIGMA_APPEARANCES) {
    out.push(touchSliderAppearanceTestId(appearance));
  }

  for (const mode of ['default', 'subtle', 'bold'] as const) {
    out.push(`touch-slider-surface-${mode}`);
  }

  for (let i = 0; i < TOUCH_SLIDER_COMBO_COUNT; i += 1) {
    out.push(touchSliderComboTestId(i));
  }

  return out;
}

export const TOUCH_SLIDER_ALL_TESTIDS = buildTouchSliderAllTestIds();

export const TOUCH_SLIDER_FIGMA_CELL_TESTIDS = TOUCH_SLIDER_FIGMA_VALUES.flatMap((value) =>
  TOUCH_SLIDER_FIGMA_ORIENTATIONS.flatMap((orientation) =>
    TOUCH_SLIDER_FIGMA_PROGRESS_STYLES.map((progressStyle) =>
      figmaCellTestId(value, orientation, progressStyle),
    ),
  ),
);

export const TOUCH_SLIDER_AXE_TARGET_TESTIDS = [
  'touch-slider-default',
  'touch-slider-orientation-vertical',
  'touch-slider-disabled',
  'touch-slider-readonly',
  'touch-slider-interaction-demo',
  'touch-slider-combo-0',
  'touch-slider-appearance-primary',
] as const;

export const TOUCH_SLIDER_APPEARANCE_CONTRAST_TESTIDS = TOUCH_SLIDER_FIGMA_APPEARANCES.map((a) =>
  touchSliderAppearanceTestId(a),
);

export const TOUCH_SLIDER_BUG_ID = 'BUG-TOUCHSLIDER-001';
export const TOUCH_SLIDER_BUG_BAND = 'touch-slider-qa-default';
/** BUG-TOUCHSLIDER-001 — exclude native range inputs from broad WCAG scans; label covered by dedicated test. */
export const TOUCH_SLIDER_AXE_INPUT_EXCLUDE =
  '[data-section^="touch-slider-qa-"] input[type="range"], [data-testid="figma-touch-slider-grid"] input[type="range"]';
