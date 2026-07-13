/**
 * CircularProgressIndicator.test.tsx
 * Smoke + accessibility coverage for the CircularProgressIndicator primitive.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CircularProgressIndicator } from './CircularProgressIndicator';
import { Icon } from '../Icon/Icon';
import { CPI_SIZE_TO_ICON_SIZE } from './CircularProgressIndicator.shared';

describe('CircularProgressIndicator', () => {
  it('renders with progressbar role and current aria-valuenow', () => {
    render(<CircularProgressIndicator value={42} aria-label="Upload progress" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });

  it('exposes the standard 0–100 progress range via aria-valuemin / aria-valuemax', () => {
    render(<CircularProgressIndicator value={73} aria-label="Range" />);
    const bar = screen.getByRole('progressbar', { name: 'Range' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '73');
  });

  it('omits aria-valuenow in indeterminate variant', () => {
    render(<CircularProgressIndicator variant="indeterminate" aria-label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('renders custom icon content slot', () => {
    render(
      <CircularProgressIndicator value={10} content="icon" aria-label="With icon">
        <span data-testid="custom-icon">★</span>
      </CircularProgressIndicator>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('maps CPI size to Icon size when content is icon and size is omitted on Icon', () => {
    const { container } = render(
      <CircularProgressIndicator value={10} size="3XL" content="icon" aria-label="Mapped icon">
        <Icon icon="check" aria-hidden />
      </CircularProgressIndicator>,
    );
    const iconRoot = container.querySelector('[data-emphasis]');
    expect(iconRoot).toHaveAttribute('data-size', CPI_SIZE_TO_ICON_SIZE['3XL']);
  });

  it('does not render percentage text below size L (Figma)', () => {
    render(
      <CircularProgressIndicator value={25} size="M" content="text" aria-label="No label" />,
    );
    expect(screen.queryByText('25')).not.toBeInTheDocument();
  });

  it('renders percentage text at size L and above', () => {
    render(
      <CircularProgressIndicator value={25} size="L" content="text" aria-label="With label" />,
    );
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('does not override explicit Icon size in the centre slot', () => {
    const { container } = render(
      <CircularProgressIndicator value={10} size="3XL" content="icon" aria-label="Explicit icon size">
        <Icon icon="check" size="4" aria-hidden />
      </CircularProgressIndicator>,
    );
    const iconRoot = container.querySelector('[data-emphasis]');
    expect(iconRoot).toHaveAttribute('data-size', '4');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CircularProgressIndicator ref={ref} value={50} aria-label="Reffed" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
