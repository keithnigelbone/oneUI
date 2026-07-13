import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils/a11y';
import { FAB } from './FAB/FAB';
import { Tabs } from './Tabs/Tabs';
import { Select } from './Select/Select';
import { SegmentedControl } from './SegmentedControl/SegmentedControl';
import { Switch } from './Switch/Switch';
import { Dialog, DialogTrigger, DialogPortal, DialogClose } from './Dialog/Dialog';
import { Chip } from './Chip/Chip';
import { PaginationDots } from './PaginationDots/PaginationDots';
import { Tooltip } from './Tooltip/Tooltip';
import { IconButton } from './IconButton/IconButton';

const selectOptions = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'fiber', label: 'Fiber' },
  { value: 'finance', label: 'Finance' },
];

describe('component adoption accessibility gate', () => {
  it('covers icon-only FABs with explicit names', async () => {
    const { container } = render(<FAB icon="add" aria-label="Create item" />);

    expect(screen.getByRole('button', { name: 'Create item' })).toBeTruthy();
    await expectNoA11yViolations(container);
  });

  it('covers icon-only tabs when every tab has an accessible name', async () => {
    const { container } = render(
      <Tabs defaultValue="home">
        <Tabs.List>
          <Tabs.Item value="home" icon={<span aria-hidden="true">H</span>} aria-label="Home" />
          <Tabs.Item value="search" icon={<span aria-hidden="true">S</span>} aria-label="Search" />
        </Tabs.List>
        <Tabs.Panel value="home">Home panel</Tabs.Panel>
        <Tabs.Panel value="search">Search panel</Tabs.Panel>
      </Tabs>,
    );

    expect(screen.getAllByRole('tab')).toHaveLength(2);
    await expectNoA11yViolations(container);
  });

  it('covers searchable Select with a named trigger and filter input', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Select
        value="mobile"
        onChange={vi.fn()}
        options={selectOptions}
        searchable
        aria-label="Service category"
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Service category' }));
    expect(screen.getByLabelText('Filter options', { selector: 'input' })).toBeTruthy();
    await expectNoA11yViolations(baseElement);
  });

  it('covers labeled segmented controls', async () => {
    const { container } = render(
      <SegmentedControl value="list" onValueChange={vi.fn()} aria-label="View mode">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );

    expect(screen.getByRole('group', { name: 'View mode' })).toBeTruthy();
    await expectNoA11yViolations(container);
  });

  it('covers switches with visible labels', async () => {
    const { container } = render(<Switch defaultChecked>Notifications</Switch>);

    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeTruthy();
    await expectNoA11yViolations(container);
  });

  it('covers dialogs with title and description', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Dialog>
        <DialogTrigger>Open preferences</DialogTrigger>
        <DialogPortal title="Preferences" description="Update display settings">
          <DialogClose>Done</DialogClose>
        </DialogPortal>
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Open preferences' }));
    expect(screen.getByRole('dialog', { name: 'Preferences' })).toBeTruthy();
    await expectNoA11yViolations(baseElement);
  });

  it('covers textless chips with explicit names', async () => {
    const { container } = render(
      <Chip aria-label="Filter by premium" start={<span aria-hidden="true">P</span>} />,
    );

    expect(screen.getByRole('button', { name: 'Filter by premium' })).toBeTruthy();
    await expectNoA11yViolations(container);
  });

  it('covers pagination dots with a named tablist', async () => {
    const { container } = render(<PaginationDots pageCount={5} aria-label="Featured carousel pages" />);

    expect(screen.getByRole('tablist', { name: 'Featured carousel pages' })).toBeTruthy();
    await expectNoA11yViolations(container);
  });

  it('covers tooltip pairings without relying on tooltip text as the control name', async () => {
    const { baseElement } = render(
      <Tooltip content="Delete this item" defaultOpen>
        <IconButton icon="delete" aria-label="Delete item" attention="low" appearance="negative" />
      </Tooltip>,
    );

    expect(screen.getByRole('button', { name: 'Delete item' })).toBeTruthy();
    expect(screen.getByRole('tooltip').textContent).toBe('Delete this item');
    await expectNoA11yViolations(baseElement);
  });
});
