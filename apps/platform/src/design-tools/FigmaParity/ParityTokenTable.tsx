'use client';

import { useMemo } from 'react';
import type { ParityEntry } from '@oneui/shared';
import { ParityStatusBadge } from './ParityStatusBadge';
import styles from './ParityTokenTable.module.css';

export interface ParityTokenTableProps {
  entries: ParityEntry[];
  onSelectEntry?: (entry: ParityEntry) => void;
  categoryFilter?: string;
  statusFilter?: ParityEntry['status'];
}

/**
 * Format a token property name for display.
 * "paddingHorizontalStart" → "Padding H. Start"
 */
function formatProperty(name: string): string {
  // Split camelCase
  const parts = name.replace(/([A-Z])/g, ' $1').trim().split(' ');
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

export function ParityTokenTable({
  entries,
  onSelectEntry,
  categoryFilter,
  statusFilter,
}: ParityTokenTableProps) {
  const filteredEntries = useMemo(() => {
    let result = entries;
    if (categoryFilter) {
      result = result.filter((e) => e.category === categoryFilter);
    }
    if (statusFilter) {
      result = result.filter((e) => e.status === statusFilter);
    }
    return result;
  }, [entries, categoryFilter, statusFilter]);

  if (filteredEntries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyTitle}>No entries to display</span>
        <span className={styles.emptyDetail}>
          Adjust filters or run a parity check to see results.
        </span>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.header}>Property</th>
            <th className={styles.header}>Size</th>
            <th className={styles.header}>Token</th>
            <th className={styles.header}>Status</th>
            <th className={styles.header}>Figma</th>
            <th className={styles.header}>Tool</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry, index) => (
            <tr
              key={`${entry.tokenProperty ?? entry.cssTokenName ?? ''}-${entry.size ?? ''}-${index}`}
              className={styles.row}
              data-status={entry.status}
              onClick={() => onSelectEntry?.(entry)}
              role={onSelectEntry ? 'button' : undefined}
              tabIndex={onSelectEntry ? 0 : undefined}
              onKeyDown={(e) => {
                if (onSelectEntry && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectEntry(entry);
                }
              }}
            >
              <td className={styles.cell}>
                <span className={styles.propertyName}>
                  {entry.tokenProperty ? formatProperty(entry.tokenProperty) : '\u2014'}
                </span>
                {entry.slot && (
                  <span className={styles.slotBadge}>{entry.slot}</span>
                )}
              </td>
              <td className={styles.cell}>
                {entry.size ?? '\u2014'}
              </td>
              <td className={styles.cell}>
                <span className={styles.tokenName}>
                  {entry.cssTokenName ?? '\u2014'}
                </span>
              </td>
              <td className={styles.cell}>
                <ParityStatusBadge status={entry.status} />
              </td>
              <td
                className={styles.cell}
                data-highlight={entry.status === 'mismatched' ? 'true' : undefined}
              >
                <span className={styles.valueText}>
                  {entry.figmaValue ?? '\u2014'}
                </span>
              </td>
              <td
                className={styles.cell}
                data-highlight={entry.status === 'mismatched' ? 'true' : undefined}
              >
                <span className={styles.valueText}>
                  {entry.toolValue ?? '\u2014'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
