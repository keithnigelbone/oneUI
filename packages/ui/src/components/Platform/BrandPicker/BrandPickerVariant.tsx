/**
 * BrandPickerVariant.tsx
 *
 * A selectable sub-brand variant row inside the BrandPicker.
 * Visually nested under its parent brand via indentation (no connector icon).
 */

'use client';

import React from 'react';
import type { BrandPickerSubBrandConfig } from './BrandPicker';
import { Check } from '../icons';
import styles from './BrandPicker.module.css';

export interface BrandPickerVariantProps {
  variant: BrandPickerSubBrandConfig;
  selected: boolean;
  onSelect: () => void;
}

export const BrandPickerVariant: React.FC<BrandPickerVariantProps> = ({
  variant,
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      className={styles.variant}
      role="radio"
      aria-checked={selected}
      data-selected={selected || undefined}
      onClick={onSelect}
    >
      <span className={styles.variantName}>{variant.name}</span>
      {selected && <Check size={12} className={styles.checkIcon} />}
    </button>
  );
};
