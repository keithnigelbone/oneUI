/**
 * ListItemGroup.test.tsx
 * Unit + a11y tests for the ListItemGroup layout shell.
 */

import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ListItemGroup } from './ListItemGroup';
import { ListItem } from '../ListItem';

describe('ListItemGroup', () => {
  it('renders children (ListItem rows)', () => {
    render(
      <ListItemGroup aria-label="Settings">
        <ListItem title="Wi-Fi" />
        <ListItem title="Bluetooth" />
      </ListItemGroup>,
    );
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Bluetooth')).toBeInTheDocument();
  });

  it('defaults to role="group" with the passed aria-label', () => {
    render(<ListItemGroup aria-label="Settings" />);
    expect(screen.getByRole('group', { name: 'Settings' })).toBeInTheDocument();
  });

  it('accepts role="list" for semantic lists', () => {
    render(<ListItemGroup role="list" aria-label="Contacts" />);
    expect(screen.getByRole('list', { name: 'Contacts' })).toBeInTheDocument();
  });

  it('sectionDivider defaults to true — sets data-section-divider on root', () => {
    render(<ListItemGroup aria-label="Settings" />);
    expect(screen.getByRole('group')).toHaveAttribute('data-section-divider');
  });

  it('sectionDivider={false} omits the attribute', () => {
    render(<ListItemGroup aria-label="Settings" sectionDivider={false} />);
    expect(screen.getByRole('group')).not.toHaveAttribute('data-section-divider');
  });

  it('container="inset" sets data-container="inset"', () => {
    render(<ListItemGroup aria-label="Settings" container="inset" />);
    expect(screen.getByRole('group')).toHaveAttribute('data-container', 'inset');
  });

  it('container defaults to "fullWidth"', () => {
    render(<ListItemGroup aria-label="Settings" />);
    expect(screen.getByRole('group')).toHaveAttribute('data-container', 'fullWidth');
  });

  it('passes className and style through to the root', () => {
    render(
      <ListItemGroup
        aria-label="Settings"
        className="custom-class"
        style={{ maxWidth: '320px' }}
      />,
    );
    const root = screen.getByRole('group');
    expect(root.className).toContain('custom-class');
    expect(root).toHaveStyle({ maxWidth: '320px' });
  });

  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ListItemGroup ref={ref} aria-label="Settings" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('injects the group divider into children that do not define their own', () => {
    render(
      <ListItemGroup aria-label="Settings" divider="full">
        <ListItem title="Wi-Fi" />
        <ListItem title="Bluetooth" divider="inset" />
      </ListItemGroup>,
    );
    // Row without its own divider inherits the group's `divider="full"`.
    const wifi = screen.getByText('Wi-Fi').closest('[data-align]');
    expect(wifi).toHaveAttribute('data-divider', 'full');
    // Row with explicit divider="inset" wins over the group default.
    const bluetooth = screen.getByText('Bluetooth').closest('[data-align]');
    expect(bluetooth).toHaveAttribute('data-divider', 'inset');
  });

  it('defaults to divider="inset" when not specified', () => {
    render(
      <ListItemGroup aria-label="Settings">
        <ListItem title="Wi-Fi" />
      </ListItemGroup>,
    );
    const wifi = screen.getByText('Wi-Fi').closest('[data-align]');
    expect(wifi).toHaveAttribute('data-divider', 'inset');
  });

  it('respects divider="none" by NOT injecting the attribute', () => {
    render(
      <ListItemGroup aria-label="Settings" divider="none">
        <ListItem title="Wi-Fi" />
      </ListItemGroup>,
    );
    const wifi = screen.getByText('Wi-Fi').closest('[data-align]');
    expect(wifi).not.toHaveAttribute('data-divider');
  });
});
