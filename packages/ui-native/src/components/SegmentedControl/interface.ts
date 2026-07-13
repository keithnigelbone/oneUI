/**
 * SegmentedControl interface (native)
 *
 * Semantic source: packages/ui/src/components/SegmentedControl/SegmentedControl.shared.ts
 * Cross-check: Layers jdssegmentedcontrol-4 / jdssegmentedcontrol generated/interface.ts
 *
 * Owns the native prop contract, the group/item state resolvers, and the
 * accessibility helpers. No import from `@oneui/ui/.../shared`.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import {
  SegmentedControlContext,
  useSegmentedControlContext,
  type SegmentedControlContextValue,
} from './SegmentedControlContext';

/** Figma-aligned sizes: S, M, L. */
export type SegmentedControlSize = 's' | 'm' | 'l';

/** Selected-segment visual prominence. */
export type SegmentedControlAttention = 'high' | 'medium' | 'low';

/** Track (container) background prominence. */
export type SegmentedControlTrackEmphasis = 'high' | 'medium' | 'low';

export type SegmentedControlShape = 'pill' | 'rectangular';

/** Content mode — text labels or icon-only segments. */
export type SegmentedControlType = 'text' | 'icon';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type SegmentedControlAppearance = ComponentAppearance;

/** Appearance after `auto` / undefined has been resolved. */
export type ResolvedSegmentedAppearance = Exclude<ComponentAppearance, 'auto'>;

export interface SegmentedControlProps {
  children: ReactNode;

  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called when the selected segment changes. */
  onValueChange?: (value: string) => void;

  /** @default 'm' */
  size?: SegmentedControlSize;
  /**
   * Drives the SELECTED segment fill prominence.
   * high = bold; medium = subtle (item role); low = subtle (auto/neutral).
   * @default 'high'
   */
  attention?: SegmentedControlAttention;
  /**
   * Multi-accent colour role for active segments when attention is `high` or `medium`.
   * `auto` resolves to parent Surface appearance → primary. When attention is `low`,
   * selected segments follow the track role (parent Surface ?? neutral).
   * @default 'auto'
   */
  appearance?: SegmentedControlAppearance;
  /** @default 'pill' */
  shape?: SegmentedControlShape;
  /** When true (default for `text`), every segment shares equal width. */
  equalWidth?: boolean;
  /**
   * Track (outer container) background prominence.
   * high = minimal fill; medium = ghost + strokeMedium border; low = ghost.
   * @default 'high'
   */
  trackEmphasis?: SegmentedControlTrackEmphasis;
  /** `text` (default) or `icon` — icon-only requires `aria-label` on each item. */
  type?: SegmentedControlType;
  /** @default false */
  disabled?: boolean;

  /** Additional native styles applied to the track container. */
  style?: ViewStyle;
  /** React Native test identifier. */
  testID?: string;
  /** Describes the control for assistive tech. */
  accessibilityHint?: string;
  'aria-label'?: string;
  /** Web parity — no id resolution on native; use `aria-label` for the announced name. */
  'aria-labelledby'?: string;
}

export interface SegmentedControlItemProps {
  value: string;
  children?: ReactNode;
  /** Start slot — icon only. */
  start?: ReactNode;
  /** End slot — CounterBadge only. */
  end?: ReactNode;
  /** @default false */
  disabled?: boolean;
  /** Required when the segment has no visible text (icon-only). */
  'aria-label'?: string;
  /** React Native test identifier. */
  testID?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  onPress?: () => void;
  /** Web parity alias for `onPress`. */
  onClick?: () => void;
}

// ============================================================================
// Appearance resolution — mirrors SegmentedControl.shared.ts
// ============================================================================

export function resolveItemAppearance(
  appearance: ComponentAppearance | undefined,
  parentAppearance: ResolvedSegmentedAppearance | undefined | null,
): ResolvedSegmentedAppearance {
  if (appearance && appearance !== 'auto') return appearance;
  return parentAppearance ?? 'primary';
}

export function resolveTrackAppearance(
  parentAppearance: ResolvedSegmentedAppearance | undefined | null,
): ResolvedSegmentedAppearance {
  return parentAppearance ?? 'neutral';
}

export interface SegmentedGroupConfig {
  size: SegmentedControlSize;
  attention: SegmentedControlAttention;
  appearance: ResolvedSegmentedAppearance;
  selectedAppearance: ResolvedSegmentedAppearance;
  trackAppearance: ResolvedSegmentedAppearance;
  trackEmphasis: SegmentedControlTrackEmphasis;
  shape: SegmentedControlShape;
  type: SegmentedControlType;
  equalWidth: boolean;
  groupDisabled: boolean;
}

/**
 * Pure config resolver — same output for the same inputs. `parentAppearance` is
 * the resolved role of the nearest ancestor `<Surface>` (or `null` at the page
 * root), passed in so this stays free of React hooks and unit-testable.
 */
export function resolveSegmentedGroupConfig(
  props: Pick<
    SegmentedControlProps,
    'size' | 'attention' | 'appearance' | 'shape' | 'equalWidth' | 'trackEmphasis' | 'type' | 'disabled'
  >,
  parentAppearance: ResolvedSegmentedAppearance | null,
): SegmentedGroupConfig {
  const {
    size = 'm',
    attention = 'high',
    appearance: appearanceProp,
    shape = 'pill',
    equalWidth: equalWidthProp,
    trackEmphasis = 'high',
    type = 'text',
    disabled,
  } = props;

  /** Icon segments use fixed square cells — hug track by default. Text defaults to equal width. */
  const equalWidth = equalWidthProp ?? (type === 'icon' ? false : true);

  const trackAppearance = resolveTrackAppearance(parentAppearance);
  const appearance = resolveItemAppearance(appearanceProp, parentAppearance);
  const selectedAppearance: ResolvedSegmentedAppearance =
    attention === 'low' ? trackAppearance : appearance;

  return {
    size,
    attention,
    appearance,
    selectedAppearance,
    trackAppearance,
    trackEmphasis,
    shape,
    type,
    equalWidth,
    groupDisabled: Boolean(disabled),
  };
}

/**
 * Group state hook — resolves appearances against the ambient Surface, manages
 * controlled/uncontrolled selection, and builds the context value the items read.
 *
 * `parentAppearance` is the resolved role of the nearest ancestor `<Surface>`
 * (`useSurfaceAppearance()` in `.native.tsx`, `null` at the page root). It is
 * passed in — not read here — so this module stays free of theme/`react-native-svg`
 * imports and remains unit-testable under vitest.
 */
export function useSegmentedControlGroupState(
  props: SegmentedControlProps,
  parentAppearance: ResolvedSegmentedAppearance | null = null,
): {
  selectedValue: string | undefined;
  selectValue: (value: string) => void;
  contextValue: SegmentedControlContextValue;
} {
  const { value, defaultValue, onValueChange } = props;

  const config = useMemo(
    () =>
      resolveSegmentedGroupConfig(
        {
          size: props.size,
          attention: props.attention,
          appearance: props.appearance,
          shape: props.shape,
          equalWidth: props.equalWidth,
          trackEmphasis: props.trackEmphasis,
          type: props.type,
          disabled: props.disabled,
        },
        parentAppearance,
      ),
    [
      props.size,
      props.attention,
      props.appearance,
      props.shape,
      props.equalWidth,
      props.trackEmphasis,
      props.type,
      props.disabled,
      parentAppearance,
    ],
  );

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const selectedValue = isControlled ? value : internalValue;

  const selectValue = useCallback(
    (next: string) => {
      if (config.groupDisabled) return;
      // Single-select is always required — re-tapping the active segment is a
      // no-op (mirrors web's Base UI ToggleGroup, which only fires on change).
      if (next === selectedValue) return;
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [config.groupDisabled, isControlled, onValueChange, selectedValue],
  );

  const contextValue = useMemo<SegmentedControlContextValue>(
    () => ({
      size: config.size,
      attention: config.attention,
      appearance: config.appearance,
      selectedAppearance: config.selectedAppearance,
      trackAppearance: config.trackAppearance,
      trackEmphasis: config.trackEmphasis,
      shape: config.shape,
      type: config.type,
      equalWidth: config.equalWidth,
      groupDisabled: config.groupDisabled,
      selectedValue,
      selectValue,
    }),
    [config, selectedValue, selectValue],
  );

  return { selectedValue, selectValue, contextValue };
}

// ============================================================================
// Item state
// ============================================================================

export interface ResolvedSegmentItemState {
  ctx: SegmentedControlContextValue;
  isSelected: boolean;
  isDisabled: boolean;
  /** Icon-only cell (no visible label). */
  isIconOnly: boolean;
  /** Whether the text label is rendered. */
  showLabel: boolean;
  /** Appearance the slots (icon / CounterBadge) inherit. */
  slotAppearance: ResolvedSegmentedAppearance;
}

export function resolveSegmentItemState(
  props: Pick<SegmentedControlItemProps, 'children' | 'start' | 'end' | 'disabled' | 'value'>,
  ctx: SegmentedControlContextValue,
): ResolvedSegmentItemState {
  // Treat `0` and other falsy-but-present children as a real label (e.g. a
  // "0 items" segment). Only null/undefined/false/'' count as no label.
  const { children } = props;
  const hasLabel = children != null && children !== false && children !== '';
  const isIconType = ctx.type === 'icon';
  const isIconOnly = isIconType || (!hasLabel && Boolean(props.start) && !props.end);
  const showLabel = hasLabel && !isIconType;
  const slotAppearance =
    ctx.attention === 'low' ? ctx.selectedAppearance : ctx.appearance;

  return {
    ctx,
    isSelected: ctx.selectedValue === props.value,
    isDisabled: ctx.groupDisabled || Boolean(props.disabled),
    isIconOnly,
    showLabel,
    slotAppearance,
  };
}

export function useSegmentedControlItemState(
  props: Pick<SegmentedControlItemProps, 'children' | 'start' | 'end' | 'disabled' | 'value' | 'aria-label'>,
): ResolvedSegmentItemState {
  const ctx = useSegmentedControlContext();
  const state = resolveSegmentItemState(props, ctx);

  if (process.env.NODE_ENV !== 'production') {
    if (state.isIconOnly && !props['aria-label']) {
      // eslint-disable-next-line no-console
      console.warn(
        'SegmentedControl.Item: icon-only segments require an `aria-label` prop for accessibility.',
      );
    }
    if (ctx.type === 'icon' && !props.start) {
      // eslint-disable-next-line no-console
      console.warn(
        'SegmentedControl.Item: type="icon" on the group requires a `start` icon on each item.',
      );
    }
  }

  return state;
}

/**
 * Slot surface for nested badge/icon token remapping when a segment is selected.
 * Mirrors web `resolveSegmentSlotSurface`: high → bold, medium/low → subtle.
 */
export function resolveSegmentSlotSurface(
  isSelected: boolean,
  attention: SegmentedControlAttention,
): 'bold' | 'subtle' | undefined {
  if (!isSelected) return undefined;
  if (attention === 'high') return 'bold';
  return 'subtle';
}

// ============================================================================
// Accessibility
// ============================================================================

/**
 * Group container accessibility. Segmented controls map to the native
 * `tablist` idiom (single-select set with a persistently selected member);
 * web renders a Base UI ToggleGroup of `aria-pressed` buttons. Both convey the
 * "one of N selected" semantics — see the parity doc.
 */
export function getSegmentedControlAccessibilityProps(
  props: Pick<SegmentedControlProps, 'aria-label' | 'accessibilityHint'>,
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

export function resolveSegmentItemAccessibilityLabel(
  props: Pick<SegmentedControlItemProps, 'aria-label' | 'children'>,
): string | undefined {
  const ariaLabel = props['aria-label']?.trim();
  if (ariaLabel) return ariaLabel;
  const { children } = props;
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  return undefined;
}

export function getSegmentItemAccessibilityProps(
  props: Pick<SegmentedControlItemProps, 'aria-label' | 'children' | 'accessibilityHint'>,
  state: Pick<ResolvedSegmentItemState, 'isSelected' | 'isDisabled'>,
): {
  accessible: boolean;
  accessibilityRole: 'tab';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean; selected: boolean };
} {
  const accessibilityLabel = resolveSegmentItemAccessibilityLabel(props);
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

export { SegmentedControlContext, useSegmentedControlContext };
export type { SegmentedControlContextValue };
