import { describe, expect, it } from 'vitest';
import { useIconButtonState } from '@ui-native/components/IconButton/interface';

describe('IconButton accessibility props', () => {
  it('[a11y] aria-label is forwarded to ariaProps', () => {
    const state = useIconButtonState({ icon: 'close', 'aria-label': 'Close' });
    expect(state.ariaProps['aria-label']).toBe('Close');
  });

  it('[a11y] disabled sets aria-disabled and isDisabled flag', () => {
    const state = useIconButtonState({ icon: 'close', 'aria-label': 'Close', disabled: true });
    expect(state.ariaProps['aria-disabled']).toBe(true);
    expect(state.isDisabled).toBe(true);
  });

  it('[a11y] loading sets aria-busy', () => {
    const state = useIconButtonState({ icon: 'close', 'aria-label': 'Close', loading: true });
    expect(state.ariaProps['aria-busy']).toBe(true);
  });

  it('[a11y] aria-expanded forwarded when provided', () => {
    const state = useIconButtonState({
      icon: 'close',
      'aria-label': 'Toggle menu',
      'aria-expanded': true,
    });
    expect(state.ariaProps['aria-expanded']).toBe(true);
  });

  it('[a11y] non-disabled when disabled=false', () => {
    const state = useIconButtonState({ icon: 'close', 'aria-label': 'Close', disabled: false });
    expect(state.isDisabled).toBe(false);
    expect(state.ariaProps['aria-disabled']).toBe(false);
  });
});
