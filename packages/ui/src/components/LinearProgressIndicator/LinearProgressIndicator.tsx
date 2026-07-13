/**
 * LinearProgressIndicator.tsx
 *
 * Horizontal progress bar using Base UI Progress (never fork).
 * Determinate fill from `value`; indeterminate animated segment.
 * Figma API: type, size (S/M/L), roundCaps, appearance + code-only value.
 */

'use client';

import React, { forwardRef } from 'react';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import clsx from 'clsx';
import styles from './LinearProgressIndicator.module.css';
import {
  type LinearProgressIndicatorAppearance,
  type LinearProgressIndicatorProps,
  useLinearProgressState,
} from './LinearProgressIndicator.shared';

const appearanceClassMap: Record<
  Exclude<LinearProgressIndicatorAppearance, 'auto'>,
  string | undefined
> = {
  primary: undefined,
  neutral: styles.appearanceNeutral,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

export const LinearProgressIndicator = forwardRef<
  HTMLDivElement,
  LinearProgressIndicatorProps
>(function LinearProgressIndicator(
  {
    type = 'determinate',
    size = 'M',
    appearance = 'primary',
    roundCaps = true,
    value = 0,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className,
    style,
    'data-testid': dataTestId,
  },
  ref,
) {
  const { progressValue, resolvedAppearance, isIndeterminate, dataAttrs } =
    useLinearProgressState({
      type,
      size,
      appearance,
      roundCaps,
      value,
    });

  if (process.env.NODE_ENV !== 'production' && !ariaLabel && !ariaLabelledby) {
    console.warn(
      'LinearProgressIndicator: an `aria-label` or `aria-labelledby` prop is required for accessibility.',
    );
  }

  const rootClassName = clsx(
    styles.root,
    appearanceClassMap[resolvedAppearance],
  );

  return (
    <BaseProgress.Root
      className={clsx(styles.progressRoot, className)}
      value={progressValue}
      min={0}
      max={100}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      <div
        ref={ref}
        className={rootClassName}
        style={style}
        data-testid={dataTestId}
        {...dataAttrs}
      >
        <BaseProgress.Track className={styles.track}>
          <BaseProgress.Indicator
            className={clsx(
              styles.indicator,
              isIndeterminate && styles.indicatorIndeterminate,
            )}
            render={(props, state) => (
              <div
                {...props}
                style={
                  state.status === 'indeterminate' ? undefined : props.style
                }
              />
            )}
          />
        </BaseProgress.Track>
      </div>
    </BaseProgress.Root>
  );
});
