'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ComponentAppearance, SemanticIconName } from '@oneui/shared';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Collapsible } from '@oneui/ui/components/Collapsible';
import { Divider } from '@oneui/ui/components/Divider';
import { IconButton } from '@oneui/ui/components/IconButton';
import { InputFeedback } from '@oneui/ui/components/Input';
import { LinkButton } from '@oneui/ui/components/LinkButton';
import { Modal } from '@oneui/ui/components/Modal';
import { Icon } from '@oneui/ui/components/Icon';
import { IconContained } from '@oneui/ui/components/IconContained';
import { Surface } from '@oneui/ui/components/Surface';
import { Text } from '@oneui/ui/components/Text';
import {
  formatRelativeTime,
  formatReportDate,
  parseReportTimestamp,
  useNowTick,
} from '@/lib/qa/testing/reportTime';
import styles from '@/styles/reportDashboard.module.css';
import { QaTestResultsDetail } from '@/components/shared/QaTestResultsDetail';

export type QaDashboardCase = {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs?: number;
  error?: string;
  bugId?: string;
  componentBand?: string;
};

export type QaDashboardAxeViolation = {
  id: string;
  impact: string;
  description: string;
  helpUrl?: string;
  nodes: number;
};

export type QaDashboardSuite = {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  logs: string[];
  errors: string[];
  traceHint?: string;
  screenshotHint?: string;
  cases?: QaDashboardCase[];
  axe?: { violations: QaDashboardAxeViolation[] };
};

export type QaReportDashboardVariant = 'accessibility' | 'functional' | 'performance';

export type QaReportDashboardProps = {
  subjectName: string;
  title: string;
  suite?: QaDashboardSuite | null;
  hint: string;
  emptyHint?: string;
  lastRunMessage?: string | null;
  variant: QaReportDashboardVariant;
};

function totalCases(s: QaDashboardSuite): number {
  return s.passed + s.failed + s.skipped;
}

function passRatePercent(s: QaDashboardSuite): number {
  const t = totalCases(s);
  if (t <= 0) return 0;
  return Math.round((s.passed / t) * 1000) / 10;
}

function sumDurationMs(s: QaDashboardSuite): number {
  return (s.cases ?? []).reduce((acc, c) => acc + (typeof c.durationMs === 'number' ? c.durationMs : 0), 0);
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  return `${(Math.round(seconds * 100) / 100).toFixed(2)}s`;
}

function suiteKindLabel(v: QaReportDashboardVariant): string {
  if (v === 'accessibility') return 'Accessibility Tests';
  if (v === 'performance') return 'Performance Tests';
  return 'Functional Tests';
}

function headerIconName(variant: QaReportDashboardVariant): SemanticIconName {
  if (variant === 'accessibility') return 'eye';
  if (variant === 'functional') return 'list';
  return 'grid';
}

function toQaSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function shareOfTotal(value: number, total: number): string {
  if (total <= 0) return '0% of total';
  return `${Math.round((value / total) * 100)}% of total`;
}

function statAppearance(tone: 'primary' | 'pass' | 'fail' | 'skip'): ComponentAppearance {
  if (tone === 'pass') return 'positive';
  if (tone === 'fail') return 'negative';
  if (tone === 'skip') return 'neutral';
  return 'primary';
}

function statIcon(tone: 'primary' | 'pass' | 'fail' | 'skip'): SemanticIconName {
  if (tone === 'pass') return 'check';
  if (tone === 'fail') return 'close';
  if (tone === 'skip') return 'remove';
  return 'grid';
}

function ReportStatCard({
  label,
  value,
  helperText,
  tone,
  onClick,
  disabled,
}: {
  label: string;
  value: number;
  helperText?: string;
  tone: 'primary' | 'pass' | 'fail' | 'skip';
  onClick?: () => void;
  disabled?: boolean;
}) {
  const appearance = statAppearance(tone);
  const interactive = Boolean(onClick);

  const body = (
    <Surface mode="subtle" appearance={appearance} className={styles.statCard}>
      <IconContained icon={statIcon(tone)} size="m" attention="high" appearance={appearance} aria-hidden />
      <div className={styles.statText}>
        <Text variant="label" size="S" weight="medium">
          {label}
        </Text>
        <Text variant="headline" size="S" weight="high">
          {value}
        </Text>
        {helperText ? (
          <Text variant="label" size="XS" weight="low">
            {helperText}
          </Text>
        ) : null}
      </div>
    </Surface>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={[styles.statCardButton, styles.statCardInteractive].join(' ')}
        disabled={disabled}
        onClick={onClick}
        aria-label={`${label}: ${value}. ${helperText ?? ''}`}
      >
        {body}
      </button>
    );
  }

  return body;
}

function DashboardHeader({
  subjectName,
  title,
  hint,
  variant,
  headerAppearance,
  statusBadge,
}: {
  subjectName: string;
  title: string;
  hint: string;
  variant: QaReportDashboardVariant;
  headerAppearance: ComponentAppearance;
  statusBadge: ReactNode;
}) {
  return (
    <header className={styles.cardHeader}>
      <IconContained
        icon={headerIconName(variant)}
        size="m"
        attention="high"
        appearance={headerAppearance}
        aria-hidden
      />
      <div className={styles.cardHeaderText}>
        <div className={styles.titleRow}>
          <Text as="h2" variant="title" size="M" weight="high">
            {subjectName} — {title} Results
          </Text>
          {statusBadge}
        </div>
        <Text variant="body" size="S" weight="low">
          {hint}
        </Text>
      </div>
    </header>
  );
}

function TableSection({
  id,
  title,
  count,
  countAppearance = 'neutral',
  action,
  children,
}: {
  id?: string;
  title: string;
  count?: number;
  countAppearance?: ComponentAppearance;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.tableSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <Text as="h3" variant="title" size="S" weight="medium">
            {title}
          </Text>
          {typeof count === 'number' ? (
            <Badge size="xs" attention="medium" appearance={countAppearance} aria-label={`${count} items`}>
              {count}
            </Badge>
          ) : null}
        </div>
        {action}
      </div>
      <div className={styles.tableWrap}>{children}</div>
    </section>
  );
}

export function QaReportDashboard({
  subjectName,
  title,
  suite,
  hint,
  emptyHint,
  lastRunMessage,
  variant,
}: QaReportDashboardProps) {
  const failuresAnchorId = `qa-report-failures-${toQaSlug(subjectName)}-${variant}`;
  const [testsDetailOpen, setTestsDetailOpen] = useState(false);
  const [failureDetail, setFailureDetail] = useState<{ testName: string; error: string } | null>(null);
  const [copyOk, setCopyOk] = useState(false);
  const [commandCopied, setCommandCopied] = useState(false);
  const now = useNowTick();
  const testRunAt = useMemo(() => parseReportTimestamp(lastRunMessage), [lastRunMessage]);

  const failedCases = useMemo(() => (suite?.cases ?? []).filter((c) => c.status === 'failed'), [suite]);
  const logText = useMemo(() => (suite?.logs ?? []).join('\n'), [suite?.logs]);
  const errorText = useMemo(() => (suite?.errors ?? []).join('\n'), [suite?.errors]);

  const scrollTo = useCallback((id: string) => {
    if (typeof document === 'undefined') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const copyText = useCallback(async (text: string, onSuccess: () => void) => {
    if (!text.trim() || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const copyLogs = useCallback(async () => {
    await copyText(logText, () => {
      setCopyOk(true);
      window.setTimeout(() => setCopyOk(false), 2000);
    });
  }, [copyText, logText]);

  const copyCommand = useCallback(async () => {
    const qaCommand = `pnpm --filter @oneui/qa-playground qa:${toQaSlug(subjectName)}:report`;
    await copyText(qaCommand, () => {
      setCommandCopied(true);
      window.setTimeout(() => setCommandCopied(false), 2000);
    });
  }, [copyText, subjectName]);

  if (!suite) {
    return (
      <div className={styles.root}>
        <InputFeedback variant="informative" attention="medium" size={10}>
          {emptyHint?.trim()
            ? emptyHint
            : 'No report yet — load a Playwright summary or connect CI output.'}
        </InputFeedback>
      </div>
    );
  }

  const total = totalCases(suite);
  const rate = passRatePercent(suite);
  const durationSec = sumDurationMs(suite) / 1000;
  const showAxeSection = variant === 'accessibility';
  const hasFailures = suite.failed > 0;
  const axeCount = suite.axe?.violations?.length ?? 0;
  const headerAppearance: ComponentAppearance = hasFailures ? 'warning' : 'positive';
  const qaCommand = `pnpm --filter @oneui/qa-playground qa:${toQaSlug(subjectName)}:report`;

  const statusBadge = hasFailures ? (
    <Badge size="s" attention="medium" appearance="negative" aria-label={`${suite.failed} tests failed`}>
      {suite.failed} failed
    </Badge>
  ) : (
    <Badge size="s" attention="medium" appearance="positive" aria-label="All tests passing">
      All passing
    </Badge>
  );

  if (testsDetailOpen) {
    return (
      <div className={[styles.root, styles.rootFill].join(' ')}>
        <QaTestResultsDetail
          subjectName={subjectName}
          title={title}
          variant={variant}
          hint={`${subjectName} ${suiteKindLabel(variant)} · ${total} ${total === 1 ? 'test' : 'tests'}`}
          headerAppearance={headerAppearance}
          statusBadge={statusBadge}
          cases={suite.cases ?? []}
          passed={suite.passed}
          failed={suite.failed}
          skipped={suite.skipped}
          durationSec={durationSec}
          onBack={() => setTestsDetailOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Surface mode="elevated" className={styles.card}>
        <DashboardHeader
          subjectName={subjectName}
          title={title}
          hint={hint}
          variant={variant}
          headerAppearance={headerAppearance}
          statusBadge={statusBadge}
        />

        <Surface mode="minimal" appearance="informative" className={styles.commandRow} aria-label="Run command">
          <span className={styles.commandIconWell} aria-hidden>
            <Icon icon="document" size="4" appearance="informative" emphasis="tintedA11y" />
          </span>
          <div className={styles.commandBody}>
            <Text as="code" variant="code" size="S" className={styles.commandCode}>
              {qaCommand}
            </Text>
            <IconButton
              attention="low"
              size={8}
              appearance="informative"
              icon={commandCopied ? 'check' : 'copy'}
              aria-label={commandCopied ? 'Command copied' : 'Copy run command'}
              onClick={() => void copyCommand()}
            />
          </div>
        </Surface>

        <Surface mode="ghost" appearance="neutral" className={styles.metricsPanel}>
          <div className={styles.summaryGrid}>
            <ReportStatCard label="Total Cases" value={total} helperText="Test cases executed" tone="primary" />
            <ReportStatCard
              label="Passed"
              value={suite.passed}
              helperText={shareOfTotal(suite.passed, total)}
              tone="pass"
            />
            <ReportStatCard
              label="Failed"
              value={suite.failed}
              helperText={shareOfTotal(suite.failed, total)}
              tone="fail"
              disabled={suite.failed === 0}
              onClick={() => scrollTo(failuresAnchorId)}
            />
            <ReportStatCard
              label="Skipped"
              value={suite.skipped}
              helperText={shareOfTotal(suite.skipped, total)}
              tone="skip"
            />
          </div>

          <div className={styles.passRateBlock} role="group" aria-label="Pass rate">
            <div className={styles.passRateHeader}>
              <Text variant="label" size="S" weight="medium">
                Pass rate
              </Text>
              <Text variant="headline" size="M" weight="high">
                {rate}%
              </Text>
            </div>
            <div className={styles.passBarTrack} aria-hidden>
              <div className={styles.passBarFill} style={{ width: `${rate}%` }} />
            </div>
            <div className={styles.passRateLegend}>
              <Badge size="xs" attention="medium" appearance="positive">
                {suite.passed} passed
              </Badge>
              {suite.failed > 0 ? (
                <Badge size="xs" attention="medium" appearance="negative">
                  {suite.failed} failed
                </Badge>
              ) : null}
              {suite.skipped > 0 ? (
                <Badge size="xs" attention="medium" appearance="neutral">
                  {suite.skipped} skipped
                </Badge>
              ) : null}
            </div>
          </div>

          <Divider attention="low" appearance="neutral" />

          <div className={styles.metaBadgeRow}>
            <Badge size="s" attention="medium" appearance="informative" start={<Icon icon="clock" size="3" aria-hidden />}>
              Duration {formatDuration(durationSec)}
            </Badge>
            {testRunAt ? (
              <Badge
                size="s"
                attention="medium"
                appearance="neutral"
                start={<Icon icon="calendar" size="3" aria-hidden />}
              >
                {formatReportDate(testRunAt)} ({formatRelativeTime(testRunAt, now)})
              </Badge>
            ) : null}
          </div>
        </Surface>

        <Surface mode="minimal" appearance="neutral" className={styles.dataPanel}>
          <TableSection
            title={`${subjectName} (${title})`}
            action={
              <LinkButton
                variant="subtle"
                attention="medium"
                size={8}
                end={<Icon icon="chevronRight" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />}
                onClick={() => setTestsDetailOpen(true)}
              >
                View all tests
              </LinkButton>
            }
          >
            <table className={styles.table} aria-label="Component results summary">
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  <th scope="col">Total</th>
                  <th scope="col">Pass</th>
                  <th scope="col">Fail</th>
                  <th scope="col">Skip</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Text variant="label" size="S" weight="medium">
                      {subjectName}
                    </Text>
                  </td>
                  <td>{total}</td>
                  <td className={styles.numPass}>{suite.passed}</td>
                  <td className={styles.numFail}>{suite.failed}</td>
                  <td className={styles.numSkip}>{suite.skipped}</td>
                  <td>
                    <LinkButton
                      variant="ghost"
                      attention="low"
                      size={8}
                      end={<Icon icon="chevronRight" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />}
                      onClick={() => setTestsDetailOpen(true)}
                    >
                      Details
                    </LinkButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </TableSection>

          <Divider attention="low" appearance="neutral" />

          {hasFailures ? (
            <InputFeedback variant="warning" attention="medium" size={10} role="status">
              {failedCases.length} test{failedCases.length === 1 ? '' : 's'} failed in this run. Review details below
              or open the failure output dialog.
            </InputFeedback>
          ) : (
            <InputFeedback variant="positive" attention="low" size={10}>
              No failing tests in this run.
            </InputFeedback>
          )}

          <TableSection
            id={failuresAnchorId}
            title="Component issues"
            count={failedCases.length}
            countAppearance={failedCases.length > 0 ? 'negative' : 'positive'}
          >
            <table className={styles.table} aria-label="Failed tests">
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  <th scope="col">Test</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Duration</th>
                </tr>
              </thead>
              <tbody>
                {failedCases.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <Text variant="body" size="S" weight="low">
                        No failures recorded.
                      </Text>
                    </td>
                  </tr>
                ) : (
                  failedCases.map((c, i) => (
                    <tr key={`fail-${i}-${c.name}`}>
                      <td>
                        <Text variant="label" size="S" weight="medium">
                          {subjectName}
                        </Text>
                      </td>
                      <td>{c.name}</td>
                      <td>
                        {c.error?.trim() ? (
                          <LinkButton
                            variant="ghost"
                            attention="low"
                            size={8}
                            end={<Icon icon="chevronRight" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />}
                            onClick={() => setFailureDetail({ testName: c.name, error: c.error ?? '' })}
                          >
                            View output
                          </LinkButton>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{typeof c.durationMs === 'number' ? `${c.durationMs} ms` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableSection>

          {showAxeSection ? (
            <>
              <Divider attention="low" appearance="neutral" />
              <TableSection
                title="Axe findings"
                count={axeCount}
                countAppearance={axeCount > 0 ? 'negative' : 'positive'}
              >
                <table className={styles.table} aria-label="Axe accessibility findings">
                  <thead>
                    <tr>
                      <th scope="col">Rule</th>
                      <th scope="col">Impact</th>
                      <th scope="col">Nodes</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!suite.axe?.violations?.length ? (
                      <tr>
                        <td colSpan={4}>
                          <Text variant="body" size="S" weight="low">
                            No axe violations recorded for this run.
                          </Text>
                        </td>
                      </tr>
                    ) : (
                      suite.axe.violations.map((v, i) => (
                        <tr key={`axe-${i}-${v.id}`}>
                          <td>
                            <Text as="code" variant="code" size="XS" className={styles.ruleCode}>
                              {v.id}
                            </Text>
                          </td>
                          <td>{v.impact}</td>
                          <td>{v.nodes}</td>
                          <td>
                            {v.description}
                            {v.helpUrl ? (
                              <>
                                {' '}
                                <a href={v.helpUrl} className={styles.helpLink} target="_blank" rel="noreferrer">
                                  Help
                                </a>
                              </>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableSection>
            </>
          ) : null}
        </Surface>

        {logText || errorText ? (
          <Surface mode="minimal" appearance="neutral" className={styles.diagnosticsPanel}>
            <Text variant="title" size="S" weight="medium">
              Diagnostics
            </Text>

            {logText ? (
              <div className={styles.diagnosticsBlock}>
                <Collapsible defaultOpen className={styles.logsCollapsible}>
                  <div className={styles.logsHeader}>
                    <Collapsible.Trigger>
                      <Text variant="label" size="S" weight="medium">
                        Logs
                      </Text>
                    </Collapsible.Trigger>
                    <IconButton
                      attention="low"
                      size={8}
                      appearance="secondary"
                      icon={copyOk ? 'check' : 'copy'}
                      aria-label={copyOk ? 'Copied' : 'Copy logs'}
                      onClick={() => void copyLogs()}
                    />
                  </div>
                  <Collapsible.Panel>
                    <pre className={styles.logsPre}>{logText}</pre>
                  </Collapsible.Panel>
                </Collapsible>
              </div>
            ) : null}

            {errorText ? (
              <>
                {logText ? <Divider attention="low" appearance="neutral" /> : null}
                <div className={styles.diagnosticsBlock}>
                  <Collapsible defaultOpen className={styles.logsCollapsible}>
                    <Collapsible.Trigger>
                      <Text variant="label" size="S" weight="medium">
                        Errors ({suite.errors.length})
                      </Text>
                    </Collapsible.Trigger>
                    <Collapsible.Panel>
                      <InputFeedback variant="negative" attention="medium" size={10} role="alert">
                        Test run reported {suite.errors.length} error
                        {suite.errors.length === 1 ? '' : 's'}. Expand above for full output.
                      </InputFeedback>
                      <pre className={`${styles.logsPre} ${styles.logsPreError}`}>{errorText}</pre>
                    </Collapsible.Panel>
                  </Collapsible>
                </div>
              </>
            ) : null}
          </Surface>
        ) : null}
      </Surface>

      <Modal
        open={Boolean(failureDetail)}
        onOpenChange={(open) => {
          if (!open) setFailureDetail(null);
        }}
        size="M"
        title="Failure output"
        showDescription={false}
        footer
        footerEnd={
          <Button variant="subtle" attention="medium" size={8} onClick={() => setFailureDetail(null)}>
            Close
          </Button>
        }
      >
        {failureDetail ? (
          <>
            <Text variant="label" size="S" weight="medium" className={styles.failureDialogTest}>
              {failureDetail.testName}
            </Text>
            <pre className={styles.failureDialogPre}>{failureDetail.error}</pre>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
