/**
 * ToggleGroup.test.tsx
 *
 * Smoke + interaction + a11y coverage for ToggleGroup and its `.Item` slot.
 * Scope (what we lock in, not full visual matrix):
 *
 * - `.Item`s render as pressable buttons with `aria-pressed`.
 * - Single selection (default) emits a fresh array to `onValueChange`.
 * - `toggleMultiple` allows simultaneous selections.
 * - Group-level `disabled` suppresses callbacks.
 * - Default rendering passes WCAG 2.1 AA (axe).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleGroup } from './ToggleGroup';
import { expectNoA11yViolations } from '../../test-utils/a11y';

function renderGroup(props: Partial<React.ComponentProps<typeof ToggleGroup>> = {}) {
  return render(
    <ToggleGroup {...props}>
      <ToggleGroup.Item value="left" aria-label="Align left">L</ToggleGroup.Item>
      <ToggleGroup.Item value="center" aria-label="Align center">C</ToggleGroup.Item>
      <ToggleGroup.Item value="right" aria-label="Align right">R</ToggleGroup.Item>
    </ToggleGroup>,
  );
}

describe('ToggleGroup', () => {
  it('renders each item as a toggle button', () => {
    renderGroup();
    expect(screen.getByRole('button', { name: 'Align left' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Align center' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Align right' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets the default value as pressed', () => {
    renderGroup({ defaultValue: 'center' });
    expect(screen.getByRole('button', { name: 'Align center' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('single-select: toggling a second item replaces the first', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderGroup({ defaultValue: 'left', onValueChange: handle });

    await user.click(screen.getByRole('button', { name: 'Align right' }));
    expect(handle).toHaveBeenCalled();
    const latest = handle.mock.calls[handle.mock.calls.length - 1][0];
    expect(latest).toEqual(['right']);
  });

  it('multi-select: clicking several items accumulates selections', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderGroup({ toggleMultiple: true, onValueChange: handle });

    await user.click(screen.getByRole('button', { name: 'Align left' }));
    await user.click(screen.getByRole('button', { name: 'Align right' }));

    const latest = handle.mock.calls[handle.mock.calls.length - 1][0];
    expect(latest).toEqual(expect.arrayContaining(['left', 'right']));
  });

  it('disabled group blocks interaction', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    renderGroup({ disabled: true, onValueChange: handle });

    await user.click(screen.getByRole('button', { name: 'Align left' })).catch(() => {});
    expect(handle).not.toHaveBeenCalled();
  });

  it('passes axe a11y check', async () => {
    const { container } = renderGroup({ defaultValue: 'left' });
    await expectNoA11yViolations(container);
  });
});
