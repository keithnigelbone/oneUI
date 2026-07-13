/**
 * CheckboxGroup.tsx
 * React (web) implementation using Base UI CheckboxGroup
 *
 * Key features:
 * - Uses @base-ui/react CheckboxGroup primitive (never fork)
 * - Token-only styling in CSS Module
 * - WCAG AA accessible
 * - Works with individual Checkbox components
 */

import React from 'react';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import styles from './CheckboxGroup.module.css';
import { CheckboxGroupProps } from './CheckboxGroup.shared';

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
  'aria-describedby': ariaDescribedBy,
}) => {
  const groupClassName = [styles.group, className].filter(Boolean).join(' ');

  return (
    <BaseCheckboxGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (value) => onValueChange(value) : undefined}
      disabled={disabled}
      className={groupClassName}
      {...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {})}
    >
      {children}
    </BaseCheckboxGroup>
  );
};
