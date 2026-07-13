'use client';

/**
 * BottomNavigation.shared.ts
 * Shared types, context, and state hooks for BottomNavigation + BottomNavItem.
 *
 * Figma component properties:
 *  BottomNav:  items (2–5), label (1Line | 2Line | none)
 *  BottomNav.Item: active (boolean), type (label1Line | label2Line | labelFalse)
 *
 * The parent owns `labelType` and a shared active value; items inherit via context.
 * Items may also set an explicit `active` prop that wins over value-matching.
 *
 * Marked `'use client'` because `createContext` can only run in client
 * components and this module is reachable from server components via the
 * runtime component registry (ASTRenderer → COMPONENT_REGISTRY).
 */

import { createContext, useContext } from 'react';
import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react';
import type { ComponentAppearance, ComponentIconInput } from '@oneui/shared';

/** Label layout shared by all items in a BottomNavigation. */
export type BottomNavigationLabelType = 'none' | '1line' | '2line';

/** Appearance alias — items use the full canonical role union. */
export type BottomNavigationAppearance = ComponentAppearance;

export interface BottomNavigationProps {
  /** 2–5 `<BottomNavItem>` children. */
  children: ReactNode;
  /** Label layout for all items. Default: '1line'. */
  labelType?: BottomNavigationLabelType;
  /** Controlled active item value. Match `value` on a child `<BottomNavItem>`. */
  value?: string;
  /** Uncontrolled initial active item value. */
  defaultValue?: string;
  /** Called when an item is pressed and its `value` becomes active. */
  onValueChange?: (value: string) => void;
  /** Show the top edge-to-edge divider. Default: true. */
  showDivider?: boolean;
  /** Multi-accent appearance role applied to all child items. Default: 'primary'. */
  appearance?: BottomNavigationAppearance;
  /** Accessible label for the `<nav>` landmark. Required. */
  'aria-label': string;
  /** Test id forwarded to the root `<nav>`. */
  'data-testid'?: string;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

export interface BottomNavItemProps {
  icon: ComponentIconInput | ReactElement;
  /** Optional filled-style icon used when the item is active. */
  activeIcon?: ComponentIconInput | ReactElement;
  /** Label text. Required when `labelType` is '1line' or '2line'. */
  label?: string;
  /** Explicit active state. Wins over value-matching when set. */
  active?: boolean;
  /** Value used with the parent `value` / `onValueChange`. */
  value?: string;
  /** Navigate on click — renders as `<a>`. */
  href?: string;
  /** Fires on click — if `href` is unset, renders as `<button>`. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Multi-accent appearance role. Overrides parent. */
  appearance?: BottomNavigationAppearance;
  /** Override the parent label layout for this item only. */
  labelType?: BottomNavigationLabelType;
  /** Accessible name — required when `labelType` is 'none' or no label is passed. */
  'aria-label'?: string;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
  /**
   * @internal Index injected by BottomNavigation for roving tabindex / keyboard nav.
   */
  itemIndex?: number;
}

/** Runtime shape shared between parent and items via context. */
interface BottomNavigationContextValue {
  labelType: BottomNavigationLabelType;
  value: string | undefined;
  onValueChange: (value: string) => void;
  appearance: BottomNavigationAppearance;
  /** Item id that carries tabIndex=0 in the roving tabindex model. */
  rovingTabId: string;
  setRovingTabId: (id: string) => void;
}

export const BottomNavigationContext = createContext<BottomNavigationContextValue | null>(null);

/** Stable id for keyboard roving — prefers `value`, falls back to child index. */
export function getBottomNavItemId(value: string | undefined, itemIndex: number): string {
  return value ?? `__bn-item-${itemIndex}`;
}

/** Focusable nav items inside the toolbar (skips disabled buttons and aria-disabled links). */
export function getFocusableBottomNavItems(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href]:not([aria-disabled="true"])',
    ),
  );
}

export function useBottomNavigationContext(): BottomNavigationContextValue | null {
  return useContext(BottomNavigationContext);
}

/** Resolve the effective appearance, mapping 'auto' or unset → parentAppearance ?? 'primary'. */
export function resolveBottomNavigationAppearance(
  appearance: BottomNavigationAppearance | undefined,
  parentAppearance: Exclude<BottomNavigationAppearance, 'auto'> | null = null,
): Exclude<BottomNavigationAppearance, 'auto'> {
  if (appearance && appearance !== 'auto') return appearance;
  return parentAppearance ?? 'primary';
}
