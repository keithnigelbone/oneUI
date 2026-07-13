'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { Badge } from '@oneui/ui/components/Badge';
import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Collapsible } from '@oneui/ui/components/Collapsible';
import { Divider } from '@oneui/ui/components/Divider';
import { IconButton } from '@oneui/ui/components/IconButton';
import { InputFeedback } from '@oneui/ui/components/Input';
import { Input } from '@oneui/ui/components/Input';
import { LinkButton } from '@oneui/ui/components/LinkButton';
import { Icon } from '@oneui/ui/components/Icon';
import { IconContained } from '@oneui/ui/components/IconContained';
import { Surface } from '@oneui/ui/components/Surface';
import { Text } from '@oneui/ui/components/Text';
import type { QaDashboardCase, QaReportDashboardVariant } from '@/components/shared/QaReportDashboard';
import styles from '@/styles/reportDashboard.module.css';

type StatusFilter = 'all' | QaDashboardCase['status'];

const STATUS_SORT: Record<QaDashboardCase['status'], number> = {
  failed: 0,
  skipped: 1,
  passed: 2,
};

function formatCaseSeconds(durationMs?: number): string {
  if (typeof durationMs !== 'number' || !Number.isFinite(durationMs)) return '—';
  return `${(durationMs / 1000).toFixed(2)}s`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  return `${(Math.round(seconds * 100) / 100).toFixed(2)}s`;
}

function statusAppearance(status: QaDashboardCase['status']): ComponentAppearance {
  if (status === 'passed') return 'positive';
  if (status === 'failed') return 'negative';
  return 'neutral';
}

function statusLabel(status: QaDashboardCase['status']): string {
  if (status === 'passed') return 'Passed';
  if (status === 'failed') return 'Failed';
  return 'Skipped';
}

function headerIconName(variant: QaReportDashboardVariant) {
  if (variant === 'accessibility') return 'eye' as const;
  if (variant === 'functional') return 'list' as const;
  return 'grid' as const;
}

function parseErrorSummary(error: string): { headline: string; location?: string } {
  const trimmed = error.trim();
  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
  const headline = lines[0] ?? trimmed;
  const locationLine = lines.find((line) => line.startsWith('at '));
  const locationMatch =
    locationLine?.match(/\(([^)]+:\d+:\d+)\)/)?.[1] ??
    locationLine?.match(/at ([^\s]+:\d+:\d+)/)?.[1];
  return { headline, location: locationMatch };
}

function parseSpecFile(error: string): string | null {
  const match = error.match(/(?:^|\s|at\s)([\w./\\-]+\.(?:spec|test)\.[jt]sx?)(?::\d+)?/i);
  if (!match?.[1]) return null;
  const path = match[1];
  return path.split(/[/\\]/).pop() ?? path;
}

function categoryLabel(name: string, variant: QaReportDashboardVariant): string {
  if (/^\[fn\]/i.test(name)) return 'Functionality';
  if (/^\[a11y\]/i.test(name)) return 'Accessibility';
  if (variant === 'accessibility') return 'Accessibility';
  if (variant === 'performance') return 'Performance';
  return 'Functionality';
}

function FailedTestCaseRow({
  testCase,
  rowId,
  variant,
}: {
  testCase: QaDashboardCase;
  rowId: string;
  variant: QaReportDashboardVariant;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const error = testCase.error ?? '';
  const { headline, location } = parseErrorSummary(error);
  const specFile = parseSpecFile(error);
  const category = categoryLabel(testCase.name, variant);

  const copyStack = useCallback(async () => {
    if (!error.trim() || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(error);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [error]);

  return (
    <article className={styles.caseItem} id={rowId}>
      <Collapsible open={open} onOpenChange={setOpen} className={styles.caseCardCollapsible}>
        <Surface mode="subtle" appearance="negative" className={styles.caseCard}>
          <Collapsible.Trigger className={styles.caseCardTrigger} aria-label={`Toggle failure details for ${testCase.name}`}>
            <Badge size="xs" attention="medium" appearance="negative" className={styles.caseStatusBadge}>
              Failed
            </Badge>
            <Text variant="label" size="S" weight="medium" className={styles.caseName}>
              {testCase.name}
            </Text>
            <span className={styles.caseCardDuration}>
              <Icon icon="clock" size="4" emphasis="low" aria-hidden />
              <Text variant="label" size="XS" weight="medium">
                {formatCaseSeconds(testCase.durationMs)}
              </Text>
            </span>
          </Collapsible.Trigger>

          <Collapsible.Panel className={styles.caseFailurePanel}>
            <Surface mode="elevated" className={styles.caseFailureDetails}>
              <div className={styles.caseFailureHeader}>
                <Icon icon="error" size="4" appearance="negative" emphasis="tintedA11y" aria-hidden />
                <Text variant="label" size="S" weight="medium">
                  Failure details
                </Text>
              </div>

              <InputFeedback variant="negative" attention="medium" size={10}>
                Review the stack trace and context below for debugging steps.
              </InputFeedback>

              <Surface mode="minimal" appearance="neutral" className={styles.caseFailureCode}>
                <div className={styles.caseFailureCodeHead}>
                  <Icon icon="document" size="4" emphasis="low" aria-hidden />
                  <Text variant="code" size="S" className={styles.caseFailureHeadline}>
                    {headline}
                  </Text>
                  <LinkButton
                    variant="ghost"
                    attention="low"
                    size={8}
                    className={styles.caseFailureCopy}
                    start={<Icon icon="copy" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />}
                    onClick={() => void copyStack()}
                  >
                    {copied ? 'Copied' : 'Copy stack trace'}
                  </LinkButton>
                </div>
                {location ? (
                  <Text variant="code" size="XS" weight="low" className={styles.caseFailureLocation}>
                    at {location}
                  </Text>
                ) : null}
                <pre className={styles.caseErrorPre}>{error}</pre>
              </Surface>
            </Surface>
          </Collapsible.Panel>

          <Divider attention="low" appearance="neutral" />

          <div className={styles.caseCardFooter}>
            <span className={styles.caseCardMeta}>
              <Icon icon="filter" size="4" emphasis="low" aria-hidden />
              <Text variant="label" size="XS" weight="low">
                Category: {category}
              </Text>
            </span>
            {specFile ? (
              <span className={styles.caseCardMeta}>
                <Icon icon="document" size="4" emphasis="low" aria-hidden />
                <Text variant="label" size="XS" weight="low">
                  {specFile}
                </Text>
              </span>
            ) : null}
            <LinkButton
              variant="ghost"
              attention="low"
              size={8}
              className={styles.caseCardFooterAction}
              end={
                open ? (
                  <Icon icon="externalLink" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />
                ) : (
                  <Icon icon="chevronDown" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />
                )
              }
              onClick={() => setOpen((value) => !value)}
            >
              {open ? 'View full trace' : 'View details'}
            </LinkButton>
          </div>
        </Surface>
      </Collapsible>
    </article>
  );
}

function TestCaseRow({
  testCase,
  rowId,
  variant,
}: {
  testCase: QaDashboardCase;
  rowId: string;
  variant: QaReportDashboardVariant;
}) {
  if (testCase.status === 'failed' && testCase.error?.trim()) {
    return <FailedTestCaseRow testCase={testCase} rowId={rowId} variant={variant} />;
  }

  const appearance = statusAppearance(testCase.status);

  return (
    <article className={styles.caseItem} id={rowId}>
      <Surface mode="subtle" appearance={appearance} className={styles.caseRow}>
        <Badge size="xs" attention="medium" appearance={appearance} className={styles.caseStatusBadge}>
          {statusLabel(testCase.status)}
        </Badge>
        <Text variant="label" size="S" weight="medium" className={styles.caseName}>
          {testCase.name}
        </Text>
        <Badge size="xs" attention="low" appearance="neutral" className={styles.caseDurationBadge}>
          {formatCaseSeconds(testCase.durationMs)}
        </Badge>
      </Surface>
    </article>
  );
}

export type QaTestResultsDetailProps = {
  subjectName: string;
  title: string;
  variant: QaReportDashboardVariant;
  hint: string;
  headerAppearance: ComponentAppearance;
  statusBadge: ReactNode;
  cases: readonly QaDashboardCase[];
  passed: number;
  failed: number;
  skipped: number;
  durationSec: number;
  onBack: () => void;
};

export function QaTestResultsDetail({
  subjectName,
  title,
  variant,
  hint,
  headerAppearance,
  statusBadge,
  cases,
  passed,
  failed,
  skipped,
  durationSec,
  onBack,
}: QaTestResultsDetailProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const filteredCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let next = [...cases];

    if (statusFilter !== 'all') {
      next = next.filter((c) => c.status === statusFilter);
    }

    if (normalizedQuery) {
      next = next.filter((c) => c.name.toLowerCase().includes(normalizedQuery));
    }

    next.sort((a, b) => {
      const byStatus = STATUS_SORT[a.status] - STATUS_SORT[b.status];
      if (byStatus !== 0) return byStatus;
      return a.name.localeCompare(b.name);
    });

    return next;
  }, [cases, query, statusFilter]);

  const filterChipValue = [statusFilter];

  return (
    <Surface mode="elevated" className={[styles.card, styles.cardFill].join(' ')}>
      <LinkButton
        variant="ghost"
        attention="low"
        size={8}
        className={styles.detailBack}
        start={<Icon icon="arrowLeft" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />}
        onClick={onBack}
      >
        Back to dashboard
      </LinkButton>

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

      <Surface mode="minimal" appearance="neutral" className={styles.detailPanel}>
        <div className={styles.detailCardHeader}>
          <div className={styles.detailTitleBlock}>
            <Text variant="title" size="S" weight="medium">
              All test cases
            </Text>
            <Text variant="label" size="XS" weight="low">
              Showing {filteredCases.length} of {cases.length}
            </Text>
          </div>
          <div className={styles.detailPillRow} aria-label="Run summary">
            <Badge size="xs" attention="medium" appearance="positive">
              Passed {passed}
            </Badge>
            <Badge size="xs" attention="medium" appearance="negative">
              Failed {failed}
            </Badge>
            <Badge size="xs" attention="medium" appearance="neutral">
              Skipped {skipped}
            </Badge>
            <Badge size="xs" attention="medium" appearance="informative">
              {formatDuration(durationSec)}
            </Badge>
          </div>
        </div>

        <div className={styles.detailToolbar}>
          <Input
            shape="pill"
            size={10}
            attention="medium"
            appearance="secondary"
            placeholder="Search tests by name…"
            value={query}
            onChange={setQuery}
            aria-label="Search test cases"
            start={<Icon icon="search" size="4" emphasis="low" aria-hidden />}
            end={
              query ? (
                <IconButton
                  attention="low"
                  size={8}
                  appearance="secondary"
                  icon="close"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                />
              ) : undefined
            }
          />

          <ChipGroup
            value={filterChipValue}
            onValueChange={(next) => setStatusFilter((next[0] ?? 'all') as StatusFilter)}
            required
            size="s"
            appearance="primary"
            wrap
            aria-label="Filter tests by status"
          >
            <Chip value="all" aria-label={`All tests, ${cases.length} total`}>
              All ({cases.length})
            </Chip>
            <Chip value="passed" appearance="positive" aria-label={`Passed tests, ${passed} total`}>
              Passed ({passed})
            </Chip>
            <Chip value="failed" appearance="negative" aria-label={`Failed tests, ${failed} total`}>
              Failed ({failed})
            </Chip>
            <Chip value="skipped" appearance="neutral" aria-label={`Skipped tests, ${skipped} total`}>
              Skipped ({skipped})
            </Chip>
          </ChipGroup>
        </div>

        {cases.length === 0 ? (
          <div className={styles.detailPanelBody}>
            <InputFeedback variant="informative" attention="medium" size={10}>
              No per-case rows in this report.
            </InputFeedback>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className={styles.detailPanelBody}>
            <InputFeedback variant="informative" attention="medium" size={10}>
              No tests match your search or filter. Try another status or clear the search field.
            </InputFeedback>
          </div>
        ) : (
          <div className={styles.detailPanelBody}>
            <div className={styles.caseListScroll} role="list" aria-label="Test case results">
              {filteredCases.map((testCase, index) => (
                <TestCaseRow
                  key={`${testCase.status}-${testCase.name}-${index}`}
                  testCase={testCase}
                  rowId={`qa-case-${index}`}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        )}
      </Surface>
    </Surface>
  );
}
