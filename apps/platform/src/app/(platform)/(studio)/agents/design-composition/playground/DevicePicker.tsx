/**
 * DevicePicker.tsx
 *
 * Compact breakpoint picker for the canvas stage. Built on the design-system
 * Select so the chrome stays consistent with the rest of the studio. Picking
 * "Custom" reveals an Input for arbitrary widths.
 */

'use client';

import { useState } from 'react';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { Input } from '@oneui/ui/components/Input';
import s from './playground.module.css';

export interface DeviceSpec {
  label: string;
  width: number;
  height?: number;
}

export const DEVICE_PRESETS: DeviceSpec[] = [
  { label: 'Mobile', width: 390, height: 844 },
  { label: 'Tablet', width: 768, height: 1024 },
  { label: 'Desktop', width: 1280 },
  { label: 'Wide', width: 1680 },
];

const CUSTOM_LABEL = 'Custom';

const PICKER_OPTIONS: SelectOption<string>[] = [
  ...DEVICE_PRESETS.map((p) => ({ value: p.label, label: p.label })),
  { value: CUSTOM_LABEL, label: CUSTOM_LABEL },
];

export interface DevicePickerProps {
  value: DeviceSpec;
  onChange: (device: DeviceSpec) => void;
}

export function DevicePicker({ value, onChange }: DevicePickerProps) {
  const isPreset = DEVICE_PRESETS.some((p) => p.label === value.label);
  const segmentValue = isPreset ? value.label : CUSTOM_LABEL;
  const [customWidth, setCustomWidth] = useState<string>(String(value.width));

  const handleSelectChange = (label: string) => {
    if (label === CUSTOM_LABEL) {
      const n = Number(customWidth);
      if (Number.isFinite(n) && n >= 240 && n <= 3840) {
        onChange({ label: `Custom ${n}`, width: n });
      }
      return;
    }
    const preset = DEVICE_PRESETS.find((p) => p.label === label);
    if (preset) onChange(preset);
  };

  const commitCustom = () => {
    const n = Number(customWidth);
    if (Number.isFinite(n) && n >= 240 && n <= 3840) {
      onChange({ label: `Custom ${n}`, width: n });
    }
  };

  return (
    <div className={s.devicePicker} role="group" aria-label="Device size">
      <Select
        size="sm"
        value={segmentValue}
        onChange={handleSelectChange}
        options={PICKER_OPTIONS}
        aria-label="Device preset"
        className={s.devicePickerSelect}
      />
      {segmentValue === CUSTOM_LABEL && (
        <div className={s.devicePickerCustom}>
          <Input
            type="number"
            value={customWidth}
            onChange={setCustomWidth}
            onBlur={commitCustom}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            className={s.devicePickerInput}
            aria-label="Custom width in pixels"
          />
          <span className={s.devicePickerUnit}>px</span>
        </div>
      )}
    </div>
  );
}
