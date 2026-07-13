import { useMemo } from 'react';
import { Icon } from '@oneui/ui/components/Icon';
import type { SemanticIconName } from '@oneui/shared';

import { countByStatus, orderedBugStatuses } from '@/services/notion/bugAnalytics';
import type { NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

type SummaryCardsProps = {
  bugs: NotionBug[];
  activeStatus: string;
  onSelectStatus: (status: string | 'all' | 'total') => void;
};

type StatTone = 'all' | 'new' | 'ready' | 'progress' | 'hold' | 'fixed' | 'reopened' | 'closed' | 'neutral';

const TONE_CLASS: Record<StatTone, string> = {
  all: styles.statToneAll,
  new: styles.statToneOpen,
  ready: styles.statToneProgress,
  progress: styles.statToneFixed,
  hold: styles.statToneBlocked,
  fixed: styles.statToneFixed,
  reopened: styles.statToneReopened,
  closed: styles.statToneClosed,
  neutral: styles.statToneAll,
};

const STATUS_ICON: Record<string, SemanticIconName> = {
  New: 'error',
  'Ready to Test': 'checkCircle',
  'Ready to test': 'checkCircle',
  'In Progress': 'loading',
  'On Hold': 'warning',
  'In Testing': 'search',
  Reopened: 'refresh',
  Fixed: 'check',
  Closed: 'lock',
  'Not a Bug': 'close',
  'PR Raised': 'externalLink',
  Assigned: 'userAdd',
  '—': 'help',
};

const STATUS_TONE: Record<string, StatTone> = {
  New: 'new',
  'Ready to Test': 'ready',
  'Ready to test': 'ready',
  'In Progress': 'progress',
  'On Hold': 'hold',
  'In Testing': 'ready',
  Reopened: 'reopened',
  Fixed: 'fixed',
  Closed: 'closed',
  'Not a Bug': 'neutral',
  'PR Raised': 'progress',
  Assigned: 'ready',
  '—': 'neutral',
};

function resolveStatusIcon(status: string): SemanticIconName {
  if (STATUS_ICON[status]) return STATUS_ICON[status];

  const lower = status.toLowerCase();
  if (lower.includes('assign')) return 'userAdd';
  if (lower.includes('pr') || lower.includes('raised')) return 'externalLink';
  if (lower.includes('reopen')) return 'refresh';
  if (lower.includes('progress')) return 'loading';
  if (lower.includes('hold')) return 'warning';
  if (lower.includes('test')) return 'checkCircle';
  if (lower.includes('close')) return 'lock';
  if (lower.includes('fix')) return 'check';
  if (lower.includes('new')) return 'error';
  if (lower.includes('bug')) return 'close';
  if (lower === 'unset' || lower === '—') return 'help';

  return 'info';
}

function pct(part: number, total: number): string {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function statusLabel(status: string): string {
  return status === '—' ? 'Unset' : status;
}

export function SummaryCards({ bugs, activeStatus, onSelectStatus }: SummaryCardsProps) {
  const total = bugs.length;
  const counts = countByStatus(bugs);
  const statuses = useMemo(() => orderedBugStatuses(bugs), [bugs]);

  return (
    <div className={styles.statCardsGrid}>
      <button
        type="button"
        className={`${styles.statCard} ${TONE_CLASS.all}${activeStatus === 'all' ? ` ${styles.statCardActive}` : ''}`}
        onClick={() => onSelectStatus('total')}
        aria-pressed={activeStatus === 'all'}
      >
        <div className={styles.statCardIcon} aria-hidden>
          <Icon icon="layers" size="4.5" />
        </div>
        <div className={styles.statCardValue}>{total}</div>
        <div className={styles.statCardLabel}>Total Bugs</div>
        <span className={styles.statCardPill}>100% of total</span>
      </button>

      {statuses.map((status) => {
        const value = counts[status] ?? 0;
        const tone = STATUS_TONE[status] ?? 'neutral';
        const selected = activeStatus === status;
        const pillLabel =
          status === 'New'
            ? `${pct(value, total)} new`
            : status === 'Ready to Test' || status === 'Ready to test'
              ? `${pct(value, total)} ready`
              : status === 'Closed'
                ? `${pct(value, total)} closed`
                : `${pct(value, total)} of total`;

        return (
          <button
            key={status}
            type="button"
            className={`${styles.statCard} ${TONE_CLASS[tone]}${selected ? ` ${styles.statCardActive}` : ''}`}
            onClick={() => onSelectStatus(status)}
            aria-pressed={selected}
          >
            <div className={styles.statCardIcon} aria-hidden>
              <Icon icon={resolveStatusIcon(status)} size="4.5" />
            </div>
            <div className={styles.statCardValue}>{value}</div>
            <div className={styles.statCardLabel}>{statusLabel(status)}</div>
            <span className={styles.statCardPill}>{pillLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
