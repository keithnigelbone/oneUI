/**
 * CheckboxField.test.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CheckboxField } from './CheckboxField';
import { Checkbox } from '../Checkbox/Checkbox';
import { InputFeedback } from '../Input';

describe('CheckboxField', () => {
  it('renders label and checkbox', () => {
    render(<CheckboxField label="Accept" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  it('respects controlled checked', () => {
    render(<CheckboxField label="Opt-in" checked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders feedback', () => {
    render(
      <CheckboxField
        label="x"
        feedback={<InputFeedback attention="low">Note</InputFeedback>}
      />,
    );
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('calls onCheckedChange', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(<CheckboxField label="Toggle" onCheckedChange={handle} />);
    await user.click(screen.getByRole('checkbox'));
    expect(handle).toHaveBeenCalled();
  });

  it('renders field header above multiple checkbox options', () => {
    render(
      <CheckboxField label="Topics" description="Select all that apply" name="topics">
        <Checkbox value="a">Alpha</Checkbox>
        <Checkbox value="b">Beta</Checkbox>
      </CheckboxField>,
    );
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('Select all that apply')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('flattens Fragment children for multi-option mode', () => {
    render(
      <CheckboxField label="Pick" name="frag">
        <>
          <Checkbox value="x">X</Checkbox>
          <Checkbox value="y">Y</Checkbox>
        </>
      </CheckboxField>,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });
});
