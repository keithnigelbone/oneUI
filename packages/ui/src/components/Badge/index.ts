export { Badge } from './Badge';
export { useBadgeState } from './Badge.shared';
export type {
  BadgeProps,
  BadgeAppearance,
  BadgeVariant,
  BadgeSize,
  BadgeAttention,
} from './Badge.shared';

// Shared preview component (single source of truth for badge rendering)
export { BadgePreview } from './BadgePreview';
export type { BadgePreviewProps } from './BadgePreview';

// Token manifest for Component Token Editor
export {
  BADGE_TOKEN_MANIFEST,
  BADGE_TOKENS,
  getBadgeTokensByCategory,
  getBadgeTokenDefault,
} from './Badge.tokens';

// Recipe definition for Component Recipe System
export { BADGE_RECIPE_DEFINITION } from './Badge.recipe';

// Unified component metadata
export { BADGE_META } from './Badge.meta';
