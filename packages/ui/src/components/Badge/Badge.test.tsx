/**
 * Badge.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Badge } from './Badge';
import { Avatar } from '../Avatar/Avatar';
import { Icon } from '../Icon/Icon';
import { Surface } from '../Surface/Surface';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Badge', () => {
  // === Core rendering ===

  it('renders children as text content', () => {
    render(<Badge aria-label="status">Active</Badge>);
    expect(screen.getByRole('status')).toHaveTextContent('Active');
  });

  it('renders without children', () => {
    render(<Badge aria-label="empty badge" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // === Size tests ===

  it('renders correct data-size for each size', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Badge size={size} aria-label="badge">Badge</Badge>);
      expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
      unmount();
    }
  });

  it('defaults to size m when no size prop', () => {
    render(<Badge aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'm');
  });

  // === Variant tests ===

  it('applies bold variant class for attention=high', () => {
    render(<Badge attention="high" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('bold');
  });

  it('applies subtle variant class for attention=medium', () => {
    render(<Badge attention="medium" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('subtle');
  });

  it('applies ghost variant class for attention=low', () => {
    render(<Badge attention="low" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('ghost');
  });

  it('defaults to bold variant (high attention)', () => {
    render(<Badge aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('bold');
  });

  // === Appearance tests ===

  it('applies appearance class for neutral', () => {
    render(<Badge appearance="neutral" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('appearanceNeutral');
  });

  it('applies appearance class for secondary', () => {
    render(<Badge appearance="secondary" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('appearanceSecondary');
  });

  it('applies appearance class for negative', () => {
    render(<Badge appearance="negative" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('appearanceNegative');
  });

  it('applies appearance class for primary', () => {
    render(<Badge appearance="primary" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status').className).toContain('appearancePrimary');
  });

  it('resolves unset appearance outside Surface to sparkle', () => {
    render(<Badge aria-label="badge">Badge</Badge>);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('data-appearance', 'sparkle');
  });

  it('inherits effective Surface appearance when appearance is unset', () => {
    render(
      <Surface mode="minimal" appearance="secondary">
        <Badge aria-label="badge">Badge</Badge>
      </Surface>
    );
    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'secondary');
  });

  it('appearance auto inherits Surface when inside Surface', () => {
    render(
      <Surface mode="minimal" appearance="negative">
        <Badge appearance="auto" aria-label="badge">
          Badge
        </Badge>
      </Surface>
    );
    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'negative');
  });

  it('resolves appearance auto outside Surface to sparkle (no neutral/secondary class)', () => {
    render(<Badge appearance="auto" aria-label="badge">Badge</Badge>);
    const badge = screen.getByRole('status');
    expect(badge.className).not.toContain('appearanceNeutral');
    expect(badge.className).not.toContain('appearanceSecondary');
  });

  it('low-attention ghost border uses neutral stroke at page root', () => {
    render(<Badge attention="low" aria-label="badge">Badge</Badge>);
    const badge = screen.getByRole('status');
    expect(badge).toHaveStyle({ '--Badge-ghost-stroke': 'var(--Neutral-Stroke-Low)' });
  });

  it('low-attention ghost border inherits parent surface appearance on tinted surfaces', () => {
    render(
      <Surface mode="bold">
        <Badge attention="low" aria-label="badge">Badge</Badge>
      </Surface>,
    );
    expect(screen.getByRole('status')).toHaveStyle({
      '--Badge-ghost-stroke': 'var(--Primary-Stroke-Low)',
    });
  });

  it('low-attention ghost border stays neutral on default parent surface', () => {
    render(
      <Surface mode="default">
        <Badge attention="low" aria-label="badge">Badge</Badge>
      </Surface>,
    );
    expect(screen.getByRole('status')).toHaveStyle({
      '--Badge-ghost-stroke': 'var(--Neutral-Stroke-Low)',
    });
  });

  // === Slot tests ===

  it('renders start slot content', () => {
    render(
      <Badge start={<span data-testid="start-icon">S</span>} aria-label="badge">Badge</Badge>
    );
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders end slot content', () => {
    render(
      <Badge end={<span data-testid="end-icon">E</span>} aria-label="badge">Badge</Badge>
    );
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('renders both start and end slots', () => {
    render(
      <Badge
        start={<span data-testid="start">S</span>}
        end={<span data-testid="end">E</span>}
        aria-label="badge"
      >
        Badge
      </Badge>
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Badge');
  });

  it('start slot Icon inherits Badge resolved appearance (SlotParentAppearanceContext)', () => {
    render(
      <Badge appearance="negative" attention="high" start={<Icon icon="heart" aria-label="icon" />} aria-label="badge">
        L
      </Badge>
    );
    const badge = screen.getByRole('status');
    const startSlot = badge.firstElementChild;
    expect(startSlot).toBeTruthy();
    const iconRoot = startSlot!.querySelector('span[data-appearance]');
    expect(iconRoot).toHaveAttribute('data-appearance', 'negative');
  });

  it('start/end slots publish --Icon-color: currentColor so nested Icons track label colour', () => {
    const css = readFileSync(resolve(__dirname, 'Badge.module.css'), 'utf8');
    expect(css).toMatch(/\.start,\s*\n\.end\s*\{[\s\S]*?--Icon-color:\s*currentColor/);
  });

  it('does not render start wrapper when start is undefined', () => {
    const { container } = render(<Badge aria-label="badge">Badge</Badge>);
    const startSlots = container.querySelectorAll('[class*="start"]');
    expect(startSlots.length).toBe(0);
  });

  it('does not render end wrapper when end is undefined', () => {
    const { container } = render(<Badge aria-label="badge">Badge</Badge>);
    const endSlots = container.querySelectorAll('[class*="end"]');
    expect(endSlots.length).toBe(0);
  });

  it('nests Avatar inside the start slot span so the slot avatar-icon cascade applies', () => {
    const { container } = render(
      <Badge size="s" start={<Avatar aria-label="user" />} aria-label="badge">
        Badge
      </Badge>
    );
    const startSlot = container.querySelector('[class*="start"]') as HTMLElement | null;
    expect(startSlot).not.toBeNull();
    const avatar = startSlot?.querySelector('[data-size]');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('data-size')).toBe('m'); /* Avatar's default — Badge remaps via --Avatar-size-m */
  });

  // === Accessibility ===

  it('has role="status"', () => {
    render(<Badge aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders aria-label', () => {
    render(<Badge aria-label="3 notifications">Badge</Badge>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '3 notifications');
  });

  it('warns when aria-label and children are both missing (dev mode)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Badge />);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('aria-label')
    );
    warnSpy.mockRestore();
  });

  it('does not warn when children is provided without aria-label', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Badge>Badge</Badge>);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  // === ref ===

  it('forwards ref to the DOM element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref} aria-label="badge">Badge</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  // === Data attribute tests ===

  it('renders data-variant attribute derived from attention', () => {
    render(<Badge attention="medium" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'subtle');
  });

  it('renders data-appearance attribute', () => {
    render(<Badge appearance="neutral" aria-label="badge">Badge</Badge>);
    expect(screen.getByRole('status')).toHaveAttribute('data-appearance', 'neutral');
  });
});
