/**
 * Toggle.test.tsx
 *
 * Smoke + interaction + a11y coverage for the standalone Toggle button.
 * Pairs with Storybook for the visual matrix; here we lock the contract:
 *
 * - Renders as `role="button"` with `aria-pressed` reflecting state.
 * - `onPressedChange` fires on click and is suppressed when `disabled`.
 * - The size prop reaches the className so CSS can react.
 * - Default rendering passes WCAG 2.1 AA (axe).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';
import { expectNoA11yViolations } from '../../test-utils/a11y';

describe('Toggle', () => {
  it('renders children inside a button with aria-pressed=false by default', () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles aria-pressed on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bold">B</Toggle>);
    const button = screen.getByRole('button', { name: 'Bold' });

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('fires onPressedChange with the new value', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <Toggle aria-label="Bold" onPressedChange={handle}>
        B
      </Toggle>,
    );
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(handle).toHaveBeenCalled();
    // Base UI v1 passes (pressed, details); we only care about the first arg.
    expect(handle.mock.calls[0][0]).toBe(true);
  });

  it('respects controlled pressed prop', () => {
    const { rerender } = render(
      <Toggle aria-label="Bold" pressed={false}>
        B
      </Toggle>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <Toggle aria-label="Bold" pressed>
        B
      </Toggle>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('disabled prevents callbacks', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <Toggle aria-label="Bold" disabled onPressedChange={handle}>
        B
      </Toggle>,
    );
    await user.click(screen.getByRole('button')).catch(() => {});
    expect(handle).not.toHaveBeenCalled();
  });

  it('applies the size class so styles can react', () => {
    const { container } = render(
      <Toggle aria-label="Bold" size="large">
        B
      </Toggle>,
    );
    // CSS modules hash class names; we just assert SOMETHING with "large"
    // is present so the size prop made it through the class composition.
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/large/i);
  });

  it('passes axe a11y check', async () => {
    const { container } = render(<Toggle aria-label="Bold">B</Toggle>);
    await expectNoA11yViolations(container);
  });
});
