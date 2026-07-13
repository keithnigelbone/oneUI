import { describe, expect, it } from 'vitest';
import { resolveBottomNavigationItemActive } from './interface';

describe('resolveBottomNavigationItemActive', () => {
  it('ignores explicit active when parent value selects another item', () => {
    expect(
      resolveBottomNavigationItemActive(
        { value: 'home', active: true },
        'settings',
        true,
      ),
    ).toBe(false);
    expect(resolveBottomNavigationItemActive({ value: 'settings' }, 'settings', true)).toBe(
      true,
    );
  });

  it('allows explicit active when parent has no selection value (showcase)', () => {
    expect(
      resolveBottomNavigationItemActive({ value: 'home', active: true }, undefined, true),
    ).toBe(true);
  });

  it('allows explicit active outside BottomNavigation', () => {
    expect(resolveBottomNavigationItemActive({ active: true }, undefined, false)).toBe(true);
  });

  it('defaults to inactive when no active prop and no group match', () => {
    expect(resolveBottomNavigationItemActive({ value: 'home' }, 'settings', true)).toBe(false);
  });
});
