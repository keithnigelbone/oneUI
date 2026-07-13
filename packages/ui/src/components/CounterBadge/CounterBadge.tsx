/**
 * CounterBadge.tsx
 * React (web) implementation
 *
 * Non-interactive display component showing a numeric count (e.g., unread notifications).
 * Uses token-only styling, multi-accent appearance roles, and surface-context awareness.
 *
 * @example
 * ```tsx
 * import { CounterBadge } from '@oneui/ui';
 *
 * <CounterBadge value={5} />
 * <CounterBadge value={150} max={99} aria-label="150 unread messages" />
 * ```
 */

import React from 'react';
import clsx from 'clsx';
import styles from './CounterBadge.module.css';
import { CounterBadgeProps, useCounterBadgeState } from './CounterBadge.shared';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';

const appearanceClassMap = makeAppearanceClassMap(styles);

export function CounterBadge({
  value,
  max,
  showZero,
  size = 'm',
  attention,
  appearance,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  className: classNameProp,
  style: styleProp,
  ref,
}: CounterBadgeProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { resolvedVariant, resolvedAppearance, displayValue, isHidden, dataAttrs } = useCounterBadgeState({
    value,
    max,
    showZero,
    size,
    attention,
    appearance,
  });

  // Dev-mode warning for missing aria-label
  if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
    console.warn('CounterBadge: an `aria-label` prop is recommended for accessibility.');
  }

  // Hidden when value is 0 and showZero is false
  if (isHidden) {
    return null;
  }

  const className = clsx(
    styles.badge,
    styles[resolvedVariant],
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
    >
      {displayValue}
    </span>
  );
}
CounterBadge.displayName = 'CounterBadge';
