/**
 * Native Icon system — full API parity with `@oneui/ui/icons`.
 *
 * Public surface mirrors the web barrel one-for-one so callers can swap
 *   import { Icon, IconProvider, useIconSet, setJioIconLoader, … } from '@oneui/ui/icons'
 *   →
 *   import { Icon, IconProvider, useIconSet, setJioIconLoader, … } from '@oneui/ui-native/icons'
 * without behavioural changes (modulo platform-specific knobs noted below).
 */

// Context and Provider
export {
  IconProvider,
  useIconSet,
  usePreloadIcons,
  IconContext,
  setJioIconLoader,
  setJioIconCatalog,
  getJioIconLoader,
  getJioIconCatalog,
  onJioIconCatalogReady,
} from './IconContext.native';

// Universal Icon resolver (`@oneui/ui-native/icons` parity surface).
// Note: this is the lower-level resolver — `name="…"` / `icon={Component}`
// with explicit pixel `size` + `color`. The high-level design-system `<Icon>`
// (Figma component, with `appearance` × `emphasis` × spacing-index `size`)
// lives next to this file at `./Icon.native` and is the default export of
// `@oneui/ui-native/components/Icon`.
export { Icon, default as IconDefault } from './IconResolver.native';
export type { IconProps, IconNativeProps } from './IconResolver.native';

// Registry and Utilities (re-exported from @oneui/ui — pure data tables)
export {
  IconSetRegistry,
  SemanticMappings,
  IconCategories,
  getIconSetMetadata,
  getIconName,
  getIconSetIds,
  getSemanticIconNames,
  getImportSnippet,
} from './IconRegistry';

// Re-export types from shared
export type {
  IconSetId,
  IconSize,
  IconStyle,
  IconSetMetadata,
  IconComponent,
  IconComponentProps,
  SemanticIconName,
  SemanticIconMapping,
  IconConfig,
  IconFoundationConfig,
  IconCategory,
  IconEntry,
  IconContextValue,
} from '@oneui/shared';

export { IconSizeValues } from '@oneui/shared';

// Native-only spacing helper used by the design-system Icon shell.
export { designIconSizePx } from './designIconSizing';

// JDS Jio-icons bridge — consuming apps call `initJdsJioIcons(JdsIcons)` once
// at startup to register `@jds/core-icons--react-native` as the Jio source.
export {
  createJdsJioIconLoader,
  buildJdsJioIconCatalog,
  initJdsJioIcons,
  isJdsJioIconsInitialized,
  type JdsCoreIconsModule,
} from './jdsLoader';
