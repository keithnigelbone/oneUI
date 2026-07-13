/**
 * PaginationItem.native.tsx — numbered page chip (peer of PaginationItem.tsx).
 */

import React, { useMemo } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import { resolvePressableHitSlop } from '../../utils/touchTargetA11y';
import {
  useComponentRecipe,
  useMotion,
  useOneUITheme,
  useReduceMotion,
  useSurfaceAppearance,
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
  resolveRecipeBorderRadius,
  type NativeRoleTokens,
} from '../../theme';
import {
  getPaginationItemAccessibilityProps,
  PAGINATION_TO_LABEL_ROLE_SIZE,
  PAGINATION_TO_PAGE_CHIP_SIZE,
  resolvePaginationAppearance,
  resolvePaginationSize,
  resolvePaginationVariant,
  type PaginationItemProps,
  type PaginationPageChipSize,
  type PaginationVariant,
} from './interface';
import { PAGE_CHIP_SIZE, styles } from './Pagination.styles.native';

interface PageChipPaint {
  backgroundColor: string;
  color: string;
  borderColor?: string;
  borderWidth?: number;
}

function resolveInactivePaint(role: NativeRoleTokens, pressed: boolean): PageChipPaint {
  return {
    backgroundColor: pressed ? role.states.hover : 'transparent',
    color: role.content.high,
  };
}

function resolveSelectedPaint(
  role: NativeRoleTokens,
  variant: PaginationVariant,
  pressed: boolean,
): PageChipPaint {
  if (variant === 'bold') {
    return {
      backgroundColor: pressed ? role.states.boldPressed : role.surfaces.bold,
      color: role.onBoldContent.tintedA11y,
    };
  }
  if (variant === 'subtle') {
    return {
      backgroundColor: pressed ? role.states.subtlePressed : role.surfaces.subtle,
      color: role.onSubtleContent.tintedA11y,
    };
  }
  return {
    backgroundColor: pressed ? role.states.hover : 'transparent',
    color: role.content.tintedA11y,
    borderColor: role.surfaces.bold,
    borderWidth: tokens.borderWidth.hairline,
  };
}

export function PaginationItem({
  page,
  selected = false,
  disabled = false,
  attention = 'medium',
  size,
  appearance,
  onSelect,
  onPress,
  'aria-label': ariaLabelProp,
  accessibilityHint,
  focusable,
  style: styleProp,
  testID,
}: PaginationItemProps): React.ReactElement {
  const resolvedRowSize = resolvePaginationSize(size);
  const chipSize: PaginationPageChipSize = PAGINATION_TO_PAGE_CHIP_SIZE[resolvedRowSize];
  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance = resolvePaginationAppearance(appearance, parentAppearance);
  const chipAppearance = selected ? resolvedAppearance : (parentAppearance ?? 'neutral');
  const selectedVariant = resolvePaginationVariant(attention);
  const role = useSurfaceTokens(chipAppearance);
  const labelTypo = useTypographyTokens('label', PAGINATION_TO_LABEL_ROLE_SIZE[chipSize], {
    emphasis: 'medium',
  });
  const recipeDecisions = useComponentRecipe('pagination');
  const theme = useOneUITheme();
  const borderRadius =
    resolveRecipeBorderRadius(recipeDecisions, theme.shape) ?? theme.shape.Pill;
  const motion = useMotion();
  const reduceMotion = useReduceMotion();
  const a11y = getPaginationItemAccessibilityProps({
    page,
    selected,
    disabled,
    'aria-label': ariaLabelProp,
    accessibilityHint,
  });

  const geometry = useMemo(
    () => ({
      ...PAGE_CHIP_SIZE[chipSize],
      borderRadius,
    }),
    [chipSize, borderRadius],
  );

  if (process.env.NODE_ENV !== 'production' && (page === undefined || page < 1)) {
    // eslint-disable-next-line no-console
    console.warn('[PaginationItem] `page` is required and must be >= 1.');
  }

  return (
    <Pressable
      {...a11y}
      disabled={disabled}
      focusable={focusable ?? true}
      onPress={() => {
        onPress?.();
        if (disabled) return;
        onSelect?.(page ?? 0);
      }}
      hitSlop={resolvePressableHitSlop(
        typeof geometry.minWidth === 'number' ? geometry.minWidth : undefined,
        typeof geometry.minHeight === 'number' ? geometry.minHeight : tokens.spacing['8'],
      )}
      testID={testID}
      style={styleProp as ViewStyle}
    >
      {({ pressed }) => {
        const paint = selected
          ? resolveSelectedPaint(role, selectedVariant, pressed && !disabled)
          : resolveInactivePaint(role, pressed && !disabled);
        const scale =
          pressed && !disabled && !reduceMotion ? 1 - motion.tapScale.default / 100 : 1;
        return (
          <View
            style={[
              styles.pageChipPressable,
              geometry,
              {
                backgroundColor: paint.backgroundColor,
                borderColor: paint.borderColor,
                borderWidth: paint.borderWidth ?? 0,
                transform: [{ scale }],
              },
            ]}
          >
            <Text
              importantForAccessibility="no"
              accessibilityElementsHidden
              style={[
                styles.pageChipLabel,
                typographyToTextStyle(labelTypo),
                { color: paint.color },
              ]}
            >
              {String(page ?? 1)}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}
