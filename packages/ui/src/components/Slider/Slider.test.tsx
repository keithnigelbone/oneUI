/**
 * Slider.test.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders with role=slider', () => {
    render(<Slider defaultValue={50} aria-label="Volume" />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders two sliders in range mode', () => {
    render(<Slider defaultValue={[20, 80]} ariaLabels={['Min', 'Max']} />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('defaults appearance to secondary', () => {
    const { container } = render(<Slider defaultValue={30} aria-label="t" />);
    const root = container.querySelector('[data-appearance]');
    expect(root).toHaveAttribute('data-appearance', 'secondary');
  });

  it('resolves auto appearance to secondary', () => {
    const { container } = render(
      <Slider defaultValue={30} appearance="auto" aria-label="t" />
    );
    const root = container.querySelector('[data-appearance]');
    expect(root).toHaveAttribute('data-appearance', 'secondary');
  });

  it('applies appearance attribute', () => {
    const { container } = render(
      <Slider defaultValue={30} appearance="positive" aria-label="t" />
    );
    const root = container.querySelector('[data-appearance]');
    expect(root).toHaveAttribute('data-appearance', 'positive');
  });

  it('defaults knobStyle to outside', () => {
    const { container } = render(<Slider defaultValue={30} aria-label="t" />);
    const root = container.querySelector('[data-knob-style]');
    expect(root).toHaveAttribute('data-knob-style', 'outside');
  });

  it('applies knobStyle=inside', () => {
    const { container } = render(
      <Slider defaultValue={30} knobStyle="inside" aria-label="t" />
    );
    const root = container.querySelector('[data-knob-style]');
    expect(root).toHaveAttribute('data-knob-style', 'inside');
  });

  it('exposes aria-valuenow from defaultValue', () => {
    render(<Slider defaultValue={42} aria-label="t" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
  });

  it('calls onValueChange when user presses ArrowRight', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} onValueChange={onChange} aria-label="t" />);
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalled();
  });

  it('disabled prevents keyboard change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Slider defaultValue={50} disabled onValueChange={onChange} aria-label="t" />
    );
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('readOnly prevents keyboard change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Slider defaultValue={50} readOnly onValueChange={onChange} aria-label="t" />
    );
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports vertical orientation', () => {
    const { container } = render(
      <Slider defaultValue={30} orientation="vertical" aria-label="t" />
    );
    const root = container.querySelector('[data-orientation]');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
  });

  it('renders tooltip bubble when showTooltip defaults to auto', () => {
    const { container } = render(<Slider defaultValue={42} aria-label="t" />);
    expect(container.querySelector('[data-slider-tooltip]')).toBeInTheDocument();
  });

  it('omits tooltip when showTooltip={false}', () => {
    const { container } = render(
      <Slider defaultValue={42} showTooltip={false} aria-label="t" />
    );
    expect(container.querySelector('[data-slider-tooltip]')).not.toBeInTheDocument();
  });

  it('formatValue output appears in tooltip text content', () => {
    const { container } = render(
      <Slider defaultValue={1200} aria-label="t" formatValue={(v) => `$${v}`} />
    );
    const tooltip = container.querySelector('[data-slider-tooltip]');
    expect(tooltip?.textContent).toContain('$1200');
  });

  it('showSteps renders inner tick elements', () => {
    const { container } = render(
      <Slider showSteps min={0} max={4} step={1} defaultValue={0} aria-label="t" />
    );
    // SliderSteps skips the first and last edge ticks, so 5 positions → 3 inner ticks
    const ticks = container.querySelectorAll('[class*="tick"]:not([class*="tickLabel"]):not([class*="tickLabelWrap"])');
    expect(ticks.length).toBeGreaterThanOrEqual(3);
  });

  it('stepLabels renders label text for each step', () => {
    const { container } = render(
      <Slider
        showSteps
        stepLabels={['A', 'B', 'C', 'D', 'E']}
        min={0}
        max={4}
        step={1}
        defaultValue={0}
        aria-label="t"
      />
    );
    expect(container.textContent).toContain('B');
    expect(container.textContent).toContain('C');
    expect(container.textContent).toContain('D');
  });

  // snapToSteps=false must keep sub-unit resolution intact. Previously the
  // drag step hardcoded to 1, which is coarser than `step` for sub-unit ranges
  // like 0-1/0.01 — regression-protecting that here.
  it('snapToSteps=false does not coarsen resolution for sub-unit ranges', () => {
    const { getByRole } = render(
      <Slider
        min={0}
        max={1}
        step={0.01}
        defaultValue={0.5}
        snapToSteps={false}
        aria-label="t"
      />
    );
    const slider = getByRole('slider');
    // Sub-unit initial value must survive. If dragStep were hardcoded to 1
    // (the pre-fix behavior), Base UI would round the default to 0 or 1 on
    // mount; with the scaled freeDragStep ((max-min)/1000 = 0.001), the
    // 0.5 initial is representable exactly.
    expect(slider).toHaveAttribute('aria-valuenow', '0.5');
  });
});
