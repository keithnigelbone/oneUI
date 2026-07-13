/**
 * RadioField.test.tsx
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RadioField } from './RadioField';
import { Radio } from '../Radio/Radio';

/** Multi-option radios use sibling labels — query by role count + JSX order (see Radio.test.tsx). */
function radiosInGroup(group: HTMLElement) {
  return within(group).getAllByRole('radio');
}

describe('RadioField', () => {
  it('renders group label and options', () => {
    render(
      <RadioField label="Pick one" name="x" defaultValue="a">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioField>,
    );
    const group = screen.getByRole('group', { name: 'Pick one' });
    expect(group).toBeInTheDocument();
    expect(within(group).getByRole('radiogroup')).toBeInTheDocument();
    expect(radiosInGroup(group)).toHaveLength(2);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('changes selection', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <RadioField label="Pick" name="y" onValueChange={handle}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioField>,
    );
    const group = screen.getByRole('group', { name: 'Pick' });
    const [, second] = radiosInGroup(group);
    await user.click(second);
    expect(handle).toHaveBeenCalledWith('b');
  });

  it('renders integrated single option with field label and no Radio child', () => {
    render(<RadioField label="Notifications" name="n" defaultValue="on" />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.queryByText('Push alerts')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('integrated single toggles off when re-clicking the selected control (uncontrolled)', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(<RadioField label="Enable" name="e" defaultValue="on" onValueChange={handle} />);
    const radio = screen.getByRole('radio', { name: 'Enable' });
    expect(radio).toHaveAttribute('aria-checked', 'true');
    await user.click(radio);
    expect(handle).toHaveBeenLastCalledWith('');
    expect(radio).toHaveAttribute('aria-checked', 'false');
    await user.click(radio);
    expect(handle).toHaveBeenLastCalledWith('on');
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });

  it('flattens Fragment children so all radios render', () => {
    render(
      <RadioField label="Contact" name="c" defaultValue="a">
        <>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </>
      </RadioField>,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('forwards aria-label to the radiogroup when there is no visible label', () => {
    render(<RadioField aria-label="Select prepaid plan" name="plan" />);
    expect(screen.getByRole('radiogroup', { name: 'Select prepaid plan' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Select prepaid plan' })).toBeInTheDocument();
  });

  it('forwards required to the integrated single radio', () => {
    render(<RadioField label="Select Plan" name="req" required />);
    expect(screen.getByRole('radio', { name: 'Select Plan' })).toHaveAttribute('aria-required', 'true');
  });

  it('forwards readOnly with aria-readonly on the integrated single radio', () => {
    render(<RadioField label="Locked" name="ro" readOnly defaultValue="on" />);
    const radio = screen.getByRole('radio', { name: 'Locked' });
    expect(radio).toHaveAttribute('aria-readonly', 'true');
    expect(radio).toHaveAttribute('data-readonly', '');
  });

  it('forwards required to multi-option radios', () => {
    render(
      <RadioField label="Pick" name="multi-req" required defaultValue="a">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioField>,
    );
    const group = screen.getByRole('group', { name: 'Pick' });
    for (const radio of radiosInGroup(group)) {
      expect(radio).toHaveAttribute('aria-required', 'true');
    }
  });
});
