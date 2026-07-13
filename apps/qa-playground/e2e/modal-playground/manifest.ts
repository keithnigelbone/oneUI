/**
 * Anchors from `ModalQaShowcase.tsx` (Test Scenarios tab).
 * Component type: **interactive** (dialog overlay — open/close, focus trap, keyboard dismiss).
 *
 * `data-testid` on triggers lives on ModalCell wrapper div (Button does not forward data-* — BUG-MODAL-001).
 */

export const MODAL_PLAYGROUND_ROUTE = '/c/modal';

export const MODAL_COMPONENT_TYPE = 'interactive' as const;

export const MODAL_SHOWCASE_AXE_SCOPE = '[data-section^="modal-figma-"]';

export const MODAL_FIGMA_SIZES = ['S', 'M', 'L', 'FullWidth'] as const;

export const MODAL_FIGMA_APPEARANCES = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
  'brand-bg',
  'auto',
] as const;

/** `QaStoryBand` `id` → rendered as `data-section`. */
export const MODAL_DATA_SECTIONS = [
  'modal-figma-default',
  'modal-figma-size',
  'modal-figma-header-start',
  'modal-figma-header-align',
  'modal-figma-no-header',
  'modal-figma-no-footer',
  'modal-figma-description',
  'modal-figma-dividers',
  'modal-figma-footer-orientation',
  'modal-figma-appearance',
  'modal-figma-scrollable',
  'modal-figma-dismissible',
  'modal-figma-appearance-auto',
] as const;

export const MODAL_SECTION_COUNT = MODAL_DATA_SECTIONS.length;

/** ModalCell wrapper `data-testid` — always visible on Test Scenarios tab. */
export const MODAL_TRIGGER_TESTIDS = [
  'modal-trigger-default',
  'modal-trigger-size-s',
  'modal-trigger-size-m',
  'modal-trigger-size-l',
  'modal-trigger-size-fullwidth',
  'modal-trigger-header-start-icon',
  'modal-trigger-header-start-badge',
  'modal-trigger-header-align-left',
  'modal-trigger-header-align-center',
  'modal-trigger-no-header',
  'modal-trigger-no-footer',
  'modal-trigger-title-false',
  'modal-trigger-desc-false',
  'modal-trigger-desc-true',
  'modal-trigger-dividers-none',
  'modal-trigger-dividers-onScroll',
  'modal-trigger-dividers-always',
  'modal-trigger-footer-start',
  'modal-trigger-footer-horizontal',
  'modal-trigger-footer-vertical',
  'modal-trigger-scrollable',
  'modal-trigger-dismissible-true',
  'modal-trigger-dismissible-false',
  'modal-trigger-appearance-neutral',
  'modal-trigger-appearance-primary',
  'modal-trigger-appearance-secondary',
  'modal-trigger-appearance-sparkle',
  'modal-trigger-appearance-negative',
  'modal-trigger-appearance-positive',
  'modal-trigger-appearance-warning',
  'modal-trigger-appearance-informative',
  'modal-trigger-appearance-brand-bg',
  'modal-trigger-appearance-auto',
] as const;

/** `data-testid` on `<Modal>` when open. */
export const MODAL_DIALOG_TESTIDS = [
  'modal-figma-default',
  'modal-size-s',
  'modal-size-m',
  'modal-size-l',
  'modal-size-fullwidth',
  'modal-header-start-icon',
  'modal-header-start-badge',
  'modal-header-align-left',
  'modal-header-align-center',
  'modal-no-header',
  'modal-no-footer',
  'modal-title-false',
  'modal-desc-false',
  'modal-desc-true',
  'modal-dividers-none',
  'modal-dividers-onScroll',
  'modal-dividers-always',
  'modal-footer-start',
  'modal-footer-horizontal',
  'modal-footer-vertical',
  'modal-scrollable',
  'modal-dismissible-true',
  'modal-dismissible-false',
  'modal-appearance-neutral',
  'modal-appearance-primary',
  'modal-appearance-secondary',
  'modal-appearance-sparkle',
  'modal-appearance-negative',
  'modal-appearance-positive',
  'modal-appearance-warning',
  'modal-appearance-informative',
  'modal-appearance-brand-bg',
  'modal-appearance-auto',
] as const;

/** Slot/content testids inside open dialogs. */
export const MODAL_INNER_TESTIDS = ['modal-footer-start-slot'] as const;

/** Always-visible showcase anchors (triggers + inner ids referenced when open). */
export const MODAL_ALL_TESTIDS = [...MODAL_TRIGGER_TESTIDS, ...MODAL_INNER_TESTIDS] as const;

export const MODAL_AXE_TARGET_TRIGGERS = [
  'modal-trigger-default',
  'modal-trigger-size-m',
  'modal-trigger-scrollable',
  'modal-trigger-dismissible-true',
  'modal-trigger-appearance-primary',
] as const;

export const MODAL_APPEARANCE_CONTRAST_TESTIDS = [
  'modal-trigger-appearance-auto',
  'modal-trigger-appearance-neutral',
  'modal-trigger-appearance-primary',
  'modal-trigger-appearance-secondary',
  'modal-trigger-appearance-sparkle',
  'modal-trigger-appearance-negative',
  'modal-trigger-appearance-positive',
  'modal-trigger-appearance-warning',
  'modal-trigger-appearance-informative',
  'modal-trigger-appearance-brand-bg',
] as const;

/** Maps trigger wrapper testid → open dialog `data-testid` on Modal. */
export const MODAL_TRIGGER_TO_DIALOG: Record<(typeof MODAL_TRIGGER_TESTIDS)[number], string> = {
  'modal-trigger-default': 'modal-figma-default',
  'modal-trigger-size-s': 'modal-size-s',
  'modal-trigger-size-m': 'modal-size-m',
  'modal-trigger-size-l': 'modal-size-l',
  'modal-trigger-size-fullwidth': 'modal-size-fullwidth',
  'modal-trigger-header-start-icon': 'modal-header-start-icon',
  'modal-trigger-header-start-badge': 'modal-header-start-badge',
  'modal-trigger-header-align-left': 'modal-header-align-left',
  'modal-trigger-header-align-center': 'modal-header-align-center',
  'modal-trigger-no-header': 'modal-no-header',
  'modal-trigger-no-footer': 'modal-no-footer',
  'modal-trigger-title-false': 'modal-title-false',
  'modal-trigger-desc-false': 'modal-desc-false',
  'modal-trigger-desc-true': 'modal-desc-true',
  'modal-trigger-dividers-none': 'modal-dividers-none',
  'modal-trigger-dividers-onScroll': 'modal-dividers-onScroll',
  'modal-trigger-dividers-always': 'modal-dividers-always',
  'modal-trigger-footer-start': 'modal-footer-start',
  'modal-trigger-footer-horizontal': 'modal-footer-horizontal',
  'modal-trigger-footer-vertical': 'modal-footer-vertical',
  'modal-trigger-scrollable': 'modal-scrollable',
  'modal-trigger-dismissible-true': 'modal-dismissible-true',
  'modal-trigger-dismissible-false': 'modal-dismissible-false',
  'modal-trigger-appearance-neutral': 'modal-appearance-neutral',
  'modal-trigger-appearance-primary': 'modal-appearance-primary',
  'modal-trigger-appearance-secondary': 'modal-appearance-secondary',
  'modal-trigger-appearance-sparkle': 'modal-appearance-sparkle',
  'modal-trigger-appearance-negative': 'modal-appearance-negative',
  'modal-trigger-appearance-positive': 'modal-appearance-positive',
  'modal-trigger-appearance-warning': 'modal-appearance-warning',
  'modal-trigger-appearance-informative': 'modal-appearance-informative',
  'modal-trigger-appearance-brand-bg': 'modal-appearance-brand-bg',
  'modal-trigger-appearance-auto': 'modal-appearance-auto',
};

export const MODAL_BUG_ID = 'BUG-MODAL-002' as const;
