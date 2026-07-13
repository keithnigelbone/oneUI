/**
 * BreakpointEditor.tsx
 * Compact list of breakpoints. Each row is a single horizontal line:
 *
 *   [☐] Name ──────────────── Width px [×]              (digital-responsive)
 *   [☐] Name ─────── W × H units [×]                    (print / physical / digital-fixed)
 *
 * Drag handles and the viewport ruler were removed in an earlier pass —
 * responsive breakpoints sort automatically by width, and the row widths
 * are already visible in the input itself. For non-responsive categories
 * the order is cosmetic.
 */

import { useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import type { PlatformBreakpoint } from '@oneui/shared';
import { Input } from '@oneui/ui-internal/components/Input';
import { Select } from '@oneui/ui-internal/components/Select';
import { Checkbox } from '@oneui/ui-internal/components/Checkbox';
import { IconButton } from '@oneui/ui-internal/components/IconButton';
import { Button } from '@oneui/ui-internal/components/Button';
import type { BreakpointEditorProps } from './Platforms.shared';
import styles from './BreakpointEditor.module.css';

export function BreakpointEditor({
  breakpoints,
  onChange,
  disabled,
  category = 'digital-responsive',
}: BreakpointEditorProps) {
  const isResponsive = category === 'digital-responsive';

  const handleToggle = useCallback(
    (index: number) => {
      const updated = [...breakpoints];
      updated[index] = { ...updated[index], isActive: !updated[index].isActive };
      onChange(updated);
    },
    [breakpoints, onChange],
  );

  const handleLabelChange = useCallback(
    (index: number, value: string) => {
      const updated = [...breakpoints];
      updated[index] = { ...updated[index], label: value };
      onChange(updated);
    },
    [breakpoints, onChange],
  );

  const handleWidthChange = useCallback(
    (index: number, value: string) => {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue <= 0) return;
      const updated = [...breakpoints];
      updated[index] = { ...updated[index], viewportWidth: numValue };
      onChange(updated);
    },
    [breakpoints, onChange],
  );

  const handleHeightChange = useCallback(
    (index: number, value: string) => {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue <= 0) {
        if (value === '') {
          const updated = [...breakpoints];
          updated[index] = { ...updated[index], viewportHeight: undefined };
          onChange(updated);
        }
        return;
      }
      const updated = [...breakpoints];
      updated[index] = { ...updated[index], viewportHeight: numValue };
      onChange(updated);
    },
    [breakpoints, onChange],
  );

  const handleUnitsChange = useCallback(
    (index: number, value: 'px' | 'mm') => {
      const updated = [...breakpoints];
      updated[index] = { ...updated[index], units: value };
      onChange(updated);
    },
    [breakpoints, onChange],
  );

  const handleAdd = useCallback(() => {
    const lastBp = breakpoints[breakpoints.length - 1];
    const nextWidth = lastBp ? lastBp.viewportWidth + 200 : 360;
    const newBp: PlatformBreakpoint = {
      id: `custom-${nextWidth}`,
      label: `Custom ${nextWidth}`,
      viewportWidth: nextWidth,
      isActive: true,
      ...(isResponsive ? {} : { units: 'px' }),
    };
    onChange([...breakpoints, newBp]);
  }, [breakpoints, onChange, isResponsive]);

  const handleRemove = useCallback(
    (index: number) => {
      const updated = breakpoints.filter((_, i) => i !== index);
      onChange(updated);
    },
    [breakpoints, onChange],
  );

  return (
    <div className={styles.editor}>
      <div className={styles.list}>
        {breakpoints.map((bp, index) => (
          <div
            key={bp.id}
            className={[
              styles.row,
              !bp.isActive && styles.rowInactive,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Checkbox
              size="m"
              checked={bp.isActive}
              onCheckedChange={() => handleToggle(index)}
              disabled={disabled}
              aria-label={`Enable ${bp.label} breakpoint`}
            />
            <div className={styles.nameField}>
              <Input
                size="m"
                value={bp.label}
                placeholder="Name"
                onChange={(v) => handleLabelChange(index, v)}
                disabled={disabled}
                aria-label={`${bp.label} breakpoint name`}
              />
            </div>
            <div className={styles.dimensions}>
              <Input
                size="m"
                type="number"
                className={styles.numericInput}
                value={String(bp.viewportWidth)}
                placeholder="Width"
                onChange={(v) => handleWidthChange(index, v)}
                disabled={disabled}
                end={isResponsive ? <span className={styles.unitAffix}>px</span> : undefined}
                aria-label={`${bp.label} width`}
              />
              {!isResponsive && (
                <>
                  <span className={styles.dimensionsSeparator} aria-hidden>
                    ×
                  </span>
                  <Input
                    size="m"
                    type="number"
                    className={styles.numericInput}
                    value={bp.viewportHeight !== undefined ? String(bp.viewportHeight) : ''}
                    placeholder="Height"
                    onChange={(v) => handleHeightChange(index, v)}
                    disabled={disabled}
                    aria-label={`${bp.label} height`}
                  />
                  <div className={styles.unitsSelect}>
                    <Select
                      size="md"
                      value={bp.units ?? 'px'}
                      onChange={(value) => handleUnitsChange(index, value as 'px' | 'mm')}
                      options={[
                        { value: 'px', label: 'px' },
                        { value: 'mm', label: 'mm' },
                      ]}
                      aria-label={`${bp.label} units`}
                    />
                  </div>
                </>
              )}
            </div>
            <IconButton
              size="s"
              appearance="neutral"
              attention="low"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              aria-label={`Remove ${bp.label} breakpoint`}
              icon={<X size={14} />}
            />
          </div>
        ))}
      </div>

      <div className={styles.addRow}>
        <Button
          size="s"
          attention="low"
          appearance="neutral"
          onClick={handleAdd}
          disabled={disabled}
          start={<Plus size={14} />}
        >
          Add breakpoint
        </Button>
      </div>
    </div>
  );
}
