/**
 * Logo.showcase.tsx
 *
 * Shared variant display components for Logo.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 *
 * Note: Logo requires SVG content to render. The showcase functions accept an
 * optional `svgContent` prop. Pass the brand's SVG from Convex in PageContent;
 * inside a BrandProvider, Logo also picks it up from BrandLogoContext.
 */

import React from 'react';
import { Logo } from './Logo';
import type { LogoSize, LogoVariant } from './Logo.shared';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  color: 'var(--Text-Low)',
};

const labeledItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
};

const SIZES: LogoSize[] = ['xs', 's', 'm', 'l', 'xl'];

const SIZE_LABELS: Record<string, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
};

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * All 5 size presets from XS to XL, plus a custom pixel size.
 */
export function LogoSizes({ svgContent }: { svgContent?: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
      {SIZES.map((size) => (
        <div key={size} style={labeledItem}>
          <Logo size={size} svgContent={svgContent} alt="Brand Logo" />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)', textTransform: 'uppercase' }}>{SIZE_LABELS[size]}</span>
        </div>
      ))}
      <div style={labeledItem}>
        <Logo size="custom" customSize={48} svgContent={svgContent} alt="Brand Logo" />
        <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>custom (48px)</span>
      </div>
    </div>
  );
}

/**
 * Mark (circular container) and Full (rectangular wordmark) variants.
 */
export function LogoVariants({ svgContent }: { svgContent?: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      {(['mark', 'full'] as LogoVariant[]).map((variant) => (
        <div key={variant} style={labeledItem}>
          <Logo variant={variant} size="xl" svgContent={svgContent} alt={`${variant} variant`} />
          <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)', textTransform: 'capitalize' }}>{variant}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Content source modes: children (JSX), svgContent, and src (image URL).
 */
export function LogoContentSources({ svgContent }: { svgContent?: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      <div style={labeledItem}>
        <Logo alt="Children" size="xl">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </Logo>
        <span style={labelStyle}>children (JSX)</span>
      </div>
      <div style={labeledItem}>
        <Logo alt="SVG Content" size="xl" svgContent={svgContent} />
        <span style={labelStyle}>svgContent</span>
      </div>
      <div style={labeledItem}>
        <Logo
          alt="External Image"
          size="xl"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='white'/%3E%3C/svg%3E"
        />
        <span style={labelStyle}>src (image)</span>
      </div>
    </div>
  );
}

/**
 * Broken image src with custom fallback slot, and empty logo with fallback.
 */
export function LogoImageFallback() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      <div style={labeledItem}>
        <Logo
          alt="With Fallback"
          size="xl"
          src="https://invalid.example/broken.png"
          fallback={
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '50%', height: '50%' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          }
        />
        <span style={labelStyle}>broken src + fallback</span>
      </div>
      <div style={labeledItem}>
        <Logo alt="No content" size="xl" fallback={<span style={{ color: 'currentColor', fontSize: 'var(--Typography-Size-XS)' }}>?</span>} />
        <span style={labelStyle}>empty + fallback</span>
      </div>
    </div>
  );
}
