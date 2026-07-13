/**
 * Toggle.tsx
 * React (web) implementation using Base UI Toggle
 *
 * Key features:
 * - Uses @base-ui/react Toggle primitive (never fork)
 * - Token-only styling in CSS Module
 * - Interactive shape = Shape-M
 * - WCAG AA accessible
 */

import React from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import styles from './Toggle.module.css';
import { ToggleProps } from './Toggle.shared';

export const Toggle: React.FC<ToggleProps> = ({
  children,
  pressed,
  defaultPressed,
  onPressedChange,
  size = 'medium',
  disabled,
  className,
  ...ariaProps
}) => {
  const toggleClassName = [styles.toggle, styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseToggle
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={toggleClassName}
      aria-label={ariaProps['aria-label']}
    >
      {children}
    </BaseToggle>
  );
};
