/**
 * SelectPreview.tsx — editor / registry preview
 */

'use client';

import React, { useState } from 'react';
import { Select } from './Select';
import type { SelectAppearance, SelectTriggerFigma } from './Select.shared';
import {
  FIGMA_SELECT_INPUT_WIDTH,
  FIGMA_SELECT_PLACEHOLDER,
  FIGMA_SELECT_SINGLE_OPTIONS,
} from './Select.figma';

export interface SelectPreviewProps {
  appearance?: SelectAppearance;
  trigger?: SelectTriggerFigma;
  label?: string;
}

export function SelectPreview({
  appearance = 'primary',
  trigger = 'selectableInput',
  label = 'Label',
}: SelectPreviewProps) {
  const [value, setValue] = useState('1');
  return (
    <div style={{ width: FIGMA_SELECT_INPUT_WIDTH, padding: 'var(--Spacing-4)' }}>
      <Select
        trigger={trigger}
        appearance={appearance}
        label={trigger === 'selectableInput' ? label : undefined}
        options={FIGMA_SELECT_SINGLE_OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder={FIGMA_SELECT_PLACEHOLDER}
        aria-label={trigger === 'selectableInput' ? undefined : 'Select preview'}
      />
    </div>
  );
}

export default SelectPreview;
