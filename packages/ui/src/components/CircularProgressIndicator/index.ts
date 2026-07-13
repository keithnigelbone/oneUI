export { CircularProgressIndicator } from './CircularProgressIndicator';
export {
  useCircularProgressState,
  CPI_SIZE_TO_ICON_SIZE,
  CPI_SIZE_TO_LABEL_SIZE,
  CPI_LABEL_VISIBLE_SIZES,
  CPI_MATERIAL_TOKEN_LABEL,
  CPI_MATERIAL_GRADIENT_STOPS,
  isCpiLabelVisible,
} from './CircularProgressIndicator.shared';
export type {
  CircularProgressIndicatorProps,
  CircularProgressIndicatorSize,
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorMaterial,
  CircularProgressIndicatorVariant,
  CircularProgressIndicatorContent,
  CircularProgressIndicatorLabelSize,
  CpiLabelVisibleSize,
} from './CircularProgressIndicator.shared';

// Shared preview component (single source of truth for editor + docs rendering)
export { CircularProgressIndicatorPreview } from './CircularProgressIndicatorPreview';
export type { CircularProgressIndicatorPreviewProps } from './CircularProgressIndicatorPreview';
