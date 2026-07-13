/**
 * SliderPreview — editor/registry preview
 */

'use client';

import React from 'react';
import { Slider } from './Slider';
import type { SliderAppearance } from './Slider.shared';

export interface SliderPreviewProps {
  appearance?: SliderAppearance;
  knobStyle?: 'inside' | 'outside';
  showSteps?: boolean;
  showTooltip?: 'auto' | 'always' | false;
  disabled?: boolean;
  readOnly?: boolean;
  range?: boolean;
}

export const SliderPreview: React.FC<SliderPreviewProps> = ({
  appearance = 'auto',
  knobStyle = 'outside',
  showSteps = false,
  showTooltip = 'auto',
  disabled,
  readOnly,
  range,
}) => {
  return (
    <div style={{ width: 328, padding: 'var(--Spacing-4)' }}>
      <Slider
        appearance={appearance}
        knobStyle={knobStyle}
        showSteps={showSteps}
        showTooltip={showTooltip}
        disabled={disabled}
        readOnly={readOnly}
        defaultValue={range ? [25, 75] : 50}
        step={showSteps ? 20 : 1}
        aria-label="Preview slider"
      />
    </div>
  );
};
