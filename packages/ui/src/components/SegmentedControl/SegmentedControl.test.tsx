/**
 * SegmentedControl.test.tsx
 *
 * Smoke + interaction + a11y coverage for SegmentedControl (Base UI ToggleGroup).
 */

import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from './SegmentedControl';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import { Surface } from '../Surface';
import { expectNoA11yViolations } from '../../test-utils/a11y';

function renderCompound(
  props: Partial<React.ComponentProps<typeof SegmentedControl>> & { selected?: string } = {},
) {
  const { selected = 'day', ...rest } = props;

  function Wrapper() {
    const [value, setValue] = useState(selected);
    return (
      <SegmentedControl
        aria-label="Range"
        value={value}
        onValueChange={setValue}
        {...rest}
      >
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
        <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
      </SegmentedControl>
    );
  }

  return render(<Wrapper />);
}

function getSegmentButtons() {
  return screen.getAllByRole('button');
}

describe('SegmentedControl', () => {
  it('renders a group with one button per segment', () => {
    renderCompound();
    expect(screen.getByRole('group', { name: 'Range' })).toBeInTheDocument();
    expect(getSegmentButtons()).toHaveLength(3);
    expect(screen.getByText('Day')).toBeInTheDocument();
  });

  it('marks the selected segment with aria-pressed=true', () => {
    render(
      <SegmentedControl aria-label="Range" value="week" onValueChange={() => {}}>
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
      </SegmentedControl>,
    );
    const [, weekButton] = getSegmentButtons();
    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('fires onValueChange with the new value when clicked', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();

    function Wrapper() {
      const [value, setValue] = useState('day');
      return (
        <SegmentedControl aria-label="Range" value={value} onValueChange={handle}>
          <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
          <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
          <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
        </SegmentedControl>
      );
    }

    render(<Wrapper />);

    const [, , monthButton] = getSegmentButtons();
    await user.click(monthButton);
    expect(handle).toHaveBeenCalledWith('month');
  });

  it('disabled group blocks interaction', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <SegmentedControl aria-label="Range" value="day" onValueChange={handle} disabled>
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
      </SegmentedControl>,
    );

    const [, weekButton] = getSegmentButtons();
    await user.click(weekButton).catch(() => {});
    expect(handle).not.toHaveBeenCalled();
  });

  it('per-item disabled is surfaced via disabled attribute', () => {
    render(
      <SegmentedControl aria-label="Range" value="day" onValueChange={() => {}}>
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        <SegmentedControl.Item value="week" disabled>
          Week
        </SegmentedControl.Item>
      </SegmentedControl>,
    );
    const [, weekButton] = getSegmentButtons();
    expect(weekButton).toBeDisabled();
  });

  it('applies resolved appearance class when auto inherits parent Surface role', () => {
    render(
      <Surface mode="bold" appearance="secondary">
        <SegmentedControl aria-label="Range" value="day" onValueChange={() => {}}>
          <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        </SegmentedControl>
      </Surface>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-appearance', 'secondary');
    expect(group.className).toMatch(/appearanceSecondary/);
  });

  it('applies explicit appearance class when appearance prop is set', () => {
    render(
      <SegmentedControl aria-label="Range" value="day" onValueChange={() => {}} appearance="positive">
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
      </SegmentedControl>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-appearance', 'positive');
    expect(group.className).toMatch(/appearancePositive/);
  });

  it('applies track, attention, and track-appearance data attributes on the group', () => {
    render(
      <SegmentedControl
        aria-label="Range"
        value="day"
        onValueChange={() => {}}
        trackEmphasis="medium"
        attention="low"
        shape="rectangular"
        equalWidth={false}
      >
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
      </SegmentedControl>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-track-emphasis', 'medium');
    expect(group).toHaveAttribute('data-attention', 'low');
    expect(group).toHaveAttribute('data-selected-appearance', 'neutral');
    expect(group).toHaveAttribute('data-shape', 'rectangular');
    expect(group).toHaveAttribute('data-track-appearance', 'neutral');
    expect(group).toHaveAttribute('data-appearance', 'primary');
    expect(group).not.toHaveAttribute('data-equal-width');
  });

  it('low attention selected role follows parent Surface (auto/neutral), not item role', () => {
    render(
      <Surface mode="subtle" appearance="secondary">
        <SegmentedControl aria-label="Range" value="day" onValueChange={() => {}} attention="low">
          <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        </SegmentedControl>
      </Surface>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-appearance', 'secondary');
    expect(group).toHaveAttribute('data-selected-appearance', 'secondary');
    expect(group).toHaveAttribute('data-track-appearance', 'secondary');
  });

  it('type=icon defaults to hug-content width (equalWidth false)', () => {
    render(
      <SegmentedControl aria-label="Range" value="day" onValueChange={() => {}} type="icon">
        <SegmentedControl.Item value="day" start={<span />} aria-label="Day" />
        <SegmentedControl.Item value="week" start={<span />} aria-label="Week" />
      </SegmentedControl>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-type', 'icon');
    expect(group).not.toHaveAttribute('data-equal-width');
  });

  it('type=icon hides visible labels and applies icon-only layout', () => {
    render(
      <SegmentedControl aria-label="Range" value="day" onValueChange={() => {}} type="icon">
        <SegmentedControl.Item value="day" start={<span data-testid="day-icon" />} aria-label="Day" />
        <SegmentedControl.Item value="week" start={<span data-testid="week-icon" />} aria-label="Week" />
      </SegmentedControl>,
    );
    expect(screen.queryByText('Day')).not.toBeInTheDocument();
    expect(screen.getByTestId('day-icon')).toBeInTheDocument();
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-type', 'icon');
  });

  it('publishes bold surface context to end slot when selected segment uses high attention', () => {
    render(
      <SegmentedControl aria-label="Range" value="saved" onValueChange={() => {}} attention="high">
        <SegmentedControl.Item value="liked">Liked</SegmentedControl.Item>
        <SegmentedControl.Item value="saved" end={<span data-testid="end-slot" />}>
          Saved
        </SegmentedControl.Item>
      </SegmentedControl>,
    );
    const endSlot = screen.getByTestId('end-slot').parentElement;
    expect(endSlot).toHaveAttribute('data-surface', 'bold');
    expect(endSlot).toHaveAttribute('data-surface-step');
    expect(endSlot).toHaveAttribute('data-appearance', 'primary');
  });

  it('inherits slot parent appearance for shield decision when CounterBadge has no explicit appearance', () => {
    render(
      <Surface mode="bold" appearance="brand-bg">
        <SegmentedControl aria-label="Range" value="two" onValueChange={() => {}} attention="high">
          <SegmentedControl.Item value="one">One</SegmentedControl.Item>
          <SegmentedControl.Item value="two" end={<CounterBadge value={5} aria-label="5" />}>
            Two
          </SegmentedControl.Item>
        </SegmentedControl>
      </Surface>,
    );
    const badge = screen.getByLabelText('5');
    expect(badge.parentElement).not.toHaveAttribute('data-context-boundary');
  });

  it('omits context-boundary for same-role CounterBadge on selected segment', () => {
    render(
      <SegmentedControl aria-label="Range" value="two" onValueChange={() => {}} attention="high">
        <SegmentedControl.Item value="one">One</SegmentedControl.Item>
        <SegmentedControl.Item value="two" end={<CounterBadge value={5} aria-label="5" />}>
          Two
        </SegmentedControl.Item>
      </SegmentedControl>,
    );
    const badge = screen.getByLabelText('5');
    expect(badge.parentElement).not.toHaveAttribute('data-context-boundary');
  });

  it('shields cross-role CounterBadge with context-boundary on selected segment', () => {
    render(
      <SegmentedControl aria-label="Range" value="two" onValueChange={() => {}} attention="high">
        <SegmentedControl.Item value="one">One</SegmentedControl.Item>
        <SegmentedControl.Item
          value="two"
          end={<CounterBadge value={5} appearance="negative" aria-label="5 alerts" />}
        >
          Two
        </SegmentedControl.Item>
      </SegmentedControl>,
    );
    const badge = screen.getByLabelText('5 alerts');
    expect(badge.parentElement).toHaveAttribute('data-context-boundary');
  });

  it('passes axe a11y check', async () => {
    const { container } = renderCompound();
    await expectNoA11yViolations(container);
  });
});
