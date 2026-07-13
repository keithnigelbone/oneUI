'use client';

import type { ParityEntry } from '@oneui/shared';
import styles from './ParityStatusBadge.module.css';

export interface ParityStatusBadgeProps {
  status: ParityEntry['status'];
  showLabel?: boolean;
}

const STATUS_LABELS: Record<ParityEntry['status'], string> = {
  matched: 'Matched',
  mismatched: 'Mismatched',
  'missing-in-figma': 'Missing in Figma',
  'missing-in-tool': 'Missing in Tool',
  unmapped: 'Unmapped',
};

export function ParityStatusBadge({ status, showLabel = true }: ParityStatusBadgeProps) {
  return (
    <span className={styles.badge}>
      <span className={styles.dot} data-status={status} />
      {showLabel && <span className={styles.label}>{STATUS_LABELS[status]}</span>}
    </span>
  );
}
