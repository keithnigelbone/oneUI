/**
 * Text.test.tsx
 *
 * Smoke + accessibility coverage for the Text component.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';
import { resolveTextSize } from './Text.shared';

describe('Text', () => {
  it('defaults to a span element rendered with the body / M / high payload', () => {
    const { container } = render(<Text>Hello</Text>);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('SPAN');
    expect(root.getAttribute('data-variant')).toBe('body');
    expect(root.getAttribute('data-size')).toBe('M');
    expect(root.getAttribute('data-weight')).toBe('high');
    expect(root.getAttribute('data-attention')).toBe('high');
    expect(root.getAttribute('data-appearance')).toBe('neutral');
    expect(root.textContent).toBe('Hello');
  });

  it('defaults display and headline to span (use `as` for headings)', () => {
    const { container: d } = render(<Text variant="display">Big</Text>);
    expect((d.firstChild as HTMLElement).tagName).toBe('SPAN');
    const { container: h } = render(<Text variant="headline">Section</Text>);
    expect((h.firstChild as HTMLElement).tagName).toBe('SPAN');
  });

  it('defaults code variant to span unless `as="code"`', () => {
    const { container } = render(<Text variant="code">x = 1</Text>);
    expect((container.firstChild as HTMLElement).tagName).toBe('SPAN');
  });

  it('renders semantic heading when `as` is set', () => {
    const { container } = render(
      <Text variant="display" as="h1">
        Page title
      </Text>
    );
    expect((container.firstChild as HTMLElement).tagName).toBe('H1');
  });

  it('honours an explicit `as` over span default', () => {
    const { container } = render(
      <Text variant="display" as="p">
        Big
      </Text>
    );
    expect((container.firstChild as HTMLElement).tagName).toBe('P');
  });

  it('passes anchor attributes when `as="a"` and `href` is set', () => {
    render(
      <Text as="a" href="https://example.com" target="_blank" rel="noreferrer">
        link
      </Text>
    );
    const a = screen.getByRole('link', { name: 'link' });
    expect(a.getAttribute('href')).toBe('https://example.com');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noreferrer');
  });

  it('emits decoration data attributes when toggled', () => {
    const { container } = render(
      <Text italic underline strikethrough>
        decorated
      </Text>
    );
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('data-italic')).toBe('true');
    expect(root.getAttribute('data-underline')).toBe('true');
    expect(root.getAttribute('data-strikethrough')).toBe('true');
  });

  it('omits decoration data attributes when not requested', () => {
    const { container } = render(<Text>plain</Text>);
    const root = container.firstChild as HTMLElement;
    expect(root.hasAttribute('data-italic')).toBe(false);
    expect(root.hasAttribute('data-underline')).toBe(false);
    expect(root.hasAttribute('data-strikethrough')).toBe(false);
  });

  it('clamps text and exposes the maxLines CSS variable', () => {
    const { container } = render(<Text maxLines={3}>truncated paragraph that wraps</Text>);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('data-max-lines')).toBe('3');
    expect(root.style.getPropertyValue('--_text-max-lines')).toBe('3');
  });

  it('renders the `text` prop when no children are provided', () => {
    render(<Text text="from prop" />);
    expect(document.body.contains(screen.getByText('from prop'))).toBe(true);
  });

  it('renders the link slot after the text content', () => {
    const { container } = render(
      <Text
        text="See "
        link={
          <a href="#" data-testid="link">
            docs
          </a>
        }
      />
    );
    expect(document.body.contains(screen.getByTestId('link'))).toBe(true);
    const root = container.firstChild as HTMLElement;
    const last = root.lastChild as HTMLElement;
    expect(last.tagName).toBe('SPAN');
    expect(last.querySelector('[data-testid="link"]')).not.toBeNull();
  });

  it('forwards aria-label when provided', () => {
    render(<Text aria-label="Greeting">Hi</Text>);
    expect(document.body.contains(screen.getByLabelText('Greeting'))).toBe(true);
  });

  it('forwards id and tabIndex to the root element', () => {
    render(
      <Text as="h2" id="plans-heading" tabIndex={-1}>
        Plans
      </Text>,
    );
    const heading = screen.getByRole('heading', { name: 'Plans' });
    expect(heading).toHaveAttribute('id', 'plans-heading');
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  it('maps lang to the matching India core script context', () => {
    const { container } = render(<Text lang="hi">नमस्ते</Text>);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('lang')).toBe('hi');
    expect(root.getAttribute('data-script')).toBe('devanagari');
    expect(root.hasAttribute('data-script-mode')).toBe(false);
  });

  it('supports explicit script and reading mode', () => {
    const { container } = render(
      <Text script="devanagari" scriptMode="reading">
        नमस्ते
      </Text>
    );
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('data-script')).toBe('devanagari');
    expect(root.getAttribute('data-script-mode')).toBe('reading');
  });

  it('keeps legacy language="others" for compatibility', () => {
    const { container } = render(<Text language="others">Text</Text>);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('data-language')).toBe('others');
    expect(root.hasAttribute('data-script')).toBe(false);
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Text ref={ref}>ref test</Text>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  it('sets data-size from resolveTextSize for invalid body size at runtime', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Text variant="body" size={'3XS' as any}>
        tiny
      </Text>
    );
    expect((container.firstChild as HTMLElement).getAttribute('data-size')).toBe('2XS');
    spy.mockRestore();
  });
});

describe('resolveTextSize', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('keeps valid display / headline / title sizes', () => {
    expect(resolveTextSize('display', 'L')).toBe('L');
    expect(resolveTextSize('title', 'M')).toBe('M');
    expect(resolveTextSize('headline', 'S')).toBe('S');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('clamps display sizes below S to S and unknown legacy sizes to M', () => {
    expect(resolveTextSize('display', '3XS')).toBe('S');
    // 2XL is no longer a known step (Figma alignment) → unknown legacy → M.
    expect(resolveTextSize('display', '2XL')).toBe('M');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('maps body 3XS to 2XS', () => {
    expect(resolveTextSize('body', '3XS')).toBe('2XS');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('maps invalid body sizes to nearest in BODY_VALID_ORDER', () => {
    expect(resolveTextSize('body', 'bogus')).toBe('M');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('maps code L / XL / 2XL to M; 2XS / 3XS are now valid code sizes', () => {
    expect(resolveTextSize('code', 'L')).toBe('M');
    expect(resolveTextSize('code', 'XL')).toBe('M');
    expect(resolveTextSize('code', '2XL')).toBe('M');
    // Code now exposes the smallest two sizes natively.
    expect(resolveTextSize('code', '3XS')).toBe('3XS');
    expect(resolveTextSize('code', '2XS')).toBe('2XS');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('maps invalid label sizes to nearest label step', () => {
    expect(resolveTextSize('label', 'bogus')).toBe('M');
    expect(warnSpy).toHaveBeenCalled();
  });
});
