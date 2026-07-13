export { IndicatorBadge } from './IndicatorBadge';
export { useIndicatorBadgeState } from './IndicatorBadge.shared';
export type {
  IndicatorBadgeProps,
  IndicatorBadgeAppearance,
  IndicatorBadgeSize,
} from './IndicatorBadge.shared';

// Shared preview component (single source of truth for indicator badge rendering)
export { IndicatorBadgePreview } from './IndicatorBadgePreview';
export type { IndicatorBadgePreviewProps } from './IndicatorBadgePreview';

// Token manifest for Component Token Editor
export {
  INDICATOR_BADGE_TOKEN_MANIFEST,
  INDICATOR_BADGE_TOKENS,
  getIndicatorBadgeTokensByCategory,
  getIndicatorBadgeTokenDefault,
} from './IndicatorBadge.tokens';

// Recipe definition for Component Recipe System
export { INDICATOR_BADGE_RECIPE_DEFINITION } from './IndicatorBadge.recipe';

// Unified component metadata
export { INDICATOR_BADGE_META } from './IndicatorBadge.meta';
