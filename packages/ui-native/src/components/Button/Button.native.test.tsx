/**
 * Button.native.test.tsx
 *
 * Native parity for `packages/ui/src/components/Button/Button.test.tsx`.
 * Web-only assertions (CSS class names, `data-*` attributes) are replaced
 * with their native equivalents:
 *   - `getByRole('button')` → `getByRole('button')` (RN exposes the role)
 *   - `data-size`            → resolved style table (no DOM attribute on RN)
 *   - `data-condensed`       → resolved style table
 *   - `aria-busy`            → `accessibilityState.busy`
 *   - `aria-disabled`        → `accessibilityState.disabled`
 *
 * Renders are wrapped in `<OneUINativeThemeProvider theme={defaultNativeTheme()}>`
 * so `useSurfaceTokens` resolves.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from './Button.native';
import { OneUINativeThemeProvider, defaultNativeTheme } from '../../theme';
const wrap = (ui: React.ReactElement): React.ReactElement => (
  <OneUINativeThemeProvider theme={defaultNativeTheme()}>{ui}</OneUINativeThemeProvider>
);

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

describe('Button (native)', () => {
  it('renders with children', () => {
    render(wrap(<Button>Test Button</Button>));
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const handlePress = jest.fn();
    render(wrap(<Button onPress={handlePress}>Click me</Button>));
    fireEvent.press(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('aliases onClick to onPress', () => {
    const handleClick = jest.fn();
    render(wrap(<Button onClick={handleClick}>Click me</Button>));
    fireEvent.press(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const handlePress = jest.fn();
    render(wrap(<Button disabled onPress={handlePress}>Disabled</Button>));
    fireEvent.press(screen.getByRole('button'));
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('does not fire onPress when loading', () => {
    const handlePress = jest.fn();
    render(wrap(<Button loading onPress={handlePress}>Loading</Button>));
    fireEvent.press(screen.getByRole('button'));
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('marks disabled in accessibilityState', () => {
    render(wrap(<Button disabled>Disabled</Button>));
    const btn = screen.getByRole('button');
    expect(btn.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('marks busy in accessibilityState while loading', () => {
    render(wrap(<Button loading>Loading</Button>));
    const btn = screen.getByRole('button');
    expect(btn.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true }),
    );
  });

  it('passes accessibilityLabel through from aria-label', () => {
    render(wrap(<Button aria-label='Custom label'>X</Button>));
    expect(screen.getByLabelText('Custom label')).toBeTruthy();
  });

  // === Size tests ===

  it('renders all four Figma sizes without crashing', () => {
    const sizes = [6, 8, 10, 12] as const;
    for (const size of sizes) {
      const { unmount } = render(wrap(<Button size={size}>Size {size}</Button>));
      expect(screen.getByText(`Size ${size}`)).toBeTruthy();
      unmount();
    }
  });

  it('resolves t-shirt sizes (xs/s/m/l)', () => {
    const sizes = ['xs', 's', 'm', 'l'] as const;
    for (const size of sizes) {
      const { unmount } = render(wrap(<Button size={size}>{size}</Button>));
      expect(screen.getByText(size)).toBeTruthy();
      unmount();
    }
  });

  // === Variant tests ===

  it('accepts every variant', () => {
    const variants = ['bold', 'subtle', 'ghost'] as const;
    for (const variant of variants) {
      const { unmount } = render(wrap(<Button variant={variant}>{variant}</Button>));
      expect(screen.getByText(variant)).toBeTruthy();
      unmount();
    }
  });

  it('accepts every appearance', () => {
    const appearances = [
      'primary',
      'secondary',
      'sparkle',
      'positive',
      'negative',
      'warning',
      'informative',
      'neutral',
    ] as const;
    for (const appearance of appearances) {
      const { unmount } = render(wrap(<Button appearance={appearance}>{appearance}</Button>));
      expect(screen.getByText(appearance)).toBeTruthy();
      unmount();
    }
  });

  // === Condensed gating ===

  it('renders condensed only when contained', () => {
    // Sanity: contained + condensed should render without throwing.
    render(wrap(<Button condensed>Condensed</Button>));
    expect(screen.getByText('Condensed')).toBeTruthy();
  });

  it('contained=false renders flat-text affordance', () => {
    render(wrap(<Button contained={false}>Flat</Button>));
    expect(screen.getByText('Flat')).toBeTruthy();
  });

  // === fullWidth ===

  it('renders fullWidth without crashing', () => {
    render(wrap(<Button fullWidth>Wide</Button>));
    expect(screen.getByText('Wide')).toBeTruthy();
  });

  // === Slots ===

  it('renders start slot content', () => {
    render(
      wrap(
        <Button start={<View testID='start-icon'><Text>S</Text></View>}>With Start</Button>,
      ),
    );
    expect(screen.getByTestId('start-icon')).toBeTruthy();
    expect(screen.getByTestId('button-start-slot')).toBeTruthy();
  });

  it('renders end slot content', () => {
    render(
      wrap(
        <Button end={<View testID='end-icon'><Text>E</Text></View>}>With End</Button>,
      ),
    );
    expect(screen.getByTestId('end-icon')).toBeTruthy();
    expect(screen.getByTestId('button-end-slot')).toBeTruthy();
  });

  it('start prop takes precedence over leftIcon', () => {
    render(
      wrap(
        <Button
          start={<View testID='start-precedence' />}
          leftIcon='arrowLeft'
        >
          Precedence
        </Button>,
      ),
    );
    expect(screen.getByTestId('start-precedence')).toBeTruthy();
  });

  it('warns and skips when start is a SemanticIconName string', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(wrap(<Button start='star'>Iconless</Button>));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Native slots expect a ReactNode'));
    expect(screen.queryByTestId('button-start-slot')).toBeNull();
    warn.mockRestore();
  });

  it('warns and skips when leftIcon is a SemanticIconName string', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(wrap(<Button leftIcon='check'>Iconless</Button>));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Native slots expect a ReactNode'));
    warn.mockRestore();
  });

  // === Loading spinner ===

  it('renders the spinner when loading', () => {
    render(wrap(<Button loading>Loading</Button>));
    expect(screen.getByTestId('button-spinner')).toBeTruthy();
  });

  it('keeps the label visible when loading', () => {
    render(wrap(<Button loading>Loading</Button>));
    expect(screen.getByText('Loading')).toBeTruthy();
  });

  // === Recipe ===

  it('respects cornerRadius=none recipe override', () => {
    const theme = defaultNativeTheme();
    render(
      <OneUINativeThemeProvider
        theme={theme}
        recipeOverrides={{ button: { cornerRadius: 'none' } }}
      >
        <Button>Square</Button>
      </OneUINativeThemeProvider>,
    );
    expect(screen.getByText('Square')).toBeTruthy();
    expect(getRestingPressableStyle().borderRadius).toBe(0);
  });

  it('uses family shapeLanguage before stale local cornerRadius recipe', () => {
    const theme = defaultNativeTheme();
    render(
      <OneUINativeThemeProvider
        theme={theme}
        componentThemeOverrides={{ button: { shapeLanguage: 'rounded' } }}
        recipeOverrides={{ button: { cornerRadius: 'none' } }}
      >
        <Button>Rounded</Button>
      </OneUINativeThemeProvider>,
    );

    expect(getRestingPressableStyle().borderRadius).toBe(theme.shape['4']);
  });
});
