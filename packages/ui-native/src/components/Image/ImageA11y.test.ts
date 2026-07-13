import { describe, expect, it } from 'vitest';
import {
  getImageAccessibilityProps,
  resolveImageAccessibilityLabel,
  useImageState,
} from './interface';

describe('Image accessibility', () => {
  it('uses alt as default label and aria-label when provided', () => {
    expect(resolveImageAccessibilityLabel({ alt: 'Product photo' })).toBe('Product photo');
    expect(
      resolveImageAccessibilityLabel({ alt: 'Product photo', 'aria-label': 'Hero image' }),
    ).toBe('Hero image');
  });

  it('uses image role when not interactive', () => {
    const state = useImageState({ src: 'https://example.com/a.png', alt: 'A' });
    const a11y = getImageAccessibilityProps({ alt: 'A' }, state);
    expect(a11y.accessibilityRole).toBe('image');
    expect(a11y.accessible).toBe(true);
  });

  it('uses image role when interactive but no press handler', () => {
    const state = useImageState({
      src: 'https://example.com/a.png',
      alt: 'A',
      interactive: true,
    });
    expect(state.isInteractive).toBe(true);
    expect(state.isActionable).toBe(false);
    expect(getImageAccessibilityProps({ alt: 'A', interactive: true }, state).accessibilityRole).toBe(
      'image',
    );
  });

  it('uses button role when interactive and has onPress', () => {
    const state = useImageState({
      src: 'https://example.com/a.png',
      alt: 'A',
      interactive: true,
      onPress: () => undefined,
    });
    expect(state.isActionable).toBe(true);
    expect(getImageAccessibilityProps({ alt: 'A', interactive: true }, state).accessibilityRole).toBe(
      'button',
    );
  });

  it('uses button role when interactive and has onClick', () => {
    const state = useImageState({
      src: 'https://example.com/a.png',
      alt: 'A',
      interactive: true,
      onClick: () => undefined,
    });
    expect(state.isActionable).toBe(true);
    expect(getImageAccessibilityProps({ alt: 'A', interactive: true }, state).accessibilityRole).toBe(
      'button',
    );
  });
});
