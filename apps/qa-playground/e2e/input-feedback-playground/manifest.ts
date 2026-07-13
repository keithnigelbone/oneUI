/**
 * Anchors from `InputFeedbackQaShowcase.tsx` / `inputFeedbackQaScenarios.tsx`.
 * Component type: **display** (live region message row — not focusable; controls panel is interactive).
 */

export const INPUT_FEEDBACK_PLAYGROUND_ROUTE = '/c/input-feedback';

export const IFB_COMPONENT_TYPE = 'display' as const;

export const IFB_SHOWCASE_AXE_SCOPE = '[data-section^="input-feedback-qa"]';

export const IFB_FIGMA_SIZES = ['S', 'M', 'L'] as const;

export const IFB_VARIANTS = ['negative', 'positive', 'warning', 'informative'] as const;

export const IFB_ATTENTIONS = ['low', 'medium', 'high'] as const;

/** Figma Validation tab (separate from Test Scenarios). */
export const IFB_FIGMA_VALIDATION_SECTION = 'input-feedback-qa-figma-validation-matrix';

export const IFB_FIGMA_VALIDATION_TAB_LABEL = 'InputFeedback - Figma Validation';

export const IFB_FIGMA_MATRIX_MESSAGE = 'message here...';

export const IFB_FIGMA_SIZE_LABELS = ['M', 'S', 'L'] as const;

export const IFB_FIGMA_SHOWCASE_AXE_SCOPE = `[data-section="${IFB_FIGMA_VALIDATION_SECTION}"]`;

export function ifbFigmaCellTestId(
  variant: (typeof IFB_VARIANTS)[number],
  sizeLabel: (typeof IFB_FIGMA_SIZE_LABELS)[number],
  attention: (typeof IFB_ATTENTIONS)[number],
): string {
  return `figma-input-feedback-${variant}-sz-${sizeLabel}-att-${attention}`;
}

/** Single COMPONENT_SET table on the Figma Validation tab. */
export const IFB_FIGMA_GRID_TESTID = 'figma-input-feedback-grid';

function buildIfbFigmaCellTestIds(): string[] {
  const ids: string[] = [];
  for (const variant of IFB_VARIANTS) {
    for (const sizeLabel of IFB_FIGMA_SIZE_LABELS) {
      for (const attention of IFB_ATTENTIONS) {
        ids.push(ifbFigmaCellTestId(variant, sizeLabel, attention));
      }
    }
  }
  return ids;
}

/** 36 cells — type × size (M,S,L) × attention. */
export const IFB_FIGMA_CELL_TESTIDS = buildIfbFigmaCellTestIds();

export const IFB_SIZE_CODE: Record<(typeof IFB_FIGMA_SIZES)[number], 's' | 'm' | 'l'> = {
  S: 's',
  M: 'm',
  L: 'l',
};

export const IFB_SIZE_DATA: Record<(typeof IFB_FIGMA_SIZES)[number], '8' | '10' | '12'> = {
  S: '8',
  M: '10',
  L: '12',
};

export const IFB_ROOT_TESTIDS = {
  default: 'input-feedback-default',
  allProps: 'input-feedback-all-props',
  controlsPanel: 'input-feedback-controls-panel',
  controlsLive: 'input-feedback-controls-live',
} as const;

export function ifbSizeTestId(figma: (typeof IFB_FIGMA_SIZES)[number]): string {
  return `input-feedback-size-${figma}`;
}

export function ifbAttentionTestId(attention: (typeof IFB_ATTENTIONS)[number]): string {
  return `input-feedback-attention-${attention}`;
}

export function ifbVariantTestId(variant: (typeof IFB_VARIANTS)[number]): string {
  return `input-feedback-variant-${variant}`;
}

export function ifbMatrixTestId(
  variant: (typeof IFB_VARIANTS)[number],
  attention: (typeof IFB_ATTENTIONS)[number],
): string {
  return `input-feedback-matrix-${variant}-${attention}`;
}

export const IFB_CUSTOM_ICON_TESTIDS = [
  'input-feedback-custom-icon-help',
  'input-feedback-custom-icon-lock',
] as const;

export const IFB_COMBO_TESTIDS = [
  'input-feedback-combo-0',
  'input-feedback-combo-1',
  'input-feedback-combo-2',
  'input-feedback-combo-3',
] as const;

export const IFB_CTRL_TESTIDS = {
  sizeS: 'input-feedback-ctrl-size-S',
  sizeM: 'input-feedback-ctrl-size-M',
  sizeL: 'input-feedback-ctrl-size-L',
  attentionLow: 'input-feedback-ctrl-attention-low',
  attentionMedium: 'input-feedback-ctrl-attention-medium',
  attentionHigh: 'input-feedback-ctrl-attention-high',
  variantNegative: 'input-feedback-ctrl-variant-negative',
  variantPositive: 'input-feedback-ctrl-variant-positive',
  variantWarning: 'input-feedback-ctrl-variant-warning',
  variantInformative: 'input-feedback-ctrl-variant-informative',
  message: 'input-feedback-ctrl-message',
  customIcon: 'input-feedback-ctrl-custom-icon',
} as const;

/** `QaStoryBand` `id` → `data-section` (Test Scenarios tab). */
export const IFB_DATA_SECTIONS = [
  'input-feedback-qa-default',
  'input-feedback-qa-all-props',
  'input-feedback-qa-size',
  'input-feedback-qa-attention',
  'input-feedback-qa-variant',
  'input-feedback-qa-custom-icon',
  'input-feedback-qa-matrix',
  'input-feedback-qa-combos',
  'input-feedback-qa-controls',
] as const;

export const IFB_SECTION_COUNT = IFB_DATA_SECTIONS.length;

/**
 * Bands excluded from strict band-level overflow checks:
 * - matrix/combos: dense grids
 * - default: long message copy at 320px
 */
export const IFB_REFLOW_SKIP_SECTIONS = [
  'input-feedback-qa-default',
  'input-feedback-qa-matrix',
  'input-feedback-qa-combos',
] as const;

function buildScenarioTestIds(): string[] {
  const ids: string[] = [
    IFB_ROOT_TESTIDS.default,
    IFB_ROOT_TESTIDS.allProps,
    ...IFB_FIGMA_SIZES.map((f) => ifbSizeTestId(f)),
    ...IFB_ATTENTIONS.map((a) => ifbAttentionTestId(a)),
    ...IFB_VARIANTS.map((v) => ifbVariantTestId(v)),
    ...IFB_CUSTOM_ICON_TESTIDS,
    ...IFB_VARIANTS.flatMap((v) => IFB_ATTENTIONS.map((a) => ifbMatrixTestId(v, a))),
    ...IFB_COMBO_TESTIDS,
  ];
  return ids;
}

/** Every scenario `data-testid` on the Test Scenarios tab (wrapper around `InputFeedback`). */
export const IFB_SCENARIO_TESTIDS = buildScenarioTestIds();

/** Scenario mounts + controls panel testids. */
export const IFB_ALL_TESTIDS = [
  ...IFB_SCENARIO_TESTIDS,
  IFB_ROOT_TESTIDS.controlsPanel,
  IFB_ROOT_TESTIDS.controlsLive,
  ...Object.values(IFB_CTRL_TESTIDS),
] as const;

export const IFB_AXE_TARGET_TESTIDS = [
  IFB_ROOT_TESTIDS.default,
  IFB_ROOT_TESTIDS.allProps,
  ifbSizeTestId('M'),
  ifbAttentionTestId('high'),
  ifbVariantTestId('negative'),
  ifbVariantTestId('positive'),
  ifbMatrixTestId('warning', 'medium'),
  'input-feedback-custom-icon-help',
  IFB_COMBO_TESTIDS[0],
  IFB_ROOT_TESTIDS.controlsLive,
] as const;
