/**
 * SpacingVisualizer.tsx
 *
 * Figma-like visual spacing control showing padding values
 * with a visual representation of where they apply.
 */

'use client';

import React from 'react';
import { ArrowLeftRight, ArrowUpDown, Space, RulerIcon } from 'lucide-react';
import { SPACING_TOKENS } from '@oneui/shared';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import styles from './SpacingVisualizer.module.css';

const SPACING_OPTIONS = SPACING_TOKENS.map((token) => ({
  value: `Spacing-${token}`,
  label: token.replace('-', '.'),
}));

export interface SpacingVisualizerProps {
  /** Horizontal padding token value */
  horizontalValue: string;
  /** Vertical padding token value */
  verticalValue: string;
  /** Icon gap token value */
  iconGapValue?: string;
  /** Min height token value */
  minHeightValue?: string;
  /** Callback when horizontal padding changes */
  onHorizontalChange: (value: string) => void;
  /** Callback when vertical padding changes */
  onVerticalChange: (value: string) => void;
  /** Callback when icon gap changes */
  onIconGapChange?: (value: string) => void;
  /** Callback when min height changes */
  onMinHeightChange?: (value: string) => void;
  /** Whether fields are disabled */
  disabled?: boolean;
}

export function SpacingVisualizer({
  horizontalValue,
  verticalValue,
  iconGapValue,
  minHeightValue,
  onHorizontalChange,
  onVerticalChange,
  onIconGapChange,
  onMinHeightChange,
  disabled = false,
}: SpacingVisualizerProps) {
  return (
    <div className={styles.container}>
      {/* Visual Representation - Figma style */}
      <div className={styles.visualizer}>
        {/* 3x3 Dot grid */}
        <div className={styles.dotGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className={styles.dot} />
          ))}
        </div>
        {/* Center element */}
        <div className={styles.centerElement}>
          <div className={styles.contentBars}>
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} data-short />
          </div>
        </div>
        {/* Padding indicators */}
        <div className={styles.paddingIndicatorLeft} />
        <div className={styles.paddingIndicatorRight} />
      </div>

      {/* Spacing Controls - compact grid */}
      <div className={styles.controls}>
        {/* Row 1: Horizontal and Vertical */}
        <div className={styles.controlRow}>
          <div className={styles.controlField}>
            <ArrowLeftRight size={12} className={styles.controlIcon} />
            <Select
              value={horizontalValue}
              onChange={onHorizontalChange}
              options={SPACING_OPTIONS}
              disabled={disabled}
              size="sm"
              className={styles.controlSelect}
              aria-label="Horizontal padding"
            />
          </div>
          <div className={styles.controlField}>
            <ArrowUpDown size={12} className={styles.controlIcon} />
            <Select
              value={verticalValue}
              onChange={onVerticalChange}
              options={SPACING_OPTIONS}
              disabled={disabled}
              size="sm"
              className={styles.controlSelect}
              aria-label="Vertical padding"
            />
          </div>
        </div>

        {/* Row 2: Icon Gap and Min Height */}
        {(onIconGapChange || onMinHeightChange) && (
          <div className={styles.controlRow}>
            {onIconGapChange && (
              <div className={styles.controlField}>
                <Space size={12} className={styles.controlIcon} />
                <Select
                  value={iconGapValue || ''}
                  onChange={onIconGapChange}
                  options={SPACING_OPTIONS}
                  disabled={disabled}
                  size="sm"
                  className={styles.controlSelect}
                  aria-label="Icon gap"
                />
              </div>
            )}
            {onMinHeightChange && (
              <div className={styles.controlField}>
                <RulerIcon size={12} className={styles.controlIcon} />
                <Select
                  value={minHeightValue || ''}
                  onChange={onMinHeightChange}
                  options={SPACING_OPTIONS}
                  disabled={disabled}
                  size="sm"
                  className={styles.controlSelect}
                  aria-label="Min height"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpacingVisualizer;
