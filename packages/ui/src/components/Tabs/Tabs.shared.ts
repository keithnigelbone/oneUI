/**
 * Tabs.shared.ts
 * Shared types and hooks for Tabs / TabGroup / TabItem components.
 *
 * Figma spec: F7KEYdO8R8Nbe2N4gI8dIU nodes 1:55590, 37:15824-37:15865
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

export type TabsOrientation = 'horizontal' | 'vertical';

/** Figma-aligned size scale — S/M/L for both TabItem and TabGroup. */
export type TabsSize = 's' | 'm' | 'l';

/** Tab value — matches Base UI Tabs.Tab.Value. */
export type TabsValue = string | number | null;

/* ===== Legacy compound-API props (kept for back-compat) ===== */

export interface TabsProps {
  children: ReactNode;
  value?: TabsValue;
  defaultValue?: TabsValue;
  onValueChange?: (value: TabsValue) => void;
  orientation?: TabsOrientation;
  /** Size forwarded to all child TabItems. */
  size?: TabsSize;
  /** Appearance forwarded to all child TabItems. */
  appearance?: ComponentAppearance;
  className?: string;
}

export interface TabProps {
  children?: ReactNode;
  value: string | number;
  disabled?: boolean;
  /** @deprecated Use `start` instead. */
  icon?: ReactNode;
  /** @deprecated Use `end` instead. */
  badge?: ReactNode;
  /** Generic leading slot — takes precedence over `icon`. */
  start?: ReactNode;
  /** Generic trailing slot — takes precedence over `badge`. */
  end?: ReactNode;
  /** Override size from context. */
  size?: TabsSize;
  /** Override appearance from context. */
  appearance?: ComponentAppearance;
  'aria-label'?: string;
  /** Force a specific interaction state for documentation / Storybook. */
  'data-force-state'?: 'focus';
  className?: string;
  style?: CSSProperties;
}

export interface TabPanelProps {
  children: ReactNode;
  value: string | number;
  className?: string;
}

export interface TabListProps {
  children: ReactNode;
  activateOnFocus?: boolean;
  loopFocus?: boolean;
  className?: string;
}

/* ===== Flat-API props (match Figma layer naming) ===== */

export interface TabGroupProps {
  children: ReactNode;
  value?: TabsValue;
  defaultValue?: TabsValue;
  onValueChange?: (value: TabsValue) => void;
  orientation?: TabsOrientation;
  /** Size propagated to children via TabsContext. Default: 'm'. */
  size?: TabsSize;
  /** Multi-accent appearance propagated to children. 'auto' resolves to 'primary'. */
  appearance?: ComponentAppearance;
  /** Whether to change the active tab on arrow key focus (Base UI). Default: false. */
  activateOnFocus?: boolean;
  /** Whether arrow keys loop back to the first/last tab (Base UI). Default: true. */
  loopFocus?: boolean;
  /** Auto-render <Tabs.Indicator /> inside <Tabs.List>. Default: true. */
  showIndicator?: boolean;
  className?: string;
  style?: CSSProperties;
}

export type TabItemProps = TabProps;

/* ===== Resolution helpers ===== */

export interface ResolvedTabItemState {
  resolvedSize: TabsSize;
  resolvedAppearance: Exclude<ComponentAppearance, 'auto'>;
  resolvedOrientation: TabsOrientation;
  dataAttrs: Record<string, string | undefined>;
}

export function resolveTabItemState(params: {
  size: TabsSize | undefined;
  appearance: ComponentAppearance | undefined;
  orientation: TabsOrientation | undefined;
  ctxSize: TabsSize | undefined;
  ctxAppearance: ComponentAppearance | undefined;
  ctxOrientation: TabsOrientation | undefined;
  disabled: boolean | undefined;
  parentAppearance?: Exclude<ComponentAppearance, 'auto'> | null;
}): ResolvedTabItemState {
  const resolvedSize = params.size ?? params.ctxSize ?? 'm';
  const rawAppearance = params.appearance ?? params.ctxAppearance;
  const resolvedAppearance =
    rawAppearance && rawAppearance !== 'auto'
      ? rawAppearance
      : (params.parentAppearance ?? 'primary');
  const resolvedOrientation = params.orientation ?? params.ctxOrientation ?? 'horizontal';

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': resolvedSize,
    'data-appearance': resolvedAppearance,
    'data-orientation': resolvedOrientation,
    ...(params.disabled ? { 'data-disabled': '' } : {}),
  };

  return { resolvedSize, resolvedAppearance, resolvedOrientation, dataAttrs };
}

/** Back-compat hook — still used by legacy useTabsState callers. */
export function useTabsState(props: TabsProps) {
  return {
    isVertical: props.orientation === 'vertical',
  };
}
