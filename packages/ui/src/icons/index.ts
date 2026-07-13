/**
 * Icon System Exports
 *
 * This module provides a unified icon system that supports multiple icon libraries
 * with brand-specific selection and semantic icon names.
 */

// Context and Provider
export {
  IconProvider,
  useIconSet,
  usePreloadIcons,
  IconContext,
  setIconSetLoader,
  setIconSetCatalog,
  getIconSetLoader,
  getIconSetCatalog,
  setJioIconLoader,
  setJioIconCatalog,
  getJioIconLoader,
  getJioIconCatalog,
  onJioIconCatalogReady,
} from './IconContext';

// Universal Icon Component
export { Icon } from './Icon';

// Registry and Utilities
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
  IconProps,
  IconContextValue,
} from '@oneui/shared';

export { IconSizeValues } from '@oneui/shared';
