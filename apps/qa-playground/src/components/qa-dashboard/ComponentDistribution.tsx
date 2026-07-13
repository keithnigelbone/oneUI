import { useMemo, useState } from 'react';
import type { SelectOption } from '@oneui/ui/components/Select';
import { Select } from '@oneui/ui/components/Select';

import { RankedDistribution } from './RankedDistribution';
import { componentMetricsByPlatform, distinctFilterValues } from '@/services/notion/bugAnalytics';
import type { NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

type ComponentDistributionProps = {
  bugs: NotionBug[];
  activeComponent: string;
  activePlatform: string;
  onSelectComponent: (component: string, platformScope: string) => void;
};

export function ComponentDistribution({
  bugs,
  activeComponent,
  activePlatform,
  onSelectComponent,
}: ComponentDistributionProps) {
  const [platformScope, setPlatformScope] = useState<string>('all');

  const platformOptions: SelectOption<string>[] = useMemo(() => {
    const platforms = distinctFilterValues(bugs, 'platform');
    return [
      { value: 'all', label: 'All platforms' },
      ...platforms.map((p) => ({ value: p, label: p })),
    ];
  }, [bugs]);

  const rows = useMemo(
    () => componentMetricsByPlatform(bugs, platformScope),
    [bugs, platformScope],
  );

  const items = rows.map((row) => ({
    id: row.component,
    label: row.component,
    value: row.total,
  }));

  const scopeLabel =
    platformScope === 'all' ? 'all platforms' : platformScope;

  return (
    <div className={styles.distributionPanel}>
      <div className={styles.distributionToolbar}>
        <label className={styles.distributionField}>
          <span className={styles.distributionFieldLabel}>Platform</span>
          <Select
            value={platformScope}
            onChange={setPlatformScope}
            options={platformOptions}
            size="sm"
            aria-label="Filter components by platform"
          />
        </label>
      </div>

      <div className={styles.distributionScroll}>
        <RankedDistribution
          items={items}
          activeId={
            activeComponent !== 'all' &&
            (activePlatform === 'all' || activePlatform === platformScope)
              ? activeComponent
              : null
          }
          onSelect={(component) => onSelectComponent(component, platformScope)}
          emptyLabel={`No bugs for ${scopeLabel}.`}
        />
      </div>

      <p className={styles.distributionMeta}>
        {items.length} component{items.length === 1 ? '' : 's'} · {scopeLabel}
      </p>
    </div>
  );
}
