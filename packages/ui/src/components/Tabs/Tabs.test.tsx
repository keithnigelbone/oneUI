/**
 * Tabs.test.tsx
 * Unit tests covering selection, keyboard navigation, slot rendering,
 * disabled state, orientation, appearance/size propagation, and
 * icon-only accessibility warnings.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tabs } from './Tabs';
import { TabGroup } from './TabGroup';
import { TabItem } from './TabItem';
import { TabPanel } from './TabPanel';

describe('Tabs', () => {
  describe('Rendering (compound API)', () => {
    it('renders tabs + panels with correct ARIA roles', () => {
      render(
        <Tabs defaultValue="a">
          <Tabs.List>
            <Tabs.Item value="a">A</Tabs.Item>
            <Tabs.Item value="b">B</Tabs.Item>
          </Tabs.List>
          <Tabs.Panel value="a">Panel A</Tabs.Panel>
          <Tabs.Panel value="b">Panel B</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('Tabs.Tab still works as a back-compat alias for Tabs.Item', () => {
      render(
        <Tabs defaultValue="a">
          <Tabs.List>
            <Tabs.Tab value="a">Legacy</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">Body</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getByRole('tab', { name: 'Legacy' })).toBeInTheDocument();
    });
  });

  describe('Rendering (flat API)', () => {
    it('renders TabGroup + TabItem + TabPanel (panels as children of TabGroup)', () => {
      render(
        <TabGroup defaultValue="a">
          <TabItem value="a">A</TabItem>
          <TabItem value="b">B</TabItem>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </TabGroup>,
      );
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      expect(screen.getByText('Panel A')).toBeInTheDocument();
    });

    it('propagates size via context', () => {
      render(
        <TabGroup size="l" defaultValue="a">
          <TabItem value="a">A</TabItem>
        </TabGroup>,
      );
      expect(screen.getByRole('tab')).toHaveAttribute('data-size', 'l');
    });

    it('propagates orientation to children', () => {
      render(
        <TabGroup orientation="vertical" defaultValue="a">
          <TabItem value="a">A</TabItem>
        </TabGroup>,
      );
      expect(screen.getByRole('tab')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('propagates appearance to children (auto → primary)', () => {
      render(
        <TabGroup appearance="auto" defaultValue="a">
          <TabItem value="a">A</TabItem>
        </TabGroup>,
      );
      expect(screen.getByRole('tab')).toHaveAttribute('data-appearance', 'primary');
    });

    it('item-level size wins over group-level size', () => {
      render(
        <TabGroup size="s" defaultValue="a">
          <TabItem value="a" size="l">
            A
          </TabItem>
        </TabGroup>,
      );
      expect(screen.getByRole('tab')).toHaveAttribute('data-size', 'l');
    });
  });

  describe('Selection', () => {
    it('selects a tab on click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TabGroup defaultValue="a" onValueChange={onChange}>
          <TabItem value="a">A</TabItem>
          <TabItem value="b">B</TabItem>
        </TabGroup>,
      );
      await user.click(screen.getByRole('tab', { name: 'B' }));
      expect(onChange).toHaveBeenCalled();
      expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    });

    it('skips a disabled tab on selection', async () => {
      const user = userEvent.setup();
      render(
        <TabGroup defaultValue="a">
          <TabItem value="a">A</TabItem>
          <TabItem value="b" disabled>B</TabItem>
        </TabGroup>,
      );
      const disabled = screen.getByRole('tab', { name: 'B' });
      await user.click(disabled);
      expect(disabled).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Keyboard navigation', () => {
    it('Arrow keys move focus and activate on Enter', async () => {
      const user = userEvent.setup();
      render(
        <TabGroup defaultValue="a">
          <TabItem value="a">A</TabItem>
          <TabItem value="b">B</TabItem>
        </TabGroup>,
      );
      const first = screen.getByRole('tab', { name: 'A' });
      first.focus();
      await user.keyboard('{ArrowRight}');
      const second = screen.getByRole('tab', { name: 'B' });
      expect(second).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(second).toHaveAttribute('aria-selected', 'true');
    });

    it('activateOnFocus selects tabs as focus moves', async () => {
      const user = userEvent.setup();
      render(
        <TabGroup defaultValue="a" activateOnFocus>
          <TabItem value="a">A</TabItem>
          <TabItem value="b">B</TabItem>
        </TabGroup>,
      );
      screen.getByRole('tab', { name: 'A' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Slots', () => {
    it('renders icon (start alias) and badge (end alias)', () => {
      render(
        <TabGroup defaultValue="a">
          <TabItem value="a" icon={<span data-testid="icon">▶</span>} badge={<span data-testid="badge">3</span>}>
            A
          </TabItem>
        </TabGroup>,
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('start/end take precedence over icon/badge', () => {
      render(
        <TabGroup defaultValue="a">
          <TabItem
            value="a"
            icon={<span>old-icon</span>}
            start={<span data-testid="new-start">new-start</span>}
          >
            A
          </TabItem>
        </TabGroup>,
      );
      expect(screen.getByTestId('new-start')).toBeInTheDocument();
      expect(screen.queryByText('old-icon')).not.toBeInTheDocument();
    });
  });

  describe('DOM structure (Figma parity)', () => {
    it('renders state-layer + content-wrapper (hover + selected indicator live elsewhere)', () => {
      render(
        <TabGroup defaultValue="a">
          <TabItem value="a">A</TabItem>
        </TabGroup>,
      );
      const tab = screen.getByRole('tab');
      // state-layer is the first span child
      const stateLayer = tab.querySelector('span');
      expect(stateLayer).not.toBeNull();
      // content-wrapper nested inside state-layer
      const contentWrapper = stateLayer?.querySelector('span');
      expect(contentWrapper).not.toBeNull();
      expect(contentWrapper?.textContent).toBe('A');
      // no per-tab indicator element; hover = label colour shift, selected = list-level indicator
      expect(tab.querySelectorAll('[aria-hidden="true"]').length).toBe(0);
    });

    it('renders the animated list-level selected indicator', () => {
      const { container } = render(
        <TabGroup defaultValue="a">
          <TabItem value="a">A</TabItem>
          <TabItem value="b">B</TabItem>
        </TabGroup>,
      );
      // BaseTabs.Indicator sets data-activation-direction on its element.
      const listLevel = container.querySelector('[role="tablist"] [data-activation-direction]');
      expect(listLevel).not.toBeNull();
    });
  });

  describe('Accessibility', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when an icon-only tab has no aria-label', () => {
      render(
        <TabGroup defaultValue="a">
          <TabItem value="a" icon={<span>▶</span>} />
        </TabGroup>,
      );
      expect(warnSpy).toHaveBeenCalled();
    });

    it('does not warn when aria-label is provided for icon-only', () => {
      render(
        <TabGroup defaultValue="a">
          <TabItem value="a" icon={<span>▶</span>} aria-label="Play" />
        </TabGroup>,
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
