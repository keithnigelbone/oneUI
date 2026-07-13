/**
 * DensitySelector.tsx
 *
 * Segmented control for switching between compact, default, and open density modes.
 * Uses the project's ToggleGroup component for consistent styling with other toggles.
 */

'use client';

import React, { useCallback } from 'react';
import { ToggleGroup } from '../../ToggleGroup';

export type DensityMode = 'compact' | 'default' | 'open';

export interface DensitySelectorProps {
  currentDensity: DensityMode;
  onDensityChange: (density: DensityMode) => void;
}

const DENSITY_OPTIONS: { value: DensityMode; label: string; icon: React.ReactNode }[] = [
  {
    value: 'compact',
    label: 'Compact',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="2" y1="4" x2="12" y2="4" />
        <line x1="2" y1="7" x2="12" y2="7" />
        <line x1="2" y1="10" x2="12" y2="10" />
      </svg>
    ),
  },
  {
    value: 'default',
    label: 'Default',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="2" y1="3" x2="12" y2="3" />
        <line x1="2" y1="7" x2="12" y2="7" />
        <line x1="2" y1="11" x2="12" y2="11" />
      </svg>
    ),
  },
  {
    value: 'open',
    label: 'Open',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="2" y1="2" x2="12" y2="2" />
        <line x1="2" y1="7" x2="12" y2="7" />
        <line x1="2" y1="12" x2="12" y2="12" />
      </svg>
    ),
  },
];

export const DensitySelector: React.FC<DensitySelectorProps> = ({
  currentDensity,
  onDensityChange,
}) => {
  const handleChange = useCallback(
    (value: string | string[]) => {
      const mode = Array.isArray(value) ? value[0] : value;
      if (mode) onDensityChange(mode as DensityMode);
    },
    [onDensityChange]
  );

  return (
    <ToggleGroup
      value={currentDensity}
      onValueChange={handleChange}
      variant="subtool"
      size="compact"
    >
      {DENSITY_OPTIONS.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          aria-label={`${option.label} density`}
        >
          {option.icon}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
