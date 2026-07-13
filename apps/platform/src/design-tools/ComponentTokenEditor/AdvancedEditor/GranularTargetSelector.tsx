/**
 * GranularTargetSelector.tsx
 *
 * Lets the user select a specific variant + size combo for granular editing.
 * Shows override indicator dots for combos that have overrides.
 */

'use client';

import React from 'react';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { ATTENTION_LABELS, SIZE_LABELS } from './constants';
import styles from './EditorPanel.module.css';

export interface GranularTargetSelectorProps {
  /** Optional className override */
  className?: string;
}

export function GranularTargetSelector({ className }: GranularTargetSelectorProps) {
  const { granularTarget, setGranularTarget, getOverrideIndicators } = useComponentTokenEditor();

  // Collect which variants and sizes have any overrides
  const variantsWithOverrides = new Set<string>();
  const sizesWithOverrides = new Set<string>();

  // Check a representative set of common token names for indicators
  const indicatorTokens = [
    'backgroundColor',
    'textColor',
    'borderRadius',
    'paddingHorizontal',
    'paddingVertical',
    'fontSize',
  ];
  for (const tokenName of indicatorTokens) {
    const indicators = getOverrideIndicators(tokenName);
    for (const ind of indicators) {
      if (ind.variant) variantsWithOverrides.add(ind.variant);
      if (ind.size) sizesWithOverrides.add(ind.size);
    }
  }

  return (
    <div className={[styles.granularSelector, className].filter(Boolean).join(' ')}>
      {/* Attention row (maps to internal variant) */}
      <div className={styles.granularGroup}>
        <span className={styles.granularLabel}>Attention</span>
        <ToggleGroup
          value={granularTarget.variant ? [granularTarget.variant] : []}
          onValueChange={(values) => {
            const value = Array.isArray(values) ? values[0] : values;
            setGranularTarget({
              ...granularTarget,
              variant: value || undefined,
            });
          }}
          size="compact"
          variant="subtool"
          className={styles.granularButtonRow}
        >
          {Object.entries(ATTENTION_LABELS).map(([value, label]) => (
            <ToggleGroup.Item key={value} value={value} className={styles.granularButton}>
              {label}
              {variantsWithOverrides.has(value) && (
                <span className={styles.overrideIndicatorDot} aria-label="Has overrides" />
              )}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      {/* Size row */}
      <div className={styles.granularGroup}>
        <span className={styles.granularLabel}>Size</span>
        <ToggleGroup
          value={granularTarget.size ? [granularTarget.size] : []}
          onValueChange={(values) => {
            const value = Array.isArray(values) ? values[0] : values;
            setGranularTarget({
              ...granularTarget,
              size: value || undefined,
            });
          }}
          size="compact"
          variant="subtool"
          className={styles.granularButtonRow}
        >
          {Object.entries(SIZE_LABELS).map(([value, label]) => (
            <ToggleGroup.Item key={value} value={value} className={styles.granularButton}>
              {label}
              {sizesWithOverrides.has(value) && (
                <span className={styles.overrideIndicatorDot} aria-label="Has overrides" />
              )}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

export default GranularTargetSelector;
