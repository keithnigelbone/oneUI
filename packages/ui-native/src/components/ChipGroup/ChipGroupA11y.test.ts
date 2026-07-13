import { describe, expect, it } from 'vitest';
import {
  getChipGroupAccessibilityProps,
  getChipGroupContainerAccessibilityProps,
  getChipGroupNameAccessibilityProps,
} from './interface';

describe('ChipGroup container accessibility', () => {
  it('keeps the container non-accessible so child Chips remain focusable', () => {
    expect(getChipGroupContainerAccessibilityProps()).toEqual({
      accessible: false,
      importantForAccessibility: 'no',
    });
  });

  it('uses importantForAccessibility no (not no-hide-descendants) so Chips stay reachable', () => {
    expect(getChipGroupContainerAccessibilityProps().importantForAccessibility).toBe('no');
    expect(getChipGroupContainerAccessibilityProps().importantForAccessibility).not.toBe(
      'no-hide-descendants'
    );
  });

  it('does not mark the container accessible when aria-label is set', () => {
    const props = getChipGroupAccessibilityProps({ 'aria-label': 'Category filter' });
    expect(props.accessible).toBe(false);
    expect(props.importantForAccessibility).toBe('no');
  });

  it('does not mark the container accessible when aria-labelledby is set', () => {
    const props = getChipGroupAccessibilityProps({ 'aria-labelledby': 'group-heading' });
    expect(props.accessible).toBe(false);
  });

  it('forwards aria-labelledby as accessibilityLabelledBy on the container', () => {
    const props = getChipGroupAccessibilityProps({ 'aria-labelledby': 'group-heading' });
    expect(props.accessibilityLabelledBy).toBe('group-heading');
    expect(props.importantForAccessibility).toBe('no');
  });

  it('does not set accessibilityLabelledBy without aria-labelledby', () => {
    const props = getChipGroupAccessibilityProps({ 'aria-label': 'Category filter' });
    expect(props.accessibilityLabelledBy).toBeUndefined();
  });
});

describe('ChipGroup name accessibility', () => {
  it('exposes aria-label on a separate header node', () => {
    const props = getChipGroupNameAccessibilityProps({ 'aria-label': 'Category filter' });
    expect(props).toEqual({
      accessible: true,
      accessibilityRole: 'header',
      accessibilityLabel: 'Category filter',
    });
  });

  it('returns null when aria-labelledby references an external heading', () => {
    expect(getChipGroupNameAccessibilityProps({ 'aria-labelledby': 'group-heading' })).toBeNull();
  });

  it('prefers aria-labelledby over aria-label for the inline name node', () => {
    expect(
      getChipGroupNameAccessibilityProps({
        'aria-label': 'Category filter',
        'aria-labelledby': 'group-heading',
      })
    ).toBeNull();
  });

  it('forwards accessibilityHint on the name node', () => {
    expect(
      getChipGroupNameAccessibilityProps({
        'aria-label': 'Filters',
        accessibilityHint: 'Choose categories',
      })?.accessibilityHint
    ).toBe('Choose categories');
  });

  it('returns null without a group name', () => {
    expect(getChipGroupNameAccessibilityProps({})).toBeNull();
  });
});
