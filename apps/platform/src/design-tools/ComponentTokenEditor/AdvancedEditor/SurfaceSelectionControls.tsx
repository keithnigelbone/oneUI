/**
 * SurfaceSelectionControls.tsx
 *
 * Dropdown control for selecting which surface to display.
 * Uses Select component for a compact, closeable control.
 */

'use client';

import React from 'react';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import type { SurfaceToken } from '@oneui/shared/engine';
import styles from './SurfaceSelectionControls.module.css';

/** Surface options for the selector — canonical tokens except ghost, which is omitted from this UI. */
const SURFACE_OPTIONS: Array<{ value: SurfaceToken; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'bold', label: 'Bold' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'blend', label: 'Blend' },
];

export interface SurfaceSelectionControlsProps {
  /** Set of enabled surface names */
  enabledSurfaces: Set<SurfaceToken>;
  /** Callback when a surface is toggled */
  onSurfaceToggle: (surface: SurfaceToken) => void;
  /** Currently selected surface for single-select mode */
  selectedSurface?: SurfaceToken;
  /** Callback when surface selection changes (single-select) */
  onSurfaceSelect?: (surface: SurfaceToken) => void;
  /** Whether the controls are disabled */
  disabled?: boolean;
}

export function SurfaceSelectionControls({
  selectedSurface = 'default',
  onSurfaceSelect,
  onSurfaceToggle,
  disabled = false,
}: SurfaceSelectionControlsProps) {
  const handleChange = (value: string) => {
    const surface = value as SurfaceToken;
    if (onSurfaceSelect) {
      onSurfaceSelect(surface);
    } else {
      onSurfaceToggle(surface);
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>Surface</span>
      <Select
        value={selectedSurface}
        onChange={handleChange}
        options={SURFACE_OPTIONS}
        size="sm"
        disabled={disabled}
        aria-label="Select surface"
      />
    </div>
  );
}

export default SurfaceSelectionControls;
