import { describe, expect, it } from 'vitest';
import { getIconButtonAccessibilityProps, useIconButtonState } from './interface';

describe('IconButton accessibility', () => {
  it('resolves paint mode from attention only', () => {
    expect(useIconButtonState({ icon: 'add', 'aria-label': 'Add', attention: 'high' }).resolvedVariant).toBe(
      'bold',
    );
    expect(useIconButtonState({ icon: 'add', 'aria-label': 'Add', attention: 'medium' }).resolvedVariant).toBe(
      'subtle',
    );
    expect(useIconButtonState({ icon: 'add', 'aria-label': 'Add', attention: 'low' }).resolvedVariant).toBe(
      'ghost',
    );
    expect(useIconButtonState({ icon: 'add', 'aria-label': 'Add' }).resolvedVariant).toBe('bold');
  });

  it('requires aria-label as accessibilityLabel', () => {
    const props = getIconButtonAccessibilityProps(
      { 'aria-label': 'Close', loading: false, disabled: false },
      { isDisabled: false },
    );
    expect(props.accessibilityLabel).toBe('Close');
    expect(props.accessibilityRole).toBe('button');
  });

  it('loading reports busy but NOT disabled', () => {
    const props = getIconButtonAccessibilityProps(
      { 'aria-label': 'Save', loading: true, disabled: false },
      { isDisabled: false },
    );
    expect(props.accessibilityState.busy).toBe(true);
    expect(props.accessibilityState.disabled).toBe(false);
  });

  it('disabled reports disabled', () => {
    const props = getIconButtonAccessibilityProps(
      { 'aria-label': 'Save', loading: false, disabled: true },
      { isDisabled: true },
    );
    expect(props.accessibilityState.disabled).toBe(true);
  });

  it('exposes focusable and aria-haspopup', () => {
    const props = getIconButtonAccessibilityProps(
      { 'aria-label': 'More', 'aria-haspopup': 'menu', loading: false, disabled: false },
      { isDisabled: false },
    );
    expect(props.focusable).toBe(true);
    expect(props['aria-haspopup']).toBe('menu');
  });

  it('maps aria-expanded', () => {
    expect(
      getIconButtonAccessibilityProps(
        { 'aria-label': 'Menu', 'aria-expanded': false, loading: false, disabled: false },
        { isDisabled: false },
      ).accessibilityState.expanded,
    ).toBe(false);
  });

  it('forwards accessibilityHint', () => {
    expect(
      getIconButtonAccessibilityProps(
        {
          'aria-label': 'Add',
          accessibilityHint: 'Adds an item',
          loading: false,
          disabled: false,
        },
        { isDisabled: false },
      ).accessibilityHint,
    ).toBe('Adds an item');
  });
});
