/**
 * Avatar.stories.tsx
 * Storybook documentation for Avatar component
 *
 * Mirrors the platform docs page (AvatarPageContent.tsx):
 * - Same section structure and naming
 * - Surface context uses <Surface> component for proper CSS cascade remapping
 *   (matches AvatarPreview.tsx and Button.stories.tsx patterns)
 * - Same attention level × variant layout
 * - Brand CSS tokens provided by BrandStyleDecorator (select a brand in toolbar)
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Avatar } from './Avatar';
import { Surface } from '../Surface';
import { computeResponsiveDensityOverrides } from '@oneui/shared';
import type { BreakpointId, DensityId } from '@oneui/shared';
import React from 'react';
import {
  AvatarVariants,
  AvatarAttentionLevels,
  AvatarSizes,
  AvatarStates,
  AvatarImageFallback,
} from './Avatar.showcase';

type AvatarStoryArgs = {
  content?: 'image' | 'icon' | 'text';
  size?: string;
  attention?: 'high' | 'medium' | 'low';
  appearance?: string;
  src?: string;
  alt?: string;
  disabled?: boolean;
  customSize?: number;
};

/** IcProfile icon — matches Figma's Avatar icon variant (filled person silhouette) */
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"
      clipRule="evenodd"
    />
  </svg>
);

/** Shared label style matching platform docs page */
const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  color: 'var(--Text-Low)',
};

const rowLabelStyle: React.CSSProperties = {
  ...labelStyle,
  minWidth: 'var(--Spacing-9)',
  margin: 0,
};

const SAMPLE_IMAGE = 'https://i.pravatar.cc/150?img=3';

/** All 9 appearance roles */
const ALL_ROLES = ['primary', 'neutral', 'secondary', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'] as const;

/**
 * Default roles shown in Appearances story — matches platform's typical brand config.
 * Sparkle and Brand-Bg are excluded because most brands don't configure them,
 * and unconfigured roles fall back to generic Surface tokens (dark/grey).
 * To see all roles, select a brand that has all 9 configured.
 */
const DEFAULT_APPEARANCE_ROLES = ['primary', 'neutral', 'secondary', 'positive', 'negative', 'warning', 'informative'] as const;

const meta = {
  title: 'Components/Data Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Visual representation of a user or entity. Supports image, icon, and text (initials) content modes with multi-accent appearance roles and attention levels.',
      },
    },
  },
  argTypes: {
    content: {
      control: 'radio',
      options: ['image', 'icon', 'text'],
      description: 'Display content: image, icon, or text (initials). Matches Figma property `content`.',
      table: { defaultValue: { summary: 'image' } },
    },
    size: {
      control: 'select',
      options: ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', 'custom'],
      description: 'Size preset',
      table: { defaultValue: { summary: 'm' } },
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — High (filled), Medium (tinted), Low (transparent)',
      table: { defaultValue: { summary: 'high' } },
    },
    appearance: {
      control: 'radio',
      options: ['auto', ...ALL_ROLES],
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<AvatarStoryArgs>;

// ============================================================================
// 1. Default
// ============================================================================
export const Default: Story = {
  args: {
    content: 'image',
    src: SAMPLE_IMAGE,
    alt: 'John Doe',
    size: 'm',
    attention: 'high',
  },
};

// ============================================================================
// 2. Variants — mirrors platform "Variants" card
// ============================================================================
export const Variants: Story = {
  name: 'Variants',
  render: () => <AvatarVariants />,
};

// ============================================================================
// 3. Attention Levels — mirrors platform "Attention Levels" card
// ============================================================================
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => <AvatarAttentionLevels />,
};

// ============================================================================
// 4. Sizes — mirrors platform "Sizes" card (all 3 variants × all sizes)
// ============================================================================
export const Sizes: Story = {
  name: 'Sizes',
  render: () => <AvatarSizes />,
};

// ============================================================================
// 5. Appearance Roles — mirrors platform "Appearance Roles" card
// ============================================================================
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {DEFAULT_APPEARANCE_ROLES.map((role) => (
        <div
          key={role}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}
        >
          <span style={{ ...rowLabelStyle, minWidth: 'var(--Spacing-16)' }}>{role}</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
            <Avatar content="icon" alt="User" size="xl" appearance={role} attention="high" icon={<PersonIcon />} />
            <Avatar content="icon" alt="User" size="xl" appearance={role} attention="medium" icon={<PersonIcon />} />
            <Avatar content="icon" alt="User" size="xl" appearance={role} attention="low" icon={<PersonIcon />} />
            <Avatar content="text" alt="JS" size="xl" appearance={role} attention="high" />
            <Avatar content="text" alt="JS" size="xl" appearance={role} attention="medium" />
            <Avatar content="text" alt="JS" size="xl" appearance={role} attention="low" />
          </div>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// 5b. Metallic Material — simulates a brand material assignment. The brand
// engine emits --{Role}-Material-Fill / --{Role}-Material-Text only when the
// role has an active metal assigned (Materials foundation → Metals tab +
// Appearance → material assignments). High-attention avatars then pick the
// metallic fill via the --_av-material-* fallback chain; medium/low and
// image avatars are unaffected.
// ============================================================================
export const MetallicMaterial: Story = {
  name: 'Metallic Material',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {([
        ['Gold', 'Gold'],
        ['Silver', 'Silver'],
        ['Bronze', 'Bronze'],
      ] as const).map(([label, metal]) => (
        <div
          key={metal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--Spacing-3-5)',
            '--Primary-Material-Fill': `var(--Material-Metallic-${metal}-Fill)`,
            '--Primary-Material-Text': `var(--Material-Metallic-${metal}-Text)`,
          } as React.CSSProperties}
        >
          <span style={{ ...rowLabelStyle, minWidth: 'var(--Spacing-16)' }}>{label}</span>
          <Avatar content="icon" alt="User" size="xl" attention="high" icon={<PersonIcon />} />
          <Avatar content="text" alt="JS" size="xl" attention="high" />
          <Avatar content="text" alt="JS" size="xl" attention="medium" />
          <Avatar content="text" alt="JS" size="xl" attention="low" />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// 6. Themes — all BG surface modes × attention levels (theme via toolbar)
// ============================================================================
export const Themes: Story = {
  name: 'Themes',
  render: () => {
    const bgModes = [
      { mode: 'default' as const, label: 'default' },
      { mode: 'minimal' as const, label: 'minimal' },
      { mode: 'subtle' as const, label: 'subtle' },
      { mode: 'elevated' as const, label: 'elevated' },
    ];

    const cellStyle: React.CSSProperties = {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-3-5)',
      padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {bgModes.map(({ mode, label }) => (
          <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
            <span style={{ ...rowLabelStyle, width: 80 }}>{label}</span>
            <Surface mode={mode} style={cellStyle}>
              <Avatar content="icon" alt="User" size="xl" attention="high" icon={<PersonIcon />} />
              <Avatar content="icon" alt="User" size="xl" attention="medium" icon={<PersonIcon />} />
              <Avatar content="icon" alt="User" size="xl" attention="low" icon={<PersonIcon />} />
              <Avatar content="text" alt="JS" size="xl" attention="high" />
              <Avatar content="text" alt="JS" size="xl" attention="medium" />
              <Avatar content="text" alt="JS" size="xl" attention="low" />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// 7. Surface Context — standard backgrounds + accent surfaces
// ============================================================================
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

    const surfaceStyle: React.CSSProperties = {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-3-5)',
      padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)',
    };

    const avatarContent = (
      <>
        <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="xl" attention="high" />
        <Avatar content="icon" alt="User" size="xl" attention="high" icon={<PersonIcon />} />
        <Avatar content="icon" alt="User" size="xl" attention="medium" icon={<PersonIcon />} />
        <Avatar content="icon" alt="User" size="xl" attention="low" icon={<PersonIcon />} />
        <Avatar content="text" alt="JS" size="xl" attention="high" />
        <Avatar content="text" alt="JS" size="xl" attention="medium" />
        <Avatar content="text" alt="JS" size="xl" attention="low" />
      </>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={labelStyle}>{label} — {desc}</span>
            <Surface mode={mode} style={surfaceStyle}>
              {avatarContent}
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// 8. States — mirrors platform "States" card (larger 2XL, all variants)
// ============================================================================
export const States: Story = {
  render: () => <AvatarStates />,
};

// ============================================================================
// 9. Image Fallback — mirrors platform "Image Fallback" card
// ============================================================================
export const ImageFallback: Story = {
  name: 'Image Fallback',
  render: () => <AvatarImageFallback />,
};

// ============================================================================
// 10. With Icons — different icon shapes, all using primary appearance
// Note: appearance-specific icons belong in the Appearances story. Mixing
// appearance roles here previously caused inconsistent rendering when a brand
// hadn't configured sparkle/positive — those roles fall back to grey.
// ============================================================================
export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
      <Avatar content="icon" alt="User" size="xl" icon={<PersonIcon />} />
      <Avatar content="icon" alt="Star" size="xl" icon={
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      } />
      <Avatar content="icon" alt="Check" size="xl" icon={
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      } />
    </div>
  ),
};

// ============================================================================
// 11. Density — compact/default/open with full cascade isolation
// ============================================================================
export const Density: Story = {
  render: () => {
    const platform: BreakpointId = 'S';
    const densities: { id: DensityId; label: string }[] = [
      { id: 'compact', label: 'compact' },
      { id: 'default', label: 'default' },
      { id: 'open', label: 'open' },
    ];

    return (
      <div style={{ display: 'flex', gap: 'var(--Spacing-5)' }}>
        {densities.map(({ id, label }) => (
          <div
            key={id}
            className="density-card"
            data-density={id}
            data-Breakpoint={platform}
            data-6-Density={id}
            style={computeResponsiveDensityOverrides(platform, id)}
          >
            <span style={labelStyle}>{label}</span>
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
              <Avatar content="icon" alt="User" size="s" icon={<PersonIcon />} />
              <Avatar content="icon" alt="User" size="m" icon={<PersonIcon />} />
              <Avatar content="icon" alt="User" size="l" icon={<PersonIcon />} />
              <Avatar content="icon" alt="User" size="xl" icon={<PersonIcon />} />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// 12. Interactive — play function test
// ============================================================================
export const Interactive: Story = {
  args: {
    content: 'text',
    alt: 'John Doe',
    size: 'xl',
    attention: 'high',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img');
    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveAttribute('aria-label', 'John Doe');
    await expect(avatar).toHaveAttribute('data-content', 'text');
    await expect(avatar).toHaveAttribute('data-size', 'xl');
    await expect(avatar).toHaveAttribute('data-attention', 'high');
    // Verify initials are rendered: 'John Doe' → 'JD'
    await expect(avatar).toHaveTextContent('JD');
  },
};

// ============================================================================
// 13. Responsive — viewport testing
// ============================================================================
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size={size} />
          <Avatar content="icon" alt="User" size={size} icon={<PersonIcon />} />
          <Avatar content="text" alt="JS" size={size} />
        </div>
      ))}
    </div>
  ),
};
