/**
 * IndicatorBadge.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { IndicatorBadge } from './IndicatorBadge';

describe('IndicatorBadge', () => {
  it('renders as empty span (no visible text)', () => {
    render(<IndicatorBadge aria-label="Status" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('');
  });

  it('renders correct data-size for xs', () => {
    render(<IndicatorBadge size="xs" aria-label="Status" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'xs');
  });

  it('renders correct data-size for s', () => {
    render(<IndicatorBadge size="s" aria-label="Status" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 's');
  });

  it('renders correct data-size for m', () => {
    render(<IndicatorBadge size="m" aria-label="Status" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'm');
  });

  it('renders correct data-size for l', () => {
    render(<IndicatorBadge size="l" aria-label="Status" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'l');
  });

  it('renders correct data-size for xl', () => {
    render(<IndicatorBadge size="xl" aria-label="Status" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'xl');
  });

  it('default size is m', () => {
    render(<IndicatorBadge aria-label="Status" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'm');
  });

  // === Appearance tests ===

  it('applies appearance class for neutral', () => {
    render(<IndicatorBadge appearance="neutral" aria-label="Neutral" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('appearanceNeutral');
  });

  it('applies appearance class for secondary', () => {
    render(<IndicatorBadge appearance="secondary" aria-label="Secondary" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('appearanceSecondary');
  });

  it('applies appearance class for positive', () => {
    render(<IndicatorBadge appearance="positive" aria-label="Online" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('appearancePositive');
  });

  it('applies appearance class for negative', () => {
    render(<IndicatorBadge appearance="negative" aria-label="Offline" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('appearanceNegative');
  });

  it('applies appearance class for warning', () => {
    render(<IndicatorBadge appearance="warning" aria-label="Warning" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('appearanceWarning');
  });

  it('applies appearance class for informative', () => {
    render(<IndicatorBadge appearance="informative" aria-label="Info" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('appearanceInformative');
  });

  it('applies appearance class for sparkle', () => {
    render(<IndicatorBadge appearance="sparkle" aria-label="Sparkle" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('appearanceSparkle');
  });

  it('resolves appearance auto to primary (no extra class)', () => {
    render(<IndicatorBadge appearance="auto" aria-label="Auto" />);
    const badge = screen.getByRole('status');
    expect(badge.className).not.toContain('appearanceNeutral');
    expect(badge.className).not.toContain('appearanceSecondary');
    expect(badge.className).not.toContain('appearancePositive');
    expect(badge.className).not.toContain('appearanceNegative');
    expect(badge.className).not.toContain('appearanceSparkle');
  });

  // === Accessibility tests ===

  it('has role="status"', () => {
    render(<IndicatorBadge aria-label="Status" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders aria-label', () => {
    render(<IndicatorBadge aria-label="Online status" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Online status',
    );
  });

  it('forwards data-testid to the root span', () => {
    render(
      <IndicatorBadge
        aria-label="Status"
        data-testid="qa-indicator-badge-root"
      />,
    );
    expect(screen.getByTestId('qa-indicator-badge-root')).toHaveRole('status');
  });

  it('warns when aria-label is missing (dev mode)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      // @ts-expect-error — testing runtime guard for missing aria-label
      <IndicatorBadge />,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'IndicatorBadge: `aria-label` prop is required for accessibility.',
      ),
    );
    warnSpy.mockRestore();
  });

  // === Ref forwarding ===

  it('forwards ref to HTMLSpanElement', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<IndicatorBadge ref={ref} aria-label="Status" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  // === Custom className and style ===

  it('applies custom className', () => {
    render(
      <IndicatorBadge aria-label="Status" className="custom-class" />,
    );
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('custom-class');
  });

  it('applies custom style', () => {
    render(
      <IndicatorBadge
        aria-label="Status"
        style={{ opacity: 0.5 }}
      />,
    );
    const badge = screen.getByRole('status');
    expect(badge.style.opacity).toBe('0.5');
  });
});
