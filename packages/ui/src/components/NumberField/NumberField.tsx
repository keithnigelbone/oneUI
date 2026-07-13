/**
 * NumberField.tsx
 * React (web) implementation using Base UI NumberField
 *
 * Key features:
 * - Uses @base-ui/react NumberField primitive (never fork)
 * - Token-only styling in CSS Module
 * - Interactive shape = Shape-M
 * - WCAG AA accessible with keyboard support (Arrow keys, Shift+Arrow)
 * - Increment/decrement buttons
 */

import React from 'react';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import styles from './NumberField.module.css';
import { NumberFieldProps } from './NumberField.shared';

export const NumberField: React.FC<NumberFieldProps> = ({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  largeStep = 10,
  label,
  size = 'medium',
  disabled,
  required,
  name,
  placeholder,
  className,
}) => {
  const rootClassName = [styles.root, styles[size], className].filter(Boolean).join(' ');

  return (
    <BaseNumberField.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (value) => onValueChange(value) : undefined}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      disabled={disabled}
      required={required}
      name={name}
      className={rootClassName}
    >
      {label && <BaseNumberField.ScrubArea>
        <label className={styles.label}>{label}</label>
      </BaseNumberField.ScrubArea>}

      <BaseNumberField.Group className={styles.group}>
        <BaseNumberField.Decrement className={styles.decrement}>
          <MinusIcon className={styles.buttonIcon} />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input className={styles.input} placeholder={placeholder} />
        <BaseNumberField.Increment className={styles.increment}>
          <PlusIcon className={styles.buttonIcon} />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
};

function MinusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 12 12" fill="currentcolor" {...props}>
      <path d="M1.5 5.25H10.5V6.75H1.5V5.25Z" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 12 12" fill="currentcolor" {...props}>
      <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
    </svg>
  );
}
