/**
 * SelectableIconButtonPreview.tsx
 *
 * Single-source-of-truth preview component for the SelectableIconButton.
 * Renders an attention × size grid (showAllVariations) or a single-attention column.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { SelectableIconButton } from './SelectableIconButton';
import type {
  SelectableIconButtonAttention,
  SelectableIconButtonAppearance,
} from './SelectableIconButton.shared';

const ATTENTION_LABELS: Record<SelectableIconButtonAttention, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const ATTENTION_LEVELS: readonly SelectableIconButtonAttention[] = ['high', 'medium', 'low'];

const SIZES: readonly { size: number; label: string }[] = [
  { size: 4, label: '2XS' },
  { size: 6, label: 'XS' },
  { size: 8, label: 'S' },
  { size: 10, label: 'M' },
  { size: 12, label: 'L' },
  { size: 14, label: 'XL' },
];

// Simple heart icon for previews — no external import needed
const PreviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

export interface SelectableIconButtonPreviewProps {
  tokens: Record<string, string>;
  selectedVariant?: string;
  onVariantSelect?: (variant: string) => void;
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
  showAllVariations?: boolean;
  appearance?: SelectableIconButtonAppearance;
  onCellSelect?: (variant: string, size: string) => void;
}

export function SelectableIconButtonPreview({
  tokens,
  selectedVariant,
  selectedSize = '10',
  showAllVariations = false,
  appearance,
  onCellSelect,
  onVariantSelect,
}: SelectableIconButtonPreviewProps) {
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
                  const variantMatch = selectedVariant === undefined || selectedVariant === attention;
                  const sizeMatch = selectedSize === undefined || selectedSize === String(size);
                  const isSelected = variantMatch && sizeMatch;
                  const isExactCell = selectedVariant === attention && selectedSize === String(size);
                  return (
                    <React.Fragment key={`${attention}-${size}`}>
                      <td
                        data-selected={isSelected || undefined}
                        onClick={onCellSelect ? () => onCellSelect(attention, String(size)) : undefined}
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
                        <SelectableIconButton
                          attention={attention}
                          size={size as 4 | 6 | 8 | 10 | 12 | 14}
                          appearance={appearance}
                          defaultSelected
                          icon={<PreviewIcon />}
                          aria-label={`${ATTENTION_LABELS[attention]} selected preview`}
                        />
                      </td>
                      <td
                        style={{
                          padding: 'var(--Spacing-3-5)',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                        }}
                      >
                        <SelectableIconButton
                          attention={attention}
                          size={size as 4 | 6 | 8 | 10 | 12 | 14}
                          appearance={appearance}
                          icon={<PreviewIcon />}
                          aria-label={`${ATTENTION_LABELS[attention]} unselected preview`}
                        />
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

  const resolvedSize = (parseInt(selectedSize || '10', 10) || 10) as 4 | 6 | 8 | 10 | 12 | 14;

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
            transition: 'all var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
            <SelectableIconButton
              attention={attention}
              size={resolvedSize}
              appearance={appearance}
              defaultSelected
              icon={<PreviewIcon />}
              aria-label={`${ATTENTION_LABELS[attention]} selected`}
            />
            <SelectableIconButton
              attention={attention}
              size={resolvedSize}
              appearance={appearance}
              icon={<PreviewIcon />}
              aria-label={`${ATTENTION_LABELS[attention]} unselected`}
            />
          </div>
          <span
            style={{
              fontSize: 'var(--Typography-Size-2XS)',
              color: selectedVariant === attention ? 'var(--Text-High)' : 'var(--Text-Low)',
            }}
          >
            {ATTENTION_LABELS[attention]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default SelectableIconButtonPreview;
