/**
 * SingleTextButton.test.tsx
 * Unit tests for SingleTextButton
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SingleTextButton } from './SingleTextButton';

describe('SingleTextButton', () => {
  // =========================================
  // Rendering
  // =========================================

  it('renders with children text', () => {
    render(<SingleTextButton>Ag</SingleTextButton>);
    expect(screen.getByRole('button', { name: 'Ag' })).toBeInTheDocument();
  });

  it('truncates children exceeding 2 characters', () => {
    render(<SingleTextButton>Photos</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Ph');
  });

  it('forwards ref to button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<SingleTextButton ref={ref}>Ab</SingleTextButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges custom className', () => {
    render(<SingleTextButton className="my-class">Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveClass('my-class');
  });

  it('accepts aria-label prop', () => {
    render(
      <SingleTextButton aria-label="Custom label">Ag</SingleTextButton>,
    );
    expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
  });

  // =========================================
  // Click handling
  // =========================================

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SingleTextButton onClick={onClick}>Ag</SingleTextButton>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onPress when clicked (alias)', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<SingleTextButton onPress={onPress}>Ag</SingleTextButton>);
    await user.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('responds to Enter key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SingleTextButton onClick={onClick}>Ag</SingleTextButton>);
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  // =========================================
  // Disabled state
  // =========================================

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SingleTextButton disabled onClick={onClick}>Ag</SingleTextButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  // =========================================
  // Loading state
  // =========================================

  it('sets data-loading attribute when loading', () => {
    render(<SingleTextButton loading>Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading');
  });

  it('does not fire onClick when loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SingleTextButton loading onClick={onClick}>Ag</SingleTextButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders spinner SVG when loading', () => {
    const { container } = render(
      <SingleTextButton loading>Ag</SingleTextButton>,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // =========================================
  // Data attributes
  // =========================================

  it('sets data-size attribute', () => {
    render(<SingleTextButton size="s">Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 's');
  });

  it('defaults data-size to "m"', () => {
    render(<SingleTextButton>Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'm');
  });

  it('sets data-attention attribute', () => {
    render(<SingleTextButton attention="medium">Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'medium');
  });

  it('defaults data-attention to "high"', () => {
    render(<SingleTextButton>Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'high');
  });

  it('sets data-variant derived from attention', () => {
    render(<SingleTextButton attention="low">Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
  });

  it('sets data-condensed flag when condensed=true', () => {
    render(<SingleTextButton condensed>Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-condensed');
  });

  it('does not set data-condensed when condensed is false/unset', () => {
    render(<SingleTextButton>Ag</SingleTextButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-condensed');
  });

  // =========================================
  // Appearance classes
  // =========================================

  it('applies appearance class for non-primary role', () => {
    const { container } = render(
      <SingleTextButton appearance="negative">Ag</SingleTextButton>,
    );
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/appearanceNegative/);
  });

  it('does not apply extra appearance class for auto (defaults to primary)', () => {
    const { container } = render(
      <SingleTextButton appearance="auto">Ag</SingleTextButton>,
    );
    const button = container.querySelector('button');
    expect(button?.className).not.toMatch(/appearance[A-Z]/);
  });

  // =========================================
  // All sizes / attentions
  // =========================================

  it.each([
    ['s', 's'],
    ['m', 'm'],
    ['l', 'l'],
  ] as const)('size="%s" sets data-size="%s"', (size, expected) => {
    render(<SingleTextButton size={size}>Ag</SingleTextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', expected);
  });

  it.each([
    ['high', 'bold'],
    ['medium', 'subtle'],
    ['low', 'ghost'],
  ] as const)(
    'attention="%s" maps to variant="%s"',
    (attention, expectedVariant) => {
      render(
        <SingleTextButton attention={attention}>Ag</SingleTextButton>,
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'data-variant',
        expectedVariant,
      );
    },
  );
});
