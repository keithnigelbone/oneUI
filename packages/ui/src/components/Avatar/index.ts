export { Avatar } from './Avatar';
export { useAvatarState, getInitials, resolveAvatarSize } from './Avatar.shared';
export type { AvatarProps, AvatarSize, AvatarContent, AvatarAttention, AvatarAppearance } from './Avatar.shared';

// Shared preview component (single source of truth for avatar rendering)
export { AvatarPreview } from './AvatarPreview';
export type { AvatarPreviewProps } from './AvatarPreview';

// Token manifest for Component Token Editor
export {
  AVATAR_TOKEN_MANIFEST,
  AVATAR_TOKENS,
  getAvatarTokensByCategory,
  getAvatarTokenDefault,
} from './Avatar.tokens';

// Recipe definition for Component Recipe System
export { AVATAR_RECIPE_DEFINITION } from './Avatar.recipe';

// Unified component metadata
export { AVATAR_META } from './Avatar.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  AvatarVariants,
  AvatarAttentionLevels,
  AvatarSizes,
  AvatarStates,
  AvatarImageFallback,
} from './Avatar.showcase';
