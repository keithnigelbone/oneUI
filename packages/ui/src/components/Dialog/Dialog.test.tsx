/**
 * Dialog.test.tsx
 *
 * Smoke + interaction + a11y coverage for Dialog and AlertDialog.
 *
 * The actual focus-trap, scroll-lock and animation behaviour come from Base
 * UI itself — we only exercise the wrapper contract:
 *
 * - DialogTrigger opens the portalled popup.
 * - Title + description render inside the popup when provided.
 * - DialogClose closes the popup.
 * - AlertDialog mirrors the same trigger/close flow.
 * - Open dialog passes axe a11y (role, aria-labelledby, aria-describedby).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogTrigger, DialogPortal, DialogClose, AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogClose } from './Dialog';
import { expectNoA11yViolations } from '../../test-utils/a11y';

describe('Dialog', () => {
  it('is closed by default — no dialog in the DOM', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal title="Settings" description="Update your preferences">
          <p>Body content</p>
        </DialogPortal>
      </Dialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens when the trigger is clicked and renders title + description', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal title="Settings" description="Update your preferences">
          <p>Body content</p>
        </DialogPortal>
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Update your preferences')).toBeInTheDocument();
  });

  it('closes when DialogClose is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal title="Settings">
          <DialogClose>Dismiss</DialogClose>
        </DialogPortal>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('controlled open/onOpenChange reflects state', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <Dialog open={false} onOpenChange={handle}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal title="Settings">
          <p>Body</p>
        </DialogPortal>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(handle).toHaveBeenCalledWith(true);
  });

  it('passes axe a11y check when open', async () => {
    const { baseElement } = render(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal title="Settings" description="Update your preferences">
          <p>Body content</p>
        </DialogPortal>
      </Dialog>,
    );
    // Portals render outside the test's container, so use baseElement.
    await expectNoA11yViolations(baseElement);
  });
});

describe('AlertDialog', () => {
  it('opens via its trigger and closes via AlertDialogClose', async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogPortal title="Delete item?" description="This action cannot be undone.">
          <AlertDialogClose>Cancel</AlertDialogClose>
        </AlertDialogPortal>
      </AlertDialog>,
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete item?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('passes axe a11y check when open', async () => {
    const { baseElement } = render(
      <AlertDialog defaultOpen>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogPortal title="Delete item?" description="This action cannot be undone.">
          <AlertDialogClose>Cancel</AlertDialogClose>
        </AlertDialogPortal>
      </AlertDialog>,
    );
    await expectNoA11yViolations(baseElement);
  });
});
