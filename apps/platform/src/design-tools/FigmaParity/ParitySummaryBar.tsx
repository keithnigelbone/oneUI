'use client';

import type { ParitySummary } from '@oneui/shared';
import styles from './ParitySummaryBar.module.css';

export interface ParitySummaryBarProps {
  summary: ParitySummary;
  isLive?: boolean;
  lastCheckedAt?: number;
}

export function ParitySummaryBar({ summary, isLive = false, lastCheckedAt }: ParitySummaryBarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        {summary.matched > 0 && (
          <span className={styles.pill} data-status="matched">
            {summary.matched}
          </span>
        )}
        {summary.mismatched > 0 && (
          <span className={styles.pill} data-status="mismatched">
            {summary.mismatched}
          </span>
        )}
        {(summary.missingInFigma + summary.missingInTool) > 0 && (
          <span className={styles.pill} data-status="missing">
            {summary.missingInFigma + summary.missingInTool}
          </span>
        )}
        {summary.unmapped > 0 && (
          <span className={styles.pill} data-status="unmapped">
            {summary.unmapped}
          </span>
        )}
        <span className={styles.total}>{summary.total} tokens</span>
      </div>
    </div>
  );
}
