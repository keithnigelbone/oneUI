import styles from '@/styles/qa-dashboard.module.css';

export type DistributionItem = {
  id: string;
  label: string;
  value: number;
};

type RankedDistributionProps = {
  items: DistributionItem[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  emptyLabel?: string;
};

export function RankedDistribution({
  items,
  activeId,
  onSelect,
  emptyLabel = 'No data',
}: RankedDistributionProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  if (items.length === 0) {
    return <p className={styles.distributionEmpty}>{emptyLabel}</p>;
  }

  return (
    <ul className={styles.distributionList}>
      {items.map((item) => {
        const widthPct = (item.value / max) * 100;
        const selected = activeId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`${styles.distributionRow}${selected ? ` ${styles.distributionRowActive}` : ''}`}
              onClick={() => onSelect?.(item.id)}
              aria-pressed={selected}
            >
              <span className={styles.distributionLabel}>{item.label}</span>
              <span className={styles.distributionTrack} aria-hidden>
                <span className={styles.distributionFill} style={{ width: `${widthPct}%` }} />
              </span>
              <span className={styles.distributionValue}>{item.value}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
