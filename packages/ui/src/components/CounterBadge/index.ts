export { CounterBadge } from './CounterBadge';
export { useCounterBadgeState } from './CounterBadge.shared';
export type {
  CounterBadgeProps,
  CounterBadgeAppearance,
  CounterBadgeVariant,
  CounterBadgeSize,
  CounterBadgeAttention,
} from './CounterBadge.shared';

// Shared preview component (single source of truth for counter badge rendering)
export { CounterBadgePreview } from './CounterBadgePreview';
export type { CounterBadgePreviewProps } from './CounterBadgePreview';

// Token manifest for Component Token Editor
export {
  COUNTER_BADGE_TOKEN_MANIFEST,
  COUNTER_BADGE_TOKENS,
  getCounterBadgeTokensByCategory,
  getCounterBadgeTokenDefault,
} from './CounterBadge.tokens';

// Recipe definition for Component Recipe System
export { COUNTER_BADGE_RECIPE_DEFINITION } from './CounterBadge.recipe';

// Unified component metadata
export { COUNTER_BADGE_META } from './CounterBadge.meta';
