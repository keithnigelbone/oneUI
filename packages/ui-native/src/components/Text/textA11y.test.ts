import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../theme/TypographyLanguageContext', () => ({
  useOptionalTypographyLanguage: () => null,
}));
import {
  getTextAccessibilityProps,
  resolveTextAccessibilityLabel,
  resolveTextSize,
  useTextState,
  type TextProps,
} from './interface';

const baseState = (overrides?: Partial<TextProps>) =>
  useTextState({ children: 'hello', ...overrides } as TextProps);

describe('useTextState', () => {
  it('defaults to body / M / high weight / medium attention / neutral', () => {
    const s = baseState();
    expect(s.resolvedVariant).toBe('body');
    expect(s.resolvedSize).toBe('M');
    expect(s.resolvedWeight).toBe('medium');
    expect(s.resolvedAttention).toBe('medium');
    expect(s.resolvedAppearance).toBe('neutral');
  });

  it('defaults attention to "medium" and passes explicit levels through', () => {
    expect(baseState().resolvedAttention).toBe('medium');
    expect(baseState({ attention: 'high' }).resolvedAttention).toBe('high');
    expect(baseState({ attention: 'low' }).resolvedAttention).toBe('low');
    expect(baseState({ attention: 'tintedA11y' }).resolvedAttention).toBe('tintedA11y');
  });

  it('resolves appearance="auto" to "neutral"', () => {
    const s = baseState({ appearance: 'auto' });
    expect(s.resolvedAppearance).toBe('neutral');
  });

  it('clamps invalid sizes for the variant', () => {
    expect(resolveTextSize('body', '3XS')).toBe('2XS');
    expect(resolveTextSize('display', 'XS')).toBe('S');
    expect(resolveTextSize('display', '2XL' as unknown as string)).toBe('L');
    expect(resolveTextSize('code', '2XL' as unknown as string)).toBe('M');
  });

  it('emits data-attrs for decorations and alignment', () => {
    const s = baseState({ italic: true, underline: true, textAlign: 'center' });
    expect(s.dataAttrs['data-italic']).toBe('true');
    expect(s.dataAttrs['data-underline']).toBe('true');
    expect(s.dataAttrs['data-align']).toBe('center');
  });
});

describe('resolveTextAccessibilityLabel', () => {
  it('prefers aria-label when present', () => {
    expect(
      resolveTextAccessibilityLabel({ 'aria-label': 'Important', children: 'hi' } as TextProps),
    ).toBe('Important');
  });

  it('falls back to string children', () => {
    expect(resolveTextAccessibilityLabel({ children: 'hi' } as TextProps)).toBe('hi');
  });

  it('falls back to text prop when children is missing', () => {
    expect(resolveTextAccessibilityLabel({ text: 'hello' } as TextProps)).toBe('hello');
  });

  it('returns undefined for non-element, non-string children', () => {
    expect(
      resolveTextAccessibilityLabel({ children: { foo: 'bar' } as unknown } as TextProps),
    ).toBeUndefined();
  });

  it('extracts text from ReactElement children', () => {
    // <Text><Bold>Read</Bold> the docs</Text> → "Read the docs"
    const children = [
      createElement('Bold', { key: 'a' }, 'Read'),
      ' the docs',
    ] as unknown as ReactNode;
    expect(resolveTextAccessibilityLabel({ children } as TextProps)).toBe('Read the docs');
  });

  it('extracts text from nested ReactElement trees', () => {
    const children = createElement(
      'Outer',
      null,
      createElement('Inner', null, 'Hello'),
      ' world',
    ) as unknown as ReactNode;
    expect(resolveTextAccessibilityLabel({ children } as TextProps)).toBe('Hello world');
  });

  it('prefers aria-label over extracted element text', () => {
    const children = createElement('Bold', null, 'ignored') as unknown as ReactNode;
    expect(
      resolveTextAccessibilityLabel({ 'aria-label': 'Override', children } as TextProps),
    ).toBe('Override');
  });
});

describe('getTextAccessibilityProps', () => {
  it('sets NO explicit role for plain text (only accessible + label)', () => {
    const props = { children: 'hello' } as TextProps;
    const a11y = getTextAccessibilityProps(props, { resolvedVariant: 'body' });
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBeUndefined();
    expect(a11y.accessibilityLabel).toBe('hello');
  });

  it('does NOT assign a role for heading variants (Text is a generic primitive)', () => {
    for (const variant of ['title', 'headline', 'display'] as const) {
      const a11y = getTextAccessibilityProps(
        { variant, children: 'Heading' } as TextProps,
        { resolvedVariant: variant },
      );
      expect(a11y.accessibilityRole).toBeUndefined();
    }
  });

  it('promotes role to link when onPress is supplied', () => {
    const props = { children: 'docs', onPress: () => undefined } as TextProps;
    const a11y = getTextAccessibilityProps(props, { resolvedVariant: 'body' });
    expect(a11y.accessibilityRole).toBe('link');
  });

  it('does NOT promote the parent to link when a link element is rendered', () => {
    // Regression: onPress + inline/trailing `link`/`onLinkPress` must not nest
    // link roles. The link element owns the sole `link` role; the parent gets
    // no explicit role.
    const props = {
      children: 'Read the docs',
      link: 'docs',
      onLinkPress: () => undefined,
      onPress: () => undefined,
    } as TextProps;
    const a11y = getTextAccessibilityProps(props, { resolvedVariant: 'body' }, {
      hasRenderedLink: true,
    });
    expect(a11y.accessibilityRole).toBeUndefined();
  });

  it('assigns no parent role for a heading variant with a rendered link + onPress', () => {
    const props = {
      variant: 'headline',
      children: 'Read the docs',
      link: 'docs',
      onPress: () => undefined,
    } as TextProps;
    const a11y = getTextAccessibilityProps(props, { resolvedVariant: 'headline' }, {
      hasRenderedLink: true,
    });
    expect(a11y.accessibilityRole).toBeUndefined();
  });

  it('still promotes to link with onPress when there is no rendered link', () => {
    const props = { children: 'docs', onPress: () => undefined } as TextProps;
    const a11y = getTextAccessibilityProps(props, { resolvedVariant: 'body' }, {
      hasRenderedLink: false,
    });
    expect(a11y.accessibilityRole).toBe('link');
  });

  it('hides Text from a11y when aria-hidden is true', () => {
    const props = { 'aria-hidden': true, children: 'decorative' } as TextProps;
    const a11y = getTextAccessibilityProps(props, { resolvedVariant: 'body' });
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('forwards accessibilityHint', () => {
    const props = { children: 'hi', accessibilityHint: 'Read aloud' } as TextProps;
    const a11y = getTextAccessibilityProps(props, { resolvedVariant: 'body' });
    expect(a11y.accessibilityHint).toBe('Read aloud');
  });
});
