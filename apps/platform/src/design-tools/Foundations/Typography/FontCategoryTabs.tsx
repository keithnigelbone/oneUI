/**
 * FontCategoryTabs.tsx
 * Tab navigation for font categories (Variable, Sans-Serif, Serif, Mono)
 */

import { memo } from 'react';
import type { FontCategory } from './fonts';
import { FONT_CATEGORY_LABELS, getFontCategoryCounts } from './fonts';
import styles from './Typography.module.css';

export interface FontCategoryTabsProps {
  /** Currently active tab */
  activeTab: FontCategory;
  /** Tab change handler */
  onTabChange: (tab: FontCategory) => void;
  /** Whether tabs are disabled */
  disabled?: boolean;
}

const TAB_ORDER: FontCategory[] = ['variable', 'sans-serif', 'serif', 'mono'];

/**
 * FontCategoryTabs - Tab navigation matching Color Foundation pattern
 */
export const FontCategoryTabs = memo(function FontCategoryTabs({
  activeTab,
  onTabChange,
  disabled = false,
}: FontCategoryTabsProps) {
  const categoryCounts = getFontCategoryCounts();

  return (
    <div className={styles.fontCategoryTabs} role="tablist" aria-label="Font categories">
      {TAB_ORDER.map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={activeTab === category}
          aria-controls={`font-panel-${category}`}
          className={styles.fontCategoryTab}
          data-active={activeTab === category}
          onClick={() => onTabChange(category)}
          disabled={disabled}
        >
          {FONT_CATEGORY_LABELS[category]}
          <span className={styles.fontCategoryCount}>
            ({categoryCounts[category]})
          </span>
        </button>
      ))}
    </div>
  );
});
