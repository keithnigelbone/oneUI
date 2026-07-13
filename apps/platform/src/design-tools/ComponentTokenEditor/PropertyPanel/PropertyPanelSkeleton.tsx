/**
 * PropertyPanelSkeleton.tsx
 *
 * Loading skeleton for PropertyPanel while it's being lazy-loaded.
 */

'use client';

import React from 'react';
import styles from './PropertyPanel.module.css';

/**
 * PropertyPanelSkeleton Component
 *
 * Shows a loading placeholder while the PropertyPanel is loading.
 */
export function PropertyPanelSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonContent}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonItem} />
        ))}
      </div>
    </div>
  );
}
