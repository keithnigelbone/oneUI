/**
 * BrandPickerGroup.tsx
 *
 * A collapsible section inside the BrandPicker. The header is a button
 * that toggles visibility with `aria-expanded`. Body children are hidden
 * with `hidden` attribute (not unmounted) so focus/selection stay stable.
 */

'use client';

import React from 'react';
import { ChevronDown } from '../icons';
import styles from './BrandPicker.module.css';

export interface BrandPickerGroupProps {
  label: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const BrandPickerGroup: React.FC<BrandPickerGroupProps> = ({
  label,
  collapsed,
  onToggle,
  children,
}) => {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={onToggle}
        aria-expanded={!collapsed}
      >
        <ChevronDown
          size={12}
          className={styles.groupChevron}
          data-collapsed={collapsed || undefined}
        />
        <span className={styles.groupLabel}>{label}</span>
      </button>
      <div className={styles.groupBody} hidden={collapsed}>
        {children}
      </div>
    </div>
  );
};
