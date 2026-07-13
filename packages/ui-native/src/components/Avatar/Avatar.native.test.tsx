/**
 * Avatar.native.test.tsx
 *
 * Native coverage for initials, image error fallback, and text→icon at 2XS.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { getInitials } from './interface';
import { Avatar } from './Avatar.native';
import { getAvatarContainerSide } from './avatarLayout';
import { OneUINativeThemeProvider, defaultNativeTheme } from '../../theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <OneUINativeThemeProvider theme={defaultNativeTheme()}>{ui}</OneUINativeThemeProvider>
);

describe('Avatar (native)', () => {
  it('extracts initials via shared getInitials', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('renders text variant initials at readable sizes', () => {
    render(wrap(<Avatar content='text' alt='John Doe' size='xl' />));
    expect(screen.getByText('JD')).toBeTruthy();
    expect(screen.getByRole('image', { name: 'John Doe' })).toBeTruthy();
  });

  it('falls back from image to icon slot when the image errors', () => {
    render(
      wrap(
        <Avatar content='image' src='https://invalid.example/broken.jpg' alt='Jane Smith' size='xl' />,
      ),
    );
    const img = screen.getByTestId('avatar-native-image');
    fireEvent(img, 'error');
    expect(screen.queryByTestId('avatar-native-image')).toBeNull();
    expect(screen.getByRole('image', { name: 'Jane Smith' })).toBeTruthy();
  });

  it('uses icon path for text variant at 2xs (no initials text)', () => {
    render(wrap(<Avatar content='text' alt='John Doe' size='2xs' />));
    expect(screen.queryByText('JD')).toBeNull();
    expect(screen.getByRole('image', { name: 'John Doe' })).toBeTruthy();
  });

  it('container side matches theme spacing tokens (web Spacing-* parity)', () => {
    const theme = defaultNativeTheme();
    const cases = [
      ['2xs', theme.spacing['2']],
      ['xs', theme.spacing['3']],
      ['s', theme.spacing['4']],
      ['m', theme.spacing['5']],
      ['l', theme.spacing['6']],
      ['xl', theme.spacing['8']],
      ['2xl', theme.spacing['10']],
    ] as const;
    for (const [size, expected] of cases) {
      expect(getAvatarContainerSide(theme.spacing, size)).toBe(expected);
      const { unmount } = render(wrap(<Avatar content='text' alt='JD' size={size} />));
      const node = screen.getByRole('image');
      const flat = StyleSheet.flatten(node.props.style);
      expect(flat.width).toBe(expected);
      expect(flat.height).toBe(expected);
      unmount();
    }
  });

  it('respects avatar recipe cornerRadius none', () => {
    render(
      <OneUINativeThemeProvider
        theme={defaultNativeTheme()}
        recipeOverrides={{ avatar: { cornerRadius: 'none' } }}
      >
        <Avatar content='text' alt='J' size='m' />
      </OneUINativeThemeProvider>,
    );
    const node = screen.getByRole('image');
    const flat = StyleSheet.flatten(node.props.style);
    expect(flat.borderRadius).toBe(0);
  });
});
