/**
 * Accordion.test.tsx
 *
 * Smoke + interaction + a11y coverage for the Accordion primitive.
 * We rely on Base UI's panel animation plumbing, so the wrapper contract is:
 *
 * - Triggers render as expandable buttons (`aria-expanded`).
 * - Clicking a trigger toggles its panel.
 * - Single-open mode replaces the previous panel when another is clicked.
 * - `openMultiple` lets panels stay open simultaneously.
 * - `disabled` at root level blocks all triggers.
 * - Default rendering passes WCAG 2.1 AA (axe).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';
import { expectNoA11yViolations } from '../../test-utils/a11y';

function renderAccordion(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
  return render(
    <Accordion {...props}>
      <Accordion.Item value="first">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Panel>First content</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="second">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Panel>Second content</Accordion.Panel>
      </Accordion.Item>
    </Accordion>,
  );
}

describe('Accordion', () => {
  it('renders triggers as collapsed buttons by default', () => {
    renderAccordion();
    const first = screen.getByRole('button', { name: /First/ });
    const second = screen.getByRole('button', { name: /Second/ });
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands the clicked panel', async () => {
    const user = userEvent.setup();
    renderAccordion();

    await user.click(screen.getByRole('button', { name: /First/ }));
    expect(screen.getByRole('button', { name: /First/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('single-open: opening a second panel collapses the first', async () => {
    const user = userEvent.setup();
    renderAccordion({ defaultValue: ['first'] });

    expect(screen.getByRole('button', { name: /First/ })).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: /Second/ }));
    expect(screen.getByRole('button', { name: /Second/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /First/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('openMultiple allows both panels to remain expanded', async () => {
    const user = userEvent.setup();
    renderAccordion({ openMultiple: true });

    await user.click(screen.getByRole('button', { name: /First/ }));
    await user.click(screen.getByRole('button', { name: /Second/ }));

    expect(screen.getByRole('button', { name: /First/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Second/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('root disabled prevents triggers from expanding', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderAccordion({ disabled: true, onValueChange: handle });

    await user.click(screen.getByRole('button', { name: /First/ })).catch(() => {});
    expect(handle).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /First/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('fires onValueChange with the new open set', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderAccordion({ onValueChange: handle });

    await user.click(screen.getByRole('button', { name: /First/ }));
    expect(handle).toHaveBeenCalled();
    const latest = handle.mock.calls[handle.mock.calls.length - 1][0];
    expect(latest).toEqual(expect.arrayContaining(['first']));
  });

  it('passes axe a11y check (collapsed)', async () => {
    const { container } = renderAccordion();
    await expectNoA11yViolations(container);
  });

  it('passes axe a11y check (one panel expanded)', async () => {
    const { container } = renderAccordion({ defaultValue: ['first'] });
    await expectNoA11yViolations(container);
  });
});
