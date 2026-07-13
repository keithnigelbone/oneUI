/**
 * IconButton component public exports
 */

export { IconButton } from './IconButton';
export type {
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
  IconButtonAttention,
  IconButtonAppearance,
  IconButtonLayout,
} from './IconButton.shared';

// Shared preview component (single source of truth for icon button rendering)
export { IconButtonPreview } from './IconButtonPreview';
export type { IconButtonPreviewProps } from './IconButtonPreview';

// Token manifest for Component Token Editor
export {
  ICON_BUTTON_TOKEN_MANIFEST,
  ICON_BUTTON_TOKENS,
  getIconButtonTokensByCategory,
  getIconButtonTokenDefault,
} from './IconButton.tokens';

// Recipe definition for Component Recipe System
export { ICON_BUTTON_RECIPE_DEFINITION } from './IconButton.recipe';

// Unified component metadata
export { ICON_BUTTON_META } from './IconButton.meta';
