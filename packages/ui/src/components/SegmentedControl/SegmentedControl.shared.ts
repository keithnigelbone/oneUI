/**
 * SegmentedControl.shared.ts
 * Shared types, context, and hooks for SegmentedControl + Item.
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import {
  SURFACE_STEP_BOLD_DARK,
  SURFACE_STEP_BOLD_LIGHT,
  resolveSurfaceStep,
  type SurfaceToken,
  type ThemeConfig,
} from '@oneui/shared/engine';
import type { CounterBadgeSize } from '../CounterBadge/CounterBadge.shared';
import { useSurfaceAppearance } from '../Surface';

/** Figma-aligned sizes: S, M, L */
export type SegmentedControlSize = 's' | 'm' | 'l';

/** Selected-segment visual prominence */
export type SegmentedControlAttention = 'high' | 'medium' | 'low';

/** Track (container) background prominence */
export type SegmentedControlTrackEmphasis = 'high' | 'medium' | 'low';

export type SegmentedControlShape = 'pill' | 'rectangular';

/** Content mode — text labels or icon-only segments */
export type SegmentedControlType = 'text' | 'icon';

/** CounterBadge size paired with SegmentedControl size (Figma slot scale). */
export function counterBadgeSizeForSegment(segmentSize: SegmentedControlSize): CounterBadgeSize {
  return segmentSize;
}

type ResolvedAppearance = Exclude<ComponentAppearance, 'auto'>;

export interface SegmentedControlContextValue {
  size: SegmentedControlSize;
  attention: SegmentedControlAttention;
  /** Resolved appearance for high/medium selected segments and slots */
  appearance: ResolvedAppearance;
  /** Selected-segment appearance when attention is low (track pattern: parent ?? neutral) */
  selectedAppearance: ResolvedAppearance;
  shape: SegmentedControlShape;
  type: SegmentedControlType;
  equalWidth: boolean;
  /** Currently selected segment value — drives slot surface context on the active item. */
  selectedValue?: string;
}

export const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  size: 'm',
  attention: 'high',
  appearance: 'primary',
  selectedAppearance: 'primary',
  shape: 'pill',
  type: 'text',
  equalWidth: true,
});

export function useSegmentedControlContext(): SegmentedControlContextValue {
  return useContext(SegmentedControlContext);
}

export interface SegmentedControlProps {
  children: ReactNode;

  /** Controlled selected value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  /** Called when the selected segment changes */
  onValueChange?: (value: string) => void;

  size?: SegmentedControlSize;
  /** Drives the SELECTED segment fill prominence. Default: `high`. */
  attention?: SegmentedControlAttention;
  /**
   * Multi-accent colour role for active segments when attention is `high` or `medium`.
   * `auto` resolves to parent Surface appearance → primary.
   * When attention is `low`, selected segments follow auto(neutral): parent Surface appearance ?? neutral (same as track).
   */
  appearance?: ComponentAppearance;
  shape?: SegmentedControlShape;
  /** When true (default), every segment shares equal width. */
  equalWidth?: boolean;
  /** Track (outer container) background prominence. Default: `high`. */
  trackEmphasis?: SegmentedControlTrackEmphasis;
  /** `text` (default) or `icon` — icon-only requires `aria-label` on each item. */
  type?: SegmentedControlType;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'data-testid'?: string;
  className?: string;
  style?: CSSProperties;
}

export interface SegmentedControlItemProps {
  value: string;
  children?: ReactNode;
  /** Start slot — icon only */
  start?: ReactNode;
  /** End slot — CounterBadge only */
  end?: ReactNode;
  disabled?: boolean;
  /** Required when segment has no visible text (icon-only) */
  'aria-label'?: string;
  'data-testid'?: string;
  className?: string;
  style?: CSSProperties;
}

export function resolveItemAppearance(
  appearance: ComponentAppearance | undefined,
  parentAppearance: ResolvedAppearance | undefined,
): ResolvedAppearance {
  if (appearance && appearance !== 'auto') return appearance;
  return parentAppearance ?? 'primary';
}

export function resolveTrackAppearance(
  parentAppearance: ResolvedAppearance | undefined,
): ResolvedAppearance {
  return parentAppearance ?? 'neutral';
}

export function useSegmentedControlGroupState(
  props: Pick<
    SegmentedControlProps,
    'size' | 'attention' | 'appearance' | 'shape' | 'equalWidth' | 'trackEmphasis' | 'type' | 'disabled'
  > & { selectedValue?: string },
) {
  const {
    size: sizeProp,
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

  const parentAppearance = useSurfaceAppearance();
  const trackAppearance = resolveTrackAppearance(parentAppearance ?? undefined);
  const resolvedItemAppearance = resolveItemAppearance(appearanceProp, parentAppearance ?? undefined);
  const selectedAppearance: ResolvedAppearance =
    attention === 'low' ? trackAppearance : resolvedItemAppearance;

  const size = sizeProp ?? 'm';

  const contextValue: SegmentedControlContextValue = {
    size,
    attention,
    appearance: resolvedItemAppearance,
    selectedAppearance,
    shape,
    type,
    equalWidth,
    selectedValue: props.selectedValue,
  };

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-attention': attention,
    'data-appearance': resolvedItemAppearance,
    'data-selected-appearance': selectedAppearance,
    'data-shape': shape,
    'data-track-emphasis': trackEmphasis,
    'data-track-appearance': trackAppearance,
    'data-type': type,
    ...(equalWidth ? { 'data-equal-width': '' } : {}),
    ...(disabled ? { 'data-disabled': '' } : {}),
  };

  return {
    contextValue,
    resolvedItemAppearance,
    dataAttrs,
  };
}

export function useSegmentedControlItemState(
  props: Pick<SegmentedControlItemProps, 'aria-label' | 'children' | 'start' | 'end'>,
) {
  const ctx = useSegmentedControlContext();
  const hasLabel = Boolean(props.children);
  const isIconType = ctx.type === 'icon';
  const isIconOnly =
    isIconType || (!hasLabel && Boolean(props.start) && !props.end);
  const showLabel = hasLabel && !isIconType;

  if (process.env.NODE_ENV !== 'production' && isIconOnly && !props['aria-label']) {
    console.warn(
      'SegmentedControl.Item: icon-only segments require an `aria-label` prop for accessibility.',
    );
  }

  if (process.env.NODE_ENV !== 'production' && isIconType && !props.start) {
    console.warn(
      'SegmentedControl.Item: type="icon" on the group requires a `start` icon on each item.',
    );
  }

  return { ctx, hasLabel, isIconOnly, showLabel };
}

/** Slot surface for nested badge/icon token remapping when this segment is selected. */
export function resolveSegmentSlotSurface(
  isSelected: boolean,
  attention: SegmentedControlAttention,
): SurfaceToken | undefined {
  if (!isSelected) return undefined;
  if (attention === 'high') return 'bold';
  if (attention === 'medium' || attention === 'low') return 'subtle';
  return undefined;
}

const ROOT_STEP_LIGHT = 2500;
const ROOT_STEP_DARK = 200;
const SCALE_MIN = 100;
const SCALE_MAX = 2500;

function clampSurfaceStep(step: number): number {
  if (step < SCALE_MIN) return SCALE_MIN;
  if (step > SCALE_MAX) return SCALE_MAX;
  return step;
}

function approxSegmentFillStep(
  mode: SurfaceToken,
  parentStep: number,
  darkMode: boolean,
): number {
  const dir = darkMode ? 1 : -1;
  if (mode === 'bold') {
    return darkMode ? SURFACE_STEP_BOLD_DARK : SURFACE_STEP_BOLD_LIGHT;
  }
  if (mode === 'subtle') {
    return clampSurfaceStep(parentStep + dir * 200);
  }
  return parentStep;
}

/** Resolved palette step of the selected segment's fill — drives slot step lookup. */
export function resolveSegmentFillStep(
  slotSurface: SurfaceToken,
  appearance: ResolvedAppearance,
  parentStep: number | null,
  darkMode: boolean,
  themeConfig: ThemeConfig | null | undefined,
): number {
  const rootStep = darkMode ? ROOT_STEP_DARK : ROOT_STEP_LIGHT;
  const effectiveParentStep = parentStep ?? rootStep;
  const isRoot = parentStep === null;

  const scale =
    themeConfig?.appearances[appearance]
    ?? themeConfig?.appearances.primary
    ?? themeConfig?.appearances.neutral
    ?? (themeConfig ? Object.values(themeConfig.appearances)[0] : undefined);

  if (scale) {
    return resolveSurfaceStep(scale, effectiveParentStep, slotSurface, darkMode, isRoot);
  }

  return approxSegmentFillStep(slotSurface, effectiveParentStep, darkMode);
}

export type SegmentSlotSurfaceAttrs = {
  'data-surface': SurfaceToken;
  'data-surface-step': string;
  'data-appearance': ResolvedAppearance;
};

/** Surface attrs for selected-segment slots — step lookup enables bold-on-bold badge contrast. */
export function resolveSegmentSlotAttrs(
  isSelected: boolean,
  attention: SegmentedControlAttention,
  appearance: ResolvedAppearance,
  parentStep: number | null,
  darkMode: boolean,
  themeConfig: ThemeConfig | null | undefined,
): SegmentSlotSurfaceAttrs | undefined {
  const slotSurface = resolveSegmentSlotSurface(isSelected, attention);
  if (!slotSurface) return undefined;

  return {
    'data-surface': slotSurface,
    'data-surface-step': String(
      resolveSegmentFillStep(slotSurface, appearance, parentStep, darkMode, themeConfig),
    ),
    'data-appearance': appearance,
  };
}

/**
 * Cross-role semantic badges keep root Fill-* colours via context-boundary.
 * Same-role badges on a selected segment skip the shield so step lookup can
 * re-step --{Role}-Bold for distinguishable bold-on-bold fills.
 */
export function shouldShieldSemanticBadge(
  child: ReactElement,
  isSelected: boolean,
  slotSurface: SurfaceToken | undefined,
  parentAppearance: ResolvedAppearance,
): boolean {
  if (!isSelected || !slotSurface) return true;

  const explicit = (child.props as { appearance?: ComponentAppearance }).appearance;
  const resolvedBadge: ResolvedAppearance =
    explicit != null && explicit !== 'auto' ? explicit : parentAppearance;

  return resolvedBadge !== parentAppearance;
}
