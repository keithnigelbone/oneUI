/**
 * LinearProgressIndicator.test.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LinearProgressIndicator } from './LinearProgressIndicator';
import {
  clampProgressValue,
} from './LinearProgressIndicator.shared';
import { expectNoA11yViolations } from '../../test-utils/a11y';

describe('LinearProgressIndicator', () => {
  it('renders component', () => {
    render(<LinearProgressIndicator aria-label="Upload" />);
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toBeInTheDocument();
  });

  it('renders determinate progress with aria-valuenow', () => {
    render(<LinearProgressIndicator type="determinate" value={75} aria-label="Progress" />);
    const bar = screen.getByRole('progressbar', { name: 'Progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders indeterminate progress without aria-valuenow', () => {
    render(<LinearProgressIndicator type="indeterminate" aria-label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('clamps value below 0', () => {
    expect(clampProgressValue(-10)).toBe(0);
    render(<LinearProgressIndicator value={-10} aria-label="Clamp low" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value above 100', () => {
    expect(clampProgressValue(150)).toBe(100);
    render(<LinearProgressIndicator value={150} aria-label="Clamp high" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('ignores value in indeterminate mode', () => {
    render(<LinearProgressIndicator type="indeterminate" value={80} aria-label="Busy" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it.each(['S', 'M', 'L'] as const)('supports size %s', (size) => {
    const { container } = render(
      <LinearProgressIndicator size={size} aria-label={`Size ${size}`} />,
    );
    expect(container.querySelector(`[data-size="${size}"]`)).toBeTruthy();
  });

  it('supports roundCaps true', () => {
    const { container } = render(
      <LinearProgressIndicator roundCaps aria-label="Round" />,
    );
    expect(container.querySelector('[data-round-caps="true"]')).toBeTruthy();
  });

  it('supports roundCaps false', () => {
    const { container } = render(
      <LinearProgressIndicator roundCaps={false} aria-label="Flat" />,
    );
    expect(container.querySelector('[data-round-caps="false"]')).toBeTruthy();
  });

  it.each([
    'auto',
    'neutral',
    'primary',
    'secondary',
    'sparkle',
    'negative',
    'positive',
    'warning',
    'informative',
  ] as const)('supports appearance %s', (appearance) => {
    const { container } = render(
      <LinearProgressIndicator appearance={appearance} aria-label={appearance} />,
    );
    const expected = appearance === 'auto' ? 'primary' : appearance;
    expect(container.querySelector(`[data-appearance="${expected}"]`)).toBeTruthy();
  });

  it('forwards className to root', () => {
    render(<LinearProgressIndicator className="custom-root" aria-label="Class" />);
    expect(screen.getByRole('progressbar').className).toMatch(/custom-root/);
  });

  it('updates progress value correctly', () => {
    const { rerender } = render(
      <LinearProgressIndicator value={25} aria-label="Updating" />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    rerender(<LinearProgressIndicator value={90} aria-label="Updating" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '90');
  });

  it('supports aria-label', () => {
    render(<LinearProgressIndicator aria-label="File upload" />);
    expect(screen.getByRole('progressbar', { name: 'File upload' })).toBeInTheDocument();
  });

  it('supports aria-labelledby', () => {
    render(
      <>
        <span id="lpi-label">Upload status</span>
        <LinearProgressIndicator aria-labelledby="lpi-label" />
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Upload status' })).toBeInTheDocument();
  });

  it('passes axe for determinate', async () => {
    const { container } = render(
      <LinearProgressIndicator value={50} aria-label="Upload" />,
    );
    await expectNoA11yViolations(container);
  });

  it('passes axe for indeterminate', async () => {
    const { container } = render(
      <LinearProgressIndicator type="indeterminate" aria-label="Loading" />,
    );
    await expectNoA11yViolations(container);
  });

  it('forwards data-testid', () => {
    render(<LinearProgressIndicator data-testid="lpi-root" aria-label="Test" />);
    expect(screen.getByTestId('lpi-root')).toBeInTheDocument();
  });

  it('sets Base UI data-indeterminate on the indicator in indeterminate mode', () => {
    const { container } = render(
      <LinearProgressIndicator type="indeterminate" aria-label="Loading" />,
    );
    const indicator = container.querySelector('[class*="indicator"]');
    expect(indicator).toHaveAttribute('data-indeterminate');
    expect(indicator?.className).toMatch(/indicatorIndeterminate/);
    expect(container.querySelector('[data-type="indeterminate"]')).toBeTruthy();
  });

  it('does not set data-indeterminate on the indicator in determinate mode', () => {
    const { container } = render(
      <LinearProgressIndicator type="determinate" value={50} aria-label="Progress" />,
    );
    const indicator = container.querySelector('[class*="indicator"]');
    expect(indicator).not.toHaveAttribute('data-indeterminate');
    expect(indicator?.className).not.toMatch(/indicatorIndeterminate/);
  });

  it('applies inline width from value in determinate mode', () => {
    const { container } = render(
      <LinearProgressIndicator type="determinate" value={75} aria-label="Progress" />,
    );
    const indicator = container.querySelector('[class*="indicator"]');
    expect(indicator).toHaveAttribute('style', expect.stringContaining('width: 75%'));
  });

  it('uses Base UI indicator without inline width when indeterminate', () => {
    const { container } = render(
      <LinearProgressIndicator type="indeterminate" value={80} aria-label="Loading" />,
    );
    const indicator = container.querySelector('[class*="indicatorIndeterminate"]');
    expect(indicator).toBeTruthy();
    expect(indicator).toHaveAttribute('data-indeterminate');
    expect(indicator).not.toHaveAttribute('style', expect.stringContaining('width:'));
  });

  it('switches between determinate and indeterminate types', () => {
    const { container, rerender } = render(
      <LinearProgressIndicator type="determinate" value={40} aria-label="Switch" />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
    expect(container.querySelector('[class*="indicator"]')).not.toHaveAttribute('data-indeterminate');

    rerender(<LinearProgressIndicator type="indeterminate" value={40} aria-label="Switch" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    expect(container.querySelector('[class*="indicator"]')).toHaveAttribute('data-indeterminate');
    expect(container.querySelector('[class*="indicator"]')).not.toHaveAttribute(
      'style',
      expect.stringContaining('width: 40%'),
    );

    rerender(<LinearProgressIndicator type="determinate" value={90} aria-label="Switch" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '90');
    expect(container.querySelector('[class*="indicator"]')).toHaveAttribute(
      'style',
      expect.stringContaining('width: 90%'),
    );
  });
});
