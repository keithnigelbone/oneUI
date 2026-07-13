import type {
  AnalyticsStatus,
  BugFilters,
  BugSortDirection,
  BugSortKey,
  NotionBug,
} from './types';
import { ACTIVE_BUG_STATUSES, ANALYTICS_STATUSES, CLOSED_BUG_STATUSES, STATUS_DISPLAY_ORDER } from './types';

const SEVERITY_RANK: Record<string, number> = {
  Critical: 0,
  Major: 1,
  High: 2,
  Medium: 3,
  Minor: 4,
  Low: 5,
};

export type StatusCounts = Record<string, number>;

export function countByStatus(bugs: NotionBug[]): StatusCounts {
  const counts: StatusCounts = {};
  for (const bug of bugs) {
    const key = normalizeBugStatus(bug.status);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function sortedStatusEntries(counts: StatusCounts): Array<[string, number]> {
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** All raw statuses present in `bugs`, in workflow order — status cards sum to total. */
export function orderedBugStatuses(bugs: NotionBug[]): string[] {
  const counts = countByStatus(bugs);
  const present = new Set(
    Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status]) => status),
  );

  const ordered: string[] = [];
  const known = new Set<string>(STATUS_DISPLAY_ORDER);

  for (const status of STATUS_DISPLAY_ORDER) {
    if (present.has(status)) {
      ordered.push(status);
      present.delete(status);
    }
  }

  const extras = [...present].sort(
    (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0) || a.localeCompare(b),
  );

  return [...ordered, ...extras.filter((status) => !known.has(status))];
}

export function normalizeBugStatus(status: string): string {
  const trimmed = status.trim();
  return trimmed.length > 0 ? trimmed : '—';
}

export function isActiveStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return ACTIVE_BUG_STATUSES.some((s) => s.toLowerCase() === normalized);
}

export function isClosedStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return CLOSED_BUG_STATUSES.some((s) => s.toLowerCase() === normalized);
}

export function countBySeverity(bugs: NotionBug[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const bug of bugs) {
    const key = bug.severity || '—';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export type PlatformRow = {
  platform: string;
  total: number;
  open: number;
  fixed: number;
  closed: number;
};

export function platformMetrics(bugs: NotionBug[]): PlatformRow[] {
  const map = new Map<string, NotionBug[]>();
  for (const bug of bugs) {
    const platforms = bug.platforms.length > 0 ? bug.platforms : bug.platform !== '—' ? [bug.platform] : [];
    for (const platform of platforms) {
      const rows = map.get(platform) ?? [];
      rows.push(bug);
      map.set(platform, rows);
    }
  }

  return [...map.entries()]
    .map(([platform, rows]) => ({
      platform,
      total: rows.length,
      open: rows.filter((b) => isActiveStatus(b.status)).length,
      fixed: rows.filter((b) => b.status.toLowerCase() === 'fixed').length,
      closed: rows.filter((b) => isClosedStatus(b.status)).length,
    }))
    .sort((a, b) => b.total - a.total);
}

export type ComponentRow = {
  component: string;
  total: number;
  open: number;
  fixed: number;
};

export function componentMetrics(bugs: NotionBug[]): ComponentRow[] {
  const map = new Map<string, NotionBug[]>();
  for (const bug of bugs) {
    const key = bug.component || 'Other';
    const rows = map.get(key) ?? [];
    rows.push(bug);
    map.set(key, rows);
  }

  return [...map.entries()]
    .map(([component, rows]) => ({
      component,
      total: rows.length,
      open: rows.filter((b) => isActiveStatus(b.status)).length,
      fixed: rows.filter((b) => isClosedStatus(b.status)).length,
    }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** Component bug counts for a single platform (or all when platform is `all`). */
export function componentMetricsByPlatform(
  bugs: NotionBug[],
  platform: string | 'all',
): ComponentRow[] {
  const scoped =
    platform === 'all'
      ? bugs
      : bugs.filter((bug) => bugMatchesPlatform(bug, platform));
  return componentMetrics(scoped);
}

export type CategoryRow = { category: string; count: number };

/** Bug type / category distribution (Functional, Visual, Accessibility, …). */
export function categoryDistribution(bugs: NotionBug[]): CategoryRow[] {
  const map = new Map<string, number>();
  for (const bug of bugs) {
    const key =
      bug.category && bug.category !== '—' ? bug.category : 'Uncategorized';
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

const ANALYTICS_STATUS_MAP: Record<string, AnalyticsStatus> = {
  new: 'Open',
  'not started': 'Open',
  'on hold': 'Open',
  'in testing': 'Open',
  'ready to test': 'Open',
  'in progress': 'In Progress',
  fixed: 'Fixed',
  reopened: 'Reopened',
  closed: 'Closed',
  'not a bug': 'Not a Bug',
};

export function toAnalyticsStatus(rawStatus: string): AnalyticsStatus {
  const key = rawStatus.toLowerCase().trim();
  return ANALYTICS_STATUS_MAP[key] ?? 'Open';
}

export function countByAnalyticsStatus(bugs: NotionBug[]): Record<AnalyticsStatus, number> {
  const counts = Object.fromEntries(
    ANALYTICS_STATUSES.map((s) => [s, 0]),
  ) as Record<AnalyticsStatus, number>;
  for (const bug of bugs) {
    counts[toAnalyticsStatus(bug.status)] += 1;
  }
  return counts;
}

export type AssigneeRow = {
  assignee: string;
  total: number;
  byStatus: Record<string, number>;
};

export function assigneeMetrics(bugs: NotionBug[], statuses: string[]): AssigneeRow[] {
  const map = new Map<string, NotionBug[]>();
  for (const bug of bugs) {
    const key = bug.assignee && bug.assignee !== '—' ? bug.assignee : 'Unassigned';
    const rows = map.get(key) ?? [];
    rows.push(bug);
    map.set(key, rows);
  }

  return [...map.entries()]
    .map(([assignee, rows]) => {
      const byStatus: Record<string, number> = Object.fromEntries(
        statuses.map((status) => [status, 0]),
      );
      for (const bug of rows) {
        const key = normalizeBugStatus(bug.status);
        byStatus[key] = (byStatus[key] ?? 0) + 1;
      }
      return {
        assignee,
        total: rows.length,
        byStatus,
      };
    })
    .sort((a, b) => b.total - a.total || a.assignee.localeCompare(b.assignee));
}

export function countByAssignee(bugs: NotionBug[]): Array<{ assignee: string; count: number }> {
  const map = new Map<string, number>();
  for (const bug of bugs) {
    map.set(bug.assignee, (map.get(bug.assignee) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([assignee, count]) => ({ assignee, count }))
    .sort((a, b) => b.count - a.count);
}

export function countByReportedBy(bugs: NotionBug[]): Array<{ reportedBy: string; count: number }> {
  const map = new Map<string, number>();
  for (const bug of bugs) {
    if (!bug.reportedBy || bug.reportedBy === '—') continue;
    map.set(bug.reportedBy, (map.get(bug.reportedBy) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([reportedBy, count]) => ({ reportedBy, count }))
    .sort((a, b) => b.count - a.count);
}

export function countByCategory(bugs: NotionBug[]): Array<{ category: string; count: number }> {
  const map = new Map<string, number>();
  for (const bug of bugs) {
    if (!bug.category || bug.category === '—') continue;
    map.set(bug.category, (map.get(bug.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function countByRelease(bugs: NotionBug[]): Array<{ release: string; count: number }> {
  const map = new Map<string, number>();
  for (const bug of bugs) {
    map.set(bug.release, (map.get(bug.release) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([release, count]) => ({ release, count }))
    .sort((a, b) => b.count - a.count);
}

export function distinctFilterValues(bugs: NotionBug[], field: keyof NotionBug): string[] {
  const set = new Set<string>();
  for (const bug of bugs) {
    if (field === 'platform') {
      for (const p of bug.platforms) set.add(p);
      if (bug.platform && bug.platform !== '—') {
        for (const p of bug.platform.split(',').map((s) => s.trim())) {
          if (p) set.add(p);
        }
      }
      continue;
    }
    const value = bug[field];
    if (typeof value === 'string' && value && value !== '—' && value !== 'Unassigned') {
      set.add(value);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export type TrendPoint = { label: string; created: number; fixed: number; closed: number };

export function statusTrend(bugs: NotionBug[], weeks = 8): TrendPoint[] {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const points: TrendPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const start = now - (i + 1) * weekMs;
    const end = now - i * weekMs;
    const label = new Date(end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    points.push({
      label,
      created: bugs.filter((b) => {
        const t = new Date(b.createdAt).getTime();
        return t >= start && t < end;
      }).length,
      fixed: bugs.filter((b) => {
        const t = new Date(b.updatedAt).getTime();
        return b.status.toLowerCase() === 'fixed' && t >= start && t < end;
      }).length,
      closed: bugs.filter((b) => {
        const t = new Date(b.updatedAt).getTime();
        return isClosedStatus(b.status) && t >= start && t < end;
      }).length,
    });
  }

  return points;
}

function bugMatchesPlatform(bug: NotionBug, platform: string): boolean {
  if (bug.platforms.includes(platform)) return true;
  return bug.platform.split(',').map((s) => s.trim()).includes(platform);
}

export function filterBugsByPlatform(
  bugs: NotionBug[],
  platform: string | 'all',
): NotionBug[] {
  if (platform === 'all') return bugs;
  return bugs.filter((bug) => bugMatchesPlatform(bug, platform));
}

export function filterBugs(bugs: NotionBug[], filters: BugFilters): NotionBug[] {
  const q = filters.search.trim().toLowerCase();
  return bugs.filter((bug) => {
    if (filters.status !== 'all' && bug.status !== filters.status) return false;
    if (
      filters.analyticsStatus !== 'all' &&
      toAnalyticsStatus(bug.status) !== filters.analyticsStatus
    ) {
      return false;
    }
    if (filters.severity !== 'all' && bug.severity !== filters.severity) return false;
    if (filters.platform !== 'all' && !bugMatchesPlatform(bug, filters.platform)) return false;
    if (filters.component !== 'all' && bug.component !== filters.component) return false;
    if (filters.assignee !== 'all' && bug.assignee !== filters.assignee) return false;
    if (filters.reportedBy !== 'all' && bug.reportedBy !== filters.reportedBy) return false;
    if (filters.category !== 'all') {
      if (filters.category === 'Uncategorized') {
        if (bug.category && bug.category !== '—') return false;
      } else if (bug.category !== filters.category) {
        return false;
      }
    }
    if (filters.release !== 'all' && bug.release !== filters.release) return false;
    if (!q) return true;
    return (
      bug.bugId.toLowerCase().includes(q) ||
      bug.title.toLowerCase().includes(q) ||
      bug.component.toLowerCase().includes(q) ||
      bug.assignee.toLowerCase().includes(q) ||
      bug.reportedBy.toLowerCase().includes(q) ||
      bug.category.toLowerCase().includes(q) ||
      bug.platform.toLowerCase().includes(q) ||
      bug.status.toLowerCase().includes(q)
    );
  });
}

export function sortBugs(
  bugs: NotionBug[],
  key: BugSortKey,
  direction: BugSortDirection,
): NotionBug[] {
  const sorted = [...bugs].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'severity':
        cmp =
          (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99);
        break;
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt);
        break;
      case 'updatedAt':
        cmp = a.updatedAt.localeCompare(b.updatedAt);
        break;
      default:
        cmp = String(a[key]).localeCompare(String(b[key]));
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export function recentByStatus(
  bugs: NotionBug[],
  status: string | 'created',
  limit = 5,
): NotionBug[] {
  if (status === 'created') {
    return [...bugs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }
  return bugs
    .filter((b) => b.status === status)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export const DEFAULT_FILTERS: BugFilters = {
  search: '',
  status: 'all',
  analyticsStatus: 'all',
  severity: 'all',
  platform: 'all',
  component: 'all',
  assignee: 'all',
  reportedBy: 'all',
  category: 'all',
  release: 'all',
};
