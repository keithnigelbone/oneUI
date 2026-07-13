/**
 * Shared types for ColorScaleRow component
 */

/**
 * Individual step in a color scale
 */
export interface ColorScaleStep {
  step: number | string;
  hex: string;
  oklch?: string;
  isBase?: boolean;
}

/**
 * Props for ColorScaleRow component
 */
export interface ColorScaleRowProps {
  /** Scale name (e.g., "Primary", "Red") */
  name: string;
  /** Array of 25 color steps */
  steps: ColorScaleStep[];
  /** Base step identifier (e.g., "1300" or 1300) */
  baseStep?: string | number;
  /** Source of the scale (preset or custom) - shown below name */
  source?: 'preset' | 'custom';
  /** Whether this row is currently selected */
  isSelected?: boolean;
  /** Whether this scale is the active brand scale */
  isActive?: boolean;
  /** Called when row is selected/deselected */
  onSelect?: () => void;
  /** Called when edit button is clicked */
  onEdit?: () => void;
  /** Called when delete button is clicked */
  onDelete?: () => void;
  /** Whether to show checkbox for selection */
  showCheckbox?: boolean;
  /** Whether to show edit/delete actions */
  showActions?: boolean;
  /** Whether the row is disabled */
  disabled?: boolean;
  /** Whether to show step numbers on hover */
  showStepNumbers?: boolean;
  /** Compact mode - smaller row height */
  compact?: boolean;
}
