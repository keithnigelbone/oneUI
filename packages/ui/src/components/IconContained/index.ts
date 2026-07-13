export { IconContained } from './IconContained';
export { useIconContainedState } from './IconContained.shared';
export type {
  IconContainedProps,
  IconContainedSize,
  IconContainedAttention,
  IconContainedAppearance,
} from './IconContained.shared';

// Shared preview component (single source of truth for icon contained rendering)
export { IconContainedPreview } from './IconContainedPreview';
export type { IconContainedPreviewProps } from './IconContainedPreview';

// Token manifest for Component Token Editor
export {
  ICON_CONTAINED_TOKEN_MANIFEST,
  ICON_CONTAINED_TOKENS,
  getIconContainedTokensByCategory,
  getIconContainedTokenDefault,
} from './IconContained.tokens';

// Recipe definition for Component Recipe System
export { ICON_CONTAINED_RECIPE_DEFINITION } from './IconContained.recipe';

// Unified component metadata
export { ICON_CONTAINED_META } from './IconContained.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  IconContainedAttentionLevels,
  IconContainedSizes,
  IconContainedStates,
  IconContainedWithIcons,
} from './IconContained.showcase';
