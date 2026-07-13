/**
 * Fieldset.tsx
 * React (web) implementation using Base UI Fieldset
 *
 * Key features:
 * - Uses @base-ui/react Fieldset primitive (never fork)
 * - Token-only styling in CSS Module
 * - WCAG AA accessible with proper fieldset/legend semantics
 */

import React from 'react';
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import styles from './Fieldset.module.css';
import { FieldsetProps } from './Fieldset.shared';

export const Fieldset: React.FC<FieldsetProps> = ({
  children,
  legend,
  disabled,
  className,
  style,
}) => {
  const fieldsetClassName = [styles.fieldset, className].filter(Boolean).join(' ');

  return (
    <BaseFieldset.Root disabled={disabled} className={fieldsetClassName} style={style}>
      {legend && <BaseFieldset.Legend className={styles.legend}>{legend}</BaseFieldset.Legend>}
      {children}
    </BaseFieldset.Root>
  );
};
