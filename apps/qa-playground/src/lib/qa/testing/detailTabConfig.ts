import type { SemanticIconName } from '@oneui/shared';

export type QaDetailTabId =
  | 'scenarios'
  | 'figma'
  | 'accessibility'
  | 'functional'
  | 'dividerFigmaValidation'
  | 'radioFigmaValidation'
  | 'radioFieldFigmaValidation'
  | 'inputFeedbackFigmaValidation'
  | 'inputFieldFigmaValidation';

export const QA_DETAIL_TAB_ICONS: Record<QaDetailTabId, SemanticIconName> = {
  scenarios: 'components',
  figma: 'layers',
  accessibility: 'eye',
  functional: 'list',
  dividerFigmaValidation: 'palette',
  radioFigmaValidation: 'palette',
  radioFieldFigmaValidation: 'palette',
  inputFeedbackFigmaValidation: 'palette',
  inputFieldFigmaValidation: 'edit',
};
