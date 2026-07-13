/**
 * LogoPreview.tsx
 *
 * Single-source-of-truth preview component for Logo.
 * Renders a variant x size grid (showAllVariations) or a single-variant row.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { Logo } from './Logo';
import { Surface } from '../Surface';
import type { LogoVariant } from './Logo.shared';

/** Variant labels */
const VARIANT_LABELS: Record<LogoVariant, string> = {
  mark: 'Mark',
  full: 'Full',
};

/** Logo variants */
const VARIANTS: readonly LogoVariant[] = ['mark', 'full'];

/** Logo sizes */
const SIZES: readonly { size: string; label: string }[] = [
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

/** Simple placeholder SVG for preview */
const PREVIEW_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>';

export interface LogoPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Currently selected variant */
  selectedVariant?: string;
  /** Callback when a variant is clicked */
  onVariantSelect?: (variant: string) => void;
  /** Currently selected size */
  selectedSize?: string;
  /** Callback when a size is clicked */
  onSizeSelect?: (size: string) => void;
  /** When true, shows the full variant x size grid */
  showAllVariations?: boolean;
  /** Callback when a grid cell is clicked (variant + size selection) */
  onCellSelect?: (variant: string, size: string) => void;
}

export function LogoPreview({
  tokens,
  selectedVariant,
  onVariantSelect,
  selectedSize = 'm',
  showAllVariations = false,
  onCellSelect,
}: LogoPreviewProps) {
  if (showAllVariations) {
    return (
      <div style={{ ...tokens, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }} data-draggable="false">
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
              {VARIANTS.map((variant) => (
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
                    {VARIANT_LABELS[variant]}
                  </td>
                  {SIZES.map(({ size }) => {
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
                        <Logo
                          variant={variant}
                          size={size as any}
                          svgContent={PREVIEW_SVG}
                          alt={`${variant} ${size}`}
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

  // Single mode: show all variants with selected size
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
      <Surface mode="default" style={{ display: 'flex', gap: 'var(--Spacing-4-5)', padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', alignItems: 'center' }}>
        {VARIANTS.map((variant) => (
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
            <Logo
              variant={variant}
              size={selectedSize as any}
              svgContent={PREVIEW_SVG}
              alt={variant}
            />
            <span
              style={{
                fontSize: 'var(--Typography-Size-2XS)',
                color: selectedVariant === variant ? 'var(--Text-High)' : 'var(--Text-Low)',
              }}
            >
              {VARIANT_LABELS[variant]}
            </span>
          </div>
        ))}
      </Surface>
    </div>
  );
}

export default LogoPreview;
