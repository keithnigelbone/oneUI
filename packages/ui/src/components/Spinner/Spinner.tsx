/**
 * Spinner.tsx
 * React (web) implementation — indeterminate three-color loading indicator.
 *
 * Structure:
 * - Three full `<circle>` elements with pathLength="100", each with its own
 *   independent CSS trim-path animation (stroke-dasharray + stroke-dashoffset
 *   + per-stroke rotation). Values ported from After Effects trim paths.
 * - Three arcs render in three DIFFERENT multi-accent roles:
 *     arc1 → Sparkle (green in Jio)
 *     arc2 → Secondary (orange in Jio)
 *     arc3 → Primary (purple in Jio)
 * - All circles inside a `<g rotate(-90)>` so pathLength 0% starts at 12 o'clock
 * - Uses @base-ui/react Progress primitive for a11y (role="progressbar",
 *   aria-busy, aria-label) — never fork
 * - Reduced-motion compliant
 *
 * @example
 * ```tsx
 * import { Spinner } from '@oneui/ui';
 *
 * <Spinner size="M" />
 * <Spinner size="XL" label="Saving…" />
 * ```
 */

'use client';

import React from 'react';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import clsx from 'clsx';
import styles from './Spinner.module.css';
import {
  SpinnerProps,
  SPINNER_VIEWBOX,
  SPINNER_CENTER,
  useSpinnerGeometry,
} from './Spinner.shared';

export function Spinner({
  size = 'M',
  label = 'Loading',
  className: classNameProp,
  style: styleProp,
  ref,
}: SpinnerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { radius, strokeWidth, dataAttrs } = useSpinnerGeometry(size);
  const className = clsx(styles.root, classNameProp);

  return (
    <BaseProgress.Root value={null} aria-label={label}>
      <div
        ref={ref}
        className={className}
        style={styleProp}
        {...dataAttrs}
      >
        <svg
          className={styles.svg}
          viewBox={`0 0 ${SPINNER_VIEWBOX} ${SPINNER_VIEWBOX}`}
          fill="none"
          aria-hidden="true"
        >
          {/* Rotate -90° so pathLength 0% starts at 12 o'clock */}
          <g transform={`rotate(-90 ${SPINNER_CENTER} ${SPINNER_CENTER})`}>
            <circle
              className={clsx(styles.arc, styles.arc1)}
              cx={SPINNER_CENTER}
              cy={SPINNER_CENTER}
              r={radius}
              pathLength={100}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <circle
              className={clsx(styles.arc, styles.arc2)}
              cx={SPINNER_CENTER}
              cy={SPINNER_CENTER}
              r={radius}
              pathLength={100}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <circle
              className={clsx(styles.arc, styles.arc3)}
              cx={SPINNER_CENTER}
              cy={SPINNER_CENTER}
              r={radius}
              pathLength={100}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </BaseProgress.Root>
  );
}
