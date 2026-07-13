/**
 * IssuePanel.tsx
 *
 * Renders a flat list of validation issues using the project's existing
 * `.validation*` classes (icon column + name column). Used for both the
 * deterministic `validateSkill` issues and the LLM review issues — review
 * issues are tagged with an "AI ·" prefix so the source is visible without
 * a second visual lane.
 */

'use client';

import type { SkillIssue } from '@oneui/shared/engine';
import styles from '../composition.module.css';

export interface IssuePanelEntry extends Omit<SkillIssue, 'level' | 'code'> {
  level: 'error' | 'warning' | 'info';
  /** Optional — present on validator issues, absent on LLM review issues. */
  code?: SkillIssue['code'];
  source?: 'validator' | 'review';
}

interface IssuePanelProps {
  issues: IssuePanelEntry[];
}

const LEVEL_GLYPH: Record<IssuePanelEntry['level'], string> = {
  error: '✕',
  warning: '!',
  info: 'i',
};

const LEVEL_CLASS: Record<IssuePanelEntry['level'], string> = {
  error: styles.validationFail,
  warning: styles.validationWarn,
  info: styles.validationPass,
};

export function IssuePanel({ issues }: IssuePanelProps) {
  if (issues.length === 0) return null;
  return (
    <div className={styles.validationCard}>
      <div className={styles.validationChecks}>
        {issues.map((issue, idx) => (
          <div key={`${issue.code ?? issue.source ?? 'issue'}-${idx}`} className={styles.validationRow}>
            <span className={LEVEL_CLASS[issue.level]}>{LEVEL_GLYPH[issue.level]}</span>
            <span className={styles.validationName}>
              {issue.source === 'review' && <span style={{ color: 'var(--Text-Low)' }}>AI · </span>}
              {issue.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
