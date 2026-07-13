/**
 * IndicatorBadgePreview.tsx
 *
 * Single-source-of-truth preview component for the IndicatorBadge.
 * Renders a 1-row x 5-size grid (showAllVariations) or a single dot at selected size.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { IndicatorBadge } from './IndicatorBadge';
import type {
  IndicatorBadgeSize,
  IndicatorBadgeAppearance,
} from './IndicatorBadge.shared';

/** All sizes in order */
const INDICATOR_BADGE_SIZES: readonly {
  size: IndicatorBadgeSize;
  label: string;
}[] = [
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

export interface IndicatorBadgePreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Currently selected size */
  selectedSize?: string;
  /** Callback when a size is clicked */
  onSizeSelect?: (size: string) => void;
  /** When true, shows all sizes in a row */
  showAllVariations?: boolean;
  /** Appearance role to preview */
  appearance?: IndicatorBadgeAppearance;
  /** Callback when a grid cell is clicked */
  onCellSelect?: (variant: string, size: string) => void;
}

export function IndicatorBadgePreview({
  tokens,
  selectedSize = 'm',
  onSizeSelect,
  showAllVariations = false,
  appearance,
  onCellSelect,
}: IndicatorBadgePreviewProps) {
  // Show All Variations: display row of all sizes
  if (showAllVariations) {
    return (
      <div style={tokens} data-draggable="false">
        <table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 'var(--Spacing-4)',
          }}
        >
          <thead>
            <tr>
              <th />
              {INDICATOR_BADGE_SIZES.map(({ size, label }) => (
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
            <tr>
              <td
                style={{
                  fontSize: 'var(--Label-XS-FontSize)',
                  fontWeight: 'var(--Label-FontWeight-Medium)',
                  color: 'var(--Text-Low)',
                  paddingRight: 'var(--Spacing-4-5)',
                  verticalAlign: 'middle',
                }}
              >
                Default
              </td>
              {INDICATOR_BADGE_SIZES.map(({ size }) => {
                const isSelected =
                  selectedSize === undefined || selectedSize === size;
                const isExactCell = selectedSize === size;
                return (
                  <td
                    key={size}
                    data-selected={isSelected || undefined}
                    onClick={
                      onCellSelect
                        ? () => onCellSelect('bold', size)
                        : undefined
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
                    <IndicatorBadge
                      size={size}
                      appearance={appearance}
                      aria-label={`Status indicator ${size}`}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Single mode: show dot at selected size
  const resolvedSize = (selectedSize || 'm') as IndicatorBadgeSize;

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
      <div
        onClick={onSizeSelect ? () => onSizeSelect(resolvedSize) : undefined}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--Spacing-3)',
          padding: 'var(--Spacing-3-5)',
          borderRadius: 'var(--Shape-4)',
          cursor: onSizeSelect ? 'pointer' : 'default',
        }}
      >
        <IndicatorBadge
          size={resolvedSize}
          appearance={appearance}
          aria-label="Status indicator"
        />
        <span
          style={{
            fontSize: 'var(--Label-2XS-FontSize)',
            color: 'var(--Text-Low)',
          }}
        >
          {resolvedSize.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default IndicatorBadgePreview;
