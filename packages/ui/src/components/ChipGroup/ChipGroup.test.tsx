/**
 * ChipGroup.test.tsx
 * Unit tests for ChipGroup component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChipGroup } from './ChipGroup';
import { Chip } from '../Chip/Chip';

// Helper: render a basic group with labelled chips
function renderGroup(props = {}) {
  return render(
    <ChipGroup aria-label="Category filter" {...props}>
      <Chip value="news" aria-label="News">News</Chip>
      <Chip value="sport" aria-label="Sport">Sport</Chip>
      <Chip value="tech" aria-label="Tech">Tech</Chip>
    </ChipGroup>,
  );
}

describe('ChipGroup', () => {
  // ── Rendering ────────────────────────────────────────────────────────

  it('renders all child chips', () => {
    renderGroup();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('renders with aria-label on the group', () => {
    renderGroup();
    expect(screen.getByRole('group', { name: 'Category filter' })).toBeInTheDocument();
  });

  // ── Single-select (default) ──────────────────────────────────────────

  it('selects a chip on click (uncontrolled single-select)', async () => {
    const user = userEvent.setup();
    renderGroup();
    const [news] = screen.getAllByRole('button');

    await user.click(news);
    expect(news).toHaveAttribute('aria-pressed', 'true');
  });

  it('deselects the previous chip when a new one is selected (single-select)', async () => {
    const user = userEvent.setup();
    renderGroup({ defaultValue: ['news'] });
    const [news, sport] = screen.getAllByRole('button');

    expect(news).toHaveAttribute('aria-pressed', 'true');
    await user.click(sport);
    expect(sport).toHaveAttribute('aria-pressed', 'true');
    expect(news).toHaveAttribute('aria-pressed', 'false');
  });

  it('fires onValueChange with the new selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderGroup({ onValueChange });

    await user.click(screen.getAllByRole('button')[0]);
    expect(onValueChange).toHaveBeenCalledWith(['news']);
  });

  // ── Controlled mode ──────────────────────────────────────────────────

  it('respects controlled value', () => {
    const { rerender } = render(
      <ChipGroup value={['sport']} onValueChange={vi.fn()} aria-label="Controlled">
        <Chip value="news" aria-label="News">News</Chip>
        <Chip value="sport" aria-label="Sport">Sport</Chip>
      </ChipGroup>,
    );

    const [news, sport] = screen.getAllByRole('button');
    expect(news).toHaveAttribute('aria-pressed', 'false');
    expect(sport).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <ChipGroup value={['news']} onValueChange={vi.fn()} aria-label="Controlled">
        <Chip value="news" aria-label="News">News</Chip>
        <Chip value="sport" aria-label="Sport">Sport</Chip>
      </ChipGroup>,
    );
    expect(news).toHaveAttribute('aria-pressed', 'true');
    expect(sport).toHaveAttribute('aria-pressed', 'false');
  });

  // ── Multi-select ─────────────────────────────────────────────────────

  it('allows multiple chips selected with multiple=true', async () => {
    const user = userEvent.setup();
    renderGroup({ multiple: true });
    const [news, sport] = screen.getAllByRole('button');

    await user.click(news);
    await user.click(sport);
    expect(news).toHaveAttribute('aria-pressed', 'true');
    expect(sport).toHaveAttribute('aria-pressed', 'true');
  });

  it('fires onValueChange with all selected values in multi-select', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderGroup({ multiple: true, onValueChange });

    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getAllByRole('button')[1]);
    expect(onValueChange).toHaveBeenLastCalledWith(['news', 'sport']);
  });

  // ── maxSelections ────────────────────────────────────────────────────

  it('blocks selection beyond maxSelections', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderGroup({ multiple: true, maxSelections: 1, onValueChange });

    const [news, sport] = screen.getAllByRole('button');
    await user.click(news);
    expect(onValueChange).toHaveBeenCalledTimes(1);

    // Try to select sport — blocked because maxSelections=1 already reached
    await user.click(sport);
    expect(onValueChange).toHaveBeenCalledTimes(1); // still 1
  });

  // ── required ────────────────────────────────────────────────────────

  it('prevents deselecting the last chip when required=true (controlled)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup value={['news']} onValueChange={onValueChange} required aria-label="Required">
        <Chip value="news" aria-label="News">News</Chip>
        <Chip value="sport" aria-label="Sport">Sport</Chip>
      </ChipGroup>,
    );

    // Click the only selected chip — deselect attempt
    await user.click(screen.getByRole('button', { name: 'News' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  // ── Disabled ─────────────────────────────────────────────────────────

  it('disables all chips when disabled=true', () => {
    renderGroup({ disabled: true });
    screen.getAllByRole('button').forEach((btn) => expect(btn).toBeDisabled());
  });

  it('does not fire onValueChange when group is disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderGroup({ disabled: true, onValueChange });

    await user.click(screen.getAllByRole('button')[0]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  // ── Context propagation ──────────────────────────────────────────────

  it('propagates size to child chips', () => {
    renderGroup({ size: 'l' });
    screen.getAllByRole('button').forEach((btn) =>
      expect(btn).toHaveAttribute('data-size', 'l'),
    );
  });

  it('propagates attention to child chips (derives data-variant)', () => {
    renderGroup({ attention: 'high' });
    screen.getAllByRole('button').forEach((btn) =>
      expect(btn).toHaveAttribute('data-variant', 'bold'),
    );
  });

  it('propagates appearance to child chips', () => {
    renderGroup({ appearance: 'positive' });
    screen.getAllByRole('button').forEach((btn) =>
      expect(btn).toHaveAttribute('data-appearance', 'positive'),
    );
  });

  it('chip-level props override group-level props', () => {
    render(
      <ChipGroup size="s" attention="medium" aria-label="Override test">
        <Chip value="a" size="l" attention="high" aria-label="Override chip">Override</Chip>
      </ChipGroup>,
    );
    const chip = screen.getByRole('button');
    expect(chip).toHaveAttribute('data-size', 'l');
    expect(chip).toHaveAttribute('data-variant', 'bold');
  });

  // ── Orientation ──────────────────────────────────────────────────────

  it('sets data-orientation attribute', () => {
    renderGroup({ orientation: 'vertical' });
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical');
  });

  // ── Keyboard navigation ──────────────────────────────────────────────

  it('selects chip via keyboard Enter', async () => {
    const user = userEvent.setup();
    renderGroup();
    const [news] = screen.getAllByRole('button');

    news.focus();
    await user.keyboard('{Enter}');
    expect(news).toHaveAttribute('aria-pressed', 'true');
  });

  it('selects chip via keyboard Space', async () => {
    const user = userEvent.setup();
    renderGroup();
    const [news] = screen.getAllByRole('button');

    news.focus();
    await user.keyboard(' ');
    expect(news).toHaveAttribute('aria-pressed', 'true');
  });
});
