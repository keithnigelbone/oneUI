/**
 * Container.test.tsx
 * Smoke coverage for the Container layout primitive.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import { buildContainerWebLayoutStyle, containerUsesCustomPadding } from './Container.shared';

describe('Container', () => {
  it('renders children in a Surface-backed root (ghost mode by default)', () => {
    render(<Container>hello</Container>);
    const el = screen.getByText('hello');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('data-surface', 'ghost');
  });

  it('applies the fluid class when variant is unset', () => {
    const { container } = render(<Container>fluid</Container>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/fluid/);
  });

  it('applies the fixed class for variant="fixed"', () => {
    const { container } = render(<Container variant="fixed">fixed</Container>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/fixed/);
  });

  it('applies the full-bleed class for variant="full-bleed"', () => {
    const { container } = render(<Container variant="full-bleed">bleed</Container>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/full-bleed|fullBleed/);
  });

  it('honors the `as` prop to render a different element', () => {
    const { container } = render(<Container as="section">section</Container>);
    expect((container.firstChild as HTMLElement).tagName).toBe('SECTION');
  });

  it('forwards arbitrary data-* attributes', () => {
    const { container } = render(<Container data-testid="ctr">x</Container>);
    expect(container.querySelector('[data-testid="ctr"]')).not.toBeNull();
  });

  it('exposes a custom maxWidth via the --_container-max-width CSS variable', () => {
    const { container } = render(
      <Container variant="fixed" maxWidth="900px">
        capped
      </Container>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--_container-max-width')).toBe('900px');
  });

  it('passes explicit surface mode and appearance to the root Surface', () => {
    render(
      <Container surface="subtle" appearance="secondary" data-testid="ctr-root">
        surfaced
      </Container>,
    );
    const root = screen.getByTestId('ctr-root');
    expect(root).toHaveAttribute('data-surface', 'subtle');
    expect(root).toHaveAttribute('data-appearance', 'secondary');
    expect(root.className).toMatch(/container/);
    expect(root.tagName).toBe('DIV');
    expect(screen.getByText('surfaced')).toBe(root);
  });

  it('does not set flex/grid display when `layout` is omitted (block flow)', () => {
    render(<Container data-testid="flow-root">x</Container>);
    const root = screen.getByTestId('flow-root') as HTMLElement;
    expect(root.style.display).toBe('');
  });

  it('applies flex sizing props on the root style', () => {
    render(
      <Container layout="flex" flex={1} data-testid="flex-root">
        grow
      </Container>,
    );
    const root = screen.getByTestId('flex-root') as HTMLElement;
    expect(root.style.display).toBe('flex');
    expect(root.style.flex).toMatch(/^1(?:\s|$)/);
  });

  it('applies alignSelf for flex/grid children', () => {
    render(
      <Container alignSelf="center" data-testid="self-root">
        self
      </Container>,
    );
    const root = screen.getByTestId('self-root') as HTMLElement;
    expect(root.style.alignSelf).toBe('center');
  });
});

describe('buildContainerWebLayoutStyle', () => {
  it('treats omitted layout as no flex/grid display', () => {
    const s = buildContainerWebLayoutStyle({});
    expect(s.display).toBeUndefined();
  });

  it('applies per-side padding keys with token vars', () => {
    const s = buildContainerWebLayoutStyle({
      paddingTop: '8',
      paddingBottom: '4',
    });
    expect(s.paddingTop).toBe('var(--Spacing-8)');
    expect(s.paddingBottom).toBe('var(--Spacing-4)');
    expect(s.padding).toBeUndefined();
  });

  it('merges uniform padding then per-side override', () => {
    const s = buildContainerWebLayoutStyle({
      padding: '4',
      paddingBottom: '8',
    });
    expect(s.padding).toBeUndefined();
    expect(s.paddingTop).toBe('var(--Spacing-4)');
    expect(s.paddingRight).toBe('var(--Spacing-4)');
    expect(s.paddingLeft).toBe('var(--Spacing-4)');
    expect(s.paddingBottom).toBe('var(--Spacing-8)');
  });

  it('applies grow/shrink/basis when `flex` shorthand is omitted', () => {
    const s = buildContainerWebLayoutStyle({
      grow: 1,
      shrink: 0,
      basis: 'auto',
    });
    expect(s.flex).toBeUndefined();
    expect(s.flexGrow).toBe(1);
    expect(s.flexShrink).toBe(0);
    expect(s.flexBasis).toBe('auto');
  });

  it('prefers `flex` shorthand over grow/shrink/basis', () => {
    const s = buildContainerWebLayoutStyle({
      flex: 2,
      grow: 1,
      shrink: 1,
      basis: 'full',
    });
    expect(s.flex).toBe(2);
    expect(s.flexGrow).toBeUndefined();
    expect(s.flexShrink).toBeUndefined();
    expect(s.flexBasis).toBeUndefined();
  });

  it('applies a numeric grid column count', () => {
    const s = buildContainerWebLayoutStyle({ layout: 'grid', columns: 3 });
    expect(s.display).toBe('grid');
    expect(s.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('degrades a responsive columns object to its smallest count (never collapses)', () => {
    // Container has no per-breakpoint cascade — Grid owns that, and IR→AST routes
    // column-bearing nodes to Grid. A responsive object reaching Container must still
    // produce a real (mobile-safe) grid rather than silently dropping the columns.
    const s = buildContainerWebLayoutStyle({ layout: 'grid', columns: { S: 1, M: 2, L: 4 } });
    expect(s.display).toBe('grid');
    expect(s.gridTemplateColumns).toBe('repeat(1, minmax(0, 1fr))');
  });
});

describe('containerUsesCustomPadding', () => {
  it('returns true when only a per-side padding key is set', () => {
    expect(containerUsesCustomPadding({ paddingLeft: '3' })).toBe(true);
  });
});
