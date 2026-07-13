import { useMemo } from 'react';
import { Icon } from '@oneui/ui/components/Icon';

import { countByStatus, orderedBugStatuses } from '@/services/notion/bugAnalytics';
import type { NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

type BugHealthPanelProps = {
  bugs: NotionBug[];
};

const HEALTH_SEG_CLASS = [
  styles.healthSegActive,
  styles.healthSegProgress,
  styles.healthSegResolved,
  styles.healthSegOther,
] as const;

const HEALTH_DOT_CLASS = [
  styles.healthDotActive,
  styles.healthDotProgress,
  styles.healthDotResolved,
  styles.healthDotOther,
] as const;

function pct(part: number, total: number): string {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function statusLabel(status: string): string {
  return status === '—' ? 'Unset' : status;
}

export function BugHealthPanel({ bugs }: BugHealthPanelProps) {
  const total = bugs.length;
  const counts = countByStatus(bugs);
  const statuses = useMemo(() => orderedBugStatuses(bugs), [bugs]);

  const closed = counts.Closed ?? 0;
  const closedRate = total > 0 ? ((closed / total) * 100).toFixed(1) : '0.0';
  const width = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div className={styles.healthPanel}>
      <div className={styles.healthMain}>
        <div className={styles.healthTitle}>
          <Icon icon="checkCircle" size="4.5" aria-hidden />
          Overall bug health
        </div>
        <div
          className={styles.healthBar}
          role="img"
          aria-label={`Bug status distribution across ${statuses.length} statuses`}
        >
          {statuses.map((status, index) => {
            const value = counts[status] ?? 0;
            if (value <= 0) return null;
            const segClass = HEALTH_SEG_CLASS[index % HEALTH_SEG_CLASS.length];
            return (
              <div
                key={status}
                className={`${styles.healthSeg} ${segClass}`}
                style={{ width: `${width(value)}%` }}
                title={`${statusLabel(status)}: ${value}`}
              />
            );
          })}
        </div>
        <div className={styles.healthLegend}>
          {statuses.map((status, index) => {
            const value = counts[status] ?? 0;
            if (value <= 0) return null;
            const dotClass = HEALTH_DOT_CLASS[index % HEALTH_DOT_CLASS.length];
            return (
              <span key={status} className={styles.healthLegendItem}>
                <span className={`${styles.healthLegendDot} ${dotClass}`} />
                {statusLabel(status)} <strong>{pct(value, total)}</strong> ({value})
              </span>
            );
          })}
        </div>
      </div>
      <div className={styles.healthAside}>
        <div className={styles.healthRateValue}>{closedRate}%</div>
        <div className={styles.healthRateLabel}>Closed rate</div>
        <div className={styles.healthMeta}>
          {closed} of {total} bugs closed
        </div>
      </div>
    </div>
  );
}
