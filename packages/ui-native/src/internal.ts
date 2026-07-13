/**
 * `@oneui/ui-native/internal` — component-authoring helpers.
 *
 * ⚠️ NOT part of the semver-stable public API. These are exposed for advanced
 * consumers building custom composite components or custom Text primitives.
 * They may change or be removed in any minor release. Application code should
 * prefer the main entry (`@oneui/ui-native`) and `@oneui/ui-native/theme`.
 */

// Typography → React Native TextStyle converters (for custom Text components).
export {
  typographyToTextStyle,
  mergeTypographyTextStyle,
} from './theme/typographyToTextStyle';

// Slot composition contexts (used by composite parents to scope the resolved
// appearance / icon context for descendant leaves).
export {
  SlotParentAppearanceProvider,
  useSlotParentAppearance,
  type SlotParentAppearance,
  type SlotParentAppearanceProviderProps,
} from './slots/SlotParentAppearanceContext.native';

export {
  ComponentSlotIconContext,
  useComponentSlotIconContext,
  type ComponentSlotIconContextValue,
} from './slots/ComponentSlotIconContext.native';
