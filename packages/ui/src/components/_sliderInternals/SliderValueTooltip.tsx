/**
 * SliderValueTooltip
 * Lightweight CSS tooltip rendered INSIDE Slider.Thumb. Anchors directly to
 * the thumb DOM so it follows the knob as Base UI animates along the track.
 *
 * Visibility modes:
 *  - 'auto':  shown while dragging or when the thumb's input is focus-visible
 *  - 'always': always visible
 *  - false:   not rendered at all
 *
 * Arrow uses the same Figma SVG tip path as the Tooltip component.
 * Two pre-oriented SVGs live inside the arrow wrapper; CSS shows only the
 * one matching the slider orientation (horizontal → top, vertical → right).
 */

import React from 'react';
import styles from './SliderValueTooltip.module.css';
import type { SliderTooltipMode } from '../Slider/Slider.shared';

export interface SliderValueTooltipProps {
  /** Tooltip visibility mode */
  mode: SliderTooltipMode;
  /** Current value for this thumb */
  value: number;
  /** Formatter */
  format?: (value: number) => string;
}

// Same Figma tip path used by Tooltip.tsx — apex naturally points DOWN.
const FIGMA_TIP_PATH =
  'M7.18173 5.15746L4.3897 2.03407C3.22548 0.731678 1.64646 0 0 0H18C16.3535 0 14.7745 0.731676 13.6103 2.03407L10.8183 5.15746C9.81407 6.28085 8.18593 6.28085 7.18173 5.15746Z';

export const SliderValueTooltip: React.FC<SliderValueTooltipProps> = ({
  mode,
  value,
  format,
}) => {
  if (mode === false) return null;

  const label = format ? format(value) : String(value);
  const alwaysOpen = mode === 'always';

  return (
    <span
      className={styles.bubble}
      data-open={alwaysOpen ? '' : undefined}
      data-slider-tooltip
      role="presentation"
    >
      {label}
      <span className={styles.arrow} aria-hidden="true">
        {/* Horizontal slider: bubble above knob → apex points DOWN */}
        <svg width="18" height="6" viewBox="0 0 18 6" fill="none" className={styles.arrowH}>
          <path d={FIGMA_TIP_PATH} className={styles.arrowFill} />
        </svg>
        {/* Vertical slider: bubble to the right of knob → apex points LEFT */}
        <svg width="6" height="18" viewBox="0 0 6 18" fill="none" className={styles.arrowV}>
          <path d={FIGMA_TIP_PATH} className={styles.arrowFill} transform="translate(6 0) rotate(90)" />
        </svg>
      </span>
    </span>
  );
};
