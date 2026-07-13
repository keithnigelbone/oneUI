/**
 * Stack-header right button that flips between `light` and `dark` mode.
 */

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { typography } from '@oneui/tokens';
import { useThemeMode } from '../ThemeModeContext';

export function ThemeToggleButton(): React.ReactElement {
  const { mode, toggle } = useThemeMode();
  const label = mode === 'light' ? 'Dark' : 'Light';
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={`Switch to ${label.toLowerCase()} theme`}
      testID='theme-toggle'
      onPress={toggle}
      style={styles.button}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
});
