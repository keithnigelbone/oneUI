/**
 * ChipPreview.tsx
 *
 * Single-source-of-truth preview component for the Chip.
 * Renders a variant x size grid (showAllVariations) or a single-variant column.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { Chip } from './Chip';
import type { ChipVariant, ChipAttention, ChipSize, ChipAppearance } from './Chip.shared';

/** Attention labels — Figma API terminology */
const ATTENTION_LABELS: Record<ChipVariant, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

/**
 * The token editor keys overrides by the internal visual variant, but Chip's
 * public prop is `attention` — map variant → attention at the render boundary.
 */
const VARIANT_TO_ATTENTION: Record<ChipVariant, ChipAttention> = {
  bold: 'high',
  subtle: 'medium',
  ghost: 'low',
};

/** Chip variants (internal, used to key the preview grid) */
const CHIP_VARIANTS: readonly ChipVariant[] = ['bold', 'subtle', 'ghost'];

/** Chip sizes */
const CHIP_SIZES: readonly { size: ChipSize; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

export interface ChipPreviewProps {
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
  appearance?: ChipAppearance;
  /** Callback when a grid cell is clicked (variant + size selection) */
  onCellSelect?: (variant: string, size: string) => void;
}

export function ChipPreview({
  tokens,
  selectedVariant,
  selectedSize = 'm',
  showAllVariations = false,
  appearance,
  onCellSelect,
  onVariantSelect,
}: ChipPreviewProps) {

  // Show All Variations: display grid of all variant x size combinations
  // Each variant shows both selected and unselected state
  if (showAllVariations) {
    return (
      <div style={tokens} data-draggable="false">
        <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
          <thead>
            <tr>
              <th />
              {CHIP_SIZES.map(({ size, label }) => (
                <th
                  key={size}
                  colSpan={2}
                  style={{
                    fontSize: 'var(--Typography-Size-XS)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
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
            {CHIP_VARIANTS.map((variant) => (
              <tr key={variant}>
                <td
                  style={{
                    fontSize: 'var(--Typography-Size-XS)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
                    color: 'var(--Text-Low)',
                    paddingRight: 'var(--Spacing-4-5)',
                    verticalAlign: 'middle',
                  }}
                >
                  {ATTENTION_LABELS[variant]}
                </td>
                {CHIP_SIZES.map(({ size }) => {
                  const variantMatch = selectedVariant === undefined || selectedVariant === variant;
                  const sizeMatch = selectedSize === undefined || selectedSize === size;
                  const isSelected = variantMatch && sizeMatch;
                  const isExactCell = selectedVariant === variant && selectedSize === size;
                  return (
                    <React.Fragment key={`${variant}-${size}`}>
                      <td
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
                        <Chip
                          attention={VARIANT_TO_ATTENTION[variant]}
                          size={size}
                          appearance={appearance}
                          defaultSelected
                          aria-label="Chip preview selected"
                        >
                          Chip
                        </Chip>
                      </td>
                      <td
                        style={{
                          padding: 'var(--Spacing-3-5)',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                        }}
                      >
                        <Chip
                          attention={VARIANT_TO_ATTENTION[variant]}
                          size={size}
                          appearance={appearance}
                          defaultSelected={false}
                          aria-label="Chip preview unselected"
                        >
                          Chip
                        </Chip>
                      </td>
                    </React.Fragment>
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
  const resolvedSize = (selectedSize || 'm') as ChipSize;

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
      {CHIP_VARIANTS.map((variant) => (
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
            transition: 'all var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
            <Chip
              attention={VARIANT_TO_ATTENTION[variant]}
              size={resolvedSize}
              appearance={appearance}
              defaultSelected
              aria-label="Chip preview selected"
            >
              Chip
            </Chip>
            <Chip
              attention={VARIANT_TO_ATTENTION[variant]}
              size={resolvedSize}
              appearance={appearance}
              defaultSelected={false}
              aria-label="Chip preview unselected"
            >
              Chip
            </Chip>
          </div>
          <span
            style={{
              fontSize: 'var(--Typography-Size-2XS)',
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

export default ChipPreview;
