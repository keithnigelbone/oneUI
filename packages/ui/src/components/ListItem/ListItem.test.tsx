/**
 * ListItem.test.tsx
 * Unit + a11y tests for the ListItem component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ListItem } from './ListItem';

const StartIcon = () => <svg data-testid="start-icon" viewBox="0 0 24 24" />;
const EndIcon = () => <svg data-testid="end-icon" viewBox="0 0 24 24" />;

describe('ListItem', () => {
  it('renders the title', () => {
    render(<ListItem title="Favourites" />);
    expect(screen.getByText('Favourites')).toBeInTheDocument();
  });

  it('renders as <a> when href is provided', () => {
    render(<ListItem title="Go" href="/destination" />);
    const link = screen.getByRole('link', { name: /go/i });
    expect(link).toHaveAttribute('href', '/destination');
  });

  it('renders as <button> when only onClick is provided', () => {
    render(<ListItem title="Press" onClick={() => undefined} />);
    expect(screen.getByRole('button', { name: /press/i })).toBeInTheDocument();
  });

  it('renders as a non-interactive <div> when no href or onClick is set', () => {
    render(<ListItem title="Static" data-testid="row" />);
    const row = screen.getByText('Static').closest('[data-interactive="false"]');
    expect(row).not.toBeNull();
    expect(row?.tagName).toBe('DIV');
  });

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<ListItem title="Press" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: /press/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<ListItem title="Press" onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole('button', { name: /press/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('marks disabled rows with aria-disabled and data-disabled', () => {
    render(<ListItem title="Press" onClick={() => undefined} disabled />);
    const btn = screen.getByRole('button', { name: /press/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('data-disabled', '');
  });

  it('renders supportText below the title', () => {
    render(<ListItem title="Title" supportText="Support" />);
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('applies data-align="none" when supportText is absent', () => {
    render(<ListItem title="Only title" data-testid="row" />);
    const row = screen.getByText('Only title').closest('[data-align]');
    expect(row).toHaveAttribute('data-align', 'none');
  });

  it('applies data-align="top" when slotAlignment is top and supportText is present', () => {
    render(<ListItem title="T" supportText="S" slotAlignment="top" />);
    const row = screen.getByText('T').closest('[data-align]');
    expect(row).toHaveAttribute('data-align', 'top');
  });

  it('applies data-container="inset" for inset container', () => {
    render(<ListItem title="T" container="inset" />);
    const row = screen.getByText('T').closest('[data-container]');
    expect(row).toHaveAttribute('data-container', 'inset');
  });

  it('selected="medium" applies data-selected and aria-current', () => {
    render(<ListItem title="T" selected="medium" />);
    const row = screen.getByText('T').closest('[data-selected]');
    expect(row).toHaveAttribute('data-selected', 'medium');
    expect(row).toHaveAttribute('aria-current', 'true');
  });

  it('selected="high" applies data-selected — fill + on-colour text come from CSS intermediate-var overrides, not self-applied data-surface', () => {
    render(<ListItem title="T" selected="high" />);
    const row = screen.getByText('T').closest('[data-selected]');
    expect(row).toHaveAttribute('data-selected', 'high');
    // Critical: we do NOT self-apply data-surface="bold" here, because that
    // would cause --{Role}-Bold (our fill token) to be read as the inverted
    // brandBoldInversion value on the same element. The CSS overrides handle
    // on-colour text via --{Role}-Bold-High directly.
    expect(row).not.toHaveAttribute('data-surface');
  });

  it('renders start and end slots', () => {
    render(<ListItem title="T" start={<StartIcon />} end={<EndIcon />} />);
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('applies data-size on slots (lowercased)', () => {
    render(
      <ListItem
        title="T"
        start={<StartIcon />}
        startSize="L"
        end={<EndIcon />}
        endSize="S"
      />,
    );
    const start = screen.getByTestId('start-icon').closest('[data-role="start"]');
    const end = screen.getByTestId('end-icon').closest('[data-role="end"]');
    expect(start).toHaveAttribute('data-size', 'l');
    expect(end).toHaveAttribute('data-size', 's');
  });

  it('resolves appearance="auto" to primary via data-appearance', () => {
    render(<ListItem title="T" appearance="auto" />);
    const row = screen.getByText('T').closest('[data-appearance]');
    expect(row).toHaveAttribute('data-appearance', 'primary');
  });

  it('passes through aria-label', () => {
    render(<ListItem title={<span>Avatar row</span>} aria-label="Account settings" onClick={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Account settings' })).toBeInTheDocument();
  });

  it('renders supportStart slot inline before the supportText', () => {
    render(
      <ListItem
        title="Title"
        supportText="Support"
        supportStart={<svg data-testid="support-slot-icon" />}
      />,
    );
    expect(screen.getByTestId('support-slot-icon')).toBeInTheDocument();
  });

  it('does NOT render supportStart when supportText is absent (prevents orphan decoration)', () => {
    render(
      <ListItem
        title="Title"
        supportStart={<svg data-testid="support-slot-icon" />}
      />,
    );
    expect(screen.queryByTestId('support-slot-icon')).not.toBeInTheDocument();
  });

  it('does not set data-divider by default', () => {
    render(<ListItem title="T" />);
    const row = screen.getByText('T').closest('[data-align]');
    expect(row).not.toHaveAttribute('data-divider');
  });

  it('divider="full" sets data-divider="full" on root', () => {
    render(<ListItem title="T" divider="full" />);
    const row = screen.getByText('T').closest('[data-divider]');
    expect(row).toHaveAttribute('data-divider', 'full');
  });

  it('divider="inset" sets data-divider="inset" on root', () => {
    render(<ListItem title="T" divider="inset" />);
    const row = screen.getByText('T').closest('[data-divider]');
    expect(row).toHaveAttribute('data-divider', 'inset');
  });

  it('mirrors data-start-size to root when a start slot is rendered (so inset divider can compute its offset)', () => {
    render(
      <ListItem
        title="T"
        start={<svg data-testid="start-icon" viewBox="0 0 24 24" />}
        startSize="L"
      />,
    );
    const row = screen.getByTestId('start-icon').closest('[data-start-size]:not([data-role])');
    expect(row).toHaveAttribute('data-start-size', 'l');
  });

  it('does NOT set data-start-size on root when no start slot is rendered', () => {
    render(<ListItem title="T" startSize="L" />);
    const row = screen.getByText('T').closest('[data-align]');
    expect(row).not.toHaveAttribute('data-start-size');
  });
});
