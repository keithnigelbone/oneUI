/**
 * ToggleGroup.tsx
 * React (web) implementation using Base UI ToggleGroup
 *
 * Key features:
 * - Uses @base-ui/react ToggleGroup primitive (never fork)
 * - Token-only styling in CSS Module
 * - Interactive shape = Shape-M
 * - WCAG AA accessible with keyboard navigation
 * - Supports single and multiple selection
 */

import React, { ReactNode } from 'react';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import styles from './ToggleGroup.module.css';
import { ToggleGroupProps, ToggleGroupItemProps } from './ToggleGroup.shared';

export const ToggleGroup: React.FC<ToggleGroupProps> & {
  Item: typeof ToggleGroupItem;
} = ({
  children,
  value,
  defaultValue,
  onValueChange,
  toggleMultiple = false,
  disabled,
  variant = 'default',
  size = 'medium',
  fullWidth,
  className,
}) => {
  const groupClassName = [styles.group, styles[size], variant === 'subtool' && styles.subtool, fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseToggleGroup
      value={value ? (Array.isArray(value) ? value : [value]) : undefined}
      defaultValue={defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : undefined}
      onValueChange={onValueChange ? (groupValue) => onValueChange(groupValue) : undefined}
      multiple={toggleMultiple}
      disabled={disabled}
      className={groupClassName}
    >
      {children}
    </BaseToggleGroup>
  );
};

const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  children,
  value,
  disabled,
  className,
  ...ariaProps
}) => {
  const itemClassName = [styles.item, className].filter(Boolean).join(' ');

  return (
    <BaseToggle
      value={value}
      disabled={disabled}
      className={itemClassName}
      aria-label={ariaProps['aria-label']}
    >
      {children}
    </BaseToggle>
  );
};

ToggleGroup.Item = ToggleGroupItem;
