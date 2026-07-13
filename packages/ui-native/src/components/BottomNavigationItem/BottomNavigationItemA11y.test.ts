import { describe, expect, it } from 'vitest';
import {
  getBottomNavigationItemAccessibilityProps,
  humanizeBottomNavigationValue,
  resolveBottomNavigationItemAccessibilityLabel,
} from './interface';

describe('BottomNavigationItem accessibility', () => {
  it('maps aria-label to accessibilityLabel on the tab', () => {
    const props = getBottomNavigationItemAccessibilityProps(
      { 'aria-label': 'Home tab' },
      { isActive: true },
    );
    expect(props.accessibilityLabel).toBe('Home tab');
    expect(props.accessibilityRole).toBe('tab');
    expect(props.accessibilityState.selected).toBe(true);
  });

  it('falls back to visible label', () => {
    expect(resolveBottomNavigationItemAccessibilityLabel({ label: 'Search' })).toBe('Search');
  });

  it('falls back to humanized value for icon-only tabs', () => {
    expect(resolveBottomNavigationItemAccessibilityLabel({ value: 'my-saved-favorites' })).toBe(
      'My Saved Favorites',
    );
    expect(
      getBottomNavigationItemAccessibilityProps({ value: 'settings' }, { isActive: false })
        .accessibilityLabel,
    ).toBe('Settings');
  });

  it('uses generic Tab label when no name source is provided', () => {
    expect(resolveBottomNavigationItemAccessibilityLabel({})).toBe('Tab');
  });

  it('prefers aria-label over label and value', () => {
    expect(
      resolveBottomNavigationItemAccessibilityLabel({
        'aria-label': 'Custom',
        label: 'Home',
        value: 'home',
      }),
    ).toBe('Custom');
  });

  it('reflects disabled state', () => {
    expect(
      getBottomNavigationItemAccessibilityProps(
        { label: 'Home', disabled: true },
        { isActive: false },
      ).accessibilityState.disabled,
    ).toBe(true);
  });

  it('forwards accessibilityHint', () => {
    expect(
      getBottomNavigationItemAccessibilityProps(
        { label: 'Home', accessibilityHint: 'Go to home screen' },
        { isActive: false },
      ).accessibilityHint,
    ).toBe('Go to home screen');
  });
});

describe('humanizeBottomNavigationValue', () => {
  it('title-cases hyphenated and underscored values', () => {
    expect(humanizeBottomNavigationValue('account-profile')).toBe('Account Profile');
    expect(humanizeBottomNavigationValue('my_account')).toBe('My Account');
  });
});
