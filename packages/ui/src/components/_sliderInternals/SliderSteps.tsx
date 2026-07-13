/**
 * SliderSteps
 * Private Slider subcomponent — renders discrete tick marks along the track.
 * Reads current values via the passed-in `activeValues` array to light up
 * ticks that sit under the indicator.
 *
 * Note: absolutely-positioned inside the track; pointer-events: none.
 */

import React from 'react';
import styles from './SliderSteps.module.css';

export interface SliderStepsProps {
  min: number;
  max: number;
  step: number;
  /** Current values — used to mark ticks as `data-active`. */
  activeValues: number[];
  /** Optional labels under each tick. */
  labels?: React.ReactNode[];
  orientation?: 'horizontal' | 'vertical';
}

export const SliderSteps: React.FC<SliderStepsProps> = ({
  min,
  max,
  step,
  activeValues,
  labels,
  orientation = 'horizontal',
}) => {
  const count = Math.floor((max - min) / step) + 1;
  if (count <= 1 || count > 64) return null;

  const minValue = activeValues.length > 1 ? Math.min(...activeValues) : min;
  const maxValue = activeValues[activeValues.length - 1] ?? min;
  const range = max - min;
  const isVertical = orientation === 'vertical';

  return (
    <div className={styles.steps} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        // Skip edge ticks (min + max) — the track's own pill caps mark those
        // positions, and a dot centered at 0% or 100% would render half outside
        // the rounded corner. This matches the Figma pattern (ticks inside the
        // rail, edges implied by the cap geometry).
        if (i === 0 || i === count - 1) return null;

        const value = min + i * step;
        const isActive = value >= minValue && value <= maxValue;
        const label = labels?.[i];
        // Match Base UI thumb math: horizontal thumbs sit at `left: V%`,
        // vertical thumbs at `bottom: V%`. Centering each tick on the same
        // percentage lines thumbs and ticks up exactly at every step.
        const percent = range > 0 ? ((value - min) / range) * 100 : 0;
        const positionStyle = isVertical
          ? { bottom: `${percent}%` }
          : { left: `${percent}%` };
        return (
          <span
            key={i}
            className={styles.tickLabelWrap}
            style={positionStyle}
          >
            <span className={styles.tick} data-active={isActive || undefined} />
            {label !== undefined && <span className={styles.tickLabel}>{label}</span>}
          </span>
        );
      })}
    </div>
  );
};
