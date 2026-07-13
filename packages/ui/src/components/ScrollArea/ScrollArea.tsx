/**
 * ScrollArea.tsx
 * React (web) implementation using Base UI ScrollArea
 *
 * Key features:
 * - Uses @base-ui/react ScrollArea primitive (never fork)
 * - Token-only styling in CSS Module
 * - Custom scrollbar styling with Pill shape
 * - WCAG AA accessible
 */

import React from 'react';
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import styles from './ScrollArea.module.css';
import { ScrollAreaProps } from './ScrollArea.shared';

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className,
  style,
}) => {
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <BaseScrollArea.Root className={rootClassName} style={style}>
      <BaseScrollArea.Viewport className={styles.viewport}>
        {children}
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar orientation="vertical" className={styles.scrollbar}>
        <BaseScrollArea.Thumb className={styles.thumb} />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar orientation="horizontal" className={styles.scrollbar}>
        <BaseScrollArea.Thumb className={styles.thumb} />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
};
