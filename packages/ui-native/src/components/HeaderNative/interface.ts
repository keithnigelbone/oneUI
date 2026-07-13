/**
 * HeaderNative interface (native)
 *
 * Figma source of truth: OneUI Micropatterns — HeaderNative family
 *   - HeaderNative (2134:15129): expanded, secondaryNav, divider
 *   - HeaderNative.PrimaryNav (2134:13491): type, expanded, start, end,
 *     endActions, avatar, secondaryText
 *   - HeaderNative.SecondaryNav (2134:14646): rendered when secondaryNav=true
 *
 * Composition rule: HeaderItem children belong in SecondaryNav only — not in PrimaryNav.
 * PrimaryNav is chrome (slots, title, search). Web WebHeader middle-row tabs are not in the
 * native Figma micropattern.
 *
 * Web WebHeader props are NOT part of this contract.
 */

import type { ReactNode } from 'react';
import type { GestureResponderEvent, ViewStyle } from 'react-native';

/* ========================================
   TYPE DEFINITIONS
   ======================================== */

/** PrimaryNav bar type — Figma component property */
export type PrimaryNavType = 'homeBar' | 'contextBar' | 'searchBar';

/** Instance-swap hint for the end actions slot (Button vs IconButton) */
export type PrimaryNavEndActionsType = 'Button' | 'IconButton';

/** HeaderItem attention level */
export type HeaderItemAttention = 'low' | 'medium' | 'high';

/** HeaderItem slot size */
export type HeaderItemSlotSize = 'none' | 'S' | 'M';

export type HeaderItemSlotSizeInput = HeaderItemSlotSize | undefined;

/* ========================================
   COMPONENT PROPS
   ======================================== */

/** Root HeaderNative — Figma HeaderNative */
export interface HeaderNativeProps {
  /** Expanded layout state. Default: false */
  expanded?: boolean;
  /** Show the SecondaryNav row. Default: false */
  secondaryNav?: boolean;
  /** Show divider below the header (after SecondaryNav when present). Default: false */
  divider?: boolean;
  children: ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** PrimaryNav — Figma HeaderNative.PrimaryNav (chrome row; no HeaderItem children) */
export interface PrimaryNavProps {
  /** Bar type. Default: homeBar */
  type?: PrimaryNavType;
  /** Expanded two-row layout (Row 1 + Headline/L title row). Requires titleContent. Default: false */
  expanded?: boolean;
  /** Show start slot (logo / back). Default: true */
  start?: boolean;
  /** Show end slot (actions). Default: true */
  end?: boolean;
  /** Instance-swap hint for end slot content type */
  endActions?: PrimaryNavEndActionsType;
  /** Show avatar in end area. Default: false */
  avatar?: boolean;
  /** Show secondary supporting text (contextBar). Default: false */
  secondaryText?: boolean;
  /** homeBar — inline search pill in the middle row. Default: false */
  searchInput?: boolean;
  /** Start slot content — logo, back button, etc. */
  startSlot?: ReactNode;
  /** End slot content — IconButtons / Buttons */
  endSlot?: ReactNode;
  /** Avatar element when avatar=true */
  avatarSlot?: ReactNode;
  /** contextBar collapsed — Title/M inline; expanded (any type) — Headline/L on row 2 */
  titleContent?: string;
  /** contextBar TitleWrapper — secondary line when secondaryText=true */
  secondaryTextContent?: string;
  /** Search field (searchBar) */
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchAriaLabel?: string;
  /** Trailing slot inside the searchBar Input (default: microphone) */
  searchEndSlot?: ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** SecondaryNav — HeaderItem tab row; rendered when HeaderNative.secondaryNav=true */
export interface SecondaryNavProps {
  /** Nav tabs — HeaderItem elements only (not supported on PrimaryNav) */
  children?: ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** HeaderItem — Figma Header.Item (3342:59395) */
export interface HeaderItemProps {
  value: string;
  active?: boolean;
  attention?: HeaderItemAttention;
  start?: ReactNode;
  startSize?: HeaderItemSlotSizeInput;
  end?: ReactNode;
  endSize?: HeaderItemSlotSizeInput;
  visuallyAlignToStart?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  children: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
}

/* ========================================
   STATE HOOKS
   ======================================== */

export interface ResolvedHeaderState {
  expanded: boolean;
  secondaryNav: boolean;
  divider: boolean;
}

export function useHeaderState(
  props: Pick<HeaderNativeProps, 'expanded' | 'secondaryNav' | 'divider'>,
): ResolvedHeaderState {
  return {
    expanded: props.expanded ?? false,
    secondaryNav: props.secondaryNav ?? false,
    divider: props.divider ?? false,
  };
}

export interface ResolvedPrimaryNavState {
  type: PrimaryNavType;
  expanded: boolean;
  showStart: boolean;
  showEnd: boolean;
  showAvatar: boolean;
  showSecondaryText: boolean;
  showSearchInput: boolean;
  endActions: PrimaryNavEndActionsType | undefined;
}

export function usePrimaryNavState(props: PrimaryNavProps): ResolvedPrimaryNavState {
  return {
    type: props.type ?? 'homeBar',
    expanded: props.expanded ?? false,
    showStart: props.start ?? true,
    showEnd: props.end ?? true,
    showAvatar: props.avatar ?? false,
    showSecondaryText: props.secondaryText ?? false,
    showSearchInput: props.searchInput ?? false,
    endActions: props.endActions,
  };
}

/**
 * Unified expanded layout — same rule for homeBar, contextBar, and searchBar:
 *   expanded + titleContent → Row 1 (type-specific chrome) + Row 2 (Headline/L).
 *   contextBar only: inline Title/M moves to row 2; row 1 start is back-only.
 */
export interface PrimaryNavLayoutState {
  isExpanded: boolean;
  /** Two-row layout: primary row + Headline/L title row */
  showExpandedLayout: boolean;
  /** contextBar collapsed — back + inline TitleWrapper in start */
  showContextBarInlineTitle: boolean;
  /** contextBar expanded — back only in start (title on row 2) */
  showContextBarStartOnly: boolean;
}

export function resolvePrimaryNavLayout(
  navState: Pick<ResolvedPrimaryNavState, 'type' | 'expanded'>,
  headerExpanded: boolean,
  titleContent?: string,
): PrimaryNavLayoutState {
  const isExpanded = navState.expanded || headerExpanded;
  const showExpandedLayout = isExpanded && Boolean(titleContent);
  const isContextBar = navState.type === 'contextBar';

  return {
    isExpanded,
    showExpandedLayout,
    showContextBarInlineTitle: isContextBar && !showExpandedLayout,
    showContextBarStartOnly: isContextBar && showExpandedLayout,
  };
}

export interface ResolvedHeaderItemState {
  resolvedAttention: HeaderItemAttention;
  hasStartSlot: boolean;
  hasEndSlot: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

export function useHeaderItemState(props: HeaderItemProps): ResolvedHeaderItemState {
  warnHeaderItemSlotSizeMismatch(props);
  const resolvedAttention = props.attention ?? 'low';
  const hasStartSlot = Boolean(props.startSize && props.startSize !== 'none');
  const hasEndSlot = Boolean(props.endSize && props.endSize !== 'none');

  return {
    resolvedAttention,
    hasStartSlot,
    hasEndSlot,
    isActive: Boolean(props.active),
    isDisabled: Boolean(props.disabled),
  };
}

/** Warn when slot content is passed without the matching Figma slot size. */
export function warnHeaderItemSlotSizeMismatch(
  props: Pick<HeaderItemProps, 'value' | 'start' | 'startSize' | 'end' | 'endSize'>,
): void {
  if (process.env.NODE_ENV === 'production') return;
  const id = props.value ?? 'unknown';
  if (props.start && (!props.startSize || props.startSize === 'none')) {
    // eslint-disable-next-line no-console
    console.warn(
      `HeaderItem (value="${id}"): \`start\` content requires \`startSize\` of 'S' or 'M' for correct state-layer insets.`,
    );
  }
  if (props.end && (!props.endSize || props.endSize === 'none')) {
    // eslint-disable-next-line no-console
    console.warn(
      `HeaderItem (value="${id}"): \`end\` content requires \`endSize\` of 'S' or 'M' for correct state-layer insets.`,
    );
  }
}

/* ========================================
   ACCESSIBILITY
   ======================================== */

export function getHeaderAccessibilityProps(
  props: Pick<HeaderNativeProps, 'aria-label' | 'aria-labelledby' | 'accessibilityHint'>,
): {
  accessible: boolean;
  accessibilityRole: 'header';
  accessibilityLabel?: string;
  accessibilityHint?: string;
} {
  return {
    accessible: Boolean(props['aria-label'] || props['aria-labelledby']),
    accessibilityRole: 'header',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
  };
}

export function getPrimaryNavAccessibilityProps(
  props: Pick<PrimaryNavProps, 'aria-label' | 'aria-labelledby' | 'accessibilityHint'>,
): {
  accessible: boolean;
  accessibilityRole: 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
} {
  const label = props['aria-labelledby'] ? undefined : props['aria-label'] ?? 'Primary navigation';
  return {
    accessible: Boolean(label || props['aria-labelledby']),
    accessibilityRole: 'none',
    accessibilityLabel: label,
    accessibilityHint: props.accessibilityHint,
  };
}

export function getSecondaryNavAccessibilityProps(
  props: Pick<SecondaryNavProps, 'aria-label' | 'aria-labelledby' | 'accessibilityHint'>,
): {
  accessible: boolean;
  accessibilityRole: 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
} {
  const label = props['aria-labelledby'] ? undefined : props['aria-label'] ?? 'Secondary navigation';
  return {
    accessible: Boolean(label || props['aria-labelledby']),
    accessibilityRole: 'none',
    accessibilityLabel: label,
    accessibilityHint: props.accessibilityHint,
  };
}

/** Turn `my-saved-items` → `My Saved Items` for icon-only nav item announcements. */
export function humanizeHeaderItemValue(value: string): string {
  const words = value.split(/[-_/]+/).filter(Boolean);
  if (words.length === 0) return value;
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const HEADER_ITEM_FALLBACK_LABEL = 'Navigation item';

export function resolveHeaderItemAccessibilityLabel(
  props: Pick<HeaderItemProps, 'aria-label' | 'children' | 'value'>,
): string {
  const ariaLabel = props['aria-label']?.trim();
  if (ariaLabel) return ariaLabel;
  const { children } = props;
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  const itemValue = props.value?.trim();
  if (itemValue) {
    if (
      process.env.NODE_ENV !== 'production' &&
      children != null &&
      typeof children !== 'string' &&
      typeof children !== 'number'
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        'HeaderItem: non-text `children` should include `aria-label` for accurate screen reader labels. Falling back to humanized `value`.',
      );
    }
    return humanizeHeaderItemValue(itemValue);
  }
  return HEADER_ITEM_FALLBACK_LABEL;
}

export function getHeaderItemAccessibilityProps(
  props: Pick<HeaderItemProps, 'aria-label' | 'children' | 'value' | 'accessibilityHint'>,
  state: Pick<ResolvedHeaderItemState, 'isDisabled' | 'isActive'>,
): {
  accessible: boolean;
  accessibilityRole: 'button';
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean; selected: boolean };
} {
  const accessibilityLabel = resolveHeaderItemAccessibilityLabel(props);
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      disabled: state.isDisabled,
      selected: state.isActive,
    },
  };
}

export const HEADER_INDICATOR_A11Y = {
  accessible: false,
  importantForAccessibility: 'no-hide-descendants' as const,
};

export const HEADER_DIVIDER_A11Y = {
  accessible: false,
  importantForAccessibility: 'no-hide-descendants' as const,
};

/** Nested page/section title inside the header landmark (contextBar / expanded row). */
export const HEADER_NESTED_TITLE_A11Y = {
  accessible: true,
  accessibilityRole: 'header' as const,
};
