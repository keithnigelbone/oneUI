/**
 * LogoBrandLogos.stories.tsx
 *
 * Convex-connected Logo stories showing real brand logos from the database.
 * Lives in apps/storybook/ (not packages/ui/) because it imports convex/react.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Logo } from '@oneui/ui/components/Logo';
import type { LogoSize } from '@oneui/ui/components/Logo';

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  color: 'var(--Text-Low)',
};

const meta = {
  title: 'Components/Logo/Brand Logos (Convex) [WIP]',
  component: Logo,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Helper: renders all brand logos from Convex at every size */
function BrandLogosGrid() {
  const brands = useQuery(api.brands.list);

  if (!brands) {
    return <span style={labelStyle}>Loading brands from Convex...</span>;
  }

  const brandsWithLogos = brands.filter((b) => b.logoSvg);

  if (brandsWithLogos.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <span style={labelStyle}>No brands with logos found in database.</span>
        <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>
          Upload a logo SVG in the platform app via Brand Settings to see it here.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      {/* All brand logos at each size */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        <span style={labelStyle}>Brand logos from Convex — all sizes</span>
        {brandsWithLogos.map((brand) => (
          <div key={brand._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
            <span style={{ ...labelStyle, minWidth: 'var(--Spacing-14)' }}>{brand.name}</span>
            <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
              {(['xs', 's', 'm', 'l', 'xl'] as LogoSize[]).map((size) => (
                <Logo key={size} size={size} svgContent={brand.logoSvg} alt={brand.name} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* On bold surface */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        <span style={labelStyle}>On bold surface</span>
        <div style={{ backgroundColor: 'var(--Primary-Bold)', borderRadius: 'var(--Shape-4)' }}>
          <div data-surface="bold" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-4-5)', padding: 'var(--Spacing-4-5)', alignItems: 'center' }}>
            {brandsWithLogos.map((brand) => (
              <div key={brand._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
                <Logo size="xl" svgContent={brand.logoSvg} alt={brand.name} />
                <span style={{ ...labelStyle, color: 'var(--Primary-Bold-High)', fontSize: 'var(--Typography-Size-2XS)' }}>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// All brand logos from Convex, at every size
export const AllBrands: Story = {
  name: 'All Brands',
  render: () => <BrandLogosGrid />,
};

/** Helper: renders a single brand logo at a specific size with Convex data */
function SingleBrandLogo({ brandName, size = 'xl' }: { brandName?: string; size?: LogoSize }) {
  const brands = useQuery(api.brands.list);

  if (!brands) {
    return <span style={labelStyle}>Loading...</span>;
  }

  const brandsWithLogos = brands.filter((b) => b.logoSvg);
  const brand = brandName
    ? brandsWithLogos.find((b) => b.name.toLowerCase() === brandName.toLowerCase())
    : brandsWithLogos[0];

  if (!brand) {
    return <span style={labelStyle}>Brand not found or has no logo</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
      <Logo size={size} svgContent={brand.logoSvg} alt={brand.name} />
      <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>{brand.name}</span>
    </div>
  );
}

// Single brand logo — uses the first brand with a logo
export const SingleBrand: Story = {
  name: 'Single Brand',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'flex-end' }}>
      {(['xs', 's', 'm', 'l', 'xl'] as LogoSize[]).map((size) => (
        <SingleBrandLogo key={size} size={size} />
      ))}
    </div>
  ),
};
