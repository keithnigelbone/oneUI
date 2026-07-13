/**
 * IconContainedPreview.tsx
 *
 * Single-source-of-truth preview component for IconContained.
 * Renders an attention x size grid (showAllVariations) or a single-attention row.
 * Used by both the docs page and the advanced token editor.
 * Surface context switching is handled by the inspector, not this preview.
 */

'use client';

import React from 'react';
import { IconContained } from './IconContained';
import { Surface } from '../Surface';
import type { IconContainedAttention, IconContainedAppearance } from './IconContained.shared';

/** Attention labels — Figma API terminology */
const ATTENTION_LABELS: Record<IconContainedAttention, string> = {
  high: 'High',
  medium: 'Medium',
};

/** IconContained attention levels */
const ATTENTIONS: readonly IconContainedAttention[] = ['high', 'medium'];

/** IconContained sizes */
const SIZES: readonly { size: string; label: string }[] = [
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

export interface IconContainedPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Currently selected attention level */
  selectedVariant?: string;
  /** Callback when an attention level is clicked */
  onVariantSelect?: (variant: string) => void;
  /** Currently selected size */
  selectedSize?: string;
  /** Callback when a size is clicked */
  onSizeSelect?: (size: string) => void;
  /** When true, shows the full attention x size grid */
  showAllVariations?: boolean;
  /** Appearance role to preview */
  appearance?: IconContainedAppearance;
  /** Whether to show in disabled state */
  disabled?: boolean;
  /** Callback when a grid cell is clicked (attention + size selection) */
  onCellSelect?: (variant: string, size: string) => void;
}

export function IconContainedPreview({
  tokens,
  selectedVariant,
  onVariantSelect,
  selectedSize = 'm',
  showAllVariations = false,
  appearance,
  disabled = false,
  onCellSelect,
}: IconContainedPreviewProps) {
  if (showAllVariations) {
    return (
      <div style={{ ...tokens, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }} data-draggable="false">
        {/* Default surface grid */}
        <Surface mode="default" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
          <span style={{
            fontSize: 'var(--Typography-Size-2XS)',
            fontWeight: 'var(--Typography-Weight-Medium)',
            color: 'var(--Text-Low)',
            display: 'block',
            marginBottom: 'var(--Spacing-3-5)',
          }}>
            Default Surface
          </span>
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
              {ATTENTIONS.map((attention) => (
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
                    const sizeMatch = selectedSize === undefined || selectedSize === size;
                    const isSelected = variantMatch && sizeMatch;
                    const isExactCell = selectedVariant === attention && selectedSize === size;
                    return (
                      <td
                        key={`${attention}-${size}`}
                        data-selected={isSelected || undefined}
                        onClick={onCellSelect ? () => onCellSelect(attention, size) : undefined}
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
                        <IconContained
                          icon="home"
                          attention={attention}
                          size={size as any}
                          appearance={appearance}
                          disabled={disabled}
                          aria-label={`${attention} ${size}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      </div>
    );
  }

  // Single mode: show all attention levels with selected size
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
      {/* Default surface */}
      <Surface mode="default" style={{ display: 'flex', gap: 'var(--Spacing-4-5)', padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', alignItems: 'center' }}>
        {ATTENTIONS.map((attention) => (
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
              transition: 'all var(--Motion-Duration-Discreet-Medium) var(--Motion-Easing-Standard)',
            }}
          >
            <IconContained
              icon="home"
              attention={attention}
              size={selectedSize as any}
              appearance={appearance}
              disabled={disabled}
              aria-label={attention}
            />
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
      </Surface>
    </div>
  );
}

export default IconContainedPreview;
