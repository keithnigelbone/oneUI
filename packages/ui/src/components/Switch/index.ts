export { Switch } from './Switch';
export { useSwitchState } from './Switch.shared';
export type {
  SwitchProps,
  SwitchSize,
  SwitchAppearance,
  SwitchAccent,
} from './Switch.shared';

// Shared preview component
export { SwitchPreview } from './SwitchPreview';
export type { SwitchPreviewProps } from './SwitchPreview';

// Token manifest for Component Token Editor
export {
  SWITCH_TOKEN_MANIFEST,
  SWITCH_TOKENS,
  getSwitchTokensByCategory,
} from './Switch.tokens';

// Recipe definition for Component Recipe System
export { SWITCH_RECIPE_DEFINITION } from './Switch.recipe';

// Unified component metadata
export { SWITCH_META } from './Switch.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  SwitchSizes,
  SwitchStates,
  SwitchAccents,
  SwitchAccentOverride,
  SwitchReadOnly,
  SwitchWithLabel,
  SwitchSurfaceContext,
} from './Switch.showcase';
