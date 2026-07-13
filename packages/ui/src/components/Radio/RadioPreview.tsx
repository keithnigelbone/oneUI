/**
 * RadioPreview.tsx
 *
 * Single-source-of-truth preview component for Radio.
 * Renders a size x state grid (showAllVariations) or a single-size row.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { Radio } from './Radio';
import { RadioGroup } from './Radio';
import { Surface } from '../Surface';
import type { RadioAppearance } from './Radio.shared';

/** Radio sizes for preview */
const SIZES: readonly { size: string; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

/** Radio states for preview */
const STATES: readonly { value: string; label: string }[] = [
  { value: 'off', label: 'Unchecked' },
  { value: 'on', label: 'Checked' },
];

export interface RadioPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Appearance role to preview */
  appearance?: RadioAppearance;
  /** Whether to show in disabled state */
  disabled?: boolean;
  /** When true, shows the full size x state grid */
  showAllVariations?: boolean;
}

export function RadioPreview({
  tokens,
  appearance,
  disabled = false,
  showAllVariations = false,
}: RadioPreviewProps) {
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
                  {STATES.map(({ value, label: stateLabel }) => (
                    <td
                      key={`${size}-${stateLabel}`}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                      }}
                    >
                      <RadioGroup
                        value={value === 'on' ? 'demo' : ''}
                        aria-label={`${label} ${stateLabel}`}
                      >
                        <Radio
                          value="demo"
                          size={size as any}
                          appearance={appearance}
                          disabled={disabled}
                        />
                      </RadioGroup>
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

  // Single mode: show both states at medium size
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
        {STATES.map(({ value, label }) => (
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
            <RadioGroup
              value={value === 'on' ? 'demo' : ''}
              aria-label={`${label} preview`}
            >
              <Radio
                value="demo"
                appearance={appearance}
                disabled={disabled}
              />
            </RadioGroup>
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

export default RadioPreview;
