/**
 * Form.tsx
 * React (web) implementation using Base UI Form
 *
 * Key features:
 * - Uses @base-ui/react Form primitive (never fork)
 * - Token-only styling in CSS Module
 * - WCAG AA accessible with proper form semantics
 * - Integrates with Field components for validation
 */

import React from 'react';
import { Form as BaseForm } from '@base-ui/react/form';
import styles from './Form.module.css';
import { FormProps } from './Form.shared';

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className,
  style,
}) => {
  const formClassName = [styles.form, className].filter(Boolean).join(' ');

  return (
    <BaseForm
      className={formClassName}
      onSubmit={onSubmit}
      style={style}
    >
      {children}
    </BaseForm>
  );
};
