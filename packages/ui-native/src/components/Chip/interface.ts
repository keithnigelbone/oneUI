/**
 * Chip interface (native)
 * Semantic source: packages/ui/src/components/Chip/Chip.shared.ts
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import { useChipGroupContext } from './ChipContext';

export type ChipAppearance = ComponentAppearance;

export type ChipAttention = 'high' | 'medium' | 'low';

export type ChipVariant = 'bold' | 'subtle' | 'ghost';

export type ChipSize = 's' | 'm' | 'l';

const ATTENTION_TO_VARIANT: Record<ChipAttention, ChipVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export interface ChipProps {
  children?: ReactNode;
  size?: ChipSize;
  variant?: ChipVariant;
  attention?: ChipAttention;
  appearance?: ChipAppearance;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean, eventDetails?: unknown) => void;
  value?: string;
  disabled?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  'aria-label'?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
}

export function resolveChipTokenAppearance(
  appearanceProp: ChipAppearance | undefined,
  resolvedAppearance: Exclude<ComponentAppearance, 'auto'>,
  surfaceAppearance: Exclude<ComponentAppearance, 'auto'> | null,
): Exclude<ComponentAppearance, 'auto'> {
  if (appearanceProp != null && appearanceProp !== 'auto') {
    return resolvedAppearance;
  }
  return surfaceAppearance ?? 'primary';
}

export function useChipState(props: ChipProps) {
  const {
    size: sizeProp,
    variant: variantProp,
    attention,
    appearance: appearanceProp,
    disabled,
  } = props;

  const groupCtx = useChipGroupContext();
  const size = sizeProp ?? groupCtx.size ?? 'm';
  const variantFromGroup = groupCtx.variant;
  const appearanceFromGroup = groupCtx.appearance;

  const resolvedVariant: ChipVariant =
    variantProp ?? variantFromGroup ?? (attention ? ATTENTION_TO_VARIANT[attention] : 'ghost');

  const rawAppearance = appearanceProp ?? appearanceFromGroup;
  const resolvedAppearance = rawAppearance === 'auto' || !rawAppearance ? 'secondary' : rawAppearance;

  return {
    size,
    isDisabled: Boolean(disabled) || Boolean(groupCtx.disabled),
    resolvedVariant,
    resolvedAppearance,
  };
}

/** Invokes `onSelectedChange` with selected state and optional press event details. */
export function invokeChipSelectedChange(
  onSelectedChange: ChipProps['onSelectedChange'],
  nextSelected: boolean,
  eventDetails?: unknown,
): void {
  onSelectedChange?.(nextSelected, eventDetails);
}

export function resolveChipAccessibilityLabel(
  props: Pick<ChipProps, 'aria-label' | 'children'>,
): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  const { children } = props;
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  return undefined;
}

export function getChipAccessibilityProps(
  props: Pick<ChipProps, 'aria-label' | 'children' | 'accessibilityHint'>,
  state: { isSelected: boolean; isDisabled: boolean },
): {
  accessible: boolean;
  focusable: boolean;
  accessibilityRole: 'button';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean; selected: boolean };
} {
  const accessibilityLabel = resolveChipAccessibilityLabel(props);
  return {
    accessible: true,
    focusable: true,
    accessibilityRole: 'button',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      disabled: state.isDisabled,
      selected: state.isSelected,
    },
  };
}
