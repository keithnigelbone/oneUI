/**
 * Input.tsx
 *
 * Text input **control**: bordered 4-slot container and the text control.
 *
 * - **Standalone**: `<Input aria-label="…" />` — `@base-ui/react/input` with
 *   `aria-label` for accessibility. No visible label or description.
 * - **Inside `InputField`**: `labelAssociation="field"` — `Field.Control` for the
 *   `<input>` under the same `Field.Root`. Label stack lives in `InputField`.
 *
 * For labels, descriptions, feedback, and dynamic rows, use **InputField**.
 */

'use client';

import React, { useCallback, useId } from 'react';
import clsx from 'clsx';
import { Input as BaseInput } from '@base-ui/react/input';
import { Field } from '@base-ui/react/field';
import styles from './Input.module.css';
import {
  InputProps,
  InputAppearance,
  useInputState,
} from './Input.shared';
import { useSurfaceAppearance } from '../Surface';

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null && typeof ref === 'object' && 'current' in ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

const appearanceClassMap: Record<Exclude<InputAppearance, 'auto'>, string | undefined> = {
  primary: undefined,
  neutral: styles.appearanceNeutral,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    labelAssociation = 'native',
    'aria-label': ariaLabel,
    errorHighlight,
    size = 10,
    appearance,
    shape = 'default',
    attention = 'medium',
    start,
    start2,
    end,
    end2,
    placeholder,
    value,
    defaultValue,
    onChange,
    disabled,
    readOnly,
    required,
    name,
    type = 'text',
    onKeyDown,
    onBlur,
    onFocus,
    id: idProp,
    'data-testid': dataTestId,
    autoComplete,
    autoFocus,
    maxLength,
    decorative,
    className,
    style,
  },
  ref,
) {
  const reactId = useId();
  const controlId = idProp ?? `oneui-input-${reactId.replace(/:/g, '')}`;

  const setControlRef = useCallback(
    (el: HTMLInputElement | null) => {
      assignRef(ref, el);
    },
    [ref],
  );

  const parentAppearance = useSurfaceAppearance();
  const { isDisabled, resolvedAppearance, dataAttrs } = useInputState({
    size,
    appearance,
    disabled,
    start,
    end,
  }, parentAppearance);
  const appearanceClassName =
    appearance === 'primary' ? styles.appearancePrimary : appearanceClassMap[resolvedAppearance];

  const startContent = start;
  const start2Content = start2;
  const endContent = end;
  const end2Content = end2;

  const containerClassName = clsx(
    styles.container,
    appearanceClassName,
    shape === 'pill' && styles.shapePill,
    attention === 'high' && styles.attentionHigh,
    readOnly && styles.readOnly,
  );

  const rootClassName = clsx(styles.rootStack, className);

  const controlProps = {
    ref: setControlRef,
    id: controlId,
    className: styles.control,
    placeholder,
    value,
    defaultValue,
    onChange: onChange ? (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) : undefined,
    onKeyDown,
    onBlur,
    onFocus,
    type,
    required,
    readOnly,
    autoFocus,
    autoComplete,
    maxLength,
    name,
    disabled: isDisabled,
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
    ...(decorative ? { 'aria-hidden': true as const, tabIndex: -1 } : {}),
    ...(dataTestId ? { 'data-testid': dataTestId } : {}),
  } satisfies React.ComponentProps<typeof BaseInput>;

  return (
    <div className={rootClassName} style={style}>
      <div
        className={containerClassName}
        {...dataAttrs}
        data-disabled={isDisabled || undefined}
        data-invalid={errorHighlight || undefined}
      >
        {startContent && <span className={styles.start}>{startContent}</span>}
        {start2Content && <span className={styles.start2}>{start2Content}</span>}

        {labelAssociation === 'field' ? <Field.Control {...controlProps} /> : <BaseInput {...controlProps} />}

        {end2Content && <span className={styles.end2}>{end2Content}</span>}
        {endContent && <span className={styles.end}>{endContent}</span>}
      </div>
    </div>
  );
});

Input.displayName = 'Input';
