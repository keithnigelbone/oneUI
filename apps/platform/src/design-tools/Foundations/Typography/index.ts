/**
 * Typography Foundation components
 */

export { DIN1450Calculator } from './DIN1450Calculator';
export { TypeScaleEditor } from './TypeScaleEditor';
export { TypographyStyleEditor } from './TypographyStyleEditor';
export { WeightMapping } from './WeightMapping';

// Font selection components
export { FontCategoryTabs } from './FontCategoryTabs';
export { FontSelector } from './FontSelector';
export { FontPreviewCard } from './FontPreviewCard';
export { FontScopeToggle } from './FontScopeToggle';

// Font upload
export { FontUploader } from './FontUploader';
export type {
  FontUploaderProps,
  FontUploadState,
  FontPreviewInfo,
  EditableFontMetadata,
  FontUploadResult,
  UploadFontFn,
} from './FontUploader.shared';

// Types
export type {
  DIN1450CalculatorProps,
  TypeScaleEditorProps,
  TypographyStyleEditorProps,
  WeightMappingProps,
  TypographyFoundationConfig,
  ViewingDistanceParams,
  Platform,
  FontCategory,
  FontScope,
  FontSelection,
  FontMetadata,
  CustomFontData,
} from './Typography.shared';

// Constants and utilities
export {
  DEFAULT_TYPOGRAPHY_CONFIG,
  SCALE_FACTOR_LABELS,
  PLATFORM_LABELS,
  DEFAULT_FONT_SELECTION,
  FONT_COLLECTION,
  FONT_CATEGORY_LABELS,
  STYLE_FONT_MAPPING,
  getFontById,
  getFontByName,
  getFontsByCategory,
  getFontCategoryCounts,
  buildFontFamilyString,
  buildFontFamilyById,
  getGoogleFontsUrl,
  getFontForStyleCategory,
  convertCustomFontToMetadata,
  getUploadedFontId,
  getConvexIdFromFontId,
} from './Typography.shared';
