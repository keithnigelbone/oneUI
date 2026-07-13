/**
 * CompositionCodePreviewCard.tsx
 *
 * Inline chat card for code-mode (Sandpack) compositions. Mirrors the
 * shape of `ASTPreviewCard` but for the new TSX pipeline: a one-line
 * summary, validator score chip, issue list toggle, and "Open in canvas".
 *
 * Deliberately lighter than the AST card — code mode renders inside a
 * Sandpack iframe in the canvas panel, so the chat copy doesn't need to
 * embed a second iframe. Designers see "v3 · 0 issues · open" and click
 * through to the live preview.
 *
 * Styling stays in a CSS Module so the compact transcript card can use
 * proper Surface context without ad hoc inline controls.
 */

'use client';

import React, { useState } from 'react';
import { Surface } from '../../Surface/Surface';
import { Button } from '../../Button/Button';
import { Icon } from '../../../icons/Icon';
import styles from './CompositionCodePreviewCard.module.css';
import type { CompositionCodePart } from './parts.shared';

export interface CompositionCodePreviewCardProps {
  part: CompositionCodePart;
  onOpenInCanvas?: (code: string) => void;
  /** Compact one-line summary (default) or expanded panel with issues. */
  variant?: 'full' | 'chip';
  /** Version label shown as prefix in chip variant (e.g. "v3"). */
  versionLabel?: string;
}

const VALIDATOR_RULES = [
  { id: 'parse-failure', name: 'TSX parses cleanly' },
  { id: 'banned-import', name: 'Imports stay in the playground allowlist' },
  { id: 'unknown-component', name: 'Components are exported by OneUI' },
  { id: 'invalid-surface-mode', name: 'Surface modes are valid' },
  { id: 'unknown-icon-name', name: 'Icons use the active brand icon set' },
  { id: 'raw-svg-icon', name: 'Icons render through the OneUI Icon component' },
  { id: 'raw-style-token', name: 'Visual styles use design tokens' },
  { id: 'section-div-layout', name: 'Sections use Surface, Container, or Grid' },
] as const;

function scoreClass(score: number): string {
  if (score >= 80) return `${styles.scorePill} ${styles.scorePillGood}`;
  if (score >= 50) return `${styles.scorePill} ${styles.scorePillWarn}`;
  return `${styles.scorePill} ${styles.scorePillBad}`;
}

function statusDotClass(errorCount: number, warningCount: number): string {
  if (errorCount > 0) return `${styles.statusDot} ${styles.statusDotBad}`;
  if (warningCount > 0) return `${styles.statusDot} ${styles.statusDotWarn}`;
  return `${styles.statusDot} ${styles.statusDotGood}`;
}

function sourceLabel(source: CompositionCodePart['data']['source']): string {
  if (source === 'fallback') return 'Fallback';
  if (source === 'stream-partial') return 'Recovered';
  return 'Model';
}

export function CompositionCodePreviewCard({
  part,
  onOpenInCanvas,
  variant = 'full',
  versionLabel,
}: CompositionCodePreviewCardProps) {
  const [issuesOpen, setIssuesOpen] = useState(false);
  const data = part.data;
  const validation = data.validation;
  const designGate = data.designGate;
  const issues = validation?.issues ?? [];
  const designIssues = designGate?.issues ?? [];
  const codeScore = validation?.score ?? 100;
  const designScore = designGate?.score;
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const designErrorCount = designIssues.filter((i) => i.severity === 'error').length;
  const designWarningCount = designIssues.filter((i) => i.severity === 'warning').length;
  const totalErrorCount = errorCount + designErrorCount;
  const totalWarningCount = warningCount + designWarningCount;
  const totalIssueCount = issues.length + designIssues.length;
  const issueById = new Map(issues.map((issue) => [issue.id, issue]));
  const source = sourceLabel(data.source);

  const summary =
    errorCount > 0
      ? `Code ${errorCount} error${errorCount === 1 ? '' : 's'}`
      : designErrorCount > 0
        ? `Design ${designErrorCount} error${designErrorCount === 1 ? '' : 's'}`
      : warningCount > 0
        ? `Code ${warningCount} warning${warningCount === 1 ? '' : 's'}`
        : designWarningCount > 0
          ? `Design ${designWarningCount} warning${designWarningCount === 1 ? '' : 's'}`
          : designGate
            ? 'Code and design clean'
            : 'Code clean';

  if (variant === 'chip') {
    return (
      <Surface mode="minimal" className={styles.chipRoot} role="group" aria-label={`Composition ${summary}`}>
        <button
          type="button"
          onClick={() => setIssuesOpen((v) => !v)}
          aria-expanded={issuesOpen}
          className={styles.chipHeader}
        >
          <span className={statusDotClass(totalErrorCount, totalWarningCount)} aria-hidden="true" />
          {versionLabel && (
            <span className={styles.version}>{versionLabel}</span>
          )}
          <span className={styles.summary}>TSX · {source} · {summary}</span>
          <span className={styles.scoreGroup}>
            <span className={scoreClass(codeScore)}>Code {codeScore}</span>
            {designScore !== undefined && (
              <span className={scoreClass(designScore)}>Design {designScore}</span>
            )}
          </span>
          <span
            className={`${styles.chevron} ${issuesOpen ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            <Icon name="chevronRight" size="sm" />
          </span>
        </button>
        {issuesOpen && (
          <>
            <ValidationChecklist issueById={issueById} />
            {designGate && (
              <DesignGateChecklist
                issues={designIssues}
                archetype={designGate.archetype}
              />
            )}
          </>
        )}
        {onOpenInCanvas && (
          <div className={styles.chipFooter}>
            <Button size="s" attention="low" appearance="primary" onPress={() => onOpenInCanvas(data.code)}>
              Open in canvas
            </Button>
          </div>
        )}
      </Surface>
    );
  }

  return (
    <Surface mode="minimal" className={styles.fullRoot}>
      <Surface mode="subtle" className={styles.fullHeader}>
        <div className={styles.fullTitle}>
          <span className={styles.fullTitleText}>
            Composition · {source}
          </span>
          <span className={styles.scoreGroup}>
            <span className={scoreClass(codeScore)}>Code {codeScore}</span>
            {designScore !== undefined && (
              <span className={scoreClass(designScore)}>Design {designScore}</span>
            )}
          </span>
        </div>
        <div className={styles.fullActions}>
          {totalIssueCount > 0 && (
            <Button
              size="s"
              attention="low"
              onPress={() => setIssuesOpen((v) => !v)}
              aria-expanded={issuesOpen}
            >
              {issuesOpen ? 'Hide' : 'Show'} {totalIssueCount} issue
              {totalIssueCount === 1 ? '' : 's'}
            </Button>
          )}
          {onOpenInCanvas && (
            <Button size="s" attention="high" onPress={() => onOpenInCanvas(data.code)}>
              Open in canvas
            </Button>
          )}
        </div>
      </Surface>

      {issuesOpen && totalIssueCount > 0 && (
        <>
          <ValidationChecklist issueById={issueById} />
          {designGate && (
            <DesignGateChecklist
              issues={designIssues}
              archetype={designGate.archetype}
            />
          )}
        </>
      )}
    </Surface>
  );
}

type CodeIssue = NonNullable<CompositionCodePart['data']['validation']>['issues'][number];
type DesignIssue = NonNullable<CompositionCodePart['data']['designGate']>['issues'][number];

function ValidationChecklist({
  issueById,
}: {
  issueById: Map<string, CodeIssue>;
}) {
  return (
    <Surface mode="subtle" className={styles.checklistSurface}>
      <div className={styles.checklistTitle}>Code gate</div>
      <ul className={styles.checklist}>
        {VALIDATOR_RULES.map((rule) => {
          const issue = issueById.get(rule.id);
          const passed = !issue;
          const iconName = passed
            ? 'check'
            : issue.severity === 'error'
              ? 'error'
              : 'warning';
          const iconClass = passed
            ? styles.checkIcon
            : issue.severity === 'error'
              ? `${styles.checkIcon} ${styles.checkIconError}`
              : `${styles.checkIcon} ${styles.checkIconWarn}`;
          return (
            <li key={rule.id} className={styles.checkItem}>
              <span className={iconClass} aria-hidden="true">
                <Icon name={iconName} size="sm" />
              </span>
              <span className={styles.checkBody}>
                <strong className={styles.checkName}>{rule.name}</strong>
                {issue ? (
                  <span className={styles.checkDetails}>
                    {issue.line ? ` (line ${issue.line})` : ''}: {issue.message}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}

function DesignGateChecklist({
  issues,
  archetype,
}: {
  issues: DesignIssue[];
  archetype: string;
}) {
  return (
    <Surface mode="subtle" className={styles.checklistSurface}>
      <div className={styles.checklistTitle}>Design gate · {archetype}</div>
      {issues.length === 0 ? (
        <div className={styles.emptyGate}>No design-gate issues.</div>
      ) : (
        <ul className={styles.checklist}>
          {issues.map((issue) => {
            const iconName = issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'info';
            const iconClass = issue.severity === 'error'
              ? `${styles.checkIcon} ${styles.checkIconError}`
              : issue.severity === 'warning'
                ? `${styles.checkIcon} ${styles.checkIconWarn}`
                : styles.checkIcon;
            return (
              <li key={`${issue.id}-${issue.line ?? 'global'}`} className={styles.checkItem}>
                <span className={iconClass} aria-hidden="true">
                  <Icon name={iconName} size="sm" />
                </span>
                <span className={styles.checkBody}>
                  <strong className={styles.checkName}>{issue.id}</strong>
                  <span className={styles.checkDetails}>
                    {issue.line ? ` (line ${issue.line})` : ''}: {issue.message}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Surface>
  );
}
