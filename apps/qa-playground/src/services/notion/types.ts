/** Raw Notion Bug Status select values (e.g. New, Ready to Test, Closed). */
export type BugStatus = string;

export type BugSeverity = string;

export type BugPlatform = string;

export type NotionBug = {
  id: string;
  bugId: string;
  title: string;
  severity: BugSeverity;
  status: BugStatus;
  platform: BugPlatform;
  /** All Platform multi-select values from Notion. */
  platforms: string[];
  component: string;
  assignee: string;
  reportedBy: string;
  category: string;
  release: string;
  createdAt: string;
  updatedAt: string;
  notionUrl: string;
};

export type NotionBugComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type NotionBugDetail = NotionBug & {
  description: string;
  prLink: string;
  devLink: string;
  comments: NotionBugComment[];
};

export type BugStatusUpdateResponse = {
  pageId: string;
  status: string;
  updatedAt: string;
};

export type BulkBugStatusUpdateResponse = {
  updated: Array<{ pageId: string; status: string }>;
  failed: Array<{ pageId: string; error: string }>;
  updatedAt: string;
};

/** Grouped statuses for assignee / status analytics charts. */
export const ANALYTICS_STATUSES = [
  'Open',
  'In Progress',
  'Fixed',
  'Reopened',
  'Closed',
  'Not a Bug',
] as const;

export type AnalyticsStatus = (typeof ANALYTICS_STATUSES)[number];

export type BugFilters = {
  search: string;
  status: BugStatus | 'all';
  /** Analytics bucket filter (from status / assignee charts). */
  analyticsStatus: AnalyticsStatus | 'all';
  severity: BugSeverity | 'all';
  platform: BugPlatform | 'all';
  component: string | 'all';
  assignee: string | 'all';
  reportedBy: string | 'all';
  category: string | 'all';
  release: string | 'all';
};

export type BugSortKey =
  | 'bugId'
  | 'title'
  | 'severity'
  | 'status'
  | 'platform'
  | 'component'
  | 'assignee'
  | 'reportedBy'
  | 'category'
  | 'createdAt'
  | 'updatedAt';

export type BugSortDirection = 'asc' | 'desc';

export type NotionBugsResponse = {
  bugs: NotionBug[];
  source: 'notion' | 'mock';
  fetchedAt: string;
  configured: boolean;
  warning?: string;
};

/** Active bug statuses in the OneUI v5 bugs database. */
export const ACTIVE_BUG_STATUSES = [
  'New',
  'In Progress',
  'Ready to Test',
  'Ready to test',
  'On Hold',
] as const;

export const CLOSED_BUG_STATUSES = ['Closed'] as const;

/** Canonical display order for raw Notion Bug Status values. Unknown statuses append after these. */
export const STATUS_DISPLAY_ORDER = [
  'New',
  'Ready to Test',
  'Ready to test',
  'In Progress',
  'On Hold',
  'In Testing',
  'Reopened',
  'Fixed',
  'Closed',
  'Not a Bug',
  'PR Raised',
  'Assigned',
  '—',
] as const;

/** @deprecated Use {@link STATUS_DISPLAY_ORDER} + {@link orderedBugStatuses} from bugAnalytics. */
export const SUMMARY_BUG_STATUSES = [
  'New',
  'Ready to Test',
  'In Progress',
  'On Hold',
  'Closed',
] as const;
