import { describe, expect, it } from 'vitest';
import {
  getChipAccessibilityProps,
  resolveChipAccessibilityLabel,
} from './interface';

describe('Chip accessibility', () => {
  it('maps aria-label to accessibilityLabel', () => {
    const props = getChipAccessibilityProps(
      { 'aria-label': 'Filter', children: 'Chip' },
      { isSelected: false, isDisabled: false },
    );
    expect(props.accessibilityLabel).toBe('Filter');
    expect(props.accessibilityRole).toBe('button');
    expect(props.focusable).toBe(true);
    expect(props.accessibilityState.selected).toBe(false);
  });

  it('falls back to string children for the label', () => {
    expect(resolveChipAccessibilityLabel({ children: 'Beta' })).toBe('Beta');
  });

  it('reflects selected state in accessibilityState', () => {
    expect(
      getChipAccessibilityProps({ children: 'Chip' }, { isSelected: true, isDisabled: false })
        .accessibilityState.selected,
    ).toBe(true);
  });

  it('maps native-only accessibilityHint', () => {
    expect(
      getChipAccessibilityProps(
        { children: 'Chip', accessibilityHint: 'Double tap to toggle' },
        { isSelected: false, isDisabled: false },
      ).accessibilityHint,
    ).toBe('Double tap to toggle');
  });

  it('marks disabled in accessibilityState from resolved isDisabled', () => {
    expect(
      getChipAccessibilityProps({ children: 'Chip' }, { isSelected: false, isDisabled: true })
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it('marks disabled in accessibilityState when ChipGroup disables the chip', () => {
    expect(
      getChipAccessibilityProps({ children: 'News' }, { isSelected: true, isDisabled: true })
        .accessibilityState,
    ).toEqual({ disabled: true, selected: true });
  });
});
