import { describe, expect, it } from 'vitest';
import {
  getLinkButtonAccessibilityProps,
  LINK_BUTTON_LOADING_SLOT_A11Y,
  resolveLinkButtonAccessibilityLabel,
} from './interface';

describe('LinkButton accessibility', () => {
  it('prefers aria-label over children for the label', () => {
    expect(resolveLinkButtonAccessibilityLabel({ 'aria-label': 'Docs', children: 'Read' })).toBe(
      'Docs',
    );
    expect(resolveLinkButtonAccessibilityLabel({ children: 'Read more' })).toBe('Read more');
  });

  it('uses link role; loading reports busy but NOT disabled', () => {
    const props = getLinkButtonAccessibilityProps(
      { children: 'Terms', loading: true },
      { isDisabled: false },
    );
    expect(props.accessible).toBe(true);
    expect(props.accessibilityRole).toBe('link');
    expect(props.accessibilityState.busy).toBe(true);
    expect(props.accessibilityState.disabled).toBe(false);
    expect(props['aria-busy']).toBe(true);
    expect(props['aria-disabled']).toBe(false);
  });

  it('disabled reports disabled', () => {
    const props = getLinkButtonAccessibilityProps(
      { children: 'Terms', disabled: true },
      { isDisabled: true },
    );
    expect(props.accessibilityState.disabled).toBe(true);
    expect(props['aria-disabled']).toBe(true);
  });

  it('forwards accessibilityHint', () => {
    expect(
      getLinkButtonAccessibilityProps(
        { children: 'Help', accessibilityHint: 'Opens help centre' },
        { isDisabled: false },
      ).accessibilityHint,
    ).toBe('Opens help centre');
  });

  it('hides loading slot from accessibility tree', () => {
    expect(LINK_BUTTON_LOADING_SLOT_A11Y).toEqual({ 'aria-hidden': true });
  });
});
