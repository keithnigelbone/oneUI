export { Checkbox } from './Checkbox';
export { useCheckboxState } from './Checkbox.shared';
export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxAppearance,
  CheckboxAccent,
} from './Checkbox.shared';

// Shared preview component (single source of truth for checkbox rendering)
export { CheckboxPreview } from './CheckboxPreview';
export type { CheckboxPreviewProps } from './CheckboxPreview';

// Token manifest for Component Token Editor
export {
  CHECKBOX_TOKEN_MANIFEST,
  CHECKBOX_TOKENS,
  getCheckboxTokensByCategory,
  getCheckboxTokenDefault,
} from './Checkbox.tokens';

// Recipe definition for Component Recipe System
export { CHECKBOX_RECIPE_DEFINITION } from './Checkbox.recipe';

// Unified component metadata
export { CHECKBOX_META } from './Checkbox.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  CheckboxSizes,
  CheckboxStates,
  CheckboxAccents,
  CheckboxAccentOverride,
  CheckboxReadOnly,
  CheckboxWithLabel,
  CheckboxSurfaceContext,
} from './Checkbox.showcase';
