/**
 * Progress interface (native)
 */

import type { ViewStyle } from 'react-native';

export type ProgressSize = 'small' | 'medium' | 'large';

export interface ProgressProps {
  value?: number;
  max?: number;
  min?: number;
  size?: ProgressSize;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  style?: ViewStyle;
  testID?: string;
}

export function useProgressState(props: ProgressProps) {
  const { value = 0, min = 0, max = 100 } = props;
  const percentage = ((value - min) / (max - min)) * 100;

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    isIndeterminate: props.value === undefined || props.value === null,
  };
}

export function getProgressAccessibilityProps(
  props: Pick<ProgressProps, 'aria-label' | 'aria-labelledby' | 'min' | 'max' | 'value'>,
  state: { isIndeterminate: boolean },
): {
  accessible: true;
  accessibilityRole: 'progressbar';
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string;
  accessibilityState: { busy: boolean };
  accessibilityValue?: { min: number; max: number; now: number };
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-busy': boolean;
} {
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const busy = state.isIndeterminate;
  return {
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel: props['aria-label'],
    ...(props['aria-labelledby']
      ? { accessibilityLabelledBy: props['aria-labelledby'] }
      : {}),
    accessibilityState: { busy },
    ...(busy
      ? {}
      : {
          accessibilityValue: { min, max, now: props.value ?? 0 },
          'aria-valuemin': min,
          'aria-valuemax': max,
          'aria-valuenow': props.value,
        }),
    'aria-busy': busy,
  };
}

export const PROGRESS_INDICATOR_A11Y = {
  'aria-hidden': true as const,
};
