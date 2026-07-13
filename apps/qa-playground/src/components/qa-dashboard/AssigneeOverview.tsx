import { useMemo, useState } from 'react';
import { Icon } from '@oneui/ui/components/Icon';
import { Input } from '@oneui/ui/components/Input';

import type { AssigneeRow } from '@/services/notion/bugAnalytics';
import styles from '@/styles/qa-dashboard.module.css';

type AssigneeOverviewProps = {
  rows: AssigneeRow[];
  statuses: string[];
  activeAssignee: string;
  activeStatus: string;
  onFilterAssignee: (assignee: string) => void;
  onFilterAssigneeStatus: (assignee: string, status: string) => void;
};

type SortKey = 'assignee' | 'total';

function CountButton({
  value,
  selected,
  onClick,
  label,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  if (value === 0) {
    return <span className={styles.countMuted}>0</span>;
  }
  return (
    <button
      type="button"
      className={`${styles.countLink}${selected ? ` ${styles.countLinkActive}` : ''}`}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${label}: ${value}`}
    >
      {value}
    </button>
  );
}

function statusHeaderLabel(status: string): string {
  return status === '—' ? 'Unset' : status;
}

export function AssigneeOverview({
  rows,
  statuses,
  activeAssignee,
  activeStatus,
  onFilterAssignee,
  onFilterAssigneeStatus,
}: AssigneeOverviewProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q ? rows.filter((r) => r.assignee.toLowerCase().includes(q)) : rows;
    list = [...list].sort((a, b) => {
      const cmp =
        sortKey === 'total'
          ? a.total - b.total
          : a.assignee.localeCompare(b.assignee);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [rows, query, sortKey, sortAsc]);

  const totals = useMemo(() => {
    const byStatus = Object.fromEntries(statuses.map((status) => [status, 0]));
    let total = 0;
    for (const row of filtered) {
      total += row.total;
      for (const status of statuses) {
        byStatus[status] += row.byStatus[status] ?? 0;
      }
    }
    return { total, byStatus };
  }, [filtered, statuses]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === 'assignee');
    }
  };

  const isCellActive = (assignee: string, status: string) =>
    activeAssignee === assignee && activeStatus === status;

  return (
    <div className={styles.assigneeOverview}>
      <div className={styles.assigneeSearch}>
        <Input
          shape="pill"
          size={12}
          attention="medium"
          appearance="secondary"
          placeholder="Search assignee…"
          value={query}
          onChange={setQuery}
          aria-label="Search assignee"
          className={styles.assigneeSearchInput}
          start={<Icon icon="search" size="3.5" emphasis="low" aria-hidden />}
        />
      </div>

      <div className={styles.tableScroll}>
        <table className={`${styles.dataTable} ${styles.assigneeTable}`}>
          <thead>
            <tr>
              <th scope="col" className={styles.assigneeStickyCol}>
                <button type="button" className={styles.sortBtn} onClick={() => toggleSort('assignee')}>
                  Assignee {sortKey === 'assignee' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
              </th>
              <th scope="col" className={styles.assigneeStickyCol}>
                <button type="button" className={styles.sortBtn} onClick={() => toggleSort('total')}>
                  Total Bugs {sortKey === 'total' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
              </th>
              {statuses.map((status) => (
                <th key={status} scope="col">
                  {statusHeaderLabel(status)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.assignee}>
                <th scope="row" className={styles.assigneeStickyCol}>
                  {row.assignee}
                </th>
                <td className={styles.assigneeStickyCol}>
                  <CountButton
                    value={row.total}
                    selected={activeAssignee === row.assignee && activeStatus === 'all'}
                    onClick={() => onFilterAssignee(row.assignee)}
                    label={`${row.assignee} total`}
                  />
                </td>
                {statuses.map((status) => (
                  <td key={status}>
                    <CountButton
                      value={row.byStatus[status] ?? 0}
                      selected={isCellActive(row.assignee, status)}
                      onClick={() => onFilterAssigneeStatus(row.assignee, status)}
                      label={`${row.assignee} ${statusHeaderLabel(status)}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.assigneeTotalsRow}>
              <th scope="row" className={styles.assigneeStickyCol}>
                Totals
              </th>
              <td className={styles.assigneeStickyCol}>{totals.total}</td>
              {statuses.map((status) => (
                <td key={status}>{totals.byStatus[status]}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
