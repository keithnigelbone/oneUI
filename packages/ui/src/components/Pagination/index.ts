/**
 * Pagination — barrel exports.
 *
 * Two public components:
 *   - `Pagination`     — composite numbered navigator (windowed page list +
 *                        prev/next/first/last buttons + ellipses).
 *   - `PaginationItem` — numbered page chip only; use with `<Pagination>` or alone.
 */

export { Pagination } from './Pagination';
export { PaginationItem } from './PaginationItem';

export {
  usePaginationState,
  buildPaginationPages,
  resolvePaginationSize,
  resolvePaginationVariant,
  resolvePaginationAppearance,
  _internal,
} from './Pagination.shared';

export type {
  PaginationProps,
  PaginationItemProps,
  PaginationAppearance,
  PaginationItemAppearance,
  PaginationSize,
  PaginationItemSize,
  PaginationAttention,
  PaginationItemAttention,
  PaginationVariant,
  PaginationItemVariant,
  PaginationSlot,
  UsePaginationStateOptions,
  UsePaginationStateResult,
} from './Pagination.shared';

export { PaginationPreview } from './PaginationPreview';
export type { PaginationPreviewProps } from './PaginationPreview';

export {
  PAGINATION_TOKEN_MANIFEST,
  PAGINATION_TOKENS,
  getPaginationTokensByCategory,
  getPaginationTokenDefault,
} from './Pagination.tokens';

export { PAGINATION_RECIPE_DEFINITION } from './Pagination.recipe';

export { PAGINATION_META, PAGINATION_ITEM_META } from './Pagination.meta';

export {
  PaginationDefault,
  PaginationSizesAttention,
  PaginationAppearances,
  PaginationControlled,
  PaginationWithFirstLast,
  PaginationEdgeCases,
  PaginationSurfaceContext,
  PaginationItemShowcase,
  PaginationFocusState,
} from './Pagination.showcase';
