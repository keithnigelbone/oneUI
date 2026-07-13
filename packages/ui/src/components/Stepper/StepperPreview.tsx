/**
 * StepperPreview.tsx
 *
 * Single-source-of-truth preview component for Stepper.
 * Renders a size x attention grid (showAllVariations) or a single-size row.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React from 'react';
import { Stepper } from './Stepper';
import { Surface } from '../Surface';
import type { StepperAppearance, StepperAccent, StepperAttention } from './Stepper.shared';

/** Stepper sizes for preview */
const SIZES: readonly { size: string; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

/** Stepper attention levels for preview */
const ATTENTIONS: readonly { attention: StepperAttention; label: string }[] = [
  { attention: 'high', label: 'High' },
  { attention: 'medium', label: 'Medium' },
  { attention: 'low', label: 'Low' },
];

export interface StepperPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Appearance role to preview */
  appearance?: StepperAppearance;
  /** Accent override */
  accent?: StepperAccent;
  /** Whether to show in disabled state */
  disabled?: boolean;
  /** When true, shows the full size x attention grid */
  showAllVariations?: boolean;
}

export function StepperPreview({
  tokens,
  appearance,
  accent,
  disabled = false,
  showAllVariations = false,
}: StepperPreviewProps) {
  if (showAllVariations) {
    return (
      <div style={{ ...tokens, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }} data-draggable="false">
        <Surface mode="default" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
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
                      <Stepper
                        size={size as any}
                        attention={attention}
                        appearance={appearance}
                        accent={accent}
                        disabled={disabled}
                        defaultValue={5}
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

  // Single mode: show all attention levels at medium size
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
            <Stepper
              attention={attention}
              appearance={appearance}
              accent={accent}
              disabled={disabled}
              defaultValue={5}
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

export default StepperPreview;
