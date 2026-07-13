/**
 * Icon.shared.ts
 * Shared types and hooks for the design-system Icon component
 * Used by both web and React Native implementations
 *
 * Figma component properties (node 2342:40776):
 * - size: 20 values mapped to spacing variable modes (2–40)
 * - appearance: 8 colour roles (variable mode)
 * - emphasis: 5 on-colour token levels (colour token)
 */

import type { CSSProperties, ReactElement } from 'react';
import type { ComponentIconInput } from '@oneui/shared';
import { useSlotParentAppearance, type SlotParentAppearance } from '../../contexts/SlotParentAppearanceContext';
import { useSurfaceAppearance } from '../Surface';

/**
 * Icon size — 20 presets matching Figma spacing variable indices.
 * Each maps directly to the matching numeric Spacing token.
 *
 * Example: size '8' uses --Spacing-8; size '32' uses --Spacing-32.
 */
export type IconSize =
  | '2' | '2.5' | '3' | '3.5' | '4' | '4.5' | '5'
  | '6' | '7' | '8' | '9' | '10'
  | '12' | '14' | '16' | '18' | '20'
  | '24' | '32' | '40';

/** All valid icon sizes in order */
export const ICON_SIZES: readonly IconSize[] = [
  '2', '2.5', '3', '3.5', '4', '4.5', '5',
  '6', '7', '8', '9', '10',
  '12', '14', '16', '18', '20',
  '24', '32', '40',
];

/**
 * Appearance roles — 8 roles from Figma spec.
 * Determines which V4 colour role tokens the icon reads.
 */
export type IconAppearance =
  | 'neutral' | 'primary' | 'secondary'
  | 'sparkle' | 'negative' | 'positive'
  | 'warning' | 'informative';

/**
 * Emphasis level — determines icon colour prominence.
 * Maps to V4 on-colour tokens within the selected appearance role.
 *
 * high       → --{Role}-High        (strongest contrast)
 * medium     → --{Role}-Medium-Text  (medium text contrast)
 * low        → --{Role}-Low     (subtle text contrast)
 * tinted     → --{Role}-Tinted       (accent tint colour)
 * tintedA11y → --{Role}-TintedA11y  (WCAG AA accent colour)
 */
export type IconEmphasis = 'high' | 'medium' | 'low' | 'tinted' | 'tintedA11y';

export interface IconProps {
  /** Icon to display — semantic name, pack id, component, or React element */
  icon: ComponentIconInput | ReactElement;
  /** Size preset (spacing index). Default: '5' (20px) */
  size?: IconSize;
  /** Colour role. Omitted → slot parent → nearest Surface → neutral. */
  appearance?: IconAppearance;
  /** Colour emphasis level. Default: 'high' */
  emphasis?: IconEmphasis;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessible label — if provided, icon is not decorative */
  'aria-label'?: string;
  /** Whether icon is hidden from assistive technology. Default: true (decorative) */
  'aria-hidden'?: boolean;
  /** QA / Playwright hook — forwarded to the root span */
  'data-testid'?: string;
}

/** Map full component roles to Icon’s 8 appearance roles (no `brand-bg` glyph scale). */
function roleToIconAppearance(role: SlotParentAppearance): IconAppearance {
  if (role === 'brand-bg') return 'primary';
  return role as IconAppearance;
}

/**
 * Resolve Icon appearance:
 * explicit prop → slot parent (Button/Badge) → nearest Surface → neutral.
 */
export function resolveIconAppearance(
  appearanceProp: IconAppearance | undefined,
  slotParent: SlotParentAppearance | null,
  surfaceAppearance: SlotParentAppearance | null,
): IconAppearance {
  if (appearanceProp !== undefined) return appearanceProp;
  if (slotParent != null) return roleToIconAppearance(slotParent);
  if (surfaceAppearance != null) return roleToIconAppearance(surfaceAppearance);
  return 'neutral';
}

/**
 * Resolve Icon state from props.
 * Returns resolved values and data attributes.
 */
export function useIconState(props: IconProps) {
  const slotParent = useSlotParentAppearance();
  const surfaceAppearance = useSurfaceAppearance();
  const {
    size = '5',
    appearance: appearanceProp,
    emphasis = 'high',
  } = props;

  const resolvedAppearance = resolveIconAppearance(
    appearanceProp,
    slotParent,
    surfaceAppearance,
  );

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-appearance': resolvedAppearance,
    'data-emphasis': emphasis,
  };

  return {
    resolvedSize: size,
    resolvedAppearance,
    resolvedEmphasis: emphasis,
    dataAttrs,
  };
}
