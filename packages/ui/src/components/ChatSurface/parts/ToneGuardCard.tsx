/**
 * ToneGuardCard.tsx
 *
 * Inline renderer for `data-tone-guard` parts emitted by the Voice
 * server. Shows a live phase transition (`checking` → `corrected`
 * /`passed`) and an expandable accordion listing every tone-guard
 * check (passed + failed).
 *
 * Default-collapsed so the transcript stays calm; the header button
 * toggles expansion. When the guard is still `checking` the accordion
 * trigger is suppressed (no data to show yet).
 */

'use client';

import React, { useState } from 'react';
import styles from './ToneGuardCard.module.css';
import type { ToneGuardPart, ToneGuardPhase } from './parts.shared';

export interface ToneGuardCardProps {
  part: ToneGuardPart;
  /** Override the default (collapsed) initial state. */
  defaultExpanded?: boolean;
}

const PHASE_LABEL: Record<ToneGuardPhase, string> = {
  checking: 'Checking tone…',
  corrected: 'Tone corrected',
  passed: 'Tone passed',
};

const PHASE_DOT_CLASS: Record<ToneGuardPhase, string> = {
  checking: styles.statusDotChecking,
  corrected: styles.statusDotCorrected,
  passed: styles.statusDotPassed,
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={open ? styles.chevronOpen : styles.chevron}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ToneGuardCard({ part, defaultExpanded = false }: ToneGuardCardProps) {
  const { phase, result } = part.data;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const label = PHASE_LABEL[phase];
  const checks = result?.checks ?? [];
  const failingCount = checks.filter((c) => !c.passed).length;
  const canExpand = phase !== 'checking' && checks.length > 0;

  const summary = phase === 'checking'
    ? ''
    : failingCount === 0
      ? 'All checks passed'
      : `${failingCount} of ${checks.length} flagged`;

  return (
    <div className={styles.root} role="status" aria-live="polite">
      <button
        type="button"
        className={styles.header}
        onClick={() => canExpand && setExpanded((v) => !v)}
        disabled={!canExpand}
        aria-expanded={canExpand ? expanded : undefined}
        aria-controls={canExpand ? `tone-guard-checks-${phase}` : undefined}
      >
        <span className={`${styles.statusDot} ${PHASE_DOT_CLASS[phase]}`} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        {summary && <span className={styles.summary}>{summary}</span>}
        {typeof result?.score === 'number' && (
          <span className={styles.score} aria-label={`Score ${result.score}`}>
            {result.score}/100
          </span>
        )}
        {canExpand && <Chevron open={expanded} />}
      </button>
      {canExpand && expanded && (
        <ul
          id={`tone-guard-checks-${phase}`}
          className={styles.checkList}
        >
          {checks.map((c) => (
            <li
              key={c.id}
              className={`${styles.check} ${c.passed ? styles.checkPassed : styles.checkFailed}`}
            >
              <span className={styles.checkName}>{c.name}</span>
              {c.details && <span className={styles.checkDetails}>— {c.details}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
