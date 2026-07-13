/**
 * Anchors derived from `CheckboxFieldQaShowcase.tsx`.
 *
 * `data-section` values map 1-to-1 with `QaStoryBand id` props.
 * `data-testid` values that actually reach the DOM are only on
 * standalone `<Checkbox>` children inside multi-option fields (not
 * on `<CheckboxField>` itself, which does not spread `...rest`).
 *
 * Component type: **interactive** (composite field — checkbox + label + feedback).
 */

export const CHECKBOX_FIELD_PLAYGROUND_ROUTE = '/c/checkbox-field';

/** CSS scope for axe runs — story bands with `data-section`. */
export const CHECKBOX_FIELD_SHOWCASE_AXE_SCOPE = '[data-section^="checkboxfield-qa-"]';

/** Every `QaStoryBand` id in `CheckboxFieldQaShowcase.tsx`. */
export const CHECKBOX_FIELD_DATA_SECTIONS = [
  'checkboxfield-qa-default',
  'checkboxfield-qa-size',
  'checkboxfield-qa-appearance',
  'checkboxfield-qa-checked',
  'checkboxfield-qa-readonly',
  'checkboxfield-qa-disabled',
  'checkboxfield-qa-label',
  'checkboxfield-qa-feedback',
  'checkboxfield-qa-dynamic-text',
  'checkboxfield-qa-multi',
  'checkboxfield-qa-fullwidth',
  'checkboxfield-qa-realworld',
  'checkboxfield-qa-edge-cases',
  'checkboxfield-qa-surface',
  'checkboxfield-qa-a11y',
  'checkboxfield-qa-combos',
] as const;

export type CheckboxFieldSection = (typeof CHECKBOX_FIELD_DATA_SECTIONS)[number];

export const CHECKBOX_FIELD_SECTION_COUNT = CHECKBOX_FIELD_DATA_SECTIONS.length;

/** `data-testid` values that are on `<Checkbox>` children (reach the DOM). */
export const CHECKBOX_FIELD_MULTI_OPTION_TESTIDS = {
  /* Band 9 – multi-option default */
  multiNews: 'checkboxfield-multi-news',
  multiTips: 'checkboxfield-multi-tips',
  multiResearch: 'checkboxfield-multi-research',
  /* Band 9 – fragment children */
  multiFragA: 'checkboxfield-multi-frag-a',
  multiFragB: 'checkboxfield-multi-frag-b',
  multiFragC: 'checkboxfield-multi-frag-c',
  /* Band 11 – controlled multi-option group options */
  optionNews: 'checkboxfield-option-news',
  optionTips: 'checkboxfield-option-tips',
  optionResearch: 'checkboxfield-option-research',
  /* Band 14 – a11y group options */
  a11yOptA: 'checkboxfield-a11y-opt-a',
  a11yOptB: 'checkboxfield-a11y-opt-b',
} as const;

/** `data-testid` values on plain HTML elements (reach the DOM). */
export const CHECKBOX_FIELD_PLAIN_TESTIDS = {
  /* Band 11 – controlled single state display */
  controlledSingleState: 'checkboxfield-controlled-single-state',
  /* Band 11 – controlled multi state display */
  controlledMultiState: 'checkboxfield-controlled-multi-state',
} as const;

export const CHECKBOX_FIELD_SIZES = ['s', 'm', 'l'] as const;

/** Figma API appearances in showcase order. */
export const CHECKBOX_FIELD_APPEARANCES = [
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

export const CHECKBOX_FIELD_COMBO_COUNT = 8;

export const CHECKBOX_FIELD_FIGMA_VALIDATION_TAB = 'Figma Validation';

/** Table roots on `CheckboxFieldFigmaValidationGrid.tsx` (cells omit testid — `CheckboxField` does not forward). */
export const CHECKBOX_FIELD_FIGMA_GRID_TESTIDS = {
  root: 'checkboxfield-figma-validation-root',
  state: 'figma-checkboxfield-state-grid',
  size: 'figma-checkboxfield-size-grid',
  feedback: 'figma-checkboxfield-feedback-grid',
  dynamic: 'figma-checkboxfield-dynamic-grid',
  multi: 'figma-checkboxfield-multi-grid',
} as const;

/** Scoped axe include for the Figma Validation tab only (not full playground). */
export const CHECKBOX_FIELD_FIGMA_AXE_SCOPE =
  `[data-testid="${CHECKBOX_FIELD_FIGMA_GRID_TESTIDS.root}"]`;
