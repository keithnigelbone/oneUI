/**
 * ChatComposer.stories.tsx
 *
 * Reusable prompt-first input shared by the home landing, voice playground,
 * and future agent surfaces. Controlled — caller owns `value` + handles submit.
 * Enter submits; Shift+Enter inserts newline.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import React, { useState } from 'react';
import { ChatComposer } from './ChatComposer';
import { Button } from '../Button/Button';
import { Surface } from '../Surface';
import { Icon } from '../../icons/Icon';
import type { SuggestionChip } from './ChatComposer.shared';

// ─── Controlled wrapper (stories need local state) ────────────────────────────

function Controlled(
  props: Omit<React.ComponentProps<typeof ChatComposer>, 'value' | 'onChange' | 'onSubmit'> & {
    onSubmit?: (v: string) => void;
  },
) {
  const [value, setValue] = useState('');
  return (
    <ChatComposer
      {...props}
      value={value}
      onChange={setValue}
      onSubmit={(v) => {
        props.onSubmit?.(v);
        setValue('');
      }}
    />
  );
}

// ─── Reusable suggestion chips ────────────────────────────────────────────────

const CHIPS: SuggestionChip[] = [
  { id: 'brand', label: 'Design a brand', icon: <Icon name="palette" aria-hidden />, onClick: () => {} },
  { id: 'component', label: 'Build a component', icon: <Icon name="components" aria-hidden />, onClick: () => {} },
  { id: 'canvas', label: 'Open canvas', icon: <Icon name="canvas" aria-hidden />, onClick: () => {} },
  { id: 'explain', label: 'Explain design tokens', icon: <Icon name="sparkles" aria-hidden />, onClick: () => {} },
];

// ─── Slot content helpers ─────────────────────────────────────────────────────

const AttachButton = () => (
  <Button attention="low" size="xs" appearance="neutral" aria-label="Attach file">
    <Icon name="add" aria-hidden />
  </Button>
);

const SendButton = ({ disabled }: { disabled?: boolean }) => (
  <Button attention="high" size="xs" disabled={disabled} aria-label="Send message">
    <Icon name="arrowUp" aria-hidden />
  </Button>
);

const MicButton = () => (
  <Button attention="low" size="xs" appearance="neutral" aria-label="Voice input">
    <Icon name="microphone" aria-hidden />
  </Button>
);

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ChatComposer> = {
  title: 'Components/Inputs/ChatComposer [WIP]',
  component: ChatComposer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Prompt-first textarea with an optional action bar and suggestion chips. Controlled — caller owns `value` and handles submit. Enter submits; Shift+Enter inserts a newline.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatComposer>;

// ─── 1. Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => <Controlled placeholder="How can I help you today?" />,
};

// ─── 2. With Suggestions ──────────────────────────────────────────────────────

export const WithSuggestions: Story = {
  name: 'With Suggestions',
  render: () => <Controlled suggestions={CHIPS} />,
};

// ─── 3. With Action Bar ───────────────────────────────────────────────────────

export const WithActionBar: Story = {
  name: 'With Action Bar',
  render: () => (
    <Controlled
      leading={<AttachButton />}
      modelLabel="Sonnet 4.6"
      trailing={
        <div style={{ display: 'flex', gap: 'var(--Spacing-2)' }}>
          <MicButton />
          <SendButton />
        </div>
      }
    />
  ),
};

// ─── 4. Full — suggestions + action bar ──────────────────────────────────────

export const Full: Story = {
  name: 'Full (Suggestions + Action Bar)',
  render: () => (
    <Controlled
      suggestions={CHIPS}
      leading={<AttachButton />}
      modelLabel="Sonnet 4.6"
      trailing={
        <div style={{ display: 'flex', gap: 'var(--Spacing-2)' }}>
          <MicButton />
          <SendButton />
        </div>
      }
    />
  ),
};

// ─── 5. Disabled ──────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Controlled
      disabled
      suggestions={CHIPS}
      leading={<AttachButton />}
      modelLabel="Sonnet 4.6"
      trailing={
        <div style={{ display: 'flex', gap: 'var(--Spacing-2)' }}>
          <MicButton />
          <SendButton disabled />
        </div>
      }
    />
  ),
};

// ─── 6. Surface Context ───────────────────────────────────────────────────────

export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => {
    const labelStyle: React.CSSProperties = {
      fontSize: 'var(--Label-S-FontSize)',
      lineHeight: 'var(--Label-S-LineHeight)',
      color: 'var(--Text-Low)',
    };
    const cellStyle: React.CSSProperties = {
      padding: 'var(--Spacing-5)',
      borderRadius: 'var(--Shape-4-5)',
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {(
          [
            { mode: 'default', desc: 'page background' },
            { mode: 'subtle', desc: 'tinted section' },
            { mode: 'bold', desc: 'accent hero' },
          ] as const
        ).map(({ mode, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={labelStyle}>{mode} — {desc}</span>
            <Surface mode={mode} style={cellStyle}>
              <Controlled suggestions={CHIPS.slice(0, 2)} />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// ─── 7. Placeholder variants ──────────────────────────────────────────────────

export const Placeholders: Story = {
  name: 'Placeholder Variants',
  render: () => {
    const labelStyle: React.CSSProperties = {
      fontSize: 'var(--Label-XS-FontSize)',
      lineHeight: 'var(--Label-XS-LineHeight)',
      color: 'var(--Text-Low)',
    };
    const placeholders = [
      { label: 'Default', text: 'How can I help you today?' },
      { label: 'Agent', text: 'Ask the design agent anything…' },
      { label: 'Search-style', text: 'Search or ask a question' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {placeholders.map(({ label, text }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
            <span style={labelStyle}>{label}</span>
            <Controlled placeholder={text} />
          </div>
        ))}
      </div>
    );
  },
};

// ─── 8. Interactive (play test) ───────────────────────────────────────────────

export const Interactive: Story = {
  render: () => <Controlled suggestions={CHIPS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Chat message' });

    await expect(textarea).toBeInTheDocument();

    // Type a message
    await userEvent.click(textarea);
    await userEvent.type(textarea, 'Build me a hero section');
    await expect(textarea).toHaveValue('Build me a hero section');

    // Shift+Enter inserts newline, does NOT submit
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await expect(textarea).toHaveValue('Build me a hero section\n');

    // Enter submits and clears
    await userEvent.type(textarea, 'More text');
    await userEvent.keyboard('{Enter}');
    await expect(textarea).toHaveValue('');
  },
};
