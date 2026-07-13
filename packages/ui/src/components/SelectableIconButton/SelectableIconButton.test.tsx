/**
 * SelectableIconButton.test.tsx
 * Unit and accessibility tests for the SelectableIconButton component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SelectableIconButton } from './SelectableIconButton';

// Simple inline icon for tests
const TestIcon = () => (
  <svg viewBox="0 0 24 24" data-testid="test-icon">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

describe('SelectableIconButton', () => {
  // ─── Basic rendering ────────────────────────────────────────────────────────

  it('renders with icon', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    expect(screen.getByRole('button', { name: 'Like' })).toBeInTheDocument();
  });

  it('aria-label sets accessible name', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Bookmark post" />);
    expect(screen.getByRole('button', { name: 'Bookmark post' })).toBeInTheDocument();
  });

  // ─── Toggle behaviour ───────────────────────────────────────────────────────

  it('starts unselected by default (aria-pressed=false)', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('starts selected when defaultSelected=true', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" defaultSelected />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles aria-pressed on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('respects controlled selected prop', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SelectableIconButton icon={<TestIcon />} aria-label="Like" selected={false} />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Clicking doesn't change internal state in controlled mode
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Updating the prop changes it
    rerender(<SelectableIconButton icon={<TestIcon />} aria-label="Like" selected={true} />);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelectedChange with new value', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <SelectableIconButton
        icon={<TestIcon />}
        aria-label="Like"
        onSelectedChange={onSelectedChange}
      />,
    );

    await user.click(screen.getByRole('button'));
    // Base UI Toggle calls onPressedChange(pressed, event) — check only the first arg
    expect(onSelectedChange).toHaveBeenNthCalledWith(1, true, expect.anything());

    await user.click(screen.getByRole('button'));
    expect(onSelectedChange).toHaveBeenNthCalledWith(2, false, expect.anything());
  });

  it('toggles on Space key press', async () => {
    const user = userEvent.setup();
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles on Enter key press', async () => {
    const user = userEvent.setup();
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  // ─── Disabled state ─────────────────────────────────────────────────────────

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <SelectableIconButton
        icon={<TestIcon />}
        aria-label="Like"
        disabled
        onSelectedChange={onSelectedChange}
      />,
    );
    await user.click(screen.getByRole('button'));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  it('sets data-disabled attribute when disabled', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" disabled />);
    expect(screen.getByRole('button')).toHaveAttribute('data-disabled');
  });

  // ─── Loading state ──────────────────────────────────────────────────────────

  it('sets data-loading attribute when loading', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" loading />);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading');
  });

  it('does not toggle when loading', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <SelectableIconButton
        icon={<TestIcon />}
        aria-label="Like"
        loading
        onSelectedChange={onSelectedChange}
      />,
    );
    await user.click(screen.getByRole('button'));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  // ─── Data attributes ─────────────────────────────────────────────────────────

  it('sets data-size attribute (numeric) — size=8 → data-size="8"', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" size={8} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '8');
  });

  it('t-shirt size aliases: size="m" → data-size="10"', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" size="m" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
  });

  it('defaults data-size to "10" (M)', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
  });

  it('sets data-attention attribute', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" attention="medium" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'medium');
  });

  it('defaults data-attention to "high"', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'high');
  });

  it('sets data-shape="2:3" when shape="2:3"', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" shape="2:3" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-shape', '2:3');
  });

  it('does not set data-shape for default 1:1', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-shape');
  });

  it('sets data-condensed when condensed=true', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" condensed />);
    expect(screen.getByRole('button')).toHaveAttribute('data-condensed');
  });

  // ─── Contained prop ─────────────────────────────────────────────────────────

  it('defaults data-contained to "true"', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-contained', 'true');
  });

  it('sets data-contained="false" when contained=false', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" contained={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-contained', 'false');
  });

  it('does not set data-condensed when contained=false even if condensed=true', () => {
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" contained={false} condensed />);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-condensed');
  });

  // ─── Appearance ─────────────────────────────────────────────────────────────

  it('applies appearance class for non-primary role', () => {
    const { container } = render(
      <SelectableIconButton icon={<TestIcon />} aria-label="Like" appearance="negative" />,
    );
    expect(container.querySelector('button')?.className).toMatch(/appearanceNegative/i);
  });

  it('applies appearancePrimary class for primary (default)', () => {
    const { container } = render(
      <SelectableIconButton icon={<TestIcon />} aria-label="Like" appearance="primary" />,
    );
    expect(container.querySelector('button')?.className).toMatch(/appearancePrimary/);
  });

  // ─── Ref forwarding ─────────────────────────────────────────────────────────

  it('forwards ref to button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<SelectableIconButton ref={ref} icon={<TestIcon />} aria-label="Like" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // ─── Custom className / style ─────────────────────────────────────────────

  it('merges custom className', () => {
    const { container } = render(
      <SelectableIconButton icon={<TestIcon />} aria-label="Like" className="my-custom-class" />,
    );
    expect(container.querySelector('button')?.className).toContain('my-custom-class');
  });

  // ─── Value prop ─────────────────────────────────────────────────────────────

  it('accepts value prop (used by ToggleGroup)', () => {
    // Base UI Toggle uses value internally for ToggleGroup coordination
    render(<SelectableIconButton icon={<TestIcon />} aria-label="Like" value="like-123" />);
    expect(screen.getByRole('button', { name: 'Like' })).toBeInTheDocument();
  });
});
