/**
 * RadioFieldPreview.tsx
 *
 * Preview grid for the token editor and docs — mirrors CheckboxFieldPreview layout.
 */

'use client';

import React from 'react';
import { RadioField } from './RadioField';
import { Radio } from '../Radio/Radio';
import { InputFeedback } from '../Input';
import { Surface } from '../Surface';
import type { RadioAppearance } from '../Radio/Radio.shared';

const SIZES = ['s', 'm', 'l'] as const;

export interface RadioFieldPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  appearance?: RadioAppearance;
  disabled?: boolean;
  showAllVariations?: boolean;
}

export function RadioFieldPreview({
  tokens,
  appearance,
  disabled = false,
  showAllVariations = false,
}: RadioFieldPreviewProps) {
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
                    <RadioField
                      size={sz}
                      appearance={appearance}
                      disabled={disabled}
                      label="Delivery speed"
                      name={`radio-preview-grid-${sz}-plain`}
                      defaultValue="std"
                    >
                      <Radio value="std">Standard</Radio>
                      <Radio value="exp">Express</Radio>
                    </RadioField>
                  </td>
                  <td style={{ padding: 'var(--Spacing-3-5)', verticalAlign: 'top' }}>
                    <RadioField
                      size={sz}
                      appearance={appearance}
                      disabled={disabled}
                      label="Delivery speed"
                      name={`radio-preview-grid-${sz}-fb`}
                      defaultValue="std"
                      feedback={
                        <InputFeedback variant="negative" attention="low">
                          Express may incur an additional fee.
                        </InputFeedback>
                      }
                    >
                      <Radio value="std">Standard</Radio>
                      <Radio value="exp">Express</Radio>
                    </RadioField>
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
        <RadioField
          appearance={appearance}
          disabled={disabled}
          label="Delivery speed"
          description="Applies to this order only."
          name="radio-preview"
          defaultValue="std"
          feedback={<InputFeedback attention="low">Standard is free for members.</InputFeedback>}
        >
          <Radio value="std">Standard</Radio>
          <Radio value="exp">Express</Radio>
        </RadioField>
      </Surface>
    </div>
  );
}

export default RadioFieldPreview;
