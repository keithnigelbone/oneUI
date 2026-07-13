'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SelectOption } from '@oneui/ui/components/Select';
import { Select } from '@oneui/ui/components/Select';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Spinner } from '@oneui/ui/components/Spinner';
import { Surface } from '@oneui/ui/components/Surface';

import { AssigneeOverview } from '@/components/qa-dashboard/AssigneeOverview';
import { BugDetailsDrawer } from '@/components/qa-dashboard/BugDetailsDrawer';
import { BugExplorer } from '@/components/qa-dashboard/BugExplorer';
import { BugHealthPanel } from '@/components/qa-dashboard/BugHealthPanel';
import { BugTypeDistribution } from '@/components/qa-dashboard/BugTypeDistribution';
import { ComponentDistribution } from '@/components/qa-dashboard/ComponentDistribution';
import { DashboardPanel } from '@/components/qa-dashboard/DashboardPanel';
import { PlatformMetricsTable } from '@/components/qa-dashboard/PlatformMetricsTable';
import { SeverityDashboard } from '@/components/qa-dashboard/SeverityDashboard';
import { SummaryCards } from '@/components/qa-dashboard/SummaryCards';
import { useNotionBugs } from '@/hooks/useNotionBugs';
import {
  assigneeMetrics,
  countBySeverity,
  DEFAULT_FILTERS,
  distinctFilterValues,
  filterBugsByPlatform,
  orderedBugStatuses,
  platformMetrics,
} from '@/services/notion/bugAnalytics';
import type { BugFilters } from '@/services/notion/types';
import type { NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

function formatLastSync(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function QADashboardPage() {
  const {
    bugs,
    loading,
    error,
    warning,
    source,
    configured,
    fetchedAt,
    refresh,
  } = useNotionBugs();
  const [filters, setFilters] = useState<BugFilters>(DEFAULT_FILTERS);
  const [drawerBug, setDrawerBug] = useState<NotionBug | null>(null);

  useEffect(() => {
    if (!drawerBug) return;
    const fresh = bugs.find((bug) => bug.id === drawerBug.id);
    if (fresh) setDrawerBug(fresh);
  }, [bugs, drawerBug?.id]);

  const severityCounts = useMemo(() => countBySeverity(bugs), [bugs]);
  const platforms = useMemo(() => platformMetrics(bugs), [bugs]);

  const overviewBugs = useMemo(
    () => filterBugsByPlatform(bugs, filters.platform),
    [bugs, filters.platform],
  );

  const statusColumns = useMemo(() => orderedBugStatuses(overviewBugs), [overviewBugs]);

  const assignees = useMemo(
    () => assigneeMetrics(overviewBugs, statusColumns),
    [overviewBugs, statusColumns],
  );

  const platformOptions: SelectOption<string>[] = useMemo(() => {
    const values = distinctFilterValues(bugs, 'platform');
    return [
      { value: 'all', label: 'All platforms' },
      ...values.map((p) => ({ value: p, label: p })),
    ];
  }, [bugs]);

  const scrollToExplorer = () => {
    document.getElementById('bug-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Each dashboard drill-down starts clean (no stacked filters) but keeps the overview platform scope. */
  const applyFreshFilter = (patch: Partial<BugFilters>) => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      platform: prev.platform,
      ...patch,
    }));
    scrollToExplorer();
  };

  const applyStatusFilter = (status: string | 'all' | 'total') => {
    applyFreshFilter({
      status: status === 'all' || status === 'total' ? 'all' : status,
    });
  };

  const applyAssigneeFilter = (assignee: string) => {
    applyFreshFilter({ assignee });
  };

  const applyAssigneeStatusFilter = (assignee: string, status: string) => {
    applyFreshFilter({ assignee, status });
  };

  const applySeverityFilter = (severity: string) => {
    applyFreshFilter({ severity });
  };

  const applyPlatformFilter = (platform: string) => {
    applyFreshFilter({ platform });
  };

  const applyOverviewPlatformFilter = (platform: string) => {
    setFilters((prev) => ({ ...prev, platform }));
  };

  const applyComponentFilter = (component: string, platformScope: string = 'all') => {
    applyFreshFilter({
      component,
      ...(platformScope !== 'all' ? { platform: platformScope } : {}),
    });
  };

  const applyCategoryFilter = (category: string) => {
    applyFreshFilter({ category });
  };

  const openBugDrawer = (bug: NotionBug) => {
    setDrawerBug(bug);
  };

  const activeSeverity = filters.severity;
  const activeAssignee = filters.assignee;
  const activeStatus = filters.status;
  const activeComponent = filters.component;
  const activePlatform = filters.platform;
  const activeCategory = filters.category;

  const refreshButton = (
    <Button
      variant="subtle"
      size={8}
      appearance="primary"
      start={<Icon icon="refresh" size="3.5" aria-hidden />}
      onClick={() => void refresh(true)}
      disabled={loading}
    >
      Refresh
    </Button>
  );

  const lastSyncBadge = fetchedAt ? (
    <span className={styles.lastSyncBadge}>
      <Icon icon="calendar" size="3.5" aria-hidden />
      Last sync: {formatLastSync(fetchedAt)}
    </span>
  ) : null;

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Link to="/" className={styles.backLink}>
          <IconButton icon="chevronLeft" appearance="primary" attention="low" size="m" aria-label="Back to QA Playground" />
        </Link>
        <p className={styles.pageMeta}>
          <Link to="/" className={styles.pageMetaLink}>
            QA Playground
          </Link>
          {' / Bug Tracker'}
        </p>
      </div>

      {warning ? (
        <Surface mode="subtle" appearance="warning" className={styles.banner}>
          <p className={styles.bannerText}>{warning}</p>
        </Surface>
      ) : null}

      {error ? (
        <Surface mode="subtle" appearance="negative" className={styles.banner}>
          <p className={styles.bannerText}>{error}</p>
          <Button variant="ghost" size={8} appearance="negative" onClick={() => void refresh(true)}>
            Retry
          </Button>
        </Surface>
      ) : null}

      {loading && bugs.length === 0 ? (
        <div className={styles.loadingWrap} role="status" aria-live="polite">
          <Spinner size="L" label="Loading bugs from Notion" />
          <p className={styles.loadingText}>Fetching bugs from Notion…</p>
        </div>
      ) : (
        <main className={styles.main}>
          <DashboardPanel
            title="Bug Tracker Overview"
            subtitle="Live visibility into Notion bugs — status, severity, platform, and assignee workload."
            icon="components"
            iconTone="primary"
            headerEnd={
              <>
                {lastSyncBadge}
                {refreshButton}
              </>
            }
          >
            <div className={styles.configMeta}>
              <span className={styles.configPill}>
                Source: <strong>{source === 'notion' ? 'Notion API' : 'Demo data'}</strong>
              </span>
              <span className={styles.configPill}>
                Configured: <strong>{configured ? 'Yes' : 'No'}</strong>
              </span>
              <span className={styles.configPill}>
                Auto-refresh: <strong>every 5 min</strong>
              </span>
            </div>

            <div className={styles.overviewToolbar}>
              <label className={styles.overviewFilterField}>
                <span className={styles.overviewFilterLabel}>Platform</span>
                <Select
                  value={activePlatform}
                  onChange={applyOverviewPlatformFilter}
                  options={platformOptions}
                  size="sm"
                  aria-label="Filter overview by platform"
                />
              </label>
              {activePlatform !== 'all' ? (
                <span className={styles.overviewFilterHint}>
                  Showing {overviewBugs.length} of {bugs.length} bugs
                </span>
              ) : null}
            </div>

            <SummaryCards
              bugs={overviewBugs}
              activeStatus={filters.status}
              onSelectStatus={applyStatusFilter}
            />

            <BugHealthPanel bugs={overviewBugs} />
          </DashboardPanel>

          <div className={styles.insightsRow}>
            <DashboardPanel
              title="Platform-wise metrics"
              subtitle="Bug distribution across Web, Mobile, and Accessibility."
              icon="globe"
              iconTone="informative"
            >
              <PlatformMetricsTable rows={platforms} onFilter={applyPlatformFilter} />
            </DashboardPanel>

            <DashboardPanel
              title="Severity breakdown"
              subtitle="Critical through low severity distribution."
              icon="warning"
              iconTone="warning"
            >
              <SeverityDashboard
                counts={severityCounts}
                activeSeverity={activeSeverity}
                onSelectSeverity={applySeverityFilter}
              />
            </DashboardPanel>
          </div>

          <DashboardPanel
            title="Assignee overview"
            subtitle="Bug counts by assignee and workflow status — click any count to filter the table below."
            icon="user"
            iconTone="primary"
          >
            <AssigneeOverview
              rows={assignees}
              statuses={statusColumns}
              activeAssignee={activeAssignee}
              activeStatus={activeStatus}
              onFilterAssignee={applyAssigneeFilter}
              onFilterAssigneeStatus={applyAssigneeStatusFilter}
            />
          </DashboardPanel>

          <div className={styles.insightsRow}>
            <DashboardPanel
              title="Component-wise distribution"
              subtitle="Bugs per component — filter by platform, then click a row to filter below."
              icon="components"
              iconTone="primary"
            >
              <ComponentDistribution
                bugs={bugs}
                activeComponent={activeComponent}
                activePlatform={activePlatform}
                onSelectComponent={applyComponentFilter}
              />
            </DashboardPanel>

            <DashboardPanel
              title="Bug type distribution"
              subtitle="Functional, visual, accessibility, and other categories — click a row to filter below."
              icon="layers"
              iconTone="informative"
            >
              <BugTypeDistribution
                bugs={bugs}
                activeCategory={activeCategory}
                onSelectCategory={applyCategoryFilter}
              />
            </DashboardPanel>
          </div>

          <DashboardPanel
            title="Bug explorer"
            subtitle="Search, filter, and inspect bugs — update status in Notion."
            icon="search"
            iconTone="negative"
            id="bug-explorer"
            className={styles.tableCard}
            headerEnd={<span className={styles.explorerCount}>{bugs.length} total bugs</span>}
          >
            <BugExplorer
              bugs={bugs}
              filters={filters}
              onFiltersChange={setFilters}
              onBugClick={openBugDrawer}
            />
          </DashboardPanel>
        </main>
      )}

      <BugDetailsDrawer
        bug={drawerBug}
        open={drawerBug != null}
        onClose={() => setDrawerBug(null)}
      />
    </div>
  );
}
