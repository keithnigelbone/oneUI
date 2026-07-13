/**
 * Anchors from `IconButtonQaShowcase.tsx` (Test Scenarios tab).
 * `data-testid` is forwarded on the root `<button>`.
 *
 * Component type: **interactive** (icon-only button — requires `aria-label`).
 */

export const ICON_BUTTON_PLAYGROUND_ROUTE = '/c/icon-button';

export const ICON_BUTTON_COMPONENT_TYPE = 'interactive' as const;

export const ICON_BUTTON_SHOWCASE_AXE_SCOPE = '[data-section^="icon-button-qa-"]';

export const ICON_BUTTON_FIGMA_VALIDATION_TAB = 'Figma Validation';

export const ICON_BUTTON_DATA_SECTIONS = [
  'icon-button-qa-default',
  'icon-button-qa-size',
  'icon-button-qa-attention',
  'icon-button-qa-appearance',
  'icon-button-qa-layout',
  'icon-button-qa-condensed',
  'icon-button-qa-states',
  'icon-button-qa-interaction',
  'icon-button-qa-surface',
  'icon-button-qa-bug-repro',
  'icon-button-qa-edge',
] as const;

export const ICON_BUTTON_SECTION_COUNT = ICON_BUTTON_DATA_SECTIONS.length;

export const ICON_BUTTON_FIGMA_SIZES = ['2xs', 'xs', 's', 'm', 'l', 'xl'] as const;

export const ICON_BUTTON_SIZE_TO_DATA: Record<
  (typeof ICON_BUTTON_FIGMA_SIZES)[number],
  string
> = {
  '2xs': '4',
  xs: '6',
  s: '8',
  m: '10',
  l: '12',
  xl: '14',
};

export const ICON_BUTTON_FIGMA_ATTENTION = ['high', 'medium', 'low'] as const;

export const ICON_BUTTON_ATTENTION_TO_VARIANT = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
} as const;

export const ICON_BUTTON_FIGMA_APPEARANCES = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const ICON_BUTTON_ROOT_TESTIDS = {
  default: 'icon-button-default',
  layout11: 'icon-button-layout-1-1',
  layout32: 'icon-button-layout-3-2',
  fullWidth: 'icon-button-full-width',
  condensedFalse: 'icon-button-condensed-false',
  condensedTrue: 'icon-button-condensed-true',
  disabled: 'icon-button-disabled',
  loading: 'icon-button-loading',
  interactive: 'icon-button-interactive',
  pressCount: 'icon-button-press-count',
  ariaExpanded: 'icon-button-aria-expanded',
  surfaceBold: 'icon-button-surface-bold',
  bugNoLabel: 'icon-button-bug-no-label',
  edgeInvalidSize: 'icon-button-edge-invalid-size',
  edgeLoadingActive: 'icon-button-edge-loading-active',
} as const;

export function iconButtonSizeTestId(size: (typeof ICON_BUTTON_FIGMA_SIZES)[number]): string {
  return `icon-button-size-${size}`;
}

export function iconButtonAttentionTestId(
  attention: (typeof ICON_BUTTON_FIGMA_ATTENTION)[number],
): string {
  return `icon-button-attention-${attention}`;
}

export function iconButtonAppearanceTestId(
  appearance: (typeof ICON_BUTTON_FIGMA_APPEARANCES)[number],
): string {
  return `icon-button-appearance-${appearance}`;
}

/** Every `data-testid` in Test Scenarios tab (buttons + press counter span). */
export function allIconButtonPlaygroundTestIds(): string[] {
  const ids: string[] = [ICON_BUTTON_ROOT_TESTIDS.default];

  for (const size of ICON_BUTTON_FIGMA_SIZES) {
    ids.push(iconButtonSizeTestId(size));
  }

  for (const attention of ICON_BUTTON_FIGMA_ATTENTION) {
    ids.push(iconButtonAttentionTestId(attention));
  }

  for (const appearance of ICON_BUTTON_FIGMA_APPEARANCES) {
    ids.push(iconButtonAppearanceTestId(appearance));
  }

  ids.push(
    ICON_BUTTON_ROOT_TESTIDS.layout11,
    ICON_BUTTON_ROOT_TESTIDS.layout32,
    ICON_BUTTON_ROOT_TESTIDS.fullWidth,
    ICON_BUTTON_ROOT_TESTIDS.condensedFalse,
    ICON_BUTTON_ROOT_TESTIDS.condensedTrue,
    ICON_BUTTON_ROOT_TESTIDS.disabled,
    ICON_BUTTON_ROOT_TESTIDS.loading,
    ICON_BUTTON_ROOT_TESTIDS.interactive,
    ICON_BUTTON_ROOT_TESTIDS.pressCount,
    ICON_BUTTON_ROOT_TESTIDS.ariaExpanded,
    ICON_BUTTON_ROOT_TESTIDS.surfaceBold,
    ICON_BUTTON_ROOT_TESTIDS.bugNoLabel,
    ICON_BUTTON_ROOT_TESTIDS.edgeInvalidSize,
    ICON_BUTTON_ROOT_TESTIDS.edgeLoadingActive,
  );

  return ids;
}

/** Button roots only (excludes press-count caption). */
export function allIconButtonRootTestIds(): string[] {
  return allIconButtonPlaygroundTestIds().filter((id) => id !== ICON_BUTTON_ROOT_TESTIDS.pressCount);
}

export const ICON_BUTTON_ALL_TESTIDS = allIconButtonPlaygroundTestIds();

export const ICON_BUTTON_ALL_ROOT_TESTIDS = allIconButtonRootTestIds();

export const ICON_BUTTON_BUG_BAND = 'icon-button-qa-bug-repro' as const;

export const ICON_BUTTON_BUG_ID = 'BUG-ICONBUTTON-001' as const;

export const ICON_BUTTON_BUG_EXCLUDE = `[data-section="${ICON_BUTTON_BUG_BAND}"], [data-testid="${ICON_BUTTON_ROOT_TESTIDS.bugNoLabel}"]`;
