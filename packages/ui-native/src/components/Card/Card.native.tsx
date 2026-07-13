/**
 * Card.native.tsx
 *
 * RN peer of `packages/ui/src/components/Card/Card.tsx`.
 * Supports both static content panels and interactive clickable cards.
 * Uses Surface context for automatic theme adaptation.
 */

import React from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { Surface, useSurfaceTokens, useElevation } from '../../theme';
import { useCardState, getCardAccessibilityProps, type CardProps } from './interface';
import { styles } from './Card.styles.native';

export function Card(props: CardProps): React.ReactElement {
  const { surface, appearance, children, testID, style, onPress, onClick } = props;
  const s = useCardState(props);
  const role = useSurfaceTokens(s.resolvedAppearance);
  const elevation = useElevation();
  const a11y = getCardAccessibilityProps(props);

  const handlePress = onPress ?? onClick;

  // Visual paint based on tokens.
  const paint = {
    borderColor: role.content.strokeLow,
    // Elevation-0 is default for Card
    ...(elevation.byLevel[0]?.ios ?? {}),
    elevation: elevation.byLevel[0]?.androidElevation ?? 0,
  };

  const interactiveStyle = (pressed: boolean): ViewStyle => {
    const level = pressed ? 2 : 0;
    return {
      ...(elevation.byLevel[level]?.ios ?? {}),
      elevation: elevation.byLevel[level]?.androidElevation ?? 0,
      opacity: pressed ? 0.9 : 1,
    };
  };

  const rootStyles = [
    styles.card,
    paint,
    style,
    !surface && { backgroundColor: role.surfaces.default },
  ] as ViewStyle[];

  const content = <>{children}</>;

  if (surface) {
    if (s.isInteractive) {
      return (
        <Surface
          mode={surface}
          appearance={appearance}
          testID={testID}
          style={rootStyles as unknown as ViewStyle}
        >
          <Pressable
            {...a11y}
            onPress={handlePress}
            style={({ pressed }) => [
              { flex: 1 }, // Ensure pressable fills the card
              s.isInteractive ? interactiveStyle(pressed) : null,
            ]}
          >
            {content}
          </Pressable>
        </Surface>
      );
    }

    return (
      <Surface
        mode={surface}
        appearance={appearance}
        testID={testID}
        style={rootStyles as unknown as ViewStyle}
        {...a11y}
      >
        {content}
      </Surface>
    );
  }

  if (s.isInteractive) {
    return (
      <Pressable
        {...a11y}
        testID={testID}
        onPress={handlePress}
        style={({ pressed }) => [rootStyles, interactiveStyle(pressed)]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View {...a11y} testID={testID} style={rootStyles}>
      {content}
    </View>
  );
}

export type { CardProps } from './interface';
