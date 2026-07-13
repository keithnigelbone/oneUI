/**
 * Icon.test.tsx
 * Smoke + accessibility coverage for the Icon component.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Icon } from './Icon';
import { BrandProvider } from '../BrandProvider';
import { Surface } from '../Surface/Surface';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';
import { resolveIconAppearance } from './Icon.shared';

describe('Icon', () => {
  it('renders as a decorative span by default (aria-hidden, no role)', () => {
    const { container } = render(<Icon icon="star" />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
  });

  it('exposes role="img" with an aria-label when one is provided', () => {
    render(<Icon icon="star" aria-label="Favourite" />);
    const node = screen.getByRole('img', { name: 'Favourite' });
    expect(node).toBeInTheDocument();
    expect(node).toHaveAttribute('aria-hidden', 'false');
  });

  it('emits data attributes for size, appearance, and emphasis', () => {
    const { container } = render(
      <Icon icon="star" size="6" appearance="primary" emphasis="medium" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', '6');
    expect(root).toHaveAttribute('data-appearance', 'primary');
    expect(root).toHaveAttribute('data-emphasis', 'medium');
  });

  it('renders a custom React element as the icon glyph', () => {
    render(
      <Icon icon={<svg data-testid="custom-svg" />} aria-label="Custom" />,
    );
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
  });

  it('forwards ref to the root span', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Icon ref={ref} icon="star" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  it('forwards data-testid to the root span', () => {
    render(<Icon icon="star" data-testid="icon-root" />);
    expect(screen.getByTestId('icon-root')).toBeInTheDocument();
  });

  it('inherits appearance from the nearest Surface when appearance is omitted', () => {
    const { container } = render(
      <Surface mode="bold" appearance="warning">
        <Icon icon="star" />
      </Surface>,
    );
    expect(container.querySelector('[data-appearance="warning"]')).toBeInTheDocument();
  });

  it('prefers an explicit appearance prop over the parent Surface role', () => {
    const { container } = render(
      <Surface mode="bold" appearance="warning">
        <Icon icon="star" appearance="informative" />
      </Surface>,
    );
    expect(container.querySelector('[data-appearance="informative"]')).toBeInTheDocument();
  });

  it('prefers slot parent appearance over the parent Surface role', () => {
    const { container } = render(
      <Surface mode="bold" appearance="warning">
        <SlotParentAppearanceProvider value="secondary">
          <Icon icon="star" />
        </SlotParentAppearanceProvider>
      </Surface>,
    );
    expect(container.querySelector('[data-appearance="secondary"]')).toBeInTheDocument();
  });

  it('resolveIconAppearance falls back to neutral off-surface', () => {
    expect(resolveIconAppearance(undefined, null, null)).toBe('neutral');
  });

  it('resolves and renders Jio icon through BrandProvider lazy loading', async () => {
    const { container } = render(
      <BrandProvider brand="jio" iconSet="jio">
        <Icon icon="add" data-testid="jio-icon" />
      </BrandProvider>,
    );

    // Verify that the icon is loaded asynchronously and the SVG element is rendered.
    await waitFor(
      () => {
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });
});
