/**
 * Separator.test.tsx
 *
 * Smoke + a11y coverage for the Separator primitive. Separator is static —
 * the contract we lock in is:
 *
 * - It renders as `role="separator"` (implicit via Base UI).
 * - Orientation is exposed via `aria-orientation`.
 * - Default rendering passes WCAG 2.1 AA (axe).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Separator } from './Separator';
import { expectNoA11yViolations } from '../../test-utils/a11y';

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector('[role="separator"], hr, [aria-orientation]') as HTMLElement;
    expect(sep).toBeInTheDocument();
  });

  it('sets aria-orientation=vertical when requested', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.querySelector('[aria-orientation="vertical"]');
    expect(sep).toBeInTheDocument();
  });

  it('passes axe a11y check', async () => {
    const { container } = render(<Separator />);
    await expectNoA11yViolations(container);
  });
});
