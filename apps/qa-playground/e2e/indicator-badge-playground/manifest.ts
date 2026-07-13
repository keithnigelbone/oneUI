/**
 * Anchors from `IndicatorBadgeQaShowcase.tsx`.
 * `data-testid` is forwarded on the root `<span role="status">`.
 */

export const INDICATOR_BADGE_PLAYGROUND_ROUTE = '/c/indicator-badge';

export const INDICATOR_BADGE_SHOWCASE_AXE_SCOPE = '[data-section^="indicator-qa"]';

export const INDICATOR_BADGE_DATA_SECTIONS = [
  'indicator-qa-default',
  'indicator-qa-size',
  'indicator-qa-appearance',
  'indicator-qa-brand-bg',
  'indicator-qa-code-api',
  'indicator-qa-combos',
] as const;

export const INDICATOR_BADGE_COMBO_COUNT = 5;

export const INDICATOR_BADGE_ROOT_TESTIDS = {
  default: 'indicator-badge-default',
} as const;
