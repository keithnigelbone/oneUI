export { PaginationDots } from './PaginationDots';
export {
  usePaginationDotsState,
  scaleForDistance,
} from './PaginationDots.shared';
export type {
  PaginationDotsProps,
  PaginationDotsAppearance,
  /** @deprecated Figma defines only one size (M). Kept for barrel compatibility. */
  PaginationDotsSize,
  PaginationDotState,
  PaginationDotScale,
  PaginationDotDescriptor,
  UsePaginationDotsStateOptions,
  UsePaginationDotsStateResult,
} from './PaginationDots.shared';

// Shared preview component
export { PaginationDotsPreview } from './PaginationDotsPreview';
export type { PaginationDotsPreviewProps } from './PaginationDotsPreview';

// Token manifest
export {
  PAGINATION_DOTS_TOKEN_MANIFEST,
  PAGINATION_DOTS_TOKENS,
  getPaginationDotsTokensByCategory,
  getPaginationDotsTokenDefault,
} from './PaginationDots.tokens';

// Recipe definition
export { PAGINATION_DOTS_RECIPE_DEFINITION } from './PaginationDots.recipe';

// Unified metadata
export { PAGINATION_DOTS_META } from './PaginationDots.meta';

// Showcase components
export {
  PaginationDotsDefault,
  PaginationDotsAppearances,
  PaginationDotsLoopVsNonLoop,
  PaginationDotsLongSequence,
  PaginationDotsInteractive,
  PaginationDotsReadOnly,
  PaginationDotsDegenerate,
  PaginationDotsSurfaceContext,
} from './PaginationDots.showcase';
