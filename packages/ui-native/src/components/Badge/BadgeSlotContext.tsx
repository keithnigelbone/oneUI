/**
 * BadgeSlotContext
 *
 * Native peer of the web `--_slot-icon-size / --_slot-avatar-size /
 * --_slot-counter-size / --_slot-indicator-size` cascade declared in
 * `packages/ui/src/components/Badge/Badge.module.css`.
 *
 * Badge wraps its `start` / `end` slots in `<BadgeSlotSizeProvider value={...}>`
 * so nested `Avatar`, `CounterBadge`, `IndicatorBadge`, and consumer-authored
 * icons can adopt the Figma-correct size for the parent Badge size.
 *
 * Resolution priority (matches web rule
 * "explicit prop > component token > --_slot-* > component default"):
 *   explicit `size` prop  >  `useBadgeSlotSize()`  >  component default
 *
 * Per-Badge-size mapping mirrors `Badge.module.css`'s `data-size` blocks:
 *   xs  → Avatar 2xs, Counter xs, Indicator xs, Icon  8px
 *   s   → Avatar xs,  Counter xs, Indicator xs, Icon 12px
 *   m   → Avatar xs,  Counter xs, Indicator s,  Icon 12px
 *   l   → Avatar s,   Counter m,  Indicator s,  Icon 16px
 *   xl  → Avatar m,   Counter l,  Indicator l,  Icon 20px
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { tokens } from '@oneui/tokens';
import type { AvatarSize } from '../Avatar/interface';
import type { CounterBadgeSize } from '../CounterBadge/interface';
import type { IndicatorBadgeSize } from '../IndicatorBadge/interface';
import type { BadgeSize } from './interface';

export interface BadgeSlotSizes {
  /** Default `Avatar.size` for slot children when their own `size` is unset. */
  avatar: AvatarSize;
  /** Default `CounterBadge.size`. */
  counterBadge: CounterBadgeSize;
  /** Default `IndicatorBadge.size`. */
  indicatorBadge: IndicatorBadgeSize;
  /** Pixel hint for raw icon glyphs in the slot (parity with web `--_slot-icon-size`). */
  iconPx: number;
}

export const BADGE_SLOT_SIZES: Record<BadgeSize, BadgeSlotSizes> = {
  xs: {
    avatar: '2xs',
    counterBadge: 'xs',
    indicatorBadge: 'xs',
    iconPx: tokens.spacing['2'],
  },
  s: {
    avatar: 'xs',
    counterBadge: 'xs',
    indicatorBadge: 'xs',
    iconPx: tokens.spacing['3'],
  },
  m: {
    avatar: 'xs',
    counterBadge: 'xs',
    indicatorBadge: 's',
    iconPx: tokens.spacing['3'],
  },
  l: {
    avatar: 's',
    counterBadge: 'm',
    indicatorBadge: 's',
    iconPx: tokens.spacing['4'],
  },
  xl: {
    avatar: 'm',
    counterBadge: 'l',
    indicatorBadge: 'l',
    iconPx: tokens.spacing['5'],
  },
};

const BadgeSlotSizeContext = createContext<BadgeSlotSizes | null>(null);

export interface BadgeSlotSizeProviderProps {
  value: BadgeSlotSizes;
  children: ReactNode;
}

export function BadgeSlotSizeProvider({
  value,
  children,
}: BadgeSlotSizeProviderProps): React.ReactElement {
  return (
    <BadgeSlotSizeContext.Provider value={value}>{children}</BadgeSlotSizeContext.Provider>
  );
}

/** Returns the parent Badge's slot-size hints, or `null` outside a Badge slot. */
export function useBadgeSlotSize(): BadgeSlotSizes | null {
  return useContext(BadgeSlotSizeContext);
}
