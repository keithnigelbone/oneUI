export { Button } from './Button';
export { useButtonState, resolveSize } from './Button.shared';
export type { ButtonProps, ButtonAppearance, ButtonVariant, ButtonSize, ButtonAttention } from './Button.shared';

// Shared preview component (single source of truth for button rendering)
export { ButtonPreview } from './ButtonPreview';
export type { ButtonPreviewProps } from './ButtonPreview';

// Token manifest for Component Token Editor
export {
  BUTTON_TOKEN_MANIFEST,
  BUTTON_TOKENS,
  getButtonTokensByCategory,
  getButtonTokenDefault,
  isButtonTokenLocked,
  getButtonTokenLockReason,
} from './Button.tokens';

// Recipe definition for Component Recipe System
export { BUTTON_RECIPE_DEFINITION } from './Button.recipe';

// Unified component metadata
export { BUTTON_META } from './Button.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  ButtonAttentionLevels,
  ButtonThemes,
  ButtonSizes,
  ButtonCondensed,
  ButtonStates,
  ButtonWithSlots,
  ButtonFullWidth,
  ButtonAppearances,
  ButtonSurfaceContext,
  ButtonSurfaceShowcase,
} from './Button.showcase';
