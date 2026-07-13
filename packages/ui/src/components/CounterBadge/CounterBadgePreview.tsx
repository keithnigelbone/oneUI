/**
 * CounterBadgePreview.tsx
 *
 * Single-source-of-truth preview component for the CounterBadge.
 * Renders a variant x size grid (showAllVariations) or a single-variant column.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { CounterBadge } from './CounterBadge';
import type { CounterBadgeVariant, CounterBadgeAttention, CounterBadgeSize, CounterBadgeAppearance } from './CounterBadge.shared';

/** Attention labels — Figma API terminology */
const ATTENTION_LABELS: Record<CounterBadgeVariant, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

/**
 * The token editor keys overrides by the internal visual variant, but CounterBadge's
 * public prop is `attention` — map variant → attention at the render boundary.
 */
const VARIANT_TO_ATTENTION: Record<CounterBadgeVariant, CounterBadgeAttention> = {
  bold: 'high',
  subtle: 'medium',
  ghost: 'low',
};

/** CounterBadge variants */
const COUNTER_BADGE_VARIANTS: readonly CounterBadgeVariant[] = ['bold', 'subtle', 'ghost'];

/** CounterBadge sizes */
const COUNTER_BADGE_SIZES: readonly { size: CounterBadgeSize; label: string }[] = [
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

export interface CounterBadgePreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Currently selected variant (used for highlight in single mode) */
  selectedVariant?: string;
  /** Callback when a variant is clicked (single mode) */
  onVariantSelect?: (variant: string) => void;
  /** Currently selected size (used in single mode) */
  selectedSize?: string;
  /** Callback when a size is clicked */
  onSizeSelect?: (size: string) => void;
  /** When true, shows the full variant x size grid */
  showAllVariations?: boolean;
  /** Appearance role to preview */
  appearance?: CounterBadgeAppearance;
  /** Callback when a grid cell is clicked (variant + size selection) */
  onCellSelect?: (variant: string, size: string) => void;
}

export function CounterBadgePreview({
  tokens,
  selectedVariant,
  onVariantSelect,
  selectedSize = 'm',
  showAllVariations = false,
  appearance,
  onCellSelect,
}: CounterBadgePreviewProps) {

  // Show All Variations: display grid of all variant x size combinations
  if (showAllVariations) {
    return (
      <div style={tokens} data-draggable="false">
        <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
          <thead>
            <tr>
              <th />
              {COUNTER_BADGE_SIZES.map(({ size, label }) => (
                <th
                  key={size}
                  style={{
                    fontSize: 'var(--Label-XS-FontSize)',
                    fontWeight: 'var(--Label-FontWeight-Medium)',
                    color: 'var(--Text-Low)',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    padding: 'var(--Spacing-3-5)',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COUNTER_BADGE_VARIANTS.map((variant) => (
              <tr key={variant}>
                <td
                  style={{
                    fontSize: 'var(--Label-XS-FontSize)',
                    fontWeight: 'var(--Label-FontWeight-Medium)',
                    color: 'var(--Text-Low)',
                    paddingRight: 'var(--Spacing-4-5)',
                    verticalAlign: 'middle',
                  }}
                >
                  {ATTENTION_LABELS[variant]}
                </td>
                {COUNTER_BADGE_SIZES.map(({ size }) => {
                  const variantMatch = selectedVariant === undefined || selectedVariant === variant;
                  const sizeMatch = selectedSize === undefined || selectedSize === size;
                  const isSelected = variantMatch && sizeMatch;
                  const isExactCell = selectedVariant === variant && selectedSize === size;
                  return (
                    <td
                      key={`${variant}-${size}`}
                      data-selected={isSelected || undefined}
                      onClick={onCellSelect ? () => onCellSelect(variant, size) : undefined}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        cursor: onCellSelect ? 'pointer' : undefined,
                        outline: isSelected
                          ? `${isExactCell ? '2px' : '1px'} solid var(--Primary-Tinted, var(--Surface-Bold))`
                          : undefined,
                        outlineOffset: isSelected ? '2px' : undefined,
                        borderRadius: isSelected ? 'var(--Shape-3-5)' : undefined,
                      }}
                    >
                      <CounterBadge
                        value={5}
                        attention={VARIANT_TO_ATTENTION[variant]}
                        size={size}
                        appearance={appearance}
                        aria-label="5 notifications"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Single mode: show all variants at selected size
  const resolvedSize = (selectedSize || 'm') as CounterBadgeSize;

  return (
    <div
      style={{
        ...tokens,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        alignItems: 'center',
      }}
    >
      {COUNTER_BADGE_VARIANTS.map((variant) => (
        <div
          key={variant}
          onClick={onVariantSelect ? () => onVariantSelect(variant) : undefined}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--Spacing-3)',
            padding: 'var(--Spacing-3-5)',
            borderRadius: 'var(--Shape-4)',
            cursor: onVariantSelect ? 'pointer' : 'default',
            border:
              selectedVariant === variant
                ? 'var(--Stroke-M) solid var(--Border-Subtle)'
                : 'var(--Stroke-M) solid transparent',
            transition: 'all var(--Motion-Duration-Discreet-Medium) var(--Motion-Easing-Standard)',
          }}
        >
          <CounterBadge
            value={5}
            attention={VARIANT_TO_ATTENTION[variant]}
            size={resolvedSize}
            appearance={appearance}
            aria-label="5 notifications"
          />
          <span
            style={{
              fontSize: 'var(--Label-2XS-FontSize)',
              color: selectedVariant === variant ? 'var(--Text-High)' : 'var(--Text-Low)',
            }}
          >
            {ATTENTION_LABELS[variant]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default CounterBadgePreview;
