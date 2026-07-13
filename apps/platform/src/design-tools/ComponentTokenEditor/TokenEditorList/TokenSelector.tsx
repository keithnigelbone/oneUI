/**
 * TokenSelector.tsx
 *
 * Dropdown selector for choosing a token value.
 */

'use client';

import React from 'react';
import type { TokenSelectorProps } from '../types';
import styles from '../PropertyPanel/PropertyPanel.module.css';

/**
 * TokenSelector Component
 *
 * Dropdown for selecting a token from available options.
 */
export function TokenSelector({
  value,
  options,
  disabled = false,
  onChange,
  className,
}: TokenSelectorProps) {
  return (
    <select
      className={`${styles.tokenSelect} ${className || ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {options.map((opt) => (
        <option key={opt.token} value={opt.token}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
