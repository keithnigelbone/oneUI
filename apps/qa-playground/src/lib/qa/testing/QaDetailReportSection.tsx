import type { QAPlaywrightRunResponse } from '@/lib/qa/types';
import { QaReportLoadPanel } from '@/lib/qa/testing/QaReportLoadPanel';
import { QaTestRunCompleteModal } from '@/lib/qa/testing/QaTestRunCompleteModal';
import { QaTestRunTerminal } from '@/lib/qa/testing/QaTestRunTerminal';
import type { UseQaComponentTestRunResult } from '@/lib/qa/testing/useQaComponentTestRun';
import styles from '@/styles/detail.module.css';

export const QA_ACCESSIBILITY_TAB_HINT =
  'Automated WCAG 2.x scans and axe checks from the latest Playwright run.';

export const QA_FUNCTIONAL_TAB_HINT =
  'DOM structure, props, and interaction checks from the latest Playwright run.';

export type QaDetailReportSectionProps = {
  componentName: string;
  hasPlaywrightBundle: boolean;
  loading: boolean;
  lastRun: QAPlaywrightRunResponse | null;
  lastFetchedAt: Date | null;
  hasFetchedOnce: boolean;
  onLoad: () => void;
  canRunTests?: boolean;
  testRun?: UseQaComponentTestRunResult;
  onRunTests?: () => void;
};

/** QA-only chrome: load control, progress, success/error, and timestamps (not component library code). */
export function QaDetailReportSection({
  componentName,
  hasPlaywrightBundle,
  loading,
  lastRun,
  lastFetchedAt,
  hasFetchedOnce,
  onLoad,
  canRunTests = false,
  testRun,
  onRunTests,
}: QaDetailReportSectionProps) {
  return (
    <div className={styles.reportBlock}>
      <QaReportLoadPanel
        componentName={componentName}
        loading={loading}
        hasPlaywrightBundle={hasPlaywrightBundle}
        reportOk={hasFetchedOnce ? (lastRun?.ok ?? false) : null}
        reportHasSuiteData={
          Boolean(lastRun?.suites?.accessibility && lastRun?.suites?.functional)
        }
        reportMessage={lastRun?.message}
        lastFetchedAt={lastFetchedAt}
        onLoad={onLoad}
        canRunTests={canRunTests}
        runTestsLoading={testRun?.isRunning}
        onRunTests={onRunTests}
      />

      {testRun ? (
        <QaTestRunTerminal
          phase={testRun.phase}
          logs={testRun.logs}
          exitCode={testRun.exitCode}
          error={testRun.error}
        />
      ) : null}

      {testRun ? (
        <QaTestRunCompleteModal
          open={testRun.showCompleteModal}
          ok={testRun.phase === 'success'}
          componentName={componentName}
          exitCode={testRun.exitCode}
          logs={testRun.logs}
          onClose={testRun.dismissCompleteModal}
          onLoadReport={onLoad}
        />
      ) : null}
    </div>
  );
}
