/**
 * PageSkeleton.tsx
 *
 * Reusable skeleton loading components for progressive page loading.
 * All styling uses CSS tokens — no hard-coded values.
 */

import React from 'react';
import styles from './PageSkeleton.module.css';

/**
 * Full page skeleton with header + content cards.
 * Use for foundation pages (surfaces, color, appearance).
 */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className={styles.pageSkeleton}>
      <div className={styles.headerSkeleton}>
        <div className={styles.titleBar} />
        <div className={styles.descriptionBar} />
      </div>
      <div className={styles.contentSkeleton}>
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={styles.cardTitleBar} />
            <div className={styles.cardBody} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Grid of card skeletons.
 * Use for pages that display grids of items.
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.pageSkeleton}>
      <div className={styles.headerSkeleton}>
        <div className={styles.titleBar} />
        <div className={styles.descriptionBar} />
      </div>
      <div className={styles.cardGrid}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={styles.gridCard}>
            <div className={styles.gridCardIcon} />
            <div className={styles.gridCardTitle} />
            <div className={styles.gridCardMeta} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Editor layout skeleton with sidebar + main panel.
 * Use for component editor pages.
 */
export function EditorSkeleton() {
  return (
    <div className={styles.editorLayout}>
      <div className={styles.editorSidebar}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.sidebarItem} />
        ))}
      </div>
      <div className={styles.editorMain}>
        <div className={styles.editorToolbar} />
        <div className={styles.editorCanvas} />
      </div>
    </div>
  );
}

/**
 * Brand overview skeleton with header, stats bar, and content cards.
 * Use for brand/overview page.
 */
export function OverviewSkeleton() {
  return (
    <div className={styles.overviewContainer}>
      <div className={styles.overviewHeader}>
        <div className={styles.overviewAvatar} />
        <div className={styles.overviewHeaderText}>
          <div className={styles.overviewNameBar} />
          <div className={styles.overviewDescBar} />
        </div>
      </div>
      <div className={styles.overviewStatsBar}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={styles.overviewStatPill} />
        ))}
      </div>
      <div className={styles.contentSkeleton}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={styles.cardTitleBar} />
            <div className={styles.cardBody} />
          </div>
        ))}
      </div>
    </div>
  );
}
