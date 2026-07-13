/**
 * Separator.tsx
 * React (web) implementation using Base UI Separator
 *
 * Key features:
 * - Uses @base-ui/react Separator primitive (never fork)
 * - Token-only styling in CSS Module
 * - WCAG AA accessible (role="separator")
 * - Supports horizontal and vertical orientation
 */

import React from 'react';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import styles from './Separator.module.css';
import { SeparatorProps } from './Separator.shared';

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className,
  style,
}) => {
  const separatorClassName = [styles.separator, className].filter(Boolean).join(' ');

  return (
    <BaseSeparator
      orientation={orientation}
      className={separatorClassName}
      style={style}
    />
  );
};
