/**
 * VariationsPreview.tsx
 *
 * Shows all button layout variations (normal, condensed, full-width) in a grid.
 * Also supports a multi-size matrix mode: all variant × size combinations in a grid.
 */

'use client';

import React, { useMemo } from 'react';
import { Button } from '@oneui/ui-internal/components/Button';
import { BUTTON_TOKEN_MANIFEST } from '@oneui/ui-internal/components/Button/Button.tokens';
import type { ButtonSize } from '@oneui/ui-internal/components/Button/Button.shared';
import { deriveSizeLabels, ATTENTION_LABELS } from './constants';
import styles from './VariationsPreview.module.css';

export interface OverrideIndicator {
  /** Variant that has an override (e.g. 'bold') */
  variant?: string;
  /** Size that has an override (e.g. 'medium') */
  size?: string;
}

export interface VariationsPreviewProps {
  /** @deprecated Component token overrides now come from .editor-preview-scope CSS */
  tokens?: Record<string, string>;
  /** Selected variant (bold/subtle/ghost) */
  selectedVariant: string;
  /** Selected size (f-step value as string, e.g. '10') */
  selectedSize: string;
  /** Selected accent role (appearance) */
  selectedAccentRole?: string;
  /** Whether to show left icon */
  showLeftIcon: boolean;
  /** Whether to show right icon */
  showRightIcon: boolean;
  /** When true, render all variant×size combinations as a matrix */
  showMatrix?: boolean;
  /** Which variant/size combos have token overrides (shown with a highlight) */
  overrideIndicators?: OverrideIndicator[];
  /** Callback when a matrix cell is clicked to select variant+size */
  onCellSelect?: (variant: string, size: string) => void;
}

const LAYOUT_LABELS = {
  normal: 'Normal',
  condensed: 'Condensed',
  fullWidth: 'Full Width',
};

const MATRIX_VARIANTS = ['bold', 'subtle', 'ghost'] as const;

/** Map legacy Button variant values to the current `attention` prop. */
const VARIANT_TO_ATTENTION = { bold: 'high', subtle: 'medium', ghost: 'low' } as const;

/** Size labels derived from the Button token manifest (single source of truth) */
const MANIFEST_SIZE_LABELS = deriveSizeLabels(BUTTON_TOKEN_MANIFEST.tokens);
const MATRIX_SIZES = Object.keys(MANIFEST_SIZE_LABELS);

function hasOverride(
  indicators: OverrideIndicator[],
  variant: string,
  size: string
): boolean {
  return indicators.some(
    (ind) =>
      (ind.variant === undefined || ind.variant === variant) &&
      (ind.size === undefined || ind.size === size)
  );
}

export function VariationsPreview({
  selectedVariant,
  selectedSize,
  selectedAccentRole,
  showLeftIcon,
  showRightIcon,
  showMatrix = false,
  overrideIndicators = [],
  onCellSelect,
}: VariationsPreviewProps) {
  if (showMatrix) {
    return (
      <div className={styles.container}>
        <div className={styles.matrixGrid} style={{ '--matrix-size-count': MATRIX_SIZES.length } as React.CSSProperties}>
          {/* Header row: size labels */}
          <div className={styles.matrixHeaderEmpty} />
          {MATRIX_SIZES.map((size) => (
            <div key={size} className={styles.matrixSizeHeader}>
              {MANIFEST_SIZE_LABELS[size] || size}
            </div>
          ))}

          {/* Data rows: one per variant */}
          {MATRIX_VARIANTS.map((variant) => (
            <React.Fragment key={variant}>
              <div
                className={styles.matrixVariantLabel}
                data-clickable={onCellSelect ? '' : undefined}
                onClick={onCellSelect ? () => onCellSelect(variant, selectedSize) : undefined}
                role={onCellSelect ? 'button' : undefined}
                tabIndex={onCellSelect ? 0 : undefined}
                aria-label={onCellSelect ? `Select ${ATTENTION_LABELS[variant] || variant} row` : undefined}
              >
                {ATTENTION_LABELS[variant] || variant}
              </div>
              {MATRIX_SIZES.map((size) => {
                const overridden = hasOverride(overrideIndicators, variant, size);
                const isSelected = variant === selectedVariant && size === selectedSize;
                return (
                  <div
                    key={size}
                    className={`${styles.matrixCell} ${overridden ? styles.matrixCellOverridden : ''}`}
                    data-selected={isSelected || undefined}
                    data-clickable={onCellSelect ? '' : undefined}
                    onClick={onCellSelect ? () => onCellSelect(variant, size) : undefined}
                    role={onCellSelect ? 'button' : undefined}
                    tabIndex={onCellSelect ? 0 : undefined}
                    aria-label={onCellSelect ? `Select ${ATTENTION_LABELS[variant] || variant} ${size}` : undefined}
                  >
                    {overridden && <span className={styles.overrideDot} aria-hidden="true" />}
                    <Button
                      attention={VARIANT_TO_ATTENTION[variant]}
                      size={(Number(size) || 10) as ButtonSize}
                      appearance={selectedAccentRole as any}
                      leftIcon={showLeftIcon ? 'star' : undefined}
                      rightIcon={showRightIcon ? 'chevronRight' : undefined}
                    >
                      Button
                    </Button>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Normal */}
        <div className={styles.variationCell}>
          <div className={styles.label}>{LAYOUT_LABELS.normal}</div>
          <div className={styles.preview}>
            <Button
              attention={VARIANT_TO_ATTENTION[selectedVariant as 'bold' | 'subtle' | 'ghost']}
              size={(Number(selectedSize) || 10) as ButtonSize}
              appearance={selectedAccentRole as any}
              leftIcon={showLeftIcon ? 'star' : undefined}
              rightIcon={showRightIcon ? 'chevronRight' : undefined}
            >
              Button
            </Button>
          </div>
        </div>

        {/* Condensed */}
        <div className={styles.variationCell}>
          <div className={styles.label}>{LAYOUT_LABELS.condensed}</div>
          <div className={styles.preview}>
            <Button
              attention={VARIANT_TO_ATTENTION[selectedVariant as 'bold' | 'subtle' | 'ghost']}
              size={(Number(selectedSize) || 10) as ButtonSize}
              appearance={selectedAccentRole as any}
              condensed
              leftIcon={showLeftIcon ? 'star' : undefined}
              rightIcon={showRightIcon ? 'chevronRight' : undefined}
            >
              Button
            </Button>
          </div>
        </div>

        {/* Full Width */}
        <div className={styles.variationCell}>
          <div className={styles.label}>{LAYOUT_LABELS.fullWidth}</div>
          <div className={styles.fullWidthPreview}>
            <Button
              attention={VARIANT_TO_ATTENTION[selectedVariant as 'bold' | 'subtle' | 'ghost']}
              size={(Number(selectedSize) || 10) as ButtonSize}
              appearance={selectedAccentRole as any}
              fullWidth
              leftIcon={showLeftIcon ? 'star' : undefined}
              rightIcon={showRightIcon ? 'chevronRight' : undefined}
            >
              Button
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VariationsPreview;
