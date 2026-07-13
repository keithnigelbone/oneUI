/**
 * NumberField.shared.ts
 * Shared types and hooks for NumberField component
 */

export type NumberFieldSize = 'small' | 'medium' | 'large';

export interface NumberFieldProps {
  /** Current value (controlled) */
  value?: number | null;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Called when value changes */
  onValueChange?: (value: number | null) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Large step increment (Shift+Arrow) */
  largeStep?: number;
  /** Label text */
  label?: string;
  /** Size preset */
  size?: NumberFieldSize;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Field name */
  name?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class name */
  className?: string;
}

export function useNumberFieldState(props: NumberFieldProps) {
  return {
    isDisabled: props.disabled,
  };
}
