/**
 * SliderControl.shared.ts
 * Public types for the editor SliderControl.
 *
 * Value clamping, step snapping, and ARIA plumbing are handled by the
 * underlying `<Slider>` (Base UI), so helpers previously defined here
 * are no longer needed.
 */

import type { ComponentAppearance } from '@oneui/shared';

export interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string; // "px", "°", "%", "ms"
  description?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  /**
   * Multi-accent appearance role forwarded to the underlying `<Slider>`.
   * Defaults to 'auto' (→ secondary, matching Slider's own default).
   */
  appearance?: ComponentAppearance;
}
