/**
 * Card.test.tsx
 * Smoke coverage for the Card content container.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children in a plain element with the card fill by default', () => {
    const { container } = render(<Card>hello</Card>);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).not.toHaveAttribute('data-surface');
    expect(root.className).toMatch(/card/);
    expect(root.className).toMatch(/fill/);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('tags the root for component-scoped CSS overrides', () => {
    const { container } = render(<Card>x</Card>);
    expect((container.firstChild as HTMLElement).getAttribute('data-oneui-component')).toBe('Card');
  });

  it('renders as a Surface when the surface prop is set (Surface owns the fill)', () => {
    const { container } = render(<Card surface="subtle">tinted</Card>);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-surface', 'subtle');
    expect(root.className).not.toMatch(/fill/);
  });

  it('honors the `as` prop in both fill modes', () => {
    const plain = render(<Card as="article">a</Card>);
    expect((plain.container.firstChild as HTMLElement).tagName).toBe('ARTICLE');
    const surfaced = render(
      <Card as="section" surface="elevated">
        b
      </Card>,
    );
    expect((surfaced.container.firstChild as HTMLElement).tagName).toBe('SECTION');
  });

  it('adds interactive affordances (class + tabIndex) when interactive', () => {
    const { container } = render(<Card interactive>go</Card>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/interactive/);
    expect(root).toHaveAttribute('tabindex', '0');
  });

  it('forwards arbitrary data-* attributes', () => {
    const { container } = render(<Card data-testid="card">x</Card>);
    expect(container.querySelector('[data-testid="card"]')).not.toBeNull();
  });
});
