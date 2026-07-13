/**
 * Badge.native.tsx
 *
 * RN peer of `packages/ui/src/components/Badge/Badge.tsx`. Static geometry
 * (per-size height + padding + gap + radius, slot margins) lives in
 * `./Badge.styles.native.ts`. Brand-resolved paint, the optional ghost
 * border, and label typography flow inline — mirrors web's `--_bg-*`
 * cascade + `var(--Label-{Size}-FontSize)` per-size typography.
 */

import React, { isValidElement, useState, type ReactNode } from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import {
  useSurfaceAppearance,
  useSurfaceTokens,
  useSurfaceContext,
  useTypographyTokens,
  useComponentRecipe,
  useComponentTheme,
  resolveRecipeBorderRadius,
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
  useOneUITheme,
  useBrandMaterial,
  useRoleMaterial,
  useResolvedComponentTokens,
  type NativeRoleTokens,
  type ResolvedMetallicGradient,
  type MaterialAssignmentTarget,
} from '../../theme';
import { MetallicGradientFill } from '../MetallicGradientFill';
import { resolveMetallicPaintFromTokenRefs } from '../../utils/metallicPaint';
import {
  badgeChildrenArePlainText,
  getBadgeRootAccessibilityProps,
  getBadgeSlotWrapAccessibilityProps,
  getBadgeVisibleTextAccessibilityProps,
  badgeSlotsExposeAccessibility,
  resolveBadgeAccessibilityLabel,
  shouldExposeOffscreenBadgeLabel,
  useBadgeState,
  type BadgeProps,
  type BadgeSize,
  type BadgeVariant,
} from './interface';
import {
  styles,
  CONTAINER,
  SLOT_LEFT,
  SLOT_RIGHT,
  SIZE_TO_LABEL,
  VISUALLY_HIDDEN_LABEL,
  RADIUS,
  resolveBadgeContainerPadding,
} from './Badge.styles.native';
import { BADGE_SLOT_SIZES, BadgeSlotSizeProvider } from './BadgeSlotContext';
import { SlotParentAppearanceProvider } from '../../slots/SlotParentAppearanceContext.native';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge.native';
import { CounterBadge } from '../CounterBadge/CounterBadge.native';

interface BadgePaint {
  bg: string;
  text: string;
  bgGradient?: ResolvedMetallicGradient | null;
  borderColor?: string;
  borderWidth?: number;
  strokeWidth?: number;
}

function paintFor(variant: BadgeVariant, role: NativeRoleTokens): BadgePaint {
  switch (variant) {
    case 'bold':
      return { bg: role.surfaces.bold, text: role.onBoldContent.high };
    case 'subtle':
      return { bg: role.surfaces.subtle, text: role.onSubtleContent.tintedA11y };
    case 'ghost':
    default:
      return {
        bg: 'transparent',
        text: role.content.tintedA11y,
        borderColor: role.content.strokeLow,
        borderWidth: tokens.borderWidth.hairline,
      };
  }
}

function resolveSlot(node: ReactNode): ReactNode {
  if (typeof node === 'string') return null;
  if (isValidElement(node)) return node;
  if (node != null && node !== false) return node;
  return null;
}

function slotUsesBadgeInset(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  return node.type === IndicatorBadge || node.type === CounterBadge;
}

function SlotWrap({
  children,
  style,
  slotA11y,
}: {
  children: ReactNode;
  style: ViewStyle;
  slotA11y: { importantForAccessibility?: 'no' | 'no-hide-descendants' };
}): React.ReactElement {
  return (
    <View style={style} {...slotA11y}>
      {children}
    </View>
  );
}

export function Badge(props: BadgeProps): React.ReactElement {
  const surfaceAppearance = useSurfaceAppearance();
  const { resolvedVariant, resolvedAppearance } = useBadgeState(props, surfaceAppearance);
  const { shape } = useOneUITheme();
  const role = useSurfaceTokens(resolvedAppearance);
  const { resolvedRoles } = useSurfaceContext();
  const basePaint = paintFor(resolvedVariant, role);
  const sizeKey = (props.size ?? 'm') as BadgeSize;
  const recipeDecisions = useComponentRecipe('badge');
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  const labelTypo = useTypographyTokens('label', SIZE_TO_LABEL[sizeKey], {
    emphasis: 'medium',
  });
  const scalar = useResolvedComponentTokens('badge', 'label', labelTypo.fontSize);
  const componentTheme = useComponentTheme('badge');
  const brandMaterials = useBrandMaterial();
  const roleMaterial = useRoleMaterial(resolvedAppearance as MaterialAssignmentTarget);

  // Apply metallic paint from tokenRefs (per-component overrides) or role assignment auto-swap
  const metallicOverride =
    resolvedVariant === 'bold'
      ? resolveMetallicPaintFromTokenRefs({
          variant: 'bold',
          tokenRefs: componentTheme.tokenRefs,
          resolvedRoles,
          materials: brandMaterials,
        })
      : {};

  const paint: BadgePaint = {
    ...basePaint,
    ...metallicOverride,
    bgGradient:
      metallicOverride.bgGradient ??
      (resolvedVariant === 'bold' && roleMaterial != null ? roleMaterial : null),
  };

  // When gradient is active, use gradient.text as the on-bold text color if
  // no explicit textColor override was already resolved.
  if (paint.bgGradient && !metallicOverride.text) {
    paint.text = paint.bgGradient.text ?? paint.text;
  }

  const [gradientDims, setGradientDims] = useState<{ w: number; h: number } | null>(null);
  const showGradient = paint.bgGradient != null;

  const start = resolveSlot(props.start);
  const end = resolveSlot(props.end);
  const slotsExposeA11y = badgeSlotsExposeAccessibility(props);
  const rootA11y = getBadgeRootAccessibilityProps(props, slotsExposeA11y);
  const slotWrapA11y = getBadgeSlotWrapAccessibilityProps(props, slotsExposeA11y);
  const plainTextChildren = badgeChildrenArePlainText(props.children);
  const contentA11y = getBadgeVisibleTextAccessibilityProps(props, slotsExposeA11y);
  const offscreenBadgeLabel = shouldExposeOffscreenBadgeLabel(props, slotsExposeA11y);
  const badgeLabel = resolveBadgeAccessibilityLabel(props);

  const hasContent = props.children != null && props.children !== false;
  const hasLabel = Boolean(badgeLabel);

  if (process.env.NODE_ENV !== 'production' && !hasLabel && !hasContent) {
    // eslint-disable-next-line no-console
    console.warn(
      'Badge: an `aria-label` prop is recommended when Badge has no visible text content.'
    );
  }

  const borderRadius =
    resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, shape) ??
    recipeBorderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'display') ??
    RADIUS[sizeKey];

  return (
    <View
      {...rootA11y}
      style={[
        styles.containerBase,
        CONTAINER[sizeKey],
        resolveBadgeContainerPadding(sizeKey, start != null, end != null, {
          startIsBadge: slotUsesBadgeInset(start),
          endIsBadge: slotUsesBadgeInset(end),
        }),
        { borderRadius },
        {
          backgroundColor: showGradient ? 'transparent' : paint.bg,
          overflow: showGradient ? 'hidden' : undefined,
          ...(paint.borderWidth != null
            ? { borderWidth: paint.borderWidth, borderColor: paint.borderColor }
            : null),
        },
        props.style as ViewStyle,
      ]}
      onLayout={showGradient ? e => setGradientDims({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }) : undefined}
      testID={(props as { testID?: string }).testID}
    >
      {showGradient && gradientDims && (
        <MetallicGradientFill
          colors={paint.bgGradient!.colors}
          locations={paint.bgGradient!.locations}
          strokeColors={paint.strokeWidth != null ? paint.bgGradient!.strokeColors : undefined}
          strokeLocations={paint.strokeWidth != null ? paint.bgGradient!.strokeLocations : undefined}
          angle={paint.bgGradient!.angle}
          width={gradientDims.w}
          height={gradientDims.h}
          borderRadius={borderRadius as number}
          borderWidth={paint.strokeWidth}
        />
      )}
      {offscreenBadgeLabel && badgeLabel ? (
        <Text
          accessible
          accessibilityRole="text"
          accessibilityLabel={badgeLabel}
          style={VISUALLY_HIDDEN_LABEL}
        >
          {badgeLabel}
        </Text>
      ) : null}
      {start != null && (
        <SlotWrap style={SLOT_LEFT[sizeKey]} slotA11y={slotWrapA11y}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>
            <BadgeSlotSizeProvider value={BADGE_SLOT_SIZES[sizeKey]}>{start}</BadgeSlotSizeProvider>
          </SlotParentAppearanceProvider>
        </SlotWrap>
      )}
      {hasContent &&
        (plainTextChildren ? (
          <Text
            {...contentA11y}
            numberOfLines={1}
            style={[
              {
                fontSize: scalar.fontSize ?? labelTypo.fontSize,
                lineHeight: scalar.lineHeight ?? labelTypo.lineHeight,
                fontWeight: scalar.fontWeight ?? (String(labelTypo.fontWeight) as TextStyle['fontWeight']),
                fontFamily: scalar.fontFamily ?? labelTypo.fontFamily,
                color: paint.text,
              },
              scalar.textTransform ? { textTransform: scalar.textTransform } : null,
              scalar.letterSpacing != null ? { letterSpacing: scalar.letterSpacing } : null,
            ]}
          >
            {props.children}
          </Text>
        ) : (
          <View {...contentA11y} style={styles.content}>
            {props.children}
          </View>
        ))}
      {end != null && (
        <SlotWrap style={SLOT_RIGHT[sizeKey]} slotA11y={slotWrapA11y}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>
            <BadgeSlotSizeProvider value={BADGE_SLOT_SIZES[sizeKey]}>{end}</BadgeSlotSizeProvider>
          </SlotParentAppearanceProvider>
        </SlotWrap>
      )}
    </View>
  );
}

export type { BadgeProps, BadgeNativeProps } from './interface';
