/**
 * PlatformDetailEditor.tsx
 * Per-platform DIN 1450 parameter editor — three numeric inputs laid out
 * as a single row, with the computed base size shown inline next to the
 * section heading above via the `resultSlot` pattern on PlatformGrid.
 */

import { useCallback } from 'react';
import { calculateDIN1450BaseSize } from '@oneui/shared';
import { Input } from '@oneui/ui-internal/components/Input';
import type { PlatformDetailEditorProps } from './Platforms.shared';
import styles from './PlatformDetailEditor.module.css';

export function PlatformDetailEditor({
  platform,
  onChange,
  disabled,
}: PlatformDetailEditorProps) {
  const handleFieldChange = useCallback(
    (field: 'viewingDistance' | 'ppi' | 'pixelDensity', value: string) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) return;
      const updated = { ...platform, [field]: numValue };
      updated.calculatedBaseSize = calculateDIN1450BaseSize(
        updated.viewingDistance,
        updated.ppi,
        updated.pixelDensity,
      );
      onChange(updated);
    },
    [platform, onChange],
  );

  return (
    <div className={styles.parameterGrid}>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Viewing distance</label>
        <Input
          size="m"
          type="number"
          value={String(platform.viewingDistance)}
          onChange={(v) => handleFieldChange('viewingDistance', v)}
          disabled={disabled}
          end={<span className={styles.fieldAffix}>cm</span>}
          aria-label="Viewing distance in centimeters"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>PPI</label>
        <Input
          size="m"
          type="number"
          value={String(platform.ppi)}
          onChange={(v) => handleFieldChange('ppi', v)}
          disabled={disabled}
          end={<span className={styles.fieldAffix}>px/in</span>}
          aria-label="Pixels per inch"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Pixel density</label>
        <Input
          size="m"
          type="number"
          value={String(platform.pixelDensity)}
          onChange={(v) => handleFieldChange('pixelDensity', v)}
          disabled={disabled}
          end={<span className={styles.fieldAffix}>×</span>}
          aria-label="Pixel density"
        />
      </div>
    </div>
  );
}
