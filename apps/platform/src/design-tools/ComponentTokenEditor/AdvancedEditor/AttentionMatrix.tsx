/**
 * AttentionMatrix.tsx
 *
 * Attention-level style & role matrix for the Actions family. Each level
 * (High/Medium/Low → bold/subtle/ghost) picks a STYLE (solid/tonal/outline/
 * quiet) and optionally a ROLE. Ordering is validated so High ≥ Medium ≥ Low
 * in visual weight; illegal style options are disabled inline.
 */

'use client';

import React from 'react';
import {
  ATTENTION_LEVEL_VARIANTS,
  ATTENTION_ROLE_DECISION_IDS,
  ATTENTION_STYLE_DECISION_IDS,
  validateAttentionHierarchy,
  type AttentionLevel,
  type RecipeDecision,
} from '@oneui/shared';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import styles from './AttentionMatrix.module.css';

const LEVELS: AttentionLevel[] = ['high', 'medium', 'low'];
const LEVEL_LABELS: Record<AttentionLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export interface AttentionMatrixProps {
  /** Family decisions keyed by id (style + role decisions must be present). */
  decisionsById: Map<string, RecipeDecision>;
  /** Current family selections (including any legacy emphasisStyle key). */
  selections: Record<string, string>;
  /** Set one decision on the family. */
  onDecision: (decisionId: string, optionValue: string) => void;
}

export function AttentionMatrix({ decisionsById, selections, onDecision }: AttentionMatrixProps) {
  const validation = validateAttentionHierarchy(selections);

  return (
    <div className={styles.matrix} role="group" aria-label="Attention levels">
      <span className={styles.matrixLabel}>Attention levels</span>
      {LEVELS.map((level) => {
        const styleDecision = decisionsById.get(ATTENTION_STYLE_DECISION_IDS[level]);
        const roleDecision = decisionsById.get(ATTENTION_ROLE_DECISION_IDS[level]);
        if (!styleDecision) return null;

        const selectedStyle =
          selections[styleDecision.id] ||
          (level === 'high' ? selections.emphasisStyle : undefined) ||
          styleDecision.defaultOption;
        const selectedRole = roleDecision
          ? selections[roleDecision.id] || roleDecision.defaultOption
          : undefined;

        return (
          <div key={level} className={styles.levelRow}>
            <div className={styles.levelHeader}>
              <span className={styles.levelLabel}>{LEVEL_LABELS[level]}</span>
              <span className={styles.levelVariant}>{ATTENTION_LEVEL_VARIANTS[level]}</span>
            </div>
            <ToggleGroup
              value={[selectedStyle]}
              onValueChange={(values) => {
                const next = Array.isArray(values) ? values[0] : values;
                if (!next) return;
                // Disallow selections that break the High ≥ Medium ≥ Low order.
                const candidate = { ...selections, [styleDecision.id]: next };
                if (validateAttentionHierarchy(candidate).level === 'error') return;
                onDecision(styleDecision.id, next);
              }}
              size="compact"
              fullWidth
              aria-label={styleDecision.label}
            >
              {styleDecision.options.map((option) => {
                const candidate = { ...selections, [styleDecision.id]: option.value };
                const illegal = validateAttentionHierarchy(candidate).level === 'error';
                return (
                  <ToggleGroup.Item
                    key={option.value}
                    value={option.value}
                    aria-label={option.label}
                    disabled={illegal}
                  >
                    {option.label}
                  </ToggleGroup.Item>
                );
              })}
            </ToggleGroup>
            {roleDecision && (
              <Select
                value={selectedRole!}
                onChange={(value) => onDecision(roleDecision.id, value)}
                options={roleDecision.options.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                size="sm"
                aria-label={roleDecision.label}
              />
            )}
          </div>
        );
      })}
      {validation.messages.length > 0 && (
        <div
          className={styles.validation}
          data-level={validation.level}
          role={validation.level === 'error' ? 'alert' : 'status'}
        >
          {validation.messages.join(' ')}
        </div>
      )}
    </div>
  );
}

export default AttentionMatrix;
