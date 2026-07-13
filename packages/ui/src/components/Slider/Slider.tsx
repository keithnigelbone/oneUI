/**
 * Slider.tsx
 * React (web) implementation using Base UI Slider.
 *
 * Figma-aligned (single size). Supports appearance (9 roles), knobStyle
 * (inside/outside), range mode, vertical orientation, step ticks, and a
 * value tooltip that anchors directly to the thumb DOM.
 *
 * Value tracking:
 *   Controlled   — `value` prop is the source of truth.
 *   Uncontrolled — internal state is updated on every onValueChange, so the
 *                  tooltip label stays in sync during drag.
 */

'use client';

import React from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import styles from './Slider.module.css';
import {
  SliderProps,
  SliderAppearance,
  useSliderState,
} from './Slider.shared';
import {
  SliderKnob,
  SliderActiveTrack,
  SliderSteps,
  SliderValueTooltip,
} from '../_sliderInternals';

const APPEARANCE_CLASSES: Record<Exclude<SliderAppearance, 'auto'>, string | undefined> = {
  primary: undefined,
  neutral: styles.appearanceNeutral,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  'brand-bg': styles.appearanceBrandBg,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

export const Slider: React.FC<SliderProps> = (props) => {
  const s = useSliderState(props);
  const {
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    minStepsBetweenValues,
    orientation = 'horizontal',
    showSteps = false,
    stepLabels,
    snapToSteps = true,
    start,
    end,
    formatValue,
    name,
    ariaLabels,
    className,
    style,
  } = props;

  const freeDragStep = Math.min(step, (max - min) / 1000);
  const dragStep = snapToSteps ? step : freeDragStep;

  const isControlled = value !== undefined;
  const initialInternal = defaultValue ?? (s.isRange ? [0] : 0);
  const [internalValue, setInternalValue] = React.useState<number | number[]>(initialInternal);

  const currentValue = (isControlled ? value : internalValue) as number | number[];
  const currentValues = Array.isArray(currentValue)
    ? (currentValue as number[])
    : [currentValue as number];

  // Which thumb index is currently being moved by a pointer interaction.
  // Detected via onValueChange (tells us which thumb moved) and cleared on
  // pointerup so the knob scale-up matches the physical pointer-down window.
  const [activeKnobIndex, setActiveKnobIndex] = React.useState<number | null>(null);
  const prevValuesRef = React.useRef<number[]>(
    Array.isArray(initialInternal)
      ? (initialInternal as number[])
      : [initialInternal as number],
  );

  React.useEffect(() => {
    const clear = () => setActiveKnobIndex(null);
    window.addEventListener('pointerup', clear);
    window.addEventListener('pointercancel', clear);
    return () => {
      window.removeEventListener('pointerup', clear);
      window.removeEventListener('pointercancel', clear);
    };
  }, []);

  const handleValueChange = React.useCallback(
    (next: number | number[]) => {
      // Read-only sliders accept focus and keyboard nav but never mutate.
      if (s.isReadOnly) return;
      if (!isControlled) setInternalValue(next);

      const nextArr = Array.isArray(next) ? (next as number[]) : [next as number];
      const prev = prevValuesRef.current;
      const changedIdx = nextArr.findIndex((v, i) => v !== (prev[i] ?? v));
      if (changedIdx >= 0) setActiveKnobIndex(changedIdx);
      prevValuesRef.current = nextArr;

      onValueChange?.(next);
    },
    [s.isReadOnly, isControlled, onValueChange],
  );

  const rootClassName = [
    styles.root,
    APPEARANCE_CLASSES[s.resolvedAppearance],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseSlider.Root
      value={value}
      defaultValue={defaultValue ?? (s.isRange ? [0] : 0)}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      step={dragStep}
      largeStep={largeStep}
      minStepsBetweenValues={minStepsBetweenValues}
      orientation={orientation}
      disabled={s.isDisabled}
      onValueCommitted={s.isReadOnly ? undefined : onValueCommitted}
      name={name}
      className={rootClassName}
      style={style}
      {...s.dataAttrs}
      aria-label={props['aria-label']}
      aria-labelledby={props['aria-labelledby']}
      aria-readonly={s.isReadOnly || undefined}
    >
      {start && (
        <div className={styles.slot} data-slider-slot="start">
          {start}
        </div>
      )}
      <BaseSlider.Control className={styles.control}>
        <BaseSlider.Track className={styles.track}>
          {showSteps && (
            <SliderSteps
              min={min}
              max={max}
              step={step}
              activeValues={currentValues}
              labels={stepLabels}
              orientation={orientation}
            />
          )}
          <SliderActiveTrack />
          {currentValues.map((thumbValue, index) => {
            const ariaLabelForThumb = ariaLabels?.[index] ?? props['aria-label'];
            return (
              <SliderKnob
                key={`knob-${index}`}
                index={index}
                ariaLabel={ariaLabelForThumb}
                isPointerActive={activeKnobIndex === index}
                onPointerDown={() => setActiveKnobIndex(index)}
              >
                {s.tooltipMode !== false && (
                  <SliderValueTooltip
                    mode={s.tooltipMode}
                    value={thumbValue}
                    format={formatValue ? (v) => formatValue(v, index) : undefined}
                  />
                )}
              </SliderKnob>
            );
          })}
        </BaseSlider.Track>
      </BaseSlider.Control>
      {end && (
        <div className={styles.slot} data-slider-slot="end">
          {end}
        </div>
      )}
    </BaseSlider.Root>
  );
};
