/**
 * Spinner.test.tsx
 * Unit tests for the Spinner component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';
import { useSpinnerGeometry, SPINNER_SVG_STROKE_MAP } from './Spinner.shared';

describe('Spinner', () => {
  it('renders a progressbar element with default label', () => {
    render(<Spinner />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-label', 'Loading');
  });

  it('uses a custom label when provided', () => {
    render(<Spinner label="Uploading file" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Uploading file');
  });

  it('applies data-size attribute for each size preset', () => {
    const { container, rerender } = render(<Spinner size="2XS" />);
    expect(container.querySelector('[data-size="2XS"]')).toBeInTheDocument();

    rerender(<Spinner size="5XL" />);
    expect(container.querySelector('[data-size="5XL"]')).toBeInTheDocument();
  });

  it('renders exactly three animated arc circles', () => {
    const { container } = render(<Spinner />);
    const circles = container.querySelectorAll('svg circle');
    expect(circles).toHaveLength(3);
  });

  it('arcs use round linecaps to match Figma', () => {
    const { container } = render(<Spinner />);
    const circles = container.querySelectorAll('svg circle');
    circles.forEach((c) => {
      expect(c.getAttribute('stroke-linecap')).toBe('round');
    });
  });

  it('every arc uses the per-size stroke-width in viewBox units', () => {
    const { container } = render(<Spinner size="M" />);
    const circles = container.querySelectorAll('svg circle');
    circles.forEach((c) => {
      expect(c.getAttribute('stroke-width')).toBe(String(SPINNER_SVG_STROKE_MAP.M));
    });
  });

  it('arcs are normalised to pathLength=100 so dasharray is scale-invariant percentage-based', () => {
    // Spinner.tsx documents pathLength=100 as intentional: dasharray values
    // are read as percentages (0–100), matching the SVG file headers and
    // letting the rotate(-90) group anchor 0% at 12 o'clock.
    const { container } = render(<Spinner />);
    const circles = container.querySelectorAll('svg circle');
    circles.forEach((c) => {
      expect(c.getAttribute('pathLength')).toBe('100');
    });
  });

  it('geometry produces a positive radius that fits inside the viewBox', () => {
    const { radius, strokeWidth } = useSpinnerGeometry('M');
    expect(radius).toBeGreaterThan(0);
    // Stroke must not leave the viewBox: 2 * radius + strokeWidth === 100
    expect(2 * radius + strokeWidth).toBeCloseTo(100, 5);
  });

  it('forwards className', () => {
    const { container } = render(<Spinner className="my-spinner" />);
    expect(container.querySelector('.my-spinner')).toBeInTheDocument();
  });
});
