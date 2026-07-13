/**
 * ButtonPreview.tsx
 *
 * Single-source-of-truth preview component for the Button.
 * Renders a variant x size grid (showAllVariations) or a single-variant column.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { Button } from './Button';
import { BUTTON_TOKEN_MANIFEST } from './Button.tokens';
import type { ButtonVariant, ButtonAttention, ButtonSize, ButtonAppearance } from './Button.shared';
import { deriveSizeLabels } from '@oneui/shared/meta';

/** Attention labels — Figma API terminology */
const ATTENTION_LABELS: Record<ButtonVariant, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

/**
 * The token editor keys overrides by the internal visual variant, but Button's
 * public prop is `attention` — map variant → attention at the render boundary.
 */
const VARIANT_TO_ATTENTION: Record<ButtonVariant, ButtonAttention> = {
  bold: 'high',
  subtle: 'medium',
  ghost: 'low',
};

/** Button variants */
const BUTTON_VARIANTS: readonly ButtonVariant[] = ['bold', 'subtle', 'ghost'];

/**
 * Button sizes — derived from the token manifest (single source of truth).
 * When sizes change in Button.tokens.ts, this list updates automatically.
 */
const MANIFEST_SIZE_LABELS = deriveSizeLabels(BUTTON_TOKEN_MANIFEST.tokens);
const BUTTON_SIZES: readonly { size: ButtonSize; label: string }[] = Object.entries(
  MANIFEST_SIZE_LABELS
).map(([key, label]) => ({ size: Number(key) as ButtonSize, label }));

export interface ButtonPreviewProps {
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
  /** Whether to show start slot content */
  showLeftIcon?: boolean;
  /** Whether to show end slot content */
  showRightIcon?: boolean;
  /** When true, shows the full variant x size grid */
  showAllVariations?: boolean;
  /** Appearance role to preview */
  appearance?: ButtonAppearance;
  /** Whether to show buttons in condensed mode */
  showCondensed?: boolean;
  /** Whether to show a fullWidth button row in the grid */
  showFullWidth?: boolean;
  /** Whether to show buttons in disabled state */
  disabled?: boolean;
  /** Callback when a grid cell is clicked (variant + size selection) */
  onCellSelect?: (variant: string, size: string) => void;
}

export function ButtonPreview({
  tokens,
  selectedVariant,
  onVariantSelect,
  selectedSize = '10',
  showLeftIcon = false,
  showRightIcon = false,
  showAllVariations = false,
  appearance,
  showCondensed = false,
  showFullWidth = false,
  disabled = false,
  onCellSelect,
}: ButtonPreviewProps) {
  const startIcon = showLeftIcon ? 'star' : undefined;
  const endIcon = showRightIcon ? 'chevronRight' : undefined;

  // Show All Variations: display grid of all variant x size combinations
  if (showAllVariations) {
    return (
      <div style={tokens} data-draggable="false">
        <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
          <thead>
            <tr>
              <th />
              {BUTTON_SIZES.map(({ size, label }) => (
                <th
                  key={String(size)}
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
            {BUTTON_VARIANTS.map((variant) => (
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
                {BUTTON_SIZES.map(({ size, label }) => {
                  const sizeStr = String(size);
                  // Highlight logic: exact cell, entire row (All sizes), entire column (All variants), or all
                  const variantMatch = selectedVariant === undefined || selectedVariant === variant;
                  const sizeMatch = selectedSize === undefined || selectedSize === sizeStr;
                  const isSelected = variantMatch && sizeMatch;
                  const isExactCell = selectedVariant === variant && selectedSize === sizeStr;
                  return (
                    <td
                      key={`${variant}-${sizeStr}`}
                      data-selected={isSelected || undefined}
                      onClick={onCellSelect ? () => onCellSelect(variant, sizeStr) : undefined}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        cursor: onCellSelect ? 'pointer' : undefined,
                        outline: isSelected
                          ? `${isExactCell ? '2px' : '1px'} solid var(--Primary-Tinted, var(--Surface-Bold))`
                          : undefined,
                        outlineOffset: isSelected ? '2px' : undefined,
                        borderRadius: isSelected ? 'var(--Shape-3-5)' : undefined,
                      }}
                    >
                      <Button
                        attention={VARIANT_TO_ATTENTION[variant]}
                        size={size}
                        appearance={appearance}
                        condensed={showCondensed}
                        leftIcon={startIcon}
                        rightIcon={endIcon}
                        disabled={disabled}
                      >
                        Button
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ))}
            {showFullWidth && BUTTON_VARIANTS.map((variant) => (
              <tr key={`${variant}-fullwidth`}>
                <td
                  style={{
                    fontSize: 'var(--Typography-Size-XS)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
                    color: 'var(--Text-Low)',
                    paddingRight: 'var(--Spacing-4-5)',
                    verticalAlign: 'middle',
                  }}
                >
                  {ATTENTION_LABELS[variant]} (full width)
                </td>
                <td colSpan={BUTTON_SIZES.length} style={{ padding: 'var(--Spacing-3-5)', verticalAlign: 'middle' }}>
                  <Button
                    attention={VARIANT_TO_ATTENTION[variant]}
                    size={10}
                    appearance={appearance}
                    fullWidth
                    leftIcon={startIcon}
                    rightIcon={endIcon}
                  >
                    Button
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Resolve selectedSize to a ButtonSize for single mode
  const resolvedSize = (Number(selectedSize) || 10) as ButtonSize;

  // Single mode: show all variants with selected size
  return (
    <div
      style={{
        ...tokens,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        alignItems: showFullWidth ? 'stretch' : 'center',
        width: showFullWidth ? '100%' : undefined,
      }}
    >
      {BUTTON_VARIANTS.map((variant) => (
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
          <Button
            attention={VARIANT_TO_ATTENTION[variant]}
            size={resolvedSize}
            appearance={appearance}
            condensed={showCondensed}
            leftIcon={startIcon}
            rightIcon={endIcon}
            fullWidth={showFullWidth}
            disabled={disabled}
          >
            Button
          </Button>
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

export default ButtonPreview;
