/**
 * BadgePreview.tsx
 *
 * Single-source-of-truth preview component for the Badge.
 * Renders a variant x size grid (showAllVariations) or a single-variant column.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { Badge } from './Badge';
import type { BadgeVariant, BadgeAttention, BadgeSize, BadgeAppearance } from './Badge.shared';

/** Attention labels — Figma API terminology */
const ATTENTION_LABELS: Record<BadgeVariant, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

/**
 * The token editor keys overrides by the internal visual variant, but Badge's
 * public prop is `attention` — map variant → attention at the render boundary.
 */
const VARIANT_TO_ATTENTION: Record<BadgeVariant, BadgeAttention> = {
  bold: 'high',
  subtle: 'medium',
  ghost: 'low',
};

/** Badge variants */
const BADGE_VARIANTS: readonly BadgeVariant[] = ['bold', 'subtle', 'ghost'];

/** Badge sizes */
const BADGE_SIZES: readonly { size: BadgeSize; label: string }[] = [
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

export interface BadgePreviewProps {
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
  appearance?: BadgeAppearance;
  /** Callback when a grid cell is clicked (variant + size selection) */
  onCellSelect?: (variant: string, size: string) => void;
}

export function BadgePreview({
  tokens,
  selectedVariant,
  selectedSize = 'm',
  showAllVariations = false,
  appearance,
  onCellSelect,
  onVariantSelect,
}: BadgePreviewProps) {

  // Show All Variations: display grid of all variant x size combinations
  if (showAllVariations) {
    return (
      <div style={tokens} data-draggable="false">
        <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
          <thead>
            <tr>
              <th />
              {BADGE_SIZES.map(({ size, label }) => (
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
            {BADGE_VARIANTS.map((variant) => (
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
                {BADGE_SIZES.map(({ size }) => {
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
                      <Badge
                        attention={VARIANT_TO_ATTENTION[variant]}
                        size={size}
                        appearance={appearance}
                        aria-label="Badge preview"
                      >
                        Badge
                      </Badge>
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
  const resolvedSize = (selectedSize || 'm') as BadgeSize;

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
      {BADGE_VARIANTS.map((variant) => (
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
          <Badge
            attention={VARIANT_TO_ATTENTION[variant]}
            size={resolvedSize}
            appearance={appearance}
            aria-label="Badge preview"
          >
            Badge
          </Badge>
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

export default BadgePreview;
