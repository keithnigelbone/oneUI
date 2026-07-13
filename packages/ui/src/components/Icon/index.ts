export { Icon } from './Icon';
export { useIconState, ICON_SIZES } from './Icon.shared';
export type {
  IconProps,
  IconSize,
  IconAppearance,
  IconEmphasis,
} from './Icon.shared';
// Deprecated aliases — the design-system Icon is now THE Icon, so these prefixed
// names are no longer needed. Kept for one alpha to avoid breaking imports.
/** @deprecated use `IconProps` */
export type { IconProps as DesignIconProps } from './Icon.shared';
/** @deprecated use `IconSize` */
export type { IconSize as DesignIconSize } from './Icon.shared';
/** @deprecated use `IconAppearance` */
export type { IconAppearance as DesignIconAppearance } from './Icon.shared';
/** @deprecated use `IconEmphasis` */
export type { IconEmphasis as DesignIconEmphasis } from './Icon.shared';

// Token manifest for Component Token Editor
export {
  ICON_TOKEN_MANIFEST,
  ICON_TOKENS,
  getIconTokensByCategory,
} from './Icon.tokens';

// Unified component metadata
export { ICON_META } from './Icon.meta';
export { ICON_RECIPE_DEFINITION } from './Icon.recipe';

// Showcase components — shared between Storybook stories and platform documentation
export {
  IconSizes,
  IconSizesTable,
  IconEmphasisLevels,
  IconEmphasisLevelsTable,
  IconInContext,
  IconWithIcons,
  IconAppearances,
} from './Icon.showcase';
