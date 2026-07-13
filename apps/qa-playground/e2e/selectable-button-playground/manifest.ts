/**
 * Anchors from `SelectableButtonQaShowcase.tsx` — `data-testid` on wrapper spans (or state label).
 * `data-section` === band `id` from `QaStoryBand`.
 */

export const SELECTABLE_BUTTON_PLAYGROUND_ROUTE = '/c/selectable-button';

export const SELECTABLE_BUTTON_COMPONENT_TYPE = 'interactive' as const;

export const SELECTABLE_BUTTON_SHOWCASE_AXE_SCOPE = '[data-section^="selectable-button-qa-"]';

export const FIGMA_VALIDATION_TAB = 'Figma Validation';

export const SELECTABLE_BUTTON_DATA_SECTIONS = [
  'selectable-button-qa-default',
  'selectable-button-qa-size',
  'selectable-button-qa-elevation',
  'selectable-button-qa-contained',
  'selectable-button-qa-icons',
  'selectable-button-qa-toggle',
  'selectable-button-qa-states',
] as const;

export const SELECTABLE_BUTTON_SECTION_COUNT = SELECTABLE_BUTTON_DATA_SECTIONS.length;

export const SELECTABLE_BUTTON_FIGMA_SIZES = ['s', 'm', 'l'] as const;

export const SELECTABLE_BUTTON_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const SELECTABLE_BUTTON_ROOT_TESTIDS = {
  default: 'selectable-button-default',
  toggle: 'selectable-button-toggle',
  toggleState: 'selectable-button-toggle-state',
  withIcons: 'selectable-button-with-icons',
  disabled: 'selectable-button-disabled',
  loading: 'selectable-button-loading',
  containedTrue: 'selectable-button-contained-true',
  containedFalse: 'selectable-button-contained-false',
  condensed: 'selectable-button-condensed',
} as const;

export function selectableButtonSizeTestId(size: (typeof SELECTABLE_BUTTON_FIGMA_SIZES)[number]): string {
  return `selectable-button-size-${size}`;
}

export function selectableButtonAttentionTestId(
  attention: (typeof SELECTABLE_BUTTON_ATTENTIONS)[number],
): string {
  return `selectable-button-attention-${attention}-selected`;
}

/** Every `data-testid` declared in `SelectableButtonQaShowcase.tsx`. */
export function allSelectableButtonPlaygroundTestIds(): readonly string[] {
  const ids: string[] = [SELECTABLE_BUTTON_ROOT_TESTIDS.default];

  for (const size of SELECTABLE_BUTTON_FIGMA_SIZES) {
    ids.push(selectableButtonSizeTestId(size));
  }
  for (const attention of SELECTABLE_BUTTON_ATTENTIONS) {
    ids.push(selectableButtonAttentionTestId(attention));
  }

  ids.push(
    SELECTABLE_BUTTON_ROOT_TESTIDS.containedTrue,
    SELECTABLE_BUTTON_ROOT_TESTIDS.containedFalse,
    SELECTABLE_BUTTON_ROOT_TESTIDS.condensed,
    SELECTABLE_BUTTON_ROOT_TESTIDS.withIcons,
    SELECTABLE_BUTTON_ROOT_TESTIDS.toggle,
    SELECTABLE_BUTTON_ROOT_TESTIDS.toggleState,
    SELECTABLE_BUTTON_ROOT_TESTIDS.disabled,
    SELECTABLE_BUTTON_ROOT_TESTIDS.loading,
  );

  return ids;
}

export const SELECTABLE_BUTTON_ALL_TESTIDS = allSelectableButtonPlaygroundTestIds();
