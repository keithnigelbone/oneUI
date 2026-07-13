/**
 * CheckboxPreview.tsx
 *
 * Single-source-of-truth preview component for Checkbox.
 * Renders a size x state grid (showAllVariations) or a single-size row.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { Checkbox } from './Checkbox';
import { Surface } from '../Surface';
import type { CheckboxAppearance } from './Checkbox.shared';

/** Checkbox sizes for preview */
const SIZES: readonly { size: string; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

/** Checkbox states for preview */
const STATES: readonly { checked?: boolean; indeterminate?: boolean; label: string }[] = [
  { checked: false, label: 'Unchecked' },
  { checked: true, label: 'Checked' },
  { indeterminate: true, label: 'Indeterminate' },
];

export interface CheckboxPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Appearance role to preview */
  appearance?: CheckboxAppearance;
  /** Whether to show in disabled state */
  disabled?: boolean;
  /** When true, shows the full size x state grid */
  showAllVariations?: boolean;
}

export function CheckboxPreview({
  tokens,
  appearance,
  disabled = false,
  showAllVariations = false,
}: CheckboxPreviewProps) {
  if (showAllVariations) {
    return (
      <div style={{ ...tokens, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }} data-draggable="false">
        <Surface mode="default" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
            <thead>
              <tr>
                <th />
                {STATES.map(({ label }) => (
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
                  {STATES.map(({ checked, indeterminate, label: stateLabel }) => (
                    <td
                      key={`${size}-${stateLabel}`}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                      }}
                    >
                      <Checkbox
                        size={size as any}
                        checked={indeterminate ? false : checked}
                        indeterminate={indeterminate}
                        appearance={appearance}
                        disabled={disabled}
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

  // Single mode: show all states at medium size
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
        {STATES.map(({ checked, indeterminate, label }) => (
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
            <Checkbox
              checked={indeterminate ? false : checked}
              indeterminate={indeterminate}
              appearance={appearance}
              disabled={disabled}
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

export default CheckboxPreview;
