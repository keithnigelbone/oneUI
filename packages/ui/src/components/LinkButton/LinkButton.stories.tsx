/**
 * LinkButton.stories.tsx
 * Storybook documentation for LinkButton component
 *
 * LinkButton = <button> with link-like styling (underline, accent text).
 * NOT a navigation element — use Link for actual <a> navigation.
 *
 * Uses Figma terminology: Attention (High/Medium/Low) instead of variant (bold/subtle/ghost).
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { LinkButton } from './LinkButton';
import { Surface } from '../Surface';
import { computeResponsiveDensityOverrides } from '@oneui/shared';
import type { BreakpointId, DensityId } from '@oneui/shared';
import React from 'react';
import {
  LinkButtonAttentionLevels,
  LinkButtonSizes,
  LinkButtonStates,
  LinkButtonFocusState,
  LinkButtonWithSlots,
} from './LinkButton.showcase';

// Placeholder icon for slot controls — no inline size styles so the LinkButton's
// .start svg / .end svg CSS rules (--LinkButton-iconSize tokens) control the size.
const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 3v2H5v14h14v-9h2v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h10zm7 0v6h-2V6.413l-7.293 7.294-1.414-1.414L17.585 5H15V3h6z" fill="currentColor" />
  </svg>
);

type LinkButtonStoryArgs = {
  children?: React.ReactNode;
  attention?: 'high' | 'medium' | 'low';
  size?: number | string;
  appearance?: string;
  start?: boolean;
  end?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

const meta = {
  title: 'Components/Actions/LinkButton',
  component: LinkButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button with link-like styling — transparent background, underline-based attention levels. Uses Base UI Button primitive (semantic <button>). NOT a navigation element — use Link for actual <a> navigation.',
      },
    },
  },
  argTypes: {
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — High (accent + underline), Medium (accent, no underline), Low (default text, no underline)',
      table: {
        defaultValue: { summary: 'high' },
      },
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'l'],
      description: 'LinkButton size — S (small), M (medium, default), L (large)',
      table: {
        defaultValue: { summary: 'm' },
      },
    },
    appearance: {
      control: 'radio',
      options: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
      description: 'Multi-accent appearance role',
      table: {
        defaultValue: { summary: 'auto' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    start: {
      control: 'boolean',
      description: 'Show start (left) icon slot',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    end: {
      control: 'boolean',
      description: 'Show end (right) icon slot',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
  },
};

export default meta;
type Story = StoryObj<LinkButtonStoryArgs>;

// 1. Default — with start/end slot toggles
export const Default: Story = {
  args: {
    children: 'LinkButton',
    attention: 'high',
    size: 'm',
    start: false,
    end: false,
  },
  render: ({ start: showStart, end: showEnd, children, ...args }: any) => (
    <LinkButton
      {...args}
      start={showStart ? <SlotIcon /> : undefined}
      end={showEnd ? <SlotIcon /> : undefined}
    >
      {children}
    </LinkButton>
  ),
};

// 2. Attention Levels (Figma: High / Medium / Low)
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => <LinkButtonAttentionLevels />,
};

// 3. Sizes — S/M/L
export const Sizes: Story = {
  name: 'Sizes',
  render: () => <LinkButtonSizes />,
};

// 4. States
export const States: Story = {
  render: () => <LinkButtonStates />,
};

// 4b. Focus State — force-renders the focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <LinkButtonFocusState />,
};

// 5. Appearances — all 9 multi-accent roles x 3 attention levels
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      {(['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'] as const).map((role) => (
        <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)', textTransform: 'capitalize' }}>

            {role}
          </span>
          <div className="story-row">
            <LinkButton appearance={role} attention="high">High</LinkButton>
            <LinkButton appearance={role} attention="medium">Medium</LinkButton>
            <LinkButton appearance={role} attention="low">Low</LinkButton>
          </div>
        </div>
      ))}
    </div>
  ),
};

// 6. With Slots (start/end)
export const WithSlots: Story = {
  name: 'With Start/End Slots',
  render: () => <LinkButtonWithSlots />,
};

// 7. Interactive
export const Interactive: Story = {
  args: {
    children: 'Click me',
    attention: 'high',
    size: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify button exists
    await expect(button).toBeInTheDocument();

    // Test click
    await userEvent.click(button);

    // Test keyboard navigation
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Test keyboard activation
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
  },
};

// 8. Responsive
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div className="story-column" style={{ width: '100%' }}>
      <div className="story-row">
        <LinkButton size="s" attention="high">Small</LinkButton>
        <LinkButton size="m" attention="high">Medium</LinkButton>
        <LinkButton size="l" attention="high">Large</LinkButton>
      </div>
      <div className="story-row">
        <LinkButton size="s" attention="low">Cancel</LinkButton>
        <LinkButton size="s" attention="high">Confirm</LinkButton>
      </div>
    </div>
  ),
};

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = { fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)' };

// 9. Themes — all BG surface modes x attention levels (theme via toolbar)
export const Themes: Story = {
  render: () => {
    const bgModes = [
      { mode: 'default' as const, label: 'default' },
      { mode: 'minimal' as const, label: 'minimal' },
      { mode: 'subtle' as const, label: 'subtle' },
      { mode: 'elevated' as const, label: 'elevated' },
    ];

    const cellStyle: React.CSSProperties = {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {bgModes.map(({ mode, label }) => (
          <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
            <span style={{ ...sectionLabelStyle, width: 90 }}>{label}</span>
            <Surface mode={mode} style={cellStyle}>
              <LinkButton attention="high">High</LinkButton>
              <LinkButton attention="medium">Medium</LinkButton>
              <LinkButton attention="low">Low</LinkButton>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 10. Surface Context — all 5 surface modes in a flat list
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => {
    const surfaceModes = [
      { mode: 'default' as const, label: 'default', desc: 'page background' },
      { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
      { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
      { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
      { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
      { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
    ];

    const contentStyle: React.CSSProperties = {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-5)', borderRadius: 'var(--Shape-4)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={sectionLabelStyle}>{label} — {desc}</span>
            <Surface mode={mode} style={contentStyle}>
              <LinkButton attention="high">high</LinkButton>
              <LinkButton attention="medium">medium</LinkButton>
              <LinkButton attention="low">low</LinkButton>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 11. Density — each card uses resolved dimension overrides for full cascade isolation
export const Density: Story = {
  render: () => {
    const platform: BreakpointId = 'S';
    const densities: { id: DensityId; label: string }[] = [
      { id: 'compact', label: 'compact' },
      { id: 'default', label: 'default' },
      { id: 'open', label: 'open' },
    ];

    return (
      <div className="story-row">
        {densities.map(({ id, label }) => (
          <div
            key={id}
            className="density-card"
            data-density={id}
            data-Breakpoint={platform}
            data-6-Density={id}
            style={computeResponsiveDensityOverrides(platform, id)}
          >
            <span>{label}</span>
            <div className="story-column">
              <LinkButton size="s">Small</LinkButton>
              <LinkButton size="m">Medium</LinkButton>
              <LinkButton size="l">Large</LinkButton>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// 12. Loading States — spinner combinations
export const LoadingStates: Story = {
  name: 'Loading States',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div className="story-row">
        <LinkButton loading attention="high">Loading</LinkButton>
        <LinkButton loading attention="medium">Loading</LinkButton>
        <LinkButton loading attention="low">Loading</LinkButton>
      </div>
      <div className="story-row">
        <LinkButton loading start={<SlotIcon />}>With Start</LinkButton>
        <LinkButton loading end={<SlotIcon />}>With End</LinkButton>
      </div>
      <div className="story-row">
        <LinkButton loading size="s">Small</LinkButton>
        <LinkButton loading size="m">Medium</LinkButton>
        <LinkButton loading size="l">Large</LinkButton>
      </div>
    </div>
  ),
};
