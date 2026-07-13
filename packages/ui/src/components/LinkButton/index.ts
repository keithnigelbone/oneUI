export { LinkButton } from './LinkButton';
export { useLinkButtonState, resolveLinkButtonSize } from './LinkButton.shared';
export type {
  LinkButtonProps,
  LinkButtonAppearance,
  LinkButtonVariant,
  LinkButtonSize,
  LinkButtonAttention,
} from './LinkButton.shared';

// Shared preview component (single source of truth for link button rendering)
export { LinkButtonPreview } from './LinkButtonPreview';
export type { LinkButtonPreviewProps } from './LinkButtonPreview';

// Token manifest for Component Token Editor
export {
  LINKBUTTON_TOKEN_MANIFEST,
  LINKBUTTON_TOKENS,
  getLinkButtonTokensByCategory,
  getLinkButtonTokenDefault,
  isLinkButtonTokenLocked,
  getLinkButtonTokenLockReason,
} from './LinkButton.tokens';

// Recipe definition for Component Recipe System
export { LINKBUTTON_RECIPE_DEFINITION } from './LinkButton.recipe';

// Unified component metadata
export { LINKBUTTON_META } from './LinkButton.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  LinkButtonAttentionLevels,
  LinkButtonSizes,
  LinkButtonStates,
  LinkButtonWithSlots,
  LinkButtonAppearances,
} from './LinkButton.showcase';
