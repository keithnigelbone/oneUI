/**
 * InputPreview.tsx
 *
 * Preview component for the editor canvas.
 * Renders a size grid for InputField.
 */

'use client';

import React from 'react';
import { InputField } from '../InputField/InputField';
import type { InputSize, InputAppearance, InputShape } from './Input.shared';

const INPUT_SIZES: readonly { size: InputSize; label: string }[] = [
  { size: 6, label: 'XS' },
  { size: 8, label: 'S' },
  { size: 10, label: 'M' },
  { size: 12, label: 'L' },
];

const PreviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
  </svg>
);

export interface InputPreviewProps {
  tokens: Record<string, string>;
  selectedSize?: string;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  showAllVariations?: boolean;
  appearance?: InputAppearance;
  shape?: InputShape;
  disabled?: boolean;
}

export function InputPreview({
  tokens,
  selectedSize = '10',
  showLeftIcon = false,
  showRightIcon = false,
  showAllVariations = false,
  appearance,
  shape,
  disabled = false,
}: InputPreviewProps) {
  const startSlot = showLeftIcon ? <PreviewIcon /> : undefined;
  const endSlot = showRightIcon ? <PreviewIcon /> : undefined;

  const containerStyle: React.CSSProperties = {
    ...tokens,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-4)',
    padding: 'var(--Spacing-4)',
  } as React.CSSProperties;

  if (showAllVariations) {
    return (
      <div style={containerStyle}>
        {INPUT_SIZES.map(({ size, label }) => (
          <InputField
            key={label}
            size={size}
            label="Label"
            appearance={appearance}
            shape={shape}
            placeholder={`Size ${label}`}
            start={startSlot}
            end={endSlot}
            disabled={disabled}
          />
        ))}
      </div>
    );
  }

  const resolvedSize = (Number(selectedSize) || 10) as InputSize;

  return (
    <div style={containerStyle}>
      <InputField
        size={resolvedSize}
        label="Label"
        appearance={appearance}
        shape={shape}
        placeholder="Placeholder"
        start={startSlot}
        end={endSlot}
        disabled={disabled}
      />
    </div>
  );
}
