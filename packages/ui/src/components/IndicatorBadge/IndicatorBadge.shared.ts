/**
 * IndicatorBadge.shared.ts
 * Shared types and hooks for IndicatorBadge component
 * Used by both web and React Native implementations
 */

import type { CSSProperties } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { useSlotParentAppearance } from '../../contexts/SlotParentAppearanceContext';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type IndicatorBadgeAppearance = ComponentAppearance;

/** IndicatorBadge sizes */
export type IndicatorBadgeSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface IndicatorBadgeProps {
  /** IndicatorBadge size. Default: 'm'. */
  size?: IndicatorBadgeSize;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: IndicatorBadgeAppearance;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Required accessible label describing the indicator status */
  'aria-label': string;
  /** Test automation id — forwarded to the root `<span role="status">`. */
  'data-testid'?: string;
}

export function useIndicatorBadgeState(props: IndicatorBadgeProps) {
  const parentAppearance = useSurfaceAppearance();
  const slotParent = useSlotParentAppearance();
  const resolvedSize = props.size ?? 'm';

  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> =
    props.appearance != null && props.appearance !== 'auto'
      ? props.appearance
      : (parentAppearance ?? slotParent ?? 'primary');

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': resolvedSize,
    'data-appearance': resolvedAppearance,
  };

  return {
    resolvedSize,
    resolvedAppearance,
    dataAttrs,
  };
}
