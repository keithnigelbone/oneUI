import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { InputFeedback } from '@oneui/ui/components/Input';
import { Spinner } from '@oneui/ui/components/Spinner';
import { Surface } from '@oneui/ui/components/Surface';
import { Text } from '@oneui/ui/components/Text';
import {
  formatTimestampValue,
  parseReportTimestamp,
  useNowTick,
} from '@/lib/qa/testing/reportTime';
import styles from '@/styles/detail.module.css';

export type QaReportLoadPanelProps = {
  componentName: string;
  loading: boolean;
  hasPlaywrightBundle: boolean;
  reportOk: boolean | null;
  /** True when JSON loaded with accessibility + functional suites (even if tests failed). */
  reportHasSuiteData?: boolean;
  reportMessage: string | null | undefined;
  lastFetchedAt: Date | null;
  onLoad: () => void;
  /** Dev-only: trigger `pnpm qa:component -- <slug>` from the UI. */
  canRunTests?: boolean;
  runTestsLoading?: boolean;
  onRunTests?: () => void;
};

export function QaReportLoadPanel({
  componentName,
  loading,
  hasPlaywrightBundle,
  reportOk,
  reportHasSuiteData = false,
  reportMessage,
  lastFetchedAt,
  onLoad,
  canRunTests = false,
  runTestsLoading = false,
  onRunTests,
}: QaReportLoadPanelProps) {
  const now = useNowTick();
  const testRunAt = parseReportTimestamp(reportMessage);
  const showSuccess = !loading && lastFetchedAt != null && reportOk === true;
  const showTestFailures = !loading && reportOk === false && reportHasSuiteData;
  const showLoadError = !loading && reportOk === false && !reportHasSuiteData;
  const showMeta = !loading && (lastFetchedAt != null || testRunAt != null);

  return (
    <Surface mode="minimal" as="section" className={styles.reportPanel} aria-label="Test report">
      <Text variant="body" size="S" weight="low">
        {hasPlaywrightBundle ? (
          <>
            View the latest{' '}
            <Text as="span" variant="body" size="S" weight="medium">
              accessibility
            </Text>{' '}
            and{' '}
            <Text as="span" variant="body" size="S" weight="medium">
              functional
            </Text>{' '}
            results for {componentName}. Use the tabs below for full breakdowns.
            {canRunTests ? (
              <>
                {' '}
                In dev,{' '}
                <Text as="span" variant="body" size="S" weight="medium">
                  Run tests
                </Text>{' '}
                executes Playwright here with live output.
              </>
            ) : null}
          </>
        ) : (
          <>
            Connect a CI pipeline or run local tests to populate accessibility and functional results
            for {componentName}.
          </>
        )}
      </Text>

      <div className={styles.reportActions}>
        {canRunTests && onRunTests ? (
          <Button
            variant="subtle"
            attention="medium"
            size={8}
            loading={runTestsLoading}
            disabled={runTestsLoading || loading}
            onClick={onRunTests}
            aria-busy={runTestsLoading}
          >
            Run tests
          </Button>
        ) : null}
        <Button
          variant="bold"
          attention="high"
          size={8}
          loading={loading}
          disabled={loading || runTestsLoading}
          onClick={onLoad}
          aria-busy={loading}
        >
          {hasPlaywrightBundle ? 'Load Playwright report' : 'Load report'}
        </Button>
      </div>

      {loading ? (
        <div className={styles.reportProgress} role="status" aria-live="polite">
          <Spinner size="S" label="Loading test summary" />
          <Text variant="label" size="S" weight="low">
            Loading test summary…
          </Text>
        </div>
      ) : null}

      {showSuccess ? (
        <InputFeedback
          variant="positive"
          attention="medium"
          size={10}
          role="status"
          aria-label="Report fetched successfully"
        >
          Report fetched successfully. Open the tabs below for details.
        </InputFeedback>
      ) : null}

      {showTestFailures ? (
        <InputFeedback variant="warning" attention="medium" size={10} role="status" aria-label="Report loaded with test failures">
          Report loaded with failures. Review{' '}
          <Text as="span" variant="label" size="S" weight="medium">
            Accessibility
          </Text>{' '}
          and{' '}
          <Text as="span" variant="label" size="S" weight="medium">
            Functional Tests
          </Text>{' '}
          for details.
        </InputFeedback>
      ) : null}

      {showLoadError ? (
        <InputFeedback
          variant="negative"
          attention="medium"
          size={10}
          role="alert"
          aria-label="Could not load test report"
        >
          Could not load the test report. Check that a recent test run exists, then try again.
        </InputFeedback>
      ) : null}

      {showMeta ? (
        <div className={styles.reportMeta}>
          {lastFetchedAt ? (
            <Badge size="s" attention="medium" appearance="neutral" aria-label="Report fetched time">
              Fetched {formatTimestampValue(lastFetchedAt, now)}
            </Badge>
          ) : null}
          {testRunAt ? (
            <Badge size="s" attention="medium" appearance="neutral" aria-label="Test run time">
              Test run {formatTimestampValue(testRunAt, now)}
            </Badge>
          ) : null}
        </div>
      ) : null}
    </Surface>
  );
}
