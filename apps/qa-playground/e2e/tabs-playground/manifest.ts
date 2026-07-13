/** Route and stable anchors from `TabsQaShowcase.tsx` (wrapper `data-testid` on `QaTabGroup`). */

export const TABS_COMPONENT_TYPE = 'navigation' as const;

export const TABS_PLAYGROUND_ROUTE = '/c/tabs';

export const TABS_SHOWCASE_AXE_SCOPE = '[data-section^="tabs-qa-"]';

export const TABS_SMOKE_TESTID = 'tabs-default';

export const TABS_SECTION_COUNT = 11;

/**
 * Primary E2E anchors — map user template names → actual showcase test ids.
 * (Playground does NOT use `tabs-horizontal` / `tabs-vertical`; those are aliases here.)
 */
export const TABS_ROOT_TESTIDS = {
  /** Horizontal, size M, 4× Label — Figma orientation column */
  horizontal: 'tabs-orientation-horizontal',
  /** Vertical, size M, 4× Label */
  vertical: 'tabs-orientation-vertical',
  /** Storybook Default — Overview / Projects / Account */
  default: 'tabs-default',
  /** Controlled + TabPanels (only instance with panels) */
  controlled: 'tabs-controlled',
  /** Enabled / Selected / Disabled */
  states: 'tabs-states',
  /** activateOnFocus: true */
  activateOnFocus: 'tabs-activate-on-focus',
  /** loopFocus: false */
  loopFocusFalse: 'tabs-loop-focus-false',
  /** start/end slots */
  withIcons: 'tabs-with-icons',
  /** focus forced on middle tab */
  interactionFocus: 'tabs-interaction-focus',
  /** MUI-style scrollable row — overflow + scroll buttons ⚠️ */
  scrollable: 'tabs-scrollable',
  /** MUI-style full-width tab strip ⚠️ */
  fullwidth: 'tabs-fullwidth',
} as const;

/** `QaStoryBand` `id` → `data-section` for scoped axe. */
export const TABS_DATA_SECTIONS = [
  'tabs-qa-default',
  'tabs-qa-size',
  'tabs-qa-orientation',
  'tabs-qa-layout-variants',
  'tabs-qa-interaction-state',
  'tabs-qa-states',
  'tabs-qa-controlled',
  'tabs-qa-code-only',
  'tabs-qa-appearance-strip',
  'tabs-qa-slots',
  'tabs-qa-combos',
] as const;

export const TABS_COMBO_COUNT = 4;

/** Appearance keys used in `TabsQaShowcase` strip (matches `CODE_APPEARANCES`). */
export const TABS_APPEARANCE_STRIP_KEYS = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

/**
 * Every `data-testid` on a Tabs showcase wrapper (QaTabGroup shell, scroll shell, viewport).
 * Keep in sync with `TabsQaShowcase.tsx`.
 */
export const TABS_ALL_WRAPPER_TESTIDS = [
  'tabs-default',
  'tabs-size-S',
  'tabs-size-M',
  'tabs-size-L',
  'tabs-orientation-horizontal',
  'tabs-orientation-vertical',
  'tabs-scrollable',
  'tabs-scrollable-viewport',
  'tabs-fullwidth',
  'tabs-interaction-hover',
  'tabs-interaction-focus',
  'tabs-states',
  'tabs-controlled',
  'tabs-appearance-auto',
  'tabs-activate-on-focus',
  'tabs-loop-focus-false',
  'tabs-no-indicator',
  'tabs-code-only-appearance-primary',
  ...TABS_APPEARANCE_STRIP_KEYS.map((a) => `tabs-appearance-${a}`),
  'tabs-appearance-brand-bg',
  'tabs-with-icons',
  'tabs-combo-0',
  'tabs-combo-1',
  'tabs-combo-2',
  'tabs-combo-3',
] as const;

export const TABS_AXE_TARGET_TESTIDS = [
  'tabs-default',
  'tabs-orientation-horizontal',
  'tabs-orientation-vertical',
  'tabs-controlled',
  'tabs-states',
  'tabs-with-icons',
  'tabs-scrollable',
  'tabs-combo-0',
] as const;

/** Map wrapper `data-testid` → `QaStoryBand` `data-section` for scroll + axe scoping. */
export function dataSectionForTabsTestId(testId: string): string {
  if (testId === 'tabs-default') return 'tabs-qa-default';
  if (testId.startsWith('tabs-size-')) return 'tabs-qa-size';
  if (testId.startsWith('tabs-orientation-')) return 'tabs-qa-orientation';
  if (testId === 'tabs-scrollable' || testId === 'tabs-scrollable-viewport' || testId === 'tabs-fullwidth') {
    return 'tabs-qa-layout-variants';
  }
  if (testId.startsWith('tabs-interaction-')) return 'tabs-qa-interaction-state';
  if (testId === 'tabs-states') return 'tabs-qa-states';
  if (testId === 'tabs-controlled') return 'tabs-qa-controlled';
  if (
    testId === 'tabs-code-only-appearance-primary' ||
    testId === 'tabs-appearance-auto' ||
    testId === 'tabs-activate-on-focus' ||
    testId === 'tabs-loop-focus-false' ||
    testId === 'tabs-no-indicator'
  ) {
    return 'tabs-qa-code-only';
  }
  if (testId === 'tabs-appearance-primary' || testId.startsWith('tabs-appearance-')) return 'tabs-qa-appearance-strip';
  if (testId === 'tabs-with-icons') return 'tabs-qa-slots';
  if (testId.startsWith('tabs-combo-')) return 'tabs-qa-combos';
  return 'tabs-qa-default';
}

export const FIGMA_VALIDATION_TAB = 'Figma Validation';
export const FIGMA_GRID_TESTID = 'figma-tabs-grid';
