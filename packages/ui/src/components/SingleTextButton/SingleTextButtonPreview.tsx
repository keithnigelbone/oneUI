'use client';

/**
 * SingleTextButtonPreview.tsx
 *
 * Single-source-of-truth preview component for SingleTextButton.
 * Renders an attention × size grid (showAllVariations) or a single-attention column.
 * Used by both the docs page and the advanced token editor.
 */

import React from 'react';
import { SingleTextButton } from './SingleTextButton';
import type {
  SingleTextButtonAttention,
  SingleTextButtonSize,
  SingleTextButtonAppearance,
} from './SingleTextButton.shared';

const ATTENTION_LABELS: Record<SingleTextButtonAttention, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const ATTENTION_LEVELS: readonly SingleTextButtonAttention[] = [
  'high',
  'medium',
  'low',
];

const SIZES: readonly { size: SingleTextButtonSize; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

export interface SingleTextButtonPreviewProps {
  tokens: Record<string, string>;
  selectedVariant?: string;
  onVariantSelect?: (variant: string) => void;
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
  showAllVariations?: boolean;
  appearance?: SingleTextButtonAppearance;
  onCellSelect?: (variant: string, size: string) => void;
}

export function SingleTextButtonPreview({
  tokens,
  selectedVariant,
  selectedSize = 'm',
  showAllVariations = false,
  appearance,
  onCellSelect,
  onVariantSelect,
}: SingleTextButtonPreviewProps) {
  if (showAllVariations) {
    return (
      <div style={tokens} data-draggable="false">
        <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
          <thead>
            <tr>
              <th />
              {SIZES.map(({ size, label }) => (
                <th
                  key={size}
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
            {ATTENTION_LEVELS.map((attention) => (
              <tr key={attention}>
                <td
                  style={{
                    fontSize: 'var(--Typography-Size-XS)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
                    color: 'var(--Text-Low)',
                    paddingRight: 'var(--Spacing-4-5)',
                    verticalAlign: 'middle',
                  }}
                >
                  {ATTENTION_LABELS[attention]}
                </td>
                {SIZES.map(({ size }) => {
                  const variantMatch =
                    selectedVariant === undefined || selectedVariant === attention;
                  const sizeMatch =
                    selectedSize === undefined || selectedSize === size;
                  const isSelected = variantMatch && sizeMatch;
                  const isExactCell =
                    selectedVariant === attention && selectedSize === size;
                  return (
                    <td
                      key={`${attention}-${size}`}
                      data-selected={isSelected || undefined}
                      onClick={
                        onCellSelect ? () => onCellSelect(attention, size) : undefined
                      }
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
                      <SingleTextButton
                        attention={attention}
                        size={size}
                        appearance={appearance}
                      >
                        Ag
                      </SingleTextButton>
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

  const resolvedSize = (selectedSize || 'm') as SingleTextButtonSize;

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
      {ATTENTION_LEVELS.map((attention) => (
        <div
          key={attention}
          onClick={onVariantSelect ? () => onVariantSelect(attention) : undefined}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--Spacing-3)',
            padding: 'var(--Spacing-3-5)',
            borderRadius: 'var(--Shape-4)',
            cursor: onVariantSelect ? 'pointer' : 'default',
            border:
              selectedVariant === attention
                ? 'var(--Stroke-M) solid var(--Border-Subtle)'
                : 'var(--Stroke-M) solid transparent',
            transition:
              'all var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate)',
          }}
        >
          <SingleTextButton
            attention={attention}
            size={resolvedSize}
            appearance={appearance}
          >
            Ag
          </SingleTextButton>
          <span
            style={{
              fontSize: 'var(--Typography-Size-2XS)',
              color:
                selectedVariant === attention
                  ? 'var(--Text-High)'
                  : 'var(--Text-Low)',
            }}
          >
            {ATTENTION_LABELS[attention]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default SingleTextButtonPreview;
