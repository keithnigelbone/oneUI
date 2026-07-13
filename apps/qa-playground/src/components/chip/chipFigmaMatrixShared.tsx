import type { ReactNode } from 'react';
import type { ChipSize } from '@oneui/ui/components/Chip';
import { Icon } from '@oneui/ui/components/Icon';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';

/**
 * Figma COMPONENT_SET size column order (not alphabetical): M → S → L.
 * Bracket steps match Checkbox / Stepper QA showcases.
 */
export const FIGMA_SIZE_ORDER: { figma: 'M' | 'S' | 'L'; bracket: string; size: ChipSize }[] = [
  { figma: 'M', bracket: '5', size: 'm' },
  { figma: 'S', bracket: '4', size: 's' },
  { figma: 'L', bracket: '6', size: 'l' },
];

export function iconSizeForChip(size: ChipSize): '3' | '4' | '5' {
  if (size === 's') return '3';
  if (size === 'l') return '5';
  return '4';
}

export function indicatorSizeForChip(size: ChipSize): 's' | 'l' {
  return size === 'l' ? 'l' : 's';
}

/** Figma size row: start Icon (heart) + Label + end IndicatorBadge (dot). */
export function figmaSizeRowSlots(size: ChipSize): { start: ReactNode; end: ReactNode } {
  return {
    start: <Icon icon="heart" size={iconSizeForChip(size)} aria-hidden />,
    end: (
      <IndicatorBadge
        size={indicatorSizeForChip(size)}
        appearance="negative"
        aria-label="Status"
      />
    ),
  };
}
