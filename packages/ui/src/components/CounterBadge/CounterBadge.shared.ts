/**
 * CounterBadge.shared.ts
 * Shared types and hooks for CounterBadge component
 * Used by both web and React Native implementations
 */

import type { CSSProperties } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { useSlotParentAppearance } from '../../contexts/SlotParentAppearanceContext';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type CounterBadgeAppearance = ComponentAppearance;

/** Figma-aligned attention level — the only public emphasis prop. */
export type CounterBadgeAttention = 'high' | 'medium' | 'low';

/** @internal Visual variant derived from `attention`. Drives `data-variant` + CSS class. Not part of the public API. */
export type CounterBadgeVariant = 'bold' | 'subtle' | 'ghost';

export type CounterBadgeSize = 'xs' | 's' | 'm' | 'l';

/** Map Figma attention values to code variant values */
const ATTENTION_TO_VARIANT: Record<CounterBadgeAttention, CounterBadgeVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export interface CounterBadgeProps {
  /** Numeric value to display */
  value: number;
  /** Maximum value before showing overflow (e.g., "99+"). Default: 99 */
  max?: number;
  /** Whether to show the badge when value is 0. Default: false */
  showZero?: boolean;
  /** CounterBadge size. Default: 'm' */
  size?: CounterBadgeSize;
  /** Figma attention level — high (bold fill), medium (subtle/tinted fill), low (ghost/transparent). Default: 'high'. */
  attention?: CounterBadgeAttention;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: CounterBadgeAppearance;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** Test automation id — forwarded to the root `<span role="status">`. */
  'data-testid'?: string;
}

export function useCounterBadgeState(props: CounterBadgeProps) {
  const slotParent = useSlotParentAppearance();
  const {
    value,
    max = 99,
    showZero = false,
    size = 'm',
    attention,
    appearance,
  } = props;

  // Derive the internal visual variant from attention alone (default high -> bold).
  const resolvedVariant: CounterBadgeVariant = attention ? ATTENTION_TO_VARIANT[attention] : 'bold';

  // Resolve appearance: explicit role wins; else slot parent; else primary
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> =
    appearance != null && appearance !== 'auto' ? appearance : (slotParent ?? 'primary');

  // Compute display value
  const isHidden = value === 0 && !showZero;
  let displayValue = '';
  if (!isHidden) {
    displayValue = value > max ? `${max}+` : String(value);
  }

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
  };

  return {
    resolvedVariant,
    resolvedAppearance,
    displayValue,
    isHidden,
    dataAttrs,
  };
}
