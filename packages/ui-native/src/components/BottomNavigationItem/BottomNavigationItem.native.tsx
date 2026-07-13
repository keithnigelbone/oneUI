/**
 * BottomNavigationItem.native.tsx — RN peer of BottomNavigation/BottomNavItem.tsx
 */

import React, { isValidElement, useCallback, type ReactElement } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import type { IconComponent, SemanticIconName } from '@oneui/shared';
import { useBottomNavigationContext } from '../BottomNavigation/BottomNavigationContext';
import { Icon } from '../Icon';
import {
  useComponentRecipe,
  useComponentTheme,
  useOneUITheme,
  useSurfaceTokens,
  useTypographyTokens,
  resolveRecipeBorderRadius,
  resolveShapeLanguageBorderRadius,
  type NativeRoleTokens,
} from '../../theme';
import { asIconAppearance, type IconAppearance } from '../Icon/interface';
import {
  getBottomNavigationItemAccessibilityProps,
  useBottomNavigationItemState,
  type BottomNavigationItemProps,
} from './interface';
import {
  DISABLED_OPACITY,
  ICON_SIZE,
  itemHeight,
  styles,
} from './BottomNavigationItem.styles.native';

function resolveIconContent(
  icon: SemanticIconName | ReactElement | IconComponent,
  appearance: IconAppearance,
  iconSizePx: number,
): React.ReactElement | null {
  if (isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === 'function' || typeof icon === 'string') {
    return (
      <Icon
        icon={icon as IconComponent | SemanticIconName}
        appearance={appearance}
        size={iconSizePx}
        aria-hidden
      />
    );
  }
  return null;
}

function coloursFor(role: NativeRoleTokens, isActive: boolean) {
  return {
    label: isActive ? role.content.high : role.content.low,
    innerPressed: role.states.pressed,
  };
}

export function BottomNavigationItem(props: BottomNavigationItemProps): React.ReactElement {
  const {
    icon,
    activeIcon,
    label,
    value,
    href,
    onClick,
    onPress,
    disabled,
    style: styleProp,
    testID,
  } = props;

  const ctx = useBottomNavigationContext();
  const { labelType, resolvedAppearance, isActive, showLabel, iconSizePx } =
    useBottomNavigationItemState(props);
  const role = useSurfaceTokens(resolvedAppearance);
  const { shape } = useOneUITheme();
  const recipeDecisions = useComponentRecipe('bottom-navigation');
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  const componentTheme = useComponentTheme('bottomnavigation');
  const itemRadius =
    recipeBorderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'actions');
  const labelTypo = useTypographyTokens('label', 'XS', {
    emphasis: 'medium',
    lineHeightMultiplier: 1,
  });

  const effectiveIcon = isActive && activeIcon ? activeIcon : icon;
  const iconPx = iconSizePx === 'large' ? ICON_SIZE.large : ICON_SIZE.default;
  const palette = coloursFor(role, isActive);
  const a11y = getBottomNavigationItemAccessibilityProps(props, { isActive });

  if (process.env.NODE_ENV !== 'production') {
    const hasExplicitName = Boolean(props['aria-label']?.trim() || props.label?.trim());
    if (labelType === 'none' && !hasExplicitName && !props.value?.trim()) {
      // eslint-disable-next-line no-console
      console.warn(
        'BottomNavigationItem: provide `aria-label`, `label`, or `value` when `labelType` is "none" so the tab has a meaningful accessible name.',
      );
    }
  }

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress?.();
    onClick?.();
    if (href) {
      void Linking.openURL(href);
    }
    if (value !== undefined && ctx) {
      ctx.onValueChange(value);
    }
  }, [ctx, disabled, href, onClick, onPress, value]);

  return (
    <Pressable
      accessible={a11y.accessible}
      accessibilityRole={a11y.accessibilityRole}
      accessibilityLabel={a11y.accessibilityLabel}
      accessibilityHint={a11y.accessibilityHint}
      accessibilityState={a11y.accessibilityState}
      disabled={disabled}
      onPress={handlePress}
      testID={testID}
      style={[
        styles.pressable,
        { height: itemHeight(labelType), opacity: disabled ? DISABLED_OPACITY : 1 },
        styleProp,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.inner,
            itemRadius != null ? { borderRadius: itemRadius } : null,
            pressed && !disabled ? { backgroundColor: palette.innerPressed } : null,
          ]}
        >
          <View style={styles.iconSlot} testID={testID ? `${testID}-icon` : undefined}>
            {resolveIconContent(
              effectiveIcon,
              isActive ? asIconAppearance(resolvedAppearance) : 'neutral',
              iconPx,
            )}
          </View>
          {showLabel && label != null && (
            <Text
              accessible={false}
              importantForAccessibility="no"
              numberOfLines={labelType === '2line' ? 2 : 1}
              testID={testID ? `${testID}-label` : undefined}
              style={[
                labelType === '2line' ? styles.labelTwoLine : styles.labelOneLine,
                {
                  fontSize: labelTypo.fontSize,
                  lineHeight: labelTypo.lineHeight,
                  fontWeight: labelTypo.fontWeight,
                  fontFamily: labelTypo.fontFamily,
                  color: palette.label,
                },
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

/** Web export name (`BottomNavItem`). */
export const BottomNavItem = BottomNavigationItem;

export type { BottomNavigationItemProps, BottomNavItemProps } from './interface';
