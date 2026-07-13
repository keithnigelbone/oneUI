/**
 * Anchors from `BottomNavigationQaShowcase.tsx` — `data-testid` on root `<nav>` only.
 */
export const BOTTOM_NAV_PLAYGROUND_ROUTE = '/c/bottom-navigation';

export const BOTTOM_NAV_COMPONENT_TYPE = 'navigation' as const;

/** CSS scope for axe — story bands only (excludes QA catalog chrome). */
export const BOTTOM_NAV_SHOWCASE_AXE_SCOPE = '[data-section^="bottom-navigation-qa"]';

export const BOTTOM_NAV_DATA_SECTIONS = [
  'bottom-navigation-qa-default',
  'bottom-navigation-qa-label-type',
  'bottom-navigation-qa-item-count',
  'bottom-navigation-qa-appearance',
  'bottom-navigation-qa-active',
  'bottom-navigation-qa-disabled',
  'bottom-navigation-qa-show-divider',
  'bottom-navigation-qa-controlled',
  'bottom-navigation-qa-item-extras',
  'bottom-navigation-qa-href',
  'bottom-navigation-qa-combos',
] as const;

export const BOTTOM_NAV_LABEL_TYPES = ['1line', '2line', 'none'] as const;

export const BOTTOM_NAV_ITEM_COUNTS = [2, 3, 4, 5] as const;

export const BOTTOM_NAV_APPEARANCES = [
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

export const BOTTOM_NAV_COMBO_COUNT = 6;

export const BOTTOM_NAV_ROOT_TESTIDS = {
  default: 'bottomnav-default',
  controlled: 'bottomnav-controlled',
  disabledRow: 'bottomnav-disabled-row',
  activeIcon: 'bottomnav-activeicon',
} as const;

export const BOTTOM_NAV_ALL_TESTIDS = [
  'bottomnav-default',
  'bottomnav-labeltype-1line',
  'bottomnav-labeltype-2line',
  'bottomnav-labeltype-none',
  'bottomnav-count-2',
  'bottomnav-count-3',
  'bottomnav-count-4',
  'bottomnav-count-5',
  'bottomnav-appearance-auto',
  'bottomnav-appearance-neutral',
  'bottomnav-appearance-primary',
  'bottomnav-appearance-secondary',
  'bottomnav-appearance-sparkle',
  'bottomnav-appearance-negative',
  'bottomnav-appearance-positive',
  'bottomnav-appearance-warning',
  'bottomnav-appearance-informative',
  'bottomnav-appearance-brand-bg',
  'bottomnav-active-home',
  'bottomnav-active-search',
  'bottomnav-disabled-row',
  'bottomnav-divider-true',
  'bottomnav-divider-false',
  'bottomnav-controlled',
  'bottomnav-activeicon',
  'bottomnav-combo-0',
  'bottomnav-combo-1',
  'bottomnav-combo-2',
  'bottomnav-combo-3',
  'bottomnav-combo-4',
  'bottomnav-combo-5',
] as const;

export function bottomNavLabelTypeTestId(labelType: (typeof BOTTOM_NAV_LABEL_TYPES)[number]): string {
  return `bottomnav-labeltype-${labelType}`;
}

export function bottomNavCountTestId(count: (typeof BOTTOM_NAV_ITEM_COUNTS)[number]): string {
  return `bottomnav-count-${count}`;
}

export function bottomNavAppearanceTestId(
  appearance: (typeof BOTTOM_NAV_APPEARANCES)[number],
): string {
  return `bottomnav-appearance-${appearance}`;
}

export function bottomNavComboTestId(index: number): string {
  return `bottomnav-combo-${index}`;
}

export const BOTTOM_NAV_APPEARANCE_A11Y_TESTIDS = BOTTOM_NAV_APPEARANCES.map(
  (a) => `bottomnav-appearance-${a}`,
) as readonly string[];
