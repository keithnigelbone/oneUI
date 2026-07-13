import { describe, expect, it } from 'vitest';
import { getAvatarAccessibilityProps, resolveAvatarIconSlotColor } from './interface';

describe('avatarA11y', () => {
  it('defaults accessibilityLabel to avatar when alt is empty', () => {
    expect(getAvatarAccessibilityProps({ alt: '' }, false).accessibilityLabel).toBe('avatar');
  });

  it('uses alt for accessibilityLabel with image role', () => {
    const props = getAvatarAccessibilityProps({ alt: 'Jane Smith' }, false);
    expect(props.accessibilityLabel).toBe('Jane Smith');
    expect(props.accessibilityRole).toBe('image');
    expect(props.accessible).toBe(true);
  });

  it('maps disabled state', () => {
    expect(getAvatarAccessibilityProps({ alt: 'J' }, true).accessibilityState).toEqual({
      disabled: true,
    });
  });

  it('maps native-only accessibilityHint', () => {
    expect(
      getAvatarAccessibilityProps({ alt: 'Jane', accessibilityHint: 'Opens profile' }, false)
        .accessibilityHint,
    ).toBe('Opens profile');
  });

  it('publishes the avatar text on-colour to icon slot content', () => {
    expect(
      resolveAvatarIconSlotColor({
        iconColor: 'low-contrast-tint',
        textColor: 'accessible-on-colour',
      }),
    ).toBe('accessible-on-colour');
  });
});
