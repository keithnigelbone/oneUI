/**
 * Chip.shared.ts
 * Shared types and hooks for Chip component
 * Used by both web and React Native implementations
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { useChipGroupContext } from './ChipContext';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type ChipAppearance = ComponentAppearance;

/** Figma-aligned emphasis level — the only public emphasis prop. */
export type ChipAttention = 'high' | 'medium' | 'low';

/** @internal Visual variant derived from `attention`. Drives `data-variant` / CSS only — not part of the public API. */
export type ChipVariant = 'bold' | 'subtle' | 'ghost';

/** Chip sizes aligned with Figma spec: S, M, L */
export type ChipSize = 's' | 'm' | 'l';

/** Map Figma attention values to internal variant values */
export const ATTENTION_TO_VARIANT: Record<ChipAttention, ChipVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export interface ChipProps {
  /** Text label content */
  children?: ReactNode;
  /** Chip size. Default: 'm'. */
  size?: ChipSize;
  /** Emphasis level — high (filled when selected), medium (tinted when selected), low (outlined). Default: 'high'. */
  attention?: ChipAttention;
  /** Multi-accent appearance role. 'auto' resolves to 'secondary'. */
  appearance?: ChipAppearance;
  /** Selected state (controlled). Maps to Toggle pressed. */
  selected?: boolean;
  /** Default selected state (uncontrolled). Defaults to true. */
  defaultSelected?: boolean;
  /** Called when selected state changes. */
  onSelectedChange?: (selected: boolean, eventDetails?: unknown) => void;
  /** Value for use within ToggleGroup. */
  value?: string;
  /** Whether the chip is disabled. */
  disabled?: boolean;
  /** Content to render before the label (Icon, Avatar, CounterBadge, IndicatorBadge) */
  start?: ReactNode;
  /** Content to render after the label (Icon, Avatar, CounterBadge, IndicatorBadge) */
  end?: ReactNode;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** QA / automation hook on the root toggle button */
  'data-testid'?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useChipState(props: ChipProps) {
  const {
    size: sizeProp,
    attention: attentionProp,
    appearance: appearanceProp,
    disabled,
  } = props;

  // Merge group-level defaults — chip-level props always win
  const groupCtx = useChipGroupContext();
  const size = sizeProp ?? groupCtx.size ?? 'm';
  const attentionFromGroup = groupCtx.attention;
  const appearanceFromGroup = groupCtx.appearance;

  // Resolve attention: chip-level prop → group context → default 'high'.
  // Internal variant is derived from attention alone (drives data-variant / CSS).
  const attention = attentionProp ?? attentionFromGroup;
  const resolvedVariant: ChipVariant = attention ? ATTENTION_TO_VARIANT[attention] : 'bold';

  const parentAppearance = useSurfaceAppearance();
  // Resolve appearance: chip-level prop → group context → default 'secondary'
  const rawAppearance = appearanceProp ?? appearanceFromGroup;
  const resolvedAppearance =
    rawAppearance && rawAppearance !== 'auto'
      ? rawAppearance
      : (parentAppearance ?? 'secondary');

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
  };

  return {
    isDisabled: disabled,
    resolvedVariant,
    resolvedAppearance,
    inheritedFromSurface: parentAppearance !== null,
    dataAttrs,
  };
}
