/**
 * AvatarPreview.tsx
 *
 * Single-source-of-truth preview component for the Avatar.
 * Renders an attention x size grid (showAllVariations) or a single-attention column.
 * Used by both the docs page and the advanced token editor.
 * Includes surface context previews (default + fg-bold backgrounds).
 */

'use client';

import React from 'react';
import { Avatar } from './Avatar';
import { Surface } from '../Surface';
import type { AvatarAttention, AvatarAppearance, AvatarContent } from './Avatar.shared';

/** Attention labels — Figma API terminology */
const ATTENTION_LABELS: Record<AvatarAttention, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Avatar attention levels */
const AVATAR_ATTENTIONS: readonly AvatarAttention[] = ['high', 'medium', 'low'];

/** Avatar sizes — t-shirt scale (all 8 sizes from token manifest including custom) */
const AVATAR_SIZES: readonly { size: string; label: string }[] = [
  { size: '2xs', label: '2XS' },
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
  { size: '2xl', label: '2XL' },
  { size: 'custom', label: 'Custom' },
];

/** IcProfile icon for icon variant preview — matches Figma's Avatar icon */
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

export interface AvatarPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Currently selected attention level */
  selectedVariant?: string;
  /** Callback when an attention level is clicked */
  onVariantSelect?: (variant: string) => void;
  /** Currently selected size */
  selectedSize?: string;
  /** Callback when a size is clicked */
  onSizeSelect?: (size: string) => void;
  /** When true, shows the full attention x size grid */
  showAllVariations?: boolean;
  /** Appearance role to preview */
  appearance?: AvatarAppearance;
  /** Whether to show avatars in disabled state */
  disabled?: boolean;
  /** Callback when a grid cell is clicked (attention + size selection) */
  onCellSelect?: (variant: string, size: string) => void;
  /** Avatar content mode to preview (Figma: Image / icon / text) */
  avatarContent?: AvatarContent;
}

export function AvatarPreview({
  tokens,
  selectedVariant,
  onVariantSelect,
  selectedSize = 'm',
  showAllVariations = false,
  appearance,
  disabled = false,
  onCellSelect,
  avatarContent = 'text',
}: AvatarPreviewProps) {
  // Show All Variations: display grid of all attention x size combinations
  // with surface context previews (default + fg-bold)
  if (showAllVariations) {
    return (
      <div style={{ ...tokens, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }} data-draggable="false">
        {/* Default surface grid */}
        <Surface mode="default" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
          <span style={{
            fontSize: 'var(--Typography-Size-2XS)',
            fontWeight: 'var(--Typography-Weight-Medium)',
            color: 'var(--Text-Low)',
            display: 'block',
            marginBottom: 'var(--Spacing-3-5)',
          }}>
            Default Surface
          </span>
          <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
            <thead>
              <tr>
                <th />
                {AVATAR_SIZES.map(({ size, label }) => (
                  <th
                    key={size}
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      padding: 'var(--Spacing-3-5)',
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AVATAR_ATTENTIONS.map((attention) => (
                <tr key={attention}>
                  <td
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      paddingRight: 'var(--Spacing-4-5)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {ATTENTION_LABELS[attention]}
                  </td>
                  {AVATAR_SIZES.map(({ size }) => {
                    const variantMatch = selectedVariant === undefined || selectedVariant === attention;
                    const sizeMatch = selectedSize === undefined || selectedSize === size;
                    const isSelected = variantMatch && sizeMatch;
                    const isExactCell = selectedVariant === attention && selectedSize === size;
                    return (
                      <td
                        key={`${attention}-${size}`}
                        data-selected={isSelected || undefined}
                        onClick={onCellSelect ? () => onCellSelect(attention, size) : undefined}
                        style={{
                          padding: 'var(--Spacing-3-5)',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                          cursor: onCellSelect ? 'pointer' : undefined,
                          outline: isSelected
                            ? `${isExactCell ? '2px' : '1px'} solid var(--Primary-Tinted, var(--Surface-Bold))`
                            : undefined,
                          outlineOffset: isSelected ? '2px' : undefined,
                          borderRadius: isSelected ? 'var(--Shape-3-5)' : undefined,
                        }}
                      >
                        <Avatar
                          content={avatarContent}
                          attention={attention}
                          size={size as any}
                          appearance={appearance}
                          alt="JS"
                          disabled={disabled}
                          icon={avatarContent === 'icon' ? <PersonIcon /> : undefined}
                          customSize={size === 'custom' ? 60 : undefined}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>

        {/* Bold surface grid */}
        <Surface mode="bold" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
          <span style={{
            fontSize: 'var(--Typography-Size-2XS)',
            fontWeight: 'var(--Typography-Weight-Medium)',
            color: 'inherit',
            display: 'block',
            marginBottom: 'var(--Spacing-3-5)',
          }}>
            Bold Surface
          </span>
          <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
            <thead>
              <tr>
                <th />
                {AVATAR_SIZES.map(({ size, label }) => (
                  <th
                    key={size}
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'inherit',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      padding: 'var(--Spacing-3-5)',
                      opacity: 0.7,
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AVATAR_ATTENTIONS.map((attention) => (
                <tr key={attention}>
                  <td
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'inherit',
                      paddingRight: 'var(--Spacing-4-5)',
                      verticalAlign: 'middle',
                      opacity: 0.7,
                    }}
                  >
                    {ATTENTION_LABELS[attention]}
                  </td>
                  {AVATAR_SIZES.map(({ size }) => (
                    <td
                      key={`${attention}-${size}`}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                      }}
                    >
                      <Avatar
                        content={avatarContent}
                        attention={attention}
                        size={size as any}
                        appearance={appearance}
                        alt="JS"
                        disabled={disabled}
                        icon={avatarContent === 'icon' ? <PersonIcon /> : undefined}
                        customSize={size === 'custom' ? 60 : undefined}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      </div>
    );
  }

  // Single mode: show all attention levels with selected size on both surfaces
  return (
    <div
      style={{
        ...tokens,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        alignItems: 'center',
      }}
    >
      {/* Default surface */}
      <Surface mode="default" style={{ display: 'flex', gap: 'var(--Spacing-4-5)', padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', alignItems: 'center' }}>
        {AVATAR_ATTENTIONS.map((attention) => (
          <div
            key={attention}
            onClick={onVariantSelect ? () => onVariantSelect(attention) : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
              padding: 'var(--Spacing-3-5)',
              borderRadius: 'var(--Shape-4)',
              cursor: onVariantSelect ? 'pointer' : 'default',
              border:
                selectedVariant === attention
                  ? 'var(--Stroke-M) solid var(--Border-Subtle)'
                  : 'var(--Stroke-M) solid transparent',
              transition: 'all var(--Motion-Duration-Discreet-Medium) var(--Motion-Easing-Standard)',
            }}
          >
            <Avatar
              content={avatarContent}
              attention={attention}
              size={selectedSize as any}
              appearance={appearance}
              alt="JS"
              disabled={disabled}
              icon={avatarContent === 'icon' ? <PersonIcon /> : undefined}
              customSize={selectedSize === 'custom' ? 60 : undefined}
            />
            <span
              style={{
                fontSize: 'var(--Typography-Size-2XS)',
                color: selectedVariant === attention ? 'var(--Text-High)' : 'var(--Text-Low)',
              }}
            >
              {ATTENTION_LABELS[attention]}
            </span>
          </div>
        ))}
      </Surface>

      {/* Bold surface */}
      <Surface mode="bold" style={{ display: 'flex', gap: 'var(--Spacing-4-5)', padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', alignItems: 'center' }}>
        {AVATAR_ATTENTIONS.map((attention) => (
          <div
            key={`bold-${attention}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
              padding: 'var(--Spacing-3-5)',
            }}
          >
            <Avatar
              content={avatarContent}
              attention={attention}
              size={selectedSize as any}
              appearance={appearance}
              alt="JS"
              disabled={disabled}
              icon={avatarContent === 'icon' ? <PersonIcon /> : undefined}
              customSize={selectedSize === 'custom' ? 60 : undefined}
            />
            <span
              style={{
                fontSize: 'var(--Typography-Size-2XS)',
                color: 'inherit',
                opacity: 0.7,
              }}
            >
              {ATTENTION_LABELS[attention]}
            </span>
          </div>
        ))}
      </Surface>
    </div>
  );
}

export default AvatarPreview;
