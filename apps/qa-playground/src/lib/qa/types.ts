import type { ComponentCategory, ComponentMeta } from '@oneui/shared';

export type ComponentLifecycleStatus = 'stable' | 'beta';

export interface UIComponentCatalogEntry {
  meta: ComponentMeta;
  status: ComponentLifecycleStatus;
}

export type QAReportSuiteId = 'smoke' | 'functional' | 'accessibility' | 'performance';

export interface QAScenario {
  id: string;
  group: string;
  name: string;
  props: Record<string, unknown>;
  testId: string;
  playwrightSelector: string;
  layout?: 'default' | 'narrow';
}

export interface QAPlaceholderSuiteReport {
  suite: QAReportSuiteId;
  passed: number;
  failed: number;
  skipped: number;
  logs: string[];
  errors: string[];
  traceHint?: string;
  screenshotHint?: string;
  /** Optional rows from Playwright functional specs */
  cases?: {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    durationMs?: number;
    error?: string;
    /** From Playwright `qa-bug` annotation or `[BUG-…]` in legacy titles */
    bugId?: string;
    /** From Playwright `qa-band` annotation or band phrase in legacy titles */
    componentBand?: string;
  }[];
  /** Optional axe summary (from @axe-core/playwright ingest) */
  axe?: {
    violations: { id: string; impact: string; description: string; helpUrl?: string; nodes: number }[];
  };
}

export interface QAPlaywrightRunResponse {
  ok: boolean;
  message: string;
  slug?: string;
  suites?: Partial<Record<QAReportSuiteId, QAPlaceholderSuiteReport>>;
}

/** Archived Playwright summaries for the Previous tab (`public/qa-reports/<slug>-summary-history.json`). */
export interface QAPlaywrightHistoryEntry {
  savedAt: string;
  report: QAPlaywrightRunResponse;
}

export interface QAPlaywrightReportHistoryFile {
  slug: string;
  runs: QAPlaywrightHistoryEntry[];
}

/** Slim catalog row for listing — serializable. */
export interface QACatalogListItem {
  slug: string;
  displayName: string;
  name: string;
  category: ComponentCategory;
  status: ComponentLifecycleStatus;
  description: string;
  tags: string[];
}

/** Row with meta so catalog cards can render ScenarioPreview thumbnails without importing metaRegistry on the client. */
export interface QACatalogListItemWithMeta extends QACatalogListItem {
  meta: ComponentMeta;
}

export const CATEGORY_FILTER_LABEL: Record<ComponentCategory, string> = {
  actions: 'Action',
  inputs: 'Input',
  display: 'Display',
  layout: 'Layout',
  overlays: 'Overlay',
  navigation: 'Navigation',
  feedback: 'Feedback',
};
