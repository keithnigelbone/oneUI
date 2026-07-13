/**
 * Progress.test.tsx
 *
 * Smoke + a11y coverage for the Progress primitive.
 *
 * - role="progressbar" rendered by Base UI.
 * - aria-valuenow / aria-valuemin / aria-valuemax wired from props.
 * - Indeterminate state (null value) omits aria-valuenow.
 * - aria-label passes through for the required accessible name.
 * - Passes WCAG 2.1 AA (axe).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';
import { expectNoA11yViolations } from '../../test-utils/a11y';

describe('Progress', () => {
  it('renders a progressbar with aria-valuenow', () => {
    render(<Progress value={50} aria-label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('respects custom min/max', () => {
    render(<Progress value={5} min={0} max={10} aria-label="Steps" />);
    const bar = screen.getByRole('progressbar', { name: 'Steps' });
    expect(bar).toHaveAttribute('aria-valuenow', '5');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
  });

  it('omits aria-valuenow when indeterminate (no value)', () => {
    render(<Progress aria-label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('passes axe a11y check', async () => {
    const { container } = render(<Progress value={25} aria-label="Upload" />);
    await expectNoA11yViolations(container);
  });

  it('passes axe a11y check (indeterminate)', async () => {
    const { container } = render(<Progress aria-label="Loading" />);
    await expectNoA11yViolations(container);
  });
});
