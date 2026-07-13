/** Route and stable anchors for PaginationDots QA Playwright. */

export const PAGINATION_DOTS_PLAYGROUND_ROUTE = '/c/pagination-dots';

export const PAGINATION_DOTS_COMPONENT_TYPE = 'interactive' as const;

export const PAGINATION_DOTS_SHOWCASE_AXE_SCOPE = '[data-section^="pagination-dots-qa-"]';

/** Wrapper `data-testid` on showcase cells (see `PaginationDotsQaShowcase.tsx`). */
export const PAGINATION_DOTS_ROOT_TESTIDS = {
  default: 'pagination-dots-default',
  uncontrolled0: 'pagination-dots-uncontrolled-0',
  uncontrolled2: 'pagination-dots-uncontrolled-2',
  controlled: 'pagination-dots-controlled',
  readOnly: 'pagination-dots-readonly',
  loopTrue: 'pagination-dots-loop-true',
  appearanceSparkle: 'pagination-dots-appearance-sparkle',
  empty: 'pagination-dots-empty',
  single: 'pagination-dots-single',
} as const;

export const PAGINATION_DOTS_COMBO_TESTIDS = [
  'pagination-dots-combo-0',
  'pagination-dots-combo-1',
  'pagination-dots-loop-true',
  'pagination-dots-combo-3',
  'pagination-dots-combo-4',
] as const;

/** Every `data-testid` on the Test Scenarios tab. */
export const PAGINATION_DOTS_SHOWCASE_TESTIDS = [
  ...Object.values(PAGINATION_DOTS_ROOT_TESTIDS),
  ...PAGINATION_DOTS_COMBO_TESTIDS.filter(
    (id) => !Object.values(PAGINATION_DOTS_ROOT_TESTIDS).includes(id as never),
  ),
] as const;

/** `aria-label` on `<PaginationDots>` — query tablist/status inside wrappers. */
export const PAGINATION_DOTS_ARIA = {
  default: 'Pagination dots QA default',
  uncontrolled0: 'defaultActiveIndex 0',
  uncontrolled2: 'defaultActiveIndex 2',
  controlled: 'Controlled pagination dots QA',
  readOnly: 'Read-only pagination dots',
  loopTrue: 'pageCount 2 · loop true',
  appearanceSparkle: 'appearance sparkle',
  empty: 'Empty count',
  single: 'Single dot',
} as const;

export const PAGINATION_DOTS_FIGMA_APPEARANCES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
  'brand-bg',
  'auto',
] as const;

/** `QaStoryBand` `id` / `data-section` values for scoped axe. */
export const PAGINATION_DOTS_DATA_SECTIONS = [
  'pagination-dots-qa-default',
  'pagination-dots-qa-current-page',
  'pagination-dots-qa-code-only',
  'pagination-dots-qa-appearance-strip',
  'pagination-dots-qa-degenerate',
  'pagination-dots-qa-combos',
] as const;

export const PAGINATION_DOTS_SECTION_COUNT = PAGINATION_DOTS_DATA_SECTIONS.length;

export const PAGINATION_DOTS_COMBO_COUNT = 5;

export const FIGMA_VALIDATION_TAB = 'Figma Validation';
export const FIGMA_GRID_TESTID = 'figma-pagination-dots-grid';

export function paginationDotsAppearanceAria(appearance: string): string {
  return `appearance ${appearance}`;
}
