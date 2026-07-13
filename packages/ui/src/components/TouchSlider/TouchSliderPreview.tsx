/**
 * TouchSliderPreview — editor/registry preview
 */

'use client';

import React from 'react';
import { TouchSlider } from './TouchSlider';
import type {
  TouchSliderAppearance,
  TouchSliderProgressStyle,
  TouchSliderOrientation,
} from './TouchSlider.shared';

export interface TouchSliderPreviewProps {
  appearance?: TouchSliderAppearance;
  progressStyle?: TouchSliderProgressStyle;
  orientation?: TouchSliderOrientation;
  disabled?: boolean;
  readOnly?: boolean;
}

export const TouchSliderPreview: React.FC<TouchSliderPreviewProps> = ({
  appearance = 'auto',
  progressStyle = 'rounded',
  orientation = 'horizontal',
  disabled,
  readOnly,
}) => {
  return (
    <div style={{ padding: 'var(--Spacing-4)', display: 'inline-flex' }}>
      <TouchSlider
        appearance={appearance}
        progressStyle={progressStyle}
        orientation={orientation}
        disabled={disabled}
        readOnly={readOnly}
        defaultValue={60}
        aria-label="Preview touch slider"
      />
    </div>
  );
};
