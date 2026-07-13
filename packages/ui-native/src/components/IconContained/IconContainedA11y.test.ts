import { describe, expect, it } from 'vitest';
import {
  getIconContainedAccessibilityProps,
  useIconContainedState,
} from './interface';

describe('iconContainedA11y', () => {
  it('exposes labelled containers as image role', () => {
    const a11y = getIconContainedAccessibilityProps(
      { 'aria-label': 'Heart' },
      { isDisabled: false },
    );
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('image');
    expect(a11y.accessibilityLabel).toBe('Heart');
    expect(a11y.accessibilityElementsHidden).toBe(false);
    expect(a11y.importantForAccessibility).toBeUndefined();
  });

  it('treats unlabeled containers as decorative (accessible=false)', () => {
    const a11y = getIconContainedAccessibilityProps({}, { isDisabled: false });
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityLabel).toBeUndefined();
  });

  it('removes the subtree from a11y tree when aria-hidden=true', () => {
    const a11y = getIconContainedAccessibilityProps(
      { 'aria-label': 'Heart', 'aria-hidden': true },
      { isDisabled: false },
    );
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('maps disabled state', () => {
    const a11y = getIconContainedAccessibilityProps(
      { 'aria-label': 'Heart' },
      { isDisabled: true },
    );
    expect(a11y.accessibilityState).toEqual({ disabled: true });
  });

  it('forwards native-only accessibilityHint', () => {
    const a11y = getIconContainedAccessibilityProps(
      { 'aria-label': 'Heart', accessibilityHint: 'Opens favourites' },
      { isDisabled: false },
    );
    expect(a11y.accessibilityHint).toBe('Opens favourites');
  });
});

describe('useIconContainedState', () => {
  it('defaults size=m, attention=high, appearance=primary, disabled=false', () => {
    const state = useIconContainedState({ icon: 'heart' });
    expect(state.resolvedSize).toBe('m');
    expect(state.resolvedAttention).toBe('high');
    expect(state.resolvedAppearance).toBe('primary');
    expect(state.isDisabled).toBe(false);
  });

  it('resolves auto appearance to primary', () => {
    const state = useIconContainedState({ icon: 'heart', appearance: 'auto' });
    expect(state.resolvedAppearance).toBe('primary');
  });

  it('keeps explicit appearance', () => {
    const state = useIconContainedState({ icon: 'heart', appearance: 'positive' });
    expect(state.resolvedAppearance).toBe('positive');
  });

  it('emits cross-platform data attributes mirroring web', () => {
    const state = useIconContainedState({
      icon: 'heart',
      size: 'l',
      attention: 'medium',
      appearance: 'negative',
    });
    expect(state.dataAttrs).toEqual({
      'data-size': 'l',
      'data-attention': 'medium',
      'data-appearance': 'negative',
    });
  });

  it('marks disabled state via the resolver', () => {
    const state = useIconContainedState({ icon: 'heart', disabled: true });
    expect(state.isDisabled).toBe(true);
  });
});
