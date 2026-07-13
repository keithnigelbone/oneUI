/**
 * Progress.tsx
 * React (web) implementation using Base UI Progress
 *
 * Key features:
 * - Uses @base-ui/react Progress primitive (never fork)
 * - Token-only styling in CSS Module
 * - Circular shape = Pill (track and indicator)
 * - WCAG AA accessible with proper role
 * - Supports indeterminate state
 */

import React from 'react';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import styles from './Progress.module.css';
import { ProgressProps } from './Progress.shared';

export const Progress: React.FC<ProgressProps> = ({
  value,
  min = 0,
  max = 100,
  size = 'medium',
  className,
  ...ariaProps
}) => {
  const rootClassName = [styles[size], className].filter(Boolean).join(' ');

  return (
    <BaseProgress.Root
      value={value ?? null}
      min={min}
      max={max}
      className={rootClassName}
      aria-label={ariaProps['aria-label']}
      aria-labelledby={ariaProps['aria-labelledby']}
    >
      <BaseProgress.Track className={styles.track}>
        <BaseProgress.Indicator className={styles.indicator} />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
};
