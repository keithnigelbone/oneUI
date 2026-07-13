/**
 * Logo.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Logo } from './Logo';
import { applyLogoSvgMaterial, useLogoState } from './Logo.shared';
import { BrandLogoContext } from '../../contexts/BrandLogoContext';

describe('Logo', () => {
  // === Content mode: children ===

  it('renders children content', () => {
    render(
      <Logo alt="Jio">
        <svg data-testid="logo-svg"><circle cx="12" cy="12" r="8" /></svg>
      </Logo>
    );
    expect(screen.getByTestId('logo-svg')).toBeInTheDocument();
  });

  it('renders children as highest priority over svgContent', () => {
    render(
      <Logo alt="Jio" svgContent="<svg><rect /></svg>">
        <span data-testid="child">Child</span>
      </Logo>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  // === Content mode: svgContent ===

  it('renders svgContent via innerHTML', () => {
    render(<Logo alt="Jio" svgContent='<svg data-testid="injected"><circle /></svg>' />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    const svg = logo.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders metallic SVG content with tokenized gradient paint', () => {
    render(<Logo alt="Jio" material="gold" svgContent='<svg><path fill="currentColor" stroke="currentColor" /><path fill="white" /><path fill="none" /></svg>' />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    const svg = logo.querySelector('svg');
    const gradient = svg?.querySelector('linearGradient');

    expect(gradient?.id).toContain('oneui-logo-metal-');
    expect(svg?.innerHTML).toContain('var(--Material-Metallic-Gold-Shadow)');
    expect(svg?.querySelector('[fill^="url("]')).toBeInTheDocument();
    expect(svg?.querySelector('[stroke^="url("]')).toBeInTheDocument();
    expect(svg?.querySelector('[fill="white"]')).toBeInTheDocument();
    expect(svg?.querySelector('[fill="none"]')).toBeInTheDocument();
  });

  it('does not apply material paint to raster src logos', () => {
    render(<Logo alt="Jio" material="gold" src="https://example.com/logo.png" />);
    const logo = screen.getByRole('img', { name: 'Jio' });

    expect(logo.querySelector('img')).toBeInTheDocument();
    expect(logo.querySelector('linearGradient')).not.toBeInTheDocument();
  });

  it('svgContent container has aria-hidden', () => {
    render(<Logo alt="Jio" svgContent="<svg><circle /></svg>" />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    const markSpan = logo.firstChild;
    expect(markSpan).toHaveAttribute('aria-hidden', 'true');
  });

  // === Content mode: src (image) ===

  it('renders img element with src', () => {
    render(<Logo alt="Jio" src="https://example.com/logo.png" />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    const img = logo.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('img element has role="presentation"', () => {
    render(<Logo alt="Jio" src="https://example.com/logo.png" />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    const img = logo.querySelector('img');
    expect(img).toHaveAttribute('role', 'presentation');
  });

  it('shows fallback when image fails to load', () => {
    render(
      <Logo
        alt="Jio"
        src="https://invalid.example/broken.png"
        fallback={<span data-testid="fallback">FB</span>}
      />
    );
    const logo = screen.getByRole('img', { name: 'Jio' });
    const img = logo.querySelector('img');
    fireEvent.error(img!);
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('calls onError when image fails', () => {
    const onError = vi.fn();
    render(<Logo alt="Jio" src="https://invalid.example/broken.png" onError={onError} />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    const img = logo.querySelector('img');
    fireEvent.error(img!);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad when image loads', () => {
    const onLoad = vi.fn();
    render(<Logo alt="Jio" src="https://example.com/logo.png" onLoad={onLoad} />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    const img = logo.querySelector('img');
    fireEvent.load(img!);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  // === Content mode: empty ===

  it('renders fallback when no content source provided', () => {
    render(
      <Logo alt="Jio" fallback={<span data-testid="empty-fallback">?</span>} />
    );
    expect(screen.getByTestId('empty-fallback')).toBeInTheDocument();
  });

  it('renders nothing when empty and no fallback', () => {
    render(<Logo alt="Jio" />);
    const logo = screen.getByRole('img', { name: 'Jio' });
    expect(logo.children).toHaveLength(0);
  });

  // === Content mode: brand context fallback ===

  it('falls back to the brand logo from BrandLogoContext when no explicit content', () => {
    render(
      <BrandLogoContext.Provider value={{ logoSvg: '<svg data-testid="brand-svg"><circle /></svg>', brandName: 'Reliance' }}>
        <Logo alt="Reliance" />
      </BrandLogoContext.Provider>
    );
    const logo = screen.getByRole('img', { name: 'Reliance' });
    expect(logo.querySelector('svg')).toBeInTheDocument();
  });

  it('explicit svgContent wins over the brand context logo', () => {
    render(
      <BrandLogoContext.Provider value={{ logoSvg: '<svg data-testid="brand-svg"><circle /></svg>' }}>
        <Logo alt="Reliance" svgContent='<svg data-testid="explicit-svg"><rect /></svg>' />
      </BrandLogoContext.Provider>
    );
    expect(screen.getByRole('img').querySelector('rect')).toBeInTheDocument();
  });

  it('explicit children win over the brand context logo', () => {
    render(
      <BrandLogoContext.Provider value={{ logoSvg: '<svg><circle /></svg>' }}>
        <Logo alt="Reliance">
          <span data-testid="explicit-child">X</span>
        </Logo>
      </BrandLogoContext.Provider>
    );
    expect(screen.getByTestId('explicit-child')).toBeInTheDocument();
  });

  // === Size tests ===

  it('renders data-size attribute for each preset size', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Logo alt="Jio" svgContent="<svg />" size={size} />);
      expect(screen.getByRole('img')).toHaveAttribute('data-size', size);
      unmount();
    }
  });

  it('defaults to size m when no size prop', () => {
    render(<Logo alt="Jio" svgContent="<svg />" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-size', 'm');
  });

  it('renders custom size with CSS variable', () => {
    render(<Logo alt="Jio" svgContent="<svg />" size="custom" customSize={48} />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('data-size', 'custom');
    expect(logo.style.getPropertyValue('--Logo-customSize')).toBe('48px');
  });

  // === Variant tests ===

  it('renders data-variant="mark" by default', () => {
    render(<Logo alt="Jio" svgContent="<svg />" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-variant', 'mark');
  });

  it('renders data-variant="full" when specified', () => {
    render(<Logo alt="Jio" svgContent="<svg />" variant="full" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-variant', 'full');
  });

  // === Ref forwarding ===

  it('forwards ref to the DOM element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Logo ref={ref} alt="Jio" svgContent="<svg />" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  // === Accessibility ===

  it('has role="img"', () => {
    render(<Logo alt="Jio" svgContent="<svg />" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('has aria-label from alt prop', () => {
    render(<Logo alt="Jio Brand Logo" svgContent="<svg />" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Jio Brand Logo');
  });

  // === Custom className and style ===

  it('accepts custom className', () => {
    render(<Logo alt="Jio" svgContent="<svg />" className="custom-class" />);
    expect(screen.getByRole('img').className).toContain('custom-class');
  });

  it('accepts custom style', () => {
    render(<Logo alt="Jio" svgContent="<svg />" style={{ opacity: 0.5 }} />);
    expect(screen.getByRole('img')).toHaveStyle({ opacity: 0.5 });
  });
});

// === useLogoState hook tests ===

describe('useLogoState', () => {
  it('resolves children as highest priority content mode', () => {
    const result = useLogoState({
      alt: 'Jio',
      children: 'child',
      svgContent: '<svg />',
      src: 'https://example.com/logo.png',
    });
    expect(result.contentMode).toBe('children');
  });

  it('resolves svgContent when no children', () => {
    const result = useLogoState({
      alt: 'Jio',
      svgContent: '<svg />',
      src: 'https://example.com/logo.png',
    });
    expect(result.contentMode).toBe('svg');
  });

  it('resolves src when no children or svgContent', () => {
    const result = useLogoState({
      alt: 'Jio',
      src: 'https://example.com/logo.png',
    });
    expect(result.contentMode).toBe('image');
  });

  it('resolves empty when no content source', () => {
    const result = useLogoState({ alt: 'Jio' });
    expect(result.contentMode).toBe('empty');
  });

  it('returns correct data attributes', () => {
    const result = useLogoState({ alt: 'Jio', variant: 'full', size: 'xl' });
    expect(result.dataAttrs).toEqual({
      'data-variant': 'full',
      'data-size': 'xl',
      'data-material': undefined,
    });
  });

  it('defaults to mark variant and m size', () => {
    const result = useLogoState({ alt: 'Jio' });
    expect(result.resolvedVariant).toBe('mark');
    expect(result.resolvedSize).toBe('m');
  });
});

describe('applyLogoSvgMaterial', () => {
  it('rewrites only the requested paint target', () => {
    const result = applyLogoSvgMaterial(
      '<svg><path fill="currentColor" stroke="currentColor" /></svg>',
      'silver',
      'test-gradient',
      'stroke',
    );

    expect(result).toContain('fill="currentColor"');
    expect(result).toContain('stroke="url(#test-gradient)"');
    expect(result).toContain('var(--Material-Metallic-Silver-Shadow)');
  });
});
