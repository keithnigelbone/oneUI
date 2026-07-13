/**
 * Anchors from `InputFieldQaShowcase.tsx` / `inputFieldQaScenarios.tsx`.
 * Component type: **interactive** (text input inside `Field.Root`).
 */

export const INPUT_FIELD_PLAYGROUND_ROUTE = '/c/input-field';

export const IFF_COMPONENT_TYPE = 'interactive' as const;

/** Test Scenarios tab story bands (excludes Figma Validation tab section). */
export const IFF_SHOWCASE_AXE_SCOPE = '[data-section^="input-field-qa"]:not([data-section="input-field-qa-figma-validation-matrix"])';

/** Figma Validation tab (`InputFieldFigmaValidationShowcase`). */
export const IFF_FIGMA_VALIDATION_SECTION = 'input-field-qa-figma-validation-matrix';

export const IFF_FIGMA_VALIDATION_TAB_LABEL = 'InputField - Figma Validation';

export const IFF_FIGMA_LABEL = 'Label';

export const IFF_FIGMA_PLACEHOLDER = 'Placeholder';

export const IFF_FIGMA_GRID_TESTID = 'figma-input-field-grid';

export const IFF_FIGMA_SIZE_LABELS = ['M', 'S', 'L'] as const;

export const IFF_FIGMA_SIZE_CODE: Record<(typeof IFF_FIGMA_SIZE_LABELS)[number], '8' | '10' | '12'> = {
  S: '8',
  M: '10',
  L: '12',
};

export const IFF_FIGMA_SHOWCASE_AXE_SCOPE = `[data-section="${IFF_FIGMA_VALIDATION_SECTION}"]`;

export function iffFigmaCellTestId(sizeLabel: (typeof IFF_FIGMA_SIZE_LABELS)[number]): string {
  return `figma-input-field-sz-${sizeLabel}`;
}

export const IFF_FIGMA_CELL_TESTIDS = IFF_FIGMA_SIZE_LABELS.map((label) => iffFigmaCellTestId(label));

export const IFF_FIGMA_SIZES = ['S', 'M', 'L'] as const;

/** Numeric size on bordered `Input` container. */
export const IFF_SIZE_DATA: Record<(typeof IFF_FIGMA_SIZES)[number], '8' | '10' | '12'> = {
  S: '8',
  M: '10',
  L: '12',
};

/** Letter tier on label stack (`FieldLabelStack`). */
export const IFF_LABEL_SIZE_DATA: Record<(typeof IFF_FIGMA_SIZES)[number], 's' | 'm' | 'l'> = {
  S: 's',
  M: 'm',
  L: 'l',
};

export const IFF_PAIRWISE_KEYS = [
  'label-required',
  'label-description',
  'label-info-icon',
  'feedback-dynamic',
  'feedback-disabled',
  'description-feedback',
  'description-dynamic',
] as const;

export const IFF_PAIRWISE_SUFFIXES = ['ff', 'ft', 'tf', 'tt'] as const;

export const IFF_ROOT_TESTIDS = {
  default: 'input-field-default',
  allProps: 'input-field-all-props',
  controlsPanel: 'input-field-controls-panel',
  controlsLive: 'input-field-controls-live',
} as const;

export function iffSizeTestId(figma: (typeof IFF_FIGMA_SIZES)[number]): string {
  return `input-field-size-${figma}`;
}

export const IFF_INPUT_SLOT_TESTIDS = [
  'input-field-slot-start',
  'input-field-slot-end',
  'input-field-slot-start-end',
  'input-field-slot-start2',
  'input-field-slot-end2',
  'input-field-slot-all-four',
] as const;

export const IFF_INPUT_CHROME_TESTIDS = [
  'input-field-chrome-attention-medium',
  'input-field-chrome-attention-high',
  'input-field-chrome-shape-default',
  'input-field-chrome-shape-pill',
  'input-field-chrome-readonly',
  'input-field-chrome-invalid',
  'input-field-chrome-full-width',
] as const;

export const IFF_APPEARANCE_ROLES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

export function iffAppearanceTestId(role: (typeof IFF_APPEARANCE_ROLES)[number]): string {
  return `input-field-appearance-${role}`;
}

export const IFF_APPEARANCE_TESTIDS = IFF_APPEARANCE_ROLES.map((r) => iffAppearanceTestId(r));

export const IFF_INPUT_TYPE_TESTIDS = [
  'input-field-type-email',
  'input-field-type-password',
  'input-field-type-number',
  'input-field-type-tel',
  'input-field-type-url',
  'input-field-type-search',
] as const;

export const IFF_FIELD_SLOT_TESTIDS = [
  'input-field-field-slot-feedback',
  'input-field-field-slot-dynamic',
  'input-field-field-slot-label',
  'input-field-field-slot-full-stack',
  'input-field-field-slot-figma-composition',
] as const;

export const IFF_ISOLATE_TESTIDS = [
  'input-field-no-label',
  'input-field-required',
  'input-field-info-icon',
  'input-field-description',
  'input-field-feedback',
  'input-field-dynamic-text',
  'input-field-disabled',
] as const;

export const IFF_EDGE_TESTIDS = [
  'input-field-edge-long-label',
  'input-field-edge-long-description',
  'input-field-edge-empty-value',
  'input-field-edge-required-no-label',
  'input-field-edge-info-icon-no-label',
  'input-field-edge-feedback-no-description',
  'input-field-edge-disabled-feedback',
  'input-field-edge-disabled-dynamic',
  'input-field-edge-minimal',
] as const;

export const IFF_PLAYGROUND_TESTIDS = [
  'input-field-playground-basic',
  'input-field-playground-required',
  'input-field-playground-description',
  'input-field-playground-info-icon',
  'input-field-playground-feedback',
  'input-field-playground-dynamic-text',
  'input-field-playground-disabled',
  'input-field-playground-size-large',
  'input-field-playground-size-small',
  'input-field-playground-all-content',
  'input-field-playground-no-content',
] as const;

export const IFF_A11Y_TESTIDS = [
  'input-field-a11y-aria-label',
  'input-field-a11y-required',
  'input-field-a11y-description',
  'input-field-a11y-disabled',
  'input-field-a11y-feedback',
] as const;

export function iffPairwiseTestId(
  pair: (typeof IFF_PAIRWISE_KEYS)[number],
  suffix: (typeof IFF_PAIRWISE_SUFFIXES)[number],
): string {
  return `input-field-pw-${pair}-${suffix}`;
}

function buildPairwiseTestIds(): string[] {
  const ids: string[] = [];
  for (const pair of IFF_PAIRWISE_KEYS) {
    for (const suffix of IFF_PAIRWISE_SUFFIXES) {
      ids.push(iffPairwiseTestId(pair, suffix));
    }
  }
  return ids;
}

export const IFF_PAIRWISE_TESTIDS = buildPairwiseTestIds();

export const IFF_CTRL_TESTIDS = {
  sizeS: 'input-field-ctrl-size-S',
  sizeM: 'input-field-ctrl-size-M',
  sizeL: 'input-field-ctrl-size-L',
  label: 'input-field-ctrl-label',
  required: 'input-field-ctrl-required',
  infoIcon: 'input-field-ctrl-info-icon',
  description: 'input-field-ctrl-description',
  feedback: 'input-field-ctrl-feedback',
  dynamicText: 'input-field-ctrl-dynamic-text',
  disabled: 'input-field-ctrl-disabled',
  labelText: 'input-field-ctrl-label-text',
} as const;

/** `QaStoryBand` `id` → `data-section` (Test Scenarios tab). */
export const IFF_DATA_SECTIONS = [
  'input-field-qa-default',
  'input-field-qa-all-props',
  'input-field-qa-size',
  'input-field-qa-input-slots',
  'input-field-qa-input-chrome',
  'input-field-qa-appearance',
  'input-field-qa-input-types',
  'input-field-qa-field-slots',
  'input-field-qa-isolates',
  'input-field-qa-edge',
  'input-field-qa-playground',
  'input-field-qa-pairwise',
  'input-field-qa-a11y',
  'input-field-qa-controls',
] as const;

export const IFF_SECTION_COUNT = IFF_DATA_SECTIONS.length;

export const IFF_REFLOW_SKIP_SECTIONS = [
  'input-field-qa-edge',
  'input-field-qa-pairwise',
  'input-field-qa-playground',
  'input-field-qa-appearance',
  'input-field-qa-field-slots',
] as const;

function buildScenarioTestIds(): string[] {
  return [
    IFF_ROOT_TESTIDS.default,
    IFF_ROOT_TESTIDS.allProps,
    ...IFF_FIGMA_SIZES.map((f) => iffSizeTestId(f)),
    ...IFF_INPUT_SLOT_TESTIDS,
    ...IFF_INPUT_CHROME_TESTIDS,
    ...IFF_APPEARANCE_TESTIDS,
    ...IFF_INPUT_TYPE_TESTIDS,
    ...IFF_FIELD_SLOT_TESTIDS,
    ...IFF_ISOLATE_TESTIDS,
    ...IFF_EDGE_TESTIDS,
    ...IFF_PLAYGROUND_TESTIDS,
    ...IFF_PAIRWISE_TESTIDS,
    ...IFF_A11Y_TESTIDS,
  ];
}

export const IFF_SCENARIO_TESTIDS = buildScenarioTestIds();

export const IFF_ALL_TESTIDS = [
  ...IFF_SCENARIO_TESTIDS,
  IFF_ROOT_TESTIDS.controlsPanel,
  IFF_ROOT_TESTIDS.controlsLive,
  ...Object.values(IFF_CTRL_TESTIDS),
] as const;

export const IFF_AXE_TARGET_TESTIDS = [
  IFF_ROOT_TESTIDS.default,
  IFF_ROOT_TESTIDS.allProps,
  iffSizeTestId('M'),
  'input-field-slot-start',
  'input-field-slot-all-four',
  iffAppearanceTestId('primary'),
  iffAppearanceTestId('negative'),
  'input-field-chrome-invalid',
  'input-field-chrome-readonly',
  'input-field-required',
  'input-field-info-icon',
  'input-field-feedback',
  'input-field-field-slot-full-stack',
  'input-field-a11y-required',
  iffPairwiseTestId('label-required', 'tt'),
  IFF_ROOT_TESTIDS.controlsLive,
] as const;

/** Playground inventory — keep in sync with `inputFieldQaScenarios.tsx`. */
export const IFF_PLAYGROUND_INVENTORY = {
  componentType: IFF_COMPONENT_TYPE,
  route: INPUT_FIELD_PLAYGROUND_ROUTE,
  sectionCount: IFF_SECTION_COUNT,
  scenarioCount: IFF_SCENARIO_TESTIDS.length,
  allTestIdCount: IFF_ALL_TESTIDS.length,
} as const;
