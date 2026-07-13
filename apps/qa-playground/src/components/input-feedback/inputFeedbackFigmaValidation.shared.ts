import type { InputFeedbackAttention, InputFeedbackSize, InputFeedbackVariant } from '@oneui/ui/components/Input';

/** Copy on every Figma COMPONENT_SET cell. */
export const IFB_FIGMA_MATRIX_MESSAGE = 'message here...';

export const IFB_FIGMA_VALIDATION_SECTION_ID = 'input-feedback-qa-figma-validation-matrix';

export const IFB_FIGMA_VALIDATION_TAB_LABEL = 'InputFeedback - Figma Validation';

/** Single COMPONENT_SET table (all types in one grid). */
export const IFB_FIGMA_GRID_TESTID = 'figma-input-feedback-grid';

export const IFB_FIGMA_SPEC_DESCRIPTION =
  "A InputFeedback provides contextual information or validation messages related to the user's input.";

export const IFB_FIGMA_DNA_PATH = '.DNA/InputFeedback';

/** Figma row order per type band: M, S, L. */
export const IFB_FIGMA_SIZE_ROWS: { size: InputFeedbackSize; label: 'M' | 'S' | 'L' }[] = [
  { size: 'm', label: 'M' },
  { size: 's', label: 'S' },
  { size: 'l', label: 'L' },
];

export const IFB_FIGMA_ATTENTION_COLS: readonly InputFeedbackAttention[] = ['low', 'medium', 'high'];

export const IFB_FIGMA_TYPE_VARIANTS: readonly InputFeedbackVariant[] = [
  'negative',
  'positive',
  'warning',
  'informative',
];

export type IfbFigmaMatrixRow = {
  variant: InputFeedbackVariant;
  size: InputFeedbackSize;
  sizeLabel: 'M' | 'S' | 'L';
  isFirstInType: boolean;
};

/** 12 rows — four types × three sizes (M, S, L per type). */
export const IFB_FIGMA_MATRIX_ROWS: IfbFigmaMatrixRow[] = IFB_FIGMA_TYPE_VARIANTS.flatMap((variant) =>
  IFB_FIGMA_SIZE_ROWS.map(({ size, label }, index) => ({
    variant,
    size,
    sizeLabel: label,
    isFirstInType: index === 0,
  })),
);

export function ifbFigmaCellTestId(
  variant: InputFeedbackVariant,
  sizeLabel: 'M' | 'S' | 'L',
  attention: InputFeedbackAttention,
): string {
  return `figma-input-feedback-${variant}-sz-${sizeLabel}-att-${attention}`;
}
