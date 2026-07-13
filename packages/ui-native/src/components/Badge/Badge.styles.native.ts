/**
 * Badge.styles.native.ts
 *
 * **Slot outer padding matrices & combinations:** `docs/badge-native-slot-padding.md`
 *
 * RN peer of `packages/ui/src/components/Badge/Badge.module.css`.
 *
 * Mapping ↔ Badge.module.css:
 *   .badge[data-size='xs'…'xl']  →  styles.containerXS / S / M / L / XL
 *   .start  / .end                →  styles.slotLeft{Size} / slotRight{Size}
 *   --_bg-bold / --_bg-subtle     →  inline paint via useSurfaceTokens
 *   font-size / line-height       →  useTypographyTokens('label', SIZE_TO_LABEL[size],
 *                                  { emphasis: 'medium' }) — line-height `ceil(fontSize × 1.25)`.
 *
 * Per-size dimensions follow web's `--Spacing-*` / shape chain (numeric spacing keys):
 *   minHeight: Spacing-3 / 4 / 5 / 6 / 8 (minimum outer box)
 *   padH:      Spacing-1 / 1 / 1-5 / 2 / 1-5
 *   padV:      Spacing-0-5 (`xs`…`l`); **`xl`** uses Spacing-1 (tighter than horizontal — not 1:1 with padH)
 *   gap:       Spacing-0-5 / 0-5 / 1 / 1 / 1-5
 *   radius:    Shape-1 / 1 / 1-5 / 2 / 2-5 (same px as Spacing-1 … 2-5)
 *
 * Slot-aware outer padding (`resolveBadgeContainerPadding`):
 *   Icon-only slots: `slotPaddingStart` / `End` / `Both`.
 *   Start/end asymmetry vs `Mixed`/`Nested` documented in Slot-type combination below.
 *
 * Slot-type combination (`resolveBadgeContainerPadding`):
 *   Mixed **both** slots only — icon+`CounterBadge`/`IndicatorBadge` vs nested-only / icon-only:
 *
 *   Situation | Padding
 *   ---------|---------
 *   no slots | PAD_H / PAD_V
 *   both slots, icon start + badge end | `slotPaddingMixedIconStartBadgeEnd` (L xs/s `0-5` R `1`; xl TB `1`, L `1-5` R `2-5`; …)
 *   both slots, badge start + icon end | mirror `slotPaddingMixedBadgeStartIconEnd`
 *   any slot has nested badge, but not above mix (single badge slot, or badge+badge) | `slotPaddingNestedBadge`
 *   both icon | `slotPaddingBoth`
 *   icon start only / end only | `slotPaddingStart` / `End` (**xl** TB matches `PAD_V.xl`)
 *
 * Root of slot must be badge for `*IsBadge`; wrapper `View` ⇒ icon.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { BadgeSize } from './interface';

const HEIGHT = {
  xs: tokens.spacing['3'],
  s: tokens.spacing['4'],
  m: tokens.spacing['5'],
  l: tokens.spacing['6'],
  xl: tokens.spacing['8'],
} as const;

const PAD_H = {
  xs: tokens.spacing['1'],
  s: tokens.spacing['1'],
  m: tokens.spacing['1-5'],
  l: tokens.spacing['2'],
  xl: tokens.spacing['2-5'],
} as const;

/** Vertical inset — smaller than `PAD_H` (native layout; not symmetric with horizontal). */
const PAD_V = {
  xs: tokens.spacing['0-5'],
  s: tokens.spacing['0-5'],
  m: tokens.spacing['0-5'],
  l: tokens.spacing['0-5'],
  xl: tokens.spacing['1'],
} as const;

const GAP = {
  xs: tokens.spacing['0-5'],
  s: tokens.spacing['0-5'],
  m: tokens.spacing['1'],
  l: tokens.spacing['1'],
  xl: tokens.spacing['1-5'],
} as const;

export const RADIUS = {
  xs: tokens.spacing['1'],
  s: tokens.spacing['1'],
  m: tokens.spacing['1-5'],
  l: tokens.spacing['2'],
  xl: tokens.spacing['2-5'],
} as const;

/** Map Badge size → Label typography size key (web's `var(--Label-{N}-FontSize)`). */
export const SIZE_TO_LABEL: Record<BadgeSize, '3XS' | '2XS' | 'XS' | 'S' | 'M'> = {
  xs: '3XS',
  s: '2XS',
  m: 'XS',
  l: 'S',
  xl: 'M',
};

const SLOT_PAD_V = tokens.spacing['0-5'];

export interface BadgeSlotPaddingFlags {
  /** `start` slot root is `IndicatorBadge` / `CounterBadge`. */
  startIsBadge: boolean;
  /** `end` slot root is `IndicatorBadge` / `CounterBadge`. */
  endIsBadge: boolean;
}

/** Icon start + nested badge end — both slots; TB `0-5` (xl `1`). */
function slotPaddingMixedIconStartBadgeEnd(size: BadgeSize): ViewStyle {
  const v = {
    paddingTop: SLOT_PAD_V,
    paddingBottom: SLOT_PAD_V,
  };
  switch (size) {
    case 'xs':
    case 's':
      return {
        ...v,
        paddingLeft: tokens.spacing['0-5'],
        paddingRight: tokens.spacing['1'],
      };
    case 'm':
      return {
        ...v,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['1-5'],
      };
    case 'l':
      return {
        ...v,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['2'],
      };
    case 'xl': {
      const padVxl = tokens.spacing['1'];
      return {
        paddingTop: padVxl,
        paddingBottom: padVxl,
        paddingLeft: tokens.spacing['1-5'],
        paddingRight: tokens.spacing['2-5'],
      };
    }
  }
}

/** Nested badge start + icon end — both slots; TB `0-5` (xl `1`); L/R swapped vs `slotPaddingMixedIconStartBadgeEnd`. */
function slotPaddingMixedBadgeStartIconEnd(size: BadgeSize): ViewStyle {
  const v = {
    paddingTop: SLOT_PAD_V,
    paddingBottom: SLOT_PAD_V,
  };
  switch (size) {
    case 'xs':
    case 's':
      return {
        ...v,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['0-5'],
      };
    case 'm':
      return {
        ...v,
        paddingLeft: tokens.spacing['1-5'],
        paddingRight: tokens.spacing['1'],
      };
    case 'l':
      return {
        ...v,
        paddingLeft: tokens.spacing['2'],
        paddingRight: tokens.spacing['1'],
      };
    case 'xl': {
      const padVxl = tokens.spacing['1'];
      return {
        paddingTop: padVxl,
        paddingBottom: padVxl,
        paddingLeft: tokens.spacing['2-5'],
        paddingRight: tokens.spacing['1-5'],
      };
    }
  }
}

function slotPaddingNestedBadge(size: BadgeSize): ViewStyle {
  const v = {
    paddingTop: SLOT_PAD_V,
    paddingBottom: SLOT_PAD_V,
  };
  switch (size) {
    case 'xs':
    case 's':
      return {
        ...v,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['1'],
      };
    case 'm':
      return {
        ...v,
        paddingLeft: tokens.spacing['1-5'],
        paddingRight: tokens.spacing['1-5'],
      };
    case 'l':
      return {
        ...v,
        paddingLeft: tokens.spacing['2'],
        paddingRight: tokens.spacing['2'],
      };
    case 'xl':
      return {
        paddingTop: tokens.spacing['1'],
        paddingBottom: tokens.spacing['1'],
        paddingLeft: tokens.spacing['2-5'],
        paddingRight: tokens.spacing['2-5'],
      };
  }
}

/** Icon slot — start only (`xl` TB `PAD_V.xl`; `l` differs from `m`). */
function slotPaddingStart(size: BadgeSize): ViewStyle {
  const v = {
    paddingTop: SLOT_PAD_V,
    paddingBottom: SLOT_PAD_V,
  };
  switch (size) {
    case 'xs':
    case 's':
      return {
        ...v,
        paddingLeft: tokens.spacing['0-5'],
        paddingRight: tokens.spacing['1'],
      };
    case 'm':
      return {
        ...v,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['1-5'],
      };
    case 'l':
      return {
        ...v,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['2'],
      };
    case 'xl':
      return {
        paddingTop: PAD_V.xl,
        paddingBottom: PAD_V.xl,
        paddingLeft: tokens.spacing['1-5'],
        paddingRight: tokens.spacing['2-5'],
      };
  }
}

/** Icon slot — end only (mirror of `slotPaddingStart`; same `xl` TB). */
function slotPaddingEnd(size: BadgeSize): ViewStyle {
  const v = {
    paddingTop: SLOT_PAD_V,
    paddingBottom: SLOT_PAD_V,
  };
  switch (size) {
    case 'xs':
    case 's':
      return {
        ...v,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['0-5'],
      };
    case 'm':
      return {
        ...v,
        paddingLeft: tokens.spacing['1-5'],
        paddingRight: tokens.spacing['1'],
      };
    case 'l':
      return {
        ...v,
        paddingLeft: tokens.spacing['2'],
        paddingRight: tokens.spacing['1'],
      };
    case 'xl':
      return {
        paddingTop: PAD_V.xl,
        paddingBottom: PAD_V.xl,
        paddingLeft: tokens.spacing['2-5'],
        paddingRight: tokens.spacing['1-5'],
      };
  }
}

/** Icon slot — both; xs/s tighter H `0-5`; m/l symmetric H `1`; xl V `1` H `1-5`. */
function slotPaddingBoth(size: BadgeSize): ViewStyle {
  switch (size) {
    case 'xs':
    case 's':
      return {
        paddingTop: SLOT_PAD_V,
        paddingBottom: SLOT_PAD_V,
        paddingLeft: tokens.spacing['0-5'],
        paddingRight: tokens.spacing['0-5'],
      };
    case 'm':
    case 'l':
      return {
        paddingTop: SLOT_PAD_V,
        paddingBottom: SLOT_PAD_V,
        paddingLeft: tokens.spacing['1'],
        paddingRight: tokens.spacing['1'],
      };
    case 'xl':
      return {
        paddingTop: tokens.spacing['1'],
        paddingBottom: tokens.spacing['1'],
        paddingLeft: tokens.spacing['1-5'],
        paddingRight: tokens.spacing['1-5'],
      };
  }
}

/**
 * Outer badge padding.
 * Pass `BadgeSlotPaddingFlags` from runtime slot inspection (`IndicatorBadge` / `CounterBadge` root).
 */
export function resolveBadgeContainerPadding(
  size: BadgeSize,
  hasStart: boolean,
  hasEnd: boolean,
  flags: BadgeSlotPaddingFlags
): ViewStyle {
  if (!hasStart && !hasEnd) {
    return {
      paddingHorizontal: PAD_H[size],
      paddingVertical: PAD_V[size],
    };
  }

  const startBadge = Boolean(hasStart && flags.startIsBadge);
  const endBadge = Boolean(hasEnd && flags.endIsBadge);

  if (hasStart && hasEnd && !startBadge && endBadge) {
    return slotPaddingMixedIconStartBadgeEnd(size);
  }
  if (hasStart && hasEnd && startBadge && !endBadge) {
    return slotPaddingMixedBadgeStartIconEnd(size);
  }

  if (startBadge || endBadge) {
    return slotPaddingNestedBadge(size);
  }

  if (hasStart && hasEnd) return slotPaddingBoth(size);
  if (hasStart) return slotPaddingStart(size);
  return slotPaddingEnd(size);
}

export const styles = StyleSheet.create({
  // .badge — flex layout
  containerBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  /** ReactElement `children` wrapper — no label typography; child owns visuals + a11y. */
  content: {
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerXS: {
    minHeight: HEIGHT.xs,
    minWidth: HEIGHT.xs,
    borderRadius: RADIUS.xs,
  },
  containerS: {
    minHeight: HEIGHT.s,
    minWidth: HEIGHT.s,
    borderRadius: RADIUS.s,
  },
  containerM: {
    minHeight: HEIGHT.m,
    minWidth: HEIGHT.m,
    borderRadius: RADIUS.m,
  },
  containerL: {
    minHeight: HEIGHT.l,
    minWidth: HEIGHT.l,
    borderRadius: RADIUS.l,
  },
  containerXL: {
    minHeight: HEIGHT.xl,
    minWidth: HEIGHT.xl,
    borderRadius: RADIUS.xl,
  },

  // .start / .end slot gaps
  slotLeftXS: { marginRight: GAP.xs },
  slotLeftS: { marginRight: GAP.s },
  slotLeftM: { marginRight: GAP.m },
  slotLeftL: { marginRight: GAP.l },
  slotLeftXL: { marginRight: GAP.xl },
  slotRightXS: { marginLeft: GAP.xs },
  slotRightS: { marginLeft: GAP.s },
  slotRightM: { marginLeft: GAP.m },
  slotRightL: { marginLeft: GAP.l },
  slotRightXL: { marginLeft: GAP.xl },
});

export const CONTAINER = {
  xs: styles.containerXS,
  s: styles.containerS,
  m: styles.containerM,
  l: styles.containerL,
  xl: styles.containerXL,
} as const;

export const SLOT_LEFT = {
  xs: styles.slotLeftXS,
  s: styles.slotLeftS,
  m: styles.slotLeftM,
  l: styles.slotLeftL,
  xl: styles.slotLeftXL,
} as const;

export const SLOT_RIGHT = {
  xs: styles.slotRightXS,
  s: styles.slotRightS,
  m: styles.slotRightM,
  l: styles.slotRightL,
  xl: styles.slotRightXL,
} as const;

/** Off-screen but focusable label when Badge `aria-label` coexists with accessible slots. */
export const VISUALLY_HIDDEN_LABEL: TextStyle = {
  position: 'absolute',
  width: tokens.spacing['0-5'],
  height: tokens.spacing['0-5'],
  opacity: 0,
  overflow: 'hidden',
};
