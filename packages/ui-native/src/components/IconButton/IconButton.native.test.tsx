import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { IconButton } from './IconButton.native';
import { OneUINativeThemeProvider, defaultNativeTheme } from '../../theme';

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, item) => ({ ...acc, ...flattenStyle(item) }),
      {}
    );
  }
  if (style && typeof style === 'object') {
    return style as Record<string, unknown>;
  }
  return {};
}

function getRestingPressableStyle(): Record<string, unknown> {
  const button = screen.getByRole('button');
  const style = button.props.style;
  return flattenStyle(
    typeof style === 'function'
      ? style({ pressed: false, hovered: false, focused: false })
      : style
  );
}

describe('IconButton (native)', () => {
  it('uses local cornerRadius recipe when no family shape is set', () => {
    const theme = defaultNativeTheme();
    render(
      <OneUINativeThemeProvider
        theme={theme}
        recipeOverrides={{ iconbutton: { cornerRadius: 'none' } }}
      >
        <IconButton icon={<View testID="glyph" />} aria-label="Add" />
      </OneUINativeThemeProvider>
    );

    expect(getRestingPressableStyle().borderRadius).toBe(0);
  });

  it('uses family shapeLanguage before stale local cornerRadius recipe', () => {
    const theme = defaultNativeTheme();
    render(
      <OneUINativeThemeProvider
        theme={theme}
        componentThemeOverrides={{ iconbutton: { shapeLanguage: 'rounded' } }}
        recipeOverrides={{ iconbutton: { cornerRadius: 'none' } }}
      >
        <IconButton icon={<View testID="glyph" />} aria-label="Add" />
      </OneUINativeThemeProvider>
    );

    expect(getRestingPressableStyle().borderRadius).toBe(theme.shape['4']);
  });
});
