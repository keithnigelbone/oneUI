/**
 * CheckboxFieldPreview.tsx
 *
 * Preview grid for the token editor and docs — mirrors `CheckboxPreview` layout.
 */

'use client';

import React from 'react';
import { CheckboxField } from './CheckboxField';
import { InputFeedback } from '../Input';
import { Surface } from '../Surface';
import type { CheckboxAppearance } from '../Checkbox/Checkbox.shared';

const SIZES = ['s', 'm', 'l'] as const;

export interface CheckboxFieldPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  appearance?: CheckboxAppearance;
  disabled?: boolean;
  showAllVariations?: boolean;
}

export function CheckboxFieldPreview({
  tokens,
  appearance,
  disabled = false,
  showAllVariations = false,
}: CheckboxFieldPreviewProps) {
  if (showAllVariations) {
    return (
      <div
        style={{ ...tokens, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}
        data-draggable="false"
      >
        <Surface mode="default" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
            <thead>
              <tr>
                <th />
                <th
                  style={{
                    fontFamily: 'var(--Typography-Font-Primary, inherit)',
                    fontSize: 'var(--Label-XS-FontSize)',
                    lineHeight: 'var(--Label-XS-LineHeight)',
                    fontWeight: 'var(--Label-FontWeight-Medium)',
                    color: 'var(--Text-Low)',
                    textAlign: 'center',
                    padding: 'var(--Spacing-3-5)',
                  }}
                >
                  Slots off
                </th>
                <th
                  style={{
                    fontFamily: 'var(--Typography-Font-Primary, inherit)',
                    fontSize: 'var(--Label-XS-FontSize)',
                    lineHeight: 'var(--Label-XS-LineHeight)',
                    fontWeight: 'var(--Label-FontWeight-Medium)',
                    color: 'var(--Text-Low)',
                    textAlign: 'center',
                    padding: 'var(--Spacing-3-5)',
                  }}
                >
                  Feedback on
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((sz) => (
                <tr key={sz}>
                  <td
                    style={{
                      fontFamily: 'var(--Typography-Font-Primary, inherit)',
                      fontSize: 'var(--Label-XS-FontSize)',
                      lineHeight: 'var(--Label-XS-LineHeight)',
                      fontWeight: 'var(--Label-FontWeight-Medium)',
                      color: 'var(--Text-Low)',
                      paddingRight: 'var(--Spacing-4-5)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {sz.toUpperCase()}
                  </td>
                  <td style={{ padding: 'var(--Spacing-3-5)', verticalAlign: 'top' }}>
                    <CheckboxField
                      size={sz}
                      appearance={appearance}
                      disabled={disabled}
                      label="Subscribe to updates"
                    />
                  </td>
                  <td style={{ padding: 'var(--Spacing-3-5)', verticalAlign: 'top' }}>
                    <CheckboxField
                      size={sz}
                      appearance={appearance}
                      disabled={disabled}
                      label="Accept terms"
                      feedback={
                        <InputFeedback variant="negative" attention="low">
                          You must accept before continuing.
                        </InputFeedback>
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      </div>
    );
  }

  return (
    <div
      style={{
        ...tokens,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: 'none',
        boxSizing: 'border-box',
      }}
    >
      <Surface mode="default" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
        <CheckboxField
          appearance={appearance}
          disabled={disabled}
          label="Remember this device"
          feedback={<InputFeedback attention="low">Only use on trusted computers.</InputFeedback>}
        />
      </Surface>
    </div>
  );
}

export default CheckboxFieldPreview;
