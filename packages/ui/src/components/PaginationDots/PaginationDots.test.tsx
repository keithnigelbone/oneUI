/**
 * PaginationDots.test.tsx
 * Unit tests for PaginationDots component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PaginationDots } from './PaginationDots';
import { scaleForDistance } from './PaginationDots.shared';

describe('PaginationDots', () => {
  // ============================================
  // RENDERING
  // ============================================

  it('renders `count` buttons when count <= windowSize', () => {
    render(<PaginationDots pageCount={5} aria-label="Pagination" />);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('caps visible tabs to the Figma-specified max of 5 when count > 5', () => {
    render(<PaginationDots pageCount={20} aria-label="Pagination" />);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('defaults to windowSize=5 (Figma spec cap)', () => {
    render(<PaginationDots pageCount={20} aria-label="Pagination" />);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('renders all tabs when count < 5 (short sequence)', () => {
    render(<PaginationDots pageCount={3} aria-label="Pagination" />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('short sequence: inactive dots are `regular`, active is `active` (no edge)', () => {
    render(<PaginationDots pageCount={5} defaultActiveIndex={2} aria-label="Pagination" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);
    const states = tabs.map((t) => t.getAttribute('data-state'));
    expect(states).toEqual(['regular', 'regular', 'active', 'regular', 'regular']);
  });

  it('renders the tablist root with aria-label even when count = 0', () => {
    render(<PaginationDots pageCount={0} aria-label="Empty" />);
    expect(screen.getByRole('tablist', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('applies data-testid on the tablist root', () => {
    render(<PaginationDots pageCount={5} aria-label="Pagination" data-testid="pagination-dots-qa" />);
    expect(screen.getByTestId('pagination-dots-qa')).toHaveAttribute('role', 'tablist');
  });

  it('renders a single active tab when count = 1', () => {
    render(<PaginationDots pageCount={1} aria-label="Single" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('data-state', 'active');
  });

  // ============================================
  // CONTROLLED / UNCONTROLLED STATE
  // ============================================

  it('respects defaultActiveIndex (uncontrolled)', () => {
    render(<PaginationDots pageCount={5} defaultActiveIndex={2} aria-label="Pagination" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('updates aria-selected when controlled activeIndex changes', () => {
    const { rerender } = render(
      <PaginationDots pageCount={5} activeIndex={0} aria-label="Pagination" />,
    );
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');
    rerender(<PaginationDots pageCount={5} activeIndex={3} aria-label="Pagination" />);
    expect(screen.getAllByRole('tab')[3]).toHaveAttribute('aria-selected', 'true');
  });

  it('fires onActiveIndexChange when clicked (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PaginationDots
        pageCount={5}
        defaultActiveIndex={0}
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );
    await user.click(screen.getAllByRole('tab')[2]);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  it('ArrowRight advances non-loop and clamps at the last index', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PaginationDots
        pageCount={5}
        defaultActiveIndex={4}
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );
    // Focus the active tab (last index). In short-sequence render, all 5 are visible.
    const tabs = screen.getAllByRole('tab');
    tabs[4].focus();
    await user.keyboard('{ArrowRight}');
    // Should stay at 4 (clamped)
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('ArrowRight wraps in loop mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PaginationDots
        pageCount={5}
        defaultActiveIndex={4}
        loop
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    active?.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('ArrowLeft wraps to last in loop mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PaginationDots
        pageCount={5}
        defaultActiveIndex={0}
        loop
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    active?.focus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('Home / End jump to ends', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PaginationDots
        pageCount={10}
        defaultActiveIndex={3}
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );
    const active = screen
      .getAllByRole('tab')
      .find((t) => t.getAttribute('aria-selected') === 'true');
    active?.focus();
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(9);
    // Re-query for the new active (focus followed)
    const newActive = screen
      .getAllByRole('tab')
      .find((t) => t.getAttribute('aria-selected') === 'true');
    newActive?.focus();
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  // ============================================
  // WINDOW MATH
  // ============================================

  it('non-loop window slides as active advances (W=5)', () => {
    // active=5, count=20, W=5 → half=2, start=clamp(5-2, 0, 20-5)=3, visible 3..7
    render(
      <PaginationDots
        pageCount={20}
        activeIndex={5}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    const labels = tabs.map((t) => t.getAttribute('aria-label'));
    expect(labels).toEqual([
      'Page 4 of 20',
      'Page 5 of 20',
      'Page 6 of 20',
      'Page 7 of 20',
      'Page 8 of 20',
    ]);
  });

  it('loop window is centered around active (W=5)', () => {
    // active=10, count=20, W=5 → offsets -2..2 → visible 8..12
    render(
      <PaginationDots
        pageCount={20}
        activeIndex={10}
        loop
        aria-label="Pagination"
      />,
    );
    const absIndices = screen
      .getAllByRole('tab')
      .map((t) => Number(t.getAttribute('aria-label')!.match(/Page (\d+)/)![1]) - 1);
    expect(absIndices).toEqual([8, 9, 10, 11, 12]);
  });

  it('loop window wraps around count boundary (W=5)', () => {
    // active=19, count=20, W=5 → offsets -2..2 → [17,18,19,0,1]
    render(
      <PaginationDots
        pageCount={20}
        activeIndex={19}
        loop
        aria-label="Pagination"
      />,
    );
    const absIndices = screen
      .getAllByRole('tab')
      .map((t) => Number(t.getAttribute('aria-label')!.match(/Page (\d+)/)![1]) - 1);
    expect(absIndices).toEqual([17, 18, 19, 0, 1]);
  });

  it('non-loop at start: first dot is active (no edge left), last visible is edge', () => {
    // active=0, count=20, W=5 → visible [0,1,2,3,4]; first=active, last=edge
    render(
      <PaginationDots
        pageCount={20}
        activeIndex={0}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('data-state', 'active');
    expect(tabs[4]).toHaveAttribute('data-state', 'edge');
    // Middle inactive dots are all regular
    expect(tabs[1]).toHaveAttribute('data-state', 'regular');
    expect(tabs[3]).toHaveAttribute('data-state', 'regular');
  });

  it('non-loop at end: last dot is active, first visible is edge, middle are regular', () => {
    // active=19, count=20, W=5 → visible [15,16,17,18,19]; first=edge, last=active
    render(
      <PaginationDots
        pageCount={20}
        activeIndex={19}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs[tabs.length - 1]).toHaveAttribute('data-state', 'active');
    expect(tabs[0]).toHaveAttribute('data-state', 'edge');
    expect(tabs[2]).toHaveAttribute('data-state', 'regular');
  });

  it('non-loop in the middle: only first and last visible are edge', () => {
    // active=10, count=20, W=5 (default), half=2 → visible 8,9,10,11,12
    // Both edges (slot 0 and 4) have more content beyond them → edge
    // Middle slots 1,3 inactive → regular; slot 2 = active
    render(
      <PaginationDots
        pageCount={20}
        activeIndex={10}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    const states = tabs.map((t) => t.getAttribute('data-state'));
    expect(states).toEqual(['edge', 'regular', 'active', 'regular', 'edge']);
  });

  it('loop mode: outermost visible dots are always edge (window always centered)', () => {
    render(
      <PaginationDots
        pageCount={20}
        activeIndex={10}
        loop
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    const states = tabs.map((t) => t.getAttribute('data-state'));
    expect(states).toEqual(['edge', 'regular', 'active', 'regular', 'edge']);
  });

  // ============================================
  // READ-ONLY
  // ============================================

  it('renders as role="status" with aria-live in readOnly mode', () => {
    render(<PaginationDots pageCount={5} readOnly aria-label="Progress" />);
    const status = screen.getByRole('status', { name: 'Progress' });
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('readOnly buttons have no role="tab" (invalid inside role="status")', () => {
    render(<PaginationDots pageCount={5} readOnly aria-label="Progress" />);
    // Buttons must NOT carry role="tab" in readOnly — that role is only valid
    // inside a tablist container. The root is role="status" in readOnly mode.
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('readOnly active button has aria-current="true", others do not', () => {
    render(<PaginationDots pageCount={5} activeIndex={2} readOnly aria-label="Progress" />);
    const buttons = screen.getAllByRole('button');
    const withCurrent = buttons.filter((b) => b.getAttribute('aria-current') === 'true');
    expect(withCurrent).toHaveLength(1);
    expect(withCurrent[0]).toHaveAttribute('aria-label', 'Page 3 of 5');
  });

  it('readOnly buttons are disabled and tabIndex=-1', () => {
    render(<PaginationDots pageCount={5} readOnly aria-label="Progress" />);
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('tabIndex', '-1');
    }
  });

  it('readOnly does not fire onActiveIndexChange on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PaginationDots
        pageCount={5}
        readOnly
        onActiveIndexChange={onChange}
        aria-label="Progress"
      />,
    );
    // buttons are disabled, so userEvent.click should be a no-op
    await user.click(screen.getAllByRole('button')[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ============================================
  // ROVING TABINDEX
  // ============================================

  it('exactly one tab has tabIndex=0 (roving tabindex)', () => {
    render(
      <PaginationDots pageCount={10} defaultActiveIndex={3} aria-label="Pagination" />,
    );
    const tabs = screen.getAllByRole('tab');
    const focusable = tabs.filter((t) => t.getAttribute('tabIndex') === '0');
    expect(focusable).toHaveLength(1);
    expect(focusable[0]).toHaveAttribute('aria-selected', 'true');
  });

  // ============================================
  // OUT-OF-RANGE ACTIVE INDEX
  // ============================================

  it('clamps out-of-range controlled activeIndex (with dev warn)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <PaginationDots pageCount={5} activeIndex={99} aria-label="Pagination" />,
    );
    const tabs = screen.getAllByRole('tab');
    // Clamped to 4 (last index)
    expect(tabs[4]).toHaveAttribute('aria-selected', 'true');
    warnSpy.mockRestore();
  });

  // ============================================
  // ACCESSIBILITY
  // ============================================

  it('each tab has aria-label "Page N of M"', () => {
    render(<PaginationDots pageCount={3} aria-label="Pagination" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-label', 'Page 1 of 3');
    expect(tabs[1]).toHaveAttribute('aria-label', 'Page 2 of 3');
    expect(tabs[2]).toHaveAttribute('aria-label', 'Page 3 of 3');
  });

  it('root has role="tablist" (interactive) with aria-label', () => {
    render(<PaginationDots pageCount={5} aria-label="Pagination" />);
    expect(screen.getByRole('tablist', { name: 'Pagination' })).toBeInTheDocument();
  });

  // ============================================
  // EDGE: count=2 with loop
  // ============================================

  it('count=2 loop: both dots render, active can advance to the other', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PaginationDots
        pageCount={2}
        defaultActiveIndex={0}
        loop
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    // Click the second dot — should fire onChange(1)
    await user.click(tabs[1]);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  // ============================================
  // EDGE: ArrowRight at boundary does not cause stale focus ref
  // ============================================

  it('ArrowRight at last index (non-loop) does not steal focus on next unrelated update', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PaginationDots
        pageCount={5}
        defaultActiveIndex={4}
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );
    const tabs = screen.getAllByRole('tab');
    tabs[4].focus();
    // Press ArrowRight at the last index — already at the boundary, nothing changes
    await user.keyboard('{ArrowRight}');

    // Now rerender with a controlled activeIndex=2 (external update).
    // If focusAfterKeyRef were stale-true, tab[2] would steal focus here.
    rerender(
      <PaginationDots
        pageCount={5}
        activeIndex={2}
        onActiveIndexChange={onChange}
        aria-label="Pagination"
      />,
    );

    // The focused element should NOT be the new active tab (no focus theft).
    const activeTab = screen.getAllByRole('tab').find(
      (t) => t.getAttribute('aria-selected') === 'true',
    );
    expect(document.activeElement).not.toBe(activeTab);
  });
});

describe('scaleForDistance (legacy helper)', () => {
  it('returns active at d=0', () => {
    expect(scaleForDistance(0, 2)).toBe('active');
  });

  it('returns edge when d >= half', () => {
    expect(scaleForDistance(2, 2)).toBe('edge');
    expect(scaleForDistance(3, 3)).toBe('edge');
  });

  it('returns regular in between', () => {
    expect(scaleForDistance(1, 3)).toBe('regular');
    expect(scaleForDistance(2, 3)).toBe('regular');
  });
});
