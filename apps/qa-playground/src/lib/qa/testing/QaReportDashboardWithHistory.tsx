'use client';

import { useMemo, useState } from 'react';
import type { QAPlaywrightHistoryEntry, QAPlaywrightRunResponse, QAReportSuiteId } from '@/lib/qa/types';
import {
  formatRelativeTime,
  formatReportDate,
  parseReportTimestamp,
  useNowTick,
} from '@/lib/qa/testing/reportTime';
import { QaReportDashboard, type QaReportDashboardProps } from '@/components/shared/QaReportDashboard';
import { InputFeedback } from '@oneui/ui/components/Input';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { Surface } from '@oneui/ui/components/Surface';
import { TabGroup, TabItem } from '@oneui/ui/components/Tabs';
import { Text } from '@oneui/ui/components/Text';
import styles from '@/styles/reportDashboard.module.css';

export type QaReportRunPeriod = 'current' | 'previous';

export type QaReportDashboardWithHistoryProps = Omit<
  QaReportDashboardProps,
  'suite' | 'lastRunMessage'
> & {
  suiteId: QAReportSuiteId;
  currentReport: QAPlaywrightRunResponse | null;
  previousRuns: readonly QAPlaywrightHistoryEntry[];
};

function suiteFromReport(
  report: QAPlaywrightRunResponse | null | undefined,
  suiteId: QAReportSuiteId,
) {
  return report?.suites?.[suiteId] ?? null;
}

export function QaReportDashboardWithHistory({
  suiteId,
  currentReport,
  previousRuns,
  emptyHint,
  ...dashboardProps
}: QaReportDashboardWithHistoryProps) {
  const [period, setPeriod] = useState<QaReportRunPeriod>('current');
  const [previousIndex, setPreviousIndex] = useState(0);
  const now = useNowTick();

  const activeReport = useMemo((): QAPlaywrightRunResponse | null => {
    if (period === 'current') return currentReport;
    const entry = previousRuns[previousIndex];
    return entry?.report ?? null;
  }, [currentReport, period, previousIndex, previousRuns]);

  const activeSuite = suiteFromReport(activeReport, suiteId);
  const hasPrevious = previousRuns.length > 0;

  const previousRunLabel = (entry: QAPlaywrightHistoryEntry, index: number): string => {
    const at = parseReportTimestamp(entry.report.message) ?? parseReportTimestamp(entry.savedAt);
    if (!at) return `Previous run ${index + 1}`;
    return formatReportDate(at);
  };

  const previousOptions = useMemo((): SelectOption<string>[] => {
    return previousRuns.map((entry, index) => ({
      value: String(index),
      label: `${previousRunLabel(entry, index)}${index === 0 ? ' (most recent)' : ''}`,
    }));
  }, [previousRuns]);

  const periodTabs = (
    <TabGroup
      value={period}
      onValueChange={(next) => {
        const value = (next ?? 'current') as QaReportRunPeriod;
        setPeriod(value);
        if (value === 'previous') setPreviousIndex(0);
      }}
      size="s"
      appearance="primary"
      className={styles.periodTabs}
      aria-label="Report run period"
    >
      <TabItem value="current">Current</TabItem>
      <TabItem value="previous">Previous</TabItem>
    </TabGroup>
  );

  if (period === 'previous' && !hasPrevious) {
    return (
      <div className={styles.withHistory}>
        <Surface mode="ghost" appearance="neutral" className={styles.periodShell}>
          {periodTabs}
        </Surface>
        <InputFeedback variant="informative" attention="medium" size={10}>
          No previous report yet. After you run tests again, the report shown under Current will move
          here.
        </InputFeedback>
      </div>
    );
  }

  return (
    <div className={styles.withHistory}>
      <Surface mode="ghost" appearance="neutral" className={styles.periodShell}>
        {periodTabs}
      </Surface>

      {period === 'previous' && hasPrevious ? (
        <Surface mode="minimal" appearance="neutral" className={styles.previousPicker}>
          <Text variant="label" size="S" weight="medium">
            Earlier run
          </Text>
          {previousRuns.length > 1 ? (
            <Select
              className={styles.previousSelect}
              value={String(previousIndex)}
              onChange={(value) => setPreviousIndex(Number(value))}
              options={previousOptions}
              size="sm"
              aria-label="Select earlier test run"
            />
          ) : (
            <Text variant="body" size="S" weight="medium">
              {previousRunLabel(previousRuns[0]!, 0)} (most recent)
            </Text>
          )}
          {(() => {
            const at =
              parseReportTimestamp(previousRuns[previousIndex]?.report.message) ??
              parseReportTimestamp(previousRuns[previousIndex]?.savedAt);
            return at ? (
              <Text variant="label" size="XS" weight="low">
                Archived {formatReportDate(at)} ({formatRelativeTime(at, now)})
              </Text>
            ) : null;
          })()}
        </Surface>
      ) : null}

      <QaReportDashboard
        key={`${period}-${previousIndex}-${activeReport?.message ?? 'empty'}`}
        {...dashboardProps}
        suite={activeSuite}
        lastRunMessage={activeReport?.message}
        emptyHint={
          period === 'current'
            ? emptyHint
            : 'This archived run has no data for this suite.'
        }
      />
    </div>
  );
}
