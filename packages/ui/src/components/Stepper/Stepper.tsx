/**
 * Stepper.tsx
 * React (web) implementation using Base UI NumberField
 *
 * Key features:
 * - Uses @base-ui/react NumberField primitive (never fork)
 * - Token-only styling in CSS Module
 * - Dual intermediate variable system (appearance + accent)
 * - 3 attention levels (high/medium/low) aligned with Figma spec
 * - 3 sizes (S/M/L) with condensed mode
 * - Multi-accent appearance roles (all 10 V4 roles)
 * - Focus ring always uses Informative token (per Figma spec)
 * - Interactive shape = Pill (per Figma spec)
 * - Surface-context-aware: `appearance` auto/omit inherits nearest `<Surface>` (Badge pattern); always applies resolved appearance class
 * - Optional `start` / `end` slots: single `<IconButton />` element via Base UI `render`
 *
 * Layout contract: DOM order is always decrement → value → increment.
 * `direction="ltr"` renders decrement left / increment right; `direction="rtl"`
 * mirrors the visual order while keeping button semantics unchanged.
 */

'use client';

import React, { useCallback, isValidElement } from 'react';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import styles from './Stepper.module.css';
import {
  StepperProps,
  useStepperState,
} from './Stepper.shared';
import { makeAppearanceClassMap, makeAccentClassMap } from '../_shared/appearanceClasses';
import { useSurfaceAppearance } from '../Surface/Surface';
import { Icon } from '../../icons/Icon';

const APPEARANCE_CLASSES = makeAppearanceClassMap(styles);

const ACCENT_CLASSES = makeAccentClassMap(styles);

export function Stepper({
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  shiftMultiplier = 10,
  disabled,
  readOnly,
  error,
  required,
  size = 'm',
  attention = 'medium',
  appearance,
  accent,
  condensed,
  direction = 'ltr',
  start,
  end,
  className: classNameProp,
  style,
  partProps,
  'data-testid': testId,
  ref,
}: StepperProps & { ref?: React.Ref<HTMLDivElement> }) {
  const surfaceAppearance = useSurfaceAppearance();
  const {
    isDisabled,
    isReadOnly,
    isError,
    resolvedAppearance,
    resolvedAccent,
    resolvedSize,
    resolvedAttention,
    isCond,
    dataAttrs,
  } = useStepperState({
    appearance,
    accent,
    attention,
    disabled,
    readOnly,
    error,
    size,
    condensed,
    direction,
    surfaceAppearance,
  });

  // Wrap Base UI's onValueChange(value) to produce our onChange(event, value)
  const handleValueChange = useCallback(
    (newValue: number | null) => {
      if (onChange) {
        onChange(null, newValue);
      }
    },
    [onChange],
  );

  // Accent class only applied when accent prop is explicitly set
  const accentClass = resolvedAccent ? ACCENT_CLASSES[resolvedAccent] : undefined;

  const appearanceClass = APPEARANCE_CLASSES[resolvedAppearance];

  const groupClassName = [
    styles.group,
    appearanceClass,
    accentClass,
    isDisabled ? styles.disabled : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const rootClassName = [styles.root, classNameProp].filter(Boolean).join(' ');

  // Compute largeStep from step * shiftMultiplier
  const largeStep = step * shiftMultiplier;

  // Base UI merges props/ref onto `render`; omit default icons when a custom render is used.
  const decrementSlotRender = isValidElement(start) ? { render: start } : {};
  const incrementSlotRender = isValidElement(end) ? { render: end } : {};
  const hasDecrementRender = Boolean(
    isValidElement(start) ||
      (partProps?.decrementButton as { render?: unknown } | undefined)?.render,
  );
  const hasIncrementRender = Boolean(
    isValidElement(end) || (partProps?.incrementButton as { render?: unknown } | undefined)?.render,
  );

  return (
    <BaseNumberField.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={isReadOnly ? undefined : handleValueChange}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      disabled={isDisabled}
      required={required}
      className={rootClassName}
      style={style}
      data-testid={testId}
    >
      <BaseNumberField.Group
        className={groupClassName}
        {...dataAttrs}
        {...partProps?.root}
      >
        {/* Semantics stay fixed; `direction` only mirrors the visual order. */}
        <BaseNumberField.Decrement
          className={styles.button}
          aria-label="Decrease value"
          {...decrementSlotRender}
          {...partProps?.decrementButton}
        >
          {!hasDecrementRender ? <Icon name="remove" aria-hidden={true} /> : null}
        </BaseNumberField.Decrement>

        <BaseNumberField.Input
          className={styles.input}
          readOnly={isReadOnly}
          aria-invalid={isError || undefined}
          {...partProps?.input}
        />

        <BaseNumberField.Increment
          className={styles.button}
          aria-label="Increase value"
          {...incrementSlotRender}
          {...partProps?.incrementButton}
        >
          {!hasIncrementRender ? <Icon name="add" aria-hidden={true} /> : null}
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
