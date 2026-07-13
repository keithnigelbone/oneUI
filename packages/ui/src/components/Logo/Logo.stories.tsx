/**
 * Logo.stories.tsx
 *
 * Storybook stories for the Logo component.
 * Surface context mirrors IconContained.stories.tsx pattern.
 * Includes Convex-connected story showing real brand logos from the database.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Logo } from './Logo';
import { Surface } from '../Surface';
import { useBrandLogo } from '../../contexts/BrandLogoContext';
import type { LogoSize, LogoVariant } from './Logo.shared';
import {
  LogoImageFallback,
} from './Logo.showcase';

/** Fallback placeholder SVG (used when no brand logo is available) */
const FALLBACK_SVG = `<svg viewBox="0 0 100 100" fill="currentColor">
  <text x="50" y="62" font-size="48" font-weight="bold" text-anchor="middle" font-family="sans-serif">?</text>
</svg>`;

/** Hook: returns the brand logo SVG from Storybook context, or the fallback */
function useLogo() {
  const { logoSvg, brandName } = useBrandLogo();
  return { svg: logoSvg || FALLBACK_SVG, alt: brandName || 'Brand Logo', hasBrandLogo: !!logoSvg };
}

// Stories render `<Logo>` directly. The Storybook brand decorator populates
// BrandLogoContext, so `<Logo>` picks up the active brand's logo automatically
// (same fallback real apps get) — no wrapper component, and "Show code" shows `<Logo>`.

/** Shared label style matching other component stories */
const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  color: 'var(--Text-Low)',
};

const meta = {
  title: 'Components/Media/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['mark', 'full'],
    },
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl', 'custom'],
    },
    customSize: {
      control: 'number',
      if: { arg: 'size', eq: 'custom' },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof Logo>;

// 1. Default — uses brand logo from Convex when available
export const Default: Story = {
  render: () => <Logo size="m" alt="Brand Logo" />,
};

// 2. Variants — mark vs full
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      {(['mark', 'full'] as LogoVariant[]).map((variant) => (
        <div key={variant} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Logo variant={variant} size="xl" alt={`${variant} variant`} />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>{variant}</span>
        </div>
      ))}
    </div>
  ),
};

// 3. Sizes — all presets + custom
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
      {(['xs', 's', 'm', 'l', 'xl'] as LogoSize[]).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Logo size={size} alt="Brand Logo" />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)', textTransform: 'uppercase' }}>{size}</span>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Logo size="custom" customSize={48} alt="Brand Logo" />
        <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>custom (48px)</span>
      </div>
    </div>
  ),
};

// 4. Content Sources — children, svgContent, src
export const ContentSources: Story = {
  name: 'Content Sources',
  render: () => {
    const { svg } = useLogo();
    return (
      <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Logo alt="Children" size="xl">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </Logo>
          <span style={labelStyle}>children (JSX)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Logo alt="SVG Content" size="xl" svgContent={svg} />
          <span style={labelStyle}>svgContent</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Logo
            alt="External Image"
            size="xl"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='white'/%3E%3C/svg%3E"
          />
          <span style={labelStyle}>src (image)</span>
        </div>
      </div>
    );
  },
};

// 5. Surface Context — all 5 surface modes in a flat list
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

    const logoContent = (
      <>
        <Logo size="l" alt="Brand Logo" />
        <Logo size="xl" alt="Brand Logo" />
      </>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={labelStyle}>{label} — {desc}</span>
            <Surface mode={mode} style={surfaceStyle}>
              {logoContent}
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 6. Image Fallback
export const ImageFallback: Story = {
  name: 'Image Fallback',
  render: () => <LogoImageFallback />,
};

// 7. Interactive — with Storybook controls
export const Interactive: Story = {
  render: () => <Logo size="m" variant="mark" alt="Brand Logo" />,
};

// 8. Themes — light/dark comparison (auto via Storybook theme decorator)
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
        <span style={labelStyle}>All sizes</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
          {(['xs', 's', 'm', 'l', 'xl'] as LogoSize[]).map((size) => (
            <Logo key={size} size={size} alt="Brand Logo" />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
        <span style={labelStyle}>On bold surface</span>
        <Surface mode="bold" style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center', padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)' }}>
          {(['xs', 's', 'm', 'l', 'xl'] as LogoSize[]).map((size) => (
            <Logo key={size} size={size} alt="Brand Logo" />
          ))}
        </Surface>
      </div>
    </div>
  ),
};

