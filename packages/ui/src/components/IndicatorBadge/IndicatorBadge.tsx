/**
 * IndicatorBadge.tsx
 * React (web) implementation
 *
 * Non-interactive display component showing a colored dot for status/presence indication.
 * Uses token-only styling via CSS Module.
 * Multi-accent appearance roles (all 9 V4 roles).
 * Surface-context-aware: automatically adapts when inside <Surface mode="bold">.
 */

import React from 'react';
import clsx from 'clsx';
import styles from './IndicatorBadge.module.css';
import {
  IndicatorBadgeProps,
  IndicatorBadgeAppearance,
  useIndicatorBadgeState,
} from './IndicatorBadge.shared';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';

const appearanceClassMap = makeAppearanceClassMap(styles);

export const IndicatorBadge = React.forwardRef<HTMLSpanElement, IndicatorBadgeProps>(function IndicatorBadge(
  {
    size = 'm',
    appearance,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    className: classNameProp,
    style: styleProp,
  },
  ref,
) {
    const { resolvedAppearance, dataAttrs } = useIndicatorBadgeState({
      size,
      appearance,
      'aria-label': ariaLabel,
    });

    // Dev-mode warning for missing aria-label
    if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
      console.warn(
        'IndicatorBadge: `aria-label` prop is required for accessibility.',
      );
    }

    const className = clsx(
      styles.badge,
      appearanceClassMap[resolvedAppearance],
      classNameProp,
    );

  return (
    <span
      ref={ref}
      role="status"
      className={className}
      style={styleProp}
      aria-label={ariaLabel}
      {...(dataTestId ? { 'data-testid': dataTestId } : {})}
      {...dataAttrs}
    />
  );
});
IndicatorBadge.displayName = 'IndicatorBadge';
