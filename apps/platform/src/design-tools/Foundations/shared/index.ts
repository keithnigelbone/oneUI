/**
 * Foundations shared components
 * Re-export all shared components and types
 */

// Components
export { SliderControl } from './SliderControl';
export type { SliderControlProps } from './SliderControl.shared';

export { ScaleVisualizer } from './ScaleVisualizer';
export type { ScaleVisualizerProps, ScaleItem } from './ScaleVisualizer.shared';

export { AccessibilityBadge } from './AccessibilityBadge';
export type { AccessibilityBadgeProps } from './AccessibilityBadge.shared';

export { FoundationCard } from './FoundationCard';
export type { FoundationCardProps } from './FoundationCard.shared';

export { FluidDimensionPreview, DEFAULT_FLUID_ENDPOINTS } from './FluidDimensionPreview';
export type { FluidDimensionPreviewProps, FluidEndpoints } from './FluidDimensionPreview';

export { GridScalePreview } from './GridScalePreview';
export type { GridScalePreviewProps, GridBreakpointSpec } from './GridScalePreview';

export { PreviewControls } from './PreviewControls';
export type {
  PreviewControlsProps,
  PreviewControlsField,
  PreviewControlsReadout,
} from './PreviewControls';

export { Sheet } from './Sheet';
export type { SheetProps } from './Sheet';

export { CubicBezierEditor } from './CubicBezierEditor';
export type { CubicBezierEditorProps } from './CubicBezierEditor';

export { ApplyChangesBar } from './ApplyChangesBar';
export type { ApplyChangesBarProps } from './ApplyChangesBar.shared';

// Types
export type {
  FoundationType,
  FoundationDraftState,
  FoundationDraftActions,
} from './foundation.types';
