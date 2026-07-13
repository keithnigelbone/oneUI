/** Route and stable `data-testid` anchors for Pagination QA Playwright. */

export const PAGINATION_PLAYGROUND_ROUTE = '/c/pagination';

export const PAGINATION_COMPONENT_TYPE = 'navigation' as const;

export const PAGINATION_SHOWCASE_AXE_SCOPE = '[data-section^="pagination-qa-"]';

/** Root `<nav>` test ids — one per showcase instance (see `PaginationQaShowcase.tsx`). */
export const PAGINATION_ROOT_TESTIDS = {
  default: 'pagination-default',
  controlled: 'pagination-controlled',
  edgeFirst: 'pagination-edge-first',
  edgeLast: 'pagination-edge-last',
  ellipsis: 'pagination-ellipsis',
  largeCount: 'pagination-large-count',
  sibling2: 'pagination-sibling-2',
  disabled: 'pagination-code-disabled',
  noPrevNext: 'pagination-code-no-prev-next',
  appearance: 'pagination-code-appearance',
  firstLastOn: 'pagination-first-true-last-true',
  firstLastOff: 'pagination-first-false-last-false',
  sizeS: 'pagination-size-S',
  sizeM: 'pagination-size-M',
  sizeL: 'pagination-size-L',
  attentionHigh: 'pagination-attention-high',
  attentionMedium: 'pagination-attention-medium',
  attentionLow: 'pagination-attention-low',
  codeSiblingBoundary: 'pagination-code-sibling-boundary',
} as const;

export const PAGINATION_FIGMA_SIZES = ['S', 'M', 'L'] as const;
export const PAGINATION_FIGMA_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const PAGINATION_MATRIX_TESTIDS = PAGINATION_FIGMA_ATTENTIONS.flatMap((attention) =>
  PAGINATION_FIGMA_SIZES.map((size) => `pagination-matrix-${attention}-${size}`),
);

export const PAGINATION_FIRST_LAST_TESTIDS = [
  'pagination-first-false-last-false',
  'pagination-first-true-last-true',
] as const;

export const PAGINATION_CODE_ONLY_TESTIDS = [
  'pagination-code-sibling-boundary',
  'pagination-code-no-prev-next',
  'pagination-code-appearance',
  'pagination-code-disabled',
] as const;

export const PAGINATION_COMBO_TESTIDS = ['pagination-combo-0', 'pagination-combo-1', 'pagination-combo-2'] as const;

/** `QaStoryBand` `id` / `data-section` values for scoped axe runs. */
export const PAGINATION_DATA_SECTIONS = [
  'pagination-qa-default',
  'pagination-qa-size',
  'pagination-qa-attention',
  'pagination-qa-first-last',
  'pagination-qa-matrix',
  'pagination-qa-code-only',
  'pagination-qa-e2e',
  'pagination-qa-realtime',
  'pagination-qa-combos',
] as const;

export const PAGINATION_SECTION_COUNT = PAGINATION_DATA_SECTIONS.length;

export const PAGINATION_REALTIME_TESTIDS = {
  table: 'pagination-realtime-table',
  search: 'pagination-realtime-search',
  catalog: 'pagination-realtime-catalog',
  compact: 'pagination-realtime-compact',
  few: 'pagination-realtime-few',
  filter: 'pagination-realtime-filter',
  dynamic: 'pagination-realtime-dynamic',
} as const;

export const PAGINATION_REALTIME_NAV_TESTIDS = Object.values(PAGINATION_REALTIME_TESTIDS);

export const PAGINATION_CAPTION_TESTIDS = ['pagination-controlled-caption'] as const;

/** Primary `<nav>` roots + captions on Test Scenarios (scroll into view as needed). */
export const PAGINATION_SHOWCASE_TESTIDS = [
  ...Object.values(PAGINATION_ROOT_TESTIDS),
  ...PAGINATION_MATRIX_TESTIDS.filter(
    (id) => !Object.values(PAGINATION_ROOT_TESTIDS).includes(id as never),
  ),
  ...PAGINATION_COMBO_TESTIDS,
  ...PAGINATION_REALTIME_NAV_TESTIDS,
  ...PAGINATION_CAPTION_TESTIDS,
] as const;

export const PAGINATION_COMBO_COUNT = 3;

export const PAGINATION_AXE_TARGET_ROOTS = [
  PAGINATION_ROOT_TESTIDS.default,
  PAGINATION_ROOT_TESTIDS.controlled,
  PAGINATION_ROOT_TESTIDS.disabled,
  PAGINATION_ROOT_TESTIDS.appearance,
  PAGINATION_REALTIME_TESTIDS.table,
] as const;
