/**
 * TouchSlider interface (native)
 * Semantic source: packages/ui/src/components/TouchSlider/TouchSlider.shared.ts
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

export type TouchSliderAppearance = ComponentAppearance;
export type TouchSliderOrientation = 'horizontal' | 'vertical';
export type TouchSliderProgressStyle = 'rounded' | 'sharp';

export interface TouchSliderProps {
  /** The value of the slider. Use for controlled components. */
  value?: number | number[];
  /** The default value when uncontrolled. */
  defaultValue?: number | number[];
  /** Called when the value changes. */
  onValueChange?: (value: number | number[]) => void;
  /** Called when the interaction ends. */
  onValueCommitted?: (value: number | number[]) => void;

  /** Minimum value. @default 0 */
  min?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
  /** Large step increment. @default 10 */
  largeStep?: number;

  /** Multi-accent appearance role. @default "auto" */
  appearance?: TouchSliderAppearance;
  /** Slider orientation. @default "horizontal" */
  orientation?: TouchSliderOrientation;
  /** Progress edge style. @default "rounded" */
  progressStyle?: TouchSliderProgressStyle;

  /** Optional node rendered before the track (e.g. an icon). 30×30 slot. */
  start?: ReactNode;

  /** Whether the slider is disabled. @default false */
  disabled?: boolean;
  /** Whether the slider is read-only. @default false */
  readOnly?: boolean;

  /** Accessible label for the slider. */
  'aria-label'?: string;
  /** ID of an element labelling the slider. */
  'aria-labelledby'?: string;

  /** React Native test identifier. */
  testID?: string;
  /** Additional native styles for the root container. */
  style?: ViewStyle;
}

export interface ResolvedTouchSliderState {
  resolvedAppearance: Exclude<TouchSliderAppearance, 'auto'>;
  isDisabled: boolean;
  isReadOnly: boolean;
  isVertical: boolean;
  progressStyle: TouchSliderProgressStyle;
  values: number[];
}

export function useTouchSliderState(props: TouchSliderProps): ResolvedTouchSliderState {
  const valueSource = props.value ?? props.defaultValue ?? 0;
  const values = Array.isArray(valueSource) ? valueSource : [valueSource];

  // Matches web shared logic: 'auto' resolves to 'secondary'
  const resolvedAppearance = (
    props.appearance && props.appearance !== 'auto'
      ? props.appearance
      : 'secondary'
  ) as Exclude<TouchSliderAppearance, 'auto'>;

  return {
    resolvedAppearance,
    isDisabled: Boolean(props.disabled),
    isReadOnly: Boolean(props.readOnly),
    isVertical: props.orientation === 'vertical',
    progressStyle: props.progressStyle ?? 'rounded',
    values,
  };
}

/**
 * Maps TouchSlider props to RN accessibility props.
 *
 * `accessibilityState.disabled` reflects `disabled` only — read-only sliders stay
 * focusable and announce their value. Read-only is conveyed via `aria-readonly`
 * (RN Web) when not also disabled.
 */
export function getTouchSliderAccessibilityProps(
  props: Pick<TouchSliderProps, 'aria-label' | 'aria-labelledby' | 'min' | 'max' | 'disabled' | 'readOnly'>,
  state: ResolvedTouchSliderState
): {
  accessible: true;
  accessibilityRole: 'adjustable';
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string;
  accessibilityValue: { min: number; max: number; now: number };
  accessibilityState: { disabled: boolean };
  importantForAccessibility: 'yes';
  'aria-readonly'?: boolean;
} {
  const value = state.values[0] ?? 0;
  const min = props.min ?? 0;
  const max = props.max ?? 100;

  return {
    accessible: true,
    accessibilityRole: 'adjustable',
    accessibilityLabel: props['aria-label'],
    ...(props['aria-labelledby']
      ? { accessibilityLabelledBy: props['aria-labelledby'] }
      : {}),
    accessibilityValue: {
      min,
      max,
      now: value,
    },
    accessibilityState: {
      disabled: state.isDisabled,
    },
    ...(state.isReadOnly && !state.isDisabled ? { 'aria-readonly': true } : {}),
    importantForAccessibility: 'yes',
  };
}
