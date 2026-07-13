/**
 * Text.stories.tsx
 *
 * Storybook stories for the design-system Text component.
 *
 * Eight stories per the CLAUDE.md storybook rule. Brand globals
 * (selectable in the Storybook toolbar) drive font slot, weights, and
 * colour scale through useBrandCSS — every story re-renders against
 * the active brand without code changes.
 */

import type { Meta, StoryObj, Decorator } from '@storybook/react-vite';
import React from 'react';
import { TYPOGRAPHY_SIZES } from '@oneui/shared';
import { Text } from './Text';
import { Surface } from '../Surface';
import {
  TEXT_APPEARANCES,
  TEXT_ATTENTIONS,
  TEXT_VARIANTS,
  TEXT_WEIGHTS,
  type TextAppearance,
  type TextVariant,
} from './Text.shared';
import {
  TextVariants,
  TextSizes,
  TextAttentionAndWeight,
  TextAppearances,
  TextDecorations,
} from './Text.showcase';

const textSizesFor = (variant: TextVariant) => [...TYPOGRAPHY_SIZES[variant]] as string[];

const withScopedTextSize: Decorator = (Story, context) => {
  const variant = (context.args.variant ?? 'body') as TextVariant;
  const sizes = textSizesFor(variant);
  const sizeArgType = context.argTypes?.size as { options?: string[] } | undefined;
  if (sizeArgType) sizeArgType.options = sizes;

  const current = context.args.size as string | undefined;
  if (current === undefined || !sizes.includes(current)) {
    (context.args as { size?: string }).size = sizes.includes('M') ? 'M' : sizes[0];
  }
  return <Story />;
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Body-XS-FontSize)',
  lineHeight: 'var(--Body-XS-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  fontFamily: 'var(--Typography-Font-Text)',
  color: 'var(--Text-Low)',
  margin: 0,
};

const meta = {
  title: 'Components/Display/Text',
  component: Text,
  decorators: [withScopedTextSize],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inline / block text spanning all 6 typography roles, role-specific size scales, canonical multi-accent appearance, attention levels, and surface-context-aware colour. Defaults to `span`; pass `as` for headings (`h1`–`h6`) or anchors. Resolves through OneUI V2 typography tokens.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: TEXT_VARIANTS },
    size: { control: 'select', options: textSizesFor('body') },
    weight: { control: 'select', options: TEXT_WEIGHTS },
    attention: { control: 'select', options: TEXT_ATTENTIONS },
    appearance: {
      control: 'select',
      options: ['auto', ...TEXT_APPEARANCES] as TextAppearance[],
    },
    italic: { control: 'boolean' },
    underline: { control: 'boolean' },
    strikethrough: { control: 'boolean' },
    language: { control: 'select', options: ['latin', 'others'] },
    textAlign: { control: 'inline-radio', options: ['left', 'center', 'right'] },
    maxLines: { control: 'number' },
    href: { control: 'text' },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof Text>;

// 1. Default — single playable instance for argTypes panel
export const Default: Story = {
  args: {
    variant: 'body',
    size: 'M',
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

// 2. Variants — every typography role at default size
export const Variants: Story = {
  render: () => <TextVariants />,
};

// 3. Sizes — Body across every public size
export const Sizes: Story = {
  render: () => <TextSizes />,
};

// 4. Attention & Weight — colour prominence × weight emphasis
export const AttentionAndWeight: Story = {
  name: 'Attention & Weight',
  render: () => <TextAttentionAndWeight />,
};

// 5. Appearances — all roles at high and tintedA11y attention
export const Appearances: Story = {
  render: () => <TextAppearances />,
};

// 6. Decorations — italic / underline / strikethrough / combined
export const Decorations: Story = {
  render: () => <TextDecorations />,
};

// 7. SurfaceContext — every surface mode shows automatic on-colour adaptation
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => {
    const surfaceModes = [
      { mode: 'default' as const, desc: 'page background' },
      { mode: 'minimal' as const, desc: 'light tint' },
      { mode: 'subtle' as const, desc: 'medium tint' },
      { mode: 'moderate' as const, desc: 'heavier tint' },
      { mode: 'bold' as const, desc: 'full accent fill' },
      { mode: 'elevated' as const, desc: 'floating panel' },
    ];

    const surfaceStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--Spacing-3)',
      padding: 'var(--Spacing-4-5)',
      borderRadius: 'var(--Shape-M)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, desc }) => (
          <div
            key={mode}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}
          >
            <span style={labelStyle}>
              {mode} — {desc}
            </span>
            <Surface mode={mode} style={surfaceStyle}>
              <Text variant="title" size="M" attention="high" as="div">
                Title — high attention
              </Text>
              <Text variant="body" size="M" attention="medium" as="div">
                Body — medium attention
              </Text>
              <Text variant="body" size="S" attention="low" as="div">
                Caption — low attention
              </Text>
              <Text variant="label" size="S" attention="tintedA11y" appearance="primary" as="div">
                Label — tintedA11y primary
              </Text>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 8. Truncation, alignment, link slot, explicit heading
export const TruncationAlignmentAndLink: Story = {
  name: 'Truncation, Alignment & Link',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
        <span style={labelStyle}>Explicit heading (`as=&quot;h1&quot;`)</span>
        <Text as="h1" variant="display" size="L">
          Semantic page title
        </Text>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
        <span style={labelStyle}>maxLines = 1 (single-line ellipsis)</span>
        <div style={{ maxWidth: 'var(--Spacing-40)' }}>
          <Text as="p" maxLines={1}>
            This text overflows the container and should truncate with an ellipsis after a single
            line of content.
          </Text>
        </div>

        <span style={labelStyle}>maxLines = 3 (multi-line clamp)</span>
        <div style={{ maxWidth: 'var(--Spacing-40)' }}>
          <Text as="p" maxLines={3}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
        <span style={labelStyle}>textAlign</span>
        <Text as="p" textAlign="left">
          Left-aligned paragraph.
        </Text>
        <Text as="p" textAlign="center">
          Centred paragraph.
        </Text>
        <Text as="p" textAlign="right">
          Right-aligned paragraph.
        </Text>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
        <span style={labelStyle}>link slot (`_linkText-slot`)</span>
        <Text as="p">
          Read more in the{' '}
          <Text as="a" href="#" appearance="primary" attention="tintedA11y" underline>
            documentation
          </Text>{' '}
          before continuing.
        </Text>
      </section>
    </div>
  ),
};
