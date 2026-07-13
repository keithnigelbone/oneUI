/**
 * SliderKnob
 * Private Slider subcomponent — renders Base UI Slider.Thumb with a solid
 * accent-filled dot (no border/stroke). Figma: .Knob node 5723:7913.
 *
 * Can optionally render children inside the thumb — used by the tooltip
 * which needs to anchor to the actual thumb DOM node (not an outer wrapper).
 */

import React from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import styles from './SliderKnob.module.css';

export interface SliderKnobProps {
  /** Thumb index — 0 for single, 0/1 for range. */
  index: number;
  /** Accessible label forwarded to the underlying input. */
  ariaLabel?: string;
  /** Accessible valuetext formatter. */
  getAriaValueText?: (formattedValue: string, value: number, index: number) => string;
  /** Set by Slider when this thumb is the one currently being moved by a pointer.
   *  Drives data-knob-active so only the interacted knob scales in range mode. */
  isPointerActive?: boolean;
  /** Called on pointerdown so Slider can set activeKnobIndex immediately,
   *  before pointer capture removes :hover from the element. */
  onPointerDown?: () => void;
  /** Extra nodes rendered inside the thumb — used for the floating tooltip. */
  children?: React.ReactNode;
}

export const SliderKnob: React.FC<SliderKnobProps> = ({
  index,
  ariaLabel,
  getAriaValueText,
  isPointerActive = false,
  onPointerDown,
  children,
}) => {
  return (
    <BaseSlider.Thumb
      index={index}
      className={styles.knob}
      getAriaLabel={ariaLabel ? () => ariaLabel : undefined}
      getAriaValueText={getAriaValueText}
      onPointerDown={onPointerDown}
      data-knob-active={isPointerActive ? '' : undefined}
    >
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </BaseSlider.Thumb>
  );
};
