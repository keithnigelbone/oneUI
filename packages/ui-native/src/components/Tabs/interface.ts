/**
 * Tabs interface (native)
 * Semantic source: packages/ui/src/components/Tabs/Tabs.shared.ts
 * Cross-check: Layers jdstabs/generated/interface.ts
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import { useTabsContext } from './TabsContext';
import { useTabsSelectionContext } from './TabsSelectionContext';

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
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
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
  /** Force a specific interaction state for documentation / showcase. */
  'data-force-state'?: 'focus';
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  onPress?: () => void;
  onClick?: () => void;
}

export interface TabPanelProps {
  children: ReactNode;
  value: string | number;
  style?: ViewStyle;
  testID?: string;
}

export interface TabListProps {
  children: ReactNode;
  activateOnFocus?: boolean;
  loopFocus?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
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
  /** Whether to change the active tab on arrow key focus (Base UI). No-op on native. */
  activateOnFocus?: boolean;
  /** Whether arrow keys loop (Base UI). No-op on native. */
  loopFocus?: boolean;
  /** Auto-render indicator inside the list. Default: true. */
  showIndicator?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
}

export type TabItemProps = TabProps;

/* ===== Resolution helpers ===== */

export interface ResolvedTabItemState {
  resolvedSize: TabsSize;
  resolvedAppearance: Exclude<ComponentAppearance, 'auto'>;
  resolvedOrientation: TabsOrientation;
  isSelected: boolean;
  isDisabled: boolean;
}

export function resolveTabAppearance(
  appearance: ComponentAppearance | undefined,
  parentAppearance?: Exclude<ComponentAppearance, 'auto'> | null,
): Exclude<ComponentAppearance, 'auto'> {
  const raw = appearance;
  if (raw && raw !== 'auto') return raw;
  return parentAppearance ?? 'primary';
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
  selectedValue: TabsValue;
  tabValue: string | number;
}): ResolvedTabItemState {
  const resolvedSize = params.size ?? params.ctxSize ?? 'm';
  const resolvedAppearance = resolveTabAppearance(
    params.appearance ?? params.ctxAppearance,
    params.parentAppearance,
  );
  const resolvedOrientation = params.orientation ?? params.ctxOrientation ?? 'horizontal';
  const isSelected =
    params.selectedValue !== null &&
    params.selectedValue !== undefined &&
    params.selectedValue === params.tabValue;

  return {
    resolvedSize,
    resolvedAppearance,
    resolvedOrientation,
    isSelected,
    isDisabled: Boolean(params.disabled),
  };
}

/** Back-compat hook — still used by legacy useTabsState callers. */
export function useTabsState(props: TabsProps) {
  return {
    isVertical: props.orientation === 'vertical',
  };
}

export function useTabGroupState(props: TabGroupProps | TabsProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    size = 'm',
    appearance = 'auto',
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<TabsValue>(defaultValue ?? null);
  const currentValue = isControlled ? value : internalValue;
  const resolvedAppearance = resolveTabAppearance(appearance);

  const handleValueChange = useCallback(
    (next: TabsValue) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const selectValue = useCallback(
    (next: string | number) => {
      handleValueChange(next);
    },
    [handleValueChange],
  );

  const contextValue = useMemo(
    () => ({ size, orientation, appearance: resolvedAppearance }),
    [size, orientation, resolvedAppearance],
  );

  return {
    currentValue,
    selectValue,
    handleValueChange,
    contextValue,
    orientation,
    size,
    resolvedAppearance,
    isVertical: orientation === 'vertical',
  };
}

export function useTabItemState(props: TabProps) {
  const ctx = useTabsContext();
  const selection = useTabsSelectionContext();

  const state = resolveTabItemState({
    size: props.size,
    appearance: props.appearance,
    orientation: ctx.orientation,
    ctxSize: ctx.size,
    ctxAppearance: ctx.appearance,
    ctxOrientation: ctx.orientation,
    disabled: props.disabled,
    selectedValue: selection?.value ?? null,
    tabValue: props.value,
  });

  return state;
}

/* ===== Accessibility ===== */

export function getTabsAccessibilityProps(
  props: Pick<TabListProps, 'aria-label' | 'accessibilityHint'>,
): {
  accessible: boolean;
  accessibilityRole: 'tablist';
  accessibilityLabel?: string;
  accessibilityHint?: string;
} {
  return {
    accessible: Boolean(props['aria-label']),
    accessibilityRole: 'tablist',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
  };
}

export function resolveTabItemAccessibilityLabel(
  props: Pick<TabProps, 'aria-label' | 'children'>,
): string | undefined {
  const ariaLabel = props['aria-label']?.trim();
  if (ariaLabel) return ariaLabel;
  const { children } = props;
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  return undefined;
}

export function getTabItemAccessibilityProps(
  props: Pick<TabProps, 'aria-label' | 'children' | 'accessibilityHint' | 'disabled'>,
  state: Pick<ResolvedTabItemState, 'isSelected' | 'isDisabled'>,
): {
  accessible: boolean;
  accessibilityRole: 'tab';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean; selected: boolean };
} {
  const accessibilityLabel = resolveTabItemAccessibilityLabel(props);
  return {
    accessible: Boolean(accessibilityLabel),
    accessibilityRole: 'tab',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      disabled: state.isDisabled,
      selected: state.isSelected,
    },
  };
}

export function getTabPanelAccessibilityProps(
  props: Pick<TabPanelProps, 'children'>,
  state: { isVisible: boolean },
): {
  accessible: boolean;
  accessibilityRole: 'none';
  importantForAccessibility: 'auto' | 'no-hide-descendants';
} {
  return {
    accessible: false,
    accessibilityRole: 'none',
    importantForAccessibility: state.isVisible ? 'auto' : 'no-hide-descendants',
  };
}
