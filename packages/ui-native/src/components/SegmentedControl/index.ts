export { SegmentedControl } from './SegmentedControl.native';
export type {
  SegmentedControlProps,
  SegmentedControlItemProps,
  SegmentedControlSize,
  SegmentedControlAttention,
  SegmentedControlTrackEmphasis,
  SegmentedControlShape,
  SegmentedControlType,
  SegmentedControlAppearance,
  ResolvedSegmentedAppearance,
} from './interface';
export {
  useSegmentedControlGroupState,
  useSegmentedControlItemState,
  resolveSegmentedGroupConfig,
  resolveSegmentItemState,
  resolveItemAppearance,
  resolveTrackAppearance,
  resolveSegmentSlotSurface,
  getSegmentedControlAccessibilityProps,
  getSegmentItemAccessibilityProps,
  resolveSegmentItemAccessibilityLabel,
} from './interface';
export {
  SegmentedControlContext,
  useSegmentedControlContext,
  type SegmentedControlContextValue,
} from './SegmentedControlContext';
