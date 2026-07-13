/**
 * LinkButtonPreview.tsx
 *
 * Single-source-of-truth preview component for LinkButton.
 * Renders an attention x size grid (showAllVariations) or a single-size column.
 * Used by both the docs page and the advanced token editor.
 * Includes surface context previews (default + fg-bold backgrounds).
 */

'use client';

import React from 'react';
import { LinkButton } from './LinkButton';
import { Surface } from '../Surface';
import type { LinkButtonVariant, LinkButtonAttention, LinkButtonSize, LinkButtonAppearance } from './LinkButton.shared';

/** Attention labels — Figma API terminology */
const ATTENTION_LABELS: Record<LinkButtonVariant, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

/**
 * The token editor keys overrides by the internal visual variant, but
 * LinkButton's public prop is `attention` — map variant → attention at the
 * render boundary.
 */
const VARIANT_TO_ATTENTION: Record<LinkButtonVariant, LinkButtonAttention> = {
  bold: 'high',
  subtle: 'medium',
  ghost: 'low',
};

/** LinkButton variants */
const LINKBUTTON_VARIANTS: readonly LinkButtonVariant[] = ['bold', 'subtle', 'ghost'];

/** LinkButton sizes */
const LINKBUTTON_SIZES: readonly { size: LinkButtonSize; label: string }[] = [
  { size: 8, label: 'S' },
  { size: 10, label: 'M' },
  { size: 12, label: 'L' },
];

export interface LinkButtonPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Appearance role to preview */
  appearance?: LinkButtonAppearance;
  /** Whether to show in disabled state */
  disabled?: boolean;
  /** Whether to show start slot */
  showStartIcon?: boolean;
  /** Whether to show end slot */
  showEndIcon?: boolean;
  /** When true, shows the full attention x size grid */
  showAllVariations?: boolean;
}

/** Placeholder icon for slot preview — no inline size styles */
const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 3v2H5v14h14v-9h2v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h10zm7 0v6h-2V6.413l-7.293 7.294-1.414-1.414L17.585 5H15V3h6z" fill="currentColor" />
  </svg>
);

export function LinkButtonPreview({
  tokens,
  appearance,
  disabled = false,
  showStartIcon = false,
  showEndIcon = false,
  showAllVariations = false,
}: LinkButtonPreviewProps) {
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
                {LINKBUTTON_SIZES.map(({ size, label }) => (
                  <th
                    key={String(size)}
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      textAlign: 'center',
                      padding: 'var(--Spacing-3-5)',
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LINKBUTTON_VARIANTS.map((variant) => (
                <tr key={variant}>
                  <td
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      paddingRight: 'var(--Spacing-4-5)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {ATTENTION_LABELS[variant]}
                  </td>
                  {LINKBUTTON_SIZES.map(({ size }) => (
                    <td
                      key={`${variant}-${size}`}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                      }}
                    >
                      <LinkButton
                        attention={VARIANT_TO_ATTENTION[variant]}
                        size={size}
                        appearance={appearance}
                        start={showStartIcon ? <SlotIcon /> : undefined}
                        end={showEndIcon ? <SlotIcon /> : undefined}
                        disabled={disabled}
                      >
                        LinkButton
                      </LinkButton>
                    </td>
                  ))}
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
            color: 'var(--Text-Low)',
            display: 'block',
            marginBottom: 'var(--Spacing-3-5)',
          }}>
            Bold Surface
          </span>
          <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
            <thead>
              <tr>
                <th />
                {LINKBUTTON_SIZES.map(({ size, label }) => (
                  <th
                    key={String(size)}
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      textAlign: 'center',
                      padding: 'var(--Spacing-3-5)',
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LINKBUTTON_VARIANTS.map((variant) => (
                <tr key={variant}>
                  <td
                    style={{
                      fontSize: 'var(--Typography-Size-XS)',
                      fontWeight: 'var(--Typography-Weight-Medium)',
                      color: 'var(--Text-Low)',
                      paddingRight: 'var(--Spacing-4-5)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {ATTENTION_LABELS[variant]}
                  </td>
                  {LINKBUTTON_SIZES.map(({ size }) => (
                    <td
                      key={`${variant}-${size}`}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                      }}
                    >
                      <LinkButton
                        attention={VARIANT_TO_ATTENTION[variant]}
                        size={size}
                        appearance={appearance}
                        start={showStartIcon ? <SlotIcon /> : undefined}
                        end={showEndIcon ? <SlotIcon /> : undefined}
                        disabled={disabled}
                      >
                        LinkButton
                      </LinkButton>
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

  // Single mode: show all variants at medium size on both surfaces
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
        {LINKBUTTON_VARIANTS.map((variant) => (
          <div
            key={variant}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
              padding: 'var(--Spacing-3-5)',
            }}
          >
            <LinkButton
              attention={VARIANT_TO_ATTENTION[variant]}
              appearance={appearance}
              start={showStartIcon ? <SlotIcon /> : undefined}
              end={showEndIcon ? <SlotIcon /> : undefined}
              disabled={disabled}
            >
              LinkButton
            </LinkButton>
            <span
              style={{
                fontSize: 'var(--Typography-Size-2XS)',
                color: 'var(--Text-Low)',
              }}
            >
              {ATTENTION_LABELS[variant]}
            </span>
          </div>
        ))}
      </Surface>

      {/* Bold surface */}
      <Surface mode="bold" style={{ display: 'flex', gap: 'var(--Spacing-4-5)', padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', alignItems: 'center' }}>
        {LINKBUTTON_VARIANTS.map((variant) => (
          <div
            key={`bold-${variant}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
              padding: 'var(--Spacing-3-5)',
            }}
          >
            <LinkButton
              attention={VARIANT_TO_ATTENTION[variant]}
              appearance={appearance}
              start={showStartIcon ? <SlotIcon /> : undefined}
              end={showEndIcon ? <SlotIcon /> : undefined}
              disabled={disabled}
            >
              LinkButton
            </LinkButton>
            <span
              style={{
                fontSize: 'var(--Typography-Size-2XS)',
                color: 'var(--Text-Low)',
              }}
            >
              {ATTENTION_LABELS[variant]}
            </span>
          </div>
        ))}
      </Surface>
    </div>
  );
}

export default LinkButtonPreview;
