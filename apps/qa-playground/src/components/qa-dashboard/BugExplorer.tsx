import { useMemo, useState } from 'react';
import type { SelectOption } from '@oneui/ui/components/Select';
import { Select } from '@oneui/ui/components/Select';
import { Input } from '@oneui/ui/components/Input';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/components/Icon';
import { Pagination } from '@oneui/ui/components/Pagination';
import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';

import {
  DEFAULT_FILTERS,
  distinctFilterValues,
  filterBugs,
  sortBugs,
} from '@/services/notion/bugAnalytics';
import type { BugFilters } from '@/services/notion/types';
import type { BugSortDirection, BugSortKey, NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

const PAGE_SIZE = 10;

/** Columns shown in the table; reporter lives in the details drawer. */
const TABLE_COLUMNS: BugSortKey[] = [
  'bugId',
  'title',
  'severity',
  'status',
  'platform',
  'component',
  'category',
  'assignee',
  'createdAt',
  'updatedAt',
];

const COLUMN_CLASS: Partial<Record<BugSortKey, string>> = {
  bugId: styles.colBugId,
  title: styles.colTitle,
  severity: styles.colSeverity,
  status: styles.colStatus,
  platform: styles.colPlatform,
  component: styles.colComponent,
  category: styles.colCategory,
  assignee: styles.colAssignee,
  createdAt: styles.colCreated,
  updatedAt: styles.colUpdated,
};

const COLUMN_LABELS: Record<BugSortKey, string> = {
  bugId: 'Bug ID',
  title: 'Title',
  severity: 'Severity',
  status: 'Status',
  platform: 'Platform',
  component: 'Component',
  assignee: 'Assignee',
  reportedBy: 'Reported by',
  category: 'Category',
  createdAt: 'Created Date',
  updatedAt: 'Modified Date',
};

type BugExplorerProps = {
  bugs: NotionBug[];
  filters: BugFilters;
  onFiltersChange: (filters: BugFilters) => void;
  onBugClick: (bug: NotionBug) => void;
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderCell(bug: NotionBug, key: BugSortKey, onBugClick: (bug: NotionBug) => void) {
  switch (key) {
    case 'bugId':
      return (
        <button type="button" className={styles.bugIdBtn} onClick={() => onBugClick(bug)}>
          {bug.bugId}
        </button>
      );
    case 'title':
      return (
        <button type="button" className={styles.titleBtn} onClick={() => onBugClick(bug)} title={bug.title}>
          {bug.title}
        </button>
      );
    case 'createdAt':
    case 'updatedAt':
      return formatDate(bug[key]);
    default:
      return bug[key] || '—';
  }
}

function toOptions(values: string[], allLabel: string): SelectOption<string>[] {
  return [
    { value: 'all', label: allLabel },
    ...values.map((value) => ({ value, label: value })),
  ];
}

type FilterField = keyof Pick<
  BugFilters,
  'status' | 'severity' | 'platform' | 'component' | 'assignee' | 'reportedBy' | 'category'
>;

const FILTER_FIELDS: Array<{ field: FilterField; label: string; allLabel: string }> = [
  { field: 'status', label: 'Status', allLabel: 'All statuses' },
  { field: 'severity', label: 'Severity', allLabel: 'All severities' },
  { field: 'platform', label: 'Platform', allLabel: 'All platforms' },
  { field: 'component', label: 'Component', allLabel: 'All components' },
  { field: 'assignee', label: 'Assignee', allLabel: 'All assignees' },
  { field: 'reportedBy', label: 'Reported by', allLabel: 'All reporters' },
  { field: 'category', label: 'Category', allLabel: 'All categories' },
];

export function BugExplorer({ bugs, filters, onFiltersChange, onBugClick }: BugExplorerProps) {
  const [sortKey, setSortKey] = useState<BugSortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<BugSortDirection>('desc');
  const [page, setPage] = useState(1);

  const filterOptions = useMemo(
    () =>
      Object.fromEntries(
        FILTER_FIELDS.map(({ field }) => [
          field,
          toOptions(
            distinctFilterValues(bugs, field),
            FILTER_FIELDS.find((f) => f.field === field)?.allLabel ?? 'All',
          ),
        ]),
      ) as Record<FilterField, SelectOption<string>[]>,
    [bugs],
  );

  const filtered = useMemo(
    () => sortBugs(filterBugs(bugs, filters), sortKey, sortDir),
    [bugs, filters, sortKey, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key: BugSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const activeChips = [
    filters.analyticsStatus !== 'all' ? `Workflow: ${filters.analyticsStatus}` : null,
    filters.status !== 'all' ? `Status: ${filters.status}` : null,
    filters.severity !== 'all' ? `Severity: ${filters.severity}` : null,
    filters.platform !== 'all' ? `Platform: ${filters.platform}` : null,
    filters.component !== 'all' ? `Component: ${filters.component}` : null,
    filters.assignee !== 'all' ? `Assignee: ${filters.assignee}` : null,
    filters.reportedBy !== 'all' ? `Reported by: ${filters.reportedBy}` : null,
    filters.category !== 'all' ? `Category: ${filters.category}` : null,
  ].filter(Boolean) as string[];

  const setFilter = (field: FilterField, value: string) => {
    setPage(1);
    if (field === 'status' || field === 'assignee') {
      onFiltersChange({ ...filters, [field]: value, analyticsStatus: 'all' });
      return;
    }
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <div className={styles.explorerPanel}>
      <div className={styles.explorerToolbar}>
        <Input
          placeholder="Search bugs…"
          value={filters.search}
          onChange={(value) => {
            setPage(1);
            onFiltersChange({ ...filters, search: value });
          }}
          aria-label="Search bugs"
          data-testid="qa-dashboard-search"
        />

        <div className={styles.explorerFilterGrid}>
          {FILTER_FIELDS.map(({ field, label }) => (
            <label key={field} className={styles.explorerFilterField}>
              <span className={styles.explorerFilterLabel}>{label}</span>
              <Select
                value={filters[field]}
                options={filterOptions[field]}
                onChange={(value) => setFilter(field, value)}
                aria-label={label}
                size="sm"
              />
            </label>
          ))}
        </div>

        {activeChips.length > 0 ? (
          <div className={styles.filterChips}>
            <ChipGroup value={[]} onValueChange={() => undefined} aria-label="Active filters">
              {activeChips.map((chip) => (
                <Chip key={chip} value={chip} attention="medium" size="s" appearance="primary">
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
            <Button variant="ghost" size={8} appearance="neutral" onClick={() => onFiltersChange(DEFAULT_FILTERS)}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>

      <p className={styles.explorerResultCount}>
        Showing {filtered.length} of {bugs.length} bugs
      </p>

      <div className={styles.tableScroll}>
        <table className={`${styles.dataTable} ${styles.bugDataTable}`}>
          <thead>
            <tr>
              {TABLE_COLUMNS.map((key) => (
                <th key={key} scope="col" className={COLUMN_CLASS[key]}>
                  <button type="button" className={styles.sortBtn} onClick={() => toggleSort(key)}>
                    {COLUMN_LABELS[key]}
                    {sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
              ))}
              <th scope="col" className={styles.actionsCol}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length + 1} className={styles.tableEmpty}>
                  No bugs match the current filters.
                </td>
              </tr>
            ) : (
              pageRows.map((bug) => (
                <tr key={bug.id} className={styles.tableRowClickable}>
                  {TABLE_COLUMNS.map((key) => (
                    <td
                      key={key}
                      className={
                        key === 'title' ? `${styles.titleCell} ${styles.colTitle}` : COLUMN_CLASS[key]
                      }
                    >
                      {renderCell(bug, key, onBugClick)}
                    </td>
                  ))}
                  <td className={styles.actionsCol}>
                    <div className={styles.rowActions}>
                      <Button
                        variant="ghost"
                        size={8}
                        appearance="primary"
                        aria-label={`View ${bug.bugId} details`}
                        onClick={() => onBugClick(bug)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size={8}
                        appearance="primary"
                        aria-label={`Open ${bug.bugId} in Notion`}
                        end={<Icon icon="externalLink" size="3" aria-hidden />}
                        onClick={() => window.open(bug.notionUrl, '_blank', 'noopener,noreferrer')}
                      >
                        Notion
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE ? (
        <div className={styles.paginationRow}>
          <Pagination
            totalPages={totalPages}
            page={safePage}
            onPageChange={setPage}
            showPrevNext
            siblingCount={1}
            boundaryCount={1}
            aria-label="Bug table pagination"
          />
        </div>
      ) : null}
    </div>
  );
}
