/**
 * BottomNavigation.test.tsx
 * Unit + accessibility tests for BottomNavigation + BottomNavItem.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BottomNavigation } from './BottomNavigation';
import { BottomNavItem } from './BottomNavItem';

const HomeIcon = () => <svg data-testid="home-icon" viewBox="0 0 24 24" />;
const HomeFilledIcon = () => <svg data-testid="home-filled-icon" viewBox="0 0 24 24" />;
const SearchIcon = () => <svg data-testid="search-icon" viewBox="0 0 24 24" />;

describe('BottomNavigation', () => {
  it('renders a <nav> landmark with aria-label', () => {
    render(
      <BottomNavigation aria-label="Primary">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
      </BottomNavigation>,
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('renders all children as buttons when no href is provided', () => {
    render(
      <BottomNavigation aria-label="Primary">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
        <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
      </BottomNavigation>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('marks the active item with aria-current="page"', () => {
    render(
      <BottomNavigation aria-label="Primary" defaultValue="search">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
        <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
      </BottomNavigation>,
    );
    const search = screen.getByRole('button', { name: /search/i });
    const home = screen.getByRole('button', { name: /home/i });
    expect(search).toHaveAttribute('aria-current', 'page');
    expect(home).not.toHaveAttribute('aria-current');
  });

  it('explicit `active` prop wins over parent value', () => {
    render(
      <BottomNavigation aria-label="Primary" defaultValue="home">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
        <BottomNavItem value="search" icon={<SearchIcon />} label="Search" active />
      </BottomNavigation>,
    );
    expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('aria-current', 'page');
  });

  it('swaps in activeIcon when active', () => {
    render(
      <BottomNavigation aria-label="Primary" defaultValue="home">
        <BottomNavItem
          value="home"
          icon={<HomeIcon />}
          activeIcon={<HomeFilledIcon />}
          label="Home"
        />
      </BottomNavigation>,
    );
    expect(screen.getByTestId('home-filled-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument();
  });

  it('uses base icon when inactive', () => {
    render(
      <BottomNavigation aria-label="Primary" defaultValue="search">
        <BottomNavItem
          value="home"
          icon={<HomeIcon />}
          activeIcon={<HomeFilledIcon />}
          label="Home"
        />
        <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
      </BottomNavigation>,
    );
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('home-filled-icon')).not.toBeInTheDocument();
  });

  it('updates active item on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(
      <BottomNavigation aria-label="Primary" defaultValue="home">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
        <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
      </BottomNavigation>,
    );
    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /home/i })).not.toHaveAttribute('aria-current');
  });

  it('fires onValueChange in controlled mode', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <BottomNavigation aria-label="Primary" value="home" onValueChange={handle}>
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
        <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
      </BottomNavigation>,
    );
    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(handle).toHaveBeenCalledWith('search');
    // Controlled: parent still says home until prop changes
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute('aria-current', 'page');
  });

  it('calls item onClick before value change', async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    const itemClick = vi.fn(() => order.push('click'));
    const onValueChange = vi.fn(() => order.push('change'));
    render(
      <BottomNavigation aria-label="Primary" onValueChange={onValueChange}>
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" onClick={itemClick} />
      </BottomNavigation>,
    );
    await user.click(screen.getByRole('button', { name: /home/i }));
    expect(itemClick).toHaveBeenCalled();
    expect(order).toEqual(['click', 'change']);
  });

  it('renders as <a> when href is provided', () => {
    render(
      <BottomNavigation aria-label="Primary">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" href="/home" />
      </BottomNavigation>,
    );
    const link = screen.getByRole('link', { name: /home/i });
    expect(link).toHaveAttribute('href', '/home');
  });

  it('disabled button does not trigger value change', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <BottomNavigation aria-label="Primary" onValueChange={handle}>
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" disabled />
      </BottomNavigation>,
    );
    const btn = screen.getByRole('button', { name: /home/i });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(handle).not.toHaveBeenCalled();
  });

  it('disabled link omits href and sets aria-disabled', () => {
    const { container } = render(
      <BottomNavigation aria-label="Primary">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" href="/home" disabled />
      </BottomNavigation>,
    );
    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor).not.toHaveAttribute('href');
    expect(anchor).toHaveAttribute('aria-disabled', 'true');
  });

  it('inherits labelType from parent (via data-label-type)', () => {
    render(
      <BottomNavigation aria-label="Primary" labelType="2line">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
      </BottomNavigation>,
    );
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute('data-label-type', '2line');
  });

  it('item can override labelType locally', () => {
    render(
      <BottomNavigation aria-label="Primary" labelType="1line">
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" labelType="none" aria-label="Home" />
      </BottomNavigation>,
    );
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute('data-label-type', 'none');
  });

  it('omits the top divider when showDivider=false', () => {
    const { container } = render(
      <BottomNavigation aria-label="Primary" showDivider={false}>
        <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
      </BottomNavigation>,
    );
    expect(container.querySelector('[role="separator"]')).toBeNull();
  });

  it('warns when more than 5 items are passed (dev only)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <BottomNavigation aria-label="Primary">
        <BottomNavItem value="a" icon={<HomeIcon />} label="A" />
        <BottomNavItem value="b" icon={<HomeIcon />} label="B" />
        <BottomNavItem value="c" icon={<HomeIcon />} label="C" />
        <BottomNavItem value="d" icon={<HomeIcon />} label="D" />
        <BottomNavItem value="e" icon={<HomeIcon />} label="E" />
        <BottomNavItem value="f" icon={<HomeIcon />} label="F" />
      </BottomNavigation>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('up to 5'));
    warn.mockRestore();
  });

  describe('Keyboard navigation', () => {
    it('ArrowRight moves focus to the next item', async () => {
      const user = userEvent.setup();
      render(
        <BottomNavigation aria-label="Primary" defaultValue="home">
          <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
          <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
        </BottomNavigation>,
      );
      screen.getByRole('button', { name: /home/i }).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: /search/i })).toHaveFocus();
    });

    it('ArrowLeft moves focus to the previous item', async () => {
      const user = userEvent.setup();
      render(
        <BottomNavigation aria-label="Primary" defaultValue="search">
          <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
          <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
        </BottomNavigation>,
      );
      screen.getByRole('button', { name: /search/i }).focus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', { name: /home/i })).toHaveFocus();
    });

    it('Home and End move focus to first and last items', async () => {
      const user = userEvent.setup();
      render(
        <BottomNavigation aria-label="Primary" defaultValue="search">
          <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
          <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
          <BottomNavItem value="profile" icon={<SearchIcon />} label="Profile" />
        </BottomNavigation>,
      );
      screen.getByRole('button', { name: /search/i }).focus();
      await user.keyboard('{End}');
      expect(screen.getByRole('button', { name: /profile/i })).toHaveFocus();
      await user.keyboard('{Home}');
      expect(screen.getByRole('button', { name: /home/i })).toHaveFocus();
    });

    it('ArrowRight wraps from last item to first', async () => {
      const user = userEvent.setup();
      render(
        <BottomNavigation aria-label="Primary" defaultValue="search">
          <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
          <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
        </BottomNavigation>,
      );
      screen.getByRole('button', { name: /search/i }).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: /home/i })).toHaveFocus();
    });

    it('skips disabled items when moving focus with arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <BottomNavigation aria-label="Primary" defaultValue="home">
          <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
          <BottomNavItem value="search" icon={<SearchIcon />} label="Search" disabled />
          <BottomNavItem value="profile" icon={<SearchIcon />} label="Profile" />
        </BottomNavigation>,
      );
      screen.getByRole('button', { name: /home/i }).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: /profile/i })).toHaveFocus();
    });

    it('uses roving tabindex — only one item is tabbable at a time', () => {
      render(
        <BottomNavigation aria-label="Primary" defaultValue="search">
          <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
          <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
        </BottomNavigation>,
      );
      const home = screen.getByRole('button', { name: /home/i });
      const search = screen.getByRole('button', { name: /search/i });
      expect(search).toHaveAttribute('tabIndex', '0');
      expect(home).toHaveAttribute('tabIndex', '-1');
    });

    it('Enter on focused item activates selection without arrow navigation', async () => {
      const user = userEvent.setup();
      render(
        <BottomNavigation aria-label="Primary" defaultValue="home">
          <BottomNavItem value="home" icon={<HomeIcon />} label="Home" />
          <BottomNavItem value="search" icon={<SearchIcon />} label="Search" />
        </BottomNavigation>,
      );
      screen.getByRole('button', { name: /search/i }).focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });
});
