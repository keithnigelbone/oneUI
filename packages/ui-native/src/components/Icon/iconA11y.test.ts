import { describe, expect, it } from 'vitest';
import { formatIconName, getIconShellAccessibilityProps } from './interface';

describe('formatIconName (JDS parity)', () => {
  it('formats IcPascalCase catalog ids', () => {
    expect(formatIconName('IcAdd')).toBe('add icon');
    expect(formatIconName('IcChevronDown')).toBe('chevron down icon');
  });

  it('formats ic_snake_case catalog ids', () => {
    expect(formatIconName('ic_star')).toBe('star icon');
  });

  it('falls back for kebab-case and camelCase semantic keys', () => {
    expect(formatIconName('ic-star')).toBe('Ic Star');
    expect(formatIconName('chevronDown')).toBe('chevron down');
    expect(formatIconName('add')).toBe('add');
  });
});

describe('getIconShellAccessibilityProps', () => {
  it('uses explicit aria-label when not hidden', () => {
    const props = getIconShellAccessibilityProps({ ariaLabel: 'Favorite' });
    expect(props.accessibilityLabel).toBe('Favorite');
    expect(props.accessible).toBe(true);
    expect(props.accessibilityRole).toBe('image');
  });

  it('derives label from catalog id when aria-label is omitted', () => {
    expect(
      getIconShellAccessibilityProps({ catalogIconName: 'IcAdd' }).accessibilityLabel,
    ).toBe('add icon');
  });

  it('derives label from semantic name when catalog id is omitted', () => {
    expect(getIconShellAccessibilityProps({ semanticName: 'add' }).accessibilityLabel).toBe(
      'add',
    );
  });

  it('prefers catalog id over semantic name for defaults', () => {
    expect(
      getIconShellAccessibilityProps({ catalogIconName: 'IcAdd', semanticName: 'add' })
        .accessibilityLabel,
    ).toBe('add icon');
  });

  it('hides decorative icons', () => {
    const props = getIconShellAccessibilityProps({ ariaHidden: true, ariaLabel: 'Ignored' });
    expect(props.accessible).toBe(false);
    expect(props.accessibilityElementsHidden).toBe(true);
    expect(props.accessibilityLabel).toBeUndefined();
  });
});
