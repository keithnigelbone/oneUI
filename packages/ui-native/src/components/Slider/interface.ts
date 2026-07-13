/**
 * Slider interface (native)
 * Semantic source: packages/ui/src/components/Slider/Slider.shared.ts
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import { useSurfaceAppearance } from '../../theme';

export type SliderAppearance = ComponentAppearance;
export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderKnobStyle = 'inside' | 'outside';
export type SliderTooltipMode = 'auto' | 'always' | false;
export type SliderSize = 's' | 'm' | 'l';

export interface SliderProps {
  /** Current value (controlled). Number for single thumb, array for range. */
  value?: number | number[];
  /** Default value (uncontrolled). */
  defaultValue?: number | number[];
  /** Called as the user drags. */
  onValueChange?: (value: number | number[]) => void;
  /** Called when the user releases / commits the value. */
  onValueCommitted?: (value: number | number[]) => void;

  min?: number; // default 0
  max?: number; // default 100
  step?: number; // default 1
  largeStep?: number; // default 10
  minStepsBetweenValues?: number;

  /** Multi-accent appearance role. Default 'auto' → 'secondary'. */
  appearance?: SliderAppearance;
  /** Orientation. Default 'horizontal'. */
  orientation?: SliderOrientation;
  /** Size. Default 'm'. */
  size?: SliderSize;
  /** Knob placement style. Default 'outside'. */
  knobStyle?: SliderKnobStyle;

  /** Tooltip visibility. Default 'auto' (drag + focus). */
  showTooltip?: SliderTooltipMode;
  /** Formatter for tooltip value. */
  formatValue?: (value: number, index: number) => string;

  /** Render tick marks at every step. */
  showSteps?: boolean;
  /** Optional labels under step marks. */
  stepLabels?: ReactNode[];
  /**
   * When true (default), the thumb snaps to exact step positions.
   * When false, dragging is continuous but tick marks still appear at step positions.
   */
  snapToSteps?: boolean;

  /** Node rendered at the start of the slider (e.g. an IconButton). 30×30 slot. */
  start?: ReactNode;
  /** Node rendered at the end of the slider (e.g. an IconButton). 30×30 slot. */
  end?: ReactNode;

  disabled?: boolean;
  readOnly?: boolean;

  /** React Native test identifier. */
  testID?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /**
   * Per-thumb aria-label for range sliders (array indexed by thumb).
   */
  ariaLabels?: string[];

  /** Additional native styles. */
  style?: ViewStyle;
}

export interface ResolvedSliderState {
  resolvedAppearance: Exclude<SliderAppearance, 'auto'>;
  isDisabled: boolean;
  isReadOnly: boolean;
  isVertical: boolean;
  isRange: boolean;
  size: SliderSize;
  tooltipMode: SliderTooltipMode;
  knobStyle: SliderKnobStyle;
  values: number[];
}

export function useSliderState(props: SliderProps): ResolvedSliderState {
  const valueSource = props.value ?? props.defaultValue ?? 0;
  const isRange = Array.isArray(valueSource);
  const values = isRange ? (valueSource as number[]) : [valueSource as number];
  const surfaceAppearance = useSurfaceAppearance();

  const resolvedAppearance = (
    props.appearance && props.appearance !== 'auto'
      ? props.appearance
      : surfaceAppearance || 'secondary'
  ) as Exclude<SliderAppearance, 'auto'>;

  const isDisabled = Boolean(props.disabled);
  const isReadOnly = Boolean(props.readOnly);
  const isVertical = props.orientation === 'vertical';
  const size = props.size ?? 'm';
  const tooltipMode = props.showTooltip ?? 'auto';
  const knobStyle = props.knobStyle ?? 'outside';

  return {
    resolvedAppearance,
    isDisabled,
    isReadOnly,
    isVertical,
    isRange,
    size,
    tooltipMode,
    knobStyle,
    values,
  };
}

export function getSliderAccessibilityProps(
  props: Pick<
    SliderProps,
    'aria-label' | 'aria-labelledby' | 'min' | 'max' | 'disabled' | 'readOnly' | 'ariaLabels'
  >,
  state: ResolvedSliderState,
  thumbIndex: number = 0
) {
  const value = state.values[thumbIndex] ?? 0;
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const label = props.ariaLabels?.[thumbIndex] ?? props['aria-label'];

  const out: {
    accessible: boolean;
    accessibilityRole: 'adjustable';
    accessibilityLabel?: string;
    accessibilityLabelledBy?: string;
    accessibilityValue: { min: number; max: number; now: number };
    accessibilityState: { disabled?: boolean; readonly?: boolean };
    importantForAccessibility: 'yes';
    'aria-readonly'?: boolean;
  } = {
    accessible: true,
    accessibilityRole: 'adjustable',
    accessibilityLabel: label,
    accessibilityValue: {
      min,
      max,
      now: value,
    },
    accessibilityState: {
      disabled: state.isDisabled,
    },
    importantForAccessibility: 'yes',
  };

  if (props['aria-labelledby']) {
    out.accessibilityLabelledBy = props['aria-labelledby'];
  }

  if (state.isReadOnly && !state.isDisabled) {
    out.accessibilityState.readonly = true;
    out['aria-readonly'] = true;
  }

  return out;
}
