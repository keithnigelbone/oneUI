/**
 * Stepper.test.tsx
 * Unit tests for Stepper component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Stepper } from './Stepper';
import { Surface } from '../Surface';
import { IconButton } from '../IconButton';

describe('Stepper', () => {
  // ============================================
  // RENDERING
  // ============================================

  it('renders with default value', () => {
    render(<Stepper defaultValue={5} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('5');
  });

  it('renders increment and decrement buttons', () => {
    render(<Stepper defaultValue={0} />);
    expect(screen.getByLabelText('Increase value')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease value')).toBeInTheDocument();
  });

  // ============================================
  // CONTROLLED / UNCONTROLLED
  // ============================================

  it('works as controlled component', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Stepper value={5} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('5');

    rerender(<Stepper value={10} onChange={onChange} />);
    expect(input).toHaveValue('10');
  });

  it('works as uncontrolled component', async () => {
    const user = userEvent.setup();
    render(<Stepper defaultValue={5} />);
    const incrementButton = screen.getByLabelText('Increase value');
    await user.click(incrementButton);
    expect(screen.getByRole('textbox')).toHaveValue('6');
  });

  // ============================================
  // INCREMENT / DECREMENT
  // ============================================

  it('increments value on increment button click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stepper defaultValue={5} onChange={onChange} />);

    await user.click(screen.getByLabelText('Increase value'));
    expect(onChange).toHaveBeenCalledWith(null, 6);
  });

  it('decrements value on decrement button click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stepper defaultValue={5} onChange={onChange} />);

    await user.click(screen.getByLabelText('Decrease value'));
    expect(onChange).toHaveBeenCalledWith(null, 4);
  });

  it('respects custom step', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stepper defaultValue={10} step={5} onChange={onChange} />);

    await user.click(screen.getByLabelText('Increase value'));
    expect(onChange).toHaveBeenCalledWith(null, 15);
  });

  // ============================================
  // MIN / MAX BOUNDS
  // ============================================

  it('does not go below min', async () => {
    const user = userEvent.setup();
    render(<Stepper defaultValue={0} min={0} />);

    const decrementButton = screen.getByLabelText('Decrease value');
    await user.click(decrementButton);
    expect(screen.getByRole('textbox')).toHaveValue('0');
  });

  it('does not go above max', async () => {
    const user = userEvent.setup();
    render(<Stepper defaultValue={10} max={10} />);

    const incrementButton = screen.getByLabelText('Increase value');
    await user.click(incrementButton);
    expect(screen.getByRole('textbox')).toHaveValue('10');
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  it('is disabled when disabled prop is true', () => {
    render(<Stepper defaultValue={5} disabled />);
    expect(screen.getByLabelText('Increase value')).toBeDisabled();
    expect(screen.getByLabelText('Decrease value')).toBeDisabled();
  });

  // ============================================
  // READONLY STATE
  // ============================================

  it('is read-only when readOnly prop is true', () => {
    render(<Stepper defaultValue={5} readOnly />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  // ============================================
  // ERROR STATE
  // ============================================

  it('sets aria-invalid when error prop is true', () => {
    render(<Stepper defaultValue={5} error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  it('sets data-size attribute', () => {
    const { container } = render(<Stepper defaultValue={5} size="l" />);
    const group = container.querySelector('[data-size]');
    expect(group).toHaveAttribute('data-size', 'l');
  });

  it('sets data-attention attribute', () => {
    const { container } = render(<Stepper defaultValue={5} attention="high" />);
    const group = container.querySelector('[data-attention]');
    expect(group).toHaveAttribute('data-attention', 'high');
  });

  it('sets ltr direction by default', () => {
    const { container } = render(<Stepper defaultValue={5} />);
    const group = container.querySelector('[data-direction]');
    expect(group).toHaveAttribute('data-direction', 'ltr');
  });

  it('sets rtl direction when requested', () => {
    const { container } = render(<Stepper defaultValue={5} direction="rtl" />);
    const group = container.querySelector('[data-direction]');
    expect(group).toHaveAttribute('data-direction', 'rtl');
  });

  it('sets data-appearance attribute', () => {
    const { container } = render(<Stepper defaultValue={5} appearance="neutral" />);
    const group = container.querySelector('[data-appearance]');
    expect(group).toHaveAttribute('data-appearance', 'neutral');
  });

  it('resolves auto appearance to secondary', () => {
    render(<Stepper defaultValue={5} appearance="auto" />);
    const group = screen.getByRole('textbox').closest('[data-attention]');
    expect(group).toHaveAttribute('data-appearance', 'secondary');
  });

  it('inherits appearance from nearest Surface when appearance is omitted', () => {
    render(
      <Surface mode="subtle" appearance="sparkle">
        <Stepper defaultValue={5} />
      </Surface>,
    );
    const group = screen.getByRole('textbox').closest('[data-attention]');
    expect(group).toHaveAttribute('data-appearance', 'sparkle');
  });

  it('renders start and end slot elements when provided', () => {
    render(
      <Stepper
        defaultValue={5}
        start={
          <IconButton icon="remove" attention="low" aria-label="Decrease value" />
        }
        end={
          <IconButton icon="add" attention="low" aria-label="Increase value" />
        }
      />,
    );
    const dec = screen.getByLabelText('Decrease value');
    const inc = screen.getByLabelText('Increase value');
    expect(dec).toHaveAttribute('data-variant', 'ghost');
    expect(inc).toHaveAttribute('data-variant', 'ghost');
  });

  it('keeps custom IconButton slots wired to number field behavior', async () => {
    const user = userEvent.setup();
    render(
      <Stepper
        defaultValue={5}
        start={<IconButton icon="remove" aria-label="Decrease value" />}
        end={<IconButton icon="add" aria-label="Increase value" />}
      />,
    );

    await user.click(screen.getByLabelText('Increase value'));
    expect(screen.getByRole('textbox')).toHaveValue('6');

    await user.click(screen.getByLabelText('Decrease value'));
    expect(screen.getByRole('textbox')).toHaveValue('5');
  });

  it('sets data-condensed attribute when condensed', () => {
    const { container } = render(<Stepper defaultValue={5} condensed />);
    const group = container.querySelector('[data-condensed]');
    expect(group).toBeInTheDocument();
  });

  it('sets data-accent attribute when accent is set', () => {
    const { container } = render(<Stepper defaultValue={5} accent="sparkle" />);
    const group = container.querySelector('[data-accent]');
    expect(group).toHaveAttribute('data-accent', 'sparkle');
  });

  it('does not set data-accent when accent is not set', () => {
    const { container } = render(<Stepper defaultValue={5} />);
    const group = container.querySelector('[data-accent]');
    expect(group).toBeNull();
  });

  // ============================================
  // TEST ID
  // ============================================

  it('forwards data-testid', () => {
    render(<Stepper defaultValue={5} data-testid="my-stepper" />);
    expect(screen.getByTestId('my-stepper')).toBeInTheDocument();
  });

  // ============================================
  // ACCESSIBILITY
  // ============================================

  it('has accessible increment/decrement buttons', () => {
    render(<Stepper defaultValue={5} />);
    expect(screen.getByLabelText('Increase value')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease value')).toBeInTheDocument();
  });
});
