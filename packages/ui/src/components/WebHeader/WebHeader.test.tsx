/**
 * WebHeader.test.tsx
 * Smoke + structural coverage for the WebHeader compound component.
 *
 * Detailed sub-component behaviour (drawer drill-down, scroll direction,
 * search positioning) is exercised by Storybook play functions and the
 * underlying primitives' own tests; this file enforces the basic contract
 * that the support-matrix gate depends on.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WebHeader } from './WebHeader';

describe('WebHeader', () => {
  it('renders a <header> landmark with the supplied aria-label', () => {
    render(
      <WebHeader variant="default" aria-label="Site nav">
        <div>content</div>
      </WebHeader>,
    );
    const node = screen.getByRole('banner', { name: 'Site nav' });
    expect(node.tagName).toBe('HEADER');
  });

  it('exposes the data-variant attribute set from props', () => {
    render(
      <WebHeader variant="transparent" aria-label="Transparent">
        <div>x</div>
      </WebHeader>,
    );
    const node = screen.getByRole('banner', { name: 'Transparent' });
    expect(node).toHaveAttribute('data-variant', 'transparent');
  });

  it('renders children inside the header', () => {
    render(
      <WebHeader variant="default" aria-label="Body">
        <div data-testid="payload">hello</div>
      </WebHeader>,
    );
    expect(screen.getByTestId('payload')).toHaveTextContent('hello');
  });

  it('exposes the compound sub-components on the WebHeader namespace', () => {
    expect(WebHeader.PrimaryNav).toBeDefined();
    expect(WebHeader.SecondaryNav).toBeDefined();
    expect(WebHeader.Item).toBeDefined();
    expect(WebHeader.Drawer).toBeDefined();
  });
});

describe('WebHeader.SecondaryNav', () => {
  it('renders navStart items with start alignment', () => {
    render(
      <WebHeader.SecondaryNav type="navStart" aria-label="Tabs">
        <WebHeader.Item value="one" attention="high" active>One</WebHeader.Item>
      </WebHeader.SecondaryNav>,
    );

    const nav = screen.getByRole('navigation', { name: 'Tabs' });
    expect(nav).toHaveAttribute('data-type', 'navStart');
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
  });

  it('renders navEnd with end alignment data-type', () => {
    render(
      <WebHeader.SecondaryNav type="navEnd" aria-label="End tabs">
        <WebHeader.Item value="one" attention="high">One</WebHeader.Item>
      </WebHeader.SecondaryNav>,
    );

    expect(screen.getByRole('navigation', { name: 'End tabs' })).toHaveAttribute(
      'data-type',
      'navEnd',
    );
  });

  it('hides nav items when secondaryNavItems is false', () => {
    render(
      <WebHeader.SecondaryNav type="navStart" secondaryNavItems={false} aria-label="Empty tabs">
        <WebHeader.Item value="one" attention="high">One</WebHeader.Item>
      </WebHeader.SecondaryNav>,
    );

    expect(screen.queryByRole('button', { name: 'One' })).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Empty tabs' })).toBeInTheDocument();
  });

  it('renders marketing subheader and end actions only for marketing type', () => {
    render(
      <WebHeader.SecondaryNav
        type="marketing"
        subheader="Featured"
        end={<button type="button">Buy</button>}
        aria-label="Marketing row"
      >
        <WebHeader.Item value="hidden" attention="high">Hidden</WebHeader.Item>
      </WebHeader.SecondaryNav>,
    );

    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hidden' })).not.toBeInTheDocument();
  });

  it('does not render end actions for navStart', () => {
    render(
      <WebHeader.SecondaryNav
        type="navStart"
        end={<button type="button">Should not render</button>}
        aria-label="Start tabs"
      >
        <WebHeader.Item value="one" attention="high">One</WebHeader.Item>
      </WebHeader.SecondaryNav>,
    );

    expect(screen.queryByRole('button', { name: 'Should not render' })).not.toBeInTheDocument();
  });
});
