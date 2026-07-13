/**
 * Collapsible.test.tsx
 *
 * Smoke + interaction + a11y coverage for the Collapsible primitive.
 *
 * - Trigger renders as a button with correct aria-expanded state.
 * - Clicking the trigger toggles expansion.
 * - Controlled `open` and `onOpenChange` reflect state.
 * - Root `disabled` prevents toggling.
 * - Collapsed + expanded states both pass WCAG 2.1 AA.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible } from './Collapsible';
import { expectNoA11yViolations } from '../../test-utils/a11y';

function renderCollapsible(props: Partial<React.ComponentProps<typeof Collapsible>> = {}) {
  return render(
    <Collapsible {...props}>
      <Collapsible.Trigger>Details</Collapsible.Trigger>
      <Collapsible.Panel>Extra information</Collapsible.Panel>
    </Collapsible>,
  );
}

describe('Collapsible', () => {
  it('starts collapsed', () => {
    renderCollapsible();
    expect(screen.getByRole('button', { name: /Details/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands on trigger click', async () => {
    const user = userEvent.setup();
    renderCollapsible();

    await user.click(screen.getByRole('button', { name: /Details/ }));
    expect(screen.getByRole('button', { name: /Details/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('fires onOpenChange with new open value', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderCollapsible({ onOpenChange: handle });

    await user.click(screen.getByRole('button', { name: /Details/ }));
    expect(handle).toHaveBeenCalled();
    expect(handle.mock.calls[0][0]).toBe(true);
  });

  it('respects controlled open', () => {
    const { rerender } = renderCollapsible({ open: false, onOpenChange: () => {} });
    expect(screen.getByRole('button', { name: /Details/ })).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <Collapsible open onOpenChange={() => {}}>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel>Extra information</Collapsible.Panel>
      </Collapsible>,
    );
    expect(screen.getByRole('button', { name: /Details/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('disabled root blocks interaction', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderCollapsible({ disabled: true, onOpenChange: handle });

    await user.click(screen.getByRole('button', { name: /Details/ })).catch(() => {});
    expect(handle).not.toHaveBeenCalled();
  });

  it('passes axe a11y check (collapsed)', async () => {
    const { container } = renderCollapsible();
    await expectNoA11yViolations(container);
  });

  it('passes axe a11y check (expanded)', async () => {
    const { container } = renderCollapsible({ defaultOpen: true });
    await expectNoA11yViolations(container);
  });
});
