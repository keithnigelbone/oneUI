/**
 * Slider.shared.ts
 * Shared types and hooks for Slider component.
 *
 * Figma spec (single size):
 *   Container: 328×24
 *   knobStyle="outside": 4px rail + 12px solid accent-filled knob on top
 *   knobStyle="inside":  12px filled track + 4px white dot centered in thumb
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { useSurfaceAppearance } from '../Surface';

export type SliderAppearance = ComponentAppearance;
export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderKnobStyle = 'inside' | 'outside';
export type SliderTooltipMode = 'auto' | 'always' | false;

export interface SliderProps {
  /** Current value (controlled). Number for single thumb, array for range. */
  value?: number | number[];
  /** Default value (uncontrolled). */
  defaultValue?: number | number[];
  /** Called as the user drags. */
  onValueChange?: (value: number | number[]) => void;
  /** Called when the user releases / commits the value. */
  onValueCommitted?: (value: number | number[]) => void;

  min?: number;                 // default 0
  max?: number;                 // default 100
  step?: number;                // default 1
  largeStep?: number;           // default 10
  minStepsBetweenValues?: number;

  /** Multi-accent appearance role. Default 'auto' → 'secondary'. */
  appearance?: SliderAppearance;
  /** Orientation. Default 'horizontal'. */
  orientation?: SliderOrientation;
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

  /** Node rendered at the start of the slider (e.g. an IconButton). 30×30 slot per Figma. */
  start?: ReactNode;
  /** Node rendered at the end of the slider (e.g. an IconButton). 30×30 slot per Figma. */
  end?: ReactNode;

  disabled?: boolean;
  readOnly?: boolean;

  name?: string;
  form?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /**
   * Per-thumb aria-label for range sliders (array indexed by thumb). Falls back to `aria-label` when absent.
   * Use this only in range mode; for single-thumb sliders use `aria-label`.
   */
  ariaLabels?: string[];

  className?: string;
  style?: CSSProperties;
}

export interface ResolvedSliderState {
  resolvedAppearance: Exclude<SliderAppearance, 'auto'>;
  isDisabled: boolean;
  isReadOnly: boolean;
  isVertical: boolean;
  isRange: boolean;
  tooltipMode: SliderTooltipMode;
  knobStyle: SliderKnobStyle;
  values: number[];
  /** Data attributes to spread on the root element — matches Button/Stepper house pattern. */
  dataAttrs: Record<string, string | undefined>;
}

export function useSliderState(props: SliderProps): ResolvedSliderState {
  const valueSource = props.value ?? props.defaultValue ?? 0;
  const isRange = Array.isArray(valueSource);
  const values = isRange ? (valueSource as number[]) : [valueSource as number];

  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance = (
    props.appearance && props.appearance !== 'auto'
      ? props.appearance
      : (parentAppearance ?? 'secondary')
  ) as Exclude<SliderAppearance, 'auto'>;

  // readOnly must NOT collapse into disabled — a read-only control stays
  // focusable and keyboard-navigable (so it's announced and reachable), it
  // just rejects value changes. Only `disabled` makes it inert.
  const isDisabled = Boolean(props.disabled);
  const isReadOnly = Boolean(props.readOnly);
  const isVertical = props.orientation === 'vertical';
  const tooltipMode = props.showTooltip ?? 'auto';
  const knobStyle = props.knobStyle ?? 'outside';
  const snapToSteps = props.snapToSteps ?? true;

  const dataAttrs: Record<string, string | undefined> = {
    'data-appearance': resolvedAppearance,
    'data-knob-style': knobStyle,
    ...(isRange ? { 'data-range': '' } : {}),
    ...(isReadOnly ? { 'data-readonly': '' } : {}),
    ...(snapToSteps ? { 'data-snap': '' } : {}),
  };

  return {
    resolvedAppearance,
    isDisabled,
    isReadOnly,
    isVertical,
    isRange,
    tooltipMode,
    knobStyle,
    values,
    dataAttrs,
  };
}
