/**
 * SelectableSingleTextButton.test.tsx
 * Unit tests for SelectableSingleTextButton
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectableSingleTextButton } from './SelectableSingleTextButton';

describe('SelectableSingleTextButton', () => {
  // =========================================
  // Rendering
  // =========================================

  it('renders with children text', () => {
    render(<SelectableSingleTextButton>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button', { name: 'Ag' })).toBeInTheDocument();
  });

  it('truncates children exceeding 2 characters', () => {
    render(<SelectableSingleTextButton>Photos</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Ph');
  });

  it('forwards ref to button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<SelectableSingleTextButton ref={ref}>Ab</SelectableSingleTextButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges custom className', () => {
    render(
      <SelectableSingleTextButton className="my-class">Ag</SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('my-class');
  });

  it('forwards data-testid to the root button', () => {
    render(<SelectableSingleTextButton data-testid="sstb-qa-root">Ag</SelectableSingleTextButton>);
    expect(screen.getByTestId('sstb-qa-root')).toBeInTheDocument();
  });

  it('accepts aria-label prop', () => {
    render(
      <SelectableSingleTextButton aria-label="Custom label">
        Ag
      </SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
  });

  // =========================================
  // Toggle behavior — uncontrolled
  // =========================================

  it('starts unselected by default (aria-pressed=false)', () => {
    render(<SelectableSingleTextButton>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('starts selected when defaultSelected=true', () => {
    render(
      <SelectableSingleTextButton defaultSelected>Ag</SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles aria-pressed on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<SelectableSingleTextButton>Ag</SelectableSingleTextButton>);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles on Space key press', async () => {
    const user = userEvent.setup();
    render(<SelectableSingleTextButton>En</SelectableSingleTextButton>);
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles on Enter key press', async () => {
    const user = userEvent.setup();
    render(<SelectableSingleTextButton>Hi</SelectableSingleTextButton>);
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  // =========================================
  // Toggle behavior — controlled
  // =========================================

  it('respects controlled selected prop', () => {
    const { rerender } = render(
      <SelectableSingleTextButton selected={false}>Ag</SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <SelectableSingleTextButton selected={true}>Ag</SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelectedChange with new value when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SelectableSingleTextButton onSelectedChange={handleChange}>
        Ag
      </SelectableSingleTextButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenNthCalledWith(1, true, expect.anything());
  });

  it('accepts value prop (for ToggleGroup)', () => {
    render(
      <SelectableSingleTextButton value="en">En</SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // =========================================
  // Disabled state
  // =========================================

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<SelectableSingleTextButton disabled>Ag</SelectableSingleTextButton>);
    const button = screen.getByRole('button');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets data-disabled attribute when disabled', () => {
    render(<SelectableSingleTextButton disabled>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-disabled');
  });

  // =========================================
  // Loading state
  // =========================================

  it('sets data-loading attribute when loading', () => {
    render(<SelectableSingleTextButton loading>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading');
  });

  it('does not toggle when loading', async () => {
    const user = userEvent.setup();
    render(<SelectableSingleTextButton loading>Ag</SelectableSingleTextButton>);
    const button = screen.getByRole('button');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders spinner SVG when loading', () => {
    const { container } = render(
      <SelectableSingleTextButton loading>Ag</SelectableSingleTextButton>,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // =========================================
  // Data attributes
  // =========================================

  it('sets data-size attribute', () => {
    render(<SelectableSingleTextButton size="s">Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 's');
  });

  it('defaults data-size to "m"', () => {
    render(<SelectableSingleTextButton>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'm');
  });

  it('sets data-attention attribute', () => {
    render(
      <SelectableSingleTextButton attention="medium">Ag</SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'medium');
  });

  it('defaults data-attention to "high"', () => {
    render(<SelectableSingleTextButton>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'high');
  });

  it('sets data-condensed flag when condensed=true', () => {
    render(<SelectableSingleTextButton condensed>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-condensed');
  });

  it('does not set data-condensed when condensed is false/unset', () => {
    render(<SelectableSingleTextButton>Ag</SelectableSingleTextButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-condensed');
  });

  // =========================================
  // Appearance classes
  // =========================================

  it('applies appearance class for non-primary role', () => {
    const { container } = render(
      <SelectableSingleTextButton appearance="negative">Ag</SelectableSingleTextButton>,
    );
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/appearanceNegative/);
  });

  it('applies appearancePrimary class for primary (default)', () => {
    const { container } = render(
      <SelectableSingleTextButton appearance="primary">Ag</SelectableSingleTextButton>,
    );
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/appearancePrimary/);
  });

  it('does not apply an appearance class for auto so brand component themes can choose the role', () => {
    const { container } = render(
      <SelectableSingleTextButton appearance="auto">Ag</SelectableSingleTextButton>,
    );
    const button = container.querySelector('button');
    expect(button?.className).not.toMatch(/appearance[A-Z]/);
  });

  // =========================================
  // All sizes
  // =========================================

  it.each([
    ['s', 's'],
    ['m', 'm'],
    ['l', 'l'],
  ] as const)('size="%s" sets data-size="%s"', (size, expected) => {
    render(
      <SelectableSingleTextButton size={size}>Ag</SelectableSingleTextButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-size', expected);
  });
});
