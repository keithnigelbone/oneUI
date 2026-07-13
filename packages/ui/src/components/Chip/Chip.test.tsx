/**
 * Chip.test.tsx
 * Unit tests for Chip component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from './Chip';
import { Surface } from '../Surface';

describe('Chip', () => {
  // ============================================
  // RENDERING
  // ============================================

  it('renders with children text', () => {
    render(<Chip aria-label="Test chip">Filter</Chip>);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<Chip aria-label="Test chip">Chip</Chip>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('forwards data-testid to the root button', () => {
    render(
      <Chip data-testid="qa-chip-root" aria-label="Test chip">
        Filter
      </Chip>,
    );
    expect(screen.getByTestId('qa-chip-root')).toBe(screen.getByRole('button'));
  });

  // ============================================
  // TOGGLE BEHAVIOR
  // ============================================

  it('toggles selected state on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Chip aria-label="Toggle chip">Toggle</Chip>);
    const button = screen.getByRole('button');

    // Initially pressed by default.
    expect(button).toHaveAttribute('aria-pressed', 'true');

    // Click to deselect.
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Click again to select.
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('starts selected by default', () => {
    render(<Chip aria-label="Default selected">Selected</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('starts selected with defaultSelected', () => {
    render(<Chip defaultSelected aria-label="Default selected">Selected</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('can start unselected with defaultSelected false', () => {
    render(<Chip defaultSelected={false} aria-label="Default unselected">Unselected</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('supports controlled selected state', async () => {
    const onSelectedChange = vi.fn();
    const { rerender } = render(
      <Chip selected={false} onSelectedChange={onSelectedChange} aria-label="Controlled">
        Controlled
      </Chip>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Click triggers callback but doesn't change state (controlled)
    await userEvent.click(button);
    expect(onSelectedChange).toHaveBeenCalledWith(true, expect.anything());

    // Parent updates state
    rerender(
      <Chip selected={true} onSelectedChange={onSelectedChange} aria-label="Controlled">
        Controlled
      </Chip>
    );
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  // ============================================
  // ATTENTION / VARIANT RESOLUTION
  // ============================================

  it('resolves attention="high" to data-variant="bold"', () => {
    render(<Chip attention="high" aria-label="High attention">Bold</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'bold');
  });

  it('resolves attention="medium" to data-variant="subtle"', () => {
    render(<Chip attention="medium" aria-label="Medium attention">Subtle</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'subtle');
  });

  it('resolves attention="low" to data-variant="ghost"', () => {
    render(<Chip attention="low" aria-label="Low attention">Ghost</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
  });

  it('defaults to bold variant when no attention specified', () => {
    render(<Chip aria-label="Default">Default</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'bold');
  });

  // ============================================
  // APPEARANCE RESOLUTION
  // ============================================

  it('resolves auto appearance to secondary', () => {
    render(<Chip appearance="auto" aria-label="Auto">Auto</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'secondary');
  });

  it('resolves undefined appearance to secondary', () => {
    render(<Chip aria-label="Default">Default</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'secondary');
  });

  it('passes through explicit appearance', () => {
    render(<Chip appearance="negative" aria-label="Negative">Negative</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'negative');
  });

  it('uses neutral as the default unselected appearance', () => {
    render(<Chip appearance="negative" attention="high" aria-label="Default unselected">Default</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-unselected-appearance', 'neutral');
  });

  it('inherits unselected appearance from the nearest Surface', () => {
    render(
      <Surface mode="subtle" appearance="secondary">
        <Chip appearance="negative" attention="medium" aria-label="Surface unselected">Surface</Chip>
      </Surface>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'negative');
    expect(screen.getByRole('button')).toHaveAttribute('data-unselected-appearance', 'secondary');
  });

  // ============================================
  // SIZE
  // ============================================

  it('defaults to size m', () => {
    render(<Chip aria-label="Default size">Default</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'm');
  });

  it('sets data-size for small', () => {
    render(<Chip size="s" aria-label="Small">Small</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 's');
  });

  it('sets data-size for large', () => {
    render(<Chip size="l" aria-label="Large">Large</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'l');
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  it('is disabled when disabled prop is true', () => {
    render(<Chip disabled aria-label="Disabled">Disabled</Chip>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not toggle when disabled', async () => {
    const onSelectedChange = vi.fn();
    render(
      <Chip disabled onSelectedChange={onSelectedChange} aria-label="Disabled">
        Disabled
      </Chip>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  // ============================================
  // SLOTS
  // ============================================

  it('renders start slot content', () => {
    render(
      <Chip start={<span data-testid="start-icon">S</span>} aria-label="With start">
        Label
      </Chip>
    );
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders end slot content', () => {
    render(
      <Chip end={<span data-testid="end-icon">E</span>} aria-label="With end">
        Label
      </Chip>
    );
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('renders both start and end slots', () => {
    render(
      <Chip
        start={<span data-testid="start">S</span>}
        end={<span data-testid="end">E</span>}
        aria-label="Both slots"
      >
        Label
      </Chip>
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('publishes selected bold surface context to slot children', async () => {
    const user = userEvent.setup();
    render(
      <Chip attention="high" start={<span data-testid="start">S</span>} aria-label="Surface slot">
        Label
      </Chip>
    );

    const slot = screen.getByTestId('start').parentElement;
    expect(slot).toHaveAttribute('data-surface', 'bold');

    await user.click(screen.getByRole('button'));
    expect(slot).not.toHaveAttribute('data-surface');
  });

  it('wraps semantic badge slot children in a context boundary', () => {
    function SemanticCounterBadge() {
      return <span data-testid="counter">3</span>;
    }
    SemanticCounterBadge.displayName = 'CounterBadge';

    render(
      <Chip
        attention="high"
        defaultSelected
        start={<SemanticCounterBadge />}
        aria-label="Semantic slot"
      >
        Label
      </Chip>
    );

    const boundary = screen.getByTestId('counter').parentElement;
    expect(boundary).toHaveAttribute('data-context-boundary');
    expect(boundary?.parentElement).toHaveAttribute('data-surface', 'bold');
  });

  // ============================================
  // ACCESSIBILITY
  // ============================================

  it('has aria-pressed attribute', () => {
    render(<Chip aria-label="Pressable">Press me</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed');
  });

  it('sets aria-label', () => {
    render(<Chip aria-label="Filter by category">Category</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Filter by category');
  });

  it('toggles via keyboard (Enter)', async () => {
    const user = userEvent.setup();
    render(<Chip defaultSelected={false} aria-label="Keyboard toggle">Toggle</Chip>);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles via keyboard (Space)', async () => {
    const user = userEvent.setup();
    render(<Chip defaultSelected={false} aria-label="Space toggle">Toggle</Chip>);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
