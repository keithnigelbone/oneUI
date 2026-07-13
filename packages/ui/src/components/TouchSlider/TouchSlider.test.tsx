/**
 * TouchSlider.test.tsx — single size.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TouchSlider } from './TouchSlider';
import {
  computeTouchSliderCapRatio,
  isTouchSliderStartSlotOnRail,
} from './TouchSlider.shared';

describe('TouchSlider cap geometry', () => {
  /** Figma horizontal footprint 138×32 — r/L = 16/138. */
  const capRatio = computeTouchSliderCapRatio(138, 32);

  it('derives cap ratio from track length and thickness (r/L)', () => {
    expect(capRatio).toBeCloseTo(16 / 138, 5);
  });

  it('greys the leading slot in sharp mode until fill reaches r/L', () => {
    expect(isTouchSliderStartSlotOnRail(0, capRatio, 'sharp')).toBe(true);
    expect(isTouchSliderStartSlotOnRail(capRatio / 2, capRatio, 'sharp')).toBe(true);
    expect(isTouchSliderStartSlotOnRail(capRatio, capRatio, 'sharp')).toBe(false);
  });

  it('never greys the leading slot in rounded mode (leading cap is always fill)', () => {
    expect(isTouchSliderStartSlotOnRail(0, capRatio, 'rounded')).toBe(false);
  });
});

describe('TouchSlider', () => {
  it('renders with role=slider', () => {
    render(<TouchSlider defaultValue={50} aria-label="Volume" />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('forwards aria-label to the slider thumb input', () => {
    render(<TouchSlider defaultValue={50} aria-label="Volume" />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('defaults progressStyle to rounded', () => {
    const { container } = render(<TouchSlider defaultValue={30} aria-label="t" />);
    const root = container.querySelector('[data-progress-style]');
    expect(root).toHaveAttribute('data-progress-style', 'rounded');
  });

  it('applies progressStyle=sharp', () => {
    const { container } = render(
      <TouchSlider defaultValue={30} progressStyle="sharp" aria-label="t" />
    );
    const root = container.querySelector('[data-progress-style]');
    expect(root).toHaveAttribute('data-progress-style', 'sharp');
  });

  it('resolves auto appearance to secondary', () => {
    const { container } = render(
      <TouchSlider defaultValue={30} appearance="auto" aria-label="t" />
    );
    const root = container.querySelector('[data-appearance]');
    expect(root).toHaveAttribute('data-appearance', 'secondary');
  });

  it('calls onValueChange on keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TouchSlider defaultValue={50} onValueChange={onChange} aria-label="t" />);
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalled();
  });

  it('disabled blocks interaction', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TouchSlider defaultValue={50} disabled onValueChange={onChange} aria-label="t" />);
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders start slot inside control (not on thumb or indicator)', () => {
    const { container } = render(
      <TouchSlider
        defaultValue={60}
        progressStyle="rounded"
        start={<span data-testid="start-icon">icon</span>}
        aria-label="Volume"
      />,
    );
    const icon = screen.getByTestId('start-icon');
    const slot = icon.closest('[data-slider-slot="start"]');
    expect(slot).not.toBeNull();
    expect(slot?.parentElement?.className).toMatch(/control/);
    expect(icon.closest('[class*="thumb"]')).toBeNull();
  });

  it('applies rootVertical for vertical orientation slot anchoring', () => {
    const { container } = render(
      <TouchSlider
        defaultValue={50}
        orientation="vertical"
        start={<span data-testid="start-icon">icon</span>}
        aria-label="Vertical volume"
      />,
    );
    expect(container.querySelector('[class*="rootVertical"]')).not.toBeNull();
    expect(container.querySelector('[data-orientation="vertical"]')).not.toBeNull();
  });

  it('marks data-start-on-rail in sharp mode when value is at minimum with a start slot', () => {
    const { container } = render(
      <TouchSlider
        defaultValue={0}
        progressStyle="sharp"
        start={<span>icon</span>}
        aria-label="Volume"
      />,
    );
    expect(container.querySelector('[data-start-on-rail]')).not.toBeNull();
  });

  it('does not mark data-start-on-rail in rounded mode at minimum (leading cap is fill)', () => {
    const { container } = render(
      <TouchSlider
        defaultValue={0}
        progressStyle="rounded"
        start={<span>icon</span>}
        aria-label="Volume"
      />,
    );
    expect(container.querySelector('[data-start-on-rail]')).toBeNull();
  });

  it('clears data-start-on-rail in sharp mode after the value moves off min', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TouchSlider
        defaultValue={0}
        progressStyle="sharp"
        start={<span>icon</span>}
        aria-label="Volume"
      />,
    );
    expect(container.querySelector('[data-start-on-rail]')).not.toBeNull();
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(container.querySelector('[data-start-on-rail]')).toBeNull();
  });
});
