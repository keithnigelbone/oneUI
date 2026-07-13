/**
 * DecorationSection.tsx
 *
 * Behavioral controls for ornament decoration in the Advanced Editor.
 * Mirrors the foundations page controls: Placement, Mirror, Height Scale.
 * Only shown when a decoration is active for the component.
 */

'use client';

import React from 'react';
import type { DecorationConfig } from '@oneui/shared';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import styles from './DecorationSection.module.css';

type Placement = 'edges' | 'left' | 'right';

const PLACEMENT_OPTIONS: { value: Placement; label: string }[] = [
  { value: 'edges', label: 'Both Edges' },
  { value: 'left', label: 'Left Only' },
  { value: 'right', label: 'Right Only' },
];

const HEIGHT_SCALE_OPTIONS = [
  { value: '0.5', label: '50%' },
  { value: '0.75', label: '75%' },
  { value: '1', label: '100%' },
];

export interface DecorationSectionProps {
  /** Current decoration config from context */
  decoration: DecorationConfig;
  /** Current height scale value (from token override or default) */
  heightScale?: string;
  /** Callback when placement or mirror changes */
  onDecorationUpdate?: (update: { placement?: Placement; mirror?: boolean }) => void;
  /** Callback when height scale changes (uses token override system) */
  onHeightScaleChange?: (value: string) => void;
  /** Whether the ornament decoration is enabled in preview */
  enabled?: boolean;
  /** Callback to toggle ornament decoration on/off */
  onEnabledChange?: (enabled: boolean) => void;
}

export function DecorationSection({
  decoration,
  heightScale = '1',
  onDecorationUpdate,
  onHeightScaleChange,
  enabled = true,
  onEnabledChange,
}: DecorationSectionProps) {
  const placement = decoration.placement;
  const mirror = decoration.mirror;

  return (
    <div className={styles.section}>
      {/* Enable / Disable toggle */}
      {onEnabledChange && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Visibility</span>
          <ToggleGroup
            value={[enabled ? 'enabled' : 'disabled']}
            onValueChange={(values) => {
              const value = Array.isArray(values) ? values[0] : values;
              if (value === 'enabled') onEnabledChange(true);
              if (value === 'disabled') onEnabledChange(false);
            }}
            size="compact"
            variant="subtool"
          >
            <ToggleGroup.Item value="enabled">Enabled</ToggleGroup.Item>
            <ToggleGroup.Item value="disabled">Disabled</ToggleGroup.Item>
          </ToggleGroup>
        </div>
      )}

      {/* Placement */}
      <div className={styles.controlGroup} data-disabled={!enabled ? '' : undefined}>
        <span className={styles.controlLabel}>Placement</span>
        <ToggleGroup
          value={[placement]}
          onValueChange={(values) => {
            const value = Array.isArray(values) ? values[0] : values;
            if (value) onDecorationUpdate?.({ placement: value as Placement });
          }}
          disabled={!enabled}
          size="compact"
          variant="subtool"
        >
          {PLACEMENT_OPTIONS.map((opt) => (
            <ToggleGroup.Item key={opt.value} value={opt.value} disabled={!enabled}>
              {opt.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      {/* Mirror */}
      <div className={styles.controlGroup} data-disabled={!enabled ? '' : undefined}>
        <span className={styles.controlLabel}>Mirror</span>
        <ToggleGroup
          value={[mirror ? 'mirrored' : 'same']}
          onValueChange={(values) => {
            const value = Array.isArray(values) ? values[0] : values;
            if (value === 'mirrored') onDecorationUpdate?.({ mirror: true });
            if (value === 'same') onDecorationUpdate?.({ mirror: false });
          }}
          disabled={!enabled}
          size="compact"
          variant="subtool"
        >
          <ToggleGroup.Item value="mirrored" disabled={!enabled}>
            Mirrored
          </ToggleGroup.Item>
          <ToggleGroup.Item value="same" disabled={!enabled}>
            Same
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>

      {/* Height Scale */}
      <div className={styles.controlGroup} data-disabled={!enabled ? '' : undefined}>
        <span className={styles.controlLabel}>Height</span>
        <ToggleGroup
          value={[heightScale]}
          onValueChange={(values) => {
            const value = Array.isArray(values) ? values[0] : values;
            if (value) onHeightScaleChange?.(value);
          }}
          disabled={!enabled}
          size="compact"
          variant="subtool"
        >
          {HEIGHT_SCALE_OPTIONS.map((opt) => (
            <ToggleGroup.Item key={opt.value} value={opt.value} disabled={!enabled}>
              {opt.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
