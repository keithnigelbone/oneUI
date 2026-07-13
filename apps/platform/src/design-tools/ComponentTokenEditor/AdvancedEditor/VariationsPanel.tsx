/**
 * VariationsPanel.tsx
 *
 * Controls panel for the Variations tab mode.
 * Provides variant/size filters and layout toggle
 * for the variation comparison canvas view.
 * Uses ToggleGroup for all segmented selectors (consistent with foundation pages).
 */

'use client';

import React from 'react';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import { ATTENTION_LABELS, SIZE_LABELS } from './constants';
import styles from './VariationsPanel.module.css';

export interface VariationsPanelProps {
  /** Selected variants to show in comparison */
  selectedVariants: string[];
  /** Callback when variant filter changes */
  onVariantsChange: (variants: string[]) => void;
  /** Selected sizes to show in comparison */
  selectedSizes: string[];
  /** Callback when size filter changes */
  onSizesChange: (sizes: string[]) => void;
  /** Layout mode for comparison view */
  comparisonLayout: 'grid' | 'side-by-side';
  /** Callback when layout changes */
  onLayoutChange: (layout: 'grid' | 'side-by-side') => void;
  /** Whether to show the matrix view */
  showMatrix?: boolean;
  /** Callback when matrix toggle changes */
  onShowMatrixChange?: (show: boolean) => void;
}

const ALL_VARIANTS = Object.keys(ATTENTION_LABELS);
const ALL_SIZES = Object.keys(SIZE_LABELS);

export function VariationsPanel({
  selectedVariants,
  onVariantsChange,
  selectedSizes,
  onSizesChange,
  comparisonLayout,
  onLayoutChange,
  showMatrix,
  onShowMatrixChange,
}: VariationsPanelProps) {
  return (
    <div className={styles.panel}>
      {/* Attention Filters */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Attention</div>
        <ToggleGroup
          value={selectedVariants}
          onValueChange={(values) => {
            const arr = Array.isArray(values) ? values : [values];
            if (arr.length > 0) onVariantsChange(arr);
          }}
          toggleMultiple
          size="compact"
          fullWidth
        >
          {ALL_VARIANTS.map((variant) => (
            <ToggleGroup.Item key={variant} value={variant} aria-label={ATTENTION_LABELS[variant]}>
              {ATTENTION_LABELS[variant]}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      {/* Size Filters */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Sizes</div>
        <ToggleGroup
          value={selectedSizes}
          onValueChange={(values) => {
            const arr = Array.isArray(values) ? values : [values];
            if (arr.length > 0) onSizesChange(arr);
          }}
          toggleMultiple
          size="compact"
          fullWidth
        >
          {ALL_SIZES.map((size) => (
            <ToggleGroup.Item key={size} value={size} aria-label={SIZE_LABELS[size]}>
              {SIZE_LABELS[size]}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      {/* Layout Toggle */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Layout</div>
        <ToggleGroup
          value={[comparisonLayout]}
          onValueChange={(values) => {
            const val = Array.isArray(values) ? values[0] : values;
            if (val === 'grid' || val === 'side-by-side') onLayoutChange(val);
          }}
          size="compact"
          fullWidth
        >
          <ToggleGroup.Item value="grid">
            Grid
          </ToggleGroup.Item>
          <ToggleGroup.Item value="side-by-side">
            Side by Side
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>

      {/* Matrix View Toggle */}
      {onShowMatrixChange && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>View</div>
          <ToggleGroup
            value={[showMatrix ? 'matrix' : 'layouts']}
            onValueChange={(values) => {
              const val = Array.isArray(values) ? values[0] : values;
              onShowMatrixChange(val === 'matrix');
            }}
            size="compact"
            fullWidth
          >
            <ToggleGroup.Item value="layouts">
              Layouts
            </ToggleGroup.Item>
            <ToggleGroup.Item value="matrix">
              Matrix
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>
      )}
    </div>
  );
}

export default VariationsPanel;
