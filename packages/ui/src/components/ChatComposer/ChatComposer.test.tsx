/**
 * ChatComposer.test.tsx
 *
 * Behavioural tests for the reusable chat composer. Covers the two pieces
 * the component actually owns: controlled state + submit semantics, and
 * the suggestion chip click-through.
 */

import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatComposer } from './ChatComposer';
import type { SuggestionChip } from './ChatComposer.shared';

function Controlled({
  onSubmit,
  suggestions,
  disabled = false,
}: {
  onSubmit?: (v: string) => void;
  suggestions?: SuggestionChip[];
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  return (
    <ChatComposer
      value={value}
      onChange={setValue}
      onSubmit={(v) => {
        onSubmit?.(v);
        setValue('');
      }}
      suggestions={suggestions}
      disabled={disabled}
      data-testid="composer"
    />
  );
}

describe('ChatComposer', () => {
  it('renders the placeholder and an empty textarea', () => {
    render(<Controlled />);
    const textarea = screen.getByLabelText('Chat message') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('');
    expect(textarea.placeholder).toBe('How can I help you today?');
  });

  it('submits on Enter and clears on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    const textarea = screen.getByLabelText('Chat message');

    await user.type(textarea, 'Build me a hero section{Enter}');

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith('Build me a hero section');
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('does not submit on Shift+Enter — inserts a newline instead', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    const textarea = screen.getByLabelText('Chat message');

    await user.type(textarea, 'line 1{Shift>}{Enter}{/Shift}line 2');

    expect(onSubmit).not.toHaveBeenCalled();
    expect((textarea as HTMLTextAreaElement).value).toBe('line 1\nline 2');
  });

  it('does not submit whitespace-only input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    const textarea = screen.getByLabelText('Chat message');

    await user.type(textarea, '   {Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the textarea when `disabled` is true', () => {
    render(<Controlled disabled />);
    const textarea = screen.getByLabelText('Chat message');
    expect(textarea).toBeDisabled();
  });

  it('renders suggestion chips and fires onClick', async () => {
    const user = userEvent.setup();
    const buildClick = vi.fn();
    const designClick = vi.fn();
    render(
      <Controlled
        suggestions={[
          { id: 'build', label: 'Build an app', onClick: buildClick },
          { id: 'design', label: 'Design a brand', onClick: designClick },
        ]}
      />,
    );

    const buildChip = screen.getByRole('button', { name: 'Build an app' });
    const designChip = screen.getByRole('button', { name: 'Design a brand' });
    expect(buildChip).toBeInTheDocument();
    expect(designChip).toBeInTheDocument();

    await user.click(buildChip);
    expect(buildClick).toHaveBeenCalledOnce();
    expect(designClick).not.toHaveBeenCalled();
  });

  it('renders the model chip label when provided', () => {
    render(
      <ChatComposer
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        modelLabel="Sonnet 4.6"
      />,
    );
    expect(screen.getByText('Sonnet 4.6')).toBeInTheDocument();
  });

  it('renders trailing slot content', () => {
    render(
      <ChatComposer
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        trailing={<button type="button">Send</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });
});
