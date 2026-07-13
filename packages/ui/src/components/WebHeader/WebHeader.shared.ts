/**
 * WebHeader.shared.ts
 * Shared types and hooks for WebHeader component
 * Used by both web and React Native implementations
 */

import type { CSSProperties, MouseEvent, ReactNode } from 'react';

/* ========================================
   TYPE DEFINITIONS
   ======================================== */

/** Header position/style variants */
export type WebHeaderVariant =
  | 'default'
  | 'transparent'
  | 'glass'
  | 'hidden'
  | 'stickyHidden';

/** PrimaryNav bar type */
export type PrimaryNavType = 'homeBar' | 'contextBar' | 'searchBar';

/** PrimaryNav middle section layout */
export type PrimaryNavMiddle = 'none' | 'fluid' | 'centred';

/** SecondaryNav type */
export type SecondaryNavType = 'navStart' | 'navMiddle' | 'marketing';

/** HeaderItem attention level (Figma terminology) */
export type HeaderItemAttention = 'low' | 'medium' | 'high';

/** HeaderItem slot size */
export type HeaderItemSlotSize = 'none' | 'S' | 'M';

/** Breakpoint IDs matching the design system (S/M/L). */
export type WebHeaderBreakpoint = 'S' | 'M' | 'L';

/** Navigation item data for mobile drawer */
export interface NavItemL3 {
  label: string;
  href: string;
  key?: string;
}

export interface NavItemL2 {
  id: string;
  label: string;
  href?: string;
  locked?: boolean;
  children?: NavItemL3[];
}

export interface NavItemL1 {
  id: string;
  label: string;
  href?: string;
  locked?: boolean;
  children?: NavItemL2[];
}

/* ========================================
   COMPONENT PROPS
   ======================================== */

/** Root WebHeader props */
export interface WebHeaderProps {
  /** Header variant controlling position and background */
  variant?: WebHeaderVariant;
  /** Override breakpoint (auto-detected by default) */
  breakpoint?: WebHeaderBreakpoint;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /**
   * Accessible name for the banner landmark. Only apply when this
   * `WebHeader` is the top-level page banner (i.e. a direct child of
   * `<body>`, not nested inside another sectioning element). Pass a
   * short descriptor such as "Main site header" when the default
   * implicit banner name is not descriptive enough.
   *
   * Note: do NOT set this when the header is rendered inside a
   * `<section>`, `<article>`, `<main>`, `<nav>`, or `<aside>` — nesting
   * strips the implicit `banner` role and `aria-label` becomes a
   * prohibited attribute on the now role-less `<header>`.
   */
  'aria-label'?: string;
  /** IDREF of a visible element that labels the banner landmark. */
  'aria-labelledby'?: string;
  /** PrimaryNav + SecondaryNav children */
  children: ReactNode;
}

/** Search input position in PrimaryNav */
export type SearchInputPosition = 'none' | 'middle' | 'end';

/** PrimaryNav props — matches Figma .PrimaryNav component properties */
export interface PrimaryNavProps {
  /** Bar type: homeBar (nav items), contextBar (simpler), searchBar (search-focused) */
  type?: PrimaryNavType;
  /** Middle section layout: fluid (fills space) or centred (absolute center) */
  middle?: PrimaryNavMiddle;
  /** Where search input appears: none (hidden), middle (with nav items), end (in actions area) */
  searchInput?: SearchInputPosition;
  /** Show hamburger menu icon button in the leading chrome section */
  showMenuButton?: boolean;
  /** Show/hide nav items in middle section. Default: true */
  primaryNavItems?: boolean;
  /** Show/hide bottom divider. Default: true */
  divider?: boolean;
  /** Show/hide avatar. Default: true */
  showAvatar?: boolean;
  /** Logo element for start slot */
  logo?: ReactNode;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Search value (controlled) */
  searchValue?: string;
  /** Called when search value changes */
  onSearchChange?: (value: string) => void;
  /** Called when search is submitted */
  onSearchSubmit?: (value: string) => void;
  /**
   * Accessible name for the embedded search landmark. Forwarded to the
   * `SearchInput`'s `aria-label`. Defaults to "Site search". Override
   * when multiple search landmarks exist on the same page.
   */
  searchAriaLabel?: string;
  /** Forwarded to the embedded `SearchInput`'s `aria-labelledby`. */
  searchAriaLabelledBy?: string;
  /** End slot content (icon actions before avatar) */
  end?: ReactNode;
  /** Avatar element for far-end */
  avatar?: ReactNode;
  /** Active nav item value — used to position the sliding indicator */
  activeValue?: string;
  /** Nav items for middle section (HeaderItem components) */
  children?: ReactNode;
  /** Called when mobile drawer state changes */
  onDrawerOpenChange?: (open: boolean) => void;
  /**
   * Accessible name for the primary navigation landmark. Defaults to
   * "Primary navigation". Override when rendering multiple `PrimaryNav`
   * instances on the same page so each `<nav>` is uniquely labelled.
   */
  'aria-label'?: string;
  /** IDREF of a visible element that labels the navigation landmark. */
  'aria-labelledby'?: string;
  /** Additional class name */
  className?: string;
}

/** SecondaryNav props */
export interface SecondaryNavProps {
  /** Secondary nav type */
  type?: SecondaryNavType;
  /** Subheader text (for marketing type) */
  subheader?: string;
  /** End slot (for marketing type — buttons/CTAs) */
  end?: ReactNode;
  /** Active secondary nav item value */
  activeValue?: string;
  /** Called when active value changes */
  onActiveValueChange?: (value: string) => void;
  /** Nav items */
  children?: ReactNode;
  /**
   * Accessible name for the secondary navigation landmark. Defaults to
   * "Secondary navigation". Override when rendering multiple
   * `SecondaryNav` instances on the same page so each `<nav>` is
   * uniquely labelled.
   */
  'aria-label'?: string;
  /** IDREF of a visible element that labels the navigation landmark. */
  'aria-labelledby'?: string;
  /** Additional class name */
  className?: string;
}

/** HeaderItem props */
export interface HeaderItemProps {
  /** Unique value for this item */
  value: string;
  /** Whether this item is active */
  active?: boolean;
  /** Attention level for visual weight */
  attention?: HeaderItemAttention;
  /** Content before label */
  start?: ReactNode;
  /** Size of start slot content: S=8px (badge), M=16px (icon) */
  startSize?: HeaderItemSlotSize;
  /** Content after label */
  end?: ReactNode;
  /** Size of end slot content: S=8px (badge), M=16px (icon) */
  endSize?: HeaderItemSlotSize;
  /** Remove left padding to visually align text with start-aligned content above */
  visuallyAlignToStart?: boolean;
  /** Navigation href */
  href?: string;
  /** Click handler */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Item label */
  children: ReactNode;
  /** Additional class name */
  className?: string;
  /** Ref callback for indicator measurement */
  itemRef?: (el: HTMLElement | null) => void;
}

/** SearchInput props */
export interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Controlled value */
  value?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Called when search is submitted (Enter key) */
  onSubmit?: (value: string) => void;
  /**
   * Show the leading search icon in the start slot.
   * Set to `false` when the search field is presented in its expanded
   * (wide) form — the affordance is already communicated by the field
   * itself. Defaults to `true`.
   */
  showSearchIcon?: boolean;
  /**
   * Accessible name for the search landmark (the outer
   * `role="search"` wrapper). Defaults to "Site search". Override when
   * multiple search landmarks coexist on the same page so each can be
   * distinguished by assistive technology.
   */
  'aria-label'?: string;
  /** IDREF of a visible element that labels the search landmark. */
  'aria-labelledby'?: string;
  /** Additional class name */
  className?: string;
}

/** MobileDrawer props */
export interface MobileDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Navigation items (3-level hierarchy) */
  navigation?: NavItemL1[];
  /** Logo element shown in drawer header */
  logo?: ReactNode;
  /** Additional class name */
  className?: string;
}

/* ========================================
   STATE HOOKS
   ======================================== */

/** Resolve WebHeader root state and data attributes */
export function useWebHeaderState(props: WebHeaderProps) {
  const resolvedVariant = props.variant ?? 'default';
  const isOverlay =
    resolvedVariant === 'transparent' ||
    resolvedVariant === 'glass';
  const isHidden =
    resolvedVariant === 'hidden' ||
    resolvedVariant === 'stickyHidden';

  const dataAttrs: Record<string, string | undefined> = {
    'data-variant': resolvedVariant,
    ...(props.breakpoint ? { 'data-breakpoint': props.breakpoint } : {}),
  };

  return {
    resolvedVariant,
    isOverlay,
    isHidden,
    dataAttrs,
  };
}

/** Resolve HeaderItem state and data attributes */
export function useHeaderItemState(props: HeaderItemProps) {
  const resolvedAttention = props.attention ?? 'low';
  const hasStartSlot = props.startSize && props.startSize !== 'none';
  const hasEndSlot = props.endSize && props.endSize !== 'none';

  const dataAttrs: Record<string, string | undefined> = {
    ...(props.active ? { 'data-active': 'true' } : {}),
    'data-attention': resolvedAttention,
    ...(hasStartSlot ? { 'data-start-size': props.startSize } : {}),
    ...(hasEndSlot ? { 'data-end-size': props.endSize } : {}),
    ...(props.visuallyAlignToStart ? { 'data-align-start': '' } : {}),
  };

  const ariaProps: Record<string, string | boolean | undefined> = {
    ...(props.active ? { 'aria-current': 'page' as const } : {}),
  };

  return {
    resolvedAttention,
    hasStartSlot,
    hasEndSlot,
    dataAttrs,
    ariaProps,
  };
}
