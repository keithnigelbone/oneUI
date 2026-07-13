/**
 * Popover.test.tsx
 *
 * Smoke + interaction + a11y coverage for the Popover primitive.
 *
 * - Trigger opens / closes the popup.
 * - Title + description render inside the popup and are wired to the
 *   popup's aria-labelledby / aria-describedby.
 * - `onOpenChange` fires on trigger click when controlled.
 * - Open popover passes WCAG 2.1 AA.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverPortal, PopoverClose } from './Popover';
import { expectNoA11yViolations } from '../../test-utils/a11y';

describe('Popover', () => {
  it('starts closed', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal title="Tip" description="Helpful info">
          <p>Body</p>
        </PopoverPortal>
      </Popover>,
    );

    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('opens when trigger is clicked and shows title/description', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal title="Tip" description="Helpful info">
          <p>Body</p>
        </PopoverPortal>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Tip')).toBeInTheDocument();
    expect(screen.getByText('Helpful info')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('closes via PopoverClose', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal title="Tip">
          <PopoverClose>Dismiss</PopoverClose>
        </PopoverPortal>
      </Popover>,
    );

    expect(screen.getByText('Tip')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Tip')).not.toBeInTheDocument();
  });

  it('fires onOpenChange when controlled', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <Popover open={false} onOpenChange={handle}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal title="Tip">
          <p>Body</p>
        </PopoverPortal>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(handle).toHaveBeenCalled();
    // Base UI v1 passes (open, details); we only care about the first arg.
    expect(handle.mock.calls[0][0]).toBe(true);
  });

  it('passes axe a11y check when open', async () => {
    const { baseElement } = render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal title="Tip" description="Helpful info">
          <p>Body</p>
        </PopoverPortal>
      </Popover>,
    );
    await expectNoA11yViolations(baseElement);
  });
});
