/**
 * ASTPreviewCard.tsx
 *
 * Inline DCA composition card in the chat transcript.
 *
 * Surface hierarchy:
 *   outer card  → Surface "minimal" (light tinted)
 *   header bar  → Surface "subtle" (more prominent)
 *   issues panel → Surface "minimal" (same as outer, nested for explicit context)
 *
 * Issues panel uses CSS grid-template-rows animation — no layout jump when
 * expanding/collapsing.
 */

'use client';

import React, { useState } from 'react';
import { ASTRenderer } from '../../../runtime/ASTRenderer';
import { Surface } from '../../Surface/Surface';
import { Button } from '../../Button/Button';
import { Icon } from '../../../icons/Icon';
import styles from './ASTPreviewCard.module.css';
import type { CompositionASTPart } from './parts.shared';

export interface ASTPreviewCardProps {
  part: CompositionASTPart;
  onOpenInCanvas?: (ast: CompositionASTPart['data']['ast']) => void;
  renderMode?: 'render' | 'preview';
  /**
   * 'full' (default) — renders the inline phone frame + issues panel.
   * 'chip' — compact one-line summary with an "Open in canvas" button.
   *          Used when the canvas is already visible as a dedicated panel
   *          (Playground v2 split layout) so the chat stays lightweight.
   */
  variant?: 'full' | 'chip';
  /** When in chip variant, the version label (e.g. "v2") shown as prefix. */
  versionLabel?: string;
}

function scoreClass(score: number): string {
  if (score >= 80) return styles.scorePillGood;
  if (score >= 50) return styles.scorePillWarn;
  return styles.scorePillBad;
}

function issueIconClass(severity: string): string {
  if (severity === 'error') return styles.issueIconError;
  if (severity === 'warning') return styles.issueIconWarning;
  return styles.issueIconInfo;
}

function issueIconName(severity: string): 'error' | 'warning' | 'info' {
  if (severity === 'error') return 'error';
  if (severity === 'warning') return 'warning';
  return 'info';
}

/**
 * Trim a validation check's `details` string to a single readable line —
 * the raw payload often concatenates every offending path which renders
 * as a wall of text. We keep the first violation as a summary and tag
 * the count of additional ones so users can see the shape without
 * drowning in node paths.
 */
function summarizeCheckDetails(details?: string): string | null {
  if (!details) return null;
  const trimmed = details.trim();
  if (!trimmed) return null;
  // Split on the most common joiners used by the validator.
  const parts = trimmed
    .split(/\s*;\s*|\s+(?:\(\+|\+)(?=\d+\s+more)|\s+—\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return collapsePath(parts[0] ?? trimmed);
  const head = collapsePath(parts[0]);
  const more = parts.length - 1;
  return `${head} (+${more} more)`;
}

/**
 * AST node paths like `root > children[1] > children[3] > props.style.minWidth`
 * are noisy in chat. Collapse the middle of any deep path into an ellipsis so
 * the leaf token (the actual offending field) stays readable.
 */
function collapsePath(line: string): string {
  return line.replace(
    /(root)((?:\s*>\s*[^>]+){4,})(\s*>\s*[^>]+)$/g,
    '$1 > … $3',
  );
}

export function ASTPreviewCard({
  part,
  onOpenInCanvas,
  renderMode = 'render',
  variant = 'full',
  versionLabel,
}: ASTPreviewCardProps) {
  const { ast, validation, context } = part.data;
  const name = ast.name || 'Composition';
  const [issuesOpen, setIssuesOpen] = useState(false);

  // Defensive: validation.checks can be undefined if the executor emitted a
  // malformed validation payload. Coerce to [] to avoid a .filter crash.
  const checks = Array.isArray(validation?.checks) ? validation!.checks : [];
  const failedChecks = checks.filter((c) => !c.passed);
  const hasIssues = failedChecks.length > 0;
  const isMobile = context === 'mobile-app';

  // Chip variant: compact accordion-style row, modeled on ToneGuardCard.
  // Header is a clickable button that expands the inline issues list (when
  // there are any). The canvas action is a quiet secondary button on the
  // right so the row stays calm in the transcript.
  if (variant === 'chip') {
    const status = hasIssues ? 'flagged' : 'passed';
    const summary = validation
      ? hasIssues
        ? `${failedChecks.length} issue${failedChecks.length === 1 ? '' : 's'}`
        : 'All checks passed'
      : '';
    const canExpand = hasIssues;
    return (
      <div className={styles.chipRoot} role="group" aria-label={`Composition: ${name}`}>
        <button
          type="button"
          className={styles.chipHeader}
          onClick={() => canExpand && setIssuesOpen((v) => !v)}
          disabled={!canExpand}
          aria-expanded={canExpand ? issuesOpen : undefined}
          aria-controls={canExpand ? `ast-chip-issues-${versionLabel ?? name}` : undefined}
        >
          <span
            className={`${styles.chipStatusDot} ${
              status === 'passed' ? styles.chipStatusDotPassed : styles.chipStatusDotFlagged
            }`}
            aria-hidden="true"
          />
          {versionLabel && <span className={styles.chipVersion}>{versionLabel}</span>}
          <span className={styles.chipTitle}>{name}</span>
          {summary && <span className={styles.chipSummary}>{summary}</span>}
          {validation && (
            <span
              className={`${styles.chipScore} ${scoreClass(validation.score)}`}
              aria-label={`Validation score ${validation.score} of 100`}
            >
              {validation.score}/100
            </span>
          )}
          {canExpand && (
            <span
              className={`${styles.chipChevron} ${issuesOpen ? styles.chipChevronOpen : ''}`}
              aria-hidden="true"
            >
              <Icon name="chevronRight" size="sm" />
            </span>
          )}
        </button>
        {canExpand && issuesOpen && (
          <ul
            id={`ast-chip-issues-${versionLabel ?? name}`}
            className={styles.chipCheckList}
          >
            {failedChecks.map((check) => {
              const summary = summarizeCheckDetails(check.details);
              return (
                <li
                  key={check.id}
                  className={`${styles.chipCheck} ${
                    check.severity === 'error'
                      ? styles.chipCheckError
                      : styles.chipCheckWarn
                  }`}
                >
                  <span
                    className={`${styles.chipCheckSeverity} ${
                      check.severity === 'error'
                        ? styles.chipCheckSeverityError
                        : styles.chipCheckSeverityWarn
                    }`}
                    aria-hidden="true"
                  >
                    !
                  </span>
                  <div className={styles.chipCheckBody}>
                    <span className={styles.chipCheckName}>{check.name}</span>
                    {summary && (
                      <span className={styles.chipCheckDetails}>{summary}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {onOpenInCanvas && (
          <div className={styles.chipFooter}>
            <Button
              appearance="primary"
              attention="low"
              size="s"
              onPress={() => onOpenInCanvas(ast)}
            >
              Open in canvas
            </Button>
          </div>
        )}
      </div>
    );
  }

  const renderedContent = <ASTRenderer tree={ast} mode={renderMode} />;

  return (
    <Surface mode="minimal" className={styles.root} role="group" aria-label={`Composition: ${name}`}>

      {/* Header — subtle surface for visual separation */}
      <Surface mode="subtle" as="div" className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        {validation && (
          <span
            className={`${styles.scorePill} ${scoreClass(validation.score)}`}
            aria-label={`Validation score ${validation.score} of 100`}
          >
            {validation.score}/100
          </span>
        )}
      </Surface>

      {/* Preview — phone frame or generic container */}
      {isMobile ? (
        <div className={styles.previewMobile}>
          <div className={styles.phoneScaleWrapper}>
            <div className={styles.phoneFrame}>
              {renderedContent}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.preview}>
          {renderedContent}
        </div>
      )}

      {/* Footer — toggle + optional canvas action */}
      <div className={styles.footer}>
        {hasIssues ? (
          <button
            type="button"
            className={styles.issuesToggle}
            onClick={() => setIssuesOpen((v) => !v)}
            aria-expanded={issuesOpen}
            aria-controls="ast-issues-panel"
          >
            <span className={`${styles.issuesCaret} ${issuesOpen ? styles.issuesCaretOpen : ''}`}>
              <Icon name="chevronRight" size="sm" />
            </span>
            {(validation?.errorCount ?? 0) > 0 && (
              <span className={styles.issuesCountError}>
                {validation!.errorCount} error{validation!.errorCount === 1 ? '' : 's'}
              </span>
            )}
            {(validation?.warningCount ?? 0) > 0 && (
              <span className={styles.issuesCountWarning}>
                {validation!.warningCount} warning{validation!.warningCount === 1 ? '' : 's'}
              </span>
            )}
          </button>
        ) : validation ? (
          <span className={styles.allPassed}>All checks passed</span>
        ) : (
          <span />
        )}

        {onOpenInCanvas && (
          <div className={styles.actions}>
            <Button
              appearance="primary"
              attention="low"
              size="s"
              onPress={() => onOpenInCanvas(ast)}
            >
              Open in canvas
            </Button>
          </div>
        )}
      </div>

      {/* Issues panel — CSS grid animation, no layout jump */}
      <div
        id="ast-issues-panel"
        className={`${styles.issuesContainer} ${issuesOpen ? styles.issuesContainerOpen : ''}`}
        aria-hidden={!issuesOpen}
      >
        <div className={styles.issuesInner}>
          <Surface mode="minimal" as="ul" className={styles.issuesList} aria-label="Validation issues">
            {failedChecks.map((check) => (
              <li key={check.id} className={styles.issueRow}>
                <span className={`${styles.issueIcon} ${issueIconClass(check.severity)}`}>
                  <Icon name={issueIconName(check.severity)} size="sm" />
                </span>
                <span>
                  <span className={styles.issueName}>{check.name}</span>
                  {check.details && (
                    <> — <span className={styles.issueDetail}>{check.details}</span></>
                  )}
                  {check.nodePath && (
                    <> <span className={styles.issueDetail}>({check.nodePath})</span></>
                  )}
                </span>
              </li>
            ))}
          </Surface>
        </div>
      </div>

    </Surface>
  );
}
