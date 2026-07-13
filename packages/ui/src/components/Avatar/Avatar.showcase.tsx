/**
 * Avatar.showcase.tsx
 *
 * Shared variant display components for Avatar.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Avatar } from './Avatar';

// ─── Shared layout helpers ────────────────────────────────────────────────────

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

const labeledItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
};

/** IcProfile icon — matches Figma's Avatar icon variant (filled person silhouette) */
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"
      clipRule="evenodd"
    />
  </svg>
);

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * Three display content modes: image, icon, and text (initials).
 */
export function AvatarVariants() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
      {([
        { content: 'image' as const, label: 'Image' },
        { content: 'icon' as const, label: 'Icon' },
        { content: 'text' as const, label: 'Text' },
      ]).map(({ content, label }) => (
        <div key={content} style={labeledItem}>
          <Avatar
            content={content}
            alt="John Smith"
            size="xl"
            src={content === 'image' ? SAMPLE_IMAGE : undefined}
            icon={content === 'icon' ? <PersonIcon /> : undefined}
          />
          <span style={labelStyle}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * High / Medium / Low attention levels across all three content modes.
 */
export function AvatarAttentionLevels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {(['image', 'icon', 'text'] as const).map((contentMode) => (
        <div
          key={contentMode}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}
        >
          <span style={{ ...rowLabelStyle, textTransform: 'capitalize' }}>{contentMode}</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            {(['high', 'medium', 'low'] as const).map((attention) => (
              <Avatar
                key={attention}
                content={contentMode}
                alt="John Smith"
                size="xl"
                attention={attention}
                src={contentMode === 'image' ? SAMPLE_IMAGE : undefined}
                icon={contentMode === 'icon' ? <PersonIcon /> : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * All 8 size presets (2XS–2XL) plus custom pixel size, across all three content modes.
 */
export function AvatarSizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {(['image', 'icon', 'text'] as const).map((contentMode) => (
        <div
          key={contentMode}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}
        >
          <span style={{ ...rowLabelStyle, textTransform: 'capitalize' }}>{contentMode}</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
            {(['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const).map((size) => (
              <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-2)' }}>
                <Avatar
                  content={contentMode}
                  alt="John Smith"
                  size={size}
                  src={contentMode === 'image' ? SAMPLE_IMAGE : undefined}
                  icon={contentMode === 'icon' ? <PersonIcon /> : undefined}
                />
                <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>{size.toUpperCase()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-2)' }}>
              <Avatar
                content={contentMode}
                alt="John Smith"
                size="custom"
                customSize={48}
                src={contentMode === 'image' ? SAMPLE_IMAGE : undefined}
                icon={contentMode === 'icon' ? <PersonIcon /> : undefined}
              />
              <span style={{ ...labelStyle, fontSize: 'var(--Typography-Size-2XS)' }}>Custom</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Default and disabled states for all three variants.
 */
export function AvatarStates() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end' }}>
      <div style={labeledItem}>
        <Avatar content="icon" alt="User" size="2xl" icon={<PersonIcon />} />
        <span style={labelStyle}>Default</span>
      </div>
      <div style={labeledItem}>
        <Avatar content="icon" alt="User" size="2xl" disabled icon={<PersonIcon />} />
        <span style={labelStyle}>Disabled</span>
      </div>
      <div style={labeledItem}>
        <Avatar content="text" alt="JS" size="2xl" />
        <span style={labelStyle}>Default</span>
      </div>
      <div style={labeledItem}>
        <Avatar content="text" alt="JS" size="2xl" disabled />
        <span style={labelStyle}>Disabled</span>
      </div>
      <div style={labeledItem}>
        <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="2xl" />
        <span style={labelStyle}>Default</span>
      </div>
      <div style={labeledItem}>
        <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="2xl" disabled />
        <span style={labelStyle}>Disabled</span>
      </div>
    </div>
  );
}

/**
 * Valid image, broken URL fallback (→ default icon), and custom fallback slot.
 */
export function AvatarImageFallback() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end' }}>
      <div style={labeledItem}>
        <Avatar content="image" src={SAMPLE_IMAGE} alt="John Doe" size="xl" />
        <span style={labelStyle}>Valid Image</span>
      </div>
      <div style={labeledItem}>
        <Avatar content="image" src="https://invalid.example/broken.jpg" alt="Jane Smith" size="xl" />
        <span style={labelStyle}>Broken → Icon</span>
      </div>
      <div style={labeledItem}>
        <Avatar
          content="image"
          src="https://invalid.example/broken.jpg"
          alt="User"
          size="xl"
          fallback={<PersonIcon />}
        />
        <span style={labelStyle}>Custom Fallback</span>
      </div>
    </div>
  );
}
