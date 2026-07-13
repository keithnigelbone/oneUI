/**
 * SliderControl.tsx
 * Editor slider control for foundations and agent configuration pages.
 *
 * Wraps the design-system `<Slider>` component (with `knobStyle="inside"`)
 * to provide a labelled header, live value readout, and helper description
 * — the pattern used across every foundation/agent editor.
 */

import { useCallback, memo } from 'react';
import { Slider } from '@oneui/ui-internal/components/Slider';
import styles from './SliderControl.module.css';
import { SliderControlProps } from './SliderControl.shared';

const SliderControlInner: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  description,
  onChange,
  disabled = false,
  showValue = true,
  formatValue,
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  const handleValueChange = useCallback(
    (next: number | number[]) => {
      const scalar = Array.isArray(next) ? next[0] : next;
      onChange(scalar);
    },
    [onChange],
  );

  const containerClassName = [styles.container, disabled && styles.disabled]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {showValue && <span className={styles.value}>{displayValue}</span>}
      </div>

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        knobStyle="inside"
        showTooltip={false}
        disabled={disabled}
        onValueChange={handleValueChange}
        aria-label={label}
      />

      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};

/**
 * Memoized SliderControl to prevent unnecessary re-renders
 * Only re-renders when value, label, or other props actually change
 */
export const SliderControl = memo(SliderControlInner);
