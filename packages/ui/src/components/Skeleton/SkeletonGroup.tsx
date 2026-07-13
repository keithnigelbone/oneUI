/**
 * SkeletonGroup.tsx
 *
 * Groups SkeletonItem children with automatic shimmer stagger.
 * Public API: children only (see PRD §4).
 */

'use client';

import React, { type CSSProperties } from 'react';
import styles from './Skeleton.module.css';
import { isSkeletonItemElement } from './SkeletonItem';
import type { SkeletonGroupProps } from './Skeleton.shared';

export function SkeletonGroup({ children }: SkeletonGroupProps) {
  const items = React.Children.toArray(children);

  if (process.env.NODE_ENV !== 'production') {
    const invalid = items.filter((child) => !isSkeletonItemElement(child));
    if (invalid.length > 0) {
      console.warn(
        '[SkeletonGroup] Only direct SkeletonItem children are supported. Invalid children were omitted.',
      );
    }
  }

  return (
    <div className={styles.group} role="status" aria-busy="true" aria-label="Loading">
      {items.map((child, index) => {
        if (!isSkeletonItemElement(child)) return null;

        const slotStyle = {
          '--_skeleton-stagger-index': index,
        } as CSSProperties;

        return (
          <div key={child.key ?? `skeleton-item-${index}`} className={styles.groupSlot} style={slotStyle}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

SkeletonGroup.displayName = 'SkeletonGroup';
