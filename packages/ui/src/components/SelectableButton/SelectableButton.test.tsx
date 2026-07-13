/**
 * SelectableButton.test.tsx
 * Unit and accessibility tests for the SelectableButton component
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SelectableButton } from './SelectableButton';

describe('SelectableButton', () => {
  // ─── Basic rendering ────────────────────────────────────────────────────────

  it('renders with children', () => {
    render(<SelectableButton>Like</SelectableButton>);
    expect(screen.getByRole('button', { name: 'Like' })).toBeInTheDocument();
  });

  it('renders with aria-label when no children', () => {
    render(<SelectableButton aria-label="Like post" />);
    expect(screen.getByRole('button', { name: 'Like post' })).toBeInTheDocument();
  });

  // ─── Toggle behaviour ───────────────────────────────────────────────────────

  it('starts unselected by default (aria-pressed=false)', () => {
    render(<SelectableButton>Like</SelectableButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('starts selected when defaultSelected=true', () => {
    render(<SelectableButton defaultSelected>Like</SelectableButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles aria-pressed on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<SelectableButton>Like</SelectableButton>);
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
      <SelectableButton selected={false}>Like</SelectableButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Clicking doesn't change internal state in controlled mode
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Updating the prop changes it
    rerender(<SelectableButton selected={true}>Like</SelectableButton>);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelectedChange with new value', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <SelectableButton onSelectedChange={onSelectedChange}>Like</SelectableButton>
    );

    await user.click(screen.getByRole('button'));
    // Base UI Toggle calls onPressedChange(pressed, event) — check only the first arg
    expect(onSelectedChange).toHaveBeenNthCalledWith(1, true, expect.anything());

    await user.click(screen.getByRole('button'));
    expect(onSelectedChange).toHaveBeenNthCalledWith(2, false, expect.anything());
  });

  it('toggles on Space key press', async () => {
    const user = userEvent.setup();
    render(<SelectableButton>Like</SelectableButton>);
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles on Enter key press', async () => {
    const user = userEvent.setup();
    render(<SelectableButton>Like</SelectableButton>);
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
      <SelectableButton disabled onSelectedChange={onSelectedChange}>
        Like
      </SelectableButton>
    );
    await user.click(screen.getByRole('button'));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  it('sets data-disabled attribute when disabled', () => {
    render(<SelectableButton disabled>Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-disabled');
  });

  // ─── Loading state ──────────────────────────────────────────────────────────

  it('sets data-loading attribute when loading', () => {
    render(<SelectableButton loading>Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading');
  });

  it('does not toggle when loading', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <SelectableButton loading onSelectedChange={onSelectedChange}>
        Like
      </SelectableButton>
    );
    await user.click(screen.getByRole('button'));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  // ─── Data attributes ─────────────────────────────────────────────────────────

  it('sets data-size attribute', () => {
    const { rerender } = render(<SelectableButton size="xs">Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'xs');
    rerender(<SelectableButton size="l">Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'l');
  });

  it('defaults data-size to m', () => {
    render(<SelectableButton>Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'm');
  });

  it('sets data-attention attribute', () => {
    render(<SelectableButton attention="medium">Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'medium');
  });

  it('defaults data-attention to high', () => {
    render(<SelectableButton>Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'high');
  });

  it('sets data-contained attribute', () => {
    render(<SelectableButton contained={false}>Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-contained', 'false');
  });

  it('defaults data-contained to true', () => {
    render(<SelectableButton>Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-contained', 'true');
  });

  it('sets data-condensed attribute when condensed and contained', () => {
    render(<SelectableButton condensed>Like</SelectableButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-condensed');
  });

  it('does not set data-condensed when contained=false', () => {
    render(<SelectableButton condensed contained={false}>Like</SelectableButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-condensed');
  });

  // ─── Appearance ─────────────────────────────────────────────────────────────

  it('applies appearancePrimary class for primary appearance (default)', () => {
    const { container } = render(
      <SelectableButton appearance="primary">Like</SelectableButton>
    );
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/appearancePrimary/);
  });

  it('applies appearance class for non-primary roles', () => {
    const { container } = render(
      <SelectableButton appearance="negative">Like</SelectableButton>
    );
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/appearanceNegative/i);
  });

  // ─── Value prop ─────────────────────────────────────────────────────────────

  it('accepts value prop (used by ToggleGroup, not exposed as HTML attribute)', () => {
    // Base UI Toggle uses value internally for ToggleGroup coordination,
    // but does not render it as an HTML attribute on the button element.
    render(<SelectableButton value="like-123">Like</SelectableButton>);
    // The button still renders correctly with the value prop accepted
    expect(screen.getByRole('button', { name: 'Like' })).toBeInTheDocument();
  });

  // ─── Slots ──────────────────────────────────────────────────────────────────

  it('renders start slot', () => {
    render(
      <SelectableButton start={<span data-testid="icon" />}>Like</SelectableButton>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders end slot', () => {
    render(
      <SelectableButton end={<span data-testid="badge" />}>Like</SelectableButton>
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  // ─── Ref forwarding ─────────────────────────────────────────────────────────

  it('forwards ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<SelectableButton ref={ref}>Like</SelectableButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // ─── Custom className / style ─────────────────────────────────────────────

  it('merges custom className', () => {
    const { container } = render(
      <SelectableButton className="my-custom-class">Like</SelectableButton>
    );
    expect(container.querySelector('button')?.className).toContain('my-custom-class');
  });

  it('start/end slots publish --Icon-color: currentColor so nested Icons track label colour', () => {
    const css = readFileSync(resolve(__dirname, 'SelectableButton.module.css'), 'utf8');
    expect(css).toMatch(/\.selectableButton \.start[\s\S]*?--Icon-color:\s*currentColor/);
    expect(css).toMatch(/\.selectableButton \.end[\s\S]*?--Icon-color:\s*currentColor/);
  });
});
