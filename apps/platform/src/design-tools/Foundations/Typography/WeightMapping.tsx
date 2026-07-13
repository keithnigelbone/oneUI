/**
 * WeightMapping.tsx
 * Semantic to numeric weight mapping editor
 */

'use client';

import { useCallback, useMemo } from 'react';
import { Select, type SelectOption } from '@oneui/ui-internal/components/Select';
import styles from './Typography.module.css';
import type { WeightMappingProps } from './Typography.shared';

// Weight descriptions
const WEIGHT_DESCRIPTIONS: Record<string, string> = {
  low: 'Body text, descriptions',
  medium: 'Labels, interactive elements',
  high: 'Emphasis, titles',
  black: 'Display, headlines',
};

// Available weight values as SelectOptions
const WEIGHT_OPTIONS: SelectOption<number>[] = [
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 300, label: '300' },
  { value: 400, label: '400' },
  { value: 500, label: '500' },
  { value: 600, label: '600' },
  { value: 700, label: '700' },
  { value: 800, label: '800' },
  { value: 900, label: '900' },
];

export const WeightMapping: React.FC<WeightMappingProps> = ({
  mapping,
  onChange,
  disabled = false,
}) => {
  // Handle weight change
  const handleWeightChange = useCallback(
    (semantic: string, value: number) => {
      onChange({ ...mapping, [semantic]: value });
    },
    [mapping, onChange]
  );

  return (
    <div className={styles.weightMappingContainer}>
      <div className={styles.weightMappingGrid}>
        {Object.entries(mapping).map(([semantic, value]) => (
          <div key={semantic} className={styles.weightCard}>
            <span className={styles.weightLabel}>{semantic}</span>
            <span className={styles.weightDescription}>
              {WEIGHT_DESCRIPTIONS[semantic] || 'Custom weight'}
            </span>
            <Select
              value={value}
              onChange={(newValue) => handleWeightChange(semantic, newValue)}
              options={WEIGHT_OPTIONS}
              disabled={disabled}
              size="sm"
              aria-label={`${semantic} weight`}
            />
            <div
              className={styles.weightPreview}
              style={{ fontWeight: value }}
            >
              The quick brown fox
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
