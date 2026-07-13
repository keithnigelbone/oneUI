/**
 * Meter.tsx
 * React (web) implementation using Base UI Meter
 *
 * Key features:
 * - Uses @base-ui/react Meter primitive (never fork)
 * - Token-only styling in CSS Module
 * - Pill shape track and indicator
 * - WCAG AA accessible with proper role
 * - Status-based coloring (low/medium/high)
 */

import React from 'react';
import { Meter as BaseMeter } from '@base-ui/react/meter';
import styles from './Meter.module.css';
import { MeterProps } from './Meter.shared';

export const Meter: React.FC<MeterProps> = ({
  value,
  min = 0,
  max = 100,
  size = 'medium',
  className,
  ...ariaProps
}) => {
  const rootClassName = [styles[size], className].filter(Boolean).join(' ');

  return (
    <BaseMeter.Root
      value={value}
      min={min}
      max={max}
      className={rootClassName}
      aria-label={ariaProps['aria-label']}
    >
      <BaseMeter.Track className={styles.track}>
        <BaseMeter.Indicator className={styles.indicator} />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
};
