import { useMemo } from 'react';

import { RankedDistribution } from './RankedDistribution';
import { categoryDistribution } from '@/services/notion/bugAnalytics';
import type { NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

type BugTypeDistributionProps = {
  bugs: NotionBug[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
};

export function BugTypeDistribution({
  bugs,
  activeCategory,
  onSelectCategory,
}: BugTypeDistributionProps) {
  const rows = useMemo(() => categoryDistribution(bugs), [bugs]);

  const items = rows.map((row) => ({
    id: row.category,
    label: row.category,
    value: row.count,
  }));

  return (
    <div className={styles.distributionPanel}>
      <div className={styles.distributionScroll}>
        <RankedDistribution
          items={items}
          activeId={activeCategory === 'all' ? null : activeCategory}
          onSelect={onSelectCategory}
          emptyLabel="No bug types found."
        />
      </div>
      <p className={styles.distributionMeta}>
        {items.length} bug type{items.length === 1 ? '' : 's'}
      </p>
    </div>
  );
}
