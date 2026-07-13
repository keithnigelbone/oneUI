/**
 * DensityConfigTable.tsx
 * Breakpoint-aware density editor. Each endpoint renders as a labelled
 * 3-column field grid (Compact / Default / Open) matching the DIN 1450
 * field layout in PlatformDetailEditor.
 *
 * - 2+ active breakpoints: two endpoint groups (smallest + largest).
 *   Fluid scaling interpolates between them.
 * - 0-1 active breakpoints: one endpoint group, no interpolation.
 */

import { useCallback, useMemo } from 'react';
import { Input } from '@oneui/ui-internal/components/Input';
import type { DensityConfigTableProps, PlatformBreakpoint, PlatformDensityConfig } from './Platforms.shared';
import styles from './DensityConfigTable.module.css';

const DENSITY_LABELS: Record<string, string> = {
  compact: 'Compact',
  default: 'Default',
  open: 'Open',
};

type Endpoint = 'mobile' | 'desktop';

interface DensityEndpointGroupProps {
  heading: string | null;
  endpoint: Endpoint;
  densityConfigs: PlatformDensityConfig[];
  disabled?: boolean;
  onValueChange: (densityIndex: number, endpoint: Endpoint, value: string) => void;
}

function DensityEndpointGroup({
  heading,
  endpoint,
  densityConfigs,
  disabled,
  onValueChange,
}: DensityEndpointGroupProps) {
  return (
    <div className={styles.endpoint}>
      {heading && <p className={styles.endpointHeading}>{heading}</p>}
      <div className={styles.fieldGrid}>
        {densityConfigs.map((config, i) => (
          <div key={config.density} className={styles.field}>
            <label className={styles.fieldLabel}>
              {DENSITY_LABELS[config.density] || config.density}
            </label>
            <Input
              size="m"
              type="number"
              value={String(config[endpoint].baseSize)}
              onChange={(v) => onValueChange(i, endpoint, v)}
              disabled={disabled}
              end={<span className={styles.fieldAffix}>px</span>}
              aria-label={`${config.density} ${endpoint} base size`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatEndpointHeading(bp: PlatformBreakpoint): string {
  return `${bp.label} · ${bp.viewportWidth}px`;
}

export function DensityConfigTable({
  densityConfigs,
  breakpoints,
  onChange,
  disabled,
}: DensityConfigTableProps) {
  const activeBreakpoints = useMemo(
    () =>
      breakpoints
        .filter((bp) => bp.isActive)
        .sort((a, b) => a.viewportWidth - b.viewportWidth),
    [breakpoints],
  );
  const isFluid = activeBreakpoints.length >= 2;

  const handleChange = useCallback(
    (densityIndex: number, endpoint: Endpoint, value: string) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) return;

      const updated = densityConfigs.map((config, i) => {
        if (i !== densityIndex) return config;
        return {
          ...config,
          [endpoint]: {
            ...config[endpoint],
            baseSize: numValue,
          },
        };
      });
      onChange(updated);
    },
    [densityConfigs, onChange],
  );

  if (isFluid) {
    return (
      <div className={styles.wrapper}>
        <DensityEndpointGroup
          heading={formatEndpointHeading(activeBreakpoints[0])}
          endpoint="mobile"
          densityConfigs={densityConfigs}
          disabled={disabled}
          onValueChange={handleChange}
        />
        <DensityEndpointGroup
          heading={formatEndpointHeading(activeBreakpoints[activeBreakpoints.length - 1])}
          endpoint="desktop"
          densityConfigs={densityConfigs}
          disabled={disabled}
          onValueChange={handleChange}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <DensityEndpointGroup
        heading={null}
        endpoint="mobile"
        densityConfigs={densityConfigs}
        disabled={disabled}
        onValueChange={handleChange}
      />
    </div>
  );
}
