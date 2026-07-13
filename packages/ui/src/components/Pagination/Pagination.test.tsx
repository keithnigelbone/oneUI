/**
 * Pagination.test.tsx
 *
 * Unit tests for Pagination + PaginationItem. Covers:
 *   - rendering (counts, ellipses placement, edge cases)
 *   - controlled / uncontrolled state
 *   - click + keyboard navigation
 *   - accessibility (aria-label, aria-current, role=navigation, live region)
 *   - the pure windowing math via `_internal.buildPaginationPages`
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';
import { PaginationItem } from './PaginationItem';
import { _internal } from './Pagination.shared';

// ─── Pure windowing math ─────────────────────────────────────────────────────

describe('buildPaginationPages — windowing math', () => {
  const f = _internal.buildPaginationPages;

  it('returns [] for totalPages <= 0', () => {
    expect(f({ totalPages: 0, currentPage: 1, siblingCount: 1, boundaryCount: 1 })).toEqual([]);
  });

  it('renders all pages when total <= window (no ellipsis)', () => {
    expect(f({ totalPages: 5, currentPage: 3, siblingCount: 1, boundaryCount: 1 })).toEqual([1, 2, 3, 4, 5]);
  });

  it('strict siblingCount: page 1 shows only 1,2,…,N (not grown window)', () => {
    expect(f({ totalPages: 10, currentPage: 1, siblingCount: 1, boundaryCount: 1 })).toEqual([
      1,
      2,
      'ellipsis-end',
      10,
    ]);
  });

  it('inserts an end-ellipsis when current is near the start', () => {
    const out = f({ totalPages: 20, currentPage: 1, siblingCount: 1, boundaryCount: 1 });
    expect(out[0]).toBe(1);
    expect(out[out.length - 1]).toBe(20);
    expect(out).toContain('ellipsis-end');
    expect(out).not.toContain('ellipsis-start');
  });

  it('inserts a start-ellipsis when current is near the end', () => {
    const out = f({ totalPages: 20, currentPage: 20, siblingCount: 1, boundaryCount: 1 });
    expect(out[0]).toBe(1);
    expect(out[out.length - 1]).toBe(20);
    expect(out).toContain('ellipsis-start');
    expect(out).not.toContain('ellipsis-end');
  });

  it('inserts both ellipses when current is in the middle', () => {
    const out = f({ totalPages: 20, currentPage: 10, siblingCount: 1, boundaryCount: 1 });
    expect(out[0]).toBe(1);
    expect(out[out.length - 1]).toBe(20);
    expect(out).toContain('ellipsis-start');
    expect(out).toContain('ellipsis-end');
    expect(out).toContain(10);
  });

  it('never produces two consecutive ellipses', () => {
    const out = f({ totalPages: 100, currentPage: 50, siblingCount: 1, boundaryCount: 1 });
    for (let i = 1; i < out.length; i++) {
      const a = out[i - 1];
      const b = out[i];
      const aIsEllipsis = typeof a === 'string';
      const bIsEllipsis = typeof b === 'string';
      expect(aIsEllipsis && bIsEllipsis).toBe(false);
    }
  });

  it('respects siblingCount = 0', () => {
    const out = f({ totalPages: 20, currentPage: 10, siblingCount: 0, boundaryCount: 1 });
    expect(out).toContain(10);
    expect(out).toContain(1);
    expect(out).toContain(20);
  });

  it('respects boundaryCount = 2 (shows the first two and last two pages)', () => {
    const out = f({ totalPages: 20, currentPage: 10, siblingCount: 1, boundaryCount: 2 });
    expect(out.slice(0, 2)).toEqual([1, 2]);
    expect(out.slice(-2)).toEqual([19, 20]);
  });
});

// ─── Pagination — rendering ──────────────────────────────────────────────────

describe('Pagination — rendering', () => {
  it('defaults selected page chip to medium attention when attention is omitted', () => {
    render(<Pagination totalPages={5} defaultPage={3} aria-label="Test" />);
    const selected = screen.getByRole('button', { name: 'Go to page 3' });
    expect(selected).toHaveAttribute('data-attention', 'medium');
    expect(selected).toHaveAttribute('data-variant', 'subtle');
  });

  it('renders with prev + next + numbered pages by default', () => {
    render(<Pagination totalPages={5} aria-label="Test" />);
    expect(screen.getByRole('navigation', { name: 'Test' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
    // 5 numbered page buttons
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: `Go to page ${i}` })).toBeInTheDocument();
    }
  });

  it('does not render prev/next when showPrevNext={false}', () => {
    render(<Pagination totalPages={5} showPrevNext={false} aria-label="No nav" />);
    expect(screen.queryByRole('button', { name: 'Go to previous page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go to next page' })).not.toBeInTheDocument();
  });

  it('renders first/last when showFirstLast', () => {
    render(<Pagination totalPages={20} showFirstLast aria-label="With first/last" />);
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeInTheDocument();
  });

  it('renders the empty navigation landmark for totalPages=0', () => {
    render(<Pagination totalPages={0} aria-label="Empty" />);
    expect(screen.getByRole('navigation', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('marks the active page with aria-current="page"', () => {
    render(<Pagination totalPages={5} defaultPage={3} aria-label="Test" />);
    const active = screen.getByRole('button', { name: 'Go to page 3' });
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('disables prev when on first page, next when on last page', () => {
    // Use the controlled `page` prop so the rerender actually moves the
    // internal active page — `defaultPage` only seeds initial state.
    const { rerender } = render(<Pagination totalPages={5} page={1} aria-label="Test" />);
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBeDisabled();
    rerender(<Pagination totalPages={5} page={5} aria-label="Test" />);
    expect(screen.getByRole('button', { name: 'Go to previous page' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
  });
});

// ─── Pagination — controlled / uncontrolled state ───────────────────────────

describe('Pagination — controlled state', () => {
  it('updates when controlled `page` changes', () => {
    const { rerender } = render(<Pagination totalPages={10} page={1} aria-label="Test" />);
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page');
    rerender(<Pagination totalPages={10} page={5} aria-label="Test" />);
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toHaveAttribute('aria-current', 'page');
  });

  it('respects defaultPage when uncontrolled', () => {
    render(<Pagination totalPages={10} defaultPage={4} aria-label="Test" />);
    expect(screen.getByRole('button', { name: 'Go to page 4' })).toHaveAttribute('aria-current', 'page');
  });

  it('fires onPageChange when a page button is clicked (uncontrolled)', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={5} onPageChange={handle} aria-label="Test" />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(handle).toHaveBeenCalledWith(3);
  });

  it('fires onPageChange when next is clicked', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={5} defaultPage={2} onPageChange={handle} aria-label="Test" />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(handle).toHaveBeenCalledWith(3);
  });

  it('does not fire onPageChange when disabled', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={5} defaultPage={2} disabled onPageChange={handle} aria-label="Test" />);
    // disabled root suppresses pointer events; explicit click on a button is a no-op
    const btn = screen.getByRole('button', { name: 'Go to page 3' });
    await userEvent.click(btn).catch(() => {});
    expect(handle).not.toHaveBeenCalled();
  });
});

// ─── Pagination — keyboard ──────────────────────────────────────────────────

describe('Pagination — keyboard navigation', () => {
  it('ArrowRight on the active page button steps forward', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={10} defaultPage={3} onPageChange={handle} aria-label="Test" />);
    const active = screen.getByRole('button', { name: 'Go to page 3' });
    active.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(handle).toHaveBeenCalledWith(4);
  });

  it('ArrowLeft on the active page button steps backward', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={10} defaultPage={3} onPageChange={handle} aria-label="Test" />);
    const active = screen.getByRole('button', { name: 'Go to page 3' });
    active.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(handle).toHaveBeenCalledWith(2);
  });

  it('Home jumps to page 1', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={10} defaultPage={5} onPageChange={handle} aria-label="Test" />);
    const active = screen.getByRole('button', { name: 'Go to page 5' });
    active.focus();
    await userEvent.keyboard('{Home}');
    expect(handle).toHaveBeenCalledWith(1);
  });

  it('End jumps to the last page', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={10} defaultPage={5} onPageChange={handle} aria-label="Test" />);
    const active = screen.getByRole('button', { name: 'Go to page 5' });
    active.focus();
    await userEvent.keyboard('{End}');
    expect(handle).toHaveBeenCalledWith(10);
  });

  it('arrow keys on a non-page button (next/prev) do nothing — they remain individually focusable', async () => {
    const handle = vi.fn();
    render(<Pagination totalPages={10} defaultPage={3} onPageChange={handle} aria-label="Test" />);
    const next = screen.getByRole('button', { name: 'Go to next page' });
    next.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(handle).not.toHaveBeenCalled();
  });

  it('uses roving tabindex — only the active page is tabbable', () => {
    render(<Pagination totalPages={5} defaultPage={3} aria-label="Test" />);
    const tabbablePages = screen
      .getAllByRole('button')
      .filter((b: HTMLElement) => b.getAttribute('data-type') === 'page' && b.tabIndex === 0);
    expect(tabbablePages).toHaveLength(1);
    expect(tabbablePages[0]).toHaveAttribute('aria-current', 'page');
  });
});

// ─── Accessibility ──────────────────────────────────────────────────────────

describe('Pagination — accessibility', () => {
  it('exposes a navigation landmark with the configured aria-label', () => {
    render(<Pagination totalPages={5} aria-label="Search results" />);
    expect(screen.getByRole('navigation', { name: 'Search results' })).toBeInTheDocument();
  });

  it('defaults aria-label to "Pagination"', () => {
    render(<Pagination totalPages={5} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('renders a polite live region announcing current page', () => {
    render(<Pagination totalPages={5} defaultPage={2} />);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('renders multi-digit page labels in full', () => {
    render(<PaginationItem page={11} />);
    expect(screen.getByRole('button', { name: 'Go to page 11' })).toHaveTextContent('11');
  });

  it('every page button has a unique accessible name', () => {
    render(<Pagination totalPages={5} aria-label="Test" />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: `Go to page ${i}` })).toBeInTheDocument();
    }
  });

  it('renders ellipsis subtree outside the accessibility tree', () => {
    render(<Pagination totalPages={20} defaultPage={1} aria-label="Ellipsis a11y" />);
    expect(screen.queryByRole('button', { name: 'Collapsed pages' })).not.toBeInTheDocument();
  });
});

// ─── PaginationItem primitive ───────────────────────────────────────────────

describe('PaginationItem — primitive', () => {
  it('renders a numbered button by default', () => {
    render(<PaginationItem page={3} />);
    expect(screen.getByRole('button', { name: 'Go to page 3' })).toBeInTheDocument();
  });

  it('inactive page chip uses data-attention high', () => {
    render(<PaginationItem page={1} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'high');
  });

  it('marks selected items with aria-current=page', () => {
    render(<PaginationItem page={4} selected />);
    expect(screen.getByRole('button', { name: 'Go to page 4' })).toHaveAttribute('aria-current', 'page');
  });

  it('defaults selected chip to medium attention when attention is omitted', () => {
    render(<PaginationItem page={1} selected />);
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'medium');
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'subtle');
  });

  it('attention="medium" maps to data-variant="subtle" when selected', () => {
    render(<PaginationItem page={1} attention="medium" selected />);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'subtle');
  });

  it('non-selected page stays ghost; numeral attention stays high', () => {
    render(<PaginationItem page={1} attention="medium" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
    expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'high');
  });

  it('attention="low" maps to data-variant="ghost" when selected', () => {
    render(<PaginationItem page={1} attention="low" selected />);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
  });

  it('attention="high" maps to data-variant="bold" when selected', () => {
    render(<PaginationItem page={1} attention="high" selected />);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'bold');
  });

  it('high attention is ignored when not selected (ghost)', () => {
    render(<PaginationItem page={1} attention="high" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
  });

  it('size="L" maps to SingleTextButton data-size l', () => {
    render(<PaginationItem page={1} size="L" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'l');
  });

  it('appearance="positive" uses neutral data-appearance when not selected', () => {
    render(<PaginationItem page={1} appearance="positive" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'neutral');
  });

  it('appearance="positive" sets data-appearance="positive" when selected', () => {
    render(<PaginationItem page={1} appearance="positive" selected />);
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'positive');
  });

  it('disables the button when disabled', () => {
    render(<PaginationItem page={1} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onSelect with the page number on click', async () => {
    const handle = vi.fn();
    render(<PaginationItem page={7} onSelect={handle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handle).toHaveBeenCalledWith(7);
  });
});
