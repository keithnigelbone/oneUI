/**
 * BrandPickerItem.tsx
 *
 * A selectable brand row inside the BrandPicker. Shows the brand logo
 * (when available) before the name. Uses role="radio" so the whole picker
 * behaves as a single radiogroup (see BrandPicker's body).
 */

'use client';

import React from 'react';
import type { Brand } from '@oneui/shared';
import { Check } from '../icons';
import styles from './BrandPicker.module.css';

export interface BrandPickerItemProps {
  brand: Brand;
  selected: boolean;
  onSelect: () => void;
  /** Renders a small "Base" tag next to the name (used for family parent rows) */
  isBaseBrand?: boolean;
  /** Indents the row one level (used for child brands inside a family) */
  indent?: boolean;
}

export const BrandPickerItem: React.FC<BrandPickerItemProps> = ({
  brand,
  selected,
  onSelect,
  isBaseBrand = false,
  indent = false,
}) => {
  return (
    <button
      type="button"
      className={styles.item}
      role="radio"
      aria-checked={selected}
      data-selected={selected || undefined}
      data-indent={indent || undefined}
      onClick={onSelect}
    >
      <span className={styles.itemName}>{brand.name}</span>
      {isBaseBrand && <span className={styles.baseTag}>Base</span>}
      {selected && <Check size={14} className={styles.checkIcon} />}
    </button>
  );
};
