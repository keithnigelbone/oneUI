/**
 * PreviewControls.tsx
 *
 * The shared "settings" section for foundation preview demos (Dimension, Grid,
 * Shapes…). A sticky control bar: viewport slider + presets, an optional row of
 * chip fields (scaling / density / …) and an optional row of low-emphasis
 * readouts (base size / active breakpoint / columns…).
 *
 * This is the ONE control section — every page that needs viewport-driven
 * preview controls renders it so the layout, spacing and sticky behaviour stay
 * identical everywhere. Pages supply their own `fields` and `readouts`.
 */

'use client';

import { type ReactNode } from 'react';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Chip } from '@oneui/ui/components/Chip';
import { Slider } from '@oneui/ui-internal/components/Slider';
import styles from './PreviewControls.module.css';

export interface PreviewControlsField {
  /** Visible field label. */
  label: string;
  /** Currently-selected chip value. */
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  /** ChipGroup appearance. Omit for the default (primary) highlight. */
  appearance?: 'neutral' | 'primary';
}

export interface PreviewControlsReadout {
  label: string;
  value: ReactNode;
}

export interface PreviewControlsProps {
  viewport: number;
  minViewport: number;
  maxViewport: number;
  presets: number[];
  onViewportChange: (v: number) => void;
  /** Chip fields rendered below the slider (e.g. Scaling, Density). */
  fields?: PreviewControlsField[];
  /** Low-emphasis readouts (e.g. Base size, Active breakpoint). */
  readouts?: PreviewControlsReadout[];
}

export function PreviewControls({
  viewport,
  minViewport,
  maxViewport,
  presets,
  onViewportChange,
  fields = [],
  readouts = [],
}: PreviewControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.viewportBlock}>
        <div className={styles.viewportHeader}>
          <span className={styles.fieldLabel}>Viewport</span>
          <span className={styles.readoutValue}>{viewport}px</span>
        </div>
        <Slider
          value={viewport}
          min={minViewport}
          max={maxViewport}
          step={1}
          knobStyle="inside"
          showTooltip={false}
          onValueChange={(v) => onViewportChange(Array.isArray(v) ? v[0] : v)}
          aria-label="Viewport"
        />
        <ChipGroup
          value={[String(viewport)]}
          onValueChange={(v) => v[0] && onViewportChange(Number(v[0]))}
          required
          size="s"
          appearance="neutral"
          aria-label="Viewport presets"
        >
          {presets.map((p) => (
            <Chip key={p} value={String(p)}>
              {p}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {fields.length > 0 && (
        <div className={styles.chipRow}>
          {fields.map((f) => (
            <div key={f.label} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <ChipGroup
                value={[f.value]}
                onValueChange={(v) => v[0] && f.onChange(v[0])}
                required
                size="s"
                appearance={f.appearance}
                aria-label={f.label}
              >
                {f.options.map((o) => (
                  <Chip key={o.value} value={o.value}>
                    {o.label}
                  </Chip>
                ))}
              </ChipGroup>
            </div>
          ))}
        </div>
      )}

      {readouts.length > 0 && (
        <div className={styles.readoutRow}>
          {readouts.map((r) => (
            <div key={r.label} className={styles.field}>
              <span className={styles.fieldLabel}>{r.label}</span>
              <span className={styles.readoutValueLow}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
