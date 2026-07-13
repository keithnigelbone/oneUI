/**
 * Tooltip.test.tsx
 * Unit and accessibility tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';
import { Tooltip } from './Tooltip';
import { TOOLTIP_META } from './Tooltip.meta';
import {
  parsePosition,
  resolveTooltipSideAndAlign,
  TOOLTIP_DEFAULT_POSITION,
} from './Tooltip.shared';

describe('Tooltip', () => {
  it('renders trigger element', () => {
    render(
      <Tooltip content="Hello">
        <button>Trigger</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
  });

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(tooltip).toHaveTextContent('Tooltip text');
  });

  it('hides tooltip on unhover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    await screen.findByRole('tooltip', {}, { timeout: 2000 });
    await user.unhover(screen.getByRole('button'));

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('shows tooltip when defaultOpen is true', async () => {
    render(
      <Tooltip content="Visible" defaultOpen>
        <button>Trigger</button>
      </Tooltip>,
    );
    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(tooltip).toHaveTextContent('Visible');
  });

  it('does not show tooltip when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hidden" disabled>
        <button>Trigger</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));

    // Wait a bit and confirm tooltip doesn't appear
    await new Promise((r) => setTimeout(r, 800));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when tooltip opens', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tooltip content="Test" onOpenChange={handleChange}>
        <button>Trigger</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('renders without arrow when arrow=false', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="No arrow" arrow={false}>
        <button>Trigger</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    // Arrow SVG should not be present inside the tooltip popup
    expect(tooltip.querySelector('svg')).toBeNull();
  });

  it('renders with arrow when arrow=true', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="With arrow" arrow>
        <button>Trigger</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(tooltip.querySelector('svg')).not.toBeNull();
  });

  it('click trigger toggles tooltip', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Click tooltip" trigger="click">
        <button>Click me</button>
      </Tooltip>,
    );

    // Click to open
    await user.click(screen.getByRole('button'));
    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(tooltip).toHaveTextContent('Click tooltip');

    // Click again to close
    await user.click(screen.getByRole('button'));
    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('click trigger closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Tooltip content="Click tooltip" trigger="click">
          <button>Click me</button>
        </Tooltip>
        <div data-testid="outside" style={{ width: 200, height: 200 }}>
          Outside
        </div>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Click me' }));
    await screen.findByRole('tooltip', {}, { timeout: 2000 });

    // Click empty page area (body) — matches QA playground / Playwright behavior.
    await user.click(document.body);

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('click trigger calls onOpenChange(false) on outside click', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <div>
        <Tooltip content="Click tooltip" trigger="click" onOpenChange={handleChange}>
          <button>Click me</button>
        </Tooltip>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Click me' }));
    await screen.findByRole('tooltip', {}, { timeout: 2000 });
    handleChange.mockClear();

    await user.click(document.body);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  it('click trigger with Button child closes on outside click (QA playground parity)', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Tooltip content="Click tooltip" trigger="click">
          <Button attention="medium">Click toggle</Button>
        </Tooltip>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Click toggle' }));
    await screen.findByRole('tooltip', {}, { timeout: 2000 });

    await user.click(document.body);

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('click trigger with Button child toggles closed on second click', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Click tooltip" trigger="click">
        <Button attention="medium">Click toggle</Button>
      </Tooltip>,
    );

    await user.click(screen.getByRole('button', { name: 'Click toggle' }));
    await screen.findByRole('tooltip', {}, { timeout: 2000 });

    await user.click(screen.getByRole('button', { name: 'Click toggle' }));

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('click trigger closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Click tooltip" trigger="click">
        <button>Click me</button>
      </Tooltip>,
    );

    await user.click(screen.getByRole('button'));
    await screen.findByRole('tooltip', {}, { timeout: 2000 });

    await user.keyboard('{Escape}');

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('controlled mode responds to open prop', async () => {
    const { rerender } = render(
      <Tooltip content="Controlled" open={false} trigger="manual">
        <button>Trigger</button>
      </Tooltip>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <Tooltip content="Controlled" open={true} trigger="manual">
        <button>Trigger</button>
      </Tooltip>,
    );

    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(tooltip).toHaveTextContent('Controlled');
  });

  it('manual trigger closes on Escape when uncontrolled', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Manual tooltip" defaultOpen trigger="manual">
        <button>Trigger</button>
      </Tooltip>,
    );

    await screen.findByRole('tooltip', {}, { timeout: 2000 });
    await user.keyboard('{Escape}');

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('manual trigger calls onOpenChange(false) on Escape', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tooltip
        content="Controlled manual"
        open
        onOpenChange={handleChange}
        trigger="manual"
      >
        <button>Trigger</button>
      </Tooltip>,
    );

    await screen.findByRole('tooltip', {}, { timeout: 2000 });
    await user.keyboard('{Escape}');

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('has role="tooltip" on popup for WCAG compliance', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Accessible">
        <button>Trigger</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(tooltip).toBeInTheDocument();
  });

  it('documents hoverable default as true in component metadata', () => {
    const hoverableProp = TOOLTIP_META.props.find((p) => p.name === 'hoverable');
    expect(hoverableProp?.defaultValue).toBe(true);
  });

  it('documents position default as bottom in component metadata', () => {
    const positionProp = TOOLTIP_META.props.find((p) => p.name === 'position');
    expect(positionProp?.defaultValue).toBe('bottom');
  });
});

describe('resolveTooltipSideAndAlign', () => {
  it('defaults to Figma bottom (Base UI side top, align center)', () => {
    expect(TOOLTIP_DEFAULT_POSITION).toBe('bottom');
    expect(resolveTooltipSideAndAlign({})).toEqual({ side: 'top', align: 'center' });
  });

  it('prefers explicit side/align over Figma position alias', () => {
    expect(
      resolveTooltipSideAndAlign({
        position: 'bottom',
        side: 'left',
        align: 'end',
      }),
    ).toEqual({ side: 'left', align: 'end' });
  });
});

describe('parsePosition', () => {
  // Figma 'position' names where the TIP sits on the popup; Base UI 'side' names
  // where the POPUP sits relative to the trigger. They invert on each axis.
  // See parsePosition jsdoc for the full mapping table.

  it('maps top (tip on top of popup) to side=bottom (popup below trigger)', () => {
    expect(parsePosition('top')).toEqual({ side: 'bottom', align: 'center' });
  });

  it('maps topStart to side=bottom, align=start', () => {
    expect(parsePosition('topStart')).toEqual({ side: 'bottom', align: 'start' });
  });

  it('maps topEnd to side=bottom, align=end', () => {
    expect(parsePosition('topEnd')).toEqual({ side: 'bottom', align: 'end' });
  });

  it('maps bottom (tip on bottom of popup) to side=top (popup above trigger)', () => {
    expect(parsePosition('bottom')).toEqual({
      side: 'top',
      align: 'center',
    });
  });

  it('maps bottomStart to side=top, align=start', () => {
    expect(parsePosition('bottomStart')).toEqual({
      side: 'top',
      align: 'start',
    });
  });

  it('maps bottomEnd to side=top, align=end', () => {
    expect(parsePosition('bottomEnd')).toEqual({
      side: 'top',
      align: 'end',
    });
  });

  it('maps left (tip on left of popup) to side=right (popup right of trigger)', () => {
    expect(parsePosition('left')).toEqual({ side: 'right', align: 'center' });
  });

  it('maps leftStart to side=right, align=start', () => {
    expect(parsePosition('leftStart')).toEqual({
      side: 'right',
      align: 'start',
    });
  });

  it('maps leftEnd to side=right, align=end', () => {
    expect(parsePosition('leftEnd')).toEqual({ side: 'right', align: 'end' });
  });

  it('maps right (tip on right of popup) to side=left (popup left of trigger)', () => {
    expect(parsePosition('right')).toEqual({ side: 'left', align: 'center' });
  });

  it('maps rightStart to side=left, align=start', () => {
    expect(parsePosition('rightStart')).toEqual({
      side: 'left',
      align: 'start',
    });
  });

  it('maps rightEnd to side=left, align=end', () => {
    expect(parsePosition('rightEnd')).toEqual({
      side: 'left',
      align: 'end',
    });
  });
});
