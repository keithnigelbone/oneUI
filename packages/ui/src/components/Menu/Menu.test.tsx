/**
 * Menu.test.tsx
 *
 * Smoke + interaction + a11y coverage for the Menu primitive.
 *
 * - Trigger renders with the correct ARIA wiring (aria-haspopup, aria-expanded).
 * - Controlling `open` renders the menu popup + menuitems with proper roles.
 * - `onClick` fires when a menu item is activated via keyboard.
 * - Disabled items are surfaced via `aria-disabled`.
 * - Open menu passes WCAG 2.1 AA (axe, with Base UI focus-guards excluded
 *   by the shared helper).
 *
 * Note on interaction pattern:
 *   Base UI's Menu opens on pointer-down events. jsdom doesn't simulate
 *   pointer events through `userEvent.click` the way a real browser does,
 *   so we use the `open` prop (controlled mode) to put the menu in the
 *   open state and then verify everything that depends on it.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu } from './Menu';
import { expectNoA11yViolations } from '../../test-utils/a11y';

function renderMenu({
  open,
  itemProps = {},
}: {
  open?: boolean;
  itemProps?: { disabled?: boolean; onClick?: () => void };
} = {}) {
  return render(
    <Menu open={open}>
      <Menu.Trigger>Open menu</Menu.Trigger>
      <Menu.Portal>
        <Menu.Group label="Actions">
          <Menu.Item onClick={itemProps.onClick} disabled={itemProps.disabled}>Edit</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Item>Delete</Menu.Item>
      </Menu.Portal>
    </Menu>,
  );
}

describe('Menu', () => {
  it('renders the trigger with the correct popup wiring', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not render menu items while closed', () => {
    renderMenu();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('controlled open renders the menu and its items', () => {
    renderMenu({ open: true });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('controlled open reflects in the trigger aria-expanded', () => {
    renderMenu({ open: true });
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('fires onClick when a menu item is activated', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderMenu({ open: true, itemProps: { onClick: handle } });

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('marks disabled items with aria-disabled', () => {
    renderMenu({ open: true, itemProps: { disabled: true } });
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('passes axe a11y check when open', async () => {
    const { baseElement } = renderMenu({ open: true });
    await expectNoA11yViolations(baseElement);
  });
});
