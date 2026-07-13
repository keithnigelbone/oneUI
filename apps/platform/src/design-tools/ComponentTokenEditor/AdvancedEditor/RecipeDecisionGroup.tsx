/**
 * RecipeDecisionGroup.tsx
 *
 * Visual recipe decision control. Renders specialized UI per decision type:
 * - ghostBorder: ToggleGroup toggle buttons
 * - cornerRadius: Select dropdown
 * - textTransform: ToggleGroup with text case preview
 * Falls back to ToggleGroup for unknown decisions.
 * Uses ToggleGroup for consistency with foundation pages.
 */

'use client';

import React from 'react';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import type { RecipeDecision } from '@oneui/shared';
import styles from './RecipePanel.module.css';

export interface RecipeDecisionGroupProps {
  /** The decision definition */
  decision: RecipeDecision;
  /** Currently selected option value */
  selectedValue: string;
  /** Whether this local decision is overriding the family/default behaviour */
  isOverridden?: boolean;
  /** Callback when an option is selected */
  onChange: (optionValue: string) => void;
}

export function RecipeDecisionGroup({
  decision,
  selectedValue,
  isOverridden = false,
  onChange,
}: RecipeDecisionGroupProps) {
  const useSelect = decision.options.length > 5;

  return (
    <div className={styles.decisionGroup} role="radiogroup" aria-label={decision.label}>
      <span className={styles.decisionLabelRow}>
        <span className={styles.decisionLabel}>{decision.label}</span>
        {isOverridden && (
          <span className={styles.overrideMarker} aria-label="Local override active" />
        )}
      </span>
      {useSelect ? (
        <Select
          value={selectedValue}
          onChange={onChange}
          options={decision.options.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          size="sm"
          aria-label={decision.label}
        />
      ) : (
      <ToggleGroup
        value={[selectedValue]}
        onValueChange={(values) => {
          const val = Array.isArray(values) ? values[0] : values;
          if (val) onChange(val);
        }}
        size="compact"
        fullWidth
      >
        {decision.options.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            aria-label={option.label}
          >
            {decision.id === 'textTransform' ? (
              <span className={styles.caseLabel}>{option.label}</span>
            ) : (
              <span>{option.label}</span>
            )}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
      )}
    </div>
  );
}

export default RecipeDecisionGroup;
