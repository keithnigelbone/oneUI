/**
 * ChipGroup.shared.ts
 * Shared types for ChipGroup component
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ChipSize, ChipAttention, ChipAppearance } from '../Chip/Chip.shared';

export interface ChipGroupProps {
  // ── Selection ────────────────────────────────────────────────────────
  /** Controlled selected values (array of chip `value` strings). */
  value?: string[];
  /** Uncontrolled default selected values. */
  defaultValue?: string[];
  /** Called when the selection changes. */
  onValueChange?: (value: string[]) => void;
  /** Allow multiple chips to be selected simultaneously. Default: false. */
  multiple?: boolean;

  // ── Layout ───────────────────────────────────────────────────────────
  /** Stack direction. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
  /** Whether chips wrap to the next line. Default: true. */
  wrap?: boolean;

  // ── Context propagation (chip-level prop wins if also set) ────────────
  /** Size propagated to all child Chips. */
  size?: ChipSize;
  /** Emphasis level propagated to all child Chips. */
  attention?: ChipAttention;
  /** Appearance propagated to all child Chips. */
  appearance?: ChipAppearance;

  // ── Constraints ──────────────────────────────────────────────────────
  /** Maximum number of chips that can be selected at once (multi-select only). */
  maxSelections?: number;
  /**
   * Prevent deselecting the last selected chip.
   * In controlled mode this blocks the callback; in uncontrolled mode it
   * also prevents the internal state from reaching an empty array.
   */
  required?: boolean;

  // ── Accessibility ────────────────────────────────────────────────────
  /** Disable all chips in the group. */
  disabled?: boolean;
  /** Loop keyboard focus from last item back to first. Default: true (Base UI default). */
  loopFocus?: boolean;
  /** Accessible label for the group element. */
  'aria-label'?: string;
  /** ID of an element that labels this group. */
  'aria-labelledby'?: string;

  // ── Standard ─────────────────────────────────────────────────────────
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}
