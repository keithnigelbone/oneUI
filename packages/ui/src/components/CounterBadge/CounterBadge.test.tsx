/**
 * CounterBadge.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { CounterBadge } from './CounterBadge';

describe('CounterBadge', () => {
  // === Core rendering ===

  it('renders value as text content', () => {
    render(<CounterBadge value={5} aria-label="5 notifications" />);
    expect(screen.getByRole('status')).toHaveTextContent('5');
  });

  it('shows "99+" when value > 99', () => {
    render(<CounterBadge value={150} aria-label="150 notifications" />);
    expect(screen.getByRole('status')).toHaveTextContent('99+');
  });

  it('respects custom max prop', () => {
    render(<CounterBadge value={15} max={9} aria-label="15 notifications" />);
    expect(screen.getByRole('status')).toHaveTextContent('9+');
  });

  it('shows exact value when equal to max', () => {
    render(<CounterBadge value={99} aria-label="99 notifications" />);
    expect(screen.getByRole('status')).toHaveTextContent('99');
  });

  // === Zero visibility ===

  it('is hidden when value=0 and showZero=false', () => {
    const { container } = render(<CounterBadge value={0} aria-label="0 notifications" />);
    expect(container.firstChild).toBeNull();
  });

  it('is visible when value=0 and showZero=true', () => {
    render(<CounterBadge value={0} showZero aria-label="0 notifications" />);
    expect(screen.getByRole('status')).toHaveTextContent('0');
  });

  // === Size tests ===

  it('renders correct data-size for each size', () => {
    const sizes = ['xs', 's', 'm', 'l'] as const;
    for (const size of sizes) {
      const { unmount } = render(<CounterBadge value={5} size={size} aria-label="5" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
      unmount();
    }
  });

  it('defaults to size m when no size prop', () => {
    render(<CounterBadge value={5} aria-label="5" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'm');
  });

  // === Variant tests ===

  it('applies bold variant class for attention=high', () => {
    render(<CounterBadge value={5} attention="high" aria-label="5" />);
    expect(screen.getByRole('status').className).toContain('bold');
  });

  it('applies subtle variant class for attention=medium', () => {
    render(<CounterBadge value={5} attention="medium" aria-label="5" />);
    expect(screen.getByRole('status').className).toContain('subtle');
  });

  it('applies ghost variant class for attention=low', () => {
    render(<CounterBadge value={5} attention="low" aria-label="5" />);
    expect(screen.getByRole('status').className).toContain('ghost');
  });

  it('defaults to bold variant (high attention)', () => {
    render(<CounterBadge value={5} aria-label="5" />);
    expect(screen.getByRole('status').className).toContain('bold');
  });

  // === Appearance tests ===

  it('applies appearance class for neutral', () => {
    render(<CounterBadge value={5} appearance="neutral" aria-label="5" />);
    expect(screen.getByRole('status').className).toContain('appearanceNeutral');
  });

  it('applies appearance class for secondary', () => {
    render(<CounterBadge value={5} appearance="secondary" aria-label="5" />);
    expect(screen.getByRole('status').className).toContain('appearanceSecondary');
  });

  it('applies appearance class for negative', () => {
    render(<CounterBadge value={5} appearance="negative" aria-label="5" />);
    expect(screen.getByRole('status').className).toContain('appearanceNegative');
  });

  it('resolves appearance auto to primary (no extra class)', () => {
    render(<CounterBadge value={5} appearance="auto" aria-label="5" />);
    const badge = screen.getByRole('status');
    expect(badge.className).not.toContain('appearanceNeutral');
    expect(badge.className).not.toContain('appearanceSecondary');
  });

  // === Accessibility ===

  it('has role="status"', () => {
    render(<CounterBadge value={5} aria-label="5 notifications" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders aria-label', () => {
    render(<CounterBadge value={5} aria-label="5 unread messages" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5 unread messages');
  });

  it('forwards data-testid to the root span', () => {
    render(<CounterBadge value={5} aria-label="5" data-testid="qa-counter-badge-root" />);
    expect(screen.getByTestId('qa-counter-badge-root')).toHaveRole('status');
  });

  it('warns when aria-label is missing (dev mode)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<CounterBadge value={5} />);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('aria-label')
    );
    warnSpy.mockRestore();
  });

  // === ref ===

  it('forwards ref to the DOM element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CounterBadge ref={ref} value={5} aria-label="5" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  // === Data attribute tests ===

  it('renders data-variant attribute (derived from attention)', () => {
    render(<CounterBadge value={5} attention="medium" aria-label="5" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'subtle');
  });

  it('renders data-appearance attribute', () => {
    render(<CounterBadge value={5} appearance="neutral" aria-label="5" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'neutral');
  });
});
