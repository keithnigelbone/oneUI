/**
 * Badge interface (native)
 */

import { isValidElement, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

export type BadgeAppearance = ComponentAppearance;
export type BadgeAttention = 'high' | 'medium' | 'low';
export type BadgeVariant = 'bold' | 'subtle' | 'ghost';
export type BadgeSize = 'xs' | 's' | 'm' | 'l' | 'xl';

const ATTENTION_TO_VARIANT: Record<BadgeAttention, BadgeVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export interface BadgeProps {
  children?: ReactNode;
  size?: BadgeSize;
  attention?: BadgeAttention;
  appearance?: BadgeAppearance;
  start?: ReactNode;
  end?: ReactNode;
  style?: ViewStyle;
  'aria-label'?: string;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
  accessibilityHint?: string;
}

export type BadgeNativeProps = BadgeProps;

export function resolveBadgeAppearance(
  appearance: BadgeAppearance | undefined,
  surfaceAppearance: Exclude<ComponentAppearance, 'auto'> | null,
): Exclude<ComponentAppearance, 'auto'> {
  if (appearance !== undefined && appearance !== 'auto') {
    return appearance as Exclude<ComponentAppearance, 'auto'>;
  }
  return surfaceAppearance ?? 'sparkle';
}

export function useBadgeState(
  props: BadgeProps,
  surfaceAppearance: Exclude<ComponentAppearance, 'auto'> | null,
) {
  const { size = 'm', attention, appearance } = props;

  const resolvedVariant: BadgeVariant = attention ? ATTENTION_TO_VARIANT[attention] : 'bold';

  // Mirrors web's `Badge.shared.ts`: explicit role wins, then nearest
  // `<Surface appearance>`, then Badge's terminal sparkle default.
  const resolvedAppearance = resolveBadgeAppearance(appearance, surfaceAppearance);

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
  };

  return { resolvedVariant, resolvedAppearance, dataAttrs };
}

export function resolveBadgeAccessibilityLabel(props: BadgeProps): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  const { children } = props;
  if (badgeChildrenArePlainText(children)) {
    return String(children);
  }
  return undefined;
}

/** True when `children` is a string or number (not a ReactElement subtree). */
export function badgeChildrenArePlainText(children: ReactNode): boolean {
  return typeof children === 'string' || typeof children === 'number';
}

function nodeExposesAccessibility(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  const nodeProps = node.props as {
    alt?: string;
    'aria-label'?: string;
    accessibilityLabel?: string;
  };
  if (typeof nodeProps.alt === 'string' && nodeProps.alt.trim().length > 0) return true;
  const ariaLabel = nodeProps['aria-label'];
  if (typeof ariaLabel === 'string' && ariaLabel.trim().length > 0) return true;
  const accessibilityLabel = nodeProps.accessibilityLabel;
  return typeof accessibilityLabel === 'string' && accessibilityLabel.trim().length > 0;
}

/** True when main `children` is a component with its own accessibility label. */
export function badgeChildrenExposeAccessibility(children: ReactNode): boolean {
  return nodeExposesAccessibility(children);
}

export function getBadgeAccessibilityProps(props: BadgeProps): {
  accessible: boolean;
  accessibilityRole: 'text' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLiveRegion: 'polite';
} {
  const accessibilityLabel = resolveBadgeAccessibilityLabel(props);
  const hasPlainTextChildren = badgeChildrenArePlainText(props.children);
  return {
    accessible: Boolean(accessibilityLabel),
    accessibilityRole: hasPlainTextChildren ? 'text' : 'none',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityLiveRegion: 'polite',
  };
}

/** True when a slot child supplies its own `alt` or `aria-label` (e.g. Avatar, CounterBadge). */
export function badgeSlotNodeExposesAccessibility(node: ReactNode): boolean {
  return nodeExposesAccessibility(node);
}

export function badgeSlotsExposeAccessibility(
  props: Pick<BadgeProps, 'start' | 'end'>,
): boolean {
  return (
    badgeSlotNodeExposesAccessibility(props.start) ||
    badgeSlotNodeExposesAccessibility(props.end)
  );
}

export type BadgeRootAccessibilityProps =
  | (ReturnType<typeof getBadgeAccessibilityProps> & { importantForAccessibility?: 'auto' })
  | { accessible: false; importantForAccessibility: 'auto' };

/** Root groups label alone; when slots or element children expose labels, defer to them. */
export function getBadgeRootAccessibilityProps(
  props: BadgeProps,
  slotsExposeA11y: boolean,
): BadgeRootAccessibilityProps {
  const a11y = getBadgeAccessibilityProps(props);
  const descendantsExposeA11y =
    slotsExposeA11y || badgeChildrenExposeAccessibility(props.children);
  if (!a11y.accessibilityLabel || descendantsExposeA11y) {
    return { accessible: false, importantForAccessibility: 'auto' };
  }
  return a11y;
}

export function getBadgeSlotWrapAccessibilityProps(
  props: BadgeProps,
  slotsExposeA11y: boolean,
): { importantForAccessibility?: 'no' | 'no-hide-descendants' } {
  const hasLabel = Boolean(resolveBadgeAccessibilityLabel(props));
  if (!hasLabel) return {};
  if (slotsExposeA11y) return { importantForAccessibility: 'no' };
  return { importantForAccessibility: 'no-hide-descendants' };
}

export type BadgeContentAccessibilityProps =
  | {
      accessible: boolean;
      importantForAccessibility?: 'no';
      accessibilityRole?: 'text';
      accessibilityLabel?: string;
    }
  | ReturnType<typeof getBadgeElementContentAccessibilityProps>;

export function getBadgeVisibleTextAccessibilityProps(
  props: BadgeProps,
  slotsExposeA11y: boolean,
): BadgeContentAccessibilityProps {
  if (!badgeChildrenArePlainText(props.children)) {
    return getBadgeElementContentAccessibilityProps(props, slotsExposeA11y);
  }
  const label = resolveBadgeAccessibilityLabel(props);
  if (slotsExposeA11y || !label) {
    return {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: label,
    };
  }
  return { accessible: false, importantForAccessibility: 'no' };
}

/** Accessibility for ReactElement `children` — no `text` role; child owns semantics. */
export function getBadgeElementContentAccessibilityProps(
  props: BadgeProps,
  slotsExposeA11y: boolean,
): {
  accessible: boolean;
  importantForAccessibility?: 'no';
  accessibilityRole?: 'none';
  accessibilityLabel?: string;
} {
  if (props.children == null || badgeChildrenArePlainText(props.children)) {
    return { accessible: false };
  }
  const label = resolveBadgeAccessibilityLabel(props);
  const childExposesA11y = badgeChildrenExposeAccessibility(props.children);
  if (childExposesA11y || slotsExposeA11y) {
    return { accessible: false, importantForAccessibility: 'no' };
  }
  if (label) {
    return { accessible: false, importantForAccessibility: 'no' };
  }
  return { accessible: false, importantForAccessibility: 'no' };
}

export function shouldExposeOffscreenBadgeLabel(
  props: BadgeProps,
  slotsExposeA11y: boolean,
): boolean {
  const hasLabel = Boolean(resolveBadgeAccessibilityLabel(props));
  const hasPlainTextChildren = badgeChildrenArePlainText(props.children);
  const childExposesA11y = badgeChildrenExposeAccessibility(props.children);
  return hasLabel && !hasPlainTextChildren && (slotsExposeA11y || childExposesA11y);
}
