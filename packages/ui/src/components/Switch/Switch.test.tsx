/**
 * Switch.test.tsx
 * Unit and accessibility tests
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';
import { Surface } from '../Surface';

describe('Switch', () => {
  it('renders with children (label text)', () => {
    render(<Switch>Enable notifications</Switch>);
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('calls onCheckedChange when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange}>Toggle</Switch>);

    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it('supports controlled checked state', () => {
    const { rerender } = render(<Switch checked={false}>Controlled</Switch>);
    expect(screen.getByRole('switch')).not.toBeChecked();

    rerender(<Switch checked>Controlled</Switch>);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('supports default checked (uncontrolled)', () => {
    render(<Switch defaultChecked>Uncontrolled</Switch>);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  // === Disabled ===

  it('disabled prevents interaction', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch disabled onCheckedChange={handleChange}>Disabled</Switch>);

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-disabled', 'true');

    await user.click(switchEl).catch(() => {});
    expect(handleChange).not.toHaveBeenCalled();
  });

  // === ReadOnly ===

  it('readOnly prevents interaction', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch readOnly checked onCheckedChange={handleChange}>ReadOnly</Switch>);

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-readonly', 'true');
    expect(switchEl).toHaveAttribute('data-readonly', '');

    await user.click(switchEl).catch(() => {});
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('readOnly sets data-readonly on wrapper (visually distinct from disabled)', () => {
    const { container } = render(<Switch readOnly checked>ReadOnly</Switch>);
    const wrapper = container.querySelector('label');
    expect(wrapper).toHaveAttribute('data-readonly');
    expect(wrapper).toHaveAttribute('data-disabled');
  });

  // === Size prop ===

  it('defaults to size m', () => {
    render(<Switch>Default</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-size', 'm');
  });

  it('resolves size s', () => {
    render(<Switch size="s">Small</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-size', 's');
  });

  it('resolves size l', () => {
    render(<Switch size="l">Large</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-size', 'l');
  });

  // === Appearance prop ===

  it('defaults appearance to secondary (auto resolution)', () => {
    // useSwitchState auto-resolves appearance to 'secondary' (the brand
    // accent role used for Switch fill). See Switch.shared.ts.
    render(<Switch>Default</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-appearance', 'secondary');
    expect(screen.getByRole('switch')).toHaveAttribute('data-checked-appearance', 'secondary');
    expect(screen.getByRole('switch')).toHaveAttribute('data-unchecked-appearance', 'neutral');
  });

  it('resolves auto appearance to secondary', () => {
    render(<Switch appearance="auto">Auto</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-appearance', 'secondary');
  });

  it('applies appearance data attribute', () => {
    render(<Switch appearance="neutral">Neutral</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-appearance', 'neutral');
  });

  it('unchecked appearance ignores explicit prop on the default page', () => {
    render(<Switch appearance="sparkle">Sparkle</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-checked-appearance', 'sparkle');
    expect(screen.getByRole('switch')).toHaveAttribute('data-unchecked-appearance', 'neutral');
  });

  it('unchecked appearance inherits the nearest Surface appearance', () => {
    render(
      <Surface mode="subtle" appearance="negative">
        <Switch appearance="primary">Primary on negative</Switch>
      </Surface>,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('data-checked-appearance', 'primary');
    expect(screen.getByRole('switch')).toHaveAttribute('data-unchecked-appearance', 'negative');
  });

  it('checked appearance stays secondary when prop is auto', () => {
    render(
      <Surface mode="subtle" appearance="negative">
        <Switch checked appearance="auto">Auto on negative</Switch>
      </Surface>,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('data-checked-appearance', 'secondary');
    expect(screen.getByRole('switch')).toHaveAttribute('data-unchecked-appearance', 'negative');
  });

  it('readOnly forces both visual appearances to neutral', () => {
    render(
      <Surface mode="subtle" appearance="negative">
        <Switch checked readOnly appearance="sparkle" accent="primary">Read only</Switch>
      </Surface>,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('data-appearance', 'neutral');
    expect(screen.getByRole('switch')).toHaveAttribute('data-checked-appearance', 'neutral');
    expect(screen.getByRole('switch')).toHaveAttribute('data-unchecked-appearance', 'neutral');
    expect(screen.getByRole('switch')).not.toHaveAttribute('data-accent');
  });

  it('keeps the track shape aligned when only the thumb radius token is present', () => {
    const css = readFileSync(resolve(__dirname, 'Switch.module.css'), 'utf8');

    expect(css).toContain(
      'border-radius: var(--Switch-borderRadius, var(--Switch-thumbBorderRadius, var(--Shape-Pill)));',
    );
  });

  it('uses foundation tokens for track hover/press without dimming the knob via filter', () => {
    const css = readFileSync(resolve(__dirname, 'Switch.module.css'), 'utf8');

    expect(css).not.toContain('filter: brightness');
    expect(css).toContain('.switch:not([data-readonly]):hover[data-unchecked]');
    expect(css).toContain('background-color: var(--_sw-moderate-hover)');
    expect(css).toContain('.switch:not([data-readonly]):hover[data-unchecked] .thumb');
    expect(css).toContain('--_sw-thumb-fill: var(--Surface-Default);');
  });

  it('uses L for color/position, M for press-scale, routed via --_sw-* vars to actual motion tokens', () => {
    const css = readFileSync(resolve(__dirname, 'Switch.module.css'), 'utf8');

    // Var definitions connect to the correct motion tokens.
    expect(css).toContain('--_sw-duration: var(--Switch-motionDuration, var(--Motion-Duration-L))');
    expect(css).toContain('--_sw-press-duration: var(--Switch-pressMotionDuration, var(--Motion-Duration-M))');
    expect(css).toContain('--_sw-easing: var(--Switch-motionEasing, var(--Motion-Easing-Transition-Moderate))');

    // Color and position transitions use L duration.
    expect(css).toContain('background-color var(--_sw-duration) var(--_sw-easing)');
    expect(css).toContain('transform var(--_sw-duration) var(--_sw-easing)');
    // Press-scale uses M duration (faster snap on press).
    expect(css).toContain('scale var(--_sw-press-duration) var(--_sw-easing)');

    expect(css).toContain('transform-origin: center center;');
    expect(css).toContain('transform: translateX(var(--_sw-thumb-translate-x));');
    expect(css).toContain('.thumb::before');
    expect(css).toContain('scale: var(--_sw-thumb-scale);');
    expect(css).toContain('--_sw-thumb-press-scale: var(--Switch-thumbPressScale, 1.07);');
    expect(css).toContain('.switch:not([data-readonly]):active .thumb');
    expect(css).not.toMatch(/Motion-Duration-Discreet|Motion-Easing-Standard|Motion-Easing-Emphasized/);
    expect(css).not.toMatch(/Motion-Duration-Subtle|Motion-Easing-Transition-Subtle/);
  });

  // === Accent prop ===

  it('does not add data-accent when accent is not set (fill follows appearance)', () => {
    render(<Switch>Default</Switch>);
    expect(screen.getByRole('switch')).not.toHaveAttribute('data-accent');
  });

  it('applies accent data attribute when explicitly set', () => {
    render(<Switch accent="sparkle">Sparkle</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-accent', 'sparkle');
  });

  it('applies accent=primary data attribute when explicitly set', () => {
    render(<Switch accent="primary">Primary accent</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('data-accent', 'primary');
  });

  // === Form attributes ===

  it('renders with name attribute', () => {
    const { container } = render(<Switch name="notifications">Notifications</Switch>);
    const hiddenInput = container.querySelector('input[name="notifications"]');
    expect(hiddenInput).toBeInTheDocument();
  });

  // === Accessibility ===

  it('has proper role=switch', () => {
    render(<Switch>Accessible</Switch>);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('aria-checked reflects checked state', async () => {
    const user = userEvent.setup();
    render(<Switch>Toggle</Switch>);
    const switchEl = screen.getByRole('switch');

    expect(switchEl).not.toBeChecked();
    await user.click(switchEl);
    expect(switchEl).toBeChecked();
  });

  it('aria-disabled set when disabled', () => {
    render(<Switch disabled>Disabled</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });
});
