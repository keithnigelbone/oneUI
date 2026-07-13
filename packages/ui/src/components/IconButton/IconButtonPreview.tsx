/**
 * IconButtonPreview.tsx
 *
 * Single-source-of-truth preview component for IconButton.
 * Renders a size x attention grid (showAllVariations) or a single-size row.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { IconButton } from './IconButton';
import { Surface } from '../Surface';
import type { IconButtonAppearance } from './IconButton.shared';

const SIZES: readonly { size: string; label: string }[] = [
  { size: '2xs', label: '2XS' },
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

const ATTENTIONS: readonly { attention: 'high' | 'medium' | 'low'; label: string }[] = [
  { attention: 'high', label: 'High' },
  { attention: 'medium', label: 'Medium' },
  { attention: 'low', label: 'Low' },
];

// Placeholder icon for previews
const PreviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
  </svg>
);

export interface IconButtonPreviewProps {
  tokens: Record<string, string>;
  appearance?: IconButtonAppearance;
  disabled?: boolean;
  showAllVariations?: boolean;
}

export function IconButtonPreview({
  tokens,
  appearance,
  disabled = false,
  showAllVariations = false,
}: IconButtonPreviewProps) {
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
                {ATTENTIONS.map(({ label }) => (
                  <th
                    key={label}
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      textAlign: 'center',
                      padding: 'var(--Spacing-3-5)',
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map(({ size, label }) => (
                <tr key={size}>
                  <td
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      paddingRight: 'var(--Spacing-4-5)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {label}
                  </td>
                  {ATTENTIONS.map(({ attention, label: attLabel }) => (
                    <td
                      key={`${size}-${attLabel}`}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                      }}
                    >
                      <IconButton
                        icon={<PreviewIcon />}
                        size={size as any}
                        attention={attention}
                        appearance={appearance}
                        disabled={disabled}
                        aria-label={`${label} ${attLabel}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      </div>
    );
  }

  // Single mode: show 3 attention levels at medium size
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
        {ATTENTIONS.map(({ attention, label }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
              padding: 'var(--Spacing-3-5)',
            }}
          >
            <IconButton
              icon={<PreviewIcon />}
              attention={attention}
              appearance={appearance}
              disabled={disabled}
              aria-label={label}
            />
            <span
              style={{
                fontSize: 'var(--Typography-Size-2XS)',
                color: 'var(--Text-Low)',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </Surface>
    </div>
  );
}

export default IconButtonPreview;
