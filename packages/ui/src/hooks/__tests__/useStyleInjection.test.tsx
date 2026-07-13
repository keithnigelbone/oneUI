import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStyleInjection } from '../useStyleInjection';

const STYLE_ID = 'oneui-foundation-tokens-test';

describe('useStyleInjection', () => {
  beforeEach(() => {
    document.getElementById(STYLE_ID)?.remove();
    document.documentElement.removeAttribute('data-brand-ready');
    document.documentElement.removeAttribute('data-brand-switching');
  });

  afterEach(() => {
    document.getElementById(STYLE_ID)?.remove();
  });

  it('rewrites CSS when the live style node is replaced with the same id', () => {
    const css = '@layer brand { :root { --Primary-Bold: var(--Primary-High); } }';
    const { rerender } = renderHook(
      ({ value }) => useStyleInjection(STYLE_ID, value),
      { initialProps: { value: css } },
    );

    const original = document.getElementById(STYLE_ID) as HTMLStyleElement;
    expect(original.textContent).toBe(css);

    original.remove();
    const replacement = document.createElement('style');
    replacement.id = STYLE_ID;
    document.head.appendChild(replacement);

    rerender({ value: css });

    expect(document.getElementById(STYLE_ID)).toBe(replacement);
    expect(replacement.textContent).toBe(css);
    expect(document.documentElement.getAttribute('data-brand-ready')).toBe('true');
  });

  it('rewrites CSS when the live style node is emptied outside React', () => {
    const css = '@layer brand { :root { --Primary-Bold: var(--Primary-High); } }';
    const { rerender } = renderHook(
      ({ value }) => useStyleInjection(STYLE_ID, value),
      { initialProps: { value: css } },
    );

    const style = document.getElementById(STYLE_ID) as HTMLStyleElement;
    style.textContent = '';

    rerender({ value: css });

    expect(style.textContent).toBe(css);
  });
});
